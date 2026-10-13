// ================================================================= WATER - data: the six kinds, the surfaces, the CPU twins
// core/water/README.md is the contract; core/atmos/WATER.md the plan. One global, WATER, engine-neutral ([G data]: no THREE,
// no DOM): what a build's water IS (its kinds, levels, swells, beds, river lines), and the CPU twins of what the shaders
// draw, so a hull, a raft or a swimmer rides the surface on screen. The drawing (the CDLOD mesh, the material, the GLSL) is
// 50-core-water-draw.js.
//
// OPEN WATER is the sum the vertex shader draws for a REST point p0 of the mesh:
//   trochoids (Gerstner): p0 moves to p = p0 + m*sum H_i D_i cos(th_i) and rises m*sum A_i sin(th_i), th_i = k_i D_i.p0 - w_i t + ph_i
//   the shared wave field (core/atmos, 89-atmos-a-waves.js): field * ATMOS.waveHeight(p, t, chop), at the moved point p
//   on the level seaLevel(t) (or the surface's own); m is the shallow-water damping from the bed (1 out of a bed's box).
// heightAt(x,z,t) inverts it: Newton finds the rest point that lands on (x,z), then adds the two. ONE CLOCK: every trochoid
// runs a whole number of cycles per ATMOS.PRESETS.waves.period (its deep-water frequency rounded), and its phase is
// written in turns (fract of each term), as the wave field's is, so atmWaveT's wrap is seamless and fp32 never steps.
// Without core/atmos loaded the field is 0 and the period 600 s.
const WATER=(function(){const W={},TAU=Math.PI*2,G=9.81;
 const fr=x=>x-Math.floor(x),cl=(x,a,b)=>x<a?a:x>b?b:x,ss=(a,b,x)=>{const t=cl((x-a)/(b-a),0,1);return t*t*(3-2*t);};
 const AT=()=>typeof ATMOS!=='undefined'&&ATMOS.PRESETS&&ATMOS.PRESETS.waves?ATMOS:null;
 W.ss=ss;W.fr=fr;
 W.KINDS=['open','shore','flow','fall','still','wet'];
 // THE PRESETS (every number the twins and the shaders read; change them before making a surface)
 W.PRESETS={
  // the sea's level in metres; tide {amp, period (s), phase (rad)} or null (TODO.md "Tides"; Phase 2 drives it from core/clock)
  sea:{level:0,tide:null},
  // named swells of trochoids: [amplitude m, wavelength m, direction deg (from +x toward +z), phase rad, steepness 0..1]
  // (sum of steepnesses < 1 or the surface loops). ringsea: the roadstead's four (kits/ringsea, 2026-10)
  swells:{ringsea:[[.28,70,18,0,.32],[.16,43,-34,1.7,.26],[.09,27,71,4.1,.18],[.05,17,-8,2.6,.12]]},
  // an open surface's defaults: field = the share of the shared wave field (0 = trochoids only); chop = the field's chop
  // DISPLACED (0: it only shades, the field's own rule); tilt scales the field's shading slope (times PRESETS.waves.tilt);
  // lod [a,b]: a trochoid's displacement fades out as k*(vertex spacing) goes a..b (a coarse cell cannot draw it);
  // px [a,b]: its shading fades out as k*(metres per pixel) goes a..b (finer than a pixel); damp: metres of depth over
  // which a bed calms the water to nothing at the waterline
  open:{field:1,chop:0,tilt:1,lod:[1.2,2.4],px:[.35,1.1],damp:3},
  // whitecaps from the trochoids' Jacobian J (det of the horizontal map): foam where J falls from j[1] to j[0], kept for
  // `decay` s after (the max over `taps` past times `step` s apart, each weighted exp(-age/decay): the foam a particle
  // carries, with no render target); amount, colour (display sRGB), breakup noise scales [coarse, fine] (1/m)
  foam:{j:[.3,.5],decay:1.8,taps:4,step:.45,amount:.8,color:[.72,.80,.82],noise:[.16,.9]},
  // a bed baked into a depth grid (bytes, so the GPU texture and the CPU twin read the same numbers): R = sqrt map over
  // [deep0, deep1] m, G = linear over [fine0, fine1] m (2 cm steps where the waterline is)
  bed:{cell:5,deep:[-4,40],fine:[-2,3]},
  // the CDLOD water mesh (50-core-water-draw.js): leaf node size m, levels, quads per node side, a node of size s splits
  // when the camera is within range*s/2 of it, and its vertices morph to the next level over the last (1-morph) of range*s
  cdlod:{leaf:8,levels:13,grid:16,range:4.5,morph:.85,maxNodes:2048}};
 W.period=()=>{const A=AT();return A?A.PRESETS.waves.period:600;};
 W.wrap=t=>{const p=W.period();return(t%p+p)%p;};
 W.seaLevel=t=>{const P=W.PRESETS.sea,T=P.tide;return P.level+(T?T.amp*Math.sin(TAU*(t||0)/T.period+(T.phase||0)):0);};
 W.tide=o=>{W.PRESETS.sea.tide=o||null;return W.PRESETS.sea.tide;};
 // a swell list (or a PRESETS.swells name) resolved: wave vector in TURNS per metre (tx, tz), whole cycles per period (n, tc)
 W.swell=list=>{if(typeof list==='string')list=W.PRESETS.swells[list];const per=W.period();
  return(list||[]).map(([A,lam,deg,ph,st])=>{const k=TAU/lam,a=deg*Math.PI/180,n=Math.max(1,Math.round(Math.sqrt(G*k)*per/TAU));
   return{A,lam,k,dx:Math.cos(a),dz:Math.sin(a),H:(st||0)/k,ph:ph||0,n,tx:k*Math.cos(a)/TAU,tz:k*Math.sin(a)/TAU,tc:n/per};});};
 const th=(w,x,z,t)=>TAU*(fr(x*w.tx)+fr(z*w.tz)-fr(t*w.tc))+w.ph;

 // ---- the trochoids' twins (the GLSL in 50 is written from the same records)
 // displacement of the rest point (x0,z0) at t: [dx, h, dz, Jxx, Jxz, Jzz], each wave faded by k*sp (sp: the mesh's vertex
 // spacing; 0 = a fine mesh, everything drawn)
 W.troD=(S,x0,z0,t,sp)=>{let dx=0,h=0,dz=0,jxx=1,jxz=0,jzz=1;const L=S.lod;
  for(const w of S.waves){const l=1-ss(L[0],L[1],w.k*(sp||0)),a=th(w,x0,z0,t),c=Math.cos(a),s=Math.sin(a),q=w.H*w.k*s*l;
   h+=w.A*s*l;dx+=w.H*w.dx*c*l;dz+=w.H*w.dz*c*l;jxx-=q*w.dx*w.dx;jxz-=q*w.dx*w.dz;jzz-=q*w.dz*w.dz;}
  return[dx,h,dz,jxx,jxz,jzz];};
 // the shading frame at the rest point: [nx,ny,nz,J], each wave faded by k*mpp (metres per pixel); the fragment's wtrTroNJ
 W.troNJ=(S,x0,z0,t,mpp)=>{const g=[1,0,0],k=[0,0,1],L=S.px;
  for(const w of S.waves){const a=th(w,x0,z0,t),c=Math.cos(a),s=Math.sin(a),l=1-ss(L[0],L[1],w.k*(mpp||0)),q=w.H*w.k*s*l;
   g[0]-=q*w.dx*w.dx;g[1]+=c*w.A*w.k*w.dx*l;g[2]-=q*w.dx*w.dz;k[0]-=q*w.dx*w.dz;k[1]+=c*w.A*w.k*w.dz*l;k[2]-=q*w.dz*w.dz;}
  const n=[k[1]*g[2]-k[2]*g[1],k[2]*g[0]-k[0]*g[2],k[0]*g[1]-k[1]*g[0]],m=Math.hypot(n[0],n[1],n[2]);
  return[n[0]/m,n[1]/m,n[2]/m,g[0]*k[2]-g[2]*k[0]];};
 // the whitecap at the rest point: the Jacobian's foam now and at `taps` past times, decayed (the fragment's wtrFoam, without
 // its breakup noise)
 W.cap=J=>{const F=W.PRESETS.foam;return 1-ss(F.j[0],F.j[1],J);};
 W.foamAt=(S,x0,z0,t,mpp)=>{const F=W.PRESETS.foam;let f=0;
  for(let i=0;i<F.taps;i++)f=Math.max(f,W.cap(W.troNJ(S,x0,z0,t-i*F.step,mpp)[3])*Math.exp(-i*F.step/F.decay));return f;};

 // ---- a bed: depth below the surface's base level, baked to bytes over a box (the shallows' tint, the damping, the surf)
 W.bakeBed=(bed,box,level,cell)=>{const P=W.PRESETS.bed,c=cell||P.cell,nx=Math.max(2,Math.ceil((box[2]-box[0])/c)),nz=Math.max(2,Math.ceil((box[3]-box[1])/c)),
   data=new Uint8Array(nx*nz*4),D=P.deep,F=P.fine;
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const d=level-bed(box[0]+(i+.5)*c,box[1]+(j+.5)*c),o=(j*nx+i)*4;
   data[o]=Math.round(255*Math.sqrt(cl((d-D[0])/(D[1]-D[0]),0,1)));data[o+1]=Math.round(255*cl((d-F[0])/(F[1]-F[0]),0,1));data[o+2]=0;data[o+3]=255;}
  return{x0:box[0],z0:box[1],cell:c,nx,nz,data,level};};
 // the two channels -> metres (the GLSL's wtrBedDecode): the fine channel where it is not clamped, the deep one elsewhere
 // a mask's value at (x,z): its bytes bilinear over the cell centres (clamped), 0 outside it (the GLSL's wtrMaskOk)
 W.maskSample=(M,x,z)=>{const u=(x-M.x0)/(M.cell*M.nx),v=(z-M.z0)/(M.cell*M.nz);if(u<0||v<0||u>1||v>1)return 0;
  const fx=u*M.nx-.5,fz=v*M.nz-.5,i0=Math.floor(fx),j0=Math.floor(fz),ax=fx-i0,az=fz-j0,ch=(i,j)=>M.data[cl(j,0,M.nz-1)*M.nx+cl(i,0,M.nx-1)]/255;
  return(ch(i0,j0)*(1-ax)+ch(i0+1,j0)*ax)*(1-az)+(ch(i0,j0+1)*(1-ax)+ch(i0+1,j0+1)*ax)*az;};
 W.bedDecode=(r,g)=>{const P=W.PRESETS.bed,D=P.deep,F=P.fine;return(g>.004&&g<.996)?F[0]+g*(F[1]-F[0]):D[0]+r*r*(D[1]-D[0]);};
 // a shore grid's (21-core-water-shore.js): the linear mid channel (A), the deep one (R) past its top
 W.bedDecodeShore=(r,g,a)=>{const M=W.PRESETS.shore.mid,D=W.PRESETS.bed.deep;return a<.996?M[0]+a*(M[1]-M[0]):D[0]+r*r*(D[1]-D[0]);};
 // depth at (x,z): bilinear over the texel centres as the GPU filters (clamped at the edges), deep outside the box
 W.bedDepth=(B,x,z)=>{const u=(x-B.x0)/(B.cell*B.nx),v=(z-B.z0)/(B.cell*B.nz);if(u<0||v<0||u>1||v>1)return W.PRESETS.bed.deep[1];
  const fx=u*B.nx-.5,fz=v*B.nz-.5,i0=Math.floor(fx),j0=Math.floor(fz),ax=fx-i0,az=fz-j0,ch=(i,j,k)=>B.data[(cl(j,0,B.nz-1)*B.nx+cl(i,0,B.nx-1))*4+k]/255;
  const bl=k=>(ch(i0,j0,k)*(1-ax)+ch(i0+1,j0,k)*ax)*(1-az)+(ch(i0,j0+1,k)*(1-ax)+ch(i0+1,j0+1,k)*ax)*az;return B.shore?W.bedDecodeShore(bl(0),bl(1),bl(3)):W.bedDecode(bl(0),bl(1));};

 // ---- the surfaces
 W.surfaces=[];
 const add=S=>{S.id=W.surfaces.length;S.name=S.name||S.kind+' '+S.id;W.surfaces.push(S);return S;};
 const inBox=(b,x,z)=>!b||(x>=b[0]&&z>=b[1]&&x<=b[2]&&z<=b[3]);
 // OPEN: {name, level (number; omitted = seaLevel(t)), swell (name or list), field, chop, tilt, bounds [x0,z0,x1,z1] (omitted =
 // everywhere), bed (x,z)=>ground y, bedBox (default bounds), bedCell}
 W.open=o=>{o=o||{};const P=W.PRESETS.open,S={kind:'open',name:o.name,swellSpec:o.swell||null,waves:W.swell(o.swell),
   field:o.field==null?P.field:o.field,chop:o.chop==null?P.chop:o.chop,tilt:o.tilt==null?P.tilt:o.tilt,lod:o.lod||P.lod,px:o.px||P.px,
   dampDepth:o.damp==null?P.damp:o.damp,bounds:o.bounds||null,level:o.level==null?null:o.level};
  S.levelAt=t=>S.level==null?W.seaLevel(t):S.level;
  S.base=S.levelAt(0);
  // a shore WINDOW (21-core-water-shore.js): a shore grid of `window` m square that follows the camera (WATER.moveShore,
  // WATER.shoreJob), for water too big to grid whole (a sea, a lake at 1:1); until its first bake the grid is open water
  if(o.shore&&o.shore.window){const H=o.shore,c0=H.cell==null?W.PRESETS.shore.cell:H.cell,n=Math.max(2,Math.round(H.window/c0));
   S.shoreWin={n,cell:H.window/n,ground:o.bed,seeds:H.seeds,land:H.land,band:H.band==null?W.PRESETS.shore.band:H.band,clip:H.clip};S.bed=W.shoreBlank(S);}
  else if(o.bed){const b=o.bedBox||o.bounds;if(!b)throw new Error('WATER.open: a bed needs bedBox or bounds');
   // with `shore` (21-core-water-shore.js) the bed is a shore grid: the same depth bytes, plus the flood and the distance
   const H=o.shore;S.bed=H?W.shoreGrid({ground:o.bed,level:S.base,box:b,cell:H.cell==null?o.bedCell:H.cell,seeds:H.seeds,land:H.land,band:H.band,clip:H.clip}):W.bakeBed(o.bed,b,S.base,o.bedCell);}
  // a MASK: a coarse raster of the cells this water may cover ({x0, z0, cell, nx, nz, data: a byte per cell, > 127 = may}),
  // so a sea or a lake drawn by one surface keeps off every basin that is not its own (the drawing discards the rest, the
  // CDLOD selection drops nodes over none of its cells); S.maskAt is its twin (bilinear over the cells, as the GPU filters)
  if(o.mask){const M=o.mask,sat=new Int32Array((M.nx+1)*(M.nz+1));
   for(let j=0;j<M.nz;j++){let row=0;for(let i=0;i<M.nx;i++){row+=M.data[j*M.nx+i]>127?1:0;sat[(j+1)*(M.nx+1)+i+1]=sat[j*(M.nx+1)+i+1]+row;}}
   S.mask={x0:M.x0,z0:M.z0,cell:M.cell,nx:M.nx,nz:M.nz,data:M.data,sat};
   S.maskAt=(x,z)=>W.maskSample(S.mask,x,z)>.5;
   S.maskIn=(x0,z0,x1,z1)=>{const G=S.mask,c=G.cell,i0=cl(Math.floor((x0-G.x0)/c),0,G.nx),j0=cl(Math.floor((z0-G.z0)/c),0,G.nz),i1=cl(Math.ceil((x1-G.x0)/c),0,G.nx),j1=cl(Math.ceil((z1-G.z0)/c),0,G.nz);
    if(i1<=i0||j1<=j0)return false;const T=G.sat,w=G.nx+1;return T[j1*w+i1]-T[j0*w+i1]-T[j1*w+i0]+T[j0*w+i0]>0;};}
  S.shore=!!(S.bed&&S.bed.shore);
  // depth below the surface at (x,z) and t; the damping it gives (1 where there is no bed); on a shore grid the waves
  // also shoal (Green's law) before they calm
  S.depthAt=(x,z,t)=>S.bed?S.levelAt(t)-S.base+W.bedDepth(S.bed,x,z):1e9;
  S.damp=S.bed?(S.shore?(x,z,t)=>{const d=S.depthAt(x,z,t);return ss(0,S.dampDepth,d)*W.shoalK(d);}:(x,z,t)=>ss(0,S.dampDepth,S.depthAt(x,z,t))):null;
  // the rest point that the trochoids carry to (x,z): Newton on p0 + m*d(p0) = p (m held per step)
  S.rest=(x,z,t,n)=>{let x0=x,z0=z;if(!S.waves.length)return[x,z];
   for(let i=0;i<(n||5);i++){const d=W.troD(S,x0,z0,t,0),m=S.damp?S.damp(x0,z0,t):1,a=1+(d[3]-1)*m,b=d[4]*m,c=1+(d[5]-1)*m,det=a*c-b*b,rx=x0+d[0]*m-x,rz=z0+d[2]*m-z;
    x0-=(c*rx-b*rz)/det;z0-=(a*rz-b*rx)/det;}return[x0,z0];};
  // the drawn surface at a REST point: [x, y, z, m] (the vertex shader's wtrSurface with a fine mesh)
  S.surfaceAt=(x0,z0,t,sp)=>{const d=W.troD(S,x0,z0,t,sp),m=S.damp?S.damp(x0,z0,t):1,x=x0+d[0]*m,z=z0+d[2]*m,A=AT();
   const f=S.field&&A?S.field*A.waveHeight(x,z,t,S.chop*(1-ss(S.lod[0],S.lod[1],S.kChop*(sp||0)))):0;return[x,S.levelAt(t)+(d[1]+f)*m+(S.shore?S.surfAt(x,z,t):0),z,m];};
  // the breakers (a shore grid): their height at a world point, their foam, the beach's wetness
  if(S.shore){S.surfAt=(x,z,t)=>W.surfAt(S.bed,x,z,t,S.depthAt(x,z,t));S.surfFoamAt=(x,z,t)=>W.surfFoamAt(S.bed,x,z,t,S.depthAt(x,z,t));
   S.shoreDist=(x,z)=>W.shoreDist(S.bed,x,z);S.wetAt=(x,z)=>S.shoreDist(x,z)>-S.bed.clip*S.bed.cell;
   S.wetGroundAt=(x,z,gy,t)=>W.wetGroundAt(S.bed,x,z,gy,t,S.levelAt(t));
   // does any cell the surface may draw over meet the box [x0,z0,x1,z1]? (the CDLOD selection drops nodes that hold none)
   S.wetIn=(x0,z0,x1,z1)=>{const G=S.bed,c=G.cell,i0=cl(Math.floor((x0-G.x0)/c),0,G.nx),j0=cl(Math.floor((z0-G.z0)/c),0,G.nz),i1=cl(Math.ceil((x1-G.x0)/c),0,G.nx),j1=cl(Math.ceil((z1-G.z0)/c),0,G.nz);
    if(x1<G.x0||z1<G.z0||x0>G.x0+c*G.nx||z0>G.z0+c*G.nz)return true;if(i1<=i0||j1<=j0)return false;const T=G.sat,w=G.nx+1;return T[j1*w+i1]-T[j0*w+i1]-T[j1*w+i0]+T[j0*w+i0]>0;};}
  S.kChop=(()=>{const A=AT();return A?Math.max(...A.PRESETS.waves.chop.map(w=>Math.hypot(w[0],w[1]))):0;})();
  S.heightAt=(x,z,t)=>{const p=S.rest(x,z,t);return S.surfaceAt(p[0],p[1],t,0)[1];};
  // the shading normal at world (x,z) for a camera camDist away and a pixel of mpp metres (the fragment's wtrNormal)
  S.normalAt=(x,z,t,camDist,mpp)=>{const p=S.rest(x,z,t),nj=W.troNJ(S,p[0],p[1],t,mpp),m=S.damp?S.damp(p[0],p[1],t):1,A=AT();
   let sx=-nj[0]/nj[1],sz=-nj[2]/nj[1];if(S.field&&A){const w=A.waveSlope(x,z,t,camDist),k=S.field*S.tilt*A.PRESETS.waves.tilt;sx+=w[0]*k;sz+=w[1]*k;}
   sx*=m;sz*=m;if(S.shore){const g=W.surfSlope(S,x,z,t);sx+=g[0];sz+=g[1];}const l=Math.hypot(sx,1,sz);return[-sx/l,1/l,-sz/l];};
  S.contains=S.shore||S.mask?(x,z)=>inBox(S.bounds,x,z)&&(!S.mask||S.maskAt(x,z))&&(!S.shore||S.wetAt(x,z)):(x,z)=>inBox(S.bounds,x,z);
  // the most the surface can rise or fall from its level (the CDLOD mesh's node boxes)
  S.amp=S.waves.reduce((a,w)=>a+w.A+w.H,0)+(S.field&&AT()?S.field*AT().PRESETS.waves.amp*4:0)+.5;
  return add(S);};
 // SHORE (Phase 2): the band within `band` m of land on an open surface: a distance field on the land mask (core/mask), the
 // breaking lip, swash and wet sand. Recorded now so a build can name it; its height is its open water's.
 W.shore=o=>{const S={kind:'shore',name:o.name,of:o.of,band:o.band||100,land:o.land||null,todo:'Phase 2: the distance field'};
  S.heightAt=(x,z,t)=>S.of.heightAt(x,z,t);S.contains=(x,z)=>S.of.contains(x,z);return add(S);};
 // FLOW: a river line [[x,z,y],...] or KRELIEF.river's [{x,z,y,slope}], width m (number or per point), speed m/s at the
 // line (number or per point). flowAt is the current along the nearest segment, heightAt the line's surface there.
 W.flow=o=>{const pts=(o.river||o.pts).map(p=>Array.isArray(p)?{x:p[0],z:p[1],y:p[2]}:{x:p.x,z:p.z,y:p.y});
  const per=(v,i,d)=>v==null?d:Array.isArray(v)?v[i]:v;
  for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[Math.min(i+1,pts.length-1)],c=pts[Math.max(i-1,0)],L=Math.hypot(b.x-a.x,b.z-a.z);
   a.slope=L>0?(a.y-b.y)/L:(i?pts[i-1].slope:0);a.w=per(o.width,i,6);a.v=per(o.speed,i,1);void c;}
  const S={kind:'flow',name:o.name,pts};
  S.nearest=(x,z)=>{let best=null;for(let i=0;i+1<pts.length;i++){const a=pts[i],b=pts[i+1],ex=b.x-a.x,ez=b.z-a.z,L2=ex*ex+ez*ez||1,u=cl(((x-a.x)*ex+(z-a.z)*ez)/L2,0,1),
     px=a.x+ex*u,pz=a.z+ez*u,d=Math.hypot(x-px,z-pz);if(!best||d<best.d)best={i,u,d,ex,ez,L:Math.sqrt(L2),a,b};}return best;};
  S.contains=(x,z)=>{const n=S.nearest(x,z);return!!n&&n.d<=(n.a.w+(n.b.w-n.a.w)*n.u)/2;};
  S.heightAt=(x,z)=>{const n=S.nearest(x,z);return n.a.y+(n.b.y-n.a.y)*n.u;};
  // [vx, vz, speed, slope]
  S.flowAt=(x,z)=>{const n=S.nearest(x,z);if(!n)return[0,0,0,0];const v=n.a.v+(n.b.v-n.a.v)*n.u;return[n.ex/n.L*v,n.ez/n.L*v,v,n.a.slope];};
  return add(S);};
 // FALL: a lip [[x,z,y],[x,z,y]] the water leaves at `speed` m/s along `dir` [dx,dz] (unit), dropping `drop` m. The curtain
 // ARCS: at lip fraction u and time s after the lip the water is lip + dir*speed*s, g*s^2/2 lower (22 and 51 mesh and draw it);
 // plunge [x,y,z] the pool's centre (default: the curtain's foot); spread m wider a side at the foot
 W.fall=o=>{const S={kind:'fall',name:o.name,lip:o.lip,dir:o.dir,speed:o.speed||1.5,drop:o.drop,plunge:o.plunge||null};
  S.tFall=Math.sqrt(2*S.drop/G);
  // the lip's width, and how much wider the curtain is at its foot (m a side: o.spread, else PRESETS.fall.spread per 100 m of
  // drop when 22-core-water-flow.js is loaded)
  const la=S.lip[0],lb=S.lip[S.lip.length-1];S.lipW=Math.hypot(lb[0]-la[0],lb[1]-la[1]);
  S.spread=o.spread!=null?o.spread:W.PRESETS.fall?W.PRESETS.fall.spread*S.drop/100:0;
  const lx=S.lipW>0?(lb[0]-la[0])/S.lipW:0,lz=S.lipW>0?(lb[1]-la[1])/S.lipW:0;
  S.curtainAt=(u,f)=>{const a=S.lip[0],b=S.lip[S.lip.length-1],s=f*S.tFall,q=(u*2-1)*S.spread*f;return[a[0]+(b[0]-a[0])*u+S.dir[0]*S.speed*s+lx*q,a[2]+(b[2]-a[2])*u-G*s*s/2,a[1]+(b[1]-a[1])*u+S.dir[1]*S.speed*s+lz*q];};
  // the curtain's normal at fall fraction f: across the lip x along the arc, turned to face out (the way the water goes) and up
  S.curtainNormal=f=>{const s=f*S.tFall,T=[S.dir[0]*S.speed,-G*s,S.dir[1]*S.speed],n=[T[1]*lz-T[2]*0,T[2]*lx-T[0]*lz,T[0]*0-T[1]*lx],m=Math.hypot(n[0],n[1],n[2])||1,sg=(n[0]*S.dir[0]+n[2]*S.dir[1]+n[1]*1e-6)<0?-1:1;
   return[sg*n[0]/m,sg*n[1]/m,sg*n[2]/m];};
  S.contains=()=>false;S.heightAt=()=>null;return add(S);};
 // STILL: pools, fountains, troughs, cisterns, moats: a level over a box (or a polygon [[x,z],...])
 W.still=o=>{const S={kind:'still',name:o.name,level:o.level,bounds:o.bounds||null,poly:o.poly||null,fountain:o.fountain||null};
  S.contains=(x,z)=>{if(S.poly){let c=false;const P=S.poly;for(let i=0,j=P.length-1;i<P.length;j=i++)if((P[i][1]>z)!==(P[j][1]>z)&&x<(P[j][0]-P[i][0])*(z-P[i][1])/(P[j][1]-P[i][1])+P[i][0])c=!c;return c;}return inBox(S.bounds,x,z);};
  S.heightAt=()=>S.level;S.normalAt=(x,z,t)=>W.stillNormal?W.stillNormal(S,x,z,t):[0,1,0];return add(S);};
 // WET (Phase 4): how wet the ground is, 0..1: the weather's W.wet (core/atmos 4-weather) when a build has it
 W.wet=()=>{const A=AT();return A&&A.W?A.W.wet||0:0;};

 // ---- the queries: the surface over (x,z) (still, flow, a bounded open water, then the unbounded sea), its height, its flow
 const RANK={still:0,flow:1,open:2,shore:3};
 W.at=(x,z)=>{let best=null,r=9;for(const S of W.surfaces){const k=(RANK[S.kind]==null?9:RANK[S.kind])+(S.kind==='open'&&!S.bounds?.5:0);if(k<r&&S.contains(x,z)){best=S;r=k;}}return best;};
 W.heightAt=(x,z,t)=>{const S=W.at(x,z);return S?S.heightAt(x,z,t):null;};
 W.flowAt=(x,z)=>{for(const S of W.surfaces)if(S.kind==='flow'&&S.contains(x,z))return S.flowAt(x,z);return[0,0,0,0];};

 // ---- floating: a hull of length L and beam B at (x,z), heading yaw, on the water at t (heights from hFn, default
 // WATER.heightAt). Heave is the mean of five samples (amidships twice, bow, stern, both beams), pitch and roll the slopes
 // between them, so a long hull averages short waves out and a canoe follows them. heel (rad) adds to the roll: + lays the
 // starboard side down. From the Ring Sea kit's rsRide. -> {x,y,z, rx,ry,rz} (Euler 'YXZ')
 W.rideAt=(L,B,x,z,yaw,t,heel,hFn)=>{const H=hFn||W.heightAt,lx=L*.36,bz=cl(B*.28,.5,6),c=Math.cos(yaw||0),s=Math.sin(yaw||0);
  const at=(f,q)=>{const v=H(x+c*f+s*q,z-s*f+c*q,t);return v==null?W.seaLevel(t):v;};
  const h0=at(0,0),hb=at(lx,0),hs=at(-lx,0),hst=at(0,bz),hp=at(0,-bz);
  return{x,y:(2*h0+hb+hs+hst+hp)/6,z,rx:-Math.atan2(hst-hp,2*bz)+(heel||0),ry:yaw||0,rz:Math.atan2(hb-hs,2*lx)};};
 // the same, applied to anything with position.set and rotation.set(x,y,z,order) (a three.js Object3D); D = {L, B}
 W.ride=(G,D,x,z,yaw,t,heel,hFn)=>{const r=W.rideAt(D.L,D.B,x,z,yaw,t,heel,hFn);G.position.set(r.x,r.y,r.z);G.rotation.set(r.rx,r.ry,r.rz,'YXZ');return r;};

 // ---- export: every surface as plain data (core/export; Godot rebuilds the twins from it)
 W.export=()=>({presets:JSON.parse(JSON.stringify(W.PRESETS)),period:W.period(),surfaces:W.surfaces.map(S=>{const o={kind:S.kind,name:S.name};
  if(S.kind==='open')Object.assign(o,{level:S.level,swell:S.swellSpec,waves:S.waves.map(w=>({A:w.A,lambda:w.lam,dir:[w.dx,w.dz],H:w.H,phase:w.ph,cycles:w.n})),field:S.field,chop:S.chop,tilt:S.tilt,bounds:S.bounds,
   bed:S.bed?{x0:S.bed.x0,z0:S.bed.z0,cell:S.bed.cell,nx:S.bed.nx,nz:S.bed.nz,level:S.bed.level}:null},
   // a shore grid (Phase 2): the bed's B channel is the signed shore distance over [-band, band]; clip in cells
   S.shore?{shore:{band:S.bed.band,clip:S.bed.clip,seeded:S.bed.seeded,wetCells:S.bed.wetCells,window:S.shoreWin?S.shoreWin.n*S.shoreWin.cell:null}}:{},
   S.mask?{mask:{x0:S.mask.x0,z0:S.mask.z0,cell:S.mask.cell,nx:S.mask.nx,nz:S.mask.nz}}:{});
  else if(S.kind==='flow')Object.assign(o,{pts:S.pts.map(p=>[p.x,p.z,p.y,p.slope,p.w,p.v])},S.ribbonOpt?{ribbon:S.ribbonOpt}:{});
  else if(S.kind==='fall')Object.assign(o,{lip:S.lip,dir:S.dir,speed:S.speed,drop:S.drop,plunge:S.plunge,spread:S.spread,tFall:S.tFall,lipW:S.lipW},S.curtainOpt?{curtain:S.curtainOpt}:{});
  else if(S.kind==='still')Object.assign(o,{level:S.level,bounds:S.bounds,poly:S.poly,fountain:S.fountain});
  else if(S.kind==='shore')Object.assign(o,{of:S.of.id,band:S.band});return o;})});
 return W;})();
