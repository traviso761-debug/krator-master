// ================================================================= HOST — stage: STATION 4, THE PLAINS OF RUNNERS (PLAN.md section 9)
// N1, the N basin's cold steppe (5.1 px 1616,539, legacy 1344,209): BSk, 3,509 m at the site, 282 mm, 9 °C (22 / -4; 31 / -13), 1.03 atm.
// On the model the plain rises north to ~3.9 km 8 km out and falls south to ~3.2 km (where Dfb begins), ~45 m a km; east of the site it
// climbs to the N basin's east rim. The page keeps the true heights: 3.62 km at its north edge to 3.36 km at its south.
// The ostrich country: the Sunrise and Sunset herders' ground (PLAN.md section 6). Its flora is the STEPPE COLONY's (Z4), and from any
// height the plain reads as the cracked mosaic: each patch one colony, its needle fur and grey cushions, its sac brush toward its centre,
// and its ember scrub hedging the seams scarlet where it meets its neighbour (the herders' runs and borders follow the seams). Inselbergs
// and tors (KSTACKS dome and tor) stand out of it; two washes (KRELIEF.wadi) run south to a SALT PAN in the plain's lowest hollow, its
// brine pink with the salt colony (brine film, glass tubes, salt fans). The N basin's great salt lake is 220 km to the SW on 5.1: this pan
// is one of the plain's own (KNOWN_ISSUES.md). The herders' camp stands as records (the culture kit is later, PLAN.md section 6); the
// herds are kits/fauna's (owed). Carrion on the plain carries the bone bloom (the decay layer).
const STAGE={key:'plains',title:'the Plains of Runners',seed:5400,site:{px:1344,py:209}};
STAGE.hint='The Outlands, station 4: the Plains of Runners, the N basin\'s cold steppe at 3.4-3.6 km (BSk, 282 mm). The flora is COLONIAL: every patch of one colour is one steppe colony (needle fur, grey cushions, sac brush toward its centre), and the scarlet ember scrub hedges the seams where two colonies wall each other off: from a height the plain is a cracked mosaic. Inselbergs and granite tors stand out of it; two washes run down to a salt pan whose pink brine is the salt colony (brine film, glass tubes, salt fans). A herders\' camp of the Sunrise tribe; bone bloom on carrion';
const SUN_POS2=[-1100,1200,600];sun.position.set(...SUN_POS2);sun.intensity=1.35;HEMI.intensity=.86;
scene.fog.density=.00008;HAZE.set(0xccd0d6);scene.fog.color.copy(HAZE);
// ---------------------------------------------------------------- the land
function baseH(x,z){return 3490-.037*z+.012*x+18*Math.sin(x*.0009+.5)*Math.cos(z*.0007)+30*(fbm(x*.0008+5,z*.0008+1,541,3)-.5)+8*(fbm(x*.004-3,z*.004+7,543,2)-.5);}
// THE PAN: a closed hollow in the plain's south-west, flat-floored, its brine in the lowest part
const PAN={x:-1750,z:1850,rx:720,rz:480,ry:.35,depth:7};
const panD=(x,z)=>{const c=Math.cos(PAN.ry),s=Math.sin(PAN.ry),dx=x-PAN.x,dz=z-PAN.z,u=(dx*c+dz*s)/PAN.rx,v=(-dx*s+dz*c)/PAN.rz,a=Math.atan2(v,u);
 return Math.hypot(u,v)*(1+.07*Math.sin(3*a+.8)+.05*Math.sin(5*a+2.1)+.06*(fbm(x*.004,z*.004,545,2)-.5));};   /* 1 at the pan's rim */
const PAN_FLOOR=baseH(PAN.x,PAN.z)-PAN.depth;
function land0(x,z){const b=baseH(x,z),d=panD(x,z);if(d>1.6)return b;const k=smooth(1.5,.85,d);return mix(b,PAN_FLOOR+.25*Math.max(0,d-.3)+.15*(fbm(x*.02,z*.02,547,2)-.5),k);}
// THE WASHES (KRELIEF.wadi): from the plain's north edge down to the pan
const WADIS=[[[-500,-3700],[-1500,1500]],[[2000,-3700],[-1150,1700]]].map((L,i)=>{const pts=KRELIEF.meander(L[0],L[1],{amp:140,wave:1100,step:40,seed:5410+i});
 return KRELIEF.wadi({pts,ground:land0,w:6+2*i,bank:1.6,bankW:3,braids:2,pools:.35,fan:{r:180,slope:.02},seed:5420+i});});
const landH=KRELIEF.apply(land0,WADIS);
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=landH(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
// THE BRINE: a shallow pool over the pan's lowest floor (WATER.open with core/water's brine look, 89zw)
const BRINE_L=PAN_FLOOR+.45;
// THE ROCK (KSTACKS): inselbergs (exfoliating domes) and granite tors, each from a KRAND-hashed slot on a lattice, off the pan and the washes
const _wadiNear=(x,z,m)=>WADIS.some(W=>W.pts.some(p=>Math.abs(p.x-x)<m&&Math.abs(p.z-z)<m&&Math.hypot(p.x-x,p.z-z)<m));
const STONES=(function(){const out=[];
 for(let j=-5;j<=5;j++)for(let i=-5;i<=5;i++){const h0=KRAND.hash(5431,i,j,0x31),u=q=>KRAND.unit(KRAND.hash(h0,q,0,0x32)),x=(i+u(1))*640,z=(j+u(2))*640;
  if(Math.abs(x)>TERR.R-260||Math.abs(z)>TERR.R-260||panD(x,z)<1.7||_wadiNear(x,z,150))continue;
  if(u(3)<.16)out.push(KSTACKS.make({id:'dome'+out.length,kind:'dome',x,z,ground:terrainH,H:35+45*u(4),r:90+60*u(5),seed:h0}));
  else if(u(3)<.62)out.push(KSTACKS.make({id:'tor'+out.length,kind:'tor',x,z,ground:terrainH,H:4+7*u(4),seed:h0}));}
 out.forEach(B=>B.name=B.kind==='dome'?'An inselberg (a granite dome, its sheets peeling)':'A granite tor');return out;})();
const POOLS=[];WADIS.forEach((W,i)=>W.pools.forEach((P,k)=>{if(Math.abs(P.x)<TERR.R*1.05&&Math.abs(P.z)<TERR.R*1.05&&panD(P.x,P.z)>1.3)POOLS.push({x:P.x,z:P.z,r:P.r,l:P.y,wadi:i,k,name:'A wash pool'});}));
function waterH(x,z){if(panD(x,z)<1&&terrainH(x,z)<BRINE_L)return BRINE_L;for(let i=0;i<POOLS.length;i++){const P=POOLS[i];if(Math.abs(x-P.x)<P.r&&Math.abs(z-P.z)<P.r&&Math.hypot(x-P.x,z-P.z)<P.r*.95)return P.l;}return -1e9;}
const WADI_SEEDS=[];WADIS.forEach((W,i)=>{for(let k=6;k<W.pts.length;k+=9){const p=W.pts[k];if(panD(p.x,p.z)>1.2)WADI_SEEDS.push({id:'w'+i+'_'+k,x:p.x,z:p.z,type:'wadi'});}});
const _pm={x:NaN,z:NaN,p:null};
function partAt(x,z){if(x===_pm.x&&z===_pm.z)return _pm.p;_pm.x=x;_pm.z=z;const g=land0(x,z);for(let i=0;i<WADIS.length;i++){const p=KRELIEF.at(WADIS[i],x,z,g);if(p){p.kind='wadi';p.wadi=i;return(_pm.p=p);}}return(_pm.p=null);}
// THE CAMP: the Sunrise herders' summer camp on a rise north-east of the pan (records and plain meshes, 89zx's structures)
const CAMP={x:600,z:450,r:70};
// carrion on the plain (a kill every few hundred metres, by hash): the bone bloom's ground
const KILLS=[];for(let j=-6;j<=6;j++)for(let i=-6;i<=6;i++){const h0=KRAND.hash(5441,i,j,0x33),u=q=>KRAND.unit(KRAND.hash(h0,q,0,0x34));if(u(3)>.3)continue;
 const x=(i+u(1))*560,z=(j+u(2))*560;if(Math.abs(x)<TERR.R-200&&Math.abs(z)<TERR.R-200&&panD(x,z)>1.5)KILLS.push([x,z]);}
// ---------------------------------------------------------------- the fields
//   salt     the pan's crust (1 on the floor, out to its rim); shore the brine's edge (1 at the water line, 0 a few metres up or out)
//   steppe   the plain (the steppe colony's zone); the salt colony's is the pan and its rim; the wadi colony's the washes' floors
const SPINE=[];for(let x=-2800;x<=2800;x+=800)for(const z of[-2600,-1400,-200,1000,2200])SPINE.push([x,z]);SPINE.push([PAN.x,PAN.z],[CAMP.x,CAMP.z]);
STONES.filter(B=>B.kind==='dome').forEach(B=>SPINE.push([B.x,B.z]));
const NEAR=STAGEKIT.nearField(SPINE,90,260);
function fieldsAt(x,z,h,slope){const d=panD(x,z),part=partAt(x,z),wp=part?part.part:null,wadi=wp==='floor'||wp==='bar'?1:wp==='bank'||wp==='fan'?.5:0;
 const salt=smooth(1.15,.85,d),shore=h<BRINE_L+3&&d<1.2?smooth(2.2,0,Math.abs(h-BRINE_L))*smooth(1.2,.95,d):0;
 let carr=0;for(const k of KILLS){const q=Math.hypot(x-k[0],z-k[1]);if(q<40)carr=Math.max(carr,smooth(40,5,q));}
 return{near:NEAR(x,z),wet:clamp(.15+.3*wadi+.3*salt,0,1),flow:wadi*.3,upland:.6,rock:clamp(smooth(.5,.85,slope),0,1),slope,dry:.7,barren:salt*.5,cold:.45,salt,shore,wadi,
  steppe:1-salt,z_steppe:smooth(.95,1.25,d),z_salt:smooth(1.4,1.1,d),z_wadi:wadi>=1?1:wadi>=.5?.3:0,carrion:carr};}
const FNAMES=['near','wet','flow','upland','rock','slope','dry','barren','cold','salt','shore','wadi','steppe','z_steppe','z_salt','z_wadi','carrion'];
const {FC,FIELD}=STAGEKIT.fields(FNAMES,fieldsAt,terrainH);
FIELD.wadiX=(x,z)=>{const p=partAt(x,z);return p?(p.part==='floor'||p.part==='bar'?1:p.part==='fan'?.25:.5):0;};
FIELD.z_wadi=(x,z)=>{const w=FIELD.wadiX(x,z);return w>=1?1:w>=.5?.3:0;};
// ---------------------------------------------------------------- the host binding
function rootMask(x,z){const h=terrainH(x,z),d=h-waterH(x,z);let w=d<.15?0:d<.7?(d-.15)/.55:1;if(w>0&&STONES.length){const f=KSTACKS.foot(STONES,x,z);if(f&&f.d<1.5)return 0;}
 if(w>0&&Math.hypot(x-CAMP.x,z-CAMP.z)<CAMP.r)return 0;return w;}
BIO.init({tags:'outlands',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:rootMask,
 obstacles:[],ticks:tick,seed:5400,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,capThrow:false,
 lod:{hero:240,mid:600,far:2600,floor:[180,460]},windows:{}});
{const Q=new URLSearchParams(location.search);BIO.INDEX_ITEMS=Q.get('index')!=='0';
 BIO.LOD.merge=Q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&Q.get('lodfade')!=='0'?.15:0;BIO.LOD.cull=BIO.LOD.fade>0&&Q.get('lodcull')!=='0';}
BIO.setSun(SUN_POS2);
// ---------------------------------------------------------------- the herders' camp: tents, a goat fold, a hearth (records, plain meshes)
function campBuild(){const g=new THREE.Group(),felt=new THREE.MeshLambertMaterial({color:0xb8a68a}),dark=new THREE.MeshLambertMaterial({color:0x5a4a3a}),stone=new THREE.MeshLambertMaterial({color:0x8a8680});
 const tents=[];for(let k=0;k<6;k++){const a=k/6*TAU+.4,d=CAMP.r*.55*(.8+.25*KRAND.unit(KRAND.hash(5451,k,1))),x=CAMP.x+Math.cos(a)*d,z=CAMP.z+Math.sin(a)*d,y=terrainH(x,z),r=3+1.2*KRAND.unit(KRAND.hash(5451,k,2));
  const w=new THREE.Mesh(new THREE.CylinderGeometry(r,r,1.6,14,1,true),felt);w.position.set(x,y+.8-.15,z);g.add(w);
  const roof=new THREE.Mesh(new THREE.ConeGeometry(r*1.04,1.5,14),felt);roof.position.set(x,y+1.6-.15+.75,z);g.add(roof);
  const door=new THREE.Mesh(new THREE.BoxGeometry(.9,1.3,.12),dark);door.position.set(x-Math.cos(a)*r*.98,y+.5,z-Math.sin(a)*r*.98);door.rotation.y=-a+Math.PI/2;g.add(door);
  REGISTER({name:'A herders\' tent (the Sunrise tribe: felt over a lattice; the culture kit, later)',kind:'structure',x,z,y:y-1,r:r+.5,h:4.5});tents.push([x,z,r]);}
 // the goat fold: a ring of piled stones; the hearth: a ring of blackened stones in the camp's middle
 const ring=(cx,cz,R,n,s,name)=>{for(let k=0;k<n;k++){const a=k/n*TAU,x=cx+Math.cos(a)*R,z=cz+Math.sin(a)*R,m=new THREE.Mesh(new THREE.DodecahedronGeometry(s*(.8+.4*KRAND.unit(KRAND.hash(5453,k,Math.round(R)))),0),stone);
  m.position.set(x,terrainH(x,z)+s*.3,z);m.rotation.set(k,k*1.7,0);g.add(m);}REGISTER({name,kind:'structure',x:cx,z:cz,y:terrainH(cx,cz)-1,r:R+1.5,h:3});};
 ring(CAMP.x+CAMP.r*1.3,CAMP.z-CAMP.r*.2,14,44,.55,'The goat fold (a ring of piled stones)');ring(CAMP.x,CAMP.z,1.2,9,.28,'The hearth');
 g.traverse(o=>{if(o.isMesh){o.userData.host=true;o.userData.inspectLabel='The Sunrise herders\' camp';}});scene.add(g);
 REGISTER({name:'The Sunrise herders\' summer camp',kind:'settlement',x:CAMP.x,z:CAMP.z,y:terrainH(CAMP.x,CAMP.z)-2,r:CAMP.r*1.6,h:8});return{tents:tents.length};}
// ---------------------------------------------------------------- the stage record (stations/_shared reads it)
const T_={tan:new THREE.Color(0xa08a6a),tan2:new THREE.Color(0x8a7a5e),rust:new THREE.Color(0x9a6a48),grey:new THREE.Color(0x8e8a80),crust:new THREE.Color(0xe8e2dc),pink:new THREE.Color(0xd8a8a8),
 mud:new THREE.Color(0x8a7a6a),cobble:new THREE.Color(0x9a8e80)};
Object.assign(STAGE,{
 types:['steppe','salt','wadi'],seeds:WADI_SEEDS,unlike:[['salt','steppe']],share:{steppe:1,salt:2,wadi:3},
 tint:{steppe:0x9a6e4e,salt:0xe0b8b8,wadi:0x8a9a5a},tintK:.2,
 paint(x,z,H,c,f){const p1=fbm(x*.012+5,z*.012-2,.7,2),p2=fbm(x*.022-3,z*.022+8,.9,2),sa=f('salt'),sh=f('shore'),wd=f('wadi');
  c.copy(T_.tan).lerp(T_.tan2,smooth(.4,.7,p1)*.6).lerp(T_.rust,smooth(.55,.75,p2)*.35).lerp(T_.grey,smooth(.62,.8,p1)*.3);
  c.lerp(T_.mud,smooth(.2,.6,sa)*.6);c.lerp(T_.crust,smooth(.55,.95,sa)*.8*(1-sh*.5));c.lerp(T_.pink,sh*.6);c.lerp(T_.cobble,smooth(.4,.9,wd)*.8);},
 layers:[{fam:'ground.steppe',name:'steppe',amt:.5,gain:1.2},{fam:'ground.salt',name:'salt crust',amt:.6,gain:1.15},{fam:'ground.cobble',name:'wash cobble',amt:.65,gain:1.2}],
 gl(x,z){const sa=smooth(.4,.9,FC.at(FC.a.salt,x,z)),wd=smooth(.3,.9,FC.at(FC.a.wadi,x,z))*(1-sa);return[(1-sa)*(1-wd),sa,wd];},
 rocks:STONES,rockName:{dome:'An inselberg (a granite dome)',tor:'A granite tor'},rockCol:{dome:[0x9a928a,0xa49c92,0x8a847c],tor:[0x8e8a84,0x9a958e,0x7e7a76]},
 landmarks:[{name:'The salt pan (the plain\'s lowest hollow; the brine pink with the salt colony)',x:PAN.x,z:PAN.z,y:PAN_FLOOR-3,r:PAN.rx*1.1,h:20}]
  .concat(WADIS.map(W=>{const P=W.pts[Math.floor(W.pts.length*.4)];return{name:'A wash across the plain',x:P.x,z:P.z,y:P.y-8,r:W.pts[0].w*2.5,h:30};})),
 probes:[[PAN.x,.2,PAN.z]].concat(WADIS.map(W=>{const p=W.pts[Math.floor(W.pts.length*.4)];return[p.x,1,p.z];})),
 far:{h:(x,z)=>baseH(x,z)+(x>0?.05*Math.max(0,x-3800):0),col(x,z,y,q){const L=a=>a.map(v=>Math.pow(v/255,2.2)),T=L([160,140,108]),HZ=L([206,210,216]),t=.55*smooth(3500,10000,q.r);return[T[0]+(HZ[0]-T[0])*t,T[1]+(HZ[1]-T[1])*t,T[2]+(HZ[2]-T[2])*t];}},
 sky:{"air":{"pressure":1.03,"humidity":0.3},"clouds":{"cover":0.25,"cumulus":0.6,"cirrus":0.5},"fogDensity":0.0001,
  "ridges":[{"base":3.2,"amp":0.9,"cycles":20,"octaves":2,"seed":55,"win":[90,80,2.2],"floor":-0.2,"dist":120000,"haze":0.04,"forestH":0,"rock":[0.6,0.56,0.54]},
   {"base":0.4,"amp":0.6,"cycles":30,"octaves":3,"peaks":10,"peakAmp":0.6,"seed":56,"win":[[0,90,2.5],[180,60,2.5]],"floor":-0.3,"dist":40000,"haze":0.1,"forestH":0,"rock":[0.56,0.5,0.46]}],"landmarks":[]},
 atmos:{climate:{wet:false,cold:true,dry:true},fog:{falloff:1/900,sun:.35,sky:.3}},
 water:{pools:POOLS,poolLabel:'A wash pool',lakes:[{name:'The brine (the salt pan\'s pool)',label:'The brine: the salt colony\'s pink film in it',level:BRINE_L,look:'brine',
  box:[PAN.x-PAN.rx*1.3,PAN.z-PAN.rx*1.3,PAN.x+PAN.rx*1.3,PAN.z+PAN.rx*1.3],seed:[PAN.x,PAN.z],cell:6,band:30,land:(x,z)=>panD(x,z)>1.05,shallow:0xd8a0a8,deep:0x8a4a50}]},
 build:{decay:true,quality:.7},decayForms:['bonebloom'],
 structures:campBuild,
 views(){const K=STAGEKIT,Em=K.near('ember',0,-800),Gc=K.near('greycush',1500,-1200),Sb=K.near('sacbrush',-600,-1800),Nf=K.near('needlefur',CAMP.x,CAMP.z+300),
   Gt=K.near('glasstube',PAN.x,PAN.z),Sf=K.near('saltfan',PAN.x+300,PAN.z),Bb=K.near('bonebloom',0,0),St=K.near('stilt',0,0),
   D=STONES.filter(B=>B.kind==='dome').sort((a,b)=>Math.hypot(a.x,a.z)-Math.hypot(b.x,b.z))[0]||{x:0,z:0,H:30,r:80,y0:terrainH(0,0)},T=STONES.find(B=>B.kind==='tor')||D;
  return{
   'The cracked mosaic from an inselberg':(function(){const a=2.3,cx=D.x+Math.cos(a)*(D.r*1.6),cz=D.z+Math.sin(a)*(D.r*1.6);return[cx,K.gh(cx,cz,D.H*1.2+20),cz,cx+Math.cos(a)*900,K.gh(cx+Math.cos(a)*900,cz+Math.sin(a)*900),cz+Math.sin(a)*900];})(),
   'The plain from on high':K.look(1800,-3000,450,-600,800,0),
   'Ember hedges on the seams':K.at(Em,14,.6,3,.6),
   'Grey cushions and needle fur':K.at(Gc,8,2.2,1.7,.3),
   'Sac brush':K.at(Sb,6,1.2,1.5,.6),
   'Needle fur near the camp':K.at(Nf,5,2.8,1.4,.2),
   'The herders\' camp':K.look(CAMP.x+150,CAMP.z+110,22,CAMP.x,CAMP.z,2),
   'The salt pan and its brine':K.look(PAN.x+PAN.rx*1.2,PAN.z-PAN.rz*.9,30,PAN.x,PAN.z,0),
   'Glass tubes on the pan':K.at(Gt,6,1.9,1.6,.6),
   'Salt fans at the brine\'s lip':K.at(Sf,6,.4,1.6,.4),
   'An inselberg':(function(){const cx=D.x+D.r*3.2,cz=D.z+D.r*1.4;return[cx,K.gh(cx,cz,6),cz,D.x,D.y0+D.H*.5,D.z];})(),
   'A granite tor':(function(){const cx=T.x+24,cz=T.z+16;return[cx,K.gh(cx,cz,3),cz,T.x,T.y0+T.H*.4,T.z];})(),
   'Bone bloom on a kill':K.at(Bb,5,1.1,1.6,.2),
   'A wash and its stilt mounds':K.at(St,12,.3,2.4,.8),
  };},
 checks(add){add('the salt colonies on the pan, the steppe\'s off it',PLCHK.pan(OUTL.INST));add('the camp kept clear',PLCHK.camp(OUTL.INST));},
 negatives(add){add('a grey cushion on the brine\'s floor',PLCHK.pan([{key:'greycush',type:'steppe',x:PAN.x,z:PAN.z}]));add('a cushion in the camp',PLCHK.camp([{key:'greycush',x:CAMP.x,z:CAMP.z}]));},
});
const PLCHK={
 pan(I){const bad=I.filter(f=>f.type==='steppe'&&panD(f.x,f.z)<.95),salt=I.filter(f=>f.type==='salt'),out=salt.filter(f=>panD(f.x,f.z)>1.4);
  return{ok:!bad.length&&!out.length,detail:bad.length?bad.length+' steppe forms on the pan\'s floor':out.length?out.length+' salt forms off the pan':salt.length+' salt forms on the pan, no steppe form on its floor'};},
 camp(I){const bad=I.filter(f=>Math.hypot(f.x-CAMP.x,f.z-CAMP.z)<CAMP.r-1);return{ok:!bad.length,detail:bad.length?bad.length+' forms inside the camp':'nothing grows inside the camp\'s '+CAMP.r+' m'};}};
