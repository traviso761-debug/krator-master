// ---------- start: three.js check, the config and the OpenStreetMap geography, projection, randomness, lookups ----------
if(!window.THREE){document.getElementById('loading').textContent='three.js did not load (vendor/three/three.min.js). Check the site mounts and reload.';return;}
const THREE=window.THREE;
const CITY_ID=(()=>{const v=new URLSearchParams(location.search).get('city')||'';return /^[a-z0-9-]{1,40}$/.test(v)?v:ctx.defaultCity;})();   // each page sets its own city
if(!CITY_ID)throw new Error('no city: the page sets ctx.defaultCity, or the address gives ?city=');
ctx.cityId=CITY_ID;
// A city names its own special streets in its file, as patterns: `boulevard` (the grand avenue with planters and
// tall lamps, busier sidewalks, no parking), `expressway` (denser traffic), `trails` (cyclists and runners, and
// a paler surface), `riverTours` (tour boats). A city that names none has none of them.
const nameRe=s=>s?new RegExp(s,'i'):/(?!)/;
const getJSON=u=>fetch(u).then(r=>{if(!r.ok)throw new Error(u+': HTTP '+r.status);return r.json();});
const C=await getJSON('data/cities/'+CITY_ID+'.json');
await stage('map-data');
const OSM=await getJSON(C.osm);
const SEED_DEFAULT=C.defaultSeed||1871;
const SEED0=(()=>{try{const v=parseInt(new URLSearchParams(location.search).get('seed')||new URLSearchParams(location.hash.slice(1)).get('seed'),10);return v>0&&v<2147483647?v:SEED_DEFAULT;}catch(e){return SEED_DEFAULT;}})();
const LCG=createLcg(SEED0);const rnd=LCG.rnd,rr=LCG.rr,pick=LCG.pick;
const {vn,fbm}=makeNoise(rnd);
const xr=mkRng(20261017),xrr=(a,b)=>a+(b-a)*xr();
const animHooks=[];
// The address as the page was opened. The view hook rewrites location.hash every second and a half, so a
// stage that reads it after the build has finished sees whatever the camera has written there since.
const HASH0=location.hash.slice(1);
// projection: metres east (x) and south (z) of the origin (the same one tools/build-chicago-osm.py used)
const [LAT0,LON0]=C.origin,M_LAT=111132,M_LON=111320*Math.cos(LAT0*Math.PI/180);
const lonX=lon=>(lon-LON0)*M_LON,latZ=lat=>-(lat-LAT0)*M_LAT;
const P=([lat,lon])=>[lonX(lon),latZ(lat)];
const toLatLon=(x,z)=>[LAT0-z/M_LAT,LON0+x/M_LON];
ctx.project=P;ctx.toLatLon=toLatLon;
const B=(()=>{const [s,w,n,e]=C.bounds;return {x0:lonX(w),x1:lonX(e),z0:latZ(n),z1:latZ(s)};})();B.w=B.x1-B.x0;B.d=B.z1-B.z0;B.cx=(B.x0+B.x1)/2;B.cz=(B.z0+B.z1)/2;
// How much bigger than a city this map is. Everything below that is written in metres - the water lookup's
// cell, the ground grid, the tile sizes, the draw distances, the camera's far plane - is multiplied by it, so
// a map the size of a country works on the same code as one the size of a downtown. It is 1 for every city.
const WORLD=Math.max(1,Math.max(B.w,B.d)/20000);
ctx.world=Math.round(WORLD*100)/100;
const inMap=(x,z,m)=>x>B.x0+(m||0)&&x<B.x1-(m||0)&&z>B.z0+(m||0)&&z<B.z1-(m||0);
// geometry helpers
function segDist(px,pz,ax,az,bx,bz){const dx=bx-ax,dz=bz-az,L=dx*dx+dz*dz;let t=L?((px-ax)*dx+(pz-az)*dz)/L:0;t=Math.max(0,Math.min(1,t));return Math.hypot(px-ax-t*dx,pz-az-t*dz);}
function pathDist(x,z,pts){let d=Infinity;for(let i=0;i+1<pts.length;i++)d=Math.min(d,segDist(x,z,pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1]));return d;}
// Indexed rather than destructured. Every `const [xi,zi]=poly[i]` is an iterator protocol call and two
// property reads; this runs per edge, per point, per ground cell, and is one of the hottest functions on
// the site. Same arithmetic in the same order, so the city that comes out is bit-for-bit the one that
// came out before - which is what the golden fingerprints are there to prove.
function inPoly(x,z,poly){let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j],zi=a[1],zj=b[1];
  if((zi>z)!==(zj>z)&&x<(b[0]-a[0])*(z-zi)/(zj-zi)+a[0])c=!c;}return c;}
function segHit(a,b,c,d){const r=[b[0]-a[0],b[1]-a[1]],s=[d[0]-c[0],d[1]-c[1]],den=r[0]*s[1]-r[1]*s[0];if(Math.abs(den)<1e-9)return null;
  const t=((c[0]-a[0])*s[1]-(c[1]-a[1])*s[0])/den,u=((c[0]-a[0])*r[1]-(c[1]-a[1])*r[0])/den;if(t<0||t>1||u<0||u>1)return null;return {x:a[0]+t*r[0],z:a[1]+t*r[1],r,s};}
const polyArea=r=>{let a=0;for(let i=0,j=r.length-1;i<r.length;j=i++)a+=r[j][0]*r[i][1]-r[i][0]*r[j][1];return a/2;};
// decode the OSM file: flat decimetre integers -> [[x,z],...] in metres, with a bounding box for quick rejection
// preallocated: the array's final length is known, so it does not have to be grown a dozen times
const dec=f=>{const n=f.length>>1,o=new Array(n);for(let i=0;i<n;i++)o[i]=[f[i*2]/10,f[i*2+1]/10];return o;};
const bbox=r=>{let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(let i=0;i<r.length;i++){const x=r[i][0],z=r[i][1];if(x<x0)x0=x;if(x>x1)x1=x;if(z<z0)z0=z;if(z>z1)z1=z;}return {x0,x1,z0,z1};};
// `y`, where a polygon carries one, is the level to draw it at: a mountain river is not one sheet, it is a
// flight of pools with a step between them, and each reach is its own polygon at its own height.
const polyRec=p=>{const o=dec(p.o);return {name:p.n||'',kind:p.k,o,i:(p.i||[]).map(dec),bb:bbox(o),
  y:(typeof p.y==='number')?p.y:undefined};};
const inRec=(rec,x,z)=>x>=rec.bb.x0&&x<=rec.bb.x1&&z>=rec.bb.z0&&z<=rec.bb.z1&&inPoly(x,z,rec.o)&&!rec.i.some(h=>inPoly(x,z,h));
const LAKE=dec(OSM.lake),ISLANDS=OSM.islands.map(dec);
const WATER=OSM.water.map(polyRec),MARINAS=OSM.marina.map(polyRec),BEACHES=OSM.beach.map(polyRec);
const PIERS=OSM.pier.map(p=>p.line?{line:dec(p.line),w:p.w,name:p.n||''}:polyRec(p));
const AREAS=OSM.areas.map(polyRec);
const ROADS=OSM.roads.map(r=>{const pts=dec(r.p);let len=0;for(let i=0;i+1<pts.length;i++)len+=Math.hypot(pts[i+1][0]-pts[i][0],pts[i+1][1]-pts[i][1]);return {c:r.c,w:r.w,name:r.n||'',bridge:r.b||0,layer:r.l||0,pts,len};});
const RAILS=OSM.rail.map(r=>({type:r.t,elevated:!!r.e,name:r.n||'',pts:dec(r.p)}));
const STATIONS=OSM.stations.map(s=>({name:s.n,x:s.x/10,z:s.z/10}));
const WATERWAYS=(OSM.waterways||[]).map(w=>({name:w.n||'',pts:dec(w.p)}));
const POIS=OSM.pois.map(p=>({name:p.n,x:p.x/10,z:p.z/10,kind:p.k,ang:p.ang||0,w:p.w||0,d:p.d||0,h:p.h||0,sw:p.sw||0,sd:p.sd||0}));
// the ground: a height grid from the elevation tiles, in metres above the water level (y = 0 is the river or lake)
const TER=(()=>{const t=OSM.terrain;if(!t)return null;const h=new Float32Array(t.h.length);for(let i=0;i<t.h.length;i++)h[i]=t.h[i]/10;
  return {step:t.step,nx:t.nx,nz:t.nz,x0:t.x0/10,z0:t.z0/10,datum:t.datum,h};})();
// A city may cut the ground where a street runs in a cutting the elevation tiles are too coarse to see (C.terrainCuts:
// [{line: [[lat, lon, street height], ...], width: m, slope: rise per metre of the sides}]): every grid point near the
// line comes down to the street's own profile, the sides rising at the slope; nothing is ever raised. TER.h0 keeps the
// ground as it was, for whatever is built against the cut (groundH0).
if(TER&&C.terrainCuts){TER.h0=TER.h.slice();TER.cutBoxes=[];
  for(const cut of C.terrainCuts){const L=cut.line.map(([la,lo,h])=>[...P([la,lo]),h]),hw=(cut.width||12)/2,sl=cut.slope||1.5,reach=hw+30/sl;
    let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const [x,z] of L){x0=Math.min(x0,x-reach);x1=Math.max(x1,x+reach);z0=Math.min(z0,z-reach);z1=Math.max(z1,z+reach);}
    TER.cutBoxes.push({x0,x1,z0,z1});
    const i0=Math.max(0,Math.floor((x0-TER.x0)/TER.step)),i1=Math.min(TER.nx-1,Math.ceil((x1-TER.x0)/TER.step)),j0=Math.max(0,Math.floor((z0-TER.z0)/TER.step)),j1=Math.min(TER.nz-1,Math.ceil((z1-TER.z0)/TER.step));
    for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const x=TER.x0+i*TER.step,z=TER.z0+j*TER.step;let best=1e9,bh=0;
      for(let k=0;k+1<L.length;k++){const [ax,az,ah]=L[k],[bx,bz,bh2]=L[k+1],dx=bx-ax,dz=bz-az,l2=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/l2)),d=Math.hypot(x-ax-dx*t,z-az-dz*t);if(d<best){best=d;bh=ah+(bh2-ah)*t;}}
      const nh=bh+Math.max(0,best-hw)*sl,k=j*TER.nx+i;if(nh<TER.h[k])TER.h[k]=nh;}}}
// And the other way: a rock the elevation tiles are too coarse to see (Edinburgh's Castle Rock comes out forty metres
// short) is raised (C.terrainRaise: [{poly: [[lat, lon], ...], top: height, slope}] - the inside up to the top, the
// ground round it falling away at the slope, a cliff if it is steep - or {line: [[lat, lon, height], ...], width,
// slope}, a ramp along a profile). Nothing is ever lowered by these; groundH0 keeps the ground as it was.
if(TER&&C.terrainRaise){if(!TER.h0)TER.h0=TER.h.slice();
  const inPoly=(x,z,r)=>{let c=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const [xi,zi]=r[i],[xj,zj]=r[j];if((zi>z)!==(zj>z)&&x<(xj-xi)*(z-zi)/(zj-zi)+xi)c=!c;}return c;};
  const segD=(x,z,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/l2));return [Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t),t];};
  for(const R of C.terrainRaise){const sl=R.slope||2,pts=(R.poly||R.line).map(p=>[...P([p[0],p[1]]),p[2]]),hw=(R.width||0)/2,reach=hw+(R.reach||60);
    let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const [x,z] of pts){x0=Math.min(x0,x-reach);x1=Math.max(x1,x+reach);z0=Math.min(z0,z-reach);z1=Math.max(z1,z+reach);}
    const i0=Math.max(0,Math.floor((x0-TER.x0)/TER.step)),i1=Math.min(TER.nx-1,Math.ceil((x1-TER.x0)/TER.step)),j0=Math.max(0,Math.floor((z0-TER.z0)/TER.step)),j1=Math.min(TER.nz-1,Math.ceil((z1-TER.z0)/TER.step));
    for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const x=TER.x0+i*TER.step,z=TER.z0+j*TER.step,k=j*TER.nx+i;let nh;
      if(R.poly){let d=1e9;for(let q=0;q<pts.length;q++)d=Math.min(d,segD(x,z,pts[q],pts[(q+1)%pts.length])[0]);nh=inPoly(x,z,pts)?R.top:R.top-d*sl;}
      else{let best=1e9,bh=0;for(let q=0;q+1<pts.length;q++){const [d,t]=segD(x,z,pts[q],pts[q+1]);if(d<best){best=d;bh=pts[q][2]+(pts[q+1][2]-pts[q][2])*t;}}nh=bh-Math.max(0,best-hw)*sl;}
      if(nh>TER.h[k])TER.h[k]=nh;}}}
function groundH(x,z){if(!TER)return 0;const fx=(x-TER.x0)/TER.step,fz=(z-TER.z0)/TER.step;
  let i=Math.floor(fx),j=Math.floor(fz);i=Math.max(0,Math.min(TER.nx-2,i));j=Math.max(0,Math.min(TER.nz-2,j));
  const tx=Math.max(0,Math.min(1,fx-i)),tz=Math.max(0,Math.min(1,fz-j)),h=TER.h,n=TER.nx;
  return (h[j*n+i]*(1-tx)+h[j*n+i+1]*tx)*(1-tz)+(h[(j+1)*n+i]*(1-tx)+h[(j+1)*n+i+1]*tx)*tz;}
const groundH0=(x,z)=>{if(!TER||!TER.h0)return groundH(x,z);const h=TER.h;TER.h=TER.h0;try{return groundH(x,z);}finally{TER.h=h;}};   // the ground before any cut
const groundMin=ring=>{let m=1e9;for(const [x,z] of ring)m=Math.min(m,groundH(x,z));return m===1e9?0:m;};
ctx.groundH=groundH;
// C.treeLine (metres above the datum) and C.bareGround ([[lat, lon, radius m], ...]): ground where nothing grows, a
// volcano's cone above its forest. Woodland is not drawn there and no trees are planted on it (Antigua's volcanoes,
// whose nature reserves are mapped from the foot of the cone to the crater). A city that sets neither is unchanged.
const BARE=(C.bareGround||[]).map(([la,lo,r])=>{const [x,z]=P([la,lo]);return [x,z,r];}),TREE_LINE=C.treeLine==null?Infinity:C.treeLine;
const bareAt=(x,z)=>(TREE_LINE<Infinity&&groundH(x,z)>TREE_LINE+40*Math.sin(x*0.004)*Math.cos(z*0.0035))||BARE.some(([bx,bz,r])=>(x-bx)**2+(z-bz)**2<r*r);
// water lookups on a 20 m grid, worked out once for the whole map: 0 land, 1 lake, 2 inland water
const WG=20*Math.ceil(WORLD),WNX=Math.ceil(B.w/WG),WNZ=Math.ceil(B.d/WG),WGRID=new Uint8Array(WNX*WNZ);
{for(let j=0;j<WNZ;j++){const z=B.z0+(j+0.5)*WG;
   // the lake: scanline crossings of the shore polygon at this z
   const xs=[];for(let i=0,k=LAKE.length-1;i<LAKE.length;k=i++){const [xi,zi]=LAKE[i],[xk,zk]=LAKE[k];if((zi>z)!==(zk>z))xs.push(xi+(z-zi)*(xk-xi)/(zk-zi));}xs.sort((a,b)=>a-b);
   for(let q=0;q+1<xs.length;q+=2){const a=Math.max(0,Math.floor((xs[q]-B.x0)/WG)),b=Math.min(WNX-1,Math.floor((xs[q+1]-B.x0)/WG));for(let i=a;i<=b;i++)WGRID[j*WNX+i]=1;}}
 const fillRec=(bb,test,val)=>{for(let j=Math.max(0,Math.floor((bb.z0-B.z0)/WG));j<=Math.min(WNZ-1,Math.floor((bb.z1-B.z0)/WG));j++)for(let i=Math.max(0,Math.floor((bb.x0-B.x0)/WG));i<=Math.min(WNX-1,Math.floor((bb.x1-B.x0)/WG));i++)if(test(B.x0+(i+0.5)*WG,B.z0+(j+0.5)*WG,WGRID[j*WNX+i]))WGRID[j*WNX+i]=val;};
 for(const r of ISLANDS)fillRec(bbox(r),(x,z)=>inPoly(x,z,r),0);
 // A sea-level city floods its whole box and lets the ground decide: a cell is only water where the land is not
 // standing above the waterline. Without this every tree, car and street light would think it was in the river.
 // A lake that carries its own level (w.y: Lake Crescent is 177 m up, over a sea-level map) is dry above that level.
 const SEA=!!C.seaLevelWater,dry=(x,z,w)=>SEA&&groundH(x,z)>(w.y===undefined?0.4:w.y+0.4);
 for(const w of WATER)fillRec(w.bb,(x,z,v)=>!v&&!dry(x,z,w)&&inRec(w,x,z),2);}
const waterCell=(x,z)=>{const i=Math.floor((x-B.x0)/WG),j=Math.floor((z-B.z0)/WG);if(i<0||j<0||i>=WNX||j>=WNZ)return x>B.x1?1:0;return WGRID[j*WNX+i];};
const inLake=(x,z)=>waterCell(x,z)===1;
const inRiver=(x,z)=>waterCell(x,z)===2;
const inWater=(x,z)=>waterCell(x,z)>0;
// roads on a 50 m grid of segment references, for "what street is this near" questions
const RG=50*Math.ceil(WORLD),RGRID=new Map();
ROADS.forEach((r,ri)=>{for(let k=0;k+1<r.pts.length;k++){const [ax,az]=r.pts[k],[bx,bz]=r.pts[k+1],pad=r.w/2+10;
  for(let gi=Math.floor((Math.min(ax,bx)-pad)/RG);gi<=Math.floor((Math.max(ax,bx)+pad)/RG);gi++)for(let gj=Math.floor((Math.min(az,bz)-pad)/RG);gj<=Math.floor((Math.max(az,bz)+pad)/RG);gj++){const key=gi*100003+gj;let a=RGRID.get(key);if(!a){a=[];RGRID.set(key,a);}a.push(ri,k);}}});
function roadsNear(x,z,r,filter){const out=[],seen=new Set(),a=RGRID.get(Math.floor(x/RG)*100003+Math.floor(z/RG))||[];
  for(let q=0;q<a.length;q+=2){const road=ROADS[a[q]],k=a[q+1];if(filter&&!filter(road))continue;const [ax,az]=road.pts[k],[bx,bz]=road.pts[k+1],d=segDist(x,z,ax,az,bx,bz);if(d<=road.w/2+r){const id=a[q]*10000+k;if(!seen.has(id)){seen.add(id);out.push({road,k,d});}}}return out;}
// districts for colours and the readout
const DIST={},DIST_BOX=[];
for(const k in C.districts){if(k==='_')continue;const [name,col,base,tall,box]=C.districts[k];DIST[k]={key:k,name,color:parseInt(col.slice(1),16),base,tall};
  if(box)DIST_BOX.push([DIST[k],lonX(box[1]),lonX(box[3]),latZ(box[2]),latZ(box[0])]);}
function districtAt(x,z){for(const [d,x0,x1,z0,z1] of DIST_BOX)if(x>=x0&&x<=x1&&z>=z0&&z<=z1)return d;return DIST.outer;}
const FOCUS=(C.focus||[]).map(f=>{const [x,z]=P(f.at);return Object.assign({},f,{x,z,r:f.radius});});
const focusAt=(x,z)=>FOCUS.find(f=>Math.hypot(f.x-x,f.z-z)<f.r)||null;
const DRAB=C.palette==='drab';   // an occupied city has no new paint: vehicles and coats in rust, grey and olive
const carHue=r=>DRAB?0.04+r()*0.1:r(),carSat=r=>DRAB?0.03+r()*0.16:(r()<0.4?0.05:0.5),carLit=r=>DRAB?0.12+r()*0.2:0.2+r()*0.55;
ctx.districtAt=districtAt;ctx.inWater=inWater;
ctx.details={roads:ROADS.length,buildings:OSM.buildings.length,areas:AREAS.length,terrain:TER?TER.nx+'x'+TER.nz+' at '+TER.step+' m':'flat'};
// ---- what a page's own code is handed ----
// This engine is shared by every city on the site, so what belongs to one city only does not live in it: Mordor's
// hosts, Night City's neon, Mega-City One's blast shields and every landmark that only one city has travel with
// that city's page instead and reach the engine through ctx.models and ctx.extras. API is what they are given.
// Each stage adds its own to it as it runs, so a page's landmark model sees what the landmarks stage sees, and a
// page's extra, which runs after them all, sees the lot.
// The camera stack: a page that steers the camera itself pushes a frame function, and the one on top runs each
// frame after the orbit controls (07-ui). pushCam returns the function that takes it off again.
const camStack=[];
ctx.pushCam=fn=>{camStack.push(fn);return ()=>{const i=camStack.lastIndexOf(fn);if(i>=0)camStack.splice(i,1);};};
const API={THREE,C,ctx,P,toLatLon,B,WORLD,OSM,MAP_LAYERS:[],POIS,AREAS,ROADS,RAILS,STATIONS,WATERWAYS,animHooks,HASH0,groundH0,
  groundH,groundMin,inMap,inWater,inLake,inRiver,inPoly,polyArea,segDist,pathDist,bbox,dec,
  roadsNear,districtAt,focusAt,FOCUS,report,section};
const UI_HOOKS=[];   // an extra that wants a button of its own queues it here; the UI stage runs these once its panels exist
API.onUI=fn=>UI_HOOKS.push(fn);
