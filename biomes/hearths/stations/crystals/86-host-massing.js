// ================================================================= HOST — the hold's massing: the reserved volumes, outlined (?massing=1)
// Draws CAVE.HOLD.volumes (48) as outlines seen through the rock: each volume's floor and top traced, joined by uprights, and its floor washed in
// its kind's colour (chamber amber, shelf green, gallery blue, passage violet, approach white). Built always, shown with ?massing=1 or the
// 'massing' layer; each outline carries its volume's middle as the probe's point, so a reserved volume is never an empty registration.
const MASSING=(function(){const grp=new THREE.Group();grp.name='the hold\'s massing';grp.visible=Q.get('massing')==='1';
 const COL={chamber:0xffb040,shelf:0x60e080,gallery:0x50a8ff,passage:0xc070ff,approach:0xffffff};
 const lineMat={},fillMat={};
 Object.keys(COL).forEach(k=>{lineMat[k]=new THREE.LineBasicMaterial({color:COL[k],transparent:true,opacity:.95,depthTest:false,fog:false});
  fillMat[k]=new THREE.MeshBasicMaterial({color:COL[k],transparent:true,opacity:.16,depthTest:false,depthWrite:false,side:THREE.DoubleSide,fog:false});});
 const ring=(V,y)=>{const s=V.shape;if(s.type==='ellipse'){const P=[];for(let i=0;i<48;i++){const a=i/48*TAU;P.push([s.c[0]+s.rx*Math.cos(a),y,s.c[1]+s.rz*Math.sin(a)]);}return P;}
  return s.pts.map(p=>[p[0],y,p[1]]);};
 const segs=[],fills=[];
 CAVE.HOLD.volumes.forEach(V=>{const s=V.shape,L=[],T=[];
  if(s.type==='capsule'){/* a capsule: its two sides at the floor and at the headroom, along its floor's line */
   const pts=s.pts,sides=[],tops=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[2]-a[2],l=Math.hypot(dx,dz)||1,nx=-dz/l*s.w/2,nz=dx/l*s.w/2,p=pts[i];
    sides.push([[p[0]+nx,p[1],p[2]+nz],[p[0]-nx,p[1],p[2]-nz]]);tops.push([[p[0]+nx,p[1]+s.h,p[2]+nz],[p[0]-nx,p[1]+s.h,p[2]-nz]]);}
   for(let i=0;i+1<pts.length;i++){for(const k of[0,1])L.push(sides[i][k],sides[i+1][k],tops[i][k],tops[i+1][k]);T.push([sides[i][0],sides[i][1],sides[i+1][1]],[sides[i][0],sides[i+1][1],sides[i+1][0]]);}
   [0,pts.length-1].forEach(i=>{L.push(sides[i][0],sides[i][1],tops[i][0],tops[i][1],sides[i][0],tops[i][0],sides[i][1],tops[i][1]);});}
  else{const lo=ring(V,s.y0+.05),hi=ring(V,s.type==='ellipse'?V.floor+Math.min(V.clear,8):s.y1);
   for(let i=0;i<lo.length;i++){const j=(i+1)%lo.length;L.push(lo[i],lo[j],hi[i],hi[j]);if(i%(s.type==='ellipse'?6:1)===0)L.push(lo[i],hi[i]);}
   const c=lo.reduce((a,p)=>[a[0]+p[0]/lo.length,a[1]+p[1]/lo.length,a[2]+p[2]/lo.length],[0,0,0]);for(let i=0;i<lo.length;i++)T.push([c,lo[i],lo[(i+1)%lo.length]]);}
  const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute(L.flat(),3));
  const ln=new THREE.LineSegments(lg,lineMat[V.kind]);ln.renderOrder=20;ln.userData.host=true;ln.userData.massing=V.id;ln.userData.inspectLabel=V.name+' (reserved for the hold: '+V.kind+')';
  const mid=V.shape.type==='ellipse'?[V.shape.c[0],V.floor+1,V.shape.c[1]]:(()=>{const P=V.shape.type==='poly'?V.shape.pts.map(p=>[p[0],V.floor,p[1]]):V.shape.pts;const m=P[Math.floor(P.length/2)],n=P[0];return[(m[0]+n[0])/2,(m[1]+n[1])/2+1,(m[2]+n[2])/2];})();
  ln.userData.probePoints=mid;grp.add(ln);
  const fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.Float32BufferAttribute(T.flat(2),3));const fm=new THREE.Mesh(fg,fillMat[V.kind]);fm.renderOrder=19;fm.userData.probeSkip=true;grp.add(fm);
  segs.push(L.length/2);fills.push(T.length);});
 scene.add(grp);
 return {group:grp,volumes:CAVE.HOLD.volumes.length,segments:segs.reduce((a,b)=>a+b,0),colours:COL};})();
window._massing={shown:MASSING.group.visible,volumes:MASSING.volumes};
