// node biomes/galvanic/tests/test-galvanic.js — the Rift battery's physics (biomes/galvanic/PLAN.md section 3): every number the plan quotes, from the
// [G data] fragment the page itself runs (src/40-galvanic-cell.js). Each check with a broken input that must fail. No browser.
const fs=require('fs'),path=require('path');
global.window=global;
eval(fs.readFileSync(path.join(__dirname,'..','src','40-galvanic-cell.js'),'utf8')+';global.GALV_PHYS=GALV_PHYS;global.GALV_SITES=GALV_SITES;');
const G=GALV_PHYS;
let bad=0,n=0;const ok=(name,pass,neg)=>{n++;const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const near=(a,b,t)=>Math.abs(a-b)<=t;
// ---- the voltages (section 1's table): the couples' open circuits at pH 2
{const c1=G.cell({cathode:'pyrite',anode:'sphalerite',pH:2,o2:.21}),c2=G.cell({cathode:'chalcopyrite',anode:'sphalerite',pH:2,o2:.21}),c3=G.cell({cathode:'galena',anode:'sphalerite',pH:2,o2:.21});
 ok('pyrite against sphalerite: '+c1.ocv.toFixed(3)+' V open circuit (0.87)',near(c1.ocv,.87,.005),near(c1.ocv,.5,.005));
 ok('chalcopyrite against sphalerite: '+c2.ocv.toFixed(3)+' V (0.76)',near(c2.ocv,.76,.005),near(c2.ocv,.87,.005));
 ok('galena against sphalerite: '+c3.ocv.toFixed(3)+' V (0.54), the weakest',near(c3.ocv,.54,.005)&&c3.ocv<c2.ocv&&c2.ocv<c1.ocv,c3.ocv>c1.ocv);
 ok('the line runs at half the open circuit (about 0.4 V)',near(c1.v,c1.ocv/2,1e-9)&&near(c1.v,.435,.01),near(c1.v,c1.ocv,1e-9));
 const back=G.cell({cathode:'sphalerite',anode:'pyrite'});ok('a couple wired backwards gives nothing',back.ocv===0&&back.p===0,back.ocv>0);
 let threw=false;try{G.rest('gold',2,.21);}catch(e){threw=true;}ok('an unknown mineral is an error, not a number',threw,!threw);}
// ---- the current and the power: 10-100 mA/m2, 4-40 mW/m2 (section 3)
{const best=G.cell({}),rio=G.cell({o2:.21,T:25,pH:2.5}),poor=G.cell({cathode:'chalcopyrite',pH:3,o2:.15,T:30});
 ok('the strand at its best: '+best.i.toFixed(0)+' mA/m2, '+best.p.toFixed(1)+' mW/m2 (100 and ~40)',near(best.i,100,1)&&near(best.p,43.5,1.5),best.i>150);
 ok('Rio Tinto\'s air and warmth: '+rio.i.toFixed(0)+' mA/m2, '+rio.p.toFixed(1)+' mW/m2 (inside 10-100, 4-40)',rio.i>=10&&rio.i<=100&&rio.p>=4&&rio.p<=40,rio.i>100);
 ok('a poor living cell: '+poor.i.toFixed(0)+' mA/m2, '+poor.p.toFixed(1)+' mW/m2, still alive',poor.i>=10&&poor.p>=2&&poor.alive,!poor.alive);
 const sun=3,ratio=sun/(best.p*1e-3);ok('photosynthesis on the Rift floor (2-4 W/m2) is ~'+ratio.toFixed(0)+'x the battery\'s best (about a hundred)',ratio>50&&ratio<150,ratio<10);
 const neutral=G.cell({pH:6});ok('near neutral water (pH 6) the cell is not worth living on ('+neutral.p.toFixed(2)+' mW/m2)',!neutral.alive&&neutral.p<G.cell({pH:5}).p,neutral.alive);
 const drowned=G.cell({o2:.002});ok('a drowned cathode (anoxic brine) starves: '+drowned.p.toFixed(1)+' mW/m2',!drowned.alive,drowned.p>best.p/2);
 const bare=G.cell({insul:0});ok('without the insulation the couple is a short circuit: the life gets 0, the rock wastes '+bare.lost.toFixed(1)+' mW/m2',bare.p===0&&near(bare.lost,best.p,1e-9),bare.p>0);
 const half=G.cell({insul:.5});ok('half sheathed, half the power',near(half.p,best.p/2,1e-9),near(half.p,best.p,1e-9));}
// ---- a year of current (section 3, "What that grows")
{const c=G.cell({}),y20=G.yield(c.i*20/c.p,20),y50=G.yield(50,20);
 ok('20 mW/m2 is '+y20.kJ.toFixed(0)+' kJ/m2 a year (630)',near(y20.kJ,631,5),near(y20.kJ,63,5));
 ok('...about '+y20.biomass.toFixed(1)+' g of living matter per m2 a year (about 3)',near(y20.biomass,3.15,.2),y20.biomass>30);
 ok('50 mA/m2 is '+y50.eMol.toFixed(1)+' mol of electrons per m2 a year (16)',near(y50.eMol,16.3,.3),near(y50.eMol,163,1));
 ok('...dropping '+y50.feooh.toFixed(0)+' g of FeOOH (about 480)',near(y50.feooh,484,10),y50.feooh<100);
 const y20i=G.yield(20,8);ok('the reef grows 0.1-0.25 mm a year ('+y20i.crustMm.toFixed(3)+' at 20 mA/m2, '+y50.crustMm.toFixed(3)+' at 50)',y20i.crustMm>=.09&&y50.crustMm<=.25&&y50.crustMm>.2,y50.crustMm>1);
 ok('a metre of reef is 4,000-10,000 years ('+y50.metreYears.toFixed(0)+' to '+y20i.metreYears.toFixed(0)+')',y50.metreYears>=4000&&y20i.metreYears<=10400,y50.metreYears<1000);
 ok('the anode is eaten: '+y50.zns.toFixed(0)+' g of sphalerite (~0.8 kg), '+y50.anodeMm.toFixed(2)+' mm of vein, '+y50.zinc.toFixed(0)+' g of zinc to the water a year',near(y50.zns,797,10)&&near(y50.anodeMm,.19,.02)&&near(y50.zinc,535,10),y50.zinc<50);
 ok('no current, no growth',G.yield(0,0).crustMm===0&&G.yield(0,0).metreYears===Infinity,G.yield(0,0).crustMm>0);}
// ---- the acid (section 3, "The acid")
{const a=G.acid({ore:1e6,flow:1}),b=G.acid({ore:1e5,flow:1}),c=G.acid({ore:1e3,flow:10});
 ok('a mound\'s spring (1e6 m2 of grain surface, 1 L/s) is at the sulfate floor: pH '+a.pH.toFixed(2),a.pH===1.6,a.pH>2);
 ok('a tenth of the ore: pH '+b.pH.toFixed(2)+' (2-3)',b.pH>=2&&b.pH<=3,b.pH<1.7);
 ok('little ore, much water: pH '+c.pH.toFixed(2)+' (no acid drainage)',c.pH>4,c.pH<3);
 ok('the strand oxidises pyrite '+a.vsRioTinto.toFixed(2)+'x as fast as Rio Tinto\'s air (about 2.6)',near(a.vsRioTinto,2.63,.05),near(a.vsRioTinto,1,.05));
 ok('more water, less acid',G.acid({ore:1e5,flow:10}).pH>b.pH,G.acid({ore:1e5,flow:10}).pH<=b.pH);}
// ---- down a stream: dilution, the terraces' band, the colour
{const S=GALV_SITES.strand.streams[1],at=s=>G.stream(Object.assign({},S,{s}));
 const s28=G.streamAtPH(S,2.8),s4=G.streamAtPH(S,4.2);
 ok('the middle stream crosses pH 2.8 at '+s28.toFixed(0)+' m',near(at(s28).pH,2.8,.01),near(at(s28).pH,2,.01));
 ok('its pH only rises downstream',[0,200,800,1600,3200].every((s,i,A)=>i===0||at(s).pH>at(A[i-1]).pH),false);
 ok('no terrace at the spring, terraces past 2.8 ('+at(0).terrace.toFixed(2)+', '+at(s28+300).terrace.toFixed(2)+')',at(0).terrace===0&&at(s28+300).terrace>.9,at(0).terrace>.5);
 ok('no terrace once the water is past pH 4 ('+at(s4+100).pH.toFixed(2)+')',at(s4+100).terrace===0,at(s4+100).terrace>.5);
 ok('wine-red at the spring, orange over the terraces',((at(0).colour>>16)&255)>((at(0).colour>>8)&255)*2&&((at(s28+300).colour>>8)&255)>((at(0).colour>>8)&255),false);
 ok('all three streams reach the sea still acid (masts can stand in them all)',GALV_SITES.strand.streams.every(T=>{let L=0;for(let k=1;k<T.pts.length;k++)L+=Math.hypot(T.pts[k][0]-T.pts[k-1][0],T.pts[k][1]-T.pts[k-1][1]);return G.stream(Object.assign({},T,{s:L})).pH<4;}),false);}
// ---- the season and the store (section 3)
{const lo=G.season(70).level,hi=G.season(252.5).level;
 ok('the sea is lowest about day 70 ('+lo.toFixed(2)+' m) and highest about day 252 ('+hi.toFixed(2)+' m): a 1.2 m swing',near(lo,-.6,1e-3)&&near(hi,.6,1e-3),near(lo,.6,1e-3));
 ok('flooded ground is anoxic, bared ground breathes',G.season(252).o2At(0)<.01&&G.season(70).o2At(0)===G.REF.o2,G.season(70).o2At(0)<.01);
 const fd=y=>G.floodDays(y);ok('the flood lasts '+fd(.3)+' days at +0.3 m, '+fd(-.3)+' at -0.3, none above the top',fd(.3)<fd(-.3)&&fd(.61)===0&&fd(-.61)===365,fd(.61)>0);
 // a jar dies in a 120-day flood, lives through a 50-day one
 let y120=null,y50=null;for(let y=-.6;y<=.6;y+=.005){const d=fd(y);if(y120==null&&d<=120)y120=y;if(y50==null&&d<=50)y50=y;}
 const s120=G.store(y120),s50=G.store(y50);
 ok('a jar under a '+s120.floodDays+'-day flood dies',!s120.alive,s120.alive);
 ok('a jar under a '+s50.floodDays+'-day flood lives (its low '+s50.min+' days of upkeep)',s50.alive,!s50.alive);
 ok('a jar is full at the dry season\'s end and low after the flood',G.store(y50,{day:226}).charge>.9&&G.store(y50,{day:272}).charge<.5,G.store(y50,{day:272}).charge>=G.store(y50,{day:226}).charge);
 ok('the same jar dies if it holds only 30 days',!G.store(y50,{cap:30}).alive,G.store(y50,{cap:30}).alive);}
// ---- the site record: plain data, the numbers the survey gave
{const S=GALV_SITES.strand;ok('the site is the survey\'s: 2.21 atm, +36 degC, 1,051 mm, the sea at -2,600 m, the Deep\'s floor 100 m under it',S.atm===2.21&&S.temp.mean===36&&S.rain===1051&&S.sea===-2600&&S.deep.floor===S.sea-100,S.deep.floor===S.sea);
 ok('the record is JSON (no functions: Godot reads it)',JSON.stringify(GALV_SITES)===JSON.stringify(JSON.parse(JSON.stringify(GALV_SITES))),false);}
console.log((bad?'FAILED ':'OK ')+(n-bad)+' of '+n);process.exit(bad?1:0);
