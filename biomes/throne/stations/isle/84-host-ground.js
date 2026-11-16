// ================================================================= HOST — the ground, the sea, the streams (the isle)
// Two ground meshes painted from the layout and the fields: the isle (9.5 m) and, sewn into a hole in it, THE BASIN's patch
// (1.6 m: the springs' pits and the sinter terraces are metres across). Its border vertices take the coarse mesh's own
// heights along each edge, so the seam has no cracks. Then the library's layers over both (materials.json): the forest's
// litter, black sand, sinter, the springs' scalloped rims and the runoff terraces, mud, lichened basalt, the trail's packed
// earth, sulphur round the fumaroles. The sea is the shared wave field (core/atmos: 89 binds it); the streams are ribbons.
REGISTER({name:'The geyser basin (the isle\'s crown)',x:BASIN.x,z:BASIN.z,y:basinFloor(BASIN.x,BASIN.z)-6,r:BASIN.ra*1.1,h:60});
REGISTER({name:'The warm lagoon',x:LAGOON.x,z:LAGOON.z,y:SEA-4,r:LAGOON.r,h:40});

// ---------------------------------------------------------------- the paint (shared by both meshes)
const K=hx=>new THREE.Color(hx);
const PAINT={LITTER:K(0x3e3a26),LITTER2:K(0x4e4630),GROVE:K(0x4a4228),MOSS:K(0x4a5a2a),SINTER:K(0xd6d2c6),SINTER2:K(0xbab4a6),ORANGE:K(0xd07020),
 RUST:K(0xa04a1e),BROWN:K(0x6a4a2a),OLIVE:K(0x6a6a34),YELLOW:K(0xd8b83a),SULPH:K(0xd8c848),MUD:K(0x8a8274),SAND:K(0x2c2a2a),WETSAND:K(0x1e1c1c),
 OLIV:K(0x5a6a3a),ROCK:K(0x4a4844),LICH:K(0x8a8a6a),PACK:K(0x8a6a4c),LAGMUD:K(0x3e3626),SEABED:K(0x6a6a5a),BED:K(0x5a5448)};
// the mats round a spring, by how far out from its edge (0 the rim .. 1 the mats' end): orange, rust, brown, olive. A
// hotter spring's mats start farther out (nothing lives in boiling water)
function matCol(c,t){if(t<.25)c.copy(PAINT.ORANGE).lerp(PAINT.RUST,t/.25);else if(t<.6)c.copy(PAINT.RUST).lerp(PAINT.BROWN,(t-.25)/.35);else c.copy(PAINT.BROWN).lerp(PAINT.OLIVE,(t-.6)/.4);return c;}
// how much mat at a point and of which band (the springs' rings and the runoff channels): {k, t}
function matAt(x,z){let k=0,t=1;
 for(const P of POOLS){const d=Math.hypot(x-P.x,z-P.z)-P.r*1.02,w=P.r*(.6+.8*(1.1-P.temp))+3;if(d<-1||d>w)continue;const kk=smooth(w,w*.6,d)*smooth(-1,.5,d);if(kk>k){k=kk;t=clamp(d/w,0,1);}}
 for(const R of RUNOFF){const d=segD(x,z,R.pts);if(d>R.w*2.2)continue;const kk=smooth(R.w*2.2,R.w*.4,d)*(1-smooth(.45,.98,basinE(x,z))*.3);if(kk>k){k=kk;t=clamp(d/(R.w*2.2),0,1)*.8;}}
 return{k,t};}
const _mc=new THREE.Color();
function paintAt(c,x,z,at,n,n2,pav){const h=terrainH(x,z),ab=h-SEA;
 c.copy(PAINT.LITTER).lerp(PAINT.LITTER2,clamp(.5+n*1.8,0,1));
 c.lerp(PAINT.GROVE,at('grove')*.6).lerp(PAINT.MOSS,at('flow')*.5);
 // the sinter: grey-white, streaked, the mats on it
 const si=at('sinter');if(si>0){_mc.copy(PAINT.SINTER).lerp(PAINT.SINTER2,clamp(.5+n*2+n2,0,1));c.lerp(_mc,si*.95);
  const M=matAt(x,z);if(M.k>0)c.lerp(matCol(_mc,M.t),M.k*.92);
  const v=at('vent');c.lerp(PAINT.SULPH,smooth(.4,.75,v)*.55);}
 {const d=Math.hypot(x-MUD.x,z-MUD.z);c.lerp(PAINT.MUD,smooth(MUD.r*1.5,MUD.r*.8,d)*.9);}
 // the shores: black sand (olivine-green in the coves), darker where it is wet; the lagoon's mud; under the water the bed
 const sd=at('sand'),cove=smooth(.55,.75,fbm(x*.004,z*.004,4,2));_mc.copy(PAINT.SAND).lerp(PAINT.OLIV,cove*.65).lerp(PAINT.WETSAND,smooth(1.2,.3,ab));c.lerp(_mc,Math.max(sd,at('beach')*.35)*.95);
 const dl=Math.hypot(x-LAGOON.x,z-LAGOON.z);c.lerp(PAINT.LAGMUD,smooth(LAGOON.r*1.35,LAGOON.r*1.0,dl)*smooth(2.5,.5,ab));
 if(ab<0)c.copy(PAINT.SEABED).lerp(PAINT.SAND,smooth(-1,-12,ab)*.6).lerp(PAINT.LAGMUD,smooth(LAGOON.r*1.2,LAGOON.r*.8,dl));
 _mc.copy(PAINT.ROCK).lerp(PAINT.LICH,smooth(.4,.7,pav)*.5);c.lerp(_mc,at('rock')*.85);
 c.lerp(PAINT.BED,at('flow')*.4);c.lerp(PAINT.PACK,Math.max(at('path'),at('camp')*.8));
 return c;}
const paintTex=(W,x0,z0,S,at)=>BIO.canvasTex(W,W,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const c=new THREE.Color();
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=x0+(x/w)*S,wz=z0+(y/h)*S;
  const n=fbm(wx/(S/w*24),wz/(S/w*24),.3,2)-.5,n2=(BIO.fn.h3(x,y,3)-.5),pav=fbm(wx*.012+5,wz*.012-2,.7,2);
  paintAt(c,wx,wz,k=>at(k,wx,wz),n,n2,pav);const k=1+n*.12+n2*.06;
  d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const atFC=(k,x,z)=>FC.at(FC.a[k],x,z);
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(fbm(x/9,y/9,5,2)-.5)*40+(BIO.fn.h3(x,y,9)-.5)*26;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
/* the macro's blue channel carries the detail (2026-11-09: TEX_DETAIL's own grey, the same pixels; on the library ground the two maps are
   one texture unit, which the isle's mesh needs: it read seventeen of sixteen on the GPU once core/atmos's cloud noise was counted) */
const TEX_MACRO=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,a=fbm(x/40,y/40,7.3,3),b=fbm(x/13,y/13,7.4,2);d[i]=a*255;d[i+1]=b*255;
  d[i+2]=clamp(232+(fbm(x/9,y/9,5,2)-.5)*40+(BIO.fn.h3(x,y,9)-.5)*26,0,255);d[i+3]=255;}g.putImageData(id,0,0);});
TEX_MACRO.wrapS=TEX_MACRO.wrapT=THREE.RepeatWrapping;TEX_MACRO.encoding=THREE.LinearEncoding;
const GROUNDU={uNight:{value:0}};
// THE LIBRARY GROUND: eight layers, the later winning, each sampled twice (anti-tiling, as the other stations)
const GL_KEYS=['litter','sandblack','sinter','rim','mud','lichenrock','packed','sulphur','shingle','basalt'];
const GLAY=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return null;const o={};
 for(const k of GL_KEYS.concat(['wetmoss','canopy'])){const P=KMAT.packed('throne','ground.'+k);if(!P)return null;o[k]={map:KMAT.textures(P,{aniso:8}).map,k:1/P.scale[0]};}return o;})();
const GROUND_MATS=[];   /* the isle's mesh first, then the basin's patch: 89w wets the first where the swash reaches */
const GW={litter:'vL0.x',sandblack:'vL0.y',sinter:'vL0.z',rim:'vL0.w',mud:'vL1.x',lichenrock:'vL1.y',packed:'vL1.z',sulphur:'vL1.w',shingle:'vL2.x',basalt:'vL2.y'};   /* the weights, for KGROUND's hook (THRONE.kgGround, 70) */
function groundMat(map){let KGI=null;const m=new THREE.MeshStandardMaterial({roughness:.95,metalness:0,map,color:0xb0aaa4});GROUND_MATS.push(m);
 m.onBeforeCompile=sh=>{if(!GLAY)sh.uniforms.uDetail={value:TEX_DETAIL};
  if(GLAY){sh.uniforms.uMacro={value:TEX_MACRO};(KGI?['canopy']:GL_KEYS.concat(['wetmoss','canopy'])).forEach(k=>sh.uniforms['uG_'+k]={value:GLAY[k].map});}
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;attribute vec4 aL0,aL1,aL2;varying vec4 vL0,vL1,vL2;')
   .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vL0=aL0;vL1=aL1;vL2=aL2;');
  const W={litter:'vL0.x',sandblack:'vL0.y',sinter:'vL0.z',rim:'vL0.w',mud:'vL1.x',lichenrock:'vL1.y',packed:'vL1.z',sulphur:'vL1.w',shingle:'vL2.x',basalt:'vL2.y'};
  let decl=(GLAY?'':'uniform sampler2D uDetail;')+'varying vec3 vGWP;varying vec4 vL0,vL1,vL2;',body;
  if(GLAY&&KGI){decl+='uniform sampler2D uMacro,uG_canopy;';
  body='{vec3 dt=vec3(texture2D(uMacro,vGWP.xz*0.023+0.37).b);diffuseColor.rgb*=mix(vec3(1.0),dt*1.06,0.6);}\n/*KGROUND*/\n'+
   // far off, the forest floor reads as the canopy over it (the trees there are impostors, too small to cover it)
   '{vec3 L=pow(texture2D(uG_canopy,vGWP.xz*'+GLAY.canopy.k.toFixed(4)+').rgb,vec3(2.2));diffuseColor.rgb=mix(diffuseColor.rgb,diffuse*L*1.2,vL0.x*smoothstep(380.0,1100.0,length(cameraPosition-vGWP))*0.9);}';}
  else if(GLAY){decl+='uniform sampler2D uMacro,'+GL_KEYS.concat(['wetmoss','canopy']).map(k=>'uG_'+k).join(',')+';'+THRONE.layGLSL(USE_KG,'vec3 _lay(sampler2D t,vec2 p,vec2 q,float k,float mt){return pow(mix(texture2D(t,p*k).rgb,texture2D(t,q*k*0.47+vec2(0.31,0.17)).rgb,mt),vec3(2.2));}');
   // the sinter, the rims and the sulphur keep the paint's colour (the mats' bands, the white): their texture is detail
   const keep={sinter:1,rim:1,sulphur:1};
   body='{vec2 p=vGWP.xz,q=mat2(0.799,-0.602,0.602,0.799)*p;float mt=smoothstep(0.3,0.7,texture2D(uMacro,p*0.0061).r);'+
    'vec3 dt=vec3(texture2D(uMacro,p*0.023+0.37).b);diffuseColor.rgb*=mix(vec3(1.0),dt*1.06,0.6);vec3 L;vec3 P0=diffuseColor.rgb;'+
    GL_KEYS.map(k=>'L=_lay(uG_'+k+',p,q,'+GLAY[k].k.toFixed(4)+',mt);'+(k==='litter'?'L=mix(L,_lay(uG_wetmoss,p,q,'+GLAY.wetmoss.k.toFixed(4)+',mt),smoothstep(0.3,0.75,texture2D(uMacro,p*0.013+0.5).g)*0.75);':'')+(keep[k]?'diffuseColor.rgb=mix(diffuseColor.rgb,P0*L/max(vec3(0.12),vec3(dot(L,vec3(0.333))))*0.95,'+W[k]+');':'diffuseColor.rgb=mix(diffuseColor.rgb,diffuse*L*1.25,'+W[k]+');')).join('')+
    // far off, the forest floor reads as the canopy over it (the trees there are impostors, too small to cover it)
    'L=_lay(uG_canopy,p,q,'+GLAY.canopy.k.toFixed(4)+',mt);diffuseColor.rgb=mix(diffuseColor.rgb,diffuse*L*1.2,vL0.x*smoothstep(380.0,1100.0,length(cameraPosition-vGWP))*0.9);'+'}';}
  else body='{vec3 dt=texture2D(uDetail,vGWP.xz*0.17).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.023+0.37).rgb;diffuseColor.rgb*=dt*dt2*1.12;}';
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+decl).replace('#include <map_fragment>','#include <map_fragment>\n'+body+'\n/*KGROUND*/');};
 KGI=THRONE.kgGround(m,{key:'throne-isle',keys:GL_KEYS,W:GW,GLAY,gain:{sinter:2.0,rim:2.0,sulphur:2.0},tint:{sinter:'diffuseColor.rgb',rim:'diffuseColor.rgb',sulphur:'diffuseColor.rgb'},extra:GLAY?[{name:'wetmoss',map:GLAY.wetmoss.map,k:GLAY.wetmoss.k,w:'('+GW.litter+')*smoothstep(0.3,0.75,texture2D(uMacro,vGWP.xz*0.013+0.5).g)*0.75',tint:'diffuse',gain:1.25}]:[]});   /* after the page's own hook */
 return m;}
// a vertex's layer weights
function layersAt(x,z,h,at,L0,L1,k,L2){const ab=h-SEA,si=at('sinter'),dm=Math.hypot(x-MUD.x,z-MUD.z),dl=Math.hypot(x-LAGOON.x,z-LAGOON.z);
 // the springs' rims and the runoff only in and near the basin (the rest of the isle skips their maths)
 let rim=0;if(si>.01||basinE(x,z)<1.15){const M=matAt(x,z);for(const P of POOLS){const d=Math.hypot(x-P.x,z-P.z);rim=Math.max(rim,smooth(P.r*1.7,P.r*1.15,d)*smooth(P.r*.8,P.r*1.0,d));}
  rim=Math.max(rim,M.k*.7,smooth(28,10,segD(x,z,RUNOFF[0].pts))*si*.9);}
 L0[k*4]=Math.max(at('iwood'),at('grove')*.85)*.9;L0[k*4+1]=Math.max(at('sand'),at('beach')*.45,ab<0?smooth(0,-2,ab)*(1-smooth(LAGOON.r*1.2,LAGOON.r*.9,dl)):0)*.92;
 L0[k*4+2]=si*(1-rim*.8)*.85;L0[k*4+3]=rim*.85;
 L1[k*4]=Math.max(smooth(MUD.r*1.5,MUD.r*.8,dm),smooth(LAGOON.r*1.35,LAGOON.r*1.0,dl)*smooth(2.5,.5,ab))*.9;L1[k*4+1]=at('rock')*.85;
 L1[k*4+2]=Math.max(at('path'),at('camp')*.8);L1[k*4+3]=smooth(.4,.75,at('vent'))*si*.7;
 /* the library's shingle: the rounded gravel of the upper beach behind the sand and along the rocky shore, off the trail and the camp */
 L2[k*4]=(at('beach')*smooth(.3,.65,fbm(x*.02+1,z*.02-7,4801,2))*.8+at('rock')*smooth(7,1.5,ab)*smooth(-1,.5,ab)*.5)*(1-at('path'))*(1-at('camp'))*(1-si);}

// ---------------------------------------------------------------- the isle's mesh, with a hole for the basin's patch
const GN=600,GS=TERR.R*2.2,GCS=GS/GN,GNX=GN+1,GX0=-GS/2;
const PATCH=(function(){const rad=470,i0=Math.floor((BASIN.x-rad-GX0)/GCS),i1=Math.ceil((BASIN.x+rad-GX0)/GCS),j0=Math.floor((BASIN.z-rad-GX0)/GCS),j1=Math.ceil((BASIN.z+rad-GX0)/GCS);
 return{i0,i1,j0,j1,sub:5,x0:GX0+i0*GCS,z0:GX0+j0*GCS,sx:(i1-i0)*GCS,sz:(j1-j0)*GCS};})();
const GH=new Float32Array(GNX*GNX);
const TEX_GROUND=paintTex(1536,GX0,GX0,GS,atFC);
const GROUND=(function(){const pos=new Float32Array(GNX*GNX*3),uv=new Float32Array(GNX*GNX*2),L0=new Float32Array(GNX*GNX*4),L1=new Float32Array(GNX*GNX*4),L2=new Float32Array(GNX*GNX*4);
 const at=(n,x,z)=>FC.at(FC.a[n],x,z);
 for(let j=0;j<GNX;j++)for(let i=0;i<GNX;i++){const k=j*GNX+i,x=GX0+i*GCS,z=GX0+j*GCS,y=terrainH(x,z);GH[k]=y;pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;uv[k*2]=x/GS+.5;uv[k*2+1]=.5-z/GS;
  layersAt(x,z,y,n=>at(n,x,z),L0,L1,k,L2);}
 const idx=[];for(let j=0;j<GN;j++)for(let i=0;i<GN;i++){if(i>=PATCH.i0&&i<PATCH.i1&&j>=PATCH.j0&&j<PATCH.j1)continue;const a=j*GNX+i,b=a+GNX,c=b+1,d=a+1;idx.push(a,b,d,b,c,d);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 g.setAttribute('aL0',new THREE.BufferAttribute(L0,4));g.setAttribute('aL1',new THREE.BufferAttribute(L1,4));g.setAttribute('aL2',new THREE.BufferAttribute(L2,4));
 g.setIndex(idx);g.computeVertexNormals();
 /* THE FACES (2026-10-26): the rock field is read off the 11 m field cache, too coarse for the sea cliffs' ~10 m walls, which took the forest
    floor's paint; the mesh's own normals find them: where a vertex leans past ~50 degrees the library's flow-banded basalt (ground.basalt, L2.y) */
 {const N=g.attributes.normal.array;for(let k=0;k<GNX*GNX;k++){const st=1-N[k*3+1];if(st<.3)continue;L2[k*4+1]=smooth(.3,.55,st)*smooth(SEA-1,SEA+.5,GH[k])*.95;}}
 const m=THRONE.kgCavity(new THREE.Mesh(g,groundMat(TEX_GROUND)));m.userData.probeSkip=true;m.userData.inspectLabel='The geyser isle';scene.add(m);return m;})();
_mark('ground');
// THE BASIN'S PATCH: sub x sub vertices a coarse cell; its painted texture its own (0.9 m a pixel), the fields computed
// directly where they are fine-grained (the springs' rims, the mats), the cache elsewhere
const TEX_PATCH=paintTex(1024,PATCH.x0,PATCH.z0,PATCH.sx,atFC);
const GROUND_PATCH=(function(){const P=PATCH,nx=(P.i1-P.i0)*P.sub+1,nz=(P.j1-P.j0)*P.sub+1,cs=GCS/P.sub;
 const pos=new Float32Array(nx*nz*3),uv=new Float32Array(nx*nz*2),L0=new Float32Array(nx*nz*4),L1=new Float32Array(nx*nz*4),L2=new Float32Array(nx*nz*4);
 const at=(n,x,z)=>FC.at(FC.a[n],x,z);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=P.x0+i*cs,z=P.z0+j*cs;let y;
  // on the border: the coarse edge's own line between its two vertices (no crack)
  const bi=i===0||i===nx-1,bj=j===0||j===nz-1;
  if(bi||bj){const gi=P.i0+i/P.sub,gj=P.j0+j/P.sub,i0=Math.floor(gi),j0=Math.floor(gj),fi=gi-i0,fj=gj-j0;
   const H=(a,b)=>GH[Math.min(GN,b)*GNX+Math.min(GN,a)];y=bi&&bj?H(i0,j0):bi?mix(H(i0,j0),H(i0,j0+1),fj):mix(H(i0,j0),H(i0+1,j0),fi);}
  else y=terrainH(x,z);
  pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;uv[k*2]=(x-P.x0)/P.sx;uv[k*2+1]=1-(z-P.z0)/P.sz;layersAt(x,z,y,n=>at(n,x,z),L0,L1,k,L2);}
 const idx=new Uint32Array((nx-1)*(nz-1)*6);let t=0;
 for(let j=0;j<nz-1;j++)for(let i=0;i<nx-1;i++){const a=j*nx+i,b=a+nx,c=b+1,d=a+1;idx[t++]=a;idx[t++]=b;idx[t++]=d;idx[t++]=b;idx[t++]=c;idx[t++]=d;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 g.setAttribute('aL0',new THREE.BufferAttribute(L0,4));g.setAttribute('aL1',new THREE.BufferAttribute(L1,4));g.setAttribute('aL2',new THREE.BufferAttribute(L2,4));
 g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();const m=THRONE.kgCavity(new THREE.Mesh(g,groundMat(TEX_PATCH)));m.userData.probeSkip=true;m.userData.inspectLabel='The geyser basin';scene.add(m);return m;})();
_mark('patch');

// ---------------------------------------------------------------- THE SEA, THE FALL, THE STREAMS: on core/water (89w-host-water.js)
// 2026-10-26: the sea (two grids of the page's own shader over the shared wave field) is one WATER.open with a shore grid, the fall a
// WATER.fall, each stream a WATER.flow per run; drawn in 89w-host-water.js, after core/atmos is bound (89). FALL (the record) stays here:
// the steam (85) puts the fall's spray at its foot.
// ---------------------------------------------------------------- THE FALL: the cliff stream going over the edge
// Where the stream's bed drops away at the cliff (its lip), a curtain of water arcs out and falls to the sea, streaked and
// running on the clock; spray at its foot (85). The stream's ribbon stops at the lip
const FALL=(function(){const G=GULLIES.find(g=>g.cliff);if(!G)return null;const P=G.pts;
 for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],L=Math.hypot(b[0]-a[0],b[1]-a[1])||1,dx=(b[0]-a[0])/L,dz=(b[1]-a[1])/L;
  for(let s=0;s<L;s+=1){const x=a[0]+dx*s,z=a[1]+dz*s,h0=terrainH0(x,z),h1=terrainH0(x+dx*2.5,z+dz*2.5);
   if(h0-h1>3&&h0>SEA+6){const v=2.4,drop=h0+.3-SEA,reach=v*Math.sqrt(2*drop/9.8);return{x,z,y:h0+.3,dx,dz,drop,reach,w:G.w*.6,name:'The fall (the cliff stream into the sea)'};}}}
 return null;})();
if(FALL){
 REGISTER({name:FALL.name,x:FALL.x+FALL.dx*FALL.reach*.5,z:FALL.z+FALL.dz*FALL.reach*.5,y:SEA-2,r:FALL.reach+FALL.w,h:FALL.drop+4,fall:true});
}

// ---------------------------------------------------------------- the streams (on the gullies' beds; the creek warm)
GULLIES.forEach(G=>{const P=G.pts;
 REGISTER({name:G.name,x:P[Math.floor(P.length/2)][0],z:P[Math.floor(P.length/2)][1],y:terrainH(P[Math.floor(P.length/2)][0],P[Math.floor(P.length/2)][1])-6,r:Math.hypot(P[P.length-1][0]-P[0][0],P[P.length-1][1]-P[0][1])*.5,h:40,gully:G.key});});
_onLight.push(m=>{GROUNDU.uNight.value=m==='night'?1:0;});
