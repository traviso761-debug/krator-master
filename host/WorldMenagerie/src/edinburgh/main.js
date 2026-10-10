// Edinburgh: entry point for edinburgh.html. Scotland's capital from OpenStreetMap on the shared engine, on its real
// ground: the Old Town down its ridge from the Castle Rock, the New Town's grid across the valley, Holyrood under
// Arthur's Seat, Calton Hill, and Leith on the Forth. The Castle, the spires and the monuments are shapes rather than
// heights, modelled in landmarks.js. Map data (c) OpenStreetMap contributors, ODbL.
import {report,LOAD,configureLoading,installErrorHandlers} from '../core/diag.js';
import {boot} from '../core/shell.js';
import {build} from '../engine/build.js';
import {landmarks} from './landmarks.js';
import {dress} from '../core/dress.js';
import {events} from './events.js';
import {crags} from './crags.js';
import {oldtown} from './oldtown.js';
import {navmap} from '../core/navmap.js';
import {traffic} from '../core/traffic.js';
import {crowds} from '../core/crowds.js';
import {streetlife} from '../core/streetlife.js';
import {drawstats} from '../core/drawstats.js';
installErrorHandlers();window.LOAD=LOAD;
configureLoading({
  lines:[
    'The Castle Rock is the plug of a volcano that went out 350 million years ago; the ice sheets scraped past it and left the Royal Mile as its tail.',
    'Arthur\'s Seat is the rest of that volcano, 251 metres high, a mile from the Palace of Holyroodhouse.',
    'The One O\'Clock Gun has fired from the Castle every day but Sunday since 1861, for the ships in the Forth to set their clocks.',
    'The New Town was planned in 1767 by James Craig, aged 23: three streets, two squares, and the Old Town left on its ridge.',
    'The Old Town\'s tenements were the tallest houses in Europe, up to fourteen storeys on the side of the ridge.',
    'Edinburgh was called Auld Reekie for the smoke of its chimneys, which blackened every stone in the city.',
    'The Balmoral\'s clock is kept three minutes fast, so that no one misses a train at Waverley.',
    'The Scott Monument is the largest monument to a writer in the world: 61 metres and 287 steps.',
  ],
  prefix:'raising Edinburgh… ',labels:{'map-data':'reading the closes',ground:'raising the Castle Rock',buildings:'building the tenements',details:'laying the setts',landmarks:'raising the Castle',el:'',traffic:'running the buses',ui:'lighting the lamps'}});
const ctx=window._iz={defaultCity:'edinburgh',models:[landmarks],extras:[{name:'dress',fn:dress},{name:'crags',fn:crags},{name:'oldtown',fn:oldtown},{name:'streetlife',fn:streetlife},{name:'traffic',fn:traffic},{name:'crowds',fn:crowds},{name:'navmap',fn:navmap},{name:'events',fn:events},{name:'drawstats',fn:drawstats}]};
// with 'drawstats' in the address, every object is stamped with the stage that added it (src/core/drawstats.js)
if(/drawstats/.test(location.hash)&&window.THREE){const add=THREE.Object3D.prototype.add;THREE.Object3D.prototype.add=function(...o){for(const c of o)if(c&&c.userData&&!c.userData.stage)c.traverse(d=>{d.userData.stage=d.userData.stage||globalThis.__stage;});return add.apply(this,o);};}
// each extra timed: its build time in the details (extraMs), so a slow load says which stage it is
ctx.extras=ctx.extras.map(e=>({name:e.name,fn:api=>{const t0=performance.now();try{return e.fn(api);}finally{api.ctx.details=api.ctx.details||{};(api.ctx.details.extraMs=api.ctx.details.extraMs||{})[e.name]=Math.round(performance.now()-t0);}}}));
boot(()=>build(ctx));
