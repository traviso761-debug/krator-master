// ================================================================= GILLS — the candles (Qãḍal) and the pipe field's sites (biomes/gills/PLAN.md sections 3, 9, 11 item 4)  [G data]
// The second data fragment of the shared life: what the LOWEST White gills carry, which 44-gills-life.js does not. Plain records and pure
// functions on core/rand (KRAND.hash of (world, gill, index, salt)), no THREE, no DOM, as 44's are; the host kits read it in place after 44
// (biomes/catch --station gills-candles: its station.json "reads") and draw the records with their own builders.
//
//   GILLS.candles(L, o)   THE CANDLES: a closed gill whose conduit still carries DRY, FAST gas burns at its throats (PLAN.md section 3: "where a
//                         throat's gas is dry and fast it burns"; section 11 item 4: "beside it the dry gills whose gas burns: blue flames a metre
//                         tall at the throats, invisible at noon, plain at dusk, the black heat crust round each"). A BREATHING gill is wet and
//                         steams instead, so a candle never stands on one: the two are exclusive, which is the picture (steam here, flame there).
//                         {ground, seed, dry (the share of closed gills that burn), step (m along a gill), h, crust} ->
//                         [{id, gill, x, z, y, h, r, crust, along, seed}]; h the flame's height in metres, crust the black heat crust's radius.
//                         The flame burns all day (section 9: "a candle gives it all day"), so it takes no breath state: only the candles' light
//                         against the hour is the page's (invisible at noon, plain at dusk).
//   GILLS.sites(L, R, o)  THE PIPE FIELD'S PLACEMENT SITES as plain data, published for a settlement or a region to build on and NOTHING drawn
//                         for them (PLAN.md section 0 "Out of scope": the hermitage and the caravans' camps as buildings are a settlement's;
//                         section 13: "placement sites published as plain data, the way swhighlands' pillar rim publishes SWHI_PILLARS_SITE").
//                         L the swarm, R a GILLS.life record set (for the pipe the Monks cut their cells into). -> a
//                         {format:'gills-field-site', version:1, ...} record: the hermitage, the caravan stop, the Geomancers' gas-house, the
//                         hearths, the road. The MONKS' NUMBER is the region's to say, not the kit's (o.monks; PLAN.md section 9 keeps a
//                         hermitage of "two or three", the Catch bowl region's site record says fifteen: KNOWN_ISSUES.md).
// GODOT: the same functions on the same records (plain arithmetic and KRAND's hash).
(function(){
 if(typeof GILLS==='undefined')throw new Error('45-gills-candles.js: load biomes/gills/src/44-gills-life.js first');
 const G=GILLS,TAU=Math.PI*2;
 const H=(...a)=>KRAND.stream(KRAND.hash(...a));
 const sm=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
 // ---- a dry gill: closed (it lays no lamina and grows no pipe) but still carrying gas, and the gas dry enough to burn
 // Chosen by hash from the gill's own index, never from how many draws came before it, so a page is the same on every machine.
 G.isDry=function(L,g,o){o=o||{};const dry=o.dry==null?.35:o.dry,seed=o.seed==null?0x6113:o.seed,gi=L.gills.indexOf(g);
  if(gi<0||g.alive)return false;   /* a breathing gill is wet: it steams, it does not burn */
  return H(seed,gi,0xCA9D).next()<dry;};
 // ---- the candles (section 11 item 4): blue flames at the throats of the dry gills, a black heat crust round each
 G.candles=function(L,o){o=o||{};const gr=o.ground,seed=o.seed==null?0x6113:o.seed,step=o.step==null?26:o.step,
   hR=o.h||[.4,1.6],cR=o.crust||[1.4,4.2],out=[];
  if(typeof gr!=='function')throw new Error('GILLS.candles: o.ground must be the host\'s ground function (x, z) -> y');
  L.gills.forEach((g,gi)=>{if(!G.isDry(L,g,o))return;
   const len=g.r*(g.a1-g.a0),N=Math.max(1,Math.floor(len/step));
   for(let k=0;k<N;k++){const s=H(seed,gi,k,0xF1A3),al=(k+.2+.6*s.next())/N,an=g.a0+(g.a1-g.a0)*al,
     end=sm(0,.12,al)*sm(1,.88,al);
    if(s.next()>.25+.65*end)continue;   /* the gas is fastest where the crack is widest: the middle burns, the tapered ends mostly do not */
    /* a candle stands at a throat on the crack's floor line, a little off it as the lamps are */
    const dr=(s.next()-.5)*g.w*.3*end,rr=g.r+dr,x=g.c[0]+Math.cos(an)*rr,z=g.c[1]+Math.sin(an)*rr,y=gr(x,z),
     h=hR[0]+(hR[1]-hR[0])*s.next()*(.55+.45*end);
    out.push({id:g.id+'.candle.'+k,gill:g.id,x,z,y,h,r:.12+.22*s.next(),crust:cR[0]+(cR[1]-cR[0])*s.next(),along:al,
     seed:KRAND.hash(seed,gi,k,0xF1A3,0x0C0D)>>>0});}});
  return out;};
 // ---- the pipe field's sites (sections 9, 11 item 4): published, never drawn
 G.sites=function(L,R,o){o=o||{};const gr=o.ground,seed=o.seed==null?0x6114:o.seed,monks=o.monks==null?3:o.monks,
   cups=(R&&R.cups)||[],pipes=(R&&R.pipes)||[];
  if(typeof gr!=='function')throw new Error('GILLS.sites: o.ground must be the host\'s ground function (x, z) -> y');
  const dead=L.gills.filter(g=>!g.alive&&!G.isDry(L,g,o));   /* the silent pipe field: the Monks live in it, not among the flames */
  const field=dead.length?dead[0]:(L.gills.find(g=>!g.alive)||L.gills[0]);
  /* THE HERMITAGE: the Monks' two cells cut into the base of the biggest FALLEN or BROKEN pipe of the silent field (section 11 item 4: "the
     Monks' two cells built into a pipe's base ... their count cut into the bore"), so the ring count they read stands in the cut bore */
  const inField=pipes.filter(p=>p.gill===field.id),
   cut=inField.filter(p=>p.state==='fallen'||p.state==='broken').sort((a,b)=>b.H-a.H)[0]||inField.sort((a,b)=>b.H-a.H)[0]||null;
  const sA=H(seed,0,0x4E11),aw=TAU*sA.next();
  const herm=cut?{id:'gills.hermitage',x:+(cut.x+Math.cos(aw)*(cut.r+3.5)).toFixed(2),z:+(cut.z+Math.sin(aw)*(cut.r+3.5)).toFixed(2),
   y:+gr(cut.x+Math.cos(aw)*(cut.r+3.5),cut.z+Math.sin(aw)*(cut.r+3.5)).toFixed(2),yaw:+(aw+Math.PI).toFixed(4),
   pipe:cut.id,pipeH:+cut.H.toFixed(2),cells:2,monks,
   note:'The History Monks\' hermitage (from Longsong, LORE.md 6.15): two cells at a fallen pipe\'s base, the day-ring count cut into its bore. It doubles as a caravan stop; the Monks pass travellers\' news to Longsong. The buildings are a settlement\'s, not this kit\'s; monks is the region\'s number'}:null;
  /* THE CARAVAN STOP beside it, set at the salt cups that water it (section 18.2: the only potable water between Bitta and Lasso) */
  const near=herm?cups.map(c=>({c,d:Math.hypot(c.x-herm.x,c.z-herm.z)})).sort((a,b)=>a.d-b.d)[0]:null;
  const sB=H(seed,1,0x4E12),stop=herm?{id:'gills.caravan-stop',
   x:+(herm.x+(near?(near.c.x-herm.x)*.45:28*Math.cos(aw+1.1))).toFixed(2),
   z:+(herm.z+(near?(near.c.z-herm.z)*.45:28*Math.sin(aw+1.1))).toFixed(2),
   y:0,r:+(16+10*sB.next()).toFixed(2),cup:near?near.c.id:null,
   note:'The caravans\' halt at the hermitage (Bitta to Lasso): its water is the salt cups\' breath-water (Bhlo-wāṭar). A camp, not a building: core/camp or a settlement places it'}:null;
  if(stop)stop.y=+gr(stop.x,stop.z).toFixed(2);
  /* THE GEOMANCERS' GAS-HOUSE (section 9, proposed): a capped throat on a DRY gill, where the gas is dry and strong enough to work */
  const burn=L.gills.filter(g=>G.isDry(L,g,o)),bg=burn.length?burn[0]:null;
  const sC=H(seed,2,0x4E13),ba=bg?bg.a0+(bg.a1-bg.a0)*(.35+.3*sC.next()):0,
   bx=bg?bg.c[0]+Math.cos(ba)*(bg.r+bg.w*.8+6):0,bz=bg?bg.c[1]+Math.sin(ba)*(bg.r+bg.w*.8+6):0;
  const gas=bg?{id:'gills.gas-house',x:+bx.toFixed(2),z:+bz.toFixed(2),y:+gr(bx,bz).toFixed(2),yaw:+(ba+Math.PI).toFixed(4),
   throat:bg.id,note:'The Yuni Geomancers\' gas-house (PLAN.md section 9, proposed): a throat capped with a bell for the out-breath\'s hydrogen. Only Yuni has the chemistry to work it. The building is a settlement\'s'}:null;
  /* THE HEARTHS: the caravans' smelting fires and their slag, on the field's downwind edge */
  const hearths=[];{const n=2+Math.floor(H(seed,3,0x4E14).next()*3);
   for(let k=0;k<n;k++){const s=H(seed,3,k,0x4E15),an=field.a0+(field.a1-field.a0)*(.2+.6*s.next()),
     rr=field.r+field.w*(1.1+1.4*s.next()),x=field.c[0]+Math.cos(an)*rr,z=field.c[1]+Math.sin(an)*rr;
    hearths.push({id:'gills.hearth.'+k,x:+x.toFixed(2),z:+z.toFixed(2),y:+gr(x,z).toFixed(2),r:+(1.6+1.4*s.next()).toFixed(2),
     note:'A caravan\'s smelting hearth and its slag (the pipe crusts worked on the road)'});}}
  return {format:'gills-field-site',version:1,country:G.country(o.country),field:field.id,
   hermitage:herm,caravanStop:stop,gasHouse:gas,hearths,
   candleGills:burn.map(g=>g.id),pipeFieldGills:dead.map(g=>g.id)};};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=(typeof GILLS!=='undefined'?GILLS:null);
