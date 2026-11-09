// ================================================================= CORE — strata: varied contacts baked for the shaders  [G data]
// KSTRATA.vary (35c) is CPU-only: the strata shader (host/35-core-strata-shade.js, strata.gdshaderinc) draws the flat column,
// so a draped loess's soil bands on a gully wall did not follow the drape on the GPU (the W outer wall's and Mid Basin's
// plans). This bakes a varied stack's MOVED CONTACTS over a box into a small RGBA8 texture, writes the GLSL that reads it
// back (bilinear, by hand) and remaps the stratigraphic height as V.yy does, and keeps a JS twin that runs the same
// arithmetic on the same bytes, so the GPU's answer is checked without a GPU (test-strata-bake.js runs the GLSL text in
// core/water/glsl-interp.js). Plain maths: no THREE, no DOM, no Math.random, no sin or exp. Needs 35-core-strata.js and
// 35c-core-strata-vary.js loaded first; it changes nothing in either. node core/terrain/test-strata-bake.js.
//
//   const B = KSTRATA.varyBake(V, {box:[x0,z0,x1,z1], step (8), check (true)})     V a KSTRATA.vary stack
//     {format:'krator-strata-varybake', version, x0, z0, step, nx, nz, nk (contacts, n+1), flat:[the flat contacts],
//      ch:[channel of contact k, or -1: it never moves on the box], lo:[], sc:[] (a channel's offset is lo + u16*sc),
//      nc (channels), bands, W, H, data (Uint8Array W*H*4), q (the 16-bit step, m), err (measured: below)}; B.stack is
//      the flat stack (not enumerable: JSON leaves it out)
//   KSTRATA.varyContacts(B, x, z)    the n+1 moved contacts at (x, z), in stratigraphic height, from the bytes
//   KSTRATA.varyRemap(B, x, z, v)    v (S.yy at a point) remapped: the GLSL's ksVaryYY(xz, v)
//   KSTRATA.varyBakedYY(B, x, y, z)  varyRemap(B, x, z, S.yy(x, y, z)): V.yy from the texture
//   KSTRATA.varyGLSL(B)              GLSL text: `uniform sampler2D uKSVary;` and float ksVaryYY(vec2 xz, float v) (the
//                                    box, the decode constants and the flat contacts written in as literals); it reads
//                                    the texture through the strata shader's KSFETCH, so it goes after that shader's GLSL
//   KSTRATA.varyPatch(fragmentShader, B)   the strata shader's text with ksVaryYY inserted before strataColor and its yy
//                                    line rewritten (below); throws if the shared shader's anchor is not there exactly once
//   KSTRATA.varyKey(B)               a short hash of varyGLSL(B), for customProgramCacheKey
//
// THE BYTES. RGBA8, two contacts a texel at 16 bits each (r,g = channel 2b hi,lo; b,a = channel 2b+1), band b of the
// channels in rows b*nz .. b*nz+nz-1, column i = x0 + i*step. RGBA8 because the strata shader's every texture already is
// (KSTRATA.bake's, read by texelFetch in WebGL2 and at texel centres in WebGL1; Godot's Image.FORMAT_RGBA8), so it runs
// wherever the strata shader runs: a float texture would need OES_texture_float (and _linear to filter) on WebGL1, and a
// half float carries 11 bits, 10 cm on a 200 m offset. 16 bits give q = (that channel's offset range)/65535: 3 mm a 200 m
// range, far under the interpolation error. Only contacts that move on the box get a channel; the others are literals.
// The texture is read with NEAREST and decoded by hand, so filtering, sRGB and the driver's 8-bit lerp never enter.
//
// WHAT IS BAKED: each contact's moved height after V's own fix-up (where two cross the higher-numbered wins), at every node.
// Bilinear interpolation of monotone node columns is monotone, and the twin and the GLSL apply the fix-up again after the
// decode (the 16-bit rounding of two pinched contacts may cross by q), so the remap never sees crossed contacts.
//
// THE ERROR (V.yy minus the twin). Inside the box: e (a contact's error) times the local stretch r (a formation's flat
// thickness over its varied one; 1 where it is not thinned), plus float rounding. e is 0 + q/2 for `d`, `plane` and a `grid`
// on the bake's lattice (bilinear reproduces them), and the bilinear interpolation error for `noise` and `pts`, which
// shrinks as (step/wl)^2 and (step/r)^2. B.err is the largest e found at every cell's centre and two edge midpoints (a
// measured estimate, not a bound; null when check is false): pick `step` until it is under your tolerance. Where a
// formation pinches out, r grows without bound: the bed under a pinch-out's tip may differ by the tip's width (e/slope).
// Outside the box the contacts CLAMP to the nearest edge node (as a `grid` term does): a page bakes over the land it draws.
// The GPU reads in float32: about 2^-24 of yy's magnitude more (0.25 mm at 4 km).
//
// HOOKING IT IN (three.js; the shared shader is not edited). In the rock's onBeforeCompile, after the strata inject:
//     M.inject(sh); sh.fragmentShader = KSTRATA.varyPatch(sh.fragmentShader, B);
//     sh.uniforms.uKSVary = {value: tex};         tex = new THREE.DataTexture(B.data, B.W, B.H, THREE.RGBAFormat), NEAREST
//                                                 min and mag, no mipmaps, ClampToEdge, needsUpdate (as KSTRATA.shade's)
//     material.customProgramCacheKey = () => 'strata|' + KSTRATA.varyKey(B);
//   varyPatch rewrites the line `float yy=ksYY(wp,w1)+wsh,wy=wp.y+wsh,` to take yy through ksVaryYY and move the world height
//   the alterations read by the same shift (as V.surface does: S.surface at y + V's shift). The wash, the lateral side, the
//   repeat and every effect then read the varied yy. Build the shade from the FLAT stack (V.stack) and bake V over the box.
// GODOT (owed, not written): KStrataVary.bake in kstrata_vary.gd (the same bytes from its contact()), an ImageTexture of
// FORMAT_RGBA8 read by texelFetch, and ks_vary_yy(vec2 xz, float v) in strata.gdshaderinc called where ks_strata_color
// computes yy; the twin's arithmetic is the contract.
(function(root){
  'use strict';
  var KS=root.KSTRATA;
  if(!KS||!KS.create||!KS.vary)throw new Error('core/terrain 35d-core-strata-bake.js: load 35-core-strata.js and 35c-core-strata-vary.js first (KSTRATA.vary)');
  if(KS.varyBake)return;
  var ANCHOR='float yy=ksYY(wp,w1)+wsh,wy=wp.y+wsh,',HEAD='vec3 strataColor(vec3 wp,vec3 wn){';
  var REPL='float ksV0=ksYY(wp,w1),ksVd=ksVaryYY(wp.xz,ksV0)-ksV0;float yy=ksV0+ksVd+wsh,wy=wp.y+ksVd+wsh,';
  function clamp(v,a,b){return v<a?a:v>b?b:v;}
  /* a constant as the GLSL text writes it and the twin reads it: 12 significant digits, so both run on the same double */
  function r12(v){return Number(v.toPrecision(12));}
  function glf(v){if(!isFinite(v))throw new Error('KSTRATA.varyGLSL: a constant is not finite');var s=r12(v).toPrecision(12);
    if(s.indexOf('.')<0&&s.indexOf('e')<0)s+='.0';return v<0?'('+s+')':s;}
  function u16(B,c,i,j){var b=c>>1,h=c&1,t=((j+b*B.nz)*B.W+i)*4+2*h;return B.data[t]*256+B.data[t+1];}
  /* one channel's offset at (x, z): each corner decoded and scaled, then the vary grid's bilinear, in the GLSL's order */
  function chOff(B,c,i0,i1,j0,j1,tx,tz){var lo=B.lo[c],sc=B.sc[c];
    var a=lo+u16(B,c,i0,j0)*sc,b=lo+u16(B,c,i1,j0)*sc,d=lo+u16(B,c,i0,j1)*sc,e=lo+u16(B,c,i1,j1)*sc;
    return a+(b-a)*tx+(d-a)*tz+(a-b-d+e)*tx*tz;}
  function contacts(B,x,z,M){var nk=B.nk;M=M||new Array(nk);
    var fx=clamp((x-B.x0)/B.step,0,B.nx-1),fz=clamp((z-B.z0)/B.step,0,B.nz-1),i0=Math.floor(fx),j0=Math.floor(fz),
      i1=Math.min(i0+1,B.nx-1),j1=Math.min(j0+1,B.nz-1),tx=fx-i0,tz=fz-j0;
    for(var k=0;k<nk;k++)M[k]=B.ch[k]<0?B.flat[k]:B.flat[k]+chOff(B,B.ch[k],i0,i1,j0,j1,tx,tz);
    for(var j=nk-1;j>0;j--)if(M[j-1]>M[j])M[j-1]=M[j];
    return M;}
  function remap(B,x,z,v){if(B.nc===0)return v;var M=contacts(B,x,z),n=B.nk-1,F=B.flat;
    if(v<M[0])return v+(F[0]-M[0]);if(v>=M[n])return v+(F[n]-M[n]);
    var a=M[0],b=M[1],fa=F[0],fb=F[1];
    for(var k=1;k<n;k++)if(M[k]<=v){a=M[k];b=M[k+1];fa=F[k];fb=F[k+1];}
    var sp=b-a;return sp>0?fa+(v-a)*(fb-fa)/sp:fa;}

  function bake(V,o){o=o||{};if(!V||!V.varied||!V.stack||!V.contact)throw new Error('KSTRATA.varyBake: a KSTRATA.vary stack is needed');
    var box=o.box,st=o.step==null?8:o.step;
    if(!box||box.length!==4||!(box[2]>=box[0])||!(box[3]>=box[1])||!(st>0))throw new Error('KSTRATA.varyBake: box [x0,z0,x1,z1] and a step over 0 are needed');
    var S=V.stack,fs=V.formations,n=fs.length,nk=n+1,flat=[],k,i,j;
    for(k=0;k<n;k++)flat.push(r12(fs[k].base));flat.push(r12(fs[n-1].top));
    var nx=Math.max(1,Math.floor((box[2]-box[0])/st)+1),nz=Math.max(1,Math.floor((box[3]-box[1])/st)+1),N=nx*nz;
    if(nx>8192||nz>8192)throw new Error('KSTRATA.varyBake: '+nx+' x '+nz+' nodes: over a texture\'s 8192 (a coarser step, or a smaller box)');
    var off=new Float64Array(N*nk),named={};
    (V.contacts||[]).forEach(function(c){named[c.at]=1;});
    for(j=0;j<nz;j++)for(i=0;i<nx;i++){var x=box[0]+i*st,z=box[1]+j*st,w=S.yy(x,0,z),p=(j*nx+i)*nk;
      for(k=0;k<nk;k++)off[p+k]=V.contact(x,z,k)+w-flat[k];}
    var ch=[],lo=[],sc=[],nc=0,q=0;
    for(k=0;k<nk;k++){var mn=Infinity,mx=-Infinity;for(i=0;i<N;i++){var v=off[i*nk+k];if(v<mn)mn=v;if(v>mx)mx=v;}
      if(!named[k]&&mn===0&&mx===0){ch.push(-1);continue;}
      ch.push(nc++);lo.push(r12(mn));var s=mx>mn?r12((mx-mn)/65535):0;sc.push(s);if(s>q)q=s;}
    var bands=Math.ceil(nc/2),W=nx,H=Math.max(1,nz*bands),data=new Uint8Array(W*H*4);
    for(k=0;k<nk;k++){var c=ch[k];if(c<0)continue;var b=c>>1,h=c&1;
      for(j=0;j<nz;j++)for(i=0;i<nx;i++){var u=sc[c]>0?Math.round((off[(j*nx+i)*nk+k]-lo[c])/sc[c]):0;u=u<0?0:u>65535?65535:u;
        var t=((j+b*nz)*W+i)*4+2*h;data[t]=u>>8;data[t+1]=u&255;}}
    var B={format:'krator-strata-varybake',version:1,x0:r12(box[0]),z0:r12(box[1]),step:r12(st),nx:nx,nz:nz,nk:nk,flat:flat,ch:ch,lo:lo,sc:sc,nc:nc,
      bands:bands,W:W,H:H,data:data,q:q,err:null};
    Object.defineProperty(B,'stack',{value:S,enumerable:false});
    if(o.check!==false){var e=0,M=new Array(nk),pts=[[.5,.5],[.5,0],[0,.5]];
      for(j=0;j<nz;j++)for(i=0;i<nx;i++)for(var a=0;a<3;a++){var fi=i+pts[a][0],fj=j+pts[a][1];if(fi>nx-1||fj>nz-1)continue;
        var xx=box[0]+fi*st,zz=box[1]+fj*st,ww=S.yy(xx,0,zz);contacts(B,xx,zz,M);
        for(k=0;k<nk;k++){var d=Math.abs(M[k]-(V.contact(xx,zz,k)+ww));if(d>e)e=d;}}
      B.err=e;}
    return B;}

  function glsl(B){var n=B.nk-1,L=['uniform sampler2D uKSVary;'];
    if(B.nc===0){L.push('float ksVaryYY(vec2 xz,float v){return v;}');return L.join('\n');}
    var W=glf(B.W),H=glf(B.H),k;
    /* KSFETCH is the strata shader's (texelFetch in WebGL2, the texel's centre in WebGL1): varyPatch puts this after it */
    L.push('float ksVU(float i,float j,float h){vec4 t=floor(KSFETCH(uKSVary,i,j,'+W+','+H+')*255.0+0.5);return h<0.5?t.x*256.0+t.y:t.z*256.0+t.w;}');
    L.push('float ksVOff(float c,float lo,float sc,float i0,float i1,float j0,float j1,float tx,float tz){float b=floor(c*0.5),h=c-2.0*b,jo=b*'+glf(B.nz)+';',
      ' float a=lo+ksVU(i0,j0+jo,h)*sc,bb=lo+ksVU(i1,j0+jo,h)*sc,d=lo+ksVU(i0,j1+jo,h)*sc,e=lo+ksVU(i1,j1+jo,h)*sc;',
      ' return a+(bb-a)*tx+(d-a)*tz+(a-bb-d+e)*tx*tz;}');
    L.push('float ksVaryYY(vec2 xz,float v){',
      ' float fx=clamp((xz.x-'+glf(B.x0)+')/'+glf(B.step)+',0.0,'+glf(B.nx-1)+'),fz=clamp((xz.y-'+glf(B.z0)+')/'+glf(B.step)+',0.0,'+glf(B.nz-1)+');',
      ' float i0=floor(fx),j0=floor(fz),i1=min(i0+1.0,'+glf(B.nx-1)+'),j1=min(j0+1.0,'+glf(B.nz-1)+'),tx=fx-i0,tz=fz-j0;');
    for(k=0;k<=n;k++)L.push(' float m'+k+'='+glf(B.flat[k])+(B.ch[k]<0?'':'+ksVOff('+glf(B.ch[k])+','+glf(B.lo[B.ch[k]])+','+glf(B.sc[B.ch[k]])+',i0,i1,j0,j1,tx,tz)')+';');
    for(k=n;k>0;k--)L.push(' if(m'+(k-1)+'>m'+k+')m'+(k-1)+'=m'+k+';');
    L.push(' if(v<m0)return v+('+glf(B.flat[0])+'-m0);',' if(v>=m'+n+')return v+('+glf(B.flat[n])+'-m'+n+');',
      ' float a=m0,b=m1,fa='+glf(B.flat[0])+',fb='+glf(B.flat[1])+';');
    for(k=1;k<n;k++)L.push(' if(m'+k+'<=v){a=m'+k+';b=m'+(k+1)+';fa='+glf(B.flat[k])+';fb='+glf(B.flat[k+1])+';}');
    L.push(' float sp=b-a;return sp>0.0?fa+(v-a)*(fb-fa)/sp:fa;}');
    return L.join('\n');}
  function patch(src,B){var a=src.split(ANCHOR).length-1,h=src.split(HEAD).length-1;
    if(a!==1||h!==1)throw new Error('KSTRATA.varyPatch: the strata shader\'s yy line or strataColor head is not there exactly once ('+a+', '+h+'): inject KSTRATA.shade\'s GLSL first');
    return src.replace(HEAD,glsl(B)+'\n'+HEAD).replace(ANCHOR,REPL);}
  function key(B){var s=glsl(B),h=0x811c9dc5;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}return ('0000000'+h.toString(16)).slice(-8);}

  KS.varyBake=bake;KS.varyContacts=function(B,x,z){return contacts(B,x,z);};KS.varyRemap=remap;
  KS.varyBakedYY=function(B,x,y,z){if(!B.stack)throw new Error('KSTRATA.varyBakedYY: B has no stack (bake it here, or use varyRemap with S.yy)');return remap(B,x,z,B.stack.yy(x,y,z));};
  KS.varyGLSL=glsl;KS.varyPatch=patch;KS.varyKey=key;KS.VARY_ANCHOR=ANCHOR;
})(typeof window!=='undefined'?window:globalThis);
