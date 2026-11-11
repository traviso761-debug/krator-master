// ================================================================= HOST — stage: STATION 3, THE GEM HILLS (PLAN.md section 9)
// The ground of the S basin's dry shoulder, the Gem Hills (S4: 5.1 px 1624,721, legacy 1352,391): BWk, 2,295 m at the site, 173 mm, 14 °C
// (26 / 1; 35 / -8), 1.21 atm. On the model the shoulder falls gently east, from ~2.6 km at px 1620 (BSk, the cold steppe's edge) to ~2.15
// km at px 1628 (BWk): 35 m a km, which this page keeps at its true heights (unlike station 1, nothing is compressed). Station 1 holds the
// shoulder's top; this page is the hills themselves: copper-stained mesas and fins, the Peak tribe's open-cast workings (the emerald in dark
// schist, the turquoise in pale altered rock), the copper colonies' lace crust on the beds, turquoise shelves on new rock, green fans on
// the spoil, the wadis draining east, and on the higher ground to the west the steppe colonies' edge, their ember hedges on the seams.
// THE MAP (x east, z south; origin the site, R 3400):
//   THE STEPPE EDGE  x < -900: the higher BSk ground (2.42-2.55 km), needle fur and grey cushions; the steppe colonies meet the copper
//                    colonies along a band (x -1500..-700), where ember scrub hedges the seams
//   THE HILLS        the rest: gravel and sand on red beds, low cuestas striking NE (their scarps the strata's ledges), four mesas and
//                    buttes (heightfield, benched by the strata), a row of fins (KSTACKS), talus at the mesas' feet (KRELIEF.talus)
//   THE WORKINGS     the emerald pit (KRELIEF.pit, r 190, 40 m deep, in the dark schist the paint lays round it) and the turquoise pit (r 230,
//                    36 m) on a white altered zone, each with its spoil tipped beside it; wide enough that each bench spans two or three of the
//                    ground mesh's 15.6 m cells (narrower, they smooth into a bowl)
//   THE WADIS        three dry channels (KRELIEF.wadi) from the west edge to the east, braided cobble floors, pools after rain, fans
const STAGE={key:'gems',title:'the Gem Hills',seed:5300,site:{px:1352,py:391}};
STAGE.hint='The Outlands, station 3: the Gem Hills, the S basin\'s dry shoulder at 2.2-2.5 km (BWk, 173 mm). The flora is COLONIAL: each patch of one colour is one organism. Copper colonies hold the hills (green fans, drums, turquoise shelves on new rock, lace crust drawing the metal from the copper beds); wadi colonies the dry channels; on the higher steppe to the west, steppe colonies, their scarlet ember scrub hedging the seams where they meet the copper. The Peak tribe\'s emerald and turquoise workings are open-cast pits with their spoil';
const SUN_POS2=[-1000,1300,700];sun.position.set(...SUN_POS2);sun.intensity=1.4;HEMI.intensity=.8;
scene.fog.density=.00009;HAZE.set(0xd2ccc4);scene.fog.color.copy(HAZE);
// ---------------------------------------------------------------- the land
const ZZ=(x,z)=>z+90*Math.sin(x*.0011+.4)+60*(fbm(x*.0008+3,z*.0008-2,531,2)-.5);
function baseH(x,z){return 2300-.035*x+25*Math.sin(z*.0007+1.1)+40*(fbm(x*.0011+5,z*.0011+1,533,3)-.5)+12*(fbm(x*.004-3,z*.004+7,535,2)-.5)
 +90*smooth(-600,-2200,x)*(.6+.4*fbm(x*.0005,z*.0005,537,2));}   /* the steppe edge's rise to the west */
// THE CUESTAS: low ridges striking NE, a gentle dip slope and a short scarp to the NW (the beds' ledges where the strata show)
const CUESTA_ANG=.78,cuX=(x,z)=>x*Math.cos(CUESTA_ANG)-z*Math.sin(CUESTA_ANG);
const cuF=(x,z)=>{const u=cuX(x,z)/420+.6*(fbm(x*.0009,z*.0009,539,2)-.5);return u-Math.floor(u);};   /* 0..1 across a cuesta: its dip slope, then its scarp */
function cuesta(x,z){const f=cuF(x,z);return 22*(f<.82?f/.82:smooth(1,.82,f))*(.5+.5*fbm(x*.0013+9,z*.0013,541,2));}
// THE MESAS AND BUTTES (heightfield): flat-topped, their sides benched by the strata
const MESAS=[{x:-350,z:-1500,r:330,h:115,s:1.3,name:'The Copper Table (a mesa of the gem hills)'},{x:1550,z:-650,r:220,h:85,s:2.2,name:'A copper-banded butte'},
 {x:600,z:1450,r:260,h:95,s:3.1,name:'The Green Mesa'},{x:-1900,z:1900,r:180,h:70,s:4.4,name:'A butte at the steppe\'s edge'}];
function mesaAt(x,z){let k=0,top=0,side=0,d0=9;
 for(const B of MESAS){const dx=x-B.x,dz=z-B.z,D=Math.hypot(dx,dz);if(D>B.r*1.6)continue;const a=Math.atan2(dz,dx),
  d=D/(B.r*(1+.14*Math.sin(3*a+B.s)+.08*Math.sin(5*a+2*B.s)+.08*(fbm(x*.01+B.s,z*.01,543,2)-.5))),f=smooth(1.04,.84,d);d0=Math.min(d0,d);
  if(f>k){k=f;top=baseH(B.x,B.z)+B.h;side=smooth(.62,.95,d)*smooth(1.12,.95,d);}}
 return{k,top,side,d:d0};}
const STRATA=KSTRATA.create({seed:5301,recipe:'outland',range:[2000,2850],dip:[.5,.8,.008],warp:[6,2]});
// the talus at the mesas' feet (KRELIEF.talus: the rock's fall banked against the wall's foot)
const TALUS=KRELIEF.talus({footD:(x,z)=>{let best=1e9;for(const B of MESAS){const D=Math.hypot(x-B.x,z-B.z)-B.r*1.02;if(D<best)best=D;}return best;},h:14,reach:70,seed:5303});
function land0(x,z){let h=baseH(x,z)+cuesta(x,z);const M=mesaAt(x,z);if(M.k>0)h=mix(h,Math.max(h,M.top+2*(fbm(x*.02,z*.02,545,2)-.5)),M.k);
 return h+TALUS(x,z)*(1-M.k);}
const _ledgeK=(x,z)=>{const M=mesaAt(x,z);return Math.max(.8*M.side,.5*smooth(.6,.85,cuF(x,z)));};
function land1(x,z){const h=land0(x,z),k=_ledgeK(x,z);return k>.02?STRATA.terrace(x,z,h,k):h;}
// THE WADIS (KRELIEF.wadi): west to east, down the shoulder's fall, each meandering, fans past the east edge
const WADIS=[[-3700,-2300,3700,-1900],[-3700,300,3700,600],[-3700,2500,3700,2950]].map((L,i)=>{
 const pts=KRELIEF.meander([L[0],L[1]],[L[2],L[3]],{amp:160,wave:1300,step:40,seed:5310+i});
 return KRELIEF.wadi({pts,ground:land1,w:8+3*i,bank:2,bankW:3.5,braids:2,pools:.5,fan:{r:220,slope:.03},seed:5320+i});});
// THE WORKINGS (KRELIEF.pit): the emerald pit in the dark schist, the turquoise pit on the white altered zone
const PIT_E=KRELIEF.pit({c:[-1250,-250],r:190,depth:40,e:1.25,ground:land1,spoil:{n:3,dist:[1.35,1.9],r:[.22,.36],h:[7,13]},seed:5331});
const PIT_T=KRELIEF.pit({c:[1150,250],r:230,depth:36,e:1.4,ry:.6,ground:land1,spoil:{n:4,dist:[1.3,2],r:[.2,.34],h:[6,12]},seed:5333});
const PITS=[PIT_E,PIT_T];
const landH=KRELIEF.apply(land1,PITS.concat(WADIS));
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=landH(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
// THE FINS (KSTACKS.row): a line of copper-stained fins on a cuesta's crest, east of the Copper Table
const FINS=KSTACKS.row({id:'fin',seed:5341,a:[700,-2500],b:[2300,-1500],n:7,kind:'fin',H:[16,34],r:[7,12],e:[3,5],ground:terrainH});
FINS.forEach(B=>B.name='A copper-stained fin');
const POOLS=[];WADIS.forEach((W,i)=>W.pools.forEach((P,k)=>{if(Math.abs(P.x)<TERR.R*1.05&&Math.abs(P.z)<TERR.R*1.05)POOLS.push({x:P.x,z:P.z,r:P.r,l:P.y,wadi:i,k,name:'A wadi pool'});}));
function waterH(x,z){for(let i=0;i<POOLS.length;i++){const P=POOLS[i];if(Math.abs(x-P.x)<P.r&&Math.abs(z-P.z)<P.r&&Math.hypot(x-P.x,z-P.z)<P.r*.95)return P.l;}return -1e9;}
const WADI_SEEDS=[];WADIS.forEach((W,i)=>{for(let k=6;k<W.pts.length;k+=9){const p=W.pts[k];WADI_SEEDS.push({id:'w'+i+'_'+k,x:p.x,z:p.z,type:'wadi'});}});
const _pm={x:NaN,z:NaN,p:null};
function partAt(x,z){if(x===_pm.x&&z===_pm.z)return _pm.p;_pm.x=x;_pm.z=z;return(_pm.p=partAt0(x,z));}
function partAt0(x,z){const g=land1(x,z);for(let i=0;i<WADIS.length;i++){const p=KRELIEF.at(WADIS[i],x,z,g);if(p){p.kind='wadi';p.wadi=i;return p;}}
 for(let i=0;i<PITS.length;i++){const p=KRELIEF.at(PITS[i],x,z,g);if(p){p.kind='pit';p.pit=i;return p;}}return null;}
// ---------------------------------------------------------------- the fields
//   steppe   the higher BSk ground to the west (the steppe colony's zone), copper the hills (the copper colony's), overlapping on a band
//   ore      a copper or turquoise bed within 6 m of the ground where the rock shows, or fresh rock in a pit and on its spoil (the miners')
//   schist   the dark schist round the emerald working; altered the white altered zone round the turquoise working (the paint)
const ALTER=(x,z)=>smooth(700,260,Math.hypot((x-PIT_T.c[0])/1.3,z-PIT_T.c[1])),SCHIST=(x,z)=>smooth(640,240,Math.hypot(x-PIT_E.c[0],(z-PIT_E.c[1])/1.2));
function oreAt(x,z,h,rock,part){if(part&&part.kind==='pit')return 1;if(rock<.15)return 0;let o=0;const A={};
 for(let k=0;k<=6;k+=1.5){STRATA.at(x,h-k,z,A);if(A.kind==='copper'||A.kind==='turq'){o=1-k/9;break;}}
 return o*smooth(.15,.45,rock);}
function fieldsAt(x,z,h,slope){const M=mesaAt(x,z),part=partAt(x,z),wp=part&&part.kind==='wadi'?part.part:null;
 const rock=clamp(Math.max(smooth(.42,.8,slope)*.9,M.side*.85,part&&part.part==='face'?.9:0,part&&part.part==='bank'?.35:0,.45*smooth(.6,.9,cuF(x,z))*smooth(.2,.4,slope)),0,1);
 const wadi=wp==='floor'||wp==='bar'?1:wp==='bank'||wp==='fan'?.5:0,pit=part&&part.kind==='pit'?1:0;
 const xs=x+120*(fbm(x*.001,z*.001,547,2)-.5),steppe=smooth(-500,-900,xs);   /* the steppe's core west of -700, the copper's east of -1500: both on the band */
 return{wet:clamp(.1+.3*wadi,0,1),flow:wadi*.4,upland:.2,rock,slope,dry:1,barren:clamp(.5+.3*pit,0,1),ore:oreAt(x,z,h,rock,part),wadi,pit,butte:M.k,
  steppe,z_steppe:steppe,near:NEAR(x,z),z_copper:smooth(-1700,-1300,xs),z_wadi:wadi>=1?1:wadi>=.5?.3:0,schist:SCHIST(x,z),altered:ALTER(x,z)};}
const SPINE=[];for(let x=-2800;x<=2800;x+=800)for(const z of[-2600,-1400,-200,1000,2200])SPINE.push([x,z]);
MESAS.forEach(B=>SPINE.push([B.x,B.z]));PITS.forEach(P=>SPINE.push(P.c.slice()));
const NEAR=STAGEKIT.nearField(SPINE,90,260);
const FNAMES=['near','wet','flow','upland','rock','slope','dry','barren','ore','wadi','pit','butte','steppe','z_steppe','z_copper','z_wadi','schist','altered'];
const {FC,FIELD}=STAGEKIT.fields(FNAMES,fieldsAt,terrainH);
FIELD.wadiX=(x,z)=>{const p=partAt(x,z);return p&&p.kind==='wadi'?(p.part==='floor'||p.part==='bar'?1:p.part==='fan'?.25:.5):0;};
FIELD.oreX=(x,z)=>{const h=terrainH(x,z),p=partAt(x,z);return oreAt(x,z,h,FIELD.rock(x,z),p);};
FIELD.z_wadi=(x,z)=>{const w=FIELD.wadiX(x,z);return w>=1?1:w>=.5?.3:0;};
// ---------------------------------------------------------------- the host binding
function rootMask(x,z){const h=terrainH(x,z),d=h-waterH(x,z);let w=d<.15?0:d<.7?(d-.15)/.55:1;if(w>0&&FINS.length){const f=KSTACKS.foot(FINS,x,z);if(f&&f.d<1.5)return 0;}return w;}
BIO.init({tags:'outlands',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:rootMask,
 obstacles:[],ticks:tick,seed:5300,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,capThrow:false,
 lod:{hero:240,mid:600,far:2600,floor:[180,460]},windows:{}});
{const Q=new URLSearchParams(location.search);BIO.INDEX_ITEMS=Q.get('index')!=='0';
 BIO.LOD.merge=Q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&Q.get('lodfade')!=='0'?.15:0;BIO.LOD.cull=BIO.LOD.fade>0&&Q.get('lodcull')!=='0';}
BIO.setSun(SUN_POS2);
// ---------------------------------------------------------------- the stage record (stations/_shared reads it)
Object.assign(STAGE,{
 types:['copper','wadi','steppe'],seeds:WADI_SEEDS,strata:STRATA,unlike:[['copper','steppe']],
 tint:{copper:0x6e8a6a,wadi:0x8a9a5a,steppe:0x8a6e52},tintK:.24,
 paint(x,z,H,c,f){const pav=fbm(x*.011+5,z*.011-2,.7,2),pav2=fbm(x*.02-3,z*.02+8,.9,2),st=f('steppe'),ore=f('ore'),wd=f('wadi'),sc=f('schist'),al=f('altered');
  c.setHex(0x94705c).lerp(T_.sand,smooth(.4,.65,pav)*.7).lerp(T_.grav2,smooth(.55,.75,pav2)*.5);
  c.lerp(T_.steppe,st*.75);c.lerp(T_.steppe2,st*smooth(.45,.7,pav2)*.4);
  c.lerp(T_.schist,sc*.7);c.lerp(T_.altered,al*.65);
  c.lerp(T_.green,ore*.55);c.lerp(T_.cobble,smooth(.4,.9,wd)*.8);},
 layers:[{fam:'ground.gravel',name:'gravelly sand',amt:.36,gain:1.2},{fam:'ground.cobble',name:'wadi cobble',amt:.7,gain:1.2},{fam:'ground.malachite',name:'malachite stain',amt:.45,gain:1.15}],
 gl(x,z){const rk=smooth(.2,.6,FC.at(FC.a.rock,x,z)),wd=smooth(.3,.9,FC.at(FC.a.wadi,x,z))*(1-rk),o=smooth(.15,.6,Math.max(FC.at(FC.a.ore,x,z),FC.at(FC.a.pit,x,z)))*(1-wd)*(1-.75*FC.at(FC.a.schist,x,z));
  return[(1-rk)*(1-wd)*(1-o)*(1-.6*FC.at(FC.a.steppe,x,z)),wd,o];},
 rocks:FINS,rockName:{fin:'A copper-stained fin (the red beds, banded green where the copper ran)'},
 landmarks:MESAS.map(B=>({name:B.name,x:B.x,z:B.z,y:baseH(B.x,B.z)-10,r:B.r*1.05,h:B.h+40}))
  .concat([{name:'The emerald working (the Peak tribe\'s pit in the dark schist)',x:PIT_E.c[0],z:PIT_E.c[1],y:PIT_E.rimY-PIT_E.depth-5,r:PIT_E.r*1.7,h:PIT_E.depth+40},
   {name:'The turquoise working (the Peak tribe\'s pit in the white altered rock)',x:PIT_T.c[0],z:PIT_T.c[1],y:PIT_T.rimY-PIT_T.depth-5,r:PIT_T.r*1.8,h:PIT_T.depth+40}])
  .concat(WADIS.map(W=>{const P=W.pts[Math.floor(W.pts.length*.45)];return{name:'A wadi across the gem hills',x:P.x,z:P.z,y:P.y-8,r:W.pts[0].w*2.5,h:30};})),
 probes:MESAS.map(B=>[B.x,-5,B.z]).concat(PITS.map(P=>[P.c[0],2,P.c[1]]),WADIS.map(W=>{const p=W.pts[Math.floor(W.pts.length*.45)];return[p.x,1,p.z];})),
 far:{h:(x,z)=>baseH(x,z)+cuesta(x,z)*.6,col(x,z,y,q){const L=a=>a.map(v=>Math.pow(v/255,2.2)),G=L([150,118,98]),S=L([150,130,104]),HZ=L([210,204,196]);
  const st=smooth(-1500,-3500,x),c=[G[0]+(S[0]-G[0])*st,G[1]+(S[1]-G[1])*st,G[2]+(S[2]-G[2])*st],t=.55*smooth(3500,10000,q.r);return[c[0]+(HZ[0]-c[0])*t,c[1]+(HZ[1]-c[1])*t,c[2]+(HZ[2]-c[2])*t];}},
 sky:{"air":{"pressure":1.2,"humidity":0.25},"clouds":{"cover":0.18,"cumulus":0.5,"cirrus":0.5},"fogDensity":0.00012,
  "ridges":[{"base":2.4,"amp":0.7,"cycles":18,"octaves":2,"seed":53,"win":[300,80,2.2],"floor":-0.2,"dist":90000,"haze":0.04,"forestH":0,"rock":[0.6,0.5,0.46]},
   {"base":0.5,"amp":0.9,"cycles":36,"octaves":3,"peaks":20,"peakAmp":0.8,"seed":54,"win":[[60,90,2.5]],"floor":-0.3,"dist":25000,"haze":0.12,"forestH":0,"rock":[0.6,0.46,0.4]}],"landmarks":[]},
 atmos:{climate:{wet:false,cold:false,dry:true},fog:{falloff:1/800,sun:.35,sky:.3}},
 water:{pools:POOLS,poolLabel:'A wadi pool (the flood\'s leavings)'},
 build:{quality:.55},   /* the copper colonies hold the whole map here (on station 1 a band): the forms at .55 of station 1's density */
 views(){const K=STAGEKIT,Lc=K.near('lacecrust',-300,-1250),Tq=K.near('tqshelf',PIT_T.c[0],PIT_T.c[1]),Gf=K.near('greenfan',PIT_E.c[0]+PIT_E.r*1.6,PIT_E.c[1]),
   Dr=K.near('drums',300,800),Em=K.near('ember',-1100,500),St=K.near('stilt',0,500),Gc=K.near('greycush',-2400,-500),Sb=K.near('sacbrush',-2600,800),M0=MESAS[0],F0=FINS[3];
  return{
   'The gem hills from the Copper Table':K.look(M0.x+M0.r*.55,M0.z+M0.r*.3,6,600,800,0),
   'The mosaic from above':K.look(-900,-2900,380,300,600,0),
   'The emerald working':K.look(PIT_E.c[0]+PIT_E.r*1.9,PIT_E.c[1]+PIT_E.r*.9,25,PIT_E.c[0],PIT_E.c[1],-PIT_E.depth*.6),
   'The turquoise working':K.look(PIT_T.c[0]-PIT_T.r*2,PIT_T.c[1]+PIT_T.r*1.1,28,PIT_T.c[0],PIT_T.c[1],-PIT_T.depth*.6),
   'Turquoise shelves on new rock':K.at(Tq,7,1.1,2,.5),
   'Lace crust on the copper beds':K.at(Lc,9,.9,3,.4),
   'Green fans on the spoil':K.at(Gf,8,2.2,2.2,.6),
   'Drums on the gravel':K.at(Dr,8,2.6,2,.5),
   'Copper-stained fins':(function(){const a=Math.atan2(F0.z-1000,F0.x-500),cx=F0.x-Math.cos(a)*120,cz=F0.z-Math.sin(a)*120;return[cx,K.gh(cx,cz,12),cz,F0.x,F0.y0+F0.H*.5,F0.z];})(),
   'Ember scrub where the copper meets the steppe':K.at(Em,10,.4,2.2,.8),
   'A wadi and its stilt mounds':K.at(St,13,.3,2.5,.8),
   'Grey cushions at the steppe\'s edge':K.at(Gc,9,2,1.8,.4),
   'Sac brush':K.at(Sb,6,1.4,1.6,.6),
  };},
 checks(add){add('miners in both workings and on the beds',GEMCHK.miners(OUTL.INST.filter(f=>f.role==='miner')));
  add('nothing rooted in a fin\'s foot',GEMCHK.fins(OUTL.INST));},
 negatives(add){add('miners on the beds only, none in the workings',GEMCHK.miners(OUTL.INST.filter(f=>f.role==='miner'&&!(partAt(f.x,f.z)&&partAt(f.x,f.z).kind==='pit'))));
  const B=FINS[0];add('a fan inside a fin',GEMCHK.fins([{key:'greenfan',x:B.x,z:B.z}]));},
});
// the station's own checks: the miners take both workings and the beds; nothing roots inside a fin
const GEMCHK={
 miners(M){const inPit=M.filter(f=>{const p=partAt(f.x,f.z);return p&&p.kind==='pit';}),both=PITS.every(P=>inPit.some(f=>Math.hypot(f.x-P.c[0],f.z-P.c[1])<P.r*2));
  return{ok:both&&M.length-inPit.length>0,detail:inPit.length+' lace crusts in the workings ('+(both?'both':'not both')+'), '+(M.length-inPit.length)+' on the beds'};},
 fins(I){const F=I.filter(f=>f.key!=='lacecrust'),on=F.filter(f=>{const q=KSTACKS.foot(FINS,f.x,f.z);return q&&q.d<1;}).length;
  return{ok:on===0,detail:on?on+' forms inside a fin\'s foot':F.length+' forms, none inside a fin'};}};
const T_={sand:new THREE.Color(0xa6826a),grav2:new THREE.Color(0x7e5e4c),steppe:new THREE.Color(0x9a8a6a),steppe2:new THREE.Color(0x7e7458),schist:new THREE.Color(0x4a4a46),
 altered:new THREE.Color(0xd8d0c0),green:new THREE.Color(0x6a8a6a),cobble:new THREE.Color(0x9a8e80)};
