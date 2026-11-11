// ================================================================= WATER — the far bed: a shore window without an edge
// [draw] An open surface with a SHORE WINDOW (WATER.open({shore: {window}}), 83w's seas and lakes) knows its bed only
// inside the window round the camera; outside it the depth was a constant "deep" and the shore distance "open water",
// so the shallows' colour, the shoaling and the surf stopped on the window's straight edge (the owner, 2026-11-11, with
// core/coast: "fix core/water"). This opt-in fragment (listed only by builds that want it: the four open-world regions,
// after core/water's 50) gives such a surface a coarse FAR BED over its mask, baked once:
//   WATER.farBed(S, {ground(x, z) -> h, cell (m, 1000), maxTexels (65536)}) -> S.farBed {x0, z0, cell, nx, nz, data}
//     the depth under the surface's base level at each cell centre inside its mask, one byte: t = sqrt((d + 10) / 310)
//     (fine in the shallows, 300 m at the most), read bilinear
// and its shader: outside the window the depth is the far bed's; inside, the window's own depth and shore distance are
// eased into the far bed's (and into open water) over the window's outer 12 %, so no straight edge is left. The CPU side
// (heightAt, shoreDist) is unchanged: the far bed only shades. Call it after WATER.open and before WATER.draw.
(function(){'use strict';
if(typeof WATER==='undefined'||!WATER.glsl)throw new Error('core/water/farbed needs core/water (20, 21, 50) before it');
const W=WATER,LO=-10,SPAN=310,EDGE=.12;
const gf=v=>{const q=String(+v);return/[.e]/.test(q)?q:q+'.0';};
W.farBed=function(S,o){o=o||{};const g=o.ground;if(typeof g!=='function')throw new Error('WATER.farBed: needs ground(x, z)');
 const M=S.mask,b=M?[M.x0,M.z0,M.x0+M.nx*M.cell,M.z0+M.nz*(M.cellZ==null?M.cell:M.cellZ)]:S.bounds;
 if(!b)throw new Error('WATER.farBed: the surface has neither a mask nor bounds');
 const w=b[2]-b[0],d=b[3]-b[1],cap=o.maxTexels==null?65536:o.maxTexels;
 const cell=Math.max(o.cell==null?1000:o.cell,Math.sqrt(w*d/cap)),nx=Math.max(2,Math.ceil(w/cell)),nz=Math.max(2,Math.ceil(d/cell));
 const data=new Uint8Array(nx*nz*4);let wet=0;
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=b[0]+(i+.5)*cell,z=b[1]+(j+.5)*cell,k=(j*nx+i)*4;let t=0;
  if(!S.maskAt||S.maskAt(x,z)){const dd=S.base-g(x,z);t=Math.sqrt(Math.min(1,Math.max(0,(dd-LO)/SPAN)));wet++;}
  data[k]=Math.round(t*255);data[k+3]=255;}
 S.farBed={x0:b[0],z0:b[1],cell,nx,nz,data,wet};return S.farBed;};
// the shader: the window's depth and shore distance eased into the far bed at the window's edge
const glsl0=W.glsl;
W.glsl=S=>{let s=glsl0(S);if(!S.farBed||!S.shoreWin||!S.shore)return s;
 const reD=/float wtrDepth\(vec2 p\)\{vec2 uv=\(p-wtrBedBox\.xy\)\*wtrBedBox\.zw;if\(uv\.x<0\.0\|\|uv\.y<0\.0\|\|uv\.x>1\.0\|\|uv\.y>1\.0\)return [^;]+;return (wtrLevel-wtrBase\+wtrBedDecode4\(texture2D\(wtrBed,uv\)\));\}/;
 const reS=/float wtrShoreDist\(vec2 p\)\{vec2 uv=\(p-wtrBedBox\.xy\)\*wtrBedBox\.zw;if\(uv\.x<0\.0\|\|uv\.y<0\.0\|\|uv\.x>1\.0\|\|uv\.y>1\.0\)return ([^;]+);return (\(texture2D\(wtrBed,uv\)\.z-0\.5\)\*[^;]+);\}/;
 if(!reD.test(s)||!reS.test(s))throw new Error('core/water/farbed: core/water\'s wtrDepth or wtrShoreDist changed shape; update farbed');
 const head='uniform sampler2D wtrFar;uniform vec4 wtrFarBox;'+
  'float wtrFarDepth(vec2 p){float t=texture2D(wtrFar,(p-wtrFarBox.xy)*wtrFarBox.zw).x;return wtrLevel-wtrBase+'+gf(LO)+'+t*t*'+gf(SPAN)+';}'+
  'float wtrEdgeK(vec2 uv){return smoothstep(0.0,'+gf(EDGE)+',min(min(uv.x,uv.y),min(1.0-uv.x,1.0-uv.y)));}';
 s=s.replace(reD,(m,inner)=>head+'float wtrDepth(vec2 p){vec2 uv=(p-wtrBedBox.xy)*wtrBedBox.zw;float fd=wtrFarDepth(p);if(uv.x<0.0||uv.y<0.0||uv.x>1.0||uv.y>1.0)return fd;return mix(fd,'+inner+',wtrEdgeK(uv));}');
 s=s.replace(reS,(m,band,inner)=>'float wtrShoreDist(vec2 p){vec2 uv=(p-wtrBedBox.xy)*wtrBedBox.zw;if(uv.x<0.0||uv.y<0.0||uv.x>1.0||uv.y>1.0)return '+band+';return mix('+band+','+inner+',wtrEdgeK(uv));}');
 return s;};
const uni0=W.uniformsOf;
W.uniformsOf=S=>{const U=uni0(S);if(S.farBed&&!U.wtrFar){const F=S.farBed,T=(typeof THREE!=='undefined'?THREE:null);if(!T)return U;
  const tx=new T.DataTexture(F.data,F.nx,F.nz,T.RGBAFormat,T.UnsignedByteType);tx.minFilter=tx.magFilter=T.LinearFilter;tx.wrapS=tx.wrapT=T.ClampToEdgeWrapping;
  tx.generateMipmaps=false;tx.flipY=false;tx.needsUpdate=true;U.wtrFar={value:tx};U.wtrFarBox={value:new T.Vector4(F.x0,F.z0,1/(F.cell*F.nx),1/(F.cell*F.nz))};}
 return U;};
})();
