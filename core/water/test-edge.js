// node core/water/test-edge.js — the water as fields and the land side of its edge (core/water/ext/60, 2026-11-02): WATER.fields reads the water the eye
// sees, not the record's shape; WATER.edgeAudit holds plants off it and the wet band to it. The worked example: one shoreline (a lake) and one junction (a
// stream into a river), with water, wet ground and plant edges matching, and a wet band drawn from the mask as the negative.
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..','..');
const files=['core/atmos/89-atmos-0-core.js','core/atmos/89-atmos-0p-presets.js','core/atmos/89-atmos-a-waves.js','core/water/20-core-water.js','core/water/21-core-water-shore.js',
 'core/water/22-core-water-flow.js','core/water/ext/57-core-water-audit.js','core/water/ext/60-core-water-fields.js'];
global.window=global;
eval(files.map(f=>fs.readFileSync(path.join(ROOT,f),'utf8')).join('\n')+';global.ATMOS=ATMOS;global.WATER=WATER;');
const W=WATER;
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const has=(f,r)=>f.some(q=>q.rule===r),count=(f,r)=>f.filter(q=>q.rule===r).length;
// the shoreline: a bowl, its level 0 reached at r 90, under a still whose shape runs out to 120 (a mask wider than the water)
const circle=(x,z,r)=>Array.from({length:32},(_,k)=>[x+Math.cos(k/32*6.2832)*r,z+Math.sin(k/32*6.2832)*r]);
// the junction: a river along x = 300 and a stream joining from the east along z = 0; the ground rises 1 m in 10 off both
const yR=()=>4,yS=x=>4+(x-300)*.002,dR=x=>Math.abs(x-300),dS=(x,z)=>x>=300?Math.abs(z):1e9;
const bowl=(x,z)=>(Math.hypot(x,z)-90)*.1;
const banks=(x,z)=>{const d=Math.min(dR(x)-8,dS(x,z)-3);return 3.4+Math.max(0,d)*.1+Math.min(0,d)*.4+.6*(d>0?1:0);};
const ground=(x,z)=>x<200?bowl(x,z):banks(x,z);
const lake=W.still({name:'lake',level:0,poly:circle(0,0,120)});
const river=W.flow({name:'river',pts:Array.from({length:11},(_,k)=>[300,-200+40*k,yR()]),width:16,speed:1});
const stream=W.flow({name:'stream',pts:[[400,0,yS(400)],[360,0,yS(360)],[330,0,yS(330)],[300,0,yS(300)]],width:6,speed:1});
const box=[-160,-160,460,160],F=W.fields({box,cell:2,ground});
const at=(x,z)=>W.fieldAt(F,x,z);
// the fields: the edge is the ground's, not the still's shape
ok('the lake\'s shore is where the ground comes up, r 90 (the shape runs to 120): '+at(90,0).shore.toFixed(2),Math.abs(at(90,0).shore)<2.5,Math.abs(at(120,0).shore)<2.5);
ok('shore is negative in the water and positive on land, in metres',at(60,0).shore<-25&&at(60,0).shore>-35&&at(130,0).shore>35&&at(130,0).shore<45);
ok('depth is the level over the ground (3 m at r 60), none on land: '+at(60,0).depth.toFixed(2),Math.abs(at(60,0).depth-3)<.25&&at(130,0).depth===0);
ok('flow proximity: 0 in the river, its distance beside it, and the lake is no flow',at(300,50).flow===0&&Math.abs(at(320,50).flow-11)<3&&at(0,0).flow>200);
const none=W.fields({box:[-100,-100,100,100],cell:4,ground:bowl,surfaces:[lake]});
ok('a box with no flow says so (F.none)',W.fieldAt(none,0,0).flow>=none.none-1e-6);
ok('...off the box a query takes the nearest edge node',Number.isFinite(at(9999,9999).shore));
const fn=W.fieldFns(F);ok('fieldFns are the same numbers',fn.shore(60,0)===at(60,0).shore&&fn.flow(320,50)===at(320,50).flow);
// the land side: a wet band read from the fields, along the shoreline and round the junction
const wetF=(x,z)=>{const s=fn.shore(x,z);return s<8?1:s<12?(12-s)/4:0;};
const plants=[{name:'alder',x:96,z:0,r:2},{name:'willow',x:318,z:30,r:1},{name:'reed',x:70,z:0,r:.5,aquatic:true},{name:'fig',x:340,z:12,r:2}];
const A=W.edgeAudit({field:F,plants,wet:wetF,wide:16,clear:.5});
ok('the worked example is clean: wet ground and plants match the water, shore and junction ('+A.length+' findings)',A.length===0);
// wet ground from the mask: the band follows the shape at 120, so the land between the real edge and it...
const wetMask=(x,z)=>x<200?(Math.hypot(x,z)>120?1:0):wetF(x,z);
const B=W.edgeAudit({field:F,wet:wetMask,wide:16});
ok('a wet band from the mask stops short of the real water ('+count(B,'wet-short')+' wet-short) and runs on past it ('+count(B,'wet-wide')+' wet-wide)',has(B,'wet-short')&&has(B,'wet-wide'));
const C=W.edgeAudit({field:F,wet:wetMask,wide:16,allow:(x,z)=>x<200});
ok('...allow hands that ground to another source',C.length===0);
const D=W.edgeAudit({field:F,plants:[{name:'oak',x:80,z:0,r:1},{name:'oak',x:300,z:10,r:1},{name:'oak',x:345,z:1,r:.5},{name:'sedge',x:91,z:0,r:3}]});
ok('plants in the water and at its edge are caught, on the shore and at the junction ('+D.length+' of 4)',D.length===4&&D.every(f=>f.rule==='plant-in-water'&&f.by>0));
{const s=W.auditSummary(D);ok('...and auditSummary reads the findings',s.length===2&&s.reduce((n,q)=>n+q.n,0)===4);}
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
