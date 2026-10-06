// prefix: bl
// ================================================================= THE BAELU: the fire redoubt
// A round fortress of fitted polygonal stone (the Sacsayhuaman manner: huge pillowed blocks below, smaller above, every
// joint fitted to its neighbours) on a red rock outcrop of the western drylands, about the diameter of a Dalab mound
// (outer wall r 30). Like a Fujian tulou it is a ring of rooms round a court: three storeys of cells behind stone
// galleries (stables and stores on the ground floor), a flat stone roof walk behind a parapet. Nothing in it burns but
// the doors. The court holds a cistern well (the water lies below the surface), outbuildings and raised stone platforms
// where the bands pitch their tents when the fires come; the rest of the year it stands half empty.
// Frame: origin at the centre of the outcrop on the ground; the court is at BL.Yc; the gate faces +z down a ramp.
const BL={R:30,Hw:13,Yc:4.5,Rin:23.2,gal:1.4,lv:[0,4.3,8.6],roofY:12.9,batter:.055,gateHalf:[1.8,1.4],ramp:24};
/* ---------------------------------------------------------------- fitted polygonal masonry
   blMasonry(o): courses of irregular blocks on a wall surface given by o.at(u, v, depth) -> [x,y,z] (u along the wall in
   metres, v up from its foot, depth out of the face). o.L the wall's length in u (o.closed: it wraps), o.courses the
   course heights from the bottom, o.width(k) -> [min,max] block width in course k, o.force(k) -> joint u's that must exist
   (the gate's jambs), o.skip(k, u0, u1, v0, v1) -> true leaves a block out. Course boundaries are shared polylines with
   jittered knots at every joint of the courses on either side, so neighbouring blocks fit exactly and a block takes as
   many corners as there are joints along its edges. Each block is pillowed: its rim set back into a dark joint, its face
   bulging. Returns the block count. */
function blMasonry(o){const C=o.courses,K=C.length,L=o.L,lean=o.lean||.25;const vb=[0];for(const h of C)vb.push(vb[vb.length-1]+h);
 // the joints of each course (u at its bottom and top)
 const J=[];for(let k=0;k<K;k++){const wr=o.width(k),forced=(o.force&&o.force(k))||[];const js=[];let u=o.closed?(o.start!==undefined?o.start-.001:rr(0,wr[1])):0;
  if(!o.closed)js.push([0,0]);
  while(u<L-(o.closed?wr[0]*.6:wr[0]*.5)){const f=forced.find(q=>q[0]>u-.05&&q[0]<u+wr[1]);if(f){js.push([f[0],f[1]]);u=f[0]+wr[0];continue;}
   const ln=rr(-lean,lean);js.push([u,u+ln]);u+=rr(wr[0],wr[1]);}
  for(const f of forced)if(!js.some(q=>Math.abs(q[0]-f[0])<.01))js.push([f[0],f[1]]);
  js.sort((a,b)=>a[0]-b[0]);if(!o.closed)js.push([L,L]);J.push(js);}
 // the boundary polylines: knots at the top joints of the course below and the bottom joints of the course above
 const B=[];for(let b=0;b<=K;b++){const us=[];if(b>0)for(const j of J[b-1])us.push(j[1]);if(b<K)for(const j of J[b])us.push(j[0]);
  const amp=(b===0||b===K)?0:Math.min(.5,C[Math.min(K-1,b)]*.21);const kn=[...new Set(us.map(u=>Math.round(u*1000)/1000))].sort((a,c)=>a-c).map(u=>[u,vb[b]+(o.flat&&o.flat(b,u)?0:rr(-amp,amp))]);B.push(kn);}
 const by=(b,u)=>{const kn=B[b];if(!kn.length)return vb[b];if(o.closed){u=((u%L)+L)%L;}
  for(let i=0;i<kn.length-1;i++)if(u>=kn[i][0]&&u<=kn[i+1][0]){const t=(u-kn[i][0])/((kn[i+1][0]-kn[i][0])||1);return lerp(kn[i][1],kn[i+1][1],t);}
  if(o.closed){const a=kn[kn.length-1],c=kn[0];const span=(c[0]+L)-a[0];const uu=u<c[0]?u+L:u;return lerp(a[1],c[1],(uu-a[0])/(span||1));}return u<kn[0][0]?kn[0][1]:kn[kn.length-1][1];};
 const knIn=(b,u0,u1)=>{const out=[];for(const q of B[b]){let u=q[0];if(o.closed&&u<u0)u+=L;if(u>u0+.02&&u<u1-.02)out.push(u);}return out.sort((a,c)=>a-c);};
 let n=0;const geoP=[],geoI=[];
 for(let k=0;k<K;k++){const js=J[k],nj=o.closed?js.length:js.length-1;
  for(let j=0;j<nj;j++){const a=js[j],c=o.closed?js[(j+1)%js.length]:js[j+1];let ab=a[0],at=a[1],cb=c[0],ct=c[1];if(o.closed&&cb<ab){cb+=L;ct+=L;}
   if(o.skip&&o.skip(k,Math.min(ab,at),Math.max(cb,ct),vb[k],vb[k+1]))continue;
   // the outline in (u,v): along the bottom (left to right), up the right joint, back along the top, down the left joint
   const poly=[[ab,by(k,ab)]];for(const u of knIn(k,ab,cb))poly.push([u,by(k,u)]);poly.push([cb,by(k,cb)]);
   poly.push([ct,by(k+1,ct)]);for(const u of knIn(k+1,at,ct).reverse())poly.push([u,by(k+1,u)]);poly.push([at,by(k+1,at)]);
   blBlock(o,poly,k);n++;}}
 return n;}
/* one pillowed block: rim at depth -0.1 (the joint), an inset ring at 0, the centre bulging out */
function blBlock(o,poly,k){let cu=0,cv=0;for(const q of poly){cu+=q[0];cv+=q[1];}cu/=poly.length;cv/=poly.length;
 const ext=Math.min(...poly.map(q=>Math.hypot(q[0]-cu,q[1]-cv)));const bev=Math.min(.2,ext*.38),bulge=Math.min(.16,.05+ext*.06);
 const pos=[],idx=[];const n=poly.length;
 for(const q of poly){const p=o.at(q[0],q[1],-.13);pos.push(p[0],p[1],p[2]);}
 for(const q of poly){const du=cu-q[0],dv=cv-q[1],L=Math.hypot(du,dv)||1;const p=o.at(q[0]+du/L*bev,q[1]+dv/L*bev,0);pos.push(p[0],p[1],p[2]);}
 {const p=o.at(cu,cv,bulge);pos.push(p[0],p[1],p[2]);}
 for(let i=0;i<n;i++){const a=i,b=(i+1)%n;idx.push(a,b,n+b,a,n+b,n+a);idx.push(n+a,n+b,2*n);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
 // make the faces look out of the wall: compare with the surface normal at the centre
 const c0=o.at(cu,cv,0),c1=o.at(cu,cv,1),N=g.attributes.normal;let dot=0;for(let i=0;i<N.count;i++)dot+=N.getX(i)*(c1[0]-c0[0])+N.getY(i)*(c1[1]-c0[1])+N.getZ(i)*(c1[2]-c0[2]);
 if(dot<0){for(let t=0;t<idx.length;t+=3){const s=idx[t+1];idx[t+1]=idx[t+2];idx[t+2]=s;}g.setIndex(idx);g.computeVertexNormals();}
 emit('stone',g,null,o.col?o.col(k):P('stone'));}
/* the outer wall's surface: u along the circumference from the gate (+z), v up from the court, a slight batter */
function blWallAt(u,v,dep){const a=PI/2+u/BL.R,r=BL.R-v*BL.batter+dep;return [Math.cos(a)*r,BL.Yc+v,Math.sin(a)*r];}
/* the outcrop's edge radius at angle a (irregular) */
function blRimR(a){return 35+2.4*Math.sin(a*3+.7)+1.6*Math.sin(a*7+2.1)+.8*Math.sin(a*13);}
function blBaseR(a){return blRimR(a)+7+2*Math.sin(a*5+1.3);}
defBuilding({key:'baelu',name:'Baelu',seed:5401,w:96,d:112,h:BL.Yc+BL.Hw+2.5,budget:520000,front:{x:0,z:BL.R+BL.ramp+1,yaw:0},
 tags:{types:['military','infrastructure','dwelling-multi'],wealth:null,style:'baelu',state:'intact'},
 note:'a fire redoubt of fitted stone on a rock outcrop: stables, stores, cells, a cistern and tent platforms round a court; half empty until fire season',
 build(o){const Yc=BL.Yc,R=BL.R,L=TAU*R,sc=new THREE.Color();
  // ---- the outcrop: a red rock mesa, its rim irregular, its flanks steep and broken
  psurf('rock',(u,v)=>{const a=u*TAU,r0=blRimR(a),r1=blBaseR(a),t=v;const r=lerp(r0,r1,Math.pow(t,.8))+fbm(a*3,t*4,1.7,2)*1.6;const y=Yc*(1-smooth(0,1,t))+(fbm(a*5,t*3,4.2,3)-.5)*1.4*Math.sin(PI*t);return [Math.cos(a)*r,Math.max(0,y),Math.sin(a)*r];},120,8,P('rock'));
  psurf('rock',(u,v)=>{const a=u*TAU,r=lerp(R-.5,blRimR(a),v);return [Math.cos(a)*r,Yc+(fbm(a*6,v*2,8.1,2)-.5)*.25*v,Math.sin(a)*r];},120,3,P('rock'));
  for(let i=0;i<28;i++){const a=rr(0,TAU);if(tkNearDoor(a,.32))continue;const r=rr(blBaseR(a)-2,blBaseR(a)+3);ellip('rock',Math.cos(a)*r,rr(.2,.6),Math.sin(a)*r,rr(.8,2.2),rr(.6,1.4),rr(.8,2),P('rock'),rr(0,TAU),9);}   // fallen boulders
  // ---- the court: paved, with a drain ring along the galleries
  cyl('paving',0,Yc-.3,0,BL.Rin-1.2,.32,P('paving'),64);lathe('stone',0,0,[[BL.Rin-1.2,Yc+.02],[BL.Rin,Yc+.02]],64,P('stoneD'));
  // ---- the outer wall: fitted blocks, the core behind them dark, the gate's jambs forced into the courses
  lathe('stone',0,0,[[R-.12,Yc],[R-.12-BL.Hw*BL.batter,Yc+BL.Hw]],96,P('stoneD'));
  const G0=BL.gateHalf[0],G1=BL.gateHalf[1],GH=5.2,courses=[2.8,2.4,1.9,1.6,1.45,1.35,1.2];
  const gateU=(v,s)=>s*lerp(G0,G1,clamp(v/GH,0,1));   // the trapezoid's jamb at height v
  // the gate is at u = 0 (and L): its right jamb at u = G0, its left at L - G0, both leaning in toward the lintel
  const fr=v=>(G0-G1)*v/GH;
  const nb=blMasonry({L,closed:true,start:G0,courses,lean:.55,at:blWallAt,
   width:k=>k<2?[2.2,4.2]:k<4?[1.5,3.0]:[1.1,2.2],
   force:k=>k===0?[[G0,G0-fr(2.8)],[L-G0,L-G0+fr(2.8)]]:k===1?[[G0-fr(2.8),G1],[L-G0+fr(2.8),L-G1]]:k===2?[[2.9,2.9],[L-2.9,L-2.9]]:[],
   flat:(b,u)=>{const d=Math.min(u,L-u);return (b===2&&d<3.3)||(b<2&&d<2.3);},
   skip:(k,u0,u1)=>{if(k>=2)return false;const c=(((u0+u1)/2)%L+L)%L;return c<G0||c>L-G0;}});
  // the gate passage through the wall and the ring: stone sides, a dark ceiling, the iron-bound doors folded back
  W(0,Yc,R,0,()=>{const D=R-BL.Rin+.6;for(const s of [-1,1])box('stone',s*(G0+.3),0,-D/2,.6,GH,D,P('stoneD'));
   box('stone',0,GH,-D/2,G0*2+1.2,.6,D,P('stoneD'));box('patStep',0,-.05,-D/2+.5,G0*2,.08,D+1,null);   // the gate passage paved in black and cream
   for(const s of [-1,1])W(s*(G0-.1),0,-1.2,s*1.35,()=>{box('wood',-s*.9,.05,0,1.8,4.9,.16,P('woodD'));for(const y of [.6,2.4,4.2])box('iron',-s*.9,y,.09,1.8,.12,.03,0x2e2a26);});});
  door(0,Yc,R,0,G0*2);
  // the slit windows of the upper cells: dark trapezoids in the face, a stone hood over each
  for(let i=0;i<36;i++){const a=PI/2+(i+.5)/36*TAU;if(tkNearDoor(a,.12))continue;for(const lv of [1,2]){const v=BL.lv[lv]+1.6,r=R-v*BL.batter+.14;
   W(Math.cos(a)*r,Yc+v,Math.sin(a)*r,-a+PI/2,()=>{poly('plain',[[-.22,0,0],[.22,0,0],[.15,1.1,0],[-.15,1.1,0]],0x14100c);box('stone',0,1.12,.02,.75,.18,.22,P('stone'));});}}
  // ---- the parapet and its merlons, the roof walk, the drains
  lathe('stone',0,0,[[R-BL.Hw*BL.batter+.05,Yc+BL.Hw],[R-BL.Hw*BL.batter+.05,Yc+BL.Hw+.6]],96,P('stone'));
  for(let i=0;i<64;i++){const a=(i+.5)/64*TAU,r=R-BL.Hw*BL.batter-.25;W(Math.cos(a)*r,Yc+BL.Hw+.6,Math.sin(a)*r,-a+PI/2,()=>box('stone',0,0,0,1.5,.85,.75,P('stone'),0,0,rr(-.04,.04)));}
  sector('stone',0,0,BL.Rin-.3,R-BL.Hw*BL.batter-.2,0,TAU,Yc+BL.roofY,Yc+BL.roofY+.35,P('stoneD'),96);
  // ---- the ring of cells: the court facade, its galleries and corbels, the cell doors, the stables below
  const ri=BL.Rin,gg=(G0+.6)/ri;
  lathe('stone',0,0,[[ri,Yc],[ri,Yc+BL.lv[1]]],96,P('stone'),{a0:PI/2+gg,a1:PI/2+TAU-gg,inward:true});
  lathe('stone',0,0,[[ri,Yc+BL.lv[1]],[ri,Yc+BL.roofY]],96,P('stone'),{inward:true});
  const NB=48;for(let i=0;i<NB;i++){const a=PI/2+(i+.5)/NB*TAU;const gate=tkNearDoor(a,gg+.04);
   for(let lv=0;lv<3;lv++){if(gate&&lv===0)continue;const y=Yc+BL.lv[lv],stable=lv===0&&Math.sin(a)<-.15;   // the north half of the ground floor is stabling
    W(Math.cos(a)*(ri-.02),y,Math.sin(a)*(ri-.02),-a-PI/2,()=>{const w=stable?2.1:1.0,h=stable?2.8:2.05;
     box('plain',0,.02,-.02,w,h,.06,0x120e0a);box('stone',0,h,.04,w+.5,.32,.16,P('stone'));if(!stable)box('wood',0,.02,.0,w*.92,h-.05,.03,P('woodD'),0,0,0);});}
   for(const lv of [1,2]){const y=Yc+BL.lv[lv];W(Math.cos(a)*ri,y-.55,Math.sin(a)*ri,-a-PI/2,()=>{box('stone',0,0,.35,.38,.55,.7,P('stone'));box('stone',0,.25,.85,.32,.3,.4,P('stone'));});}}
  for(const lv of [1,2]){const y=Yc+BL.lv[lv];sector('stone',0,0,ri-BL.gal,ri,0,TAU,y-.3,y,P('stone'),96);sector('stone',0,0,ri-BL.gal,ri-BL.gal+.22,0,TAU,y,y+1.0,P('stone'),96);}
  sector('stone',0,0,ri-1.0,ri+.05,0,TAU,Yc+BL.roofY-.35,Yc+BL.roofY,P('stone'),96);   // the eave over the top gallery
  for(let i=0;i<24;i++){const a=PI/2+(i+.5)/24*TAU;const p=tkAt(ri-BL.gal+.15,a);pole('stone',[p[0],Yc+BL.lv[2],p[1]],[p[0],Yc+BL.roofY-.35,p[1]],.16,P('stone'),8);}   // posts carrying the eave
  // two stone stairs from the court to the first gallery, and on to the second
  for(const [a0,lv] of [[PI/2+.55,0],[PI/2-.55,0],[PI/2+PI+.4,1]]){const y0=Yc+BL.lv[lv],y1=Yc+BL.lv[lv+1],n=16;const dir=lv?1:-1;
   for(let s=0;s<n;s++){const a=a0+dir*s*.012,p=tkAt(ri-BL.gal-.7,a);W(p[0],y0+s*(y1-y0)/n,p[1],-a-PI/2,()=>box('stone',0,0,0,1.0,(y1-y0)/n+.02,1.2,P('stone')));}}
  // ---- the court: the cistern well, outbuildings, tent platforms (two pitched), the stables' gear, a tethering boulder
  W(0,Yc,0,0,()=>{
   /* the well on a tiled apron, its top 4 cm above the court paving (which tops out at +.02): no z-fight */
   cyl('patQuatre',0,-.2,0,3.6,.26,null,32);sector('stone',0,0,1.7,2.1,0,TAU,0,.9,P('stone'),32);cyl('stone',0,0,0,1.72,.3,P('stoneD'),24);cyl('water',0,.3,0,1.72,.02,0x2a4a4a,24);   // a ring wall round the waterring('stone',0,.9,0,1.95,.18,P('stoneD'));
   for(const s of [-1,1])box('stone',s*1.85,.9,0,.4,1.6,.4,P('stone'));beam('wood',[-2.05,2.4,0],[2.05,2.4,0],.12,P('woodD'),true,8);cyl('wood',0,1.9,0,.18,.5,P('woodD'),8);sagRope('rope',[0,1.9,0],[0,.7,0],0,.02,0xa88a5a,2);
   // a round corbelled store (the smokehouse) and the cistern house
   W(-9,0,-8,.4,()=>{cyl('stone',0,0,0,2.6,2.4,P('stone'),20);sph('stone',0,2.3,0,2.6,P('stone'),.62,16);box('wood',0,0,2.55,1.0,1.9,.15,P('woodD'));smokeAt(0,4,0,{r:.25});});
   W(10,0,-7.5,-.5,()=>{box('stone',0,0,0,5.5,2.8,4.0,P('stone'));box('stone',0,2.8,0,6.0,.35,4.5,P('stoneD'));box('plain',0,0,2.01,1.1,2.0,.05,0x120e0a);});
   // the tent platforms: a raised stone ring of fitted kerbs, a felt floor where a tent stands
   const pads=[[-11,6,4.0,'tent-hunter-ger'],[11.5,6.5,3.6,'tent-bell'],[0,-13,4.2,null],[-14,-3,3.4,null],[14,-1,3.4,null]];
   for(const [x,z,r,key] of pads){cyl('stone',x,0,z,r,.55,P('stone'),28);ring('stone',x,.55,z,r-.1,.12,P('stoneD'),0,0,0,28);if(!key)cyl('earth',x,.551,z,r-.25,.01,P('earth'),24);}
   blMasonry({L:9.5,courses:[1.0,.8],at:(u,v,dep)=>[-4.75+u,v-.2,-17.8+dep],width:()=>[.6,1.4],col:()=>P('stone')});   // a fitted kerb wall at the north
  });
  for(const [x,z,r,key] of [[-11,6,4.0,'tent-hunter-ger'],[11.5,6.5,3.6,'tent-bell']]){place(key,x,z,Math.atan2(-x,-z),{y:Yc+.56,v:1});}
  // the stables: salamanders in the north bays (placed by 56-sa once the beasts exist), stalls, troughs and hay at the gallery foot
  for(let i=0;i<5;i++){const a=PI/2+PI+(i-2)*.22,p=tkAt(ri-2.2,a);FURNISH('scyvoi_trade_stall',p[0],Yc,p[1],tkFace(p[0],p[1])+PI,{setting:'both'});const q=tkAt(ri-4.2,a+.08);FURNISH('scyvoi_trade_trough',q[0],Yc,q[1],tkFace(q[0],q[1]),{setting:'outdoor'});}
  for(const a of [PI/2+PI-.62,PI/2+PI+.62]){const p=tkAt(ri-3.6,a);if(DEFS['salamander-riding'])place('salamander-riding',p[0],p[1],tkFace(p[0],p[1]),{y:Yc,v:a>PI*1.5?1:0,activity:'REST'});}
  {const p=tkAt(ri-3,PI/2+.9);FURNISH('scyvoi_tying_boulder',p[0],Yc,p[1],tkFace(p[0],p[1]),{setting:'outdoor'});}
  for(const s of [-1,1]){FURNISH('scyvoi_brazier',s*3.6,Yc,R-8.5,0,{setting:'outdoor'});}
  FURNISH('scyvoi_supply_bales',8,Yc,-11,0,{setting:'outdoor'});FURNISH('scyvoi_fruit_baskets',6.5,Yc,-10.2,.4,{setting:'outdoor'});
  // ---- the ramp: a paved causeway from the plain to the gate, its retaining walls of fitted stone
  const RL=BL.ramp,z0=R-.2,rw=3.4,ry=z=>Yc*(1-clamp((z-z0)/RL,0,1));
  psurf('paving',(u,v)=>{const z=z0+v*RL;return [-rw+u*2*rw,ry(z)+.02,z];},3,16,P('paving'),{up:true});
  for(const s of [-1,1]){blMasonry({L:RL,courses:[1.5,1.5,1.5],lean:.15,at:(u,v,dep)=>{const z=z0+u;const top=ry(z);return [s*(rw+dep),Math.min(v,top+.45)-0.0,z];},width:()=>[.9,2.0],skip:(k,u0,u1,v0)=>v0>ry(z0+u0)+.3});
   for(let i=0;i<12;i++){const z=z0+(i+.5)*RL/12;box('stone',s*(rw+.2),ry(z),z,.5,.55,RL/12-.05,P('stone'));}}
  smokeAt(0,Yc+BL.roofY+.5,-R+3,{r:.3});}});
