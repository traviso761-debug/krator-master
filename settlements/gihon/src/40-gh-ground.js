// ================================================================= GIHON — the ground: the frame, the shore, the Opal River, the terrace
// [G data] (PLAN.md sections 1 and 3; step G2). Metres; x east, z south (north is -z); y metres above the Lower Xanadu Lake's
// level (-1,685 m), so the lake's surface is y = 0. The origin is the town's centre, scale model 5.1 px GH_GROUND.PX (the
// tune's XAN_TUNE.gihon.px), on the shore apron west of the Opal River's mouth, 700 m inland of the shore (Ōpal-Māuṭh's lake
// cell, 955,1607, is just north of it). Plain functions on records: no three.js, no DOM, no noise.
//   GH_GROUND.toPx(x, z), fromPx(px, py)    the page's frame and the scale model's pixels (2 km each)
//   GH_GROUND.model(x, z)                   the scale model's ground (GH_MODEL, Catmull-Rom between its cell centres)
//   GH_GROUND.near(x, z)                    the town's ground as designed at 1:1: the beach, the apron rising inland about
//                                           30 m a km, the harbour's dredged basin, the Opal River's valley; null beyond reach
//   GH_GROUND.h(x, z)                       the ground every builder and the camera read: near blended into the model, the
//                                           river's channel, the forbidden city's terrace and the two moats cut into it
//   GH_GROUND.base(x, z)                    h without the moats' trenches (their banks' level)
//   GH_GROUND.setTerrace(T)                 the forbidden city's terrace (41 hands it in: {box: [x0, z0, x1, z1], y, edge}):
//                                           the ground levelled to y inside the box, cut and filled, its batter `edge` m wide
//   GH_GROUND.setMoats(list), inMoat(x, z, m), moatLevel(x, z), moats()
//                                           the moats (core/city's KCITY.grid moat records: the town's and the forbidden
//                                           city's), their trenches in h, a point in one, its water's level
//   GH_GROUND.u(x, z), v(x, z), at(u, v)    the shore frame: u along the shore (east positive), v inland (south)
//   GH_GROUND.river, riverAt(x, z)          the Opal River's line near the town [[x, z, y], ...] (upstream first), its width;
//                                           [distance to the line, the water's y there]
var GH_GROUND=(function(){
 const PX=[955.7,1607.9],CELL=2000,M=GH_MODEL;
 const toPx=(x,z)=>[PX[0]+x/CELL,PX[1]+z/CELL],fromPx=(px,py)=>[(px-PX[0])*CELL,(py-PX[1])*CELL];
 const cr=(p0,p1,p2,p3,t)=>p1+.5*t*(p2-p0+t*(2*p0-5*p1+4*p2-p3+t*(3*(p1-p2)+p3-p0)));
 const hm=(i,j)=>{i=Math.max(0,Math.min(M.nx-1,i));j=Math.max(0,Math.min(M.ny-1,j));return M.h[j*M.nx+i];};
 const model=(x,z)=>{const p=toPx(x,z),fx=p[0]-M.px0,fy=p[1]-M.py0,i=Math.floor(fx),j=Math.floor(fy),tx=fx-i,ty=fy-j,r=[];
  for(let k=-1;k<=2;k++)r.push(cr(hm(i-1,j+k),hm(i,j+k),hm(i+1,j+k),hm(i+2,j+k),tx));return cr(r[0],r[1],r[2],r[3],ty);};
 /* the shore frame: the model's shoreline runs east-west past the town (py about 1607.55 from px 946 to 956), the lake to the north */
 const SHORE_OUT=700,UX=[1,0],VX=[0,1],S0=[0,-SHORE_OUT];
 const u=(x,z)=>x-S0[0],v=(x,z)=>z-S0[1],at=(uu,vv)=>[S0[0]+uu,S0[1]+vv];
 /* the harbour basin before the Lake Gate (the town's front), in the shore frame: dredged to 4.5 m behind the mole */
 const HARBOUR={u0:-300,u1:120,v0:-260,v1:0,depth:4.5};
 /* THE OPAL RIVER (Sitār Ḍrāi, rivers.json r682: 115 m3/s) near the town: down its gorge from Opal Valley's mouth (the model's
    line, 964,1629 to 960,1613), then the designed course at 1:1 past the town's east side to its mouth (the model puts it at
    955,1606), about 60 m wide; upstream first, [x, z, y of the surface] (the far points get the model's height, below) */
 const RIVER={width:60,pts:[[16600,42200,0],[4600,26200,0],[8600,10200,0],[4200,5400,90],[2600,3600,40],[1500,1700,10],[1080,600,3.6],[930,-200,1.2],[860,-700,.25],[800,-1100,0]]};
 const segD=(p,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],l0=dx*dx+dz*dz,l=l0>0?l0:1,t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/l));
  return [Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz),t];};
 const sm=(a,b,t)=>{t=Math.max(0,Math.min(1,(t-a)/(b-a)));return t*t*(3-2*t);};
 for(const p of RIVER.pts)if(Math.hypot(p[0],p[1])>9000)p[2]=Math.max(0,model(p[0],p[1])-2.5);
 for(let i=RIVER.pts.length-2;i>=0;i--)RIVER.pts[i][2]=Math.max(RIVER.pts[i][2],RIVER.pts[i+1][2]);   /* never rising downstream */
 const riverAt=(x,z)=>{let best=[1e9,0];for(let i=1;i<RIVER.pts.length;i++){const a=RIVER.pts[i-1],b=RIVER.pts[i],r=segD([x,z],a,b);
  if(r[0]<best[0])best=[r[0],a[2]+(b[2]-a[2])*r[1]];}return best;};
 const NEAR=6400,BLEND=[3800,6200];   /* the near ground: the town and its fields; the ring past 4 km is the model's */
 /* the apron as designed: the beach berm, then a rise of about 30 m a km inland (the model's apron, 45-55 m a km, eased); the lake's bed shelving out; the harbour's basin */
 function near(x,z){if(Math.hypot(x,z)>NEAR+200)return null;
  const d=v(x,z),uu=u(x,z);let y;
  if(d<0)y=-Math.min(38,1.2+(-d)*.035);
  else y=1.6+3.4*(1-Math.exp(-d/70))+d*.03;
  if(uu>HARBOUR.u0-40&&uu<HARBOUR.u1+40&&d>HARBOUR.v0-40&&d<HARBOUR.v1+6){
   const k=sm(0,40,Math.min(uu-HARBOUR.u0+40,HARBOUR.u1+40-uu,d-HARBOUR.v0+40))*sm(0,6,HARBOUR.v1+6-d);y=Math.min(y,y*(1-k)-HARBOUR.depth*k);}
  return y;}
 /* the river's valley: the ground falls toward the water, 3 m over it at the bank and 6 m a 100 m up from there; its channel
    3 m under its surface, its banks 20 m wide */
 const valley=(x,z,y)=>{const rv=riverAt(x,z),half=RIVER.width/2;if(rv[0]>half+900)return y;
  const side=rv[1]+3+Math.max(0,rv[0]-half-20)*.06;y=Math.min(y,side);
  if(rv[0]<half+20){const k=sm(half+20,half-8,rv[0]);y=Math.min(y,y*(1-k)+(rv[1]-3)*k);}return y;};
 const nearW=(x,z)=>sm(BLEND[0],BLEND[1],Math.hypot(x,z));
 /* THE FORBIDDEN CITY'S TERRACE (PLAN.md section 3: the forbidden city "on the rise above the river"): the ground levelled inside its
    box, cut on the high side and built up on the low, its batter `edge` m wide */
 let TER=null;
 const setTerrace=T=>{TER=T&&T.box?T:null;};
 const terrace=(x,z,y)=>{if(!TER)return y;const B=TER.box,e=TER.edge==null?24:TER.edge,dx=Math.max(B[0]-x,0,x-B[2]),dz=Math.max(B[1]-z,0,z-B[3]),d=Math.hypot(dx,dz);
  if(d>=e)return y;const k=1-sm(0,e,d);return y*(1-k)+TER.y*k;};
 function base(x,z){const w=nearW(x,z);let y;
  if(w>=1)y=model(x,z);else{const n=near(x,z);y=w<=0?n:n*(1-w)+model(x,z)*w;}
  return terrace(x,z,valley(x,z,y));}
 /* THE MOATS (core/city's KCITY.grid moat records: the town's, Chiang Mai's, 16 m; the forbidden city's, 12 m): each a trench
    3 m under the ground it cuts, its sides sloping out over 6 m; the water 1.4 m under the ground's line there (moatLevel) */
 let MOATS=[];
 function setMoats(L){MOATS=(L||[]).filter(M=>M&&M.line).map(M=>{const m=M.width/2+20;
  return {M,box:[Math.min(...M.line.map(p=>p[0]))-m,Math.max(...M.line.map(p=>p[0]))+m,Math.min(...M.line.map(p=>p[1]))-m,Math.max(...M.line.map(p=>p[1]))+m]};});}
 const moatD=(x,z)=>{let best=[1e9,null];for(const o of MOATS){if(x<o.box[0]||x>o.box[1]||z<o.box[2]||z>o.box[3])continue;const L=o.M.line;
   for(let i=1;i<L.length;i++){const d=segD([x,z],L[i-1],L[i])[0];if(d<best[0])best=[d,o.M];}}return best;};
 function h(x,z){const y=base(x,z);if(!MOATS.length)return y;const [d,M]=moatD(x,z);if(!M)return y;const half=M.width/2;if(d>=half+6)return y;return y-3*sm(half+6,half-1,d);}
 const inMoat=(x,z,m)=>{const [d,M]=moatD(x,z);return !!M&&d<M.width/2+(m==null?0:m);};
 const moatLevel=(x,z)=>base(x,z)-1.4;
 return {PX,CELL,toPx,fromPx,model,near,nearW,h,base,inland:v,u,v,at,S0,UX,VX,HARBOUR,river:RIVER,riverAt,NEAR,BLEND,
  setTerrace,terrace:()=>TER,setMoats,inMoat,moatLevel,moats:()=>MOATS.map(o=>o.M)};
})();
