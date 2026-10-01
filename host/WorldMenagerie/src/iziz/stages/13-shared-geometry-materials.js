// ---------- shared geometry / materials ----------
const boxG=new THREE.BoxGeometry(1,1,1);boxG.translate(0,0.5,0);
const _geo=new Map();function memo(k,make){let g=_geo.get(k);if(!g){g=make();_geo.set(k,g);}return g;}   // shared geometries: identical pieces batch together
const cyl=(...a)=>memo('cyl'+a,()=>new THREE.CylinderGeometry(...a)),sph=(...a)=>memo('sph'+a,()=>new THREE.SphereGeometry(...a)),cone=(...a)=>memo('cone'+a,()=>new THREE.ConeGeometry(...a)),torus=(...a)=>memo('tor'+a,()=>new THREE.TorusGeometry(...a)),octa=(...a)=>memo('oct'+a,()=>new THREE.OctahedronGeometry(...a));
const _flags=new Map();function flagM(c){let m=_flags.get(c);if(!m){m=new THREE.MeshLambertMaterial({color:c});m.userData.wind=0.35;_flags.set(c,m);}return m;}   // cloth that ripples
const _mats=new Map();function lamC(c){let m=_mats.get(c);if(!m){m=new THREE.MeshLambertMaterial({color:c});_mats.set(c,m);}return m;}   // shared plain-colour materials
function frusG(taper){return memo('frus'+taper,()=>{const g=new THREE.CylinderGeometry(0.7071*taper,0.7071,1,4,1);g.rotateY(Math.PI/4);g.translate(0,0.5,0);return g;});}
const frusG85=frusG(0.85), frusPyr=frusG(0.06);
const hemiG=new THREE.SphereGeometry(1,14,8,0,Math.PI*2,0,Math.PI/2);
// rectangular frustum: unit base, height 1, top scaled by (tx,tz). Flat-shaded, cached.
const rectG={};
function rectFrus(tx,tz){const k=tx+'_'+tz;if(rectG[k])return rectG[k];
  const b=0.5,X=tx*0.5,Z=tz*0.5;
  const v=[[-b,0,-b],[b,0,-b],[b,0,b],[-b,0,b],[-X,1,-Z],[X,1,-Z],[X,1,Z],[-X,1,Z]];
  const faces=[[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7],[4,5,6,7],[3,2,1,0]];
  const uvOf=[(p)=>[p[0]+0.5,p[1]],(p)=>[p[2]+0.5,p[1]],(p)=>[p[0]+0.5,p[1]],(p)=>[p[2]+0.5,p[1]],(p)=>[p[0]+0.5,p[2]+0.5],(p)=>[p[0]+0.5,p[2]+0.5]];
  const pos=[],uv=[];faces.forEach((f,fi)=>{[[0,2,1],[0,3,2]].forEach(tri=>tri.forEach(i=>{pos.push(...v[f[i]]);uv.push(...uvOf[fi](v[f[i]]));}));});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();rectG[k]=g;return g;}
// polygonal tower: blocky, tapering, flat-topped — a blunt tooth
const polyG={};
function polyTower(sides,taper){const k=sides+'_'+taper;if(polyG[k])return polyG[k];const g=new THREE.CylinderGeometry(taper,1,1,sides,1);g.rotateY(Math.PI/sides);g.translate(0,0.5,0);polyG[k]=g;return g;}
const sandM=new THREE.MeshLambertMaterial({color:0xe2b676});sandM.userData.tex='sand';
const sandLightM=new THREE.MeshLambertMaterial({color:0xf0d29a});sandLightM.userData.tex='sand';
const wallM=new THREE.MeshLambertMaterial({color:0xe07a2a});wallM.userData.tex='ashlar';wallM.userData.weather=true;
const wallDarkM=new THREE.MeshLambertMaterial({color:0xc4641e});wallDarkM.userData.tex='ashlar';wallDarkM.userData.weather=true;
const gateTopM=new THREE.MeshLambertMaterial({color:0xf2a24a});gateTopM.userData.tex='ashlar';
const darkM=new THREE.MeshLambertMaterial({color:0x14100c});
const glowM=new THREE.MeshBasicMaterial({color:0xffd34a});
function mesh(g,mat,x,y,z,sx,sy,sz,ry){const o=new THREE.Mesh(g,mat);o.position.set(x,y,z);o.scale.set(sx,sy,sz);if(ry)o.rotation.y=ry;return o;}
