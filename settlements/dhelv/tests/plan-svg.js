// node settlements/dhelv/tests/plan-svg.js — draws Dhelv's layout (src/41-dhelv-layout.js) as a plan, settlements/dhelv/layout-plan.svg:
// the city (the hub, the braid, the satellites, the cistern, the catacombs) and the outpost with the outer tube's start. Edges by kind
// (the outer zone dashed, the secret ways dotted), every site's footprint, the hall's square, the pits. For the owner to tune by eye.
// No node here: python3 tools/node_in_chromium.py settlements/dhelv/tests/plan-svg.js --write
'use strict';
const fs=require('fs'),path=require('path');
const DH=new Function(fs.readFileSync(path.join(__dirname,'..','src','41-dhelv-layout.js'),'utf8')+'\n;return DH;')();
const COL={tube:'#8a6a48',braid:'#5e3470',ramp:'#3f8f88',stair:'#c49a4a',ledge:'#a23a2a',square:'#b8ab90',street:'#7e6a50',door:'#000',secret:'#2b6fb0'};
const SITE_COL=k=>/council|temple|kiva|catacomb|niche/.test(k)?'#9a6a86':/estate|house|hut|gallery|farmhouse/.test(k)?'#c9a28c':/shop|stall|tavern|inn|caravan/.test(k)?'#d6c25a':
 /guard|barracks|watch|muster|scout|gate|palisade|portal/.test(k)?'#5c6672':/farm|granary|store|alecap/.test(k)?'#7a9a50':'#a8987a';
function panel(title,x0,z0,x1,z1,W,ox,oy){const s=W/(x1-x0),H=(z1-z0)*s,X=x=>(ox+(x-x0)*s).toFixed(1),Z=z=>(oy+(z-z0)*s).toFixed(1),out=[];
 out.push(`<g><rect x="${ox}" y="${oy}" width="${W}" height="${H.toFixed(1)}" fill="#efe7d6" stroke="#999"/>`);
 out.push(`<text x="${ox+8}" y="${oy+18}" font-size="14" font-weight="bold">${title}</text>`);
 const H0=DH.HALL;out.push(`<ellipse cx="${X(H0.c[0])}" cy="${Z(H0.c[1])}" rx="${(H0.rx*s).toFixed(1)}" ry="${(H0.rz*s).toFixed(1)}" fill="#e2d6bd" stroke="#8a7a5a"/>`);
 out.push(`<circle cx="${X(0)}" cy="${Z(0)}" r="${(H0.pool*s).toFixed(1)}" fill="#fff6d8" stroke="none"/>`);
 for(const P of DH.PITS)out.push(`<circle cx="${X(P.c[0])}" cy="${Z(P.c[1])}" r="${(P.r*s).toFixed(1)}" fill="#e6efd8" stroke="#6a8a4a"/><text x="${X(P.c[0])}" y="${Z(P.c[1]-P.r-4)}" font-size="11" text-anchor="middle">${P.name} (floor ${P.floor}, ${P.depth} m deep)</text>`);
 out.push(`<polygon points="${DH.PASTURE.map(p=>X(p[0])+','+Z(p[1])).join(' ')}" fill="#dfe8c0" stroke="#8a9a5a"/>`);
 out.push(`<polyline points="${DH.STREAM.map(p=>X(p[0])+','+Z(p[1])).join(' ')}" fill="none" stroke="#4a86c0" stroke-width="2"/>`);
 for(const st of DH.SITES){const F=DH.FOOT[st.key];if(!F)continue;if(F[2]==='round'){out.push(`<circle cx="${X(st.x)}" cy="${Z(st.z)}" r="${(F[0]/2*s).toFixed(1)}" fill="#8ab060" fill-opacity=".75" stroke="#333" stroke-width=".5"><title>${st.key} (${st.district})</title></circle>`);continue;}const [w,d,o]=F,za=o==='front'?-d:-d/2,zb=o==='front'?.5:d/2,c=Math.cos(st.ry),sn=Math.sin(st.ry);
  const q=[[-w/2,za],[w/2,za],[w/2,zb],[-w/2,zb]].map(([lx,lz])=>[st.x+lx*c+lz*sn,st.z-lx*sn+lz*c]);
  out.push(`<polygon points="${q.map(p=>X(p[0])+','+Z(p[1])).join(' ')}" fill="${SITE_COL(st.key)}" fill-opacity=".75" stroke="#333" stroke-width=".5"><title>${st.key} (${st.district})</title></polygon>`);
  const f=[st.x+Math.sin(st.ry)*1.5,st.z+Math.cos(st.ry)*1.5];out.push(`<line x1="${X(st.x)}" y1="${Z(st.z)}" x2="${X(f[0])}" y2="${Z(f[1])}" stroke="#000" stroke-width="1"/>`);}
 for(const e of DH.EDGES){const a=DH.byId[e.a],b=DH.byId[e.b];const dash=e.zone==='outer'?' stroke-dasharray="6 3"':e.zone==='secret'?' stroke-dasharray="2 3"':'';
  out.push(`<line x1="${X(a.x)}" y1="${Z(a.z)}" x2="${X(b.x)}" y2="${Z(b.z)}" stroke="${COL[e.kind]||'#000'}" stroke-width="${Math.max(1,Math.min(4,e.w*s*.6)).toFixed(1)}"${dash}><title>${e.a} - ${e.b}: ${e.kind}, ${e.w} m, ${(DH.grade(e)*100).toFixed(1)}%</title></line>`);}
 for(const n of DH.NODES){out.push(`<circle cx="${X(n.x)}" cy="${Z(n.z)}" r="2.2" fill="#222"><title>${n.id} y ${n.y}</title></circle>`);
  if(n.place)out.push(`<text x="${(+X(n.x)+4).toFixed(1)}" y="${(+Z(n.z)-4).toFixed(1)}" font-size="10">${n.place} (y ${Math.round(n.y)})</text>`);}
 out.push('</g>');return {svg:out.join('\n'),H};}
const A=panel('Dhelv: the city (x -620..720, z -320..720; north up)',-620,-320,720,720,1000,10,10);
const B=panel('The outpost in the kipuka and the outer tube\'s start (x -2800..-2300)',-2800,-160,-2300,180,1000,10,A.H+30);
const legend=Object.entries(COL).map(([k,c],i)=>`<line x1="${20+i*110}" y1="${A.H+B.H+60}" x2="${50+i*110}" y2="${A.H+B.H+60}" stroke="${c}" stroke-width="3"/><text x="${54+i*110}" y="${A.H+B.H+64}" font-size="11">${k}</text>`).join('');
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1020" height="${(A.H+B.H+80).toFixed(0)}" font-family="sans-serif">\n<rect width="100%" height="100%" fill="#fff"/>\n${A.svg}\n${B.svg}\n${legend}\n`+
 `<text x="20" y="${(A.H+B.H+78).toFixed(0)}" font-size="11">Dashed: the outer zone (foreigners). Dotted: the scouts' secret ways. A tick marks each site's front. Hover for ids, heights and grades.</text>\n</svg>\n`;
fs.writeFileSync(path.join(__dirname,'..','layout-plan.svg'),svg);console.log('wrote layout-plan.svg, '+svg.length+' bytes');
