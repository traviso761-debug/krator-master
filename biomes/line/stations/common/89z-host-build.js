// ================================================================= HOST — build: the records registered, the hazards, the bake (no flora)
// Every work drawn is registered (REGISTER: the inspector's volume and a core/tags record): the window, each track's runs by state, the crossovers,
// the openings, the lamps (the code's), the trains and the standing vehicles, and the window's own (LINE.records()). The window's hazards
// (LINE.hazards(): core/hazard records, tags.hazard) are recorded in core/tags before anything reads them. Nothing grows, so BIO bakes nothing.
(function(){const t0=performance.now(),W=LINE.WIN,S0=SITE.s0;
 REGISTER({name:'The Rift line, bore km '+((S0+W.walk0)/1000).toFixed(1)+' to '+((S0+W.walk1)/1000).toFixed(1)+': '+(STATION.name)+' ('+(STATION.state||'kept')+')',key:'line.window',x:0,z:(W.walk0+W.walk1)/2,y:0,r:(W.walk1-W.walk0)/2,h:SEC.crown,
  tags:{line:{kind:'window',station:STATION.key,state:STATION.state||'kept',s0:S0+W.walk0,s1:S0+W.walk1,rock:SITE.rock,rockT:SITE.rockT}}});
 SEC.tracks.forEach(T=>(LINE.cond[T.id]||[]).forEach((c,i)=>{const za=Math.max(W.walk0,c.s0-S0),zb=Math.min(W.walk1,c.s1-S0);if(zb<=za)return;const x=LINE.trackX(T.id,(za+zb)/2);
  REGISTER({name:'Guideway '+T.id.toUpperCase()+' ('+c.state+'): bore m '+Math.round(c.s0)+' to '+Math.round(c.s1),key:'line.track.'+T.id+'.'+i,x,z:(za+zb)/2,y:0,r:(zb-za)/2,h:1,
   tags:{line:{kind:'track',track:T.id,state:c.state,s0:c.s0,s1:c.s1}}});}));
 (LINE.crossovers||[]).forEach(X=>REGISTER({name:'A crossover, '+X.a.toUpperCase()+' to '+X.b.toUpperCase()+' (flexing beams, '+X.state+')',key:X.id,x:(LINE.trackX(X.a,X.z0)+LINE.trackX(X.b,X.z1))/2,z:(X.z0+X.z1)/2,y:0,r:(X.z1-X.z0)/2,h:1.5,tags:{line:{kind:'crossover',a:X.a,b:X.b,state:X.state}}}));
 (LINE.openings||[]).forEach(O=>{const S=LINE.sectionAt((O.z0+O.z1)/2)||SEC;REGISTER({name:O.name||(O.kind==='niche'?'A refuge niche (enamel plate '+Math.round((S0+(O.z0+O.z1)/2)/10)+')':'An opening: '+O.kind),key:O.id,
  x:O.wall==='e'?S.x1+.9:S.x0-.9,z:(O.z0+O.z1)/2,y:O.y0,r:Math.max(1,(O.z1-O.z0)/2),h:O.y1-O.y0,tags:{line:{kind:O.kind}}});});
 LINE.lamps.forEach(l=>REGISTER({name:'A lamp of the code: '+l.kind+(l.kind==='green'?' (the Line)':l.kind==='white'?' (danger, hooded)':l.kind==='amber'?' (work)':'')+(l.on===false?', dead':''),key:l.id,x:l.x,z:l.z,y:l.y-.3,r:.4,h:.6,tags:{line:{kind:'lamp',code:l.kind,on:l.on!==false}}}));
 (LINE.trains||[]).concat(LINE.standingTrains||[]).forEach(T=>REGISTER({name:(T.label||'A kept train')+' ('+T.cars.length+' cars) on '+T.track.toUpperCase()+(T.timeline?': its timetable':': standing'),key:T.id,
  x:LINE.trackX(T.track,T.s!=null?T.s-T.len/2:(W.walk0+W.walk1)/2),z:T.s!=null?T.s-T.len/2:(W.walk0+W.walk1)/2,y:0,r:T.len/2,h:5,tags:{line:{kind:'train',track:T.track,cars:T.cars.map(c=>c.key)}}}));
 (LINE.standing||[]).forEach(w=>REGISTER({name:(w.label||w.key)+(w.state?' ('+w.state+')':''),key:w.id,x:w.x,z:w.z,y:w.y-.5,r:7,h:5,tags:{line:{kind:'vehicle',key:w.key,state:w.state||'kept'}}}));
 (LINE.records?LINE.records():[]).forEach(r=>REGISTER(r));
 (LINE.hazards?LINE.hazards():[]).forEach(h=>BIO.record(h));
 window._registered=REG.length;
 /* no flora: BIO bakes nothing. The pieces this page places are merged, not instanced (the lamps, the crown's fittings, the openings, the cars, the
    standing vehicles): their count is what the probe's "instances" reads */
 const b=BIO.bake();window._instances=b.inst+LINE.lamps.length+(LINE.crown||[]).length+(LINE.openings||[]).length+TRAINS.cars.length+TRAINS.standing.length;window._bakeCalls=b.calls;
 window._buildMs=Math.round(performance.now()-t0);})();
