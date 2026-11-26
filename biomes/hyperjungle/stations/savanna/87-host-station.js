// ================================================================= HOST — STATION 2's own life (PLAN-STATIONS.md station 2; PLAN-LANDS.md 5.1's cousins; BACKPORT.md's row)
// After the kit's forest (88 calls stationBuild before the bake). Every place is a cell of a lattice, its plant drawn from
// KRAND.hash(world, i, j, salt) and a reseed of the same hash: nothing the kit placed moves, and a cell's plant depends on no other.
//   grass       the tall grass: eastabyss's savanna grass (its item and its card, read in place: in its registry), 1.6-2.8 m,
//               bleaching in the dry season (its material's season); short or none on this year's burns, regrown by three years
//   parasol     eastabyss's umbrella-tree (read in place, its own builder): the savanna's parasol trees, scattered
//   firescale   the FIRE SCALE-TREE, a cousin of eastabyss's sigillaria (BIO.kin: 1.4x as tall, a heavier bole), on the old burns:
//               the abyss's lineage surviving the fires on the rim (PLAN-LANDS.md 5.1)
//   cycad       the MONSOON CYCAD, a cousin of eastabyss's cycad (BIO.kin: 1.3x), flushing on burns one to five years old near
//               the forest edge (the post-burn cycad flush)
//   outlier     the kit's own baobab and kapok standing alone out on the grass (HYPERJUNGLE.make, placeHero), four-fifths size
//   mound       the termite cathedrals (core/terrain KSTACKS.mounds, H10): fluted clay spires on a skirt, the ground's red reddened
// The runtime LOD on each, as the kit's: heroes and cousins drawn within LOD.tree of the camera, then their stand-ins; the grass
// in three rings (LOD.floor, mid, far). ?station=0 grows none of it.
function stationBuild(){
 if(new URLSearchParams(location.search).get('station')==='0')return null;
 const W=8113,LD=HYPERJUNGLE.LOD,LT=LD.tree,C=h=>new THREE.Color(h),out={grass:0,parasol:0,firescale:0,cycad:0,outlier:0,mound:0,kin:[]};
 const S=KSPACE.create({cell:60}),CEN=BIO.center(),nearC=(x,z)=>Math.hypot(x-CEN[0],z-CEN[1])<1400;   /* a view's subject inside the hero disc */(HYPERJUNGLE.TREES||[]).forEach(T=>S.insert(T,T.x,T.z,(T.rb||1)*1.4+3));
 const free=(x,z,r)=>!S.some(x,z,r,()=>true)&&BIO.clearOf(x,z,r)&&riverD(x,z)>RIVER.w*.6+r;
 const cells=(cell,salt,fn,lim)=>{const N=Math.ceil((lim||TERR.R)/cell);for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){const h=KRAND.hash(W,i,j,salt),u=k=>KRAND.unit(KRAND.hash(h,k,0,salt));
  const x=(i+u(1))*cell,z=(j+u(2))*cell;if(Math.max(Math.abs(x),Math.abs(z))>TERR.R-60)continue;fn(x,z,h,u);}};
 const tree=(K,T,lv,x,z)=>{if(LT){BIO.owner=[x,z];BIO.range=LT;BIO.minRange=0;}K.grow(T,lv);if(LT){BIO.range=1e9;BIO.minRange=LT;K.grow(Object.assign({},T),0);}BIO.owner=null;BIO.range=null;BIO.minRange=0;};
 BIO.cur='jungle/station';
 // ---- THE TALL GRASS: eastabyss's tuft geometry and its grass card (read in place), as this kit's own item 'tallgrass' with its own
 // material: eastabyss's root tint (k .8) suits its short cover but sank 2 m grass into the ground's colour, so here k .3 (the blades
 // stay straw); its dry-season bleach as eastabyss's (?season=0, ?groundtint=0 as the kit's)
 BIO.kitWrap('hyperjungle',{d(){if(BIO.defs.tallgrass)return;const LQ=new URLSearchParams(location.search),EM=EASTABYSS.MAT.grass;
  const m=BIO.leafMat(EM.map,'tallgrass',{swayW:'(position.y)',swayA:.13,alphaTest:.4,ground:LQ.get('groundtint')==='0'?null:{k:.3,gain:.36,fade:[1500,2100]},
   season:LQ.get('season')==='0'?null:{colour:0xc4a862,k:.75}});
  BIO.def('tallgrass',EASTABYSS.G.tuft(),m,{label:'Tall grass (the savanna)',cap:650000,capWhy:'the savanna\'s tall grass is the station (the owner kept it, 2026-11-08): two tufts a 3 m cell near, two a 6 m cell mid, one a 13 m cell far, over the whole burn-aged savanna: 555,500 at 2026-11-04'});}}).d();
 const grass=BIO.kitWrap('hyperjungle',{g(){const bands=[[3,0,LD.floor||700],[6,LD.floor||700,LD.mid||1600],[13,LD.mid||1600,TERR.R]],o=BIO.center();
  bands.forEach((B,bi)=>{BIO.range=[LD.floor,LD.mid,LD.far][bi]||null;
   cells(B[0],0x5c10+bi,(x,z,h,u)=>{const d=Math.hypot(x-o[0],z-o[1]);if(d<B[1]||d>=B[2])return;const Wz=zoneW(x,z),sv=Wz.sav*(1-Wz.gallery);if(sv<.05||u(3)>sv*(bi===2?.75:.92))return;
    if(riverD(x,z)<RIVER.w*.6+2)return;const a=burnAge(x,z),k=smooth(.25,3,a);if(k<.08||u(4)>.25+.75*k)return;
    const y=terrainH(x,z),hh=(1.6+1.2*u(5))*(.35+.65*k)*(bi===2?1.4:1),w=hh*(.7+.3*u(6))*(bi===0?1:1.5),n=bi===2?1:2;
    for(let m=0;m<n;m++){const aa=u(7+m)*TAU,dd=m?.6+u(9)*1.4:0,col=C([0xb09a58,0xc0a860,0x9a8a4a,0xa89050,0xd0b868][Math.floor(u(10+m)*5)]);
     BIO.put('tallgrass',[x+Math.cos(aa)*dd,y,z+Math.sin(aa)*dd],qEuler(0,u(12+m)*TAU,0),[w,hh*1.4,w],col);out.grass++;}},B[2]+50);});
  BIO.range=null;}});
 try{grass.g();}catch(e){reportErr('station grass: '+e.stack);}
 // ---- PARASOL TREES (eastabyss's umbrella-tree, read in place): scattered out on the grass, more toward the rim
 try{const sp=EASTABYSS.SPECIES.findIndex(Q=>Q.key==='umbrella');
  cells(150,0x5c20,(x,z,h,u)=>{const Wz=zoneW(x,z);if(Wz.sav<.8||Wz.gallery>.3||u(3)>.42*smooth(0,2400,Wz.e+600))return;if(!free(x,z,8))return;
   reseed(h);const T=EASTABYSS.make(sp,x,terrainH(x,z),z);tree(EASTABYSS,T,BIO.lodD(x,z)<1100?2:1,x,z);
   S.insert(T,x,z,(T.rb||1)*1.4+6);REGISTER({name:'Parasol tree (the abyss\'s umbrella-tree)',kind:'tree',label:'Parasol tree',x,z,y:T.y0,r:(T.crownR||8)+2,h:T.H+4});out.parasol++;});}
 catch(e){reportErr('station parasol: '+e.stack);}
 // ---- THE COUSINS (BIO.kin, PLAN-LANDS.md 5.1): the fire scale-tree and the monsoon cycad
 try{if(BIO.kin){
  /* the fire scale-tree's crown (the source builder's habit, S.crown): the pompom seated on the pole's top (lift .1, the clumps from
     below its rim to over it), twice the clumps, a third bigger, touching (no clear-space test: the seal-tree's left most of a big
     crown out and the rest hung over the top), half as many again hanging grass-leaves; 2026-10-27, the owner: "barely any foliage
     up top and it floats" */
  const FS=BIO.kin('eastabyss.sigillaria',{key:'firescale',name:'Fire scale-tree',scale:{H:1.4,rb:1.3,crownR:1.2},tags:{koppen:['Aw','Am'],fire:'resister'},
   habit:{crown:{lift:.1,n:2.2,size:1.3,el:[-.75,1.1],clear:false,skirt:1.6}}});
  const MC=BIO.kin('eastabyss.cycad',{key:'monsooncycad',name:'Monsoon cycad',scale:1.3,tags:{koppen:['Aw','Am'],fire:'resprouter'}});
  out.kin=[FS.record,MC.record];
  cells(130,0x5c30,(x,z,h,u)=>{const Wz=zoneW(x,z),a=burnAge(x,z);if(Wz.sav<.85||Wz.gallery>.2||a<3||u(3)>.38)return;if(!free(x,z,5))return;
   reseed(h);const T=FS.make(x,terrainH(x,z),z);tree(FS,T,BIO.lodD(x,z)<1100?2:1,x,z);if(!out.scaleAt&&nearC(x,z))out.scaleAt=[x,z];
   S.insert(T,x,z,(T.rb||1)*1.4+3);REGISTER({name:'Fire scale-tree (a cousin of the abyss\'s sigillaria)',kind:'tree',label:'Fire scale-tree',x,z,y:T.y0,r:(T.crownR||4)+2,h:T.H+3});out.firescale++;});
  cells(55,0x5c31,(x,z,h,u)=>{const Wz=zoneW(x,z),a=burnAge(x,z);if(Wz.e<-250||Wz.e>1100||a<.9||a>5.5||u(3)>.55)return;if(!free(x,z,2.5))return;
   reseed(h);const T=MC.make(x,terrainH(x,z),z);tree(MC,T,BIO.lodD(x,z)<900?2:1,x,z);
   S.insert(T,x,z,2.5);REGISTER({name:'Monsoon cycad (a cousin of the abyss\'s cycad), flushing after the fire',kind:'tree',label:'Monsoon cycad',x,z,y:T.y0,r:(T.crownR||2)+1.5,h:T.H+2});out.cycad++;});}}
 catch(e){reportErr('station kin: '+e.stack);}
 // ---- HYPERTREE OUTLIERS: the kit's baobab or kapok alone on the grass
 try{cells(520,0x5c40,(x,z,h,u)=>{const Wz=zoneW(x,z);if(Wz.sav<.9||Wz.gallery>.1||u(3)>.4)return;if(!free(x,z,30))return;
   reseed(h);const T=HYPERJUNGLE.make(u(4)<.6?3:5,x,terrainH(x,z),z);T.H*=.8;T.rb*=.8;T.crownR*=.8;
   const R0=REG.length;HYPERJUNGLE.placeHero(T,BIO.lodD(x,z)<1100?2:1);if(REG.length>R0){REG[REG.length-1].name+=' (an outlier on the savanna)';}
   S.insert(T,x,z,T.rb*1.4+10);out.outlier++;});}
 catch(e){reportErr('station outliers: '+e.stack);}
 // ---- TERMITE CATHEDRALS (core/terrain KSTACKS.mounds): on the grass, off the river; one mesh, the clay's colour times the
 // mesh's occlusion. The library's earth.termite is owed (PROMPTS-NEEDED.md section 32): vertex colour until it comes
 try{if(typeof KSTACKS!=='undefined'&&KSTACKS.mounds){
  const M=KSTACKS.mounds({id:'hj-mound',world:W,cell:70,x0:-TERR.R+80,z0:-TERR.R+80,x1:TERR.R-80,z1:TERR.R-80,per:1,p:.07,H:[4,9],gap:6,ground:terrainH,soil:[.6,.4,.26],
   accept:(x,z,r)=>{const Wz=zoneW(x,z);return Wz.sav>.9&&Wz.gallery<.1&&riverD(x,z)>60&&!S.some(x,z,r+4,()=>true);}});
  const pos=[],col=[],idx=[],c=new THREE.Color();
  M.forEach(B=>{const m=KSTACKS.mesh(B,{step:2,perFlute:3}),base=pos.length/3;
   for(let v=0;v<m.pos.length/3;v++){pos.push(m.pos[3*v],m.pos[3*v+1],m.pos[3*v+2]);const k=.55+.45*(m.occ?m.occ[v]:1);c.setRGB(B.clay[0]*k,B.clay[1]*k,B.clay[2]*k).convertSRGBToLinear();col.push(c.r,c.g,c.b);}
   for(const i of m.idx)idx.push(base+i);
   if(!out.moundAt&&nearC(B.x,B.z))out.moundAt=[B.x,B.z,B.top-B.y0];
   REGISTER({name:'A termite cathedral',key:'landform.mound',kind:'landform',x:B.x,z:B.z,y:B.y0,r:B.R||4,h:(B.top-B.y0)+1});out.mound++;});
  if(idx.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
   const mesh=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true}));mesh.userData.host=true;mesh.userData.inspectLabel='Termite cathedrals (fluted clay spires)';
   const pp=[];M.forEach(B=>pp.push(B.x,B.y0+(B.top-B.y0)*.4,B.z));mesh.userData.probePoints=pp;scene.add(mesh);out.moundTris=idx.length/3;}}}
 catch(e){reportErr('station mounds: '+e.stack);}
 BIO.cur=null;return out;}
