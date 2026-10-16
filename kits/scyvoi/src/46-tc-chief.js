// prefix: tc
// ================================================================= THE CHIEF'S TENT: the largest and most ornate (the one real mark of rank)
// A great round pavilion on a carved timber deck: white canvas banded in black strapwork, a scalloped black-and-gold
// valance, a conical roof to a crown and a banner mast, a porch on red columns, banner poles round the deck. Inside, a
// ring of red columns, a fire-bloom lining, a rosette carpet, the dais with the chief's seat at the back, divans and
// toshaks round the wall, braziers, chandeliers. Tags: civic and dwelling-single, wealth rich (the court-tier furniture).
const TC={R:9,wH:3.3,pH:9.4,deckR:10.6,deckH:.85};
function tcRoofProf(){const P=[];for(let i=0;i<=8;i++){const t=i/8;P.push([lerp(TC.R+.35,1.25,t),lerp(TC.deckH+TC.wH,TC.deckH+TC.pH,t)-Math.sin(PI*t)*.35]);}return P;}
function tcRoofY(r){const P=tcRoofProf();for(let i=0;i<P.length-1;i++){if(r<=P[i][0]&&r>=P[i+1][0]){const t=(P[i][0]-r)/(P[i][0]-P[i+1][0]);return lerp(P[i][1],P[i+1][1],t);}}return TC.deckH+TC.pH;}
defBuilding({key:'tent-chief',name:"Chief's tent",seed:4601,cut:true,w:25,d:28,h:14.5,budget:240000,
 tags:{types:['civic','dwelling-single'],wealth:'rich',style:'orda'},
 note:"the chief's great tent (orda) on its deck: where the band meets, judges and feasts",
 build(o){const R=TC.R,y0=TC.deckH,wH=TC.wH,dW=3.2,g=(dW/2+.1)/R,A0=PI/2+g,A1=PI/2+TAU-g,seg=96;
  // the deck: timber on a carved, red-lacquered skirt, steps to the porch
  tkNoCut(()=>{
  cyl('wood',0,0,0,TC.deckR,y0,P('wood'),48);lathe('carved',0,0,[[TC.deckR+.02,.05],[TC.deckR+.02,y0-.05]],48,0xa04a2a);
  for(let i=0;i<4;i++)box('wood',0,i*y0/4,TC.deckR+.35+(3-i)*.45,4.4,y0/4,.5,P('woodD'));
  // the deck rail with gaps at the steps
  for(let i=0;i<40;i++){const a=i/40*TAU;if(tkNearDoor(a,.24))continue;const p=tkAt(TC.deckR-.15,a),q=tkAt(TC.deckR-.15,a+TAU/40);pole('lacq',[p[0],y0,p[1]],[p[0],y0+.9,p[1]],.04,null,6);if(!tkNearDoor(a+TAU/40,.24))beam('lacq',[p[0],y0+.9,p[1]],[q[0],y0+.9,q[1]],.06,null,false);}
  });
  tkCutFloor(y0);
  // the wall: white canvas, a black strapwork band at the top, a fire band at the foot; the lining inside
  lathe('canvas',0,0,[[R,y0],[R,y0+wH]],seg,P('cream'),{a0:A0,a1:A1});
  lathe('patBlack',0,0,[[R+.03,y0+wH-.85],[R+.03,y0+wH-.08]],seg,null,{a0:A0,a1:A1});
  lathe('patFlame',0,0,[[R+.03,y0+.08],[R+.03,y0+.62]],seg,null,{a0:A0,a1:A1});
  lathe('patBloom',0,0,[[R-.08,y0+.02],[R-.08,y0+wH-.05]],seg,null,{a0:A0,a1:A1,inward:true});
  // the roof: a concave cone of white canvas with black seams, a strapwork ring, the lining under it
  const prof=tcRoofProf(),sc=new THREE.Color();
  lathe('canvas',0,0,prof,seg,P('cream'),{colf:(u,v)=>{const f=(u*32)%1;const k=f<.04?.35:1;return sc.setRGB(k,k,k);}});
  lathe('patBlack',0,0,[[prof[3][0]+.04,prof[3][1]+.06],[prof[4][0]+.04,prof[4][1]+.06]],seg,null);
  lathe('patCelest',0,0,prof.map(q=>[q[0]-.12,q[1]-.12]),seg,null,{inward:true});   // the ringed giant and the stars over the chief's head
  // the crown: a drum, its own cone, the mast and the black banner
  const cy=y0+TC.pH;lathe('canvas',0,0,[[1.3,cy-.4],[1.3,cy+.55]],24,P('cream'));lathe('patBlack',0,0,[[1.33,cy-.25],[1.33,cy+.4]],24,null);
  lathe('canvas',0,0,[[1.6,cy+.5],[.1,cy+1.9]],24,P('cream'));ring('brass',0,cy+.52,0,1.58,.05,0xc8963a);
  pole('lacq',[0,0,0],[0,cy+4.4,0],.18,null,10);sph('brass',0,cy+4.5,0,.22,0xc8963a);
  withCloth(clothFlag(3.2,.3),()=>W(0,cy+4.2,0,PI/2,()=>psurf('flag',(u,v)=>[u*3.2,-v*(1.3-u*.55),0],8,3,P('black'))));
  // the eave valance (black, gold tassels) and the guy ropes
  const vp=[];for(let i=0;i<=96;i++){const a=i/96*TAU;vp.push([Math.cos(a)*(R+.37),y0+wH+.03,Math.sin(a)*(R+.37)]);}
  tkValance(vp,.5,'flag',P('black'),{per:1.5,tassels:0xd8b060});
  for(let i=0;i<16;i++){const a=(i+.5)/16*TAU;if(tkNearDoor(a,.5))continue;const p=tkAt(R+.37,a),q=tkAt(TC.deckR+2.2,a);tkGuy([p[0],y0+wH+.05,p[1]],q[0],q[1]);}
  // inside: the ring of red columns and the centre mast carry the roof; the rosette carpet on the deck
  for(let i=0;i<10;i++){const a=(i+.5)/10*TAU,p=tkAt(5.6,a);pole('lacq',[p[0],y0,p[1]],[p[0],tcRoofY(5.6)-.15,p[1]],.13,null,10);cyl('brass',p[0],y0,p[1],.19,.25,0xc8963a,10);}
  cyl('patPoly',0,y0+.004,0,R-.1,.02,null,64);
  // the door: a carved and lacquered frame, the curtains tied back
  W(0,y0,R,0,()=>{box('lacq',-dW/2-.15,0,0,.3,wH,.3,null);box('lacq',dW/2+.15,0,0,.3,wH,.3,null);box('carved',0,wH-.5,0,dW+.6,.5,.34,0xb06a3a);
   for(const s of [-1,1])psurf('patBloom',(u,v)=>[s*(dW/2-.1+u*.0+Math.sin(v*PI)*.25*(1-u)),wH-.5-v*(wH-.6),-.12-u*.4],3,4,null);});
  // the porch: a canopy on four red columns over the steps, with its own valance
  tkNoCut(()=>{
  const pz0=R+.2,pz1=TC.deckR+1.8,px=2.6;for(const [x,z] of [[-px,pz1],[px,pz1],[-px,pz0+.9],[px,pz0+.9]]){pole('lacq',[x,z>TC.deckR?0:y0,z],[x,y0+wH+.4,z],.11,null,8);}
  psurf('canvas',(u,v)=>{const x=-px-.3+u*(2*px+.6),z=pz0+v*(pz1-pz0+.3);return [x,y0+wH+.4+Math.sin(PI*u)*.5-v*.25,z];},8,4,P('cream'));
  {const vq=[[-px-.3,y0+wH+.15,pz1+.3],[px+.3,y0+wH+.15,pz1+.3]];tkValance(vq,.4,'flag',P('black'),{per:1.6,tassels:0xd8b060});}
  // banner poles round the deck, each with a long pennant
  for(const a of [PI/2+.75,PI/2-.75,PI/2+2.3,PI/2-2.3]){const p=tkAt(TC.deckR+1.2,a);pole('lacq',[p[0],0,p[1]],[p[0],8.5,p[1]],.09,null,8);sph('brass',p[0],8.6,p[1],.13,0xc8963a);
   withCloth(clothFlag(2.4,.32),()=>W(p[0],8.3,p[1],a,()=>psurf('flag',(u,v)=>[u*2.4,-v*(.5-u*.35),0],8,2,P('madder'))));}
  });
  // the furniture: dais and seat, divans, toshaks round the wall, braziers, chandeliers, hangings, the samovar
  cyl('carved',0,y0,-6.1,2.3,.35,0x8a4a2a,32);medallion('medSal',0,y0+.35,-6.1,4.3,{round:true});   // the salamander medallion on the dais
  FURNISH('scyvoi_court_throne',0,y0+.36,-6.6,0);for(const s of [-1,1])FURNISH('scyvoi_court_divan',s*1.6,y0+.36,-6.1,s<0?.6:-.6);
  FURNISH('scyvoi_court_carpet',0,y0+.03,-2.6,0);FURNISH('scyvoi_court_carpet',0,y0+.03,1.6,0,{v:1});
  tkRingSeats(R-.75,['scyvoi_toshak'],{y:y0,step:2.3,gap:.62,skip:a=>Math.abs(((a-(TK_DOOR+PI))%TAU+TAU)%TAU-PI)>PI-.62});
  for(const s of [-1,1]){FURNISH('scyvoi_court_fire',s*2.4,y0,-1.2,0);FURNISH('scyvoi_brazier',s*3.4,y0,3.4,0);}
  for(const s of [-1,1])for(const z of [-.5,2.5]){FURNISH('scyvoi_low_round_table',s*1.6,y0,z,0);FURNISH('scyvoi_tea_set',s*1.6,y0+svfH('scyvoi_low_round_table',0,.36),z,0);}
  FURNISH_HANG('scyvoi_glass_chandelier',0,tcRoofY(.1)-.6,-2.5,0);for(const s of [-1,1])FURNISH_HANG('scyvoi_glass_chandelier',s*3.4,tcRoofY(3.4)-.4,.6,0);
  for(const a of [TK_DOOR+PI+.55,TK_DOOR+PI-.55,TK_DOOR+PI+1.3,TK_DOOR+PI-1.3]){const p=tkAt(R-.2,a);FURNISH('scyvoi_court_tapestry',p[0],y0+.35,p[1],tkFace(p[0],p[1]),{v:Math.round(a*7)%4});}
  FURNISH('scyvoi_samovar',4.6,y0,1.6,-PI/2);FURNISH('scyvoi_court_statue',-4.6,y0,-4.2,tkFace(-4.6,-4.2));
  for(const s of [-1,1])FURNISH('scyvoi_lance_stand',s*2.2,y0,R-1.0,PI);
  FURNISH('scyvoi_spirit_pole',3.8,0,TC.deckR+2.6,0,{setting:'outdoor'});
  door(0,y0,R,0,dW);}});
