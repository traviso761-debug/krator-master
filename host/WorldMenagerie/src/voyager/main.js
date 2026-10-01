// USS Voyager NCC-74656, Intrepid class: entry point for voyager.html.
// Fan work — Star Trek belongs to Paramount; nothing from any film, series or game is used, and every shape
// is this project's own geometry.
import {starshipPage} from '../starship/page.js';
import {model} from './ship.js';
starshipPage({
  city:'voyager',
  model,
  prefix:'making way… ',
  labels:{config:'reading the specification',sky:'hanging the stars',hull:'laying the keel',ui:'running the lights'},
  lines:[
    'Fan work. Star Trek belongs to Paramount; nothing from any film, series or game is used here.',
    'Three hundred and forty-four metres, fifteen decks, and about a hundred and fifty aboard.',
    'A fifth of the length of a Galaxy class and less than a sixth of the crew.',
    'There is no neck. The saucer runs back and down into the engineering section as one body, which is the whole idea of the class.',
    'The pylons move: they lie out and down in normal space and swing up and forward before the ship goes to warp. Wait for it.',
    'Seventy thousand light years from home, which at maximum warp is about seventy-five years of travelling.',
    'She is small enough to land, which almost nothing else in the fleet is.',
    'Everything here is boxes, lathes and tables of cross-sections. There is no mesh that was not generated.',
    'No lettering anywhere on the hull. It would be four pixels tall from anywhere you would look at her from.',
  ],
});
