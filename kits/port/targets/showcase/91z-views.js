// Presets derived from the layout that was built (see portViewsShowcase in
// 70-port-core.js): an overview, each run, each junction and run end, the
// land-block rows and sea platforms, eye level on the quay, from the sea,
// from above, night, and 'Segment bounds' (the footprint overlay on).
// First = opening.
const VIEWS=portViewsShowcase();
// Straight at the fleet, from the vessels actually placed (PORT_VPLACED).
for(const v of PORT_VPLACED){const V=PORT_REG.vessel[v.key];if(!V)continue;
 const nm=portDName(v.d)+' '+V.name.toLowerCase();if(VIEWS[nm])continue;
 // bow +z at heading 0: look from off the starboard quarter, high enough to see the deck
 const az=v.heading+.95;VIEWS[nm]=portCam(v.x,Math.max(8,V.draft*.6),v.z,az,.3,V.length*.72+V.beam*1.4+60);}
// The reclaimed haven and marina from the land, low: where shacks once
// floated round the lighthouse (the salvage pass sampled its night beams).
{const h=PORT_LAYOUT.items.find(it=>it.key==='hbHaven'&&it.d===3);
 if(h)VIEWS['Reclaimed haven from the land']=[h.gx-60,PORT.DECK+14,h.gz-260,h.gx+20,PORT.DECK+10,h.gz+60];}
// The reclaimed drone carrier, close: the town on its flight deck.
{const c=PORT_VPLACED.find(v=>v.key==='slCarrier'&&v.d===3);
 if(c)VIEWS['Reclaimed drone carrier — flight deck']=portCam(c.x+10,22,c.z+40,c.heading+.7,.42,230);}
