// ================================================================= GRĒṬ-ĀIL — the Hall of Dreaming, the waking range, the cup house (prefix ad)
// The Order of the Azure Dream's own buildings (settlements/azure-dream/PLAN.md sections 5 and 6, sheets H1 and H2), on the
// Qiblai kit's contract (QB.def, the qn* helpers; kits/qiblai/src read in place) in the Order's dress: white wash below, the
// upper blocks in QSPOKE[5]'s blue, its gold trim and its dark band (the owner, 2026-11-16: "white with blue dress"); gilt only
// on the sacred (the hall's lantern). Seed block 34000-34199 (given by the Qiblai kit's session, 2026-11-16): the hall 34001,
// the waking range 34011, the cup house 34021; the wharf 34041-34131 (89qb). Local frame as the kit's: origin at the plot's
// centre on the ground, +z the front, y up, metres.
const AD_SP=QSPOKE[5],AD_BLUE=AD_SP.wall,AD_BAND=AD_SP.band;
// the azure glass: the Keepers' Walk's floor lamps and the clerestory's panes, a deep blue lit by night (90af-hall-night.js
// sets its emissive by the hour). Its own item, so nothing else changes colour at dusk.
MAT.adAzure=new THREE.MeshStandardMaterial({color:0x2a4a9a,emissive:0x3a70e0,emissiveIntensity:.08,roughness:.3,metalness:0});
kdef('adAzureB',VBOX,MAT.adAzure);
// lamps a builder hangs, in its local frame: the page sets AD_LAMPREC.cur to a list before VERN.place and turns each into the
// world by the record's pose (its point-light pool by night, 90af). [x, y, z, kind]: 'azure' (the hall's), 'oil' (the wharf's)
const AD_LAMPREC={cur:null};
const adLamp=(x,y,z,k)=>{if(AD_LAMPREC.cur)AD_LAMPREC.cur.push([x,y,z,k||'oil']);};
// the hall's figures, in its local frame (the plan's H1 frame turned: z = 33 - u, x = v): the page reads them for the views and
// the verify. The cots: two to a 3 m bay, four bays either side of the walk, sixteen bays long: 256
const AD_HALL={P:1.2,HX:16.2,HZ:29,T:1.2,H1:7,H2:12,bays:16,turns:['the Decree','the Garden','the Chasm','the Fountain','the Dome and the Caves','the Damsel','the Song Revived','the Circle Thrice'],cots:[]};

// ---------------------------------------------------------------- the Hall of Dreaming
// A Tibetan pillared hall (a dukhang) 54 x 30 m inside on a 3 m grid: 18 bays long, 10 across, 136 columns. Down the middle two
// bays the Keepers' Walk under the clerestory; either side four bays of cots, two to a bay, heads to the outer wall: 256 in
// eight turnings of 32, read clockwise from the foot (1-4 up the east side, the women's; 5-8 down the west, the men's: the owner,
// 2026-11-16, "men and women's side"), a low painted screen at each end of a turning and a low lattice down the walk between
// the sides. The foot (+z): the door and the Porlock Screen's two felt curtains, the keepers' station, the blanket store, the
// Foot Gallery at +4 m; the Waking Door in the west wall of the foot bay. The head (-z): the Lulling dais, the Damsel's shrine
// and her gold lamp, the gilt Wheel on the head wall. The cot bays' ceiling at +7 m is the painted night (deep blue, gold stars:
// a stand-in for ceiling.night.stars, PROMPTS-NEEDED section 56); the walk rises to a clerestory at +12 m whose panes glow blue by
// night. Round it all, on the one plinth, the covered kora with 48 wheels each long side and the hall's great wheel behind the
// head; the gilt lantern over the shrine. The cots are builder geometry until the catalog has the dream cot (FURNITURE.md).
function buildAdDreamHall(G,o){reseed(34001);const A=AD_HALL,P=A.P,HX=A.HX,HZ=A.HZ,T=A.T,H1=A.H1,H2=A.H2;A.cots.length=0;
 const wash=xC(xPick(XPAL.wash)),blue=xC(AD_BLUE),band=xC(AD_BAND),stone=xC(xPick(QSTONE)),g=xC(xPick(XPAL.gold)),red=xC(XPAL.red),
  tim=xC(xPick(XPAL.timber)),dark=xC(0x2a2018),night=xC(0x16295a),felt=xC(0x2c3550),indigo=xC(0x1e2e6a),cream=xC(0xe8e0cc),straw=xC(0xc8b07a),sf=xC(XPAL.saffron);
 vnReg('Hall of Dreaming',0,0,40,P+H2+7,{turnings:8,cots:256});
 qnPlinth(0,0,42,66,P,0,stone);
 vB('vWood',0,P,0,2*(HX-T),.06,2*(HZ-T),0,xC(0x6a4a30));   /* the timber floor (felt on it, not stone: the keepers' steps make no sound) */
 // the walls: wash to the cot bays' ceiling less 1.2 m, the Order's blue above it to the parapet, the twig band in the dark blue
 const YB=P+H1-1.2,HB=1.2+.6+.75;
 const lower=(x,z,w,d,y0,h)=>vB('xWashB',x,y0==null?P:y0,z,w,h==null?YB-P:h,d,0,wash);
 const upper=(x,z,w,d)=>{vB('xWashB',x,YB,z,w,HB,d,0,blue);vB('xBandB',x,YB+HB-.62,z,w+.12,.3,d+.12,0,band);};
 const zS=HZ-T/2,zN=-HZ+T/2,xE=HX-T/2,xW=-HX+T/2,DW=1.4,DH=3.2,WZ0=25.1,WZ1=26.9,WH=2.6;
 for(const s of[-1,1])lower(s*(HX+DW)/2,zS,HX-DW,T);lower(0,zS,2*DW,T,P+DH,YB-P-DH);upper(0,zS,2*HX,T);   /* the foot: the door */
 lower(0,zN,2*HX,T);upper(0,zN,2*HX,T);
 lower(xE,0,T,2*HZ-2*T);upper(xE,0,T,2*HZ-2*T);
 lower(xW,(-HZ+T+WZ0)/2,T,WZ0-(-HZ+T));lower(xW,(WZ1+HZ-T)/2,T,HZ-T-WZ1);lower(xW,(WZ0+WZ1)/2,T,WZ1-WZ0,P+WH,YB-P-WH);upper(xW,0,T,2*HZ-2*T);   /* the Waking Door */
 qnDoor(0,P,HZ,0,2.4,3.0,{c:red,valC:blue});qnDoor(-HX,P,(WZ0+WZ1)/2,-Math.PI/2,1.4,2.4,{c:red,val:false,step:false});
 xnFlight(0,0,HZ+3.6+Math.max(2,Math.round(P/.17))*.34,0,6,P,'vStone',stone);
 // high small windows, shuttered dark: the hall sleeps
 for(let z=-24;z<=24;z+=6)for(const s of[-1,1])xnTibWin(s*(HX-.04),P+4.6,z,s*Math.PI/2,.7,.8,'glass',blue,{noVal:true});
 // the roofs: two slabs over the cot bays at the ceiling, the head and foot bays' slab over the walk, the clerestory's walls and
 // roof; the ceilings under them painted as the night with gold stars
 const CX=3.2,cw=HX-T-CX,cc=CX+cw/2;
 for(const s of[-1,1]){vB('xWashB',s*cc,P+H1,0,cw,.6,2*HZ-2*T,0,wash);vB('qLacqB',s*cc,P+H1-.12,0,cw,.12,2*HZ-2*T,0,night);
  for(let i=0;i<64;i++){const x=s*(CX+.4+rr(0,cw-.8)),z=rr(-HZ+T+.4,HZ-T-.4),k=rr(.06,.16);kput('xGoldB',[x,P+H1-.13,z],qEuler(0,rng()*TAU,0),[k,.02,k],g);}}
 for(const s of[-1,1]){vB('xWashB',0,P+H1,s*(24+(HZ-T-24)/2),2*CX,.6,HZ-T-24,0,wash);vB('qLacqB',0,P+H1-.12,s*(24+(HZ-T-24)/2),2*CX,.12,HZ-T-24,0,night);}
 const CW=.5,CL=48;
 for(const s of[-1,1]){vB('xWashB',s*(CX+CW/2),P+H1+.6,0,CW,H2-H1-.6,CL,0,blue);
  for(let z=-22.5;z<=22.5;z+=3){vB('adAzureB',s*(CX+CW/2),P+H1+1.6,z,CW+.08,2.0,1.4,0);adLamp(s*(CX-.2),P+H1+2.6,z,'pane');}}   /* the clerestory's panes */
 for(const s of[-1,1])vB('xWashB',0,P+H1+.6,s*(CL/2-CW/2),2*CX+2*CW,H2-H1-.6,CW,0,blue);
 vB('xWashB',0,P+H2,0,2*CX+2*CW,.5,CL,0,wash);vB('qLacqB',0,P+H2-.1,0,2*CX,.1,CL-2*CW,0,night);
 for(let i=0;i<40;i++){const k=rr(.08,.2);kput('xGoldB',[rr(-CX+.3,CX-.3),P+H2-.11,rr(-CL/2+1,CL/2-1)],qEuler(0,rng()*TAU,0),[k,.02,k],g);}
 for(const s of[-1,1]){vB('xWashB',s*(CX+CW-.15),P+H2+.5,0,.3,.6,CL,0,blue);vB('xBandB',s*(CX+CW+.02),P+H2+.6,0,.12,.3,CL+.1,0,band);}
 for(const s of[-1,1])vB('vWood',s*3,P+H1-.42,0,.32,.4,2*HZ-2*T,0,dark);   /* the beams along the walk's column lines: the clerestory stands on them */
 // the parapets of the bay roofs
 for(const s of[-1,1]){vB('xWashB',s*(HX-.2),P+H1+.6,0,.4,.75,2*HZ,0,blue);vB('xWashB',s*(CX+.15),P+H1+.6,0,.3,.4,2*HZ-2*T,0,wash);}
 for(const s of[-1,1])vB('xWashB',0,P+H1+.6,s*(HZ-.2),2*HX,.75,.4,0,blue);
 // the columns: painted red, saffron capitals, on the 3 m grid
 for(let z=24;z>=-24;z-=3)for(const x of[-12,-9,-6,-3,3,6,9,12])xnCol(x,P,z,H1-.4,.21,0,red,sf);
 // the cots: the east side (the women's) turnings 1-4 from the foot, the west (the men's) 5-8 from the head back
 for(const s of[1,-1])for(let k=0;k<A.bays;k++)for(let b=0;b<4;b++)for(const e of[-1,1]){
  const zc=22.5-3*k+e*.72,xc=s*(4.5+3*b),turn=s>0?1+(k>>2):8-(k>>2);
  vB('vWood',xc,P+.06,zc,1.95,.3,.8,0,tim);vB('vClothB',xc,P+.36,zc,1.88,.06,.74,0,straw);   /* the frame; the reed (tul) mat */
  const occ=rng()<.62;vB('vClothB',xc-s*.22,P+.42,zc,1.4,occ?.24:.06,.78,0,indigo);   /* the blanket, toward the foot; a sleeper under it */
  vB('vClothB',xc+s*.78,P+.42,zc,.3,.16,.66,0,cream);   /* the bolster, at the head: the outer wall */
  A.cots.push([xc,P+.42,zc,turn,occ?1:0]);}
 // the turnings' screens: low, painted blue with a gilt syllable plaque, at each end of each turning, from the walk's edge out
 for(const s of[-1,1])for(let k=0;k<=4;k++){const z=24-12*k;vB('qLacqB',s*9.6,P+.06,z,10.8,1.2,.08,0,blue);vB('qGiltB',s*9.6,P+.7,z,.4,.4,.12,0,g);}
 // the lattice down the walk (the women's side and the men's), the azure lamps in their floor niches either side of it
 vB('vWood',0,P+.06,0,.1,.1,48,0,dark);vB('vWood',0,P+1.08,0,.1,.08,48,0,dark);
 for(let z=-24;z<=24;z+=.4)vB('vWood',0,P+.16,z,.05,.92,.05,0,dark);
 vB('vClothB',0,P+.06,0,6,.02,2*(HZ-T),0,felt);   /* the felt runner */
 for(let z=22.5;z>=-22.5;z-=3)for(const s of[-1,1]){vB('vStone',s*1.5,P+.06,z,.42,.1,.42,0,stone);vB('adAzureB',s*1.5,P+.16,z,.3,.05,.3,0);adLamp(s*1.5,P+.4,z,'azure');}
 for(const z of[18,6,-6,-18])for(const s of[-1,1]){const bz=xC(0x8a6a3a);kput('xDrumS',[s*2.3,P+.06,z],null,[.2,.85,.2],bz);kput('xConeG',[s*2.3,P+.9,z],null,[.24,.3,.24],bz);}   /* the censers */
 // the head: the Lulling dais and its dulcimer, the Damsel's shrine against the head wall, her gold lamp, the Wheel above
 const zh=-HZ+T;vB('qLacqB',0,P+.06,-25.6,5,.32,2.2,0,red);vB('vClothB',0,P+.38,-25.1,.8,.12,.8,0,sf);
 for(const s of[-1,1])vB('vWood',s*.4,P+.38,-25.9,.05,.5,.05,0,dark);vB('qGiltB',0,P+.88,-25.9,1.0,.07,.42,0,g);vB('vWood',0,P+.95,-25.9,.92,.03,.36,0,tim);   /* the ḍalsimar on its stand */
 vB('qLacqB',0,P+.06,zh+.7,3.6,1.0,1.2,0,red);kput('xDiscG',[0,P+1.06,zh+.75],null,[.8,.22,.8],g);
 kput('qGiltBall',[0,P+1.62,zh+.7],null,[.5,.72,.42],g);vBall('qGiltBall',0,P+2.36,zh+.72,.19,g);kput('qGiltBall',[0,P+2.38,zh+.42],null,[.58,.58,.04],g);   /* the Damsel: robe, head, halo */
 vB('qGiltB',0,P+1.55,zh+1.0,.86,.07,.36,0,g);   /* her dulcimer on her lap */
 vB('vWinLit',0,P+1.06,zh+1.5,.14,.18,.14,0);adLamp(0,P+1.5,zh+1.6,'gold');   /* the gold lamp, never out */
 for(const sx of[-1,1])vPst('vPostB',sx*1.7,P+1.06,zh+1.2,.07,2.6,red);vB('qGiltB',0,P+3.66,zh+.7,3.6,.12,1.2,0,g);   /* the canopy */
 qnWheel(0,P+5.3,zh+.06,0,1.3,g);   /* clear of the canopy (its top at +3.8) */
 // the foot: the Porlock Screen (two felt curtains, staggered, 2 m apart), the keepers' station (west) and the blanket store
 // (east), the Foot Gallery over them at +4 m
 vB('vClothB',-.5,P+.06,HZ-T-.6,2.6,3.4,.1,0,felt);vB('vClothB',.5,P+.06,HZ-T-2.6,2.6,3.4,.1,0,felt);
 vB('vWood',-9,P+.06,26,2.2,.75,.8,0,tim);vB('vWood',-9,P+.06,27.1,1.6,.45,.4,0,tim);for(const x of[-13,-5])vB('vWood',x,P+.06,27.4,1.4,1.6,.4,0,dark);   /* desk, bench, the tablet racks */
 for(let i=0;i<5;i++)vB('vWood',5+i*2,P+.06,27,1.2,.7,.8,0,tim);
 vB('vWood',0,P+4,26.2,2*(HX-T),.22,4.4,0,tim);vB('vWood',0,P+5.0,24.05,2*(HX-T),.08,.08,0,dark);for(let x=-14.5;x<=14.5;x+=.5)vB('vWood',x,P+4.22,24.05,.05,.8,.05,0,dark);
 for(const s of[-1,1])for(const z of[24.2,28])vPst('vPostB',s*14.6,P+.06,z,.14,3.94,dark);
 // the lantern over the shrine: a blue cube on the head bays' roof, its gilt crown, the gold lamp seen through its south pane
 const ly=P+H1+.6,lz=-HZ+T+3.4,lt=ly+3.2;qnCube(0,ly,lz,6,3.2,5,0,blue,'wash');vB('vWinLit',0,ly+1.0,lz+2.47,2.2,1.4,.08,0);
 const lr=qnRoof(0,lt,lz,6*.98,5*.98,0,blue,{band,parapet:.5});qnCrown(0,lr,lz,6*.98,5*.98,0,{pav:[4.4,3.6],deerS:.8});
 // the kora: posts on the plinth's edge every 3.2 m, a lean-to roof from the wall out, the wheels along the long walls (48 a
 // side, two runs), the hall's great wheel behind the head, prayer flags
 const KX=20.6,KZ=32.6,KY=P+3.4;
 for(const s of[-1,1]){for(let z=-KZ+1.6;z<=KZ-1.6;z+=3.2)vPst('vPostB',s*KX,P,z,.15,KY-P,red);
  vB('xWashB',s*(HX+(KX+.4-HX)/2),KY,0,KX+.4-HX,.28,2*KZ,0,wash);vB('xWashB',s*(KX+.3),KY-.5,0,.2,.6,2*KZ,0,blue);
  for(const z of[-13,13])qnDrums(s*(HX+.32),P,z,s*Math.PI/2,14.9);}
 for(const s of[-1,1]){for(let x=-KX;x<=KX;x+=3.2){if(s>0&&Math.abs(x)<2.5)continue;vPst('vPostB',x,P,s*KZ,.15,KY-P,red);}
  vB('xWashB',0,KY,s*(HZ+(KZ+.4-HZ)/2),2*HX,.28,KZ+.4-HZ,0,wash);vB('xWashB',0,KY-.5,s*(KZ+.3),2*KX+.6,.6,.2,0,blue);}
 kput('xDrumS',[0,P,-31],null,[1.6,.35,1.6],stone);kput('qSongDrum',[0,P+.35,-31],null,[1.3,2.6,1.3],null);
 for(const t of[.35,1.65,2.95])kput('xDrumS',[0,P+t,-31],null,[1.36,.14,1.36],g);kput('xDomeT',[0,P+2.95,-31],null,[1.3,.45,1.3],red);
 for(const s of[-1,1])qnFlags([s*KX,KY+.3,KZ],[s*(CX+CW),P+H2+.8,CL/2]);
 xnFolk(0,0,HZ+7,4,4);}
QB.def({key:'qb_ad_dream_hall',name:'Hall of Dreaming',family:'The Azure Dream',tags:QTAG('civic',['religious','tavern/inn'],{job:'worship',note:'256 cots in eight turnings, the women\'s side east, the men\'s west (settlements/azure-dream PLAN.md section 5)'}),w:42,d:72,h:24,fw:42,fd:66,nv:1,build:buildAdDreamHall});

// ---------------------------------------------------------------- the waking range: the Waking Gallery, the scribes, the Register
// One two-storey range west of the hall's foot (PLAN.md section 5, sheet H1): the wakers come in at its front (+z, the Readers'
// Court) from the hall's Waking Door; the gallery's sixteen booths, eight a side, the scribes' room and the Register's stacks
// behind; the scribes' dormitory and the old books above. The ground storey wash, the upper the Order's blue.
function buildAdWaking(G,o){reseed(34011);const W=30,D=58,P=.8,stone=xC(xPick(QSTONE)),wash=xC(xPick(XPAL.wash)),blue=xC(AD_BLUE),band=xC(AD_BAND);
 vnReg('The Waking Gallery and the Register',0,0,33,P+9);
 qnPlinth(0,0,W,D,P,0,stone);const S1=qnStack(0,P,0,W,D,0,[3.6],wash,'wash'),S2=qnStack(0,S1.y,0,S1.w,S1.d,0,[3.2],blue,'wash');
 qnWins(0,P,0,W,D,0,[3.6,3.2],S2.k,{pitch:3,ww:.75,wh:1.0,kind:'glass',trim:blue,skip:[[-2.4,2.4]]});
 qnDoor(0,P,D/2,0,1.8,2.6,{c:xC(XPAL.red),valC:blue});
 qnRoof(0,S2.y,0,S2.w,S2.d,0,blue,{band,parapet:.7});
 xnFolk(0,0,D/2+3,2,3);}
QB.def({key:'qb_ad_waking',name:'The Waking Gallery and the Register',family:'The Azure Dream',tags:QTAG('civic',['religious','civic'],{job:'scribing',note:'the dream told to a scribe before any other word; the archive of dreams'}),w:30,d:60,h:10,fw:30,fd:58,nv:1,build:buildAdWaking});

// ---------------------------------------------------------------- the cup house
// where the dream cup is poured at dusk (honey, milk and steeped blue lotus: the owner, 2026-11-16), and the robing room
// beside it: a small two-storey cube, prayer flags to a pole
function buildAdCupHouse(G,o){reseed(34021);const W=14,D=12,P=.6,stone=xC(xPick(QSTONE)),wash=xC(xPick(XPAL.wash)),blue=xC(AD_BLUE),band=xC(AD_BAND);
 vnReg('The Cup House',0,0,8,P+8);
 qnPlinth(0,0,W,D,P,0,stone);const S1=qnStack(0,P,0,W,D,0,[3.4],wash,'wash'),S2=qnStack(0,S1.y,0,S1.w,S1.d,0,[3.0],blue,'wash');
 qnWins(0,P,0,W,D,0,[3.4,3.0],S2.k,{pitch:2.6,kind:'lit',trim:blue,skip:[[-1.6,1.6]]});qnDoor(0,P,D/2,0,1.6,2.5,{c:xC(XPAL.red),valC:blue});
 const t=qnRoof(0,S2.y,0,S2.w,S2.d,0,blue,{band,parapet:.6});
 vPst('vPost',W/2+1.4,0,D/2-1,.06,t+1.5,xC(0x5a4632));qnFlags([W/2+1.4,t+1.4,D/2-1],[-W/2+.4,t,-D/2+.4]);}
QB.def({key:'qb_ad_cup_house',name:'The Cup House',family:'The Azure Dream',tags:QTAG('civic',['religious']),w:18,d:14,h:9,fw:14,fd:12,nv:1,build:buildAdCupHouse});
