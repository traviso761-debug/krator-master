// TARGET: wB — agent work sheet. Put your new keys in ROWDEF; SITES is derived. Views: edit 91z-views.js (keep ROWZ/SITES names).
const TITLE='Iziz work sheet wB';
const GROUND_C=200;
const ROWDEF=[['port_voth_embassy','port_order_chapterhouse']];
const ROWZ=[0,60,130,210,300,400,500,600,700,800];
const SITES=[];
ROWDEF.forEach((row,ri)=>{const ws=row.map(k=>VERN.defs[k].w+10);const total=ws.reduce((a,b)=>a+b,0);let x=-total/2;
 row.forEach((k,i)=>{SITES.push({key:k,x:x+ws[i]/2,z:ROWZ[ri],ry:0,o:{v:0}});x+=ws[i];});});
