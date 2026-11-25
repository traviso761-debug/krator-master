// ================================================================= WATER — tides from the scale model (KTIDE)  [G data]
// The scale model's tidal calculator (tools/scale-model/tides, bake_tides.py) solves Krator's tide over each sea basin of
// Scale Model 5.1 and keeps, per 6 km cell, the amplitude and phase of its two constituents: D1 (24 h: the Giant's
// libration and nod, the Day's conjunction wave) and D2 (12 h: solar S2, the Day's close pass, the Four-Day moon), with
// the peak current and the depth (tools/scale-model/model/data/tides.json). This fragment reads that record, so any build
// gets a tide that is the same sea everywhere: the same high water at a quay, a beach and the next town down the coast,
// lagging and swelling as the basin carries it. Opt-in: list it where a build wants a moving sea level. Needs nothing
// before it; WATER (core/water 20) is optional (KTIDE.bindWater). Pure data: no THREE, no DOM; Godot can port it as is.
//
//   KTIDE.load(data, {origin: [cx, cy]}) -> T     the record (whole, or a slice cut by tide.py); origin is the region's
//                                                 frame (x = (px - cx) * 2000, z = (py - cy) * 2000; core/world's W.px)
//   T.atPx(px, py, reach) / T.at(x, z, reach) -> S or null
//       S = {basin, level (the basin's mean level), a: [A1, A2] m, p: [p1, p2] rad, vmax m/s, depth m, coast (cells to the
//       nearest wet one; 0 = in the water)}. Phases are interpolated as phasors (A cos p, A sin p), never as angles. A dry
//       point takes the nearest wet cell within reach cells (default 3: 18 km), so a town on the shore reads its sea.
//   T.level(x, z, t) -> metres about the basin's mean level at time t (seconds from the forcing epoch), or null
//   T.range(x, z) -> the day's high minus low water (sampled), or null
//   T.site({x, z} | {px, py}, {gain, range, lag, reach}) -> a frozen site tide, for a harbour, a ria or a race:
//       gain multiplies the amplitudes (a funnel the 6 km grid cannot see), or range sets the gain so the day's range is
//       that many metres (the Fleetborn Cove's 14 m); lag (s) delays it. The site has level(t), rate(t) (m/s, + rising),
//       state(t, slackRate) 'flood' | 'ebb' | 'slack', range, high / low (times of the day's highs and lows), and
//       waterTide() -> {amp, period, phase}: the dominant constituent in WATER.tide's own shape
//   KTIDE.bindWater(WATER, site) -> WATER.seaLevel(t) becomes the preset level + site.level(t); returns an unbind()
//   KTIDE.OMEGA [w1, w2] rad/s; KTIDE.decode(b64) -> Uint8Array (no atob: the same in node, a page and Godot's port)
(function(root){
'use strict';
if(root.KTIDE)return;
const TAU=Math.PI*2,DAY=86400,OMEGA=[TAU/DAY,2*TAU/DAY],DRY=0xFFFF;
const B64='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const LUT=new Int16Array(128).fill(-1);for(let i=0;i<64;i++)LUT[B64.charCodeAt(i)]=i;
function decode(s){
 let n=s.length;while(n>0&&s.charCodeAt(n-1)===61)n--;
 const out=new Uint8Array((n*3)>>2);let o=0,acc=0,bits=0;
 for(let i=0;i<n;i++){const v=LUT[s.charCodeAt(i)];if(v<0)throw new Error('KTIDE.decode: not base64 at '+i);
  acc=(acc<<6)|v;bits+=6;if(bits>=8){bits-=8;out[o++]=(acc>>bits)&255;}}
 return out;}
function u16(s){const b=decode(s),a=new Uint16Array(b.length>>1);for(let i=0;i<a.length;i++)a[i]=b[2*i]|(b[2*i+1]<<8);return a;}

function basinOf(R){
 const N=R.nx*R.ny,A1=u16(R.amp1),A2=u16(R.amp2),P1=decode(R.ph1),P2=decode(R.ph2),V=decode(R.vmax),D=u16(R.depth);
 if(A1.length!==N||A2.length!==N||P1.length!==N||P2.length!==N||V.length!==N||D.length!==N)throw new Error('KTIDE: basin '+R.id+': grids are not '+R.nx+' x '+R.ny);
 /* phasors per cell: [c1, s1, c2, s2] */
 const Q=new Float32Array(N*4);
 for(let k=0;k<N;k++){if(A1[k]===DRY)continue;const a1=A1[k]/1000,a2=A2[k]/1000,p1=P1[k]/256*TAU,p2=P2[k]/256*TAU;
  Q[4*k]=a1*Math.cos(p1);Q[4*k+1]=a1*Math.sin(p1);Q[4*k+2]=a2*Math.cos(p2);Q[4*k+3]=a2*Math.sin(p2);}
 return{id:R.id,name:R.name,level:R.level==null?0:R.level,x0:R.x0,y0:R.y0,cell:R.cell,nx:R.nx,ny:R.ny,wet:k=>A1[k]!==DRY,Q:Q,V:V,D:D,stats:R.stats||null};}

function sample(B,px,py,reach){
 /* cell-centred bilinear over the wet corners; a dry point takes the nearest wet cell within reach */
 const fx=(px-B.x0)/B.cell-.5,fy=(py-B.y0)/B.cell-.5;
 if(fx<-reach-1||fy<-reach-1||fx>B.nx+reach||fy>B.ny+reach)return null;
 const i0=Math.floor(fx),j0=Math.floor(fy),tx=fx-i0,ty=fy-j0;
 let w=0;const q=[0,0,0,0];let v=0,d=0;
 for(let dj=0;dj<2;dj++)for(let di=0;di<2;di++){const i=i0+di,j=j0+dj;if(i<0||j<0||i>=B.nx||j>=B.ny)continue;const k=j*B.nx+i;if(!B.wet(k))continue;
  const wk=(di?tx:1-tx)*(dj?ty:1-ty);if(wk<=0)continue;w+=wk;for(let c=0;c<4;c++)q[c]+=wk*B.Q[4*k+c];v+=wk*B.V[k]*.02;d+=wk*B.D[k];}
 let coast=0;
 if(!(w>1e-6)){
  const ic=Math.round(fx),jc=Math.round(fy);let best=1e9,bk=-1;
  for(let r=1;r<=reach&&bk<0;r++)for(let j=jc-r;j<=jc+r;j++)for(let i=ic-r;i<=ic+r;i++){
   if(Math.max(Math.abs(i-ic),Math.abs(j-jc))!==r||i<0||j<0||i>=B.nx||j>=B.ny)continue;const k=j*B.nx+i;if(!B.wet(k))continue;
   const dd=(i-fx)*(i-fx)+(j-fy)*(j-fy);if(dd<best){best=dd;bk=k;coast=r;}}
  if(bk<0)return null;
  for(let c=0;c<4;c++)q[c]=B.Q[4*bk+c];v=B.V[bk]*.02;d=B.D[bk];w=1;}
 for(let c=0;c<4;c++)q[c]/=w;
 return{basin:B.id,level:B.level,a:[Math.hypot(q[0],q[1]),Math.hypot(q[2],q[3])],p:[Math.atan2(q[1],q[0]),Math.atan2(q[3],q[2])],
  vmax:v/w,depth:d/w,coast:coast};}

function eta(S,t){return S.a[0]*Math.cos(OMEGA[0]*t-S.p[0])+S.a[1]*Math.cos(OMEGA[1]*t-S.p[1]);}
function deta(S,t){return-S.a[0]*OMEGA[0]*Math.sin(OMEGA[0]*t-S.p[0])-S.a[1]*OMEGA[1]*Math.sin(OMEGA[1]*t-S.p[1]);}
function dayExtremes(S,lag){
 /* the day's highs and lows from the sign changes of the rate, refined by bisection; t in [0, DAY) */
 const n=288,hi=[],lo=[];let lv=Infinity,hv=-Infinity;
 const f=t=>deta(S,t-lag);
 for(let i=0;i<n;i++){const t0=i*DAY/n,t1=(i+1)*DAY/n,r0=f(t0),r1=f(t1);if(r0===0||r0*r1<0){let a=t0,b=t1;for(let k=0;k<30;k++){const m=.5*(a+b);if(f(a)*f(m)<=0)b=m;else a=m;}
   const tm=.5*(a+b),e=eta(S,tm-lag);(r0>0||r1<0?hi:lo).push(+tm.toFixed(1));if(e>hv)hv=e;if(e<lv)lv=e;}}
 if(!hi.length&&!lo.length){hv=lv=0;}
 return{hi:hi,lo:lo,range:hv-lv};}

function load(data,opt){
 if(!data||data.kind!=='krator-tides')throw new Error('KTIDE.load: not a tides record (tools/scale-model/model/data/tides.json)');
 if(data.version!==1)throw new Error('KTIDE.load: tides record version '+data.version+' (this reader knows 1)');
 const o=opt||{},org=o.origin||[0,0],PXM=data.pxM==null?2000:data.pxM,B=(data.basins||[]).map(basinOf);
 function atPx(px,py,reach){const r=reach==null?3:reach;let best=null;
  for(let i=0;i<B.length;i++){const s=sample(B[i],px,py,r);if(s&&(!best||s.coast<best.coast))best=s;if(best&&best.coast===0)break;}
  return best;}
 const at=(x,z,reach)=>atPx(org[0]+x/PXM,org[1]+z/PXM,reach);
 function site(p,so){so=so||{};
  const S=p.px!=null?atPx(p.px,p.py,so.reach):at(p.x,p.z,so.reach);
  if(!S)return null;
  const lag=so.lag==null?0:so.lag,raw=dayExtremes(S,0).range;
  const gain=so.range!=null?(raw>1e-6?so.range/raw:0):(so.gain==null?1:so.gain);
  const G={basin:S.basin,level:S.level,a:[S.a[0]*gain,S.a[1]*gain],p:S.p.slice(),vmax:S.vmax*gain,depth:S.depth,coast:S.coast,gain:gain};
  const ex=dayExtremes(G,lag);
  const dom=G.a[0]>=G.a[1]?0:1;
  return Object.freeze({basin:G.basin,level:G.level,a:Object.freeze(G.a),p:Object.freeze(G.p),gain:gain,lag:lag,vmax:G.vmax,depth:G.depth,coast:G.coast,
   range:ex.range,high:Object.freeze(ex.hi),low:Object.freeze(ex.lo),
   level:t=>eta(G,(t||0)-lag),
   rate:t=>deta(G,(t||0)-lag),
   state:(t,slack)=>{const r=deta(G,(t||0)-lag),s=slack==null?ex.range/DAY*.25:slack;return Math.abs(r)<=s?'slack':r>0?'flood':'ebb';},
   /* WATER.tide's shape is amp * sin(TAU t / period + phase): cos(w t - p) = sin(w t - p + pi/2) */
   waterTide:()=>({amp:G.a[dom],period:dom?DAY/2:DAY,phase:Math.PI/2-G.p[dom]-OMEGA[dom]*lag})});}
 return{basins:B.map(b=>({id:b.id,name:b.name,level:b.level,x0:b.x0,y0:b.y0,cell:b.cell,nx:b.nx,ny:b.ny,stats:b.stats})),
  origin:org.slice(),atPx:atPx,at:at,
  level:(x,z,t)=>{const S=at(x,z);return S?eta(S,t||0):null;},
  range:(x,z)=>{const S=at(x,z);return S?dayExtremes(S,0).range:null;},
  site:site};}

function bindWater(W,site){
 if(!W||typeof W.seaLevel!=='function')throw new Error('KTIDE.bindWater: needs core/water (WATER.seaLevel)');
 if(!site||typeof site.level!=='function')throw new Error('KTIDE.bindWater: needs a site from T.site(...)');
 const prev=W.seaLevel;
 W.seaLevel=t=>{const P=W.PRESETS&&W.PRESETS.sea;return(P&&P.level!=null?P.level:0)+site.level(t);};
 return function unbind(){W.seaLevel=prev;};}

root.KTIDE={load:load,bindWater:bindWater,decode:decode,OMEGA:OMEGA,DAY:DAY};
if(typeof module!=='undefined'&&module.exports)module.exports=root.KTIDE;
})(typeof window!=='undefined'?window:globalThis);
