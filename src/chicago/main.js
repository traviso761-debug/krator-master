// Chicago: entry point for chicago.html. The city is built by the shared engine (src/engine/build.js,
// assembled from src/engine/stages/) - Chicago is one of the places that runs on it, not the owner of it.
// ctx is what the stages share with each other and with the console (window._iz).
import {report,LOAD,configureLoading,installErrorHandlers} from '../core/diag.js';
import {boot} from '../core/shell.js';
import {build} from '../engine/build.js';
import {landmarks} from './landmarks.js';
installErrorHandlers();window.LOAD=LOAD;
configureLoading({
  // What you read while it builds. See src/core/diag.js: these are shuffled and one of them is
  // shown at a time under the progress line.
  lines:[
    'The Loop is called that because the elevated tracks run round it in a loop. It is not a metaphor.',
    'In the 1850s the whole downtown was jacked up out of the mud on screw jacks, building by building, with the shops still open.',
    'The river was made to flow backwards in 1900, away from the lake the city drinks out of. It still does.',
    'The grid is eight blocks to the mile and it starts at State and Madison, which is why every address in this city is a distance.',
    'Wacker Drive has two of itself, one above the other, and in places three.',
    'Nobody modelled these towers one at a time: every one of them is a footprint from OpenStreetMap with a height on it.',
    'Marina City parks its cars in the bottom nineteen floors, on a spiral, with no wall on the outside.',
    'The lakefront is all park because a man called Montgomery Ward sued the city four times to keep it that way.',
    'Willis Tower is nine square tubes bundled together. Two of them stop at the fiftieth floor.',
    'The alleys are in the map as well. Chicago has about nineteen hundred miles of them.',
    'The L runs a six-hundred-volt third rail at head height over a public street.',
    'Lake Michigan is a sixth of this frame and none of it is painted. It is one flat sheet with the sky in it.',
    'The water tanks on the older roofs are wooden. Wood does not split when the water in it freezes.',
    'Every crosswalk here is at a junction where two named streets actually meet in the map data.',
  ],
  prefix:'raising Chicago… ',labels:{ground:'filling the lake',blocks:'raising the towers',landmarks:'placing the landmarks',el:'building the L',traffic:'starting the traffic',ui:'opening the windows'}});
// Cloud Gate, the Pritzker Pavilion, the Wheel and Wrigley Field are Chicago's own, so the page brings them.
const ctx=window._iz={models:[landmarks]};
boot(()=>build(ctx));
