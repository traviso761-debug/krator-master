// ================================================================= WATER - ext: drawing the planned biomes' water (pans, ice, drifts, the blood fall's rust, weed)
// [draw] + [G shader]. Needs 20, 21, 22, 50 and 51 (WATER.drawFall), ext/54-core-water-kinds-ext.js, core/atmos bound with ATMOS.init, and
// three.js r128. Opt-in by path, as the terraces are. Nothing runs at load time. Each chunk's twin is in ext/54 (test-kinds-ext.js runs the text).
//
//   WATER.cellsGLSL   wtrXHash (W.hash2), wtrCells(p, cell, jit) -> (f1, f2, cell index) (twin W.cellsAt), wtrCrack(c, w) (twin W.crackOf)
//   WATER.panGLSL(P)  wtrPan(p, wet) -> (colour, film) (twin W.panAt)
//   WATER.drawPan(P, o)  the pan as a flat mesh `lift` m (.02) over its level: crust, cracks and brine by the weather's wetness (P.wetNow() each frame,
//        uniform wtrPanWet), glossy where wet. o: {lift, metalness, envMapIntensity, renderOrder, depthBias, pick}
//   WATER.iceGLSL(I, M)  wtrIce(p) -> colour (twin W.iceShade(I, M, x, z)), wtrIceRD(p) -> (rim, drift) from the bake M (I.bake(cell))
//   WATER.drawIce(I, o)  the ice as a flat mesh at its level (+ lift): black ice, white cracks, the salt rim, snow round the drifts; and the drifts
//        as their own mesh (W.driftMesh). o: {cell (the bake's, 2 m), res, lift, roughness [ice, snow], drifts (false: none), envMapIntensity, pick}
//   WATER.rustGLSL(B) the line a blood fall's curtain takes (twin B.colourAt(f)); WATER.drawBloodFall(B, o)  WATER.drawFall in the look's red with
//        that line added (fresh grey-green at the mouth, rusting down the curtain), the pool with drawStill. o: drawFall's options, pool (drawStill's)
//   WATER.drawWeed(list, o)  W.weed's records as one instanced mesh of blades streaming with the current, swaying on the module clock. o: {width,
//        segs, sway, lift, roughness}
(function(){const W=WATER;
 const glf=v=>{const q=String(+v);return/[.e]/.test(q)?q:q+'.0';},f=glf;
 const AT=()=>{try{return typeof ATMOS!=='undefined'?ATMOS:null;}catch(e){return null;}};
 const v3=c=>'vec3('+c.map(glf).join(',')+')';
 const sky=(mat,o)=>{const A=AT();if(o.envMapIntensity!=null)mat.envMapIntensity=o.envMapIntensity;
  A.hook(()=>{const E=A.skyEnv,tx=E&&E.target&&E.target.texture;if(tx&&mat.envMap!==tx){mat.envMap=tx;mat.needsUpdate=true;}});};
 const tag=(m,name,ids,o)=>{m.name='water:'+name;if(!o.pick)m.userData.probeSkip=true;m.userData.lodSkip=true;m.userData.water=ids;if(o.pick){m.userData.inspectLabel=name;}else m.raycast=()=>{};return m;};
 const flatMesh=(T,poly,y)=>{const M=W.stillMesh({poly,level:y}),g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(M.pos,3));
  g.setAttribute('normal',new T.Float32BufferAttribute(new Float32Array(M.pos.length).map((v,i)=>i%3===1?1:0),3));g.setIndex(M.idx);g.computeBoundingSphere();return g;};
 const VW='varying vec3 vWtrW;',VWV='#include <begin_vertex>\nvWtrW=(modelMatrix*vec4(position,1.0)).xyz;';

 // ---- the polygon cells
 W.cellsGLSL=['float wtrXHash(vec2 p){vec3 q=fract(vec3(p.xyx)*0.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}',
  'vec4 wtrCells(vec2 p,float cell,float jit){vec2 q=p/cell;vec2 i=floor(q);float f1=9.0;float f2=9.0;vec2 id=vec2(0.0);'+
   'for(int dy=-1;dy<=1;dy++){for(int dx=-1;dx<=1;dx++){vec2 c=i+vec2(float(dx),float(dy));vec2 o=c+vec2(0.5)+jit*(vec2(wtrXHash(c),wtrXHash(c+vec2(19.1,7.3)))-vec2(0.5));float d=length(q-o);'+
   'if(d<f1){f2=f1;f1=d;id=c;}else if(d<f2){f2=d;}}}return vec4(f1,f2,id.x,id.y);}',
  'float wtrCrack(vec4 c,float w){return 1.0-smoothstep(0.0,w,c.y-c.x);}'].join('\n');

 // ---- PAN
 W.panGLSL=P=>{const C=P.colours;
  return W.cellsGLSL+'\nvec4 wtrPan(vec2 p,float wet){vec4 C=wtrCells(p,'+f(P.cell)+','+f(P.jitter)+');float c=wtrCrack(C,'+f(P.crack)+');float low=wtrXHash(C.zw+vec2(3.1,11.7));float w=clamp(wet,0.0,1.0);'+
   'float film=max(c*smoothstep(0.0,0.3,w),smoothstep(low,low+0.12,w*'+f(P.flood)+'));float damp=smoothstep(0.0,0.5,w);'+
   'vec3 col=mix('+v3(W.rgbOf(C.salt))+','+v3(W.rgbOf(C.crack))+',c);col=mix(col,col*'+f(C.damp)+',damp);col=mix(col,'+v3(P.brineRGB)+',film*0.9);return vec4(col,film);}';};
 W.drawPan=(P,o)=>{o=o||{};const A=ATMOS,T=o.THREE||A.T,scene=o.scene||A.h.scene,lift=o.lift==null?.02:o.lift,g=flatMesh(T,P.poly,P.level+lift);
  const mat=new T.MeshStandardMaterial({color:0xffffff,roughness:P.roughness[0],metalness:o.metalness==null?0:o.metalness});sky(mat,o);W.biasMaterial(mat,o);
  const U={wtrPanWet:{value:P.wetNow()}};A.hook(()=>{U.wtrPanWet.value=P.wetNow();});
  const CH=W.panGLSL(P)+'\nuniform float wtrPanWet;'+VW;mat.customProgramCacheKey=()=>'wtr-pan:'+W.hashStr(CH);
  mat.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U);
   W.vs(sh,'wtr-drawPan',['#include <common>','#include <common>\n'+VW],['#include <begin_vertex>',VWV]);
   W.fs(sh,'wtr-drawPan',['#include <common>','#include <common>\n'+CH],['#include <color_fragment>','#include <color_fragment>\nvec4 wtrPn=wtrPan(vWtrW.xz,wtrPanWet);diffuseColor.rgb=wtrPn.rgb;'],['#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix('+f(P.roughness[0])+','+f(P.roughness[1])+',max(wtrPn.w,smoothstep(0.0,0.5,wtrPanWet)*0.3));']);};
  const mesh=tag(new T.Mesh(g,mat),P.name,P.id,o);if(o.renderOrder!=null)mesh.renderOrder=o.renderOrder;scene.add(mesh);
  const D={S:P,mesh,material:mat,uniforms:U};W.drawn.push(D);return D;};

 // ---- ICE
 W.iceGLSL=(I,M)=>{const C=I.colours,K=I.cracks;
  return W.cellsGLSL+'\nuniform sampler2D wtrIceMap;\nvec2 wtrIceRD(vec2 p){vec2 uv=(p-vec2('+f(M.x0)+','+f(M.z0)+'))*vec2('+f(1/(M.cell*M.nx))+','+f(1/(M.cell*M.nz))+');'+
   'if(uv.x<0.0||uv.y<0.0||uv.x>1.0||uv.y>1.0){return vec2(0.0);}vec4 t=texture2D(wtrIceMap,uv);return vec2(t.x,t.y);}\n'+
   'vec3 wtrIce(vec2 p){vec2 rd=wtrIceRD(p);float c=wtrCrack(wtrCells(p,'+f(K.cell)+','+f(K.jitter)+'),'+f(K.width)+');vec3 col=mix('+v3(W.rgbOf(C.ice))+','+v3(W.rgbOf(C.crack))+',c*0.8);'+
   (I.rim.salt?'col=mix(col,'+v3(W.rgbOf(C.salt))+',rd.x);':'')+'return mix(col,'+v3(W.rgbOf(C.snow))+',smoothstep(0.0,0.25,rd.y));}';};
 W.drawIce=(I,o)=>{o=o||{};const A=ATMOS,T=o.THREE||A.T,scene=o.scene||A.h.scene,lift=o.lift==null?W.ICE.lift:o.lift,rr=o.roughness||[.12,.9];
  const M=I.bake(o.cell),tex=new T.DataTexture(M.data,M.nx,M.nz,T.RGBAFormat,T.UnsignedByteType);tex.magFilter=tex.minFilter=T.LinearFilter;tex.wrapS=tex.wrapT=T.ClampToEdgeWrapping;tex.needsUpdate=true;
  const g=flatMesh(T,I.poly,I.level+lift),mat=new T.MeshStandardMaterial({color:0xffffff,roughness:rr[0],metalness:0});sky(mat,o);W.biasMaterial(mat,o);
  const U={wtrIceMap:{value:tex}},CH=W.iceGLSL(I,M)+'\n'+VW;mat.customProgramCacheKey=()=>'wtr-ice:'+W.hashStr(CH);
  mat.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U);
   W.vs(sh,'wtr-drawIce',['#include <common>','#include <common>\n'+VW],['#include <begin_vertex>',VWV]);
   W.fs(sh,'wtr-drawIce',['#include <common>','#include <common>\n'+CH],['#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb=wtrIce(vWtrW.xz);'],['#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix('+f(rr[0])+','+f(rr[1])+',smoothstep(0.0,0.25,wtrIceRD(vWtrW.xz).y));']);};
  const mesh=tag(new T.Mesh(g,mat),I.name,I.id,o);if(o.renderOrder!=null)mesh.renderOrder=o.renderOrder;scene.add(mesh);
  const D={S:I,mesh,material:mat,texture:tex,bake:M};
  if(o.drifts!==false&&I.drifts.length){const DM=W.driftMesh(I,{res:o.res,lift:lift*2}),dg=new T.BufferGeometry();dg.setAttribute('position',new T.Float32BufferAttribute(DM.pos,3));
   dg.setAttribute('normal',new T.Float32BufferAttribute(DM.nrm,3));dg.setIndex(DM.idx);dg.computeBoundingSphere();
   const dm=new T.MeshStandardMaterial({color:W.hexOf(W.rgbOf(I.colours.snow)),roughness:rr[1],metalness:0});W.biasMaterial(dm,o);
   D.drifts=tag(new T.Mesh(dg,dm),I.name+' drifts',I.id,o);scene.add(D.drifts);D.driftMesh=DM;}
  W.drawn.push(D);return D;};

 // ---- BLOOD: the rust down a curtain (vWtrUF.y is the fall fraction f)
 W.rustGLSL=B=>'diffuseColor.rgb=mix('+v3(W.rgbOf(W.LOOKS[B.look].fresh||'#8a958c'))+',diffuseColor.rgb,1.0-exp(-('+f(B.age0)+'+vWtrUF.y*'+f(B.fall.tFall)+')*'+f(1/B.tau)+'));';
 W.drawBloodFall=(B,o)=>{o=o||{};const L=W.LOOKS[B.look],D=W.drawFall(B.fall,W.lookDraw(L,'fall',Object.assign({color:W.lookHex(L,.8)},o))),mat=D.material,R=W.rustGLSL(B);
  W.KH().add(mat,'wtr-rust',sh=>{W.fs(sh,'wtr-drawBloodFall',['#include <color_fragment>','#include <color_fragment>\n'+R]);},{key:'rust:'+W.hashStr(R)});
  if(B.pool&&o.pool!==false)D.pool=W.drawStill(B.pool,Object.assign(W.lookDraw(L,'still'),o.pool||{}));
  D.B=B;return D;};

 // ---- WEED: blades along +x from the root (length 1), lying low and streaming downstream, swaying more toward the tip
 W.weedGLSL=sway=>{const per=W.period(),n=Math.max(1,Math.round(per/4.5));return'float wtrWeedSway(vec2 rt,float u){return '+f(sway)+'*u*u*sin(6.283185307*(atmWaveT*'+f(n/per)+')+rt.x*0.37+rt.y*0.23);}';};
 W.drawWeed=(list,o)=>{o=o||{};const A=ATMOS,T=o.THREE||A.T,scene=o.scene||A.h.scene,n=o.segs==null?5:o.segs,w=o.width==null?.09:o.width,sw=o.sway==null?.12:o.sway,lift=o.lift==null?0:o.lift;
  const pos=[],nrm=[],uv=[],idx=[];for(let i=0;i<=n;i++){const u=i/n,y=.18*u*(1-.5*u),hw=w*(1-.6*u);pos.push(u,y,-hw,u,y,hw);nrm.push(0,1,0,0,1,0);uv.push(u,0,u,1);if(i<n){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(nrm,3));
  g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeBoundingSphere();
  const mat=new T.MeshStandardMaterial({color:0xffffff,roughness:o.roughness==null?.55:o.roughness,metalness:0,side:T.DoubleSide});W.biasMaterial(mat,o);
  const CH='#include <atmos_waves>\n'+W.weedGLSL(sw);
  mat.customProgramCacheKey=()=>'wtr-weed:'+W.hashStr(CH);
  mat.onBeforeCompile=sh=>{A.waveUniforms(sh.uniforms);W.vs(sh,'wtr-drawWeed',['#include <common>','#include <common>\n'+CH],['#include <begin_vertex>','#include <begin_vertex>\n'+
   '#ifdef USE_INSTANCING\nvec2 wtrRt=vec2(instanceMatrix[3].x,instanceMatrix[3].z);\n#else\nvec2 wtrRt=vec2(0.0);\n#endif\n'+
   'transformed.z+=wtrWeedSway(wtrRt,position.x);']);};
  const mesh=new T.InstancedMesh(g,mat,list.length),M=mesh.instanceMatrix.array,colours=new Float32Array(list.length*3);
  list.forEach((r,i)=>{const c=Math.cos(r.yaw),s=Math.sin(r.yaw),k=i*16,L=r.len;
   // column-major: x along the yaw (scaled by the length), y up, z across; then the root's position
   M.set([c*L,0,s*L,0, 0,L,0,0, -s,0,c,0, r.x,r.y+lift,r.z,1],k);const q=W.rgbOf(r.c);colours.set(q,i*3);});
  mesh.instanceColor=new T.InstancedBufferAttribute(colours,3);mesh.instanceMatrix.needsUpdate=true;
  tag(mesh,o.name||'weed',null,o);scene.add(mesh);const D={mesh,material:mat,count:list.length};W.drawn.push(D);return D;};
})();
