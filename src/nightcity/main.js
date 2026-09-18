// Night City: entry point for nightcity.html. Fan work — a coastal cyberpunk megacity drawing on Blade Runner's
// Los Angeles and on Cyberpunk's Night City. The city is generated, not surveyed, and every shape is this project's
// own low-poly geometry; no game or film assets are used. The engine is the one Chicago and New York share.
import {report,LOAD,configureLoading,installErrorHandlers} from '../core/diag.js';
import {build} from '../chicago/build.js';
installErrorHandlers();window.LOAD=LOAD;
configureLoading({prefix:'raising Night City… ',labels:{'map-data':'reading the block plan',ground:'pouring the streets',buildings:'stacking the blocks',details:'wiring the yards',landmarks:'raising the ziggurats',el:'running the coast line',traffic:'starting the traffic',neon:'lighting the signs',ui:'opening the windows'}});
const ctx=window._iz={defaultCity:'nightcity'};
requestAnimationFrame(()=>setTimeout(()=>{build(ctx).catch(e=>{report('build',e);const l=document.getElementById('loading');if(l)l.remove();});},30));
