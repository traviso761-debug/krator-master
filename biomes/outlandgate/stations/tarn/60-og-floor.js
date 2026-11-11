// ================================================================= OUTLAND GATE — station 3's flora placed: the tarn's woods and the Outlands' stragglers
// The gap's south end is where the two worlds meet (PLAN.md section 4): the crater side's woods (ebadlands' cottonwood, oak and maple, read
// in place as on station 1: OGATE.KIN) and THE OUTLANDS' FUNGOID NATIVES coming in on the night wind and the river. The plan's leak runs one
// way, north: here the natives are YOUNG COLONIES (biomes/outlands PLAN.md section 4: one buried mycelium raising its forms by role), each
// a mast colony's first forms round its seed, on the wet ground only (the shore, the coulee's floor, the banks): deck-cap masts (its
// collector), a troop of cap-shrubs (its breeder), a few lantern pods (the veil colony's breeder, come further). The forms are the Outlands
// kit's own items (biomes/outlands/src/50-outl-species.js, read in place: station.json "kin"), put in ITS registry; no colony pass runs here
// (there are no seams to keep: the colonies are too young and too far apart to meet; KNOWN_ISSUES.md). Every tree and colony a record.
(function(){const {clamp,smooth,rr,ri,pick,qUp,qEuler,lerp,fbm,TAU}=BIO.fn;
const F=(n,x,z)=>BIO.field(n,x,z),Y=(x,z)=>BIO.terrainH(x,z);
OGATE.build=function(opt){opt=opt||{};const R=opt.R==null?3250:opt.R,q=opt.quality==null?1:opt.quality,sq=Math.sqrt(q);
 const out={trees:0,reeds:0,colonies:0,forms:0,kin:{}},TREES=OGATE.TREES=[],COL=OGATE.COLONIES=[],S=KSPACE.create({cell:60});
 const clear=(x,z,r)=>!S.some(x,z,r,()=>true)&&BIO.clearOf(x,z,r)&&BIO.mask(x,z)>.9&&Y(x,z)-BIO.waterH(x,z)>.6;
 const W=6300,LT=1100,KIN={};OGATE.KIN.forEach(r=>{KIN[r.key]=BIO.kin(r.from,{key:r.key,name:r.name,scale:r.scale,tags:r.tags});});
 const row=k=>OGATE.KIN.find(r=>r.key===k);
 function lattice(key,cell,salt,accept,minR,lvFar){const K=KIN[key],rw=row(key);if(!K){BIO.err('ogate: no kin '+rw.from);return 0;}let n=0;const N=Math.ceil(R/cell);
  for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){const h=KRAND.hash(W,i,j,salt),u=k=>KRAND.unit(KRAND.hash(h,k,0,salt)),x=(i+u(1))*cell,z=(j+u(2))*cell;
   if(Math.abs(x)>R||Math.abs(z)>R||u(3)>accept(x,z)||!clear(x,z,minR))continue;
   BIO.fn.reseed(h);const T=K.make(x,Y(x,z),z),ld=BIO.lodD(x,z);
   BIO.owner=[x,z];BIO.range=LT;BIO.minRange=0;K.grow(T,ld<240?2:lvFar);
   BIO.range=1e9;BIO.minRange=LT;K.grow(Object.assign({},T),0);BIO.owner=null;BIO.range=null;BIO.minRange=0;
   S.insert(T,x,z,(T.rb==null?1:T.rb)*1.4+2);TREES.push({key,x,z,y:T.y0,H:T.H,crownR:T.crownR});
   BIO.record({kind:'tree',key,name:rw.name,x,y:T.y0,z,r:T.crownR==null?4:T.crownR,h:T.H});n++;}
  out.kin[key]=n;out.trees+=n;return n;}
 const off=(x,z)=>(1-F('works',x,z))*smooth(.5,.15,F('rock',x,z));
 BIO.cur='ogate/woods';
 lattice('gatecottonwood',30/sq,0x6e01,(x,z)=>Math.max(smooth(.15,.6,F('bankX',x,z))*.7,smooth(.3,.8,F('shore',x,z))*.3)*off(x,z),5,1);
 lattice('barcottonwood',24/sq,0x6e02,(x,z)=>smooth(.5,.9,F('coulee',x,z))*smooth(.4,0,F('bank',x,z))*.12*off(x,z),2,1);
 lattice('gateoak',52/sq,0x6e03,(x,z)=>smooth(.4,.8,F('tread',x,z))*smooth(.2,0,F('coulee',x,z))*smooth(.3,0,F('shore',x,z))*.45*off(x,z),4,1);
 lattice('gatemaple',60/sq,0x6e04,(x,z)=>smooth(.4,.8,F('tread',x,z))*smooth(.2,0,F('coulee',x,z))*smooth(.55,.7,fbm(x*.003,z*.003,6361,2))*.5*off(x,z),4,1);
 // the reed beds: the river's lips in the coulee and the tarn's beach, near the eye
 BIO.cur='ogate/reeds';BIO.range=420;const SR=OGATE.byKey.gatereed,C=OGATE.C;
 out.reeds=BIO.grid('og:reed',6/sq,(x,z)=>Math.max(smooth(.62,.85,F('bankX',x,z))*.8,smooth(.7,.95,F('shore',x,z))*.25)*(1-F('works',x,z)),(x,y,z,seed)=>{const n=ri(8,16),lb=SR.name,dry=rr(0,1)<.25;
  for(let k=0;k<n;k++){const a=rr(0,6.283),d=Math.sqrt(rr(0,1))*1.4,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;if(BIO.mask(px,pz)<=0)continue;
   const H=rr(2,3.5),lean=[rr(-.12,.12),1,rr(-.12,.12)],c=C(pick(dry?OGATE.PAL.reedDry:OGATE.PAL.reed));c.offsetHSL(0,0,rr(-.04,.04));
   BIO.put('reed',[px,Y(px,pz)-.1,pz],qUp(lean),[1,H,1],c,{label:lb});}},{box:[-R,-R,R,R],patch:.5});
 BIO.range=null;BIO.cur=null;
 // ---- THE OUTLANDS' STRAGGLERS: young colonies on a 220 m lattice, on the wet ground only, put in the Outlands kit's own registry
 if(typeof OUTL!=='undefined'){BIO.kit('outl');BIO.cur='ogate/stragglers';
  const P=OUTL.PAL,FG=BIO.fung,col=(set,k)=>{const c=OUTL.C(pick(set));if(k!=null)c.multiplyScalar(k);c.offsetHSL((BIO.fn.rng()-.5)*.03,(BIO.fn.rng()-.5)*.06,(BIO.fn.rng()-.5)*.05);return c;};
  const lab=n=>n+' (a young colony of the Outlands\' fungoid natives, come down the gap: biomes/outlands)',cell=220/sq,N=Math.ceil(R/cell);
  for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){const h=KRAND.hash(W,i,j,0x6e10),u=k=>KRAND.unit(KRAND.hash(h,k,0,0x6e10)),x=(i+u(1))*cell,z=(j+u(2))*cell;
   if(Math.abs(x)>R||Math.abs(z)>R)continue;const wet=Math.max(F('shore',x,z),F('coulee',x,z)*.8,F('bank',x,z));if(u(3)>smooth(.25,.7,wet)*.85||!clear(x,z,6))continue;
   BIO.fn.reseed(h);const rc=rr(14,34),y=Y(x,z),c={x,z,y,r:rc,forms:0};
   // the collector: deck-cap masts round the seed
   for(let k=0,n=ri(2,5);k<n;k++){const a=rr(0,TAU),d=rr(0,rc*.5),mx=x+Math.cos(a)*d,mz=z+Math.sin(a)*d;if(BIO.mask(mx,mz)<.9||BIO.waterH(mx,mz)>-1e8)continue;
    const H=rr(4,8),r=rr(.16,.26),y0=Y(mx,mz)-.25,nc=ri(2,4),bend=rr(-.04,.04);
    BIO.put('stalk',[mx,y0,mz],qEuler(bend,rr(0,TAU),rr(-.04,.04)),[r/.08,H,r/.08],col(P.deckStalk),{label:lab('Deck caps')});
    for(let m=0;m<nc;m++){const t=.45+.55*m/Math.max(1,nc-1),cr=lerp(2.1,1.1,m/Math.max(1,nc-1))*rr(.85,1.15);
     BIO.put('dcap',[mx+bend*H*t*t,y0+H*t,mz],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[cr,cr*rr(.75,1),cr],col(P.deck),{label:lab('Deck caps')});}c.forms++;}
   // the breeder: a troop of cap-shrubs toward the seed
   for(const p of FG.troop({n:ri(3,7),r:rc*.25,size:[.3,.6],flat:[.9,1.2],tilt:.15,seed:KRAND.hash(6371,Math.floor(x*4),Math.floor(z*4))})){const px=x+p.p[0],pz=z+p.p[2];
    if(BIO.mask(px,pz)<=0||BIO.waterH(px,pz)>-1e8)continue;BIO.put('capsm',[px,Y(px,pz)-.05,pz],FG.Q(p.q),p.s,col(P.capshrub).offsetHSL(0,0,(p.u-.5)*.08),{label:lab('Cap-shrubs')});c.forms++;}
   // the veil colony's lanterns, a few, come furthest (on short stalks)
   if(rr(0,1)<.45)for(let k=0,n=ri(1,3);k<n;k++){const a=rr(0,TAU),d=rr(rc*.3,rc*.8),px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;if(BIO.mask(px,pz)<.9||BIO.waterH(px,pz)>-1e8)continue;
    const H=rr(1.2,2.2),y0=Y(px,pz)-.15;BIO.put('stalk',[px,y0,pz],qEuler(0,rr(0,TAU),0),[2,H,2],col(P.flesh),{label:lab('Lantern pods')});
    BIO.put('pod',[px,y0+H,pz],qEuler(0,rr(0,TAU),0),[.7,.8,.7],col(P.lantern),{label:lab('Lantern pods')});c.forms++;}
   if(!c.forms)continue;S.insert(c,x,z,rc*.6);COL.push(c);out.forms+=c.forms;
   BIO.record({kind:'colony',key:'outl.mast:'+i+':'+j,name:'A young Outlands colony (deck caps, cap-shrubs: the mast colony\'s first forms, come down the gap)',x,y,z,r:rc,h:8});}
  out.colonies=COL.length;BIO.cur=null;BIO.kitEnd(OUTL);}
 return out;};
})();
