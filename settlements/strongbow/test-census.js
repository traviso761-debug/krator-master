// node settlements/strongbow/test-census.js [--write] — the trades census (src/20-sb-census.js, [G data]) against the plan
// (PLAN.md sections 6 and 8), each check with a negative; --write rewrites CENSUS.md from the records, and without it the test
// fails when CENSUS.md is stale.
const fs=require('fs'),path=require('path'),vm=require('vm');
const ctx={Math,console,JSON};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname,'src','20-sb-census.js'),'utf8')+'\n;this.C=SB_CENSUS;',ctx);
const C=ctx.C;let fails=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)fails++;};
const clone=o=>JSON.parse(JSON.stringify(o)),tally=x=>C.tally(Object.assign(clone(x),{tally:C.tally}));
const checks={
 people:x=>{const t=tally(x);return t.people.all===7000&&Math.abs(t.people.arcology+x.people.upperSpine+x.people.order-t.people.town)<=0;},
 budget:x=>{const t=tally(x);return x.sectors.every(s=>t.bySector[s.id].in===s.budget[0]&&t.bySector[s.id].out===s.budget[1]);},
 totals:x=>{const t=tally(x);return t.in===1530&&t.out===1605;},
 working:x=>{const t=tally(x);return t.workers<=t.ages.adults&&t.workers/t.ages.adults>.7&&t.workers/t.ages.adults<.9;},
 ids:x=>new Set(x.trades.map(r=>r.id)).size===x.trades.length&&x.trades.every(r=>x.sectors.some(s=>s.id===r.sector)),
 places:x=>x.trades.every(r=>r.per>=1&&r.in>=0&&r.out>=0&&(r.in+r.out)>0&&r.where),
 others:x=>x.others.every(o=>o.work.reduce((a,w)=>a+w.n,0)<=o.people)&&x.others.find(o=>o.id==='order').people===x.people.order&&x.others.find(o=>o.id==='outcasts').people===x.people.upperSpine};
const t=C.tally(C);
console.log(JSON.stringify({people:t.people,households:t.households,ages:t.ages,workers:t.workers,in:t.in,out:t.out,places:t.places}));
ok(checks.people(C),'about 7,000 in all, half in the arcology (with the outcasts and the Order) and half in the town');
ok(checks.budget(C),'every sector sums to the plan\'s budget, in the arcology and in the town');
ok(checks.totals(C),'1,530 working in the arcology, 1,605 in the town');
ok(checks.working(C),'the workers are '+(100*t.workers/t.ages.adults).toFixed(0)+'% of the Sultan\'s adults');
ok(checks.ids(C),'unique trade ids, each in a sector');
ok(checks.places(C),'every trade has workers, a workplace size and a place');
ok(checks.others(C),'the Order and the outcasts match the plan, and their work fits their numbers');
// the negatives: a copy broken one way fails that check
const neg=(name,f)=>{const x=clone(C);f(x);ok(!checks[name](x),'negative: '+name);};
neg('people',x=>{x.people.town+=500;});
neg('budget',x=>{x.trades[0].in+=10;});
neg('totals',x=>{x.trades.find(r=>r.id==='farmer').out+=40;});
neg('working',x=>{x.trades.find(r=>r.id==='farmer').out+=2500;});
neg('ids',x=>{x.trades[1].id=x.trades[0].id;});
neg('places',x=>{x.trades[2].per=0;});
neg('others',x=>{x.others[0].people=50;});
// CENSUS.md from the records
const f=n=>n.toLocaleString('en-US');
let md='# Strongbow today: the trades census\n\n*Written by `node settlements/strongbow/test-census.js --write` from `src/20-sb-census.js`. Do not edit; edit the records.*\n\n';
md+='About **'+f(t.people.all)+'** people (the owner, 2026-11-11), of whom **'+f(t.people.sultan)+'** are in the Sultan\'s census: **'+f(t.people.arcology)+'** in the arcology (the foot, the lower and middle Spine, the galleries on the face; about '+f(t.households.arcology)+' households) and **'+f(t.people.town)+'** in the town (about '+f(t.households.town)+' households). Outside it: **'+f(C.people.upperSpine)+'** outcasts in the upper Spine and **'+f(C.people.order)+'** monks of the Order in the tower.\n\n';
md+='Of the Sultan\'s people, about '+f(t.ages.children)+' are children and '+f(t.ages.elders)+' elders. Of the '+f(t.ages.adults)+' adults, **'+f(t.workers)+'** work at a trade: **'+f(t.in)+'** in the arcology, at about '+f(t.places.in)+' workplaces, and **'+f(t.out)+'** in the town, at about '+f(t.places.out)+'. The other '+f(t.idleAdults)+' keep house, are too ill to work, or are between work.\n\n';
md+='Every number is a proposal for the owner (PLAN.md sections 6 and 8 are the budget it sums to).\n\n## By sector\n\n| Sector | In the arcology | In the town | All |\n|---|---|---|---|\n';
for(const s of C.sectors){const b=t.bySector[s.id];md+='| '+s.name+' | '+f(b.in)+' | '+f(b.out)+' | '+f(b.in+b.out)+' |\n';}
md+='| **All** | **'+f(t.in)+'** | **'+f(t.out)+'** | **'+f(t.workers)+'** |\n\n## By trade\n\n';
md+='| Trade | In the arcology | In the town | Workplaces (in / out) | Where | Buildings |\n|---|---|---|---|---|---|\n';
for(const s of C.sectors){md+='| **'+s.name+'** | | | | | |\n';
 for(const r of C.trades.filter(q=>q.sector===s.id))md+='| '+r.name+' | '+(r.in?f(r.in):'-')+' | '+(r.out?f(r.out):'-')+' | '+(r.in?Math.ceil(r.in/r.per):'-')+' / '+(r.out?Math.ceil(r.out/r.per):'-')+' | '+r.where+' | '+(r.keys.length?r.keys.map(k=>'`'+k+'`').join(', '):'a room in the layout')+' |\n';}
md+='\n## Outside the Sultan\'s census\n\n';
for(const o of C.others){md+='**'+o.name+'** ('+f(o.people)+', '+o.where+'): '+o.work.map(w=>w.name+' '+f(w.n)).join('; ')+'.\n\n';}
const out=path.join(__dirname,'CENSUS.md');
if(process.argv.includes('--write'))fs.writeFileSync(out,md.replace(/\n+$/,'\n'),'utf8');
ok(fs.existsSync(out)&&fs.readFileSync(out,'utf8')===md.replace(/\n+$/,'\n'),'CENSUS.md is current (rerun with --write after changing the records)');
console.log(fails?fails+' FAILED':'all passed');process.exitCode=fails?1:0;
