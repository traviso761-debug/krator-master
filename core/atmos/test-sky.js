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
ok('Voth is the reference: 40 S, the sub-giant point 57 E',near(voth.latitude,-40)&&near(voth.subGiantLon,57),near(voth.latitude,-41));
{const g=V.altAz(at(voth,259,12).giantDir);ok('the giant over Voth: NE, ~24.7 up (21-sky.js) give or take its daily bob',near(g.alt,24.66,2.2)&&near(g.az,67.34,2.5),near(g.alt,35,.05));}
{const a=A.siteAt(446,1087),b=A.siteAt(446,1345);ok('the Rift (px y 1087..1345) lies at 49.5..55.6 S',near(a.latitude,-49.45,.1)&&near(b.latitude,-55.6,.1),near(a.latitude,-48,.1));}
{const L=S.giant.libration,inc=L.incDeg;L.incDeg=0;const e0=L.ecc;L.ecc=0;const g0=at(voth,259,6).giantDir,g1=at(voth,100,21).giantDir;L.incDeg=inc;L.ecc=e0;
 ok('without libration the giant does not move with the hour or the season',near(V.dot(g0,g1),1,1e-12),!near(V.dot(g0,g1),1,1e-12));
 let mx=0;for(let h=0;h<24;h+=.25){const g=A.skyState(voth,h,3).giantDir;mx=Math.max(mx,Math.acos(Math.min(1,V.dot(g,g0)))/Math.PI*180);}
 ok('with it, the giant bobs about its place by up to ~2 degrees a day (a 1.6 degree nod, a 1.1 degree swing)',mx>1.5&&mx<2.2,mx<.5);
 const op=[];for(let h=0;h<24;h+=1)op.push(A.skyState(voth,h,3).ringOpen);ok('...and the rings open and close through edge-on once a day',Math.max(...op)>1.5&&Math.min(...op)<-1.5,Math.min(...op)>0);}
{const e=V.altAz(at(A.siteAt(600,690),259,12).giantDir);ok('a site farther east sees the giant higher',e.alt>25+2,e.alt<25);}

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
 ok('the Companion (a Trojan) hangs fixed 60 degrees from the giant along the ring line, about 0.28 degrees across (Ceres-sized)',near(Math.abs(m.along),60,1e-6)&&near(Math.abs(m2.along),60,1e-6)&&near(m.radiusDeg*2,.278,.01)&&q.alt>0,Math.abs(m.along)<10);}
{const l=[0,6,12,18].map(h=>A.skyState(voth,h,0).moons[0].lit);ok('...and waxes and wanes once a day',Math.max(...l)-Math.min(...l)>.5,Math.max(...l)-Math.min(...l)<.1);}
{let on=true;for(let d=0;d<30;d+=.31){const st=A.skyState(voth,(d*24)%24,Math.floor(d));for(const m of st.moons){const c=Math.abs(V.dot(m.dir,st.ringLine)),g=V.dot(m.dir,st.giantDir);const g2=st.giantDir,r2=st.ringLine,pn=[g2[1]*r2[2]-g2[2]*r2[1],g2[2]*r2[0]-g2[0]*r2[2],g2[0]*r2[1]-g2[1]*r2[0]];if(Math.abs(V.dot(m.dir,pn))>1e-9)on=false;}}
 ok('every moon rides on the ring line',on,false);}
{const ds=[];for(let h=0;h<24;h+=.05){const m=A.skyState(voth,h,3).moons[3];ds.push([h,m.front,Math.abs(m.along),m.radiusDeg*2]);}
 const fr=ds.filter(x=>x[1]),mx=Math.max(...ds.map(x=>x[2]).filter(a=>a<90));
 ok('Day (2:1, 12 h) laps Krator once a day: it crosses the giant\'s face, ~3 degrees across, and swings ~39 degrees out',fr.length>0&&fr.length<ds.length/2&&near(Math.max(...fr.map(x=>x[3])),2.9,.15)&&near(mx,39,2),fr.length===0);}
{const P=n=>S.moons.find(m=>m.name===n);ok('the Laplace chain: Day 1/2, Krator 1, Two-Day 2, Four-Day 4 days, orbits by Kepler from Krator\'s',
  P('Day').periodD===.5&&P('Two-Day').periodD===2&&P('Four-Day').periodD===4&&[P('Day'),P('Two-Day'),P('Four-Day')].every(m=>near(m.orbitKm/194000,Math.pow(m.periodD,2/3),.002)),false);
 const lam=(m,t)=>m.theta0+2*Math.PI*t/m.periodD;
 const w=x=>{x=((x%(2*Math.PI))+2*Math.PI)%(2*Math.PI);return x>Math.PI?x-2*Math.PI:x;};
 const t0=S.doubleDark,lD=lam(P('Day'),t0),l2=lam(P('Two-Day'),t0),l4=lam(P('Four-Day'),t0),lK=lD;   // Day transits then: it shares Krator's longitude
 ok('...phased as a Laplace resonance: l(Day) - 3 l(Krator) + 2 l(Two-Day) = 180, and the same for the next link',near(Math.abs(w(lD-3*lK+2*l2)),Math.PI,1e-9)&&near(Math.abs(w(lK-3*l2+2*l4)),Math.PI,1e-9),false);}
{let away=0,ph=0;for(let d=0;d<20;d+=.7){const s=A.skyState(voth,(d*24)%24,Math.floor(d));for(const m of s.moons){const sp=s.sunDir.map((v,k)=>v-m.dir[k]*V.dot(s.sunDir,m.dir)),l=Math.hypot(...sp);if(l<1e-3)continue;
  if(V.dot(m.light,sp)<-1e-9&&m.lit<.999)away++;ph=Math.max(ph,Math.abs(-V.dot(m.light,m.dir)-(2*m.lit-1)));}}
 ok('every moon is lit from the side of the real sun (as the giant is), at its calendar phase (the owner, 2026-10-25)',away===0&&ph<1e-9,away>0);}
{const s=A.skyState(voth,22,10),g=s.giantDir;ok('an outer moon is never between Krator and the giant (it hides behind the disc)',(()=>{for(let d=0;d<60;d+=.37){const st=A.skyState(voth,(d*24)%24,Math.floor(d));for(const m of st.moons.slice(0,3)){const c=V.dot(m.dir,st.giantDir);if(c>Math.cos(15*Math.PI/180)&&m.distKm<S.giant.orbitKm)return false;}}return true;})(),false);}

// ---- eclipses come in seasons round the equinoxes
{const any=[],tot=[];for(let d=0;d<365;d++){let m=0;for(let h=0;h<24;h+=.1)m=Math.max(m,at(voth,d,h).eclipse);if(m>0)any.push(d);if(m>.99)tot.push(d);}
 const nearSol=d=>Math.min(Math.abs(d-350),Math.abs(d+15));
 const nearEq=d=>Math.min(Math.abs(d-258.75),Math.abs(d-76.25),Math.abs(d-76.25-365));
 ok('eclipses as they would be (the owner: realistic): ~2.5 months round each equinox, none near the solstices',any.length>120&&any.length<200&&any.every(d=>nearEq(d)<50)&&tot.length>100,any.length<60);}
{const s=at(voth,258.75,12);ok('no eclipse at an equinox noon (the sun is north, the giant north-east)',s.eclipse===0,s.eclipse>0);}

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
{const p=A.ridgeProfile({base:6,amp:2,cycles:9,win:[[90,40,1],[270,40,1]],floor:-1,seed:6});ok('a ridge in two lobes stands east and west, not north or south',p[256]>5&&p[768]>5&&p[0]===-1&&p[512]===-1,p[0]>0);}
{const p=A.ridgeProfile({base:8,amp:0,cycles:9,notch:[112,4,16,.8],seed:7}),i=Math.round(112/360*1024);ok('a notch lowers the ridge round its azimuth and leaves it whole 20 degrees off',near(p[i],1.6,.01)&&near(p[i+60],8,.01),near(p[i],8,.01));}
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
// ---- the broken station
{const s=at(voth,259,6);ok('the site frame: the zenith is world up (the station\'s frame is the stars\')',near(V.dot(s.toWorld([Math.cos(s.lst)*Math.cos(voth.latitude*Math.PI/180),Math.sin(s.lst)*Math.cos(voth.latitude*Math.PI/180),Math.sin(voth.latitude*Math.PI/180)]),[0,1,0]),1,1e-9),false);
 const st=s.station;ok('its lap: about 2.5 hours',near(st.periodH,2.47,.05),near(st.periodH,1,.05));
 let ups=0,minD=1e9,maxR=0,lit=0,dark=0,maxAlt=0;for(let h=0;h<240;h+=.02){const q=A.skyState(voth,h%24,Math.floor(h/24)).station;if(q.up){ups++;minD=Math.min(minD,q.dist);maxR=Math.max(maxR,q.radiusDeg);maxAlt=Math.max(maxAlt,V.altAz(q.dir).alt);if(q.lit>.5)lit++;else dark++;}}
 ok('over ten days Voth sees it often, sometimes high, both lit and in Krator\'s shadow',ups>500&&maxAlt>70&&lit>0&&dark>0,ups===0);
 ok('overhead it is 2,200 km off, its ring ~0.3 degrees in radius: just readable',near(minD,2190,60)&&maxR>.27&&maxR<.36,maxR>1);
 const a=A.skyState(voth,7,0).station,b=A.skyState(voth,7.02,0).station;ok('it moves along its velocity',V.dot(V.norm(b.dir.map((v,k)=>v-a.dir[k])),a.vel)>.6,false);}
{const M=A.skyLandmarks([{kind:'plume',from:[180,5],via:[175,12],to:[160,15],width:[1,5],alpha:.6},{kind:'sea',top:-2,win:[0,360]},{kind:'band',win:[90,20,1],el:[-.5,.5]},{kind:'what'}]),V=A.skyVec;
 const a=[M.v[0],M.v[1],M.v[2]],q=V.altAz(a);
 ok('landmarks pack: kinds, the plume foot as a world direction, its widths in radians, the sea all round',M.n===4&&M.kind[0]===0&&M.kind[1]===2&&M.kind[2]===3&&M.kind[3]===-1&&near(q.az,180,1e-6)&&near(q.alt,5,1e-6)&&near(M.v[3],Math.PI/180,1e-7)&&near(M.v[7],5*Math.PI/180,1e-7)&&M.v[20+3]>=3.14,M.kind[0]!==0);
 ok('at most SKY_MAX_LANDMARKS are kept',A.skyLandmarks(new Array(9).fill({kind:'band'})).n===A.SKY_MAX_LANDMARKS,false);}
{const s=at(voth,259,9);ok('the chunk is written (the sky shader\'s GLSL)',typeof A.skyGLSL==='function'&&/atmSky\(/.test(A.skyGLSL()),false);}

// the giant lit along its rings (axis 'equator', the owner, 2026-10-26): the sun stays within its declination (plus the libration's
// nod) of the ring plane all year; the old sky-up axis put it up to ~60 degrees out of that plane (the negative)
{const out=mode=>{const was=S.giant.axis;S.giant.axis=mode;let mx=0,dmx=0;for(let d=0;d<S.yearD;d+=S.yearD/12)for(let h=0;h<24;h+=2){const st=at(voth,d,h);
  const rn=A.skyRingNormal(st),e=Math.asin(Math.min(1,Math.abs(V.dot(st.sunDir,rn))))/Math.PI*180;mx=Math.max(mx,e);
  dmx=Math.max(dmx,Math.abs(Math.asin(Math.max(-1,Math.min(1,V.dot(st.sunDir,st.pole))))/Math.PI*180));}S.giant.axis=was;return[mx,dmx];};
 const [eq,dec]=out('equator'),[sky]=out('sky');
 ok('the sun lights the giant along its rings: '+eq.toFixed(1)+' degrees out of the ring plane at most (its declination reaches '+dec.toFixed(1)+')',eq<=dec+S.giant.ringOpenDeg+S.giant.libration.incDeg+1,sky<=dec+S.giant.ringOpenDeg+S.giant.libration.incDeg+1);}

// ---- thin air (biomes/godthrone/PLAN.md 2): the sky as a function of the eye's height, opt-in by preset.air.thin
{const P0=A.skyPreset('standard'),PT=A.skyPreset('standard',{air:{thin:{y0:0}}}),s=at(voth,259,12),w={};
 ok('without air.thin the look ignores the eye\'s height (every page as it was)',JSON.stringify(A.skyLook(P0,s,w))===JSON.stringify(A.skyLook(P0,s,w,20000))&&JSON.stringify(A.skyLook(P0,s,w))===JSON.stringify(A.skyLook(P0,s,w,undefined)),
  JSON.stringify(A.skyLook(P0,s,w))===JSON.stringify(A.skyLook(PT,s,w,20000)));
 ok('the pressure follows the model\'s law: 1.6 atm at sea level, 0.52 at 9 km, 0.07 at the 25 km rim',near(A.airPressureAt(PT,0),1.6,1e-12)&&near(A.airPressureAt(PT,9000),.52,.06)&&near(A.airPressureAt(PT,25000),.07,.005)&&A.airPressureAt(P0,25000)===1.6,
  near(A.airPressureAt(PT,25000),1.6,.01));
 const lum=c=>.3*c[0]+.55*c[1]+.15*c[2],strip=L=>{const o=Object.assign({},L);delete o.p;return JSON.stringify(o);},lo=A.skyLook(PT,s,w,0),hi=A.skyLook(PT,s,w,25000),mid=A.skyLook(PT,s,w,9000);
 ok('at sea level the thin-air preset looks as the standard does',strip(lo)===JSON.stringify(A.skyLook(P0,s,w)),strip(hi)===JSON.stringify(A.skyLook(P0,s,w)));
 ok('at the rim the zenith is near black ('+lum(hi.zen).toFixed(3)+' against '+lum(lo.zen).toFixed(3)+') and the bright stars show by day',lum(hi.zen)<.3*lum(lo.zen)&&hi.dayStars>.9&&lo.dayStars===0,lum(hi.zen)>=lum(lo.zen));
 ok('...the fog falls to nothing, the sky fill goes (hard shadows), the sun whitens and strengthens',hi.fogD<.01*lo.fogD&&hi.hemiI<.35*lo.hemiI&&Math.min(...hi.sunC)>Math.min(...lo.sunC)&&hi.sunI>lo.sunI&&hi.hazeFloor<lo.hazeFloor,hi.fogD>=lo.fogD);
 let mono=true,prev=1e9;for(let y=0;y<=25000;y+=2500){const L=A.skyLook(PT,s,w,y),z=lum(L.zen);if(z>prev+1e-12||!(L.fogD>=0))mono=false;prev=z;}
 ok('...darkening steadily with height, never brighter higher up',mono&&mid.dayStars<hi.dayStars,false);
 const PL=A.skyPreset('standard',{air:{thin:{y0:-9000}}});ok('y0 moves the law to the page\'s datum (y0 -9000: the eye at 0 stands at 9 km)',near(A.airPressureAt(PL,0),A.airPressureAt(PT,9000),1e-12),near(A.airPressureAt(PL,0),1.6,1e-6));}

{const PT=A.skyPreset('standard',{air:{thin:{y0:0}}}),prov={};const none=A.provideAir(PT);global.KHAZ={provide:(k,fn)=>{prov[k]=fn;}};const got=A.provideAir(PT);delete global.KHAZ;
 ok('provideAir hands core/hazard the pressure by height (0.07 atm at the rim), and does nothing without KHAZ',none===false&&got===true&&near(prov.pressure(0,25000,0),A.airPressureAt(PT,25000),1e-12)&&prov.pressure(0,25000,0)<.08,!prov.pressure);}
// ---- ATMOS.libration and ATMOS.sunHidden: the numbers and the picture have one source (2026-11-02)
{const site=A.siteAt(1130,854);
 let same=true;for(let d=0;d<30;d+=1.37)for(const h of[0,5.5,11,17.25]){const t=d+h/24,s=A.skyState(site,h,d),L=A.libration(t);if(s.ringOpen!==L.ringOpen)same=false;}
 ok('skyState\'s ring opening is ATMOS.libration\'s, bit for bit',same,A.libration(3.2).ringOpen===A.libration(3.7).ringOpen);
 const L=A.libration(1.1);
 ok('the nod is incDeg at most, the swing 2 ecc radians, the phase 0..1',(()=>{for(let t=0;t<3;t+=.01){const q=A.libration(t);if(Math.abs(q.nodDeg)>S.giant.libration.incDeg+1e-9||Math.abs(q.swingDeg)>2*S.giant.libration.ecc/Math.PI*180+1e-9||q.phase<0||q.phase>=1)return false;}return true;})(),false);
 ok('it comes round once a sidereal orbit',near(A.libration(1.1+1/1.0027379).nod,L.nod,1e-9),near(A.libration(1.1+.5).nod,L.nod,1e-3));
 ok('before game start the phase is still 0..1',A.libration(-2.3).phase>=0&&A.libration(-2.3).phase<1,false);
 // the giant drawn moves as the numbers say: its nod is its angle from its mean place, along the pole
 const g=t=>{const d=Math.floor(t),s=A.skyState(site,(t-d)*24,d);return s.giantDir;},dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
 const tn=[...Array(2000).keys()].map(i=>i/2000).reduce((b,t)=>A.libration(t).nod>A.libration(b).nod?t:b,0),tx=[...Array(2000).keys()].map(i=>i/2000).reduce((b,t)=>A.libration(t).nod<A.libration(b).nod?t:b,0);
 const ang=Math.acos(Math.min(1,dot(g(tn),g(tx))))*180/Math.PI;
 ok('the picture\'s giant swings between nod extremes by about 2 incDeg ('+ang.toFixed(2)+' degrees)',Math.abs(ang-2*S.giant.libration.incDeg)<.6,false);
 let seen=0,dis=0;for(let t=0;t<120;t+=.0417){const day=Math.floor(t),h=(t-day)*24,e=A.skyState(site,h,day).eclipse,v=A.sunHidden(t,site);if(e>0)seen++;if(e!==v)dis++;}
 ok('sunHidden is skyState\'s eclipse at every hour of 120 days ('+seen+' hidden hours, '+dis+' disagree)',dis===0&&seen>10,false);
 const oth=A.siteAt(200,300);let diff=0;for(let t=0;t<120;t+=.0417)if(A.sunHidden(t,site)!==A.sunHidden(t,oth))diff++;
 ok('the site matters: the eclipse\'s hour moves with longitude',diff>0,false);
 ok('no site is the bound sky\'s, else Voth',(()=>{const a=A.sunHidden(90.5);A.skySite=site;const b=A.sunHidden(90.5);delete A.skySite;return a===A.sunHidden(90.5,voth)&&b===A.sunHidden(90.5,site);})(),false);
 ok('sunHidden is 0 out of eclipse season',A.sunHidden(150.5,site)===0,false);
 ok('these are data: plain numbers',typeof L.phase==='number'&&typeof A.sunHidden(1,site)==='number'&&JSON.stringify(L).length>10,false);}
// ---- the clouds' mood (sky/89-atmos-k-cloudmood.js, 2026-11-09): the twin of layer 7 with dark, tint, turbulence and glow
{const P=A.skyPreset('standard',{clouds:{cover:.55}}),noon=at(voth,259,12),Ln=A.skyLook(P,noon,{}),mid=at(voth,259,0),Lm=A.skyLook(P,mid,{});
 const base={cam:[0,1.7,0],wind:[1,.3],time:900,air:[.6,.7,.85]},U0=A.skyCloudUniforms(P,Ln,noon,base),lum=c=>.3*c[0]+.55*c[1]+.15*c[2];
 const with_=(U,o)=>Object.assign({},U,o);
 // directions with thick cloud: scan a fan at 20 degrees up
 const dirs=[];for(let az=0;az<360&&dirs.length<6;az+=7){const d=V.fromAltAz(20,az),c=A.skyCloudAt(d,U0);if(c.a>.4)dirs.push(d);}
 ok('the twin draws cloud at noon over Voth (6 thick directions found in a fan)',dirs.length===6&&dirs.every(d=>A.skyCloudAt(d,U0).a>.4),dirs.length<6);
 const mean=(U,f)=>dirs.reduce((s,d)=>s+f(A.skyCloudAt(d,U)),0)/dirs.length;
 const l0=mean(U0,c=>lum(c.rgb)),ld=mean(with_(U0,{dark:.8}),c=>lum(c.rgb)),lz=mean(with_(U0,{dark:0}),c=>lum(c.rgb));
 ok('a dark cloud is darker than the default at the same hour ('+ld.toFixed(3)+' against '+l0.toFixed(3)+'), dark 0 the default itself',ld<.75*l0&&lz===l0,ld>=l0);
 const chroma=c=>{const s=c[0]+c[1]+c[2]||1;return[c[0]/s,c[1]/s,c[2]/s];},tint=[.42,.33,.30],dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
 const ct=mean(with_(U0,{tint,tintK:1}),c=>dist(chroma(c.rgb),chroma(tint))),c0=mean(U0,c=>dist(chroma(c.rgb),chroma(tint))),lt=mean(with_(U0,{tint,tintK:1}),c=>lum(c.rgb));
 ok('a tinted cloud is nearer its tint in hue ('+ct.toFixed(3)+' from it against '+c0.toFixed(3)+') and keeps its luminance; tintK 0 is the default',ct<.3*c0&&Math.abs(lt-l0)<.03*l0&&mean(with_(U0,{tint,tintK:0}),c=>lum(c.rgb))===l0,ct>=c0);
 // turbulence: the field between two nearby points differs more when torn
 const pairs=[];for(let i=0;i<40;i++){const x=(i*1731)%9000-4500,z=(i*2917)%9000-4500;pairs.push([[x,z],[x+230,z+100]]);}
 const rough=U=>pairs.reduce((s,p)=>s+Math.abs(A.skyCloudField(p[0],5,U)-A.skyCloudField(p[1],5,U)),0)/pairs.length;
 const r0=rough(U0),rv=rough(with_(U0,{turbulence:.9,turbKind:'violent'}));
 ok('a violently turbulent field differs between two nearby points more than the default ('+rv.toFixed(4)+' against '+r0.toFixed(4)+'); turbulence 0 is the default field',rv>1.4*r0&&pairs.every(p=>A.skyCloudField(p[0],5,with_(U0,{turbulence:0,turbKind:'violent'}))===A.skyCloudField(p[0],5,U0)),rv<=r0);
 const per=U=>pairs.reduce((s,p)=>s+Math.abs(A.skyCloudField(p[0],5,U)-A.skyCloudField([p[0][0]+U.scale,p[0][1]],5,U)),0)/pairs.length;
 const p0=per(U0),po=per(with_(U0,{turbulence:1,turbKind:'ordered'}));
 ok('an ordered field repeats every lattice cell: a point and the next cell\'s differ by '+po.toFixed(4)+' against '+p0.toFixed(4)+' in the default',po<.35*p0,po>=p0);
 const Ug=with_(U0,{turbulence:1,turbKind:'glitched'}),dt=400,shift=[U0.wind[0]*dt*U0.drift*U0.scale,U0.wind[1]*dt*U0.drift*U0.scale];
 const carried=(U,p)=>Math.abs(A.skyCloudField(p,5,with_(U,{time:U.time+dt}))-A.skyCloudField([p[0]+shift[0],p[1]+shift[1]],5,U));
 const plainC=pairs.reduce((s,p)=>s+carried(U0,p[0]),0)/pairs.length,glC=pairs.reduce((s,p)=>s+carried(Ug,p[0]),0)/pairs.length;
 ok('a glitched field is a union of sheets (never under the first by more than .05) that the page\'s wind alone does not carry: the plain field rides with it ('+plainC.toExponential(1)+'), the glitched one changes under it ('+glC.toFixed(3)+')',
  pairs.every(p=>A.skyCloudField(p[0],5,Ug)>=A.skyCloudField(p[0],5,U0)-.05-1e-9)&&plainC<1e-6&&glC>.01&&A.MOOD_SHEETS.length===2,glC<=plainC);
 // the walk: continuous, piecewise straight, turning abruptly, repeating its shape every 72 s
 {const wk=A.skyMoodWalk,legs=A.skyMoodWalkLegs(1),L0=legs[0][1],T=legs.reduce((a,l)=>a+l[1],0),v=(t)=>{const a=wk(t,1),b=wk(t+.01,1);return Math.atan2(b[1]-a[1],b[0]-a[0]);},turn=Math.abs(v(L0+1)-v(L0-1)),same=Math.abs(v(2)-v(L0-2));
  const jmp=Math.max(...[...Array(600).keys()].map(i=>{const a=wk(i*.7,1),b=wk(i*.7+.001,1);return Math.hypot(b[0]-a[0],b[1]-a[1]);})),rep=wk(T+28,1),rep0=wk(28,1),cyc=wk(T,1);
  ok('the sheets\' walk holds each heading 30-90 s ('+legs.map(l=>l[1].toFixed(0)).join(', ')+' s) and turns abruptly at a leg\'s end ('+(turn*180/Math.PI).toFixed(0)+' degrees), straight within one, never jumping, its shape repeating each cycle',legs.every(l=>l[1]>=30&&l[1]<=90)&&turn>.2&&same<1e-9&&jmp<.002&&near(rep[0]-cyc[0],rep0[0],1e-6)&&near(rep[1]-cyc[1],rep0[1],1e-6)&&Math.abs(v(5)-A.skyU3(0,2,3,150)*2*Math.PI)>1e-9,same>1e-9);}
 // pace: the mood's motions run faster, the page's own cloud untouched
 {const dt=3,chg=(U)=>pairs.reduce((s,p)=>s+Math.abs(A.skyCloudField(p[0],5,with_(U,{time:U.time+dt}))-A.skyCloudField(p[0],5,U)),0)/pairs.length;
  const Uv1=with_(U0,{turbulence:.8,turbKind:'violent',pace:1}),Uv4=with_(Uv1,{pace:4}),Ug4=with_(Ug,{pace:4}),Ug1=with_(Ug,{pace:1});
  ok('pace 4 moves a violent field more in 3 s than pace 1 ('+chg(Uv4).toFixed(3)+' against '+chg(Uv1).toFixed(3)+'), a glitched one too; a plain field ignores it',chg(Uv4)>1.5*chg(Uv1)&&chg(Ug4)>1.3*chg(Ug1)&&chg(with_(U0,{pace:4}))===chg(U0),chg(Uv4)<=chg(Uv1));}
 const Ur=with_(U0,{turbulence:1,turbKind:'ripple',turbAt:[0,0]}),nearE=pairs.filter(p=>Math.hypot(p[0][0],p[0][1])<3000),farR=[[60000,0],[0,70000],[-65000,5000]];
 ok('a rippling field differs from the plain one within a few km of its epicentre and is the plain one again 60 km out (the rings die over 8 km)',nearE.length>3&&nearE.every(p=>Math.abs(A.skyCloudField(p[0],5,Ur)-A.skyCloudField(p[0],5,U0))>1e-4)&&farR.every(p=>near(A.skyCloudField(p,5,Ur),A.skyCloudField(p,5,U0),1e-3)),nearE.every(p=>near(A.skyCloudField(p[0],5,Ur),A.skyCloudField(p[0],5,U0),1e-4)));
 {const r1=A.skyCloudField([2000,0],5,Ur),r2=A.skyCloudField([2000,0],5,with_(Ur,{time:U0.time+15})),r0=A.skyCloudField([2000,0],5,with_(U0,{time:U0.time+15}));
  ok('...and the rings move: 15 s on, the field at a fixed point has changed by more than the wind alone moved it',Math.abs(r2-r1)>1.5*Math.abs(r0-A.skyCloudField([2000,0],5,U0)),false);}
 // the glow: nothing by day, the base lit at night, only near the locus unless spread
 const Um=A.skyCloudUniforms(P,Lm,mid,base),ndirs=[];for(let az=0;az<360&&ndirs.length<6;az+=7){const d=V.fromAltAz(20,az);if(A.skyCloudAt(d,Um).a>.4)ndirs.push(d);}
 const nmean=(U,f)=>ndirs.reduce((s,d)=>s+f(A.skyCloudAt(d,U)),0)/ndirs.length,gcol=[1,.55,.2];
 const gDay=mean(with_(U0,{glow:1,glowColour:gcol}),c=>lum(c.rgb)),gN=nmean(with_(Um,{glow:1,glowColour:gcol}),c=>lum(c.rgb)),g0=nmean(Um,c=>lum(c.rgb));
 ok('the glow is zero by day (noon: the default cloud) and lights the cloud base at midnight ('+gN.toFixed(3)+' against '+g0.toFixed(3)+')',gDay===l0&&Ln.night===0&&gN>g0+.1&&ndirs.length===6,gN<=g0);
 const far=with_(Um,{glow:1,glowColour:gcol,glowLocus:[40000,40000,2000,0]}),nearL=with_(Um,{glow:1,glowColour:gcol,glowLocus:[0,0,20000,0]});
 ok('...under one patch when its locus is given with no spread: a locus 40 km off lights nothing, one overhead lights it',near(nmean(far,c=>lum(c.rgb)),g0,1e-6)&&nmean(nearL,c=>lum(c.rgb))>g0+.1,nmean(far,c=>lum(c.rgb))>g0+.01);
 ok('the glow\'s colour is the page\'s: an orange glow reddens the base more than it blues it',nmean(with_(Um,{glow:1,glowColour:gcol}),c=>c.rgb[0]-c.rgb[2])>nmean(Um,c=>c.rgb[0]-c.rgb[2])+.05,false);
 // the chunk: the same text as before on every page without a mood; with one, the mood's lines in the sky and the shade
 const was=A.skyMoodOn;A.skyMoodOn=false;const s0=A.skyGLSL(),c0_=A.cloudShadeGLSL();A.skyMoodOn=true;const s1=A.skyGLSL(),c1=A.cloudShadeGLSL();A.skyMoodOn=was;
 ok('the sky chunk without a mood is the chunk it was (no uCloudX, no atmCloudMood); with one, the mood on both cloud layers and the turbulence in the shared field, in the shade\'s chunk too',
  !/uCloudX|atmCloudMood/.test(s0)&&!/uCloudX/.test(c0_)&&/vec3 atmCloudMood\(/.test(s1)&&/c=atmCloudMood\(c,sh,cov,xz,sw\);/.test(s1)&&/c=atmCloudMood\(c,1\.0,0\.0,p\*uCloudH\.z,vec2\(0\.0\)\);/.test(s1)&&/vec2 atmMoodWalk\(/.test(s1)&&/uCloudY\.x/.test(c1)&&/uniform vec4 uCloudX/.test(c1)&&!/atmCloudMood/.test(c1),/uCloudX/.test(s0));
 ok('a preset asks for the mood by any of the four, or clouds.mood',!A.skyMoodWanted(A.skyPreset('standard'))&&A.skyMoodWanted(A.skyPreset('standard',{clouds:{dark:.5}}))&&A.skyMoodWanted(A.skyPreset('standard',{clouds:{tint:[.4,.3,.3]}}))&&A.skyMoodWanted(A.skyPreset('standard',{clouds:{mood:true}}))&&!A.skyMoodWanted(A.skyPreset('standard',{clouds:{dark:0,glow:0}})),A.skyMoodWanted(A.skyPreset('standard')));
 // the episodes: the three effects together or apart, the palette, the dark with them, deterministic by seed
 const eps=[];for(let k=0;k<80;k++)eps.push(A.moodAt(k*300+60,{seed:3}));   /* inside the hold (the first 40% of a period) */
 const on=m=>(m.tintK>0?1:0)+(m.glow>0?1:0)+(m.turbulence>0?1:0),alone=eps.filter(m=>on(m)===1).length,together=eps.filter(m=>on(m)>=2).length,quiet=eps.filter(m=>on(m)===0).length;
 ok('over 80 episodes the effects come alone ('+alone+'), together ('+together+') and not at all ('+quiet+')',alone>10&&together>10&&quiet>2&&alone+together+quiet===80,alone===0||together===0);
 const inPal=eps.every(m=>m.tintK===0||A.MOOD_PALETTE.some(c=>c.every((v,i)=>near(v,m.tint[i],1e-9))));
 ok('every tint is from the palette, the dark rides with any effect (0.35..0.9) and rests at 0 in a quiet spell, every kind named, a ripple epicentre within 2.5 km',inPal&&eps.every(m=>on(m)?m.dark>=.35&&m.dark<=.9:m.dark===0)&&eps.every(m=>A.MOOD_DEFAULTS.turbKinds.includes(m.turbKind)&&A.MOOD_DEFAULTS.glowKinds.includes(m.glowKind)&&Math.abs(m.turbOffset[0])<=2500&&Math.abs(m.turbOffset[1])<=2500),!inPal);
 ok('the palette holds six: brown, dull red, sickly green, ash, ghostly purple, jaundice yellow; four patterns, three glows',A.MOOD_PALETTE.length===6&&A.MOOD_DEFAULTS.turbKinds.length===4&&A.MOOD_DEFAULTS.glowKinds.length===3&&A.MOOD_TURB.ripple===3&&eps.some(m=>m.turbKind==='ripple')&&eps.some(m=>m.glowKind==='orbs')&&eps.some(m=>m.sheetTint===1)&&eps.some(m=>m.sheetTint===0),false);
 ok('the same seed gives the same episodes, another seed others',JSON.stringify(A.moodAt(1234,{seed:3}))===JSON.stringify(A.moodAt(1234,{seed:3}))&&JSON.stringify(A.moodAt(1234,{seed:3}))!==JSON.stringify(A.moodAt(1234,{seed:4})),JSON.stringify(A.moodAt(1234,{seed:3}))===JSON.stringify(A.moodAt(1234,{seed:4})));
 const e0=A.moodAt(300*5+10,{seed:3}),e1=A.moodAt(300*5+110,{seed:3}),e2=A.moodAt(300*5+299.9,{seed:3}),nx=A.moodAt(300*6+10,{seed:3});
 ok('an episode holds for 40% of its period and cross-fades into the next over the last 60% (gradual: the owner, 2026-11-09)',JSON.stringify(e0)===JSON.stringify(e1)&&e2.blend>.99&&near(e2.dark,nx.dark,.01)&&near(e2.turbulence,nx.turbulence,.01),e0.blend>0);
 const red=[.6,.2,.2],area=A.moodAt(450,{seed:3,tintAt:(x,z)=>x>0?red:null,eye:[100,0]}),noArea=A.moodAt(450,{seed:3,tintAt:(x,z)=>x>0?red:null,eye:[-100,0]});
 ok('an area tint (o.tintAt at the eye) decides the hue where it speaks, the episode how far; elsewhere the palette',(area.tintK===0||area.tint.every((v,i)=>near(v,red[i],1e-9)))&&(noArea.tintK===0||!noArea.tint.every((v,i)=>near(v,red[i],1e-9)))&&area.tintK===noArea.tintK,area.tintK>0&&!area.tint.every((v,i)=>near(v,red[i],1e-9)));
 ok('the glow\'s colour: the page\'s for every kind, or by kind, else the module\'s',A.moodAt(450,{glowColour:[1,.5,.2]}).glowColour[0]===1&&A.moodAt(450,{glowColours:{ethereal:[0,1,0],lightning:[0,0,1]}}).glowColour.length===3&&A.MOOD_GLOW[A.moodAt(450,{}).glowKind][0]===A.moodAt(450,{}).glowColour[0],false);
 // the glow's motion: lightning flashes within a second, the ethereal breathe never jumps
 let flashes=0,jumpE=0,minE=1,maxE=0,maxL=0;for(let t=0;t<120;t+=.05){const a=A.moodGlow(t,'lightning',1,[0,0]).k,b=A.moodGlow(t+.05,'lightning',1,[0,0]).k;if(b>a+.3)flashes++;maxL=Math.max(maxL,a);
  const e=A.moodGlow(t,'ethereal',1,[0,0]).k,e2=A.moodGlow(t+.05,'ethereal',1,[0,0]).k;jumpE=Math.max(jumpE,Math.abs(e2-e));minE=Math.min(minE,e);maxE=Math.max(maxE,e);}
 ok('lightning: '+flashes+' flashes in two minutes, each a jump within a twentieth of a second, up to '+maxL.toFixed(2),flashes>40&&flashes<200&&maxL>.8,flashes===0);
 {let ids=new Set(),withF=0,none=0;for(let t=0;t<60;t+=.05){const f=A.moodGlow(t,'lightning',1,[0,0]).flash;if(f){withF++;ids.add(f.id);if(Math.abs(f.x)>6000||f.t0>t)none++;}else none+=0;}
  ok('each flash is a record (id, its start, its place within 6 km) the host strikes a bolt from once: '+ids.size+' strikes in a minute, none placed wrong',ids.size>15&&ids.size<70&&withF>100&&none===0&&A.moodGlow(3.3,'ethereal',1,[0,0]).flash==null,ids.size===0);}
 ok('ethereal: a slow breathe between .55 and 1 (seen '+minE.toFixed(2)+'..'+maxE.toFixed(2)+'), never jumping more than .02 a twentieth of a second',jumpE<.02&&minE>=.55&&maxE<=1&&maxE-minE>.2,jumpE>=.3);
 const lf=A.moodGlow(3.3,'lightning',1,[500,-200]).locus,le=A.moodGlow(3.3,'ethereal',1,[500,-200]).locus;
 ok('a flash lights one patch (a locus within 6 km of the eye, 2-4.5 km across, spread .12); the breathe the whole sky (spread 1)',Math.abs(lf[0]-500)<=6000&&Math.abs(lf[1]+200)<=6000&&lf[2]>=2000&&lf[2]<=4500&&lf[3]===.12&&le[3]===1,lf[3]===1);
 {const o1=A.moodGlow(10,'orbs',1,[500,-200]),o2=A.moodGlow(15,'orbs',1,[500,-200]),d=Math.hypot(o1.locus[0]-o2.locus[0],o1.locus[1]-o2.locus[1]);
  ok('orbs: two small bright lights (300-600 m, k above 1.6, the second on) within 3 km of the eye, wandering ('+d.toFixed(0)+' m in 5 s)',o1.locus[2]>=300&&o1.locus[2]<=600&&o1.locus[3]===0&&o1.locus2[3]===1&&o1.k>=1.6&&Math.abs(o1.locus[0]-500)<=3000&&Math.abs(o1.locus2[1]+200)<=3000&&d>20&&le.length===4&&A.moodGlow(3.3,'ethereal',1,[0,0]).locus2[3]===0,d===0);
  const d0=ndirs[0],hx=Um.cam[0]+d0[0]/d0[1]*(Um.height-Um.cam[1]),hz=Um.cam[2]+d0[2]/d0[1]*(Um.height-Um.cam[1]);   /* where that view ray meets the cloud plane */
  const Uo=with_(Um,{glow:1,glowColour:gcol,glowLocus:[0,0,500,0],glowLocus2:[40000,0,500,1]}),Uo2=with_(Uo,{glowLocus2:[hx,hz,600,1]});
  // the sheets' colours: where a sheet shows through, the tint's complement (or its hue-rotated twin) instead of the tint
  {const Us=with_(U0,{turbulence:1,turbKind:'glitched',tint,tintK:1,sheetTint:1,cirrus:0}),comp=tint.map(v=>1-v);let dA=null,dB=null;
   for(let az=0;az<360&&!(dA&&dB);az+=3)for(let el=12;el<40&&!(dA&&dB);el+=4){const d=V.fromAltAz(el,az),k=(Us.height-Us.cam[1])/d[1],xz=[Us.cam[0]+d[0]*k,Us.cam[2]+d[2]*k];A.skyCloudField(xz,5,Us);const w=A.skySheetW;if(w[0]>.9&&!dA)dA=d;if(w[1]>.9&&!dB)dB=d;}
   const chA=dA?chroma(A.skyCloudAt(dA,Us).rgb):null,chA0=dA?chroma(A.skyCloudAt(dA,with_(Us,{sheetTint:0})).rgb):null;
   ok('with sheetTint a sheet showing through takes the tint\'s complement (nearer it than the tint there), and the base cloud keeps the tint; sheetTint 0 is the tint everywhere',!!dA&&!!dB&&dist(chA,chroma(comp))<dist(chA,chroma(tint))&&dist(chA0,chroma(tint))<dist(chA0,chroma(comp)),!!dA&&dist(chA,chroma(comp))>=dist(chA,chroma(tint)));}
  ok('...the second light lights the base too: moved from 40 km off to under a view ray it lights that cloud',lum(A.skyCloudAt(d0,Uo2).rgb)>lum(A.skyCloudAt(d0,Uo).rgb)+.05,lum(A.skyCloudAt(d0,with_(Uo2,{glowLocus2:[hx,hz,600,0]})).rgb)>lum(A.skyCloudAt(d0,Uo).rgb)+.05);}
 // the sky events: a pillar and an ascent, placed 3-8 km off, drawn where they stand and nowhere else
 {let kinds=new Set(),ids=new Set(),bad=0,pill=null,asc=null;for(let t=0;t<1200;t+=.1){const e=A.moodEvent(t,1,{chance:1});if(!e)continue;ids.add(e.id);kinds.add(e.kind);const dist=Math.hypot(e.dx,e.dz);if(dist<3000||dist>8000||e.k<0||e.k>1.01)bad++;
   if(e.kind==='pillar'&&e.k>.5)pill=pill||Object.assign({},e);if(e.kind==='ascent'&&e.k>.7&&e.h>500&&e.h<e.top-500)asc=asc||Object.assign({},e);}
  ok('moodEvent: an event a minute at chance 1 ('+ids.size+' in 20 min, both kinds), each 3-8 km off, a pillar brief and an ascent climbing for 14 s',ids.size>=18&&ids.size<=20&&kinds.size===2&&bad===0&&!!pill&&!!asc&&A.moodEvent(500,1,{chance:0})===null,ids.size===0);
  const UB=with_(Um,{glowColour:[1,1,1],pixAng:.001}),place=e=>Object.assign({},e,{x:UB.cam[0]+e.dx,z:UB.cam[2]+e.dz,ground:0,top:e.top,h:e.h});
  const P=place(pill),toP=Math.atan2(P.x-UB.cam[0],-(P.z-UB.cam[2]))*180/Math.PI,Dp=Math.hypot(P.dx,P.dz),on=V.fromAltAz(Math.atan(P.top*.3/Dp)*180/Math.PI,toP),off=V.fromAltAz(Math.atan(P.top*.3/Dp)*180/Math.PI,toP+30),above=V.fromAltAz(Math.atan(P.top*1.5/Dp)*180/Math.PI,toP);
  const lb=(d,ev)=>lum(A.skyBeamAt(d,with_(UB,{event:ev})));
  ok('a pillar lights the sky toward it between its foot and its top, nothing 30 degrees aside or above its top, nothing without an event',lb(on,P)>.05&&lb(off,P)===0&&lb(above,P)<1e-6&&lb(on,null)===0,lb(off,P)>0);
  const Aa=place(asc),toA=Math.atan2(Aa.x-UB.cam[0],-(Aa.z-UB.cam[2]))*180/Math.PI,Da=Math.hypot(Aa.dx,Aa.dz),atH=h=>V.fromAltAz(Math.atan(h/Da)*180/Math.PI,toA);
  ok('an ascending light is brightest at its height now ('+Aa.h.toFixed(0)+' m), fainter below (the trail) and dark above',lb(atH(Aa.h),Aa)>3*lb(atH(Aa.h*.5),Aa)&&lb(atH(Aa.h*.5),Aa)>0&&lb(atH(Aa.h+600),Aa)<.1*lb(atH(Aa.h),Aa),lb(atH(Aa.h*.5),Aa)>=lb(atH(Aa.h),Aa));
  const was2=A.skyMoodOn;A.skyMoodOn=true;const s2=A.skyGLSL();A.skyMoodOn=was2;ok('the chunk draws the event under the clouds when the mood is on',/vec3 atmSkyBeam\(/.test(s2)&&s2.indexOf(' col+=atmSkyBeam(d);')<s2.indexOf('vec4 cl=atmSkyClouds(d,air)')&&s2.indexOf(' col+=atmSkyBeam(d);')>0,false);}
 // what the sky did, as events for a listener
 {const f1={id:4,x:100,z:200,e:.8},e1={id:9,kind:'pillar',x:4000,z:0,dur:1};
  const r1=A.skyDiff(null,{flash:f1,event:e1,episode:2,glowKind:'lightning',turbKind:'violent',glow:.5,night:1,t:10}),r2=A.skyDiff(r1.prev,{flash:f1,event:e1,episode:2,glowKind:'lightning',turbKind:'violent',glow:.5,night:1,t:11});
  const r3=A.skyDiff(r2.prev,{flash:{id:5,x:1,z:2,e:1},event:null,episode:3,glowKind:'orbs',turbKind:'ripple',glow:.6,night:1,t:12});
  ok('skyDiff: a first frame reports the flash, the event and the episode; the same frame again reports nothing; a new flash and episode report themselves (the event ended quietly)',
   r1.events.map(e=>e.kind).join()==='flash,event,episode'&&r1.events[0].e===.8&&r1.events[1].event==='pillar'&&r1.events[1].dur===1&&r2.events.length===0&&r3.events.map(e=>e.kind).join()==='flash,episode'&&r3.events[1].glowKind==='orbs'&&r3.prev.event===9,r2.events.length>0);
  const Lo=A.skyLevels({glowKind:'orbs',glow:.5,night:1}),Lb=A.skyLevels({glowKind:'ethereal',glow:.5,night:.5}),Ld=A.skyLevels({glowKind:'orbs',glow:.5,night:0});
  ok('skyLevels: the orbs\' hum follows an orbs glow, the breathe an ethereal one, both silent by day',Lo.orbs===.5&&Lo.breathe===0&&Lb.breathe===.25&&Lb.orbs===0&&Ld.orbs===0,Lo.breathe>0);}
 ok('the noise twin reads the shader\'s volume: in -1..1, the same for the same point, smooth',(()=>{let okk=true,p=0;for(let i=0;i<200;i++){const x=[i*.37,i*.11,i*.05],n=A.skyNoiseAt(x,100);if(!(n>=-1&&n<=1)||n!==A.skyNoiseAt(x,100)||Math.abs(n-p)>.6)okk=false;p=n;}return okk;})(),false);}
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
