// node core/minimap/test-minimap.js — the minimap's data side (no browser), each check with a broken input that must fail.
const fs=require('fs'),path=require('path');
global.window=global;
eval(fs.readFileSync(path.join(__dirname,'88-core-minimap.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'../walk/20-core-walk.js'),'utf8'));
let bad=0;const ok=(name,pass,neg)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const near=(a,b,e)=>Math.abs(a-b)<(e||1e-6);

const M=KMAP.create({frame:[0,1000,0,500],size:200,palette:{town:'#c0a080'}});
ok('the frame is squared about its centre',M.frame.join()==='0,1000,-250,750',M.frame[3]===500);
const p=M.toPx(500,250);ok('the centre maps to the middle of the canvas',near(p[0],100)&&near(p[1],100),near(p[1],50));
const w=M.toWorld(...M.toPx(123,-77));ok('toWorld undoes toPx',near(w[0],123)&&near(w[1],-77),false);
ok('north (-z) is up the map',M.toPx(0,-200)[1]<M.toPx(0,200)[1],M.toPx(0,-200)[1]>M.toPx(0,200)[1]);

// a long building turned 90 degrees: three.js's ry turns local +x to world -z
M.obb(300,300,40,5,Math.PI/2,{tag:'town',name:'Long hall'});
ok('a turned box covers its turned extent',M.pick(300,265)&&M.pick(300,265).name==='Long hall',M.pick(335,300)!==null);
M.disc(300,300,10,{tag:'well',name:'Well',y:2});
ok('the topmost record wins',M.pick(300,300).name==='Well',M.pick(300,300).name==='Long hall');
M.rect(600,700,100,200,{name:'Yard',y:-1});
M.strip([600,150],[800,150],10,{name:'Lane'});
ok('a strip is picked within its width',M.pick(750,154).name==='Lane',M.pick(750,157)!==null);
ok('records without a name or tag are not picked, the one under shows',M.pick(650,120).name==='Yard',false);
M.label(500,0,'Voth');ok('labels are never picked',M.pick(500,0)===null,false);

// floors from a walk registry, coloured by height
const W=KWALK.create();W.floor({rect:[0,100,0,100],y:0,name:'Hall'});W.floor({rect:[20,40,20,40],y:16,name:'Gallery'});
const M2=KMAP.create({frame:[0,100,0,100]});M2.fromWalk(W,y=>y>8?'#68a':'#887');
ok('walk floors come in, the upper one on top',M2.pick(30,30).name==='Gallery'&&M2.pick(80,80).name==='Hall',M2.pick(30,30).name==='Hall');

// relief: a hill west, water east
const R=M2.relief((x,z)=>50-x,{cell:10,water:0});
const px=(i,j)=>Array.from(R.rgb.slice((j*R.n+i)*3,(j*R.n+i)*3+3));
ok('water is blue below the water line',(()=>{const c=px(R.n-1,0);return c[2]>c[0];})(),(()=>{const c=px(0,0);return c[2]>c[0]+20;})());
ok('higher land is lighter',px(0,3)[0]>px(3,3)[0],px(0,3)[0]<px(3,3)[0]);

// painting records calls, with a recording context (no browser)
const calls=[];const g=new Proxy({},{get:(t,k)=>k in t?t[k]:(...a)=>{calls.push(k);return k==='measureText'?{width:10}:undefined;},set:(t,k,v)=>{t[k]=v;return true;}});
M.paint(g);M.overlay(g,{x:300,z:300,dir:[1,0]},'Long hall');
ok('paint draws every record and the overlay its dot and wedge',calls.filter(c=>c==='fill').length>=4&&calls.includes('fillText'),calls.length===0);

// export
const E=M.export();
ok('the export is plain data for Godot',E.format==='krator-minimap'&&E.records.length===5&&E.records[0].name==='Yard'&&JSON.parse(JSON.stringify(E)).records[1].ry===Math.PI/2,E.records[0].seq!==undefined);
ok('the relief exports as an RGB grid',(()=>{const e2=M2.export();return e2.relief&&e2.relief.rgb.length===e2.relief.n*e2.relief.n*3;})(),false);
let threw=false;try{KMAP.create({frame:[0,0,0,10]});}catch(e){threw=true;}ok('a frame of no width is refused',threw,false);
ok('the data fragment has no mount: the panel is the host fragment\'s',M.mount===undefined,false);
const src=fs.readFileSync(path.join(__dirname,'88-core-minimap.js'),'utf8').split('\n').filter(l=>!/^\s*\/\//.test(l)).join('\n');
ok('the data fragment touches no browser API',!/document\.|addEventListener|getContext|requestAnimationFrame|setInterval/.test(src),false);
const r0=M2.rev();M2.disc(1,1,1,{});ok('rev moves when a record is added',M2.rev()===r0+1,M2.rev()===r0);
ok('reliefPixels makes an n x n image from the context it is given',(()=>{const im=M2.reliefPixels({createImageData:(w,h)=>({width:w,height:h,data:new Uint8ClampedArray(w*h*4)})});
  return im.width===R.n&&im.data[3]===255&&im.data[0]===R.rgb[0];})(),M.reliefPixels({createImageData:()=>({})})!==null);
eval(fs.readFileSync(path.join(__dirname,'88a-core-minimap-host.js'),'utf8'));
const M3=KMAP.create({frame:[0,10,0,10]});
threw=false;try{M3.mount({});}catch(e){threw=true;}ok('with the host fragment, mount exists and refuses to run outside a browser',typeof M3.mount==='function'&&threw,false);
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
