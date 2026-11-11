// ================================================================= FARSIDE — the stands: the land kelp, the dead at the front
// Placed by zone from the host's fields (spray, invade, front, native, sand, coral, rock, graze, burn, fog) and terrainH.
// PLACEMENT ON core/rand: every candidate is one cell of a jittered grid, drawn from KRAND.stream(KRAND.cell(seed of the
// pass, ix, iz)), and every stand is built from its own seed (KRAND.hash of the pass, the cell, the index): a tile built
// alone draws what it draws in a full build, and adding a pass moves nothing in another (CLAUDE.md, "same on every machine").
// THE WIND: the blades stream inland, down the host's onshore wind (BIO.host.farside.wind: the north-wester, toward the
// south-east), lying out flatter the stronger the spray; stipes lean together a little down it.
// RUNTIME LOD (the core's): a hero stand is drawn in full within FARSIDE.LOD.tree of its chunk and as a lite stand-in past
// it; a far stand is only ever its stand-in.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rr,ri,pick,fbm,qEuler}=BIO.fn;
const T3=BIO.host.THREE,C=h=>new T3.Color(h),SP=FARSIDE.SPECIES,PAL=FARSIDE.PAL;
FARSIDE.LOD={tree:1100,floor:420,floorMid:900,dress:900};
FARSIDE.STANDS=[];
const Y=(x,z)=>BIO.terrainH(x,z),FL=(n,x,z)=>BIO.field(n,x,z);
const WIND=()=>(BIO.host.farside&&BIO.host.farside.wind)||[Math.SQRT1_2,Math.SQRT1_2];
// ---------------------------------------------------------------- zones from the fields
function zones(x,z){const spray=FL('spray',x,z),inv=FL('invade',x,z),front=FL('front',x,z),nat=FL('native',x,z),fog=FL('fog',x,z),
 sand=FL('sand',x,z),coral=FL('coral',x,z),rock=FL('rock',x,z),graze=FL('graze',x,z),burn=FL('burn',x,z),strandL=FL('strand',x,z),out=FL('outrider',x,z);
 const strand=smooth(.84,.95,spray)*Math.max(sand,coral,rock,strandL,smooth(.93,.99,spray));
 return{spray,inv,front,nat,fog,sand,coral,rock,graze,burn,strandL,out,strand,
  kelpcoast:inv*(1-strand)*(1-front),cloud:nat*fog,lee:nat*(1-fog)*(1-front)};}
FARSIDE.zones=zones;
// ---------------------------------------------------------------- the grid on core/rand
// kgrid(salt, cell, accept(Z,x,z)->0..1, fn(x,y,z,seed,Z), opt{box, noMask}): one candidate per cell of the page's square
const ROOT=()=>KRAND.child(BIO.host.seed>>>0,'farside');
FARSIDE.kgrid=function(salt,cell,accept,fn,opt){opt=opt||{};const R=opt.R||FARSIDE._R||1500,B=opt.box||[-R,-R,R,R],s0=KRAND.child(ROOT(),salt);let n=0;
 const ix0=Math.floor(B[0]/cell),ix1=Math.floor(B[2]/cell),iz0=Math.floor(B[1]/cell),iz1=Math.floor(B[3]/cell);
 for(let iz=iz0;iz<=iz1;iz++)for(let ix=ix0;ix<=ix1;ix++){const s=KRAND.stream(KRAND.cell(s0,ix,iz)),x=(ix+s.next())*cell,z=(iz+s.next())*cell,u=s.next();
  if(Math.max(Math.abs(x),Math.abs(z))>R)continue;const Z=zones(x,z),a=accept(Z,x,z);if(a<=0||u>a)continue;
  const m=opt.noMask?1:BIO.mask(x,z);if(m<=0||u>a*m)continue;if(!BIO.clearOf(x,z,opt.pad||0))continue;
  fn(x,Y(x,z),z,KRAND.hash(s0,ix,iz,n+1),Z);n++;}
 return n;};
// ---------------------------------------------------------------- colour
const _hsl={h:0,s:0,l:0};
const vary=(hex,dh,ds,dl)=>{const c=hex.isColor?hex.clone():C(hex);c.getHSL(_hsl);c.setHSL(((_hsl.h+rr(-dh,dh))%1+1)%1,clamp(_hsl.s+rr(-ds,ds),0,1),clamp(_hsl.l+rr(-dl,dl),.03,.97));return c;};
FARSIDE.vary=vary;
// a quaternion turning local -y (a streamer hangs down it) onto the direction d, rolled by r about it
const _v0=new T3.Vector3(0,-1,0),_v1=new T3.Vector3(),_qr=new T3.Quaternion();
function qHang(d,roll){_v1.set(d[0],d[1],d[2]).normalize();const q=new T3.Quaternion().setFromUnitVectors(_v0,_v1);_qr.setFromAxisAngle(_v1,roll||0);return _qr.clone().multiply(q);}
FARSIDE.qHang=qHang;
// the direction a blade streams at a point: down the wind, lying out flatter the stronger the spray (a slope moves as a seabed)
function streamDir(spray,k){const w=WIND(),dip=-lerp(.75,.28,clamp(spray*1.4,0,1))-rr(0,.22),side=rr(-.3,.3);
 return[w[0]*k+(-w[1])*side,dip,w[1]*k+w[0]*side];}
FARSIDE.streamDir=streamDir;
// ---------------------------------------------------------------- the LAND KELP: a stand from one tangle of holdfasts
// T: {x, z, y0, H, n (stipes), form 'giant'|'bull', spray, seed, lv 2 near, 1 mid}
function buildKelp(T,st){reseed(T.seed);const w=WIND(),bull=T.form==='bull'||T.form==='elk',lv=T.lv,blades=['blade0','blade1','blade2'];
 const stipeC=()=>vary(C(pick(PAL.stipe)),.01,.06,.05),baseC=C(pick(PAL.stipeBase));
 // the holdfast: a tangle of root-like haptera splaying from the foot over the ground
 const nh=lv>1?ri(6,10):3;for(let i=0;i<nh;i++){const a=rr(0,TAU),L=rr(1,2.6)*(T.H/30),pts=[];
  for(let k=0;k<=4;k++){const t=k/4,x=T.x+Math.cos(a)*L*t,z=T.z+Math.sin(a)*L*t;pts.push({x,y:Math.max(Y(x,z)-.05,T.y0-.3)+.32*(1-t)*Math.sin(t*3),z,r:lerp(.16,.04,t)*(T.H/30+.4)});}
  st.tris+=BIO.tube('stipe',pts,baseC,{seg:4});}
 const n=bull?1:T.n;
 for(let s=0;s<n;s++){const a0=rr(0,TAU),r0=bull?0:rr(.2,1.1),bx=T.x+Math.cos(a0)*r0,bz=T.z+Math.sin(a0)*r0,H=T.H*(bull?1:rr(.62,1)),
   lean=rr(.06,.2)*(1-.5*T.spray),lx=w[0]*lean+rr(-.05,.05),lz=w[1]*lean+rr(-.05,.05),bow=rr(-.06,.06),seg=lv>1?Math.max(8,Math.round(H/2.6)):6,pts=[];
  const rb=(bull?rr(.07,.11):rr(.1,.2))*(T.H/30+.3),col=stipeC();
  for(let k=0;k<=seg;k++){const t=k/seg,y=T.y0+H*t;pts.push({x:bx+lx*H*t*t+bow*H*Math.sin(t*Math.PI),y,z:bz+lz*H*t*t-bow*H*Math.sin(t*Math.PI)*.5,r:rb*lerp(1.25,.45,t)*(1+.25*smooth(.25,0,t)),col:t<.18?baseC:col});}
  st.tris+=BIO.tube('stipe',pts,col,{seg:lv>1?6:4});st.stipes++;
  const top=pts[seg];
  if(T.form==='elk'){// ELK KELP (Pelagophycus): a float at the top and two antler arms from it, each hung with big blades
   const br=rr(.22,.34)*(T.H/30+.4),fy=top.y+br*.4;BIO.put('bulb',[top.x,fy,top.z],null,[br,br*1.15,br],vary(C(pick(PAL.bladder)),.01,.05,.05));st.bladders++;
   for(const sd of [-1,1]){const ax=-w[1]*sd,az=w[0]*sd,L=rr(1.6,2.6)*(T.H/30+.4),ap=[{x:top.x,y:fy,z:top.z,r:rb*.5}];
    for(let k=1;k<=3;k++){const t=k/3;ap.push({x:top.x+ax*L*t+w[0]*L*.3*t,y:fy+L*.35*Math.sin(t*2.2),z:top.z+az*L*t+w[1]*L*.3*t,r:rb*.5*(1-.5*t)});}
    st.tris+=BIO.tube('stipe',ap,col,{seg:4});
    const nb=lv>1?ri(5,8):3;for(let b=0;b<nb;b++){const t=rr(.3,1),k=Math.min(2,Math.floor(t*3)),p=ap[k],q=ap[k+1],f=t*3-k,L2=rr(4,8)*(T.H/30+.3),d=streamDir(T.spray,1);
     BIO.put(pick(blades),[lerp(p.x,q.x,f),lerp(p.y,q.y,f),lerp(p.z,q.z,f)],qHang(d,rr(0,TAU)),[L2*rr(.38,.52),L2,1],pick(PAL.blade));st.blades++;}}
   continue;}
  if(bull){// BULL KELP: one float the size of a head at the top, a mop of long blades streaming from it
   const br=rr(.28,.45)*(T.H/30+.4);BIO.put('bulb',[top.x,top.y+br*.5,top.z],null,[br,br*1.25,br],vary(C(pick(PAL.bladder)),.01,.05,.05));st.bladders++;
   const nb=lv>1?ri(12,18):6;for(let b=0;b<nb;b++){const L=rr(4,8)*(T.H/30+.3),d=streamDir(T.spray,1);BIO.put(pick(blades),[top.x,top.y+br*.4,top.z],qHang(d,rr(0,TAU)),[L*rr(.32,.45),L,1],pick(PAL.blade));st.blades++;}
   continue;}
  // GIANT KELP: a bladder and its blade every metre and a half up the top two thirds, alternating sides; a crown of long
  // blades from the top, all streaming inland
  const step=lv>1?rr(1.3,1.8):rr(2.6,3.4);
  for(let y=H*.3;y<H*.97;y+=step){const t=y/H,k=Math.min(seg-1,Math.floor(t*seg)),f=t*seg-k,p=pts[k],q=pts[k+1],x=lerp(p.x,q.x,f),yy=lerp(p.y,q.y,f),z=lerp(p.z,q.z,f);
   const side=((y/step)|0)%2?1:-1,ox=-w[1]*side*.18,oz=w[0]*side*.18,bs=rr(.08,.2)*(T.H/30+.4);
   if(lv>1&&((y/step)|0)%2===0){BIO.put('bladder',[x+ox,yy,z+oz],null,[bs,bs*1.6,bs],vary(C(pick(PAL.bladder)),.01,.06,.06));st.bladders++;}
   const L=rr(2.6,5.5)*(T.H/30+.35),d=streamDir(T.spray,1);BIO.put(pick(blades),[x+ox,yy+bs*.5,z+oz],qHang(d,rr(0,TAU)),[L*rr(.34,.48),L,1],pick(PAL.blade));st.blades++;}
  const nc=lv>1?ri(8,13):4;for(let b=0;b<nc;b++){const L=rr(3.5,7.5)*(T.H/30+.3),d=streamDir(T.spray,1);BIO.put(pick(blades),[top.x,top.y,top.z],qHang(d,rr(0,TAU)),[L*rr(.3,.42),L,1],pick(PAL.blade));st.blades++;}}
}
// the stand-in: two streaky tufts as tall as the stand, leaning down the wind (a far stand, and a hero's beyond its range)
function buildKelpFar(T,st){reseed(T.seed+77);const w=WIND(),W=Math.max(3,T.n*.9+2);
 for(let k=0;k<2;k++){const lean=.12,q=new T3.Quaternion().setFromUnitVectors(new T3.Vector3(0,1,0),new T3.Vector3(w[0]*lean,1,w[1]*lean).normalize());
  q.multiply(new T3.Quaternion().setFromAxisAngle(new T3.Vector3(0,1,0),rr(0,TAU)));BIO.put('kelpfar',[T.x+rr(-1,1),T.y0-.3,T.z+rr(-1,1)],q,[W,T.H*rr(.85,1.05),W],vary(C(0xd8c890),.01,.05,.05));st.far++;}}
// ---------------------------------------------------------------- THE DEAD at the front: drowned kauri and meranti
// A LIMB'S JOINT TO ITS BOLE (core/biome 31j, BIO.flareJoin; the owner, 2026-11-03, every rebuild turn): the limb's root sunk into the bole
// and swollen to a collar, so a snapped limb reads as grown from the snag, not a pipe pushed into it; no draws (the stream does not move).
// A page without 31j gets the limb as before. jsg: the sides at the joint (8 for a limb over .3 m)
const fj=(pts,pr)=>BIO.flareJoin?BIO.flareJoin(pts,{parentR:pr}):pts,jsg=(r,n)=>BIO.flareJoin&&r>.3?Math.max(n,8):n;
// a pale silvered bole with its buttress flare, the top broken, a few limbs snapped short; hung with wine weed and wrack
function buildSnag(T,st){reseed(T.seed);const pts=[],seg=10,H=T.H,rb=T.rb,lx=rr(-.04,.04),lz=rr(-.04,.04),col=vary(C(pick(PAL.snag)),.01,.04,.06);
 for(let k=0;k<=seg;k++){const t=k/seg;pts.push({x:T.x+lx*H*t,y:T.y0-.8+H*t,z:T.z+lz*H*t,r:rb*lerp(1,.55,t)*(1+1.1*Math.pow(smooth(.12,0,t),2))});}
 st.tris+=BIO.tube('snag',pts,col,{seg:9,rfn:(i,a)=>1+.08*Math.sin(a*5+i)});st.snags++;
 const top=pts[seg],limbs=[];
 for(let l=0;l<ri(3,6);l++){const t=rr(.55,.95),k=Math.floor(t*seg),p=pts[k],a=rr(0,TAU),el=rr(.2,.8),L=rr(3,9)*(rb/1.6),r=rb*rr(.22,.4),lp=[];
  for(let j=0;j<=3;j++){const s=j/3;lp.push({x:p.x+Math.cos(a)*L*s*Math.cos(el),y:p.y+L*s*Math.sin(el)-.4*s*s*L*.2,z:p.z+Math.sin(a)*L*s*Math.cos(el),r:r*lerp(1,.5,s)});}
  st.tris+=BIO.tube('snag',fj(lp,p.r),col,{seg:jsg(r,6)});limbs.push(lp[3]);}
 T.hangs=limbs.concat([top]);}
// ---------------------------------------------------------------- the passes
FARSIDE.buildStands=function(R,q,opt){opt=opt||{};q=q==null?1:q;FARSIDE._R=R;const st={tris:0,stipes:0,bladders:0,blades:0,far:0,snags:0,heroes:0,fars:0};
 const S=FARSIDE.STANDS;S.length=0;const L=FARSIDE.LOD,hero=BIO.radii().hero+500,keep=[];
 const lvOf=(x,z)=>{const d=BIO.lodD(x,z);return d<BIO.radii().hero?2:d<hero+600?1:0;};
 const SPX=KSPACE.create({cell:12}),_nb=[],sp={push:o=>SPX.insert(o,o.x,o.z,o.r)};   /* keep-clear between stands: core/space */
 const clear=(x,z,r)=>!SPX.some(x,z,r,o=>Math.hypot(x-o.x,z-o.z)<o.r+r);
 // the KELP COAST: stands where the sea's flora holds, thinner where the goats crop and the front is burned, short and
 // wind-cut in the spray; seedlings ahead of it at the front
 FARSIDE.kgrid('kelp',17/Math.sqrt(q),Z=>(Z.sand>.35||Z.coral>.45||Z.rock>.45)?0:Z.kelpcoast*(1-Z.sand)*(1-Z.coral*.9)*(1-Z.rock)*(1-Z.graze*.8)*(1-Z.burn)*.5+Z.front*(1-Z.burn)*.12,(x,y,z,seed,Z)=>{
  const r=3.2;if(!clear(x,z,r))return;const fr=Z.front>.3,s=KRAND.stream(seed);
  const T={x,z,y0:y,seed,spray:Z.spray,form:(f=>f<.14?'bull':f<.24?'elk':'giant')(s.next()),n:fr?1:2+Math.floor(s.next()*4),
   H:(fr?lerp(4,12,s.next()):lerp(20,40,s.next()))*lerp(1,.45,smooth(.8,1,Z.spray))*lerp(1,.6,FL('trim',x,z)),lv:lvOf(x,z),key:'landkelp'};   /* trim: under a tsunami's run-up ceiling the stands are younger (the host's field; 0 where none) */
  sp.push({x,z,r});S.push(T);},{pad:1});
 // THE DEAD: drowned kauri and meranti standing in the front, the sea's weed hung from them
 FARSIDE.kgrid('snag',36/Math.sqrt(q),Z=>Z.front*(1-Z.sand)*.5,(x,y,z,seed)=>{if(!clear(x,z,4))return;const s=KRAND.stream(seed);
  const T={x,z,y0:y,seed,H:lerp(24,50,s.next()),rb:lerp(.9,2.2,s.next()),lv:lvOf(x,z),key:'snag'};sp.push({x,z,r:4});S.push(T);});
 // build
 S.forEach(T=>{BIO.owner=[T.x,T.z];
  if(T.key==='snag'){BIO.range=L.tree*1.4;BIO.minRange=0;buildSnag(T,st);st.heroes++;
   BIO.register({name:FARSIDE.DEAD.name,key:'snag',kind:'tree',x:T.x,z:T.z,y:T.y0,r:T.rb*2+2,h:T.H});
   BIO.host.obstacles.push({x:T.x,z:T.z,r:T.rb*1.5+1,y0:T.y0-3,y1:T.y0+T.H});return;}
  if(T.lv===0){BIO.range=null;BIO.minRange=0;buildKelpFar(T,st);st.fars++;return;}
  BIO.range=L.tree;BIO.minRange=0;buildKelp(T,st);st.heroes++;
  BIO.range=1e9;BIO.minRange=L.tree;buildKelpFar(T,st);
  if(T.lv===2&&T.H>14)BIO.register({name:'Land kelp ('+(T.form==='bull'?'a bull kelp':'a stand of '+T.n)+')',key:'landkelp',kind:'stand',x:T.x,z:T.z,y:T.y0,r:3.5,h:T.H});
  BIO.host.obstacles.push({x:T.x,z:T.z,r:T.form==='bull'?1:2.2,y0:T.y0-2,y1:T.y0+T.H});});
 BIO.owner=null;BIO.range=null;BIO.minRange=0;
 return{stands:S.filter(T=>T.key==='landkelp').length,snags:st.snags,heroes:st.heroes,far:st.fars,stipes:st.stipes,bladders:st.bladders,blades:st.blades};};
FARSIDE._canopyH=function(x,z){let h=0;for(const T of FARSIDE.STANDS)if(Math.hypot(x-T.x,z-T.z)<8)h=Math.max(h,T.y0+T.H);return h||Y(x,z)+1;};
})();
