// Mystery Flesh Pit National Park: entry point for fleshpit.html. Fan work — the park, the Permian Basin
// Superorganism and the 2007 incident are Trevor Roberts's creation (mysteryfleshpitnationalpark.com); nothing
// of his is used, copied or redistributed, and every shape here is this project's own. The surface runs on the
// engine Chicago and New York share (src/engine/build.js); what is below the rim does not, because a shaft two
// and a half kilometres deep is not a footprint pushed upwards — it is built by organism.js, and the page rides
// it with a camera of its own (camera.js) that no other city loads or is affected by.
import {report,LOAD,configureLoading,installErrorHandlers} from '../core/diag.js';
import {boot} from '../core/shell.js';
import {build} from '../engine/build.js';
import {landmarks} from './landmarks.js';
import {surface} from './surface.js';
import {organism} from './organism.js';
import {descent} from './camera.js';
import {anatomy} from './anatomy.js';
import {promenade} from './promenade.js';
import {visitors} from './visitors.js';
import {fauna} from './fauna.js';
import {incident} from './incident.js';
import {tunnels} from './tunnels.js';
import {section} from './section.js';
installErrorHandlers();window.LOAD=LOAD;
configureLoading({
  // What you read while it builds. See src/core/diag.js: these are shuffled and one of them is
  // shown at a time under the progress line.
  lines:[
    'Fan work. Mystery Flesh Pit National Park is Trevor Roberts\'s project.',
    'A national park over a superorganism, and a shaft driven down through it.',
    'The visitor centre is built on something that is alive and was not asked.',
    'The funnel has a hole in the middle of it, because a heightfield cannot have one unless you say so.',
    'Everything below the rim is lit by what is down there rather than by the sun.',
    'The wall breathes. The steel does not. That is the whole of the problem.',
    'Press 4 July 2007 to see the night, and again to put it back.',
  ],
  prefix:'opening the park… ',labels:{tunnels:'gating the passages',section:'cutting the section',anatomy:'finding the heart',promenade:'laying the paths',visitors:'opening the gates',fauna:'counting the copepods',incident:'filing the report','map-data':'reading the survey',ground:'laying the caliche',buildings:'raising the visitor center',details:'planting the mesquite',landmarks:'railing off the lip',el:'running the monorail',traffic:'opening the road',organism:'descending',ui:'opening the windows'}});
const ctx=window._iz={defaultCity:'fleshpit',models:[landmarks,surface],
  extras:[{name:'organism',fn:organism},{name:'tunnels',fn:tunnels},{name:'anatomy',fn:anatomy},{name:'promenade',fn:promenade},{name:'visitors',fn:visitors},{name:'fauna',fn:fauna},{name:'incident',fn:incident},{name:'section',fn:section},{name:'descent',fn:descent}]};
boot(()=>build(ctx));
