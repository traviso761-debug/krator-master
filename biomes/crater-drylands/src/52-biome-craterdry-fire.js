// ================================================================= CRATER DRYLANDS — the fire history
// The drylands are a mosaic of burns of every age, and this fragment makes it: a fire-spread model run over the map
// for a few decades of fires, oldest first. It reads only the host's terrain and fields (rock, flow, wet, water),
// so a world that binds them gets its own mosaic. [G data]: no browser, no three.js.
//
// One fire is a shortest-time spread (Dijkstra on a 20 m grid, 8 neighbours) from its ignition point. A step's
// speed is the cell's BURNABILITY (no fuel on bare rock, little on wash sand or by the seep, uneven patches inside
// every fire so it leaves unburnt islands) times its FUEL (how long since it last burned: ground burnt less than a
// year ago will not carry fire, and the load builds over six years) times the WIND (the foehn off the Throne: a
// fire runs downwind about thirty times faster than into the wind) times the SLOPE (fire runs uphill). The fire
// takes the cells it reaches first until it has its share of the map. Because each fire is stopped by the fresh
// burns before it, the burns tile the land in patches of different ages, as real fire mosaics do.
//
// What it gives: CRATERDRY.ageAt(x,z), the years since the ground last burned (60 if it never has in the record),
// fireAt(x,z) -> {age, fire} (the fire's index in FIRE.fires), and frontAt(x,z): when the NEWEST fire reached a
// point, 0 at its ignition to 1 at its last cell, -1 outside it. frontAt is the arrival-time map a live fire
// effect would sweep through (core/atmos: the burn's flame line at frontAt = t, char behind it).
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm}=BIO.fn;
const F=CRATERDRY;
F.FIRE=null;
F.NEVER=60;   // the age of ground no recorded fire reached
// the fuel a cell carries `a` years after it last burned: none for the first year, full by six, a little more as
// the scrub grows old and dead wood piles up
F.fuelK=a=>smooth(1.1,6,a)*(1+.15*smooth(10,25,a));
// a small binary heap of cell indices keyed by time (lazy deletion: a stale entry is skipped when popped)
function Heap(cap){const K=new Float32Array(cap),V=new Int32Array(cap);let n=0;
 return{get size(){return n;},push(k,v){let i=n++;while(i>0){const p=(i-1)>>1;if(K[p]<=k)break;K[i]=K[p];V[i]=V[p];i=p;}K[i]=k;V[i]=v;},
  pop(o){o.k=K[0];o.v=V[0];const k=K[--n],v=V[n];let i=0;for(;;){let c=2*i+1;if(c>=n)break;if(c+1<n&&K[c+1]<K[c])c++;if(K[c]>=k)break;K[i]=K[c];V[i]=V[c];i=c;}K[i]=k;V[i]=v;return o;},
  clear(){n=0;}};}
// o: {R, cell, seed, wind:[dx,dz] (blowing toward), fires:[{ago, x, z, frac, veer}] (the host's recent ones),
//     old: how many older fires to light at random (7..45 years ago)}
F.fireHistory=function(o){o=o||{};const R=o.R||2600,cs=o.cell||20,N=Math.ceil(2*R/cs)+1,x0=-R,z0=-R,NN=N*N;
 reseed(o.seed||520031);
 const H=new Float32Array(NN),base=new Float32Array(NN),last=new Float32Array(NN).fill(F.NEVER),id=new Int16Array(NN).fill(-1),front=new Float32Array(NN).fill(-1);
 let inside=0;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const k=j*N+i,x=x0+i*cs,z=z0+j*cs;H[k]=BIO.terrainH(x,z);
  if(Math.hypot(x,z)>R*1.02)continue;inside++;
  const rock=BIO.field('rock',x,z),flow=BIO.field('flow',x,z),wet=BIO.field('wet',x,z),water=BIO.depth(x,z)>-.2;
  const patch=.5+.9*smooth(.28,.72,fbm(x*.0042+7,z*.0042-3,521,2));
  base[k]=water?0:Math.pow(1-rock,2)*(1-.72*flow)*(1-.7*smooth(.35,.8,wet))*patch;}
 const wl=Math.hypot(o.wind?o.wind[0]:-.56,o.wind?o.wind[1]:-.83)||1,W0=[(o.wind?o.wind[0]:-.56)/wl,(o.wind?o.wind[1]:-.83)/wl];
 // the fires: the host's recent ones, then older ones lit at random on ground that will burn; oldest first
 const fires=(o.fires||[]).map(f=>Object.assign({veer:0},f));
 const nOld=o.old==null?8:o.old;
 for(let k=0;k<nOld;k++){let x=0,z=0;for(let t=0;t<30;t++){const a=rr(0,TAU),d=R*.88*Math.sqrt(rng());x=Math.cos(a)*d;z=Math.sin(a)*d;
   const i=Math.round((x-x0)/cs),j=Math.round((z-z0)/cs);if(base[j*N+i]>.45)break;}
  fires.push({ago:lerp(7,45,nOld>1?k/(nOld-1):0)*rr(.88,1.12),x,z,frac:rr(.05,.11),veer:rr(-.35,.35)});}
 fires.sort((a,b)=>b.ago-a.ago);
 const T=new Float32Array(NN),heap=Heap(NN*8),tmp={k:0,v:0},D8=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
 const WK=.84;   // the wind's weight: downwind (1+WK)^2 = 3.4x, upwind (1-WK)^2 = 0.03x
 fires.forEach((f,fi)=>{
  // the ignition: the nearest cell that will burn, spiralling out from the asked point
  let ci=Math.round((f.x-x0)/cs),cj=Math.round((f.z-z0)/cs),found=-1;
  for(let r=0;r<40&&found<0;r++)for(let dj=-r;dj<=r&&found<0;dj++)for(let di=-r;di<=r;di++){if(Math.max(Math.abs(di),Math.abs(dj))!==r)continue;
   const i=ci+di,j=cj+dj;if(i<0||j<0||i>=N||j>=N)continue;const k=j*N+i;if(base[k]*F.fuelK(last[k]-f.ago)>.25){found=k;break;}}
  f.cells=0;if(found<0){f.failed=true;return;}
  const ca=Math.cos(f.veer),sa=Math.sin(f.veer),w=[W0[0]*ca-W0[1]*sa,W0[0]*sa+W0[1]*ca];
  const target=Math.max(20,Math.round(f.frac*inside)),newest=fi===fires.length-1,order=[];
  T.fill(Infinity);heap.clear();T[found]=0;heap.push(0,found);
  while(heap.size&&f.cells<target){heap.pop(tmp);const k=tmp.v,t=tmp.k;if(t>T[k])continue;
   if(id[k]===fi)continue;id[k]=fi;last[k]=f.ago;f.cells++;if(newest)order.push(k);
   const i=k%N,j=(k-i)/N;
   for(const d of D8){const ni=i+d[0],nj=j+d[1];if(ni<0||nj<0||ni>=N||nj>=N)continue;const n=nj*N+ni;if(id[n]===fi)continue;
    const L=cs*(d[0]&&d[1]?1.4142:1),dir=[d[0]*cs/L,d[1]*cs/L];
    const s=base[n]*F.fuelK(last[n]-f.ago)*Math.pow(1+WK*(dir[0]*w[0]+dir[1]*w[1]),2)*Math.exp(clamp((H[n]-H[k])/L*3,-1,1.2));
    if(s<.02)continue;const tn=t+L/s;if(tn<T[n]){T[n]=tn;heap.push(tn,n);}}}
  if(newest)order.forEach((k,r)=>{front[k]=r/Math.max(1,order.length-1);});
  f.ix=found%N;f.iz=(found-f.ix)/N;f.x=x0+f.ix*cs;f.z=z0+f.iz*cs;});
 // a nearest-cell lookup with the cell's edge warped by noise, so a burn's edge is sharp but not a staircase
 const cellOf=(x,z)=>{const wx=x+cs*1.1*(fbm(x*.021+3,z*.021,532,2)-.5),wz=z+cs*1.1*(fbm(x*.021,z*.021-5,533,2)-.5);
  const i=clamp(Math.round((wx-x0)/cs),0,N-1),j=clamp(Math.round((wz-z0)/cs),0,N-1);return j*N+i;};
 const out={R,cs,N,x0,z0,last,id,front,base,fires,inside,
  ageAt:(x,z)=>last[cellOf(x,z)],
  fireAt:(x,z)=>{const k=cellOf(x,z);return{age:last[k],fire:id[k]};},
  frontAt:(x,z)=>front[cellOf(x,z)],
  // the share of the map in each stage of the mosaic (the probe's check that every stage is present)
  shares(){const S={char:0,bloom:0,regrow:0,mature:0,never:0};let n=0;for(let k=0;k<NN;k++){if(base[k]<=0&&last[k]>=F.NEVER)continue;n++;const a=last[k];
   if(a<.6)S.char++;else if(a<2.5)S.bloom++;else if(a<7)S.regrow++;else if(a<F.NEVER)S.mature++;else S.never++;}for(const s in S)S[s]=+(S[s]/Math.max(1,n)).toFixed(3);return S;}};
 F.FIRE=out;return out;};
// the age of the ground at a point; before any history is made, one is made with the defaults
F.ageAt=(x,z)=>{if(!F.FIRE)F.fireHistory({});return F.FIRE.ageAt(x,z);};
F.fireAt=(x,z)=>{if(!F.FIRE)F.fireHistory({});return F.FIRE.fireAt(x,z);};
F.frontAt=(x,z)=>{if(!F.FIRE)F.fireHistory({});return F.FIRE.frontAt(x,z);};
// the stages of the mosaic as weights 0..1 from the age (they overlap a little at their edges)
F.stages=a=>({char:smooth(.75,.4,a),bloom:smooth(.3,.6,a)*smooth(2.9,2.0,a),regrow:smooth(2.0,3.0,a)*smooth(8,6,a),mature:smooth(6,8.5,a)});
})();
