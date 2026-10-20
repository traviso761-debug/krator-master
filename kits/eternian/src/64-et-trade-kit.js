// prefix: et
// ================================================================= THE TRADE TOOLKIT (P6): one generator for the census trades
// A trade building is a plan (a rectangle, or a hexagon after the Sanctum's six-fold plan: the owner, 2026-10-20), one or
// more storeys in the tier's materials (the common town's cast block below and lime above; the State's pale brick), a
// shop opening and a door with its mask, a roof by tier, a chimney if it burns, and its furniture from the catalog; each
// def adds what makes the trade itself through o.extra (drawn in the building's own frame after the shell).
//
//   etTrade(o): o.plan 'rect' (o.w, o.d) | 'hex' (o.R); o.storeys (1-3), o.sh storey height; o.mk / o.upMk the walls
//   below and above; o.shop (a wide opening on the front), o.mask ('terracotta' | 'lead' | false); o.roof 'gable' |
//   'hip' | 'pent' | 'flat' | 'pyramid' (hex: 'pyramid' or 'ogee'), o.roofMk; o.chimney [x, z]; o.furn [[key, x, z, ry,
//   storey]] (hex: [[key, face, inset, storey]]); o.extra(F) with F = {G, H, top, w, d, R, ap}. Returns F.
const ET_SH=3.2;
function etTrade(o){const plan=o.plan||'rect',n=o.storeys||1,sh=o.sh||ET_SH,G=o.G==null?.35:o.G,mk=o.mk||'block',upMk=o.upMk||(mk==='brick'?'brick':'lime');
 const col=k=>k==='brick'?P('brick'):k==='block'?P('block'):k==='silt'?P('silt'):P('lime'),fr=k=>new THREE.Color(col(k)).multiplyScalar(.9);
 const H=n*sh,F={G:G,H:H,top:G+H,w:o.w,d:o.d,R:o.R,sh:sh};
 const mask=o.mask===false?false:(o.mask||'terracotta');
 if(plan==='hex'){const R=o.R,ap=R*ET_HEX_AP,fw=R;F.ap=ap;
  prism('stone',etHex(R+.3),0,G,P('stoneD'));prism('paving',etHex(R-.1),G-.04,G,P('paving'));
  for(let s=0;s<n;s++){const y=G+s*sh,m=s?upMk:mk;
   etHexFaces(ap,(k)=>{const op=[];
    if(s===0&&k===1){if(o.shop)op.push({x:0,w:fw-1.0,h:2.6,y:.1,gap:true});else op.push({x:0,w:1.2,h:2.3,door:true,maskMetal:mask||'terracotta',mask:mask!==false});}
    else op.push({x:0,w:Math.min(1.3,fw-1.2),h:1.4,y:.95,dark:o.poor,shut:!o.steel,steel:!!o.steel});
    etWall(fw,y,sh,m,col(m),op,{frame:fr(m)});});
   for(const q of etHex(R))box(m,q[0],y,q[1],.4,sh,.4,fr(m));
   if(s>0)prism('timber',etHex(R-.2),y-.2,y,P('timber'));}
  if(o.shop){box('timber',0,G,ap-.6,fw-1.2,1.0,.45,P('timber'));door(0,G,ap,0,1.4);}
  const rm=o.roofMk||'tile',ry=G+H;
  if(o.roof==='ogee')etOgee(R+.6,ry,R*.9,{mk:rm,seg:6,a0:0,col:etKeyCol(rm)});
  else{lathe(rm,0,0,[[R+.6,ry-.15],[.05,ry+R*.62]],6,etKeyCol(rm),{a0:0,a1:TAU});lathe(rm,0,0,[[.05,ry+R*.6],[R+.6,ry-.18]],6,P('timber'),{a0:0,a1:TAU});
   cone('verdigris',0,ry+R*.6,0,.25,1.2,P('verdigris'),6);}
  for(const f of (o.furn||[])){const s=f[3]||0,ph=PI/6+f[1]*PI/3,r=ap-f[2];
   FURNISH(f[0],r*Math.cos(ph),G+s*sh,r*Math.sin(ph),Math.atan2(-Math.cos(ph),-Math.sin(ph)));}}
 else{const W=o.w,D=o.d;
  box('stone',0,0,0,W+.3,G,D+.3,P('stoneD'));box('paving',0,G-.04,0,W-.5,.05,D-.5,P('paving'));
  for(let s=0;s<n;s++){const y=G+s*sh,m=s?upMk:mk,front=[],back=[],side=[];
   const nw=Math.max(1,Math.floor((W-1)/2.6));
   if(s===0){if(o.shop)front.push({x:-W*.12,w:Math.min(3.6,W*.45),h:2.6,y:.1,gap:true},{x:W/2-1.1,w:1.1,h:2.3,door:true,maskMetal:mask||'terracotta',mask:mask!==false});
    else{front.push({x:o.doorX==null?0:o.doorX,w:o.doorW||1.2,h:o.doorH||2.3,door:true,maskMetal:mask||'terracotta',mask:mask!==false,leaf:o.leaf});
     for(const x of [-W/2+1.3,W/2-1.3])if(Math.abs(x-(o.doorX||0))>1.6)front.push({x:x,w:1.0,h:1.4,y:.95,dark:o.poor,steel:!!o.steel,shut:!o.steel});}}
   else for(let i=0;i<nw;i++)front.push({x:-W/2+(i+.5)*W/nw,w:1.0,h:1.4,y:.95,dark:o.poor,steel:!!o.steel,shut:!o.steel});
   back.push({x:0,w:1.0,h:1.2,y:1.1,dark:o.poor,shut:!o.steel,steel:!!o.steel});
   if(D>5)side.push({x:0,w:1.0,h:1.2,y:1.1,dark:o.poor,shut:!o.steel,steel:!!o.steel});
   etWalls(W,D,y,sh,m,col(m),{front:front,back:back,left:side,right:o.rightDoor&&s===0?[{x:0,w:1.0,h:2.2,door:true,mask:false}]:side},{frame:fr(m)});
   if(s>0)box('timber',.6,y-.2,0,W-1.8,.2,D-.6,P('timber'));}
  if(n>1)for(let s=1;s<n;s++)etStair(-W/2+.9,G+(s-1)*sh,D/2-.6,1.0,sh/16,-.2,16,P('timberL'));
  if(o.shop){box('timber',-W*.12,G,D/2-.6,Math.min(3.4,W*.42),1.0,.45,P('timber'));box('lime',-W*.12,G+2.75,D/2+.3,Math.min(4.2,W*.5),.12,.7,P('limeShade'));}
  const rm=o.roofMk||'tile',ry=G+H,rf=o.roof||'gable';
  if(rf==='gable')etGable(W,D,ry,o.roofH||Math.min(2.6,D*.35),{mk:rm,ribs:rm==='tile'?.3:0,ov:.45,wallMk:upMk,wallCol:col(upMk)});
  else if(rf==='hip')etHip(W,D,ry,o.roofH||Math.min(4,D*.45),{mk:rm,ov:.6,flare:rm==='celadon'?.4:0,under:P('timber'),cap:rm==='celadon'?P('celadon'):undefined});
  else if(rf==='pent'){etPent(W,D,ry+.05,ry+(o.roofH||.9),{mk:rm,ribs:rm==='tile'?.3:0,ov:.5});etPentFill(W,D,ry,ry+(o.roofH||.9),upMk,col(upMk));}
  else{box(upMk,0,ry,0,W,.2,D,P('limeShade'));etParapet(W,D,ry+.2,.6,{col:col(upMk),cope:P('limeShade'),crown:!!o.crown,crownX:0,crownW:2.4,steps:3,crownMask:o.crownMask});}
  for(const f of (o.furn||[]))FURNISH(f[0],f[1],G+(f[4]||0)*sh,f[2],f[3]||0);}
 if(o.chimney){const [cx,cz]=o.chimney,cy=G+H+(o.roofH||2)+1.2;box('brick',cx,0,cz,.9,cy,.9,P('brick'));box('brick',cx,cy,cz,1.1,.3,1.1,new THREE.Color(P('brick')).multiplyScalar(.8));smokeAt(cx,cy+.4,cz);}
 if(o.sign){box('iron',o.sign[0],G+2.9,o.sign[1]+.4,.05,.05,.8,P('iron'));etBanner(o.sign[0],G+2.85,o.sign[1]+.75,.6,1.1);}
 if(o.extra)o.extra(F);
 return F;}
/* a bottle kiln of pale brick (the Eternian works' sign): r at its foot, h tall, a fire mouth on +z, smoking */
function etBottleKiln(x,z,r,h){lathe('brick',x,z,[[r,0],[r*1.06,h*.12],[r*1.08,h*.35],[r*.86,h*.55],[r*.5,h*.75],[r*.36,h*.95],[r*.4,h]],14,P('brick'));
 box('brick',x,0,z+r*.92,r*.6,r*.7,.4,new THREE.Color(P('brick')).multiplyScalar(.45));box('glow',x,.1,z+r*1.0,r*.4,r*.35,.05,new THREE.Color(0xd9762c));smokeAt(x,h+.4,z);}
/* a drying rack: n shelves of tiles (or paper, or cloth) under a little roof, L long along x */
function etDryRack(x,z,L,mk,col){for(const s of [-1,1])for(const xx of [-L/2,0,L/2])box('timber',x+xx,0,z+s*.5,.1,1.9,.1,P('timber'));
 for(let i=0;i<4;i++)box(mk,x,.35+i*.4,z,L,.05,.9,col);
 box('tile',x,2.0,z,L+.4,.08,1.5,P('tile'),0,0);}
