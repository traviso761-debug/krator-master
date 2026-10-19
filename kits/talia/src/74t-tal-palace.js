// ================================================================= 74t. TALIA: the governor's palace (PLAN.md section 5)
// The Izani governor's palace, massed on the owner's govpalace picture and laid out on its blueprint (kits/talia/palace:
// BLUEPRINT.md, floors/*.png; the programme is settlements/iziz/VASSAL-KITS.md section 3), built in Talia's style: a
// white marble terrace on a moulded base, the imperial front stair with lions on its newels, the hall block's two
// storeys of white arcades (Corinthian columns below, a slimmer Ionic arcade behind a balustrade above), a flat roof
// behind a balustrade; the great drum of lit arched windows between pilasters under an orange-tiled ribbed dome with
// gilt ribs, a white lantern with an orange cupola and a gilt finial; seven chhatri pavilions (arcaded drums on 8 to 12
// columns under melon domes, the two rear residence pavilions jali-screened above); the straight outside stair on the
// chancery flank landing under a small pediment; the walled forecourt with its gate. Civic: lit and gilt.
//
// The blueprint's frame (as Pylon's palace, kits/pylon/src/74p-pyl-palace.js): u along the axis from the forecourt gate
// (u = -36) to the rear wall (u = 38), v across, v > 0 on the left walking in. The building's local frame: +z is the
// front (the gate), so x = -v and z = 1 - u. Every position below is written in (u, v) and passed through TPP.
// Heights: the terrace 1.2 m, the ground storey 5.5 m (to 6.7), the upper 4.5 m (to 11.2); the drum to about 17, the
// dome to 24, the lantern to 27. The guard's barracks stand outside the grounds (the owner's fork): not in this def.
// Interiors (the blueprint's rooms) come with the kit's interior set (PLAN.md P6). Seeds 9691-9699.
const TPP=(u,v)=>[-v,1-u];
// ---------------------------------------------------------------- THE LION AND THE PAVILIONS
// a couchant lion on a newel, facing out along ry: a marble body, haunch, mane and head (refs talia (2): the stair's lions)
function talpLion(x,y,z,ry,s,c){const b=loc(x,z,0,-.12*s,ry),m=loc(x,z,0,.3*s,ry),h=loc(x,z,0,.46*s,ry),p=loc(x,z,0,.52*s,ry);
 vB('taMarble',b[0],y,b[1],.42*s,.36*s,.95*s,ry,c);kput('taBallM',[b[0],y+.34*s,b[1]],null,[.24*s,.2*s,.3*s],c);
 kput('taBallM',[m[0],y+.52*s,m[1]],null,[.28*s,.3*s,.24*s],c);kput('taBallM',[h[0],y+.62*s,h[1]],null,[.17*s,.18*s,.17*s],c);
 vB('taMarble',p[0],y,p[1],.36*s,.12*s,.3*s,ry,c);}
// a chhatri pavilion of radius R at blueprint (u, v): a round core with arched windows, a ring of n columns round it on
// each storey with a solid entablature ring and an orange band, a chhajja eave, a neck and a melon dome with gilt ribs.
// o = {n: columns (10), storeys (2), lit: true, jali: the upper storey screened (the residence), dome: 'tile' | 'cu',
// order: the lower order ('corinthian'), lantern: a small lantern on the dome (else a gilt finial), orb: the shrine's
// gilt orb on the finial}. Returns the dome's top y
function talpPavilion(u,v,R,o,C){const [x,z]=TPP(u,v),T=1.2,SH=[5.5,4.5],ns=(o.storeys==null?2:o.storeys),n=(o.n==null?10:o.n),rc=R-1.25,rcol=R-.4;
 const Htop=T+SH.slice(0,ns).reduce((a,b)=>a+b,0);vPst('taDrum',x,T,z,rc,Htop-T,C.wh);
 let y=T;for(let s=0;s<ns;s++){const h=SH[s],ch=h-.8,cr=s?Math.max(.17,R*.032):Math.max(.2,R*.042);
  for(let k=0;k<n;k++){const a=k/n*TAU;tanColumn(x+Math.sin(a)*rcol,y,z+Math.cos(a)*rcol,ch,cr,s?'ionic':(o.order||'corinthian'),C.mb,C.gi);}
  const ww=Math.min(1.5,TAU*rc/n*.5);
  for(let k=0;k<n;k++){const a=(k+.5)/n*TAU;
   tanArch(x+Math.sin(a)*rc,y+.4,z+Math.cos(a)*rc,a,ww,ch-.9,{fill:o.lit===false?'D':(s?'L':'G'),band:C.or,bw:.12,out:.05,kind:s?'cusp':'round',lobes:3});
   if(s&&o.jali){const L=2*rcol*Math.sin(Math.PI/n)-cr*2.6;tanJali(x+Math.sin(a)*rcol*Math.cos(Math.PI/n),y+.2,z+Math.cos(a)*rcol*Math.cos(Math.PI/n),a,L,ch-.5,C.wh,null,true);}}
  vPst('taDrum',x,y+ch,z,R,.8,C.wh);vPst('taDrum',x,y+ch+.3,z,R+.03,.2,C.or);
  y+=h;}
 vPst('taDrumM',x,Htop,z,R+.55,.14,C.mb);vPst('taDrum',x,Htop+.14,z,R*.62,.7,C.wh);
 const dc=o.dome==='cu'?null:C.tile;
 const top=tanDome(x,Htop+.84,z,R*.66,{kind:'melon',item:o.dome==='cu'?'taDomeCu':'taDome',c:dc,h:R*.72,ribs:12,ribItem:'taRibGi',ribC:C.gi,finial:o.lantern?null:C.gi,fr:Math.max(.12,R*.03)});
 if(o.lantern)return tanLantern(x,top-.08,z,Math.max(.45,R*.13),Math.max(.9,R*.2),C.wh,C.or,C.gi);
 if(o.orb)kput('taGiltBall',[x,top+Math.max(.12,R*.03)*4.2+.5,z],null,[.42,.42,.42],C.gi);
 return top;}

// ---------------------------------------------------------------- THE PALACE
function buildTalGovernorPalace(G,o){reseed(9691+(o.v|0));const T=1.2,G1=5.5,U1=4.5,R1=T+G1,R2=R1+U1;
 const C={wh:TA_WH(),mb:vC(vPick(TAPAL.marble)),or:TA_OR(),gi:vC(vPick(TAPAL.gilt)),tile:vC(vPick(TAPAL.tile)),st:TA_ST(),wal:TA_WAL()};
 const {wh,mb,or,gi,st,wal}=C,P=TPP,blk=(item,u0,u1,v0,v1,y,h,c)=>{const [x,z]=P((u0+u1)/2,(v0+v1)/2);vB(item,x,y,z,Math.abs(v1-v0),h,Math.abs(u1-u0),0,c);};
 // the four domains (VASSAL-KITS.md 3.2): ceremony, government, the city's door, the residence; and the forecourt
 const at=(u,v)=>P(u,v);
 vnReg('Governor\'s palace — the audience hall (ceremony)',...at(10,0),17,R2+2,{style:'classical',type:['civic'],role:'governor',domain:'ceremony'});
 vnReg('Governor\'s palace — the great dome and the signal lantern',...at(10,0),7.5,28,{style:'byzantine',domain:'ceremony'});
 vnReg('Governor\'s palace — the Chancery and Customs of the East Road (government)',...at(-8,-18),6.5,R2+6,{style:'indic',type:['civic'],domain:'government'});
 vnReg('Governor\'s palace — the Hall of the Talei Council (the city\'s door)',...at(-8,18),6.5,R2+6,{style:'indic',type:['civic'],domain:'city'});
 vnReg('Governor\'s palace — the residence',...at(26,12),9,R2+5,{style:'indic',domain:'residence'});
 vnReg('Governor\'s palace — forecourt',...at(-24,0),14,3,{type:['civic'],domain:'ceremony'});
 // ---- the grounds: white walls with a marble coping and an orange band, the gate's piers under chhatris, the cart gate
 const wall=(u0,u1,v0,v1)=>{blk('vPlaster',u0,u1,v0,v1,0,3.2,wh);blk('vPlaster',u0-.02,u1+.02,v0,v1,2.5,.22,or);
  const lu=Math.abs(u1-u0)>1,eu=lu?.1:.25,ev=lu?.25:.1;blk('taMarble',Math.min(u0,u1)-eu,Math.max(u0,u1)+eu,Math.min(v0,v1)-ev,Math.max(v0,v1)+ev,3.2,.22,mb);};
 for(const s of[-1,1]){wall(-36.4,-35.6,s*5.6,s*30);wall(-36,38,s*29.6,s*30.4);
  const [gx,gz]=P(-36,s*5.5);vB('taMarble',gx,0,gz,1.9,.4,1.9,0,st);vB('vPlaster',gx,.4,gz,1.6,4.6,1.6,0,wh);vB('vPlaster',gx,3.9,gz,1.66,.24,1.66,0,or);
  vB('taMarble',gx,5,gz,1.9,.24,1.9,0,mb);tanKiosk(gx,5.24,gz,.62,1.5,4,wh,{domeC:C.tile,ribC:gi,ribItem:'taRibGi',finial:gi,fr:.08});
  tanArch(gx,1.2,gz+.8,0,.7,2,{fill:'W',fc:wh,band:or,bw:.08});
  const b=P(-33.5,s*8);vnBannerPole(b[0],0,b[1],0,7,or);}
 wall(37.6,38.4,-30,-20.5);wall(37.6,38.4,-13.5,30);
 for(const s of[-1,1]){const [cx,cz]=P(38,s<0?-20.5:-13.5);vB('vPlaster',cx,0,cz,1.3,3.8,1.3,0,wh);vB('taMarble',cx,3.8,cz,1.5,.2,1.5,0,mb);}
 // the forecourt: the axial walk in stone with a meander border and two mosaic medallions, lamps either side
 blk('vStone',-35.6,-12,-4,4,0,.06,st);{const [x,z]=P(-23.8,0);tanMeander(x,.06,z,8,23.6,0,or);}
 for(const u of[-28,-19]){const [x,z]=P(u,0);tanMosaicRing(x,.06,z,2.2,or,wh);}
 for(const s of[-1,1])for(const u of[-30,-22]){const l=P(u,s*5.2);vnLampPost(l[0],0,l[1],3.6);}
 // ---- the terrace: marble on a moulded base (a stone plinth, the orange band, a white cornice), its front recessed
 // between the large pavilions; the imperial stair with an orange runner and lions on the newels
 const ter=(u0,u1,v0,v1)=>{blk('taMarble',u0,u1,v0,v1,0,T,mb);blk('taMarble',u0-.15,u1+.15,v0-.15*Math.sign(v1-v0||1),v1+.15*Math.sign(v1-v0||1),0,.32,st);
  blk('vPlaster',u0-.02,u1+.02,v0,v1,T-.5,.16,or);blk('taMarble',u0-.12,u1+.12,v0-.12*Math.sign(v1-v0||1),v1+.12*Math.sign(v1-v0||1),T-.04,.12,wh);};
 ter(-8.5,34.6,-25.6,25.6);for(const s of[-1,1])ter(-14.3,-8.5,s*11.7,s*25.6);
 {const [x,z]=P(-8.5,0),w=6.4,reach=tanImperialStair(x,0,z,0,w,T,mb,or,{gilt:gi});
  for(const s of[-1,1]){const p=loc(x,z,s*(w/2+1.1),reach-.4,0);vB('taMarble',p[0],0,p[1],.8,.6,1.3,0,mb);talpLion(p[0],.6,p[1],0,1.1,mb);}}
 // ---- the hall block: two storeys behind the front loggia, a flat roof behind a balustrade (front) and a coped parapet
 blk('vPlaster',-4,24,-18,18,T,G1+U1,wh);{const [x,z]=P(10,0);tanString(x,T+G1-.1,z,36,28,0,wh,.12,.2);}
 // the front loggia: a screen at u -8.9 across v -11.7..11.7, Corinthian columns on an arcade of six below with an
 // entablature and a gilt frieze; a balustraded gallery and a slimmer Ionic arcade of ten (lit) above
 blk('vPlaster',-8.9,-8.3,-11.7,11.7,T,G1+U1,wh);blk('vPlaster',-8.3,-4,-11.7,11.7,R1-.3,.3,mb);
 {const [x,z]=P(-8.9,0);
  tanArcade(x,T,z,0,6,2.85,G1-1.1,.9,{fill:'D',band:or,bw:.16,col:'corinthian',cc:mb,capC:gi,colOut:.42});
  vB('taMarble',x,T+G1-1.1,z+.3,23.6,.36,.7,0,mb);vB('vPlaster',x,T+G1-.74,z+.32,23.6,.3,.66,0,gi);vB('taMarble',x,T+G1-.44,z+.3,23.9,.24,.8,0,wh);
  tanBalustrade(x,R1,z+.5,0,23.4,mb,1.0,{ball:gi,gilt:gi});
  tanArcade(x,R1+.1,z,0,10,1.79,U1-1.0,.5,{fill:'L',band:or,bw:.12,col:'ionic',cc:mb,capC:gi,colOut:.25});
  for(const s of[-1,1]){vnLamp(x+s*2.1,4.2,z+.5,0);}}
 // the side faces between the pavilions: arched windows on two storeys between pilasters; the rear face the same
 for(const s of[-1,1]){const [x,z]=P(11,s*18),ry=-s*Math.PI/2;
  tanArcade(x,T+.6,z,ry,5,1.9,G1-1.8,1.1,{fill:'G',band:or,bw:.14,sill:wh});tanArcade(x,R1+.5,z,ry,5,1.6,U1-1.5,1.4,{fill:'L',band:or,bw:.12,kind:'cusp',lobes:3});
  for(let k=0;k<6;k++){const p=loc(x,z,-7.5+k*3,0,ry);tanPilaster(p[0],T,p[1],ry,.5,G1+U1-.1,wh,gi);}}
 {const [x,z]=P(24,0);tanArcade(x,T+.6,z,Math.PI,7,1.9,G1-1.8,1.2,{fill:'G',band:or,bw:.14,sill:wh});tanArcade(x,R1+.5,z,Math.PI,7,1.6,U1-1.5,1.5,{fill:'L',band:or,bw:.12,kind:'cusp',lobes:3});}
 // the roof: the entablature with an orange frieze over the block and the loggia; the balustrade on the front, a
 // coped parapet on the sides and the back
 let yR;{const [x,z]=P(10,0);yR=tanEntablature(x,R2,z,36,28,0,wh,or,{dentils:false});}
 {const [x,z]=P(-6.45,0);tanEntablature(x,R2,z,23.4,4.9,0,wh,or,{dentils:false});tanBalustrade(x,yR,P(-8.9,0)[1]+.1,0,23.4,mb,.95,{ball:gi,gilt:gi});
  for(const s of[-1,1])tanBalustrade(-s*11.6,yR,z,s*Math.PI/2,4.9,mb,.95,{});}
 {const [x,z]=P(10,0);tanParapetWall(x,yR,z,36,28,0,wh,.8,mb);}
 // ---- the great dome: a square base, the tall drum of lit arched windows between pilasters, the orange-tiled dome
 // between sixteen gilt ribs, the white lantern (the signal room) with an orange cupola and a gilt finial
 {const [x,z]=P(10,0);vB('vPlaster',x,yR,z,16.4,1.1,16.4,0,wh);vB('vPlaster',x,yR+1.1,z,16.8,.22,16.8,0,or);
  for(const sx of[-1,1])for(const sz of[-1,1])tanKiosk(x+sx*7.6,yR+1.32,z+sz*7.6,.55,1.4,4,wh,{domeC:C.tile,ribC:gi,ribItem:'taRibGi',finial:gi,fr:.07});
  tanDrumDome(x,yR+1.32,z,7,{drumH:4.4,n:16,kind:'hemi',domeC:C.tile,ribs:16,gilt:gi,fill:'L',band:or,round:true,pil:true,pilC:wh,lanternC:or,drumC:wh});}
 // the light courts either side of the drum: dark wells through the roof behind a coped parapet
 for(const s of[-1,1]){const [x,z]=P(5.5,s*11.5);vB('vDarkB',x,yR-.4,z,4.6,.42,4.6,0,null);tanParapetWall(x,yR,z,5,5,0,wh,.6,mb);}
 // ---- the seven pavilions (blueprint: the council and the chancery the large front corners, the dining hall and the
 // family garden room the medium rear corners, the guard and the shrine on the flanks, the round kitchen behind)
 for(const s of[-1,1]){talpPavilion(-8,s*18,6.3,{n:12,lantern:true},C);talpPavilion(24,s*18,5,{n:10,jali:true,dome:s>0?'cu':'tile'},C);}
 talpPavilion(8,-22,3.6,{n:8,order:'doric',dome:'tile'},C);
 talpPavilion(8,22,3.6,{n:8,storeys:1,dome:'cu',orb:true},C);
 // the round kitchen: a plain drum with small windows under a white dome and its vent lantern (service: no gilt)
 {const [x,z]=P(31,-6);const yt=tanDrum(x,T,z,3.6,5.5,8,wh,{fill:'D',round:true,ww:.8,wh:1.6});
  kput('taDomeP',[x,yt,z],null,[3.66,2.4,3.66],wh);tanLantern(x,yt+2.3,z,.6,1.0,wh,wh,null);}
 // ---- the outside stair on the chancery flank: a straight marble flight on a solid stringer with sloping rails,
 // a landing on a pier at the gallery, the gallery door under a small pediment
 {const zc=P(1.35,0)[1],xt=19.5,N=22,run=N*.32,xc=xt+run/2,ang=Math.atan2(R1,run);
  vnStairs(xc,0,zc,Math.PI/2,2.4,R1,N,'taMarble',mb);
  for(let k=0;k<N;k++){const xx=xt+run-(k+.5)*run/N;vB('taMarble',xx,0,zc,run/N+.02,R1*k/N+.02,2.4,0,mb);}
  for(const s of[-1,1])vBq('taMarble',xc,R1/2+.5,zc+s*1.32,Math.hypot(run,R1)+.3,.95,.22,vQ(0,0,-ang),wh);
  vB('taMarble',xt-.75,0,zc,1.5,R1,2.6,0,mb);vB('vPlaster',xt-.75,R1-.3,zc,1.66,.18,2.76,0,or);
  tanBalustrade(xt-.75,R1,zc+1.25,0,1.5,mb,.95,{ball:gi,gilt:gi});tanBalustrade(xt-.75,R1,zc-1.25,Math.PI,1.5,mb,.95,{ball:gi,gilt:gi});
  tanArch(18,R1,zc,Math.PI/2,1.6,3,{fill:'D',band:gi,gilt:true,bw:.14});tanPediment(18,R1+3.3,zc,Math.PI/2,2.8,.9,wh,.12,.5,or,gi);
  const p=loc(18,zc,0,.06,Math.PI/2);vB('vWood',p[0],R1,p[1],1.5,1.8,.08,Math.PI/2,wal);}
 // ---- the service court and the garden behind the residence
 for(let k=0;k<3;k++){const [x,z]=P(33+k*1.4,-24);vnCrate(x,0,z,.8,.2,vC(vPick(VPAL.woodMid)));}
 {const [x,z]=P(34,-17);vnBarrel(x,0,z,.35,.9,null);}
 {const [x,z]=P(33.5,15);vB('vStone',x,0,z,3,.06,14,0,st);tanMosaicRing(x,.06,z,1.6,or,wh);
  for(const s of[-1,1]){const [px,pz]=P(33.5+s*3.2,6);vnPlanter(px,0,pz,1.2,3.2,0,mb);const [qx,qz]=P(33.5+s*3.2,24);vnPlanter(qx,0,qz,1.2,3.2,0,mb);}
  for(const dv of[-4,4]){const [tx,tz]=P(33.5,15+dv);tanPot(tx,.06,tz,.5,null);}}}

VERN.def({key:'tal_governor_palace',name:'Governor\'s palace',family:'civic',
 tags:Object.assign({},TA_TAG('classical','civic',['civic'],true),{role:'governor'}),w:62,d:76,h:30,build:buildTalGovernorPalace});
