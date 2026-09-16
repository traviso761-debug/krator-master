// City of Iziz: entry point for iziz.html. Everything the city is made of runs in build() (src/iziz/build.js,
// assembled from src/iziz/stages/). ctx is the one object the stages share with each other and with the
// browser console (window._iz).
import {report,LOAD,configureLoading,installErrorHandlers} from '../core/diag.js';
import {build} from './build.js';
installErrorHandlers();window.LOAD=LOAD;
configureLoading({prefix:'raising Iziz… ',labels:{walls:'building the walls',jungle:'planting the jungle',life:'waking the city',textures:'painting surfaces',batch:'gathering the stonework',particles:'stirring the air',river:'filling the river',infill:'raising the houses'}});
const ctx=window._iz={};
requestAnimationFrame(()=>setTimeout(()=>{build(ctx).catch(e=>{report('build',e);const l=document.getElementById('loading');if(l)l.remove();});},30));
