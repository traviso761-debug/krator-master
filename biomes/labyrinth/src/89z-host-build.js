// ================================================================= HOST — build (every station; copperglacier's order)
// The order a world follows: its own structures first (the knobs 86, the Hall 89g: they fill OBSTACLES), the water (89w), then the flora, then one
// bake. THE WATER AS FIELDS (core/water ext/60; core/biome 41): one shore for the flora, the ground's wet band and the audit.
// THE FLORA: the kit's own mammoth steppe (src/50-70, PLAN.md section 3) on this page's fields (45: the steppe dry, the river and the lakes
// wet, the rock and the cold), under the station's profile (44z: SITE.flora: parkland, tallsteppe, drysteppe or cold).
const WATER_F=WATER.fields({box:[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1],cell:8,ground:terrainH,surfaces:WATER.surfaces.filter(q=>q.kind!=='fall')});
const WATER_FN=WATER.fieldFns(WATER_F);window._waterShore=WATER_FN.shore;   /* the root mask reads it (45) */
const WET_SHORE=(x,z)=>{const s=WATER_FN.shore(x,z);return s!==s?0:smooth(24,1,s);};
const ENV=BIO.env({ground:terrainH,water:WATER_FN,wet:(x,z)=>FIELD.wet(x,z),rock:(x,z)=>FIELD.rock(x,z),bands:{upland:[SITE.floor,SITE.floor+900],flow:40}});
if(new URLSearchParams(location.search).get('fields')!=='0'){const S0=FIELD.shore,W0=FIELD.wet;
 FIELD.shore=(x,z)=>{const s=WATER_FN.shore(x,z);return s!==s?S0(x,z):Math.max(S0(x,z)*smooth(-1,3,s),smooth(30,1,s)*smooth(-1,1,s));};
 FIELD.wet=(x,z)=>clamp(Math.max(W0(x,z),.9*FIELD.shore(x,z)),0,1);}
{const a=GROUND.geometry.attributes.aWet,p=GROUND.geometry.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),w=waterH(x,z);a.setX(i,WET_SHORE(x,z)*(w>-1e8?smooth(2.5,.2,p.getY(i)-w):1));}a.needsUpdate=true;}
window._biome=null;
const SHADOW_ON=new URLSearchParams(location.search).get('shadow')!=='0'&&typeof KSHADOW!=='undefined'&&!!KSHADOW.attach;
(function(){
 const t0=performance.now(),Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):(SITE.floraQ==null?1:SITE.floraQ);   /* the kit's quality: the floor's and the trees' share */
 try{BIO.cur='labyrinth/'+SITE.key;window._biome=LABY.build({R:TERR.R-150,quality:q,profile:SITE.flora||'parkland'});BIO.cur=null;}catch(e){reportErr('flora: '+e.stack);}
 /* THE ROCK AND THE RUIN OVERGROWN (KNOWN_ISSUES.md): the kit's growth on structures (LABY.dress: lichen on the walls, moss, grass, cushions,
    juniper and dwarf birch on the ledges, a few young birches in the joints) over the knobs, the five stacks (their terraces and galleries)
    and the Hall's broken decks, handed over as world-space geometry; the dressing never touches the geometry. ?dress=0 off */
 if(Q.get('dress')!=='0')try{const geos=[];scene.updateMatrixWorld(true);
  /* only what stands out of the water: a triangle with any corner under the pond's level + 0.5 m is dropped (the fallen cap's drums lie half
     in the pond, and the plinths stand in it; growth there would be rooted under the water) */
  const dry=g=>{const n=g.index?g.toNonIndexed():g,p=n.attributes.position,uv=n.attributes.uv,P=[],U=[],y0=LEVEL+.5;
   /* and an up-facing face with rock over it (a bed's top under the bed above: KSTACKS draws it, the eye never sees it) is not a ledge */
   const covered=i=>{const ax=p.getX(i),ay=p.getY(i),az=p.getZ(i),bx=p.getX(i+1)-ax,by=p.getY(i+1)-ay,bz=p.getZ(i+1)-az,cx=p.getX(i+2)-ax,cy=p.getY(i+2)-ay,cz=p.getZ(i+2)-az;
    const nx=by*cz-bz*cy,ny=bz*cx-bx*cz,nz=bx*cy-by*cx,nl=Math.hypot(nx,ny,nz)||1;if(Math.abs(ny/nl)<.6)return false;
    const mx=ax+(bx+cx)/3,my=ay+(by+cy)/3,mz=az+(bz+cz)/3,t=Math.max(KSTACKS.topAt(KNOBS,mx,mz),KSTACKS.topAt(STACKS,mx,mz)+LEVEL);return t>my+1;};
   for(let i=0;i<p.count;i+=3){if(p.getY(i)<y0||p.getY(i+1)<y0||p.getY(i+2)<y0||covered(i))continue;for(let k=0;k<3;k++){P.push(p.getX(i+k),p.getY(i+k),p.getZ(i+k));if(uv)U.push(uv.getX(i+k),uv.getY(i+k));}}
   const o=new THREE.BufferGeometry();o.setAttribute('position',new THREE.Float32BufferAttribute(P,3));if(uv)o.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));o.computeVertexNormals();return o;};
  const take=o=>{if(o.isMesh&&!o.isInstancedMesh&&o.geometry&&o.geometry.attributes.position&&!(o.material&&(o.material.transparent||o.material===MAT.acVoid)))geos.push(dry(o.geometry.clone().applyMatrix4(o.matrixWorld)));};
  scene.children.forEach(o=>{if(/^host:knob\./.test(o.name))take(o);});if(GATE)GATE.holder.traverse(take);
  BIO.cur='labyrinth/dress';const ds=LABY.dress(geos,{ledges:{moss:4000,plants:2600,mossR:4,size:1.6,treeH:6,trees:.05},walls:{n:2400,lichenS:1.8}});BIO.cur=null;
  window._dress=Object.assign({geos:geos.length},ds);}catch(e){reportErr('dress: '+e.stack);}
 if(Q.has('nobake')){window._stats=JSON.parse(JSON.stringify(BIO.stats));window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 window._instances=b.inst;window._bakeCalls=b.calls;
 BIO.setA2C(renderer);{const G=TERR.R*1.1;BIO.setGround(TEX_GROUND,[-G,G,G,-G]);}
 if(typeof GROUND_HZ!=='undefined'&&GROUND_HZ){try{window._horizon.mats=KHORIZON.shadeScene(scene,GROUND_HZ,{filter:m=>!m.userData.farField&&m!==MAT_GROUND});}catch(e){reportErr('horizon: '+e.stack);}}
 if(SHADOW_ON){try{window._shadow=KSHADOW.attach({renderer,scene,camera,sun,ground:terrainH});window._shadow.cast(scene,{cast:false});
  if(GATE)GATE.holder.traverse(o=>{if(o.isMesh)o.castShadow=true;});if(FAR)FAR.mesh.castShadow=FAR.mesh.receiveShadow=false;}catch(e){reportErr('shadow: '+e.stack);}}
 window._buildMs=Math.round(performance.now()-t0);
 {let lo=1e9,hi=-1e9;for(let z=-TERR.R;z<=TERR.R;z+=100)for(let x=-TERR.R;x<=TERR.R;x+=100){const h=terrainH(x,z);lo=Math.min(lo,h);hi=Math.max(hi,h);}
  REGISTER({name:SITE.region,x:0,z:0,y:Math.floor(lo-10),r:TERR.R,h:Math.ceil(hi-lo+60)});}
})();
