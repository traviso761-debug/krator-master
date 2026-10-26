// ================================================================= FARSIDE — the floor: the strand, the kelp forest's floor, the fog's crusts
// Every pass is a core/rand grid (FARSIDE.kgrid) by zone, in two bands of the runtime LOD: NEAR (fine cells, drawn within
// FARSIDE.LOD.floor of the camera) over the spine's floor radius, and MID (cells 2.4 times as wide, plants half as large
// again, drawn within LOD.floorMid) beyond it, so the page holds a dense floor only where the eye can see one.
//   the strand     eelgrass meadows on the sand, lying flat inland; windrows of its dead leaf; wrack heaped on the wrack
//                  line; sea palms and wrack on the surf rocks; spray coral thickets and heads on the terraces and reefs
//   the kelp coast sea lettuce on every wet surface, anemones in clumps, wrack fallen from the stands
//   the fog        fog sponge towers on the rock and the ground
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rr,ri,pick,fbm}=BIO.fn;
const T3=BIO.host.THREE,C=h=>new T3.Color(h),PAL=FARSIDE.PAL,vary=FARSIDE.vary;
const UP=new T3.Vector3(0,1,0),_d=new T3.Vector3();
const WIND=()=>(BIO.host.farside&&BIO.host.farside.wind)||[Math.SQRT1_2,Math.SQRT1_2];
// a tuft leaning down the wind by `tilt` radians, turned about itself by `spin`
function qLean(tilt,spin){const w=WIND();_d.set(w[0]*Math.sin(tilt),Math.cos(tilt),w[1]*Math.sin(tilt)).normalize();
 return new T3.Quaternion().setFromUnitVectors(UP,_d).multiply(new T3.Quaternion().setFromAxisAngle(UP,spin));}
// a body lying along the coast (across the wind), turned by `turn`
function qAcross(turn){const w=WIND();return new T3.Quaternion().setFromAxisAngle(UP,-Math.atan2(w[1],w[0])+turn);}
// the two bands: put(x,y,z,s,k,Z) with s a KRAND stream of the plant and k its size factor (1 near, 1.6 mid)
function bands(salt,cell,accept,put,o){o=o||{};const L=FARSIDE.LOD,F=BIO.radii().floor;let n=0;
 BIO.range=L.floor;BIO.minRange=0;
 n+=FARSIDE.kgrid(salt,cell,(Z,x,z)=>BIO.lodD(x,z)<F[1]?accept(Z,x,z):0,(x,y,z,seed,Z)=>put(x,y,z,KRAND.stream(seed),1,Z),o);
 if(!o.nearOnly){BIO.range=L.floorMid;BIO.minRange=0;
  n+=FARSIDE.kgrid(salt+'-mid',cell*2.4,(Z,x,z)=>BIO.lodD(x,z)>=F[0]?accept(Z,x,z):0,(x,y,z,seed,Z)=>put(x,y,z,KRAND.stream(seed),1.6,Z),o);}
 BIO.range=null;return n;}
const pk=(s,a)=>a[Math.floor(s.next()*a.length)%a.length];
const sv=(s,hex,dl)=>{const c=C(hex),h={h:0,s:0,l:0};c.getHSL(h);c.setHSL(h.h+(s.next()-.5)*.02,clamp(h.s+(s.next()-.5)*.1,0,1),clamp(h.l+(s.next()-.5)*(dl||.08),.03,.97));return c;};
FARSIDE.buildFloor=function(R,q){q=q==null?1:q;const st={},cnt=k=>{st[k]=(st[k]||0)+1;},cq=c=>c/Math.sqrt(q);
 // STRAND EELGRASS: meadows on the sand and the dunes, lying flat inland (flatter the nearer the surf), dry at the tips
 bands('eel',cq(2.7),Z=>Z.sand*(1-Z.strandL*.9)*smooth(.55,.85,Z.spray)*.95,(x,y,z,s,k,Z)=>{const H=lerp(.5,1.05,s.next())*k,W=H*lerp(1.7,2.5,s.next());
  BIO.put('eelgrass',[x,y-.03,z],qLean(lerp(.8,1.25,s.next())*smooth(.5,.95,Z.spray),s.next()*TAU),[W,H,W],sv(s,s.next()<.25?pk(s,PAL.eelDry):pk(s,PAL.eelgrass)));cnt('eelgrass');});
 // the WINDROWS of its dead leaf: long low banks across the wind on the dunes
 bands('windrow',cq(9),Z=>Z.sand*smooth(.6,.85,Z.spray)*(1-Z.strandL)*.35,(x,y,z,s,k)=>{const L=lerp(2,6,s.next())*k;
  BIO.put('heap',[x,y-.12,z],qAcross((s.next()-.5)*.4),[L*.5,lerp(.12,.28,s.next()),lerp(.35,.7,s.next())],sv(s,pk(s,PAL.wrackDry)));cnt('windrow');});
 // STORM WRACK heaped along the wrack line, and fallen in the kelp forest
 bands('wrackline',cq(2.4),Z=>Z.strandL*.9+Z.kelpcoast*(1-Z.graze)*.05,(x,y,z,s,k)=>{const L=lerp(.7,2.4,s.next())*k;
  BIO.put('heap',[x,y-.1,z],qAcross((s.next()-.5)*.8),[L,lerp(.2,.55,s.next())*Math.min(k,1.3),L*lerp(.4,.8,s.next())],sv(s,0xf4ecd8,.12));cnt('wrack');});
 // on the SURF ROCKS: sea palms in troops on the wettest faces, wrack flattened over the rest
 bands('seapalm',cq(3.6),Z=>Z.rock*smooth(.8,.95,Z.spray)*.7,(x,y,z,s,k)=>{
  for(let i=0,n=1+Math.floor(s.next()*4);i<n;i++){const a=s.next()*TAU,r=s.next()*.7,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r,H=lerp(.5,1,s.next())*Math.min(k,1.3);
   BIO.put('seapalm',[px,BIO.terrainH(px,pz)-.05,pz],qLean(lerp(.1,.45,s.next()),s.next()*TAU),[H,H,H],sv(s,pk(s,PAL.seapalm)));cnt('seapalm');}});
 bands('rockwrack',cq(2.6),Z=>Z.rock*.45,(x,y,z,s,k)=>{const L=lerp(.6,1.8,s.next())*k;BIO.put('heap',[x,y-.12,z],qAcross(s.next()*TAU),[L,lerp(.12,.3,s.next()),L*.7],sv(s,0xe8dcc0,.1));cnt('rockwrack');});
 // SPRAY CORAL: branching thickets on the terraces and on the reefs it builds out of the sand above the waterline; heads among them
 bands('coral',cq(2.6),Z=>Z.coral*.85,(x,y,z,s,k)=>{const H=lerp(.4,2.1,Math.pow(s.next(),1.6))*Math.min(k,1.4),W=H*lerp(.9,1.5,s.next());
  BIO.put(s.next()<.62?'coral0':'coral1',[x,y-.05,z],qLean(0,s.next()*TAU),[W,H,W],sv(s,pk(s,PAL.coral),.04));cnt('coral');
  if(s.next()<.12){const r=lerp(.25,.8,s.next())*k,a=s.next()*TAU;BIO.put('brain',[x+Math.cos(a)*W*.7,y-r*.25,z+Math.sin(a)*W*.7],null,[r,r*.7,r],sv(s,pk(s,PAL.coral),.04));cnt('brain');}});
 // SEA LETTUCE on every wet surface of the kelp coast (and the surf rocks), ANEMONES in clumps on the kelp forest's floor
 bands('lettuce',cq(5),Z=>(Z.kelpcoast*(1-Z.graze*.8)*(1-Z.sand)*.42+Z.rock*.25)*(1-Z.coral),(x,y,z,s,k)=>{const W=lerp(.4,1.2,s.next())*k;
  BIO.put('lettuce',[x,y+.01,z],qLean((s.next()-.5)*.3,s.next()*TAU),[W,W*.8,W*lerp(.6,1,s.next())],sv(s,pk(s,PAL.lettuce),.06));cnt('lettuce');});
 bands('anemone',cq(10),Z=>Z.kelpcoast*(1-Z.graze)*(1-Z.sand)*(1-Z.coral)*.3+Z.rock*Z.spray*.15,(x,y,z,s,k)=>{const col=pk(s,PAL.anemone);
  for(let i=0,n=3+Math.floor(s.next()*3);i<n;i++){const a=s.next()*TAU,r=s.next()*.7*k,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r,H=lerp(.15,.4,s.next())*Math.min(k,1.3);
   BIO.put('anemone',[px,BIO.terrainH(px,pz)-.03,pz],qLean((s.next()-.5)*.3,s.next()*TAU),[H*1.1,H,H*1.1],sv(s,col,.06));cnt('anemone');}},{nearOnly:true});
 // FOG SPONGE towers where the fog lies: on the rock and the forest floor of the fog belt
 bands('sponge',cq(3.2),Z=>(Z.cloud*.035+Z.rock*Z.fog*.12+Z.front*Z.fog*.03)*(1-Z.sand),(x,y,z,s,k)=>{
  for(let i=0,n=1+Math.floor(s.next()*3);i<n;i++){const a=s.next()*TAU,r=s.next()*.6,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r,H=lerp(.25,.9,s.next())*Math.min(k,1.3);
   BIO.put('spongetower',[px,BIO.terrainH(px,pz)-.04,pz],qLean(0,s.next()*TAU),[H*.9,H,H*.9],sv(s,pk(s,PAL.sponge),.06));cnt('sponge');}});
 BIO.range=null;BIO.minRange=0;return {floor:st};};
})();
