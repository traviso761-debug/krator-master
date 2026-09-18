// New York: entry point for nyc.html. The city engine is shared with Chicago (src/chicago/build.js, assembled from
// src/chicago/stages/); only the data differ: data/cities/nyc.json and nyc-osm.json, built from OpenStreetMap.
import {report,LOAD,configureLoading,installErrorHandlers} from '../core/diag.js';
import {build} from '../chicago/build.js';
installErrorHandlers();window.LOAD=LOAD;
configureLoading({prefix:'raising New York… ',labels:{'map-data':'reading the map',ground:'laying out the grid',buildings:'raising the towers',details:'planting the trees',landmarks:'placing the landmarks',el:'running the trains',traffic:'starting the traffic',ui:'opening the windows'}});
const ctx=window._iz={defaultCity:'nyc'};
requestAnimationFrame(()=>setTimeout(()=>{build(ctx).catch(e=>{report('build',e);const l=document.getElementById('loading');if(l)l.remove();});},30));
