// ================================================================= YS CITY — the biome bound (biomes/nwbay on the city's ground)
// The north-west bay kit (src/86-bio-*: the shared biome core and the nwbay fragments, vendored byte for byte) grows on
// the city's natural ground, the karst stacks and the river banks. 86-bio-45-city-init.js bound THREE before the
// species loaded; this fragment gives BIO the city's facts once the city stands (a YS_AFTER hook: after every placer,
// the spans and the land–sea lattice, before kbake): the terrain (ysKarstH already puts a stack's top inside its
// footprint, so the forest roots up there), a MASK that is zero wherever the city is, the five climate fields, the
// hosts and the landmarks as obstacles, the scene's tick list and the camera's eye. Then NWBAY.build, the stacks'
// faces dressed with the hanging gardens (the faces are the terrain mesh's own steep triangles: no stack has a mesh of
// its own), a karst forest on the tops the kit leaves to its cliff figs, one BIO.bake. The biome draws its own
// InstancedMeshes and merged buckets (never kput: the kit's bake does not see it) and keeps its own PRNG: no
// Math.random, no draw from the lineage's rng(), so the city's rubble does not move when the biome changes.
//
// THE MASK (BIOME-API.md, the host contract):  0 on water (terrainH < .3) and off the map; 0 on a stack's rim band
// (12 m inside the wall's top), its face and the scree at its foot (8 m), and on the whole top of a landmark's stack
// (its building takes it); 0 in the river's water strip (ysRiverDist d < .85 w, rising to 1 by 1.3 w); 0 on every
// occupancy box (buildings, hosts' caps, streets, highways, piers, slots) and on the moles' plates; .15 in the city's
// land blocks and in the drowned grid's awash land (the streets read), .35 in the farm blocks; 1 on natural ground.
const YS_BIO={SEED:11,R:2500,Q:.55,HUE:.47,RIM:12,FOOT:8,cache:null,spine:null,obstacles:[],faces:0,karstTrees:0,dressed:[]};
const ysBioSm=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
// the slow readers cached on an 8 m lattice over the map: the river's distance and width, the signed shore distance,
// the natural ground before the carve (the upland reads it, so the valley and the stack tops are not uplands)
function ysBioCache(){if(YS_BIO.cache)return YS_BIO.cache;const C=8,X0=-1720,N=431;const n2=N*N;
 const rd=new Float32Array(n2),rw=new Float32Array(n2),sd=new Float32Array(n2),nat=new Float32Array(n2);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=X0+i*C,z=X0+j*C,k=j*N+i;const r=ysRiverDist(x,z);rd[k]=r.d;rw[k]=r.w;sd[k]=ysShoreDist(x,z);nat[k]=ysNatBase(x,z);}
 const at=(A,x,z)=>{const u=Math.max(0,Math.min(N-1.001,(x-X0)/C)),v=Math.max(0,Math.min(N-1.001,(z-X0)/C)),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,k=j*N+i;
  return A[k]*(1-fu)*(1-fv)+A[k+1]*fu*(1-fv)+A[k+N]*(1-fu)*fv+A[k+N+1]*fu*fv;};
 return YS_BIO.cache={rd:(x,z)=>at(rd,x,z),rw:(x,z)=>at(rw,x,z),sd:(x,z)=>at(sd,x,z),nat:(x,z)=>at(nat,x,z)};}
// the nearest stack's wall: kd the distance from the wall's top edge in the stack's frame (negative inside; the face
// falls over kd -8..0 (84-city-geo ysKarstH), the ground lies beyond), s the stack. null off the rock
function ysBioStack(x,z){let best=null;for(const s of ysStacksNear(x,z)){const L=ysStackLocal(s,x,z);const kd=L.d-ysStackRR(s,L.th);if(!best||kd<best.kd)best={kd,s};}return best;}
// the karst field: 1 on a stack's top from 13 m inside the wall's top edge, 0 from 6 m beyond its foot; the band
// between is the face (the contract's "1 inside by ~5 m, 0 outside by ~6 m" measured from the rim at kd -8)
function ysBioKarst(x,z){const K=ysBioStack(x,z);return K?ysBioSm(6,-13,K.kd):0;}
function ysBioBlock(x,z){const g=ysBlockIJ(x,z);const b=ysBlock(Math.round(g[0]),Math.round(g[1]));return b&&!b.synthetic?b:null;}
function ysBioPaved(x,z){if(ysPlClash(ysPlBox(x,z,.6,.6,0,'bio')))return true;
 for(const m of PLACE.moles)if(x>=m.x0-6&&x<=m.x1+6&&z>=m.z0-6&&z<=m.z1+6&&ysPlInPoly(m.poly,x,z))return true;return false;}
function ysBioMask(x,z){
 if(Math.abs(x)>1600||Math.abs(z)>1600)return 0;
 if(terrainH(x,z)<.3)return 0;
 const K=ysBioStack(x,z);
 if(K){if(K.kd>-YS_BIO.RIM&&K.kd<YS_BIO.FOOT)return 0;if(K.s.flat&&K.kd<=-YS_BIO.RIM)return 0;}
 const C=ysBioCache();const rd=C.rd(x,z),w=C.rw(x,z);if(rd<w*.85)return 0;
 let m=ysBioSm(w*.85,w*1.3,rd);
 if(ysBioPaved(x,z))return 0;
 const b=ysBioBlock(x,z);if(b)m*=b.kind!=='land'?.15:b.use==='farm'?.35:.15;
 return m;}
// THE CLIMATE. wet: 1 round the bay and along the river, .14 on the high slope, damp on the stack tops, .62 inside the
// city's blocks (the flame-crown's lowland, not the giants' jungle), .3 in the drowned grid (the old city's paving, not
// mud: no mangroves between the stumps), .25 on anything paved. salt: 1 at the waterline and at sea, 0 by 250 m inland,
// 0 in the drowned grid. upland: the natural ground, 4 m -> 0, 59 m -> 1 (the Inner Wall's foothills). flow: 1 within a
// width of the river's line, 0 by 3.4 widths. karst: the stacks (above).
function ysBioFields(){const C=ysBioCache();
 const upland=(x,z)=>Math.max(0,Math.min(1,(C.nat(x,z)-4)/55));
 return{upland,karst:ysBioKarst,
  wet:(x,z)=>{const b=ysBioBlock(x,z);if(b&&b.kind!=='land')return .3;if(ysBioPaved(x,z))return .25;
   const up=upland(x,z),rd=C.rd(x,z),w=C.rw(x,z),sd=C.sd(x,z);
   let v=Math.max(.14,1-.86*ysBioSm(.18,.58,up));
   v=Math.max(v,.95*ysBioSm(w*4.5,w*1.4,rd)*(1-.45*ysBioSm(.5,.8,up)),.6*ysBioSm(160,15,sd));
   if(b)v=Math.min(v,.62);
   const K=ysBioStack(x,z);if(K&&K.kd<-8)v=Math.max(.55,v*.85);
   return Math.min(1,v);},
  salt:(x,z)=>{const b=ysBioBlock(x,z);if(b&&b.kind!=='land')return 0;const sd=C.sd(x,z);return sd<0?1:ysBioSm(250,8,sd);},
  flow:(x,z)=>{const rd=C.rd(x,z),w=C.rw(x,z);return ysBioSm(w*3.4,w*1.0,rd);}};}
// obstacles (cylinders nothing may grow inside, and the soarers' loops clear): every host's cap over its whole height,
// every landmark's and ruin's registered volume, and the big buildings; never the stacks
function ysBioObstacles(){const O=[];
 for(const h of PLACE.hosts)O.push({x:h.x,z:h.z,r:((h.cap&&h.cap.hw)||40)*1.05+6,y0:h.sink-2,y1:h.top+40,tag:h.n});
 for(const r of REG){const D=r.key&&typeof HYK!=='undefined'&&HYK.defs[r.key];
  if((D&&D.cls==='landmark')||r.cls==='ruin'||(r.cls==='building'&&r.r>=14))O.push({x:r.x,z:r.z,r:r.r+3,y0:(r.y||0)-2,y1:(r.y||0)+r.h+6,tag:r.name});}
 return O;}
// the LOD spine: along the shore from the head of the bay a kilometre out both ways (the city's surroundings keep their
// detail; the far ends of the bay and the upland are impostors), and up the river's lower reach for the banks
function ysBioSpine(){const S=[],P=CITY.SHORE;let acc=0,tHead=null;
 const cum=[0];for(let i=0;i<P.length-1;i++){acc+=Math.hypot(P[i+1][0]-P[i][0],P[i+1][1]-P[i][1]);cum.push(acc);}
 {let best=1e9;for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],dx=b[0]-a[0],dz=b[1]-a[1],L2=dx*dx+dz*dz||1;const t=Math.max(0,Math.min(1,((CITY.HEAD[0]-a[0])*dx+(CITY.HEAD[1]-a[1])*dz)/L2));
   const d=Math.hypot(CITY.HEAD[0]-a[0]-dx*t,CITY.HEAD[1]-a[1]-dz*t);if(d<best){best=d;tHead=cum[i]+t*(cum[i+1]-cum[i]);}}}
 for(let s=tHead-1000;s<=tHead+1000;s+=200){if(s<0||s>acc)continue;let i=0;while(i<cum.length-2&&cum[i+1]<s)i++;const a=P[i],b=P[i+1],t=(s-cum[i])/((cum[i+1]-cum[i])||1);
  S.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}
 const R=CITY.RIVER.pts;for(let i=0;i<4&&i<R.length;i++)S.push([R[i][0],R[i][1]]);
 return S;}
// the stacks' faces for the dress pass, read off the drawn terrain: every chunk triangle standing on a stack's wall
// (steep: |ny| < .6, within 4 m of the wall's foot) is a face, and the up-facing ring 6..26 m inside the top edge of a
// field stack is its rim ledge (the curtains hang from its outer edge; a landmark's stack keeps its top for its
// building). One BufferGeometry per stack, never added to the scene: the terrain already draws the wall.
function ysBioFaces(){const F=new Map();if(typeof PORT_TERRAIN==='undefined'||!PORT_TERRAIN)return F;
 const skip=s=>/far karst/.test(s.n||'')||BIO.lodD(s.x,s.z)>1700;
 for(const m of PORT_TERRAIN.chunks){const g=m.geometry,p=g.attributes.position,idx=g.index.array;
  for(let i=0;i<idx.length;i+=3){const a=idx[i],b=idx[i+1],c=idx[i+2];
   const ax=p.getX(a),ay=p.getY(a),az=p.getZ(a),bx=p.getX(b),by=p.getY(b),bz=p.getZ(b),cx=p.getX(c),cy=p.getY(c),cz=p.getZ(c);
   const mx=(ax+bx+cx)/3,mz=(az+bz+cz)/3;const near=ysStacksNear(mx,mz);if(!near.length)continue;
   let best=null;for(const s of near){if(skip(s))continue;const L=ysStackLocal(s,mx,mz);const kd=L.d-ysStackRR(s,L.th);if(kd<4&&(!best||kd<best.kd))best={s,kd};}
   if(!best)continue;
   const ux=bx-ax,uy=by-ay,uz=bz-az,vx=cx-ax,vy=cy-ay,vz=cz-az;let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz);if(l<1e-9)continue;nx/=l;ny/=l;nz/=l;
   const face=Math.abs(ny)<.6,ring=ny>=.6&&best.kd<-6&&best.kd>-26&&!best.s.flat;if(!face&&!ring)continue;
   let G=F.get(best.s);if(!G){G={pos:[],faces:0,ring:0};F.set(best.s,G);}G.pos.push(ax,ay,az,bx,by,bz,cx,cy,cz);if(face)G.faces++;else G.ring++;}}
 return F;}
// the hanging gardens: counts by the wall's perimeter and height, thinned with the LOD; the root curtains and lianas
// hang 14..50 m (the faces are 60..240 m: the lower face carries the wall growth)
function ysBioDress(){const F=ysBioFaces();let k=0,geos=0;
 for(const [s,G] of F){if(!G.pos.length)continue;const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(G.pos,3));
  const e=s.e||1,P=Math.PI*s.r*(1+e),lod=BIO.lod(s.x,s.z),hang=Math.max(14,Math.min(50,s.h*.4));
  const nW=Math.max(40,Math.min(900,Math.round(P*s.h/220*lod)));
  try{NWBAY.dress([geo],{seed:k+1,karst:true,ledges:{moss:Math.round(P*.5*lod),plants:Math.round(P*.3*lod),edges:Math.round(P/2.2*lod),hang,treeH:9,size:2.2,mossR:3},soffits:{n:1},walls:{n:nW,hang}});}
  catch(err){reportErr('biome dress '+(s.n||'')+': '+err.stack);}
  YS_BIO.dressed.push({n:s.n,faces:G.faces,ring:G.ring,walls:nW});k++;geos++;}
 YS_BIO.faces=geos;return geos;}
// THE KARST FOREST. The kit's tree pass roots nothing but its cliff figs on the rock (55-trees: a species past the mask
// could reach a sea stack's foot), so the fan-crowns, crown ferns and splay shrubs its zones table promises for the
// tops are placed here, the way the API lets a world place a species itself (NWBAY.BUILDERS[sp](T,st,lv) on a filled
// record): a jittered grid over every field stack's top within 1.5 km of the spine, where karst > .97 and the mask
// allows (so never on the rim band), clear of the figs and of each other.
function ysBioKarstForest(){const SP=NWBAY.SPECIES,B=NWBAY.BUILDERS;if(!B||!B[4]||!B[2]||!B[5])return 0;const {reseed,rng,rr,ri}=BIO.fn;reseed(890017);
 const st={trunk:0,limb:0,cups:0,far:0,sapTris:0,clumps:0,blooms:0,pods:0,moss:0,fronds:0,fans:0,epi:0,lianas:0,roots:0,whorls:0,heroes:0,fars:0,figsOnEdge:0,byS:SP.map(()=>0)};
 let n=0;const placed=[];
 for(const s of CITY.STACKS){if(s.flat||/far karst/.test(s.n||''))continue;const ld=BIO.lodD(s.x,s.z);if(ld>1500)continue;const lv=ld<800?2:1;
  const R=s.r*(s.e||1)+10,cell=lv===2?13:20;
  BIO.grid(cell,0,R,(x,z)=>BIO.field('karst',x,z)<.97?0:.7*YS_BIO.Q,(x,y,z)=>{
   if(NWBAY.blocked(x,z,2))return;for(const q of placed)if(Math.hypot(x-q[0],z-q[1])<q[2])return;
   const u=rng(),sp=u<.22?2:u<.72?4:5,S=SP[sp];
   const T={x,z,y0:y-.5,sp,H:rr(S.H[0],S.H[1]),rb:rr(S.rb[0],S.rb[1]),crownR:rr(S.crownR[0],S.crownR[1]),seed:ri(0,999999),wet:BIO.field('wet',x,z),lv};
   try{B[sp](T,st,lv);}catch(err){reportErr('karst forest '+S.key+': '+err.message);return;}
   NWBAY.TREES.push(T);placed.push([x,z,T.rb*1.4+(sp===2?5:1.5)]);n++;},{center:[s.x,s.z],patch:.3,patchScale:.02,pad:1});}
 YS_BIO.karstTrees=n;return n;}
// the build: after every placer (YS_BUILD), the shell flush and the lattice (YS_AFTER's earlier hooks); before kbake,
// which does not see the biome's meshes anyway
window._biome=null;
YS_AFTER.push(function(scene){const t0=performance.now();
 try{
  ysBioCache();YS_BIO.spine=ysBioSpine();YS_BIO.obstacles=ysBioObstacles();
  BIO.init({THREE:THREE,scene:scene,terrainH:(x,z)=>terrainH(x,z),mask:ysBioMask,obstacles:YS_BIO.obstacles,
   ticks:fn=>{window.YS_TICKS.push(fn);},seed:YS_BIO.SEED,origin:YS_BIO.spine,center:CITY.HEAD,fields:ysBioFields(),
   eye:()=>[camera.position.x,camera.position.y,camera.position.z],err:m=>reportErr('biome: '+m),
   // the biome's passes are budgeted as their own types under the 'biome' class (93z-city-api sets it)
   stat:(k,tris,inst)=>{const key='biome/'+(String(k).split('/')[1]||'core');const t=TSTAT.by[key]||(TSTAT.by[key]={tris:0,inst:0,meshes:0});t.tris+=tris;t.inst+=inst;}});
  BIO.setSun([sun.position.x,sun.position.y,sun.position.z]);
  const r0=REG.length;
  const out=NWBAY.build({R:YS_BIO.R,quality:YS_BIO.Q,bayHue:YS_BIO.HUE,fauna:true})||{};
  ysBioDress();
  BIO.cur='nwbay/karst';ysBioKarstForest();BIO.cur=null;
  // the registered trees and reed beds are flora of the bay: in the inspector and the tag audit, out of the labels
  for(let i=r0;i<REG.length;i++){const r=REG[i];r.cls='flora';r.type='biome';r.tags=Object.assign({culture:'wild',type:['flora'],wealth:'none',biome:'nwbay'},r.tags||{});}
  const b=BIO.bake();for(const m of BIO.baked){m.userData.own='biome';}
  const T=NWBAY.TREES||[],SP=NWBAY.SPECIES,S=BIO.stats;
  const shrubs=T.filter(t=>/splay|pandan/.test(SP[t.sp].key)).length;
  window._biome={trees:T.length,heroes:out.heroes||0,far:out.far||0,shrubs,figsOnEdge:out.figsOnEdge||0,karstTrees:YS_BIO.karstTrees,bySpecies:out.bySpecies||'',
   floor:(S['nwbay/floor']||{}).inst||0,reeds:(S['nwbay/reeds']||{}).inst||0,dress:(S['nwbay/dress']||{}).inst||0,stacksDressed:YS_BIO.faces,
   fauna:{flocks:out.flocks||0,birds:out.birds||0,pods:out.pods||0,swimmers:out.swimmers||0,swarms:out.swarms||0,glints:out.glints||0},
   tris:BIO.totals().tris,inst:BIO.totals().inst,calls:b.calls,registered:REG.length-r0,obstacles:YS_BIO.obstacles.length,ms:Math.round(performance.now()-t0)};
 }catch(e){reportErr('biome: '+e.stack);}});
