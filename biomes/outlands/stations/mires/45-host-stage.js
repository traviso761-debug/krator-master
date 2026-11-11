// ================================================================= HOST — stage: STATION 8, THE MIRES (PLAN.md section 9; the owner, 2026-11-02)
// The S Outlands' boreal plateau (5.1 px 1604,721; legacy 1332,391): Dfb at 3,938 m, 1,176 mm, 4 °C (17 / -9; 25 / -16), 0.98 atm, the
// wettest flat cold ground on the whole model. On 5.1 the flat falls ~10 m a km to the east (3.97 km on the page's west edge, 3.90 on its
// east) and rises to the west; the Fog Rim (station 1's crest, px 1609,723) is 10 km east-south-east. The page keeps the true heights.
// The Outlands' MUSKEG: the kit's own forms at their smallest and wettest, on the colony rule:
//   THE STRINGS   string bog: low peat ridges across the fall (they run north-south, the water seeping east through them), 1-1.4 m
//                 high, ~70 m apart; on them the MAST COLONY at its smallest (OUTL.SIZE.mast .45): the comb mast as a BOG PINE,
//                 standing in lines on the colonies' seams; deck caps a few metres high; cap-shrubs
//   THE FLARKS    the wet hollows between the strings, their POOLS (WATER.still, one mesh): the RIVER COLONY's (mire pads afloat, pipe
//                 reeds in the shallows, glow bells on the edges); the quaking mire, a `sink` hazard (core/tags records, core/hazard's kind)
//   THE PALSAS    ice-cored peat mounds on the plateau's cold north-west (KFROST pingos, no crater): the RIM COLONY's (frost puffs,
//                 ice crust on the frozen peat, pebble mats on the flanks); permafrost, a `cold` hazard
//   THE STREAM    a meandering stream across the bog between PEAT FACES 2.5 m high (WATER.flow): curtain weed on the wet faces
//   THE CAMP      a Coyote trapping camp on the stream's bank: turf huts and drying racks (records; the culture kit is later)
// Peat and bog iron are the tribes' fuel and the smiths' ore: records (kits/resources' nodes are owed).
const STAGE={key:'mires',title:'the Mires',seed:5800,site:{px:1332,py:391}};
STAGE.hint='The Outlands, station 8: the Mires, the boreal plateau at 3.9 km (Dfb, 1,176 mm), the Outlands\' muskeg. The flora is COLONIAL and here at its smallest: on the peat strings that cross the bog, mast colonies whose comb masts stand like bog pines in lines on their seams; in the flarks\' pools between them, the river colony\'s floating mire pads, pipe reeds and glow bells; on the palsas (ice-cored peat mounds) the rim colony\'s frost puffs and black ice crust. A stream runs between peat faces; a Coyote trapping camp stands on its bank. The flarks are a quaking mire (the sink hazard)';
const SUN_POS2=[-900,900,1100];sun.position.set(...SUN_POS2);sun.intensity=1.2;HEMI.intensity=.92;
scene.fog.density=.00016;HAZE.set(0xc0c8cc);scene.fog.color.copy(HAZE);
// ---------------------------------------------------------------- the land
function baseH(x,z){return 3935-.010*x+.002*z+6*(fbm(x*.0007+5,z*.0007+1,581,3)-.5)+1.5*(fbm(x*.004-3,z*.004+7,583,2)-.5);}
// THE STRINGS: f 0..1 across a string's period (70 m in x, the strings wavering north-south)
const SP=70,strF=(x,z)=>{const u=(x+28*Math.sin(z*.0042+.3)+16*Math.sin(z*.011+1.7)+30*(fbm(x*.003,z*.003,585,2)-.5))/SP;return u-Math.floor(u);};
const strI=(x,z)=>Math.floor((x+28*Math.sin(z*.0042+.3)+16*Math.sin(z*.011+1.7)+30*(fbm(x*.003,z*.003,585,2)-.5))/SP);
const strH=f=>f<.32?1.25*Math.sin(f/.32*Math.PI):-.55*smooth(.36,.5,f)*smooth(.95,.8,f);
// THE PALSAS (KFROST pingos, flat-topped, no crater) on the cold north-west
const PALSA=(function(){const out=[];for(let j=-6;j<=0;j++)for(let i=-6;i<=0;i++){const h0=KRAND.hash(5811,i,j,0x51),u=q=>KRAND.unit(KRAND.hash(h0,q,0,0x52));
  const x=(i+u(1))*420,z=(j+u(2))*420;if(x<-TERR.R+250||z<-TERR.R+250||x>-500||z>-400||u(3)>.6)continue;out.push({id:'palsa'+out.length,x,z,r:26+22*u(4),h:3.5+3.5*u(5),crater:.06,craterD:.08});}return out;})();
const FROST=KFROST.create({seed:5813,ground:baseH,pingos:PALSA});
// THE STREAM: west to east across the bog's south half, between peat faces
const STREAM=KRELIEF.meander([-3700,1300],[3700,1750],{amp:160,wave:700,step:20,seed:5815});
// the nearest point of the stream's line (its index k and the distance d), on core/space: past 60 m, d is 1e9 (nothing there reads it)
const _sSp=KSPACE.create({cell:40});STREAM.forEach((p,k)=>_sSp.insert({k},p[0],p[1],0));const _sq=[];
const _sIdx=(x,z)=>{_sSp.query(x,z,60,_sq);let b=1e18,k=0;for(const o of _sq){const p=STREAM[o.k],d=(p[0]-x)*(p[0]-x)+(p[1]-z)*(p[1]-z);if(d<b){b=d;k=o.k;}}return{k,d:_sq.length?Math.sqrt(b):1e9};};
// the stream's bed: graded east (a running minimum of the bog's ground, 2.6 m down)
const STREAM_BED=(function(){const B=[];let lo=1e9;for(const p of STREAM){lo=Math.min(lo,baseH(p[0],p[1])-2.6);B.push(lo);}return B;})();
// THE POOLS in the flarks: one in some of the cells of each gap between strings (by string index and 90 m along it), elongated along the string
const POOLS=(function(){const out=[];for(let i=-52;i<=52;i++)for(let j=-40;j<=40;j++){const h0=KRAND.hash(5817,i,j,0x53),u=q=>KRAND.unit(KRAND.hash(h0,q,0,0x54));if(u(1)>.5)continue;
  const z=(j+.2+.6*u(2))*90,x0=(i+.66)*SP,x=x0-28*Math.sin(z*.0042+.3)-16*Math.sin(z*.011+1.7);
  if(Math.abs(x)>TERR.R-120||Math.abs(z)>TERR.R-120)continue;const sp=_sIdx(x,z);if(sp.d<60)continue;
  if(PALSA.some(P=>Math.hypot(x-P.x,z-P.z)<P.r*2.2))continue;const rx=14+8*u(3),rz=26+20*u(4);out.push({x,z,rx,rz,r:Math.max(rx,rz),l:0,name:'A flark pool'});}return out;})();
const poolD=(P,x,z)=>Math.hypot((x-P.x)/P.rx,(z-P.z)/P.rz);
function land0(x,z){let h=baseH(x,z)+strH(strF(x,z))*(1-smooth(.2,.6,FROST.sample(x,z,{}).pingo||0))+FROST.h(x,z);return h;}
POOLS.forEach(P=>{P.l=land0(P.x,P.z)-.15;P.poly=[];for(let k=0;k<16;k++){const a=k/16*TAU;P.poly.push([P.x+Math.cos(a)*P.rx*1.12,P.z+Math.sin(a)*P.rz*1.12]);}});
const _pIdx=KSPACE.create({cell:60});POOLS.forEach(P=>_pIdx.insert(P,P.x,P.z,P.r*1.3));
const _pq=[];
function poolAt(x,z){_pIdx.query(x,z,0,_pq);for(const P of _pq){const d=poolD(P,x,z);if(d<1.25)return{P,d};}return null;}
function land1(x,z){let h=land0(x,z);const q=poolAt(x,z);if(q)h=Math.min(h,mix(h,q.P.l-1.3,smooth(1.25,.75,q.d)));
 const s=_sIdx(x,z);if(s.d<40){const bed=STREAM_BED[s.k];h=mix(h,Math.min(h,bed),smooth(25,14,s.d));}return h;}
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=land1(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
const STREAM_W=(k)=>STREAM_BED[k]+1.2;
function waterH(x,z){const q=poolAt(x,z);if(q&&q.d<1.15)return q.P.l;const s=_sIdx(x,z);if(s.d<18)return STREAM_W(s.k);return -1e9;}
// THE CAMP on the stream's north bank
const CAMP=(function(){const p=STREAM[Math.floor(STREAM.length*.58)];return{x:p[0]+20,z:p[1]-95,r:45};})();
// ---------------------------------------------------------------- the fields
const SPINE=[];for(let x=-2800;x<=2800;x+=800)for(const z of[-2600,-1400,-200,1000,2200])SPINE.push([x,z]);SPINE.push([CAMP.x,CAMP.z]);PALSA.forEach(P=>SPINE.push([P.x,P.z]));
const NEAR=STAGEKIT.nearField(SPINE,90,260);
function fieldsAt(x,z,h,slope){const f=strF(x,z),S=FROST.sample(x,z,{}),pal=S.pingo||0,q=poolAt(x,z),s=_sIdx(x,z),pool=q?smooth(1.25,.9,q.d):0,stream=smooth(40,16,s.d);
 const str=(f<.32?1:0)*(1-pal)*(1-stream),flark=(f>.4&&f<.92?1:0)*(1-pal),shore=q?smooth(.5,0,Math.abs(q.d-1.05)):0,face=stream*smooth(.2,.5,slope);
 const pr=PALSA.reduce((b,P)=>Math.max(b,smooth(P.r*2.4,P.r*1.2,Math.hypot(x-P.x,z-P.z))),0),inC=Math.hypot(x-CAMP.x,z-CAMP.z)<CAMP.r?1:0;
 return{near:NEAR(x,z),wet:clamp(.6+.3*flark+.4*pool,0,1),flow:stream*.5,upland:.9,rock:0,slope,seep:clamp(face*.9+flark*.2,0,1),mast:str,cold:.7+.3*pal,
  bog:1-pal,string:str,flark,pool,shore:Math.max(shore,stream*.4),palsa:pal,stone:pal*.8,deadwood:str*.6,camp:inC,
  z_mast:clamp(Math.max(str*.85,stream*.9),0,1)*(1-inC)*(1-smooth(.3,.7,pr)),z_river:clamp(Math.max(flark*.8,pool,.32*(1-pr)),0,1)*(1-inC)*(1-smooth(.4,.8,pr)),z_rim:clamp(pr,0,1)*(1-inC)};}
const FNAMES=['near','wet','flow','upland','rock','slope','seep','mast','cold','bog','string','flark','pool','shore','palsa','stone','deadwood','camp','z_mast','z_river','z_rim'];
const {FC,FIELD}=STAGEKIT.fields(FNAMES,fieldsAt,terrainH);
/* the slope exact (2 m) within 40 m of the stream: the peat faces are 11 m wide, under one of the cache's 18 m cells (the curtain weed needs them) */
{const sl=FIELD.slope;FIELD.slope=(x,z)=>{if(_sIdx(x,z).d>40)return sl(x,z);const e=2,gx=(terrainH(x+e,z)-terrainH(x-e,z))/(2*e),gz=(terrainH(x,z+e)-terrainH(x,z-e))/(2*e);return clamp(Math.hypot(gx,gz),0,1);};
 const se=FIELD.seep;FIELD.seep=(x,z)=>{const s=_sIdx(x,z);return s.d>40?se(x,z):Math.max(se(x,z),smooth(36,14,s.d)*smooth(.2,.4,FIELD.slope(x,z))*.95);};}
// ---------------------------------------------------------------- the host binding
function rootMask(x,z){const h=terrainH(x,z),d=h-waterH(x,z);let w=d<.15?0:d<.7?(d-.15)/.55:1;if(w>0&&Math.hypot(x-CAMP.x,z-CAMP.z)<CAMP.r)return 0;return w;}
BIO.init({tags:'outlands',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:rootMask,
 obstacles:[],ticks:tick,seed:5800,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,capThrow:false,
 lod:{hero:240,mid:600,far:2600,floor:[180,460]},windows:{}});
{const Q=new URLSearchParams(location.search);BIO.INDEX_ITEMS=Q.get('index')!=='0';
 BIO.LOD.merge=Q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&Q.get('lodfade')!=='0'?.15:0;BIO.LOD.cull=BIO.LOD.fade>0&&Q.get('lodcull')!=='0';}
BIO.setSun(SUN_POS2);
// ---------------------------------------------------------------- the records before the kit: the hazards, the camp, the peat and bog iron
const HAZ=[];
function miresBuild(){
 // the quaking mire: a `sink` hazard over each 400 m cell's flarks (move: a walker sinks and slows); the palsas' permafrost: `cold`
 for(let j=-8;j<=8;j++)for(let i=-8;i<=8;i++){const x=i*400+200,z=j*400+200;if(Math.abs(x)>TERR.R||Math.abs(z)>TERR.R||FIELD.palsa(x,z)>.3)continue;
  HAZ.push({kind:'sink',rec:BIO.record({kind:'hazard',key:'sink:'+i+'_'+j,name:'The quaking mire (the flarks between the strings: the ground gives)',x,y:terrainH(x,z)-2,z,r:200,h:4,
   tags:{hazard:{kind:'sink',move:{speed:.35,sink:.04},shape:{type:'box',w:400,d:400,h:4}}}})});}
 PALSA.forEach(P=>HAZ.push({kind:'cold',rec:BIO.record({kind:'hazard',key:'cold:'+P.id,name:'Permafrost under a palsa',x:P.x,y:terrainH(P.x,P.z)-P.h,z:P.z,r:P.r,h:P.h+2,tags:{hazard:{kind:'cold'}}})}));
 PALSA.forEach(P=>REGISTER({name:'A palsa (a peat mound on a core of ice)',kind:'feature',key:P.id,x:P.x,z:P.z,y:baseH(P.x,P.z)-1,r:P.r,h:P.h+3}));
 // the peat cuttings and the bog iron: resource records (kits/resources' nodes, owed)
 const pi=STREAM[Math.floor(STREAM.length*.35)];BIO.record({kind:'resource',key:'peat:0',name:'Peat (cut from the stream\'s faces: the tribes\' fuel)',x:pi[0],y:terrainH(pi[0],pi[1]),z:pi[1]+30,r:60,h:4});
 const bi=STREAM[Math.floor(STREAM.length*.72)];BIO.record({kind:'resource',key:'bogiron:0',name:'Bog iron (in the flarks\' red mud: the smiths\' ore)',x:bi[0],y:terrainH(bi[0],bi[1]),z:bi[1]-60,r:80,h:4});
 // the trapping camp: turf huts (low domes) and drying racks
 const g=new THREE.Group(),turf=new THREE.MeshLambertMaterial({color:0x5e5a3e}),wood=new THREE.MeshLambertMaterial({color:0x6a5440});let n=0;
 for(let k=0;k<3;k++){const a=k*2.1+.4,x=CAMP.x+Math.cos(a)*16,z=CAMP.z+Math.sin(a)*14,y=terrainH(x,z),m=new THREE.Mesh(new THREE.SphereGeometry(3.4,12,6,0,TAU,0,Math.PI/2),turf);
  m.scale.set(1,.7,1);m.position.set(x,y-.2,z);g.add(m);REGISTER({name:'A turf hut (the Coyote trappers\' winter camp)',kind:'structure',x,z,y:y-1,r:3.6,h:3.5});n++;}
 for(let k=0;k<4;k++){const x=CAMP.x-10+k*5,z=CAMP.z+18,y=terrainH(x,z);for(const dx of[-1.4,1.4]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,2.4,5),wood);p.position.set(x+dx,y+1.1,z);g.add(p);}
  const b=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,3,5),wood);b.rotation.z=Math.PI/2;b.position.set(x,y+2.2,z);g.add(b);}
 REGISTER({name:'The drying racks (pelts and fish)',kind:'structure',x:CAMP.x-2.5,z:CAMP.z+18,y:terrainH(CAMP.x,CAMP.z+18)-1,r:10,h:4});
 g.traverse(o=>{if(o.isMesh){o.userData.host=true;o.userData.inspectLabel='The Coyote trappers\' winter camp';}});scene.add(g);
 REGISTER({name:'The Coyote trappers\' winter camp',kind:'settlement',x:CAMP.x,z:CAMP.z,y:terrainH(CAMP.x,CAMP.z)-2,r:CAMP.r*1.2,h:8});
 return{hazards:HAZ.filter(h=>h.rec).length,huts:n};}
// ---------------------------------------------------------------- the stage record
const T_={sph:new THREE.Color(0x8a7a4a),sph2:new THREE.Color(0x9a6a48),str:new THREE.Color(0x6a6a3e),flark:new THREE.Color(0x4a4a32),peat:new THREE.Color(0x3a2a20),
 pal:new THREE.Color(0x7a7262),red:new THREE.Color(0x7a4a32)};
const STREAM_PTS=STREAM.map((p,k)=>[p[0],STREAM_W(k),p[1]]);
Object.assign(STAGE,{
 types:['mast','river','rim'],unlike:[['mast','river']],size:{mast:.45},share:{mast:1.2,river:1,rim:1},reach:{mast:[50,320],river:[50,380],rim:[40,260]},cell:180,
 tint:{mast:0x5a6a3a,river:0x4a5a3a,rim:0x8a8278},tintK:.14,seamCol:0x2a2018,
 paint(x,z,H,c,f){const p1=fbm(x*.014+5,z*.014-2,.7,2),p2=fbm(x*.04-3,z*.04+8,.9,2),st=f('string'),fl=f('flark'),pa=f('palsa'),sh=f('shore'),fw=f('flow');
  c.copy(T_.sph).lerp(T_.sph2,smooth(.45,.7,p1)*.45);c.lerp(T_.str,st*.5);c.lerp(T_.flark,fl*.55);c.lerp(T_.red,fl*smooth(.6,.8,p2)*.3);
  c.lerp(T_.peat,Math.max(sh*.6,fw*.8));c.lerp(T_.pal,smooth(.2,.6,pa)*.7);},
 layers:[{fam:'ground.sphagnum',name:'sphagnum',amt:.55,gain:1.15},{fam:'ground.peat',name:'peat',amt:.6,gain:1.15},{fam:'ground.tundra',name:'frozen peat',amt:.5,gain:1.15}],
 gl(x,z){const pa=smooth(.2,.6,FC.at(FC.a.palsa,x,z)),pe=smooth(.2,.7,Math.max(FC.at(FC.a.flow,x,z)*1.5,FC.at(FC.a.shore,x,z)))*(1-pa);return[(1-pa)*(1-pe),pe,pa];},
 landmarks:[{name:'The stream between its peat faces',x:STREAM[Math.floor(STREAM.length*.5)][0],z:STREAM[Math.floor(STREAM.length*.5)][1],y:STREAM_BED[Math.floor(STREAM.length*.5)]-3,r:40,h:12}],
 probes:[[STREAM[Math.floor(STREAM.length*.5)][0],-1.5,STREAM[Math.floor(STREAM.length*.5)][1]]],
 far:{h:(x,z)=>baseH(x,z)+(x<-3400?.08*(-3400-x):0),col(x,z,y,q){const L=a=>a.map(v=>Math.pow(v/255,2.2)),B=L([120,110,72]),HZ=L([196,202,206]),t=.6*smooth(3000,10000,q.r);return[B[0]+(HZ[0]-B[0])*t,B[1]+(HZ[1]-B[1])*t,B[2]+(HZ[2]-B[2])*t];}},
 sky:{"air":{"pressure":0.98,"humidity":0.75},"clouds":{"cover":0.55,"cumulus":0.6,"cirrus":0.4},"fogDensity":0.00022,
  "ridges":[{"base":1.2,"amp":0.6,"cycles":16,"octaves":2,"seed":61,"win":[270,90,2.2],"floor":-0.2,"dist":60000,"haze":0.06,"forestH":0,"rock":[0.56,0.54,0.52]},
   {"base":0.2,"amp":0.3,"cycles":30,"octaves":3,"peaks":8,"peakAmp":0.4,"seed":62,"win":[[90,120,2.5]],"floor":-0.3,"dist":20000,"haze":0.14,"forestH":0.2,"rock":[0.5,0.48,0.42]}],"landmarks":[]},
 atmos:{climate:{wet:true,cold:true},fog:{falloff:1/600,sun:.25,sky:.4}},
 water:{pools:POOLS,poolCol:0x3a3a2a,poolLabel:'A flark pool (the river colony\'s)',flows:[{name:'The bog stream',pts:STREAM_PTS,width:STREAM_PTS.map(()=>22),speed:.6,shallow:0x5a5240,deep:0x2a2418,step:8,across:3,margin:1}]},
 build:{decay:true,quality:.6},decayForms:['logcrust'],
 structures:miresBuild,
 views(){const K=STAGEKIT,W=K.near('combmast',0,-200),D=K.near('deckcap',600,-600),Mp=K.near('mirepad',300,300),Pr=K.near('pipereed',-300,600),Gb=K.near('glowbell',800,-900),
   Fp=K.near('frostpuff',PALSA[0]?PALSA[0].x:-2000,PALSA[0]?PALSA[0].z:-2000),Ic=K.near('icecrust',PALSA[1]?PALSA[1].x:-2000,PALSA[1]?PALSA[1].z:-2000),Cu=K.near('curtain',0,1500),Lg=K.near('logcrust',0,0),
   P0=PALSA.slice().sort((a,b)=>b.r*b.h-a.r*a.h)[0]||{x:-2000,z:-2000,r:30,h:5},mid=STREAM[Math.floor(STREAM.length*.5)];
  return{
   'The string bog from above':K.look(-1200,-400,160,800,600,0),
   'Bog pines in lines on a seam':K.at(W,22,.6,2.5,3),
   'Deck caps on a string':K.at(D,12,2.2,2,1.5),
   'Mire pads in a flark pool':[Mp.x+9,Mp.y+2.2,Mp.z+7,Mp.x,Mp.y,Mp.z],
   'Pipe reeds':K.at(Pr,7,1.4,1.6,1),
   'Glow bells on a pool\'s edge':K.at(Gb,5,2.2,1.5,.4),
   'The palsas':K.look(P0.x+P0.r*4,P0.z+P0.r*2.5,6,P0.x,P0.z,P0.h*.6),
   'Frost puffs on a palsa':K.at(Fp,4,1.1,1.4,.1),
   'Ice crust on the frozen peat':K.at(Ic,4,2.4,1.4,.1),
   'The stream between peat faces':(function(){const k=Math.floor(STREAM.length*.5),p=STREAM[k],q=STREAM[k+12];return[p[0],STREAM_BED[k]+4.5,p[1],q[0],STREAM_BED[k+12]+1,q[1]];})(),
   'Curtain weed on a peat face':K.at(Cu,6,1.7,1.3,1),
   'The trappers\' camp':K.look(CAMP.x+70,CAMP.z+60,14,CAMP.x,CAMP.z,1),
   'Log crust on a fallen bog pine':K.at(Lg,7,1.6,1.6,.3),
  };},
 checks(add){add('the bog pines on the strings, the pads in the pools',MRCHK.lay(OUTL.INST));add('the quaking mire and the permafrost recorded as hazards',MRCHK.haz(HAZ));},
 negatives(add){add('a bog pine in a pool',MRCHK.lay([{key:'combmast',type:'mast',x:POOLS[0].x,z:POOLS[0].z}]));add('no hazard recorded',MRCHK.haz([]));},
});
const MRCHK={
 lay(I){const bad=I.filter(f=>f.type==='mast'&&f.key!=='curtain'&&poolAt(f.x,f.z)&&poolAt(f.x,f.z).d<1);const pads=I.filter(f=>f.key==='mirepad');
  return{ok:!bad.length,detail:bad.length?bad.length+' mast forms in a pool':I.filter(f=>f.type==='mast').length+' mast forms off the pools, '+pads.length+' mire pads afloat'};},
 haz(H){const ok=H.filter(h=>h.rec),s=ok.filter(h=>h.kind==='sink').length,c=ok.filter(h=>h.kind==='cold').length;
  return{ok:s>0&&c>0&&ok.length===H.length,detail:s+' sink and '+c+' cold hazard records (core/tags)'+(ok.length<H.length?', '+(H.length-ok.length)+' refused by core/tags':'')};}};
