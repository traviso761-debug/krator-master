// ================================================================= TRADES & PURE QUARTZ / HELIOGRAPH / HARMONIC MATH ([G data])
// Engine-neutral data and pure functions (no three.js, no DOM):
//   HS_TRADES     all 44 Voth census trades (tools/check_trades.py shape), mapped to hs_* building keys (41 carried, 0 gaps, 3 na)
//   hsRigMath     pure stepped snow-white quartz pyramid geometry, optical heliograph shutter rotation, 440/660 Hz sinusoidal
//                 harmonic series, chest-height Handspeak reflector reach, rigid-pendulum chime sway, and >= 2.0 cm relief stepping
const HS_TRADES=[
 {trade:'bakers',voth:'voth_bldg_bakery',keys:['hs_slate_bakehouse'],note:'radiant soapstone-and-slate hearth ovens baking barley, oat & chestnut-flour flatbreads in dead silence'},
 {trade:'butchers',voth:'voth_bldg_butcher',keys:['hs_herb_smokehouse','hs_bark_tannery'],note:'cold-smoked ribbon-lake char, mountain-goat & alpine herb curers'},
 {trade:'weavers and dyers',voth:'voth_bldg_weaver',keys:['hs_felt_weaver'],note:'sound-damping wool felt-sole cobblers & high-contrast indigo/undyed linen Handspeak sign-banner weavers'},
 {trade:'brewers',voth:'voth_bldg_brewery',keys:['hs_birch_brew_cellar'],note:'fermented silver-birch sap, alpine gentian & cloudberry cellar brewers'},
 {trade:'tanners',voth:'voth_bldg_tannery',keys:['hs_bark_tannery'],note:'birch-bark & alum soft-sole boot, bellows & heliograph-shutter leather curriers'},
 {trade:'shipwrights and boatbuilders',voth:'voth_bldg_shipwright',keys:['hs_reed_skiff_shed','hs_silent_ferry'],note:'felt-oarlock cypress & reed ribbon-lake skiffs and underwater-cable ferry pontoons'},
 {trade:'innkeepers and grooms',voth:'voth_bldg_caravanserai',keys:['hs_wayfarer_hospice'],note:'sanctuary guest hostel with engraved Handspeak primer tablets for mute outsiders & pack-goat stalls'},
 {trade:'town guard',voth:'voth_bldg_watchhouse',keys:['hs_palm_gate','hs_mist_watch_spire','hs_sanctuary_wall'],note:'peaceful Handspeak sanctuary wardens watching Silent Vales passes with optical flashes & 440 Hz chimes'},
 {trade:'coast guard',voth:'voth_bldg_coastguard_berth',na:'landlocked high-divide Silent Vales (twin glacial ribbon lakes at +1,840-1,880 m, 0 km ocean coast); lake safety is kept by silent cable-ferries and heliograph spires'},
 {trade:'temple priests and servants',voth:'voth_bldg_temple_ash',keys:['hs_hush_pylon_shrine','hs_bianzhong_belfry'],note:'keepers of the intact pre-Cataclysm Acoustic Hush-Pylon & sinusoidal 440/660 Hz harmonic belfries'},
 {trade:'shrine keepers',voth:'village shrine',keys:['hs_hush_pylon_shrine','hs_quartz_ossuary'],note:'tenders of open-palm threshold monoliths, rock-crystal prism gardens & white-quartz lantern steles'},
 {trade:'shopkeepers and assistants',voth:'voth_shop_trader',keys:['hs_tea_sign_pavilion','hs_prism_warehouse'],note:'open-sightline Handspeak tea & barter pavilions using carved tally-slates and gesture-ledgers'},
 {trade:'smiths and craftsmen',voth:'voth_shop_smithy',keys:['hs_bell_foundry','hs_lithophone_lapidary'],note:'two-tone elliptic bianzhong bronze bell-founders, heliograph shutter-smiths & nephrite/quartz lapidaries'},
 {trade:'innkeepers and servers',voth:'voth_tavern_b',keys:['hs_tea_sign_pavilion','hs_wayfarer_hospice'],note:'round-table Handspeak herbal tea, birch-ale & broth servers with unobstructed hand sightlines'},
 {trade:'porters and warehousemen',voth:'voth_warehouse_b',keys:['hs_prism_warehouse'],note:'felt-shod tumpline & cable-sled warehousemen storing quartz prisms, grain & wool bales'},
 {trade:'industrial workers',voth:'industrial lot',keys:['hs_lithophone_lapidary','hs_bell_foundry','hs_felt_weaver','hs_quartz_quarry'],note:'water-driven diamond/garnet-sand quartz & nephrite sawyers, bronze bell-tuners & felt fullers'},
 {trade:'power-house stokers and engineers',voth:'voth_generator',keys:['hs_heliograph_beacon','hs_lithophone_lapidary'],note:'optical heliograph prism-shutter engineers, parabolic reflector polishers & silent undershot waterwheelwrights'},
 {trade:'household service',voth:'rich house, manor, clan compound',keys:['hs_spire_villa_rich','hs_lithophone_manor_rich','hs_gallery_house_rich'],note:'sanctuary stewards tending chest-height crystal hand-lamps, thermal soapstone stoves & courtyard chimes'},
 {trade:'soldiers',voth:'voth_barracks',keys:['hs_mist_watch_spire','hs_palm_gate','hs_sanctuary_wall'],note:'aggression-zero border sentinels who bear yew bows & staves solely against rare southern Timpar-Kuran raiders'},
 {trade:'teachers and scholars',voth:'voth_school',keys:['hs_sign_academy'],note:'Handspeak grammarians, visual gesture-scroll chroniclers & harmonic acoustics scholars'},
 {trade:'guild officers and clerks',voth:'voth_bldg_guild_hall',keys:['hs_handspeak_moot','hs_sign_academy'],note:'stepped circular Handspeak council speakers & slate-ledger clerks'},
 {trade:'customs officers and clerks',voth:'customs house',keys:['hs_palm_gate','hs_wayfarer_hospice'],note:'Open-Palm border wardens instructing rare traders in basic Handspeak signs at the Hush threshold'},
 {trade:'healers and nurses',voth:'house of healing',keys:['hs_quiet_infirmary'],note:'thermal-stone, alpine-herb & 440 Hz tuning-fork vibration healers in sun-lit crystal wards'},
 {trade:'priests and undertakers',voth:'funerary temple',keys:['hs_quartz_ossuary'],note:'keepers of stepped snow-white quartz lantern columbaria & silent memorial palm-steles'},
 {trade:'lighthouse keepers',voth:'lighthouse',keys:['hs_heliograph_beacon'],note:'keepers of the 21 m snow-white quartz optical heliograph & rotating bronze-shutter prism beacon'},
 {trade:'dockers and stevedores',voth:'harbour pier',keys:['hs_silent_ferry','hs_prism_warehouse'],note:'ribbon-lake granite slipway & silent cable-pontoon cargo handlers'},
 {trade:'river bargemen and quay hands',voth:'river quay',keys:['hs_silent_ferry','hs_reed_skiff_shed'],note:'scull-oar lake bargemen & submerged-cable ferry capstan crews'},
 {trade:'fishers',voth:'fishing dock',keys:['hs_reed_skiff_shed'],note:'glacial ribbon-lake arctic-char & trout net-fishers'},
 {trade:'market traders',voth:'market stall',keys:['hs_tea_sign_pavilion','hs_handspeak_moot'],note:'open-arcade Handspeak visual finger-tally traders'},
 {trade:'farmhands and ploughmen',voth:'fields',keys:['hs_ribbon_terrace_farm'],note:'dry-stone granite lakeside barley, oat, flax & cold-frame root terrace cultivators'},
 {trade:'chinampa growers',voth:'chinampa bed',keys:['hs_ribbon_terrace_farm'],note:'sub-irrigated ribbon-lake reed-bed cress, sedge & water-root growers'},
 {trade:'orchardmen',voth:'orchards',keys:['hs_ribbon_terrace_farm','hs_herb_smokehouse'],note:'espaliered south-facing granite-wall rowan, sea-buckthorn, alpine berry & birch-sap tenders'},
 {trade:'miners',voth:'mine',keys:['hs_quartz_quarry','hs_bell_foundry'],note:'pegmatite milky-quartz, rock-crystal, nephrite, copper & tin miners linked via resSource'},
 {trade:'quarrymen and masons',voth:'quarry',keys:['hs_quartz_quarry','hs_lithophone_lapidary'],note:'feather-and-wedge silent granite/slate splitters & stepped white-quartz spire masons'},
 {trade:'granary keepers and millers',voth:'granary, windmill, watermill',keys:['hs_granary_spire'],note:'white-quartz-capped stilted granite grain-silo & felt-geared silent watermill keepers'},
 {trade:'beetle herders',voth:'beetle ranch',na:'no giant beetles in high-divide alpine Silent Vales; Hush-Kin keep woolly mountain-goats, pack-goats and lake waterfowl'},
 {trade:'dairymen',voth:'dairy',keys:['hs_ribbon_terrace_farm'],note:'high-meadow mountain-goat milkers & slate-cellar aged curd pressers'},
 {trade:'swineherds and duck keepers',voth:'sty, coop',keys:['hs_ribbon_terrace_farm','hs_reed_skiff_shed'],note:'ribbon-lake reed-pen duck & goose keepers'},
 {trade:'mushroom growers',voth:'mushroom farm',keys:['hs_ribbon_terrace_farm','hs_birch_brew_cellar'],note:'dark slate-vaulted alpine alecap & pale-fungi cellar growers'},
 {trade:'envoys and embassy staff',voth:'embassy',keys:['hs_wayfarer_hospice','hs_handspeak_moot'],note:'Handspeak sign-interpreters & written-slate envoys greeting rare peaceful mountain travellers'},
 {trade:'ferrymen',voth:'ferry, stop',keys:['hs_silent_ferry'],note:'operators of the underwater-cable silent ferry linking Silent Vales twin ribbon lakes'},
 {trade:'elephant bug handlers and station hands',voth:'bug station',na:'no elephant bugs in the high granite passes of Silent Vales; freight moves by underwater-cable lake ferries and felt-shod pack-goats'},
 {trade:'monks and lay brothers',voth:'monastery',keys:['hs_hush_pylon_shrine','hs_bianzhong_belfry'],note:'contemplative keepers of The Great Hush, crystal optics & pure sinusoidal lithophone harmony'},
 {trade:'palace and canton staffs',voth:'the cantons',keys:['hs_handspeak_moot','hs_lithophone_manor_rich'],note:'egalitarian stepped-amphitheatre Handspeak moot elders & sanctuary beacon stewards'}
];
globalThis.HS_TRADES=HS_TRADES;

/* Pure Hush-Kin quartz-spire, heliograph, 440/660 Hz harmonic & wind-pendulum math ([G data]): unit-tested in test-hush-kin.js */
const hsRigMath={
 /* Width of step `idx` (0 = base step, steps-1 = crown step) on a gleaming stepped snow-white quartz pyramidal spire. */
 quartzStepWidth(wBase,wTop,steps,idx){
  const n=Math.max(2,steps|0),k=idx<0?0:idx>=n?n-1:idx|0;
  const wb=Math.max(0.4,wBase),wt=Math.min(wb*0.85,Math.max(0.24,wTop==null?0.34:wTop));
  const t=k/Math.max(1,n-1);
  return +(wb+(wt-wb)*Math.pow(t,0.92)).toFixed(4);
 },
 /* Optical heliograph bronze shutter vane angle in [0, TAU) at clock time `timeSec` and per-tower `seedPhase`. */
 heliographAngle(timeSec,seedPhase,speed){
  const tau=Math.PI*2,sp=speed==null?0.45:speed,ph=seedPhase==null?0:seedPhase;
  const raw=(timeSec*sp+ph)%tau;
  return +(raw<0?raw+tau:raw).toFixed(5);
 },
 /* Pure sinusoidal frequencies (Hz) transmitted undamped through The Great Hush: 440 Hz (A4) & 660 Hz (E5) harmonic ladder. */
 harmonicFreqHz(barIdx){
  const k=Math.max(0,barIdx|0),oct=Math.pow(2,Math.floor(k/2));
  const base=(k%2===0)?440:660;
  return Math.round(base*oct);
 },
 /* Effective dusk Handspeak sign-illumination radius (m) for a white-quartz parabolic hand-lamp mounted at height `mountY` (ideal 1.25 m). */
 handLampReach(mountY,power){
  const y=mountY==null?1.25:mountY,pw=power==null?1:power;
  const align=Math.max(0.35,1-0.28*Math.abs(y-1.25));
  return +(3.8*pw*align).toFixed(4);
 },
 /* Rigid-pendulum sway pin-weight for suspended bianzhong bells & sawn nephrite qing slabs over v in [0,1]:
    exact 0 at top suspension ring (v=0) and linear rigid-body arc displacement down to v=1. */
 chimePin(v){
  if(v<=1e-5)return 0;
  const c=v<0?0:v>1?1:v;
  return +c.toFixed(5);
 },
 /* Pin weight for a Handspeak linen sign-banner or felt acoustic curtain hung from a crossbar at v=0: exact 0 at v=0. */
 hangPin(v){
  if(v<=1e-5)return 0;
  const c=v<0?0:v>1?1:v;
  return +(c*Math.sqrt(c)).toFixed(5);
 },
 /* Pin weight for a ferry-pennant, drying-herb or net line pinned at u=0 and u=1: exact 0 at both ends. */
 spanPin(u){
  if(u<=1e-5||u>=1-1e-5)return 0;
  const s=Math.sin(Math.PI*u);
  return +(s*Math.sqrt(s)).toFixed(5);
 },
 /* Depth z-offset for carved open-palm monoliths, quartz halos & reflector inlays:
    strictly >= 2.0 cm (0.020 m > 0.018 m) per layer so zero coplanar triangles ever overlap in zfightAudit. */
 formlineLayerZ(zFace,layerIdx){
  const k=Math.max(1,layerIdx|0);
  return +(zFace+k*0.02).toFixed(4);
 }
};
globalThis.hsRigMath=hsRigMath;
