// Olympic National Park: entry point for olympic.html. The whole Olympic Peninsula on the shared engine, the size of
// a small country: the ground is the real ground, the sea is at sea level round three sides of it, and the roads,
// rivers, lakes, glaciers and buildings are OpenStreetMap's, all assembled by tools/make-olympic.py. What the map
// does not carry travels with this page: the lodges, lighthouses, bridge and great trees (landmarks.js); the
// forest, the rainforest, the timber, the glaciers, the surf and the sea stacks (nature.js), which read the land
// file the generator writes beside the map; and what happens (events.js).
import {report,LOAD,configureLoading,installErrorHandlers} from '../core/diag.js';
import {boot} from '../core/shell.js';
import {build} from '../engine/build.js';
import {landmarks} from './landmarks.js';
import {nature} from './nature.js';
import {events} from './events.js';
installErrorHandlers();window.LOAD=LOAD;
configureLoading({
  lines:[
    'A hundred and sixty kilometres across, on a two-hundred-metre grid of the real ground, with the sea on three sides.',
    'The Hoh gets three and a half metres of rain a year. Sequim, sixty kilometres away in the mountains\' shadow, gets forty centimetres.',
    'Mount Olympus is 2,432 m, and you cannot see it from any road on the peninsula except the one up Hurricane Ridge.',
    'The Elwha\'s two dams came down in 2011 and 2014, the largest dam removal in history. The salmon were back within weeks.',
    'Sitka spruce in the rainforest valleys grow to ninety metres. The biggest in the world is on the shore of Lake Quinault.',
    'Roosevelt elk were the reason for the first protection, in 1909: Mount Olympus National Monument, for the herds.',
    'Outside the park the forest is a crop: from the air the timberlands are a quilt of clearcuts, each block its own age.',
    'Cape Flattery is the north-westernmost point of the contiguous United States.',
    'The Hood Canal Bridge is the longest floating bridge in the world over salt water.',
  ],
  prefix:'opening the peninsula… ',labels:{'map-data':'reading the survey',ground:'raising the Olympics',buildings:'building the towns',details:'',landmarks:'lighting the lighthouses',el:'',traffic:'opening the 101',nature:'growing the rainforest',ui:'opening the windows'}});
const ctx=window._iz={defaultCity:'olympic',models:[landmarks],extras:[{name:'nature',fn:nature},{name:'events',fn:events}]};
// the land cover, the timber's ages, the stacks and the coast are not map data the engine reads, so they come in
// their own file, fetched before the build so that the extras can use them synchronously like everything else
boot(()=>fetch('data/cities/olympic-land.json').then(r=>{if(!r.ok)throw new Error('olympic-land.json: HTTP '+r.status);return r.json();})
  .then(land=>{ctx.olLand=land;},e=>report('land',e))
  .then(()=>build(ctx)));
