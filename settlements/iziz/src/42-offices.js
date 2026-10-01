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
 {const bx=190;REGISTER({name:'Office B — lobed tower ('+STATE(d)+')',x:bx,z:0,r:20,h:60});const B=new THREE.Group();B.position.set(bx,0,0);G.add(B);const R=13,H=52,cut=d>0?H*.72:null;
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
 officeC(G,d);figures(60,50,5,5);figures(190,22,3,3);KOFF=[0,0,0];return G;}

