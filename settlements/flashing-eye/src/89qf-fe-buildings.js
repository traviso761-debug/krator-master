// ================================================================= THE FLASHING EYE — the Order's own buildings (prefix fe)
// The ranges, the Lip Range, the Red Monastery (the Order's temple), the Ember Tower, the towers, the Eye Post, the Watch's hut,
// the gates and the shrines of the Way of Shrines (settlements/flashing-eye/PLAN.md sections 2.3 and 2.7; BLUEPRINT.md), on the
// Qiblai kit's contract (QB.def, the qn* helpers; kits/qiblai/src read in place) and the revamp's shapes (89qe: red tiled roofs with
// upturned eaves, tiers, the round cap, the towers of the owner's references, 2026-11-23). White-washed walls, a teal frieze, the
// Order's crimson in its cornices and bands (QSPOKE[0]); gilt only on the temple's crown and the Ember's sanctum. Seeds 34400-34599
// (*proposed*): the range 34401, the Lip Range 34411, the Ember 34421, the post 34431, the hut 34441, the gate 34451, the temple
// 34461, the towers 34471, the shrine 34481. Local frame as the kit's: origin at the plot's centre on the ground, +z the front.
const FE_SP=QSPOKE[0],FE_ST=4.2;
// the Ember's glow (the tower's north window) and the fire basket's: their own items, so 90fh can set their light by the hour
MAT.feEmber=new THREE.MeshStandardMaterial({color:0x3a1a10,emissive:0xff6a20,emissiveIntensity:.25,roughness:.6,metalness:0});
MAT.feFire=new THREE.MeshStandardMaterial({color:0x2a1408,emissive:0xff7a28,emissiveIntensity:.4,roughness:.7,metalness:0});
kdef('feEmberB',VBOX,MAT.feEmber);kdef('feFireB',VBOX,MAT.feFire);
// the lights a builder hangs, in its local frame (the page sets FE_LAMPREC.cur before VERN.place): [x, y, z, kind]
const FE_LAMPREC={cur:null};
const feLamp=(x,y,z,k)=>{if(FE_LAMPREC.cur)FE_LAMPREC.cur.push([x,y,z,k]);};
// smoke a builder sends up (the kitchen's chimneys, the bath's steam), in its local frame: [x, y, z, kind] (an ATMOS.PRESETS.smoke kind)
const FE_SMOKEREC={cur:null};
const feSmoke=(x,y,z,k)=>{if(FE_SMOKEREC.cur)FE_SMOKEREC.cur.push([x,y,z,k]);};
const feWash=()=>xC(xPick(XPAL.wash)),feCrimson=()=>xC(FE_SP.wall);
// a white block of storeys with its windows, a teal frieze, a crimson cornice and a red hip roof; returns the roof's top
function feBlock(x,z,w,d,ry,hs,o){o=o||{};const wash=o.wash||feWash(),y0=o.y==null?0:o.y;
 const S=qnStack(x,y0,z,w,d,ry,hs,wash,'wash',false);
 if(o.wins!==false)qnWins(x,y0,z,w,d,ry,hs,S.k,{pitch:o.pitch==null?3:o.pitch,ww:.7,wh:1.05,kind:o.lit?'lit':'glass',trim:feCrimson(),skip:o.skip});
 feFrieze(x,S.y-.95,z,S.w,S.d,ry,.5,!!o.roundels);vB('xPaint',x,S.y-.3,z,S.w+.35,.3,S.d+.35,ry,feCrimson());
 return feRoof(x,S.y,z,S.w+2.6,S.d+2.6,ry,Math.min(S.w,S.d)*(o.pitchK==null?.22:o.pitchK)+.6);}

// ---------------------------------------------------------------- a range sized to its layout box (the bench's lesser buildings)
// o.w across (x), o.d deep (z), o.st storeys
function buildFeRange(G,o){reseed(34401+(o.v|0));const W=o.w==null?20:o.w,D=o.d==null?12:o.d,st=o.st==null?1:o.st,P=.5;
 vnReg(o.name==null?'A range of the Flashing Eye':o.name,0,0,Math.hypot(W,D)/2,P+st*3.6+4);
 qnPlinth(0,0,W,D,P,0,xC(xPick(QSTONE)));const hs=[];for(let i=0;i<st;i++)hs.push(3.6);
 const top=feBlock(0,0,W,D,0,hs,{y:P,skip:[[-1.8,1.8]],roundels:W>24}),eave=P+hs.reduce((x,y)=>x+y,0),k=o.kind,dark=feCol(FE_DARK);
 qnDoor(0,P,D/2,0,1.6,2.5,{c:xC(XPAL.red),valC:feCrimson()});
 /* what each range is for, readable from outside: the kitchen's two chimneys (its hearth lit from the Ember; 90fh smokes them), the
    granary's louvred vents in its roof, the bath house's steam lantern, the chapter range's wooden gallery, the Mirror School's
    trial mirrors by its door */
 if(k==='kitchen')for(const s of[-1,1]){const x=s*W*.28,z=-D*.12;qnCube(x,eave-1,z,1.3,top-eave+2.8,1.3,0,feWash(),'wash');vB('xPaint',x,top+1.8,z,1.7,.25,1.7,0,dark);feSmoke(x,top+2.1,z,'chimney');}
 if(k==='store')for(let i=-2;i<=2;i++){vB('xPaint',i*W*.17,eave+(top-eave)*.32,D*.2,1.2,.7,1,0,dark);vB('xPaint',i*W*.17,eave+(top-eave)*.32+.72,D*.2,1.5,.12,1.3,0,feCol(FE_RED));}
 if(k==='bath'){qnCube(0,top-1.4,0,2.6,1.8,2.6,0,feWash(),'wash');feRoof(0,top+.4,0,4,4,0,1.5);feSmoke(0,top+1.2,0,'steam');}
 if(k==='cells'&&st>1){const yg=P+3.6,red=feCrimson();vB('qPlankB',0,yg-.15,D/2+.7,W-1,.15,1.4,0,xC(0x8a6a48));
  const n=Math.max(2,Math.round(W/2.4));for(let i=0;i<=n;i++){const x=-W/2+.5+i*(W-1)/n;vPst('vPost',x,yg,D/2+1.35,.07,1.05,red);vB('xPaint',x,yg-.9,D/2+.7,.18,.75,1.2,0,dark);}
  vB('xPaint',0,yg+1.02,D/2+1.35,W-1,.1,.1,0,xC(FE_OCHRE));}
 if(k==='mirror_school')for(const s of[-1,1]){vPst('vPost',s*2.6,P,D/2+1.2,.06,1.6,dark);vB('xPaint',s*2.6,P+1.55,D/2+1.25,.5,.5,.06,0,xC(0xa07a48));}}
QB.def({key:'qb_fe_range',name:'A range of the Flashing Eye',family:'The Flashing Eye',tags:QTAG('civic',['religious','civic']),w:20,d:12,h:10,nv:3,build:buildFeRange});

// ---------------------------------------------------------------- a court: four ranges round a yard (the novices' court)
// o.w across, o.d deep, o.st storeys; the ranges 7 m deep, the front one with its gate passage, a small chorten in the paved yard
function buildFeCourt(G,o){reseed(34492);const W=o.w==null?30:o.w,D=o.d==null?40:o.d,st=o.st==null?2:o.st,R=7,P=.5,hs=[];for(let i=0;i<st;i++)hs.push(3.6);
 vnReg(o.name==null?'A court of the Flashing Eye':o.name,0,0,Math.hypot(W,D)/2,P+st*3.6+4);
 qnPlinth(0,0,W,D,P,0,xC(xPick(QSTONE)));vB('qAshB',0,P-.02,0,W-2*R,.05,D-2*R,0,xC(0x8c8984));
 feBlock(0,D/2-R/2,W,R,0,hs,{y:P,skip:[[-2,2]],roundels:true});feBlock(0,-D/2+R/2,W,R,Math.PI,hs,{y:P});
 for(const s of[-1,1])feBlock(s*(W/2-R/2),0,D-2*R,R,s<0?Math.PI/2:-Math.PI/2,hs,{y:P});
 qnDoor(0,P,D/2,0,2.2,3,{c:xC(XPAL.red),valC:feCrimson()});qnDoor(0,P,D/2-R,Math.PI,2.2,3,{c:xC(XPAL.red),valC:feCrimson()});
 qnChorten(0,P,0,.42);}
QB.def({key:'qb_fe_court',name:'A court of the Flashing Eye',family:'The Flashing Eye',tags:QTAG('civic',['religious','civic']),w:30,d:40,h:12,nv:1,build:buildFeCourt});

// ---------------------------------------------------------------- the Lip Range (sheet L)
// 120 x 14 m on the Lip, its front (+z) the Rift: its two lower floors white-washed, cut into the band's top and 3 m proud of the
// face on a battered white apron, their roof the terrace in front of L0 (the Mirror Hall's balcony at its west end); L0 and L1
// white under the teal frieze and the crimson cornice; one long red roof. o.len the length (120)
function buildFeLipRange(G,o){reseed(34411);const W=o.len==null?120:o.len,D=14,PR=3,wash=feWash(),stone=xC(0x4a4542);
 vnReg('The Lip Range (the Mirror Hall, the Book House, the guest house, the Prismarch\'s Hall)',0,0,W/2+4,4*FE_ST+8);
 feApron(0,D/2+PR/2-.6,W+2,PR+1.2,0,34,wash.clone().multiplyScalar(.9));
 const L=qnStack(0,-2*FE_ST,PR/2,W,D+PR,0,[FE_ST,FE_ST],wash,'wash');
 qnWins(0,-2*FE_ST,PR/2,W,D+PR,0,[FE_ST,FE_ST],L.k,{pitch:3.4,ww:.8,wh:1.1,kind:'lit',trim:feCrimson()});
 vB('xPaint',0,-.12,D/2+PR-.2,W,.14,.3,0,feCrimson());
 vB('qAshB',0,0,D/2+PR-.25,W,1.05,.35,0,stone);   /* the balcony's parapet; the mirrors on it at the Mirror Hall's end */
 for(let i=0;i<3;i++){const x=-W/2+9+i*5;vPst('vPost',x,1.05,D/2+PR-.25,.05,.7,xC(0x3a3028));vB('xPaint',x,1.65,D/2+PR-.2,.42,.42,.06,0,xC(0xa07a48));}
 feBlock(0,0,W,D,0,[FE_ST,FE_ST],{pitch:3,roundels:true,skip:[[-W/2+13,-W/2+17],[-W/2+43,-W/2+47],[W/2-47,W/2-43],[W/2-17,W/2-13]]});
 /* two doors for each of its four houses (the Mirror Hall, the Book House, the guest house, the Prismarch's hall): from the bench
    behind it, and out onto the balcony over the Rift; the ways into its four floors (the interiors, targets/cone/90fk) */
 for(const x of[-W/2+15,-W/2+45,W/2-45,W/2-15]){qnDoor(x,0,D/2,0,1.6,2.6,{c:xC(XPAL.red),valC:feCrimson()});qnDoor(x,0,-D/2,Math.PI,1.6,2.6,{c:xC(XPAL.red),valC:feCrimson()});}}
QB.def({key:'qb_fe_lip_range',name:'The Lip Range',family:'The Flashing Eye',tags:QTAG('civic',['religious','civic'],{note:'the Mirror Hall, the Book House, the guest house and the Prismarch\'s hall on the Lip; two floors cut into the band'}),w:124,d:20,h:20,fw:120,fd:17,nv:1,build:buildFeLipRange});

// ---------------------------------------------------------------- the Red Monastery: the Order's temple on the kit's plan (sheets M1-MR)
// 52 x 52 m: the front range with its gate tower (two tiers), the side ranges and the back range round the court, two storeys
// white under red roofs; the Assembly Hall in the court under two tiers, the gilt crown its finial (the house's one gilt crown)
function buildFeTemple(G,o){reseed(34491);const wash=feWash(),P=.8;
 vnReg('The Red Monastery (the Order of the Flashing Eye\'s great monastery)',0,0,37,P+22);
 qnPlinth(0,0,52,52,P,0,xC(xPick(QSTONE)));vB('qAshB',0,P-.02,1,36,.05,34,0,xC(0x8c8984));
 feBlock(-15.5,22.5,21,7,0,[3.6,3.4],{y:P,roundels:true});feBlock(15.5,22.5,21,7,0,[3.6,3.4],{y:P,roundels:true});
 for(const s of[-1,1])feBlock(s*22.5,0,38,7,s<0?Math.PI/2:-Math.PI/2,[3.6,3.4],{y:P});
 feBlock(0,-22.5,52,7,Math.PI,[3.6,3.4],{y:P,roundels:true});
 /* the gate tower: three storeys, two tiers, the Gate of the Open Eye */
 const g=qnStack(0,P,22.5,10,9,0,[3.8,3.4,3.2],wash,'wash',false);qnWins(0,P,22.5,10,9,0,[3.8,3.4,3.2],g.k,{pitch:2.6,kind:'glass',trim:feCrimson(),skip:[[-1.6,1.6]]});
 qnDoor(0,P,27,0,2.4,3.4,{c:xC(XPAL.red),valC:feCrimson()});feFrieze(0,g.y-.9,22.5,g.w,g.d,0,.5,true);
 feTiers(0,g.y,22.5,g.w,g.d,0,2,{ov:1.6,wash});
 /* the Assembly Hall: 24 x 17, its porch to the gate; two tiers; the gilt crown */
 const H=qnStack(0,P,-8.5,24,17,0,[5,4.2],wash,'wash',false);qnWins(0,P,-8.5,24,17,0,[5,4.2],H.k,{pitch:3,ww:.9,wh:1.6,kind:'lit',trim:feCrimson(),skip:[[-2.4,2.4]]});
 qnDoor(0,P,0,0,2.6,3.6,{c:xC(XPAL.red),valC:feCrimson()});
 for(let i=-2;i<=2;i++)vPst('vPost',i*2.4,P,1.6,.22,4.6,feCrimson());feRoof(0,P+4.6,1.8,13,4,0,1.4);
 feFrieze(0,H.y-.95,-8.5,H.w,H.d,0,.55,true);
 const top=feTiers(0,H.y,-8.5,H.w,H.d,0,2,{ov:2,step:.66,drum:2.6,wash,finial:false});
 vPst('qGiltB',0,top-.4,-8.5,.5,1.2,xC(xPick(XPAL.gold)));vBall('qGiltBall',0,top+1.2,-8.5,.7,xC(xPick(XPAL.gold)));vPst('qGiltB',0,top+1.6,-8.5,.12,2.4,xC(xPick(XPAL.gold)));
 qnSpokeBanner(-20,P,18,0,6);qnSpokeBanner(20,P,18,0,6);}
QB.def({key:'qb_fe_temple',name:'The Red Monastery',family:'The Flashing Eye',tags:QTAG('civic',['religious'],{note:'the great monastery of the Order of the Flashing Eye: the kit\'s plan, the revamp\'s roofs'}),w:56,d:56,h:28,fw:52,fd:52,nv:1,build:buildFeTemple});

// ---------------------------------------------------------------- the Ember Tower (sheet H): the Hall of the Ember and its tower
// The hall (20 deep, 16 across) one tall storey under a red skirt roof, its porch (+z) to the monastery; the tower rising from its
// back half, white and tapering, the crimson band, three red tiers and the gilt finial of the sanctum; the north window glowing
function buildFeEmber(G,o){reseed(34421);const wash=feWash(),P=.9;
 vnReg('The Ember Tower (the Hall of the Ember)',0,0,13,44);
 qnPlinth(0,0,17,21,P,0,xC(xPick(QSTONE)));
 const h=qnStack(0,P,2.5,16,15,0,[5.2],wash,'wash',false);qnWins(0,P,2.5,16,15,0,[5.2],h.k,{pitch:3,ww:.8,wh:2,kind:'lit',trim:feCrimson(),skip:[[-2,2]]});
 qnDoor(0,P,10,0,2.2,3.2,{c:xC(XPAL.red),valC:feCrimson()});feRoof(0,h.y,2.5,h.w+3,h.d+3,0,3.4);
 const S=qnStack(0,P,-4,11,11,0,[6,6,6,6,5],wash,'wash',false);qnWins(0,P+6,-4,11,11,0,[6,6,6,5],S.k,{pitch:2.6,ww:.55,wh:1.1,kind:'lit',trim:feCrimson()});
 qnCube(0,S.y,-4,S.w,2.2,S.d,0,feCrimson(),'wash');feFrieze(0,S.y+2.2,-4,S.w,S.d,0,.5,true);
 const top=feTiers(0,S.y+2.7,-4,S.w,S.d,0,3,{ov:2,step:.76,drum:2.4,wash,finialC:xC(xPick(XPAL.gold)),finialH:3.2});
 vBall('qGiltBall',0,top-.6,-4,.5,xC(xPick(XPAL.gold)));   /* the sanctum's gilt: the finial and its ball */
 vB('feEmberB',0,P+1.6,-9.55,2.4,3,.1,0,xC(0xffffff));vB('xPaint',0,P+4.6,-9.6,3,.2,.16,0,xC(XPAL.saffron));
 qnDoor(5.5,P,-7.25,Math.PI/2,1.3,2.6,{c:xC(XPAL.red),valC:feCrimson()});   /* the sanctum's door, on the tower's east face behind the hall */
 feLamp(0,P+2.5,-8,'ember');}
QB.def({key:'qb_fe_ember',name:'The Ember Tower',family:'The Flashing Eye',tags:QTAG('civic',['religious'],{note:'the fire lit from the vent once a year; every hearth and lamp in the house is lit from it'}),w:20,d:22,h:46,fw:17,fd:21,nv:1,build:buildFeEmber});

// ---------------------------------------------------------------- the towers (the references): o.style 'round' (the Mirror Tower),
// 'bays' (the Labrang Tower), 'pagoda' (the corner towers); o.W, o.H, o.drop (a battered base down the face), o.mirror
function buildFeTower(G,o){reseed(34471+(o.style==='bays'?1:o.style==='pagoda'?2:0));const W=o.W==null?10:o.W,H=o.H==null?24:o.H;
 vnReg(o.name==null?'A tower of the Flashing Eye':o.name,0,0,W,H+10);
 if(o.style==='bays')feTowerBays({W,H,bays:o.bays,drop:o.drop,mirror:o.mirror});
 else if(o.style==='pagoda')feTowerPagoda({W,H,drop:o.drop});
 else feTowerRound({W,H,drop:o.drop,mirror:o.mirror,lantern:3});}
QB.def({key:'qb_fe_tower',name:'A tower of the Flashing Eye',family:'The Flashing Eye',tags:QTAG('civic',['religious','military']),w:12,d:12,h:40,nv:3,build:buildFeTower});

// ---------------------------------------------------------------- the Eye Post (sheet P): the first reference's tower on the rim
// 8 x 8 m and 12 m to its lantern: the watch room, the Book's room and the mirror room in the shaft; in the lantern under the round
// red cap the 60 cm speculum (to the south-west: the Beacon, Erehwon, the Tears) and the shuttered fire basket
function buildFeEyePost(G,o){reseed(34431);vnReg('The Eye Post',0,0,6,20);feTowerRound({W:8,H:9.5,basket:true,lantern:2.6});}   /* its heliograph is the catalog's (90fk) */
QB.def({key:'qb_fe_post',name:'The Eye Post',family:'The Flashing Eye',tags:QTAG('civic',['religious'],{note:'the Rim Watch\'s tower on the crater\'s rim: the heliograph and the fire basket'}),w:9,d:9,h:20,fw:9,fd:9,nv:1,build:buildFeEyePost});

// ---------------------------------------------------------------- the Watch's hut, a gate, a shrine
function buildFeHut(G,o){reseed(34441);vnReg('The Watch\'s Hut',0,0,6,7);qnPlinth(0,0,8,8,.4,0,xC(0x3d3936));
 feBlock(0,0,8,8,0,[3.2],{y:.4,lit:true,skip:[[-1,1]],pitch:2.6});qnDoor(0,.4,4,0,1.1,2.1,{c:xC(XPAL.red),valC:feCrimson()});}
QB.def({key:'qb_fe_hut',name:'The Watch\'s Hut',family:'The Flashing Eye',tags:QTAG('poor',['religious']),w:9,d:9,h:7,nv:1,build:buildFeHut});
// a gatehouse through the precinct's wall: o.w across, o.d deep, o.st storeys (1 or 2); the passage front to back; two red tiers
function buildFeGate(G,o){reseed(34451);const W=o.w==null?10:o.w,D=o.d==null?8:o.d,st=o.st==null?2:o.st,wash=feWash();
 vnReg(o.name==null?'A gate of the Flashing Eye':o.name,0,0,Math.hypot(W,D)/2,st*3.8+8);
 qnPlinth(0,0,W,D,.4,0,xC(xPick(QSTONE)));const S=qnStack(0,.4,0,W,D,0,st>1?[4,3.6]:[4.2],wash,'wash',false);
 for(const s of[-1,1])qnDoor(0,.4,s*D/2,s<0?Math.PI:0,2.4,3.2,{c:xC(XPAL.red),valC:feCrimson()});
 feFrieze(0,S.y-.9,0,S.w,S.d,0,.5,true);vB('xPaint',0,S.y-.3,0,S.w+.35,.3,S.d+.35,0,feCrimson());
 feTiers(0,S.y,0,S.w,S.d,0,2,{ov:1.4,wash});}
QB.def({key:'qb_fe_gate',name:'A gate of the Flashing Eye',family:'The Flashing Eye',tags:QTAG('civic',['religious','civic']),w:10,d:8,h:16,nv:1,build:buildFeGate});
// a shrine of the Way of Shrines: a small white cube on its stack's top, the teal frieze, two red tiers, its door (+z) to the bridge
// that arrives, the lamp niche, prayer flags to a pole
function buildFeShrine(G,o){reseed(34481+(o.v|0));const wash=feWash();vnReg(o.name==null?'A shrine of the Way of Shrines':o.name,0,0,5,9);
 qnPlinth(0,0,6.4,6.4,.4,0,xC(0x3d3936));const S=qnStack(0,.4,0,5,5,0,[3.2],wash,'wash',false);
 qnDoor(0,.4,2.5,0,1.3,2.3,{c:xC(XPAL.red),valC:feCrimson()});feFrieze(0,S.y-.7,0,S.w,S.d,0,.45,false);
 feTiers(0,S.y,0,S.w,S.d,0,2,{ov:1.1,step:.7,drum:1.4,wash,finialH:1.8});
 vPst('vPost',2.9,.4,-2.9,.05,5.5,xC(0x5a4632));qnFlags([2.9,5.6,-2.9],[-2.9,.6,2.9]);}
QB.def({key:'qb_fe_shrine',name:'A shrine of the Way of Shrines',family:'The Flashing Eye',tags:QTAG('civic',['religious']),w:7,d:7,h:9,nv:6,build:buildFeShrine});
