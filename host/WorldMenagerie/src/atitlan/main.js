// Lake Atitlán: entry point for atitlan.html. The lake in the Guatemalan highlands from OpenStreetMap on the shared
// engine, on its real ground: the drowned caldera at 1556 m, San Pedro, Tolimán and Atitlán on its southern shore,
// and the Kaqchikel and Tz'utujil towns round it, Panajachel, Sololá on the rim, Santiago Atitlán, San Pedro and San
// Juan La Laguna, San Marcos, Santa Cruz, the Palopós and San Lucas. The towns take Antigua's colonial churches,
// house fronts, infill and coffee (src/antigua/), Sarajevo's street dogs, window bars and far mountains (src/sarajevo/);
// the lake and what is on it is lake.js. Map data (c) OpenStreetMap contributors, ODbL.
import {report,LOAD,configureLoading,installErrorHandlers} from '../core/diag.js';
import {boot} from '../core/shell.js';
import {build} from '../engine/build.js';
import {landmarks as iglesias} from '../antigua/landmarks.js';
import {landmarks} from './landmarks.js';
import {infill} from '../antigua/infill.js';
import {casas} from '../antigua/casas.js';
import {fincas} from '../antigua/fincas.js';
import {backdrop} from '../sarajevo/backdrop.js';
import {blocks} from '../sarajevo/blocks.js';
import {dogs} from '../sarajevo/dogs.js';
import {lake} from './lake.js';
import {cover} from './cover.js';
import {obragris} from './obragris.js';
import {painted} from './painted.js';
import {walls} from './walls.js';
import {waves} from './waves.js';
import {events} from './events.js';
import {dress} from '../core/dress.js';
import {navmap} from '../core/navmap.js';
import {traffic} from '../core/traffic.js';
import {crowds} from '../core/crowds.js';
import {streetlife} from '../core/streetlife.js';
import {drawstats} from '../core/drawstats.js';
installErrorHandlers();window.LOAD=LOAD;
configureLoading({
  lines:[
    'Lake Atitlán fills a caldera: the volcano that stood here blew itself apart 84,000 years ago.',
    'The lake is 340 metres deep and has no river out of it; it drains through the ground.',
    'Since 2009 the lake has risen by about five metres, drowning docks, houses and the trees along the shore.',
    'Twelve towns stand round the lake, most of them named for a saint and La Laguna; the Tz\'utujil live on the south and west shores, the Kaqchikel on the north and east.',
    'The Xocomil, the afternoon wind, comes up over the lake most days around noon. The boatmen cross early.',
    'In Santiago Atitlán, Maximón, a saint with a cigar, lives in a different house each year.',
    'Santa Catarina Palopó has painted its houses in the patterns of its huipil, the women\'s woven blouse.',
    'Aldous Huxley called it Lake Como with several immense volcanoes: too much of a good thing.',
  ],
  prefix:'filling the caldera… ',labels:{'map-data':'reading the shore',ground:'raising the volcanoes',buildings:'building the towns',details:'laying the docks',landmarks:'raising the churches',el:'',traffic:'starting the lanchas',ui:'lighting the lamps'}});
const ctx=window._iz={defaultCity:'atitlan',models:[iglesias,landmarks],extras:[{name:'backdrop',fn:backdrop},{name:'cover',fn:cover},{name:'lake',fn:lake},{name:'waves',fn:waves},{name:'infill',fn:infill},{name:'casas',fn:casas},{name:'fincas',fn:fincas},{name:'obragris',fn:obragris},{name:'painted',fn:painted},{name:'walls',fn:walls},{name:'blocks',fn:blocks},{name:'dogs',fn:dogs},{name:'dress',fn:dress},{name:'streetlife',fn:streetlife},{name:'traffic',fn:traffic},{name:'crowds',fn:crowds},{name:'navmap',fn:navmap},{name:'events',fn:events},{name:'drawstats',fn:drawstats}]};
// with 'drawstats' in the address, every object is stamped with the stage that added it (src/core/drawstats.js)
if(/drawstats/.test(location.hash)&&window.THREE){const add=THREE.Object3D.prototype.add;THREE.Object3D.prototype.add=function(...o){for(const c of o)if(c&&c.userData&&!c.userData.stage)c.traverse(d=>{d.userData.stage=d.userData.stage||globalThis.__stage;});return add.apply(this,o);};}
// each extra timed: its build time in the details (extraMs), so a slow load says which stage it is
ctx.extras=ctx.extras.map(e=>({name:e.name,fn:api=>{const t0=performance.now();try{return e.fn(api);}finally{api.ctx.details=api.ctx.details||{};(api.ctx.details.extraMs=api.ctx.details.extraMs||{})[e.name]=Math.round(performance.now()-t0);}}}));
boot(()=>build(ctx));
