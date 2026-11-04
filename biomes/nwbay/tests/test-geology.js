// node biomes/nwbay/tests/test-geology.js -> 'all passed'
// The bay's rock (src/44n-host-geology.js, NWBAY_GEO) against the geology data it was read from (kits/resources/data/geology.json, map 5.1):
// the anchor's province and bytes, and every resource node in the page's box, recomputed by the field (kits/resources 45r KRES / RES_GEO)
// at the anchor. A rebake that moves them fails here, so the page is re-read, not left behind. Each check with a negative.
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.resolve(__dirname,'..','..','..');
['core/rand/08-core-rand.js','core/tags/50-core-tags.js','core/tags/52-core-tags-vocab.js','kits/resources/src/42r-res-ore.js',
 'kits/resources/src/43r-res-fields.js','kits/resources/src/45r-res-field.js','biomes/nwbay/src/44n-host-geology.js']
 .forEach(f=>vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8'),{filename:f}));
const D=JSON.parse(fs.readFileSync(path.join(ROOT,'kits','resources','data','geology.json'),'utf8')),G=RES_GEO.load(D),GEO=NWBAY_GEO;
let fails=0;const ok=(c,m,neg)=>{const r=!!c&&!neg;if(!r){fails++;console.log('FAIL',m+(neg?' (its negative passed)':''));}};
const O={x:GEO.anchor[0]*D.grid.px_m,z:GEO.anchor[1]*D.grid.px_m},a=G.at(O.x,O.z);
ok(D.source==='Krator Scale Model 5.1'&&D.grid.fullW===1821,'the data is the 5.1 bake');
ok(a&&a.province===GEO.here.province&&a.p.limestone===GEO.here.limestone&&a.p.marble===GEO.here.marble&&(a.p.tuff|0)===GEO.here.tuff,
 'the anchor\'s rock as written ('+(a&&[a.province,a.p.limestone,a.p.marble,a.p.tuff|0].join(','))+')',a&&a.province==='volcanic');
const B={x0:-2100,z0:-2900,x1:2900,z1:2100},ns=G.nodesIn(B,{origin:O}).map(n=>n.id+':'+n.kind+':'+n.grade+'@'+n.x.toFixed(1)+','+n.z.toFixed(1)).sort();
const want=GEO.nodes.map(n=>n.id+':'+n.kind+':'+n.grade+'@'+n.x.toFixed(1)+','+n.z.toFixed(1)).sort();
ok(ns.join('|')===want.join('|'),'the nodes in the page\'s box are the field\'s ('+ns.length+'): '+ns.join(' '));
ok(GEO.nodes.some(n=>n.kind==='marble'),'the field puts marble in the page\'s box (the quarries the band draws)');
// negatives: another anchor gives other nodes; the tsingy's survey point (700, 800) has no marble and no node in the box
const O2={x:700*2000,z:800*2000},n2=G.nodesIn(B,{origin:O2});
ok(n2.length!==ns.length||n2.some((n,i)=>n.id!==GEO.nodes[i].id),'negative: another anchor, other nodes');
ok(G.at(O2.x,O2.z).p.marble===0&&n2.length===0,'negative: (700, 800) reads no marble and no node in the box ('+n2.length+')');
console.log(fails?fails+' failed':'all passed');process.exit(fails?1:0);
