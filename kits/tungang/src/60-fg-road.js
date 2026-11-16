// prefix: fg
// ================================================================= THE WALL AND THE ROAD (PLAN.md section 3.3.1, "the records that are not buildings")
// The Fowlers' wall: fg-fixed-line (a family's rope drawn from the station's record {pts, y0, top, family}: Ancient cable at the
// foot, bark cordage above, iron pegs every 25 m, a ladder up the first 18 m, the family's mark at the foot and at each peg, so
// the rope reads as a claim), fg-wall-station (a pegged ledge with a lift cage or a plate shelter, where a rope passes a flat),
// fg-nest-ledge (the fowlers' gear beside a nest: a basket on a line, a plank bridged to the ledge), fg-burial-ledge (the
// Fowlers lay their dead on ledges of the wall: canon). The road: fg-lantern-post (a lantern lobelia, the rim's one native
// glow, faint blue on cold nights, in a scrap housing on a bell-fir post), fg-halt (the Travellers' halting place by the
// lantern road: a low shelter of hide and plate on bell-fir poles; the owner 2026-11-11, the Fellgangs who live on the road
// are the Travellers) and fg-wagon (the Travellers' rolling home: a barrel-top covered sledge-wagon, painted boards).
// A wall piece's face is behind it (-z): o.face draws a stub of rock there (the sheet; a station's terrain is the face).
/* the rope: o.rope = {pts: [[x,y,z]...] LOCAL to the def's origin (its foot), y0, top, family}; TG.fg.ropes moves a station's
   world record to it. The line is a run of thin beams through the record's points: cable to 30 m of arc, cordage above */
const FG_ROPE={cable:30,peg:25,ladder:18,rung:.4,rail:.25};
function fgRope(R,C){const pts=R.pts||[];if(pts.length<2)return;const fam=R.family|0,mc=fgMarkCol(fam),y0=pts[0][1];let arc=0;
 for(let k=1;k<pts.length;k++){const a=pts[k-1],b=pts[k],l=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]);const mk=arc<FG_ROPE.cable?'cable':'cord';
  beam(mk,a,b,mk==='cable'?.035:.03,mk==='cable'?P('cable'):P('rope'),true,5);
  /* a peg every 25 m of arc: an iron peg into the face, a rope-end tied off, the family's mark on a scrap of plate */
  const n0=Math.floor(arc/FG_ROPE.peg),n1=Math.floor((arc+l)/FG_ROPE.peg);
  if(n1>n0&&arc>1){const t=(n1*FG_ROPE.peg-arc)/l,p=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
   beam('iron',[p[0]+.14,p[1]-.05,p[2]+.1],[p[0]+.14,p[1]-.05,p[2]-.25],.03,P('iron'),true,5);cord('rope',[[p[0]+.14,p[1]-.05,p[2]+.08],[p[0]+.2,p[1]-.4,p[2]+.1]],.015,P('rope'));
   W(p[0]-.3,p[1]-.2,p[2]+.08,0,()=>{box('rust',0,-.14,0,.3,.3,.02,P('rust'));fgMark(fam,0,0,.012,0,.24,mc);});fgNote('pegs');}
  arc+=l;}
 fgSet('arc',+arc.toFixed(1));fgSet('family',fam);
 /* the ladder up its first 18 m: two pipe rails off the rope, rungs of fir every 40 cm */
 const L=pts.filter(p=>p[1]-y0<FG_ROPE.ladder);if(L.length>1){const rc=P('rust'),pc=P('pole');for(let k=1;k<L.length;k++){const a=L[k-1],b=L[k];for(const s of [-1,1])beam('rust',[a[0]+s*FG_ROPE.rail,a[1]-.05,a[2]+.05],[b[0]+s*FG_ROPE.rail,b[1]-.05,b[2]+.05],.022,rc,true,5);}
  for(let y=y0+FG_ROPE.rung;y<Math.min(y0+FG_ROPE.ladder,L[L.length-1][1]);y+=FG_ROPE.rung){const p=L.find(q=>q[1]>=y)||L[L.length-1];pole('pole',[p[0]-FG_ROPE.rail,y,p[2]+.05],[p[0]+FG_ROPE.rail,y,p[2]+.05],.018,pc,4);fgNote('rungs');}}
 /* the family's mark at the foot: a painted plate on a stake, the claim's first word */
 const f=pts[0];W(f[0]+.9,f[1]-.3,f[2]+.5,0,()=>{pole('pole',[0,0,0],[0,1.5,0],.04,P('pole'),5);box('plate',0,1,.05,.5,.5,.03,P('plate'));fgMark(fam,0,1.25,.07,0,.4,mc);});}
defBuilding({key:'fg-fixed-line',name:'A family\'s fixed line',seed:9141,cls:'infrastructure',w:2,d:2,h:2,budget:60000,
 tags:{style:'salvage',role:'rope',part:'fixed-line'},
 note:'a family\'s rope up the wall, drawn from the station\'s record: Ancient cable at the foot, bark cordage above, iron pegs every 25 m, a ladder up the first 18 m, the family\'s mark at the foot and at each peg (the rope is the family\'s vote: it reads as a claim)',
 build(o){const C=fgCx(o);fgRope(o.rope||{pts:[[0,0,0],[0,6,-2],[0,12,-4]],family:0},C);}});
defBuilding({key:'fg-lantern-post',name:'A lantern post on the road',seed:9142,cls:'fixture',w:.9,d:.9,h:2.75,budget:1300,
 tags:{style:'salvage',role:'lamp',light:'flame'},
 note:'a lantern lobelia (the rim\'s one native glow, faint blue on cold nights: "herders steer by them") in a scrap housing on a bell-fir post, a cairn of stones at its foot',
 build(o){const C=fgCx(o),pc=fgCol('pole',C);pole('pole',[0,Math.min(0,C.lo+.3),0],[0,2.45,0],.07,pc,7);
  for(let k=0;k<7;k++){const a=k*TAU/7;ellip('stone',Math.cos(a)*.3,.08,Math.sin(a)*.3,.15,.12,.13,fgCol('stone',C),a,6);}ellip('stone',0,.25,0,.2,.14,.2,fgCol('stone',C),0,6);
  /* the housing: a cut can of scrap, open to the road (+z), a plate hood; the lobelia's bells inside */
  W(0,2.05,.12,0,()=>{box('tin',0,0,-.15,.36,.42,.04,fgCol('tin',C));for(const s of [-1,1])box('tin',s*.17,0,0,.04,.42,.3,fgCol('tin',C));box('tin',0,0,0,.36,.04,.3,fgCol('tin',C));
   box('plate',0,.42,0,.44,.04,.4,fgCol('plate',C),0,-.15);fgSpike([0,.48,.1],[0,1,.2],.2);
   for(let k=0;k<5;k++){const a=k*TAU/5,x=Math.cos(a)*.07,z=Math.sin(a)*.07-.02;pole('pole',[0,.05,-.02],[x,.22+k*.02,z],.006,hc(0x4a6a3a),4);sph('glow',x,.22+k*.02,z,.035,hc(0x7ab4ff),1.4,6);}
   haloAt(0,.25,0,0x7ab4ff,false);});
  fgSet('lamp',1);}});
defBuilding({key:'fg-wall-station',name:'A wall station',seed:9143,cut:true,w:3.2,d:2.6,h:3.7,budget:1400,
 tags:{types:['infrastructure'],style:'salvage',role:'wall-station'},
 note:'a pegged ledge on the face where a rope passes a flat: a deck of planks on iron pegs, with a lift cage of the Ancients hung from a cable (variant 0) or a plate shelter lashed to the face (variant 1)',
 build(o){const C=fgCx(o),hd=1.3,dy=.5,pc=fgCol('pole',C),wc=fgCol('wood',C);
  if(o.face!==false)box('stone',0,Math.min(-.3,C.lo),-hd+.2,3.2,3.6-Math.min(-.3,C.lo),.4,fgCol('stoneD',C));
  /* the deck on three iron pegs driven into the face */
  for(const x of [-1.1,0,1.1]){beam('iron',[x,dy-.12,-hd+.35],[x,dy-.12,hd-.2],.05,P('iron'),true,6);beam('iron',[x,dy-.12,hd-.25],[x,dy+.95,-hd+.45],.03,P('iron'),true,5);}
  for(let z=-hd+.45;z<hd-.15;z+=.3)box('wood',0,dy-.06,z+.13,2.9,.06,.27,wc);
  pole('pole',[-1.4,dy+.95,hd-.2],[1.4,dy+.95,hd-.2],.035,pc,5);for(const x of [-1.4,1.4])pole('pole',[x,dy,hd-.2],[x,dy+.98,hd-.2],.035,pc,5);
  if(C.v%2===0){/* the lift cage: an Ancient lift's cage of bars, hung from a cable off a gantry arm, standing on the deck */
   beam('iron',[.7,3.5,-hd+.4],[.7,3.5,.4],.06,P('iron'),true,6);beam('iron',[.7,3,-hd+.4],[.7,3.5,-.2],.04,P('iron'),true,5);beam('cable',[.7,3.5,.3],[.7,2.6,.3],.025,P('cable'),true,5);
   W(.7,dy,.3,0,()=>{const rc=fgCol('rust',C);for(const sx of [-1,1])for(const sz of [-1,1])beam('rust',[sx*.55,0,sz*.55],[sx*.55,2,sz*.55],.03,rc,true,5);
    for(const y of [0,1,2])for(const s of [-1,1]){beam('rust',[-.55,y,s*.55],[.55,y,s*.55],.025,rc,true,4);beam('rust',[s*.55,y,-.55],[s*.55,y,.55],.025,rc,true,4);}
    for(let k=-2;k<=2;k++){beam('rust',[k*.22,0,-.55],[k*.22,2,-.55],.012,rc,true,4);beam('rust',[-.55,0,k*.22],[-.55,2,k*.22],.012,rc,true,4);}box('plate',0,0,0,1.06,.04,1.06,fgCol('plate',C));});
   fgSet('cage',1);}
  else{/* the plate shelter: white plate lashed to two poles leaning from the face, a fur bed under it */
   for(const x of [-1.2,.4])pole('pole',[x,dy,.6],[x,dy+1.9,-hd+.45],.05,pc,6);fgSlab('plate',[-1.4,dy+2.25,-hd+.42],[.6,dy+2.25,-hd+.42],[-1.4,dy+1.35,.8],.04,fgCol('plate',C));
   for(const x of [-.9,.1])fgLash([x,dy+2.3,-hd+.4],[x,dy+1.3,.85]);fgFurn('fellgang_poor_fur_bed',-.4,dy,-.3,PI/2);fgSet('shelter',1);}
  fgSign('NO SKABS',1.15,dy+.75,hd-.17,0,C,{ch:.1,kind:'rust',ink:'white'});}});
defBuilding({key:'fg-nest-ledge',name:'Fowlers\' gear at a nest ledge',seed:9144,cls:'prop',w:2.4,d:2.2,h:2.5,budget:700,
 tags:{style:'salvage',role:'fowling-gear'},
 note:'the fowlers\' gear beside a nest (the nests are the cliff flyers\', kits/fauna): a wicker basket on a line from an iron peg, a plank bridged to the ledge',
 build(o){const C=fgCx(o),pc=fgCol('pole',C);if(o.face!==false){box('stone',0,Math.min(-.3,C.lo),-.9,2.4,2.8-Math.min(-.3,C.lo),.4,fgCol('stoneD',C));box('stone',-.5,1.1,-.45,1.2,.25,.6,fgCol('stone',C));}
  /* the plank bridged from the footing to the ledge, lashed at its top */
  box('wood',.55,.02,.25,.32,.06,1.9,fgCol('wood',C),0,-.62);fgLash([.4,1.2,-.5],[.7,1.25,-.45]);
  /* the peg, its line and the basket (the eggs come down in it, bedded in moss) */
  beam('iron',[-.3,2.35,-.72],[-.3,2.35,-.3],.03,P('iron'),true,5);cord('rope',[[-.3,2.33,-.32],[-.3,.9,-.2]],.012,P('rope'));
  lathe('straw',-.3,-.2,[[.12,.42],[.22,.55],[.24,.75],[.2,.85]],10,P('straw'));for(let k=0;k<3;k++)ellip('plain',-.3+(k-1)*.07,.82,-.2,.035,.05,.035,P('white'),0,6);
  for(const a of [0,2.1,4.2])cord('rope',[[-.3+Math.cos(a)*.2,.85,-.2+Math.sin(a)*.2],[-.3,.95,-.2]],.008,P('rope'));
  fgFurn('fellgang_poor_egg_basket',.6,null,.8,0);}});
defBuilding({key:'fg-burial-ledge',name:'A burial ledge',seed:9145,cls:'landmark',w:2.6,d:1.5,h:1.1,budget:1800,
 tags:{types:['funerary'],style:'drystone',role:'burial'},
 note:'the Fowlers lay their dead on ledges of the wall: a kerb of drystone round the ledge, the dead wrapped in hide and bound with cord, a little cairn at the head, the family\'s rope end coiled beside them and a slate with the name',
 build(o){const C=fgCx(o),col=fgCol('stone',C);if(o.face!==false)box('stone',0,Math.min(-.3,C.lo),-.62,2.6,1.2-Math.min(-.3,C.lo),.26,fgCol('stoneD',C));
  for(const s of [-1,1])box('stone',0,0,s*.55,2.4,.22,.18,col);for(const s of [-1,1])box('stone',s*1.15,0,0,.18,.22,1.1,col);
  ellip('hide',-.1,.2,0,.95,.17,.27,P('hide'),0,10);for(const x of [-.75,-.35,.1,.55])ring('cord',x,.2,0,.27,.015,P('rope'),0,0,PI/2,12);
  for(let k=0;k<6;k++)ellip('stone',.95+rr(-.1,.1),.08+k*.09,rr(-.12,.12),.14-k*.012,.08,.12-k*.01,col,rr(0,PI),6);
  const fam=o.family==null?C.v:o.family|0;ring('rope',.75,.14,.35,.14,.03,hc(fgMarkCol(fam)).clone().lerp(hc(0x8a7656),.55),0,0,0,12);
  W(-.4,.24,.5,0,()=>{box('stoneD',0,0,0,.26,.18,.03,P('slate'),0,-.3);box('plain',0,.08,.02,.16,.012,.004,P('white'),0,-.3);});fgMark(fam,.4,.38,.52,0,.18);}});
defBuilding({key:'fg-halt',name:'A Travellers\' halt',seed:9146,cut:true,w:4.2,d:3.2,h:2.3,budget:1200,
 tags:{types:['infrastructure'],style:'salvage',role:'halt'},
 note:'a Travellers\' halting place by the lantern road (the Fellgangs who live on the road: the owner, 2026-11-11): a low shelter of hide and plate on bell-fir poles, open to the road, a fire ring before it, a lantern on its pole',
 build(o){const C=fgCx(o),pc=fgCol('pole',C),hw=1.7,yr=2.05;
  /* three A-frames of bell-fir poles and the ridge pole; hide down the back slope to the ground, plate at the windward end */
  for(const x of [-hw,0,hw]){pole('pole',[x,0,-1.45],[x,yr+.1,-.1],.05,pc,6);pole('pole',[x,0,.55],[x,yr+.1,-.25],.05,pc,6);}
  pole('pole',[-hw-.25,yr,-.15],[hw+.25,yr,-.15],.05,pc,6);
  fgSlab('hideW',[-hw-.15,yr+.05,-.12],[hw+.15,yr+.05,-.12],[-hw-.15,0,-1.5],.03,P('hide'));fgSlab('hideW',[-hw-.15,yr+.05,-.18],[hw+.15,yr+.05,-.18],[-hw-.15,1,.38],.03,P('hide'));
  poly('plate',[[-hw-.18,0,-1.48],[-hw-.18,0,.5],[-hw-.18,yr,-.16]],fgCol('plate',C),true);fgLash([-hw-.2,yr,-.16],[-hw-.2,.1,.48]);
  for(const x of [-1.1,.3])fgFurn('fellgang_poor_fur_bed',x,0,-.7,PI/2,{v:x>0?1:0});
  fgHearth(.6,1.05,C,{r:.38});fgFurn('fellgang_poor_hide_sacks',hw-.3,0,.3,0);
  /* the lantern on its pole by the road (a lobelia in a can) */
  pole('pole',[hw+.15,0,1.25],[hw+.15,1.9,1.25],.04,pc,5);W(hw+.15,1.62,1.25,0,()=>{box('tin',0,0,0,.2,.24,.2,fgCol('tin',C));sph('glow',0,.12,0,.04,hc(0x7ab4ff),1.3,6);haloAt(0,.12,0,0x7ab4ff,false);});}});
/* the Travellers' wagon: +z is its back (the door and the steps), -z its front (the drawbar) */
defBuilding({key:'fg-wagon',name:'A Travellers\' wagon',seed:9147,cut:true,w:2.6,d:6,h:3.3,budget:2600,
 tags:{types:['dwelling-single'],style:'salvage',role:'dwelling'},
 note:'the Travellers\' rolling home: a barrel-top covered sledge-wagon of bright painted boards, plate runners faced with tyres, a stove pipe, steps at the back',
 build(o){const C=fgCx(o),pc=fgCol('pole',C),L=4.2,bw=2.2,y0=.62,yw=1.85,R=bw/2;
  const cols=[[0xa8321e,0x2e6a4a],[0x2e5a8a,0xc8902e],[0x3a7a4a,0xa8321e]][C.v%3].map(c=>C.worn?hc(c).clone().multiplyScalar(.7):hc(c));
  /* the runners: white plate faced with strips of tyre, curled up at the front; cross-bearers; the drawbar */
  for(const s of [-1,1]){const x=s*(bw/2-.15);box('plate',x,.06,.1,.1,.18,5.2,fgCol('plate',C));box('tyre',x,0,.1,.14,.06,5.2,P('tyre'));beam('plate',[x,.15,-2.5],[x,.55,-2.85],.12,fgCol('plate',C),false);
   pole('pole',[x,.06,-2.6],[x*.2,.4,-2.95],.05,pc,5);}
  for(const z of [-1.8,-.6,.6,1.8])box('wood',0,.24,z,bw,.12,.16,fgCol('wood',C));box('wood',0,.36,0,bw,.26,L,fgCol('wood',C));
  /* the body: painted boards, the colours in bands, a scalloped trim under the barrel top, the family's mark */
  for(let k=0;k<5;k++){const y=y0+k*(yw-y0)/5;for(const s of [-1,1])box('wood',s*(bw/2-.03),y,0,.06,(yw-y0)/5-.015,L,k%2?cols[1]:cols[0]);}
  box('wood',0,y0,-L/2+.03,bw,yw-y0,.06,cols[0]);
  for(let k=0;k<14;k++)for(const s of [-1,1])box('plain',s*(bw/2+.005),yw-.12,-L/2+.15+k*(L-.3)/13,.012,.1,.12,P('ochre'));
  for(const s of [-1,1])fgMark(C.v,s*(bw/2+.01),1.1,0,s*PI/2,.5,0xe8e2d4);
  /* the barrel top: curved boards on hoops of bent fir, painted */
  psurf('wood',(u,v)=>{const a=PI*u;return [Math.cos(a)*R,yw+Math.sin(a)*R*.95,-L/2+L*v];},10,4,cols[1]);
  for(let k=0;k<=4;k++){const z=-L/2+.05+k*(L-.1)/4,P0=[];for(let i=0;i<=8;i++){const a=PI*i/8;P0.push([Math.cos(a)*(R+.03),yw+Math.sin(a)*(R*.95+.03),z]);}cord('pole',P0,.035,pc);}
  /* the back: a painted plate door, the steps down; the gable boards at both ends */
  W(0,0,L/2-.03,0,()=>{box('wood',-.7,y0,0,.6,yw-y0,.06,cols[0]);box('wood',.7,y0,0,.6,yw-y0,.06,cols[0]);});
  svLeaf(0,y0,L/2,0,.8,1.2,{mk:'paint',col:cols[1],t:.05,name:'the wagon door'});door(0,y0,L/2,0,.8,1.2);
  poly('wood',[[-R,yw,L/2-.03],[R,yw,L/2-.03],[0,yw+R*.95,L/2-.03]],cols[0],true);poly('wood',[[-R,yw,-L/2+.03],[R,yw,-L/2+.03],[0,yw+R*.95,-L/2+.03]],cols[0],true);
  for(let k=0;k<3;k++)box('wood',0,.15+k*.17,L/2+.2+(2-k)*.22,.7,.05,.24,fgCol('wood',C));for(const s of [-1,1])beam('wood',[s*.36,.06,L/2+.85],[s*.36,y0,L/2+.08],.04,fgCol('wood',C));
  /* the stove pipe through the roof, a stove inside, the bed across the front */
  cyl('iron',-.55,1.2,-1.1,.07,2.05,P('iron'),8);cone('iron',-.55,3.22,-1.1,.14,.08,P('iron'),8);smokeAt(-.55,3.3,-1.1,{r:.15});
  fgFurn('fellgang_poor_fur_bed',0,y0,-L/2+.6,0);fgFurn('fellgang_common_chest',.6,y0,.9,-PI/2);box('iron',-.55,y0,-1.1,.4,.55,.4,P('iron'));}});
/* the Ice-cutters' tools by their stacks (PLAN.md 3.3.1: the cutters' saws, pike poles and tongs): an A-frame rack of fir */
defBuilding({key:'fg-ice-tools',name:'The ice-cutters\' tool rack',seed:9148,cls:'prop',w:1.8,d:.9,h:2.4,budget:1600,
 tags:{style:'salvage',role:'tools',job:'quarrying'},
 note:'the Ice-cutters\' tools by their stacks: an A-frame rack of bell fir, two long ice saws (a blade of Ancient plate, a fir crossbar), pike poles with iron hooks, block tongs hung from the bar, a coil of rope',
 build(o){const C=fgCx(o),pc=fgCol('pole',C),ic=P('iron');
  for(const s of [-1,1]){pole('pole',[s*.82,0,-.35],[s*.82,1.95,0],.045,pc,5);pole('pole',[s*.82,0,.35],[s*.82,1.95,0],.045,pc,5);}
  pole('pole',[-.9,1.9,0],[.9,1.9,0],.04,pc,5);pole('pole',[-.85,.55,-.2],[.85,.55,-.2],.035,pc,5);
  /* the saws: tall blades leaning on the bar, their crossbars at the top */
  for(const x of [-.45,-.15]){W(x,0,.28,0,()=>{box('plate',0,.05,0,.2,1.75,.012,fgCol('plate',C),0,-.12);for(let k=0;k<8;k++)quad('plain',.1,.2+k*.2,.008,.03,.06,P('dark'),0,0,.7);
   pole('pole',[-.32,1.9,-.12],[.32,1.9,-.12],.025,pc,4);});}
  /* the pike poles: fir shafts with iron hooks */
  for(const x of [.2,.42,.62]){beam('pole',[x,0,.32],[x+.05,2.3,-.02],.025,pc,true,5);beam('iron',[x+.05,2.3,-.02],[x+.06,2.42,-.04],.02,ic,true,4,.004);beam('iron',[x+.05,2.32,-.02],[x+.14,2.36,-.02],.012,ic,true,4,.003);}
  /* the tongs hung from the bar, a coil of rope */
  for(const x of [-.65,.75])for(const s of [-1,1]){beam('iron',[x,1.88,0],[x+s*.12,1.55,0],.012,ic,true,4);beam('iron',[x+s*.12,1.55,0],[x+s*.05,1.38,0],.012,ic,true,4);}
  ring('rope',-.2,1.6,-.12,.18,.035,P('rope'),0,PI/2,0,8);}});
