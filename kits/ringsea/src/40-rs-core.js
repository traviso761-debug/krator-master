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
function rsBucket(){return {m:{},tris:0,solids:[],sail:[],rigs:[],rig:null};}
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
 (B.m[mk]||(B.m[mk]=[])).push(g);B.tris+=n/3;if(B.rig)B.rig.geos.push(g);return g;}
function rsBake(B,parent,name){const G=parent||new THREE.Group();if(B.rig)rsRigEnd(B);
 for(const mk of Object.keys(B.m).sort()){const L=B.m[mk];let n=0;for(const g of L)n+=g.attributes.position.count;
  const P=new Float32Array(n*3),N=new Float32Array(n*3),U=new Float32Array(n*2),C=new Float32Array(n*3);let o=0;
  const aux=L.some(g=>g.attributes.rsAux),X1=aux?new Float32Array(n*4):null,X2=aux?new Float32Array(n*4):null;
  for(const g of L){const c=g.attributes.position.count;P.set(g.attributes.position.array,o*3);N.set(g.attributes.normal.array,o*3);U.set(g.attributes.uv.array,o*2);C.set(g.attributes.color.array,o*3);
   if(aux&&g.attributes.rsAux){X1.set(g.attributes.rsAux.array,o*4);X2.set(g.attributes.rsAux2.array,o*4);}o+=c;g.dispose();}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(P,3));geo.setAttribute('normal',new THREE.BufferAttribute(N,3));
  geo.setAttribute('uv',new THREE.BufferAttribute(U,2));geo.setAttribute('color',new THREE.BufferAttribute(C,3));
  if(aux){geo.setAttribute('rsAux',new THREE.BufferAttribute(X1,4));geo.setAttribute('rsAux2',new THREE.BufferAttribute(X2,4));}geo.computeBoundingSphere();
  const me=new THREE.Mesh(geo,aux?rsAuxMat(mk,G):rsMat(mk));me.name=(name||'vessel')+':'+mk;G.add(me);}
 G.userData.solids=(G.userData.solids||[]).concat(B.solids);G.userData.sail=(G.userData.sail||[]).concat(B.sail);G.userData.rigs=(G.userData.rigs||[]).concat(B.rigs||[]);
 B.m={};B.solids=[];B.sail=[];B.rigs=[];return G;}
// ---- trim and flags: per-vertex rsAux (pivot x,y,z, kind) and rsAux2 (axis lean ax,az, weight, distance along a flag)
// kind 0 rigid; 1 a sail's rig: rotates by uRsTrim*weight about the mast axis through the pivot (axis (ax,1,az));
// 2 a flag: flutters by its distance from the root and rotates by uRsFlag about the vertical through the root;
// 3 a flag on a yard: flutters, then rotates with the rig. A mesh that carries rsAux gets its own clone of
// the material with the vessel's uniforms (G.userData.rsU, set each frame by the host; 0 = the rest pose),
// so trimming costs no draw call. The baked geometry stays the rest pose (the probes and the raycasts use it).
const RS_AUX_GLSL=`#ifndef RS_UTIME
#define RS_UTIME
uniform float uRsTime;
#endif
attribute vec4 rsAux;attribute vec4 rsAux2;uniform float uRsTrim;uniform float uRsFlag;
mat3 rsAuxR(){float a=(abs(rsAux.w-2.)<.5?uRsFlag:uRsTrim)*rsAux2.z;vec3 k=normalize(vec3(rsAux2.x,1.,rsAux2.y));float c=cos(a),s=sin(a),t=1.-c;
 return mat3(t*k.x*k.x+c,t*k.x*k.y+s*k.z,t*k.x*k.z-s*k.y,t*k.x*k.y-s*k.z,t*k.y*k.y+c,t*k.y*k.z+s*k.x,t*k.x*k.z+s*k.y,t*k.y*k.z-s*k.x,t*k.z*k.z+c);}
`;
function rsAuxVS(sh,U){sh.uniforms.uRsTime=RS_U.uTime;sh.uniforms.uRsTrim=U.uRsTrim;sh.uniforms.uRsFlag=U.uRsFlag;
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\n'+RS_AUX_GLSL)
  .replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\nif(rsAux.w>.5)objectNormal=rsAuxR()*objectNormal;')
  .replace('#include <morphtarget_vertex>','if(rsAux.w>.5){float rsd=rsAux2.w;if(rsd>0.){float rsw=sin(uRsTime*5.3-rsd*1.9+rsAux.x*.37+rsAux.z*.23);'+
   'transformed.z+=rsd*(.05+.01*rsd)*rsw;transformed.y+=rsd*.025*sin(uRsTime*3.1-rsd*1.3+rsAux.x*.2);}transformed=rsAux.xyz+rsAuxR()*(transformed-rsAux.xyz);}\n#include <morphtarget_vertex>');}
function rsAuxMat(mk,G){const U=G.userData.rsU||(G.userData.rsU={uRsTrim:{value:0},uRsFlag:{value:0}});const C=G.userData.rsAuxMats||(G.userData.rsAuxMats={});if(C[mk])return C[mk];
 const base=rsMat(mk),m=base.clone(),pre=base.onBeforeCompile,key=base.customProgramCacheKey();
 m.onBeforeCompile=(sh,r)=>{pre.call(base,sh,r);rsAuxVS(sh,U);};m.customProgramCacheKey=()=>'rsAux|'+key;return C[mk]=m;}
// the same rotation on the CPU (the probes pose the sails with it): point q [x,y,z] of rig R at trim angle a
const _rsAQ=new THREE.Quaternion(),_rsAV=new THREE.Vector3(),_rsAA=new THREE.Vector3();
function rsRigPose(q,R,a){if(!R||!a)return q;_rsAA.set(R.ax,1,R.az).normalize();_rsAQ.setFromAxisAngle(_rsAA,a*R.gain);
 _rsAV.set(q[0]-R.p[0],q[1]-R.p[1],q[2]-R.p[2]).applyQuaternion(_rsAQ);return[R.p[0]+_rsAV.x,R.p[1]+_rsAV.y,R.p[2]+_rsAV.z];}

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
 const q=new THREE.Quaternion().setFromUnitVectors(_rsUp,d.normalize());const m=A.add(Bv).multiplyScalar(.5);const r=rsPut(B,mk,g,[m.x,m.y,m.z],q,null,col);r.userData.rsEnds=1;return r;}   // rsEnds: a rig moves each end on its own (rsRigEnd)
// a smooth tube through points (CatmullRom); r may be a function of t (0..1) for taper
function rsTube(B,mk,pts,r,col,seg,rad){const curve=new THREE.CatmullRomCurve3(pts.map(rsV));seg=seg||Math.max(8,pts.length*6);rad=rad||8;
 const g=new THREE.TubeGeometry(curve,seg,typeof r==='number'?r:1,rad,false);
 if(typeof r==='function'){const p=g.attributes.position;
  for(let i=0;i<=seg;i++){const c=curve.getPointAt(i/seg),k=r(i/seg);for(let j=0;j<=rad;j++){const vi=i*(rad+1)+j;p.setXYZ(vi,c.x+(p.getX(vi)-c.x)*k,c.y+(p.getY(vi)-c.y)*k,c.z+(p.getZ(vi)-c.z)*k);}}
  g.computeVertexNormals();}
 const L=curve.getLength(),uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*L/2,uv.getY(i)*.5);
 // cap the ends so a thick tube (a neck, a prow) is not a hollow pipe from the side
 const tg=rsPut(B,mk,g,null,null,null,col);
 const tr=t=>typeof r==='number'?r:r(t);for(const t of[0,1]){const rr0=tr(t);if(rr0<.02)continue;const P=curve.getPointAt(t),T=curve.getTangentAt(t);
  const cg=new THREE.CircleGeometry(rr0,rad);rsPut(B,mk,cg,[P.x,P.y,P.z],new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),t?T:T.clone().negate()),null,col).userData.rsWith=tg;}
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
// sits in the water it is drawn on. The swell is a sum of Gerstner (trochoidal) waves: a water particle
// at rest point p0 moves to p0 + sum H_i D_i cos(th_i) horizontally and sum A_i sin(th_i) up, with
// th_i = k_i D_i.p0 - w_i t + ph_i, deep-water dispersion w = sqrt(g k), and H_i = steep_i / k_i, so the
// crests sharpen and the troughs flatten (sum of steep < 1 keeps the surface from looping).
// RS_SWELL.waves are [Dx,Dz,k,A,w,ph,H]; rsSwellSet replaces them. The height at a WORLD point needs the rest
// point that lands there: rsSeaH solves p0 + d(p0) = p by Newton's method (3 steps on the CPU, 2 in GLSL,
// both well under a millimetre). fade {cx,cz,r0,r1} (optional) scales the whole swell down beyond r0..r1
// to the fraction fade.min (default 0: flat).
// RS_U.uTime is the one clock every animated shader reads (seconds); the host sets it each frame.
// A host world with its own sea skips the RS sea: it calls rsRide with its own seaH(x,z,t).
const RS_U={uTime:{value:0}};
const RS_SWELL={waves:[],fade:null};
function rsSwellSet(list,fade){RS_SWELL.waves=list.map(([A,lam,deg,ph,st])=>{const k=TAU/lam,a=deg*Math.PI/180;return[Math.cos(a),Math.sin(a),k,A,Math.sqrt(9.81*k),ph||0,(st||0)/k];});RS_SWELL.fade=fade||null;}
function rsSwellFade(x,z){const F=RS_SWELL.fade;if(!F)return 1;const d=Math.hypot(x-F.cx,z-F.cz);const s=clamp((d-F.r0)/(F.r1-F.r0),0,1);return 1-(1-(F.min||0))*s*s*(3-2*s);}
// displacement of the rest point (x0,z0) at t: [dx, h, dz, Jxx, Jxz, Jzz] (J = d(p0+d)/dp0, its determinant < 1 on the crests)
function rsSwellD(x0,z0,t){let dx=0,h=0,dz=0,jxx=1,jxz=0,jzz=1;const f=rsSwellFade(x0,z0);
 for(const w of RS_SWELL.waves){const th=w[2]*(w[0]*x0+w[1]*z0)-w[4]*t+w[5],c=Math.cos(th),s=Math.sin(th),hh=w[6]*f,q=hh*w[2]*s;
  h+=w[3]*s;dx+=hh*w[0]*c;dz+=hh*w[1]*c;jxx-=q*w[0]*w[0];jxz-=q*w[0]*w[1];jzz-=q*w[1]*w[1];}
 return[dx,h*f,dz,jxx,jxz,jzz];}
// the rest point that the swell carries to world (x,z): Newton on p0 + d(p0) = p
function rsSwellRest(x,z,t,n){let x0=x,z0=z;for(let k=0;k<(n||3);k++){const d=rsSwellD(x0,z0,t);const rx=x0+d[0]-x,rz=z0+d[2]-z,det=d[3]*d[5]-d[4]*d[4];
  x0-=(d[5]*rx-d[4]*rz)/det;z0-=(d[3]*rz-d[4]*rx)/det;}return[x0,z0];}
function rsSeaH(x,z,t){const p=rsSwellRest(x,z,t);return rsSwellD(p[0],p[1],t)[1];}
// the same functions in GLSL (needs uniform uRsTime, declared here once):
//   vec3 rsSwellD(vec2 p0)            displacement (dx, h, dz) of the rest point p0
//   float rsSwellH(vec2 p)            the height at world point p (2 Newton steps)
//   vec4 rsSwellNJ(vec2 p0,float mpp) world normal (xyz) and Jacobian determinant (w) at p0, each wave faded out
//                                     where it is finer than the pixel footprint mpp (metres per pixel)
// lod (optional) {cx,cz,r:[[r0,r1] per wave]} fades each wave's DISPLACEMENT (not its normal) beyond r0..r1
// from (cx,cz): a sea mesh whose cells grow toward the horizon cannot draw short waves out there.
function rsSwellGLSL(lod){const f=n=>(+n).toFixed(6),F=RS_SWELL.fade,W=RS_SWELL.waves;
 const fade=F?`float rsFd(vec2 p){float s=smoothstep(${f(F.r0)},${f(F.r1)},length(p-vec2(${f(F.cx)},${f(F.cz)})));return 1.-${f(1-(F.min||0))}*s;}\n`:'float rsFd(vec2 p){return 1.;}\n';
 const th=(w)=>`${f(w[2]*w[0])}*p.x+${f(w[2]*w[1])}*p.y-${f(w[4])}*uRsTime+${f(w[5])}`;
 let s='#ifndef RS_UTIME\n#define RS_UTIME\nuniform float uRsTime;\n#endif\n'+fade;
 s+='vec3 rsSwellD(vec2 p){vec3 r=vec3(0.);float a,l;float fd=rsFd(p);'+(lod?`float rd=length(p-vec2(${f(lod.cx)},${f(lod.cz)}));`:'')+'\n';
 W.forEach((w,i)=>{s+=` a=${th(w)};l=fd${lod?`*(1.-smoothstep(${f(lod.r[i][0])},${f(lod.r[i][1])},rd))`:''};r+=vec3(cos(a)*${f(w[6]*w[0])},sin(a)*${f(w[3])},cos(a)*${f(w[6]*w[1])})*l;\n`;});
 s+=' return r;}\n';
 s+='vec4 rsSwellNJ(vec2 p,float mpp){float a,c,sn,q,l;float fd=rsFd(p);vec3 gx=vec3(1.,0.,0.),gz=vec3(0.,0.,1.);\n';
 W.forEach(w=>{s+=` a=${th(w)};c=cos(a);sn=sin(a);l=fd*(1.-smoothstep(.35,1.1,${f(w[2])}*mpp));q=${f(w[6]*w[2])}*sn*l;`+
  `gx+=vec3(-q*${f(w[0]*w[0])},c*${f(w[3]*w[2]*w[0])}*l,-q*${f(w[0]*w[1])});gz+=vec3(-q*${f(w[0]*w[1])},c*${f(w[3]*w[2]*w[1])}*l,-q*${f(w[1]*w[1])});\n`;});
 s+=' return vec4(normalize(cross(gz,gx)),gx.x*gz.z-gx.z*gz.x);}\n';
 // Newton on the horizontal map, with its Jacobian (full amplitude: the hulls and the wakes ride this one)
 s+='float rsSwellH(vec2 p){vec2 p0=p;float a,c,sn,q,fd;vec2 d;vec3 j;\n for(int k=0;k<2;k++){fd=rsFd(p0);d=vec2(0.);j=vec3(1.,0.,1.);\n';
 W.forEach(w=>{s+=`  a=${f(w[2]*w[0])}*p0.x+${f(w[2]*w[1])}*p0.y-${f(w[4])}*uRsTime+${f(w[5])};c=cos(a)*fd;q=${f(w[6]*w[2])}*sin(a)*fd;d+=vec2(${f(w[6]*w[0])},${f(w[6]*w[1])})*c;j-=q*vec3(${f(w[0]*w[0])},${f(w[0]*w[1])},${f(w[1]*w[1])});\n`;});
 s+='  vec2 r=p0+d-p;float det=j.x*j.z-j.y*j.y;p0-=vec2(j.z*r.x-j.y*r.y,j.x*r.y-j.y*r.x)/det;}\n return rsSwellD(p0).y;}\n';
 return s;}
// ride: pose a vessel group G (definition D: L, B) at world x,z, heading yaw, on the sea seaH at time t.
// Heave is the mean of five samples (amidships, bow, stern, both beams); pitch and roll are the slopes
// between them, so a long hull averages short waves out and a canoe follows them. heel (rad, optional)
// is added to the roll: + lays the starboard side down (a turn to starboard heels into it).
function rsRide(G,D,x,z,yaw,t,seaH,heel){seaH=seaH||rsSeaH;const lx=D.L*.36,bz=clamp(D.B*.28,.5,6),c=Math.cos(yaw||0),s=Math.sin(yaw||0);
 const at=(f,q)=>seaH(x+c*f+s*q,z-s*f+c*q,t);const h0=at(0,0),hb=at(lx,0),hs=at(-lx,0),hst=at(0,bz),hp=at(0,-bz);
 G.position.set(x,(2*h0+hb+hs+hst+hp)/6,z);G.rotation.set(-Math.atan2(hst-hp,2*bz)+(heel||0),yaw||0,Math.atan2(hb-hs,2*lx),'YXZ');}
