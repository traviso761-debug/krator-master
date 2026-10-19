// ================================================================= HOST — stage (Pinnacle Rock: the mesa, its fins and its Garden)
// The page's renderer, light and floor, and the rock as KSTACKS records (core/terrain/37-core-stacks.js) made from the
// settled layout (40-pr-layout.js). The necanyons kit lays its zones out on this rock and grows on it; the hyperjungle on
// the floor round it; necanyons' land fragment (47, read in place) makes the height, the fields and the meshes, and reads
// what differs here from LAND (below).
//
// WHERE (PLAN.md section 1): the knoll at px 755,351 on the scale model (4.21), a ridge about 6 by 10 km running north and
// south, its top near -325 m over a jungle floor at -900 to -1,450 m; the K'etsaal Baatar 11 km south, the Inner Wall
// rising to 2,800 m 48 km north. The floor here IS the model's (42, WORLD); the mesa stands 250 m over the knoll's ground
// at its south foot (y 0), where the Stair comes down and the farms are. This page is ~4.4 km of the knoll's top; the
// far terrain (86) draws the rest of the cut to 60 km.
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
window._t={t0:performance.now()};const _mark=k=>{window._t[k]=Math.round(performance.now()-window._t.t0);};
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   // BIO.record: the volume as a core/tags record too

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;document.body.appendChild(renderer.domElement);
// THE LIGHT: the hyperjungle's sky (read in place), its sun from the north-west so the south nose and the east fins catch it
// the haze thin enough to see the Inner Wall 40-50 km off (the far terrain, 86), as the jungle's wet air allows on a clear day
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xb2bcb8);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00003);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1.5,90000);
const hemi=new THREE.HemisphereLight(0xc4d0c4,0x4a3a2a,.64);scene.add(hemi);
const SUN_POS=[-1200,900,-600];
const sun=new THREE.DirectionalLight(0xfff0d2,1.45);sun.position.set(...SUN_POS);scene.add(sun);
const fill=new THREE.DirectionalLight(0xc8b8a4,.3);fill.position.set(800,400,900);scene.add(fill);

// ---------------------------------------------------------------- the floor: the knoll's top, as the scale model has it
const TERR={R:2200};
// no creek on this page (necanyons' 47 reads CREEK and creekD): the water is the seep pond and the spring (PR)
const CREEK={x:()=>-1e6,w:8,depth:.6,name:'(none)'};
const creekD=()=>1e9;
// the floor: the model's land (42: WORLD.H, its 4 km cells smoothed and given the jungle's detail), from the knoll's ground
// at the mesa's south foot; the dry gorge cut under the north rim (finer than the model's cells: the plan's, PR.GORGE)
function floorH(x,z){const G=PR.GORGE,d=PR.gorgeD(x,z),ends=smooth(G.x0,G.x0+250,x)*smooth(G.x1,G.x1-250,x);
 return WORLD.H(x,z)-WORLD_H0-G.depth*smooth(G.w+30,G.w-12,d)*ends*(.85+.3*fbm(x*.006,z*.006,31,2));}

// ---------------------------------------------------------------- the rock (KSTACKS records from the layout)
// The mesa's foot is set under the lowest floor round it (the gorge's lip on the north), its rise grown to match, so the
// top stands PR.MESA.top over the south foot whatever the wall goes down to.
const ROCK=(function(){const K=KSTACKS,L=[],M=PR.MESA;
 // the floor's lowest under and round the footprint (r along x and z: the strike is north-south)
 const footY=(x,z,rx,rz)=>{let m=1e9;for(let i=0;i<48;i++){const a=i/48*TAU;for(const k of [.5,.85,1.08])m=Math.min(m,floorH(x+Math.cos(a)*rx*k,z+Math.sin(a)*rz*k));}return m-3;};
 const y0=Math.min(-5,footY(M.x,M.z,M.r/Math.sqrt(M.e),M.r*Math.sqrt(M.e)));
 const mesa=K.make({id:M.id,kind:'butte',x:M.x,z:M.z,y0,seed:M.seed,lobes:M.lobes,weather:M.weather,shoulder:M.shoulder,tiers:[{h:M.top-y0,r:M.r,e:M.e,ry:M.ry}]});
 mesa.name=M.name;L.push(mesa);
 const topB=mesa.beds[mesa.beds.length-1],topY=y=>K.topAt([mesa],y[0],y[1]),_top0=mesa.top;
 // THE SPURS: lower buttresses half into the wall (120-190 m), so the mesa is not a drum: their tops are ledges (the
 // necanyons kit's benches: hanging gardens), their walls break the cliff's line. None on the south nose (the Stair) or
 // under the north fins (the gorge face, the beast lift)
 PR.SPURS.forEach(P=>{const R=K.footR(mesa.beds[0],P.a)*P.k,x=M.x+Math.cos(P.a)*R,z=M.z+Math.sin(P.a)*R;
  const s=K.make({id:P.id,kind:'butte',x,z,y0:Math.min(y0,footY(x,z,P.r,P.r)),seed:P.seed,lobes:.2,weather:1,shoulder:{h:14,back:13,bed:[3,5]},tiers:[{h:P.h-Math.min(y0,footY(x,z,P.r,P.r)),r:P.r,e:1.4,ry:P.a+Math.PI/2}]});
  s.name='A spur of the mesa (a ledge '+Math.round(P.h)+' m up)';L.push(s);});
 // a body on a top is accepted when every point of its foot is on that top and at least `pad` in from its edge
 const footOn=(B,pad,on)=>{const b=B.beds[0];for(let i=0;i<24;i++){const a=i/24*TAU,R=K.footR(b,a),x=b.cx+Math.cos(a)*R,z=b.cz+Math.sin(a)*R,A=K.at([on||mesa],x,z);
  if(!A||A.d>-pad)return false;}return true;};
 // THE FINS: each set in from the rim along its angle until its whole foot is 12 m inside the edge (the no-build band)
 PR.FINS.forEach(F=>{let B=null;for(let k=0;k<12&&!B;k++){const R=K.footR(topB,F.a)*(1-topB.ch)-F.inset-6*k,x=M.x+Math.cos(F.a)*R,z=M.z+Math.sin(F.a)*R;
   const b=K.make({id:F.id,kind:'fin',x,z,y0:topY([x,z])-1.5,seed:F.seed,H:F.H,r:Math.sqrt(F.L*F.w),e:F.L/F.w,ry:F.rot});if(footOn(b,12))B=b;}
  if(!B){reportErr('pinnacle-rock: '+F.id+' finds no room on the top');return;}
  B.name='A fin on the rim ('+F.group+(F.wing?', the '+F.wing+'\'s roosts':', a lookout')+')';B.group=F.group;B.wing=F.wing;L.push(B);});
 // THE GARDEN'S MESA: the inner tier, standing on the main top (its foot set into it), weathered like the mesa
 const GM=PR.GARDEN_MESA,gy0=topY([GM.x,GM.z])-4,inner=K.make({id:GM.id,kind:'butte',x:GM.x,z:GM.z,y0:gy0,seed:GM.seed,lobes:GM.lobes,weather:GM.weather,shoulder:GM.shoulder,
  bed:GM.bed,tiers:[{h:_top0+GM.h-gy0,r:GM.r,e:GM.e,ry:GM.ry}]});
 inner.name=GM.name;inner.garden=true;L.push(inner);
 const innerY=y=>K.topAt([inner],y[0],y[1]);
 // THE HEART: the third mesa, on the Garden's (its foot set into it), half the central pinnacles' height, weathered hardest
 const HM=PR.HEART_MESA,hy0=innerY([HM.x,HM.z])-4,_gtop=_top0+GM.h,heart=K.make({id:HM.id,kind:'butte',x:HM.x,z:HM.z,y0:hy0,seed:HM.seed,lobes:HM.lobes,
  weather:HM.weather,shoulder:HM.shoulder,bed:HM.bed,tiers:[{h:_gtop+HM.h-hy0,r:HM.r,e:HM.e,ry:HM.ry}]});
 heart.name=HM.name;heart.heart=true;L.push(heart);
 // THE GARDEN'S PINNACLES on the inner mesa (the three tallest on the Heart: their tops where the plan has them), and the
 // shrine's balanced rock on the main top
 PR.GARDEN.forEach(G=>{const on=G.on==='heart'?heart:inner,y0=K.topAt([on],G.x,G.z)-1.5;
  const B=K.make({id:G.id,kind:G.kind,x:G.x,z:G.z,y0,seed:G.seed,H:G.H-(y0+1.5-_gtop),r:G.r,e:G.kind==='fin'?3.2:null});
  if(!footOn(B,on===heart?2:6,on)){reportErr('pinnacle-rock: '+G.id+' is off the '+(on===heart?'Heart':'Garden\'s mesa'));return;}
  if(on===inner&&K.at([heart],G.x,G.z)){reportErr('pinnacle-rock: '+G.id+' stands in the Heart');return;}
  B.name=G.kind==='balanced'?'A balanced rock on the Garden\'s mesa':G.kind==='fin'?'A fin on the Garden\'s mesa':'A pinnacle of the Garden ('+Math.round(G.H)+' m)';
  B.ring=!!G.ring;L.push(B);});
 {const G=PR.SHRINE_ROCK,B=K.make({id:G.id,kind:G.kind,x:G.x,z:G.z,y0:topY([G.x,G.z])-1.5,seed:G.seed,H:G.H,r:G.r});
  if(footOn(B,8)){B.name='The balanced rock of the Winged Ones\' shrine';L.push(B);}else reportErr('pinnacle-rock: the shrine\'s rock is off the top');}
 return L;})();
const MESA_B=ROCK[0],GARDEN_B=ROCK.find(B=>B.garden),HEART_B=ROCK.find(B=>B.heart);
const TOWN_GROUND=[MESA_B,GARDEN_B];   // the tops the town stands on (no trees past their rim bands)

// ---------------------------------------------------------------- what necanyons' land fragment (47) reads from this page
// the mesa's top is a cap (dry, bare: the town's ground); the LOD spine follows the rock and the floor's grounds; the
// hyperjungle keeps out of the farms, the bands' grounds, the fair ground and the road, and stands thin on the cleared
// ground (PR.forest)
// THE DEBRIS SLOPE round the walls' feet (the owner's Monument Valley butte, 2026-10-19): the cliff stands on a rough
// slope of its own fall, about 34 degrees, 55-85 m high against the wall and ~115 m out, in ledge bands (steep risers,
// gentler treads), lumpy; the floor mesh fine enough (11 m) to show it
const TALUS={w:125,h:(x,z,fd)=>{fd=Math.max(0,fd);const Ht=70+15*(fbm(x*.004+5,z*.004-3,46,2)-.5)*2,W=Ht/Math.tan(34*Math.PI/180),base=Ht*Math.max(0,1-fd/W);
 const q=base/9,fl=Math.floor(q),fr=q-fl,step=9*(fl+(fr<.4?fr*2:.8+(fr-.4)/3));   // a ledge band every 9 m: riser, then tread
 return (step+3.2*(fbm(x*.03,z*.03,47,2)-.5)*2*Math.min(1,base/6))*smooth(W+10,W-15,fd);}};
const LAND={capY:240,tags:'pinnacle-rock',creek:false,clear:(x,z)=>PR.forest(x,z),talus:TALUS,groundN:440,wallStep:3.5,
 spine:[[0,0],[0,-560],[0,600],[-560,-90],[0,1000],[-900,300],[900,300]]};
