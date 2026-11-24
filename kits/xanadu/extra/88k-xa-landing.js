/* ================================================================= XANADU — the lake town's landing stair and its governor's house
   OPT-IN until the kit's next all-builds rebuild (kits/xanadu/README.md, "Opt-in pieces"; settlements/xanadu-lake/PLAN.md section
   5, the two pieces every lake town wants that the kit lacked; step L0, Māuṭh): a page takes it through its kit.json "external",
   so no other page changes. Each piece is drawn in its own frame, front +z, opening with its own reseed, on the kit's
   vocabulary (xnWall, xnStack, xnFlatRoof, xnTibWin, xnShrine, xnFlagpole, vnDoor ...). Seeds 34801-34899.
     xa_ghat        the landing stair (the ghat): a paved landing at local y 0 (THE LAKE AT LOCAL Y -1.2: the town sets the
                    landing 1.2 m over the water), the broad stair running down into the lake on +z, its last steps under the
                    level where the dugouts are drawn up and the washing is done; stepped kerb walls either side, the washing
                    slabs, mooring posts, water pots, a lamp chorten at the head; v 1 a small pavilion (a chhatri) on the
                    landing. The wet steps are the library's stone.cut darkened: stone.ghat.wet is owed
                    (core/materials/PROMPTS-NEEDED.md section 59)
     xa_governor    the governor's house: a lake town's head is the Sultan's man. A two-storey house at the back of a walled
                    forecourt (dressed stone below, whitewash above, the twig band and gilt corners), the audience portico at
                    its door, the gate with the guard, the office wing on the court's east side, the Sultan's flag; v 1
                    earth-washed and plainer (no gilt)
     xa_ruin_s, xa_ruin_m, xa_ruin_l   a house stripped of its roof and timber (Ōlḍ-Thalaba's old town, step L1: the beams and
                    the roofs carried up to the new Thalaba), the size of the kit's small, middling and large houses: its walls
                    broken to uneven heights, the doorway and the windows' gaps, an inner wall in the large, rubble heaps and a
                    fallen lintel inside; v 0-3 the breaks. THE GROUND FOLLOWED: each wall section stands on the ground under it
                    (o.ground(x, z), the page's, in world metres; flat at local y 0 without it), sunk 0.5 m, and every heap and
                    beam lies on its lowest face 0.15 m into the ground, so core/ruins' watch (KRUINS.watch) finds nothing
                    floating and every wreck seated
     xa_net_loft    the net-makers' loft (Nēṭ, step L2; one in every fishing town's lane): a stone ground floor where the
                    twine is laid up, a timber loft over it open on the front with the nets hung from its rail, a flat roof;
                    two drying frames before it with nets stretched on them, the coils of line and the floats; v 1 three frames
     xa_orchard_plot  the orchard plot (the gap 89-xa-trades names; Qōqō's cacao, Malbari's mulberry, step L2): a plot of trees in
                    rows on a terrace bench, 30 x 24; v 0 cacao (two rows of tall shade trees over the cacao's low crowns, the
                    pods on the trunks), v 1 mulberry (pollarded rows, the leaf-pickers' ladders), v 2 fruit (round crowns)
     xa_serai_ruin  the caravan market left empty (40 x 40): the outer ranges' walls broken, the court's arcade as stumps, the
                    gate's two towers as broken stacks, the rubble of the ranges; v 1 more of it fallen */

/* ---------------------------------------------------------------- the landing stair: 24 x 16, two takes */
function buildXaGhat(G,o){reseed(34801+(o.v|0));const V=xV(o)%2,stone=xC(xPick(XPAL.stone)),cope=stone.clone().multiplyScalar(1.1),wet=stone.clone().multiplyScalar(.55),
 weed=xC(0x3e4a34),tim=xC(0x5a4632),wash=xC(xPick(XPAL.wash)),gold=xC(xPick(XPAL.gold)),W=24,WATER=-1.2,N=12,T=10/N,R=.22;
 vnReg('Landing stair (ghat)',0,0,12,3);
 /* the landing: a stone body, its flags on top at 0 (z -8 to -2) */
 vB('vStone',0,-3.4,-5,W,3.05,6,0,stone.clone().multiplyScalar(.85));xnPave(0,-5,W,6,0,stone.clone().multiplyScalar(.95),1.6,-.35);
 /* the stair: N steps down from z -2 to +8, each a tread of T m, R m lower; those at or under the water wet and dark */
 for(let k=0;k<N;k++){const top=-(k+1)*R,z0=-2+k*T,c=top<WATER+.35?wet:stone;
  vB('vStone',0,-3.4,z0+T/2,W-5,top+3.4,T,0,c.clone().multiplyScalar(rr(.94,1.04)));}
 vB('vStone',0,WATER-.12,2.6,W-5.05,.1,.04,0,weed);   /* the weed line on the riser at the water */
 /* the kerb walls either side, stepping down with the stair, coped */
 for(const s of[-1,1]){const x=s*(W/2-1.25);vB('vStone',x,-3.4,-5,2.5,3.4+.55,6,0,stone);vB('vStone',x,.55,-5,2.7,.18,6.2,0,cope);
  for(let k=0;k<N;k+=2){const top=-(k+1)*R+.55,z0=-2+k*T;vB('vStone',x,-3.4,z0+T,2.5,top+3.4,2*T,0,top<WATER+.6?wet:stone);vB('vStone',x,top,z0+T,2.7,.16,2*T+.1,0,cope);}}
 /* the washing slabs at the water's edge, cloth beaten on them, a basket */
 for(const s of[-1,1]){vB('vStone',s*7.4,WATER-.3,6.6,2.4,.42,1.2,s*.12,wet);kput('xPaintPl',[s*7.4,WATER+.13,6.5],qEuler(-Math.PI/2,0,s*.2),[1.1,.6,1],xC(xPick(XPAL.cloth)));}
 /* mooring posts out in the water, pots on the steps */
 for(const x of[-8.5,-3,3,8.5])vPst('vPost',x,-3,7.6,.12,3.0,tim);
 for(let k=0;k<5;k++){const kk=2+k*2,top=-(kk+1)*R,z=-2+kk*T+T/2;vPst('vClayPot',rr(-6,6),top,z,.18,.36,xC(0xb87050));}
 /* the lamp chorten at the head of the stair, marigolds and lamps on its ledge */
 xnShrine(-W/2+2.2,0,-6.8,.55,wash);vB('vStone',-W/2+2.2,0,-5.6,1.2,.45,.5,0,stone);
 for(let k=0;k<3;k++){kput('xDiscG',[-W/2+1.9+k*.3,.47,-5.6],null,[.07,.05,.07],gold);vBall('vEmber',-W/2+1.9+k*.3,.57,-5.6,.03,null,.05);}
 if(V===1){/* the chhatri on the landing's east corner: four posts, a flat slab, a little gilt dome */
  const cx=W/2-4.2,cz=-5.4;for(const a of[-1,1])for(const b of[-1,1])vPst('vPost',cx+a*1.3,0,cz+b*1.3,.12,2.6,cope);
  vB('vStone',cx,2.6,cz,3.3,.25,3.3,0,cope);vBall('xGold',cx,3.05,cz,.75,gold,.55);kput('xConeG',[cx,3.45,cz],null,[.12,.6,.12],gold);}
 xnFolk(0,0,-5,3,4);}
XA.def({key:'xa_ghat',name:'Landing stair (ghat)',family:'Dockyard',tags:{type:['infrastructure'],wealth:'civic',lit:false},w:24,d:16,h:4,fw:24,fd:16,nv:2,build:buildXaGhat});

/* ---------------------------------------------------------------- the governor's house: 30 x 26, two takes */
function buildXaGovernor(G,o){reseed(34821+(o.v|0));const V=xV(o)%2,plain=V===1,wash=xC(xPick(plain?XPAL.earth:XPAL.wash)),stone=xC(xPick(XPAL.stone)),tim=xC(xPick(XPAL.dark)),
 trim=xC(xPick(XPAL.trim)),tile=xC(xPick(XPAL.tile)),HW=10,HD=12,HZ=-6.6,H1=4.2,H2=3.6;
 vnReg('Governor\'s house',0,HZ,HW,H1+H2+3);vnReg('Governor\'s house — the forecourt',0,6,8,3);
 /* the house: dressed stone below, the upper storey washed, the flat roof with its parapet and band */
 xnWall(0,0,HZ,2*HW,H1,HD,0,stone,'dressed');
 const S=xnStack(0,H1,HZ,2*HW,HD,0,[H2],wash,plain?'earth':'wash');
 xnFlatRoof(0,H1+H2,HZ,S.w,S.d,0,wash,plain?{band:true,parapet:.5}:{band:true,gold:true,eave:true,eaveC:tim,parapet:.6,corner:'gold'});
 const zf=HZ+HD/2;
 for(const u of[-6.6,-3.4,3.4,6.6])xnTibWin(u,1.3,zf,0,.9,1.4,'glass',trim,{shutters:true,noVal:true});
 for(const u of[-6.6,-3.4,0,3.4,6.6])xnTibWin(u,H1+1.0,S.d/2+HZ-.05,0,.9,1.5,'glass',trim);
 for(const z of[HZ-3.5,HZ+.5])for(const s of[-1,1])xnTibWin(s*(S.w/2-.1),H1+1.0,z,s*Math.PI/2,.85,1.4,'glass',trim);
 vnDoor(0,0,zf,0,1.7,2.7,'vWood',tim,tim,false);
 /* the audience portico before the door: a stone plinth, four posts, a timber roof, an awning */
 vB('vStone',0,0,zf+1.4,10,.32,2.8,0,stone);
 for(const x of[-4.4,-1.5,1.5,4.4])vPst('vPost',x,.32,zf+2.5,.16,3.3,tim);
 vB('vWood',0,3.62,zf+1.4,10.4,.28,3.0,0,tim);vnAwning(0,3.5,zf+2.9,0,10,1.2,xC(XPAL.red));
 /* the forecourt: paved, walled, the gate on +z */
 xnPave(0,6,26,13,0,stone.clone().multiplyScalar(.92),2.2,-.3);
 const wallC=xC(xPick(plain?XPAL.earth:XPAL.wash)),item=plain?'xEarthB':'xWashB';
 for(const s of[-1,1]){vB(item,s*14.4,0,0,.6,2.4,24.6,0,wallC);vB('xTilesB',s*14.4,2.4,0,.9,.2,24.8,0,tile);
  vB(item,s*8.4,0,12.2,11.8,2.4,.6,0,wallC);vB('xTilesB',s*8.4,2.4,12.2,12.0,.2,.9,0,tile);}
 for(const s of[-1,1])vB('vStone',s*2.6,0,12.2,1.1,3.4,1.1,0,stone);vB('vStone',0,3.4,12.2,6.4,.55,1.2,0,stone);
 if(!plain)xnBand(0,3.95,12.2,6.2,1.0,0,.3,null,{gold:true});
 /* the office wing on the court's east side: one storey, flat roof, its door to the court */
 xnWall(10,0,4.5,7,3.4,7,0,wash,plain?'earth':'wash');xnFlatRoof(10,3.4,4.5,7,7,0,wash,{parapet:.4});vnDoor(6.45,0,4.5,-Math.PI/2,1.1,2.3,'vWood',tim,tim,false);
 /* the Sultan's flag in the court, the planters, the guard at the gate and the petitioners */
 xnFlagpole(-10.5,0,9.5,9,xC(XPAL.red));
 for(const x of[-6,6])vPst('vClayPot',x,0,zf+4.2,.45,.8,xC(0xb87050));
 xnFolk(0,0,10.6,2,1.2);xnFolk(-4,0,6,3,3);}
XA.def({key:'xa_governor',name:'Governor\'s house',family:'Public',tags:{type:['civic','residential'],wealth:'rich',lit:false},w:30,d:26,h:14,fw:28,fd:24,nv:2,build:buildXaGovernor});

/* ---------------------------------------------------------------- the ruins: roofless shells on the ground under them */
/* the ground at a local point, over the piece's own floor (o.y): the page's ground when the record gives it, else flat */
function xrGround(o){const C=VERN.cur;return(lx,lz)=>{if(!o.ground||!C)return 0;const p=loc(C.x,C.z,lx,lz,C.ry);return o.ground(p[0],p[1])-(o.y||0);};}
/* a wall from a to b (local x, z), t thick, broken into sections of about 1.4 m: each stands on the ground under its middle
   (sunk 0.5 m) to a height h x a draw in [lo, 1]; gaps (the doorway, windows) where gap(s) says, s the distance along */
function xrWall(gy,a,b,t,h,lo,c,gap){const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz);if(!(L>.2))return;const n=Math.max(1,Math.round(L/1.4)),ry=Math.atan2(dx,dz)+Math.PI/2;
 for(let k=0;k<n;k++){const s0=L*k/n,s1=L*(k+1)/n,sm=(s0+s1)/2;if(gap&&gap(sm))continue;const x=a[0]+dx*sm/L,z=a[1]+dz*sm/L,g=gy(x,z);
  const a0=[a[0]+dx*s0/L,a[1]+dz*s0/L],a1=[a[0]+dx*s1/L,a[1]+dz*s1/L],gl=Math.min(g,gy(a0[0],a0[1]),gy(a1[0],a1[1]));   /* on the lowest ground under it */
  const hh=Math.max(.5,h*(lo+(1-lo)*rng()));vB('vStone',x,gl-.5,z,s1-s0+.02,hh+.5+(g-gl),t,ry,c.clone().multiplyScalar(rr(.86,1.06)));}}
/* a heap of rubble at (x, z): boxes on their lowest faces, 0.15 m into the ground under each */
function xrHeap(gy,x,z,rx,rz,n,c){for(let k=0;k<n;k++){const px=x+rr(-rx,rx),pz=z+rr(-rz,rz),w=rr(.35,.9),d=rr(.3,.8),h=rr(.2,.5),r=Math.hypot(w,d)/2;
  const gl=Math.min(gy(px,pz),gy(px+r,pz),gy(px-r,pz),gy(px,pz+r),gy(px,pz-r));vB('vStone',px,gl-.15,pz,w,h,d,rng()*Math.PI,c.clone().multiplyScalar(rr(.75,1.05)));}}   /* on the lowest ground under it */
/* a fallen lintel or beam lying on the ground, its middle at (x, z) */
function xrBeam(gy,x,z,L,ry,c){const ex=Math.sin(ry)*L/2,ez=Math.cos(ry)*L/2,gl=Math.min(gy(x,z),gy(x+ex,z+ez),gy(x-ex,z-ez));vB('vWood',x,gl-.12,z,.24,.26,L,ry,c);}   /* on the lowest ground under its ends */
function buildXaRuinHouse(W,D,H,big){return function(G,o){reseed(34861+(o.v|0)*7+W);const gy=xrGround(o),V=xV(o)%4,rub=xC(xPick(XPAL.rubble)),earth=xC(xPick(XPAL.earth)),tim=xC(xPick(XPAL.aged));
 vnReg(big?'Ruined house (large)':'Ruined house',0,0,Math.max(W,D)/2,H);
 const hw=W/2-.4,hd=D/2-.4,lo=[.25,.4,.15,.55][V],door=s=>Math.abs(s-W/2+.4)<.9,win=s=>(Math.abs(s-W*.22)<.5||Math.abs(s-W*.78)<.5);
 xrWall(gy,[-hw,hd],[hw,hd],.6,H,lo,rub,s=>door(s)||win(s));                  /* the front: the doorway, two windows */
 xrWall(gy,[hw,-hd],[-hw,-hd],.6,H*.9,lo,rub,null);                            /* the back */
 xrWall(gy,[-hw,-hd+.3],[-hw,hd-.3],.6,H,lo,earth,s=>Math.abs(s-D/2)<.5);      /* the sides, earth-rendered, a window each */
 xrWall(gy,[hw,-hd+.3],[hw,hd-.3],.6,H*.95,lo,earth,null);
 if(big)xrWall(gy,[-hw+.3,-hd*.1],[hw*.4,-hd*.1],.45,H*.6,lo,rub,s=>Math.abs(s-W*.2)<.6);   /* the large house's inner wall */
 xrHeap(gy,-hw*.45,-hd*.35,hw*.3,hd*.25,6+V,rub);xrHeap(gy,hw*.5,hd*.4,hw*.25,hd*.2,4,rub);
 xrBeam(gy,rr(-hw*.3,hw*.3),rr(-hd*.3,hd*.3),Math.min(W,D)*.55,rr(0,Math.PI),tim);
 if(V!==2)xrHeap(gy,hw*.2,hd+.0,.9,.15,3,rub);};}   /* a little spill at the doorway */
XA.def({key:'xa_ruin_s',name:'Ruined house (small)',family:'Ruins',tags:{type:['single-family dwelling'],wealth:'poor',state:'ruined',lit:false},w:14,d:13,h:3.4,fw:13,fd:12,nv:4,build:buildXaRuinHouse(14,13,3.2,false)});
XA.def({key:'xa_ruin_m',name:'Ruined house',family:'Ruins',tags:{type:['single-family dwelling'],wealth:'middle',state:'ruined',lit:false},w:19,d:16,h:5,fw:18,fd:15,nv:4,build:buildXaRuinHouse(19,16,4.6,false)});
XA.def({key:'xa_ruin_l',name:'Ruined house (large)',family:'Ruins',tags:{type:['single-family dwelling'],wealth:'rich',state:'ruined',lit:false},w:24,d:18,h:6.5,fw:23,fd:17,nv:4,build:buildXaRuinHouse(24,18,6.2,true)});
/* the empty caravan market: 40 x 40, its gate on +z */
function buildXaSeraiRuin(G,o){reseed(34881+(o.v|0));const gy=xrGround(o),V=xV(o)%2,rub=xC(xPick(XPAL.rubble)),earth=xC(xPick(XPAL.ochre)),stone=xC(xPick(XPAL.stone)),tim=xC(xPick(XPAL.aged));
 vnReg('Ruined caravan market',0,0,20,6);
 const R=19.4,r=12.6,lo=V?.12:.25,gate=s=>Math.abs(s-R)<2.4;
 xrWall(gy,[-R,R],[R,R],.8,6,lo,earth,gate);xrWall(gy,[R,-R],[-R,-R],.8,6,lo,earth,null);
 xrWall(gy,[-R,-R+.4],[-R,R-.4],.8,6,lo,earth,null);xrWall(gy,[R,-R+.4],[R,R-.4],.8,6,lo,earth,null);
 /* the ranges' court walls, lower, broken at every bay; the arcade's piers as stumps in front of them */
 const bay=s=>(s%4.2)<1.2;
 xrWall(gy,[-r,r],[r,r],.6,3.4,lo,rub,s=>bay(s)||Math.abs(s-r)<2.2);xrWall(gy,[r,-r],[-r,-r],.6,3.4,lo,rub,bay);
 xrWall(gy,[-r,-r+.3],[-r,r-.3],.6,3.4,lo,rub,bay);xrWall(gy,[r,-r+.3],[r,r-.3],.6,3.4,lo,rub,bay);
 for(let k=-2;k<=2;k++)for(const [x,z] of[[k*4.2,r-1.3],[k*4.2,-r+1.3],[r-1.3,k*4.2],[-r+1.3,k*4.2]]){const g=Math.min(gy(x,z),gy(x-.35,z-.35),gy(x+.35,z+.35),gy(x-.35,z+.35),gy(x+.35,z-.35));vB('vStone',x,g-.5,z,.7,.5+rr(.4,2.8),.7,0,stone);}
 /* the cross walls between the rooms of the ranges */
 for(const t of[-7,0,7]){xrWall(gy,[t,R-.5],[t,r+.4],.5,4,lo,rub,null);xrWall(gy,[t,-R+.5],[t,-r-.4],.5,4,lo,rub,null);xrWall(gy,[R-.5,t],[r+.4,t],.5,4,lo,rub,null);xrWall(gy,[-R+.5,t],[-r-.4,t],.5,4,lo,rub,null);}
 /* the gate's two towers, broken stacks */
 for(const sx of[-1,1]){const x=sx*3.6,z=R-1.6,g=Math.min(gy(x-1.3,z-1.3),gy(x+1.3,z-1.3),gy(x-1.3,z+1.3),gy(x+1.3,z+1.3));vB('vStone',x,g-.5,z,2.6,.5+rr(4,7),2.6,0,stone);}
 /* the rubble of the ranges, the well in the court, beams */
 for(let k=0;k<8;k++){const a=k/8*TAU,x=Math.cos(a)*16,z=Math.sin(a)*16;xrHeap(gy,x,z,1.6,1.6,5+(V?3:0),rub);}
 {const g=Math.min(gy(0,0),gy(1.1,0),gy(-1.1,0),gy(0,1.1),gy(0,-1.1));vPst('vStone',0,g-.3,0,1.1,1.0,stone);}
 for(let k=0;k<4;k++)xrBeam(gy,rr(-8,8),rr(-8,8),rr(3,5),rr(0,Math.PI),tim);}
XA.def({key:'xa_serai_ruin',name:'Ruined caravan market',family:'Ruins',tags:{type:['inn','market'],wealth:'civic',state:'ruined',lit:false},w:40,d:40,h:8,fw:40,fd:40,nv:2,build:buildXaSeraiRuin});

/* ---------------------------------------------------------------- the net loft: 18 x 16, two takes; its front +z */
function buildXaNetLoft(G,o){reseed(34891+(o.v|0));const V=xV(o)%2,stone=xC(xPick(XPAL.rubble)),wash=xC(xPick(XPAL.wash)),tim=xC(xPick(XPAL.timber)),timD=xC(0x5a4632),
 net=xC(0x5a4a38),netL=xC(0x7a6a52),rope=xC(0xb8a070),float=xC(0xd8b060);
 vnReg('Net loft',0,-3,8,8);
 /* the ground floor (the laying-up room) and the loft over it: a stone room, a timber frame open at the front */
 xnWall(0,0,-3.5,14,3.2,8,0,stone,'stone');vnDoor(-3.5,0,.5,0,1.3,2.3,'vWood',timD,timD,false);
 vB('vWood',0,3.2,-3.5,14.4,.25,8.4,0,tim);                                         /* the loft's floor */
 for(const x of[-6.8,-2.3,2.3,6.8]){vPst('vPost',x,3.45,.45,.14,2.8,timD);vPst('vPost',x,3.45,-7.45,.14,2.8,timD);}
 vB('vWood',0,3.45,-7.5,14,2.8,.2,0,tim);for(const s of[-1,1])vB('vWood',s*7,3.45,-3.5,.2,2.8,8,0,tim);   /* the back and the ends boarded */
 xnFlatRoof(0,6.25,-3.5,14.6,8.6,0,wash,{parapet:.3});
 vB('vWood',0,5.6,.55,14,.12,.12,0,timD);                                            /* the hanging rail */
 for(let k=0;k<6;k++){const x=-5.8+k*2.3;kput('xPaintPl',[x,4.4,.62],qEuler(0,0,0),[1.9,2.3,1],(k%2?net:netL).clone().multiplyScalar(rr(.85,1.1)));}   /* the nets hung from it */
 /* the drying frames before it: two posts and a rail top and bottom, a net stretched between */
 const frames=V?3:2;for(let f=0;f<frames;f++){const x=(f-(frames-1)/2)*5.6,z=4.6;
  for(const s of[-1,1])vPst('vPost',x+s*2.4,0,z,.08,2.6,timD);vB('vWood',x,2.5,z,5,.1,.1,0,timD);vB('vWood',x,.35,z,5,.08,.08,0,timD);
  kput('xPaintPl',[x,1.42,z],null,[4.7,2.0,1],netL.clone().multiplyScalar(rr(.85,1.05)));}
 /* the coils of line, the floats in a basket, the bench where the nets are mended */
 for(let k=0;k<3;k++)vPst('vRope',-6+k*1.1,0,6.6,.38,.3,rope);
 vB('vWood',5,0,7,1.2,.6,.9,0,tim);for(let k=0;k<5;k++)vBall('vBall',4.7+rr(0,.6),.65,6.8+rr(0,.4),.12,float);
 vB('vWood',0,0,7.2,3,.45,.5,0,tim);
 xnFolk(0,0,6,2,2);}
XA.def({key:'xa_net_loft',name:'Net loft',family:'Works',tags:{type:['industry'],wealth:'poor',job:'fishing',lit:false},w:18,d:16,h:7,fw:15,fd:9,nv:2,build:buildXaNetLoft});

/* ---------------------------------------------------------------- the orchard plot: 30 x 24, three takes */
function buildXaOrchardPlot(G,o){reseed(34895+(o.v|0));const V=xV(o)%3,bark=xC(0x5a4632),earth=xC(xPick(XPAL.earth)).multiplyScalar(.9);
 const leaf=[xC(0x2f5a2a),xC(0x5a8a3a),xC(0x4a7a34)][V],pod=xC(0xc08030),fruit=xC(0xd8a040);
 vnReg(['Cacao grove','Mulberry plot','Orchard plot'][V],0,0,14,V===0?9:5);
 const sx=V===0?5:V===1?4:6,sz=V===0?5:4,nx=Math.floor(28/sx),nz=Math.floor(22/sz);
 for(let i=0;i<nx;i++)for(let k=0;k<nz;k++){const x=-((nx-1)*sx)/2+i*sx+rr(-.3,.3),z=-((nz-1)*sz)/2+k*sz+rr(-.3,.3);
  if(V===0){vPst('vPost',x,0,z,.09,1.6,bark);vBall('vBall',x,2.2,z,1.3,leaf.clone().multiplyScalar(rr(.85,1.1)),.9);
   for(let p=0;p<3;p++)vBall('vBall',x+rr(-.12,.12),.5+p*.35,z+rr(-.12,.12),.12,pod,.2);}
  else if(V===1){vPst('vPost',x,0,z,.1,1.4,bark);vBall('vBall',x,1.9,z,.9,leaf.clone().multiplyScalar(rr(.85,1.1)),.6);}
  else{vPst('vPost',x,0,z,.11,1.5,bark);vBall('vBall',x,2.5,z,1.5,leaf.clone().multiplyScalar(rr(.85,1.1)),1.1);vBall('vBall',x+rr(-.6,.6),2.2,z+rr(-.6,.6),.12,fruit,.12);}}
 if(V===0)for(const z of[-8,8])for(let i=0;i<5;i++){const x=-12+i*6;vPst('vPost',x,0,z,.2,6.5,bark);vBall('vBall',x,7.4,z,2.4,xC(0x3a6a2a),1.4);}   /* the shade trees */
 if(V===1)for(let k=0;k<3;k++){const x=rr(-10,10),z=rr(-8,8);vB('vWood',x,0,z,.5,2.6,.08,rr(0,Math.PI),bark);}   /* the pickers' ladders */
 vB('xEarthB',0,-.05,0,29,.08,23,0,earth);}
XA.def({key:'xa_orchard_plot',name:'Orchard plot',family:'Works',tags:{type:['farm'],wealth:'poor',job:'farming',lit:false},w:30,d:24,h:10,fw:30,fd:24,nv:3,build:buildXaOrchardPlot});
