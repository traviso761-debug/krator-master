// node kits/ancients/targets/arcpile/test-arcpile.js — the Pile's plan in node (no browser): it is [G data].
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..','..','..','..');
const ctx={Math,console};vm.createContext(ctx);
for(const f of ['core/rand/08-core-rand.js','kits/ancients/targets/arcpile/8at0-arcpile-plan.js'])
 vm.runInContext(fs.readFileSync(path.join(ROOT,f),'utf8')+'\n;this.ARCPILE=typeof ARCPILE!=="undefined"?ARCPILE:this.ARCPILE;',ctx,{filename:f});
const C=ctx.ARCPILE;let fails=0;
const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)fails++;};
const P=C.plan(),S=P.stats,ha=v=>(v/1e4).toFixed(1)+' ha';
console.log(JSON.stringify({blocks:S.blocks,floor:ha(S.floor),pop:S.pop,crownShare:S.crownShare.toFixed(3),crownPop:S.crownPop,
 garden:ha(S.garden),crownGarden:ha(S.crownGarden),height:S.height.toFixed(0),cores:S.cores}));
ok(JSON.stringify(P)===JSON.stringify(C.plan()),'the plan is deterministic');
ok(S.pop>135000&&S.pop<165000,'about 150 000 at its height ('+S.pop+')');
ok(S.crownShare>.17&&S.crownShare<.24,'the crown is about a fifth of the floor ('+(100*S.crownShare).toFixed(1)+'%)');
const ids=new Set(P.blocks.map(b=>b.id).concat(P.cores.map(c=>c.id),P.stairs.map(s=>s.id)));
ok(ids.size===P.blocks.length+P.cores.length+P.stairs.length,'unique ids');
let loose=[];for(const c of P.cores){const hit=P.blocks.filter(b=>C.discRect(c.x,c.z,c.r,C.rect(b))&&b.y0<c.y1-1&&b.y1>c.y0+1);
 const top=hit.some(b=>Math.abs(b.y1-c.y1)<.5)||(c.inCap&&P.cap.terraces.some(t=>Math.abs(t.y1-c.y1)<.5)),bot=c.y0===0||hit.some(b=>Math.abs(b.y0-c.y0)<.5),joins=hit.length+(c.y0===0?1:0);
 if(!top||!bot||joins<2)loose.push(c.id);}
ok(!loose.length,'every core stands on the ground or in a block, ends at a block roof, and joins two or more ('+P.cores.length+' cores'+(loose.length?'; loose: '+loose.join(' '):'')+')');
const all=C.reach(P,[]),lost=P.blocks.filter(b=>!all.has(b.id));
ok(lost.length===0,'intact, every block can walk to the ground ('+lost.length+' cannot: '+lost.slice(0,4).map(b=>b.id).join(' ')+')');
const cut=C.reach(P,C.CUT(P)),island=P.blocks.filter(b=>!cut.has(b.id));
const isl=(island.reduce((s,b)=>s+C.floor(b),0)+(cut.has(P.cap.id)?0:P.cap.floor))/S.floor;
ok(!cut.has(P.cap.id)&&all.has(P.cap.id),'the capstone is on the island, and reaches the ground as built');
ok(island.length&&island.every(b=>b.crown),'with the four great cores and two stairs cut, only crown blocks are cut off');
ok(Math.abs(isl-S.crownShare)<.01,'and the whole crown is ('+(100*isl).toFixed(1)+'% of the floor cut off)');
for(const n of [1,2,3]){const part=C.CUT(P).slice(0,n);const r=C.reach(P,part);ok(P.blocks.every(b=>r.has(b.id)),'cutting only '+n+' of the six leaves the crown reachable');}
const d=C.ruin(P);ok(d.cores.filter(c=>c.id.indexOf('great')>0).length===4&&d.stairs.length===2,'the ruin cuts the four great cores and both stairs');
const R=C.reach(P,d.cores.map(c=>c.id).concat(d.stairs.map(s=>s.id),d.gone));
ok(P.blocks.filter(b=>b.crown).every(b=>!R.has(b.id)),'in the ruin the crown is an island');
ok(P.blocks.filter(b=>!b.crown&&d.gone.indexOf(b.id)<0).filter(b=>!R.has(b.id)).length<P.blocks.length*.1,'and nearly all of the standing base still reaches the ground');
const CN=d.corner,inC=b=>{const r=C.rect(b);return (r[1]+r[3])>CN;};
ok(d.gone.length>0&&d.gone.every(id=>{const b=P.blocks.find(q=>q.id===id);return inC(b)||b.k>0;}),'the corner is down ('+d.gone.length+' blocks, '+d.cut.length+' torn at the line)');
ok(P.blocks.filter(b=>{const r=C.rect(b);return r[0]+r[2]>CN;}).every(b=>d.gone.indexOf(b.id)>=0),'nothing stands wholly inside the corner');
ok(P.cap.terraces[0].h*2<CN,'the capstone stands clear of the corner');
ok(d.crashed.length===2&&d.pierced.length>=2,'two blocks crashed through the floors below ('+d.pierced.length+' blocks holed)');
ok(d.bridges.length>=3,'rope bridges between the crown roofs ('+d.bridges.length+')');
const farms=C.dress(P,d);ok(farms.filter(g=>g.kind==='plot').length>200,'the crown is farmed ('+farms.filter(g=>g.kind==='plot').length+' plots)');
ok(!farms.some(g=>{if(g.kind!=='plot')return false;const b=P.blocks.find(q=>Math.abs(q.y1-g.at[1])<.5&&C.discRect(g.at[0],g.at[2],.1,C.rect(q)));return b&&!b.crown;}),'and only the crown: the base is left to the Rift\'s flora');
console.log('crown gardens per crown person at its height: '+(S.crownGarden/S.crownPop).toFixed(1)+' m2; gone '+d.gone.length+' blocks');
console.log(fails?fails+' FAILED':'all passed');process.exit(fails?1:0);
