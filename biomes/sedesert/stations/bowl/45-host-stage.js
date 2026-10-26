// ================================================================= HOST — stage (station 2: the Bowl, PLAN-BOWL.md)
// The ideal-type host for THE BOWL, the south-eastern desert's abyssal salt basin: renderer, the light, the shore and its
// layout as DATA, the ground (core/terrain: KBASIN's old lake for the strandlines and the yardangs' silt, KRELIEF.river for
// the delta's water), the fields the kit reads and BIO.init. The kit's species, builders and fauna carry over (50-75);
// 56 and 66 change them for the air, the heat and the salt.
//
// THE SITE: the south shore of the Bowl's great salt lake at the Bowl river 2's delta, scale model px 866,826 (the owner,
// 2026-10-26). The lake's surface is -990 m (1.83 atm); the river (78 m3/s) comes in from the south. Mantis's oasis lies 50 km
// west along the shore (87-host-far.js: a far glimpse). THE RINGS ARE COMPRESSED into the station (the owner, 2026-10-26: a
// showcase): on the model the ochre rim is 10 km wide, the salt flat 16-28 km, the halophyte belt and the yardang fields
// beyond it; here each is a few hundred metres to a kilometre, in the same order from the water.
//
// THE MAP (x east, z south; R 3000):
//   z < zS(x)            THE LAKE: banded shallows (ochre, pink, teal by salinity: 89w), ochre salt ridges standing out
//                        of them (the rim), deepening to teal beyond the station
//   0 .. 1300 m south    THE SALT FLAT: white polygonal crust, efflorescence, soda crust; damp hollows with glasswort;
//                        the old shorelines (KBASIN strandlines) as faint benches and beach ridges
//   the delta            the Bowl river 2 from the south edge to an apex ~1.4 km from the water, then five distributaries
//                        braided across the flat to the lake, each on its own levees: reeds, tamarisk, palms, mesquite
//   1100 .. 2400 m       THE HALO: saline sand and silt, the halophyte belt (saltbush, saxaul woods, tamarisk, brine lamps)
//   x < -600             THE KALUTS: the old lake bed raised in the west (30 m), cut by the wind into yardangs along it
//   the south-east       DUNES downwind of the flat (the wind from the north-north-west), the reg's gravel between
//   beyond               87-host-far.js: the lake to the horizon, the shore east and west, Mantis, the rim far off
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
// the water colour the kit's species read (50-species: the reed accents): the delta's silty green
var SEDESERT_WATER={hue:.36};
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
window._t={t0:performance.now()};const _mark=k=>{window._t[k]=Math.round(performance.now()-window._t.t0);};
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r&&y>=(r.y||0)-2&&y<=(r.y||0)+r.h+5;}

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;document.body.appendChild(renderer.domElement);
// THE LIGHT is the shared sky's (89s-host-sky.js sets the sun, the hemisphere, the fog and the exposure by the hour): these are
// its starting values. The air is 1.83 atm: thick, hazy, white-hot at noon
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xe0cdb2);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00012);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,90000);
const HEMI=new THREE.HemisphereLight(0xd8dce4,0x8a7058,.6);scene.add(HEMI);
const sun=new THREE.DirectionalLight(0xfff0d8,1.6);sun.position.set(-900,600,700);scene.add(sun);
const fill=new THREE.DirectionalLight(0xe0d0c0,.2);fill.position.set(900,300,-900);scene.add(fill);

// ---------------------------------------------------------------- the layout (data)
const TERR={R:3000};
const LAKE={level:-990,name:'The Bowl lake (hypersaline; its surface 990 m under the sea)'};
const SITE={px:866,py:826};
// the prevailing wind, the way it blows (from the north-north-west): the yardangs run along it, the dunes cross it
const WIND=(()=>{const x=.34,z=.94,l=Math.hypot(x,z);return[x/l,z/l];})();
const W_AL=(x,z)=>x*WIND[0]+z*WIND[1],W_AC=(x,z)=>-x*WIND[1]+z*WIND[0];
// THE SHORE: z of the waterline at x; the delta has built its lobe out into the lake round the mouths
const DELTA={apex:[240,420],x:220,lobe:300,lobeW:950};
// beyond the station (87-host-far.js) the shore bends south toward Mantis's green pocket, 50 km west and 16 km south, and a
// little north to the east: zero inside 6 km, so the station's own shore is the formula above
function zS(x){const d=(x-DELTA.x)/DELTA.lobeW;return -950+110*Math.sin(x*.0009+.7)+45*Math.sin(x*.0031+2)-DELTA.lobe*Math.exp(-d*d)+14500*smooth(-6000,-52000,x)-2500*smooth(6000,50000,x);}
// u: metres south of the shore (negative in the lake)
const uOf=(x,z)=>z-zS(x);
// THE KALUTS' PLATEAU: the old lake bed raised in the west, 30 m over the flat
const platK=(x,z)=>smooth(-400,-2200,x+300*Math.sin(z*.0008))*smooth(150,1100,uOf(x,z));
// the delta's silt fan round the apex and the mouths (a low lobe)
const fanK=(x,z)=>{const dx=(x-DELTA.x)/1250,u=uOf(x,z);return Math.exp(-dx*dx)*smooth(-150,350,u)*smooth(2700,1300,u);};
// the dune field downwind of the flat (south-east)
const duneK=(x,z)=>smooth(400,1300,x)*smooth(1800,2600,uOf(x,z))*(1-platK(x,z));
// THE GROUND before the old lake's marks and the channels
function baseH(x,z){const u=uOf(x,z);
 if(u<0){const d=-u;let h=LAKE.level-.15-.55*smooth(0,900,d)-3.2*smooth(600,4200,d)-(fbm(x*.002,z*.002,1701,2)-.5)*.3*smooth(0,200,d);
  // THE OCHRE RIM: salt pressure ridges standing a hand's breadth out of the shallows, 80-900 m out
  const r=1-Math.abs(2*fbm(x*.0065+11,z*.0065-3,1702,2)-1);h+=.6*smooth(.962,.99,r)*smooth(-40,-160,u)*smooth(-1100,-600,u);   /* thin crests: the ridged term is near 1 wherever the noise is near its mean */
  return h;}
 const n1=fbm(x*.0008+3,z*.0008-1,1703,3)-.5,n2=fbm(x*.006,z*.006,1704,2)-.5,ld=smooth(0,300,u);
 let h=LAKE.level-.15+.6*smooth(0,90,u)+.0034*Math.min(u,1600)+.0105*Math.max(0,u-1600)+n1*1.3*ld+n2*.22*ld;
 // the damp hollows on the flat: shallow pans a few decimetres down (glasswort)
 h-=.35*smooth(.6,.74,fbm(x*.004-7,z*.004+5,1705,2))*smooth(80,300,u)*smooth(1600,1100,u);
 h+=32*platK(x,z)+1.4*fanK(x,z);
 const dk=duneK(x,z);if(dk>0){const a=W_AL(x,z),c=W_AC(x,z),L=140+30*Math.sin(c*.0021),s=a/L+.18*Math.sin(c*.0047+1.3)+.35*(fbm(x*.002,z*.002,1706,2)-.5),f=s-Math.floor(s);
  const H=(4+7*fbm(x*.003+2,z*.003,1707,2))*dk;h+=f<.8?H*f/.8:H*(1-f)/.2;}
 h+=(fbm(x*.003+5,z*.003,1708,2)-.5)*5*smooth(1800,2800,u)*(1-duneK(x,z));   // the reg's low swells
 return h;}

// THE OLD LAKE (core/terrain 40-core-basin, KBASIN): the Bowl's lake once stood at -930 m and fell slowly to today's -990,
// leaving its strandlines as benches and its silt, salt and the yardangs' ground by height. A dam lake (its own basin),
// drawn down 2 m a year at its full level, its sill 3 m under it; it covers the whole station.
const BASIN=KBASIN.create({seed:1709,age:9000,recession:7000,wind:WIND,strand:{top:7,bottom:1.6,jitter:.45,wmax:1.6,a:.7},yardang:{h:0},
 lakes:[{name:'The Bowl lake at its high stand',kind:'dam',level:-930,sill:-933,ring:2,remnant:LAKE.level,member:()=>1}]});
const _bs={};
// THE KALUTS: ridges along the wind on the plateau's old lake silt, blunt upwind and tapering downwind, one to a cell of a
// lattice along the wind (500 x 95 m), each drawn from its cell's hash (core/rand): where the silt is dry and fresh enough
// (KBASIN's yard field) and on the plateau
const YARD={seed:1710,along:520,across:95};
function yardRidge(i,j){const R=KRAND,h=(k)=>R.unit(R.hash(YARD.seed,i,j,k));if(h(0)<.28)return null;
 return{a:(i+.2+.6*h(1))*YARD.along,c:(j+.25+.5*h(2))*YARD.across,len:180+260*h(3),w:14+22*h(4),h:9+22*h(5)};}
function yardAt(x,z){const a=W_AL(x,z),c=W_AC(x,z),i0=Math.floor(a/YARD.along),j0=Math.floor(c/YARD.across);let h=0;
 for(let i=i0-1;i<=i0+1;i++)for(let j=j0-1;j<=j0+1;j++){const Y=yardRidge(i,j);if(!Y)continue;const da=a-Y.a,dc=c-Y.c;if(Math.abs(da)>Y.len||Math.abs(dc)>Y.w*1.7)continue;
  /* a flat-topped ridge with steep, fluted flanks (the wind's grooves along it), blunt upwind, tapering downwind */
  const fl=1+.18*Math.sin(dc*.45+da*.004)+.1*Math.sin(dc*1.3),t=da<0?smooth(-Y.len*.45,-Y.len*.15,da):smooth(Y.len,Y.len*.15,da),p=smooth(Y.w*1.2*fl,Y.w*.5,Math.abs(dc));h=Math.max(h,Y.h*p*Math.sqrt(t)*(.9+.1*Math.sin(da*.02)));}
 return h;}
const yardK=(x,z,h)=>{const pk=platK(x,z);if(pk<=.25)return 0;BASIN.sample(x,z,h,_bs);return _bs.yard*smooth(.25,.6,pk);};

// THE DELTA: the river from the station's south edge to the apex, then five distributaries across the flat to the lake.
// Polylines [[x,z],...] downstream; their water from KRELIEF.river (core/terrain 38: each vertex the lowest bed under the
// channel, the surface never climbing), held to the apex's level below it and to the lake's at the mouth.
const CHAN=(function(){const out=[],A=DELTA.apex;
 const line=(p0,p1,n,off)=>{const dx=p1[0]-p0[0],dz=p1[1]-p0[1],L=Math.hypot(dx,dz),px=-dz/L,pz=dx/L,P=[];
  for(let k=0;k<=n;k++){const t=k/n,o=off(t);P.push([p0[0]+dx*t+px*o,p0[1]+dz*t+pz*o]);}return P;};
 out.push({key:'main',name:'The Bowl river 2 (78 m3/s, from the south)',w:42,depth:1.6,pts:line([560,3260],A,160,t=>(70*Math.sin(t*Math.PI*3.2+.5)+22*Math.sin(t*Math.PI*9.4))*(1-.4*t))});
 const ends=[-720,-300,160,560,980],amp=[-150,-70,10,70,150],   /* bowed outward, a fan: no two within 100 m past the apex */
  w=[14,20,28,18,12];
 ends.forEach((ex,i)=>{const e=[ex,zS(ex)-140];out.push({key:'d'+i,name:'A distributary of the delta',w:w[i],depth:.55+w[i]*.03,
  pts:line(A,e,110,t=>amp[i]*Math.sin(Math.PI*t)+14*Math.sin(t*Math.PI*6+i*1.7)+6*Math.sin(t*Math.PI*15+i))});});
 return out;})();
// the channels' water: KRELIEF.river on the ground without them, then the apex's level and the lake's
(function(){const g=(x,z)=>BASIN.land(x,z,baseH(x,z));
 CHAN.forEach((C,ci)=>{const R=KRELIEF.river(C.pts,g,{depth:-.45,sample:8});   /* the water 0.45 m under the plain it crosses */C.y=R.map(p=>p.y);});
 const yA=CHAN[0].y[CHAN[0].y.length-1];
 CHAN.forEach((C,ci)=>{for(let k=0;k<C.y.length;k++){let y=C.y[k];if(ci)y=Math.min(y,yA);if(k)y=Math.min(y,C.y[k-1]);C.y[k]=Math.max(y,LAKE.level);}
  /* the mouth: down to the lake's level over its last 120 m */
  const n=C.pts.length;for(let k=n-1;k>=0;k--){const z=C.pts[k][1],u=uOf(C.pts[k][0],z);if(u>120)break;C.y[k]=Math.max(LAKE.level,Math.min(C.y[k],LAKE.level+Math.max(0,u)*.004));}});})();
// the channels stamped into a grid (4 m): for each cell the nearest channel's u (distance over half-width), its water level
// and half-width, so the ground, the water and the plants read a channel in one lookup
const CHG=(function(){const c=4,x0=-1700,z0=-1800,x1=1900,z1=3550,nx=Math.ceil((x1-x0)/c)+1,nz=Math.ceil((z1-z0)/c)+1;
 const U=new Float32Array(nx*nz).fill(99),Y=new Float32Array(nx*nz).fill(LAKE.level),HW=new Float32Array(nx*nz).fill(10),ID=new Uint8Array(nx*nz).fill(255);
 CHAN.forEach((C,ci)=>{const hw=C.w/2,P=C.pts;for(let k=0;k<P.length-1;k++){const a=P[k],b=P[k+1],ya=C.y[k],yb=C.y[k+1],rr2=hw*3.2;
  const i0=Math.max(0,Math.floor((Math.min(a[0],b[0])-rr2-x0)/c)),i1=Math.min(nx-1,Math.ceil((Math.max(a[0],b[0])+rr2-x0)/c)),
   j0=Math.max(0,Math.floor((Math.min(a[1],b[1])-rr2-z0)/c)),j1=Math.min(nz-1,Math.ceil((Math.max(a[1],b[1])+rr2-z0)/c));
  const dx=b[0]-a[0],dz=b[1]-a[1],L2=dx*dx+dz*dz||1;
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const x=x0+i*c,z=z0+j*c,t=clamp(((x-a[0])*dx+(z-a[1])*dz)/L2,0,1),d=Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t),u=d/hw,q=j*nx+i;
   if(u<U[q]){U[q]=u;Y[q]=ya+(yb-ya)*t;HW[q]=hw;ID[q]=ci;}}}});
 const o={x0,z0,c,nx,nz,U,Y,HW,ID};
 // bilinear u and level at a point; out.id the nearest cell's channel (255: none)
 o.at=function(x,z,out){out=out||{};const fx=(x-x0)/c,fz=(z-z0)/c;if(fx<0||fz<0||fx>=nx-1||fz>=nz-1){out.u=99;out.y=LAKE.level;out.hw=10;out.id=255;return out;}
  const i=Math.floor(fx),j=Math.floor(fz),s=fx-i,t=fz-j,q=j*nx+i,w0=(1-s)*(1-t),w1=s*(1-t),w2=(1-s)*t,w3=s*t;
  out.u=U[q]*w0+U[q+1]*w1+U[q+nx]*w2+U[q+nx+1]*w3;out.y=Y[q]*w0+Y[q+1]*w1+Y[q+nx]*w2+Y[q+nx+1]*w3;out.hw=HW[q]*w0+HW[q+1]*w1+HW[q+nx]*w2+HW[q+nx+1]*w3;
  out.id=ID[s<.5?(t<.5?q:q+nx):(t<.5?q+1:q+nx+1)];return out;};
 return o;})();
const _ch={};
// ---------------------------------------------------------------- terrain
// THE GROUND IS A BAKED FIELD (core/terrain/30-core-field.js), as the kit's: terrainH0 paints it once at load, terrainH and
// everything that roots or draws reads the field, and BIO.export hands it to Godot. The order: the base, the old lake's
// strandlines (KBASIN.land: monotone in height, so it makes no hollows), the channels cut into it with their levees, the kaluts.
function terrainH0(x,z){let h=BASIN.land(x,z,baseH(x,z));
 const C=CHG.at(x,z,_ch);
 if(C.u<2.4){const cut=C.u<1?C.y+.12-CHAN[C.id===255?0:C.id].depth*(1-C.u*C.u):C.y+.12+(h-C.y-.12)*smooth(1,1.7,C.u);
  h=Math.min(h,cut);const lv=C.u-1.55;h+=.38*Math.exp(-lv*lv/.12)*smooth(-60,40,uOf(x,z));}   /* the levees */
 const yk=yardK(x,z,h);if(yk>0)h+=yk*yardAt(x,z);
 return h;}
// the ground mesh's lattice: 640 cells over the map (10.3 m), each cell in the delta's window split in two (5.2 m) in x and
// in z, so the distributaries (12-42 m wide) and their levees are resolved
const GRID={N:640,S:TERR.R*2.2,M:2,win:{x:[-1150,1400],z:[-1500,3300]}};GRID.cs=GRID.S/GRID.N;
GRID.cells=(lo,hi)=>{let a0=null,a1=null;for(let i=0;i<GRID.N;i++){const a=-GRID.S/2+i*GRID.cs;if(a+GRID.cs>lo&&a<hi){if(a0===null)a0=a;a1=a+GRID.cs;}}return[a0,a1];};
function waterAt0(x,z){const u=uOf(x,z);if(u<260){const h=terrainH0(x,z);if(h<LAKE.level+.02||u<0)return LAKE.level;}
 const C=CHG.at(x,z,_ch);return C.u<1.08?C.y:-1e9;}
const TFIELD=(function(){const t0=performance.now(),S=GRID.S;
 const f=KFIELD.bake(terrainH0,[-S/2,-S/2,S/2,S/2],GRID.cs/2,{name:'sedesert-bowl',
  water:{lake:(x,z)=>uOf(x,z)<260?LAKE.level:NaN,delta:(x,z)=>{const C=CHG.at(x,z,_ch);return C.u<1.08?C.y:NaN;}},
  waterBox:{lake:[-S/2,-S/2,S/2,600],delta:[CHG.x0,CHG.z0,CHG.x0+CHG.c*(CHG.nx-1),CHG.z0+CHG.c*(CHG.nz-1)]}});
 window._field={step:f.step,nx:f.nx,nz:f.nz,ms:Math.round(performance.now()-t0)};return f;})();
_mark('field');
function terrainH(x,z){return TFIELD.h(x,z);}
const _tm={x:NaN,z:NaN,h:0};
function placeH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=terrainH0(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
// the local water: the lake where the ground is under its level near the shore, a channel's surface inside its banks
function waterH(x,z){const u=uOf(x,z);if(u<0)return LAKE.level;if(u<260&&terrainH(x,z)<LAKE.level+.02)return LAKE.level;
 const C=CHG.at(x,z,_ch);return C.u<1.08?C.y:-1e9;}

// ---------------------------------------------------------------- the fields (cached below; these are the definitions)
// The kit's (BIOME-API.md: wet, flow, upland, canyon, rim, rock, dune, oasis, slope, abyss; its zones read them: the delta's
// channels are its 'canyon' floor and banks, the kaluts its rock) and the Bowl's own: lake (under the water), shore (the
// waterline's band), flat (the salt flat), salt (the crust), delta (the green fingers), halo (the halophyte belt), reg (the
// gravel and sand beyond), yard (the kaluts' ground), damp (the flat's hollows), fan (the delta's silt), ridge (the ochre
// rim's crust out in the shallows), strand (an old shoreline's bench)
function fieldsAt(x,z,h,slope){const u=uOf(x,z),C=CHG.at(x,z,_ch),pl=platK(x,z),dk=duneK(x,z),fk=fanK(x,z);
 BASIN.sample(x,z,h,_bs);
 const lake=h<LAKE.level-.02&&u<260?1:0,ridge=u<0&&h>=LAKE.level-.02?1:0;
 const near=smooth(3.2,1.05,C.u)*(C.id===255?0:1),chan=smooth(1.15,.9,C.u)*(C.id===255?0:1);
 const delta=Math.max(near,smooth(5,1.8,C.u)*.5)*(1-lake);
 const yd=clamp(yardK(x,z,h)*smooth(1.5,6,yardAt(x,z)),0,1);
 const flat=smooth(-20,40,u)*smooth(1500,1050,u)*(1-pl)*(1-lake);
 const halo=smooth(950,1500,u)*smooth(2700,2050,u)*(1-pl*.8)*(1-dk*.7)*(1-lake);
 const reg=clamp(Math.max(smooth(2050,2700,u),pl*.85,dk)*(1-lake),0,1);
 const damp=smooth(LAKE.level+1.5,LAKE.level+.6,h)*(1-lake)*smooth(-10,60,u)+smooth(.6,.74,fbm(x*.004-7,z*.004+5,1705,2))*flat*.8;
 const salt=clamp(Math.max(flat*(1-delta*.85),ridge,_bs.salt*.4*flat)*(1-reg*.6),0,1);
 const rock=clamp(Math.max(yd*smooth(.25,.6,slope),smooth(.55,.9,slope)*.8),0,1);
 const wet=clamp(Math.max(delta*.9,damp*.7,lake),0,1);
 return{wet:Math.max(.05,wet),flow:chan*(1-lake),upland:0,canyon:smooth(4,1.3,C.u)*(C.id===255?0:1)*(1-lake),rim:0,rock,dune:dk,oasis:0,slope,abyss:0,
  lake,shore:smooth(80,0,Math.abs(u))*(1-ridge),flat,salt,delta,halo,reg,yard:yd,damp:clamp(damp,0,1),fan:fk,ridge,strand:_bs.strand*(1-reg)*(1-lake),plat:pl};}
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','lake','shore','flat','salt','delta','halo','reg','yard','damp','fan','ridge','strand','plat'];
const FC=(function(){const N=420,S=TERR.R*2.2,a={};FNAMES.forEach(n=>a[n]=new Float32Array(N*N));a.h=new Float32Array(N*N);
 const cs=S/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){a.h[j*N+i]=terrainH((i/(N-1)-.5)*S,(j/(N-1)-.5)*S);}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=(i/(N-1)-.5)*S,z=(j/(N-1)-.5)*S,k=j*N+i;
  const hx=a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)],hz=a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i],slope=clamp(Math.hypot(hx,hz)/(2*cs)*1.6,0,1);
  const F=fieldsAt(x,z,a.h[k],slope);FNAMES.forEach(n=>a[n][k]=F[n]);}
 const L={x:NaN,z:NaN,k:0,fu:0,fv:0};
 const at=(arr,x,z)=>{if(x!==L.x||z!==L.z){const u=clamp((x/S+.5)*(N-1),0,N-1.001),v=clamp((z/S+.5)*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v);L.x=x;L.z=z;L.k=j*N+i;L.fu=u-i;L.fv=v-j;}
  const k=L.k,fu=L.fu,fv=L.fv;return arr[k]*(1-fu)*(1-fv)+arr[k+1]*fu*(1-fv)+arr[k+N]*(1-fu)*fv+arr[k+N+1]*fu*fv;};
 return{N,S,a,at};})();
const FIELD={};FNAMES.forEach(n=>FIELD[n]=(x,z)=>FC.at(FC.a[n],x,z));_mark('fields');
// a channel at a point, for the passes that want it sharper than the 15.7 m field cache: {u, y, hw, id}
const chanAt=(x,z)=>CHG.at(x,z,{});

// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
// the LOD spine: along the shore and up the delta, the apex, the kaluts and the halo
const SPINE=[];for(let x=-2600;x<=2600;x+=650)SPINE.push([x,zS(x)+120]);
CHAN[0].pts.filter((p,k)=>k%40===0).forEach(p=>SPINE.push([p[0],p[1]]));SPINE.push(DELTA.apex,[-1700,600],[-1500,1500],[900,1700],[-300,1800],[1500,2400]);
BIO.init({tags:'sedesert-bowl',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,field:TFIELD,placeH:placeH,
 mask:(x,z)=>{const d=placeH(x,z)-waterAt0(x,z);return d<.12?0:d<.5?(d-.12)/.38:1;},
 obstacles:OBSTACLES,ticks:tick,seed:2,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:520,mid:1150,far:2600,floor:[340,820]},
 windows:{water:[-1700,-1800,1900,3550]}});   /* the delta and the shore: the water-bound passes look nowhere else */
BIO.setSun([-900,600,700]);
_mark('stage');
