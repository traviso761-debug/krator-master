// ================================================================= HOST — stage (station 12: the lava delta)
// The ideal-type host for an active ocean entry on THE THRONE's south-east coast (PLAN.md, "New stations"; map 5.1: px 900, 858 on its
// canvas, 15 km down tube_hot_05's line from its mouth; the coast runs NE-SW with the Ring Sea to the south-east; the last land stands 300 m
// over the sea in an old sea cliff; Aw and Csa, ~600 mm, the plume's dry side; ~1.85 atm at the shore).
//
// THE MAP (x east, z south; R 2600; s toward the sea, south-east; t along the coast, north-east). THE OLD FLANK above the cliff, dry, its
// shrubs and the kit's shoulder trees. THE PALI, the old sea cliff, ~280 m, with THE LAVA pouring over its lip from a channel down the flank (the
// tube's flow come out to the surface) and spreading over THE DELTA: a bench of new black land at the cliff's foot, its seaward front cracked
// and slumping where the lava meets the sea in spatter and THE LAZE (acid steam, white, drifting downwind); LITTORAL CONES on the bench, built
// by the steam blasts; black sand in the coves either side; PUMICE RAFTS lying still in the swash and off the delta.
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
window._t={t0:performance.now()};const _mark=k=>{window._t[k]=Math.round(performance.now()-window._t.t0);};
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   // BIO.record: the volume as a core/tags record too (core/biome/20-core-kit.js)
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r&&y>=(r.y||0)-2&&y<=(r.y||0)+r.h+5;}

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.9;document.body.appendChild(renderer.domElement);
// THE LIGHT: thin air (~0.4 atm): a hard white sun, a deep blue sky darkening overhead, almost no haze; the lava lake's glow
// (a warm light from the caldera, faint by day, strong at night: 86)
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xb8c8dc);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00009);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,20000);
const hemi=new THREE.HemisphereLight(0x8aa4cc,0x7a7c84,.7);scene.add(hemi);
const SUN_POS=[-850,900,500];
const sun=new THREE.DirectionalLight(0xfff6ea,1.35);sun.position.set(...SUN_POS);scene.add(sun);
const fill=new THREE.DirectionalLight(0xa8b8d8,.18);fill.position.set(900,400,900);scene.add(fill);

// ---------------------------------------------------------------- the coast, the cliff, the delta, the lava
const TERR={R:2600};
const SEA=-1500;   // the Ring Sea's surface (map 5.1)
const sOf=(x,z)=>(x+z)*.70711,tOf=(x,z)=>(x-z)*.70711,xzOf=(s,t)=>[(s+t)*.70711,(s-t)*.70711];
const PALI={s0:-260,top:280,face:70,name:'The pali (the old sea cliff)'};
const paliS=t=>PALI.s0+45*Math.sin(t*.0021+.7)+20*Math.sin(t*.009+1.9);
// the delta: a lobe of new land at the cliff's foot round the lava's line (t ~ 0), its front out to ~420 m past the foot
const DELTA={t0:-60,w:520,reach:420,name:'The lava delta (new black land)'};
const deltaLobe=t=>Math.exp(-Math.pow((t-DELTA.t0)/DELTA.w,2));
const frontS=t=>paliS(t)+20+DELTA.reach*deltaLobe(t)*(1+.12*Math.sin(t*.031+.4));
// the lava's line: down the old flank toward the sea, wandering, over the cliff's lip, across the bench to the entry
const LAVA={t:s=>DELTA.t0+60*Math.sin(s*.0021+.4)+18*Math.sin(s*.011),s0:-2500,w:7,name:'The lava channel (the tube\'s flow, out to the sea)'};
// the entry: where the channel meets the sea, at the delta's front
const ENTRY=(function(){const t=LAVA.t(frontS(DELTA.t0)),s=frontS(t),c=xzOf(s,t);return{s,t,x:c[0],z:c[1],name:'The ocean entry'};})();
// LITTORAL CONES on the bench either side of the entry
const LCONES=[[-140,-80],[-90,150],[-210,40]].map(([ds,dt],i)=>{const t=ENTRY.t+dt,s=Math.min(frontS(t)-35,ENTRY.s+ds),c=xzOf(s,t);return{x:c[0],z:c[1],r:28+8*i,h:14+5*i,name:'A littoral cone'};});
const PEN={x:0,z:0,v:0};   /* unused here (the penitentes' fork) */function plumeAt(x,z){return 0;}// THE AIR's height fog (89zz-host-core.js; the final rebuild): the dense shore air; a dawn mist at the cliff's foot
const ATMOS_AIR={falloff:1/700,sun:.35,sky:.35,mist:{density:.0012,below:30,depth:25,noise:.7}};
