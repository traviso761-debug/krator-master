// ================================================================= PAINTED HIGHLANDS — the bloom's calendar and its drifts (PLAN.md section 4)  [G data]
// The bloom runs on the world clock's season (core/clock: KCLOCK.season, the phase of the local year, 0 at midsummer, .5 at midwinter, .75 the spring
// equinox in the south): the cold months over 3 km are under freezing, so the winter falls as snow; it melts in spring, the flats flush green and
// flower in drifts, then seed, then straw by late summer, then snow again. Plain numbers, no THREE: Godot reads the same table.
//   PAINTED_BLOOM.at(day, hour) -> {phase, name, snow, melt, green, flower, seed, straw, dry, stage}
//       each 0..1 (dry = 1 - green: the page's BIO.SEASON, which thins the flower cards and turns the grass to straw); stage the one that leads
//   PAINTED_BLOOM.day(stage)    a clock day at which that stage leads (the page's season select)
//   PAINTED_BLOOM.FLOWERS       the nine flowers of the bloom: their card cell (card.flower.bloom.highland, 3x3) and their Earth model
//   PAINTED_BLOOM.DRIFT         each strata kind -> the flowers its clay favours (the drifts echo the stripes: PLAN.md section 8, amendment 2,
//                               a kit-side mask read from KSTRATA's bed at the ground)
//   PAINTED_BLOOM.flowerFor(kind, u)   one flower index for a bed kind, u in 0..1 (a KRAND unit)
var PAINTED_BLOOM=(function(){
 const c01=v=>v<0?0:v>1?1:v,sm=(a,b,v)=>{const t=c01((v-a)/(b-a));return t*t*(3-2*t);};
 const YEAR=(typeof KCLOCK!=='undefined'&&KCLOCK.YEAR)||{yearD:365,startDay:259,solsticeDay:350};
 // the calendar on the phase (0 midsummer): snow lies from late autumn to the equinox; the melt and the green flush through spring; the flowers peak
 // six weeks after the equinox (phase .8); seed into early summer; straw through the summer and autumn
 const CAL={snow:[.33,.42,.68,.74],melt:[.68,.73,.76,.8],green:[.71,.78,.9,.98],flower:[.74,.79,.83,.9],seed:[.84,.9,.98,1.04],straw:[.94,1.02,1.3,1.36]};
 const win=(p,w)=>{const q=p<w[0]-.2?p+1:p;return sm(w[0],w[1],q)*(1-sm(w[2],w[3],q));};
 function at(day,hour){
  const s=typeof KCLOCK!=='undefined'&&KCLOCK.season?KCLOCK.season(day,hour):{phase:((YEAR.startDay+(+day||0)+(+hour||0)/24-YEAR.solsticeDay)/YEAR.yearD%1+1)%1,name:'?'};
  const p=s.phase,o={phase:p,name:s.name};for(const k in CAL)o[k]=c01(win(p,CAL[k]));
  o.dry=c01(1-o.green);let best='straw',bv=-1;for(const k of ['snow','melt','flower','green','seed','straw'])if(o[k]>bv+.02){bv=o[k];best=k;}
  o.stage=best==='green'?'melt':best==='flower'?'bloom':best;return o;}
 const PH={snow:.55,melt:.745,bloom:.8,seed:.93,straw:.15};
 function day(stage){const p=PH[stage]==null?.8:PH[stage];return Math.round(((YEAR.solsticeDay+p*YEAR.yearD-YEAR.startDay)%YEAR.yearD+YEAR.yearD)%YEAR.yearD);}
 // the nine flowers of card.flower.bloom.highland (rows top to bottom, columns left to right), renamed as each kit does; working names, proposed
 const FLOWERS=[
  {i:0,key:'skylupin',name:'Sky lupin',model:'lupin (Great Basin)',col:0x5a6ad0},
  {i:1,key:'scarletbeard',name:'Scarlet beardtongue',model:'penstemon',col:0xd03a30},
  {i:2,key:'embermallow',name:'Ember mallow',model:'globe mallow',col:0xe8743a},
  {i:3,key:'paintbrush',name:'Painter\'s brush',model:'Indian paintbrush (the Painted Men\'s medicine)',col:0xe0482a},
  {i:4,key:'ravenspike',name:'Raven spike',model:'blazing star',col:0x8a4a9a},
  {i:5,key:'meltdandelion',name:'Melt dandelion',model:'desert dandelion',col:0xf0d040},
  {i:6,key:'snowprimrose',name:'Snow primrose',model:'evening primrose',col:0xf4f0e0},
  {i:7,key:'stripedaisy',name:'Stripe daisy',model:'Namaqualand daisy',col:0xf0902a},
  {i:8,key:'guanacofoot',name:'Guanaco foot',model:'pata de guanaco (the Atacama)',col:0xa070c8}];
 // each bed's clay favours its own flowers (the drift's species read from KSTRATA's bed at the ground): pink clays the reds, the cream and ash the
 // pale primrose, the gold the yellows, the grey and green-grey the blues, the maroon and mauve the purples; the danxia's red sand the oranges
 const DRIFT={pink:[1,3,1],cream:[6,6,5],gold:[5,2,5],grey:[0,0,4],maroon:[8,4],mauve:[8,4,0],greengrey:[0,6],teal:[0,8],ash:[6],lignite:[4,8],
  red:[2,7,2],orange:[7,2],yellow:[5,7],white:[6,0],conglomerate:[1,3],parting:[3,8]};
 function flowerFor(kind,u){const L=DRIFT[kind]||[0,1,2,3,4,5,6,7,8];return L[Math.min(L.length-1,Math.floor(c01(u)*L.length))];}
 return {CAL,at,day,FLOWERS,DRIFT,flowerFor,YEAR};})();
