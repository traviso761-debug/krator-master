// Presets for Skyscraper J. Derived from SJ_SITE, which buildSkyJ fills per
// decay (site origin, heights, and where the toppled body fell); SJDEF is the
// fallback only if a builder threw.
const SJDEF={x:0,z:0,YB:32,YTOP:328,YSP:424,RP:122,CUT:150,fall:{ang:0,D0:62,L:186,r0:49,Ld:300,a2:0}};
const SJS=d=>Object.assign({},SJDEF,{x:SITEX(ROWS.skyJ,d)},SJ_SITE[d]||{});
const SJI=SJS(0),SJR=SJS(1),SJT=SJS(2),SJH=SJS(3);
// camera and target in site coordinates, optional night flag
const SJV=(S,c,t,n)=>[S.x+c[0],c[1],S.z+c[2],S.x+t[0],t[1],S.z+t[2]].concat(n?[1]:[]);
const SJHERO=(S,n)=>SJV(S,[-290,150,470],[0,212,0],n);
const SJF=SJT.fall||SJDEF.fall;
// a point along the fallen body's axis, s metres from the stump centre
function sjFP(s,h,off){const o=off||0;
 return[Math.cos(SJF.ang)*s-Math.sin(SJF.ang)*o,h,Math.sin(SJF.ang)*s+Math.cos(SJF.ang)*o];}
const SJFP=sjFP;
const VIEWS={
 // THE ROW: intact, rehabilitated, ruined and toppled, from the south.
 'Skyscraper J':            [450,260,1560,450,170,0],
 'The Whorl':               SJHERO(SJI),
 'Ruined':                  SJHERO(SJR),
 'Rehabilitated':           SJHERO(SJH),
 'Toppled':                 SJV(SJT,sjFP(SJF.D0+SJF.L*.35,230,560),sjFP(SJF.D0+SJF.L*.35,50)),
 // THE LATTICE: mid-height, close, the plates turning through the ribs
 'The lattice':             SJV(SJI,[-150,215,190],[0,212,0]),
 'The ruined lattice':      SJV(SJR,[-150,215,190],[0,212,0]),
 // THE CROWN: the cap, the open-ribbed spire and the needle
 'The crown':               SJV(SJI,[-110,360,120],[0,365,0]),
 'The broken crown':        SJV(SJR,[-110,360,120],[0,330,0]),
 // THE BASE at people scale: on the plaza among the roots
 'The base':                SJV(SJI,[-40,1.7,118],[20,22,40]),
 // LOOKING UP from the plaza, past the base block, up the trunk to the spire
 'Looking up':              SJV(SJI,[-26,1.7,112],[0,300,0]),
 // THE FALLEN BODY along its length, from beyond the spire and off to one side
 'The fallen body':         SJV(SJT,SJFP(SJF.Ld+140,45,70),SJFP(SJF.D0+40,30)),
 'Night':                   SJHERO(SJI,1),
 // UNDER THE TERRACES AT NIGHT: the lit rooms and the warm lines under the lips
 'The terraces at night':   SJV(SJI,[-150,120,190],[0,190,0],1),
};
