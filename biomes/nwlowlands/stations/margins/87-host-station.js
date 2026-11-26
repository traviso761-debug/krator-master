// ================================================================= HOST — STATION 2's own life (PLAN-STATIONS.md), after the kit's forest
// Every place a lattice cell's KRAND.hash, each tree a reseed of it: nothing the kit placed moves.
//   tall grass   the kit's grass tuft, 1.2-2.6 m on the flats, thinned on this year's burns; its season material goes gold in the dry months
//   mounds       core/terrain KSTACKS.mounds: clay spires on the flats, each carrying a palm or two above the flood
//   floodpalm    a cousin of the kit's mist palm: short, heavy, in groves on the rises (the carandá's kind)
//   floodfig     a cousin of the column kauri: low, wide, heavily buttressed, on the channels' banks
//   floating meadows   moss and grass mats on the pools; they ride the flood (89w)
function stationBuild(){if(!NWQ_ON('station'))return null;
 const W=8205,LT=NWLOW.LOD.tree,out={grass:0,mound:0,floodpalm:0,floodfig:0,floatmat:0},S=KSPACE.create({cell:60});NWLOW.TREES.forEach(T=>S.insert(T,T.x,T.z,T.rb*1.4+2));
 const CL=h=>new THREE.Color(h),{qEuler}=BIO.fn,cells=(cell,salt,fn)=>{const N=Math.ceil(TERR.R/cell);for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){const h=KRAND.hash(W,i,j,salt),u=k=>KRAND.unit(KRAND.hash(h,k,0,salt)),x=(i+u(1))*cell,z=(j+u(2))*cell;if(Math.hypot(x,z)>TERR.R-160)continue;fn(x,z,h,u);}};
 const PALM=BIO.kin('nwlowlands.mistpalm',{key:'floodpalm',name:'Flood palm',scale:{H:.55,rb:1.3,crownR:.8},tags:{koppen:['Aw']}}),FIG=BIO.kin('nwlowlands.kauri',{key:'floodfig',name:'Flood fig',scale:{H:.45,rb:.8,crownR:1.3},habit:{buttress:2.6},tags:{koppen:['Aw','Am'],riparian:'yes'}});
 const grow=(K,x,z,h,key)=>{reseed(h);const T=K.make(x,terrainH(x,z),z),lv=BIO.lodD(x,z)<1100?2:1;BIO.owner=[x,z];BIO.range=LT;BIO.minRange=0;K.grow(T,lv);BIO.range=1e9;BIO.minRange=LT;K.grow(Object.assign({},T),0);BIO.owner=null;BIO.range=null;BIO.minRange=0;S.insert(T,x,z,(T.rb==null?1:T.rb)*1.4+2);REGISTER({name:K.name,kind:'tree',label:K.name,x,z,y:T.y0,r:T.crownR==null?6:T.crownR,h:T.H});out[key]++;};
 const free=(x,z,r)=>!S.some(x,z,r,()=>true)&&BIO.clearOf(x,z,r)&&WF.shore(x,z)>r;
 BIO.cur='nwlow/station';BIO.kitWrap('nwlowlands',{p(){if(!BIO.defs.tallgrass)BIO.def('tallgrass',BIO.defs.grass.raw,NWLOW.MAT.grass,{label:'Tall grass (the flats)'});
  cells(8,0x7101,(x,z,h,u)=>{const d=FIELD.dry(x,z);if(d<.3||u(3)>d*.8)return;if(!BIO.clearOf(x,z,.5)||WF.shore(x,z)<1)return;const b=burnAge(x,z);if(b<.5&&u(4)>.1)return;const k=b<2?.45:1,y=terrainH(x,z),H=(1.6+1.6*u(5))*k,w=H*1.3;
   BIO.range=NWLOW.LOD.farFloor;BIO.put('tallgrass',[x,y-.05,z],qEuler(0,u(6)*6.283,0),[w,H,w],CL(0xb7b070).lerp(CL(0x8fa050),u(7)));BIO.range=null;out.grass++;});
  cells(42,0x7104,(x,z,h,u)=>{const a=WF.flow(x,z),sh=WF.shore(x,z);if(sh<6||a>90||u(3)>.4||!free(x,z,6))return;grow(FIG,x,z,h,'floodfig');});
  cells(70,0x7105,(x,z,h,u)=>{if(MARGINS.savK(x,z)<.4||MARGINS._flow(x,z)>.3||u(3)>.5)return;const g=fbm(x*.003,z*.003,621,2);if(g<.52)return;for(let k=0,n=2+Math.floor(u(4)*5);k<n;k++){const a=u(10+k)*6.283,r=6+u(20+k)*26,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;if(free(px,pz,3))grow(PALM,px,pz,KRAND.hash(h,k),'floodpalm');}});
 }}).p();
 // the mounds: one mesh (the hyperjungle savanna's pattern), a palm on the mound's skirt
 if(typeof KSTACKS!=='undefined'&&KSTACKS.mounds){const M=KSTACKS.mounds({id:'nwl-mound',world:W,cell:80,x0:-TERR.R+100,z0:-TERR.R+100,x1:TERR.R-100,z1:TERR.R-100,per:1,p:.1,H:[2.5,6],gap:8,ground:terrainH,soil:[.55,.42,.3],accept:(x,z)=>MARGINS.savK(x,z)>.5&&WF.shore(x,z)>8&&FIELD.dry(x,z)>.3});
  const pos=[],col=[],idx=[],cc=new THREE.Color();M.forEach(B=>{const m=KSTACKS.mesh(B,{step:2,perFlute:3}),base=pos.length/3;for(let v=0;v<m.pos.length/3;v++){pos.push(m.pos[3*v],m.pos[3*v+1],m.pos[3*v+2]);const k=.55+.45*(m.occ?m.occ[v]:1);cc.setRGB(B.clay[0]*k,B.clay[1]*k,B.clay[2]*k).convertSRGBToLinear();col.push(cc.r,cc.g,cc.b);}for(const i of m.idx)idx.push(base+i);
   if(!out.moundAt)out.moundAt=[B.x,B.z,B.top-B.y0];REGISTER({name:'A termite mound',key:'landform.mound',kind:'landform',x:B.x,z:B.z,y:B.y0,r:B.R==null?3:B.R,h:(B.top-B.y0)+1});out.mound++;});
  if(idx.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();const mesh=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true}));mesh.userData.host=true;mesh.userData.inspectLabel='Termite mounds';const pp=[];M.forEach(B=>pp.push(B.x,B.y0+(B.top-B.y0)*.4,B.z));mesh.userData.probePoints=pp;scene.add(mesh);}}
 // the floating meadows, gathered on the pools; 89w lifts them with the flood
 BIO.kitWrap('nwlowlands',{f(){if(!BIO.defs.floatmat)BIO.def('floatmat',BIO.geo.mat(),NWLOW.MAT.moss,{label:'Floating meadows',free:true});cells(9,0x7106,(x,z,h,u)=>{const d=WF.shore(x,z),y=terrainH(x,z);if(d>-1||d<-14||y>-.15||u(3)>.5||MARGINS.savK(x,z)<.5)return;BIO.put('floatmat',[x,.1,z],qEuler(0,u(4)*6.283,0),1.4+u(5)*2.4,CL(0x7f9a4a).lerp(CL(0xa0aa58),u(6)));out.floatmat++;});}}).f();
 BIO.cur=null;return out;}
