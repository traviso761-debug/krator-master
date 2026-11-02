// ================================================================= METROPOLIS — the interiors: on demand  [draw]
// A storey is drawn only when asked for: MP.openStorey(key, k, x, z) makes one storey's slab, ceiling, partitions, shafts and furniture from its plan (41), in a
// group of its own, and MP.closeStorey puts it away. Nothing here runs for a tower out of range. At most three stay open (MP.LIVE): the player's and the two either side.
// The furniture is the catalog's, by AI.furnishPlan in the culture `ancient`, its templates shared between like rooms.
MP.LIVE=3;MP.open=[];
MP.furnishCat=null;
MP.furnish=function(F,st){const AI=KratorAncientsInteriors;if(!MP.furnishCat)MP.furnishCat=KratorInteriors.runtimeAdapter(KratorFurniture,KratorFurniture.batch());
 return AI.furnishPlan({type:F.id,furnish:true,culture:'ancient',buildings:[{storeys:[st]}]},MP.furnishCat,{cultures:['ancient','generic'],seed:MP.idHash(F.id)&0xffff});};
MP.drawStorey=function(F,k){const st=MP.storey(F,k),L=F.levels[k],B=MP.builder(),g=new THREE.Group(),M=MP.mats(),round=F.core.kind==='round',WH=L.h-.3,T=.14;
 g.name=F.id+'.storey.'+k;
 // the partitions: a polyline, gapped at its door, with a lintel over the gap
 const seg=(a,b,y0,y1,c)=>{const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz);if(l<.04)return;const nx=-dz/l*T/2,nz=dx/l*T/2,cl={col:c,uv:2},P=(q,s,y)=>[q[0]+nx*s,y,q[1]+nz*s];
  B.quad('white',P(a,1,y0),P(b,1,y0),P(b,1,y1),P(a,1,y1),[-dz/l,0,dx/l],cl);B.quad('white',P(b,-1,y0),P(a,-1,y0),P(a,-1,y1),P(b,-1,y1),[dz/l,0,-dx/l],cl);B.quad('white',P(a,1,y1),P(b,1,y1),P(b,-1,y1),P(a,-1,y1),[0,1,0],cl);};
 const WALL=[.84,.85,.84],y0=L.y+.02,y1=L.y+WH,DH=2.15;
 st.walls.forEach(function(W){if(!W.pts)return;const P=W.pts,d=W.door;let done=false;
  for(let i=0;i+1<P.length;i++){const a=P[i],b=P[i+1],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,t=d?((d.at[0]-a[0])*dx+(d.at[1]-a[1])*dz)/(l*l):-1,off=d?Math.abs((d.at[0]-a[0])*dz-(d.at[1]-a[1])*dx)/l:9;
   if(d&&!done&&t>=-.05&&t<=1.05&&off<.5){done=true;const hw=d.w/2/l,p=(f)=>[a[0]+dx*f,a[1]+dz*f],t0=Math.max(0,t-hw),t1=Math.min(1,t+hw);seg(a,p(t0),y0,y1,WALL);seg(p(t1),b,y0,y1,WALL);seg(p(t0),p(t1),y0+DH,y1,WALL);}
   else seg(a,b,y0,y1,WALL);}});
 // the slab and the ceiling
 const shape=new THREE.Shape(st.outline.map(p=>new THREE.Vector2(p[0],-p[1]))),sl=new THREE.ExtrudeGeometry(shape,{depth:.22,bevelEnabled:false,curveSegments:1});sl.rotateX(-Math.PI/2);
 const fl=new THREE.Mesh(sl,M.slab);fl.position.y=L.y-.22;g.add(fl);const ce=new THREE.Mesh(sl,M.slab);ce.position.y=L.y+L.h-.26;g.add(ce);
 // the skin's inner face, where the outside's one-sided strips do not show: spandrel and head, and a dado of the core
 if(round){const R=MP.skinR(F,L)+.1,N=st.facade.ring.length;B.lathe('white',[[R,L.y+L.h],[R,L.y+2.5],],N,{flip:false});B.lathe('white',[[R,L.y+.9],[R,L.y]],N,{flip:false});
  const r=MP.coreR(F,k),ca=st.rooms.filter(R0=>/\.core$/.test(R0.id))[0],da=ca&&ca.doors[0]?Math.atan2(ca.doors[0].at[1],ca.doors[0].at[0]):0;
  B.lathe('concrete',[[r,L.y+L.h],[r,L.y]],36,{skip:(t)=>{let d=Math.abs(t-((da+6.2832)%6.2832));d=Math.min(d,6.2832-d);return d<.16;}});
  B.lathe('concrete',[[r-.25,L.y],[r-.25,L.y+L.h]],36,{});}
 else{const hw=F.footprint.w/2-.1,hd=F.footprint.d/2-.1;B.quad('relief',[hw,L.y,-hd],[hw,L.y,hd],[hw,L.y+L.h,hd],[hw,L.y+L.h,-hd],[-1,0,0],{uv:6});B.quad('relief',[-hw,L.y,hd],[-hw,L.y,-hd],[-hw,L.y+L.h,-hd],[-hw,L.y+L.h,hd],[1,0,0],{uv:6});
  [1,-1].forEach(s=>{const z=s*hd;const q=(a,b)=>s>0?B.quad('white',[hw,a,z],[-hw,a,z],[-hw,b,z],[hw,b,z],[0,0,-1]):B.quad('white',[-hw,a,z],[hw,a,z],[hw,b,z],[-hw,b,z],[0,0,1]);q(L.y,L.y+.9);q(L.y+2.5,L.y+L.h);});}
 // the shafts: a lift's car door, a stair's first flight, each where the record says on every storey
 F.core.shafts.forEach(function(s){if(k<s.from||k>s.to)return;const c=s.kind==='lift'?[.4,.42,.44]:[.6,.6,.58];
  [[s.x-s.w/2,s.z-s.d/2,s.x+s.w/2,s.z-s.d/2],[s.x+s.w/2,s.z-s.d/2,s.x+s.w/2,s.z+s.d/2],[s.x+s.w/2,s.z+s.d/2,s.x-s.w/2,s.z+s.d/2],[s.x-s.w/2,s.z+s.d/2,s.x-s.w/2,s.z-s.d/2]].forEach(e=>seg([e[0],e[1]],[e[2],e[3]],y0,L.y+L.h-.26,c));
  if(s.kind==='stair'){const n=10;for(let i=0;i<n;i++)B.panel(s.x-s.w*.25,L.y+.09+i*.18,s.z-s.d/2+.3+i*(s.d-.6)/n,0,s.w*.45,.18,(s.d-.6)/n,[.55,.55,.53]);}});
 const G=B.finish(F,'storey'+k);G.children.forEach(m=>g.add(m.clone()));
 // the furniture
 const out=MP.furnish(F,st);let pieces=0;
 if(out.rooms){const Bf=KratorFurniture.batch({indexed:true});out.rooms.forEach(r=>r.placements.forEach(p=>{Bf.place(p.key,p.x,p.y,p.z,p.ry,{variant:p.variant|0,seed:MP.idHash(p.room||'r')&0xffff,wealth:.6,setting:'indoor'});pieces++;}));
  const fg=Bf.flush(g);if(fg)fg.traverse(o=>{if(o.isMesh)KFURN.linearColours(o.geometry);});}
 let tris=0;g.traverse(o=>{if(o.isMesh&&o.geometry){const c=o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count;tris+=c/3*(o.isInstancedMesh?o.count:1);}});
 g.userData={storey:k,rooms:st.rooms.length,pieces:pieces,tris:Math.round(tris),plan:st,furnished:out};return g;};
MP.openStorey=function(key,k,x,z){const F=MP.FAMILY[key];if(MP.open.some(o=>o.key===key&&o.k===k))return;
 const g=MP.drawStorey(F,k);g.position.set(x,0,z);scene.add(g);MP.open.push({key,k,g});while(MP.open.length>MP.LIVE)MP.closeOne();};
MP.closeOne=function(){const o=MP.open.shift();if(!o)return;scene.remove(o.g);o.g.traverse(m=>{if(m.geometry&&!m.isInstancedMesh)m.geometry.dispose();});};
MP.closeStoreys=function(){while(MP.open.length)MP.closeOne();};
