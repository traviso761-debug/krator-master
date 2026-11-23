// ================================================================= CORE — simulation ride: travellers choose the train
// [G data] core/simulation/PLAN-RIDING.md section 8c. Opt-in (listed after 78-sim-ride.js): the resolver's own walk is
// unchanged on a page that does not list this. It wraps SIM.plan (77-sim-3-actors.js), the leg-maker SIM.decide calls
// once it has chosen a place: for an actor whose role or own record says `ride: true`, when the walk there is
// impossible (no path: the Line's segments are joined only by the trains and the gap walks) or slower than a journey by
// train by more than `saving` seconds, the task becomes that journey (SIM.rideBake: walk, wait, board inside the door
// window, ride, alight, walk on, the gap walked, ride again, walk to the place's spot). The actor is carried (`driven`)
// until it arrives, then takes up what it decided (its `wanted` kept, so it does not decide again on the spot).
// A trip under `minDist` metres is always walked; carts (a.cart) and actors driven by anything else are left alone.
//
//   SIM.RIDE.choose = {minDist:400, saving:60}       the rule's numbers
//   SIM.rideChosen -> {asked, rode, walked, none}     the tally (an audit)
(function(root){
  'use strict';
  var SIM = root.SIM;
  if(!SIM || !SIM.rideBake) throw new Error('core/simulation/ride/81: load 78-sim-ride.js first');
  SIM.RIDE.choose = SIM.RIDE.choose || { minDist:400, saving:60 };
  SIM.rideChosen = { asked:0, rode:0, walked:0, none:0 };
  var basePlan=SIM.plan;
  SIM.plan = function(a, P, act, from, t){
    var T=basePlan(a, P, act, from, t), R=SIM.R.role[a.role];
    if(!(a.ride || (R && R.ride)) || a.cart || (a.driven && a.driven!=='ride') || !SIM.RIDE.order.length) return T;
    var C=SIM.RIDE.choose, sp=T.spot, d=Math.hypot(sp.x-from.x, sp.z-from.z);
    if(d<C.minDist) return T;
    SIM.rideChosen.asked++;
    var layer=a.layer||(R && R.layer)||'pedestrian', speed=a.speed||SIM.SPEED.walk, to={ x:sp.x, y:sp.y==null ? 0 : sp.y, z:sp.z };
    var plan=SIM.journeyPlan({ x:from.x, y:from.y==null ? 0 : from.y, z:from.z }, to, t, { layer:layer, speed:speed });
    if(!plan || !plan.rides){ if(T.failed) SIM.rideChosen.none++; else SIM.rideChosen.walked++; return T; }
    if(!T.failed && plan.arrive>=T.arrive-C.saving){ SIM.rideChosen.walked++; return T; }
    var J=SIM.rideBake(a, { from:from, to:to, t:t, act:act, speed:speed, layer:layer, plan:plan });
    if(!J){ SIM.rideChosen.none++; return T; }
    J.place=P.id; J.indoor=T.indoor; J.wander=T.wander; J.vehFrom=null; J.veh=null; J.ride.resolver=true;
    a.driven='ride'; a.inVehicle=null; SIM.RIDE.riders[a.id]=true; SIM.rideChosen.rode++;
    return J;
  };
})(typeof window!=='undefined'?window:globalThis);
