// ================================================================= CORE — the ground shader (KGROUND: height-blended layers, hex tiling, distance scale)
// DETAIL-RESEARCH.md item 1 (2026-10-26, the final rebuild's R4). Every biome draws its ground with its own host shader
// (biomes/*/src/45-host-stage.js, 47-host-land.js, 84-host-ground.js): a painted macro map, a detail multiply, and the
// material library's layers mixed in by zone weights, each page with its own anti-tiling trick. This module is the
// layers' part of that, one copy: a page keeps its paint, its zone weights (its attributes and varyings) and its own
// terms (strata, granite bands, cracks), and hands KGROUND the layers. Each layer is
//   - sampled with Mikkelsen's hex tiling (JCGT 11(3) 2022, "Practical Real-Time Hex-Tiling"): three offset and turned
//     copies on a triangle grid, blended by the barycentrics sharpened by each sample's luminance, so no repeat shows;
//   - scaled with distance: past o.far.d (60 m) its tile doubles at each doubling of the distance, two scales
//     cross-faded, so far ground keeps a grain and shows no grid (up to o.far.levels doublings);
//   - blended by HEIGHT: each layer's own height (its luminance about its mean, or its alpha) against the height of what
//     is under it, "the highest wins, blend near ties" (a height lerp of contrast o.blend), so pebbles and tufts stand
//     through moss at an edge instead of a smear. o.blend 0 is the plain mix the pages had.
// The library's sets come through KMAT (KGROUND.layer(build, slot): the page's materials.json slot, packed by
// tools/textures/pack.py); a page without its pack gets no layer, and its ground is its paint alone, as before.
//
//   KGROUND.layer(build, slot, o)  {map, k (1 / the slot's scale), ...o} from the page's pack, or null
//   KGROUND.hook(mat, o)  a KHOOK layer 'kground' (core/shader: after the page's hook) that adds the layers where the page's fragment
//        shader has the marker o.at ('/*KGROUND*/'; without it, just after #include <map_fragment>). o:
//        layers [{map, k, w (a GLSL float: the layer's weight, 0..1, from the page's varyings), amt (1: its most),
//                 gain (1), tint (a GLSL vec3: 'diffuse' is the material colour; default vec3(1.0)), lin (true: the map
//                 is sRGB, decoded by pow 2.2 as the pages do for a custom sampler), h ({from: 'lum'|'a', contrast 1.6}),
//                 name}]; null entries are skipped
//        blend (.18), hex ({rot: .6, contrast: .6, exp: 7} or false), far ({d: 60, levels: 3} or false),
//        baseH (a GLSL float: the height of the paint under the first layer, '0.5'), key (the program key's part)
//        -> mat. mat.userData.kground holds the layers drawn (their names) for the inspector and the export
//   KGROUND.glsl(o)  the GLSL library alone (kgSample, kgHL, ...), for a page that writes its own blend
//   KGROUND.fn       the JS twins of the GLSL (tri, hash, heightLerp, lod; the kinds' hash3, vor2, vor3, vnoise, ripple),
//        for tests and for Godot's port
// Layer kinds (opt-in, 2026-10-26, for the planned biomes; a layer without `kind` is drawn exactly as before): a layer
// {kind, w, amt, ...} whose map is optional, drawn where its weight is above 0 and blended by height as any layer.
//   'clast'    blocks in a matrix by world position (the Godthrone's megabreccia crest, the W outer wall's slump scarps;
//              small and packed, desert pavement): size (12 m), proj ('tri': 3D cells, no stretch on a scarp; 'xz'), jitter,
//              matrix (.06, the matrix's half width in cell units), matrixColor, palette (sRGB; KGROUND.BRECCIA without a
//              map) or colorFn (a GLSL vec3 f(vec3 centre, float hash) of the page's: the strata band at the block's centre),
//              vary, sub (.18: a finer generation of clasts in the matrix; 0 none), fleck (.04 m glass flecks in the matrix;
//              0 none), fleckDensity, glass ([black, bottle green]); a map is the blocks' grain, turned per block
//   'sand'     a sand with wind ripples and glints (Godstep's black sand, the Godthrone's bead sand): map or color, ripple
//              (.12 m wavelength; 0 none), wind ([x, z]), stoss (.8), steep (1/15), meander, warp, crest, shade, sun (a GLSL
//              vec3; the page's sun uniform if it has one), glint (.03 m grain cells; 0 none), glintDensity, sparkle, sharp,
//              spread, glintColor
//   'polygon'  cells on the plane with troughs on their edges (sand-wedge and ice-wedge polygons, patterned ground, pressure
//              plates): size (15 m), width (.04, cell units), jitter, vary, edgeTint (a GLSL vec3 on the ground below) or a
//              map (the troughs' fill), warp (.12, cell units: the cracks wander), rim (0: a band of sorted stones beside the
//              trough), rimTint
// Every kind takes seed (a number below 997: the page's KRAND.hash of its world and a salt) so two layers differ.
// Relief and triplanar sides (opt-in, 2026-11-03: the ground diagnosis, core/terrain/GROUND.md; without them the shader is unchanged):
//   o.relief  {bump (.05: metres of relief per unit of the layers' blended height), near/far (25/140 m: faded out), cavity (.55: the
//             sky light lost in the low of the height), direct (.35: the share of that on the sun), mesh (0: the strength of the mesh's
//             own cavities, attribute aKGAO from KGROUND.cavityMesh), strata (0: metres of bed relief, hard beds proud, on the core
//             strata path only), strataW (a GLSL float: where the beds show), strataNear/strataFar (120/300 m; skipped past it), h (a GLSL float added
//             to the height), lambert (1: on a Lambert material, the sun scaled by the bumped facing)}. No texture unit.
//   o.tri     {from .35, to .7, far 250}: on the steep (1 - |n.y|) and nearer than far m, each layer is sampled from the side as well, two
//             planes blended by facing
//   KGROUND.cavity({pos, index, normal, count}, o) / KGROUND.cavityMesh(mesh, o)   the mesh's hollows per vertex, 0..1 ([G data])
//   ?kgrelief=1 [&kgtri=1]   the before-and-after switch on any page, for judging (the page's own options win); ?kgrelief=2 doubles it
//
// Godot: ground.gdshader with the same layers as uniforms and the same functions (the godotshaders hex-tiling port, MIT,
// is the same algorithm); core/terrain/README.md, "Godot".
(function(root){
  // ---------------------------------------------------------------- the JS twins (the GLSL below says the same)
  function fract(v){return v-Math.floor(v);}
  // a hash without sine (Hoskins' hash22): the hex cell's offset
  function hash(px,py){var x=fract(px*.1031),y=fract(py*.1030),z=fract(px*.0973),d=x*(y+33.33)+y*(z+33.33)+z*(x+33.33);x+=d;y+=d;z+=d;return [fract((x+y)*z),fract((x+z)*y)];}
  // the triangle grid: barycentric weights and the three vertices (integer lattice) round st
  function tri(sx,sy){sx*=3.4641016;sy*=3.4641016;var kx=sx-.57735027*sy,ky=1.15470054*sy,bx=Math.floor(kx),by=Math.floor(ky),tx=kx-bx,ty=ky-by,tz=1-tx-ty,s=tz<0?1:0,s2=2*s-1;
    return {w:[-tz*s2,s-ty*s2,s-tx*s2],v:[[bx+s,by+s],[bx+s,by+1-s],[bx+1-s,by+s]]};}
  // the height lerp: t toward the layer, h1 the height under it, h2 the layer's, c the contrast (0: a plain mix)
  function heightLerp(t,h1,h2,c){if(t<=0)return 0;if(c<=0)return t;var a=h1*(1-t),b=h2*t,m=Math.max(a,b)-c;a=Math.max(a-m,0);b=Math.max(b-m,0);return b/Math.max(a+b,1e-5);}
  // the distance scale: the level (continuous) at a distance; tile size 2^floor, cross-faded by the fraction
  function lod(d,d0,levels){if(!(d0>0))return 0;return Math.min(levels,Math.max(0,Math.log2(Math.max(d/d0,1))));}
  // the kinds' twins (the layer kinds 'clast', 'sand', 'polygon'; their GLSL is kindsGlsl below)
  // Hoskins' hash33: three numbers in [0,1) from a point (a cell's integer corner and the layer's seed), no sine
  function hash3(px,py,pz){var x=fract(px*.1031),y=fract(py*.1030),z=fract(pz*.0973),d=x*(y+33.33)+y*(x+33.33)+z*(z+33.33);x+=d;y+=d;z+=d;
    return [fract((x+y)*z),fract((x+x)*y),fract((y+x)*x)];}
  // Voronoi in 2D and 3D: f1 the distance to the nearest point, e the distance to the bisector with the second nearest
  // (the edge: 0 on it), id the nearest point's cell, rel the nearest point less p; points at .5 + jit*(hash - .5) in each cell
  function vor2(px,py,jit,sd){var nx=Math.floor(px),ny=Math.floor(py),fx=px-nx,fy=py-ny,d1=8,d2=8,r1=[0,0],r2=[1,0],id=[nx,ny];
    for(var j=-1;j<=1;j++)for(var i=-1;i<=1;i++){var h=hash3(nx+i,ny+j,sd),rx=i+.5+jit*(h[0]-.5)-fx,ry=j+.5+jit*(h[1]-.5)-fy,d=rx*rx+ry*ry;
      if(d<d1){d2=d1;r2=r1;d1=d;r1=[rx,ry];id=[nx+i,ny+j];}else if(d<d2){d2=d;r2=[rx,ry];}}
    var ux=r2[0]-r1[0],uy=r2[1]-r1[1],ul=Math.hypot(ux,uy)||1e-6;return {f1:Math.sqrt(d1),e:(.5*(r1[0]+r2[0])*ux+.5*(r1[1]+r2[1])*uy)/ul,id:id,rel:r1};}
  function vor3(px,py,pz,jit,sd){var nx=Math.floor(px),ny=Math.floor(py),nz=Math.floor(pz),fx=px-nx,fy=py-ny,fz=pz-nz,d1=8,d2=8,r1=[0,0,0],r2=[1,0,0],id=[nx,ny,nz];
    for(var k=-1;k<=1;k++)for(var j=-1;j<=1;j++)for(var i=-1;i<=1;i++){var h=hash3(nx+i+sd,ny+j+sd*1.7,nz+k+sd*2.3),rx=i+.5+jit*(h[0]-.5)-fx,ry=j+.5+jit*(h[1]-.5)-fy,rz=k+.5+jit*(h[2]-.5)-fz,d=rx*rx+ry*ry+rz*rz;
      if(d<d1){d2=d1;r2=r1;d1=d;r1=[rx,ry,rz];id=[nx+i,ny+j,nz+k];}else if(d<d2){d2=d;r2=[rx,ry,rz];}}
    var ux=r2[0]-r1[0],uy=r2[1]-r1[1],uz=r2[2]-r1[2],ul=Math.hypot(ux,uy,uz)||1e-6;
    return {f1:Math.sqrt(d1),e:(.5*(r1[0]+r2[0])*ux+.5*(r1[1]+r2[1])*uy+.5*(r1[2]+r2[2])*uz)/ul,id:id,rel:r1};}
  // value noise on the plane (the ripples' meander), 0..1
  function vnoise(px,py,sd){var ix=Math.floor(px),iy=Math.floor(py),fx=px-ix,fy=py-iy,ux=fx*fx*(3-2*fx),uy=fy*fy*(3-2*fy),
    a=hash3(ix,iy,sd)[0],b=hash3(ix+1,iy,sd)[0],c=hash3(ix,iy+1,sd)[0],d=hash3(ix+1,iy+1,sd)[0];return a+(b-a)*ux+(c-a)*uy+(a-b-c+d)*ux*uy;}
  // a wind ripple's profile: u the phase across the crests (downwind), a the stoss share of a wavelength; 0 trough, 1 crest
  function ripple(u,a){var f=u-Math.floor(u);return f<a?f/a:(1-f)/(1-a);}

  // ---------------------------------------------------------------- the GLSL library
  function glsl(o){o=o||{};var hx=o.hex===false?null:(o.hex||{}),rot=hx?(hx.rot==null?.6:hx.rot):0,con=hx?(hx.contrast==null?.6:hx.contrast):0,ex=hx?(hx.exp==null?7:hx.exp):1;
    var f=function(v){return (+v).toFixed(4);};
    return ['#if __VERSION__ >= 300',
      '#define KG_GRAD(t,p,dx,dy) textureGrad(t,p,dx,dy)','#define KG_LOD(t,p,l) textureLod(t,p,l)',
      '#else','#define KG_GRAD(t,p,dx,dy) texture2D(t,p)','#define KG_LOD(t,p,l) vec4(0.5)','#endif',
      'vec2 kgHash(vec2 p){vec3 p3=fract(vec3(p.xyx)*vec3(0.1031,0.1030,0.0973));p3+=dot(p3,p3.yzx+33.33);return fract((p3.xx+p3.yz)*p3.zy);}',
      'void kgTri(vec2 st,out vec3 w,out vec2 v1,out vec2 v2,out vec2 v3){st*=3.4641016;vec2 sk=vec2(st.x-0.57735027*st.y,1.15470054*st.y);',
      ' vec2 b=floor(sk);vec3 t=vec3(fract(sk),0.0);t.z=1.0-t.x-t.y;float s=step(0.0,-t.z),s2=2.0*s-1.0;',
      ' w=vec3(-t.z*s2,s-t.y*s2,s-t.x*s2);v1=b+vec2(s,s);v2=b+vec2(s,1.0-s);v3=b+vec2(1.0-s,s);}',
      /* the turn of a hex cell, from its integer vertex (no sine hash): Mikkelsen's LoadRot2x2 */
      'mat2 kgRot(vec2 v){float a=abs(v.x*v.y)+abs(v.x+v.y)+3.14159265;a=mod(a,6.2831853);if(a>3.14159265)a-=6.2831853;a*='+f(rot)+';float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}',
      'vec2 kgCen(vec2 v){return vec2(v.x+0.5*v.y,v.y*0.8660254)/3.4641016;}',
      'vec4 kgHex(sampler2D t,vec2 st,vec2 dx,vec2 dy){'+(hx?
        'vec3 w;vec2 v1,v2,v3;kgTri(st,w,v1,v2,v3);mat2 r1=kgRot(v1),r2=kgRot(v2),r3=kgRot(v3);vec2 c1=kgCen(v1),c2=kgCen(v2),c3=kgCen(v3);'+
        'vec4 a=KG_GRAD(t,r1*(st-c1)+c1+kgHash(v1),r1*dx,r1*dy),b=KG_GRAD(t,r2*(st-c2)+c2+kgHash(v2),r2*dx,r2*dy),c=KG_GRAD(t,r3*(st-c3)+c3+kgHash(v3),r3*dx,r3*dy);'+
        'vec3 L=vec3(0.299,0.587,0.114),D=mix(vec3(1.0),vec3(dot(a.rgb,L),dot(b.rgb,L),dot(c.rgb,L)),'+f(con)+');vec3 W=D*pow(max(w,vec3(0.0)),vec3('+f(ex)+'));W/=max(W.x+W.y+W.z,1e-5);'+
        'return W.x*a+W.y*b+W.z*c;}':'return KG_GRAD(t,st,dx,dy);}'),
      /* the distance scale: lv the continuous level (KGROUND.fn.lod); two scales cross-faded */
      'vec4 kgSample(sampler2D t,vec2 st,vec2 dx,vec2 dy,float lv){float l0=floor(lv),fr=lv-l0,s0=exp2(-l0);vec4 c=kgHex(t,st*s0,dx*s0,dy*s0);',
      ' if(fr>0.002){float s1=s0*0.5;c=mix(c,kgHex(t,st*s1,dx*s1,dy*s1),smoothstep(0.0,1.0,fr));}return c;}',
      'float kgHL(float t,float h1,float h2,float c){if(t<=0.0)return 0.0;if(c<=0.0)return t;float a=h1*(1.0-t),b=h2*t,m=max(a,b)-c;a=max(a-m,0.0);b=max(b-m,0.0);return b/max(a+b,1e-5);}',
      'float kgLum(vec3 c){return dot(c,vec3(0.299,0.587,0.114));}'].join('\n')+'\n';}
  // the kinds' GLSL (KGROUND.fn's hash3, vor2, vor3, vnoise, ripple), added only when a layer has a kind
  function kindsGlsl(){return ['vec3 kgHash3(vec3 p){p=fract(p*vec3(0.1031,0.1030,0.0973));p+=dot(p,p.yxz+33.33);return fract((p.xxy+p.yxx)*p.zyx);}',
    'vec2 kgVor2(vec2 x,float jit,float sd,out vec2 cid,out vec2 rel){vec2 n=floor(x),f=x-n,r1=vec2(0.0),r2=vec2(1.0,0.0);float d1=8.0,d2=8.0;cid=n;',
    ' for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 g=vec2(float(i),float(j));vec2 r=g+0.5+jit*(kgHash3(vec3(n+g,sd)).xy-0.5)-f;float d=dot(r,r);',
    '  if(d<d1){d2=d1;r2=r1;d1=d;r1=r;cid=n+g;}else if(d<d2){d2=d;r2=r;}}',
    ' rel=r1;vec2 u=r2-r1;return vec2(sqrt(d1),dot(0.5*(r1+r2),u)/max(length(u),1e-6));}',
    'vec2 kgVor3(vec3 x,float jit,float sd,out vec3 cid,out vec3 rel){vec3 n=floor(x),f=x-n,r1=vec3(0.0),r2=vec3(1.0,0.0,0.0),s=sd*vec3(1.0,1.7,2.3);float d1=8.0,d2=8.0;cid=n;',
    ' for(int k=-1;k<=1;k++)for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec3 g=vec3(float(i),float(j),float(k));vec3 r=g+0.5+jit*(kgHash3(n+g+s)-0.5)-f;float d=dot(r,r);',
    '  if(d<d1){d2=d1;r2=r1;d1=d;r1=r;cid=n+g;}else if(d<d2){d2=d;r2=r;}}',
    ' rel=r1;vec3 u=r2-r1;return vec2(sqrt(d1),dot(0.5*(r1+r2),u)/max(length(u),1e-6));}',
    'float kgVN(vec2 p,float sd){vec2 i=floor(p),f=p-i,u=f*f*(3.0-2.0*f);float a=kgHash3(vec3(i,sd)).x,b=kgHash3(vec3(i+vec2(1.0,0.0),sd)).x,c=kgHash3(vec3(i+vec2(0.0,1.0),sd)).x,d=kgHash3(vec3(i+1.0,sd)).x;',
    ' return a+(b-a)*u.x+(c-a)*u.y+(a-b-c+d)*u.x*u.y;}',
    'float kgRipple(float u,float a){float f=fract(u);return f<a?f/a:(1.0-f)/(1.0-a);}'].join('\n')+'\n';}
  // a colour for the shader: 0xrrggbb, '#rrggbb' or [r,g,b] in 0..1, all sRGB; out linear, as GLSL
  function lin3(c){if(typeof c==='string')c=parseInt(c.replace('#',''),16);if(typeof c==='number')c=[(c>>16&255)/255,(c>>8&255)/255,(c&255)/255];
    return 'vec3('+c.map(function(v){return Math.pow(Math.max(0,+v),2.2).toFixed(4);}).join(',')+')';}
  // the megabreccia's blocks (biomes/godthrone/PLAN.md section 3): basalt grey and black, buff and red sandstone, pale granite,
  // green-grey schist, ochre, dark mudstone
  var BRECCIA=[0x4a4a4c,0x232325,0x9e8b70,0x7a4e40,0x8e8b85,0x5a6258,0x86714f,0x4b3d33];
  // a palette as an if-chain on t in [0,1)
  function palGlsl(pal,t){var n=pal.length,s='';pal.forEach(function(c,i){s+=(i<n-1?t+'<'+((i+1)/n).toFixed(4)+'?':'')+lin3(c)+(i<n-1?':':'');});return '('+s+')';}

  // ---------------------------------------------------------------- the layer kinds (opt-in: a layer with `kind`)
  // Each sets kgC (its colour) and kgH (its height for the blend) where its weight is above 0, then blends as a plain layer.
  // A kind's map is optional (a procedural layer has none); L.tint and L.gain scale the layer's own colour.
  var KINDS={clast:1,sand:1,polygon:1};
  function kindBody(L,i,f){var k=f(L.k==null?1:L.k),sd=f(((+(L.seed==null?0:L.seed))%997+997)%997),T='*('+(L.tint||'vec3(1.0)')+')*'+f(L.gain==null?1:L.gain),
      dec=function(x){return L.lin===false?x:'pow('+x+',vec3(2.2))';},
      mean=dec('KG_LOD(uKG'+i+',vec2(0.5),16.0).rgb'),s=[];
    if(L.kind==='clast'){
      // blocks of every rock in a matrix (megabreccia; small and packed, a desert pavement): Voronoi cells by world position,
      // in 3D (o.proj 'tri', the default: no stretch on a scarp) or on the plane ('xz', cheaper); a colour per block from the
      // palette or the page's GLSL function colorFn(vec3 blockCentre, float hash); a second, finer generation of clasts
      // in the matrix (sub); glass flecks in what matrix is left (fleck)
      var size=L.size==null?12:L.size,jit=f(L.jitter==null?.9:L.jitter),mw=f(L.matrix==null?.06:L.matrix),sub=L.sub==null?.18:L.sub,
        fl=L.fleck==null?.04:L.fleck,fd=f(L.fleckDensity==null?.3:L.fleckDensity),vary=f(L.vary==null?.15:L.vary),xz=L.proj==='xz',
        pal=L.palette||(L.map?null:BRECCIA),glass=L.glass||[0x0a0a0c,0x123a24],mc=lin3(L.matrixColor==null?0x8a8782:L.matrixColor);
      var col=function(q){return L.colorFn?L.colorFn+'(kgWP+kgR*'+f(size)+','+q+'.x)':pal?palGlsl(pal,q+'.x')+'*(1.0-'+vary+'+2.0*'+vary+'*'+q+'.y)':'vec3(1.0)';};
      s.push('vec3 kgId,kgR;float kgS='+f(1/size)+';');
      s.push(xz?'vec2 kgI2,kgR2;vec2 kgV=kgVor2(kgWP.xz*kgS,'+jit+','+sd+',kgI2,kgR2);kgId=vec3(kgI2.x,0.0,kgI2.y);kgR=vec3(kgR2.x,0.0,kgR2.y);'
        :'vec2 kgV=kgVor3(kgWP*kgS,'+jit+','+sd+',kgId,kgR);');
      s.push('float kgFp=max(length(kgDx),length(kgDy))*kgS;vec3 kgQ=kgHash3(kgId+'+sd+'*vec3(1.0,1.7,2.3)+vec3(7.31,1.37,3.71));vec3 kgC='+col('kgQ')+';float kgG=1.0;');
      if(L.map){
        /* the grain: the map turned and shifted per block, so no two blocks share a patch */
        s.push('float kgCa=cos(kgQ.z*6.2831853),kgSa=sin(kgQ.z*6.2831853);mat2 kgRm=mat2(kgCa,-kgSa,kgSa,kgCa);vec2 kgO=kgQ.xy*17.0;');
        var smp=function(a){return 'KG_GRAD(uKG'+i+',kgRm*(kgWP.'+a+'*'+k+')+kgO,kgRm*(kgDx.'+a+'*'+k+'),kgRm*(kgDy.'+a+'*'+k+')).rgb';};
        s.push(xz?'vec3 kgGr='+dec(smp('xz'))+';':
          'vec3 kgN=abs(normalize(cross(kgDx,kgDy)+vec3(0.0,1e-7,0.0)));kgN=kgN*kgN*kgN*kgN;kgN/=kgN.x+kgN.y+kgN.z;'+
          'vec3 kgGr=kgN.x*'+dec(smp('zy'))+'+kgN.y*'+dec(smp('xz'))+'+kgN.z*'+dec(smp('xy'))+';');
        s.push(pal||L.colorFn?'kgG=clamp(kgLum(kgGr)/max(kgLum('+mean+'),0.02),0.0,2.5);kgC*=kgG;':'kgG=clamp(kgLum(kgGr)/max(kgLum('+mean+'),0.02),0.0,2.5);kgC=kgGr*(1.0-'+vary+'+2.0*'+vary+'*kgQ.y);');}
      s.push('float kgMk=1.0-smoothstep('+mw+'-kgFp,'+mw+'+kgFp,kgV.y);vec3 kgMc='+mc+'*kgG;');
      if(sub>0)s.push('if(kgMk>0.0){vec3 kgId2,kgRs;float kgS2=kgS/'+f(sub)+';'+
        (xz?'vec2 kgJ2,kgT2;vec2 kgV2=kgVor2(kgWP.xz*kgS2,'+jit+','+sd+'+19.0,kgJ2,kgT2);kgId2=vec3(kgJ2.x,0.0,kgJ2.y);':'vec2 kgV2=kgVor3(kgWP*kgS2,'+jit+','+sd+'+19.0,kgId2,kgRs);')+
        'float kgFp2=kgFp/'+f(sub)+';vec3 kgQ2=kgHash3(kgId2+'+sd+'*vec3(1.0,1.7,2.3)+vec3(2.17,5.03,0.61));'+
        'float kgM2=(1.0-smoothstep('+mw+'*2.0-kgFp2,'+mw+'*2.0+kgFp2,kgV2.y))*(1.0-smoothstep(0.15,0.5,kgFp2))+smoothstep(0.15,0.5,kgFp2)*0.5;'+
        'kgMc=mix('+(L.colorFn?L.colorFn+'(kgWP,kgQ2.x)*kgG':pal?palGlsl(pal,'kgQ2.x')+'*kgG':'kgGr')+'*(1.0-'+vary+'+2.0*'+vary+'*kgQ2.y),kgMc,kgM2);}');
      if(fl>0){var fp3=xz?'vec2 kgFc=kgWP.xz/'+f(fl)+';vec3 kgFh=kgHash3(vec3(floor(kgFc),'+sd+'+3.1));float kgFd=length(fract(kgFc)-0.5-(kgFh.yz-0.5)*0.4);'
          :'vec3 kgFc=kgWP/'+f(fl)+';vec3 kgFh=kgHash3(floor(kgFc)+'+sd+'+vec3(3.1,5.3,1.7));float kgFd=length(fract(kgFc)-0.5-(kgFh.yzx-0.5)*0.4);';
        s.push('if(kgMk>0.0){'+fp3+'float kgFf=1.0-smoothstep(0.5,1.5,kgFp*'+f(size/fl)+');'+
          'vec3 kgGl=kgFh.y<0.5?'+lin3(glass[0])+':'+lin3(glass[1])+';'+
          'kgMc=mix(kgMc,kgGl,step(kgFh.x,'+fd+')*(1.0-smoothstep(0.22,0.32,kgFd))*kgFf);'+
          'kgMc=mix(kgMc,'+lin3(glass[0])+',(1.0-kgFf)*'+fd+'*0.25);}');}
      s.push('kgC=mix(kgC'+T+',kgMc'+T+',kgMk);float kgH=mix(0.6+0.35*kgQ.z,0.3,kgMk);');}
    else if(L.kind==='sand'){
      // a sand (black, glassy: Godstep's dunes; the Godthrone's bead sand): the map hex-tiled as any layer (or a flat colour),
      // wind ripples across o.wind (crests lit and shadowed by o.sun, meandering, broken), glints of single grains toward
      // the sun from where the camera stands; both fade out where a pixel covers more than they can show
      var lam=L.ripple==null?.12:L.ripple,wd=L.wind||[1,0],wl=Math.hypot(wd[0],wd[1])||1,a=f(L.stoss==null?.8:L.stoss),st=f(L.steep==null?1/15:L.steep),
        gs=L.glint==null?.03:L.glint,sun=L.sun||'vec3(0.4,0.75,0.5)';
      s.push(L.map?'vec4 kgT=kgSample(uKG'+i+',kgWP.xz*'+k+',kgDx.xz*'+k+',kgDy.xz*'+k+',kgLv);vec3 kgC='+dec('kgT.rgb')+T+';'+
          'float kgH='+((L.h&&L.h.from)==='a'?'kgT.a':'clamp(0.5+(kgLum(kgT.rgb)-kgLum(KG_LOD(uKG'+i+',vec2(0.5),16.0).rgb))*'+f(L.h&&L.h.contrast!=null?L.h.contrast:1.6)+',0.02,1.0)')+';'
        :'vec3 kgC='+lin3(L.color==null?0x3a3a3e:L.color)+T+';float kgH=0.5;');
      s.push('float kgFp=max(length(kgDx.xz),length(kgDy.xz));vec3 kgSun=normalize('+sun+');');
      if(lam>0){var lw=f(lam*(L.meander==null?7:L.meander));
        s.push('{vec2 kgRd=vec2('+f(wd[0]/wl)+','+f(wd[1]/wl)+');vec2 kgP=kgWP.xz/'+lw+';'+
          'float kgU=dot(kgWP.xz,kgRd)/'+f(lam)+'+'+f(L.warp==null?1.2:L.warp)+'*(kgVN(kgP,'+sd+')*2.0-1.0);'+
          'float kgRb=smoothstep(0.25,0.55,kgVN(kgP*0.6+vec2(17.3,4.1),'+sd+'+11.0));'+
          'float kgF=fract(kgU),kgRh=kgRipple(kgU,'+a+'),kgRf=(1.0-smoothstep('+f(.15*lam)+','+f(.5*lam)+',kgFp))*kgRb;'+
          'float kgSl=(kgF<'+a+'?1.0/'+a+':-1.0/(1.0-'+a+'))*'+st+';vec3 kgRn=normalize(vec3(-kgRd.x*kgSl,1.0,-kgRd.y*kgSl));'+
          'kgC*=mix(1.0,clamp(dot(kgRn,kgSun)/max(kgSun.y,0.15),0.3,1.8),kgRf*'+f(L.shade==null?1:L.shade)+')*(1.0+'+f(L.crest==null?.12:L.crest)+'*(kgRh-0.5)*kgRf);'+
          'kgH=clamp(kgH+(kgRh-0.5)*0.3*kgRf,0.02,1.0);}');}
      if(gs>0)s.push('{vec2 kgGc=kgWP.xz/'+f(gs)+';vec2 kgGi=floor(kgGc);vec3 kgGh=kgHash3(vec3(kgGi,'+sd+'+3.7)),kgGh2=kgHash3(vec3(kgGi.yx,'+sd+'+8.9));'+
          'float kgGd=length(fract(kgGc)-0.25-0.5*kgGh.xy);vec3 kgGn=normalize(vec3((kgGh2.x-0.5)*'+f(L.spread==null?2:L.spread)+',1.0,(kgGh2.y-0.5)*'+f(L.spread==null?2:L.spread)+'));'+
          'float kgGl=pow(max(dot(reflect(-normalize((-(viewMatrix[3].xyz*mat3(viewMatrix)))-kgWP),kgGn),kgSun),0.0),'+f(L.sharp==null?150:L.sharp)+');'+
          'kgC+='+lin3(L.glintColor==null?0xffffff:L.glintColor)+'*kgGl*'+f(L.sparkle==null?4:L.sparkle)+'*step(kgGh.z,'+f(L.glintDensity==null?.2:L.glintDensity)+')*(1.0-smoothstep(0.15,0.3,kgGd))*(1.0-smoothstep('+f(.5*gs)+','+f(1.5*gs)+',kgFp));}');}
    else{
      // polygons on the plane (sand-wedge and ice-wedge polygons, patterned ground, a mare's pressure plates): Voronoi cells of
      // o.size, troughs o.width (cell units) along their edges, filled with the map (a wedge's sand, the moss in a crack) or
      // the ground under them times o.edgeTint; o.rim a band of the cells' edge (sorted stones) times o.rimTint; each cell's
      // ground varied by o.vary
      var ps=L.size==null?15:L.size,pw='kgWv',pwr=f(L.width==null?.04:L.width),wp=f(L.warp==null?.12:L.warp),rim=L.rim==null?0:L.rim,pv=f(L.vary==null?.12:L.vary);
      s.push('vec2 kgPw=kgWP.xz*'+f(1/ps)+';kgPw+='+wp+'*(vec2(kgVN(kgPw*3.0,'+sd+'+2.0),kgVN(kgPw*3.0+vec2(5.2,1.3),'+sd+'+2.0))*2.0-1.0);'+
        'float kgWv='+pwr+'*(0.55+0.9*kgVN(kgPw*4.0,'+sd+'+6.0));vec2 kgId,kgR;vec2 kgV=kgVor2(kgPw,'+f(L.jitter==null?.85:L.jitter)+','+sd+',kgId,kgR);float kgFp=max(length(kgDx.xz),length(kgDy.xz))*'+f(1/ps)+';'+
        'vec3 kgQ=kgHash3(vec3(kgId,'+sd+'+5.1));float kgTr=1.0-smoothstep('+pw+'-kgFp,'+pw+'+kgFp,kgV.y);');
      s.push('vec3 kgC=diffuseColor.rgb*(1.0+'+pv+'*(kgQ.x*2.0-1.0));float kgH=0.5+0.1*kgQ.y;');
      if(rim>0)s.push('float kgRm=(1.0-smoothstep('+pw+'+'+f(rim)+'-kgFp,'+pw+'+'+f(rim)+'+kgFp,kgV.y))*(1.0-kgTr);kgC=mix(kgC,diffuseColor.rgb*('+(L.rimTint||'vec3(1.15)')+'),kgRm);kgH=mix(kgH,0.65,kgRm);');
      s.push('vec3 kgE='+(L.map?dec('kgSample(uKG'+i+',kgWP.xz*'+k+',kgDx.xz*'+k+',kgDy.xz*'+k+',kgLv).rgb')+T:'diffuseColor.rgb*('+(L.edgeTint||'vec3(0.6)')+')')+';');
      s.push('kgC=mix(kgC,kgE,kgTr);kgH=mix(kgH,0.2,kgTr);');}
    return s.join('');}

  // ---------------------------------------------------------------- the library's sets, through KMAT
  function layer(build,slot,o){var K=root.KMAT;if(!K||K.mode!=='lib'||!K.packed)return null;var L=K.packed(build,slot);if(!L)return null;
    var out={map:K.textures(L,{aniso:8}).map,k:1/(L.scale&&L.scale[0]?L.scale[0]:1),name:slot};if(o)for(var q in o)out[q]=o[q];return out;}

  // ---------------------------------------------------------------- the hook
  function code(o,LY){var far=o.far===false?null:(o.far||{}),d0=far?(far.d==null?60:far.d):0,lv=far?(far.levels==null?3:far.levels):0,bl=o.blend==null?.18:o.blend,f=function(v){return (+v).toFixed(4);};
    var tri=triOf(o),rl=reliefOf(o);
    var s=['{vec3 kgDx=dFdx(kgWP),kgDy=dFdy(kgWP);float kgD=length(kgWP-(-(viewMatrix[3].xyz*mat3(viewMatrix))));',
      ' float kgLv='+(far?'min('+f(lv)+',max(0.0,log2(max(kgD/'+f(d0)+',1.0))))':'0.0')+';float kgHc='+(o.baseH||'0.5')+';'];
    if(tri)s.push(' vec3 kgN=normalize(kgWN);float kgSt=smoothstep('+f(tri.from)+','+f(tri.to)+',1.0-abs(kgN.y))*(1.0-smoothstep('+f(tri.far*.7)+','+f(tri.far)+',kgD));');
    var smp=function(i,k){return tri?'kgTS(uKG'+i+',kgWP,kgDx,kgDy,kgN,'+k+',kgLv,kgSt)':'kgSample(uKG'+i+',kgWP.xz*'+k+',kgDx.xz*'+k+',kgDy.xz*'+k+',kgLv)';};
    LY.forEach(function(L,i){
      if(L.kind!=null){if(!KINDS[L.kind])throw new Error('KGROUND: no layer kind \''+L.kind+'\' (clast, sand, polygon)');
        s.push(' {float kgA0=clamp('+L.w+',0.0,1.0)*'+f(L.amt==null?1:L.amt)+';if(kgA0>0.0){'+kindBody(L,i,f)+
          'float kgA=kgHL(kgA0,kgHc,kgH,'+f(bl)+');diffuseColor.rgb=mix(diffuseColor.rgb,kgC,kgA);kgHc=mix(kgHc,kgH,kgA);}}');return;}
      var h=L.h||{},from=h.from||'lum',hc=h.contrast==null?1.6:h.contrast,k=f(L.k);
      s.push(' {vec4 kgT='+smp(i,k)+';'+
        'vec3 kgC='+(L.lin===false?'kgT.rgb':'pow(kgT.rgb,vec3(2.2))')+'*('+(L.tint||'vec3(1.0)')+')*'+f(L.gain==null?1:L.gain)+';'+
        'float kgH='+(from==='a'?'kgT.a':'clamp(0.5+(kgLum(kgT.rgb)-kgLum(KG_LOD(uKG'+i+',vec2(0.5),16.0).rgb))*'+f(hc)+',0.02,1.0)')+';'+
        'float kgA=kgHL(clamp('+L.w+',0.0,1.0)*'+f(L.amt==null?1:L.amt)+',kgHc,kgH,'+f(bl)+');'+
        'diffuseColor.rgb=mix(diffuseColor.rgb,kgC,kgA);kgHc=mix(kgHc,kgH,kgA);}');});
    if(rl){var fd=function(a,b){return '(1.0-smoothstep('+f(a)+','+f(b)+',kgD))';};
      /* the relief's height in metres (kgBH, bumped after the normal is made) and the occlusion (kgOcc, on the light after it is summed) */
      s.push(' {float kgF='+fd(rl.near,rl.far)+';kgBH=(kgHc-0.5+('+rl.h+'))*'+f(rl.bump)+'*kgF;'+
        (rl.strata?'float kgSF=('+rl.strataW+')*'+fd(rl.strataNear,rl.strataFar)+';if(kgSF>0.001)kgBH+=ksRelief(vSWP,vSWN)*'+f(rl.strata)+'*kgSF;':'')+
        'kgOcc=(1.0-'+f(rl.cavity)+'*kgF*(1.0-smoothstep(0.12,0.55,kgHc)))'+(rl.mesh?'*(1.0-'+f(rl.mesh)+'*clamp(vKGAO,0.0,1.0))':'')+';}');}
    s.push('}');return s.join('\n');}
  // ---------------------------------------------------------------- relief and triplanar (opt-in, 2026-11-03: the ground diagnosis, GROUND.md)
  function triOf(o){if(!o.tri)return null;var t=o.tri===true?{}:o.tri;return {from:t.from==null?.35:t.from,to:t.to==null?.7:t.to,far:t.far==null?250:t.far};}
  function reliefOf(o){if(!o.relief)return null;var r=o.relief===true?{}:o.relief;
    return {bump:r.bump==null?.05:r.bump,near:r.near==null?25:r.near,far:r.far==null?140:r.far,cavity:r.cavity==null?.55:r.cavity,
      direct:r.direct==null?.35:r.direct,mesh:r.mesh==null?0:r.mesh,h:r.h||'0.0',strata:r.strata||0,strataW:r.strataW||'1.0',
      strataNear:r.strataNear==null?120:r.strataNear,strataFar:r.strataFar==null?300:r.strataFar,lambert:r.lambert==null?1:r.lambert};}
  // a layer sampled on the plane, and on the steep from the side (the two side planes blended by the normal's facing): kgSt is 0 on the flat
  var TRI_GLSL='vec4 kgTS(sampler2D t,vec3 p,vec3 dx,vec3 dy,vec3 n,float k,float lv,float s){vec4 c=vec4(0.0);if(s<1.0)c=kgSample(t,p.xz*k,dx.xz*k,dy.xz*k,lv);'+
    'if(s>0.0){float a=abs(n.x)/(abs(n.x)+abs(n.z)+1e-5),wx=smoothstep(0.3,0.7,a);vec4 sd=vec4(0.0);'+
    'if(wx<1.0)sd+=(1.0-wx)*kgSample(t,p.xy*k,dx.xy*k,dy.xy*k,lv);if(wx>0.0)sd+=wx*kgSample(t,p.zy*k,dx.zy*k,dy.zy*k,lv);c=mix(c,sd,s);}return c;}\n';
  // the bed's relief at a point (core/terrain/host/35-core-strata-shade.js's core path: the same bed as strataColor): a hard bed stands
  // proud and a soft one is recessed, each bed's nose rounded at its top and foot, a faint lamination; 0 in a blocks formation
  var STRATA_RELIEF_GLSL=['float ksRelief(vec3 wp,vec3 wn){',
   ' wn=normalize(wn);float w1;float wsh=uKSWash.x*smoothstep(uKSWash.y,uKSWash.z,wn.y);',
   ' float yy=ksYY(wp,w1)+wsh,side=0.0;',
   ' if(uKSLB.w>0.5){float w=smoothstep(uKSLat2.x,uKSLat2.y,(wp.x-uKSLat.z)*uKSLat.x+(wp.z-uKSLat.w)*uKSLat.y);',
   '  if(w>=1.0)side=1.0;else if(w>0.0)side=w>ksNoise(vec4(0,0,1,0),yy/uKSLat2.z,((wp.z-uKSLat.w)*uKSLat.x-(wp.x-uKSLat.z)*uKSLat.y)/500.0)?1.0:0.0;}',
   ' float y0=side>0.5?uKSLB.x:uKSCR.x,yl=yy;vec4 rp=side>0.5?uKSRepB:uKSRep;',
   ' if(rp.x>0.0&&yl<y0)yl=y0+mod(yl-y0,rp.x);if(rp.y>0.0&&yl>=rp.w)yl=rp.z+mod(yl-rp.z,rp.y);',
   ' float idx=side>0.5?uKSLB.z+clamp(floor((yl-uKSLB.x)/uKSCR.y),0.0,uKSLB.y-1.0):clamp(floor((yl-uKSCR.x)/uKSCR.y),0.0,uKSN-1.0);',
   ' float ci=mod(idx,uKSCR.z),cj=floor(idx/uKSCR.z);vec4 bi=KSFETCH(uKSBed,ci,cj,uKSCR.z,uKSCR.w);if(bi.a>0.9)return 0.0;',
   ' float nose=smoothstep(0.0,0.14,bi.r)*smoothstep(1.0,0.8,bi.r);',
   ' return (bi.b-0.5)*(0.3+0.7*nose)+0.04*sin(yy*5.1+w1*31.0);}'].join('\n')+'\n';
  // the normal bumped by the relief's height (Mikkelsen 2010, "Bump Mapping Unparametrized Surfaces on the GPU": the height's screen
  // derivatives on the surface's own), in view space; no texture unit, so a page at its sampler limit can take it
  var BUMP_GLSL='vec3 kgBump(vec3 vp,vec3 n,float h){vec3 px=dFdx(vp),py=dFdy(vp),r1=cross(py,n),r2=cross(n,px);float dt=dot(px,r1);'+
    'vec3 g=sign(dt)*(dFdx(h)*r1+dFdy(h)*r2);return normalize(abs(dt)*n-g);}\n';
  function reliefFrag(sh,rl,K){var fs=sh.fragmentShader,std=fs.indexOf('#include <normal_fragment_maps>')>=0,
      vp='(viewMatrix*vec4(kgWP,1.0)).xyz';
    /* MeshStandard (and Phong): the lit normal is bumped. Lambert (r128 lights per vertex): the sun's share is scaled by the bumped
       normal's facing over the face's own, the nearest a per-vertex material can come */
    if(std)fs=K.rep(fs,'#include <normal_fragment_maps>','#include <normal_fragment_maps>\nnormal=kgBump('+vp+',normal,kgBH);','kground');
    var light='{reflectedLight.indirectDiffuse*=kgOcc;reflectedLight.indirectSpecular*=kgOcc;float kgOd=mix(1.0,kgOcc,'+(+rl.direct).toFixed(4)+');';
    if(!std&&rl.lambert)light+='\n#if NUM_DIR_LIGHTS > 0\n{vec3 kgV='+vp+',kgN0=normalize(cross(dFdx(kgV),dFdy(kgV))),kgL=directionalLights[0].direction;'+
      'vec3 kgNb=kgBump(kgV,kgN0,kgBH);float kgR=clamp(max(dot(kgNb,kgL),0.0)/max(dot(kgN0,kgL),0.08),0.0,2.0);kgOd*=mix(1.0,kgR,'+(+rl.lambert).toFixed(4)+');}\n#endif\n';
    light+='reflectedLight.directDiffuse*=kgOd;reflectedLight.directSpecular*=kgOd;}';
    sh.fragmentShader=K.rep(fs,'#include <aomap_fragment>','#include <aomap_fragment>\n'+light,'kground');}
  // ---------------------------------------------------------------- the mesh's own cavities (data: plain arrays, no THREE; Godot bakes the same)
  // KGROUND.cavity({pos, index, normal, count}, o) -> Float32Array of 0 (open) .. 1 (in a hollow) per vertex: each vertex against its
  // neighbourhood smoothed by `rings` passes of the umbrella operator (o.rings [3, 18]: two scales, a gully and a valley), the depth
  // below it along the normal over o.depth metres ([.5, 4]), mixed by o.mix ([.5, .5]); a crest reads 0. Deterministic, no draws.
  function cavity(g,o){o=o||{};var P=g.pos,I=g.index,n=g.count||P.length/3,N=g.normal,rings=o.rings||[3,18],dep=o.depth||[.5,4],mx=o.mix||[.5,.5];
    var deg=new Uint32Array(n+1),i,j,a,b,c,t;
    var edge=function(cb){if(I){for(t=0;t<I.length;t+=3){a=I[t];b=I[t+1];c=I[t+2];cb(a,b);cb(b,c);cb(c,a);}}else for(t=0;t<n;t+=3){cb(t,t+1);cb(t+1,t+2);cb(t+2,t);}};
    edge(function(u,v){deg[u+1]++;deg[v+1]++;});for(i=0;i<n;i++)deg[i+1]+=deg[i];
    var adj=new Uint32Array(deg[n]),fill=deg.slice(0,n);edge(function(u,v){adj[fill[u]++]=v;adj[fill[v]++]=u;});
    var S=new Float64Array(P),T2=new Float64Array(n*3),out=new Float32Array(n),last=Math.max.apply(null,rings);
    for(var r=1;r<=last;r++){for(i=0;i<n;i++){var s0=deg[i],s1=deg[i+1],k=s1-s0;if(!k){T2[i*3]=S[i*3];T2[i*3+1]=S[i*3+1];T2[i*3+2]=S[i*3+2];continue;}
        var x=0,y=0,z=0;for(j=s0;j<s1;j++){var q=adj[j]*3;x+=S[q];y+=S[q+1];z+=S[q+2];}T2[i*3]=x/k;T2[i*3+1]=y/k;T2[i*3+2]=z/k;}
      var sw=S;S=T2;T2=sw;
      for(var m=0;m<rings.length;m++)if(rings[m]===r)for(i=0;i<n;i++){var nx=N?N[i*3]:0,ny=N?N[i*3+1]:1,nz=N?N[i*3+2]:0,
        d=(S[i*3]-P[i*3])*nx+(S[i*3+1]-P[i*3+1])*ny+(S[i*3+2]-P[i*3+2])*nz;out[i]+=mx[m]*Math.min(1,Math.max(0,d/dep[m]));}}
    return out;}
  // the same on a THREE mesh: sets the attribute aKGAO (relief.mesh reads it) and returns it
  function cavityMesh(mesh,o){var g=mesh.geometry,p=g.attributes.position;if(!g.attributes.normal)g.computeVertexNormals();
    var a=cavity({pos:p.array,index:g.index?g.index.array:null,normal:g.attributes.normal.array,count:p.count},o),T=root.THREE||(root.BIO&&root.BIO.host&&root.BIO.host.THREE);
    g.setAttribute('aKGAO',new T.BufferAttribute(a,1));return a;}
  // the before-and-after switch without the page's word (?kgrelief=1 [&kgtri=1]): the relief and the triplanar sides on every KGROUND
  // material whose page did not set them, and the mesh cavities found on the scene when the shader is first made. For judging only:
  // a page adopts by passing o.relief / o.tri and calling cavityMesh itself
  // the preview finds its meshes as they are first drawn (a page's scene is not always a global): Object3D's onBeforeRender, wrapped
  // once and only under ?kgrelief=1
  var PV=[];function pvCatch(mat){if(PV.indexOf(mat)<0)PV.push(mat);var T=root.THREE;if(!T||!T.Object3D||T.Object3D.prototype._kgPv)return;
    var P=T.Object3D.prototype,was=P.onBeforeRender;P._kgPv=true;
    P.onBeforeRender=function(r,s,c,g,m){if(m&&PV.indexOf(m)>=0&&g&&!g.attributes.aKGAO&&this.isMesh)cavityMesh(this);return was.apply(this,arguments);};}
  function preview(){try{var q=new URLSearchParams(root.location&&root.location.search||'');var k=parseFloat(q.get('kgrelief'));return {relief:k>0,k:k>0?k:1,tri:q.get('kgtri')==='1'};}catch(e){return {};}}
  function hook(mat,o){o=o||{};var LY=(o.layers||[]).filter(function(L){return L&&(L.map||L.kind!=null);});if(!mat)return mat;
    mat.userData.kground=LY.map(function(L){return L.name||'layer';});if(!LY.length)return mat;
    var pv=preview(),pvMesh=false;
    if((pv.relief&&o.relief==null)||(pv.tri&&o.tri==null)){var o2={};for(var q in o)o2[q]=o[q];
      if(pv.relief&&o.relief==null){o2.relief={bump:.05*pv.k,cavity:Math.min(.9,.55*pv.k),mesh:Math.min(1,.7*pv.k),strata:.3*pv.k,strataW:'smoothstep(0.06,0.3,1.0-abs(normalize(vSWN).y))'};pvMesh=true;}
      if(pv.tri&&o.tri==null)o2.tri=true;o=o2;}
    var K=kh(),at=o.at||'/*KGROUND*/',kinds=LY.some(function(L){return L.kind!=null;}),tri=triOf(o),rl=reliefOf(o),body=code(o,LY);
    var lib=glsl(o)+(kinds?kindsGlsl():'')+(tri?TRI_GLSL:'')+(rl?BUMP_GLSL:'');
    if(kinds)mat.userData.kgroundKinds=LY.map(function(L){return L.kind||null;});
    if(rl||tri)mat.userData.kgroundRelief={relief:!!rl,tri:!!tri};
    /* a KHOOK layer (core/shader): after the page's own hook and the layers before it, keyed by its layers; a missing anchor throws */
    return K.add(mat,'kground',function(sh,r){if(/varying vec3 kgWP;/.test(sh.vertexShader))return;LY.forEach(function(L,i){if(L.map)sh.uniforms['uKG'+i]={value:L.map};});
      var wp='vec4 kgW4=vec4(transformed,1.0);\n#ifdef USE_INSTANCING\nkgW4=instanceMatrix*kgW4;\n#endif\nkgWP=(modelMatrix*kgW4).xyz;\n';
      if(tri)wp+='kgWN=normalize(mat3(modelMatrix)*objectNormal);\n';
      if(rl&&rl.mesh)wp+='vKGAO=aKGAO;\n';
      var vdec='varying vec3 kgWP;\n'+(tri?'varying vec3 kgWN;\n':'')+(rl&&rl.mesh?'attribute float aKGAO;varying float vKGAO;\n':'');
      sh.vertexShader=vdec+K.inject(sh.vertexShader,{at:'project_vertex',after:wp,fallback:{at:'fog_vertex',before:wp}},'kground');
      /* the bed relief needs the core strata path's uniforms (KSTRATA.shade); on the legacy strata, or none, it is left out */
      var b=body,ks=!!(rl&&rl.strata&&sh.fragmentShader.indexOf('uKSBed')>=0);if(rl&&rl.strata&&!ks)b=b.replace(/float kgSF=[^;]*;if\(kgSF>0\.001\)kgBH\+=ksRelief\([^;]*;/,'');
      var dec='varying vec3 kgWP;\n'+(tri?'varying vec3 kgWN;\n':'')+(rl?(rl.mesh?'varying float vKGAO;\n':'')+'float kgBH=0.0,kgOcc=1.0;\n':'')+
        LY.map(function(L,i){return L.map?'uniform sampler2D uKG'+i+';':'';}).join('')+'\n'+lib+(ks?STRATA_RELIEF_GLSL:'');
      var fs=K.rep(sh.fragmentShader,'void main() {',dec+'void main() {','kground');
      fs=fs.indexOf(at)>=0?fs.replace(at,b):K.rep(fs,'#include <map_fragment>','#include <map_fragment>\n'+b,'kground');
      sh.fragmentShader=fs;if(rl)reliefFrag(sh,rl,K);
      if(pvMesh)pvCatch(mat);},
      {key:'kground-'+(o.key||'')+'-'+LY.length+'-'+body.length+(rl||tri?'-r'+(rl?1:0)+(tri?1:0):'')});}
  function kh(){var K=root.KHOOK;if(!K)throw new Error('core/terrain: core/shader is not on this page (KHOOK): list core/shader/06-core-khook.js (khost.resolve adds it)');return K;}
  root.KGROUND={layer:layer,hook:hook,glsl:glsl,code:code,kindsGlsl:kindsGlsl,KINDS:Object.keys(KINDS),BRECCIA:BRECCIA,cavity:cavity,cavityMesh:cavityMesh,
    fn:{hash:hash,tri:tri,heightLerp:heightLerp,lod:lod,hash3:hash3,vor2:vor2,vor3:vor3,vnoise:vnoise,ripple:ripple}};
})(typeof globalThis!=='undefined'?globalThis:this);
