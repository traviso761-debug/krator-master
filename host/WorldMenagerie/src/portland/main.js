// Portland: entry point for portland.html. The city engine is shared with Chicago (src/engine/build.js, assembled from
// src/engine/stages/); only the data differ: data/cities/portland.json and portland-osm.json.
import {report,LOAD,configureLoading,installErrorHandlers} from '../core/diag.js';
import {boot} from '../core/shell.js';
import {build} from '../engine/build.js';
import {landmarks} from './landmarks.js';
installErrorHandlers();window.LOAD=LOAD;
configureLoading({
  // What you read while it builds. See src/core/diag.js: these are shuffled and one of them is
  // shown at a time under the progress line.
  lines:[
    'The blocks are two hundred feet square - half the size of most American cities. More corners, more shop fronts.',
    'Mount Hood is fifty miles away and in the model, because from the West Hills it is the whole eastern sky.',
    'Forest Park is five thousand acres of city-owned woodland inside the city limits.',
    'The West Hills are an extinct volcanic field. There are forty-odd vents under the suburbs.',
    'The Willamette has a bridge that lifts its entire deck straight up between two towers.',
    'The terrain is real elevation data. The trees are not, but there are about as many.',
    'The parks, the golf courses and the cemeteries are land cover out of the map, drawn as ground rather than as things standing on it.',
    'Portland has more microbreweries than any city its size and none of them are modelled.',
    'The bridges are held at full height over the water and ramped down to the street over land, which is what a bridge does.',
  ],
  prefix:'raising Portland… ',labels:{'map-data':'reading the map',ground:'laying out the streets',buildings:'raising the buildings',details:'planting the trees',landmarks:'placing the landmarks',el:'running the MAX',traffic:'starting the traffic',ui:'opening the windows'}});
// the bridges, the sign, the gate, the submarine, the tram and Mount Hood are Portland's, so they come with it
const ctx=window._iz={defaultCity:'portland',models:[landmarks]};
boot(()=>build(ctx));
