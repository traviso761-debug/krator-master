// ================================================================= THE FLASHING EYE — the Stair of the Eye drawn: the mule road from the Foot House to the band's foot
// PLAN.md sections 2.6 and 3.4: about 13 km of switchbacks down the spur, the Rest House at about 1,080 m. The route is the
// layout's (src/30-fe-layout.js, the way 'stair'; FE_STAIR_PTS in the page's frame, 89zfe), on its own ground (FE_STAIRG, 10 m
// cells; FE_REST round the Rest House, 4 m; 90fe). [draw]: three.js.
//   the line      the route's corners rounded into hairpins of the layout's stairHairpin m, its centre line every 2 m
//   the deck      laid on the ground as drawn (the highest of terrainH and KDRAWN across its width), 0.15 m over it, eased along
//                 it but never under it; cobbled (the pack's qCobble in metres)
//   the edges     a dry-stone revetment from the deck's edges down into the ground on both sides, a kerb of stones along the
//                 downhill edge where the ground falls away more than 0.8 m
// core/tags first (a record a leg), then the meshes, then core/walk (a strip every 4 m). FE_STAIR keeps the line for verify.py.
reseed(34503);
const FE_STAIR=(function(){const W=FE.L.stairW==null?3.5:FE.L.stairW,RH=FE.L.stairHairpin==null?7:FE.L.stairHairpin,C=FE_STAIR_PTS,STEP=2;
 const G=(x,z)=>{const d=typeof KDRAWN!=='undefined'?KDRAWN.h(x,z):null,t=terrainH(x,z);return d==null?t:Math.max(d,t);};
 /* the centre line: each corner rounded by an arc of radius RH, cut back along both legs (at most 0.45 of either) */
 const line=[],push=p=>{const q=line[line.length-1];if(!q||Math.hypot(p[0]-q[0],p[1]-q[1])>.05)line.push(p);};
 push(C[0]);let pins=0;
 for(let i=1;i+1<C.length;i++){const a=C[i-1],b=C[i],c=C[i+1],l1=Math.hypot(b[0]-a[0],b[1]-a[1]),l2=Math.hypot(c[0]-b[0],c[1]-b[1]);
  const d1=[(b[0]-a[0])/l1,(b[1]-a[1])/l1],d2=[(c[0]-b[0])/l2,(c[1]-b[1])/l2],th=Math.acos(Math.max(-1,Math.min(1,d1[0]*d2[0]+d1[1]*d2[1])));
  if(th<.02){push(b);continue;}
  const t=Math.min(RH*Math.tan(th/2),.45*l1,.45*l2),r=t/Math.tan(th/2),p1=[b[0]-d1[0]*t,b[1]-d1[1]*t],p2=[b[0]+d2[0]*t,b[1]+d2[1]*t];
  const cr=d1[0]*d2[1]-d1[1]*d2[0],nr=cr>0?[-d1[1],d1[0]]:[d1[1],-d1[0]],o=[p1[0]+nr[0]*r,p1[1]+nr[1]*r];
  const a0=Math.atan2(p1[1]-o[1],p1[0]-o[0]),a1=Math.atan2(p2[1]-o[1],p2[0]-o[0]);let da=a1-a0;while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;
  const n=Math.max(2,Math.ceil(Math.abs(da)*r/1.5));for(let k=0;k<=n;k++){const aa=a0+da*k/n;push([o[0]+Math.cos(aa)*r,o[1]+Math.sin(aa)*r]);}if(th>1.2)pins++;}
 push(C[C.length-1]);
 /* every STEP m along it: the point, its tangent and the deck's height (the highest drawn ground across the deck, 0.15 m over) */
 const cum=[0];for(let i=1;i<line.length;i++)cum.push(cum[i-1]+Math.hypot(line[i][0]-line[i-1][0],line[i][1]-line[i-1][1]));
 const L=cum[cum.length-1],S=[];let j=0;
 for(let s=0;s<=L+1e-6;s+=Math.min(STEP,Math.max(1e-3,L-s>STEP*.5?STEP:L-s))){while(j+2<line.length&&cum[j+1]<s)j++;const a=line[j],b=line[j+1],seg=cum[j+1]-cum[j],u=seg>0?(s-cum[j])/seg:0;
  const x=a[0]+(b[0]-a[0])*u,z=a[1]+(b[1]-a[1])*u,tx=(b[0]-a[0])/(seg||1),tz=(b[1]-a[1])/(seg||1),nx=-tz,nz=tx;
  let raw=-1e9;for(const o of[-W/2-.25,-W/4,0,W/4,W/2+.25])raw=Math.max(raw,G(x+nx*o,z+nz*o));
  const gl=G(x+nx*(W/2+2.5),z+nz*(W/2+2.5)),gr=G(x-nx*(W/2+2.5),z-nz*(W/2+2.5));
  S.push({x,z,s,tx,tz,nx,nz,raw:raw+.15,gl,gr});if(s>=L-1e-6)break;}
 /* the deck: the least height over the raw deck whose grade nowhere passes GMAX (forward and back), so where the ground is steeper
    (a hairpin's apex runs down the fall line) the road is built up on its revetments rather than climbing it */
 const GMAX=FE.L.stair&&FE.L.stair.maxDeck!=null?FE.L.stair.maxDeck:.1;
 for(let i=0;i<S.length;i++)S[i].y=i?Math.max(S[i].raw,S[i-1].y-GMAX*(S[i].s-S[i-1].s)):S[i].raw;
 for(let i=S.length-2;i>=0;i--)S[i].y=Math.max(S[i].y,S[i+1].y-GMAX*(S[i+1].s-S[i].s));
 /* each sample's leg (the route's segment nearest it), so the deck is drawn a mesh a leg (the probe samples a mesh by its box) */
 const sd=(p,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],l=dx*dx+dz*dz,t=l?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/l)):0;return Math.hypot(a[0]+dx*t-p[0],a[1]+dz*t-p[1]);};
 for(const p of S){let best=0,bd=1e9;for(let k=0;k+1<C.length;k++){const d=sd([p.x,p.z],C[k],C[k+1]);if(d<bd){bd=d;best=k;}}p.leg=best;}
 /* the links: from the nearest point of the deck to each house's gate (the Rest House's yard, the Foot House's court), a ramp 3 m
    wide every metre, from the deck's height to the gate's threshold (its pad and plinth), never under the ground */
 const links=[];
 for(const [id,gz,plinth] of[['resthouse',10.4,.5],['foothouse',null,.5]]){const p=FE_PLACE.find(q=>q.id===id);if(!p)continue;
  const g=loc(p.x,p.z,0,gz==null?p.d/2+.3:gz,p.ry||0),gy=p.o.y+plinth;let bi=0,bd=1e9;
  S.forEach((q,i)=>{const d=Math.hypot(q.x-g[0],q.z-g[1]);if(d<bd){bd=d;bi=i;}});
  const a=S[bi],ln=Math.hypot(g[0]-a.x,g[1]-a.z),tx=(g[0]-a.x)/ln,tz=(g[1]-a.z)/ln,n=Math.max(2,Math.ceil(ln)),L2=[];
  for(let k=0;k<=n;k++){const t=k/n,x=a.x+(g[0]-a.x)*t,z=a.z+(g[1]-a.z)*t;let raw=-1e9;for(const o of[-1.6,0,1.6])raw=Math.max(raw,G(x-tz*o,z+tx*o));
   L2.push({x,z,s:t*ln,tx,tz,nx:-tz,nz:tx,y:Math.max(raw+.12,a.y+(gy-a.y)*t),gl:G(x-tz*4,z+tx*4),gr:G(x+tz*4,z-tx*4)});}
  links.push({id,S:L2,W:3,from:bi,gate:[g[0],gy,g[1]],len:ln});}
 return{W,L,line,S,pins,G,corners:C,links};})();
// ---------------------------------------------------------------- core/tags first: a record a leg (between the route's corners)
{const C=FE_STAIR.corners;for(let i=0;i+1<C.length;i++){const a=C[i],b=C[i+1],ya=terrainH(a[0],a[1]),yb=terrainH(b[0],b[1]),len=Math.hypot(b[0]-a[0],b[1]-a[1]);
  REG.push({name:'The Stair of the Eye: leg '+(i+1)+' of '+(C.length-1),x:(a[0]+b[0])/2,y:Math.min(ya,yb)-1,z:(a[1]+b[1])/2,r:len/2+FE_STAIR.W,h:Math.abs(yb-ya)+3,cls:'infrastructure',key:'fe_stair',
   tags:QTAG('civic',['infrastructure'],{note:'the mule road from the Foot House to the band\'s foot: cobbles on a dry-stone revetment, '+len.toFixed(0)+' m'})});}}
// ---------------------------------------------------------------- the deck, the revetments, the kerb
const FE_STAIR_G=new THREE.Group();FE_STAIR_G.name='the Stair of the Eye';scene.add(FE_STAIR_G);
{const G=FE_STAIR.G;
 const sc=k=>{const P=KMAT.packed&&KMAT.packed('qiblai',k);return P&&P.scale?P.scale[0]:3;},tex=k=>{const t=MAT[k]&&MAT[k].map;if(t){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.needsUpdate=true;}return t||null;};
 /* a triangle wound so its face looks along `want` (up for the deck, outward for a revetment) */
 const mk=()=>({pos:[],uv:[],idx:[]}),vtx=(M,x,y,z,u,v)=>{M.pos.push(x,y,z);M.uv.push(u,v);return M.pos.length/3-1;};
 const tri=(M,a,b,c,want)=>{const P=M.pos,ax=P[a*3],ay=P[a*3+1],az=P[a*3+2],ux=P[b*3]-ax,uy=P[b*3+1]-ay,uz=P[b*3+2]-az,vx=P[c*3]-ax,vy=P[c*3+1]-ay,vz=P[c*3+2]-az;
  const n=[uy*vz-uz*vy,uz*vx-ux*vz,ux*vy-uy*vx];if(n[0]*want[0]+n[1]*want[1]+n[2]*want[2]<0)M.idx.push(a,c,b);else M.idx.push(a,b,c);};
 const decks=[],rev=mk(),kc=sc('qCobble'),kf=sc('qFlag');
 /* each strand (the road, then the links to the gates, each in the leg of the deck it leaves): the deck a mesh a leg (its quads in
    the leg of their first sample), the revetments one mesh */
 for(const K of[{S:FE_STAIR.S,W:FE_STAIR.W}].concat(FE_STAIR.links)){const S=K.S,W=K.W,E=[],DV=[];
  for(const p of S){const e=[];for(const sd of[1,-1]){const ex=p.x+p.nx*sd*W/2,ez=p.z+p.nz*sd*W/2,fx=p.x+p.nx*sd*(W/2+.35),fz=p.z+p.nz*sd*(W/2+.35),fy=G(fx,fz)-.5;
    e.push({sd,ex,ez,rt:vtx(rev,ex,p.y,ez,p.s/kf,p.y/kf),rb:vtx(rev,fx,fy,fz,p.s/kf,fy/kf)});}E.push(e);DV.push({});}
  const top=(i,k,leg)=>{const M=decks[leg]||(decks[leg]=mk()),c=DV[i];const key=leg+':'+k;if(c[key]==null){const e=E[i][k];c[key]=vtx(M,e.ex,S[i].y,e.ez,e.sd*W/2/kc,S[i].s/kc);}return c[key];};
  for(let i=0;i+1<S.length;i++){const A=E[i],B=E[i+1],leg=K.from==null?S[i].leg:FE_STAIR.S[K.from].leg,M=decks[leg]||(decks[leg]=mk());
   const a0=top(i,0,leg),a1=top(i,1,leg),b0=top(i+1,0,leg),b1=top(i+1,1,leg);tri(M,a0,b0,a1,[0,1,0]);tri(M,b0,b1,a1,[0,1,0]);
   for(const k of[0,1]){const o=[S[i].nx*A[k].sd,0,S[i].nz*A[k].sd];tri(rev,A[k].rt,B[k].rt,A[k].rb,o);tri(rev,B[k].rt,B[k].rb,A[k].rb,o);}}}
 const S=FE_STAIR.S,W=FE_STAIR.W;
 const geo=M=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(M.pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(M.uv,2));g.setIndex(M.idx);g.computeVertexNormals();return g;};
 const dmat=new THREE.MeshStandardMaterial({map:tex('qCobble'),color:0xc4bcb0,roughness:.95,metalness:0});let ntri=0;
 decks.forEach((M,leg)=>{if(!M||!M.idx.length)return;const dm=new THREE.Mesh(geo(M),dmat);ntri+=M.idx.length/3;
  dm.name='the Stair of the Eye: its cobbled deck (leg '+(leg+1)+')';dm.receiveShadow=true;dm.userData.inspectLabel='The Stair of the Eye: the mule road (cobbles), leg '+(leg+1);FE_STAIR_G.add(dm);});
 const deck={idx:{length:ntri*3}};
 const rm=new THREE.Mesh(geo(rev),new THREE.MeshStandardMaterial({map:tex('qFlag'),color:0x8a8178,roughness:.97,metalness:0}));
 rm.name='the Stair of the Eye: its revetments';rm.castShadow=rm.receiveShadow=true;rm.userData.inspectLabel='The Stair of the Eye: a dry-stone revetment';FE_STAIR_G.add(rm);
 /* the kerb: a stone every 1.6 m on the downhill edge where the ground 2.5 m out lies more than 0.8 m under the deck */
 const ks=[];for(let i=0;i<S.length;i++){const p=S[i];for(const [sd,g] of[[1,p.gl],[-1,p.gr]]){if(p.y-g<=.8||g>(sd>0?p.gr:p.gl))continue;
   for(const off of[0,.8]){const j2=KRAND.unit(KRAND.hash(34504,i,off*10|0));const x=p.x+p.nx*sd*(W/2-.22)+p.tx*off,z=p.z+p.nz*sd*(W/2-.22)+p.tz*off;ks.push([x,p.y,z,Math.atan2(p.tx,p.tz)+(j2-.5)*.3,.75+.4*j2]);}}}
 if(ks.length){const im=new THREE.InstancedMesh(new THREE.BoxGeometry(.42,.38,.62),new THREE.MeshStandardMaterial({map:tex('qFlag'),color:0x5e5850,roughness:.95}),ks.length),M=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler();
  ks.forEach((k,i)=>{e.set(0,k[3],0);q.setFromEuler(e);M.compose(new THREE.Vector3(k[0],k[1]+.17*k[4],k[2]),q,new THREE.Vector3(1,k[4],1));im.setMatrixAt(i,M);});
  im.name='the Stair of the Eye: its kerb';im.castShadow=true;FE_STAIR_G.add(im);}
 FE_STAIR.kerb=ks.length;FE_STAIR.tris=(deck.idx.length+rev.idx.length)/3;}
/* the deck and its revetments stay for the probe (the legs' registered volumes hold them); the kerb's stones are too small to matter */
FE_STAIR_G.traverse(o=>{if(o.isInstancedMesh)o.userData.probeSkip=true;});
// ---------------------------------------------------------------- core/walk: the deck as strips a walker follows, every 4 m
FE_STAIR.walk=0;
if(typeof KWALK!=='undefined'){const S=FE_STAIR.S;let prev=null;
 for(let i=0;i<S.length;i+=2){const p=S[Math.min(i,S.length-1)],q=[p.x,p.z,p.y];if(prev){KWALK.strip({a:prev,b:q,w:FE_STAIR.W-.1,name:'the Stair of the Eye',tag:'flashing-eye:stair'});FE_STAIR.walk++;}prev=q;}
 const e=S[S.length-1];if(prev&&(prev[0]!==e.x||prev[1]!==e.z)){KWALK.strip({a:prev,b:[e.x,e.z,e.y],w:FE_STAIR.W-.1,name:'the Stair of the Eye',tag:'flashing-eye:stair'});FE_STAIR.walk++;}
 /* each link a strip a metre, on into the gateway 1.5 m past its threshold */
 for(const K of FE_STAIR.links){for(let i=1;i<K.S.length;i++){const a=K.S[i-1],b=K.S[i];KWALK.strip({a:[a.x,a.z,a.y],b:[b.x,b.z,b.y],w:K.W-.1,name:'the way to the gate of '+K.id,tag:'flashing-eye:stair'});FE_STAIR.walk++;}
  const b=K.S[K.S.length-1];KWALK.strip({a:[b.x,b.z,b.y],b:[b.x+b.tx*1.5,b.z+b.tz*1.5,K.gate[1]],w:2.4,name:'the gate of '+K.id,tag:'flashing-eye:stair'});FE_STAIR.walk++;}}
window._feStair={km:+(FE_STAIR.L/1000).toFixed(2),corners:FE_STAIR.corners.length,hairpins:FE_STAIR.pins,samples:FE_STAIR.S.length,kerb:FE_STAIR.kerb,tris:FE_STAIR.tris,walk:FE_STAIR.walk};
