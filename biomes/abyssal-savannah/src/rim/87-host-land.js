// ================================================================= HOST — the land's passes (PLAN-LANDS.md section 4: the savannah's base, every land)
// After the stage and the kits (88 calls landBuild before the bake). Every place is a cell of a lattice, its plant made from
// KRAND.hash(world, i, j, salt) (and a reseed of the same hash where a neighbour's builder draws from the kit stream): nothing depends
// on another cell or on the order of the passes. The weights are the land's (44l: LAND.grass, LAND.trees) times the stage's zones (45).
//   grass        the red oat grass (SAVRIM.grass) over the open savannah, by the burn's age; the dambos' green flush on it
//   blind        the blind grass (SAVRIM.blindGrass): the north's, and the rims' wet hollows (the dambos)
//   borassus     the fan palms in scattered stands (SAVRIM.borassus)
//   thorn        the umbrella thorn, the kit's own (swbay's read in place fails the attachment audit: KNOWN_ISSUES.md)
//   gallery      the gallery forest along the river: the hyperjungle's six at 0.3-0.5 of their size (read in place: HYPERJUNGLE.make
//                and grow), with its screwpines and gingers (HYPERJUNGLE.small)
//   outliers     the monsoon crimson kapok (bare in the dry season: HYPERJUNGLE_LOOK, 44l) and the gate baobab, lone on the grass
//   north        the bone giants and the bloodwood (the hyperjungle's north land, read in place: HYPERJUNGLE.LANDS.north)
//   mounds       the termite cathedrals (core/terrain KSTACKS.mounds, H10) on the library's earth.termite
// The rims' own passes (the e rim's, the se rim's) follow in landBuild's land blocks. ?land=0 grows none of it.
const SAVRIM_LOD={tree:1200,floor:800,mid:1800,far:2600};
function landBuild(){
 if(new URLSearchParams(location.search).get('land')==='0')return null;
 const W0=8131,LD=SAVRIM_LOD,LT=LD.tree,TW=LAND.trees,out={n:{},kin:[]},CEN=BIO.center(),dC=(x,z)=>Math.hypot(x-CEN[0],z-CEN[1]);
 const cnt=(k,m)=>{out.n[k]=(out.n[k]==null?0:out.n[k])+(m==null?1:m);};
 const closer=(k,x,z,label)=>{if(!out[k]||dC(x,z)<dC(out[k].x,out[k].z))out[k]={x,z,label};};
 const S=KSPACE.create({cell:60});
 const free=(x,z,r)=>!S.some(x,z,r,()=>true)&&BIO.clearOf(x,z,r)&&riverD(x,z)>RIVER.w*.6+r;
 const cells=(cell,salt,fn,lim)=>{const N=Math.ceil((lim==null?TERR.R:lim)/cell);for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){const h=KRAND.hash(W0,i,j,salt),u=k=>KRAND.unit(KRAND.hash(h,k,0,salt));
  const x=(i+u(1))*cell,z=(j+u(2))*cell;if(Math.max(Math.abs(x),Math.abs(z))>TERR.R-60)continue;fn(x,z,h,u);}};
 const grown=(grow,T,lvNear,lvFar,x,z)=>{BIO.owner=[x,z];if(LT){BIO.range=LT;BIO.minRange=0;}try{grow(T,lvNear);if(LT){BIO.range=1e9;BIO.minRange=LT;grow(Object.assign({},T),lvFar);}}finally{BIO.owner=null;BIO.range=null;BIO.minRange=0;}};
 const HJ=typeof HYPERJUNGLE!=='undefined'?HYPERJUNGLE:null;
 // ---- THE GALLERY FOREST (first: the grass keeps out of it): the hyperjungle's six at 0.3-0.5 of their size on the gallery band, its
 // screwpines and gingers at the water; ironbark, mahogany and kapok favoured (the riverine stands)
 BIO.cur='savannah/trees';
 try{if(HJ&&TW.gallery>0){const GSP=[0,4,5,0,1,4,5,2,3];
  cells(60,0x6a10,(x,z,h,u)=>{const Z=zoneW(x,z);if(Z.gallery<.35||u(3)>.55*Z.gallery*TW.gallery||!free(x,z,7))return;
   reseed(h);const sp=GSP[Math.floor(u(4)*GSP.length)],T=HJ.make(sp,x,terrainH(x,z),z),k=.3+.2*u(5);T.H*=k;T.rb*=k;T.crownR*=k;
   REGISTER({name:'Gallery forest: a '+HJ.SPECIES[sp].name.toLowerCase()+' (the hyperjungle\'s, at '+k.toFixed(2)+' of its size)',key:HJ.SPECIES[sp].key,kind:'tree',label:'Gallery forest',x,z,y:T.y0,r:T.crownR+2,h:T.H+3});
   grown(HJ.grow,T,BIO.lodD(x,z)<1100?2:1,0,x,z);S.insert(T,x,z,T.rb*1.6+4);cnt('gallery');closer('galleryAt',x,z,'Gallery forest along the river');});
  if(HJ.small)cells(26,0x6a11,(x,z,h,u)=>{const Z=zoneW(x,z);if(Z.rd>RIVER.w*.6+24||Z.rd<RIVER.w*.6+3||dC(x,z)>LD.mid||u(3)>.5||!free(x,z,3))return;
   reseed(h);const lv=dC(x,z)<LD.floor?2:1;BIO.owner=[x,z];BIO.range=lv===2?LD.floor:LD.mid;try{if(u(4)<.55)HJ.small.screwpine(x,terrainH(x,z),z,lv);else HJ.small.ginger(x,terrainH(x,z),z,lv);}finally{BIO.owner=null;BIO.range=null;}
   S.insert({x,z},x,z,2.5);cnt('galleryUnder');},LD.mid+60);}}
 catch(e){reportErr('land gallery: '+e.stack);}
 // ---- THE OUTLIERS: the monsoon crimson kapok and the gate baobab, lone on the grass at four-fifths size
 try{if(HJ&&(TW.kapok>0||TW.baobab>0))cells(520,0x6a20,(x,z,h,u)=>{const Z=zoneW(x,z);if(Z.sav<.85||u(3)>.5||!free(x,z,30))return;
   const kap=u(4)<TW.kapok/(TW.kapok+TW.baobab);if(u(6)>(kap?TW.kapok:TW.baobab)*2)return;
   reseed(h);const sp=kap?5:3,T=HJ.make(sp,x,terrainH(x,z),z);T.H*=.8;T.rb*=.8;T.crownR*=.8;
   REGISTER({name:(kap?'A monsoon crimson kapok (bare in the dry season)':'A gate baobab')+', alone on the savannah',key:HJ.SPECIES[sp].key,kind:'tree',label:kap?'Monsoon kapok':'Gate baobab',x,z,y:T.y0,r:T.crownR+3,h:T.H+4});
   grown(HJ.grow,T,BIO.lodD(x,z)<1300?2:1,0,x,z);S.insert(T,x,z,T.rb*1.4+10);cnt(kap?'kapok':'baobab');closer('outlierAt',x,z,kap?'A monsoon kapok on the grass':'A gate baobab on the grass');});}
 catch(e){reportErr('land outliers: '+e.stack);}
 // ---- THE UMBRELLA THORNS: the kit's own (55), scattered over the open grass
 try{if(TW.thorn>0)cells(110,0x6a30,(x,z,h,u)=>{const Z=zoneW(x,z);if(Z.sav<.7||Z.dambo>.3||u(3)>.45*TW.thorn*smooth(-.1,.15,KN(x,z,.0016,820,2)+.05)||!free(x,z,9))return;
   const T=SAVRIM.thorn.make(x,terrainH(x,z),z,h);REGISTER({name:'Umbrella thorn',key:'thorn',kind:'tree',label:'Umbrella thorn',x,z,y:T.y0,r:T.crownR+2,h:T.H+3});
   grown(SAVRIM.thorn.grow,T,BIO.lodD(x,z)<900?2:1,0,x,z);S.insert(T,x,z,T.rb*2+5);cnt('thorn');closer('thornAt',x,z,'Umbrella thorns');});}
 catch(e){reportErr('land thorns: '+e.stack);}
 // ---- THE FAN PALMS: scattered stands (a noise of stands times the land's weight)
 try{if(TW.borassus>0)cells(70,0x6a40,(x,z,h,u)=>{const Z=zoneW(x,z);if(Z.sav<.6&&Z.gallery<.3)return;const st=smooth(.05,.2,KN(x,z,.0022,821,2));
   if(u(3)>.4*TW.borassus*st||!free(x,z,5))return;const T=SAVRIM.borassus.make(x,terrainH(x,z),z,h);
   REGISTER({name:'Fan palm (Borassus: the trunk swollen halfway up)',key:'borassus',kind:'tree',label:'Fan palm',x,z,y:T.y0,r:7,h:T.H+6});
   grown(SAVRIM.borassus.grow,T,BIO.lodD(x,z)<900?2:1,0,x,z);S.insert(T,x,z,3);cnt('borassus');closer('palmAt',x,z,'Fan palms');});}
 catch(e){reportErr('land fan palms: '+e.stack);}
 // ---- THE NORTH's BONE GIANTS AND BLOODWOODS (the hyperjungle's north land, read in place): the dead hypertrees standing out of the
 // blind grass, the bloodwood at the forest's edge and along the gallery
 try{const N=HJ&&HJ.LANDS&&HJ.LANDS.north;if(N&&TW.bone>0)cells(300,0x6a50,(x,z,h,u)=>{const Z=zoneW(x,z);if(Z.sav<.6||u(3)>.45*TW.bone||!free(x,z,22))return;
   const T=N.bonegiant.make(x,terrainH(x,z),z,h);REGISTER({name:'A bone giant (a hypertree dead standing, hung with widow\'s hair)',key:'bonegiant',kind:'tree',label:'Bone giant',x,z,y:T.y0,r:T.rb*2.4+4,h:T.H});
   grown(N.bonegiant.grow,T,BIO.lodD(x,z)<1400?2:1,0,x,z);S.insert(T,x,z,T.rb*2+6);cnt('bonegiant');closer('boneAt',x,z,'Bone giants over the blind grass');});
  if(N&&TW.blood>0)cells(80,0x6a51,(x,z,h,u)=>{const Z=zoneW(x,z),rim=smooth(.05,.3,Z.forest)*smooth(.95,.6,Z.forest)+.6*smooth(.1,.4,Z.gallery)*smooth(.95,.6,Z.gallery);
   if(u(3)>.35*TW.blood*rim||!free(x,z,8))return;const T=N.bloodwood.make(x,terrainH(x,z),z,h);
   REGISTER({name:'A bloodwood (red sap: dye and body paint)',key:'bloodwood',kind:'tree',label:'Bloodwood',x,z,y:T.y0,r:T.crownR+2,h:T.H+2});
   grown(N.bloodwood.grow,T,BIO.lodD(x,z)<800?2:1,0,x,z);S.insert(T,x,z,T.rb*2+3);cnt('bloodwood');closer('bloodAt',x,z,'A bloodwood at the forest\'s edge');});}
 catch(e){reportErr('land north: '+e.stack);}
 // ---- THE LAND's OWN (the rims' passes: J5, J6)
 try{if(typeof landOwn==='function')landOwn({cells,free,grown,cnt,closer,S,out,LD,W0});}catch(e){reportErr('land own: '+e.stack);}
 // ---- THE GRASS: the red oat grass, the blind grass (the north's sea of it, the rims' wet hollows), the dambos' green
 BIO.cur='savannah/grass';
 const clr=(x,z)=>riverD(x,z)>RIVER.w*.6+2&&!S.some(x,z,1.2,()=>true);
 try{const r=SAVRIM.grass({world:W0,center:CEN,R:TERR.R,lod:LD,ground:terrainH,burnAge,clear:clr,col:LAND.grass.col,
   weight:(x,z)=>{const Z=zoneW(x,z);return LAND.grass.redoat*Z.sav*(1-.6*Z.lat)*(1-Z.dambo)*(1-LAND.grass.blind*.9);}});cnt('redoat',r.n);
  const d=SAVRIM.grass({world:W0+1,center:CEN,R:TERR.R,lod:LD,ground:terrainH,burnAge:()=>60,clear:clr,H:[.8,1.5],cells:[3,6,13],col:[0x6a8a3a,0x7a9a44,0x5a7a32,0x8aa04a],
   weight:(x,z)=>zoneW(x,z).dambo});cnt('dambo',d.n);
  if(LAND.grass.blind>0){const b=SAVRIM.blindGrass({world:W0,center:CEN,R:TERR.R,lod:LD,ground:terrainH,burnAge,clear:clr,
    weight:(x,z)=>{const Z=zoneW(x,z);return Z.sav*Math.min(1,LAND.grass.blind+.7*Z.dambo)*(1-.7*Z.lat);}});cnt('blindgrass',b.n);}}
 catch(e){reportErr('land grass: '+e.stack);}
 // ---- THE TERMITE CATHEDRALS (core/terrain KSTACKS.mounds, H10): fluted clay spires on a skirt over the open grass; one mesh, on the
 // library's earth.termite (materials.json `termite`; uv in metres) times the mesh's occlusion, or vertex colour without the pack
 BIO.cur=null;
 try{if(typeof KSTACKS!=='undefined'&&KSTACKS.mounds){
  const M=KSTACKS.mounds({id:'savrim-mound-'+LAND.key,world:W0,cell:70,x0:-TERR.R+80,z0:-TERR.R+80,x1:TERR.R-80,z1:TERR.R-80,per:1,p:.07,H:[5,15],gap:6,ground:terrainH,soil:[.62,.36,.22],
   accept:(x,z,r)=>{const Z=zoneW(x,z);return Z.sav>.85&&Z.dambo<.2&&riverD(x,z)>60&&!S.some(x,z,r+4,()=>true);}});
  const pos=[],uv=[],col=[],idx=[],c=new THREE.Color(),TX=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('savannarim','termite'):null;
  M.forEach(B=>{const m=KSTACKS.mesh(B,{step:2,perFlute:3}),base=pos.length/3,sc=TX&&TX.scale?TX.scale[0]:3;
   for(let v=0;v<m.pos.length/3;v++){pos.push(m.pos[3*v],m.pos[3*v+1],m.pos[3*v+2]);uv.push(m.uv[2*v]/sc,m.uv[2*v+1]/sc);const k=.55+.45*(m.occ?m.occ[v]:1),t=TX?[1.25,1.25,1.25]:B.clay;c.setRGB(t[0]*k,t[1]*k,t[2]*k);if(!TX)c.convertSRGBToLinear();col.push(c.r,c.g,c.b);}
   for(const i of m.idx)idx.push(base+i);if(!out.moundAt||dC(B.x,B.z)<dC(out.moundAt.x,out.moundAt.z))out.moundAt={x:B.x,z:B.z,h:B.top-B.y0,label:'Termite cathedrals'};
   REGISTER({name:'A termite cathedral (fluted red clay)',key:'landform.mound',kind:'landform',x:B.x,z:B.z,y:B.y0,r:B.R==null?4:B.R,h:(B.top-B.y0)+1});cnt('mound');});
  if(idx.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
   const mat=new THREE.MeshLambertMaterial({vertexColors:true,map:TX?KMAT.textures(TX,{aniso:8}).map:null});if(mat.map)mat.map.wrapS=mat.map.wrapT=THREE.RepeatWrapping;
   const mesh=new THREE.Mesh(g,mat);mesh.userData.host=true;mesh.userData.inspectLabel='Termite cathedrals (fluted clay spires, 5-15 m in the dense air)';
   const pp=[];M.forEach(B=>pp.push(B.x,B.y0+(B.top-B.y0)*.4,B.z));mesh.userData.probePoints=pp;scene.add(mesh);out.moundTris=idx.length/3;out.moundTex=!!TX;}}}
 catch(e){reportErr('land mounds: '+e.stack);}
 return out;}
