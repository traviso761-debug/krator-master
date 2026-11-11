// ================================================================= HOST — build (every station)
// Several kits on one page (biomes/WORLD.md), in the order a world follows: the water as fields first (core/water ext/60: one shore for the flora, the
// ground's wet band and the audit), then the geyser kit on its layout (its sinter, trees, floor and show), whose trees become obstacles; then Copper
// Glacier's passes (read in place) over the ash and the ice only (the mask narrowed off the warm floor: its cushions and corals are the cold ground's);
// then this kit's floor and kin and the hunters' marks; the resource data's nodes; then one bake and the universal set after it (the impostors, the
// horizon, the snow on what stands, the shadows' switch).
const WATER_F=WATER.fields({box:[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1],cell:8,ground:terrainH,surfaces:WATER.surfaces.filter(q=>q.kind!=='fall'&&q.kind!=='geyser')});
const WATER_FN=WATER.fieldFns(WATER_F);window._waterShore=WATER_FN.shore;   /* the root mask reads it (47) */
/* the wet band's share of the water: 1 at the edge, gone by 24 m */
const WET_SHORE=(x,z)=>{const s=WATER_FN.shore(x,z);return s!==s?0:smooth(24,1,s);};
/* the field contract (core/biome/README.md, "The environmental fields"): the kit's own fields mapped to BIO.ENV's names and units */
const ENV=BIO.env({ground:terrainH,water:WATER_FN,wet:(x,z)=>FIELD.wet(x,z),rock:(x,z)=>FIELD.rock(x,z),bands:{upland:[MODEL.h(0,0),MODEL.h(0,0)+600],flow:40}});
if(new URLSearchParams(location.search).get('fields')!=='0'){const S0=FIELD.shore,W0=FIELD.wet;
 FIELD.shore=(x,z)=>{const s=WATER_FN.shore(x,z);return s!==s?S0(x,z):Math.max(S0(x,z)*smooth(-1,3,s),smooth(30,1,s)*smooth(-1,1,s));};
 FIELD.wet=(x,z)=>clamp(Math.max(W0(x,z),.9*FIELD.shore(x,z)),0,1);}
GROUND_MESHES.forEach(m=>{const a=m.geometry.attributes.aWet,p=m.geometry.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),w=waterH(x,z);
 a.setX(i,WET_SHORE(x,z)*(w>-1e8?smooth(2.5,.2,p.getY(i)-w):1)*(1-FC.at(FC.a.ice,x,z)));}a.needsUpdate=true;});
window._biome=null;window._geyser=null;window._cold=null;window._hunt=null;window._nodes=[];
const SHADOW_ON=new URLSearchParams(location.search).get('shadow')!=='0'&&typeof KSHADOW!=='undefined'&&!!KSHADOW.attach;   /* attached always, off at load: core/shadow's switch (its button, ?shadow=1) turns it on; ?shadow=0 none of it */
(function(){
 const t0=performance.now();
 // ?q=0.5 builds at a lower quality; ?nobake=1 measures the build without drawing it; ?nogeyser=1 leaves the thermal ground bare; ?cold=0 no Copper Glacier
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 // ---- the geyser kit on its layout (its passes round the thermal ground's middle)
 if(LAYOUT&&!Q.has('nogeyser')){const cx=(TBOX[0]+TBOX[2])/2,cz=(TBOX[1]+TBOX[3])/2,R=Math.max(TBOX[2]-TBOX[0],TBOX[3]-TBOX[1])*.62;
  /* a station that is no valley (Mons' crater: SITE.thermalOnly) takes the kit's sinter and its show only: none of its thermal trees or floor */
  try{if(SITE.thermalOnly){const c0=BIO.host.center;BIO.host.center=[cx,cz];const o={R,quality:q};try{BIO.cur='geyser/sinter';Object.assign(o,GEYSER.buildSinter(q));BIO.cur='geyser/show';Object.assign(o,GEYSER.buildShow(o));}finally{BIO.host.center=c0;BIO.cur=null;}window._geyser=o;}
   else window._geyser=GEYSER.build({R,quality:q*dv(SITE.geyserQ,1),center:[cx,cz]});}catch(e){reportErr('geyser: '+e.stack);}   /* SITE.geyserQ thins the kit's passes on a wide field (the Glen's: its floor's items stay under their caps) */
  if(GEYSER.SHOW){GEYSER.SHOW.U.uSun.value.set(...SUN_POS).normalize();}
  (GEYSER.TREES||[]).forEach(T=>OBSTACLES.push({x:T.x,z:T.z,r:T.rb*2+1.5,y0:T.y0-3,y1:T.y0+T.H}));}
 // ---- the hunters' marks first (core/camp's pitch): the camp's ground is then kept clear of every pass after
 try{window._hunt=FIREBLISS.hunters(SITE);window._camp=FIREBLISS.CAMP||null;}catch(e){reportErr('hunters: '+e.stack);}
 const CLEAR=[];if(window._camp){const c=window._camp;CLEAR.push({x:c.hearth.x,z:c.hearth.z,r:c.R+7});OBSTACLES.push({x:c.hearth.x,z:c.hearth.z,r:c.R+5,y0:-1e4,y1:1e4});}
 (SITE.butchery||[]).forEach(B=>CLEAR.push({x:B.x,z:B.z,r:7}));
 // ---- Copper Glacier's passes (read in place): the cushions, lichen, moss, boulders and stones, the frost coral under the station's coral line. Off the
 // warm floor (its grass and groves are this kit's) and off hot ground; its fields are this page's (47: ice, moraine, snow, copper 0, flat, shore, ...)
 if(typeof COPPERG!=='undefined'&&Q.get('cold')!=='0'){COPPERG.SITE={coral:SITE.coral,coralK:SITE.coralK};
  const inClear=(x,z)=>CLEAR.some(c=>(x-c.x)*(x-c.x)+(z-c.z)*(z-c.z)<c.r*c.r);
  /* a hard edge: Copper Glacier's passes take any mask over 0 */
  MASK=(x,z)=>inClear(x,z)||FC.at(FC.a.floor,x,z)>.3||FC.at(FC.a.therm,x,z)*(SITE.iceAt?.45:1)>.3||(FIELD.heat&&FIELD.heat(x,z)>.45)?0:rootMask(x,z);
  try{BIO.cur='copperglacier/'+SITE.key;window._cold=COPPERG.build(TERR.R-150,q*(SITE.coldQ==null?1:SITE.coldQ));}catch(e){reportErr('copperglacier: '+e.stack);}
  MASK=rootMask;BIO.cur=null;}
 // ---- this kit: the floor and the kin
 FIREBLISS.SITE={fumaroles:(LAYOUT?LAYOUT.fumaroles:[]).concat(SITE.fumaroles||[]),pinesUp:SITE.pinesUp||0,clear:CLEAR};
 try{BIO.cur='firebliss/'+SITE.key;window._biome=FIREBLISS.build(TERR.R-150,q);}catch(e){reportErr('biome: '+e.stack);}
 BIO.cur=null;
 // ---- the resource data's nodes in the square (kits/resources: FB_RES, build time): each registered where it is drawn, an outcrop of stained stone;
 // a node on the water or off the square is listed, not drawn (none invented, none lost: 99's check)
 {const COL={iron:0x8a4a2e,copper:0x3e7e5e,gold:0xc8a040,silver:0xb8bcc4,tin:0x9a9a92,saltpeter:0xe8e4da,sulfur:0xe0c838},GR={low:.7,medium:1,high:1.35};
  (FB_RES.nodes||[]).forEach(n=>{const o={id:n.id,kind:n.kind,grade:n.grade,x:n.x,z:n.z,drawn:false};window._nodes.push(o);
   if(Math.abs(n.x)>TERR.R-20||Math.abs(n.z)>TERR.R-20||waterH(n.x,n.z)>terrainH(n.x,n.z)-.3)return;
   const y=terrainH(n.x,n.z),s=1.4*(GR[n.grade]||1);BIO.cur='firebliss/nodes';FIREBLISS.outcrop(n.x,n.z,s,COL[n.kind]||0x6a6a66,4510+n.x*7+n.z*13);
   BIO.cur=null;REGISTER({name:'A '+n.grade+'-grade '+n.kind+' outcrop (kits/resources)',kind:'resource',x:n.x,z:n.z,y:y-1,r:4,h:3,tags:{res:{id:n.id,kind:n.kind,grade:n.grade}}});o.drawn=true;});}
 if(Q.has('nobake')){window._stats=JSON.parse(JSON.stringify(BIO.stats));window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 window._instances=b.inst;window._bakeCalls=b.calls;
 BIO.setA2C(renderer);{const G=TERR.R*1.1;BIO.setGround(TEX_GROUND,[-G,G,G,-G]);}   /* the floor's cover takes the ground's colour at its root */
 /* the far trees: the Throne's octahedral impostors for the kin pines past their range (34-core-impostor.js; its gain the Throne's, as ringisles sets it) */
 if(BIO.impostorLook)BIO.impostorLook({gain:+(Q.get('impgain')||2.2),wrap:1});
 if(BIO.bakeImpostors){try{BIO.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('impostors: '+e.stack);}}
 if(typeof GROUND_HZ!=='undefined'&&GROUND_HZ){try{window._horizon.mats=KHORIZON.shadeScene(scene,GROUND_HZ,{filter:m=>!m.userData.farField&&m!==MAT_GROUND});}catch(e){reportErr('horizon: '+e.stack);}}
 if(AIR.snow&&ATMOS.snowOnScene){scene.traverse(o=>{const m=o.material;if(!o.isMesh||!m||m.userData.noSnow||!o.geometry.attributes.aN||!m.userData.bio||m.userData.bio.kind!=='leaf'||(m.userData.bio.opts||{}).aN)return;
  ATMOS.snowOn(m,{twoSided:m.side===THREE.DoubleSide,aN:false});m.userData.noSnow=true;});ATMOS.snowOnScene(scene);}   /* the lying snow on every lit material (89a) */
 /* THE SUN'S SHADOWS (core/shadow, KSHADOW): attached, OFF at load (?shadow=1 or the panel's switch); only the pines and the tree ferns cast, as Copper
    Glacier's corals do (the owner, 2026-11-08: the whole scene casting cost +20-56% a frame); everything else receives */
 if(SHADOW_ON){try{window._shadow=KSHADOW.attach({renderer,scene,camera,sun,ground:terrainH});
  window._shadow.cast(scene,{cast:false});let nc=0;scene.traverse(o=>{if(o.isMesh&&/^biome:(blisspine|blisstreefern|bark|needle|frond)/.test(o.name)&&o.receiveShadow){o.castShadow=true;nc++;}});
  window._shadow.state.casters=nc;if(FAR)FAR.mesh.castShadow=FAR.mesh.receiveShadow=false;}catch(e){reportErr('shadow: '+e.stack);}}
 window._buildMs=Math.round(performance.now()-t0);
 /* the land's whole volume from its own ground: its lowest point to its highest, on a 100 m lattice */
 {let lo=1e9,hi=-1e9;for(let z=-TERR.R;z<=TERR.R;z+=100)for(let x=-TERR.R;x<=TERR.R;x+=100){const h=terrainH(x,z);lo=Math.min(lo,h);hi=Math.max(hi,h);}
  REGISTER({name:SITE.region,x:0,z:0,y:Math.floor(lo-10),r:TERR.R,h:Math.ceil(hi-lo+60)});}
})();
