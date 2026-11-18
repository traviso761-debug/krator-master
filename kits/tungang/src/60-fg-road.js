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
/* the Travellers' vardo wagon: +z is its back (the Dutch door and steps), -z its front (the shafts and forecarriage) */
defBuilding({key:'fg-wagon',name:'A Travellers\' vardo wagon',seed:9147,cut:true,w:2.6,d:6,h:3.3,budget:4500,
 tags:{types:['dwelling-single'],style:'salvage',role:'dwelling'},
 note:'the Travellers\' rolling home (Irish Traveller / Romani bow-top and ledge vardo): ornate painted panels and gilded scroll-trim, spoked wheels with winter runner-skis slung beneath, shuttered lace-curtained windows, stove pipe, Dutch door and steps at +z',
 build(o){const C=fgCx(o),wc=fgCol('wood',C),ic=P('iron'),L=4.16,bw=2.18,w0=1.74,y0=.74,yw=1.9,R=bw/2;
  const pal=[[0xa8281e,0x246444,0xd8a230],[0x24528a,0xd09628,0xe8e0cc],[0x2c683e,0xb23020,0xd8a434],
   [0x7a2434,0xe2dac4,0xc8902e],[0x246868,0xd09428,0xa82c1e],[0x263e78,0xa82a22,0xe8e2d4]][C.v%6];
  const cols=pal.map(c=>C.worn?hc(c).clone().multiplyScalar(.72):hc(c)),canv=C.worn?hc(0xbcae94):hc([0xebe3ce,0xdfd4bc,0x3a6448,0x8c2c22][C.v%4]);
  /* spoked vardo wheels (large rear r .48 at z .92, smaller turning front r .36 at z -1.32), axletrees, pan-box and slung winter runners */
  const wheel=(wx,wy,wz,r,ns)=>{WX(wx,wy,wz,0,0,PI/2,()=>{cyl('wood',0,0,0,.09,.16,cols[0],8);cyl('iron',0,0,0,.05,.2,ic,8);});
   ring('tyre',wx,wy,wz,r,.028,P('tyre'),0,0,PI/2,11);ring('paint',wx,wy,wz,r-.038,.026,cols[2],0,0,PI/2,11);
   for(let k=0;k<ns;k++){const a=k*TAU/ns+C.v*.13;beam('paint',[wx,wy,wz],[wx,wy+Math.cos(a)*(r-.04),wz+Math.sin(a)*(r-.04)],.018,cols[2],false,4);}};
  for(const s of [-1,1]){wheel(s*1.12,.48,.92,.48,10);wheel(s*1.05,.36,-1.32,.36,8);
   /* winter sledge-skis: shod under the wheels on every 3rd wagon, slung beneath the pan-box on the rest */
   if(C.v%3===2){box('plate',s*1.08,.03,-.15,.14,.05,3.4,fgCol('plate',C));beam('plate',[s*1.08,.05,-1.85],[s*1.08,.28,-2.18],.08,fgCol('plate',C),false);}
   else beam('plate',[s*.66,.46,-.2],[s*.66,.46,1.15],.07,fgCol('plate',C),false);}
  beam('iron',[-1.16,.48,.92],[1.16,.48,.92],.038,ic,true,6);beam('iron',[-1.08,.36,-1.32],[1.08,.36,-1.32],.035,ic,true,6);
  box('wood',0,.58,.92,w0,.16,.2,cols[0]);box('wood',0,.5,-1.32,w0*.9,.22,.22,cols[1]);cyl('iron',0,.42,-1.32,.22,.08,ic,10);
  /* undercarriage pan-box, hanging tin bucket/kettle at the rear, and front shafts propped on a wooden trestle */
  box('wood',0,.44,.18,1.08,.24,1.35,cols[1]);cyl('tin',.52,.26,1.68,.13,.24,fgCol('tin',C),8);
  for(const s of [-1,1]){beam('pole',[s*.46,.54,-1.52],[s*.42,.36,-2.88],.042,cols[0],true,5);pole('pole',[s*.42,0,-2.62],[s*.42,.36,-2.62],.03,wc,4);}
  pole('pole',[-.48,.35,-2.62],[.48,.35,-2.62],.03,wc,4);
  /* lower waist and outward-flaring side ledges (Reading/bow-top vardo framing), chamfered ribs and gold bead-moulding */
  box('wood',0,y0-.12,0,w0,.12,L,wc);box('wood',0,y0-.02,0,bw,.08,L+.08,cols[0]);
  for(let k=0;k<5;k++){const y=y0+.06+k*(yw-y0-.06)/5,h0=(yw-y0-.06)/5-.014;
   for(const s of [-1,1])box('paint',s*(bw/2-.03),y,0,.055,h0,L,k===2?cols[1]:cols[0]);}
  for(let k=0;k<7;k++){const z=-L/2+.22+k*(L-.44)/6;for(const s of [-1,1])box('paint',s*(bw/2+.008),y0+.06,z,.024,yw-y0-.1,.05,cols[2]);}
  for(const y of [y0+.04,yw-.05])for(const s of [-1,1])box('paint',s*(bw/2+.01),y,0,.03,.045,L+.06,cols[2]);
  /* scalloped eaves fascia and side windows with painted shutters and cream lace curtains */
  for(let k=0;k<14;k++)for(const s of [-1,1])box('paint',s*(bw/2+.016),yw-.13,-L/2+.16+k*(L-.32)/13,.016,.09,.12,cols[2]);
  for(const s of [-1,1])W(s*(bw/2+.015),y0+.42,-.18,s*PI/2,()=>{box('plain',0,0,0,.64,.56,.03,hc(0x22201c));
   for(const lx of [-.15,.15])box('plain',lx,.04,.018,.24,.46,.012,hc(0xf0ead8));
   box('paint',0,.28,.024,.7,.05,.03,cols[2]);box('paint',0,-.28,.024,.72,.05,.04,cols[2]);
   for(const sg of [-1,1])box('paint',sg*.46,0,.028,.24,.54,.025,cols[1],sg*.22);});
  box('paint',0,y0,-L/2+.03,bw,yw-y0,.06,cols[0]);W(0,y0+.52,-L/2-.01,PI,()=>{box('paint',0,0,0,.92,.52,.03,cols[1]);fgMark(C.v,0,.18,.02,0,.38,pal[2]);});
  /* arched bow-top roof (painted canvas or boarded tilt on bent fir hoops) and carved front/rear crownboards */
  psurf('wood',(u,v)=>{const a=PI*u;return [Math.cos(a)*R,yw+Math.sin(a)*R*.92,-L/2-.12+(L+.24)*v];},12,4,C.v%2?canv:cols[1]);
  for(let k=0;k<=3;k++){const z=-L/2+k*L/3,P0=[];for(let i=0;i<=6;i++){const a=PI*i/6;P0.push([Math.cos(a)*(R+.028),yw+Math.sin(a)*(R*.92+.028),z]);}cord('pole',P0,.032,cols[2]);}
  for(const sz of [-1,1]){const z=sz*(L/2-.03);poly('paint',[[-R,yw,z],[R,yw,z],[0,yw+R*.92,z]],cols[0],true);
   for(let k=-3;k<=3;k++){const a=k*.26;beam('paint',[0,yw+.12,z+sz*.05],[Math.sin(a)*.78,yw+.12+Math.cos(a)*.68,z+sz*.05],.02,cols[2],false,4);}}
  /* rear (+z) Dutch door, carved porch brackets, detachable steps and hanging brass/tin road lantern */
  W(0,0,L/2-.03,0,()=>{box('paint',-.71,y0,0,.62,yw-y0,.06,cols[0]);box('paint',.71,y0,0,.62,yw-y0,.06,cols[0]);
   for(const s of [-1,1])box('paint',s*.48,yw-.18,.08,.12,.22,.22,cols[2]);});
  svLeaf(0,y0,L/2,0,.78,1.16,{mk:'paint',col:cols[1],t:.05,name:'the vardo door'});door(0,y0,L/2,0,.78,1.16);
  for(let k=0;k<4;k++)box('wood',0,.14+k*.16,L/2+.16+(3-k)*.19,.72,.045,.21,wc);
  for(const s of [-1,1])beam('paint',[s*.37,.05,L/2+.8],[s*.37,y0,L/2+.08],.038,cols[2],true,4);
  W(.68,yw-.18,L/2+.14,0,()=>{box('tin',0,0,0,.16,.22,.16,hc(0xc89a38));sph('glow',0,.08,0,.04,hc(0xffb858),1.3,6);haloAt(0,.08,0,0xffb04a,false);});
  /* interior queen-bed at the front, painted chest, parlor stove and chimney with rain-cap */
  cyl('iron',-.56,y0+.48,-1.08,.065,2.0,ic,8);cone('iron',-.56,3.22,-1.08,.14,.08,ic,8);smokeAt(-.56,3.28,-1.08,{r:.15});
  fgFurn('fellgang_poor_fur_bed',0,y0,-L/2+.62,0);fgFurn('fellgang_common_chest',.58,y0,.88,-PI/2);box('iron',-.56,y0,-1.08,.38,.52,.38,ic);}});
/* Traditional Irish Traveller / Romanichal bender tent (+z open flap): bent hazel/fir hoops under patched canvas, tarp and hide */
defBuilding({key:'fg-bender',name:'A Travellers\' bender tent',seed:9165,cut:true,w:4.4,d:3.6,h:2.2,budget:2800,
 tags:{types:['dwelling-single'],style:'salvage',role:'dwelling'},
 note:'an Irish Traveller / Romani bender tent pitched beside a family\'s vardos: bent fir and willow hoops lashed into a rounded dome-tunnel, covered in patched canvas, oilcloth and hide weighted with stones at the skirt, stove pipe and fur beds within',
 build(o){const C=fgCx(o),pc=fgCol('pole',C),col=fgCol('stone',C),ic=P('iron'),rx=2.04,hy=1.96,L=3.1;
  const base=hc([0xd8ccb2,0xba9258,0x586650,0x4c5c6a][C.v%4]),pat=hc([0x8e5236,0xc89638,0x6e604c,0xdcd2bc][(C.v+1)%4]);
  if(C.worn){base.multiplyScalar(.76);pat.multiplyScalar(.74);}
  /* five bent fir/hazel hoop arches and five longitudinal stringers lashed at their crossings */
  for(let k=0;k<5;k++){const z=-1.52+k*(L/4),s=k===0||k===4?.86:1,P0=[];
   for(let i=0;i<=10;i++){const a=PI*i/10;P0.push([Math.cos(a)*rx*s,Math.sin(a)*hy*(k===0?.84:1),z]);}cord('pole',P0,.032,pc);}
  for(const a of [.38,.82,1.57,2.32,2.76]){const x=Math.cos(a)*rx,y=Math.sin(a)*hy;pole('pole',[x*.86,y*.86,-1.52],[x*.86,y*.86,1.58],.024,pc,5);}
  /* curved patched canvas/oilcloth shell, back dome closure, stitched patches and stone-weighted skirt */
  psurf('hideW',(u,v)=>{const a=.08+u*(PI-.16),z=-1.52+v*L,s=1-.12*Math.pow(2*v-1,4);return [Math.cos(a)*rx*s,Math.sin(a)*hy*s,z];},12,6,base);
  psurf('hideW',(u,v)=>{const a=PI*u,r=v;return [Math.cos(a)*rx*.86*r,Math.sin(a)*hy*.84*r,-1.52-.18*(1-r)];},10,3,pat);
  for(let k=0;k<4;k++){const a=.45+k*.68,z=-.95+(k%2)*.95,ca=Math.cos(a),sa=Math.sin(a);
   W(ca*(rx+.02),sa*(hy+.02),z,0,()=>box('hideW',0,0,0,.62,.48,.025,k%2?pat:P('hide'),0,(a-PI/2)*.85));}
  for(let k=0;k<14;k++){const a=.35+k*(TAU-.7)/13,x=Math.cos(a)*(rx+.08),z=Math.sin(a)*1.66-.04;if(z>1.35&&Math.abs(x)<.85)continue;
   ellip('stone',x,.09,z,.19,.11,.16,col,a,6);}
  /* arched +z entrance with tied-back canvas flaps, interior woven carpet & beds, stove pipe and milk churn */
  for(const s of [-1,1]){poly('hideW',[[s*rx*.86,0,1.56],[s*.62,0,1.64],[s*.78,1.52,1.54]],pat,true);
   fgLash([s*.72,1.05,1.58],[s*1.58,.95,1.42]);}
  box('paint',0,.02,-.1,1.65,.025,2.2,hc([0x962e22,0x2c5a78,0xc48c2c][C.v%3]));
  for(const s of [-1,1])fgFurn('fellgang_poor_fur_bed',s*1.05,0,-.28,PI/2,{v:s>0?1:0});
  fgFurn('fellgang_common_chest',0,0,-1.05,0);
  box('iron',-.82,0,.55,.36,.42,.36,ic);cyl('iron',-.82,.42,.55,.055,1.68,ic,8);cone('iron',-.82,2.1,.55,.12,.07,ic,8);smokeAt(-.82,2.16,.55,{r:.13});
  cyl('tin',1.18,0,1.55,.16,.48,fgCol('tin',C),8);cyl('tin',1.18,.48,1.55,.1,.12,fgCol('tin',C),8);fgSet('bender',1);}});
/* Communal Traveller family campfire: stone-kerbed peat hearth, iron tripod trammel & cauldron kettle, stools, churns and logs */
defBuilding({key:'fg-camp-hearth',name:'A Travellers\' campfire and tripod kettle',seed:9166,cls:'fixture',w:4.6,d:4.6,h:2.2,budget:2400,
 tags:{types:['plaza'],style:'salvage',role:'lamp',light:'flame'},
 note:'the heart of each Traveller family circle (atching tan): a stone-kerbed turf fire under a three-legged iron trammel tripod with hung cauldron pot, ringed by split-log benches, three-legged stools, milk churns and a lantern stake',
 build(o){const C=fgCx(o),pc=fgCol('pole',C),wc=fgCol('wood',C),ic=P('iron'),tc=fgCol('tin',C);
  fgHearth(0,0,C,{r:.68});
  /* forged three-legged iron tripod (trammel) over the fire, chain and suspended black cauldron kettle */
  for(let k=0;k<3;k++){const a=k*TAU/3+.28;beam('iron',[Math.cos(a)*.88,0,Math.sin(a)*.88],[0,2.04,0],.028,ic,true,5);}
  ring('iron',0,1.98,0,.07,.016,ic,0,0,0,8);cord('iron',[[0,1.98,0],[0,1.02,0]],.014,ic);
  lathe('iron',0,0,[[.06,.62],[.26,.68],[.3,.86],[.24,1.0]],10,ic);ring('iron',0,1.0,0,.25,.014,ic,0,PI/2,0,10);
  /* split-log benches, stools, upturned barrel table with tin mugs, milk churns, firewood stack and camp lantern */
  for(const [a,L] of [[.85,1.55],[2.45,1.5],[-2.15,1.45]]){const x=Math.cos(a)*1.78,z=Math.sin(a)*1.78;
   W(x,0,z,-a+PI/2,()=>{box('wood',0,.36,0,L,.09,.36,wc);for(const sx of [-L*.36,L*.36])cyl('pole',sx,0,0,.09,.36,pc,6);});}
  for(const a of [-.35,1.65,-1.25]){const x=Math.cos(a)*1.52,z=Math.sin(a)*1.52;
   cyl('wood',x,.38,z,.19,.05,wc,8);for(let k=0;k<3;k++){const b=k*TAU/3;pole('pole',[x+Math.cos(b)*.15,0,z+Math.sin(b)*.15],[x+Math.cos(b)*.09,.38,z+Math.sin(b)*.09],.022,pc,4);}}
  cyl('wood',1.68,0,.22,.32,.66,wc,10);ring('iron',1.68,.18,.22,.33,.015,ic,0,0,0,10);ring('iron',1.68,.52,.22,.33,.015,ic,0,0,0,10);
  cyl('tin',1.62,.66,.16,.09,.18,hc(0xb87838),8);cyl('tin',1.78,.66,.32,.045,.1,tc,6);
  cyl('tin',-1.78,0,.98,.17,.52,tc,8);cyl('tin',-1.78,.52,.98,.11,.12,tc,8);
  for(let r=0;r<3;r++)for(let k=0;k<3-r;k++)WX(-1.35+k*.22+r*.11,.09+r*.16,-1.68,0,.3,PI/2,()=>cyl('pole',0,0,0,.085,.88,pc,6));
  pole('pole',[1.42,0,-1.52],[1.42,2.08,-1.52],.038,pc,5);
  W(1.42,1.8,-1.52,0,()=>{box('tin',0,0,0,.18,.24,.18,tc);sph('glow',0,.1,0,.04,hc(0xffb454),1.3,6);haloAt(0,.1,0,0xffa844,false);});
  fgSet('campHearth',1);}});
/* Traveller tinsmith / coppersmith work pitch and washing line (+z front) */
defBuilding({key:'fg-tinsmith',name:'A Travellers\' tinsmith pitch and clothesline',seed:9167,cut:true,w:6.2,d:4.6,h:2.9,budget:3600,
 tags:{types:['industry','shop'],wealth:'middle',style:'salvage',role:'works',job:'smithing'},
 note:'the Travellers\' famous road trade (tinsmithing, copper-mending and salvage) beside a family\'s washing line: canvas fly on poles, stump anvil, charcoal brazier, gleaming copper and tin kettles, churns and pans, and bright clothes and shawls strung to dry',
 build(o){const C=fgCx(o),pc=fgCol('pole',C),wc=fgCol('wood',C),ic=P('iron'),tc=fgCol('tin',C),cop=hc(0xb86e38);
  const flyC=C.worn?hc(0x9e927c):hc([0xdcd0b6,0xc49658,0x586854][C.v%3]);
  /* slanted canvas fly over the tinsmith's pitch (-x half), guyed to stakes */
  for(const x of [-2.78,.48]){pole('pole',[x,0,1.52],[x,2.72,1.52],.055,pc,6);pole('pole',[x,0,-1.82],[x,1.78,-1.82],.055,pc,6);}
  pole('pole',[-2.88,2.7,1.52],[.58,2.7,1.52],.048,pc,6);pole('pole',[-2.88,1.76,-1.82],[.58,1.76,-1.82],.045,pc,6);
  fgSlab('hideW',[-2.86,2.74,1.58],[.56,2.74,1.58],[-2.86,1.74,-1.92],.03,flyC);
  for(const [px,py,pz,sx,sz] of [[-2.82,2.68,1.52,-3.02,2.14],[-2.82,1.76,-1.82,-3.02,-2.16],[.52,2.68,1.52,.82,2.14]]){
   fgLash([px,py,pz],[sx,.08,sz]);pole('pole',[sx,0,sz],[sx,.28,sz],.025,wc,4);}
  /* timber-stump anvil, charcoal brazier with glowing coals, bellows, and workbench laden with copper & tin ware */
  cyl('pole',-.85,0,.18,.3,.58,pc,8);box('iron',-.85,.58,.18,.56,.22,.26,ic);beam('iron',[-.57,.72,.18],[-.35,.74,.18],.055,ic,true,5,.012);
  cyl('stoneD',-1.95,0,-.35,.44,.56,fgCol('stoneD',C),10);cyl('iron',-1.95,.52,-.35,.36,.18,ic,10);
  if(!C.worn){ellip('glow',-1.95,.69,-.35,.22,.05,.2,hc(0xff621c),0,6);haloAt(-1.95,.82,-.35,0xff6a20,false);smokeAt(-1.95,.95,-.35,{r:.18});}
  box('wood',-1.15,.74,-1.22,2.45,.06,.68,wc);for(const sx of [-1.05,1.05])for(const sz of [-.24,.24])box('wood',-1.15+sx,0,-1.22+sz,.08,.74,.08,wc);
  for(let k=0;k<6;k++){const x=-2.15+k*.38,cu=k%2===0;cyl('tin',x,.8,-1.22,.11+(k%3)*.02,.18+(k%2)*.08,cu?cop:tc,8);}
  for(let k=0;k<3;k++)cyl('tin',-2.45+k*.42,0,1.05,.16,.48,k===1?cop:tc,8);
  for(let k=0;k<3;k++)box(k%2?'plate':'tin',.22,0,-.95+k*.24,.04,.85,.62,fgCol(k%2?'plate':'tin',C),.1);
  /* taut Traveller washing line (+x half) between notched fir poles with bright clothes, shawls and blankets */
  pole('pole',[.72,0,1.35],[.72,2.52,1.35],.05,pc,6);pole('pole',[2.88,0,-1.25],[2.88,2.46,-1.25],.05,pc,6);
  pole('pole',[2.88,0,1.45],[2.88,2.42,1.45],.05,pc,6);
  cord('rope',[[.72,2.38,1.35],[1.8,2.24,.05],[2.88,2.34,-1.25]],.012,P('rope'));
  cord('rope',[[.72,2.34,1.35],[1.8,2.22,1.4],[2.88,2.3,1.45]],.012,P('rope'));
  const wash=[[0xb42e22,.52,.82],[0xe6dec8,.46,.72],[0x265888,.56,.88],[0xd49828,.48,.76],[0x2e6e48,.58,.92]];
  for(let k=0;k<5;k++){const t=(k+.5)/5,x=.72+(2.88-.72)*t,z=1.35+(-1.25-1.35)*t,y=2.32-.12*Math.sin(PI*t),w=wash[k];
   W(x,y-w[2]/2,z,-.72,()=>box('flag',0,0,0,w[1],w[2],.018,C.worn?hc(w[0]).clone().multiplyScalar(.75):hc(w[0]),0,.06*(k%2?1:-1)));}
  for(let k=0;k<3;k++){const t=(k+.5)/3,x=.72+(2.88-.72)*t,z=1.35+(1.45-1.35)*t,w=wash[(k+2)%5];
   W(x,2.24-w[2]*.45,z,.05,()=>box('flag',0,0,0,w[1]*1.1,w[2]*.85,.018,C.worn?hc(w[0]).clone().multiplyScalar(.75):hc(w[0])));}
  fgFurn('fellgang_poor_hide_sacks',1.55,0,-.85,.4);fgSet('tinsmith',1);}});
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
/* the Stairhead's gin wheel and lowering frame (settlements/blakhed PLAN.md section 5, step B2): +z overhangs the pitch */
defBuilding({key:'fg-stair-hoist',name:'A stair hoist and gin wheel',seed:9161,cls:'infrastructure',cut:true,w:8.6,d:10.6,h:6.4,budget:4500,
 tags:{types:['infrastructure'],style:'salvage',role:'hoist',job:'warehousing'},
 note:'the Stairhead\'s lowering engine: a beast-walked capstan and Ancient cable drum in a kerbed track, braced bell-fir A-frame legs leaning over the pitch (+z), iron gin sheaf and hung cargo cradle',
 build(o){const C=fgCx(o),pc=fgCol('pole',C),wc=fgCol('wood',C),col=fgCol('stone',C),sc=fgCol('stoneD',C),ic=P('iron');
  fgPlinth(-3.9,3.9,-5.1,2.6,C,{top:.05});
  /* circular drystone kerb of the beasts' track about (0, -1.3), counterweight cairn at the back, central capstan and sweep bars */
  sector('stone',0,-1.3,3.35,3.85,0,TAU,0,.38,col,20);box('stone',0,0,-4.55,3.2,.95,.9,col);
  pole('pole',[0,.05,-1.3],[0,2.75,-1.3],.18,pc,8);cyl('iron',0,.65,-1.3,.62,.95,ic,12);
  for(let k=0;k<6;k++)ring('cable',0,.76+k*.13,-1.3,.65,.028,P('cable'),0,0,0,12);
  for(const a of [0,PI/2]){W(0,1.25,-1.3,a+C.v*.2,()=>{beam('pole',[-3.95,0,0],[3.95,0,0],.075,pc,true,6);
   for(const s of [-1,1])ring('iron',s*3.75,-.08,0,.1,.02,ic,0,PI/2,0,8);});}
  /* braced bell-fir A-frame shear legs leaning out over +z, head beam, iron sheaf wheel and hung sledge load */
  for(const sx of [-1,1]){const x0=sx*2.35,xh=sx*1.35;box('stoneD',x0,Math.min(-.3,C.lo),1.95,.95,.45-Math.min(-.3,C.lo),.95,sc);
   beam('pole',[x0,.15,1.95],[xh,6.05,4.95],.13,pc,true,7);beam('pole',[sx*2.6,.15,-1.1],[xh,5.65,4.55],.095,pc,true,6);}
  beam('pole',[-1.55,6.02,4.95],[1.55,6.02,4.95],.12,pc,true,7);beam('pole',[-2.1,3.2,3.45],[2.1,3.2,3.45],.08,pc,true,5);
  WX(0,5.78,4.95,0,0,PI/2,()=>cyl('iron',0,0,0,.42,.12,ic,12));
  cord('cable',[[0,1.35,-1.3],[0,6.12,4.95],[0,1.85,4.95]],.026,P('cable'));
  W(0,1.25,4.95,0,()=>{box('wood',0,0,0,1.55,.1,1.15,wc);for(const sx of [-.68,.68])for(const sz of [-.48,.48])cord('rope',[[sx,.05,sz],[0,.62,0]],.014,P('rope'));
   box('ice',0,.1,0,.95,.5,.68,P('ice'));box('straw',0,.6,0,1,.06,.72,P('sawdust'));});
  fgSign('HOLD FAST',0,1.05,-4.08,PI,C,{ch:.13,kind:'rust',ink:'white'});fgSet('hoist',1);}});
/* a 5 m hurdle section for the Fair's beast ring and drove lanes */
defBuilding({key:'fg-fair-hurdle',name:'A Fair-ring hurdle',seed:9162,cls:'fixture',w:5,d:.9,h:1.4,budget:1100,
 tags:{types:['infrastructure'],style:'salvage',role:'fence',job:'herding'},
 note:'a 5 m section of the Fair\'s ring rails: three bell-fir posts wedged in drystone cairn-feet, three fir rails lashed with cord, iron tether rings and a family mark',
 build(o){const C=fgCx(o),pc=fgCol('pole',C),col=fgCol('stone',C),ic=P('iron');
  for(const x of [-2.32,0,2.32]){box('stone',x,Math.min(0,C.lo+.25),0,.52,.32-Math.min(0,C.lo+.25),.74,col);
   pole('pole',[x,0,0],[x,1.34,0],.065,pc,6);}
  for(const y of [.42,.82,1.2])pole('pole',[-2.48,y,.05],[2.48,y,.05],.042,pc,5);
  for(const x of [-2.32,0,2.32])for(const y of [.42,1.2])fgLash([x-.06,y+.05,-.06],[x+.06,y-.05,.1]);
  ring('iron',-1.15,.82,.1,.08,.016,ic,0,0,0,8);ring('iron',1.15,.82,.1,.08,.016,ic,0,0,0,8);
  if(C.v%3===0){box('plate',0,.82,.09,.38,.34,.025,fgCol('plate',C));fgMark(C.v,0,.98,.11,0,.22);}
  fgSet('hurdle',1);}});
/* the peace stone (v 0) and the fell cairns (v >= 1) */
defBuilding({key:'fg-cairn',name:'A cairn or peace stone',seed:9163,cls:'landmark',w:3.2,d:3.2,h:2.8,budget:2400,
 tags:{types:['plaza'],style:'drystone',role:'cairn'},
 note:'on the Market (v 0), the tall uncarved standing stone in its drystone kerb where a quarrel is sworn off for the market peace; on the fells and at the Fair, a stepped drystone cairn with a lashed mark plate and iron spike',
 build(o){const C=fgCx(o),col=fgCol('stone',C),sc=fgCol('stoneD',C);
  cyl('stone',0,Math.min(0,C.lo+.2),0,1.48,.28-Math.min(0,C.lo+.2),col,14);
  sector('stoneD',0,0,1.18,1.5,0,TAU,.24,.52,sc,14);
  if((C.v|0)===0){/* the Market's standing peace stone */
   for(let k=0;k<3;k++)cyl('stone',0,.28+k*.22,0,1.12-k*.18,.24,col,12);
   box('stoneD',0,.85,0,.86,1.88,.54,P('slate'),.14,.03);
   for(const y of [1.35,2.05])ring('cable',0,y,0,.52,.018,P('cable'),0,PI/2,0,10);
   fgSign('PEACE',0,1.48,.31,0,C,{ch:.12,kind:'plate'});fgSet('peace',1);}
  else{/* a stepped drystone cairn */
   for(let k=0;k<6;k++){const r=1.22-k*.15,y=.28+k*.33;cyl('stone',rr(-.04,.04),y,rr(-.04,.04),r,.35,k%2?col:sc,11);}
   fgSpike([0,2.22,0],[0,1,.08],.52);
   W(0,1.55,.82,0,()=>{box('plate',0,-.18,0,.56,.44,.03,fgCol('plate',C));fgMark(C.v,0,.04,.02,0,.32);});fgSet('cairn',1);}}});
/* a road waystone with lashed salvage-plate fingerboards */
defBuilding({key:'fg-stone-sign',name:'A road stone and fingerboard',seed:9164,cls:'fixture',w:1.5,d:1,h:2.3,budget:1300,
 tags:{types:['infrastructure'],style:'salvage',role:'sign'},
 note:'a drystone way-cairn and bell-fir post where the rim roads part: lashed salvage-plate arms with daubed road words and a lantern lobelia bell at the crown',
 build(o){const C=fgCx(o),pc=fgCol('pole',C),col=fgCol('stone',C);
  box('stone',0,Math.min(0,C.lo+.25),0,1.24,.42-Math.min(0,C.lo+.25),.82,col);
  for(let k=0;k<5;k++){const a=k*TAU/5;ellip('stone',Math.cos(a)*.38,.44,Math.sin(a)*.26,.22,.14,.18,col,a,6);}
  pole('pole',[0,.1,0],[0,2.18,0],.075,pc,7);
  W(0,1.68,0,.18,()=>{box('plate',.14,0,.06,1.12,.26,.03,fgCol('plate',C));fgText(pick(['MARKET','STAIR','FAIR']),.12,.06,.08,0,.11,P('red'));fgLash([-.28,.24,-.06],[-.28,-.04,.09]);});
  W(0,1.34,0,-PI/2+.25,()=>{box('rust',.12,0,.06,.78,.24,.03,fgCol('rust',C));fgText('HOLD',.1,.05,.08,0,.1,P('white'));});
  sph('glow',0,2.22,0,.04,hc(0x7ab4ff),1.3,6);haloAt(0,2.22,0,0x7ab4ff,false);fgSet('sign',1);}});
/* Market sanctuary boundary stone: marks Blakhed's sworn zone of truce and hospitality round the Marketplace */
defBuilding({key:'fg-truce-post',name:'A Market truce and hospitality stone',seed:9169,cls:'landmark',w:2.2,d:2.2,h:3.5,budget:2800,
 tags:{types:['plaza'],style:'drystone',role:'cairn',light:'flame'},
 note:'a tall battered rim-slate boundary monolith marking the Marketplace\'s sworn zone of truce and hospitality: stepped drystone kerb, braided Ancient cable Peace Bands, lashed truce tablet (TRUCE / NO BLADE / GUEST), carved stone hospitality water-and-salt basin with hung tin dipper, weapon-binding rail, lantern-lobelia sanctuary cresset, and a warm peat brazier at gate posts',
 build(o){const C=fgCx(o),col=fgCol('stone',C),sc=fgCol('stoneD',C),ic=P('iron'),tc=fgCol('tin',C),pc=fgCol('pole',C);
  const gate=(C.v|0)%2===0,words=['TRUCE','PEACE','NO BLADE','GUEST'][(C.v|0)%4];
  /* stepped circular drystone sanctuary plinth reaching C.lo, rimmed with wedged kerb cobbles */
  cyl('stone',0,Math.min(0,C.lo+.2),0,1.02,.28-Math.min(0,C.lo+.2),col,12);
  sector('stoneD',0,0,.74,1.04,0,TAU,.24,.5,sc,12);
  cyl('stone',0,.28,0,.76,.26,col,10);cyl('stoneD',0,.54,0,.58,.2,sc,10);
  /* tall tapered monolith of dark rim slate, bound with braided cable and twin painted white/ochre Sanctuary Rings */
  for(let k=0;k<4;k++){const t=k/4,w=.62-.12*t,d=.46-.08*t;box('stoneD',0,.72+k*.56,0,w,.58,d,P('slate'),(k%2?.02:-.02));}
  box('stoneD',0,2.94,0,.56,.16,.44,sc);
  for(const [y,c] of [[1.32,P('white')],[2.38,P('ochre')]]){box('paint',0,y,0,.61,.075,.45,c);ring('cable',0,y+.09,0,.38,.018,P('cable'),0,0,0,10);}
  /* front (+z) lashed white Ancient-plate Truce Tablet and painted clan peace-ring */
  const motto=words==='NO BLADE'?'HOLD':words;
  W(0,1.62,.24,0,()=>{box('plate',0,0,0,.76,.56,.035,fgCol('plate',C));
   fgText(words==='NO BLADE'?'NO WAR':words,0,.3,.02,0,.1,P('red'));
   fgMark(C.v,0,.14,.02,0,.22,0xc8902e);
   for(const sx of [-.32,.32])fgSpike([sx,.22,.02],[sx*.3,.2,1],.14);});
  /* +x side: carved stone hospitality water/salt basin on a corbel bracket with a tin dipper hung on cord */
  box('stone',.42,.88,0,.44,.22,.42,col);sector('stoneD',.48,0,.12,.22,0,TAU,1.08,1.22,sc,10);
  cyl('plain',.48,1.14,0,.13,.03,hc(0x4c7484),8);
  cord('cord',[[.32,1.52,.14],[.54,1.02,.18]],.009,P('rope'));cyl('tin',.54,.92,.18,.048,.1,tc,7);
  /* -x side: iron peace-cord bar and hung coils for binding weapons at the Sanctuary line */
  beam('iron',[-.28,1.42,-.14],[-.48,1.42,-.14],.022,ic,true,4);beam('iron',[-.28,1.42,.14],[-.48,1.42,.14],.022,ic,true,4);
  pole('iron',[-.48,1.42,-.18],[-.48,1.42,.18],.02,ic,5);
  for(const z of [-.08,.08])ring('rope',-.48,1.32,z,.11,.026,P('rope'),0,0,PI/2,8);
  /* crown iron sanctuary cresset and salvage-plate hood holding glowing lantern lobelia */
  pole('iron',[0,3.08,0],[0,3.36,0],.03,ic,5);
  W(0,3.18,0,0,()=>{box('tin',0,0,0,.28,.22,.28,tc);fgSlab('plate',[-.24,.24,.24],[.24,.24,.24],[-.24,.24,-.24],.028,fgCol('plate',C));
   sph('glow',0,.1,0,.055,hc(0x7ab4ff),1.4,6);haloAt(0,.12,0,0x7ab4ff,false);});
  /* gate posts (even v) keep a low iron peat-fire hospitality brazier burning on the kerb */
  if(gate&&!C.worn){cyl('iron',-.52,.52,.52,.22,.24,ic,8);
   for(let k=0;k<3;k++){const a=k*TAU/3;pole('iron',[-.52+Math.cos(a)*.18,.26,.52+Math.sin(a)*.18],[-.52+Math.cos(a)*.15,.54,.52+Math.sin(a)*.15],.018,ic,4);}
   ellip('glow',-.52,.76,.52,.15,.05,.14,hc(0xff6820),0,5);haloAt(-.52,.86,.52,0xff8a30,false);}
  void pc;void motto;fgSet('trucePost',1);}});
