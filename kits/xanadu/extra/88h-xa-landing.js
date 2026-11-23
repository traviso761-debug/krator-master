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
                    earth-washed and plainer (no gilt) */

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
