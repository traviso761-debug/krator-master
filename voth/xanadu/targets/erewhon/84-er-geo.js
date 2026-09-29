// ================================================================= EREWHON — geometry (target: erewhon)
// The terrain of the Pearl of Xanadu comes from Travis's map (tools/erewhon-map.py → 83-er-data.js): heights at 8 m
// and ground classes at 4 m. Metres; x east, z SOUTH (the lake is north, −z; the mountain south, +z); origin at the
// map's centre. The biome's own heightmap is a rough guide only — this one governs.
window.ER=true;window.CITY=true;
const ER={W:ER_DATA.W*ER_DATA.S,H:ER_DATA.H*ER_DATA.S,S:ER_DATA.S,LAKE:0,QUALITY:1,CHUNK:480,BUDGET:25000000,
 CLS:{water:0,flat:1,steep:2,ridge:3,unbuild:4,cliff:5}};
const SEED_ER=717171;
function smoothstep(e0,e1,x){const t=clamp((x-e0)/(e1-e0),0,1);return t*t*(3-2*t);}
// ---------------------------------------------------------------- the height field (uint16 decimetres, offset 40 m) and the class field (RLE)
const ER_H=(function(){const d=ER_DATA.h8,bin=atob(d.b64),n=bin.length/2,out=new Float32Array(n);for(let i=0;i<n;i++){const v=bin.charCodeAt(2*i)|(bin.charCodeAt(2*i+1)<<8);out[i]=v*d.k-d.off;}return{w:d.w,h:d.h,a:out,cell:ER_DATA.S*4};})();
const ER_C=(function(){const d=ER_DATA.c4,bin=atob(d.b64),out=new Uint8Array(d.w*d.h);let o=0;for(let i=0;i<bin.length;i+=2){const v=bin.charCodeAt(i),n=bin.charCodeAt(i+1);for(let k=0;k<n;k++)out[o++]=v;}return{w:d.w,h:d.h,a:out,cell:ER_DATA.S*2};})();
function terrainBase(x,z){const H=ER_H;const u=clamp((x+ER.W/2)/H.cell,0,H.w-1.001),v=clamp((z+ER.H/2)/H.cell,0,H.h-1.001);const i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j;
 const a=H.a[j*H.w+i],b=H.a[j*H.w+i+1],c=H.a[(j+1)*H.w+i],d=H.a[(j+1)*H.w+i+1];return (a*(1-fu)+b*fu)*(1-fv)+(c*(1-fu)+d*fu)*fv;}
function erClass(x,z){const C=ER_C;const i=clamp(Math.floor((x+ER.W/2)/C.cell),0,C.w-1),j=clamp(Math.floor((z+ER.H/2)/C.cell),0,C.h-1);return C.a[j*C.w+i];}
function onMap(x,z,m){m=m||0;return Math.abs(x)<ER.W/2-m&&Math.abs(z)<ER.H/2-m;}
// ---------------------------------------------------------------- levelled plots (the city flattens a disc under every landmark and every garden tile)
const FLATS=[],FLATCELL=64,FLATGRID={};
function cityFlat(x,z,r,apron,h){const f=[x,z,r,apron,h];FLATS.push(f);const R=r+apron;
 for(let iz=Math.floor((z-R)/FLATCELL);iz<=Math.floor((z+R)/FLATCELL);iz++)for(let ix=Math.floor((x-R)/FLATCELL);ix<=Math.floor((x+R)/FLATCELL);ix++){const k=ix+','+iz;(FLATGRID[k]||(FLATGRID[k]=[])).push(f);}return h;}
terrainH=function(x,z){let h=terrainBase(x,z);const L=FLATGRID[Math.floor(x/FLATCELL)+','+Math.floor(z/FLATCELL)];
 if(L)for(const f of L){const d=Math.hypot(x-f[0],z-f[1]);if(d<f[2]+f[3]){const k=1-smoothstep(f[2],f[2]+f[3],d);h=h*(1-k)+f[4]*k;}}return h;};
function erSlope(x,z){const e=3;return Math.hypot(terrainBase(x+e,z)-terrainBase(x-e,z),terrainBase(x,z+e)-terrainBase(x,z-e))/(2*e);}
function erGrad(x,z){const e=3;return[(terrainBase(x+e,z)-terrainBase(x-e,z))/(2*e),(terrainBase(x,z+e)-terrainBase(x,z-e))/(2*e)];}
// map pixel → world, for the district centres read off the picture
const MP=(px,py)=>[(px-ER_DATA.W/2)*ER.S,(py-ER_DATA.H/2)*ER.S];
// polylines from the map (world metres)
const ER_LINES=ER_DATA.lines;
// nearest point on a polyline set: {x,z,d,seg:[a,b]}
function nearestOnLines(lines,x,z){let best=null;for(const P of lines)for(let i=0;i<P.length-1;i++){const ax=P[i][0],az=P[i][1],bx=P[i+1][0],bz=P[i+1][1];const dx=bx-ax,dz=bz-az,l2=dx*dx+dz*dz||1;const t=clamp(((x-ax)*dx+(z-az)*dz)/l2,0,1);
 const qx=ax+dx*t,qz=az+dz*t,d=Math.hypot(x-qx,z-qz);if(!best||d<best.d)best={x:qx,z:qz,d,a:P[i],b:P[i+1]};}return best;}
const FRAME_HOOKS_PRE_ER=[];
