// ================================================================= HOST - the sea and the streams on core/water
// THE SEA (PLAN.md section 2, the sea coming ashore): one open surface over the page (SEA_WATER: the CDLOD mesh, the onshore
// swell off the only ocean and a share of the shared wave field on the module clock, the bed baked from the ground, a SHORE
// GRID flooded from far out so the water stops at the strand, shoals over the reefs and breaks in a surf along the beach and
// round the surf rocks), and over it a TINT field: the pale shoals over the sand, the milky lime water off the coral
// terraces, the weed-brown in the shallows where the wrack rots. The far sea is a second, flat surface under it all
// (OUTER_WATER, masked off over the page). The strand is wetted by the swash (WATER.wetGround with the surface). An inland
// station has no sea: its stream is a WATER.flow down its line (STAGE.stream). The sky in the water is a capture of this
// page's sky, given to the water only. CPU twins: WATER.heightAt, WATER.flowAt.
{const env=new THREE.Scene(),WENV={environment:null};ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x4a5a44)});}
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const WBOX=[-SR*1.1,-SR*1.1,SR*1.1,SR*1.1];
let SEA_WATER=null,SEA_DRAW=null,OUTER_DRAW=null,STREAM_WATER=null,STREAM_DRAW=null;
if(SEA){
 const PALE=lin(0xb8d0c4).getHex(),LIME=lin(0xd8e8e0).getHex(),WEED=lin(0x5a5a30).getHex();
 const sw=STAGE.UV?STAGE.UV:(x,z)=>[x,z];
 SEA_WATER=WATER.open({name:'The sea (the only ocean)',level:SEA.level,swell:[[.32,64,45,0,.05],[.16,28,60,1.1,.04]],field:.35,bounds:WBOX,
  bed:terrainH,bedBox:WBOX,bedCell:8,shore:{seeds:SEA.seeds},
  tint:{box:WBOX,cell:10,at:(x,z)=>{const d=STAGE.coastD(x,z);if(d<-160)return null;
   const sand=F.sand(x+6,z+6),coral=F.coral(x+8,z+8),wr=F.strand(x+20,z+20),k=smooth(-160,0,d);
   if(coral>.05)return{c:LIME,a:Math.min(.6,coral*.9)*k};if(wr>.2)return{c:WEED,a:wr*.5*k};return sand>.05?{c:PALE,a:sand*.6*k}:{c:PALE,a:.08*k};}}});
 SEA_DRAW=WATER.draw(SEA_WATER,{renderOrder:1,roughness:.18,metalness:.05,envMapIntensity:.3,ramp:[1.5,14],pick:true,
  shallow:lin(0x3e8478),deep:lin(0x0e2e3a)});
 SEA_DRAW.mesh.userData.inspectLabel='The sea (the only ocean)';
 // the outer sea: the far ocean, flat, 0.15 m under the near surface, drawn only where the near surface is not
 const OB=[-10000,-10000,10000,10000],c=60,nx=Math.ceil((OB[2]-OB[0])/c),nz=Math.ceil((OB[3]-OB[1])/c),dd=new Uint8Array(nx*nz),m=60;
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=OB[0]+(i+.5)*c,z=OB[1]+(j+.5)*c;dd[j*nx+i]=(x>WBOX[0]+m+c&&x<WBOX[2]-m-c&&z>WBOX[1]+m+c&&z<WBOX[3]-m-c)?0:255;}
 const OUTER_WATER=WATER.open({name:'The outer sea',level:SEA.level-.15,swell:[[.32,64,45,0,.05]],field:.2,bounds:OB,mask:{x0:OB[0],z0:OB[1],cell:c,nx,nz,data:dd}});
 OUTER_DRAW=WATER.draw(OUTER_WATER,{renderOrder:0,roughness:.2,metalness:.05,envMapIntensity:.45,color:lin(0x163a44)});
 OUTER_DRAW.mesh.userData.inspectLabel='The outer sea';
 WATER.wetGround(GROUND_MAT,{surface:SEA_WATER});}   /* the strand wet where the swash reaches (and by the rain) */
if(STREAM){
 // the stream down its line, a metre over the bed and never climbing downstream (a running minimum from the source)
 const P=[];let yc=1e9;STREAM.pts.forEach(p=>{yc=Math.min(yc,terrainH(p[0],p[1])+STREAM.depth);P.push([p[0],p[1],yc]);});
 STREAM_WATER=WATER.flow({name:STREAM.name||'The stream',pts:P,width:STREAM.w*2,speed:STREAM.speed||1.4,rapids:[.04,.12]});
 STREAM_DRAW=WATER.drawFlow(STREAM_WATER,{shallow:lin(0x5a6a50),deep:lin(0x2a3a30),color:0xffffff,roughness:.14,metalness:.05,envMapIntensity:.5,step:6,across:5,margin:1.2,depthBias:1.5,renderOrder:2,pick:true});}
window._water={sea:!!SEA_DRAW,outer:!!OUTER_DRAW,stream:!!STREAM_DRAW};
