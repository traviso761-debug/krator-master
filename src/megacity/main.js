// Mega-City One: entry point for megacity.html. Fan work in the spirit of Judge Dredd's city, which belongs to
// Rebellion. The city is generated, not surveyed, and every shape is this project's own low-poly geometry; no
// assets from the comics, films or games are used. It runs on the shared engine in src/engine/.
import {report,LOAD,configureLoading,installErrorHandlers} from '../core/diag.js';
import {build} from '../engine/build.js';
import {landmarks} from './landmarks.js';
installErrorHandlers();window.LOAD=LOAD;
configureLoading({
  // What you read while it builds. See src/core/diag.js: these are shuffled and one of them is
  // shown at a time under the progress line.
  lines:[
    'Fan work. Judge Dredd belongs to Rebellion; nothing of theirs is used here.',
    'One city, the whole eastern seaboard, four hundred million people.',
    'A city block is a building. It has a name, a number, and about fifty thousand residents.',
    'Outside the wall is the Cursed Earth, and there is a good deal more of that than there is city.',
    'The overlaps are the point: this is what happens when a city is allowed to grow upwards for two centuries.',
  ],
  prefix:'raising Mega-City One… ',labels:{'map-data':'reading the sector plan',ground:'pouring the sector streets',buildings:'stacking the city blocks',details:'fitting out the roofs',landmarks:'raising the Hall of Justice',el:'running the zoom line',traffic:'starting the megways',ui:'opening the windows'}});
// the Hall of Justice and the Statue of Judgement are this city's own, so the page carries them
const ctx=window._iz={defaultCity:'megacity',models:[landmarks]};
requestAnimationFrame(()=>setTimeout(()=>{build(ctx).catch(e=>{report('build',e);const l=document.getElementById('loading');if(l)l.remove();});},30));
