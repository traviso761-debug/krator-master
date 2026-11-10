// ================================================================= HOST — Span's tableland: its fields, seep pools and twin falls (station 3)
// Station 3 stands on the pillar rim's ground (stations/span/INHERIT: the table, its eroded joints, Span's canyon and reservoir, the rim
// and its towers are station 4's 45 and 47, read whole). What the tableland adds, before the kit runs:
//   THE FIELDS the kit's tableland pass reads (59-biome-swhighlands-tableland.js): table (the open slickrock top), dome (a beehive dome's
//   top: a block's top beside an open joint or a step, its rounded edge), swamp (a HANGING SWAMP: a flat ledge or floor cut 20 m and more
//   into the table at a wall's foot, where the seepage from the porous sandstone comes out over a soft parting: Span's canyon's benches
//   and the deep slots), pool (its seep pools); on a 12-19 m lattice (the pillars' FC's), KRAND by cell
//   THE SEEP POOLS: one candidate a 40 m cell on the swamps' flattest ground, a still 2.5-4 m across at the lowest of its rim (the water
//   hides under the ledge where the ledge stands higher)
//   THE TWIN FALLS (PLAN.md section 4: "twin falls where Pan Riba and its fellows leave the tableland", refs/23): two streams 130 m apart
//   off the table east of the watch pillar, each walked down the table's own fall line (steepest descent on the ground, through its slots
//   and over its pans), over the rim's caprock and down the apron to the floor (KRELIEF.river levels, never climbing; WATER.fallsOf)
// Span's arcology is not here (the owner, 2026-10-27: the biome strictly apart from the settlement): its canyon and reservoir are drawn,
// its ruin is settlements/span's.
const TL=(function(){const N=321,SX=TERR.X1-TERR.X0,SZ=TERR.Z1-TERR.Z0,stx=SX/(N-1),stz=SZ/(N-1),K=['cut','table','dome','swamp'],a={};K.forEach(k=>a[k]=new Float32Array(N*N));
 const sl=(i,j)=>FC.at(FC.a.slope,TERR.X0+clamp(i,0,N-1)*stx,TERR.Z0+clamp(j,0,N-1)*stz);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const k=j*N+i,x=TERR.X0+i*stx,z=TERR.Z0+j*stz,zz=zone(x,z);if(zz>=.31)continue;
  const h=groundH(x,z),cut=tableTop(x,z)-h,s=sl(i,j),res=inReservoir(x,z)&&h<RESERVOIR.level+1;let nb=0;for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++)if(di||dj)nb=Math.max(nb,sl(i+di,j+dj));
  a.cut[k]=cut;if(res||towerTop(x,z,0)||nearTower(x,z,4))continue;
  a.table[k]=smooth(.3,.285,zz)*smooth(.5,.28,s)*smooth(8,3,cut);
  a.dome[k]=a.table[k]*smooth(.7,1.15,nb)*smooth(.5,.3,s);
  a.swamp[k]=smooth(.42,.22,s)*smooth(18,32,cut)*smooth(.75,1.25,nb);}
 const at=(arr,x,z)=>{const u=clamp((x-TERR.X0)/SX*(N-1),0,N-1.001),v=clamp((z-TERR.Z0)/SZ*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j;
  return arr[j*N+i]*(1-fu)*(1-fv)+arr[j*N+i+1]*fu*(1-fv)+arr[(j+1)*N+i]*(1-fu)*fv+arr[(j+1)*N+i+1]*fu*fv;};
 return{N,a,at};})();
// ---------------------------------------------------------------- the seep pools
const SEEP_POOLS=(function(){const out=[],cell=40,W=WORLD^0x5EE9;
 for(let j=Math.floor(TERR.Z0/cell);j<=Math.floor(TERR.Z1/cell);j++)for(let i=Math.floor(TERR.X0/cell);i<=Math.floor(TERR.X1/cell);i++){const u=k=>KRAND.unit(KRAND.hash(W,i,j,k));
  const x=(i+.2+.6*u(1))*cell,z=(j+.2+.6*u(2))*cell;if(x<TERR.X0+20||x>TERR.X1-20||z<TERR.Z0+20||z>TERR.Z1-20)continue;
  const sw=TL.at(TL.a.swamp,x,z);if(sw<.45||slopeAt(x,z)>.14)continue;
  /* the level: the rim's lowest ground in a hollow; on a flat ledge 12 cm over the middle (a film over the moss), so long as no point of
     the rim lies more than 45 cm under it (the water's edge would stand in the air) */
  const r=3+2*u(4),g=groundH(x,z);let lo=1e9;for(let s=0;s<12;s++){const a=s/12*TAU;lo=Math.min(lo,groundH(x+Math.cos(a)*r,z+Math.sin(a)*r));}
  const level=Math.max(lo-.05,g+.12);if(level-lo>.45)continue;out.push({x,z,r,level,id:'seep-pool:'+i+','+j});}
 return out;})();
const POOL_IX=(function(){const S=KSPACE.create({cell:20});SEEP_POOLS.forEach(P=>S.insert(P,P.x,P.z,P.r));return S;})();
const _pp=[];
function seepPoolAt(x,z){POOL_IX.query(x,z,0,_pp);for(const P of _pp)if(Math.hypot(x-P.x,z-P.z)<P.r)return P;return null;}
// ---------------------------------------------------------------- the twin falls
const TWIN=(function(){const starts=[[560,rimZ(560)-320],[690,rimZ(690)-300]];
 return starts.map((s,k)=>{const pts=[s.slice()];let x=s[0],z=s[1],dir=[0,1];
  for(let n=0;n<400;n++){if(zone(x,z)>.36)break;let best=null,bh=groundH(x,z);
   for(let q=0;q<16;q++){const a=q/16*TAU,dx=Math.cos(a),dz=Math.sin(a);if(dx*dir[0]+dz*dir[1]<-.2)continue;const nx=x+dx*4,nz=z+dz*4,h=groundH(nx,nz);if(h<bh-.02){bh=h;best=[nx,nz,dx,dz];}}
   if(!best){const nx=x+dir[0]*4,nz=z+dir[1]*4;best=[nx,nz,dir[0],dir[1]];}   /* over a pan's lip: straight on, toward the rim */
   dir=[mix(dir[0],best[2],.6),mix(dir[1],best[3],.6)];const dl=Math.hypot(dir[0],dir[1])||1;dir=[dir[0]/dl,dir[1]/dl+.08];
   x=best[0];z=best[1];pts.push([x,z]);}
  const lv=KRELIEF.river(pts,groundH,{depth:.3,sample:3}),C={key:'twin'+k,name:k?'The twin falls (the eastern)':'The twin falls (the western)',pts,y:lv.map(p=>p.y+.12),slope:lv.map(p=>p.slope),w:[2.2,3.6]};
  C.S=[0];for(let i=1;i<pts.length;i++)C.S.push(C.S[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));C.LEN=C.S[C.S.length-1];C.halfW=i=>mix(C.w[0],C.w[1],C.S[i]/C.LEN);
  /* ONE CURTAIN (the look pass, 2026-11-09: WATER.fallsOf broke it into two or three steps down the cap and the apron): the lip where the
     stream drops fastest over 12 m (the caprock's edge), the foot where it next runs at under a 30% fall; the table's flow ends at the lip,
     the floor's begins at the foot, and one WATER.fall joins them, following the cliff's face (core/water's `face`) */
  let li=0,best=-1;for(let i=0;i+3<pts.length;i++){const d=C.y[i]-C.y[i+3];if(d>best&&zone(pts[i][0],pts[i][1])<.33){best=d;li=i;}}
  let fi=li+1;while(fi+1<pts.length&&(C.y[fi]-C.y[fi+1])/(Math.hypot(pts[fi+1][0]-pts[fi][0],pts[fi+1][1]-pts[fi][1])||1)>.3)fi++;
  const seg=(a,b)=>WATER.flow({name:C.name,pts:pts.slice(a,b+1).map((p,j)=>[p[0],p[1],C.y[a+j]]),width:pts.slice(a,b+1).map((p,j)=>2*(C.halfW(a+j)+1)),speed:pts.slice(a,b+1).map((p,j)=>1.2+3*smooth(.05,.6,C.slope[a+j]))});
  C.flows=[seg(0,li),seg(fi,pts.length-1)];C.flow=C.flows[0];C.lipI=li;C.footI=fi;
  {const a=pts[li],b=pts[Math.min(pts.length-1,li+1)],dl=Math.hypot(b[0]-a[0],b[1]-a[1])||1,dx=(b[0]-a[0])/dl,dz=(b[1]-a[1])/dl,hw=C.halfW(li)+.6,f=pts[fi];
   C.falls=[WATER.fall({name:C.name+' (the curtain)',lip:[[a[0]-dz*hw,a[1]+dx*hw,C.y[li]],[a[0]+dz*hw,a[1]-dx*hw,C.y[li]]],dir:[dx,dz],drop:C.y[li]-C.y[fi],foot:[f[0],f[1],C.y[fi]],fit:true,face:(x,z)=>groundH(x,z)})];}
  return C;});})();
const TWIN_IX=(function(){const S=KSPACE.create({cell:30});TWIN.forEach((C,ci)=>{for(let i=0;i<C.pts.length-1;i++){const a=C.pts[i],b=C.pts[i+1];S.insert({ci,i},(a[0]+b[0])/2,(a[1]+b[1])/2,Math.hypot(b[0]-a[0],b[1]-a[1])/2+6);}});return S;})();
const _tq=[];
function twinNear(x,z){TWIN_IX.query(x,z,0,_tq);let best=1e9;for(const q of _tq){const C=TWIN[q.ci],a=C.pts[q.i],b=C.pts[q.i+1],dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1,t=clamp(((x-a[0])*dx+(z-a[1])*dz)/l2,0,1);
 best=Math.min(best,Math.hypot(a[0]+dx*t-x,a[1]+dz*t-z)-C.halfW(q.i));}return best;}
// THE LOD SPINE (BIO.init's origin: station 4's SPINE array, read at call time): the floor's passes fill only near its points, so the
// tableland's places join it: Span's canyon, the twin falls' heads, and the seep pools (one point within 420 m: the floor's budget)
{const P=(u,v)=>[CANYON.M[0]+(u-CANYON.u0)*CANYON.n[0]+v*CANYON.t[0],CANYON.M[1]+(u-CANYON.u0)*CANYON.n[1]+v*CANYON.t[1]];
 const add=p=>{if(!SPINE.some(q=>Math.hypot(q[0]-p[0],q[1]-p[1])<420))SPINE.push([Math.round(p[0]),Math.round(p[1])]);};
 [[620,rimZ(620)-260],P(400,0)].forEach(add);SEEP_POOLS.forEach(Q=>add([Q.x,Q.z]));}
// the kit's fields (59's tableZones): FIELD is station 4's object (47-host-land.js), read by BIO.field at call time
Object.assign(FIELD,{table:(x,z)=>twinNear(x,z)<2||seepPoolAt(x,z)?0:TL.at(TL.a.table,x,z),dome:(x,z)=>TL.at(TL.a.dome,x,z),
 swamp:(x,z)=>twinNear(x,z)<1.5?0:TL.at(TL.a.swamp,x,z),pool:(x,z)=>{const P=seepPoolAt(x,z);return P?smooth(P.r,P.r*.6,Math.hypot(x-P.x,z-P.z)):0;}});
