// ================================================================= THE SHEET: rows by form and size, every role, every dress, two camps
// A row entry is {key, o}: o carries the placement's dress, role, trade and seed place (world, cell, index) and the core/tags
// that follow from them (tnTags). The roles row asks core/camp which tent each role takes (KCAMP.tentFor), so the sheet shows
// the mapping a camp uses.
const TITLE=KIT.title;
let TN_SITE_N=0;
function tnSite(key,role,dress,trade){const p=tnParse(key),D=tnDress(dress);role=role||tnRoleOf(p.form,p.size);
 return {key,o:{v:0,role,trade:trade||null,dress:D.key,world:0,cell:1,index:TN_SITE_N++,tags:tnTags(role,trade||null,D,p.form)}};}
const TN_ROLE_ROW=[['family'],['sleeping'],['chief'],['council'],['workshop','smith'],['workshop','hide'],['workshop','seer'],['workshop','weaver'],
 ['supply'],['trade'],['guard'],['mess'],['stable'],['latrine']].map(q=>{const t=KCAMP.tentFor(q[0],{culture:'generic',trade:q[1]});return tnSite(t.key,q[0],t.dress,q[1]);});
const FAMILIES=[
 {name:'Ridge and wedge tents (Republican army)',keys:['tn-ridge-s','tn-ridge-m','tn-ridge-l','tn-wedge-s','tn-wedge-m'].map(k=>tnSite(k,null,'republican'))},
 {name:'Round tents: bell (generic), yurt (Scyvoi), conical (Beast Riders)',keys:['tn-bell-s','tn-bell-m','tn-bell-l'].map(k=>tnSite(k,null,'generic'))
  .concat(['tn-yurt-s','tn-yurt-m','tn-yurt-l'].map(k=>tnSite(k,null,'scyvoi')),['tn-cone-s','tn-cone-m','tn-cone-l'].map(k=>tnSite(k,null,'beast-rider')))},
 {name:'Long tents: black (desert nomads), marquee (Xanadu), round-ended (Eternian)',keys:['tn-black-m','tn-black-l'].map(k=>tnSite(k,null,'desert'))
  .concat(['tn-marquee-m','tn-marquee-l'].map(k=>tnSite(k,null,'xanadu')),['tn-roundend-m','tn-roundend-l'].map(k=>tnSite(k,null,'eternian')))},
 {name:'Open and wheeled: fly, awning, screen, wagon tilt',keys:[tnSite('tn-fly-m',null,'generic'),tnSite('tn-fly-l',null,'ash'),tnSite('tn-awning-m',null,'iziz'),
  tnSite('tn-screen-s',null,'generic'),tnSite('tn-wagon-m',null,'iziz')]},
 {name:'Every role (generic dress, core/camp mapping)',keys:TN_ROLE_ROW},
 {name:'One tent in every dress',keys:TN_DRESS_ORDER.map(d=>tnSite('tn-bell-m','family',d))},
 {name:'A nomad band (KCAMP ring)',keys:['tn-camp-band']},
 {name:'A caravan halt (KCAMP laager)',keys:['tn-camp-halt']}
];
