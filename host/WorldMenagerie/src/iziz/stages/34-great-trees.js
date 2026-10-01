// ---------- the old trees of Iziz: grown up inside the walls, larger and older than anything in the jungle ----------
const R=mkRng(2201),groundAt=ctx.groundAt,blocked=(x,z)=>ctx.walkBlocked?ctx.walkBlocked(x,z):false;
const trunkG=(()=>{const g=new THREE.CylinderGeometry(0.55,1,1,14,6,false);g.translate(0,0.5,0);const p=g.attributes.position;
  if(p&&p.setX){for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),a=Math.atan2(z,x);const flare=1+0.6*Math.pow(1-Math.min(1,y/0.2),2)*(0.7+0.3*Math.cos(a*5)),gn=1+0.07*Math.sin(a*3+y*9)+0.05*Math.sin(y*23);p.setX(i,x*flare*gn);p.setZ(i,z*flare*gn);}g.computeVertexNormals();}
  return g;})();
const rootG=(()=>{const A0=[0,0,-.5],A1=[0,0,.5],B0=[0,1,-.5],B1=[0,1,.5],C0=[1,0,-.5],C1=[1,0,.5];const tri=[A0,B0,C0,A1,C1,B1,B0,B1,C1,B0,C1,C0,A0,A1,B1,A0,B1,B0];
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(tri.flat(),3));g.computeVertexNormals();return g;})();
const limbG=(()=>{const g=new THREE.CylinderGeometry(0.4,0.7,1,7);g.translate(0,0.5,0);return g;})();
const barkOld=new THREE.MeshLambertMaterial({color:0xffffff});barkOld.userData.tex='bark';
const crownM=new THREE.MeshLambertMaterial({color:0xffffff});crownM.userData.tex='canopy';crownM.userData.reed=0.05;
const litterM=new THREE.MeshLambertMaterial({color:0xffffff,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
// two sets of instanced parts: the city's trees (cast shadows) and the forest's (no shadows, dropped in the far haze)
const barkWild=barkOld.clone();barkWild.userData.lod=[880,940];const crownWild=crownM.clone();crownWild.userData.lod=[880,940];
function partSet(NT,bark,crown){return {NT,trunks:new THREE.InstancedMesh(trunkG,bark,NT),roots:new THREE.InstancedMesh(rootG,bark,NT*6),limbs:new THREE.InstancedMesh(limbG,bark,NT*8),
  crowns:new THREE.InstancedMesh(sph(1,10,7),crown,NT*22),moss:new THREE.InstancedMesh(withVar(ivyHangG,NT*24),ivyMat(true),NT*24),litter:new THREE.InstancedMesh(cyl(1,1,0.06,16),litterM,NT)};}
let NT,trunks,roots,limbs,crowns,moss,litter,nT=0,nR=0,nL=0,nC=0,nM=0,nG=0;
function useSet(S){({NT,trunks,roots,limbs,crowns,moss,litter}=S);nT=nR=nL=nC=nM=nG=0;}
function finishSet(shadow){for(const [im,n] of [[trunks,nT],[roots,nR],[limbs,nL],[crowns,nC],[moss,nM],[litter,nG]]){im.count=n;im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.userData.greatTree=true;im.userData.cat='veg';if(!shadow)im.userData.noShadow=true;if(n)scene.add(im);}
  moss.userData.noShadow=true;litter.userData.noShadow=true;moss.geometry.attributes.izVar.needsUpdate=true;}
useSet(partSet(100,barkOld,crownM));
const KINDS=[
  {name:'a broad shade tree',iz:'saliz',izg:'"house-tree": it shelters like a roof',h:[10,14],r:[1.3,2.0],cr:[11,15],flat:0.55,cols:[0x2f6a34,0x3c7a3a,0x46863e],moss:4},
  {name:'a tall tree',iz:'noriz',izg:'"tall tree"',h:[16,22],r:[1.2,1.7],cr:[7,10],flat:0.75,cols:[0x2a5e3a,0x336e40,0x3f7a48],moss:3},
  {name:'a weeping tree',iz:'vaeliz',izg:'"water-tree": it grows best by pools and wells',h:[9,12],r:[1.2,1.6],cr:[9,12],flat:0.6,cols:[0x5c9a44,0x6aa84a,0x78b050],moss:20},
  {name:'a blossom tree',iz:'shaeliz',izg:'"light-tree", for its pale flowers',h:[9,13],r:[1.1,1.6],cr:[9,12],flat:0.6,cols:[0xe8a0c0,0xf4d0e0,0xd880a8,0x4f8a3a],moss:0}];
const LANDMARKS=[[PALACE.x,PALACE.z,70],[TEMPLE.x,TEMPLE.z,52],[ARENA.x,ARENA.z,64],[NEEDLE.x,NEEDLE.z,16],[25,40,22],[AMPH.x,AMPH.z,27],[0,0,31]];
const img=GROUND_IMG.data,colAt=(x,z)=>{const i=(Math.floor(px(z))*CS+Math.floor(px(x)))*4;return [img[i],img[i+1],img[i+2]];};
const onBoulevard=(x,z,w)=>GATES.some(g=>{const al=x*Math.cos(g)+z*Math.sin(g),pe=Math.abs(-x*Math.sin(g)+z*Math.cos(g)),Rg=wallR(g);return al>15&&al<Rg+5&&pe<w;});
const clearOf=(x,z,r)=>{if(blocked(x,z))return false;for(let k=0;k<10;k++){const a=k/10*6.283;if(blocked(x+Math.cos(a)*r,z+Math.sin(a)*r))return false;}return true;};
// the widest canopy that clears every building taller than its underside
for(const l of lots)if(l._top===undefined){const b=l.fixed?null:bodyOf(l);l._top=terrainH(l.x,l.z)-0.6+(b?b.h+3:(l.h||20));l._rad=Math.hypot(l._hx||l.fx,l._hz||l.fz);}
function canopyFit(x,z,gy,under,want){let cr=want;for(const l of lots){if(Math.abs(x-l.x)>cr+l._rad+1||Math.abs(z-l.z)>cr+l._rad+1)continue;const top=l._top;if(top<gy+under-0.5)continue;
    const dx=x-l.x,dz=z-l.z,c1=Math.cos(l.ry),s1=Math.sin(l.ry),lx=Math.abs(dx*c1-dz*s1)-(l._hx||l.fx),lz=Math.abs(dx*s1+dz*c1)-(l._hz||l.fz),d=Math.hypot(Math.max(lx,0),Math.max(lz,0));
    if(d<cr+0.5)cr=d-0.5;if(cr<5)return cr;}
  return cr;}
const TREES_IN=[];
function grow(x,z,kind,scale,name){const K=KINDS[kind],gy=groundAt(x,z),h=(K.h[0]+R()*(K.h[1]-K.h[0]))*scale,tr=(K.r[0]+R()*(K.r[1]-K.r[0]))*scale,under=h*0.55;
  let cr=(K.cr[0]+R()*(K.cr[1]-K.cr[0]))*scale;cr=Math.min(cr,canopyFit(x,z,gy,under,cr));const minCr=scale>1.4?9:6;if(cr<minCr)return null;
  const lean=[(R()-0.5)*0.12,(R()-0.5)*0.12],tx=x+lean[0]*h,tz=z+lean[1]*h;
  putE(trunks,nT++,x,gy-0.4,z,tr,h+0.4,tr,lean[1],R()*6.28,-lean[0],0x6e5a48+Math.floor(R()*3)*0x020202);
  const nr=5+Math.floor(R()*2);for(let k=0;k<nr&&nR<roots.count;k++){const a=k/nr*6.283+R()*0.4;putE(roots,nR++,x+Math.cos(a)*tr*0.55,gy-0.25,z+Math.sin(a)*tr*0.55,tr*(1.8+R()*1.0),tr*(1.5+R()*0.9),tr*0.32,0,-a,0,0x5e4a38);}
  // limbs from the upper trunk, then the crown hung on their ends
  const nl=kind===1?4:6+Math.floor(R()*2),ends=[];
  for(let k=0;k<nl&&nL<limbs.count;k++){const a=k/nl*6.283+R()*0.5,el=kind===1?0.35+R()*0.25:0.7+R()*0.35,y0=gy+h*(0.62+R()*0.25),len=cr*(kind===1?0.5:0.72)*(0.8+R()*0.3);
    const dx=Math.sin(el)*Math.cos(a),dy=Math.cos(el),dz=Math.sin(el)*Math.sin(a);const bx=tx-(tx-x)*(1-(y0-gy)/h),bz=tz-(tz-z)*(1-(y0-gy)/h);
    dm.position.set(bx,y0,bz);dm.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(dx,dy,dz));dm.scale.set(tr*0.42,len,tr*0.42);dm.updateMatrix();limbs.setMatrixAt(nL,dm.matrix);if(limbs.setColorAt)limbs.setColorAt(nL,col.set(0x6a5644));nL++;
    ends.push([bx+dx*len,y0+dy*len,bz+dz*len]);}
  const crownY=gy+h+(kind===1?2:1);ends.push([tx,crownY,tz]);if(kind===1)ends.push([tx,crownY+cr*0.6,tz],[tx,crownY+cr*1.1,tz]);
  for(const e of ends){const m2=e===ends[ends.length-1]||kind===1?1:2;for(let j=0;j<m2&&nC<crowns.count;j++){const rr2=cr*(kind===1?0.62:0.5)*(0.75+R()*0.35),ox=(R()-0.5)*cr*0.25,oz=(R()-0.5)*cr*0.25;
    const ccol=K.cols[Math.floor(R()*K.cols.length)];put(crowns,nC++,e[0]+ox,e[1]+rr2*0.15,e[2]+oz,rr2,rr2*K.flat,rr2,R()*6.28,ccol);}}
  // moss and weeping curtains under the crown
  for(let k=0;k<K.moss&&nM<moss.count;k++){const a=R()*6.283,rr3=cr*(kind===2?0.55+R()*0.35:0.3+R()*0.4),len=kind===2?h*(0.45+R()*0.25):2+R()*3;
    putE(moss,nM,tx+Math.cos(a)*rr3,crownY-cr*K.flat*0.35,tz+Math.sin(a)*rr3,kind===2?1.6+R():0.8+R()*0.6,len,1,0,R()*6.28,0,kind===2?0x6aa84a:0x8a9a70);moss.geometry.attributes.izVar.array[nM]=Math.floor(R()*3);nM++;}
  put(litter,nG++,x,gy+0.02,z,cr*0.75,1,cr*0.75,0,kind===3?0x8a6a70:0x3a4a2e);
  for(let k=0;k<3;k++){const a=R()*6.283;GLOWFERNS.push(x+Math.cos(a)*cr*0.6,gy+1,z+Math.sin(a)*cr*0.6);}
  const T={x,z,gy,h,tr,cr,kind,name,age:Math.round((tr*120+h*8)/10)*10,wild:Math.hypot(x,z)>wallR(Math.atan2(z,x))};TREES_IN.push(T);
  if(Math.abs(x)<262&&Math.abs(z)<262&&ctx.patrol&&ctx.patrol.NAV.blockDisc)ctx.patrol.NAV.blockDisc(x,z,tr*1.35);
  return T;}
// the first tree: Izor, on the palace hill, the largest open spot below the Salor
{let best=null,bs=-1;for(let r=72;r<=175;r+=4)for(let k=0;k<56;k++){const a=k/56*6.283,x=PALACE.x+Math.cos(a)*r,z=PALACE.z+Math.sin(a)*r;
   if(Math.hypot(x,z)>wallR(Math.atan2(z,x))-40||onBoulevard(x,z,11)||!clearOf(x,z,5.5)||LANDMARKS.slice(1).some(L=>Math.hypot(x-L[0],z-L[1])<L[2]))continue;
   const cf=canopyFit(x,z,groundAt(x,z),8.5,26)-r*0.03;if(cf>bs){bs=cf;best=[x,z];}}   // roomiest spot, nearer the palace preferred
 ctx.firstTreeSearch={bs};
 if(best){const T=grow(best[0],best[1],0,1.6,'Izor');if(T){T.first=true;ctx.firstTree=T;}}}
// the rest: parks and plazas first, never on a boulevard or against a building
{const cand=[];for(let x=-250;x<=250;x+=5)for(let z=-250;z<=250;z+=5){const pp=polar(x,z);if(pp.r>wallR(pp.t)-26)continue;if(LANDMARKS.some(L=>Math.hypot(x-L[0],z-L[1])<L[2]))continue;if(onBoulevard(x,z,10))continue;
   const q=colAt(x,z);let sc=R();if(q[1]>q[0]+15&&q[1]>q[2])sc+=3;else if(q[0]>150&&q[1]>110)sc+=1.5;const rc=Math.hypot(x,z);if(rc>31&&rc<46)sc+=2;
   for(const m of [[-125,60],[60,150],[-70,-140],[120,-150]])if(Math.hypot(x-m[0],z-m[1])<34)sc+=1;for(const w2 of (ctx.wellPos||[]))if(Math.hypot(x-w2[0],z-w2[1])<16)sc+=1.5;
   cand.push([sc,x,z]);}
 cand.sort((a,b)=>b[0]-a[0]);
 for(const [sc,x,z] of cand){if(TREES_IN.length>=95||nT>=NT-1)break;if(sc<0.55)break;
   if(TREES_IN.some(T=>Math.hypot(T.x-x,T.z-z)<T.cr*0.7+9))continue;
   if(!clearOf(x,z,3.8))continue;const sl=Math.abs(meshH(x+1,z)-meshH(x-1,z))+Math.abs(meshH(x,z+1)-meshH(x,z-1));if(sl>0.9)continue;
   const q=colAt(x,z),nearWater=(ctx.wellPos||[]).some(w2=>Math.hypot(x-w2[0],z-w2[1])<16);
   const kind=nearWater?2:(q[1]>q[0]+15?[0,0,1,3][Math.floor(R()*4)]:[0,1,3,0,2][Math.floor(R()*5)]);
   grow(x,z,kind,0.9+R()*0.35,null);}}
finishSet(true);
// the old forest beyond the walls: the same giants, older still, scattered through the jungle
useSet(partSet(130,barkWild,crownWild));
const inside=TREES_IN.length,SKIP=[[SP.x,SP.z,SPR+34]];
if(LAKE.harbor)SKIP.push([LAKE.harbor.centre[0],LAKE.harbor.centre[1],75]);if(DOCKROAD.inn)SKIP.push([DOCKROAD.inn[0],DOCKROAD.inn[1],24]);
{const B=riverBridge();SKIP.push([B.c[0],B.c[1],30]);}
for(let k=0;k<9000&&TREES_IN.length<inside+120&&nT<NT-1;k++){const x=R()*1360-680,z=R()*1360-680,pp=polar(x,z),ro=pp.r-wallR(pp.t);
  if(ro<75)continue;if(SKIP.some(q=>Math.hypot(x-q[0],z-q[1])<q[2]))continue;
  if(GATES.some(g=>{const al=x*Math.cos(g)+z*Math.sin(g),pe=Math.abs(-x*Math.sin(g)+z*Math.cos(g));return al>0&&pe<22;}))continue;   // clear of the causeway roads
  if(riverHit(x,z,16)||lakeE(x,z)<1.3||trailD(x,z)<12||roadD(x,z)<12)continue;
  const gy=meshH(x,z);if(gy<0.5)continue;const sl=Math.abs(meshH(x+2,z)-meshH(x-2,z))+Math.abs(meshH(x,z+2)-meshH(x,z-2));if(sl>2.2)continue;
  if(TREES_IN.some(T=>Math.hypot(T.x-x,T.z-z)<T.cr*0.8+12))continue;
  const wet=Math.abs(riverD(x,z))<60||lakeE(x,z)<1.8;
  const kind=wet&&R()<0.5?2:[0,0,1,1,1,3][Math.floor(R()*6)];
  grow(x,z,kind,1.05+R()*0.5,null);}
ctx.outsideTrees=TREES_IN.length-inside;
finishSet(false);
ctx.greatTrees=TREES_IN;
});
await stage('izani');
section('izani',()=>{
const groundAt=ctx.groundAt;
// every inscription: what it says, how it is built, and what style it is written in
const E=JSON.parse(JSON.stringify(DATA.lex.inscriptions));   // a copy: milestones are added below
for(let k=1;k<=4;k++)E['m'+k]={lines:['#'+k],style:'carve',aspect:1.2,px:56,means:'Milestone '+k+' on the dock road, in tally marks',parts:'tallies: every fifth stroke is crossed'};
for(const k in E)IZ.region(k,E[k]);
ctx.izE=E;
// one instanced mesh draws every inscription (one draw call); each instance maps to its own atlas region
const N=320,tg=new THREE.PlaneGeometry(1,1);tg.setAttribute('izRect',new THREE.InstancedBufferAttribute(new Float32Array(N*4),4));
const tm=new THREE.MeshLambertMaterial({color:0xffffff,map:IZ.texture(),alphaTest:0.35,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
setEnv(tm,{id:'iztext',vpars:'attribute vec4 izRect;\n'});{const f0=tm.onBeforeCompile;tm.onBeforeCompile=sh=>{f0(sh);sh.vertexShader=sh.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\n#ifdef USE_UV\nvUv=mix(izRect.xy,izRect.zw,vUv);\n#endif');};}
const TXT=new THREE.InstancedMesh(tg,tm,N);let nt=0;const INFO=[],PLACED={};
function put(key,x,y,z,heading,w,h,tilt,where){if(nt>=N||!E[key])return;const reg=IZ.region(key,E[key]);putE(TXT,nt,x,y,z,w,h,1,tilt||0,heading,0);tg.attributes.izRect.array.set(reg.r,nt*4);
  const nx=Math.sin(heading),nz=Math.cos(heading),dist=Math.max(7,w*1.9);INFO[nt]={key,where,view:[x+nx*dist,y+Math.max(1.5,h*0.8),z+nz*dist,x,y,z]};(PLACED[key]=PLACED[key]||[]).push(nt);nt++;}
const stoneM=new THREE.MeshLambertMaterial({color:0xc2b294});stoneM.userData.tex='ashlar';
const boardM=new THREE.MeshLambertMaterial({color:0x6b4a2e});boardM.userData.tex='timber';const postM=lamC(0x4a3a2a);
const blocked=(x,z)=>ctx.walkBlocked?ctx.walkBlocked(x,z):false;
const freeSpot=(x,z,r,w)=>{for(let rr=0;rr<=r;rr+=1)for(let a=0;a<16;a++){const t=a/16*6.283,qx=x+Math.cos(t)*rr,qz=z+Math.sin(t)*rr;if([[0,0],[w,0],[-w,0],[0,w],[0,-w]].every(o=>!blocked(qx+o[0],qz+o[1])))return [qx,qz];}return null;};
const block=(x,z,r)=>{if(ctx.patrol&&ctx.patrol.NAV.blockDisc)ctx.patrol.NAV.blockDisc(x,z,r);};
const faceFrom=(x,z,cx,cz)=>Math.atan2(x-cx,z-cz);   // a heading pointing away from (cx,cz)
function stele(key,x,z,cx,cz,where){const p=freeSpot(x,z,14,1.9);if(!p)return;const face=faceFrom(p[0],p[1],cx,cz),gy=groundAt(p[0],p[1]),w=2.8,h=w/E[key].aspect;
  scene.add(mesh(boxG,stoneM,p[0],gy-0.4,p[1],w+0.4,h+1.3,0.55,face));scene.add(mesh(boxG,stoneM,p[0],gy+h+0.9,p[1],w+0.7,0.25,0.75,face));
  for(const sd of [1,-1])put(key,p[0]+Math.sin(face)*0.29*sd,gy+0.65+h/2,p[1]+Math.cos(face)*0.29*sd,face+(sd>0?0:Math.PI),w,h,0,where);block(p[0],p[1],1.9);}
function board(key,x,z,cx,cz,where){const p=freeSpot(x,z,14,1.6);if(!p)return;const face=faceFrom(p[0],p[1],cx,cz),gy=groundAt(p[0],p[1]),w=2.6,h=w/E[key].aspect,sx=Math.cos(face),sz=-Math.sin(face);
  for(const s2 of [-1,1])scene.add(mesh(boxG,postM,p[0]+sx*s2*1.3,gy,p[1]+sz*s2*1.3,0.18,2.2+h,0.18,0));
  scene.add(mesh(boxG,boardM,p[0],gy+1.9,p[1],w+0.2,h+0.15,0.1,face));
  for(const sd of [1,-1])put(key,p[0]+Math.sin(face)*0.06*sd,gy+1.975+h/2,p[1]+Math.cos(face)*0.06*sd,face+(sd>0?0:Math.PI),w,h,0,where);block(p[0],p[1],1.6);}
// ---- the gates: the city's name and each gate's name outside, the motto inside ----
const GK=['vaedun','shaedun','seldun'],GN=['the south gate','the west gate','the north-east gate'];
GATES.forEach((g,gi)=>{const R=wallR(g),cx=R*Math.cos(g),cz=R*Math.sin(g),ox=Math.cos(g),oz=Math.sin(g),hOut=Math.atan2(ox,oz);
  put('izisa',cx+ox*13.08,PLATEAU+32.3,cz+oz*13.08,hOut,8.4,1.2,0,'over '+GN[gi]+', outside');
  put(GK[gi],cx+ox*13.08,PLATEAU+28.4,cz+oz*13.08,hOut,11,1.57,0,'over '+GN[gi]+', outside');
  put('motto',cx-ox*13.08,PLATEAU+29.5,cz-oz*13.08,hOut+Math.PI,10.5,1.5,0,'over '+GN[gi]+', inside');});
// ---- the palace gates: a stone plaque each ----
for(const PG of PGATES){const R=62+3*Math.sin(5*PG),gx=PALACE.x+R*Math.cos(PG),gz=PALACE.z+R*Math.sin(PG),gy=terrainH(gx,gz)-3,ox=Math.cos(PG),oz=Math.sin(PG);
  scene.add(mesh(boxG,stoneM,gx+ox*6.6,gy+16.1,gz+oz*6.6,0.9,1.5,7.2,-PG));put('salor',gx+ox*7.08,gy+16.85,gz+oz*7.08,Math.atan2(ox,oz),6.2,1.24,0,'over a palace gate');}
// ---- the outer wall: the motto and the proverb cut into the inner face, and a little paint ----
{const lean=WALL_LEAN;for(const sg of (ctx.wallSegs||{}).OUT||[]){if(sg.i%3!==1||sg===SEWER.sg)continue;
  const GR=['g_war','g_vesh','g_names','g_iziz','g_cats','g_bread','g_watch','g_izis','g_vaelis','g_days','g_days2','p_tree','p_star','p_boat','p_burst','p_beast','p_fish'];
  if(sg.i%7!==3&&sg.i%7!==5){const n2=hash3(sg.i,1,201)<0.45?2:1;for(let k=0;k<n2;k++){if(hash3(sg.i,k,202)>0.75)continue;const key=GR[Math.floor(hash3(sg.i,k,203)*GR.length)],lx=n2>1?(k?4.2:-4.2):(hash3(sg.i,k,204)-0.5)*6;
    const pw=0,p0=wpt(sg,lx,-7.5),gy=terrainH(p0[0],p0[1]),y=gy+1.9+hash3(sg.i,k,205)*1.2,w=E[key].pic?2.2:Math.min(5,1.3*E[key].aspect),h=w/E[key].aspect;
    const q=wpt(sg,lx,-(6.5-lean*(y-sg.base)+0.06));put(key,q[0],y,q[1],Math.atan2(-sg.n[0],-sg.n[1]),w,h,-Math.atan(lean),'painted on the inside of the outer wall');}continue;}
  const kind=sg.i%7===3?'motto':'proverb';
  const p0=wpt(sg,0,-7.5),gy=terrainH(p0[0],p0[1]),graf=kind.startsWith('g_'),y=gy+(graf?2.4:6.6),w=graf?4.2:(kind==='proverb'?13:10.5),h=w/E[kind].aspect;
  const q=wpt(sg,0,-(6.5-lean*(y-sg.base)+0.06));put(kind,q[0],y,q[1],Math.atan2(-sg.n[0],-sg.n[1]),w,h,-Math.atan(lean),graf?'painted on the inside of the outer wall':'cut into the inside of the outer wall');}}
// ---- paint in the gate passages and on the back of the dock warehouse ----
GATES.forEach((g,gi)=>{const R=wallR(g),cx=R*Math.cos(g),cz=R*Math.sin(g),ox=Math.cos(g),oz=Math.sin(g),px=-Math.sin(g),pz=Math.cos(g),GR=['g_war','g_vesh','g_names','g_iziz','g_cats','g_bread','g_watch','g_izis','g_vaelis','g_days','g_days2','p_tree','p_star','p_boat','p_burst','p_beast','p_fish'];
  for(const sd of [-1,1]){const key=GR[Math.floor(hash3(gi,sd,211)*GR.length)],w=E[key].pic?2:Math.min(4,1.2*E[key].aspect),h=w/E[key].aspect,along=(hash3(gi,sd,212)-0.5)*12;
    put(key,cx+ox*along+px*sd*6.43,PLATEAU+2.2+h/2,cz+oz*along+pz*sd*6.43,Math.atan2(-px*sd,-pz*sd),w,h,0,'painted inside '+GN[gi]);}});
if(LAKE.harbor){const H=LAKE.harbor,wy=LAKE.whSign?LAKE.whSign.y-5.25:LAKE.L+1;for(const [vv,key] of [[8,'p_fish'],[15,'g_cats']]){const q=H.W(-15.58,vv),w=E[key].pic?2:3.4,h=w/E[key].aspect;put(key,q[0],wy+2.2,q[1],Math.atan2(-H.u[0],-H.u[1]),w,h,0,'painted on the back of the dock warehouse');}}
// ---- the sewer outfall's lintel ----
if(SEWER.sg){const sg=SEWER.sg,q=wpt(sg,0,6.5+0.53);put('dusren',q[0],sg.base+5.55,q[1],Math.atan2(sg.n[0],sg.n[1]),4.4,0.63,0,'over the sewer outfall');}
// ---- standing stones at the landmarks ----
const ctr=(x,z)=>[x,z];
stele('st_temple',TEMPLE.x,TEMPLE.z+47,TEMPLE.x,TEMPLE.z,'before the temple');
stele('st_arena',ARENA.x+62,ARENA.z+6,ARENA.x,ARENA.z,'at the arena forecourt');
stele('st_tower',NEEDLE.x,NEEDLE.z+17,NEEDLE.x,NEEDLE.z,'at the foot of the observation tower');
stele('st_dome',25+21,40,25,40,'beside the dome hall');
stele('st_amph',AMPH.x+18,AMPH.z+20,AMPH.x,AMPH.z,'by the amphitheatre');
{const d=Math.hypot(SP.x,SP.z),ux=-SP.x/d,uz=-SP.z/d;stele('st_port',SP.x+ux*(SPR+8),SP.z+uz*(SPR+8),SP.x,SP.z,'at the edge of the spaceport');}
stele('st_square',0,32,0,0,'in the central square');stele('st_square',0,-32,0,0,'in the central square');
{const t=LAKE.jetty+0.14,q=LAKE.at(1.2,t);stele('st_lake',q[0],q[1],LAKE.cx,LAKE.cz,'on the lake shore by the jetty');}
{const r=wallR(RIVER.t0)+52,t=RIVER.tc(r),w=RIVER.hw(r-wallR(t))+6;stele('st_falls',r*Math.cos(t)-Math.sin(t)*w,r*Math.sin(t)+Math.cos(t)*w,r*Math.cos(t),r*Math.sin(t),'above the falls');}
if(ctx.firstTree){const T=ctx.firstTree,d=Math.hypot(T.x-PALACE.x,T.z-PALACE.z),ux=(T.x-PALACE.x)/d,uz=(T.z-PALACE.z)/d;stele('st_izor',T.x+ux*(T.tr*2.6+3),T.z+uz*(T.tr*2.6+3),T.x,T.z,'beneath Izor, the great tree');}
for(const wp of (ctx.wellPos||[]))stele('st_well',wp[0]+2.4,wp[1]+1.2,wp[0],wp[1],'beside a well');
// ---- boards: barracks, markets, the rope bridge ----
for(const b of BARRACKS)board('thuransa',PALACE.x+83*Math.cos(b.a),PALACE.z+83*Math.sin(b.a),PALACE.x,PALACE.z,'outside a barracks');
for(const m of [[-125,60],[60,150],[-70,-140]])board('vemeth',m[0],m[1]+19,m[0],m[1],'at the edge of a market');
{const B=riverBridge(),e=[B.e0[0]-B.n[0]*3,B.e0[1]-B.n[1]*3];board('kalis',e[0]+B.a[0]*3.5,e[1]+B.a[1]*3.5,B.c[0],B.c[1],'at the rope bridge');}
// ---- the dock road: milestones in tallies, the signpost, the inn ----
(DOCKROAD.milestones||[]).forEach((m,k)=>{const nx=Math.sin(m.ry),nz=Math.cos(m.ry);if(k<4)put('m'+(k+1),m.x-nx*0.2,m.y+0.35,m.z-nz*0.2,m.ry+Math.PI,0.42,0.35,0,'on a dock-road milestone');});
if(DOCKROAD.signpost){const s2=DOCKROAD.signpost;for(const sd of [1,-1]){put('sp_docks',s2.x+0.9,s2.y+3.075,s2.z+0.05*sd,sd>0?0:Math.PI,1.6,0.32,0,'on the dock-road signpost');put('sp_city',s2.x+0.05*sd,s2.y+2.575,s2.z-0.9,sd>0?Math.PI/2:-Math.PI/2,1.6,0.32,0,'on the dock-road signpost');}}
if(DOCKROAD.innSign){const q=DOCKROAD.innSign;scene.add(mesh(boxG,boardM,q.x+Math.sin(q.ry)*-0.05,q.y-0.35,q.z+Math.cos(q.ry)*-0.05,3.2,0.8,0.1,q.ry));put('dometh',q.x+Math.sin(q.ry)*0.04,q.y+0.05,q.z+Math.cos(q.ry)*0.04,q.ry,3.0,0.6,0,'over the waystation door');}
if(LAKE.whSign){const q=LAKE.whSign;put('naeleth',q.x,q.y,q.z,q.ry,5.6,0.86,0,'on the docks warehouse');}
// ---- shops: a painted board over the door ----
const SHOPS=['muneth','salireth','vaelireth','sholeth','zatheth','feleth','izireth','luleth','muneth','sholeth'];let shops=0;
for(const l of lots){if(l.fixed)continue;const b=bodyOf(l);if(!b)continue;
  if(l.bathSign){const q=l.bathSign;put('huleth',q.x,q.y,q.z,q.ry,2.0,0.33,0,'on the bathhouse sign');continue;}
  let key=null;if(l.forge)key='koreth';else if(['box','tier','midrise'].includes(l.kind)&&!l.construction&&b.w>=4.5&&hash3(l.x,l.z,181)<0.2){const pp=polar(l.x,l.z),f=pp.r/wallR(pp.t);if(f>0.2&&f<0.92&&shops<46)key=SHOPS[Math.floor(hash3(l.x,l.z,182)*SHOPS.length)];}
  if(!key)continue;
  if(!['box','tier','midrise'].includes(l.kind)){const q=loc(l.x,l.z,b.w/2+3.2,-2.4,l.ry);board(key,q[0],q[1],l.x,l.z,'outside the smithy');l.sign=key;continue;}
  const y=terrainH(l.x,l.z)-0.6,w=Math.min(2.6,b.w*0.55),h=w/E[key].aspect,q=loc(l.x,l.z,0,b.d/2+0.3,l.ry),q2=loc(l.x,l.z,0,b.d/2+0.37,l.ry);
  scene.add(mesh(boxG,boardM,q[0],y+4.35,q[1],w+0.15,h+0.12,0.12,l.ry));put(key,q2[0],y+4.41+h/2,q2[1],l.ry,w,h,0,'over a shop door');l.sign=key;shops++;}
// ---- a little paint on side walls in the outer ring ----
let graf=0;const GRL=['g_war','g_vesh','g_names','g_iziz','g_cats','g_bread','g_watch','g_izis','g_vaelis','g_days','g_days2','p_tree','p_star','p_boat','p_burst','p_beast','p_fish'];for(const l of lots){if(graf>=36)break;if(l.fixed||!['box','tier','pueblo','midrise'].includes(l.kind))continue;const pp=polar(l.x,l.z);if(pp.r<0.35*wallR(pp.t)||hash3(l.x,l.z,191)>0.3)continue;
  const b=bodyOf(l),key=GRL[Math.floor(hash3(l.x,l.z,193)*GRL.length)],w=Math.min(E[key].pic?1.8:3.2,b.d*0.6),h=w/E[key].aspect,sd=hash3(l.x,l.z,192)<0.5?-1:1,lz=(hash3(l.x,l.z,194)-0.5)*Math.max(0,b.d-w-0.6),yy=1.1+hash3(l.x,l.z,195)*0.8;
  if(!claimFace(l,sd>0?'+x':'-x',lz,w/2,yy,yy+h))continue;const q=loc(l.x,l.z,sd*(b.w/2+0.15),lz,l.ry);
  put(key,q[0],terrainH(l.x,l.z)-0.6+yy+h/2,q[1],l.ry+sd*Math.PI/2,w,h,0,'painted on a house wall');l.graffiti=key;graf++;}
TXT.count=nt;TXT.instanceMatrix.needsUpdate=true;tg.attributes.izRect.needsUpdate=true;TXT.userData.noShadow=true;TXT.userData.noWire=true;TXT.userData.izInfo=INFO;scene.add(TXT);
ctx.izani={texts:nt,shops,graffiti:graf,placed:PLACED,info:INFO};
});
await stage('gadgets');
section('gadgets',()=>{
