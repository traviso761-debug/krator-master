// Yellowstone National Park: entry point for yellowstone.html. A real place on the shared engine, the size of a
// small country: the ground is the real ground and the roads, lakes and buildings are OpenStreetMap's, both
// assembled by tools/make-yellowstone.py. What the map does not carry travels with this page - the geysers, the
// springs, the falls and the lodges (landmarks.js), and the forest, the steam, the rivers, the herds and the
// caldera (nature.js), which read the land file the generator writes beside the map.
import {report,LOAD,configureLoading,installErrorHandlers} from '../core/diag.js';
import {boot} from '../core/shell.js';
import {build} from '../engine/build.js';
import {landmarks} from './landmarks.js';
import {nature} from './nature.js';
installErrorHandlers();window.LOAD=LOAD;
configureLoading({
  lines:[
    'The first national park in the world, 1872. Nobody had a word for it yet.',
    'A hundred and six kilometres by a hundred and nine, on a hundred-and-fifty-metre grid of the real ground.',
    'Half the geysers on Earth are inside this map.',
    'The caldera is seventy kilometres across, and most people drive through it without noticing they were in it.',
    'Old Faithful goes every ninety minutes or so. Here it goes every two, because nobody would wait.',
    'Grand Prismatic is blue in the middle because nothing can live in water that hot.',
    'The yellow in the Grand Canyon of the Yellowstone is rock that hot water has rotted.',
    'The traffic stops for the bison. The bison do not stop for the traffic.',
    'A third of the park burned in 1988, and the lodgepole needs fire to open its cones.',
    'Five to fifteen kilometres down there is a reservoir of magma, mostly crystal, a little of it melt.',
    'Mammoth\'s terraces lay down two tonnes of travertine a day and move where they please.',
  ],
  prefix:'opening the park… ',labels:{'map-data':'reading the survey',ground:'raising the plateau',buildings:'building the lodges',details:'',landmarks:'priming the geysers',el:'',traffic:'opening the Grand Loop',nature:'growing the lodgepole',ui:'opening the windows'}});
const ctx=window._iz={defaultCity:'yellowstone',models:[landmarks],extras:[{name:'nature',fn:nature}]};
// the land cover, the caldera and the basins are not map data the engine reads, so they come in their own file,
// fetched before the build so that the extras can use them synchronously like everything else they are handed
boot(()=>fetch('data/cities/yellowstone-land.json').then(r=>{if(!r.ok)throw new Error('yellowstone-land.json: HTTP '+r.status);return r.json();})
  .then(land=>{ctx.ysLand=land;},e=>report('land',e))
  .then(()=>build(ctx)));
