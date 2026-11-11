// ================================================================= OUTLAND GATE — station 2's flora placed: the West Bench's woods and the seeps' sedges
// Every tree from a lattice whose cell is KRAND.hash(world, i, j, salt) and whose numbers come from a reseed of that hash: nothing placed
// moves another. Clear of each other (core/space), of the works, the dike ribs and the water (the host's mask). Each tree a core/tags record.
//   seepfern     in the alcoves and on the seeps' wettest ground, out of the wind
//   brookwillow  along the seeps' runs and round the stairs' aprons (off the sinter itself)
//   ironbirch    the middle slope, in stands      bannerlarch  the upper slope      windspruce  the slope's top (Cfb)
//   gatereed     sedge beds on the stairs' rims and the alcoves' floors, near the eye (BIO.range)
(function(){const {clamp,smooth,rr,ri,pick,qUp,fbm}=BIO.fn;
const F=(n,x,z)=>BIO.field(n,x,z),Y=(x,z)=>BIO.terrainH(x,z);
OGATE.build=function(opt){opt=opt||{};const R=opt.R==null?3250:opt.R,q=opt.quality==null?1:opt.quality,sq=Math.sqrt(q);
 const out={trees:0,reeds:0,kin:{}},TREES=OGATE.TREES=[],S=KSPACE.create({cell:60});
 const clear=(x,z,r)=>!S.some(x,z,r,()=>true)&&BIO.clearOf(x,z,r)&&BIO.mask(x,z)>.9&&Y(x,z)-BIO.waterH(x,z)>.6;
 const W=6200,LT=1100,KIN={};
 OGATE.KINX.forEach(r=>{KIN[r.key]=BIO.kin(r.from,{key:r.key,name:r.name,scale:r.scale,tags:r.tags});});
 const row=k=>OGATE.KINX.find(r=>r.key===k);
 function lattice(key,cell,salt,accept,minR,lvFar){const K=KIN[key],rw=row(key);if(!K){BIO.err('ogate: no kin '+rw.from);return 0;}let n=0;const N=Math.ceil(R/cell);
  for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){const h=KRAND.hash(W,i,j,salt),u=k=>KRAND.unit(KRAND.hash(h,k,0,salt)),x=(i+u(1))*cell,z=(j+u(2))*cell;
   if(Math.abs(x)>R||Math.abs(z)>R||u(3)>accept(x,z)||!clear(x,z,minR))continue;
   BIO.fn.reseed(h);const T=K.make(x,Y(x,z),z),ld=BIO.lodD(x,z);
   BIO.owner=[x,z];BIO.range=LT;BIO.minRange=0;K.grow(T,ld<240?2:lvFar);
   BIO.range=1e9;BIO.minRange=LT;K.grow(Object.assign({},T),0);BIO.owner=null;BIO.range=null;BIO.minRange=0;
   S.insert(T,x,z,(T.rb==null?1:T.rb)*1.4+2);TREES.push({key,x,z,y:T.y0,H:T.H,crownR:T.crownR});
   BIO.record({kind:'tree',key,name:rw.name,x,y:T.y0,z,r:T.crownR==null?4:T.crownR,h:T.H});n++;}
  out.kin[key]=n;out.trees+=n;return n;}
 const off=(x,z)=>(1-F('works',x,z))*(1-F('dike',x,z)*.8)*smooth(.5,.2,F('sinterX',x,z));
 BIO.cur='ogate/woods';
 lattice('seepfern',16/sq,0x6d01,(x,z)=>Math.max(smooth(.3,.7,F('alcove',x,z))*.75,smooth(.6,.9,F('seep',x,z))*.3)*off(x,z),2.5,1);
 lattice('brookwillow',22/sq,0x6d02,(x,z)=>smooth(.3,.7,F('seep',x,z))*smooth(.6,.3,F('alcove',x,z))*.55*off(x,z),3,1);
 lattice('ironbirch',30/sq,0x6d03,(x,z)=>{const hi=F('hi',x,z),st=smooth(.48,.62,fbm(x*.003,z*.003,6261,2));return smooth(.9,.4,hi)*smooth(.05,.3,hi+.2)*st*.5*smooth(.5,.1,F('seep',x,z))*off(x,z);},4,1);
 lattice('bannerlarch',40/sq,0x6d04,(x,z)=>smooth(.25,.6,F('hi',x,z))*smooth(1,.85,F('hi',x,z))*.4*smooth(.5,.1,F('seep',x,z))*off(x,z),4,1);
 lattice('windspruce',20/sq,0x6d05,(x,z)=>smooth(.55,.9,F('hi',x,z))*.5*off(x,z),2,1);
 // the sedge beds: the stairs' rims and the alcoves' floors, near the eye; a bed is 8-16 rods round a point
 BIO.cur='ogate/reeds';BIO.range=420;const SR=OGATE.byKey.gatereed,C=OGATE.C;
 out.reeds=BIO.grid('og:sedge',6/sq,(x,z)=>Math.max(smooth(.55,.85,F('sinterX',x,z))*.5,smooth(.5,.9,F('alcove',x,z))*.25)*(1-F('works',x,z)),(x,y,z,seed)=>{const n=ri(8,16),lb=SR.name,dry=rr(0,1)<.25;
  for(let k=0;k<n;k++){const a=rr(0,6.283),d=Math.sqrt(rr(0,1))*1.4,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;if(BIO.mask(px,pz)<=0)continue;
   const H=rr(1.2,2.2),lean=[rr(-.12,.12),1,rr(-.12,.12)],c=C(pick(dry?OGATE.PAL.reedDry:OGATE.PAL.reed));c.offsetHSL(0,0,rr(-.04,.04));
   BIO.put('reed',[px,Y(px,pz)-.1,pz],qUp(lean),[1,H,1],c,{label:lb});}},{box:[-R,-R,R,R],patch:.5});
 BIO.range=null;BIO.cur=null;
 return out;};
})();
