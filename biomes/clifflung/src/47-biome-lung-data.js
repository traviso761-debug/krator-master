// ================================================================= CLIFF LUNGS — the breath, the bands, the yield and the layout as records (PLAN.md sections 3, 6, 9, 16 L1)  [G data]
// Plain functions on plain records: no THREE, no DOM, no Math.random, no sin hash. Every draw is core/rand's (KRAND.hash of (world, lung, index,
// salt)), never a count of the draws before it. Needs core/rand; LUNG.breath reads the cloud deck's day (core/atmos fx/89-atmos-fx-deckday.js,
// ATMOS.deckLevel) so the deck and the breath cannot disagree (PLAN.md section 14 item 5); KCLOCK.season (core/clock) gives the season when the
// weather does not. The host draws the records (72, 89l) and the station pages read them; tests/test-lung.js runs this file in node.
//
//   LUNG.breath(t, W) -> -1..1   THE ONE STATE of the biome at clock t (days: day + hour/24, the sky's t) and weather W {wet (the foot's saturation,
//        .9), cloud (0..1 sky cover, 0), wind (crest wind m/s, 7), summer (-1..1; else KCLOCK.season's)}. Two engines and a reversal (section 3):
//        the condensation engine (.3 at a saturated dawn, the deck's day times the foot's warmth), the solar chimney (the sun on the skin, through
//        the cloud), the crest wind's suction on any upward draught, and on clear winter nights the flue running backward (-.2 at most).
//        The noon draw is 1, dawn .3, dusk 0, a clear winter night -.2.
//   LUNG.engines(t, W)           {latent, solar, reverse, wind, b}: the parts (the inspector and the test read them)
//   LUNG.atmAt(y)                the model's air law, 1.6 exp(-y/8000) atm, y the altitude in metres (the stage's y is the altitude)
//   LUNG.bandAt(atm) -> {i, name, col:[r,g,b] sRGB 0..1, atm0, atm1}   THE PRESSURE BAND a ring is born in: 0.05 atm a band from 1.60 down,
//        i rising as the air thins; one function for every lung on the Wall (teal and violet at the wet foot, sage, rust, bone at the crest)
//   LUNG.yield(bore, W) -> m3 a day   the condensate a mouth weeps (section 3's arithmetic: the dawn and the day terms); LUNG.physics(o) the stack's numbers
//   LUNG.hand(world, id)  +1 right-handed, -1 the mirror lung (one in forty by the hash: under one in thirty, the owner's rule)
//   LUNG.layout(o) -> {lungs, mouths, bells, husks, lawns, sphincters}   lungs from a KRELIEF.scarp record's ravines and buttresses
//        o {scarp, ground(x,z), world, n (lungs at most), deckY (the deck's top: the foot below it is not drawn), wind [x,z] (the way it blows),
//           yTop (the altitude a lung stops climbing at), clip (the map's half-width)}
//   LUNG.hazards(L) -> [{name, x, y, z, r, h, tags:{hazard}}]   the draw, the cold breath, the film, the sphincter, the fall, the maw (section 9)
//   LUNG.roleK(role, b) -> {state, k, on}   a hazard's state at breath b; LUNG.state, KHAZ.STATES['LUNG.breath'] (registered when KHAZ is there)
//        reads LUNG.now() -> [t, W] (the host sets it to its clock)
//   LUNG.sites(L) -> {mouths:[{id, x, y, z, yield, live, mirror}], hamlet, stairs}   plain data for core/hamlet (section 9: LUNG_SITES)
//   LUNG.SPECIES, PLANTS, HARVEST, byKey(key), SPIRALS, TAGS   the BIOME-API contract (BIOME-API.md)
// GODOT: the same arithmetic on the same records (KRAND's hash; the deck's day is core/atmos's own [G data] function).
var LUNG=(function(){
 'use strict';
 const L={},TAU=Math.PI*2;
 const cl=(v,a,b)=>v<a?a:v>b?b:v,sm=(a,b,x)=>{const t=cl((x-a)/(b-a),0,1);return t*t*(3-2*t);},fr=v=>v-Math.floor(v);
 const KR=()=>{const K=typeof KRAND!=='undefined'?KRAND:null;if(!K)throw new Error('LUNG: load core/rand (08-core-rand.js) first');return K;};
 const U=(w,a,b,c)=>{const K=KR();return K.unit(K.hash(w>>>0,a|0,b|0,c|0));};
 // ---------------------------------------------------------------- the deck's day (the cloud sea laps the foot after dawn, burns back by afternoon)
 L.DECK={high:7.5,low:15.5,lap:60,burn:60};
 L.deckK=function(hour){const A=typeof ATMOS!=='undefined'?ATMOS:null;if(!A||!A.deckLevel)throw new Error('LUNG.breath: load core/atmos fx/89-atmos-fx-deckday.js (ATMOS.deckLevel)');
  return A.deckLevel(hour,null,{y:0,lap:1,burn:0,high:L.DECK.high,low:L.DECK.low,fog:0,rain:0});};
 // ---------------------------------------------------------------- the breath (section 3)
 const W0={wet:.9,cloud:0,wind:7};
 const seasonOf=(t,W)=>{if(W&&W.summer!=null)return cl(+W.summer,-1,1);const C=typeof KCLOCK!=='undefined'?KCLOCK:null;
  if(C&&C.season){const d=Math.floor(t);return C.season(d,(t-d)*24).summer;}return 0;};
 L.engines=function(t,W){if(typeof t!=='number'||!isFinite(t))throw new Error('LUNG.breath: t is a number of days');W=W||{};
  const wet=cl(W.wet==null?W0.wet:+W.wet,0,1),cloud=cl(W.cloud==null?W0.cloud:+W.cloud,0,1),wind=Math.max(0,W.wind==null?W0.wind:+W.wind),summer=seasonOf(t,W);
  const h=fr(t)*24;
  /* the condensation engine: the foot saturated where the deck stands against it, while the foot's air is warm (sunrise to the evening) */
  const warm=sm(5,7,h)*(1-sm(16,18.5,h)),latent=.3*wet*L.deckK(h)*warm/.98;
  /* the solar chimney: the noon sun at 40 S on a north-facing skin, through the cloud, a little stronger in summer */
  const sun=Math.max(0,Math.sin(Math.PI*(h-6)/12)),solar=Math.pow(sun,1.5)*(1-.7*cloud)*(.85+.15*summer);
  /* the reversal: a clear winter night, the paramo radiating, the crest's air colder than the bore's */
  const night=Math.max(sm(19,21.5,h),1-sm(4.5,6,h)),winter=sm(.2,-.6,summer),reverse=-.2*winter*night*(1-cloud);
  let b=latent+solar+reverse;
  /* the crest wind's suction (about a sixth of the stack): it strengthens a draught, it starts none */
  const wk=cl(wind/7,0,1.5);if(b>0)b*=1+.1*wk;
  return {latent,solar,reverse,wind:wk,summer,hour:h,b:cl(b,-1,1)};};
 L.breath=(t,W)=>L.engines(t,W).b;
 // ---------------------------------------------------------------- the air and the bands
 L.atmAt=y=>1.6*Math.exp(-y/8000);
 L.yAt=atm=>-8000*Math.log(atm/1.6);
 /* the ramp the bands are painted from, foot (1.60) to crest (1.00): violet, teal, sage, ochre, rust, bone (sRGB) */
 const RAMP=[[1.60,[.36,.30,.46]],[1.50,[.20,.40,.44]],[1.40,[.26,.46,.40]],[1.30,[.44,.52,.38]],[1.20,[.58,.54,.34]],[1.12,[.62,.40,.24]],[1.05,[.72,.64,.52]],[1.00,[.80,.76,.68]]];
 const NAMES=['violet','teal','sea-green','sage','olive','ochre','rust','bone'];
 L.BAND=.05;L.BANDS=12;   /* 1.60 .. 1.00 atm */
 L.bandAt=function(atm){if(typeof atm!=='number'||!isFinite(atm)||atm<=0)throw new Error('LUNG.bandAt: atm is a number over 0');
  const i=cl(Math.floor((1.6-atm)/L.BAND+1e-9),0,L.BANDS-1),mid=1.6-(i+.5)*L.BAND;let c=RAMP[RAMP.length-1][1],nm=NAMES[NAMES.length-1];
  for(let k=0;k+1<RAMP.length;k++){const a=RAMP[k],b=RAMP[k+1];if(mid<=a[0]&&mid>=b[0]){const f=(a[0]-mid)/(a[0]-b[0]);c=[0,1,2].map(j=>a[1][j]+(b[1][j]-a[1][j])*f);nm=NAMES[f<.5?k:k+1];break;}}
  return {i,name:nm,col:c.map(v=>Math.round(v*1000)/1000),atm0:1.6-i*L.BAND,atm1:1.6-(i+1)*L.BAND};};
 // ---------------------------------------------------------------- the water and the stack (section 3, its numbers)
 L.physics=function(o){o=o||{};const g=7.4,H=o.H==null?3000:o.H,rho=o.rho==null?1.5:o.rho,D=o.bore==null?3:o.bore,f=o.f==null?.03:o.f,T=o.T==null?290:o.T,cp=1004;
  const K=f*H/D,dpT=rho*g*H*(o.dT==null?1.2:o.dT)/T,dpV=rho*g*H*(o.dTv==null?.5:o.dTv)/T,dp=dpT+dpV,vDawn=Math.sqrt(2*dp/(rho*(1+K)));
  const A=Math.PI*D*D/4,Q=o.Q==null?1.8e6*(D/3):o.Q,vSun=Math.cbrt(2*g*H*Q/(rho*A*cp*T*(1+K)));
  return {K,dpT,dpV,dp,vDawn,vSun,A,lapseDry:g/cp*1000};};
 L.yield=function(bore,W){if(!(bore>0))throw new Error('LUNG.yield: bore is metres over 0');W=W||{};
  const wet=cl(W.wet==null?1:+W.wet,0,1),cloud=cl(W.cloud==null?0:+W.cloud,0,1),A=Math.PI*bore*bore/4,rho=1.6;
  /* dawn: 5 h at 2.5 m/s dropping 10.4 - 6.3 g/kg foot to crest; day: 8 h at 8 m/s dropping about 1 g/kg (drier air) */
  const dawn=A*2.5*rho*4.1e-3*5*3600*wet,day=A*8*rho*1e-3*8*3600*(1-.6*cloud)*(.5+.5*wet);
  return (dawn+day)/1000;};
 L.latentKW=bore=>{const A=Math.PI*bore*bore/4;return A*2.5*1.6*4.1e-3*2.5e6/1000;};
 // ---------------------------------------------------------------- the hand (the southern highlands' rule reaches native life)
 L.MIRROR_EVERY=40;
 L.hand=(world,id)=>U(world,id,0,0x1F11)<1/L.MIRROR_EVERY?-1:1;
 // ---------------------------------------------------------------- the layout (section 6): lungs up the scarp's ravines and buttresses
 L.layout=function(o){o=o||{};const S=o.scarp,G=o.ground;if(!S||S.kind!=='scarp')throw new Error('LUNG.layout: scarp is a KRELIEF.scarp record');if(typeof G!=='function')throw new Error('LUNG.layout: ground(x,z)');
  const world=(o.world==null?0x1A6:o.world)>>>0,nMax=o.n==null?10:o.n,clip=o.clip==null?2500:o.clip,deckY=o.deckY==null?-1e9:o.deckY,yTop=o.yTop==null?1e9:o.yTop;
  const wd=o.wind||[.6,.8],wl=Math.hypot(wd[0],wd[1])||1,wx=wd[0]/wl,wz=wd[1]/wl;
  /* the candidate lines: each ravine (its floor, one lung or two side by side) and each buttress's flank */
  const cand=[];S.ravines.forEach((V,i)=>{cand.push({x:V.x,z:V.z,nx:V.nx,nz:V.nz,off:0,on:'ravine',i,w:V.w});if(U(world,i,1,0xA1)<.5)cand.push({x:V.x,z:V.z,nx:V.nx,nz:V.nz,off:V.w*.38,on:'ravine',i,w:V.w});});
  S.buttresses.forEach((B,i)=>{cand.push({x:B.x,z:B.z,nx:B.nx,nz:B.nz,off:B.w*.55*(U(world,i,2,0xA2)<.5?-1:1),on:'buttress',i,w:B.w});});
  /* in order of a hash, so which lungs are kept is the hash's, not the list's */
  cand.forEach((c,k)=>{c.key=U(world,c.on==='ravine'?c.i:1000+c.i,c.off?7:3,0xA3);});cand.sort((a,b)=>a.key-b.key);
  const out={world,lungs:[],mouths:[],bells:[],husks:[],lawns:[],sphincters:[]};const step=o.step==null?10:o.step;
  for(const c of cand){if(out.lungs.length>=nMax)break;const k=out.lungs.length,id='lung'+k,u=c2=>U(world,k,c2,0xA4);
   const tx=-c.nz,tz=c.nx,ox=c.x+tx*c.off,oz=c.z+tz*c.off;
   if(Math.abs(ox)>clip*.92||Math.abs(oz)>clip*.92)continue;
   if(out.lungs.some(q=>Math.hypot(q.mouth0[0]-ox,q.mouth0[1]-oz)<70))continue;   /* a lung keeps its own line (KSPACE checks it again on the page) */
   const r=1.6+2.4*u(1),wall=.3*r,dead=u(2)<.15,young=!dead&&u(3)<.12,hand=L.hand(world,k);
   /* the centreline: from the mouth just back of the rim, down the face along n, the centre half a radius over the ground (the rock its back wall) */
   const pts=[];const d0=-12-8*u(4),dEnd=young?S.run*(.35+.3*u(5)):S.run*1.15;
   for(let d=d0;d<=dEnd;d+=step){const x=ox+c.nx*d,z=oz+c.nz*d;if(Math.abs(x)>clip||Math.abs(z)>clip)break;const y=G(x,z)+r*.55;pts.push([x,y,z]);if(y<deckY-80)break;}
   if(pts.length<4)continue;
   /* young lungs grow from the foot: their top is the growing tip, their foot the bell */
   const P=young?pts.slice(Math.floor(pts.length*.55)):pts;
   if(P.length<3||P[0][1]>yTop)continue;
   /* the rings, foot to tip: 20-60 m of pipe each, the birth pressure the air at the ring's middle */
   const F=P.slice().reverse(),acc=[0];for(let i=1;i<F.length;i++)acc.push(acc[i-1]+Math.hypot(F[i][0]-F[i-1][0],F[i][1]-F[i-1][1],F[i][2]-F[i-1][2]));
   const total=acc[acc.length-1],rings=[];let s=0,j=0;
   const at=q=>{while(j+1<acc.length-1&&acc[j+1]<q)j++;const a=F[j],b=F[j+1],t=cl((q-acc[j])/((acc[j+1]-acc[j])||1),0,1);return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];};
   for(let n=0;s<total-1;n++){let len=20+40*U(world,k,n,0xA5);if(total-s-len<12)len=total-s;const a=at(s),b=at(s+len),m=at(s+len/2),atm=L.atmAt(m[1]),B=L.bandAt(atm);
    rings.push({id:id+'.r'+n,lung:id,n,a,b,len,atm:Math.round(atm*10000)/10000,band:B.i,r:r*(1-.18*(young?n/(total/30+1):0)),wall,dead:dead||(young&&false)});s+=len;}
   const lung={id,on:c.on,line:c.i,mouth0:[ox,oz],n:[c.nx,c.nz],r,wall,bore:2*(r-wall),pts:P,hand,mirror:hand<0,dead,young,live:!dead,rings,len:Math.round(total),
    atm0:rings[0].atm,atm1:rings[rings.length-1].atm};
   out.lungs.push(lung);
   const top=P[0],foot=P[P.length-1];
   if(!young){const lean=[wx,wz],mr=r*(1.15+.25*u(6));
    const yl=dead?0:Math.round(L.yield(lung.bore)*10)/10;
    const m={id:id+'.mouth',lung:id,x:top[0],y:top[1],z:top[2],r:mr,lean,live:!dead,mirror:lung.mirror,yield:yl,collar:mr*1.35,
     well:{x:top[0]+wx*mr*2.2,z:top[2]+wz*mr*2.2,r:mr*.9+1.5}};
    out.mouths.push(m);lung.mouth=m.id;
    if(!dead){const len2=130+120*u(7),w2=40+30*u(8);out.lawns.push({id:id+'.lawn',lung:id,x:top[0]+wx*(len2*.5+mr*2),z:top[2]+wz*(len2*.5+mr*2),ax:wx,az:wz,len:len2,w:w2});}}
   if(foot[1]>deckY-40){const br=r*(2.4+1.6*u(9));out.bells.push({id:id+'.bell',lung:id,x:foot[0],y:foot[1],z:foot[2],r:br,face:[c.nx,c.nz],live:!dead});lung.bell=id+'.bell';}
   if(dead)out.husks.push(id);
   /* a sphincter at every tenth joint: the stair's rests and the hazard */
   rings.forEach((R,i)=>{if(i&&i%10===0&&!dead)out.sphincters.push({id:R.id+'.sph',lung:id,x:R.a[0],y:R.a[1],z:R.a[2],r:R.r});});}
  return out;};
 // ---------------------------------------------------------------- the hazards (section 9; core/hazard records, cycled on the breath)
 L.roleK=function(role,b){if(typeof b!=='number'||!isFinite(b))throw new Error('LUNG.roleK: b is a number');
  if(role==='draw'){const k=cl(b,0,1);return {state:k>.02?'drawing':'still',k,on:k>.02};}
  if(role==='cold'){const k=cl(-b/.2,0,1);return {state:k>.02?'cold breath':'still',k,on:k>.02};}
  if(role==='film'){const k=b>0?.6+.4*b:.6;return {state:'wet',k,on:true};}
  if(role==='sphincter'){const k=1-sm(.05,.25,Math.abs(b));return {state:k>.5?'closing':'open',k,on:k>.5};}
  throw new Error('LUNG.roleK: no role '+role);};
 L.now=()=>[0.5,null];
 L.roleOf=h=>{const s=h&&h.seed;const m=typeof s==='string'&&s.match(/:(draw|cold|film|sphincter)$/);return m?m[1]:null;};
 L.state=function(rec,h){const role=L.roleOf(h);if(!role)return {state:'steady',k:1,on:true};const q=L.now();return L.roleK(role,L.breath(q[0],q[1]));};
 if(typeof KHAZ!=='undefined'&&KHAZ.STATES)KHAZ.STATES['LUNG.breath']=L.state;
 L.hazards=function(G){const out=[],add=(name,x,y,z,r,h,hz)=>out.push({name,x,y,z,r,h,tags:{hazard:hz}});
  G.bells.forEach(B=>{if(!B.live)return;
   add('The draw at '+B.id+': the bell drinks the canopy at noon',B.x,B.y-B.r,B.z,B.r*1.3,B.r*2.4,{kind:'grab',danger:.5,falloff:'linear',shape:{type:'cyl',r:B.r*1.3,h:B.r*2.4},move:{speed:.6,pull:1,to:[0,B.r,0]},stateFn:'LUNG.breath',seed:B.id+':draw',tell:{sign:'leaves and spores streaming into the fringe'}});
   add('The cold breath at '+B.id+': winter nights pour the paramo out of the bell',B.x,B.y-B.r,B.z,B.r*2,B.r*2,{kind:'cold',effect:'freeze',danger:.3,falloff:'smooth',shape:{type:'cyl',r:B.r*2,h:B.r*2},move:{speed:.7},stateFn:'LUNG.breath',seed:B.id+':cold',tell:{sign:'a cold mist out of the bell before dawn, the fringe streaming outward'}});});
  G.mouths.forEach(M=>{
   add('The film on the collar of '+M.id+': distilled water on wet flesh',M.x,M.y-M.r*1.5,M.z,M.collar+2,M.r*2,{kind:'slip',danger:.2,falloff:'linear',shape:{type:'cyl',r:M.collar+2,h:M.r*2},stateFn:'LUNG.breath',seed:M.id+':film',tell:{sign:'the black collar wet and shining'}});
   add('The lip at '+M.id+': the face falls three kilometres',M.x,M.y-M.r*2,M.z,M.r*2.2,M.r*3,{kind:'fall',danger:1,falloff:'none',shape:{type:'cyl',r:M.r*2.2,h:M.r*3},tell:{sign:'the mouth stands on the lip'}});
   if(M.live)add('The mouth-maw\'s lie at '+M.id+(M.mirror?' (the Levtonemetos: the dead are left to it)':''),M.well.x,M.y-M.r,M.well.z,M.r*1.6,M.r*2,{kind:'hunter',danger:.7,shape:{type:'cyl',r:M.r*1.6,h:M.r*2},tell:{sign:'a still dark shape in the collar\'s shadow'}});});
  G.sphincters.forEach(P=>add('A sphincter joint ('+P.id+'): it closes on the slack breath',P.x,P.y-P.r,P.z,P.r,P.r*2,{kind:'pit',effect:'hold',danger:.7,falloff:'none',shape:{type:'cyl',r:P.r,h:P.r*2},trigger:{by:'weight',mass:40,reset:600},stateFn:'LUNG.breath',seed:P.id+':sphincter',tell:{sign:'the ring\'s lip narrowing; the draught dies'}}));
  return out;};
 // ---------------------------------------------------------------- the sites (section 9): the wells and the hamlet's place, as data
 L.sites=function(G){const ms=G.mouths.map(M=>({id:M.id,lung:M.lung,x:Math.round(M.x),y:Math.round(M.y),z:Math.round(M.z),yield:M.yield,live:M.live,mirror:M.mirror}));
  const great=ms.filter(m=>m.live&&!m.mirror).sort((a,b)=>b.yield-a.yield||(a.id<b.id?-1:1))[0]||null;
  const stairs=G.lungs.filter(l=>l.live&&!l.mirror).map(l=>({lung:l.id,rests:l.rings.filter((R,i)=>i&&i%10===0).map(R=>R.a.map(v=>Math.round(v)))}));
  return {format:'krator-lung-sites',version:1,mouths:ms,hamlet:great?{mouth:great.id,x:great.x,z:great.z,name:'Mariobređuelos (great-breath-well): the hamlet at the greatest mouth',people:50,water:great.yield}:null,stairs};};
 // ---------------------------------------------------------------- the species (section 7) on the BIOME-API contract
 L.SPIRALS=['twist','coil','whorl','none'];
 L.TAGS={climate:'montane',aridity:'humid..semiarid',abyssal:false,riparian:'both',koppen:['Cfb','Cfa','Af','Dfb','Dfc']};
 const HV=(wood,edible,med,note)=>({wood,edible,medicinal:!!med,fruit:null,note});
 L.HARVEST={
  lung:HV('none',[],false,'Water: 4-20 m3 a day a mouth; rope from the sloughed skin (Scinropos), which does not rot in the Ring Sea\'s air.'),
  comb:HV('none',['comb cake (Combocacos): the catch pressed; a different poison each month'],true,'Every poison the jungle\'s spores carry: a Talovolci knows which month\'s cake is safe.'),
  husk:HV('none',[],false,'A dry road and a shelter; its papery skin is tinder.'),
  fallout:HV('none',[],false,'The hyperjungle\'s seedlings, dead within weeks: the breath\'s reach drawn on the ground.'),
  dewcoil:HV('none',['the coil\'s cup, eaten raw (Deuocoilos)','the water it holds'],false,'The paramo\'s drink, for animals and the Talovolci.'),
  rimecap:HV('none',[],false,'Crusted white every night, wet every noon.')};
 const T=(o)=>Object.assign({},L.TAGS,{alien:true,breath:true},o);
 L.SPECIES=[
  {key:'lung',name:'Cliff lung (Clivobređos)',how:'A coral-like colony of rings, a confined updraught: condensation and the sun drive it, foot to crest.',tags:T({spiral:'twist',koppen:['Cfb','Cfa','Af','Dfb'],harvest:L.HARVEST.lung})},
  {key:'ring',name:'Lung ring (ringos)',how:'One clonal individual, 20-60 m of pipe, fixed to the pressure it was born at: its skin is its band.',tags:T({spiral:'twist',harvest:L.HARVEST.lung})},
  {key:'bell',name:'Intake bell (Andemouđos)',how:'The root end: a flared mouth on holdfasts in the canopy, the strainer fringe across it.',tags:T({spiral:'twist',koppen:['Af','Cfa'],harvest:L.HARVEST.lung})},
  {key:'mouth',name:'Mouth (Uxomouđos)',how:'The growing end on the paramo\'s lip: a weeping collar, a cap cloud at noon.',tags:T({spiral:'twist',koppen:['Dfb','Dfc'],harvest:L.HARVEST.lung})},
  {key:'comb',name:'Throat comb (combos)',how:'The bore\'s lining below the condensation band: wet black combs that hold the film and the catch.',tags:T({spiral:'none',harvest:L.HARVEST.comb})},
  {key:'husk',name:'Husk (huscos)',how:'A dead lung: pale, papery, split along its ribs, banded even dead.',tags:T({spiral:'twist',harvest:L.HARVEST.husk})}];
 L.PLANTS={
  fringe:{key:'fringe',name:'Strainer fringe',how:'Violet filaments across a bell: inward on the draw, outward on the cold breath.',items:['lfringe'],tags:T({spiral:'twist',koppen:['Af','Cfa'],harvest:HV('none',[],false,'Keeps the jungle\'s leaves out of the bore.')})},
  comb:{key:'comb',name:'Throat comb',how:'Wet black, seen at the mouths, in the bells and in cut husks.',items:['lcomb'],tags:T({spiral:'none',harvest:L.HARVEST.comb})},
  fallout:{key:'fallout',name:'Fall-out lawn (Gunglomagos)',how:'Jungle seedlings sprouted in the warm exhale, green against the paramo\'s straw, dead at the breath\'s edge.',items:['lfallout'],tags:T({spiral:'none',koppen:['Dfb','Dfc'],harvest:L.HARVEST.fallout})},
  dewcoil:{key:'dewcoil',name:'Dew coil (Deuocoilos)',how:'A crozier that never unrolls; beads condensate along its spiral and holds it in its curl.',items:['ldewcoil'],tags:T({spiral:'coil',koppen:['Dfb','Dfc'],harvest:L.HARVEST.dewcoil})},
  rimecap:{key:'rimecap',name:'Rime cap',how:'The breath meadow\'s border, where the warmth fails.',items:['lrimecap'],tags:T({spiral:'whorl',koppen:['Dfb','Dfc'],harvest:L.HARVEST.rimecap})}};
 L.byKey={};L.SPECIES.forEach(S=>{L.byKey[S.key]=S;});
 L.plantOfItem=item=>{for(const k in L.PLANTS)if(L.PLANTS[k].items.indexOf(item)>=0)return L.PLANTS[k];return null;};
 return L;})();
