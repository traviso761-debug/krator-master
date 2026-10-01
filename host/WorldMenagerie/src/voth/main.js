// Voth: entry point for voth.html. The city is build() (src/voth/build.js, assembled from src/voth/stages/);
// this is the part every page has: the error reporting, the loading screen, and the fingerprint the tests check.
import {report,LOAD,configureLoading,installErrorHandlers} from '../core/diag.js';
import {boot} from '../core/shell.js';
import {sceneRows} from '../core/layout.js';
import {installMenagerie} from '../core/menagerie.js';
import {build} from './build.js';
installErrorHandlers();window.LOAD=LOAD;
configureLoading({
  lines:[
    'Voth is a city of cantons: stepped stone platforms standing in the water, joined by spans and causeways.',
    'It is on the same world as the Krator primer. The gas giant in the sky is Krator.',
    'The chinampas are fields built out into the shallows, one raft of mud at a time.',
    'The silt striders walk their routes between the stations, wading where the water is shallow enough.',
    'The Ancestry canton is a necropolis, climbing in a spiral.',
    'A curtain wall runs round the landward side, with gates where the roads come through.',
    'The mountain behind the city erupts on a cycle of its own.',
  ],
  prefix:'raising the cantons… ',
  labels:{world:'shaping the shore',layout:'laying out the districts',textures:'cutting the stone',cantons:'raising the cantons',
    land:'building on the land',amenities:'furnishing the streets',vegetation:'planting the gardens',life:'waking the city',camera:'lighting the sky'}});
const ctx=window._iz={};
// The fingerprint the tests check is taken as soon as the build is done: the build ends by starting the render
// loop, and the continuation here runs before its second frame, so nothing has moved yet.
boot(async()=>{
  if(!window.THREE){document.getElementById('loading').textContent='Could not load vendor/three/three.min.js.';return;}
  await build(ctx);
  try{if(window._vothScene)ctx.lotList=sceneRows(THREE,window._vothScene);}catch(e){report('fingerprint',e);}
});
// the way back to the menagerie, and into the other scenes: adds nothing unless a server answers /scenes.json
installMenagerie({standalone:true}).catch(()=>{});
