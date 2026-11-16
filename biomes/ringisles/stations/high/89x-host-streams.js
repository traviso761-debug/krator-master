// ================================================================= HOST — the valleys' streams and falls (station 2, the high isle; core/water)
// Each windward valley (the stage's VALLEYS) carries a stream down its floor from the foot of its headwall to its mouth, where it meets the sea (its plume:
// the stage's STATION.seaOpts); the three middle valleys' streams fall off their headwalls first (core/water's tall falls: the curtain on the wall's face,
// the churn sized to its plunge, spray by the drop; BACKPORT.md section 5, "Tall falls": ringisles' high isle). The ground is cut for each stream's channel
// in the stage (carvedH: 1.4 m within ~12 m of the axis). ?falls=0 none of the falls.
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const STREAMS=VALLEYS.map(V=>{const ux=Math.cos(V.a),uz=Math.sin(V.a),L=Math.hypot(V.mouth[0]-V.head[0],V.mouth[1]-V.head[1]),raw=[];
 for(let s=V.W0*.12;s<=L+40;s+=20){const x=V.head[0]+ux*s,z=V.head[1]+uz*s;raw.push([x,z,terrainH(x,z)]);}
 /* the bed's height a mean of 7 samples, a hand above it, never under the sea at the mouth */
 const pts=raw.map((p,i)=>{let a=0,n=0;for(let j=Math.max(0,i-3);j<=Math.min(raw.length-1,i+3);j++){a+=raw[j][2];n++;}return[p[0],p[1],Math.max(.05,a/n+.25)];});
 return WATER.flow({name:V.name+'\'s stream',pts,width:mix(7,14,V.i%2?.3:.8),speed:1.1,rapids:[.03,.12]});});
if(WATER.breakupFlows)WATER.breakupFlows();   /* core/water ext/56 when on the page: the streams' glint broken up */
const STREAM_DRAWS=STREAMS.map((S,i)=>{const d=WATER.drawFlow(S,{shallow:lin(0x6a8a6e),deep:lin(0x2e4a40),color:0xffffff,roughness:.12,metalness:.05,envMapIntensity:.45,step:10,across:6,margin:1,depthBias:2,renderOrder:2,pick:true});
 d.mesh.userData.inspectLabel=VALLEYS[i].name+'\'s stream';return d;});
// THE FALLS: off the headwall's rim at the head of the three middle valleys, the lip where the plateau breaks (the shield, 1.2 widths behind the head),
// the foot on the floor at the head
const FALLS=new URLSearchParams(location.search).get('falls')==='0'?[]:VALLEYS.filter(V=>V.i>=1&&V.i<=3).map(V=>{const ux=Math.cos(V.a),uz=Math.sin(V.a),w=8+3*(V.i%2);
 const lx=V.head[0]-ux*V.W0*1.15,lz=V.head[1]-uz*V.W0*1.15,ly=terrainH(lx,lz)+.3,fx=V.head[0]+ux*8,fz=V.head[1]+uz*8,fy=terrainH(fx,fz);
 const F=WATER.fall({name:'The falls of '+V.name.replace(/^The /,'the '),lip:[[lx+uz*w,lz-ux*w,ly],[lx-uz*w,lz+ux*w,ly]],dir:[ux,uz],drop:ly-fy,foot:[fx,fz,fy],fit:true,spread:8,
  face:terrainH,faceLift:.8,faceN:72});
 const D=WATER.drawFall(F,{color:lin(0xdce8e6),opacity:.9,rowStep:3,cols:12,spray:'drop',plungeR:26,footK:.8,envMapIntensity:.25,renderOrder:3,pick:true});
 D.mesh.userData.inspectLabel=F.name;if(D.plunge)D.plunge.userData.inspectLabel=F.name+' (the plunge)';
 return{F,D};});
window._water={streams:STREAMS.length,falls:FALLS.map(f=>Math.round(f.F.drop))};
