// ================================================================= HOST — stage (the Cut, station 1: THE FLOOR, by the upper lake)
// [web] Each station's say about its ground (STAGE); 47-host-land.js draws it, the same for every station.
// WHERE (PLAN.md section 8): the upper lake's south-eastern shore, toward px 468,322 on the 4.22 model (CUT.SITES.floor),
// -1,456 m: 1.92 atm, +30 degC, ~1,950 mm. The lake lies to the north-north-west, 50 km across to the walls; the floor
// rises gently behind (1% to the south-south-east) through the wet shore to the salt steppe; the walls round the horizon.
// THE PAGE (x east, z south, y up from the lake; the origin on the shore; R 2,800 m):
//   THE LAKE          north-west of the shore line (y 0), core/water's open surface out to the horizon
//   THE SHORE         to ~900 m landward (y < 10): ring reeds in the shallows, the hyperbamboo groves, nwlowlands'
//                     glow-willows, paperbarks, stilt pandans, mist palms and tree ferns (the plan's shore list)
//   THE SALT STEPPE   beyond ~1.4 km (y > 15): ground.salt and its efflorescence, rankgrass ruled along the field
//   THE CREEK         snowmelt off the lip, down from the south-south-east to the lake: she-oaks and wattles along it
//   THE CAMP          the cutters' camp in a grove's shade by the water
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
window._t={t0:performance.now()};const _mark=k=>{window._t[k]=Math.round(performance.now()-window._t.t0);};
const {TAU,clamp,lerp,mix,smooth,fbm}=BIO.fn;
const STAGE=(function(){const site=CUT.SITES.floor,yRef=CUT.LAKES[0].level,R=2800;
 const toBowl=(x,z)=>[x+site.x,z+site.z];
 // uphill: away from the floor's low point, the direction the creek comes down
 const g=(()=>{const e=40,a=CUT.bowl.h(site.x+e,site.z)-CUT.bowl.h(site.x-e,site.z),b=CUT.bowl.h(site.x,site.z+e)-CUT.bowl.h(site.x,site.z-e),l=Math.hypot(a,b);return[a/l,b/l];})();
 const up=g,ac=[-g[1],g[0]];   /* up the floor, and across it (along the shore) */
 // THE CREEK: a line up the floor 500 m east of the camp, wandering (sin terms only: the page's own shape, not noise)
 const CR={x0:520,w:5,d:1.8};
 const creekS=(x,z)=>x*up[0]+z*up[1],creekT=(x,z)=>x*ac[0]+z*ac[1];
 const creekC=s=>CR.x0+38*Math.sin(s*.0042+.6)+14*Math.sin(s*.011+1.9);
 const creekD=(x,z)=>{const s=creekS(x,z);return s<-260?1e9:Math.abs(creekT(x,z)-creekC(s));};
 const bowlY=(x,z)=>{const b=toBowl(x,z);return CUT.bowl.h(b[0],b[1])-yRef;};
 // the ground: the bowl's smooth floor; the creek's bed and its shallow valley. Nothing else: the floor is the one smooth thing
 function ground(x,z){let h=bowlY(x,z);
  const cd=creekD(x,z);if(cd<160){h-=CR.d*smooth(CR.w*1.6,CR.w*.5,cd)+1.4*smooth(160,10,cd)*smooth(-50,200,h);}
  return h;}
 const yOf=ground;
 // the zones, by the height over the water (y: the floor rises ~1 m in 90 m) and the creek
 const salt=(x,z)=>{const y=bowlY(x,z);return smooth(10,16,y)*(1-smooth(70,25,creekD(x,z)));};
 const wetK=(x,z)=>{const y=bowlY(x,z);return Math.max(smooth(14,3,y),.8*smooth(80,15,creekD(x,z)));};
 // the groves: patches of the shore band (a slow field on core/rand's noise), hard-edged like nwlowlands'
 const patch=(x,z)=>{const b=toBowl(x,z);return KRAND.fbm(b[0]*.0032+1.7,b[1]*.0032-4.1,0,3,CUT.SEED+5);};
 const groveK=(x,z)=>{const y=yOf(x,z);return smooth(.6,1.4,y)*smooth(9,6,y)*smooth(.47,.53,patch(x,z))*(1-smooth(40,10,creekD(x,z)));};
 const CAMP={x:-260,z:0,yaw:Math.atan2(up[1],up[0])};
 // place the camp on the shore band, 4 m over the water, near the page's middle
 {let lo=0,hi=1500;for(let i=0;i<30;i++){const m=(lo+hi)/2;if(bowlY(CAMP.x+up[0]*m,CAMP.z+up[1]*m)<4)lo=m;else hi=m;}CAMP.x+=up[0]*lo;CAMP.z+=up[1]*lo;}
 const campD=(x,z)=>Math.hypot(x-CAMP.x,z-CAMP.z);
 return{key:'floor',name:'The Cut: the floor, by the upper lake',title:'Krator biome — the Cut: the floor',
  hint:'The floor of the Cut by the upper lake (-1,456 m, 1.92 atm): hyperbamboo combed into rings, rankgrass ruled across the salt, the walls round the horizon',
  site,yRef,R,px:[468,322],air:{pressure:1.92,humidity:.78},toBowl,alt:y=>y+yRef,ground,bowlY,up,across:ac,
  creek:{d:creekD,centre:creekC,s:creekS,up,ac,CR,
   /* its water (89w, core/water's flow; pair 10): the centre line from past the page's edge down to the mouth, where the surface 0.6 m over the bed's floor
      meets the lake's level; heights never rise downstream. mouth: where the plume starts */
   line(){const P=s=>[up[0]*s+ac[0]*creekC(s),up[1]*s+ac[1]*creekC(s)],sy=s=>{const p=P(s);return ground(p[0],p[1])+.6;};
    let lo=-250,hi=2000;for(let i=0;i<40;i++){const m=(lo+hi)/2;if(sy(m)>0)hi=m;else lo=m;}
    const pts=[],w=[];let y=1e9;for(let s=R*1.08;s>hi;s-=24){const p=P(s);y=Math.min(y,sy(s));pts.push([p[0],p[1],y]);w.push(2*CR.w+1.5);}
    const m=P(hi);pts.push([m[0],m[1],0]);w.push(2*CR.w+1.5);const m2=P(hi-30);pts.push([m2[0],m2[1],0]);w.push(2*CR.w+6);
    return{pts,width:w,mouth:m};}},campAt:CAMP,
  water:{level:0,shallow:0x467e76,deep:0x1a3e4c,name:'The upper lake (-1,456 m: endorheic, salt at its far end)'},
  floorLabel:y=>y>15?'The salt steppe (abyssal salt flats, XS)':y>.6?'The lake shore':'The shallows',
  // what the kits read: NW lowlands' fields (tropic on the hot wet shore, dry on the salt and the creek's banks so its
  // she-oaks and wattles take the creek), the natives' zones, and the mask the NW kit plants under
  fields:{wet:(x,z)=>clamp(.55+.43*wetK(x,z),0,1),tropic:(x,z)=>clamp(.95*smooth(16,8,bowlY(x,z)),0,1),dry:(x,z)=>salt(x,z)*.9+.0,
   flow:(x,z)=>clamp(smooth(60,8,creekD(x,z)),0,1),upland:(x,z)=>0,salt:(x,z)=>salt(x,z)},
  zone:(x,z)=>{const y=yOf(x,z),s=salt(x,z),cd=creekD(x,z);
   return{grove:groveK(x,z)*(campD(x,z)<30?0:1),reed:smooth(-.6,-.2,y)*smooth(.9,.4,y)*(1-smooth(30,8,cd)),rank:smooth(.2,.7,s)*(campD(x,z)<40?0:1),melon:0,
    nw:((1-s)*smooth(.5,1.2,y)*(1-groveK(x,z))+smooth(70,20,cd)*smooth(.3,1,y))*smooth(CR.w+1.5,CR.w+4,cd)};},   /* no read-in tree in the creek's water (89w draws it since pair 10) */
  nwAllow:['glowwillow','paperbark','pandan','mistpalm','treefern','sheoak','wattle'],nwQ:1,
  // the ground's layers (materials.json): a ground.salt, b ground.efflorescence, c the shore's shell sand, d the litter
  layers:['ground.salt','ground.efflor','ground.shore','ground.litter'],layerMul:[0,0,0,1],
  weights:(x,z)=>{const y=yOf(x,z),s=salt(x,z),e=smooth(7,12,y)*(1-s)+.5*s*smooth(.55,.75,patch(x*3.1,z*3.1));
   return[s*(1-.6*smooth(.6,.8,patch(x*2.3,z*2.3))),clamp(e,0,1),smooth(2.4,.4,y)*smooth(-2,-.3,y)+smooth(1.5,.2,Math.abs(y-.4))*.6,(1-s)*Math.max(.9*smooth(.15,.5,groveK(x,z)),.18*smooth(.6,1.6,y)*smooth(10,5,y))];},
  paint:(x,z)=>{const y=yOf(x,z),s=salt(x,z),cd=creekD(x,z);let c=[.42,.40,.30];
   c=c.map((v,i)=>mix([.30,.34,.22][i],v,smooth(6,12,y)));c=c.map((v,i)=>mix([.46,.42,.34][i],v,smooth(-.2,.8,y)));c=c.map((v,i)=>mix(v,[.80,.78,.72][i],s));c=c.map((v,i)=>mix(v,[.34,.36,.24][i],smooth(40,10,cd)*(1-s*.5)));return c;},
  camp:{x:CAMP.x,z:CAMP.z,yaw:CAMP.yaw},
  // the views, made after the build (the groves and the rows are records by then)
  views:()=>{const Y=(x,z)=>Math.max(ground(x,z),0),P=(u,v)=>[up[0]*u+ac[0]*v,up[1]*u+ac[1]*v],V=(c,cy,t,ty)=>[c[0],Y(c[0],c[1])+cy,c[1],t[0],Y(t[0],t[1])+ty,t[1]];
   const G=(CUT.PLANTS&&CUT.PLANTS.groves||[]).slice().sort((a,b)=>Math.hypot(a.x-CAMP.x,a.z-CAMP.z)-Math.hypot(b.x-CAMP.x,b.z-CAMP.z)),g=G[0]||{x:0,z:0,r:30,L:2.8};
   const R=(CUT.PLANTS&&CUT.PLANTS.rank||[]),r0=R[Math.floor(R.length/2)]||{x:up[0]*1800,z:up[1]*1800,yaw:0};
   const camp=[CAMP.x,CAMP.z],toward=(a,b,d)=>{const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1;return[a[0]+dx/l*d,a[1]+dz/l*d];};
   return{
    'The lake from the shore':V(P(260,-120),6,P(-2600,300),0),
    'A hyperbamboo grove':V(toward([g.x,g.z],[0,0],g.r+70),12,[g.x,g.z],38),
    'Inside a grove (the nodes on one level)':V(toward([g.x,g.z],[0,0],g.r*.35),3,toward([g.x,g.z],[0,0],-g.r),g.L*6),
    'The groves combed, from above':V(P(-500,-300),240,P(600,200),0),
    'The salt steppe, ruled':V([r0.x-Math.cos(r0.yaw)*40,r0.z-Math.sin(r0.yaw)*40],2.2,[r0.x+Math.cos(r0.yaw)*200,r0.z+Math.sin(r0.yaw)*200],0),
    'The rows from the air (spokes inside rings)':V(P(1500,-300),180,P(2100,300),0),
    'The cutters\' camp':V(toward(camp,P(0,0),-26).map((v,i)=>v+(i?ac[1]:ac[0])*14),5,camp,2),
    'The ring reeds':V(P(-40,-600),3,P(-30,-200),0),
    'The creek and its she-oaks':V(P(1100,CR.x0-140),14,P(400,CR.x0),4),
    'The creek\'s mouth and its plume (pair 10)':(function(){const M=STAGE.creek.line().mouth,o=[M[0]+up[0]*260+ac[0]*120,M[1]+up[1]*260+ac[1]*120];return V(o,70,[M[0]-up[0]*220,M[1]-up[1]*220],0);})(),
    'Out the crater mouth (no wall there)':V(P(1400,0),8,P(9000,0),300),
    'The walls round the horizon (the ENE lip, 6.4 km)':(function(){const b=67*Math.PI/180,R=CUT.lipR(67),t=[Math.sin(b)*R-site.x,-Math.cos(b)*R-site.z],l=Math.hypot(...t),c=[t[0]/l*400,t[1]/l*400];return[c[0],Y(c[0],c[1])+30,c[1],t[0],CUT.lipH(67)-yRef-2500,t[1]];})(),
    'Echoes at dusk':(function(){const E=(CUT.PLANTS&&CUT.PLANTS.groves||[]).flatMap(G=>G.culms.filter(c=>c.echo).map(c=>[G,c]))[0];if(!E)return{cam:V(toward([g.x,g.z],[0,0],g.r+40),6,[g.x,g.z],20),hour:18.1};
     const G0=E[0],c=E[1],e=[c.x+c.echo.dx,c.z+c.echo.dz],out=toward([G0.x,G0.z],e,Math.hypot(e[0]-G0.x,e[1]-G0.z)+G0.r+45);return{cam:V(out,5,e,28),hour:18.1};})(),
    'The whole floor':V(P(-900,0),420,P(2400,0),0)};},
  start:'A hyperbamboo grove',
  spine:[[0,0],[CAMP.x,CAMP.z],[up[0]*900,up[1]*900],[up[0]*1700+ac[0]*400,up[1]*1700+ac[1]*400],[ac[0]*900,ac[1]*900],[-ac[0]*900,-ac[1]*900],[up[0]*600+ac[0]*CR.x0,up[1]*600+ac[1]*CR.x0]],
  budgetTris:10500000,   /* swbay's ceiling: the culms' three tiers and the rankgrass rows are most of it (KNOWN_ISSUES.md) */
  seed:11};})();
