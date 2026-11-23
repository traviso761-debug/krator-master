/* node settlements/theodiga/test-th-descent.js: the ways down from the rim (src/41-th-descent.js) on a cliff of the page's kind
   (a wall at x about 346 that wanders 12 m along the canyon and 6 m with height, as the dam's east face does), each check with a
   negative (tools/ktest.js): every grade within its limit; every path from its start to its end; no two legs in each other's way;
   every run against the wall it hangs on; the roads between their turns and the stair over the crest; the same twice. */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const T=require('../../tools/ktest.js')(__filename);
vm.runInThisContext(fs.readFileSync(path.join(__dirname,'src','41-th-descent.js'),'utf8'),{filename:'41-th-descent.js'});
const FACE=(z,y)=>346+12*Math.sin(z/37)+6*Math.sin(y/23)+3*Math.sin(z/9+y/11);
const O={face:FACE,rim:()=>440,rimY:440,floor:(x,z)=>2+Math.sin(z/50),bed:(x,z)=>z>-200?280:262,WL:273,
 crest:{x:316,z0:4,z1:28,y:400},heads:{salvage:{x:430,z:326},silt:{x:470,z:-326}}};
const D=TH_DESCENT.make(O);
console.log(['stair','salvage','silt'].map(k=>k+': '+D[k].legs.length+' legs, '+D[k].length.toFixed(0)+' m at '+D[k].grade.toFixed(3)+', '+D[k].drop.toFixed(1)+' m down to '+D[k].yEnd.toFixed(1)).join('; '));
const LIM={stair:.5,salvage:.15,silt:.15};
const clone=()=>JSON.parse(JSON.stringify(D));
const fault=f=>{const X=clone();f(X);return X;};
const CHECKS={
 'every run keeps to its grade':X=>{let n=0;for(const k in LIM)for(const s of X[k].segs){const run=Math.abs(s.b[2]-s.a[2]);if(Math.abs(s.b[1]-s.a[1])>LIM[k]*run+1e-6)n++;}return [n===0,n+' too steep'];},
 'every path runs from its start to its end':X=>{const bad=[];
   const ends={stair:[O.rimY,O.crest.y],salvage:[440,null],silt:[440,null]};
   for(const k in ends){const S=X[k].segs,a=S[0].a[1],b=S[S.length-1].b[1];if(Math.abs(a-ends[k][0])>.01)bad.push(k+' starts at '+a);
    if(ends[k][1]!=null&&Math.abs(b-ends[k][1])>.01)bad.push(k+' ends at '+b);if(Math.abs(b-X[k].yEnd)>.01)bad.push(k+' stops short');
    for(let i=1;i<S.length;i++)if(Math.abs(S[i].a[1]-S[i-1].b[1])>.01||Math.abs(S[i].a[2]-S[i-1].b[2])>.01){bad.push(k+' broken at '+i);break;}}
   const ok2=X.salvage.yEnd<6&&X.silt.yEnd>=O.WL+1.2-1e-9;if(!ok2)bad.push('salvage ends at '+X.salvage.yEnd+', silt at '+X.silt.yEnd);
   return [!bad.length,bad.join('; ')||'all'];},
 'no two legs in each other\'s way (3.5 m of road and body between)':X=>{let n=0;
   for(const k in LIM){const S=X[k].segs,need=k==='stair'?2.2:3.5;
    for(let i=0;i<S.length;i++)for(let j=i+1;j<S.length;j++){const A=S[i],B=S[j];if(A.leg===B.leg)continue;
     const za=[Math.min(A.a[2],A.b[2]),Math.max(A.a[2],A.b[2])],zb=[Math.min(B.a[2],B.b[2]),Math.max(B.a[2],B.b[2])];if(za[1]<=zb[0]+1e-6||zb[1]<=za[0]+1e-6)continue;
     const xa=(A.a[0]+A.b[0])/2,xb=(B.a[0]+B.b[0])/2;if(Math.abs(xa-xb)>=(A.w+B.w)/2-1e-6)continue;
     const ya=(A.a[1]+A.b[1])/2,yb=(B.a[1]+B.b[1])/2;if(Math.abs(ya-yb)<need)n++;}}return [n===0,n+' runs in another\'s way'];},
 /* a road's lane stands its width off the wall it is set from; that wall is the rock where the run is, and near a turn (within
    the path's `held`) the turn's own, blended: never behind the rock (a lane is never deeper in it than its cut) */
 'every run hangs on its wall':X=>{let n=0;
   for(const k of ['salvage','silt']){const turns=X[k].landings.map(L=>L.z);
    for(const s of X[k].segs)[s.a,s.b].forEach((p,e)=>{const wall=s.wall[e],f=FACE(p[2],p[1]),want=s.lane===0?wall+1-s.w/2:wall+1-s.w-.6-s.w/2;
     const far=turns.every(z=>Math.abs(p[2]-z)>=X[k].held);if(Math.abs(p[0]-want)>1e-6||(far&&Math.abs(wall-f)>1e-6)||wall>f+1e-6)n++;});}
   for(const s of X.stair.segs)for(const p of [s.a,s.b]){const want=s.lane===0?O.crest.x-s.w/2:O.crest.x-s.w-.4-s.w/2;if(Math.abs(p[0]-want)>1e-6)n++;}
   return [n===0,n+' off their wall'];},
 'the roads keep between their turns, the stair over the crest':X=>{let n=0;
   const inR=(S,lo,hi)=>S.segs.slice(S.segs.findIndex(s=>s.leg>0)).forEach(s=>{for(const p of [s.a,s.b])if(p[2]<lo-1e-6||p[2]>hi+1e-6)n++;});
   inR(X.salvage,210,570);inR(X.silt,-580,-130);
   for(const s of X.stair.segs)for(const p of [s.a,s.b])if(p[2]<O.crest.z0||p[2]>O.crest.z1||p[1]<O.crest.y-1e-6)n++;
   return [n===0,n+' points out of bounds'];}};
const NEG={
 'every run keeps to its grade':X=>{X.salvage.segs[5].b[1]-=5;},
 'every path runs from its start to its end':X=>{X.silt.segs.pop();},
 'no two legs in each other\'s way (3.5 m of road and body between)':X=>{const S=X.salvage.segs,a=S.find(s=>s.leg===2),b=S.find(s=>s.leg===0&&s.lane===a.lane);
   b.a=[a.a[0],a.a[1]+1,a.a[2]];b.b=[a.b[0],a.b[1]+1,a.b[2]];},
 'every run hangs on its wall':X=>{const s=X.silt.segs.find(q=>q.a[2]<-300&&q.a[2]>-500);s.a[0]-=2;},
 'the roads keep between their turns, the stair over the crest':X=>{X.stair.segs[2].a[1]=O.crest.y-3;}};
for(const name of Object.keys(CHECKS)){const [pass,detail]=CHECKS[name](D);T.ok(name+' ('+detail+')',pass,detail);T.neg('negative: '+name,X=>CHECKS[name](X)[0],fault(NEG[name]),clone());}
const hash=X=>JSON.stringify(X).length+':'+JSON.stringify(X).split('').reduce((h,c)=>Math.imul(h^c.charCodeAt(0),16777619)>>>0,2166136261);
T.ok('the ways reruns the same',hash(TH_DESCENT.make(O))===hash(D));
{const B=D.stair.block;let deep=true;for(let z=B.z0;z<=B.z1;z+=2)for(let y=B.y0;y<=B.y1;y+=4)if(FACE(z,y)>B.x1-2)deep=false;
 T.ok('the stair-block runs into the cliff at every height (its east end behind the wall)',deep,'x1 '+B.x1.toFixed(1));}
T.ok('the stair\'s riser is a stair\'s (0.2 m on a 0.4 m tread at most)',D.stair.segs.every(s=>Math.abs(s.b[1]-s.a[1])<=.2+1e-9&&Math.abs(Math.abs(s.b[2]-s.a[2])-.4)<.05),D.stair.segs.length+' steps');
T.done();
