// ================================================================= HOST — stage: the Slabfields' stations (PLAN.md sections 5, 6 and 13; 2026-11-12)
// The ideal-type host for one station: the renderer, the light, the land drawn from its site record (40: SLAB_SITES), the apron's blocks as KSTACKS
// records, the climate fields and the biome core's binding. Started from biomes/highrift's stage (the same shape of page).
//   foot   THE ANVIL'S FOOT (station 1): the Anvil's north cliff along the page's south edge, KRELIEF.scarp (2 km of flood basalt, three flow-top
//          ledges, ravines and buttresses, a talus skirt) on a lobate front, its ramp falling 7 degrees south behind the rim; the last landslide's
//          apron filling the page north of the foot (hummocks, flow-parallel furrows near the foot, transverse ridges and a raised rim at the toe,
//          levees on its flanks) with field-sized blocks riding on it; the spring line at the toe, its seeps and a brook running off north
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
const SKEY=typeof STATION_KEY!=='undefined'?STATION_KEY:'foot',SITE=SLAB_SITES[SKEY];
const STATION_REGION=SITE.name+' (the Slabfields, station '+SITE.station+'; ideal type)';
const WORLD=KRAND.hash(1662,1369,513);   /* the page's world seed: the station's 5.1 px and the edit that made it */

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
{const q=new URLSearchParams(location.search);BIO.INDEX_ITEMS=q.get('index')!=='0';
 BIO.LOD.merge=q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&q.get('lodfade')!=='0'?.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&q.get('lodcull')!=='0';}
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;document.body.appendChild(renderer.domElement);
// THE LIGHT: 1.07 atm, dry (141 mm): a deep sky and a hard sun; dust off the apron the only haze
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xd8dadc);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00008);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,30000);
scene.add(new THREE.HemisphereLight(0xcad8ec,0xa49c90,.74));
const sun=new THREE.DirectionalLight(0xffffff,1.3);sun.position.set(-900,1300,-700);scene.add(sun);
const fill=new THREE.DirectionalLight(0xe0e4f0,.18);fill.position.set(700,300,900);scene.add(fill);

// ---------------------------------------------------------------- the land
const TERR={R:2600};
const SNOW_LINE=SITE.snow;
const n2=(x,z,f,seed)=>fbm(x*f,z*f,seed,2)-.5;
const L=(function(){const S=SITE,SL=S.slab,AP=S.apron;
 if(SKEY!=='foot')throw new Error('no station '+SKEY);
 // THE BENCH: the middle bench's flood-basalt plain, 3.29 km, rising 4 m a km toward the slab
 const bench=(x,z)=>S.base+.004*z+7*n2(x,z,.0011,61)+2*n2(x,z,.009,62);
 // THE CLIFF: the slab's rim on its lobate front (the front bows out north at the slab's middle, PLAN.md 3.4), the plateau (the slab) on the south
 const rimZ=x=>SL.rimZ+SL.bow*Math.pow(x/SL.half,2);
 const pts=[];for(let x=-16000;x<=16000;x+=1000)pts.push([x,rimZ(x)]);
 // THE CLIFF (KRELIEF.slab, core/terrain 38d; the owner, 2026-11-12: one scarp profile read as broad, regular panels): a row of spurs,
 // each its own run, power, height, projection and fall to its nose; gullies cut back between them with scree cones at their mouths; five
 // ledges that wander and fade along the strike; a ragged crest, a rough and fluted face; the ramp behind the rim at the slab's dip; and
 // over the apron's head the fresh scar the last collapse left (the apron's lobe is centred at x0: arc length x0 + 16 km on this line)
 const W=KRELIEF.slab({pts,side:1,h:SL.h,run:SL.run,dip:SL.dip,seed:KRAND.hash(WORLD,1,51),
  spurs:{sp:520,spread:[.4,1.9],w:[.7,.97],out:[20,170],run:[.65,1.6],power:[1,1.9],dh:[-.08,.03],tip:[.02,.12]},gullies:{back:[20,130]},   /* broad spurs, few deep slots */
  cones:{h:[50,150],reach:[160,360]},skirt:{h:SL.talus.h/SL.h,reach:SL.talus.reach/SL.run},
  scars:[{s:AP.x0+16000,w:900,back:170,run:.6}]});
 const footZ=x=>rimZ(x)-SL.run;
 // THE APRON: the last collapse's lobe, t 0 at the cliff's foot to 1 at the toe, u across (-1..1 its flanks)
 const hwAt=t=>lerp(AP.half[0],AP.half[1],clamp(t,0,1));
 function apronQ(x,z){const t=(footZ(x)-z)/AP.run,u=(x-AP.x0)/hwAt(t);const r=t<.55?Math.abs(u):Math.hypot(u,(t-.55)/.45);return{t,u,r};}
 function apronT(x,z){const q=apronQ(x,z);if(q.t<-.06||q.r>1.03)return 0;const t=clamp(q.t,0,1),au=Math.abs(q.u);
  const edge=smooth(1.0,.95,q.r)*smooth(-.06,.04,q.t);if(edge<=0)return 0;
  let T=AP.foot*(1-.5*t)+AP.foot*(AP.rim-1)*Math.exp(-Math.pow((t-.92)/.05,2))*smooth(.75,.85,1-au*.5);   /* thinning away from the foot; the raised distal rim */
  T+=AP.levee*Math.exp(-Math.pow((au-.86)/.07,2))*(1-smooth(.7,.95,t));   /* the levees along the flanks */
  const hum=fbm(x*.0065,z*.0065,71,3)-.45;T+=AP.hummock*Math.max(-.3,hum)*2*(.35+.65*t);   /* the hummocks: hills of crushed rock */
  T+=5*Math.sin(q.u*38)*(1-smooth(.2,.5,t))*smooth(.02,.12,t);   /* furrows along the run near the foot */
  T+=6*Math.sin(t*AP.run/48+2*n2(x,z,.004,72))*smooth(.68,.86,t);   /* transverse ridges where the lobe slowed */
  T+=3*n2(x,z,.03,73);return Math.max(0,T*edge);}
 /* the toe: where the drawn lobe ends, marched north from mid-run (the closed form missed the hummocks' edge by tens of metres) */
 const toeZ=x=>{const u=(x-AP.x0)/hwAt(.92);if(Math.abs(u)>=1)return null;let z=footZ(x)-AP.run*.5;const zEnd=footZ(x)-AP.run*1.15;
  while(z>zEnd&&apronT(x,z)>.3)z-=5;return z<=zEnd?null:z;};
 // THE SPRING LINE: seeps just past the toe (where the rubble's water meets the bench's tight basalt), each a hollow a metre or two deep
 const SP=S.seeps,SEEPS=[];
 for(let i=0;i<SP.n;i++){const h=k=>KRAND.hash(WORLD,7,i*8+k)/4294967296;const x=lerp(SP.from,SP.to,(i+.25+.5*h(0))/SP.n),tz=toeZ(x);if(tz==null)continue;
  const z=tz-18-40*h(1),r=lerp(SP.r[0],SP.r[1],h(2));SEEPS.push({x,z,r,level:bench(x,z)-.5,i});}
 // THE BROOK: the seeps gathered and running off north-west down the bench's fall (4 m a km)
 const s0=SEEPS[Math.floor(SEEPS.length/2)],BR=[[s0.x,s0.z],[s0.x-260,s0.z-260],[s0.x-420,-2860]],brookL=[];
 for(let i=0;i+1<BR.length;i++){const a=BR[i],b=BR[i+1],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/20);for(let k=(i?1:0);k<=n;k++){const t=k/n,x=lerp(a[0],b[0],t),z=lerp(a[1],b[1],t);
  brookL.push([x+6*Math.sin(z*.02),z]);}}
 const brookBed=(i)=>s0.level-.3-.004*Math.max(0,s0.z-brookL[i][1]);
 const nearBrook=(x,z)=>{let best=1e9,bi=0;for(let i=0;i<brookL.length;i+=1){const d=Math.hypot(x-brookL[i][0],z-brookL[i][1]);if(d<best){best=d;bi=i;}}return{d:best,i:bi};};
 function land(x,z){const g=bench(x,z);let y=KRELIEF.shape(W,x,z,g);   /* the ramp's dip and the face's noise are the slab's own */
  y+=apronT(x,z);
  for(const s of SEEPS){const d=Math.hypot(x-s.x,z-s.z);if(d<s.r*2.2)y=Math.min(y,mix(s.level-1.6*(1-Math.pow(Math.min(1,d/s.r),2)),y,smooth(s.r*.9,s.r*2.2,d)));}
  if(z<s0.z+30){const b=nearBrook(x,z);if(b.d<14)y=Math.min(y,mix(brookBed(b.i),y,smooth(SITE.brook.w*.5,14,b.d)));}
  return y;}
 function water(x,z){for(const s of SEEPS)if(Math.hypot(x-s.x,z-s.z)<s.r*.95)return s.level;
  if(z<s0.z+10){const b=nearBrook(x,z);if(b.d<SITE.brook.w*.5)return brookBed(b.i)+.35;}return -1e9;}
 const spine=[[0,footZ(0)-300],[0,toeZ(0)||-2000],[-1500,footZ(-1500)-1600],[1500,footZ(1500)-1600]].concat(SEEPS.map(s=>[s.x,s.z]));   /* every seep a LOD origin: its reed is near-field life */
 return{land,water,bench,rimZ,footZ,toeZ,apronT,apronQ,W,SEEPS,brookL,brookBed,s0,farBase:S.base,spine};})();
// THE BLOCKS: field-sized blocks of the slab's own basalt riding on the apron (KSTACKS buttes: a block is two or three flows still bedded, rotated as
// it came down). Each from KRAND.hash(world, index, try); kept apart with KSPACE; the big ones on the distal half, where a sturzstrom drops its largest
const BLOCKS=(function(){const B=SITE.blocks,AP=SITE.apron,out=[],SPC=KSPACE.create({cell:80});   /* the apron's blocks, then the talus's */
 for(let i=0;i<B.n;i++){const big=i<B.big;
  for(let k=0;k<40;k++){const h=j=>KRAND.hash(WORLD,1000+i,k*16+j)/4294967296;
   const t=big?lerp(.45,.9,h(0)):lerp(.05,.95,h(0)),u=lerp(-.85,.85,h(1)),x=AP.x0+u*lerp(AP.half[0],AP.half[1],t)*.92,z=L.footZ(x)-t*AP.run;
   const r=big?lerp(B.bigR[0],B.bigR[1],h(2)):lerp(B.r[0],B.r[1],h(2)),H=big?lerp(B.bigH[0],B.bigH[1],h(3)):lerp(B.H[0],B.H[1],h(3));
   if(L.apronT(x,z)<20)continue;
   if(SPC.some(x,z,r+60,o=>Math.hypot(o.x-x,o.z-z)<o.r+r+15))continue;
   let y0=1e9;for(let a=0;a<12;a++){const an=a/12*TAU;y0=Math.min(y0,L.land(x+Math.cos(an)*r,z+Math.sin(an)*r));}
   const ry=h(4)*TAU,e=lerp(1,1.7,h(5)),split=h(6)<.55;
   const tiers=split?[{h:H*.62,r,e,ry},{h:H*.38,r:r*lerp(.55,.85,h(7)),e:e*lerp(.9,1.2,h(8)),ry:ry+lerp(-.4,.4,h(9)),dx:lerp(-.15,.15,h(10))*r,dz:lerp(-.15,.15,h(11))*r}]:[{h:H,r,e,ry}];
   /* BROKEN BASALT, not a pile of beds (the owner, 2026-11-12): one or two thick beds (a block broken across a flow), columnar
      jointing on its walls (the colonnade's prisms, o.columns), squared corners (footR's superellipse) and crisp edges (the chamfer
      and the partings' notch cut to a third) */
   let S=null;try{S=KSTACKS.make({kind:'butte',id:'block'+i,x,z,y0:y0-1.5,seed:KRAND.hash(WORLD,1100+i,7),tiers,bed:[H*.45,H*.75],lobes:.035,weather:0,
    columns:{w:[1.4,2.8],d:.4,ent:.4}});}catch(e){continue;}
   S.beds.forEach((b,k)=>{b.sq=lerp(6,11,KRAND.hash(WORLD,1300+i,k)/4294967296);b.ch*=.3;b.nt*=.3;});
   S.name=big?'A field-sized block of the Anvil\'s basalt ('+Math.round(r*2)+' m across, '+Math.round(H)+' m high)':'A block of the Anvil\'s basalt ('+Math.round(H)+' m)';
   S.big=big;S.r=r;out.push(S);SPC.insert(S,x,z,r);break;}}
 // THE TALUS'S FRESH BLOCKS: the rockfall's latest, lying on the skirt under the face (2-4 a 500 m length; spires and small buttes, 3-9 m)
 for(let x=-2500;x<=2500;x+=500){const n=2+Math.floor(KRAND.hash(WORLD,1500,x+3000)/4294967296*3);
  for(let k=0;k<n;k++){const h=j=>KRAND.hash(WORLD,1500+k,(x+3000)*8+j)/4294967296;const bx=x+lerp(-220,220,h(0)),bz=L.footZ(bx)-lerp(40,SITE.slab.talus.reach*.75,h(1)),r=lerp(3,8,h(2)),H=lerp(3,9,h(3));
   if(SPC.some(bx,bz,r+20,o=>Math.hypot(o.x-bx,o.z-bz)<o.r+r+4))continue;
   let y0=1e9;for(let a=0;a<8;a++){const an=a/8*TAU;y0=Math.min(y0,L.land(bx+Math.cos(an)*r,bz+Math.sin(an)*r));}
   let S=null;try{S=KSTACKS.make({kind:'butte',id:'talus'+x+'_'+k,x:bx,z:bz,y0:y0-1,seed:KRAND.hash(WORLD,1600+k,x+3000),tiers:[{h:H,r,e:lerp(1,1.5,h(4)),ry:h(5)*TAU}],bed:[H,H],lobes:.03,weather:0});}catch(e){continue;}
   S.beds.forEach(b=>{b.sq=lerp(6,12,h(6));b.ch*=.25;b.nt*=.2;});   /* fresh: sharp and squared */
   S.name='A block fallen from the face (fresh: no lichen on it)';S.big=false;S.talus=true;S.r=r;out.push(S);SPC.insert(S,bx,bz,r);}}
 return out;})();
function landH(x,z){return L.land(x,z);}
function floor0(x){return L.farBase;}
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;let h=L.land(x,z);const b=KSTACKS.topAt(BLOCKS,x,z);if(b>h)h=b;_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function waterH(x,z){return L.water(x,z);}

// ---------------------------------------------------------------- the climate fields (the field contract's units: core/biome/README.md)
//   cold    the cold, 0..1 by height over the station's own snow line
//   wet     the seeps and the brook; the blocks' shade (the voids keep their damp); the rest of the bench dry (141 mm)
//   rock    the steeps: the cliff, the talus, the blocks; the apron's rubble half rock everywhere
//   canyon  THE SHADE: the north and the lee of a block, where the void ferns grow (the kit reads it as `shade`)
//   rim     THE APRON: the share of the last collapse's rubble under a point (0 off it)
//   geo     no vents here: 0
function nearBlock(x,z){let best=null,bd=1e9;for(const S of BLOCKS){const d=Math.hypot(x-S.x,z-S.z)-S.r;if(d<bd){bd=d;best=S;}}return{S:best,d:bd};}
function fieldsAt(x,z,h,slope){
 const w=waterH(x,z),wd=w>-1e8?0:1;let near=0;
 for(let k=0;k<8&&wd;k++){const a=k/8*TAU;if(waterH(x+Math.cos(a)*25,z+Math.sin(a)*25)>-1e8){near=Math.max(near,.85);break;}}
 for(let k=0;k<8&&wd&&near<.8;k++){const a=k/8*TAU;if(waterH(x+Math.cos(a)*80,z+Math.sin(a)*80)>-1e8){near=Math.max(near,.45);break;}}
 const nb=nearBlock(x,z),shade=nb.S?smooth(nb.S.r*.9,0,nb.d)*(.55+.45*smooth(-.2,.6,(nb.S.z-z)/(nb.S.r+1))):0;   /* strongest on a block's north side */
 const ap=smooth(0,25,L.apronT(x,z));
 const rock=clamp(Math.max(smooth(.5,.82,slope),smooth(.35,.6,slope)*.45,ap*.42),0,1);
 const wet=clamp(.1+.65*near+.35*shade+.05*ap-.15*rock+.05*n2(x,z,.002,131),0,1);
 return{wet,flow:0,upland:1,canyon:shade,rim:ap,rock,dune:0,oasis:0,slope,abyss:0,salt:0,cold:clamp(.5+(h-SITE.snow[0])/1400+(SITE.temp.mean<3?.25:0),0,1),geo:0,barren:0,fog:0,mist:0,flat:0};}
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','geo','barren','fog','mist','flat'];
const FC=(function(){const N=400,S=TERR.R*2.2,a={};FNAMES.forEach(n=>a[n]=new Float32Array(N*N));a.h=new Float32Array(N*N);
 const cs=S/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){a.h[j*N+i]=terrainH((i/(N-1)-.5)*S,(j/(N-1)-.5)*S);}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=(i/(N-1)-.5)*S,z=(j/(N-1)-.5)*S,k=j*N+i;
  const hx=a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)],hz=a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i],slope=clamp(Math.hypot(hx,hz)/(2*cs)*1.6,0,1);
  const F=fieldsAt(x,z,a.h[k],slope);FNAMES.forEach(n=>a[n][k]=F[n]);}
 const Lc={x:NaN,z:NaN,k:0,fu:0,fv:0};
 const at=(arr,x,z)=>{if(x!==Lc.x||z!==Lc.z){const u=clamp((x/S+.5)*(N-1),0,N-1.001),v=clamp((z/S+.5)*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v);Lc.x=x;Lc.z=z;Lc.k=j*N+i;Lc.fu=u-i;Lc.fv=v-j;}
  const k=Lc.k,fu=Lc.fu,fv=Lc.fv;return arr[k]*(1-fu)*(1-fv)+arr[k+1]*fu*(1-fv)+arr[k+N]*(1-fu)*fv+arr[k+N+1]*fu*fv;};
 return{N,S,a,at};})();
const FIELD={};FNAMES.forEach(n=>FIELD[n]=(x,z)=>FC.at(FC.a[n],x,z));
FIELD.shade=FIELD.canyon;FIELD.apron=FIELD.rim;   /* the kit's own names for the two it borrows */
let HEAT_AT=(x,z)=>SITE.temp.mean;   /* no vents at the Anvil's foot: the ground is the air's (KTHERM not taken: PLAN.md section 14) */

// ---------------------------------------------------------------- the host binding
// nothing roots in the water or on a block's wall (the cliff gate); a block's top is ground (lichen and cushions grow there)
function rootMask(x,z){const d=terrainH(x,z)-waterH(x,z);if(d<.15)return 0;return d<.7?(d-.15)/.55:1;}
const WBOX=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1];
const OBSTACLES=BLOCKS.map(S=>({x:S.x,z:S.z,r:S.r+1}));
BIO.init({tags:'slabfields',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:rootMask,
 obstacles:OBSTACLES,ticks:tick,seed:5130+SITE.station,origin:L.spine,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:230,mid:560,far:2400,floor:[180,440]},
 windows:{water:WBOX}});
BIO.setSun([-900,1300,-700]);
