// ================================================================= HOST — STATION 2, the canyons and the green valleys (PLAN-STATIONS.md; the final rebuild, 2026-11-02)
// Scale model 5.1 at px 1279,1111 (old canvas 1007,781): Csa at 2,156 m (Cfa and BSk round it), 612 mm, +13 degC (24/1), 3.2 km of relief within
// 30 km: the Grand Staircase Gemini cut into the polygon (five formation steps, +900 to +4,000 m). The page compresses one reach of it into 6 km:
//   THE STAIRCASE five cliffs of the canyon recipe's sandstones rising east (70 to 110 m each, every bed's ledge baked into the ground by
//                 S.terrace, so the benches a juniper roots on are the beds the eye sees), a bench of sagebrush and pinyon-juniper on each tread
//   THE RIVER     comes down from the east through the steps in a canyon, a Zion narrows in the upper steps (walls 100-150 m over the floor),
//                 widening to a GREEN VALLEY on the lowest tread: cottonwood, maple, gambel oak, rose weepers and umbels on its floor
//   TALUS         banked at every cliff's foot: a field the placement reads (boulders under each wall, 89z: LAND.build)
const STATION=(function(){const R=3000;
 const STEPS=[[-1900,70],[-800,90],[300,110],[1350,80],[2350,100]];   /* each cliff: its foot's x on z=0 and its rise */
 const off=(z,i)=>150*Math.sin(z*.0009+i*1.7)+50*Math.sin(z*.0037+i);
 const footX=(i,z)=>STEPS[i][0]+off(z,i);
 const S=BIO.strata({recipe:'canyon',seed:5822,range:[0,1100],dip:[.6,-.8,.004],warp:[8,2.2],res:.25,dust:0xc4a084});
 const base=(x,z)=>190+.012*(x+R)+14*(fbm(x*.0008-5,z*.0008+2,19,3)-.5);
 function stepsH(x,z){let h=0;for(let i=0;i<STEPS.length;i++){const f=footX(i,z),st=smooth(f-30,f+40,x);h+=STEPS[i][1]*st+5*Math.sin(clamp((x-f+30)/70,0,1)*Math.PI*2)*smooth(0,.4,st)*smooth(1,.6,st);}return h;}
 const line=x=>200*Math.sin(x*.0007+.4)+90*Math.sin(x*.0019-.7)+30*Math.sin(x*.006);
 const ground=(x,z)=>base(x,z)+stepsH(x,z)+18*(fbm(x*.003,z*.003,67,2)-.5)*smooth(.3,0,Math.abs(stepsH(x+6,z)-stepsH(x-6,z))/12);
 // the river's floor: below the treads by 60 m at the top of the staircase, by 8 m at its foot, never climbing downstream (west)
 const bedY=x=>{let lo=1e9;for(let xx=x;xx<=R*1.1+40;xx+=40)lo=Math.min(lo,base(xx,line(xx))+stepsH(xx,line(xx))-mix(8,60,smooth(-2400,1200,xx)));return lo;};
 const BED=[];for(let x=-R*1.15;x<=R*1.15;x+=20)BED.push(bedY(x));const bed=x=>{const t=(x+R*1.15)/20,i=clamp(Math.floor(t),0,BED.length-2),f=clamp(t-i,0,1);return BED[i]*(1-f)+BED[i+1]*f;};
 const W=x=>mix(95,30,smooth(-1600,400,x))*(1+.15*Math.sin(x*.003)),uo=x=>mix(3.4,1.35,smooth(-1800,200,x));
 const talusK=(x,z)=>{let t=0;for(let i=0;i<STEPS.length;i++){const d=footX(i,z)-30-x;t=Math.max(t,smooth(-15,10,d)*smooth(90,30,d)*STEPS[i][1]/110);}return t*(1-smooth(W(x)*1.6,W(x),Math.abs(z-line(x))));};
 const L=stationLand({R,ground,groundN:560,strata:S,ledges:.6,
  river:{line,bed,W,uo,name:'The river (through the staircase)',width:22,speed:1.4},
  cold:(x,z,h)=>.03+(h-180)/1500+.04*(fbm(x*.002,z*.002,133,2)-.5),
  wet:(x,z,h)=>.2+.12*smooth(800,-1600,x)+.06*fbm(x*.0016,z*.0016,139,2)+.18*smooth(W(x)*5,W(x)*1.4,Math.abs(z-line(x))),
  rockAt:(x,z,h,sl)=>smooth(.42,.7,sl),strataK:(x,z,h,sl)=>smooth(.32,.62,sl),
  rim:(x,z,h)=>{const d=Math.abs(z-line(x))/W(x),u=uo(x);return smooth(u*.95,u*1.05,d)*smooth(u*1.7,u*1.2,d);},
  talus:talusK,upland:h=>(h-180)/500,
  spine:[[-2600,line(-2600)],[-1400,line(-1400)],[-200,line(-200)],[1000,line(1000)],[2200,line(2200)],[-1200,-1500],[-1200,1500],[0,-1800],[200,1700],[1500,-1500],[1700,1600],[2700,-800],[2700,900]],
  rock:()=>[]});
 L.STEPS=STEPS;L.footX=footX;L.line=line;L.W=W;L.uo=uo;L.talusK=talusK;return L;})();
const TERR=STATION.TERR,VENTS=null,POOLS=[],POOLL=[],TARN=null,TARNL=-1e9,RIVER_SPEC=STATION.RIVER_SPEC,SPINE=STATION.SPINE,STRATA=STATION.STRATA,ROCK=STATION.ROCK;
function terrainH(x,z){return STATION.terrainH(x,z);}
function waterH(x,z){return STATION.waterH(x,z);}
function poolD(x,z){return[1e9,-1];}
function fieldsAt(x,z,h,slope){return STATION.fieldsAt(x,z,h,slope);}
const LAND={name:'The canyons and green valleys (ebadlands station 2)',title:'Krator biome — the eastern badlands: the canyons and green valleys',
 hint:'Station 2 of the eastern badlands: five steps of the staircase in bedded sandstone, a river down through them in a Zion canyon, a green valley on the lowest tread, pinyon-juniper on the benches (Csa/Cfa/BSk, 2.2 km on the model)',
 region:{name:'The canyons and green valleys (station 2)',x:0,z:0,r:TERR.R,h:900},arcade:false,species:['cottonwood','oak','maple','weeper','umbel','pinyon','juniper','ponderosa','aspen','yucca'],sky:{px:1007,py:781},
 fog:{falloff:1/800,sun:.35,sky:.3,mist:{density:.0011,y:220,depth:14,noise:.6}},climate:{dry:true,wet:false},snowLine:null,groundN:560,kgTri:{from:.35,to:.7,far:250},   /* KGROUND's side planes on the walls (the Zion narrows: 100-150 m, steep and near) */
 groundLayers:['clay','sandstone','steppe','needles','redwall'],
 far:(x,z,S0)=>{const g=terrainH(clamp(x,-S0,S0),clamp(z,-S0,S0)),dx=Math.max(0,x-S0),dw=Math.max(0,-S0-x);
  return g+120*Math.floor(dx/900)+dx*.03-dw*.08+70*(fbm(x*.0009,z*.0009,412,3)-.5)*smooth(0,1500,Math.max(Math.abs(x),Math.abs(z))-S0);},
 farBands:[300,700,1100,1500,9000],farLabel:'The staircase past the map: its steps rising on east toward the high plateaus',
 exportBox:(function(){const x=-1500,z=STATION.line(-1500);return[x-150,z-150,x+150,z+150];})(),
 build:()=>({talus:landBoulders((x,z)=>STATION.talusK(x,z),{seed:5851,dens:.75,r:1.5,cell:18,tint:0xb07a5e,label:'Talus under the cliff'})}),
 views:H=>{const {P,look,atTree,nearTree,gh}=H,ln=STATION.line,W=STATION.W,fx=STATION.footX;
  const along=(x,dz,dy,x2,dz2,dy2)=>[x,gh(x,ln(x)+dz,dy),ln(x)+dz,x2,gh(x2,ln(x2)+dz2,dy2),ln(x2)+dz2];
  return{
  'Zion, the river in the canyon':along(900,8,3,600,0,12),
  'The canyon from the rim':(function(){const x=800,z=ln(x)-W(x)*STATION.uo(x)*1.3;return[x,gh(x,z,24),z,x-250,gh(x-250,ln(x-250),4),ln(x-250)+W(x-250)*.4];})(),
  'The green valley':along(-1900,-220,14,-1300,30,2),
  'Cottonwoods on the floor':atTree(nearTree('cottonwood',-1500,ln(-1500)),45,1.8,3),
  'Gambel oak and maple':atTree(nearTree('oak',-900,ln(-900)),30,2.2,2.5),
  'Rose weepers and giant umbels':atTree(nearTree('weeper',P.vale[0],P.vale[1]),30,1.4,2.5),
  'Sagebrush and pinyon-juniper on a bench':atTree(nearTree('juniper',P.steppe[0],P.steppe[1]),22,2.0,2.5),
  'The staircase from the floor':(function(){const z=-1300;return[-2700,gh(-2700,z,30),z,1200,gh(1200,z,120),z+200];})(),
  'Talus under a cliff':(function(){const z=1200,x=fx(2,z)-130;return[x,gh(x,z,8),z,fx(2,z)+50,gh(fx(2,z)+50,z,-20),z+50];})(),
  'The beds of a cliff (its ledges)':(function(){const z=-900,x=fx(3,z)-90;return[x,gh(x,z,25),z,fx(3,z)+30,gh(fx(3,z),z,40),z+20];})(),
  'The whole staircase':look(-3200,2600,650,900,-300,150)};},
 probes:{wall(){let bx=0,bz=0,bs=-1;for(let z=-1500;z<=1500;z+=150)for(let x=STATION.footX(2,z)-40;x<STATION.footX(2,z)+60;x+=3){const s=FIELD.slope(x,z)*FIELD.strata(x,z);if(s>bs){bs=s;bx=x;bz=z;}}return[bx,bz];},
  bed(){const x=400;return[x,STATION.WL(x)-1.6,STATION.line(x)];}}};
