// prefix: fg
// ================================================================= THE FELLGANG HOUSES (PLAN.md section 3.3.1: fg-hut, fg-house, fg-longhouse, fg-headhouse)
// Poor to the head's: a one-room hut, the two-hearth house, the longhouse with its byre at the low end, the head's house with
// the porch where the head hears complaints (the village's elected head, not a steward: PLAN.md 1.3). Keys and boxes are
// riftrim's stand-ins' (26k-kit.js TG.fg.BOX); the frame is theirs (40-fg-kit.js fgShell). The Fellgangs bear the day: the
// doors are 1.0 scale (1.8 m), the furniture is the catalog's fellgang set (kits/catalog krator-master-furniture-fellgang.js).
/* the cut-away opens every house: its near half above the floor goes, the room shows */
defBuilding({key:'fg-hut',name:'A Fellgang hut',seed:9101,cut:true,w:6,d:5,h:4.2,budget:40000,
 tags:{types:['dwelling-single'],wealth:'poor',style:'drystone',role:'dwelling'},
 note:'a one-room hut: drystone walls 0.7 m thick, a turf roof on bell-fir poles, a door of Ancient plate on cable hinges, the hearth under a smoke hole; poor',
 build(o){const C=fgCx(o),S=fgShell(TG.fg.BOX['fg-hut'],C,{doors:[[-.6,.95,1.8]],rust:C.v%2===1});
  fgHearth(.3,-.2,C);fgHood(.3,S.rid,S.rid+.47,C);
  fgFurnBack('fellgang_poor_fur_bed',S.x0+fgDim('fellgang_poor_fur_bed').w/2+.1,S.z0);
  fgFurnSide('fellgang_poor_hide_sacks',1,S.x1,S.z1-.6);fgFurn('fellgang_poor_stool',-.6,null,.4,.4);
  fgFurnBack('fellgang_poor_tallow_lamp',S.x1-.4,S.z0);if(C.v%3!==2)fgFurnSide('fellgang_poor_meat_rack',-1,S.x0,S.z1-.5);
  /* the family's slogan scratched on a scrap of plate beside the door; a rusted patch where the wall was mended */
  fgSign(C.v===0?'NO SKABS':fgSlogan(),1.35,1.05,S.hd+.02,0,C,{ch:.15,kind:'rust',ink:'white'});
  fgPatch(-S.hw+.3,1.9,S.hd*.2,.9,.8,-PI/2,C,'tin');}});
defBuilding({key:'fg-house',name:'A Fellgang house (two hearths)',seed:9102,cut:true,w:9,d:6,h:4.8,budget:60000,
 tags:{types:['dwelling-single'],wealth:'middle',style:'drystone',role:'dwelling'},
 note:'two hearths, a cross wall, a box bed in the wall\'s thickness, a store loft over the second room; the family\'s slogan over the door',
 build(o){const C=fgCx(o),S=fgShell(TG.fg.BOX['fg-house'],C,{doors:[[-1.9,1,1.85]]});const xc=.9,ct=.5;
  /* the cross wall, with its inner doorway toward the front */
  const col=fgCol('stone',C);fgWall(xc,S.z0,xc,.25,ct,0,S.wh,C,col);fgWall(xc,1.25,xc,S.z1,ct,0,S.wh,C,col);box('stoneD',xc,1.85,.75,ct+.04,.25,1.2,fgCol('stoneD',C));fgWall(xc,.25,xc,1.25,ct,2.1,S.wh,C,col);
  fgHearth(-1.6,-.5,C);fgHood(-1.6,S.rid,S.rid+.47,C);fgHearth(2.9,-.6,C,{r:.45});fgHood(2.9,S.rid,S.rid+.47,C);
  /* the box bed: a plank cabinet set into the back wall's thickness, the bed inside it */
  const bd=fgDim('fellgang_common_bed'),bx=S.x0+bd.w/2+.25,bz=S.z0-.25+bd.d/2;
  W(bx,0,bz,0,()=>{const wc=fgCol('wood',C);box('wood',0,.06,-bd.d/2-.02,bd.w+.3,1.7,.06,wc);for(const s of [-1,1])box('wood',s*(bd.w/2+.12),.06,0,.06,1.7,bd.d+.05,wc);box('wood',0,1.7,0,bd.w+.3,.06,bd.d+.05,wc);
   box('hide',0,.9,bd.d/2+.02,bd.w*.45,.75,.02,P('hide'));});
  fgFurn('fellgang_common_bed',bx,null,bz,0);
  fgFurn('fellgang_common_plate_table',-1.4,null,.9,0);fgFurn('fellgang_poor_stool',-2.3,null,.9,PI/2);fgFurn('fellgang_poor_stool',-.5,null,.9,-PI/2,{v:1});
  fgFurnSide('fellgang_common_chest',-1,S.x0,1.2);
  /* the store loft over the second room: planks on two poles, a pole ladder up, sacks on it */
  const ly=2.15,lz0=S.z0,lz1=.3;W(0,0,0,0,()=>{const wc=fgCol('wood',C),pc=fgCol('pole',C);for(let z=lz0+.1;z<lz1;z+=.32)box('wood',(xc+S.x1)/2+.12,ly,z+.14,S.x1-xc-ct/2,.06,.3,wc);
   pole('pole',[xc+ct/2,ly-.08,lz1-.1],[S.x1,ly-.08,lz1-.1],.07,pc,6);
   for(const s of [-.25,.25])pole('pole',[2.2+s,.06,lz1+.9],[2.2+s,ly+.6,lz1-.05],.04,pc,5);for(let k=1;k<7;k++){const t=k/7;box('pole',2.2,.06+(ly+.5)*t,lz1+.9-.95*t,.5,.04,.04,pc);}});
  fgFurn('fellgang_poor_hide_sacks',(xc+S.x1)/2+.2,ly+.06,lz0+.6,0);fgFurn('generic_sack',S.x1-.4,ly+.06,(lz0+lz1)/2,.3);
  fgFurnSide('fellgang_poor_fur_bed',1,S.x1,.9);
  fgSign(fgSlogan(),-1.9,1.98,S.hd+.02,0,C,{ch:.14});
  fgPatch(S.hw-.02,1.2,-1,1,1.1,PI/2,C);}});
/* the longhouse reads its footing: the byre takes the end that sits lower (the drain runs out of it), so on a slope the
   beasts are down-slope of the hearth; on the flat the byre is at +x */
defBuilding({key:'fg-longhouse',name:'A Fellgang longhouse (house and byre)',seed:9103,cut:true,w:15,d:6.5,h:5.2,budget:80000,
 tags:{types:['dwelling-single','farm'],wealth:'middle',style:'drystone',role:'dwelling',job:'herding'},
 note:'house and byre under one roof, the byre at the low end (the def reads the footing\'s fall and puts the byre down-slope), a drain through the gable',
 build(o){const C=fgCx(o),B=TG.fg.BOX['fg-longhouse'],hw=B.w/2;
  const gL=Math.min(C.gl(-hw,-B.d/2),C.gl(-hw,B.d/2)),gR=Math.min(C.gl(hw,-B.d/2),C.gl(hw,B.d/2)),bs=gL<gR-.05?-1:1;fgSet('byre',bs);
  const byreL=6,xw=bs*(hw-byreL),S=fgShell(B,C,{doors:[[-bs*2.6,1,1.85],[bs*(hw-3.2),1.7,1.9]]});
  /* the cross wall between house and byre, a doorway at its back for the winter feed */
  const col=fgCol('stone',C);fgWall(xw,S.z0,xw,S.z0+1.1,.55,0,S.wh,C,col);fgWall(xw,S.z0+2.1,xw,S.z1,.55,0,S.wh,C,col);fgWall(xw,S.z0+1.1,xw,S.z0+2.1,.55,1.95,S.wh,C,col);
  /* the byre: three stall partitions off the back wall, the muck channel along the floor to the drain through the gable */
  for(let k=0;k<3;k++){const x=xw+bs*(1.3+k*1.45);box('stone',x,0,S.z0+.85,.3,1.15,1.7,col);}
  box('stoneD',(xw+bs*(hw-.35))/2,.01,.4,Math.abs(hw-.35-Math.abs(xw)),.06,.4,P('peat'));
  /* the drain: a stone-lined slot through the gable's foot and a short gutter outside it */
  {const gx=bs*(hw-.35),dc=fgCol('stoneD',C);box('plain',gx,.05,.4,.74,.22,.3,P('dark'));for(const s of [-1,1])box('stone',bs*(hw+.08),0,.4+s*.24,.24,.18,.12,dc);}
  ellip('straw',xw+bs*2,0,S.z1-.8,.9,.5,.6,P('straw'),0,8);fgFurn('job_bales',xw+bs*4.2,null,S.z1-.7,0);
  /* the house end: hearth, beds, the table, a chest */
  const xh=-bs*(hw-3.4);fgHearth(xh,-.3,C);fgHood(xh,S.rid,S.rid+.47,C);
  fgFurnBack('fellgang_common_bed',-bs*(hw-1.6),S.z0);fgFurnBack('fellgang_poor_fur_bed',-bs*(hw-5),S.z0,{v:1});
  fgFurn('fellgang_common_plate_table',-bs*(hw-4.4),null,1.15,PI/2);fgFurn('fellgang_common_bench',-bs*(hw-3.6),null,1.2,bs>0?PI/2:-PI/2);
  fgFurnSide('fellgang_common_chest',-bs,-bs*S.x1,1.4);fgFurn('fellgang_poor_tallow_lamp',xh+bs*1.2,null,S.z0+.35,0);
  if(C.v%2===0)fgFurn('fellgang_common_tanning_frame',-bs*(hw-1.2),null,1.6,bs>0?PI/2:-PI/2);
  fgSign(fgSlogan(),-bs*2.6,1.98,S.hd+.02,0,C,{ch:.14});
  /* salvage: a fan blade nailed over the byre door as a hood, spikes on the house gable */
  W(bs*(hw-3.2),2.25,S.hd+.06,0,()=>{box('scrap',0,0,0,2.2,.06,.36,fgCol('scrap',C),0,-.25);});
  for(const dz of [-1.2,0,1.2])fgSpike([-bs*(hw-.08),S.rid-.6-Math.abs(dz)*.5,dz],[-bs,.6,0],.22);}});
defBuilding({key:'fg-headhouse',name:'The head\'s house',seed:9104,cut:true,w:13,d:8,h:5.8,budget:90000,
 tags:{types:['dwelling-single'],wealth:'rich',style:'drystone',role:'dwelling'},
 note:'the head\'s house (the village\'s elected head, not a steward): two rooms and a porch where the head hears complaints',
 build(o){const C=fgCx(o),B=TG.fg.BOX['fg-headhouse'],sb=2.1,S=fgShell(B,C,{setback:sb,doors:[[1.4,1.05,1.95],[-4,.95,1.85]]});
  const col=fgCol('stone',C),xc=-2.4;fgWall(xc,S.z0,xc,-.4,.55,0,S.wh,C,col);fgWall(xc,.6,xc,S.z1,.55,0,S.wh,C,col);fgWall(xc,-.4,xc,.6,.55,1.95,S.wh,C,col);
  /* the porch: the eave beam on two bell-fir posts, the hearing bench along the house wall, the head's chair and table */
  const pc=fgCol('pole',C),zp=S.hd-.25;for(const s of [-1,1])pole('pole',[s*3.4,.06,zp],[s*3.4,S.wh,zp],.13,pc,8);pole('pole',[-S.hw+.4,S.wh-.06,zp],[S.hw-.4,S.wh-.06,zp],.12,pc,8);
  box('stoneD',0,.04,S.hd-sb/2,S.hw*2-1.6,.04,sb-.1,fgCol('stoneD',C));
  fgFurn('fellgang_common_bench',-1.3,null,S.zf+S.th/2+.35,0);fgFurn('fellgang_common_bench',3.7,null,S.zf+S.th/2+.35,0,{v:1});
  fgFurn('fellgang_common_plate_table',1.4,null,S.hd-.95,0);fgFurn('fellgang_poor_stool',1.4,null,S.hd-1.55,0);
  fgSign('ALL HANDS',0,S.wh-.62,zp+.16,0,C,{ch:.18});
  /* the great room: two hearths, beds, the feast board; the head's room: bed, chest, the rulebook (the old rules said aloud) */
  fgHearth(2.6,-1,C);fgHood(2.6,S.rid,S.rid+.47,C);fgHearth(-4.2,-1.2,C,{r:.45});fgHood(-4.2,S.rid,S.rid+.47,C);
  fgFurnBack('fellgang_common_bed',S.x1-.9,S.z0);fgFurnBack('fellgang_common_bed',S.x1-2.6,S.z0,{v:1});
  fgFurn('fellgang_court_feast_board',.3,null,-.5,PI/2);fgFurnSide('fellgang_common_chest',1,S.x1,0);
  fgFurnBack('fellgang_poor_fur_bed',S.x0+.9,S.z0);fgFurnSide('fellgang_common_chest',-1,S.x0,0,{v:1});
  fgFurn('fellgang_court_rulebook',-3.4,null,.4,0);fgFurnBack('fellgang_poor_tallow_lamp',-.8,S.z0);
  /* plate shutters lashed over the two window holes of the great room; a horn pair on the gable (a gift, not a trophy) */
  for(const x of [3.9,-.6])fgPatch(x,1.9,S.zf+S.th/2+.01,.7,.6,0,C,'plate');
  if(!C.worn)W(S.hw-.3,S.rid-.5,0,PI/2,()=>{for(const s of [-1,1])beam('horn',[s*.12,0,.1],[s*.55,.55,.3],.07,P('horn'),true,6,.015);});}});
