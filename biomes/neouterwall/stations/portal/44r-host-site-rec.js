// ================================================================= HOST — the station's record (station 5a: the Portal)
// One record a station: its numbers only. Its site functions are its own (stations/portal/44s: the valley's head, the portal, the cairns).
// PLAN.md section 2a and section 7, station 5a: the head of the Portal Valley and the Epidote Cave's outer mouth. On the scale model (5.1,
// edit 1) the valley is carved into the wall's back from 1330,295 to 1331,302 (floor 5,530 m rising to 5,900 m, 14 km) and the cave is a
// record (`tube_epidote_16`; its first cavern, `cav_epidote_portal`: "the cave's outer mouth at the head of the Portal Valley, 5,900 m,
// under the portal's ice", 60 x 35 m, 22 m high). The page stands on the valley floor 800 m short of the portal (px 1331,301.6); its y = 0
// is the plan's 5,900 m (far.py 'base'), 0.77 atm. The model gives -8 °C here: the warmest month under 0 °C, EF: snow and ice, nothing grows.
//
// WHAT THE STATION ADDS: the headwall's cliff (KRELIEF.scarp across the valley's head: the 1 km model's head is a 25-degree slope), the
// PORTAL in its foot (a KCARVE alcove 60 m wide and 22 high, facing down the valley: 47), the pilgrims' and prospectors' cairns up the
// floor (PLAN.md section 5, proposed: small KSTACKS piles, registered). The cave inside (the dry upper level, the gypsum, the Marble Hall)
// is a KCAVERN page of its own, not drawn here (KNOWN_ISSUES.md).
const SITE={
 name:'portal',title:'The Portal',kind:'portal',R:1600,step:8,seed:6601,
 amp:{warm:6,cold:8},
 // the headwall: its rim across the valley's head (west to east; the plateau to the south), its height and run
 head:{pts:[[-700,860],[-200,830],[300,840],[700,880]],h:70,run:38,seed:6611},
 // the portal at the cliff's foot on the valley's axis
 portal:{x:20,hw:30,depth:35,h:22,name:'The Portal (the Epidote Cave\'s outer mouth: 71 km of hypogene marble cave to the Epidote-Steam Tarn, 3.2 km below)'},
 // the cairns: down the valley's floor from the portal, every ~180 m (proposed: the pilgrims' way)
 cairns:{n:7,every:180,seed:6621},
 need:[5],
 spine:[[0,600],[0,0],[0,-700]],
 snow:{autumn:[-2000,-1900],winter:[-2000,-1900],spring:[-2000,-1900],summer:[-2000,-1900]},
 hour:12,
 eye:30,
 views:V=>{const M=SITE_MOUTHS[0],C=CAIRNS[2]||{x:0,z:0},o={
  'The Portal':V([M.c[0]+20,M.c[1]-140,4],[M.c[0],M.c[1],10]),
  'Into the Portal':V([M.c[0],M.c[1]-40,3],[M.c[0]-M.n[0]*30,M.c[1]-M.n[1]*30,6]),
  'Up the Portal Valley to the headwall':V([0,-1200,6],[M.c[0],M.c[1],30]),
  'A cairn on the floor':V([C.x+12,C.z-10,2],[C.x,C.z,1]),
  'Down the Portal Valley (north, toward Spider Lake)':V([0,500,10],[-500,-14000,-400]),
  'The valley from the headwall':V([0,1300,40],[0,-2000,0])};
  return o;}
};
