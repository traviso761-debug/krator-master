// ================================================================= THE HALL'S STACKS — the drawing (records in, geometry out)
// buildGatestacks draws the stacks' plan (8av2): the rock from core/terrain's KSTACKS meshes, the Ancients' fittings
// hung on the rock's outline (terraces, galleries, flues, adits and spoil, saucer decks), the bridges, the fall and the
// pools. d = 1 applies GATESTACKS.ruin (a broken span, a cut span, a Kimr rope bridge, a fallen flue).
// The same frame as the Hall (8av1): a target calls it at the Hall's site; GATEARC.host.y lifts both onto a host's ground.
// The fall and the pools are drawn here with the kit's water material for the sheet; a world host (biomes/labyrinth) draws
// them on core/water from the plan's falls and pools and passes GATESTACKS.host = {water: false}.
const GS_SITE={};
GATESTACKS.host=GATESTACKS.host||{water:true};
// the rock: the kit's rock, re-toned to the Labyrinth's grey-buff dome rock; vertex colours carry KSTACKS' occlusion
MAT.gsRock=new THREE.MeshStandardMaterial({map:TEX.concrete,color:0xa49a88,roughness:1,metalness:0,side:DS,vertexColors:true});
MAT.gsGreen=new THREE.MeshStandardMaterial({color:0x5d7a3e,roughness:1,metalness:0,side:DS});
MAT.gsFall=new THREE.MeshStandardMaterial({color:0xe8f0f2,roughness:.3,metalness:0,transparent:true,opacity:.62,side:DS,depthWrite:false});
kdef('gsBox',new THREE.BoxGeometry(1,1,1),MAT.acKit);
kdef('gsCone',new THREE.ConeGeometry(1,1,12),MAT.mud);
kdef('gsDisc',new THREE.CylinderGeometry(1,1,1,40),MAT.acKit);

function buildGatestacks(scene,gx,gz,d){reseed(7451+d);
 const Y0=(GATEARC.host&&GATEARC.host.y)||0;KOFF=[gx,Y0,gz];
 const dd=d>0?1:0,H=GATEARC.plan(),P=GATESTACKS.plan({hall:H,ground:GATESTACKS.host.ground}),RU=dd?GATESTACKS.ruin(P):null;
 const UH=(id,salt)=>{let h=7451^salt;for(let i=0;i<id.length;i++)h=KRAND.hash(h,id.charCodeAt(i));return KRAND.unit(h);};
 const conc=(id,lo,hi)=>new THREE.Color().setHSL(.09+.03*UH(id,1),.05+.05*UH(id,2),(dd?lo*.65:lo)+(hi-lo)*UH(id,3));
 const G=new THREE.Group();G.position.set(gx,Y0,gz);scene.add(G);
 const gone=new Set(RU?RU.gone:[]);

 // ---- core/tags first ---------------------------------------------------------------------------------------------
 {const T=KTAGS.gatearc||(KTAGS.gatearc=KTAGS.create({build:'ancients-gatearc'}));const pre=(dd?'ruin':'intact')+'/',W=a=>[a[0]+gx,a[1]+Y0,a[2]+gz];
  const B=T.add({id:pre+P.id,'class':'landmark',kind:'stacks',key:'ancients:gatestacks',name:'The Hall\'s stacks',at:[gx,Y0,gz],
   tags:{culture:'ancient',types:['industry','farm','infrastructure'],state:dd?'ruined':'intact'}});
  for(const S of P.stacks)T.child(B.id,{'class':'feature',kind:'stack',key:S.id,name:S.name,at:W([S.x,S.y0,S.z]),r:S.R,h:S.top-S.y0,tags:{role:S.role,variant:S.kind}});
  for(const f of P.fittings)if(!gone.has(f.id))T.child(B.id,{'class':'part',kind:f.kind,key:f.id,at:W([f.x||0,f.y||0,f.z||0]),tags:f.tags});
  for(const b of P.bridges)T.child(B.id,{'class':'infrastructure',kind:'bridge',key:b.id,at:W([b.a.x,b.y,b.a.z]),tags:{role:'bridge',variant:RU&&RU.rope.some(r=>r.id===b.id)?'rope':'girder'}});}
 for(const S of P.stacks)REGISTER({name:'The Hall\'s stacks — '+S.name,x:S.x,z:S.z,r:S.R,y:S.y0,h:S.top-S.y0});
 for(const b of P.bridges)REGISTER({name:'The Hall\'s stacks — bridge '+b.key+(RU&&RU.rope.some(r=>r.id===b.id)?' (a Kimr rope bridge)':''),x:(b.a.x+b.b.x)/2,z:(b.a.z+b.b.z)/2,r:Math.max(14,b.span/2),y:b.y-8,h:12});

 // ---- the rock --------------------------------------------------------------------------------------------------
 let rockTris=0;
 for(const S of P.stacks){const m=KSTACKS.mesh(S,{step:S.kind==='spire'?4:6}),n=m.pos.length/3;
  const g=new THREE.BufferGeometry(),pos=new Float32Array(n*3),col=new Float32Array(n*3),uv=new Float32Array(n*2);
  for(let i=0;i<n;i++){pos[3*i]=m.pos[3*i]-0;pos[3*i+1]=m.pos[3*i+1];pos[3*i+2]=m.pos[3*i+2];
   const o=1-.32*(m.occ?m.occ[i]:0),top=m.part&&m.part[i]===1;col[3*i]=o*(top?.92:1);col[3*i+1]=o*(top?.96:1);col[3*i+2]=o*(top?.86:1);
   uv[2*i]=m.uv[2*i]/16;uv[2*i+1]=m.uv[2*i+1]/16;}
  g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
  g.setIndex(m.pos.length/3>65535?new THREE.BufferAttribute(new Uint32Array(m.idx),1):new THREE.BufferAttribute(new Uint16Array(m.idx),1));g.computeVertexNormals();
  mesh(g,MAT.gsRock,G);rockTris+=m.idx.length/3;}

 // ---- the fittings ----------------------------------------------------------------------------------------------
 const GRN=[],DECK=[],FALL=[],WAT=[];
 const ringFan=(list,ring,y,cx,cz)=>{const pts=ring.map(p=>[p[0],y,p[1]]),pos=[],idx=[];pos.push(cx,y,cz);for(const p of pts)pos.push(p[0],p[1],p[2]);
  for(let i=0;i<pts.length;i++)idx.push(0,1+i,1+(i+1)%pts.length);const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(pos.filter((_,i)=>i%3!==1).map(v=>v/16),2));g.setIndex(idx);g.computeVertexNormals();list.push(g);};
 const ringBand=(list,outer,inner,y)=>{const n=outer.length,pos=[],idx=[];for(let i=0;i<n;i++){pos.push(outer[i][0],y,outer[i][1],inner[i][0],y,inner[i][1]);}
  for(let i=0;i<n;i++){const a=2*i,b=2*((i+1)%n);idx.push(a,b,a+1,a+1,b,b+1);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(pos.filter((_,i)=>i%3!==1).map(v=>v/16),2));g.setIndex(idx);g.computeVertexNormals();list.push(g);};
 for(const f of P.fittings){if(gone.has(f.id))continue;
  if(f.kind==='terrace'){const S=P.stacks.find(s=>s.key===f.stack);
   if(f.inner)ringBand(GRN,f.outer,f.inner,f.y+.25);else ringFan(GRN,f.outer,f.y+.25,S.x,S.z);
   // a low parapet round the terrace's lip, and its planting beds (the biome plants the rest)
   for(let i=0;i<f.outer.length;i++){const a=f.outer[i],b=f.outer[(i+1)%f.outer.length],mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2,ln=Math.hypot(b[0]-a[0],b[1]-a[1]);
    kput('gsBox',[mx,f.y+.9,mz],qFacing([b[1]-a[1],0,a[0]-b[0]]),[ln,1.3,.6],conc(f.id+i,.55,.66));
    if(UH(f.id+i,4)<.5)kput('gsBox',[mx+(S.x-mx)*.08,f.y+.9,mz+(S.z-mz)*.08],null,[3+2*UH(f.id+i,5),1.6,3],new THREE.Color(dd?0x485832:0x4e7238));}}
  else if(f.kind==='gallery'){const q=qFacing([f.nx,0,f.nz]);
   // the cut: a dark slot into the rock, a concrete lintel and sill deck proud of the face, glazing when intact
   kput('gaVoid',[f.x-f.nx*1.5,f.y+f.h/2,f.z-f.nz*1.5],q,[f.w,f.h,5]);
   kput('gsBox',[f.x+f.nx*.6,f.y+f.h+.8,f.z+f.nz*.6],q,[f.w+2,1.6,4],conc(f.id,.6,.72));
   kput('gsBox',[f.x+f.nx*1.6,f.y-.4,f.z+f.nz*1.6],q,[f.w+1,.8,4.4],conc(f.id+'s',.55,.66));
   if(f.planted)for(let i=0;i<3;i++)kput('gsBox',[f.x+f.nx*2.4+(i-1)*f.nz*f.w*.3,f.y+.6,f.z+f.nz*2.4-(i-1)*f.nx*f.w*.3],q,[f.w*.28,1.4,1.4],new THREE.Color(dd?0x4a5c34:0x4f763a));
   if(f.glow&&!dd)kput('gaGlass',[f.x+f.nx*.2,f.y+f.h/2,f.z+f.nz*.2],q,[f.w-1,f.h-1,.2]);
   if(!dd&&!f.glow&&f.planted)kput('gaGlass',[f.x+f.nx*.1,f.y+f.h/2,f.z+f.nz*.1],q,[f.w-1,f.h-1,.2]);}
  else if(f.kind==='chimney'){kput('gaCyl',[f.x,f.y+f.h/2-4,f.z],null,[f.r,f.h+8,f.r],conc(f.id,.38,.5));kput('gaVoid',[f.x,f.y+f.h+3.9,f.z],null,[f.r*1.2,.3,f.r*1.2]);}
  else if(f.kind==='incline'){beam('gsBox',f.a,f.b,1.6,f.w,conc(f.id,.5,.6));
   for(let i=1;i<6;i++){const t=i/6,x=f.a[0]+(f.b[0]-f.a[0])*t,z=f.a[2]+(f.b[2]-f.a[2])*t,y=f.a[1]+(f.b[1]-f.a[1])*t;kput('gsBox',[x,y/2,z],null,[2.4,y,2.4],conc(f.id+i,.48,.58));}}
  else if(f.kind==='adit'){const q=qFacing([f.nx,0,f.nz]);kput('gaVoid',[f.x-f.nx,f.y+f.h/2,f.z-f.nz],q,[f.w,f.h,4]);
   kput('gsBox',[f.x+f.nx*.4,f.y+f.h+.5,f.z+f.nz*.4],q,[f.w+1.6,1,1.4],new THREE.Color(0x5b4632));
   for(const sd of [-1,1])kput('gsBox',[f.x+f.nx*.4+f.nz*sd*(f.w/2+.4),f.y+f.h/2,f.z+f.nz*.4-f.nx*sd*(f.w/2+.4)],q,[.8,f.h,1],new THREE.Color(0x5b4632));}
  else if(f.kind==='spoil')kput('gsCone',[f.x,f.y+f.h/2-1,f.z],qEuler(0,UH(f.id,6)*TAU,0),[f.r,f.h+2,f.r*.8]);
  else if(f.kind==='saucer'){const tilt=dd&&f.id==='stacks.S3.saucer.1'?.06:0,q=qEuler(tilt,0,tilt*.5);
   // a dish under the deck, the deck, a glazed pavilion ring set in from the rim, and its roof (reference 3)
   kput('gsCone',[f.x,f.y-5,f.z],qEuler(Math.PI+tilt,0,0),[f.r,8,f.r],conc(f.id,.55,.64));
   kput('gsDisc',[f.x,f.y,f.z],q,[f.r,1.6,f.r],conc(f.id+'d',.62,.72));
   if(!dd)kput('gaGlass',[f.x,f.y+f.rim/2+.8,f.z],q,[f.r*1.36,f.rim,f.r*1.36]);
   else kput('gaVoid',[f.x,f.y+f.rim/2+.8,f.z],q,[f.r*1.3,f.rim,f.r*1.3]);
   kput('gsDisc',[f.x,f.y+f.rim+1.4,f.z],q,[f.r*.74,1.2,f.r*.74],conc(f.id+'r',.6,.7));
   kput('gsBox',[f.x,f.y+f.rim+2.3,f.z],q,[f.r*.9,.6,f.r*.9],new THREE.Color(dd?0x4a5c34:0x557d3c));}}

 // ---- the bridges -------------------------------------------------------------------------------------------------
 for(const b of P.bridges){const ax=b.a.x,az=b.a.z,bx=b.b.x,bz=b.b.z,len=Math.hypot(bx-ax,bz-az),ux=(bx-ax)/len,uz=(bz-az)/len,q=qFacing([ux,0,uz]);
  const rope=RU&&RU.rope.some(r=>r.id===b.id),brk=RU&&RU.broken.find(r=>r.id===b.id),cut=RU&&RU.cut.find(r=>r.id===b.id);
  if(rope){ // the Kimr's rope bridge: planks on a sagging line between the two faces, two hand ropes
   const fa=b.a.face,fb=b.b.face,fl=Math.hypot(fb[0]-fa[0],fb[1]-fa[1]),n=Math.floor(fl/1.4),sag=fl*.06;
   for(let i=0;i<=n;i++){const t=i/n,x=fa[0]+(fb[0]-fa[0])*t,z=fa[1]+(fb[1]-fa[1])*t,y=b.y-sag*4*t*(1-t);
    kput('gsBox',[x,y,z],q,[2.2,.18,.5],new THREE.Color(0x6a5238));}
   for(const sd of [-1,1]){let prev=null;for(let i=0;i<=24;i++){const t=i/24,x=fa[0]+(fb[0]-fa[0])*t-uz*sd*1.1,z=fa[1]+(fb[1]-fa[1])*t+ux*sd*1.1,y=b.y+1.1-sag*4*t*(1-t);
    const p=[x,y,z];if(prev)beam('gsBox',prev,p,.08,.08,new THREE.Color(0x8a7050));prev=p;}}
   continue;}
  const segs=[];if(brk)segs.push([0,brk.gap[0]],[brk.gap[1],1]);else if(cut)segs.push(cut.from==='b'?[1-cut.keep,1]:[0,cut.keep]);else segs.push([0,1]);
  for(const [t0,t1] of segs){const L2=(t1-t0)*len,mx=ax+ux*len*(t0+t1)/2,mz=az+uz*len*(t0+t1)/2;
   kput('gsBox',[mx,b.y-b.depth/2,mz],q,[b.w,b.depth,L2],conc(b.id+t0,.6,.72));
   for(const sd of [-1,1])kput('gsBox',[mx-uz*sd*(b.w/2-.3),b.y+.7,mz+ux*sd*(b.w/2-.3)],q,[.5,1.4,L2],conc(b.id+sd,.55,.66));
   // a broken end: torn deck plates hanging
   if(brk||cut){const tEnd=brk?(t0===0?t1:t0):(cut.from==='b'?t0:t1),ex=ax+ux*len*tEnd,ez=az+uz*len*tEnd;
    for(let i=0;i<5;i++)kput('gsBox',[ex+(UH(b.id+i,7)-.5)*b.w*.8*uz,b.y-b.depth-2-4*UH(b.id+i,8),ez-(UH(b.id+i,7)-.5)*b.w*.8*ux],qEuler(.6*UH(b.id+i,9),0,.4),[2.2,6+5*UH(b.id+i,10),.5],conc(b.id+i,.35,.45));}}
  for(const p of b.piers){const tp=((p.x-ax)*ux+(p.z-az)*uz)/len;if(!segs.some(s=>tp>=s[0]-.02&&tp<=s[1]+.02))continue;
   kput('gsBox',[p.x,(p.y0+p.y1)/2,p.z],q,[p.w,p.y1-p.y0,p.w*1.4],conc(p.id,.55,.68));
   kput('gsBox',[p.x,p.y1-1.5,p.z],q,[b.w+3,3,p.w*1.8],conc(p.id+'c',.6,.7));}}
 for(const c of P.causeways){const dx=c.to[0]-c.from[0],dz=c.to[2]-c.from[2],L2=Math.hypot(dx,dz),q=qFacing([dx,0,dz]);
  kput('gsBox',[(c.from[0]+c.to[0])/2,c.from[1]-1.4,(c.from[2]+c.to[2])/2],q,[c.w,2.8,L2],conc(c.id,.55,.66));}

 // ---- water: the fall and the pools (the sheet; a world draws them on core/water) -------------------------------
 if(GATESTACKS.host.water!==false){
  for(const f of P.falls){const tx=-f.nz,tz=f.nx,top=f.y0,bot=f.y1;
   FALL.push(gridSurface((u,v)=>{const y=top+(bot-top)*v,o=2+8*v*v;return [f.x+tx*(u-.5)*f.w*(1+.6*v)+f.nx*o,y,f.z+tz*(u-.5)*f.w*(1+.6*v)+f.nz*o];},4,24,{uS:1,vS:10}));}
  for(const p of P.pools)WAT.push(gridSurface((u,v)=>{const a=u*TAU;return [p.x+Math.cos(a)*p.r*v,p.level+.05,p.z+Math.sin(a)*p.r*v];},40,3,{uS:6,vS:3}));}
 meshMerged(GRN,MAT.gsGreen,G);for(const g of FALL)mesh(g,MAT.gsFall,G);meshMerged(WAT,MAT.water,G);
 GS_SITE[dd]={x:gx,z:gz,y:Y0,stacks:P.stacks.map(S=>({key:S.key,x:S.x,z:S.z,top:S.top,R:S.R})),bridges:P.bridges.map(b=>({key:b.key,a:[b.a.x,b.y,b.a.z],b:[b.b.x,b.y,b.b.z]})),
  saucers:P.fittings.filter(f=>f.kind==='saucer').map(f=>({x:f.x,y:f.y,z:f.z,r:f.r}))};
 window._gatestacks=window._gatestacks||{};window._gatestacks[dd?'ruin':'intact']={rockTris:rockTris,stats:P.stats};
 KOFF=[0,0,0];return G;}
