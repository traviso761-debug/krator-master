// Sarajevo: entry point for sarajevo.html. The capital of Bosnia and Herzegovina from OpenStreetMap on the shared
// engine, on its real ground: the long valley of the Miljacka between Trebević and the hills of the mahalas.
// Baščaršija and its mosques at the east end, the Austro-Hungarian centre beside it, Marijin Dvor's towers to the
// west; the cable car and the 1984 bobsleigh track on Trebević. Today's city, with its history played as events
// (events.js). Map data (c) OpenStreetMap contributors, ODbL.
import {report,LOAD,configureLoading,installErrorHandlers} from '../core/diag.js';
import {boot} from '../core/shell.js';
import {build} from '../engine/build.js';
import {landmarks} from './landmarks.js';
import {mosques} from './mosques.js';
import {mezarje} from './mezarje.js';
import {streets} from './streets.js';
import {backdrop} from './backdrop.js';
import {blocks} from './blocks.js';
import {river} from './river.js';
import {dogs} from './dogs.js';
import {events} from './events.js';
import {dress} from '../core/dress.js';
import {navmap} from '../core/navmap.js';
import {traffic} from '../core/traffic.js';
import {crowds} from '../core/crowds.js';
import {streetlife} from '../core/streetlife.js';
import {drawstats} from '../core/drawstats.js';
installErrorHandlers();window.LOAD=LOAD;
configureLoading({
  lines:[
    'Sarajevo was founded by the Ottomans in the 1460s round the governor\'s palace, the saray, that gave it its name.',
    'In one walk of five hundred metres down Ferhadija you pass a mosque, a Catholic cathedral, an Orthodox cathedral and a synagogue.',
    'Gazi Husrev-beg\'s mosque was the first in the world lit by electricity, in 1898.',
    'Sarajevo had electric trams in 1895, before Vienna had them.',
    'Where East meets West, the paving says: a line across Ferhadija marks where the Ottoman city ends and the Austrian begins.',
    'The siege of Sarajevo lasted 1,425 days, from April 1992 to February 1996.',
    'The Sarajevo Haggadah, a Jewish manuscript of the fourteenth century from Barcelona, has been hidden from the Nazis and saved from the siege.',
    'Ćevapi in a somun, with onion and kajmak: Baščaršija\'s ćevabdžinicas grill them all day.',
  ],
  prefix:'raising Sarajevo… ',labels:{'map-data':'reading the mahalas',ground:'raising Trebević',buildings:'building the houses',details:'laying the river stones',landmarks:'raising the minarets',el:'',traffic:'running the trams',ui:'lighting the lamps'}});
const ctx=window._iz={defaultCity:'sarajevo',models:[landmarks],extras:[{name:'backdrop',fn:backdrop},{name:'mosques',fn:mosques},{name:'mezarje',fn:mezarje},{name:'blocks',fn:blocks},{name:'river',fn:river},{name:'dogs',fn:dogs},{name:'streets',fn:streets},{name:'dress',fn:dress},{name:'streetlife',fn:streetlife},{name:'traffic',fn:traffic},{name:'crowds',fn:crowds},{name:'navmap',fn:navmap},{name:'events',fn:events},{name:'drawstats',fn:drawstats}]};
// with 'drawstats' in the address, every object is stamped with the stage that added it (src/core/drawstats.js)
if(/drawstats/.test(location.hash)&&window.THREE){const add=THREE.Object3D.prototype.add;THREE.Object3D.prototype.add=function(...o){for(const c of o)if(c&&c.userData&&!c.userData.stage)c.traverse(d=>{d.userData.stage=d.userData.stage||globalThis.__stage;});return add.apply(this,o);};}
// each extra timed: its build time in the details (extraMs), so a slow load says which stage it is
ctx.extras=ctx.extras.map(e=>({name:e.name,fn:api=>{const t0=performance.now();try{return e.fn(api);}finally{api.ctx.details=api.ctx.details||{};(api.ctx.details.extraMs=api.ctx.details.extraMs||{})[e.name]=Math.round(performance.now()-t0);}}}));
boot(()=>build(ctx));
