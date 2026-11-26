// ================================================================= HOST — stage (station 2: the high isle; replaces src/45-host-stage.js)
// The renderer, the light and the graphics set are src/45's, word for word; the map is the high isle's (below).
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
// a shader that fails to compile is only a console error in three.js and its mesh silently does not draw: the panel shows it
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
window._t={t0:performance.now()};const _mark=k=>{window._t[k]=Math.round(performance.now()-window._t.t0);if(/[?&]marks/.test(location.search))console.warn('mark '+k+' '+window._t[k]);};
// (TAU, clamp, smooth, fbm, rng... are the core's, made globals by the hyperjungle's 41: biomes/hyperjungle/src)
// THE GRAPHICS SET (BACKPORT.md section 1, GRAPHIC-LOAD.md; the final rebuild, pair 8), as oidong's: item geometry welded (?index=0), the chunk meshes
// merged with a floor of 1,500 triangles (?lodmerge=0), the LOD cross-fade (?lodfade=0) and each loose instance culled past its own range (?lodcull=0)
{const q=new URLSearchParams(location.search);BIO.INDEX_ITEMS=q.get('index')!=='0';
 BIO.LOD.merge=q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&q.get('lodfade')!=='0'?.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&q.get('lodcull')!=='0';
}
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   // BIO.record: the volume as a core/tags record too
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r&&y>=(r.y||0)-2&&y<=(r.y||0)+r.h+5;}

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;document.body.appendChild(renderer.domElement);
// THE LIGHT: the sea's level under ~1.9 atm, hot: a milky sky, a strong blue fill, a pale haze; the sun in the south-west
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xc2cabe);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00026);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.5,16000);
const hemi=new THREE.HemisphereLight(0xc4d4cc,0x48463a,.7);scene.add(hemi);
const SUN_POS=[-900,820,700];
const sun=new THREE.DirectionalLight(0xfff0d0,1.4);sun.position.set(...SUN_POS);scene.add(sun);
const fill=new THREE.DirectionalLight(0xb0ccc4,.3);fill.position.set(900,400,-900);scene.add(fill);
// the trade wind, from the east: the geysers' steam leans west
const WIND=[-.9,.2];

// ================================================================= STATION 2, THE HIGH ISLE (PLAN-STATIONS.md, station 2; the owner asked for it, 2026-11-09)
// The isles' upland the showcase has no room for: on scale model 4.23/5.1 the isles' land rises about a kilometre over the sea (p95 -474 m over a sea at
// -1,500 m), Af under ~1,900 mm on the windward slopes, BSh under ~800 mm in the lee. Earth basis: the high islands of Polynesia and Hawai'i (an eroded
// shield: windward amphitheatre-headed valleys with falls off their headwalls, a leeward rain shadow), Sumba's and Timor's hills for the dry side.
// THE MAP (x east, z south, y up from the sea; the trade wind from the east): a shield ~7 x 6.2 km at the coast, its summit 1,050 m a little west of the
// middle; on the windward side five valleys cut deep into it, each ending in an amphitheatre whose headwall drops ~400 m to a floor that runs down to the
// sea (their streams and falls: 89x-host-streams.js); cloud forest in the belt on the crest (87-host-cloud.js: the Throne's elfin tree, and the fog belt);
// rainforest (Af) down the windward slopes, hypertropic jungle (XA) on the coastal flats, monsoon forest (Am) on the crest's lee, the savanna burnt in a
// mosaic (Aw, XV) down the lee, hot steppe (BSh) and salt steppe (XS) on its dry west coast. The village's gardens on the windward plain between two
// valleys, the coffee and clove terraces on the lee's upper slopes in the monsoon band (the plan: "terraced into its slopes"), the tide pools on a windward
// headland. Everything after this stage is src/'s, read with the STATION knobs (the island's places it has not got stand off the map: no mangal, no pan,
// no vent).
const STATION={key:'high',groundCs:10,fieldCs:16,shoreCell:10,geyser:false,center:[0,0],
 lod:{hero:230,mid:620,far:3600,floor:[190,460]},
 region:{name:'The high isle (station 2: an eroded shield ~1 km high)',x:0,z:0,y:-40,r:4300,h:1150},
 dropLayers:['salt','sinter','mud','damp'],
 /* (2026-11-09) two layers read another's map (84: STATION.shareLayers), so the ground keeps to 16 texture units with the strata's five, the fog belt's
    field and the shore's bed (it read 18 and did not compile on the GPU) */
 shareLayers:{wetsand:'sand',cured:'grass'}};
const TERR={R:4300,X0:-4400,X1:4400,Z0:-4000,Z1:4000};
const SEA=0;
function ell(x,z,cx,cz,rx,rz,a){const c=Math.cos(a||0),s=Math.sin(a||0),dx=x-cx,dz=z-cz,u=(dx*c+dz*s)/rx,v=(-dx*s+dz*c)/rz;return 1-(u*u+v*v);}
const OFF={x:1e6,z:1e6,off:true};
const BAY=Object.assign({r:1,name:'(no mangal on the high isle)'},OFF);
// THE SHIELD: the coast an ellipse with a wander, the summit off the middle toward the lee
const SHIELD={x:-350,z:50,H:1050,rx:3500,rz:3100};
function landF(x,z,inflate){const k=inflate||0;return ell(x,z,0,0,3500+k,3100+k,.1)+.1*(fbm(x*.0011+3,z*.0011-5,7901,3)-.5)+.03*(fbm(x*.006,z*.006,7902,2)-.5);}
const SDG=(function(){const cs=16,nx=Math.ceil((TERR.X1-TERR.X0)/cs)+1,nz=Math.ceil((TERR.Z1-TERR.Z0)/cs)+1;
 function grid(inside){const N=nx*nz,ins=new Uint8Array(N),dI=new Float32Array(N),dO=new Float32Array(N),BIG=1e9;
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)ins[j*nx+i]=inside(TERR.X0+i*cs,TERR.Z0+j*cs)?1:0;
  const run=(D,want)=>{for(let k=0;k<N;k++)D[k]=ins[k]===want?0:BIG;const a=cs,b=cs*Math.SQRT2;
   for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i;let v=D[k];if(!v)continue;
    if(i>0)v=Math.min(v,D[k-1]+a);if(j>0){v=Math.min(v,D[k-nx]+a);if(i>0)v=Math.min(v,D[k-nx-1]+b);if(i<nx-1)v=Math.min(v,D[k-nx+1]+b);}D[k]=v;}
   for(let j=nz-1;j>=0;j--)for(let i=nx-1;i>=0;i--){const k=j*nx+i;let v=D[k];if(!v)continue;
    if(i<nx-1)v=Math.min(v,D[k+1]+a);if(j<nz-1){v=Math.min(v,D[k+nx]+a);if(i<nx-1)v=Math.min(v,D[k+nx+1]+b);if(i>0)v=Math.min(v,D[k+nx-1]+b);}D[k]=v;}};
  run(dI,0);run(dO,1);
  const S=new Float32Array(N);for(let k=0;k<N;k++)S[k]=ins[k]?dI[k]-cs*.5:-(dO[k]-cs*.5);return S;}
 const coast=grid((x,z)=>landF(x,z)>0),reef=grid((x,z)=>landF(x,z,190+55*(fbm(x*.003,z*.003,7103,2)-.5))>0);
 const at=(S,x,z)=>{const u=clamp((x-TERR.X0)/cs,0,nx-1.001),v=clamp((z-TERR.Z0)/cs,0,nz-1.001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,k=j*nx+i;
  return S[k]*(1-fu)*(1-fv)+S[k+1]*fu*(1-fv)+S[k+nx]*(1-fu)*fv+S[k+nx+1]*fu*fv;};
 return{cs,nx,nz,coast,reef,sd:(x,z)=>at(coast,x,z),rd:(x,z)=>at(reef,x,z)};})();
const coastD=SDG.sd,reefD=SDG.rd;
function coastPoint(x0,z0,a){let lo=0,hi=5000;for(let k=0;k<40;k++){const m=(lo+hi)/2;if(coastD(x0+Math.cos(a)*m,z0+Math.sin(a)*m)>0)lo=m;else hi=m;}return[x0+Math.cos(a)*lo,z0+Math.sin(a)*lo];}

// ---------------------------------------------------------------- the shield and its valleys
// the shield's surface: a cone of profile (1 - d)^1.35 from the summit to the coast, the windward flank a little lowered by erosion, ridged by radial
// ribs (the lava flows' spines between the gullies)
function shieldH(x,z){const d=Math.hypot((x-SHIELD.x)/SHIELD.rx,(z-SHIELD.z)/SHIELD.rz),u=Math.max(0,1-d);let h=SHIELD.H*Math.pow(u,1.35);
 const a=Math.atan2(z-SHIELD.z,x-SHIELD.x),rib=1-Math.abs(fbm(Math.cos(a)*3+d*.6,Math.sin(a)*3,7903,3)*2-1);
 h*=1-.08*smooth(-200,1500,x)-.14*rib*rib*smooth(.05,.35,d);
 h+=18*(fbm(x*.004,z*.004,7904,3)-.5)*smooth(0,.2,u);
 return h;}
// THE VALLEYS (windward): each an axis from its head (deep in the shield) to its mouth on the coast; the floor rises from the sea to `top` at the head; the
// walls are the shield cut down steeply over a band; the head an amphitheatre (the axis' end is round, so the wall rings it)
const VALLEYS=[-1.05,-.52,0,.5,1.02].map((a,i)=>{const hx=SHIELD.x+Math.cos(a)*(820+90*(i%2)),hz=SHIELD.z+Math.sin(a)*(820+90*(i%2)),m=coastPoint(hx,hz,a);
 return{i,a,head:[hx,hz],mouth:[m[0]+Math.cos(a)*30,m[1]+Math.sin(a)*30],top:250+40*((i*7)%3),W0:300,W1:150,name:['The north valley','The north-east valley','The great valley','The south-east valley','The south valley'][i]};});
// a point's place in a valley: t 0 at the head, 1 at the mouth; d its distance from the axis (round at the head)
function vAt(V,x,z){const ax=V.head[0],az=V.head[1],bx=V.mouth[0]-ax,bz=V.mouth[1]-az,L2=bx*bx+bz*bz,t=clamp(((x-ax)*bx+(z-az)*bz)/L2,0,1);
 const px=ax+bx*t,pz=az+bz*t;return{t,d:Math.hypot(x-px,z-pz),L:Math.sqrt(L2)};}
const vFloor=(V,t)=>V.top*Math.pow(1-t,1.7);
const vWidth=(V,t)=>mix(V.W0,V.W1,Math.pow(t,.6));
function carvedH(x,z){let h=shieldH(x,z);
 for(const V of VALLEYS){const q=vAt(V,x,z),W=vWidth(V,q.t);if(q.d>W*1.25)continue;const f=vFloor(V,q.t)-1.4*smooth(12,3,q.d)*smooth(0,.04,q.t);
  const v=f+(h-f)*Math.pow(smooth(W*.5,W*1.2,q.d),1.6)+3*(fbm(x*.02,z*.02,7905,2)-.5)*smooth(W*.4,W*.9,q.d);if(v<h)h=v;}
 // the lee's gullies: shallow, many, down the slope
 if(x<SHIELD.x+300){const r=1-Math.abs(fbm(x*.0055+2,z*.0055-4,7906,3)*2-1);h-=h*.1*r*r*smooth(SHIELD.x+300,SHIELD.x-400,x);}
 return h;}

// ---------------------------------------------------------------- the places
const BENCH=(function(){const p=coastPoint(0,0,-.26);return{x:p[0],z:p[1],r:140,level:.62,name:'The tide-pool bench (reef rock on a windward headland)'};})();
const POOLS=(function(){reseed(7201);const P=[];for(let t=0;t<400&&P.length<16;t++){const a=rr(0,TAU),d=rr(0,BENCH.r*.75),x=BENCH.x+Math.cos(a)*d,z=BENCH.z+Math.sin(a)*d,s=coastD(x,z),r=rr(1.6,4.5);
  if(s<-18||s>16)continue;if(P.some(q=>Math.hypot(q.x-x,q.z-z)<q.r+r+2))continue;P.push({x,z,r,level:BENCH.level-.1-rr(0,.08),floor:BENCH.level-.55-rr(0,.25)});}return P;})();
const PAN=Object.assign({rx:1,rz:1,a:0,floor:0,name:'(no salt pan on the high isle)'},OFF);
const panE=()=>99;
const BRINE=[];
const VENT=Object.assign({r:1,seed:4421,name:'(no vent on the high isle)'},OFF);
// THE GARDENS: the village's on the windward plain between the great valley and the south-east one; the coffee and the cloves on the lee's upper slopes
// in the monsoon band (dryAt about .37, 250-450 m: found on the shield before the land is levelled)
const GARDEN=(function(){const a=.25,p=coastPoint(0,0,a);return{x:p[0]-Math.cos(a)*230,z:p[1]-Math.sin(a)*230,a:a+Math.PI/2,name:'The village gardens'};})();
const GARDEN2=(function(){let b=null,bs=1e9;for(let r=900;r<=2400;r+=60)for(let k=0;k<72;k++){const a=k/72*TAU,x=SHIELD.x+Math.cos(a)*r,z=SHIELD.z+Math.sin(a)*r;
  if(x>SHIELD.x-200)continue;const h=carvedH(x,z);if(h<250||h>450)continue;const s=Math.abs(dryAt(x,z,h)-.37)+.0004*Math.abs(h-350);if(s<bs){bs=s;b=[x,z,a];}}
 b=b||[SHIELD.x-1500,SHIELD.z,Math.PI];return{x:b[0],z:b[1],a:b[2]+Math.PI/2,name:'The upper gardens (coffee and cloves, terraced on the lee)'};})();
const PLOTS=(function(){const L=[];const add=(key,x,z,w,d,o)=>L.push(Object.assign({key,u:x,v:z,w,d,g:GARDEN},o||{}));
 // the rice paddies: two terraced rows down the slope toward the bay, each a step lower
 for(let i=0;i<5;i++)for(let j=0;j<2;j++)add('crop-rice',-110+i*25,-60+j*21,23,19,{terrace:i});
 for(let i=0;i<3;i++)add('crop-taro',-110+i*20,-12,18,12);
 add('crop-herbs',-50,-12,16,12);
 add('crop-banana',-30,-92,30,24);add('crop-mango',8,-94,34,30);
 add('crop-breadfruit',52,-92,34,30);
 add('crop-kava',-15,-16,22,14);add('crop-greens',12,-16,18,14);
 add('crop-sweetpotato',38,-14,26,16);add('crop-sweetpotato',66,-14,20,16);
 add('crop-sugarcane',-110,22,40,22);add('crop-sugarcane',-66,22,30,22);
 add('crop-coconut',-5,52,80,30);add('crop-coconut',82,36,30,50);
 // the upper gardens: coffee under its shade bananas, clove groves, terraced across the slope
 for(let i=0;i<3;i++)add('crop-coffee',-50+i*34,-14,30,18,{g:GARDEN2});
 for(let i=0;i<3;i++)add('crop-clove',-50+i*34,14,30,22,{g:GARDEN2});
 L.forEach(P=>{const G=P.g,c=Math.cos(G.a),s=Math.sin(G.a);P.x=G.x+P.u*c-P.v*s;P.z=G.z+P.u*s+P.v*c;P.a=G.a;P.r=Math.hypot(P.w,P.d)/2;delete P.g;});return L;})();
const nearGardens=(x,z)=>Math.hypot(x-GARDEN.x,z-GARDEN.z)<260||Math.hypot(x-GARDEN2.x,z-GARDEN2.z)<160;
// a point in a plot (its own frame), with a soft edge e (m): 1 inside, 0 beyond the edge
function inPlot(P,x,z,e){const c=Math.cos(P.a),s=Math.sin(P.a),dx=x-P.x,dz=z-P.z,u=dx*c+dz*s,v=-dx*s+dz*c;
 return smooth(P.w/2+e,P.w/2,Math.abs(u))*smooth(P.d/2+e,P.d/2,Math.abs(v));}

// ---------------------------------------------------------------- the land (the island's shore and reef, the shield's relief)
const shoreH=sd=>2.1*smooth(-30,35,sd)-.5;
const mudH=sd=>shoreH(sd);
function lagoonH(x,z,d){return -.4-2.3*smooth(0,70,d)-.9*smooth(140,320,d)+.55*(fbm(x*.008,z*.008,7303,2)-.5);}
const bayK=()=>0;
function seaH(x,z,sd,rd){const d=-sd;let h=lagoonH(x,z,d);
 const crest=-.32+.18*(fbm(x*.03,z*.03,7304,2)-.5);
 h=mix(h,crest,smooth(-60,-18,rd)*smooth(55,12,rd));
 if(rd<-18)h=mix(crest,-60,smooth(-18,-420,rd));
 // the valleys' streams cut the reef: a channel off each mouth
 for(const V of VALLEYS){const dd=Math.hypot(x-V.mouth[0],z-V.mouth[1]);if(dd<400)h=Math.min(h,mix(h,-4,smooth(400,60,dd)*smooth(80,20,Math.abs((x-V.mouth[0])*Math.sin(V.a)-(z-V.mouth[1])*Math.cos(V.a)))));}
 return h;}
function landH(x,z){const sd=coastD(x,z),rd=reefD(x,z);
 let base=shoreH(sd);
 if(sd<0){const s=seaH(x,z,sd,rd),d=-sd;base=mix(base,s,smooth(6,45,d));}
 let h=base+Math.max(0,carvedH(x,z))*smooth(20,260,sd);
 const bkh=smooth(BENCH.r*1.1,BENCH.r*.7,Math.hypot(x-BENCH.x,z-BENCH.z))*smooth(-48,-28,sd)*smooth(45,22,sd);
 if(bkh>0){const lev=BENCH.level+.22*(fbm(x*.05,z*.05,7306,2)-.5)+.6*smooth(10,40,sd);h=mix(h,Math.max(lev,sd>0?h*.5+lev*.5:lev),bkh);
  if(sd<-14)h=mix(h,-.9,smooth(-14,-30,sd)*bkh);
  for(const P of POOLS){const d=Math.hypot(x-P.x,z-P.z);if(d<P.r*1.25)h=mix(h,P.floor,smooth(P.r*1.15,P.r*.55,d));}}
 if(nearGardens(x,z))for(const P of PLOTS){if(Math.abs(x-P.x)>P.r+4||Math.abs(z-P.z)>P.r+4)continue;const k=inPlot(P,x,z,1.8);if(k>0)h=mix(h,P.level,k);}
 return h;}
PLOTS.forEach(P=>{P.level=null;});
{const keep=PLOTS.slice();PLOTS.length=0;keep.forEach(P=>{P.ground=landH(P.x,P.z);});keep.forEach(P=>{P.level=P.ground-(P.key==='crop-rice'?.35:0);PLOTS.push(P);});}

// ---------------------------------------------------------------- the climate
// DRYNESS: the trade wind's rain on the windward flank and the crest; the lee in its shadow, driest on the west coast. The cloud belt keeps the crest wet
// on both sides (the plan: the rain shadow a sharp line across the crest, below the belt)
function dryAt(x,z,h){const east=smooth(-1300,400,x);
 return clamp(.66-.5*east-.24*smooth(430,820,h)+.16*smooth(-1700,-3200,x)+.08*(fbm(x*.0016+7,z*.0016-2,7401,2)-.5),0,1);}
const KOPPEN=['XA','Af','Am','Aw','XV','BSh','XS'];
function classesAt(x,z,h,sd){const D=dryAt(x,z,h),low=1-smooth(18,48,h);
 const wet=1-smooth(.26,.34,D),mon=smooth(.26,.34,D)*(1-smooth(.4,.47,D)),sav=smooth(.4,.47,D)*(1-smooth(.64,.72,D)),stp=smooth(.64,.72,D);
 return{'XA':wet*low,'Af':wet*(1-low),'Am':mon,'Aw':sav*(1-low),'XV':sav*low,'BSh':stp*(1-low),'XS':stp*low};}
// THE CLOUD BELT: where the crest stands in the trade wind's cloud (FIELD.cloud, 87; the fog belt, 89zz): above ~600 m and wet
const cloudAt=(x,z,h)=>smooth(560,760,h)*(1-smooth(.3,.46,dryAt(x,z,h)));

// ---------------------------------------------------------------- the station's knobs (src/ reads them)
// the basalt of the shield in the valley walls (KSTRATA, the row's "strata on the valley walls"): flows of 3-20 m with ash partings and scoria, made at
// first use (the ground's compile), the core's `rift-volcanic` recipe
let _STR=null;
Object.defineProperty(STATION,'strata',{get(){return _STR||(_STR=BIO.strata({recipe:'rift-volcanic',seed:7911,range:[-40,1150],res:.5,private:true}));}});
// the fog belt on the crest: the windward face's cloud between 560 and 1,100 m, clinging to the ground
STATION.belt=()=>({y0:560,y1:1100,windward:[1,0],density:.0016,depth:70,lee:.35,rise:.4,extent:[TERR.X0,TERR.Z0,TERR.X1,TERR.Z1],res:128,steps:8});
// the LOD spine: the places the views look at (the valleys, the crest, the gardens, the lee), not the whole shield
STATION.spine=(function(){const L=[];VALLEYS.forEach(V=>{L.push([mix(V.head[0],V.mouth[0],.15),mix(V.head[1],V.mouth[1],.15)]);if(V.i===2||V.i===1)L.push([mix(V.head[0],V.mouth[0],.55),mix(V.head[1],V.mouth[1],.55)]);});
 L.push([SHIELD.x+380,SHIELD.z],[SHIELD.x,SHIELD.z],[GARDEN.x,GARDEN.z],[GARDEN2.x,GARDEN2.z],[BENCH.x,BENCH.z],[-2100,450],[-3000,-250]);return L;})();
// the island's checks the high isle has nothing for: no mangal, no vent; its borrowed species include the island's mangrove, so not every one is placed
STATION.skip=['placed','mangal','thermal'];
STATION.night=['The high isle at night'];
const STATION_VIEWS=function(H){const V=VALLEYS[2],P=POOLS[0]||{x:BENCH.x,z:BENCH.z,level:BENCH.level},gy=(x,z)=>H.gh(x,z);
 const vm=[mix(V.head[0],V.mouth[0],.6),mix(V.head[1],V.mouth[1],.6)],vh=[mix(V.head[0],V.mouth[0],.2),mix(V.head[1],V.mouth[1],.2)];
 const cx=SHIELD.x+380,cz=SHIELD.z+60;
 return{
 'The high isle from the sea (windward)':[5600,420,-900,SHIELD.x,520,SHIELD.z],
 'The great valley (an amphitheatre head)':[vm[0],gy(vm[0],vm[1])+70,vm[1],V.head[0],vFloor(V,0)+220,V.head[1]],
 'The falls off the headwall':[vh[0],gy(vh[0],vh[1])+12,vh[1],V.head[0]-Math.cos(V.a)*V.W0*.9,shieldH(V.head[0]-Math.cos(V.a)*V.W0*.9,V.head[1]-Math.sin(V.a)*V.W0*.9)-60,V.head[1]-Math.sin(V.a)*V.W0*.9],
 'The cloud forest on the crest':[cx+70,gy(cx+70,cz+50)+4,cz+50,cx-40,gy(cx-40,cz-20)+6,cz-20],
 'The rain shadow (the lee\'s savanna)':H.toward(-2100,450,-2400,300,180,25,2),
 'The hot steppe on the lee coast':H.toward(-3000,-250,-3250,-350,120,12,1),
 'Coffee and cloves on the lee terraces':H.toward(GARDEN2.x+Math.cos(GARDEN2.a)*90,GARDEN2.z+Math.sin(GARDEN2.a)*90,GARDEN2.x,GARDEN2.z,100,40,0),
 'The village gardens':H.toward(GARDEN.x+150,GARDEN.z-120,GARDEN.x,GARDEN.z,180,70,0),
 'The tide pools':[P.x+7,BENCH.level+1.8,P.z+5,P.x,P.level-.2,P.z],
 'The high isle at night':[-5200,380,2600,SHIELD.x,400,SHIELD.z]};};
STATION.views=STATION_VIEWS;
// THE STREAMS' PLUMES (core/water ext/61, tintFlow; BACKPORT.md section 5: a river meeting the sea takes the plume): each valley's stream carries the
// shield's red-brown soil out from its mouth over the reef in a tongue that fans and thins over ~500 m, on a current running out along the valley's line
// and spreading; the sea's tint (89w reads STATION.seaOpts). ?plume=0 none
STATION.seaOpts=function(){if(new URLSearchParams(location.search).get('plume')==='0')return{};
 const col=new THREE.Color(0x8a6a48).convertSRGBToLinear().getHex(),loc=(V,x,z)=>{const rx=x-V.mouth[0],rz=z-V.mouth[1],ux=Math.cos(V.a),uz=Math.sin(V.a);return[rx*ux+rz*uz,-rx*uz+rz*ux];};
 const aOf=(x,z)=>{let a=0;for(const V of VALLEYS){const q=loc(V,x,z);if(q[0]<-80||q[0]>700)continue;const w=30+.4*Math.max(0,q[0]);a=Math.max(a,.62*smooth(-50,20,q[0])*smooth(560,90,q[0])*Math.exp(-(q[1]*q[1])/(w*w)));}return a;};
 return{tint:{box:[TERR.X0,TERR.Z0,TERR.X1,TERR.Z1],cell:16,at:(x,z)=>{const a=aOf(x,z);return a>.01?{c:col,a}:null;}},
  tintFlow:{cell:24,v:(x,z)=>{for(const V of VALLEYS){const q=loc(V,x,z);if(q[0]<-80||q[0]>800)continue;const w=30+.4*Math.max(0,q[0]);if(Math.abs(q[1])>w*2.5)continue;
   const s=.5*smooth(800,60,q[0]),sp=.35*Math.tanh(q[1]/w),ux=Math.cos(V.a),uz=Math.sin(V.a);return[(ux-uz*sp)*s,(uz+ux*sp)*s];}return null;}}};};
