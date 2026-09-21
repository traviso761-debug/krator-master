// Venice: entry point for venice.html. The historic centre from OpenStreetMap on the shared engine, which
// it inverts: the canals are the street network, the calli are the exception, and the ground is at sea
// level. Map data (c) OpenStreetMap contributors, ODbL.
import {report,LOAD,configureLoading,installErrorHandlers} from '../core/diag.js';
import {build} from '../engine/build.js';
import {landmarks} from './landmarks.js';
import {boats} from './boats.js';
import {life} from './life.js';
installErrorHandlers();window.LOAD=LOAD;
configureLoading({prefix:'raising Venice… ',labels:{'map-data':'reading the sestieri',ground:'flooding the canals',buildings:'raising the palazzi',details:'laying the calli',landmarks:'raising the Campanile',el:'',traffic:'launching the boats',ui:'opening the windows'}});
// The Campanile, the Basilica, the Salute and the Rialto are shapes rather than heights, so they travel with
// this page; the boats travel with it too, because nowhere else on the site has traffic on the water.
const ctx=window._iz={defaultCity:'venice',models:[landmarks],extras:[{name:'boats',fn:boats},{name:'life',fn:life}]};
requestAnimationFrame(()=>setTimeout(()=>{build(ctx).catch(e=>{report('build',e);const l=document.getElementById('loading');if(l)l.remove();});},30));
