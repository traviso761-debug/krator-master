// ---------- 5 & 6. infill buildings with district character ----------
const bldM=new THREE.MeshLambertMaterial({color:0xffffff});bldM.userData.tex='sand';bldM.userData.weather=true;
const boxes=new THREE.InstancedMesh(boxG,bldM.clone(),9000);
const frusts=new THREE.InstancedMesh(frusG85,bldM.clone(),1500);
const domes=new THREE.InstancedMesh(hemiG,bldM.clone(),900);
const lights=new THREE.InstancedMesh(withLightT(boxG,1500),lampHook(glowM.clone(),'L'),1500);
domes.material.userData.weather=false;let nb=0,nf=0,nd=0,nl=0;
const dm=new THREE.Object3D(),col=new THREE.Color();const glowPts=[];const glowSched=[];const animHooks=[];   // glowPts: 7 values per light; glowSched[i] = 0 always, 1 night-boosted (default), 2 arena hours, 3 windows, 4 concert   // [x,y,z,r,g,b,size]
let curDist='houses';
const DGROUP=DATA.city.districts.groups;
const DISTRICTS={};for(const k in DATA.city.districts.names){const [n,c]=DATA.city.districts.names[k];DISTRICTS[k]=[n,parseInt(c.slice(1),16)];}
const DCOLV={};for(const k in DISTRICTS)DCOLV[k]=new THREE.Color(DISTRICTS[k][1]);
function markDist(im,idx){const d=im.userData.dcol;if(d&&idx*3+2<d.length){const c=DCOLV[curDist];d[idx*3]=c.r;d[idx*3+1]=c.g;d[idx*3+2]=c.b;}}
let vegHide=false;   // set while a jungle plant that would stand in the river is generated
let curLot=null;
function put(im,idx,x,y,z,sx,sy,sz,ry,color){markDist(im,idx);if(im.userData.lotOf)im.userData.lotOf[idx]=curLot;dm.position.set(x,y,z);if(vegHide)dm.scale.set(0,0,0);else dm.scale.set(sx,sy,sz);dm.rotation.set(0,ry,0);dm.updateMatrix();im.setMatrixAt(idx,dm.matrix);if(color!==undefined)im.setColorAt(idx,col.set(color));}
function putE(im,idx,x,y,z,sx,sy,sz,ex,ey,ez,color){dm.position.set(x,y,z);if(vegHide)dm.scale.set(0,0,0);else dm.scale.set(sx,sy,sz);dm.rotation.set(ex,ey,ez,'YXZ');dm.updateMatrix();im.setMatrixAt(idx,dm.matrix);dm.rotation.order='XYZ';if(color!==undefined)im.setColorAt(idx,col.set(color));}
const B=(...a)=>{if(nb<9000)put(boxes,nb++,...a);};
const F=(...a)=>{if(nf<1500)put(frusts,nf++,...a);};
const D=(...a)=>{if(nd<900)put(domes,nd++,...a);};
function glowPush(x,y,z,r,g,b,sz,t){const i=glowPts.length/7;glowPts.push(x,y,z,r,g,b,sz);if(t)glowT[i]=t;}
const L=(...a)=>{if(nl<1500){const hx=hash3(a[0],a[2],11),on=17.4+1.6*hx,off=hash3(a[0],a[2],12)<0.2?29.4+hx:22+3*hash3(a[0],a[2],13);setLT(lights,nl,on,off,-1);put(lights,nl++,...a,0xffd34a);glowPush(a[0],a[1]+a[4]*0.5,a[2],1,0.83,0.3,3.5+a[4],[on,off,-1]);}};
const PAL=[0xe9cb8c,0xdcb474,0xcf9d5b,0xe2ab5e,0xbf8a44,0xf1dba6,0xd8893c,0xc8a26a,0xe6bd7e,0xd4a05a];
const PAL_BRUT=[0xb9a58a,0xa8957a,0xc7b294,0x9c8b70,0xd2bc9c];

const tyrellG=rectFrus(0.42,0.42), wedgeG=rectFrus(0.55,0.1), towerWedgeG=rectFrus(0.36,0.28);
const pent=new THREE.CylinderGeometry(0.88,1,1,5,1);pent.rotateY(Math.PI/5);pent.translate(0,0.5,0);
const hept=new THREE.CylinderGeometry(0.8,1,1,7,1);hept.translate(0,0.5,0);
const tyrells=new THREE.InstancedMesh(tyrellG,bldM.clone(),900), wedges=new THREE.InstancedMesh(wedgeG,bldM.clone(),900);
const pents=new THREE.InstancedMesh(pent,bldM.clone(),700), hepts=new THREE.InstancedMesh(hept,bldM.clone(),700);
let nty=0,nw=0,np=0,nh=0;
const Ty=(...a)=>{if(nty<900)put(tyrells,nty++,...a);};
const W=(...a)=>{if(nw<900)put(wedges,nw++,...a);};
const P5=(...a)=>{if(np<700)put(pents,np++,...a);};
const P7=(...a)=>{if(nh<700)put(hepts,nh++,...a);};
const cityGreen=[];
// gabled roofs, awnings, neon signage, vigas
const gableG=rectFrus(1,0.04);
const gableM=new THREE.MeshLambertMaterial({color:0xffffff});gableM.userData.tex='shingle';const gables=new THREE.InstancedMesh(gableG,gableM,1200);let ng=0;
const Ga=(...a)=>{if(ng<1200)put(gables,ng++,...a);};
const awnM=new THREE.MeshLambertMaterial({color:0xffffff});awnM.userData.tex='stripes';const awnings=new THREE.InstancedMesh(boxG,awnM,2500);awnings.userData.noShadow=true;let naw=0;
const Aw=(...a)=>{if(naw<2500)put(awnings,naw++,...a);};
const neons=new THREE.InstancedMesh(withLightT(boxG,1500),lampHook(new THREE.MeshBasicMaterial({color:0xffffff}),'N'),1500);let nne=0;
const Ne=(...a)=>{if(nne<1500){const hx=hash3(a[0],a[2],21),on=17.2+1.8*hx,off=hash3(a[0],a[2],22)<0.15?29.5+hx:23.5+3*hash3(a[0],a[2],23),sd=hash3(a[0],a[2],24)*100;setLT(neons,nne,on,off,sd);put(neons,nne++,...a);const c=col.set(a[7]);glowPush(a[0],a[1]+a[4]*0.5,a[2],c.r,c.g,c.b,3+Math.min(a[4],8)*0.6,[on,off,sd]);}};
const vigaM=new THREE.MeshLambertMaterial({color:0x4a3220});vigaM.userData.tex='timber';const vigas=new THREE.InstancedMesh(boxG,vigaM,4000);vigas.userData.noShadow=true;let nvg=0;
const Vg=(...a)=>{if(nvg<4000)put(vigas,nvg++,...a);};
const AWN=[0xc9442a,0xe0a030,0x2f8f8a,0xd9d1b0,0x7a3d8a,0xb8552a];
