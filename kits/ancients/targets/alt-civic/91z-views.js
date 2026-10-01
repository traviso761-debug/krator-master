// Presets for alt-civic, generated per row. The sun stands west-south-west,
// so every shot stands south (and a little west) of what it looks at.
// Per type: the row (all four decays), intact close, ruined close, and the
// reclaimed variant at night (seventh element 1), when its fires show.
// ALT_VIEW_H: a rough height per type, to aim the shots at the body.
const ALT_VIEW_H={altOffT:60,altOffS:55,altOffF:45,altPort:50,altBunk:22,altLib:30,altGate:110,altRobo:30,altDc:35,altPolice:25,altHosp:40,altCampus:30,altGov:55};
// ALT_VIEW_D: how far back the close shots stand (about 2.4 x the building's radius).
const ALT_VIEW_D={altOffT:190,altOffS:160,altOffF:190,altPort:300,altBunk:160,altLib:140,altGate:420,altRobo:270,altDc:230,altPolice:130,altHosp:220,altCampus:300,altGov:240};
const VIEWS={};
{const ks=Object.keys(ROWS);
 if(ks.length){const R0=ROWS[ks[0]],RL=ROWS[ks[ks.length-1]];
  VIEWS['All civic alternates']=[-1500,1100,RL.z+500,250,0,(R0.z+RL.z)/2];}
 for(const k of ks){const R=ROWS[k],H=ALT_VIEW_H[k]||40,c=ALT_CAP[k],D=ALT_VIEW_D[k]||R.r*2;
  VIEWS[c]=[R.s*.5-R.r*.3,H+R.r*.7,R.z+R.s*1.5+R.r*.5,R.s*.5,H*.4,R.z];
  VIEWS[c+' · intact']=[-R.s-D*.45,H*.7,R.z+D*.9,-R.s,H*.55,R.z];
  VIEWS[c+' · ruined']=[R.s-D*.45,H*.7,R.z+D*.9,R.s,H*.45,R.z];
  VIEWS[c+' · reclaimed by day']=[R.t-D*.4,H*.5,R.z+D*.8,R.t,H*.4,R.z];
  VIEWS[c+' · reclaimed at night']=[R.t-D*.4,H*.5,R.z+D*.8,R.t,H*.4,R.z,1];
  VIEWS[c+' · rehabilitated']=[-D*.45,H*.7,R.z+D*.9,0,H*.5,R.z];}
 if(!ks.length)VIEWS['Empty']=[0,200,600,0,0,0];}
