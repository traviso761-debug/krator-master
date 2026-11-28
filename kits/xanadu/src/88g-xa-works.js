/* ================================================================= XANADU — the works: the lake towns' trades, the mines, the wayside shrine
   In src/ and FILES since Stage 8 B9 (2026-11-24); before that OPT-IN in extra/ (kits/xanadu/README.md, "Opt-in pieces"; settlements/xanadu/BUILD-OUT.md section
   4a, the pieces the lake towns' trades want; wave 0.1): a page takes it through its kit.json "external", so no other page changes;
   it joins src/ with the ride-along rebuild. core/hamlet's focus records name these keys (BUILD-OUT.md 4b): keep them. Each piece
   is drawn in its own frame, front +z, its ground at local y 0 unless noted, opening with its own reseed, on the kit's vocabulary
   (xnWall, xnStack, xnFlatRoof, xnTibWin, xnPennants, vnGableRoof, vnDoor ...). Seeds 34601-34799 (34400-34599 is the Flashing
   Eye's, 34300-34399 the harbour's).
     xa_kiln_yard       the potters' (Pāṭari): the wheel shed under a flat mud roof, kilns (v 0 two bottle kilns, v 1 a climbing
                        kiln of five chambers, v 2 three small kilns), shelves of drying pots, the clay pit, the sherd heap
     xa_dye_works       the dyers' (Ḍāiyar, Wībhar): the dye store (v 2 whitewashed, the twig band and gilt corners), six vats in
                        stone kerbs, the coppers on their hearth, three drying lines of long cloth, the wash channel; v 1 all indigo
     xa_loom_house      the weavers' (Wībhar's looms, Erewhon's weavers): a long battered hall, a clerestory lantern down its roof,
                        a portico with two looms working in its shade, skeins drying; v 1 earth-washed
     xa_saffron_house   Saphran's: the sorting floor behind an arcade, the louvred drying loft over it, the stair, the sorting
                        tables of crocus under an awning; v 1 gilt corners
     xa_apiary          Hāibh's: the hive wall (log hives, v 1 clay pipes) under a thatch hood, v 0 a second wall, the honey house,
                        the press, the jars, the wax, the bee pasture
     xa_reeling_house   Malbari's silk: the hearth range with its basins and cocoons, five reels; v 0 the undershot wheel on its
                        race driving the line shaft, v 1 treadles and the cocoon baskets; skeins drying
     xa_mat_shed        Lōṭas's and Rīḍ's: the weaving shed under reed thatch (v 1 an earth back wall), mats, rolls; reed racks,
                        stooks, the soaking trough
     xa_quarry_yard     Qorī's: three benches cut back into the hill, the channels, a block half split; the masons' yard, stacked
                        and rough blocks, bankers, the chips heap, the sheerlegs (v 1 up on the first bench), the tool hut
     xa_sulfur_works    Hoṭ-Bāṭh's: the hot spring's sinter apron and terraces, the crust beds (v 1 eight), the melting shed with its
                        iron pots and flue, the cakes cooling, the stacks
     xa_customs_house   Lāiṭ-Hāus's: the Sultan's customs house (two storeys, twig band, gilt corners, sun-and-moon), the tally
                        office, the weighing beam, the flag; v 0 on a quay (its face at z +9, 2.4 m over the lake as the harbour
                        quay), v 1 a road's toll house with its toll bar
     xa_fishponds       Bē-Āil's: stone-walled pens in the shallows (v 0 six, v 1 four and a feeding deck), a sluice in each, the
                        grilles, the bank and the keeper's hut; THE LAKE'S SURFACE AT LOCAL Y 0 (the town sets o.y to the water)
     xa_slipway         Boṭ-Yārḍ's: xa_slip (88f) is already the slipway (the ramp, the ways, a hull on its cradle), so this
                        is its twin, as the wind-catchers are: the same builder, then the timber stacks, the steam box, the saw
                        pit (v 1 a rack of frames for the plank stack). Needs 88f on the page
     xa_mine_head       the gold mines' and the opal mines' (v 1): the adit in the hill, its timber sets, the rails and cart, the
                        ore heap, the spoil, the winze's windlass, the tally hut and its scales (v 1 the sorting table)
     xa_placer_sluice   the placer focus: the long sluice box down the bank on trestles, its riffles (v 1 two boxes), the rocker,
                        the tailings, the diggers' fly
     xa_wayside_shrine  every village's: v 0 a white chorten with a niche and the offering ledge, v 1 a niche pillar with a gilt
                        image, v 2 a mani wall and a small chorten; prayer flags on all three
   Not here, on purpose: a second caravanserai (xa_serai in 87k and xa_caravanserai in 88c are the two sizes). */

/* ---------------------------------------------------------------- shared: heaps, tables, pot shelves, a kiln, a loom, a reel */
const XW_LUNGTA=[0x2a5aa8,0xf4efe4,0xa8382a,0x2f7a4a,0xe8c030];   /* the prayer flags' five colours, in their order */
/* a heap of loose stuff (sherds, ore, spoil, tailings, chips, crust): a flattened rock mound, lumps on it; (x,z) its centre */
function xwHeap(x,z,rx,rz,h,c,n){kput('xBoulder',[x,0,z],null,[rx,h,rz],c);
 for(let k=0;k<(n==null?6:n);k++){const a=rng()*TAU,t=Math.sqrt(rng())*.7,s=rr(.14,.32),px=x+Math.cos(a)*rx*t*.85,pz=z+Math.sin(a)*rz*t*.85;
  kput('xBoulder',[px,h*Math.sqrt(1-t*t)-s*.3,pz],qEuler(rng()*3,rng()*3,0),[s,s*.8,s],c.clone().multiplyScalar(rr(.82,1.12)));}}
/* a rope or a pole from a to b, on an item whose geometry stands on its base (vRope, vPost): the Ancients' beam() centres the item
   on the midpoint, so with these it draws from the midpoint on past b; this seats the base at a */
function xwLine(a,b,w,c,item){const d=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]),L=d.length();if(!(L>1e-4))return;
 kput(item||'vRope',a,new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.multiplyScalar(1/L)),[w,L,w],c||null);}
/* a line of prayer flags from a to b, n of them: xnPennants (72-xa-helpers) with its rope seated by xwLine (its own vBeam rope
   runs on past b by half its length: src/ keeps it until the rebuild) */
function xwFlags(a,b,n){xwLine(a,b,.03,xC(0x6a5a48));
 for(let k=0;k<n;k++){const t=(k+.5)/n,p=[lerp(a[0],b[0],t),lerp(a[1],b[1],t)-.22,lerp(a[2],b[2],t)],yaw=Math.atan2(b[0]-a[0],b[2]-a[2])+Math.PI/2;
  kput('xPaintPl',p,qEuler(0,yaw,0),[.34,.42,1],xC(XW_LUNGTA[k%XW_LUNGTA.length]));}}
/* a trestle table, w x d, its top at h */
function xwTable(x,z,w,d,h,ry,c){vB('vWood',x,h-.07,z,w,.07,d,ry,c);
 for(const s of[-1,1])for(const t of[-1,1]){const p=loc(x,z,s*(w/2-.12),t*(d/2-.1),ry);vB('vWood',p[0],0,p[1],.08,h-.07,.08,ry,c);}}
/* open shelves L long, tiers high, a row of pots on each */
function xwPotShelf(x,z,L,tiers,ry,c,pot){for(const s of[-1,1])for(const t of[-1,1]){const p=loc(x,z,s*(L/2-.06),t*.3,ry);vB('vWood',p[0],0,p[1],.08,.45+tiers*.5,.08,ry,c);}
 const n=Math.max(2,Math.floor((L-.3)/.42));
 for(let k=0;k<tiers;k++){const y=.4+k*.5;vB('vWood',x,y,z,L,.05,.7,ry,c);
  for(let i=0;i<n;i++){const p=loc(x,z,-L/2+.36+i*(L-.72)/(n-1),rr(-.12,.12),ry);vPst('vClayPot',p[0],y+.05,p[1],.12,rr(.2,.34),pot.clone().multiplyScalar(rr(.9,1.08)));}}}
/* a bottle kiln: the round body, its dome and neck, the firing mouth facing ry with the fire in it, the stoker's apron */
function xwKiln(x,z,r,h,ry,c){const dk=c.clone().multiplyScalar(.82);kput('xDrumE',[x,0,z],null,[r,h,r],c);
 kput('xDomeS',[x,h,z],null,[r*.88,r*.62,r*.88],dk);kput('xDrumE',[x,h+r*.5,z],null,[r*.3,.9,r*.3],dk);
 const m=loc(x,z,0,r-.03,ry);vB('vDarkB',m[0],.12,m[1],.8,.85,.12,ry);vBall('vEmber',m[0],.4,m[1],.2,null,.13);
 const b=loc(x,z,0,r+.35,ry);vB('vStone',b[0],0,b[1],1.5,.12,.7,ry,xC(xPick(XPAL.rubble)));}
/* a floor loom: four posts, the top rails, the warp and breast beams, the warp near level, the beater, the bench; the weaver sits at +z */
function xwLoom(x,y,z,ry,c,warp){const P=(u,v)=>loc(x,z,u,v,ry);
 for(const s of[-1,1])for(const t of[-1,1]){const p=P(s*.9,t*.7);vB('vWood',p[0],y,p[1],.1,1.7,.1,ry,c);}
 for(const t of[-1,1]){const p=P(0,t*.7);vB('vWood',p[0],y+1.6,p[1],1.9,.1,.1,ry,c);}
 let p=P(0,-.6);vB('vWood',p[0],y+.85,p[1],1.8,.14,.14,ry,c);p=P(0,.6);vB('vWood',p[0],y+.72,p[1],1.8,.18,.18,ry,c);
 p=P(0,0);kput('vCloth',[p[0],y+.86,p[1]],vQ(ry,-Math.PI/2+.08,0),[1.6,1.2,1],warp);
 p=P(0,.15);vB('vWood',p[0],y+.95,p[1],1.7,.35,.06,ry,c);p=P(0,1.2);vB('vWood',p[0],y,p[1],1.4,.45,.35,ry,c);}
/* a silk reel across x at (x, y, z): two iron rims, six bars, the axle, its stands, the silk wound on it */
function xwReel(x,z,y,c,silk){for(const u of[-.42,.42]){kput('vHoop',[x+u,y,z],qEuler(0,Math.PI/2,0),[.36,.36,1],c);vB('vWood',x+u*1.3,0,z,.08,y+.06,.08,0,c);}
 kput('vWood',[x,y,z],null,[1.2,.06,.06],c);for(let k=0;k<6;k++){const a=k/6*TAU;kput('vWood',[x,y+Math.sin(a)*.36,z+Math.cos(a)*.36],null,[.86,.05,.05],c);}
 kput('vPost',[x-.32,y,z],qEuler(0,0,-Math.PI/2),[.3,.64,.3],silk);}

/* ---------------------------------------------------------------- the kiln yard (the potters'): 24 x 20, the wheel shed at the back */
function buildXaKilnYard(G,o){reseed(34601+(o.v|0));const V=xV(o),earth=xC(xPick(XPAL.earth)),brick=xC(xPick([0x9a5a3a,0xa8684a,0x8a5034])),aged=xC(xPick(XPAL.aged)),
 timD=xC(0x5a4632),stone=xC(xPick(XPAL.stone)),fired=xC(0xb87050),raw=xC(0xd8c0a0);
 vnReg('Kiln yard (the potters\')',0,0,11,5);
 vB('xEarthB',0,0,0,23,.05,19,0,earth.clone().multiplyScalar(.88));                 /* the yard's beaten floor */
 /* the wheel shed: an earth back wall and its two ends, posts in front, a flat mud roof with the firewood on its edge */
 vB('xEarthB',0,0,-8.9,12,2.8,.6,0,earth);for(const s of[-1,1])vB('xEarthB',s*5.7,0,-7.2,.6,2.8,3.4,0,earth);
 for(const x of[-5.7,-1.9,1.9,5.7])vPst('vPost',x,0,-5.4,.12,2.65,timD);vB('vWood',0,2.62,-5.4,11.8,.18,.24,0,timD);
 vB('xEarthB',0,2.8,-7.2,12.4,.3,4.3,0,earth.clone().multiplyScalar(.95));xnFodder(0,3.1,-8.9,11,0);
 for(const x of[-3,0]){vPst('vBarrel',x,0,-7.2,.3,.5,aged);vPst('xDiscS',x,.55,-7.2,.42,.06,stone);vPst('vClayPot',x,.61,-7.2,.15,.28,raw);}   /* the wheels */
 xwPotShelf(3.4,-8.1,3.6,3,0,aged,raw);
 /* the kilns along the east side, their mouths to the yard */
 if(V===1){/* the climbing kiln: five chambers stepping up, the firebox at the foot, the chimney at the head */
  for(let k=0;k<5;k++){const z=-3+k*2.4,y=k*.35;vB('xRubB',8,0,z,2.8,1.3+y,2.3,0,brick);kput('xDomeS',[8,1.3+y,z],null,[1.25,.8,1.05],brick.clone().multiplyScalar(.88));
   vB('vDarkB',6.58,.5+y,z,.06,.5,.5,0);}
  vB('xRubB',8,0,-5,2.2,1.1,1.6,0,brick);vB('vDarkB',8,.15,-5.82,.9,.7,.06,0);vBall('vEmber',8,.4,-5.75,.22,null,.12);
  vB('xRubB',8,0,9.1,1.3,4.8,1.1,0,brick);}
 else{const n=V===2?3:2,r=V===2?1.5:1.9;for(let k=0;k<n;k++)xwKiln(7.8,n===3?-1.5+k*4.4:.5+k*5,r,V===2?2.0:2.4,-Math.PI/2,brick);}
 for(let j=0;j<3;j++)for(let i=0;i<6;i++)vB('vWood',4.0+i*.24,j*.22,-2.6,.2,.2,1.6,0,timD.clone().multiplyScalar(rr(.85,1.2)));   /* the firewood */
 for(let i=0;i<9;i++)vPst('vClayPot',2+i*.5,0,8.8,.18,rr(.35,.55),fired.clone().multiplyScalar(rr(.88,1.08)));             /* fired and waiting */
 /* the drying shelves, the clay pit and its heap, the sherd heap, the water jars */
 xwPotShelf(-4.5,1.2,5,3,0,aged,raw);xwPotShelf(-4.5,4.4,5,3,0,aged,raw);
 vB('xEarthB',-9,0,-2.2,2.8,.3,2.2,0,earth.clone().multiplyScalar(.75));vB('xWaterB',-9,.2,-2.2,2.3,.12,1.7,0,xC(0x8a7458));
 xwHeap(-9.6,1.4,1.3,1.1,.7,xC(0x9a7656),4);xwHeap(-9,7.2,1.9,1.5,.75,fired.clone().multiplyScalar(.8),10);
 for(let k=0;k<12;k++)kput('xPaint',[-9+rr(-2.4,2.4),.03,7.2+rr(-1.9,1.9)],qEuler(rr(-.4,.4),rng()*3,0),[rr(.12,.3),.03,rr(.1,.22)],fired.clone().multiplyScalar(rr(.7,1.05)));
 for(let k=0;k<3;k++)vPst('vClayPot',-1+k*.8,0,-3.8,.32,.75,fired.clone().multiplyScalar(.9));
 xnFolk(0,0,1,3,5);}
XA.def({key:'xa_kiln_yard',name:'Kiln yard (the potters\')',family:'Works',tags:{type:['industry'],wealth:'poor',lit:false},w:24,d:20,h:5,fw:22,fd:18,nv:3,build:buildXaKilnYard});

/* ---------------------------------------------------------------- the dye works: 26 x 22, the store at the back west, the lines in front */
function buildXaDyeWorks(G,o){reseed(34611+(o.v|0));const V=xV(o),earth=xC(xPick(XPAL.earth)),wash=xC(xPick(XPAL.wash)),stone=xC(xPick(XPAL.stone)),rub=xC(xPick(XPAL.rubble)),
 tim=xC(xPick(XPAL.timber)),timD=xC(0x5a4632),trim=xC(xPick(XPAL.trim)),copper=xC(0xb06a3a);
 /* the dyes: v 0 the common run (indigo, madder, weld, green, walnut), v 1 indigo only, v 2 the rich dyer's yellows and reds */
 const DYE=V===1?[0x1a2450,0x24346e,0x2e4888,0x3a5aa0]:V===2?[0xd8a028,0xe8b830,0x9a2a24,0x8a1f3a,0xc8641e]:[0x24346e,0x9a2a24,0xd8a028,0x3a6a3a,0x5a3a22];
 vnReg('Dye works',0,0,12,6);
 /* the dye store: two storeys, earth-washed (v 2 whitewashed, the twig band and gilt corners); madder, indigo and alum in it */
 const SC=V===2?wash:earth,S=xnStack(-7,0,-7,9,6,0,[3.2,2.8],SC,V===2?'wash':'earth');
 xnFlatRoof(-7,S.y,-7,S.w,S.d,0,SC,{parapet:.6,band:V===2,gold:V===2,corner:V===2?'gold':'flag'});
 vnDoor(-7,0,-4,0,1.3,2.3,'vWood',tim,timD,false);for(const u of[-2.6,2.6])xnTibWin(-7+u,1.0,-4.02,0,.8,.9,'shut',trim,{noVal:true});
 for(const u of[-2.4,0,2.4])xnTibWin(-7+u,4.0,-4.35,0,.8,1.0,'glass',trim);
 /* the vats: six sunk in stone kerbs, each its dye, on ground stained with what spills (a tinted earth: no stained texture yet) */
 vB('xEarthB',4,0,-3.6,11,.04,7,0,xC(V===1?0x5a6078:0x7a5a58));
 for(let i=0;i<3;i++)for(let j=0;j<2;j++){const x=1+i*3,z=-5.4+j*3.4;vB('vStone',x,0,z,1.8,.62,1.8,0,stone);
  for(const s of[-1,1]){vB('vStone',x+s*.85,.62,z,.3,.18,2.0,0,stone.clone().multiplyScalar(1.06));vB('vStone',x,.62,z+s*.85,1.4,.18,.3,0,stone.clone().multiplyScalar(1.06));}
  vB('xWaterB',x,.62,z,1.42,.12,1.42,0,xC(DYE[(i+j*3)%DYE.length]));vB('vWood',x,.8,z,.06,.06,1.9,0,timD);}
 /* the coppers on their hearth, the fire under each, the flue */
 vB('xRubB',10.6,0,-6,1.8,.8,4,0,rub);
 for(const z of[-7,-5]){vPst('vClayPot',10.6,.8,z,.62,.6,copper);kput('xDiscWater',[10.6,1.38,z],null,[.5,.04,.5],xC(DYE[0]));vB('vDarkB',9.69,.12,z,.06,.5,.6,0);vBall('vEmber',9.74,.36,z,.2,null,.12);}
 vB('xRubB',11.2,0,-8.4,1.0,4.2,1.0,0,rub);
 /* the drying lines: poles, the rope, the cloth hung in long drops */
 for(const z of[2.4,5.4,8.4]){for(const x of[-10,-5,0,5,10])vPst('vPost',x,0,z,.07,3.9,timD);xwLine([-10,3.8,z],[10,3.8,z],.025,xC(0xb8a888));
  for(let k=0;k<17;k++)kput('vCloth',[-9.4+k*1.17,2.45,z],null,[.95,2.6,1],xC(DYE[(k+Math.round(z))%DYE.length]).multiplyScalar(rr(.9,1.1)));}
 /* by the store: the indigo cakes on a table, the madder in sacks, the alum jars */
 xwTable(-3.2,-2.6,1.8,.8,.85,0,timD);for(let k=0;k<8;k++)vB('xPaint',-3.9+(k%4)*.45,.85,-2.75+Math.floor(k/4)*.3,.3,.12,.22,0,xC(0x1e2a5a));
 vnSacks(-9,0,-2.4,5);for(let k=0;k<4;k++)vPst('vClayPot',-11.5+k*.75,0,-2.6,.25,.6,xC(0xb08a6a));
 /* the wash channel along the front, the spent dye going out with it */
 vB('xWaterB',0,0,10.2,24,.12,.8,0,xC(V===1?0x3a5a7a:0x5a6a7a));for(const s of[-1,1])vB('vStone',0,0,10.2+s*.52,24,.25,.24,0,stone);
 xnFolk(2,0,4,4,6);}
XA.def({key:'xa_dye_works',name:'Dye works',family:'Works',tags:{type:['industry'],wealth:'poor',lit:false},w:26,d:22,h:8,fw:24,fd:20,nv:3,build:buildXaDyeWorks});

/* ---------------------------------------------------------------- the loom house: 32 x 16, the hall on z = -2, its portico to +z */
function buildXaLoomHouse(G,o){reseed(34621+(o.v|0));const V=xV(o),stone=xC(xPick(XPAL.stone)),C=V===1?xC(xPick(XPAL.earth)):xC(xPick(XPAL.wash)),K=V===1?'earth':'wash',
 tim=xC(xPick(XPAL.timber)),timD=xC(0x5a4632),trim=xC(xPick(XPAL.trim)),L=28,D=10,H=4.2,Z=-2;
 vnReg('Loom house',0,Z,L/2,H+3.5);
 vB('vStone',0,0,Z,L+.6,.4,D+.6,0,stone);
 const k=xnWall(0,.4,Z,L,H,D,0,C,K);xnFlatRoof(0,.4+H,Z,L*k,D*k,0,C,{parapet:.5,band:V===0});
 /* the clerestory: a lantern down the roof, its windows on both long faces lighting the looms */
 const CY=.4+H+.35,CL=22,CD=3.6,CH=1.9;vB('xWashB',0,CY,Z,CL,CH,CD,0,C);
 for(let i=0;i<10;i++){const x=-CL/2+1.1+i*(CL-2.2)/9;vnWin(x,CY+.45,Z+CD/2,0,1.0,.9,'glass','xPaint',trim);vnWin(x,CY+.45,Z-CD/2,Math.PI,1.0,.9,'glass','xPaint',trim);}
 xnFlatRoof(0,CY+CH,Z,CL,CD,0,C,{parapet:.4});
 /* the doors at the ends, the windows, the portico along the front and its floor */
 for(const s of[-1,1])vnDoor(s*L/2,.4,Z,s*Math.PI/2,1.6,2.6,'vWood',tim,timD,false);
 for(const x of[-12.2,-10,10,12.2])xnTibWin(x,1.6,Z+D/2-.05,0,.8,1.0,'glass',trim,{noVal:true});
 for(let i=0;i<6;i++)xnTibWin(-11+i*4.4,1.6,Z-D/2+.05,Math.PI,.8,1.0,'glass',trim,{noVal:true});
 vB('vStone',0,0,Z+D/2+1.3,16.6,.4,2.6,0,stone);xnPortico(0,.4,Z+D/2,0,16,2.4,3.4,C,{band:true});
 /* two looms working in the portico's shade (between its columns), the skeins drying, the bales */
 for(const x of[-4,4])xwLoom(x,.4,Z+D/2+1.15,Math.PI,tim,xC(xPick(XPAL.cloth)));
 for(const x of[9,15])vPst('vPost',x,0,7.2,.06,2.2,timD);xwLine([9,2.15,7.2],[15,2.15,7.2],.02,xC(0xb8a888));
 for(let i=0;i<10;i++)kput('vCloth',[9.4+i*.58,1.8,7.2],null,[.22,.6,1],xC(xPick(XPAL.cloth)));
 for(let i=0;i<4;i++)vB('vClothB',-14+i*1.15,0,5.6,1.0,.8,1.0,0,xC(xPick([0xe8e0cc,0xd8ccb0,0xc8b898])));
 xnFolk(0,0,6.6,4,6);}
XA.def({key:'xa_loom_house',name:'Loom house',family:'Works',tags:{type:['industry'],wealth:'middle',lit:false},w:32,d:16,h:8,fw:29,fd:11,nv:2,build:buildXaLoomHouse});

/* ---------------------------------------------------------------- the saffron house: 14 x 13, the loft over the sorting floor */
function buildXaSaffronHouse(G,o){reseed(34631+(o.v|0));const V=xV(o),stone=xC(xPick(XPAL.stone)),rub=xC(xPick(XPAL.rubble)),wash=xC(xPick(XPAL.wash)),
 tim=xC(xPick(XPAL.timber)),timD=xC(0x4a3a2a),W=12,D=8,Z=-1.5,H0=3.2,H1=2.6,crocus=[0x8a5aa8,0x9a6ab8,0x7a4a98],red=xC(0xc0281a),wicker=xC(0xa08050);
 vnReg('Saffron house',0,Z,W/2,H0+H1+2);
 vB('vStone',0,0,Z,W+.4,.35,D+.4,0,stone);
 /* the sorting floor: a rubble storey, its front an arcade */
 const k=xnWall(0,.35,Z,W,H0,D,0,rub,'stone');xnArcade(0,.35,Z+D/2,0,W-2.4,H0-.7,3,'xArchS',stone,.5);
 /* the drying loft: a timber floor, posts and louvres all round (the stigmas dry in the moving air), the trays inside */
 const LW=W*k-.2,LD=D*k-.2,ly=.35+H0;vB('vWood',0,ly,Z,LW+.3,.22,LD+.3,0,timD);
 for(let i=0;i<=8;i++){const x=-LW/2+LW*i/8;for(const s of[-1,1])vPst('vPost',x,ly+.22,Z+s*LD/2,.09,H1,tim);}
 for(let j=1;j<5;j++){const z=Z-LD/2+LD*j/5;for(const s of[-1,1])vPst('vPost',s*LW/2,ly+.22,z,.09,H1,tim);}
 for(let l=0;l<5;l++){const y=ly+.55+l*.42;for(const s of[-1,1]){vB('vWood',0,y,Z+s*LD/2,LW,.06,.12,0,tim);vB('vWood',s*LW/2,y,Z,.12,.06,LD,0,tim);}}
 for(let i=0;i<4;i++){const x=-3.6+i*2.4;vB('vWood',x,ly+1.0,Z,1.8,.06,LD-1.4,0,timD);vB('xPaint',x,ly+1.06,Z,1.6,.03,LD-1.6,0,red);}
 xnFlatRoof(0,ly+.22+H1,Z,LW+.2,LD+.2,0,wash,{band:true,gold:V===1,parapet:.5,corner:V===1?'gold':'flag'});
 /* the stair up the east side to the loft door */
 xnFlight(6.55,0,3.0,0,1.0,ly+.22,'vStone',stone);vnDoor(LW/2,ly+.22,Z-LD/2+1.0,Math.PI/2,.9,1.8,'vWood',tim,timD,false);
 /* the sorting tables under the awning, crocus heaped, the red threads laid out; baskets of blooms; the brazier */
 vnAwning(0,3.0,Z+D/2,0,9,2.4,xC(xPick(XPAL.cloth)));
 for(const x of[-3,0,3]){xwTable(x,4.6,2.2,1.0,.8,0,timD);for(let n=0;n<7;n++)kput('xPaintBall',[x+rr(-.8,.8),.84,4.6+rr(-.3,.3)],null,[.12,.07,.12],xC(xPick(crocus)));vB('xPaint',x+.6,.8,4.6,.6,.03,.5,0,red);}
 for(let n=0;n<4;n++){const z=3.4+n*.75;vPst('vBarrel',-6.2,0,z,.3,.5,wicker);kput('xPaintBall',[-6.2,.52,z],null,[.27,.12,.27],xC(xPick(crocus)));}
 vPst('vClayPot',5.0,0,5.6,.3,.45,xC(0x6a5040));vBall('vEmber',5,.48,5.6,.2,null,.08);
 xnFolk(0,0,4.8,3,4);}
XA.def({key:'xa_saffron_house',name:'Saffron house',family:'Works',tags:{type:['industry','farm'],wealth:'middle',lit:false},w:14,d:13,h:8,fw:13,fd:9,nv:2,build:buildXaSaffronHouse});

/* ---------------------------------------------------------------- the apiary: 18 x 14, the hive wall at the back facing the morning (+z) */
function buildXaApiary(G,o){reseed(34641+(o.v|0));const V=xV(o),rub=xC(xPick(XPAL.rubble)),stone=xC(xPick(XPAL.stone)),earth=xC(xPick(XPAL.earth)),aged=xC(xPick(XPAL.aged)),
 timD=xC(0x5a4632),thatch=xC(xPick(VPAL.thatch)),logC=xC(0x7a6248),clayC=xC(0xa8784e),amber=xC(0xc08a30);
 vnReg('Apiary',0,0,8,3);
 /* a hive laid in a wall: a hollow log (v 0) or a clay pipe (v 1), its mouth 0.4 m proud of the face (dir 'z': the face at z,
    facing +z; 'x': at x, facing +x) */
 const hive=(x,y,z,dir)=>{const it=V===1?'vClayPot':'vPost',c=(V===1?clayC:logC).clone().multiplyScalar(rr(.85,1.1));
  if(dir==='x'){kput(it,[x-.62,y,z],qEuler(0,0,-Math.PI/2),[.22,1.0,.22],c);vB('vDarkB',x+.39,y-.05,z,.02,.1,.1,0);}
  else{kput(it,[x,y,z-.62],qEuler(Math.PI/2,0,0),[.22,1.0,.22],c);vB('vDarkB',x,y-.05,z+.39,.1,.1,.02,0);}};
 /* the hive wall: drystone, three rows of hives, a coping and a thatch hood over them */
 const zf=-4.6;vB('xRubB',0,0,zf-.7,14,2.5,1.4,0,rub);for(let r=0;r<3;r++)for(let i=0;i<9;i++)hive(-6+i*1.5+(r%2)*.4,.5+r*.72,zf,'z');
 vB('vStone',0,2.5,zf-.7,14.3,.14,1.6,0,stone);kput('vThatchB',[0,2.85,zf-.5],qEuler(.2,0,0),[14.6,.3,2.4],thatch);
 if(V===0){const xf=-6.6;vB('xRubB',xf-.6,0,-.6,1.2,2.2,7,0,rub);for(let r=0;r<2;r++)for(let i=0;i<4;i++)hive(xf,.5+r*.72,-3.2+i*1.5+(r%2)*.4,'x');
  vB('vStone',xf-.6,2.2,-.6,1.4,.14,7.2,0,stone);}
 /* the honey house: an earth room, a flat roof; the jars, the press and the wax cakes before it */
 const hk=xnWall(5,0,2.4,5,2.8,4,0,earth,'earth');xnFlatRoof(5,2.8,2.4,5*hk,4*hk,0,earth,{parapet:.4});
 vnDoor(5,0,4.4,0,1.0,2.0,'vWood',aged,timD,false);xnTibWin(3.4,1.0,4.38,0,.6,.7,'shut',xC(xPick(XPAL.trim)),{noVal:true});
 for(let k=0;k<6;k++)vPst('vClayPot',2.4+k*.55,0,5.2,.2,rr(.45,.6),amber.clone().multiplyScalar(rr(.85,1.05)));
 vB('vWood',7.2,0,5.4,1.0,.9,.8,0,timD);vPst('vPost',7.2,.9,5.4,.07,.8,aged);vB('vWood',7.2,1.6,5.4,.9,.12,.12,0,aged);
 xwTable(-1.5,5.4,1.8,.8,.8,0,aged);for(let k=0;k<6;k++)vB('xPaint',-2.2+(k%3)*.5,.8,5.2+Math.floor(k/3)*.35,.36,.14,.26,0,xC(0xe8d070));
 /* the bee pasture: thyme and lavender in low beds; the smoker */
 for(let k=0;k<14;k++)kput('xLeaf',[-5+(k%7)*1.0+rr(-.2,.2),.22,.8+Math.floor(k/7)*1.6+rr(-.2,.2)],null,[.38,.3,.38],xC(xPick([0x8a6aa8,0x7a8a4a,0xe8e0f0,0x9a7ab8])));
 vPst('vClayPot',-3,0,-3.4,.16,.3,xC(0x6a5a48));
 xnFolk(0,0,1.5,2,3);}
XA.def({key:'xa_apiary',name:'Apiary',family:'Works',tags:{type:['farm','industry'],wealth:'poor',lit:false},w:18,d:14,h:4,fw:16,fd:12,nv:2,build:buildXaApiary});

/* ---------------------------------------------------------------- the reeling house (silk): 22 x 16, the shed open to +z */
function buildXaReelingHouse(G,o){reseed(34651+(o.v|0));const V=xV(o),earth=xC(xPick(XPAL.earth)),brick=xC(0x9a5a3a),stone=xC(xPick(XPAL.stone)),
 tim=xC(xPick(XPAL.timber)),timD=xC(0x4a3a2a),tile=xC(xPick(XPAL.tile)),copper=xC(0xb06a3a),silk=xC(0xf0e6c8),water=xC(XPAL.water);
 vnReg('Reeling house (silk)',0,-1.5,9,5);
 vB('vStone',0,0,-1.6,16.4,.12,7.4,0,stone);
 /* the shed: an earth back wall and its ends, posts along the open front, a tiled gable */
 vB('xEarthB',0,0,-5,16,3.2,.6,0,earth);for(const s of[-1,1])vB('xEarthB',s*7.7,0,-1.9,.6,3.2,5.6,0,earth);
 for(const x of[-7.7,-3.85,0,3.85,7.7])vPst('vPost',x,0,1.6,.13,3.2,timD);vB('vWood',0,3.0,1.6,16,.2,.26,0,timD);
 vnGableRoof(0,3.2,-1.7,16.6,7.2,1.6,0,'xGableT',tile,.4,'vGablePl',earth);
 /* the hearth range: a fire mouth behind each basin; the basins of hot water, the cocoons in them; a reel before each */
 vB('xRubB',0,0,-3,13,.85,1.3,0,brick);
 for(let i=0;i<5;i++){const x=-5.2+i*2.6;vPst('vClayPot',x,.85,-3,.42,.32,copper);kput('xDiscWater',[x,1.15,-3],null,[.34,.04,.34],xC(0xd8d8c8));
  for(let c=0;c<5;c++)vBall('xPaintBall',x+rr(-.2,.2),1.18,-3+rr(-.2,.2),.06,silk,.05);
  vB('vDarkB',x,.12,-3.66,.5,.42,.04,0);vBall('vEmber',x,.3,-3.62,.16,null,.1);
  xwReel(x,-1.3,1.25,timD,silk);}
 if(V===0){/* the race and its undershot wheel, the axle through the end wall to the line shaft over the reels, a belt to each */
  vB('xWaterB',9.7,0,-1,1.4,.2,14,0,water);for(const s of[-1,1])vB('vStone',9.7+s*.85,0,-1,.3,.5,14,0,stone);
  const wx=9.7,wy=1.5,wz=-1.5,R=1.4;for(const u of[-.3,.3])kput('vHoop',[wx+u,wy,wz],qEuler(0,Math.PI/2,0),[R,R,1.2],timD);
  for(let k=0;k<4;k++)kput('vWood',[wx,wy,wz],qEuler(k*Math.PI/4,0,0),[.1,2*R,.1],timD);
  for(let k=0;k<12;k++){const a=k/12*TAU;kput('vWood',[wx,wy+Math.cos(a)*R,wz+Math.sin(a)*R],qEuler(a,0,0),[.66,.36,.06],tim);}
  kput('vWood',[8.7,wy,wz],null,[2.2,.18,.18],timD);kput('vWood',[.5,2.1,-1.5],null,[15,.12,.12],timD);vB('vWood',7.2,1.5,-1.5,.2,.7,.2,0,timD);
  for(let i=0;i<5;i++)xwLine([-5.2+i*2.6,2.05,-1.5],[-5.2+i*2.6,1.3,-1.3],.02,xC(0x8a7a58));}
 else{/* the treadles, a crank to each reel; the cocoon baskets outside the end wall */
  for(let i=0;i<5;i++){const x=-5.2+i*2.6;kput('vWood',[x,.12,-.3],qEuler(-.2,0,0),[.45,.05,.9],timD);vBeam([x+.42,.16,-.7],[x+.42,1.25,-1.3],.03,timD);}
  for(let k=0;k<4;k++){vPst('vBarrel',9.4,0,-4+k*1.1,.34,.55,xC(0xa08050));kput('xPaintBall',[9.4,.56,-4+k*1.1],null,[.3,.14,.3],silk);}}
 /* the skeins drying before the shed; the flue at the back */
 for(const x of[-6,6])vPst('vPost',x,0,5.2,.06,2.3,timD);xwLine([-6,2.25,5.2],[6,2.25,5.2],.02,xC(0xb8a888));
 for(let k=0;k<16;k++)kput('vCloth',[-5.6+k*.75,1.85,5.2],null,[.2,.75,1],silk.clone().multiplyScalar(rr(.92,1.05)));
 vB('xRubB',6.9,0,-4.3,1.0,5.6,.9,0,brick);
 xnFolk(0,0,0,4,5);}
XA.def({key:'xa_reeling_house',name:'Reeling house (silk)',family:'Works',tags:{type:['industry'],wealth:'poor',lit:false},w:22,d:16,h:6,fw:17,fd:8,nv:2,build:buildXaReelingHouse});

/* ---------------------------------------------------------------- the mat shed and reed racks: 18 x 14, the shed at the back */
function buildXaMatShed(G,o){reseed(34661+(o.v|0));const V=xV(o),reed=xC(0xb8a868),reedD=xC(0x9a8a50),earth=xC(xPick(XPAL.earth)),timD=xC(0x5a4632),water=xC(XPAL.water);
 vnReg('Mat shed and reed racks',0,0,8,3.5);
 /* the weaving shed: posts under a reed-thatch gable, a reed screen (v 1 an earth wall) behind; mats on the floor, rolls stacked */
 for(const x of[-5,-1.7,1.7,5])for(const z of[-5.4,-.6])vPst('vPost',x,0,z,.11,2.6,timD);
 for(const z of[-5.4,-.6])vB('vWood',0,2.45,z,10.2,.16,.2,0,timD);
 vnGableRoof(0,2.6,-3,11,5.6,1.6,0,'vThatchB',reed,.45);
 if(V===1)vB('xEarthB',0,0,-5.75,10.4,2.5,.5,0,earth);else vB('vThatchB',0,0,-5.6,10,2.3,.14,0,reedD);
 for(let k=0;k<3;k++){const x=-3.4+k*3.4;vB('vThatchB',x,0,-2.8,2.0,.04,2.4,0,reed.clone().multiplyScalar(rr(.95,1.12)));vB('vWood',x,0,-1.5,2.2,.12,.12,0,timD);}
 for(let j=0;j<3;j++)for(let i=0;i<3-j;i++)kput('vPost',[3.0,.17+j*.31,-5.1+i*.36+j*.18],qEuler(0,0,-Math.PI/2),[.17,1.9,.17],reedD.clone().multiplyScalar(rr(.9,1.1)));
 /* the reed racks: A-frames, the cut reed leaned up both sides to dry */
 for(const z of[2,4.8]){for(let k=0;k<4;k++){const x=-6+k*4;xwLine([x,0,z-.8],[x,2.1,z],.05,timD,'vPost');xwLine([x,0,z+.8],[x,2.1,z],.05,timD,'vPost');}
  xwLine([-6,2.1,z],[6,2.1,z],.05,timD,'vPost');
  for(const s of[-1,1])for(let i=0;i<16;i++)kput('vThatchB',[-5.8+i*.77,1.0,z+s*.42],qEuler(-s*.4,0,0),[.42,2.0,.22],reed.clone().multiplyScalar(rr(.86,1.12)));}
 /* the stooks along the front, the soaking trough */
 const ns=V===1?6:4;for(let k=0;k<ns;k++)kput('vConeT',[-6+k*12/(ns-1),0,6.3],null,[.5,2.0,.5],reed.clone().multiplyScalar(rr(.9,1.1)));
 vB('vWood',7.6,0,-2.4,1.0,.6,4.2,0,timD);vB('xWaterB',7.6,.45,-2.4,.8,.12,4.0,0,water);kput('vThatchB',[7.6,.55,-2.4],null,[.5,.2,3.6],reedD);
 xnFolk(0,0,-1,3,4);}
XA.def({key:'xa_mat_shed',name:'Mat shed and reed racks',family:'Works',tags:{type:['industry'],wealth:'poor',lit:false},w:18,d:14,h:4.5,fw:16,fd:12,nv:2,build:buildXaMatShed});

/* ---------------------------------------------------------------- the quarry and the masons' yard: 28 x 26, the face at the back (-z) */
function buildXaQuarryYard(G,o){reseed(34671+(o.v|0));const V=xV(o),rock=xC(xPick(XPAL.stone)).multiplyScalar(.96),cut=rock.clone().multiplyScalar(1.12),stone=xC(xPick(XPAL.stone)),
 rub=xC(xPick(XPAL.rubble)),tim=xC(xPick(XPAL.aged)),timD=xC(0x4a3a28),rope=xC(0x8a7a58),iron=xC(0x2a2826);
 vnReg('Quarry and masons\' yard',0,0,13,8.4);
 /* the face: three benches cut back into the hill, the channels the blocks came out along, boulders on its brow */
 const B=[[-6,2.8],[-8.5,5.6],[-11,8.4]];let y0=0;
 for(const [zf,h] of B){vB('xRockB',0,0,(zf-13)/2,26,h,zf+13,0,rock);for(let x=-12;x<=12;x+=1.6)vB('vDarkB',x+rr(-.2,.2),y0,zf+.01,.05,h-y0,.03,0);y0=h;}
 for(let k=0;k<6;k++)kput('xBoulder',[-11+k*4.4,8.4,-12],qEuler(rng()*3,rng()*3,0),[rr(.6,.9),rr(.5,.8),rr(.6,.85)],rock.clone().multiplyScalar(.9));
 /* a block half split on the first bench, its wedges; the ladders up the benches */
 vB('xRockB',4,2.8,-7.0,2.4,1.1,1.6,0,cut);vB('vDarkB',4.4,2.8,-6.19,.04,1.1,.02,0);for(let k=0;k<4;k++)vB('vIron',3.1+k*.5,3.88,-6.6,.08,.12,.06,0,iron);
 vnLadder(-8,0,-5.55,0,3.0,timD);vnLadder(7,2.8,-8.05,0,3.0,timD);
 /* the masons' yard: dressed blocks stacked, rough ones waiting, two bankers with a block on each, the chips heap */
 for(let j=0;j<3;j++)for(let i=0;i<4-j;i++)for(let r=0;r<2;r++)vB('vStone',-10.4+i*1.3+j*.65,j*.62,3+r*.7,1.2,.6,.62,0,cut.clone().multiplyScalar(rr(.94,1.05)));
 for(const [x,z] of[[-3,-3],[-.5,-4],[2.6,-3.4],[-6,8],[6,6.4]])vB('xRockB',x,0,z,rr(1.2,1.6),rr(.8,1.1),rr(.9,1.2),rr(0,.5),rock.clone().multiplyScalar(rr(.9,1.05)));
 for(const x of[3,6.5]){vB('vStone',x,0,3.2,1.4,.65,.9,0,stone.clone().multiplyScalar(.9));vB('vStone',x,.65,3.2,1.0,.45,.7,0,cut);
  for(let k=0;k<5;k++)kput('xPaint',[x+rr(-1.2,1.2),.02,3.2+rr(-1,1)],qEuler(0,rng()*3,0),[rr(.08,.18),.04,rr(.06,.14)],cut);}
 xwHeap(9.5,8.5,2.4,2.0,.8,cut.clone().multiplyScalar(.95),10);
 /* the sheerlegs: two raking legs, the back guy to its stake, the tackle and the block slung in it (v 1 up on the first bench) */
 const sx=V===1?-4:0,sz=V===1?-7.6:-2.2,sy=V===1?2.8:0;
 vBeam([sx-1.8,sy,sz+.9],[sx,sy+6.2,sz],.2,timD);vBeam([sx+1.8,sy,sz+.9],[sx,sy+6.2,sz],.2,timD);xwLine([sx,sy+6.2,sz],[sx,0,sz+8],.03,rope);
 vB('vWood',sx,0,sz+8,.14,.6,.14,0,timD);xwLine([sx,sy+6.1,sz],[sx,sy+1.5,sz],.03,rope);vB('vStone',sx,sy+.6,sz,1.4,.9,.9,0,cut);
 if(V===0){vB('vWood',sx,0,sz,1.8,.2,1.2,0,timD);for(let k=0;k<3;k++)kput('vPost',[sx-1,.1,sz+1.6+k*.8],qEuler(0,0,-Math.PI/2),[.1,2,.1],timD);}
 /* the tool hut and its water butt */
 const hk=xnWall(11.2,0,1.5,3.6,2.4,3.2,0,rub,'stone');xnFlatRoof(11.2,2.4,1.5,3.6*hk,3.2*hk,0,rub,{parapet:.35});vnDoor(9.4,0,1.5,-Math.PI/2,.9,1.9,'vWood',tim,timD,false);
 vnBarrel(12.4,0,4,.35,.8,tim);
 xnFolk(0,0,3,4,6);}
XA.def({key:'xa_quarry_yard',name:'Quarry and masons\' yard',family:'Works',tags:{type:['industry'],wealth:'poor',lit:false},w:28,d:26,h:9,fw:26,fd:24,nv:2,build:buildXaQuarryYard});

/* ---------------------------------------------------------------- the sulfur works: 28 x 22, the hot spring at the back west */
function buildXaSulfurWorks(G,o){reseed(34681+(o.v|0));const V=xV(o),sinter=xC(0xe0d6bc),ochre=xC(0xc87a30),spring=xC(0x6ab8b0),yel=xC(0xd8c838),rub=xC(xPick(XPAL.rubble)),
 earth=xC(xPick(XPAL.earth)),timD=xC(0x4a3a28),iron=xC(0x3a3430);
 vnReg('Sulfur works (the spring\'s crust)',0,0,13,6);vnReg('Sulfur works — the hot spring',-8,-4,4,1);
 /* the hot spring: a sinter apron round its blue pool and the orange mat on its lip, terraces stepping down to the front */
 kput('xOctS',[-8,0,-4],null,[4.4,.3,3.8],sinter);kput('xDiscS',[-8,.3,-4],null,[2.9,.04,2.4],ochre);kput('xDiscWater',[-8,.32,-4],null,[2.6,.05,2.1],spring);
 for(let k=0;k<3;k++){const z=.9+k*1.4,r=2.2-k*.4,x=-8+k*.5,y=.22-k*.08;kput('xDiscS',[x,y,z],null,[r,.06,r*.7],sinter.clone().multiplyScalar(k%2?1:.95));
  kput('xDiscWater',[x,y+.035,z],null,[r*.8,.02,r*.56],spring);kput('xDiscS',[x,y+.01,z+r*.6],null,[r*.8,.05,.16],ochre);}
 /* the crust beds: shallow earth pans the spring's water is let into, the yellow crust raked off them, its channel */
 const nb=V===1?4:3,bw=V===1?2.5:3.2,bd=2.6;for(let i=0;i<nb;i++)for(let j=0;j<2;j++){const x=1.8+i*(V===1?2.9:3.7),z=-7.4+j*3.2;
  for(const s of[-1,1]){vB('xEarthB',x+s*bw/2,0,z,.24,.22,bd+.24,0,earth);vB('xEarthB',x,0,z+s*bd/2,bw,.22,.24,0,earth);}
  vB('xPaint',x,0,z,bw-.2,.08,bd-.2,0,yel.clone().multiplyScalar(rr(.85,1.08)));}
 xnChannel([-4.2,-5.8],[.2,-5.8],.5);xwHeap(5.5,-1.0,1.1,.8,.5,yel,4);
 /* the melting shed: rubble walls, an open front, the furnace bench with its iron pots of molten sulfur, the flue */
 const MX=5.6,MZ=5.4;vB('xRubB',MX,0,MZ-2.3,9,2.8,.6,0,rub);for(const s of[-1,1])vB('xRubB',MX+s*4.2,0,MZ,.6,2.8,5.2,0,rub);
 vnGableRoof(MX,2.8,MZ,9.8,5.6,1.4,0,'xGableE',earth,.35,'vGableSt',rub);
 vB('xRubB',MX,0,MZ-1.2,7,.9,1.4,0,rub);
 for(let k=0;k<3;k++){const x=MX-2.4+k*2.4;vPst('vClayPot',x,.9,MZ-1.2,.5,.45,iron);kput('xDiscWater',[x,1.33,MZ-1.2],null,[.4,.03,.4],xC(0x8a2a10));vB('vDarkB',x,.12,MZ-.49,.6,.45,.04,0);vBall('vEmber',x,.32,MZ-.52,.18,null,.1);}
 vB('xRubB',MX+3.2,0,MZ-2.0,1.0,5.0,1.0,0,rub);
 /* the cakes cooling on their boards, the stacks of them, the sacks, the charcoal */
 for(const x of[3.2,7.8]){xwTable(x,9.3,3.2,1.0,.8,0,timD);for(let k=0;k<12;k++)vB('xPaint',x-1.3+(k%6)*.52,.8,9.1+Math.floor(k/6)*.42,.36,.12,.26,0,yel.clone().multiplyScalar(rr(.9,1.06)));}
 for(let j=0;j<3;j++)for(let i=0;i<4;i++)for(let r=0;r<3;r++)vB('xPaint',-3.2+i*.4,j*.13,7.6+r*.3,.36,.12,.26,0,yel.clone().multiplyScalar(rr(.88,1.05)));
 vnSacks(-1.2,0,8.6,5);xwHeap(-11,7,1.5,1.2,.7,xC(0x2a2624),5);
 xnFolk(2,0,1.5,3,5);}
XA.def({key:'xa_sulfur_works',name:'Sulfur works',family:'Works',tags:{type:['industry'],wealth:'poor',lit:false},w:28,d:22,h:6,fw:26,fd:20,nv:2,build:buildXaSulfurWorks});

/* ---------------------------------------------------------------- the customs house: 22 x 18, the house on z = -3; v 0 its quay at +z */
function buildXaCustomsHouse(G,o){reseed(34691+(o.v|0));const V=xV(o),stone=xC(xPick(XPAL.stone)),cope=stone.clone().multiplyScalar(1.14),wash=xC(xPick(XPAL.wash)),
 tim=xC(xPick(XPAL.timber)),timD=xC(0x4a3a2a),trim=xC(xPick(XPAL.trim)),iron=xC(0x2a2826),lit=xLit();
 vnReg('Customs house',0,-3,7,9);vnReg('Customs house — the weighing beam',6.5,4.2,2.4,4);
 if(V===0){/* the quay: its face at z = +9 over the water (the town sets the deck 2.4 m over the lake, as the harbour quay's): the
   courses, the weed line, the coping, the paved deck, bollards and rings */
  vB('vStone',0,-3.6,6.5,22,3.6,5,0,stone.clone().multiplyScalar(.8));vB('vStone',0,-.3,8.55,22,.3,.9,0,cope);
  for(const y of[-.9,-1.5,-2.1,-2.7,-3.3])vB('vDarkB',0,y,9.005,22,.03,.02,0);vB('vStone',0,-2.65,9.01,22,.5,.04,0,xC(0x4a5a3c));
  xnPave(0,6,22,4.2,0,stone.clone().multiplyScalar(.95),1.6);
  for(const x of[-8,-2.6,2.6,8]){vPst('vPostS',x,0,8.3,.2,.55,stone);vBall('vBall',x,.6,8.3,.24,stone,.14);kput('vHoop',[x,-1.0,9.07],null,[.2,.2,.4],iron);}}
 else{/* the road's toll house: the paved road, the toll bar across it on its posts, the counterweight */
  xnPave(0,6.2,22,5.2,0,stone.clone().multiplyScalar(.9),2.2);
  for(const s of[-1,1])vB('vStone',s*6.5,0,7.8,.7,1.2,.7,0,stone);vB('vWood',.3,1.2,7.8,12.6,.14,.14,0,xC(XPAL.white));
  for(let k=0;k<6;k++)vB('xPaint',-5.2+k*2.1,1.19,7.8,1.0,.16,.16,0,xC(XPAL.red));vB('vIron',-6.5,1.2,7.8,.6,.5,.5,0,iron);}
 /* the house: two whitewashed storeys on a plinth, the twig band and gilt corners (the Sultan's), the sun-and-moon over the portico */
 vB('vStone',0,0,-3,12.6,.4,8.6,0,stone);const S=xnStack(0,.4,-3,12,8,0,[3.4,3.0],wash,'wash');
 xnFlatRoof(0,S.y,-3,S.w,S.d,0,wash,{band:true,gold:true,parapet:.6,corner:'gold'});
 xnPortico(0,.4,1,0,6,2.2,3.2,wash,{band:true});vnDoor(0,.4,1,0,1.6,2.6,'vWood',tim,timD,false);xnRoundel(0,5.0,.53,0,1.1);
 for(const s of[-1,1]){xnTibWin(s*4.4,1.4,.9,0,.8,1.0,lit?'lit':'glass',trim);for(const u of[2.2,3.9])xnTibWin(s*u,4.4,.5,0,.8,1.0,lit?'lit':'glass',trim,{noVal:true});
  xnTibWin(s*5.95,1.4,-3,s*Math.PI/2,.8,1.0,'glass',trim,{noVal:true});xnTibWin(s*5.45,4.4,-3,s*Math.PI/2,.8,1.0,'glass',trim,{noVal:true});
  if(lit)vBall('vBulb',s*2.2,2.8,2.4,.12);}
 /* the tally office: a low whitewashed block on the west, its counter window under an awning, the ledger and the tally sticks */
 const tk=xnWall(-8.4,0,-2,4.4,3,5,0,wash,'wash');xnFlatRoof(-8.4,3,-2,4.4*tk,5*tk,0,wash,{parapet:.4});
 vB('vDarkB',-8.4,.95,.52,1.8,1.0,.06,0);vnAwning(-8.4,2.7,.5,0,3.6,1.5,xC(xPick(XPAL.cloth)));vB('vWood',-8.4,.9,.95,2.4,.08,.7,0,tim);
 for(let k=0;k<5;k++)vB('vWood',-9.2+k*.3,.98,.9,.05,.04,.5,0,xC(0xd8c8a0));vB('xPaint',-7.6,.98,.95,.5,.08,.36,0,xC(0x6e2a2a));
 /* the weighing beam: a timber frame, the beam hung from its middle, a pan at each end: a bale on one (down), the weights on the other */
 {const x=6.5,z=4.2;for(const s of[-1,1])vB('vWood',x+s*2.1,0,z,.24,4.0,.24,0,timD);vB('vWood',x,3.85,z,4.6,.24,.3,0,timD);
  xwLine([x,3.85,z],[x,3.2,z],.03,iron);kput('vWood',[x,3.15,z],qEuler(0,0,.06),[3.2,.16,.16],tim);
  for(const s of[-1,1]){const ex=x+s*1.5,ey=3.15+s*.09;xwLine([ex,ey,z],[ex,1.25,z],.02,iron);kput('xDisc',[ex,1.2,z],null,[.5,.05,.5],iron);}
  vB('vClothB',x-1.5,1.22,z,.8,.6,.7,0,xC(0xc8b898));for(let k=0;k<3;k++)vB('vIron',x+1.5,1.22+k*.14,z,.34-k*.06,.14,.3-k*.05,0,iron);}
 /* the Sultan's flag; the goods waiting to be cleared */
 xnFlagpole(-4,0,4.6,9,xC(XPAL.saffron));
 for(let k=0;k<4;k++)vB('vClothB',-9.4+k*1.15,0,6.4,1.0,.8,1.0,0,xC(xPick([0xc8b898,0xb8a080,0xa89070])));
 vnCrate(-1.5,0,6.6,1.0,.2);vnBarrel(1,0,6.8,.36,.9,xC(0x8a6a48));vnBarrel(1.9,0,6.6,.36,.9,xC(0x8a6a48));
 xnFolk(0,0,5.5,4,6);}
XA.def({key:'xa_customs_house',name:'Customs house',family:'Dockyard',tags:{type:['civic','infrastructure'],wealth:'civic',lit:true},w:22,d:18,h:10,fw:21,fd:12,nv:2,build:buildXaCustomsHouse});

/* ---------------------------------------------------------------- the fishponds: 30 x 26, the bank at the back, the pens out to z = +12.
   The lake's surface is at local y 0 (the town sets o.y to the water): the walls stand from the bed at -1.8 to 0.57, the bank 0.6 */
function buildXaFishponds(G,o){reseed(34701+(o.v|0));const V=xV(o),rub=xC(xPick(XPAL.rubble)),stone=xC(xPick(XPAL.stone)),cope=stone.clone().multiplyScalar(1.1),
 earth=xC(xPick(XPAL.earth)),tim=xC(xPick(XPAL.aged)),timD=xC(0x4a3a28),weed=xC(0x4a5a3c),net=xC(0x5a5040),wicker=xC(0xa08050);
 vnReg('Fishponds',0,2,14,1.5);vnReg('Fishponds — the keeper\'s hut',-9,-10.7,2.5,3.4);
 /* the bank: a stone-faced strip of shore, its weed line */
 vB('vStone',0,-2,-10.5,29.6,2.6,4.8,0,rub);vB('vStone',0,-.25,-8.08,29.6,.5,.04,0,weed);
 /* the pen walls: drystone from the bed, a coping (the keeper's path), the weed band at the water */
 const T=.7,Y0=-1.8,H=2.25,F=12,B=-8.1,X=14.2;
 const wallX=(x,z0,z1)=>{if(z1-z0<.05)return;const m=(z0+z1)/2,L=z1-z0;vB('xRubB',x,Y0,m,T,H,L,0,rub.clone().multiplyScalar(rr(.92,1.05)));vB('vStone',x,Y0+H,m,T+.1,.12,L,0,cope);vB('vStone',x,-.2,m,T+.02,.4,L,0,weed);};
 const wallZ=(z,x0,x1)=>{if(x1-x0<.05)return;const m=(x0+x1)/2,L=x1-x0;vB('xRubB',m,Y0,z,L,H,T,0,rub.clone().multiplyScalar(rr(.92,1.05)));vB('vStone',m,Y0+H,z,L,.12,T+.1,0,cope);vB('vStone',m,-.2,z,L,.4,T+.02,0,weed);};
 const nc=V===1?2:3,zm=V===1?3:2,xs=[];for(let i=0;i<=nc;i++)xs.push(-X+2*X*i/nc);
 /* the side walls and the dividers (a grille of slats in each divider of the back row, for the water to pass) */
 for(let i=0;i<=nc;i++){const x=xs[i];if(i===0||i===nc){wallX(x,B,F+T/2);continue;}
  const g=(B+zm)/2;wallX(x,B,g-.5);wallX(x,g+.5,F+T/2);for(let k=0;k<5;k++)vB('vWood',x,Y0+.4,g-.4+k*.2,.08,H-.2,.06,0,timD);}
 wallZ(zm,-X+T/2,X-T/2);
 /* the front wall, a sluice to each pen: two piers, the gate board in its slots, the windlass over it, a plank across */
 const sx=[];for(let i=0;i<nc;i++)sx.push((xs[i]+xs[i+1])/2);
 let x0=-X-T/2;for(const s of sx){wallZ(F,x0,s-.75);x0=s+.75;}wallZ(F,x0,X+T/2);
 for(const s of sx){for(const d of[-1,1]){vB('vStone',s+d*.95,Y0,F,.5,H+.5,T+.3,0,stone);vB('vWood',s+d*.95,Y0+H+.5,F,.12,.5,.12,0,timD);}
  vB('vWood',s,Y0+.2,F,1.5,1.9,.12,0,timD);kput('vPost',[s-.9,Y0+H+.9,F],qEuler(0,0,-Math.PI/2),[.12,1.8,.12],tim);xwLine([s,Y0+H+.85,F],[s,Y0+2.1,F],.02,xC(0x8a7a58));
  vB('vWood',s,Y0+H+.12,F+.45,1.6,.07,.5,0,tim);}
 if(V===1)vB('vWood',0,Y0+H+.12,zm,2.6,.1,2.6,0,tim);   /* the feeding deck where the walls cross */
 /* the punt, its pole; the traps on the cross wall */
 vB('vWood',sx[0]+1.5,-.25,-2,1.3,.45,4.2,0,timD);kput('vWood',[sx[0]+1.9,.9,-1.2],qEuler(.3,0,.1),[.06,4.2,.06],tim);
 for(let k=0;k<4;k++)kput('vConeT',[-10+k*6.5,Y0+H+.12+.3,zm],qEuler(0,0,Math.PI/2),[.3,1.0,.3],wicker);
 /* the keeper's hut on the bank, the nets drying, the feed */
 const hk=xnWall(-9,.6,-10.7,4.4,2.6,3.6,0,earth,'earth');xnFlatRoof(-9,3.2,-10.7,4.4*hk,3.6*hk,0,earth,{parapet:.4,corner:'flag'});
 vnDoor(-9,.6,-8.9,0,1.0,2.0,'vWood',tim,timD,false);xnTibWin(-10.5,1.6,-8.92,0,.6,.7,'shut',xC(xPick(XPAL.trim)),{noVal:true});
 for(const x of[1,7])vPst('vPost',x,.6,-10.6,.06,2.2,timD);xwLine([1,2.75,-10.6],[7,2.75,-10.6],.02,xC(0xb8a888));
 for(let k=0;k<6;k++)kput('vCloth',[1.5+k*.95,1.95,-10.6],null,[.9,1.4,1],net);
 vnSacks(-3,.6,-11.2,4);for(let k=0;k<3;k++)vPst('vBarrel',11,.6,-11.6+k*.8,.3,.45,wicker);
 xnFolk(0,.6,-10.5,3,6);}
XA.def({key:'xa_fishponds',name:'Fishponds',family:'Works',tags:{type:['farm','fishing'],wealth:'poor',lit:false},w:30,d:26,h:4,fw:28,fd:24,nv:2,build:buildXaFishponds});

/* ---------------------------------------------------------------- the slipway: xa_slip's shipyard (88f), on a 24 m lot
   xa_slip already is the slipway (the ramp into the lake, the ways, the capstan, a barge's hull in frame on its cradle), so this is
   its twin, as the wind-catcher twins are (88f): xa_slip's builder and seed, then the timber yard on its banks (y 0, z < 2): the
   squared logs stacked on the east, a plank stack (v 1 a rack of curved frames); the steam box on its trestles with its copper and
   the saw pit on the west. A page that takes 88g without 88f has no xa_slipway */
{const D=VERN.defs.xa_slip;if(D){
 const buildXaSlipway=function(G,o){D.build(G,Object.assign({},o,{drop:0}));reseed(34711+(o.v|0));const V=xV(o),tim=xC(0x6a5236),timD=xC(0x4a3a28),
  rub=xC(xPick(XPAL.rubble)),copper=xC(0xb06a3a),iron=xC(0x2a2826),dust=xC(0xc8a878);
  vnReg('Slipway — the timber yard',0,-6,11,3);
  for(let j=0;j<4;j++){for(let i=0;i<5;i++)vB('vWood',7.2+i*.55,j*.46,-8,.42,.4,8,0,tim.clone().multiplyScalar(rr(.85,1.12)));for(const z of[-11,-8,-5])vB('vWood',8.3,j*.46+.4,z,2.7,.06,.1,0,timD);}
  if(V===0){for(let j=0;j<10;j++)vB('vWood',10.9,j*.09,-6,1.1,.08,6.4,0,tim.clone().multiplyScalar(rr(.95,1.15)));}
  else{vB('vWood',10.9,1.6,-6,.16,.16,7,0,timD);for(const z of[-9,-3])vB('vWood',10.9,0,z,.16,1.6,.16,0,timD);
   for(let k=0;k<7;k++){const z=-8.8+k*.95;xnMember('vWood',[10.4,0,z],[11.0,1.75,z+.3],.18,.14,[1,0,0],tim);}}
  /* the steam box: a long plank box on trestles, the copper on its hearth at the end, the pipe into it */
  for(const z of[-9.6,-7,-4.4])for(const s of[-1,1])vB('vWood',-9+s*.4,0,z,.12,1.0,.12,0,timD);
  vB('vWood',-9,1.0,-7,1.0,.9,7,0,timD.clone().multiplyScalar(1.15));vB('vWood',-9,1.9,-7,1.1,.06,7.1,0,timD);
  vB('xRubB',-9,0,-11.6,1.8,.9,1.8,0,rub);vPst('vClayPot',-9,.9,-11.6,.6,.75,copper);vB('vDarkB',-9,.12,-10.69,.6,.45,.04,0);vBall('vEmber',-9,.32,-10.72,.18,null,.1);
  kput('vPipe',[-9,1.5,-11.3],qEuler(Math.PI/2,0,0),[.07,.9,.07],iron);
  /* the saw pit: a timber-lined pit, a log on its trestles over it, the pit saw through it, the sawdust */
  vB('vDarkB',-9,-.01,1,1.2,.03,5,0);for(const s of[-1,1]){vB('vWood',-9+s*.75,0,1,.3,.2,5.4,0,timD);vB('vWood',-9,0,1+s*2.65,1.8,.2,.3,0,timD);}
  for(const z of[-.8,2.8])vB('vWood',-9,.2,z,1.6,.5,.25,0,timD);vB('vWood',-9,.7,1,.55,.55,6,0,tim);vB('vIron',-9,-.9,1.6,.04,2.6,.22,0,iron);
  xwHeap(-10.8,3,.8,.7,.25,dust,3);
  xnFolk(-9,0,-2,2,2);};
 XA.def({key:'xa_slipway',baseKey:'xa_slip',name:'Slipway (the shipyard)',family:'Dockyard',tags:{type:['industry'],wealth:'poor',job:'shipwrighting',lit:false},w:24,d:32,h:6,fw:D.fw,fd:D.fd,nv:2,build:buildXaSlipway});}}

/* ---------------------------------------------------------------- the mine head: 22 x 20, the hill at the back, the adit into it */
function buildXaMineHead(G,o){reseed(34721+(o.v|0));const V=xV(o),rock=xC(xPick(XPAL.rubble)).multiplyScalar(.9),tim=xC(xPick(XPAL.aged)),timD=xC(0x4a3a28),rub=xC(xPick(XPAL.rubble)),
 stone=xC(xPick(XPAL.stone)),iron=xC(0x2a2826),rope=xC(0x8a7a58),ore=xC(V===1?0xc8c2b4:0x9a8a6a),spoil=xC(V===1?0xd8d0c0:0x8a8478);
 vnReg(V===1?'Mine head (the opal diggings)':'Mine head (the gold adit)',0,-2,10,7);
 /* the hill: a rock mass at the back, a second step on it, boulders on its shoulders */
 vB('xRockB',0,0,-7,21,7,6,0,rock);vB('xRockB',1,7,-8.4,14,2.4,3,0,rock.clone().multiplyScalar(.95));
 for(const s of[-1,1])kput('xBoulder',[s*9.4,7,-6.4],qEuler(rng()*3,rng()*3,0),[1.1,.9,1.0],rock.clone().multiplyScalar(.9));
 /* the adit: its mouth in the face, three timber sets out from it, the lagging over their caps and earth on it; the prayer flags */
 const ax=-2;vB('vDarkB',ax,0,-3.98,2.0,2.3,.06,0);
 for(const z of[-3.6,-2.4,-1.2]){for(const s of[-1,1])vB('vWood',ax+s*1.15,0,z,.26,2.4,.26,0,timD);vB('vWood',ax,2.4,z,2.7,.3,.3,0,timD);}
 vB('vWood',ax,2.7,-2.4,2.9,.08,3.0,0,tim);vB('xEarthB',ax,2.78,-2.6,2.7,.45,2.6,0,xC(xPick(XPAL.earth)));
 vPst('vPost',ax-2.6,0,-.6,.06,4.3,timD);xwFlags([ax-2.6,4.2,-.6],[ax+3.6,7.0,-4.1],9);
 /* the rails out of the adit, the sleepers, the cart with its load */
 for(const s of[-1,1])vB('vIron',ax+s*.35,0,1.5,.06,.07,10.4,0,iron);for(let k=0;k<13;k++)vB('vWood',ax,0,-3.4+k*.8,1.1,.05,.18,0,timD);
 vB('vWood',ax,.3,3.2,.9,.6,1.2,0,timD);for(const s of[-1,1])for(const t of[-1,1])kput('vHoop',[ax+s*.47,.17,3.2+t*.4],qEuler(0,Math.PI/2,0),[.15,.15,1],iron);
 for(let k=0;k<5;k++)kput('xBoulder',[ax+rr(-.3,.3),.95,3.2+rr(-.4,.4)],qEuler(rng()*3,rng()*3,0),[.18,.14,.18],ore);
 /* the ore heap at the rails' end, the spoil tipped west */
 xwHeap(2.4,5.6,2.0,1.7,1.0,ore,8);xwHeap(-7.4,4.2,3.0,3.2,1.6,spoil,10);
 /* the winze beside the adit: a stone collar, the windlass over it, its rope down, a bucket on the lip */
 {const wx=4.6,wz=-1.8;kput('xOctS',[wx,0,wz],null,[1.1,.4,1.1],stone);vB('vDarkB',wx,.4,wz,1.2,.02,1.2,0);
  for(const s of[-1,1])vB('vWood',wx+s*1.15,0,wz,.18,1.5,.18,0,timD);kput('vPost',[wx-1.05,1.3,wz],qEuler(0,0,-Math.PI/2),[.2,2.1,.2],tim);
  vB('vWood',wx+1.3,1.05,wz,.06,.5,.06,0,timD);vB('vWood',wx+1.45,1.05,wz,.3,.06,.06,0,timD);xwLine([wx,1.1,wz],[wx,.42,wz],.02,rope);vPst('vBarrel',wx+.8,.4,wz+.6,.2,.3,timD);}
 /* the tally hut: a rubble room, a flat roof, the tally table under its awning with the scales (v 1 the opal sorting table) */
 const hk=xnWall(7.6,0,5.2,3.6,2.4,3.2,0,rub,'stone');xnFlatRoof(7.6,2.4,5.2,3.6*hk,3.2*hk,0,rub,{parapet:.35,corner:'flag'});
 vnDoor(6.4,0,6.8,0,.9,1.9,'vWood',tim,timD,false);vnAwning(8.3,2.2,6.8,0,2.4,1.3,xC(xPick(XPAL.cloth)));
 xwTable(8.3,7.7,1.8,.7,.8,0,timD);
 if(V===1){for(let k=0;k<9;k++)kput('xPaintBall',[7.6+rr(0,1.4),.83,7.5+rr(0,.4)],null,[.05,.04,.05],xC(xPick([0x7ab8c8,0x9ad0a0,0xd0a0c8,0xe8e0d0])));vB('vWood',9,.8,7.7,.5,.12,.5,0,timD);}
 else{vB('vIron',8.3,.8,7.7,.03,.45,.03,0,iron);vB('vIron',8.3,1.24,7.7,.6,.03,.03,0,iron);for(const s of[-1,1])kput('xDiscG',[8.3+s*.3,1.0,7.7],null,[.12,.02,.12],xC(xPick(XPAL.gold)));}
 xnFolk(0,0,1,3,4);}
XA.def({key:'xa_mine_head',name:'Mine head',family:'Works',tags:{type:['industry'],wealth:'poor',lit:false},w:22,d:20,h:9,fw:20,fd:18,nv:2,build:buildXaMineHead});

/* ---------------------------------------------------------------- the placer sluice: 12 x 32, the head on the bank at -z, the tail at +z */
function buildXaPlacerSluice(G,o){reseed(34731+(o.v|0));const V=xV(o),earth=xC(xPick(XPAL.earth)),tim=xC(xPick(XPAL.aged)),timD=xC(0x4a3a28),water=xC(XPAL.water),
 gravel=xC(xPick([0x9a8e7c,0x8a8070,0xa69a86])),canvas=xC(0xc8b898),iron=xC(0x2a2826);
 vnReg('Placer sluice',0,0,5,2.6);
 /* the bank the stream is led along: the ditch on it, its boards */
 vB('xEarthB',0,0,-13.5,11,2.2,5,0,earth);vB('xWaterB',0,2.2,-14.4,1.0,.1,3.2,0,water);for(const s of[-1,1])vB('vWood',s*.6,2.2,-14.4,.1,.3,3.2,0,timD);
 /* the sluice box (v 1 two side by side) down to the tail: its floor, sides, the water in it, the riffles; the trestles under it */
 const z0=-11,z1=13,L=z1-z0,zc=(z0+z1)/2,y0=2.2,y1=.4,pitch=Math.atan2(y0-y1,L),Y=z=>y0-(z-z0)*(y0-y1)/L,xs=V===1?[-1.1,1.1]:[0];
 for(const x of xs){kput('vWood',[x,Y(zc)-.04,zc],qEuler(pitch,0,0),[1.0,.08,L+.1],tim);
  for(const s of[-1,1])kput('vWood',[x+s*.54,Y(zc)+.16,zc],qEuler(pitch,0,0),[.08,.44,L+.1],tim);
  kput('xWaterB',[x,Y(zc)+.06,zc],qEuler(pitch,0,0),[.98,.05,L],water);
  for(let k=0;k<Math.floor(L/.6);k++){const z=z0+.4+k*.6;kput('vWood',[x,Y(z)+.07,z],qEuler(pitch,0,0),[.98,.07,.06],timD);}
  for(let z=z0+1.5;z<z1;z+=3){for(const s of[-1,1])vB('vWood',x+s*.45,0,z,.12,Y(z)-.08,.12,0,timD);vB('vWood',x,Y(z)*.45,z,1.05,.08,.08,0,timD);}}
 /* the tailings: the heap at the tail, the long heap along the box, the tail water going off */
 xwHeap(0,14.2,2.6,1.5,.7,gravel,8);xwHeap(-3.8,5,1.6,4.2,.55,gravel.clone().multiplyScalar(.92),8);vB('xWaterB',3.6,0,14.2,1.0,.06,3.2,0,water);
 /* the rocker: a cradle on its rockers, the riddle box on top, the handle; the water barrel and the pans */
 const rx=V===1?4.2:3.6,rz=3;for(const s of[-1,1])kput('vWood',[rx+s*.35,.14,rz],null,[.08,.26,1.4],timD);
 kput('vWood',[rx,.52,rz],qEuler(.12,0,0),[.8,.46,1.3],tim);vB('vIron',rx,.76,rz-.35,.86,.12,.6,0,iron);vB('vWood',rx+.46,.6,rz+.3,.06,.9,.06,0,timD);
 vnBarrel(rx+.7,0,rz-1.6,.35,.8,tim);for(let k=0;k<3;k++)kput('xDisc',[rx-.9,.03,rz+1.2+k*.5],null,[.22,.04,.22],iron);
 /* the diggers' fly: a canvas sheet on four poles by the bank */
 for(const x of[-5,-2])for(const z of[-9.6,-7.2])vPst('vPost',x,0,z,.05,z<-8?1.9:1.3,timD);kput('vTarpB',[-3.5,1.6,-8.4],qEuler(.24,0,0),[3.4,.04,2.6],canvas);
 xnFolk(2,0,0,3,4);}
XA.def({key:'xa_placer_sluice',name:'Placer sluice',family:'Works',tags:{type:['industry'],wealth:'poor',lit:false},w:12,d:32,h:3,fw:11,fd:30,nv:2,build:buildXaPlacerSluice});

/* ---------------------------------------------------------------- the wayside shrine: 6 x 6, three takes */
function buildXaWaysideShrine(G,o){reseed(34741+(o.v|0));const V=xV(o)%3,wash=xC(xPick(XPAL.wash)),stone=xC(xPick(XPAL.stone)),rub=xC(xPick(XPAL.rubble)),timD=xC(0x5a4632),
 red=xC(XPAL.red),marigold=xC(0xe8a030),gold=xC(xPick(XPAL.gold));
 vnReg('Wayside shrine',0,0,2.4,3.6);
 /* the butter lamps on a ledge whose top is at y; marigolds */
 const lamps=(x,y,z,n)=>{for(let k=0;k<n;k++){const u=x-(n-1)*.14+k*.28;kput('xDiscG',[u,y+.025,z],null,[.07,.05,.07],gold);vBall('vEmber',u,y+.1,z,.03,null,.05);}};
 const flowers=(x,y,z,n)=>{for(let k=0;k<n;k++)kput('xPaintBall',[x+rr(-.5,.5),y+.05,z+rr(-.12,.12)],null,[.06,.05,.06],marigold);};
 if(V===0){/* the chorten: stepped base, the white dome, the gilt spire; a niche in its body, the offering ledge, flags to two poles */
  xnShrine(0,0,-.6,.75,wash);kput('xArcDark',[0,.75,.06],null,[.4,.32,.04]);
  vB('vStone',0,0,.9,1.6,.6,.5,0,stone);lamps(0,.6,.9,4);flowers(0,.6,1.0,4);
  for(const s of[-1,1]){vPst('vPost',s*2.4,0,-2.4,.05,3.6,timD);xwFlags([0,3.15,-.6],[s*2.4,3.55,-2.4],7);}}
 else if(V===1){/* the niche shrine: a battered whitewashed pillar, a red-framed niche with a gilt image, the twig band, a gilt
   finial; the ledge; a flag pole with its tall flag, a line of flags from it */
  xnWall(0,0,-.7,1.8,2.2,1.2,0,wash,'wash');vB('xPaint',0,.7,-.15,.9,1.25,.08,0,red);kput('xArcDark',[0,.78,-.1],null,[.66,1.05,.06]);
  kput('xDiscG',[0,1.25,-.06],qEuler(Math.PI/2,0,0),[.2,.03,.2],gold);
  xnBand(0,1.9,-.7,1.46,.98,0,.3,null,{gold:true});vB('xWashB',0,2.2,-.7,1.5,.15,1.05,0,wash);vB('xWashB',0,2.35,-.7,1.0,.2,.7,0,wash);
  vBall('xGold',0,2.72,-.7,.16,gold);kput('xConeG',[0,2.82,-.7],null,[.1,.5,.1],gold);
  vB('vStone',0,0,.35,1.6,.6,.7,0,stone);lamps(0,.6,.45,3);for(const s of[-1,1])vPst('vClayPot',s*.6,.6,.4,.1,.1,xC(0xb87050));flowers(0,.6,.2,3);
  xnFlagpole(1.9,0,-1.2,4.2,xC(XPAL.white));vPst('vPost',-2.2,0,.8,.05,2.7,timD);xwFlags([1.9,4.0,-1.2],[-2.2,2.6,.8],9);}
 else{/* the mani wall: a low rubble wall, its top of carved stones painted with the prayer, a small chorten at its end, flags over */
  vB('xRubB',-.9,0,-.4,3.8,1.0,1.0,0,rub);vB('vStone',-.9,1.0,-.4,3.9,.1,1.1,0,stone);
  for(let k=0;k<10;k++)kput('xPaint',[-2.6+k*.38,1.24,-.4+rr(-.15,.15)],qEuler(rr(-.25,.25),0,rr(-.15,.15)),[.3,.28,.07],xC(xPick([0xf4efe4,0xd8d0c0,0x2a5aa8,0xa8382a,0x2f7a4a])));
  for(let k=0;k<6;k++)vB('xPaint',-2.4+k*.6,.35,.11,.42,.3,.02,0,xC(xPick([0xf4efe4,0x2a5aa8,0xa8382a])));
  xnShrine(2.0,0,-.4,.5,wash);vB('vStone',2.0,0,.75,1.0,.45,.4,0,stone);lamps(2.0,.45,.75,3);
  vPst('vPost',-2.7,0,-1.6,.05,3.0,timD);vPst('vPost',2.7,0,-1.8,.05,3.0,timD);xwFlags([-2.7,2.9,-1.6],[2.7,2.9,-1.8],12);}
 xnFolk(0,0,2.0,1,.6);}
XA.def({key:'xa_wayside_shrine',name:'Wayside shrine',family:'Sacred',tags:{type:['religious'],wealth:'civic',lit:false},w:6,d:6,h:4,fw:3,fd:3,nv:3,build:buildXaWaysideShrine});
