// node settlements/strongbow/test-sb-walk.js — the walk up Strongbow (src/32-sb-walk.js) on core/walk: a walker with core/host's
// rules (a 0.7 m step, a 1.4 m drop, a body 0.35 m by 1.7 m pushed out of every wall) goes from the town at the foot through the
// lobby's and the core's doors, rides L1, crosses T1 through two doors, rides L2 to T3, crosses the girder bridge, rides the wall
// lifts W1 to W5, and goes through the Sultanate's post to the caravan yard on the lip. Then the negatives, each of which must
// stop it where it breaks: a door left shut, a lift that does not move, a gangway or the plaza's steps taken away.
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..','..');
global.window=global;
const load=f=>vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8'),{filename:f});
['core/rand/08-core-rand.js','core/walk/20-core-walk.js','kits/ancients/targets/strongbow/8aw0-strongbow-plan.js','settlements/strongbow/src/20-sb-census.js',
 'settlements/strongbow/src/30-sb-layout.js','settlements/strongbow/src/31-sb-rules.js','settlements/strongbow/src/32-sb-walk.js'].forEach(load);
const L=sbLayout(),P=STRONGBOW.plan({seed:1647}),S=SB_WALK.plan(L,P),ground=(x,z)=>P.frame.ground(x,z);
const walk=o=>SB_WALK.run(KWALK.create(),S,Object.assign({ground},o||{}));
let fails=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)fails++;};
const R=walk();
if(require.main!==module){module.exports={S,R,walk};return;}
const verbose=process.argv.includes('-v');
if(verbose||!R.ok)for(const l of R.legs)console.log((l.ok?'  .  ':'  X  ')+l.kind.padEnd(5)+(l.name||'')+(l.msg?'  :: '+l.msg:''));
const top=R.end,yard=L.parts.find(p=>p.id==='sb.lip.yard').shape;
ok(R.ok,'the walk from the town to the caravan yard on the lip: '+R.legs.length+' legs of '+S.route.length+(R.fail?' (stopped: '+R.fail.name+(R.fail.msg?', '+R.fail.msg:'')+')':''));
ok(top&&top[2]>=P.frame.lipY-.01&&top[0]>yard[1]&&top[0]<yard[2]&&top[1]>yard[3]&&top[1]<yard[4],'it ends in the yard, on the lip ('+(top?top.map(x=>x.toFixed(1)).join(', '):'-')+')');
const doors=S.doors.map(d=>d.id),need=S.route.filter(r=>r.door).map(r=>r.door);
ok(need.every(d=>R.opened.indexOf(d)>=0),'it went through '+need.length+' doors, each shut until it came to it ('+R.opened.length+' opened)');
ok(['L1','L2a+L2b','W1','W2','W3','W4','W5'].every(id=>R.rode.indexOf(id)>=0),'it rode the lifts L1, L2, W1 to W5 ('+R.rode.join(' ')+')');
/* every step it took on its feet was within the walker's rules (a ride is the car's) */
{let bad=0;for(let i=1;i<R.path.length;i++){const a=R.path[i-1],b=R.path[i],dy=b[2]-a[2],dh=Math.hypot(b[0]-a[0],b[1]-a[1]);if(dh>.01&&(dy>SB_WALK.STEP+.01||-dy>SB_WALK.DROP+.01))bad++;}
 ok(!bad,'no step climbs more than '+SB_WALK.STEP+' m or drops more than '+SB_WALK.DROP+' m ('+R.path.length+' steps, '+(R.path.length?(Math.max(...R.path.map(p=>p[2]))).toFixed(0):0)+' m reached)');}
// ---- the negatives ---------------------------------------------------------------------------------------------------------------
const neg=(name,o)=>{const N=walk(o);ok(!N.ok,'negative: '+name+(N.fail?' (stops: '+N.fail.name+')':''));};
neg('the lobby\'s door left shut',{shut:['sb.door.lobby']});
neg('the neck\'s door at T1 left shut',{shut:['sb.door.neck']});
neg('the post\'s door to the yard left shut',{shut:['sb.door.post.n']});
neg('the yard gate left shut',{shut:['sb.door.yard']});
neg('a gate of W3 left shut',{shut:[S.lifts.find(l=>l.id==='W3').stops[0].gate.id]});
neg('W2 does not move',{stuck:['W2']});
neg('L2\'s gangway to T3 taken away',{skip:S.gangways.filter(g=>/L2a/.test(g.id)&&/T3/.test(g.id)).map(g=>g.id)});
neg('W3\'s apron from the Nock taken away',{skip:S.gangways.filter(g=>/W3/.test(g.id)&&/nock/.test(g.id)).map(g=>g.id)});
neg('the plaza\'s steps taken away',{skip:['sb.walk.plaza.step.0','sb.walk.plaza.step.1']});
console.log(fails?fails+' FAILED':'all passed');process.exit(fails?1:0);
