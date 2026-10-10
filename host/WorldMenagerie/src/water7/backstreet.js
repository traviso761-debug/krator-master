// ---------- Back Street and the drowned city ----------
// Back Street (OSM.water7.backstreet) is the old low quarter, sinking: its ground below the sea, so the tide comes and
// goes in its streets (the generator sinks it; the sea in ocean.js fills it). Here, what that does to a place: plank
// boardwalks on posts between the rows of houses, rowboats tied up where the streets were, doors boarded up at the
// waterline and a tide line of weed on every wall, salt crusted white on the roofs where the last Aqua Laguna left it.
// And outside the sea wall, on the seabed, the city before this one: broken walls and arches, fallen columns, the
// wrecks, anchors, rocks and weed - under the sea, seen when Aqua Laguna draws it back.
export function backstreet(api){
  const {THREE,scene,OSM,FOOTPRINTS,groundH}=api;const W7=OSM.water7;if(!W7)return;
  const T=W7.tiers,BS=(W7.backstreet||[196,238]).map(d=>d*Math.PI/180),DAM=W7.damR||1480;let seed=23;const R=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  const norm=a=>(a%(2*Math.PI)+2*Math.PI)%(2*Math.PI),inBS=(x,z)=>{const a=norm(Math.atan2(z,x)),r=Math.hypot(x,z);return a>BS[0]&&a<BS[1]&&r>T[2][0]+4&&r<T[0][0];};
  const o=new THREE.Object3D(),col=new THREE.Color();
  const inst=(geo,c,list,vc=false)=>{const m=new THREE.InstancedMesh(geo,new THREE.MeshLambertMaterial({color:vc?0xffffff:c}),list.length);list.forEach((p,i)=>{o.position.set(p[0],p[1],p[2]);o.rotation.set(p[4]||0,p[3]||0,p[5]||0);o.scale.set(p[6]||1,p[7]||1,p[8]||1);o.updateMatrix();m.setMatrixAt(i,o.matrix);if(vc)m.setColorAt(i,col.set(p[9]));});
    m.castShadow=false;m.receiveShadow=true;m.userData.noFingerprint=true;scene.add(m);return m;};   // small, or under the sea: no shadows to draw
  // ---- the houses: boarded doors at the waterline, the tide line, salt on the roofs ----
  const boards=[],tide=[],salt=[];
  for(const f of FOOTPRINTS||[]){const r0=f.ring[0];if(!inBS(r0[0],r0[1]))continue;const r=f.ring;let cx=0,cz=0;for(const [x,z] of r){cx+=x;cz+=z;}cx/=r.length;cz/=r.length;
    for(let i=0;i<r.length;i++){const p=r[i],q=r[(i+1)%r.length],L=Math.hypot(q[0]-p[0],q[1]-p[1]);if(L<2)continue;const mx=(p[0]+q[0])/2,mz=(p[1]+q[1])/2;let nx=(q[1]-p[1])/L,nz=-(q[0]-p[0])/L;if(nx*(mx-cx)+nz*(mz-cz)<0){nx=-nx;nz=-nz;}const ry=-Math.atan2(q[1]-p[1],q[0]-p[0]);
      tide.push([mx+nx*0.06,1.35,mz+nz*0.06,ry,0,0,L+0.1,0.5,0.1]);
      if(R()<0.45){const t=0.2+R()*0.6;boards.push([p[0]+(q[0]-p[0])*t+nx*0.1,0.9,p[1]+(q[1]-p[1])*t+nz*0.1,ry,0,(R()-0.5)*0.15,1.3,2.0,0.12]);}}
    if(R()<0.7)for(let k=0;k<3;k++)salt.push([cx+(R()-0.5)*5,f.h+0.6+R()*1.2,cz+(R()-0.5)*5,R()*6,0,0,2+R()*4,0.08,1.5+R()*3]);}
  inst(new THREE.BoxGeometry(1,1,1),0x4a6a4a,tide);inst(new THREE.BoxGeometry(1,1,1),0x5a4030,boards);inst(new THREE.BoxGeometry(1,1,1),0xf4f2ec,salt);
  // ---- the boardwalks between the rows, on their posts; rowboats tied up ----
  const walk=[],posts=[],boats=[];
  for(let k=0;k<=1;k++){const ro=T[k][0],ri=T[k+1][0];for(let rr=ri+26;rr<ro-14;rr+=24){const n=Math.floor((BS[1]-BS[0])*rr/4);
    for(let i=0;i<n;i++){const a=BS[0]+(i+0.5)/n*(BS[1]-BS[0]),x=Math.cos(a)*rr,z=Math.sin(a)*rr;if(R()<0.08)continue;
      walk.push([x,1.25,z,-a,0,0,2.4,0.15,4.05]);if(i%2===0)for(const s of [-1,1])posts.push([x+Math.cos(a)*s*1.1,0.2,z+Math.sin(a)*s*1.1,0,0,0,0.18,2.1,0.18]);
      if(R()<0.07){const s=R()<0.5?-1:1;boats.push([x+Math.cos(a)*s*3,0.55,z+Math.sin(a)*s*3,-a+(R()-0.5)*0.4,0,0,1.6,0.5,4.4]);}}}}
  inst(new THREE.BoxGeometry(1,1,1),0x8a6a48,walk);inst(new THREE.BoxGeometry(1,1,1),0x4a3424,posts);inst(new THREE.BoxGeometry(1,1,1),0x6a4a30,boats);
  // ---- the drowned city on the seabed, outside the wall ----
  const walls=[],cols=[],rocks=[],weed=[];
  for(let i=0;i<140;i++){const a=R()*Math.PI*2,r=DAM+60+R()*1100,x=Math.cos(a)*r,z=Math.sin(a)*r,y=groundH(x,z);if(y>-2)continue;
    const kind=R();if(kind<0.45){const L=6+R()*20,H=2+R()*7;walls.push([x,y+H/2-0.5,z,R()*6,0,(R()-0.5)*0.3,L,H,1.2+R()*0.8,['#b8ab90','#a89a80','#c8bca0'][Math.floor(R()*3)]]);}
    else if(kind<0.7)cols.push([x,y+0.8,z,R()*6,0,Math.PI/2*(R()<0.6?1:0),1,1,1]);
    else rocks.push([x,y,z,R()*6,R()*6,R()*6,1+R()*3,1+R()*2,1+R()*3]);
    for(let k=0;k<3;k++)weed.push([x+(R()-0.5)*8,y,z+(R()-0.5)*8,0,0,(R()-0.5)*0.4,1,1+R()*2.5,1]);}
  inst(new THREE.BoxGeometry(1,1,1),0,walls,true);inst(new THREE.CylinderGeometry(0.8,0.9,7,10),0xc8bca0,cols);inst(new THREE.DodecahedronGeometry(1,0),0x6a6a62,rocks);
  inst(new THREE.ConeGeometry(0.3,2,5).translate(0,1,0),0x3a6a3a,weed);
  // the wrecks of the bed: old hulls, lying over
  for(let i=0;i<10;i++){const a=R()*Math.PI*2,r=DAM+120+R()*900,x=Math.cos(a)*r,z=Math.sin(a)*r,y=groundH(x,z);if(y>-3)continue;
    const L=20+R()*25,B=L*0.28,s=new THREE.Shape();s.moveTo(-L/2,-B/2);s.lineTo(L*0.25,-B/2);s.quadraticCurveTo(L*0.45,-B*0.35,L/2,0);s.quadraticCurveTo(L*0.45,B*0.35,L*0.25,B/2);s.lineTo(-L/2,B/2);s.closePath();
    const m=new THREE.Mesh(new THREE.ExtrudeGeometry(s,{depth:B*0.7,bevelEnabled:false}).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({color:0x4a3a2a}));m.position.set(x,y-1,z);m.rotation.set(0,R()*6,(R()<0.5?-1:1)*(0.5+R()*0.5));m.userData.noFingerprint=true;scene.add(m);}
  api.ctx.details=Object.assign(api.ctx.details||{},{backstreet:{boarded:boards.length,boardwalk:walk.length,boats:boats.length,seabed:walls.length+cols.length}});
}
