// ================================================================= HOST — stage (station 8: vent country, the east rift under the plume)
// The ideal-type host for THE THRONE's vent country (NOTES.md, "Vent country": along the rifts, densest under the plume;
// the sulphur marsh with its antler-stalked rosettes; the mat; vent coral and brain caps round hot pools on black lava;
// bone bells in the steam valleys, bleached by the acid; lamp caps glowing at night): renderer, the plume's light, the
// rift and its layout as DATA; 47 lays the lava and cuts the rest.
//
// THE MAP (x east, z south; R 2600). 5.2 km of the east rift zone ~1.4 km up, ~80 km from the vent (west-north-west), under
// the plume (its ceiling high overhead, thinner here than over the ash desert). A rift zone is a broad ridge radial to
// the summit: the dykes that feed its fissures wedge it apart, so its crest has sagged into a GRABEN.
//   THE GRABEN     the rift's floor, dropped ~16-26 m between two fault scarps ~470 m apart, along the map from
//                  west-north-west to east-south-east; open cracks (gjár) en echelon on its floor, steaming
//   THE FISSURE    an eruptive fissure on the graben floor, four years quiet: spatter ramparts either side of its crack
//                  (still hot: it glows at night), four spatter cones along it, and its young flow down the graben
//   THE MARSH      the sulphur marsh, down-rift on the graben floor: acid water among sulphur-crusted hummocks
//   THE POOLS      hot pools on the east shoulder's black lava, each ringed in colour by its own mats (blue where it is
//                  hottest, then green, yellow, orange as it cools), sinter round them; mud pots beside them
//   THE VALLEY     a steam valley cut in the west shoulder's old ground: fumaroles all down its floor, bone bells
//   THE HOLLOWS    two still hollows where the CO2 pools: the mat on their floors, nothing else alive
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
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;document.body.appendChild(renderer.domElement);
// THE LIGHT: under the plume, but nearer its edge than the ash desert: a dim warm overcast, the sun a pale disc in the
// south-west, the air yellowed by the vents' gas; the weather (89) thickens it to the acid fog
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xaca690);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00035);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,16000);
const hemi=new THREE.HemisphereLight(0xb4ae9e,0x4a4238,.95);scene.add(hemi);
const SUN_POS=[-900,520,700];
const sun=new THREE.DirectionalLight(0xffdcb0,.95);sun.position.set(...SUN_POS);scene.add(sun);
const fill=new THREE.DirectionalLight(0xb8b4b0,.3);fill.position.set(900,400,-900);scene.add(fill);

// ---------------------------------------------------------------- the rift and its layout
const TERR={R:2600};
const UP=[-.94,-.34],DN=[.94,.34],PERP=[.34,-.94];   // toward the vent (west-north-west), away, across (north-north-east)
const uOf=(x,z)=>x*UP[0]+z*UP[1],pOf=(x,z)=>x*PERP[0]+z*PERP[1],upAt=(u,p)=>[UP[0]*u+PERP[0]*p,UP[1]*u+PERP[1]*p];
// the flank, gentle along the rift (~3.5%), and the rift zone's broad ridge across it
function flankH(x,z){const u=uOf(x,z),p=pOf(x,z);
 return 1400+.035*u+20*Math.exp(-Math.pow(p/1100,2))+16*(fbm(x*.0006+3,z*.0006-1,81,3)-.5)+5*(fbm(x*.003-5,z*.003+2,83,2)-.5);}
// THE GRABEN: its axis wanders a little; its half-width and its throw (how far the floor dropped) vary along it
const GRABEN={pw:u=>30*Math.sin(u*.0013)+12*Math.sin(u*.0041+1),W:u=>235+45*(fbm(u*.0011,3.7,85,2)-.5),D:u=>22+16*fbm(u*.0009,1.3,86,2)};
function grabenAt(x,z){const u=uOf(x,z),l=pOf(x,z)-GRABEN.pw(u),W=GRABEN.W(u),a=Math.abs(l);
 // the scarps: a steep face ~25 m wide, a little talus at its foot; in = how far inside the floor (0..1)
 return{drop:GRABEN.D(u)*smooth(W+10,W-10,a),in:smooth(W+6,W-30,a),scarp:smooth(W+26,W+8,a)*smooth(W-34,W-6,a),l,u,W};}
// THE FISSURE: on the graben floor in the up-rift half; t0..t1 along u, l its offset across from the axis
const FISS={u0:420,u1:1950,l:22,name:'The fissure (four years quiet; its crack still glows at night)'};
const fissL=u=>GRABEN.pw(u)+FISS.l+9*Math.sin(u*.006);
const fissPt=u=>upAt(u,fissL(u));
function fissAt(x,z){const u=uOf(x,z);if(u<FISS.u0-40||u>FISS.u1+40)return{h:0,k:0,crack:0};
 const l=pOf(x,z)-fissL(u),e=smooth(FISS.u0-40,FISS.u0+60,u)*smooth(FISS.u1+40,FISS.u1-60,u),a=Math.abs(l);
 // two spatter ramparts, ~6 m high, either side of the crack
 return{h:e*6*Math.exp(-Math.pow((a-11)/6,2)),k:e*smooth(26,12,a),crack:e*smooth(6,2.5,a)};}
// THE SPATTER CONES along it (h, r in metres; crater: its radius as a share of r)
const CONES=[{u:650,h:16,r:55},{u:1020,h:28,r:85},{u:1420,h:20,r:65},{u:1760,h:13,r:48}].map((C,i)=>{const p=fissPt(C.u);return Object.assign(C,{x:p[0],z:p[1],crater:.44,cd:C.h*.6,i,name:'A spatter cone on the fissure'});});
function coneAt(x,z){let h=0,k=0;for(const C of CONES){const d=Math.hypot(x-C.x,z-C.z)/C.r;if(d>1.4)continue;
 h=Math.max(h,C.h*Math.pow(smooth(1,C.crater*.95,d),.9)-C.cd*smooth(C.crater*1.02,C.crater*.25,d));k=Math.max(k,smooth(1.2,.85,d));}return{h,k};}
// THE STEAM VALLEY: in the west shoulder, its centre line meandering down the flank; d0 its depth, w its half-width
const VALLEY={p0:-820,u0:2100,u1:-1900,d0:30,w:46,name:'The steam valley (bone bells in the steam)'};
const valL=u=>VALLEY.p0+70*Math.sin(u*.0021+.6)+25*Math.sin(u*.0057);
function valleyAt(x,z){const u=uOf(x,z);if(u>VALLEY.u0+80||u<VALLEY.u1-80)return{cut:0,fl:0,a:1e9};
 const a=Math.abs(pOf(x,z)-valL(u)),e=smooth(VALLEY.u0+80,VALLEY.u0-150,u)*smooth(VALLEY.u1-80,VALLEY.u1+150,u),W=VALLEY.w*(1+.25*(fbm(u*.004,9.1,87,2)-.5));
 return{cut:e*VALLEY.d0*Math.pow(smooth(W*2.0,W*.45,a),1.1),fl:e*smooth(W*1.1,W*.4,a),a};}
// THE SULPHUR MARSH: an ellipse on the graben floor, long along it
const MARSH=(function(){const u=-1300,p=GRABEN.pw(u)-15,c=upAt(u,p);return{u,p,x:c[0],z:c[1],ru:330,rp:175,name:'The sulphur marsh'};})();
const marshD=(x,z)=>{const du=uOf(x,z)-MARSH.u,dp=pOf(x,z)-MARSH.p;return Math.hypot(du/MARSH.ru,dp/MARSH.rp);};
// THE HOT POOLS on the east shoulder; THE MUD POTS beside them
const POOLS=(function(){reseed(4501);const c=upAt(-260,560),o=[];
 for(let k=0;k<40&&o.length<9;k++){const a=rr(0,TAU),d=rr(0,170),x=c[0]+Math.cos(a)*d,z=c[1]+Math.sin(a)*d,r=o.length<2?rr(16,22):rr(5,13);
  if(o.some(P=>Math.hypot(P.x-x,P.z-z)<(P.r+r)*1.9+6))continue;o.push({x,z,r,hot:rr(.3,1)});}
 return o;})();
const MUD=(function(){reseed(4502);const c=upAt(-40,420),o=[];
 for(let k=0;k<40&&o.length<7;k++){const a=rr(0,TAU),d=rr(0,60),x=c[0]+Math.cos(a)*d,z=c[1]+Math.sin(a)*d,r=rr(3.5,7);
  if(o.some(P=>Math.hypot(P.x-x,P.z-z)<P.r+r+5))continue;o.push({x,z,r});}
 return o;})();
// THE HOLLOWS: closed, still, where the CO2 pools (Lake Nyos, Mammoth Mountain): the mat on the floor
const HOLLOWS=[(function(){const u=180,c=upAt(u,GRABEN.pw(u)-130);return{x:c[0],z:c[1],r:62,depth:10};})(),
 (function(){const c=upAt(-900,-1650);return{x:c[0],z:c[1],r:88,depth:13};})()].map((H,i)=>Object.assign(H,{i,name:'A CO2 hollow (the mat on its floor; nothing else lives in it)'}));
// how far under the plume (the kit's 'plume' field): deep everywhere here, deepest down-rift
function plumeAt(x,z){return clamp(.9+.08*smooth(2500,-2500,uOf(x,z))+.05*(fbm(x*.0005,z*.0005,89,2)-.5),0,1);}
