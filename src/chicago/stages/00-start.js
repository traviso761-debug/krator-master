// ---------- start: three.js check, the city file, randomness, shared helpers ----------
if(!window.THREE){document.getElementById('loading').textContent='three.js did not load (vendor/three/three.min.js). Check the site mounts and reload.';return;}
const THREE=window.THREE;
const CITY_ID=(()=>{const v=new URLSearchParams(location.search).get('city')||'';return /^[a-z0-9-]{1,40}$/.test(v)?v:'chicago';})();
ctx.cityId=CITY_ID;
const DATA=await fetch('data/cities/'+CITY_ID+'.json').then(r=>{if(!r.ok)throw new Error('data/cities/'+CITY_ID+'.json: HTTP '+r.status);return r.json();});
const C=resolveCity(DATA,['name','note','grid','major','shore','river','parks','beach','pier','districts','landmarks','el','views']);
for(const k of ['grid','major','shore','river','parks','beach','pier','districts','landmarks','el','views'])C[k]=DATA[k];
const SEED_DEFAULT=DATA.defaultSeed||1871;
const SEED0=(()=>{try{const v=parseInt(new URLSearchParams(location.search).get('seed')||new URLSearchParams(location.hash.slice(1)).get('seed'),10);return v>0&&v<2147483647?v:SEED_DEFAULT;}catch(e){return SEED_DEFAULT;}})();
const LCG=createLcg(SEED0);const rnd=LCG.rnd,rr=LCG.rr,pick=LCG.pick;
const {vn,fbm}=makeNoise(rnd);
const xr=mkRng(20261017),xrr=(a,b)=>a+(b-a)*xr();
const WORLD=C.WORLD,SHORE=C.shore.x,GRID=C.grid,RIV=C.river,PIER=C.pier,EL=C.el;
const MAJOR=C.major.streets.map(([axis,at,w,name])=>({axis,at,w,name}));
const DIST={};for(const k in C.districts)if(k!=='_'){const [name,col,base,tall]=C.districts[k];DIST[k]={key:k,name,color:parseInt(col.slice(1),16),base,tall};}
const animHooks=[];
// where things are: water, parks, the pier, the major streets
const RM=RIV.main,RN=RIV.north,RS=RIV.south;
function inRiver(x,z){if(x>=RM.xWest-RN.width/2&&x<=RM.xEast&&Math.abs(z-RM.z)<=RM.width/2)return true;
  if(Math.abs(x-RN.x)<=RN.width/2&&z<RM.z&&z>RN.zEnd)return true;if(Math.abs(x-RS.x)<=RS.width/2&&z>RM.z&&z<RS.zEnd)return true;return false;}
function inLake(x,z){if(x>SHORE)return !(x<PIER.x+PIER.length&&Math.abs(z-PIER.z)<=PIER.width/2);return false;}
function inWater(x,z){return inLake(x,z)||inRiver(x,z);}
function parkAt(x,z){for(const p of C.parks)if(x>=p.x0&&x<=p.x1&&z>=p.z0&&z<=p.z1)return p;return null;}
function majorAt(x,z){for(const m of MAJOR){const d=m.axis==='x'?Math.abs(x-m.at):Math.abs(z-m.at);if(d<=m.w/2)return m;}return null;}
function districtAt(x,z){if(x>=-780&&x<=290&&z>=-520&&z<=390)return DIST.loop;if(z<=-720&&z>=-1300){if(x>=-780&&x<=290)return DIST.rivernorth;if(x>290&&x<=SHORE)return DIST.streeterville;}
  if(z<-1300&&x>-400&&x<=SHORE)return DIST.goldcoast;if(x<-780&&z>=-720&&z<=520)return DIST.westloop;if(z>390&&z<=1400&&x<600)return DIST.southloop;return DIST.outer;}
ctx.districtAt=districtAt;ctx.inWater=inWater;
