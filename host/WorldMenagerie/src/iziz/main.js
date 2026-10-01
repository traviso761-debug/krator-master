// Iziz: entry point for iziz.html. Everything the city is made of runs in build() (src/iziz/build.js,
// assembled from src/iziz/stages/). ctx is the one object the stages share with each other and with the
// browser console (window._iz).
import {report,LOAD,configureLoading,installErrorHandlers} from '../core/diag.js';
import {boot} from '../core/shell.js';
import {build} from './build.js';
installErrorHandlers();window.LOAD=LOAD;
configureLoading({
  // What you read while it builds. See src/core/diag.js: these are shuffled and one of them is
  // shown at a time under the progress line.
  lines:[
    'Iziz is this project\'s own city: no map data, no source material, nothing borrowed.',
    'Every building is generated from a seed. Change the seed and it is a different city with the same rules.',
    'The wireframe has been on this page since the first version and is still the most useful control on it.',
    'The script on the signs is a real writing system with a grammar behind it. There is a page about it.',
    'The jungle is placed by the same rules as the streets, which is why it grows where nobody built.',
    'Everything you can see is boxes. There are no textures anywhere in this project.',
  ],
  prefix:'raising Iziz… ',labels:{walls:'building the walls',jungle:'planting the jungle',life:'waking the city',textures:'painting surfaces',batch:'gathering the stonework',particles:'stirring the air',river:'filling the river',infill:'raising the houses'}});
const ctx=window._iz={};
boot(()=>build(ctx));
