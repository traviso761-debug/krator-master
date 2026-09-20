// New York: entry point for nyc.html. The city engine is shared with Chicago (src/engine/build.js, assembled from
// src/engine/stages/); only the data differ: data/cities/nyc.json and nyc-osm.json, built from OpenStreetMap.
import {report,LOAD,configureLoading,installErrorHandlers} from '../core/diag.js';
import {build} from '../engine/build.js';
import {landmarks} from './landmarks.js';
installErrorHandlers();window.LOAD=LOAD;
configureLoading({prefix:'raising New York… ',labels:{'map-data':'reading the map',ground:'laying out the grid',buildings:'raising the towers',details:'planting the trees',landmarks:'placing the landmarks',el:'running the trains',traffic:'starting the traffic',ui:'opening the windows'}});
// Liberty, the suspension bridges and One World Trade belong to this city alone, so the page carries them
const ctx=window._iz={defaultCity:'nyc',models:[landmarks]};
requestAnimationFrame(()=>setTimeout(()=>{build(ctx).catch(e=>{report('build',e);const l=document.getElementById('loading');if(l)l.remove();});},30));
