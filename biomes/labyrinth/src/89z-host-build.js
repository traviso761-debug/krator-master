// ================================================================= HOST — build (every station; copperglacier's order)
// The order a world follows: its own structures first (the knobs 86, the Hall 89g: they fill OBSTACLES), the water (89w), then the flora, then one
// bake. THE WATER AS FIELDS (core/water ext/60; core/biome 41): one shore for the flora, the ground's wet band and the audit.
// THE FLORA (station 1's first cut, PLAN-GATE.md section 6): the nwlowlands kit read in place (its temperate trees: candle birch, spindle poplar and
// glow-willow by the water, the parkland's stands on the floor; its floor), on this page's fields (45: tropic 0, the steppe dry, the river and the pond
// wet). The Labyrinth's own mammoth steppe (PLAN.md section 3) is a kit still to make: KNOWN_ISSUES.md.
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
 const t0=performance.now(),Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):.7;
 try{BIO.cur='labyrinth/'+SITE.key;window._biome=NWLOW.build({R:TERR.R-150,quality:q});BIO.cur=null;}catch(e){reportErr('flora: '+e.stack);}
 if(Q.has('nobake')){window._stats=JSON.parse(JSON.stringify(BIO.stats));window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 window._instances=b.inst;window._bakeCalls=b.calls;
 BIO.setA2C(renderer);{const G=TERR.R*1.1;BIO.setGround(TEX_GROUND,[-G,G,G,-G]);}
 if(typeof GROUND_HZ!=='undefined'&&GROUND_HZ){try{window._horizon.mats=KHORIZON.shadeScene(scene,GROUND_HZ,{filter:m=>!m.userData.farField&&m!==MAT_GROUND});}catch(e){reportErr('horizon: '+e.stack);}}
 if(SHADOW_ON){try{window._shadow=KSHADOW.attach({renderer,scene,camera,sun,ground:terrainH});window._shadow.cast(scene,{cast:false});
  GATE.holder.traverse(o=>{if(o.isMesh)o.castShadow=true;});if(FAR)FAR.mesh.castShadow=FAR.mesh.receiveShadow=false;}catch(e){reportErr('shadow: '+e.stack);}}
 window._buildMs=Math.round(performance.now()-t0);
 {let lo=1e9,hi=-1e9;for(let z=-TERR.R;z<=TERR.R;z+=100)for(let x=-TERR.R;x<=TERR.R;x+=100){const h=terrainH(x,z);lo=Math.min(lo,h);hi=Math.max(hi,h);}
  REGISTER({name:SITE.region,x:0,z:0,y:Math.floor(lo-10),r:TERR.R,h:Math.ceil(hi-lo+60)});}
})();
