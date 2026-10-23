// ================================================================ DAM BASINS — the stranded wrecks (PLAN.md, D1)
// The small craft of the drained lakes, left where the water left them: trawlers, coasters, barges and tugs, whole,
// snapped in two, broken up, or half sunk into the silt (after the Aral Sea's ship cemeteries: the owner's references,
// 2026-10-23). The port kit's vessels are its great ships (140 to 370 m) and stand at the docks; these are the lake's
// working boats, 18 to 82 m, out on the bed.
//   DBW.records(o)   the wrecks as RECORDS, before anything is drawn: cell-seeded on core/rand (a cell's wrecks are a hash
//                    of the world seed, the cell and an index; never of how many draws came before), placed by what the
//                    water left (o.accept: how welcome a wreck is at a point, from the bed's bands and strandlines)
//   DBW.draw(T, rec, o)  one wreck as a THREE.Group of merged meshes (o: ground(x,z), materials {hull, deck, house, dark})
// Engine-neutral but for draw (it takes THREE as T): no port-kit helper, no DOM. The page binds it (91a-db-wrecks.js).
const DBW=(function(){
 const R=KRAND,u=(h,k)=>R.unit(R.hash(h,k)),lerpN=(a,b,t)=>a+(b-a)*t,cl=(v,a,b)=>v<a?a:v>b?b:v;
 // the kinds: length, beam, depth (m), the wheelhouse's place along the hull (from the stern), the bow's fine run and sheer
 const KINDS={
  trawler:{L:[24,42],B:[6.5,9],H:[4,5.5],house:.62,houseL:.16,bow:.3,sheer:.16,mast:1,funnel:0,w:4,dead:.5,rake:.5,fcs:.3},
  coaster:{L:[48,82],B:[9,13],H:[6,8],house:.12,houseL:.14,bow:.2,sheer:.08,mast:2,funnel:1,w:3,dead:.15,rake:.35,fcs:.18},
  barge:{L:[30,60],B:[8,12],H:[3,4],house:-1,houseL:0,bow:.06,sheer:0,mast:0,funnel:0,w:2,dead:0,rake:.8,fcs:0},
  tug:{L:[18,28],B:[6,8],H:[3.5,4.5],house:.48,houseL:.24,bow:.34,sheer:.22,mast:1,funnel:1,w:1,dead:.6,rake:.4,fcs:.25}};
 const STATES=[['whole',.34],['snapped',.24],['pieces',.18],['buried',.24]];
 const pickW=(list,t)=>{let s=0;for(const e of list)s+=e[1];let a=t*s;for(const e of list){if(a<e[1])return e[0];a-=e[1];}return list[list.length-1][0];};
 // RECORDS. o: {x0,z0,x1,z1, cell (m), seed, ground(x,z), accept(x,z,h) -> 0..1, avoid(x,z) -> true to skip}
 function records(o){const out=[],c=o.cell||240,kw=Object.keys(KINDS).map(k=>[k,KINDS[k].w]);
  for(let j=Math.floor(o.z0/c);j<=Math.floor(o.z1/c);j++)for(let i=Math.floor(o.x0/c);i<=Math.floor(o.x1/c);i++){
   for(let n=0;n<2;n++){const h=R.hash(o.seed||1,i,j,n);
    const x=(i+u(h,1))*c,z=(j+u(h,2))*c;if(x<o.x0||x>o.x1||z<o.z0||z>o.z1||(o.avoid&&o.avoid(x,z)))continue;
    const g=o.ground(x,z),a=o.accept(x,z,g);if(!(u(h,3)<a))continue;
    const kind=pickW(kw,u(h,4)),K=KINDS[kind],state=pickW(STATES,u(h,5));
    out.push({id:'wreck:'+i+':'+j+':'+n,kind,state,x,z,h:g,heading:u(h,6)*Math.PI*2,
     L:lerpN(K.L[0],K.L[1],u(h,7)),B:lerpN(K.B[0],K.B[1],u(h,8)),H:lerpN(K.H[0],K.H[1],u(h,9)),
     // how deep in the silt (a fraction of its depth), its list, the snap's place and how far the halves lie apart
     bury:state==='buried'?lerpN(.5,.78,u(h,10)):state==='pieces'?lerpN(.3,.55,u(h,10)):lerpN(.04,.24,u(h,10)),
     list:(state==='buried'?lerpN(.15,.42,u(h,11)):lerpN(.04,.22,u(h,11)))*(u(h,12)<.5?-1:1),
     snap:lerpN(.38,.62,u(h,13)),gap:lerpN(3,18,u(h,14)),turn:(u(h,15)-.5)*.9,
     rot:lerpN(.05,.2,u(h,16)),seed:h});}}
  return out;}
 // ---- the hull: stations from the stern (t 0) to the bow (t 1); each a half-section, mirrored
 function hullOf(K,L,B,H){const half=B/2,sec=t=>{   // [[x,y]...] for one side, keel to deck edge, at station t
   const run=t>1-K.bow?Math.pow((t-(1-K.bow))/K.bow,1.5):0,tr=t<.06?.86+.14*t/.06:1,w=half*tr*(1-run*.97);
   const keel=H*.42*Math.pow(cl((t-(1-K.bow*.7))/(K.bow*.7),0,1),1.6),deck=H*(1+K.sheer*(Math.pow(2*t-1,2)-.35)+K.fcs*cl((t-.72)/.08,0,1));   // fcs: the forecastle's step up
   // the half-section: a flat bottom turning through the bilge's quarter round into the side, a little tumblehome at the
   // deck edge (eight points: enough to read as a hull close to)
   // the bottom rises from the keel to the bilge (deadrise: a V for the trawlers and tugs, near flat for a barge)
   const D=deck-keel,r=Math.min(w*.45,D*.35),dr=D*.22*K.dead,P=[[0,keel],[w-r,keel+D*.01+dr]];
   for(let k=1;k<=4;k++){const a=k/5*Math.PI/2;P.push([w-r+Math.sin(a)*r,keel+D*.01+dr+r-Math.cos(a)*r]);}
   P.push([w,keel+D*.6],[w*.985,deck]);return P;};
  return {sec,L,B,H};}
 // a buffer of one material's triangles, with uv in metres (the rust tiles at 4 m) and a colour per vertex
 function Buf(){const P=[],U=[],C=[];return{P,U,C,tri(a,b,c,ua,ub,uc,k){P.push(...a,...b,...c);U.push(...ua,...ub,...uc);C.push(k[0],k[1],k[2],k[0],k[1],k[2],k[0],k[1],k[2]);},
  quad(a,b,c,d,ua,ub,uc,ud,k){this.tri(a,b,c,ua,ub,uc,k);this.tri(a,c,d,ua,uc,ud,k);}};}
 function box(Bf,cx,cy,cz,sx,sy,sz,k,skipTop){const x0=cx-sx/2,x1=cx+sx/2,y0=cy,y1=cy+sy,z0=cz-sz/2,z1=cz+sz/2,q=(a,b,c,d,w,h)=>Bf.quad(a,b,c,d,[0,0],[w/4,0],[w/4,h/4],[0,h/4],k);
  q([x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],sx,sy);q([x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0],sx,sy);
  q([x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],sz,sy);q([x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],sz,sy);
  if(!skipTop)q([x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0],sx,sz);}
 // one piece of hull from station t0 to t1 (a whole hull is 0..1), in the wreck's frame: x across, y up from the keel, z
 // along (stern at -L/2); its plating holed by rust above the silt, frames showing through, its deck rotted through
 function piece(HB,K,rec,t0,t1,bufs,hh){const {sec,L,H}=HB,N=Math.max(8,Math.round((t1-t0)*L/1.4)),rust=rec.rot,shade=.75+.25*u(hh,40);
  const kc=(t,s)=>{const v=shade*(.82+.3*u(R.hash(hh,Math.round(t*97),s),41));return[v*1.0,v*.86,v*.78];};
  // the ends: the stem rakes forward and the stern overhangs, both with height (zOf: a point's z at station t, height y)
  const rk=K.rake*H,zOf=(t,y)=>(t-.5)*L+(t>1-K.bow?rk*(y/H)*Math.pow((t-(1-K.bow))/K.bow,2):0)-(t<.1?rk*.6*(y/H)*Math.pow(1-t/.1,2):0);
  const S=[];for(let i=0;i<=N;i++){const t=t0+(t1-t0)*i/N;S.push({t,z:(t-.5)*L,p:sec(t)});}
  const bury=rec.bury*H,M=S[0].p.length;
  for(let i=0;i<N;i++){const A=S[i],B2=S[i+1];
   for(const side of [1,-1])for(let k=0;k<M-1;k++){const a=[A.p[k][0]*side,A.p[k][1],zOf(A.t,A.p[k][1])],b=[B2.p[k][0]*side,B2.p[k][1],zOf(B2.t,B2.p[k][1])],
     c=[B2.p[k+1][0]*side,B2.p[k+1][1],zOf(B2.t,B2.p[k+1][1])],d=[A.p[k+1][0]*side,A.p[k+1][1],zOf(A.t,A.p[k+1][1])];
    // rust holes only in the upper plating, and not many: a plate here and there
    const hole=k>=5&&a[1]>bury&&u(R.hash(hh,i,k,side),42)<rust*.55;
    if(hole){if(i%2===0)box(bufs.house,a[0]*.97,a[1],a[2],.18,d[1]-a[1],.18,[.42,.33,.28]);continue;}   // a frame where the plate is gone
    const g=A.p[k][1]+(A.p[k+1][1]-A.p[k][1])*.5,v0=(k)/(M-1)*H/4,v1=(k+1)/(M-1)*H/4,u0=A.z/4,u1=B2.z/4;
    if(side>0)bufs.hull.quad(a,b,c,d,[u0,v0],[u1,v0],[u1,v1],[u0,v1],kc(A.t,k));else bufs.hull.quad(a,d,c,b,[u0,v0],[u0,v1],[u1,v1],[u1,v0],kc(A.t,k));
    void g;}
   // the deck between the deck edges, rotted through in places
   if(u(R.hash(hh,i,77),43)>rust*1.4){const ea=A.p[M-1],eb=B2.p[M-1];
    bufs.deck.quad([-ea[0],ea[1],zOf(A.t,ea[1])],[-eb[0],eb[1],zOf(B2.t,eb[1])],[eb[0],eb[1],zOf(B2.t,eb[1])],[ea[0],ea[1],zOf(A.t,ea[1])],[A.z/4,0],[B2.z/4,0],[B2.z/4,ea[0]/2],[A.z/4,ea[0]/2],[.55,.48,.42]);}}
  // the open ends of a break: a ragged ring of plate (the section's outline, torn)
  return S;}
 // the wheelhouse, a funnel and a mast on the whole hull or the piece that holds them
 function works(K,rec,HB,t0,t1,bufs,hh){const {sec,L,H}=HB;if(K.house<0)return;const tm=K.house+K.houseL/2;if(tm<t0||tm>t1)return;
  const sx=sec(tm),z=(tm-.5)*L,w=sx[sx.length-1][0]*1.4,dy=sx[sx.length-1][1],hl=K.houseL*L,hh2=Math.max(2.4,H*.75)+u(hh,50)*1.2;
  const roofless=u(hh,51)<rec.rot*1.6;
  box(bufs.house,0,dy,z,w,hh2,hl,[.62,.5,.42],roofless);
  // its windows: a dark band, some panes gone
  box(bufs.dark,0,dy+hh2*.58,z+hl/2+.02,w*.86,hh2*.26,.06,[1,1,1]);
  if(K.house>.4)box(bufs.house,0,dy+hh2,z-hl*.15,w*.6,hh2*.5,hl*.45,[.58,.46,.38],u(hh,52)<.5);   // the trawler's upper bridge
  if(K.funnel)box(bufs.house,0,dy+hh2,z-hl*.6,w*.3,H*.5,w*.28,[.38,.3,.26]);
  for(let m=0;m<K.mast;m++){const mz=m?(.85-.5)*L:z+hl*.3,fallen=u(hh,53+m)<.45,mh=H*1.6+u(hh,55+m)*3;
   if(!fallen)box(bufs.house,0,dy,mz,.3,mh,.3,[.4,.32,.27]);
   else box(bufs.house,(u(hh,57+m)-.5)*w,dy+.2,mz+mh*.4,.3,.3,mh,[.4,.32,.27]);}}
 // the scattered debris of a broken-up wreck: torn plates and loose frames, half in the silt
 // (in the wreck's place, unturned: each plate on the ground where it lies, a little sunk)
function debris(rec,bufs,hh,n,g){for(let k=0;k<n;k++){const a=u(hh,70+k)*Math.PI*2,d=rec.L*(.3+u(hh,90+k)*.6),x=Math.cos(a)*d,z=Math.sin(a)*d;
  box(u(hh,110+k)<.6?bufs.hull:bufs.house,x,g(rec.x+x,rec.z+z)-.3,z,1+u(hh,130+k)*4,.15+u(hh,150+k)*1.2,1+u(hh,170+k)*5,[.6,.48,.4]);}}
 const WHO={whole:'whole',snapped:'snapped in two',pieces:'broken up',buried:'half buried'};
 // DRAW one record: its pieces, each posed on the ground (its own pitch and list, sunk by the record's burial)
 function draw(T,rec,o){const K=KINDS[rec.kind],HB=hullOf(K,rec.L,rec.B,rec.H),G=new T.Group(),hh=rec.seed;
  const parts=rec.state==='snapped'?[[0,rec.snap,0],[rec.snap,1,1]]:rec.state==='pieces'?[[0,.3,0],[.62,1,1]]:[[0,1,0]];
  parts.forEach((P,pi)=>{const bufs={hull:Buf(),deck:Buf(),house:Buf(),dark:Buf()};piece(HB,K,rec,P[0],P[1],bufs,R.hash(hh,pi));works(K,rec,HB,P[0],P[1],bufs,R.hash(hh,pi,9));
   // where this piece lies: a snapped half pulled apart along the hull and turned; a broken-up wreck's pieces scattered
   const mid=(P[0]+P[1])/2-.5,sep=rec.state==='snapped'?(pi?1:-1)*rec.gap/2:rec.state==='pieces'?(pi?1:-1)*rec.L*.35:0;
   const yaw=rec.heading+(rec.state==='whole'||rec.state==='buried'?0:(pi?1:-1)*rec.turn*.5),fx=Math.sin(yaw),fz=Math.cos(yaw);
   const along=mid*rec.L+sep,cx=rec.x+Math.sin(rec.heading)*along,cz=rec.z+Math.cos(rec.heading)*along;
   const len=(P[1]-P[0])*rec.L,g=o.ground,yb=g(cx+fx*len*.4,cz+fz*len*.4),ya=g(cx-fx*len*.4,cz-fz*len*.4),ym=g(cx,cz);
   const pitch=Math.atan2(yb-ya,len*.8)+(rec.state==='snapped'?(pi?-.08:.08):0),list=rec.list*(pi?-1:1)*(rec.state==='snapped'?1.2:1);
   const grp=new T.Group();
   for(const k of ['hull','deck','house','dark']){const b=bufs[k];if(!b.P.length)continue;const geo=new T.BufferGeometry();
    geo.setAttribute('position',new T.Float32BufferAttribute(b.P,3));geo.setAttribute('uv',new T.Float32BufferAttribute(b.U,2));
    geo.setAttribute('color',new T.Float32BufferAttribute(b.C,3));geo.translate(0,0,-mid*rec.L);geo.computeVertexNormals();
    const m=new T.Mesh(geo,o.materials[k]);m.userData.inspectLabel=rec.kind+', '+WHO[rec.state];m.userData.dbWreck=rec.id;grp.add(m);}
   grp.position.set(cx,Math.min(ym,(ya+yb)/2)-rec.bury*rec.H,cz);grp.rotation.set(-pitch,yaw,list,'YXZ');G.add(grp);});
  if(rec.state==='pieces'){const bufs={hull:Buf(),house:Buf()};debris(rec,bufs,hh,8+Math.floor(u(hh,60)*8),o.ground);const grp=new T.Group();
   for(const k of ['hull','house']){const b=bufs[k];if(!b.P.length)continue;const geo=new T.BufferGeometry();
    geo.setAttribute('position',new T.Float32BufferAttribute(b.P,3));geo.setAttribute('uv',new T.Float32BufferAttribute(b.U,2));
    geo.setAttribute('color',new T.Float32BufferAttribute(b.C,3));geo.computeVertexNormals();
    const m=new T.Mesh(geo,o.materials[k]);m.userData.inspectLabel=rec.kind+', its torn plates';m.userData.dbWreck=rec.id;grp.add(m);}
   grp.position.set(rec.x,0,rec.z);G.add(grp);}
  return G;}
 return {KINDS,STATES,records,draw};})();
