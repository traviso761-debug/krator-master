// ================================================================= OPEN WORLD — caverns: a region's lava tubes under its streamed ground  [G data]
// openworld/xanadu-oidong-highrift/PLAN-TWINS-CROSSING.md step W3 (the owner, 2026-11-16: "Build open world caverns now"). A region lists
// its tubes in SITE_SPEC.tubes (its own fragment beside the sites' spec, as SITE_SPEC.bridges opts into bridges); WTUBES.plan lays them
// as plain records on the world's ground, RELATIVE to it (a depth, not a height: the ground will change when a sculpt lands), and the
// page draws them with core/terrain's KCAVERN, square by square near the camera (88k-world-caverns.js). Nothing here touches the
// browser or three.js, so it ports to Godot as it stands; KCAVERN (core/terrain/39) is the one source of the voids' shape.
//
//   SITE_SPEC.tubes = [{id, name, route, model (the scale model's tube record it details, region.json `tubes`),
//     px: [[px, py], ...]  (the centreline in the scale model's pixels, mapped by the region's fromPx: 2 km a pixel),
//     seg: {w, h, ledge} | [{w, h, ledge}, ...]  (one per span between px points: the width, floor to crown, the curb-ledge {v, d}),
//     depth (40: the floor under the ground, smoothed along the tube), grade (.08), ramp (.25: the floor up to a portal),
//     open: [{kind: 'portal'|'skylight', at: 'start'|'end'|[px, py], name, r (a skylight's radius)}],
//     halls: [{px, name, rx, rz, h, skylight: {r, name}}],
//     chokes: {every, p, w, h, len: [a, b]} (drawn by cell) | [{px, w, h, len}],
//     skylights: {every, p, r: [a, b], maxCover} (drawn by cell, away from the openings and the halls)}]
//
//   const P=WTUBES.plan(SITE_SPEC.tubes, {ground:(x,z)=>y (the ground AS DRAWN: WTUBES.drawnGround), fromPx, seed, wet:(x,z)=>level})
//   P = {format:'krator-world-tubes', version:1, seed, cover, tubes:[T]}
//   T = {id, name, route, model, len, depth, grade, ramp,
//        st: [[x, z, floor, ground], ...]   stations every ~24 m on the centreline (the spec's points are stations; the rest meander
//                                            by a position-seeded noise, never by draw order)
//        sec: [{id, kind: 'run'|'choke', a, b (stations, inclusive: neighbours overlap a station, so the voids join), w, h, ledge}]
//        open: [{id, kind, name, i (its station), at ([px, py] the spec's), holes: [[x, z, r], ...] (where the ground opens), rim,
//               a, b (the stations whose cover is waived), shaft: {c: [x, z], y0, y1, r0, r1} (a skylight's)}]
//        halls: [{id, name, i, c: [x, y, z], rx, rz, h}]}
//   WTUBES.check(P, {ground, cover})  [{name, ok, detail}]: every tube meets the surface; each opening where the spec puts it and open
//                                      there; the floor under the ground and the roof under it by the cover, everywhere but at the
//                                      openings; the grade
//   WTUBES.hash(P)                     a fingerprint of the records (determinism)
//   WTUBES.floorAt(P, x, z, full)      the tube floor walked at (x, z) (the lowest of the voids there): {y, T, sec} | null; full:
//                                      anywhere over the void and its walls (1.5 m past them), not only where it is walked
//   WTUBES.holeAt(P, x, z)             the opening whose hole holds (x, z): {open, T, hole} | null
//   WTUBES.voidAt(P, x, y, z)          KCAVERN's voidSD there (negative in a tube), from the square's cavern
//   WTUBES.walk(P, x, z, feet, gy, from)  where a walker stands: {y, kind: 'ground'|'tube'} | null (a wall). feet: its last height,
//                                      gy: the ground at (x, z), from: [x, z] it came from
//   WTUBES.squares(P)                  Map 'i,k' -> {i, k, items: [{t, a, b}]}: the square columns (P.square m) the tubes reach
//   WTUBES.cavern(P, key)              that square's KCAVERN, in the square's own frame (origin [i*S, 0, k*S]: no float jitter a
//                                      million metres out; every square samples one world lattice, so the seams meet) and built;
//                                      C.own lists the chunks the square owns, C.origin its offset
//   WTUBES.drawnGround(H, {ds, minWave})  (x, z) -> the ground as core/world 81 draws its finest chunks (H at minWave on the ds lattice,
//                                      each cell split on its (i, j+1)-(i+1, j) diagonal): the cavern meets the drawn ground exactly
var WTUBES=(function(root){'use strict';
const KR=root.KRAND;
const D={ds:24,depth:40,cover:4,grade:.08,ramp:.25,w:16,h:12,smooth:720,meander:70,wave:1400,margin:64,square:128,cell:1,chunk:16,rim:4,step:1.1,bucket:64};
const clamp=(v,a,b)=>v<a?a:v>b?b:v,sstep=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);},nz=(v,d)=>v==null?d:v;
const r3=v=>Math.round(v*1000)/1000;
const CTX=new WeakMap();   /* a plan's runtime side (the ground, the indexes, the caverns): never in its records */
function ctx(P){let c=CTX.get(P);if(!c){c={ground:null,ix:null,hx:null,sq:null,cav:new Map(),order:[]};CTX.set(P,c);}return c;}

// ---------------------------------------------------------------- the ground as drawn
function drawnGround(H,o){o=o||{};const ds=nz(o.ds,2),mw=nz(o.minWave,3),cache=new Map();
 const at=(i,j)=>{const k=i*4194304+j;let h=cache.get(k);if(h===undefined){if(cache.size>3e6)cache.clear();h=H(i*ds,j*ds,mw);cache.set(k,h);}return h;};
 return (x,z)=>{const u=x/ds,v=z/ds,i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j;
  const h00=at(i,j),h10=at(i+1,j),h01=at(i,j+1);
  if(fu+fv<=1)return h00+(h10-h00)*fu+(h01-h00)*fv;
  const h11=at(i+1,j+1);return h11+(h01-h11)*(1-fu)+(h10-h11)*(1-fv);};}

// ---------------------------------------------------------------- planning one tube
function spanOf(S,k){const g=Array.isArray(S.seg)?S.seg[Math.min(k,S.seg.length-1)]:(S.seg||{});
 return {w:nz(g.w,D.w),h:nz(g.h,D.h),ledge:g.ledge===undefined?{v:.9,d:1.2}:g.ledge};}
function same(a,b){return a.w===b.w&&a.h===b.h&&a.kind===b.kind&&JSON.stringify(a.ledge)===JSON.stringify(b.ledge);}
function planTube(S,o,seed,cover){
 if(!S||!S.id)throw new Error('WTUBES.plan: a tube needs an id');
 if(!S.px||S.px.length<2)throw new Error('WTUBES.plan '+S.id+': px needs two or more points');
 const G0=o.ground,ds=nz(S.ds,D.ds),depth=nz(S.depth,D.depth),grade=nz(S.grade,D.grade),ramp=nz(S.ramp,D.ramp);
 const tseed=KR.child(seed,'tubes/'+S.id),A=nz(S.meander,D.meander),WL=nz(S.wave,D.wave),mseed=KR.child(tseed,'meander');
 const V=S.px.map(p=>o.fromPx(p[0],p[1])),xs=[],vi=[0];
 // the stations: the spec's points kept, the spans between them meandering (lava tubes wind), tapered to nothing at each point;
 // 6 m apart within 350 m of a portal (the ramp follows the ground up to its mouth), ds elsewhere
 const mouths=(S.open||[]).filter(O=>O.kind!=='skylight').map(O=>O.at==='start'?V[0]:O.at==='end'?V[V.length-1]:Array.isArray(O.at)?o.fromPx(O.at[0],O.at[1]):null).filter(Boolean);
 const dsAt=(x,z)=>{let d=1e30;for(const m of mouths)d=Math.min(d,Math.hypot(x-m[0],z-m[1]));return 6+(ds-6)*sstep(150,350,d);};
 for(let k=0;k<V.length-1;k++){const a=V[k],b=V[k+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]);
  if(L<1)throw new Error('WTUBES.plan '+S.id+': two points at one place');
  const tx=(b[0]-a[0])/L,tz=(b[1]-a[1])/L,ss=[0];
  for(let s=0;;){const st=dsAt(a[0]+tx*s,a[1]+tz*s);if(L-s<=st*1.5){if(L-s>st*.75)ss.push((s+L)/2);ss.push(L);break;}s+=st;ss.push(s);}
  for(let j=k?1:0;j<ss.length;j++){const s=ss[j],x=a[0]+tx*s,z=a[1]+tz*s,tp=sstep(0,600,Math.min(s,L-s));
   const m=tp>0?(KR.fbm(x/WL,.37,z/WL,2,mseed)-.5)*2*A*tp:0;xs.push([x-tz*m,z+tx*m]);}
  vi.push(xs.length-1);}
 const n=xs.length,cum=new Float64Array(n);for(let i=1;i<n;i++)cum[i]=cum[i-1]+Math.hypot(xs[i][0]-xs[i-1][0],xs[i][1]-xs[i-1][1]);
 const near=(px)=>{const q=o.fromPx(px[0],px[1]);let b=0,bd=1e30;for(let i=0;i<n;i++){const d=Math.hypot(xs[i][0]-q[0],xs[i][1]-q[1]);if(d<bd){bd=d;b=i;}}return b;};
 // each station's section: its span's, then the chokes (drawn by cell: the cell of the candidate and its index along the tube)
 const prm=new Array(n);for(let k=0;k<V.length-1;k++)for(let i=vi[k];i<=vi[k+1];i++)if(!prm[i]||i>vi[k])prm[i]=Object.assign({kind:'run'},spanOf(S,k));
 const halls=(S.halls||[]).map((h,j)=>({spec:h,j,i:near(h.px)}));
 const len=cum[n-1],chokes=[];
 if(Array.isArray(S.chokes))S.chokes.forEach((c,j)=>chokes.push({i:near(c.px),w:nz(c.w,3.5),h:nz(c.h,4.5),len:nz(c.len,64),id:'choke-'+j}));
 else if(S.chokes){const C=S.chokes,ev=nz(C.every,9000),cs=KR.child(tseed,'chokes'),L2=C.len||[48,96];
  for(let k=0;(k+1)*ev<=len;k++){const s0=(k+.5)*ev;let i0=0;while(i0<n-1&&cum[i0]<s0)i0++;const cx=Math.floor(xs[i0][0]/2000),cz=Math.floor(xs[i0][1]/2000);
   const h=KR.hash(cs,cx,cz,k);if(KR.unit(h)>=nz(C.p,.5))continue;
   const s=(k+.5+.5*(KR.unit(KR.hash(h,1))-.5))*ev;let i=0;while(i<n-1&&cum[i]<s)i++;
   if(cum[i]<600||len-cum[i]<600||halls.some(H=>Math.abs(cum[H.i]-cum[i])<400))continue;
   chokes.push({i,w:nz(C.w,3.5),h:nz(C.h,4.5),len:L2[0]+(L2[1]-L2[0])*KR.unit(KR.hash(h,2)),id:'choke-'+k});}}
 chokes.forEach(c=>{const nh=Math.max(1,Math.ceil(c.len/2/ds));for(let i=Math.max(1,c.i-nh);i<=Math.min(n-2,c.i+nh);i++)prm[i]={kind:'choke',w:c.w,h:c.h,ledge:null};});
 // the sections: runs of one section's stations, each grown a station each way so its neighbours' voids overlap and join
 const sec=[];for(let i=0;i<n;){let j=i;while(j+1<n&&same(prm[j+1],prm[i]))j++;
  sec.push({id:S.id+':'+sec.length,kind:prm[i].kind,a:Math.max(0,i-1),b:Math.min(n-1,j+1),w:prm[i].w,h:prm[i].h,ledge:prm[i].ledge});i=j+1;}
 if(sec.length>1){sec[0].a=0;sec[sec.length-1].b=n-1;}
 const wst=new Float64Array(n),hst=new Float64Array(n);sec.forEach(s=>{for(let i=s.a;i<=s.b;i++){wst[i]=Math.max(wst[i],s.w);hst[i]=Math.max(hst[i],s.h);}});
 // the ground: at the centre and at each wall (the least of the three carries the roof's cover)
 // (and at the midpoint to the next station, whose least is carried by both: the floor runs straight between them)
 const G=new Float64Array(n),Gm=new Float64Array(n);
 for(let i=0;i<n;i++){const p=xs[Math.max(0,i-1)],q=xs[Math.min(n-1,i+1)],l=Math.max(1e-9,Math.hypot(q[0]-p[0],q[1]-p[1])),px=-(q[1]-p[1])/l,pz=(q[0]-p[0])/l,e=wst[i]/2+1;
  G[i]=G0(xs[i][0],xs[i][1]);Gm[i]=Math.min(G[i],G0(xs[i][0]+px*e,xs[i][1]+pz*e),G0(xs[i][0]-px*e,xs[i][1]-pz*e));
  if(i>0){const mx=(xs[i][0]+xs[i-1][0])/2,mz=(xs[i][1]+xs[i-1][1])/2,ex=Math.max(e,wst[i-1]/2+1),
    gm=Math.min(G0(mx,mz),G0(mx+px*ex,mz+pz*ex),G0(mx-px*ex,mz-pz*ex));Gm[i]=Math.min(Gm[i],gm);Gm[i-1]=Math.min(Gm[i-1],gm);}}
 // the halls ask for their own height of rock over them, round their whole footprint
 const hh=new Float64Array(n);halls.forEach(H=>{const h=H.spec,c=xs[H.i];let gmin=G[H.i];
  for(let a=0;a<12;a++){const t=a*Math.PI/6;gmin=Math.min(gmin,G0(c[0]+Math.cos(t)*(nz(h.rx,30)+1),c[1]+Math.sin(t)*(nz(h.rz,20)+1)));}
  const R=Math.max(nz(h.rx,30),nz(h.rz,20));for(let i=0;i<n;i++)if(Math.abs(cum[i]-cum[H.i])<=R){hh[i]=Math.max(hh[i],nz(h.h,16));Gm[i]=Math.min(Gm[i],gmin);}});
 // the floor: the ground smoothed along the tube, less the depth; under every wall's ground by the roof and the cover; its grade held
 const K=Math.max(1,Math.round(nz(S.smooth,D.smooth)/2/ds)),pre=new Float64Array(n+1);for(let i=0;i<n;i++)pre[i+1]=pre[i]+G[i];
 const f=new Float64Array(n);
 for(let i=0;i<n;i++){const a=Math.max(0,i-K),b=Math.min(n-1,i+K),gs=(pre[b+1]-pre[a])/(b-a+1);
  f[i]=Math.min(gs-depth,Gm[i]-Math.max(hst[i],hh[i])-cover);}
 for(let i=1;i<n;i++)f[i]=Math.min(f[i],f[i-1]+grade*(cum[i]-cum[i-1]));
 for(let i=n-2;i>=0;i--)f[i]=Math.min(f[i],f[i+1]+grade*(cum[i+1]-cum[i]));
 // the openings the spec names; the portals raise the floor to the ground at their mouth, up a ramp
 const specOpen=(S.open||[]).map((O,j)=>{const i=O.at==='start'?0:O.at==='end'?n-1:Array.isArray(O.at)?near(O.at):-1;
  if(i<0)throw new Error('WTUBES.plan '+S.id+': an opening needs at: start, end or [px, py]');
  return {O,j,i,kind:O.kind==='skylight'?'skylight':'portal'};});
 /* q.ra, q.rb: the stations the ramp holds (where it lifted the floor): the grade there is the ramp's */
 specOpen.filter(q=>q.kind==='portal').forEach(q=>{const mouth=G[q.i]-.25;q.ra=q.rb=q.i;
  for(let i=0;i<n;i++){const c=mouth-ramp*Math.abs(cum[i]-cum[q.i]);if(c>f[i]){f[i]=c;q.ra=Math.min(q.ra,i);q.rb=Math.max(q.rb,i);}}});
 for(let i=0;i<n;i++)f[i]=Math.min(f[i],G[i]-.25);
 const open=[],roof=i=>f[i]+Math.max(hst[i],hh[i]);
 const foot=(i,e)=>{const p=xs[Math.max(0,i-1)],q=xs[Math.min(n-1,i+1)],l=Math.max(1e-9,Math.hypot(q[0]-p[0],q[1]-p[1])),px=-(q[1]-p[1])/l,pz=(q[0]-p[0])/l;
  return [[xs[i][0]+px*e,xs[i][1]+pz*e],[xs[i][0]-px*e,xs[i][1]-pz*e],xs[i]];};
 // a run of stations whose ground opens: holes of at most 48 m of tube each (a long ramp is several holes, not one huge one)
 const holesOf=(a,b)=>{const H=[];for(let s=a;s<=b;){let e=s;while(e<b&&cum[e+1]-cum[s]<=48)e++;const pts=[];for(let i=s;i<=e;i++)pts.push(...foot(i,wst[i]/2+1));s=e+1;
  let cx=0,cz=0;pts.forEach(p=>{cx+=p[0];cz+=p[1];});cx/=pts.length;cz/=pts.length;let r=0;pts.forEach(p=>{r=Math.max(r,Math.hypot(p[0]-cx,p[1]-cz));});
  H.push([r3(cx),r3(cz),r3(r+1)]);}return H;};
 /* a portal's reach: from its mouth inward to the last station whose roof is short of the cover, looking past a few that are not
    (the ground's own bumps), up to 600 m in */
 const thin=i=>roof(i)+cover>Gm[i]-.01;
 specOpen.filter(q=>q.kind==='portal').forEach(q=>{let a=q.i,b=q.i;
  for(const dir of [-1,1]){let last=q.i,miss=0;for(let i=q.i+dir;i>=0&&i<n&&Math.abs(cum[i]-cum[q.i])<=600;i+=dir){if(thin(i)){last=i;miss=0;}else if(++miss>=8)break;}
   if(dir<0)a=last;else b=last;}
  a=Math.max(0,a-2);b=Math.min(n-1,b+2);
  open.push({id:S.id+':open-'+q.j,kind:'portal',name:q.O.name||'',i:q.i,at:q.O.at==='start'?S.px[0]:q.O.at==='end'?S.px[S.px.length-1]:q.O.at,
   holes:holesOf(a,b),rim:nz(q.O.rim,D.rim),a,b,ramp:[q.ra,q.rb]});});
 // the skylights: the spec's, each hall's roof crack, and those drawn by cell (an index along the tube and the cell it falls in)
 const sky=[];specOpen.filter(q=>q.kind==='skylight').forEach(q=>sky.push({i:q.i,r:nz(q.O.r,5),name:q.O.name||'',at:q.O.at,id:S.id+':open-'+q.j,spec:true}));
 halls.forEach(H=>{if(H.spec.skylight)sky.push({i:H.i,r:nz(H.spec.skylight.r,3),name:H.spec.skylight.name||'',at:H.spec.px,id:S.id+':hall-'+H.j+':sky',hall:H});});
 if(S.skylights){const C=S.skylights,ev=nz(C.every,7000),ss=KR.child(tseed,'skylights'),R=C.r||[3,7],mc=nz(C.maxCover,60);
  const far=i=>specOpen.every(q=>Math.abs(cum[q.i]-cum[i])>800)&&halls.every(H=>Math.abs(cum[H.i]-cum[i])>800)&&chokes.every(c=>Math.abs(c.i-i)>8);
  for(let k=0;(k+1)*ev<=len;k++){const s0=(k+.5)*ev;let i0=0;while(i0<n-1&&cum[i0]<s0)i0++;const cx=Math.floor(xs[i0][0]/2000),cz=Math.floor(xs[i0][1]/2000);
   const h=KR.hash(ss,cx,cz,k);if(KR.unit(h)>=nz(C.p,.5))continue;
   const s=(k+.5+.6*(KR.unit(KR.hash(h,1))-.5))*ev;let i=0;while(i<n-1&&cum[i]<s)i++;
   const cv=Gm[i]-roof(i);if(!far(i)||cv>mc||cv<6||prm[i].kind==='choke')continue;
   if(o.wet&&o.wet(xs[i][0],xs[i][1])>G[i]-1)continue;
   sky.push({i,r:R[0]+(R[1]-R[0])*KR.unit(KR.hash(h,2)),name:'',id:S.id+':sky-'+k});}}
 sky.forEach(q=>{const c=xs[q.i],H=q.hall,y0=H?f[q.i]+nz(H.spec.h,16)*.6:f[q.i]+hst[q.i]*.55,r1=q.r,r0=H?r1:Math.min(r1*1.25,wst[q.i]/2-.6);
  let gtop=G[q.i];for(let a=0;a<8;a++){const t=a*Math.PI/4;gtop=Math.max(gtop,G0(c[0]+Math.cos(t)*(r1+1),c[1]+Math.sin(t)*(r1+1)));}
  const reach=r0+wst[q.i]/2+4+(H?Math.max(nz(H.spec.rx,30),nz(H.spec.rz,20)):0);let a=Math.max(0,q.i-1),b=Math.min(n-1,q.i+1);while(a>0&&cum[q.i]-cum[a-1]<=reach)a--;while(b<n-1&&cum[b+1]-cum[q.i]<=reach)b++;
  open.push({id:q.id,kind:'skylight',name:q.name,i:q.i,at:q.at||null,holes:[[r3(c[0]),r3(c[1]),r3(r1+1.5)]],rim:3,a,b,
   shaft:{c:[r3(c[0]),r3(c[1])],y0:r3(y0),y1:r3(gtop+4),r0:r3(Math.max(r0,1.2)),r1:r3(r1)}});});
 open.sort((p,q)=>p.i-q.i||(p.id<q.id?-1:1));
 return {id:S.id,name:S.name||S.id,route:S.route||null,model:S.model||null,len:r3(len),depth,grade,ramp,
  st:xs.map((p,i)=>[r3(p[0]),r3(p[1]),r3(f[i]),r3(G[i])]),sec,open,
  halls:halls.map(H=>({id:S.id+':hall-'+H.j,name:H.spec.name||'',i:H.i,c:[r3(xs[H.i][0]),r3(f[H.i]),r3(xs[H.i][1])],rx:nz(H.spec.rx,30),rz:nz(H.spec.rz,20),h:nz(H.spec.h,16)}))};
}
function plan(spec,o){if(!o||typeof o.ground!=='function'||typeof o.fromPx!=='function')throw new Error('WTUBES.plan: ground and fromPx required');
 const seed=nz(o.seed,1)>>>0,cover=nz(o.cover,D.cover),ids={};
 const P={format:'krator-world-tubes',version:1,seed,cover,square:D.square,tubes:(spec||[]).map(S=>{if(ids[S.id])throw new Error('WTUBES.plan: duplicate id '+S.id);ids[S.id]=1;return planTube(S,o,seed,cover);})};
 ctx(P).ground=o.ground;return P;}
function bind(P,o){ctx(P).ground=o.ground;return P;}

// ---------------------------------------------------------------- the checks (each read off the ground as it is now)
function check(P,o){o=o||{};const G0=o.ground||ctx(P).ground,cover=nz(o.cover,P.cover),R=[];
 const no=[],place=[],under=[],cov=[],grd=[],lines=[];let worstF=-1e9,worstR=-1e9,nS=0;
 P.tubes.forEach(T=>{const st=T.st,n=st.length,w=new Float64Array(n),h=new Float64Array(n);
  T.sec.forEach(s=>{for(let i=s.a;i<=s.b;i++){w[i]=Math.max(w[i],s.w);h[i]=Math.max(h[i],s.h);}});
  T.halls.forEach(H=>{const r=Math.max(H.rx,H.rz),c=st[H.i];for(let i=0;i<n;i++)if(Math.hypot(st[i][0]-c[0],st[i][1]-c[1])<=r)h[i]=Math.max(h[i],H.h);});
  if(!T.open.length)no.push(T.id);
  const waived=new Uint8Array(n),ramped=new Uint8Array(n);T.open.forEach(O=>{for(let i=O.a;i<=O.b;i++)waived[i]=1;if(O.ramp)for(let i=O.ramp[0];i<=O.ramp[1];i++)ramped[i]=1;});
  // each opening where the spec put it, and open there: a portal's floor meets the ground at its mouth, inside its own hole;
  // a skylight's shaft rises through the ground
  T.open.forEach(O=>{const s=st[O.i],gy=G0(s[0],s[1]);if(O.at){const q=o.fromPx?o.fromPx(O.at[0],O.at[1]):null;
    if(q&&Math.hypot(q[0]-s[0],q[1]-s[1])>Math.max(30,P.square))place.push(O.id+' '+Math.round(Math.hypot(q[0]-s[0],q[1]-s[1]))+' m off its spec point');}
   const inHole=O.holes.some(H=>Math.hypot(s[0]-H[0],s[1]-H[1])<=H[2]);
   if(O.kind==='portal'){if(!(Math.abs(s[2]-gy)<.75)||!inHole)place.push(O.id+': the floor '+(s[2]-gy).toFixed(2)+' m off the ground at its mouth'+(inHole?'':', the mouth outside its hole'));}
   else if(!O.shaft||!(O.shaft.y1>gy+1)||!(O.shaft.y0<s[2]+h[O.i])||!inHole)place.push(O.id+': the shaft does not reach from the roof to the sky');});
  // between the openings: every station and every midpoint (the floor straight between stations)
  for(let i=0;i<n;i++){for(const k of [0,.5]){if(k&&i===n-1)continue;const j=k?i+1:i;if(waived[i]||waived[j])continue;
    const x=st[i][0]+(st[j][0]-st[i][0])*k,z=st[i][1]+(st[j][1]-st[i][1])*k,fy=st[i][2]+(st[j][2]-st[i][2])*k,gy=G0(x,z);nS++;
    if(!(fy<gy-.5)){under.push(T.id+' station '+i+(k?'.5':'')+' floor '+(fy-gy).toFixed(1)+' m');}
    worstF=Math.max(worstF,fy-gy);
    const p=st[Math.max(0,i-1)],q=st[Math.min(n-1,i+1)],l=Math.max(1e-9,Math.hypot(q[0]-p[0],q[1]-p[1])),px=-(q[1]-p[1])/l,pz=(q[0]-p[0])/l,e=Math.max(w[i],w[j])/2+1;
    const gm=Math.min(gy,G0(x+px*e,z+pz*e),G0(x-px*e,z-pz*e)),top=fy+Math.max(h[i],h[j]);worstR=Math.max(worstR,top+cover-gm);
    if(!(top+cover<=gm+.25))cov.push(T.id+' station '+i+(k?'.5':'')+' '+(gm-top).toFixed(1)+' m of rock');}
   /* the grade: the ramp's where a portal's ramp holds the floor; none where the floor is the ground itself (a mouth on a brow) */
   if(i<n-1){const d=Math.hypot(st[i+1][0]-st[i][0],st[i+1][1]-st[i][1]),g=Math.abs(st[i+1][2]-st[i][2])/d,lim=(ramped[i]||ramped[i+1])?T.ramp:T.grade;
    const onG=ramped[i]&&ramped[i+1]&&(Math.abs(st[i][2]-G0(st[i][0],st[i][1]))<.35||Math.abs(st[i+1][2]-G0(st[i+1][0],st[i+1][1]))<.35);
    if(!onG&&g>lim+1e-3)grd.push(T.id+' station '+i+' grade '+(g*100).toFixed(1)+' %');}}
  lines.push(T.id+' '+(T.len/1000).toFixed(1)+' km, '+T.open.filter(O=>O.kind==='portal').length+' portals, '+T.open.filter(O=>O.kind==='skylight').length+' skylights, '+T.sec.filter(s=>s.kind==='choke').length+' chokes');});
 const L=a=>a.slice(0,6).join('; ')+(a.length>6?' (+'+(a.length-6)+')':'');
 R.push({name:'every tube meets the surface (a portal or a skylight)',ok:!no.length,detail:no.length?'no opening: '+no.join(', '):lines.join('; ')});
 R.push({name:'each opening where the spec puts it, and open there',ok:!place.length,detail:place.length?L(place):P.tubes.reduce((a,T)=>a+T.open.length,0)+' openings'});
 R.push({name:'every tube floor under the ground everywhere but at its openings',ok:!under.length,detail:under.length?L(under):nS+' points, the highest '+(-worstF).toFixed(1)+' m under the ground'});
 R.push({name:'every tube roof under the ground by the cover ('+cover+' m) but at its openings',ok:!cov.length,detail:cov.length?L(cov):'the thinnest '+(cover-worstR).toFixed(1)+' m of rock over the roof'});
 R.push({name:'every tube floor keeps its grade (the ramp only at a portal)',ok:!grd.length,detail:grd.length?L(grd):'held'});
 return R;}
function hash(P){let h=2166136261>>>0;const mix=v=>{v=Math.round(v*1000)|0;for(let k=0;k<4;k++){h^=(v>>>(k*8))&255;h=Math.imul(h,16777619);}};
 const str=s=>{for(let i=0;i<s.length;i++){h^=s.charCodeAt(i)&255;h=Math.imul(h,16777619);}};
 P.tubes.forEach(T=>{str(T.id);T.st.forEach(s=>s.forEach(mix));T.sec.forEach(s=>{str(s.kind);mix(s.a);mix(s.b);mix(s.w);mix(s.h);});
  T.open.forEach(O=>{str(O.id);mix(O.i);mix(O.a);mix(O.b);if(O.ramp){mix(O.ramp[0]);mix(O.ramp[1]);}O.holes.forEach(H=>H.forEach(mix));if(O.shaft){mix(O.shaft.y0);mix(O.shaft.y1);mix(O.shaft.r1);}});
  T.halls.forEach(H=>{str(H.id);H.c.forEach(mix);});});
 return (h>>>0).toString(16);}

// ---------------------------------------------------------------- the indexes: the segments and the holes by bucket
function buckets(P){const c=ctx(P);if(c.ix)return c.ix;const B=D.bucket,ix=new Map(),hx=new Map(),put=(M,x0,z0,x1,z1,v)=>{
  for(let i=Math.floor(x0/B);i<=Math.floor(x1/B);i++)for(let k=Math.floor(z0/B);k<=Math.floor(z1/B);k++){const key=i+','+k;let a=M.get(key);if(!a)M.set(key,a=[]);a.push(v);}};
 P.tubes.forEach((T,t)=>{const st=T.st;T.sec.forEach((s,si)=>{const e=s.w/2+1;for(let i=s.a;i<s.b;i++){const A=st[i],B2=st[i+1];
   put(ix,Math.min(A[0],B2[0])-e,Math.min(A[1],B2[1])-e,Math.max(A[0],B2[0])+e,Math.max(A[1],B2[1])+e,{t,si,i});}});
  T.halls.forEach((H,hi)=>put(ix,H.c[0]-H.rx-1,H.c[2]-H.rz-1,H.c[0]+H.rx+1,H.c[2]+H.rz+1,{t,hall:hi}));
  T.open.forEach((O,oi)=>O.holes.forEach((H,k)=>{const r=H[2]+O.rim;put(hx,H[0]-r,H[1]-r,H[0]+r,H[1]+r,{t,oi,k});}));});
 c.ix=ix;c.hx=hx;return ix;}
/* each section's floor is read at the NEAREST point of its centreline, as KCAVERN's tube reads it (one frame for the whole run: a
   point past one segment's end belongs to the next segment, not to the clamped end of this one); past the section's own ends is
   its cap: no floor. Where voids overlap (a section's neighbour, a hall) the lowest floor is the rock's */
const NEAR=new Map();
function floorAt(P,x,z,full){const ix=buckets(P),a=ix.get(Math.floor(x/D.bucket)+','+Math.floor(z/D.bucket));if(!a)return null;let best=null;NEAR.clear();
 for(const q of a){const T=P.tubes[q.t];
  if(q.hall!=null){const H=T.halls[q.hall],e=full?-1.5:.6,u=(x-H.c[0])/(H.rx-e),v=(z-H.c[2])/(H.rz-e);if(u*u+v*v<=1&&(!best||H.c[1]<best.y))best={y:H.c[1],T,hall:H};continue;}
  const A=T.st[q.i],B=T.st[q.i+1],dx=B[0]-A[0],dz=B[1]-A[1],L2=dx*dx+dz*dz,ux=((x-A[0])*dx+(z-A[1])*dz)/L2;
  const u=clamp(ux,0,1),d=Math.hypot(x-A[0]-dx*u,z-A[1]-dz*u),k=q.t+':'+q.si,m=NEAR.get(k);
  if(!m||d<m.d)NEAR.set(k,{d,ux,u,q,T});}
 for(const m of NEAR.values()){const s=m.T.sec[m.q.si];
  if((m.ux<0&&m.q.i===s.a)||(m.ux>1&&m.q.i+1===s.b))continue;
  const half=full?s.w/2+1.5:Math.max(.3,s.w/2-(s.ledge?s.ledge.d:0)-.3);if(m.d>half)continue;
  const A=m.T.st[m.q.i],B=m.T.st[m.q.i+1],y=A[2]+(B[2]-A[2])*m.u;if(!best||y<best.y)best={y,T:m.T,sec:s};}
 return best;}
function holeAt(P,x,z){buckets(P);const a=ctx(P).hx.get(Math.floor(x/D.bucket)+','+Math.floor(z/D.bucket));if(!a)return null;
 for(const q of a){const O=P.tubes[q.t].open[q.oi],H=O.holes[q.k];if(Math.hypot(x-H[0],z-H[1])<H[2]+O.rim)return {open:O,T:P.tubes[q.t],hole:H};}return null;}

// ---------------------------------------------------------------- the squares and their caverns
function squares(P){const c=ctx(P);if(c.sq)return c.sq;const S=P.square,M=new Map(),grow=(x0,z0,x1,z1,t,i)=>{
  for(let a=Math.floor(x0/S);a<=Math.floor(x1/S);a++)for(let b=Math.floor(z0/S);b<=Math.floor(z1/S);b++){const key=a+','+b;let q=M.get(key);
   if(!q)M.set(key,q={i:a,k:b,items:[]});let it=q.items.find(e=>e.t===t);if(!it)q.items.push(it={t,a:i,b:i});it.a=Math.min(it.a,i);it.b=Math.max(it.b,i);}};
 P.tubes.forEach((T,t)=>{let wmax=0;T.sec.forEach(s=>{wmax=Math.max(wmax,s.w);});const e=wmax/2+D.margin;
  T.st.forEach((p,i)=>grow(p[0]-e,p[1]-e,p[0]+e,p[1]+e,t,i));
  T.open.forEach(O=>O.holes.forEach(H=>{const r=H[2]+O.rim+4;grow(H[0]-r,H[1]-r,H[0]+r,H[1]+r,t,O.i);}));
  T.halls.forEach(H=>{const r=Math.max(H.rx,H.rz)+D.margin;grow(H.c[0]-r,H.c[2]-r,H.c[0]+r,H.c[2]+r,t,H.i);});});
 c.sq=M;return M;}
function cavern(P,key,o){o=o||{};const c=ctx(P),hit=c.cav.get(key);if(hit){c.order.splice(c.order.indexOf(key),1);c.order.push(key);return hit;}
 const q=squares(P).get(key);if(!q)return null;const S=P.square,ox=q.i*S,oz=q.k*S,G0=o.ground||c.ground;
 if(!G0)throw new Error('WTUBES.cavern: no ground (WTUBES.bind)');if(!root.KCAVERN)throw new Error('WTUBES.cavern: load core/terrain/39-core-cavern.js');
 const cell=nz(o.cell,D.cell),CH=nz(o.chunk,D.chunk);
 const C=root.KCAVERN.create({ground:(x,z)=>G0(x+ox,z+oz),cell,chunk:CH,seed:KR.child(P.seed,'tubes/cavern'),walk:null,minRock:.8});
 const L=([x,z],y)=>[x-ox,y,z-oz],x0=-D.margin,x1=S+D.margin,inBox=(x,z,e)=>x-ox>=x0-e&&x-ox<=x1+e&&z-oz>=x0-e&&z-oz<=x1+e;
 q.items.forEach(it=>{const T=P.tubes[it.t],st=T.st;
  T.sec.forEach(s=>{let a=Math.max(s.a,it.a-1),b=Math.min(s.b,it.b+1);if(a>b)return;if(a===b){if(b<s.b)b++;else if(a>s.a)a--;else return;}
   const pts=[];for(let i=a;i<=b;i++)pts.push(L([st[i][0],st[i][1]],st[i][2]));
   C.tube({id:s.id+'@'+key,owner:T.id,pts,w:s.w,h:s.h,spring:.45,ledge:s.ledge||undefined,blend:3,rock:'basalt',finish:'raw'});});
  T.halls.forEach(H=>{if(!inBox(H.c[0],H.c[2],Math.max(H.rx,H.rz)+4))return;C.hall({id:H.id+'@'+key,owner:T.id,c:[H.c[0]-ox,H.c[1],H.c[2]-oz],rx:H.rx,rz:H.rz,h:H.h,belly:.25,blend:6});});
  T.open.forEach(O=>{if(O.shaft&&inBox(O.shaft.c[0],O.shaft.c[1],O.shaft.r0+4))
    C.shaft({id:O.id+'@'+key,owner:T.id,c:[O.shaft.c[0]-ox,O.shaft.c[1]-oz],y0:O.shaft.y0,y1:O.shaft.y1,r0:O.shaft.r0,r1:O.shaft.r1});
   O.holes.forEach((H,k)=>{if(inBox(H[0],H[1],H[2]+O.rim+4))C.opening({id:O.id+'#'+k+'@'+key,c:[H[0]-ox,H[1]-oz],r:H[2],rim:O.rim,kind:'well'});});});});
 C.build();const n=Math.round(S/CH);C.own=C.chunks.filter(k=>{const v=k.split(',');return +v[0]>=0&&+v[0]<n&&+v[2]>=0&&+v[2]<n;});
 C.origin=[ox,0,oz];C.key=key;c.cav.set(key,C);c.order.push(key);
 while(c.order.length>nz(o.keep,24)){const k=c.order.shift();c.cav.delete(k);}
 return C;}
function voidAt(P,x,y,z){const S=P.square,key=Math.floor(x/S)+','+Math.floor(z/S);if(!squares(P).has(key))return 1e9;const C=cavern(P,key);
 return C.voidSD(x-C.origin[0],y,z-C.origin[2]);}

// ---------------------------------------------------------------- the walker: the ground or the tube floor
// Underground (the feet more than 2 m under the ground) the tube floor is walked and the ground reached only where it is a step
// away (a portal's mouth); with no floor there the way is a wall (null). On the ground a walker keeps to it unless it opens (the
// ground's own point is in a void: a portal's ramp, a skylight), where it goes down onto the floor; the edge of a hole with no
// floor under it is a wall too.
// from ([x, z], optional): where the walker stood; then "underground" also asks that a tube floor was under its feet there, so a
// ground that jumps as the terrain's detail changes never reads as a tube far from any
function walk(P,x,z,feet,gy,from){const step=D.step,F=floorAt(P,x,z),hole=holeAt(P,x,z);
 let under=feet<gy-2;if(under&&from){const f0=floorAt(P,from[0],from[1],true);under=!!f0&&Math.abs(f0.y-feet)<1.5;}
 if(!F&&!hole&&!under)return {y:gy,kind:'ground'};
 const fl=F&&F.y<=gy+.3?F.y:null,gOpen=hole?voidAt(P,x,gy+.15,z)<0:false;
 if(under){if(fl!=null&&!gOpen&&gy<=feet+step&&gy>=fl)return {y:gy,kind:'ground'};
  if(fl!=null)return {y:fl,kind:'tube'};if(!gOpen&&gy<=feet+step)return {y:gy,kind:'ground'};return null;}
 if(!gOpen)return {y:gy,kind:'ground'};if(fl!=null)return {y:fl,kind:'tube'};return null;}

return {plan,bind,check,hash,floorAt,holeAt,voidAt,walk,squares,cavern,drawnGround,D};
})(typeof window!=='undefined'?window:globalThis);
