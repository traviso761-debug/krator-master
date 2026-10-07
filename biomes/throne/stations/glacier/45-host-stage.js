// ================================================================= HOST — stage (station 9: the glacier and its ice caves)
// The ideal-type host for THE THRONE's high cold on the windward side (NOTES.md, "The high cold": glaciers, glacier bursts
// and lahars down the wet flank; ice towers and ice caves over the summit's fumaroles, as on Mt Erebus, warm living spots
// at -30; and, low on the tile, the shoulders' cold belt: gill-coral trees among conifers in the snow): renderer, the high
// clear light, the flank and its layout as DATA; 47 cuts the rest.
//
// THE MAP (x east, z south; R 2600). 5.2 km of the north-west flank, ~5.6 to ~6.5 km up, ~60 km from the vent (south-east:
// the summit plateau's snowfield fills that quarter of the sky). The flank comes down in steps: a gentle upper basin under
// the plateau's edge, a steep ICEFALL, a long steep slope, a BENCH, then the flank falls away again below it.
//   THE GLACIER    a valley glacier from the top edge: snow on its upper basin, the icefall's seracs and crevasses, bare
//                  ice below with dirt bands (ogives) and a medial moraine, ending on the bench in an ice cliff
//   THE MORAINES   lateral moraines along both sides (sharp crests of rubble), a terminal moraine looping across the bench
//   THE LAKE       the proglacial lake between the ice cliff and the terminal moraine, milky with rock flour, ice in it
//   THE OUTWASH    the meltwater river out through the moraine's breach, braiding down the flank below
//   THE COLD BELT  the lowest ground, off the river: conifers and gill-coral trees in the snow, teal cushions
//   THE SHELF      a geothermal shelf beside the glacier (east): fumaroles, ICE TOWERS of frozen steam round them, ICE
//                  CAVES melted into the ice by the steam (warm inside: Krator's life lives there), an ice arch
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
window._t={t0:performance.now()};const _mark=k=>{window._t[k]=Math.round(performance.now()-window._t.t0);};
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);}
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r&&y>=(r.y||0)-2&&y<=(r.y||0)+r.h+5;}

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.92;document.body.appendChild(renderer.domElement);
// THE LIGHT: high and clear (82 sets the day and the night): a strong white sun in the south-west, a deep blue sky, the
// snow throwing light back up; a thin cold haze
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xc4d0dc);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00018);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,16000);
const hemi=new THREE.HemisphereLight(0xa8c0dc,0x8a96a4,.85);scene.add(hemi);
const SUN_POS=[-850,900,500];
const sun=new THREE.DirectionalLight(0xfff0dc,1.25);sun.position.set(...SUN_POS);scene.add(sun);
const fill=new THREE.DirectionalLight(0xb8c4d8,.22);fill.position.set(900,400,900);scene.add(fill);

// ---------------------------------------------------------------- the flank and its layout
const TERR={R:2600};
const UP=[.707,.707],DN=[-.707,-.707],PERP=[.707,-.707];   // toward the vent (south-east, up the flank), down it, across (north-east)
const uOf=(x,z)=>x*UP[0]+z*UP[1],pOf=(x,z)=>x*PERP[0]+z*PERP[1],upAt=(u,p)=>[UP[0]*u+PERP[0]*p,UP[1]*u+PERP[1]*p];
// THE FLANK'S PROFILE up the slope: its gradient by stretch (the outwash below the bench, the bench, the long slope, the
// icefall, the upper basin), integrated once into a table
const SLOPE=u=>.16+(.02-.16)*smooth(-1080,-920,u)+(.22-.02)*smooth(-230,-70,u)+(.45-.22)*smooth(1250,1350,u)+(.12-.45)*smooth(1650,1750,u);
const PROF=(function(){const u0=-2900,du=5,n=1240,t=new Float32Array(n);let h=5560;for(let i=0;i<n;i++){t[i]=h;h+=SLOPE(u0+i*du)*du;}
 return u=>{const f=clamp((u-u0)/du,0,n-1.001),i=Math.floor(f);return mix(t[i],t[i+1],f-i);};})();
// THE GLACIER: its centre line wanders a little; its half-width; the snout on the bench
const GL={pg:u=>45*Math.sin(u*.0011+.4)+18*Math.sin(u*.003+1.2),W:u=>mix(290,520,smooth(-600,2400,u)),SNOUT:-300,
 // how thick the ice is down the middle (a cliff at the snout; thicker under the icefall and the basin)
 T:u=>(34+24*smooth(-300,500,u)+22*smooth(1400,2300,u))*smooth(-300,-286,u),
 // the trough the ice has cut, and its depth
 Dv:u=>36+24*smooth(-600,2200,u)};
// THE SPURS (arêtes) either side of the valley, higher up the flank; the east one stands off to leave room for the shelf
const SPUR={west:400,east:620,A:u=>55+95*smooth(-1800,2500,u)};
// THE TERMINAL MORAINE: an arc across the bench, its middle farthest down; breached where the river leaves the lake
const TERM=(function(){const p0=GL.pg(GL.SNOUT),W0=GL.W(GL.SNOUT);return{p0,W0,u0:GL.SNOUT-440,bend:80,breach:p0+70,h:20};})();
const termU=p=>TERM.u0+TERM.bend*Math.pow((p-TERM.p0)/TERM.W0,2);
// THE SHELF: a geothermal shelf east of the glacier, between the ice and the east spur
const SHELF=(function(){const u=650,p=GL.pg(u)+GL.W(u)+290,c=upAt(u,p);return{u,p,x:c[0],z:c[1],r:300,name:'The geothermal shelf (fumaroles, ice towers, ice caves)'};})();
// the fumaroles on it; the ice towers round them (frozen steam: chimneys of ice, as on Erebus); the caves the steam has
// melted into the ice (a mouth facing the valley); the arch
const FUMS=(function(){reseed(4901);const o=[];for(let k=0;k<40&&o.length<11;k++){const a=rr(0,TAU),d=SHELF.r*Math.sqrt(rng())*.85,x=SHELF.x+Math.cos(a)*d,z=SHELF.z+Math.sin(a)*d;
  if(o.some(F=>Math.hypot(F.x-x,F.z-z)<45))continue;o.push({x,z,s:rr(.5,1)});}return o;})();
const CAVES=(function(){reseed(4902);const o=[],face=Math.atan2(-PERP[1],-PERP[0]);   // facing west-south-west, toward the glacier
 [[-.45,.25,18],[.1,-.35,14],[.5,.3,21]].forEach(([fu,fp,R])=>{const c=upAt(SHELF.u+fu*SHELF.r,SHELF.p+fp*SHELF.r);o.push({x:c[0],z:c[1],R,H:R*rr(.7,.85),face:face+rr(-.5,.5),mouth:rr(.32,.42),name:'An ice cave (steam-melted; warm inside)'});});
 return o;})();
const TOWERS=(function(){reseed(4903);const o=[];for(const F of FUMS){for(let k=0,n=ri(2,4);k<n;k++){const a=rr(0,TAU),d=rr(4,22),x=F.x+Math.cos(a)*d,z=F.z+Math.sin(a)*d;
   if(CAVES.some(C=>Math.hypot(C.x-x,C.z-z)<C.R*1.6))continue;if(o.some(T=>Math.hypot(T.x-x,T.z-z)<T.r+6))continue;o.push({x,z,h:rr(4,14)*(k?.7:1),r:rr(1.6,3.4),fum:k===0});}}return o;})();
const ARCH=(function(){const c=upAt(SHELF.u+.05*SHELF.r,SHELF.p+.45*SHELF.r);return{x:c[0],z:c[1],span:26,rise:17,tube:2.6,a:Math.atan2(UP[1],UP[0])+.3,name:'An ice arch'};})();
// the plume is far off and behind the crown: no plume field here (the kit's life is the shoulder's and the cold's)
function plumeAt(x,z){return 0;}
