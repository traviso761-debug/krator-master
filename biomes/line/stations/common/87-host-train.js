// ================================================================= HOST — the trains: running on their timelines, standing, and the vehicles that stand
// kits/motor-vehicles (the Line cars and the Tungangs' stock, bundled as ['ancient', 'line', 'tungang']; PLAN.md section 7). LINE.trains move on their
// KSCHED timelines by the riding hook's car pose (LK.carPose; PLAN.md section 8), lamps lit; LINE.standingTrains are consists placed at an s on a
// route (a train at a platform, a derelict in a siding: each car may carry its own state); LINE.standing are single vehicles placed by hand. The
// clock: the page's seconds, or a fixed time a view sets (TRAINS.at(t)); ?t= starts it there.
const TRAINS=(function(){const KV=window.KratorVehicles,out={cars:[],tris:0,fixed:null,t0:Q.has('t')?+Q.get('t'):0,start:performance.now(),standing:[]};
 if(!KV){reportErr('KratorVehicles missing: the vehicles bundle is not on the page');return out;}
 const place=(g,p)=>{g.position.set(p.x,p.y,p.z);g.rotation.set(0,p.yaw,0);};
 const build=(c,T,extra)=>{const g=KV.build(c.key,{variant:c.variant,seed:c.seed,state:c.state||'intact'});if(!g)return null;if(!c.state||c.state==='intact')KV.lights(g,true);
  g.userData.inspectLabel=(extra||'')+T.id+' car '+(c.k+1)+': '+g.userData.name+(c.variant===1?' (kept by the Tungangs)':'')+(c.state&&c.state!=='intact'?' ('+c.state+')':'');
  g.userData.train=T.id;g.userData.car=c.k;g.traverse(m=>{if(m.isMesh){m.castShadow=false;m.userData.trainCar=true;}});scene.add(g);out.tris+=g.userData.tris||0;return g;};
 (LINE.trains||[]).forEach(T=>T.cars.forEach(c=>{const g=build(c,T);if(g)out.cars.push({T,c,g});}));
 (LINE.standingTrains||[]).forEach(T=>T.cars.forEach(c=>{const g=build(c,T,T.label?T.label+': ':'');if(!g)return;place(g,LK.carPose(T,c.k,0));out.standing.push(g);}));
 (LINE.standing||[]).forEach(w=>{const g=KV.build(w.key,{variant:w.variant==null?0:w.variant,seed:w.seed==null?1:w.seed,state:w.state||'intact'});if(!g)return;g.position.set(w.x,w.y,w.z);g.rotation.y=w.yaw||0;
  if(!w.state||w.state==='intact')KV.lights(g,true);g.userData.inspectLabel=(w.label||w.key)+': '+g.userData.name;scene.add(g);out.standing.push(g);out.tris+=g.userData.tris||0;});
 out.time=()=>out.fixed!=null?out.fixed:out.t0+(performance.now()-out.start)/1000;
 out.update=t=>{out.cars.forEach(o=>{const p=LK.carPose(o.T,o.c.k,t);place(o.g,p);o.g.visible=p.z>LINE.WIN.z0-30&&p.z<LINE.WIN.z1+30;});};
 out.at=t=>{out.fixed=t;out.update(t);};
 /* the time at which train T's A end stands at z on its run segment (for a view that wants the train in it) */
 out.when=(T,z)=>{const ex=T.timeline.export(),s=ex.segments[0],u=(z-s.from)/(s.to-s.from),t=u*s.dur-(ex.phase||0);return t<0?t+T.timeline.period:t;};
 tick(function trains(){out.update(out.time());});
 out.update(out.time());
 return out;})();
window._trains={cars:TRAINS.cars.length,standing:TRAINS.standing.length,tris:TRAINS.tris};
