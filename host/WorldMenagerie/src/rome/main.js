// Rome: entry point for rome.html. The historic centre from OpenStreetMap on the shared engine, with its real
// hills, and the buildings that are shapes rather than heights - the Colosseum, the Pantheon, St Peter's, the domes,
// the obelisks - modelled in landmarks.js. Map data (c) OpenStreetMap contributors, ODbL.
import {report,LOAD,configureLoading,installErrorHandlers} from '../core/diag.js';
import {boot} from '../core/shell.js';
import {build} from '../engine/build.js';
import {landmarks} from './landmarks.js';
import {dress} from '../core/dress.js';
import {life} from './life.js';
import {palazzi} from '../core/palazzi.js';
import {navmap} from '../core/navmap.js';
import {traffic} from '../core/traffic.js';
import {crowds} from '../core/crowds.js';
import {drawstats} from '../core/drawstats.js';
import {events} from './events.js';
import {photo} from './photo.js';
import {courts} from '../core/courts.js';
import {streetlife} from '../core/streetlife.js';
installErrorHandlers();window.LOAD=LOAD;
configureLoading({
  lines:[
    'The Pantheon\'s dome is unreinforced concrete, forty-three metres across, and nineteen centuries old. Nothing bigger of its kind has been built since.',
    'The Colosseum was finished in AD 80. Half its outer ring came down in an earthquake in 1349 and went into the city\'s palaces.',
    'There are thirteen ancient obelisks in Rome: more than are left standing in Egypt.',
    'Bernini\'s colonnade is four columns deep. From two points in the square, each row hides the three behind it.',
    'St Peter\'s dome is taller than the Pantheon\'s is wide, three times over.',
    'The seven hills are still here, under the streets: the ground rises forty metres from the Forum to the Palatine.',
    'The Tiber floods. The embankments that hold it are only a hundred and fifty years old.',
    'Every roof in the centre is terracotta, and the tallest thing allowed is the dome of St Peter\'s.',
  ],
  prefix:'raising Rome… ',labels:{'map-data':'reading the rioni',ground:'laying out the seven hills',buildings:'raising the palazzi',details:'paving the piazze',landmarks:'raising the domes',el:'',traffic:'filling the streets',ui:'opening the shutters'}});
// The Colosseum, the Pantheon, St Peter's and the domes are shapes rather than heights, so they travel with this
// page; so do the stone pines, which are what Rome's skyline is made of when it is not made of domes.
const ctx=window._iz={defaultCity:'rome',models:[landmarks],extras:[{name:'dress',fn:dress},{name:'palazzi',fn:palazzi},{name:'life',fn:life},{name:'courts',fn:courts},{name:'streetlife',fn:streetlife},{name:'traffic',fn:traffic},{name:'crowds',fn:crowds},{name:'navmap',fn:navmap},{name:'events',fn:events},{name:'photo',fn:photo},{name:'drawstats',fn:drawstats}]};
// with 'drawstats' in the address, every object is stamped with the stage that added it (src/core/drawstats.js)
if(/drawstats/.test(location.hash)&&window.THREE){const add=THREE.Object3D.prototype.add;THREE.Object3D.prototype.add=function(...o){for(const c of o)if(c&&c.userData&&!c.userData.stage)c.traverse(d=>{d.userData.stage=d.userData.stage||globalThis.__stage;});return add.apply(this,o);};}
// each extra timed: its build time in the details (extraMs), so a slow load says which stage it is
ctx.extras=ctx.extras.map(e=>({name:e.name,fn:api=>{const t0=performance.now();try{return e.fn(api);}finally{api.ctx.details=api.ctx.details||{};(api.ctx.details.extraMs=api.ctx.details.extraMs||{})[e.name]=Math.round(performance.now()-t0);}}}));
boot(()=>build(ctx));
