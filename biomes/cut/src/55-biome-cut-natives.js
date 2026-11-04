// ================================================================= THE CUT — the natives: records, then their drawing
// [draw] CUT.plan(o) decides where every native stands and returns RECORDS (plain data, seeded by KRAND per cell and
// index, so a tile planned alone is the same as in a full plan); CUT.draw(P) draws them. The host says where each may grow:
//   o.R, o.spine ([[x,z]...] the stations' detail spine), o.ground(x,z) (page y), o.toBowl(x,z), o.alt(y) (metres above the
//   sea), o.zone(x,z) -> {grove, reed, rank, melon} weights 0..1, o.clear(x,z,r) (the host's obstacles and water), o.q
// Records: P.groves [{id, x, z, r, L, culms:[{x,y,z,d,n,h,bite,echo,m}], ...}], P.reeds, P.rank, P.melons, P.lichen.
// The warp's rules (41-cut-field.js) are applied here at placement: every culm, tussock and spray leans and stretches along
// the field (CUT.warp m), sizes snap to the three steps and lengths to fixed steps where s > .3, a grove's internodes are one
// length and its culms' bases are sunk so every node stands on the same levels, bites and echoes as the warp draws them.
(function(){const TAU=Math.PI*2;
 const U=(a,b,c,salt)=>KRAND.unit(KRAND.hash(CUT.SEED,a|0,b|0,c|0,salt|0));
 const mix=(a,b,t)=>a+(b-a)*t;
 // a matrix put straight into an item's store (the warp's stretch is not a rotation and a scale)
 const M4=(L,p,R)=>{/* p + L R: L the warp (3x3 row-major), R the plant's own 3x3 (rotation x scale), column-major out */
  const A=[];for(let i=0;i<3;i++)for(let j=0;j<3;j++){let v=0;for(let k=0;k<3;k++)v+=L[i*3+k]*R[k*3+j];A.push(v);}
  return[A[0],A[3],A[6],0,A[1],A[4],A[7],0,A[2],A[5],A[8],0,p[0],p[1],p[2],1];};
 const RS=(yaw,sx,sy,sz)=>{const c=Math.cos(yaw),s=Math.sin(yaw);return[c*sx,0,s*sz, 0,sy,0, -s*sx,0,c*sz];};
 CUT.putM=function(name,m,col){BIO.put(name,[m[12],m[13],m[14]],null,1,col);const it=BIO.items[name];const a=it.m.a,o=(it.count-1)*16;for(let q=0;q<16;q++)a[o+q]=m[q];};
 CUT.M4=M4;CUT.RS=RS;

 // ---------------------------------------------------------------- the plan
 CUT.plan=function(o){const q=o.q==null?1:o.q,R=o.R,P={groves:[],reeds:[],rank:[],melons:[],lichen:[],shoots:[]};
  // THE GROVES: one candidate a 180 m cell, kept where the grove zone is strong; 50-200 culms in clumps
  if(o.groves!==false){const cell=180;for(let j=-Math.ceil(R/cell);j<=Math.ceil(R/cell);j++)for(let i=-Math.ceil(R/cell);i<=Math.ceil(R/cell);i++){
    const x=(i+U(i,j,1,11))*cell,z=(j+U(i,j,2,11))*cell;if(Math.hypot(x,z)>R-60)continue;const zn=o.zone(x,z);if(U(i,j,3,11)>zn.grove*.85)continue;
    const b=o.toBowl(x,z),F=CUT.field(b[0],b[1]),r=mix(22,42,U(i,j,4,11)),id=(i+512)*1024+(j+512);
    const L=CUT.quant(mix(2.4,3.2,U(i,j,5,11)),.25,F.s),y0=o.ground(x,z),G={id,x,z,r,L,s:F.s,culms:[],name:'A hyperbamboo grove ('+Math.round(r*2)+' m across; its internodes '+L.toFixed(2)+' m)'};
    const nClump=Math.round(mix(10,26,U(i,j,6,11))*q*(r/32));
    for(let c=0;c<nClump;c++){const a=U(id,c,1,12)*TAU,d=Math.sqrt(U(id,c,2,12))*r,cx=x+Math.cos(a)*d,cz=z+Math.sin(a)*d;
     if(!o.clear(cx,cz,2)||o.zone(cx,cz).grove<.15)continue;const k=1-d/r,nCulm=3+Math.floor(U(id,c,3,12)*5);
     for(let u=0;u<nCulm;u++){const px=cx+(u?(U(id,c*16+u,1,13)-.5)*3:0),pz=cz+(u?(U(id,c*16+u,2,13)-.5)*3:0),gy=o.ground(px,pz);
      const nI=k>.55?28:k>.25?24:20,W=CUT.warp(...o.toBowl(px,pz),{id:id*64+c*8+u,salt:41,size:mix(.75,1.25,U(id,c*16+u,3,13))});
      const dia=CUT.quant(mix(.6,1,U(id,c*16+u,4,13))*(W.step==null?1:W.step),.1,F.s);
      /* sink the base so the nodes stand on the grove's levels: y0 + k L */
      const base=gy-(((gy-y0)%L)+L)%L-.05;
      const old=U(id,c*16+u,6,13)<.2;let bite=-1;if(W.bite&&old){   /* the bite takes the old culms: they open to their chambers */bite=CUT.BITTEN.findIndex(B=>B.n===nI);if(bite<0)bite=Math.floor(U(id,c*16+u,5,13)*CUT.BITTEN.length);}
      const n=bite>=0?CUT.BITTEN[bite].n:nI;
      G.culms.push({x:px,y:base,z:pz,d:dia,n,h:n*L,bite,echo:W.echo,m:W.m,ranked:W.ranked,old,yaw:U(id,c*16+u,7,13)*TAU});}
     if(U(id,c,4,12)<.6)P.shoots.push({x:cx+1.2,z:cz-.8,y:o.ground(cx+1.2,cz-.8),h:CUT.quant(mix(1,3,U(id,c,5,12)),.5,F.s),m:CUT.warp(...o.toBowl(cx,cz),{id:c,salt:43,bites:false}).m});}
    if(G.culms.length>=40)P.groves.push(G);}}
  // THE RING REEDS: the water's edge in bands one height each (bands of the ground's height over the water: rings round the lake)
  if(o.reeds!==false){const cell=2.6;for(const s of o.spine){const RR=o.reedR==null?700:o.reedR;for(let j=-Math.ceil(RR/cell);j<=Math.ceil(RR/cell);j++)for(let i=-Math.ceil(RR/cell);i<=Math.ceil(RR/cell);i++){
    const gi=Math.round(s[0]/cell)+i,gj=Math.round(s[1]/cell)+j,x=(gi+U(gi,gj,1,21)*.8)*cell,z=(gj+U(gi,gj,2,21)*.8)*cell;
    if(Math.hypot(x-s[0],z-s[1])>RR)continue;const zn=o.zone(x,z);if(zn.reed<=0||U(gi,gj,3,21)>zn.reed*q)continue;
    let dup=false;for(const t of o.spine){if(t===s)break;if(Math.hypot(x-t[0],z-t[1])<RR){dup=true;break;}}if(dup)continue;
    const y=o.ground(x,z),band=Math.floor((y+.4)/.35);if(band&1)continue;   /* every other band: rings with open water between */
    const b=o.toBowl(x,z),W=CUT.warp(b[0],b[1],{id:gi*7+gj,salt:51,bites:false}),h=mix(2.4,4.2,KRAND.unit(KRAND.hash(CUT.SEED,band,77)))*(W.step==null?1:1);
    P.reeds.push({x,y,z,h:CUT.quant(h,.3,W.s),w:mix(1,1.6,U(gi,gj,4,21)),v:Math.floor(U(gi,gj,5,21)*3),m:W.m,yaw:U(gi,gj,6,21)*TAU});}}}
  // THE RANKGRASS: rows along the field's axis 5 m apart, a tussock every 2 m along them: a lattice turned to the axis of each
  // 25 m tile and anchored on the bowl's origin, so a row runs on unbroken while the axis holds and turns where the rings change
  if(o.rank!==false){const tile=25,gap=4.5,step=1.7,RR=o.rankR==null?650:o.rankR,seen=new Set();
   for(const s of o.spine)for(let tj=-Math.ceil(RR/tile);tj<=Math.ceil(RR/tile);tj++)for(let ti=-Math.ceil(RR/tile);ti<=Math.ceil(RR/tile);ti++){
    const X0=(Math.floor(s[0]/tile)+ti)*tile,Z0=(Math.floor(s[1]/tile)+tj)*tile,key=X0+','+Z0;if(seen.has(key))continue;
    const cx=X0+tile/2,cz=Z0+tile/2;if(Math.hypot(cx-s[0],cz-s[1])>RR)continue;seen.add(key);if(o.zone(cx,cz).rank<=0)continue;
    const b=o.toBowl(cx,cz),F=CUT.field(b[0],b[1]),ax=F.axis[0],az=F.axis[1],nx=-az,nz=ax;
    /* the tile's corners in the turned frame (bowl coordinates): along t = p.a, across c = p.n */
    const cs=[[X0,Z0],[X0+tile,Z0],[X0,Z0+tile],[X0+tile,Z0+tile]].map(p=>{const B=o.toBowl(p[0],p[1]);return[B[0]*ax+B[1]*az,B[0]*nx+B[1]*nz];});
    const t0=Math.min(...cs.map(c=>c[0])),t1=Math.max(...cs.map(c=>c[0])),c0=Math.min(...cs.map(c=>c[1])),c1=Math.max(...cs.map(c=>c[1]));
    const dx=b[0]-cx,dz=b[1]-cz;   /* bowl minus page */
    for(let k=Math.ceil(c0/gap);k*gap<=c1;k++)for(let m=Math.ceil(t0/step);m*step<=t1;m++){
     const t=m*step+(U(k,m,1,61)-.5)*.4,c=k*gap+(U(k,m,2,61)-.5)*.16,bx=ax*t+nx*c,bz=az*t+nz*c,x=bx-dx,z=bz-dz;
     if(x<X0||x>=X0+tile||z<Z0||z>=Z0+tile)continue;const zn=o.zone(x,z);if(zn.rank<.08||U(k,m,3,61)>(.25+.75*zn.rank)*q)continue;   /* the rows run full where the salt is: a gap is the exception */if(!o.clear(x,z,.4))continue;
     const W=CUT.warp(bx,bz,{id:k*4099+m,salt:63,size:mix(.7,1.4,U(k,m,4,61)),bites:false});
     P.rank.push({x,y:o.ground(x,z),z,h:mix(.6,1.1,U(k,m,5,61))*(W.step==null?1:W.step),v:Math.floor(U(k,m,6,61)*3),m:W.m,yaw:Math.atan2(az,ax)});}}}
  // THE MEASURE MELONS (station 2) and THE CIRCLE LICHEN (station 3) come from the stations' own planners (o.melons, o.lichen)
  if(o.melons)P.melons=o.melons(P);if(o.lichen)P.lichen=o.lichen(P);
  return P;};

 // ---------------------------------------------------------------- the drawing
 const col=(set,u)=>set[Math.floor(u*set.length)%set.length];
 CUT.draw=function(P,o){o=o||{};const st={culms:0,bitten:0,echoes:0,sprays:0,reeds:0,rank:0,shoots:0,melons:0,fruit:0,stuck:0,lichen:0};const PAL=CUT.PAL;
  const range=v=>{BIO.range=v==null?null:v;BIO.minRange=0;};
  // the groves
  for(const G of P.groves){BIO.owner=[G.x,G.z];
   if(typeof REGISTER==='function')REGISTER({name:G.name,kind:'flora',label:'Hyperbamboo',x:G.x,z:G.z,r:G.r+4,y:o.groundY?o.groundY(G.x,G.z):G.culms[0].y,h:G.L*28+10});
   const LD=CUT.CULM_LOD,tier=(r,m)=>{BIO.range=r;BIO.minRange=m;};
   for(const c of G.culms){const u=KRAND.unit(KRAND.hash(CUT.SEED,c.x*10|0,c.z*10|0,71)),cc=new BIO.host.THREE.Color(col(c.old?PAL.culmOld:PAL.culm,u));
    const m=M4(c.m,[c.x,c.y,c.z],RS(c.yaw,c.d,c.h,c.d));
    tier(LD.near,0);CUT.putM(c.bite>=0?'hculmb'+c.bite:'hculm'+c.n,m,cc);tier(LD.mid,LD.near);CUT.putM('hculmm'+c.n,m,cc);tier(1e9,LD.mid);CUT.putM('hculmf'+c.n,m,cc);
    st.culms++;if(c.bite>=0)st.bitten++;
    if(c.echo){tier(LD.mid,0);CUT.putM('hecho',M4(c.m,[c.x+c.echo.dx,c.y,c.z+c.echo.dz],RS(c.yaw,c.d,24*G.L,c.d)),null);st.echoes++;}
    /* the leaf: a spray at every node from 40% up, alternating sides: in straight ranks (180 degrees) where the warp is strong, else a
       spiral; the mid tier every second node, larger, the far tier every fourth, larger again (the same sides, so it does not jump) */
    const n0=Math.ceil(c.n*.42),stepA=c.ranked?Math.PI:2.4,size=CUT.quant(mix(3.2,4.4,u),.4,G.s);
    /* each spray tier switches with its culm's tier, at the same distances (the core's guard, one LOD key per tree: the near sprays ran 50 m past
       the near culm and the mid ones started 50 m late, so 43% of the sprays switched apart from their culms; the final rebuild, pair 10) */
    for(const [ev,k0,r0,r1] of [[1,1,0,LD.near],[2,1.3,LD.near,LD.mid],[4,1.65,LD.mid,1e9]]){tier(r1,r0);
     for(let k=n0;k<c.n;k+=ev){const lp=CUT.apply(c.m,[0,k*G.L,0]),a=c.yaw+k*stepA,sz=size*k0*(.75+.25*(k-n0)/(c.n-n0));
      CUT.putM('hleaf'+(k%3),M4(c.m,[c.x+lp[0],c.y+lp[1],c.z+lp[2]],RS(a,sz,sz*1.15,sz)),new BIO.host.THREE.Color(col(PAL.leaf,(u*7+k*.13)%1)));st.sprays++;}}}
   BIO.owner=null;}
  range(o.floorRange==null?900:o.floorRange);
  for(const s of P.shoots){CUT.putM('hshoot',M4(s.m,[s.x,s.y-.1,s.z],RS(0,.35*s.h/2,s.h,.35*s.h/2)),new BIO.host.THREE.Color(0x8a9a5a));st.shoots++;}
  for(const r of P.reeds){CUT.putM('reed'+r.v,M4(r.m,[r.x,r.y-.1,r.z],RS(r.yaw,r.w,r.h,r.w)),new BIO.host.THREE.Color(col(PAL.reed,(r.x*.37+r.z*.11)%1)));st.reeds++;}
  for(const t of P.rank){CUT.putM('rank'+t.v,M4(t.m,[t.x,t.y-.05,t.z],RS(t.yaw,t.h*1.3,t.h,t.h*1.3)),new BIO.host.THREE.Color(col(PAL.rank,Math.abs(t.x*.13+t.z*.07)%1)));st.rank++;
}
  if(CUT.drawMelons)Object.assign(st,CUT.drawMelons(P.melons,st));
  if(CUT.drawLichen)Object.assign(st,CUT.drawLichen(P.lichen,st));
  range(null);return st;};

 // ---------------------------------------------------------------- a reed bed outside the field (PLAN.md section 12, exchange 8)
 // CUT.planReedBed(o): the ring reed where a neighbour reads it in place (nhighlands' tarn and stream, Phragmites in the cold), with
 // the warp off (s is 0 there): an ordinary bed, its heights continuous, no bands, no stretch. o.box [x0,z0,x1,z1], o.cell (1.8 m),
 // o.wet(x,z) 0..1 (the shallows and the wet margin: the host's own water), o.ground(x,z), o.h [lo,hi] (1.6-2.8 m: shorter than in the
 // bowl's dense air), o.q (1) the density. Records as CUT.plan's P.reeds (m the identity), seeded per lattice cell.
 CUT.planReedBed=function(o){const out=[],cell=o.cell==null?1.8:o.cell,B=o.box,q=o.q==null?1:o.q,H=o.h||[1.6,2.8],I=[1,0,0,0,1,0,0,0,1];
  for(let j=Math.floor(B[1]/cell);j*cell<B[3];j++)for(let i=Math.floor(B[0]/cell);i*cell<B[2];i++){
   const x=(i+U(i,j,1,23)*.9)*cell,z=(j+U(i,j,2,23)*.9)*cell,w=o.wet(x,z);if(w<=0||U(i,j,3,23)>w*q)continue;
   /* a clone grows taller toward the water: the height follows the wetness, with a little of its own */
   out.push({x,y:o.ground(x,z),z,h:mix(H[0],H[1],.55*w+.45*U(i,j,4,23)),w:mix(.9,1.4,U(i,j,5,23)),v:Math.floor(U(i,j,6,23)*3),m:I,yaw:U(i,j,7,23)*TAU});}
  return out;};
 // CUT.drawReeds(L, o): any reed records (CUT.plan's or planReedBed's) under o.range (900 m)
 CUT.drawReeds=function(L,o){o=o||{};BIO.range=o.range==null?900:o.range;BIO.minRange=0;let n=0;
  for(const r of L||[]){CUT.putM('reed'+r.v,M4(r.m,[r.x,r.y-.1,r.z],RS(r.yaw,r.w,r.h,r.w)),new BIO.host.THREE.Color(col(CUT.PAL.reed,(r.x*.37+r.z*.11)%1)));n++;}
  BIO.range=null;return{reeds:n};};
 // the check: an ordinary bed has no bands (the heights spread over the range, at least 20 distinct to the centimetre; the bowl's
 // reeds take a few values on a 0.3 m step)
 CUT.checkReedBed=function(L){const hs=new Set((L||[]).map(r=>Math.round(r.h*100)));return{ok:(L||[]).length>50&&hs.size>=Math.min(20,(L||[]).length*.25),detail:(L||[]).length+' reeds, '+hs.size+' distinct heights (cm)'};};
})();
