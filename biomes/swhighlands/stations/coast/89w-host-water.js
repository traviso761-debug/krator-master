// ================================================================= HOST — the Ring Sea (core/water) (station 5, the fan coast)
// ONE open surface (WATER.open: the CDLOD mesh, a swell and a share of the shared wave field, the bed baked from the ground over the map, a
// shore grid flooded from out at sea so the water stops at the beach and laps a white edge in the shallows) and a flat outer water past the
// map for the far country's sea, masked off over it (swbay's two surfaces). The sky in the water is a capture of the shared sky (core/atmos
// skylight), given to the water only. The wadis are dry (rain a few days a year); after rain the hollows hold puddles (89a).
{const WENV={environment:null};
 ATMOS.skylight({renderer,sky:SKY.scene,scene:WENV,ground:()=>new THREE.Color(...(SKY.look?SKY.look.hemiG:[.5,.44,.34])).convertSRGBToLinear(),
  key:()=>[ATMOS.clock?Math.round(ATMOS.clock.hour*4):0,SKY.look&&SKY.look.cover!=null?SKY.look.cover.toFixed(2):''].join()});}
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const SEA_BOX=[TERR.X0-60,TERR.Z0-60,TERR.X1+60,TERR.Z1+60];
const SEA=WATER.open({name:'The Ring Sea',level:0,swell:[[.12,60,250,0,.05],[.06,22,230,1.1,.03]],field:.2,bounds:SEA_BOX,
 bed:groundH,bedBox:SEA_BOX,bedCell:8,shore:{seeds:[[TERR.X1-40,0]]}});
const SEA_DRAW=WATER.draw(SEA,{rain:true,renderOrder:1,roughness:.12,metalness:.05,envMapIntensity:.35,shallow:lin(0x4a9a94),deep:lin(0x0e3a4a)});
SEA_DRAW.mesh.userData.inspectLabel='The Ring Sea';
const OUTER_BOX=[-9000,-9000,9000,9000];
const OUTER_SEA=WATER.open({name:'The Ring Sea (far)',level:-.15,swell:[],field:0,bounds:OUTER_BOX,
 mask:(function(){const c=50,nx=360,nz=360,d=new Uint8Array(nx*nz),m=60;
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=OUTER_BOX[0]+(i+.5)*c,z=OUTER_BOX[1]+(j+.5)*c;
   const inside=x>SEA_BOX[0]+m+c&&x<SEA_BOX[2]-m-c&&z>SEA_BOX[1]+m+c&&z<SEA_BOX[3]-m-c;d[j*nx+i]=inside?0:255;}
  return{x0:OUTER_BOX[0],z0:OUTER_BOX[1],cell:c,nx,nz,data:d};})()});
const OUTER_DRAW=WATER.draw(OUTER_SEA,{renderOrder:0,roughness:.2,metalness:.05,envMapIntensity:.5,color:lin(0x0e3a4a)});
OUTER_DRAW.mesh.userData.inspectLabel='The Ring Sea (far)';
