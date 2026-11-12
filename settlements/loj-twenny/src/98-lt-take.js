// ================================================================= LOJ TWENNY: THE TAKE (core/host with the underground pieces)
// [web] The follow camera (V) on the cavern's own distance field; the deck cut (X, ] [) over the hold's three decks, the rock cut
// (H: every void open 2 m over its own floor), the band (U) and the section (C); the map's deck band and THE LINE MAP (L): the hold
// at station 3, Shelf north, the G2 gap and Ledge south, the great shaft up to the Ice-cutters; the stocks panel (O) from SIM; F walks,
// and walking through an open door of the segment's train boards it (E by a seat sits). The views are the walk-through of
// kits/tungang/PLAN.md 5.5 "A line loj", in its order.
const LT_SOLID=KHOST.solidFrom({cavern:CAVE_C,walk:KWALK});
const LT_VIEWS={
 'The night mouth - the climb down to the hooded lamp and the door':[-78,13.4,404.6,-78,9,418],
 'The platform under its vault, the green lamps':[19.2,3.7,306,14,4.2,440],
 'The train at the east platform':[-2,4.2,428,13.4,2.8,456],
 'A street of homes - cream over red, the numbers, the red lamps':[24.6,9.3,380,62,8.6,380],
 'The dark beds - the pale fungus in amber light':[-46.4,-1,563.6,-46.4,-1.8,575],
 'The loj hall - the banner wall and the count wall':[89.8,5.4,422.2,101.6,3.2,417.6],
 'The loj\'s way - the gate and the carriage houses':[24.2,4.2,411,70,3,416],
 'The great shaft\'s foot - the hoist and the ice':[-12,4.4,520,-22,7,540],
 'The station from the east mezzanine - the platforms, the island, the shaft':[21,9.5,350,-12,2.2,480],
 'The last stop (sealed)':[-70,9.3,337.6,-70,8.6,344]};
const LT_LINE={title:'Loj Twenny (20) at station 3 of the Line, under the great shaft',lines:{line:'#46c27a',shaft:'#e8e8e8',gap:'#c24a3a'},
 nodes:[{id:'shelf',name:'2 Shelf',kind:'station',x:-80,depth:0},{id:'lt',name:'3 the Twenny junction: Loj Twenny',kind:'loj',x:0,depth:0},
  {id:'g2',name:'G2 (the fallen chamber)',kind:'gap',x:30,depth:0},{id:'ledge',name:'4 Ledge (Loj Fower)',kind:'station',x:60,depth:0},
  {id:'head',name:'the great shaft\'s head (the Ice-cutters)',kind:'lift',x:0,depth:-2200}],
 edges:[{a:'shelf',b:'lt',line:'line'},{a:'lt',b:'g2',line:'line',time:25},{a:'g2',b:'ledge',state:'gap',time:210},{a:'lt',b:'head',line:'shaft',time:300}]};
var LTRIDE=null;
const LTH=KHOST.take({build:'loj-twenny',title:'Loj Twenny',
 hint:'the first Tungang hold (20), at station 3 of the Line under the great shaft · V follow · X deck cut, ] [ deck · H rock cut · U band · C section · M map · L line map · O stocks · F walk; walk through an open door to board the train, E sits',
 scene,camera,renderer,ground:()=>-60,clear:.3,minR:.5,maxR:900,
 walk:KWALK,walker:{step:.6,r:.28,h:1.6},eye:1.6,
 views:LT_VIEWS,start:'The platform under its vault, the green lamps',
 clock:{obj:LTCLOCK,speeds:[0,1,2,4,8,16,60]},
 solid:LT_SOLID,follow:{dist:4},
 cutaway:{units:[{id:'hold',name:'Loj Twenny at station 3',x:0,z:450,w:240,d:480,levels:LT.DECKS.slice().reverse().map(d=>({y:d.y,h:d.i===0?5.8:4.5,name:d.name}))}],cutAt:2.3,
  caps:{color:'#3a2f28'},decks:{fog:{opacity:.55}},band:{above:2.2,soft:1},section:{slab:6},rock:{above:2}},
 minimap:{frame:[-120,120,220,680],size:280,relief:false,title:'Loj Twenny at station 3',decks:{bands:LT.DECKS.slice().reverse().map(d=>({y0:d.y-1,y1:d.y+3.5,name:d.name}))},schematic:LT_LINE},
 holds:KHOST.simHolds?KHOST.simHolds(SIM):undefined,
 registry:LT.plan().sites.filter(s=>s.tier==='civic'||/loj-hall|signal|doors|night|last|cistern|fan/.test(s.key)).map(s=>({name:TG.DEFS[s.key]?TG.DEFS[s.key].name:s.key,x:s.x,y:s.y+1,z:s.z,r:8,h:6})),
 stats:()=>{const W=LT_LIFE.wallRead||{},t=LTCLOCK.t,d=SIM.rideDwellAt('lt.train',t),S=LT_LIGHT.CL.state||{},R=LTRIDE?LTRIDE.state():{};
  const turn=LTS.turns.length?LTS.turns[LTS.turns.length-1]:null;
  return 'day '+LTCLOCK.day+' '+String(Math.floor(LTCLOCK.hour)).padStart(2,'0')+':'+String(Math.floor(LTCLOCK.hour%1*60)).padStart(2,'0')+(turn?'  turn '+turn.turn:'')+
   '\nthe segment\'s train: '+(d?'at '+(d.stop==='lt'?'station 3':'the G2 gap')+(d.open?' (doors open)':''):'running')+(R.aboard?'  you: aboard':'')+
   '\nthe count wall: fungus '+W.fungus+' grain '+W.grain+' wax '+W.wax+' ore '+W.ore+' plate '+W.plate+' ice '+W.ice+(W.hands?'  hands '+W.hands:'')+(W.happy!=null?'\nthe heart of the hold: happiness '+W.happy+', '+W.stage:'')+
   '\n'+(LT_LIFE.shown||0)+' people about of '+LTS.people()+'; rock '+LT_DRAW.tris+' tris; lights '+LT_LIGHT.n+' (pool '+(S.pool||0)+')';},
 api:{lt:{LT,LTS,LTR,LTC,LT_HOLD,LT_LIFE,LT_LIGHT,solid:LT_SOLID}}});
LTRIDE=KHOST.ride?KHOST.ride(LTH,{walk:KWALK,t:()=>LTCLOCK.t,reach:3,seats:F=>{const fr=LT_LIFE.L.frames.find(q=>q.F===F);return fr?fr.car.ride.seats:[];}}):null;
let ltWallT=0;
LTH.on(function ltLife(dt,clock){LT_LIFE.tick(clock.t);},'tick');
LTH.on(function ltDraw(dt,clock){ltTrainDraw(clock.t);LT_LIFE.draw(clock.t);LT_LIGHT.CL.update(clock.t);for(const f of LT_TICKS)f(dt,clock);
 if(LT_LIFE.wall&&clock.t-ltWallT>2){ltWallT=clock.t;LT_LIFE.wall.paint();}},'view');
window._api=window._api||{};window._api.lt=Object.assign(window._api.lt||{},{checks:()=>LTCHK.run(),negatives:()=>LTCHK.negatives()});
