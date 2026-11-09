// ================================================================= HOST — stage: STATION 1, THE FOG WALL (PLAN.md section 9)
// The ideal-type host for the Outlands' first station: everything a world provides that a biome does not. Renderer, lights, haze,
// the land with terrainH(), the wadi pools' waterH(), the fields the kit reads, the tick list, the error panel. A real world
// replaces this whole section with its own; the kit's fragments read it only through BIO.host.
//
// THE SITE: the S basin's windward wall, from the Fog Rim (S1, legacy px 1337,393; 5.1 px 1609,723: Dfb 3,883 m, 1,176 mm, 0.98
// atm) down to the Gem Hills' dry shoulder (S4, legacy px 1352,391; 5.1 px 1624,721: BWk 2,274 m, 141 mm, 1.20 atm). The model
// puts them ~30 km apart; the owner's call (2026-11-09) is that the slope fits ONE page, so the page holds the whole fall at its
// true heights in 7 km: about 4.4x steeper than the model's (KNOWN_ISSUES.md says so).
// THE MAP (x east, z south, north is -z; origin at the map's centre, R 3400):
//   THE CREST      z < -2700: the wall's top at ~4.4-4.5 km, rounded, in and above the fog belt's top
//   THE FOG WALL   z -2700..-500: the wall falls ~1 km, benched on its beds (the strata's ledges), cut by three ravines; the FOG BELT
//                  (3.5-4.4 km, ATMOS.fogBelt in 89z) lies on it: Z3, the veil colonies' ground
//   THE MAST BAND  z -500..900: the slope under the belt (3.45-2.95 km), wet from the seeps and the ravines' water: Z2's mast colonies
//   THE SHOULDER   z > 900: the dry gem shoulder (2.95-2.33 km, Z5), red beds and their copper bands, three buttes, an open-cast pit,
//                  and the ravines run on as WADIS (KRELIEF.wadi) with braided cobble floors to fans at the map's south edge
// Every height is the model's own (page y = metres above sea level). The rock is core/terrain's KSTRATA 'outland' recipe (C3): red
// beds at the foot, pale tuffs, red basalt on top, thin copper and turquoise bands.
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r&&y>=(r.y||0)-2&&y<=(r.y||0)+r.h+5;}

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;document.body.appendChild(renderer.domElement);
// THE LIGHT: about 1 atm at the belt, 1.2 at the shoulder; the air is dry below the fog and the sun hard on the red rock, soft in the belt
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xc9ccd2);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00011);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,18000);
scene.add(new THREE.HemisphereLight(0xb8c6e2,0x8a6a58,.84));
const SUN_POS=[-900,1100,900];   /* from the south-west: the wall faces south, into the sun and the wet wind */
const sun=new THREE.DirectionalLight(0xfff2e0,1.3);sun.position.set(...SUN_POS);scene.add(sun);
const fill=new THREE.DirectionalLight(0xdcd4cc,.2);fill.position.set(300,-100,1000);scene.add(fill);

// ---------------------------------------------------------------- the land
const TERR={R:3400};
const FOG_Y0=3500,FOG_Y1=4400;   /* the fog belt (PLAN.md section 3, Z3); 89z draws it with ATMOS.fogBelt on the same band */
const CLOUD_Y=-1e5;              /* no cloud deck on this stage */
// the bands' line wanders with x: zz is z moved by it, so a band's edge is not straight
const zz=(x,z)=>z+130*Math.sin(x*.00105+.7)+70*Math.sin(x*.0031+2.1)+90*(fbm(x*.0007+3,z*.0007-2,401,2)-.5);
// THE RAVINES down the wall, each running on as a wadi across the shoulder: x of its line at z
const RAV=[{x0:-1650,a:110,f:.0017,ph:.3,w:70},{x0:250,a:140,f:.0013,ph:1.7,w:85},{x0:1850,a:90,f:.0021,ph:2.9,w:60}];
const ravX=(R,z)=>R.x0+R.a*Math.sin(z*R.f+R.ph)+R.a*.3*Math.sin(z*R.f*2.7+R.ph*1.9);
// the ravine's cut: deepest on the wall (90 m), shallower on the mast band (35 m), handing over to the wadi below z 800
function ravCut(x,z){let c=0;const q=zz(x,z);
 for(const R of RAV){const d=Math.abs(x-ravX(R,z));if(d>R.w*2.5)continue;
  const dep=95*smooth(-2900,-2500,q)*smooth(-300,-700,q)+38*smooth(-800,-400,q)*smooth(900,600,q);
  c=Math.max(c,dep*Math.pow(smooth(R.w*2.4,0,d),1.4));}
 return c;}
// THE BUTTES on the shoulder: flat-topped, their sides the red beds' ledges
const BUTTES=[{x:-1150,z:2050,r:260,h:75,s:1.1,name:'The Broad Butte'},{x:1050,z:2650,r:170,h:55,s:2.3},{x:2600,z:1700,r:210,h:62,s:3.7}];
// the slope before the buttes, ravines and wadis: four bands summed (smooth falls, so the treads and risers join without a crease)
function slopeH(x,z){const q=zz(x,z);
 return 2330+620*smooth(3700,700,q)+520*smooth(850,-600,q)+1000*smooth(-450,-2750,q)+90*smooth(-2600,-3400,q)
  +40*(fbm(x*.0011+5,z*.0011+1,403,3)-.5)+16*(fbm(x*.004-3,z*.004+7,405,2)-.5);}
function butteAt(x,z){let k=0,top=0,side=0;
 for(const B of BUTTES){const dx=x-B.x,dz=z-B.z,D=Math.hypot(dx,dz);if(D>B.r*1.4)continue;const a=Math.atan2(dz,dx),
  d=D/(B.r*(1+.13*Math.sin(3*a+B.s)+.07*Math.sin(5*a+2*B.s)+.08*(fbm(x*.01+B.s,z*.01,407,2)-.5))),f=smooth(1.06,.86,d);
  if(f>k){k=f;top=slopeH(B.x,B.z)+B.h;side=smooth(.7,.95,d)*smooth(1.1,.95,d);}}
 return{k,top,side};}
// THE ROCK: the 'outland' suite over the station's range; ledges where the rock shows (S.terrace: monotone, no new hollows)
const STRATA=KSTRATA.create({seed:5101,recipe:'outland',range:[2050,4750],dip:[.6,.8,.006],warp:[7,2]});
function land0(x,z){let h=slopeH(x,z)-ravCut(x,z);const B=butteAt(x,z);if(B.k>0)h=mix(h,Math.max(h,B.top+3*(fbm(x*.02,z*.02,409,2)-.5)),B.k);
 return h;}
const _ledgeK=(x,z,h)=>{const q=zz(x,z);return .65*smooth(-400,-800,q)*smooth(-2850,-2500,q)+.75*butteAt(x,z).side;};
function land1(x,z){const h=land0(x,z),k=_ledgeK(x,z,h);return k>.02?STRATA.terrace(x,z,h,k):h;}
// THE WADIS (KRELIEF.wadi, C4): each ravine's line from the mast band's foot down the shoulder off the map's south edge, its fan there
const WADIS=RAV.map((R,i)=>{const pts=[];for(let z=750;z<=3700;z+=40)pts.push([ravX(R,z),z]);
 return KRELIEF.wadi({pts,ground:land1,w:9+3*i,bank:2.2,bankW:3.5,braids:2.2,pools:.55,fan:{r:240,slope:.03},seed:5200+i});});
// THE OPEN-CAST PIT (KRELIEF.pit, C4): the Peak tribe's working on a copper-banded spur of the shoulder, its spoil tipped beside it
const PIT=KRELIEF.pit({c:[-2350,2750],r:115,depth:42,e:1.3,ground:land1,spoil:{n:3,dist:[1.35,1.9],r:[.22,.36],h:[7,15]},seed:5301});
const landH=KRELIEF.apply(land1,[PIT].concat(WADIS));
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=landH(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
const plateauH=slopeH;   /* 84/85's name for the land before the cuts */
// the wadis' pools after rain (the wadi records' own): the bell pools' lips
const POOLS=[];WADIS.forEach((W,i)=>W.pools.forEach((P,k)=>{if(Math.abs(P.x)<TERR.R*1.05&&Math.abs(P.z)<TERR.R*1.05)POOLS.push({x:P.x,z:P.z,r:P.r,l:P.y,wadi:i,k});}));
function waterH(x,z){for(let i=0;i<POOLS.length;i++){const P=POOLS[i];if(Math.abs(x-P.x)<P.r&&Math.abs(z-P.z)<P.r&&Math.hypot(x-P.x,z-P.z)<P.r*.95)return P.l;}return -1e9;}
// the wadi colonies' seeds, one every ~380 m down each wadi's floor line (OUTL.SEEDS: the colony pass takes them, 60)
const WADI_SEEDS=[];WADIS.forEach((W,i)=>{for(let k=8;k<W.pts.length;k+=9){const p=W.pts[k];WADI_SEEDS.push({id:'w'+i+'_'+k,x:p.x,z:p.z,type:'wadi'});}});
// a landform part at a point: the wadi's floor, bar, bank or fan; the pit's bench, face, floor or spoil
const _pm={x:NaN,z:NaN,p:null};
function partAt(x,z){if(x===_pm.x&&z===_pm.z)return _pm.p;_pm.x=x;_pm.z=z;return(_pm.p=partAt0(x,z));}
function partAt0(x,z){const g=land1(x,z);for(let i=0;i<WADIS.length;i++){const p=KRELIEF.at(WADIS[i],x,z,g);if(p){p.kind='wadi';p.wadi=i;return p;}}
 const p=KRELIEF.at(PIT,x,z,g);if(p)p.kind='pit';return p;}

// ---------------------------------------------------------------- the fields (cached below; these are the definitions)
// The kit's names (biomes/WORLD.md) and the Outlands' own (PLAN.md section 3):
//   fog      the fog belt's cover: between FOG_Y0 and FOG_Y1, thickest on the faces turned south (to the wind), thinning to its top,
//            carried a little way down the ravines (their air drains the cloud)
//   seep     wet streaks: the ravines' floors on the wall and the mast band, and the foot of every bench (a hard bed over a soft one)
//   ore      copper or turquoise within 6 m under the ground where the rock shows (a bed of the strata's copper kinds), or fresh rock in
//            the pit and on its spoil: the miners' ground (the copper colony's lace crust)
//   wadi     the wadi's floor and bars (1), its banks and fan (.5); pit 1 in the pit and on its spoil
//   band     0 the shoulder, 1 the mast band, 2 the wall: the slope's band by height, for the paint and the zones
const ASPECT=(x,z)=>{const e=8,gx=(slopeH(x+e,z)-slopeH(x-e,z))/(2*e),gz=(slopeH(x,z+e)-slopeH(x,z-e))/(2*e),g=Math.hypot(gx,gz);return g<1e-4?0:clamp(-gz/g,-1,1)*smooth(.02,.12,g);};   /* +1: faces south (downhill to +z) */
function oreAt(x,z,h,rock,part){if(part&&part.kind==='pit'||part&&(part.part==='face'||part.part==='bench'||part.part==='spoil'))return 1;
 if(rock<.15)return 0;let o=0;const A={};
 for(let k=0;k<=6;k+=1.5){STRATA.at(x,h-k,z,A);if(A.kind==='copper'||A.kind==='turq'){o=1-k/9;break;}}
 return o*smooth(.15,.45,rock);}
function fieldsAt(x,z,h,slope){const q=zz(x,z),B=butteAt(x,z),part=partAt(x,z);
 const band=h>FOG_Y0-60?2:h>2950?1:0,asp=ASPECT(x,z);
 let rv=0;for(const R of RAV){const d=Math.abs(x-ravX(R,z));rv=Math.max(rv,smooth(R.w*1.6,R.w*.2,d));}
 const inBelt=smooth(FOG_Y0-120,FOG_Y0+120,h)*smooth(FOG_Y1+150,FOG_Y1-80,h);
 const fog=clamp(inBelt*(.72+.28*asp)+rv*.35*smooth(FOG_Y0-450,FOG_Y0,h)*smooth(FOG_Y1,FOG_Y0,h)+.06*(fbm(x*.002,z*.002,411,2)-.5),0,1);
 /* the wall is ~4.4x steeper than the model's (KNOWN_ISSUES.md), so bare rock is the benches' risers only: past .75, not past .5 */
 const rock=clamp(Math.max(smooth(.75,1,slope)*.85,B.side*.8,part&&part.part==='face'?.9:0,part&&part.part==='bank'?.35:0),0,1);
 const wpart=part&&part.kind==='wadi'?part.part:null,wadi=wpart==='floor'||wpart==='bar'?1:wpart==='bank'||wpart==='fan'?.5:0;
 const pit=part&&part.kind==='pit'?1:0;
 const seep=clamp(rv*smooth(2900,3200,h)*.9+_ledgeK(x,z,h)*smooth(.35,.6,slope)*.25*(.5+fbm(x*.01,z*.01,413,2)),0,1);
 const mastB=smooth(2900,3050,h)*smooth(FOG_Y0+80,FOG_Y0-200,h);
 const dry=smooth(3050,2850,h);
 const wet=clamp(.18+.62*fog+.45*seep+.3*mastB-.12*dry+.3*wadi*(.3),0,1);
 return{wet,flow:Math.max(seep,wadi*.4),upland:clamp((h-2300)/2200,0,1),canyon:rv,rim:smooth(-2500,-2900,q),rock,dune:0,oasis:0,slope,abyss:0,salt:0,
  cold:clamp((h-3000)/1800,0,1),geo:0,barren:clamp(dry*.6+pit*.4,0,1),fog,seep,ore:oreAt(x,z,h,rock,part),wadi,pit,band,mast:mastB,dry,butte:B.k};}
const SLOPEK=1.0;
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','geo','barren','fog','seep','ore','wadi','pit','band','mast','dry','butte'];
const FC=(function(){const N=400,S=TERR.R*2.2,a={};FNAMES.forEach(n=>a[n]=new Float32Array(N*N));a.h=new Float32Array(N*N);
 const cs=S/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){a.h[j*N+i]=terrainH((i/(N-1)-.5)*S,(j/(N-1)-.5)*S);}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=(i/(N-1)-.5)*S,z=(j/(N-1)-.5)*S,k=j*N+i;
  const hx=a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)],hz=a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i],slope=clamp(Math.hypot(hx,hz)/(2*cs)*SLOPEK,0,1);
  const F=fieldsAt(x,z,a.h[k],slope);FNAMES.forEach(n=>a[n][k]=F[n]);}
 const L={x:NaN,z:NaN,k:0,fu:0,fv:0};
 const at=(arr,x,z)=>{if(x!==L.x||z!==L.z){const u=clamp((x/S+.5)*(N-1),0,N-1.001),v=clamp((z/S+.5)*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v);L.x=x;L.z=z;L.k=j*N+i;L.fu=u-i;L.fv=v-j;}
  const k=L.k,fu=L.fu,fv=L.fv;return arr[k]*(1-fu)*(1-fv)+arr[k+1]*fu*(1-fv)+arr[k+N]*(1-fu)*fv+arr[k+N+1]*fu*fv;};
 return{N,S,a,at};})();
const FIELD={};FNAMES.forEach(n=>FIELD[n]=(x,z)=>FC.at(FC.a[n],x,z));
// the exact parts and the ore near the eye (the cached fields are 18 m cells: a wadi's floor and a copper band are narrower)
const EXACT={part:partAt,ore:(x,z)=>{const h=terrainH(x,z),p=partAt(x,z);return oreAt(x,z,h,FIELD.rock(x,z),p);}};
// handed to the kit as fields (BIO.field): wadiX the wadi's floor (1), banks (.5) and fan (.25) exactly; oreX the ore exactly
FIELD.wadiX=(x,z)=>{const p=partAt(x,z);return p&&p.kind==='wadi'?(p.part==='floor'||p.part==='bar'?1:p.part==='fan'?.25:.5):0;};   /* floor 1, bank .5, fan .25 */
FIELD.oreX=EXACT.ore;

// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
// the LOD spine: across each band, down each ravine and wadi, round the buttes and the pit
const SPINE=[];
for(let x=-2800;x<=2800;x+=700)for(const z of[-2200,-1300,-500,300,1300,2300,3000])SPINE.push([x,z]);
RAV.forEach(R=>{for(let z=-2600;z<=3200;z+=450)SPINE.push([ravX(R,z),z]);});
BUTTES.forEach(B=>SPINE.push([B.x,B.z]));SPINE.push(PIT.c.slice());
// the mask: nothing roots in a pool
function rootMask(x,z){const h=terrainH(x,z),d=h-waterH(x,z);return d<.15?0:d<.7?(d-.15)/.55:1;}
BIO.init({tags:'outlands',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:rootMask,
 obstacles:OBSTACLES,ticks:tick,seed:5100,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,capThrow:false,
 lod:{hero:240,mid:600,far:2600,floor:[180,460]},windows:{}});
{const Q=new URLSearchParams(location.search);BIO.INDEX_ITEMS=Q.get('index')!=='0';
 BIO.LOD.merge=Q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&Q.get('lodfade')!=='0'?.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&Q.get('lodcull')!=='0';}
BIO.setSun(SUN_POS);
