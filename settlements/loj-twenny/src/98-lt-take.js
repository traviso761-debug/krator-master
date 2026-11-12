// ================================================================= LOJ TWENNY: THE TAKE (core/host with the underground pieces)
// [web] The follow camera (V) on the cavern's own distance field; the deck cut (X, ] [) over the hold's three decks, the rock cut
// (H: every void open 2 m over its own floor), the band (U) and the section (C); the map's deck band and THE LINE MAP (L): the
// hold as a station at the end of its branch, the junction on the Line, the great shaft up to the Ice-cutters, the gaps; the
// stocks panel (O) from SIM; F walks, and walking through an open door of the shuttle boards it (E by a seat sits).
// The views are the walk-through of kits/tungang/PLAN.md 5.5 "A line loj", in its order.
const LT_SOLID=KHOST.solidFrom({cavern:LTC.C,walk:KWALK});
const LT_VIEWS={
 'The night mouth - the climb down to the hooded lamp and the door':[126.4,10.8,-65.4,115.5,7.4,-65.4],
 'The platform under its vault, the green lamps':[12,3.7,-7.2,95,4.2,-3.5],
 'The shuttle at the platform':[64,4.2,8.6,84,2.6,-3],
 'A siding of homes - cream over green, the numbers, the red lamps':[115,8.1,-21,115,7.4,-50],
 'The dark beds - the pale fungus in amber light':[36.6,-.9,27.4,46,-1.8,27.4],
 'The loj hall - the banner wall and the count wall':[160.8,5.6,4.2,173.6,3.4,-.4],
 'The doors and the branch west':[24,4.2,2.5,-40,3,0],
 'The hold cut open (the rock cut, H)':[132,30,34,128,2,2],
 'The carriage siding':[69,4.2,-13,69,3,-40],
 'The last stop (sealed)':[83,3.6,30,90,2.6,44]};
const LT_LINE={title:'Loj Twenny on the Line: the branch to the Twenny junction (25 km), the great shaft to the fells',lines:{line:'#46c27a',branch:'#7ad89a',shaft:'#e8e8e8',gap:'#c24a3a'},
 nodes:[{id:'shelf',name:'2 Shelf',kind:'station',x:-60,depth:0},{id:'jn',name:'3 the Twenny junction',kind:'junction',x:0,depth:0},{id:'ledge',name:'4 Ledge (Loj Fower)',kind:'station',x:50,depth:0},
  {id:'g2',name:'G2 (the fallen chamber)',kind:'gap',x:30,depth:0},{id:'head',name:'the great shaft\'s head (the Ice-cutters)',kind:'lift',x:0,depth:-2200},{id:'lt',name:'20 Loj Twenny',kind:'loj',x:25,depth:-40}],
 edges:[{a:'shelf',b:'jn',line:'line'},{a:'jn',b:'g2',line:'line'},{a:'g2',b:'ledge',state:'gap',time:210},{a:'jn',b:'lt',line:'branch',time:30},{a:'jn',b:'head',line:'shaft',time:600}]};
var LTRIDE=null;
const LTH=KHOST.take({build:'loj-twenny',title:'Loj Twenny',
 hint:'the first Tungang hold (20), at the end of the branch from the Twenny junction · V follow · X deck cut, ] [ deck · H rock cut · U band · C section · M map · L line map · O stocks · F walk; walk through an open door to board the shuttle, E sits',
 scene,camera,renderer,ground:()=>-60,clear:.3,minR:.5,maxR:600,
 walk:KWALK,walker:{step:.6,r:.28,h:1.6},eye:1.6,
 views:LT_VIEWS,start:'The platform under its vault, the green lamps',
 clock:{obj:LTCLOCK,speeds:[0,1,2,4,8,16,60]},
 solid:LT_SOLID,follow:{dist:4},
 cutaway:{units:[{id:'hold',name:'Loj Twenny',x:80,z:0,w:260,d:240,levels:LT.DECKS.slice().reverse().map(d=>({y:d.y,h:4.5,name:d.name}))}],cutAt:2.3,
  caps:{color:'#3a2f28'},decks:{fog:{opacity:.55}},band:{above:2.2,soft:1},section:{slab:6},rock:{above:2}},
 minimap:{frame:[-60,200,-120,120],size:280,relief:false,title:'Loj Twenny',decks:{bands:LT.DECKS.slice().reverse().map(d=>({y0:d.y-1,y1:d.y+3.5,name:d.name}))},schematic:LT_LINE},
 holds:KHOST.simHolds?KHOST.simHolds(SIM):undefined,
 registry:LT.plan().sites.filter(s=>s.tier==='civic'||/loj-hall|signal|doors|night|last/.test(s.key)).map(s=>({name:TG.DEFS[s.key]?TG.DEFS[s.key].name:s.key,x:s.x,y:s.y+1,z:s.z,r:8,h:6})),
 stats:()=>{const W=LT_LIFE.wallRead||{},t=LTCLOCK.t,d=SIM.rideDwellAt('lt.shuttle',t),S=LT_LIGHT.CL.state||{},R=LTRIDE?LTRIDE.state():{};
  const turn=LTS.turns.length?LTS.turns[LTS.turns.length-1]:null;
  return 'day '+LTCLOCK.day+' '+String(Math.floor(LTCLOCK.hour)).padStart(2,'0')+':'+String(Math.floor(LTCLOCK.hour%1*60)).padStart(2,'0')+(turn?'  turn '+turn.turn:'')+
   '\nthe shuttle: '+(d?'at '+(d.stop==='lt'?'Loj Twenny':'the junction')+(d.open?' (doors open)':''):'running')+(R.aboard?'  you: aboard':'')+
   '\nthe count wall: fungus '+W.fungus+' grain '+W.grain+' wax '+W.wax+' ore '+W.ore+' plate '+W.plate+' ice '+W.ice+(W.hands?'  hands '+W.hands:'')+
   '\n'+(LT_LIFE.shown||0)+' people about of '+LTS.people()+'; rock '+LT_DRAW.tris+' tris; lights '+LT_LIGHT.n+' (pool '+(S.pool||0)+')';},
 api:{lt:{LT,LTS,LTR,LTC,LT_HOLD,LT_LIFE,LT_LIGHT,solid:LT_SOLID}}});
LTRIDE=KHOST.ride?KHOST.ride(LTH,{walk:KWALK,t:()=>LTCLOCK.t,reach:3,seats:F=>{const fr=LT_LIFE.L.frames.find(q=>q.F===F);return fr?fr.car.ride.seats:[];}}):null;
let ltWallT=0;
LTH.on(function ltLife(dt,clock){LT_LIFE.tick(clock.t);},'tick');
LTH.on(function ltDraw(dt,clock){ltTrainDraw(clock.t);LT_LIFE.draw(clock.t);LT_LIGHT.CL.update(clock.t);
 if(LT_LIFE.wall&&clock.t-ltWallT>2){ltWallT=clock.t;LT_LIFE.wall.paint();}},'view');
window._api=window._api||{};window._api.lt=Object.assign(window._api.lt||{},{checks:()=>LTCHK.run(),negatives:()=>LTCHK.negatives()});
