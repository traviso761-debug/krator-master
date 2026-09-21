// New York: entry point for nyc.html. The city engine is shared with Chicago (src/engine/build.js, assembled from
// src/engine/stages/); only the data differ: data/cities/nyc.json and nyc-osm.json, built from OpenStreetMap.
import {report,LOAD,configureLoading,installErrorHandlers} from '../core/diag.js';
import {build} from '../engine/build.js';
import {landmarks} from './landmarks.js';
installErrorHandlers();window.LOAD=LOAD;
configureLoading({
  // What you read while it builds. See src/core/diag.js: these are shuffled and one of them is
  // shown at a time under the progress line.
  lines:[
    'The grid was drawn in 1811, over farms, before most of the island had anything on it at all.',
    'The bedrock is why the towers cluster where they do: near the surface downtown and in midtown, and deep in between.',
    'Central Park is entirely artificial. Every rock in it that is not bedrock was put there.',
    'The city is at sea level, so this map floods its whole box and lets the ground decide what is dry.',
    'One World Trade is mapped as a square with a triangle glued to each side, all five of them running to 417 m. It is modelled by hand instead.',
    'Manhattan is about thirteen miles long and two wide, and this is most of it.',
    'The Chrysler Building\'s crown is seven arches of stainless steel, each one smaller than the last.',
    'The avenues run a little east of north, which is why the light goes straight down them twice a year.',
    'There are more people on this island on a weekday than live in fifteen of the states.',
  ],
  prefix:'raising New York… ',labels:{'map-data':'reading the map',ground:'laying out the grid',buildings:'raising the towers',details:'planting the trees',landmarks:'placing the landmarks',el:'running the trains',traffic:'starting the traffic',ui:'opening the windows'}});
// Liberty, the suspension bridges and One World Trade belong to this city alone, so the page carries them
const ctx=window._iz={defaultCity:'nyc',models:[landmarks]};
requestAnimationFrame(()=>setTimeout(()=>{build(ctx).catch(e=>{report('build',e);const l=document.getElementById('loading');if(l)l.remove();});},30));
