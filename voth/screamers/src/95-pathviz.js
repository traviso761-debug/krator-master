// ================================================================= PATH TRACKER
// Shows what the life layer is actually doing. Two overlays, toggled from the
// tools panel:
//
//   routes  the fixed geometry every agent is bound to -- shuttle legs, the
//           wall circuit, guard posts, and the arriving party's whole itinerary
//           -- colour-coded by population.
//   tracks  a rolling trail behind each agent, sampled a few times a second,
//           which is what tells you whether they are going where you think.
//
// One LineSegments for each, rebuilt in place, so the overlay costs two draw
// calls whether there are ten agents or a thousand.
reseed(9495);
(function(){
 const box=document.getElementById('tools');
 if(!box||typeof window._life==='undefined'||!window._life)return;
 const A=window._life.agents,N=A.length;
 const BST=window._toolBtnStyle||'';
 const ON=';background:rgba(255,179,71,.30);border-color:#ffb347';
 const mk=t=>{const b=document.createElement('button');b.textContent=t;b.style.cssText=BST;
  box.insertBefore(b,box.lastChild);return b;};
 const bR=mk('Routes'),bT=mk('Tracks');

 const COL={shuttle:0x7fe0a0,patrol:0xff7f7f,post:0xffb347,party:0xd76f9c};
 const mat=new THREE.LineBasicMaterial({vertexColors:true,fog:false,depthTest:false});
 const routeG=new THREE.BufferGeometry(),trackG=new THREE.BufferGeometry();
 const routes=new THREE.LineSegments(routeG,mat),tracks=new THREE.LineSegments(trackG,mat);
 [routes,tracks].forEach(o=>{o.renderOrder=998;o.userData.probeSkip=true;
  o.visible=false;scene.add(o);});

 // ---- the fixed routes ------------------------------------------------------
 {const P=[],C=[],c=new THREE.Color();
  const seg=(a,b,k)=>{c.setHex(COL[k]);
   P.push(a[0],a[1],a[2],b[0],b[1],b[2]);
   C.push(c.r,c.g,c.b,c.r,c.g,c.b);};
  for(const ag of A){
   if(ag.kind==='shuttle')seg(ag.a,ag.b,'shuttle');
   else if(ag.kind==='post'){
    let pv=null;
    for(let i=0;i<=16;i++){const th=i/16*TAU;
     const p=[ag.c[0]+Math.cos(th)*ag.r,ag.c[1],ag.c[2]+Math.sin(th)*ag.r];
     if(pv)seg(pv,p,'post');pv=p;}}
   else if(ag.kind==='party'){
    if(ag.role==='escort')seg(ag.PEN,ag.LOB,'party');
    else{seg(ag.OUT,ag.GT,'party');seg(ag.GT,ag.PEN,'party');
     if(ag.role==='captive')seg(ag.PEN,ag.LOB,'party');}}}
  // the patrol circuit once, not once per patrol
  const pat=A.find(a=>a.kind==='patrol');
  if(pat)for(let i=0;i<pat.loop.length;i++)
   seg(pat.loop[i],pat.loop[(i+1)%pat.loop.length],'patrol');
  routeG.setAttribute('position',new THREE.Float32BufferAttribute(P,3));
  routeG.setAttribute('color',new THREE.Float32BufferAttribute(C,3));}

 // ---- the rolling tracks ----------------------------------------------------
 const T=34,SAMPLE=.18;
 const hist=new Float32Array(N*T*3);let filled=0,head=0,acc=0;
 const tp=new Float32Array(N*(T-1)*2*3),tc=new Float32Array(N*(T-1)*2*3);
 {const c=new THREE.Color();
  for(let i=0;i<N;i++){c.setHex(COL[A[i].kind]||0xffffff);
   for(let j=0;j<(T-1)*2;j++){const o=(i*(T-1)*2+j)*3;
    tc[o]=c.r;tc[o+1]=c.g;tc[o+2]=c.b;}}}
 trackG.setAttribute('position',new THREE.BufferAttribute(tp,3));
 trackG.setAttribute('color',new THREE.BufferAttribute(tc,3));
 trackG.setDrawRange(0,0);

 const M=new THREE.Matrix4(),V=new THREE.Vector3();
 tick(dt=>{
  if(!tracks.visible)return;
  acc+=dt;if(acc<SAMPLE)return;acc=0;
  for(let i=0;i<N;i++){window._life.bodies.getMatrixAt(i,M);
   V.setFromMatrixPosition(M);const o=(i*T+head)*3;
   hist[o]=V.x;hist[o+1]=V.y;hist[o+2]=V.z;}
  head=(head+1)%T;if(filled<T)filled++;
  let n=0;
  for(let i=0;i<N;i++)for(let j=0;j<filled-1;j++){
   const a=(i*T+(head-filled+j+T*2)%T)*3,b=(i*T+(head-filled+j+1+T*2)%T)*3;
   // an agent that was hidden parks at y=-9999; do not draw the jump
   if(hist[a+1]<-5000||hist[b+1]<-5000)continue;
   tp[n*3]=hist[a];tp[n*3+1]=hist[a+1];tp[n*3+2]=hist[a+2];n++;
   tp[n*3]=hist[b];tp[n*3+1]=hist[b+1];tp[n*3+2]=hist[b+2];n++;}
  trackG.setDrawRange(0,n);
  trackG.attributes.position.needsUpdate=true;});

 const sync=()=>{bR.style.cssText=BST+(routes.visible?ON:'');
  bT.style.cssText=BST+(tracks.visible?ON:'');
  insp.textContent='tracker: routes '+(routes.visible?'on':'off')
   +' · tracks '+(tracks.visible?'on':'off')+'\n'
   +N+' agents — green shuttle, red patrol, amber post, pink party';};
 bR.onclick=()=>{routes.visible=!routes.visible;sync();};
 bT.onclick=()=>{tracks.visible=!tracks.visible;if(!tracks.visible){filled=0;head=0;}sync();};
 window._tracker={routes:routes,tracks:tracks};
})();
