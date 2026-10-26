// ================================================================= HOST — the lake and the delta on core/water
// THE LAKE (PLAN-BOWL.md section 3): teal hypersaline water, its shallows BANDED by the algae and brine shrimp of each
// salinity (Lake Hillier, the Lut's and Uyuni's pans): ochre over the salt crust at the waterline, then pink, an ochre-orange
// band, a pale teal, and the teal core beyond. Two open surfaces at the lake's level, as swbay's bay and its outer water:
// the station's (the bed baked from the ground, so the water clips at the shore and over the ochre ridges and calms in the
// shallows; the bands a baked tint field over the depth ramp; no surf: a salt lake has no lap) and the far lake to the
// horizon (flat, masked to the water by the shore formula and off the station's box). Hardly a ripple: brine is heavy.
// THE DELTA: the river and its five distributaries, each a core/water flow line on the levels 45 gave it (KRELIEF.river),
// drawn as its ribbon (ripples carried down the current), silty green-brown. CPU twins: WATER.heightAt, WATER.flowAt.
// The sky in the water is a capture of the shared sky (89s), given to the water only.
{const WENV={environment:null};
 ATMOS.skylight({renderer,sky:SKY.scene,scene:WENV,ground:()=>new THREE.Color(...(SKY.look?SKY.look.hemiG:[.5,.45,.38])).convertSRGBToLinear(),
  key:()=>[SKY_CLOCK.day,Math.round(SKY_CLOCK.hour*4),SKY.look&&SKY.look.cover.toFixed(2)].join()});}
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const linI=hex=>{const c=lin(hex);return(Math.round(c.r*255)<<16)|(Math.round(c.g*255)<<8)|Math.round(c.b*255);};
// THE BANDS: metres out from the shore (wobbling with a slow noise), each a colour and its share over the depth ramp
const BANDS=[[0,linI(0xc88a48),.55],[150,linI(0xe0708e),.58],[430,linI(0xd88a50),.45],[800,linI(0x6ac0b8),.36],[1500,linI(0x3aa0a0),.2],[2600,0,0]];
function bandAt(x,z){const d=-uOf(x,z)+180*(BIO.fn.fbm(x*.0012+4,z*.0012,8921,2)-.5)+60*Math.sin(x*.004+z*.002);if(d<-60)return null;
 let i=0;while(i<BANDS.length-2&&d>BANDS[i+1][0])i++;const A=BANDS[i],B=BANDS[i+1],t=smooth(B[0]-90,B[0]+40,d);
 if(!B[1])return{c:A[1],a:A[2]*(1-t)};
 const ca=new THREE.Color(A[1]),cb=new THREE.Color(B[1]),c=ca.lerp(cb,t);return{c:c.getHex(),a:A[2]+(B[2]-A[2])*t};}
// THE PLUMES: each distributary's silty water fans out into the brine from its mouth (fresh water floats on brine), the river's
// colour at the mouth fading into the bands over ~400 m out and widening as it goes, so the ribbon's end meets water of its own colour
// a mouth for every channel whose line ends in the lake (the Bowl's river ends at the delta's apex: it has none)
const RIVER_TINT=new THREE.Color(linI(STATION.riverTint==null?0x6e6a44:STATION.riverTint)),MOUTHS=CHAN.map(C=>{const n=C.pts.length;if(uOf(C.pts[n-1][0],C.pts[n-1][1])>=6)return null;
 let k=n-1;while(k>1&&uOf(C.pts[k][0],C.pts[k][1])<6)k--;
 const a=C.pts[Math.max(0,k-6)],b=C.pts[k],L=Math.hypot(b[0]-a[0],b[1]-a[1])||1;return{x:b[0],z:b[1],dx:(b[0]-a[0])/L,dz:(b[1]-a[1])/L,w:C.w,k};});
function plumeAt(x,z){let k=0;for(const M of MOUTHS){if(!M)continue;const rx=x-M.x,rz=z-M.z,al=rx*M.dx+rz*M.dz,ac=Math.abs(rx*M.dz-rz*M.dx);if(al<-40)continue;
  const hw=M.w*.6+.38*Math.max(0,al),wob=1+.25*(BIO.fn.fbm(x*.01,z*.01,8922,2)-.5);
  k=Math.max(k,Math.exp(-Math.pow(ac/(hw*wob),2))*smooth(-40,0,al)*Math.exp(-Math.max(0,al)/(260+6*M.w)));}return k;}
const _bc=new THREE.Color();
function tintAt(x,z){const B=bandAt(x,z),k=plumeAt(x,z);if(k<.02)return B;
 if(!B)return{c:RIVER_TINT.getHex(),a:.8*k};_bc.set(B.c).lerp(RIVER_TINT,k);return{c:_bc.getHex(),a:B.a+(.82-B.a)*k};}
const LAKE_BOX=[-GRID.S/2,-GRID.S/2,GRID.S/2,800];
const LAKE_WATER=WATER.open({name:'The Bowl lake',level:LAKE.level,swell:[[.012,26,160,0,.01],[.008,11,200,1.3,.01]],field:.03,bounds:LAKE_BOX,
 bed:terrainH,bedBox:LAKE_BOX,bedCell:6,
 tint:{box:LAKE_BOX,cell:8,at:tintAt}});
const LAKE_DRAW=WATER.draw(LAKE_WATER,{transparent:true,renderOrder:1,roughness:.1,metalness:.05,envMapIntensity:.55,surf:false,ramp:[.3,5],
 shallow:lin(0x8ac4bc),deep:lin(0x2a8a8e)});
LAKE_DRAW.mesh.userData.inspectLabel=LAKE.name;
// the far lake: flat, a decimetre under the station's, only where the shore formula says water and off the station's box
const FAR_BOX=[-60000,-60000,60000,60000];
const FAR_LAKE=WATER.open({name:'The Bowl lake (far)',level:LAKE.level-.1,swell:[],field:.02,bounds:FAR_BOX,
 mask:(function(){const c=100,nx=1200,nz=1200,d=new Uint8Array(nx*nz),m=60;
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=FAR_BOX[0]+(i+.5)*c,z=FAR_BOX[1]+(j+.5)*c;
   const inside=x>LAKE_BOX[0]+m+c&&x<LAKE_BOX[2]-m-c&&z>LAKE_BOX[1]+m+c&&z<LAKE_BOX[3]-m-c;d[j*nx+i]=!inside&&uOf(x,z)<-c?255:0;}
  return{x0:FAR_BOX[0],z0:FAR_BOX[1],cell:c,nx,nz,data:d};})()});
const FAR_LAKE_DRAW=WATER.draw(FAR_LAKE,{renderOrder:0,roughness:.12,metalness:.05,envMapIntensity:.55,color:lin(0x3a9a9a)});
FAR_LAKE_DRAW.mesh.userData.inspectLabel=LAKE.name;
// THE DELTA: each channel's line to its mouth on the shore (the plume carries its colour out into the lake), the main river faster
// each line ends at its mouth on the shore (MOUTHS): the lake and its plume take the water from there
const DELTA_FLOWS=CHAN.map((C,ci)=>{const P=[],end=MOUTHS[ci]?MOUTHS[ci].k:C.pts.length-1;for(let k=0;k<=end;k++){const p=C.pts[k];P.push([p[0],p[1],C.y[k]]);}
 const S=WATER.flow({name:C.name,pts:P,width:C.w,speed:ci?.55+C.w*.012:1.1,rapids:[.03,.08]});   /* a delta has no white water */
 const D=WATER.drawFlow(S,{shallow:lin(0x6e6a44),deep:lin(0x3a4632),color:0xffffff,roughness:.2,metalness:.02,envMapIntensity:.22,step:6,across:ci?4:6,margin:1.5});
 D.mesh.userData.inspectLabel=C.name;C.flow=S;C.draw=D;return S;});
