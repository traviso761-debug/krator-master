// ================================================================= factory additions (called from buildFactory)
// The Foundry's merge sink. buildFactory used to add one mesh per lobe, stack,
// cap and lining - 109 of them, the heaviest draw-call type in the kit. Each
// surface is now pushed here with its offset baked in and merged per material
// once the builder is done. Opaque materials only: glass stays its own mesh.
function facSink(){const B=new Map();
 return{add(geo,mat,x,y,z){if(x||y||z)geo.translate(x||0,y||0,z||0);if(!B.has(mat))B.set(mat,[]);B.get(mat).push(geo);},
  flush(parent){for(const [mat,gs] of B){if(YFLAT)for(const g of gs)mesh(g,mat,parent);else meshMerged(gs,mat,parent);}B.clear();}};}
function factoryExtras(G,d,skin,M){
 // three lattice cooling hyperboloids (Babel skins) west of the hall. Moved
 // east and slimmed to .85 (were at x=-150/-105, 22 m at the foot): the intact
 // Foundry's tank farm stood inside the rehabilitated one's towers, 330 m east.
 [[-132,40],[-132,92],[-92,102]].forEach((p,i)=>{const Hc=70,cut=d>0&&i===1?Hc*.42:null;
  const lat=(u,y)=>{if(SEGK<.55)return false;const a=u*TAU*5,b=y*.15;return Math.abs(Math.sin(a+b))>.34&&Math.abs(Math.sin(a-b))>.34;};
  const hole=(u,y)=>lat(u,y)||(d>0&&fbm(u*4,y*.05,60+i,2)<.3*d);
  const rFn=y=>(13+9*Math.pow(Math.abs(y/Hc-.6)/.6,1.6))*.85;
  M.add(lathe({rFn,H:Hc,cut,jag:cut?4:0,nu:80,nv:40,hole,seed:60+i}),skin,p[0],6,p[1]);
  M.add(lathe({rFn:y=>rFn(y)*.88,H:Hc,cut,jag:cut?4:0,nu:32,nv:6,seed:60+i}),MAT.dark,p[0],6,p[1]);
  kput(d>0?'ringR':'ringW',[p[0],6+(cut||Hc),p[1]],qEuler(Math.PI/2,0,0),[rFn(cut||Hc)*1.02,rFn(cut||Hc)*1.02,10],null);
  for(let k=0;k<3;k++){const th=k/3*TAU+.3;kput(d>0?'pipeR':'pipe',[p[0]+rFn(0)*.7*Math.cos(th),6,p[1]+rFn(0)*.7*Math.sin(th)],null,[1.2,10,1.2],null);}
  if(cut)rubbleRing(p[0],6,p[1],10,30,60,2.5);});
 // pipe rack from the cooling towers to the hall
 // (it follows the towers east: its deck used to run 10 m into the first one)
 for(let i=0;i<5;i++){const z=30+i*4;kput(d>0?'pipeR':'pipe',[-104,15+i%2*3,z],qEuler(0,0,Math.PI/2),[.9,44,.9],null);}
 for(const x of [-112,-90])for(let i=0;i<2;i++)kput(d>0?'colR':'colW',[x,6,26+i*20],null,[1,10,1],null);
 kput(d>0?'strutR':'strutW',[-100,16.5,38],null,[34,.6,26],null);
 // tank farm + gantry crane east of the silos, 16 m further west than they were
 // (see the plinth note in buildFactory); EX is that shift.
 const EX=-16;
 for(let i=0;i<6;i++){const tx=135+EX+(i%2)*32,tz=10+Math.floor(i/2)*34;const R=11;const gone=d>0&&i===3;
  for(let k=0;k<4;k++){const th=(k+.5)*Math.PI/2;kput(d>0?'colR':'colW',[tx+7*Math.cos(th),6,tz+7*Math.sin(th)],null,[1.2,9,1.2],null);}
  if(!gone)M.add(lathe({rFn:y=>R*Math.sqrt(clamp(1-Math.pow((y-R)/R,2),0,1))+.01,H:2*R,nu:32,nv:14,hole:holeFn(d*.8,70+i,null,2)}),skin,tx,15-R*.15,tz);
  else{const fm=mesh(lathe({rFn:y=>R*Math.sqrt(clamp(1-Math.pow((y-R)/R,2),0,1))+.01,H:2*R,nu:32,nv:14,hole:holeFn(1,70+i,null,1.5)}),MAT.rust,G,tx+9,6,tz+6);fm.rotation.set(0.6,0,1.2);dropFragment(fm);}
  kput(d>0?'pipeR':'pipe',[tx,15,tz-R-2],qEuler(Math.PI/2,0,0),[.8,8,.8],null);}
 kput(d>0?'pipeR':'pipe',[124,10,-10],qEuler(0,0,Math.PI/2),[1,70,1],null);kput(d>0?'pipeR':'pipe',[105+EX,10,0],qEuler(Math.PI/2,0,0),[1,60,1],null);
 // legs start at the ground, not the plinth top: the east pair now stand just
 // off the plinth edge
 [[112,-8],[112,96],[184,-8],[184,96]].forEach(p=>{const px=p[0]+EX;beam(d>0?'strutR':'strutW',[px-6,0,p[1]],[px,52,p[1]],3,3);beam(d>0?'strutR':'strutW',[px+6,0,p[1]],[px,52,p[1]],3,3);});
 [-8,96].forEach(z=>kput(d>0?'strutR':'strutW',[148+EX,53,z],null,[84,3.5,4],null));
 const cz=d>0?70:30;kput(d>0?'strutR':'strutW',[148+EX,55.5,cz],null,[6,3,110],null);kput(d>0?'strutR':'strutW',[(d>0?128:160)+EX,53,cz],null,[8,5,8],null);
 factorySilo(G,d,skin,M);
 // twin hypar furnace shells on the south apron
 // (round 2) They stood 60 x 48 m at z=96, i.e. from z=72, eight metres INSIDE
 // the hall's south end wall (z=80), filling its great arched opening from every
 // southern view. Now 44 x 32 m at z=104: 8 m clear of the wall, clear of the
 // nearest cooling tower (x<-73) and inside the plinth's south edge (123).
 luceShells(G,-40,104,44,32,16,d,90,skin);
 if(d>0)rubbleRing(-40,6,104,16,22,40,2.5);}

// ================================================================= CIVIC HELPERS (QA pass, 2026-09-29)
// Shared by the civic builders this group owns: Offices, Starport, Bunker,
// Library, Gate, Robotics, Data center, Police, Hospital, Campus, Government.
// They live here because this is the first of those fragments; they are
// function declarations, so later fragments can call them.
//
// civDef: a LAZY, GUARDED kdef. kdef() called a second time for a name wipes
// every instance already put under it (KIT.items[name]=[]) and pushes the name
// into KIT.order again, so kbake builds it twice. The Library did exactly that
// per decay level and lost its ruined ribs; anything defined inside a builder
// must come through here.
function civDef(name,mk,mat){if(!KIT.defs[name])kdef(name,mk(),mat);return name;}
// Loose triangles (flat list of xy pairs, three per triangle) in the z=0 plane.
function civTriGeo(xy){const P=[];for(let i=0;i<xy.length;i+=2)P.push(xy[i],xy[i+1],0);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.computeVertexNormals();return g;}
// GLASS SHARDS. A dead window (winSmD, winD, winBigD, ovalD, paneD) is an
// opening with the glass gone; this leaves a few jagged teeth of it standing in
// the frame, the way a broken pane actually fails, on roughly half of them.
// The shards are drawn in a unit window (x,y in -.5..+.5) and kept to the lower
// sides and the apex so they stay inside an arched or oval opening. Choice is
// by position hash, not rng(), so adding shards moves no other ruin detail.
const CIV_SHARD_XY=[
 [-.5,-.5,-.08,-.5,-.5,-.02, .5,-.5,.5,-.12,.22,-.5, -.02,.5,.12,.46,.04,.02, .5,.1,.5,-.05,.3,.0],
 [-.44,-.5,-.12,-.5,-.3,-.1, .02,-.5,.42,-.5,.26,-.06, -.5,.02,-.5,.3,-.28,.16, -.5,-.5,-.5,-.3,-.4,-.44],
 [-.5,-.5,.1,-.5,-.36,-.32, .5,-.28,.5,.24,.32,-.02, -.06,.5,.08,.5,-.02,-.08, .18,-.5,.5,-.5,.44,-.3]];
const CIV_WIN={winSmD:[1.1,2,.4,1],winD:[2.2,4.2,.7,1],winBigD:[3,3.6,.7,1],ovalD:[2,2,.6,.68],paneD:[1,1,.12,1]};
function civWin(name,p,q,s,frac){kput(name,p,q,s,null);const W=CIV_WIN[name];if(!W||!q)return;
 const h=h3(p[0]*.173+.3,p[1]*.291+.7,p[2]*.117+.1);if(h>(frac==null?.5:frac))return;
 const S=typeof s==='number'?[s,s,s]:s;const sh=W[3];
 civShardAt(p,q,W[0]*S[0]*sh,W[1]*S[1]*sh,W[2]*S[2]/2+.04,h);}
// One cluster of shards, w x h, `out` metres proud along q's +z; h in 0..1 picks it.
// One kit mesh for all shards: a kit InstancedMesh is never culled, so each is
// a draw call in every view. Variety comes from mirroring and the height scale.
function civShardAt(p,q,w,ht,out,h){civDef('civShard',()=>civTriGeo(CIV_SHARD_XY[0].concat(CIV_SHARD_XY[1].slice(0,6),CIV_SHARD_XY[2].slice(12,18))),MAT.glass);
 const off=new THREE.Vector3(0,0,out).applyQuaternion(q);const i=(h*6|0)%3;
 kput('civShard',[p[0]+off.x,p[1]+off.y,p[2]+off.z],q,[w*((h*97|0)%2?1:-1),ht*(i===1?.8:i===2?.9:1),1],null);}
// INTERIORS. What a hole in a round shell shows: floor plates out to the
// skin, a corridor light strip under each ceiling (mostly dead in a ruin, a
// few still on), cabinets and machinery silhouettes, touch panels and conduit
// bundles dropping through the floors. Everything is kit instances, placed in
// the band between the skin (rFn) and a liner the builder draws at `rIn`
// (a fraction of rFn), so it reads as rooms instead of a black wall.
// y0..y1 local to (cx,cy,cz); `cut` stops it under a broken top.
const CIV_FLOOR=new THREE.Color(0x3a3834);
// o: {cx,cy,cz, rFn, y0,y1, step, d, seed, cut, rIn=.72, gap(th)->bool, out, dens=6.5 (m per bay)}
// `gap` leaves a sector empty (a collapse); with `out` (an array) the floors
// are annuli pushed there for the caller to meshMerge, so a gap can cut them.
function civRooms(o){const rIn=o.rIn||.72,cx=o.cx||0,cy=o.cy||0,cz=o.cz||0,step=o.step,d=o.d,seed=o.seed||0,gap=o.gap||null;
 for(let y=o.y0,f=0;y<o.y1-1;y+=step,f++){if(o.cut!=null&&y>o.cut-2)break;const R=o.rFn(y+step*.5);
  if(o.out)o.out.push(gridSurface((u,v)=>{const th=u*TAU,r=R*lerp(rIn,.965,v);return[cx+r*Math.cos(th),cy+y,cz+r*Math.sin(th)];},64,1,{hole:gap?(u,v)=>gap(u*TAU):null}));
  else kput('slab',[cx,cy+y,cz],null,[R*.965,.45,R*.965],CIV_FLOOR);
  const n=Math.max(6,Math.round(R*TAU/(o.dens||6.5)));const rm=R*(1+rIn)/2;
  for(let k=0;k<n;k++){const th=(k+.5)/n*TAU;if(gap&&gap(th))continue;const c=Math.cos(th),s=Math.sin(th),hh=h3(k*1.31+seed,f*2.17,seed*.013);
   const lit=d>0?hh<.12:hh<.85;
   kput('strip',[cx+c*rm,cy+y+step-.7,cz+s*rm],qEuler(0,-th-Math.PI/2,0),[R*TAU/n*.55,1,1],lit?(d>0?WARM:CYAN):DEAD);
   if(hh<.55){const w=1+hh*3,hgt=Math.min(step-1.2,1.2+hh*2.6);const rb=R*(rIn+.04)+.6;
    kput('boxD',[cx+c*rb,cy+y+.25+hgt/2,cz+s*rb],qEuler(0,-th,0),[1+hh*1.4,hgt,w],null);}
   if(hh>.8){const on=!(d>0&&hh<.93);kput(on?'cell':'cellD',[cx+c*R*(rIn+.02),cy+y+1.5,cz+s*R*(rIn+.02)],qFacing([c,0,s]),[.5,.7,1],on?CYAN:null);}
   if(k%5===2)for(let j=-1;j<=1;j++){const t2=th+j*.012;kput('tube',[cx+Math.cos(t2)*R*(rIn+.03),cy+y+step/2,cz+Math.sin(t2)*R*(rIn+.03)],null,[.22,step,.22],null);}}}}
// Drop kit instances put since `mark` ({name: KIT.items[name].length}) whose
// builder-local position fn(x,y,z) says lie in a collapse. For helpers that draw
// rng per item (stripRing, mossOnRing): calling them whole and culling after
// keeps every later rng draw where it was. Takes the per-type stats back out.
function civCull(mark,fn){for(const nm in mark){const it=KIT.items[nm];const keep=it.slice(0,mark[nm]);
 for(let i=mark[nm];i<it.length;i++){const o=it[i];if(fn(o.p[0]-KOFF[0],o.p[1]-KOFF[1],o.p[2]-KOFF[2])){const t=tcur();if(t){t.inst--;t.tris-=ktri(nm);}}else keep.push(o);}
 KIT.items[nm]=keep;}}
// DRAW CALLS (round 2). Every opaque Mesh under G (groups included) that shares
// a material is merged into one, in G's frame, at the end of each civic builder.
// Triangle-neutral, and pixel-neutral bar float rounding (positions and normals
// are transformed, not recomputed). Transparent meshes keep their own sort.
// What moves: repairPass/wornPass sample G's faces in mesh order, so the
// salvage dressing at decay 3 (and the worn pass) lands on other faces.
function civFlatten(G){if(YFLAT)return;G.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(G.matrixWorld).invert();const by=new Map();
 G.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||!o.geometry||Array.isArray(o.material)||o.material.transparent)return;
  if(!by.has(o.material))by.set(o.material,[]);by.get(o.material).push(o);});
 const t=tcur();
 for(const [mat,list] of by){if(list.length<2)continue;const geos=[];
  for(const o of list){const m=inv.clone().multiply(o.matrixWorld);const g=o.geometry.index?o.geometry.clone():o.geometry.clone();g.applyMatrix4(m);geos.push(g);o.parent.remove(o);}
  const t0=t?t.tris:0;meshMerged(geos,mat,G);if(t){t.tris=t0;t.meshes-=list.length;}}}
// MOULDING for an arcWindowGeo(w,h) window: a half-round hood following the arch
// and a sill under it, both proud of the window's face (+z). One kit mesh.
function civHoodGeo(w,h){const t=new THREE.TorusGeometry(w/2+.2,.15,3,9,Math.PI);t.translate(0,h/2-w/2,.3);   // ~70 tris a window
 return civMergeGeo([t,new THREE.BoxGeometry(w+.7,.24,.5).translate(0,-h/2-.12,.25)]);}
// Angular distance, for sector tests.
function civDA(a,b){const x=((a-b)%TAU+TAU)%TAU;return Math.min(x,TAU-x);}

// ================================================================= OFFICES (two variants)
function buildOffices(scene,gx,gz,d){reseed(d>0?9501:9500);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 // A — flared ring (Tange mushroom)
 {REGISTER({name:'Office A — flared ring ('+STATE(d)+')',x:0,z:0,r:55,h:42});const stem=y=>y<12?11+.04*Math.pow(12-y,2):(y<21?11+32*Math.pow((y-12)/9,1.6):43);
  // RUIN: a sector of the ring has come down (it used to stand whole, rusted,
  // with the same silhouette as the intact one). SEC is its centre, facing the
  // row camera; the wall tear is ragged, the floors stick out past it, and the
  // roof, struts, windows, strips and vines in the sector are gone with it.
  const SEC=1.2,secW=y=>.5+.1*(fbm(y*.15,3.1,207,2)*2-1),inSec=(th,y)=>d>0&&y>13&&civDA(th,SEC)<secW(y);
  const hA=holeFn(d*.7,201,null,1.4);
  mesh(lathe({rFn:stem,H:32,nu:72,nv:32,hole:(u,y)=>inSec(u*TAU,y)||(hA?hA(u,y):false)}),skin,G);
  if(d>0){mesh(lathe({rFn:y=>stem(y)*(y>19?.62:.92),H:32,nu:32,nv:8,hole:(u,y)=>y>21&&civDA(u*TAU,SEC)<.34}),MAT.dark,G);
   const fl=[];civRooms({rFn:stem,y0:21,y1:32,step:5.5,d,seed:202,rIn:.62,gap:th=>civDA(th,SEC)<.4,out:fl});meshMerged(fl,CONC(d),G);}
  for(let k=0;k<32;k++){const th=k/32*TAU;if(d>0&&rng()<.35)continue;if(inSec(th,30))continue;beam(d>0?'strutR':'strutW',[Math.cos(th)*20,20,Math.sin(th)*20],[Math.cos(th)*45,40,Math.sin(th)*45],2.6,2);
   for(let r=0;r<2;r++){const rr0=43.7;const t2=th+.1;if(inSec(t2,25+r*5))continue;civWin(d>0?'winSmD':'winSmI',[Math.cos(t2)*rr0,25+r*5,Math.sin(t2)*rr0],qFacing([Math.cos(t2),0,Math.sin(t2)]),[5.5,2,1],null);}}
  if(d===0){kput('slab',[0,38.5,0],null,[44,1.2,44],new THREE.Color(0xd8d4cc));stripRing(0,30,0,41,d,48);stripRing(0,35,0,41,d,48);}
  else{// the roof disc with the fallen sector bitten out of it, and the strips that survive
   meshMerged([gridSurface((u,v)=>{const th=u*TAU,r=v*44;return[r*Math.cos(th),38.5+.6,r*Math.sin(th)];},96,8,{uS:6,vS:1,hole:(u,v)=>v>.3&&civDA(u*TAU,SEC)<.62-.2*v+.1*(fbm(u*30,v*3,208,2)-.5)}),
    gridSurface((u,v)=>{const th=u*TAU;return[44*Math.cos(th),37.9+v*1.2,44*Math.sin(th)];},96,1,{hole:(u,v)=>civDA(u*TAU,SEC)<.44})],skin,G);
   for(const yy of [30,35])for(let k=0;k<48;k++){const th=(k+.5)/48*TAU;const lit=rng()<.1;const dim=rng()<.5;if(civDA(th,SEC)<.62)continue;
    kput('strip',[41*Math.cos(th),yy,41*Math.sin(th)],qEuler(0,-th-Math.PI/2,0),[TAU*41/48*.92,1,1],lit?(dim?CYAN.clone().multiplyScalar(.5):CYAN):DEAD);}}
  for(let k=0;k<20;k++){const th=k/20*TAU;if(d>0&&rng()<.2)continue;const lean=d>0&&civDA(th,SEC)<.35;
   if(!lean)kput(d>0?'colR':'colW',[Math.cos(th)*36,0,Math.sin(th)*36],null,[1.4,19,1.4],null);
   else beam('colR',[Math.cos(th)*36,0,Math.sin(th)*36],[Math.cos(th)*41+Math.sin(th)*4,15,Math.sin(th)*41-Math.cos(th)*4],1.4,1.4);}
  mesh(lathe({rFn:()=>52,H:1.2,nu:64,nv:1}),skin,G);kput('slab',[0,1.2,0],null,[52,.4,52],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));
  apron(G,0,0,52,60,d,1.2);
  kput('archOpen',[11.5,4.8,0],qFacing([1,0,0]),[.6,.6,1],null);
  if(d>0){mossOnRing(0,1.6,0,48,50,2);
   for(let i=0;i<30;i++){const a=rng()*TAU,L=rr(4,18);const q=qEuler(rr(-.12,.12),0,rr(-.12,.12)),sx=rr(.8,1.6),sz=rr(.8,1.6);if(civDA(a,SEC)<.62)continue;kput('vine',[44*Math.cos(a),38,44*Math.sin(a)],q,[sx,L,sz],null);}
   rubbleRing(0,1.2,0,14,50,30,2);
   // what came down: two pieces of the ring wall and a slab of roof, lying
   // beyond the plinth under the gap, with a talus of rubble banked against them
   for(let f=0;f<3;f++){const a0=SEC+(f-1)*.3;const F=new THREE.Group();
    const geo=f<2?gridSurface((u,v)=>{const th=a0-.13+u*.26,y=14+v*18;const r=stem(y);return[r*Math.cos(th)-43*Math.cos(a0),y-23,r*Math.sin(th)-43*Math.sin(a0)];},10,8,{uS:3,vS:2,hole:(u,v)=>h3(u*9|0,v*7|0,209+f)<.18}):
     gridSurface((u,v)=>{const th=a0-.2+u*.4,r=26+v*18;return[r*Math.cos(th)-35*Math.cos(a0),0,r*Math.sin(th)-35*Math.sin(a0)];},10,4,{});
    const m=mesh(geo,skin,F);F.position.set(Math.cos(a0)*(64+f*6),0,Math.sin(a0)*(64+f*6));F.rotation.set(rr(-.5,.5),rr(0,TAU),f<2?rr(1.1,1.4):rr(.15,.35));G.add(F);dropFragment(F,0,1.2);
    rubbleRing(F.position.x,0,F.position.z,3,16,26,2.4);}
   for(let k=0;k<14;k++){const a=SEC+rr(-.5,.5),r=rr(46,78);kput('plateR',[Math.cos(a)*r,rr(.4,1.2),Math.sin(a)*r],qEuler(rr(-.5,.5),rng()*TAU,rr(-.5,.5)),[rr(3,7),.5,rr(2,5)],null);}}}
 // B — lobed tower (Marina / Hilliard scallops)
 // B and C used to stand at x=190 and x=330, so one site spanned 430 m on a
 // 265 m row pitch: the rehabilitated Office C stood in the ruined Office A, and
 // the intact C against the rehabilitated A. Round 2: B moves in to x=105 and C
 // stands behind them at (95,-75); the site is now 195 m wide.
 {const bx=105;REGISTER({name:'Office B — lobed tower ('+STATE(d)+')',x:bx,z:0,r:20,h:60});const B=new THREE.Group();B.position.set(bx,0,0);G.add(B);const R=13,H=52,cut=d>0?H*.72:null;
  const lobe=th=>R*(1+.32*(.5+.5*Math.cos(8*th)));
  mesh(lathe({rFn:()=>6,H:12,nu:24,nv:2}),skin,B);for(let k=0;k<16;k++){const th=k/16*TAU;if(d>0&&(k===4||k===11))continue;kput(d>0?'colR':'colW',[bx+Math.cos(th)*13.5,0,Math.sin(th)*13.5],null,[1.3,12,1.3],null);}
  const hole=holeFn(d,210,cut,1.8);
  mesh(lathe({rFn:()=>R,H:H-12,cut:cut?cut-12:null,jag:cut?3:0,flutes:8,amp:.32,sharp:1,nu:96,nv:40,hole,seed:210}),skin,B,0,12,0);
  if(d>0){mesh(lathe({rFn:()=>R*.6,H:H-12,cut:cut-12,jag:3,nu:32,nv:6,seed:210}),MAT.guts,B,0,12,0);civRooms({cx:bx,cy:12,rFn:()=>R,y0:4,y1:(cut||H)-12,step:4,d,seed:212,cut:cut?cut-12:null,rIn:.6});}
  const bBands=[];   // ten storeys of lobed banding in one mesh
  for(let s=0;s<Math.floor(((cut||H)-12)/4);s++){const y=12+s*4;
   const bh=d>0?(u,v)=>fbm(u*10+s,2,211+s,2)<.24*d:null;
   bBands.push(lathe({rFn:()=>R*1.09,H:1,flutes:8,amp:.34,sharp:1,nu:96,nv:1,hole:bh}).translate(0,y+3,0));
   bBands.push(gridSurface((u,v)=>{const th=u*TAU;const r=lerp(lobe(th)*.97,lobe(th)*1.09,v);return[r*Math.cos(th),y+3.9,r*Math.sin(th)];},96,2,{hole:bh}));
   for(let k=0;k<8;k++)for(let j=-1;j<=1;j+=2){const th=k/8*TAU+j*.16;const u=((th%TAU)+TAU)%TAU/TAU;if(hole&&hole(u,y-12))continue;const r=lobe(th)+.1;
    civWin(d>0?'winSmD':'winSmI',[bx+r*Math.cos(th),y+1.9,r*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[1.9,1.5,1],null);}
   if(s%3===0)stripRing(bx,y+2.5,0,R*.85,d,24);}
  meshMerged(bBands,skin,B);
  if(!cut){kput('slab',[bx,H+.2,0],null,[R*1.1,.6,R*1.1],new THREE.Color(0xd8d4cc));mesh(lathe({rFn:y=>7*Math.sqrt(clamp(1-Math.pow(y/6,2),0,1)),H:6,nu:24,nv:6}),skin,B,0,H+.5,0);}
  else{rubbleRing(bx,0,0,15,26,60,2.5);mossOnRing(bx,cut,0,R,10,1.5);}
  if(d>0){vinesOnRing(bx,12,0,R*1.05,20,10);scatterMoss(bx,0,0,15,28,40,2);}}
 {const OCX=95,OCZ=-75,CG=new THREE.Group();CG.position.set(OCX-330,0,OCZ);G.add(CG);KOFF=[gx+OCX-330,0,gz+OCZ];officeC(CG,d);KOFF=[gx,0,gz];}
 figures(60,50,5,5);figures(105,22,3,3);civFlatten(G);KOFF=[0,0,0];return G;}

// ================================================================= STARPORT — "the Starfish"
function buildStarport(scene,gx,gz,d){reseed(d>0?9601:9600);KOFF=[gx,0,gz];REGISTER({name:'Starport — the Starfish ('+STATE(d)+')',x:0,z:0,r:360,h:120});const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 const RD=70,HD=40,NA=5,L=210;
 mesh(lathe({rFn:()=>RD*1.15,H:3,nu:96,nv:1}),skin,G);
 mesh(lathe({rFn:y=>RD*Math.pow(clamp(1-Math.pow(y/HD,2),0,1),.5),H:HD,nu:96,nv:24,hole:(u,y)=>{const sky=y>HD*.86;return sky||(holeFn(d,300,null,1.2)||(()=>false))(u,y);}}),skin,G,0,3,0);
 if(d===0)mesh(lathe({rFn:y=>RD*.98*Math.pow(clamp(1-Math.pow(y/HD,2),0,1),.5),H:HD,nu:48,nv:10,hole:(u,y)=>y<HD*.84}),MAT.glass,G,0,3,0);
 else mesh(lathe({rFn:y=>RD*.9*Math.pow(clamp(1-Math.pow(y/HD,2),0,1),.5),H:HD*.9,nu:48,nv:8}),MAT.dark,G,0,3,0);
 stripRing(0,10,0,RD*.85,d,48);stripRing(0,24,0,RD*.62,d,40);
 const mouths=[];   // the five hangar end walls, merged after the loop: one draw call
 for(let i=0;i<NA;i++){const th=i/NA*TAU+.3;const cx=Math.cos(th),cz=Math.sin(th);const sx=-cz,sz=cx;
  const broken=d>0&&i===2;const hole=holeFn(d,310+i,null,1.4);
  const arm=(u,v)=>{const s=v*L;const t=s/L;const w=38*(1-.55*t);const h=(HD*.75)*(1-.6*t)+6;const q=(u-.5)*2;const x=RD*.6+s;const y=h*Math.pow(clamp(1-q*q,0,1),.55);
   return[x*cx+q*w*sx,y,x*cz+q*w*sz];};
  // RUIN: the broken arm's outer vault has PANCAKED - flattened onto its own
  // floor beyond the break, where it used to stand whole past a narrow gap.
  const armB=broken?(u,v)=>{const p=arm(u,v);if(v>.64)p[1]*=.12+.12*fbm(u*6,v*24,321,2);return p;}:arm;
  mesh(gridSurface(armB,40,60,{uS:8,vS:30,hole:(u,v)=>{const spine=Math.abs(u-.5)<.045&&v<.9;const gap=broken&&v>.5&&v<.64;return spine||gap||(hole&&hole(u*3+i,v*L));}}),skin,G);
  if(d===0)mesh(gridSurface((u,v)=>arm(.455+u*.09,v*.9),6,40,{}),MAT.glass,G);
  else mesh(gridSurface((u,v)=>{const p=armB(u,v);return[p[0]*.985,Math.max(.3,3+(p[1]-3)*.9),p[2]*.985];},20,30,{uS:8,vS:30,hole:(u,v)=>broken&&v>.5&&v<.64}),MAT.guts,G);
  for(let s=20;s<L-10;s+=20){const p=arm(.5,s/L);const lit=d>0?rng()<.1:true;if(broken&&s/L>.5)continue;kput('strip',[p[0],p[1]-2,p[2]],qEuler(0,-th,0),[14,1,1],lit?CYAN:DEAD);}
  if(broken){const p=arm(.5,.57);rubbleRing(p[0],0,p[2],5,40,90,3);for(const v of [.72,.86]){const p2=arm(.5,v);rubbleRing(p2[0],0,p2[2],12,34,30,2.6);}}
  // THE HANGAR MOUTH. Each arm used to end in an open half-tube that showed its
  // own inside. Now its end is walled, with a great dark door in it, lit round
  // its head when intact; in a ruin the wall is holed and the door stands open
  // on the arm's floor. (The pancaked arm has no mouth left to close.)
  if(!broken){const vE=.985,e=arm(.5,vE),e2=arm(.5,1);const n=[e2[0]-e[0],0,e2[2]-e[2]];const nl=Math.hypot(n[0],n[2]);n[0]/=nl;n[2]/=nl;
   const eh=holeFn(d,340+i,null,3);
   mouths.push(gridSurface((u,v)=>{const p=arm(u,vE);return[p[0],p[1]*v,p[2]];},20,6,{uS:4,vS:2,hole:(u,v)=>{const q=(u-.5)*2;if(Math.abs(q)<.42&&v<.62)return true;return eh?eh(u,v*20):false;}}));
   kput('boxD',[e[0]-n[0]*5,5.5,e[2]-n[2]*5],qFacing(n),[26,11,.6],null);
   kput('slab',[e[0]-n[0]*16,.4,e[2]-n[2]*16],null,[16,.8,16],new THREE.Color(d>0?0x3a3430:0x6a625a));
   for(let k=-3;k<=3;k++){const lit=d>0?h3(i,k,341)<.12:true;kput('strip',[e[0]+n[2]*k*3.8+n[0]*.2,11.6,e[2]-n[0]*k*3.8+n[2]*.2],qFacing(n),[3,1,1],lit?new THREE.Color(0xffb060):DEAD);}}
  // landing pad at the arm's end
  const px=(RD*.6+L+52)*cx,pz=(RD*.6+L+52)*cz;kput('slab',[px,1.5,pz],null,[42,3,42],new THREE.Color(d>0?0x4a4038:0x8a8078));
  for(let k=0;k<24;k++){const a=k/24*TAU;const lit=d>0?rng()<.15:true;kput('strip',[px+40*Math.cos(a),3.2,pz+40*Math.sin(a)],qEuler(0,-a,0),[6,1,1],lit?new THREE.Color(0xffb060):DEAD);}
  kput('slab',[px,1.2,pz],qEuler(0,-th,0),[6,2.4,24],new THREE.Color(d>0?0x4a4038:0x8a8078));
  if(d>0){scatterMoss(px,3,pz,0,38,25,2);}
  // REHABILITATED: the aprons are camps - tents pitched on the pads
  // (A-frames of the salvage pass's own tarp planes: no new kit mesh.)
  if(d===3){for(let k=0;k<9;k++){const a=h3(i,k,350)*TAU,r=8+h3(k,i,351)*26,sz=3+h3(i*3,k,352)*3;const tx=px+r*Math.cos(a),tz=pz+r*Math.sin(a);
    const c=new THREE.Color().setHSL(.07+h3(k,i,353)*.06,.35,.45+h3(i,k,354)*.2);
    for(const sd of [-1,1])kput('patchTarp',[tx+Math.cos(a+Math.PI/2)*sd*sz*.35,3+sz*.28,tz+Math.sin(a+Math.PI/2)*sd*sz*.35],qEuler(0,-a,0).multiply(qEuler(-sd*.9,0,0)),[sz*1.4,sz*.9,1],c);}
   kput('waterButt',[px+3,4,pz-4],null,[1.2,2,1.2],null);}}
 meshMerged(mouths,skin,G);
 // control needle on the dome
 const NH=70,ncut=d>0?NH*.5:null;mesh(lathe({rFn:y=>4.5*(1-.5*y/NH)+ (y>NH-14?9*Math.pow((y-(NH-14))/14,1.4)*(1-.3*Math.pow((y-(NH-14))/14,4)):0),H:NH,cut:ncut,jag:ncut?2:0,flutes:6,amp:.2,nu:40,nv:30,hole:holeFn(d*.6,330,ncut,1)}),skin,G,0,HD-2,0);
 if(!ncut){kput('slab',[0,HD-2+NH,0],null,[13,.8,13],new THREE.Color(0xd8d4cc));stripRing(0,HD-2+NH-4,0,11,d,24);}
 for(let yy=14;yy<NH-16;yy+=14){if(ncut&&yy>ncut-3)break;kput(d>0?'ringR':'ringW',[0,HD-2+yy,0],qEuler(Math.PI/2,0,0),[5.2,5.2,5],null);}
 apron(G,0,0,RD*1.16,RD*1.7,d,1.6);
 if(d>0){scatterMoss(0,0,0,80,330,260,3);rubbleRing(0,3,0,60,120,80,2.5);trees(0,0,120,330,26);}
 figures(0,120,8,10);civFlatten(G);KOFF=[0,0,0];return G;}

// ================================================================= LIBRARY — "the Crown"
function buildLibrary(scene,gx,gz,d){reseed(d>0?9801:9800);KOFF=[gx,0,gz];REGISTER({name:'Library — the Crown ('+STATE(d)+')',x:0,z:0,r:60,h:65});REGISTER({name:'Library — reading hall',x:74,z:0,r:22,h:16});const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 mesh(lathe({rFn:()=>42,H:2,nu:80,nv:1}),skin,G);apron(G,0,0,42,50,d,2);apron(G,74,0,15,22,d,.5);kput('slab',[0,2,0],null,[42,.5,42],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));
 const pts=[[34,0],[27,12],[19,25],[15.5,34],[17.5,42],[23,50],[27,54]];
 // civDef, not kdef: a second kdef('ribLibR') at decay 3 wiped the decay-1 ribs
 civDef('ribLib'+(d>0?'R':'W'),()=>ribCurveGeo(pts,1.5),d>0?MAT.rust:MAT.white);
 const NR=16;for(let k=0;k<NR;k++){const th=k/NR*TAU;const fallen=d>0&&(k===2||k===3||k===9||k===13);
  if(!fallen)kput('ribLib'+(d>0?'R':'W'),[0,2,0],qEuler(0,-th,0),1,null);
  else{kput('ribLib'+(d>0?'R':'W'),[Math.cos(th)*60,1.4,Math.sin(th)*60],qEuler(Math.PI/2,0,-th),[.9,.9,.9],null);rubbleRing(Math.cos(th)*45,2,Math.sin(th)*45,3,16,30,1.8);}}
 const rib=y=>{for(let i=1;i<pts.length;i++)if(y<=pts[i][1]){const t=(y-pts[i-1][1])/(pts[i][1]-pts[i-1][1]);return lerp(pts[i-1][0],pts[i][0],t);}return pts[pts.length-1][0];};
 if(d===0)mesh(lathe({rFn:y=>rib(y)-1.6,H:44,nu:64,nv:30}),MAT.glass,G,0,2,0);
 else{mesh(lathe({rFn:y=>rib(y)-1.8,H:44,nu:48,nv:20,hole:(u,y)=>fbm(u*4,y*.06,500,2)<.55}),MAT.dark,G,0,2,0);
  // behind the torn crown: three gallery rings of stacks round a dark well,
  // and the teeth of the glass still standing between the ribs near the foot
  const gal=[];civRooms({cy:2,rFn:y=>rib(y)-2.2,y0:3,y1:40,step:12,d,seed:505,rIn:.5,out:gal});meshMerged(gal,CONC(d),G);
  mesh(lathe({rFn:y=>(rib(y)-2)*.5,H:40,nu:24,nv:4}),MAT.dark,G,0,2,0);
  for(let k=0;k<NR;k++)for(let j=0;j<2;j++){const th=(k+.5)/NR*TAU,y=5+j*8,r=rib(y)-1.6;const hh=h3(k,j,506);if(hh>.6)continue;
   civShardAt([Math.cos(th)*r,2+y,Math.sin(th)*r],qFacing([Math.cos(th),.25,Math.sin(th)]),TAU*r/NR*.8,7,0,hh);}}
 kput(d>0?'ringR':'ringW',[0,36,0],qEuler(Math.PI/2,0,0),[16,16,10],null);
 kput('slab',[0,2.3,0],null,[30,.6,30],new THREE.Color(0x2a2c30));stripRing(0,6,0,28,d,40);stripRing(0,20,0,18,d,32);
 if(d===0)kput('finial',[0,60,0],null,[3,6,3],null);
 // reading-hall wing: low six-lobed block with arched windows, joined by a covered walk
 const wx=74;mesh(lathe({rFn:()=>15,H:9,flutes:6,amp:.35,sharp:1,nu:72,nv:6,hole:holeFn(d,510,null,2)}),skin,G,wx,0,0);
 if(d>0){mesh(lathe({rFn:()=>9,H:9,nu:24,nv:1}),MAT.dark,G,wx,0,0);civRooms({cx:wx,rFn:()=>15,y0:0,y1:9.2,step:9.2,d,seed:513,rIn:.6});}
 kput('slab',[wx,9.2,0],null,[15.5,.5,15.5],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));mesh(lathe({rFn:y=>16*Math.sqrt(clamp(1-Math.pow(y/5,2),0,1)),H:5,flutes:6,amp:.3,sharp:1,nu:72,nv:6,hole:holeFn(d*.8,511,null,2)}),skin,G,wx,9.4,0);
 for(let k=0;k<12;k++){const th=(k+.5)/12*TAU;const r=15*(1+.35*(.5+.5*Math.cos(6*th)))+.1;civWin(d>0?'winBigD':'winBigI',[wx+r*Math.cos(th),4.5,r*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[.8,.9,1],null);}
 for(let x=44;x<58;x+=6)for(let s=-1;s<=1;s+=2)kput(d>0?'colR':'colW',[x,2,s*4],null,[.7,5,.7],null);
 mesh(gridSurface((u,v)=>[42+u*18,7.2+.4*Math.sin(u*9),(v-.5)*10],16,4,{hole:d>0?(u,v)=>fbm(u*5,v*2,520,2)<.35:null}),skin,G);
 kput('archOpen',[34.5,4,0],qFacing([1,0,0]),[.5,.5,1],null);
 if(d>0){mossOnRing(0,2.4,0,36,40,2);scatterMoss(0,0,0,44,110,90,2);trees(0,0,60,120,12);vinesOnRing(0,36,0,16,12,20);}
 figures(0,60,6,8);civFlatten(G);KOFF=[0,0,0];return G;}

// ---------------------------------------------------------------- v3: inspector registry + group transforms
function REGISTER(o){}
function useGroupXF(P){P.updateMatrix();KXF={m:P.matrix.clone(),q:P.quaternion.clone()};}
function endGroupXF(){KXF=null;}
kdef('tube',new THREE.CylinderGeometry(1,1,1,8),MAT.dark);
kdef('boxD',new THREE.BoxGeometry(1,1,1),MAT.dark);
kdef('boxW',new THREE.BoxGeometry(1,1,1),MAT.white);kdef('boxR',new THREE.BoxGeometry(1,1,1),MAT.rust);
const STATE=d=>d===3?'repaired':d>0?'ruined':'intact';

