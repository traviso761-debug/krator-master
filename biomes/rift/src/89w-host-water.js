// ================================================================= HOST - the algal lake and the two streams on core/water
// core/water Phase 3 (core/water/README.md), 2026-10-20: the lake is core/water's open surface, the streams' last reach before it
// are two WATER.flow ribbons. Before this the lake, its shoals, and the streams' last reaches were ONE 300x300 plane (180k triangles) at
// y=0 in a ShaderMaterial with a vertex colour by depth (45-host-stage.js). The surface stays at y=0 (BIO.waterH is unchanged: the zones,
// the scum mats and the reeds read it), so the lake is the same lake: the CDLOD mesh covers the shore window [-3520,1300 .. 3520,3520],
// a MASK keeps it to the lake side of the wobbly shore (lakeIn < 24 m: the stream beds that dip under y=0 inland are the ribbons'),
// the bed is baked from terrainH, and the algal colour (RIFT_LAKE.hue) is the shallow and deep tints. The pale shoals, scum mats and the fresh stream colour the vertex
// colour used to paint are a tint field on the surface (below; the scum mats of the floor, 60, also float on it). The sky in the water is
// core/atmos's skylight, a capture of this page's dome and giant given to the water only (WENV), so the page's own materials keep their lighting.
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone();env.add(g);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x4a4630)});}
const lin=c=>c.clone().convertSRGBToLinear();
const STREAM_PALE_C=new THREE.Color(0x9ab4a8);
const LAKE_BOX=[-3520,1300,3520,3520],LAKE_MC=8;
const LAKE_MASK=(function(){const nx=Math.round((LAKE_BOX[2]-LAKE_BOX[0])/LAKE_MC),nz=Math.round((LAKE_BOX[3]-LAKE_BOX[1])/LAKE_MC),d=new Uint8Array(nx*nz);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)d[j*nx+i]=lakeIn(LAKE_BOX[0]+(i+.5)*LAKE_MC,LAKE_BOX[1]+(j+.5)*LAKE_MC)<24?255:0;
 return{x0:LAKE_BOX[0],z0:LAKE_BOX[1],cell:LAKE_MC,nx,nz,data:d};})();
/* the colour the old plane's vertex colour carried and the depth ramp cannot: pale algal shoals, scum mats and a pale rim (WATER_PALE, mixed in by
   depth and two noise fields) and the fresh river colour where a stream enters (RIVER_COL). It is a tint field over the one lake surface (core/water
   WATER.open({tint}), 2026-10-25): premultiplied alpha is the blend, so the shoals fade into the depth ramp as the vertex colour did. Colours are
   LINEAR bytes (the tint texture is read as is), written darker as the shallow and deep are (the lit surface brightens a tint). */
const hexL=c=>{const q=v=>Math.round(Math.min(1,Math.max(0,v))*255);return(q(c.r)<<16)|(q(c.g)<<8)|q(c.b);};
const PALE_L=lin(WATER_PALE.clone().lerp(WATER_MID,.35)),FRESH_L=lin(RIVER_COL.clone().lerp(STREAM_PALE_C,.4)),TC=new THREE.Color();
const LAKE_TINT={box:LAKE_BOX,cell:12,at:(x,z)=>{const d=Math.max(0,-terrainH(x,z)),lk=lakeIn(x,z),fresh=smooth(120,30,streamD(x,z))*(1-smooth(-60,-240,lk));
 const shoal=fbm(x*.0031+2,z*.0031-4,505,2),scum=fbm(x*.0071-3,z*.0071+6,506,2);
 const pale=Math.max(smooth(.47,.66,shoal)*smooth(2.2,.3,d),smooth(.5,.08,d)*.7,smooth(.58,.7,scum)*smooth(3,.5,d)*.8)*(1-fresh);
 const a=pale+fresh;if(a<.004)return null;TC.copy(PALE_L).lerp(FRESH_L,fresh/a);return{c:hexL(TC),a:Math.min(1,a)};}};
const LAKE_WATER=WATER.open({name:'The algal lake',level:0,swell:[[.05,22,35,0,.03],[.03,13,-50,1.3,.03],[.012,6,80,2.2,.02]],field:0,
 bounds:LAKE_BOX,bed:terrainH,bedCell:LAKE_MC,mask:LAKE_MASK,tint:LAKE_TINT});
const LAKE_DRAW=WATER.draw(LAKE_WATER,{surf:false,ramp:[.5,8.5],roughness:.2,metalness:.05,envMapIntensity:.85,renderOrder:1,
 shallow:lin(WATER_SHALLOW.clone().lerp(WATER_MID,.4).lerp(WATER_PALE,.2)),deep:lin(WATER_DEEP)});
LAKE_DRAW.mesh.userData.inspectLabel='The algal lake';
// surf: false (core/water, 2026-10-21): WATER.draw laps a surf of white bands wherever the bed is under 1.4 m, right for a sea's beach and wrong for a still lake's
// rim, and the bed was clamped at 1.4 m deep to hide it (so the baked depth lied in the last 1.4 m of the shallows). Now the bed is the ground's own and the lap is off:
// the shallows take their true depth (the colour ramp, the calming of the waves to nothing at the waterline); the ground itself and BIO.waterH are untouched.
// the streams' last reach: the line down each stream's centre from where the lake is 430 m off to 10 m inside it, AT the lake's level
// (y=0, the lake's own level: drawFlow's depthBias pulls the ribbon over the lake where they meet, in place of the old .1 m lift; the bed dips under
// y=0 only in the last 370 m, so the ribbon shows exactly where the old plane did), 16 m wide with 3 m tucked under each bank
const streamLine=xs=>{const P=[];for(let z=900;z<3300;z+=16){const x=xs(z),lk=lakeIn(x,z);if(lk>430)continue;P.push([x,z,0]);if(lk<-10)break;}return P;};
const STREAM_PALE=STREAM_PALE_C;   /* the old shader mixed the sky into the stream, up to .6 at a grazing view: it read a pale grey-green */
const STREAMS=[['The east stream',xsE],['The west stream',xsW]].map(([n,f])=>WATER.flow({name:n,pts:streamLine(f),width:16,speed:.6}));
const STREAM_DRAW=STREAMS.map(S=>{const D=WATER.drawFlow(S,{shallow:lin(RIVER_COL.clone().lerp(STREAM_PALE,.5)),deep:lin(RIVER_COL.clone().lerp(STREAM_PALE,.3)),color:0xffffff,roughness:.2,metalness:.05,envMapIntensity:.3,step:12,across:4,margin:3,depthBias:2});
 D.mesh.userData.inspectLabel=S.name;return D;});
