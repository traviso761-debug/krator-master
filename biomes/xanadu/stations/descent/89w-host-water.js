// ================================================================= HOST - STATION 4, THE DESCENT: the water on core/water (replaces src/89w-host-water.js)
// THE VALE'S LAKE at its outlet (+989): a WATER.open over the north-west corner, its shore grid kept to the lake's side of the beach (land past it), no surf and
// no breakers (BACKPORT.md: still water). ĀLPH (rivers.json r070, the model's name for the sacred river's course down to the sunless sea): one WATER.flow from
// the lake's outlet over the lip, through THE PLUNGE POOL (flat over the bowl carved at the cataract's toe, 45b), down the valley's rapids and THE LOWER FALLS,
// to its mouth on THE SUNLESS SEA. Its steep reaches are WATER.fall curtains (WATER.fallsOf with fit): THE CATARACT, 265 m, with the tall-falls options
// (plungeR the pool's own size, footK the white water arriving at the foot, lipK the glassy lip, margin the ribbon's width, spray 'drop': the mist column
// scaled to the drop), and the lower falls the same. THE SUNLESS SEA (0): a WATER.open over the south-east corner, still (no surf, no breakers), with the
// river's milky plume carried out on a current (core/water ext/61 tintFlow; ?plume=0 none). The reflections switch is on the sea (99, LAND.mirror).
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone(),r=giantRing.clone();env.add(g);env.add(r);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x4a5a46)});}
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const WBOX=[TERR.X0,TERR.Z0,TERR.X1,TERR.Z1];
const PALE_L=lin(WATER_PALE).getHex(),RIVER_COL0=new THREE.Color().setHSL(XANADU_LAKE.hue+.03,.45,.40);
// ---- the Vale's lake at its outlet
const LAKE_SEED=xzOf(-3600,0);
const LAKE_WATER=WATER.open({name:'The Vale\'s lake (its outlet)',level:LAKE_Y,swell:[[.04,40,225,0,.03],[.025,16,200,1.3,.02]],field:.08,bounds:WBOX,
 bed:terrainH,bedBox:WBOX,bedCell:12,shore:{seeds:[LAKE_SEED],land:(x,z)=>sOf(x,z)>lakeShore(tOf(x,z))+60}});
const LAKE_DRAW=WATER.draw(LAKE_WATER,{renderOrder:1,roughness:.16,metalness:.05,envMapIntensity:.22,ramp:[1.5,24],pick:true,surf:false,breakers:false,
 shallow:lin(WATER_SHALLOW.clone().lerp(WATER_MID,.5)),deep:lin(WATER_DEEP.clone().multiplyScalar(.9))});
LAKE_DRAW.mesh.userData.inspectLabel='The Vale\'s lake, at its outlet';
// ---- Ālph: the outlet, the cataract, the pool, the valley's rapids, the lower falls, the mouth
const RIVER_COL=new THREE.Color().setHSL(XANADU_LAKE.hue+.03,.45,.40),RIVER_DEEP=new THREE.Color().setHSL(XANADU_LAKE.hue+.05,.5,.24);
const RIVER=(function(){const P=RIV.P,pts=[],wd=[],sp=[];
 for(let i=0;i<P.length;i++){pts.push([P[i][0],P[i][1],RIV.lvl[i]]);wd.push(RIV.W[i]);}
 for(let i=0;i<pts.length;i++){const g=i+1<pts.length?Math.max(0,(pts[i][2]-pts[i+1][2])/12):0;sp.push(1.1+2.6*smooth(.02,.18,g));}
 return WATER.flow({name:'Ālph',pts,width:wd,speed:sp,rapids:[.04,.2]});})();
const RIVER_DRAW=WATER.drawFlow(RIVER,{shallow:lin(RIVER_COL.clone().lerp(RIVER_DEEP,.4)),deep:lin(RIVER_DEEP),color:0xffffff,roughness:.14,metalness:.05,envMapIntensity:.5,step:10,across:6,margin:1.2,depthBias:2,renderOrder:2,pick:true,chute:.3,spray:{every:60,min:.12}});
RIVER_DRAW.mesh.userData.inspectLabel='Ālph';
const RIVER_FALLS=WATER.fallsOf(RIVER,{steep:.3,minDrop:5,fit:true}).map(f=>WATER.fall(f));
const FALL_DRAWS=RIVER_FALLS.map(F=>{const tall=F.drop>100;
 const D=WATER.drawFall(F,{color:lin(0xe2ecea),opacity:.92,rows:tall?48:20,cols:tall?10:6,envMapIntensity:.25,renderOrder:3,margin:tall?6:2,lipK:.85,footK:tall?.95:.7,
  plungeR:tall?POOL_R*.9:undefined,spray:F.drop>12?'drop':false});
 const nm=tall?'The cataract':F.drop>30?'The lower falls':'Ālph\'s rapids';D.mesh.userData.inspectLabel=nm;if(D.plunge)D.plunge.userData.inspectLabel=nm;return D;});
// ---- the sunless sea, and the river's plume on it
const PLUME=XQ_ON('plume')?(function(){const P=RIV.P,n=P.length;let im=n-1;for(let i=0;i<n;i++){const s=sOf(P[i][0],P[i][1]);if(s>seaShore(tOf(P[i][0],P[i][1]))){im=i;break;}}
 const M=P[im],Q=P[Math.max(0,im-8)],dx=M[0]-Q[0],dz=M[1]-Q[1],l=Math.hypot(dx,dz)||1,ux=dx/l,uz=dz/l;
 const loc=(x,z)=>{const rx=x-M[0],rz=z-M[1];return[rx*ux+rz*uz,-rx*uz+rz*ux];};
 return{col:lin(RIVER_COL0.clone().lerp(WATER_PALE,.6)).getHex(),mouth:M,
  a:(x,z)=>{const q=loc(x,z),al=q[0],w=35+.4*Math.max(0,al);return .8*smooth(-60,30,al)*smooth(800,100,al)*Math.exp(-(q[1]*q[1])/(w*w));},
  v:(x,z)=>{const q=loc(x,z),al=q[0];if(al<-80||al>1200)return null;const s=.5*smooth(1200,80,al),w=35+.4*Math.max(0,al),sp=.35*Math.tanh(q[1]/w);return[(ux-uz*sp)*s,(uz+ux*sp)*s];}};})():null;
const SEA_COL={shallow:new THREE.Color().setHSL(.47,.42,.36),deep:new THREE.Color().setHSL(.5,.55,.12)};
const SEA_WATER=WATER.open({name:'The sunless sea',level:0,swell:[[.04,30,225,0,.03],[.02,12,200,1.3,.02]],field:.06,bounds:WBOX,
 bed:terrainH,bedBox:WBOX,bedCell:12,shore:{seeds:[xzOf(3600,0)],land:(x,z)=>sOf(x,z)<seaShore(tOf(x,z))-80},
 tint:{box:WBOX,cell:16,at:(x,z)=>{const h=terrainH(x,z);if(h>2)return null;const d=Math.max(0,-h),a0=smooth(1.2,.1,d)*.5,pa=PLUME?PLUME.a(x,z):0;if(pa>a0&&pa>.01)return{c:PLUME.col,a:pa};return a0<.01?null:{c:PALE_L,a:a0};}},
 ...(PLUME?{tintFlow:{v:PLUME.v,cell:24}}:{})});
const SEA_DRAW=WATER.draw(SEA_WATER,{renderOrder:1,roughness:.18,metalness:.05,envMapIntensity:.2,ramp:[1.5,20],pick:true,surf:false,breakers:false,shallow:lin(SEA_COL.shallow),deep:lin(SEA_COL.deep)});
SEA_DRAW.mesh.userData.inspectLabel='The sunless sea';
if(XQ_ON('breakup')){WATER.breakupAll();WATER.breakupFlows();}
window._water={lake:!!LAKE_DRAW,river:!!RIVER_DRAW,falls:RIVER_FALLS.map(F=>Math.round(F.drop)),sea:!!SEA_DRAW,plume:!!PLUME,pool:RIV.pool};
