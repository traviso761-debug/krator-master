// ================================================================= HOST — stage (a Ring Sea isle: the isle demo's ideal type)
// The ideal-type host for the RINGISLES kit: renderer, light, and one synthetic island whose climate bands run the whole
// range the isle demo's land has (settlements/isle-demo/PLAN.md, the assay of scale model 4.21), so every zone of the kit
// stands somewhere a camera can reach. A real world replaces this section: it hands the kit the scale model's climate
// classes as fields ('koppen:Af', 'koppen:Aw'...: soft weights that sum to 1 on land) and its own shore fields.
//
// WHERE: an island of the Ring Sea archipelago at the sea's level (-1,500 m below the datum, ~1.9 atm), hot (27-39 degC
// annual means) and wet to dry (550-4,000 mm) by its side of the island. The trade wind blows from the east.
//
// THE MAP (x east, z south, y up from the sea; the island ~3.4 x 2 km, the map R 2000).
//   THE MOUNTAIN    the windward peak, ~190 m, east of the middle: the rain falls on its east side and in its lee it is dry
//   WINDWARD (east) hypertropic jungle (XA) on the low ground by the sea, rainforest (Af) up the slope, monsoon forest
//                   (Am) where the rain begins to fail
//   THE LEE         tall-grass savanna (Aw) on the higher ground, abyssal savanna (XV) on the low ground, both burnt in a
//                   mosaic; hot steppe (BSh) on the low hills of the western peninsula; abyssal salt steppe (XS) on its
//                   flats, and at its tip a SALT PAN with brine pools (the islanders' salt works)
//   THE SHORE       a beach all round (dunes on the lee), a TIDE-POOL BENCH of reef rock on the windward headland (NE)
//   THE LAGOON      the south bay: mangroves on its mud, a sand and seagrass floor with coral heads, the REEF across its
//                   mouth and round the whole island (a fringing reef: its crest just under the surface, the drop beyond)
//   THE VENT        a geyser field on the low ground north of the middle (the geyser kit's GEYSER.cluster, read in place)
//   THE GARDENS     a village's fields east of the bay: paddies, taro, bananas, breadfruit, coconuts, kava, sweet potatoes, herbs, greens, cane
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
// a shader that fails to compile is only a console error in three.js and its mesh silently does not draw: the panel shows it
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
window._t={t0:performance.now()};const _mark=k=>{window._t[k]=Math.round(performance.now()-window._t.t0);if(/[?&]marks/.test(location.search))console.warn('mark '+k+' '+window._t[k]);};
// (TAU, clamp, smooth, fbm, rng... are the core's, made globals by the hyperjungle's 41: biomes/hyperjungle/src)
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

// ---------------------------------------------------------------- the island's outline
const TERR={R:2000,X0:-2400,X1:1900,Z0:-1500,Z1:1600};
const SEA=0;
// an ellipse's inside: 1 at its centre, 0 on its edge, negative outside (a the long axis' bearing)
function ell(x,z,cx,cz,rx,rz,a){const c=Math.cos(a||0),s=Math.sin(a||0),dx=x-cx,dz=z-cz,u=(dx*c+dz*s)/rx,v=(-dx*s+dz*c)/rz;return 1-(u*u+v*v);}
// THE BAY (the lagoon's sheltered water): a disc cut into the south coast
const BAY={x:700,z:1080,r:430,name:'The lagoon bay'};
function landF(x,z,inflate){const k=inflate||0;
 const e=Math.max(ell(x,z,420,-60,1060+k,900+k,.08),ell(x,z,-850,130,960+k,360+k,-.12),ell(x,z,-1500,60,330+k,250+k,.3));
 const n=.13*(fbm(x*.0024+5,z*.0024-3,7101,3)-.5)+.05*(fbm(x*.011,z*.011,7102,2)-.5);
 const bay=inflate?0:1.6*smooth(1.08,.72,Math.hypot(x-BAY.x,z-BAY.z)/BAY.r);
 return e+n-bay;}
// SIGNED DISTANCE to the coast (m, + inland), and to the reef's line (an outline 190 m out with no bay: the reef runs across
// the bay's mouth). A chamfer transform on an 8 m grid, read bilinearly
const SDG=(function(){const cs=8,nx=Math.ceil((TERR.X1-TERR.X0)/cs)+1,nz=Math.ceil((TERR.Z1-TERR.Z0)/cs)+1;
 function grid(inside){const N=nx*nz,ins=new Uint8Array(N),dI=new Float32Array(N),dO=new Float32Array(N),BIG=1e9;
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)ins[j*nx+i]=inside(TERR.X0+i*cs,TERR.Z0+j*cs)?1:0;
  // two chamfer passes (3-4 weights in metres) for the distance to the nearest cell of the other kind
  const run=(D,want)=>{for(let k=0;k<N;k++)D[k]=ins[k]===want?0:BIG;const a=cs,b=cs*Math.SQRT2;
   for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i;let v=D[k];if(!v)continue;
    if(i>0)v=Math.min(v,D[k-1]+a);if(j>0){v=Math.min(v,D[k-nx]+a);if(i>0)v=Math.min(v,D[k-nx-1]+b);if(i<nx-1)v=Math.min(v,D[k-nx+1]+b);}D[k]=v;}
   for(let j=nz-1;j>=0;j--)for(let i=nx-1;i>=0;i--){const k=j*nx+i;let v=D[k];if(!v)continue;
    if(i<nx-1)v=Math.min(v,D[k+1]+a);if(j<nz-1){v=Math.min(v,D[k+nx]+a);if(i<nx-1)v=Math.min(v,D[k+nx+1]+b);if(i>0)v=Math.min(v,D[k+nx-1]+b);}D[k]=v;}};
  run(dI,0);run(dO,1);   // dI: from a land cell to the sea; dO: from a sea cell to the land
  const S=new Float32Array(N);for(let k=0;k<N;k++)S[k]=ins[k]?dI[k]-cs*.5:-(dO[k]-cs*.5);return S;}
 const coast=grid((x,z)=>landF(x,z)>0),reef=grid((x,z)=>landF(x,z,190+55*(fbm(x*.003,z*.003,7103,2)-.5))>0);
 const at=(S,x,z)=>{const u=clamp((x-TERR.X0)/cs,0,nx-1.001),v=clamp((z-TERR.Z0)/cs,0,nz-1.001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,k=j*nx+i;
  return S[k]*(1-fu)*(1-fv)+S[k+1]*fu*(1-fv)+S[k+nx]*(1-fu)*fv+S[k+nx+1]*fu*fv;};
 return{cs,nx,nz,coast,reef,sd:(x,z)=>at(coast,x,z),rd:(x,z)=>at(reef,x,z)};})();
const coastD=SDG.sd,reefD=SDG.rd;
// a point on the coast: from (x0,z0) out along a bearing to where the distance changes sign
function coastPoint(x0,z0,a){let lo=0,hi=2600;for(let k=0;k<40;k++){const m=(lo+hi)/2;if(coastD(x0+Math.cos(a)*m,z0+Math.sin(a)*m)>0)lo=m;else hi=m;}return[x0+Math.cos(a)*lo,z0+Math.sin(a)*lo];}

// ---------------------------------------------------------------- the places
// THE BENCH: a shelf of reef rock on the windward headland, awash at high water, with its TIDE POOLS
const BENCH=(function(){const p=coastPoint(420,-60,-.62);return{x:p[0],z:p[1],r:150,level:.62,name:'The tide-pool bench (reef rock on the windward headland)'};})();
const POOLS=(function(){reseed(7201);const P=[];for(let t=0;t<400&&P.length<18;t++){const a=rr(0,TAU),d=rr(0,BENCH.r*.75),x=BENCH.x+Math.cos(a)*d,z=BENCH.z+Math.sin(a)*d,s=coastD(x,z),r=rr(1.6,4.5);
  if(s<-18||s>16)continue;if(P.some(q=>Math.hypot(q.x-x,q.z-z)<q.r+r+2))continue;P.push({x,z,r,level:BENCH.level-.1-rr(0,.08),floor:BENCH.level-.55-rr(0,.25)});}return P;})();
// THE SALT PAN on the peninsula's tip, and its brine pools
const PAN={x:-1330,z:115,rx:255,rz:140,a:.18,floor:.24,name:'The salt pan (the salt works)'};
const panE=(x,z)=>{const c=Math.cos(PAN.a),s=Math.sin(PAN.a),dx=x-PAN.x,dz=z-PAN.z,u=(dx*c+dz*s)/PAN.rx,v=(-dx*s+dz*c)/PAN.rz;return Math.hypot(u,v)*(1+.08*(fbm(x*.01,z*.01,7202,2)-.5));};
const BRINE=[{x:-1390,z:100,r:26},{x:-1295,z:140,r:18},{x:-1250,z:85,r:12},{x:-1420,z:150,r:10}].map(b=>Object.assign(b,{level:PAN.floor-.06,floor:PAN.floor-.3}));
// THE VENT: one of the twelve the model marks on these isles; the geyser kit lays its field out (47)
const VENT={x:-170,z:-420,r:200,seed:4421,name:'The vent (a geyser field)'};
// THE GARDENS: a village's fields east of the bay, each plot one stand of the kit's (RINGISLES.GARDEN: crop-<name>, the
// owner's crops), and a second garden up the windward slope for the crops of the wetter, cooler ground (coffee, cloves).
// [key, x, z, w, d] in each garden's own frame (x along its rows), turned by its a about its centre
const GARDEN={x:1080,z:470,a:-.35,name:'The village gardens'};
const GARDEN2={x:900,z:150,a:-.2,name:'The upper gardens (coffee and cloves)'};
const PLOTS=(function(){const L=[];const add=(key,x,z,w,d,o)=>L.push(Object.assign({key,u:x,v:z,w,d,g:GARDEN},o||{}));
 // the rice paddies: two terraced rows down the slope toward the bay, each a step lower
 for(let i=0;i<5;i++)for(let j=0;j<2;j++)add('crop-rice',-110+i*25,-60+j*21,23,19,{terrace:i});
 for(let i=0;i<3;i++)add('crop-taro',-110+i*20,-12,18,12);
 add('crop-herbs',-50,-12,16,12);
 add('crop-banana',-30,-92,30,24);add('crop-mango',8,-94,34,30);
 add('crop-breadfruit',52,-92,34,30);
 add('crop-kava',-15,-16,22,14);add('crop-greens',12,-16,18,14);
 add('crop-sweetpotato',38,-14,26,16);add('crop-sweetpotato',66,-14,20,16);
 add('crop-sugarcane',-110,22,40,22);add('crop-sugarcane',-66,22,30,22);
 add('crop-coconut',-5,52,80,30);add('crop-coconut',82,36,30,50);
 // the upper gardens: coffee under its shade bananas, clove groves, terraced across the slope
 for(let i=0;i<3;i++)add('crop-coffee',-50+i*34,-14,30,18,{g:GARDEN2});
 for(let i=0;i<3;i++)add('crop-clove',-50+i*34,14,30,22,{g:GARDEN2});
 L.forEach(P=>{const G=P.g,c=Math.cos(G.a),s=Math.sin(G.a);P.x=G.x+P.u*c-P.v*s;P.z=G.z+P.u*s+P.v*c;P.a=G.a;P.r=Math.hypot(P.w,P.d)/2;delete P.g;});return L;})();
const nearGardens=(x,z)=>Math.hypot(x-GARDEN.x,z-GARDEN.z)<260||Math.hypot(x-GARDEN2.x,z-GARDEN2.z)<160;
// a point in a plot (its own frame), with a soft edge e (m): 1 inside, 0 beyond the edge
function inPlot(P,x,z,e){const c=Math.cos(P.a),s=Math.sin(P.a),dx=x-P.x,dz=z-P.z,u=dx*c+dz*s,v=-dx*s+dz*c;
 return smooth(P.w/2+e,P.w/2,Math.abs(u))*smooth(P.d/2+e,P.d/2,Math.abs(v));}

// ---------------------------------------------------------------- the land before the thermal ground
// the hills: the windward mountain, a southern hill, the peninsula's low spine; gullies down the mountain
function hillsH(x,z){const g=(u,v)=>Math.exp(-(u*u+v*v));
 let h=190*g((x-600)/460,(z+150)/400)+70*g((x-150)/300,(z-300)/220)+88*g((x+650)/330,(z-40)/190)+55*g((x+1080)/230,(z-20)/150);
 const r=1-Math.abs(fbm(x*.006+2,z*.006-4,7301,3)*2-1);h-=h*.16*r*r;   // gullies cut the slopes
 return h+9*(fbm(x*.004,z*.004,7302,3)-.5);}
// the shore's profile across the coast (sd: the signed distance, + inland): the waterline ~10 m out from the line
const shoreH=sd=>2.1*smooth(-30,35,sd)-.5;
// the bay's mud: a long gentle shelf the mangroves stand in
const mudH=sd=>.95*smooth(-140,70,sd)-.62;
// the lagoon's floor (d metres off the coast) and the reef crest (rd: the distance to the reef's line, + inside)
function lagoonH(x,z,d){return -.4-2.3*smooth(0,70,d)-.9*smooth(140,320,d)+.55*(fbm(x*.008,z*.008,7303,2)-.5);}
const bayK=(x,z)=>smooth(1.15,.85,Math.hypot(x-BAY.x,z-BAY.z)/BAY.r);
function seaH(x,z,sd,rd){const d=-sd;let h=lagoonH(x,z,d);
 const crest=-.32+.18*(fbm(x*.03,z*.03,7304,2)-.5);
 h=mix(h,crest,smooth(-60,-18,rd)*smooth(55,12,rd));   // the reef flat: a band just under the surface
 if(rd<-18)h=mix(crest,-34,smooth(-18,-240,rd));          // the fore reef falls away to the deep
 return h;}
function landH(x,z){const sd=coastD(x,z),rd=reefD(x,z),bk=bayK(x,z),hl=hillsH(x,z)*smooth(25,320,sd);
 // the beach and the mud, blended into the lagoon's floor off the shore
 let base=mix(shoreH(sd),mudH(sd),bk);
 if(sd<0){const s=seaH(x,z,sd,rd),d=-sd;base=mix(base,s,smooth(bk>.5?90:6,bk>.5?190:45,d));if(bk>.5&&d<190)base=Math.min(base,mix(mudH(sd),s,smooth(90,190,d)));}
 let h=base+Math.max(0,hl);
 // the lee's dunes: low ridges behind the western beaches
 const dk=smooth(-150,-650,x)*smooth(8,30,sd)*smooth(150,70,sd);if(dk>0)h+=dk*(2.2+3.2*(1-Math.abs(fbm(x*.012,z*.03,7305,2)*2-1)));
 // the bench: a shelf of reef rock at its level, its pools let into it
 const bkh=smooth(BENCH.r*1.1,BENCH.r*.7,Math.hypot(x-BENCH.x,z-BENCH.z))*smooth(-48,-28,sd)*smooth(45,22,sd);
 if(bkh>0){const lev=BENCH.level+.22*(fbm(x*.05,z*.05,7306,2)-.5)+.6*smooth(10,40,sd);h=mix(h,Math.max(lev,sd>0?h*.5+lev*.5:lev),bkh);
  if(sd<-14)h=mix(h,-.9,smooth(-14,-30,sd)*bkh);
  for(const P of POOLS){const d=Math.hypot(x-P.x,z-P.z);if(d<P.r*1.25)h=mix(h,P.floor,smooth(P.r*1.15,P.r*.55,d));}}
 // the pan: a flat crust inside a low berm, its brine pools
 const pe=panE(x,z);if(pe<1.35){h+=1.1*smooth(1.32,1.06,pe)*smooth(.86,1.04,pe);h=mix(h,PAN.floor+.05*(fbm(x*.02,z*.02,7307,2)-.5),smooth(1.0,.86,pe));
  for(const B of BRINE){const d=Math.hypot(x-B.x,z-B.z);if(d<B.r*1.3)h=mix(h,B.floor,smooth(B.r*1.2,B.r*.6,d));}}
 // the gardens: each plot levelled (a paddy terraced a step below its neighbour up the slope)
 if(nearGardens(x,z))for(const P of PLOTS){if(Math.abs(x-P.x)>P.r+4||Math.abs(z-P.z)>P.r+4)continue;const k=inPlot(P,x,z,1.8);if(k>0)h=mix(h,P.level,k);}
 return h;}
// each plot's level: the ground at its centre before the levelling (a paddy a little lower: its water stands in it)
PLOTS.forEach(P=>{P.level=null;});
{const keep=PLOTS.slice();PLOTS.length=0;keep.forEach(P=>{P.ground=landH(P.x,P.z);});keep.forEach(P=>{P.level=P.ground-(P.key==='crop-rice'?.35:0);PLOTS.push(P);});}

// ---------------------------------------------------------------- the climate (the classes as soft weights)
// DRYNESS: the trade wind's rain falls on the windward (east) side and on the mountain; its lee and the peninsula are
// dry. 0 wettest .. 1 driest. The classes: wet (XA low, Af high), the monsoon band (Am), the savanna (XV low, Aw high),
// the steppe (XS low, BSh high); X, the abyssal classes, on the low ground (the denser, hotter air by the sea)
function dryAt(x,z,h){const peak=Math.exp(-Math.pow((x-600)/700,2)-Math.pow((z+150)/650,2));
 return clamp(.4-.36*(x-300)/1200+.16*smooth(420,-200,x)*smooth(-1100,-300,x)*.6-.22*peak*smooth(20,140,h)+.1*(fbm(x*.0016+7,z*.0016-2,7401,2)-.5),0,1);}
const KOPPEN=['XA','Af','Am','Aw','XV','BSh','XS'];
function classesAt(x,z,h,sd){const D=dryAt(x,z,h),low=1-smooth(18,48,h);
 const wet=1-smooth(.26,.34,D),mon=smooth(.26,.34,D)*(1-smooth(.4,.47,D)),sav=smooth(.4,.47,D)*(1-smooth(.64,.72,D)),stp=smooth(.64,.72,D);
 // the pan and its rim are salt steppe whatever the rain
 const pan=smooth(1.6,1.1,panE(x,z));
 const o={'XA':wet*low,'Af':wet*(1-low),'Am':mon,'Aw':sav*(1-low),'XV':sav*low,'BSh':stp*(1-low),'XS':stp*low};
 if(pan>0){for(const k of KOPPEN)o[k]*=1-pan;o.XS+=pan;}
 return o;}
