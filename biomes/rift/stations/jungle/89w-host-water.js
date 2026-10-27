// ================================================================= HOST — the water of station 2, THE RIFT JUNGLE (core/water)
// The terminal sea (-2,600 m on the model, y 0 here) as WATER.open: the sea side of the wandering shore (45m lakeIn), its bed from
// terrainH, the algal colour RIFT_LAKE (45s), and the old page's pale shoals, scum and the river's fresh plume as a tint field.
// The Lizardmen river 3: three WATER.flow reaches (the plain, the bench between the cliffs, the lowland) .6 m over its bed and never
// rising, joined by two WATER.fall over the scarp's cliffs (45m SCARP: ~150 m and ~90 m), each landing in its plunge pool (45m
// POOLS); a distributary from the lower pool to the sea (the delta's second mouth). W1/W2: the curtains tucked into the rock
// (margin), solid at the lip (lipK), spray by the drop; rain rings on every water.
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone();env.add(g);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x3a4a30)});}
const lin=c=>(c.isColor?c.clone():new THREE.Color(c)).convertSRGBToLinear();
const R2=TERR.R*1.1;
// ---- the sea
const SEA_BOX=[-R2-600,-R2-600,R2,R2],SEA_MC=8;
const SEA_MASK=(function(){const nx=Math.round((SEA_BOX[2]-SEA_BOX[0])/SEA_MC),nz=Math.round((SEA_BOX[3]-SEA_BOX[1])/SEA_MC),d=new Uint8Array(nx*nz);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)d[j*nx+i]=lakeIn(SEA_BOX[0]+(i+.5)*SEA_MC,SEA_BOX[1]+(j+.5)*SEA_MC)<24?255:0;
 return{x0:SEA_BOX[0],z0:SEA_BOX[1],cell:SEA_MC,nx,nz,data:d};})();
const hexL=c=>{const q=v=>Math.round(Math.min(1,Math.max(0,v))*255);return(q(c.r)<<16)|(q(c.g)<<8)|q(c.b);};
const STREAM_PALE_C=new THREE.Color(0x9ab4a8),PALE_L=lin(WATER_PALE.clone().lerp(WATER_MID,.35)),FRESH_L=lin(RIVER_COL.clone().lerp(STREAM_PALE_C,.4)),TC=new THREE.Color();
const SEA_TINT={box:SEA_BOX,cell:12,at:(x,z)=>{const d=Math.max(0,-terrainH(x,z)),lk=lakeIn(x,z),fresh=Math.max(smooth(160,30,streamD(x,z)),.7*smooth(110,25,distD(x,z)))*(1-smooth(-80,-420,lk));
 const shoal=KRAND.fbm(x*.0031+2,0,z*.0031-4,2,505),scum=KRAND.fbm(x*.0071-3,0,z*.0071+6,2,506);
 const pale=Math.max(smooth(.47,.66,shoal)*smooth(2.2,.3,d),smooth(.5,.08,d)*.7,smooth(.58,.7,scum)*smooth(3,.5,d)*.8)*(1-fresh);
 const a=pale+fresh;if(a<.004)return null;TC.copy(PALE_L).lerp(FRESH_L,fresh/a);return{c:hexL(TC),a:Math.min(1,a)};}};
const SEA=WATER.open({name:'The terminal sea',level:0,swell:[[.05,22,35,0,.03],[.03,13,-50,1.3,.03],[.012,6,80,2.2,.02]],field:0,
 bounds:SEA_BOX,bed:terrainH,bedCell:SEA_MC,mask:SEA_MASK,tint:SEA_TINT});
const SEA_DRAW=WATER.draw(SEA,{surf:false,ramp:[.5,8.5],roughness:.2,metalness:.05,envMapIntensity:.85,renderOrder:1,rain:true,
 shallow:lin(WATER_SHALLOW.clone().lerp(WATER_MID,.4).lerp(WATER_PALE,.2)),deep:lin(WATER_DEEP)});
SEA_DRAW.mesh.userData.inspectLabel='The terminal sea';
// ---- the river: a point on its centreline at a distance d from the shore (walked so its own lakeIn is d)
function riverPt(d,T){T=T||RIVER.t;const t=T(d);let x=(t+d)*S2,z=(d-t)*S2;for(let k=0;k<6;k++){const e=d-lakeIn(x,z);x+=e*S2;z+=e*S2;}return[x,z];}
const inPage=p=>Math.abs(p[0])<R2-8&&Math.abs(p[1])<R2-8;
function reach(d0,d1,T,y0){const P=[];let y=y0==null?1e9:y0;for(let d=d0;d>=d1;d-=12){const p=riverPt(d,T);if(!inPage(p))continue;y=Math.max(0,Math.min(y,terrainH(p[0],p[1])+.6));P.push([p[0],p[1],y]);}   /* never rising, never under the sea's level */return P;}
const tHi=SCARP.hi[1]+scarpOff(RIVER.t(SCARP.hi[1]))+6,tLo=SCARP.lo[1]+scarpOff(RIVER.t(SCARP.lo[1]))+6;
const dP=k=>lakeIn(POOLS[k].x,POOLS[k].z);   /* the reaches start at their pools */
const R1=reach(7000,tHi),R2p=reach(dP(0),tLo,null,POOLS[0].y+.2),R3=reach(dP(1),-30,null,POOLS[1].y+.2);
const RD=reach(dP(1)-15,-30,DIST.t,POOLS[1].y+.2);
const FLOWS=[['The river (the plain)',R1,33,.7],['The river (the bench)',R2p,30,.9],['The river (the lowland)',R3,40,.5],['The delta channel',RD,16,.4]]
 .filter(f=>f[1].length>2).map(([n,P,w,s])=>WATER.flow({name:n,pts:P,width:w,speed:s}));
const FLOW_DRAW=FLOWS.map(S=>{const D=WATER.drawFlow(S,{shallow:lin(RIVER_COL.clone().lerp(STREAM_PALE_C,.5)),deep:lin(RIVER_COL.clone().lerp(STREAM_PALE_C,.3)),color:0xffffff,
  roughness:.2,metalness:.05,envMapIntensity:.3,step:10,across:4,margin:3,chute:.5,depthBias:2,rain:true,renderOrder:2});D.mesh.userData.inspectLabel=S.name;return D;});
// ---- the two falls: the lip across the river at each cliff's top, thrown toward the sea onto its pool
function fallAt(name,dLip,pool,w){const p=riverPt(dLip),q=riverPt(dLip-6),dir=[q[0]-p[0],q[1]-p[1]],L=Math.hypot(dir[0],dir[1])||1;dir[0]/=L;dir[1]/=L;
 const y=terrainH(p[0],p[1])+.4,side=[-dir[1],dir[0]],hw=w*.5;
 return WATER.fall({name,lip:[[p[0]-side[0]*hw,p[1]-side[1]*hw,y],[p[0]+side[0]*hw,p[1]+side[1]*hw,y]],dir,speed:5.5,drop:Math.max(4,y-pool.y)});}   /* 5.5 m/s: the curtain lands ~45 m out under the 158 m fall, clear of the face */
const FALLS=[fallAt('The upper fall',tHi-6,POOLS[0],26),fallAt('The lower fall',tLo-6,POOLS[1],24)];
const FALL_DRAW=FALLS.map(F=>{const D=WATER.drawFall(F,{color:lin(0xc8d8d0),opacity:.9,rows:36,cols:6,margin:1.2,lipK:.85,spray:'drop',rain:true,envMapIntensity:.25,renderOrder:3});
 D.mesh.userData.probeSkip=true;D.mesh.userData.inspectLabel=F.name;if(D.plunge){D.plunge.userData.probeSkip=true;D.plunge.userData.inspectLabel='A plunge pool';}return D;});
