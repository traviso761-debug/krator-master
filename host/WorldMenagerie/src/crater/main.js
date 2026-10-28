// Crater Lake: entry point for crater.html. Crater Lake National Park, Oregon, from OpenStreetMap on the shared engine,
// on its real ground: the caldera Mount Mazama left when it erupted and fell in 7,700 years ago, the lake in it at
// 1883 m, 594 m deep, Wizard Island and the Phantom Ship, the rim from the Watchman round to Mount Scott, Rim Village
// and its lodge. The lake's boats and its surface are Atitlán's (src/atitlan/lake.js, waves.js), the far mountains
// Sarajevo's (src/sarajevo/backdrop.js); the ground and the winter are ground.js. Map data (c) OpenStreetMap
// contributors, ODbL.
import {report,LOAD,configureLoading,installErrorHandlers} from '../core/diag.js';
import {boot} from '../core/shell.js';
import {build} from '../engine/build.js';
import {landmarks} from './landmarks.js';
import {backdrop} from '../sarajevo/backdrop.js';
import {ground} from './ground.js';
import {lake} from '../atitlan/lake.js';
import {waves} from '../atitlan/waves.js';
import {oldman} from './oldman.js';
import {events} from './events.js';
import {navmap} from '../core/navmap.js';
import {traffic} from '../core/traffic.js';
import {crowds} from '../core/crowds.js';
import {drawstats} from '../core/drawstats.js';
installErrorHandlers();window.LOAD=LOAD;
configureLoading({
  lines:[
    'About 7,700 years ago Mount Mazama, a Cascade volcano some 3,700 m high, erupted and its summit fell into the emptied chamber.',
    'Crater Lake is 594 m deep: the deepest lake in the United States.',
    'No river runs in or out. The lake is rain and snow, held level by evaporation and seepage.',
    'The park takes some 13 m of snow in an average year.',
    'The Old Man of the Lake, a hemlock trunk floating upright, has drifted round the lake since at least 1896.',
    'Wizard Island is a cinder cone that grew out of the caldera floor after the collapse.',
    'The Klamath people saw the mountain fall, and tell of it as a battle between Llao of the world below and Skell of the world above.',
  ],
  prefix:'filling the caldera… ',labels:{'map-data':'reading the rim',ground:'raising the walls',buildings:'building Rim Village',details:'laying the Rim Drive',landmarks:'raising the lodge',el:'',traffic:'launching the boats',ui:'lighting the lodge'}});
const ctx=window._iz={defaultCity:'crater',models:[landmarks],extras:[{name:'backdrop',fn:backdrop},{name:'ground',fn:ground},{name:'lake',fn:lake},{name:'waves',fn:waves},{name:'oldman',fn:oldman},{name:'traffic',fn:traffic},{name:'crowds',fn:crowds},{name:'navmap',fn:navmap},{name:'events',fn:events},{name:'drawstats',fn:drawstats}]};
// with 'drawstats' in the address, every object is stamped with the stage that added it (src/core/drawstats.js)
if(/drawstats/.test(location.hash)&&window.THREE){const add=THREE.Object3D.prototype.add;THREE.Object3D.prototype.add=function(...o){for(const c of o)if(c&&c.userData&&!c.userData.stage)c.traverse(d=>{d.userData.stage=d.userData.stage||globalThis.__stage;});return add.apply(this,o);};}
// each extra timed: its build time in the details (extraMs), so a slow load says which stage it is
ctx.extras=ctx.extras.map(e=>({name:e.name,fn:api=>{const t0=performance.now();try{return e.fn(api);}finally{api.ctx.details=api.ctx.details||{};(api.ctx.details.extraMs=api.ctx.details.extraMs||{})[e.name]=Math.round(performance.now()-t0);}}}));
boot(()=>build(ctx));
