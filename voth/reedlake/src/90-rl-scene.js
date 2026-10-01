// ---------------------------------------------------------------- scene (Reed Lake showcase)
// Rows by family across the lake, front (+z) toward the camera — the Highlands layout (hlLayout) over water instead
// of a meadow. A target names the branches it shows (HL_BRANCHES) and may list extra SITES in its 89z-rows.js.
const HL_ROWS=[];   // {branch, family, z, d, keys}
const rowCamDist=w=>Math.max(40,Math.min(w*.55,260));
const eyeCamDist=D=>Math.max(10,Math.max(D.w,D.h||0)*.9+D.d*.5);   // an eye-level camera stands this far in front of the plot centre
(function hlLayout(){let z=0;const fams=[];for(const b of HL_BRANCHES)HL.families(b).forEach((F,i,a)=>fams.push({b,F,last:i===a.length-1}));
 let prev=null;fams.forEach(({b,F,last})=>{const ws=F.keys.map(k=>VERN.defs[k].w+9);const total=ws.reduce((a,c)=>a+c,0);
  const dmax=Math.max(...F.keys.map(k=>VERN.defs[k].d||VERN.defs[k].w)),hmax=Math.max(...F.keys.map(k=>VERN.defs[k].h||0));
  if(prev&&hmax>22)z+=Math.max(0,Math.max(rowCamDist(prev.w),prev.h*1.7)+8-22);
  z+=dmax/2;let x=-total/2;
  F.keys.forEach((k,i)=>{SITES.push({key:k,x:x+ws[i]/2,z,ry:0,o:{v:0}});x+=ws[i];});
  prev={branch:b,family:F.family,z,d:dmax,w:total,h:hmax,keys:F.keys};HL_ROWS.push(prev);
  const eyeNeed=Math.max(...F.keys.map(k=>eyeCamDist(VERN.defs[k])))-dmax/2+6;
  z+=dmax/2+Math.max(22,eyeNeed)+(last?40:0);});
 for(const S of HL_EXTRA){S.z=z+S.depth/2;SITES.push(S);HL_ROWS.push({branch:S.branch||'extra',family:S.family||S.key,z:S.z,d:S.depth,w:S.depth,keys:[S.key]});z+=S.depth+30;}})();
const GROUND_C=(HL_ROWS.length?HL_ROWS[HL_ROWS.length-1].z:0)/2;
// views: an opening, an overview, one per row, and an eye-level shot per building
function hlAutoViews(extra){const V={};const R=HL_ROWS;if(!R.length)return V;const mid=R[Math.floor(R.length/2)];
 const fam=r=>HL.branches[r.branch]?HL.branches[r.branch]+' — '+r.family:r.family;
 V['Opening']=[R[0].w*.25,Math.max(24,R[0].d*.9),R[0].z+R[0].d*.5+44,0,5,R[0].z];
 V['Overview']=[-700,420,mid.z+80,0,10,mid.z];
 for(const b of HL_BRANCHES){const rs=R.filter(r=>r.branch===b);if(!rs.length)continue;const zc=(rs[0].z+rs[rs.length-1].z)/2;const span=rs[rs.length-1].z-rs[0].z+80;
  V[HL.branches[b]+' — overview']=[-span*.7,span*.55,zc+span*.35,0,5,zc];}
 for(const r of R){const dist=Math.max(rowCamDist(r.w),(r.h||0)*1.7);V[fam(r)]=[0,Math.max(18,dist*.45),r.z+r.d/2+dist,0,Math.min(4+(r.h||0)*.35,20),r.z];}
 for(const S of SITES){const D=VERN.defs[S.key];if(!D)continue;const dist=eyeCamDist(D);
  V[D.name+' — eye level']=[S.x+D.w*.18,1.7,S.z+dist,S.x,Math.min(D.h||6,14)*.4,S.z];}
 return Object.assign(V,extra||{});}
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xc4d2d0);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00055);   // warm lake haze
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.3,6000);
scene.add(new THREE.HemisphereLight(0xe8f0ff,0x4a5a40,.72));
const sun=new THREE.DirectionalLight(0xfff2dc,1.6);sun.position.set(-600,700,400);scene.add(sun);
const fill=new THREE.DirectionalLight(0xb8d0ff,.32);fill.position.set(500,300,-600);scene.add(fill);
const FRAME_HOOKS=[];
let sky,giant,groundM,LABELS;const SITE_GROUPS=[];
const giantDir=new THREE.Vector3(Math.sin(66*Math.PI/180)*Math.cos(25*Math.PI/180),Math.sin(25*Math.PI/180),-Math.cos(66*Math.PI/180)*Math.cos(25*Math.PI/180));

if(!window.CITY){
const skyMat=new THREE.ShaderMaterial({side:THREE.BackSide,fog:false,depthWrite:false,uniforms:{},
 vertexShader:'varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:'varying vec3 vP;void main(){float h=clamp(normalize(vP).y,-.05,1.);vec3 hz=vec3(.80,.84,.84);vec3 zen=vec3(.28,.48,.74);vec3 c=mix(hz,zen,pow(h,.5));gl_FragColor=vec4(c,1.);}'});
sky=new THREE.Mesh(new THREE.SphereGeometry(5000,32,16),skyMat);sky.userData.probeSkip=true;scene.add(sky);
const giantTex=canvasTex(512,512,(g,w,h)=>{g.clearRect(0,0,w,h);const grd=g.createRadialGradient(256,256,0,256,256,256);
 for(let i=0;i<=20;i++){const t=i/20;const b=.8+.2*Math.sin(i*2.1);grd.addColorStop(t*.96,`rgba(${220*b|0},${180*b|0},${150*b|0},${.85*(1-Math.pow(t,6))})`);}
 grd.addColorStop(1,'rgba(220,180,150,0)');g.fillStyle=grd;g.beginPath();g.arc(256,256,250,0,TAU);g.fill();
 g.globalCompositeOperation='source-atop';for(let y=0;y<h;y+=9){g.fillStyle=`rgba(${120+(y*7)%80},${90+(y*3)%50},${70},${.10+.10*Math.sin(y*.3)})`;g.fillRect(0,y,w,5);}});
giantTex.wrapS=giantTex.wrapT=THREE.ClampToEdgeWrapping;
giant=new THREE.Sprite(new THREE.SpriteMaterial({map:giantTex,fog:false,transparent:true,depthWrite:false}));giant.scale.set(1400,1400,1);giant.userData.probeSkip=true;scene.add(giant);

// the lake: one plane of water at RL.WATER, tiled in world units, scrolled by 94-rl-anim.js; the lake bed below it
TEX.rlWater.repeat.set(400,400);
groundM=new THREE.Mesh(new THREE.PlaneGeometry(3200,3200),MAT.rlWater);groundM.rotation.x=-Math.PI/2;groundM.position.set(0,RL.WATER,GROUND_C);groundM.userData.probeSkip=true;groundM.userData.isGround=true;scene.add(groundM);
{const bed=new THREE.Mesh(new THREE.PlaneGeometry(3200,3200),new THREE.MeshStandardMaterial({color:0x2a3a30,roughness:1}));bed.rotation.x=-Math.PI/2;bed.position.set(0,RL.WATER-2.5,GROUND_C);bed.userData.probeSkip=true;scene.add(bed);}
// distant reed beds along the lake's edges, so the horizon is not bare water
{reseed(25990);const zEnd=Math.max(0,...HL_ROWS.map(r=>r.z+r.d/2))+300,xEnd=Math.max(220,...HL_ROWS.map(r=>r.w/2+120));
 for(let k=0;k<420;k++){const side=k%2?1:-1;const x=side*rr(xEnd,xEnd+300),z=rr(-120,zEnd);const s=rr(1.4,2.4);
 kput('hRLReed',[x,RL.WATER-.1,z],qEuler(0,rng()*TAU,0),[s*2,rr(2.4,3.6),s*2],hC(vPick(RPAL.reedGreen)));}
 for(let k=0;k<160;k++){const x=rr(-xEnd-300,xEnd+300),z=zEnd+rr(0,140);const s=rr(1.4,2.4);kput('hRLReed',[x,RL.WATER-.1,z],qEuler(0,rng()*TAU,0),[s*2,rr(2.4,3.6),s*2],hC(vPick(RPAL.reedGreen)));}}

// ---------------------------------------------------------------- build every site the target lists
for(const S of SITES){const k=S.key+'/'+((S.o&&S.o.v)||0);TSTAT.cur=k;const r0=REG.length;
 const G=VERN.place(scene,S.key,S.x,S.z,S.ry||0,S.o);if(G)SITE_GROUPS.push({S,G});
 for(let i=r0;i<REG.length;i++)REG[i].type=S.key;TSTAT.cur=null;}
window._registered=REG.length;
kbake(scene);

LABELS=new THREE.Group();LABELS.userData.probeSkip=true;scene.add(LABELS);
}   // end showcase-only block
