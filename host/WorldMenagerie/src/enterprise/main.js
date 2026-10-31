// USS Enterprise NCC-1701-D, Galaxy class: entry point for enterprise.html.
// Fan work — Star Trek belongs to Paramount; nothing from any film, series or game is used, and every shape
// is this project's own geometry. The page does not run on the shared engine: there is no ground here.
import {starshipPage} from '../starship/page.js';
import {model} from './ship.js';
starshipPage({
  city:'enterprise',
  model,
  prefix:'making way… ',
  labels:{config:'reading the specification',sky:'hanging the stars',hull:'laying the keel and painting the hull',ui:'running the lights'},
  lines:[
    'Fan work. Star Trek belongs to Paramount; nothing from any film, series or game is used here.',
    'Six hundred and forty-two metres long, and about a thousand people aboard, a third of them not crew.',
    'The saucer is an ellipse, not a circle: 384 metres long and 464 across.',
    'Every window is where a deck meets the hull, so on the saucer they come in rings that crowd where the dish is steep.',
    'The textures are painted when the page loads, a texel at a time, by asking the hull where each one is.',
    'The saucer separates. The drive section keeps the warp engines; the saucer keeps the families.',
    'The nacelles are held out on pylons because a warp field wants to be clear of the hull it is moving.',
    'The Bussard collectors in the nose of each nacelle are for scooping up hydrogen, which is the one thing space has.',
    'The nose of the engineering hull leans back thirty degrees, and the deflector looks forward and down out of it.',
    'Every drawing of this ship makes it 141 metres tall, whatever the published figure says.',
  ],
});
