// ---------- city parameters ----------
const CITY=resolveCity(DATA.city);
const {WORLD,PLATEAU,CHASM,HILL,PALACE,TEMPLE,ARENA,TPAD,APAD,AMPH,SPIRE,NEEDLE,NEEDLE_H,SPA,SP,SPH,SPR,BPAD_T,GATES,PGATES}=CITY;const BPAD={};   // freighter pad at the spaceport, set below
function wallRaw(t){let r=CITY.wall.base;for(const [a,f,p] of CITY.wall.waves)r+=a*Math.sin(f*t+p);return r;}
function wallR(t){let r=wallRaw(t);for(const g of GATES){const d=angDiff(t,g);if(d<0.32){const k=1-smooth(0.06,0.32,d);r=r*(1-k)+wallRaw(g)*k;}}return r;}   // straight and flush around each gatehouse
function polar(x,z){return {r:Math.hypot(x,z),t:Math.atan2(z,x)};}
BPAD.x=SP.x+66*Math.cos(BPAD_T);BPAD.z=SP.z+66*Math.sin(BPAD_T);
const STATUES=CITY.STATUES;
for(const g of GATES){const R=wallR(g)+58;[-1,1].forEach(sd=>{STATUES.push([R*Math.cos(g)-sd*15*Math.sin(g),R*Math.sin(g)+sd*15*Math.cos(g),26,sd<0?0:1,-g+Math.PI/2]);});}   // colossi on the causeways
function angDiff(a,b){let d=a-b;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return Math.abs(d);}
