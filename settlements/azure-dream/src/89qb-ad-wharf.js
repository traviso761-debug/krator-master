// ================================================================= GRĒṬ-ĀIL — the fishermonks' wharf (prefix ad)
// settlements/azure-dream/PLAN.md section 4a, sheet W. The Order's fishermonks fish the lake the Atitlán way, from dugouts
// with nets and lines, and by night with lamps (the owner, 2026-11-16: "fish without qualm; night fishing is fine"). The
// pieces: the mole and its wave-wheel shrine, the jetties, the boathouse, the net and fish racks, the smokehouse (the lake has
// no salt near it, so the catch keeps by smoke), the ropewalk, the fishermonks' own house, the dugout and the Order's barge.
// On the Qiblai kit's contract (QB.def; 89qa's AD_BLUE, AD_BAND, adLamp). Seeds 34041-34131. Water pieces stand with o.y the
// lake's level (0 on the page): their decks and hulls are set from it.

// a dugout (cayuco): one hollowed trunk, its ends drawn to points, its dark well, a paddle across it; along local z, base at y
function adDugout(x,y,z,ry,L,c){c=c||xC(xPick([0x5a3e28,0x6a4a30,0x4a3220]));const P=(u,v)=>loc(x,z,u,v,ry),w=Math.max(.55,L*.12);
 vB('vWood',x,y,z,w,.42,L*.7,ry,c);
 for(const s of[-1,1]){const q=P(0,s*L*.35);kput('xConeP',[q[0],y+.21,q[1]],qEuler(s*Math.PI/2,ry,0),[w,L*.15,.42],c);}
 vB('vDarkB',x,y+.42,z,w*.72,.02,L*.62,ry,xC(0x2a1e14));
 const p=P(0,L*.1);vB('vWood',p[0],y+.44,p[1],w*1.9,.03,.12,ry+.2,xC(0xa88858));}
function buildAdDugout(G,o){reseed(34041+(o.v|0));const L=o.len==null?[4.4,5.6,6.8][xV(o)%3]:o.len;
 vnReg('Dugout',0,0,L/2+.3,1);adDugout(0,0,0,0,L);}
QB.def({key:'qb_ad_dugout',name:'Dugout (cayuco)',family:'The Azure Dream — the wharf',tags:QTAG('poor',['infrastructure'],{note:'a fishermonk\'s dugout: one trunk of the isle\'s dawn redwood'}),w:1.4,d:7,h:1,fw:1,fd:7,nv:3,build:buildAdDugout});

// ---------------------------------------------------------------- the mole and its wave-wheel shrine
// a stone mole o.len long (54) along local +z from the shore out into the cove, its top 1.5 m over the water, paved, bollards
// on the east edge where the barge lies; at its head a platform with the wave wheel (a prayer wheel turned by a paddle wheel
// in the swell: "on a still night it stops, and the fishermonks say the lake is dreaming") and the cove's light
function buildAdMole(G,o){reseed(34051);const L=o.len==null?54:o.len,stone=xC(xPick(QSTONE)),dark=xC(0x3a2c22),g=xC(xPick(XPAL.gold)),tim=xC(xPick(XPAL.timber)),hz=L/2+4;
 vnReg('The mole and the wave-wheel shrine',0,0,L/2+9,8);
 vB('vStone',0,-6,0,6,7.5,L,0,stone);qnPave(0,0,5.6,L,0,1.5);
 vB('vStone',0,-6,hz,9,7.5,8,0,stone);qnPave(0,hz,8.6,7.6,0,1.5);
 for(let z=-L/2+3;z<=L/2;z+=6)vPst('vPostB',2.7,1.5,z,.16,.7,dark);
 // the wave wheel: a drum on a post at the head, its paddle wheel in the water off the east side
 vPst('vPostB',0,1.5,hz,.16,3.3,dark);kput('qSongDrum',[0,2.3,hz],null,[.42,1.2,.42],null);for(const t of[2.3,3.0,3.5])kput('xDrumS',[0,t,hz],null,[.45,.06,.45],g);
 kput('xDomeT',[0,3.5,hz],null,[.42,.25,.42],xC(XPAL.red));
 for(let i=0;i<8;i++){const a=i*Math.PI/4;kput('vWood',[4.9,.5+Math.sin(a)*.9,hz+Math.cos(a)*.9],qEuler(a,0,0),[.6,1.3,.08],tim);}
 vB('vWood',4.6,1.1,hz,.9,.18,.18,0,dark);
 // the light: an oil lantern on a post at the head's corner
 vPst('vPost',-3.4,1.5,hz+3.2,.08,3.6,dark);vB('vWood',-3.4,5.0,hz+3.2,.5,.08,.5,0,dark);vB('vWinLit',-3.4,4.55,hz+3.2,.28,.4,.28,0);adLamp(-3.4,4.7,hz+3.2,'oil');
 qnFlags([-3.4,5.1,hz+3.2],[0,3.8,hz]);}
QB.def({key:'qb_ad_mole',name:'The mole and the wave-wheel shrine',family:'The Azure Dream — the wharf',tags:QTAG('civic',['infrastructure','religious']),w:10,d:66,h:6,fw:9,fd:62,nv:1,build:buildAdMole});

// ---------------------------------------------------------------- a jetty
// timber on piles, o.len long (40) along local +z out from the shore, its deck 1 m over the water, mooring posts, a lamp post
// at its head (each night boat's lamp hangs on its post by day)
function buildAdJetty(G,o){reseed(34061+(o.v|0));const L=o.len==null?40:o.len,tim=xC(xPick(XPAL.aged)),dark=xC(0x3a2c22);
 vnReg('Jetty',0,0,L/2+1,3);
 vB('vWood',0,.9,0,3,.2,L,0,tim);for(let z=-L/2+1;z<=L/2;z+=3)for(const s of[-1,1])vPst('vPostB',s*1.4,-3.5,z,.13,4.6,dark);
 for(let z=-L/2+4;z<=L/2;z+=6)vPst('vPost',1.75,-.5,z,.1,2.2,dark);
 vPst('vPost',-1.2,1.1,L/2-.6,.07,3,dark);vB('vWinLit',-1.2,3.6,L/2-.6,.24,.34,.24,0);adLamp(-1.2,3.75,L/2-.6,'oil');}
QB.def({key:'qb_ad_jetty',name:'Fishermonks\' jetty',family:'The Azure Dream — the wharf',tags:QTAG('poor',['infrastructure']),w:4,d:42,h:4,fw:3,fd:40,nv:3,build:buildAdJetty});

// ---------------------------------------------------------------- the boathouse
// a Qiblai cube on the shore, 46 x 30, its lake face (+z) open in four bays with timber slips running down into the water,
// a loft over the back half for sails and paddles; dugouts in the slips. o.y is the slips' head (the shore's level): the back
// stands on the plinth, the front's piers stand down into the water
function buildAdBoathouse(G,o){reseed(34071);const W=46,D=30,P=.8,H=6.2,wash=xC(xPick(XPAL.wash)),blue=xC(AD_BLUE),band=xC(AD_BAND),stone=xC(xPick(QSTONE)),tim=xC(xPick(XPAL.timber)),dark=xC(0x3a2c22);
 vnReg('Boathouse',0,0,28,P+H+2);
 vB('vStone',0,-2.5,-D/4,W,2.5+P,D/2,0,stone);   /* the back half's footing */
 qnCube(0,P,-D/2+.4,W,H,.8,0,wash,'wash');for(const s of[-1,1])qnCube(s*(W/2-.4),-2.5,0,.8,H+P+2.5,D,0,wash,'wash');
 for(const x of[-11.5,0,11.5])qnCube(x,-2.5,0,1.2,H+P+2.5,D,0,wash,'wash');   /* the piers between the four bays */
 vB('xWashB',0,P+H-1.2,D/2-.4,W,1.2,.8,0,blue);vB('vWood',0,P+H-1.6,D/2-.2,W,.4,.5,0,dark);   /* the front's lintel under the blue */
 vB('vWood',0,P+3.4,-D/4,W-1.6,.2,D/2-.8,0,tim);   /* the loft */
 const top=qnRoof(0,P+H,0,W,D,0,wash,{band,parapet:.6});
 for(let b=0;b<4;b++){const x=-17.25+11.5*b;kput('vWood',[x,P-1.6,2],qEuler(.12,0,0),[3.2,.2,D-4],tim);adDugout(x-1.5,P-1.25,1,0,6.2);if(b%2)adDugout(x+1.6,P-1.05,-2,0,5.4);}
 qnWins(0,P,0,W,D,0,[H],1,{front:false,pitch:3.5,ww:.7,wh:.8,kind:'glass',trim:blue,from:0});
 for(let i=0;i<6;i++)vB('vWood',-W/2+2+i*.5,P+3.6,-D/2+1.4,.12,2.4,.12,.3,xC(0xa88858));   /* paddles stood in the loft */
 qnFlags([-W/2+.4,top,D/2-.4],[W/2-.4,top,D/2-.4]);}
QB.def({key:'qb_ad_boathouse',name:'Boathouse',family:'The Azure Dream — the wharf',tags:QTAG('poor',['infrastructure','industry']),w:46,d:30,h:8,fw:46,fd:30,nv:1,build:buildAdBoathouse});

// ---------------------------------------------------------------- the racks: nets (o.v 0) and fish (o.v 1)
// a field o.w x o.d (64 x 30): nets on pole frames, rows 4 m apart, posts every 3 m, the nets hung over the top rail (the port
// kit's hbNetRack is the form); or the fish racks, A-frames with two rails and split fish hung by the tail
function buildAdRacks(G,o){reseed(34081+(o.v|0));const V=xV(o)%2,W=o.w==null?64:o.w,D=o.d==null?30:o.d,tim=xC(xPick(XPAL.aged)),dark=xC(0x3a2c22);
 vnReg(V?'Fish-drying racks':'Net racks',0,0,Math.hypot(W,D)/2,3);
 if(!V){const net=[0x3a4a3a,0x4a4030,0x2e3a40];
  for(let z=-D/2+2;z<=D/2-2;z+=4){for(let x=-W/2+1;x<=W/2-1;x+=3)vPst('vPost',x,0,z,.06,2.4,dark);vB('vWood',0,2.3,z,W-1.6,.06,.06,0,tim);
   for(let x=-W/2+2.5;x<=W/2-2.5;x+=3)if(rng()<.8)vB('vClothB',x,.9,z,2.7,1.4,.04,0,xC(xPick(net)));}
  for(let i=0;i<5;i++)vB('vClothB',rr(-W/2+3,W/2-3),0,rr(-D/2+2,D/2-2),rr(1.4,2.4),.35,rr(1,1.8),rr(0,3),xC(xPick(net)));}   /* nets heaped to mend */
 else{const fish=[0xb8bcc0,0xa8a49a,0xc8c4b8];
  for(let z=-D/2+2;z<=D/2-2;z+=4)for(const s of[-1,1])vPst('vPost',s*(W/2-.6),0,z,.07,2.1,dark);   /* each row's end posts, for the guy lines */
  for(let z=-D/2+2;z<=D/2-2;z+=4)for(let x=-W/2+4;x<=W/2-4;x+=8){
   for(const s of[-1,1]){const fx=x+s*3.6;kput('vWood',[fx,1.0,z],qEuler(0,0,.35),[.08,2.2,.08],dark);kput('vWood',[fx,1.0,z],qEuler(0,0,-.35),[.08,2.2,.08],dark);}
   for(const e of[-1,1]){vB('vWood',x,1.9,z+e*.25,7.6,.05,.05,0,tim);for(let k=0;k<18;k++)vB('vClothB',x-3.4+k*.4,1.45,z+e*.25,.05,.42,.12,0,xC(xPick(fish)));}}}}
QB.def({key:'qb_ad_racks',name:'Net and fish racks',family:'The Azure Dream — the wharf',tags:QTAG('poor',['industry']),w:64,d:30,h:3,fw:64,fd:30,nv:2,build:buildAdRacks});

// ---------------------------------------------------------------- the smokehouse
// rubble walls, a timber upper with slatted vents, a flat roof with a raised smoke louvre, a low door, split wood stacked
function buildAdSmokehouse(G,o){reseed(34091+(o.v|0));const W=10,D=13,tim=xC(xPick(XPAL.aged)),dark=xC(0x3a2c22),wash=xC(xPick(XPAL.wash)),rub=xC(xPick(XPAL.rubble));
 vnReg('Smokehouse',0,0,8.5,6);
 qnCube(0,0,0,W,2.6,D,0,rub,'stone');vB('vWood',0,2.6,0,W*.96,1.6,D*.96,0,tim);for(let z=-D/2+1;z<D/2;z+=1)for(const s of[-1,1])vB('vDarkB',s*W*.48,3.0,z,.04,.8,.5,0,dark);
 vB('xWashB',0,4.2,0,W,.35,D,0,wash);vB('vWood',0,4.55,0,2.4,.9,3.6,0,dark);vB('xWashB',0,5.45,0,3,.18,4.2,0,wash);
 vB('vDarkB',0,0,D/2+.02,1.1,1.8,.06,0,dark);
 for(let i=0;i<14;i++)vB('vWood',W/2+.8,(i%4)*.3,-D/2+1.5+(i>>2)*.6,1.4,.26,.26,0,xC(xPick([0x8a6a48,0x7a5a3c])));}
QB.def({key:'qb_ad_smokehouse',name:'Smokehouse',family:'The Azure Dream — the wharf',tags:QTAG('poor',['industry']),w:12,d:14,h:6,fw:10,fd:13,nv:2,build:buildAdSmokehouse});

// ---------------------------------------------------------------- the ropewalk
// a covered walk o.len long (180) along local x, 6 m wide: a plank roof on posts every 6 m, T-posts down the middle carrying
// the strands, the spinning wheel at its head (-x)
function buildAdRopewalk(G,o){reseed(34101);const L=o.len==null?180:o.len,W=6,tim=xC(xPick(XPAL.aged)),dark=xC(0x3a2c22),rope=xC(0xc8b07a);
 vnReg('Ropewalk',0,0,L/2+2,3.4);
 for(let x=-L/2;x<=L/2+.01;x+=6)for(const s of[-1,1])vPst('vPostB',x,0,s*(W/2),.12,2.7,dark);
 vB('vWood',0,2.7,0,L+.6,.14,W+1,0,tim);for(const s of[-1,1])vB('vWood',0,2.6,s*(W/2+.4),L+.6,.1,.3,0,dark);
 for(let x=-L/2+6;x<L/2;x+=6){vPst('vPost',x,0,0,.05,1.15,dark);vB('vWood',x,1.1,0,.08,.08,1.2,0,dark);}
 for(const z of[-.35,0,.35])vB('vClothB',0,1.18,z,L-6,.03,.03,0,rope);
 const hx=-L/2+1.2;vB('vWood',hx,0,0,.8,.2,2.2,0,dark);kput('vHoop',[hx,1.3,0],qEuler(0,Math.PI/2,0),[.7,.7,.7],dark);vPst('vPost',hx,0,-.9,.06,1.6,dark);}
QB.def({key:'qb_ad_ropewalk',name:'Ropewalk',family:'The Azure Dream — the wharf',tags:QTAG('poor',['industry']),w:184,d:8,h:3.4,fw:180,fd:7,nv:1,build:buildAdRopewalk});

// ---------------------------------------------------------------- the fishermonks' house
// the fifty fishermonks keep night hours, so they live by their boats: a small cloister, 70 x 44, its back range the refectory and
// the chapel (two storeys), its two side ranges the cells, its front a low wall with the gate toward the lake (+z); in the court
// a lake wheel turning in a basin; the upper storeys in the Order's blue, the chapel's wheel and deer the one gilt
function buildAdFishermonks(G,o){reseed(34111);const W=70,D=44,Dr=8,P=.8,hs=[3.4,3.0],wash=xC(xPick(XPAL.wash)),blue=xC(AD_BLUE),band=xC(AD_BAND),stone=xC(xPick(QSTONE)),g=xC(xPick(XPAL.gold)),red=xC(XPAL.red);
 vnReg('The fishermonks\' house',0,0,42,P+11);
 qnPlinth(0,0,W,D,P,0,stone);
 const range=(x,z,w,d,ry,ndoor)=>{const S1=qnStack(x,P,z,w,d,ry,[hs[0]],wash,'wash'),S2=qnStack(x,S1.y,z,S1.w,S1.d,ry,[hs[1]],blue,'wash');
  qnWins(x,P,z,w,d,ry,hs,S2.k,{pitch:2.8,ww:.7,wh:.95,kind:'glass',trim:blue,back:false});qnRoof(x,S2.y,z,S2.w,S2.d,ry,blue,{band,parapet:.6});
  for(let i=0;i<ndoor;i++){const u=(i+.5)/ndoor*w-w/2,p=loc(x,z,u,d/2,ry);qnDoor(p[0],P,p[1],ry,1.2,2.2,{c:red,val:false,step:false});}return S2;};
 const B=range(0,-D/2+Dr/2,W,Dr,0,3);for(const s of[-1,1])range(s*(W/2-Dr/2),Dr/2-1,Dr,D-Dr-2,-s*Math.PI/2,4);
 // the chapel: the back range's middle raised a storey, the wheel and deer on its front
 const cy=qnCube(0,B.y+.6,-D/2+Dr/2,12,3.2,Dr*.9,0,blue,'wash');const ct=qnRoof(0,B.y+.6+3.2,-D/2+Dr/2,12*.98,Dr*.88,0,blue,{band,parapet:.5});qnWheelDeer(0,ct,-D/2+Dr*.85,0,.9,g);
 // the front wall and its gate, the court paved, the lake wheel in its basin
 for(const s of[-1,1])vB('xWashB',s*(W/4+2),P,D/2-.4,W/2-4,2.2,.6,0,wash);qnDoor(0,P,D/2-.1,0,3,2.6,{c:red,valC:blue,step:false});
 qnPave(0,D/2-Dr-4,W-2*Dr-2,D-Dr-10,0,P);vB('vStone',0,P,2,4.4,.5,4.4,0,stone);vB('xWaterB',0,P+.45,2,3.8,.04,3.8,0,xC(XPAL.water));
 kput('qSongDrum',[0,P+.5,2],null,[.6,1.6,.6],null);kput('xDomeT',[0,P+2.1,2],null,[.62,.3,.62],red);
 xnFolk(0,P,6,5,8);}
QB.def({key:'qb_ad_fishermonks',name:'The fishermonks\' house',family:'The Azure Dream — the wharf',tags:QTAG('civic',['religious','multi-family dwelling']),w:72,d:46,h:12,fw:70,fd:44,nv:1,build:buildAdFishermonks});

// ---------------------------------------------------------------- the Order's barge
// the ferry from Erehwon, daily, about four hours under sail and oar: 22 m, a lateen sail, eight oars, forty pilgrims on its
// benches, a cloth shelter at the stern; the hull in the Order's blue. o.y the water
function buildAdBarge(G,o){reseed(34121);const L=22,W=6.2,blue=xC(AD_BLUE),tim=xC(xPick(XPAL.timber)),dark=xC(0x3a2c22),sail=xC(0xeae2d0);
 vnReg('The Order\'s barge',0,0,L/2+2,12);
 vB('xPaint',0,-.7,0,W,1.6,L-4,0,blue);for(const s of[-1,1])kput('xConeP',[0,.1,s*(L/2-2)],qEuler(s*Math.PI/2,0,0),[W,4,1.6],blue);
 vB('xPaint',0,.85,0,W+.1,.14,L-4,0,xC(AD_BAND));vB('vWood',0,.6,0,W-.6,.1,L-5,0,tim);
 for(let i=0;i<8;i++)vB('vWood',0,.7,-L/2+4.5+i*1.7,W-1,.12,.36,0,tim);
 for(const s of[-1,1])for(let i=0;i<4;i++){const z=-L/2+6+i*3;kput('vWood',[s*(W/2+1.6),.2,z],qEuler(0,0,s*.35),[4.2,.1,.18],tim);}
 vPst('vPostB',0,.7,-L/6,.18,9.5,dark);kput('vWood',[0,7.2,-L/6],qEuler(-.85,0,0),[.16,.16,15],dark);
 kput('vClothB',[.15,5.4,-L/6+1.6],qEuler(-.85,0,0),[.04,6.4,9],sail);kput('vClothB',[.17,6.2,-L/6+1.6],qEuler(-.85,0,0),[.05,.5,9],blue);
 for(const s of[-1,1])vPst('vPost',s*1.6,.7,L/2-4,.05,2.2,dark);vB('vClothB',0,2.9,L/2-4.6,3.6,.06,2.2,0,sail);
 xnFolk(0,.7,0,6,2.2);}
QB.def({key:'qb_ad_barge',name:'The Order\'s barge',family:'The Azure Dream — the wharf',tags:QTAG('civic',['infrastructure'],{note:'the ferry from Erehwon: 40 pilgrims, sail and oar'}),w:12,d:24,h:12,fw:7,fd:22,nv:1,build:buildAdBarge});
