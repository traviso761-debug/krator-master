// Mega-City One: entry point for megacity.html. Fan work in the spirit of Judge Dredd's city, which belongs to
// Rebellion. The city is generated, not surveyed, and every shape is this project's own low-poly geometry; no
// assets from the comics, films or games are used. It runs on the shared engine in src/engine/.
import {report,LOAD,configureLoading,installErrorHandlers} from '../core/diag.js';
import {build} from '../engine/build.js';
import {landmarks} from './landmarks.js';
installErrorHandlers();window.LOAD=LOAD;
configureLoading({prefix:'raising Mega-City One… ',labels:{'map-data':'reading the sector plan',ground:'pouring the sector streets',buildings:'stacking the city blocks',details:'fitting out the roofs',landmarks:'raising the Hall of Justice',el:'running the zoom line',traffic:'starting the megways',ui:'opening the windows'}});
// the Hall of Justice and the Statue of Judgement are this city's own, so the page carries them
const ctx=window._iz={defaultCity:'megacity',models:[landmarks]};
requestAnimationFrame(()=>setTimeout(()=>{build(ctx).catch(e=>{report('build',e);const l=document.getElementById('loading');if(l)l.remove();});},30));
