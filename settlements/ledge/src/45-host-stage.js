// ================================================================= HOST — stage: the renderer, the lights, Ledge's own ground
// The page's frame is the layout's (PLAN.md 9.2): x east along the face, z south out of it, y metres above sea level.
//
// THE GROUND is LEDGE.groundAt (31-ledge-rules.js): the head's bench, the face the Ancients dressed sheer, the apron and the lake's
// bed, the natural rift-fill cliff beyond the dressed face and the escarpment easing up to the tableland. Meshed on two grids:
// the near one (|x|, |z| < 3 km) with columns every 6 m along the face and rows every 8 m, a pair of rows either side of the dressed
// face and the quay so both stand sheer; the far one (to 12 km, 200 m cells) for the escarpment, the north shore and the lake.
// KDRAWN gets the near grid's triangles (the eye check measures what is drawn).
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0xb9c4c8,.00005);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,60000);
const hemi=new THREE.HemisphereLight(0xd6e2e4,0x6a5e50,.66);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff0d8,1.3);sun.position.set(-2600,4200,3600);scene.add(sun);
const fill=new THREE.DirectionalLight(0xbfd2ff,.25);fill.position.set(2000,1500,-2600);scene.add(fill);
/* the kit's night switch (kits/ancients 92-camera.js): no night state here yet */
let NIGHT=false;
const LEDGE_H=(x,z)=>LEDGE.groundAt(LEDGE_LAYOUT,x,z);

// THE ROCK and THE GROUND: the cliff city's (kits/ancients/cliff/30-cliff-ground.js, KCLIFF.rock and KCLIFF.ground, lifted from this fragment
// on 2026-11-22). The rock: KSTRATA's 'rift-redbeds' (the basin fill's red beds, drawn halfway to a warm tan) on the faces, the library's grain
// (materials.json: bedded gypsum on the natural cliff, the drill-marked cut on the dressed face and the benches, turf on the high flats,
// gravelly sand on the low ones). The colours of the flats: the head's turf, the apron's pale Ancient paving, the shore's gravel, the
// lake's bed, by KRAND's noise.
const LEDGE_ROCK=(function(){const G=LEDGE_LAYOUT.ground;
 return {mat:KCLIFF.rock({recipe:'rift-redbeds',seed:4373,range:[G.lake-200,G.top],pack:'ledge',lib:{wall:'cliffWall',dressed:'faceDressed',flat:'turf',low:'shore'},
  lowY:[330,420],tanMix:.45,key:'ledge-rock'})};})();
const LEDGE_GROUND=(function(){const G=LEDGE_LAYOUT.ground;
 return KCLIFF.ground({H:LEDGE_H,page:G.page,far:G.far,xDense:1000,zDense:[-1000,700],dx:[6,30],dz:[8,30],xBands:[[-3000,-700,10]],zBands:[[-3000,-250,10]],rows:[-.05,.05,G.quay-.05,G.quay+.05],
  dressed:(x,z,y)=>Math.abs(x)<G.dressed-10&&z>-30&&z<=G.quay+.1&&y<G.head-1?1:0,
  colour:(x,y,z,n,dr)=>dr&&y<G.apron+.5&&y>G.apron-.5?[.74+.05*n,.72+.05*n,.68+.04*n]:y<G.lake-.5?[.42,.40,.33]:y<G.lake+30?[.58+.06*n,.53+.05*n,.43]:y<1400?[.36+.08*n,.44+.07*n,.25]:[.42+.08*n,.47+.06*n,.29],
  farColour:(x,y,z,n)=>y<G.lake?[.42,.40,.33]:y<2400?[.34+.06*n,.42+.06*n,.24]:[.48+.08*n,.47+.06*n,.36],
  seed:4374,farSeed:4375,mat:LEDGE_ROCK.mat,scene});})();