"""Region layers for the scale model page: political / geographic / biome, each its own toggle,
a tabbed region list, a control to move a region between layers, and labels that follow the
shape of long, thin regions.   python3 patch_ui.py <in.html> <out.html>"""
import sys
src, dst = sys.argv[1], sys.argv[2]
s = open(src).read()

def rep(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, (n, old[:90])
    s = s.replace(old, new)

# ---- CSS ----
rep("#regions{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:2px}",
    "#regions{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:2px;max-height:260px;overflow-y:auto}\n"
    "#rTabs{display:grid;grid-template-columns:repeat(3,1fr);gap:0;border:1px solid var(--line)}\n"
    "#rTabs button{border:0;border-right:1px solid var(--line);padding:6px 4px;font-size:11px;letter-spacing:.02em}\n"
    "#rTabs button:last-child{border-right:0}\n"
    "#rTabs button[aria-selected=true]{background:rgba(255,255,255,.08);color:var(--text);box-shadow:inset 0 -2px 0 var(--copper)}\n"
    "#rTabs button[aria-selected=false]{color:var(--mute)}\n"
    "#rTabs b{font:400 10px var(--font-m);color:var(--mute);margin-left:4px}\n"
    ".kindrow{grid-column:1/-1;display:flex;align-items:center;gap:8px;font-size:12px;color:var(--mute)}\n"
    ".kindrow .seg{display:flex;flex:1}\n"
    ".kindrow .seg button{flex:1;padding:4px 6px;font-size:11px;margin-left:-1px}\n"
    ".layers{display:flex;gap:0}\n.layers button{margin-left:-1px}")

# ---- markup: three layer toggles in place of the single regions button ----
rep('    <button id="bRegions" aria-pressed="true">regions</button>\n',
    '    <span class="layers" role="group" aria-label="Region layers"><button id="bRegPol" aria-pressed="true" title="Political regions">political</button><button id="bRegGeo" aria-pressed="false" title="Geographic regions">geographic</button><button id="bRegBio" aria-pressed="false" title="Biome regions">biomes</button></span>\n')
rep('    <h2>Regions</h2>\n    <div class="row"><button id="bDraw">Draw region</button>',
    '    <h2>Regions</h2>\n    <div id="rTabs" role="tablist" aria-label="Region list"></div>\n    <div class="row"><button id="bDraw">Draw region</button>')
rep('      <div class="sw" id="eSw"></div>\n',
    '      <div class="sw" id="eSw"></div>\n      <div class="kindrow"><span>Layer</span><div class="seg" id="eKind" role="group" aria-label="Move to layer"></div></div>\n')

# ---- state, kinds, layer toggles ----
rep("  function areaKm2(pts){",
r"""  // ---- region layers: every region is political, geographic or biome ----
  const KINDS=[{k:'political',label:'Political',btn:'bRegPol'},{k:'geographic',label:'Geographic',btn:'bRegGeo'},{k:'biome',label:'Biomes',btn:'bRegBio'}];
  const KIND_BY=Object.fromEntries(KINDS.map(x=>[x.k,x]));
  // regions saved before layers existed carry no kind: place them by name until someone moves them
  const GEO_RE=/\b(valley|vale|isles?|islands?|ocean|sea|bay|gulf|lake|rift|crater|cut|bowl|tiers|catch|pits|steampits|farside|ruins|plateau|mesa|range|mountains?|wall|desert|basin|coast|region \d+)\b/i;
  function kindOf(r){ return KIND_BY[r.kind]?r.kind:(GEO_RE.test(r.name||'')?'geographic':'political'); }
  const layerOn={political:true,geographic:false,biome:false};
  let tab='political';
  try{ const j=JSON.parse(localStorage.getItem('krator.regionLayers')||'null'); if(j){ Object.keys(layerOn).forEach(k=>{ if(typeof j.on?.[k]==='boolean') layerOn[k]=j.on[k]; }); if(KIND_BY[j.tab]) tab=j.tab; } }catch(e){}
  function layersSave(){ try{ localStorage.setItem('krator.regionLayers',JSON.stringify({on:layerOn,tab})); }catch(e){} }
  const anyLayer=()=>Object.values(layerOn).some(Boolean);
  function setLayer(k,on){ layerOn[k]=on; const b=document.getElementById(KIND_BY[k].btn); if(b) b.setAttribute('aria-pressed',on);
    overlay.visible=anyLayer()||measuring||drawing; layersSave(); paintOverlay(); }
  KINDS.forEach(x=>{ const b=document.getElementById(x.btn); b.setAttribute('aria-pressed',layerOn[x.k]); b.onclick=()=>setLayer(x.k,!layerOn[x.k]); });
  overlay.visible=anyLayer();
  const rTabs=document.getElementById('rTabs');
  function renderTabs(){
    rTabs.innerHTML='';
    KINDS.forEach(x=>{ const b=document.createElement('button'); b.setAttribute('role','tab'); b.setAttribute('aria-selected',tab===x.k);
      const n=[...regions.values()].filter(r=>kindOf(r)===x.k).length;
      b.innerHTML=x.label+'<b>'+n+'</b>'; b.onclick=()=>{ tab=x.k; if(!layerOn[x.k]) setLayer(x.k,true); layersSave(); renderList(); }; rTabs.appendChild(b); });
  }
  const eKind=document.getElementById('eKind');
  KINDS.forEach(x=>{ const b=document.createElement('button'); b.textContent=x.label; b.dataset.k=x.k; b.title='Move this region to the '+x.label.toLowerCase()+' layer';
    b.onclick=()=>{ if(!sel||kindOf(sel)===x.k) return; sel.kind=x.k; tab=x.k; if(!layerOn[x.k]) setLayer(x.k,true); layersSave(); commitSel(); }; eKind.appendChild(b); });
  function syncKind(){ [...eKind.children].forEach(b=>b.setAttribute('aria-pressed',!!sel&&kindOf(sel)===b.dataset.k)); }

  // ---- labels: straight at the centre, or along the spine of a long, thin region ----
  const labelCache=new Map();
  function spineOf(pts){
    const n=pts.length; if(n<3) return null;
    let mx=0,my=0; pts.forEach(p=>{mx+=p[0];my+=p[1];}); mx/=n; my/=n;
    let sxx=0,syy=0,sxy=0; pts.forEach(p=>{const dx=p[0]-mx,dy=p[1]-my; sxx+=dx*dx; syy+=dy*dy; sxy+=dx*dy;});
    const a=0.5*Math.atan2(2*sxy,sxx-syy), ux=Math.cos(a), uy=Math.sin(a), vx=-uy, vy=ux;
    let t0=Infinity,t1=-Infinity,s0=Infinity,s1=-Infinity;
    pts.forEach(p=>{const dx=p[0]-mx,dy=p[1]-my,t=dx*ux+dy*uy,s=dx*vx+dy*vy; t0=Math.min(t0,t); t1=Math.max(t1,t); s0=Math.min(s0,s); s1=Math.max(s1,s);});
    const L=t1-t0, Wd=s1-s0;
    // the inside of the polygon along each cross-section: a run of samples down its length
    const K=28, mids=[], widths=[]; let prev=null;
    for(let k=0;k<=K;k++){
      const t=t0+L*(0.06+0.88*k/K), cx=mx+ux*t, cy=my+uy*t, hits=[];
      for(let i=0;i<n;i++){ const p=pts[i], q=pts[(i+1)%n];
        const pdx=p[0]-cx, pdy=p[1]-cy, qdx=q[0]-cx, qdy=q[1]-cy;
        const pt=pdx*ux+pdy*uy, qt=qdx*ux+qdy*uy; if((pt>0)===(qt>0)) continue;
        const f=pt/(pt-qt); hits.push((pdx+(qdx-pdx)*f)*vx+(pdy+(qdy-pdy)*f)*vy); }
      hits.sort((x,y)=>x-y); let best=null;
      for(let i=0;i+1<hits.length;i+=2){ const m=(hits[i]+hits[i+1])/2, w=hits[i+1]-hits[i];
        const score=prev===null?w:w-Math.abs(m-prev)*1.5; if(!best||score>best.score) best={m,w,score}; }
      if(!best) continue; prev=best.m; mids.push([cx+vx*best.m,cy+vy*best.m]); widths.push(best.w);
    }
    if(mids.length<6) return null;
    for(let pass=0;pass<4;pass++) for(let i=1;i<mids.length-1;i++) mids[i]=[(mids[i-1][0]+2*mids[i][0]+mids[i+1][0])/4,(mids[i-1][1]+2*mids[i][1]+mids[i+1][1])/4];
    const ws=widths.slice().sort((x,y)=>x-y), w=ws[ws.length>>1];
    let len=0; for(let i=1;i<mids.length;i++) len+=Math.hypot(mids[i][0]-mids[i-1][0],mids[i][1]-mids[i-1][1]);
    return {mids,width:w,len,elong:L/Math.max(Wd,1)};
  }
  function labelFor(r){
    const key=r.points.length+':'+r.points.map(p=>p[0]+','+p[1]).join(';');
    const c=labelCache.get(r.id); if(c&&c.key===key) return c;
    const sp=spineOf(r.points);
    const curved=!!sp && sp.elong>2.3 && sp.len>70;
    const out={key,curved,sp,c:centroid(r.points)}; labelCache.set(r.id,out); return out;
  }
  const LABEL_FONT={political:'600 {s}px "IBM Plex Sans", system-ui, sans-serif',geographic:'italic 500 {s}px "Fraunces", Georgia, serif',biome:'italic 500 {s}px "IBM Plex Sans", system-ui, sans-serif'};
  function drawLabel(r){
    const lab=labelFor(r), kind=kindOf(r), text=kind==='political'?r.name.toUpperCase():r.name;
    og.textBaseline='middle'; og.lineJoin='round';
    const ink=(ch,x,y)=>{ og.lineWidth=4; og.strokeStyle='rgba(0,0,0,.75)'; og.strokeText(ch,x,y); og.fillStyle='#fff'; og.fillText(ch,x,y); };
    if(!lab.curved){ og.font=LABEL_FONT[kind].replace('{s}',15); og.textAlign='center'; ink(text,lab.c[0],lab.c[1]); return; }
    let pts=lab.sp.mids; if(pts[pts.length-1][0]<pts[0][0]) pts=pts.slice().reverse();   // read left to right
    const fs=Math.max(12,Math.min(22,lab.sp.width*0.5)); og.font=LABEL_FONT[kind].replace('{s}',fs.toFixed(1)); og.textAlign='center';
    const chars=[...text], cw=chars.map(ch=>og.measureText(ch).width), tw=cw.reduce((a,b)=>a+b,0);
    const sp=chars.length>1?Math.max(0,Math.min(fs*0.9,(lab.sp.len*0.72-tw)/(chars.length-1))):0;
    const total=tw+sp*(chars.length-1); if(total>lab.sp.len*1.05){ og.font=LABEL_FONT[kind].replace('{s}',15); ink(text,lab.c[0],lab.c[1]); return; }
    const cum=[0]; for(let i=1;i<pts.length;i++) cum.push(cum[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));
    const at=d=>{ d=Math.max(0,Math.min(cum[cum.length-1],d)); let i=1; while(i<cum.length-1&&cum[i]<d) i++;
      const f=(d-cum[i-1])/Math.max(1e-6,cum[i]-cum[i-1]); return [pts[i-1][0]+(pts[i][0]-pts[i-1][0])*f, pts[i-1][1]+(pts[i][1]-pts[i-1][1])*f]; };
    let d=(cum[cum.length-1]-total)/2; const place=[];
    chars.forEach((ch,i)=>{ const mid=d+cw[i]/2, p=at(mid), a=at(mid-fs*0.7), b=at(mid+fs*0.7);
      place.push([ch,p,Math.atan2(b[1]-a[1],b[0]-a[0])]); d+=cw[i]+sp; });
    // too sharp a bend between neighbouring letters garbles them: set the name straight instead,
    // tilted along the region from end to end
    let kink=0; for(let i=1;i<place.length;i++){ let da=Math.abs(place[i][2]-place[i-1][2]); if(da>Math.PI) da=2*Math.PI-da; kink=Math.max(kink,da); }
    if(kink>0.45){
      const A=pts[0], B=pts[pts.length-1], m=at(cum[cum.length-1]/2); let ang=Math.atan2(B[1]-A[1],B[0]-A[0]);
      if(ang>Math.PI/2) ang-=Math.PI; if(ang<-Math.PI/2) ang+=Math.PI;
      og.font=LABEL_FONT[kind].replace('{s}',15); og.save(); og.translate(m[0],m[1]); og.rotate(ang); ink(text,0,0); og.restore(); return;
    }
    place.forEach(([ch,p,ang])=>{ og.save(); og.translate(p[0],p[1]); og.rotate(ang); ink(ch,0,0); og.restore(); });
  }

  function areaKm2(pts){""")

# ---- overlay painting ----
rep("""    const showRegions=document.getElementById('bRegions').getAttribute('aria-pressed')==='true';
    if(showRegions) for(const r of regions.values()){
      if(r.points.length<2) continue;
      og.beginPath(); r.points.forEach((p,i)=>i?og.lineTo(p[0],p[1]):og.moveTo(p[0],p[1])); og.closePath();
      const isSel=sel&&sel.id===r.id;
      og.fillStyle=hexA(r.color,isSel?0.45:0.28); og.fill();
      og.lineWidth=isSel?4:2.5; og.strokeStyle=r.color; og.stroke();
      const c=centroid(r.points); og.font='500 15px "IBM Plex Sans", system-ui, sans-serif'; og.textAlign='center'; og.textBaseline='middle';
      og.lineWidth=4; og.strokeStyle='rgba(0,0,0,.75)'; og.strokeText(r.name,c[0],c[1]); og.fillStyle='#fff'; og.fillText(r.name,c[0],c[1]);
    }
""","""    // biomes underneath, then geography, then politics on top; the selected region always shows
    const order={biome:0,geographic:1,political:2};
    const shown=[...regions.values()].filter(r=>r.points.length>=2&&(layerOn[kindOf(r)]||(sel&&sel.id===r.id))).sort((a,b)=>order[kindOf(a)]-order[kindOf(b)]);
    for(const r of shown){
      const kind=kindOf(r), isSel=sel&&sel.id===r.id;
      og.beginPath(); r.points.forEach((p,i)=>i?og.lineTo(p[0],p[1]):og.moveTo(p[0],p[1])); og.closePath();
      og.fillStyle=hexA(r.color,isSel?0.45:kind==='political'?0.28:0.18); og.fill();
      og.setLineDash(kind==='geographic'?[10,6]:kind==='biome'?[2,6]:[]);
      og.lineWidth=isSel?4:kind==='biome'?3:2.5; og.strokeStyle=r.color; og.stroke(); og.setLineDash([]);
    }
    for(const r of shown) drawLabel(r);
""")

# ---- list, selection, drawing, saving ----
rep("""    [...regions.values()].sort((a,b)=>a.name.localeCompare(b.name)).forEach(r=>{""",
    """    renderTabs();
    [...regions.values()].filter(r=>kindOf(r)===tab).sort((a,b)=>a.name.localeCompare(b.name)).forEach(r=>{""")
rep("""    if(sel){ eName.value=sel.name; eNotes.value=sel.notes||'';""",
    """    if(sel){ const k=kindOf(sel); if(tab!==k){ tab=k; layersSave(); } if(!layerOn[k]) setLayer(k,true); }
    syncKind();
    if(sel){ eName.value=sel.name; eNotes.value=sel.notes||'';""")
rep("""  function commitSel(){ if(!sel) return; renderList();""", """  function commitSel(){ if(!sel) return; syncKind(); renderList();""")
rep("""if(bRegions.getAttribute('aria-pressed')!=='true') bRegions.onclick(); drawing=true;""",
    """if(!layerOn[tab]) setLayer(tab,true); drawing=true; overlay.visible=true;""")
rep("""    const r={id, name:'Region '+(regions.size+1), color:PAL[regions.size%PAL.length], points:draft.slice(), notes:'', createdAt:new Date().toISOString()};""",
    """    const r={id, name:'Region '+(regions.size+1), color:PAL[regions.size%PAL.length], points:draft.slice(), notes:'', kind:tab, createdAt:new Date().toISOString()};""")
rep("""  function cancelDraw(){ drawing=false; draft=[]; cursorPt=null;""",
    """  function cancelDraw(){ drawing=false; overlay.visible=anyLayer()||measuring; draft=[]; cursorPt=null;""")
rep("""    overlay.visible=document.getElementById('bRegions').getAttribute('aria-pressed')==='true'; paintOverlay();""",
    """    overlay.visible=anyLayer(); paintOverlay();""")
rep("""set({name:r.name,color:r.color,points:r.points,notes:r.notes||'',createdAt:r.createdAt||new Date().toISOString()})""",
    """set({name:r.name,color:r.color,points:r.points,notes:r.notes||'',kind:kindOf(r),createdAt:r.createdAt||new Date().toISOString()})""")
rep("""notes:d.notes||'',createdAt:d.createdAt}); } });
      if(sel && !regions.has(sel.id))""", """notes:d.notes||'',kind:d.kind,createdAt:d.createdAt}); } });
      if(sel && !regions.has(sel.id))""")
rep(""", bRegions=document.getElementById('bRegions');""", """;""")
rep("""  bRegions.onclick=()=>{ const on=bRegions.getAttribute('aria-pressed')!=='true'; bRegions.setAttribute('aria-pressed',on); overlay.visible=on||measuring; handles.visible=on; paintOverlay(); };\n""", "")
# Copy JSON should carry the layer too
rep("""const j=JSON.stringify([...regions.values()],null,1);""", """const j=JSON.stringify([...regions.values()].map(r=>({...r,kind:kindOf(r)})),null,1);""")
open(dst, 'w').write(s)
print('patched', len(s))
