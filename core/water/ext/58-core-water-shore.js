// ================================================================= WATER - ext: the shore from the ground (an open surface's mask flooded over its ground)
// [G data]: no THREE, no DOM. Adds to WATER (20-core-water.js). Opt-in by path. PRACTICE.md section 2, item 4.
//
// An open surface's mask says which cells it may cover; its visible shore should be where the ground rises over its level. A mask drawn
// from a shape (a lake's ellipse, a zone) stops wherever the shape does, and where the ground there is still under the level the water
// ends on the mask's straight cell edge (eastabyss's mouths and flats: "an unnatural shoreline break"). Flood the mask over the ground
// instead, from the water's own seeds, and dilate it a cell: every edge then lies over ground that rises above the level, which hides
// the water, so the shore the eye sees is the ground's own contour.
//   WATER.maskFromGround({box, cell, level, ground, seed, limit, dilate, eps}) -> a mask record for WATER.open({mask})
//        box [x0, z0, x1, z1], cell (m); level: the water's level (a number) or (x, z) -> y; ground (x, z) -> y
//        seed (x, z) -> bool: where the water certainly is (a lake's inside, a sea's deep side), taken where the ground is under the level
//        limit (x, z) -> bool: where the flood may go (default everywhere; a river's band left to its ribbons, a zone's edge); an edge the
//        limit makes is the only straight edge left, so keep it to where another water owns the ground (WATER.audit's open-edge says so)
//        dilate (1 cell): cells added round the flood, so the mask's half-way line lies over the ground that stops the water; eps (.02 m)
//        -> {x0, z0, cell, nx, nz, data (255 in, 0 out), flooded: the count before dilation, seeds}
(function(){const W=WATER;
 W.maskFromGround=o=>{const b=o.box,c=o.cell,nx=Math.max(1,Math.round((b[2]-b[0])/c)),nz=Math.max(1,Math.round((b[3]-b[1])/c)),N=nx*nz,eps=o.eps==null?.02:o.eps,dil=o.dilate==null?1:o.dilate;
  if(typeof o.ground!=='function')throw new Error('WATER.maskFromGround: ground (x, z) -> y');if(typeof o.seed!=='function')throw new Error('WATER.maskFromGround: seed (x, z) -> bool');
  const X=i=>b[0]+(i+.5)*c,Z=j=>b[1]+(j+.5)*c,lv=typeof o.level==='function'?o.level:()=>o.level==null?0:o.level;
  const under=new Uint8Array(N);for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=X(i),z=Z(j);under[j*nx+i]=o.ground(x,z)<lv(x,z)-eps&&(!o.limit||o.limit(x,z))?1:0;}
  const m=new Uint8Array(N),q=[];let seeds=0;
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i;if(under[k]&&o.seed(X(i),Z(j))){m[k]=1;q.push(k);seeds++;}}
  while(q.length){const k=q.pop(),i=k%nx,j=(k-i)/nx;for(const[di,dj]of[[1,0],[-1,0],[0,1],[0,-1]]){const a=i+di,e=j+dj;if(a<0||e<0||a>=nx||e>=nz)continue;const n=e*nx+a;if(!m[n]&&under[n]){m[n]=1;q.push(n);}}}
  let flooded=0;for(let k=0;k<N;k++)flooded+=m[k];
  // dilate: a cell next to the flood (8 neighbours) joins it, `dil` times
  let cur=m;for(let d=0;d<dil;d++){const nx2=new Uint8Array(cur);for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){if(cur[j*nx+i])continue;
    let hit=0;for(let dj=-1;dj<=1&&!hit;dj++)for(let di=-1;di<=1;di++){const a=i+di,e=j+dj;if(a>=0&&e>=0&&a<nx&&e<nz&&cur[e*nx+a]){hit=1;break;}}if(hit)nx2[j*nx+i]=1;}cur=nx2;}
  const data=new Uint8Array(N);for(let k=0;k<N;k++)data[k]=cur[k]?255:0;
  return{x0:b[0],z0:b[1],cell:c,nx,nz,data,flooded,seeds};};
})();
