// prefix: cy
// ================================================================= STONES AND MARKERS: the contour script standing on the road
// A milestone carries its record's text (o.text: the place it points to and the distance, in Hum) carved as the contour line
// (32-cy-contour.js) on both broad faces, the same line front and back; the record keeps the text and the line's hash so a
// host, the export and verify.py read what the stone says (contour-text).
//   cy_milestone     a dressed slab on a stone foot under a cap stone (C1; boundary stones, cairns and shun stones are C7)
const CY_MILE_TEXT='Lōk-Hau Kē. Hau-Gèl.';
defBuilding({key:'cy_milestone',name:'Milestone (contour-carved)',seed:9301,cls:'landmark',kind:'milestone',frag:'kits/coyote',
 tags:{types:['infrastructure'],style:'tier',role:'milestone'},w:1.2,d:.9,h:2.0,budget:12000,
 note:'a dressed slab carved with the Hum as a contour line on both faces; the text is the record\'s (o.text)',
 build(o){const text=o.text==null?CY_MILE_TEXT:o.text,C=cyContour(text),W0=.56,H0=1.45,T0=.2;
  box('stone',0,0,0,1.0,.22,.7,P('stone'));
  box('slab',0,.22,0,W0,H0,T0,P('stone'));
  box('slab',0,.22+H0,0,W0+.1,.12,T0+.08,P('stone'));
  let segs=0;
  for(const s of [1,-1])W(0,0,0,s>0?0:PI,()=>{segs+=cyCarve(C,0,.42,T0/2,W0-.1,1.1,{lw:.02,wrap:true});});
  if(CURREC)CURREC.carving={text:C.text,hash:C.hash,segs};}});
//   cy_boundary_stone  a rough slab set on a colonies' seam (PLAN.md section 1: the boundary stones stand on the seams), leaning
//                      a little, carved with one name on each face (o.a toward +z, o.b toward -z: the two sides it divides)
//   cy_runner_shrine   the trickster's shrine at a road's foot (biomes/tiers/PLAN.md section 6): a low walled court open to the
//                      road, the stele with the runner bird in relief and the god's name carved under it, a feather post (a
//                      runner-bird feather may be shown: the owner, 2026-11-16), an offering bench with bowls
const CY_BOUND_A='Hām-Hau.',CY_BOUND_B='Kām-Hau.';
defBuilding({key:'cy_boundary_stone',name:'Boundary stone (two names, one a face)',seed:9302,cls:'landmark',kind:'boundary',frag:'kits/coyote',
 tags:{types:['infrastructure'],style:'valley',role:'boundary'},w:1.0,d:.8,h:1.7,budget:10000,
 note:'a rough slab on a seam, carved with the name of the side each face looks over (o.a, o.b)',
 build(o){const a=o.a==null?CY_BOUND_A:o.a,b=o.b==null?CY_BOUND_B:o.b,Ca=cyContour(a),Cb=cyContour(b),lean=rr(-.06,.06);
  W(0,0,0,0,()=>{box('stone',0,0,0,.9,.18,.6,P('stone'));
   WX(0,.12,0,0,lean,rr(-.03,.03),()=>{box('slab',0,0,0,.5,1.4,.18,P('stone'));box('slab',.03,1.4,0,.38,.12,.16,P('stone'));
    let n=cyCarve(Ca,0,.35,.09,.38,.9,{lw:.018,wrap:true});
    W(0,0,0,PI,()=>{n+=cyCarve(Cb,0,.35,.09,.38,.9,{lw:.018,wrap:true});});
    if(CURREC)CURREC.carving={text:Ca.text,hash:Ca.hash,segs:n,other:{text:Cb.text,hash:Cb.hash}};});});}});
/* the god's own Hum name is the owner's to give (PLAN.md section 12): until then the shrine carves the tribe's name; a host passes o.text */
const CY_RUNNER_TEXT=CY_TRIBES.valley.hum+'.';
defBuilding({key:'cy_runner_shrine',name:'Runner bird shrine (at a road foot)',seed:9303,cls:'building',kind:'shrine',frag:'kits/coyote',
 tags:{types:['religious'],wealth:'poor',style:'valley',role:'shrine'},w:4.6,d:4.6,h:2.6,budget:20000,front:{x:0,z:2.3,yaw:0},
 note:'the trickster\'s shrine where a road starts to climb: a waist-high walled court open to the road, the stele with the runner bird in relief, a feather post, an offering bench',
 build(o){const t=.3,x0=-2.0,x1=2.0,z0=-2.0,z1=2.0;
  cyRing(x0,z0,x1,z1,0,.95,{t,socle:.3,holes:{s:[{at:2.0,w:1.4,y:0,h:.95}]}});box('floor',0,0,0,3.7,.04,3.7,P('floor'));
  /* the stele against the back wall: the bird in relief (a dark slab behind a painted-on profile), the god's name under it */
  box('slab',0,0,-1.55,1.0,2.3,.26,P('stone'));box('slab',0,2.3,-1.55,1.12,.12,.32,P('stone'));
  W(0,0,-1.42,0,()=>{cyBird(0,1.62,0,.85,P('carve'));});
  const C=cyContour(o.text==null?CY_RUNNER_TEXT:o.text);
  if(CURREC)CURREC.carving={text:C.text,hash:C.hash,segs:cyCarve(C,0,.5,-1.42,.78,.5,{lw:.02})};
  /* the feather post: a pole, a crossbar, long barred feathers hung from it */
  pole('timber',[1.3,0,-1.2],[1.3,2.2,-1.2],.04,P('timber'),6);pole('timber',[1.05,2.05,-1.2],[1.55,2.05,-1.2],.025,P('timber'),5);
  for(let i=0;i<3;i++){const x=1.1+i*.2;box('plain',x,1.62,-1.2,.05,.42,.008,new THREE.Color(.42,.36,.3));box('plain',x,1.7,-1.19,.05,.03,.008,new THREE.Color(.9,.88,.82));}
  cyPlatform(-1.6,-1.0,-.7,-.4,.45);for(let i=0;i<2;i++)cyl('render',-1.38+i*.45,.45,-.7,.13,.07,P('ochre'),10);}});
//   cy_phoenix_altar   the golden bird's cliff-ledge altar (PLAN.md sections 1, 3, 12): an ash altar under a sun pillar on a
//                      stone ledge where the golden bird is fed; NEVER a golden feather (killing one or carrying its feathers is
//                      taboo, verify.py no-golden-feathers)
//   cy_cairn           a pass and road cairn of stacked dry-stone slabs, a carved pointer stone and a juniper way-pole
//   cy_shun_stone      the keep-out ring's turned-away stone round Trickster's House (Outlands 6): canted, notched head, its
//                      carved warning turned away from the road
//   cy_carved_band     a dressed riser frieze block (o.w) carrying the contour script, laid along a scarp or podium by a host
const CY_PHOENIX_TEXT='Yūt-Lōk. Hau-Kām.';
defBuilding({key:'cy_phoenix_altar',name:'Phoenix altar (ash altar and sun pillar on a ledge)',seed:9304,cls:'building',kind:'shrine',frag:'kits/coyote',
 tags:{types:['religious'],wealth:'poor',style:'tier',role:'shrine'},w:6.4,d:6.0,h:4.8,budget:26000,front:{x:0,z:3.0,yaw:0},
 note:'the golden bird shrine: a dressed cliff ledge reached by steps, the ringed ash altar in its middle, the sun pillar with its bronze sun ring behind, and the feeding slab at the open lip (grain and meat bowls only, never a golden feather)',
 build(o){o=o||{};const L=.8;
  svNoWalk(()=>{box('rock',0,0,-.2,5.8,L-.12,5.0,P('rock'));box('slab',0,L-.12,-.2,5.6,.12,4.8,P('stone'));});
  wkPad(0,-.2,5.6,4.8,L);
  svStair(0,3.0,0,L,PI,{style:'solid',w:1.4,run:.8,mk:'stone',col:P('stone')});
  /* low kerb along the west, north and north-east; south-east lip left open for the feeding slab where the bird alights */
  cyWall(-2.65,-2.45,-2.65,2.05,L,.55,{mk:'stone',socle:0,inner:0,t:.28});
  cyWall(-2.65,-2.45,2.65,-2.45,L,.55,{mk:'stone',socle:0,inner:0,t:.28});
  cyWall(2.65,-2.45,2.65,-.1,L,.55,{mk:'stone',socle:0,inner:0,t:.28});
  /* the feeding slab at the cliff lip: bowls of grain and meat, no feathers */
  svNoWalk(()=>{box('slab',1.75,L,1.25,1.45,.24,1.1,P('stone'));
   for(let i=0;i<2;i++)cyl('render',1.45+i*.55,L+.24,1.25,.16,.09,P('ochre'),10);});
  /* the ringed ash altar */
  svNoWalk(()=>{cyl('stone',0,L,-.15,.82,.68,P('stone'),18);cyl('slab',0,L+.62,-.15,.88,.1,P('stone'),18);
   cyl('ash',0,L+.72,-.15,.68,.12,P('ash'),16);
   for(let i=0;i<4;i++)sph('glow',rr(-.22,.22),L+.84,-.15+rr(-.22,.22),.055,new THREE.Color(1,.46,.12),.55,6);});
  smokeAt(0,L+1.05,-.15,{r:.22,kind:'fire'});
  /* the sun pillar and its bronze sun ring */
  box('stone',0,L,-1.75,1.1,.28,.76,P('stone'));
  box('slab',0,L+.28,-1.75,.72,2.75,.42,P('stone'));
  box('slab',0,L+3.03,-1.75,.9,.16,.54,P('stone'));
  svNoWalk(()=>{pole('bronze',[0,L+3.19,-1.75],[0,L+3.45,-1.75],.045,P('bronze'),8);
   ring('bronze',0,L+3.72,-1.75,.32,.045,P('bronze'),0,PI/2,0,18);
   cyl('bronze',0,L+3.64,-1.75,.11,.16,P('bronze'),12);});
  const C=cyContour(o.text==null?CY_PHOENIX_TEXT:o.text);
  if(CURREC)CURREC.carving={text:C.text,hash:C.hash,segs:cyCarve(C,0,L+.75,-1.54,.54,1.85,{lw:.022,wrap:true})};
  cyTarget(-1.35,L+.06,.75,'the altar ledge');}});
const CY_CAIRN_TEXT='Gèl-Lōk. Hau.';
defBuilding({key:'cy_cairn',name:'Road cairn (stacked dry stone and pointer)',seed:9305,cls:'landmark',kind:'cairn',frag:'kits/coyote',
 tags:{types:['infrastructure'],style:'peak',role:'cairn'},w:2.2,d:2.2,h:2.5,budget:12000,
 note:'a dry-stone cairn at a pass or ford: tapered schist and tuff courses, a carved pointer slab at its head and a juniper way-pole',
 build(o){o=o||{};const C=cyContour(o.text==null?CY_CAIRN_TEXT:o.text);
  const tiers=[[.96,.26],[.82,.24],[.68,.22],[.55,.2],[.42,.18]];let y=0;
  for(const [r,h] of tiers){cyl('stone',rr(-.03,.03),y,rr(-.03,.03),r,h,P('stone'),9,r*.92);y+=h*.92;}
  box('slab',0,y,0,.44,.92,.16,P('stone'));box('slab',0,y+.92,0,.52,.1,.2,P('stone'));
  const segs=cyCarve(C,0,y+.12,.08,.34,.68,{lw:.018,wrap:true});
  pole('timber',[.36,.35,-.18],[.52,2.38,-.24],.035,P('timber'),6);
  box('reed',.46,2.08,-.22,.28,.12,.02,P('reed'));
  if(CURREC)CURREC.carving={text:C.text,hash:C.hash,segs};}});
const CY_SHUN_TEXT='Tsēk! Sām-Hau!';
defBuilding({key:'cy_shun_stone',name:'Shun stone (turned-away keep-out marker)',seed:9306,cls:'landmark',kind:'shun_stone',frag:'kits/coyote',
 tags:{types:['infrastructure','religious'],style:'valley',role:'shun'},w:1.4,d:1.2,h:2.4,budget:12000,
 note:'one of the keep-out ring stones round Trickster House: a canted slab with a cleft head and red warning bands, its carved face turned away from the approach',
 build(o){o=o||{};const C=cyContour(o.text==null?CY_SHUN_TEXT:o.text);
  box('stone',0,0,0,1.15,.22,.9,P('stone'));
  for(let i=0;i<4;i++){const a=i/4*TAU+.4;box('rock',Math.cos(a)*.42,0,Math.sin(a)*.34,.28,.18,.24,P('rock'),a);}
  WX(0,.18,0,0,-.09,.04,()=>{
   box('slab',0,0,0,.64,1.62,.22,P('carve'));
   /* cleft head: two horns of dark stone with a notch between, and two red ochre warning bands */
   for(const s of [-1,1])box('slab',s*.19,1.62,0,.24,.34,.2,P('carve'));
   for(const yy of [.34,1.38])box('plain',0,yy,0,.66,.07,.235,P('red'));
   /* the carving and the bird mark stand on the -z face, turned away from the viewer at +z */
   let segs=0;
   W(0,0,0,PI,()=>{cyBird(0,1.15,.11,.42,P('ochre'));segs=cyCarve(C,0,.46,.11,.48,.52,{lw:.02,wrap:true});});
   if(CURREC)CURREC.carving={text:C.text,hash:C.hash,segs};});}});
const CY_BAND_TEXT='Lōk-Hau Hām-Gèl. Kām-Tōng.';
defBuilding({key:'cy_carved_band',name:'Carved riser band (scarp frieze)',seed:9307,cls:'landmark',kind:'carving',frag:'kits/coyote',
 tags:{types:['infrastructure'],style:'tier',role:'carving'},w:6.0,d:.6,h:1.2,budget:14000,
 note:'a dressed frieze band carved with the Hum contour script (o.w, o.text), for laying along a canyon scarp, terrace riser or fort podium',
 build(o){o=o||{};const w=o.w==null?6.0:o.w,C=cyContour(o.text==null?CY_BAND_TEXT:o.text);
  box('stone',0,0,-.04,w,1.12,.38,P('stone'));
  box('slab',0,0,.02,w,.14,.44,P('stone'));
  box('slab',0,.98,.02,w,.14,.44,P('stone'));
  box('slab',0,.14,.01,w,.84,.38,P('stone'));
  const segs=cyCarve(C,0,.24,.2,w-.5,.62,{lw:.032});
  if(CURREC)CURREC.carving={text:C.text,hash:C.hash,segs};}});
