// ================================================================= HOST: the geology map and the node field, by family (G)
// [web] The overlay of kits/resources/PLACEMENT-RESEARCH.md features 1-4 on the kit's page: a panel with the whole scale
// model as its baked provinces (geology.json), one family's prospectivity over it, the polities' outlines, and a window
// (120 km; click the map to move it) whose nodes (45r-res-field.js RES_GEO.nodesIn) are drawn by family, the placers ringed.
// Under the map: the window's counts by family, and the polity under the pointer from the ledger (46r, data/ledger.json).
// Built on first open (G, or the panel's button), so the page loads as before. window._geomap: {open(), close(), at(px, py),
// family(f), stats()} for verify.py.
(function(){
 if(typeof RES_GEO==='undefined'||!RES_GEO.data())return;
 const D=RES_GEO.data(),W=D.grid.w,H=D.grid.h,PM=D.grid.px_m,su=(W-1)/(D.grid.fullW-1),sv=(H-1)/(D.grid.fullH-1);
 const COL={iron:'#b5532a',copper:'#2fb08c',gold:'#e8b830',tin:'#8a96a8',silver:'#dfe3ea',lead:'#666','rare-earth':'#c15fb0',coal:'#1c1c1c',
  sulfur:'#f0e030',saltpeter:'#f4f1e8',oil:'#5a4430',gypsum:'#cfc4ae',halite:'#ffffff',potash:'#d8604e',alkali:'#f0b48a',zinc:'#a07a3a',stone:'#999',clay:'#b07a50',wood:'#3a8a3a',water:'#4a8ad8'};
 const PROV=[[46,70,110],[176,160,112],[128,128,138],[170,62,40],[236,234,226],[60,140,100],[110,186,196],[120,80,110],[50,50,60],[214,160,160],[226,214,180],[60,110,60]];
 const LG=typeof RES_LEDGERDATA!=='undefined'?RES_LEDGERDATA:null;
 /* the window opens on the eastern uplands: 4.23 px 692,395, which is 964,725 on 5.1's canvas */
 const OLD=D.grid.fullW===1549;
 let built=false,fam='all',win={px:OLD?692:964,py:OLD?395:725,km:120},stats=null,cv,zv,info,panel,keyBox;
 const el=(t,css,par,txt)=>{const e=document.createElement(t);if(css)e.style.cssText=css;if(txt!=null)e.textContent=txt;if(par)par.appendChild(e);return e;};
 function inPoly(P,x,y){let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;}
 function drawWorld(){const g=cv.getContext('2d'),im=g.createImageData(W,H),pr=[];
  for(let j=0;j<H;j++)for(let i=0;i<W;i++){const c=RES_GEO.at(i/su*PM,j/sv*PM),k=(j*W+i)*4,b=PROV[D.provinces.indexOf(c.province)];
   let r=b[0]*.75,gg=b[1]*.75,bb=b[2]*.75;
   if(c.ruin){r=r*.6+255*.4;bb=bb*.6+255*.4;}
   if(fam!=='all'&&c.p[fam]){const t=c.p[fam]/255,h=COL[fam]||'#fff',hr=parseInt(h.slice(1,3),16),hg=parseInt(h.slice(3,5),16),hb=parseInt(h.slice(5,7),16);
    r=r*(1-t)+hr*t;gg=gg*(1-t)+hg*t;bb=bb*(1-t)+hb*t;}
   im.data[k]=r;im.data[k+1]=gg;im.data[k+2]=bb;im.data[k+3]=255;}
  g.putImageData(im,0,0);g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=1;
  for(const P of D.polities){g.beginPath();P.points.forEach((p,i)=>i?g.lineTo(p[0]*su,p[1]*sv):g.moveTo(p[0]*su,p[1]*sv));g.closePath();g.stroke();}
  const hw=win.km/2/(D.grid.cell_km);g.strokeStyle='#ff0';g.lineWidth=2;g.strokeRect(win.px*su-hw,win.py*sv-hw,hw*2,hw*2);}
 function drawWindow(){const g=zv.getContext('2d'),S=zv.width,r=win.km*500,cx=win.px*PM,cz=win.py*PM;
  const tile={x0:cx-r,z0:cz-r,x1:cx+r,z1:cz+r},o={stats:{}};if(fam!=='all')o.families=[fam];
  const ns=RES_GEO.nodesIn(tile,o),sc=S/(2*r);g.fillStyle='#202428';g.fillRect(0,0,S,S);
  /* the provinces under the window, coarse */
  const step=Math.max(1,Math.floor(S/(win.km/D.grid.cell_km)));
  for(let y=0;y<S;y+=step)for(let x=0;x<S;x+=step){const c=RES_GEO.at(tile.x0+x/sc,tile.z0+y/sc);if(!c)continue;const b=PROV[D.provinces.indexOf(c.province)];g.fillStyle='rgb('+(b[0]*.55|0)+','+(b[1]*.55|0)+','+(b[2]*.55|0)+')';g.fillRect(x,y,step,step);}
  const by={};for(const n of ns){by[n.kind]=(by[n.kind]||0)+1;const x=(n.gx-tile.x0)*sc,y=(n.gz-tile.z0)*sc,rad=n.grade==='high'?3.2:n.grade==='medium'?2.3:1.6;
   g.fillStyle=COL[n.kind]||'#fff';g.beginPath();g.arc(x,y,rad,0,6.2832);g.fill();
   if(n.placer){g.strokeStyle='#fff';g.lineWidth=1;g.beginPath();g.arc(x,y,rad+2.5,0,6.2832);g.stroke();}}
  stats={nodes:ns.length,byKind:by,dropped:o.stats,window:{px:win.px,py:win.py,km:win.km},placers:ns.filter(n=>n.placer).length};
  keyBox.textContent='';for(const k of Object.keys(by).sort()){const s=el('span','display:inline-flex;align-items:center;gap:4px;margin:0 8px 2px 0',keyBox);
   el('i','display:inline-block;width:9px;height:9px;border-radius:50%;background:'+COL[k],s);el('span','',s,k+' '+by[k]);}
  el('div','opacity:.7;margin-top:2px',keyBox,ns.length+' nodes in '+win.km+' km round px '+win.px+','+win.py+' ('+stats.placers+' placers ringed; dropped on water '+(o.stats.water||0)+', cliffs '+(o.stats.cliff||0)+')');}
 function readout(px,py){const c=RES_GEO.at(px*PM,py*PM);if(!c){info.textContent='';return;}
  let pol=null;for(const P of D.polities)if(inPoly(P.points,px,py)){pol=P.name;break;}
  const top=Object.keys(c.p).filter(k=>c.p[k]>0&&D.ledgerFamilies.indexOf(k)<0).sort((a,b)=>c.p[b]-c.p[a]).slice(0,5).map(k=>k+' '+c.p[k]).join(', ');
  let t='px '+px.toFixed(0)+','+py.toFixed(0)+'  '+c.province+(c.ruin?' + ruin ground':'')+'\n'+(top||'no ore');
  if(pol&&LG&&LG.polities[pol]){const R=LG.polities[pol];t+='\n'+pol+': imports '+(R.imports.join(', ')||'nothing')+'; exports '+(R.exports.join(', ')||'nothing')+(R.basics.ok?'':'; LACKS '+R.basics.missing.map(m=>m.lack.join('+')).join(' / '));}
  info.textContent=t;}
 function build(){built=true;const box=el('div','font:11px/1.35 system-ui,sans-serif;color:#e8e4da;width:470px',panel.body||panel);
  const fr=el('div','display:flex;flex-wrap:wrap;gap:3px;margin-bottom:4px',box);
  ['all'].concat(D.families).forEach(f=>{const b=el('button','font:10px system-ui;padding:1px 5px;border:1px solid #555;background:'+(f===fam?'#665':'#2a2a2a')+';color:#eee;cursor:pointer',fr,f);
   b.onclick=()=>{fam=f;[...fr.children].forEach(c=>c.style.background=c===b?'#665':'#2a2a2a');drawWorld();drawWindow();};});
  cv=el('canvas','width:470px;height:'+Math.round(470*H/W)+'px;image-rendering:pixelated;cursor:crosshair;display:block',box);cv.width=W;cv.height=H;
  cv.onclick=e=>{const r=cv.getBoundingClientRect();win.px=Math.round((e.clientX-r.left)/r.width*W/su);win.py=Math.round((e.clientY-r.top)/r.height*H/sv);drawWorld();drawWindow();};
  cv.onmousemove=e=>{const r=cv.getBoundingClientRect();readout((e.clientX-r.left)/r.width*W/su,(e.clientY-r.top)/r.height*H/sv);};
  info=el('div','white-space:pre-wrap;min-height:40px;margin:4px 0',box,'hover the map: province, prospectivity, polity; click: move the window');
  zv=el('canvas','width:470px;height:470px;display:block',box);zv.width=zv.height=470;
  keyBox=el('div','margin-top:4px',box);
  drawWorld();drawWindow();}
 function open(){if(!panel){panel=KHOST.panel('geomap','Geology and nodes (G)',null,'right:14px;top:70px;max-height:92vh;overflow:auto');}
  panel.style.display='';panel.classList.remove('min');if(panel._paint)panel._paint();if(!built)build();return stats;}
 function close(){if(panel)panel.style.display='none';}
 {const b=el('button','position:fixed;left:560px;bottom:14px;z-index:20;font:12px system-ui;padding:4px 9px;background:#2a2a2a;color:#eee;border:1px solid #666;cursor:pointer',document.body,'Geology map (G)');
  b.onclick=()=>{if(panel&&panel.style.display!=='none'&&built)close();else open();};}
 addEventListener('keydown',e=>{if((e.key==='g'||e.key==='G')&&!e.ctrlKey&&!e.metaKey&&!(e.target&&/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))){if(panel&&panel.style.display!=='none'&&built)close();else open();}});
 window._geomap={open:open,close:close,stats:()=>stats,family:f=>{fam=f;if(built){drawWorld();drawWindow();}return stats;},
  at:(px,py)=>{win.px=px;win.py=py;if(built){drawWorld();drawWindow();}return stats;}};
})();
