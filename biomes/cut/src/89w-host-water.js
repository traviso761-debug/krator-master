// ================================================================= HOST - the lake on core/water (stations with water)
// [draw] core/water (core/water/README.md): the upper lake as ONE open surface over the page's 2.2 R square (the CDLOD mesh, a
// calm swell and a share of the shared wave field, the bed baked from terrainH, a shore grid flooded from the lake's side so the
// water stops where the beach does), and the far lake out to the horizon as a second flat surface a hand lower, masked off over
// the near one (swbay's outer water). The sky in the water is the shared sky's own scene (89s-host-sky.js), recaptured as the
// hour moves. A station with no water (STAGE.water null) records the stage's dry state with core/water so the export's water
// section says so (WATER_STATE).
let LAKE_DRAW=null,FAR_DRAW=null,CREEK_DRAW=null,LAKE_WATER=null;
// THE CREEK (station 1; the final rebuild, pair 10): its bed was carved in the ground since the first build, but no water ran in it. Now it is core/water's
// flow down its own centre line (STAGE.creek), 0.6 m over the bed's floor, from the page's edge to where its bed meets the lake (the mouth), drawn as a
// ribbon with ripples carried down the current and the rain's rings; the plume (above) takes its water out into the lake. A station without a creek has none
const CREEK_LINE=STAGE.creek&&STAGE.creek.line?STAGE.creek.line():null;
const CREEK_FLOW=CREEK_LINE?WATER.flow({name:'The creek (snowmelt off the lip)',pts:CREEK_LINE.pts,width:CREEK_LINE.width,speed:.7}):null;
const WATER_STATE={level:WATER_LEVEL,lakes:[]};
if(STAGE.water){
 {const WENV={environment:null};ATMOS.skylight({renderer,sky:SKY.scene,scene:WENV,ground:()=>new THREE.Color(...(SKY.look?SKY.look.hemiG:[.35,.42,.29])).convertSRGBToLinear(),
   key:()=>[SKY_CLOCK.day,Math.round(SKY_CLOCK.hour*4),SKY.look&&SKY.look.cover.toFixed(2)].join()});}
 const lin=c=>new THREE.Color(c).convertSRGBToLinear();
 const BOX=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1];
 /* the lake's side of the page: down the floor from the shore (STAGE.up points up it) */
 const seedXZ=[-STAGE.up[0]*TERR.R*.95,-STAGE.up[1]*TERR.R*.95];
 /* THE CREEK'S PLUME (core/water ext/61, tintFlow; the final rebuild, pair 10): the snowmelt creek (STAGE.creek, drawn below as a WATER.flow) carries its
    silt out into the clear lake from its mouth, swirling and fading over ~600 m, drifting along the shore; ?plume=0 for the plain lake */
 const MOUTH=CREEK_LINE&&CREEK_LINE.mouth,PL=MOUTH&&STAGE.creek.plume!==false&&new URLSearchParams(location.search).get('plume')!=='0'?(function(){const M=MOUTH,out=[-STAGE.up[0],-STAGE.up[1]],al=STAGE.across,c=lin(0x8a8466);
   return{tint:{box:[M[0]-900,M[1]-900,M[0]+900,M[1]+900],cell:6,at:(x,z)=>{const dx=x-M[0],dz=z-M[1],d=Math.hypot(dx,dz),f=d<1?1:(dx*out[0]+dz*out[1])/d,a=.5*Math.exp(-d/230)*smooth(-.35,.6,f)*smooth(0,18,d+18);return a<.01?null:{c,a};}},
    tintFlow:{v:(x,z)=>{const dx=x-M[0],dz=z-M[1],d=Math.hypot(dx,dz)||1,sp=.22*Math.exp(-d/380),k=Math.min(1,d/300);return[(dx/d)*sp*(1-.4*k)+al[0]*.05*k,(dz/d)*sp*(1-.4*k)+al[1]*.05*k];},cell:12,period:60,swirl:.1,scale:120}};})():null;
 const LAKE=WATER.open(Object.assign({name:STAGE.water.name,level:WATER_LEVEL,swell:[[.05,40,280,0,.04],[.03,16,240,1.3,.03]],field:.1,bounds:BOX,
  bed:terrainH,bedBox:BOX,bedCell:8,shore:{seeds:[seedXZ]}},PL||{}));
 window._plume=PL?{mouth:MOUTH.map(Math.round)}:'off';
 /* a lake: no surf and no shore-grid breakers (BACKPORT.md, "No breakers on still water": the owner, 2026-11-02, the contour rings round islands) */
 LAKE_DRAW=WATER.draw(LAKE,{renderOrder:1,roughness:.18,metalness:.05,envMapIntensity:.24,surf:false,breakers:false,
  shallow:lin(STAGE.water.shallow==null?0x6aa89a:STAGE.water.shallow),deep:lin(STAGE.water.deep==null?0x1e4a5a:STAGE.water.deep)});
 LAKE_DRAW.mesh.userData.inspectLabel=STAGE.water.name;
 /* the far lake: flat, 0.12 m under, out to 30 km on the lake's side; off over the near surface's box */
 const FB=[-30000,-30000,30000,30000],c=100,nx=600,d=new Uint8Array(nx*nx),m=60;
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){const x=FB[0]+(i+.5)*c,z=FB[1]+(j+.5)*c,inside=x>BOX[0]+m+c&&x<BOX[2]-m-c&&z>BOX[1]+m+c&&z<BOX[3]-m-c;
  const lakeSide=x*STAGE.up[0]+z*STAGE.up[1]<-200;d[j*nx+i]=!inside&&lakeSide?255:0;}
 const FAR=WATER.open({name:STAGE.water.name+' (to the far shore)',level:WATER_LEVEL-.12,swell:[],field:0,bounds:FB,mask:{x0:FB[0],z0:FB[1],cell:c,nx,nz:nx,data:d}});
 FAR_DRAW=WATER.draw(FAR,{renderOrder:0,roughness:.2,metalness:.05,envMapIntensity:.24,shallow:lin(0x2a5a64),deep:lin(0x1e4a5a)});
 FAR_DRAW.mesh.userData.inspectLabel=STAGE.water.name;
 WATER_STATE.lakes.push(STAGE.water.name);LAKE_WATER=LAKE;}
if(CREEK_FLOW){const lin=c=>new THREE.Color(c).convertSRGBToLinear();
 if(!STAGE.water){const WENV={environment:null};ATMOS.skylight({renderer,sky:SKY.scene,scene:WENV,ground:()=>new THREE.Color(...(SKY.look?SKY.look.hemiG:[.35,.42,.29])).convertSRGBToLinear(),
   key:()=>[SKY_CLOCK.day,Math.round(SKY_CLOCK.hour*4),SKY.look&&SKY.look.cover.toFixed(2)].join()});}
 CREEK_DRAW=WATER.drawFlow(CREEK_FLOW,{shallow:lin(0x6a7a68),deep:lin(0x3a4a44),color:0xffffff,roughness:.2,metalness:.05,envMapIntensity:.3,step:8,across:4,margin:1,rain:true,renderOrder:2});
 CREEK_DRAW.mesh.userData.probeSkip=true;CREEK_DRAW.mesh.userData.inspectLabel='The creek (snowmelt off the lip)';WATER_STATE.lakes.push('The creek');}
// a station's still pool (the wall's cistern, the face's snowmelt tarn): WATER.still over its polygon, drawn flat with the sky in it
let POOL_DRAW=null,POOL_STILL=null;
if(STAGE.pool){if(!STAGE.water){const WENV={environment:null};ATMOS.skylight({renderer,sky:SKY.scene,scene:WENV,ground:()=>new THREE.Color(...(SKY.look?SKY.look.hemiG:[.35,.42,.29])).convertSRGBToLinear(),
   key:()=>[SKY_CLOCK.day,Math.round(SKY_CLOCK.hour*4),SKY.look&&SKY.look.cover.toFixed(2)].join()});}
 const P=POOL_STILL=WATER.still(STAGE.pool);POOL_DRAW=WATER.drawStill(P,{color:new THREE.Color(STAGE.pool.color==null?0x3a6a6a:STAGE.pool.color).convertSRGBToLinear(),renderOrder:1});
 if(POOL_DRAW&&POOL_DRAW.mesh)POOL_DRAW.mesh.userData.inspectLabel=STAGE.pool.name;WATER_STATE.lakes.push(STAGE.pool.name);}
