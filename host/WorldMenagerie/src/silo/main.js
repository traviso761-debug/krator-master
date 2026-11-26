// Silo 18: entry point for silo.html. Fan work after Hugh Howey's Wool: one silo of the fifty, in section, from the
// cap under the dirt to the generator and the mines, with the field of silos round it. Every shape and every line
// of text is this project's own; the residents are anonymous figures. It runs on the page the starships share
// (src/starship/page.js), with a logarithmic depth buffer, since you can look from the dead city on the horizon
// down to a single stair tread.
import {starshipPage} from '../starship/page.js';
import {model} from './silo.js';
starshipPage({
  city:'silo',
  model,
  logDepth:true,
  prefix:'going down the stair… ',
  labels:{config:'reading the records',sky:'raising the dust',hull:'pouring the levels',ui:'lighting the landings'},
  lines:[
    'Silo 18: fan work after Hugh Howey\'s Wool. One silo of fifty, buried under a dead plain.',
    '144 levels round an open shaft. The stair is the only way up or down.',
    'Up top, the cafeteria\'s screen shows the outside as the cameras on the cap see it.',
    'The mids grow the food under lights that keep the day. IT sits on level 34.',
    'Down deep: water, the casting rooms, mechanical, and the generator that runs everything.',
    'The near half is cut away. Drag to turn the silo; the buttons start a cleaning, a porter\'s run, a blackout or a storm.',
  ],
});
