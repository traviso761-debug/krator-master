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
  base[k]=water||rock>.8?0:Math.pow(1-rock,2)*(1-.72*flow)*(1-.7*smooth(.35,.8,wet))*patch;}
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
 const out={R,cs,N,x0,z0,last,id,front,base,fires,inside,H,wind:W0,
  ageAt:(x,z)=>last[cellOf(x,z)],
  fireAt:(x,z)=>{const k=cellOf(x,z);return{age:last[k],fire:id[k]};},
  frontAt:(x,z)=>front[cellOf(x,z)],
  // the share of the map in each stage of the mosaic (the probe's check that every stage is present)
  shares(){const S={char:0,bloom:0,regrow:0,mature:0,never:0};let n=0;for(let k=0;k<NN;k++){if(base[k]<=0&&last[k]>=F.NEVER)continue;n++;const a=last[k];
   if(a<.6)S.char++;else if(a<2.5)S.bloom++;else if(a<7)S.regrow++;else if(a<F.NEVER)S.mature++;else S.never++;}for(const s in S)S[s]=+(S[s]/Math.max(1,n)).toFixed(3);return S;}};
 F.FIRE=out;return out;};
// A LIVE FIRE (the data a fire effect sweeps through, 89-host-fire.js): one fire lit NOW at (x,z), spreading by the
// same rule through the fuel the history left. Ground burnt in the last year will not carry it, and the kopjes, the
// washes' sand and the seep stop it, as they stopped the fires before it. o: {x, z, wind:[dx,dz] (blowing toward;
// default the history's), maxT seconds (default 1800), maxCells}. Returns, for every cell of the history's grid, the
// ARRIVAL time in seconds (Infinity where it never arrives), and the cells in the order they caught (`order`, so a
// time window is a slice of it). FIRE_SEC turns the model's units into seconds: a 20 m step downwind in old scrub is
// about six units, so the front runs about 2 m/s downwind and crawls into the wind. A fire lit where nothing will burn
// (the granite, a fresh burn) does not take: {ok:false}.
F.FIRE_SEC=1.6;F.FLAME_H=12;   // the flame height (m): foliage below it burns, crowns above it survive
F.fireRun=function(o){o=o||{};const HI=F.FIRE||F.fireHistory({}),N=HI.N,cs=HI.cs,x0=HI.x0,z0=HI.z0,NN=N*N,H=HI.H,base=HI.base,last=HI.last;
 const w0=o.wind||HI.wind,wl=Math.hypot(w0[0],w0[1])||1,w=[w0[0]/wl,w0[1]/wl],WK=.84;
 const maxT=(o.maxT==null?1800:o.maxT)/F.FIRE_SEC,maxCells=o.maxCells||Math.round(NN*.15);
 const fuel=k=>base[k]*F.fuelK(last[k]);
 let ci=Math.round((o.x-x0)/cs),cj=Math.round((o.z-z0)/cs),found=-1;
 for(let r=0;r<3&&found<0;r++)for(let dj=-r;dj<=r&&found<0;dj++)for(let di=-r;di<=r;di++){if(Math.max(Math.abs(di),Math.abs(dj))!==r)continue;
  const i=ci+di,j=cj+dj;if(i<0||j<0||i>=N||j>=N)continue;const k=j*N+i;if(fuel(k)>.2){found=k;break;}}
 if(found<0)return{ok:false,why:'nothing here will burn (granite, sand, water or a fresh burn)',N,cs,x0,z0,arrive:null,order:[],wind:w};
 const T=new Float32Array(NN).fill(Infinity),done=new Uint8Array(NN),order=[],heap=Heap(NN*8),tmp={k:0,v:0},D8=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
 T[found]=0;heap.push(0,found);
 while(heap.size&&order.length<maxCells){heap.pop(tmp);const k=tmp.v,t=tmp.k;if(t>T[k]||done[k])continue;if(t>maxT)break;done[k]=1;order.push(k);
  const i=k%N,j=(k-i)/N;
  for(const d of D8){const ni=i+d[0],nj=j+d[1];if(ni<0||nj<0||ni>=N||nj>=N)continue;const n=nj*N+ni;if(done[n])continue;
   const L=cs*(d[0]&&d[1]?1.4142:1),dir=[d[0]*cs/L,d[1]*cs/L];
   const sp=fuel(n)*Math.pow(1+WK*(dir[0]*w[0]+dir[1]*w[1]),2)*Math.exp(clamp((H[n]-H[k])/L*3,-1,1.2));
   if(sp<.02)continue;const tn=t+L/sp;if(tn<T[n]){T[n]=tn;heap.push(tn,n);}}}
 const arrive=new Float32Array(NN).fill(Infinity);for(const k of order)arrive[k]=T[k]*F.FIRE_SEC;
 const fi=found%N,fj=(found-fi)/N;
 return{ok:true,N,cs,x0,z0,H,arrive,order,wind:w,x:x0+fi*cs,z:z0+fj*cs,
  // the arrival time at a point (nearest cell), and the index range of `order` that caught in [t0, t1)
  at:(x,z)=>{const i=clamp(Math.round((x-x0)/cs),0,N-1),j=clamp(Math.round((z-z0)/cs),0,N-1);return arrive[j*N+i];},
  range(t0,t1){const lo=t=>{let a=0,b=order.length;while(a<b){const m=(a+b)>>1;if(arrive[order[m]]<t)a=m+1;else b=m;}return a;};return[lo(t0),lo(t1)];},
  // the state of the ground at a point at time t: what a game needs from it (a hazard, a way through)
  state:(x,z,t)=>{const i=clamp(Math.round((x-x0)/cs),0,N-1),j=clamp(Math.round((z-z0)/cs),0,N-1),A=arrive[j*N+i];
   return !(A<Infinity)||t<A?'unburnt':t<A+30?'burning':t<A+400?'smouldering':'burnt';}};};
// the age of the ground at a point; before any history is made, one is made with the defaults
F.ageAt=(x,z)=>{if(!F.FIRE)F.fireHistory({});return F.FIRE.ageAt(x,z);};
F.fireAt=(x,z)=>{if(!F.FIRE)F.fireHistory({});return F.FIRE.fireAt(x,z);};
F.frontAt=(x,z)=>{if(!F.FIRE)F.fireHistory({});return F.FIRE.frontAt(x,z);};
// the stages of the mosaic as weights 0..1 from the age (they overlap a little at their edges)
F.stages=a=>({char:smooth(.75,.4,a),bloom:smooth(.3,.6,a)*smooth(2.9,2.0,a),regrow:smooth(2.0,3.0,a)*smooth(8,6,a),mature:smooth(6,8.5,a)});
})();
