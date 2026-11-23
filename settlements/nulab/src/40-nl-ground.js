// ================================================================= NULAB — the ground: the frame, the model at 1:1, the harbour, the river
// [G data] (PLAN.md sections 0 and 2; step N2). Metres; x east, z south (north is -z); y absolute metres (the great lake stands
// at 297.4 m). The frame's origin is px 443.45,1358.45 on the scale model 5.1 (2 km a pixel): the town's middle, between the
// mound on the pin (px 443,1359: (-900, 1100) here) and the quays on the bay's west shore. Plain functions on records: no
// three.js, no DOM, no noise.
//   NL_GROUND.toPx(x, z), fromPx(px, py)   the page's frame and the model's pixels
//   NL_GROUND.model(x, z)                  the scale model's ground (NL_MODEL, Catmull-Rom between its cell centres, as
//                                          core/world and Kirstabal read it); a water cell holds its bed
//   NL_GROUND.h(x, z)                      the ground every builder and the camera read: the model, the harbour's basin
//                                          dredged behind the mole, the Chimes Riba's channel cut from the bay's head
//   NL_GROUND.river                        the Chimes Riba near the town: {width, pts: [[x, z, y of the surface]]}, upstream
//                                          first (from the bay's head through the outlet down the level reach)
//   NL_GROUND.riverAt(x, z)                [distance to the river's line, its surface there]
//   NL_GROUND.shoreX(z)                    the bay's west shore at z (the first water east of the town), for the quays
//   NL_GROUND.HARBOUR                      the basin: x0..x1 (from the shore out), z0..z1, its floor
var NL_GROUND=(function(){
 const PX=[443.45,1358.45],CELL=2000,M=NL_MODEL,LAKE=M.lake;
 const toPx=(x,z)=>[PX[0]+x/CELL,PX[1]+z/CELL],fromPx=(px,py)=>[(px-PX[0])*CELL,(py-PX[1])*CELL];
 const cr=(p0,p1,p2,p3,t)=>p1+.5*t*(p2-p0+t*(2*p0-5*p1+4*p2-p3+t*(3*(p1-p2)+p3-p0)));
 const hm=(i,j)=>{i=Math.max(0,Math.min(M.nx-1,i));j=Math.max(0,Math.min(M.ny-1,j));return M.h[j*M.nx+i];};
 const model=(x,z)=>{const p=toPx(x,z),fx=p[0]-M.px0,fy=p[1]-M.py0,i=Math.floor(fx),j=Math.floor(fy),tx=fx-i,ty=fy-j,r=[];
  for(let k=-1;k<=2;k++)r.push(cr(hm(i-1,j+k),hm(i,j+k),hm(i+1,j+k),hm(i+2,j+k),tx));return cr(r[0],r[1],r[2],r[3],ty);};
 const sm=(a,b,t)=>{t=Math.max(0,Math.min(1,(t-a)/(b-a)));return t*t*(3-2*t);};
 /* the bay's west shore: the first point east of x -400 where the model is under the lake, at z (10 m steps) */
 const shoreX=z=>{let x=-400;while(x<6000&&model(x,z)>=LAKE)x+=10;return x;};
 /* the harbour (PLAN.md section 3.2, quarter 5): the basin dredged to 4 m (293.4 m) for 260 m out from the quays, z -1050 ..
    -1650; the shore there is the model's own straight bank (x 830-920), 3 m over the water */
 const HARBOUR={z0:-1650,z1:-1050,out:260,floor:LAKE-4};
 HARBOUR.x0=Math.min(shoreX(HARBOUR.z0),shoreX(HARBOUR.z1),shoreX((HARBOUR.z0+HARBOUR.z1)/2));
 HARBOUR.x1=HARBOUR.x0+HARBOUR.out;
 /* the Chimes Riba (r005, 943 m3/s, 148 m wide; PLAN.md 2.3) from the bay's head through the outlet (px 446.2,1359.5) and down
    the level reach (446.2,1361.5; 448.3,1363.5; 450.2,1365.5): its surface the lake's at the bay, falling 0.5 m a km below the
    outlet (proposed: the model's bed is a flat 299 m, the river audit's fill; PLAN.md section 11) */
 const RIVER={width:148,pts:[[5250,-500],fromPx(446.2,1359.5),fromPx(446.2,1361.5),fromPx(448.3,1363.5),fromPx(450.2,1365.5)].map(p=>[p[0],p[1],LAKE])};
 {let s=0;for(let i=1;i<RIVER.pts.length;i++){const a=RIVER.pts[i-1],b=RIVER.pts[i];if(i>=2)s+=Math.hypot(b[0]-a[0],b[1]-a[1]);b[2]=LAKE-.15-.0005*s;}}   /* the outlet .15 m under the lake, then 0.5 m a km */
 const segD=(p,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],l0=dx*dx+dz*dz,l=l0>0?l0:1,t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/l));
  return [Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz),t];};
 const riverAt=(x,z)=>{let best=[1e9,LAKE];for(let i=1;i<RIVER.pts.length;i++){const a=RIVER.pts[i-1],b=RIVER.pts[i],r=segD([x,z],a,b);
  if(r[0]<best[0])best=[r[0],a[2]+(b[2]-a[2])*r[1]];}return best;};
 const RB=[Math.min(...RIVER.pts.map(p=>p[0]))-300,Math.min(...RIVER.pts.map(p=>p[1]))-300,Math.max(...RIVER.pts.map(p=>p[0]))+300,Math.max(...RIVER.pts.map(p=>p[1]))+300];
 /* the river's channel: its bed 5 m under its surface (r005's depth), its banks 30 m wide either side */
 const carve=(x,z,y)=>{if(x<RB[0]||x>RB[2]||z<RB[1]||z>RB[3])return y;const rv=riverAt(x,z),half=RIVER.width/2;if(rv[0]>=half+30)return y;
  const k=sm(half+30,half-12,rv[0]);return Math.min(y,y*(1-k)+(rv[1]-5)*k);};
 /* the basin: dredged under the floor across the harbour's box, eased over 40 m at its open sides; the quays stand on the bank */
 const dredge=(x,z,y)=>{const H=HARBOUR;if(x<H.x0-20||x>H.x1+40||z<H.z0-40||z>H.z1+40)return y;
  const k=sm(-40,0,Math.min(z-H.z0,H.z1-z))*sm(H.x1+40,H.x1,x)*sm(H.x0-12,H.x0+6,x);return Math.min(y,y*(1-k)+H.floor*k);};
 function h(x,z){return carve(x,z,dredge(x,z,model(x,z)));}
 return {PX,CELL,LAKE,toPx,fromPx,model,h,river:RIVER,riverAt,shoreX,HARBOUR,PIN:fromPx(443,1359)};
})();
