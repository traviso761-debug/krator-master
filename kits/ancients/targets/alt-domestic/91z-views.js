// Presets, four per type, written off ROWS so they follow any re-spacing:
//   <name> — row        the four states west to east, by day
//   <name> — intact     close on the intact one
//   <name> — reclaimed  close on the reclaimed one (the camp), by day
//   <name> — night      the same shot at night, when the camp's fires show
// [name, height of the thing in metres, radius of one site in metres]
const AD_VIEWSPEC={adWave:['Undulant house',18,24],adBridge:['Bridge house',12,22],adFins:['Fin apartments',48,80],
 adAmph:['Garden amphitheater',16,80],adFuel:['Trestle fuel station',28,40],adRadar:['Rotor radar tower',64,30],
 adDish:['Flower dish',46,46],adMega:['The Rampart',230,300],adFac:['Pilotis works',70,190],adLab:['Star laboratory',30,64]};
const VIEWS={};
for(const k in ROWS){const R=ROWS[k],V=AD_VIEWSPEC[k];if(!V)continue;const[nm,h,rs]=V;
 const W=R.t+R.s+2*rs,cx=(R.t-R.s)/2;
 if(Object.keys(VIEWS).length===0)VIEWS['Alternate domestic types']=[-2600,1500,1850,350,0,1850];
 // the row shot stands south of the row but short of the next one; when the
 // gap is too small it climbs instead, keeping the same distance to the row
 let gap=1e9;for(const j in ROWS)if(ROWS[j].z>R.z)gap=Math.min(gap,ROWS[j].z-ROWS[j].r-R.z);
 const far=W*.72,dz=Math.min(far*.85,gap*.92),dy=Math.max(h*.6+W*.12,Math.sqrt(Math.max(0,far*far-dz*dz)));
 VIEWS[nm+' — row']=[cx,dy,R.z+dz,cx,h*.3,R.z];
 VIEWS[nm+' — intact']=[-R.s+rs*1.2,h*.6+rs*.35,R.z+rs*2.1,-R.s,h*.38,R.z];
 VIEWS[nm+' — reclaimed']=[R.t+rs*1.2,h*.6+rs*.35,R.z+rs*2.1,R.t,h*.32,R.z];
 VIEWS[nm+' — night']=[R.t-rs*1.1,h*.6+rs*.3,R.z+rs*2.0,R.t,h*.3,R.z,1];}
