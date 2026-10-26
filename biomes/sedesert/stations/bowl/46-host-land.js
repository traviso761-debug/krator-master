// ================================================================= HOST — the land (the Bowl's stations, shared)
// The channels' grid, the baked ground, the local water, the fields' cache and the binding, for any station of the Bowl: its
// 45-host-stage.js gives the layout (STATION, LAKE, zS/uOf, CHAN with their levels, groundH, extraH, fieldsAt, FNAMES, SPINE).
// the channels stamped into a grid (4 m): for each cell the nearest channel's u (distance over half-width), its water level
// and half-width, so the ground, the water and the plants read a channel in one lookup
const CHG=(function(){const c=4,x0=STATION.chanBox[0],z0=STATION.chanBox[1],x1=STATION.chanBox[2],z1=STATION.chanBox[3],nx=Math.ceil((x1-x0)/c)+1,nz=Math.ceil((z1-z0)/c)+1;
 const U=new Float32Array(nx*nz).fill(99),Y=new Float32Array(nx*nz).fill(LAKE.level),HW=new Float32Array(nx*nz).fill(10),ID=new Uint8Array(nx*nz).fill(255);
 CHAN.forEach((C,ci)=>{const hw=C.w/2,P=C.pts;for(let k=0;k<P.length-1;k++){const a=P[k],b=P[k+1],ya=C.y[k],yb=C.y[k+1],rr2=Math.max(hw*3.2,STATION.chanReach||0);   /* chanReach: how far out a station reads its channels (Mantis's galleries) */
  const i0=Math.max(0,Math.floor((Math.min(a[0],b[0])-rr2-x0)/c)),i1=Math.min(nx-1,Math.ceil((Math.max(a[0],b[0])+rr2-x0)/c)),
   j0=Math.max(0,Math.floor((Math.min(a[1],b[1])-rr2-z0)/c)),j1=Math.min(nz-1,Math.ceil((Math.max(a[1],b[1])+rr2-z0)/c));
  const dx=b[0]-a[0],dz=b[1]-a[1],L2=dx*dx+dz*dz||1;
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const x=x0+i*c,z=z0+j*c,t=clamp(((x-a[0])*dx+(z-a[1])*dz)/L2,0,1),d=Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t),u=d/hw,q=j*nx+i;
   if(u<U[q]){U[q]=u;Y[q]=ya+(yb-ya)*t;HW[q]=hw;ID[q]=ci;}}}});
 const o={x0,z0,c,nx,nz,U,Y,HW,ID};
 // bilinear u and level at a point; out.id the nearest cell's channel (255: none)
 o.at=function(x,z,out){out=out||{};const fx=(x-x0)/c,fz=(z-z0)/c;if(fx<0||fz<0||fx>=nx-1||fz>=nz-1){out.u=99;out.y=LAKE.level;out.hw=10;out.id=255;return out;}
  const i=Math.floor(fx),j=Math.floor(fz),s=fx-i,t=fz-j,q=j*nx+i,w0=(1-s)*(1-t),w1=s*(1-t),w2=(1-s)*t,w3=s*t;
  out.u=U[q]*w0+U[q+1]*w1+U[q+nx]*w2+U[q+nx+1]*w3;out.y=Y[q]*w0+Y[q+1]*w1+Y[q+nx]*w2+Y[q+nx+1]*w3;out.hw=HW[q]*w0+HW[q+1]*w1+HW[q+nx]*w2+HW[q+nx+1]*w3;
  out.id=ID[s<.5?(t<.5?q:q+nx):(t<.5?q+1:q+nx+1)];return out;};
 return o;})();
const _ch={};
// ---------------------------------------------------------------- terrain
// THE GROUND IS A BAKED FIELD (core/terrain/30-core-field.js), as the kit's: terrainH0 paints it once at load, terrainH and
// everything that roots or draws reads the field, and BIO.export hands it to Godot. The order: the station's ground (groundH),
// the channels cut into it with their levees, then what stands on it (extraH).
function terrainH0(x,z){let h=groundH(x,z);
 const C=CHG.at(x,z,_ch);
 if(C.u<2.4){const cut=C.u<1?C.y+.12-CHAN[C.id===255?0:C.id].depth*(1-C.u*C.u):C.y+.12+(h-C.y-.12)*smooth(1,1.7,C.u);
  h=Math.min(h,cut);const lv=C.u-1.55;h+=.38*Math.exp(-lv*lv/.12)*smooth(-60,40,uOf(x,z));}   /* the levees */
 return h+extraH(x,z,h);}
// the ground mesh's lattice (the station's: the Bowl's is 640 cells over the map, 10.3 m, each cell in the delta's window split in
// two, 5.2 m, so the distributaries and their levees are resolved)
const GRID={N:STATION.grid.N,S:TERR.R*2.2,M:STATION.grid.M,win:STATION.grid.win};GRID.cs=GRID.S/GRID.N;
GRID.cells=(lo,hi)=>{let a0=null,a1=null;for(let i=0;i<GRID.N;i++){const a=-GRID.S/2+i*GRID.cs;if(a+GRID.cs>lo&&a<hi){if(a0===null)a0=a;a1=a+GRID.cs;}}return[a0,a1];};
// the station's own still water (a spring's pool), when it has any: STATION.pool(x,z) -> level or -1e9
const poolAt=STATION.pool||((x,z)=>-1e9);
function waterAt0(x,z){const u=uOf(x,z);if(u<260){const h=terrainH0(x,z);if(h<LAKE.level+.02||u<0)return LAKE.level;}
 const C=CHG.at(x,z,_ch);return C.u<1.08?C.y:poolAt(x,z);}
const TFIELD=(function(){const t0=performance.now(),S=GRID.S;
 const f=KFIELD.bake(terrainH0,[-S/2,-S/2,S/2,S/2],GRID.cs/2,{name:STATION.tags,
  water:{lake:(x,z)=>uOf(x,z)<260?LAKE.level:NaN,delta:(x,z)=>{const C=CHG.at(x,z,_ch);return C.u<1.08?C.y:NaN;}},
  waterBox:{lake:[-S/2,-S/2,S/2,Math.min(S/2,Math.max(...[-S/2,-S/4,0,S/4,S/2].map(x=>zS(x)))+400)],delta:[CHG.x0,CHG.z0,CHG.x0+CHG.c*(CHG.nx-1),CHG.z0+CHG.c*(CHG.nz-1)]}});
 window._field={step:f.step,nx:f.nx,nz:f.nz,ms:Math.round(performance.now()-t0)};return f;})();
_mark('field');
function terrainH(x,z){return TFIELD.h(x,z);}
const _tm={x:NaN,z:NaN,h:0};
function placeH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=terrainH0(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
// the local water: the lake where the ground is under its level near the shore, a channel's surface inside its banks
function waterH(x,z){const u=uOf(x,z);if(u<0)return LAKE.level;if(u<260&&terrainH(x,z)<LAKE.level+.02)return LAKE.level;
 const C=CHG.at(x,z,_ch);return C.u<1.08?C.y:poolAt(x,z);}
const FC=(function(){const N=420,S=TERR.R*2.2,a={};FNAMES.forEach(n=>a[n]=new Float32Array(N*N));a.h=new Float32Array(N*N);
 const cs=S/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){a.h[j*N+i]=terrainH((i/(N-1)-.5)*S,(j/(N-1)-.5)*S);}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=(i/(N-1)-.5)*S,z=(j/(N-1)-.5)*S,k=j*N+i;
  const hx=a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)],hz=a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i],slope=clamp(Math.hypot(hx,hz)/(2*cs)*1.6,0,1);
  const F=fieldsAt(x,z,a.h[k],slope);FNAMES.forEach(n=>a[n][k]=F[n]);}
 const L={x:NaN,z:NaN,k:0,fu:0,fv:0};
 const at=(arr,x,z)=>{if(x!==L.x||z!==L.z){const u=clamp((x/S+.5)*(N-1),0,N-1.001),v=clamp((z/S+.5)*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v);L.x=x;L.z=z;L.k=j*N+i;L.fu=u-i;L.fv=v-j;}
  const k=L.k,fu=L.fu,fv=L.fv;return arr[k]*(1-fu)*(1-fv)+arr[k+1]*fu*(1-fv)+arr[k+N]*(1-fu)*fv+arr[k+N+1]*fu*fv;};
 return{N,S,a,at};})();
const FIELD={};FNAMES.forEach(n=>FIELD[n]=(x,z)=>FC.at(FC.a[n],x,z));_mark('fields');
// a channel at a point, for the passes that want it sharper than the 15.7 m field cache: {u, y, hw, id}
const chanAt=(x,z)=>CHG.at(x,z,{});

// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
BIO.init({tags:STATION.tags,THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,field:TFIELD,placeH:placeH,
 mask:(x,z)=>{const d=placeH(x,z)-waterAt0(x,z);return d<.12?0:d<.5?(d-.12)/.38:1;},
 obstacles:OBSTACLES,ticks:tick,seed:STATION.seed,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:STATION.lod,
 windows:{water:STATION.water}});   /* the channels and the shore: the water-bound passes look nowhere else */
BIO.setSun(STATION.sun);
_mark('stage');
