// Tokyo: entry point for tokyo.html. Central Tokyo from OpenStreetMap on the shared engine - a strip from Shinjuku to
// Ginza, the first of a city that grows outward - with the buildings that are shapes rather than heights modelled in
// landmarks.js, and the map (src/core/navmap.js) showing what is built so far against all of it.
// Map data (c) OpenStreetMap contributors, ODbL.
import {report,LOAD,configureLoading,installErrorHandlers} from '../core/diag.js';
import {boot} from '../core/shell.js';
import {build} from '../engine/build.js';
import {landmarks} from './landmarks.js';
import {navmap} from '../core/navmap.js';
import {traffic} from '../core/traffic.js';
import {crowds} from '../core/crowds.js';
import {streetlife} from '../core/streetlife.js';
import {groves} from '../core/groves.js';
import {roofs} from './roofs.js';
import {streets} from './streets.js';
import {metro} from '../core/metro.js';
import {metrolife} from '../core/metrolife.js';
import {drawstats} from '../core/drawstats.js';
import {stations} from './stations.js';
import {water} from './water.js';
import {seasons} from './seasons.js';
import {events} from './events.js';
installErrorHandlers();window.LOAD=LOAD;
configureLoading({
  lines:[
    'Tokyo Tower is thirteen metres taller than the Eiffel Tower, and painted in international orange so aircraft see it.',
    'At Shibuya Crossing every light turns red for cars at once, and up to three thousand people cross in every direction.',
    'Shinjuku Station is the busiest in the world: three and a half million people pass through it on a weekday.',
    'Meiji Jingū\'s forest was planted by hand in 1920, a hundred thousand trees given from all over Japan.',
    'The Imperial Palace stands where Edo Castle stood; its moats and stone walls are the castle\'s.',
    'Tokyo Station\'s red-brick front was bombed in 1945 and its domes rebuilt in 2012 as they were in 1914.',
    'Hachikō waited at Shibuya Station for his master every day for nine years after he died.',
    'The Yamanote Line goes round in a loop of 34.5 km and 30 stations; a train comes every few minutes.',
  ],
  prefix:'raising Tokyo… ',labels:{'map-data':'reading the wards',ground:'laying out the plateau',buildings:'raising the towers',details:'lighting the streets',landmarks:'raising Tokyo Tower',el:'',traffic:'filling the streets',ui:'opening the doors'}});
const ctx=window._iz={defaultCity:'tokyo',models:[landmarks],extras:[{name:'groves',fn:groves},{name:'roofs',fn:roofs},{name:'streets',fn:streets},{name:'metro',fn:metro},{name:'metrolife',fn:metrolife},{name:'streetlife',fn:streetlife},{name:'traffic',fn:traffic},{name:'stations',fn:stations},{name:'water',fn:water},{name:'seasons',fn:seasons},{name:'events',fn:events},{name:'crowds',fn:crowds},{name:'navmap',fn:navmap},{name:'drawstats',fn:drawstats}]};
// with 'drawstats' in the address, every object is stamped with the stage that added it (src/core/drawstats.js)
if(/drawstats/.test(location.hash)&&window.THREE){const add=THREE.Object3D.prototype.add;THREE.Object3D.prototype.add=function(...o){for(const c of o)if(c&&c.userData&&!c.userData.stage)c.traverse(d=>{d.userData.stage=d.userData.stage||globalThis.__stage;});return add.apply(this,o);};}
// each extra timed: its build time in the details (extraMs), so a slow load says which stage it is
ctx.extras=ctx.extras.map(e=>({name:e.name,fn:api=>{const t0=performance.now();try{return e.fn(api);}finally{api.ctx.details=api.ctx.details||{};(api.ctx.details.extraMs=api.ctx.details.extraMs||{})[e.name]=Math.round(performance.now()-t0);}}}));
boot(()=>build(ctx));
