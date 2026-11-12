// ================================================================= STRONGBOW TODAY — the town at the foot, drawn from its records
// sbTownDraw(gx, gz) draws SB3's town (src/40-sb-town.js, laid out by core/city inside SBCITY, kits/ancients/build.py sb_city)
// and the foot's own scrap buildings (the plaza's gate, shrine and pavilion, the serai on the terminus hall's platforms: the
// layout's parts, src/30-sb-layout.js) as the scrap Xanadu set's own (kits/xanadu, sealed as XAK by kits/xanadu/kit_bundle.py
// with scrap=True). Each def is built once per variant and footing depth at the origin (XAK.proto), flattened to one geometry
// per material (isleFlatten, settlements/isle-demo/src/58-isle-protos.js, read in place), and every copy in a ring merged by
// material into one mesh, so the town is a few hundred draws. A building stands on the highest ground under its footprint (the
// kit's fw x fd) over a footing as deep as the ground falls, as the kit page sites one on a hill. Its doorstep is one instance of
// a set (what the probe and the inspector find it by). The streets are packed earth on the ground, the fields strips in the
// crop's colour (the crops are owed: PLAN.md section 7). Everything is registered in core/tags first.
// Without XAK or SBCITY on the page (another target) it draws nothing, and the reclamation keeps its stand-ins.
function sbTownKit(){return typeof XAK!=='undefined'&&typeof SBCITY!=='undefined'&&typeof isleFlatten!=='undefined';}
/* the foot's scrap buildings (records from the layout's parts): where each stands and which way its front faces */
function sbFootKit(L){const P={};for(const p of L.parts)P[p.id]=p;const c=p=>{const s=p.shape;return s[0]==='box'?[(s[1]+s[2])/2,(s[3]+s[4])/2]:[s[1],s[2]];};
 const at=(id,key,v,ry,name,types)=>{const p=P[id];if(!p)return null;const q=c(p);return {id:'sb.today.'+id.replace(/^sb\./,''),part:id,key,v,x:q[0],z:q[1],y:p.y,ry,name,types};};
 return [at('sb.hall.serai','xa_scrap_serai',0,0,'the terminus serai',['inn','market']),at('sb.plaza.gate','xa_scrap_gate',0,-Math.PI/2,'the plaza\'s gate (the valley road comes in here)',['military']),
  at('sb.plaza.shrine','xa_scrap_shrine',0,-Math.PI/2,'the plaza\'s shrine of the Decree',['religious']),at('sb.plaza.pavilion','xa_scrap_pavilion',0,0,'the cistern pavilion',['civic'])].filter(Boolean);}

function sbTownDraw(gx,gz){const O={buildings:0,people:0,protos:0,meshes:0,tris:0,errors:[],census:null,foot:0};
 if(!sbTownKit())return O;
 const KD=XAK.dims(),dims=(k,v)=>KD[k]?{key:k,v:v|0,w:KD[k].w,d:KD[k].d,h:KD[k].h}:null;
 const L=sbLayout(),P=STRONGBOW.plan({seed:1647}),F=P.frame;KOFF=[gx,0,gz];
 let T;try{T=SBCITY.town.make({layout:L,plan:P,dims});}catch(e){O.errors.push('the town plan: '+(e&&e.stack||e));window._sbTown=O;return O;}
 O.census=T.census;
 /* the foot's four beside the town's lots, one list to register and draw */
 const foot=sbFootKit(L).map(r=>Object.assign(r,{w:KD[r.key].w,d:KD[r.key].d,h:KD[r.key].h,ring:-1,people:SBCITY.town.PEOPLE[r.key]||0,foot:true}));
 const all=foot.concat(T.lots);
 // ---- core/tags: the town and every building in it, before anything is drawn ----------------------------------------------------
 {const TG=KTAGS.strongbow||(KTAGS.strongbow=KTAGS.create({build:'ancients-strongbow'})),B='town/strongbow',C=T.centre;
  TG.add({id:B,'class':'landmark',kind:'town',key:'strongbow:town',name:'Strongbow, the town at the foot',at:[C[0]+gx,0,C[1]+gz],r:SBCITY.town.FARM,h:20,
   tags:{culture:'xanadu-scrap',types:['dwelling-multi','market','farm']},note:'core/city: '+T.census.buildings+' buildings, '+T.census.people+' people'});
  for(const r of all){const K=KD[r.key];TG.child(B,{'class':r.civic||r.foot?'landmark':'building',kind:r.key.replace(/^xa_scrap_/,''),key:r.id,name:r.name||K.name,at:[r.x+gx,r.y,r.z+gz],ry:r.ry,size:[r.w,r.d,r.h],
   tags:{culture:'xanadu-scrap',kit:'xanadu',types:K.types,ring:r.ring>=0?T.names[r.ring]:'the foot'}});}
  for(const f of T.fields)TG.child(B,{'class':'feature',kind:'field',key:f.id,at:[(f.corners[0][0]+f.corners[2][0])/2+gx,0,(f.corners[0][1]+f.corners[2][1])/2+gz],tags:{culture:'xanadu-scrap',crop:f.crop}});}
 // ---- the kit's buildings: protos, flattened once each -------------------------------------------------------------------------
 const PROTOS={},FOOT=0x8f8676;
 const proto=(key,v,drop)=>{const id=key+'#'+v+'@'+drop;if(id in PROTOS)return PROTOS[id];let parts=null;
  try{const G=XAK.proto(key,v,{drop,footC:FOOT,rotor:key==='xa_windmill'?false:undefined});if(G){parts=isleFlatten(G);O.protos++;}else O.errors.push('the kit could not build '+key+' #'+v);}
  catch(e){O.errors.push(key+': '+e.message);}
  return (PROTOS[id]=parts);};
 const corners=(r,w,d)=>{const c=Math.cos(r.ry),s=Math.sin(r.ry);return [[-1,-1],[1,-1],[1,1],[-1,1],[0,0]].map(([u,v])=>[r.x+u*w/2*c+v*d/2*s,r.z-u*w/2*s+v*d/2*c]);};
 const groups=[[],[],[],[],[]],steps=[],Y=new THREE.Vector3(0,1,0);
 for(const r of all){const K=KD[r.key],hs=corners(r,K.fw,K.fd).map(([x,z])=>F.ground(x,z)),top=Math.max.apply(null,hs),low=Math.min.apply(null,hs);
  const y=r.foot?r.y:top,drop=r.foot?0:Math.min(6,Math.ceil(top-low+.4)),v=Math.max(0,Math.min((K.variants|0)-1,r.v|0)),parts=proto(r.key,v,drop);
  REGISTER({name:'Strongbow — '+(r.name||K.name)+(r.ring>=0?' ('+T.names[r.ring]+')':''),x:r.x,z:r.z,y:(r.foot?r.y:low)-.5,r:Math.max(r.w,r.d)/2+.8,h:r.h+(top-low)+1});
  O.buildings++;O.people+=r.people;if(r.foot)O.foot++;
  if(!parts)continue;
  const m=new THREE.Matrix4().compose(new THREE.Vector3(r.x+gx,y,r.z+gz),new THREE.Quaternion().setFromAxisAngle(Y,r.ry),new THREE.Vector3(1,1,1));
  groups[r.ring<0?4:r.ring].push({parts,m});
  const c=Math.cos(r.ry),s=Math.sin(r.ry);steps.push([r.x+gx+s*(K.fd/2+.35),y-.16,r.z+gz+c*(K.fd/2+.35),r.ry]);}
 // ---- the copies of a ring merged by material ----------------------------------------------------------------------------------
 const v3=new THREE.Vector3(),n3=new THREE.Matrix3();
 const merge=(list,name)=>{const by=new Map();
  for(const {parts,m} of list)for(const p of parts){const names=Object.keys(p.geo.attributes).sort(),k=p.mat.uuid+'|'+names.join(',');
   (by.get(k)||by.set(k,{mat:p.mat,names,items:[]}).get(k)).items.push({g:p.geo,m});}
  for(const Q of by.values()){let nv=0,ni=0;for(const it of Q.items){nv+=it.g.attributes.position.count;ni+=it.g.index.count;}
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
   const mesh=new THREE.Mesh(geo,Q.mat);mesh.name='strongbow:town '+name+' '+(Q.mat.userData.kdef||'piece');mesh.matrixAutoUpdate=false;mesh.castShadow=mesh.receiveShadow=true;
   scene.add(mesh);O.meshes++;O.tris+=ni/3;}};
 groups.forEach((g,i)=>{if(g.length)merge(g,i<4?T.names[i]:'the foot');});
 // ---- the doorsteps, one instanced set ------------------------------------------------------------------------------------------
 if(steps.length){const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1.9,.32,.8),new THREE.MeshStandardMaterial({color:new THREE.Color(0xb8b0a0).convertSRGBToLinear(),roughness:.9}),steps.length),
   M=new THREE.Matrix4(),Q=new THREE.Quaternion(),one=new THREE.Vector3(1,1,1);
  steps.forEach((t,j)=>{M.compose(new THREE.Vector3(t[0],t[1],t[2]),Q.setFromAxisAngle(Y,t[3]),one);im.setMatrixAt(j,M);});
  im.name='strongbow:town doorsteps';scene.add(im);}
 // ---- the streets (packed earth, the avenues a shade paler) and the fields, laid on the ground -----------------------------------
 {const pos=[],col=[],C3=new THREE.Color(),quad=(a,b,c,d,hex)=>{C3.setHex(hex).convertSRGBToLinear();
   for(const p of [a,b,c,a,c,d]){pos.push(p[0]+gx,F.ground(p[0],p[1])+.07,p[1]+gz);col.push(C3.r,C3.g,C3.b);}};
  for(const w of T.ways){const hw=w.w/2,hex=w.cls==='avenue'?0x9c8c6e:w.cls==='main'?0x928366:0x887a60;
   for(let i=1;i<w.pts.length;i++){const a=w.pts[i-1],b=w.pts[i],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*hw,nz=dx/l*hw,ex=dx/l*.6,ez=dz/l*.6;
    quad([a[0]+nx-ex,a[1]+nz-ez],[b[0]+nx+ex,b[1]+nz+ez],[b[0]-nx+ex,b[1]-nz+ez],[a[0]-nx-ex,a[1]-nz-ez],hex);}}
  const CROP={grain:0xc8b46a,fodder:0x8a9a52,fallow:0x8a7454};
  for(const f of T.fields){const K=f.corners,n=6;   /* six furrow strips a field, alternate shades */
   for(let k=0;k<n;k++){const t0=k/n,t1=(k+1)/n,l=(p,q,t)=>[p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t];
    quad(l(K[0],K[1],t0),l(K[0],K[1],t1),l(K[3],K[2],t1),l(K[3],K[2],t0),k%2?CROP[f.crop]:(CROP[f.crop]&0xf0f0f0)-0x101008);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.computeVertexNormals();
  const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.97,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
  m.name='strongbow:town streets and fields';m.receiveShadow=true;m.userData.probeSkip=true;scene.add(m);}
 O.kitErrors=XAK.errors.slice(0,8);
 window._sbTown={buildings:O.buildings,people:O.people,foot:O.foot,protos:O.protos,meshes:O.meshes,tris:Math.round(O.tris),census:O.census,errors:O.errors.concat(XAK.errors).slice(0,12),
  fields:T.fields.length,ways:T.ways.length};
 return O;}
