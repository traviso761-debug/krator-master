// ================================================================= HOST — stage (the necanyons, station 2: the high benches)
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


// ---------------------------------------------------------------- STATION 2: THE HIGH BENCHES (PLAN-STATIONS.md; 2026-10-27, the final rebuild)
// The raised middle of the `ne rim` polygon (px ~742, 302 on the scale model, approximate: the live model was not surveyed): benches
// and mesas standing into cooler air (Cfa) with dry tops (BSh), the canyons between them deeper and greener, and the first TEPUI-LIKE
// TABLES: sheer quartzite walls (the library's rock.quartzite.tepui) over the canyon's red beds, the strata a tepui formation over the
// canyon one (KSTRATA formations), flat tops with sun pitchers and yellow tubes. The flametip scrub forest thickens on the benches
// (87-host-station.js), fonio in the pans. Station 1's water works move to a tepui's seep line (its fall) and the long bench's
// (its springs). The hyperjungle on the canyon floors, thinner than at Pinnacle Rock.
const STATION_SKY={px:742,py:302};
const LAND={rebuild:true,capY:300,works:{fall:'highcap',springs:'bench'},
 strata:{formations:[{recipe:'canyon',base:-80,top:230},{recipe:'tepui'}],range:[-80,620],dip:[.4,-.9,.006],warp:[7,2]},
 clear:(x,z)=>.85};
const STATION_FAR={mesas:46,mesaK:1.35,label:'The far benches and tables (past the map)'};
const STATION_BUILD={region:{name:'The high benches (necanyons station 2)',x:0,z:0,r:1600,h:640},jbuild:{quality:.55}};
// ---------------------------------------------------------------- the canyon floor
const TERR={R:1600};
// THE CREEK: a deeper canyon's stream down the middle, north-west to south-east
const CREEK={x:z=>-260+180*Math.sin(z*.0018+1.1)+50*Math.sin(z*.0049+.3),w:9,depth:.7,name:'The canyon stream (between the benches)'};
const creekD=(x,z)=>Math.abs(x-CREEK.x(z));
function floorBase(x,z){return 18*(fbm(x*.0008+5.1,z*.0008-2.7,19,3)-.5)*2+5*(fbm(x*.004-4,z*.004+7,31,2)-.5)*2-.005*z;}
function floorH(x,z){const b=floorBase(x,z),d=creekD(x,z),cut=smooth(CREEK.w+26,CREEK.w*.4,d);return b-5*cut;}

// ---------------------------------------------------------------- the rock (KSTACKS records)
const ROCK=(function(){const K=KSTACKS,L=[];
 const footY=(x,z,r)=>{let m=1e9;for(let i=0;i<32;i++){const a=i/32*TAU;for(const k of [.4,.8,1.15])m=Math.min(m,floorH(x+Math.cos(a)*r*k,z+Math.sin(a)*r*k));}return m-3;};
 const add=(B,name)=>{B.name=name;L.push(B);return B;};
 const mesa=(id,seed,x,z,tiers,name,o)=>add(Object.assign(K.make({id,kind:tiers.length>1?'mesa':'butte',x,z,y0:footY(x,z,tiers[0].r*Math.sqrt(tiers[0].e||1.3)),seed,tiers}),o||{}),name);
 // the long bench east of the stream (its springs at the seep lines), and the tallest table west of it (its fall)
 mesa('bench',2101,620,120,[{h:240,r:460,e:1.7,ry:.5},{h:120,r:230,e:1.4,dx:140,dz:-120}],'The long bench (a two-tier mesa)');
 mesa('highcap',2102,-760,-520,[{h:250,r:300,e:1.2,ry:-.4},{h:220,r:230,e:1.15,dx:-20,dz:10}],'The great table (a tepui: quartzite over the canyon\'s red beds)',{wallLib:'rock.tepui'});
 mesa('tepui1',2103,-900,640,[{h:230,r:220,e:1.3,ry:.9},{h:170,r:170,e:1.2}],'A tepui table',{wallLib:'rock.tepui'});
 mesa('tepui2',2104,260,-980,[{h:260,r:240,e:1.25,ry:.2},{h:160,r:180,e:1.1,dx:30,dz:-20}],'A tepui table',{wallLib:'rock.tepui'});
 [[1150,-560,210,240],[150,1120,180,260],[1180,900,200,200]].forEach((t,i)=>mesa('bench'+(i+1),2110+i,t[0],t[1],[{h:t[2],r:t[3],e:1.4,ry:i*.9}],'A bench'));
 [[-1250,-60,300,70],[480,-420,280,60],[-420,180,260,55]].forEach((t,i)=>mesa('tower'+i,2120+i,t[0],t[1],[{h:t[2],r:t[3],e:1.15+.1*(i%2),ry:i*.7}],'A sandstone tower'));
 const big=L.slice();
 const clear=(x,z,r,pad)=>{for(const B of big){const f=K.foot([B],x,z);if(f&&f.d<r+pad)return false;}return creekD(x,z)>r+60&&Math.hypot(x,z)<TERR.R*.86;};
 K.cluster({id:'floorstack',seed:2201,c:[-80,-120],rad:700,n:5,H:[110,170],r:[14,24],gap:40,kinds:{spire:.6,fin:.3,balanced:.1},
  ground:(x,z)=>footY(x,z,24)+2,accept:(x,z,r)=>clear(x,z,r,60)}).forEach(B=>add(B,B.kind==='fin'?'A sandstone fin':B.kind==='balanced'?'A balanced rock':'A sandstone spire'));
 const bench=L[0],onBench=(x,z,pad)=>{const a=K.at([bench],x,z);return a&&a.b.tier===0&&a.d<-pad?a:null;},benchTop=(x,z)=>K.topAt([bench],x,z);
 const capFoot=(x,z)=>{const cb=bench.beds.find(b=>b.tier===1);return Math.hypot(x-cb.cx,z-cb.cz)-KSTACKS.footR(cb,Math.atan2(z-cb.cz,x-cb.cx));};
 K.row({id:'benchfin',seed:2301,a:[420,400],b:[880,330],n:5,H:[45,80],r:[8,12],e:[5,8],jitter:10,ground:(x,z)=>benchTop(x,z)})
  .filter(B=>onBench(B.x,B.z,30)&&capFoot(B.x,B.z)>40).forEach(B=>add(B,'A fin on the long bench\'s rim'));
 // hoodoos on the great table's top (the tepui's own: a rock garden of grey pinnacles)
 const hc=L[1],onCap=(x,z,pad)=>{const a=K.at([hc],x,z);return a&&a.b.tier===1&&a.d<-pad;};
 K.cluster({id:'tablehoodoo',seed:2303,c:[hc.beds[hc.beds.length-1].cx,hc.beds[hc.beds.length-1].cz],rad:140,n:9,H:[14,32],r:[3,6],gap:8,kinds:{spire:.75,balanced:.25},
  ground:(x,z)=>K.topAt([hc],x,z),accept:(x,z,r)=>onCap(x,z,r+10)}).forEach(B=>{B.wallLib='rock.tepui';add(B,'A quartzite pinnacle on the great table');});
 if(new URLSearchParams(location.search).get('arches')!=='0'){
  const ring=(c0,r0,n,salt)=>{const out=[];for(let i=0;i<n;i++){const a=KRAND.unit(KRAND.hash(salt,i,1))*TAU,r=r0*Math.sqrt(KRAND.unit(KRAND.hash(salt,i,2)));out.push([c0[0]+Math.cos(a)*r,c0[1]+Math.sin(a)*r]);}return out;};
  for(const p of ring([560,160],260,20,2401)){if(!onBench(p[0],p[1],40)||capFoot(p[0],p[1])<60||!L.every(B=>B===bench||Math.hypot(B.x-p[0],B.z-p[1])>B.R+30))continue;
   let B=null;for(let k=0;k<3&&!B;k++){try{B=K.make({kind:'arch',id:'bencharch',x:p[0],z:p[1],span:30+k*3,rise:20+k*3,H:34+k*4,t:7,leg:12,ry:.3,seed:KRAND.hash(2401,k),ground:(x,z)=>benchTop(x,z),inward:.12});}catch(e){}}
   if(B){add(B,'A free-standing arch on the long bench');break;}}}
 return L;})();
const STATION_TAKE={title:'Krator biome — the north-eastern canyons: the high benches',
 hint:'Station 2 of the north-eastern canyons: the high benches, the first tepui tables (grey quartzite over red sandstone), flametip scrub. N for night',
 views:{'The high benches':[1700,640,1500,0,220,-100],'The great table':[-200,420,-80,-760,330,-520],
  'The canyon stream':[CREEK.x(700)+25,floorH(CREEK.x(700),700)+16,700,CREEK.x(200),25,200],'Krator rising':[-500,180,700,1900,900,-2100]},
 more(V){const tw=ROCK.find(B=>B.id==='tepui2');if(tw)V['A tepui out of the forest']=[tw.x+420,160,tw.z+300,tw.x,tw.top*.6,tw.z];
  const hc=ROCK.find(B=>B.id==='highcap');if(hc){const cb=hc.beds[hc.beds.length-1];V['On the great table (sun pitchers, yellow tubes)']=[cb.cx+50,hc.top+8,cb.cz+70,cb.cx-50,hc.top-2,cb.cz-60];}}};
