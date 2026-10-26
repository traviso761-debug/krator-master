// ================================================================= HOST — Mantis's pocket: the views, handed to core/host
// The inspector's words and the checks are the Bowl's (98-host-checks.js); this station adds one: the forest's species are drawn
// and tagged. The frame is the heat pass's (86: weaker here, the air is humid).
const gh=(x,z,dy)=>Math.max(terrainH(x,z),waterH(x,z))+(dy||0);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
function nearTree(key,x,z,minH){const sp=SEDESERT.SPECIES.indexOf(SEDESERT.byKey[key]);return SEDESERT.nearestTree(sp,x,z,minH)||{x,z,y0:gh(x,z),H:8,crownR:5};}
function atTree(T,d,az,dy){const cx=T.x+Math.cos(az)*d,cz=T.z+Math.sin(az)*d;return[cx,Math.max(gh(cx,cz,1.8),T.y0+(dy==null?T.H*.45:dy)),cz,T.x,T.y0+T.H*.55,T.z];}
const nearRec=(list,x,z)=>list.reduce((b,r)=>!b||Math.hypot(r.x-x,r.z-z)<Math.hypot(b.x-x,b.z-z)?r:b,null);
const GD=nearRec(TOWNREC.gardens.filter(g=>g.kind==='dates'),0,0)||TOWNREC.gardens[0],GF=nearRec(TOWNREC.gardens.filter(g=>g.kind==='figs'),0,0)||GD,HS=nearRec(TOWNREC.houses,0,0);
const SP0=SPRINGS[0],ST=CHAN[1],STM=ST.pts[Math.floor(ST.pts.length*.45)];
const VIEWS={
 'The edge of Mantis':look(HS.x+48,HS.z-38,6,HS.x-30,HS.z+25,3),
 'A walled date grove':look(GD.x+GD.w*.9,GD.z-GD.d*.9,6,GD.x,GD.z,6),
 'A fig garden':look(GF.x+GF.w*.8,GF.z-GF.d*.7,3,GF.x,GF.z,5),
 'A spring':look(SP0.x+SP0.r*2.6,SP0.z+SP0.r*1.4,1.7,SP0.x-SP0.r*.5,SP0.z-SP0.r*.4,.5),
 'Under a Mantis fig':atTree(nearTree('figv',SP0.x,SP0.z,15),9,.9,2),
 'The gallery forest':look(STM[0]+40,STM[1]+50,1.8,STM[0]-60,STM[1]-90,6),
 'Dragon\'s blood grove':atTree(nearTree('dragon',-600,600),26,2.2),
 'Frankincense':atTree(nearTree('incense',300,400),9,1.4,2.5),
 'A cucumber tree':atTree(nearTree('cucumber',600,1500),7,2.0,1.6),
 'The savanna in the monsoon':look(700,1500,1.8,1500,800,6),
 'The reed shore':look(400,zS(400)+90,2.2,700,zS(700)-500,0),
 'Where the pocket ends':look(1700,2300,5,2900,3000,4),
 'The pocket from the lake':[2200,LAKE.level+90,zS(2200)-900,-600,LAKE.level+10,700],
 'From afar':[3200,LAKE.level+700,-2600,-800,LAKE.level,900],
};
const FOREST={figv:4,incense:20,cucumber:5,pom:10,sterc:8};
function forestCheck(SP,TR){const n={};TR.forEach(T=>{const k=SP[T.sp].key;n[k]=(n[k]||0)+1;});const low=Object.keys(FOREST).filter(k=>!((n[k]||0)>=FOREST[k])),untagged=Object.keys(FOREST).filter(k=>!(SEDESERT.byKey[k]&&SEDESERT.byKey[k].tags.harvest));
 return{ok:!low.length&&!untagged.length,detail:Object.keys(FOREST).map(k=>k+' '+(n[k]||0)).join(', ')+(low.length?'; TOO FEW: '+low.join(', '):'')+(untagged.length?'; untagged: '+untagged.join(', '):'')};}
KHOST.on(skyView,'view');
KHOST.take({build:'sedesert-mantis',title:'Krator biome — Mantis\'s pocket (the eastern desert, station 3)',
 hint:'Mantis\'s green pocket on the Bowl\'s south-west shore: a Socotran monsoon forest (great figs, frankincense, cucumber trees, dragon\'s blood groves) round the springs, savanna, the edge of the oasis town',
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,views:VIEWS,ticks:TICKS,
 clock:{hour:SKY_HOUR0},draw:(s,c,dt)=>HEAT.render(dt),
 clampCam(cp){const g=Math.max(terrainH(cp.x,cp.z),LAKE.level)+1.6;if(cp.y<g)cp.y=g;},
 inspect:describe,stats:()=>'inst '+window._instances+(HEAT.active?'\nheat '+HEAT.U.uK.value.toFixed(2):''),
 layers:{'flora and fauna':{match:o=>!!(o.userData&&o.userData.biome)},'town and far country':{match:o=>!!(o.userData&&o.userData.host)},'sky':{objects:()=>[SKY.mesh]}},
 exporters:{biome:()=>BIO.export()},
 minimap:{title:'Mantis\'s pocket'},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks:()=>hostChecks().concat([Object.assign({name:'the forest\'s species drawn and tagged'},forestCheck(SEDESERT.SPECIES,SEDESERT.TREES))]),
 hostNegatives:()=>hostNegatives().concat([{name:'no Mantis figs',...(r=>({failed:!r.ok,detail:r.detail}))(forestCheck(SEDESERT.SPECIES,SEDESERT.TREES.filter(T=>SEDESERT.SPECIES[T.sp].key!=='figv')))}]),
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 biome:()=>window._biome}});
