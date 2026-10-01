// Babylon 5: entry point for babylon5.html. Fan work - Babylon 5 belongs to Warner Bros. and J. Michael
// Straczynski; nothing from the series, its models or its art is used, and every shape is this project's own
// geometry. It runs on the page the three starships share (src/starship/page.js).
import {starshipPage} from '../starship/page.js';
import {model} from './station.js';
starshipPage({
  city:'babylon5',
  model,
  prefix:'matching the spin… ',
  labels:{config:'reading the specification',sky:'lighting Epsilon',hull:'spinning up the drum',ui:'opening the bay'},
  lines:[
    'Fan work. Babylon 5 belongs to Warner Bros. and J. Michael Straczynski; nothing from the series is used here.',
    'Five miles long and two and a half million tonnes, and all of it alone in the night.',
    'The drum turns once every forty-five seconds. At the skin, that is a gravity a little under Earth\'s.',
    'The docking bay mouth turns with the station. Every pilot coming in has to match its roll.',
    'The Starfuries drop out of the Cobra bays and the spin throws them clear before their engines light.',
    'There is a garden inside the drum, and the sky over it is the other side of the garden.',
    'The jump gate off the bow is the only reason anything stops in this system at all.',
    'The planet below is Epsilon III. Nobody lives on it, as far as anybody knows.',
    'The last of the Babylon stations. The first three were sabotaged; the fourth vanished.',
    'Press Raiders for condition red: the gate opens, and the defence grid and the Starfuries answer.',
  ],
});
