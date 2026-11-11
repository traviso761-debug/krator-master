// node core/cavelight/test-cavelight.js — the light underground's data side (10-core-cavelight.js, KCAVELIGHT), each check with a
// negative (a second condition that must be false).
'use strict';
const fs=require('fs'),path=require('path');
global.window=global;
eval(fs.readFileSync(path.join(__dirname,'..','rand','08-core-rand.js'),'utf8'));
const src=fs.readFileSync(path.join(__dirname,'10-core-cavelight.js'),'utf8');
eval(src);
const L=KCAVELIGHT;
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const throws=f=>{try{f();return false;}catch(e){return true;}};
ok('no DOM and no THREE in the data side',!/document\.|THREE\.|window\.\w+\s*\(/.test(src.replace(/^\/\/.*$/mg,'')),/THREE\./.test(src.replace(/^\/\/.*$/mg,'')));

// ---- records
const g=L.make({id:'p.1',kind:'lamp-green',x:1,y:2,z:3});
ok('make fills from the kind (the green Line lamp: weak, short, marking)',g.colour==='#48e078'&&g.range===6&&g.intensity===.45&&g.on===true&&g.seed==='p.1',g.range!==6);
ok('a record overrides its kind; 0 is kept (x == null ? d : x)',L.make({id:'q',kind:'wax',x:0,y:0,z:0,flicker:0,intensity:0}).flicker===0&&L.make({id:'q',kind:'wax',x:0,y:0,z:0,intensity:0}).intensity===0,false);
ok('the white stop lamp is hooded: a spot down, its dir normalised',L.make({id:'w',kind:'lamp-white',x:0,y:3,z:0}).hood.dir[1]===-1&&Math.abs(Math.hypot(...L.make({id:'w2',kind:'lamp-white',x:0,y:0,z:0,hood:{dir:[3,0,4]}}).hood.dir)-1)<1e-12,!L.make({id:'w',kind:'lamp-white',x:0,y:3,z:0}).hood);
ok('the coloured code marks, the key lights: every coloured lamp weaker and shorter than wax',['lamp-red','lamp-green','lamp-amber','glowcap','fungus'].every(k=>L.KINDS[k].intensity<L.KINDS.wax.intensity&&L.KINDS[k].range<L.KINDS.wax.range),L.KINDS['lamp-green'].intensity>=L.KINDS.wax.intensity);
ok('make refuses an unknown kind, no id, a bad position, range 0, flicker 2, a strip with no to, a bad colour',
  throws(()=>L.make({id:'a',kind:'neon',x:0,y:0,z:0}))&&throws(()=>L.make({kind:'wax',x:0,y:0,z:0}))&&throws(()=>L.make({id:'a',kind:'wax',x:NaN,y:0,z:0}))&&
  throws(()=>L.make({id:'a',kind:'wax',x:0,y:0,z:0,range:0}))&&throws(()=>L.make({id:'a',kind:'wax',x:0,y:0,z:0,flicker:2}))&&throws(()=>L.make({id:'a',kind:'strip',x:0,y:0,z:0}))&&
  throws(()=>L.make({id:'a',kind:'wax',x:0,y:0,z:0,colour:'red'})),throws(()=>L.make({id:'a',kind:'wax',x:0,y:0,z:0})));
L.kind('lamp-blue',{colour:'#4060ff',range:6,intensity:.5,flicker:0});
ok('a kit adds a kind; a bad row is refused',L.make({id:'b',kind:'lamp-blue',x:0,y:0,z:0}).range===6&&throws(()=>L.kind('x',{colour:'#fff',range:1,intensity:1})),throws(()=>L.make({id:'b',kind:'lamp-blue',x:0,y:0,z:0})));

// ---- the store
L.clear();L.add({id:'a',kind:'wax',x:0,y:0,z:0});
ok('the store: add, get, an id twice throws, remove',L.get('a')&&throws(()=>L.add({id:'a',kind:'wax',x:1,y:0,z:0}))&&L.remove('a')&&!L.get('a')&&L.all().length===0,L.all().length!==0);

// ---- flicker
const f=L.make({id:'f',kind:'wax',x:0,y:0,z:0}),steady=L.make({id:'s',kind:'fungus',x:0,y:0,z:0});
let lo=9,hi=-9;for(let t=0;t<30;t+=.013){const v=L.flicker(f,t);lo=Math.min(lo,v);hi=Math.max(hi,v);}
ok('flicker stays within 1 +- flicker and moves ('+lo.toFixed(3)+'..'+hi.toFixed(3)+'); flicker 0 is steady',lo>=1-.07-1e-12&&hi<=1+.07+1e-12&&hi-lo>.08&&L.flicker(steady,3.3)===1,hi-lo<.01);
ok('flicker is the record\'s own (two lamps out of step), the same for the same seed',L.flicker(f,1)!==L.flicker(L.make({id:'f2',kind:'wax',x:0,y:0,z:0}),1)&&L.flicker(f,1)===L.flicker(L.make({id:'other',seed:'f',kind:'wax',x:0,y:0,z:0}),1),false);

// ---- near
const pts=[];for(let i=0;i<200;i++)pts.push(L.make({id:'n'+String(i).padStart(3,'0'),kind:'lamp-green',x:i*5,y:0,z:0,on:i!==3}));
const N=L.near(11,0,0,4,pts);
ok('near: the four nearest lit lamps, nearest first; the dead one (x 15) never',N.map(r=>r.id).join()==='n002,n001,n004,n000',N.some(r=>r.id==='n003'));
ok('near: a tie breaks by id; n larger than the list gives them all',L.near(2.5,0,0,1,pts)[0].id==='n000'&&L.near(0,0,0,500,pts).length===199,L.near(2.5,0,0,1,pts)[0].id==='n001');
const strip=L.make({id:'st',kind:'strip',x:0,y:4,z:-10,to:[0,4,10]});
ok('a strip is near along its whole segment',Math.abs(L.dist2(strip,1,4,7)-1)<1e-12&&Math.abs(L.dist2(strip,0,4,13)-9)<1e-12,L.dist2(strip,1,4,7)>2);

// ---- a lamp line by chainage
const way=[[0,0,0],[1000,0,0]],full=L.line({id:'bore.g',world:7,pts:way,every:50,kind:'lamp-green',side:-12,up:3.2,fail:.15});
ok('a kilometre of way: 20 lamps every 50 m from 25 m, 12 m to the left (north, -z), 3.2 m up',full.length===20&&full[0].x===25&&full[19].x===975&&full.every(r=>r.z===-12&&r.y===3.2)&&full[0].id==='bore.g.0',full.length!==20);
const dead=full.filter(r=>!r.on).length;
ok('about 15% dead by each lamp\'s own hash ('+dead+' of 20), the same every build',dead>=1&&dead<=8&&JSON.stringify(L.line({id:'bore.g',world:7,pts:way,every:50,kind:'lamp-green',side:-12,up:3.2,fail:.15}))===JSON.stringify(full),dead===0);
const win=L.line({id:'bore.g',world:7,pts:[[400,0,0],[600,0,0]],from:400,every:50,kind:'lamp-green',side:-12,up:3.2,fail:.15});
ok('a window cut from the same line (chainage 400..600) has the same lamps, same ids, same dead',JSON.stringify(win)===JSON.stringify(full.filter(r=>r.chain>=400&&r.chain<600)),win.length===0);
const bent=L.line({id:'b',world:1,pts:[[0,0,0],[30,0,0],[30,0,40]],every:10,start:5,kind:'lamp-amber',side:1});
ok('round a bend the chainage runs on (5, 15, 25 along x; 35.. down z, offset to the right: -x there)',bent.length===7&&bent[3].x===29&&bent[3].z===5&&bent[2].z===1,bent.length!==7);
ok('a line refuses bad input (one point, every 0, fail 2)',throws(()=>L.line({id:'x',pts:[[0,0,0]],kind:'wax'}))&&throws(()=>L.line({id:'x',pts:way,every:0,kind:'wax'}))&&throws(()=>L.line({id:'x',pts:way,fail:2,kind:'wax'})),false);

// ---- under, exposure
ok('under: below the ground by the margin, or in a void',L.under({y:-5,ground:0})&&!L.under({y:-1,ground:0})&&L.under({y:10,ground:0,inVoid:true}),L.under({y:-1,ground:0}));
const top=L.exposure({under:false}),mouth=L.exposure({under:true,d:0}),mid=L.exposure({under:true,d:150,ramp:300}),deep=L.exposure({under:true,d:1e5}),none=L.exposure({under:true});
ok('the ramp: the surface\'s at the mouth, the cave\'s deep in, smooth between',top.exposure===1&&mouth.exposure===1&&Math.abs(deep.exposure-1.55)<1e-12&&mid.exposure>1&&mid.exposure<1.55&&none.exposure===deep.exposure,deep.exposure===1);
ok('clamped: a cave asked for 4 gets max 1.8 (no grey daylight in the dark)',L.exposure({under:true,d:1e5,cave:4}).exposure===1.8,L.exposure({under:true,d:1e5,cave:4}).exposure>1.8);
ok('nothing pure black: deep in the ambient is the floor, no sky, no sun',Math.abs(deep.ambient-.14)<1e-12&&deep.sky===0&&deep.sun===0&&mouth.sky===1&&mouth.ambient===1,deep.ambient===0);
ok('by night the mouth is the night\'s exposure and the deep ambient still the floor',L.exposure({under:true,d:0,day:0}).exposure===1.35&&Math.abs(L.exposure({under:true,d:1e5,day:0}).ambient-.14)<1e-12,false);
let mono=true,prev=0;for(let dd=0;dd<=400;dd+=5){const e=L.exposure({under:true,d:dd,ramp:300}).exposure;if(e<prev-1e-12)mono=false;prev=e;}
ok('the ramp never dips going in',mono,false);

// ---- openings, daylight
L.clear();
const P=L.opening({id:'portal',kind:'portal',c:[0,0],r:16,top:14,floor:0,dir:[1,0]}),W=L.opening({id:'shaft',kind:'well',c:[500,0],r:3,top:200,floor:0});
ok('openings: a portal needs dir; ids unique; top over floor',throws(()=>L.opening({id:'x',kind:'portal',c:[0,0],r:1,top:1,floor:0}))&&throws(()=>L.opening({id:'portal',kind:'well',c:[0,0],r:1,top:1,floor:0}))&&throws(()=>L.opening({id:'y',kind:'well',c:[0,0],r:1,top:0,floor:5})),P.ramp!==300);
const nb=L.nearestOpening(120,1.7,0),no=L.nearestOpening(-40,1.7,0),nw=L.nearestOpening(495,1.7,0);
ok('the eye 120 m into the portal is 120 m from daylight; outside it, 0; near the shaft\'s foot, the shaft',nb.o===P&&nb.d===120&&no.d===0&&nw.o===W&&nw.d<3,nb.d!==120);
ok('a narrow shaft lets in a tenth of the sky (open '+W.open.toFixed(3)+'), a portal all of it',Math.abs(W.open-Math.pow(3/12,2))<1e-12&&P.open===1,W.open>=.5);
const atShaft=L.exposureAt(500,1.7,4,{under:true}),atMouth=L.exposureAt(5,1.7,0,{under:true}),between=L.exposureAt(60,1.7,0,{under:true});
ok('at the shaft\'s foot the eye stays nearly dark-adapted (exposure '+atShaft.exposure.toFixed(2)+', ambient '+atShaft.ambient.toFixed(2)+'): no daylight flood round a narrow shaft',
  atShaft.opening==='shaft'&&atShaft.exposure>1.45&&atShaft.ambient<.25&&atShaft.sun<.1,atShaft.ambient>.5);
ok('5 m in the portal the sky is still full; 60 m in the portal still wins over the far shaft and the sun is out',atMouth.opening==='portal'&&atMouth.ambient>.95&&between.opening==='portal'&&between.sun===0&&between.ambient<atMouth.ambient,between.sun>0);
ok('the sun is out within 15 m of the mouth (no shadow stops it on a page without them)',L.exposure({under:true,d:15,ramp:300}).sun===0&&L.exposure({under:true,d:3,ramp:300}).sun>.5,L.exposure({under:true,d:15,ramp:300}).sun>0);
const sun=[.3,.8,.52].map((v,i,a)=>v/Math.hypot(...a)),dl=L.daylight(W,sun,1);
ok('daylight down the shaft: the beam lands off its foot along the sun, the sky\'s spot straight down',dl.on&&Math.abs(dl.beam.to[0]-(500-sun[0]*200/sun[1]))<1e-9&&dl.sky.target[0]===500&&dl.spot.intensity>0&&dl.shaft.len>200,dl.sky.target[0]!==500);
const lowSun=[-.6,.3,0].map((v,i,a)=>v/Math.hypot(...a)),hiSun=[-.1,.99,0].map((v,i,a)=>v/Math.hypot(...a));
ok('no daylight at night; a low sun behind the portal reaches in at most 8 widths, a high one only metres; a portal has no shaft of air',
  L.daylight(W,sun,0).on===false&&L.daylight(P,lowSun,1).beam.to[0]<=16*8+1e-9&&L.daylight(P,lowSun,1).beam.to[0]>20&&L.daylight(P,hiSun,1).beam.to[0]<3&&L.daylight(P,sun,1).shaft===null&&L.daylight(W,sun,1).shaft,
  L.daylight(W,sun,0).on||L.daylight(P,sun,1).shaft);

// ---- export
L.addAll(full);L.add(strip);L.add({id:'hood',kind:'lamp-white',x:0,y:5,z:0});
const X=L.export();
ok('the export: format, kinds, every record with its at, a strip its to, a hood its spot, openings',X.format==='krator-cavelight'&&X.version===1&&X.lights.length===22&&X.lights.find(r=>r.id==='st').to[2]===10&&X.lights.find(r=>r.id==='hood').hood.angle===.7&&X.openings.length===2&&X.kinds.wax,X.lights.length!==22);
ok('the export crops to a tile',L.export({inBox:(x,z)=>x<500}).lights.length===12,L.export({inBox:(x,z)=>x<500}).lights.length===22);
ok('the export is plain JSON',JSON.stringify(JSON.parse(JSON.stringify(X)))===JSON.stringify(X),false);

console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
