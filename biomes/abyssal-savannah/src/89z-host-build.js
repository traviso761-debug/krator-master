// ================================================================= HOST — build
// The order a world follows: its ground first (80), then the sky, the air and the water, then the kits (the abyssal savannah, which reads the
// eastern abyss in place for the jungle at the foot), then one bake. 89z, after the water (it was 88; the final rebuild, 2026-11-03): the flora
// reads the water's own numbers, so the surfaces must exist before the first plant. The kopjes' hills and the rim's lip line are the host's ground,
// handed to the kit.
// THE WATER AS FIELDS (core/water ext/60; core/biome 41; the review's third line): one shore for the flora, the ground's wet band and the audit.
// FIELD.wet and FIELD.flow keep their kit's meaning, but near the water their water term is the distance to the water the eye sees (WATER.fieldAt), not
// the stream gully's line or a pool's radius; the wet band on the ground (aWet) reads the same shore. ?fields=0 for the old fields
const WATER_F=WATER.fields({box:[-TERR.X,-TERR.Z,TERR.X,TERR.Z],cell:8,ground:terrainH,surfaces:WATER.surfaces.filter(q=>q.kind!=='fall'&&q!==FAR_LAKE)});
const WATER_FN=WATER.fieldFns(WATER_F);
/* the wet band's share of the water: 1 at the edge, gone by 16 m (a dry country: the band is narrow) */
const WET_SHORE=(x,z)=>smooth(16,1,WATER_FN.shore(x,z));
/* the field contract (core/biome/README.md, "The environmental fields"): the kit's own fields mapped to BIO.ENV's names and units */
const ENV=BIO.env({ground:terrainH,water:WATER_FN,wet:(x,z)=>FIELD.wet(x,z),rock:(x,z)=>FIELD.rock(x,z),salt:(x,z)=>FIELD.salt(x,z),bands:{upland:[0,480],flow:40}});
if(new URLSearchParams(location.search).get('fields')!=='0'){const W0=FIELD.wet,F0=FIELD.flow;
 FIELD.wet=(x,z)=>{if(!inMap(x,z))return W0(x,z);const s=WATER_FN.shore(x,z);if(s!==s)return W0(x,z);return clamp(Math.max(W0(x,z),.95*smooth(30,3,s)),0,1);};
 FIELD.flow=(x,z)=>{if(!inMap(x,z))return F0(x,z);const d=WATER_FN.flow(x,z);return d==null||d!==d?F0(x,z):clamp(Math.max(F0(x,z),smooth(26,4,d)),0,1);};}
if(GROUND_MESH){const a=GROUND_MESH.geometry.attributes.aWet,p=GROUND_MESH.geometry.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),w=waterH(x,z);a.setX(i,WET_SHORE(x,z)*(w>-1e8?smooth(2.5,.2,p.getY(i)-w):1));}a.needsUpdate=true;}
window._biome=null;
const IMP_GAIN=2.6;   /* the impostors' gain (oidong 2.6, eastabyss 3.6, ebadlands 2.4): the bake is ~4x dark; set against the near crowns on the bench views */
const SHADOW_ON=new URLSearchParams(location.search).get('shadow')!=='0'&&typeof KSHADOW!=='undefined'&&!!KSHADOW.attach;
(function(){
 const t0=performance.now(),Q=new URLSearchParams(location.search);
 if(Q.get('diet')==='0')ABSAV.IMPOSTORS=false;
 if(Q.get('fields')!=='0')ABSAV.SHORE=(x,z)=>inMap(x,z)?WATER_FN.shore(x,z):NaN;   /* trees keep off the water by its own shore (55) */   /* ?diet=0: the kit's own far blobs, not the impostors */
 // the caprock's lip: the profile's lip (RIM.lip in the warped coordinate) at every 9 m down the map, on the ground
 const lip=[];for(let z=-TERR.Z+20;z<=TERR.Z-20;z+=9){const x=RIM.lip-warpZ(z);lip.push([x,z]);}
 const rim={lip,c:[RIM.lip-warpZ(0),0],r:TERR.Z,y0:terrainH(RIM.face[0]-warpZ(0),0)-5,h:300};
 try{window._biome=ABSAV.build({box:[-TERR.X,-TERR.Z,TERR.X,TERR.Z],quality:1,kopjes:KOPJES,rim});}catch(e){reportErr('biome: '+e.stack);}
 const b=BIO.bake();
 window._instances=b.inst;window._bakeCalls=b.calls;
 if(BIO.setA2C)BIO.setA2C(renderer);   /* R7: the cut-outs by alpha-to-coverage */
 if(BIO.impostorLook)BIO.impostorLook({gain:+(Q.get('impgain')||IMP_GAIN),wrap:+(Q.get('impwrap')||1)});
 if(BIO.bakeImpostors){try{BIO.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('impostors: '+e.stack);}}   /* after every placement; waits for the library maps */
 if(GROUND_HZ){try{window._horizon.mats=KHORIZON.shadeScene(scene,GROUND_HZ,{filter:m=>!m.userData.farField&&m!==MAT_GROUND});}catch(e){reportErr('horizon: '+e.stack);}}
 /* THE SUN'S SHADOWS (core/shadow, KSHADOW; the owner, 2026-11-03): one 4096 box following the view, 90-600 m by the eye's height; the flora and the
    ground cast and receive, the far field, the water and the impostors draw their own light. ?shadow=0 off (its cost: KNOWN_ISSUES.md) */
 if(SHADOW_ON){try{window._shadow=KSHADOW.attach({renderer,scene,camera,sun,ground:terrainH});
  window._shadow.cast(scene);if(GROUND_MESH)window._shadow.cast(GROUND_MESH,{cast:false});if(FAR_F)FAR_F.mesh.castShadow=FAR_F.mesh.receiveShadow=false;}catch(e){reportErr('shadow: '+e.stack);}}
 try{cloudShadeScene();}catch(e){reportErr('cloud shade: '+e.stack);}   /* 89s: every lit material, the flora's too, now that it exists */
 window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:'The rim slope (the abyssal savannah, station 1)',x:CENTER[0],z:CENTER[1],r:TERR.X,h:700});
 GULLY.forEach(G=>{const x=-600;REGISTER({name:G.name,kind:'feature',x,z:G.zc(x),y:terrainH(x,G.zc(x))-30,r:G.W*1.6,h:60});});
})();
