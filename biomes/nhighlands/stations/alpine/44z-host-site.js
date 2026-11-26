// ================================================================= HOST — station 4, the alpine: the SITE (read by station 2's 45-host-stage.js, the base)
// PLAN-STATIONS.md station 4 (Dsc, ET). Scale model 5.1: the densest Dsc/ET ground near the plateau is round px 610,810 (the climate raster, read 2026-11-09),
// and the geology bake puts it on the crater wall's IMPACT province: the cirque's headwall and steps are megabreccia (station 1's: KGROUND `clast` with the
// library's rock.megabreccia; STATION_BRECCIA). The look: whitebark and foxtail pines at the tree line, krummholz above, then fell-field, talus under the steps,
// snowbeds that last into summer in the shaded (south-facing) hollows, a tarn under the cirque's headwall. Heights in the kit's page scale: ~1500-1950 m
// (above station 1's crest), the kit's alpine band (cold .85-1).
const SITE={
 name:'The alpine (station 4)',R:2400,breccia:true,
 ramp:s=>1640+260*(s/3394)+120*smooth(1200,3394,s),
 farNW:d=>-d*.16-300*smooth(0,6000,d),farSE:d=>d*.32+1200*smooth(1500,12000,d),
 relief:{spur:[90,140],swell:60,grain:18},
 domes:[],knolls:[{x:-1200,z:-900,R:380,h:30},{x:400,z:1300,R:300,h:24}],
 // the cirque's headwall (above the tarn: the stream leaves the tarn below it) and a lower rock step the stream falls over
 scarps:[{s0:2050,amp:70,a:120,f:.0019,ph:.2,seed:74},{s0:300,amp:30,a:160,f:.0014,ph:1.4,seed:75}],
 stream:{name:'The tarn\'s outflow',src:1750,end:-3300,t0:60,a1:150,f1:.0012,p1:.5,a2:60,f2:.0035,p2:.9,halfW:[1.2,3.2],dep:[.3,.6],Wv:[110,80],Vd:[14,30]},
 tarn:{name:'The cirque tarn',r:95,depth:7,gradient:{centre:0x16324a,rim:0x4a7a8a,power:1.6}},
 // the alpine: the tree line's band low on the map (cold .8-.9), fell-field and snow above; the shaded (south-facing) side colder
 climate:F=>({cold:.8+.17*smooth(1480,1980,F.h)+.05*Math.max(0,-F.north)-.04*Math.max(0,F.north)+.04*F.n2+.03*F.valley,
  wet:.36+.22*F.valley+.3*F.flow+.08*F.n1,rock:Math.max(smooth(.5,.95,F.slope),.35*smooth(.05,.25,F.n1)),mist:.2*F.valley+.25*smooth(1800,1950,F.h)}),
 // TALUS (the scree under the steps and the steep), SNOWBED (shaded hollows that hold snow into summer), FELL (the stony open ground above the trees)
 extra:{names:['talus','snowbed','fell'],at:(F,c)=>{let tl=0;for(const Sc of SCARPS){const d=F.s-scarpAt(Sc,F.s,F.t).sc;tl=Math.max(tl,smooth(-260,-30,d)*smooth(30,-10,d)*(Sc.amp/70));}
  return{talus:Math.max(tl*.9,smooth(.55,.9,F.slope)*.6),snowbed:smooth(-.1,-.55,F.north)*smooth(.2,.6,F.valley+.3*F.n2+.2)*smooth(.86,.95,c.cold),fell:smooth(.9,.97,c.cold)*(1-smooth(.5,.8,F.slope))};}},
 spine:[[1900,60],[600,0],[-800,-300],[-2200,200]]};
SITE.sky={px:610,py:810,pressure:.82,humidity:.45,clouds:{cover:.3,cumulus:.7,cirrus:.4}};
