// ---------- start: three.js check, the city file, projection, randomness, where things are ----------
if(!window.THREE){document.getElementById('loading').textContent='three.js did not load (vendor/three/three.min.js). Check the site mounts and reload.';return;}
const THREE=window.THREE;
const CITY_ID=(()=>{const v=new URLSearchParams(location.search).get('city')||'';return /^[a-z0-9-]{1,40}$/.test(v)?v:'chicago';})();
ctx.cityId=CITY_ID;
const C=await fetch('data/cities/'+CITY_ID+'.json').then(r=>{if(!r.ok)throw new Error('data/cities/'+CITY_ID+'.json: HTTP '+r.status);return r.json();});
const SEED_DEFAULT=C.defaultSeed||1871;
const SEED0=(()=>{try{const v=parseInt(new URLSearchParams(location.search).get('seed')||new URLSearchParams(location.hash.slice(1)).get('seed'),10);return v>0&&v<2147483647?v:SEED_DEFAULT;}catch(e){return SEED_DEFAULT;}})();
const LCG=createLcg(SEED0);const rnd=LCG.rnd,rr=LCG.rr,pick=LCG.pick;
const {vn,fbm}=makeNoise(rnd);
const xr=mkRng(20261017),xrr=(a,b)=>a+(b-a)*xr();
const animHooks=[];
// projection: metres east (x) and south (z) of the origin; good to a few metres across downtown
const [LAT0,LON0]=C.origin,M_LAT=111132,M_LON=111320*Math.cos(LAT0*Math.PI/180);
const lonX=lon=>(lon-LON0)*M_LON,latZ=lat=>-(lat-LAT0)*M_LAT;
const P=([lat,lon])=>[lonX(lon),latZ(lat)];
const toLatLon=(x,z)=>[LAT0-z/M_LAT,LON0+x/M_LON];
ctx.project=P;ctx.toLatLon=toLatLon;
// the map rectangle, in metres
const B=(()=>{const [s,w,n,e]=C.bounds;return {x0:lonX(w),x1:lonX(e),z0:latZ(n),z1:latZ(s)};})();B.w=B.x1-B.x0;B.d=B.z1-B.z0;B.cx=(B.x0+B.x1)/2;B.cz=(B.z0+B.z1)/2;
const inMap=(x,z,m)=>x>B.x0+(m||0)&&x<B.x1-(m||0)&&z>B.z0+(m||0)&&z<B.z1-(m||0);
// geometry helpers
function segDist(px,pz,ax,az,bx,bz){const dx=bx-ax,dz=bz-az,L=dx*dx+dz*dz;let t=L?((px-ax)*dx+(pz-az)*dz)/L:0;t=Math.max(0,Math.min(1,t));return Math.hypot(px-ax-t*dx,pz-az-t*dz);}
function pathDist(x,z,pts){let d=Infinity;for(let i=0;i+1<pts.length;i++)d=Math.min(d,segDist(x,z,pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1]));return d;}
function inPoly(x,z,poly){let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [xi,zi]=poly[i],[xj,zj]=poly[j];if((zi>z)!==(zj>z)&&x<(xj-xi)*(z-zi)/(zj-zi)+xi)c=!c;}return c;}
function segHit(a,b,c,d){const r=[b[0]-a[0],b[1]-a[1]],s=[d[0]-c[0],d[1]-c[1]],den=r[0]*s[1]-r[1]*s[0];if(Math.abs(den)<1e-9)return null;
  const t=((c[0]-a[0])*s[1]-(c[1]-a[1])*s[0])/den,u=((c[0]-a[0])*r[1]-(c[1]-a[1])*r[0])/den;if(t<0||t>1||u<0||u>1)return null;return {x:a[0]+t*r[0],z:a[1]+t*r[1],r,s};}
// water: the lake is everything east of the shore line; rivers are thick polylines
const SHORE=C.shore.map(P);
const LAKE_POLY=[[SHORE[0][0],B.z0-2000],...SHORE,[SHORE[SHORE.length-1][0],B.z1+2000],[B.x1+2000,B.z1+2000],[B.x1+2000,B.z0-2000]];   // shore north to south, then round the east side
const RIVERS=C.rivers.map(r=>({name:r.name,width:r.width,pts:r.path.map(P)}));
const PIER=(()=>{const b=P(C.pier.base),e=P(C.pier.end),w=P(C.pier.wheel);return {x0:b[0],x1:e[0],z:b[1],width:C.pier.width,wheelX:w[0],wheelR:C.pier.wheelR,length:e[0]-b[0]};})();
function onPier(x,z){return x>=PIER.x0-40&&x<=PIER.x1&&Math.abs(z-PIER.z)<=PIER.width/2;}
function inLake(x,z){return inPoly(x,z,LAKE_POLY)&&!onPier(x,z);}
function riverAt(x,z,pad){for(const r of RIVERS)if(pathDist(x,z,r.pts)<=r.width/2+(pad||0))return r;return null;}
const inRiver=(x,z)=>!!riverAt(x,z,0);
const inWater=(x,z)=>inLake(x,z)||inRiver(x,z);
// streets: named lists plus the regular Chicago grid filled in around them
const range=(r,a,b)=>r.length>4?[r[4],r[5]]:[a,b];
const STREETS=[];   // {name,w,major,a:[x,z],b:[x,z]} straight segments; diagonals are split into segments
for(const s of C.streetsNS){const [lat0,lat1]=range(s,-90,90);const x=lonX(s[1]);STREETS.push({name:s[0],w:s[2],major:!!s[3],a:[x,Math.max(B.z0,latZ(lat1))],b:[x,Math.min(B.z1,latZ(lat0))],axis:'x',at:x});}
for(const s of C.streetsEW){const [lon0,lon1]=range(s,-180,180);const z=latZ(s[1]);STREETS.push({name:s[0],w:s[2],major:!!s[3],a:[Math.max(B.x0,lonX(lon0)),z],b:[Math.min(B.x1,lonX(lon1)),z],axis:'z',at:z});}
{const F=C.fill,nsX=STREETS.filter(s=>s.axis==='x').map(s=>s.at),ewZ=STREETS.filter(s=>s.axis==='z').map(s=>s.at);
 for(let x=Math.ceil(B.x0/F.ns)*F.ns;x<=B.x1;x+=F.ns)if(!nsX.some(v=>Math.abs(v-x)<F.ns*0.6))STREETS.push({name:'',w:F.street,major:false,a:[x,B.z0],b:[x,B.z1],axis:'x',at:x,fill:true});
 for(let z=Math.ceil(B.z0/F.ew)*F.ew;z<=B.z1;z+=F.ew)if(!ewZ.some(v=>Math.abs(v-z)<F.ew*0.45))STREETS.push({name:'',w:F.street,major:false,a:[B.x0,z],b:[B.x1,z],axis:'z',at:z,fill:true});}
const DIAGONALS=C.diagonals.map(([name,w,path])=>({name,w,major:true,pts:path.map(P)}));
for(const d of DIAGONALS)for(let i=0;i+1<d.pts.length;i++)STREETS.push({name:d.name,w:d.w,major:true,a:d.pts[i],b:d.pts[i+1],axis:'d'});
function streetAt(x,z){for(const s of STREETS)if(segDist(x,z,s.a[0],s.a[1],s.b[0],s.b[1])<=s.w/2)return s;return null;}
// parks, beaches, districts
const PARKS=C.parks.map(p=>{if(p.poly){const pts=p.poly.map(P),xs=pts.map(q=>q[0]),zs=pts.map(q=>q[1]);return {name:p.name,pts,x0:Math.min(...xs),x1:Math.max(...xs),z0:Math.min(...zs),z1:Math.max(...zs)};}   // a rectangle, or a polygon for parks like Wicker Park's triangle
  const [la0,lo0,la1,lo1]=p.rect;return {name:p.name,x0:lonX(lo0),x1:lonX(lo1),z0:latZ(la1),z1:latZ(la0)};});
function parkAt(x,z){for(const p of PARKS)if(x>=p.x0&&x<=p.x1&&z>=p.z0&&z<=p.z1&&(!p.pts||inPoly(x,z,p.pts)))return p;return null;}
const BEACHES=C.beaches.map(b=>({name:b.name,w:b.width,pts:b.path.map(P)}));
const DIST={},DIST_BOX=[];
for(const k in C.districts){if(k==='_')continue;const [name,col,base,tall,box]=C.districts[k];DIST[k]={key:k,name,color:parseInt(col.slice(1),16),base,tall};
  if(box)DIST_BOX.push([DIST[k],lonX(box[1]),lonX(box[3]),latZ(box[2]),latZ(box[0])]);}
function districtAt(x,z){for(const [d,x0,x1,z0,z1] of DIST_BOX)if(x>=x0&&x<=x1&&z>=z0&&z<=z1)return d;return DIST.outer;}
const SKY_C=P(C.skylineCentre);
const EL=(()=>{const e=C.el;return {north:latZ(e.north),south:latZ(e.south),east:lonX(e.east),west:lonX(e.west),height:e.height,trains:e.trains,cars:e.cars,
  blue:e.blue?{height:e.blue.height,trains:e.blue.trains,cars:e.blue.cars,pts:e.blue.path.map(P),stations:e.blue.stations.map(([la,lo,name])=>[...P([la,lo]),name])}:null};})();
const TRAILS=(C.trails||[]).map(t=>({name:t.name,info:t.info,height:t.height,width:t.width,pts:t.path.map(P)}));
ctx.districtAt=districtAt;ctx.inWater=inWater;ctx.streets=STREETS.length;
