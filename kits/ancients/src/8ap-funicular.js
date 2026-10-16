// ================================================================ THE FUNICULAR
// The rusted, broken remnants of a MASSIVE Ancient funicular: one straight inclined railway from an UPPER
// STATION (a concrete winding house with giant sheave wheels) on a cliff top to a LOWER STATION (a platform
// hall) on the floor below. A 12 m deck carries two tracks (four heavy rails on concrete sleepers), a central
// cable channel with a sheave every 20 m, walkway stairs at both edges, and runs on lattice girders and
// concrete portal piers where the ground falls away, on a solid bed (embankment) where it is near, and in a
// cutting with retaining walls where the ground stands above it. Ruined: whole spans gone, others fallen and
// lying on the slope, spans hanging from one pier, pier stumps, a derelict stepped car.
//
// TWO CALLS (engine-neutral as far as it goes; see API.md "The funicular"):
//   FUNICULAR.plan({a:[x,y,z], b:[x,y,z], ground:(x,z)=>y, seed, width:12, pierStep:30, breaks:[f..], car:{..}})
//     -> a PLAIN DATA record (no THREE, no Math.random, no global PRNG draw). Every ground sample is taken here.
//   FUNICULAR.draw(record, parent) -> THREE.Group. Emits through the kit (kput), so it must run BEFORE kbake().
//     The one non-instanced mesh (the walkway stairs) goes into the returned group (added to `parent` if given).
//   FUNICULAR.deckY(record, x, z) -> deck-top y of an intact walkable strip or station floor at (x,z), else null.
//   FUNICULAR.carveY(record, x, z, y) -> the terrain height with the cuttings and station floors cut in:
//     a host's heightfield should pass every ground sample through it (it only ever lowers).
//
// Only globals of the shared core are used (10-core 30-kit 32-surfaces 50-registry, core/materials 20/22 and
// opt/69a): THREE, MAT, TEX, kdef, kput, KOFF, KXF, useGroupXF, endGroupXF, mesh, REGISTER, vWorldUV (optional).
// No reseed, no rng(): the fragment keeps its own hashed stream, so it moves nobody else's rubble.
const FUNICULAR=(function(){
 const SLAB=.7, GD=3.5, DEP=SLAB+GD;            // deck slab, girder depth, whole structure depth (m)
 const TRK=3.0, GAUGE=2.6;                      // track centres at +-TRK; rails at +-TRK +-GAUGE/2
 const RAILS=[-TRK-GAUGE/2,-TRK+GAUGE/2,TRK-GAUGE/2,TRK+GAUGE/2];
 const ST_UP={w:36,d:46,h:24}, ST_LO={w:32,lp:36,dc:16,h:11};
 const CAR={len:27.6,w:5.6,n:6,hc:3.4};

 // ---------------------------------------------------------------- hashing
 function fH(a,b,c){let h=Math.imul((a|0)^0x9E3779B9,0x85EBCA6B);h^=Math.imul((b|0)+0x7F4A7C15,0xC2B2AE35);
  h=Math.imul(h^(h>>>13),0x27D4EB2F);h^=Math.imul((c|0)+0x165667B1,0x9E3779B1);h^=h>>>15;h=Math.imul(h,0x2C1B3C6D);h^=h>>>12;
  return(h>>>0)/4294967296;}
 function fRng(s){s=(s>>>0)||1;return()=>{s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;
  return((t^t>>>14)>>>0)/4294967296;};}
 const fCl=(v,a,b)=>v<a?a:v>b?b:v, r2=v=>Math.round(v*100)/100;

 // ---------------------------------------------------------------- plan
 function plan(o){o=o||{};
  const G=typeof o.ground==='function'?o.ground:()=>0;
  const seed=(o.seed>>>0)||1, W=o.width||12, R=fRng(Math.imul(seed,2654435761)+1013);
  const A=o.a, B=o.b, ax=A[0], az=A[2];
  const L=Math.hypot(B[0]-ax,B[2]-az);
  if(!(L>=60))throw new Error('FUNICULAR.plan: the stations must be at least 60 m apart in plan');
  const ux=(B[0]-ax)/L, uz=(B[2]-az)/L, nx=uz, nz=-ux, ry=Math.atan2(ux,uz);
  const ya=A[1]!=null?A[1]:G(ax,az)+.5, yb=B[1]!=null?B[1]:G(B[0],B[2])+.5;
  if(!(yb<ya))throw new Error('FUNICULAR.plan: a is the UPPER station and must stand higher than b');
  const gr=(yb-ya)/L, cs=Math.sqrt(1+gr*gr), upx=-gr*ux/cs, upy=1/cs, upz=-gr*uz/cs;
  const yAt=s=>ya+gr*s;
  const P=(s,l)=>{l=l||0;return[ax+ux*s+nx*l,ya+gr*s,az+uz*s+nz*l];};
  const WX=(l,s)=>ax+ux*s+nx*l, WZ=(l,s)=>az+uz*s+nz*l;      // track-local (across l, along s) -> world
  const gAt=(s,l)=>G(WX(l||0,s),WZ(l||0,s));
  const gMax=s=>Math.max(gAt(s,-W/2),gAt(s,0),gAt(s,W/2)), gMin=s=>Math.min(gAt(s,-W/2),gAt(s,0),gAt(s,W/2));
  const n=Math.max(2,Math.round(L/(o.pierStep||30))), st=L/n;
  const blocks=[];
  // an oriented box (centre cx,cz; long axis (dx,dz) half hl; across half hw) as axis-aligned chunks
  const ob=(cx,cz,dx,dz,hl,hw,y0,y1,mc)=>{if(!(y1>y0))return;const k=Math.max(1,Math.ceil(2*hl/(mc||6))),h=hl/k;
   const ex=Math.abs(dx)*h+Math.abs(dz)*hw, ez=Math.abs(dz)*h+Math.abs(dx)*hw;
   for(let i=0;i<k;i++){const t=-hl+(i+.5)*2*h,x=cx+dx*t,z=cz+dz*t;blocks.push([r2(x-ex),r2(x+ex),r2(z-ez),r2(z+ez),r2(y0),r2(y1)]);}};
  const obSeg=(a,b,hw,dd,up)=>{const dx=b[0]-a[0],dz=b[2]-a[2],hl=Math.hypot(dx,dz)/2;const k=Math.max(1,Math.ceil(hl*2/6));
   const ex=hl>1e-3?dx/(2*hl):ux, ez=hl>1e-3?dz/(2*hl):uz;
   for(let i=0;i<k;i++){const t0=i/k,t1=(i+1)/k,y0=a[1]+(b[1]-a[1])*t0,y1=a[1]+(b[1]-a[1])*t1,tm=(t0+t1)/2;
    ob(a[0]+dx*tm,a[2]+dz*tm,ex,ez,hl/k,hw,Math.min(y0,y1)-dd,Math.max(y0,y1)+up,99);}};

  // ---- spans: what the ground does under each
  const spans=[];
  for(let i=0;i<n;i++){const s0=i*st,s1=s0+st;let cmin=1e9,gmin=1e9;
   for(let k=0;k<=6;k++){const s=s0+st*k/6;cmin=Math.min(cmin,yAt(s)-gMax(s));gmin=Math.min(gmin,gMin(s));}
   spans.push({i,s0,s1,kind:cmin>=DEP+1.5?'viaduct':cmin<SLAB?'cut':'grade',cmin,gmin,state:'intact'});}

  // ---- the breaks: runs of 1-3 spans (30-90 m) on viaduct, never next to a station
  const cand=i=>i>=2&&i<=n-3&&spans[i].kind==='viaduct';
  const used=new Set(), near=j=>used.has(j)||used.has(j-1)||used.has(j+1), runs=[];
  let fr;
  if(Array.isArray(o.breaks))fr=o.breaks.slice();
  else{const nb=Math.max(1,Math.round(L/420));fr=[];for(let k=0;k<nb;k++)fr.push((k+.15+.7*R())/nb);}
  for(const f of fr){const i=Math.floor(fCl(f,0,.9999)*n);let best=-1;
   for(let d=0;d<=4&&best<0;d++)for(const j of[i-d,i+d])if(best<0&&j>=0&&j<n&&cand(j)&&!near(j))best=j;
   if(best<0){if(Array.isArray(o.breaks)&&i>=1&&i<=n-2&&!near(i))best=i;else continue;}
   const want=1+Math.floor(R()*3);let i0=best,i1=best;
   while(i1-i0+1<want){if(i1+1<n&&cand(i1+1)&&!near(i1+1))i1++;else if(i0-1>=0&&cand(i0-1)&&!near(i0-1))i0--;else break;}
   for(let j=i0-1;j<=i1+1;j++)used.add(j);
   runs.push([i0,i1]);}
  runs.sort((p,q)=>p[0]-q[0]);
  const dead=sp=>!!sp&&(sp.state==='gap'||sp.state==='collapsed');
  for(const[i0,i1]of runs){
   for(let j=i0;j<=i1;j++)spans[j].state=R()<.5?'collapsed':'gap';
   const up=spans[i0-1], dn=spans[i1+1];
   if(up&&up.state==='intact'&&up.kind==='viaduct'&&R()<.55){up.state='hanging';up.hinge=0;}
   if(dn&&dn.state==='intact'&&dn.kind==='viaduct'&&R()<.35){dn.state='hanging';dn.hinge=1;}}

  // ---- segment geometry: as built (o0,o1) and as it lies now (a,b / pieces)
  for(const sp of spans){sp.o0=P(sp.s0);sp.o1=P(sp.s1);sp.a=sp.o0;sp.b=sp.o1;sp.w=W;
   const pv=spans[sp.i-1], nx_=spans[sp.i+1];
   sp.edge0=sp.state==='intact'&&(dead(pv)||(!!pv&&pv.state==='hanging'&&pv.hinge===0));
   sp.edge1=sp.state==='intact'&&(dead(nx_)||(!!nx_&&nx_.state==='hanging'&&nx_.hinge===1));
   if(sp.state==='hanging'){const H=sp.hinge===0?sp.o0:sp.o1, F=sp.hinge===0?sp.o1:sp.o0;
    const al=sp.hinge===0?st:-st, vt=F[1]-H[1], len=Math.hypot(st,vt), psi=Math.atan2(vt,al), sg=Math.sign(al);
    let alpha=.45+.75*R(), q=null;
    for(let t=0;t<14;t++){const ps=psi-alpha*sg, fa=Math.cos(ps)*len, fv=Math.sin(ps)*len;
     const fx=H[0]+ux*fa, fz=H[2]+uz*fa, fy=H[1]+fv;
     if(fy>=G(fx,fz)+2.5||alpha<.04){q=[fx,fy,fz];break;}alpha*=.8;}
    sp.drop=alpha;sp.roll=(R()-.5)*.3;
    if(sp.hinge===0){sp.a=H;sp.b=q;sp.edge1=true;}else{sp.a=q;sp.b=H;sp.edge0=true;}}
   if(sp.state==='collapsed'){sp.pieces=[];const cut=.42+.16*R(), lo=(R()-.5)*14;
    for(let k=0;k<2;k++){const f0=k?cut+.03:.04, f1=k?.96:cut-.03;
     const l0=lo+(R()-.5)*6, l1=l0+(R()-.5)*9, s0=sp.s0+st*f0+(R()-.5)*3, s1=sp.s0+st*f1+(R()-.5)*3;
     const roll=R()<.25?(R()<.5?-1:1)*(1.1+.4*R()):(R()-.5)*.7, lift=1.6+Math.abs(Math.sin(roll))*4.6;
     const p0=P(s0,l0), p1=P(s1,l1);p0[1]=gAt(s0,l0)+lift;p1[1]=gAt(s1,l1)+lift;
     sp.pieces.push({a:p0,b:p1,roll});}
    sp.a=sp.pieces[0].a;sp.b=sp.pieces[1].b;}}

  // ---- piers (concrete portals under the girder ends) and their states
  const piers=[];
  for(let i=1;i<n;i++){const L_=spans[i-1], R_=spans[i];
   if(L_.kind!=='viaduct'&&R_.kind!=='viaduct')continue;
   const s=i*st, p=P(s), cx=p[0]-DEP*upx, cz=p[2]-DEP*upz, top=p[1]-DEP*upy, lx=W/2-1.6;
   const legs=[-1,1].map(sd=>{const x=cx+nx*sd*lx, z=cz+nz*sd*lx;return[x,z,G(x,z)-1.5];});
   const y0=Math.min(legs[0][2],legs[1][2]);
   let state='standing';
   if(dead(L_)&&dead(R_)){const r=R();state=r<.55?'stump':r<.8?'standing':'gone';}
   else if((L_.state==='hanging'&&L_.hinge===0)||(R_.state==='hanging'&&R_.hinge===1))state='stump';
   let y1=top;
   if(top<=y0+1.6)state='standing';
   else if(state==='stump')y1=y0+1.5+(top-y0-1.5)*(.22+.45*R());
   else if(state==='gone')y1=y0+1.5+.6*R();
   piers.push({i,s,x:cx,z:cz,y0,y1,top,w:W+1.6,d:3.2,ry,state,legs});
   for(const g of legs)ob(g[0],g[1],ux,uz,1.6,1.3,g[2],state==='standing'?top-2.2:y1,99);
   if(state==='standing')ob(cx,cz,nx,nz,(W+1.6)/2,1.6,top-2.2,top,6);}

  // ---- beds (embankment under a grade/cut deck) and retaining walls (cuttings)
  const beds=[], walls=[], cuts=[];
  for(const sp of spans){if(sp.kind==='viaduct')continue;
   const k=Math.ceil(st/6), cl=st/k;let depth=0;
   for(let j=0;j<k;j++){const sc=sp.s0+(j+.5)*cl, sl=sc+cl/2, yU=yAt(sl)-SLAB, wedge=-gr*cl, p=P(sc);
    let gm=1e9;for(const s of[sc-cl/2,sc,sl])gm=Math.min(gm,gMin(s));
    beds.push({x:p[0],z:p[2],y0:Math.min(gm-1,yU),y1:yU,len:cl,w:W,wedge,ry});
    if(yU>gm)ob(p[0],p[2],ux,uz,cl/2,W/2,gm-1,yU,99);
    for(const sd of[-1,1]){const l=sd*(W/2+1.2), gu=gAt(sc-cl/2,l), gd=gAt(sl,l), gs=Math.max(gu,gd,gAt(sc,l));
     const yd=yAt(sl);depth=Math.max(depth,gs-yd);
     // the wall top follows the ground: a level box to the lower end's ground, a wedge up to the upper end's
     if(gs>yd+.3){const wp=P(sc,sd*(W/2+.5)), y1=Math.max(Math.min(gu,gd),yd)+.4, wg=Math.max(0,gu+.4-y1);
      walls.push({x:wp[0],z:wp[2],y0:yd-SLAB-.5,y1,wedge:wg,len:cl+.05,t:1,ry});
      ob(wp[0],wp[2],ux,uz,cl/2,.5,yd-SLAB-.5,y1+wg,99);}}}
   if(depth>0)cuts.push({s0:sp.s0,s1:sp.s1,depth:r2(depth)});}

  // ---- debris under the dead spans, and the haul cable over each break
  const debris=[], cables=[];
  for(const sp of spans){if(!dead(sp))continue;
   const nr=sp.state==='gap'?18:9;
   for(let k=0;k<nr;k++){const s=sp.s0+R()*st, l=(R()-.5)*(W+18), sz=.6+R()*R()*2.6, p=P(s,l);
    debris.push({k:'rubble',x:p[0],y:gAt(s,l)+sz*.3,z:p[2],s:sz,rx:R()*6.28,ry:R()*6.28,rz:R()*6.28});}
   if(sp.state==='gap')for(let k=0;k<4;k++){const s=sp.s0+R()*st, l=(R()-.5)*(W+10), an=R()*6.28, len=4+R()*10, p=P(s,l);
    const ex=p[0]+Math.cos(an)*len, ez=p[2]+Math.sin(an)*len;
    debris.push({k:'bar',a:[p[0],gAt(s,l)+.4+R()*1.5,p[2]],b:[ex,G(ex,ez)+.4,ez],w:.5+R()*.4});}}
  for(const[i0,i1]of runs){
   const iu=spans[i0-1]&&spans[i0-1].state==='hanging'?i0-1:i0, id=spans[i1+1]&&spans[i1+1].state==='hanging'?i1+2:i1+1;
   const pa=P(iu*st), pb=P(id*st);pa[1]+=.3;pb[1]+=.3;
   if(R()<.6){const sag=.1*(id-iu)*st+3+R()*8, pts=[];
    for(let k=0;k<=12;k++){const t=k/12, x=pa[0]+(pb[0]-pa[0])*t, z=pa[2]+(pb[2]-pa[2])*t;
     pts.push([x,Math.max(pa[1]+(pb[1]-pa[1])*t-sag*4*t*(1-t),G(x,z)+.3),z]);}
    cables.push(pts);}
   else for(const[p,dir]of[[pa,1],[pb,-1]]){const pts=[p.slice()];let x=p[0],y=p[1],z=p[2];
    for(let k=1;k<=7;k++){x+=ux*dir*1.3;z+=uz*dir*1.3;y-=3+R()*3;const g=G(x,z)+.3;if(y<g){pts.push([x,g,z]);break;}pts.push([x,y,z]);}
    cables.push(pts);}}

  // ---- the car: stuck on the track above a break, or fallen and lying on the slope below one
  let car=null;
  if(o.car!==false){const co=o.car||{}, Lc=CAR.len, k=-gr;
   let state=co.state||(R()<.62?'stuck':'fallen');const track=co.track||(R()<.5?-1:1);
   if(state==='fallen'&&!runs.length)state='stuck';
   const okAt=s=>{if(s-Lc/2<6||s+Lc/2>L-ST_LO.lp-4)return false;
    for(const sp of spans)if(sp.s1>s-Lc/2&&sp.s0<s+Lc/2&&sp.state!=='intact')return false;return true;};
   if(state==='stuck'){let s=co.at!=null?co.at*L:(runs.length?spans[runs[0][0]].s0-Lc/2-3:L*(.35+.3*R()));
    for(let t=0;t<400&&!okAt(s);t++)s-=st/8;
    if(!okAt(s)){s=Lc/2+8;}
    const p=P(s,track*TRK);
    car={state,track,s,x:p[0],y:p[1],z:p[2],ry,pitch:0,roll:(R()-.5)*.05};}
   else{const rn=runs[Math.min(co.run||0,runs.length-1)], s=(spans[rn[0]].s0+spans[rn[1]].s1)/2, l=(R()<.5?-1:1)*(8+R()*12);
    const g0=gAt(s-Lc/2,l), g1=gAt(s+Lc/2,l), slope=(g1-g0)/Lc, p=P(s,l);
    car={state,track:0,s,x:p[0],y:gAt(s,l)+CAR.w/2-.5,z:p[2],ry:ry+(R()-.5)*.5,pitch:-Math.atan(k)-Math.atan(slope),
     roll:(R()<.5?-1:1)*(1.25+R()*.3)};}
   Object.assign(car,{len:Lc,w:CAR.w,n:CAR.n,hc:CAR.hc,k});
   if(car.state==='stuck'){const kk=4;for(let j=0;j<kk;j++){const z0=-Lc/2+j*Lc/kk, z1=z0+Lc/kk, zc=(z0+z1)/2;
     ob(car.x+ux*zc,car.z+uz*zc,ux,uz,Lc/kk/2,CAR.w/2,car.y-k*z1,car.y-k*z0+1.9+CAR.hc+.4,99);}}
   else ob(car.x,car.z,Math.sin(car.ry),Math.cos(car.ry),Lc/2,CAR.w/2+1,car.y-CAR.w/2,car.y+CAR.w/2+1,7);}

  // ---- stations (layout and damage decided here; draw() only renders it)
  const stations=[];
  const LW=(x,z,y0)=>[ax+nx*x+ux*z,az+nz*x+uz*z];               // upper-station local -> world xz
  { const S=ST_UP, cells=[], bays=[], bl=S.d/8, beams=[], slabs=[], wheels=[];
   for(let i=0;i<3;i++)for(let j=0;j<4;j++){const cx=-S.w/2+S.w/6*(2*i+1), cz=-S.d+S.d/8*(2*j+1);let gm=1e9;
    for(const fx of[-.5,0,.5])for(const fz of[-.5,0,.5]){const w=LW(cx+fx*S.w/3,cz+fz*S.d/4);gm=Math.min(gm,G(w[0],w[1]));}
    const y0=gm-ya-1;if(y0<-1.2){cells.push({x:cx,z:cz,w:S.w/3,d:S.d/4,y0});const w=LW(cx,cz);ob(w[0],w[1],ux,uz,S.d/8,S.w/6,ya+y0,ya-1.2,99);}}
   const corner=R()<.5?-1:1;                                    // the back corner that came down
   const dmg=(x,z)=>{const dc=Math.hypot(x-corner*S.w/2,z+S.d);
    if(dc<15)return 1.5+R()*5;if(R()<.22)return 6+R()*9;return S.h;};
   for(const sd of[-1,1])for(let i=0;i<8;i++){const z=-S.d+bl*(i+.5), x=sd*(S.w/2-.8);bays.push({x,z,ax:0,len:bl,y0:0,h:dmg(x,z),win:1});}
   for(let i=0;i<6;i++){const x=-S.w/2+6*(i+.5), z=-S.d+.8;bays.push({x,z,ax:1,len:6,y0:0,h:dmg(x,z),win:1});}
   for(const sd of[-1,1])for(let i=0;i<2;i++){const x=sd*(7.5+2.625*(2*i+1)), z=-.8;bays.push({x,z,ax:1,len:5.25,y0:0,h:R()<.15?8+R()*8:S.h,win:0});}
   bays.push({x:0,z:-.8,ax:1,len:15,y0:11,h:S.h,win:0});        // the lintel over the track portal
   for(const b of bays){const w=LW(b.x,b.z),d=b.ax?[nx,nz]:[ux,uz];ob(w[0],w[1],d[0],d[1],b.len/2,.8,ya+b.y0,ya+b.h,8);}
   const whole=z=>bays.filter(b=>b.ax===0&&Math.abs(b.z-z)<bl*.75).every(b=>b.h>=S.h-.1);
   for(let i=1;i<8;i++){const z=-S.d+bl*i;beams.push({z,up:whole(z)&&R()>.25,t:R()});}
   for(let i=0;i<8;i++){const z0=-S.d+bl*i, z1=z0+bl, b0=i?beams[i-1].up:whole(z0+1), b1=i<7?beams[i].up:whole(z1-1);
    slabs.push({z0,z1,up:b0&&b1&&(z1<-38||z0>-6)&&R()>.3});}         // the roof is gone over the wheels
   wheels.push({z:-11.5,r:8.5,y:5.4,lean:0},{z:-29,r:8.5,y:5.4,lean:R()<.6?(R()<.5?-1:1)*(.22+R()*.2):0});
   for(const wh of wheels){const w=LW(0,wh.z);ob(w[0],w[1],ux,uz,wh.r,3.4,ya,ya+wh.y+wh.r,99);}
   const fl=LW(0,-S.d/2);{const e=LW(0,-42.8);ob(e[0],e[1],nx,nz,7.5,1.4,ya,ya+6.8,99);}ob(fl[0],fl[1],ux,uz,S.d/2,S.w/2,ya-1.2,ya,8);
   stations.push({kind:'upper',x:ax,y:ya,z:az,ry,w:S.w,d:S.d,h:S.h,s0:-S.d,s1:0,cells,bays,beams,slabs,wheels,corner});}
  { const S=ST_LO, bx=B[0], bz=B[2], lp=Math.min(S.lp,L*.3), ns=Math.max(2,Math.round(lp/4.6)), sl=lp/ns, steps=[], conc=[], frames=[];
   const LWb=(x,z)=>[bx+nx*x+ux*z,bz+nz*x+uz*z];
   const gMinBox=(x0,x1,z0,z1)=>{let gm=1e9;for(const fx of[0,.5,1])for(const fz of[0,.5,1]){const w=LWb(x0+(x1-x0)*fx,z0+(z1-z0)*fz);gm=Math.min(gm,G(w[0],w[1]));}return gm-yb;};
   for(let j=0;j<ns;j++){const z0=-lp+j*sl, z1=z0+sl, top=gr*z0+1.1;
    const bot=[-1,1].map(sd=>gMinBox(sd*6.6,sd*15.4,z0,z1)-1);
    steps.push({z0,z1,top,bot});
    for(const sd of[-1,1]){const w=LWb(sd*11,(z0+z1)/2);ob(w[0],w[1],ux,uz,sl/2,4.4,yb+bot[(sd+1)/2],yb+top,99);}}
   for(const sd of[-1,1])for(const[z0,z1]of[[1,1+S.dc/2],[1+S.dc/2,1+S.dc]]){const b=gMinBox(0,sd*S.w/2,z0,z1)-1;
    conc.push({x:sd*S.w/4,z:(z0+z1)/2,w:S.w/2,d:z1-z0,y0:b,top:1.1});const w=LWb(sd*S.w/4,(z0+z1)/2);ob(w[0],w[1],ux,uz,(z1-z0)/2,S.w/4,yb+b,yb+1.1,99);}
   const zs=[];for(let j=0;j<=ns;j++)zs.push(-lp+j*sl);zs.push(1+S.dc*.5,S.dc+.4);
   for(const z of zs){const base=z<-.01?gr*z+1.1:1.1;let cl=R()>.2, cr=R()>.2;
    frames.push({z,base,colL:cl,colR:cr,beam:cl&&cr?(R()<.15?'gone':'up'):(cl||cr)&&R()<.7?'hang':'gone'});}
   const purl=[];for(let j=0;j+1<frames.length;j++)purl.push({up:frames[j].beam==='up'&&frames[j+1].beam==='up'&&R()>.15,plate:R()});
   const wallL=R()<.4?4+R()*3:9;
   for(const sd of[-1,1]){const w=LWb(sd*10.5,S.dc+1.6);ob(w[0],w[1],nx,nz,5.5,.6,yb,yb+1.1+(sd<0?wallL:9),99);}
   stations.push({kind:'lower',x:bx,y:yb,z:bz,ry,w:S.w,d:lp+1+S.dc,h:S.h,s0:L-lp,s1:L+1+S.dc,lp,dc:S.dc,steps,conc,frames,purl,wallL});}

  // ---- hanging and fallen spans, collapsed pieces as solids
  for(const sp of spans){if(sp.state==='hanging')obSeg(sp.a,sp.b,W/2,DEP,.6);
   if(sp.state==='collapsed')for(const pc of sp.pieces)obSeg(pc.a,pc.b,W/2,DEP,1.2);}
  for(const d of debris)if(d.k==='rubble'&&d.s>1.4)blocks.push([r2(d.x-d.s*.7),r2(d.x+d.s*.7),r2(d.z-d.s*.7),r2(d.z+d.s*.7),r2(d.y-d.s*.7),r2(d.y+d.s*.7)]);

  // ---- walkable strips: the intact deck, continuous; and the station floors
  const walk=[];let run=null;
  for(const sp of spans){if(sp.state==='intact'){if(!run)run={s0:sp.s0,s1:sp.s1};else run.s1=sp.s1;}else if(run){walk.push(run);run=null;}}
  if(run)walk.push(run);
  const strip=(s0,s1,y0,y1,w,kind)=>({kind,a:[WX(0,s0),WZ(0,s0),y0],b:[WX(0,s1),WZ(0,s1),y1],w,s0,s1});
  const W_=walk.map(r=>strip(r.s0,r.s1,yAt(r.s0),yAt(r.s1),W,'track'));
  W_.push(strip(-ST_UP.d+2,0,ya,ya,ST_UP.w-4,'floor'));
  W_.push(strip(L+1,L+1+ST_LO.dc-1,yb+1.1,yb+1.1,ST_LO.w-2,'floor'));

  const segments=spans.map(sp=>{const s={i:sp.i,s0:sp.s0,s1:sp.s1,a:sp.a,b:sp.b,o0:sp.o0,o1:sp.o1,w:W,kind:sp.kind,state:sp.state,
   edge0:sp.edge0,edge1:sp.edge1,gmin:sp.gmin};
   if(sp.state==='hanging'){s.hinge=sp.hinge;s.drop=sp.drop;s.roll=sp.roll;}
   if(sp.state==='collapsed')s.pieces=sp.pieces;return s;});
  return{v:1,seed,W,L,step:st,grade:gr,a:[ax,ya,az],b:[B[0],yb,B[2]],u:[ux,uz],n:[nx,nz],ry,depth:DEP,slab:SLAB,
   segments,piers,beds,walls,cuts,debris,cables,stations,car,breaks:runs.map(r=>[r[0],r[1]]),walk:W_,blocks};}

 // ---------------------------------------------------------------- queries on a record
 function local(rec,x,z){const dx=x-rec.a[0], dz=z-rec.a[2];return[dx*rec.u[0]+dz*rec.u[1],dx*rec.n[0]+dz*rec.n[1]];}
 function deckY(rec,x,z){const q=local(rec,x,z), s=q[0], l=q[1];
  for(const w of rec.walk){if(s<w.s0||s>w.s1||Math.abs(l)>w.w/2)continue;
   const t=w.s1>w.s0?(s-w.s0)/(w.s1-w.s0):0;return w.a[2]+(w.b[2]-w.a[2])*t;}
  return null;}
 function carveY(rec,x,z,y){const q=local(rec,x,z), s=q[0], l=q[1], al=Math.abs(l), W=rec.W, gr=rec.grade, ya=rec.a[1];
  if(s>=-1&&s<=rec.L+1&&al<=W/2+1.5){const yd=ya+gr*fCl(s,0,rec.L)-rec.slab;if(y>yd)y=yd;}
  const U=rec.stations[0], D=rec.stations[1];
  if(U&&s>=-U.d-.5&&s<=0&&al<=U.w/2+.5&&y>ya-.3)y=ya-.3;
  if(D&&s>=rec.L-D.lp&&s<=rec.L+1+D.dc+.5&&al<=D.w/2+.5){const top=s<rec.L?rec.b[1]+gr*(s-rec.L)+.9:rec.b[1]+.9;if(y>top)y=top;}
  return y;}

 // ---------------------------------------------------------------- materials and kit items
 const DSx=THREE.DoubleSide, wuv=(m,K)=>typeof vWorldUV==='function'?vWorldUV(m,K):m;
 // Board-formed concrete when this build has it (54-mat-concrete.js); otherwise flat stained grey.
 const FM={conc:wuv(new THREE.MeshStandardMaterial({map:TEX.concrete||null,roughnessMap:TEX.concreteRM||null,color:0xffffff,roughness:1,metalness:0,side:DSx}),1/8),
  steel:wuv(MAT.rust.clone(),1/6), green:wuv(MAT.verdigris.clone(),1/4), white:wuv(MAT.white.clone(),1/8)};
 FM.stair=new THREE.MeshStandardMaterial({map:TEX.concrete||null,color:0x9c9286,roughness:1,metalness:0,side:DSx});
 function frustumGeo(k){const g=new THREE.BoxGeometry(1,1,1), p=g.attributes.position;
  for(let i=0;i<p.count;i++)if(p.getY(i)>0)p.setXYZ(i,p.getX(i)*k,p.getY(i),p.getZ(i)*k);g.computeVertexNormals();return g;}
 function wedgeGeo(){const v=[[-.5,0,-.5],[.5,0,-.5],[.5,0,.5],[-.5,0,.5],[-.5,-1,.5],[.5,-1,.5]],P=[],N=[],U=[];
  const tri=(a,b,c,nn,uv)=>{for(const[i,t]of[[a,uv[0]],[b,uv[1]],[c,uv[2]]]){P.push(...v[i]);N.push(...nn);U.push(...t);}};
  const s=1/Math.SQRT2, q=[[0,0],[1,0],[1,1]], q2=[[0,0],[1,1],[0,1]];
  tri(0,2,1,[0,1,0],q);tri(0,3,2,[0,1,0],q2);                       // top
  tri(0,1,5,[0,-s,-s],q);tri(0,5,4,[0,-s,-s],q2);                   // sloped underside
  tri(3,4,5,[0,0,1],q);tri(3,5,2,[0,0,1],q2);                       // the deep end
  tri(0,4,3,[-1,0,0],q);tri(1,2,5,[1,0,0],q);                       // sides
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));
  g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));return g;}
 function blockGeo(){const g=new THREE.BoxGeometry(1.4,1.4,1.4), p=g.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=fH(Math.sign(x)*3+5,Math.sign(y)*5+9,Math.sign(z)*7+13);
   p.setXYZ(i,x*(1+(k-.5)*.5),y*(1+(fH(k*1e6|0,2,1)-.5)*.45),z*(1+(fH(k*1e6|0,4,3)-.5)*.5));}
  const g2=g.toNonIndexed();g2.computeVertexNormals();return g2;}
 const axX=g=>g.rotateZ(Math.PI/2);                                  // cylinder axis -> local x
 kdef('funBoxC',new THREE.BoxGeometry(1,1,1),FM.conc);
 kdef('funBoxS',new THREE.BoxGeometry(1,1,1),FM.steel);
 kdef('funBoxV',new THREE.BoxGeometry(1,1,1),FM.green);
 kdef('funBoxW',new THREE.BoxGeometry(1,1,1),FM.white);
 kdef('funBoxD',new THREE.BoxGeometry(1,1,1),MAT.dark);
 kdef('funLeg',frustumGeo(.8),FM.conc);
 kdef('funWedge',wedgeGeo(),FM.conc);
 kdef('funWedgeS',wedgeGeo(),FM.steel);
 kdef('funSheave',axX(new THREE.CylinderGeometry(1,1,1,14,1)),FM.green);
 kdef('funHub',axX(new THREE.CylinderGeometry(1,1,1,16,1)),FM.steel);
 kdef('funHubV',axX(new THREE.CylinderGeometry(1,1,1,16,1)),FM.green);
 kdef('funRim',new THREE.TorusGeometry(1,.07,6,40).rotateY(Math.PI/2),FM.steel);
 kdef('funRubble',blockGeo(),FM.conc);
 const C=h=>new THREE.Color(h);
 const T_CONC=[C(0xa79d91),C(0x9b9084),C(0xb3a899),C(0x8e8276),C(0xa38b74),C(0x8b7b6b)];
 const T_STEEL=[C(0xffffff),C(0xead9ca),C(0xd2bba6),C(0xbba18a)];
 const T_WHITE=[C(0xcfc8bc),C(0xbdb4a7),C(0xaba194)];
 const T_RAIL=C(0x86766a), T_CABLE=C(0x51443b), T_DARK=C(0x3a3430);
 const pick=(A,h)=>A[Math.floor(h*A.length)%A.length];

 // ---------------------------------------------------------------- draw helpers
 const _Y=new THREE.Vector3(0,1,0), _T=new THREE.Vector3(), _N=new THREE.Vector3(), _U=new THREE.Vector3(), _M=new THREE.Matrix4();
 const _G=new THREE.Group(), _Z=new THREE.Vector3(0,0,1), _X=new THREE.Vector3(1,0,0);
 const qY=a=>new THREE.Quaternion().setFromAxisAngle(_Y,a);
 // a frame whose local z runs a->b, local x is horizontal, then rolled about z
 function segQ(a,b,roll,fb){_T.set(b[0]-a[0],b[1]-a[1],b[2]-a[2]).normalize();_N.crossVectors(_Y,_T);
  if(_N.lengthSq()<1e-8)_N.set(fb[0],0,fb[1]);_N.normalize();_U.crossVectors(_T,_N);_M.makeBasis(_N,_U,_T);
  const Q=new THREE.Quaternion().setFromRotationMatrix(_M);if(roll)Q.multiply(new THREE.Quaternion().setFromAxisAngle(_Z,roll));return Q;}
 function pushXF(p,Q){_G.position.set(p[0],p[1],p[2]);_G.quaternion.copy(Q);_G.scale.set(1,1,1);useGroupXF(_G);}
 // a box from a to b (local y along it), section w x dp
 function bar(name,a,b,w,dp,c){_T.set(b[0]-a[0],b[1]-a[1],b[2]-a[2]);const L=_T.length();if(!(L>1e-4))return;
  kput(name,[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],new THREE.Quaternion().setFromUnitVectors(_Y,_T.multiplyScalar(1/L)),[w,L,dp],c||null);}
 const dist=(a,b)=>Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]);

 // ONE SPAN in its own frame: deck top at y=0, local z from 0 to len (downhill), x across.
 // o: {via (lattice girders), dmg 0..1 (how much small detail is gone), e0/e1 (torn ends), l0 (track
 // distance at z=0, for the sheave rhythm), h (hash key), W}
 function spanLocal(len,o){const W=o.W, h=o.h, d=o.dmg, ct=pick(T_CONC,fH(h,1,0));
  const hh=(i,j)=>fH(h,i,j);
  kput('funBoxC',[0,-SLAB/2,len/2],null,[W,SLAB,len],ct);
  for(const sd of[-1,1]){kput('funBoxC',[sd*(W/2-.15),.3,len/2],null,[.3,.6,len],ct);
   kput('funBoxC',[sd*.75,.22,len/2],null,[.3,.45,len],ct);}
  RAILS.forEach((x,i)=>{if(hh(2,i)<d*.3)return;kput('funBoxS',[x,.41,len/2],null,[.26,.34,len],T_RAIL);});
  const ns=Math.max(1,Math.floor(len/1.3));
  for(let j=0;j<ns;j++)for(const sd of[-1,1]){if(hh(3,j*2+(sd>0))<d*.45)continue;
   kput('funBoxC',[sd*TRK,.12,(j+.5)*len/ns],null,[3.6,.24,.42],pick(T_CONC,hh(4,j)));}
  if(!o.noCable&&hh(5,0)>d*.6)kput('funBoxS',[0,.3,len/2],null,[.12,.12,len],T_CABLE);
  for(let z=(20-(o.l0%20+20)%20)%20;z<len;z+=20){if(hh(6,z|0)<.25+d*.4)continue;kput('funSheave',[0,.3,z],null,[.3,.55,.55]);}
  const np=Math.max(1,Math.round(len/3));
  for(const sd of[-1,1]){const x=sd*(W/2-.15);
   for(let j=0;j<=np;j++){if(hh(7,j*2+(sd>0))<.3+d)continue;kput('funBoxS',[x,1.15,j*len/np],null,[.14,1.1,.14],pick(T_STEEL,hh(8,j)));}
   if(hh(9,sd)>.35+d)kput('funBoxS',[x,1.72,len/2],null,[.1,.1,len],pick(T_STEEL,hh(10,sd)));}
  if(o.via){const npn=Math.max(2,Math.round(len/3.8)), pl=len/npn, yt=-SLAB-.3, yb=-DEP+.3, gx=W/2-1.1;
   for(const sd of[-1,1]){const x=sd*gx, c=pick(T_STEEL,hh(11,sd));
    kput('funBoxS',[x,yt,len/2],null,[.75,.6,len],c);kput('funBoxS',[x,yb,len/2],null,[.75,.6,len],c);
    for(let j=0;j<=npn;j++){const z=j*pl;if(j&&j<npn&&hh(12,j*2+(sd>0))<d*.3)continue;kput('funBoxS',[x,(yt+yb)/2,z],null,[.5,yt-yb,.5],c);
     if(j<npn&&hh(13,j*2+(sd>0))>d*.35){const up=j%2===0;bar('funBoxS',[x,up?yt:yb,z],[x,up?yb:yt,z+pl],.42,.42,c);}}}
   for(let j=0;j<=npn;j++){kput('funBoxS',[0,-SLAB-.3,j*pl],null,[W-1.4,.5,.5],pick(T_STEEL,hh(14,j)));
    if(j%2===0)kput('funBoxS',[0,yb,j*pl],null,[W-2.6,.4,.4],pick(T_STEEL,hh(15,j)));}}
  // torn ends: bent rails reaching out over the drop, a ragged lip of concrete
  for(const[e,z0,dir]of[[o.e0,0,-1],[o.e1,len,1]]){if(!e)continue;
   RAILS.forEach((x,i)=>{if(hh(16+(dir>0),i)<.3)return;const l1=1.5+3*hh(18,i+(dir>0)*4), dr=.2+.9*hh(19,i+(dir>0)*4);
    const p1=[x+(hh(20,i)-.5)*.8,.41-Math.sin(dr)*l1,z0+dir*Math.cos(dr)*l1];bar('funBoxS',[x,.41,z0],p1,.26,.34,T_RAIL);
    if(hh(21,i)<.6){const dr2=dr+.5+hh(22,i);bar('funBoxS',p1,[p1[0],p1[1]-Math.sin(dr2)*2.5,p1[2]+dir*Math.cos(dr2)*2.5],.26,.34,T_RAIL);}});
   for(let k=0;k<5;k++)kput('funRubble',[(hh(23,k+(dir>0)*8)-.5)*W*.9,-.3,z0-dir*.4],qY(hh(24,k)*6.3),.5+hh(25,k)*.6,pick(T_CONC,hh(26,k)));}}

 // the derelict car, in a LEVEL frame (origin on the deck top at the car's centre, z downhill): the chassis
 // follows the incline (deck y = -k z), the compartments are level and stepped, glass gone
 function carLocal(c,hk){const Lc=c.len, w=c.w, k=c.k, n=c.n, hc=c.hc, lc=Lc/n, dk=y=>-k*y;
  const hh=(i,j)=>fH(hk,i,j);
  for(const sd of[-1,1]){bar('funBoxS',[sd*1.5,dk(-Lc/2)+1.0,-Lc/2],[sd*1.5,dk(Lc/2)+1.0,Lc/2],.55,.75);}
  for(const zb of[-Lc/2+4,Lc/2-4]){const qi=new THREE.Quaternion().setFromAxisAngle(_X,Math.atan(k));
   kput('funBoxS',[0,dk(zb)+1.35,zb],qi,[3.4,.6,4]);
   for(const dz of[-1.3,1.3])for(const sd of[-1,1])kput('funHub',[sd*GAUGE/2,dk(zb+dz)+.98,zb+dz],null,[.35,.55,.55]);}
  for(let j=0;j<n;j++){const zc=-Lc/2+lc*(j+.5), zu=zc-lc/2, yfl=dk(zu)+1.9;
   kput('funBoxS',[0,yfl-.15,zc],null,[w,.3,lc],T_DARK);
   kput('funWedgeS',[0,yfl-.3,zc],null,[w-.5,k*lc,lc],pick(T_STEEL,hh(1,j)));
   if(hh(2,j)>.18)kput('funBoxV',[0,yfl+hc+.18,zc],null,[w+.3,.36,lc+.25]);
   for(const sd of[-1,1]){const x=sd*(w/2-.1);
    if(hh(3,j*2+(sd>0))>.1)kput(hh(4,j*2+(sd>0))<.5?'funBoxW':'funBoxS',[x,yfl+.6,zc],null,[.2,1.2,lc-.1],hh(4,j*2+(sd>0))<.5?pick(T_WHITE,hh(5,j)):pick(T_STEEL,hh(5,j)));
    for(const zz of[zu+.13,zc,zu+lc-.13])if(hh(6,(zz*7|0)+(sd>0))>.12)kput('funBoxS',[x,yfl+1.2+(hc-1.2)/2,zz],null,[.22,hc-1.2,.26]);
    if(hh(7,j*2+(sd>0))>.2)kput('funBoxW',[x,yfl+hc-.25,zc],null,[.2,.5,lc],pick(T_WHITE,hh(8,j)));}
   // the downhill end of each compartment: a solid partition (the cab face for the last)
   const ze=zu+lc;
   if(j<n-1)kput(hh(9,j)<.5?'funBoxW':'funBoxS',[0,yfl+hc/2,ze],null,[w,hc,.2],pick(T_WHITE,hh(10,j)));
   else{kput('funBoxW',[0,yfl+.6,ze],null,[w,1.2,.2],pick(T_WHITE,hh(11,j)));kput('funBoxW',[0,yfl+hc-.3,ze],null,[w,.6,.2],pick(T_WHITE,hh(12,j)));
    for(const x of[-w/2+.15,-w/6,w/6,w/2-.15])kput('funBoxS',[x,yfl+1.2+(hc-1.8)/2,ze],null,[.24,hc-1.8,.24]);}
   if(j===0){kput('funBoxW',[0,yfl+.6,zu],null,[w,1.2,.2],pick(T_WHITE,hh(13,j)));kput('funBoxW',[0,yfl+hc-.3,zu],null,[w,.6,.2]);
    for(const x of[-w/2+.15,0,w/2-.15])kput('funBoxS',[x,yfl+1.2+(hc-1.8)/2,zu],null,[.24,hc-1.8,.24]);}
   for(const zz of[zc-lc*.22,zc+lc*.22])if(hh(14,(zz*5|0))>.3)kput('funBoxD',[0,yfl+.25,zz],null,[w-1.2,.5,.6]);}}

 // ---------------------------------------------------------------- draw
 function draw(rec,parent){const grp=new THREE.Group();grp.name='funicular';if(parent)parent.add(grp);
  const K0=KOFF, X0=KXF;KOFF=[0,0,0];KXF=null;
  try{drawTrack(rec);drawPiers(rec);drawStations(rec);drawCar(rec);drawStairs(rec,grp);registerAll(rec);}
  finally{KXF=X0;KOFF=K0;}
  return grp;}

 function drawTrack(rec){const W=rec.W, cs=Math.sqrt(1+rec.grade*rec.grade), q0=qY(rec.ry), sd0=rec.seed*31;
  for(const sg of rec.segments){
   if(sg.state==='gap')continue;
   const via=sg.kind==='viaduct';
   if(sg.state==='collapsed'){sg.pieces.forEach((pc,k)=>{pushXF(pc.a,segQ(pc.a,pc.b,pc.roll,rec.n));
     spanLocal(dist(pc.a,pc.b),{W,via,dmg:.55,e0:true,e1:true,l0:sg.s0*cs,h:sd0+sg.i*16+k+1,noCable:true});endGroupXF();});continue;}
   pushXF(sg.a,segQ(sg.a,sg.b,sg.roll||0,rec.n));
   spanLocal(dist(sg.a,sg.b),{W,via,dmg:sg.state==='hanging'?.4:.12,e0:sg.edge0,e1:sg.edge1,l0:sg.s0*cs,h:sd0+sg.i*16});
   endGroupXF();}
  for(const b of rec.beds){const c=pick(T_CONC,fH(sd0,b.x*7|0,b.z*7|0));
   if(b.y1>b.y0+.05)kput('funBoxC',[b.x,(b.y0+b.y1)/2,b.z],q0,[b.w,b.y1-b.y0,b.len],c);
   if(b.wedge>.02)kput('funWedge',[b.x,b.y1,b.z],qY(b.ry).multiply(new THREE.Quaternion().setFromAxisAngle(_X,Math.PI)),[b.w,b.wedge,b.len],c);}
  for(const w of rec.walls){const c=pick(T_CONC,fH(sd0,w.x*3|0,w.z*3|0));kput('funBoxC',[w.x,(w.y0+w.y1)/2,w.z],qY(w.ry),[w.t,w.y1-w.y0,w.len],c);
   if(w.wedge>.05)kput('funWedge',[w.x,w.y1,w.z],qY(w.ry).multiply(new THREE.Quaternion().setFromAxisAngle(_X,Math.PI)),[w.t,w.wedge,w.len],c);}
  for(const d of rec.debris){
   if(d.k==='rubble')kput('funRubble',[d.x,d.y,d.z],new THREE.Quaternion().setFromEuler(new THREE.Euler(d.rx,d.ry,d.rz)),d.s,pick(T_CONC,fH(d.x*10|0,d.z*10|0,3)));
   else bar('funBoxS',d.a,d.b,d.w,d.w*1.3,pick(T_STEEL,fH(d.a[0]|0,d.a[2]|0,5)));}
  for(const pts of rec.cables)for(let i=0;i+1<pts.length;i++)bar('funBoxS',pts[i],pts[i+1],.14,.14,T_CABLE);}

 function drawPiers(rec){const W=rec.W;
  for(const p of rec.piers){const q=qY(p.ry), c=pick(T_CONC,fH(rec.seed,p.i,7)), stand=p.state==='standing';
   const top=stand?p.top-2.2:p.y1;
   for(const g of p.legs){kput('funBoxC',[g[0],g[2]+.75,g[1]],q,[3.8,1.5,4.6],c);
    const h=top-(g[2]+1.5);if(h>.2){const gw=2.3+h*.02;kput('funLeg',[g[0],g[2]+1.5+h/2,g[1]],q,[gw,h,gw+.6],c);}
    if(!stand&&h>.2){kput('funRubble',[g[0],top,g[1]],qY(fH(p.i,g[0]|0,1)*6),1.3,c);
     for(let k=0;k<4;k++){const ox=(fH(p.i,k,2)-.5)*1.6, oz=(fH(p.i,k,3)-.5)*2;
      bar('funBoxS',[g[0]+ox,top-.3,g[1]+oz],[g[0]+ox*1.6,top+1+fH(p.i,k,4)*2.2,g[1]+oz*1.4],.07,.07,T_RAIL);}}}
   if(stand)kput('funBoxC',[p.x,p.top-1.1,p.z],q,[p.w,2.2,p.d],c);
   const yb=Math.max(p.legs[0][2],p.legs[1][2])+1.5;
   for(let y=yb+16;y<top-5;y+=16)kput('funBoxC',[p.x,y,p.z],q,[W-3.2-1.6,1.2,1.6],c);}}

 function drawStations(rec){for(const S of rec.stations){pushXF([S.x,S.y,S.z],qY(S.ry));
   try{if(S.kind==='upper')upperLocal(S,rec.seed);else lowerLocal(S,rec.seed);}finally{endGroupXF();}}}

 function upperLocal(S,sd){const w=S.w, d=S.d, h=S.h, hh=(i,j)=>fH(sd*7+1,i,j), cb=pick(T_CONC,hh(0,0));
  kput('funBoxC',[0,-.6,-d/2],null,[w,1.2,d],cb);
  for(const c of S.cells)kput('funBoxC',[c.x,(c.y0-1.2)/2,c.z],null,[c.w,-1.2-c.y0,c.d],cb);
  S.bays.forEach((b,i)=>{const c=pick(T_CONC,hh(1,i)), A=b.ax, sz=(t,hy,l)=>A?[l,hy,t]:[t,hy,l];
   const at=(o,y)=>A?[b.x+o,y,b.z]:[b.x,y,b.z+o];
   if(b.y0>0){kput('funBoxC',at(0,(b.y0+b.h)/2),null,sz(1.6,b.h-b.y0,b.len),c);return;}
   if(!b.win){kput('funBoxC',at(0,b.h/2),null,sz(1.6,b.h,b.len),c);
    if(b.h<h-.1)kput('funRubble',at(0,b.h),qY(hh(2,i)*6),1.4,c);return;}
   kput('funBoxC',at(-b.len/2,b.h/2),null,sz(2.1,b.h,1.3),c);
   kput('funBoxC',at(0,Math.min(b.h,4)/2),null,sz(1.6,Math.min(b.h,4),b.len),c);
   if(b.h>16.5){kput('funBoxC',at(0,(16+b.h)/2),null,sz(1.6,b.h-16,b.len),c);
    kput('funBoxS',at(0,10),null,sz(.3,12,.3));if(hh(3,i)>.3)kput('funBoxS',at(0,10),null,sz(.25,.25,b.len));}
   else{kput('funRubble',at(-b.len/2,b.h),qY(hh(4,i)*6),1.2,c);
    for(let k=0;k<4;k++){const o=(hh(5,i*4+k)-.5)*b.len, sgn=A?(b.z<-d/2?1:-1):(b.x<0?1:-1), inw=1.5+hh(6,i*4+k)*4;
     kput('funRubble',A?[b.x+o,.45,b.z+sgn*inw]:[b.x+sgn*inw,.45,b.z+o],qY(hh(7,i*4+k)*6),.7+hh(8,i*4+k)*1.4,c);}}});
  for(const sx of[-1,1])kput('funBoxC',[sx*(w/2-.8),h/2,-.8],null,[2.1,h,2.1],cb);
  for(const b of S.beams){if(b.up){kput('funBoxC',[0,h-.9,b.z],null,[w-.4,1.8,1],cb);continue;}
   if(b.t<.5)bar('funBoxC',[-w/2+2,h-5-b.t*6,b.z],[w/2-4,.9,b.z+2+b.t*3],1,1.8,cb);}
  let dropped=false;
  for(const s of S.slabs){if(s.up){kput('funBoxC',[0,h+.25,(s.z0+s.z1)/2],null,[w,.5,s.z1-s.z0-.1],cb);continue;}
   if(!dropped&&s.z0>-d+6){dropped=true;bar('funBoxC',[-w/4,.4,s.z0+1],[-w/4+3,8,s.z1-1],w*.42,.5,cb);}}
  // the machinery: two giant sheave wheels in floor slots, the winding engine at the back
  const qS=_G.quaternion.clone(), pS=_G.position.clone();
  for(const wh of S.wheels){for(const sx of[-1,1])kput('funBoxC',[sx*2.9,wh.y/2,wh.z],null,[1.5,wh.y,3.6],cb);
   kput('funBoxD',[0,.03,wh.z],null,[2.4,.06,2*wh.r+.6]);
   endGroupXF();const lp=new THREE.Vector3(0,wh.y,wh.z).applyQuaternion(qS).add(pS);
   pushXF([lp.x,lp.y,lp.z],qS.clone().multiply(new THREE.Quaternion().setFromAxisAngle(_Z,wh.lean)));
   kput('funRim',[0,0,0],null,wh.r);kput('funRim',[0,0,0],null,wh.r*.93);
   for(let k=0;k<10;k++){const a=k/10*Math.PI*2;bar('funBoxS',[0,Math.cos(a)*1.1,Math.sin(a)*1.1],[0,Math.cos(a)*wh.r*.95,Math.sin(a)*wh.r*.95],.35,.55);}
   kput('funHubV',[0,0,0],null,[1.9,1.6,1.6]);kput('funHub',[0,0,0],null,[6.6,.5,.5]);
   endGroupXF();_G.position.copy(pS);_G.quaternion.copy(qS);useGroupXF(_G);}
  kput('funBoxS',[0,3.4,-42.8],null,[15,6.8,2.8],pick(T_STEEL,hh(9,0)));
  for(const sx of[-1,1])kput('funHub',[sx*5.4,1.7,-40],null,[5.6,1.6,1.6],pick(T_STEEL,hh(10,sx)));
  kput('funHubV',[0,2.6,-39.8],null,[8,2.2,2.2]);kput('funRim',[8.6,3.6,-40],null,2.6);
  const wt=S.wheels[0].y+S.wheels[0].r;
  bar('funBoxS',[0,.35,0],[0,wt,S.wheels[0].z],.14,.14,T_CABLE);bar('funBoxS',[0,wt,S.wheels[0].z],[0,wt,S.wheels[1].z],.14,.14,T_CABLE);
  bar('funBoxS',[0,wt,S.wheels[1].z],[0,4.8,-39.8],.14,.14,T_CABLE);
  for(const sx of[-1,1])kput('funBoxC',[sx*.75,.22,-6],null,[.3,.45,12],cb);
  // the control gallery along the back wall (half of it down), the gantry crane's runway and its fallen girder
  kput('funBoxC',[-S.corner*(w/4-1),8,-d+3.6],null,[w/2-2,.5,4],cb);
  bar('funBoxC',[S.corner*2,8,-d+3.6],[S.corner*(w/2-3),1,-d+5.2],4,.5,cb);
  for(const b of S.bays)if(b.ax===0&&b.h>=h-.1)kput('funBoxS',[Math.sign(b.x)*(w/2-2.1),h-4,b.z],null,[.7,.9,b.len],pick(T_STEEL,hh(11,b.z|0)));
  bar('funBoxS',[-w/2+2.4,h-4,-22],[w/2-6,.9,-18],1.3,1.6,pick(T_STEEL,hh(12,0)));}

 function lowerLocal(S,sd){const hh=(i,j)=>fH(sd*7+2,i,j), cb=pick(T_CONC,hh(0,0)), H=S.h, W2=S.w/2-.4;
  S.steps.forEach((s,j)=>{for(const[k,sx]of[[0,-1],[1,1]]){const b=s.bot[k];
    if(s.top>b+.05)kput('funBoxC',[sx*11,(s.top+b)/2,(s.z0+s.z1)/2],null,[8.8,s.top-b,s.z1-s.z0],pick(T_CONC,hh(1,j*2+k)));
    kput('funBoxW',[sx*6.85,s.top+.03,(s.z0+s.z1)/2],null,[.35,.06,s.z1-s.z0-.05],pick(T_WHITE,hh(2,j)));}});
  for(const c of S.conc)if(c.top>c.y0+.05)kput('funBoxC',[c.x,(c.top+c.y0)/2,c.z],null,[c.w,c.top-c.y0,c.d],cb);
  for(const x of[-TRK,TRK]){kput('funBoxS',[x,.9,-.6],null,[3.4,1.4,1],pick(T_STEEL,hh(3,x|0)));
   for(const sx of[-1,1])kput('funBoxV',[x+sx*1,1.1,-1.25],null,[.6,.6,.4]);}
  const F=S.frames;
  F.forEach((f,j)=>{const top=f.base+H;
   for(const[up,sx]of[[f.colL,-1],[f.colR,1]]){
    if(up)kput('funBoxC',[sx*W2,f.base+H/2,f.z],null,[1,H,1],cb);
    else{bar('funBoxC',[sx*W2,f.base+.55,f.z],[sx*(W2-9.5),f.base+.55+(hh(4,j)-.5)*1.2,f.z+(hh(5,j)-.5)*6],1,1,cb);
     kput('funRubble',[sx*W2,f.base+.4,f.z],qY(hh(6,j)*6),1.1,cb);}}
   if(f.beam==='up')kput('funBoxS',[0,top+.6,f.z],null,[S.w,1.2,.8],pick(T_STEEL,hh(7,j)));
   else if(f.beam==='hang'){const sx=f.colL?-1:1;bar('funBoxS',[sx*W2,top+.4,f.z],[-sx*(W2-5),f.base+.7,f.z+1.5],.8,1.2,pick(T_STEEL,hh(8,j)));}});
  for(let j=0;j+1<F.length;j++){const p=S.purl[j], f0=F[j], f1=F[j+1];if(!p.up)continue;
   for(const x of[-12,-6,0,6,12])bar('funBoxS',[x,f0.base+H+1.35,f0.z],[x,f1.base+H+1.35,f1.z],.3,.4,pick(T_STEEL,hh(9,j)));
   if(p.plate>.55){const x=(Math.floor(p.plate*1000)%4-1.5)*6, v=p.plate>.85;
    bar(v?'funBoxV':'funBoxS',[x,f0.base+H+1.6,f0.z+.3],[x,f1.base+H+1.6,f1.z-.3],5.6,.12,v?null:pick(T_STEEL,hh(10,j)));}}
  const zb=S.dc+1.6, top=1.1;
  for(const sx of[-1,1]){const hgt=sx<0?S.wallL:9;kput('funBoxC',[sx*10.5,top+hgt/2,zb],null,[11,hgt,1.2],cb);
   if(hgt<9)for(let k=0;k<5;k++)kput('funRubble',[sx*(6+hh(11,k)*9),top+.5,zb-1.5-hh(12,k)*4],qY(hh(13,k)*6),.8+hh(14,k)*1.2,cb);}
  if(S.wallL>=9)kput('funBoxC',[0,top+7.75,zb],null,[10,2.5,1.2],cb);
  for(const sx of[-1,1])for(let j=0;j+1<S.steps.length;j++)kput('funBoxC',[sx*(S.w/2-.4),S.steps[j].top+.6,(S.steps[j].z0+S.steps[j].z1)/2],null,[.8,1.2,S.steps[j].z1-S.steps[j].z0],cb);}

 function drawCar(rec){const c=rec.car;if(!c)return;
  const Q=new THREE.Quaternion().setFromEuler(new THREE.Euler(c.pitch||0,c.ry,c.roll||0,'YXZ'));
  pushXF([c.x,c.y,c.z],Q);try{carLocal(c,rec.seed*13+5);}finally{endGroupXF();}}

 // the walkway stairs at both deck edges of every intact strip: one merged mesh, treads level
 function drawStairs(rec,grp){const P=[],N=[],U=[], ux=rec.u[0], uz=rec.u[1], nx=rec.n[0], nz=rec.n[1], gr=rec.grade, W=rec.W, tr=.5;
  const X=(s,l)=>rec.a[0]+ux*s+nx*l, Z=(s,l)=>rec.a[2]+uz*s+nz*l, Y=s=>rec.a[1]+gr*s;
  const v3=(s,l,y)=>[X(s,l),y,Z(s,l)];
  const tri=(a,b,c,nn,uv)=>{const e1=[b[0]-a[0],b[1]-a[1],b[2]-a[2]], e2=[c[0]-a[0],c[1]-a[1],c[2]-a[2]];
   const cx=e1[1]*e2[2]-e1[2]*e2[1], cy=e1[2]*e2[0]-e1[0]*e2[2], cz=e1[0]*e2[1]-e1[1]*e2[0];
   if(cx*nn[0]+cy*nn[1]+cz*nn[2]<0){const t=b;b=c;c=t;const tu=uv[1];uv=[uv[0],uv[2],tu];}
   P.push(...a,...b,...c);N.push(...nn,...nn,...nn);U.push(...uv[0],...uv[1],...uv[2]);};
  for(const w of rec.walk){if(w.kind!=='track')continue;
   for(const sd of[-1,1]){const l0=sd*(W/2-1.15), l1=sd*(W/2-.3), ni=[-sd*nx,0,-sd*nz], m=Math.floor((w.s1-w.s0)/tr);
    for(let k=0;k<m;k++){const s0=w.s0+k*tr, s1=s0+tr, yt=Y(s0), yl=Y(s1), us=s0/8, ue=s1/8;
     const a=v3(s0,l0,yt), b=v3(s1,l0,yt), c=v3(s1,l1,yt), d=v3(s0,l1,yt);
     tri(a,b,c,[0,1,0],[[us,0],[ue,0],[ue,.1]]);tri(a,c,d,[0,1,0],[[us,0],[ue,.1],[us,.1]]);
     const e=v3(s1,l0,yl), f=v3(s1,l1,yl);
     tri(b,e,f,[ux,0,uz],[[0,yt/8],[0,yl/8],[.1,yl/8]]);tri(b,f,c,[ux,0,uz],[[0,yt/8],[.1,yl/8],[.1,yt/8]]);
     tri(a,b,e,ni,[[us,yt/8],[ue,yt/8],[ue,yl/8]]);}}}
  if(!P.length)return;
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));
  g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));
  mesh(g,FM.stair,grp);}

 function registerAll(rec){if(typeof REGISTER!=='function')return;
  const segs=rec.segments, ux=rec.u[0], uz=rec.u[1], cs=Math.sqrt(1+rec.grade*rec.grade);
  const vol=(name,s0,s1,y0,y1)=>{const sm=(s0+s1)/2;REGISTER({name,x:rec.a[0]+ux*sm,z:rec.a[2]+uz*sm,r:(s1-s0)/2+rec.W/2+6,y:y0,h:y1-y0});};
  const deckAt=s=>rec.a[1]+rec.grade*s;
  const brk=new Set();for(const[i0,i1]of rec.breaks)for(let j=i0-1;j<=i1+1;j++)brk.add(j);
  let g=[];const flush=()=>{if(!g.length)return;const s0=g[0].s0, s1=g[g.length-1].s1;
   const y0=Math.min(...g.map(x=>x.gmin))-2, y1=Math.max(deckAt(s0),deckAt(s1))+3;
   vol(g.some(x=>x.kind==='viaduct')?'Ancient funicular — viaduct':'Ancient funicular — track on grade',s0,s1,y0,y1);g=[];};
  for(const sg of segs){if(brk.has(sg.i)){flush();continue;}g.push(sg);if(g.length>=4)flush();}
  flush();
  for(const[i0,i1]of rec.breaks){const a=Math.max(0,i0-1), b=Math.min(segs.length-1,i1+1);
   const y0=Math.min(...segs.slice(a,b+1).map(x=>x.gmin))-2;
   vol('Ancient funicular — broken spans',segs[a].s0,segs[b].s1,y0,deckAt(segs[a].s0)+3);}
  for(const S of rec.stations){const zm=(S.s0+S.s1)/2;
   REGISTER({name:S.kind==='upper'?'Ancient funicular — the winding house (ruin)':'Ancient funicular — the platform hall (ruin)',
    x:rec.a[0]+ux*zm,z:rec.a[2]+uz*zm,r:Math.max(S.w,S.d)/2+2,y:S.y-4,h:S.h+(S.kind==='upper'?6:S.lp*-rec.grade+8)});}
  if(rec.car)REGISTER({name:'Ancient funicular — the derelict car',x:rec.car.x,z:rec.car.z,r:rec.car.len/2+2,y:rec.car.y-rec.car.len*rec.car.k/2-3,h:rec.car.len*rec.car.k+rec.car.hc+8});}

 return{plan,draw,deckY,carveY,DEPTH:DEP,SLAB};
})();
