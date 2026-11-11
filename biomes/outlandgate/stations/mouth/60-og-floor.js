// ================================================================= OUTLAND GATE — station 4's flora placed: the delta's woods, its reeds and the silk
// Every tree from a lattice whose cell is KRAND.hash(world, i, j, salt) and whose numbers come from a reseed of that hash: nothing placed
// moves another. Clear of each other (core/space), of the landing and of the water (the host's mask). Each tree a core/tags record.
//   swamppaperbark  the backswamps      leveepoplar  the levees and the coves' runs      ghostgum  the rises north and south
//   gatereed        beds on the channels' lips, the delta's front and the coves, near the eye (BIO.range)
//   silk            the gilded orb spiders' webs, ONLY in the spiders' ground (opt.webZones: the stage's, each a hunter hazard), each strung
//                   between a tree and its neighbour 5-24 m off, at a third to a half of the shorter tree's height
(function(){const {clamp,smooth,rr,ri,pick,qUp,qEuler,fbm}=BIO.fn;
const F=(n,x,z)=>BIO.field(n,x,z),Y=(x,z)=>BIO.terrainH(x,z);
OGATE.build=function(opt){opt=opt||{};const R=opt.R==null?3250:opt.R,q=opt.quality==null?1:opt.quality,sq=Math.sqrt(q);
 const out={trees:0,reeds:0,webs:0,kin:{}},TREES=OGATE.TREES=[],WEBS=OGATE.WEBS=[],S=KSPACE.create({cell:60});
 const clear=(x,z,r)=>!S.some(x,z,r,()=>true)&&BIO.clearOf(x,z,r)&&BIO.mask(x,z)>.9&&Y(x,z)-BIO.waterH(x,z)>.6;
 const W=6400,LT=1100,KIN={};OGATE.KINX.forEach(r=>{KIN[r.key]=BIO.kin(r.from,{key:r.key,name:r.name,scale:r.scale,tags:r.tags});});
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
 const off=(x,z)=>1-F('works',x,z);
 BIO.cur='ogate/woods';
 lattice('swamppaperbark',18/sq,0x6f01,(x,z)=>smooth(.15,.5,F('swamp',x,z))*.75*off(x,z),3,1);
 lattice('leveepoplar',24/sq,0x6f02,(x,z)=>Math.max(smooth(.3,.7,F('levee',x,z))*.6,smooth(.3,.7,F('cove',x,z))*smooth(.9,.7,F('cove',x,z))*.5)*off(x,z),3.5,1);
 lattice('ghostgum',46/sq,0x6f03,(x,z)=>smooth(.3,.8,F('rise',x,z))*smooth(.5,.62,fbm(x*.003,z*.003,6461,2))*.6*off(x,z),5,1);
 // the reed beds
 BIO.cur='ogate/reeds';BIO.range=420;const SR=OGATE.byKey.gatereed,C=OGATE.C;
 out.reeds=BIO.grid('og:reed',6/sq,(x,z)=>Math.max(smooth(.62,.85,F('bankX',x,z))*.8,smooth(.5,.9,F('shore',x,z))*.5,smooth(.6,.85,F('cove',x,z))*smooth(.95,.85,F('cove',x,z))*.4)*off(x,z),(x,y,z,seed)=>{const n=ri(8,16),lb=SR.name,dry=rr(0,1)<.2;
  for(let k=0;k<n;k++){const a=rr(0,6.283),d=Math.sqrt(rr(0,1))*1.4,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;if(BIO.mask(px,pz)<=0)continue;
   const H=rr(2,3.5),lean=[rr(-.12,.12),1,rr(-.12,.12)],c=C(pick(dry?OGATE.PAL.reedDry:OGATE.PAL.reed));c.offsetHSL(0,0,rr(-.04,.04));
   BIO.put('reed',[px,Y(px,pz)-.1,pz],qUp(lean),[1,H,1],c,{label:lb});}},{box:[-R,-R,R,R],patch:.5});
 // the silk: in each of the spiders' zones, up to a dozen webs, each between a tree and its nearest neighbour 5-24 m off
 BIO.cur='ogate/silk';const SC=new BIO.host.THREE.Color(0xf4f0e4);
 (opt.webZones||[]).forEach((Z,zi)=>{const inZ=TREES.filter(t=>Math.hypot(t.x-Z.x,t.z-Z.z)<Z.r);let n=0;
  for(let k=0;k<inZ.length&&n<12;k++){const A=inZ[k];let B=null,bd=1e9;for(const t of inZ){if(t===A)continue;const d=Math.hypot(t.x-A.x,t.z-A.z);if(d>=5&&d<=24&&d<bd){bd=d;B=t;}}
   if(!B||KRAND.unit(KRAND.hash(W,zi,k,0x6f10))>.75)continue;BIO.fn.reseed(KRAND.hash(W,zi,k,0x6f11));
   const mx=(A.x+B.x)/2,mz=(A.z+B.z)/2,w=bd*rr(.6,.8),hh=w*rr(.8,1),y0=Math.max(Y(mx,mz)+1,Math.min(A.y,B.y)+Math.min(A.H,B.H)*rr(.3,.45)-hh/2);
   const ry=-Math.atan2(B.z-A.z,B.x-A.x);BIO.put('silk',[mx,y0,mz],qEuler(rr(-.05,.05),ry,rr(-.08,.08)),[w,hh,1],SC.clone().offsetHSL(0,0,rr(-.03,.03)),{label:'Silk: a gilded orb spider\'s web (strung between two trees)'});
   const nx=-(B.z-A.z)/bd,nz=(B.x-A.x)/bd;WEBS.push({x:mx,z:mz,y:y0+hh/2,nx,nz,a:{x:A.x,z:A.z},b:{x:B.x,z:B.z},d:bd});n++;}});
 out.webs=WEBS.length;BIO.range=null;BIO.cur=null;
 return out;};
})();
