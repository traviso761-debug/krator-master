// node core/materials/record/test-record.js: the material records and texture definitions (no browser).
// Each check has a negative that must fail.
const fs=require('fs'),path=require('path'),vm=require('vm');
vm.runInThisContext(fs.readFileSync(path.join(__dirname,'23-mat-record.js'),'utf8'));
vm.runInThisContext(fs.readFileSync(path.join(__dirname,'24-tex-def.js'),'utf8'));
let bad=0;const ok=(name,pass,neg)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const throws=f=>{try{f();return false;}catch(e){return true;}};

const r=KMAT.record({id:'t.plank',family:'plank',lib:'wood.weathered_brown_planks',scale:[2.4,2.4],specular:0.3});
ok('a record fills its defaults',r.roughness===1&&r.metal===0&&r.tint===true&&r.normalScale===1&&r.alphaTest===0,r.specular===0.5);
ok('every field of the vocabulary is present',KMAT.FIELDS.every(k=>k in r),Object.keys(r).length<KMAT.FIELDS.length);
ok('an unknown field is refused',throws(()=>KMAT.record({id:'x',family:'f',colour_:'#fff'})),throws(()=>KMAT.record({id:'x',family:'f'})));
ok('a record needs an id and a family',throws(()=>KMAT.record({family:'f'}))&&throws(()=>KMAT.record({id:'x'})),false);
ok('scale is two positive metres',throws(()=>KMAT.record({id:'x',family:'f',scale:[0,1]}))&&throws(()=>KMAT.record({id:'x',family:'f',scale:[1]})),throws(()=>KMAT.record({id:'x',family:'f',scale:[1,2]})));
ok('roughness, metal and specular stay in 0..1',throws(()=>KMAT.record({id:'x',family:'f',specular:1.5}))&&throws(()=>KMAT.record({id:'x',family:'f',metal:-1})),throws(()=>KMAT.record({id:'x',family:'f',roughness:0.2})));

KMAT.pack('t',{plank:{lib:'wood.x',scale:[2,2],map:'data:x'}});
ok('a pack answers per family, and null for a family it lacks',KMAT.packed('t','plank').lib==='wood.x'&&KMAT.packed('t','rock')===null&&KMAT.packed('nope','plank')===null,KMAT.packed('t','rock')!==null);
KMAT.adapter('t',{plank:{id:'t.plank',family:'plank',lib:'wood.x',scale:[2,2]},leafy:{id:'t.leafy',family:'leafy',tex:'t.leafy',bake:true}});
const T=KMAT.table('t');
ok('the table names maps by library set or TEX.def, never as pixels',T.records.length===2&&T.records[0].maps.from==='library'&&T.records[1].maps.from==='procedural'&&!JSON.stringify(T).includes('data:'),T.records[0].maps===null);
ok('the table states its conventions',T.format==='krator-materials'&&/sRGB/.test(T.convention.colour)&&/OpenGL/.test(T.convention.normal),false);
ok('the table is plain JSON',JSON.parse(JSON.stringify(T)).records[0].scale[0]===2,false);

// TEX: a kind, a def, and pixels that match a canvas fill's arithmetic (clamp, x255, Uint8Clamped rounding)
TEX.kind('t.ramp',d=>(x,y)=>x/(d.size-1)*1.2-0.1);
TEX.kind('t.rgb',d=>(x,y)=>[1,0.5,0,0.25]);
TEX.kind('t.pic',null,{canvas:true});
const d=TEX.def({id:'t.ramp',kind:'t.ramp',size:8});
const px=TEX.pixels(d);
const want=new Uint8ClampedArray(4);want[0]=Math.min(1,Math.max(0,3/7*1.2-0.1))*255;
ok('pixels clamp and round like a canvas fill',px[0]===0&&px[7*4]===255&&px[3*4]===want[0]&&px[3]===255,px[3*4]!==want[0]);
const c=TEX.pixels(TEX.def({id:'t.rgb',kind:'t.rgb',size:2}));
ok('colour pixels carry alpha',c[0]===255&&c[1]===128&&c[2]===0&&c[3]===64,c[3]===255);
const pic=TEX.def({id:'t.pic',kind:'t.pic',size:4});
ok('a canvas kind is baked and has no pixel function',pic.bake===true&&throws(()=>TEX.fn(pic)),pic.bake===false);
ok('ids and kinds are unique, kinds must exist',throws(()=>TEX.def({id:'t.ramp',kind:'t.ramp'}))&&throws(()=>TEX.kind('t.ramp',()=>0))&&throws(()=>TEX.def({id:'q',kind:'none'})),false);
ok('defs() lists every record for the export',TEX.defs().length===3&&TEX.defs().every(x=>x.id&&x.kind&&x.size),false);
const src=['23-mat-record.js','24-tex-def.js'].map(f=>fs.readFileSync(path.join(__dirname,f),'utf8').split('\n').filter(l=>!/^\s*(\/\/|\/\*|\*)/.test(l)).join('\n')).join('\n');
ok('the data fragments touch no browser or three.js API',!/document\.|getContext|THREE\.|addEventListener|requestAnimationFrame/.test(src.replace(/if\(typeof window[^\n]*/g,'')),false);
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
