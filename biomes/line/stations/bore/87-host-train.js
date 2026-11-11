// ================================================================= HOST — the trains: the kept trains passing, the work train, a derelict van
// kits/motor-vehicles (the Line cars and the Tungangs' stock, bundled as ['ancient', 'line', 'tungang']; PLAN.md section 7). The two kept
// trains (LINE.trains: eight cars each, the Tungangs' livery) move on their KSCHED timelines by the riding hook's car pose (LINE.carPose, PLAN.md
// section 8), their lamps lit. The clock: the page's seconds, or a fixed time a view sets (TRAINS.at(t)); ?t= starts it there. The work train on
// T1 at the vein (the Fixers' trolley and a flat of spoil) and a derelict Ancient service van on the road stand still.
const TRAINS=(function(){const KV=window.KratorVehicles,out={cars:[],tris:0,fixed:null,t0:Q.has('t')?+Q.get('t'):0,start:performance.now()};
 if(!KV){reportErr('KratorVehicles missing: the vehicles bundle is not on the page');return out;}
 const place=(g,p)=>{g.position.set(p.x,p.y,p.z);g.rotation.set(0,p.yaw,0);};
 LINE.trains.forEach(T=>T.cars.forEach(c=>{const g=KV.build(c.key,{variant:c.variant,seed:c.seed});if(!g)return;KV.lights(g,true);
  g.userData.inspectLabel=T.id+' car '+(c.k+1)+': '+g.userData.name+' (kept by the Tungangs)';g.userData.train=T.id;g.userData.car=c.k;
  g.traverse(m=>{if(m.isMesh){m.castShadow=false;m.userData.trainCar=true;}});scene.add(g);out.cars.push({T,c,g});out.tris+=g.userData.tris||0;}));
 /* the work train and the derelict, standing */
 const SB=[];
 LINE.work.forEach(w=>{const g=KV.build(w.key,{variant:w.variant,seed:w.seed});if(!g)return;const x=SEC.tracks.find(t=>t.id===w.track).x;
  g.position.set(x,SEC.guide.h,w.z);g.rotation.y=w.yaw;KV.lights(g,true);g.userData.inspectLabel='The Fixers\' work train at the vein: '+g.userData.name;scene.add(g);SB.push(g);out.tris+=g.userData.tris||0;});
 LINE.derelict.forEach(d=>{const g=KV.build(d.key,{variant:d.variant,seed:d.seed,state:d.state});if(!g)return;g.position.set(d.x,SEC.road.y,d.z);g.rotation.y=d.yaw;
  g.userData.inspectLabel='A derelict Ancient service van on the access road ('+d.state+')';scene.add(g);SB.push(g);out.tris+=g.userData.tris||0;});
 out.standing=SB;
 out.time=()=>out.fixed!=null?out.fixed:out.t0+(performance.now()-out.start)/1000;
 out.update=t=>{out.cars.forEach(o=>{const p=LINE.carPose(o.T,o.c.k,t);place(o.g,p);o.g.visible=p.z>LINE.WIN.z0-30&&p.z<LINE.WIN.z1+30;});};
 out.at=t=>{out.fixed=t;out.update(t);};
 /* the time at which train T's A end stands at z (on its run segment): for a view that wants the train in it */
 out.when=(T,z)=>{const tl=T.timeline,ex=tl.export(),s=ex.segments[0],u=(z-s.from)/(s.to-s.from);return u*s.dur-(ex.phase||0)+(u*s.dur-(ex.phase||0)<0?tl.period:0);};
 tick(function trains(){out.update(out.time());});
 out.update(out.time());
 return out;})();
window._trains={cars:TRAINS.cars.length,standing:(TRAINS.standing||[]).length,tris:TRAINS.tris};
