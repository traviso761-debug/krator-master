// ================================================================= HOST — stage (Korona, station 6: THE HOAR TABLE)
// The same host as station 1's (src/45-host-stage.js) with another landform and another STAGE: 47 (the land) is shared.
//
// WHERE (biomes/korona/NOTES.md, "The high cold country"): the 40% of Korona above 3,000 m, on the outer rim's flank:
// BSk, Dsc and BWk, 62 mm of rain, 5 degC and -24 in winter, 0.6 to 1 atm. A tepui whose summit stands above 3,500 m:
// ET on top, in cloud and wind, the giant huge and sharp in the thin air and giantshine on the snow at night. The rule
// in the cold: the only wet is meltwater on frost-shattered rock, so the traps shrink to the melt pools' margins
// (butterworts, frost tanks) and nothing on the table eats more than a fly. The winter-modded tribes (the owner,
// 2026-10-19) live on tables like this one: their road-marks are cut under the rim.
//
// THE MAP (x east, z south, y up from the summit; R 1600).
//   THE TABLE       one body, its top filling the page: frost-shattered pavement, the eastern highlands' cushions and
//                   snow wool (their kit, read in place), knolls, the Mother Cushion over one of them
//   THE MELT POOLS  in the windward hollows: butterwort lawns and frost tanks round them; a frozen tarn in the west
//   THE SNOW BANKS  permanent snow in the lee hollows (the snow layer on the top mesh)
//   THE RIM         the drop: 560 m of wall into cloud; the carvings under the rim on the north face
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
window._t={t0:performance.now()};const _mark=k=>{window._t[k]=Math.round(performance.now()-window._t.t0);};
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;document.body.appendChild(renderer.domElement);
// THE LIGHT: thin air, a hard white sun, the cloud sea below in a pale haze
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xd4dce4);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00034);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,14000);
const hemi=new THREE.HemisphereLight(0xdce6f0,0x5a5a60,.7);scene.add(hemi);
const SUN_POS=[-1200,900,-600];
const sun=new THREE.DirectionalLight(0xfff8f0,1.7);sun.position.set(...SUN_POS);scene.add(sun);
const fill=new THREE.DirectionalLight(0xc8d4e0,.35);fill.position.set(800,400,900);scene.add(fill);

// ---------------------------------------------------------------- the table
const TERR={R:1600};
const WIND=[-Math.SQRT1_2,-Math.SQRT1_2];
const DROP=560;   // the wall's height: the page's floor is the gorge floor in cloud, far below the summit at y 0
// the gorge floor under the cloud: nothing to see, nothing grows on it (the mask bars it)
function floorBase(x,z){return -DROP+12*(fbm(x*.0009+3.1,z*.0009-1.7,17,3)-.5)*2;}
function floorH(x,z){return floorBase(x,z);}
// THE MOTHER CUSHION's knoll and THE TARN, on the top (the kit's own fields read them)
const MOTHER={x:380,z:-420,r:230,h:38,peak:58,name:'The Mother Cushion (one plant over a knoll)'};
const TARN={x:-760,z:180,r:120};
// THE MELT POOLS in the windward (north-west) hollows of the top
const POOLS=(function(){const o=[{x:TARN.x,z:TARN.z,r:TARN.r,bed:false,ice:true,name:'The frozen tarn'}];   /* ice: 47 draws it as a plate of ice, not water */
 for(let i=0;i<7;i++){const r=KRAND.stream(KRAND.hash(8101,i,7)),a=r.range(Math.PI*.9,Math.PI*1.7),d=250+900*Math.sqrt(r.next()),x=Math.cos(a)*d,z=Math.sin(a)*d,pr=r.range(9,24);
  if(o.some(p=>Math.hypot(p.x-x,p.z-z)<p.r+pr+40)||Math.hypot(x-MOTHER.x,z-MOTHER.z)<MOTHER.r+pr+30)continue;o.push({x,z,r:pr,bed:false,name:'A melt pool'});}return o;})();
const poolD=(x,z)=>{let m=1e9;for(const p of POOLS){const d=Math.hypot(x-p.x,z-p.z)-p.r;if(d<m)m=d;}return m;};
const motherK=(x,z)=>smooth(MOTHER.r*1.15,MOTHER.r*.55,Math.hypot(x-MOTHER.x,z-MOTHER.z));

// ---------------------------------------------------------------- the rock (KSTACKS records): the table is one body
const ROCK=(function(){const K=KSTACKS,L=[];
 const add=(B,name)=>{B.name=B.plates?'A pile of plates (Roraima\'s kind: thin beds, deep partings, a top-heavy head)':name;L.push(B);return B;};   /* plates: KSTACKS, Roraima's piles */
 const T=add(K.make({id:'table',kind:'mesa',x:0,z:0,y0:-DROP-3,seed:8201,bed:[70,130],lobes:.24,weather:.9,tiers:[{h:DROP+3,r:1480,e:1.08,ry:.3}]}),'The hoar table (a tepui summit above the cloud)');
 // the knolls on its top: the Mother Cushion's and three more (the top's own relief: the pavement's hummocks)
 return L;})();
const TABLE=ROCK[0];
// THE TOP's relief: KSTACKS tops are flat with a little roughness; the knolls and the pools' dips are added by the stage
// through the layout's top (47 reads terrainH from NECANYONS.top): a hook the host gives the layout (STAGE.topExtra)
const knolls=(x,z)=>{let h=0;[[380,-420,230,38],[-300,600,180,16],[700,500,150,12],[-900,-700,200,14]].forEach(k=>{const d=Math.hypot(x-k[0],z-k[1]);h+=k[3]*Math.pow(smooth(k[2],0,d),1.5);});
 /* a pool is a basin: its dip deeper for the tarn (3.6 m) than a melt pool (2), the pavement's roughness damped inside it so the
    ice and the water show as plates with a rim (the owner, 2026-10-19: the frozen tarn did not read) */
 const pd=poolD(x,z),td=Math.hypot(x-TARN.x,z-TARN.z)-TARN.r,inP=smooth(26,-8,pd),dip=mix(2,3.6,smooth(30,-10,td));
 return h+2.5*(fbm(x*.004+1,z*.004-2,81,3)-.5)*2*(1-.8*inP)-dip*inP;};

// ---------------------------------------------------------------- the station's say: STAGE (47 reads it)
const STAGE={
 name:'Korona: the hoar table',R:TERR.R,bodies:ROCK,floor:floorH,capY:TABLE.top-80,seed:16,talusH:0,heroR:1600,
 stream:null,streamD:()=>1e9,pools:POOLS,topExtra:knolls,
 windward:(x,z)=>.55+.45*smooth(400,-400,(x+z)*Math.SQRT1_2),
 wetExtra:(x,z)=>.45*smooth(60,8,poolD(x,z)),
 // ET: nothing on the table is warm; the gorge floor below is in cloud and out of the page's life
 warm:(x,z)=>.12,
 rich:(x,z)=>.3*smooth(.6,.75,fbm(x*.013+2,z*.013-6,51,2)),
 poorExtra:(x,z)=>.2,
 // the melt pools' margins and the windward hollows: the bog (sphagnum here is the cushion bog's turf)
 bogAt:(x,z)=>clamp(.9*smooth(70,12,poolD(x,z))+.5*smooth(.55,.68,fbm(x*.012+5,z*.012+1,53,2))*smooth(400,-400,(x+z)*Math.SQRT1_2),0,1)*(1-motherK(x,z)),
 // permanent snow in the lee hollows (south-east), on the lee of every knoll, none on the Mother Cushion
 snowAt:(x,z)=>clamp(.85*smooth(.48,.6,fbm(x*.009-3,z*.009+4,54,3))*smooth(-500,500,(x+z)*Math.SQRT1_2)*(1-.8*smooth(30,0,poolD(x,z))),0,1)*(1-motherK(x,z)),
 layers:{a:'ground.talus',b:'ground.snow',c:'ground.sand'},layerCol:[0x7a7a78,0xf0f4f8,0xa8a8a4],
 weights:(x,z)=>[0,0],
 rockCol:{band:[0x8a8a88,0x9a9a98,0x7a7a78,0xa8a8a4],top:0xa8a8a4,soil:0x6a6a68},waterCol:0xb8ccd8,
 floorLabel:'The gorge floor, in cloud',waterLabel:'A melt pool (ice at its edge); the frozen tarn',
 // no rainforest, no canyons' kit (their plants are the warm rings'); the highlands' kit on the whole top
 jungleQ:0,necQ:0,high:(x,z)=>1-motherK(x,z)*.9,highQ:.45,
 // the highlands kit's fields (biomes/ehighlands: bog, mother, geo, gully, sun, tarn, cold) and the Mother Cushion's window
 fields:{cold:(x,z)=>clamp(.55+.25*smooth(.4,.7,fbm(x*.005+2,z*.005-1,55,2))+.2*STAGE.snowAt(x,z),0,1),sun:(x,z)=>.6,bog:(x,z)=>STAGE.bogAt(x,z),mother:(x,z)=>motherK(x,z),geo:(x,z)=>0,gully:(x,z)=>0,tarn:(x,z)=>smooth(TARN.r*1.5,TARN.r*.95,Math.hypot(x-TARN.x,z-TARN.z))},
 windows:{mother:[MOTHER.x-MOTHER.r*1.3,MOTHER.z-MOTHER.r*1.3,MOTHER.x+MOTHER.r*1.3,MOTHER.z+MOTHER.r*1.3]},
 bias:{butterwort:1,frosttank:1,lacepitcher:.5,rainbowfan:.25,stormpod:1,cointree:.3,wallfern:0,lacefan:0,greatsundew:0,cobralily:0,bloodbulb:0,bloodtrumpet:0,maneater:0,coiltendril:0,groundstar:0,punjipit:0,beartrap:0,numbthorn:0,snareflower:0},
 carvings:{body:'table',bed:TABLE.beds.length-1,a0:-2.4,a1:-1.4,y0:TABLE.beds[TABLE.beds.length-1].h-9,h:3,name:'Contour carvings: the Hum (an ice tribe\'s road-marks, cut under the rim)'},
 spine:(function(){const S=[[0,0]];for(let k=0;k<8;k++){const a=k/8*TAU;S.push([Math.cos(a)*1000,Math.sin(a)*1000]);}POOLS.forEach(p=>S.push([p.x,p.z]));S.push([MOTHER.x,MOTHER.z]);return S;})(),
};
