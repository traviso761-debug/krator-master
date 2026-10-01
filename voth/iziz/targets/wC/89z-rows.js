// TARGET: wC — agent work sheet. Put your new keys in ROWDEF; SITES is derived. Views: edit 91z-views.js (keep ROWZ/SITES names).
// Round 3: the two Ancients-reclaimed guilds at scale 1, then the same two at the scale the city will place them.
const TITLE='Iziz work sheet wC';
const GROUND_C=300;
const ROWDEF=[['anc_salvagers_guild'],['anc_mercenary_guild']];
const ROWZ=[0,220,440,580,700,800,900,1000,1100,1200];   // rows spaced for the guilds' deep footprints (lab d 124, watch d 134)
const SITES=[];
ROWDEF.forEach((row,ri)=>{const ws=row.map(k=>VERN.defs[k].w+10);const total=ws.reduce((a,b)=>a+b,0);let x=-total/2;
 row.forEach((k,i)=>{SITES.push({key:k,x:x+ws[i]/2,z:ROWZ[ri],ry:0,o:{v:0}});x+=ws[i];});});
// the city will place these at ~.5 / ~.6: look at both
SITES.push({key:'anc_salvagers_guild',x:0,z:ROWZ[2],ry:0,o:{v:0,scale:.5},label:"Salvagers' Guild @ .5"});
SITES.push({key:'anc_mercenary_guild',x:0,z:ROWZ[3],ry:0,o:{v:0,scale:.6},label:'Mercenary Guild @ .6'});
