// Venice: entry point for venice.html. The historic centre from OpenStreetMap on the shared engine, which
// it inverts: the canals are the street network, the calli are the exception, and the ground is at sea
// level. Map data (c) OpenStreetMap contributors, ODbL.
import {report,LOAD,configureLoading,installErrorHandlers} from '../core/diag.js';
import {boot} from '../core/shell.js';
import {build} from '../engine/build.js';
import {landmarks} from './landmarks.js';
import {boats} from './boats.js';
import {life} from './life.js';
import {palazzi} from '../core/palazzi.js';
import {courts} from '../core/courts.js';
import {streetlife} from '../core/streetlife.js';
import {crowds} from '../core/crowds.js';
import {navmap} from '../core/navmap.js';
import {drawstats} from '../core/drawstats.js';
installErrorHandlers();window.LOAD=LOAD;
configureLoading({
  // What you read while it builds. See src/core/diag.js: these are shuffled and one of them is
  // shown at a time under the progress line.
  lines:[
    'There is no ground. The city stands on trees driven into the mud, and the mud is holding.',
    'The canals are the street network. The calli are the exception.',
    'Every chimney has a bell on top of it, because a spark landing on a wooden roof once took out a whole sestiere.',
    'The striped posts outside a palazzo are painted in that house\'s own colours.',
    'The bricole go in threes to mark a channel, because the lagoon is a foot deep everywhere except where it is not.',
    'This map has no height grid at all. The islands are worked out from where the buildings are.',
    'A gondola is built asymmetrical - the left side is longer - so that one oar on one side drives it straight.',
    'Nothing here is delivered by road. Everything you can see arrived by boat.',
    'The city has been sinking for a thousand years and the sea has been rising for a hundred.',
  ],
  prefix:'raising Venice… ',labels:{'map-data':'reading the sestieri',ground:'flooding the canals',buildings:'raising the palazzi',details:'laying the calli',landmarks:'raising the Campanile',el:'',traffic:'launching the boats',ui:'opening the windows'}});
// The Campanile, the Basilica, the Salute and the Rialto are shapes rather than heights, so they travel with
// this page; the boats travel with it too, because nowhere else on the site has traffic on the water.
const ctx=window._iz={defaultCity:'venice',models:[landmarks],extras:[{name:'palazzi',fn:palazzi},{name:'boats',fn:boats},{name:'life',fn:life},{name:'courts',fn:courts},{name:'streetlife',fn:streetlife},{name:'crowds',fn:crowds},{name:'navmap',fn:navmap},{name:'drawstats',fn:drawstats}]};
// each extra timed: its build time in the details (extraMs), so a slow load says which stage it is
ctx.extras=ctx.extras.map(e=>({name:e.name,fn:api=>{const t0=performance.now();try{return e.fn(api);}finally{api.ctx.details=api.ctx.details||{};(api.ctx.details.extraMs=api.ctx.details.extraMs||{})[e.name]=Math.round(performance.now()-t0);}}}));
// with 'drawstats' in the address, every object is stamped with the stage that added it (src/core/drawstats.js)
if(/drawstats/.test(location.hash)&&window.THREE){const add=THREE.Object3D.prototype.add;THREE.Object3D.prototype.add=function(...o){for(const c of o)if(c&&c.userData&&!c.userData.stage)c.traverse(d=>{d.userData.stage=d.userData.stage||globalThis.__stage;});return add.apply(this,o);};}
boot(()=>build(ctx));
