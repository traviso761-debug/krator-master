// ================================================================= XANADU — the lake's trades: the caravanserai, the latex house, the tea factory, the fermentary, the fish racks
// Opt-in (2026-11-16; settlements/kirstabal/PLAN.md, the pieces the town owed the kit: KNOWN_ISSUES.md). Not in xanadu.py's FILES,
// so no page that takes the kit changes: a world reads it in place by name (settlements/kirstabal/kit.json "external"); a
// world that wants them later lists it. Each a normal Xanadu piece on the kit's vocabulary (xnWall, xnStack, xnFlatRoof,
// xnTibWin, vnGableRoof, vnDoor ...), drawn in its own frame, its front +z, opening with its own reseed.
//   xa_serai        the caravanserai: a walled court of two-storey ranges round a well, an iwan gate, corner towers, stalls
//   xa_latex_house  the latex house (the White Monastery's, at Kirstabal): open drying halls of racks round a court, the sealing
//                   room, white walls and the white banner (Qiblai's white monastery: the owner, 2026-11-16)
//   xa_tea_factory  the tea factory: the withering lofts (three louvred storeys under a long gable), the rolling shed, the trays
//   xa_fermentary   the cacao fermentary: an open shed of sweat boxes, the drying floors beside it
//   xa_fish_racks   the fishing village's racks and smokehouse (core/hamlet's fishing works on the Xanadu row: settlements/kirstabal)
// ---------------------------------------------------------------- the caravanserai
function buildXaSerai(G,o){reseed(34101+(o.v|0));const V=xV(o),W=40,D=40,R=7,H1=3.4,H2=3.0;
 const earth=xC(xPick(XPAL.ochre)),wash=xC(xPick(XPAL.wash)),stone=xC(xPick(XPAL.stone)),trim=xC(xPick(XPAL.trim)),tim=xC(xPick(XPAL.timber)),timD=xC(0x5a4632);
 vnReg('Caravanserai',0,0,W/2,H1+H2+4);vnReg('Caravanserai — court',0,0,W/2-R,4);
 vB('vStone',0,0,0,W+.6,.35,D+.6,0,stone);
 /* the four ranges: two storeys of rooms, battered outer walls, an arcade along the court's side of each */
 const ranges=[[0,-D/2+R/2,0,W],[0,D/2-R/2,0,W],[-W/2+R/2,0,Math.PI/2,D-2*R],[W/2-R/2,0,Math.PI/2,D-2*R]];
 for(const [x,z,ry,L] of ranges){xnStack(x,.35,z,ry?R:L,ry?L:R,0,[H1,H2],earth,'earth');
  const inward=ry?(x<0?Math.PI/2:-Math.PI/2):(z<0?0:Math.PI),ip=loc(x,z,0,R/2+.2,inward);
  xnArcade(ip[0],.35,ip[1],inward,L-2,H1-.2,Math.max(3,Math.round(L/4.2)),'xArchS',stone,.5);
  xnFlatRoof(x,.35+H1+H2,z,ry?R:L,ry?L:R,0,earth,{parapet:.6});}
 /* the corner towers */
 for(const sx of[-1,1])for(const sz of[-1,1]){xnStack(sx*(W/2-2.4),.35,sz*(D/2-2.4),5,5,0,[H1,H2,2.6],earth,'earth');xnFlatRoof(sx*(W/2-2.4),.35+H1+H2+2.6,sz*(D/2-2.4),5,5,0,earth,{parapet:.7,corner:'pinnacle'});}
 /* the gate: an iwan in the front range, its doors open; windows on the outer faces */
 xnIwan(0,.35,D/2+.3,0,7,H1+H2+1.8,2.2,wash);vnDoor(0,.35,D/2-R,Math.PI,3.2,4.0,'vWood',tim,timD,true);
 /* the ranges' doors onto the court (each faces the court, on its range's court face: the interiors' hollow walls cut them,
    87k1): the common room and kitchen either side of the gate hall, the stores and shops at the back, the stables' wide doors */
 for(const x of[-8,8])vnDoor(x,.35,D/2-R,Math.PI,1.2,2.3,'vWood',tim,timD,false);
 for(const x of[-8,0,8])vnDoor(x,.35,-D/2+R,0,1.6,2.4,'vWood',tim,timD,false);
 for(const sx of[-1,1])for(const z of[-5,5])vnDoor(sx*(W/2-R),.35,z,-sx*Math.PI/2,2.4,2.6,'vWood',tim,timD,false);
 for(const sx of[-1,1])for(let k=1;k<4;k++){xnTibWin(sx*(4+k*4.2),.35+H1+1.0,D/2+.05,0,.8,1.0,'glass',trim,{noVal:true});xnTibWin(sx*(4+k*4.2),.35+H1+H2*.45,-D/2-.05,Math.PI,.8,1.0,'glass',trim,{noVal:true});}
 /* the court: the well, the stalls' troughs and fodder, beasts and drovers, the caravan's bales */
 xnFountain(0,.35,0,1.6,stone);
 for(let k=0;k<5;k++){const z=-D/2+R+3+k*5;xnFodder(-W/2+R+1.4,.35,z,3.2,Math.PI/2);xnFodder(W/2-R-1.4,.35,z,3.2,Math.PI/2);}
 for(let k=0;k<(V===2?6:4);k++)xnYak(rr(-9,9),rr(-8,8),rr(0,6.28),.35);
 vnSacks(-6,.35,6,6);vnSacks(5,.35,-5,5);vnCrate(7,.35+.45,6,1.1,.3);vnBarrel(-7,.35,-6,.36,.9,xC(0x8a6a48));
 vnFolk(0,4,5,8);}
XA.def({key:'xa_serai',name:'Caravanserai',family:'Lake trades',tags:{type:['tavern/inn','market/shop'],wealth:'middle',lit:true},w:46,d:46,h:12,fw:41,fd:41,nv:3,build:buildXaSerai});
// ---------------------------------------------------------------- the latex house
function buildXaLatexHouse(G,o){reseed(34111+(o.v|0));const W=38,D=34,WH=3.2;
 const white=xC(0xefeae0),whiteD=xC(0xdcd5c4),stone=xC(xPick(XPAL.stone)),tim=xC(xPick(XPAL.timber)),timD=xC(0x4a3a2a),latex=xC(0x3a2618),leaf=xC(0x6a6a3a);
 vnReg('Latex house (the White Monastery\'s)',0,0,W/2,WH+6);
 vB('vStone',0,0,0,W+.4,.3,D+.4,0,stone);
 /* the court wall, whitewashed, a gate in the front; the monastery's white banner over the gate */
 for(const s of[-1,1])vB('xWashB',s*(W/2-.3),.3,0,.6,WH,D,0,white);vB('xWashB',0,.3,-D/2+.3,W,WH,.6,0,white);
 for(const s of[-1,1])vB('xWashB',s*(W/4+1.6),.3,D/2-.3,W/2-3.2,WH,.6,0,white);
 xnArch('xArchS',0,.3,D/2,0,4.6,WH+1.2,.8,stone,{open:true});xnFlagpole(3.4,.3+WH,D/2-.3,5.5);kput('vCloth',[4.2,.3+WH+4.4,D/2-.3],null,[1.5,1.1,.04],white);
 /* the two drying halls along the sides: open-sided, posts and a long low gable, racks of latex cakes curing in the shade */
 for(const s of[-1,1]){const x=s*(W/2-5.2),L=D-6;
  for(let k=0;k<6;k++){const z=-L/2+L*k/5;vPst('vPost',x-3.4,.3,z,.14,3.4,tim);vPst('vPost',x+3.4,.3,z,.14,3.4,tim);}
  vnGableRoof(x,.3+3.4,0,L+1,7.8,1.6,Math.PI/2,'xTilesB',xC(xPick(XPAL.tile)),.4);   /* the ridge (w) along the hall */
  for(let r=0;r<3;r++){const xx=x-2.2+r*2.2;for(let t=0;t<4;t++){const y=.3+.6+t*.62;vB('vWood',xx,y,0,.9,.05,L-2,0,timD);
    for(let c=0;c<14;c++)vB('vWood',xx+rr(-.25,.25),y+.09,-L/2+1.5+c*(L-3)/13,.2,.12,.2,rr(0,1),c%3?latex:leaf);}}}
 /* the sealing room at the back: a whitewashed block, a flat roof, windows on the court; the scales and the sealed balls before it */
 const S=xnStack(0,.3,-D/2+4.2,12,6.6,0,[3.4],white,'wash');xnFlatRoof(0,.3+3.4,-D/2+4.2,12,6.6,0,whiteD,{parapet:.5});
 vnDoor(0,.3,-D/2+7.55,0,1.3,2.3,'vWood',tim,timD,false);for(const s of[-1,1])xnTibWin(s*3.6,1.5,-D/2+7.56,0,.8,.9,'glass',xC(XPAL.trim[0]),{noVal:true});
 vB('vWood',0,.3,-D/2+9.4,3.4,.8,1.2,0,tim);for(let k=0;k<12;k++)vB('vWood',-1.4+(k%6)*.55,1.15+Math.floor(k/6)*.2,-D/2+9.4,.36,.18,.36,0,latex);
 vnSacks(-4,.3,-D/2+10,4);vnCrate(4,.3+.45,-D/2+10,1.0,.2);vnFolk(0,2,4,6);}
XA.def({key:'xa_latex_house',name:'Latex house',family:'Lake trades',tags:{type:['industry','religious'],wealth:'middle',lit:false},w:42,d:38,h:9,fw:38.4,fd:34.4,build:buildXaLatexHouse});
// ---------------------------------------------------------------- the tea factory
function buildXaTeaFactory(G,o){reseed(34121+(o.v|0));const W=26,D=11,H=[3.2,2.8,2.8];
 const earth=xC(xPick(XPAL.ochre)),stone=xC(xPick(XPAL.stone)),tim=xC(xPick(XPAL.timber)),timD=xC(0x5a4632),tea=xC(0x5c6a2c),teaD=xC(0x3a3420);
 vnReg('Tea factory (withering lofts)',0,-2,W/2,H[0]+H[1]+H[2]+3);
 vB('vStone',0,0,-2,W+.4,.35,D+.4,0,stone);
 /* the withering lofts: three storeys, the upper two louvred all round (the leaf wilts in the moving air), a long gable */
 xnWall(0,.35,-2,W,H[0],D,0,earth,'earth');
 for(let f=1;f<3;f++){const y=.35+H[0]+(f-1)*H[1];vB('vWood',0,y,-2,W,.25,D,0,timD);
  for(let k=0;k<12;k++){const x=-W/2+W*(k+.5)/12;vPst('vPost',x,y,-2+D/2,.1,H[1],tim);vPst('vPost',x,y,-2-D/2,.1,H[1],tim);
   for(let l=0;l<5;l++){vB('vWood',x,y+.3+l*.5,-2+D/2,W/12-.2,.06,.14,0,tim);vB('vWood',x,y+.3+l*.5,-2-D/2,W/12-.2,.06,.14,0,tim);}}
  for(const s of[-1,1])vB('vWood',s*W/2,y,-2,.25,H[1],D,0,tim);}
 vnGableRoof(0,.35+H[0]+H[1]*2,-2,W+1.2,D+1.2,3.0,0,'xGableT',xC(0xb8563a),.7);
 for(let k=0;k<3;k++)vnDoor(-W/2+W*(k+.5)/3,.35,-2+D/2,0,2.2,2.8,'vWood',tim,timD,false);
 /* the rolling shed before it, open, the rollers' tables; the drying trays in rows on their trestles */
 for(const s of[-1,1])for(const t of[-1,1])vPst('vPost',s*6,.35,5.2+t*2.2,.14,2.8,tim);vnGableRoof(0,.35+2.8,5.2,13,5.6,1.2,0,'xTilesB',xC(xPick(XPAL.tile)),.4);
 for(let k=0;k<4;k++){vB('vWood',-4.5+k*3,.35+.8,5.2,2.2,.12,1.4,0,timD);vB('vWood',-4.5+k*3,.35+.93,5.2,1.8,.06,1.1,0,tea);}
 for(let r=0;r<2;r++)for(let k=0;k<6;k++){const x=-W/2+2+k*4.4,z=9.2+r*2.2;vB('vWood',x,.35+.7,z,3.6,.08,1.6,0,timD);vB('vWood',x,.35+.79,z,3.4,.05,1.4,0,k%2?tea:teaD);}
 vnSacks(W/2-3,.35,5.2,5);vnFolk(0,8,4,6);}
XA.def({key:'xa_tea_factory',name:'Tea factory',family:'Lake trades',tags:{type:['industry'],wealth:'poor',lit:false},w:30,d:28,h:13,fw:27,fd:24,build:buildXaTeaFactory});
// ---------------------------------------------------------------- the cacao fermentary
function buildXaFermentary(G,o){reseed(34131+(o.v|0));const W=16,D=8;
 const stone=xC(xPick(XPAL.stone)),tim=xC(xPick(XPAL.timber)),timD=xC(0x4a3626),pulp=xC(0xd8ceb0),bean=xC(0x5a3420),beanL=xC(0x7a4a2c),earth=xC(xPick(XPAL.ochre));
 vnReg('Cacao fermentary',0,-2,W/2,5);
 vB('vStone',0,0,-2,W+.4,.3,D+.4,0,stone);
 /* the open shed: posts, a back wall, a low gable; the sweat boxes in a stepped row under it, the beans under their banana leaves */
 xnWall(0,.3,-2-D/2+.3,W,3,.6,0,earth,'earth');
 for(let k=0;k<5;k++){const x=-W/2+W*k/4;vPst('vPost',x,.3,-2+D/2,.15,3,tim);}
 vnGableRoof(0,.3+3,-2,W+1,D+1,1.4,0,'xTilesB',xC(xPick(XPAL.tile)),.4);
 for(let k=0;k<5;k++){const x=-W/2+1.8+k*3.1,y=.3+(4-k)*.35;vB('vWood',x,y,-3,2.6,1.1,2.4,0,timD);vB('vWood',x,y+1.12,-3,2.3,.08,2.1,0,k%2?pulp:xC(0x5a6a2a));}
 /* the drying floors before it: raised tables of beans, raked by the drying hands */
 for(let r=0;r<2;r++)for(let k=0;k<3;k++){const x=-5+k*5,z=4+r*3;vB('vWood',x,.3+.7,z,4,.1,2.2,0,timD);vB('vWood',x,.3+.82,z,3.8,.06,2,0,(k+r)%2?bean:beanL);}
 vnSacks(W/2-1.6,.3,3,4);vnFolk(0,5,3,5);}
XA.def({key:'xa_fermentary',name:'Cacao fermentary',family:'Lake trades',tags:{type:['industry'],wealth:'poor',lit:false},w:20,d:18,h:7,fw:17,fd:16,build:buildXaFermentary});
// ---------------------------------------------------------------- the fish racks and smokehouse
function buildXaFishRacks(G,o){reseed(34141+(o.v|0));const V=xV(o);
 const tim=xC(xPick(XPAL.timber)),timD=xC(0x4a3a2a),fish=xC(0xa8a090),fishD=xC(0x7a6a50),earth=xC(xPick(XPAL.ochre)),thatch=xC(0x9a8a5a);
 vnReg('Fish racks and smokehouse',0,0,7,3.6);
 /* the racks: A-frames of poles, a ridge pole, the split fish hung on the cross poles; the smokehouse, a small earth hut, its smoke hole */
 for(let r=0;r<2;r++){const z=-2.5+r*4;for(let k=0;k<4;k++){const x=-4.5+k*3;vBeam([x,0,z-.9],[x,2.4,z],.06,tim,'vPost');vBeam([x,0,z+.9],[x,2.4,z],.06,tim,'vPost');}
  vBeam([-4.5,2.4,z],[4.5,2.4,z],.05,timD,'vPost');for(const dz of[-.5,.5])vBeam([-4.5,1.7,z+dz],[4.5,1.7,z+dz],.035,timD,'vPost');
  for(let c=0;c<16;c++){const x=-4.3+c*.57;for(const dz of[-.5,.5])vB('vWood',x,1.05,z+dz,.16,.62,.04,0,c%3?fish:fishD);}}
 const hx=V===1?-6:5.6;xnWall(hx,0,0,3,2.2,3,0,earth,'earth');vnGableRoof(hx,2.2,0,3.6,3.6,1.2,0,'vThatchB',thatch,.3);
 vnFolk(0,3.5,2,3);}
XA.def({key:'xa_fish_racks',name:'Fish racks and smokehouse',family:'Lake trades',tags:{type:['industry'],wealth:'poor',lit:false},w:16,d:11,h:3.6,fw:14,fd:9,nv:2,build:buildXaFishRacks});
