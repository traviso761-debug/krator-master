// node core/terrain/test-stacks-contour.js — KSTACKS.contour (37b-core-stacks-contour.js), each check with a broken input that must fail.
const fs=require('fs'),path=require('path');
global.window=global;
eval(fs.readFileSync(path.join(__dirname,'..','rand','08-core-rand.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'37-core-stacks.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'37b-core-stacks-contour.js'),'utf8'));
let bad=0;const ok=(name,pass,neg)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const K=KSTACKS;

const mk=seed=>K.make({kind:'pillar',id:'p',x:100,z:-40,H:200,w:40,sq:6,taper:.03,lean:0,y0:-200,seed});
const B=mk(2820),m0=K.mesh(B,{step:2.5}),h0=K.hash(m0),rec0=JSON.stringify(B);
const m1=K.contour(B,K.mesh(B,{step:2.5}));
// the radius of each vertex about the axis, before and after
const rad=(m,i)=>Math.hypot(m.pos[3*i]-B.x,m.pos[3*i+2]-B.z);
let moved=0,yMoved=0;for(let i=0;i<m0.pos.length/3;i++){if(Math.abs(rad(m1,i)-rad(m0,i))>.5)moved++;if(m1.pos[3*i+1]!==m0.pos[3*i+1])yMoved++;}
ok('contour: the faces move in and out ('+moved+' vertices over 50 cm)',moved>m0.pos.length/3*.4,false);
ok('contour: heights are kept (only x and z move)',yMoved===0,false);
ok('contour: the record is not changed, nor is a fresh mesh',JSON.stringify(B)===rec0&&K.hash(K.mesh(B,{step:2.5}))===h0,K.hash(m1)===h0);
ok('contour: deterministic, and another seed contours differently',K.hash(K.contour(B,K.mesh(B,{step:2.5})))===K.hash(m1),
  K.hash(K.contour(B,K.mesh(B,{step:2.5}),{seed:7}))===K.hash(m1));
// the joints: some vertex at mid-height drawn well inside its neighbours round the ring (a groove), none on a contour without them
const groove=m=>{let best=0;for(let i=0;i<m.pos.length/3;i++){const y=m.pos[3*i+1];if(Math.abs(y-(B.y0+100))>3||m.part[i]!==0)continue;best=Math.max(best,rad(m0,i)-rad(m,i));}return best;};
const plain=K.contour(B,K.mesh(B,{step:2.5}),{joints:[0,0],cleft:false,profile:0,flare:0,crown:0,wander:0});
ok('contour: the joints cut grooves metres deep ('+groove(m1).toFixed(1)+' m)',groove(m1)>2.5,groove(plain)>.01);
// keep: the top under a post stays the record's
const top=m=>{let d=0;for(let i=0;i<m.pos.length/3;i++)if(m.part[i]!==0&&m.pos[3*i+1]>B.top-1)d=Math.max(d,Math.hypot(m.pos[3*i]-m0.pos[3*i],m.pos[3*i+2]-m0.pos[3*i+2]));return d;};
const kept=K.contour(B,K.mesh(B,{step:2.5}),{keep:12});
ok('contour keep: the top stays where the record has it',top(kept)<1e-9,top(m1)<1e-9);
// the floor: no vertex nearer the axis than a quarter of its radius, even with absurd joints (the axis held still to measure)
const deep=K.contour(B,K.mesh(B,{step:2.5}),{jointD:[80,90],wander:0});let under=0;
for(let i=0;i<m0.pos.length/3;i++)if(rad(m0,i)>1&&rad(deep,i)<rad(m0,i)*.25-1e-3)under++;
ok('contour: the floor holds under absurd joints',under===0,false);
// archRound: the opening's upper corners come down into a curve; the lintel's top does not move; a pillar (no opening) is untouched
{const A=K.make({kind:'arch',id:'a',x:0,z:0,span:30,rise:26,H:44,t:9,ry:0,y0:0,seed:11}),Op=A.opening,ma=K.mesh(A,{step:2}),mr=K.archRound(A,K.mesh(A,{step:2}));
 const corner=m=>{let best=Infinity;for(let i=0;i<m.pos.length/3;i++){const a=m.pos[3*i]-Op.x,y=m.pos[3*i+1];if(Math.abs(Math.abs(a)-Op.w0/2*.85)<2.5&&y<Op.y1+1&&y>Op.y0+Op.y1*.5){best=Math.min(best,Op.y1-y);}}return best;};
 let topMoved=0;for(let i=0;i<ma.pos.length/3;i++)if(ma.pos[3*i+1]>A.top-.5&&Math.abs(mr.pos[3*i+1]-ma.pos[3*i+1])>1e-9)topMoved++;
 ok('archRound: the opening\'s corners come down into a curve ('+(isFinite(corner(mr))?corner(mr).toFixed(1):'-')+' m under the soffit at .85 of the half-width)',corner(mr)>2,corner(ma)>2);
 ok('archRound: the lintel\'s top does not move',topMoved===0,false);
 ok('archRound: a body without an opening is untouched',K.hash(K.archRound(B,K.mesh(B,{step:2.5})))===h0,false);}
let threw=false;try{eval('KSTACKS.contour');delete global.KSTACKS;eval(fs.readFileSync(path.join(__dirname,'37b-core-stacks-contour.js'),'utf8'));}catch(e){threw=true;}
ok('contour: refuses to load without 37-core-stacks.js',threw,false);
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
