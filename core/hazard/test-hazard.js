// node core/hazard/test-hazard.js — the hazard records and KHAZ (20-core-hazard.js), each check with a negative.
'use strict';
const fs=require('fs'),path=require('path');
const C=p=>path.join(__dirname,'..',p);
require(C('rand/08-core-rand.js'));
const KT=require(C('tags/50-core-tags.js'));require(C('tags/52-core-tags-vocab.js'));
eval(fs.readFileSync(C('biome/37-core-traps.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'20-core-hazard.js'),'utf8'));
const H=globalThis.KHAZ,TR=globalThis.KTRAPS,V=KT.VOCAB;
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const throws=f=>{try{f();return false;}catch(e){return true;}};

// ---- the vocabulary: every kind has its defaults; the key is known to core/tags
ok('every hazard kind has an effect, a danger, a dose, a falloff, nav and a tell',
  Object.keys(V.hazardKinds).every(k=>{const r=V.hazardKinds[k];return 'effect' in r&&r.danger>=0&&r.danger<=1&&r.dose>=0&&V.hazardFalloffs.indexOf(r.falloff)>=0&&r.nav&&r.tell&&/^#[0-9a-f]{6}$/.test(r.tell.colour)&&(r.effect==null||V.hazardEffects.indexOf(r.effect)>=0);}),
  Object.keys(V.hazardKinds).length<14);
ok('core/tags takes a hazard object and refuses a hazard string',KT.norm({hazard:{kind:'gas'}}).problems.length===0,KT.norm({hazard:'gas'}).problems.length===0);

// ---- make: the kind's row fills the record; unknowns are refused
const g=H.make({kind:'gas'});
ok('make fills a gas hollow from its kind',g.effect==='suffocate'&&g.danger===.8&&g.nav.avoid&&g.nav.layer===V.navLayers.avoid&&g.tell.colour==='#c8d84a',g.nav.layer===V.navLayers.walk);
ok('a given value wins over the kind\'s, 0 included (x == null ? d : x)',H.make({kind:'heat',danger:0,dose:0}).danger===0&&H.make({kind:'heat',dose:0}).dose===0,H.make({kind:'heat'}).danger===0);
ok('an effect of null is kept null',H.make({kind:'heat',effect:null}).effect===null,H.make({kind:'heat'}).effect===null);
ok('an unknown kind is refused',throws(()=>H.make({kind:'magma'})),throws(()=>H.make({kind:'heat'})));
ok('an unknown effect, shape, falloff and trigger are refused',throws(()=>H.make({kind:'heat',effect:'sneeze'}))&&throws(()=>H.make({kind:'heat',shape:{type:'cone'}}))&&
  throws(()=>H.make({kind:'heat',falloff:'cubic'}))&&throws(()=>H.make({kind:'pit',trigger:{by:'wish'}})),throws(()=>H.make({kind:'pit',trigger:{by:'step',mass:30}})));
ok('a danger above 1 is refused',throws(()=>H.make({kind:'heat',danger:1.2})),throws(()=>H.make({kind:'heat',danger:1})));
ok('a cycle longer than its period is refused',throws(()=>H.make({kind:'heat',cycle:{period:10,on:8,ramp:2}})),throws(()=>H.make({kind:'heat',cycle:{period:12,on:8,ramp:2}})));
ok('a poly needs three points',throws(()=>H.make({kind:'acid',shape:{type:'poly',pts:[[0,0],[1,0]]}})),throws(()=>H.make({kind:'acid',shape:{type:'poly',pts:[[0,0],[1,0],[0,1]]}})));

// ---- a registry with a few hazards
const T=KT.create({build:'hz'});
const pool=T.add({'class':'feature',kind:'pool',name:'An acid pool',at:[10,0,0],r:5,h:2,tags:{hazard:{kind:'acid'}}});
const vent=T.add({'class':'feature',kind:'vent',name:'A fumarole',at:[-20,0,0],r:4,h:6,tags:{hazard:{kind:'heat',falloff:'linear',cycle:{period:60,warn:5,ramp:2,on:10,after:6}}}});
const crack=T.add({'class':'feature',kind:'crack',name:'A crack',at:[0,0,40],ry:Math.PI/2,size:[2,30,8],tags:{hazard:{kind:'fall'}}});
const marsh=T.add({'class':'feature',kind:'marsh',name:'Acid marsh',at:[0,0,-60],tags:{hazard:{kind:'acid',shape:{type:'poly',pts:[[-10,-10],[10,-10],[10,10],[-10,10]],h:3,edge:4},falloff:'linear'}}});
const plain=T.add({'class':'feature',kind:'rock',name:'A rock',at:[0,0,0],r:2});
ok('a record without a hazard has none',H.of(plain)===null&&H.state(plain,0)===null&&H.dose(plain,0,0,0)===0,H.of(pool)===null);

// shapes and falloff
ok('a cylinder from the record\'s r and h',H.shape(pool).type==='cyl'&&H.shape(pool).r===5&&H.shape(pool).h===2,H.shape(pool).r!==5);
ok('inside a pool at its core is 0, at the edge 1, past it -1',H.inside(pool,10,0)===0&&Math.abs(H.inside(pool,15,0)-1)<1e-12&&H.inside(pool,15.1,0)===-1,H.inside(pool,15.1,0)>=0);
ok('a height outside the band is outside',H.inside(pool,10,0,1)===0&&H.inside(pool,10,0,3)===-1,H.inside(pool,10,0,3)>=0);
ok('a box turned by ry: the long side runs along x',H.inside(crack,14,40)>=0&&H.inside(crack,0,54)===-1,H.inside(crack,0,54)>=0);
ok('a poly is full inside its edge band and fades at the edge',H.inside(marsh,0,-60)===0&&H.inside(marsh,9,-60)>0&&H.inside(marsh,11,-60)===-1,H.inside(marsh,11,-60)>=0);
ok('falloff none, linear and smooth',H.fall('none',.7)===1&&Math.abs(H.fall('linear',.25)-.75)<1e-12&&H.fall('smooth',0)===1&&H.fall('smooth',1)===0&&Math.abs(H.fall('smooth',.5)-.5)<1e-12,H.fall('linear',.25)===1);

// the state: a steady hazard is always on; a cycle by the one clock
ok('a steady hazard is on with k 1',H.state(pool,123).k===1&&H.state(pool,123).state==='steady',H.state(pool,123).k!==1);
const seen={};let kOK=true;for(let t=0;t<600;t+=.25){const s=H.state(vent,t);seen[s.state]=1;if(s.k<0||s.k>1)kOK=false;}
ok('a vent warns, rises, plays, falls, steams after and idles',seen.warn&&seen.rising&&seen.on&&seen.falling&&seen.after&&seen.idle&&kOK,!seen.on);
let on=0;for(let t=0;t<6000;t+=.1)if(H.state(vent,t).state==='on')on++;
ok('it is on for its share of the period ('+(on/60000).toFixed(3)+')',Math.abs(on/60000-10/60)<.005,Math.abs(on/60000-.5)<.005);
const vent2=T.add({'class':'feature',kind:'vent',name:'Another fumarole',at:[-30,0,0],r:4,h:6,tags:vent.tags});
const differ=(()=>{for(let t=0;t<60;t+=1)if(H.state(vent,t).state!==H.state(vent2,t).state)return true;return false;})();
ok('two vents with the same cycle are phased by their ids',differ,!differ);
ok('the same id is in the same place every time',H.state(vent,77.7).k===H.state(vent,77.7).k&&H.state(vent,77.7).state===H.state(vent,77.7).state,false);
const auth=H.make({kind:'heat',cycle:{period:100,warn:10,on:20,offset:-30}});
const geo=T.add({'class':'feature',kind:'geyser',name:'A geyser',at:[50,0,50],r:6,h:40,tags:{hazard:{kind:'heat',cycle:{period:100,warn:10,on:20,offset:-30}}}});
ok('an authored offset puts its warn at the offset (a geyser\'s own clock: u = t - off)',H.state(geo,30).state==='warn'&&H.state(geo,40).state==='on'&&H.state(geo,29.9).state==='idle'&&auth.cycle.offset===-30,H.state(geo,30).state==='idle');
ok('a page\'s speed shortens only the idle part',(()=>{let n=0,m=0;for(let t=0;t<1000;t+=.05){if(H.state(geo,t,1).state==='on')n++;if(H.state(geo,t,10).state==='on')m++;}return m>n*2.5&&m<n*3.5;})(),false);
ok('a warn is flagged and harms nothing',(()=>{const s=H.state(geo,31);return s.warn&&s.k===0&&!s.on;})(),H.state(geo,45).warn);
ok('an unknown stateFn is reported',throws(()=>H.state({id:'x',at:[0,0,0],tags:{hazard:{kind:'heat',stateFn:'NOPE.state'}}},0)),throws(()=>H.state(pool,0)));

// a carnivore: the trap's own clock, through KTRAPS.state
const trap=TR.make({kind:'grab',mouth:1.2,preyMax:'person',danger:.9});
const mE=T.add({'class':'flora',kind:'maneater',name:'Man-eater',at:[80,0,0],r:1.5,h:3,tags:{trap,hazard:{kind:'grab',danger:.9,stateFn:'KTRAPS.state',seed:'me-3'}}});
const sw=[];for(let t=0;t<3e5;t+=20){const a=H.state(mE,t,1),b=TR.state(trap,t,'me-3',1);sw.push(a.state===b.state&&(b.state==='shut'?a.k===0:b.state==='opening'?a.k===1-b.k:a.k===1));}
ok('a trap\'s hazard follows KTRAPS.state on its seed (open and shutting harm, shut does not)',sw.every(x=>x)&&sw.length>100,false);
const mE2=Object.assign({},mE,{tags:{trap,hazard:{kind:'grab',stateFn:'KTRAPS.state'}}});
ok('without a seed the record id is the clock\'s',(()=>{for(let t=0;t<3e5;t+=97)if(H.state(mE2,t,1).state!==TR.state(trap,t,mE.id,1).state)return false;return true;})(),
  (()=>{for(let t=0;t<3e5;t+=97)if(H.state(mE2,t,1).state!==TR.state(trap,t,'me-3',1).state)return false;return true;})());
H.STATES['TEST.pit']=(rec,h,t)=>({state:t<10?'whole':'torn',k:1,on:true,hidden:t<10});
const pit=T.add({'class':'flora',kind:'punji',name:'A pit',at:[0,0,90],r:.7,h:2,tags:{hazard:{kind:'pit',stateFn:'TEST.pit',trigger:{by:'weight',mass:20,reset:480}}}});
ok('a kit\'s own state function by name',H.state(pit,1).hidden&&H.state(pit,20).state==='torn',H.state(pit,20).hidden);

// dose and at
ok('dose: the core of an acid pool gives the kind\'s dose',H.dose(pool,10,0,0)===1&&H.dose(pool,30,0,0)===0,H.dose(pool,30,0,0)>0);
ok('dose: a linear vent halfway out gives half, only while it plays',(()=>{let a=null,b=null;for(let t=0;t<60;t+=.5){const s=H.state(vent,t);if(s.state==='on')a=H.dose(vent,-18,0,t);if(s.state==='idle')b=H.dose(vent,-18,0,t);}return Math.abs(a-.5)<1e-9&&b===0;})(),false);
const hits=H.at(10,0,0,null,T);
ok('at: the records holding a point, the worst first',hits.length===1&&hits[0].id===pool.id&&hits[0].kind==='acid'&&hits[0].dose===1,hits.length!==1);
ok('at: nothing at a safe point',H.at(200,200,0,null,T).length===0,H.at(10,0,0,null,T).length===0);
const two=T.add({'class':'feature',kind:'gas',name:'CO2 over the pool',at:[10,0,0],r:8,h:4,tags:{hazard:{kind:'gas'}}});
const h2=H.at(10,0,0,null,T);
ok('at: gas (.8) before acid (.7) at the same point',h2.length===2&&h2[0].id===two.id&&h2[1].id===pool.id,h2[0].id===pool.id);
T.remove(two.id);
ok('a removed hazard is gone from at and list',H.at(10,0,0,null,T).length===1&&H.list(T).indexOf(two)<0,H.list(T).indexOf(two)>=0);

// an item set carrying a hazard: its instances each
const tb=KT.table();tb.push(0,0,200,0,2,2,1);tb.push(6,0,200,0,2,2,1);
const thorns=T.addSet({'class':'flora',kind:'thornbush',key:'thorn',name:'Thorn brake',at:[0,0,0],tags:{hazard:{kind:'thorn'}}},tb);
ok('a set\'s instances are hazards each',H.list(T).filter(r=>r.parent===thorns.id).length===2&&H.at(6,200,0,null,T).length===1,H.at(3,200,0,null,T).length>0);
tb.push(12,0,200,0,2,2,1);
ok('a set that grows is listed again',H.list(T).filter(r=>r.parent===thorns.id).length===3,H.list(T).filter(r=>r.parent===thorns.id).length===2);

// zones and export
const Z=H.zones(T);
const zp=Z.find(z=>z.id===pool.id),zv=Z.find(z=>z.id===vent.id);
ok('zones: an acid pool is an avoid zone on the avoid layer, a vent a costly one on the walk layer',zp.avoid&&zp.layer===2&&zp.travel===10&&zv&&!zv.avoid&&zv.layer===1&&zv.travel===4&&zv.enter===10,zv.avoid);
ok('zones: the world shape carries at, ry and the footprint',zp.shape.type==='cyl'&&zp.shape.r===5&&zp.shape.at[0]===10&&Math.abs(Z.find(z=>z.id===crack.id).shape.ry-Math.PI/2)<1e-3,zp.shape.r!==5);
ok('zones: none for a record without a hazard or a removed one',!Z.some(z=>z.id===plain.id||z.id===two.id),Z.some(z=>z.id===pool.id)===false);
const ex=H.export(T),exB=H.export(T,(x,z)=>x>=0&&z>=0&&x<100&&z<100);
ok('export: krator-hazard with every record filled',ex.format==='krator-hazard'&&ex.records.length===H.list(T).length&&ex.records.every(r=>r.hazard&&r.hazard.nav&&r.shape)&&ex.kinds.acid,ex.records.length===0);
ok('export: a tile crops by at',exB.records.length>0&&exB.records.length<ex.records.length&&exB.records.every(r=>r.at[0]>=0&&r.at[2]>=0),exB.records.length===ex.records.length);
ok('export: a copy, not the record',(()=>{ex.records[0].hazard.danger=0;return H.of(T.get(ex.records[0].id)).danger!==0;})(),false);
ok('export is the same twice',JSON.stringify(H.export(T).records.slice(1))===JSON.stringify(ex.records.slice(1)),false);
ok('no registry is an error',throws(()=>H.list(null)),throws(()=>H.list(T)));

// the inspector's words (core/tags' host fragment, 53): the state now, and every hazard at a point
require(C('tags/53-core-tags-host.js'));
{let tOn=null;for(let t=0;t<60;t+=.5)if(H.state(vent,t).state==='on'){tOn=t;break;}
 const w=KT.hazardNow(vent,tOn,{x:-18,y:1,z:0});
 ok('hazardNow says the state, its share, the time to the next, the dose and the path cost ('+w+')',/^hazard now: on · 100% · \d+ s to the next · dose 0\.50\/s here · path cost x4$/.test(w),false);
 ok('hazardNow is empty for a record without a hazard',KT.hazardNow(plain,0)==='',KT.hazardNow(pool,0)==='');
 const a=KT.hazardAt(10,1,0,0,T);
 ok('hazardAt names each hazard at a point ('+a.split('\n')[0]+')',/^An acid pool — hazard: acid \(corrode\), danger 0\.7/.test(a)&&/paths avoid it/.test(a),KT.hazardAt(300,0,300,0,T)!=='');}
// ---- 2026-10-26: the Godthrone's lava and vents, the live fire, the Outlands' luck and taboo
{const old=H.make({kind:'acid'});
 ok('an older kind fills exactly as before: no radiant, soak or fire keys',!('radiant' in old)&&!('soak' in old)&&!('fire' in old)&&!('base' in H.make({kind:'heat',cycle:{period:60,on:10}}).cycle),'radiant' in H.make({kind:'lava'})===false);
 const lv=H.make({kind:'lava'});
 ok('lava kills, avoids, and radiates 8 m from its kind',lv.danger===1&&lv.effect==='burn'&&lv.nav.avoid&&lv.radiant.reach===8&&lv.radiant.danger===.4,lv.radiant==null);
 ok('a record\'s radiant null turns the kind\'s off; its own values win',H.make({kind:'lava',radiant:null}).radiant===undefined&&H.make({kind:'lava',radiant:{reach:20}}).radiant.reach===20&&H.make({kind:'lava',radiant:{reach:20}}).radiant.dose===2,H.make({kind:'lava',radiant:null}).radiant!=null);
 ok('a radiant on any kind takes the record\'s danger when it gives none',H.make({kind:'heat',danger:.6,radiant:{reach:5,dose:1}}).radiant.danger===.6,false);
 ok('a bad radiant, soak or base is refused',throws(()=>H.make({kind:'lava',radiant:{reach:0}}))&&throws(()=>H.make({kind:'lava',radiant:{danger:2}}))&&throws(()=>H.make({kind:'luck',soak:{full:0}}))&&
   throws(()=>H.make({kind:'luck',soak:{from:1.5}}))&&throws(()=>H.make({kind:'gas',cycle:{period:60,on:10,base:1.2}})),throws(()=>H.make({kind:'gas',cycle:{period:60,on:10,base:.3}})));
 ok('misfortune is an effect, luck its kind',V.hazardEffects.indexOf('misfortune')>=0&&H.make({kind:'luck'}).effect==='misfortune',throws(()=>H.make({kind:'luck'})));}
const G2=KT.create({build:'godthrone-test'}),GR=H.GROUND;
const flow=G2.add({'class':'feature',kind:'flow',name:'A lava flow',at:[0,0,0],tags:{hazard:GR.lavaFlow([[-20,-5],[20,-5],[20,5],[-20,5]])}});
const lake=G2.add({'class':'feature',kind:'lake',name:'A lava lake',at:[200,0,0],tags:{hazard:GR.lavaLake(30)}});
const gv=G2.add({'class':'feature',kind:'vent',name:'A gas vent',at:[0,0,200],tags:{hazard:GR.gasVent(10)}});
const hg=G2.add({'class':'feature',kind:'ground',name:'Hot ground',at:[-200,0,0],tags:{hazard:GR.hotGround(null,25)}});
ok('the Godthrone\'s presets make valid hazards',[flow,lake,gv,hg].every(r=>H.of(r)),GR.lavaFlow(null).kind!=='lava');
ok('a preset\'s fields give way to the record\'s',GR.gasVent(10,{danger:.5}).danger===.5,GR.gasVent(10).danger===.5);
ok('beyond: 0 inside, metres outside (poly, cyl, box, band)',H.beyond(flow,0,0)===0&&Math.abs(H.beyond(flow,0,9)-4)<1e-9&&Math.abs(H.beyond(lake,240,0)-10)<1e-9&&Math.abs(H.beyond(flow,0,0,7)-4)<1e-9,H.beyond(flow,0,9)===0);
ok('radiant heat: the dose falls with distance and stops at the reach',(()=>{const a=H.dose(flow,0,6,0),b=H.dose(flow,0,9,0),c=H.dose(flow,0,13.5,0);return a>b&&b>0&&c===0&&Math.abs(a-2*Math.pow(1-1/8,2))<1e-9;})(),H.dose(flow,0,13.5,0)>0);
ok('inside the lava the whole dose',H.dose(flow,0,0,0)===20,H.dose(flow,0,0,0)<20);
{const hits=H.at(0,8,0,null,G2);
 ok('at: a radiant hit says so and takes the radiant danger',hits.length===1&&hits[0].radiant&&hits[0].danger===.4&&hits[0].id===flow.id,hits.length&&!hits[0].radiant);
 ok('at: nothing beyond the reach',H.at(0,30,0,null,G2).length===0,H.at(0,8,0,null,G2).length===0);}
{let lo=1,hi=0,lo2=1;for(let t=0;t<600;t+=.5){const k=H.state(lake,t).k,k2=H.state(gv,t).k;lo=Math.min(lo,k);hi=Math.max(hi,k);lo2=Math.min(lo2,k2);}
 ok('cycle base: the lava lake never drops below .7 and overturns to 1; the vent fumes at .3 between puffs',Math.abs(lo-.7)<1e-9&&hi===1&&Math.abs(lo2-.3)<1e-9,lo===0);
 const nob=T.add({'class':'feature',kind:'vent',at:[500,0,500],r:2,tags:{hazard:{kind:'gas',cycle:{period:60,on:10}}}});let m=1;for(let t=0;t<120;t+=.5)m=Math.min(m,H.state(nob,t).k);
 ok('negative: a cycle with no base still goes to 0',m===0,m>0);}
ok('hot ground is walkable at a cost and burns slowly from the core',(()=>{const h=H.of(hg);return !h.nav.avoid&&h.nav.travel===3&&H.dose(hg,-200,0,0)===.4&&H.dose(hg,-180,0,0)<.4;})(),H.of(hg).nav.avoid);

// a live fire: a stub of KFIRE.run's contract (at, range, order, arrive), a strip burning eastward at 1 m/s
const RUN=(()=>{const N=10,cs=10,x0=0,z0=0,arrive=new Float32Array(N*N).fill(Infinity),order=[];
  for(let i=0;i<N;i++){const c=5*N+i;arrive[c]=i*10;order.push(c);}
  const near=(x,z)=>Math.max(0,Math.min(N-1,Math.round((z-z0)/cs)))*N+Math.max(0,Math.min(N-1,Math.round((x-x0)/cs)));
  return {ok:true,N,cs,x0,z0,x:0,z:50,wind:[1,0],arrive,order,at:(x,z)=>arrive[near(x,z)],
    range:(t0,t1)=>{const lo=t=>{let a=0,b=order.length;while(a<b){const m=(a+b)>>1;if(arrive[order[m]]<t)a=m+1;else b=m;}return a;};return [lo(t0),lo(t1)];}};})();
{const fh=H.fireHazard(RUN,{lit:100});
 ok('fireHazard: the box round the cells it took, at their middle',fh.at[0]===45&&fh.at[2]===50&&fh.hazard.shape.w===100&&fh.hazard.shape.d===10&&fh.hazard.stateFn==='KFIRE.run',fh.hazard.shape.w===90);
 ok('negative: a fire that did not take has no hazard',throws(()=>H.fireHazard({ok:false,why:'rock'})),throws(()=>H.fireHazard(RUN)));
 const fr=G2.add({'class':'feature',kind:'fire',name:'A grass fire',at:fh.at,tags:{hazard:fh.hazard}});
 ok('unbound, a fire record is unlit and harms nothing',H.state(fr,150).state==='unlit'&&H.dose(fr,0,50,150)===0,H.state(fr,150).k>0);
 H.bindFire(fr,RUN);
 const s=(x,t)=>H.state(fr,t,null,x,50);
 ok('at a point: unburnt, burning (30 s), smouldering (400 s at .3), burnt',s(40,139).state==='unburnt'&&s(40,141).state==='burning'&&s(40,141).k===1&&s(40,175).state==='smouldering'&&s(40,175).k===.3&&s(40,600).state==='burnt'&&s(40,600).k===0,s(40,139).k>0);
 ok('its dose follows the front',H.dose(fr,40,50,141)===5&&H.dose(fr,40,50,139)===0&&H.dose(fr,90,50,141)===0,H.dose(fr,40,50,139)>0);
 ok('with no point: the worst on it now',H.state(fr,150).state==='burning'&&H.state(fr,99).state==='unlit'&&H.state(fr,100+90+30+100).state==='smouldering'&&H.state(fr,2000).state==='burnt',H.state(fr,2000).k>0);
 ok('radiant heat from the nearest burning cell, inside the box or out',Math.abs(H.dose(fr,40,58,141)-Math.pow(1-8/10,2))<1e-9&&H.dose(fr,40,58,139)===0&&Math.abs(H.dose(fr,48,50,141)-.04)<1e-9&&H.at(48,50,141,null,G2)[0].radiant&&H.dose(fr,60,50,141)===0,H.dose(fr,40,58,139)>0);
 const fx=H.export(G2).records.find(r=>r.id===fr.id);
 ok('export: a bound fire carries its front (grid, cells, arrivals) and its hazard.fire',fx.front&&fx.front.cells.length===10&&fx.front.arrive[3]===30&&fx.hazard.fire.lit===100&&fx.hazard.stateFn==='KFIRE.run',!fx.front);
 ok('export: an older record carries no front',!H.export(G2).records.find(r=>r.id===flow.id).front,false);
 ok('bindFire refuses what is not a run',throws(()=>H.bindFire(fr,{}))&&throws(()=>H.bindFire({},RUN)),throws(()=>H.bindFire(fr,RUN)));
 H.bindFire(fr,null);ok('unbinding leaves it unlit',H.state(fr,150).state==='unlit',H.state(fr,150).state!=='unlit');
}
// the real KFIRE, when this tree has it (after the fire branch is merged)
if(fs.existsSync(C('biome/38-core-fire.js'))){eval(fs.readFileSync(C('biome/38-core-fire.js'),'utf8'));const KF=globalThis.KFIRE;
  const HI=KF.history({height:()=>0,burn:()=>1,R:300,cell:20,seed:7,wind:[1,0],fires:[],old:0}),run=KF.run(HI,{x:0,z:0,maxT:600});
  const fh=H.fireHazard(run,{lit:0}),G3=KT.create({build:'fire'}),r=G3.add({'class':'feature',kind:'fire',at:fh.at,tags:{hazard:fh.hazard}});H.bindFire(r,run);
  let agree=true;run.order.slice(0,50).forEach(c=>{const i=c%run.N,j=(c-i)/run.N,x=run.x0+i*run.cs,z=run.z0+j*run.cs;
    for(const t of [5,60,300,900]){const a=run.state(x,z,t),b=H.state(r,t,null,x,z).state;if(a!==b)agree=false;}});
  ok('the state at a point is KFIRE.run\'s own, cell for cell',agree&&run.ok,!run.ok);}
else console.log('skip  the real KFIRE (core/biome/38-core-fire.js is not in this tree yet)');

// luck: strength by time inside, and the walker's exposure
const O=KT.create({build:'outlands-test'});
const ring=O.add({'class':'feature',kind:'ring',name:'The keep-out ring',at:[0,0,0],r:100,h:40,tags:{hazard:{kind:'luck'},taboo:{of:null,why:'the trickster\'s house'}}});
const ring2=O.add({'class':'feature',kind:'ring',name:'A Peak shrine',at:[500,0,0],r:20,tags:{taboo:{of:['coyote-peak'],why:'a Peak shrine'},culture:'coyote-peak'}});
{const h=H.of(ring);
 ok('luck soaks: from 0 at entering, full after 600 s',h.soak.full===600&&H.dose(ring,0,0,0,null,0)===0&&Math.abs(H.dose(ring,0,0,0,null,300)-.025)<1e-12&&H.dose(ring,0,0,0,null,6000)===.05,H.dose(ring,0,0,0,null,0)>0);
 ok('negative: a hazard with no soak ignores the time inside',H.dose(pool,10,0,0,null,0)===H.dose(pool,10,0,0,null,999),false);
 const E=H.exposure(O);for(let i=0;i<300;i++)E.step(0,0,i,1);
 ok('exposure: 300 s inside counts 300 s, and at() grows with it',E.tIn(ring.id)===300&&Math.abs(E.step(0,0,300,0)[0].dose-.025)<1e-12,E.tIn(ring.id)===0);
 for(let i=0;i<600;i++)E.step(1000,0,i,1);
 ok('exposure: outside it is forgotten at full/out a second (600 s outside clears 300 s)',E.tIn(ring.id)===0,E.tIn(ring.id)>0);
 for(let i=0;i<100;i++)E.step(0,0,i,1);for(let i=0;i<100;i++)E.step(1000,0,i,1);
 ok('exposure: 100 s inside, 100 s out leaves 50',E.tIn(ring.id)===50,E.tIn(ring.id)===0);}

// taboo: the area a people will not build in
ok('core/tags takes a taboo object',KT.norm({taboo:{of:null}}).problems.length===0,KT.norm({taboo:'cursed'}).problems.length===0);
ok('taboo: checked and filled',H.taboo(ring).of===null&&H.taboo(ring).why==='the trickster\'s house'&&H.taboo(ring2).of[0]==='coyote-peak',H.taboo(pool)!==null);
ok('taboo: a bad one is refused',throws(()=>H.taboo({tags:{taboo:{of:'coyote'}}}))&&throws(()=>H.taboo({tags:{taboo:{shape:{type:'cone'}}}}))&&throws(()=>H.taboo({tags:{taboo:{shape:{type:'poly',pts:[[0,0]]}}}})),throws(()=>H.taboo(ring)));
ok('forbids: every people inside the ring, by culture or by record',H.forbids(10,0,'coyote-sunset',O).length===1&&H.forbids(10,0,{tags:{culture:'tierhound'}},O)[0]===ring,H.forbids(150,0,'coyote-sunset',O).length);
ok('forbids: a record of no people is not barred (a plant, a rock)',H.forbids(10,0,null,O).length===0&&H.forbids(10,0,{tags:{biome:'outlands'}},O).length===0,H.forbids(10,0,'x',O).length===0);
ok('forbids: an `of` list bars only its own',H.forbids(500,0,'coyote-peak',O).length===1&&H.forbids(500,0,'coyote-valley',O).length===0,H.forbids(500,0,'coyote-valley',O).length);
ok('forbids: a faction tag wins over the culture',H.forbids(500,0,{tags:{culture:'coyote-valley',faction:'coyote-peak'}},O).length===1,H.forbids(500,0,{tags:{culture:'coyote-peak',faction:'coyote-valley'}},O).length);
{const okP=H.tabooOk('coyote-valley',O);
 ok('tabooOk: a point, a disc whose rim reaches in, and outside',okP([0,0])===false&&okP({x:105,z:0,r:10})===false&&okP({x:115,z:0,r:10})===true,okP([200,0])===false);
 const box=(cx,cz,hw,hd)=>({c:[cx,cz],u:[1,0],v:[0,1],hw,hd});
 ok('tabooOk: core/city\'s footprint, by its corners and edges',okP(box(105,0,8,8))===false&&okP(box(120,0,8,8))===true,okP(box(120,0,8,8))===false);
 ok('tabooOk: a footprint that holds a whole small taboo is barred',H.tabooOk('coyote-peak',O)(box(500,0,60,60))===false&&H.tabooOk('coyote-valley',O)(box(500,0,60,60))===true,false);}
{const s=O.add({'class':'building',kind:'hut',at:[30,0,0],tags:{culture:'coyote-valley'}}),tree=O.add({'class':'flora',kind:'tree',at:[20,0,0]});
 const A=H.tabooAudit(O);
 ok('tabooAudit: the hut in the ring is listed, the tree and the shrine (its own people\'s, itself a taboo) are not',A.length===1&&A[0].id===s.id&&A[0].taboo===ring.id,A.some(a=>a.id===tree.id||a.id===ring2.id));}
{const ex=H.export(O),exT=H.export(T);
 ok('export: the areas, filled with their world shape',ex.areas.length===2&&ex.areas[0].taboo.of===null&&ex.areas[0].shape.type==='cyl'&&ex.areas[0].shape.r===100&&ex.areas[1].taboo.of[0]==='coyote-peak',!ex.areas);
 ok('export: a page with no taboo has no areas key (its export unchanged)',!('areas' in exT),'areas' in exT);
 ok('export: the luck record carries its soak',ex.records[0].hazard.soak.out===1200,false);}

// it may load first on a page: what it needs is looked up at first use, and its absence is said then
{const vm=require('vm'),c={};c.globalThis=c;vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(__dirname,'20-core-hazard.js'),'utf8'),c);
 let msg='';try{c.KHAZ.make({kind:'heat'});}catch(e){msg=e.message;}
 ok('loaded alone it waits, and says what is missing at first use ('+msg+')',/core\/rand/.test(msg),msg==='');
 ['rand/08-core-rand.js','tags/50-core-tags.js','tags/52-core-tags-vocab.js','biome/37-core-traps.js'].forEach(f=>vm.runInContext(fs.readFileSync(C(f),'utf8'),c));
 ok('the same page works once they load after it',c.KHAZ.make({kind:'heat'}).effect==='burn',false);}
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
