// Deep Space 9, a Cardassian Nor-class station: entry point for ds9.html.
// Fan work — Star Trek belongs to Paramount; nothing from any film, series or game is used, and every shape
// is this project's own geometry.
import {starshipPage} from '../starship/page.js';
import {model} from './station.js';
starshipPage({
  city:'ds9',
  model,
  prefix:'station keeping… ',
  labels:{config:'reading the specification',sky:'hanging the stars',hull:'building the ring',ui:'lighting the Promenade'},
  lines:[
    'Fan work. Star Trek belongs to Paramount; nothing from any film, series or game is used here.',
    'A Cardassian ore-processing station, built over somebody else’s planet by people who were not asked.',
    'Fourteen hundred and fifty metres across the docking ring.',
    'It is symmetrical in threes rather than about a keel, which is the first thing that tells you Starfleet did not build it.',
    'Nothing on it is trying to look fast, because it is a building.',
    'Six docking pylons: three up, three down, each curving back in at the top. That is the whole silhouette.',
    'The Promenade is the drum round the middle, and it is the only part of the station most visitors ever see.',
    'It was towed here. The wormhole is the only reason anything is parked in this system at all.',
    'Watch the sky off the port bow for a while. It is not there most of the time.',
    'The ore processors are the only part of this station that was ever used for what it was built to do.',
  ],
});
