// ---------------------------------------------------------------- ring sea: units, compass, the vessel frame
// Metres; a person is 1.75 m. WORLD: x east, z south, north is -z, y up, the sea surface is y=0.
// VESSEL FRAME (every builder works in it): origin amidships ON THE WATERLINE, bow toward +x,
// starboard toward +z, y up. The scene places and rotates the finished group; a builder never
// knows where it stands. That is what makes one vessel fragment portable to another world:
// copy 40-42 (this core, the hull, the textures) and the vessel's own fragment, call its
// build function, add the returned group to your scene, and push its anim into your frame loop.

// ---------------------------------------------------------------- registry
// RS_VESSEL({key,name,culture,tags:{type,propulsion,hull,wealth,crew,...},L,B,H,blurb,build})
// build() returns {group, anims:[fn(t,dt)], deckY, crewN}; L/B/H are the length, beam and
// air draught used by the scene's layout and camera presets (keep them honest).
const RS={defs:{},order:[]};
function RS_VESSEL(o){RS.defs[o.key]=o;RS.order.push(o.key);}

// ---------------------------------------------------------------- materials
// Few materials, coloured per vertex: a vessel bakes to one mesh per material key, so a whole
// trireme is ~8 draw calls. Every *textured* map is near-white so the vertex colour tints it.
const RS_TEX={};
function rsNoiseTex(key,W,H,fn){if(!RS_TEX[key])RS_TEX[key]=canvasTex(W,H,fn);return RS_TEX[key];}
const RSMAT={};
function rsMat(key){if(RSMAT[key])return RSMAT[key];throw new Error('rsMat: unknown material key '+key);}
function rsDefMat(key,m){RSMAT[key]=m;return m;}

// ---------------------------------------------------------------- merge buckets
// A bucket collects transformed, non-indexed pieces per material key; rsBake merges each key into
// one BufferGeometry (position, normal, uv, color). Pieces are CONSUMED: never reuse a geometry
// after rsPut. Indexed stock geometry is expanded through toNonIndexed(), which walks the index
// (the Three.js pitfall: never concatenate an indexed position array by hand).
function rsBucket(){return {m:{},tris:0,solids:[],sail:[]};}
// solids: boxes sails must not pass through (cabins, castles); rsSolid adds one by hand
function rsSolid(B,min,max){B.solids.push({min,max});}
const _rsM=new THREE.Matrix4(),_rsQ=new THREE.Quaternion(),_rsE=new THREE.Euler(),_rsP=new THREE.Vector3(),_rsS=new THREE.Vector3();
function rsQ(rot){if(!rot)return _rsQ.set(0,0,0,1);if(rot.isQuaternion)return rot;_rsE.set(rot[0]||0,rot[1]||0,rot[2]||0,rot[3]||'XYZ');return _rsQ.setFromEuler(_rsE);}
function rsCol(c){return c&&c.isColor?c:new THREE.Color(c==null?0xffffff:c);}
function rsPut(B,mk,geo,pos,rot,scl,col){
 let g=geo.index?geo.toNonIndexed():geo;if(g!==geo)geo.dispose();
 if(!g.attributes.normal)g.computeVertexNormals();
 const n=g.attributes.position.count;
 if(!g.attributes.uv)g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(n*2),2));
 if(!g.attributes.color){const C=rsCol(col),a=new Float32Array(n*3);for(let i=0;i<n;i++){a[i*3]=C.r;a[i*3+1]=C.g;a[i*3+2]=C.b;}g.setAttribute('color',new THREE.Float32BufferAttribute(a,3));}
 if(pos||rot||scl){_rsP.set(pos?pos[0]:0,pos?pos[1]:0,pos?pos[2]:0);const s=scl==null?1:scl;if(typeof s==='number')_rsS.set(s,s,s);else _rsS.set(s[0],s[1],s[2]);
  _rsM.compose(_rsP,rsQ(rot),_rsS);g.applyMatrix4(_rsM);}
 (B.m[mk]||(B.m[mk]=[])).push(g);B.tris+=n/3;return g;}
function rsBake(B,parent,name){const G=parent||new THREE.Group();
 for(const mk of Object.keys(B.m).sort()){const L=B.m[mk];let n=0;for(const g of L)n+=g.attributes.position.count;
  const P=new Float32Array(n*3),N=new Float32Array(n*3),U=new Float32Array(n*2),C=new Float32Array(n*3);let o=0;
  for(const g of L){const c=g.attributes.position.count;P.set(g.attributes.position.array,o*3);N.set(g.attributes.normal.array,o*3);U.set(g.attributes.uv.array,o*2);C.set(g.attributes.color.array,o*3);o+=c;g.dispose();}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(P,3));geo.setAttribute('normal',new THREE.BufferAttribute(N,3));
  geo.setAttribute('uv',new THREE.BufferAttribute(U,2));geo.setAttribute('color',new THREE.BufferAttribute(C,3));geo.computeBoundingSphere();
  const me=new THREE.Mesh(geo,rsMat(mk));me.name=(name||'vessel')+':'+mk;G.add(me);}
 G.userData.solids=(G.userData.solids||[]).concat(B.solids);G.userData.sail=(G.userData.sail||[]).concat(B.sail);B.m={};B.solids=[];B.sail=[];return G;}

// world-unit UVs, triplanar by the face normal: a 2 m plank tile stays 2 m on a 0.3 m cleat and
// a 30 m wale alike. Call on a geometry at its REAL size, before rsPut moves it.
function rsUV(geo,tile,alongX){const p=geo.attributes.position,nr=geo.attributes.normal;const n=p.count,uv=new Float32Array(n*2);tile=tile||2;
 for(let i=0;i<n;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),ax=Math.abs(nr.getX(i)),ay=Math.abs(nr.getY(i)),az=Math.abs(nr.getZ(i));let u,v;
  if(ay>=ax&&ay>=az){u=x;v=z;}else if(ax>=az){u=z;v=y;}else{u=x;v=y;}
  if(alongX===false){const t=u;u=v;v=t;}uv[i*2]=u/tile;uv[i*2+1]=v/tile;}
 geo.setAttribute('uv',new THREE.BufferAttribute(uv,2));return geo;}

// ---------------------------------------------------------------- primitives (vessel frame, into a bucket)
const rsV=(a)=>new THREE.Vector3(a[0],a[1],a[2]);
function rsBox(B,mk,dim,pos,rot,col,tile){const g=rsUV(new THREE.BoxGeometry(dim[0],dim[1],dim[2]),tile||2);return rsPut(B,mk,g,pos,rot,null,col);}
function rsCyl(B,mk,rTop,rBot,h,pos,rot,col,seg){const g=new THREE.CylinderGeometry(rTop,rBot,h,seg||10,1);return rsPut(B,mk,rsUV(g,2,false),pos,rot,null,col);}
function rsSphere(B,mk,r,pos,scl,col,ws,hs){const g=new THREE.SphereGeometry(r,ws||12,hs||8);return rsPut(B,mk,rsUV(g,2),pos,null,scl,col);}
function rsCone(B,mk,r,h,pos,rot,col,seg){const g=new THREE.ConeGeometry(r,h,seg||10,1);return rsPut(B,mk,rsUV(g,2),pos,rot,null,col);}
// a cylinder (or tapered spar) from a to b
const _rsUp=new THREE.Vector3(0,1,0);
function rsLink(B,mk,a,b,r0,col,seg,r1){const A=rsV(a),Bv=rsV(b),d=Bv.clone().sub(A);const L=d.length();if(L<1e-4)return null;
 const g=rsUV(new THREE.CylinderGeometry(r1==null?r0:r1,r0,L,seg||8,1),Math.max(.5,L),false);
 const q=new THREE.Quaternion().setFromUnitVectors(_rsUp,d.normalize());const m=A.add(Bv).multiplyScalar(.5);return rsPut(B,mk,g,[m.x,m.y,m.z],q,null,col);}
// a smooth tube through points (CatmullRom); r may be a function of t (0..1) for taper
function rsTube(B,mk,pts,r,col,seg,rad){const curve=new THREE.CatmullRomCurve3(pts.map(rsV));seg=seg||Math.max(8,pts.length*6);rad=rad||8;
 const g=new THREE.TubeGeometry(curve,seg,typeof r==='number'?r:1,rad,false);
 if(typeof r==='function'){const p=g.attributes.position;
  for(let i=0;i<=seg;i++){const c=curve.getPointAt(i/seg),k=r(i/seg);for(let j=0;j<=rad;j++){const vi=i*(rad+1)+j;p.setXYZ(vi,c.x+(p.getX(vi)-c.x)*k,c.y+(p.getY(vi)-c.y)*k,c.z+(p.getZ(vi)-c.z)*k);}}
  g.computeVertexNormals();}
 const L=curve.getLength(),uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*L/2,uv.getY(i)*.5);
 // cap the ends so a thick tube (a neck, a prow) is not a hollow pipe from the side
 rsPut(B,mk,g,null,null,null,col);
 const tr=t=>typeof r==='number'?r:r(t);for(const t of[0,1]){const rr0=tr(t);if(rr0<.02)continue;const P=curve.getPointAt(t),T=curve.getTangentAt(t);
  const cg=new THREE.CircleGeometry(rr0,rad);rsPut(B,mk,cg,[P.x,P.y,P.z],new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),t?T:T.clone().negate()),null,col);}
 return curve;}
// a parametric surface fn(u,v)->[x,y,z] (u,v in 0..1) with its own uv fn (default: u,v scaled)
function rsGrid(fn,nu,nv,uvFn){const pos=[],uv=[],idx=[];
 for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){const u=i/nu,v=j/nv;const p=fn(u,v);pos.push(p[0],p[1],p[2]);const t=uvFn?uvFn(u,v,p):[u,v];uv.push(t[0],t[1]);}
 for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=j*(nu+1)+i,b=a+1,c=a+nu+1,d=c+1;idx.push(a,b,d,a,d,c);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
// per-vertex colours for a surface: fn(u,v)->hex, applied after rsGrid (same vertex order)
function rsGridColors(g,nu,nv,fn){const n=(nu+1)*(nv+1),a=new Float32Array(n*3),c=new THREE.Color();
 for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){c.set(fn(i/nu,j/nv));const k=(j*(nu+1)+i)*3;a[k]=c.r;a[k+1]=c.g;a[k+2]=c.b;}g.setAttribute('color',new THREE.Float32BufferAttribute(a,3));return g;}
// a pyramid / tiered roof tier: square frustum with a flared eave (Thai, Burmese, junk deckhouses)
function rsRoof(B,mk,w,d,h,pos,rot,col,flare,top){top=top==null?.08:top;flare=flare||0;
 const g=rsGrid((u,v)=>{const a=u*TAU;const sx=Math.cos(a),sz=Math.sin(a);const m=Math.max(Math.abs(sx),Math.abs(sz));const k=lerp(1,top,v)+flare*Math.pow(1-v,3);
  return[sx/m*w/2*k,v*h,sz/m*d/2*k];},16,6,(u,v)=>[u*(w+d)/2,v*h/2]);
 return rsPut(B,mk,g,pos,rot,null,col);}
// a crew figure, standing or seated, facing +x of its own yaw; 1.75 m standing
function rsFigure(B,pos,yaw,cloth,sit,skin){const q=qEuler(0,yaw||0,0),s=skin||0x8a5a3c;const P=(dx,dy,dz)=>{const v=new THREE.Vector3(dx,dy,dz).applyQuaternion(q);return[pos[0]+v.x,pos[1]+v.y,pos[2]+v.z];};
 if(sit){rsCyl(B,'cloth',.17,.2,.62,P(0,.55,0),q,cloth,7);rsBox(B,'cloth',[.42,.16,.34],P(.18,.26,0),q,cloth);rsSphere(B,'paint',.12,P(.02,.98,0),null,s,8,6);}
 else{rsCyl(B,'cloth',.17,.21,.72,P(0,1.12,0),q,cloth,7);rsCyl(B,'paint',.07,.08,.8,P(0,.4,-.1),q,s,5);rsCyl(B,'paint',.07,.08,.8,P(0,.4,.1),q,s,5);rsSphere(B,'paint',.12,P(0,1.6,0),null,s,8,6);}}

// ---------------------------------------------------------------- the swell, the wind, riding
// ONE wave function drives the sea's vertex shader and every hull's heave, pitch and roll, so a hull
// sits in the water it is drawn on. RS_SWELL.waves are travelling sines [kx,kz,A,omega,phase] (deep-water
// dispersion, omega=sqrt(g k)); rsSwellSet replaces them, fade {cx,cz,r0,r1} flattens the sea beyond r0..r1.
// RS_U.uTime is the one clock every animated shader reads (seconds); the host sets it each frame.
// A host world with its own sea skips the RS sea: it calls rsRide with its own seaH(x,z,t).
const RS_U={uTime:{value:0}};
const RS_SWELL={waves:[],fade:null};
function rsSwellSet(list,fade){RS_SWELL.waves=list.map(([A,lam,deg,ph])=>{const k=TAU/lam,a=deg*Math.PI/180;return[k*Math.cos(a),k*Math.sin(a),A,Math.sqrt(9.81*k),ph||0];});RS_SWELL.fade=fade||null;}
function rsSwellFade(x,z){const F=RS_SWELL.fade;if(!F)return 1;const d=Math.hypot(x-F.cx,z-F.cz);const s=clamp((d-F.r0)/(F.r1-F.r0),0,1);return 1-s*s*(3-2*s);}
function rsSeaH(x,z,t){let h=0;for(const w of RS_SWELL.waves)h+=w[2]*Math.sin(w[0]*x+w[1]*z-w[3]*t+w[4]);return h*rsSwellFade(x,z);}
// the same function in GLSL: vec3 rsSwell(vec2 worldXZ) = (height, dh/dx, dh/dz); needs uniform uRsTime
function rsSwellGLSL(){const f=n=>(+n).toFixed(6);let s='uniform float uRsTime;\nvec3 rsSwell(vec2 p){vec3 r=vec3(0.);float a;\n';
 for(const w of RS_SWELL.waves)s+=` a=${f(w[0])}*p.x+${f(w[1])}*p.y-${f(w[3])}*uRsTime+${f(w[4])};r+=vec3(sin(a),cos(a)*${f(w[0])},cos(a)*${f(w[1])})*${f(w[2])};\n`;
 const F=RS_SWELL.fade;if(F)s+=` r*=1.-smoothstep(${f(F.r0)},${f(F.r1)},length(p-vec2(${f(F.cx)},${f(F.cz)})));\n`;return s+' return r;}\n';}
// ride: pose a vessel group G (definition D: L, B) at world x,z, heading yaw, on the sea seaH at time t.
// Heave is the mean of five samples (amidships, bow, stern, both beams); pitch and roll are the slopes
// between them, so a long hull averages short waves out and a canoe follows them.
function rsRide(G,D,x,z,yaw,t,seaH){seaH=seaH||rsSeaH;const lx=D.L*.36,bz=clamp(D.B*.28,.5,6),c=Math.cos(yaw||0),s=Math.sin(yaw||0);
 const at=(f,q)=>seaH(x+c*f+s*q,z-s*f+c*q,t);const h0=at(0,0),hb=at(lx,0),hs=at(-lx,0),hst=at(0,bz),hp=at(0,-bz);
 G.position.set(x,(2*h0+hb+hs+hst+hp)/6,z);G.rotation.set(-Math.atan2(hst-hp,2*bz),yaw||0,Math.atan2(hb-hs,2*lx),'YXZ');}
