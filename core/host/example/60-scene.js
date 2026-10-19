// ================================================================= EXAMPLE — the scene: what core/host is handed
// A ground, each simulation place as a box registered in core/tags (class building, its key the place's id: the host's
// inspector picks it, and o.holds.idOf turns it back into the place), the people as dots at SIM.pose, and the editor's
// live pieces (crates and barrels: o.palette and the world adapter in 98-take.js).
const scene=new THREE.Scene();scene.background=new THREE.Color(0x9fb4c8);scene.fog=new THREE.Fog(0x9fb4c8,500,1400);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,0.5,4000);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);document.body.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xf0ece0,0x4a4238,0.9));{const d=new THREE.DirectionalLight(0xffffff,0.7);d.position.set(120,200,80);scene.add(d);}
const exGround=(x,z)=>0.6*Math.sin(x*0.02)*Math.cos(z*0.025);
{const g=new THREE.PlaneGeometry(600,400,60,40).rotateX(-Math.PI/2),p=g.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,exGround(p.getX(i)+75,p.getZ(i)+20));g.translate(75,0,20);g.computeVertexNormals();
 const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:0x7a8a5a}));m.name='ground';scene.add(m);}
for(const e of EXEDGES){const A=EXNODES[e.a],B=EXNODES[e.b],L=Math.hypot(B.x-A.x,B.z-A.z),r=new THREE.Mesh(new THREE.BoxGeometry(6,0.2,L),new THREE.MeshLambertMaterial({color:0x8a7a62}));
 r.position.set((A.x+B.x)/2,0.7,(A.z+B.z)/2);r.rotation.y=Math.atan2(B.x-A.x,B.z-A.z);r.name='street';scene.add(r);}
const T=KTAGS.page=KTAGS.create({build:'host-example'});
const EXSIZE={home:[12,10,6],market:[18,14,4],caravanserai:[22,18,7],field:[24,24,0.6],warehouse:[14,12,9]},EXCOL={home:0xc8a878,market:0xd8b060,caravanserai:0xb8946a,field:0x9aa860,warehouse:0x8a7a6a};
const EXBOX={};
for(const P of SIM.all('place')){const sz=EXSIZE[P.kind]||[8,8,4],y=exGround(P.x,P.z);
 const rec=T.add({'class':'building',kind:P.kind,key:P.id,name:P.name||P.id,at:[P.x,y,P.z],size:sz,tags:{culture:'generic'},frag:'60-scene.js'});
 const m=new THREE.Mesh(new THREE.BoxGeometry(sz[0],sz[2],sz[1]).translate(0,sz[2]/2,0),new THREE.MeshLambertMaterial({color:EXCOL[P.kind]||0xa09080}));
 m.position.set(P.x,y,P.z);m.name=P.id;scene.add(m);EXBOX[P.id]={rec,m};
 if(P.kind==='warehouse'){const fl=new THREE.Mesh(new THREE.BoxGeometry(sz[0]-1,0.3,sz[1]-1),new THREE.MeshLambertMaterial({color:0x6a5a4a}));fl.position.set(P.x,y+4.5,P.z);scene.add(fl);}}   // an upper floor (the cutaway's second storey)
// the people: one dot each, at SIM.pose; the instance is the actor
const EXACT=SIM.all('actor').map(a=>a.id);
const exDots=new THREE.InstancedMesh(new THREE.SphereGeometry(1.1,10,8),new THREE.MeshLambertMaterial({color:0xffffff}),EXACT.length);exDots.name='people';
{const col=new THREE.Color();EXACT.forEach((id,i)=>{const a=SIM.R.actor[id];exDots.setColorAt(i,col.set(a.cart?0x5aa6d9:a.role==='grower'?0x8fc46a:0xe0a24a));});}
scene.add(exDots);
const exM=new THREE.Matrix4();
function exDraw(){const t=SIM.time();EXACT.forEach((id,i)=>{const a=SIM.R.actor[id],p=a.present?SIM.pose(a,t):null;
 if(!p||p.hidden)exM.makeScale(0,0,0);else exM.makeTranslation(p.x,exGround(p.x,p.z)+1.2,p.z);exDots.setMatrixAt(i,exM);});exDots.instanceMatrix.needsUpdate=true;}
exDraw();
