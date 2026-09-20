// City 17: entry point for city17.html. Fan work — the city is generated, not surveyed, and every shape is this
// project's own low-poly geometry modelled from the silhouettes; no game assets are used. Half-Life 2 belongs to Valve.
// The engine is the one Chicago and Portland share (src/engine/build.js, assembled from src/engine/stages/);
// tools/make-city17.py writes data/cities/city17-osm.json and data/cities/city17.json holds the rest.
import {report,LOAD,configureLoading,installErrorHandlers} from '../core/diag.js';
import {build} from '../engine/build.js';
import {landmarks} from './landmarks.js';
import {combine} from './combine.js';
installErrorHandlers();window.LOAD=LOAD;
configureLoading({prefix:'raising City 17… ',labels:{'map-data':'reading the district survey',ground:'pouring the streets',buildings:'raising the blocks',details:'filling in the yards',landmarks:'raising the Citadel',el:'running the razor train',traffic:'starting the traffic',ui:'opening the windows'}});
// the Citadel, the Combine's furniture and the occupation itself travel with this page, not with the engine
const ctx=window._iz={defaultCity:'city17',models:[landmarks],extras:[{name:'combine',fn:combine}]};
requestAnimationFrame(()=>setTimeout(()=>{build(ctx).catch(e=>{report('build',e);const l=document.getElementById('loading');if(l)l.remove();});},30));
