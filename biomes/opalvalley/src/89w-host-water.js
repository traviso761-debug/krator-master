// ================================================================= HOST — the water (core/water; PLAN.md sections 6 and 8)
// THE CHAIN (every station but the glacier): ONE WATER.terraces (ext 53, drawn by 53b) over the stage's treads, east to west: each lake, each rimstone
// pool down a riser, each stream on its bench a tread at its level; a fall down every riser between two (the cataract's two drops at the mouth). Its
// width follows the lakes' lenses (the stage's treadHW), so the water the eye sees is the water the ground was carved for, and the levels step down tread
// by tread (verify.py asserts it). Still water: no surf, no breakers (the owner's rule, 2026-11-02). The pools' colours are the station's: the upper
// tarns milky turquoise with rock flour (opaque), the sinter lakes clear blue-green over white sinter, the canyon pools warm jade.
// THE GLACIER: the proglacial pool behind the terminal moraine (WATER.open over KGLACIER's basin), the outwash (WATER.flow) and its rock bar (WATER.fall).
// THE MOUTH: the river west from the plunge pool through the gorge (WATER.flow). THE SEEPS (the middle bed): small hot pools (WATER.spring, geyser/52).
// Each draw's mesh carries probe points (the lakes' and the falls' middles), so the inspector's records of them hold something.
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone(),r=giantRing.clone();env.add(g);env.add(r);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x8a8478)});}
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const SWELL=[[.012,6,35,0,.02],[.008,3.5,-50,1.3,.02]];
function maskOf(box,cell,fn){const nx=Math.round((box[2]-box[0])/cell),nz=Math.round((box[3]-box[1])/cell),d=new Uint8Array(nx*nz);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)if(fn(box[0]+(i+.5)*cell,box[1]+(j+.5)*cell))d[j*nx+i]=255;return{x0:box[0],z0:box[1],cell,nx,nz,data:d};}
const SPRING_MATS=new Map();
function spring(key,name,x,z,r,level,temp,mineral,o){const S=WATER.spring(Object.assign({key,name,x,z,r,level,temp,mineral,milky:.5,boil:0,steam:0},o||{}));
 const d=WATER.drawSpring(S,{THREE,scene,fog:scene.fog,mats:SPRING_MATS,renderOrder:1});d.mesh.userData.probeSkip=true;d.mesh.userData.inspectLabel=name;return S;}
let BIGW=null,BIG_DRAW=null,MIRROR_MATS=[];const W_OUT={station:SKEY};
// THE CHAIN
const TERR_WATER=(function(){if(!TREADS)return null;const WC=SITE.water,X0=Math.min(TREADS[0].x0,TERR.R*1.1),X1=TREADS[TREADS.length-1].x1;
 const pts=[],xs=[],ss=[];let s=0,prev=null;for(let x=X0;x>=X1-1e-6;x-=10){const p=[x,axisZ(x)];if(prev)s+=Math.hypot(p[0]-prev[0],p[1]-prev[1]);pts.push(p);xs.push(x);ss.push(s);prev=p;}
 if(xs[xs.length-1]>X1){const p=[X1,axisZ(X1)];s+=Math.hypot(p[0]-prev[0],p[1]-prev[1]);pts.push(p);xs.push(X1);ss.push(s);}
 const sOf=x=>{x=clamp(x,X1,X0);let i=0;while(i+2<xs.length&&xs[i+1]>x)i++;return lerp(ss[i],ss[i+1],(xs[i]-x)/Math.max(1e-6,xs[i]-xs[i+1]));};
 const xOf=s=>{s=clamp(s,0,ss[ss.length-1]);let i=0;while(i+2<ss.length&&ss[i+1]<s)i++;return lerp(xs[i],xs[i+1],(s-ss[i])/Math.max(1e-6,ss[i+1]-ss[i]));};
 const treads=TREADS.filter(t=>t.x1<X0).map(t=>({s0:sOf(Math.min(t.x0,X0)),s1:sOf(t.x1),y:t.y}));
 const width=s=>{const x=xOf(s),ti=FLOOR.tread(x);if(ti>=0){const t=TREADS[ti];return 2*treadHW(t,x)+(t.kind==='stream'?0:6);}return CH*1.4;};
 const TR=WATER.terraces({name:SITE.name+': the lakes and their falls',line:pts,treads,width,speed:2.4,spread:4});
 const mixc=(a,b,k)=>new THREE.Color(a).lerp(new THREE.Color(b),k);
 const D=WATER.drawTerraces(TR,{pool:{color:0xffffff,roughness:WC.milk>.6?.18:.08,metalness:.05,envMapIntensity:.5,renderOrder:1,
   gradient:{centre:lin(mixc(WC.deep,0xd8ecea,WC.milk*.55).getHex()).getHex(),rim:lin(mixc(WC.shallow,0xf0f6f2,WC.milk*.35).getHex()).getHex(),power:1.2}},
  fall:{color:lin(SITE.water.milk>.6?0xe6f0ee:0xeaf2f0),opacity:.9,rowStep:2,cols:10,spray:'drop',plungeR:SITE.dam==='cataract'?36:8,renderOrder:3}});
 const pm=D.pools&&D.pools.mesh;if(pm){pm.userData.inspectLabel=SITE.name+': the lakes';pm.userData.probePoints=[].concat(...LAKES.map(L=>{const x=(L.x0+L.x1)/2;return[x,L.y-1,axisZ(x)];}));MIRROR_MATS.push(pm.material);}
 const fm=D.falls&&D.falls.mesh;if(fm){const P=[];for(let i=0;i+1<SITE.chain.length;i++){const A=SITE.chain[i],B=SITE.chain[i+1],x=(A.x1+B.x0)/2;if(A.y-B.y>=5)P.push(x,(A.y+B.y)/2,axisZ(x));}fm.userData.probePoints=P;}
 Object.assign(W_OUT,{treads:TR.pools.length,falls:TR.falls.length,levels:TR.treads.map(t=>t.y),lakeLevels:LAKES.map(L=>L.y)});
 return{TR,D,sOf,xOf};})();
// THE MOUTH'S RIVER: from the plunge pool west through the gorge toward the Rift floor
if(RIVER){const P=[];for(let x=RIVER_X0-4;x>=-TERR.R*1.1;x-=16)P.push([x,axisZ(x),riverY(x)-.3]);
 const RV=WATER.flow({name:'The Opal River (Nahr al-Yaqut, proposed; r682), through the gorge',pts:P,width:RIVER.w,speed:2.6,rapids:[.04,.12]});
 const RD=WATER.drawFlow(RV,{shallow:lin(SITE.water.shallow),deep:lin(SITE.water.deep),color:0xffffff,roughness:.12,metalness:.05,envMapIntensity:.45,step:10,across:6,margin:1,depthBias:2,renderOrder:2,pick:true});
 RD.mesh.userData.inspectLabel='The Opal River (the gorge)';W_OUT.river=P.length;
 REGISTER({name:'The Opal River\'s gorge (cut back into the old fan by the cataract)',x:-1000,z:axisZ(-1000),y:riverY(-1000)-4,r:1800,h:120,tags:{hazard:{kind:'drown',danger:.6}}});}
// THE GLACIER'S WATER
if(GL){if(POND){let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;for(let z=-900;z<=900;z+=8)for(let x=GL.snout-900;x<=GL.snout+200;x+=8)if(waterH(x,z)===POND.level){x0=Math.min(x0,x);z0=Math.min(z0,z);x1=Math.max(x1,x);z1=Math.max(z1,z);}
  if(x1>x0){const BOX=[x0-20,z0-20,x1+20,z1+20];BIGW=WATER.open({name:POND.name,level:POND.level,swell:SWELL,field:0,bounds:BOX,bed:terrainH,bedCell:6,mask:maskOf(BOX,6,(x,z)=>waterH(x,z)===POND.level)});
   BIG_DRAW=WATER.draw(BIGW,{surf:false,breakers:false,renderOrder:1,roughness:.2,metalness:.05,envMapIntensity:.5,shallow:lin(0xb4dcd8),deep:lin(0x4a98a8)});
   BIG_DRAW.mesh.userData.inspectLabel=POND.name;BIG_DRAW.mesh.userData.probePoints=[(x0+x1)/2,POND.level-1,(z0+z1)/2];MIRROR_MATS.push(BIG_DRAW.mesh.material);W_OUT.pond=POND.level;}}
 if(OUTW&&OUTW.pts.length>2){const P=OUTW.pts;const cut=OUTW.lip?P.findIndex(p=>p[0]===OUTW.lip[0]&&p[1]===OUTW.lip[1]):-1,fi=OUTW.foot?P.findIndex(p=>p[0]===OUTW.foot[0]&&p[1]===OUTW.foot[1]):-1;
  const segs=cut>0&&fi>cut?[P.slice(0,cut+1),P.slice(fi)]:[P];
  segs.forEach((S,k)=>{if(S.length<2)return;const F=WATER.flow({name:'The outwash (milky with rock flour)',pts:S,width:OUTW.hw*2,speed:2.2,rapids:[.04,.1]});
   const d=WATER.drawFlow(F,{shallow:lin(0xc4e0dc),deep:lin(0x7ab0b4),color:0xffffff,roughness:.16,metalness:.05,envMapIntensity:.4,step:8,across:5,margin:1,depthBias:2,renderOrder:2,pick:true});d.mesh.userData.inspectLabel='The outwash';});
  if(segs.length===2){const L=OUTW.lip,Fo=OUTW.foot,dx=Fo[0]-L[0],dz=Fo[1]-L[1],l=Math.hypot(dx,dz)||1,ux=dx/l,uz=dz/l;
   const FA=WATER.fall({name:'The first milky cascade (the outwash over its rock bar)',lip:[[L[0]+uz*OUTW.hw,L[1]-ux*OUTW.hw,L[2]+.2],[L[0]-uz*OUTW.hw,L[1]+ux*OUTW.hw,L[2]+.2]],dir:[ux,uz],drop:L[2]-Fo[2],foot:Fo,fit:true,spread:3,face:terrainH,faceLift:.5,faceN:24});
   const FD=WATER.drawFall(FA,{color:lin(0xe8f0ee),opacity:.9,rowStep:2,cols:8,spray:'drop',plungeR:10,footK:.8,envMapIntensity:.25,renderOrder:3,pick:true});FD.mesh.userData.inspectLabel='The first milky cascade';
   W_OUT.cascade=Math.round(L[2]-Fo[2]);
   REGISTER({name:'The first milky cascade (the outwash over its rock bar, '+Math.round(L[2]-Fo[2])+' m)',x:(L[0]+Fo[0])/2,z:(L[1]+Fo[1])/2,y:Fo[2]-3,r:Math.max(20,l/2+10),h:L[2]-Fo[2]+12,tags:{hazard:{kind:'fall',danger:.6}}});
   FD.mesh.userData.probePoints=[(L[0]+Fo[0])/2,(L[2]+Fo[2])/2,(L[1]+Fo[1])/2];}
  W_OUT.outwash=P.length;
  REGISTER({name:'The outwash (outburst surges come down it: PLAN.md section 5)',x:(P[0][0]+P[P.length-1][0])/2,z:(P[0][1]+P[P.length-1][1])/2,y:Math.min(P[0][2],P[P.length-1][2])-3,r:Math.hypot(P[0][0]-P[P.length-1][0],P[0][1]-P[P.length-1][1])/2,h:Math.abs(P[0][2]-P[P.length-1][2])+12,
   tags:{hazard:{kind:'drown',danger:.5}}});}}
// THE SEEPS' HOT POOLS (the middle bed): small and milky, crusted round
(SITE.vents||[]).forEach((v,i)=>{const y=terrainH(v.x,v.z);spring('seep'+i,'A warm silica seep\'s pool ('+v.T+' degC)',v.x,v.z,6+v.reach*.04,y+.12,clamp((v.T-40)/60,0,1),'sinter');});
if(WATER.breakupFlows)WATER.breakupFlows();   /* core/water ext/56: the streams' glint broken up */
window._water=Object.assign({surfaces:WATER.surfaces.length},W_OUT);
