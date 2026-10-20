// prefix: et
// ================================================================= THE ROOFS (kits/eternian/PLAN.md section 2, "Roofs by tier")
// Glazed celadon tile, steep, on the rich and the ministries; metal fish-scale shingle on the court's pavilions (gold,
// bronze or gunmetal: `gilt`, or `scale` tinted); grey tile on the common town; reed on the poor. Every helper draws in
// the current frame with the front toward +z, its eaves at y and its ridge h above, and maps the library sheets in metres
// (TILE) so a tile course keeps its size on any roof.

/* the vertex colour a key draws in: a full-colour library set (the celadon tile, the crackle glaze, the gilt scale) keeps
   its own colour (white); a tinted set and ?mat=proc take the palette's */
const ET_FULL={celadon:1,glaze:1,gilt:1,gold:1,terracotta:1,titanium:1,white:1,faces:1};
function etKeyCol(mk){return ET_FULL[mk]&&KIT_HAS(mk)?new THREE.Color(1,1,1):P(mk);}
/* a flat outline with UVs given per point (in metres; divided by the key's tile here), drawn as etPoly draws */
function etPolyUV(mk,pts,uvs,col){const tl=TILE[mk]||1,pos=[],nor=[],uv=[],idx=[];const a=pts[0],b=pts[1],c=pts[2];
 const n=new THREE.Vector3().crossVectors(new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]),new THREE.Vector3(c[0]-a[0],c[1]-a[1],c[2]-a[2])).normalize();
 pts.forEach((p,i)=>{pos.push(p[0],p[1],p[2]);nor.push(n.x,n.y,n.z);uv.push(uvs[i][0]/tl,uvs[i][1]/tl);});for(let i=1;i<pts.length-1;i++)idx.push(0,i,i+1);
 emit(mk,fixWind(mkGeo(pos,nor,uv,idx)),null,col,{su:1,sv:1});}   /* a uvm: emit keeps the geometry's own UVs only when given one */

/* ---------------------------------------------------------------- a sheet: a slab th thick spanning p0->p1 and p0->p2, its
   faces' UVs in metres (plane4 maps one tile over the whole face) */
function etSheet(mk,p0,p1,p2,th,col){const T=TILE[mk]||1;
 const e1=new THREE.Vector3(p1[0]-p0[0],p1[1]-p0[1],p1[2]-p0[2]),e2=new THREE.Vector3(p2[0]-p0[0],p2[1]-p0[1],p2[2]-p0[2]);
 const L1=e1.length();if(L1<1e-6||e2.length()<1e-6)return;const X=e1.clone().normalize();let N=new THREE.Vector3().crossVectors(X,e2).normalize();
 let Z=new THREE.Vector3().crossVectors(X,N).normalize();if(e2.dot(Z)<0){N.negate();Z.negate();}const L2=e2.dot(Z);
 const q=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(X,N,Z));
 const mid=new THREE.Vector3(p0[0],p0[1],p0[2]).addScaledVector(e1,.5).addScaledVector(e2,.5);
 emit(mk,gbox(),new THREE.Matrix4().compose(mid,q,new THREE.Vector3(L1,th,L2)),col,{su:L1/T,sv:L2/T});}
/* a flat outline drawn both ways: the top in mk, the underside (a soffit, seen from inside a cut-away) in col2 */
/* the underside is dropped 0.12 m: drawn in the top's own plane it z-fought it from afar (the owner, 2026-10-20) */
const ET_SOFFIT=.12;
function etPoly2(mk,pts,col,col2){etPoly(mk,pts,col);etPoly(mk,pts.map(p=>[p[0],p[1]-ET_SOFFIT,p[2]]).reverse(),col2||col);}

/* ---------------------------------------------------------------- the gable: the ridge along x, h above the eaves at y,
   w x d under it; o.ov the eaves' overhang, o.gov the gables', o.th the sheet; o.ribs a tile course every o.ribs metres
   (the grey tile's and the celadon's rolls), o.gables false for no end walls, else the triangles in o.wallMk/o.wallCol;
   o.cap the ridge's colour */
function etGable(w,d,y,h,o){o=o||{};const mk=o.mk||'tile',col=o.col||etKeyCol(mk),ov=o.ov==null?.4:o.ov,gov=o.gov==null?.3:o.gov,th=o.th||.14;
 const k=h/(d/2),ye=y-ov*k,ze=d/2+ov,W=w/2+gov;
 for(const s of [1,-1])etSheet(mk,[-W,ye,s*ze],[W,ye,s*ze],[-W,y+h,0],th,col);
 const cap=o.cap||new THREE.Color(col).multiplyScalar(.82);
 box(mk,0,y+h-.06,0,2*W+.1,.16,.34,cap);
 if(o.ribs){const n=Math.max(1,Math.round(2*W/o.ribs)),L=Math.hypot(ze,h+ov*k),ny=ze/L,nz=(h+ov*k)/L,rc=o.ribCol||new THREE.Color(col).multiplyScalar(.86),lift=th/2+.04;
  for(let i=0;i<n;i++){const x=-W+(i+.5)*2*W/n;
   for(const s of [1,-1])beam(mk,[x,ye+ny*lift,s*(ze+nz*lift)],[x,y+h+ny*lift,s*nz*lift],.08,rc);}}
 if(o.gables!==false){const wm=o.wallMk||'lime',wc=o.wallCol||P(wm);
  etPoly(wm,[[w/2,y,d/2],[w/2,y,-d/2],[w/2,y+h,0]],wc);etPoly(wm,[[-w/2,y,-d/2],[-w/2,y,d/2],[-w/2,y+h,0]],wc);}}

/* ---------------------------------------------------------------- the hip: four slopes to a ridge (or a point), h above
   the eaves at y, over w x d; o.ov the overhang, o.under the soffit's colour, o.cap the hips' and ridge's, o.flare lifts the
   eaves' corners (the celadon roofs' turned-up tips), o.ribs the tile rolls' spacing */
function etHip(w,d,y,h,o){o=o||{};const mk=o.mk||'celadon',col=o.col||etKeyCol(mk),ov=o.ov==null?.5:o.ov;
 const k=h/(Math.min(w,d)/2),ye=y-ov*k,X=w/2+ov,Z=d/2+ov,rx=Math.max(0,(w-d)/2),rz=Math.max(0,(d-w)/2),yr=y+h;
 const E=(sx,sz)=>[sx*X,ye,sz*Z],R=(sx,sz)=>[sx*rx,yr,sz*rz],un=o.under||P('timber');
 /* each slope's UVs run along its eave (u) and up the slope (v), so a sheet's tile rolls run down every face */
 const face=(pts,ax)=>{const uv=pts.map(p=>ax?[p[2],Math.hypot(X-Math.abs(p[0]),p[1]-ye)]:[p[0],Math.hypot(Z-Math.abs(p[2]),p[1]-ye)]);
  etPolyUV(mk,pts,uv,col);etPoly(mk,pts.map(p=>[p[0],p[1]-ET_SOFFIT,p[2]]).reverse(),un);};
 face([E(-1,1),E(1,1),R(1,1),R(-1,1)],0);face([E(1,-1),E(-1,-1),R(-1,-1),R(1,-1)],0);
 face([E(1,1),E(1,-1),R(1,-1),R(1,1)],1);face([E(-1,-1),E(-1,1),R(-1,1),R(-1,-1)],1);
 const cap=o.cap||new THREE.Color(col).multiplyScalar(.8);
 for(const sx of [-1,1])for(const sz of [-1,1])beam(mk,E(sx,sz),R(sx,sz),.14,cap);
 if(rx>0||rz>0)beam(mk,R(-1,-1),R(1,1),.18,cap);
 /* the fascia round the eaves */
 for(const [a,b] of [[E(-1,1),E(1,1)],[E(1,-1),E(-1,-1)],[E(1,1),E(1,-1)],[E(-1,-1),E(-1,1)]])beam(mk,[a[0],a[1]-.08,a[2]],[b[0],b[1]-.08,b[2]],.16,cap);
 /* the tile rolls (o.ribs: their spacing), each running up its face until a hip cuts it */
 if(o.ribs){const rc=o.ribCol||new THREE.Color(col).multiplyScalar(.86),rw=o.ribW||.07,lf=.05,Y=t=>ye+t*(yr-ye)+lf;
  const nx=Math.max(1,Math.round(2*X/o.ribs)),nz=Math.max(1,Math.round(2*Z/o.ribs));
  for(let i=0;i<nx;i++){const u=-X+(i+.5)*2*X/nx,t=Math.min(1,(X-Math.abs(u))/Math.max(.01,X-rx));
   for(const s of [-1,1])beam(mk,[u,Y(0),s*Z],[u,Y(t),s*(Z-t*(Z-rz))],rw,rc);}
  for(let i=0;i<nz;i++){const u=-Z+(i+.5)*2*Z/nz,t=Math.min(1,(Z-Math.abs(u))/Math.max(.01,Z-rz));
   for(const s of [-1,1])beam(mk,[s*X,Y(0),u],[s*(X-t*(X-rx)),Y(t),u],rw,rc);}}
 if(o.flare)for(const sx of [-1,1])for(const sz of [-1,1]){const c=E(sx,sz);beam(mk,c,[c[0]+sx*o.flare*.6,c[1]+o.flare,c[2]+sz*o.flare*.6],.12,cap);}}

/* ---------------------------------------------------------------- the hexagonal hip: six slopes to a point over a hexagon
   of circumradius R (corners at multiples of 60 degrees, etHex's), eaves at y overhanging o.ov, h to the apex; each slope's
   UVs run along its eave and up its fall, so the tile's rolls run down every face (the owner: the plain cones read badly);
   the hips and the eave's fascia in o.cap, the underside dropped clear (ET_SOFFIT) */
function etHexHip(R,y,h,o){o=o||{};const mk=o.mk||'tile',col=o.col||etKeyCol(mk),ov=o.ov==null?.5:o.ov,un=o.under||P('timber');
 const ap=R*Math.cos(PI/6),k=h/ap,ye=y-ov*k,Re=(ap+ov)/Math.cos(PI/6),A=[0,y+h,0],E=i=>[Re*Math.cos(i*PI/3),ye,Re*Math.sin(i*PI/3)];
 const cap=o.cap||new THREE.Color(col).multiplyScalar(.8),ape=ap+ov;
 for(let i=0;i<6;i++){const a=E(i+1),b=E(i),mx=(a[0]+b[0])/2,mz=(a[2]+b[2])/2,ml=Math.hypot(mx,mz),T=[(a[0]-b[0])/Re,(a[2]-b[2])/Re],n=[mx/ml,mz/ml];
  const uv=p=>[(p[0]-mx)*T[0]+(p[2]-mz)*T[1],Math.hypot(ape-(p[0]*n[0]+p[2]*n[1]),p[1]-ye)];
  const pts=[a,b,A];etPolyUV(mk,pts,pts.map(uv),col);etPoly(mk,pts.map(p=>[p[0],p[1]-ET_SOFFIT,p[2]]).reverse(),un);
  beam(mk,b,A,.14,cap);beam(mk,[a[0],a[1]-.08,a[2]],[b[0],b[1]-.08,b[2]],.16,cap);}}

/* ---------------------------------------------------------------- the pent (a lean-to): one slope from y1 at the back
   (z = -d/2) to y0 at the front, w x d, overhanging o.ov at the front and o.gov at the sides */
function etPent(w,d,y0,y1,o){o=o||{};const mk=o.mk||'tile',col=o.col||etKeyCol(mk),ov=o.ov==null?.35:o.ov,gov=o.gov==null?.2:o.gov,th=o.th||.12;
 const k=(y1-y0)/d,W=w/2+gov;etSheet(mk,[-W,y0-ov*k,d/2+ov],[W,y0-ov*k,d/2+ov],[-W,y1,-d/2],th,col);
 if(o.ribs){const n=Math.max(1,Math.round(2*W/o.ribs)),rc=o.ribCol||new THREE.Color(col).multiplyScalar(.84);
  for(let i=0;i<n;i++){const x=-W+(i+.5)*2*W/n;beam(mk,[x,y0-ov*k+th/2+.04,d/2+ov],[x,y1+th/2+.04,-d/2],.07,rc);}}}

/* the walls a pent leaves open over w x d walls topped at y0: the back carried up to y1, the two side triangles */
function etPentFill(w,d,y0,y1,mk,col){col=col||P(mk);box(mk,0,y0-.02,-d/2+ET_T/2,w,y1-y0+.02,ET_T,col);
 etPoly(mk,[[w/2,y0,d/2],[w/2,y0,-d/2],[w/2,y1,-d/2]],col);etPoly(mk,[[-w/2,y0,-d/2],[-w/2,y0,d/2],[-w/2,y1,-d/2]],col);}

/* ---------------------------------------------------------------- the ogee: an octagonal fish-scale roof (the court's
   pavilions: arch-33), R the eave's circumradius at y, h to the finial's foot; flat faces toward the axes (a0 = PI/8; o.seg 6
   and o.a0 0 for a hexagon).
   o.mk 'gilt' (gold) or 'scale' (o.col: bronze or gunmetal); a gold finial in three steps. Returns the finial's top */
const ET_OCT0=Math.PI/8;
function etOgee(R,y,h,o){o=o||{};const mk=o.mk||'scale',col=o.col||(mk==='gilt'?new THREE.Color(1,1,1):P('bronze')),seg=o.seg||8,A0=o.a0==null?ET_OCT0:o.a0;
 const prof=[[R,y],[R*.96,y+h*.08],[R*.86,y+h*.2],[R*.7,y+h*.36],[R*.5,y+h*.52],[R*.3,y+h*.68],[R*.16,y+h*.82],[R*.08,y+h*.94],[.06,y+h]];
 lathe(mk,0,0,prof,seg,col,{a0:A0,a1:A0+TAU});
 lathe(mk,0,0,prof.map(q=>[q[0]*.97,q[1]-ET_SOFFIT]).reverse(),seg,o.under||P('timber'),{a0:A0,a1:A0+TAU,inward:true});   /* the underside follows the curve, inside it */
 /* the eave's band, and the gold finial: a stepped base, a ball, a needle */
 const ec=o.band||P('bronze');for(let i=0;i<seg;i++){const a=A0+i*TAU/seg,b=A0+(i+1)*TAU/seg;beam('bronze',[R*Math.cos(a),y-.1,R*Math.sin(a)],[R*Math.cos(b),y-.1,R*Math.sin(b)],.2,ec);}
 const g=KIT_HAS('gold')?new THREE.Color(1,1,1):P('gold'),f=o.finial==null?Math.max(1,h*.3):o.finial;
 box('gold',0,y+h-.05,0,f*.22,f*.12,f*.22,g);box('gold',0,y+h+f*.07,0,f*.14,f*.1,f*.14,g);
 sph('gold',0,y+h+f*.27,0,f*.1,g);cone('gold',0,y+h+f*.35,0,f*.04,f*.65,g,6);return y+h+f;}
