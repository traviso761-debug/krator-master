// ================================================================= THE HALL OF HEROES — the drawing (records in, geometry out)
// buildGatearc draws the plan (8av0) as the Ancients built it (d = 0) and as it stands at the Labyrinth's mouth (d = 1:
// the plan with GATEARC.ruin's deltas and the Kimr's necropolis, GATEARC.kimr). Everything placed is registered in
// core/tags first, then drawn from its record. What is not in a record (a window, a socket, a skull's horns) is hashed
// from its record's id with KRAND. Nothing here decides where a thing goes.
//
// The walls are gridSurface quads merged per material, on the Arcube's skins (MAT.ac*, 89d-arcube.js: a tile is 25.6 m,
// seven 3.66 m storeys); the cells, piers, sockets and the Kimr's things are kit instances.
//
// A host (biomes/labyrinth's station) sets GATEARC.host before calling: {y: the pond's level in the world, pond: false
// when it draws the pond itself on core/water, stacks: GATESTACKS' plan when it wants the bridges' portals cut}.
const GA_SITE={};
GATEARC.host=GATEARC.host||{y:0,pond:true};
MAT.gaMemb=new THREE.MeshStandardMaterial({color:0xdfe8e4,roughness:.35,metalness:0,transparent:true,opacity:.38,side:DS,depthWrite:false});
MAT.gaHide=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.9,metalness:0,side:DS});
kdef('gaBox',new THREE.BoxGeometry(1,1,1),MAT.acKit);
kdef('gaVoid',new THREE.BoxGeometry(1,1,1),MAT.acVoid);
kdef('gaCyl',new THREE.CylinderGeometry(1,1,1,14),MAT.acKit);
kdef('gaBone',new THREE.BoxGeometry(1,1,1),MAT.gaHide);
kdef('gaGlass',new THREE.BoxGeometry(1,1,1),MAT.glass);

function buildGatearc(scene,gx,gz,d){reseed(7431+d);
 const HO=GATEARC.host,Y0=HO.y==null?0:HO.y;KOFF=[gx,Y0,gz];
 const dd=d>0?1:0,P=GATEARC.plan(),RU=dd?GATEARC.ruin(P):null,KM=GATEARC.kimr(P,RU),D=P.dim;
 const UH=(id,salt)=>{let h=P.seed^salt;for(let i=0;i<id.length;i++)h=KRAND.hash(h,id.charCodeAt(i));return KRAND.unit(h);};
 const gone=new Set(RU?RU.cellsGone:[]),sheared=new Map(RU?RU.sheared.map(s=>[s.id,s.y]):[]);
 const slabGone=(key,k)=>RU&&RU.slabGone.some(s=>s.slab===key&&s.face===k);
 const G=new THREE.Group();G.position.set(gx,Y0,gz);scene.add(G);
 if(HO.sheet!==false){   /* the kit's sheet only: a world host owns its camera and sky */
 if(typeof camera!=='undefined'&&camera.far<30000){camera.far=30000;camera.updateProjectionMatrix();}
 if(typeof sky!=='undefined')sky.renderOrder=-1;
 // the Pile's fix (8at1): the sky dome's pow() kept off a negative, or the band over the horizon comes out black
 if(typeof skyMat!=='undefined'&&skyMat.fragmentShader.indexOf('pow(h,.55)')>=0){
  skyMat.fragmentShader=skyMat.fragmentShader.replace('pow(h,.55)','pow(max(h,0.),.55)');skyMat.needsUpdate=true;}
 }

 // ---- core/tags: one record per placed thing, before anything is drawn -------------------------------------------
 {const T=KTAGS.gatearc||(KTAGS.gatearc=KTAGS.create({build:'ancients-gatearc'}));
  const pre=(dd?'ruin':'intact')+'/',W=a=>[a[0]+gx,a[1]+Y0,a[2]+gz],st=dd?'ruined':'live-work';
  const B=T.add({id:pre+P.id,'class':'building',kind:'arcology',key:'ancients:gatearc',name:'The Hall of Heroes',at:[gx,Y0,gz],
   r:D.SLABS[0].ro,h:D.TOP,tags:{culture:'ancient',types:dd?['funerary','religious','dwelling-multi']:['dwelling-multi','civic','market'],
   state:dd?'ruined':'intact',landmark:true}});
  const part=(id,kind,at,o)=>T.child(B.id,Object.assign({'class':'part',kind:kind,key:id,at:W(at),tags:{style:st}},o||{}));
  for(const c of P.cols)part(c.id,'column',[c.x,c.y0,c.z],{r:c.r,h:(sheared.get(c.id)||c.y1)-c.y0,tags:{style:st,role:'live-work'}});
  for(const s of P.slabs)part(s.id,'topography',[0,s.y0,0],{r:s.ro,h:s.y1-s.y0,tags:{style:st,role:s.use}});
  for(const h of P.halls)part(h.id,'hall',[h.x,h.y0,h.z],{size:[h.w,h.h,h.d],tags:{style:st,role:h.kind}});
  for(const c of P.causeways)part(c.id,'causeway',c.from,{tags:{style:st,role:dd?'funeral-road':'causeway'}});
  part(P.membrane.id,'membrane',[0,P.membrane.y1,0],{r:P.membrane.r0,tags:{style:st,state:dd?'gone':'whole'}});
  for(const n of KM.niches)T.child(B.id,{'class':'fixture',kind:'burial-niche',key:n.id,at:W([0,n.y,0]),tags:n.tags});
  for(const p of KM.poles)T.child(B.id,{'class':'fixture',kind:'skull-pole',key:p.id,at:W([p.x,p.y,p.z]),h:p.h,tags:p.tags});
  for(const b of KM.biers)T.child(B.id,{'class':'fixture',kind:'bier',key:b.id,at:W([b.x,b.y,b.z]),tags:b.tags});
  for(const o of KM.offerings)T.child(B.id,{'class':'prop',kind:o.kind,key:o.id,at:W([o.x,o.y,o.z]),tags:o.tags});}

 REGISTER({name:'The Hall of Heroes ('+STATE(d)+')',x:0,z:0,r:D.SLABS[0].ro+20,h:D.TOP+4,y:-4});
 for(const s of P.slabs)REGISTER({name:'The Hall of Heroes — '+s.name,x:0,z:0,r:s.ro+8,y:s.y0,h:s.y1-s.y0});
 for(const c of P.cols)REGISTER({name:'The Hall of Heroes — column '+(c.k+1)+(dd?'':' (living-working)'),x:c.x,z:c.z,r:c.r+2,y:-4,h:(sheared.get(c.id)||c.y1)+4});
 REGISTER({name:'The Hall of Heroes — the skylight well',x:0,z:0,r:D.WELL,y:D.SLABS[0].y0,h:D.TOP-D.SLABS[0].y0});
 if(dd)for(const c of P.causeways)REGISTER({name:'The Hall of Heroes — the funeral road (causeway '+(c.col+1)+')',x:(c.from[0]+c.to[0])/2,z:(c.from[2]+c.to[2])/2,r:(c.r1-c.r0)/2,y:0,h:8});

 // ---- lists and tones ------------------------------------------------------------------------------------------
 const L={wrk:[],res:[],mass:[],deck:[],shade:[],pave:[],memb:[],gut:[]};
 const T256=25.6;
 const uvShift=(g,dv)=>{const a=g.attributes.uv;for(let i=0;i<a.count;i++)a.setY(i,a.getY(i)+dv);return g;};
 const conc=(id,lo,hi)=>new THREE.Color().setHSL(.09+.03*UH(id,1),.05+.06*UH(id,2),(dd?lo*.62:lo)+(hi-lo)*UH(id,3));
 // a vertical wall from (xa,za) to (xb,zb), y0..y1
 const wall=(list,xa,za,xb,zb,y0,y1,nu)=>{const Lw=Math.hypot(xb-xa,zb-za);
  list.push(uvShift(gridSurface((u,v)=>[xa+(xb-xa)*u,y0+(y1-y0)*v,za+(zb-za)*u],nu||Math.max(1,Math.round(Lw/T256)),1,{uS:Lw/T256,vS:(y1-y0)/T256}),y0/T256));};
 // a drum (a column's outside), a0..a1 the arc (radians)
 // hf: a decay predicate (holeFn) for a ruined drum: the drum is cut in storey-pair rows so the holes are windows' size
 const drum=(list,cx,cz,r,y0,y1,a0,a1,hf)=>{a0=a0==null?0:a0;a1=a1==null?TAU:a1;const arc=(a1-a0)*r,nv=hf?Math.max(1,Math.round((y1-y0)/8.4)):1;
  const opt={uS:arc/T256,vS:(y1-y0)/T256};if(hf)opt.hole=(u,v)=>hf(u*arc/216,y0+(y1-y0)*v);
  list.push(uvShift(gridSurface((u,v)=>{const a=a0+(a1-a0)*u;return [cx+Math.cos(a)*r,y0+(y1-y0)*v,cz+Math.sin(a)*r];},Math.max(8,Math.round(arc/7)),nv,opt),y0/T256));};
 const disc=(list,cx,cz,r0,r1,y)=>list.push(gridSurface((u,v)=>{const a=u*TAU,r=r0+(r1-r0)*v;return [cx+Math.cos(a)*r,y,cz+Math.sin(a)*r];},48,1,{uS:TAU*r1/T256,vS:(r1-r0)/T256}));
 // a sector of a hexagonal ring (face k between the inner and outer hexagons) at height y
 const hexSector=(list,k,ri,ro,y)=>{const a0=GATEARC.corner(k,ri),a1=GATEARC.corner(k+1,ri),b0=GATEARC.corner(k,ro),b1=GATEARC.corner(k+1,ro);
  list.push(gridSurface((u,v)=>{const ix=a0[0]+(a1[0]-a0[0])*u,iz=a0[1]+(a1[1]-a0[1])*u,ox=b0[0]+(b1[0]-b0[0])*u,oz=b0[1]+(b1[1]-b0[1])*u;
   return [ix+(ox-ix)*v,y,iz+(oz-iz)*v];},6,3,{uS:ro/T256,vS:(ro-ri)/T256}));};

 // ---- the plinths and the columns -------------------------------------------------------------------------------
 for(const c of P.cols){const pl=c.plinth,top=sheared.get(c.id)||c.y1;
  drum(L.mass,c.x,c.z,pl.r,pl.y0,pl.y1);disc(L.pave,c.x,c.z,c.r,pl.r,pl.y1);
  // the plinth's arcade: 20 dark arches at the waterline
  for(let i=0;i<20;i++){const a=i/20*TAU;kput('gaVoid',[c.x+Math.cos(a)*(pl.r+.15),pl.y1-6,c.z+Math.sin(a)*(pl.r+.15)],qFacing([Math.cos(a),0,Math.sin(a)]),[7,8,.5]);}
  // living-working drums below, between and above the slabs; the dwelling cap from 300 m
  const bands=[[c.y0,D.SLABS[0].y0,'wrk'],[D.SLABS[0].y1,D.SLABS[1].y0,'wrk'],[D.SLABS[1].y1,D.CAP.y0,'wrk'],[D.CAP.y0,D.CAP.y1,'res']];
  // in the ruin the drums are holed (more near a sheared top), with the gutted floors dark behind the holes
  const hf=dd?holeFn(d*.7,7433+c.k,sheared.has(c.id)?top:null,1):null;
  for(const [b0,b1,k] of bands){if(b0>=top)continue;drum(L[k],c.x,c.z,c.r,b0,Math.min(b1,top),0,TAU,hf);if(hf)drum(L.gut,c.x,c.z,c.r-3.5,b0,Math.min(b1,top));}
  if(top>=D.CAP.y1){const cap=P.caps[c.k];let r0=c.r;
   for(const s of cap.steps){disc(L.deck,c.x,c.z,s.r,r0,s.y0);drum(L.res,c.x,c.z,s.r,s.y0,s.y1);r0=s.r;}
   disc(L.deck,c.x,c.z,0,r0,cap.steps[cap.steps.length-1].y1);
   if(cap.heli){const hy=cap.heli.y;disc(L.pave,c.x,c.z,0,cap.heli.r,hy);drum(L.mass,c.x,c.z,cap.heli.r,hy-2,hy);
    for(let i=0;i<6;i++){const a=i/6*TAU;kput('gaCyl',[c.x+Math.cos(a)*18,hy-3,c.z+Math.sin(a)*18],null,[1.6,4,1.6]);}
    for(let i=0;i<24;i++){const a=i/24*TAU;kput('gaBox',[c.x+Math.cos(a)*(cap.heli.r-3),hy+.12,c.z+Math.sin(a)*(cap.heli.r-3)],qFacing([Math.cos(a),0,Math.sin(a)]),[.6,.1,3],new THREE.Color(0xf2c230));}}
   // the caps' gardens: shrubs on the top terraces (the biome plants the rest)
   for(let i=0;i<10;i++){const a=UH(cap.id+i,7)*TAU,r=8+(r0-12)*UH(cap.id+i,8);kput('gaBone',[c.x+Math.cos(a)*r,cap.steps[cap.steps.length-1].y1+1.2,c.z+Math.sin(a)*r],null,[3,2.4,3],new THREE.Color(dd?0x51603a:0x4f7a3a));}}
  else{ // a sheared top: a jagged rim of broken drum, the floors open to the sky
   for(let i=0;i<28;i++){const a=i/28*TAU,h=2+12*UH(c.id+'j'+i,9);kput('gaBox',[c.x+Math.cos(a)*(c.r-1.5),top+h/2,c.z+Math.sin(a)*(c.r-1.5)],qFacing([Math.cos(a),0,Math.sin(a)]),[11,h,3],conc(c.id+'j'+i,.32,.46));}
   disc(L.shade,c.x,c.z,c.core.r,c.r-2,top-3);}
  // the lift and stair core, rising past the cap as a short head
  if(top>=D.CAP.y1)drum(L.mass,c.x,c.z,c.core.r+4,D.CAP.y1,D.CAP.y1+(c.k===D.HELI.col?2:9));}

 // ---- the service piers under the lower slab ---------------------------------------------------------------------
 for(const p of P.piers)kput('gaBox',[p.x,(p.y0+p.y1)/2,p.z],qEuler(0,p.ry,0),[p.w,p.y1-p.y0,p.w],conc(p.id,.58,.72));

 // ---- the topographies --------------------------------------------------------------------------------------------
 // the portals the bridges cut through the skin (when the host hands in the stacks' plan)
 const portals=[];
 if(HO.stacks)for(const b of HO.stacks.bridges)for(const e of [b.a,b.b])if(e.slab)portals.push({slab:e.slab,k:e.k,t:e.t,y:b.y,w:b.w,id:b.id});
 const inPortal=c=>portals.some(p=>p.slab===c.slab&&p.k===c.face&&c.t1>p.t-(p.w/2+3)/P.slabs.find(s=>s.key===c.slab).ro&&c.t0<p.t+(p.w/2+3)/P.slabs.find(s=>s.key===c.slab).ro&&c.y0<p.y+9&&c.y0+c.h>p.y-8);
 for(const s of P.slabs){const ro=s.ro,ri=s.ri,pl=s.plate,hy0=s.y0+pl,hy1=s.y1-pl;
  for(let k=0;k<6;k++){if(slabGone(s.key,k))continue;
   const o0=GATEARC.corner(k,ro),o1=GATEARC.corner(k+1,ro),i0=GATEARC.corner(k,ri),i1=GATEARC.corner(k+1,ri);
   hexSector(L.shade,k,ri,ro,s.y0);hexSector(L.deck,k,ri,ro,s.y1);       // the soffit, the roof garden
   hexSector(L.pave,k,ri,ro-2,hy0);hexSector(L.shade,k,ri,ro-2,hy1);     // the hollow's floor and ceiling
   wall(L.mass,o0[0],o0[1],o1[0],o1[1],s.y0,s.y1);                       // the outer face (behind the cells)
   // the well's wall: solid plates top and bottom, an arcade of 18 m openings onto the hollow between them
   wall(L.mass,i0[0],i0[1],i1[0],i1[1],s.y0,hy0+2);wall(L.mass,i0[0],i0[1],i1[0],i1[1],hy1-2,s.y1);
   const n=3,fl=ri;for(let i=0;i<=n;i++){const t0=(i*(fl/n)-4)/fl,t1=(i*(fl/n)+4)/fl;const a=Math.max(0,t0),b=Math.min(1,t1);
    wall(L.mass,i0[0]+(i1[0]-i0[0])*a,i0[1]+(i1[1]-i0[1])*a,i0[0]+(i1[0]-i0[0])*b,i0[1]+(i1[1]-i0[1])*b,hy0+2,hy1-2,1);}
   if(!dd){const nk=(k*60+30)*Math.PI/180;for(let i=0;i<n;i++){const t=(i+.5)/n,x=i0[0]+(i1[0]-i0[0])*t,z=i0[1]+(i1[1]-i0[1])*t;
    kput('gaGlass',[x,(hy0+hy1)/2,z],qFacing([Math.cos(nk),0,Math.sin(nk)]),[fl/n-8,hy1-hy0-4,.3]);}}}
  // a fallen sector's broken edges: torn plate ends and bent rebar along both radii
  if(RU)for(const g of RU.slabGone)if(g.slab===s.key)for(const kk of [g.face,g.face+1]){const a=GATEARC.corner(kk,1);
   for(let i=0;i<10;i++){const r=ri+(ro-ri)*(i+.5)/10,h=4+8*UH(s.id+kk+'e'+i,11);
    kput('gaBox',[a[0]*r,s.y1-h/2,a[1]*r],qEuler(0,-kk*Math.PI/3,(UH(s.id+kk+'r'+i,12)-.5)*.5),[3,h,(ro-ri)/10],conc(s.id+kk+i,.3,.42));}}}
 // the hollows' public buildings, seen through the arcades
 for(const h of P.halls){if(slabGone(h.slab,Math.floor(((Math.atan2(h.z,h.x)*180/Math.PI+360)%360)/60)))continue;
  if(h.kind==='theatre'){disc(L.mass,h.x,h.z,0,h.w*.9,h.y0+h.h*.6);drum(L.mass,h.x,h.z,h.w*.9,h.y0,h.y0+h.h*.6);}
  else kput('gaBox',[h.x,h.y0+h.h/2,h.z],qEuler(0,h.ry,0),[h.w,h.h,h.d],conc(h.id,.5,.7));}

 // ---- the cells: the residential skin -----------------------------------------------------------------------------
 const QN=[0,1,2,3,4,5].map(k=>{const a=(k*60+30)*Math.PI/180;return qFacing([Math.cos(a),0,Math.sin(a)]);});
 const NRM=[0,1,2,3,4,5].map(k=>{const a=(k*60+30)*Math.PI/180;return [Math.cos(a),Math.sin(a)];});
 const niches=new Map();for(const n of KM.niches){if(!niches.has(n.cell))niches.set(n.cell,[]);niches.get(n.cell).push(n);}
 let nCells=0,nSockets=0,nTombs=0;
 for(const c of P.cells){const s=P.slabs.find(q=>q.key===c.slab);if(slabGone(c.slab,c.face))continue;
  const tm=(c.t0+c.t1)/2,p=GATEARC.facePt(c.face,s.ro,tm,0),N=NRM[c.face],y=c.y0+c.h/2;
  if(inPortal(c)){kput('gaVoid',[p[0]+N[0]*.2,y,p[1]+N[1]*.2],QN[c.face],[c.w,c.h,1]);continue;}
  if(gone.has(c.id)){
   const tomb=niches.get(c.id);
   if(tomb){ // a tomb wall in the socket: rough-laid stone, the niches dark or sealed, an Aurochs skull over some
    kput('gaBox',[p[0]+N[0]*.5,y,p[1]+N[1]*.5],QN[c.face],[c.w-.4,c.h-.4,1],new THREE.Color(0x6c6152));
    for(const n of tomb){const q=GATEARC.facePt(c.face,s.ro,n.t,1.05);
     kput(n.sealed?'gaBone':'gaVoid',[q[0],n.y+n.h/2,q[1]],QN[c.face],[n.w,n.h,.2],n.sealed?new THREE.Color(0xa58a68):null);
     if(n.skull){kput('gaBone',[q[0]+N[0]*.25,n.y+n.h+.55,q[1]+N[1]*.25],QN[c.face],[.55,.5,.45],new THREE.Color(0xe8e0cc));
      const tx=-N[1],tz=N[0];for(const sd of [-1,1])beam('gaBone',[q[0]+N[0]*.3+tx*sd*.25,n.y+n.h+.7,q[1]+N[1]*.3+tz*sd*.25],[q[0]+N[0]*.5+tx*sd*1.05,n.y+n.h+1.25,q[1]+N[1]*.5+tz*sd*1.05],.16,.16,new THREE.Color(0xd8ccb0));}
     nTombs++;}}
   else{kput('gaVoid',[p[0]+N[0]*.15,y,p[1]+N[1]*.15],QN[c.face],[c.w-.3,c.h-.3,.3]);nSockets++;}
   continue;}
  const out=c.out+(c.st===2?2:0),cc=conc(c.id,.55,.78);
  kput('gaBox',[p[0]+N[0]*(out/2-.5),y,p[1]+N[1]*(out/2-.5)],QN[c.face],[c.w-.5,c.h-.5,out+1],cc);
  // windows: one or two per storey on the cell's face, a few lit (the dead ones dark glass)
  for(let sti=0;sti<2;sti++){const lit=!dd&&c.win<.3,ww=c.win<.6?c.w*.55:c.w*.3;
   kput('gaVoid',[p[0]+N[0]*(out+.05),c.y0+1.6+sti*D.STO+.9,p[1]+N[1]*(out+.05)],QN[c.face],[ww,1.9,.12]);}
  // a planted sill on every fourth cell
  if(UH(c.id,13)<.25)kput('gaBone',[p[0]+N[0]*(out+.3),c.y0+.6,p[1]+N[1]*(out+.3)],QN[c.face],[c.w*.8,.9,.9],new THREE.Color(dd?0x4b5a34:0x557d3c));
  nCells++;}

 // ---- the membrane, its ribs and the crown ring ------------------------------------------------------------------
 const M=P.membrane;
 for(const rb of P.ribs){const keep=RU?(RU.ribs.find(x=>x.id===rb.id)||{keep:0}).keep:1;if(!keep)continue;
  const b=[rb.a[0]+(rb.b[0]-rb.a[0])*keep,rb.a[1]+(rb.b[1]-rb.a[1])*keep,rb.a[2]+(rb.b[2]-rb.a[2])*keep];beam('gaBox',rb.a,b,3.2,2.4,conc(rb.id,.7,.8));}
 if(!dd){L.memb.push(gridSurface((u,v)=>{const a=u*TAU,r=M.r0+(M.r1-M.r0)*v,y=M.y0+(M.y1-M.y0)*v-4*Math.sin(Math.PI*v);return [Math.cos(a)*r,y,Math.sin(a)*r];},48,8,{uS:6,vS:1}));
  for(let i=0;i<24;i++){const a=i/24*TAU;kput('gaBox',[Math.cos(a)*M.r1,M.y1,Math.sin(a)*M.r1],qFacing([-Math.sin(a),0,Math.cos(a)]),[1.6,2.2,8.2],conc('ring'+i,.75,.85));}
  kput('gaCyl',[0,(M.y1+D.TOP)/2,0],null,[.9,D.TOP-M.y1,.9],conc('mast',.6,.7));}

 // ---- the pond, its banks and the causeways ---------------------------------------------------------------------
 const pd=P.pond;
 if(HO.pond!==false){
  // on the sheet the ground is a plane at 0, so the water stands 0.4 m over it inside the kerb
  mesh(gridSurface((u,v)=>{const a=u*TAU;return [Math.cos(a)*pd.a*v,.4,Math.sin(a)*pd.b*v];},72,6,{uS:30,vS:8}),MAT.water,G);
  const kerb=[];kerb.push(gridSurface((u,v)=>{const a=u*TAU;return [Math.cos(a)*pd.a,pd.bed+(pd.bank-pd.bed)*v,Math.sin(a)*pd.b];},96,1,{uS:96,vS:1}));
  meshMerged(kerb,dd?MAT.acMassR:MAT.acMass,G);
  kput('gaBox',[pd.weir.x,-.6,pd.weir.z],null,[6,3.6,pd.weir.w],conc('weir',.5,.6));}
 for(const cw of P.causeways){const mx=(cw.from[0]+cw.to[0])/2,mz=(cw.from[2]+cw.to[2])/2,len=cw.r1-cw.r0,q=qFacing([Math.cos(cw.a),0,Math.sin(cw.a)]);
  kput('gaBox',[mx,cw.y-1.4,mz],q,[cw.w,2.8,len],conc(cw.id,.55,.66));
  for(const sd of [-1,1])kput('gaBox',[mx-Math.sin(cw.a)*sd*(cw.w/2-.3),cw.y+.55,mz+Math.cos(cw.a)*sd*(cw.w/2-.3)],q,[.5,1.1,len],conc(cw.id+sd,.5,.6));
  // arches under the causeway every 24 m
  for(let r=cw.r0+12;r<cw.r1-8;r+=24)kput('gaVoid',[Math.cos(cw.a)*r,cw.y-2.6,Math.sin(cw.a)*r],q,[cw.w+.2,2.2,7]);}

 // ---- the ruin: the fallen cap, the heap on the lower roof --------------------------------------------------------
 if(RU){
  for(const f of RU.fallen){const g=gridSurface((u,v)=>{const a=u*TAU;return [Math.cos(a)*f.r,(v-.5)*f.len,Math.sin(a)*f.r];},40,1,{uS:TAU*f.r/T256,vS:f.len/T256});
   const m=new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0,f.yaw,Math.PI/2+f.tilt*.25,'YXZ'));m.setPosition(f.x,f.y-f.r*.35,f.z);g.applyMatrix4(m);L.res.push(g);
   // the drum's broken floors showing at its ends: two dark discs, and rubble round it
   for(let i=0;i<16;i++){const a=UH(f.id+i,14)*TAU,r=f.r*.8+f.len*.5*UH(f.id+i,15);kput('gaBox',[f.x+Math.cos(a)*r,1+2*UH(f.id+i,16),f.z+Math.sin(a)*r],qEuler(UH(f.id+i,17),UH(f.id+i,18)*3,0),[6+8*UH(f.id+i,19),3+4*UH(f.id+i,20),5+8*UH(f.id+i,21)],conc(f.id+i,.3,.44));}}
  for(const h of RU.heap)kput('gaBox',[h.x,h.y+h.h/2,h.z],qEuler(h.tilt,h.ry,h.tilt*.6),[h.w,h.h,h.d],conc(h.id,.3,.46));}

 // ---- the Kimr: skull poles on the funeral road, biers on the lower roof, offerings on the plinths ----------------
 for(const p of KM.poles){kput('gaCyl',[p.x,p.y+p.h/2,p.z],null,[.13,p.h,.13],new THREE.Color(0x5a4630));
  kput('gaBone',[p.x,p.y+p.h+.3,p.z],qEuler(0,UH(p.id,22)*TAU,0),[.6,.55,.85],new THREE.Color(0xe6dcc6));
  const a=UH(p.id,23)*TAU,tx=Math.cos(a),tz=Math.sin(a);
  for(const sd of [-1,1])beam('gaBone',[p.x+tx*sd*.3,p.y+p.h+.45,p.z+tz*sd*.3],[p.x+tx*sd*p.horns*.55,p.y+p.h+.95,p.z+tz*sd*p.horns*.55],.18,.18,new THREE.Color(p.ochre?0xa4522c:0xd6c9ab));}
 for(const b of KM.biers){const q=qEuler(0,b.ry,0);kput('gaBox',[b.x,b.y+.5,b.z],q,[2.4,1,3.2],new THREE.Color(0x6e5a44));
  for(let i=0;i<b.dead;i++)kput('gaBone',[b.x+(i-(b.dead-1)/2)*.9*Math.cos(b.ry),b.y+1.25,b.z-(i-(b.dead-1)/2)*.9*Math.sin(b.ry)],q,[.6,.5,1.9],new THREE.Color(0x8b6f4e));}
 for(const o of KM.offerings)kput(o.kind==='melon'?'gaCyl':'gaBone',[o.x,o.y+.3,o.z],null,o.kind==='melon'?[.45,.6,.45]:[.25,.6,.25],new THREE.Color(o.kind==='melon'?0x7a8a3a:0xd8c49c));

 // ---- merge -------------------------------------------------------------------------------------------------------
 meshMerged(L.wrk,dd?MAT.acWrkR:MAT.acWrk,G);meshMerged(L.res,dd?MAT.acResR:MAT.acRes,G);meshMerged(L.mass,dd?MAT.acMassR:MAT.acMass,G);
 meshMerged(L.deck,dd?MAT.acDeckR:MAT.acDeck,G);meshMerged(L.shade,dd?MAT.acShadeR:MAT.acShade,G);meshMerged(L.pave,dd?MAT.acPaveR:MAT.acPave,G);
 meshMerged(L.gut,MAT.acVoid,G);
 for(const g of L.memb)mesh(g,MAT.gaMemb,G);
 GA_SITE[dd]={x:gx,z:gz,y:Y0,top:D.TOP,cells:nCells,sockets:nSockets,tombs:nTombs,slabs:P.slabs.map(s=>({y0:s.y0,y1:s.y1,ro:s.ro})),cols:P.cols.map(c=>({x:c.x,z:c.z,y1:sheared.get(c.id)||c.y1}))};
 window._gatearc=window._gatearc||{};window._gatearc[dd?'ruin':'intact']={cells:nCells,sockets:nSockets,tombs:nTombs,niches:KM.niches.length,poles:KM.poles.length,stats:P.stats};
 KOFF=[0,0,0];return G;}
