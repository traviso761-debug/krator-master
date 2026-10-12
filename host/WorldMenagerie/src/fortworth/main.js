// Fort Worth: entry point for fortworth.html. Where the West begins, from OpenStreetMap on the shared engine, on its
// real ground along the Trinity: downtown and Sundance Square on the bluff, the Stockyards to the north, the
// Cultural District's museums to the west, the Near Southside, TCU. The courthouse, the museums and the Stockyards
// are shapes rather than heights, modelled in landmarks.js. Map data (c) OpenStreetMap contributors, ODbL.
import {report,LOAD,configureLoading,installErrorHandlers} from '../core/diag.js';
import {boot} from '../core/shell.js';
import {build} from '../engine/build.js';
import {landmarks} from './landmarks.js';
import {events} from './events.js';
import {stockyards} from './stockyards.js';
import {dress} from '../core/dress.js';
import {navmap} from '../core/navmap.js';
import {traffic} from '../core/traffic.js';
import {crowds} from '../core/crowds.js';
import {streetlife} from '../core/streetlife.js';
import {drawstats} from '../core/drawstats.js';
installErrorHandlers();window.LOAD=LOAD;
configureLoading({
  lines:[
    'Fort Worth began in 1849 as an army camp on the bluff over the Trinity, where the courthouse stands now.',
    'The Chisholm Trail came through: four million head of cattle were driven past here to the Kansas railheads.',
    'Then the railroads came to Fort Worth, and the Stockyards shipped the West\'s cattle east from 1890 until the 1970s.',
    'The longhorns are still driven down Exchange Avenue, twice a day.',
    'Cowtown Coliseum held the world\'s first indoor rodeo, in 1918.',
    'The Kimbell\'s vaults are cycloids: the curve a point on a rolling wheel draws. A slit along each crown lets the daylight in.',
    'Sundance Square is named for the Sundance Kid, who hid out in Hell\'s Half Acre with Butch Cassidy.',
    'Dallas is where the East peters out; Fort Worth is where the West begins.',
  ],
  prefix:'raising Fort Worth… ',labels:{'map-data':'reading the plats',ground:'raising the bluff',buildings:'building downtown',details:'laying the bricks',landmarks:'raising the courthouse',el:'',traffic:'running the trains',ui:'lighting Sundance Square'}});
const ctx=window._iz={defaultCity:'fortworth',models:[landmarks],extras:[{name:'stockyards',fn:stockyards},{name:'dress',fn:dress},{name:'streetlife',fn:streetlife},{name:'traffic',fn:traffic},{name:'crowds',fn:crowds},{name:'navmap',fn:navmap},{name:'events',fn:events},{name:'drawstats',fn:drawstats}]};
if(/drawstats/.test(location.hash)&&window.THREE){const add=THREE.Object3D.prototype.add;THREE.Object3D.prototype.add=function(...o){for(const c of o)if(c&&c.userData&&!c.userData.stage)c.traverse(d=>{d.userData.stage=d.userData.stage||globalThis.__stage;});return add.apply(this,o);};}
ctx.extras=ctx.extras.map(e=>({name:e.name,fn:api=>{const t0=performance.now();try{return e.fn(api);}finally{api.ctx.details=api.ctx.details||{};(api.ctx.details.extraMs=api.ctx.details.extraMs||{})[e.name]=Math.round(performance.now()-t0);}}}));
boot(()=>build(ctx));
