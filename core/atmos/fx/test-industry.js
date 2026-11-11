// node core/atmos/fx/test-industry.js -- the Yards' and the Terraces' effects (fx/89-atmos-fx-plumes, -sparks, -sludge, -slag,
// -spill, -gustsheen): every record is filled and checked, deterministic on core/rand, and the JS twins say what the shaders
// do; each check with a negative. The drawing is checked on core/atmos/fxdemo (verify.py, #scene=yards and terraces).
'use strict';
const fs=require('fs'),path=require('path');global.window=global;
require(path.join(__dirname,'..','..','rand','08-core-rand.js'));
const src=['89-atmos-0-core.js','89-atmos-0p-presets.js'].map(f=>path.join(__dirname,'..',f)).concat(
 ['89-atmos-fx-localtime.js','89-atmos-fx-plumes.js','89-atmos-fx-sparks.js','89-atmos-fx-sludge.js','89-atmos-fx-slag.js','89-atmos-fx-spill.js','89-atmos-fx-gustsheen.js'].map(f=>path.join(__dirname,f)));
eval(src.map(f=>fs.readFileSync(f,'utf8')).join('\n')+';global.ATMOS=ATMOS;');
const A=global.ATMOS,K=global.KRAND;let bad=0;const ok=(n,p,neg)=>{const r=!!p&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+n+(neg?' (its negative passed)':''));};
const throws=f=>{try{f();return false;}catch(e){return true;}};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

// ---- plumes
const pr=(o,i)=>A.plumeRec(o,i||1,5);
const st=pr({at:[0,40,0],kind:'stack'}),co=pr({at:[0,0,0],kind:'cooling'},2);
ok('a plume is filled from its kind and phased by core/rand',st.rise===A.PRESETS.plumes.stack.rise&&co.r===30&&st.phase===K.unit(K.hash(5,1,A.PRESETS.plumes.salt))&&same(pr({at:[0,40,0],kind:'stack'}),st),st.phase===co.phase);
ok('an unknown kind, no mouth or a duty of 0 is refused',throws(()=>pr({at:[0,0,0],kind:'geyser'}))&&throws(()=>pr({kind:'stack'}))&&throws(()=>pr({at:[0,0,0],kind:'stack',duty:0})),throws(()=>pr({at:[0,0,0],kind:'vent'})));
const half=pr({at:[0,0,0],kind:'vent',duty:.5,period:100,phase:0});
ok('a half-duty plume runs the first half of its period and rests the second',A.plumeOn(half,10)&&!A.plumeOn(half,60)&&A.plumeOn(half,110),A.plumeOn(half,60));
const D=A.plumeData([st]),w=[4,0];let rose=true,downwind=true,levelled=true;
for(let i=0;i<D.n;i++){const p0=A.plumeAt(D,i,0,w);if(p0[1]<40-1e-9)rose=false;}
const ages=[];for(let i=0;i<D.n;i++){const a=D.pp[4*i];ages.push([a,A.plumeAt(D,i,(1-a)/D.pq[4*i]*.999,w)]);}   /* each particle just before it loops: the plume's far end */
const old=ages.map(q=>q[1]);if(!old.every(p=>p[0]>100))downwind=false;if(!old.every(p=>p[1]>40+st.rise*.9&&p[1]<40+st.rise+1e-6))levelled=false;
ok('a stack\'s soot rises from the mouth, levels near its rise and is bent far downwind',rose&&levelled&&downwind,!rose);
const Dh=A.plumeData([half]);let shownOff=0,shown=0;for(let i=0;i<Dh.n;i++){const a=Dh.pp[4*i],t=53,age=((t*Dh.pq[4*i]+a)%1),born=t-age/Dh.pq[4*i];const on=A.plumeAt(Dh,i,t)[3];if(on)shown++;if(on&&!A.plumeOn(half,born))shownOff++;}
ok('a particle shows only if it left the mouth while the plume ran (and some do)',shownOff===0&&shown>0&&shown<Dh.n,shown===Dh.n);

// ---- sparks and arcs
const sp=A.sparkRec({at:[0,1,0],period:4,burst:1},1,9),arc=A.arcRec({a:[0,10,0],b:[6,0,0],period:5,on:.5},1,9);
ok('a shower and an arc are filled and phased; a burst longer than its period is refused',sp.speed===A.PRESETS.sparks.speed&&arc.segs===A.PRESETS.sparks.arc.segs&&throws(()=>A.sparkRec({at:[0,0,0],period:1,burst:2},1))&&throws(()=>A.arcRec({a:[0,0,0],b:[1,1],period:2},1)),sp.phase===arc.phase);
const e0=A.sparkEpoch(sp,0),e1=A.sparkEpoch(sp,4);
ok('the epoch counts showers on the record\'s period and phase',e1.n===e0.n+1&&Math.abs(e1.u-e0.u)<1e-9,e1.n===e0.n);
ok('an arc\'s ends stay put and its middle jags within jag',(()=>{const t=arc.phase*0+.1-arc.phase*arc.period+arc.period;const p0=A.arcPoint(arc,0,14,t),pn=A.arcPoint(arc,14,14,t),pm=A.arcPoint(arc,7,14,t);
 return Math.hypot(p0[0],p0[1]-10,p0[2])<1e-9&&Math.hypot(pn[0]-6,pn[1],pn[2])<1e-9&&Math.abs(pm[0]-3)<=arc.jag+1e-9&&Math.abs(pm[2])<=arc.jag+1e-9;})(),false);
const tA=(1-arc.phase)*arc.period+.1,flash1=A.arcPoint(arc,7,14,tA),flash1b=A.arcPoint(arc,7,14,tA+.005),flick=A.arcPoint(arc,7,14,tA+.1),flash2=A.arcPoint(arc,7,14,tA+arc.period);
ok('the bolt holds within a flicker, re-draws on the next flicker and is new each flash',same(flash1,flash1b)&&!same(flash1,flick)&&!same(flash1,flash2),same(flash1,flash2));
const hz=A.arcHazard(arc);ok('the arc\'s hazard is a shock on the arc\'s own cycle (its phase as the offset)',hz.effect==='shock'&&hz.cycle.period===arc.period&&hz.cycle.on===arc.on&&Math.abs(hz.cycle.offset-arc.phase*arc.period)<1e-9,hz.cycle.offset===0);
ok('the GLSL hash is the JS one: lowbias32\'s constants in both',/0x7feb352du/.test(A.sparkGLSL())&&/0x846ca68bu/.test(A.sparkGLSL())&&A.sparkHash(1,2,3,4)===A.sparkHash(1,2,3,4)&&A.sparkHash(1,2,3,4)!==A.sparkHash(1,2,3,5),/fract\(\s*sin/.test(A.sparkGLSL()));

// ---- sludge and spills
const pool=A.sludgeRec({at:[0,0,0],r:6},1,3),sp1=A.spillRec({at:[0,0],r:10},1,3),wet=A.spillRec({at:[100,0],r:5,kind:'wet'},2,3);
ok('pools and spills are filled; a bad radius or kind is refused',pool.toxic===1&&sp1.kind==='oil'&&wet.kind==='wet'&&throws(()=>A.sludgeRec({at:[0,0,0],r:0},1))&&throws(()=>A.spillRec({at:[0,0],kind:'tar'},1)),throws(()=>A.spillRec({at:[0,0]},1)));
ok('a stain is full at its centre, broken at its edge and gone beyond it',A.spillAt([sp1],0,0)===1&&A.spillAt([sp1],15,0)===0&&A.spillAt([sp1],0,0)>A.spillAt([sp1],9,0),A.spillAt([sp1],15,0)>0);
let varies=false;for(let a=0;a<6.28;a+=.2){const v=A.spillAt([sp1],Math.cos(a)*9.2,Math.sin(a)*9.2);if(v>0&&v<1)varies=true;}
ok('the edge is broken by core/rand\'s noise, not a clean circle',varies,false);
ok('the pool\'s hazard is acid on its footprint',A.poolHazard(pool).kind==='acid'&&A.poolHazard(pool).shape.r===6,A.poolHazard(pool).kind!=='acid');
// the KRAND chunk: run its integer steps, read from the GLSL text, against KRAND.h3 (the same constants, shifts and order)
const G=A.krandGLSL(),hex=s=>parseInt(s,16)>>>0,C=[...G.matchAll(/0x([0-9a-fA-F]{8})u/g)].map(m=>hex(m[1]));
const rot=+(/h<<(\d+)u\)\|\(h>>(\d+)u/.exec(G)[1]),sh=[...G.matchAll(/h\^=h>>(\d+)u/g)].map(m=>+m[1]);
const S=(h,v)=>{h=Math.imul((h^v)>>>0,C[0])>>>0;return ((h<<rot)|(h>>>(32-rot)))>>>0;},M=h=>{h^=h>>>sh[0];h=Math.imul(h,C[1])>>>0;h^=h>>>sh[1];h=Math.imul(h,C[2])>>>0;h^=h>>>sh[2];return h>>>0;};
const H3=(x,y,z,s)=>M((S(S(S((s^C[3])>>>0,x|0),y|0),z|0)^3)>>>0)/4294967296;
let agree=true;for(let i=0;i<500;i++){const x=Math.floor(K.unit(K.hash(1,i,1))*2000-1000),y=Math.floor(K.unit(K.hash(1,i,2))*2000-1000),z=Math.floor(K.unit(K.hash(1,i,3))*2000-1000),s=K.hash(1,i,4)&65535;if(H3(x,y,z,s)!==K.h3(x,y,z,s))agree=false;}
ok('the GLSL KRAND chunk is KRAND.h3 bit for bit (500 lattice points, negative ones too)',agree&&C.length===4&&rot===13,!agree);

// ---- slag
const sl=A.slagRec({at:[0,10,0],r:8,heat:1,base:.1},1,4);
ok('the slag is hottest at the pour and falls to its embers',A.slagHeat(sl,0,10,0)===1&&A.slagHeat(sl,0,10,8)<.5&&A.slagHeat(sl,0,10,100)===.1,A.slagHeat(sl,0,10,100)<.1);
ok('a heat above 1, a zero cell or no pour is refused',throws(()=>A.slagRec({at:[0,0,0],heat:2},1))&&throws(()=>A.slagRec({at:[0,0,0],cell:0},1))&&throws(()=>A.slagRec({},1)),throws(()=>A.slagRec({at:[0,0,0]},1)));
ok('the slag chunk has no sin hash and the ramp\'s colours',!/fract\(\s*sin/.test(A.slagGLSL())&&A.slagGLSL().indexOf(A.glf(A.PRESETS.slag.ramp[2][2]))>0,/fract\(\s*sin/.test(A.slagGLSL()));

// ---- the aqueduct's spill
const deck=[[0,0,20],[100,0,20]],ground=(x,z)=>x*.05;
const span=A.aqueductSpill({deck,at:40,width:2,depth:.6,ground,seed:2}),br=A.aqueductSpill({deck,at:40,kind:'breach',side:-1,width:2,depth:.6,ground,seed:2});
ok('a broken span pours along the channel from its end, across the channel\'s width',Math.abs(span.dir[0]-1)<1e-9&&Math.abs(span.lip[0][1]-span.lip[1][1])===2&&span.lip[0][0]===40,span.dir[1]!==0);
ok('a breach pours sideways out of its wall',Math.abs(br.dir[1])===1&&br.dir[0]===0&&br.lip[0][1]===br.lip[1][1],br.dir[0]!==0);
const tf=Math.sqrt(2*span.drop/9.81);
ok('the fall lands on the ground: the drop is the height over the landing point',Math.abs(span.foot[1]-ground(span.foot[0],span.foot[2]))<.05&&Math.abs(span.foot[0]-(40+span.speed*tf))<1e-6,Math.abs(span.foot[1]-ground(span.foot[0],span.foot[2]))>=.05);
ok('core/water\'s fall takes the same lip, dir, speed and drop',same(span.fall.lip,span.lip)&&span.fall.drop===span.drop&&span.emitters[0].kind==='curtain'&&span.wet.kind==='wet',false);
ok('the drips come from the cracks along the span, never at the break',span.emitters.filter(e=>e.kind==='drops').every(e=>Math.abs(e.at[0]-40)>=2)&&span.emitters.length>1,false);
ok('a break off the deck or a bad kind is refused',throws(()=>A.aqueductSpill({deck,at:500}))&&throws(()=>A.aqueductSpill({deck,kind:'leak'}))&&throws(()=>A.aqueductSpill({deck:[[0,0,0]]})),throws(()=>A.aqueductSpill({deck})));
ok('the same spill twice is the same record',same(A.aqueductSpill({deck,at:40,ground,seed:2}),A.aqueductSpill({deck,at:40,ground,seed:2})),same(A.aqueductSpill({deck,at:40,ground,seed:2}),A.aqueductSpill({deck,at:40,ground,seed:3})));

// ---- the gust
const PW=A.PRESETS.wind,gs=[];for(let x=0;x<400;x+=10)gs.push(A.gustAt(0,x,0,[5,0]));
ok('the gust rolls downwind: a crest at x reaches x + frontSpeed x t, t seconds later',Math.abs(A.gustAt(0,50,0,[5,0])-A.gustAt(10,50+PW.frontSpeed*10,0,[5,0]))<1e-9&&Math.max(...gs)-Math.min(...gs)>.1,Math.abs(A.gustAt(0,50,0,[5,0])-A.gustAt(10,50-PW.frontSpeed*10,0,[5,0]))<1e-9);

// ---- fume and chaff (localFx's two kinds for the Yards and the Terraces)
const Df=A.localFxData([{kind:'fume',at:[0,0,0],r:6,h:2,n:30}]);let fumeOk=true;for(let i=0;i<Df.n;i++){const y=A.localFxAt(Df,i,7)[1];if(y<0||y>2+1e-9)fumeOk=false;}
ok('a pool\'s fume stays low: within its h of the surface',fumeOk&&Df.n===30,!fumeOk);
const Dc=A.localFxData([{kind:'chaff',at:[0,0,0],r:30,h:3,n:200}]),lift=t=>{let m=0,y0=0;for(let i=0;i<Dc.n;i++){const p=A.localFxAt(Dc,i,t,[5,0]);m=Math.max(m,p[1]);}return m;};
let hi=0,lo=1e9;for(let t=0;t<60;t+=.5){const l=lift(t);hi=Math.max(hi,l);lo=Math.min(lo,l);}
ok('chaff lies on the field between gusts and is lifted as a front passes',hi>1&&lo<hi*.6,hi<=1);
const still=A.localFxData([{kind:'chaff',at:[0,0,0],r:30,n:50}]);const gp=A.PRESETS.wind.gustAmp;A.PRESETS.wind.gustAmp=0;let flat=true;for(let i=0;i<still.n;i++)if(A.localFxAt(still,i,13,[5,0])[1]!==0)flat=false;A.PRESETS.wind.gustAmp=gp;
ok('with no gust the chaff does not rise',flat,!flat);
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
