// ================================================================= GEYSER — build / canopyH / the ground's sampler
// The kit's public surface (BIOME-API.md). The layout is 46 (GEYSER.lay, before the host's terrain); the passes 55 (trees
// and the dead forest), 57 (the sinter: cones, geyserite, the snags' socks) and 60 (the floor); the show 65 (the water,
// the mud, the eruptions, the steam). This file only orders them and reports.
GEYSER.build=function(opt){opt=opt||{};const R=opt.R||1300,q=opt.quality==null?1:opt.quality;
 const out={R,quality:q};if(!GEYSER.R){BIO.err('GEYSER.build: no layout (call GEYSER.lay first)');return out;}
 if(GEYSER.buildSinter){BIO.cur='geyser/sinter';Object.assign(out,GEYSER.buildSinter(q));}
 if(GEYSER.buildTrees){BIO.cur='geyser/trees';Object.assign(out,GEYSER.buildTrees(R,q));}
 if(GEYSER.buildFloor){BIO.cur='geyser/floor';Object.assign(out,GEYSER.buildFloor(R,q));}
 if(GEYSER.buildShow&&opt.show!==false){BIO.cur='geyser/show';Object.assign(out,GEYSER.buildShow(opt));}
 BIO.cur=null;return out;};
GEYSER.canopyH=function(x,z){return GEYSER._canopyH?GEYSER._canopyH(x,z):4;};
// THE GROUND'S LAYER SAMPLER for a host's ground shader (the Throne's, THRONE.GLSL_LAY, carried here so a world with only
// this kit has it): _lay(t,p,q,k,mt) reads a library layer at world xz p (and q, the same turned) with its tile scale k,
// each read through virtual tiles with random offsets chosen by a low-frequency index from the host's uMacro and blended
// across their seams (Inigo Quilez's "texture repetition", technique 3), then the two reads mixed by mt. Needs uMacro
GEYSER.GLSL_LAY='float _nti(vec2 p){return texture2D(uMacro,p*0.0037).g;}'+
 'vec3 _nt(sampler2D t,vec2 uv,float x){float l=x*8.0,f=fract(l),ia=floor(l),ib=ia+1.0;vec2 oa=sin(vec2(3.0,7.0)*ia),ob=sin(vec2(3.0,7.0)*ib);'+
 '\n#if __VERSION__>=300\nvec2 dx=dFdx(uv),dy=dFdy(uv);vec3 a=textureGrad(t,uv+oa,dx,dy).rgb,b=textureGrad(t,uv+ob,dx,dy).rgb;\n#else\nvec3 a=texture2D(t,uv+oa).rgb,b=texture2D(t,uv+ob).rgb;\n#endif\n'+
 'vec3 d=a-b;return mix(a,b,smoothstep(0.2,0.8,f-0.1*(d.x+d.y+d.z)));}'+
 'vec3 _lay(sampler2D t,vec2 p,vec2 q,float k,float mt){float x=_nti(p);return pow(mix(_nt(t,p*k,x),_nt(t,q*k*0.47+vec2(0.31,0.17),fract(x*1.7+0.37)),mt),vec3(2.2));}';
BIO.kitEnd(GEYSER);   // its exports run in its registry; the default kit is current again
