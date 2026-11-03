// ================================================================= HOST - the water of the high ranges on core/water (station 3)
// THE STREAM (WATER.flow along RAN.P, a hand over its bed): out of the cirque tarn, north over the alpine, OVER THE AMPHITHEATRE'S SOUTH LIP in one tall
// fall (~320 m: drawFall's plungeR and footK, BACKPORT.md "Tall falls"; spray by drop) into the pool on its floor, and out down the chasm's slot to the
// map's edge: the Sacred River's first kilometres. THE CONDUIT SPRING (map 5.1's tube_xanadu_nw_09, Alph's headwater conduit from the subglacial
// reservoir): a jet from a dark mouth high in the amphitheatre's east wall, falling into the same pool. THE TARN (WATER.still, the proglacial look:
// turquoise meltwater) and THE POOL (a still, dark and churned): stills take no surf and no breakers. Rain rings on all; glints broken up (ext/56).
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone(),r=giantRing.clone();env.add(g);env.add(r);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x6a6a66)});}
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const discPoly=(X,Z,R)=>Array.from({length:40},(_,k)=>{const a=k/40*TAU;return[X+Math.cos(a)*R,Z+Math.sin(a)*R];});
const STREAM=(function(){const P=RAN.P,n=P.length,pts=[],wd=[];let lv=1e9;
 for(let i=0;i<n;i++){const s=RAN.S[i];if(RAN.tarnD(P[i][0],P[i][1])<1.05)continue;let y=RAN.bed[i]+.5;if(RAN.amphD(P[i][0],P[i][1])<.75)y=RAN.AMPH.pool;lv=Math.min(lv,y);pts.push([P[i][0],P[i][1],lv]);wd.push(2*(RAN.halfW(s)+.6));}
 return WATER.flow({name:'The Sacred River\'s head',pts,width:wd,speed:pts.map((p,i)=>1.4+2.6*smooth(.03,.2,i+1<pts.length?(p[2]-pts[i+1][2])/20:0)),rapids:[.05,.2]});})();
const STREAM_DRAW=WATER.drawFlow(STREAM,WATER.lookDraw('proglacial','flow',{step:10,across:6,margin:1.2,depthBias:2,renderOrder:2,roughness:.12,envMapIntensity:.4,color:0xffffff,pick:true}));
STREAM_DRAW.mesh.userData.inspectLabel='The Sacred River\'s head';STREAM_DRAW.mesh.userData.probeSkip=true;
/* the falls the line holds: the amphitheatre's lip (tall) and any steps over the alpine */
const STREAM_FALLS=WATER.fallsOf(STREAM,{steep:.9,minDrop:6,fit:true}).map(f=>WATER.fall(f));   /* a true fall only: the alpine reach (30-50%) is cascades, the ribbon's rapids */
const FALL_DRAWS=STREAM_FALLS.map(F=>{const tall=F.drop>60,D=WATER.drawFall(F,{color:lin(0xe2ece8),opacity:.92,rows:tall?48:20,cols:6,spray:'drop',lipK:1,envMapIntensity:.25,renderOrder:3,
  ...(tall?{plungeR:26,footK:1.4}:{})});
 D.mesh.userData.inspectLabel=tall?'The chasm head falls':'A step in the stream';if(D.plunge)D.plunge.userData.inspectLabel=D.mesh.userData.inspectLabel;return D;});
/* the conduit spring: a mouth 95 m up the east wall, facing west into the bowl */
const CONDUIT=(function(){const A=RAN.AMPH,mx=A.x+A.r*.86,mz=A.z+40,y=A.floor+95,h=4;
 const F=WATER.fall({name:'The conduit spring (Alph\'s headwater)',lip:[[mx,mz-h,y],[mx,mz+h,y]],dir:[-1,0],speed:6,drop:y-A.pool});
 const D=WATER.drawFall(F,{color:lin(0xd8e6e2),opacity:.9,rows:28,cols:4,spray:'drop',lipK:1,plungeR:14,footK:1.2,envMapIntensity:.25,renderOrder:3});
 D.mesh.userData.inspectLabel='The conduit spring (Alph\'s headwater, map 5.1 tube_xanadu_nw_09)';return{F,D,mouth:[mx,y,mz]};})();
const POOL=WATER.still({name:'The amphitheatre pool',level:RAN.AMPH.pool,poly:discPoly(RAN.AMPH.x,RAN.AMPH.z,RAN.AMPH.r*.82)});
const POOL_DRAW=WATER.drawStill(POOL,{color:lin(0x24484c).getHex(),roughness:.08,metalness:.05,envMapIntensity:.4,renderOrder:1});
POOL_DRAW.mesh.userData.probeSkip=true;POOL_DRAW.mesh.userData.inspectLabel='The amphitheatre pool';
const TARN_STILL=WATER.still({name:RAN.TARN.name,level:RAN.TARNL,poly:discPoly(RAN.TARN.x,RAN.TARN.z,RAN.TARN.r*1.3)});
const TARN_DRAW=WATER.drawStill(TARN_STILL,WATER.lookDraw('proglacial','still',{roughness:.06,metalness:.05,envMapIntensity:.45,renderOrder:1}));
TARN_DRAW.mesh.userData.probeSkip=true;TARN_DRAW.mesh.userData.inspectLabel=RAN.TARN.name;
if(XQ_ON('breakup')){WATER.breakupAll();WATER.breakupFlows();}
window._water={stream:!!STREAM_DRAW,falls:STREAM_FALLS.length,tallFall:STREAM_FALLS.filter(F=>F.drop>60).map(F=>Math.round(F.drop)),conduit:Math.round(CONDUIT.F.drop),tarn:RAN.TARNL,pool:RAN.AMPH.pool};
