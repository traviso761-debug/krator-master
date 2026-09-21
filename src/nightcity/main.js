// Night City: entry point for nightcity.html. Fan work — a coastal cyberpunk megacity drawing on Blade Runner's
// Los Angeles and on Cyberpunk's Night City. The city is generated, not surveyed, and every shape is this project's
// own low-poly geometry; no game or film assets are used. It runs on the shared engine in src/engine/.
import {report,LOAD,configureLoading,installErrorHandlers} from '../core/diag.js';
import {build} from '../engine/build.js';
import {landmarks} from './landmarks.js';
import {neon} from './neon.js';
installErrorHandlers();window.LOAD=LOAD;
configureLoading({
  // What you read while it builds. See src/core/diag.js: these are shuffled and one of them is
  // shown at a time under the progress line.
  lines:[
    'Fan work. Cyberpunk belongs to its owners; every shape here is this project\'s own geometry.',
    'The sea wall is there because the water is ninety-five metres up the outside of it.',
    'A city that advertises at this volume has to be drawn at night or there is nothing to see.',
    'The megabuildings are single structures with populations the size of towns.',
    'Nothing here is lit by the sun. Everything is lit by something somebody is selling.',
  ],
  prefix:'raising Night City… ',labels:{'map-data':'reading the block plan',ground:'pouring the streets',buildings:'stacking the blocks',details:'wiring the yards',landmarks:'raising the ziggurats',el:'running the coast line',traffic:'starting the traffic',neon:'lighting the signs',ui:'opening the windows'}});
// the ziggurat and the neon are Night City's alone: the engine knows nothing about either until it is handed them
const ctx=window._iz={defaultCity:'nightcity',models:[landmarks],extras:[{name:'neon',fn:neon}]};
requestAnimationFrame(()=>setTimeout(()=>{build(ctx).catch(e=>{report('build',e);const l=document.getElementById('loading');if(l)l.remove();});},30));
