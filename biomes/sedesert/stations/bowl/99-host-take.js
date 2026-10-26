// ================================================================= HOST — the Bowl's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (core/host/README.md); this fragment says what the
// station has. The frame is the heat pass's (86: the shared sky, the world, the shimmer and the mirage).
const gh=(x,z,dy)=>Math.max(terrainH(x,z),waterH(x,z))+(dy||0);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
function nearTree(key,x,z,minH){const sp=SEDESERT.SPECIES.indexOf(SEDESERT.byKey[key]);return SEDESERT.nearestTree(sp,x,z,minH)||{x,z,y0:gh(x,z),H:8,crownR:5};}
function atTree(T,d,az,dy){const cx=T.x+Math.cos(az)*d,cz=T.z+Math.sin(az)*d;return[cx,Math.max(gh(cx,cz,1.8),T.y0+(dy==null?T.H*.45:dy)),cz,T.x,T.y0+T.H*.6,T.z];}
// a registered halophyte tree (66 registers the heroes) nearest a point
function nearReg(key,x,z){let b=null,bd=1e9;for(const r of REG){if(r.key!==key)continue;const d=Math.hypot(r.x-x,r.z-z);if(d<bd){bd=d;b=r;}}return b||{x,z,y:gh(x,z),r:3,h:5};}
const atReg=(R,d,az)=>{const cx=R.x+Math.cos(az)*d,cz=R.z+Math.sin(az)*d;return[cx,gh(cx,cz,1.7),cz,R.x,R.y+R.h*.5,R.z];};
const D2=CHAN[3],D2M=D2.pts[Math.floor(D2.pts.length*.55)];
const TAM=nearReg('tamarisk',D2M[0]+60,D2M[1]),SAX=nearReg('saxaul',-300,zS(-300)+1700);
const VIEWS={
 'The shore at the delta':look(DELTA.x+520,zS(DELTA.x+520)+60,9,DELTA.x+300,zS(DELTA.x+300)-700,0),
 'The banded shallows':[-500,LAKE.level+70,zS(-500)+260,-250,LAKE.level,zS(-250)-1100],
 'The ochre salt rim':look(-950,zS(-950)+25,2.2,-1000,zS(-1000)-700,0),
 'The salt flat':look(-1500,zS(-1500)+560,2.4,-1900,zS(-1900)-300,0),
 'Mantis across the mirage':[-2700,gh(-2700,zS(-2700)+90,2.2),zS(-2700)+90,MANTIS.x,FAR.farH(MANTIS.x,MANTIS.z)+25,MANTIS.z],
 'The delta from the apex':[DELTA.apex[0]+120,terrainH(DELTA.apex[0]+120,DELTA.apex[1]+260)+30,DELTA.apex[1]+260,DELTA.apex[0]-60,LAKE.level,zS(DELTA.apex[0])-200],
 'A distributary':look(D2M[0]+38,D2M[1]+30,1.7,D2.pts[D2.pts.length-15][0],D2.pts[D2.pts.length-15][1],1),
 'Tamarisk on the levee':atReg(TAM,16,2.4),
 'Saxaul woods':atReg(SAX,22,1.2),
 'The halophyte belt':look(-300,zS(-300)+1750,1.8,-500,zS(-500)+500,0),
 'The kaluts':look(-2000,1300,5,-2000-WIND[0]*900,1300-WIND[1]*900,6),
 'Kaluts from the air':look(-900,2100,180,-2200,600,10),
 'Dense-air dragon trees':atTree(nearTree('dragon',-600,2200),38,.8),
 'A bottle tree the size of a baobab':atTree(nearTree('bottle',300,2500),30,2.6),
 'Dunes downwind of the flat':look(1250,1900,6,2300,2700,4),
 'From afar':[2900,LAKE.level+620,3400,-300,LAKE.level,-200],
};
// ---------------------------------------------------------------- the page, handed to the host
KHOST.on(skyView,'view');   /* the shared sky, its lights and fog at the hour (89s-host-sky.js) */
KHOST.take({build:'sedesert-bowl',title:'Krator biome — the Bowl (the eastern desert, station 2)',
 hint:'The Bowl: the south shore of the abyssal salt lake at the Bowl river 2\'s delta, 990 m under the sea (1.83 atm): the banded shallows, the ochre rim, the salt flat, the delta, the halophytes, the kaluts',
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,views:VIEWS,ticks:TICKS,
 clock:{hour:SKY_HOUR0},draw:(s,c,dt)=>HEAT.render(dt),   /* the heat pass: the shared sky, the world, the shimmer (86) */
 clampCam(cp){const g=Math.max(terrainH(cp.x,cp.z),LAKE.level)+1.6;if(cp.y<g)cp.y=g;},
 inspect:describe,stats:()=>'inst '+window._instances+(HEAT.active?'\nheat '+HEAT.U.uK.value.toFixed(2):''),
 layers:{'flora and fauna':{match:o=>!!(o.userData&&o.userData.biome)},'far country':{match:o=>!!(o.userData&&o.userData.host)},'sky':{objects:()=>[SKY.mesh]}},
 exporters:{biome:()=>BIO.export()},
 minimap:{title:'The Bowl'},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 biome:()=>window._biome}});
