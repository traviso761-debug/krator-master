// ================================================================= OUTLAND GATE — the floor's flora placed: the kin's woods and the reed beds
// Every tree from a lattice whose cell is KRAND.hash(world, i, j, salt) and whose numbers come from a reseed of that hash: nothing placed
// moves another. Clear of each other (core/space), of the Gate's works and of the water (the host's mask). Each tree a core/tags record.
//   gatecottonwood  the channels' banks (the exact bank field) and the bars' backs: the riparian gallery
//   barcottonwood   young on the gravel bars (the pioneers a flood leaves)
//   gateoak         the floor's drier edges and the old bars, never on a bank
//   gatemaple       the old flood channels' damp swales
//   gatereed        beds on the channels' lips, near the eye (BIO.range)
(function(){const {clamp,smooth,rr,ri,pick,qEuler,qUp}=BIO.fn;
const F=(n,x,z)=>BIO.field(n,x,z),Y=(x,z)=>BIO.terrainH(x,z);
OGATE.build=function(opt){opt=opt||{};const R=opt.R==null?3250:opt.R,q=opt.quality==null?1:opt.quality,sq=Math.sqrt(q);
 const out={trees:0,reeds:0,kin:{}},TREES=OGATE.TREES=[],S=KSPACE.create({cell:60});
 const clear=(x,z,r)=>!S.some(x,z,r,()=>true)&&BIO.clearOf(x,z,r)&&BIO.mask(x,z)>.9&&Y(x,z)-BIO.waterH(x,z)>.6;
 const W=6100,LT=1100;
 function lattice(K,row,cell,salt,accept,minR,lvFar){if(!K){BIO.err('ogate: no kin '+row.from);return 0;}let n=0;const N=Math.ceil(R/cell);
  for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){const h=KRAND.hash(W,i,j,salt),u=k=>KRAND.unit(KRAND.hash(h,k,0,salt)),x=(i+u(1))*cell,z=(j+u(2))*cell;
   if(Math.abs(x)>R||Math.abs(z)>R||u(3)>accept(x,z)||!clear(x,z,minR))continue;
   /* one LOD key a tree (as biomes/eastabyss grows its kin): its parts keyed on its own chunk to LT, a far version (level 0) past it */
   BIO.fn.reseed(h);const T=K.make(x,Y(x,z),z),ld=BIO.lodD(x,z);
   BIO.owner=[x,z];BIO.range=LT;BIO.minRange=0;K.grow(T,ld<240?2:lvFar);
   BIO.range=1e9;BIO.minRange=LT;K.grow(Object.assign({},T),0);BIO.owner=null;BIO.range=null;BIO.minRange=0;
   S.insert(T,x,z,(T.rb==null?1:T.rb)*1.4+2);TREES.push({key:row.key,x,z,y:T.y0,H:T.H,crownR:T.crownR});
   BIO.record({kind:'tree',key:row.key,name:row.name,x,y:T.y0,z,r:T.crownR==null?4:T.crownR,h:T.H});n++;}
  out.kin[row.key]=n;out.trees+=n;return n;}
 const KIN={};OGATE.KIN.forEach(r=>{KIN[r.key]=BIO.kin(r.from,{key:r.key,name:r.name,scale:r.scale,tags:r.tags});});
 const row=k=>OGATE.KIN.find(r=>r.key===k);
 BIO.cur='ogate/woods';
 lattice(KIN.gatecottonwood,row('gatecottonwood'),34/sq,0x6c01,(x,z)=>Math.max(smooth(.15,.6,F('bankX',x,z))*.7,smooth(.3,.8,F('bar',x,z))*.25)*(1-F('works',x,z)),5,1);
 lattice(KIN.barcottonwood,row('barcottonwood'),22/sq,0x6c02,(x,z)=>smooth(.4,.9,F('bar',x,z))*.5*(1-F('works',x,z)),2,1);
 lattice(KIN.gateoak,row('gateoak'),48/sq,0x6c03,(x,z)=>smooth(.9,.4,F('floor',x,z))*smooth(.3,0,F('bank',x,z))*.55*(1-F('works',x,z)),4,1);
 lattice(KIN.gatemaple,row('gatemaple'),56/sq,0x6c04,(x,z)=>smooth(.2,.6,F('swale',x,z))*smooth(.4,0,F('bank',x,z))*.6*(1-F('works',x,z)),4,1);
 // the reed beds: on the channels' lips (the exact bank field over .65), near the eye; a bed is 8-16 rods round a point
 BIO.cur='ogate/reeds';BIO.range=420;const SR=OGATE.byKey.gatereed,C=OGATE.C;
 out.reeds=BIO.grid('og:reed',6/sq,(x,z)=>smooth(.62,.85,F('bankX',x,z))*.8,(x,y,z,seed)=>{const n=ri(8,16),lb=SR.name,dry=rr(0,1)<.25;
  for(let k=0;k<n;k++){const a=rr(0,6.283),d=Math.sqrt(rr(0,1))*1.4,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;if(BIO.mask(px,pz)<=0)continue;
   const H=rr(2,3.5),lean=[rr(-.12,.12),1,rr(-.12,.12)],c=C(pick(dry?OGATE.PAL.reedDry:OGATE.PAL.reed));c.offsetHSL(0,0,rr(-.04,.04));
   BIO.put('reed',[px,Y(px,pz)-.1,pz],qUp(lean),[1,H,1],c,{label:lb});}},{box:[-R,-R,R,R],patch:.5});
 BIO.range=null;BIO.cur=null;
 return out;};
})();
