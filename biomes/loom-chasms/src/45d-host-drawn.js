// ================================================================= HOST — the ground AS DRAWN: its height and rays at its triangles
// The round's lesson (the painting-to-3d-world skill, stories-rounds 5w): cameras, anchors and anything hung on rock go on the DRAWN mesh, not on
// terrainH. A slot's sheer wall is 180 m over two or three of the ground's cells: between its vertices the drawn triangles and terrainH part by tens of
// metres. So the cables' anchors and the wall plants are seated by rays at the ground mesh's own triangles, and the cameras stand on them.
//   drawnH(x, z)            the ground mesh's height at (x, z): the cell's triangle (45: a-b-d and b-c-d), interpolated
//   solidH(x, z)            the highest drawn thing under (x, z): the ground mesh or a rock body's top (KSTACKS)
//   drawnRay(o, d, far)     the first hit of the ray o + t d (d a unit vector) on the drawn ground within far metres, or null:
//                           {t, p:[x, y, z], n:[nx, ny, nz] (the triangle's normal, up-facing)}. BUCKETED BY CELL: the ray steps a third of a
//                           cell at a time and is only tested against the drawn surface under it (never a whole-mesh raycast: the round's
//                           finding, whole-mesh rays tripled two builds), then bisected on the crossing to a centimetre
const DRAWN=(function(){const g=GROUND.geometry,p=g.attributes.position.array,S=TERR.R*2.2,N=ST_GROUND_N(),cs=S/N,nx=N+1;
 const Y=(i,j)=>p[(j*nx+i)*3+1];
 function cellOf(x,z){const u=clamp((x+S/2)/cs,0,N-1e-6),v=clamp((z+S/2)/cs,0,N-1e-6),i=Math.floor(u),j=Math.floor(v);return{i,j,fu:u-i,fv:v-j};}
 function h(x,z){const c=cellOf(x,z),a=Y(c.i,c.j),b=Y(c.i,c.j+1),cc=Y(c.i+1,c.j+1),d=Y(c.i+1,c.j);
  return c.fu+c.fv<=1?a+(d-a)*c.fu+(b-a)*c.fv:cc+(b-cc)*(1-c.fu)+(d-cc)*(1-c.fv);}
 function normal(x,z){const c=cellOf(x,z),a=Y(c.i,c.j),b=Y(c.i,c.j+1),cc=Y(c.i+1,c.j+1),d=Y(c.i+1,c.j);let gx,gz;
  if(c.fu+c.fv<=1){gx=(d-a)/cs;gz=(b-a)/cs;}else{gx=(cc-b)/cs;gz=(cc-d)/cs;}const l=Math.hypot(gx,1,gz);return[-gx/l,1/l,-gz/l];}
 function ray(o,d,far){const st=cs/3,F=far==null?3000:far,half=S/2;let t0=0,s0=o[1]-h(o[0],o[2]);if(s0<0)return null;   /* the origin under the ground: no hit */
  for(let t=st;t<=F;t+=st){const x=o[0]+d[0]*t,y=o[1]+d[1]*t,z=o[2]+d[2]*t;if(Math.abs(x)>half||Math.abs(z)>half)return null;
   const s=y-h(x,z);if(s<=0){let a=t0,b=t;for(let k=0;k<24&&b-a>.01;k++){const m=(a+b)/2,s2=o[1]+d[1]*m-h(o[0]+d[0]*m,o[2]+d[2]*m);if(s2>0)a=m;else b=m;}
    const tt=(a+b)/2,px=o[0]+d[0]*tt,pz=o[2]+d[2]*tt;return{t:tt,p:[px,h(px,pz),pz],n:normal(px,pz)};}
   t0=t;s0=s;}return null;}
 return{h,ray,normal,cs};})();
const drawnH=DRAWN.h,drawnRay=DRAWN.ray;
const solidH=(x,z)=>Math.max(drawnH(x,z),ROCK.length?KSTACKS.topAt(ROCK,x,z):-Infinity);
