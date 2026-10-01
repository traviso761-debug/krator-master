// ================================================================= HOST — stage
// The ideal-type host: everything a world provides that a biome does not.
// Renderer, lights, fog, a rolling terrain with terrainH(), a painted forest
// floor, the tick list, the error panel. A real world replaces this whole
// section with its own; the biome fragments never read anything from it except
// through BIO.host (see 88-host-build.js).
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);}

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xb7c4ae);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00030);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,12000);
scene.add(new THREE.HemisphereLight(0xbcd0c8,0x3d3a26,.62));
const sun=new THREE.DirectionalLight(0xfff0d2,1.45);sun.position.set(-1200,900,-600);scene.add(sun);
const fill=new THREE.DirectionalLight(0xaecfc4,.34);fill.position.set(800,400,900);scene.add(fill);

// ---------------------------------------------------------------- terrain
// Gently rolling hyperjungle floor: long swells with a finer roughness, and a
// shallow brook line running roughly north-south through the middle (a bare
// strip the biome's mask keeps clear -- it is riparian ground, tagged as such).
const TERR={R:3600,swell:38,rough:6};
function terrainH(x,z){
 const a=fbm(x*.00042+3.1,z*.00042-1.7,17,3)-.5,b=fbm(x*.0026-2,z*.0026+5,29,2)-.5;
 const brook=Math.exp(-Math.pow((x-90*Math.sin(z*.0012))/34,2));
 return TERR.swell*a*2+TERR.rough*b*2-brook*3.2;}
function brookDist(x,z){return Math.abs(x-90*Math.sin(z*.0012));}
// ---------------------------------------------------------------- the host binding
// This is the whole contract between a world and a biome. OBSTACLES is filled
// by whatever the host builds before the biome (the tower, in this file set).
const OBSTACLES=[];
BIO.init({THREE:THREE,scene:scene,terrainH:terrainH,
 mask:(x,z)=>{const b=brookDist(x,z);return b<14?0:b<26?(b-14)/12:1;},   // the brook bed is bare
 obstacles:OBSTACLES,ticks:tick,seed:7,origin:[0,0],err:reportErr});
BIO.setSun([-1200,900,-600]);
// the ground as one mesh, painted dark litter with the brook bed lighter
const TEX_GROUND=BIO.canvasTex(1024,1024,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=TERR.R*2.2;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=(x/w-.5)*S,wz=(y/h-.5)*S;
  const n=fbm(x/30,y/30,.3,2),n2=fbm(x/5,y/5,7,1);
  let r=30+(n-.5)*22+(n2-.5)*12,gg=42+(n-.5)*30+(n2-.5)*14,b=22+(n-.5)*14;
  const bk=clamp(1-brookDist(wx,wz)/28,0,1);           // silt and pebbles along the brook
  r=lerp(r,96+n2*30,bk);gg=lerp(gg,84+n2*22,bk);b=lerp(b,62,bk);
  d[i]=r;d[i+1]=gg;d[i+2]=b;d[i+3]=255;}
 g.putImageData(id,0,0);});
const MAT_GROUND=new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0x8c8c86});   // litter under closed canopy: dark, no shadow maps here
(function(){const N=180,S=TERR.R*2.2,g=new THREE.PlaneGeometry(S,S,N,N);g.rotateX(-Math.PI/2);
 const p=g.attributes.position;for(let i=0;i<p.count;i++){p.setY(i,terrainH(p.getX(i),p.getZ(i)));}
 g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.inspectLabel='Forest floor';scene.add(m);
 // the brook water: a narrow ribbon at the bed level
 const W=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshStandardMaterial({color:0x2a5a4a,roughness:.2,metalness:.2,transparent:true,opacity:.8}));
 const pts=[];for(let z=-TERR.R;z<=TERR.R;z+=60)pts.push([90*Math.sin(z*.0012),z]);
 const geo=new THREE.BufferGeometry(),pos=[];
 for(let k=0;k<pts.length-1;k++){const a=pts[k],b=pts[k+1];const ya=terrainH(a[0],a[1])+.35,yb=terrainH(b[0],b[1])+.35;
  pos.push(a[0]-9,ya,a[1], b[0]-9,yb,b[1], b[0]+9,yb,b[1],  a[0]-9,ya,a[1], b[0]+9,yb,b[1], a[0]+9,ya,a[1]);}
 geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.computeVertexNormals();
 const wm=new THREE.Mesh(geo,W.material);wm.userData.probeSkip=true;wm.userData.inspectLabel='The brook';scene.add(wm);})();
