// ================================================================= EREWHON — the biome host binding
// BIO.init against the map's terrain, the painted mask (baked before the biome builds) and the five climate fields
// the Vale of Xanadu biome zones itself from. The scene arrives in 90b. The biome keeps its own PRNG.
function erBioMask(x,z){if(!onMap(x,z,20))return 0;const c=erClass(x,z);if(c===0)return 0;const h=terrainBase(x,z);if(h<1.2)return 0;
 const m=maskAt(x,z);if(m[1]>200&&m[0]<60)return .8;                                    // parks: undergrowth and a few trees
 if(m[0]<200)return 0;                                                                   // roads, footprints, cliffs, water
 if(typeof ER_INCITY==='function'&&ER_INCITY(x,z))return .07;                              // inside the walls: the odd street tree
 return c===2?1:c===1?.55:c===3?.35:0;}
function erField(n){return{wet:(x,z)=>{const c=erClass(x,z),h=terrainBase(x,z);const s=nearestOnLines(ER_LINES.stream,x,z);const b=(c===1?.74:c===2?.72:c===3?.5:.3)+(h<12?.14:0)+(s&&s.d<30?.2:0);return clamp(b,0,1);},
 salt:(x,z)=>0,
 upland:(x,z)=>clamp(terrainBase(x,z)/520,0,1),
 flow:(x,z)=>{const s=nearestOnLines(ER_LINES.stream,x,z);return s?clamp(1-s.d/40,0,1):0;},
 mist:(x,z)=>{const h=terrainBase(x,z),c=erClass(x,z);return clamp((h-260)/220,0,1)*(c>=2?.8:.3);}}[n];}
BIO.init({THREE:THREE,scene:null,terrainH:(x,z)=>terrainH(x,z),mask:erBioMask,obstacles:BIO_OBSTACLES,
 ticks:fn=>FRAME_HOOKS_PRE.push(fn),seed:SEED_ER,origin:[[-200,-100],[300,0],[-500,300],[200,400]],center:[0,0],
 fields:{wet:erField('wet'),salt:erField('salt'),upland:erField('upland'),flow:erField('flow'),mist:erField('mist')},
 err:m=>reportErr('biome: '+m),
 stat:(k,tris,inst)=>{const t=TSTAT.by['biome/'+k]||(TSTAT.by['biome/'+k]={tris:0,inst:0,meshes:0});t.tris+=tris;t.inst+=inst;}});
