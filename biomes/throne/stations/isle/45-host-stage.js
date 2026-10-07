// ================================================================= HOST — stage (station 4: the geyser isle)
// The ideal-type host for one of THE THRONE's inner isles (NOTES.md, "Volcanic features": the geysers are on the isles;
// "the spice": wild spice bears reliably on the isles' geyser ground). The scale model's isles are 20-35 km domes; this
// is one of the small ones, ~4 km across, so the whole isle and its shores fit the page (the owner: "we're gonna be on the
// beach"). Renderer, lights, haze, the isle's shape and the basin's layout as DATA; 47 cuts the land and binds the kit.
//
// THE MAP (x east, z south; R 2600). A low dome ~230 m high with the sea all round, ~170 km west of the summit (the
// mountain stands on the eastern horizon, 4 degrees up). The wind is from the north-west.
//   THE CROWN    the geyser basin in a shallow hollow on the crown: two geysers, the banded hot springs, the mud pots, the
//                fumaroles along the rift that feeds it, white sinter flats; the drowned trees at its edge
//   THE GROVE    the warm ground round the basin, where the spice's fungus takes: wild spice, the natives' resin camp
//   THE WOODS    an island's smaller forest down the slopes, cut by gullies with streams
//   THE SHORES   black-sand beaches under coconut palms (south and west), sea cliffs on the windward north-west, the warm
//                lagoon in the lee (south-east) where the basin's creek comes out, with the hyper-mangroves
//   THE SHALLOWS kelp 3-15 m down round the isle; the wrack on the sand
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
window._t={t0:performance.now()};const _mark=k=>{window._t[k]=Math.round(performance.now()-window._t.t0);};   // phase timings (ms since the stage began)
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);}
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r&&y>=(r.y||0)-2&&y<=(r.y||0)+r.h+5;}

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;document.body.appendChild(renderer.domElement);
// THE LIGHT: sea air (~1.8 atm at the shore), a little clearer than the Throne's flank: a pale blue haze, the sun in the west
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xc0ccd0);scene.fog=new THREE.FogExp2(HAZE.getHex(),.0002);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,16000);
const hemi=new THREE.HemisphereLight(0xb0c4d4,0x4a5a3a,.9);scene.add(hemi);
const SUN_POS=[-950,900,250];
const sun=new THREE.DirectionalLight(0xffe6c0,1.25);sun.position.set(...SUN_POS);scene.add(sun);
const fill=new THREE.DirectionalLight(0xb8c8d0,.26);fill.position.set(900,400,900);scene.add(fill);

// ---------------------------------------------------------------- the isle
const TERR={R:2600};
const SEA=-1530;   // the Ring Sea's surface (the scale model's level)
// a lumpy dome: its radius wobbles with the bearing from the crown; 230 m high
const DOME={cx:-120,cz:-60,r:1700,H:230,p1:1.3,p2:4.1};
const isleR=a=>DOME.r*(1+.13*Math.sin(2*a+DOME.p1)+.07*Math.sin(3*a+DOME.p2));
const angOf=(x,z)=>Math.atan2(z-DOME.cz,x-DOME.cx);
const dnOf=(x,z)=>Math.hypot(x-DOME.cx,z-DOME.cz)/isleR(angOf(x,z));
const dAng=(a,b)=>Math.abs(((a-b)%TAU+TAU*1.5)%TAU-Math.PI);
// THE CLIFFS: the windward north-west's shore, sea-cut into a basalt wall 20-35 m high
const CLIFF={a:-2.35,w:.62};const cliffK=(x,z)=>smooth(CLIFF.w,CLIFF.w*.55,dAng(angOf(x,z),CLIFF.a));
// THE LAGOON: in the lee (south-east), a shallow round bay, its mouth open to the sea; the basin's warm creek runs into it
const LAGOON=(function(){const a=.72,d=isleR(a)*.9;return{a,x:DOME.cx+Math.cos(a)*d,z:DOME.cz+Math.sin(a)*d,r:270};})();
// THE BASIN on the crown, its long axis along the rift (north-north-east); local frame: au along the rift, bv across it
const BASIN={x:-40,z:40,A:[.34,-.94],B:[.94,.34],ra:300,rb:210,depth:9};
const auOf=(x,z)=>(x-BASIN.x)*BASIN.A[0]+(z-BASIN.z)*BASIN.A[1],bvOf=(x,z)=>(x-BASIN.x)*BASIN.B[0]+(z-BASIN.z)*BASIN.B[1];
const bxz=(au,bv)=>[BASIN.x+BASIN.A[0]*au+BASIN.B[0]*bv,BASIN.z+BASIN.A[1]*au+BASIN.B[1]*bv];
// how far out of the basin (0 its middle, 1 its rim; ragged)
function basinE(x,z){const au=auOf(x,z),bv=bvOf(x,z),a=Math.atan2(bv,au);return Math.hypot(au/BASIN.ra,bv/BASIN.rb)*(1+.08*Math.sin(3*a+.7)+.05*Math.sin(5*a+2.1));}
// its outlet: the rim's lowest point, toward the lagoon (the creek leaves here)
const OUTLET=(function(){const dx=LAGOON.x-BASIN.x,dz=LAGOON.z-BASIN.z,l=Math.hypot(dx,dz);let best=null;
 for(let k=0;k<64;k++){const t=k/64*TAU,au=Math.cos(t)*BASIN.ra,bv=Math.sin(t)*BASIN.rb,p=bxz(au,bv);const s=((p[0]-BASIN.x)*dx+(p[1]-BASIN.z)*dz)/l;if(!best||s>best.s)best={s,x:p[0],z:p[1]};}return best;})();
// THE FEATURES (records: the life layer and the probe read them). In the basin's frame
const G0=(o)=>{const p=bxz(o.au,o.bv);return Object.assign(o,{x:p[0],z:p[1]});};
const GEYSERS=[
 G0({key:'great',name:'The Great Geyser (a cone geyser)',au:-95,bv:40,mound:34,mh:3.4,cone:3.2,ch:2.6,period:75,dur:16,H:38,ph:0}),
 G0({key:'fountain',name:'The Fountain (a fountain geyser in its pool)',au:125,bv:-55,mound:20,mh:1.2,pool:7,period:23,dur:6,H:11,ph:9})];
// the springs: temp 1 boiling (deep blue to the rim), lower cooler (the mats reach in from the edge: green, yellow, orange)
const POOLS=[
 G0({key:'prism',name:'The Prismatic Spring',au:10,bv:-98,r:26,temp:1.0,out:true}),
 G0({key:'blue',name:'A deep blue spring',au:-175,bv:-62,r:10,temp:1.1}),
 G0({key:'green',name:'A green spring',au:175,bv:70,r:6,temp:.62}),
 G0({key:'orange',name:'An orange spring (cooler: the mats reach its middle)',au:-35,bv:102,r:5,temp:.35}),
 G0({key:'milky',name:'A milky acid spring',au:80,bv:112,r:8,temp:.8,acid:true}),
 G0({key:'fountainpool',name:'The Fountain\'s pool',au:125,bv:-55,r:7,temp:1.0,geyser:'fountain'})];
const MUD=G0({key:'mud',name:'The mud pots',au:215,bv:-128,r:18,pots:[]});
{reseed(4511);for(let k=0;k<6;k++){const a=rr(0,TAU),d=MUD.r*rr(.1,.62);MUD.pots.push({x:MUD.x+Math.cos(a)*d,z:MUD.z+Math.sin(a)*d,r:rr(1.4,3.2),seed:rng()});}}
// THE FUMAROLES: along the rift through the basin and on out under the forest either side, and round the mud pots
const STEAM=(function(){reseed(4512);const o=[];
 for(let au=-760;au<=760;au+=rr(70,120)){const bv=15*Math.sin(au*.006)+rr(-20,20),p=bxz(au,bv);o.push({x:p[0],z:p[1],s:rr(.35,.9),R:rr(28,44)});}
 for(let k=0;k<3;k++){const a=rr(0,TAU),d=MUD.r*rr(.8,1.2);o.push({x:MUD.x+Math.cos(a)*d,z:MUD.z+Math.sin(a)*d,s:rr(.4,.7),R:30});}
 return o;})();
// THE RUNOFF: the hot water's channels over the sinter to the outlet (the mats grow along them): from the Prismatic Spring,
// the Great Geyser's mound and the Fountain
const RUNOFF=[POOLS[0],GEYSERS[0],GEYSERS[1]].map((S,i)=>{reseed(4520+i);const P=[];const n=30;
 for(let k=0;k<=n;k++){const t=k/n,w=18*Math.sin(t*Math.PI)*(fbm(t*3+i,i*2.1,4521,2)-.5)*2;const x=mix(S.x,OUTLET.x,t),z=mix(S.z,OUTLET.z,t),dx=OUTLET.x-S.x,dz=OUTLET.z-S.z,l=Math.hypot(dx,dz)||1;
  P.push([x-dz/l*w,z+dx/l*w]);}
 return{from:S.key,w:i?4:7,pts:P};});
function segD(px,pz,P){let b=1e9;for(let i=1;i<P.length;i++){const a=P[i-1],c=P[i],vx=c[0]-a[0],vz=c[1]-a[1],L=vx*vx+vz*vz||1;let t=((px-a[0])*vx+(pz-a[1])*vz)/L;t=clamp(t,0,1);b=Math.min(b,Math.hypot(px-a[0]-vx*t,pz-a[1]-vz*t));}return b;}
// THE GULLIES: radial from the crown, each with a stream; one goes over the cliffs as a fall. THE CREEK: the basin's
// outlet down to the lagoon, warm (it steams near the basin)
const GULLIES=(function(){const o=[];[[-2.42,'The cliff stream (it falls into the sea)'],[-1.05,'The north gully'],[.12,'The east gully'],[2.05,'The south-west gully'],[2.9,'The west gully']].forEach(([a,name],i)=>{
  reseed(4530+i);const P=[],d0=DOME.r*.32;for(let d=d0;d<=isleR(a)*1.04;d+=20){const w=60*(fbm(d*.003+i,i,4531,2)-.5),aa=a+w/Math.max(200,d);P.push([DOME.cx+Math.cos(aa)*d,DOME.cz+Math.sin(aa)*d]);}
  o.push({key:'g'+i,name,a,pts:P,w:10,d:7,cliff:i===0});});
 // the creek: from the outlet to the lagoon, wandering
 {reseed(4539);const P=[],n=40;for(let k=0;k<=n;k++){const t=k/n,w=50*Math.sin(t*Math.PI)*(fbm(t*3,7,4532,2)-.5)*2,x=mix(OUTLET.x,LAGOON.x,t),z=mix(OUTLET.z,LAGOON.z,t),dx=LAGOON.x-OUTLET.x,dz=LAGOON.z-OUTLET.z,l=Math.hypot(dx,dz);P.push([x-dz/l*w,z+dx/l*w]);}
  o.push({key:'creek',name:'The warm creek (the basin\'s outlet)',pts:P,w:7,d:4,warm:true});}
 return o;})();
// the isle before the cuts: the dome, the cliffs raised and cut, the shelf under the sea
function domeH(x,z){const dn=dnOf(x,z),ck=cliffK(x,z);
 let h=dn<1?SEA+DOME.H*Math.pow(1-dn*dn,1.3):SEA-Math.min(42,(dn-1)*DOME.r*.075+1.2*smooth(1,1.02,dn));
 h+=8*(fbm(x*.002+3,z*.002-1,17,3)-.5)*smooth(1.02,.9,dn)+2.5*(fbm(x*.01-5,z*.01+2,19,2)-.5);
 if(ck>0){const top=SEA+DOME.H*Math.pow(Math.max(0,1-.93*.93),1.3)+16+8*fbm(x*.01,z*.01,23,2);
  h=mix(h,Math.max(h,top),ck*smooth(.7,.92,dn)*smooth(.97,.95,dn));h=mix(h,SEA-7-4*fbm(x*.02,z*.02,24,2),ck*smooth(.948,.955,dn));}   // a wall: the cut over ~10 m
 return h;}
function plumeAt(x,z){return 0;}
