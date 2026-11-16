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
