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
let SEA_WATER=null,SEA_DRAW=null,OUTER_DRAW=null,STREAM_WATER=null,STREAM_DRAW=null,HARB_WATER=null,HARB_DRAW=null,LAG_WATER=null,LAG_DRAW=null;
// THE PLUME (core/water ext/61, tintFlow; BACKPORT.md section 5, "A river's plume"; the final rebuild, pair 10): Ling-Ma (1,518 m3/s, map 5.1)
// runs out of its drowned estuary, Farport's harbour, into the sea: its silt, a green-brown off the outer wall's forests, carried out from
// the mouth on a current that spreads off the channel's line and drifts north-east along the coast on the onshore north-wester's longshore
// set, with eddies and filaments; it fades over ~500 m, never an edge. The harbour's own water carries the same silt, thicker. ?plume=0 the clear sea
const PLUME_ON=!!(HARB&&HARB.mouth&&WATER.tintFlowAt&&new URLSearchParams(location.search).get('plume')!=='0');
const SILT=(c=>[c.r,c.g,c.b])(new THREE.Color(0x5e5838).convertSRGBToLinear());   /* a green-brown silt, linear as the tint wants */
const _hx=c=>(Math.round(clamp(c[0],0,1)*255)<<16)|(Math.round(clamp(c[1],0,1)*255)<<8)|Math.round(clamp(c[2],0,1)*255);
const plumeK=(x,z)=>{if(!PLUME_ON)return 0;const m=HARB.mouth,uv=STAGE.UV(x,z),um=STAGE.UV(m[0],m[1]),out=Math.max(0,um[0]-uv[0]),dv=uv[1]-um[1]-.45*out;   /* out to sea (-u), drawn north-east (+v) */
 return .85*smooth(560,30,Math.hypot(dv*.9,out));};
if(SEA){
 const PALE=lin(0xb8d0c4).getHex(),LIME=lin(0xd8e8e0).getHex(),WEED=lin(0x5a5a30).getHex();
 const sw=STAGE.UV?STAGE.UV:(x,z)=>[x,z];
 SEA_WATER=WATER.open({name:'The sea (the only ocean)',level:SEA.level,swell:[[.32,64,45,0,.05],[.16,28,60,1.1,.04]],field:.35,bounds:WBOX,
  bed:terrainH,bedBox:WBOX,bedCell:8,
  shore:{seeds:SEA.seeds,land:SEA.land||undefined},
  tint:{box:WBOX,cell:10,at:(x,z)=>{const d=STAGE.coastD(x,z),pk=plumeK(x,z);if(d<-160&&pk<.004)return null;
   const sand=F.sand(x+6,z+6),coral=F.coral(x+8,z+8),wr=F.strand(x+20,z+20),k=smooth(-160,0,d);
   let o=coral>.05?{c:LIME,a:Math.min(.6,coral*.9)*k}:wr>.2?{c:WEED,a:wr*.5*k}:sand>.05?{c:PALE,a:sand*.6*k}:{c:PALE,a:.08*k};
   if(pk>.004){const t=pk/Math.max(pk+o.a,1e-6),a=new THREE.Color(o.c),b=new THREE.Color(_hx(SILT));o={c:a.lerp(b,t).getHex(),a:Math.min(.55,Math.max(o.a,pk*.65))};}
   return o;}},
  ...(PLUME_ON?{tintFlow:{cell:20,period:60,swirl:.12,scale:130,evolve:.8,fil:.45,filScale:28,
   v:(x,z)=>{const m=HARB.mouth,uv=STAGE.UV(x,z),um=STAGE.UV(m[0],m[1]),du=uv[0]-um[0],dv=uv[1]-um[1],dd=Math.hypot(du,dv);if(dd>900||STAGE.coastD(x,z)>4)return null;
    const k=.32*smooth(700,20,dd),ou=Math.min(0,du)/(dd||1),ov=dv/(dd||1),vu=k*(ou-.15),vv=k*ov*.6+.06;   /* out of the mouth, spreading, and the longshore set (+v) */
    return [(vu-vv)*Math.SQRT1_2,(vu+vv)*Math.SQRT1_2];}}}:{})});
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
// THE HARBOUR (station 1): Ling-Ma's drowned estuary, a still arm at sea level up through the bench, the bluff and the plateau. Its own surface,
// masked from the ground (core/water ext/58, WATER.maskFromGround: the shore is the ground's own contour), with no shore grid: the sea's
// grid stops at the mouth (STAGE.sea.land), so no breakers ring the quays (BACKPORT.md: "no breakers on still water"); a faint lap, the
// river's silt in it, a current down the arm in the plume's flow
if(HARB&&WATER.maskFromGround){const HB=[-SR*1.1,-SR*1.1,SR*1.1,SR*1.1];
 const mask=WATER.maskFromGround({box:HB,cell:6,level:HARB.level,ground:terrainH,seed:(x,z)=>HARB.at(x,z)&&STAGE.UV(x,z)[0]>HARB.u0+80,limit:(x,z)=>HARB.at(x,z)});
 HARB_WATER=WATER.open({name:HARB.name,level:HARB.level,swell:[[.02,7,40,0,.02],[.012,4,-60,1.3,.02]],field:0,bounds:HB,mask,
  tint:{box:HB,cell:10,at:(x,z)=>HARB.at(x,z)?{c:_hx(SILT),a:.42}:null}});
 HARB_DRAW=WATER.draw(HARB_WATER,{surf:false,breakers:false,renderOrder:1,roughness:.16,metalness:.05,envMapIntensity:.32,shallow:lin(0x4a6a50),deep:lin(0x1e3a34),pick:true});
 HARB_DRAW.mesh.userData.inspectLabel=HARB.name;}
// THE SALINE LAGOON (station 1): a tsunami plunge pool perched on the bench at 9 m, still and brine-clear over a pale floor; the reflections
// switch's still (99: WATER.mirrorSwitch, off at load)
if(LAGOON&&WATER.maskFromGround){const c=LAGOON.centre,r=LAGOON.r*1.3,LB=[c[0]-r,c[1]-r,c[0]+r,c[1]+r];
 const mask=WATER.maskFromGround({box:LB,cell:3,level:LAGOON.level,ground:terrainH,seed:(x,z)=>LAGOON.at(x,z),limit:(x,z)=>LAGOON.at(x,z)});
 LAG_WATER=WATER.open({name:LAGOON.name,level:LAGOON.level,swell:[[.01,5,40,0,.01]],field:0,bounds:LB,mask});
 LAG_DRAW=WATER.draw(LAG_WATER,{surf:false,breakers:false,renderOrder:1,roughness:.08,metalness:.05,envMapIntensity:.4,shallow:lin(0x8cc4b4),deep:lin(0x3a7a74),pick:true});
 LAG_DRAW.mesh.userData.inspectLabel=LAGOON.name;}
if(STREAM){
 // the stream down its line, a metre over the bed and never climbing downstream (a running minimum from the source)
 const P=[];let yc=1e9;STREAM.pts.forEach(p=>{yc=Math.min(yc,terrainH(p[0],p[1])+STREAM.depth);P.push([p[0],p[1],yc]);});
 STREAM_WATER=WATER.flow({name:STREAM.name||'The stream',pts:P,width:STREAM.w*2,speed:STREAM.speed||1.4,rapids:[.04,.12]});
 STREAM_DRAW=WATER.drawFlow(STREAM_WATER,{shallow:lin(0x5a6a50),deep:lin(0x2a3a30),color:0xffffff,roughness:.14,metalness:.05,envMapIntensity:.5,step:6,across:5,margin:1.2,depthBias:1.5,renderOrder:2,pick:true});}
window._water={sea:!!SEA_DRAW,outer:!!OUTER_DRAW,stream:!!STREAM_DRAW,harbour:!!HARB_DRAW,lagoon:!!LAG_DRAW,plume:PLUME_ON};
