// Mount Hood: entry point for mthood.html. Mount Hood (Wy'east), Oregon's highest mountain, 3,429 m, from OpenStreetMap
// on the shared engine, on the USGS's 3DEP ground: the 40 m grid from tools/build-osm-city.py and the upper mountain
// at 12.5 m (data/cities/mthood-fine.json, src/core/fine.js); its glaciers, trails, lifts, runs, streams and falls from
// OpenStreetMap through tools/make-mthood.py (data/cities/mthood-mtn.json). The year turns (season.js): the snow,
// the meadows' flowers, the autumn, the lakes' ice, the sun's path and the weather's odds follow the date. The far
// Cascades are Sarajevo's backdrop.js over data/cities/mthood-far.json. Map data (c) OpenStreetMap contributors, ODbL.
import {report,LOAD,configureLoading,installErrorHandlers} from '../core/diag.js';
import {boot} from '../core/shell.js';
import {build} from '../engine/build.js';
import {makeFine,drawFine} from '../core/fine.js';
import {backdrop} from '../sarajevo/backdrop.js';
import {season} from './season.js';
import {ground} from './ground.js';
import {navmap} from '../core/navmap.js';
import {traffic} from '../core/traffic.js';
import {crowds} from '../core/crowds.js';
import {drawstats} from '../core/drawstats.js';
import {EXTRAS,MODELS} from './modules.js';
installErrorHandlers();window.LOAD=LOAD;
configureLoading({
  lines:[
    'Mount Hood is 3,429 m (11,249 ft): the highest point in Oregon, and a volcano that last erupted in the 1790s, a few years before Lewis and Clark saw it from the Columbia.',
    'The Multnomah called it Wy’east. In the story, Wy’east and Pahto (Mount Adams) fought over Loowit (Mount St. Helens), and broke the Bridge of the Gods.',
    'Twelve named glaciers and snowfields lie on the mountain. The Eliot, on the north side, is the largest.',
    'The Timberline Trail goes all the way round the mountain: about 41 miles (66 km), with some 9,000 ft of climbing.',
    'Timberline Lodge was built in 1936-38 by the Works Progress Administration, by hand, from the mountain’s own stone and timber.',
    'The Palmer Snowfield above Timberline holds snow late enough that people ski there in summer.',
    'Crater Rock, below the summit on the south side, is a lava dome from the eruptions of about 1781; the fumaroles round it still smell of sulphur.',
  ],
  prefix:'raising the mountain… ',labels:{'map-data':'reading the survey',ground:'raising the mountain',buildings:'building Government Camp',details:'laying the trails',landmarks:'raising Timberline Lodge',el:'',traffic:'starting the lifts',ui:'lighting the lodge'}});
// the fine ground over the upper mountain, before the build, so everything built stands on it (ctx.fineAt)
const fineGround=api=>{const r=drawFine(api,ctx.fine,{near:5000,mid:12000});ctx.details=Object.assign(ctx.details||{},{fineVerts:r.verts,pressed:r.pressed});};
const ctx=window._iz={defaultCity:'mthood',models:MODELS,
  extras:[{name:'season',fn:season},{name:'fine ground',fn:fineGround},{name:'backdrop',fn:backdrop},{name:'ground',fn:ground},...EXTRAS,
    {name:'traffic',fn:traffic},{name:'crowds',fn:crowds},{name:'navmap',fn:navmap},{name:'drawstats',fn:drawstats}]};
// every object is stamped with the stage that added it: drawstats labels by it (src/core/drawstats.js), and the
// events hide the modern world by it (events.js, 1937: no cars, no lifts)
if(window.THREE){const add=THREE.Object3D.prototype.add;THREE.Object3D.prototype.add=function(...o){for(const c of o)if(c&&c.userData&&!c.userData.stage)c.traverse(d=>{d.userData.stage=d.userData.stage||globalThis.__stage;});return add.apply(this,o);};}
// each extra timed: its build time in the details (extraMs), so a slow load says which stage it is
ctx.extras=ctx.extras.map(e=>({name:e.name,fn:api=>{const t0=performance.now();try{return e.fn(api);}finally{api.ctx.details=api.ctx.details||{};(api.ctx.details.extraMs=api.ctx.details.extraMs||{})[e.name]=Math.round(performance.now()-t0);}}}));
const getJSON=(u,what)=>fetch(u).then(r=>{if(!r.ok)throw new Error(u+': HTTP '+r.status);return r.json();}).catch(e=>{report(what,e);return null;});
// (#nofine leaves the fine ground out, to compare)
boot(()=>Promise.all([/nofine/.test(location.hash)?Promise.resolve({fine:[]}):getJSON('data/cities/mthood-fine.json','fine ground'),getJSON('data/cities/mthood-mtn.json','the mountain')])
  .then(([f,m])=>{ctx.fine=makeFine((f&&f.fine)||[]);ctx.fineAt=ctx.fine.at;ctx.mtn=m||{};})
  .then(()=>build(ctx)));
