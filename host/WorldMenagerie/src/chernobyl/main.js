// Chernobyl: entry point for chernobyl.html. The Chernobyl Exclusion Zone in northern Ukraine from OpenStreetMap on the
// shared engine, on its real ground: the power plant, Reactor 4 under the New Safe Confinement, units 5 and 6 left
// unfinished with their cooling towers, the cooling pond; Pripyat, the plant's city of 49,000, empty since 27 April 1986
// and grown over by the forest; the Red Forest; the Duga over-the-horizon radar in the woods to the south; and the old
// town of Chernobyl. The Soviet blocks take Sarajevo's concrete (src/sarajevo/blocks.js) and the Zone's dogs Sarajevo's
// street dogs (dogs.js); the ground, the forest and the decay are zone.js, the landmarks landmarks.js. Map data (c)
// OpenStreetMap contributors, ODbL.
import {report,LOAD,configureLoading,installErrorHandlers} from '../core/diag.js';
import {boot} from '../core/shell.js';
import {build} from '../engine/build.js';
import {landmarks} from './landmarks.js';
import {zone} from './zone.js';
import {blocks} from '../sarajevo/blocks.js';
import {dogs} from '../sarajevo/dogs.js';
import {events} from './events.js';
import {navmap} from '../core/navmap.js';
import {drawstats} from '../core/drawstats.js';
installErrorHandlers();window.LOAD=LOAD;
configureLoading({
  lines:[
    'At 1:23 on the morning of 26 April 1986, a safety test on Reactor 4 ended in two explosions that blew the reactor open.',
    'Pripyat was built in 1970 for the plant\'s workers. Its 49,000 people were told to pack for three days; they never came back.',
    'Some 1,200 buses took the city away in about three hours on the afternoon of 27 April.',
    'The amusement park was to open on 1 May 1986. Its Ferris wheel never turned for the public.',
    'The New Safe Confinement, 108 m high and 257 m across, was built beside the reactor and slid over it in November 2016.',
    'The pines west of the plant took so much radiation that they died and turned red: the Red Forest.',
    'With people gone, the Zone has wolves, elk, lynx, bison, and Przewalski\'s horses brought here in 1998.',
    'The Duga radar, 150 m high and half a kilometre long, listened for missiles over the pole; radio hams called it the Russian Woodpecker.',
  ],
  prefix:'entering the Zone… ',labels:{'map-data':'reading the Zone',ground:'growing the forest',buildings:'building Pripyat',details:'laying the roads',landmarks:'raising the arch',el:'',traffic:'',ui:'checking the dosimeter'}});
const ctx=window._iz={defaultCity:'chernobyl',models:[landmarks],extras:[{name:'zone',fn:zone},{name:'blocks',fn:blocks},{name:'dogs',fn:dogs},{name:'navmap',fn:navmap},{name:'events',fn:events},{name:'drawstats',fn:drawstats}]};
// with 'drawstats' in the address, every object is stamped with the stage that added it (src/core/drawstats.js)
if(/drawstats/.test(location.hash)&&window.THREE){const add=THREE.Object3D.prototype.add;THREE.Object3D.prototype.add=function(...o){for(const c of o)if(c&&c.userData&&!c.userData.stage)c.traverse(d=>{d.userData.stage=d.userData.stage||globalThis.__stage;});return add.apply(this,o);};}
// each extra timed: its build time in the details (extraMs), so a slow load says which stage it is
ctx.extras=ctx.extras.map(e=>({name:e.name,fn:api=>{const t0=performance.now();try{return e.fn(api);}finally{api.ctx.details=api.ctx.details||{};(api.ctx.details.extraMs=api.ctx.details.extraMs||{})[e.name]=Math.round(performance.now()-t0);}}}));
boot(()=>build(ctx));
