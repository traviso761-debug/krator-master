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
