// Antigua Guatemala: entry point for antigua.html. The old capital of the Kingdom of Guatemala from OpenStreetMap on
// the shared engine, on its real ground: the colonial grid in the Panchoy valley at 1530 m, its churches and the
// ruins the earthquakes of 1773 left, Ciudad Vieja and the villages round it, and the three volcanoes over it all,
// Agua to the south, Acatenango and Fuego to the west. The churches and the arch are shapes rather than heights,
// modelled in landmarks.js; the volcanoes' fire and smoke are volcanoes.js. Map data (c) OpenStreetMap contributors, ODbL.
import {report,LOAD,configureLoading,installErrorHandlers} from '../core/diag.js';
import {boot} from '../core/shell.js';
import {build} from '../engine/build.js';
import {landmarks} from './landmarks.js';
import {volcanoes} from './volcanoes.js';
import {events} from './events.js';
import {infill} from './infill.js';
import {casas} from './casas.js';
import {fincas} from './fincas.js';
import {dress} from '../core/dress.js';
import {navmap} from '../core/navmap.js';
import {traffic} from '../core/traffic.js';
import {crowds} from '../core/crowds.js';
import {streetlife} from '../core/streetlife.js';
import {drawstats} from '../core/drawstats.js';
installErrorHandlers();window.LOAD=LOAD;
configureLoading({
  lines:[
    'Santiago de los Caballeros de Guatemala was the capital of Central America from Chiapas to Costa Rica for over two hundred years.',
    'The Santa Marta earthquakes of 1773 brought the city down; the Crown moved the capital, and the old one became La Antigua.',
    'Fuego has been erupting, more or less without a break, since 2002. Its explosions can be heard in the city.',
    'Agua was the first capital\'s volcano: in 1541 a mudflow from its slopes buried Ciudad Vieja, the city before this one.',
    'Acatenango is the climbers\' volcano. They sleep on its shoulder at 3600 m to watch Fuego throw lava through the night.',
    'The Arco de Santa Catalina was built in 1694 so the nuns of the convent could cross the street without being seen.',
    'In Holy Week the streets are carpeted with alfombras of dyed sawdust, flowers and fruit, walked over by the processions.',
    'The town keeps its colonial grid, its one- and two-storey houses and its cobbles by law: no building may stand taller than the churches.',
  ],
  prefix:'raising Antigua… ',labels:{'map-data':'reading the cuadras',ground:'raising the volcanoes',buildings:'building the casas',details:'laying the cobbles',landmarks:'raising the churches',el:'',traffic:'running the camionetas',ui:'lighting the faroles'}});
const ctx=window._iz={defaultCity:'antigua',models:[landmarks],extras:[{name:'volcanoes',fn:volcanoes},{name:'infill',fn:infill},{name:'casas',fn:casas},{name:'fincas',fn:fincas},{name:'dress',fn:dress},{name:'streetlife',fn:streetlife},{name:'traffic',fn:traffic},{name:'crowds',fn:crowds},{name:'navmap',fn:navmap},{name:'events',fn:events},{name:'drawstats',fn:drawstats}]};
// with 'drawstats' in the address, every object is stamped with the stage that added it (src/core/drawstats.js)
if(/drawstats/.test(location.hash)&&window.THREE){const add=THREE.Object3D.prototype.add;THREE.Object3D.prototype.add=function(...o){for(const c of o)if(c&&c.userData&&!c.userData.stage)c.traverse(d=>{d.userData.stage=d.userData.stage||globalThis.__stage;});return add.apply(this,o);};}
// each extra timed: its build time in the details (extraMs), so a slow load says which stage it is
ctx.extras=ctx.extras.map(e=>({name:e.name,fn:api=>{const t0=performance.now();try{return e.fn(api);}finally{api.ctx.details=api.ctx.details||{};(api.ctx.details.extraMs=api.ctx.details.extraMs||{})[e.name]=Math.round(performance.now()-t0);}}}));
boot(()=>build(ctx));
