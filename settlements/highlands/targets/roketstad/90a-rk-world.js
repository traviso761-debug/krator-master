// ================================================================= ROKETSTAD — the world: sky, far mountains, the terrain mesh, the wall and gates
// Runs after 90-scene (renderer/scene/camera/lights exist; the showcase block was skipped because window.CITY).
reseed(SEED_RK+6);
const RK_T0=performance.now();
camera.far=26000;camera.updateProjectionMatrix();
// ---------------------------------------------------------------- the Krator sky, its lighting, and the clocks' hour
const CITYSKY={hour:15.2,day:200,dens:1.4};
KratorSky.attach(scene,19000);
scene.fog.density=.00013;
const cityHemi=scene.children.find(o=>o.isHemisphereLight);
function citySkyTick(){KratorSky.update(camera.position,CITYSKY.hour,CITYSKY.day,CITYSKY.dens);const L=KratorSky.lighting();
 sun.position.copy(L.sunDir).multiplyScalar(1500).add(camera.position);sun.target.position.copy(camera.position);sun.target.updateMatrixWorld();sun.intensity=L.sunIntensity;sun.color.copy(L.sunColor);
 fill.intensity=.22*L.dayF+.05;if(cityHemi)cityHemi.intensity=L.ambient;scene.fog.color.copy(L.fog);renderer.setClearColor(L.fog);
 if(RK_MTN)RK_MTN.material.uniforms.fogC.value.copy(L.fog),RK_MTN.material.uniforms.dayF.value=L.dayF;
 window.HL_HOUR=CITYSKY.hour;   // every clock in town shows the sky's hour (94-hl-anim.js)
 if(typeof BIO!=='undefined'&&BIO.host)BIO.setSun([L.sunDir.x,L.sunDir.y,L.sunDir.z]);}
// ---------------------------------------------------------------- the Inner Wall: far mountains to the E, NE and SE
// Three ranges at 7, 10 and 14 km, a ridge function of bearing per range (peaks and saddles), rock below snow, blended
// toward the sky's haze by distance in the shader (they stand far outside the fog's reach, so they carry their own).
let RK_MTN=null;
(function mountains(){const pos=[],col=[],idx=[];
 const ranges=[{D:7200,H:[900,1900],jag:1.1,n:220,seed:1.3},{D:10200,H:[1500,2800],jag:1,n:220,seed:4.7},{D:14000,H:[2200,3900],jag:.9,n:240,seed:8.2}];
 const a0=-1.45,a1=1.45;
 for(const R of ranges){const base=pos.length/3;
  for(let i=0;i<=R.n;i++){const t=i/R.n,a=a0+(a1-a0)*t;const fall=Math.pow(Math.cos((t-.5)*Math.PI*.96),.6);   // lower toward N and S
   const ridge=fbm(a*3.1+R.seed,R.seed,1.1,4),pk=Math.pow(fbm(a*9+R.seed*2,1.7,R.seed,3),2.2);
   const h=(R.H[0]+(R.H[1]-R.H[0])*(ridge*.8+pk*R.jag*.9))*fall;const D=R.D*(1+.08*Math.sin(a*5+R.seed));
   const x=TC.x+D*Math.cos(a),z=TC.z+D*Math.sin(a);
   // three rows per column: the foot (forest-dark), the snow line (bare rock), the crest (snow above the line)
   const sl=Math.min(h*.98,R.H[0]*1.05+180*fbm(a*20,R.seed,3.3,2)),snow=h>sl+60;
   pos.push(x,-400,z, x,snow?sl:h*.7,z, x,h,z);col.push(.2,.26,.2, .42,.42,.44, snow?.92:.47,snow?.93:.47,snow?.96:.5);}
  for(let i=0;i<R.n;i++){const b=base+i*3;idx.push(b,b+3,b+1,b+1,b+3,b+4, b+1,b+4,b+2,b+2,b+4,b+5);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);
 const m=new THREE.ShaderMaterial({fog:false,side:THREE.DoubleSide,vertexColors:true,uniforms:{fogC:{value:new THREE.Color(0xb8c4c8)},dayF:{value:1}},
  vertexShader:'varying vec3 vC;varying float vD;varying float vY;void main(){vC=color;vec4 w=modelMatrix*vec4(position,1.);vD=length(w.xz-cameraPosition.xz);vY=position.y;gl_Position=projectionMatrix*viewMatrix*w;}',
  fragmentShader:'uniform vec3 fogC;uniform float dayF;varying vec3 vC;varying float vD;varying float vY;void main(){float k=clamp((vD-5000.)/11000.,0.,1.)*.62+.22;vec3 c=vC*(.35+.65*dayF);c=mix(c,fogC,k);gl_FragColor=vec4(c,1.);}'});
 RK_MTN=new THREE.Mesh(g,m);RK_MTN.userData.probeSkip=true;RK_MTN.frustumCulled=false;RK_MTN.name='mountains';scene.add(RK_MTN);})();
FRAME_HOOKS.push(citySkyTick);for(const f of FRAME_HOOKS_PRE)FRAME_HOOKS.push(f);
citySkyTick();
// ---------------------------------------------------------------- terrain: one plane, 5 m cells, the painted albedo (built at the end of 90b)
function cityTerrainMesh(){const N=Math.round(RK.WORLD/5);const g=new THREE.PlaneGeometry(RK.WORLD,RK.WORLD,N,N);const p=g.attributes.position;
 for(let i=0;i<p.count;i++){const lx=p.getX(i),ly=p.getY(i);p.setZ(i,terrainH(lx,-ly));}
 g.computeVertexNormals();
 const tex=new THREE.CanvasTexture(gcv);tex.encoding=THREE.sRGBEncoding;tex.anisotropy=8;tex.minFilter=THREE.LinearMipmapLinearFilter;
 const m=new THREE.MeshStandardMaterial({map:tex,roughness:.97,metalness:0});
 groundM=new THREE.Mesh(g,m);groundM.rotation.x=-Math.PI/2;groundM.userData.isGround=true;groundM.userData.probeSkip=true;groundM.name='terrain';scene.add(groundM);
 // a skirt of shelf beyond the square, so the world does not end at a cliff edge: a coarse ring out to 9 km
 const sk=new THREE.RingGeometry(RK.WORLD*.485,9000,96,8);const sp=sk.attributes.position;for(let i=0;i<sp.count;i++){const x=sp.getX(i),y=sp.getY(i);sp.setZ(i,shelfH(x,-y)-6);}sk.computeVertexNormals();
 const skirt=new THREE.Mesh(sk,new THREE.MeshStandardMaterial({color:0x3e5a2e,roughness:1}));skirt.rotation.x=-Math.PI/2;skirt.userData.probeSkip=true;skirt.name='skirt';scene.add(skirt);
 window._terrainTex=tex;}
// ---------------------------------------------------------------- the town wall: gates at the three highways, towers, runs of wall between
const WALLPIECES=[];
function vpPlace(key,x,z,ry,o){const k=key;TSTAT.cur=k+'/'+((o&&o.v)|0);const G=VERN.place(scene,k,x,z,ry,o);TSTAT.cur=null;return G;}
(function townWall(){reseed(SEED_RK+7);
 const rkey=k=>VERN.defs[k+'_reclaimed']&&rng()<.6?k+'_reclaimed':k;
 // round 10 (Travis: "gates don't quite connect to city walls"): each gatehouse is turned to the wall's own tangent
 // (the wall is an oval, not a circle, so the radial bearing left it skewed), and the runs either side start and end
 // exactly at the ends of its wall stubs (hnRCGate stubs reach GATE_END from the passage) instead of 22 m round the arc
 const GATE_END=18.4,GI={};
 const tangentRy=t=>{const a=townPt(t-.004,wallR(t-.004)),b=townPt(t+.004,wallR(t+.004));return Math.atan2(-(b[1]-a[1]),b[0]-a[0])+Math.PI;};
 // gates: passage along the highway, face (+z) outward
 for(const [name,g] of GATE_LIST){const p=gatePos(g);const ry=tangentRy(g);const o={x:p[0],z:p[1],hx:22,hz:11,ry,pad:1};
  GI[g]={ends:[-1,1].map(s=>loc(p[0],p[1],s*GATE_END,0,ry))};
  const y=groundY(o)+.1;cityFlat(p[0],p[1],24,14,y);vpPlace(rkey('hl_rep_gate'),p[0],p[1],ry,{y,v:0});occAdd(o);WALLPIECES.push({key:'gate',name,o});
  REG.push({name:name+' gate',x:p[0],y,z:p[1],r:22,h:44,cls:'building',key:'rk_gate_'+name,tags:{culture:'highland-republican',type:['military','infrastructure'],wealth:'civic',lit:true,landmark:true}});}
 const gateHalfAt=g=>GATE_END/wallR(g);
 const nearEnd=(g,pt)=>GI[g].ends.reduce((a,b)=>Math.hypot(b[0]-pt[0],b[1]-pt[1])<Math.hypot(a[0]-pt[0],a[1]-pt[1])?b:a);
 // runs between gates: chords of ~34 m, a tower every third joint
 const gs=GATE_LIST.map(g=>g[1]).sort((a,b)=>a-b);
 for(let i=0;i<gs.length;i++){const g0=gs[i],g1=gs[(i+1)%gs.length];let a=g0+gateHalfAt(g0),b=g1-gateHalfAt(g1);if(b<a)b+=TAU;
  let arc=0;{let pv=townPt(a,wallR(a));for(let k=1;k<=40;k++){const t=a+(b-a)*k/40,c=townPt(t,wallR(t));arc+=Math.hypot(c[0]-pv[0],c[1]-pv[1]);pv=c;}}const n=Math.max(1,Math.round(arc/34));
  let prev=nearEnd(g0,townPt(a,wallR(a)));
  for(let k=1;k<=n;k++){const t=a+(b-a)*k/n,cur=k===n?nearEnd(g1,townPt(b,wallR(b))):townPt(t,wallR(t));const mx=(prev[0]+cur[0])/2,mz=(prev[1]+cur[1])/2,dx=cur[0]-prev[0],dz=cur[1]-prev[1],len=Math.hypot(dx,dz);
   const ry=Math.atan2(-dz,dx)+Math.PI;   // local x along the run; front (+z) outward
   const o={x:mx,z:mz,hx:len/2,hz:5,ry,pad:0};const y=groundY(o);
   vpPlace(rkey('hl_rep_wall'),mx,mz,ry,{y,len:len+.6,v:k%2});occAdd(o);WALLPIECES.push({key:'wall',o});
   if(k<n&&k%3===0){const ty=terrainH(cur[0],cur[1])-.3;const to={x:cur[0],z:cur[1],hx:6,hz:6,ry,pad:0};vpPlace(rkey('hl_rep_wall_tower'),cur[0],cur[1],ry,{y:ty,v:k});occAdd(to);WALLPIECES.push({key:'tower',o:to});}
   prev=cur;}}
 window._wallPieces=WALLPIECES.length;})();
window._worldMs=Math.round(performance.now()-RK_T0);
