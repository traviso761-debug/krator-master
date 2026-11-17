// ================================================================= HOST — stage (Korona, station 7: SILKHEAD GORGE AND THE HOAR-TABLE RIM)
// The same host as station 1's (src/45-host-stage.js) with another landform and another STAGE: 47 (the land) is shared.
// Gemini's 5.1 showcase station #7 (biomes/korona/PLAN.md, "Showcase Station #7"; openworld/GEOLOGY-STATIONS-5.1.md row 7).
//
// WHERE: scale model 5.1 px (1096, 526) (old canvas 824, 196): the corona's central table, its rim over the ring trench to the east
// and south. THE SPEC'S HEIGHTS, NOT TODAY'S MODEL'S: the spec puts the rim at +3,620 m (0.99 atm, Dsc/Cwb: the hoar-table mist and the
// frost-tank pavement) and the trench at -1,180 m (1.86 atm, XA/Af: the pitcher rainforest and the ring-fault vents), 4,800 m of tiered
// wall; today's model has the table at 1,430-1,570 m there and the trench at -1,180 to -1,400 m within 14 km east (KNOWN_ISSUES.md: the
// map change is queued for the scale model, never made here). The model's setting is kept: the trench lies east and south of the table.
// The obsidian pancake dome is the station's own, a small one (1.3 km) on the trench floor below the rim: the model's dome 4 (16 km,
// 5.1 px 1179, 578, scale model 5.1 edit 2) is 196 km to the south-east and edit 2 is not on this branch's model (KNOWN_ISSUES.md).
//
// THE MAP (x east, z south, y up from the trench floor: y 0 is -1,180 m, the rim y 4,800 is +3,620 m; R 1700: a 3.4 km square from the spur's tip to past the dome, the far field to 9 km).
//   THE TABLE       the hoar table, a tepui of five tiers whose rim runs north and south down the west of the page (its body
//                   centred 6 km west: only its scarp is on the page), each tier stepping back 120-140 m: the benches at 1,450,
//                   2,850 and 4,200 m over the floor (+270, +1,670, +3,020 m), the summit wall 560 m, the cap 40 m
//   THE SPUR        a blade of the table running out ESE 3 km, the same tiers; under its cap the ledge (the bedding recess) runs
//                   round it at y 4,760 (+3,580 m): THE LIP over THE VERTIGO CAMERA (a KCARVE alcove on the ledge near its tip)
//   THE SILKHEAD    the tower beside the spur to its south, its summit 600 m over the col that joins the two at y 4,200:
//                   SILKHEAD GORGE between them, 180 m at its narrows, the silk spans and the ladder bridge across it
//   THE VEILS       the Silkhead's north face: a mist-veil 600 m from its rim to the col's bench, then three cascades down the
//                   tiers to the trench lake at its foot (4,800 m of water, the fog belt on the walls)
//   THE TRENCH      the floor 4.7 km below: the pitcher rainforest (the hyperjungle and the man-eaters), the trench lake, and
//                   THE DOME, an obsidian pancake (KSTRATA obsidian-pancake) steaming over its fissures, its black pitcher pools
//   THE ROCK        KSTRATA: contact-marble (the skarn on the ring-fault dike contact) on the walls' lowest 550 m, the tepui's
//                   quartzite above, obsidian-pancake east of x 20 (the dome) as a lateral stack
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
window._t={t0:performance.now()};const _MARKS=/[?&]marks=1/.test(location.search);const _mark=k=>{window._t[k]=Math.round(performance.now()-window._t.t0);if(_MARKS)console.warn('[mark] '+k+' '+window._t[k]);};   /* ?marks=1: each stage's time on the console as it ends */
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;document.body.appendChild(renderer.domElement);
// THE LIGHT: thin cold air at the rim, the trench's dense golden haze 4.7 km below (the shared sky drives these by the hour: 89-host-sky.js)
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xc8bc98);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00011);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,16000);
const hemi=new THREE.HemisphereLight(0xd8dce0,0x5a5248,.66);scene.add(hemi);
const SUN_POS=[-1200,900,-600];
const sun=new THREE.DirectionalLight(0xfff2dc,1.55);sun.position.set(...SUN_POS);scene.add(sun);
const fill=new THREE.DirectionalLight(0xc8c0b0,.3);fill.position.set(800,400,900);scene.add(fill);

// ---------------------------------------------------------------- the frame
const TERR={R:1700};
const ELEV0=-1180,RIM_Y=4800,LEDGE_Y=4760,COL_Y=4200;   /* y 0 is -1,180 m; the rim +3,620 m; the camera's ledge +3,580 m */
const AX=[Math.cos(.3927),Math.sin(.3927)],PP=[-AX[1],AX[0]];   /* the spur's axis (ESE) and its right hand (SSW) */
const WIND=[AX[0],AX[1]];   /* the trench's wet air comes up the scarp from the east-south-east: the faces turned to it are windward (the spec's 3,500-4,000 mm) */
const S0=[-2100,-1150],T_OFF=722,T_U=1150,T0=[S0[0]+T_OFF*PP[0]+T_U*AX[0],S0[1]+T_OFF*PP[1]+T_U*AX[1]],TC=[-6600,-200];
const tier=(h,rx,rz,ry)=>({h,r:Math.sqrt(rx*rz),e:rx/rz,ry});
const RY=.3927;
const TIERS={
 table:[tier(1455,4400,4400,0),tier(1400,4280,4280,0),tier(1350,4160,4160,0),tier(560,4050,4050,0),tier(40,4020,4020,0)],
 spur:[tier(1455,1700,460,RY),tier(1400,1640,420,RY),tier(1350,1580,390,RY),tier(560,1530,330,RY),tier(40,1490,290,RY)],
 /* the Silkhead has no cap: its rim at 4,800 is the veil's lip, 600 m over the col's bench */
 tower:[tier(1455,1250,620,RY),tier(1400,1180,540,RY),tier(1350,1110,470,RY),tier(600,1040,320,RY)]};
// THE PLAN BEFORE THE FLOOR: the bodies' outlines do not depend on their feet, so a first make at y0 0 gives the places the floor's lake and
// pools are cut at (the veils' foot is the Silkhead's north foot)
const plan=(id,x,z,seed)=>KSTACKS.make({id,kind:'mesa',x,z,y0:0,seed,bed:id==='table'?[110,220]:[80,160],lobes:.01,weather:.5,tiers:TIERS[id]});
const VEIL_U=780;   /* the veils' line on the Silkhead's north face, metres along its axis from its centre */
const VEIL=(function(){const B=plan('tower',T0[0],T0[1],7103),b=B.beds[0],x=T0[0]+VEIL_U*AX[0],z=T0[1]+VEIL_U*AX[1];
 /* the north face at the veils' line: the angle about the tower's centre toward a point well north of the axis there */
 const px=x-PP[0]*900,pz=z-PP[1]*900,a=Math.atan2(pz-T0[1],px-T0[0]),R=KSTACKS.footR(b,a);
 return{a,foot:[T0[0]+Math.cos(a)*R,T0[1]+Math.sin(a)*R],n:[Math.cos(a),Math.sin(a)]};})();
// THE TRENCH LAKE at the veils' foot (endorheic: the cascade's water stays in the trench), and THE BLACK PITCHER POOLS by the dome
const DOME={x:820,z:420,r:640,H:150,name:'The obsidian pancake dome (a small one, 1.3 km: glass-skinned rhyolite on the trench floor)'};
const LAKE={x:VEIL.foot[0]+VEIL.n[0]*200,z:VEIL.foot[1]+VEIL.n[1]*200,r:230,bed:false,name:'The trench lake (the veils\' water, endorheic)'};
const POOLS=(function(){const o=[LAKE];
 for(let i=0;i<9&&o.length<7;i++){const r=KRAND.stream(KRAND.hash(7301,i,7)),a=r.range(-.9,2.2),d=DOME.r*r.range(1.12,1.45),pr=r.range(22,48),x=DOME.x+Math.cos(a)*d,z=DOME.z+Math.sin(a)*d;
  if(o.some(p=>Math.hypot(p.x-x,p.z-z)<p.r+pr+30))continue;o.push({x,z,r:pr,bed:true,name:'A black pitcher pool (the dome\'s apron: tannin-black water, trap pads on it)'});}
 return o;})();
const poolD=(x,z)=>{let m=1e9;for(const p of POOLS){const d=Math.hypot(x-p.x,z-p.z)-p.r;if(d<m)m=d;}return m;};
const domeD=(x,z)=>Math.hypot(x-DOME.x,z-DOME.z)-DOME.r;
// ---------------------------------------------------------------- the trench floor
// long swells and a finer roughness, falling gently to the south-east; each pool a basin (a lake 7 m deep, a pitcher pool 3); beyond R the
// trench runs on into the haze (the far field carries this function to 9 km)
function floorBase(x,z){let h=16*(fbm(x*.0007+3.1,z*.0007-1.7,17,3)-.5)*2+5*(fbm(x*.004-2,z*.004+5,29,2)-.5)*2-.004*(x+z);
 for(const p of POOLS){const d=Math.hypot(x-p.x,z-p.z);if(d<p.r*1.4)h-=(p.bed?3:7)*Math.pow(smooth(p.r*1.3,p.r*.6,d),1.3);}return h;}
function floorH(x,z){return floorBase(x,z);}

// ---------------------------------------------------------------- the rock (KSTACKS records: core/terrain/37-core-stacks.js)
const ROCK=(function(){const K=KSTACKS,L=[];
 const footY=(x,z,r)=>{let m=1e9;for(let i=0;i<32;i++){const a=i/32*TAU;for(const k of [.4,.8,1.15])m=Math.min(m,floorH(x+Math.cos(a)*r*k,z+Math.sin(a)*r*k));}return m-3;};
 const add=(B,name)=>{B.name=name;L.push(B);return B;};
 const mesa=(id,x,z,seed,r)=>{const y0=footY(x,z,r),T=TIERS[id].slice();T[0]=Object.assign({},T[0],{h:T[0].h-5-y0});   /* every tier's top at its height over y 0 whatever the foot */
  return K.make({id,kind:'mesa',x,z,y0,seed,bed:id==='table'?[110,220]:[80,160],lobes:.01,weather:.5,tiers:T});};
 add(mesa('table',TC[0],TC[1],7101,4400),'The hoar table (a tepui: 4,800 m of tiered quartzite over the trench)');
 add(mesa('spur',S0[0],S0[1],7102,1700),'The spur (a blade of the table running out over the trench; the ledge under its cap)');
 add(mesa('tower',T0[0],T0[1],7103,1250),'The Silkhead (the tower beside the spur, joined to it at the col 600 m under its rim)');
 // THE DOME: a pancake (KSTACKS dome: steep-sided and flat-topped at k 5), its foot on the floor
 add(K.make({id:'dome',kind:'dome',x:DOME.x,z:DOME.z,H:DOME.H,r:DOME.r,k:5,e:1.08,ry:.6,seed:7104,sheet:[4,9],ground:floorH}),DOME.name);
 return L;})();
const TABLE=ROCK[0],SPUR=ROCK[1],TOWER=ROCK[2],DOMEB=ROCK[3];_mark('stage-rock');
// THE QUICK REJECT (station 7 only): these bodies are kilometres across and 30-50 beds deep, and KSTACKS.at asks every bed of every body whose box
// holds the point, top down, before it answers "the floor": at 1.1 M layout cells (NECANYONS.lay, 5 m over this page) that was 3 minutes of a
// load. Every bed of these bodies lies inside its lowest bed (each tier is narrower than the one below, the jitter and the weathering a metre or
// two, a percent of the radius), so a point 3% and 30 m outside the lowest bed's outline is on no bed: the wrapper skips that body, and answers
// as KSTACKS.at does for every other point (the same record, the same top). Only the exported KSTACKS.at is wrapped: the core's own calls inside
// 37 are unchanged. ?reject=0 leaves it
if(new URLSearchParams(location.search).get('reject')!=='0'){const _at=KSTACKS.at,K=KSTACKS,OWN=new Set(ROCK),near=(B,x,z)=>{const b=B.beds[0],dx=x-b.cx,dz=z-b.cz;
  if(Math.abs(dx)>B.R||Math.abs(dz)>B.R)return false;return Math.hypot(dx,dz)<K.footR(b,Math.atan2(dz,dx))*1.03+30;};
 KSTACKS.at=function(list,x,z){let L=list;for(let i=0;i<list.length;i++){const B=list[i];if(OWN.has(B)&&!near(B,x,z)){L=list.filter(q=>!OWN.has(q)||near(q,x,z));break;}}return L.length?_at(L,x,z):null;};}
const capBed=B=>B.beds[B.beds.length-1];
// THE LIP (core/terrain KCARVE, 36-core-carve.js): an alcove carved through the spur's ledge near its tip, its hood the cap's rock run out over the
// ledge to the drop, its mouth on the ledge's very edge to the south-south-east (a camera inside the ledge would see only the ledge: the eye has
// to stand at the edge for the 4.7 km to open under it). The ledge's edge is found along the hood's axis (KSTACKS.at: where the ledge's top
// ends); the void runs from the mouth back to 1.5 m short of the cap's face. The patch's ground: the hood's top (the cap's) behind its mouth,
// nothing in front (the drop); its open foot (the grid's floor, 1.5 m under the void's) is inside the ledge's rock
const LIP=(function(){const cb=capBed(SPUR),u=1350,s=200,px=S0[0]+u*AX[0]+s*PP[0],pz=S0[1]+u*AX[1]+s*PP[1],a=Math.atan2(pz-cb.cz,px-cb.cx);
 const w=KSTACKS.wall(SPUR,cb,a,0),n=[w.nx,w.nz],top=cb.y+cb.h,ledge=cb.y,flY=ledge-.2;
 let edge=0;for(let t=1;t<90;t+=.25){const q=KSTACKS.at(ROCK,w.x+n[0]*t,w.z+n[1]*t);if(!q||q.top<ledge-3){edge=t;break;}}
 const D=Math.max(8,edge-2.5-1.5),HW=12,H=9,c=[w.x+n[0]*(edge-2.5),w.z+n[1]*(edge-2.5)];
 const Q=KCARVE.add({id:'silkhead-lip',kind:'alcove',c,n,hw:HW,depth:D,h:H,floorY:flY,mouth:2.5,margin:5.5,pad:2,cell:.5,
  base:(x,z)=>{const L=KCARVE.local(Q,x,z);return L.q>-2.5?top:flY-1.6;},name:'The lip (a carved alcove under the cap at the ledge\'s edge: the Hum\'s look-out over the trench)'});
 return{Q,c,n,a,ledge,top,floorY:flY,wall:w,edge,eye:[c[0]+n[0]*1.9,flY+1.7,c[1]+n[1]*1.9]};})();
const lipBare=(x,z)=>KCARVE.planSD(LIP.Q,x,z)<LIP.Q.margin+1.5?1:0;
// the summit: the table's, the spur's and the Silkhead's tops over the col (the hoar-table pavement)
const summitK=(x,z)=>{const t=NECANYONS.top?NECANYONS.top(x,z):-Infinity;return smooth(COL_Y-60,COL_Y+40,t);};
const upK=(x,z)=>clamp(terrainH(x,z)/RIM_Y,0,1);   /* 0 on the trench floor, 1 at the rim */

// ---------------------------------------------------------------- the station's say: STAGE (47 reads it)
const STAGE={
 name:'Korona: Silkhead Gorge and the hoar-table rim',R:TERR.R,bodies:ROCK,floor:floorH,capY:RIM_Y-120,seed:17,talusH:28,heroR:600,
 climate:{wet:true},air:{pressure:.99,trench:1.86,elev0:ELEV0},stream:null,streamD:()=>1e9,pools:POOLS,
 rimCh:.0012,   /* the tiers' tops keep their edges: 47's default (.06 of a radius) would round 250 m off a 4 km tier and close the ledge */
 // KSTRATA (47's rock shader): contact-marble on the walls' lowest 550 m (the skarn where the ring-fault dike cut the buried carbonate lens),
 // the tepui's quartzite above, and east of x 300 a lateral stack of obsidian-pancake (the dome); res .5 m for 4.8 km of column
 strata:{formations:[{recipe:'contact-marble',top:550},{recipe:'tepui'}],lateral:{recipe:'obsidian-pancake',dir:[1,0],at:[20,0],d0:0,d1:60},res:.5},
 windward:(x,z)=>{/* the faces turned to the east-south-east, and the ground before them: the nearest body's outward bearing against the wind */
  const B=NECANYONS.at(x,z).B;if(!B)return .8;const a=Math.atan2(z-B.z,x-B.x);return smooth(-.4,.6,Math.cos(a)*WIND[0]+Math.sin(a)*WIND[1]);},
 wetExtra:(x,z)=>.55*smooth(50,4,poolD(x,z)),
 // the dense hot air of the trench (1.86 atm, 30 degC) falling to the hoar table's cold (+3,620 m): by height
 warm:(x,z)=>clamp(1-.92*upK(x,z),.05,1),
 // the alluvium: the trench floor's bottoms away from the dome's pumice apron; pockets of soil on the benches; none on the summit
 rich:(x,z)=>{const t=NECANYONS.top(x,z);if(t>-1e8)return t>COL_Y-60?.12*smooth(.6,.75,fbm(x*.013+2,z*.013-6,51,2)):.35*smooth(.6,.75,fbm(x*.011+2,z*.011-6,51,2));
  return clamp(.5*smooth(.45,.62,fbm(x*.0018-4,z*.0018+1,52,3))*smooth(60,260,domeD(x,z)),0,1);},
 poorExtra:(x,z)=>.35*smooth(300,40,domeD(x,z)),   /* glass and pumice: the poorest ground in Korona (PLAN.md, the domes' amendment) */
 // the summit's wet hollows: the hoar-table mist and the rain pools on the pavement (the frost tanks' and butterworts' ground); none below the col
 bogAt:(x,z)=>{const t=NECANYONS.top(x,z);if(!(t>COL_Y-60))return 0;const q=NECANYONS.potholeAt(x,z),near=q?1:0;
  return clamp(.85*near+.6*smooth(.5,.64,fbm(x*.012+5,z*.012+1,53,2)),0,1)*(1-lipBare(x,z));},
 bare:(x,z)=>lipBare(x,z),
 // the floor's layers (47): the jungle's litter, the pumice and quartz scree at the walls' feet and on the dome's apron, the pools' black mud
 layers:{a:'ground.litter',b:'ground.talus',c:'ground.sand'},layerCol:[0x3a3a28,0x8a8278,0x3a3530],layerMul:[[1,1,.92],[1.05,1.02,.98],[.55,.52,.5]],
 weights:(x,z)=>{const fd=NECANYONS.footD(x,z),dd=domeD(x,z);return[Math.max(smooth(48,4,fd),smooth(260,30,dd))*(.7+.3*fbm(x*.02,z*.02,41,2)),smooth(40,6,poolD(x,z))];},
 rockCol:{band:[0x8a7f78,0x9a8e86,0x7a6e68,0xa89c94],top:0xa39890,soil:0x6a5a48},waterCol:0x0e120e,
 floorLabel:'The trench floor (-1,180 m, 1.86 atm: the pitcher rainforest)',waterLabel:'Water (a rain pool on the pavement; a black pitcher pool; the trench lake)',
 // the hyperjungle on the trench floor, off the dome's apron; the canyons' kit on the walls (thin: 4.8 km of wall); the highlands' on the summit
 jungle:(x,z)=>smooth(80,300,domeD(x,z))*mix(.55,1,smooth(.2,.8,STAGE.windward(x,z))),jungleQ:.4,necQ:.35,
 high:(x,z)=>summitK(x,z)*(1-lipBare(x,z)),highQ:.35,
 fields:{cold:(x,z)=>clamp(.25+.65*summitK(x,z),0,1),sun:(x,z)=>.65,bog:(x,z)=>STAGE.bogAt(x,z),mother:(x,z)=>0,geo:(x,z)=>0,gully:(x,z)=>0,tarn:(x,z)=>0},
 // the traps by height: the cold ones on the summit, the man-eaters on the hot floor; nothing warm on the hoar table
 bias:{butterwort:1,frosttank:1,greatsundew:.8,cobralily:.8,maneater:1.2,coiltendril:1,bloodtrumpet:1,groundstar:1,snareflower:1,bloodbulb:1,punjipit:.6,beartrap:.6,numbthorn:.8},
 // THE CARVINGS: the Hum's contour carvings on the spur's cap, above the ledge (the bedding recess) beside the lip, toward the spur's tip
 carvings:(function(){const cb=capBed(SPUR),ang=(u,s)=>Math.atan2(S0[1]+u*AX[1]+s*PP[1]-cb.cz,S0[0]+u*AX[0]+s*PP[0]-cb.cx);
  const A=ang(1462,40),B=ang(1378,140);
  return{body:'spur',bed:SPUR.beds.length-1,a0:Math.min(A,B),a1:Math.max(A,B),y0:1.7,h:3.2,name:'Contour carvings: the Hum (whistle-script cut along the bedding recess under the cap, beside the lip)'};})(),
 belt:{y0:3650,y1:RIM_Y+60,windward:WIND,density:.0011},   /* the fog belt hugging the upper walls and spilling off the lip (89a) */
 // THE LOD SPINE (BIO.lodD: the kits place at full detail near these points and stop past the mid ring): the lip and the spur's tip, the gorge's
 // spans, the veils' foot and the lake, the dome; the rest of the 4.8 km walls and the far floor are seen from kilometres off
 spine:[[LIP.c[0],LIP.c[1]],[S0[0]+880*AX[0]+330*PP[0],S0[1]+880*AX[1]+330*PP[1]],[LAKE.x,LAKE.z],[DOME.x,DOME.z]],
};
