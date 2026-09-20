// Chicago: entry point for chicago.html. The city is built in build() (src/chicago/build.js, assembled from
// src/chicago/stages/). ctx is what the stages share with each other and with the console (window._iz).
import {report,LOAD,configureLoading,installErrorHandlers} from '../core/diag.js';
import {build} from './build.js';
import {landmarks} from './landmarks.js';
installErrorHandlers();window.LOAD=LOAD;
configureLoading({prefix:'raising Chicago… ',labels:{ground:'filling the lake',blocks:'raising the towers',landmarks:'placing the landmarks',el:'building the L',traffic:'starting the traffic',ui:'opening the windows'}});
// Cloud Gate, the Pritzker Pavilion, the Wheel and Wrigley Field are Chicago's own, so the page brings them.
const ctx=window._iz={models:[landmarks]};
requestAnimationFrame(()=>setTimeout(()=>{build(ctx).catch(e=>{report('build',e);const l=document.getElementById('loading');if(l)l.remove();});},30));
