// ================================================================= DALAB — the sacred: temples, priests' houses, the mounds, a shrine
// The priests commune with The God from the tops of dome-shaped earth mounds built in imitation of the Ancient
// domes. Each outlying settlement has one; the High Priest's is larger, ringed by an earthwork, and faces AWAY from
// the lab (the layout pass orients them; here the front is +z and the stair climbs it). On a mound stands a stone
// temple with a relief-carved trilithon door, a stepped cornice, a shingle pyramid, banners, an altar that burns at
// night, and two four-armed giant guards; beside it the priest's round stone house.

// the temple, at scale s, standing on the ground at (x,y,z) facing ry. Reusable by the mound builders.
function dnTemple(x,y,z,ry,s,o){o=o||{};const st=o.stoneC||dCol(DPAL.stone),sh=dCol(DPAL.shingle);const W=10*s,D=8*s,H=4.6*s;
 const L=(lx,lz)=>loc(x,z,lx,lz,ry);
 // stepped stone platform, three courses, stair down the front
 let yy=y;for(let k=0;k<3;k++){const o2=(2-k)*1.1*s;vB('vStone',x,yy,z,W+2*o2+2*s,.45*s,D+2*o2+2*s,ry,st.clone().multiplyScalar(.9));yy+=.45*s;}
 {const p=L(0,D/2+1.6*s+2.2*s);vnStairs(p[0],y,p[1],ry,3.4*s,yy-y,4,'vStone',st);}
 vB('vStone',x,yy,z,W,H,D,ry,st);
 {const f=L(0,D/2);dnReliefBand(f[0],yy+.3*s,f[1],ry,W-1.2*s,1.0*s,st);dnMuralBand(f[0],yy+H-2.0*s,f[1],ry,W-2.6*s,1.5*s);}
 for(const sd of[-1,1]){const f=L(sd*W/2,0);dnReliefBand(f[0],yy+.3*s,f[1],ry+sd*Math.PI/2,D-1.2*s,1.0*s,st);dnMuralBand(f[0],yy+H-2.0*s,f[1],ry+sd*Math.PI/2,D-2.6*s,1.5*s);}
 const c1=dnCornice(x,yy+H,z,W,D,ry,st,2);vB('vStone',x,c1,z,W-.6*s,.5*s,D-.6*s,ry,st.clone().multiplyScalar(.85));
 kput('vPyrSh',[x,c1+.5*s,z],ry?qEuler(0,ry,0):null,[W-1.4*s,3.2*s,D-1.4*s],sh);vPst('vPost',x,c1+3.4*s,z,.1*s,1.6*s,vC(0x5a4632));vBall('dGiltBall',x,c1+5.0*s,z,.32*s);
 {const g=L(0,D/2+.1);dnGate(g[0],yy,g[1],ry,2.0*s,3.2*s,st);const d=L(0,D/2);vnDoor(d[0],yy,d[1],ry,1.8*s,3.0*s,'vStone',st,vC(0x2a2a30),false);
  for(const lx of[-3.2*s,3.2*s]){const w=L(lx,D/2);if(o.lit!==false)dnGodWin(w[0],yy+1.6*s,w[1],ry,1.0*s,1.4*s,'vStone',st);else vnWin(w[0],yy+1.6*s,w[1],ry,1.0*s,1.4*s,'open','vStone',st);}
  for(const sd of[-1,1])for(const lz of[-2*s,2*s]){const w=L(sd*W/2,lz);if(o.lit!==false)dnGodWin(w[0],yy+1.6*s,w[1],ry+sd*Math.PI/2,1.0*s,1.4*s,'vStone',st);}
  for(const lx of[-2.3*s,2.3*s]){const l=L(lx,D/2);if(o.lit!==false)dnGodLamp(l[0],yy+3.9*s,l[1],ry);}}
 // banners at the platform corners, the altar, the giant guards, the priest
 for(const sd of[-1,1]){const p=L(sd*(W/2+2.6*s),D/2+2.6*s);dnBannerPole(p[0],y,p[1],ry,6.5*s,dCol(sd<0?DPAL.gold:DPAL.turq));}
 {const a=L(0,D/2+4.4*s+2.6*s);dnAltar(a[0],y,a[1],ry,st);}
 for(const sd of[-1,1]){const g=L(sd*2.4*s,D/2+3.8*s+2.6*s);dnGiant(g[0],y,g[1],ry+sd*.25,4,{spear:true});}
 {const p=L(1.2*s,D/2+6.5*s+2.6*s);dnPriest(p[0],y,p[1],ry+Math.PI);}
 return{top:c1+5.2*s,plat:yy};}
// the priest's house: a round stone house with a shingle cone, relief band, God-lit
function dnPriestHouse(x,y,z,ry,r){r=r||3.4;const st=dCol(DPAL.stone);
 dnRoundHouse(x,y,z,r,2.9,{wall:'dStoneDrum',wallC:st,roof:'shingle',rise:r*1.1,door:ry,doorW:1.1,doorH:2.1,frame:'vStone',win:[ry+Math.PI*.6,ry-Math.PI*.6],lit:true,band:'relief',wood:dCol(DPAL.wood),leafC:vC(0x2a2a30)});
 const p=dnOnRing(x,z,r,ry);dnGodLamp(p[0],y+2.5,p[1],ry);}

function buildDalabTemple(G,o){reseed(8601+(o.v|0));vnReg("Priests' temple",0,0,10,12);dnTemple(0,0,0,0,1,{});vnPaving(0,.02,12,6,4,0,dCol(DPAL.stone),8);dnFolk(0,15,3,2);}
function buildDalabPriestHouse(G,o){reseed(8611+(o.v|0));vnReg("Priest's house",0,0,5.5,8);dnPriestHouse(0,0,0,0,3.4);dnJar(4.6,0,1,.3);vnPaving(0,.02,5,2.6,2.4,0,dCol(DPAL.stone),4);dnPriest(1.5,0,6,Math.PI);}
// wayside shrine: a stele, a banner, an offering slab, a God-post
function buildDalabShrine(G,o){reseed(8621+(o.v|0));const st=dCol(DPAL.stone);vnReg('Wayside shrine',0,0,3.5,5,{type:['religious']});
 vB('vStone',0,0,0,4,.4,4,0,st.clone().multiplyScalar(.9));dnStele(0,.4,-.8,0,3.4,st);vB('vStone',0,.4,1.0,1.8,.5,.9,0,st);for(let k=0;k<4;k++)vBall('vGourd',-.6+k*.4,.9,1.0,.14,dCol([0xb08a4a,0x8a9a3a,0xc09a5a]),.18);
 dnBannerPole(-1.6,.4,-1.4,0,4.2,dCol(DPAL.red));dnGodPost(1.6,.4,-1.4,3.2);dnFolk(0,3.5,1,.5);}

// the ceremonial mound of an outlying settlement: r 30, plateau r 13, h 13; the temple and the priest's house on top;
// a stele-lined apron and a small plaza at the foot
function buildDalabMound(G,o){reseed(8631+(o.v|0));const R=30,RT=13,H=13;const st=dCol(DPAL.stone);
 vnReg('Ceremonial mound',0,0,R+4,H+14,{landmark:true});
 dnMound(0,0,R,RT,H,0,{stoneC:st});
 dnTemple(0,H,-3.5,0,.72,{stoneC:st});
 dnPriestHouse(-8.5,H,4.5,Math.PI*.6,2.6);
 for(let k=0;k<6;k++){const a=k/6*TAU+.3;if(Math.abs(a-Math.PI*.5)<.4||Math.abs(a-TAU+.3)<.5)continue;const p=dnOnRing(0,0,RT-.8,a);if(Math.abs(p[0])<3&&p[1]>4)continue;dnBannerPole(p[0],H,p[1],a,5.5,dCol([DPAL.red,DPAL.turq,DPAL.gold][k%3]));}
 // the plaza at the foot: paving, a stele pair, a fire, the folk gathering to watch the ceremony
 vnPaving(0,.02,R+9,16,8,0,st.clone().multiplyScalar(.92),18);dnFirePit(0,0,R+11,.9);dnFolk(0,R+9,6,4);dnPriest(0,H,RT+.5-1,0);}
// the High Priest's mound: r 46, plateau r 20, h 20 with a terrace ring; a greater temple and two halls on top; the
// ring earthwork (r 68, h 4.5, palisaded) with one entrance at the front
function buildDalabHighMound(G,o){reseed(8641+(o.v|0));const R=46,RT=20,H=20;const st=dCol(DPAL.stone);
 vnReg("High Priest's mound",0,0,R+4,H+18,{landmark:true,role:'high priest'});vnReg("High Priest's ring",0,0,74,6,{part:'wall',type:['religious','military']});
 dnMound(0,0,R,RT,H,0,{stoneC:st,terrace:{r:56,h:5}});
 dnTemple(0,H,-6,0,1.0,{stoneC:st});
 dnPriestHouse(-13,H,6,Math.PI*.55,3.2);dnPriestHouse(13,H,6,-Math.PI*.55,3.2);
 for(let k=0;k<8;k++){const a=k/8*TAU+.2;const p=dnOnRing(0,0,RT-1.2,a);if(Math.abs(p[0])<5&&p[1]>8)continue;if(p[1]<-12)continue;dnStele(p[0],H,p[1],a+Math.PI,2.8,st);}
 dnRingBank(0,0,68,4.5,9,0,10,{palisade:true});
 for(const s of[-1,1]){dnStele(s*7.5,0,68+6,0,3.6,st);dnGiant(s*4,0,68+3,s*.2,4,{spear:true});}
 vnPaving(0,.02,R+12,18,10,0,st.clone().multiplyScalar(.92),20);dnFirePit(0,0,R+14,1.0);dnFolk(0,R+11,6,5);
 dnFolk(0,62,4,3);}

dDef({key:'dalab_temple',name:"Priests' temple",family:'sacred',tags:{type:['religious','civic'],wealth:'priest',lit:true},w:26,d:30,h:14,build:buildDalabTemple});
dDef({key:'dalab_priest_house',name:"Priest's house",family:'sacred',tags:Object.assign({wealth:'priest',lit:true},{type:['single-family dwelling','religious']}),w:14,d:14,h:8,build:buildDalabPriestHouse});
dDef({key:'dalab_shrine',name:'Wayside shrine',family:'sacred',tags:{type:['religious'],wealth:'priest',lit:true},w:8,d:8,h:5,build:buildDalabShrine});
dDef({key:'dalab_mound',name:'Ceremonial mound',family:'sacred',tags:{type:['religious','civic'],wealth:'priest',lit:true,landmark:true},w:76,d:90,h:28,build:buildDalabMound});
dDef({key:'dalab_high_mound',name:"High Priest's mound",family:'sacred',tags:{type:['religious','civic'],wealth:'priest',lit:true,landmark:true,role:'high priest'},w:160,d:170,h:40,build:buildDalabHighMound});
