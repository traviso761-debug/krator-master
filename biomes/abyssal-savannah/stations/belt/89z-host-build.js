// ================================================================= HOST — the belt's build
// The order station 1 follows (src/89z-host-build.js): the ground (80), the sky, the air and the water, then the kits (the abyssal savannah,
// reading the eastern abyss in place for the jungle's edge), then one bake. What the floor's belt changes, page-local (PLAN.md section 8):
//   THE TALLEST PARKLAND  the umbrella trees to ~28 m (the species' heights, 12-28 m, on this page only), the thatch grass over 3 m (its old
//                         tufts drawn 1.3 x taller: a wrap of BIO.put for the 'thatch' item during the build), rope araucarias through it
//                         (the eastern abyss's, read in place: a pass added to ABSAV.PASSES on this page)
//   THE CLAY ANTS' SPIRES the mounds the stage placed (KSTACKS.mounds), drawn as one mesh on the library's earth.termite (station.json "pack")
//   NO KOPJES, NO RIM     the floor has no granite tors and no caprock: ABSAV.build gets neither
// THE WATER AS FIELDS (core/water ext/60; core/biome 41): FIELD.wet and FIELD.flow near the water read the distance to the water the eye sees.
// THE SUN'S SHADOWS (core/shadow, KSHADOW) are off at load (the owner, 2026-11-03: toggleable, off by default): ?shadow=1 turns them on
const WATER_F=WATER.fields({box:[-TERR.X,-TERR.Z,TERR.X,TERR.Z],cell:8,ground:terrainH,surfaces:WATER.surfaces.filter(q=>q.kind!=='fall'&&FAR_STILLS.indexOf(q)<0)});
const WATER_FN=WATER.fieldFns(WATER_F);
/* the wet band's share of the water: 1 at the edge, gone by 16 m (a dry country: the band is narrow) */
const WET_SHORE=(x,z)=>smooth(16,1,WATER_FN.shore(x,z));
/* the field contract (core/biome/README.md, "The environmental fields"): the kit's own fields mapped to BIO.ENV's names and units */
const ENV=BIO.env({ground:terrainH,water:WATER_FN,wet:(x,z)=>FIELD.wet(x,z),rock:(x,z)=>FIELD.rock(x,z),salt:(x,z)=>FIELD.salt(x,z),bands:{upland:[-80,80],flow:40}});   /* the floor's heights on the page: BIO.ENV's upland is elevation (the kit's own upland is the belt's dryness) */
if(new URLSearchParams(location.search).get('fields')!=='0'){const W0=FIELD.wet,F0=FIELD.flow;
 FIELD.wet=(x,z)=>{if(!inMap(x,z))return W0(x,z);const s=WATER_FN.shore(x,z);if(s!==s)return W0(x,z);return clamp(Math.max(W0(x,z),.95*smooth(30,3,s)),0,1);};
 FIELD.flow=(x,z)=>{if(!inMap(x,z))return F0(x,z);const d=WATER_FN.flow(x,z);return d==null||d!==d?F0(x,z):clamp(Math.max(F0(x,z),smooth(26,4,d)),0,1);};}
if(GROUND_MESH){const a=GROUND_MESH.geometry.attributes.aWet,p=GROUND_MESH.geometry.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),w=waterH(x,z);a.setX(i,WET_SHORE(x,z)*(w>-1e8?smooth(2.5,.2,p.getY(i)-w):1));}a.needsUpdate=true;}
window._biome=null;
const IMP_GAIN=2.6;   /* the impostors' gain, as station 1's */
const SHADOW_ON=new URLSearchParams(location.search).get('shadow')==='1'&&typeof KSHADOW!=='undefined'&&!!KSHADOW.attach;
// the belt's page-local numbers (PLAN.md section 8): the umbrella trees' heights and crowns, the thatch's old tufts, the araucarias' pass
const BELT={umbrellaH:[12,28],umbrellaR:[7,16],umbrellaK:.7,thatchK:1.3,thatchFrom:1.6,thatchCap:500000,
 thatchWhy:'the floor\'s belt is parkland from edge to edge (station 2, PLAN.md section 8): a tuft a 4.5 m cell near, 9 m mid, 18 m far over the whole page',araucaria:{ea:17,salt:2701,cell:110,accept:Z=>Z.parkland*.14*smooth(.64,.42,Z.up),pad:8,scale:Z=>.78}};
// THE CLAY ANTS' SPIRES, drawn: one mesh on the library's earth.termite (uv in metres / its scale) under the mound's own clay colour (the
// map alone read as grey stone on the GPU, 2026-11-09), or the vertex colour alone without the pack
const MOUND_DRAW=(function(){if(!MOUNDS.length||typeof KSTACKS==='undefined')return null;
 const pos=[],uv=[],col=[],idx=[],c=new THREE.Color(),TX=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('abyssal-savannah','termite'):null;
 MOUNDS.forEach(B=>{const m=KSTACKS.mesh(B,{step:2,perFlute:3}),base=pos.length/3,sc=TX&&TX.scale?TX.scale[0]:3;
  for(let v=0;v<m.pos.length/3;v++){pos.push(m.pos[3*v],m.pos[3*v+1],m.pos[3*v+2]);uv.push(m.uv[2*v]/sc,m.uv[2*v+1]/sc);const k=.55+.45*(m.occ?m.occ[v]:1),t=TX?[B.clay[0]*1.9,B.clay[1]*1.9,B.clay[2]*1.9]:B.clay;c.setRGB(t[0]*k,t[1]*k,t[2]*k);if(!TX)c.convertSRGBToLinear();col.push(c.r,c.g,c.b);}
  for(const i of m.idx)idx.push(base+i);
  REGISTER({name:'A clay ants\' spire (fluted red clay, 5-14 m)',key:'landform.mound',kind:'landform',x:B.x,z:B.z,y:B.y0,r:B.R==null?4:B.R,h:(B.top-B.y0)+1,tags:{biome:'abyssal-savannah',feature:'mound'}});});
 if(!idx.length)return null;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
 const mat=new THREE.MeshLambertMaterial({vertexColors:true,map:TX?KMAT.textures(TX,{aniso:8}).map:null});if(mat.map)mat.map.wrapS=mat.map.wrapT=THREE.RepeatWrapping;
 const mesh=new THREE.Mesh(g,mat);mesh.userData.host=true;mesh.userData.inspectLabel='The clay ants\' spires (fluted red clay, 5-14 m in the dense air)';
 const pp=[];MOUNDS.forEach(B=>pp.push(B.x,B.y0+(B.top-B.y0)*.4,B.z));mesh.userData.probePoints=pp;scene.add(mesh);
 return{mesh,tris:idx.length/3,tex:!!TX};})();
(function(){
 const t0=performance.now(),Q=new URLSearchParams(location.search);
 if(Q.get('diet')==='0')ABSAV.IMPOSTORS=false;
 if(Q.get('fields')!=='0')ABSAV.SHORE=(x,z)=>inMap(x,z)?WATER_FN.shore(x,z):NaN;   /* trees keep off the water by its own shore (55) */
 const SP0=ABSAV.SPECIES[0];SP0.H=BELT.umbrellaH.slice();SP0.crownR=BELT.umbrellaR.slice();
 ABSAV.PASSES.push(BELT.araucaria);
 /* loose groves of big trees: the umbrella pass at BELT.umbrellaK of its station 1 share (the page's trees within the showcase's 11M) */
 ABSAV.PASSES.forEach(P=>{if(P.k===0){const a0=P.accept;P.accept=(Z,x,z)=>a0(Z,x,z)*BELT.umbrellaK;}});
 /* the thatch is the page: the belt's whole floor is parkland, where station 1's is a slope's middle third (BIO.def's cap, declared here) */
 {const D=BIO.kits['abyssal-savannah']&&BIO.kits['abyssal-savannah'].defs.thatch;if(D){D.cap=BELT.thatchCap;D.capWhy=BELT.thatchWhy;}}
 const put0=BIO.put;BIO.put=function(item,p,q,s,c,o){if(item==='thatch'&&s&&s[1]>BELT.thatchFrom)s=[s[0]*1.08,s[1]*BELT.thatchK,s[2]*1.08];return put0.call(BIO,item,p,q,s,c,o);};
 try{window._biome=ABSAV.build({box:[-TERR.X,-TERR.Z,TERR.X,TERR.Z],quality:1,kopjes:[],rim:null});}catch(e){reportErr('biome: '+e.stack);}
 finally{BIO.put=put0;}
 const b=BIO.bake();
 window._instances=b.inst;window._bakeCalls=b.calls;
 if(BIO.setA2C)BIO.setA2C(renderer);   /* R7: the cut-outs by alpha-to-coverage */
 if(BIO.impostorLook)BIO.impostorLook({gain:+(Q.get('impgain')||IMP_GAIN),wrap:+(Q.get('impwrap')||1)});
 if(BIO.bakeImpostors){try{BIO.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('impostors: '+e.stack);}}
 if(GROUND_HZ){try{window._horizon.mats=KHORIZON.shadeScene(scene,GROUND_HZ,{filter:m=>!m.userData.farField&&m!==MAT_GROUND});}catch(e){reportErr('horizon: '+e.stack);}}
 if(SHADOW_ON){try{window._shadow=KSHADOW.attach({renderer,scene,camera,sun,ground:terrainH});
  window._shadow.cast(scene);if(GROUND_MESH)window._shadow.cast(GROUND_MESH,{cast:false});if(FAR_F)FAR_F.mesh.castShadow=FAR_F.mesh.receiveShadow=false;}catch(e){reportErr('shadow: '+e.stack);}}
 try{cloudShadeScene();}catch(e){reportErr('cloud shade: '+e.stack);}   /* 89s: every lit material, the flora's too, now that it exists */
 window._buildMs=Math.round(performance.now()-t0);
 window._mounds=MOUNDS.length;
 REGISTER({name:'The floor\'s belt (the abyssal savannah, station 2)',x:CENTER[0],z:CENTER[1],r:TERR.X,h:700});
 {const z=-600,x=strX(z);REGISTER({name:'The belt stream',kind:'feature',x,z,y:terrainH(x,z)-8,r:40,h:20});}
 REGISTER({name:'The salt flat',kind:'feature',x:PAN.c[0],z:PAN.c[1],y:PAN_WATER.level-4,r:PAN.r*.8,h:12});
 {const x=JUNG.c[0]-500,z=JUNG.c[1]+300;REGISTER({name:'The jungle\'s edge (the lake jungle\'s hollow)',kind:'feature',x,z,y:terrainH(x,z)-6,r:700,h:90});}
})();
