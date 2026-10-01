// ================================================================= ATMOS — dressing on buildings: ivy, window boxes, rooftop cisterns
// A.boxIndex(meshes) indexes every instance of box-geometry InstancedMeshes (walls, slabs, roofs) as an oriented box in an
// 8 m grid; idx.ray(origin, dir, maxD) returns the nearest hit {t, p, n, top} exactly (slab test in the box's own frame).
// dressBuilding() uses it to find a building's real walls and roof, so the dressing lands on fabric, not on a footprint.
(function(){const A=ATMOS;
 A.boxIndex=(meshes,o)=>{o=o||{};const T=A.T,C=8,cells={},list=[],m=new T.Matrix4(),p=new T.Vector3(),q=new T.Quaternion(),s=new T.Vector3(),min=o.minSize||2;
  for(const im of meshes){if(!im||!im.isInstancedMesh||im.geometry.type!=='BoxGeometry')continue;im.geometry.computeBoundingBox();const bb=im.geometry.boundingBox;
   for(let i=0;i<im.count;i++){im.getMatrixAt(i,m);m.decompose(p,q,s);const big=[s.x,s.y,s.z].filter(v=>v>=min).length;if(big<2)continue;
    const M=m.clone(),inv=m.clone().invert(),box=new T.Box3().copy(bb).applyMatrix4(M);const e={M,inv,bb,top:box.max.y,box};list.push(e);
    for(let cx=Math.floor(box.min.x/C);cx<=Math.floor(box.max.x/C);cx++)for(let cz=Math.floor(box.min.z/C);cz<=Math.floor(box.max.z/C);cz++)(cells[cx+','+cz]||(cells[cx+','+cz]=[])).push(e);}}
  const lo=new T.Vector3(),ld=new T.Vector3(),nm=new T.Matrix3();
  const ray=(org,dir,maxD)=>{const seen=new Set();let best=null;const L=maxD||60,step=C/2;
   for(let t=0;t<=L+step;t+=step){const x=org[0]+dir[0]*t,z=org[2]+dir[2]*t;const cell=cells[Math.floor(x/C)+','+Math.floor(z/C)];if(!cell)continue;
    for(const e of cell){if(seen.has(e))continue;seen.add(e);lo.set(org[0],org[1],org[2]).applyMatrix4(e.inv);ld.set(dir[0],dir[1],dir[2]);   // the direction goes through the linear part only: t is the same in both frames
    const el=e.inv.elements;const dx=el[0]*ld.x+el[4]*ld.y+el[8]*ld.z,dy=el[1]*ld.x+el[5]*ld.y+el[9]*ld.z,dz=el[2]*ld.x+el[6]*ld.y+el[10]*ld.z;
     let t0=-1e9,t1=1e9,ax=-1,sg=0;const O=[lo.x,lo.y,lo.z],D=[dx,dy,dz],mn=[e.bb.min.x,e.bb.min.y,e.bb.min.z],mx=[e.bb.max.x,e.bb.max.y,e.bb.max.z];let ok=true;
     for(let k=0;k<3&&ok;k++){if(Math.abs(D[k])<1e-9){if(O[k]<mn[k]||O[k]>mx[k])ok=false;continue;}let a=(mn[k]-O[k])/D[k],b=(mx[k]-O[k])/D[k],s=-1;if(a>b){const c=a;a=b;b=c;s=1;}if(a>t0){t0=a;ax=k;sg=s;}if(b<t1)t1=b;if(t0>t1)ok=false;}
     if(!ok||t0<0||t0>L||ax<0)continue;if(!best||t0<best.t){const n=new T.Vector3(ax===0?sg:0,ax===1?sg:0,ax===2?sg:0);nm.getNormalMatrix(e.M);n.applyMatrix3(nm).normalize();
      best={t:t0,p:[org[0]+dir[0]*t0,org[1]+dir[1]*t0,org[2]+dir[2]*t0],n:[n.x,n.y,n.z],top:e.top,box:e.box};}}}
   return best;};
  A.stats.boxIndex=list.length;return{ray,count:list.length};};
 // IVY: a canvas atlas of three leaf-sheet variants (vines rooted along the bottom, thinning to their tips)
 let ivyTex=null;const ivyAtlas=()=>{if(ivyTex)return ivyTex;const cv=document.createElement('canvas');cv.width=768;cv.height=256;const g=cv.getContext('2d');const R=A.rnd;
  const leaf=(x,y,sz,a,l)=>{g.save();g.translate(x,y);g.rotate(a);g.fillStyle=`rgb(${l-40},${l},${l-55})`;g.beginPath();g.moveTo(0,sz*.9);g.lineTo(-sz*.5,sz*.15);g.lineTo(-sz,-sz*.3);g.lineTo(-sz*.35,-sz*.28);g.lineTo(0,-sz);g.lineTo(sz*.35,-sz*.28);g.lineTo(sz,-sz*.3);g.lineTo(sz*.5,sz*.15);g.closePath();g.fill();g.restore();};
  for(let v=0;v<3;v++){const ox=v*256,stems=[];for(let k=0;k<6+Math.floor(R()*3);k++){const x0=ox+28+R()*200,top=256*(.03+.62*R()),pts=[];let x=x0,y=256,ph=R()*6;while(y>top){pts.push([x,y]);y-=6;x=Math.max(ox+16,Math.min(ox+240,x+Math.sin(y*.05+ph)*2.2+(R()-.5)*3));}stems.push(pts);}
   g.lineCap='round';for(const st of stems){g.strokeStyle='rgba(74,56,38,.95)';g.lineWidth=2.2;g.beginPath();st.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.stroke();}
   for(const st of stems){const x0=st[0][0];for(let i=0;i<46;i++){const r=28*Math.sqrt(R()),a=R()*6.283,x=x0+Math.cos(a)*r*1.3,y=250+Math.sin(a)*r*.9;if(x<ox+8||x>ox+248)continue;leaf(x,y,6+R()*4,R()*6.283,150+Math.floor(R()*80));}
    st.forEach((q,i)=>{const f=1-i/st.length;if(R()>.6+.4*f)return;const x=q[0]+(R()-.5)*(8+14*f),y=q[1]+(R()-.5)*8;if(x<ox+8||x>ox+248)return;leaf(x,y,5+R()*3+3*f,R()*6.283,155+Math.floor(R()*80));});}}
  ivyTex=new A.T.CanvasTexture(cv);ivyTex.encoding=A.T.sRGBEncoding;ivyTex.anisotropy=4;return ivyTex;};
 const IVYG=[0x3f9a4c,0x4cb35a,0x3a8a6a,0x52a870,0x62c488,0x6fb04a,0x80bf5a],FLOWER=[0xff5fa2,0xffd34a,0xe8443a,0xf4f0e6,0xb06adf,0xff8a3a];
 const ivySet=v=>{const k='ivy'+v;if(A.sets[k])return k;const g=new A.T.PlaneGeometry(1,1).translate(0,.5,0);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setX(i,(v+uv.getX(i))/3);
  A.set(k,g,A.mat('ivy',()=>new A.T.MeshLambertMaterial({color:0xffffff,map:ivyAtlas(),alphaTest:.35,side:A.T.DoubleSide})));return k;};
 // an ivy panel climbing from (x,y,z) on a face whose outward normal has bearing `ry` (rotation about y; the panel faces +z)
 A.ivy=(x,y,z,ry,w,h)=>{A.put(ivySet(Math.floor(A.rnd()*3)),[x,y,z,w,h,1,ry,A.pick(IVYG)]);};
 A.ivyClump=(x,y,z,s)=>{A.set('ivyClump','ball',A.lam(0x4f9a4a,.9));A.put('ivyClump',[x,y,z,s,s*.7,s,A.rnd()*6.28,A.pick(IVYG)]);};
 // a WINDOW BOX under a sill at (x,y,z), facing ry, w wide: timber trough, leaves, a few flowers
 A.windowBox=(x,y,z,ry,w)=>{A.set('wbox','box',A.lam(0xffffff,.9));A.set('wboxLeaf','ball',A.lam(0xffffff,.9));A.set('wboxFlower','box',A.lam(0xffffff,.8));
  A.put('wbox',[x,y,z,w,.38,.46,ry,A.pick([0xa8552a,0x8a5a3a,0x9c6a4a])]);A.put('wboxLeaf',[x,y+.3,z,w*.5,.3,.26,ry,A.pick(IVYG)]);
  const c=Math.cos(ry),s=Math.sin(ry);for(let i=0,n=3+Math.floor(A.rnd()*4);i<n;i++){const lx=(A.rnd()-.5)*w*.85,lz=(A.rnd()-.3)*.2;A.put('wboxFlower',[x+lx*c+lz*s,y+.45+A.rnd()*.25,z-lx*s+lz*c,.16,.16,.16,A.rnd()*6.28,A.pick(FLOWER)]);}};
 // a rooftop CISTERN: a timber tank with two iron hoops and a conical lid
 A.cistern=(x,y,z,r,h)=>{A.set('cistern','post16',A.lam(0xffffff,.9));A.set('cisternHoop','post16',A.lam(0x3a3632,.6));A.set('cisternLid','cone',A.lam(0x5a4a3a,.9));
  A.put('cistern',[x,y,z,r,h,r,0,A.pick([0x8a6a4a,0x9c7a55,0x7a5a3a])]);A.put('cisternHoop',[x,y+h*.2,z,r*1.04,.12,r*1.04,0]);A.put('cisternHoop',[x,y+h*.7,z,r*1.04,.12,r*1.04,0]);A.put('cisternLid',[x,y+h,z,r*1.05,r*.45,r*1.05,0]);};
 // window boxes under pane instances: im an InstancedMesh of window panes whose local +z faces out; p the share dressed
 A.windowBoxesOnPanes=(im,o)=>{o=o||{};if(!im)return 0;const T=A.T,m=new T.Matrix4(),p=new T.Vector3(),q=new T.Quaternion(),s=new T.Vector3(),n=new T.Vector3();let k=0;
  for(let i=0;i<im.count;i++){if(A.rnd()>(o.p||.3))continue;im.getMatrixAt(i,m);m.decompose(p,q,s);if(s.x<.6||s.x>3||s.y<.8)continue;n.set(0,0,1).applyQuaternion(q);if(Math.abs(n.y)>.2)continue;
   if(o.ok&&!o.ok(p.x,p.z))continue;const ry=Math.atan2(n.x,n.z),by=p.y-s.y/2-.24;A.windowBox(p.x+n.x*.3,by,p.z+n.z*.3,ry,s.x+.25);k++;}A.stats.windowBoxes=(A.stats.windowBoxes||0)+k;return k;};
 // DRESS ONE BUILDING: b {x,z,y (ground), R (reach of its footprint), ry}; finds its walls by rays in from four sides and
 // its roof by a ray down; o.ivy chance per side, o.cistern chance of a tank on a flat roof
 A.dressBuilding=(idx,b,o)=>{o=o||{};let n=0;
  for(let k=0;k<4;k++){if(A.rnd()>(o.ivy==null?.35:o.ivy))continue;const a=(b.ry||0)+k*Math.PI/2+A.rr(-.35,.35),dx=Math.sin(a),dz=Math.cos(a),R=b.R+4;
   const hit=idx.ray([b.x+dx*R,b.y+1.3,b.z+dz*R],[-dx,0,-dz],R);if(!hit||Math.abs(hit.n[1])>.3)continue;const H=Math.min(A.rr(2.2,5.5),hit.top-b.y-.2);if(H<1.5)continue;
   const ry=Math.atan2(hit.n[0],hit.n[2]),w=A.rr(1.2,2.6);A.ivy(hit.p[0]+hit.n[0]*.08,b.y,hit.p[2]+hit.n[2]*.08,ry,w,H);if(A.rnd()<.5)A.ivyClump(hit.p[0]+hit.n[0]*.3,b.y+H-.2,hit.p[2]+hit.n[2]*.3,A.rr(.5,.9));n++;}
  if(A.rnd()<(o.cistern||0)){const x=b.x+A.rr(-1.5,1.5),z=b.z+A.rr(-1.5,1.5),hit=idx.ray([x,b.y+80,z],[0,-1,0],80);
   if(hit&&hit.n[1]>.9&&hit.p[1]>b.y+2.6&&hit.box.max.x-hit.box.min.x>3.2&&hit.box.max.z-hit.box.min.z>3.2){A.cistern(hit.p[0],hit.p[1],hit.p[2],A.rr(.8,1.25),A.rr(1.6,2.3));n++;}}
  return n;};
})();
