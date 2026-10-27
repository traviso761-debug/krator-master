// ================================================================= CORE — lava: a Bingham flow over a heightfield (KLAVA)
// [G data] Plain functions on typed arrays: no THREE, no DOM, no Math.random, no trig hash (the one draw, the ground's
// roughness, is KRAND.hash keyed on the lattice point). Godot's twin is core/terrain/klava.gd (golden-lava.json holds both
// to the same numbers). The MAGFLOW family (Vicari et al. 2007, Del Negro et al. 2008; INGV GPUFLOW): a cellular automaton
// on the KFIELD lattice whose cells hold the ground z, the lava's thickness h and its temperature T. Each step:
//   1. flux    every cell with lava sends to each lower neighbour (eight: four faces, four corners) the Bingham sheet flux
//              q = w G (he - hc)^2 (he + hc/2) / (3 eta), G = rho g sin(theta), hc = Sy / G (the yield thickness: none
//              flows below it, so a flow stops on a slope at hc, a pile on the flat), he the column above the neighbour's
//              ground; eta and Sy from the cell's T (RHEO). As Sy -> 0 it is Jeffreys' sheet, q/w = G he^3 / (3 eta).
//              Each pair's volume is capped at a share of the drop between them (the shares sum to 1/2: never overshoots,
//              stable at any dt) and a cell never sends more than it holds
//   2. gather  each cell takes what its neighbours sent, its heat mixed by volume (two passes over buffers: no order)
//   3. sources vents add Q(t) dt at their temperature; ponds hold their cells at a level (a lake that spills over its lip)
//   4. cooling radiation from the hot fraction of the top, T' = T / (1 + 3 eps f sigma T^3 dt / (rho c h))^(1/3) (MAGFLOW's
//              closed form), then conduction into the ground (implicit); at the solidus the column freezes: its h joins
//              the ground (z, dep) and stops being lava
// The face weights (2/3 a face, sqrt2/6 a corner) make a uniform sheet's flux per unit width Jeffreys' in any direction to
// first order and the stencil the isotropic nine-point one. Everything is in metres, seconds, kilograms and kelvin.
//
//   KLAVA.create({field | x0,z0,step,nx,nz,heights, box:[x0,z0,x1,z1], stride:1, rheo: RHEO.basalt (or a partial),
//                 seed, rough: 0 (m of fixed per-point roughness: breaks the lattice's symmetry into lobes), hmin: .02,
//                 edge: 'drain' | 'wall', cfl: .5, dtMax: 60, dtMin: .05})  -> a sim on the field's lattice points in box
//                 (every stride-th; the ground read with f.h, so insets count)
//   sim.vent({x, z, r, Q: m3/s | fn(t), T, name})   a source: Q dt spread evenly over the cells within r (the nearest if none)
//   sim.pond({inside(x,z) | cells:[k...], level: m | fn(t, out), T, name})   cells held at max(0, level - z), T: a lake;
//                 out (m3, the net volume that left them) is its ledger: fn(t, out) is how a page's lake level follows it
//   sim.step(dt)         one step of dt s;  sim.run(seconds) -> {steps, t}: steps of dtNext (the front's CFL) to it
//   sim.dtNext           cfl * step / the fastest mean velocity of the last step, in [dtMin, dtMax]
//   sim.cs               the cell size (m: the field's step times stride); sim.x0, z0, nx, nz the lattice
//   sim.z, h, T, dep, vx, vz (Float64Array: ground with deposits, thickness, temperature, frozen thickness, velocity)
//   sim.frozeAt          Float64Array: sim.t when the cell last froze (NaN never)
//   sim.at(x,z,out)      the nearest cell: {k, h, T, z, dep, surf (z+h), molten, heat 0..1, crust 0..1, vx, vz, frozeAt}
//   sim.heat(k)          (T - Tsol) / (Tvent - Tsol) clamped: the hook a lava shader's glow reads (crust = 1 - heat)
//   sim.mass()           {erupted, molten, frozen, lost, pondOut, error}: erupted = molten + frozen + lost to rounding
//   sim.box()            the cells with lava or a source (i0, j0, i1, j1) and sim.molten (how many hold moving lava)
//   sim.front()          the molten cells beside a cell without: [[x, z], ...] (a walker's, an NPC's keep-out line)
//   sim.writeBack(f, o)  adds the deposits not yet written to a KFIELD's heights (each of its lattice points and its insets',
//                        bilinear from the sim's cells): the solidified flow as new ground. Returns the points raised. o.all: every
//                        deposit (a page that put its field back first); o.each(g, k): called for each point raised (g the
//                        field or the inset, k its index), so the page can move its ground mesh's vertex
//   sim.snapshot() / sim.restore(s)   the state (a time-lapse that goes back)
//   sim.hazard(o) -> {at, hazard}: a KHAZ record's tags.hazard over the sim's box, stateFn 'KLAVA.flow'; KLAVA.bind(rec, sim)
//                        binds the sim (a page's state, as KHAZ.bindFire's run): molten k 1, a fresh crust (frozen within
//                        o.hot s of sim time, a day by default) k .25, else 0. o.key: bind by a key instead of the tags
//                        record's id (KLAVA.bind(key, sim); it rides in the hazard's seed); o.nav: the record's nav costs
//   sim.export()         {format:'krator-lava', version:1, x0, z0, step, nx, nz, t, rheo, h, T, dep (base64 Float32)}
//   KLAVA.flux(he, dH, d, w, eta, Sy, rhog)   the pair's flux (m3/s); KLAVA.rheo(R, T) -> {eta, Sy}; KLAVA.RHEO
(function(root){
'use strict';
const SIGMA=5.670374e-8,G0=9.81,SQ2=Math.SQRT2;
// the eight neighbours, opposite pairs adjacent (opp(n) = n ^ 1): E W S N SE NW SW NE
const DI=[1,-1,0,0,1,-1,-1,1],DJ=[0,0,1,-1,1,-1,1,-1];
const WO=2/3,WD=SQ2/6;                         // the face widths (times step): a face's, a corner's
const KO=.1,KD=.025;                           // the caps, times A dH: 4 KO + 4 KD = 1/2
// the rheology: eta [A, B] is log10 eta = A + B T, [A, B, C] is A + B / (T - C) (VFT); yield [A, B] log10 Sy = A + B T
const RHEO={
 // a hot, fluid basalt (the default): eta 10^3.5 Pa s at 1400 K to 10^7 at the solidus (1173 K); Sy 100 Pa to 100 kPa
 basalt:{rho:2600,cp:1150,emis:.9,exposed:.1,Tvent:1400,Tsol:1173,Tair:280,Tground:300,kc:2,dc:2,eta:[25.0882,-.015419],yld:[20.5,-.013216],etaMin:1},
 // MAGFLOW's Etnean basalt: Giordano & Dingwell 2003's VFT viscosity, Ishihara et al. 1990's yield
 etna:{rho:2600,cp:1150,emis:.9,exposed:.1,Tvent:1360,Tsol:1143,Tair:280,Tground:300,kc:2,dc:2,eta:[-4.643,5812.44,427.04],yld:[13.00997,-.0089],etaMin:1}};
function rheo(R,T,out){out=out||{};const e=R.eta;
 const le=e.length>2?e[0]+e[1]/Math.max(1,T-e[2]):e[0]+e[1]*T;
 out.eta=Math.max(R.etaMin==null?1:R.etaMin,Math.pow(10,le));out.Sy=Math.pow(10,R.yld[0]+R.yld[1]*T);return out;}
// the Bingham sheet's flux (m3/s) from a column he thick, the surfaces dH apart over d, across a face w wide
function flux(he,dH,d,w,eta,Sy,rhog){if(!(he>0)||!(dH>0))return 0;
 const G=rhog*dH/Math.sqrt(dH*dH+d*d),hc=Sy/G;if(he<=hc)return 0;const e=he-hc;
 return w*G*e*e*(he+.5*hc)/(3*eta);}
const B64=()=>root.KFIELD||null;

function create(o){
 o=o||{};const F=o.field||null;
 const fx0=F?F.x0:+o.x0,fz0=F?F.z0:+o.z0,fst=F?F.step:+o.step,fnx=F?F.nx:o.nx|0,fnz=F?F.nz:o.nz|0;
 if(!(fst>0)||!(fnx>1)||!(fnz>1))throw new Error('KLAVA.create: a field (or x0, z0, step, nx, nz, heights) of 2 x 2 or more');
 const hf=F?F.h:(x,z)=>{const H=o.heights;let i=Math.round((x-fx0)/fst),j=Math.round((z-fz0)/fst);i=i<0?0:i>fnx-1?fnx-1:i;j=j<0?0:j>fnz-1?fnz-1:j;return H[j*fnx+i];};
 const S=o.stride==null?1:Math.max(1,o.stride|0),step=fst*S;
 const b=o.box||[fx0,fz0,fx0+(fnx-1)*fst,fz0+(fnz-1)*fst];
 const I0=Math.max(0,Math.ceil((b[0]-fx0)/fst-1e-9)),J0=Math.max(0,Math.ceil((b[1]-fz0)/fst-1e-9));
 const I1=Math.min(fnx-1,Math.floor((b[2]-fx0)/fst+1e-9)),J1=Math.min(fnz-1,Math.floor((b[3]-fz0)/fst+1e-9));
 const nx=Math.floor((I1-I0)/S)+1,nz=Math.floor((J1-J0)/S)+1;
 if(nx<2||nz<2)throw new Error('KLAVA.create: the box holds fewer than 2 x 2 cells');
 const x0=fx0+I0*fst,z0=fz0+J0*fst,N=nx*nz,A=step*step;
 const R=Object.assign({},RHEO.basalt,o.rheo||{}),rhog=R.rho*G0,hmin=o.hmin==null?.02:o.hmin;
 const edge=o.edge||'drain',cfl=o.cfl==null?.5:o.cfl,dtMax=o.dtMax==null?60:o.dtMax,dtMin=o.dtMin==null?.05:o.dtMin;
 const z=new Float64Array(N),h=new Float64Array(N),T=new Float64Array(N),dep=new Float64Array(N),rough=new Float64Array(N);
 const vx=new Float64Array(N),vz=new Float64Array(N),frozeAt=new Float64Array(N).fill(NaN);
 const h2=new Float64Array(N),E2=new Float64Array(N),out=new Float64Array(N*8),wrote=new Float64Array(N);
 const pondOf=new Int16Array(N).fill(-1),ventW=new Float64Array(N);
 const seed=o.seed==null?1:o.seed,rk=o.rough||0,KR=root.KRAND;
 if(rk&&!KR)throw new Error('KLAVA: rough needs core/rand (KRAND) loaded first');
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i;z[k]=hf(x0+i*step,z0+j*step);
  if(rk)rough[k]=rk*(KR.unit(KR.hash(seed,I0+i*S,J0+j*S,0x1A7A))-.5);}
 const D=[step,step,step,step,step*SQ2,step*SQ2,step*SQ2,step*SQ2],W=[WO,WO,WO,WO,WD,WD,WD,WD].map(v=>v*step),KAP=[KO,KO,KO,KO,KD,KD,KD,KD];
 const vents=[],ponds=[],L={vent:0,pondOut:0,lost:0};
 let bi0=nx,bj0=nz,bi1=-1,bj1=-1;
 const grow=k=>{const i=k%nx,j=(k-i)/nx;if(i<bi0)bi0=i;if(i>bi1)bi1=i;if(j<bj0)bj0=j;if(j>bj1)bj1=j;};
 const cellOf=(x,zz)=>{let i=Math.round((x-x0)/step),j=Math.round((zz-z0)/step);if(i<0||j<0||i>nx-1||j>nz-1)return -1;return j*nx+i;};
 const RH={};
 const sim={x0,z0,cs:step,nx,nz,N,stride:S,rheo:R,hmin,edge,pondOf,z,h,T,dep,vx,vz,frozeAt,rough,t:0,steps:0,dtNext:dtMax,molten:0,vents,ponds,
  heat:k=>{const v=(T[k]-R.Tsol)/(R.Tvent-R.Tsol);return h[k]>0?(v<0?0:v>1?1:v):0;},
  vent(v){const r=v.r||0,ks=[];
   for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const dx=x0+i*step-v.x,dz=z0+j*step-v.z;if(dx*dx+dz*dz<=r*r)ks.push(j*nx+i);}
   if(!ks.length){const k=cellOf(v.x,v.z);if(k<0)throw new Error('KLAVA.vent: ('+v.x+', '+v.z+') is outside the sim');ks.push(k);}
   const V={name:v.name||'vent '+vents.length,x:v.x,z:v.z,r,Q:v.Q,T:v.T==null?R.Tvent:v.T,cells:ks,poured:0};
   ks.forEach(grow);vents.push(V);return V;},
  pond(p){let ks=p.cells;if(!ks){ks=[];for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)if(p.inside(x0+i*step,z0+j*step))ks.push(j*nx+i);}
   const P={name:p.name||'pond '+ponds.length,level:p.level,T:p.T==null?R.Tvent:p.T,cells:ks,out:0,L:NaN,id:ponds.length};
   ks.forEach(k=>{pondOf[k]=P.id;grow(k);});ponds.push(P);return P;},
  step(dt){dt=+dt;if(!(dt>0))throw new Error('KLAVA.step: dt must be positive');
   const t=sim.t;
   // the ponds first: their cells at the level, at their temperature
   for(const P of ponds){const Lv=typeof P.level==='function'?P.level(t,P.out):P.level;P.L=Lv;
    for(const k of P.cells){const d=Lv-z[k];h[k]=d>0?d:0;T[k]=P.T;}}
   const i0=Math.max(0,bi0-1),j0=Math.max(0,bj0-1),i1=Math.min(nx-1,bi1+1),j1=Math.min(nz-1,bj1+1);
   if(i1<i0){sim.t+=dt;sim.steps++;return dt;}
   let umax=0;
   // 1. flux: each cell's volumes to its eight neighbours (out-of-grid: the slope carried on past the edge; 'wall' none)
   for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const c=j*nx+i,o8=c*8;for(let n=0;n<8;n++)out[o8+n]=0;
    const hc=h[c];if(!(hc>hmin))continue;
    const zc=z[c]+rough[c],Hc=zc+hc;rheo(R,T[c],RH);let tot=0;
    for(let n=0;n<8;n++){const ii=i+DI[n],jj=j+DJ[n];let zn,Hn;
     if(ii>=0&&jj>=0&&ii<nx&&jj<nz){const k=jj*nx+ii;zn=z[k]+rough[k];Hn=zn+h[k];}
     else{if(edge==='wall')continue;const mi=Math.min(nx-1,Math.max(0,i-DI[n])),mj=Math.min(nz-1,Math.max(0,j-DJ[n])),m=mj*nx+mi;zn=2*zc-z[m]-rough[m];Hn=zn;}
     const dH=Hc-Hn;if(!(dH>0))continue;
     const he=Math.min(hc,Hc-zn),q=flux(he,dH,D[n],W[n],RH.eta,RH.Sy,rhog);if(!(q>0))continue;
     let v=q*dt;const cap=KAP[n]*A*dH;if(v>cap)v=cap;out[o8+n]=v;tot+=v;
     const u=q/(W[n]*he);if(u>umax)umax=u;}
    if(tot>hc*A){const s=hc*A/tot;for(let n=0;n<8;n++)out[o8+n]*=s;}}
   // 2. gather: what each cell keeps and takes, its heat mixed by volume; the off-grid losses and the ponds' ledger
   for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const c=j*nx+i,o8=c*8,pc=pondOf[c];let so=0,fx=0,fz=0;
    for(let n=0;n<8;n++){const v=out[o8+n];if(v===0)continue;so+=v;fx+=v*DI[n];fz+=v*DJ[n];
     const ii=i+DI[n],jj=j+DJ[n];if(ii<0||jj<0||ii>=nx||jj>=nz){L.lost+=v;if(pc>=0)ponds[pc].out+=v;}}
    let V=h[c]*A-so,E=T[c]*V;
    for(let n=0;n<8;n++){const ii=i+DI[n],jj=j+DJ[n];if(ii<0||jj<0||ii>=nx||jj>=nz)continue;
     const k=jj*nx+ii,v=out[k*8+(n^1)];if(v===0)continue;V+=v;E+=v*T[k];fx-=v*DI[n];fz-=v*DJ[n];
     const pk=pondOf[k];if(pk!==pc){if(pk>=0)ponds[pk].out+=v;if(pc>=0)ponds[pc].out-=v;}}
    if(V<0)V=0;h2[c]=V/A;E2[c]=V>0?E/V:T[c];
    const hm=Math.max(h2[c],hmin);vx[c]=fx/(2*dt*step*hm);vz[c]=fz/(2*dt*step*hm);   /* the mean of what left and what came: a face is counted from both sides */}
   for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const c=j*nx+i;h[c]=h2[c];T[c]=E2[c];}
   // 3. vents
   for(const V of vents){const Q=typeof V.Q==='function'?V.Q(t):V.Q,vol=(Q>0?Q:0)*dt;if(!(vol>0))continue;const per=vol/V.cells.length;
    for(const k of V.cells){const v0=h[k]*A;T[k]=(T[k]*v0+V.T*per)/(v0+per);h[k]+=per/A;}V.poured+=vol;L.vent+=vol;}
   // 4. cooling and freezing (not the ponds': they are held); the box and the molten count for the next step
   const ra=3*R.emis*R.exposed*SIGMA*dt/(R.rho*R.cp),ca=R.kc*dt/(R.dc*R.rho*R.cp);
   let a0=nx,b0=nz,a1=-1,b1=-1,mol=0;
   for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const c=j*nx+i;
    if(pondOf[c]>=0){if(i<a0)a0=i;if(i>a1)a1=i;if(j<b0)b0=j;if(j>b1)b1=j;continue;}
    const hc=h[c];if(!(hc>0)){vx[c]=vz[c]=0;continue;}
    let Tc=T[c];Tc=Tc/Math.pow(1+ra*Tc*Tc*Tc/hc,1/3);Tc=(Tc+ca/hc*R.Tground)/(1+ca/hc);T[c]=Tc;
    if(Tc<=R.Tsol){z[c]+=hc;dep[c]+=hc;h[c]=0;vx[c]=vz[c]=0;frozeAt[c]=t+dt;continue;}
    if(hc>hmin)mol++;if(i<a0)a0=i;if(i>a1)a1=i;if(j<b0)b0=j;if(j>b1)b1=j;}
   for(const V of vents)for(const k of V.cells){const i=k%nx,j=(k-i)/nx;if(i<a0)a0=i;if(i>a1)a1=i;if(j<b0)b0=j;if(j>b1)b1=j;}
   bi0=a0;bj0=b0;bi1=a1;bj1=b1;sim.molten=mol;
   const dn=umax>0?cfl*step/umax:dtMax;sim.dtNext=dn<dtMin?dtMin:dn>dtMax?dtMax:dn;
   sim.t=t+dt;sim.steps++;return dt;},
  run(seconds){const end=sim.t+seconds;let n=0;
   while(sim.t<end-1e-9){const dt=Math.min(sim.dtNext,end-sim.t);sim.step(dt);n++;}return {steps:n,t:sim.t};},
  box:()=>[bi0,bj0,bi1,bj1],
  at(x,zz,o2){o2=o2||{};let i=Math.round((x-x0)/step),j=Math.round((zz-z0)/step);i=i<0?0:i>nx-1?nx-1:i;j=j<0?0:j>nz-1?nz-1:j;
   const k=j*nx+i;o2.k=k;o2.h=h[k];o2.T=T[k];o2.z=z[k];o2.dep=dep[k];o2.surf=z[k]+h[k];o2.molten=h[k]>hmin&&T[k]>R.Tsol;
   o2.heat=sim.heat(k);o2.crust=h[k]>0?1-o2.heat:0;o2.vx=vx[k];o2.vz=vz[k];o2.frozeAt=frozeAt[k];o2.pond=pondOf[k]>=0;return o2;},
  mass(){let m=0,f=0;for(let k=0;k<N;k++){if(pondOf[k]>=0)continue;m+=h[k];f+=dep[k];}
   let po=0;for(const P of ponds)po+=P.out;
   const er=L.vent+po,mo=m*A,fr=f*A;return {erupted:er,molten:mo,frozen:fr,lost:L.lost,pondOut:po,vent:L.vent,error:er-mo-fr-L.lost};},
  front(){const o2=[];const mo=k=>h[k]>hmin&&T[k]>R.Tsol;
   for(let j=Math.max(0,bj0);j<=Math.min(nz-1,bj1);j++)for(let i=Math.max(0,bi0);i<=Math.min(nx-1,bi1);i++){const c=j*nx+i;if(!mo(c)||pondOf[c]>=0)continue;
    for(let n=0;n<4;n++){const ii=i+DI[n],jj=j+DJ[n];if(ii<0||jj<0||ii>=nx||jj>=nz||!mo(jj*nx+ii)){o2.push([x0+i*step,z0+j*step]);break;}}}
   return o2;},
  writeBack(f,o2){o2=o2||{};let n=0;const d=new Float64Array(N);let a0=nx,b0=nz,a1=-1,b1=-1;
   for(let k=0;k<N;k++){d[k]=o2.all?dep[k]:dep[k]-wrote[k];wrote[k]=dep[k];if(d[k]!==0){const i=k%nx,j=(k-i)/nx;if(i<a0)a0=i;if(i>a1)a1=i;if(j<b0)b0=j;if(j>b1)b1=j;}}
   if(a1<0)return 0;
   /* only the lattice points over the changed cells (one cell round them): the bilinear is 0 beyond */
   const X0=x0+(a0-1)*step,X1=x0+(a1+1)*step,Z0=z0+(b0-1)*step,Z1=z0+(b1+1)*step;
   const add=g=>{const H=g.heights,jl=Math.max(0,Math.floor((Z0-g.z0)/g.step)),jh=Math.min(g.nz-1,Math.ceil((Z1-g.z0)/g.step)),
     il=Math.max(0,Math.floor((X0-g.x0)/g.step)),ih=Math.min(g.nx-1,Math.ceil((X1-g.x0)/g.step));
    for(let j=jl;j<=jh;j++){const v=(g.z0+j*g.step-z0)/step;if(v<0||v>nz-1)continue;
     for(let i=il;i<=ih;i++){const u=(g.x0+i*g.step-x0)/step;if(u<0||u>nx-1)continue;
      const y=KB().bilinear(d,nx,nz,u,v);if(y!==0){const k=j*g.nx+i;H[k]+=y;n++;if(o2.each)o2.each(g,k);}}}};
   add(f);(f.insets||[]).forEach(add);if(f.stats)f.stats();return n;},
  snapshot:()=>({t:sim.t,steps:sim.steps,dtNext:sim.dtNext,z:z.slice(),h:h.slice(),T:T.slice(),dep:dep.slice(),frozeAt:frozeAt.slice(),wrote:wrote.slice(),
   L:Object.assign({},L),vents:vents.map(V=>V.poured),ponds:ponds.map(P=>P.out),box:[bi0,bj0,bi1,bj1]}),
  restore(s){sim.t=s.t;sim.steps=s.steps;sim.dtNext=s.dtNext;z.set(s.z);h.set(s.h);T.set(s.T);dep.set(s.dep);frozeAt.set(s.frozeAt);wrote.set(s.wrote);
   Object.assign(L,s.L);vents.forEach((V,i)=>V.poured=s.vents[i]);ponds.forEach((P,i)=>P.out=s.ponds[i]);[bi0,bj0,bi1,bj1]=s.box;vx.fill(0);vz.fill(0);return sim;},
  hazard(o2){o2=o2||{};let mn=Infinity,mx=-Infinity;for(let k=0;k<N;k++){if(z[k]<mn)mn=z[k];if(z[k]>mx)mx=z[k];}
   const w=(nx-1)*step,dd=(nz-1)*step;
   const hz={kind:'lava',stateFn:'KLAVA.flow',falloff:'none',hot:o2.hot==null?86400:o2.hot,
    shape:{type:'box',w:w+step,d:dd+step,h:mx-mn+(o2.h==null?60:o2.h),y0:0}};
   if(o2.key!=null)hz.seed=o2.key;if(o2.nav)hz.nav=o2.nav;return {at:[x0+w/2,mn-5,z0+dd/2],hazard:hz};},
  export(){const K=KB();if(!K)throw new Error('KLAVA.export needs KFIELD (its base64)');
   return {format:'krator-lava',version:1,convention:'cell (i,j) at x0 + i*step, z0 + j*step; arrays row j then column i; T kelvin',
    x0,z0,step,nx,nz,t:sim.t,rheo:R,h:K.b64(Float32Array.from(h)),T:K.b64(Float32Array.from(T)),dep:K.b64(Float32Array.from(dep))};}};
 const KB=()=>{const K=B64();if(!K)throw new Error('KLAVA.writeBack needs KFIELD (core/terrain/30-core-field.js)');return K;};
 return sim;}

// ---- the hazard: a sim is page state, so it is bound to its record (KHAZ.bindFire's way), and its state function goes
// into KHAZ.STATES the first time one is bound
const BOUND={};
function flowState(rec,hz,t,speed,x,zz){const s=(hz.seed!=null&&BOUND[hz.seed])||BOUND[rec.id];if(!s)return {state:'none',k:0,on:false};
 if(x!=null&&zz!=null){const c=s.at(x,zz);
  if(c.pond||c.molten)return {state:'molten',k:1,on:true};
  if(c.dep>0&&s.t-c.frozeAt<(hz.hot==null?86400:hz.hot))return {state:'crust',k:.25,on:true};
  return {state:c.dep>0?'frozen':'clear',k:0,on:false};}
 return s.molten>0||s.ponds.length?{state:'molten',k:1,on:true}:{state:'frozen',k:0,on:false};}
function bind(rec,sim){const key=typeof rec==='string'||typeof rec==='number'?rec:rec&&rec.id;if(key==null)throw new Error('KLAVA.bind: a record with an id, or a key');
 if(sim==null){delete BOUND[key];return null;}
 if(typeof sim.at!=='function'||!sim.h)throw new Error('KLAVA.bind: a KLAVA sim');
 if(root.KHAZ&&root.KHAZ.STATES)root.KHAZ.STATES['KLAVA.flow']=flowState;
 BOUND[key]=sim;return sim;}

const KLAVA={version:1,RHEO,rheo,flux,create,bind,flowState,SIGMA,G:G0,DI,DJ,WEIGHTS:{face:WO,corner:WD},CAPS:{face:KO,corner:KD}};
root.KLAVA=Object.assign(root.KLAVA||{},KLAVA);   /* the three.js halves (host/46-core-lava-gpu.js, -draw.js) merge into the same global, whichever loads first */
if(typeof module!=='undefined'&&module.exports)module.exports=KLAVA;
})(typeof window!=='undefined'?window:globalThis);
