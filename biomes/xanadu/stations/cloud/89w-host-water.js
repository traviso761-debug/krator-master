// ================================================================= HOST - the cloud slopes' water on core/water (the station's; src/89w-host-water.js is the Vale's)
// One stream: the fog's drip and the windward rain gathered in the main ravine (45b, gully G0) below the crest, a WATER.flow a hand over its bed down to the
// map's south-east edge, white on its steeper reaches, its drops over the ravine's steps WATER.fall with spray by drop. No still: no lake, no breakers, no
// reflections switch. The sky in the water is a capture of this page's dome and giant, given to the water only.
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone(),r=giantRing.clone();env.add(g);env.add(r);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x4a5a42)});}
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const STREAM_COL=new THREE.Color().setHSL(XANADU_LAKE.hue+.02,.4,.36),STREAM_DEEP=new THREE.Color().setHSL(XANADU_LAKE.hue+.05,.45,.2);
const STREAM=(function(){const R=CL.stream,P=R.P,n=P.length,pts=[],wd=[];
 for(let i=0;i<n;i++){pts.push([P[i][0],P[i][1],R.bed[i]+.45]);wd.push(2*(R.halfW(R.S[i])+.6));}
 return WATER.flow({name:'The cloud stream',pts,width:wd,speed:pts.map((p,i)=>1.1+2.6*smooth(.02,.14,i+1<n?Math.max(0,(p[2]-pts[i+1][2])/Math.max(1,R.S[i+1]-R.S[i])):0)),rapids:[.05,.2]});})();
const STREAM_DRAW=WATER.drawFlow(STREAM,{shallow:lin(STREAM_COL.clone().lerp(STREAM_DEEP,.3)),deep:lin(STREAM_DEEP),color:0xffffff,roughness:.14,metalness:.05,envMapIntensity:.45,step:8,across:4,margin:1.2,depthBias:2,renderOrder:2,pick:true});
STREAM_DRAW.mesh.userData.inspectLabel='The cloud stream';
const STREAM_FALLS=WATER.fallsOf(STREAM,{steep:.3,minDrop:4,fit:true}).map(f=>WATER.fall(f));
const STREAM_FALL_DRAWS=STREAM_FALLS.map(F=>{const D=WATER.drawFall(F,{color:lin(0xdce8e6),opacity:.9,rows:20,cols:6,spray:'drop',envMapIntensity:.25,renderOrder:3});
 D.mesh.userData.inspectLabel='The ravine falls';D.plunge.userData.inspectLabel='The ravine falls';return D;});
if(XQ_ON('breakup'))WATER.breakupFlows();
window._water={stream:!!STREAM_DRAW,falls:STREAM_FALLS.length};
