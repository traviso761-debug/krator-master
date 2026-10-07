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
THRONE.canopyH=function(x,z){return THRONE._canopyH?THRONE._canopyH(x,z):6;};
BIO.kitEnd(THRONE);   // its exports run in its registry; the default kit is current again
