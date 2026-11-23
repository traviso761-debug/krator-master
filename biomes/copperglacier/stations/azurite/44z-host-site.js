// ================================================================= HOST — the site: STATION 11, THE AZURITE TARN AND THE VERDIGRIS OUTWASH (PLAN.md section 7.2; 2026-11-16)
// Gemini's 5.1 showcase station #11 (openworld/GEOLOGY-STATIONS-5.1.md). THE SITE (scale model 5.1, read 2026-11-16): px 148,1148, the Copper Tarn at
// 2,380 m (model bed 2,364), WH, +9 degC mean, 1,800 mm, 1.19 atm (1.6 atm x e^(-h/8 km)); the resource data has the cell as water (no copper, no node).
// AN IDEAL TYPE, NOT A 1:1 CUT: on the model the tarn is a round basin about 30 km across (px 138-154, 1134-1162), its outlet (9105, the Kopa-Tarn
// Warra) leaving its north-west lip at px 142,1136 for the west, the ice on its east shore 16 km off (station 1). The spec frames a 5.2 km cut of the
// crater's whole collar, so the page draws the crater small: the tarn 2.2 km across in a collar 2.8 km across (KNOWN_ISSUES.md, for the owner).
// THE GEOLOGY (PLAN.md section 7.1): the tarn's cirque is a radial secondary impact crater; its collar is upturned, frost-shattered ejecta (KSTRATA's
// `secondary-ejecta`), breached on its west by the outlet; the glacier comes in from the ENE between walls of contact marble (`contact-marble`, a lateral
// change of the same stack, so the beds tongue into each other where the collar meets the walls) with the IOCG skarn's malachite and azurite seams. The
// copper here is the SPEC'S, not the resource data's (the data has none): the seams on the marble, the green pebbles on the outwash's bars.
// THE MAP (x east, z south; origin at the site, R 2600):
//   THE CRATER     centre (-350, 140): the tarn to r 1100 (its floor 18 m under the level, deeper in the glacier's trough), the collar's inner scarp to
//                  its crest at r 1380 (50-140 m over the water, hummocky), the ejecta's apron falling away outside
//   THE GLACIER    from the ENE through a gap it cut in the collar: the icefall's seracs (u 1550-2300), crevasses, a calving cliff ~45 m over the water,
//                  a medial moraine; ice caves at both margins of the snout, the north one's stream and its plume into the tarn
//   THE WALLS      contact marble north and south of the glacier, rising 600-900 m within a kilometre, the seams green and blue
//   THE BREACH     the collar's WSW notch at the level's sill, the outlet out through it: the Kopa-Tarn Warra's head, braiding over a gravel plain
//                  (three threads that part and meet again), the bars green with malachite and chrysocolla pebbles, copper flowers on them
const CG11=(function(){
 /* this fragment runs before the stage (45): its own smooth and noise, so the braids' lines can be drawn here (core/biome's smooth, core/rand's noise) */
 const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);},mix=(a,b,t)=>a+(b-a)*t,clamp=(v,a,b)=>v<a?a:v>b?b:v;
 const fbm=(x,z,seed,o)=>KRAND.fbm(x,.5,z,o==null?3:o,seed);
 const UP=[.927,-.375],C=[-350,140],RT=1100,RR=1380,WOUT=460,LEVEL=2380,DB=18;
 const TH_G=Math.atan2(UP[1],UP[0]),DIRB=[-.954,.3],TH_B=Math.atan2(DIRB[1],DIRB[0]),NB=[-DIRB[1],DIRB[0]];   /* NB: across the outlet (north of it is -z) */
 const dAng=(a,b)=>{let d=a-b;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return Math.abs(d);};
 const B0=[C[0]+DIRB[0]*RR,C[1]+DIRB[1]*RR];   /* the breach's sill, on the crest's circle */
 // where (x,z) lies against the crater: its radius (warped a little, so the collar is not a compass circle), its angle, the glacier's gap and the breach
 function polar(x,z){const dx=x-C[0],dz=z-C[1],r0=Math.hypot(dx,dz),th=Math.atan2(dz,dx);
  const r=r0*(1+.09*(KRAND.fbm(Math.cos(th)*1.3+4,.5,Math.sin(th)*1.3+9,2,1102)-.5));
  return{r,th,gG:smooth(.62,.4,dAng(th,TH_G)),gB:smooth(.3,.13,dAng(th,TH_B))};}
 // the outlet's corridor: s down it from the sill, l across it; the plain's share (the braids' floor)
 function outlet(x,z){const dx=x-B0[0],dz=z-B0[1],s=dx*DIRB[0]+dz*DIRB[1],l=dx*NB[0]+dz*NB[1];
  return{s,l,k:smooth(330,190,Math.abs(l))*smooth(-140,40,s)};}
 // THE LAND: the crater replaces the ground inside its apron; the glacier's gap takes the glacier's own bed; the outlet's plain past the breach
 function land(x,z,h0){const P=polar(x,z),r=P.r;if(r>RR+WOUT+80&&outlet(x,z).k<=0)return h0;
  const hum=fbm(x*.011,z*.011,1103,3)-.5;
  const crest=LEVEL+78+60*KRAND.fbm(Math.cos(P.th)*2.2+1,.5,Math.sin(P.th)*2.2+2,3,1104)+24*hum;
  let top=mix(crest,LEVEL+1.6,P.gB);top=mix(top,h0,P.gG);   /* the breach: the crest down to its sill; the gap: the glacier's bed */
  let H;
  if(r<RT)H=LEVEL+.5-(DB+.5)*(1-smooth(RT*.45,RT,r));   /* the bowl, its shore at RT */
  else if(r<RR){const t=(r-RT)/(RR-RT);H=LEVEL+.5+(top-LEVEL-.5)*(.12*t+.88*smooth(.22,.8,t));}   /* the collar's inner scarp: a beach, then steep */
  else H=mix(top,h0,smooth(RR,RR+WOUT*(1-.5*P.gG),r))+14*hum*(1-smooth(RR,RR+WOUT,r))*(1-P.gG);   /* the ejecta's hummocky apron */
  const O=outlet(x,z);if(O.k>0&&r>RR-60){const plain=LEVEL-1.2-.0045*Math.max(0,O.s)+1.1*(fbm(x*.02,z*.02,1108,2)-.5);H=mix(H,Math.min(H,plain),O.k);}   /* the outwash plain, falling west */
  return H;}
 // THE FIELDS: the beds' mask, the collar, the copper of the spec, the medial moraine, the breccia on the collar's hummocks
 function fields(x,z,h,slope,F,c){const P=polar(x,z),O=outlet(x,z),alongUp=(x-C[0])*UP[0]+(z-C[1])*UP[1];
  const collar=smooth(RT-20,RT+90,P.r)*(1-smooth(RR+WOUT*.55,RR+WOUT,P.r))*(1-P.gG)*(1-O.k)*(1-F.ice);
  const marble=smooth(RR*.72,RR*.98,alongUp);   /* the lateral change (as KSTRATA's, below): the marble past it */
  F.rock=Math.max(F.rock,collar*smooth(.3,.62,slope));F.moraine=Math.max(F.moraine,collar*.55*smooth(.35,.7,fbm(x*.03,z*.03,1109,2)));
  const seams=marble*smooth(.3,.6,F.rock)*smooth(.52,.7,KRAND.fbm(h*.045,.5,(x-z)*.0025,2,1105))*(1-F.snow*.8);
  const bars=O.k*smooth(RR-20,RR+80,P.r)*smooth(.42,.66,fbm(x*.028,z*.028,1106,2))*(1-F.tarn);
  const talus=marble*F.moraine*.55;
  F.copper=clamp(Math.max(F.copper,seams,bars*.82,talus),0,1);
  F.azurite=marble*smooth(.38,.62,fbm(x*.009,z*.009,1107,2));   /* azure only in the marble's seams: the bars' pebbles are malachite and chrysocolla green */
  F.collar=collar*(1-F.tarn);
  F.strata=clamp(Math.max(collar,marble*smooth(.2,.5,F.rock)),0,1)*(1-F.tarn)*(1-F.ice);
  const u=uOf(x,z),a=pOf(x,z)-GS.centre(u),medial=F.ice*smooth(26,8,Math.abs(a-.14*G.W(u)))*smooth(GS.snout,GS.snout+260,u);
  F.debris=Math.max(F.debris,medial*.92);
  if(O.k>.2&&F.shore>.2)F.wet=Math.max(F.wet,.6);}   /* the braids' banks: damp gravel */
 // THE OUTLET'S BRAIDS: the main thread and two that part from it and meet it again; their lines from the shore, through the sill, down the plain
 function braid(l0,amp,s0,s1,w,seed){const pts=[];for(let s=-(RR-RT)-40;s<=1500;s+=20){const b=s<s0||s>s1?0:Math.sin(Math.PI*(s-s0)/(s1-s0));
  const l=l0*smooth(-60,120,s)+amp*b+w*(KRAND.fbm(s*.006,.5,seed,2,1110+seed)-.5)*smooth(0,200,s);pts.push([B0[0]+DIRB[0]*s+NB[0]*l,B0[1]+DIRB[1]*s+NB[1]*l]);}return pts;}
 return{UP,C,RT,RR,LEVEL,DIRB,NB,B0,polar,outlet,land,fields,braid,dAng,TH_B};})();
const SITE={key:'azurite',name:'The azurite tarn',region:'The Copper Tarn\'s ejecta collar and the verdigris outwash (Copper Glacier, ideal type)',px:148,py:1148,old:{px:-124,py:818},
 atm:1.19,koppen:['ET','EF'],rain:1800,mean:9,
 up:CG11.UP,   /* the ice comes from the ENE */
 // the bed's profile up the ice (u): the plain round the crater a little over the level, falling west down the outlet; the tongue, the icefall, the basin
 prof:{at:-400,h:2392,grads:[[-2900,.006],[300,.012],[900,.035],[1550,.24],[2300,.07]]},
 glacier:{centre:u=>28*Math.sin(u*.0011+.4)+10*Math.sin(u*.003+1),W:u=>430+150*smooth(560,2800,u),
  T:u=>(78+20*smooth(560,1500,u)+40*smooth(1700,2600,u))*smooth(550,564,u),   /* the cliff ~45 m over the water: the bed under the snout is the trough's, ~33 m under the level */
  snout:560,edge:.6,trough:{side:[.7,1.08],D:u=>30+20*smooth(560,2400,u)},lateral:{h:u=>12+8*smooth(560,1500,u),end:[2600,2100],off:34,w:24},terminal:null,lake:null},
 walls:{margin:140,pos:{H:620,span:780},neg:{H:900,span:950},fade:[-150,700]},   /* pos: north (p>0 is north-ish here) */
 ridges:[],
 land:(x,z,h)=>CG11.land(x,z,h),
 tarn:{level:2380,name:'The Copper Tarn (milky azure: rock flour and the copper\'s salts; its secondary crater\'s collar round it)',
  at:(x,z)=>CG11.polar(x,z).r<CG11.RR-10,seed:CG11.C,shallow:0x56b8c8,deep:0x1a6494},
 icefall:[1550,2300],crevasses:[[700,1540],[2340,2900]],
 caves:[{u:1000,aw:.97,R:14,face:null,name:'An ice cave (the meltwater stream\'s portal at the snout)'},{u:1150,aw:-.96,R:12,face:null,name:'An ice cave (at the south margin)'}],
 streams:[{name:'The meltwater stream (from the snout\'s north portal into the tarn)',from:'cave0',hw:3,plume:true},
  {name:'The Kopa-Tarn Warra (9105), its head: the main thread through the breach',from:'tarn',path:CG11.braid(0,0,0,1,26,1),hw:8,fall:.004},
  {name:'The Kopa-Tarn Warra: a braid parting north over the plain',from:'tarn',path:CG11.braid(0,-95,60,900,30,2),hw:4,fall:.004},
  {name:'The Kopa-Tarn Warra: a braid parting south over the plain',from:'tarn',path:CG11.braid(0,120,320,1350,30,3),hw:3.5,fall:.004}],
 skarn:true,snowLine:[2950,3450],coral:[2380,3150],coralK:.45,worms:true,algae:0,
 q:.6,   /* the page's flora at 60% of the kit's counts: the crater's collar and the outwash are far more open ground than station 1's (the budget, and SwiftShader) */
 layersOff:['rock','ice.glacier','ice.debris','ground.snow'],   /* the beds take five texture units (84): the ice all verdigris, the dirty ice and the snow in the paint */
 fields:(x,z,h,slope,F,c)=>CG11.fields(x,z,h,slope,F,c),fieldNames:['strata','azurite','collar'],
 // THE BEDS (KSTRATA, core/terrain 35): the ejecta's breccia, melt and megaclast beds round the tarn; past the lateral change up the glacier, the
 // contact marble with its epidote, garnet and magnetite selvages. The beds dip gently west (the collar's flap); 84 draws them on the steep faces
 strata:()=>KSTRATA.create({seed:KRAND.child(4412,'copperglacier/azurite/strata'),formations:[{recipe:'secondary-ejecta'}],range:[2200,3700],
  dip:[CG11.DIRB[0],CG11.DIRB[1],.035],warp:[6,2],lateral:{recipe:'contact-marble',dir:CG11.UP,at:CG11.C,d0:CG11.RR*.72,d1:CG11.RR*.98,tongue:6}}),
 strataDust:0x8a847a,
 exportBox:[-2060,400,-1600,860],   /* verify.py's export box (99): the breach, the outlet's head and its banks: water, flora, the beds (the tarn's middle has none) */
 // nothing roots within 10 m of the ice: a frost coral's limbs never reach over it (the kit's check: nothing grows on the ice)
 rootClear:(x,z)=>iceAt(x+10,z)<=0&&iceAt(x-10,z)<=0&&iceAt(x,z+10)<=0&&iceAt(x,z-10)<=0,
 // THE VIEWS: the spec's framing (a camera 19 m over the breach's crest, looking ENE across the tarn to the snout), the walls, the braids, the collar
 views2:(V,{look,lookUP,gh,upAt})=>{const K=CG11,sn=560,s=upAt(sn+40,0);
  {const c=[K.B0[0]+K.NB[0]*-70+K.DIRB[0]*40,K.B0[1]+K.NB[1]*-70+K.DIRB[1]*40];V['From the western breach']=look(c[0],c[1],19,s[0],s[1],8);}   /* on the notch's floor beside the outlet, 19 m up */
  {const c=upAt(sn-260,-560),t=upAt(sn+700,760);V['The marble walls over the snout']=look(c[0],c[1],14,t[0],t[1],260);}
  {const c=[K.B0[0]+K.DIRB[0]*780+K.NB[0]*60,K.B0[1]+K.DIRB[1]*780+K.NB[1]*60];V['The braided outwash']=look(c[0],c[1],12,K.B0[0],K.B0[1],4);}
  {const d=[Math.cos(1.95),Math.sin(1.95)],c=[K.C[0]+d[0]*K.RT*.55,K.C[1]+d[1]*K.RT*.55],t=[K.C[0]+d[0]*K.RR,K.C[1]+d[1]*K.RR];V['The ejecta collar']=look(c[0],c[1],10,t[0],t[1],40);}},
 // THE STATION'S CHECKS (99 runs them under --assert; with neg, each is fed a broken input and must fail)
 checks:(add,neg)=>{const K=CG11;
  // 1. the beds are the spec's: secondary-ejecta on the collar's inner face, contact-marble on the walls up the glacier
  {const d=[Math.cos(1.95),Math.sin(1.95)],pc=[K.C[0]+d[0]*(K.RT+K.RR)/2,K.C[1]+d[1]*(K.RT+K.RR)/2],pw=upAt(1500,GS.centre(1500)+G.W(1500)+420);
   const want=neg?['contact-marble','secondary-ejecta']:['secondary-ejecta','contact-marble'];
   const got=STRATA?[pc,pw].map(p=>STRATA.at(p[0],terrainH(p[0],p[1]),p[1]).recipe):['no beds','no beds'];
   add(neg?'the beds swapped':'the beds are the spec recipes (secondary-ejecta on the collar, contact-marble on the walls)',
    {ok:got[0]===want[0]&&got[1]===want[1],detail:'collar '+got[0]+', walls '+got[1]});}
  // 2. the collar holds the tarn: on a ring outside the crest no tarn water but in the outlet's channel
  {const r=neg?K.RT*.5:K.RR+70;let bad=0,n=0;for(let i=0;i<360;i+=2){const t=i*Math.PI/180,x=K.C[0]+Math.cos(t)*r,z=K.C[1]+Math.sin(t)*r;if(iceAt(x,z)>.3)continue;n++;
    if(waterH(x,z)===TARN.level&&!(STREAMS.length&&SBK.at(x,z).d<0))bad++;}
   add(neg?'tarn water outside its collar':'the collar holds the tarn (no tarn water outside the crest but the outlet)',{ok:bad===0&&n>0,detail:bad+' of '+n+' points on the ring at '+Math.round(r)+' m in tarn water'});}
  // 3. the outlet starts at the tarn's level and falls all the way (graded: it never climbs)
  {const O=STREAMS.filter(S=>S.out),L=neg?O.map(S=>({pts:S.pts.slice().reverse()})):O;let bad=0;
   L.forEach(S=>{if(Math.abs(S.pts[0][2]-TARN.level)>.01)bad++;for(let i=1;i<S.pts.length;i++)if(S.pts[i][2]>S.pts[i-1][2]+1e-6){bad++;break;}});
   add(neg?'an outlet that climbs':'the outlet leaves the tarn at its level and never climbs',{ok:O.length>0&&bad===0,detail:O.length+' threads of the Kopa-Tarn Warra, '+bad+' bad'});}},
 sky:{air:{pressure:1.19,humidity:.55},clouds:{cover:.35,cumulus:.4,cirrus:.3}},
 views:'azurite'};
