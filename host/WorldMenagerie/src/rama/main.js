// Rama: entry point for rama.html. Fan work, after Arthur C. Clarke's Rendezvous with Rama (1973); nothing from
// any edition, cover, film design or game is used, and every shape is this project's own geometry. It runs on the
// page the starships and Babylon 5 share (src/starship/page.js), with a logarithmic depth buffer, because it is
// fifty kilometres long and you can stand on its floor.
import {starshipPage} from '../starship/page.js';
import {model} from './rama.js';
starshipPage({
  city:'rama',
  model,
  logDepth:true,
  prefix:'matching the spin… ',
  labels:{config:'reading the radar returns',sky:'finding the Sun',hull:'turning the cylinder',ui:'opening the airlock'},
  lines:[
    'Fan work, after Arthur C. Clarke\'s Rendezvous with Rama. Nothing from any edition or adaptation is used.',
    'Fifty kilometres long, twenty across, turning once every four minutes.',
    'Spaceguard catalogued it as asteroid 31/439. It was not an asteroid.',
    'Inside, the plain curves up on both sides and meets itself overhead, sixteen kilometres up.',
    'Six Straight Valleys, three to each plain: they are not canals. They are the suns.',
    'The Cylindrical Sea rings the world at its waist, and New York stands in the middle of it.',
    'The southern cliff is ten times the height of the northern, because of which way Rama accelerates.',
    'Everything the Ramans built, they built in threes.',
    'Press Cutaway for the cross-section, Inside to stand on the plain, Events for the story.',
  ],
});
