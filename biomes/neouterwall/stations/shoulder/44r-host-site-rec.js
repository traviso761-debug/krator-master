// ================================================================= HOST — the station's record (station 4: the Gate Shoulder)
// One record a station: its numbers only. Its site functions are its own (stations/shoulder/44s: the slumps and their pinnacles).
// PLAN.md section 7, station 4: the mirror scarp. On the scale model (5.1) at px 1430,345: 2,867 m, 1.11 atm, Csa (+18 °C, 643 mm: the
// rain shadow of the high crest, open to the gap's warm air), a slope falling east about 100 m a km into the Outland Gate. The Gate
// shoulder is the NE outer wall's low lobe on the west side of the Narrows (biomes/outlandgate/PLAN.md section 5): this station draws the
// shoulder only. The gap's floor, the Tierhounds' long wall at the Narrows (1438,326, 40 km north) and the citadel the outlandgate plan
// proposes on the shoulder are that kit's (and the owner's to settle): nothing of them is drawn here.
//
// WHAT THE STATION ADDS: the rim slumping east toward the gap (KRELIEF.slump, core/terrain 38c: three blocks under a head scarp, each
// tilted back, an uphill-facing scarp across it, a broken front, a toe), the head scarps bared to the fault's polish (the
// pseudotachylite mirrors of PLAN.md section 2 item 1: dark glassy faces, a stand-in until the glaze and the texture come), landslip
// pinnacles on the blocks' broken fronts (KSTACKS spires), talus at the scarps' feet.
const SITE={
 name:'shoulder',title:'The Gate Shoulder',kind:'scarp',R:1600,step:8,seed:6401,
 // Csa: hot dry summers (29 °C in the warmest month at the Narrows' floor, 1.4 km lower), mild wet winters
 amp:{warm:10,cold:9},
 // the NW outer wall's flora read for a dry, warm slope: its steppe on the open ground, thin woods on the shaded slopes (the woods of the
 // outlandgate plan's benches "grading to dry scrub on the Csa strip")
 nwMap:{meadow:'steppe',grove:'steppe'},larch:.35,
 // the slumps: the crown (the head scarp's line, north to south on the upper slope; the slope falls east: side -1)
 slumps:[{pts:[[-1150,-2600],[-1050,-900],[-1200,800],[-1100,2600]],side:-1,n:3,bw:520,h:85,tilt:7,seed:6411},
  {pts:[[700,-2400],[820,-600],[650,1400],[760,2800]],side:-1,n:2,bw:420,h:55,tilt:6,seed:6412}],
 // the pinnacles: how many on each slump's block fronts, their height and foot radius
 pinnacles:{n:14,H:[8,26],r:[2.5,5],seed:6421},
 need:[8],
 spine:[[-200,500],[-700,-300],[900,-200]],
 // the floor's band (BIO lod floor): narrower than the cauldrons' (the steppe's plumegrass is dense: under its instance cap)
 floor:[200,420],
 snow:{autumn:[2200,2800],winter:[700,1000],spring:[1500,1900],summer:[4000,4500]},
 hour:12,
 eye:30,
 views:V=>{const S=SITE_RECS.slumps[0],H=SITE_HEAD_AT(S,.45),P=PINNACLES[0]||{x:0,z:0,top:20,y0:0},o={
  'The mirror scarp':V([H[0]+160,H[1]+40,3],[H[0],H[1],30]),
  'Along the head scarp':V([H[0]+90,H[1]-700,4],[H[0]+40,H[1]+400,20]),
  'Landslip pinnacles':V([P.x+70,P.z-50,3],[P.x,P.z,(P.top-P.y0)*.5]),
  'East into the Outland Gate':V([400,0,30],[40000,-2000,-1500]),
  'The shoulder from above':V([-2200,600,320],[400,-400,0]),
  'Up the slumps to the crest':V([1300,300,6],[-4000,-500,600])};
  return o;}
};
