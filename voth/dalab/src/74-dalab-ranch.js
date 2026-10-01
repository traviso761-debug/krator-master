// ================================================================= DALAB — the ranch
// A livestock ranch the area of the Halls of Reformation (~120 m square): a rail fence round the whole, a ranch house
// (a post house on a rammed-earth plinth), a great thatch barn, a granary, four paddocks with troughs and hay, a
// stone-walled pen with a shade roof, a well, a windbreak of skirt palms, and the stock: whatever the fauna registry
// (DFAUNA, 69e) holds — Dalab lizards today, the monsters when they exist (the monster pen is the stone one).
function dnRailFence(x,z,w,d,ry,c,gate){vnFence(x,0,z,w,d,ry,c,gate,1.3);}
function dnTrough(x,y,z,ry){vB('vWood',x,y,z,2.4,.6,.8,ry,dCol(DPAL.woodGrey));vB('vDarkB',x,y+.5,z,2.2,.1,.6,ry);}
function dnHaystack(x,y,z,r){kput('dConeT',[x,y-.2,z],null,[r,r*1.6,r],dCol(DPAL.thatch));vPst('vPost',x,y,z,.06,r*1.9,vC(0x5a4632));}
function dnHerd(kind,x,z,w,d,n,s,opt){for(let i=0;i<n;i++){const px=x+rr(-w/2+1.5,w/2-1.5),pz=z+rr(-d/2+1.5,d/2-1.5);dnAnimal(kind,px,0,pz,rng()*TAU,(s||1)*rr(.7,1.15),opt);}}
function buildDalabRanch(G,o){reseed(8701+(o.v|0));const S=120;const wood=dCol(DPAL.woodGrey),earth=dCol(DPAL.earth),th=dCol(DPAL.thatch),st=dCol(DPAL.stone);
 vnReg('Ranch',0,0,S*.72,10,{type:['farm']});vnReg('Ranch fence',0,0,S*.72,1.5,{part:'wall',type:['farm']});
 dnRailFence(0,0,S,S,0,wood,6);
 vnPaving(0,.02,S/2-8,10,14,0,dCol(DPAL.earthDark),10);
 // the ranch house on its plinth, front of the yard; the barn behind; the granary; the well
 {const hx=-30,hz=34;vB('dEarth',hx,-.05,hz,14,.7,11,0,earth);const W=9.5,D=7,H=2.8,FL=.7;vnFrame(hx,FL,hz,W,H,D,0,wood,.15);vB('vWood',hx,FL,hz,W-.1,H,D-.1,0,wood.clone().multiplyScalar(.92));
  vnHipRoof('vHipT',hx,FL+H,hz,W,D,2.6,0,th,1.2);vnVeranda(hx,0,hz+D/2+1.0,W-1.2,2.0,0,FL,2.4,wood);vnShedRoof(hx,FL+2.4,hz+D/2+1.0,W-1.2,2.0,.5,0,'vThatchB',th,.4,.26);
  vnDoor(hx-1,FL,hz+D/2-.05,0,.95,1.9,'vWood',wood,vC(0x6a5a48),false);vnWin(hx+2.4,FL+1.2,hz+D/2-.05,0,.9,.7,'open','vWood',wood,true);dnHearth(hx+2.4,FL+1.2,hz+D/2-.05,0,.9,.7);
  dnMuralBand(hx,FL+H-.5,hz-D/2+.05,Math.PI,W-2,.45,3);dnJar(hx+6.2,0,hz+2,.3);dnWoodpile(hx-6.4,0,hz-1,Math.PI/2,1.4);vnDryingRack(hx+1,0,hz+6.5,0,3);}
 {const bx=-30,bz=8;const W=22,D=12,H=4.2;vB('vStone',bx,-.05,bz,W+.6,.35,D+.6,0,vC(0x9a8a78));for(let i=0;i<=5;i++)for(const sd of[-1,1])vPst('vPostB',bx-W/2+W*i/5,0,bz+sd*(D/2-.2),.2,H,wood);
  vB('dEarth',bx,.3,bz-D/2+.5,W,H-.6,1.0,0,earth);vnGableRoof(bx,H,bz,W,D,3.6,0,'vGableT',th,1.3,'vGableW',wood,.5);
  vB('vWood',bx,.3,bz,W-.4,H-.6,.14,0,wood);for(const sd of[-1,1])vB('vWood',bx+sd*(W/2-.1),.3,bz,.14,H-.6,D-.6,0,wood);   // board partitions
  vnSacks(bx-6,.3,bz+3,5);dnHaystack(bx+5,.3,bz+2,2.2);dnHaystack(bx+8.5,.3,bz-1,1.8);vnCrate(bx-8,.3,bz-2,.9,.2,wood);vnBarrel(bx+9,.3,bz+4,.42,1,wood);
  dnHerd('lizard',bx-2,bz-2,8,6,3,.9);}
 dnGranary(-12,0,44,1.5,2.0,{door:Math.PI});dnGranary(-8,0,40,1.3,1.8,{door:Math.PI*.8});
 dnDrum('dStoneDrum',-14,0,32,1.1,.9,st);dnDrum('vDarkB',-14,.9,32,.85,.1,null);vB('vWood',-14,0,32,.12,2.4,.12,0,wood);vB('vWood',-14,2.3,32,1.2,.1,.1,0,wood);
 // the paddocks: four rail-fenced fields on the east half and the south, each with a trough, a hay stack, a herd
 const PADS=[[30,30,50,44],[30,-12,50,36],[-25,-30,60,44],[30,-40,50,16]];
 PADS.forEach((P,i)=>{const[px,pz,pw,pd]=P;dnRailFence(px,pz,pw,pd,0,wood,3);dnTrough(px-pw/2+3,0,pz+pd/2-2.5,0);if(i<3)dnHaystack(px+pw/2-4,0,pz-pd/2+4,2.4);
  dnHerd('lizard',px,pz,pw-6,pd-6,i===3?4:7,1,{frill:i===1});});
 // the shade roof in the big paddock
 for(const p of[[-8,-18],[8,-18],[-8,-8],[8,-8]])vPst('vPostB',p[0],0,p[1],.16,2.8,wood);vnShedRoof(0,2.6,-13,18,12,.6,0,'vThatchB',th,.6,.3);
 // THE MONSTER PEN: a stone-walled ring pen with a heavy gate and a watch post — lizards for now
 {const mx=38,mz=-2,MR=13;dnRingWall(mx,0,mz,MR,3.2,-Math.PI/2,4,'vStone',st,1.0);for(const sd of[-1,1]){const p=dnOnRing(mx,mz,MR,-Math.PI/2+sd*.16);vB('vStone',p[0],0,p[1],1.2,4.2,1.2,-Math.PI/2,st);}
  const g=dnOnRing(mx,mz,MR,-Math.PI/2);vB('vWood',g[0],0,g[1],3.6,3.0,.2,-Math.PI/2,wood);for(let k=0;k<4;k++){const q=loc(g[0],g[1],-1.5+k,0,-Math.PI/2);vB('vIron',q[0],0,q[1],.08,3.0,.08,0,vC(0x2e2a26));}
  vPst('vPostB',mx,0,mz-MR-2.5,.2,5,wood);vB('vWood',mx,5,mz-MR-2.5,2,.15,2,0,wood);vnLadder(mx+1.2,0,mz-MR-2.5,Math.PI/2,5,wood);kput('figB',[mx,5.15,mz-MR-2.5],null,1,dCol(DPAL.robe));kput('figH',[mx,5.15,mz-MR-2.5],null,1,dCol(DPAL.skin));
  for(let i=0;i<5;i++){const a=rng()*TAU,r=rr(2,MR-3);dnAnimal('lizard',mx+Math.cos(a)*r,0,mz+Math.sin(a)*r,rng()*TAU,rr(1.2,1.7),{frill:true,c:dCol([0x8a4a2a,0x6a5a2a,0x4f4f36])});}
  dnFirePit(mx,0,mz+MR+4,.7);vnReg('Monster pen (lizards for now)',mx,mz,MR+1,5,{type:['farm'],part:'pen'});}
 // windbreak: skirt palms along the north fence; a few ranch hands and a rider's hitching rail
 BIO.cur='lowlands/ranch';for(let k=0;k<7;k++)dnTree('skirtpalm',-S/2+8+k*10,0,-S/2+6,{scale:rr(.8,1.1)});for(let k=0;k<4;k++)dnTree('manzanita',S/2-6,0,-S/2+12+k*16,{scale:.8});BIO.cur=null;
 dnFolk(-20,50,3,2);dnFolk(10,8,2,2);dnFolk(0,S/2+4,2,1.5);
 vB('vWood',8,0,S/2-6,.12,1.1,.12,0,wood);vB('vWood',12,0,S/2-6,.12,1.1,.12,0,wood);vB('vWood',10,1.0,S/2-6,4.2,.1,.1,0,wood);}

dDef({key:'dalab_ranch',name:'Ranch',family:'farm',tags:{type:['farm'],wealth:'middle',lit:false},w:126,d:126,h:12,build:buildDalabRanch});
