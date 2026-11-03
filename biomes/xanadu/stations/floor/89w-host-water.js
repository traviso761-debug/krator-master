// ================================================================= HOST - STATION 5, THE RIFT FLOOR: the water on core/water (replaces src/89w-host-water.js)
// THE SALT LAKE (5.1 basins.json, -1,362 m, XV; the page's datum, level 0): one WATER.open over the north-east of the page, its shore grid flooded from the
// deep water and kept to the lake's side, still (no surf, no breakers: BACKPORT.md's still-water rule), shallow (most of it under 6 m) and milky jade, with
// a TINT field: the pale salt crust's white over the flats under 1.2 m and a faint yellow where the salt shoals (the Rift's lakes are yellow, pink and
// blue-green, LORE.md). No river enters on the page (the creek beds are dry outside the rains), so no plume. The reflections switch is on the lake (99, LAND.mirror).
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone(),r=giantRing.clone();env.add(g);env.add(r);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x3e5238)});}
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const WBOX=[TERR.X0,TERR.Z0,TERR.X1,TERR.Z1];
const SALT_L=lin(0xe8ecdc).getHex(),YELLOW_L=lin(0xd8d08a).getHex();
const LAKE_SEED=(function(){for(let r=0;r<4000;r+=50)for(let a=0;a<6.283;a+=.4){const x=2400+Math.cos(a)*r,z=-2800+Math.sin(a)*r;if(x>TERR.X0&&x<TERR.X1&&z>TERR.Z0&&z<TERR.Z1&&terrainH(x,z)<-3)return[x,z];}return[2400,-3300];})();
const LAKE_WATER=WATER.open({name:'The salt lake',level:0,swell:[[.035,34,225,0,.03],[.02,14,200,1.3,.02]],field:.06,bounds:WBOX,
 bed:terrainH,bedBox:WBOX,bedCell:12,shore:{seeds:{edge:true,depth:2,sides:'ne',points:[LAKE_SEED]},land:(x,z)=>FLOORLAND.sd(x,z)>120},
 tint:{box:WBOX,cell:16,at:(x,z)=>{const h=terrainH(x,z);if(h>1)return null;const d=Math.max(0,-h),salt=smooth(1.4,.15,d)*.75,ye=.35*smooth(.55,.75,fbm(x*.0025+3,z*.0025-1,651,2))*smooth(4,1.5,d);
  if(salt>=ye)return salt<.01?null:{c:SALT_L,a:salt};return{c:YELLOW_L,a:ye};}}});
/* a lake: no surf and no shore-grid breakers (the owner, 2026-11-02) */
const LAKE_DRAW=WATER.draw(LAKE_WATER,{renderOrder:1,roughness:.12,metalness:.05,envMapIntensity:.25,ramp:[.8,10],pick:true,surf:false,breakers:false,
 shallow:lin(new THREE.Color().setHSL(.44,.38,.58)),deep:lin(new THREE.Color().setHSL(.47,.5,.3))});
LAKE_DRAW.mesh.userData.inspectLabel='The salt lake (the Rift\'s easternmost)';
if(XQ_ON('breakup'))WATER.breakupAll();
window._water={lake:!!LAKE_DRAW,seed:LAKE_SEED,plume:false};
