// ================================================================= GILLS — the shared life of the Red and the White Gills (biomes/gills/PLAN.md)  [G data]
// The breath, the species and the layouts as plain records: no THREE, no DOM, no Math.random, no sin hash; every draw from core/rand (KRAND.hash of
// (world, gill, index, salt)), never from how many draws came before. The host kits read this fragment in place (biomes/xanadu --station gills: its
// station.json "reads"; the catch's and the godthrone's stations later) and draw the records with their own builders; their 87 opens the registry
// (BIO.kit('gills')) and closes it with BIO.kitEnd(GILLS), so this file needs only KRAND (core/rand) and runs in node as it does on a page.
//
//   GILLS.breath(t | ATMOS.libration(t))   the breath state 0..1 at clock t (days from game start, the sky's t = day + hour/24): 1 the out-breath (Bhlo), 0 the in-breath
//                          (Suq). A plateau of 3 hours centred on the top of the giant's nod (Noḍ), an hour's ramp each side, the in-breath the rest of the
//                          day. Its phase is ATMOS.libration's (core/atmos/sky/89-atmos-e-skymodel.js): the same sidereal rate and the nod's phase (NOD),
//                          held equal by tests/test-gills.js, so the picture of the giant and the breath cannot part (PLAN.md section 3, section 14 item 1)
//   GILLS.nodPhase(t)      0..1 of the libration from the top of the nod;  GILLS.breathAt(u) the breath at that phase
//   GILLS.peakHour(day)    the hour of the out-breath's middle on that day (it comes about 4 minutes earlier each day)
//   GILLS.SPECIES, PLANTS, HARVEST, byKey(key)   the BIOME-API contract (biomes/gills/BIOME-API.md); every record tagged as the catalog asks
//   GILLS.country(name)    'white' | 'red': the chemistry's dress (colours, the pipe's shape); GILLS.COUNTRIES both
//   GILLS.dress(name)      that country's palette: {pipe, band, bore, collar, collarLit, fringe, dew, bead, cup, wood, cap} as sRGB 0..1 triples
//   GILLS.layout(o)        THE SWARM: ring or radial cracks round a cone {centre:[x,z], band:[r0,r1], arc:[a0,a1] (radians), n, dead, seed, form:'ring'|'radial',
//                          w:[min,max], d:[min,max], len:[min,max]} -> {gills:[{id, form, c, r, a0, a1, w, d, alive, age}]}; a gill's span tapers over its
//                          ends. GILLS.gillAt(L, x, z) -> {g, depth share 0..1, dr (m off the crack's line), along 0..1} or null (the host's terrainH carve)
//   GILLS.life(L, o)       THE LIFE ON IT, from the gills and the host's ground: {ground(x,z), iceH, treeH, lip: [min,max] m out from a lip, step (m along a lip),
//                          wind:[x,z], seed, country} -> {pipes, collars, fringes, pads, beads, lamps, dew, cups, wood, steam}, each a list of records with a stable
//                          id ('<gill>.<kind>.<k>'); a pipe {id, gill, x, z, y0, H, r, mouths, state, ice, lag, toward, live}. Pipes stand under 90 m
//                          (PLAN.md section 16, G6), live ones only on a live gill's lip, ice pipes only over iceH
// GODOT: the same functions on the same records (plain arithmetic and KRAND's hash).
var GILLS=(function(){
 const G={},TAU=Math.PI*2,SID=1.0027379,NOD=4.04,PLAT=1.5/24,RAMP=1/24;   /* SID, NOD: the sky model's own (S.giant.libration.phase); the test holds them */
 const sm=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
 const fr=v=>v-Math.floor(v);
 G.SID=SID;G.NOD=NOD;
 // ---- the breath (PLAN.md sections 3 and 10; the owner 2026-11-02: the daily tidal breath is canon, the nod and the breath one motion)
 G.nodPhase=t=>fr(t*SID+(NOD-Math.PI/2)/TAU);
 G.breathAt=u=>{const d=Math.min(u,1-u)/SID;return d<=PLAT?1:1-sm(PLAT,PLAT+RAMP,d);};
 /* t a clock (days), or ATMOS.libration(t)'s record itself (HANDOFF-REBUILD.md "Taking it, the Gills": GILLS.breath(ATMOS.libration(t))): its .phase is fr(t*SID) */
 G.breath=t=>G.breathAt(t!=null&&typeof t==='object'?fr(t.phase+(NOD-Math.PI/2)/TAU):G.nodPhase(t));
 G.peakHour=day=>{const k=Math.ceil(day*SID+(NOD-Math.PI/2)/TAU),t=(k-(NOD-Math.PI/2)/TAU)/SID;return (t-day)*24;};
 // ---- the two countries (section 7): one lineage, two chemistries
 const W={pipe:[.91,.89,.84],band:[.50,.56,.47],bore:[.22,.24,.22],collar:[.46,.50,.44],collarLit:[.74,.66,.52],fringe:[.86,.62,.42],dew:[.84,.84,.80],bead:[.95,.94,.90],cup:[.80,.82,.76],wood:[.78,.76,.70],cap:[.93,.92,.87]};
 const R={pipe:[.42,.16,.10],band:[.10,.09,.08],bore:[.12,.08,.07],collar:[.10,.09,.09],collarLit:[.62,.30,.14],fringe:[.45,.10,.08],dew:[.42,.24,.16],bead:[.36,.08,.07],cup:[.50,.30,.22],wood:[.52,.32,.24],cap:[.60,.28,.16]};
 G.COUNTRIES=['white','red'];
 G.country=n=>n==='red'?'red':'white';
 G.dress=n=>G.country(n)==='red'?R:W;
 // ---- the species (section 7) on the BIOME-API contract; tags as every kit's (climate, aridity, Koppen) plus harvest (biomes/FRUIT.md)
 const HV=(wood,edible,med,note,fruit)=>({wood,edible,medicinal:!!med,fruit:fruit||null,note});
 const K=(o)=>Object.assign({temperature:'polar',aridity:'arid',koppen:['ET','EF','Dsc'],alien:true,breath:true},o);
 G.HARVEST={
  pipe:HV('none',[],false,'A dead pipe (Bhon Phlū) is a ferromanganese crust: manganese and rare earths on the White, iron and cobalt on the Red (kits/resources, owed).'),
  collar:HV('none',[],true,'Lung salt (Lãg Solṭ), scraped from a charged collar at the end of the in-breath; cut at the out-breath it is the sulphide, Bhlo-Solṭ.'),
  bellows:HV('none',[],false,'The membrane traps spores and dust on its underside.'),
  fringe:HV('none',[],false,'Dye: the White fringe gives a pale orange, the Red a dark red.'),
  lamp:HV('none',[],false,'Glows faint and blue on the in-breath only (the owner, 2026-11-02).'),
  dewmat:HV('none',[],false,'Crusts with the mist\'s lime every morning.'),
  saltcup:HV('none',['the breath-water (Bhlo-wāṭar), drinkable on the White'],false,'Fills with condensate on the out-breath and holds it through the day.'),
  whitewood:HV('fuel (poor)',[],false,'Caps crusted with the mist\'s minerals.'),
  rollbead:HV('none',['tide beads, roasted'],false,'A seed body the breath rolls out and back.')};
 G.SPECIES=[
  {key:'pipe',name:'Breath pipe',xanadui:'Phlū',kind:'structure',where:'every lip and ledge of a live gill; dead ones (Bhon Phlū) where a gill once breathed',tags:K({harvest:G.HARVEST.pipe})},
  {key:'collar',name:'Lime collar',red:'Rust collar',xanadui:'Qolar',kind:'lining',where:'the mouths of pipes and young lips',tags:K({harvest:G.HARVEST.collar})},
  {key:'bellows',name:'Bellows pad',kind:'membrane',where:'across narrow throats and cracks',tags:K({harvest:G.HARVEST.bellows})},
  {key:'fringe',name:'Breath fringe',kind:'filament',where:'the mouths of pipes and throats',tags:K({harvest:G.HARVEST.fringe})},
  {key:'lamp',name:'Throat lamp',kind:'disc',where:'deep in the throats, out of the daylight',tags:K({harvest:G.HARVEST.lamp})},
  {key:'dewmat',name:'Dew mat',kind:'mat',where:'the strip downwind of every gill',tags:K({harvest:G.HARVEST.dewmat})},
  {key:'saltcup',name:'Salt cup',kind:'cup',where:'the meadows\' outer edge',tags:K({harvest:G.HARVEST.saltcup})},
  {key:'whitewood',name:'Limewood',red:'Rustwood',kind:'tree',where:'the meadows\' inner band and the aprons',tags:K({harvest:G.HARVEST.whitewood})},
  {key:'rollbead',name:'Tide bead',kind:'seed',where:'the meadows and the lips; drifted in every gill\'s floor',tags:K({harvest:G.HARVEST.rollbead})}];
 G.PLANTS={dewmat:G.SPECIES[5],saltcup:G.SPECIES[6],rollbead:G.SPECIES[8]};
 G.byKey=k=>G.SPECIES.find(S=>S.key===k)||null;
 G.NAMES={gill:'Gīl',white:'Wāiṭ Gīl',red:'Reḍ Gīl',out:'Bhlo',in:'Suq',nod:'Noḍ',pipe:'Phlū',dead:'Bhon Phlū',field:'Phlū-phīlḍ',salt:'Lãg Solṭ',collar:'Qolar',water:'Bhlo-wāṭar',alph:'Ālph-bi Bhlo',candle:'Qãḍal',thin:'Thin Yīr'};
 // ---- the swarm (section 6): a gill's place, bearing, length and age are hashes
 const H=(...a)=>KRAND.stream(KRAND.hash(...a));
 G.layout=function(o){const c=o.centre,n=o.n==null?8:o.n,dead=o.dead==null?2:o.dead,seed=o.seed==null?0x6111:o.seed,b=o.band,a=o.arc||[0,TAU],
   w=o.w||[12,46],d=o.d||[40,90],len=o.len||[400,2400],form=o.form==null?'ring':o.form,out=[];
  for(let i=0;i<n+dead;i++){const s=H(seed,i,0x9A11),r=b[0]+(b[1]-b[0])*(i+.15+.7*s.next())/(n+dead),L=len[0]+(len[1]-len[0])*s.next(),span=L/r,
    mid=a[0]+(a[1]-a[0])*s.next(),alive=i<n;
   out.push({id:'gill'+i,form,c:[c[0],c[1]],r,a0:mid-span/2,a1:mid+span/2,w:w[0]+(w[1]-w[0])*s.next(),d:d[0]+(d[1]-d[0])*s.next(),alive,age:alive?.3+.7*s.next():1.2+.8*s.next()});}
  return {gills:out,centre:c,form};};
 // where a point is on the swarm: its crack, the depth share (1 on the floor, 0 past the wall), its offset from the line, how far along
 G.gillAt=function(L,x,z){let best=null;for(const g of L.gills){const dx=x-g.c[0],dz=z-g.c[1],rr=Math.hypot(dx,dz),dr=Math.abs(rr-g.r);if(dr>g.w)continue;
   let an=Math.atan2(dz,dx);while(an<g.a0-Math.PI)an+=TAU;while(an>g.a0+Math.PI)an-=TAU;const al=(an-g.a0)/(g.a1-g.a0);if(al<0||al>1)continue;
   const end=sm(0,.12,al)*sm(1,.88,al),half=g.w/2*(.35+.65*end),k=(1-sm(half*.55,half*1.15,dr))*end;
   if(k>0&&(!best||k>best.k))best={g,k,dr,along:al,half};}
  return best;};
 // ---- the life (sections 6 and 7): the pipes on both lips, the collars and fringes at their mouths, the pads across the narrow ends, the beads drifted
 // in the floors and rolled onto the lips, the lamps in the throats, the meadow downwind (the dew mat, the salt cups at its edge, the limewood inside)
 G.life=function(L,o){const gr=o.ground,ice=o.iceH==null?1e9:o.iceH,lip=o.lip||[3,9],step=o.step==null?18:o.step,wd=o.wind||[.7,.7],seed=o.seed==null?0x6112:o.seed;
  const R={pipes:[],collars:[],fringes:[],pads:[],beads:[],lamps:[],dew:[],cups:[],wood:[],steam:[]};
  const wl=Math.hypot(wd[0],wd[1])||1,wx=wd[0]/wl,wz=wd[1]/wl;
  L.gills.forEach((g,gi)=>{const len=g.r*(g.a1-g.a0),N=Math.max(2,Math.floor(len/step));
   for(let k=0;k<N;k++)for(let side=-1;side<=1;side+=2){const s=H(seed,gi,k,side+2),al=(k+.2+.6*s.next())/N,an=g.a0+(g.a1-g.a0)*al,end=sm(0,.12,al)*sm(1,.88,al);
    if(s.next()>.35+.6*end)continue;
    const off=g.w/2*(.35+.65*end)+lip[0]+(lip[1]-lip[0])*s.next(),rr=g.r+side*off,x=g.c[0]+Math.cos(an)*rr,z=g.c[1]+Math.sin(an)*rr,y0=gr(x,z);
    const isIce=y0>ice,live=g.alive&&!isIce;
    /* the White form: squat, bulbous, branching, 10-40 m, taller toward a gill's middle and with its age; a dead field's pipes stand, break and fall */
    const mid=.55+.45*end,H0=Math.min(88,(10+30*s.next()*mid)*(.7+.5*Math.min(1,g.age))),stu=s.next();
    const state=g.alive?'standing':(stu<.45?'standing':stu<.75?'broken':stu<.9?'fallen':'rubble');
    const p={id:g.id+'.pipe.'+k+(side<0?'a':'b'),gill:g.id,x,z,y0,H:H0,r:1.8+2.6*s.next()*(.6+.4*mid),mouths:1+Math.floor(s.next()*2.99),state,ice:isIce,live,
     lag:s.next()*.5,toward:[g.c[0],g.c[1]],side,lean:.02*s.next(),seed:KRAND.hash(seed,gi,k,side+2,0x91BE)>>>0};
    R.pipes.push(p);
    if(state==='standing'&&!isIce){const top=y0+H0;
     R.collars.push({id:p.id.replace('.pipe.','.collar.'),pipe:p.id,x,z,y:top,r:p.r*(.9+.3*s.next()),lag:p.lag});
     if(live){const nf=2+Math.floor(s.next()*4);for(let f=0;f<nf;f++){const a2=TAU*(f+s.next()*.5)/nf;R.fringes.push({id:p.id.replace('.pipe.','.fringe.')+'.'+f,pipe:p.id,x:x+Math.cos(a2)*p.r*.7,z:z+Math.sin(a2)*p.r*.7,y:top-.2,yaw:a2,len:.8+1.2*s.next(),lag:p.lag+.1*s.next()});}
      if(s.next()<.45)R.steam.push({id:p.id.replace('.pipe.','.steam.'),pipe:p.id,x,z,y:top+1});}}}
   /* the floor: lamps in the throats, beads drifted, pads across the narrow ends (the tapered spans) */
   const M=Math.floor(len/9);for(let k=0;k<M;k++){const s=H(seed,gi,k,0xF100),al=(k+s.next())/M,an=g.a0+(g.a1-g.a0)*al,end=sm(0,.12,al)*sm(1,.88,al),dr=(s.next()-.5)*g.w*.35*end,rr=g.r+dr,
     x=g.c[0]+Math.cos(an)*rr,z=g.c[1]+Math.sin(an)*rr,y=gr(x,z),out=[Math.cos(an)*Math.sign(dr||1),Math.sin(an)*Math.sign(dr||1)],u=s.next();
    if(end<.55&&u<.5)R.pads.push({id:g.id+'.pad.'+k,gill:g.id,x,z,y,r:1+3*s.next(),yaw:an,lag:s.next()*.3});
    else if(u<.18&&g.alive)R.lamps.push({id:g.id+'.lamp.'+k,gill:g.id,x,z,y:y+.05,r:.4+.6*s.next()});
    else if(u<.75){const nb=3+Math.floor(s.next()*6);for(let b=0;b<nb;b++)R.beads.push({id:g.id+'.bead.'+k+'.'+b,gill:g.id,x:x+(s.next()-.5)*4,z:z+(s.next()-.5)*4,r:.05+.08*s.next(),dir:out,lag:s.next()*.4});}}
   /* the meadow: a strip downwind of the gill, the mat inner, the cups at its outer edge, the limewood between */
   if(g.alive){const MM=Math.floor(len/14);for(let k=0;k<MM;k++){const s=H(seed,gi,k,0xDE40),al=(k+s.next())/MM,an=g.a0+(g.a1-g.a0)*al,nx=Math.cos(an),nz=Math.sin(an),sd=nx*wx+nz*wz>0?1:-1,
     dd=g.w/2+8+120*s.next()*s.next(),x0=g.c[0]+nx*(g.r+sd*dd),z0=g.c[1]+nz*(g.r+sd*dd),x=x0+wx*25*s.next(),z=z0+wz*25*s.next(),y=gr(x,z),t=dd/(g.w/2+128);
    if(y>ice+60)continue;
    if(t>.72&&s.next()<.5)R.cups.push({id:g.id+'.cup.'+k,gill:g.id,x,z,y,r:.15+.15*s.next()});
    else if(t>.25&&t<.6&&s.next()<.18&&y<(o.treeH==null?1e9:o.treeH))R.wood.push({id:g.id+'.wood.'+k,gill:g.id,x,z,y,H:3+3*s.next(),r:.2+.15*s.next(),caps:2+Math.floor(s.next()*4),seed:KRAND.hash(seed,gi,k,0x3D)>>>0});
    else R.dew.push({id:g.id+'.dew.'+k,gill:g.id,x,z,y,r:1+2.2*s.next(),yaw:TAU*s.next()});}}});
  return R;};
 return G;})();
if(typeof module!=='undefined'&&module.exports)module.exports=GILLS;
