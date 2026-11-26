// ================================================================= HOST — the glacier's things, the copper's nodes, the ice worms (every station)
// As RECORDS first (README.md), then drawn: KGLACIER places the icefall's seracs, the bergs calved into the tarn or the pond and the crevasses (KRAND per
// index), and records the ice caves; core/terrain's drawer (host/44h-core-glacier-draw.js) draws them. Each crevasse and the calving ice cliff is a
// core/hazard record (fall, crush). The resource data's nodes (CG_RES, 44r) are registered and drawn as outcrops where they stand on dry ground: the
// copper's malachite and gossan, the iron's rust, the tin's and the silver's grey veins. THE ICE WORMS: the glacier's own animal, dark threads that come up
// to the surface of the bare ice and the firn at dusk and glow faintly blue-green (Krator's glow), drawn as points on the ice near the eye.
const GLACIER={seracs:0,bergs:0,crevasses:0,caves:CAVES.length,nodes:0,worms:0};
const LIGHTS=[];   /* the drawer's day and night hooks (the steam's colour, the caves' inner light): called when the hour crosses dusk or dawn */
const ICECLEAR=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return null;const P=KMAT.packed('copperglacier','ice.clear');if(!P)return null;const t=KMAT.textures(P,{aniso:4}).map;t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;})();
const ICE_MAT=BIO.solidMat(ICECLEAR);   /* the library's clear ice, tinted by the instance colour */
const ICEC=[0xeef6fc,0xe2eef8,0xd6e8f4,0xf4f8fc,0xcce2f2],ICECU=[0xd4f0e8,0xc8ece0,0xdcf4ec];   /* on the copper ground the ice is greener */
/* the caves sit in the ice: an apron of ice from each shell's flank out to the ground (.7 R), their feet carried 2.5 m into the ground (skirt) (45 levels a pad round each, wider than a ground cell), a planar map on the outer face (no swirl at the top) */
const GD=KGLACIER.drawer({scene,register:REGISTER,ground:terrainH,ticks:TICKS,onLight:LIGHTS,camera,renderer,map:ICECLEAR,up:SITE.up,across:[SITE.up[1],-SITE.up[0]],skirt:2.5,apron:.7,fine:2,mouthTop:.52,uvWorld:true});   /* a low mouth under a roof of ice */
GD.defSerac(ICE_MAT);
const iceCol=(x,z)=>{const k=FIELD.copper(x,z)>.2||(SITE.skarn&&CU.p(x,z)>.5);return new THREE.Color(pick(k?ICECU:ICEC));};
(function(){reseed(8711);
 // the icefall's seracs
 G.seracs({u:SITE.icefall,minIce:8,max:420}).forEach(r=>{GD.putSerac(r,iceCol(r.x,r.z).multiplyScalar(rr(.95,1.05)));GLACIER.seracs++;});
 // the bergs: calved into the tarn off the ice cliff, or into the pond
 if(TARN)G.bergs({level:TARN.level,n:14,water:(x,z)=>waterH(x,z)===TARN.level&&terrainH(x,z)<TARN.level-1.5}).forEach(r=>{GD.putSerac(r,iceCol(r.x,r.z));GLACIER.bergs++;});
 if(POND)G.bergs({level:POND.level,n:5,s:[1.2,3.5],ok:(x,z)=>terrainH(x,z)<POND.level-.8}).forEach(r=>{GD.putSerac(r,iceCol(r.x,r.z));GLACIER.bergs++;});})();
// the crevasses: slots across the ice where it stretches, each a fall hazard
const CREV=[];(SITE.crevasses||[]).forEach(u=>CREV.push(...G.crevasses({u})));
GD.crevasses(CREV,(x,z)=>terrainH(x,z));GLACIER.crevasses=CREV.length;
CREV.forEach(r=>BIO.record({name:'A crevasse (hidden under the snow where it bridges)',x:r.x,z:r.z,y:terrainH(r.x,r.z)-6,r:r.len*.5,h:8,tags:{hazard:{kind:'fall',danger:.9}}}));   /* a core/tags record (core/hazard reads it), not a volume of the inspector's: a slot is too thin for the probe's occupancy */
// the ice caves: KGLACIER's records, the drawer's shells (cold inside: blue ice, bare)
G.caves(CAVES).forEach((C,i)=>GD.cave(Object.assign({},C,{reg:{cave:i}})));
// the ice cliff where the snout breaks off (over the tarn, or over the icefield's edge): it calves
{const u=GS.snout+4,c=upAt(u,GS.centre(u)),W=G.W(GS.snout);if(G.T(GS.snout+20)>15)REGISTER({name:TARN?'The ice cliff (calving into the tarn)':'The ice cliff (the icefield\'s edge; it calves)',x:c[0],z:c[1],y:landH(c[0],c[1])-2,r:Math.min(W,900),h:G.T(GS.snout+20)+10,
 tags:{hazard:{kind:'crush',danger:.7}}});}
// the glacier, the tarn, the pond as volumes
{const c=upAt(SITE.icefall[0],GS.centre(SITE.icefall[0]));REGISTER({name:'The glacier (KGLACIER: its icefall, crevasses and seracs)',x:c[0],z:c[1],y:landH(c[0],c[1])-20,r:Math.min(1400,G.W(SITE.icefall[0])*1.5),h:420});}
if(TARN){const c=upAt(GS.snout-900,GS.centre(GS.snout-900));REGISTER({name:TARN.name,x:c[0],z:c[1],y:TARN.level-40,r:1300,h:50});}
if(POND){const c=upAt((G.termU(TERM.p0)+GS.snout)/2,TERM.p0);REGISTER({name:POND.name,x:c[0],z:c[1],y:POND.level-8,r:TERM.W0*.9,h:14});}
// THE NODES (kits/resources, read at build time): registered in core/tags with their id, kind and grade; an outcrop where they stand on dry ground. A node
// on the ice or under water is listed (window._nodes) and not drawn: the field drops a node on water (RES_GEO), and the ice hides one
const NODE_ROCK={copper:['malachite','gossan'],iron:['gossan'],tin:['boulder'],silver:['boulder'],gold:['boulder']};
const NODE_COL={copper:[0xdcefe4,0xf0dccc],iron:[0xf0d8c8,0xe8ccb8],tin:[0xc8c4c0,0xd4d0cc],silver:[0xe0e2e6,0xeceef2],gold:[0xe0d4b8,0xece0c4]};   /* near white: the library's malachite and gossan carry the colour */
const _pk=BIO.kit('copperglacier');   /* the outcrops are the kit's rocks: its registry */
window._nodes=(CG_RES.nodes||[]).map(n=>{const inside=Math.abs(n.x)<TERR.R*1.05&&Math.abs(n.z)<TERR.R*1.05,dry=inside&&iceAt(n.x,n.z)<.3&&waterH(n.x,n.z)<-1e8;
 if(dry){reseed(KRAND.hash(8720,n.x|0,n.z|0));const y=terrainH(n.x,n.z),k=NODE_ROCK[n.kind]||['boulder'],cols=NODE_COL[n.kind]||[0x7a7670];
  for(let i=0;i<ri(7,12);i++){const a=rr(0,TAU),d=i?rr(1,9):0,x=n.x+Math.cos(a)*d,z=n.z+Math.sin(a)*d,r=rr(.6,2.2)*(i?1:1.6);
   BIO.put(pick(k),[x,terrainH(x,z)+r*.2,z],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[r*rr(.9,1.3),r*rr(.6,.9),r*rr(.9,1.3)],COPPERG.vary(new THREE.Color(pick(cols)),.02,.05,.05));}
  REGISTER({name:'A '+n.kind+' node ('+n.grade+' grade; '+n.id+': kits/resources)',x:n.x,z:n.z,y:y-2,r:12,h:8,kind:'res-node',tags:{res:{id:n.id,kind:n.kind,grade:n.grade}}});GLACIER.nodes++;}
 return{id:n.id,kind:n.kind,grade:n.grade,x:n.x,z:n.z,drawn:dry,inside};});
BIO.kit(_pk);
// THE ICE WORMS: points on the bare ice and the firn within ~600 m of the spine, KRAND per 6 m cell; they glow from dusk to dawn
const WORMS=SITE.worms?(function(){const P=[],seed=KRAND.child(8730,'copperglacier/worms/'+SITE.key),cs=6;
 SPINE.forEach((s,si)=>{for(let j=-50;j<=50;j++)for(let i=-50;i<=50;i++){const x=s[0]+i*cs,z=s[1]+j*cs;if(Math.hypot(i,j)>50)continue;const h=KRAND.hash(seed,Math.round(x/cs),Math.round(z/cs));
  if(KRAND.unit(h)>.06)continue;if(SPINE.some((q,k)=>k<si&&Math.hypot(x-q[0],z-q[1])<=300))continue;const it=iceAt(x,z);if(it<2||FIELD.debris(x,z)>.5)continue;
  for(let n=0;n<4;n++){const u=KRAND.unit(KRAND.hash(h,n,1)),v=KRAND.unit(KRAND.hash(h,n,2)),px=x+(u-.5)*cs,pz=z+(v-.5)*cs;P.push(px,terrainH(px,pz)+.04,pz);}}});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));
 const m=new THREE.PointsMaterial({color:0x6effd8,size:.09,sizeAttenuation:true,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,fog:true});
 const pts=new THREE.Points(g,m);pts.userData.probeSkip=true;pts.userData.inspectLabel='Ice worms (they come up at dusk and glow)';pts.renderOrder=2;scene.add(pts);GLACIER.worms=P.length/3;
 BIO.record({name:'Ice worms (the glacier\'s own animal: up at dusk, faintly lit)',x:SPINE[0][0],z:SPINE[0][1],y:terrainH(SPINE[0][0],SPINE[0][1])-4,r:300,h:10,kind:'fauna'});
 return{pts,m};})():null;
let NIGHT=null;
TICKS.push(dt=>{const hr=typeof ATMOS!=='undefined'&&ATMOS.clock?ATMOS.clock.hour:12,n=hr<5.5||hr>19.5;
 if(WORMS)WORMS.m.opacity=.85*clamp(Math.max(smooth(18.5,20,hr),1-smooth(5,6.5,hr)),0,1);
 if(n!==NIGHT){NIGHT=n;LIGHTS.forEach(f=>f(n?'night':'day'));}});
GD.bindClock();
OBSTACLES.push(...CREV.map(r=>({x:r.x,z:r.z,r:r.len*.5})));
