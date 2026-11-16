// ================================================================= CORE HOST — the minimap underground: the deck band follows you, the line map (L)
// [web] core/host/97b-host-minimap-decks.js (core/host/UNDERGROUND.md; kits/tungang/PLAN.md section 6.3, view 4). OPT-IN BY FILE: a
// build lists it with core/minimap/decks/88b (host.py UNDERGROUND); a page without it is unchanged.
//
//   o.minimap = {..., decks: true | {walk: o.walk (the floors drawn by height; false: none), bands: [{y0, y1, name}] (the decks: the band
//                     is the one holding your feet), below: 2, above: 4 (no bands: a window round your feet), marks: true, dim: .28},
//                 schematic: {nodes, edges, title, lines, key: 'l', w: 320, h: 170, onPick(node)}}
//   KHOST.minimapDecks: {band() -> [y0, y1, name], schematic (the KMAP line map), panel (its element), open(on)}
// The band is set from the feet (walking) or the orbit's target, a few times a second, so the deck you are on is bright, the others
// dimmed, and the named things above and below you carry an arrow. The map's title says which deck.
(function(root){
'use strict';
const K=root.KHOST=root.KHOST||{},doc=root.document;
K.onTake(function minimapDecksTake(H){
 const o=H.o,MO=o.minimap;if(!MO||MO===true||!(MO.decks||MO.schematic))return;
 const M=K.minimap;if(!M||!M.band){K.err('core/host 97b: load core/minimap/decks/88b-core-minimap-decks.js (and 97-host-minimap.js) first');return;}
 const C=K.cam,D=MO.decks===true?{}:MO.decks||null,S=MO.schematic||null,R=K.minimapDecks={};
 // ---------------------------------------------------------------- the band
 if(D){const W=D.walk===undefined?o.walk:D.walk;
  if(W&&W.floors)M.walkBands(W,D.colour||((y)=>{const t=Math.max(0,Math.min(1,(y-(D.lo==null?-40:D.lo))/((D.hi==null?40:D.hi)-(D.lo==null?-40:D.lo))));return '#'+[120+t*80,110+t*60,90-t*20].map(v=>('0'+Math.round(v).toString(16)).slice(-2)).join('');}));
  const title=K.minimapPanel&&K.minimapPanel.el&&K.minimapPanel.el.firstChild,base=title?title.textContent:'';let cur=null,t0=0;
  R.band=function(){const c=C.ctl,y=c.walk?c.target.y-c.eye:c.target.y;
   if(D.bands&&D.bands.length){let b=null;D.bands.forEach(q=>{if(y>=q.y0-.5&&(!b||q.y0>b.y0))b=q;});b=b||D.bands[0];return [b.y0,b.y1,b.name||''];}
   const st=D.step==null?1:D.step,yq=Math.round(y/st)*st;return [yq-(D.below==null?2:D.below),yq+(D.above==null?4:D.above),''];};
  K.on(function minimapBand(){const now=performance.now();if(now-t0<300)return;t0=now;const b=R.band();
   if(cur&&cur[0]===b[0]&&cur[1]===b[1])return;cur=b;M.band(b[0],b[1],{marks:D.marks!==false,dim:D.dim});
   if(title)title.textContent=base+' · '+(b[2]||('y '+b[0].toFixed(1)+' to '+b[1].toFixed(1)));},'view');}
 // ---------------------------------------------------------------- the line map
 if(S){const L=R.schematic=M.schematic(S.nodes||[],S.edges||[],S),w=S.w==null?320:S.w,h=S.h==null?170:S.h;
  const panel=R.panel=doc.createElement('div');panel.className='kmap khost-chrome';panel.id='khost-linemap';
  panel.style.cssText='position:fixed;left:10px;bottom:'+((MO.size==null?280:MO.size)+40)+'px;z-index:11;display:none;padding:6px;background:rgba(10,10,12,.9);border:1px solid rgba(216,200,154,.45);border-radius:3px';
  const cv=doc.createElement('canvas');cv.width=w;cv.height=h;cv.style.cssText='display:block;width:'+w+'px;height:'+h+'px;cursor:pointer';panel.appendChild(cv);doc.body.appendChild(panel);
  const draw=()=>L.paint(cv.getContext('2d'),w,h);
  R.open=function(on){on=on===undefined?panel.style.display==='none':!!on;panel.style.display=on?'block':'none';if(on)draw();return on;};
  cv.addEventListener('click',e=>{const r=cv.getBoundingClientRect(),n=L.at((e.clientX-r.left)*w/r.width,(e.clientY-r.top)*h/r.height,w,h);if(n&&S.onPick)S.onPick(n);});
  const key=String(S.key||'l').toLowerCase(),own=o.keys&&o.keys[key];
  const typing=e=>{const t=e.target;return t&&(/INPUT|TEXTAREA|SELECT/.test(t.tagName)||t.isContentEditable);};
  root.addEventListener('keydown',e=>{if(typing(e)||e.ctrlKey||e.metaKey||e.altKey||own)return;if(e.key.toLowerCase()===key){R.open();e.preventDefault();}});
  if(K.ui){const b=doc.createElement('button');b.textContent='line map ('+key.toUpperCase()+')';b.id='khost-linemap-btn';b.onclick=()=>R.open();K.ui.appendChild(b);}}
});
})(typeof window!=='undefined'?window:globalThis);
