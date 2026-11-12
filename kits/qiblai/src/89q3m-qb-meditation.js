// ================================================================= QIBLAI — the four meditation gardens (the city's corners)
// One walled garden in each corner of the city (the owner, 2026-11-11: "a unique meditation garden in each corner, featuring
// the colors of the two closest monasteries"). A corner is where two of the wall's sides meet, and each side faces one of the
// four cardinal monasteries (QSPOKE 0 north, 2 east, 4 south, 6 west), so each garden takes those two colours. o.v the corner:
//   0 NE  crimson + gold       the Stone Garden: raked gravel, standing stones, a pavilion over it
//   1 SE  gold + turquoise     the Lotus Water: a square pool of lotus, stepping stones to a tiled island shrine
//   2 SW  turquoise + violet   the Walking Circle: three rings of hedge round a chorten, flags in the two colours
//   3 NW  violet + crimson     the Grove of Cells: eight meditation cells in a ring under the trees, a bell pavilion
// Frame as every kit piece: +z the front. The garden opens on two sides, the front (+z) and the left (-x), both inward when
// the city turns it (settlements/qiblai: NE ry 0, SE -pi/2, SW pi, NW pi/2); the corner it backs into is (+x, -z).
// The plants go through qnMedPlant (one hook, a kind and a colour role), so a world can draw them from a biome kit's species.
const QMED=[{name:'The Stone Garden',sp:[0,2]},{name:'The Lotus Water',sp:[2,4]},{name:'The Walking Circle',sp:[4,6]},{name:'The Grove of Cells',sp:[6,0]}];
const QMED_W=74;   /* the walled square, inside a corner block's 83 m */
// a plant by kind ('tree', 'blossom', 'shrub', 'bed', 'reed', 'cypress', 'lotus') in a colour (a hex, the role's colour): the
// stand-in draws the Xanadu kit's tree and leaf clusters tinted; a world may set qnMedPlant.use = fn(kind,x,z,h,hex) -> true
function qnMedPlant(kind,x,z,h,hex){if(qnMedPlant.use&&qnMedPlant.use(kind,x,z,h,hex))return;const c=xC(hex);
 if(kind==='cypress'){xnCypress(x,z,h);return;}
 if(kind==='tree'||kind==='blossom'){vPst('vPostB',x,0,z,.16,h*.5,xC(0x4a3a2c));const n=kind==='blossom'?7:5;
  for(let k=0;k<n;k++)kput('xLeaf',[x+rr(-.9,.9),h*.62+rr(-.3,.6),z+rr(-.9,.9)],qEuler(rng()*3,rng()*3,0),[h*.2,h*.16,h*.2],k%3===2&&kind==='blossom'?xC(XPAL.white):c);return;}
 if(kind==='shrub'){for(let k=0;k<3;k++)kput('xLeaf',[x+rr(-.3,.3),h*.45,z+rr(-.3,.3)],qEuler(rng()*3,rng()*3,0),[h*.5,h*.45,h*.5],c);return;}
 if(kind==='reed'){for(let k=0;k<5;k++)vPst('vPostB',x+rr(-.4,.4),0,z+rr(-.4,.4),.03,h*rr(.7,1),c);return;}
 /* a bed: a low mound of flowers */for(let k=0;k<4;k++)kput('xLeaf',[x+rr(-.6,.6),.18,z+rr(-.6,.6)],qEuler(rng()*3,rng()*3,0),[.5,.22,.5],c);}
// the wall: a low washed wall with a band of the two colours (each colour on the two sides nearest its monastery's quarter),
// a gate in the front and the left side, each gate flanked by the two monasteries' banners turned toward them
function qnMedWall(V,ry){const W=QMED_W,h=1.9,sp=QMED[V].sp,wash=xC(xPick(XPAL.wash)),stone=xC(xPick(QSTONE)),gap=6;
 const side=(s,horiz,col)=>{for(const e of[-1,1]){const L=W/2-gap/2,m=e*(gap/2+L/2);
  if(horiz){qnCube(m,0,s*W/2,L,h,.7,0,wash,'wash');vB('xPaint',m,h-.5,s*(W/2+.36),L,.32,.04,0,xC(col));vB('qAshB',m,h,s*W/2,L+.2,.14,.9,0,stone);}
  else{qnCube(s*W/2,0,m,.7,h,L,0,wash,'wash');vB('xPaint',s*(W/2+.36),h-.5,m,.04,.32,L,0,xC(col));vB('qAshB',s*W/2,h,m,.9,.14,L+.2,0,stone);}}};
 const A=QSPOKE[sp[0]].wall,B=QSPOKE[sp[1]].wall;
 /* the closed sides (the back -z and the right +x) carry no gate: one length each; the open ones (front +z, left -x) a gate */
 qnCube(0,0,-W/2,W,h,.7,0,wash,'wash');vB('xPaint',0,h-.5,-W/2-.36,W,.32,.04,0,xC(A));vB('qAshB',0,h,-W/2,W+.2,.14,.9,0,stone);
 qnCube(W/2,0,0,.7,h,W,0,wash,'wash');vB('xPaint',W/2+.36,h-.5,0,.04,.32,W,0,xC(B));vB('qAshB',W/2,h,0,.9,.14,W+.2,0,stone);
 side(1,true,A);side(-1,false,B);
 for(const [gx,gz,gry] of[[0,W/2,0],[-W/2,0,-Math.PI/2]]){for(const e of[-1,1]){const p=loc(gx,gz,e*(gap/2+.6),.9,gry);
   const s=sp[e<0?0:1];qnSpokeBanner(p[0],0,p[1],s,6.2,2.2);}
  const q=loc(gx,gz,0,0,gry);qnPave(q[0],q[1],gap,3,gry,0);}
 for(const sx of[-1,1])for(const sz of[-1,1]){vB('qAshB',sx*W/2,0,sz*W/2,1.4,2.6,1.4,0,stone);vBall('xGold',sx*W/2,2.95,sz*W/2,.28,xC(xPick(XPAL.gold)));}}
// a path of flags from the front gate and the left gate to the centre, paved
function qnMedPaths(r){qnPave(0,(QMED_W/2+r)/2,2.6,QMED_W/2-r,0,0);qnPave(-(QMED_W/2+r)/2,0,2.6,QMED_W/2-r,Math.PI/2,0);}

function buildQbMeditation(G,o){const V=((o.v|0)%4+4)%4;reseed(33621+V);const sp=QMED[V].sp,A=QSPOKE[sp[0]].wall,B=QSPOKE[sp[1]].wall,W=QMED_W;
 const stone=xC(xPick(QSTONE)),gold=xC(xPick(XPAL.gold));vnReg('Meditation garden — '+QMED[V].name,0,0,W/2,8);
 qnMedWall(V,0);
 if(V===0){ /* the Stone Garden: a gravel field raked in lines, five stones in moss, a crimson pavilion in the back corner */
  const F=40;vB('vStone',0,0,0,F+1.2,.22,F+1.2,0,stone);vB('xWashB',0,.04,0,F,.2,F,0,xC(0xd9d4c6));
  for(let k=0;k<F/0.9;k++){const z=-F/2+.45+k*.9;vB('xWashB',0,.22,z,F-.4,.03,.12,0,xC(0xc2bcae));}
  for(const [x,z,s] of[[-9,-6,2.4],[-5,-9,1.4],[6,4,2.9],[9,7,1.6],[-3,10,1.9]]){
   kput('xBoulder',[x,s*.45,z],qEuler(rng(),rng()*3,rng()*.4),[s,s*.8,s*.9],xC(xPick([0xb4ab98,0xa89e8a,0xbfb6a2])));
   for(let k=0;k<10;k++){const a=k/10*TAU,r=s*rr(1.15,1.5);vB('xWashB',x+Math.cos(a)*r,.22,z+Math.sin(a)*r,.6,.04,.9,a,xC(0x7c8a54));}}
  qnPlinth(24,-24,13,13,1.2,-Math.PI/4);xnPavilion(24,1.2,-24,8,8,3.6,-Math.PI/4,{c:xC(A),tileC:gold,gilt:true});
  for(const s of[-1,1])qnBanner(24+s*5.4,1.2,-24+s*5.4,3,gold,xC(A));
  qnMedPaths(F/2+1.5);
  for(let k=0;k<9;k++){const t=-W/2+6+k*7.6;qnMedPlant('tree',t,-W/2+4,rr(6,8),B);qnMedPlant('tree',W/2-4,t,rr(6,8),k%2?A:B);}
  for(let k=0;k<12;k++){const t=-F/2+k*3.6;qnMedPlant('shrub',t,F/2+3,1.4,A);qnMedPlant('shrub',-F/2-3,t,1.4,A);}
  vnFolk(-2,F/2+5,2,3);}
 else if(V===1){ /* the Lotus Water: a square pool, lotus in the two colours, stepping stones to a turquoise island shrine */
  const P=44;vB('xWaterB',0,0,0,P,.3,P,0,xC(XPAL.water));for(const e of[-1,1]){vB('vStone',0,0,e*(P/2+.4),P+1.6,.45,.8,0,stone);vB('vStone',e*(P/2+.4),0,0,.8,.45,P,0,stone);}   /* the pool: its water up to .3, a stone kerb proud of it (xnPool's slab stands over its water) */
  for(let k=0;k<70;k++){const x=rr(-P/2+1.5,P/2-1.5),z=rr(-P/2+1.5,P/2-1.5);if(Math.hypot(x,z)<8||Math.abs(x)<1.6||Math.abs(z)<1.6)continue;
   kput('xLeaf',[x,.33,z],qEuler(0,rng()*3,0),[rr(.7,1.2),.05,rr(.7,1.2)],xC(xPick([0x4f7a3a,0x5e8a44,0x456e34])));
   if(k%3===0)kput('xLeaf',[x+.2,.5,z],qEuler(rng(),rng()*3,0),[.32,.26,.32],xC(k%2?A:0xf4ece8));}
  for(const [x,z] of[[-13,-14],[14,-10],[-16,11],[11,15],[17,3],[-7,17]])qnMedPlant('lotus',x,z,2.6,B);   /* the giant lotus, standing from the water */
  vB('vStone',0,0,0,12,.6,12,0,stone);const top=qnStack(0,.6,0,6.4,6.4,0,[3.4],xC(B),'wash',false);
  const rt=qnRoof(0,top.y,0,top.w,top.d,0,xC(B),{band:xC(QSPOKE[sp[1]].band)});qnCrown(0,rt,0,top.w,top.d,0,{pav:[3.2,3.2],deer:false,banners:false});
  qnDoor(0,.6,3.2,0,1.2,2.1,{c:xC(A)});
  for(let k=0;k<7;k++){const z=P/2-1.4-k*2.2;vB('vStone',(k%2?.6:-.6),.12,z,1.3,.3,1.3,0,stone);}
  for(let k=0;k<7;k++){const x=-P/2+1.4+k*2.2;vB('vStone',x,.12,(k%2?.6:-.6),1.3,.3,1.3,0,stone);}
  qnPave(0,(W/2+P/2+.6)/2,2.6,W/2-P/2-.6,0,0);qnPave(-(W/2+P/2+.6)/2,0,2.6,W/2-P/2-.6,Math.PI/2,0);
  for(let k=0;k<8;k++){const t=-P/2+2+k*5.6;qnMedPlant('reed',t,-P/2-.2,1.6,0x6a8a4a);qnMedPlant('reed',P/2+.2,t,1.6,0x6a8a4a);}
  for(const sx of[-1,1])for(const sz of[-1,1])qnMedPlant('blossom',sx*(P/2+5),sz*(P/2+5),rr(7,9),sx*sz>0?A:B);
  for(let k=0;k<6;k++){const t=-P/2+4+k*7.2;qnMedPlant('bed',t,P/2+3,0,A);qnMedPlant('bed',-P/2-3,t,0,B);}
  vnFolk(4,P/2+4,2,3);}
 else if(V===2){ /* the Walking Circle: three hedge rings, each opened on a different bearing, round a chorten; flags in two colours */
  const R=[9,16,23],open=[0,Math.PI*1.25,Math.PI*.5];vB('xWashB',0,0,0,2*R[2]+5,.06,2*R[2]+5,0,xC(0xcfc8b6));
  for(let i=0;i<3;i++){const r=R[i],n=Math.round(TAU*r/1.6);for(let k=0;k<n;k++){const a=k/n*TAU;
    const d=Math.abs(((a-open[i]+Math.PI)%TAU+TAU)%TAU-Math.PI);if(d<2.2/r)continue;
    kput('xLeaf',[Math.sin(a)*r,.55,Math.cos(a)*r],qEuler(0,a,0),[.95,.62,.7],xC(xPick([0x3e6a36,0x48763c,0x355e30])));}
   for(let k=0;k<8;k++){const a=(k+.5)/8*TAU,rr2=r+1.6;qnMedPlant('bed',Math.sin(a)*rr2,Math.cos(a)*rr2,0,k%2?A:B);}}
  qnChorten(0,0,0,1.1);
  for(let k=0;k<8;k++){const a=k/8*TAU,e=[Math.sin(a)*(R[2]+3),0,Math.cos(a)*(R[2]+3)];vPst('vPostB',e[0],0,e[2],.08,5.2,xC(0x5a4632));
   xnPennants([0,6.6,0],[e[0],5.1,e[2]],12,k%2?[A,0xf4efe4]:[B,0xf4efe4]);}
  for(const sx of[-1,1])for(const sz of[-1,1]){const x=sx*(W/2-6),z=sz*(W/2-6);qnMedPlant('blossom',x,z,rr(6,7.5),sx*sz>0?B:A);}
  for(let k=0;k<5;k++){qnMedPlant('cypress',W/2-4,-W/2+8+k*6,rr(6,8),0);qnMedPlant('cypress',-W/2+8+k*6,-W/2+4,rr(6,8),0);}
  qnMedPaths(R[2]+2.5);vnFolk(0,R[1]+3.5,3,4);}
 else{ /* the Grove of Cells: eight cells on a ring facing in, a bell pavilion and a round pool at the centre, the grove round them */
  const r=22;vB('xWashB',0,0,0,12,.06,12,0,xC(0xcfc8b6));
  for(let k=0;k<8;k++){const a=(k+.5)/8*TAU,x=Math.sin(a)*r,z=Math.cos(a)*r,ry=a+Math.PI,c=xC(k%2?A:B);
   const tp=qnStack(x,0,z,3.4,3.4,ry,[3.0],xC(xPick(XPAL.wash)),'wash',false);qnRoof(x,tp.y,z,tp.w,tp.d,ry,xC(xPick(XPAL.wash)),{band:c});
   const d=loc(x,z,0,1.7,ry);qnDoor(d[0],0,d[1],ry,.9,1.9,{c,val:false});qnMedPlant('bed',...loc(x,z,1.6,2.6,ry),0,k%2?A:B);}
  xnPool(0,0,0,7,7,Math.PI/4,stone);xnPavilion(0,0,-9,4.2,4.2,3.4,0,{c:xC(A),tileC:gold,gilt:true});
  vPst('vPostB',0,.3,-9,.06,2.4,xC(0x3a2c22));kput('xBulbW',[0,1.3,-9],null,[.9,1.1,.9],gold);
  for(let i=-3;i<=3;i++)for(let j=-3;j<=3;j++){const x=i*10+rr(-2,2),z=j*10+rr(-2,2),d=Math.hypot(x,z);
   if(d<12||Math.abs(d-r)<5||Math.abs(x)>W/2-4||Math.abs(z)>W/2-4||(Math.abs(x)<3&&z>0)||(Math.abs(z)<3&&x<0))continue;
   qnMedPlant((i+j)%3===0?'blossom':'tree',x,z,rr(7,10),(i+j)%2?A:B);}
  qnMedPaths(8);vnFolk(2,r-4,2,3);}
}
QB.def({key:'qb_meditation_garden',name:'Meditation garden',family:'Sacred — the gardens',tags:QTAG('civic',['religious'],{job:'worship',note:'one of four, a corner of the city; v the corner: 0 NE, 1 SE, 2 SW, 3 NW'}),w:78,d:78,h:12,fw:74,fd:74,nv:4,build:buildQbMeditation});
