// ================================================================= HOST — STATION 3, the delta and Wing's floodplain (PLAN-STATIONS.md, the owner, 2026-11-02: one station, reading biomes/swbay in place)
// The great river's last 25 km on scale model 5.1, compressed into the page's 6 km: the floodplain bench (px 692-695,1041-1042, -16 to -27 m, the one flat reach of the gorge) with Wing's ruin (px 699,1042) on it, the
// last descent (695,1039 to 699,1025: -95 to -782 m in 14 km; here five cataracts, 55 m), and the fan delta on the Ring Sea's arm (top at the sea's level, steep front), which lies in the SW Bay polygon.
// THE FLOOD PULSE: a seasonal WATER.still over the bench, a few metres over the low river, on the world clock (high in winter, the frontal rains x1.6). core/water has no seasonal flow, so the ribbon stays and the
// still rises over it. Levees, backswamps, oxbows and bars are this fragment's fields: the proposed `delta` relief kind is NOT in core (it needs the owner's yes); the fan is written here, as a function of (s, t).
// Wing's ground is carved and published (`window._wingSite`, stations/delta/site.json); its settlement plan dresses it.
// Read in place: swbay's splay on the levees and its stepped cataracts' habit (WATER.fallsOf). Not read: eastabyss's mat reed (the kit's reed stands in the backswamps), swbay's hyper-mangrove (not wired in swbay yet).
const STATION_FOG={falloff:1/420,sun:.3,sky:.35,mist:{density:.0018,y:-1,depth:10,noise:.7}};
const STATION_STAGE=(function(){const {smooth,mix,clamp,fbm}=BIO.fn,S=stationStrata(8133);
 const YB=56,APEX=-450,FALLS=[-380,-240,-90,60,210],SITE_S=1750,SITE_R=170;
 const Y=s=>FALLS.reduce((a,c)=>a+(YB-1.2)/5*smooth(c-16,c+16,s),0);   /* the river's low-water surface */
 const W=s=>s>350?46:s>APEX?38:mix(16,34,smooth(-1900,APEX,s));
 const SPREAD=s=>smooth(APEX,-1800,s)*1000,OFF=[-1,-.58,-.16,.22,.62,1];
 const chT=(k,s)=>RIVER_T(s)+SPREAD(s)*(OFF[k]+.34*(fbm(s*.0016,k*3.1,821+k,2)-.5));
 const dCh=(s,t)=>{if(s>APEX)return Math.abs(t-RIVER_T(s));let d=1e9;for(let k=0;k<6;k++)d=Math.min(d,Math.abs(t-chT(k,s)));return d;};
 const F=s=>mix(120,mix(150,540,smooth(250,620,s)),smooth(-700,-300,s));
 const WALL=s=>320*smooth(-760,-220,s);
 const siteD=(x,z)=>{const a=xzOf(SITE_S,RIVER_T(SITE_S)+340);return Math.hypot(x-a[0],z-a[1]);};
 const bar=(x,z)=>smooth(.56,.62,fbm(x*.011,z*.011,824,2));
 function h(x,z){const s=sOf(x,z),t=tOf(x,z),d=dCh(s,t),w=W(s);let g;
  if(s<APEX+200){const fan=1.0+.0016*(s+1900),lev=.9*smooth(w*6,w*1.5,d),pool=fbm(x*.0052+4,z*.0052-3,822,2);g=fan+lev-3.4*smooth(w*5,w*9,d)*smooth(.47,.36,pool)+.5*(fbm(x*.01,z*.01,823,2)-.5);
   g=mix(g,-1.6,smooth(w*1.3,w*.65,d));if(d<w*1.2)g=Math.max(g,mix(g,.75,bar(x,z)*smooth(w*.3,w*.8,d+w*.2)));
   /* the sand spit, the swell's: a lagoon behind it on the fan's south-west wing */
   const si=seaIn(x,z),st=t-RIVER_T(s);if(si<-30&&si>-170&&st>200&&st<1300)return Math.max(stationSea(x,z,g,16),.7*smooth(-170,-120,si)*smooth(-30,-70,si)*smooth(200,320,st)*smooth(1300,1150,st)-.3);}
  if(s>APEX-300){const q=clamp((d-F(s)-40*(fbm(x*.004,z*.004,825,2)-.5))/420,0,1),y=Y(s),bench=s>330,ox=bench?smooth(.34,.3,fbm(x*.006,z*.006,826,2))*smooth(F(s),F(s)*.6,d)*smooth(w*2,w*4,d):0;
   let u=(bench?YB+.9-2.6*ox:y+6)+(bench?1.0*smooth(w*5,w*1.6,d):0)+WALL(s)*(.25*smooth(0,.3,q)+.4*smooth(.36,.62,q)+.35*smooth(.7,.95,q))+q*q*50*(fbm(x*.0018,z*.0018,827,3)-.5);
   if(S&&q>.02&&q<.98)u=S.terrace(x,z,u,.6);
   u=mix(u,y-3.2,smooth(w*1.35,w*.7,d));if(bench){const c=siteD(x,z);u=mix(YB+1.1,u,smooth(SITE_R*.8,SITE_R*1.3,c));}
   g=s<APEX+200?mix(g,u,smooth(APEX-300,APEX+200,s)):u;}
  return stationSea(x,z,g,18);}
 const over=(x,z)=>h(x,z)-Y(sOf(x,z));
 const barK=(x,z)=>{const s=sOf(x,z),d=dCh(s,tOf(x,z)),w=W(s);return s<APEX&&d<w*1.2?bar(x,z):0;};
 const talus=(x,z)=>{const s=sOf(x,z);if(s<-600)return 0;const q=clamp((dCh(s,tOf(x,z))-F(s))/420,0,1);return smooth(0,.06,q)*smooth(.2,.1,q);};
 const floodPoly=()=>{const L=[],R=[];for(let s=345;s<=3500;s+=110){const c=RIVER_T(s),f=F(s)+50;L.push(xzOf(s,c+f));R.unshift(xzOf(s,c-f));}return L.concat(R);};
 return{terrainH:h,riverY:Y,riverW:W,riverFrom:APEX-60,riverD:(x,z)=>dCh(sOf(x,z),tOf(x,z)),rapids:[.02,.08],riverLook:[0x5a7e62,0x20403a],falls:{steep:.3,minDrop:3.5},springs:[],strata:S,
  flood:{low:YB-1.2,high:YB+2.2,poly:floodPoly,lagD:45,sharp:1.5},
  kinRules:[{from:'canepalm',to:'swbay.splay',share:.3,salt:0x6e41,zone:Z=>Z.rip>.4}],
  fields:{tropic:(x,z)=>.82*smooth(300,-500,sOf(x,z)),dry:(x,z)=>.8*smooth(60,240,over(x,z))*smooth(-700,-200,sOf(x,z)),wet:(x,z)=>mix(.92,.5,smooth(40,240,over(x,z))),upland:(x,z)=>clamp((over(x,z)-40)/240,0,1)},
  mask:(x,z)=>{const s=sOf(x,z),d=dCh(s,tOf(x,z)),w=W(s);if(d<w*1.25)return 0;if(s>330&&siteD(x,z)<SITE_R)return 0;const e=5,sl=Math.hypot(h(x+e,z)-h(x-e,z),h(x,z+e)-h(x,z-e))/(2*e);return sl>.62?0:1;},
  rock:(x,z,sl)=>Math.max(smooth(.55,1,sl),.7*barK(x,z)),
  split:(x,z)=>{const s=sOf(x,z),d=dCh(s,tOf(x,z));return d<W(s)*1.9;},
  build:()=>({talus:stationBoulders(talus,{seed:8134,dens:.8,r:1.5,tint:0xa88870,label:'Talus under the walls'}),bars:stationBoulders(barK,{seed:8135,cell:9,dens:.5,r:.35,tint:0x9a8f80,range:800,label:'Gravel on a bar'})}),
  region:{name:'The delta and Wing\'s floodplain',x:0,z:0,r:3000,h:520},
  site:()=>{const a=xzOf(SITE_S,RIVER_T(SITE_S)+340);window._wingSite={name:'Wing',px:[699,1042],x:+a[0].toFixed(1),z:+a[1].toFixed(1),y:YB+1.1,r:SITE_R,flood:[YB-1.2,YB+2.2]};},
  checks:add=>{const L=WATER.surfaces.find(q=>q.seasonal);add('the bench floods with the season',(()=>{if(!L)return{ok:false,detail:'no seasonal surface'};const lo=L.levelOf(0),hi=L.levelOf(1),n=WATER.stepSeasons(KHOST.host.clock);return{ok:hi-lo>3&&n>=1,detail:'low '+lo+', high '+hi+', now '+L.level.toFixed(2)+'; '+n+' stepped'};})());},
  views:()=>{const v=(s0,t0,h0,s1,t1,h1)=>{const a=xzOf(s0,RIVER_T(s0)+t0),b=xzOf(s1,RIVER_T(s1)+t1);return[a[0],Math.max(0,h(a[0],a[1]))+h0,a[1],b[0],Math.max(0,h(b[0],b[1]))+h1,b[1]];};
   return{'The fan from above':v(-2300,-300,420,-1000,0,0),'The braids':v(-1250,120,26,-1500,0,1),'A gravel bar':v(-900,30,6,-1000,0,.5),'The backswamp':v(-1300,420,5,-1200,300,1),'The sand spit':v(-2050,700,40,-1800,600,0),
    'The last cataracts':v(-420,0,30,120,0,20),'A cataract':v(120,10,14,20,0,0),'The floodplain':v(420,0,60,1800,0,0),'Wing\'s ground':v(1500,180,14,1750,340,1),'The flood forest':v(1100,190,3,1250,240,8),'The bench in full':v(3000,-200,160,500,100,0)};}};})();
const STATION_FAR={h:(x,z)=>STATION_STAGE.terrainH(x,z),label:'The river\'s country past the map'};
