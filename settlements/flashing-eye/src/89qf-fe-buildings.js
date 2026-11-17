// ================================================================= THE FLASHING EYE — the Order's own buildings (prefix fe)
// The Lip Range, the Hall of the Ember, the Eye Post, the Watch's hut, the gates and the bench's ranges (settlements/flashing-eye/
// PLAN.md section 2.3; BLUEPRINT.md sheets L, H, P, E1, E2), on the Qiblai kit's contract (QB.def, the qn* helpers; kits/qiblai/src
// read in place) in the crimson dress (QSPOKE[0]: crimson walls, saffron trim, the oxblood band). As the Potala's palaces, the
// lower storeys are white-washed and the upper crimson. Gilt only on the Ember's sanctum (its little crown); the monastery's
// crown is the kit's. Seeds 34400-34599 (*proposed*, the block after Viridian's): the range 34401, the Lip Range 34411, the
// Ember 34421, the post 34431, the hut 34441, the gate 34451. Local frame as the kit's: origin at the plot's centre on the
// ground, +z the front, y up, metres. No oil: the fire basket and the Ember's window are the only lights a builder hangs.
const FE_SP=QSPOKE[0],FE_ST=4.2;
// the Ember's glow (the Hall's north window) and the fire basket's: their own items, so 90fh can set their light by the hour and
// the burst without touching anything else
MAT.feEmber=new THREE.MeshStandardMaterial({color:0x3a1a10,emissive:0xff6a20,emissiveIntensity:.25,roughness:.6,metalness:0});
MAT.feFire=new THREE.MeshStandardMaterial({color:0x2a1408,emissive:0xff7a28,emissiveIntensity:.4,roughness:.7,metalness:0});
kdef('feEmberB',VBOX,MAT.feEmber);kdef('feFireB',VBOX,MAT.feFire);
// the lights a builder hangs, in its local frame (the page sets FE_LAMPREC.cur before VERN.place and turns each into the world):
// [x, y, z, kind]: 'ember' (the Hall's window), 'fire' (the post's basket)
const FE_LAMPREC={cur:null};
const feLamp=(x,y,z,k)=>{if(FE_LAMPREC.cur)FE_LAMPREC.cur.push([x,y,z,k]);};
const feBronze=()=>xC(0xa07a48);

// ---------------------------------------------------------------- a range sized to its layout box (the bench's other buildings)
// o.w across (x), o.d deep (z), o.st storeys, o.v the dress: 0 white-washed below and crimson above (the chapter's, the school's),
// 1 white-washed (the lay ranges: kitchen, granary, infirmary, bath, stores), 2 crimson (the Labrang's household, the Ember's
// tenders). A door in its front, windows in a grid, the oxblood band on its parapet.
function buildFeRange(G,o){reseed(34401+(o.v|0));const W=o.w==null?20:o.w,D=o.d==null?12:o.d,st=o.st==null?1:o.st,P=.5,stone=xC(xPick(QSTONE)),wash=xC(xPick(XPAL.wash)),red=xC(FE_SP.wall),band=xC(FE_SP.band);
 vnReg(o.name==null?'A range of the Flashing Eye':o.name,0,0,Math.hypot(W,D)/2,P+st*3.6+1);
 qnPlinth(0,0,W,D,P,0,stone);
 const hs=[];for(let i=0;i<st;i++)hs.push(3.6);
 const lo=o.v===2?red:wash,hi=o.v===1?wash:red,n0=o.v===0&&st>1?Math.ceil(st/2):st;
 let S=qnStack(0,P,0,W,D,0,hs.slice(0,n0),lo,'wash');
 if(n0<st)S=qnStack(0,S.y,0,S.w,S.d,0,hs.slice(n0),hi,'wash');
 qnWins(0,P,0,W,D,0,hs,S.k,{pitch:3,ww:.7,wh:1,kind:'glass',trim:red,skip:[[-1.8,1.8]]});
 qnDoor(0,P,D/2,0,1.6,2.5,{c:xC(XPAL.red),valC:red});
 qnRoof(0,S.y,0,S.w,S.d,0,o.v===1?wash:red,{band,parapet:.6});}
QB.def({key:'qb_fe_range',name:'A range of the Flashing Eye',family:'The Flashing Eye',tags:QTAG('civic',['religious','civic']),w:20,d:12,h:8,nv:3,build:buildFeRange});

// ---------------------------------------------------------------- the Lip Range (sheet L)
// 120 x 14 m on the Lip, its front (+z) the Rift. Its two lower floors (L-2, L-1) are cut into the band's top and stand 3 m proud
// of the face, white-washed, their windows in the cliff; a battered stone apron carries them down the face to their footing; their
// roof is the long terrace in front of L0, the Mirror Hall's balcony at its west end with the 30 cm mirrors on the parapet. L0 and
// L1 crimson, the oxblood band, the Labrang's east end a storey higher. o.len the length (120)
function buildFeLipRange(G,o){reseed(34411);const W=o.len==null?120:o.len,D=14,PR=3,stone=xC(0x4a4542),wash=xC(xPick(XPAL.wash)),red=xC(FE_SP.wall),band=xC(FE_SP.band);
 vnReg('The Lip Range (the Mirror Hall, the Book House, the guest house, the Labrang)',0,0,W/2+4,4*FE_ST+4);
 /* the apron down the face: three battered courses, each a little proud of the one above, white-washed as the Potala's walls */
 const apron=wash.clone().multiplyScalar(.9);for(const [y0,h,dz] of[[-34,9,2.2],[-25,8.5,1.2],[-16.5,8.1,.4]])vB('qAshB',0,y0,D/2+PR/2+dz/2-.6,W+2,h,PR+dz+1.2,0,apron);
 const L=qnStack(0,-2*FE_ST,PR/2,W,D+PR,0,[FE_ST,FE_ST],wash,'wash');
 qnWins(0,-2*FE_ST,PR/2,W,D+PR,0,[FE_ST,FE_ST],L.k,{pitch:3.4,ww:.8,wh:1.1,kind:'lit',trim:red});
 vB('xPaint',0,-.12,D/2+PR-.2,W,.14,.3,0,xC(FE_SP.band));
 /* the balcony's parapet along the front of the terrace; the mirrors on it at the Mirror Hall's end */
 vB('qAshB',0,0,D/2+PR-.25,W,1.05,.35,0,stone);
 for(let i=0;i<3;i++){const x=-W/2+9+i*5;vPst('vPost',x,1.05,D/2+PR-.25,.05,.7,xC(0x3a3028));vB('xPaint',x,1.65,D/2+PR-.2,.42,.42,.06,0,feBronze());}
 const U=qnStack(0,0,0,W,D,0,[FE_ST,FE_ST],red,'wash');
 qnWins(0,0,0,W,D,0,[FE_ST,FE_ST],U.k,{pitch:3,ww:.75,wh:1.05,kind:'glass',trim:xC(XPAL.saffron)});
 for(const x of[-W/2+15,-W/2+45,W/2-45])qnDoor(x,0,D/2,0,1.6,2.6,{c:xC(XPAL.red),valC:red});
 /* the Labrang's top floor at the east end, a storey higher; its tall south windows (the mirror room) */
 const LB=qnStack(W/2-15,U.y,0,30*U.k,U.d,0,[FE_ST],red,'wash');qnWins(W/2-15,U.y,0,30*U.k,U.d,0,[FE_ST],LB.k,{pitch:2.6,ww:.9,wh:2.2,kind:'glass',trim:xC(XPAL.saffron)});
 qnRoof(W/2-15,LB.y,0,LB.w,LB.d,0,red,{band,parapet:.8});
 qnRoof(-15,U.y,0,U.w-30*U.k,U.d,0,red,{band,parapet:.7});
 qnSpokeBanner(W/2-15,LB.y+.7,0,0,5);}
QB.def({key:'qb_fe_lip_range',name:'The Lip Range',family:'The Flashing Eye',tags:QTAG('civic',['religious','civic'],{note:'the Mirror Hall, the Book House, the guest house and the Labrang on the Lip; two floors cut into the band'}),w:122,d:18,h:22,fw:120,fd:17,nv:1,build:buildFeLipRange});

// ---------------------------------------------------------------- the Hall of the Ember (sheet H)
// 16 x 20 m, its porch (+z) to the monastery, its sanctum at the back (-z) under a small gilt pavilion (the one gilt thing the
// house builds; PLAN.md 2.3), its north window glowing with the fire lit from the vent
function buildFeEmber(G,o){reseed(34421);const W=16,D=20,P=.9,stone=xC(xPick(QSTONE)),red=xC(FE_SP.wall),band=xC(FE_SP.band);
 vnReg('The Hall of the Ember',0,0,13,P+12);
 qnPlinth(0,0,W+1.2,D+1.2,P,0,stone);
 const S=qnStack(0,P,0,W,D,0,[4.6,4],red,'wash');
 qnWins(0,P,0,W,D,0,[4.6,4],S.k,{pitch:3.2,ww:.7,wh:1.2,kind:'lit',trim:xC(XPAL.saffron),skip:[[-2,2]]});
 qnDoor(0,P,D/2,0,2,3,{c:xC(XPAL.red),valC:red});
 const top=qnRoof(0,S.y,0,S.w,S.d,0,red,{band,parapet:.7});
 qnCrown(0,top,-D/2+3.2,5,4.4,0,{banners:false,deer:false,pav:[3.2,2.6]});
 /* the north window: the Ember seen from the cap */
 vB('feEmberB',0,P+1.6,-D/2-.03,2.4,3,.1,0,xC(0xffffff));vB('xPaint',0,P+4.6,-D/2-.08,3,.2,.16,0,xC(XPAL.saffron));
 feLamp(0,P+2.5,-D/2+1.5,'ember');}
QB.def({key:'qb_fe_ember',name:'The Hall of the Ember',family:'The Flashing Eye',tags:QTAG('civic',['religious'],{note:'the fire lit from the vent once a year; every hearth and lamp in the house is lit from it'}),w:18,d:22,h:14,fw:17,fd:21,nv:1,build:buildFeEmber});

// ---------------------------------------------------------------- the Eye Post (sheet P)
// 8 x 8 m and 12 m on the crater's south rim: two storeys of dark basalt and the mirror room in crimson; on its platform the
// 60 cm speculum on a pier (its face to the south-west: the Beacon, Erehwon, the Tears) and the shuttered fire basket
function buildFeEyePost(G,o){reseed(34431);const W=8,D=8,basalt=xC(0x3d3936),red=xC(FE_SP.wall),band=xC(FE_SP.band),iron=xC(0x2a2826);
 vnReg('The Eye Post',0,0,6,13);
 qnPlinth(0,0,W+.8,D+.8,.6,0,basalt);
 const S=qnStack(0,.6,0,W,D,0,[3.8,3.8],basalt,'ashlar'),T=qnStack(0,S.y,0,S.w,S.d,0,[3.6],red,'wash');
 qnWins(0,.6,0,W,D,0,[3.8,3.8,3.6],T.k,{pitch:2.4,ww:.55,wh:.9,kind:'lit',trim:xC(XPAL.saffron),skip:[[-1.2,1.2]]});
 qnDoor(0,.6,D/2,0,1.2,2.2,{c:xC(XPAL.red),valC:red});
 const top=qnRoof(0,T.y,0,T.w,T.d,0,red,{band,parapet:1});
 const mx=1.6,mz=1.4;vB('qAshB',mx,top-.9,mz,.9,1.3,.9,0,basalt);vB('xPaint',mx,top+.4,mz+.35,.7,.7,.08,-.7,feBronze());
 vPst('vPost',mx+.5,top+.4,mz+.6,.03,.8,iron);   /* the sighting vane */
 const fx=-1.8,fz=-1.6;for(const [a,b] of[[-.35,-.35],[.35,-.35],[-.35,.35],[.35,.35]])vPst('vPipe',fx+a,top-.9,fz+b,.035,1.9,iron);
 vB('feFireB',fx,top+.75,fz,.8,.5,.8,0,xC(0xffffff));
 for(let i=0;i<5;i++)vB('xPaint',fx-.42,top+.6+i*.14,fz,.04,.1,.9,0,iron);   /* the shutter's slats */
 feLamp(fx,top+1.1,fz,'fire');
 qnSpokeBanner(-mx,top,mz,0,3);}
QB.def({key:'qb_fe_post',name:'The Eye Post',family:'The Flashing Eye',tags:QTAG('civic',['religious'],{note:'the Rim Watch\'s tower on the crater\'s rim: the heliograph and the fire basket'}),w:9,d:9,h:14,fw:9,fd:9,nv:1,build:buildFeEyePost});

// ---------------------------------------------------------------- the Watch's hut, and a gate
function buildFeHut(G,o){reseed(34441);const W=8,D=8,basalt=xC(0x3d3936),wash=xC(xPick(XPAL.wash)),band=xC(FE_SP.band);
 vnReg('The Watch\'s Hut',0,0,6,5);qnPlinth(0,0,W,D,.4,0,basalt);const S=qnStack(0,.4,0,W,D,0,[3.2],wash,'wash');
 qnWins(0,.4,0,W,D,0,[3.2],S.k,{pitch:2.6,ww:.5,wh:.8,kind:'lit',trim:xC(FE_SP.wall),skip:[[-1,1]]});qnDoor(0,.4,D/2,0,1.1,2.1,{c:xC(XPAL.red),valC:xC(FE_SP.wall)});
 qnRoof(0,S.y,0,S.w,S.d,0,wash,{band,parapet:.5});}
QB.def({key:'qb_fe_hut',name:'The Watch\'s Hut',family:'The Flashing Eye',tags:QTAG('poor',['religious']),w:9,d:9,h:5,nv:1,build:buildFeHut});
// a gatehouse through the precinct's wall: o.w across, o.d deep, o.st storeys (1 or 2); the passage through it front to back
function buildFeGate(G,o){reseed(34451);const W=o.w==null?10:o.w,D=o.d==null?8:o.d,st=o.st==null?2:o.st,stone=xC(xPick(QSTONE)),wash=xC(xPick(XPAL.wash)),red=xC(FE_SP.wall),band=xC(FE_SP.band);
 vnReg(o.name==null?'A gate of the Flashing Eye':o.name,0,0,Math.hypot(W,D)/2,st*3.8+2);
 qnPlinth(0,0,W,D,.4,0,stone);const hs=st>1?[4,3.6]:[4.2];
 let S=qnStack(0,.4,0,W,D,0,hs.slice(0,1),wash,'wash');if(st>1)S=qnStack(0,S.y,0,S.w,S.d,0,hs.slice(1),red,'wash');
 for(const s of[-1,1])qnDoor(0,.4,s*D/2,s<0?Math.PI:0,2.4,3.2,{c:xC(XPAL.red),valC:red});
 qnRoof(0,S.y,0,S.w,S.d,0,red,{band,parapet:.7});}
QB.def({key:'qb_fe_gate',name:'A gate of the Flashing Eye',family:'The Flashing Eye',tags:QTAG('civic',['religious','civic']),w:10,d:8,h:9,nv:1,build:buildFeGate});
