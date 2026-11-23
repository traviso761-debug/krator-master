// ================================================================= HOST — the site: STATION 8, SOUTH GLASS (PLAN.md section 11.2; 2026-11-16)
// Gemini's showcase station 8, "Firebliss Obsidian Pancake Dome" (openworld/GEOLOGY-STATIONS-5.1.md): the pancake dome dome_fb_south (South Glass,
// 5.1 px 175,1335; 44y draws it) from its south-east moat.
// THE SITE (scale model 5.1 as it stands, read at build time by model_site.py): the page's middle at px 177.9,1337.0, 7.05 km from the dome's middle
// on a bearing of 125 degrees, so its wall crosses the page; a page on the dome's middle would be all flat top. The model's ground here is a broad
// ridge at ~4,560 m under the dome falling south-east into a basin at 4,180-4,300 m (the moat: edit 2 dams it into a pit, no water on the model).
// ET; mean -7.7 degC (warm month 2.4, cold -17.9), 584 mm; 0.94 atm on the moat, 0.85 on the top. The spec's 2,890 m moat, 3,290 m top and 1.11-1.16
// atm are not this spot's: the model wins (PLAN.md section 11.2, as built).
// THE MAP (x east, z south, north is -z; origin at the page's middle, R 2600):
//   THE TOP        South Glass's flat top over the north-west third: the glass carapace, pumice in the ridges' troughs, the ogives, obsidian spines
//                  along the crest (66), snow lying thin on the glass
//   THE WALL       from (~700,-2600) to (~-2300,1700): the glass and flow-banded core (KSTRATA obsidian-pancake, 84s), then the autobreccia apron
//   THE WAY UP     the slumped lobe at bearing 110 (its foot ~(1800,-1250)): a talus ramp with the knappers' cairns up it (66)
//   THE CRACKS     four radial cracks through the apron, steaming at their feet (the geyser kit's fumaroles, one small acid field, two warm pools at
//                  the basal contact and their mats); the ground warm along them (KTHERM: the snow bare there)
//   THE MOAT       ash with Copper Glacier's cold flora, richer on the warm ground; two gas hollows by the cracks
//   THE CAMP       a Kimr knapping camp on the pumice bench (core/camp), its knapping floors and aurochs-horn cairns, the quarry at the apron's foot (66);
//                  the Kimr trail up from the Labyrinth to the south
const SITE={key:'glass',name:'South Glass (an obsidian pancake dome)',region:'South Glass, a pancake dome of the Firebliss Range (ideal type)',
 tarn:null,river:null,glass:true,
 bench:(x,z)=>GLASS.bench(x,z),
 // nothing roots on the dome (47's root mask): its glass top, its wall and its talus (the rocks of 66 are not rooted and ignore it)
 bare:(x,z)=>{const s=GLASS.shape(x,z);return s.d<-2||GLASS.raise(x,z,s)>2;},
 // the thermal layout at the cracks' feet (found from the dome on the model's ground: read once, by 47, after the stage)
 get thermal(){if(this._th)return this._th;const C=GLASS.cracks(),out=(f,d)=>{const a=GLASS.angOf(f.b);return[f.x+Math.cos(a)*d,f.z+Math.sin(a)*d];};
  const F=C.map((c,i)=>{const p=out(c.foot,25),q=out(c.foot,-110);return[{x:p[0],z:p[1],r:26,n:3},{x:q[0],z:q[1],r:14,n:2}];}).reduce((a,b)=>a.concat(b),[]);
  const ac=out(C[2].foot,60),s1=out(GLASS.foot(121),45),s2=out(GLASS.foot(136),40);
  return this._th={seed:4408,amb:-8,runLen:160,geysers:[],
   springs:[{key:'contact1',name:'A warm spring at the glass\'s foot (snowmelt through the dome, out at the tuff)',kind:'pool',x:s1[0],z:s1[1],r:5,temp:.5,out:1},
    {key:'contact2',name:'A warm pool at the basal contact (its mats in the run-off)',kind:'pool',x:s2[0],z:s2[1],r:7,temp:.62,out:2}],
   acid:[{key:'crack',name:'The steaming crack\'s foot (altered perlite and sulphur)',x:ac[0],z:ac[1],r:40,mud:0,fumaroles:6}],
   fumaroles:F,
   flats:[{key:'contactflat',name:'The warm pool\'s sinter apron',x:s2[0],z:s2[1],rx:48,rz:30,a:.6}],
   dead:[],terraces:[]};},
 thermalOnly:true,   /* the geyser kit's sinter and show only (89z): no thermal trees or floor at 4,200 m */
 // the warm ground along the cracks (KTHERM, 47): the snow bare in strips (SITE.snowBare, 89a)
 get vents(){if(this._v)return this._v;const v=[];GLASS.cracks().forEach(c=>{const a=GLASS.angOf(c.b),ca=Math.cos(a),sa=Math.sin(a);
   for(let r=c.r0+40;r<c.r1;r+=70)v.push({x:GLASS.C[0]+ca*r,z:GLASS.C[1]+sa*r,T:r>c.foot.r-60?60:38,reach:r>c.foot.r-60?70:40,decay:1.8});});return this._v=v;},
 snowBare:true,
 iceAt:null,
 coldAt:(x,z,h,T)=>1-smooth(SOIL+4,SOIL+24,T),
 // the gas hollows: dips in the moat 140 m past two cracks' feet (the fumaroles' CO2 pools in them on still nights; 86)
 get hollows(){const C=GLASS.cracks();return[[1,140,'A hollow past the crack\'s foot (the gas lies here on still nights)'],[2,150,'A hollow in the moat (dead birds in it)']].map(([i,d,name])=>{
   const f=C[i].foot,a=GLASS.angOf(f.b);return{x:f.x+Math.cos(a)*d,z:f.z+Math.sin(a)*d,r:45,d:3,name};});},
 // the knapping camp on the pumice bench (core/camp: 65), the Kimr trail up from the Labyrinth (south), no butchery here
 camp:{culture:'kimr-hunt',id:'kimr:glass',x:350,z:1350,pad:30,way:[-.6,-.8],name:'A Kimr knapping camp (obsidian)'},
 trail:{name:'The Kimr trail (cairns up from the Labyrinth to the Glass)',pts:[[1100,2590],[880,2150],[620,1750],[420,1420]],people:'kimr'},
 butchery:[],
 floor:[0,0],
 // the dome's own fields (47: glass the carapace, pumice the bench and the top's troughs; the wall's rock, the apron's talus, the ash and snow over them)
 fieldNames:['glass','pumice'],
 fields(x,z,h,slope,o,T){const s=GLASS.shape(x,z),rs=GLASS.raise(x,z,s),sm=GLASS.sm;
  const top=sm(6,-14,s.d),cliff=sm(-8,2,s.d)*sm(s.wc+30,s.wc+4,s.d)*sm(25,80,s.hc),apron=sm(s.wc-4,s.wc+24,s.d)*sm(-2,6,rs)*(1-top);
  const t=GLASS.ogive(s),trough=sm(.22,.06,Math.min(t,1-t))*sm(.42,.6,KRAND.fbm(x*.004,.5,z*.004,2,8105)),bw=GLASS.benchW(x,z);
  const pumice=Math.max(top*trough*.9,bw),glass=top*(1-pumice);
  return{glass,pumice,rock:Math.max(cliff,o.rock*(1-apron)*(1-top)),moraine:Math.max(o.moraine*(1-top),apron*.95),ash:o.ash*(1-top)*(1-apron)*(1-bw),
   snow:o.snow*(1-.6*top)*(1-.4*apron)*(1-bw),flat:o.flat*(1-top)*(1-apron)};},
 // the ground (84): the glass and pumice ride the ice and meadow slots (this station has neither), eight library layers (the wall's rock is 84s's MAT_WALL, so both materials stay under 16 texture units)
 groundAttr(a,A){a[9]=A('glass');a[1]=A('pumice');return a;},
 groundPaint(c,A){const L=(r,g,b,t)=>{c.r+=(r-c.r)*t;c.g+=(g-c.g)*t;c.b+=(b-c.b)*t;};
  L(.38,.37,.38,smooth(.3,.7,A('rock'))*.8);L(.27,.27,.29,A('moraine')*.6);L(.11,.11,.13,A('glass'));L(.8,.77,.71,A('pumice'));},
 groundLayers:L=>[
  L('ground.ash','vAsh*(1.0-vScree)*(1.0-vSnow)*(1.0-vIce)*(1.0-vMeadow)',{name:'ash on the moat'}),
  L('stone.pumice','vMeadow*(1.0-vSnow)*(1.0-vRock)',{name:'pumice (the bench, the troughs of the top)'}),
  L('ground.cinder','vScree*(1.0-vSnow*0.8)*(1.0-vRock)',{tint:'vec3(0.62,0.62,0.68)',name:'autobreccia and perlite talus'}),
  L('stone.obsidian','vIce*(1.0-vSnow)*(1.0-vRock*0.7)',{name:'the glass carapace'}),
  L('ground.snow','vSnow',{amt:.9,name:'snow'}),
  L('ground.sinter','vSinter*(1.0-vSnow)',{name:'sinter at the warm pool'}),
  L('ground.mat','vMat*(1.0-vSnow)',{name:'mats in the warm run-off'}),
  L('ground.sulphur','vAcid*(1.0-vSnow)',{name:'sulphur and altered perlite'})],
 snowLine:[4000,5400],coral:[0,0],coldQ:.6,tri:true,fallName:'South Glass\'s wall (a sheer drop of glass)',
 // what 99 checks is here (kit.stat: FIREBLISS.build, Copper Glacier's, the hunters, this station's pieces: 66)
 need:['firebliss.obsidian','firebliss.pumice','firebliss.ashgrass','cold.boulders','cold.lichen','hunt.shelters','hunt.hearths','hunt.cairns','hunt.markers',
  'station.spines','station.blocks','station.debitage','station.cores','station.horncairns','station.quarry','station.waycairns'],
 afar:[-1,-1],
 budget:{tris:16000000,calls:240},
 sky:{air:{humidity:.4},clouds:{cover:.3,cumulus:.35,cirrus:.4}},
 // the dome's own views (99: SITE.extraViews)
 extraViews(V,{look}){const k=GLASS.crest(124),c2=GLASS.crest(122,230),c3=GLASS.crest(134,45),cw=GLASS.crest(GLASS.SLUMP,0),f=GLASS.cracks()[2].foot,a=GLASS.angOf(f.b),ra=GLASS.foot(GLASS.SLUMP);
  V['South Glass from the moat']=look(1150,1950,22,k.x,k.z,-40);
  V['Mons over the Glass (north-north-east)']=look(650,2350,22,650+3000*Math.sin(12*Math.PI/180),2350-3000*Math.cos(12*Math.PI/180),260);
  V['On the carapace']=look(c2.x,c2.z,5,c3.x,c3.z,1);
  V['The steaming crack']=look(f.x+Math.cos(a)*120+Math.sin(a)*50,f.z+Math.sin(a)*120-Math.cos(a)*50,9,f.x,f.z,4);
  V['The way up']=look(ra.x+Math.cos(GLASS.angOf(ra.b))*160,ra.z+Math.sin(GLASS.angOf(ra.b))*160,6,cw.x,cw.z,0);},
 views:'glass'};
