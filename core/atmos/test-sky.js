// node core/atmos/test-sky.js — the shared sky's model (core/atmos/sky/, SKY-PLAN.md): the sun path, the giant per site,
// the moons and the Double Dark, eclipse seasons, the Pleiades' season, the site frame, the ridge profiles and the
// shader's analytic giant and ring (the far half of the ring hidden behind the disc). Each check with a broken input
// that must fail. No browser: the chunk is only checked to be written.
const fs=require('fs'),path=require('path');
const FR=['89-atmos-0-core.js','89-atmos-0p-presets.js'].map(f=>path.join(__dirname,f))
 .concat(fs.readdirSync(path.join(__dirname,'sky')).filter(f=>/^89-atmos-.*\.js$/.test(f)).sort().map(f=>path.join(__dirname,'sky',f)));
global.window=global;eval(FR.map(f=>fs.readFileSync(f,'utf8')).join('\n')+';global.ATMOS=ATMOS;');
const A=ATMOS,S=A.SKY,V=A.skyVec;
let bad=0;const ok=(name,pass,neg)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const near=(a,b,e)=>Math.abs(a-b)<(e==null?1e-6:e);
const voth=A.siteAt(446,690);
// a state at a site on a given day of the year (not a day count) and hour
const at=(site,yearDay,hour)=>A.skyState(site,hour,yearDay-S.startDay);
const sunAA=(site,yd,h)=>V.altAz(at(site,yd,h).sunDir);

// ---- the site frame and the giant per site
ok('Voth is the reference: 40 S, the sub-giant point 87.1 E',near(voth.latitude,-40)&&near(voth.subGiantLon,87.12),near(voth.latitude,-41));
{const g=V.altAz(at(voth,259,12).giantDir);ok('the lifted giant over Voth: ESE, 25 up (the owner, 2026-10-25)',near(g.alt,25,.05)&&near(g.az,119.4,.5),near(g.alt,35,.05));}
{const a=A.siteAt(446,1087),b=A.siteAt(446,1345);ok('the Rift (px y 1087..1345) lies at 49.5..55.6 S',near(a.latitude,-49.45,.1)&&near(b.latitude,-55.6,.1),near(a.latitude,-48,.1));}
{const g0=at(voth,259,6).giantDir,g1=at(voth,100,21).giantDir;ok('the giant does not move with the hour or the season',near(V.dot(g0,g1),1,1e-12),!near(V.dot(g0,g1),1,1e-12));}
{const e=V.altAz(at(A.siteAt(600,690),259,12).giantDir);ok('a site farther east sees the giant higher',e.alt>25+3,e.alt<25);}

// ---- the sun path (21-sky.js's sign table, on the 365-day year with the solstice on day 350)
{const q=sunAA(voth,258.75,12);ok('spring equinox noon: altitude 50, due north',near(q.alt,50,.3)&&(q.az<.5||q.az>359.5),near(q.alt,40,.3));}
{const q=sunAA(voth,350,12);ok('summer solstice noon: altitude 73, north',near(q.alt,73,.1),near(q.alt,50,.1));}
{const q=sunAA(voth,350-182.5,12);ok('winter solstice noon: altitude 27',near(q.alt,27,.1),near(q.alt,73,.1));}
{const q=sunAA(voth,258.75,6);ok('equinox 06:00: on the horizon, due east',near(q.alt,0,.1)&&near(q.az,90,.2),near(q.az,270,.2));}
{const q=sunAA(voth,258.75,18);ok('equinox 18:00: setting due west',near(q.alt,0,.3)&&near(q.az,270,.3),near(q.az,90,.3));}
{const s=A.skyState(voth,6,0);ok('game start (day 259, 06:00) is sunrise on every page',Math.abs(s.sunAlt)<.6&&[A.siteAt(755,351),A.siteAt(450,1040)].every(x=>Math.abs(A.skyState(x,6,0).sunAlt)<.6),Math.abs(s.sunAlt)>.6);}
{const q=sunAA(voth,350,19.5),w=sunAA(voth,350-182.5,16.8);ok('the sun sets south of west in summer, north of west in winter (WNW)',q.az<270&&q.az>220,q.az>270);}

// ---- the moons: phases and the Double Dark
const lit=(t,i)=>{const day=Math.floor(t),h=(t-day)*24;return A.skyState({latitude:-40,subGiantLon:0},h,day).moons[i+1].lit;};   // i: 0 the Week, 1 the Thirteen
ok('both moons are new at the Double Dark the day before game start',lit(S.doubleDark,0)<.01&&lit(S.doubleDark,1)<.01,lit(S.doubleDark,0)>.01);
ok('a day after it, both are thin crescents at game start',lit(0.25,0)<.15&&lit(0.25,1)<.05&&lit(0.25,0)>.005,lit(0.25,0)>.5);
const nextNew=(i,t0)=>{let best=[9,0];for(let t=t0+2;t<t0+16;t+=.02){const l=lit(t,i);if(l<best[0])best=[l,t];}return best[1];};
{const w=nextNew(0,S.doubleDark)-S.doubleDark,th=nextNew(1,S.doubleDark)-S.doubleDark;ok('the Week waxes and wanes every 7 days, the Thirteen every 13',near(w,7,.15)&&near(th,13,.15),near(w,6.87,.05));}
{let best=[9,0];for(let t=S.doubleDark+85;t<S.doubleDark+97;t+=.02){const l=Math.max(lit(t,0),lit(t,1));if(l<best[0])best=[l,t];}
 ok('the next Double Dark is 91 days on, both moons dark together',near(best[1]-S.doubleDark,91,1)&&best[0]<.06,near(best[1]-S.doubleDark,80,1));}
{const m=A.skyState(voth,12,0).moons[0],q=V.altAz(m.dir),m2=A.skyState(voth,3,40).moons[0];
 ok('the Companion (a Trojan) hangs fixed 60 degrees from the giant along the ring line, about 0.28 degrees across (Ceres-sized)',near(Math.abs(m.along),60,1e-6)&&near(V.dot(m.dir,m2.dir),1,1e-9)&&near(m.radiusDeg*2,.278,.01)&&q.alt>0,Math.abs(m.along)<10);}
{const l=[0,6,12,18].map(h=>A.skyState(voth,h,0).moons[0].lit);ok('...and waxes and wanes once a day',Math.max(...l)-Math.min(...l)>.5,Math.max(...l)-Math.min(...l)<.1);}
{let on=true;for(let d=0;d<30;d+=.31){const st=A.skyState(voth,(d*24)%24,Math.floor(d));for(const m of st.moons){const c=Math.abs(V.dot(m.dir,st.ringLine)),g=V.dot(m.dir,st.giantDir);const g2=st.giantDir,r2=st.ringLine,pn=[g2[1]*r2[2]-g2[2]*r2[1],g2[2]*r2[0]-g2[0]*r2[2],g2[0]*r2[1]-g2[1]*r2[0]];if(Math.abs(V.dot(m.dir,pn))>1e-9)on=false;}}
 ok('every moon rides on the ring line',on,false);}
{const ds=[];for(let h=0;h<24;h+=.05){const m=A.skyState(voth,h,3).moons[3];ds.push([h,m.front,Math.abs(m.along),m.radiusDeg*2]);}
 const fr=ds.filter(x=>x[1]),mx=Math.max(...ds.map(x=>x[2]).filter(a=>a<90));
 ok('Day (2:1, 12 h) laps Krator once a day: it crosses the giant\'s face, ~3 degrees across, and swings ~39 degrees out',fr.length>0&&fr.length<ds.length/2&&near(Math.max(...fr.map(x=>x[3])),2.9,.15)&&near(mx,39,2),fr.length===0);}
{const s=A.skyState(voth,22,10),g=s.giantDir;ok('an outer moon is never between Krator and the giant (it hides behind the disc)',(()=>{for(let d=0;d<60;d+=.37){const st=A.skyState(voth,(d*24)%24,Math.floor(d));for(const m of st.moons.slice(0,3)){const c=V.dot(m.dir,st.giantDir);if(c>Math.cos(15*Math.PI/180)&&m.distKm<S.giant.orbitKm)return false;}}return true;})(),false);}

// ---- eclipses come in seasons round the equinoxes
{const any=[],tot=[];for(let d=0;d<365;d++){let m=0;for(let h=0;h<24;h+=.1)m=Math.max(m,at(voth,d,h).eclipse);if(m>0)any.push(d);if(m>.99)tot.push(d);}
 const nearSol=d=>Math.min(Math.abs(d-350),Math.abs(d+15));
 ok('eclipses: 14..28 days a year, all round the summer solstice, a few total (the owner: a few a year)',any.length>=14&&any.length<=28&&any.every(d=>nearSol(d)<16)&&tot.length>0,any.length>60);}
{const s=at(voth,258.75,8);ok('no eclipse at the equinoxes',s.eclipse===0&&at(voth,76.25,8).eclipse===0,s.eclipse>0);}

// ---- the Pleiades' season: the winter nights' cluster
const cAlt=(yd,h)=>V.altAz(at(voth,yd,h).clusterDir).alt;
ok('midwinter midnight (Jun): the cluster stands near the zenith',cAlt(350-182.5,0)>70,cAlt(350-182.5,0)<0);
ok('midsummer midnight (Ticampar): the cluster is below the horizon',cAlt(350,0)<0,cAlt(350,0)>0);
ok('game start: high at dusk, set by dawn',cAlt(259,18.5)>50&&cAlt(259,5)<0,cAlt(259,18.5)<0);

// ---- the calendar
{const d=A.skyDate(0,6);ok('game start is 17 Ceppatampar, the Count\'s second day',d.text==='17 Ceppaṭampar'&&d.count===2&&d.name==='Ṭū Manḍē',d.count===1);}
{const d=A.skyDate(-1,12);ok('the Double Dark is Van Sanda',d.name==='Van Sanḍē'&&d.count===1,false);}
{const d=A.skyDate(350-259,12);ok('the solstice is 17 Ticampar',d.text==='17 Ṭicampar',d.text==='17 Navampar');}

// ---- the ridges: periodic, windowed, deterministic
{const p=A.ridgeProfile({base:2,amp:4,cycles:9,seed:3}),n=p.length,jump=Math.abs(p[0]-p[n-1]),step=Math.abs(p[1]-p[0]);
 ok('a ridge profile closes on itself at 360',jump<.2&&n===1024,jump>.2);}
{const p=A.ridgeProfile({base:6,amp:8,cycles:9,win:[0,60,1.5],floor:-1,seed:4});ok('a windowed ridge stands only round its azimuth',p[0]>5&&p[512]===-1&&p[256]<0,p[512]>0);}
{const a=A.ridgeProfile({base:2,amp:4,seed:5}),b=A.ridgeProfile({base:2,amp:4,seed:5});ok('the same layer gives the same profile',a.every((v,i)=>v===b[i]),false);}
ok('the bright stars are fixed: 64, the brightest in the cluster',S.stars.length===64&&S.stars.slice(0,14).every(s=>s[2]>2),S.stars.length!==64);

// ---- the shader's analytic giant and ring (the CPU twin of what the chunk does): the far half hides behind the disc
{const s=at(voth,259,9),g=s.giantDir,r=Math.sin(S.giant.diaDeg/2*Math.PI/180),n=A.skyRingNormal(s);
 const ray=d=>A.skyBodyHit(s,d);
 // a ray just inside the disc, along the ring line: one through the near half (ring in front), one through the far half
 const t=V.norm([n[1]*g[2]-n[2]*g[1],n[2]*g[0]-n[0]*g[2],n[0]*g[1]-n[1]*g[0]]);   // along the ring line in the sky
 const off=k=>V.norm(g.map((v,i)=>v+t[i]*k*r*1.0));
 let front=0,back=0,shown=0;for(let k=-.98;k<=.98;k+=.02)for(let dy=-.98;dy<=.98;dy+=.004){const d=V.norm(off(k).map((v,i)=>v+n[i]*dy*r)),h=ray(d);
  if(h.ring&&h.giant){if(h.ringT<h.giantT)front++;else back++;if(h.ringShown)shown++;}}
 ok('across the disc the ring passes in front on one half and behind on the other',front>0&&back>0,front===0);
 ok('only the near half is drawn over the disc',shown===front,shown===front+back);}
{const s=at(voth,259,9);ok('the chunk is written (the sky shader\'s GLSL)',typeof A.skyGLSL==='function'&&/atmSky\(/.test(A.skyGLSL()),false);}

console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
