// Vashrin: entry point for vashrin.html. An invented occupied city, drawn by the engine Chicago and Portland share
// (src/chicago/build.js, assembled from src/chicago/stages/). The geography is generated, not surveyed:
// tools/make-vashrin.py writes data/cities/vashrin-osm.json; data/cities/vashrin.json holds the rest.
import {report,LOAD,configureLoading,installErrorHandlers} from '../core/diag.js';
import {build} from '../chicago/build.js';
installErrorHandlers();window.LOAD=LOAD;
configureLoading({prefix:'raising Vashrin… ',labels:{'map-data':'reading the survey',ground:'pouring the streets',buildings:'raising the blocks',details:'filling in the yards',landmarks:'raising the Spire',el:'running the transit line',traffic:'starting the traffic',ui:'opening the windows'}});
const ctx=window._iz={defaultCity:'vashrin'};
requestAnimationFrame(()=>setTimeout(()=>{build(ctx).catch(e=>{report('build',e);const l=document.getElementById('loading');if(l)l.remove();});},30));
