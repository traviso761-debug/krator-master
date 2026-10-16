// Yachats: entry point for yachats.html. The village on the central Oregon coast from OpenStreetMap on the shared
// engine, on its real ground: the terrace where the Yachats River comes out of the Coast Range into the Pacific, the
// 804 Trail along the basalt to the north, and Cape Perpetua to the south, its stone shelter 230 m over Devil's Churn,
// Thor's Well and the Spouting Horn. The sea is at sea level and the shore comes out of the elevation. What the map
// does not carry travels with this page: the shelter, the log church, the lighthouse and the blowholes' rock
// (landmarks.js); the forest, the surf, the basalt and the sea in the blowholes (coast.js), which read the land file
// tools/make-yachats.py writes beside the map; and what happens (events.js). Map data (c) OpenStreetMap contributors, ODbL.
import {report,LOAD,configureLoading,installErrorHandlers} from '../core/diag.js';
import {boot} from '../core/shell.js';
import {build} from '../engine/build.js';
import {landmarks} from './landmarks.js';
import {coast} from './coast.js';
import {events} from './events.js';
import {dress} from '../core/dress.js';
import {navmap} from '../core/navmap.js';
import {traffic} from '../core/traffic.js';
import {crowds} from '../core/crowds.js';
import {streetlife} from '../core/streetlife.js';
installErrorHandlers();window.LOAD=LOAD;
configureLoading({
  lines:[
    'Yachats is pronounced YAH-hots. The name is said to come from the Siletz for dark water at the foot of the mountain.',
    'Cape Perpetua was named by Captain Cook on 7 March 1778, Saint Perpetua\'s day. He was looking for the Northwest Passage.',
    'The stone shelter on the top of the cape was built by the Civilian Conservation Corps in 1933, of the cape\'s own basalt.',
    'The basalt along this shore came from lava flows in eastern Oregon and Idaho, fifteen million years ago, that ran all the way to the sea.',
    'Thor\'s Well is a sea cave whose roof fell in. At high tide the ocean seems to drain down it.',
    'Every December and January eighteen thousand gray whales go south past this shore, and every spring they come back.',
    'The smelt run up onto the beach at Smelt Sands in summer, and people catch them in nets in the surf.',
    'The 804 Trail is the last stretch of a county road from 1916 that was never built: the village kept the right of way as a path.',
    'Sitka spruce grows only in the fog belt, a strip of coast from Alaska to northern California a few miles wide.',
  ],
  prefix:'opening Yachats… ',labels:{'map-data':'reading the survey',ground:'raising the cape',buildings:'building the village',details:'',landmarks:'laying the shelter\'s stones',el:'',traffic:'opening the 101',coast:'growing the spruce',ui:'lighting the windows'}});
const ctx=window._iz={defaultCity:'yachats',models:[landmarks],extras:[{name:'coast',fn:coast},{name:'dress',fn:dress},{name:'streetlife',fn:streetlife},{name:'traffic',fn:traffic},{name:'crowds',fn:crowds},{name:'navmap',fn:navmap},{name:'events',fn:events}]};
// the coastline, the basalt shelves and the cliffs are not map data the engine reads, so they come in their own file,
// fetched before the build so that the extras can use them synchronously like everything else
boot(()=>fetch('data/cities/yachats-land.json').then(r=>{if(!r.ok)throw new Error('yachats-land.json: HTTP '+r.status);return r.json();})
  .then(land=>{ctx.yaLand=land;},e=>report('land',e))
  .then(()=>build(ctx)));
