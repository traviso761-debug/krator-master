// ================================================================= HOST — build: the records registered, the bake (no flora)
// Every work drawn is registered (REGISTER: the inspector's volume and a core/tags record): the gallery's window, each track's runs by state, the
// crossover, the niches, the lamps (the code's), the vein and its working, the trains and the standing vehicles. The rock behind the lining is
// warm (55 degC) but the kept gallery's air is not a hazard here; nothing grows, so BIO bakes nothing.
(function(){const t0=performance.now(),W=LINE.WIN,S0=SITE.s0;
 REGISTER({name:'The Rift line, bore km '+(S0/1000).toFixed(1)+' to '+((S0+W.walk1)/1000).toFixed(1)+': the four-track gallery (kept)',key:'line.window',x:0,z:(W.walk0+W.walk1)/2,y:0,r:(W.walk1-W.walk0)/2,h:SEC.crown,
  tags:{line:{kind:'gallery',s0:S0+W.walk0,s1:S0+W.walk1,w:SEC.x1-SEC.x0,h:SEC.crown,lining:'intact',rock:SITE.rock,rockT:SITE.rockT}}});
 SEC.tracks.forEach(T=>LINE.cond[T.id].forEach((c,i)=>{const za=Math.max(W.walk0,c.s0-S0),zb=Math.min(W.walk1,c.s1-S0);if(zb<=za)return;
  REGISTER({name:'Guideway '+T.id.toUpperCase()+' ('+c.state+'): bore m '+Math.round(c.s0)+' to '+Math.round(c.s1),key:'line.track.'+T.id+'.'+i,x:T.x,z:(za+zb)/2,y:0,r:(zb-za)/2,h:1,
   tags:{line:{kind:'track',track:T.id,state:c.state,s0:c.s0,s1:c.s1}}});}));
 const X=LINE.crossover;REGISTER({name:'A crossover, '+X.a.toUpperCase()+' to '+X.b.toUpperCase()+' (flexing beams, kept)',key:X.id,x:0,z:(X.z0+X.z1)/2,y:0,r:(X.z1-X.z0)/2,h:1.5,tags:{line:{kind:'crossover',a:X.a,b:X.b,state:X.state}}});
 LINE.niches.forEach(N=>REGISTER({name:'A refuge niche (enamel plate '+Math.round((S0+N.z)/10)+')',key:N.id,x:SEC.x1+.9,z:N.z,y:N.y,r:1,h:N.h,tags:{line:{kind:'niche'}}}));
 LINE.lamps.forEach(l=>REGISTER({name:'A lamp of the code: green (the Line, a kept track)',key:l.id,x:l.x,z:l.z,y:l.y-.3,r:.4,h:.6,tags:{line:{kind:'lamp',code:l.kind}}}));
 const V=LINE.vein;REGISTER({name:'The Fixers\' vein working: rare earths and copper in the rift fill (KRES nodes; PLAN.md 2.1)',key:V.id,x:(V.pts[0][0]+V.pts[2][0])/2,z:V.z+3,y:V.pts[0][1],r:15,h:V.h,
  tags:{line:{kind:'vein',family:V.family,with:V.with,grade:V.grade,state:V.state}}});
 LINE.trains.forEach(T=>REGISTER({name:'A kept train ('+T.cars.length+' cars) on '+T.track.toUpperCase()+': the long run\'s timetable',key:T.id,x:SEC.tracks.find(t=>t.id===T.track).x,z:600,y:0,r:T.len/2,h:5,
  tags:{line:{kind:'train',track:T.track,cars:T.cars.map(c=>c.key)}}}));
 LINE.work.concat(LINE.derelict).forEach(w=>REGISTER({name:w.key+(w.state?' ('+w.state+')':''),key:w.id,x:w.x!=null?w.x:SEC.tracks.find(t=>t.id===w.track).x,z:w.z,y:0,r:7,h:4,tags:{line:{kind:'vehicle',key:w.key,state:w.state||'kept'}}}));
 window._registered=REG.length;
 /* no flora: BIO bakes nothing. The pieces this page places are merged, not instanced (the lamps, the crown's fittings, the niches, the cars and
    the standing vehicles): their count is what the probe's "instances" reads */
 const b=BIO.bake();window._instances=b.inst+LINE.lamps.length+LINE.crown.length+LINE.niches.length+TRAINS.cars.length+(TRAINS.standing||[]).length;window._bakeCalls=b.calls;
 window._buildMs=Math.round(performance.now()-t0);})();
