// ================================================================= DALAB — the marks of a hold: its gate and its banners (2026-10-27)
// What Dalab sets where it holds a place it did not build (settlements/span, an Ancient arcology; Blade and Ledge next): a GATE in the
// opening it keeps, and BANNERS to say whose the place is. "The red marks what is holy" (LORE.md 6.1): the band round each pylon, the
// lintel's board, the cloth. Both are parametric: they go in openings and on roofs of other people's buildings, so their size is the
// caller's. Local frame as every def: origin on the ground at the centre, +z the front (the gate's outside, the side the banners face).

// THE GATE: two battered rammed-earth pylons on a wet foot, each with the holy red band, a stone cap and a banner pole; timber leaves
// hung inside the pylons (swung in, or shut with o.v 1); a lintel beam with a red board; a stele outside each pylon.
// o.W: the opening (18: a highway), o.h: the pylons' height (8).
function buildDalabGate(G,o){reseed(8561+(o.v|0));const W=o.W==null?18:o.W,H=o.h==null?8:o.h,PW=4.5,PD=5,open=o.v===1?.04:1.15;
 const earth=dCol(DPAL.earth),dark=dCol(DPAL.earthDark),red=dCol(DPAL.red),wood=dCol(DPAL.woodGrey),st=dCol(DPAL.stone),iron=vC(0x3a3532);
 vnReg('Gate of the hold',0,0,W/2+PW+1.5,H+6,{part:'gate'});
 for(const s of[-1,1]){const x=s*(W/2+PW/2);
  vB('dEarthBat',x,0,0,PW,H,PD,0,earth);vB('dEarth',x,0,0,PW+.3,1.1,PD+.3,0,dark);
  vB('dEarth',x,H*.7,0,PW+.08,.7,PD+.08,0,red);vB('vStone',x,H,0,PW+.5,.5,PD+.5,0,st);
  dnBannerPole(x,H+.5,PD/2-.7,0,5.5,red);
  // the leaf: timber planks on iron straps, hung on the pylon's inner face, swung inward (-z)
  const lw=W/2-.2,ry=-s*open,c=loc(s*W/2,0,-s*lw/2,0,ry);
  vB('vWood',c[0],.12,c[1],lw,H*.78,.32,ry,wood);
  for(const y of[.9,H*.62]){const q=loc(s*W/2,0,-s*lw/2,.18,ry);vB('vIron',q[0],y,q[1],lw-.3,.16,.05,ry,iron);}
  dnStele(s*(W/2+PW+1.4),0,1.6,0,3.2,st);}
 vB('vWood',0,H*.82,0,W+1.2,.8,1.1,0,wood);vB('vBoard',0,H*.82+.08,.58,W*.55,.62,.06,0,red);}

// THE BANNERS: a stand of poles on stone bases, the middle one tallest, on a strip of earth. o.n: the poles (3).
function buildDalabBanners(G,o){reseed(8571+(o.v|0));const n=o.n==null?3:o.n,red=dCol(DPAL.red),st=dCol(DPAL.stone);
 vnReg('Banners of Dalab',0,0,(n-1)*1.6+1.5,8,{part:'banners'});
 vB('dEarth',0,0,0,(n-1)*3.2+2,.25,1.6,0,dCol(DPAL.earthDark));
 for(let k=0;k<n;k++){const x=(k-(n-1)/2)*3.2,h=6+(Math.abs(k-(n-1)/2)<.1?1.4:0)+rr(-.3,.3);
  vB('vStone',x,.25,0,1.0,.6,1.0,0,st);dnBannerPole(x,.85,0,0,h,red);}}

dDef({key:'dalab_gate',name:'Gate of the hold',family:'civic',tags:{type:['civic','military'],wealth:'civic',lit:false},w:28,d:6,h:14,build:buildDalabGate});
dDef({key:'dalab_banners',name:'Banners of Dalab',family:'sacred',tags:{type:['religious'],wealth:'civic',lit:false},w:10,d:2,h:8,build:buildDalabBanners});
