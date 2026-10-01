// USS Enterprise NCC-1701-D, Galaxy class: entry point for enterprise.html.
// Fan work — Star Trek belongs to Paramount; nothing from any film, series or game is used, and every shape
// is this project's own geometry. The page does not run on the shared engine: there is no ground here.
import {starshipPage} from '../starship/page.js';
import {model} from './ship.js';
starshipPage({
  city:'enterprise',
  model,
  prefix:'making way… ',
  labels:{config:'reading the specification',sky:'hanging the stars',hull:'laying the keel',ui:'running the lights'},
  lines:[
    'Fan work. Star Trek belongs to Paramount; nothing from any film, series or game is used here.',
    'Six hundred and forty-two metres long, and about a thousand people aboard, a third of them not crew.',
    'The saucer is a double-curved dish with a rim, not a disc. That is most of what makes the silhouette.',
    'There are no textures anywhere in this project, so every window on this hull is a lit box.',
    'The saucer separates. The drive section keeps the warp engines; the saucer keeps the families.',
    'The nacelles are held out on pylons because a warp field wants to be clear of the hull it is moving.',
    'The Bussard collectors in the nose of each nacelle are for scooping up hydrogen, which is the one thing space has.',
    'A hull number would be four pixels tall from anywhere you would actually look at this ship, so there is no lettering on it at all.',
    'The deflector is the only light this ship makes that reaches anything.',
    'Everything you can see is boxes, lathes and tables of cross-sections. There is no mesh here that was not generated.',
  ],
});
