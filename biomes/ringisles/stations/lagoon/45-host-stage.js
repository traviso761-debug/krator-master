// ================================================================= HOST — stage (station 3: the lagoon; replaces src/45-host-stage.js)
// The renderer, the light and the graphics set are src/45's, word for word; the map is the bank's (below).
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
// a shader that fails to compile is only a console error in three.js and its mesh silently does not draw: the panel shows it
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
window._t={t0:performance.now()};const _mark=k=>{window._t[k]=Math.round(performance.now()-window._t.t0);if(/[?&]marks/.test(location.search))console.warn('mark '+k+' '+window._t[k]);};
// (TAU, clamp, smooth, fbm, rng... are the core's, made globals by the hyperjungle's 41: biomes/hyperjungle/src)
// THE GRAPHICS SET (BACKPORT.md section 1, GRAPHIC-LOAD.md; the final rebuild, pair 8), as oidong's: item geometry welded (?index=0), the chunk meshes
// merged with a floor of 1,500 triangles (?lodmerge=0), the LOD cross-fade (?lodfade=0) and each loose instance culled past its own range (?lodcull=0)
{const q=new URLSearchParams(location.search);BIO.INDEX_ITEMS=q.get('index')!=='0';
 BIO.LOD.merge=q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&q.get('lodfade')!=='0'?.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&q.get('lodcull')!=='0';
}
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   // BIO.record: the volume as a core/tags record too
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r&&y>=(r.y||0)-2&&y<=(r.y||0)+r.h+5;}

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;document.body.appendChild(renderer.domElement);
// THE LIGHT: the sea's level under ~1.9 atm, hot: a milky sky, a strong blue fill, a pale haze; the sun in the south-west
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xc2cabe);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00026);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.5,16000);
const hemi=new THREE.HemisphereLight(0xc4d4cc,0x48463a,.7);scene.add(hemi);
const SUN_POS=[-900,820,700];
const sun=new THREE.DirectionalLight(0xfff0d0,1.4);sun.position.set(...SUN_POS);scene.add(sun);
const fill=new THREE.DirectionalLight(0xb0ccc4,.3);fill.position.set(900,400,-900);scene.add(fill);
// the trade wind, from the east: the geysers' steam leans west
const WIND=[-.9,.2];

// ================================================================= STATION 3, THE LAGOON (PLAN-STATIONS.md, station 3; the owner asked for it, 2026-11-02)
// A cut of the great bank off the Beast Riders' lee shore (scale model 5.1 px 1002,779: 520 km2 awash under 5 m, deep water at its outer edge): a lagoon
// inside a reef rim awash at the sea's level, three motu on the rim with the kit's strand and forest, a pass through the rim on the south-east where the
// swell breaks and the tide runs, the floor of sand and seagrass with coral heads (patch reefs) under 2-20 m of clear water, the fore reef falling to the
// deep outside. The plan's lagoon is 8-10 km across; this cut is 6.4 x 5.6 km inside the rim (a 7.6 x 6.8 km map), so the far rim stands on the horizon
// from the near motu and the near rim, its surf and its pass fill the near views. The XA islands and the lee shore's hypertree wall are the sky's ridges
// (89-host-sky.js). Everything after this stage is src/'s, read with the knobs below (STATION): the kit and its passes are unchanged.
// THE MAP (x east, z south, y up from the sea): the rim's crest an ellipse about the lagoon's centre (0, 0), rx 3200, rz 2800, noise on it; the motu on
// the rim at the north-east, the north-west and the west; the pass at the south-east.
// The island's places the bank has not got are kept, off the map (off: true), so the fragments that read them read nothing there: no mangal (BAY), no
// salt pan (PAN), no vent (VENT; the geyser kit's passes do not run), no upper garden. The tide-pool bench is beachrock on the north-east motu's ocean
// side; the garden is the fish camp's on the same motu (coconut, breadfruit, taro pits, as an atoll's are).
const STATION={key:'lagoon',groundCs:8,fieldCs:16,shoreCell:12,geyser:false,center:[0,0],
 lod:{hero:230,mid:620,far:3400,floor:[190,460]},
 region:{name:'The lagoon (a cut of the great bank, station 3)',x:0,z:0,y:-40,r:3700,h:70},
 spine:null,   /* the LOD lattice: the motu and the rim (below, once the map is made); none over the open lagoon, whose floor is seen from afar */
 seaBed:h=>h};   /* the water reads the rim's true bed: the swell shoals and breaks on the reef flat (the island floors its lagoon at 1.6 m: 89w) */
const TERR={R:3700,X0:-3800,X1:3800,Z0:-3400,Z1:3400};
const SEA=0;
function ell(x,z,cx,cz,rx,rz,a){const c=Math.cos(a||0),s=Math.sin(a||0),dx=x-cx,dz=z-cz,u=(dx*c+dz*s)/rx,v=(-dx*s+dz*c)/rz;return 1-(u*u+v*v);}
// THE RIM: its crest line, an ellipse with a slow wander; rimD the signed distance (m, + inside: toward the lagoon) to the crest's outer edge
const RIM={cx:0,cz:0,rx:3200,rz:2800};
const rimR=(x,z)=>{const dx=(x-RIM.cx)/RIM.rx,dz=(z-RIM.cz)/RIM.rz;return Math.hypot(dx,dz)*(1+.035*(fbm(x*.0009,z*.0009,7801,2)-.5));};
const rimD=(x,z)=>(1-rimR(x,z))*(RIM.rx+RIM.rz)*.5;
// THE PASS: the rim broken at the south-east, ~220 m wide and ~12 m deep (the tide's road in and out)
const PASS={a:Math.atan2(.62,.78),w:110,depth:-12,name:'The pass (the tide runs through the rim here)'};
const passK=(x,z)=>{const a=Math.atan2((z-RIM.cz)/RIM.rz,(x-RIM.cx)/RIM.rx),d=Math.abs(Math.atan2(Math.sin(a-PASS.a),Math.cos(a-PASS.a)))*(RIM.rx+RIM.rz)*.5;return smooth(PASS.w*1.8,PASS.w,d);};
// THE MOTU: low sand islets on the rim, each a crest bearing; an ellipse along the rim, the reef flat round it
const MOTU=[{a:-.75,len:900,wid:210,name:'The north-east motu (the fish camp)'},{a:-2.05,len:650,wid:170,name:'The north-west motu'},{a:3.05,len:520,wid:150,name:'The west motu'}].map(M=>{
 const x=RIM.cx+Math.cos(M.a)*RIM.rx*.985,z=RIM.cz+Math.sin(M.a)*RIM.rz*.985,t=Math.atan2(Math.cos(M.a)*RIM.rz,-Math.sin(M.a)*RIM.rx);return Object.assign(M,{x,z,t});});
// the land: inside a motu's ellipse (1 at its centre, 0 on its edge), the rim's noise on its edge
function landF(x,z,inflate){const k=inflate||0;let e=-1;for(const M of MOTU)e=Math.max(e,ell(x,z,M.x,M.z,M.len/2+k,M.wid/2+k,M.t));
 return e+.12*(fbm(x*.006,z*.006,7802,2)-.5);}
// SIGNED DISTANCE to the coast (m, + inland) on a 16 m grid (the island's chamfer, coarser: the map is 2.3 times as wide), and the reef's line (the rim's
// outer edge: rimD) for the kit's reef field
const SDG=(function(){const cs=16,nx=Math.ceil((TERR.X1-TERR.X0)/cs)+1,nz=Math.ceil((TERR.Z1-TERR.Z0)/cs)+1;
 function grid(inside){const N=nx*nz,ins=new Uint8Array(N),dI=new Float32Array(N),dO=new Float32Array(N),BIG=1e9;
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)ins[j*nx+i]=inside(TERR.X0+i*cs,TERR.Z0+j*cs)?1:0;
  const run=(D,want)=>{for(let k=0;k<N;k++)D[k]=ins[k]===want?0:BIG;const a=cs,b=cs*Math.SQRT2;
   for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i;let v=D[k];if(!v)continue;
    if(i>0)v=Math.min(v,D[k-1]+a);if(j>0){v=Math.min(v,D[k-nx]+a);if(i>0)v=Math.min(v,D[k-nx-1]+b);if(i<nx-1)v=Math.min(v,D[k-nx+1]+b);}D[k]=v;}
   for(let j=nz-1;j>=0;j--)for(let i=nx-1;i>=0;i--){const k=j*nx+i;let v=D[k];if(!v)continue;
    if(i<nx-1)v=Math.min(v,D[k+1]+a);if(j<nz-1){v=Math.min(v,D[k+nx]+a);if(i<nx-1)v=Math.min(v,D[k+nx+1]+b);if(i>0)v=Math.min(v,D[k+nx-1]+b);}D[k]=v;}};
  run(dI,0);run(dO,1);
  const S=new Float32Array(N);for(let k=0;k<N;k++)S[k]=ins[k]?dI[k]-cs*.5:-(dO[k]-cs*.5);return S;}
 const coast=grid((x,z)=>landF(x,z)>0);
 const at=(S,x,z)=>{const u=clamp((x-TERR.X0)/cs,0,nx-1.001),v=clamp((z-TERR.Z0)/cs,0,nz-1.001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,k=j*nx+i;
  return S[k]*(1-fu)*(1-fv)+S[k+1]*fu*(1-fv)+S[k+nx]*(1-fu)*fv+S[k+nx+1]*fu*fv;};
 return{cs,nx,nz,coast,sd:(x,z)=>at(coast,x,z)};})();
const coastD=SDG.sd;
// the reef's line for the kit (+ inside: the lagoon side): the rim is the reef, the line 20 m in from the crest's outer edge, so the kit's reef field
// (reefD -40 .. +40) is the flat awash
const reefD=(x,z)=>rimD(x,z)-20;
function coastPoint(x0,z0,a){let lo=0,hi=1200;for(let k=0;k<40;k++){const m=(lo+hi)/2;if(coastD(x0+Math.cos(a)*m,z0+Math.sin(a)*m)>0)lo=m;else hi=m;}return[x0+Math.cos(a)*lo,z0+Math.sin(a)*lo];}

// ---------------------------------------------------------------- the places
const OFF={x:1e6,z:1e6,off:true};
const BAY=Object.assign({r:1,name:'(no mangal on the bank)'},OFF);
// THE BENCH: beachrock on the north-east motu's ocean side, awash at high water, with its tide pools
const BENCH=(function(){const M=MOTU[0],p=coastPoint(M.x,M.z,M.a);return{x:p[0],z:p[1],r:110,level:.55,name:'The beachrock (tide pools on the north-east motu\'s ocean side)'};})();
const POOLS=(function(){reseed(7201);const P=[];for(let t=0;t<400&&P.length<12;t++){const a=rr(0,TAU),d=rr(0,BENCH.r*.75),x=BENCH.x+Math.cos(a)*d,z=BENCH.z+Math.sin(a)*d,s=coastD(x,z),r=rr(1.6,4);
  if(s<-18||s>12)continue;if(P.some(q=>Math.hypot(q.x-x,q.z-z)<q.r+r+2))continue;P.push({x,z,r,level:BENCH.level-.1-rr(0,.08),floor:BENCH.level-.55-rr(0,.25)});}return P;})();
const PAN=Object.assign({rx:1,rz:1,a:0,floor:0,name:'(no salt pan on the bank)'},OFF);
const panE=()=>99;
const BRINE=[];
const VENT=Object.assign({r:1,seed:4421,name:'(no vent on the bank)'},OFF);
// THE FISH CAMP's gardens on the north-east motu's lagoon side: coconuts, breadfruit and taro pits (an atoll's gardens), [key, x, z, w, d] in its frame
const GARDEN=(function(){const M=MOTU[0],x=M.x-Math.cos(M.a)*45,z=M.z-Math.sin(M.a)*45;return{x,z,a:M.t,name:'The fish camp\'s gardens (coconut, breadfruit, taro pits)'};})();
const GARDEN2=Object.assign({a:0,name:'(no upper garden on the bank)'},OFF);
const PLOTS=(function(){const L=[];const add=(key,x,z,w,d,o)=>L.push(Object.assign({key,u:x,v:z,w,d,g:GARDEN},o||{}));
 add('crop-coconut',-150,0,90,40);add('crop-coconut',120,-5,80,40);add('crop-breadfruit',-30,-4,50,34);add('crop-taro',40,6,26,16);add('crop-taro',70,6,20,14);
 L.forEach(P=>{const G=P.g,c=Math.cos(G.a),s=Math.sin(G.a);P.x=G.x+P.u*c-P.v*s;P.z=G.z+P.u*s+P.v*c;P.a=G.a;P.r=Math.hypot(P.w,P.d)/2;delete P.g;});return L;})();
const nearGardens=(x,z)=>Math.hypot(x-GARDEN.x,z-GARDEN.z)<260;
function inPlot(P,x,z,e){const c=Math.cos(P.a),s=Math.sin(P.a),dx=x-P.x,dz=z-P.z,u=dx*c+dz*s,v=-dx*s+dz*c;
 return smooth(P.w/2+e,P.w/2,Math.abs(u))*smooth(P.d/2+e,P.d/2,Math.abs(v));}

// ---------------------------------------------------------------- the bank's ground
// no hills: the motu are sand a few metres over the sea, with a storm ridge on the ocean side
function hillsH(x,z){return 0;}
const shoreH=sd=>2.1*smooth(-30,35,sd)-.5;
const mudH=sd=>shoreH(sd);
const bayK=()=>0;
// the lagoon's floor: ~13 m with broad swales and sand flats, shoaling to the back reef; the PATCH REEFS (coral heads) rise from it, a few to within 2 m
const HEADS=(function(){reseed(7803);const L=[];for(let t=0;t<900&&L.length<140;t++){const a=rr(0,TAU),u=Math.sqrt(rng())*.86,x=Math.cos(a)*u*RIM.rx,z=Math.sin(a)*u*RIM.rz,r=rr(14,60);
  if(L.some(q=>Math.hypot(q.x-x,q.z-z)<q.r+r+30))continue;L.push({x,z,r,top:-rr(1.6,8)});}return L;})();
function lagoonFloor(x,z){const rd=rimD(x,z);let h=-13+3.5*(fbm(x*.0012,z*.0012,7804,3)-.5)*2+1.2*(fbm(x*.006,z*.006,7805,2)-.5);
 h=mix(h,-3.2+.6*(fbm(x*.01,z*.01,7806,2)-.5),smooth(520,140,rd));   /* the sand apron behind the rim */
 for(const H of HEADS){const d=Math.hypot(x-H.x,z-H.z);if(d<H.r*1.6)h=Math.max(h,mix(h,H.top+1.2*(fbm(x*.05,z*.05,7807,2)-.5),smooth(H.r*1.5,H.r*.6,d)));}
 return h;}
function seaH(x,z){const rd=rimD(x,z),pk=passK(x,z);
 const crest=-.3+.16*(fbm(x*.03,z*.03,7808,2)-.5);   /* the reef flat: awash at the sea's level, its pools and channels */
 let h;
 if(rd>140)h=lagoonFloor(x,z);
 else if(rd>-30)h=mix(crest,lagoonFloor(x,z),smooth(60,140,rd));
 else h=mix(crest,-60,smooth(-30,-520,rd));   /* the fore reef, spurs and grooves on it */
 if(rd<-30&&rd>-260)h+=1.4*Math.sin(Math.atan2(z,x)*420)*smooth(-30,-90,rd)*smooth(-260,-160,rd);
 if(pk>0)h=mix(h,Math.min(h,PASS.depth+2*(fbm(x*.02,z*.02,7809,2)-.5)),pk*smooth(-420,-120,rd)*smooth(700,250,rd));
 return h;}
function landH(x,z){const sd=coastD(x,z);
 let h=seaH(x,z);
 if(sd>-60){const shore=shoreH(sd);h=mix(h,Math.max(h,shore),smooth(-60,-8,sd));}
 if(sd>0){const o=MOTU.reduce((b,M)=>{const e=ell(x,z,M.x,M.z,M.len/2,M.wid/2,M.t);return e>b.e?{e,M}:b;},{e:-9,M:null});
  /* the storm ridge on the ocean side of each motu: coral rubble thrown up by the swells */
  if(o.M){const out=(x-o.M.x)*Math.cos(o.M.a)+(z-o.M.z)*Math.sin(o.M.a);h+=1.4*smooth(0,o.M.wid*.3,out)*smooth(o.M.wid*.55,o.M.wid*.3,out)+.6*smooth(10,60,sd);}}
 // the bench's beachrock shelf at its level, its pools let into it
 const bkh=smooth(BENCH.r*1.1,BENCH.r*.7,Math.hypot(x-BENCH.x,z-BENCH.z))*smooth(-40,-22,sd)*smooth(30,14,sd);
 if(bkh>0){const lev=BENCH.level+.2*(fbm(x*.05,z*.05,7306,2)-.5)+.4*smooth(8,30,sd);h=mix(h,Math.max(lev,sd>0?h*.5+lev*.5:lev),bkh);
  for(const P of POOLS){const d=Math.hypot(x-P.x,z-P.z);if(d<P.r*1.25)h=mix(h,P.floor,smooth(P.r*1.15,P.r*.55,d));}}
 if(nearGardens(x,z))for(const P of PLOTS){if(Math.abs(x-P.x)>P.r+4||Math.abs(z-P.z)>P.r+4)continue;const k=inPlot(P,x,z,1.8);if(k>0)h=mix(h,P.level,k);}
 return h;}
PLOTS.forEach(P=>{P.level=null;});
{const keep=PLOTS.slice();PLOTS.length=0;keep.forEach(P=>{P.ground=landH(P.x,P.z);});keep.forEach(P=>{P.level=Math.max(.6,P.ground-(P.key==='crop-taro'?.6:0));PLOTS.push(P);});}

// ---------------------------------------------------------------- the climate
// The bank lies under the lee shore's wet air (5.1: the shelf's islands XA): wet, low, hot. The motu are XA by the kit's rule (low ground), with a dry
// share on the narrow west motu, which the swell's salt spray keeps in strand and scrub (the kit reads salt and beach from the fields)
function dryAt(x,z,h){return clamp(.2+.12*smooth(-1000,-2800,x)+.08*(fbm(x*.0016+7,z*.0016-2,7401,2)-.5),0,1);}
const KOPPEN=['XA','Af','Am','Aw','XV','BSh','XS'];
function classesAt(x,z,h,sd){const D=dryAt(x,z,h),low=1-smooth(18,48,h);
 const wet=1-smooth(.26,.34,D),mon=smooth(.26,.34,D)*(1-smooth(.4,.47,D)),sav=smooth(.4,.47,D)*(1-smooth(.64,.72,D)),stp=smooth(.64,.72,D);
 return{'XA':wet*low,'Af':wet*(1-low),'Am':mon,'Aw':sav*(1-low),'XV':sav*low,'BSh':stp*(1-low),'XS':stp*low};}

// ---------------------------------------------------------------- the station's views and the checks it skips (src/99-host-take.js reads them)
// the island's checks the bank has nothing for: its classes are XA alone (no savanna, steppe, salt or monsoon ground), so not every species is placed and
// none burns; no mangal, no vent; the fish camp's five plots are not the island's two gardens
STATION.skip=['classes','placed','burn','gardens','mangal','thermal'];
STATION.night=['The lagoon at night'];
const STATION_VIEWS=function(H){const M=MOTU[0],pa=PASS.a,px=Math.cos(pa)*RIM.rx,pz=Math.sin(pa)*RIM.rz,P=POOLS[0]||{x:BENCH.x,z:BENCH.z,level:BENCH.level},
  HD=HEADS.slice().sort((a,b)=>b.top-a.top)[0],BE=H.bestAt((f,x,z)=>f('beach')*smooth(1400,300,Math.hypot(x-M.x,z-M.z)));
 return{
 'The lagoon from above':[3900,1100,3500,-300,-8,-300],
 'The north-east motu (the fish camp)':H.toward(GARDEN.x-Math.cos(M.a)*220,GARDEN.z-Math.sin(M.a)*220,GARDEN.x,GARDEN.z,240,22,2),
 'The pass (the rim broken, the swell breaking)':[px*.82,14,pz*.82,px*1.04,0,pz*1.04],
 'The reef flat at the rim':H.toward(Math.cos(-1.4)*RIM.rx*.96,Math.sin(-1.4)*RIM.rz*.96,Math.cos(-1.4)*RIM.rx*1.0,Math.sin(-1.4)*RIM.rz*1.0,60,3,-.4),
 'The beachrock tide pools':[P.x+7,BENCH.level+1.8,P.z+5,P.x,P.level-.2,P.z],
 'A patch reef (coral heads in clear water)':[HD.x+HD.r*1.4,7,HD.z+HD.r*1.4,HD.x,HD.top,HD.z],
 'The motu\'s strand':H.toward(BE[0]+30,BE[1]+20,BE[0],BE[1],40,1.7,1),
 'The far rim from the camp':[GARDEN.x,6,GARDEN.z,-Math.cos(M.a)*RIM.rx,0,-Math.sin(M.a)*RIM.rz],
 'The lagoon at night':[2600,240,-2200,0,10,0]};};
STATION.views=STATION_VIEWS;   /* src/99 reads STATION.views; tools/check_views.py reads the STATION_VIEWS form */

// the LOD spine: every 500 m along the rim's crest, the motu's lattice, the camp and the beachrock
STATION.spine=(function(){const L=[];for(let k=0;k<44;k++){const a=k/44*TAU;L.push([RIM.cx+Math.cos(a)*RIM.rx,RIM.cz+Math.sin(a)*RIM.rz]);}
 for(let z=TERR.Z0;z<=TERR.Z1;z+=300)for(let x=TERR.X0;x<=TERR.X1;x+=300)if(coastD(x,z)>-60)L.push([x,z]);
 L.push([GARDEN.x,GARDEN.z],[BENCH.x,BENCH.z]);return L;})();
