// ---------- vegetation: palms, tiered spike-trees, broadleaf canopies, ferns, and the glowing yellow plants ----------
const trunkG=new THREE.CylinderGeometry(0.55,0.9,1,6);trunkG.translate(0,0.5,0);
const tierG=new THREE.ConeGeometry(1,1,6);tierG.translate(0,0.5,0);
const blobG=new THREE.SphereGeometry(1,6,4);
const frondG=new THREE.ConeGeometry(1,1,4);frondG.translate(0,0.5,0);
const barkM=new THREE.MeshLambertMaterial({color:0x5a3d26});barkM.userData.tex='bark';barkM.userData.lod=true;const trunks=new THREE.InstancedMesh(trunkG,barkM,6000);
const leafM1=new THREE.MeshLambertMaterial({color:0xffffff});leafM1.userData.tex='leaf';leafM1.userData.lod=true;const tiers=new THREE.InstancedMesh(tierG,leafM1,9000);
const leafM2=new THREE.MeshLambertMaterial({color:0xffffff});leafM2.userData.tex='canopy';leafM2.userData.lod=true;const blobs=new THREE.InstancedMesh(blobG,leafM2,9000);
const leafM3=new THREE.MeshLambertMaterial({color:0xffffff});leafM3.userData.tex='leaf';leafM3.userData.lod=true;const fronds=new THREE.InstancedMesh(frondG,leafM3,16000);blobs.userData.noShadow=fronds.userData.noShadow=true;   // canopies outside the walls: too many to shadow, and mostly beyond the shadow box
const glows=new THREE.InstancedMesh(frondG,new THREE.MeshBasicMaterial({color:0xffffff}),2500);
for(const im of [trunks,tiers,blobs,fronds,glows])im.userData.sector=true;
let ntr=0,nti=0,nbl=0,nfr=0,ngl=0;
const GREENS=[0x2e7d3a,0x3c9a4a,0x1f5c2a,0x5cb85c,0x2a6f5a,0x7fc95a,0x3f8f5f,0x1c4a30,0x4fb37a,0x2f8a6e];
const TEALS=[0x2a8f7a,0x3aa88a,0x1f6f60,0x56b89a];
const YELLOWS=[0xe8e04a,0xd9d233,0xf2ea6a,0xc6d63a];
function palm(x,y,z,s){if(ntr>=6000)return;const h=s*rr(9,16);put(trunks,ntr++,x,y,z,s*0.55,h,s*0.55,0);
  const n=6+Math.floor(rnd()*4),cc=pick(rnd()<0.3?TEALS:GREENS);if(!vegHide)TREES.push([x,y,z,h+s*2,s*10,0,cc]);
  for(let i=0;i<n&&nfr<16000;i++){const az=i/n*Math.PI*2+rr(-0.2,0.2);putE(fronds,nfr++,x,y+h-0.5,z,s*0.8,s*rr(4.5,7),s*0.28,rr(1.05,1.45),az,0,cc);}
  for(let i=0;i<3&&nfr<16000;i++){putE(fronds,nfr++,x,y+h-0.2,z,s*0.6,s*rr(2.5,4),s*0.22,rr(0.3,0.7),rr(0,6.3),0,cc);}}
function spike(x,y,z,s){if(ntr>=6000)return;const h=s*rr(3,6);put(trunks,ntr++,x,y,z,s*0.5,h,s*0.5,0);const cc=pick(GREENS);
  let yy=y+h*0.6,rad=s*rr(3.2,4.6),th=s*rr(4,6);if(!vegHide)TREES.push([x,y,z,h*0.6+th*2.3,rad*2,1,cc]);
  for(let k=0;k<3&&nti<9000;k++){put(tiers,nti++,x,yy,z,rad,th,rad,rr(0,6.3),cc);yy+=th*0.55;rad*=0.72;th*=0.85;}}
function broadleaf(x,y,z,s){if(ntr>=6000)return;const h=s*rr(6,11);put(trunks,ntr++,x,y,z,s*0.6,h,s*0.6,0);const cc=pick(GREENS);if(!vegHide)TREES.push([x,y,z,h+s*3.5,s*9,2,cc]);
  const n=2+Math.floor(rnd()*2);for(let i=0;i<n&&nbl<9000;i++){const r=s*rr(2.6,4.2);put(blobs,nbl++,x+rr(-s*2,s*2),y+h+rr(-s,s*1.5),z+rr(-s*2,s*2),r,r*rr(0.7,1),r,0,cc);}}
function fern(x,y,z,s,glow){if(glow&&!vegHide)GLOWFERNS.push(x,y,z);const n=5+Math.floor(rnd()*4);const cc=glow?pick(YELLOWS):pick(rnd()<0.4?TEALS:GREENS);
  for(let i=0;i<n;i++){const az=i/n*Math.PI*2+rr(-0.3,0.3);
    if(glow){if(ngl<2500)putE(glows,ngl++,x,y,z,s*0.7,s*rr(2.5,4.5),s*0.25,rr(0.5,0.95),az,0,cc);}
    else if(nfr<16000)putE(fronds,nfr++,x,y,z,s*0.7,s*rr(2.5,4.5),s*0.25,rr(0.5,0.95),az,0,cc);}}
function bush(x,y,z,s){if(nbl>=9000)return;const cc=pick(GREENS);for(let i=0;i<3&&nbl<9000;i++){const r=s*rr(0.7,1.2);put(blobs,nbl++,x+rr(-s*0.6,s*0.6),y+r*0.5,z+rr(-s*0.6,s*0.6),r,r*0.75,r,0,cc);}}
function plant(x,z,inCity){vegHide=!inCity&&(riverHit(x,z,4)||trailD(x,z)<3||lakeE(x,z)<1.15||roadD(x,z)<7);plantInner(x,z,inCity);vegHide=false;}
function plantInner(x,z,inCity){const y=terrainH(x,z)-0.6,r=rnd(),s=inCity?rr(0.55,0.9):rr(0.8,1.5);
  if(inCity){if(r<0.4)palm(x,y,z,s);else if(r<0.7)broadleaf(x,y,z,s);else if(r<0.85)fern(x,y,z,s,false);else bush(x,y,z,s*2);return;}
  if(r<0.28)spike(x,y,z,s);else if(r<0.52)palm(x,y,z,s);else if(r<0.72)broadleaf(x,y,z,s);else if(r<0.86)fern(x,y,z,s*1.3,false);else if(r<0.9)fern(x,y,z,s*1.2,true);else bush(x,y,z,s*2.2);}
// greenery inside the walls: courtyards, pocket gardens, parks — but never inside or against a building footprint
const clearOf=(x,z,pad)=>{const probe={x,z,fx:pad,fz:pad,ry:0};for(const l of lots){if(Math.abs(l.x-x)>l.rad+pad+1||Math.abs(l.z-z)>l.rad+pad+1)continue;if(mtv(l,probe,0))return false;}return true;};
let dropped=0;for(const q of cityGreen){if(clearOf(q[0],q[1],3.5))plant(q[0],q[1],true);else dropped++;}ctx.greenDropped=dropped;
// jungle outside the chasm, denser near the approach road so the foreground reads like the painting
for(let i=0;i<60000&&ntr<5800;i++){
  const x=rr(-690,690),z=rr(-690,690);const p=polar(x,z),R=wallR(p.t),ro=p.r-R;
  const mk=mask(x,z);let ok=false,inCity=false;
  if(ro>48&&mk[0]>200)ok=true;else if(ro<-14&&mk[1]>200&&mk[0]<60){ok=true;inCity=true;}
  if(!ok)continue;
  if(!inCity&&z<250&&rnd()<0.45)continue;         // thin the far side so the near jungle is the thickest
  if(!inCity&&z>0&&Math.abs(x)<46){                // open corridor along the approach road: low growth only, as in the painting
    if(rnd()<0.75)continue;const y=terrainH(x,z)-0.6;vegHide=riverHit(x,z,4)||trailD(x,z)<3||lakeE(x,z)<1.15||roadD(x,z)<7;if(rnd()<0.5)fern(x,y,z,rr(0.8,1.4),rnd()<0.35);else bush(x,y,z,rr(1.5,2.5));vegHide=false;continue;}
  plant(x,z,inCity);
}
for(const im of [trunks,tiers,blobs,fronds,glows]){im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;}
trunks.count=ntr;tiers.count=nti;blobs.count=nbl;fronds.count=nfr;glows.count=ngl;
for(const im of [trunks,tiers,blobs,fronds,glows])if(im.count>0)scene.add(im);
ctx.veg={ntr,nti,nbl,nfr,ngl};
{const cv=document.createElement('canvas');cv.width=512;cv.height=128;const g=cv.getContext('2d');const R=mkRng(909);
 const blob=(cx,cy,r,l)=>{g.fillStyle=`rgb(${l-30},${l},${l-40})`;g.beginPath();g.arc(cx,cy,r,0,7);g.fill();};
 // palm
 g.strokeStyle='#6e5a44';g.lineWidth=5;g.beginPath();g.moveTo(64,128);g.quadraticCurveTo(58,70,64,30);g.stroke();
 for(let k=0;k<9;k++){const a=k/9*Math.PI*2;g.strokeStyle=`rgb(${150+R()*40|0},${200+R()*40|0},${140+R()*30|0})`;g.lineWidth=7;g.beginPath();g.moveTo(64,30);g.quadraticCurveTo(64+Math.cos(a)*30,24+Math.sin(a)*6-18,64+Math.cos(a)*56,40+Math.abs(Math.sin(a))*18);g.stroke();}
 // spike tree
 g.fillStyle='#6e5a44';g.fillRect(186,90,12,38);for(let k=0;k<3;k++){const w=58-k*16,y0=100-k*28;g.fillStyle=`rgb(${160-k*8},${205-k*6},${150-k*6})`;g.beginPath();g.moveTo(192-w,y0);g.lineTo(192+w,y0);g.lineTo(192,y0-44);g.closePath();g.fill();}
 // broadleaf
 g.fillStyle='#6e5a44';g.fillRect(314,70,12,58);for(let k=0;k<26;k++)blob(320+(R()-0.5)*80,48+(R()-0.5)*50,12+R()*14,170+R()*60|0);
 // bush
 for(let k=0;k<18;k++)blob(448+(R()-0.5)*80,96+(R()-0.5)*40,10+R()*12,165+R()*60|0);
 const tex=new THREE.CanvasTexture(cv);
 const bg=new THREE.PlaneGeometry(1,1);bg.translate(0,0.5,0);bg.setAttribute('izVar',new THREE.InstancedBufferAttribute(new Float32Array(Math.max(1,TREES.length)),1));
 const bm=new THREE.MeshBasicMaterial({color:0xffffff,map:tex,alphaTest:0.45,side:THREE.DoubleSide});
 bm.onBeforeCompile=sh=>{sh.uniforms.izLight=ENV.izLight;
   sh.vertexShader='attribute float izVar;varying float izLodF;\n'+sh.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\n#ifdef USE_UV\nvUv.x=(vUv.x+izVar)/4.0;\n#endif').replace('#include <begin_vertex>',`#include <begin_vertex>
{
#ifdef USE_INSTANCING
vec3 izO=(modelMatrix*instanceMatrix*vec4(0.0,0.0,0.0,1.0)).xyz;
#else
vec3 izO=(modelMatrix*vec4(0.0,0.0,0.0,1.0)).xyz;
#endif
vec2 izTo=cameraPosition.xz-izO.xz;float izA=atan(izTo.x,izTo.y);float izC=cos(izA),izS=sin(izA);
transformed=vec3(transformed.x*izC+transformed.z*izS,transformed.y,-transformed.x*izS+transformed.z*izC);
float izD=length(izTo);izLodF=smoothstep(540.0,600.0,izD);if(izD<535.0)transformed*=0.0;
}`);
   sh.fragmentShader='uniform float izLight;varying float izLodF;\n'+sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nif(fract(sin(dot(floor(gl_FragCoord.xy),vec2(12.9898,78.233)))*43758.5453)>=izLodF)discard;\ndiffuseColor.rgb*=0.35+0.65*izLight;');};
 bm.customProgramCacheKey=()=>'treecut';bm.userData.env=true;
 const bill=new THREE.InstancedMesh(bg,bm,Math.max(1,TREES.length));
 TREES.forEach((t,i)=>{put(bill,i,t[0],t[1],t[2],t[4],t[3],t[4],0,t[6]);bg.attributes.izVar.array[i]=t[5];});
 bill.count=TREES.length;bill.userData.noShadow=true;bill.userData.noWire=true;bill.userData.cat='veg';if(TREES.length)scene.add(bill);ctx.veg.cutouts=TREES.length;}
});
await stage('life');
section('life',()=>{
