/* node settlements/theodiga/test-th-works.js: the works below the rim (src/42-th-works.js) on grounds of the page's kind (a canyon
   floor at 1.5-4.5 m with a river wandering down its west half, silt upstream rising to the dam, a lake at 273, the dam's arched
   upstream face, the Dome's piers), each check with a negative (tools/ktest.js): the yards on the floor, off the river, nothing in
   another's way; the salvage heaps seated on the floor; the fields on dry silt upstream of the dam and clear of the Dome; the huts
   on dry silt; enough of each; the same twice. */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..','..');
const T=require('../../tools/ktest.js')(__filename);
global.window=global;
const load=f=>vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8'),{filename:f});
['core/rand/08-core-rand.js','core/terrain/37c-core-rubble.js','kits/crops/src/10-crop-core.js','kits/crops/src/20-crop-records.js','kits/crops/src/40-crop-query.js',
 'settlements/theodiga/src/42-th-works.js'].forEach(load);
const DIMS={};
for(const f of ['kits/xanadu/src/87u-xs-build.js','kits/xanadu/src/87v-xs-poor.js'])
 for(const m of fs.readFileSync(path.join(ROOT,f),'utf8').matchAll(/XA\.def\(\{\s*key:'(xa_scrap_[a-z_]+)'.*?,w:([\d.]+),d:([\d.]+),h:([\d.]+)/g))DIMS[m[1]]={w:+m[2],d:+m[3],h:+m[4]};
const zc=x=>-140*(1-Math.pow(x/320,2)),WL=273;
const G={floor:(x,z)=>1.5+1.5*(1+Math.sin(x/37+z/53)),floorZone:{x1:300,z0:80,z1:580},river:{x:z=>-221+(z-90)/500*90+22*Math.sin((z-90)/115),w:z=>15+6*Math.min(1,Math.max(0,(z-80)/200))},
 bed:(x,z)=>{const v=Math.min(1,Math.max(0,(z+700)/(700+zc(x)-2)));return WL-6+(16+10*Math.sin(x/70)*Math.cos(z/55))*v*v;},WL,face:x=>Math.abs(x)<=320?zc(x):0,
 dome:{x:0,z:-205,r:150},salvageFoot:{x:336,z:390},siltFoot:{x:342,z:-160},dims:k=>DIMS[k]||null};
const W=TH_WORKS.make(G);
console.log('yards '+W.lots.length+' buildings, '+W.heaps.length+' heaps, track '+W.track.a[0].toFixed(0)+' to '+W.track.b[0].toFixed(0)+'; fields '+W.fields.length+'; huts '+W.huts.length);
const box=L=>{const c=Math.cos(L.ry),s=Math.sin(L.ry);return [[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>[L.x+a*L.w/2*c+b*L.d/2*s,L.z-a*L.w/2*s+b*L.d/2*c]);};
const clone=()=>JSON.parse(JSON.stringify(W));
const fault=f=>{const X=clone();f(X);return X;};
const CHECKS={
 'the yards stand on the floor and off the river':X=>{let n=0;for(const L of X.lots)for(const p of box(L))if(Math.abs(p[0])>=300||p[1]<=80||p[1]>=580||Math.abs(p[0]-G.river.x(p[1]))<=G.river.w(p[1]))n++;return [n===0,n+' corners off'];},
 'nothing in the yards in another\'s way (the track, a building, a heap)':X=>{let n=0;const all=X.lots.map(L=>({x:L.x,z:L.z,r:Math.hypot(L.w,L.d)/2})).concat(X.heaps.map(H=>({x:H.x,z:H.z,r:Math.max(H.rx,H.rz)})));
   for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++)if(Math.hypot(all[i].x-all[j].x,all[i].z-all[j].z)<all[i].r+all[j].r)n++;
   const tz=X.track.a[1];for(const L of X.lots)for(const p of box(L))if(Math.abs(p[1]-tz)<X.track.w/2&&p[0]<X.track.a[0]&&p[0]>X.track.b[0])n++;return [n===0,n+' in the way'];},
 'every salvage heap is seated on the floor (its base at or under the floor round it)':X=>{let n=0;for(const H of X.heaps){const f=Math.min(G.floor(H.x+H.rx,H.z),G.floor(H.x-H.rx,H.z),G.floor(H.x,H.z+H.rz),G.floor(H.x,H.z-H.rz),G.floor(H.x,H.z));if(H.y0>f+.01||H.y0<f-1)n++;}return [n===0,n+' unseated'];},
 'the fields lie on dry silt upstream of the dam and clear of the Dome':X=>{let n=0;for(const F of X.fields)for(const p of F.corners)if(G.bed(p[0],p[1])<WL+.6||p[1]>zc(p[0])-12||Math.hypot(p[0],p[1]+205)<150)n++;return [n===0,n+' corners wet, downstream or under the Dome'];},
 'the huts stand on dry silt':X=>{let n=0;for(const L of X.huts)for(const p of box(L))if(G.bed(p[0],p[1])<WL+.6)n++;return [n===0,n+' corners wet'];},
 'enough of each: 6 yard buildings, 6 heaps, 8 fields, a hut':X=>[X.lots.length>=6&&X.heaps.length>=6&&X.fields.length>=8&&X.huts.length>=1,X.lots.length+', '+X.heaps.length+', '+X.fields.length+', '+X.huts.length]};
const NEG={
 'the yards stand on the floor and off the river':X=>{X.lots[0].x=G.river.x(X.lots[0].z);},
 'nothing in the yards in another\'s way (the track, a building, a heap)':X=>{X.heaps[0].x=X.lots[0].x;X.heaps[0].z=X.lots[0].z;},
 'every salvage heap is seated on the floor (its base at or under the floor round it)':X=>{X.heaps[1].y0+=2;},
 'the fields lie on dry silt upstream of the dam and clear of the Dome':X=>{X.fields[0].corners[2]=[0,-205];},
 'the huts stand on dry silt':X=>{X.huts[0].x=0;X.huts[0].z=-650;},
 'enough of each: 6 yard buildings, 6 heaps, 8 fields, a hut':X=>{X.fields=X.fields.slice(0,3);}};
for(const name of Object.keys(CHECKS)){const [pass,detail]=CHECKS[name](W);T.ok(name+' ('+detail+')',pass,detail);T.neg('negative: '+name,X=>CHECKS[name](X)[0],fault(NEG[name]),clone());}
T.ok('the works rerun the same',JSON.stringify(TH_WORKS.make(G))===JSON.stringify(W));
T.ok('every heap is a KRUBBLE heap with its pieces',W.heaps.every(H=>H.kind==='heap'&&H.blocks&&H.blocks.length>0),W.heaps.length);
T.done();
