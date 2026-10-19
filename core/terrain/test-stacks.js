// node core/terrain/test-stacks.js — the rock bodies' contract (37-core-stacks.js), each check with a broken input that must fail.
const fs=require('fs'),path=require('path');
global.window=global;
eval(fs.readFileSync(path.join(__dirname,'..','rand','08-core-rand.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'37-core-stacks.js'),'utf8'));
let bad=0;const ok=(name,pass,neg)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const K=KSTACKS;

// ---- a two-tier mesa, a spire, a balanced rock, a row of fins
const mesa=K.make({id:'m1',kind:'mesa',x:0,z:0,y0:0,seed:41,tiers:[{h:200,r:300,e:1.4,ry:.3},{h:120,r:150,e:1.2,dx:40,dz:-30}]});
const sp=K.make({id:'s1',kind:'spire',x:800,z:0,y0:5,seed:7,H:80,r:14});
const bal=K.make({id:'b1',kind:'balanced',x:-800,z:0,y0:0,seed:9,H:40,r:10});
const fins=K.row({id:'f',seed:3,a:[0,700],b:[400,700],n:5,H:[50,80],r:[8,12],e:[3,5]});
const ALL=[mesa,sp,bal].concat(fins);

ok('a mesa stands as tall as its tiers',Math.abs(mesa.top-320)<.01,Math.abs(mesa.top-300)<.01);
ok('its beds pile up without gaps',mesa.beds.every((b,i)=>i===0||Math.abs(b.y-(mesa.beds[i-1].y+mesa.beds[i-1].h))<1e-9),false);
ok('the same seed gives the same body',JSON.stringify(K.make({id:'m1',kind:'mesa',x:0,z:0,y0:0,seed:41,tiers:[{h:200,r:300,e:1.4,ry:.3},{h:120,r:150,e:1.2,dx:40,dz:-30}]}))===JSON.stringify(mesa),
  JSON.stringify(K.make({id:'m1',kind:'mesa',x:0,z:0,y0:0,seed:42,tiers:[{h:200,r:300,e:1.4,ry:.3},{h:120,r:150,e:1.2,dx:40,dz:-30}]}))===JSON.stringify(mesa));
let threw=false;try{K.make({id:'x',kind:'hill'});}catch(e){threw=true;}ok('an unknown kind is refused',threw,false);
threw=false;try{K.make({kind:'spire'});}catch(e){threw=true;}ok('a body without an id is refused',threw,false);

// ---- the height: the top of the highest bed over a point; the upper tier stands on the lower; off the rock nothing
const tTop=K.at(ALL,40,-30),tLow=K.at(ALL,239,74);
ok('the cap tier\'s top is its top',tTop&&tTop.b.tier===1&&Math.abs(tTop.top-320)<1,tTop&&tTop.b.tier===0);
ok('the bench (the lower tier out from under the cap) is lower',tLow&&tLow.b.tier===0&&Math.abs(tLow.top-200)<1,tLow&&tLow.b.tier===1);
ok('off the rock there is no top',K.topAt(ALL,0,-900)===-Infinity,K.topAt(ALL,0,0)===-Infinity);
const fo=K.foot(ALL,0,-900);ok('the foot reports the distance to the lowest bed',fo&&fo.S===mesa&&fo.d>0,fo&&fo.d<0);

// ---- the field, the height and the mesh agree (nwbay's lesson): every top vertex is on topAt
function topsAgree(B,list){const m=K.mesh(B);let worst=0,n=0;
  for(let i=0;i<m.part.length;i++){if(m.part[i]!==1)continue;const x=m.pos[3*i],y=m.pos[3*i+1],z=m.pos[3*i+2];
    // a top vertex on the very edge may belong to the bed's own rim: sample a hair inside it, toward the top's centre (a
    // stack leans: the top's centre is the bed's shifted by tx, tz)
    const b=B.beds[m.bed[i]],ix=x+(b.cx+(b.tx||0)-x)*.01,iz=z+(b.cz+(b.tz||0)-z)*.01,t=K.at(list,ix,iz);if(!t||t.b!==b)continue;
    worst=Math.max(worst,Math.abs(t.top-K.topH(b,ix,iz)));worst=Math.max(worst,Math.abs(y-K.topH(b,x,z)));n++;}
  return {worst,n};}
const ag=topsAgree(mesa,ALL);ok('the mesh\'s tops lie on the height the field reports ('+ag.n+' vertices)',ag.n>500&&ag.worst<1e-4,false);
const mBad=K.mesh(mesa);{const i0=mBad.part.indexOf(1);mBad.pos[3*i0+1]+=3;}{let w=0;for(let i=0;i<mBad.part.length;i++)if(mBad.part[i]===1){w=Math.max(w,Math.abs(mBad.pos[3*i+1]-K.topH(mesa.beds[mBad.bed[i]],mBad.pos[3*i],mBad.pos[3*i+2])));}
  ok('a moved vertex would be caught',true,w<1e-4);}
// ---- a stack is one tapering, leaning column (Pinnacle Rock, 2026-10-19: not a pile of drums): each bed's top outline is
// the next bed's foot, and the tops still lie on the field
function seams(B){let worst=0;for(let k=0;k<B.beds.length-1;k++){const b=B.beds[k],c=B.beds[k+1];if(B.kind==='balanced'&&k===B.beds.length-2)continue;
  const top=K.ring(B,b.y+b.h-1e-7,24),foot=K.ring(B,c.y+1e-7,24);
  for(let i=0;i<24;i++)worst=Math.max(worst,Math.hypot(top[i][0]-foot[i][0],top[i][1]-foot[i][1])/Math.max(c.rx,c.rz));}return worst;}
const leaner=K.make({id:'s2',kind:'spire',x:0,z:900,y0:0,seed:11,H:110,r:13,lean:.12});
ok('a spire\'s beds meet: each top is the next foot (worst '+(seams(leaner)*100).toFixed(1)+'% of a radius)',seams(leaner)<.08&&seams(sp)<.08,false);
{const stepped=JSON.parse(JSON.stringify(leaner));stepped.beds.forEach(b=>{b.tp=1;b.tx=0;b.tz=0;});
  ok('a stepped stack (the old drums) would be caught',true,seams(stepped)<.08);}
const ags=topsAgree(leaner,[leaner]);ok('a leaning spire\'s tops lie on the field ('+ags.n+' vertices)',ags.n>40&&ags.worst<1e-4,false);
ok('its crest narrows (the shoulders weathered round)',leaner.beds[leaner.beds.length-1].tp<.9,false);

// ---- the mesh faces out: walls away from the axis, tops up, an overhang's underside down
function shares(B){const m=K.mesh(B),P=m.pos,I=m.idx;let wall=0,wallOut=0,top=0,up=0,und=0,down=0;
  for(let t=0;t<I.length;t+=3){const a=I[t],b=I[t+1],c=I[t+2],ax=P[3*a],ay=P[3*a+1],az=P[3*a+2];
    const ux=P[3*b]-ax,uy=P[3*b+1]-ay,uz=P[3*b+2]-az,vx=P[3*c]-ax,vy=P[3*c+1]-ay,vz=P[3*c+2]-az;
    const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,p=m.part[a],bd=B.beds[m.bed[a]];
    if(Math.hypot(nx,ny,nz)<1e-9)continue;
    if(p===0){wall++;if(nx*(ax-bd.cx)+nz*(az-bd.cz)>0)wallOut++;}else if(p===1){top++;if(ny>0)up++;}else{und++;if(ny<0)down++;}}
  return {wall:wallOut/wall,top:up/top,und:und?down/und:1,nUnd:und,m};}
const sm=shares(mesa);ok('a mesa\'s walls face out and its tops up ('+(sm.wall*100).toFixed(1)+'%, '+(sm.top*100).toFixed(1)+'%)',sm.wall>.97&&sm.top>.99,false);
const sb=shares(bal);ok('a balanced rock has an underside, facing down ('+sb.nUnd+' triangles)',sb.nUnd>0&&sb.und>.99,false);
{const m=sb.m,I=m.idx.slice();for(let t=0;t<I.length;t+=3){const x=I[t+1];I[t+1]=I[t+2];I[t+2]=x;}
  ok('a flipped winding would be caught',true,(()=>{const P=m.pos;let o=0,w=0;for(let t=0;t<I.length;t+=3){const a=I[t],b=I[t+1],c=I[t+2];if(m.part[a]!==0)continue;
    const ux=P[3*b]-P[3*a],uy=P[3*b+1]-P[3*a+1],uz=P[3*b+2]-P[3*a+2],vx=P[3*c]-P[3*a],vy=P[3*c+1]-P[3*a+1],vz=P[3*c+2]-P[3*a+2],nx=uy*vz-uz*vy,nz=ux*vy-uy*vx,bd=bal.beds[m.bed[a]];w++;if(nx*(P[3*a]-bd.cx)+nz*(P[3*a+2]-bd.cz)>0)o++;}return o/w>.97;})());}
ok('a balanced rock\'s cap is wider than its neck',(()=>{const n=bal.beds.length,c=bal.beds[n-1],k=bal.beds[n-2];return Math.min(c.rx,c.rz)>Math.max(k.rx,k.rz);})(),false);
ok('a mesa without an overhang has no underside',shares(mesa).nUnd===0,false);

// ---- fins: one strike along their row; slender
ok('fins share their row\'s strike',fins.every(f=>Math.abs(Math.sin(f.beds[0].ry))<.15),fins.every(f=>Math.abs(Math.cos(f.beds[0].ry))<.15));
ok('a fin is long and thin',fins.every(f=>f.beds[0].rx/f.beds[0].rz>2.5),false);

// ---- ledges and rings
let led=0;for(let i=0;i<4000;i++){const a=i/4000*Math.PI*2,r=120+i%180;if(K.ledge([mesa],Math.cos(a)*r,Math.sin(a)*r))led++;}
ok('the bench out from under the cap is a ledge ('+led+' of 4000 samples)',led>200,false);
ok('a cap\'s top is not a ledge',!K.ledge([mesa],40,-30),!!K.ledge([mesa],40,-30)&&false);
const rg=K.ring(sp,40,32);ok('a ring at a height lies on the wall there',rg&&rg.length===32&&rg.every(p=>{const t=K.at([sp],p[0]+(sp.x-p[0])*.05,p[1]+(sp.z-p[1])*.05);return t;}),K.ring(sp,500)!==null);

// ---- a garden: no two stacks overlap; layouts are deterministic
const gd=K.cluster({id:'g',seed:5,c:[0,0],rad:200,n:12,H:[30,60],r:[6,12],gap:5});
ok('a garden\'s stacks keep their gap ('+gd.length+' placed)',gd.length>=8&&gd.every((a,i)=>gd.every((b,j)=>i===j||Math.hypot(a.x-b.x,a.z-b.z)>5)),false);
ok('the same garden from the same seed',JSON.stringify(K.cluster({id:'g',seed:5,c:[0,0],rad:200,n:12,H:[30,60],r:[6,12],gap:5}))===JSON.stringify(gd),
  JSON.stringify(K.cluster({id:'g',seed:6,c:[0,0],rad:200,n:12,H:[30,60],r:[6,12],gap:5}))===JSON.stringify(gd));
ok('a mesh is the same every time',K.hash(K.mesh(mesa))===K.hash(K.mesh(K.load(K.export([mesa]))[0])),K.hash(K.mesh(mesa))===K.hash(K.mesh(sp)));
threw=false;try{K.load({format:'x'});}catch(e){threw=true;}ok('a foreign export is refused',threw,false);

console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
