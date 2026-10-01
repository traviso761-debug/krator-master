// Presets for the Lighthouse island. Derived from LH_SITE, which
// buildLighthouse fills per decay; LHDEF is the fallback if a builder threw.
const LHDEF={x:0,z:0,YK:30,YTOP:202,YL1:217,YAP:228,YLP:210,CUT:88,WL:2.5,RS:270,cove:80,jetty:[74,124],fall:{ang:0,D0:26,DE:110,DB:115,LB:40}};
const LHS=d=>Object.assign({},LHDEF,{x:SITEX(ROWS.lighthouse,d)},LH_SITE[d]||{});
const LHI=LHS(0),LHR=LHS(1),LHT=LHS(2),LHH=LHS(3);
const LHV=(S,c,t,n)=>[S.x+c[0],c[1],S.z+c[2],S.x+t[0],t[1],S.z+t[2]].concat(n?[1]:[]);
const LHHERO=(S,n)=>LHV(S,[-330,95,520],[0,105,0],n);
const LHF=LHT.fall||LHDEF.fall;
const lhFP=(s,h,o)=>{o=o||0;return[Math.cos(LHF.ang)*s-Math.sin(LHF.ang)*o,h,Math.sin(LHF.ang)*s+Math.cos(LHF.ang)*o];};
const LHW=LHR.wreck||{x:-200,z:0};
const VIEWS={
 // THE ROW: intact, rehabilitated and ruined in one channel, the toppled one beyond
 'Lighthouse island':       [470,430,1560,470,40,0],
 'The lighthouse':          LHHERO(LHI),
 'Ruined':                  LHHERO(LHR),
 'Rehabilitated':           LHHERO(LHH),
 'Toppled':                 LHV(LHT,lhFP(95,120,-330),lhFP(110,20)),
 // THE LANTERN: gallery, glazing, lens and the rib cage over the dome
 'The lantern':             LHV(LHI,[-46,LHI.YTOP+12,40],[0,LHI.YTOP+9,0]),
 'The smashed lantern':     LHV(LHR,[-46,LHR.YTOP+12,40],[0,LHR.YTOP+6,0]),
 // THE HARBOUR from a boat outside the mole, looking up the cove to the tower
 'The harbour':             LHV(LHI,[-18,LHI.WL+7,LHI.jetty[1]+26],[4,34,40]),
 // the cove from the sea: the ravine path, the lodges, the tower over them
 'The cove':                LHV(LHI,[40,26,LHI.RS-10],[0,40,40]),
 'The wreck':               LHV(LHR,[LHW.x-40,20,LHW.z+70],[LHW.x,4,LHW.z]),
 'Looking up':              LHV(LHI,LHI.lookUp||[4,12,58],[0,LHI.YTOP-10,0]),
 'The fallen tower':        LHV(LHT,lhFP(LHF.DB+LHF.LB+70,30,60),lhFP(LHF.D0+30,20)),
 // NIGHT: the beams sweep (a preset re-aims them at a fixed angle to the camera)
 'Lighthouse at night':     LHV(LHI,[-560,150,760],[0,120,0],1),
 'The fire basket at night':LHV(LHH,[-150,LHH.YTOP+40,230],[0,LHH.YTOP,0],1),
};
