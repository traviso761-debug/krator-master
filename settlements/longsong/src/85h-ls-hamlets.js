// ================================================================= LONGSONG — the valley's lay villages (the drawing)
// [draw] core/hamlet's villages (40h: LS.HAMLETS.make, here on the page's terrainH and waterH and the Xanadu kit's boxes),
// drawn from their records: each building registered in core/tags first, then drawn as the Xanadu building kit's own
// (settlements/xanadu, sealed as XAK by settlements/xanadu/kit_bundle.py, its library maps bound from the pack the page
// carries: 44c): each def built once per variant and footing depth at the origin (XAK.proto), flattened to one geometry
// per material (isleFlatten, settlements/isle-demo/src/58-isle-protos.js, read in place), and every copy in a village
// merged by material into one mesh, so a village is a few dozen draws. A building stands on the highest ground under its
// footprint (the kit's fw x fd: the house, not its yard) over a stone footing as deep as the slope falls, as the kit page
// sites one on a hill. The square (core/hamlet's green) and the lanes are packed earth on the ground as drawn, a
// chorten in the square's middle. The kit's pending keys (core/hamlet's `xanadu` row: the pens, the corral, the dairy) are this
// page's: the pens and the corral drystone rings, the dairy a whitewashed house. The walker
// cannot walk through the buildings (core/walk blocks), and the flora roots off the plots and lanes (BIO's obstacles).
const LSHAMLETS=(function(){const O={villages:[],buildings:0,people:0,errors:[],protos:0,meshes:0,tris:0,pending:0,bound:0,glows:[],rotors:0};
 if(!LS.HAMLETS||typeof KHAMLET==='undefined'||typeof XAK==='undefined'||typeof isleFlatten==='undefined')return O;
 const KD=XAK.dims(),dims=k=>{const d=KD[k];return d?{w:d.w,d:d.d,h:d.h}:null;};
 try{const b=XAK.bind(typeof KMAT!=='undefined'?KMAT:null);O.bound=b?Object.keys(b).filter(k=>b[k]).length:0;}catch(e){O.errors.push('the kit\'s library maps: '+e.message);}
 const H=LS.HAMLETS.make(terrainH,waterH,dims),ROT=[];
 const WHITE=0xf0ebe0,BAND=LSP.maroon,STONE=0xb8b0a0,EARTH=0x9a8a6c,SQUARE=0xa89a7c,FOOT=0x8f8676;
 // the footprint's corners and centre: [x, z] in the world for the record r turned by ry, w x d about its centre
 const pts=(r,w,d)=>{const c=Math.cos(r.ry),s=Math.sin(r.ry);return [[-1,-1],[1,-1],[1,1],[-1,1],[0,0]].map(([u,v])=>[r.x+u*w/2*c+v*d/2*s,r.z-u*w/2*s+v*d/2*c]);};
 const front=(r,u)=>{const c=Math.cos(r.ry),s=Math.sin(r.ry);return [r.x+u*c+s*(r.d/2+.04),r.z-u*s+c*(r.d/2+.04)];};
 const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;};
 // ---------------------------------------------------------------- the kit's buildings: protos, flattened once each
 const PROTOS={};
 function proto(key,v,drop){const id=key+'#'+v+'@'+drop;if(id in PROTOS)return PROTOS[id];
  const G=XAK.proto(key,v,{drop,footC:FOOT,rotor:key==='xa_windmill'?false:undefined});   // (the windmill's rotors turn: drawn below)let parts=null;
  if(G){parts=isleFlatten(G);O.protos++;}else O.errors.push('the kit could not build '+key+' (variant '+v+')');
  return (PROTOS[id]=parts);}
 // ---------------------------------------------------------------- the page's own: the pending keys
 function house(r,y,o){o=o||{};const h=r.h,ry=r.ry,s=Math.sin(ry),c=Math.cos(ry);
  ARCH.box('ashlar',r.x,y-1.2,r.z,r.w+.4,1.2+.35,r.d+.4,{ry,col:STONE,top:false});
  const yb=y+.35;ARCH.box('wall',r.x,yb,r.z,r.w,h-.35,r.d,{ry,col:WHITE,batter:.25,topCol:0x8a8070});
  ARCH.box('twig',r.x,yb+h-.35-.75,r.z,r.w+.06,.5,r.d+.06,{ry,col:BAND,top:false,bottom:false});
  const [dx,dz]=front(r,0);lsDoor(dx,yb,dz,s,c,1.2,2.1,{curtain:o.curtain||LSP.saffron});}
 function ring(r,hgt){const c=Math.cos(r.ry),s=Math.sin(r.ry),P=(u,v)=>[r.x+u*c+v*s,r.z-u*s+v*c];
  for(const [u0,v0,u1,v1] of [[-1,-1,1,-1],[1,-1,1,1],[1,1,-1,1],[-1,1,-1,-1]]){const n=Math.max(1,Math.round(Math.hypot((u1-u0)*r.w/2,(v1-v0)*r.d/2)/4));
   for(let k=0;k<n;k++){const a=P((u0+(u1-u0)*(k+.5)/n)*r.w/2,(v0+(v1-v0)*(k+.5)/n)*r.d/2),len=Math.hypot((u1-u0)*r.w/2,(v1-v0)*r.d/2)/n,along=u0!==u1;
    if(k===Math.floor(n/2)&&v0===1&&v1===1)continue;   // the gate in its front
    ARCH.box('drystone',a[0],terrainH(a[0],a[1])-.3,a[1],along?len+.1:.6,hgt+.3,along?.6:len+.1,{ry:r.ry,col:0xd2cdbf,topCol:0x6a5a44});}}}
 // ---------------------------------------------------------------- a village's copies merged by material
 function merge(list,name){const byMat=new Map();
  for(const {parts,m} of list)for(const p of parts){const names=Object.keys(p.geo.attributes).sort(),k=p.mat.uuid+'|'+names.join(',');
   (byMat.get(k)||byMat.set(k,{mat:p.mat,names,items:[]}).get(k)).items.push({g:p.geo,m});}
  const grp=new THREE.Group();grp.name='longsong:hamlet '+name;grp.userData.hamlet=true;
  const v3=new THREE.Vector3(),n3=new THREE.Matrix3();
  for(const Q of byMat.values()){let nv=0,ni=0;for(const it of Q.items){nv+=it.g.attributes.position.count;ni+=it.g.index.count;}
   const A={};for(const nm of Q.names)A[nm]=new Float32Array(nv*Q.items[0].g.attributes[nm].itemSize);
   const I=nv>65535?new Uint32Array(ni):new Uint16Array(ni);let vo=0,io=0;
   for(const it of Q.items){const g=it.g,cnt=g.attributes.position.count;n3.getNormalMatrix(it.m);
    for(const nm of Q.names){const src=g.attributes[nm],sz=src.itemSize,dst=A[nm],a=src.array;
     if(nm==='position')for(let i=0;i<cnt;i++){v3.set(a[i*3],a[i*3+1],a[i*3+2]).applyMatrix4(it.m);dst[(vo+i)*3]=v3.x;dst[(vo+i)*3+1]=v3.y;dst[(vo+i)*3+2]=v3.z;}
     else if(nm==='normal')for(let i=0;i<cnt;i++){v3.set(a[i*3],a[i*3+1],a[i*3+2]).applyMatrix3(n3).normalize();dst[(vo+i)*3]=v3.x;dst[(vo+i)*3+1]=v3.y;dst[(vo+i)*3+2]=v3.z;}
     else dst.set(a.subarray(0,cnt*sz),vo*sz);}
    const ia=g.index.array;for(let k=0;k<ia.length;k++)I[io+k]=ia[k]+vo;io+=ia.length;vo+=cnt;}
   const geo=new THREE.BufferGeometry();for(const nm of Q.names)geo.setAttribute(nm,new THREE.BufferAttribute(A[nm],Q.items[0].g.attributes[nm].itemSize));
   geo.setIndex(new THREE.BufferAttribute(I,1));geo.computeBoundingSphere();
   const mesh=new THREE.Mesh(geo,Q.mat);mesh.name='longsong:xak-'+(Q.mat.userData.kdef||'piece');mesh.userData.hamlet=true;mesh.matrixAutoUpdate=false;
   grp.add(mesh);O.meshes++;O.tris+=ni/3;}
  scene.add(grp);return grp;}
 const STEP_G=new THREE.BoxGeometry(1.9,.32,.8),STEP_M=new THREE.MeshStandardMaterial({color:new THREE.Color(STONE).convertSRGBToLinear(),roughness:.9});
 // ---------------------------------------------------------------- the villages
 H.forEach(({spec,v})=>{if(v.error){O.errors.push(spec.id+': '+v.error);return;}const V={id:spec.id,name:spec.name,focus:spec.focus,pop:v.census.pop,buildings:v.records.length,site:v.site,kit:0,pending:0};
  O.villages.push(V);O.people+=v.census.pop;
  // the square (core/hamlet's green: the lanes run out from it) and the lanes, packed earth laid on the ground AS DRAWN
  // (GROUND.drawnH, 84: out here the ground is a 10 m mesh, which terrainH falls below between its vertices, 2026-10-20:
  // the lanes sank under it in patches and the square was never drawn, so the crossroads in the middle was missing)
  const Y=(x,z)=>Math.max(GROUND.drawnH(x,z),terrainH(x,z))+.1,flat=(A,B,C,D,col)=>ARCH.face('paving',[A[0],Y(A[0],A[1]),A[1]],[B[0],Y(B[0],B[1]),B[1]],[C[0],Y(C[0],C[1]),C[1]],[D[0],Y(D[0],D[1]),D[1]],[0,1,0],col);
  if(v.green){const g=v.green,c=Math.cos(g.ry||0),sn=Math.sin(g.ry||0),P=(u,w)=>[g.x+u*c+w*sn,g.z-u*sn+w*c],nu=Math.ceil(g.w/2),nw=Math.ceil(g.d/2);
   for(let i=0;i<nu;i++)for(let j=0;j<nw;j++){const u0=-g.w/2+g.w*i/nu,u1=-g.w/2+g.w*(i+1)/nu,w0=-g.d/2+g.d*j/nw,w1=-g.d/2+g.d*(j+1)/nw;
    flat(P(u0,w0),P(u1,w0),P(u1,w1),P(u0,w1),SQUARE);}
   // its chorten on a stone step in the middle, as a valley village keeps one at its crossing
   const yc=Math.max(GROUND.drawnH(g.x,g.z),terrainH(g.x,g.z));ARCH.box('ashlar',g.x,yc-.4,g.z,5.2,.75,5.2,{col:STONE});lsChorten(g.x,yc+.35,g.z,.3);
   REGISTER({name:'The village square and its chorten ('+spec.name.split(',')[0]+')',cls:'feature',kind:'square',key:'longsong_'+spec.id+'_square',x:g.x,z:g.z,y:yc-.5,r:Math.hypot(g.w,g.d)/2,h:8,
    tags:{culture:'xanadu',types:['religious']},note:'core/hamlet\'s green'});
   OBSTACLES.push({x:g.x,z:g.z,r:Math.hypot(g.w,g.d)/2+1});KWALK.block([g.x-2.6,g.x+2.6,g.z-2.6,g.z+2.6,yc-1,yc+8],'chorten');}
  v.lanes.forEach(L=>{for(let i=1;i<L.pts.length;i++){const a=L.pts[i-1],b=L.pts[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.ceil(len/2)),tx=(b[0]-a[0])/len,tz=(b[1]-a[1])/len,hw=L.w/2;
    for(let k=0;k<n;k++){const p=[a[0]+tx*len*k/n,a[1]+tz*len*k/n],q=[a[0]+tx*len*(k+1)/n,a[1]+tz*len*(k+1)/n];
     flat([p[0]-tz*hw,p[1]+tx*hw],[p[0]+tz*hw,p[1]-tx*hw],[q[0]+tz*hw,q[1]-tx*hw],[q[0]-tz*hw,q[1]+tx*hw],EARTH);}
    for(let t=0;t<=len;t+=5)OBSTACLES.push({x:a[0]+tx*t,z:a[1]+tz*t,r:hw+1.5});}});
  const copies=[],steps=[];
  v.records.forEach(r=>{const K=KD[r.key],kit=!!K&&!r.pending,fw=kit?K.fw:r.w,fd=kit?K.fd:r.d;
   const hs=pts(r,fw,fd).map(([x,z])=>terrainH(x,z)),top=Math.max.apply(null,hs),low=Math.min.apply(null,hs);
   const y=kit?top:low,nm=(kit?K.name:(KHAMLET.CULTURES.xanadu.pending[r.key]||{}).what||r.key)+' ('+spec.name.split(',')[0]+')';
   REGISTER({name:nm,cls:'building',kind:r.key,key:'longsong_'+r.id,x:r.x,z:r.z,y:low-.5,r:Math.max(r.w,r.d)/2+.6,   // (its doorstep or gate sill with it)
    h:r.h+(top-low)+1,
    tags:{culture:'xanadu',kit:kit?'xanadu':'longsong',types:kit?K.types:[r.role==='house'?'dwelling-single':'farm']},note:'core/hamlet ('+spec.id+')'+(kit?'':': the kit has no '+r.key+' yet')});
   O.buildings++;OBSTACLES.push({x:r.x,z:r.z,r:Math.hypot(r.w,r.d)/2+1.5});   // the flora (planted after) keeps off the plot
   if(kit){const nv=Math.max(1,Math.min(3,K.variants|0)),vv=hash(r.id)%nv,drop=Math.max(1,Math.ceil(top-low+.4));
    const parts=proto(r.key,vv,drop);if(parts){const m=new THREE.Matrix4().compose(new THREE.Vector3(r.x,y,r.z),new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),r.ry),new THREE.Vector3(1,1,1));
     copies.push({parts,m});V.kit++;
     // its doorstep: a stone at the house's front (the kit's fw x fd), at its floor (the pens' and the corral's: the sill
     // of their gate); a house's lamp at its door after dusk (89x lights it on core/atmos's glow layer); a windmill's rotors
     const c=Math.cos(r.ry),sn=Math.sin(r.ry);steps.push([r.x+sn*(fd/2+.35),y-.16,r.z+c*(fd/2+.35),r.ry]);
     if(r.role==='house'||/dwelling/.test((K.types||[]).join(' ')))O.glows.push([r.x+sn*(fd/2+.5),y+1.6,r.z+c*(fd/2+.5)]);
     if(XAK.rotors)XAK.rotors(r.key,vv).forEach(R=>{ROT.push({x:r.x+R.x*c+R.z*sn,y:y+R.y,z:r.z-R.x*sn+R.z*c,R});});}}
   else{O.pending++;V.pending++;
    if(r.key==='xa_pens'||r.key==='xa_corral')ring(r,r.key==='xa_corral'?1.3:1.5);
    else house(r,low,{curtain:0x4a3a2a});}
   // the walker goes round them (the house's footprint, turned)
   if(r.key!=='xa_pens'&&r.key!=='xa_corral'){const c=Math.abs(Math.cos(r.ry)),s=Math.abs(Math.sin(r.ry)),hx=(fw*c+fd*s)/2,hz=(fw*s+fd*c)/2;KWALK.block([r.x-hx,r.x+hx,r.z-hz,r.z+hz,low-1,y+r.h],'house');}});
  if(copies.length)merge(copies,spec.id);
  // the doorsteps, one instanced set a village (each building's own: what the probe and the inspector find it by)
  if(steps.length){const im=new THREE.InstancedMesh(STEP_G,STEP_M,steps.length),M=new THREE.Matrix4(),Q=new THREE.Quaternion(),Y=new THREE.Vector3(0,1,0),one=new THREE.Vector3(1,1,1);
   steps.forEach((t,j)=>{M.compose(new THREE.Vector3(t[0],t[1],t[2]),Q.setFromAxisAngle(Y,t[3]),one);im.setMatrixAt(j,M);});
   im.name='longsong:hamlet-steps';im.userData.hamlet=true;im.userData.inspectLabel='A doorstep ('+spec.name.split(',')[0]+')';scene.add(im);}
  REGISTER({name:spec.name,cls:'settlement',kind:'village',key:'longsong_'+spec.id,x:v.site.x,z:v.site.z,y:terrainH(v.site.x,v.site.z)-2,r:120,h:14,
   tags:{culture:'xanadu',types:['dwelling-multi','farm']},note:'core/hamlet: '+v.census.pop+' people, '+v.census.households+' households'});});
 // ---------------------------------------------------------------- the windmills' rotors, turning in the valley wind
 // (the kit's own arms and sails, XAK.rotors: eight arms top and bottom, a reed sail on each; the kit leaves them out of the
 // mill it builds for this page). One instanced set per rotor height; a turn about every 9 s, a little faster in a gust
 if(ROT.length){const byH={};ROT.forEach(o=>{(byH[o.R.h]=byH[o.R.h]||[]).push(o);});
  const wood=new THREE.Color(0x7a6a58).convertSRGBToLinear(),reed=new THREE.Color(0xc8b478).convertSRGBToLinear(),ims=[];
  for(const h in byH){const L=byH[h],R=L[0].R,P=[],C=[],box=(cx,cy,cz,sx,sy,sz,a,col)=>{const g=new THREE.BoxGeometry(sx,sy,sz).toNonIndexed();
    g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(cx,cy,cz),new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),a),new THREE.Vector3(1,1,1)));
    const q=g.attributes.position.array;for(let i=0;i<q.length;i++)P.push(q[i]);for(let i=0;i<q.length/3;i++)C.push(col.r,col.g,col.b);};
   for(let k=0;k<8;k++){const a=k/8*Math.PI*2+.3,dx=Math.sin(a),dz=Math.cos(a);
    for(const yy of R.arms)box(dx*R.R/2,yy-R.y,dz*R.R/2,.08,.08,R.R,a,wood);
    box(dx*R.R*.55,R.sail[0]-R.y,dz*R.R*.55,.06,R.sail[1],R.R*.85,a,reed);}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.computeVertexNormals();
   const im=new THREE.InstancedMesh(g,new THREE.MeshLambertMaterial({vertexColors:true}),L.length);im.userData.hamlet=true;im.userData.inspectLabel='A windmill\'s rotor (the reed sails turning)';
   im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);scene.add(im);ims.push([im,L]);O.rotors+=L.length;}
  const M=new THREE.Matrix4(),Q=new THREE.Quaternion(),Yx=new THREE.Vector3(0,1,0),one=new THREE.Vector3(1,1,1),V3=new THREE.Vector3();
  let ang=0,last=null;const turn=()=>{const t=performance.now()/1000,dt=last==null?0:Math.min(.1,t-last);last=t;ang+=dt*(.7+.25*Math.sin(t*.13));
   ims.forEach(([im,L])=>{L.forEach((o,j)=>{M.compose(V3.set(o.x,o.y,o.z),Q.setFromAxisAngle(Yx,ang+j*.7),one);im.setMatrixAt(j,M);});im.instanceMatrix.needsUpdate=true;});};
  turn();TICKS.push(turn);}
 O.kitErrors=XAK.errors;
 window._hamlets={get villages(){return O.villages.map(V=>Object.assign({},V));},get errors(){return O.errors.concat(XAK.errors);},buildings:O.buildings,people:O.people,
  protos:O.protos,meshes:O.meshes,tris:Math.round(O.tris),pending:O.pending,bound:O.bound};
 return O;})();
_mark('hamlets');
