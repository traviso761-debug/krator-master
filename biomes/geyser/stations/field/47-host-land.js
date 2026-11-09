// ================================================================= HOST — the field's land, water, fields and binding (stations 2-5)
// The kit lays the station's thermal layout (STATION_SITE.thermal(), here: the kit is loaded) on the land; the ground is then that land plus the kit's
// relief (GEYSER.relief: the mounds, the springs' bowls), as on the showcase. The run-off ends where the site says (sink), else where it runs out.
const THERMAL=Object.assign({amb:SITE.amb==null?0:SITE.amb,ground:landH,sea:SEA,wind:WIND},SITE.thermal());
THERMAL.ground=landH;THERMAL.wind=WIND;THERMAL.sea=SEA;THERMAL.amb=SITE.amb==null?0:SITE.amb;
THERMAL.sink=SITE.sink||((x,z)=>false);
const LAYOUT=GEYSER.lay(THERMAL);
_mark('layout');
const terraceMask=(x,z)=>0;
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const b=landH(x,z);const h=b+GEYSER.relief(x,z,b);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
// the water: the kit's springs, pools and pots, and the site's own (a lake's edge, a melt pool)
function waterH(x,z){const w=SITE.waterH?SITE.waterH(x,z):-1e9,t=GEYSER.waterAt(x,z,landH(x,z));return t>w?t:w;}

// ---------------------------------------------------------------- the fields (cached, as the showcase's)
// wet, flow, slope, rock, upland, floor (the field), beach (none), cold (the site's: frost and snow on ground the vents do not warm)
function fieldsAt(x,z,h,slope){const fl=basinK(x,z),g=GEYSER.at(x,z),warm=clamp((g.T-THERMAL.amb)/20,0,1);
 return{wet:SITE.wet==null?.4:SITE.wet,flow:0,slope,rock:smooth(.55,.8,slope)*.85,upland:clamp((h-(SITE.uplandH==null?60:SITE.uplandH))/120,0,1),floor:fl,beach:0,
  cold:clamp((SITE.cold==null?0:SITE.cold)*(1-warm),0,1)};}
const FNAMES=['wet','flow','slope','rock','upland','floor','beach','cold'];
const FC=(function(){const N=480,S=TERR.R*2.2,a={};FNAMES.forEach(n=>a[n]=new Float32Array(N*N));a.h=new Float32Array(N*N);
 const cs=S/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){a.h[j*N+i]=terrainH((i/(N-1)-.5)*S,(j/(N-1)-.5)*S);}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=(i/(N-1)-.5)*S,z=(j/(N-1)-.5)*S,k=j*N+i;
  const hx=a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)],hz=a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i],slope=clamp(Math.hypot(hx,hz)/(2*cs)*1.6,0,1);
  const F=fieldsAt(x,z,a.h[k],slope);FNAMES.forEach(n=>a[n][k]=F[n]);}
 const L={x:NaN,z:NaN,k:0,fu:0,fv:0};
 const at=(arr,x,z)=>{if(x!==L.x||z!==L.z){const u=clamp((x/S+.5)*(N-1),0,N-1.001),v=clamp((z/S+.5)*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v);L.x=x;L.z=z;L.k=j*N+i;L.fu=u-i;L.fv=v-j;}
  const k=L.k,fu=L.fu,fv=L.fv;return arr[k]*(1-fu)*(1-fv)+arr[k+1]*fu*(1-fv)+arr[k+N]*(1-fu)*fv+arr[k+N+1]*fu*fv;};
 return{N,S,a,at};})();
const FIELD={};FNAMES.forEach(n=>FIELD[n]=(x,z)=>FC.at(FC.a[n],x,z));
Object.assign(FIELD,GEYSER.fields);
_mark('fields');

// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
const waterMask=(x,z)=>{const w=waterH(x,z);if(w<-1e8)return 1;const d=terrainH(x,z)-w;return d<.15?0:d<.7?(d-.15)/.55:1;};
/* the hyperjungle (a site with jungle: corona's trench floor, XA): off the field's floor, out of its dead ring, out of the water */
const jungleMask=(x,z)=>SITE.jungle?(1-smooth(.25,.55,FIELD.floor(x,z)))*(1-smooth(.15,.5,GEYSER.at(x,z).dead))*waterMask(x,z)*(SITE.jungleK?SITE.jungleK(x,z):1):0;
let MASK=waterMask;
// the LOD spine: across the field, its geysers and its biggest springs
const SPINE=[];
for(let z=-BASIN.rz;z<=BASIN.rz;z+=160)for(let x=-BASIN.rx;x<=BASIN.rx;x+=160)SPINE.push([BASIN.x+x,BASIN.z+z]);
LAYOUT.geysers.forEach(g=>SPINE.push([g.x,g.z]));LAYOUT.springs.slice(0,4).forEach(s=>SPINE.push([s.x,s.z]));
BIO.init({tags:'geyser',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:(x,z)=>MASK(x,z),
 obstacles:OBSTACLES,ticks:tick,seed:SITE.seed==null?64:SITE.seed,origin:SPINE,center:[BASIN.x,BASIN.z],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:240,mid:620,far:1800,floor:[200,480]},
 windows:{water:[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1],stair:[BASIN.x-1,BASIN.z-1,BASIN.x+1,BASIN.z+1]}});
BIO.setSun(SUN_POS);
