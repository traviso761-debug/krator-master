// Mystery Flesh Pit National Park: entry point for fleshpit.html. Fan work — the park, the Permian Basin
// Superorganism and the 2007 incident are Trevor Roberts's creation (mysteryfleshpitnationalpark.com); nothing
// of his is used, copied or redistributed, and every shape here is this project's own. The surface runs on the
// engine Chicago and New York share (src/engine/build.js); what is below the rim does not, because a shaft two
// and a half kilometres deep is not a footprint pushed upwards — it is built by organism.js, and the page rides
// it with a camera of its own (camera.js) that no other city loads or is affected by.
import {report,LOAD,configureLoading,installErrorHandlers} from '../core/diag.js';
import {build} from '../engine/build.js';
import {landmarks} from './landmarks.js';
import {organism} from './organism.js';
import {descent} from './camera.js';
installErrorHandlers();window.LOAD=LOAD;
configureLoading({prefix:'opening the park… ',labels:{'map-data':'reading the survey',ground:'laying the caliche',buildings:'raising the visitor center',details:'planting the mesquite',landmarks:'railing off the lip',el:'running the monorail',traffic:'opening the road',organism:'descending',ui:'opening the windows'}});
const ctx=window._iz={defaultCity:'fleshpit',models:[landmarks],
  extras:[{name:'organism',fn:organism},{name:'descent',fn:descent}]};
requestAnimationFrame(()=>setTimeout(()=>{build(ctx).catch(e=>{report('build',e);const l=document.getElementById('loading');if(l)l.remove();});},30));
