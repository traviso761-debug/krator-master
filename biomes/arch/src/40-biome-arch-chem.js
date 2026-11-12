// ================================================================= ARCH — the Arch's chemistry and clocks (biomes/arch/PLAN.md section 3)  [G data]
// Plain functions on plain records: no THREE, no DOM, no Math.random, no sin hash. Every seeded value from core/rand (KRAND.hash of
// (world, segment | spring, index, salt)), never from a draw count. Runs in node as on a page (tests/test-arch-chem.js); Godot: the same
// functions on the same records. Numbers are approximate published values, cited in PLAN.md's sources; tolerances are in the tests.
//
//   ARCH.KW25, ARCH.NERNST(T)     the water constant (25 C) and 2.303 R T / F in mV per pH unit at T (C)
//   ARCH.SPRINGS                  the spring types: typeI (Mg-HCO3, pH 8-9), typeII (Ca-OH, pH 11-12, H2, CH4), acid (sulphate condensate, pH 1.5-3.5),
//                                 sea (the sound's seawater). Each {pH:[lo,hi], T:[lo,hi] C, H2, CH4 (mmol/kg), Ca, Mg, Fe, Ni (mmol/kg), dic (mmol/kg)}
//   ARCH.spring(kind, seed, i)    one spring's water: every number drawn inside its type's range from KRAND.hash(seed, i, salt) -> {kind, pH, T, H2, ...}
//   ARCH.anc(w)                   a water's net strong base (mol/L): [OH-] + [HCO3-] + 2[CO3--] - [H+] at its pH and dic (the carbonate system, pKa 6.35, 10.33)
//   ARCH.pHof(anc, dic)           the pH that balances a net strong base and a dic (bisection, 1e-9 in pH)
//   ARCH.mix(a, b, f)             f of a with 1-f of b (by volume): {pH, T, dic, calcite, brucite} (calcite / brucite: oversaturated, so precipitating)
//   ARCH.gradient(pHa, pHb, T)    the energy of a proton across the difference, mV: NERNST(T) x |pHa - pHb|
//   ARCH.canStand(meet)           can a curtain stand where two waters meet? meet = {alk:{pH, v (m/s), T}, acid:{pH, v, T}} -> {ok, why[]}: a pH difference of
//                                 at least 5, both flows under 0.4 m/s (a turbulent meeting mixes them), both under 70 C, the acid side at pH 1 or more
//   ARCH.curtainMass(flow, pHalk, pHacid, o)  what a spring of `flow` L/s feeds: {W (the gradient's power), kg} at o.yield (.1) and o.rate (W/kg, .05)
//   ARCH.NI                       the nickel table: species -> {role: 'excluder'|'indicator'|'hyper', max (leaf ug/g), k (available Ni at half max, mg/kg),
//                                 latex (ug/g, where the sap is the store), earth (bool)}
//   ARCH.available(soil)          the share of the soil's nickel a root can take, mg/kg: more on acid ground (soil = {ni (mg/kg total), pH, caMg, n, p})
//   ARCH.uptake(species, soil)    leaf nickel, ug/g dry: {leaf, latex, role, hyper (over 1,000), hypernick (over 10,000)}
//   ARCH.syndrome(soil)           the serpentine syndrome 0..1 (Ca:Mg, nickel, the missing N and P) and ARCH.stunt(soil): the height factor it leaves
//   ARCH.lifeAt(c)                c = {pH, T (C), spring (bool: flowing spring water), lavaAge (years | null), salt (0..1)} -> 'none' | 'native' | 'earth'
//   ARCH.earthOk(c)               Earth life can grow here: lifeAt is 'earth', the Ca:Mg at least .02 and the lava older than its pioneers' lag (c.lag, 30 y)
//   ARCH.episode(seg, year, world)  the band's rifting clock for one segment: {state 'quiet'|'inflation'|'intrusion'|'eruption', since (y from the last
//                                 episode's start), next (y to the next), recur (y), dur (y), opening (m, the last episode's)}
var ARCH=(function(){
  'use strict';
  var KR=(typeof KRAND!=='undefined')?KRAND:null;
  var need=function(){if(!KR&&typeof KRAND!=='undefined')KR=KRAND;if(!KR)throw new Error('ARCH: load core/rand (08-core-rand.js) first');return KR;};
  var cl=function(x,a,b){return x<a?a:x>b?b:x;};
  var P10=function(x){return Math.pow(10,x);};
  var KW25=1e-14,PK1=6.35,PK2=10.33;
  var NERNST=function(T){return 0.19841*(T+273.15);};            // mV per pH unit: 59.2 at 25 C, 60.2 at 30 C
  // ---- the springs (PLAN.md 3.1): the ranges each type's draws stay inside
  var SPRINGS={
    typeI:{pH:[8,9.2],T:[24,32],H2:[0,0],CH4:[0,0.01],Ca:[0.1,0.5],Mg:[1,4],Fe:[0,0.001],Ni:[0,0.001],dic:[2,5]},
    typeII:{pH:[11,11.9],T:[25,45],H2:[0.5,6],CH4:[0.05,0.5],Ca:[1,3],Mg:[0,0.01],Fe:[0,0.001],Ni:[0,0.001],dic:[0.005,0.05]},
    acid:{pH:[1.5,3.5],T:[40,95],H2:[0,0.05],CH4:[0,0.01],Ca:[0.2,1],Mg:[0.5,3],Fe:[0.5,5],Ni:[0.01,0.2],dic:[1,8]},
    sea:{pH:[8.0,8.2],T:[27,31],H2:[0,0],CH4:[0,0],Ca:[10,10.5],Mg:[52,54],Fe:[0,0],Ni:[0,0],dic:[1.9,2.1]}
  };
  var KEYS=['pH','T','H2','CH4','Ca','Mg','Fe','Ni','dic'];
  var spring=function(kind,seed,i){var S=SPRINGS[kind];if(!S)throw new Error('ARCH.spring: no spring type '+kind);var K=need(),o={kind:kind};
    for(var j=0;j<KEYS.length;j++){var r=S[KEYS[j]],u=K.unit(K.hash(seed>>>0,i|0,j,0x5E41));o[KEYS[j]]=r[0]+(r[1]-r[0])*u;}return o;};
  // ---- the carbonate system and the charge balance (PLAN.md 3.2)
  var species=function(pH,dic){var h=P10(-pH),k1=P10(-PK1),k2=P10(-PK2),d=h*h+h*k1+k1*k2;return {h:h,oh:KW25/h,hco3:dic*h*k1/d,co3:dic*k1*k2/d,co2:dic*h*h/d};};
  var anc=function(w){var s=species(w.pH,(w.dic||0)/1000);return s.oh+s.hco3+2*s.co3-s.h;};
  var pHof=function(a,dic){var lo=-1,hi=15,D=(dic||0)/1000;for(var n=0;n<80;n++){var m=(lo+hi)/2,s=species(m,D),f=s.oh+s.hco3+2*s.co3-s.h-a;if(f>0)hi=m;else lo=m;if(hi-lo<1e-9)break;}return (lo+hi)/2;};
  var KSP_CAL=P10(-8.48),KSP_BRU=P10(-11.16);
  var mix=function(a,b,f){f=cl(f,0,1);var A=anc(a)*f+anc(b)*(1-f),dic=(a.dic||0)*f+(b.dic||0)*(1-f),pH=pHof(A,dic),s=species(pH,dic/1000),
    Ca=((a.Ca||0)*f+(b.Ca||0)*(1-f))/1000,Mg=((a.Mg||0)*f+(b.Mg||0)*(1-f))/1000;
    return {pH:pH,T:(a.T||25)*f+(b.T||25)*(1-f),dic:dic,calcite:Ca*s.co3>KSP_CAL,brucite:Mg*s.oh*s.oh>KSP_BRU};};
  var gradient=function(a,b,T){return NERNST(T==null?30:T)*Math.abs(a-b);};
  var canStand=function(m){var why=[],al=m.alk,ac=m.acid;
    if(!al||!ac)return {ok:false,why:['two waters']};
    if(al.pH-ac.pH<5)why.push('pH difference '+(al.pH-ac.pH).toFixed(1)+' < 5');
    if(!(al.v<0.4)||!(ac.v<0.4))why.push('turbulent: a flow at 0.4 m/s or more');
    if(!(al.T<70)||!(ac.T<70))why.push('hot: 70 C or more');
    if(ac.pH<1)why.push('acid side under pH 1: nothing lives');
    return {ok:why.length===0,why:why};};
  var curtainMass=function(flow,pa,pb,o){o=o||{};var y=o.yield==null?0.1:o.yield,r=o.rate==null?0.05:o.rate,T=o.T==null?30:o.T;
    var oh=flow*P10(pa-14),W=oh*96485*gradient(pa,pb,T)/1000;return {W:W,kg:W*y/r};};
  // ---- nickel (PLAN.md 3.3): approximate published leaf maxima; latex where the sap is the store
  var NI={
    pycnandra:{role:'hyper',max:11700,k:30,latex:257000,earth:true},
    phyllanthus:{role:'hyper',max:8600,k:30,latex:169000,earth:true},
    geissois:{role:'hyper',max:3500,k:40,earth:true},
    hybanthus:{role:'hyper',max:14000,k:35,earth:true},
    berkheya:{role:'hyper',max:38000,k:60,earth:true},
    odontarrhena:{role:'hyper',max:30000,k:50,earth:true},
    araucaria:{role:'excluder',max:60,k:80,earth:true},
    agathis:{role:'excluder',max:50,k:80,earth:true},
    gymnostoma:{role:'indicator',max:400,k:120,earth:true},
    costularia:{role:'excluder',max:80,k:80,earth:true},
    metrosideros:{role:'excluder',max:40,k:80,earth:true},
    nepenthes:{role:'excluder',max:70,k:80,earth:true},
    verdigris:{role:'hyper',max:50000,k:40,earth:false}
  };
  var available=function(s){var f=cl(0.02*P10(0.3*(6.5-(s.pH==null?6.5:s.pH))),0.002,0.2);return (s.ni||0)*f;};
  var uptake=function(sp,soil){var t=NI[sp];if(!t)throw new Error('ARCH.uptake: no species '+sp);var a=available(soil),leaf=t.max*a/(t.k+a);
    return {leaf:leaf,latex:t.latex?t.latex*a/(t.k+a):null,role:t.role,hyper:leaf>1000,hypernick:leaf>10000};};
  var syndrome=function(s){var cm=s.caMg==null?2:s.caMg,ni=s.ni||0,n=s.n==null?1:s.n,p=s.p==null?1:s.p;
    var a=cl(1-cm/1.0,0,1),b=cl(ni/5000,0,1),c=cl(1-n,0,1),d=cl(1-p,0,1);return cl(0.35*a+0.25*b+0.2*c+0.2*d,0,1);};
  var stunt=function(s){return 1-0.75*syndrome(s);};
  // ---- where life stops, and Earth's or the native's (PLAN.md 3.4, 3.5)
  var lifeAt=function(c){var pH=c.pH==null?7:c.pH,T=c.T==null?25:c.T;
    if(pH<1||T>90||(c.lavaAge!=null&&c.lavaAge<5)||(c.salt||0)>0.35)return 'none';
    if(pH<4||pH>9.5||T>45||c.spring)return 'native';
    return 'earth';};
  var earthOk=function(c){var lag=c.lag==null?30:c.lag;return lifeAt(c)==='earth'&&(c.caMg==null||c.caMg>=0.02)&&(c.lavaAge==null||c.lavaAge>=lag);};
  // ---- the rifting episode (PLAN.md 3.6)
  var episode=function(seg,year,world){var K=need(),w=world==null?0x4A2C:world;
    var u=function(salt){return K.unit(K.hash(w>>>0,seg|0,0,salt));};
    var recur=250+350*u(1),dur=2+8*u(2),off=recur*u(3),open=1+7*u(4);
    var p=((year+off)%recur+recur)%recur,since=p,next=recur-p,st='quiet';
    if(p<dur){var q=p/dur;st=q<0.3?'inflation':q<0.6?'intrusion':q<0.8?'eruption':'quiet';}
    return {state:st,since:since,next:next,recur:recur,dur:dur,opening:open};};
  return {KW25:KW25,NERNST:NERNST,SPRINGS:SPRINGS,spring:spring,anc:anc,pHof:pHof,mix:mix,gradient:gradient,canStand:canStand,curtainMass:curtainMass,
    NI:NI,available:available,uptake:uptake,syndrome:syndrome,stunt:stunt,lifeAt:lifeAt,earthOk:earthOk,episode:episode};
})();
