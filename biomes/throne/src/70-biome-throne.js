// ================================================================= THE THRONE — build / canopyH
// The kit's public surface (BIOME-API.md). The flow history is 46, the passes 55 (trees) and 60 (floor); this file only
// orders them and reports. A host that has not made a flow history (THRONE.flowHistory) gets the ground's default age
// (THRONE.OLD) everywhere. No fauna here: the owner's plan moves all fauna to one fauna kit (biomes/README.md).
THRONE.build=function(opt){opt=opt||{};const R=opt.R||2500,q=opt.quality==null?1:opt.quality;
 const out={R,quality:q,trees:0,heroes:0,far:0};
 out.flows=THRONE.FLOWS?THRONE.FLOWS.flows.length:0;out.shares=THRONE.FLOWS?THRONE.FLOWS.shares():null;
 if(THRONE.buildTrees){BIO.cur='throne/trees';Object.assign(out,THRONE.buildTrees(R,q));}
 // the lava casts of swallowed trees (only where a flow meets a kipuka: the windward stations)
 if(THRONE.buildCasts){BIO.cur='throne/trees';out.casts=THRONE.buildCasts(R,q);}
 // the shallows (the geyser isle): kelp, wrack, the lagoon's mangroves; before the floor, so it plants round the mangroves
 if(opt.shallows&&THRONE.buildShallows){BIO.cur='throne/trees';out.shallows=THRONE.buildShallows(R,q);}
 if(THRONE.buildFloor){BIO.cur='throne/floor';Object.assign(out,THRONE.buildFloor(R,q));}
 if(opt.understory&&THRONE.buildUnderstory){BIO.cur='throne/floor';out.understory=THRONE.buildUnderstory(R,q);}
 // vent country's sulphur life: only where the host has the field (its own seed, so nothing else moves)
 if(BIO.hasField('sulph')&&THRONE.buildSulphur){BIO.cur='throne/floor';out.sulphur=THRONE.buildSulphur(R,q);}
 // the glacier's cold belt, tundra and warm ground: only where the host has the field (its own seed)
 if(BIO.hasField('cbelt')&&THRONE.buildCold){BIO.cur='throne/floor';out.cold=THRONE.buildCold(R,q);}
 // the lava tube's cave life: only where the host has the field (its own seed)
 if(BIO.hasField('cave')&&THRONE.buildCave){BIO.cur='throne/floor';out.cave=THRONE.buildCave(R,q);}
 // the new flora (stations 1 and 7): only where the host has the field (its own seed)
 if((BIO.hasField('riftlife')||BIO.hasField('ashlife'))&&THRONE.buildNewFlora){BIO.cur='throne/floor';out.newflora=THRONE.buildNewFlora(R,q);}
 BIO.cur=null;return out;};
// THE GROUND'S LAYER SAMPLER for a host's ground shader (stochastic tiling: the owner asked for it on the kipuka's floor,
// the savanna's kopjes and its burn). _lay(t,p,q,k,mt) reads a library layer at world xz p (and q, the same turned) with
// its tile scale k: each read goes through virtual tiles with random offsets, chosen by a low-frequency index from the
// host's uMacro and blended across their seams (Inigo Quilez's "texture repetition", technique 3), with explicit
// gradients so the jumps leave no mip seams; then the two reads are mixed by mt as before. Needs uMacro declared first
THRONE.GLSL_LAY='float _nti(vec2 p){return texture2D(uMacro,p*0.0037).g;}'+
 'vec3 _nt(sampler2D t,vec2 uv,float x){float l=x*8.0,f=fract(l),ia=floor(l),ib=ia+1.0;vec2 oa=sin(vec2(3.0,7.0)*ia),ob=sin(vec2(3.0,7.0)*ib);'+
 '\n#if __VERSION__>=300\nvec2 dx=dFdx(uv),dy=dFdy(uv);vec3 a=textureGrad(t,uv+oa,dx,dy).rgb,b=textureGrad(t,uv+ob,dx,dy).rgb;\n#else\nvec3 a=texture2D(t,uv+oa).rgb,b=texture2D(t,uv+ob).rgb;\n#endif\n'+
 'vec3 d=a-b;return mix(a,b,smoothstep(0.2,0.8,f-0.1*(d.x+d.y+d.z)));}'+
 'vec3 _lay(sampler2D t,vec2 p,vec2 q,float k,float mt){float x=_nti(p);return pow(mix(_nt(t,p*k,x),_nt(t,q*k*0.47+vec2(0.31,0.17),fract(x*1.7+0.37)),mt),vec3(2.2));}'+
 // _layd: the same, its offsets changing every few tiles (a small tile, as snow, still repeated plainly inside the coarse index's
 // ~270 m), and a broad brightness swell (the owner: the snow wanted more dithering)
 'vec3 _layd(sampler2D t,vec2 p,vec2 q,float k,float mt){float x=texture2D(uMacro,p*k*0.04).g,x2=texture2D(uMacro,q*k*0.027+0.5).r;'+
 'vec3 c=mix(_nt(t,p*k,x),_nt(t,q*k*0.47+vec2(0.31,0.17),fract(x2*1.7+0.37)),mt);float sw=texture2D(uMacro,p*0.0023).r;return pow(c*(0.9+0.2*sw),vec3(2.2));}';
// THE SAME SAMPLER ON KGROUND (core/terrain/43-core-ground.js; the final rebuild, 2026-11-02: BACKPORT.md's ground row): THRONE.layGLSL(kg, own) is
// the GLSL a host's ground shader declares. With kg (the host's switch, ?kground=0 off) _lay and _layd read each library layer through KGROUND's
// own functions: Mikkelsen's hex tiling in place of the virtual tiles (no repeat, no second turned read: q and mt are not used) and its distance
// scale (the tile doubles at each doubling of the distance past 60 m, up to three times, two scales cross-faded; the distance is the fragment's
// depth, 1/gl_FragCoord.w, since three r128 uploads no cameraPosition to a Lambert ground). _layd keeps its broad brightness swell. The layers'
// weights stay the host's own masks (the fields, the flows' ages). Without kg (or without KGROUND on the page): own, else GLSL_LAY, as before.
THRONE.layGLSL=function(kg,own){
 if(!kg||typeof KGROUND==='undefined')return own==null?THRONE.GLSL_LAY:own;
 return '\n'+KGROUND.glsl()+'float _kgLv(){return min(3.0,max(0.0,log2(max((1.0/gl_FragCoord.w)/60.0,1.0))));}\n'+
  '#if __VERSION__>=300\nvec4 _kgS(sampler2D t,vec2 st){return kgSample(t,st,dFdx(st),dFdy(st),_kgLv());}\n#else\nvec4 _kgS(sampler2D t,vec2 st){return kgSample(t,st,vec2(0.0),vec2(0.0),_kgLv());}\n#endif\n'+
  'vec3 _lay(sampler2D t,vec2 p,vec2 q,float k,float mt){return pow(_kgS(t,p*k).rgb,vec3(2.2));}'+
  'vec3 _layd(sampler2D t,vec2 p,vec2 q,float k,float mt){float sw=texture2D(uMacro,p*0.0023).r;return pow(_kgS(t,p*k).rgb*(0.9+0.2*sw),vec3(2.2));}\n';};
// KGROUND's layer kinds on a ground that already takes its library through layGLSL (2026-11-03: the caldera, the ash desert, the glacier):
// KGROUND.hook adds the library again, so a KHOOK layer after 'kground' drops the second copy (the two are the same text: KGROUND.glsl()'s defaults)
THRONE.kgOnce=function(mat){if(typeof KHOOK==='undefined'||typeof KGROUND==='undefined')return mat;const L=KGROUND.glsl();
 return KHOOK.add(mat,'throne-kgonce',sh=>{const f=sh.fragmentShader,a=f.indexOf(L),b=f.lastIndexOf(L);if(a>=0&&b>a)sh.fragmentShader=f.slice(0,b)+f.slice(b+L.length);},{key:'throne-kgonce'});};
// THE GROUNDS ON KGROUND'S HOOK, WITH ITS RELIEF (2026-11-03: the ground workstream, HANDOFF-REBUILD.md; core/README.md "Adopting KGROUND's relief").
// A station's ground keeps its paint, its zone weights (the aL* attributes) and its own terms (the detail, the glow, the glints); its library
// layers go to KGROUND.hook instead of its own blend: hex tiling, the distance scale, the height blend, and the relief (a bump from the layers'
// height at no texture unit, cavity occlusion, the mesh's hollows). On MeshStandard, as the relief needs (r128 gives a Lambert ground neither
// per-pixel light nor cameraPosition). THRONE.kgGround(mat, {key, keys, W, GLAY, gain, tint, extra, kinds, tri}) -> {key: its uKG index} or null
// (the page then keeps its own blend: ?kground=0, no library pack); THRONE.kgE(I, GLAY, key) a layer's colour for the page's glow;
// THRONE.kgCavity(mesh) after the ground is built. ?relief=0 the layers without the relief; ?kinds=0 without the layer kinds
THRONE.RELIEF={bump:.075,cavity:.8,mesh:1};
THRONE.kgGround=function(mat,o){
 if(typeof KGROUND==='undefined'||!KGROUND.hook||!o.GLAY||(typeof USE_KG!=='undefined'&&!USE_KG))return null;
 const q=typeof CORE_Q!=='undefined'?CORE_Q:new URLSearchParams(''),I={};
 const LY=o.keys.map(k=>({name:k,map:o.GLAY[k].map,k:o.GLAY[k].k,w:o.W[k],tint:(o.tint&&o.tint[k])||'diffuse',gain:o.gain&&o.gain[k]!=null?o.gain[k]:1.25}))
  .concat(o.extra||[]).concat(q.get('kinds')!=='0'?(o.kinds||[]):[]);
 LY.forEach((L,i)=>{I[L.name]=i;});
 const relief=q.get('relief')==='0'?undefined:THRONE.RELIEF;
 KGROUND.hook(mat,{key:o.key,layers:LY,relief,tri:o.tri||undefined});mat.userData.throneRelief=!!relief;return I;};
THRONE.kgE=(I,GLAY,k)=>'pow(texture2D(uKG'+I[k]+',vGWP.xz*'+GLAY[k].k.toFixed(4)+').rgb,vec3(2.2))';
THRONE.kgCavity=function(mesh){if(mesh&&mesh.material&&mesh.material.userData.throneRelief&&typeof KGROUND!=='undefined'&&KGROUND.cavityMesh)KGROUND.cavityMesh(mesh,{rings:[3,18],depth:[.5,4]});return mesh;};
THRONE.canopyH=function(x,z){return THRONE._canopyH?THRONE._canopyH(x,z):6;};
BIO.kitEnd(THRONE);   // its exports run in its registry; the default kit is current again
