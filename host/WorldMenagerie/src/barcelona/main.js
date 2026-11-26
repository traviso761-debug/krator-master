// Barcelona: entry point for barcelona.html. The old city and the Eixample from OpenStreetMap on the shared engine,
// from the port and Barceloneta's beach up through Cerdà's grid of chamfered blocks to Gràcia and Park Güell, with
// Montjuïc and the slopes of Collserola from the elevation tiles and the Mediterranean at sea level. Gaudí's
// buildings, the cathedrals, the towers and the monuments that are shapes rather than heights are modelled in
// landmarks.js; the balconies on every floor of the blocks are balconies.js. Map data (c) OpenStreetMap contributors, ODbL.
import {LOAD,configureLoading,installErrorHandlers} from '../core/diag.js';
import {boot} from '../core/shell.js';
import {build} from '../engine/build.js';
import {landmarks} from './landmarks.js';
import {balconies} from './balconies.js';
import {palms} from './palms.js';
import {dress} from '../core/dress.js';
import {streetlife} from '../core/streetlife.js';
import {navmap} from '../core/navmap.js';
import {traffic} from '../core/traffic.js';
import {crowds} from '../core/crowds.js';
import {drawstats} from '../core/drawstats.js';
installErrorHandlers();window.LOAD=LOAD;
configureLoading({
  lines:[
    'Ildefons Cerdà laid out the Eixample in 1859: a grid of blocks 113 m square, each corner cut off at 45 degrees so carts and carriages could turn.',
    'Cerdà meant every block to be built on two sides only, round a garden. The developers built all four, and the gardens became courtyards.',
    'The Sagrada Família was begun in 1882. Gaudí took it over in 1883 and worked on it for 43 years; he is buried in its crypt.',
    'The Tower of Jesus Christ was finished in 2026, a hundred years after Gaudí died: at 172.5 m it is the tallest church tower in the world.',
    'Gaudí kept the basilica a little lower than Montjuïc, 173 m: he said the work of man should not surpass the work of God.',
    'Barceloneta was laid out in the 1750s for the fishermen whose houses were pulled down to build the Ciutadella fortress.',
    'Until the Olympics of 1992 the city turned its back on the sea: the beaches were railway yards and factories.',
    'La Rambla follows the bed of a stream that ran along the medieval walls; its name is the Arabic for a sandy riverbed.',
  ],
  prefix:'raising Barcelona… ',labels:{'map-data':'reading the barris',ground:'laying out the plain and Montjuïc',buildings:'raising the illes',details:'planting the plane trees',landmarks:'raising the towers of the Sagrada Família',el:'',traffic:'filling the Diagonal',ui:'opening the persianes'}});
const ctx=window._iz={defaultCity:'barcelona',models:[landmarks],extras:[{name:'dress',fn:dress},{name:'balconies',fn:balconies},{name:'palms',fn:palms},{name:'streetlife',fn:streetlife},
  {name:'traffic',fn:traffic},{name:'crowds',fn:crowds},{name:'navmap',fn:navmap},{name:'drawstats',fn:drawstats}]};
// with 'drawstats' in the address, every object is stamped with the stage that added it (src/core/drawstats.js)
if(/drawstats/.test(location.hash)&&window.THREE){const add=THREE.Object3D.prototype.add;THREE.Object3D.prototype.add=function(...o){for(const c of o)if(c&&c.userData&&!c.userData.stage)c.traverse(d=>{d.userData.stage=d.userData.stage||globalThis.__stage;});return add.apply(this,o);};}
// each extra timed: its build time in the details (extraMs), so a slow load says which stage it is
ctx.extras=ctx.extras.map(e=>({name:e.name,fn:api=>{const t0=performance.now();try{return e.fn(api);}finally{api.ctx.details=api.ctx.details||{};(api.ctx.details.extraMs=api.ctx.details.extraMs||{})[e.name]=Math.round(performance.now()-t0);}}}));
boot(()=>build(ctx));
