// ================================================================= HOST — stage: STATION 5, THE NURSERY BENCH (PLAN.md section 9)
// The dry tableland on the Outland Gate's head (5.1 px 1558,516; legacy 1286,186): BSk/BWk at 3.96-4.01 km, 110 mm, 6 °C (19 / -7; 29 /
// -17), 0.97 atm, part of the N basin's largest cold desert. The rim is at px 1558,513 (6 km north), where a 2.2 km scarp falls to the
// gap's upper floor (Cfa, 1,785 m at 1558,500). This kit owns the page; the Outland Gate kit (biomes/outlandgate/PLAN.md section 7) lists it
// as its station 5, reads it in place and draws the floor below as its far field.
// THE MAP (x east, z south; north is -z; the origin 1.5 km north of the site, so the rim is on the page, R 3400):
//   THE BENCH    z > -1500: the tableland at 3.97-4.04 km, rising a little south and west; DESERT PAVEMENT (KRELIEF.pavement) on its flats;
//                the NURSERY COLONIES (pod towers, brood pads, gall stacks, crust rosettes) round the nursery-tenders' nests (records: the
//                hexapods are kits/fauna's, owed); STEPPE COLONIES on the bench's BSk middle, ember hedging their seams
//   YARDANGS     wind-cut ridges, 2-7 m high and 50-180 m long, lined up with THE OUTLAND BORE: the night and winter wind that drains the
//                plateau north into the gap (NNW over the bench). Drawn by the stage on a KRAND lattice (KBASIN.land cuts yardangs only in a
//                drained lake's silt; the bench has no lake)
//   THE RIM      z -1500..-1800: the bench's edge, the beds showing (KSTRATA 'outland': basalt over tuffs and red beds)
//   THE SCARP    z < -1800: the fall toward the gap, COMPRESSED (as station 1's slope, KNOWN_ISSUES.md): 650 m down to the north edge here,
//                the far field carrying it on to the gap's floor at 1.8 km 10 km out, its Cfa green under the dry bench
const STAGE={key:'nursery',title:'the Nursery Bench',seed:5500,site:{px:1286,py:186}};
STAGE.hint='The Outlands, station 5: the Nursery Bench, the dry tableland at 4.0 km (BWk/BSk, 110 mm) on the Outland Gate\'s head, over the 2.2 km scarp down to the wet gap. The flora is COLONIAL: the nursery colonies pay the nursery-tender hexapods in food: pod towers riddled with egg chambers, brood pads where the young feed, gall stacks over the buried nests, crust rosettes on the desert pavement. Steppe colonies hold the bench\'s middle, ember scrub on their seams. The yardangs are cut by the Outland Bore, the night wind that drains the plateau north into the gap: the spores ride it down';
const SUN_POS2=[-800,1300,900];sun.position.set(...SUN_POS2);sun.intensity=1.45;HEMI.intensity=.8;
scene.fog.density=.00007;HAZE.set(0xc8d0da);scene.fog.color.copy(HAZE);
// ---------------------------------------------------------------- the land
const RIMZ=(x)=>-1650+140*Math.sin(x*.0011+.6)+90*(fbm(x*.0013,0,551,2)-.5);   /* the rim's line: the bench's edge */
function benchH(x,z){return 3995+.006*z-.004*x+14*(fbm(x*.0009+5,z*.0009+1,553,3)-.5)+5*(fbm(x*.004-3,z*.004+7,555,2)-.5);}
function scarpH(x,z){const r=RIMZ(x),d=r-z;   /* metres north of the rim */
 return d<=0?0:-(30*smooth(0,60,d)+620*Math.pow(smooth(0,1750,d),1.15))-25*(fbm(x*.003,z*.003,557,2)-.5)*smooth(0,100,d);}
// THE YARDANGS: streamlined ridges along the Bore (blowing toward NNW: the axis 20 degrees west of north), their blunt heads upwind
const BORE=[-Math.sin(.35),-Math.cos(.35)];   /* the way the Bore blows (x, z): north-north-west */
const YARD=(function(){const out=[];for(let j=-9;j<=9;j++)for(let i=-9;i<=9;i++){const h0=KRAND.hash(5561,i,j,0x41),u=q=>KRAND.unit(KRAND.hash(h0,q,0,0x42));
  const x=(i+u(1))*330,z=(j+u(2))*330;if(Math.abs(x)>TERR.R-250||z>TERR.R-250||z<RIMZ(x)+260||u(3)>.55)continue;
  const zone=smooth(-1200,-700,z)*smooth(2600,1500,z);if(u(4)>zone)continue;
  out.push({id:'yardang'+out.length,x,z,L:50+130*u(5),W:12+18*u(6),H:2+5*u(7),ang:Math.atan2(BORE[0],BORE[1])+(u(8)-.5)*.12});}return out;})();
function yardH(x,z){let h=0;for(const Y of YARD){const dx=x-Y.x,dz=z-Y.z;if(Math.abs(dx)>Y.L+5||Math.abs(dz)>Y.L+5)continue;
  const ca=Math.cos(Y.ang),sa=Math.sin(Y.ang),u=(dx*sa+dz*ca)/Y.L,v=(dx*ca-dz*sa)/Y.W;   /* u along the Bore (+1 downwind), v across */
  if(u<-1||u>1)continue;const wv=1-(u<0?u*u*u*u:u*u)*.9,q=v*v/(wv*wv+1e-6);if(q>=1)continue;h=Math.max(h,Y.H*Math.pow(1-q,.8)*(u<0?Math.sqrt(1-u*u*u*u):1-u*u));}
 return h;}
const STRATA=KSTRATA.create({seed:5501,recipe:'outland',range:[3200,4100],dip:[.4,.8,.004],warp:[6,2]});
function land0(x,z){return benchH(x,z)+scarpH(x,z)+yardH(x,z);}
const _ledgeK=(x,z)=>{const d=RIMZ(x)-z;return d>0?.75*smooth(0,40,d)*smooth(1900,1500,d):0;};
function land1(x,z){const h=land0(x,z),k=_ledgeK(x,z);return k>.02?STRATA.terrace(x,z,h,k):h;}
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=land1(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function waterH(){return -1e9;}
const POOLS=[];
// DESERT PAVEMENT (KRELIEF.pavement): packed varnished pebbles on the bench's flats, in patches
const PAVE=KRELIEF.pavement({h:terrainH,slope:[.05,.16],patch:.4,seed:5503});
// the bench's BSk middle (the steppe colony's), the BWk round it (the nursery colony's), overlapping on a band
const BSK=(x,z)=>smooth(1300,700,Math.hypot((x-200)/1.4,z-300)+220*(fbm(x*.0012,z*.0012,559,2)-.5));
// THE NESTS: the nursery-tenders' (kits/fauna's hexapods, owed): one in a few of a 260 m lattice's cells on the bench, each a record
const NESTS=(function(){const out=[];for(let j=-8;j<=8;j++)for(let i=-8;i<=8;i++){const h0=KRAND.hash(5571,i,j,0x43),u=q=>KRAND.unit(KRAND.hash(h0,q,0,0x44));
  const x=(i+u(1))*260,z=(j+u(2))*260;if(Math.abs(x)>TERR.R-220||z>TERR.R-220||z<RIMZ(x)+200||u(3)>.42||BSK(x,z)>.35)continue;out.push({id:'nest'+out.length,x,z,r:14+10*u(4)});}return out;})();
const nestAt=(x,z)=>{let b=0;for(const N of NESTS){const d=Math.hypot(x-N.x,z-N.z);if(d<N.r*3)b=Math.max(b,smooth(N.r*3,N.r*.4,d));}return b;};
// carrion by the nests (the hexapods' dead, the stalkers' kills): the bone bloom's
const KILLS=NESTS.filter((N,i)=>KRAND.unit(KRAND.hash(5573,i,1))<.35).map((N,i)=>{const a=KRAND.unit(KRAND.hash(5573,i,2))*TAU;return[N.x+Math.cos(a)*(N.r*2.2),N.z+Math.sin(a)*(N.r*2.2)];});
// ---------------------------------------------------------------- the fields
const SPINE=[];for(let x=-2800;x<=2800;x+=800)for(const z of[-1200,-200,800,1800,2800])SPINE.push([x,z]);for(let x=-2400;x<=2400;x+=1200)SPINE.push([x,RIMZ(x)+60]);
const NEAR=STAGEKIT.nearField(SPINE,90,260);
function fieldsAt(x,z,h,slope){const d=RIMZ(x)-z,bench=smooth(40,-20,d),pav=PAVE(x,z)*bench,nest=nestAt(x,z),st=BSK(x,z)*bench;
 let carr=0;for(const k of KILLS){const q=Math.hypot(x-k[0],z-k[1]);if(q<30)carr=Math.max(carr,smooth(30,4,q));}
 return{near:NEAR(x,z),wet:.08,upland:.9,rock:clamp(Math.max(smooth(.5,.85,slope),_ledgeK(x,z)*.8),0,1),slope,dry:1,barren:.6,cold:.55,pavement:pav,nest,carrion:carr,
  scarp:smooth(0,200,d),bsk:st,z_nursery:bench*smooth(.75,.45,st),z_steppe:bench*smooth(.3,.6,st)};}
const FNAMES=['near','wet','upland','rock','slope','dry','barren','cold','pavement','nest','carrion','scarp','bsk','z_nursery','z_steppe'];
const {FC,FIELD}=STAGEKIT.fields(FNAMES,fieldsAt,terrainH);
// ---------------------------------------------------------------- the host binding
function rootMask(x,z){return 1;}
BIO.init({tags:'outlands',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:rootMask,
 obstacles:[],ticks:tick,seed:5500,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,capThrow:false,
 lod:{hero:240,mid:600,far:2600,floor:[180,460]},windows:{}});
{const Q=new URLSearchParams(location.search);BIO.INDEX_ITEMS=Q.get('index')!=='0';
 BIO.LOD.merge=Q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&Q.get('lodfade')!=='0'?.15:0;BIO.LOD.cull=BIO.LOD.fade>0&&Q.get('lodcull')!=='0';}
BIO.setSun(SUN_POS2);
// the nests as records, before the kit draws (a shallow scrape, a ring of turned earth: painted, 84)
function nestRecords(){NESTS.forEach(N=>REGISTER({name:'A nursery-tender\'s nest (a hexapod\'s scrape under the gall stacks; the hexapods are kits/fauna\'s)',kind:'nest',key:N.id,x:N.x,z:N.z,y:terrainH(N.x,N.z)-1,r:N.r,h:6}));
 YARD.forEach(Y=>BIO.record({kind:'feature',key:Y.id,name:'A yardang (cut by the Outland Bore)',x:Y.x,z:Y.z,r:Y.L,h:Y.H,ang:Y.ang}));return{nests:NESTS.length,yardangs:YARD.length};}
// ---------------------------------------------------------------- the stage record
const T_={grav:new THREE.Color(0x9a7e66),pav:new THREE.Color(0x5e4a3e),pav2:new THREE.Color(0x6e5848),sand:new THREE.Color(0xb49a7a),bsk:new THREE.Color(0x9a8c6a),
 scarp:new THREE.Color(0x7a6a62),nest:new THREE.Color(0xc8a070),yard:new THREE.Color(0xc4ac88)};
Object.assign(STAGE,{
 types:['nursery','steppe'],strata:STRATA,unlike:[['nursery','steppe']],share:{nursery:1.4,steppe:1},
 tint:{nursery:0xb0784a,steppe:0x8a6e52},tintK:.18,
 paint(x,z,H,c,f){const p1=fbm(x*.012+5,z*.012-2,.7,2),p2=fbm(x*.03-3,z*.03+8,.9,2),pv=f('pavement'),ne=f('nest'),st=f('bsk'),sc=f('scarp'),y=yardH(x,z);
  c.copy(T_.grav).lerp(T_.sand,smooth(.45,.7,p1)*.5);c.lerp(T_.pav,pv*.75);c.lerp(T_.pav2,pv*smooth(.4,.7,p2)*.4);c.lerp(T_.bsk,st*.45);
  c.lerp(T_.yard,smooth(.5,3,y)*.55);c.lerp(T_.nest,smooth(.55,.95,ne)*.5);c.lerp(T_.scarp,sc*.7);},
 layers:[{fam:'ground.pavement',name:'desert pavement',amt:.6,gain:1.15},{fam:'ground.steppe',name:'steppe',amt:.45,gain:1.2},{fam:'ground.gravel',name:'gravel',amt:.45,gain:1.2}],
 gl(x,z){const pv=smooth(.2,.7,FC.at(FC.a.pavement,x,z)),st=smooth(.3,.7,FC.at(FC.a.bsk,x,z))*(1-pv);return[pv,st,(1-pv)*(1-st)];},
 landmarks:[{name:'The rim (the bench\'s edge over the scarp down to the gap)',x:0,z:RIMZ(0)-80,y:benchH(0,RIMZ(0))-200,r:500,h:260}],
 probes:[[0,-40,RIMZ(0)-120]],
 far:{h:(x,z)=>{const r=RIMZ(Math.max(-3400,Math.min(3400,x))),d=r-z;return benchH(x,Math.max(z,r))+(d>0?-(30*smooth(0,60,d)+2150*Math.pow(smooth(0,9000,d),.9)):0);},
  col(x,z,y,q){const L=a=>a.map(v=>Math.pow(v/255,2.2)),B=L([150,124,100]),G=L([84,112,74]),HZ=L([200,208,218]),wet=smooth(3300,2400,y);
   const c=[B[0]+(G[0]-B[0])*wet,B[1]+(G[1]-B[1])*wet,B[2]+(G[2]-B[2])*wet],t=.55*smooth(3500,10000,q.r);return[c[0]+(HZ[0]-c[0])*t,c[1]+(HZ[1]-c[1])*t,c[2]+(HZ[2]-c[2])*t];}},
 sky:{"air":{"pressure":0.97,"humidity":0.2},"clouds":{"cover":0.2,"cumulus":0.5,"cirrus":0.55},"fogDensity":0.0001,
  "ridges":[{"base":3.6,"amp":1.1,"cycles":18,"octaves":2,"seed":57,"win":[0,120,2.2],"floor":-0.2,"dist":60000,"haze":0.05,"forestH":0,"rock":[0.6,0.56,0.56]},
   {"base":0.3,"amp":0.5,"cycles":30,"octaves":3,"peaks":10,"peakAmp":0.5,"seed":58,"win":[[150,100,2.5]],"floor":-0.3,"dist":30000,"haze":0.1,"forestH":0,"rock":[0.6,0.5,0.44]}],"landmarks":[]},
 atmos:{climate:{wet:false,cold:true,dry:true},fog:{falloff:1/1000,sun:.35,sky:.3}},
 build:{decay:true,quality:.8},decayForms:['bonebloom'],
 structures:nestRecords,
 views(){const K=STAGEKIT,N0=NESTS.slice().sort((a,b)=>Math.hypot(a.x-300,a.z-200)-Math.hypot(b.x-300,b.z-200))[0]||{x:0,z:0,r:15},
   Pt=K.near('podtower',N0.x+60,N0.z),Bp=K.near('broodpad',N0.x,N0.z),Gs=K.near('gallstack',N0.x,N0.z),Ro=K.near('rosette',-900,1200),Em=K.near('ember',200,300),Bb=K.near('bonebloom',0,0),
   Y0=YARD.slice().sort((a,b)=>b.H*b.L-a.H*a.L)[0]||{x:0,z:0,L:80,H:4,ang:0},rz=RIMZ(0);
  return{
   'The bench from above':K.look(-1500,2900,320,500,-200,0),
   'Over the rim to the gap':[0,K.gh(0,rz+60,4),rz+60,0,K.gh(0,rz-1700,0)-200,rz-2600],
   'The rim from the scarp\'s side':K.look(900,rz-500,60,200,rz+120,10),
   'A nursery round a nest':K.look(N0.x+N0.r*3.2,N0.z+N0.r*1.8,4,N0.x,N0.z,1),
   'Pod towers':K.at(Pt,12,.8,2.5,2.5),
   'A brood pad and its eggs':K.at(Bp,4.5,1.6,1.6,.1),
   'Gall stacks over a nest':K.at(Gs,6,2.4,1.8,.9),
   'Crust rosettes on the pavement':K.at(Ro,4,1.1,1.4,0),
   'Yardangs in the Bore':(function(){const cx=Y0.x+Math.sin(Y0.ang)*Y0.L*2.2+60,cz=Y0.z+Math.cos(Y0.ang)*Y0.L*2.2;return[cx,K.gh(cx,cz,6),cz,Y0.x,terrainH(Y0.x,Y0.z)+1,Y0.z];})(),
   'Ember scrub on the bench\'s seams':K.at(Em,10,.6,2.2,.6),
   'Bone bloom by a nest':K.at(Bb,4.5,1.1,1.5,.2),
  };},
 checks(add){add('every nest a record, each with nursery forms round it',NUCHK.nests(NESTS,OUTL.INST));add('yardangs lined up with the Bore',NUCHK.yard(YARD));},
 negatives(add){add('a nest with no forms near it',NUCHK.nests([{id:'x',x:9e4,z:9e4,r:15}],OUTL.INST));add('a yardang across the wind',NUCHK.yard([{ang:Math.atan2(BORE[0],BORE[1])+1.2}]));},
});
const NUCHK={
 nests(N,I){const bad=N.filter(n=>!REG.some(r=>r.key===n.id)||!I.some(f=>f.type==='nursery'&&Math.hypot(f.x-n.x,f.z-n.z)<n.r*3));
  return{ok:N.length>0&&!bad.length,detail:bad.length?bad.length+' of '+N.length+' nests with no record or no nursery form within 3 radii':N.length+' nests, each a record with the nursery colony\'s forms round it'};},
 yard(Y){const a0=Math.atan2(BORE[0],BORE[1]),bad=Y.filter(y=>{let d=Math.abs(((y.ang-a0)%Math.PI+Math.PI*1.5)%Math.PI-Math.PI/2);return d>.15;});
  return{ok:Y.length>0&&!bad.length,detail:bad.length?bad.length+' yardangs more than 9 degrees off the Bore':Y.length+' yardangs, each within 9 degrees of the Bore (NNW)'};}};
