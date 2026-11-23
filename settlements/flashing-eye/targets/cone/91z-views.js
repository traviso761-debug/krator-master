// TARGET: cone — camera presets [camX,camY,camZ, targetX,targetY,targetZ], and the page's budgets
const feEye=(x,z,tx,ty,tz,dy)=>[x,terrainH(x,z)+1.7+(dy==null?0:dy),z,tx,ty,tz];
const VIEWS=(function(){
 const V={},R=FE_PLACE.find(p=>p.id==='lip-range'),P=FE_PLACE.find(p=>p.id==='post'),vy=FE_VENT.y;
 V['Overview']=[-620,180,980,0,-40,-120];   /* from over the apron, south-west: the band, the bench and the cone */
 V['The band from the apron']=feEye(140,520,-40,-40,0,0);   /* on the apron below: the face, its talus, the Lip Range on top */
 V['The Lip Range from the east']=[150,30,60,0,-4,0];   /* from over the face's east end: the range on the Lip, its lower floors in the rock */
 V['The bench from the Gate of Breath']=feEye(6,-158,0,4,-40,2);
 V['On the balcony of the Mirror Hall']=[-58,1.75,2.2,80,2,2.2];   /* on the terrace in front of L0, east along the range */
 V['The Rift from the Mirror Hall']=[-45,9,-4,-260,-900,3000];
 V['The cone from the cap']=feEye(60,-900,0,vy+260,-2200,0);
 V['The crater from the rim']=[P.x+14,P.o.y+30,P.z+34,FE_VENT.x,vy+30,FE_VENT.z];   /* behind the Eye Post, over the rim: the bowl and the vent */
 V['The Eye Post']=[P.x+40,P.o.y+18,P.z+50,P.x,P.o.y+6,P.z];
 /* the revamp (the owner, 2026-11-23): the Way of Shrines from the apron, from its last bridge, and the complex from the Rift side */
 {const S1=FE_STACKS[0],S6=FE_STACKS[5];V['The Way of Shrines']=feEye(S1.x+120,S1.z+160,(S1.x+S6.x)/2,-90,(S1.z+S6.z)/2,0);}
 {const B=FE_BRIDGES[5],m=B.pts[24];V['On the last bridge']=[m[0],m[1]+1.7,m[2],B.b[0],B.b[1]+8,B.b[2]-30];}
 V['The house from the Rift']=[260,40,420,0,10,-60];
 V['The terraces and the Ember Tower']=[70,22,-30,0,20,-126];
 {const F=FE_PLACE.find(p=>p.id==='foothouse');V['The Foot House']=[F.x+90,F.o.y+40,F.z+110,F.x,F.o.y+5,F.z];}
 return V;})();
BUDGET.showcase={tris:16000000,calls:2400};BUDGET.cls.city=16000000;for(const k in TSTAT.by)BUDGET.type[k.split('/')[0]]='city';
if(window._api)Object.assign(window._api,FE_API);
if(window._api)window._api.setHour=h=>{FE_SKY.hour=h;FE_CLOCK.t0=FE_SKY.day*86400+h*3600;FE_CLOCK.start=performance.now();};   /* the clock, for a night shot */
if(window._api)window._api.lamps=b=>({format:'krator-lamps',version:1,convention:'metres, +Y up; at is the lamp; color sRGB; size the halo\'s world diameter',
 lamps:FE_LAMPS.filter(l=>!b||(l[0]>=b[0]&&l[0]<=b[2]&&l[2]>=b[1]&&l[2]<=b[3])).map(l=>({at:[+l[0].toFixed(3),+l[1].toFixed(3),+l[2].toFixed(3)],amp:1,
  radius:l[3]==='fire'?60:40,cool:false,color:l[3]==='fire'?'#ff8a3a':'#ff7a30',size:.6,hours:[18.4,30.2],kind:l[3]}))});
