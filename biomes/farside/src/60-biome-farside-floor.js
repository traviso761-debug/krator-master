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
// a heap LYING ON THE GROUND (2026-10-26, the owner: heaps floated on the surf rocks): tilted to the ground's normal under its
// footprint and seated a little into it at the lowest of its centre and its four ends, so no edge hangs over a slope
const _nv=new T3.Vector3();
function lie(item,x,z,turn,sc,col){const Y=BIO.terrainH,r=Math.max(sc[0],sc[2])*.5,e=Math.max(.6,r*.5),
  nx=Y(x-e,z)-Y(x+e,z),nz=Y(x,z-e)-Y(x,z+e);_nv.set(nx,2*e,nz).normalize();
 const q=new T3.Quaternion().setFromUnitVectors(UP,_nv).multiply(qAcross(turn));let lo=Y(x,z);
 for(let i=0;i<4;i++){const a=i*Math.PI/2+turn,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;lo=Math.min(lo,Y(px,pz)+(Y(x,z)-Y(px,pz))*.5);}
 BIO.put(item,[x,Math.min(Y(x,z),lo)-sc[1]*.25,z],q,sc,col);}
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
  lie('heap',x,z,(s.next()-.5)*.4,[L*.5,lerp(.12,.28,s.next()),lerp(.35,.7,s.next())],sv(s,pk(s,PAL.wrackDry)));cnt('windrow');});
 // STORM WRACK heaped along the wrack line, and fallen in the kelp forest
 bands('wrackline',cq(3.2),Z=>Z.strandL*.9+Z.kelpcoast*(1-Z.graze)*.05,(x,y,z,s,k)=>{const L=lerp(.7,2.4,s.next())*k;
  lie('heap',x,z,(s.next()-.5)*.8,[L,lerp(.2,.55,s.next())*Math.min(k,1.3),L*lerp(.4,.8,s.next())],sv(s,0xf4ecd8,.12));cnt('wrack');});
 // on the SURF ROCKS: sea palms in troops on the wettest faces, wrack flattened over the rest
 bands('seapalm',cq(4.6),Z=>Z.rock*smooth(.8,.95,Z.spray)*.7,(x,y,z,s,k)=>{
  for(let i=0,n=1+Math.floor(s.next()*4);i<n;i++){const a=s.next()*TAU,r=s.next()*.7,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r,H=lerp(.5,1,s.next())*Math.min(k,1.3);
   const Yp=BIO.terrainH,f=.18,gy=Math.min(Yp(px,pz),Yp(px+f,pz),Yp(px-f,pz),Yp(px,pz+f),Yp(px,pz-f));BIO.put('seapalm',[px,gy-.06,pz],qLean(lerp(.1,.45,s.next()),s.next()*TAU),[H,H,H],sv(s,pk(s,PAL.seapalm)));cnt('seapalm');}});
 bands('rockwrack',cq(2.6),Z=>Z.rock*.45,(x,y,z,s,k)=>{const L=lerp(.6,1.6,s.next())*Math.min(k,1.25);lie('heap',x,z,s.next()*TAU,[L,lerp(.12,.3,s.next()),L*.7],sv(s,0xe8dcc0,.1));cnt('rockwrack');});
 // SPRAY CORAL: branching thickets on the terraces and on the reefs it builds out of the sand above the waterline; heads among them
 // near the eye (k 1) most colonies are 3D (staghorn, plate shelves, heads) and a third the cards; the mid band keeps the cards
 bands('coral',cq(3.2),Z=>Z.coral*.85,(x,y,z,s,k)=>{const H=lerp(.4,2.1,Math.pow(s.next(),1.6))*Math.min(k,1.4),W=H*lerp(.9,1.5,s.next()),u=s.next(),v=Math.floor(s.next()*3)%3,col=sv(s,pk(s,PAL.coral),.04);
  if(k===1&&u<.3&&BIO.lodD(x,z)<BIO.radii().floor[0]+150){const h=H*lerp(.8,1.3,s.next());BIO.put('staghorn'+v,[x,y-.06,z],qLean((s.next()-.5)*.2,s.next()*TAU),[h,h,h],col);cnt('staghorn');}
  else if(k===1&&u<.52){const h=H*lerp(.7,1.1,s.next());BIO.put('plate'+v,[x,y-.05,z],qLean(0,s.next()*TAU),[h*1.3,h,h*1.3],col);cnt('plate');}
  else{BIO.put(s.next()<.62?'coral0':'coral1',[x,y-.05,z],qLean(0,s.next()*TAU),[W,H,W],col);cnt('coral');}
  if(s.next()<.12){const r=lerp(.25,.8,s.next())*k,a=s.next()*TAU;BIO.put('brain',[x+Math.cos(a)*W*.7,y-r*.25,z+Math.sin(a)*W*.7],null,[r,r*.7,r],sv(s,pk(s,PAL.coral),.04));cnt('brain');}});
 // THE TERRACES' LIPS: lumpy coral rims along the risers (where the coral ground steps up), lying along the contour
 {const Y=BIO.terrainH,riser=(x,z)=>{const e=1.2,gx=Y(x+e,z)-Y(x-e,z),gz=Y(x,z+e)-Y(x,z-e);return [Math.hypot(gx,gz)/(2*e),gx,gz];};
  bands('coralrim',cq(1.6),(Z,x,z)=>Z.coral>.3?Z.coral*smooth(.35,.7,riser(x,z)[0]):0,(x,y,z,s,k)=>{const r=riser(x,z),a=Math.atan2(r[2],r[1]),L=lerp(1.4,2.6,s.next())*Math.min(k,1.4);
   const up=.9;let px=x,pz=z;for(let i=0;i<3;i++){const g=riser(px,pz);if(g[0]<.15)break;px+=Math.cos(a)*up*.5;pz+=Math.sin(a)*up*.5;}   /* climb to the lip */
   BIO.put('rim',[px,Y(px,pz)-.12,pz],new T3.Quaternion().setFromAxisAngle(UP,-a+Math.PI/2),[L,lerp(.8,1.4,s.next()),lerp(.8,1.3,s.next())],sv(s,pk(s,PAL.coral),.04));cnt('rim');},{nearOnly:true});}
 // SEA LETTUCE on every wet surface of the kelp coast (and the surf rocks), ANEMONES in clumps on the kelp forest's floor
 bands('lettuce',cq(5),Z=>(Z.kelpcoast*(1-Z.graze*.8)*(1-Z.sand)*.42+Z.rock*.25)*(1-Z.coral),(x,y,z,s,k)=>{const W=lerp(.4,1.2,s.next())*k;
  BIO.put('lettuce',[x,y+.01,z],qLean((s.next()-.5)*.3,s.next()*TAU),[W,W*.8,W*lerp(.6,1,s.next())],sv(s,pk(s,PAL.lettuce),.06));cnt('lettuce');});
 // THE KELP FOREST'S UNDERSTOREY AND FLOOR (the owner, 2026-10-26): oarweed in thickets (patches), boa kelp sprawling down the
 // wind over the floor and the rocks' edges, sea grapes in runners on the wet floor; all thin out where the goats crop
 const patch=(x,z,sd,sc)=>smooth(.5,.62,fbm(x*sc+sd,z*sc-sd,sd,2));
 bands('oarweed',cq(9),(Z,x,z)=>Z.kelpcoast*(1-Z.sand)*(1-Z.coral)*(1-Z.rock*.7)*(1-Z.graze*.85)*patch(x,z,471,.012)*.75,(x,y,z,s,k)=>{const w=WIND(),a=Math.atan2(w[1],w[0]);
  for(let i=0,n=1+Math.floor(s.next()*3);i<n;i++){const b=s.next()*TAU,r=s.next()*1.4*k,px=x+Math.cos(b)*r,pz=z+Math.sin(b)*r,H=lerp(1.2,3,s.next())*Math.min(k,1.3);
   BIO.put('oarweed',[px,BIO.terrainH(px,pz)-.05,pz],new T3.Quaternion().setFromAxisAngle(UP,-a+(s.next()-.5)*.7),[H,H,H*lerp(.8,1.2,s.next())],sv(s,pk(s,PAL.oarweed)));cnt('oarweed');}});
 bands('boa',cq(11),(Z,x,z)=>(Z.kelpcoast*(1-Z.sand)*(1-Z.coral)*(1-Z.graze*.9)*.3+Z.rock*Z.spray*.25)*patch(x,z,472,.009),(x,y,z,s,k)=>{const w=WIND(),a=Math.atan2(w[1],w[0]);
  for(let i=0,n=2+Math.floor(s.next()*2);i<n;i++){const L=lerp(2,6,s.next())*Math.min(k,1.3);
   BIO.put('boa',[x,y-.03,z],new T3.Quaternion().setFromAxisAngle(UP,-a+(s.next()-.5)*1.2),[L,L*lerp(.5,1,s.next()),L],sv(s,pk(s,PAL.boa)));cnt('boa');}});
 bands('grapes',cq(11),(Z,x,z)=>Z.kelpcoast*(1-Z.sand)*(1-Z.coral)*(1-Z.graze)*patch(x,z,473,.02)*.5,(x,y,z,s,k)=>{
  for(let i=0,n=2+Math.floor(s.next()*3);i<n;i++){const b=s.next()*TAU,r=s.next()*.8,px=x+Math.cos(b)*r,pz=z+Math.sin(b)*r,L=lerp(.4,1,s.next());
   BIO.put('grapes',[px,BIO.terrainH(px,pz)-.01,pz],new T3.Quaternion().setFromAxisAngle(UP,s.next()*TAU),[L,L*lerp(1.2,2,s.next()),L],sv(s,pk(s,PAL.grapes),.06));cnt('grapes');}},{nearOnly:true});
 bands('anemone',cq(14),Z=>Z.kelpcoast*(1-Z.graze)*(1-Z.sand)*(1-Z.coral)*.3+Z.rock*Z.spray*.15,(x,y,z,s,k)=>{const col=pk(s,PAL.anemone);
  for(let i=0,n=3+Math.floor(s.next()*3);i<n;i++){const a=s.next()*TAU,r=s.next()*.7*k,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r,H=lerp(.15,.4,s.next())*Math.min(k,1.3);
   BIO.put('anemone',[px,BIO.terrainH(px,pz)-.03,pz],qLean((s.next()-.5)*.3,s.next()*TAU),[H*1.1,H,H*1.1],sv(s,col,.06));cnt('anemone');}},{nearOnly:true});
 // FOG SPONGE towers where the fog lies: on the rock and the forest floor of the fog belt
 bands('sponge',cq(3.2),Z=>(Z.cloud*.035+Z.rock*Z.fog*.12+Z.front*Z.fog*.03)*(1-Z.sand),(x,y,z,s,k)=>{
  for(let i=0,n=1+Math.floor(s.next()*3);i<n;i++){const a=s.next()*TAU,r=s.next()*.6,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r,H=lerp(.25,.9,s.next())*Math.min(k,1.3);
   BIO.put('spongetower',[px,BIO.terrainH(px,pz)-.04,pz],qLean(0,s.next()*TAU),[H*.9,H,H*.9],sv(s,pk(s,PAL.sponge),.06));cnt('sponge');}});
 BIO.range=null;BIO.minRange=0;return {floor:st};};
})();
