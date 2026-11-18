// ================================================================= KIRSTABAL — the ground: the frame, the shore, the river, the far field
// [G data] (PLAN.md section 1; steps K2-K3). Metres; x east, z south (north is -z); y metres above the Lower Xanadu Lake's
// level (-1,685 m: the model's wl.png), so the lake's surface is y = 0. The origin is the town's centre, scale model 5.1 px
// KS_GROUND.PX, about 450 m inland of the lake's south-east shore, on the apron at the lake's head (the pin, sl758m2396, is
// the 2 km cell 989,1600 this stands beside). Plain functions on records: no three.js, no DOM, no noise.
//   KS_GROUND.toPx(x, z), fromPx(px, py)    the page's frame and the scale model's pixels (2 km each)
//   KS_GROUND.model(x, z)                   the scale model's ground (KS_MODEL, Catmull-Rom between its cell centres)
//   KS_GROUND.near(x, z)                    the town's ground as designed at 1:1: the beach, the apron rising inland, the
//                                           harbour's dredged basin, Keb Riwa's channel; null beyond its reach
//   KS_GROUND.h(x, z)                       the ground every builder and the camera read: near blended into the model
//   KS_GROUND.base(x, z)                    h without the moat's trench (its banks' level)
//   KS_GROUND.setMoat(M), inMoat(x, z, m), moatLevel(x, z), moat()
//                                           the town wall's moat (core/city's KCITY.grid moat record, set by 41): its trench
//                                           in h, a point in it (m metres to spare), its water's level, the record
//   KS_GROUND.inland(x, z)                  metres inland of the shoreline (negative: the lake)
//   KS_GROUND.u(x, z), v(x, z)              the shore frame: u along the shore (north-east positive), v inland (south-east)
//   KS_GROUND.at(u, v)                      back to x, z
//   KS_GROUND.river                         Keb Riwa's line near the town [[x, z, y], ...], upstream first, and its width
//   KS_GROUND.fall                          the cataract on the scarp: lip [x, y, z], its drop, the way the water leaves
var KS_GROUND=(function(){
 const PX=[988.33,1599.4],CELL=2000,M=KS_MODEL;
 const toPx=(x,z)=>[PX[0]+x/CELL,PX[1]+z/CELL],fromPx=(px,py)=>[(px-PX[0])*CELL,(py-PX[1])*CELL];
 /* the model: Catmull-Rom over its cell centres (a cell's value at its integer pixel) */
 const cr=(p0,p1,p2,p3,t)=>p1+.5*t*(p2-p0+t*(2*p0-5*p1+4*p2-p3+t*(3*(p1-p2)+p3-p0)));
 const hm=(i,j)=>{i=Math.max(0,Math.min(M.nx-1,i));j=Math.max(0,Math.min(M.ny-1,j));return M.h[j*M.nx+i];};
 const model=(x,z)=>{const p=toPx(x,z),fx=p[0]-M.px0,fy=p[1]-M.py0,i=Math.floor(fx),j=Math.floor(fy),tx=fx-i,ty=fy-j,r=[];
  for(let k=-1;k<=2;k++)r.push(cr(hm(i-1,j+k),hm(i,j+k),hm(i+1,j+k),hm(i+2,j+k),tx));return cr(r[0],r[1],r[2],r[3],ty);};
 /* the shore frame: the model's shoreline runs south-west to north-east past the town (py 1599 at px 988.5, py 1600 at
    987.5), the lake to the north-west; S0 is the shoreline's point nearest the origin, 450 m out */
 const R2=Math.SQRT1_2,SHORE_OUT=450,UX=[R2,-R2],VX=[R2,R2];   /* u: along the shore toward the north-east; v: inland, south-east */
 const S0=[-SHORE_OUT*VX[0],-SHORE_OUT*VX[1]];
 const u=(x,z)=>(x-S0[0])*UX[0]+(z-S0[1])*UX[1],v=(x,z)=>(x-S0[0])*VX[0]+(z-S0[1])*VX[1];
 const at=(uu,vv)=>[S0[0]+uu*UX[0]+vv*VX[0],S0[1]+uu*UX[1]+vv*VX[1]];
 /* the harbour basin (the town's front: PLAN.md section 3), in the shore frame: dredged to 4.5 m behind the mole */
 const HARBOUR={u0:-260,u1:140,v0:-250,v1:0,depth:4.5};
 /* Keb Riwa near the town (rivers.json r107: 780 m3/s, 135 m wide; the owner, 2026-11-16: "Keb Riwa"): from the scarp's toe
    to its mouth on the lake's north-east arm, the model's line (993,1598 to 989.5,1597.5) brought down to the apron's
    level at 1:1; upstream first, [x, z, y of the surface] */
 const RIVER={width:135,pts:[[9400,-3050,96],[7600,-3260,52],[6000,-3420,24],[4800,-3560,10],[3900,-3660,3.2],[3200,-3740,.6],[2500,-3820,0]]};
 const segD=(p,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],l0=dx*dx+dz*dz,l=l0>0?l0:1,t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/l));
  return [Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz),t];};
 const riverAt=(x,z)=>{let best=[1e9,0];for(let i=1;i<RIVER.pts.length;i++){const a=RIVER.pts[i-1],b=RIVER.pts[i],r=segD([x,z],a,b);
  if(r[0]<best[0])best=[r[0],a[2]+(b[2]-a[2])*r[1]];}return best;};   /* [distance to the line, the surface's y there] */
 /* the cataract (r107 crosses the lip at px 1000.5,1598, bed 1,326 m, and is at 249 m by 996.5,1596.5: about 1,080 m in
    4 km): the lip and the drop, in the page's frame, the water leaving westward down the scarp */
 const lip=fromPx(1000.5,1598);
 const FALL={lip:[lip[0],1326-M.lake,lip[1]],drop:1077,dir:[-1,0]};
 const sm=(a,b,t)=>{t=Math.max(0,Math.min(1,(t-a)/(b-a)));return t*t*(3-2*t);};
 const NEAR=12500,BLEND=[11000,13000],NORTH=[-2600,-4400],EAST=[2600,4600];   /* the near ground: the town, the floor south and the lake's south-west; the river's arm (north) and the scarp (east) are the model's */
 /* the river's surface where the ground is the model's: on the model, 2.5 m down, never rising downstream */
 for(const p of RIVER.pts)if(Math.hypot(p[0],p[1])>BLEND[0])p[2]=Math.max(p[2],model(p[0],p[1])-2.5);
 for(let i=RIVER.pts.length-2;i>=0;i--)RIVER.pts[i][2]=Math.max(RIVER.pts[i][2],RIVER.pts[i+1][2]);
 const RIVER_R=Math.max(...RIVER.pts.map(p=>Math.hypot(p[0],p[1])))+300;
 const inland=(x,z)=>v(x,z);
 function near(x,z){const r=Math.hypot(x,z);if(r>NEAR+200)return null;
  const d=v(x,z),uu=u(x,z);let y;
  if(d<0)y=-Math.min(38,1.2+(-d)*.035);   /* the lake's bed shelving out */
  else y=1.6+3.4*(1-Math.exp(-d/70))+d*.009;   /* the beach berm, then the apron rising about 9 m a km toward the scarp */
  if(uu>HARBOUR.u0-40&&uu<HARBOUR.u1+40&&d>HARBOUR.v0-40&&d<HARBOUR.v1+6){   /* the basin dredged behind the mole */
   const k=sm(0,40,Math.min(uu-HARBOUR.u0+40,HARBOUR.u1+40-uu,d-HARBOUR.v0+40))*sm(0,6,HARBOUR.v1+6-d);y=Math.min(y,y*(1-k)-HARBOUR.depth*k);}
  return y;}
 /* Keb Riwa's channel, cut into whichever ground is there: its bed 3.5 m under its surface, banks 25 m wide */
 const carve=(x,z,y)=>{const rv=riverAt(x,z),half=RIVER.width/2;if(rv[0]>=half+25)return y;const k=sm(half+25,half-10,rv[0]);return Math.min(y,y*(1-k)+(rv[1]-3.5)*k);};
 const nearW=(x,z)=>Math.max(sm(BLEND[0],BLEND[1],Math.hypot(x,z)),sm(NORTH[0],NORTH[1],z),sm(EAST[0],EAST[1],x));   /* 1: the model's */
 /* THE MOAT (the owner, 2026-11-17: Chiang Mai's, round the town wall): the town hands its line in (setMoat: core/city's
    KCITY.grid moat record, {line (closed), width}); a trench 3 m under the ground it cuts, its sides sloping out over 6 m; the
    water stands 1.4 m under the ground's line there (moatLevel). base(x, z) is the ground without the moat (its banks' level) */
 let MOAT=null,MOAT_BOX=null;
 const moatD=(x,z)=>{if(!MOAT||x<MOAT_BOX[0]||x>MOAT_BOX[1]||z<MOAT_BOX[2]||z>MOAT_BOX[3])return 1e9;let d=1e9;const L=MOAT.line;
  for(let i=1;i<L.length;i++)d=Math.min(d,segD([x,z],L[i-1],L[i])[0]);return d;};
 function setMoat(M){MOAT=M&&M.line?M:null;if(!MOAT)return;const m=MOAT.width/2+20;
  MOAT_BOX=[Math.min(...M.line.map(p=>p[0]))-m,Math.max(...M.line.map(p=>p[0]))+m,Math.min(...M.line.map(p=>p[1]))-m,Math.max(...M.line.map(p=>p[1]))+m];}
 function base(x,z){const r=Math.hypot(x,z),w=nearW(x,z);let y;
  if(w>=1)y=model(x,z);else{const n=near(x,z);y=w<=0?n:n*(1-w)+model(x,z)*w;}
  return r<RIVER_R?carve(x,z,y):y;}
 function h(x,z){const y=base(x,z);if(!MOAT)return y;const d=moatD(x,z),half=MOAT.width/2;if(d>=half+6)return y;return y-3*sm(half+6,half-1,d);}
 const inMoat=(x,z,m)=>!!MOAT&&moatD(x,z)<MOAT.width/2+(m==null?0:m);
 const moatLevel=(x,z)=>base(x,z)-1.4;
 return {PX,CELL,toPx,fromPx,model,near,nearW,h,base,inland,u,v,at,S0,UX,VX,HARBOUR,river:RIVER,riverAt,fall:FALL,NEAR,BLEND,setMoat,inMoat,moatLevel,moat:()=>MOAT};
})();
