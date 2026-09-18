// ---------- start: three.js check, the config and the OpenStreetMap geography, projection, randomness, lookups ----------
if(!window.THREE){document.getElementById('loading').textContent='three.js did not load (vendor/three/three.min.js). Check the site mounts and reload.';return;}
const THREE=window.THREE;
const CITY_ID=(()=>{const v=new URLSearchParams(location.search).get('city')||'';return /^[a-z0-9-]{1,40}$/.test(v)?v:(ctx.defaultCity||'chicago');})();   // each page sets its own city
ctx.cityId=CITY_ID;
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
// projection: metres east (x) and south (z) of the origin (the same one tools/build-chicago-osm.py used)
const [LAT0,LON0]=C.origin,M_LAT=111132,M_LON=111320*Math.cos(LAT0*Math.PI/180);
const lonX=lon=>(lon-LON0)*M_LON,latZ=lat=>-(lat-LAT0)*M_LAT;
const P=([lat,lon])=>[lonX(lon),latZ(lat)];
const toLatLon=(x,z)=>[LAT0-z/M_LAT,LON0+x/M_LON];
ctx.project=P;ctx.toLatLon=toLatLon;
const B=(()=>{const [s,w,n,e]=C.bounds;return {x0:lonX(w),x1:lonX(e),z0:latZ(n),z1:latZ(s)};})();B.w=B.x1-B.x0;B.d=B.z1-B.z0;B.cx=(B.x0+B.x1)/2;B.cz=(B.z0+B.z1)/2;
const inMap=(x,z,m)=>x>B.x0+(m||0)&&x<B.x1-(m||0)&&z>B.z0+(m||0)&&z<B.z1-(m||0);
// geometry helpers
function segDist(px,pz,ax,az,bx,bz){const dx=bx-ax,dz=bz-az,L=dx*dx+dz*dz;let t=L?((px-ax)*dx+(pz-az)*dz)/L:0;t=Math.max(0,Math.min(1,t));return Math.hypot(px-ax-t*dx,pz-az-t*dz);}
function pathDist(x,z,pts){let d=Infinity;for(let i=0;i+1<pts.length;i++)d=Math.min(d,segDist(x,z,pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1]));return d;}
function inPoly(x,z,poly){let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [xi,zi]=poly[i],[xj,zj]=poly[j];if((zi>z)!==(zj>z)&&x<(xj-xi)*(z-zi)/(zj-zi)+xi)c=!c;}return c;}
function segHit(a,b,c,d){const r=[b[0]-a[0],b[1]-a[1]],s=[d[0]-c[0],d[1]-c[1]],den=r[0]*s[1]-r[1]*s[0];if(Math.abs(den)<1e-9)return null;
  const t=((c[0]-a[0])*s[1]-(c[1]-a[1])*s[0])/den,u=((c[0]-a[0])*r[1]-(c[1]-a[1])*r[0])/den;if(t<0||t>1||u<0||u>1)return null;return {x:a[0]+t*r[0],z:a[1]+t*r[1],r,s};}
const polyArea=r=>{let a=0;for(let i=0,j=r.length-1;i<r.length;j=i++)a+=r[j][0]*r[i][1]-r[i][0]*r[j][1];return a/2;};
// decode the OSM file: flat decimetre integers -> [[x,z],...] in metres, with a bounding box for quick rejection
const dec=f=>{const o=[];for(let i=0;i+1<f.length;i+=2)o.push([f[i]/10,f[i+1]/10]);return o;};
const bbox=r=>{let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const [x,z] of r){if(x<x0)x0=x;if(x>x1)x1=x;if(z<z0)z0=z;if(z>z1)z1=z;}return {x0,x1,z0,z1};};
const polyRec=p=>{const o=dec(p.o);return {name:p.n||'',kind:p.k,o,i:(p.i||[]).map(dec),bb:bbox(o)};};
const inRec=(rec,x,z)=>x>=rec.bb.x0&&x<=rec.bb.x1&&z>=rec.bb.z0&&z<=rec.bb.z1&&inPoly(x,z,rec.o)&&!rec.i.some(h=>inPoly(x,z,h));
const LAKE=dec(OSM.lake),ISLANDS=OSM.islands.map(dec);
const WATER=OSM.water.map(polyRec),MARINAS=OSM.marina.map(polyRec),BEACHES=OSM.beach.map(polyRec);
const PIERS=OSM.pier.map(p=>p.line?{line:dec(p.line),w:p.w,name:p.n||''}:polyRec(p));
const AREAS=OSM.areas.map(polyRec);
const ROADS=OSM.roads.map(r=>{const pts=dec(r.p);let len=0;for(let i=0;i+1<pts.length;i++)len+=Math.hypot(pts[i+1][0]-pts[i][0],pts[i+1][1]-pts[i][1]);return {c:r.c,w:r.w,name:r.n||'',bridge:r.b||0,layer:r.l||0,pts,len};});
const RAILS=OSM.rail.map(r=>({type:r.t,elevated:!!r.e,name:r.n||'',pts:dec(r.p)}));
const STATIONS=OSM.stations.map(s=>({name:s.n,x:s.x/10,z:s.z/10}));
const WATERWAYS=(OSM.waterways||[]).map(w=>({name:w.n||'',pts:dec(w.p)}));
const POIS=OSM.pois.map(p=>({name:p.n,x:p.x/10,z:p.z/10,kind:p.k,ang:p.ang||0}));
// the ground: a height grid from the elevation tiles, in metres above the water level (y = 0 is the river or lake)
const TER=(()=>{const t=OSM.terrain;if(!t)return null;const h=new Float32Array(t.h.length);for(let i=0;i<t.h.length;i++)h[i]=t.h[i]/10;
  return {step:t.step,nx:t.nx,nz:t.nz,x0:t.x0/10,z0:t.z0/10,datum:t.datum,h};})();
function groundH(x,z){if(!TER)return 0;const fx=(x-TER.x0)/TER.step,fz=(z-TER.z0)/TER.step;
  let i=Math.floor(fx),j=Math.floor(fz);i=Math.max(0,Math.min(TER.nx-2,i));j=Math.max(0,Math.min(TER.nz-2,j));
  const tx=Math.max(0,Math.min(1,fx-i)),tz=Math.max(0,Math.min(1,fz-j)),h=TER.h,n=TER.nx;
  return (h[j*n+i]*(1-tx)+h[j*n+i+1]*tx)*(1-tz)+(h[(j+1)*n+i]*(1-tx)+h[(j+1)*n+i+1]*tx)*tz;}
const groundMin=ring=>{let m=1e9;for(const [x,z] of ring)m=Math.min(m,groundH(x,z));return m===1e9?0:m;};
ctx.groundH=groundH;
// water lookups on a 20 m grid, worked out once for the whole map: 0 land, 1 lake, 2 inland water
const WG=20,WNX=Math.ceil(B.w/WG),WNZ=Math.ceil(B.d/WG),WGRID=new Uint8Array(WNX*WNZ);
{for(let j=0;j<WNZ;j++){const z=B.z0+(j+0.5)*WG;
   // the lake: scanline crossings of the shore polygon at this z
   const xs=[];for(let i=0,k=LAKE.length-1;i<LAKE.length;k=i++){const [xi,zi]=LAKE[i],[xk,zk]=LAKE[k];if((zi>z)!==(zk>z))xs.push(xi+(z-zi)*(xk-xi)/(zk-zi));}xs.sort((a,b)=>a-b);
   for(let q=0;q+1<xs.length;q+=2){const a=Math.max(0,Math.floor((xs[q]-B.x0)/WG)),b=Math.min(WNX-1,Math.floor((xs[q+1]-B.x0)/WG));for(let i=a;i<=b;i++)WGRID[j*WNX+i]=1;}}
 const fillRec=(bb,test,val)=>{for(let j=Math.max(0,Math.floor((bb.z0-B.z0)/WG));j<=Math.min(WNZ-1,Math.floor((bb.z1-B.z0)/WG));j++)for(let i=Math.max(0,Math.floor((bb.x0-B.x0)/WG));i<=Math.min(WNX-1,Math.floor((bb.x1-B.x0)/WG));i++)if(test(B.x0+(i+0.5)*WG,B.z0+(j+0.5)*WG,WGRID[j*WNX+i]))WGRID[j*WNX+i]=val;};
 for(const r of ISLANDS)fillRec(bbox(r),(x,z)=>inPoly(x,z,r),0);
 // A sea-level city floods its whole box and lets the ground decide: a cell is only water where the land is not
 // standing above the waterline. Without this every tree, car and street light would think it was in the river.
 const SEA=!!C.seaLevelWater,dry=(x,z)=>SEA&&groundH(x,z)>0.4;
 for(const w of WATER)fillRec(w.bb,(x,z,v)=>!v&&!dry(x,z)&&inRec(w,x,z),2);}
const waterCell=(x,z)=>{const i=Math.floor((x-B.x0)/WG),j=Math.floor((z-B.z0)/WG);if(i<0||j<0||i>=WNX||j>=WNZ)return x>B.x1?1:0;return WGRID[j*WNX+i];};
const inLake=(x,z)=>waterCell(x,z)===1;
const inRiver=(x,z)=>waterCell(x,z)===2;
const inWater=(x,z)=>waterCell(x,z)>0;
// roads on a 50 m grid of segment references, for "what street is this near" questions
const RG=50,RGRID=new Map();
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
