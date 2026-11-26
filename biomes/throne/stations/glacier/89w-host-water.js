// ================================================================= HOST - the proglacial lake and the meltwater river on core/water (the glacier)
// 2026-10-26 (the water migration, the last stations). Before: the lake a grid of the page's own shader over the cells of its basin, the
// river one ribbon down all three braids in another (86). Now:
//   THE LAKE   a WATER.open at LAKE.level over the basin (the old grid's box, between the terminal moraine and the snout), calm (a tenth
//              of the shared wave field), with a SHORE GRID (4 m cells) flooded from the lake's middle: it stops at the moraine, the ice
//              cliff and the breach's lip (the cells the lake does not hold, lakeAt < .12, are land whatever their height, so the flood
//              cannot run on down the river's channel); milky turquoise with rock flour, no surf bands on its rim
//   THE RIVER  each braid a WATER.flow, its line the graded surface RIV down the braid's middle every 10 m (it never climbs), its width the
//              braid's (side braids grow as they part), the ribbon out under the banks by 3.6 m as the old one was; grey-green meltwater,
//              white where the bed steepens past 4%. Three draws where the old ribbon was one (one flow per braid: core/water's flow is
//              one line, and the side braids leave and rejoin the main channel)
// The ice is not water: the glacier, the seracs, the bergs and the towers stay the page's (86). The sky in the water is core/atmos's
// skylight (this dome and the giant, given to the water only). waterH (47) is unchanged.
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone();g.position.copy(giantDir).multiplyScalar(GIANT_DIST);env.add(g);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x8a9098),key:()=>LIGHT_MODE});}
// ---- the lake
const LAKE_BOX=(function(){const pu0=TERM.u0-20,pu1=GL.SNOUT+280,pp0=TERM.p0-TERM.W0*1.4,pp1=TERM.p0+TERM.W0*1.4,c=[upAt(pu0,pp0),upAt(pu1,pp0),upAt(pu0,pp1),upAt(pu1,pp1)];
 return[Math.min(...c.map(p=>p[0])),Math.min(...c.map(p=>p[1])),Math.max(...c.map(p=>p[0])),Math.max(...c.map(p=>p[1]))];})();
const LAKE_SEED=upAt((termU(TERM.p0)+GL.SNOUT)/2,TERM.p0);
const LAKE_WATER=WATER.open({name:LAKE.name,level:LAKE.level,field:.1,bounds:LAKE_BOX,bed:terrainH,bedBox:LAKE_BOX,
 shore:{cell:4,band:40,seeds:[LAKE_SEED],land:(x,z)=>lakeAt(x,z)<.12}});
/* the lake's look is core/water's proglacial (ext/54: turquoise rock-flour meltwater, deep to the rim), recorded on the surface for the export
   (BACKPORT.md's row, 2026-11-03); the lake is not frozen (WATER.ice): its icebergs float in open water */
const LAKE_DRAW=WATER.draw(WATER.withLook(LAKE_WATER,'proglacial'),WATER.lookDraw('proglacial','open',{renderOrder:1,roughness:.12,metalness:.05,envMapIntensity:.4,surf:false,breakers:false,   /* still water: no breaker rings round the islands (HANDOFF-REBUILD.md, 'Still water takes no breakers') */pick:true}));
LAKE_DRAW.mesh.userData.inspectLabel=LAKE.name;LAKE_DRAW.mesh.userData.probeSkip=true;
// ---- the river's braids
const RIVER_FLOWS=[];
BRAIDS.forEach((B,bi)=>{let run=[],wid=[];
 const flush=()=>{if(run.length>=3)RIVER_FLOWS.push(WATER.flow({name:'The meltwater river'+(bi?' (a side braid)':''),pts:run,width:wid,speed:1.6}));run=[];wid=[];};
 for(let u=BREACH_U+12;u>-TERR.R*1.05;u-=10){const sp=braidSp(u),hw=B.hw*(bi?sp:1);if(bi&&hw<.8){flush();continue;}
  const p=riverC(u)+B.o(u)*(bi?sp:1),c=upAt(u,p);run.push([c[0],c[1],RIV(u)]);wid.push(2*hw);}
 flush();});
const RIVER_DRAWS=RIVER_FLOWS.map(F=>{const d=WATER.drawFlow(F,{rapids:[.04,.15],shallow:new THREE.Color(.42,.54,.56).convertSRGBToLinear(),deep:new THREE.Color(.3,.4,.42).convertSRGBToLinear(),
  color:0xffffff,roughness:.3,metalness:.05,envMapIntensity:.35,step:10,across:2,margin:3.6,renderOrder:1});
 d.mesh.userData.probeSkip=true;d.mesh.userData.inspectLabel='The meltwater river (flowing down the flank)';return d;});
// the reflections switch (core/water/ext/58; 89zz-host-core.js installs it, off at page load): the proglacial lake is the page's largest still
const MIRROR_STILL={materials:[LAKE_DRAW.mesh.material],level:LAKE.level,center:LAKE_SEED,radius:(LAKE_BOX[2]-LAKE_BOX[0]+LAKE_BOX[3]-LAKE_BOX[1])/4,far:3000};
// the snow lies on this page (89-host-atmos: ATMOS.snowCover), so the warm ground round the shelf's fumaroles stays bare (KTHERM, 89zz)
const STATION_SNOW=true;
