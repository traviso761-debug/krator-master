// ================================================================= WATER - ext: the planned biomes' water (looks, pans, ice, blood falls, weed, seep dams, springs)
// [G data]: no THREE, no DOM. Adds to WATER (20-core-water.js, 22-core-water-flow.js; load after them). Optional, and in the SUBFOLDER
// core/water/ext/ on purpose: many builds pool the top-level fragments of core/water, so a new top-level fragment would leak into all of
// them; a build opts in by path. 54b-core-water-kinds-ext-draw.js draws the pan, the ice, the drifts, the blood fall's rust and the weed.
// Placement (drifts, weed, icicles, hummocks, springs, snags) draws from core/rand (KRAND.hash of seed, cell, index, salt): load
// core/rand first. Shading patterns (the pan's and the ice's polygon cracks) use W.hash2, the shaders' own hash, so the GLSL is the twin.
// Nothing here changes a surface that does not ask: W.LOOKS is not in PRESETS (the export carries PRESETS), and W.export only gains the
// records of the kinds made here. core/water/README.md, "Planned biomes' water (ext/54)", is the contract; test-kinds-ext.js the proof.
//
//   LOOKS   W.LOOKS[name] = {stops [[t, '#hex'], ...] (t 0 deep .. 1 the rim), deep (m: depth at which the ramp is fully deep), clarity (m:
//        the bed is seen through e^(-depth/clarity)), roughness, opacity, weed {colours, ...}}. brine (Outlands C5: deep red-brown to
//        turquoise to a white rim), blood (the Godthrone's iron brine, rusted), bloodriver (the red river below the falls), clear (the SW
//        highlands' gin-clear green river over polished rock), spring (a karst spring's blue-green pool), proglacial (turquoise meltwater)
//   W.rampAt(look, t) -> [r, g, b] (display 0..1);  W.lookHex(look, t);  W.clarityAt(look, depth) -> 0..1 of the bed seen
//   W.lookDraw(look, kind, o) -> drawing options for WATER.draw / drawStill / drawFlow / drawFall ('open' | 'still' | 'flow' | 'fall'), o merged over
//   W.lookTint({look, box, cell, depth (x, z) -> m | null, alpha}) -> a tint spec for WATER.open({tint}): the ramp by depth
//   W.lookGradient(look, {from, to, power}) -> a gradient for WATER.still({gradient}) (two stops of the ramp)
//   W.withLook(S, look) records the look on a surface (S.look, plain data: core/export carries it); returns S
//   PAN     W.pan({name, poly | bounds, level, cell, jitter, crack, ridge, flood, film, colours, wet}) a salt pan: crust in polygons whose
//        cracks wet first after rain and whose low cells flood with brine (W.wet() unless `wet` is given). P.at(x, z, wet) -> {crack, low,
//        film, ridge, colour}; P.heightAt -> the brine film's level where it stands, else null; kind 'pan'
//   ICE     W.ice({name, poly | bounds, level, rim {width, salt}, drifts {wind, spacing, chance, len, wid, depth}, cracks {cell, width}, colours,
//        seed}) a frozen lake: black ice cracked in big polygons, a salt rim, snow drifts placed by cell. I.driftAt, I.rimAt, I.crackAt,
//        I.colourAt, I.heightAt (the ice plus its drift), I.bake(cell) (rim and drift as bytes for the drawing); kind 'ice'
//   W.driftMesh(I, {res, lift}) -> {pos, nrm, idx, count}: the drifts as one mesh (arrays)
//   BLOOD   W.rustAt(age, tau) the share rusted after `age` s in the air; W.underIceFall({name, mouth, dir, width, drop, foot, face, ice,
//        speed, age0, tau, look, stain, icicles, pool, seed}) the bloodfalls: a WATER.fall out from under an ice cliff, its rust down the
//        curtain (B.colourAt(f)), the stain on ice, rock and the ground below (B.stainAt(x, y, z)), icicles, the red pool; a group
//   WEED    W.weed(F, {look, every, across, depth, len, seed, density}) -> [{x, y, z, yaw, len, c}] riverweed or comb-weed down a flow line;
//        W.weedSway(x, z, t, u, sway) a blade's sway (54b's wtrWeedSway)
//   DAM     W.seepDam({name, crest, crestY, toeY, level, dir, thickness, freeboard, outlets, hummocks, valley, snags, bed, face, seed})
//        a landslide dam that seeps and never spills: refuses a level within `freeboard` of the crest; springs low on its face, a thread
//        fall from each, hummocks, drowned trees in the lake. D.groundAt (the dam's body, for the terrain), D.seepAt; a group
//   SPRING  W.karstSpring({name, at, r, dir, run | line, width, speed, look, seed}) a spring pool (a still with the look's gradient and the boil
//        as its fountain) and the gin-clear stream leaving it (a flow); a group
(function(){const W=WATER,TAU=Math.PI*2,cl=(x,a,b)=>x<a?a:x>b?b:x,ss=(a,b,x)=>{const t=cl((x-a)/(b-a),0,1);return t*t*(3-2*t);},mix=(a,b,t)=>a+(b-a)*t;
 const KR=()=>{try{return typeof KRAND!=='undefined'?KRAND:null;}catch(e){return null;}};
 const K=()=>{const k=KR();if(!k)throw new Error('WATER (ext/54): placement needs core/rand (KRAND); load core/rand/08-core-rand.js first');return k;};
 const U=(...a)=>K().unit(K().hash(...a));
 const seedOf=(o,tag)=>o.seed!=null?o.seed>>>0:K().child(0x5EA7,o.name||tag);
 const rgb=h=>{const n=typeof h==='number'?h:parseInt(String(h).replace('#',''),16);return[((n>>16)&255)/255,((n>>8)&255)/255,(n&255)/255];};
 const hexOf=c=>(Math.round(cl(c[0],0,1)*255)<<16)|(Math.round(cl(c[1],0,1)*255)<<8)|Math.round(cl(c[2],0,1)*255);
 const mix3=(a,b,t)=>[mix(a[0],b[0],t),mix(a[1],b[1],t),mix(a[2],b[2],t)];
 W.rgbOf=rgb;W.hexOf=hexOf;
 // ---- polygons: inside, the distance to the edge (+ inside), a circle, the box of a record
 const polyOf=o=>o.poly?o.poly.map(p=>[p[0],p[1]]):o.bounds?[[o.bounds[0],o.bounds[1]],[o.bounds[2],o.bounds[1]],[o.bounds[2],o.bounds[3]],[o.bounds[0],o.bounds[3]]]:null;
 const inside=(P,x,z)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++)if((P[i][1]>z)!==(P[j][1]>z)&&x<(P[j][0]-P[i][0])*(z-P[i][1])/(P[j][1]-P[i][1])+P[i][0])c=!c;return c;};
 const edgeDist=(P,x,z)=>{let d=1e18;for(let i=0,j=P.length-1;i<P.length;j=i++){const ax=P[j][0],az=P[j][1],ex=P[i][0]-ax,ez=P[i][1]-az,l2=Math.max(ex*ex+ez*ez,1e-12),u=cl(((x-ax)*ex+(z-az)*ez)/l2,0,1);
   d=Math.min(d,Math.hypot(x-ax-ex*u,z-az-ez*u));}return inside(P,x,z)?d:-d;};
 const boxOf=P=>[Math.min(...P.map(p=>p[0])),Math.min(...P.map(p=>p[1])),Math.max(...P.map(p=>p[0])),Math.max(...P.map(p=>p[1]))];
 W.polyEdgeDist=edgeDist;
 W.circlePoly=(x,z,r,n)=>{n=n==null?24:n;const out=[];for(let i=0;i<n;i++){const a=TAU*i/n;out.push([x+r*Math.cos(a),z+r*Math.sin(a)]);}return out;};

 // ================================================================ LOOKS
 W.LOOKS={
  // Outlands C5: the salt lake's brine, deep red-brown (halophile bloom) to turquoise in the shallows to the white of the salt at the rim
  brine:{stops:[[0,'#4e1c14'],[.35,'#7a3420'],[.62,'#2c9c92'],[.86,'#a9ded4'],[1,'#f2efe6']],deep:5,clarity:1.5,roughness:.1,opacity:.94},
  // the Godthrone's iron brine where it has rusted (blood-red, thick with iron); fresh from under the ice it is clear and grey-green
  blood:{stops:[[0,'#34070a'],[.45,'#6e110e'],[.8,'#a32d18'],[1,'#c4602c']],deep:2,clarity:.4,roughness:.18,opacity:.97,fresh:'#8a958c',tau:1},
  // the blood river below the falls: the rust has settled; the water is clear-ish and dark, its red the riverweed's
  bloodriver:{stops:[[0,'#2a0c12'],[.5,'#5a1a1e'],[1,'#94402e']],deep:3,clarity:2.5,roughness:.1,opacity:.8,
   weed:{colours:['#b0162a','#8a1030','#5e1240','#c8402a'],base:.62,rapids:.33,slope:[.01,.06],minSpeed:0,len:[.5,1.4]}},
  // the SW highlands' gin-clear green river over polished, banded rock (the Cascade river): you see the bed through metres of water
  clear:{stops:[[0,'#0a4438'],[.5,'#1d8466'],[1,'#a2dcc4']],deep:8,clarity:12,roughness:.05,opacity:.5,
   weed:{colours:['#2f6a2a','#3f7f34','#24521f','#4d8a3a'],base:.12,rapids:0,slope:[0,1],minSpeed:.3,fast:.48,len:[1,3]}},
  // a karst spring's pool: deep blue-green over the vent, clear at the rim
  spring:{stops:[[0,'#05304a'],[.45,'#0f7088'],[1,'#8ed6cc']],deep:6,clarity:15,roughness:.04,opacity:.62},
  // turquoise rock-flour meltwater (the proglacial lakes below the ice belt)
  proglacial:{stops:[[0,'#0c5363'],[.6,'#2da2ad'],[1,'#a6ddd8']],deep:10,clarity:.8,roughness:.08,opacity:.95}};
 const lookOf=l=>{if(l&&typeof l==='object')return l;const L=W.LOOKS[l];if(!L)throw new Error('WATER: no look '+l);return L;};
 W.rampAt=(look,t)=>{const S=lookOf(look).stops;t=cl(t,0,1);if(t<=S[0][0])return rgb(S[0][1]);
  for(let i=0;i+1<S.length;i++)if(t<=S[i+1][0])return mix3(rgb(S[i][1]),rgb(S[i+1][1]),(t-S[i][0])/Math.max(1e-9,S[i+1][0]-S[i][0]));return rgb(S[S.length-1][1]);};
 W.lookHex=(look,t)=>hexOf(W.rampAt(look,t));
 W.clarityAt=(look,depth)=>Math.exp(-Math.max(0,depth)/lookOf(look).clarity);
 // the ramp's t at a depth: 1 at the waterline, 0 at `deep` m and below
 W.lookT=(look,depth)=>1-cl(depth/lookOf(look).deep,0,1);
 W.lookDraw=(look,kind,o)=>{const L=lookOf(look),h=t=>W.lookHex(L,t);let r;
  if(kind==='open')r={color:h(0),deep:h(0),shallow:h(.7),ramp:[.3,L.deep],roughness:L.roughness};
  else if(kind==='flow')r={color:h(.45),roughness:L.roughness,transparent:L.opacity<1};
  else if(kind==='fall')r={color:h(.85),opacity:Math.min(.95,L.opacity)};
  else r={color:h(.3),roughness:L.roughness,opacity:L.opacity<1?L.opacity:undefined};
  if(r.opacity===undefined)delete r.opacity;return Object.assign(r,o||{});};
 W.lookTint=o=>{const L=lookOf(o.look),a=o.alpha==null?1:o.alpha;
  return{box:o.box,cell:o.cell,at:(x,z)=>{const d=o.depth(x,z);return d==null?null:{c:W.lookHex(L,W.lookT(L,d)),a};}};};
 W.lookGradient=(look,g)=>{g=g||{};return{centre:W.lookHex(look,g.from==null?0:g.from),rim:W.lookHex(look,g.to==null?.75:g.to),power:g.power==null?.6:g.power};};
 W.withLook=(S,look)=>{const L=lookOf(look);S.look=Object.assign({preset:typeof look==='string'?look:null},JSON.parse(JSON.stringify(L)));return S;};

 // ================================================================ POLYGON CELLS (the pan's crust, the ice's cracks)
 // cells of `cell` m, each centre jittered by `jit` (0..1) with W.hash2 (the shaders' hash): [f1, f2, idx, idz] in cell units, the nearest and
 // second-nearest centres' distances and the nearest cell's index; the crack is where f2 - f1 is small (the border between two cells)
 W.cellsAt=(x,z,cell,jit)=>{const qx=x/cell,qz=z/cell,ix=Math.floor(qx),iz=Math.floor(qz);let f1=9,f2=9,a=0,b=0;
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const cx=ix+dx,cz=iz+dy,px=cx+.5+jit*(W.hash2(cx,cz)-.5),pz=cz+.5+jit*(W.hash2(cx+19.1,cz+7.3)-.5),d=Math.hypot(qx-px,qz-pz);
   if(d<f1){f2=f1;f1=d;a=cx;b=cz;}else if(d<f2)f2=d;}
  return[f1,f2,a,b];};
 W.crackOf=(C,width)=>1-ss(0,width,C[1]-C[0]);

 // ================================================================ PAN (Outlands C5): salt crust in polygons, wet after rain
 W.PAN={cell:3,jitter:.85,crack:.07,ridge:.05,flood:.55,film:.03,colours:{salt:'#efeae0',crack:'#b8a487',damp:.7,brine:null},roughness:[.85,.08]};
 W.panAt=(P,x,z,wet)=>{const C=W.cellsAt(x,z,P.cell,P.jitter),c=W.crackOf(C,P.crack),low=W.hash2(C[2]+3.1,C[3]+11.7),w=cl(wet,0,1);
  const film=Math.max(c*ss(0,.3,w),ss(low,low+.12,w*P.flood)),damp=ss(0,.5,w),salt=rgb(P.colours.salt),cr=rgb(P.colours.crack),br=P.brineRGB;
  let col=mix3(salt,cr,c);col=mix3(col,col.map(v=>v*P.colours.damp),damp);col=mix3(col,br,film*.9);
  return{crack:c,low,film,damp,ridge:P.ridge*ss(.25,1,c)*(1-film),colour:col,roughness:mix(P.roughness[0],P.roughness[1],Math.max(film,damp*.3))};};
 W.pan=o=>{const Q=W.PAN,P0=polyOf(o);if(!P0)throw new Error('WATER.pan: a poly or bounds');
  const C=Object.assign({},Q.colours,o.colours||{});
  const S={kind:'pan',name:o.name,level:o.level==null?0:o.level,poly:P0,bounds:o.poly?null:o.bounds,cell:o.cell==null?Q.cell:o.cell,jitter:o.jitter==null?Q.jitter:o.jitter,
   crack:o.crack==null?Q.crack:o.crack,ridge:o.ridge==null?Q.ridge:o.ridge,flood:o.flood==null?Q.flood:o.flood,film:o.film==null?Q.film:o.film,colours:C,roughness:(o.roughness||Q.roughness).slice(),wetFixed:o.wet==null?null:o.wet};
  S.brineRGB=C.brine==null?W.rampAt('brine',.62):rgb(C.brine);
  S.wetNow=()=>S.wetFixed==null?W.wet():S.wetFixed;
  S.contains=(x,z)=>inside(P0,x,z);
  S.at=(x,z,wet)=>W.panAt(S,x,z,wet==null?S.wetNow():wet);
  // the brine stands on the pan where its film is over half: the level plus the film's depth; null (no water) where it is crust
  S.heightAt=(x,z)=>{if(!S.contains(x,z))return null;const w=S.wetNow(),a=W.panAt(S,x,z,w);return a.film>.5?S.level+S.film*a.film:null;};
  S.normalAt=()=>[0,1,0];
  S.ext=()=>({level:S.level,poly:S.poly,bounds:S.bounds,cell:S.cell,jitter:S.jitter,crack:S.crack,ridge:S.ridge,flood:S.flood,film:S.film,colours:S.colours,brine:S.brineRGB,roughness:S.roughness,wet:S.wetFixed});
  return add(S);};

 // ================================================================ ICE (C7 and HANDOFF-REBUILD's core table): a frozen lake
 W.ICE={rim:{width:5,salt:false},drifts:{wind:0,spacing:14,chance:.45,len:[8,22],wid:[2.5,5],depth:[.12,.4],lee:.3},cracks:{cell:22,jitter:.8,width:.035},
  colours:{ice:'#1b2a31',crack:'#c6dde6',salt:'#ece3cf',snow:'#e3eaec'},lift:.01};
 // a drift's depth at (x, z): an ellipse along the wind, steep on its lee (the downwind `lee` share of its length), (1 - q)^2
 W.driftShape=(d,x,z)=>{const c=Math.cos(d.yaw),s=Math.sin(d.yaw),ex=x-d.x,ez=z-d.z,u=ex*c+ez*s,v=-ex*s+ez*c,hl=u>0?d.len*d.lee:d.len*(1-d.lee),q=(u/hl)*(u/hl)+(v*2/d.wid)*(v*2/d.wid);
  return q<1?d.depth*(1-q)*(1-q):0;};
 W.iceColour=(I,crack,rim,drift)=>{const C=I.colours;let col=mix3(rgb(C.ice),rgb(C.crack),crack*.8);if(I.rim.salt)col=mix3(col,rgb(C.salt),rim);
  return mix3(col,rgb(C.snow),ss(0,.25,drift));};
 // the colour the drawing gives (x, z) with the rim and the drift read from a bake M (I.bake(cell)) as the GPU filters it: the twin of 54b's wtrIce
 W.iceShade=(I,M,x,z)=>{const t=W.tintSample(M,x,z);return W.iceColour(I,I.crackAt(x,z),t[0],t[1]);};
 W.ice=o=>{const Q=W.ICE,P0=polyOf(o);if(!P0)throw new Error('WATER.ice: a poly or bounds');
  const rim=Object.assign({},Q.rim,o.rim||{}),DR=o.drifts===false?null:Object.assign({},Q.drifts,o.drifts||{}),CK=Object.assign({},Q.cracks,o.cracks||{}),seed=seedOf(o,'ice');
  const S={kind:'ice',name:o.name,level:o.level==null?0:o.level,poly:P0,bounds:o.poly?null:o.bounds,rim,cracks:CK,colours:Object.assign({},Q.colours,o.colours||{}),seed,drifts:[]};
  const B=boxOf(P0);S.box=B;
  // the drifts: one candidate per `spacing` m cell over the box, kept by KRAND.hash(seed, i, j, k, salt) (never by draw order), on the ice clear of its edge
  if(DR){const g=DR.spacing,w0=DR.wind*Math.PI/180,i0=Math.floor(B[0]/g),i1=Math.floor(B[2]/g),j0=Math.floor(B[1]/g),j1=Math.floor(B[3]/g);
   for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){if(U(seed,i,j,0,0xD1F7)>=DR.chance)continue;
    const x=(i+U(seed,i,j,1,0xD1F7))*g,z=(j+U(seed,i,j,2,0xD1F7))*g,len=mix(DR.len[0],DR.len[1],U(seed,i,j,3,0xD1F7)),wid=mix(DR.wid[0],DR.wid[1],U(seed,i,j,4,0xD1F7));
    if(edgeDist(P0,x,z)<Math.max(wid,len*.5))continue;
    S.drifts.push({x,z,len,wid,depth:mix(DR.depth[0],DR.depth[1],U(seed,i,j,5,0xD1F7)),yaw:w0+(U(seed,i,j,6,0xD1F7)-.5)*.4,lee:DR.lee});}}
  S.maxDrift=S.drifts.reduce((a,d)=>Math.max(a,d.depth),0);
  // a coarse bin of the drifts so a query reads only those near it
  const bin=new Map(),bc=DR?DR.spacing*2:1,bk=(i,j)=>i+','+j;
  for(const d of S.drifts){const r=Math.max(d.len,d.wid),a0=Math.floor((d.x-r)/bc),a1=Math.floor((d.x+r)/bc),b0=Math.floor((d.z-r)/bc),b1=Math.floor((d.z+r)/bc);
   for(let j=b0;j<=b1;j++)for(let i=a0;i<=a1;i++){const k=bk(i,j);if(!bin.has(k))bin.set(k,[]);bin.get(k).push(d);}}
  S.driftAt=(x,z)=>{const L=bin.get(bk(Math.floor(x/bc),Math.floor(z/bc)));if(!L)return 0;let h=0;for(const d of L)h=Math.max(h,W.driftShape(d,x,z));return h;};
  S.contains=(x,z)=>inside(P0,x,z);
  S.edgeAt=(x,z)=>edgeDist(P0,x,z);
  S.rimAt=(x,z)=>rim.salt?1-ss(0,rim.width,edgeDist(P0,x,z)):0;
  S.crackAt=(x,z)=>W.crackOf(W.cellsAt(x,z,CK.cell,CK.jitter),CK.width);
  S.colourAt=(x,z)=>W.iceColour(S,S.crackAt(x,z),S.rimAt(x,z),S.maxDrift>0?S.driftAt(x,z)/S.maxDrift:0);
  // the ice is walkable ground: its level plus the snow on it; WATER.heightAt answers it as a surface (it ranks after open water)
  S.heightAt=(x,z)=>S.contains(x,z)?S.level+S.driftAt(x,z):null;
  S.normalAt=()=>[0,1,0];
  // the rim and the drift (normalised by the deepest) as bytes over the box: R rim, G drift, B 0, A 255 (WATER.tintSample reads it back)
  S.bake=c=>{c=c==null?2:c;const nx=Math.max(2,Math.ceil((B[2]-B[0])/c)),nz=Math.max(2,Math.ceil((B[3]-B[1])/c)),data=new Uint8Array(nx*nz*4);
   for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=B[0]+(i+.5)*c,z=B[1]+(j+.5)*c,k=(j*nx+i)*4;
    data[k]=Math.round(255*S.rimAt(x,z));data[k+1]=Math.round(255*(S.maxDrift>0?S.driftAt(x,z)/S.maxDrift:0));data[k+3]=255;}
   return{x0:B[0],z0:B[1],cell:c,nx,nz,data};};
  S.ext=()=>({level:S.level,poly:S.poly,bounds:S.bounds,rim:S.rim,cracks:S.cracks,colours:S.colours,seed:S.seed,maxDrift:S.maxDrift,drifts:S.drifts.map(d=>Object.assign({},d))});
  return add(S);};
 // the drifts as one mesh: a (res+1)^2 grid over each drift's footprint, the shape's height over the ice (+ lift), normals by differences
 W.driftMesh=(I,o)=>{o=o||{};const n=o.res==null?8:o.res,lift=o.lift==null?W.ICE.lift:o.lift,pos=[],nrm=[],idx=[];
  for(const d of I.drifts){const c=Math.cos(d.yaw),s=Math.sin(d.yaw),b=pos.length/3,ua=-d.len*(1-d.lee),ub=d.len*d.lee,e=.05;
   for(let j=0;j<=n;j++)for(let i=0;i<=n;i++){const u=mix(ua,ub,i/n),v=mix(-d.wid/2,d.wid/2,j/n),x=d.x+u*c-v*s,z=d.z+u*s+v*c,h=W.driftShape(d,x,z);
    pos.push(x,I.level+h+lift,z);const gx=(W.driftShape(d,x+e,z)-W.driftShape(d,x-e,z))/(2*e),gz=(W.driftShape(d,x,z+e)-W.driftShape(d,x,z-e))/(2*e),l=Math.hypot(gx,1,gz);nrm.push(-gx/l,1/l,-gz/l);}
   for(let j=0;j<n;j++)for(let i=0;i<n;i++){const a=b+j*(n+1)+i,q=a+n+1;idx.push(a,q,a+1,a+1,q,q+1);}}
  return{pos,nrm,idx,count:pos.length/3};};

 // ================================================================ BLOOD (the Godthrone): iron brine that rusts in the air
 W.rustAt=(age,tau)=>1-Math.exp(-Math.max(0,age)/(tau==null?3:tau));
 W.underIceFall=o=>{const L=lookOf(o.look||'blood'),seed=seedOf(o,'bloodfall'),m=o.mouth,dir=o.dir,w=o.width==null?3:o.width,lx=-dir[1],lz=dir[0];
  const lip=[[m[0]-lx*w/2,m[1]-lz*w/2,m[2]],[m[0]+lx*w/2,m[1]+lz*w/2,m[2]]];
  const F=W.fall({name:(o.name||'bloodfall')+' curtain',lip,dir,speed:o.speed==null?.8:o.speed,drop:o.drop,foot:o.foot,fit:!!o.foot,face:o.foot?(o.face==null?true:o.face):undefined,spread:o.spread});
  const ice=Object.assign({top:m[2]+20,arch:1.6},o.ice||{}),age0=o.age0==null?.1:o.age0,tau=o.tau==null?(L.tau==null?3:L.tau):o.tau;
  const foot=o.foot||[m[0]+dir[0]*F.speed*F.tFall,m[1]+dir[1]*F.speed*F.tFall,m[2]-o.drop];
  const st=Object.assign({length:Math.max(12,o.drop*.8),spread:.5,above:ice.arch*1.5,face:1.2},o.stain||{});
  const B={kind:'bloodfall',name:o.name||'bloodfall',fall:F,look:typeof o.look==='string'?o.look:'blood',age0,tau,mouth:{x:m[0],z:m[1],y:m[2],w,h:ice.arch},ice,foot,stain:st};
  // the colour down the curtain: fresh (clear grey-green) at the mouth, rusted to the look's red by its age in the air (age0 + f tFall)
  B.rustF=f=>W.rustAt(age0+f*F.tFall,tau);
  B.colourAt=f=>mix3(rgb(L.fresh||'#8a958c'),W.rampAt(L,.8),B.rustF(f));
  // the stain 0..1 at a point: on the face (ice and rock) in a band down from just above the mouth, as wide as the curtain grows (+ `face` m a side);
  // on the ground below the foot a fan `length` m long opening by `spread` (rad a side), fading out along it
  B.stainAt=(x,y,z)=>{const ex=x-m[0],ez=z-m[1],u=ex*dir[0]+ez*dir[1],v=Math.abs(ex*lx+ez*lz);let s=0;
   if(y<=m[2]+st.above&&y>=foot[2]-.5){const f=cl((m[2]-y)/Math.max(1e-6,o.drop),0,1),half=w/2+F.spread*f+st.face;if(u<=F.run+2||!F.run)s=Math.max(s,(1-ss(half*.7,half,v))*(y>m[2]?1-ss(0,st.above,y-m[2]):1));}
   const fx=x-foot[0],fz=z-foot[1],fu=fx*dir[0]+fz*dir[1],fv=Math.abs(fx*lx+fz*lz);
   if(fu>-w&&fu<st.length&&y<foot[2]+2){const half=w/2+Math.max(0,fu)*Math.tan(st.spread);s=Math.max(s,Math.pow(1-cl(fu/st.length,0,1),1.5)*(1-ss(half*.6,half,fv)));}
   return s;};
  // the icicles: hung from the ice lip over the mouth, `count` along `span` m, red-stained near the mouth (KRAND by index)
  const IC=Object.assign({count:14,span:w*3,len:[.4,2.2]},o.icicles||{});B.icicles=[];
  for(let k=0;k<IC.count;k++){const a=(U(seed,k,0,0,0x1C1C)-.5)*IC.span,len=mix(IC.len[0],IC.len[1],U(seed,k,0,1,0x1C1C)),y=m[2]+ice.arch+U(seed,k,0,2,0x1C1C)*.4;
   B.icicles.push({x:m[0]+lx*a-dir[0]*.2,y,z:m[1]+lz*a-dir[1]*.2,len,r:.04+.06*U(seed,k,0,3,0x1C1C),stain:1-ss(w*.4,w*1.4,Math.abs(a))});}
  // the red pool at the foot: a still circle with the look's gradient; rust terraces as rims across the fan (records, for the builder)
  const PR=o.pool===false?null:Object.assign({r:Math.max(3,w*1.4),depth:.6},o.pool||{});
  B.pool=PR?W.withLook(W.still({name:B.name+' pool',level:foot[2]+.05,poly:W.circlePoly(foot[0],foot[1],PR.r,20),gradient:W.lookGradient(L,{from:.2,to:.95})}),B.look):null;
  B.terraces=[];for(let k=1;k<=4;k++){const fu=st.length*k/5;B.terraces.push({x:foot[0]+dir[0]*fu,z:foot[1]+dir[1]*fu,across:[lx,lz],width:w+2*fu*Math.tan(st.spread),step:.12*(1-k/6)});}
  W.withLook(F,B.look);
  B.export=()=>({kind:'bloodfall',name:B.name,fall:F.id,pool:B.pool?B.pool.id:null,look:B.look,age0,tau,mouth:B.mouth,ice,foot,stain:st,icicles:B.icicles,terraces:B.terraces});
  W.groups.push(B);return B;};

 // ================================================================ WEED: riverweed (the blood river) and comb-weed (the gin-clear rivers) down a flow line
 // one candidate every `every` m along the line in `across` rows, each kept by KRAND.hash(seed, step, row, salt) against the look's density
 // (base + rapids x smoothstep(slope band), zero under minSpeed m/s, `fast` more where the current is over a metre a second) or o.density(slope, speed)
 W.weed=(F,o)=>{o=o||{};const L=lookOf(o.look||'bloodriver'),Wd=L.weed;if(!Wd)throw new Error('WATER.weed: the look has no weed');
  const seed=seedOf(o,(F.name||'flow')+' weed'),every=o.every==null?1.5:o.every,across=o.across==null?5:o.across,depth=o.depth==null?.45:o.depth,ln=o.len||Wd.len,P=F.pts,out=[];
  const dens=o.density||((sl,sp)=>sp<Wd.minSpeed?0:cl(Wd.base+Wd.rapids*ss(Wd.slope[0],Wd.slope[1],sl)+(Wd.fast||0)*ss(.6,1.2,sp),0,1));
  // step k is at every/2 + k every metres along the line (its index is its place, so a longer line keeps the weed of the shorter)
  const arc=[0];for(let i=1;i<P.length;i++)arc.push(arc[i-1]+Math.hypot(P[i].x-P[i-1].x,P[i].z-P[i-1].z));
  let i=0;for(let k=0,s=every/2;s<arc[arc.length-1];k++,s+=every){while(i+2<P.length&&arc[i+1]<s)i++;const a=P[i],b=P[i+1],seg=arc[i+1]-arc[i];if(seg<1e-9)continue;
   const u=(s-arc[i])/seg,dx=(b.x-a.x)/seg,dz=(b.z-a.z)/seg,wd=mix(a.w,b.w,u),sp=mix(a.v,b.v,u),y=mix(a.y,b.y,u);
   for(let r=0;r<across;r++){if(U(seed,k,r,0,0x3EED)>=dens(a.slope,sp))continue;const off=((r+U(seed,k,r,1,0x3EED))/across-.5)*wd*.9,along=(U(seed,k,r,2,0x3EED)-.5)*every;
    const x=mix(a.x,b.x,u)+dx*along-dz*off,z=mix(a.z,b.z,u)+dz*along+dx*off;
    out.push({x,y:o.bed?o.bed(x,z):y-depth,z,yaw:Math.atan2(dz,dx)+(U(seed,k,r,3,0x3EED)-.5)*.5,len:mix(ln[0],ln[1],U(seed,k,r,4,0x3EED)),c:Wd.colours[Math.floor(U(seed,k,r,5,0x3EED)*Wd.colours.length)%Wd.colours.length]});}}
  return out;};

 // (54b sways the blades by it) the sway across the blade at u (0 root .. 1 tip) for a root at (x, z), t the module clock wrapped (atmWaveT): whole cycles per wave period
 W.weedSway=(x,z,t,u,sway)=>{const per=W.period(),n=Math.max(1,Math.round(per/4.5));return sway*u*u*Math.sin(6.283185307*(t*(n/per))+x*.37+z*.23);};

 // ================================================================ SEEP DAM (the SW highlands' landslide lake): seeps, never spills
 W.seepDam=o=>{const seed=seedOf(o,'seepdam'),C=o.crest,fb=o.freeboard==null?2:o.freeboard,lvl=o.level;
  if(!(lvl<=o.crestY-fb))throw new Error('WATER.seepDam: the lake at '+lvl+' m is within '+fb+' m of the crest ('+o.crestY+' m): it would spill, not seep');
  if(!(o.toeY<lvl))throw new Error('WATER.seepDam: the toe must be under the lake');
  const dir=o.dir,lx=-dir[1],lz=dir[0],th=o.thickness==null?400:o.thickness,line=C.map(p=>[p[0],p[1]]),arc=[0];
  for(let i=1;i<line.length;i++)arc.push(arc[i-1]+Math.hypot(line[i][0]-line[i-1][0],line[i][1]-line[i-1][1]));const len=arc[arc.length-1];
  const at=s=>{s=cl(s,0,len);let i=0;while(i+2<line.length&&arc[i+1]<s)i++;const u=(s-arc[i])/Math.max(1e-9,arc[i+1]-arc[i]);return[mix(line[i][0],line[i+1][0],u),mix(line[i][1],line[i+1][1],u)];};
  // where a point is: s along the crest, d downstream of it (m; negative upstream)
  const where=(x,z)=>{let best=null;for(let i=0;i+1<line.length;i++){const a=line[i],b=line[i+1],ex=b[0]-a[0],ez=b[1]-a[1],l2=Math.max(ex*ex+ez*ez,1e-9),u=cl(((x-a[0])*ex+(z-a[1])*ez)/l2,0,1),
    px=a[0]+ex*u,pz=a[1]+ez*u,d=Math.hypot(x-px,z-pz);if(!best||d<best.dd)best={dd:d,s:arc[i]+u*Math.sqrt(l2),d:(x-px)*dir[0]+(z-pz)*dir[1]};}return best;};
  const D={kind:'seepdam',name:o.name||'seep dam',crest:line,crestY:o.crestY,toeY:o.toeY,level:lvl,freeboard:o.crestY-lvl,dir,thickness:th,length:len};
  // hummocks over the dam's body (KRAND by index): centre, radius, height
  const HM=Object.assign({count:Math.round(len*th/2500),r:[8,30],h:[2,9]},o.hummocks||{});D.hummocks=[];
  for(let k=0;k<HM.count;k++){const s=U(seed,k,0,0,0x4033)*len,d=(U(seed,k,0,1,0x4033)-.5)*th*.9,p=at(s);D.hummocks.push({x:p[0]+dir[0]*d,z:p[1]+dir[1]*d,r:mix(HM.r[0],HM.r[1],U(seed,k,0,2,0x4033)),h:mix(HM.h[0],HM.h[1],U(seed,k,0,3,0x4033))});}
  // the dam's body for the terrain: the crest over the middle third, a cosine shoulder down to the toe downstream and to `upY` upstream, hummocks on top
  const upY=o.upY==null?lvl-12:o.upY;
  D.groundAt=(x,z)=>{const q=where(x,z);if(!q||q.s<=0&&q.dd>1||q.s>=len&&q.dd>1||Math.abs(q.d)>th/2)return null;const m=Math.abs(q.d)/(th/2),k=ss(1/3,1,m),y0=q.d>0?o.toeY:upY;
   let y=mix(o.crestY,y0,k);for(const h of D.hummocks){const r=Math.hypot(x-h.x,z-h.z);if(r<h.r)y+=h.h*.5*(1+Math.cos(Math.PI*r/h.r))*(1-k*.5);}return y;};
  // the springs low on the downstream face (KRAND by index): position along the crest, the height (toe + `low` share of the head), the share of the seep
  const OU=Object.assign({count:5,low:[.05,.45],seep:1},o.outlets||{}),qs=[];D.springs=[];
  for(let k=0;k<OU.count;k++)qs.push(.4+U(seed,k,1,0,0x5EE9));const qsum=qs.reduce((a,b)=>a+b,0);
  // (d: the metres downstream of the crest where the smooth profile is at height y, by bisection on the shoulder)
  const dAt=y=>{let a=1/3,b=1;for(let it=0;it<40;it++){const m=(a+b)/2;if(mix(o.crestY,o.toeY,ss(1/3,1,m))>y)a=m;else b=m;}return th/2*(a+b)/2;};
  for(let k=0;k<OU.count;k++){const s=(k+.2+.6*U(seed,k,1,1,0x5EE9))/OU.count*len,f=mix(OU.low[0],OU.low[1],U(seed,k,1,2,0x5EE9)),y=mix(o.toeY,lvl,f),d=dAt(y),p=at(s);
   D.springs.push({x:p[0]+dir[0]*d,z:p[1]+dir[1]*d,y,d,q:OU.seep*qs[k]/qsum});}
  // a thread fall from each spring down the face to the toe (WATER.fall on a face: the dam's ground when no `face` is given)
  D.threads=o.threads===false?[]:D.springs.map((p,k)=>{const wd=Math.max(.4,Math.min(4,p.q*3)),dist=Math.max(2,th/2-p.d);
   const ft=[p.x+dir[0]*dist,p.z+dir[1]*dist,o.toeY];
   return W.fall({name:D.name+' thread '+k,lip:[[p.x-lx*wd/2,p.z-lz*wd/2,p.y],[p.x+lx*wd/2,p.z+lz*wd/2,p.y]],dir,speed:.3,drop:p.y-o.toeY,foot:ft,fit:true,face:o.face||((x,z)=>{const g=D.groundAt(x,z);return g==null?o.toeY:g;}),faceLift:.15});});
  // the seep's wet face 0..1: a streak below each spring, as wide as its thread and spreading down it
  D.seepAt=(x,z,y)=>{let s=0;for(const p of D.springs){const ex=x-p.x,ez=z-p.z,u=ex*dir[0]+ez*dir[1],v=Math.abs(ex*lx+ez*lz);if(u<-1||(y!=null&&y>p.y+.5))continue;
    const half=1+Math.max(0,u)*.15+p.q*2;s=Math.max(s,(1-ss(half*.5,half,v))*(1-ss(th*.5,th*.6,u)));}return s;};
  // the drowned trees: snags along the old valley (o.valley [[x, z], ...]) up to `width` m off it, standing where the lake is 1 to h m deep (o.bed)
  const SN=Object.assign({count:0,width:60,h:[6,18]},o.snags||{});D.snags=[];
  if(o.valley&&SN.count>0){const V=o.valley,va=[0];for(let i=1;i<V.length;i++)va.push(va[i-1]+Math.hypot(V[i][0]-V[i-1][0],V[i][1]-V[i-1][1]));const vl=va[va.length-1];
   for(let k=0;k<SN.count*3&&D.snags.length<SN.count;k++){let s=U(seed,k,2,0,0x5A65)*vl,i=0;while(i+2<V.length&&va[i+1]<s)i++;const u=(s-va[i])/Math.max(1e-9,va[i+1]-va[i]),ex=V[i+1][0]-V[i][0],ez=V[i+1][1]-V[i][1],el=Math.hypot(ex,ez)||1,off=(U(seed,k,2,1,0x5A65)-.5)*2*SN.width;
    const x=mix(V[i][0],V[i+1][0],u)-ez/el*off,z=mix(V[i][1],V[i+1][1],u)+ex/el*off,h=mix(SN.h[0],SN.h[1],U(seed,k,2,2,0x5A65)),y0=o.bed?o.bed(x,z):lvl-h*.6;
    if(lvl-y0<1||lvl-y0>h-.5)continue;D.snags.push({x,z,y0,h,lean:(U(seed,k,2,3,0x5A65)-.5)*.3,yaw:U(seed,k,2,4,0x5A65)*TAU});}}
  D.export=()=>({kind:'seepdam',name:D.name,crest:line,crestY:D.crestY,toeY:D.toeY,level:lvl,freeboard:D.freeboard,dir,thickness:th,upY,hummocks:D.hummocks,springs:D.springs,threads:D.threads.map(f=>f.id),snags:D.snags});
  W.groups.push(D);return D;};

 // ================================================================ KARST SPRING (the SW highlands): a blue-green pool boiling up and a gin-clear stream
 W.karstSpring=o=>{const L=o.look||'spring',seed=seedOf(o,'spring'),a=o.at,r=o.r==null?6:o.r,dir=o.dir||[1,0],n=18;
  // the pool's rim: a circle whose radius breathes by KRAND per vertex (+-12%), its outlet vertex pushed to where the stream leaves
  const poly=[];for(let i=0;i<n;i++){const t=TAU*i/n,rr=r*(1+.24*(U(seed,i,0,0,0x5991)-.5));poly.push([a[0]+rr*Math.cos(t),a[1]+rr*Math.sin(t)]);}
  const ang=Math.atan2(dir[1],dir[0]),io=((Math.round(ang/TAU*n)%n)+n)%n;poly[io]=[a[0]+dir[0]*r,a[1]+dir[1]*r];
  const pool=W.withLook(W.still({name:(o.name||'spring')+' pool',level:a[2],poly,fountain:o.boil===false?null:[a[0],a[1]],gradient:W.lookGradient(L,{from:0,to:.85,power:.7})}),L);
  const run=o.run==null?60:o.run,drop=o.drop==null?run*.01:o.drop,ln=o.line||[[a[0]+dir[0]*r*.8,a[1]+dir[1]*r*.8,a[2]],[a[0]+dir[0]*(r+run),a[1]+dir[1]*(r+run),a[2]-drop]];
  const flow=W.withLook(W.flow({name:(o.name||'spring')+' run',pts:ln,width:o.width==null?4:o.width,speed:o.speed==null?.6:o.speed}),o.runLook||'clear');
  const Kp={kind:'karstspring',name:o.name||'spring',pool,flow,at:a,r,dir};
  Kp.export=()=>({kind:'karstspring',name:Kp.name,pool:pool.id,flow:flow.id,at:a,r,dir});W.groups.push(Kp);return Kp;};

 // ---- the surfaces made here go on WATER.surfaces and their records into the export. WATER.at (20) returns only the kinds it ranks, so it is
 // wrapped: where no other surface holds a point, an ice and then a pan that does (WATER.heightAt asks WATER.at, so it answers them too)
 const add=S=>{S.id=W.surfaces.length;S.name=S.name||S.kind+' '+S.id;W.surfaces.push(S);return S;};
 const at0=W.at;
 W.at=(x,z)=>{const S=at0(x,z);if(S)return S;let p=null;for(const s of W.surfaces){if(s.kind==='ice'&&s.contains(x,z))return s;if(!p&&s.kind==='pan'&&s.contains(x,z))p=s;}return p;};
 const base=W.export;
 W.export=()=>{const X=base();X.surfaces.forEach((o,i)=>{const S=W.surfaces[i];if(S&&S.ext)Object.assign(o,S.ext());if(S&&S.look&&'preset' in S.look)o.look=JSON.parse(JSON.stringify(S.look));});return X;};
})();
