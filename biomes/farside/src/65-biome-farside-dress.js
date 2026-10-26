// ================================================================= FARSIDE — the dressing: the sea's weed on the land's trees
// FARSIDE.dressTrees(trees, opt) hangs the invaders on trees another pass or kit placed: the dead at the front (this kit's
// snags, their broken limbs) and the native forest (biomes/nwlowlands' trees, handed in by the host as records
// {x, z, y0, H, rb, crownR}). What a tree wears is the fields' at its foot:
//   wine weed   the front and the fog belt's outriders (front, outrider): crimson sheets and fronds from the crown's limbs
//   storm wrack the front and the spray: brown straps from the limbs and low on the bole
//   fog sponge  the fog (fog): ochre, orange and grey crusts up the bole's lower ten metres
// Each tree draws from its own seed (KRAND.hash of the pass and where it stands), so a tree is dressed the same whoever
// placed it and in whatever order.
(function(){const {TAU,clamp,lerp,smooth}=BIO.fn;
const T3=BIO.host.THREE,C=h=>new T3.Color(h),PAL=FARSIDE.PAL,UP=new T3.Vector3(0,1,0),_n=new T3.Vector3();
const WIND=()=>(BIO.host.farside&&BIO.host.farside.wind)||[Math.SQRT1_2,Math.SQRT1_2];
const pk=(s,a)=>a[Math.floor(s.next()*a.length)%a.length];
FARSIDE.dressTrees=function(trees,opt){opt=opt||{};const st={wine:0,wrack:0,crust:0},w=WIND(),s0=KRAND.child(KRAND.child(BIO.host.seed>>>0,'farside'),opt.salt||'dress'),q=opt.quality==null?1:opt.quality;
 BIO.range=FARSIDE.LOD.dress;BIO.minRange=0;
 trees.forEach(T=>{const s=KRAND.stream(KRAND.hash(s0,Math.round(T.x*10),Math.round(T.z*10))),f=n=>BIO.field(n,T.x,T.z);
  const front=f('front'),out=f('outrider'),fog=f('fog'),spray=f('spray');
  const kw=clamp(Math.max(front*.9,out),0,1),kr=clamp(Math.max(front*.7,smooth(.6,.95,spray)*.5),0,1),ks=clamp(fog*(1-spray*.6),0,1);
  if(kw+kr+ks<.05)return;BIO.owner=[T.x,T.z];
  const crownPt=()=>{if(T.hangs&&T.hangs.length){const p=pk(s,T.hangs);return [p.x+(s.next()-.5)*1.5,p.y-s.next()*.6,p.z+(s.next()-.5)*1.5];}
   const a=s.next()*TAU,r=(T.crownR||4)*lerp(.12,.62,s.next());return [T.x+Math.cos(a)*r,T.y0+T.H*lerp(.48,.86,s.next()),T.z+Math.sin(a)*r];};
  const hang=(item,p,L,W,col)=>{const d=[w[0]*.28+(s.next()-.5)*.2,-1,w[1]*.28+(s.next()-.5)*.2];BIO.put(item,p,FARSIDE.qHang(d,s.next()*TAU),[W,L,1],col);};
  // WINE WEED: sheets and fronds from the crown, longer on the dead (nothing else hangs there)
  const nw=Math.round(kw*q*lerp(6,16,s.next())*(T.hangs?1.6:1));
  for(let i=0;i<nw;i++){const L=lerp(1.2,3.4,s.next())*(T.hangs?1.6:1.2);hang(s.next()<.55?'wine0':'wine1',crownPt(),L,L*lerp(.4,.7,s.next()),FARSIDE.vary(C(pk(s,PAL.wine)),.01,.05,.05));st.wine++;}
  // STORM WRACK: straps from the limbs, and wound low round the bole where the spray still reaches
  const nr=Math.round(kr*q*lerp(3,9,s.next()));
  for(let i=0;i<nr;i++){const low=s.next()<.4,p=low?(()=>{const a=s.next()*TAU,r=(T.rb||.6)*1.05;return [T.x+Math.cos(a)*r,T.y0+lerp(1,4,s.next()),T.z+Math.sin(a)*r];})():crownPt();
   const L=lerp(.6,1.8,s.next());hang('wrackdrape',p,L,L*.5,pk(s,PAL.wrack));st.wrack++;}
  // FOG SPONGE: crusts and lumps up the bole's lower ten metres, facing out
  const ns=Math.round(ks*q*lerp(4,12,s.next()));
  for(let i=0;i<ns;i++){const a=s.next()*TAU,y=T.y0+lerp(.3,Math.min(10,T.H*.4),Math.pow(s.next(),1.4)),r=(T.rb||.6)*(T.hangs?1:.9);
   _n.set(Math.cos(a),(s.next()-.5)*.3,Math.sin(a)).normalize();const q4=new T3.Quaternion().setFromUnitVectors(UP,_n),sz=lerp(.15,.5,s.next());
   BIO.put('crust',[T.x+Math.cos(a)*r,y,T.z+Math.sin(a)*r],q4,[sz,sz*lerp(.4,.9,s.next()),sz*lerp(.8,1.6,s.next())],FARSIDE.vary(C(pk(s,PAL.sponge)),.01,.05,.05));st.crust++;}});
 BIO.owner=null;BIO.range=null;return st;};
})();
