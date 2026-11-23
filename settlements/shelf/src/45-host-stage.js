// ================================================================= HOST — stage: the renderer, the lights, Shelf's own ground
// The page's frame is the layout's (PLAN.md 5.2): x along the face (toward azimuth 125), z out of it (toward 35, Dalab's plain), y metres
// above sea level. THE GROUND is SHELF.groundAt (31-shelf-rules.js): the plateau's cut and the Wall rising behind it, the face the Ancients
// dressed sheer, the shelf and the lower escarpment down to Dalab's plain; meshed and shaded by the cliff city's ground
// (kits/ancients/cliff/30-cliff-ground.js: KCLIFF.rock, KCLIFF.ground): KSTRATA's 'secondary-ejecta' (the impact breccia under Shelf) on the
// faces, the library's grain (materials.json: megabreccia, the drill-marked cut, steppe, gravel), a pair of rows either side of the face so it
// stands sheer. KDRAWN gets the near grid's triangles.
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0xbcc4c8,.00005);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,60000);
const hemi=new THREE.HemisphereLight(0xd6e2e4,0x6a5e50,.66);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff0d8,1.3);sun.position.set(-2600,4200,3600);scene.add(sun);
const fill=new THREE.DirectionalLight(0xbfd2ff,.25);fill.position.set(2000,1500,-2600);scene.add(fill);
/* the kit's night switch (kits/ancients 92-camera.js): no night state here yet */
let NIGHT=false;
const SHELF_H=(x,z)=>SHELF.groundAt(SHELF_LAYOUT,x,z);
const SHELF_ROCK=(function(){const G=SHELF_LAYOUT.ground;
 return {mat:KCLIFF.rock({recipe:'secondary-ejecta',seed:4613,range:[G.plainFar-200,G.top],pack:'shelf',lib:{wall:'cliffWall',dressed:'faceDressed',flat:'turf',low:'shore'},
  lowY:[2700,2790],tanMix:.4,key:'shelf-rock'})};})();
const SHELF_GROUND=(function(){const G=SHELF_LAYOUT.ground;
 return KCLIFF.ground({H:SHELF_H,page:G.page,far:G.far,xDense:1400,zDense:[-800,2200],dx:[6,30],dz:[10,30],rows:[-.05,.05],
  dressed:(x,z,y)=>Math.abs(x)<G.dressed-10&&z>-30&&z<=300&&y<G.head-1?1:0,
  colour:(x,y,z,n,dr)=>dr&&y<G.shelf+.5&&y>G.shelf-.5&&z<300?[.72+.05*n,.69+.05*n,.63+.04*n]:y>G.head-40?[.50+.07*n,.49+.06*n,.33]:y>G.shelfEnd-10?[.52+.07*n,.50+.06*n,.35]:[.56+.06*n,.50+.05*n,.38],
  farColour:(x,y,z,n)=>y<1600?[.56+.06*n,.50+.05*n,.38]:y<3600?[.52+.06*n,.48+.05*n,.36]:[.55+.08*n,.53+.06*n,.42],
  seed:4614,farSeed:4615,mat:SHELF_ROCK.mat,scene});})();