// prefix: fg
// ================================================================= THE FELLGANG HOUSES (PLAN.md section 3.3.1: fg-hut, fg-house, fg-longhouse, fg-headhouse)
// Poor to the head's: the hut, the two-hearth house, the longhouse with its byre at the low end, the head's house where the
// head hears complaints (the village's elected head, not a steward: PLAN.md 1.3). Keys and boxes are riftrim's stand-ins'
// (26k-kit.js TG.fg.BOX), the box an upper bound; each key draws one of its massing families (42-fg-mass.js) by seed or by
// the village's character. The furniture is the catalog's fellgang set (kits/catalog krator-master-furniture-fellgang.js).
/* the families of each house-like key: see 42-fg-mass.js for the forms (gable, black, burst, bow, welsh, croft, beehive) */
const FG_FAMS={
 'fg-hut':[{id:'gable',wf:[.78,1],df:[.8,1],hf:[.82,1],pitch:[40,50],stony:1.3},
  {id:'black',plan:'round',roof:'black',th:1.05,ov:0,wf:[.85,1],df:[.88,1],hf:[.75,.86],pitch:[30,36],low:2.2,stony:1.2,wins:0},
  {id:'beehive',wf:[.65,.7],df:[.75,.92],hf:[.8,.95],add:['beehive'],stony:2.4,low:.6},
  {id:'croft',roof:'halfhip',wf:[.65,.7],df:[.75,.9],hf:[.78,.92],add:['outshot'],low:1.6},
  {id:'cab',wf:[.8,.96],df:[.65,.7],hf:[.82,1],add:['cab'],pitch:[38,46]}],
 'fg-house':[{id:'gable',stack:true,wf:[.8,1],df:[.8,1],hf:[.85,1],pitch:[38,48],stony:1.6},
  {id:'black',plan:'round',roof:'black',th:1.1,ov:0,wf:[.88,1],df:[.88,1],hf:[.75,.85],pitch:[30,36],low:2.4,wins:1},
  {id:'burst',wf:[.85,1],df:[.86,1],hf:[.85,1],stony:1.4},
  {id:'croft',roof:'gable',wf:[.65,.72],df:[.8,.95],hf:[.8,.95],add:['outshot'],low:1.5},
  {id:'twin',roof:'twin',wf:[.82,1],df:[.65,.72],hf:[.78,.9],add:['container'],pitch:[34,42],low:1.4}],
 'fg-longhouse':[{id:'gable',wf:[.82,1],df:[.82,1],hf:[.85,1],pitch:[38,46],stony:1.3},
  {id:'bow',plan:'bow',roof:'bow',wf:[.88,1],df:[.88,1],hf:[.82,1],pitch:[36,44],stony:1.2},
  {id:'welsh',roof:'halfhip',welsh:true,wf:[.85,1],df:[.82,.98],hf:[.85,1],pitch:[36,46]},
  {id:'black',plan:'round',roof:'black',th:1.05,ov:0,wf:[.88,1],df:[.9,1],hf:[.75,.85],pitch:[30,36],low:2.4,wins:1},
  {id:'croft',roof:'hip',wf:[.68,.74],df:[.8,.95],hf:[.8,.92],add:['lean'],low:1.4}],
 'fg-headhouse':[{id:'porch',wf:[.82,1],df:[.65,.76],hf:[.88,1],add:['porch'],pitch:[38,46],stony:1.3},
  {id:'burst',wf:[.88,1],df:[.85,1],hf:[.88,1],stony:1.5},
  {id:'twin',roof:'twin',wf:[.82,1],df:[.7,.8],hf:[.82,.95],add:['cab'],low:1.5},
  {id:'bow',plan:'bow',roof:'bow',wf:[.68,.72],df:[.85,1],hf:[.85,1],add:['beehive'],stony:1.6},
  {id:'halfhip',roof:'halfhip',wf:[.65,.72],df:[.8,.95],hf:[.82,1],add:['outshot'],low:1.4}]};
/* a home's furniture in the room S: the hearth under the hood, beds along the back, a chest, a table and stools by the front */
function fgFurnishHome(S,C,o){o=o||{};const rich=o.tier==='rich',poor=o.tier==='poor',hx=Math.max(S.x0+1,Math.min(S.x1-1,S.hoodX==null?0:S.hoodX)),hz=Math.min(-.2,S.z1-1.4);
 fgHearth(hx,hz,C,{r:poor?.45:.55});const bed=poor?'fellgang_poor_fur_bed':'fellgang_common_bed',bw=fgDim(bed).w;
 fgFurnBack(bed,S.x0+bw/2+.15,S.z0);if(S.x1-S.x0>bw*2+2.4)fgFurnBack(rich?'fellgang_common_bed':'fellgang_poor_fur_bed',S.x1-bw/2-.15,S.z0,{v:1});
 const dx=S.doors&&S.doors[0]?S.doors[0][0]:0,tx=dx>0?S.x0+1.4:S.x1-1.4;
 if(S.x1-S.x0>3.4)fgFurn(poor?'fellgang_poor_stool':'fellgang_common_plate_table',tx,null,Math.min(S.z1-.8,.6),0);
 fgFurnSide(poor?'fellgang_poor_hide_sacks':'fellgang_common_chest',dx>0?-1:1,dx>0?S.x0:S.x1,Math.max(S.z0+.8,S.z1-.7));
 fgFurn('fellgang_poor_tallow_lamp',hx+.9,null,S.z0+.35,0);if(rich)fgFurn('fellgang_court_rulebook',hx-1.1,null,S.z0+.5,0);}
/* the family's slogan beside the door, on whatever face the house shows */
function fgDoorSign(S,C,o){o=o||{};const d=S.doors&&S.doors[0];if(!d)return;const x=d[0]+(d[0]>0?-1:1)*(d[1]/2+.85);if(Math.abs(x)>S.hw-.6)return;
 fgSign(o.text||fgSlogan(),x,Math.min(1.05,S.wh-.55),S.hd+.02,0,C,{ch:o.ch||.13,kind:o.kind||'plate',ink:o.ink});}
defBuilding({key:'fg-hut',name:'A Fellgang hut',seed:9101,cut:true,w:6,d:5,h:4.2,budget:26000,
 tags:{types:['dwelling-single'],wealth:'poor',style:'drystone',role:'dwelling'},
 note:'a one-room hut: drystone walls, a turf roof on bell-fir poles, a door of Ancient plate on cable hinges, the hearth under a smoke hole; poor. Families: a gabled hut, a blackhouse, a hut with a beehive cell, a croft with an outshot, a hut with a wreck\'s cab for a porch',
 build(o){const C=fgCx(o);fgHouse(TG.fg.BOX['fg-hut'],C,FG_FAMS['fg-hut'],S=>{fgFurnishHome(S,C,{tier:'poor'});fgDoorSign(S,C,{kind:'rust',ink:'white',text:C.v===0?'NO SKABS':null});
  if(fgU(C,41)<.5)fgPatch(-S.hw+.3,Math.min(1.9,S.wh-.5),0,.9,.8,-PI/2,C,'tin');},{doorW:.9,doorH:1.75});}});
defBuilding({key:'fg-house',name:'A Fellgang house (two hearths)',seed:9102,cut:true,w:9,d:6,h:4.8,budget:38000,
 tags:{types:['dwelling-single'],wealth:'middle',style:'drystone',role:'dwelling'},
 note:'two hearths and a cross wall, a box bed against the back wall, a store loft over the second room; the family\'s slogan by the door. Families: a gabled house with a gable stack, a blackhouse, a burstabaer of gabled fronts, a croft with an outshot, a double-pile house with a buried container store',
 build(o){const C=fgCx(o);fgHouse(TG.fg.BOX['fg-house'],C,FG_FAMS['fg-house'],S=>{
  /* the cross wall with its doorway toward the front */
  const xc=S.x0+(S.x1-S.x0)*.58,ct=.5,col=fgCol('stone',C),dz0=S.z1-1.3,dz1=S.z1-.3;if(S.fam!=='burst'){fgWall(xc,S.z0,xc,dz0,ct,0,S.wh,C,col);fgWall(xc,dz1,xc,S.z1,ct,0,S.wh,C,col);fgWall(xc,dz0,xc,dz1,ct,2.05,S.wh,C,col);}
  fgFurnishHome(Object.assign({},S,{x1:xc-ct/2,hoodX:(S.x0+xc)/2}),C,{tier:'common'});
  fgHearth((xc+S.x1)/2,S.z0+1,C,{r:.42});
  /* the box bed in its plank cabinet, the store loft on poles over the second room with its ladder */
  const wc=fgCol('wood',C),pc=fgCol('pole',C),ly=Math.min(2.1,S.wh-.3);if(S.x1-xc>2.2){W(0,0,0,0,()=>{for(let z=S.z0+.1;z<S.z0+1.9;z+=.32)box('wood',(xc+S.x1)/2,ly,z+.14,S.x1-xc-ct/2,.06,.3,wc);
   pole('pole',[xc+ct/2,ly-.08,S.z0+1.95],[S.x1,ly-.08,S.z0+1.95],.07,pc,6);for(const s of [-.22,.22])pole('pole',[S.x1-.6+s,.06,S.z0+2.8],[S.x1-.6+s,ly+.5,S.z0+1.9],.035,pc,5);});
   fgFurn('fellgang_poor_hide_sacks',(xc+S.x1)/2,ly+.06,S.z0+.7,0);}
  fgDoorSign(S,C,{});if(fgU(C,42)<.5)fgPatch(S.hw-.02,Math.min(1.2,S.wh-.6),-S.hd*.3,1,.9,PI/2,C);});}});
/* the longhouse reads its footing: the byre takes the end that sits lower (the drain runs out of it), so on a slope the
   beasts are down-slope of the hearth; on the flat the byre is at +x */
defBuilding({key:'fg-longhouse',name:'A Fellgang longhouse (house and byre)',seed:9103,cut:true,w:15,d:6.5,h:5.2,budget:52000,
 tags:{types:['dwelling-single','farm'],wealth:'middle',style:'drystone',role:'dwelling',job:'herding'},
 note:'house and byre under one roof, the byre at the low end (the def reads the footing\'s fall and puts the byre down-slope), a drain through the gable. Families: a gabled longhouse, a Norse bow-sided one, a Welsh longhouse with a cross passage, a long blackhouse, a hipped croft with a plate lean-to',
 build(o){const C=fgCx(o),B=TG.fg.BOX['fg-longhouse'],hw=B.w/2;
  const gL=Math.min(C.gl(-hw,-B.d/2),C.gl(-hw,B.d/2)),gR=Math.min(C.gl(hw,-B.d/2),C.gl(hw,B.d/2)),bs=gL<gR-.05?-1:1;fgSet('byre',bs);
  fgHouse(B,C,FG_FAMS['fg-longhouse'],S=>{const byreL=S.w*.4,xw=bs*(S.hw-byreL),col=fgCol('stone',C);
   fgWall(xw,S.z0,xw,S.z0+1.1,.55,0,S.wh,C,col);fgWall(xw,S.z0+2.1,xw,S.z1,.55,0,S.wh,C,col);fgWall(xw,S.z0+1.1,xw,S.z0+2.1,.55,1.95,S.wh,C,col);
   /* the byre: stalls off the back wall, the muck channel to the drain through the end wall, hay */
   const ns=Math.max(2,Math.floor((byreL-1)/1.45));for(let k=0;k<ns;k++)box('stone',xw+bs*(1.2+k*1.45),0,S.z0+.8,.3,1.1,1.6,col);
   box('stoneD',(xw+bs*(S.hw-.35))/2,.01,Math.min(.4,S.z1-.4),Math.abs(S.hw-.35-Math.abs(xw)),.06,.4,P('peat'));
   box('plain',bs*(S.hw-S.th/2),.05,Math.min(.4,S.z1-.4),S.th+.06,.22,.3,P('dark'));
   ellip('straw',xw+bs*1.6,0,S.z1-.7,.8,.5,.55,P('straw'),0,8);
   fgFurnishHome(Object.assign({},S,bs>0?{x1:xw-.3}:{x0:xw+.3},{hoodX:-bs*S.hw*.45}),C,{tier:'common'});
   fgDoorSign(S,C,{});},
  {doorW:1,doorH:1.85,doors:(S0,F)=>{const byreL=S0.w*.4,xw=bs*(S0.hw-byreL),dh=Math.min(1.85,S0.wh-.3);
   return [[F.welsh?xw-bs*.9:-bs*S0.hw*.42,1,dh],[bs*(S0.hw-byreL/2),Math.min(1.7,byreL-1.6),Math.min(1.9,S0.wh-.3)]];}});}});
defBuilding({key:'fg-headhouse',name:'The head\'s house',seed:9104,cut:true,w:13,d:8,h:5.8,budget:56000,
 tags:{types:['dwelling-single'],wealth:'rich',style:'drystone',role:'dwelling'},
 note:'the head\'s house (the village\'s elected head, not a steward): two rooms and a porch or a front where the head hears complaints. Families: a porched house, a burstabaer of three or four fronts, a double-pile house with a cab porch, a bow-sided house with a beehive cell, a half-hipped house with an outshot',
 build(o){const C=fgCx(o);fgHouse(TG.fg.BOX['fg-headhouse'],C,FG_FAMS['fg-headhouse'],S=>{const xc=S.x0+(S.x1-S.x0)*.36,col=fgCol('stone',C);
  if(S.fam!=='burst'){fgWall(xc,S.z0,xc,S.z1-1.4,.55,0,S.wh,C,col);fgWall(xc,S.z1-.4,xc,S.z1,.55,0,S.wh,C,col);fgWall(xc,S.z1-1.4,xc,S.z1-.4,.55,1.95,S.wh,C,col);}
  fgFurnishHome(Object.assign({},S,{x0:xc+.3,hoodX:(xc+S.x1)/2}),C,{tier:'rich'});
  fgFurn('fellgang_court_feast_board',(xc+S.x1)/2,null,Math.min(S.z1-1.2,.3),0);fgFurnBack('fellgang_poor_fur_bed',(S.x0+xc)/2,S.z0);fgHearth((S.x0+xc)/2,Math.min(S.z1-1.3,.2),C,{r:.42});
  if(S.fam==='porch'){fgFurn('fellgang_common_bench',-1.2,null,S.hd+.45,0);fgFurn('fellgang_common_plate_table',1.4,null,S.hd+1,0);fgFurn('fellgang_poor_stool',1.4,null,S.hd+.55,0);
   fgSign('ALL HANDS',0,S.wh-1.12,S.hd+1.78,0,C,{ch:.16});}
  else fgDoorSign(S,C,{text:'ALL HANDS',ch:.15});
  for(const x of [S.x1-1.2])if(Math.abs(x-S.doors[0][0])>1.4)fgPatch(x,Math.min(1.9,S.wh-.5),S.hd+.01,.7,.6,0,C,'plate');},{doorW:1.05,doorH:1.95});}});
