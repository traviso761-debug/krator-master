// Deep Sky: entry point for deepsky.html. Three ways a star ends - a black hole (M87*), a pulsar (the Crab's) and a
// core-collapse supernova - each on the starship page's turntable (src/starship/page.js); model.js switches them.
import {starshipPage} from '../starship/page.js';
import {model} from './model.js';
starshipPage({
  city:'deepsky',
  model,
  prefix:'looking up… ',
  labels:{config:'reading the catalogue',sky:'lighting the stars',hull:'bending the light',ui:'opening the telescope'},
  lines:[
    'M87*: six and a half billion suns in a space the size of the Solar System, 55 million light years off.',
    'The light round a black hole is followed along its bent paths, a pixel at a time.',
    'The Crab Pulsar turns thirty times a second. Here it is slowed down, unless you ask.',
    'A supernova in a minute: the real one takes a day to break the surface.',
  ],
});
