// node kits/ancients/targets/coil/test-coil.js — the Coil's plan and the Sanctum's deltas, in node (no browser):
// they are [G data], so they must run here as they run in the page, and as a Godot port would read them.
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..','..','..','..');
const ctx={Math,console};vm.createContext(ctx);
for(const f of ['core/rand/08-core-rand.js','kits/ancients/targets/coil/8aq0-coil-plan.js','kits/ancients/targets/coil/8aq1-coil-sanctum.js'])
 vm.runInContext(fs.readFileSync(path.join(ROOT,f),'utf8')+'\n;this.COIL=typeof COIL!=="undefined"?COIL:this.COIL;',ctx,{filename:f});
const C=ctx.COIL;let fails=0;
const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)fails++;};
const P=C.plan(),TAU=2*Math.PI;
ok(JSON.stringify(P)===JSON.stringify(C.plan()),'the plan is deterministic');
ok(Math.abs(P.vol/45.8e6-1)<.03,'the volume is Plymouth\'s within 3% ('+(P.vol/1e6).toFixed(2)+' Mm3 against 45.80)');
const sp=P.bays.filter(B=>B.kind==='bay'),great=P.gates.filter(B=>B.great);
ok(sp.length===27&&great.length===3&&sp.length+great.length===30,'thirty arches: three great arches and nine on each of three staircases');
ok(great.map(B=>B.k).join()==='0,2,4','the great arches are a triangle (points 0, 2, 4); the others small entrances');
const onAxis=th=>{const k=((th-C.DIM.TIP0)/(TAU/6))%1;return Math.min(Math.abs(k),1-Math.abs(k))<.002;};
ok(sp.every(B=>onAxis(B.thc)),"every arch stands on one of the star's six axes");
let lv=true;for(let j=1;j<=9;j++){const L=sp.filter(B=>B.level===j);if(L.length!==3||new Set(L.map(B=>B.yb)).size!==1)lv=false;}
ok(lv,'each level is three arches at one height (a triangle)');
ok(P.ramps.length===27&&P.ramps.every(R=>R.th1<R.th0&&R.y1>R.y0),'27 flights, each counterclockwise (toward -th) and up');
const slope=R=>Math.atan2(R.y1-R.y0,(R.th0-R.th1)*C.rw((R.y0+R.y1)/2))*180/Math.PI,smax=Math.max(...P.ramps.map(slope));
ok(smax<33,'every flight under 33 degrees (steepest '+smax.toFixed(1)+')');
let clear=true,worst=1e9;const all=sp.concat(P.gates);
for(const B of all){const up=all.filter(o=>o!==B&&Math.abs(Math.cos(o.thc-B.thc)-1)<1e-6&&o.yb>B.yb).sort((a,b)=>a.yb-b.yb)[0];
 if(up){const gap=(up.yb-(up.balc?up.balc.slab:0))-(B.yT+B.frame);worst=Math.min(worst,gap);if(gap<2)clear=false;}}
ok(clear,'on each axis, every arch and its frame clears the one above it (closest '+worst.toFixed(1)+' m)');
const PI=C.dressIntact(C.plan()),PK=C.plan(),d=C.sanctum(PK);
let threw=null;try{C.apply(PK,d);}catch(e){threw=e.message;}ok(!threw,'every delta names a record'+(threw?' ('+threw+')':''));
for(const [n,Q] of [['intact',PI],['kept',PK]]){const ids=new Set();let dup=0,bad=0;
 for(const a of Q.add){if(ids.has(a.id))dup++;ids.add(a.id);if(a.at&&a.at.some(v=>!isFinite(v)))bad++;}
 ok(!dup&&!bad,n+': '+Q.add.length+' records, unique ids, finite positions');}
const heads=PK.add.filter(a=>a.kind==='head');
ok(heads.every(h=>h.eyes==='closed'),'the city is closed eyes ('+heads.length+' heads)');
ok(heads.every(h=>C.METAL[h.metal]!=null),'every head is in a metal of rank, stone or titanium');
ok(PK.bays.filter(B=>B.kind==='bay').every(B=>B.back&&(B.back!=='plate'||B.role==='lineage')),'every hall of the State is onyx; only lineage courts keep glass');
console.log(fails?fails+' FAILED':'all passed');process.exit(fails?1:0);
