// Portland: entry point for portland.html. The city engine is shared with Chicago (src/chicago/build.js, assembled from
// src/chicago/stages/); only the data differ: data/cities/portland.json and portland-osm.json.
import {report,LOAD,configureLoading,installErrorHandlers} from '../core/diag.js';
import {build} from '../chicago/build.js';
import {landmarks} from './landmarks.js';
installErrorHandlers();window.LOAD=LOAD;
configureLoading({prefix:'raising Portland… ',labels:{'map-data':'reading the map',ground:'laying out the streets',buildings:'raising the buildings',details:'planting the trees',landmarks:'placing the landmarks',el:'running the MAX',traffic:'starting the traffic',ui:'opening the windows'}});
// the bridges, the sign, the gate, the submarine, the tram and Mount Hood are Portland's, so they come with it
const ctx=window._iz={defaultCity:'portland',models:[landmarks]};
requestAnimationFrame(()=>setTimeout(()=>{build(ctx).catch(e=>{report('build',e);const l=document.getElementById('loading');if(l)l.remove();});},30));
