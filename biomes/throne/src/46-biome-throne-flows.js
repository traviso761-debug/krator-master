// ================================================================= THE THRONE — the flow history [G data]
// The kit's own model of the lava, as the crater drylands' fire model is theirs: the Throne's ground is a MOSAIC OF
// FLOWS of every age (biomes/throne/NOTES.md, "the kit's spine"). Each flow leaves a vent and runs downhill over the
// ground as it stands (the land, and the older flows already on it), wandering a little, widening into lobes, and
// lays down a sheet of rock a few metres thick with steep margins. Flows run oldest first, so the young lie on top
// and the old show only where nothing has covered them since. What the kit reads is the AGE of the ground: the years
// since lava last covered it (THRONE.ageAt). On the wet side a flow is forest again in decades; on the lee, under the
// plume, the native life takes it instead (55, 60).
// Pure data: no browser, no THREE. A host calls THRONE.flowHistory once, before it binds its terrain, and adds
// FLOWS.thickAt to its ground (47 does); an open world would run it over its region once, or bind an age field of
// its own (the kit reads only THRONE.ageAt and THRONE.FLOWS.idAt).
var THRONE={};
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm}=BIO.fn;
THRONE.OLD=8000;   // years: the age of ground no recorded flow reached (the shield's old surface, deep in ash soil)

// flowHistory({R, cell, baseH(x,z), old, flows:[{key, name, x, z, age, len, w:[w0,w1], th:[t0,t1], veer, wander, seed}]})
//  -> FLOWS {R, cs, N, x0, z0, thick, age, id, flows, ageAt, thickAt, idAt, shares()}
//  w the width (m) at the vent and at the far end, th the thickness (m); veer a steady turn (radians per km) to one
//  side of the fall line; wander how far the path strays from it
THRONE.flowHistory=function(o){
 const R=o.R||2700,cs=o.cell||8,N=Math.ceil(2*R/cs)+1,x0=-R,z0=-R,old=o.old||THRONE.OLD;
 const B=new Float32Array(N*N),thick=new Float32Array(N*N),age=new Float32Array(N*N).fill(old),id=new Int16Array(N*N).fill(-1),cur=new Float32Array(N*N);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++)B[j*N+i]=o.baseH(x0+i*cs,z0+j*cs);
 // the surface as it stands, bilinear
 const S=(x,z)=>{const u=clamp((x-x0)/cs,0,N-1.001),v=clamp((z-z0)/cs,0,N-1.001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,k=j*N+i;
  const a=B[k]+thick[k],b=B[k+1]+thick[k+1],c=B[k+N]+thick[k+N],d=B[k+N+1]+thick[k+N+1];return a*(1-fu)*(1-fv)+b*fu*(1-fv)+c*(1-fu)*fv+d*fu*fv;};
 const flows=(o.flows||[]).map((F,fi)=>Object.assign({fi},F)).sort((a,b)=>b.age-a.age);
 for(const F of flows){reseed(F.seed||(9100+F.fi*37));
  const step=cs*1.25,n=Math.ceil(F.len/step),path=[],sd=(F.seed||F.fi)*.37;
  let x=F.x,z=F.z,dx=0,dz=0;
  for(let k=0;k<=n;k++){const t=k/n,e=cs*2;
   // the fall line here, turned by the flow's veer and its wander
   let gx=-(S(x+e,z)-S(x-e,z)),gz=-(S(x,z+e)-S(x,z-e));const gl=Math.hypot(gx,gz);
   if(gl>1e-6){gx/=gl;gz/=gl;}else{gx=dx;gz=dz;}
   const turn=(F.veer||0)*k*step/1000*.15+(F.wander||.5)*(fbm(k*step*.0025+sd,sd,4170,2)-.5)*2;
   const ca=Math.cos(turn),sa=Math.sin(turn),tx=gx*ca-gz*sa,tz=gx*sa+gz*ca;
   if(k===0){dx=tx;dz=tz;}else{dx=dx*.72+tx*.28;dz=dz*.72+tz*.28;const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;}
   // width: from the vent's to the far end's, swelling into lobes; thickness: thinner near the vent, a steep front
   const w=mix(F.w[0],F.w[1],Math.pow(t,.7))*(1+.55*(fbm(t*7+sd,sd*2,4171,2)-.5)),th=mix(F.th[0],F.th[1],t);
   path.push({x,z,w,th,t});
   x+=dx*step;z+=dz*step;
   if(Math.abs(x)>R-20||Math.abs(z)>R-20)break;}
  // lay the sheet: flat-topped, steep-edged, the edge ragged (toes and lobes)
  let i0=N,i1=0,j0=N,j1=0,cells=0;
  for(const p of path){const hw=p.w*.5,rr0=hw*1.3,ia=Math.max(0,Math.floor((p.x-rr0-x0)/cs)),ib=Math.min(N-1,Math.ceil((p.x+rr0-x0)/cs)),ja=Math.max(0,Math.floor((p.z-rr0-z0)/cs)),jb=Math.min(N-1,Math.ceil((p.z+rr0-z0)/cs));
   i0=Math.min(i0,ia);i1=Math.max(i1,ib);j0=Math.min(j0,ja);j1=Math.max(j1,jb);
   for(let j=ja;j<=jb;j++)for(let i=ia;i<=ib;i++){const cx=x0+i*cs,cz=z0+j*cs,d=Math.hypot(cx-p.x,cz-p.z)/hw;if(d>1.3)continue;
    const rag=(fbm(cx*.018+sd,cz*.018-sd,4172,2)-.5)*.55,v=p.th*smooth(1.0,.78,d+rag);const k=j*N+i;if(v>cur[k])cur[k]=v;}}
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const k=j*N+i,v=cur[k];if(v<=0)continue;cur[k]=0;thick[k]+=v;if(v>.35){age[k]=F.age;id[k]=F.fi;cells++;}}
  F.path=path;F.cells=cells;}
 const at=(A,x,z)=>{const i=Math.round(clamp((x-x0)/cs,0,N-1)),j=Math.round(clamp((z-z0)/cs,0,N-1));return A[j*N+i];};
 const FL={R,cs,N,x0,z0,thick,age,id,old,flows:flows.sort((a,b)=>a.fi-b.fi),
  ageAt:(x,z)=>at(age,x,z),idAt:(x,z)=>at(id,x,z),
  thickAt:(x,z)=>{const u=clamp((x-x0)/cs,0,N-1.001),v=clamp((z-z0)/cs,0,N-1.001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,k=j*N+i;
   return thick[k]*(1-fu)*(1-fv)+thick[k+1]*fu*(1-fv)+thick[k+N]*(1-fu)*fv+thick[k+N+1]*fu*fv;},
  // the share of the map in each stage of the mosaic
  shares:()=>{const s={fresh:0,young:0,mature:0,old:0};let n=0;for(let k=0;k<age.length;k+=3){const g=THRONE.stages(age[k]);for(const q in s)s[q]+=g[q];n++;}for(const q in s)s[q]/=n;return s;}};
 THRONE.FLOWS=FL;return FL;};

// the mosaic's stages as weights summing to 1, by the years since lava last covered the ground:
//   fresh   under ~15 years: bare black rock, glassy, steaming in the first; lichen and the mat its only life
//   young   ~15 to ~150: the pioneers in the cracks (ferns and lichen on the shoulder, the native mats and caps under
//           the plume); scattered small trees
//   mature  ~150 to ~1200: woodland on the shoulder, the native forests under the plume
//   old     older: the shield's deep soil (ash on the lee, red earth on the shoulder), the tallest trees
THRONE.stages=function(a){const fresh=smooth(26,9,a),young=smooth(9,26,a)*smooth(230,95,a),mature=smooth(95,230,a)*smooth(1700,950,a),old=smooth(950,1700,a);
 const s=fresh+young+mature+old||1;return{fresh:fresh/s,young:young/s,mature:mature/s,old:old/s};};
THRONE.ageAt=(x,z)=>THRONE.FLOWS?THRONE.FLOWS.ageAt(x,z):THRONE.OLD;
THRONE.flowAt=(x,z)=>{const F=THRONE.FLOWS;if(!F)return null;const i=F.idAt(x,z);return i>=0?F.flows[i]:null;};
})();
