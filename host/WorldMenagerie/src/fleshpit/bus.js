// ---------- what the Flesh Pit's modules tell each other ----------
// The pit is built by a dozen extras that have to talk: the incident drives the heart, the lungs, the power and
// the evacuation; the organism, the anatomy, the trams and the crowd all react; the camera asks the cutaway to
// switch. They used to do it through fifteen loose ctx.pit* fields, each one set by whoever got there first.
// This is the one place they meet, with every field named and at rest:
//
//   signal     written by incident.js every frame; everyone else only reads it
//     power       the lights, 1 normal .. 0 black                    organism.js
//     ramKick     the rams' extra shudder                             organism.js
//     heart       {rate, amp, fib}: beat rate and strength, fibrillation   anatomy.js
//     nerve       how hard the ganglia fire, 1 normal                anatomy.js
//     lungFit     the lungs heaving, 0..1                             organism.js
//     evac        the evacuation, 0..1: trams stop, the crowd leaves  promenade.js, visitors.js
//     cageHalt    the lift cages stop where they are                  organism.js
//     seaChurn    the sea at the bottom churning, 0..1                organism.js
//     ferryWreck  the ferry going over, 0..1                          organism.js
//   parts      handles one module publishes for the others
//     labiod      {lips, r}: the labiod's lips (organism.js → incident.js)
//     fine        the fine-detail group, hidden in the section (organism.js → camera.js)
//     layers      the layer cards (organism.js)
//     anatomy     {heart, vessels, gangl} (anatomy.js)
//     setSection  on => the cutaway on or off (section.js → camera.js)
//
// ctx.pit itself stays what it was: organism.js's map of the pit (radius, walls, layers, cavities), which the
// others build on.

const resting=()=>({power:1,ramKick:0,heart:{rate:1,amp:1,fib:0},nerve:1,lungFit:0,evac:0,cageHalt:false,seaChurn:0,ferryWreck:0});

export function createPitBus(){
  const bus={signal:resting(),
    parts:{labiod:null,fine:null,layers:null,anatomy:null,setSection:null},
    // back to a quiet night: every signal at rest
    rest(){Object.assign(bus.signal,resting());}};
  return bus;
}
