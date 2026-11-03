// ================================================================= HOST — STATION 2, THE LAKE MARGINS (PLAN-STATIONS.md; map 5.1: within 15 m of the plan)
// The page's map, source and host, with this record's ground and fields (45-host-stage.js reads MARGINS as MG): under 500 m of dense hot air round the lakes (Aw at px 191,364: ~320 m, 1.54 atm, ~770 mm),
// the Pantanal's and the Llanos' kind of country.
//   the FLATS     the seasonal floodplain: tall grass over dry soil, a few trees, pools; below the wet season's line, so the flood (87, 89w) lies on them for months
//   the GALLERY   forest along the river, the rainforest strip's wettest end carried inland (the kit's rain zone, where the water raises `wet`)
//   the STRIP     the Af rainforest at the lake, where the kit already draws it
//   the MONSOON   a low rise near (201,399): the kit's gums on Am ground, semi-deciduous (lance `monsoon` season, 50)
//   the MOUNDS    termite mounds, each an island of trees above the flood (87)
const MARGINS=(function(){const {smooth}=BIO.fn,N=(x,z,f,s,o)=>KRAND.fbm(x*f,.5,z*f,o||3,s)-.5,sOf=(x,z)=>(x+z)*Math.SQRT1_2,tOf=(x,z)=>(x-z)*Math.SQRT1_2;
 const amK=(s,t,x,z)=>smooth(1000,620,Math.hypot(s-620,t+1250)+260*N(x,z,.002,611,2));
 const savK=(s,x,z)=>smooth(-1520,-1120,s+120*N(x,z,.0016,612,2));
 const M={region:'The lake margins (ideal type)',hint:'Station 2: the lake margins: a seasonal floodplain savanna, gallery forest along the channels, monsoon forest on a low rise, termite mounds, a burn mosaic',amK:(x,z)=>amK(sOf(x,z),tOf(x,z),x,z),savK:(x,z)=>savK(sOf(x,z),x,z),
  baseH(x,z,s,t){return .95+2.2*smooth(-1500,-300,s)*.3+.7*N(x,z,.0026,613,3)*2-1.5*smooth(-.12,-.2,N(x,z,.0052,614,2))*savK(s,x,z)+5.5*amK(s,t,x,z)+70*smooth(1300,3200,s);},
  bindFields(F,h){const f0=F.flow;M._flow=f0;
   F.tropic=(x,z)=>1-.5*M.amK(x,z);
   F.dry=(x,z)=>M.savK(x,z)*(1-f0(x,z))*(1-M.amK(x,z))*.92;
   F.wet=(x,z)=>{const a=M.amK(x,z),sv=M.savK(x,z);return Math.max(.96*(1-sv)+.56*sv+.2*a,.97*f0(x,z));};
   F.upland=(x,z)=>0;
   M.treeK=(x,z)=>Math.max(1-M.savK(x,z),f0(x,z),M.amK(x,z),.05);},
  views(v){const a=v.viewAxis,grown=(s0,t0)=>{for(let r=0;r<1500;r+=60)for(let k=0;k<12;k++){const s=s0+Math.cos(k*.52)*r,t=t0+Math.sin(k*.52)*r,p=v.xzOf(s,t);if(burnAge(p[0],p[1])>6&&FIELD.dry(p[0],p[1])>.6)return[s,t];}return[s0,t0];},g=grown(-200,500),h=grown(0,900);return{'The flats':a(g[0],g[1],3,g[0]+700,g[1]-700,3),'Tall grass':a(h[0],h[1],1.7,h[0]+300,h[1]+200,1.5),'Gallery forest':a(-120,RIVER_T(-120)+160,5,300,RIVER_T(300),16),'The lake strip':a(-1700,300,6,-1050,300,14),'Monsoon forest':a(200,-1000,4,640,-1260,22),
   'The flood line':a(-900,-900,14,-200,-200,1),'From above the flats':a(1800,1200,240,-800,-200,0),'The Inner Wall':a(1100,-250,30,5600,250,700)};},
  checks(add){const st=window._station||{};
   add('the flood rises and falls with the season',(()=>{const S=window._flood;if(!S)return{ok:false,detail:'no seasonal flood'};const lo=S.levelOf(0),hi=S.levelOf(1);return{ok:Math.abs(hi-lo-1.3)<1e-6,detail:'low '+lo+' m, high '+hi+' m'};})());
   add('the burn mosaic: none in the gallery or the monsoon forest',(()=>{if(!FIRE)return{ok:false,detail:'no fire history'};let inF=0,b=0;for(let i=0;i<4000;i++){const x=(KRAND.unit(KRAND.hash(7,i,1))-.5)*5400,z=(KRAND.unit(KRAND.hash(7,i,2))-.5)*5400,a=FIRE.ageAt(x,z);if(a<10){b++;if(M.amK(x,z)>.9||M.savK(x,z)<.05)inF++;}}return{ok:!inF&&b>40,detail:b+' of 4000 burnt within 10 years; in the forest: '+inF};})());
   add('the station species drawn',(()=>{const need={grass:20000,mound:20,floodpalm:15,floodfig:6,floatmat:200},bad=Object.keys(need).filter(k=>!((st[k]||0)>=need[k]));return{ok:!bad.length,detail:Object.keys(need).map(k=>k+' '+(st[k]||0)).join(', ')};})());}};
 return M;})();
