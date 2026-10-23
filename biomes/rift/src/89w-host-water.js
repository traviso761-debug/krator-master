// ================================================================= HOST - the algal lake and the two streams on core/water
// core/water Phase 3 (core/water/README.md), 2026-10-20: the lake is core/water's open surface, the streams' last reach before it
// are two WATER.flow ribbons. Before this the lake, its shoals, and the streams' last reaches were ONE 300x300 plane (180k triangles) at
// y=0 in a ShaderMaterial with a vertex colour by depth (45-host-stage.js). The surface stays at y=0 (BIO.waterH is unchanged: the zones,
// the scum mats and the reeds read it), so the lake is the same lake: the CDLOD mesh covers the shore window [-3520,1300 .. 3520,3520],
// a MASK keeps it to the lake side of the wobbly shore (lakeIn < 24 m: the stream beds that dip under y=0 inland are the ribbons'),
// the bed is baked from terrainH, and the algal colour (RIFT_LAKE.hue) is the shallow and deep tints. The pale shoals and scum mats the vertex
// colour used to paint are gone from the water itself (the scum mats of the floor, 60, still float on it). The sky in the water is
// core/atmos's skylight, a capture of this page's dome and giant given to the water only (WENV), so the page's own materials keep their lighting.
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone();env.add(g);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x4a4630)});}
const lin=c=>c.clone().convertSRGBToLinear();
const LAKE_BOX=[-3520,1300,3520,3520],LAKE_MC=8;
const LAKE_MASK=(function(){const nx=Math.round((LAKE_BOX[2]-LAKE_BOX[0])/LAKE_MC),nz=Math.round((LAKE_BOX[3]-LAKE_BOX[1])/LAKE_MC),d=new Uint8Array(nx*nz);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)d[j*nx+i]=lakeIn(LAKE_BOX[0]+(i+.5)*LAKE_MC,LAKE_BOX[1]+(j+.5)*LAKE_MC)<24?255:0;
 return{x0:LAKE_BOX[0],z0:LAKE_BOX[1],cell:LAKE_MC,nx,nz,data:d};})();
const LAKE_WATER=WATER.open({name:'The algal lake',level:0,swell:[[.05,22,35,0,.03],[.03,13,-50,1.3,.03],[.012,6,80,2.2,.02]],field:0,
 bounds:LAKE_BOX,bed:terrainH,bedCell:LAKE_MC,mask:LAKE_MASK});
const LAKE_DRAW=WATER.draw(LAKE_WATER,{surf:false,roughness:.2,metalness:.05,envMapIntensity:.85,renderOrder:1,
 shallow:lin(WATER_SHALLOW.clone().lerp(WATER_MID,.4).lerp(WATER_PALE,.2)),deep:lin(WATER_DEEP)});
LAKE_DRAW.mesh.userData.inspectLabel='The algal lake';
// surf: false (core/water, 2026-10-21): WATER.draw laps a surf of white bands wherever the bed is under 1.4 m, right for a sea's beach and wrong for a still lake's
// rim, and the bed was clamped at 1.4 m deep to hide it (so the baked depth lied in the last 1.4 m of the shallows). Now the bed is the ground's own and the lap is off:
// the shallows take their true depth (the colour ramp, the calming of the waves to nothing at the waterline); the ground itself and BIO.waterH are untouched.
// the streams' last reach: the line down each stream's centre from where the lake is 430 m off to 10 m inside it, a hand above the lake
// (y=.1: a ribbon at the lake's own level would fight it where they meet; the bed dips under y=0 only in the last 370 m, so the
// ribbon shows exactly where the old plane did), 16 m wide with 3 m tucked under each bank
const streamLine=xs=>{const P=[];for(let z=900;z<3300;z+=16){const x=xs(z),lk=lakeIn(x,z);if(lk>430)continue;P.push([x,z,.1]);if(lk<-10)break;}return P;};
const STREAM_PALE=new THREE.Color(0x9ab4a8);   /* the old shader mixed the sky into the stream, up to .6 at a grazing view: it read a pale grey-green */
const STREAMS=[['The east stream',xsE],['The west stream',xsW]].map(([n,f])=>WATER.flow({name:n,pts:streamLine(f),width:16,speed:.6}));
const STREAM_DRAW=STREAMS.map(S=>{const D=WATER.drawFlow(S,{shallow:lin(RIVER_COL.clone().lerp(STREAM_PALE,.5)),deep:lin(RIVER_COL.clone().lerp(STREAM_PALE,.3)),color:0xffffff,roughness:.2,metalness:.05,envMapIntensity:.3,step:12,across:4,margin:3});
 D.mesh.userData.inspectLabel=S.name;return D;});
