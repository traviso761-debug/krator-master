// ================================================================= THEODIGA TODAY — the Dome as the faith keeps it, drawn from its records
// T-dome-1 (src/44-th-dome-today.js, [G data]). THEODOME.draw (kits/ancients targets/theodiga/77b) takes this as ctx.today on the
// today page only (77-dam.js): the plain theodiga page draws the ruin as it was. Everything is drawn into the dam's group (local
// coordinates), tagged in core/tags under the Dome's record before it is drawn:
//   plan(P)    the stairs and the deck's cells their wells cut (the deck's top and bottom leave those cells out: cut(i, j))
//   deck(...)  what is left of the cut cells round each well, one shape with the well its hole, top and bottom, and the well's
//              four sides through the slab, in the deck's concrete
//   glaze(...) the frame's panes glazed again, a salvaged tint a pane (KRAND by its cell), the Tear left open; glazeHall the
//              Hall of the Song's likewise
//   stairs(...) each Pilgrims' Stair: its shaft in the faith's ashlar (Qiblai's pack, as the ways down) with its door on the kora,
//              a spine between its lanes, the flights' steps, the landings, a parapet round the well on the deck
// The stairs' meshes are named 'theodiga:town dome: ...', so core/ruins does not take them for wreckage (90w's skip).
var thDomeToday=(function(){
 const lin=h=>new THREE.Color(h).convertSRGBToLinear();
 let TG=null;
 function plan(P,ctx){const zc=x=>THEODOME.zc(P,x),S=TH_DOME_TODAY.stairs({zc,H:P.dam.H,deckY:P.deck.y});
  const C=TH_DOME_TODAY.cells(S.map(s=>s.well),{nu:72,nv:12,R:P.deck.r,cx:P.cx,cz:P.cz});
  const cut=(i,j)=>C.some(c=>i>=c.i0&&i<=c.i1&&j>=c.j0&&j<=c.j1);
  TG=KTAGS.theodiga||(KTAGS.theodiga=KTAGS.create({build:'ancients-theodiga'}));
  const B=(P.ruined?'ruin/':'intact/')+P.id,W=(x,y,z)=>[x+ctx.gx,y,z+ctx.gz];
  for(const s of S){const w=s.well;
   TG.child(B,{'class':'part',kind:'stair',key:s.id,name:s.name,at:W((w.x0+w.x1)/2,s.y0,(w.z0+w.z1)/2),size:[w.x1-w.x0,s.y1-s.y0,w.z1-w.z0],
    tags:{culture:'xanadu-scrap',from:'the middle kora',to:'the deck',flights:s.flights.length,kora:+s.kora.toFixed(1)}});}
  TG.child(B,{'class':'part',kind:'glazing',key:P.id+'.reglazed',name:'the re-glazed frame (salvaged panes; the Tear open)',at:W(P.cx,P.shell.y,P.cz),tags:{culture:'xanadu-scrap'}});
  return {stairs:S,cells:C,cut};}
 // ---- the deck round the wells --------------------------------------------------------------------------------------------
 function deck(G,P,T,conc){const DK=P.deck,R=DK.r,TAU2=2*Math.PI,geos=[];
  for(const c of T.cells){const t0=c.i0/72*TAU2,t1=(c.i1+1)/72*TAU2,r0=c.j0/12*R,r1=(c.j1+1)/12*R,n=(c.i1-c.i0+1)*6,pt=(r,t)=>[P.cx+r*Math.cos(t),P.cz+r*Math.sin(t)];
   const outline=[];for(let k=0;k<=n;k++)outline.push(pt(r0,t0+(t1-t0)*k/n));for(let k=n;k>=0;k--)outline.push(pt(r1,t0+(t1-t0)*k/n));
   const S=new THREE.Shape(outline.map(p=>new THREE.Vector2(p[0],-p[1]))),w=c.well;
   S.holes.push(new THREE.Path([[w.x0,w.z0],[w.x1,w.z0],[w.x1,w.z1],[w.x0,w.z1]].map(p=>new THREE.Vector2(p[0],-p[1]))));
   for(const y of [DK.y,DK.y-DK.t]){const g=new THREE.ShapeGeometry(S);g.rotateX(-Math.PI/2);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/8,uv.getY(i)/8);g.translate(0,y,0);geos.push(g);}
   /* the well's sides through the slab */
   for(const [x,z,sx,sz] of [[(w.x0+w.x1)/2,w.z0+.15,w.x1-w.x0,.3],[(w.x0+w.x1)/2,w.z1-.15,w.x1-w.x0,.3],[w.x0+.15,(w.z0+w.z1)/2,.3,w.z1-w.z0],[w.x1-.15,(w.z0+w.z1)/2,.3,w.z1-w.z0]]){
    const g=new THREE.BoxGeometry(sx,DK.t,sz);g.translate(x,DK.y-DK.t/2,z);geos.push(g);}}
  const m=meshMerged(geos.map(g=>g.index?g.toNonIndexed():g),conc,G);if(m)m.name='theodiga:dome deck round the Pilgrims\' Stairs';}
 // ---- the re-glazed frame --------------------------------------------------------------------------------------------------
 const GLASS=()=>new THREE.MeshStandardMaterial({vertexColors:true,transparent:true,opacity:.5,roughness:.08,metalness:.15,side:THREE.DoubleSide,depthWrite:false});
 /* a lathe's triangles coloured by the pane (cell) each falls in: its angle and height in the lathe's own frame */
 const tint=(g,nu,nv,H,seed,salt)=>{const p=g.attributes.position,c=[],TAU2=2*Math.PI,cols=TH_DOME_TODAY.PALETTE.map(lin);
  for(let t=0;t<p.count;t+=3){let x=0,y=0,z=0;for(let k=0;k<3;k++){x+=p.getX(t+k)/3;y+=p.getY(t+k)/3;z+=p.getZ(t+k)/3;}
   const a=(Math.atan2(z,x)+TAU2)%TAU2,i=Math.min(nu-1,Math.floor(a/TAU2*nu)),j=Math.min(nv-1,Math.max(0,Math.floor(y/H*nv))),C=cols[TH_DOME_TODAY.pane(seed,i+salt,j)];
   for(let k=0;k<3;k++)c.push(C.r,C.g,C.b);}
  g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));return g;};
 function glaze(G,P,NU,NV){const S=P.shell;
  const g=lathe({rFn:y=>Math.max(.5,THEODOME.shellR(P,y)-1.2),H:S.top,nu:NU,nv:NV,hole:(u,y)=>THEODOME.shellGone(P,u*TAU,y,false)}).toNonIndexed();
  const m=mesh(tint(g,NU,NV,S.top,P.seed,0),GLASS(),G,P.cx,S.y,P.cz);if(m){m.renderOrder=2;m.name='theodiga:dome the re-glazed frame';}}
 function glazeHall(G,P){const g=lathe({rFn:y=>40*Math.pow(clamp(1-Math.pow(y/26,2),0,1),.55),H:26,nu:48,nv:10}).toNonIndexed();
  const m=mesh(tint(g,48,10,26,P.seed,1000),GLASS(),G,P.cx,P.deck.y,P.cz);if(m){m.renderOrder=2;m.name='theodiga:dome the Hall of the Song re-glazed';}}
 // ---- the Pilgrims' Stairs -------------------------------------------------------------------------------------------------
 function stairs(G,P,T){
  const ASH=typeof XAK!=='undefined'&&XAK.MAT&&XAK.MAT.qAshlar&&XAK.MAT.qAshlar.map?XAK.MAT.qAshlar:null;
  if(ASH)for(const k of ['map','normalMap','roughnessMap'])if(ASH[k]){ASH[k].wrapS=ASH[k].wrapT=THREE.RepeatWrapping;ASH[k].needsUpdate=true;}
  const BODY=lin(ASH?0xd9cbb4:0xa99377),STEP=lin(ASH?0xf2e8d6:0xc9b799),LAND=lin(ASH?0xcdbda2:0xa4937a);
  const DK=P.deck,under=DK.y-DK.t;
  for(const s of T.stairs){const pos=[],col=[],uv=[],w=s.well,W=s.wall;
   /* an axis-aligned box, its uvs world-scale on each face's own plane (3 m a tile) */
   const box=(x0,x1,y0,y1,z0,z1,C)=>{const v=[[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]];
    for(const [a,b,c,d,ax] of [[0,1,2,3,'z'],[5,4,7,6,'z'],[4,0,3,7,'x'],[1,5,6,2,'x'],[3,2,6,7,'y'],[4,5,1,0,'y']])
     for(const q of [a,b,c,a,c,d]){const p=v[q];pos.push(p[0],p[1],p[2]);col.push(C.r,C.g,C.b);uv.push(ax==='x'?p[2]/3:p[0]/3,ax==='y'?p[2]/3:p[1]/3);}};
   /* the shaft: the lake wall, the two end walls, the kora wall with its door at the outer end; a slit over each landing */
   box(w.x0,w.x1,s.y0,under,w.z0,w.z0+W,BODY);
   box(w.x0,w.x0+W,s.y0,under,w.z0,w.z1,BODY);box(w.x1-W,w.x1,s.y0,under,w.z0,w.z1,BODY);
   const D=s.door;
   box(w.x0,D.x0,s.y0,under,w.z1-W,w.z1,BODY);box(D.x1,w.x1,s.y0,under,w.z1-W,w.z1,BODY);box(D.x0,D.x1,s.y0+D.h,under,w.z1-W,w.z1,BODY);
   /* the spine between the lanes, from the floor to the deck's underside, short of the landings at both ends */
   const mid=(w.z0+w.z1)/2,xi=Math.min(...s.landings.map(l=>l.x1)),xo=Math.max(...s.landings.map(l=>l.x0));
   box(Math.min(xi,xo),Math.max(xi,xo),s.y0,under,mid-W/2,mid+W/2,BODY);
   /* the flights: a step 0.5 m by its rise, 0.45 m deep under its tread */
   for(const f of s.flights){const n=f.steps,dx=(f.b[0]-f.a[0])/n,dy=(f.b[1]-f.a[1])/n;
    for(let k=0;k<n;k++){const xa=f.a[0]+dx*k,xb=xa+dx,top=f.a[1]+dy*(k+1);box(Math.min(xa,xb),Math.max(xa,xb),top-.45,top,f.a[2]-f.w/2,f.a[2]+f.w/2,STEP);}}
   for(const l of s.landings)box(l.x0,l.x1,l.y-.3,l.y,l.z0,l.z1,LAND);
   /* the parapet round the well on the deck, but on the landing's side, where the pilgrims step off */
   const top=s.landings[s.landings.length-1],openW=Math.abs(top.x0-w.x0)<1e-6;
   box(w.x0,w.x1,DK.y,DK.y+1.1,w.z0,w.z0+.3,BODY);box(w.x0,w.x1,DK.y,DK.y+1.1,w.z1-.3,w.z1,BODY);
   if(openW)box(w.x1-.3,w.x1,DK.y,DK.y+1.1,w.z0,w.z1,BODY);else box(w.x0,w.x0+.3,DK.y,DK.y+1.1,w.z0,w.z1,BODY);
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
   g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();
   const M=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.93,flatShading:true,side:THREE.DoubleSide});
   if(ASH){M.map=ASH.map;M.normalMap=ASH.normalMap||null;M.roughnessMap=ASH.roughnessMap||null;M.roughness=1;}
   const m=new THREE.Mesh(g,M);m.name='theodiga:town dome: '+s.name;m.castShadow=m.receiveShadow=true;G.add(m);
   REGISTER({name:'Theodiga — '+s.name+' (up from the middle kora to the Dome\'s deck)',x:(w.x0+w.x1)/2,z:(w.z0+w.z1)/2,y:s.y0,r:Math.hypot(w.x1-w.x0,w.z1-w.z0)/2+1,h:s.y1-s.y0+1.5});}}
 return {plan,deck,glaze,glazeHall,stairs};
})();
