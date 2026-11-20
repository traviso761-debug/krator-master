// ---------- Mount Hood: the year ----------
// The mountain is a different place in each month: in January the snow lies down to the Zigzag and the Hood River
// valleys and the lakes are frozen; in July Paradise Park and Elk Cove are in flower a few hundred metres under the
// melting snow; by September the glaciers are bare blue ice and grey rubble and the snow is at its highest; in
// October the huckleberry and vine maple go red on the ridges, then the larches and the maples in the valleys go
// yellow, and the first snow comes back to the summit.
//
// This keeps the date (a day of the year, `doy`, 0 = 1 January) and turns it into numbers every other part reads:
//   snowLine   the lowest the snowpack lies, metres above sea level (the south side's; north faces hold it lower)
//   glacier    how much of the glaciers' ice is under the winter's snow (1) or bare (0)
//   bloomH     the height the meadows flower at (a few hundred metres under the melting snow), and bloom, how much
//   autumn     the shrubs' and meadows' red (huckleberry, vine maple, mountain ash), 0..1
//   turn, leaf the deciduous trees' colour (green to yellow, 0..1) and their leaves (on 1, off 0)
//   cure       the meadows curing from green to gold in late summer
//   iceAt(h)   how frozen a lake at height h is (Trillium Lake at 1095 m: December to March)
//   fresh      fresh snow from the weather (src/core/weather.js calls ctx.ground.winter), whitening everything
// and the sun: its real path at 45.37 deg N on the day (ctx.sunAt, ctx.dayC, read by the engine's sky), from the
// declination and the equation of time, on Pacific time (daylight saving from the second Sunday of March to the first
// Sunday of November). The weather's odds follow the season (setWeights): snow in winter, clear skies and
// thunderstorms in summer, smoke haze in August, rain in autumn.
// The Season button: the four seasons, a slider through the year, and "Turn the year" (a year in six minutes).
// The address: #doy=200, #month=7 or #season=winter (spring, summer, autumn) opens on that day; the page otherwise
// opens on today's date. #turn starts the year turning, #seasonui opens the panel. None of this is in the layout fingerprint.
import {mergeHash} from '../core/hash.js';

const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
const MDAY=[0,31,59,90,120,151,181,212,243,273,304,334];
// the snow line through the year at mid-month (metres above sea level): the south side's snowpack, from the SNOTEL
// sites (Mt Hood Test Site 1637 m, Red Hill 1347 m, Blazed Alder 1110 m) and the lifts' seasons
const SNOWLINE=[750,760,860,1050,1350,1700,2150,2600,2820,2450,1350,950];
const lerpCyc=(tab,doy)=>{const m=((doy-14)/30.42+12)%12,i=Math.floor(m),f=m-i,a=tab[(i+11)%12],b=tab[i],c=tab[(i+1)%12],d=tab[(i+2)%12];
  return b+0.5*f*(c-a+f*(2*a-5*b+4*c-d+f*(3*(b-c)+d-a)));};   // Catmull-Rom through the months, round the year
const sm=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
const bump=(a,b,c,d,x)=>sm(a,b,x)*(1-sm(c,d,x));

export function season(api){
  const {THREE,C,animHooks,HASH0}=api;const K=C.season||{};
  const LAT=(C.origin||[45.37])[0]*Math.PI/180,LON=(C.origin||[0,-121.7])[1];
  const q=new URLSearchParams(HASH0||'');
  const NAMED={winter:20,spring:120,summer:205,autumn:285,fall:285};
  let doy=(()=>{if(q.has('doy'))return ((+q.get('doy')||0)%365+365)%365;if(q.has('month')){const m=Math.max(1,Math.min(12,+q.get('month')||1));return MDAY[m-1]+14;}
    if(q.has('season')&&NAMED[q.get('season')]!=null)return NAMED[q.get('season')];
    if(K.start!=null)return K.start;const d=new Date();return MDAY[d.getMonth()]+d.getDate()-1;})();
  let turning=q.has('turn'),yearMin=K.yearMinutes||6,fresh=0;
  // the shared uniforms every seasonal material reads (ground.js, the trees, the buildings' roofs)
  const U={uSnowLine:{value:2000},uGlacier:{value:1},uBloom:{value:0},uBloomH:{value:1800},uAutumn:{value:0},uTurn:{value:0},uLeaf:{value:1},uCure:{value:0},uFresh:{value:0},uDoy:{value:0}};
  const S={U,get doy(){return doy;},snowLine:2000,glacier:1,bloom:0,bloomH:1800,autumn:0,turn:0,leaf:1,cure:0,fresh:0,
    listeners:[],on(fn){this.listeners.push(fn);fn(this);},
    set(d){doy=((d%365)+365)%365;update(true);},
    get turning(){return turning;},setTurning(on){turning=!!on;update(true);},
    // how frozen a lake at h metres is: ice once the snow has lain well below it for a while; it goes out in spring
    iceAt(h){const cold=sm(h-60,h-260,S.snowLine),win=doy>=340||doy<=105?1:doy<340&&doy>310?sm(310,340,doy):sm(125,105,doy);return Math.max(0,Math.min(1,cold*win));},
    snowAt(h,north){return sm(S.snowLine-(north?250:0)-120,S.snowLine-(north?250:0)+120,h);},
    // what is going on: the lifts (Timberline's Palmer into late summer), climbing season, hiking
    get lifts(){return doy>=325||doy<=130?1:doy>130&&doy<245?0.5:0;},   // 0.5: Timberline's summer skiing on the Palmer Snowfield only
    get climbing(){return bump(90,120,175,200,doy);},get hiking(){return bump(160,190,280,300,doy);},get skiing(){return S.lifts;},
    label(){const d=Math.floor(doy),m=MDAY.findIndex((v,i)=>d>=v&&(i===11||d<MDAY[i+1]));return (d-MDAY[m]+1)+' '+MONTHS[m];},
    name(){return doy<59||doy>=334?'Winter':doy<151?'Spring':doy<243?'Summer':'Autumn';},
    month(){return MDAY.findIndex((v,i)=>doy>=v&&(i===11||doy<MDAY[i+1]));}};
  api.ctx.season=S;

  // ---- the sun on the day: declination, the equation of time, Pacific time with daylight saving ----
  const dst=d=>{const y=new Date().getFullYear(),sun2=(m,n)=>{const f=new Date(y,m,1).getDay(),day=1+((7-f)%7)+7*(n-1);return MDAY[m]+day-1;};return d>=sun2(2,2)&&d<sun2(10,1);};
  function sunFor(d){const g=2*Math.PI*(d+0.5)/365,decl=0.006918-0.399912*Math.cos(g)+0.070257*Math.sin(g)-0.006758*Math.cos(2*g)+0.000907*Math.sin(2*g)-0.002697*Math.cos(3*g)+0.00148*Math.sin(3*g),
      eot=229.18*(0.000075+0.001868*Math.cos(g)-0.032077*Math.sin(g)-0.014615*Math.cos(2*g)-0.040849*Math.sin(2*g));
    // the clock's hour to the sun's: Pacific time is the 120th meridian's; the mountain is 1.7 deg west of it
    const off=(LON+120)/15+eot/60-(dst(d)?1:0);
    const at=h=>{const H=((h+off)-12)*Math.PI/12,cd=Math.cos(decl),E=-cd*Math.sin(H),N=Math.sin(decl)*Math.cos(LAT)-cd*Math.sin(LAT)*Math.cos(H),Up=Math.sin(decl)*Math.sin(LAT)+cd*Math.cos(LAT)*Math.cos(H);
      return new THREE.Vector3(E,Up,-N).normalize();};
    const w=Math.acos(Math.max(-1,Math.min(1,(Math.sin(-0.833*Math.PI/180)-Math.sin(LAT)*Math.sin(decl))/(Math.cos(LAT)*Math.cos(decl)))))*12/Math.PI,noon=12-off,rise=noon-w,set=noon+w;
    return {at,rise,set,noon,decl};}
  let SUN=sunFor(doy);
  api.ctx.sunAt=h=>SUN.at(h);
  const setDay=()=>{api.ctx.dayC={dawn:[SUN.rise-0.7,SUN.rise+1.0],dusk:[SUN.set-1.0,SUN.set+0.7],glow:[SUN.rise+0.25,SUN.set-0.1]};};setDay();

  // ---- the weather's odds by season (src/core/weather.js setWeights) ----
  const WEIGHTS={Winter:{clear:1.5,fair:1.5,cloud:3,drizzle:0.3,rain:0.6,fog:1.5,mist:1,snow:4.5},
    Spring:{clear:2,fair:3,cloud:2,drizzle:1.5,rain:2,mist:1,fog:0.5,snow:1.5,storm:0.2},
    Summer:{clear:6,fair:4,haze:1.2,cloud:0.5,storm:0.7,mist:0.3},
    Autumn:{clear:1.5,fair:2,cloud:3,drizzle:2,rain:3,fog:2,mist:1.5,snow:1,storm:0.2}};
  let wName='';

  function update(force){
    const d=doy;S.snowLine=Math.max(500,lerpCyc(SNOWLINE,d)-fresh*500);
    // the glaciers under the winter's snow from late October to June; bare by August
    S.glacier=d<150||d>290?1:d<=235?1-0.88*sm(150,225,d):0.12+0.88*sm(262,300,d);
    S.bloom=bump(150,175,232,255,d);S.bloomH=Math.min(2150,S.snowLine-330);
    S.autumn=bump(240,268,300,318,d);S.cure=bump(205,245,300,330,d);
    S.turn=sm(268,295,d);S.leaf=d<115?0:d<150?sm(115,150,d):1-sm(292,318,d);
    S.fresh=fresh;
    U.uSnowLine.value=S.snowLine;U.uGlacier.value=S.glacier;U.uBloom.value=S.bloom;U.uBloomH.value=S.bloomH;U.uAutumn.value=S.autumn;
    U.uTurn.value=S.turn;U.uLeaf.value=S.leaf;U.uCure.value=S.cure;U.uFresh.value=fresh;U.uDoy.value=d;
    SUN=sunFor(d);setDay();
    const W=api.ctx.weather,nm=S.name();if(W&&W.setWeights&&nm!==wName){wName=nm;W.setWeights(WEIGHTS[nm]);}
    if(force||Math.floor(d)!==S._shown){S._shown=Math.floor(d);for(const f of S.listeners)try{f(S);}catch(e){api.report&&api.report('season',e);}showUI();}
    api.ctx.details=Object.assign(api.ctx.details||{},{season:{doy:Math.round(d),label:S.label(),snowLine:Math.round(S.snowLine),glacier:+S.glacier.toFixed(2),bloom:+S.bloom.toFixed(2),autumn:+S.autumn.toFixed(2),leaf:+S.leaf.toFixed(2),sunrise:+SUN.rise.toFixed(2),sunset:+SUN.set.toFixed(2)}});}
  // ctx.ground.winter(k) is how the weather says snow has fallen (0..0.8): ground.js passes it on here
  S.freshSnow=k=>{fresh=Math.max(0,Math.min(1,k));};

  let last=performance.now(),acc=0,hashT=0;
  animHooks.push(now=>{const dt=Math.min(0.1,(now-last)/1000);last=now;
    if(turning){doy=(doy+dt*365/(yearMin*60))%365;}
    acc+=dt;if(acc>0.25||turning){acc=0;update(false);}
    if(now-hashT>2000){hashT=now;try{history.replaceState(null,'',mergeHash({doy:Math.round(doy),month:null,season:null,turn:turning?true:null})||location.pathname+location.search);}catch(e){}}});

  // ---- the Season button ----
  let head=null,slider=null,turnB=null;const qb={};
  function showUI(){if(!head)return;head.innerHTML='';const b=document.createElement('b');b.textContent=S.label();head.appendChild(b);
    head.appendChild(document.createTextNode(' — '+describe()));
    if(slider&&document.activeElement!==slider)slider.value=String(Math.round(doy));
    if(turnB){turnB.textContent=turning?'Stop the year':'Turn the year';turnB.setAttribute('aria-pressed',String(turning));}
    for(const [k,b2] of Object.entries(qb))b2.setAttribute('aria-pressed',String(S.name()===k));}
  function describe(){const sl=Math.round(S.snowLine/10)*10,ft=Math.round(S.snowLine*3.281/100)*100,bits=[];
    bits.push(S.snowLine>2500?'the snow at its highest, only the glaciers and the summit white':('snow down to about '+sl+' m ('+ft.toLocaleString()+' ft)'));
    if(S.iceAt(1095)>0.5)bits.push('Trillium Lake frozen');if(S.bloom>0.4)bits.push('the meadows in flower near '+Math.round(S.bloomH/10)*10+' m');
    if(S.autumn>0.4)bits.push('huckleberry and vine maple red');if(S.turn>0.5&&S.leaf>0.2)bits.push('the larches and maples yellow');
    if(S.glacier<0.3)bits.push('the glaciers bare ice');
    bits.push(S.lifts>=1?'the lifts running':S.lifts>0?'summer skiing on the Palmer Snowfield':'the ski lifts still');
    if(S.climbing>0.5)bits.push('climbing season on the South Side');
    bits.push('sunrise '+fmt(SUN.rise)+', sunset '+fmt(SUN.set));return bits.join('; ')+'.';}
  const fmt=h=>{const H=Math.floor(h),M=Math.round((h-H)*60);return (M===60?H+1:H)+':'+String(M%60).padStart(2,'0');};
  api.onUI&&api.onUI(({ui,mkBtn})=>{
    const panel=document.createElement('div');panel.id='seasonpanel';
    panel.style.cssText='position:fixed;left:10px;bottom:calc(var(--barh,44px) + 14px);z-index:11;display:none;flex-direction:column;gap:6px;width:min(380px,calc(100vw - 36px));background:rgba(10,16,24,.88);border:1px solid #5a7890;padding:10px;font:13px/1.4 Georgia,serif;color:#e4ecf2';
    head=document.createElement('div');panel.appendChild(head);
    const row=document.createElement('div');row.style.cssText='display:flex;gap:4px;flex-wrap:wrap';panel.appendChild(row);
    for(const [k,d] of [['Winter',20],['Spring',135],['Summer',210],['Autumn',283]])qb[k]=mkBtn(k,row,()=>{turning=false;S.set(d);});
    slider=document.createElement('input');slider.type='range';slider.min='0';slider.max='364';slider.step='1';slider.value=String(Math.round(doy));slider.setAttribute('aria-label','Day of the year');
    slider.addEventListener('input',()=>{turning=false;S.set(+slider.value);});panel.appendChild(slider);
    const ticks=document.createElement('div');ticks.style.cssText='display:flex;justify-content:space-between;font-size:10px;opacity:.7';for(const m of MONTHS){const s2=document.createElement('span');s2.textContent=m[0];ticks.appendChild(s2);}panel.appendChild(ticks);
    const row2=document.createElement('div');row2.style.cssText='display:flex;gap:4px;flex-wrap:wrap';panel.appendChild(row2);
    turnB=mkBtn('Turn the year',row2,()=>S.setTurning(!turning));mkBtn('Today',row2,()=>{turning=false;const t=new Date();S.set(MDAY[t.getMonth()]+t.getDate()-1);});
    document.body.appendChild(panel);
    const b=mkBtn('Season',ui,()=>{const o=panel.style.display==='none';panel.style.display=o?'flex':'none';b.setAttribute('aria-expanded',String(o));});
    b.setAttribute('aria-expanded','false');if(q.has('seasonui')){panel.style.display='flex';b.setAttribute('aria-expanded','true');}   // #seasonui opens it
    b.title='The time of year: the snow, the flowers, the autumn, the lakes’ ice, the sun’s path, the lifts';showUI();});
  update(true);
  return S;
}
