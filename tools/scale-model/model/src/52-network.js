  // ---- the Ancient network (a proposal): the Ancient lines and trunks, the later cultures' roads, tunnels, stations, upkeep ----
  // NET is written by build.py from openworld/network-proposal/net51.json (not the model's DATA: the network is drawn from its own
  // data and stays out of the model's edit queue). Each route: [id, class, from, to, name, km, tunnel_km, note, px (flat x,y), form
  // runs [[i, form]...], upkeep runs [[i, up]...]]; nodes [[name, x, y, kind, type]]. Drawn on the overlay canvas with the other layers,
  // in the colours of openworld/network-proposal/ancient-network-proposal-5.1.jpg. Everything is a `var` or a function: paintOverlay
  // runs before this fragment does, so paintNetwork and netAt read nothing here until NET_READY is set at its end.
  var NETC=null, NET_READY=false;
  const NET_UP={shoddy:'#c8a860',kept:'#46c869',partly:'#e6c446',lapsed:'#ec8c34',decayed:'#d6483a'};
  const NET_TUN='#ba8cff', NET_WAT='#6ec4f2', NET_VIA='#96e6eb';
  /* the modern roads: [fill, width, dash]; the Ancient classes are drawn by form and upkeep below */
  const NET_ROAD={izani:['#ec60d6',1.7,null],vothic:['#fafafa',1.6,null],xanadu:['#fa963c',1.8,null],yuni:['#f0cd50',1.7,null],
    trade:['#ec60d6',1.8,[7,4]],dirt:['#cda56e',1.6,[4,3]],dalab:['#cda56e',1.6,[4,3]],trail:['#78cd5f',1.4,[2,2]],extension:['#e1e4e8',2,[8,5]]};
  const NET_ORDER=['extension','trail','dalab','dirt','xanadu','yuni','trade','vothic','izani','trunk','possible','branch','line'];
  function netPrep(){
    if(NETC||typeof NET==='undefined') return NETC;
    const runs=(rl,n)=>{ const out=new Array(n); for(let k=0;k<rl.length;k++){ const a=rl[k][0], b=k+1<rl.length?rl[k+1][0]:n; for(let i=a;i<b;i++) out[i]=rl[k][1]; } return out; };
    const routes=NET.routes.map(r=>{ const f=r[8], pts=[]; for(let i=0;i<f.length;i+=2) pts.push([f[i],f[i+1]]);
      return {id:r[0],cls:r[1],from:r[2],to:r[3],name:r[4],km:r[5],tun:r[6],note:r[7],pts,form:runs(r[9],pts.length),up:runs(r[10],pts.length)}; });
    const grid=new Map(); routes.forEach((r,k)=>r.pts.forEach((p,n)=>{ const key=Math.floor(p[0]/8)+','+Math.floor(p[1]/8); let a=grid.get(key); if(!a) grid.set(key,a=[]); a.push(k,n); }));
    const named=new Set(NET.nodes.map(n=>n[0])), towns=new Map();
    routes.forEach(r=>{ if(!NET_ROAD[r.cls]||r.cls==='extension') return; [[r.from,r.pts[0]],[r.to,r.pts[r.pts.length-1]]].forEach(([nm,q])=>{ if(!named.has(nm)&&!/^the (Ancient|Temora|north basin) highway$/.test(nm)) towns.set(nm,q); }); });
    NETC={routes,grid,towns}; return NETC;
  }
  function netPath(pts,a,b){ og.beginPath(); for(let i=a;i<=b;i++){ const p=pts[i]; i===a?og.moveTo(p[0],p[1]):og.lineTo(p[0],p[1]); } }
  function paintNetwork(){
    if(!NET_READY||!layerOn.network) return; const C=netPrep(); if(!C) return;
    og.save(); og.lineCap='round'; og.lineJoin='round';
    for(const cls of NET_ORDER) for(const r of C.routes){ if(r.cls!==cls||r.pts.length<2) continue; const n=r.pts.length-1;
      const st=NET_ROAD[cls];
      if(st){ netPath(r.pts,0,n); og.setLineDash(st[2]?st[2].map(v=>v+1):[]); og.strokeStyle='rgba(12,14,16,0.9)'; og.lineWidth=st[1]+1.6; og.stroke();
        og.setLineDash(st[2]||[]); og.strokeStyle=st[0]; og.lineWidth=st[1]; og.stroke(); og.setLineDash([]); continue; }
      if(cls==='possible'){ netPath(r.pts,0,n); og.strokeStyle='rgba(12,14,16,0.9)'; og.lineWidth=4.6; og.stroke(); og.setLineDash([9,5]); og.strokeStyle='#ffd678'; og.lineWidth=2.8; og.stroke(); og.setLineDash([]); continue; }
      const lineCls=cls==='line'||cls==='branch', w=lineCls?4:2.6;
      netPath(r.pts,0,n); og.strokeStyle='rgba(10,12,14,0.95)'; og.lineWidth=w+2; og.stroke();
      /* by runs of form and upkeep: tunnels dashed violet, causeways and viaducts blue, the rest the line's white with its keeper's centre,
         or a trunk in its keeper's colour */
      for(let i=0;i<n;){ let j=i; const fm=r.form[i], up=r.up[i]; while(j<n&&r.form[j]===fm&&r.up[j]===up) j++;
        netPath(r.pts,i,j);
        if(fm==='tunnel'){ if(lineCls){ og.strokeStyle='#f5f5fa'; og.lineWidth=w; og.stroke(); } og.setLineDash([6,4]); og.strokeStyle=NET_TUN; og.lineWidth=lineCls?w*0.6:w; og.stroke(); og.setLineDash([]); }
        else{ og.strokeStyle=fm==='causeway'?NET_WAT:fm==='viaduct'?NET_VIA:lineCls?'#f5f5fa':(NET_UP[up]||NET_UP.lapsed); og.lineWidth=w; og.stroke();
          if(lineCls&&fm!=='causeway'&&fm!=='viaduct'){ og.strokeStyle=NET_UP[up]||NET_UP.kept; og.lineWidth=1.4; og.stroke(); } }
        i=j; } }
    /* the sites and stations, the docks, the places still to be named, then the towns the modern roads end at */
    og.font='600 10px "IBM Plex Sans",sans-serif'; og.textBaseline='middle'; og.textAlign='left';
    const label=(nm,x,y,col)=>{ og.lineWidth=3; og.strokeStyle='rgba(10,12,14,0.92)'; og.strokeText(nm,x,y); og.fillStyle=col; og.fillText(nm,x,y); };
    NET.nodes.forEach(([nm,x,y,kind,type])=>{ og.lineWidth=1.6; og.strokeStyle='#0a0c0e'; og.beginPath();
      if(kind==='dock'){ og.rect(x-3.5,y-3.5,7,7); og.fillStyle=NET_WAT; }
      else if(kind==='tbd'){ og.moveTo(x,y-5); og.lineTo(x+5,y); og.lineTo(x,y+5); og.lineTo(x-5,y); og.closePath(); og.fillStyle='#ffd678'; }
      else{ og.arc(x,y,/arcology|city/.test(type||'')?3.6:2.6,0,Math.PI*2); og.fillStyle='#f4f2ea'; }
      og.fill(); og.stroke(); label(nm,x+6,y-4,'#f4f2ea'); });
    og.font='500 9px "IBM Plex Sans",sans-serif';
    C.towns.forEach((q,nm)=>{ og.beginPath(); og.arc(q[0],q[1],2.2,0,Math.PI*2); og.fillStyle='#ec60d6'; og.fill(); og.lineWidth=1.2; og.strokeStyle='#0a0c0e'; og.stroke(); label(nm,q[0]+5,q[1]-3,'#f0dcec'); });
    og.restore();
  }
  /* the hover readout: the route nearest the pointer (within 3 px, 6 km) while the layer is on */
  function netAt(x,y){
    if(!NET_READY||!layerOn.network) return null; const C=netPrep(); if(!C) return null; let best=null,bd=9;
    for(let gx=Math.floor(x/8)-1;gx<=Math.floor(x/8)+1;gx++)for(let gy=Math.floor(y/8)-1;gy<=Math.floor(y/8)+1;gy++){ const a=C.grid.get(gx+','+gy); if(!a) continue;
      for(let i=0;i<a.length;i+=2){ const r=C.routes[a[i]], p=r.pts[a[i+1]], d=(p[0]-x)*(p[0]-x)+(p[1]-y)*(p[1]-y); if(d<bd){ bd=d; best=[r,a[i+1]]; } } }
    if(!best) return null; const [r,n]=best;
    return r.name+' · '+r.km+' km'+(r.tun?', '+r.tun+' in tunnel':'')+(r.form[n]==='tunnel'?' · here in tunnel':'')+(r.up[n]?' · '+r.up[n]:'')+(r.note?' · '+r.note:''); }
  NET_READY=true;
  /* the toggle, beside Tubes, and its legend */
  (function(){
    const bNet=document.getElementById('bNet'); if(!bNet) return;
    const leg=document.createElement('div'); leg.id='netLegend'; leg.className='legend'; leg.hidden=true;
    leg.style.cssText='padding:6px 0 8px;border-bottom:1px solid var(--border)';
    const sw=(css,txt)=>'<i style="'+css+'"></i><span>'+txt+'</span>';
    leg.innerHTML=[sw('background:#f5f5fa;box-shadow:inset 0 0 0 4px #46c869','Ancient line: centre = keeper'),sw('background:'+NET_UP.kept,'trunk, kept'),sw('background:'+NET_UP.partly,'partly kept'),
      sw('background:'+NET_UP.lapsed,'lapsed'),sw('background:'+NET_UP.shoddy,'shoddy repairs'),sw('background:'+NET_UP.decayed,'badly decayed / abandoned'),
      sw('background:repeating-linear-gradient(90deg,'+NET_TUN+' 0 5px,transparent 5px 8px)','tunnel'),sw('background:'+NET_VIA,'viaduct / causeway'),
      sw('background:repeating-linear-gradient(90deg,#ffd678 0 6px,transparent 6px 9px)','possible'),sw('background:#ec60d6','Izani highway (dashed: trade)'),
      sw('background:#fafafa','Vothic highway'),sw('background:#fa963c','Xanadu road'),sw('background:#f0cd50','Yuni road'),
      sw('background:repeating-linear-gradient(90deg,#cda56e 0 4px,transparent 4px 6px)','dirt road'),sw('background:repeating-linear-gradient(90deg,#78cd5f 0 2px,transparent 2px 4px)','Beast Rider trail')].join('');
    const anchor=document.getElementById('rainLegend'); if(anchor&&anchor.parentNode) anchor.parentNode.insertBefore(leg,anchor);
    const sync=()=>{ bNet.setAttribute('aria-pressed',layerOn.network); leg.hidden=!layerOn.network; };
    /* turning it on opens the key drawer the legend sits in (90-ui.js's setKeyExpanded: a click comes after start() has run) */
    bNet.onclick=()=>{ layerOn.network=!layerOn.network; sync(); overlay.visible=anyLayer()||measuring||drawing; layersSave(); paintOverlay(); if(layerOn.network) setKeyExpanded(true); };
    sync(); if(layerOn.network){ overlay.visible=true; paintOverlay(); }
  })();
