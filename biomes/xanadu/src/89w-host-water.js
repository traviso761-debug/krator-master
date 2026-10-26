// ================================================================= HOST - the lake and the sacred river on core/water
// core/water (core/water/README.md), 2026-10-25, migration phase 4. The lake is a WATER.open at level 0 (the CDLOD mesh, a calm swell and a
// share of the shared wave field, the bed baked from terrainH, a shore grid flooded from the lake's middle so the water stops at the map's
// shore and laps a white edge in the shallows, the shallow-to-deep ramp of the old plane's vertex colours, and over it a TINT field: the pale
// shoals, lakeColorAt's pale weight). The sacred river is a WATER.flow along RIV's line (a hand above the bed, as the old ribbon: width the
// bank-to-bank reach, ripples carried down the current, white water on the 3 to 16 percent grades), the two chasm cascades WATER.fall
// (WATER.fallsOf with fit). The page's own plane, ribbon, shader and tick are gone (46-host-ground.js). The lake's cataract stays paint
// on the sky (82-host-sky.js: it lies off the map). The sky in the water is a capture of this page's dome and giant, given to the water only.
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone(),r=giantRing.clone();env.add(g);env.add(r);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x5a6a4a)});}
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const LAKE_BOX=[TERR.X0,TERR.Z0,TERR.X1,TERR.Z1];
const PALE_L=lin(WATER_PALE).getHex();
const LAKE_SEED=(function(){let q=RIV.P[RIV.P.length-1],x=q[0],z=q[1];for(let k=0;k<80&&terrainH(x,z)>-6;k++)z-=50;return[x,z];})();   /* north up the lake from the river's mouth, to deep water */
const LAKE_WATER=WATER.open({name:'The lake',level:0,swell:[[.05,40,225,0,.035],[.03,16,200,1.3,.025]],field:.1,bounds:LAKE_BOX,
 bed:terrainH,bedBox:LAKE_BOX,bedCell:12,shore:{seeds:{edge:true,depth:2,sides:'nesw',points:[LAKE_SEED]}},
 tint:{box:LAKE_BOX,cell:16,at:(x,z)=>{const h=terrainH(x,z);if(h>3)return null;const d=Math.max(0,-h),shoal=fbm(x*.0031+2,z*.0031-4,505,2),
  a=Math.max(smooth(.5,.68,shoal)*smooth(3,.4,d),smooth(.9,.1,d)*.6)*smooth(8,2,d);return a<.01?null:{c:PALE_L,a};}}});
const LAKE_DRAW=WATER.draw(LAKE_WATER,{renderOrder:1,roughness:.16,metalness:.05,envMapIntensity:.22,ramp:[1.5,24],pick:true,
 shallow:lin(WATER_SHALLOW.clone().lerp(WATER_MID,.5)),deep:lin(WATER_DEEP.clone().multiplyScalar(.9))});
LAKE_DRAW.mesh.userData.inspectLabel='The lake';
// ---- the sacred river: a flow a hand (.65 m) over the bed, bank to bank, the last reach under the lake's surface
const RIVER_COL=new THREE.Color().setHSL(XANADU_LAKE.hue+.03,.45,.40),RIVER_DEEP=new THREE.Color().setHSL(XANADU_LAKE.hue+.05,.5,.24);
const RIVER=(function(){const P=RIV.P,n=P.length,pts=[],wd=[];
 for(let i=0;i<n;i++){const s=RIV.S[i],g=RIV.gorgeK(s),kf=mix(.06,.35,g),lvl0=RIV.bed[i]+.65,lvl=s/RIV.LEN>.97?Math.min(lvl0,-.06):lvl0;
  pts.push([P[i][0],P[i][1],lvl]);wd.push(2*(RIV.halfW(s)+.8*.65/kf));}
 return WATER.flow({name:'The sacred river',pts,width:wd,speed:pts.map((p,i)=>1.2+2.4*smooth(.02,.16,i+1<n?Math.max(0,(p[2]-RIV.bed[i+1]-.65)/Math.max(1,RIV.S[i+1]-RIV.S[i])):0)),rapids:[.03,.16]});})();
const RIVER_DRAW=WATER.drawFlow(RIVER,{shallow:lin(RIVER_COL.clone().lerp(RIVER_DEEP,.4)),deep:lin(RIVER_DEEP),color:0xffffff,roughness:.14,metalness:.05,envMapIntensity:.5,step:10,across:6,margin:1.2,depthBias:2,renderOrder:2,pick:true});
RIVER_DRAW.mesh.userData.inspectLabel='The sacred river';
const RIVER_FALLS=WATER.fallsOf(RIVER,{steep:.3,minDrop:5,fit:true}).map(f=>WATER.fall(f));
const FALL_DRAWS=RIVER_FALLS.map(F=>{const D=WATER.drawFall(F,{color:lin(0xdce8e6),opacity:.9,rows:24,cols:6,spray:false,envMapIntensity:.25,renderOrder:3});
 D.mesh.userData.inspectLabel='The chasm cascades';D.plunge.userData.inspectLabel='The chasm cascades';return D;});
window._water={lake:!!LAKE_DRAW,river:!!RIVER_DRAW,falls:RIVER_FALLS.length,seed:LAKE_SEED};
