// ================================================================= OPEN WORLD — the small streams' water on core/water (relief P3)
// [draw] A relief region's wet streams (region.json `streams`, 44-world-streams.js; 41 carves them and holds their water in
// WORLD.water) drawn as core/water's flow: each stream cut into pieces of about a kilometre (WORLD.streamPieces), and a
// piece's ribbon (WATER.flow + WATER.drawFlow, as 83-world-water.js draws the named rivers) built when the camera comes
// within NEAR of it and dropped when it is past FAR. Oidong's 1,116 wet streams run thousands of kilometres: drawn at
// load, as the named rivers are, they would be thousands of meshes. A ribbon's water is WORLD.streamWaterLine's: the
// carved ground at the stream's centre (its roughness under 90 m left out) plus 60 % of its depth, held from climbing
// downstream, 85 % of the bed's width, a point every 8 m.
// core/water keeps every flow it makes in WATER.surfaces (and has no way to take one out); a streamed piece is drawn,
// not a surface the world asks about (WORLD.water already answers for it), so it is taken back out at once, or the list
// would grow as the camera walks. START.pump drives STREAMW.update(ms); settle waits for STREAMW.pending().
// Needs 83-world-water.js before it (core/atmos bound).
var STREAMW;LATE.push(()=>{STREAMW=(function(){'use strict';
const scene=HOST.scene,camera=HOST.camera,NEAR=1800,FAR=2400,GC=2048,STEP=8;
/* white water from a 6 % fall, full at 30 %: core/water's band for a river (1.5 to 12 %) whitened nearly every stream, which
   run down slopes of a few percent */
const RAPIDS=[.06,.3];
const P=WORLD.streamPieces?WORLD.streamPieces():[],drawn=new Map(),stats={pieces:P.length,drawn:0,built:0,dropped:0,ms:0};
// the pieces in a grid of GC cells, each in every cell its circle touches
const G=new Map(),key=(i,j)=>(i+4096)*8192+(j+4096);
P.forEach((p,n)=>{for(let j=Math.floor((p.z-p.r)/GC);j<=Math.floor((p.z+p.r)/GC);j++)for(let i=Math.floor((p.x-p.r)/GC);i<=Math.floor((p.x+p.r)/GC);i++){
 const k=key(i,j);let a=G.get(k);if(!a){a=[];G.set(k,a);}a.push(n);}});
const dist=(p,x,z)=>Math.max(0,Math.hypot(p.x-x,p.z-z)-p.r);
// the pieces within NEAR of the camera not yet drawn, nearest first; the drawn ones past FAR dropped
let want=[];
function scan(){const x=camera.position.x,z=camera.position.z,seen=new Set();want=[];
 for(let j=Math.floor((z-NEAR)/GC);j<=Math.floor((z+NEAR)/GC);j++)for(let i=Math.floor((x-NEAR)/GC);i<=Math.floor((x+NEAR)/GC);i++){
  const a=G.get(key(i,j));if(!a)continue;for(const n of a){if(seen.has(n))continue;seen.add(n);if(!drawn.has(n)&&dist(P[n],x,z)<NEAR)want.push(n);}}
 want.sort((a,b)=>dist(P[a],x,z)-dist(P[b],x,z)||a-b);
 for(const n of [...drawn.keys()])if(dist(P[n],x,z)>FAR)drop(n);}
function build(n){const L=WORLD.streamWaterLine(P[n],STEP);if(L.pts.length<2){drawn.set(n,null);return;}
 const F=WATER.flow({name:'stream '+P[n].line+'.'+n,pts:L.pts,width:L.w,speed:L.v});
 if(WATER.surfaces[WATER.surfaces.length-1]===F)WATER.surfaces.pop();   /* drawn, not asked about: see the header */
 const D=WATER.drawFlow(F,{shallow:0x557f74,deep:0x1f3a3e,roughness:.16,metalness:.06,envMapIntensity:.45,step:STEP,across:4,margin:1,origin:true,renderOrder:2,rapids:RAPIDS});
 D.line=L;drawn.set(n,D);stats.built++;}
function drop(n){const D=drawn.get(n);drawn.delete(n);if(!D)return;scene.remove(D.mesh);D.mesh.geometry.dispose();D.material.dispose();stats.dropped++;}
// build for up to ms milliseconds (at least one piece a call while any is wanted)
function update(ms){if(!P.length)return;const t0=performance.now();scan();
 let k=0;while(want.length&&(k===0||performance.now()-t0<ms)){build(want.shift());k++;}
 stats.ms=Math.round(performance.now()-t0);stats.drawn=[...drawn.values()].filter(Boolean).length;}
// the check (91's probe): every piece within NEAR drawn, and every drawn ribbon's water in its bed: at the stream's centre
// no more than 0.8 m under the ground (the ground's 13 m grain stands through it as stones) and under 3 m above it. With none near the camera, the nearest piece's water is read instead (not drawn).
// sunk: read the water 2 m lower (the negative)
function check(sunk){if(!P.length)return{ok:true,detail:'no wet streams in this region'};scan();
 const x=camera.position.x,z=camera.position.z,lines=[...drawn.values()].filter(Boolean).map(D=>D.line);let alt='';
 if(!lines.length){let b=0;for(let n=1;n<P.length;n++)if(dist(P[n],x,z)<dist(P[b],x,z))b=n;lines.push(WORLD.streamWaterLine(P[b],STEP));
  alt=' (none near the camera: the nearest piece, '+Math.round(dist(P[b],x,z))+' m off, read instead)';}
 let n=0,bad=0,first=null;
 for(const L of lines)for(let i=0;i<L.pts.length;i+=6){const p=L.pts[i],g=WORLD.H(p[0],p[1]),y=p[2]-(sunk?2:0);n++;
  if(!(y>g-.8&&y<g+3)){bad++;first=first||[Math.round(p[0]),Math.round(p[1]),+(y-g).toFixed(2)];}}
 return{ok:want.length===0&&n>0&&bad===0,detail:P.length+' pieces of wet stream, '+stats.drawn+' drawn near the camera'+(want.length?', '+want.length+' WITHIN '+NEAR+' m NOT DRAWN':'')+alt+
  '; '+n+' points of their water, '+bad+' out of the bed'+(first?' (first at '+first[0]+','+first[1]+': '+first[2]+' m over the ground)':'')};}
return{update,pending:()=>{if(!P.length)return 0;scan();return want.length;},check,stats:()=>Object.assign({},stats)};
})();});
