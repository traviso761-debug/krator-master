// node kits/eternian/tests/test-trades.js — the Eternian trades table ([G data]) in node, beyond tools/check_trades.py:
// the census as tools/trades_census.json has it, every gap naming the et_ def and the phase that fills it (PLAN.md), and
// every key a def this kit declares.
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..','..','..');
const ctx={globalThis:{}};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT,'kits/eternian/src/68-et-trades.js'),'utf8')+'\n;this.T=ET_TRADES;',ctx);
let fails=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)fails++;};
const T=ctx.T,census=JSON.parse(fs.readFileSync(path.join(ROOT,'tools/trades_census.json'),'utf8')).map(c=>c.trade);
ok(T.length===census.length&&census.every(c=>T.some(t=>t.trade===c)),'every census trade, once ('+T.length+' of '+census.length+')');
ok(new Set(T.map(t=>t.trade)).size===T.length,'no trade twice');
const src=fs.readdirSync(path.join(ROOT,'kits/eternian/src')).filter(f=>f.endsWith('.js')&&f!=='68-et-trades.js')
 .map(f=>fs.readFileSync(path.join(ROOT,'kits/eternian/src',f),'utf8')).join('\n');
ok(T.every(t=>(t.keys||[]).every(k=>src.includes("key:'"+k+"'"))),'every key is a def this kit declares');
const gaps=T.filter(t=>t.gap&&!(t.keys||[]).length),phased=gaps.filter(t=>/to build in P[3-6]: et_[a-z_]+/.test(t.gap)||/the Sanctum/.test(t.gap));
ok(phased.length===gaps.length,'every gap names its def and phase ('+gaps.length+' gaps)');
ok(T.filter(t=>t.na).every(t=>t.na.length>10),'every na says why ('+T.filter(t=>t.na).length+')');
const byP={};for(const t of gaps){const m=/to build in (P\d)/.exec(t.gap);const k=m?m[1]:'host';byP[k]=(byP[k]||0)+1;}
console.log('     gaps by phase: '+Object.keys(byP).sort().map(k=>k+' '+byP[k]).join(', '));
console.log(fails?fails+' FAILED':'all passed');process.exit(fails?1:0);
