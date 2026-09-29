/* ------------------------------------------------------------------ GLUE (hand-written; tools/anc_glue.js) */
var ANC_Q = [];            /* queued meshes: {geo, mw, mat} */
var ANC_STAT = {};         /* per asset-key: {tris, meshes, inst} (last build) */
var ANC_OVER = [];         /* debugging: meshes poking out of their footprint */
var _m1=new THREE.Matrix4(), _v1=new THREE.Vector3(), _q0=new THREE.Quaternion(), _av = new THREE.Vector3(), _aq = new THREE.Quaternion(), _as = new THREE.Vector3();

function ancItemLens(){ var o={}; ANCK.KIT.order.forEach(function(n){ o[n]=ANCK.KIT.items[n].length; }); return o; }

/* wall samples for the inhabitation dressing: near-vertical faces of the OUTER shell, in kit-local coords */
function ancWallSamples(G, count, yMax, rnd){
  var tris=[], cum=[], tot=0, v=new THREE.Vector3(), skip=[ANCK.MAT.guts, ANCK.MAT.dark, ANCK.MAT.glass, ANCK.MAT.mud, ANCK.MAT.rock, ANCK.MAT.winDead, ANCK.MAT.darkGlass];
  G.updateMatrixWorld(true);
  var inv=new THREE.Matrix4().copy(G.matrixWorld).invert();
  G.traverse(function(o){ if(!o.isMesh || skip.indexOf(o.material)>=0 || o.material.transparent) return;
    var g=o.geometry, A=g.attributes.position; if(!A) return; var M=new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld);
    if(!g.boundingBox) g.computeBoundingBox(); var bc=g.boundingBox.getCenter(new THREE.Vector3()).applyMatrix4(M);
    var P=A.array, I=g.index?g.index.array:null, nT=I?I.length/3:A.count/3, p=[0,0,0,0,0,0,0,0,0];
    for(var f=0; f<nT; f++){
      for(var k=0;k<3;k++){ var a=(I?I[f*3+k]:f*3+k)*3; v.set(P[a],P[a+1],P[a+2]).applyMatrix4(M); p[k*3]=v.x; p[k*3+1]=v.y; p[k*3+2]=v.z; }
      var cy=(p[1]+p[4]+p[7])/3; if(cy>yMax || cy<0.3) continue;
      var ux=p[3]-p[0],uy=p[4]-p[1],uz=p[5]-p[2], vx=p[6]-p[0],vy=p[7]-p[1],vz=p[8]-p[2];
      var nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx, L=Math.hypot(nx,ny,nz); if(!(L>1e-6)) continue;
      if(Math.abs(ny/L)>0.35) continue;
      var cx=(p[0]+p[3]+p[6])/3, cz=(p[2]+p[5]+p[8])/3; nx/=L; nz/=L; var h=Math.hypot(nx,nz); nx/=h; nz/=h;
      if(nx*(cx-bc.x)+nz*(cz-bc.z)<0){ nx=-nx; nz=-nz; }
      tot+=L*0.5; tris.push([cx,cy,cz,nx,nz]); cum.push(tot);
    } });
  var out=[]; if(!(tot>0)) return out;
  for(var i=0;i<count;i++){ var t=rnd()*tot, lo=0, hi=cum.length-1; while(lo<hi){ var m=(lo+hi)>>1; if(cum[m]<t) lo=m+1; else hi=m; } out.push(tris[lo]); }
  return out;
}

/* ANC_build(type, F, decay, scale, opt)
   type   : a kit builder key (ANCK.B)            F : an asset frame (or null = dry run: measure only)
   decay  : 0 intact | 1 ruined | 2 toppled | 3 repaired        scale : uniform
   opt    : { bd: builder decay override, holes, repair:bool, cx,cz: kit-unit centre, yaw0, w,d: footprint (metres) for culling, key }
   returns { box:{min,max} (kit units, meshes only), tris, walls:[[lx,ly,lz,nx,nz]...] (F-local metres) } */
function ANC_build(type, F, decay, scale, opt){
  opt=opt||{}; scale=scale||1;
  var fn=ANCK.B[type]; if(!fn){ ERR('ANC_build: no such type '+type); return null; }
  var bd = opt.bd!=null ? opt.bd : decay, rep = opt.repair!=null ? opt.repair : decay===3;
  var cx=opt.cx||0, cz=opt.cz||0, yaw0=opt.yaw0||0;
  /* kit-local -> F-local */
  var ML=new THREE.Matrix4().makeScale(scale,scale,scale).multiply(new THREE.Matrix4().makeRotationY(yaw0)).multiply(new THREE.Matrix4().makeTranslation(-cx,opt.yoff||0,-cz));
  var MW=F ? new THREE.Matrix4().makeTranslation(F.x,F.y,F.z).multiply(new THREE.Matrix4().makeRotationY(F.ry)).multiply(ML) : ML.clone();
  var qW=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), (F?F.ry:0)+yaw0);
  if(F) ANCK.setTH(function(x,z){ _av.set(x,0,z).applyMatrix4(MW); return (WORLD_TH(_av.x,_av.z)-F.y)/scale; }); else ANCK.setTH(null);
  ANCK.setRSC(1/scale); ANCK.setSeg(opt.segk||0.5, opt.thin||1, opt.thinNames, opt.uvk||1); ANCK.setWorn(!!opt.worn); ANCK.setDish(!!opt.dishWhole); ANCK.setTight(!!opt.tight);
  var lens0=ancItemLens(), holder=new THREE.Group(), key=opt.key||type, G=null;
  ANCK.TSTAT.by[key]=null; ANCK.TSTAT.cur=key; ANCK.setHoles(opt.holes!=null?opt.holes:(decay===3?0.55:1));
  try{ G=fn(holder,0,0,bd); if(G && rep) ANCK.repair(G, scale); if(G && opt.weather){ ANCK.rust(G, scale, lens0); ANCK.weather(G, scale, opt.plants||0); } }catch(e){ ERR('ancients '+type+': '+(e&&e.stack||e)); }
  ANCK.setHoles(1); ANCK.setWorn(false); ANCK.setDish(false); ANCK.setTight(false); ANCK.TSTAT.cur=null; ANCK.setTH(null); ANCK.resetXF();
  if(!G) return null;
  var walls = (F && opt.walls) ? ancWallSamples(G, opt.walls, 16/scale, F.rnd).map(function(s){ _av.set(s[0],s[1],s[2]).applyMatrix4(ML); var c=Math.cos(yaw0), sn=Math.sin(yaw0); return [_av.x,_av.y,_av.z, s[3]*c+s[4]*sn, -s[3]*sn+s[4]*c]; }).filter(function(s){ return Math.abs(s[0])<(opt.fw||1e9)/2 && Math.abs(s[2])<(opt.fd||1e9)/2; }) : [];
  /* meshes: measure, cull, queue */
  var tintC=opt.tint?new THREE.Color(opt.tint[0],opt.tint[1],opt.tint[2]):null, tintM=(opt.tintMat==='white'?[ANCK.MAT.white,ANCK.MAT.whiteWorn]:[ANCK.MAT.rust]), ninst=0, byName={}, box=new THREE.Box3(), hw=(opt.fw||1e9)/2, hd=(opt.fd||1e9)/2, tris=0, bb=new THREE.Box3();
  G.matrixAutoUpdate=false; G.matrix.identity(); G.updateMatrixWorld(true);
  var list=[]; G.traverse(function(o){ if(o.isMesh && o.geometry && o.geometry.attributes.position && o.geometry.attributes.position.count) list.push(o); });
  list.forEach(function(o){ var g=o.geometry; if(!g.boundingBox) g.computeBoundingBox(); if(!isFinite(g.boundingBox.min.x)) return;
    bb.copy(g.boundingBox).applyMatrix4(new THREE.Matrix4().multiplyMatrices(ML,o.matrixWorld));
    var mx=(bb.min.x+bb.max.x)/2, mz=(bb.min.z+bb.max.z)/2;
    if(Math.abs(mx)>hw || Math.abs(mz)>hd) return;                          /* a fragment that fell outside the plot: gone */
    box.union(bb); tris+=ANCK.triOf(g); byName.MESH=(byName.MESH||0)+ANCK.triOf(g); if(!F) return;
    var ov=Math.max(bb.max.x-hw, -hw-bb.min.x, bb.max.z-hd, -hd-bb.min.z); if(ov>0.6) ANC_OVER.push([key, ov.toFixed(1)]);
    ANC_Q.push({ geo:g, mw:new THREE.Matrix4().multiplyMatrices(MW,o.matrixWorld), mat:o.material, t:(tintM.indexOf(o.material)>=0?tintC:null) }); });
  /* instanced items pushed by this build: to world (or dropped on a dry run / outside the plot) */
  ANCK.KIT.order.forEach(function(n){ var arr=ANCK.KIT.items[n], i0=lens0[n]||0; if(arr.length<=i0) return;
    var add=arr.splice(i0, arr.length-i0), def=ANCK.KIT.defs[n], kt=ANCK.triOf(def.geo); if(!def.geo.boundingSphere) def.geo.computeBoundingSphere(); var gr=def.geo.boundingSphere.radius+def.geo.boundingSphere.center.length(), rusty=(tintM.indexOf(def.mat)>=0);
    add.forEach(function(it){ _av.set(it.p[0],it.p[1],it.p[2]).applyMatrix4(ML); if(Math.abs(_av.x)>hw-0.8 || Math.abs(_av.z)>hd-0.8) return;
      if(n!=='slab'){ var gb=def.geo.boundingBox||(def.geo.computeBoundingBox(),def.geo.boundingBox), big=0; if(typeof it.s==='number') _as.set(it.s,it.s,it.s); else _as.set(it.s[0],it.s[1],it.s[2]);
        _v1.set(it.p[0],it.p[1],it.p[2]); _m1.compose(_v1, it.q||_q0, _as).premultiply(ML);
        for(var ci=0;ci<8;ci++){ _v1.set(ci&1?gb.max.x:gb.min.x, ci&2?gb.max.y:gb.min.y, ci&4?gb.max.z:gb.min.z).applyMatrix4(_m1); big=Math.max(big, Math.abs(_v1.x)-hw, Math.abs(_v1.z)-hd); }
        if(big>1.5) return;    /* a long pipe / beam that would leave the plot */
        for(var ci2=0;ci2<8;ci2++){ _v1.set(ci2&1?gb.max.x:gb.min.x, ci2&2?gb.max.y:gb.min.y, ci2&4?gb.max.z:gb.min.z).applyMatrix4(_m1); box.expandByPoint(_v1); } }
      if(rusty && tintC && !it.c) it.c=tintC;
      if(opt.worn && def.mat===ANCK.MAT.white) it.w=1;
      tris+=kt; ninst++; byName[n]=(byName[n]||0)+kt; if(!F) return;
      _av.set(it.p[0],it.p[1],it.p[2]).applyMatrix4(MW); it.p=[_av.x,_av.y,_av.z];
      it.q=(it.q?it.q.clone():new THREE.Quaternion()).premultiply(qW);
      it.s= typeof it.s==='number' ? it.s*scale : [it.s[0]*scale, it.s[1]*scale, it.s[2]*scale];
      arr.push(it); }); });
  if(F) ANC_STAT[key]={ tris:Math.round(tris), inst:ninst, w:+(box.max.x-box.min.x).toFixed(1), d:+(box.max.z-box.min.z).toFixed(1), h:+box.max.y.toFixed(1), c:[+((box.max.x+box.min.x)/2).toFixed(1), +((box.max.z+box.min.z)/2).toFixed(1)] };
  return { box:box, tris:tris, walls:walls, byName:byName };
}

/* ---------- ANC_finish: everything queued -> one mesh per output material ---------- */
var ANC_OUT = {};   /* bucket key -> {mat, parts:[]} */
function ancBucket(mat){
  var k, tint=mat.color?mat.color:null;
  if(mat===ANCK.MAT.strip || mat===ANCK.MAT.dot) k='flat';
  else if(mat.transparent) k='tr_'+mat.uuid;
  else if(mat.map) k='tex_'+mat.map.uuid;
  else k='flat';
  var B=ANC_OUT[k];
  if(!B){ var om, nm='anc_'+k.slice(0,12);
    if(mat.transparent){ om=mat.clone(); om.vertexColors=true; tint=null;
      if(mat.isMeshStandardMaterial) nlMaterial(om, nm, mat.onBeforeCompile||null);
      else if(mat.onBeforeCompile) om.onBeforeCompile=mat.onBeforeCompile; }
    else om=nlMaterial(new THREE.MeshLambertMaterial({ color:0xffffff, map:mat.map||null, vertexColors:true, side:THREE.DoubleSide }), nm);
    B=ANC_OUT[k]={ mat:om, parts:[], tr:!!mat.transparent, mesh:null }; }
  return { B:B, tint:(B.tr?null:tint) };
}
function ANC_finish(){
  /* gather */
  ANC_Q.forEach(function(q){ var b=ancBucket(q.mat); b.B.parts.push({ geo:q.geo, m:q.mw, c:(q.t && b.tint ? b.tint.clone().multiply(q.t) : b.tint) }); }); ANC_Q.length=0;
  var m4=new THREE.Matrix4(), q0=new THREE.Quaternion();
  ANCK.KIT.order.forEach(function(n){ var arr=ANCK.KIT.items[n]; if(!arr.length) return; var def=ANCK.KIT.defs[n], b0=ancBucket(def.mat), bw=(def.mat===ANCK.MAT.white? ancBucket(ANCK.MAT.whiteWorn) : null);
    arr.forEach(function(it){ var b=(it.w&&bw)?bw:b0; _av.set(it.p[0],it.p[1],it.p[2]); if(typeof it.s==='number') _as.set(it.s,it.s,it.s); else _as.set(it.s[0],it.s[1],it.s[2]);
      var c=it.c||null; if(b.tint){ c = c ? c.clone().multiply(b.tint) : b.tint; }
      b.B.parts.push({ geo:def.geo, m:new THREE.Matrix4().compose(_av, it.q||q0, _as), c:c }); });
    arr.length=0; });
  /* merge */
  var nMesh=0, nTri=0, n3=new THREE.Matrix3(), v=new THREE.Vector3(), col=new THREE.Color();
  for(var k in ANC_OUT){ var B=ANC_OUT[k]; if(!B.parts.length) continue;
    var nv=0, ni=0; B.parts.forEach(function(p){ var g=p.geo; if(!g.attributes.normal) g.computeVertexNormals(); nv+=g.attributes.position.count; ni+=g.index?g.index.count:g.attributes.position.count; });
    var P=new Float32Array(nv*3), N=new Float32Array(nv*3), U=new Float32Array(nv*2), C=new Float32Array(nv*3), I=new Uint32Array(ni), vo=0, io=0;
    B.parts.forEach(function(p){ var g=p.geo, A=g.attributes, cnt=A.position.count, pa=A.position.array, na=A.normal.array, ua=A.uv?A.uv.array:null, e=p.m.elements;
      n3.getNormalMatrix(p.m); var ne=n3.elements;
      if(p.c){ col.setRGB(Math.pow(p.c.r,1.5),Math.pow(p.c.g,1.5),Math.pow(p.c.b,1.5)); } else col.setRGB(1,1,1);   /* the kit's colours were tuned raw (r128, no colour management): keep them so */
      for(var i=0;i<cnt;i++){ var x=pa[i*3], y=pa[i*3+1], z=pa[i*3+2], o=(vo+i)*3;
        P[o]=e[0]*x+e[4]*y+e[8]*z+e[12]; P[o+1]=e[1]*x+e[5]*y+e[9]*z+e[13]; P[o+2]=e[2]*x+e[6]*y+e[10]*z+e[14];
        var a=na[i*3], b2=na[i*3+1], c2=na[i*3+2], nx=ne[0]*a+ne[3]*b2+ne[6]*c2, ny=ne[1]*a+ne[4]*b2+ne[7]*c2, nz=ne[2]*a+ne[5]*b2+ne[8]*c2, L=Math.sqrt(nx*nx+ny*ny+nz*nz)||1;
        N[o]=nx/L; N[o+1]=ny/L; N[o+2]=nz/L; C[o]=col.r; C[o+1]=col.g; C[o+2]=col.b;
        if(ua){ U[(vo+i)*2]=ua[i*2]; U[(vo+i)*2+1]=ua[i*2+1]; } }
      if(g.index){ var ix=g.index.array; for(var j=0;j<ix.length;j++) I[io+j]=ix[j]+vo; io+=ix.length; } else { for(var j2=0;j2<cnt;j2++) I[io+j2]=vo+j2; io+=cnt; }
      vo+=cnt; });
    var geo=new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(P,3)); geo.setAttribute('normal', new THREE.BufferAttribute(N,3));
    geo.setAttribute('uv', new THREE.BufferAttribute(U,2)); geo.setAttribute('color', new THREE.BufferAttribute(C,3)); geo.setIndex(new THREE.BufferAttribute(I,1));
    var me=new THREE.Mesh(geo, B.mat); me.userData.inspectLabel='Ancient structure'; me.userData.ancient=true; me.frustumCulled=false;
    me.castShadow = !FAST && !B.tr; me.receiveShadow = !FAST && !B.tr; if(B.tr) me.renderOrder=2;
    scene.add(me); nMesh++; nTri+=ni/3; B.parts=[]; }
  window._anc = { meshes:(window._anc?window._anc.meshes:0)+nMesh, tris:(window._anc?window._anc.tris:0)+Math.round(nTri), stat:ANC_STAT, over:ANC_OVER };
}
window.ANC_build=ANC_build; window.ANC_finish=ANC_finish;
(window.YUNI_FINISHERS = (window.YUNI_FINISHERS||[])).push(ANC_finish);
