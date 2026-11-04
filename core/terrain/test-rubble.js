// node core/terrain/test-rubble.js — the rubble module's contract, each check with a broken input that must fail. Needs no browser.
const fs=require('fs'),path=require('path');
global.window=global;eval(fs.readFileSync(path.join(__dirname,'..','rand','08-core-rand.js'),'utf8'));eval(fs.readFileSync(path.join(__dirname,'37c-core-rubble.js'),'utf8'));
let bad=0;const ok=(name,pass,neg)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const H=KRUBBLE.heap({id:'h',x:10,z:-5,y0:2,rx:30,rz:12,ry:.6,h:8,seed:41});
const H3=KRUBBLE.heap({id:'h',x:10,z:-5,y0:2,rx:30,rz:12,ry:.6,h:8,seed:42});
// the footprint: an ellipse along the strike, nothing off it
const along=KRUBBLE.toWorld(H,29,0),across=KRUBBLE.toWorld(H,0,13),inA=KRUBBLE.toWorld(H,0,11);
ok('the heap stands on its ellipse',KRUBBLE.heightAt(H,along[0],along[1])>=0&&KRUBBLE.heightAt(H,across[0],across[1])===0&&KRUBBLE.heightAt(H,inA[0],inA[1])>0,KRUBBLE.heightAt(H,across[0]+50,across[1])>0);
let mx=0;for(let u=-30;u<=30;u+=.5)for(let v=-12;v<=12;v+=.5){const w=KRUBBLE.toWorld(H,u,v);mx=Math.max(mx,KRUBBLE.heightAt(H,w[0],w[1]));}
ok('its crest is about h ('+mx.toFixed(2)+' of 8)',mx>8*.8&&mx<8*1.45,mx>8*3);
// the one surface: the mesh's heap vertices and the walk triangles' corners are on heightAt
const offOf=(S,M)=>{let off=0,n=0;for(let i=0;i<M.part.length;i++){if(M.part[i])continue;const x=M.pos[i*3],y=M.pos[i*3+1],z=M.pos[i*3+2];if(Math.abs(y-(S.y0+KRUBBLE.heightAt(S,x,z)))>.06)off++;n++;}return [off,n];};
const M=KRUBBLE.mesh(H,{cell:4}),O=offOf(H,M),O3=offOf(H,KRUBBLE.mesh(KRUBBLE.heap({id:'h',x:10,z:-5,y0:2,rx:30,rz:12,ry:.6,h:8,seed:42}),{cell:4}));
ok('the mesh lies on the surface ('+O[1]+' vertices; the last ring 5 cm under the ground)',O[0]===0,O3[0]===0);
const T=KRUBBLE.walkTris(H,4);let toff=0;T.forEach(t=>t.forEach(p=>{if(Math.abs(p[2]-(H.y0+KRUBBLE.heightAt(H,p[0],p[1])))>1e-9)toff++;}));
ok('the walk triangles\' corners are on the surface ('+T.length+')',toff===0&&T.length>50,T.length===0);
// up-facing: the heap's triangles face up
let down=0;for(let i=0;i<M.idx.length;i+=3){const a=M.idx[i],b=M.idx[i+1],c=M.idx[i+2];if(M.part[a])continue;const ux=M.pos[b*3]-M.pos[a*3],uz=M.pos[b*3+2]-M.pos[a*3+2],vx=M.pos[c*3]-M.pos[a*3],vz=M.pos[c*3+2]-M.pos[a*3+2];if(uz*vx-ux*vz<0)down++;}
ok('the heap\'s triangles face up',down===0,false);
// bedAt is the drawn mesh: its height at random points matches the mesh's triangles (barycentric), and a moved heap's does not
const drawn=(M,x,z)=>{let best=-1e9;for(let i=0;i<M.idx.length;i+=3){const a=M.idx[i],b=M.idx[i+1],c=M.idx[i+2];if(M.part[a])continue;const ax=M.pos[a*3],az=M.pos[a*3+2],bx=M.pos[b*3],bz=M.pos[b*3+2],cx=M.pos[c*3],cz=M.pos[c*3+2],d=(bz-cz)*(ax-cx)+(cx-bx)*(az-cz);if(Math.abs(d)<1e-9)continue;
 const l1=((bz-cz)*(x-cx)+(cx-bx)*(z-cz))/d,l2=((cz-az)*(x-cx)+(ax-cx)*(z-cz))/d,l3=1-l1-l2;if(l1<-1e-6||l2<-1e-6||l3<-1e-6)continue;best=Math.max(best,l1*M.pos[a*3+1]+l2*M.pos[b*3+1]+l3*M.pos[c*3+1]);}return best;};
let bedErr=0,bedErr3=0;for(let k=0;k<40;k++){const u=(KRAND.unit(KRAND.hash(3,k,1))-.5)*50,v=(KRAND.unit(KRAND.hash(3,k,2))-.5)*20,w=KRUBBLE.toWorld(H,u,v),dm=drawn(M,w[0],w[1]);if(dm<-1e8)continue;
 bedErr=Math.max(bedErr,Math.abs(H.y0+KRUBBLE.bedAt(H,w[0],w[1])-dm));bedErr3=Math.max(bedErr3,Math.abs(H.y0+KRUBBLE.bedAt(H3,w[0],w[1])-dm));}
ok('bedAt is the drawn mesh (off by '+bedErr.toFixed(3)+' m at most)',bedErr<.25,bedErr3<.25);
// the blocks rest on the drawn bed: none floats (its bottom under the bed at its centre: a piece rests on the lowest bed under its footprint), and few are
// buried past their middle (on a steep stretch a piece lies half in the slope)
const floats=S=>{const f=S.blocks.filter(b=>b.y-b.h/2>S.y0+KRUBBLE.bedAt(S,b.x,b.z)+.02).length,u=S.blocks.filter(b=>b.y+b.h/2<S.y0+KRUBBLE.bedAt(S,b.x,b.z)).length;return f+(u>S.blocks.length*.25?1:0);};
ok('the blocks rest on the drawn bed ('+H.blocks.length+')',H.blocks.length===12&&floats(H)===0,floats(Object.assign({},H,{blocks:H.blocks.map(b=>Object.assign({},b,{y:b.y+b.h}))}))===0);
// deterministic, and the seed moves it
const H2=KRUBBLE.heap({id:'h',x:10,z:-5,y0:2,rx:30,rz:12,ry:.6,h:8,seed:41});
ok('a heap is a pure function of its record',JSON.stringify(H)===JSON.stringify(H2),JSON.stringify(H)===JSON.stringify(H3));
ok('at() takes the highest of a list',KRUBBLE.at([H],10,-5)===H.y0+KRUBBLE.heightAt(H,10,-5)&&KRUBBLE.at([H],200,200)===-Infinity,KRUBBLE.at([],10,-5)>-Infinity);
const E=KRUBBLE.export([H]);ok('export and load round-trip',JSON.stringify(KRUBBLE.load(E))===JSON.stringify([H]),E.format!=='krator-rubble');
// the cover: chunks over the heap, each on its bed; none without the option
const HC=KRUBBLE.heap({id:'c',x:0,z:0,rx:20,rz:10,h:5,seed:7,cover:2.5}),ch=HC.blocks.filter(b=>b.chunk),chOff=floats({y0:HC.y0,blocks:ch,rx:HC.rx,rz:HC.rz,x:HC.x,z:HC.z,ry:HC.ry,h:HC.h,lumps:HC.lumps,seed:HC.seed,rough:HC.rough,cell:HC.cell});
ok('a covered heap is chunks ('+ch.length+'), each on its bed',ch.length>40&&chOff===0,H.blocks.some(b=>b.chunk));
let threw=false;try{KRUBBLE.heap({x:0})}catch(e){threw=true;}ok('a heap with no id is refused',threw,false);
console.log(bad?bad+' failed':'all passed');process.exit(bad?1:0);
