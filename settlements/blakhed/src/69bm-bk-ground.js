// ================================================================= BLAKHED — the ground: the model, the Blak Riba carved in, the leat, the ice ponds
// [G data] PLAN.md sections 2 and 5 (step B1's first pass). The scale model 5.1's ground at 1:1 (gen/69bk3-bk-model.js, bicubic round
// the pin px 441,1400 as core/world reads the same cells), four grids: the town (6 km at 40 m), the Stairhead at the falls' lip
// (6 x 8 km at 40 m), the river's country between them (36 x 28 km at 100 m) and the far field (120 km at 500 m), each blended over
// its last 300 m into the next coarser. Into it the page's own work, each a plain function of (x, z):
//   the Blak Riba (rivers.json r116), its vertices smoothed (Catmull-Rom, every 25 m), the one vertex past the town moved inside its
//     2 km cell (440.2,1399.5 to 440.8,1399.8: PLAN.md section 0, the town-scale survey) so the town stands on its bank; its bed falling
//     all its length (never above the ground less 1.8 m), its channel cut and its banks kept above the water, its valley eased
//   the leat off the river above the Icegarth, falling to the ice ponds, in its cut
//   the ice ponds (PLAN.md section 3, question 5): shallow basins on the flats by the river below the town, each dug to its level
// Metres; x east, z south (north is -z); the origin is the pin. BK_GROUND.h is the page's terrainH.
var BK_GROUND=(function(){
 const M=BK_MODEL,PX=2000,P0=M.pin;
 const sm=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
 function dec(o){const s=atob(o.b64),n=s.length>>1,a=new Float32Array(n);
  for(let i=0;i<n;i++){let v=s.charCodeAt(2*i)|(s.charCodeAt(2*i+1)<<8);if(v>32767)v-=65536;a[i]=o.base+v*o.unit;}return a;}
 const G={town:M.town,stair:M.stair,country:M.country,far:M.far},A={};for(const k in G)A[k]=dec(G[k]);
 function bil(k,x,z){const g=G[k],a=A[k],u=Math.min(g.nx-1.0001,Math.max(0,(x-g.x0)/g.step)),v=Math.min(g.nz-1.0001,Math.max(0,(z-g.z0)/g.step));
  const i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,q=j*g.nx+i;return(a[q]*(1-fu)+a[q+1]*fu)*(1-fv)+(a[q+g.nx]*(1-fu)+a[q+g.nx+1]*fu)*fv;}
 const edge=(k,x,z)=>{const g=G[k];return Math.min(x-g.x0,g.x1-x,z-g.z0,g.z1-z);};
 /* the finest grid that holds (x, z), blended over its last 300 m into the next */
 function model(x,z){let h=bil('far',x,z);
  for(const k of['country','stair','town']){const e=edge(k,x,z);if(e<=0)continue;const t=Math.min(1,e/300);h=h*(1-t)+bil(k,x,z)*t;}return h;}
 const fromPx=(px,py)=>[(px-P0[0])*PX,(py-P0[1])*PX],toPx=(x,z)=>[P0[0]+x/PX,P0[1]+z/PX];

 // ---------------------------------------------------------------- the Blak Riba
 /* the vertices from 435.03,1402.33 (12 km above the town) to the falls' foot (449.87,1385.49); the moved one; Catmull-Rom every 25 m */
 const MOVED={from:[440.2,1399.5],to:[440.8,1399.8]};
 const V=M.river.pts.filter(p=>p[1]<=1402.4&&p[1]>=1385.4&&p[0]>=435).map(p=>{const px=Math.abs(p[0]-MOVED.from[0])<.01&&Math.abs(p[1]-MOVED.from[1])<.01?MOVED.to:[p[0],p[1]];
  const [x,z]=fromPx(px[0],px[1]);return{x,z,px,bed:p[4]};});
 const R=[];{const n=V.length,P=i=>V[Math.max(0,Math.min(n-1,i))];
  for(let i=0;i+1<n;i++){const a=P(i-1),b=P(i),c=P(i+1),d=P(i+2),L=Math.hypot(c.x-b.x,c.z-b.z),m=Math.max(1,Math.round(L/25));
   for(let k=0;k<m;k++){const t=k/m,t2=t*t,t3=t2*t,f=(p0,p1,p2,p3)=>.5*(2*p1+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t2+(-p0+3*p1-3*p2+p3)*t3);
    R.push({x:f(a.x,b.x,c.x,d.x),z:f(a.z,b.z,c.z,d.z)});}}
  R.push({x:V[n-1].x,z:V[n-1].z});}
 /* arc length, the flow's width (29 m at the mouth, 42.7 m3/s; ~24 m past the town, ~31 m3/s), the bed falling all its length */
 {let s=0,bed=1e9;for(let i=0;i<R.length;i++){const r=R[i];if(i)s+=Math.hypot(r.x-R[i-1].x,r.z-R[i-1].z);r.s=s;
   const g=model(r.x,r.z);bed=Math.min(i?bed-.0008*(s-R[i-1].s):1e9,g-1.8);r.bed=bed;r.surf=bed+M.river.depth;}
  const S=R[R.length-1].s;for(const r of R)r.w=22+7*(r.s/S);}
 for(let i=0;i<R.length;i++){const a=R[Math.max(0,i-1)],b=R[Math.min(R.length-1,i+1)],L=Math.max(1e-9,Math.hypot(b.x-a.x,b.z-a.z));
  R[i].tx=(b.x-a.x)/L;R[i].tz=(b.z-a.z)/L;R[i].nx=-R[i].tz;R[i].nz=R[i].tx;}   /* n: the right bank looking downstream (east where it flows north): the town's side past the town */
 /* the segments binned on a 250 m lattice for the nearest-point query */
 const BIN=250,bins=new Map(),bkey=(i,j)=>i+','+j;
 for(let i=0;i+1<R.length;i++){const a=R[i],b=R[i+1];const i0=Math.floor((Math.min(a.x,b.x)-450)/BIN),i1=Math.floor((Math.max(a.x,b.x)+450)/BIN),
   j0=Math.floor((Math.min(a.z,b.z)-450)/BIN),j1=Math.floor((Math.max(a.z,b.z)+450)/BIN);
  for(let p=i0;p<=i1;p++)for(let q=j0;q<=j1;q++){const k=bkey(p,q);if(!bins.has(k))bins.set(k,[]);bins.get(k).push(i);}}
 /* the nearest point of the river within 450 m: {d, i, t, s, bed, surf, w, side} or null */
 function near(x,z){const L=bins.get(bkey(Math.floor(x/BIN),Math.floor(z/BIN)));if(!L)return null;let best=null;
  for(const i of L){const a=R[i],b=R[i+1],dx=b.x-a.x,dz=b.z-a.z,L2=Math.max(1e-9,dx*dx+dz*dz),t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/L2)),
    px=a.x+t*dx,pz=a.z+t*dz,d=Math.hypot(x-px,z-pz);
   if(!best||d<best.d)best={d,i,t,s:a.s+t*(b.s-a.s),bed:a.bed+t*(b.bed-a.bed),surf:a.surf+t*(b.surf-a.surf),w:a.w,side:(x-px)*a.nx+(z-pz)*a.nz>=0?1:-1};}   /* side +1: the right bank */
  return best&&best.d<450?best:null;}
 /* a point along the river: s (m from its first point), off (m from the centre line, + the right bank) */
 function along(s,off){let i=0;while(i+1<R.length&&R[i+1].s<s)i++;const a=R[i],b=R[Math.min(R.length-1,i+1)],t=b.s>a.s?Math.max(0,Math.min(1,(s-a.s)/(b.s-a.s))):0;
  const x=a.x+(b.x-a.x)*t,z=a.z+(b.z-a.z)*t,o=off==null?0:off;return{x:x+a.nx*o,z:z+a.nz*o,tx:a.tx,tz:a.tz,nx:a.nx,nz:a.nz,bed:a.bed+(b.bed-a.bed)*t,surf:a.surf+(b.surf-a.surf)*t,w:a.w,s};}
 /* the river at the town: the point nearest the pin; the falls' lip: the first 200 m past the falls bench falling more than 12 % */
 let sPin=0,dPin=1e9;for(const r of R){const d=Math.hypot(r.x,r.z);if(d<dPin){dPin=d;sPin=r.s;}}
 let sLip=R[R.length-1].s;for(let i=0;i<R.length;i++){const r=R[i];if(r.s<sPin+12000)continue;const j=R.findIndex(q=>q.s>=r.s+200);if(j<0)break;
  if((r.bed-R[j].bed)/200>.12){sLip=r.s;break;}}
 /* the river's ground: the channel (its bed to the banks, a parabola), the banks kept 0.6 m over the water out to 30 m, the valley
    eased toward a gentle side out to 400 m (never raised but at the banks) */
 function riverCut(x,z,h){const n=near(x,z);if(!n)return h;const hw=n.w/2,top=n.surf+.6;
  if(n.d<hw){const u=n.d/hw;return n.bed+(top-n.bed)*u*u;}
  const side=top+(n.d-hw)*.06,v=sm(hw+400,hw,n.d);let y=h+(Math.min(h,side)-h)*v;if(n.d<hw+30)y=Math.max(y,top+(n.d-hw)*.02);return y;}

 // ---------------------------------------------------------------- the ice ponds and the leat (PLAN.md section 3; question 5, proposed)
 /* the ponds on the right bank (the town's side) 1.1-1.9 km below the river's nearest point to the town, 70-160 m back from the
    water; each a rectangle along the river, dug to a level 0.6 m under its lowest corner */
 const PONDS=[];{const gr=(x,z)=>riverCut(x,z,model(x,z));
  for(let k=0;k<6;k++){const s=sPin+1100+(k>>1)*300,off=85+(k&1)*70,F=along(s,off),w=110,d=52,ry=Math.atan2(F.tx,F.tz);
   const c=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>gr(F.x+F.tx*a*w/2+F.nx*b*d/2,F.z+F.tz*a*w/2+F.nz*b*d/2));
   PONDS.push({id:'bk.pond.'+(k+1),x:F.x,z:F.z,tx:F.tx,tz:F.tz,nx:F.nx,nz:F.nz,ry,w,d,level:Math.min(...c,gr(F.x,F.z))-.6});}}
 const pondAt=(x,z,m)=>{for(const p of PONDS){const dx=x-p.x,dz=z-p.z,u=Math.abs(dx*p.tx+dz*p.tz)-p.w/2,v=Math.abs(dx*p.nx+dz*p.nz)-p.d/2;if(Math.max(u,v)<(m||0))return{p,e:Math.max(u,v)};}return null;};
 /* the leat: off the river 450 m above the first pond, 40 m in from the water, down along the bank to the ponds' head, in its cut;
    each point a little lower than the last and 0.55 m under the ground */
 const LEAT=(function(){const out=[];let yl=1e9;for(let s=sPin+650;s<=sPin+1100;s+=15){const off=s<sPin+700?14+(s-sPin-650)*.52:40,F=along(s,off);
   const g=riverCut(F.x,F.z,model(F.x,F.z));yl=Math.min(yl-.04,g-.55);out.push([F.x,F.z,yl]);}
  const P0=PONDS[0];out.push([P0.x-P0.tx*P0.w/2,P0.z-P0.tz*P0.w/2,Math.min(yl-.05,P0.level+.4)]);return out;})();
 function segD(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],L2=Math.max(1e-9,dx*dx+dz*dz),t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/L2));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz);}
 const LB=[Math.min(...LEAT.map(p=>p[0]))-12,Math.min(...LEAT.map(p=>p[1]))-12,Math.max(...LEAT.map(p=>p[0]))+12,Math.max(...LEAT.map(p=>p[1]))+12];
 function leatD(x,z){if(x<LB[0]||x>LB[2]||z<LB[1]||z>LB[3])return 1e9;let d=1e9;for(let i=0;i+1<LEAT.length;i++)d=Math.min(d,segD(x,z,LEAT[i],LEAT[i+1]));return d;}

 // ---------------------------------------------------------------- the ground every builder and the camera read
 function h(x,z){let y=riverCut(x,z,model(x,z));
  const dl=leatD(x,z);if(dl<4)y-=1.0*(1-sm(1.2,4,dl));
  const P=pondAt(x,z,6);if(P){const lo=P.p.level-.8;y=P.e<0?Math.min(y,lo):Math.min(y,lo+(y-lo)*sm(0,6,P.e)+ .5*(1-sm(0,6,P.e)));}
  return y;}
 return{model,h,fromPx,toPx,grids:G,river:{pts:R,near,along,sPin,sLip,moved:MOVED,vertices:V,q:M.river.q},ponds:PONDS,pondAt,leat:LEAT,leatD,segD,sm};
})();
