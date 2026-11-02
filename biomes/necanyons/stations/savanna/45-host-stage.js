// ================================================================= HOST — stage (the necanyons, station 3: the savanna floor toward Korona)
// The renderer, the light and the error panel as station 1's (src/45-host-stage.js); the map, the rock and the station's options below.
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
window._t={t0:performance.now()};const _mark=k=>{window._t[k]=Math.round(performance.now()-window._t.t0);};
// (TAU, clamp, smooth, fbm, rng... are the core's, made globals by the hyperjungle's 41: biomes/hyperjungle/src)
// THE GRAPHICS SET (2026-10-27, the final rebuild; core/biome README "Adopting it", the hyperjungle's 45 the worked example): the
// items' geometry welded and drawn by index (?index=0 the soup); one LOD mesh per chunk, small meshes merged to 1500 triangles, a
// dithered cross-fade over the last 15% of each range (?lodmerge=0, ?lodfade=0) and the per-instance range cull (?lodcull=0)
{const q=new URLSearchParams(location.search);BIO.INDEX_ITEMS=q.get('index')!=='0';
 BIO.LOD.merge=q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&q.get('lodfade')!=='0'?.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&q.get('lodcull')!=='0';}
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   // BIO.record: the volume as a core/tags record too (core/biome/20-core-kit.js)

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;document.body.appendChild(renderer.domElement);
// THE LIGHT: the hyperjungle's (its sky is read in place and paints its sun at this position), the haze a little warmer:
// the red rock under it
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xbcc2ae);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00026);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,14000);
const hemi=new THREE.HemisphereLight(0xc4d0c4,0x4a3a2a,.64);scene.add(hemi);
const SUN_POS=[-1200,900,-600];
const sun=new THREE.DirectionalLight(0xfff0d2,1.45);sun.position.set(...SUN_POS);scene.add(sun);
const fill=new THREE.DirectionalLight(0xc8b8a4,.3);fill.position.set(800,400,900);scene.add(fill);


// ---------------------------------------------------------------- STATION 3: THE SAVANNA FLOOR TOWARD KORONA (PLAN-STATIONS.md; 2026-10-27)
// The low, dry north of the `ne rim` polygon (px ~748, 268 on the scale model, approximate: the live model was not surveyed; ~-1,150 m,
// ~880 mm, Aw and BSh with XV): abyssal savanna between scattered sandstone stacks and buttes. Golden tussock grass on the savanna's
// red soil (the library's ground.savanna.litter), ember plums standing in it as the Terminalia of an Australian savanna, a dry WADI
// (KRELIEF.wadi: a braided cobble floor between cut banks, its fan) across the floor, DESERT PAVEMENT on the old flat ground beside it
// (KRELIEF.pavement, drawn as KGROUND's small clasts), SALT PANS in two hollows (core/water ext/54 WATER.pan: white crust, brine after
// rain: 89x-host-pans.js). The creek keeps a strip of gallery forest (the hyperjungle, read in place, only along it) with the
// monkeycups; the carnivores of the poor ground on the stacks' feet and ledges. Korona's ring ridge stands on the northern horizon
// (the far field's ring, 83-host-far.js).
const STATION_SKY={px:748,py:268};
const TERR={R:1600};
// THE CREEK: a thin stream down the east side, south to north toward the trench country
const CREEK={x:z=>520+120*Math.sin(z*.0016+.7)+30*Math.sin(z*.0061+2.1),w:5,depth:.45,name:'The savanna creek (its gallery forest)'};
const creekD=(x,z)=>Math.abs(x-CREEK.x(z));
// two hollows that hold the salt pans after the rains
const PANS=[{x:-620,z:-560,r:130,d:2.2},{x:-180,z:780,r:95,d:1.6}];
const floorRaw=(x,z)=>10*(fbm(x*.0007+2.3,z*.0007-6.1,23,3)-.5)*2+2.5*(fbm(x*.005-1,z*.005+3,37,2)-.5)*2+.003*z;
PANS.forEach(P=>{P.flat=floorRaw(P.x,P.z)-P.d;});   /* each hollow's floor dead flat: a pan lies on it */
function floorBase0(x,z){let h=floorRaw(x,z);for(const P of PANS){const d=Math.hypot(x-P.x,z-P.z);if(d<P.r*1.9)h=Math.min(h,h+(P.flat-h)*smooth(P.r*1.9,P.r*1.05,d));}return h;}
// THE WADI: from the north-west across the floor to the south-east, dry but for pools after rain
const WADI=KRELIEF.wadi({pts:(function(){const P=[];for(let i=0;i<=24;i++){const t=i/24,x=-1500+2600*t+90*Math.sin(t*7.1),z=-900+1700*t+120*Math.sin(t*4.3+1);P.push([x,z]);}return P;})(),
 ground:floorBase0,w:11,bank:2.2,bankW:3,braids:2.2,fan:false,seed:3301});
function floorBase(x,z){return KRELIEF.shape(WADI,x,z,floorBase0(x,z));}
function floorH(x,z){const b=floorBase(x,z),d=creekD(x,z),cut=smooth(CREEK.w+18,CREEK.w*.4,d);return b-3*cut;}
const PAVE=KRELIEF.pavement({h:floorH,ground:floorBase0,wadis:[WADI],patch:.4,scale:1/110,seed:3302});
const LAND={rebuild:true,capY:190,works:{fall:'highcap',springs:'bench'},spine:[[0,0],[860,-200],[150,-560],[CREEK.x(300),300]],   /* the LOD spine: the middle, the creek's mesa, the tall butte, the creek */

 ground:{base:'ground.savanna',baseTint:'vec3(0.48,0.60,0.50)',mottle:{tint:'vec3(1.25,1.3,0.66)',amt:.8},   /* less orange, mottled yellow (the owner, 2026-10-27) */
 pave:(x,z)=>NECANYONS.rockAt(x,z)?0:PAVE(x,z)*smooth(30,60,NECANYONS.footD(x,z)),paveMatrix:0xa8724e},
 clear:(x,z)=>smooth(220,60,creekD(x,z))};
const STATION_FAR={canopy:false,mesas:22,mesaK:.7,ring:{c:[600,-15500],r:7200,w:1400,h:900},label:'The far savanna, and Korona\'s ring ridge to the north'};
const STATION_BUILD={region:{name:'The savanna floor toward Korona (necanyons station 3)',x:0,z:0,r:1600,h:420},jbuild:{quality:.5,heroR:600},
 lod:{floor:900}};

// ---------------------------------------------------------------- the rock (KSTACKS records): buttes and stacks scattered on the savanna
const ROCK=(function(){const K=KSTACKS,L=[];
 const footY=(x,z,r)=>{let m=1e9;for(let i=0;i<32;i++){const a=i/32*TAU;for(const k of [.4,.8,1.15])m=Math.min(m,floorH(x+Math.cos(a)*r*k,z+Math.sin(a)*r*k));}return m-3;};
 const add=(B,name)=>{B.name=name;L.push(B);return B;};
 const mesa=(id,seed,x,z,tiers,name)=>add(K.make({id,kind:tiers.length>1?'mesa':'butte',x,z,y0:footY(x,z,tiers[0].r*Math.sqrt(tiers[0].e||1.3)),seed,tiers}),name);
 // a low two-tier mesa by the creek (its springs) and the tallest butte west of it (its fall)
 mesa('bench',3101,980,-180,[{h:150,r:300,e:1.6,ry:.3},{h:70,r:140,e:1.3,dx:80,dz:-90}],'A low mesa by the creek');
 mesa('highcap',3102,150,-640,[{h:210,r:170,e:1.25,ry:-.5},{h:60,r:100,e:1.2}],'The tall butte');
 [[-1050,180,150,120],[-420,-1150,170,110],[700,980,130,100]].forEach((t,i)=>mesa('butte'+i,3110+i,t[0],t[1],[{h:t[2],r:t[3],e:1.3,ry:i*.8}],'A butte on the savanna'));
 const big=L.slice();
 const clear=(x,z,r,pad)=>{for(const B of big){const f=K.foot([B],x,z);if(f&&f.d<r+pad)return false;}const w=KRELIEF.at(WADI,x,z,floorBase0(x,z));return creekD(x,z)>r+50&&!(w&&w.part!=='plain')&&Math.hypot(x,z)<TERR.R*.88;};
 K.cluster({id:'floorstack',seed:3201,c:[-200,100],rad:1200,n:14,H:[50,140],r:[9,22],gap:60,kinds:{spire:.45,fin:.35,balanced:.2},
  ground:(x,z)=>footY(x,z,22)+2,accept:(x,z,r)=>clear(x,z,r,50)}).forEach(B=>add(B,B.kind==='fin'?'A sandstone fin':B.kind==='balanced'?'A balanced rock':'A sandstone stack'));
 if(new URLSearchParams(location.search).get('arches')!=='0'){
  const ring=(c0,r0,n,salt)=>{const out=[];for(let i=0;i<n;i++){const a=KRAND.unit(KRAND.hash(salt,i,1))*TAU,r=r0*Math.sqrt(KRAND.unit(KRAND.hash(salt,i,2)));out.push([c0[0]+Math.cos(a)*r,c0[1]+Math.sin(a)*r]);}return out;};
  for(const p of ring([-300,300],900,40,3401)){if(!clear(p[0],p[1],30,30)||!L.every(B=>Math.hypot(B.x-p[0],B.z-p[1])>B.R+40))continue;
   let B=null;for(let k=0;k<3&&!B;k++){try{B=K.make({kind:'arch',id:'floorarch',x:p[0],z:p[1],span:34+k*3,rise:24+k*3,H:40+k*4,t:8,leg:14,ry:.8,seed:KRAND.hash(3401,k),ground:(x,z)=>floorH(x,z)-1,inward:.12});}catch(e){}}
   if(B){add(B,'A natural bridge on the savanna');break;}}}
 return L;})();
const STATION_TAKE={title:'Krator biome — the north-eastern canyons: the savanna floor toward Korona',maxShare:.013,
 hint:'Station 3 of the north-eastern canyons: savanna between sandstone stacks, a dry wadi, desert pavement, salt pans; Korona\'s ring ridge to the north. N for night',
 absent:['potholewort'],
 views:{'The savanna floor':[1500,300,1400,-100,60,-200],'Toward Korona (north)':[300,140,1300,300,200,-6000],
  'The wadi':[WADI.pts[12].x+40,WADI.pts[12].y+14,WADI.pts[12].z+30,WADI.pts[10].x,WADI.pts[10].y,WADI.pts[10].z],
  'A salt pan':[PANS[0].x+170,floorH(PANS[0].x,PANS[0].z)+26,PANS[0].z+140,PANS[0].x,floorH(PANS[0].x,PANS[0].z),PANS[0].z],
  'The creek\'s gallery forest':[CREEK.x(300)-60,floorH(CREEK.x(300),300)+20,300,CREEK.x(-200),15,-200],'Krator rising':[-500,180,700,1900,900,-2100]},
 checks(add){const w=WADI.pts,climb=w.some((p,i)=>i&&p.y>w[i-1].y+1e-6),pv=[0,0];for(let i=0;i<400;i++){const x=-1400+2800*KRAND.unit(KRAND.hash(3390,i,1)),z=-1400+2800*KRAND.unit(KRAND.hash(3390,i,2));if(PAVE(x,z)>.5)pv[0]++;pv[1]++;}
  add('the wadi never climbs; pavement on the old flats; the pans drawn',{ok:!climb&&pv[0]>20&&!!(window._pans&&window._pans===PANS.length),detail:'wadi '+w.length+' points'+(climb?' (climbs!)':'')+'; pavement over .5 at '+pv[0]+' of '+pv[1]+' samples; pans drawn '+(window._pans||0)});}};
