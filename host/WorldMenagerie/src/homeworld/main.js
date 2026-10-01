// Homeworld: entry point for homeworld.html. Fan work - Homeworld belongs to its makers (Relic Entertainment,
// and now Gearbox); nothing from the game, its models, its art or its sound is used, and every shape is this
// project's own geometry. It runs on the page the starships and Babylon 5 share (src/starship/page.js).
import {starshipPage} from '../starship/page.js';
import {model} from './fleet.js';
starshipPage({
  city:'homeworld',
  model,
  prefix:'waking the Mothership… ',
  labels:{config:'reading the fleet',sky:'lighting the Kharak system',hull:'building the Mothership',ui:'opening the hangar'},
  lines:[
    'Fan work. Homeworld belongs to its makers; nothing from the game is used here, and every shape is this project\'s own.',
    'Sixty years in the Scaffold. Six hundred thousand sleepers. One ship.',
    'Mission 1: the trials. Scouts in formation against target drones, a collector out at the asteroids.',
    'Mission 3: the Mothership comes home out of hyperspace, and Kharak is burning.',
    'Six cryo trays hold what is left of the Kushan. Bring them in.',
    'Press Sensors for the tactical map: every ship a dot on a stalk, over the grid.',
  ],
});
