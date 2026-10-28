  // ---- settlements layer ------------------------------------------------------------
  // Palette validated against the dataviz checker (dark mode, categorical, 7 slots):
  // lightness band, chroma floor, CVD separation, normal-vision floor and contrast all pass.
  // Each type also has its own GLYPH, so identity never rests on colour alone.
  const SETT_TYPES=[
    {k:'city',            label:'City',            color:'#b8841c'},
    {k:'outpost',         label:'Outpost',         color:'#3a7bd0'},
    {k:'village',         label:'Village',         color:'#39a04a'},
    {k:'cavern',          label:'Cavern',          color:'#8659d6'},
    {k:'arcology',        label:'Arcology',        color:'#009a90'},
    {k:'ruin',            label:'Ruin',            color:'#d05b33'},
    {k:'ruined arcology', label:'Ruined arcology', color:'#c24699'}];
  const SETT_BY_K=Object.fromEntries(SETT_TYPES.map(t=>[t.k,t]));
  function settGlyph(k,size){
    const c=document.createElement('canvas'); c.width=c.height=size; const g=c.getContext('2d');
    const t=SETT_BY_K[k]||SETT_BY_K.city, S=size, m=S*0.5, R=S*0.30;
    g.lineJoin='round'; g.lineCap='round';
    const stroke=(w)=>{ g.lineWidth=S*w; g.strokeStyle='rgba(12,12,14,.92)'; g.stroke(); g.lineWidth=S*(w*0.55); g.strokeStyle='#f2efe8'; g.stroke(); };
    const poly=(pts,close)=>{ g.beginPath(); pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])); if(close)g.closePath(); };
    const hex=(r)=>{ const p=[]; for(let i=0;i<6;i++){ const a=Math.PI/6+i*Math.PI/3; p.push([m+r*Math.cos(a),m+r*Math.sin(a)]); } return p; };
    g.fillStyle=t.color;
    if(k==='city'){                                   // walled circle with towers
      g.beginPath(); g.arc(m,m,R,0,Math.PI*2); g.fill(); stroke(0.075);
      g.fillStyle='#f2efe8'; [[0,-1],[0.87,0.5],[-0.87,0.5]].forEach(d=>{
        g.beginPath(); g.arc(m+d[0]*R*0.52,m+d[1]*R*0.52,S*0.055,0,Math.PI*2); g.fill(); });
    } else if(k==='village'){                          // small house
      poly([[m,m-R*0.95],[m+R*0.8,m-R*0.1],[m+R*0.55,m-R*0.1],[m+R*0.55,m+R*0.75],
            [m-R*0.55,m+R*0.75],[m-R*0.55,m-R*0.1],[m-R*0.8,m-R*0.1]],true); g.fill(); stroke(0.07);
    } else if(k==='outpost'){                          // tower with a pennant
      poly([[m-R*0.42,m+R*0.85],[m-R*0.42,m-R*0.35],[m+R*0.18,m-R*0.35],[m+R*0.18,m+R*0.85]],true); g.fill(); stroke(0.07);
      poly([[m+R*0.18,m-R*0.35],[m+R*0.18,m-R*0.95],[m+R*0.95,m-R*0.66],[m+R*0.18,m-R*0.38]],true); g.fill(); stroke(0.055);
    } else if(k==='cavern'){                           // mouth in a hillside
      g.beginPath(); g.moveTo(m-R,m+R*0.8); g.lineTo(m-R,m+R*0.1);
      g.arc(m,m+R*0.1,R,Math.PI,0); g.lineTo(m+R,m+R*0.8); g.closePath(); g.fill(); stroke(0.07);
      g.fillStyle='rgba(12,12,14,.92)'; g.beginPath(); g.moveTo(m-R*0.44,m+R*0.8); g.lineTo(m-R*0.44,m+R*0.12);
      g.arc(m,m+R*0.12,R*0.44,Math.PI,0); g.lineTo(m+R*0.44,m+R*0.8); g.closePath(); g.fill();
    } else if(k==='arcology'){                         // solid hexagonal block
      poly(hex(R),true); g.fill(); stroke(0.075);
      g.strokeStyle='rgba(12,12,14,.55)'; g.lineWidth=S*0.035;
      g.beginPath(); g.moveTo(m-R*0.62,m); g.lineTo(m+R*0.62,m); g.stroke();
    } else if(k==='ruin'){                             // broken wall stubs
      [[-0.70,0.95,0.34],[-0.10,0.55,0.30],[0.42,0.80,0.26]].forEach(s=>{
        g.beginPath(); g.rect(m+s[0]*R,m+R*0.8-s[1]*R*1.5,s[2]*R*2,s[1]*R*1.5); g.fill(); stroke(0.055); });
    } else {                                           // ruined arcology: broken hexagon
      const p=hex(R); poly([p[0],p[1],p[2],p[3]],false); g.lineWidth=S*0.16; g.strokeStyle='rgba(12,12,14,.92)'; g.stroke();
      g.lineWidth=S*0.10; g.strokeStyle=t.color; g.stroke();
      poly([p[4],p[5]],false); g.lineWidth=S*0.16; g.strokeStyle='rgba(12,12,14,.92)'; g.stroke();
      g.lineWidth=S*0.10; g.strokeStyle=t.color; g.stroke();
      g.fillStyle=t.color; g.beginPath(); g.arc(m,m,S*0.055,0,Math.PI*2); g.fill();
    }
    return c;
  }
  const SETT_TEX={}; SETT_TYPES.forEach(t=>{ const tx=new THREE.CanvasTexture(settGlyph(t.k,128)); tx.anisotropy=4; SETT_TEX[t.k]=tx; });
  const settGroup=new THREE.Group(); settGroup.visible=false; scene.add(settGroup);
  const settLabelGroup=new THREE.Group(); settLabelGroup.visible=false; scene.add(settLabelGroup);
  function settLabelTex(name){
    const pad=12, fs=34, c=document.createElement('canvas'); let g=c.getContext('2d');
    g.font='600 '+fs+'px ui-sans-serif,system-ui,-apple-system,sans-serif';
    c.width=Math.ceil(g.measureText(name).width)+pad*2; c.height=fs+pad*2;
    g=c.getContext('2d');                                  // resizing resets the context state
    g.font='600 '+fs+'px ui-sans-serif,system-ui,-apple-system,sans-serif'; g.textBaseline='middle';
    const r=10; g.beginPath(); g.moveTo(r,0);
    g.arcTo(c.width,0,c.width,c.height,r); g.arcTo(c.width,c.height,0,c.height,r);
    g.arcTo(0,c.height,0,0,r); g.arcTo(0,0,c.width,0,r); g.closePath();
    g.fillStyle='rgba(12,12,14,.88)'; g.fill();
    g.strokeStyle='rgba(242,239,232,.38)'; g.lineWidth=2; g.stroke();
    g.fillStyle='#f2efe8'; g.fillText(name,pad,c.height/2+1);
    const tx=new THREE.CanvasTexture(c); tx.anisotropy=4;
    return {tex:tx, aspect:c.width/c.height};
  }

  let settlements=new Map(), settSel=null, placing=false;
  const bSett=document.getElementById('bSett'), settPanel=document.getElementById('settPanel'),
        settList=document.getElementById('settList'), bSettAdd=document.getElementById('bSettAdd'),
        bSettImport=document.getElementById('bSettImport'), settStatus=document.getElementById('settStatus');
  function drawSettlements(){
    while(settGroup.children.length) settGroup.remove(settGroup.children[0]);
    while(settLabelGroup.children.length) settLabelGroup.remove(settLabelGroup.children[0]);
    settlements.forEach(s=>{
      const tx=SETT_TEX[s.type]||SETT_TEX.city;
      const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,sizeAttenuation:false,transparent:true,
        depthTest:true,opacity:settSel&&settSel.id===s.id?1:0.94}));
      const p=mapToWorld([s.px,s.py]); sp.position.set(p.x,p.y+0.6*vex,p.z);
      const k=settSel&&settSel.id===s.id?0.060:0.044; sp.scale.set(k,k,1);
      sp.userData.id=s.id; settGroup.add(sp);
      const lt=settLabelTex(s.name), LH=0.030;
      const lb=new THREE.Sprite(new THREE.SpriteMaterial({map:lt.tex,sizeAttenuation:false,transparent:true,depthTest:false}));
      lb.material.opacity=0.82; lb.scale.set(LH*lt.aspect,LH,1); lb.position.copy(sp.position);
      lb.center.set(-0.030/(LH*lt.aspect), 0.5);   // sits just right of the glyph, vertically centred
      lb.userData.id=s.id; lb.visible=true; lb.renderOrder=10;   // named on the map by default, as regions are
      settLabelGroup.add(lb);
    });
  }
  function settLocalSave(){ try{ localStorage.setItem('krator.settlements',JSON.stringify([...settlements.values()])); }catch(e){} }
  async function settSave(s){
    settLocalSave(); drawSettlements(); renderSett();
    if(db&&dbWritable){ try{ await db.collection('settlements').doc(s.id).set({
      name:s.name,type:s.type,px:s.px,py:s.py,notes:s.notes||'',createdAt:s.createdAt||new Date().toISOString()}); }
      catch(e){ settStatus.textContent='save failed: '+(e.code||e); } }
  }
  async function settDelete(id){
    settlements.delete(id); if(settSel&&settSel.id===id) settSel=null;
    settLocalSave(); drawSettlements(); renderSett();
    if(db&&dbWritable){ try{ await db.collection('settlements').doc(id).delete(); }catch(e){} }
  }
  function renderSett(){
    settList.innerHTML='';
    [...settlements.values()].sort((a,b)=>a.name.localeCompare(b.name)).forEach(s=>{
      const li=document.createElement('li'); li.setAttribute('aria-selected',settSel&&settSel.id===s.id);
      const ic=document.createElement('i'); ic.className='sic';
      ic.style.backgroundImage='url('+settGlyph(s.type,36).toDataURL()+')';
      const nm=document.createElement('input'); nm.className='snm'; nm.value=s.name; nm.maxLength=60;
      nm.onchange=()=>{ s.name=nm.value.trim()||'Unnamed'; settSave(s); };
      nm.onfocus=()=>{ settSel=s; drawSettlements(); };
      const sel=document.createElement('select'); sel.className='sty';
      SETT_TYPES.forEach(t=>{ const o=document.createElement('option'); o.value=t.k; o.textContent=t.label; sel.appendChild(o); });
      sel.value=s.type; sel.onchange=()=>{ s.type=sel.value; settSave(s); };
      const del=document.createElement('button'); del.className='sdel'; del.textContent='×'; del.title='Delete';
      del.onclick=()=>settDelete(s.id);
      li.append(ic,nm,sel,del); settList.appendChild(li);
    });
    settStatus.textContent=settlements.size+' settlement'+(settlements.size===1?'':'s')+(db?' · shared store':' · this browser only');
  }
  function settAddAt(px,py,name,type){
    const id='s'+Math.random().toString(36).slice(2,11);
    const s={id,name:name||'New settlement',type:type||'city',px,py,notes:'',createdAt:new Date().toISOString()};
    settlements.set(id,s); settSel=s; settSave(s); return s;
  }
  function importCityRegions(){
    let n=0;
    regions.forEach(r=>{
      if(!/\(\s*city\s*\)/i.test(r.name||'')) return;
      const nm=r.name.replace(/\s*\(\s*city\s*\)\s*/i,'').trim()||r.name;
      if([...settlements.values()].some(s=>s.name.toLowerCase()===nm.toLowerCase())) return;
      const pts=r.points||[]; if(!pts.length) return;
      const cx=Math.round(pts.reduce((a,p)=>a+p[0],0)/pts.length), cy=Math.round(pts.reduce((a,p)=>a+p[1],0)/pts.length);
      settAddAt(cx,cy,nm,'city'); n++;
    });
    settStatus.textContent=n?('imported '+n+' from regions marked (city) — set each one’s type below'):'no new (city) regions to import';
    renderSett(); drawSettlements();
    try{ localStorage.setItem('krator.settSeeded','1'); }catch(e){}
  }
    // name pops up on the map when the pointer is near an icon, and stays on the selected one.
  // Screen-space proximity rather than sprite raycasting: sprites drawn with
  // sizeAttenuation:false do not give a reliable pick radius.
  const _sv=new THREE.Vector3();
  function hoverSett(e){
    if(!settGroup.visible) return;
    const r=el.getBoundingClientRect(), mx=e.clientX-r.left, my=e.clientY-r.top;
    let best=null, bd=26;
    settGroup.children.forEach(sp=>{
      _sv.copy(sp.position).project(camera);
      if(_sv.z>1) return;
      const sx=(_sv.x*0.5+0.5)*r.width, sy=(-_sv.y*0.5+0.5)*r.height;
      const d=Math.hypot(sx-mx,sy-my);
      if(d<bd){ bd=d; best=sp.userData.id; }
    });
    settLabelGroup.children.forEach(l=>{
      const on = (l.userData.id===best) || !!(settSel && l.userData.id===settSel.id);
      l.material.opacity = on ? 1.0 : 0.82;      // always shown; hover just brings one forward
      l.renderOrder = on ? 12 : 10;
    });
  }
  window.__settReady=true;
  renderSett(); drawSettlements();
  bSettImport.onclick=importCityRegions;
  document.getElementById('bSettCopy').onclick=async()=>{ const j=JSON.stringify([...settlements.values()].sort((a,b)=>a.name.localeCompare(b.name)),null,1); try{ await navigator.clipboard.writeText(j); settStatus.textContent='copied '+settlements.size+' settlements as JSON'; }catch(e){ settStatus.textContent='clipboard blocked — settlements are in the shared store'; } };
  bSett.onclick=()=>{ settGroup.visible=!settGroup.visible; settLabelGroup.visible=settGroup.visible; bSett.setAttribute('aria-pressed',settGroup.visible);
    settPanel.hidden=!settGroup.visible; };
  bSettAdd.onclick=()=>{ placing=!placing; bSettAdd.setAttribute('aria-pressed',placing);
    bSettAdd.textContent=placing?'Click the map…':'Add settlement';
    if(placing && !settGroup.visible) bSett.onclick(); };
  try{ const raw=localStorage.getItem('krator.settlements');
    if(raw) JSON.parse(raw).forEach(s=>settlements.set(s.id,s)); }catch(e){}
  renderSett(); drawSettlements();

  (function(){ const k=document.getElementById('settKey');
    SETT_TYPES.forEach(t=>{ const sp=document.createElement('span'); const i=document.createElement('i');
      i.style.backgroundImage='url('+settGlyph(t.k,30).toDataURL()+')'; sp.append(i,document.createTextNode(t.label)); k.appendChild(sp); }); })();
  (async()=>{
    for(let i=0;i<60 && !db;i++) await new Promise(r=>setTimeout(r,250));
    if(db){
      db.collection('settlements').onSnapshot(snap=>{
        snap.docChanges().forEach(ch=>{ if(ch.type==='removed') settlements.delete(ch.doc.id);
          else { const d=ch.doc.data(); settlements.set(ch.doc.id,{id:ch.doc.id,name:d.name||'Settlement',
            type:d.type||'city',px:d.px|0,py:d.py|0,notes:d.notes||'',createdAt:d.createdAt}); } });
        settLocalSave(); renderSett(); drawSettlements();
      }, err=>{ settStatus.textContent='shared store: '+err.code; });
    }
    // seed once from regions marked (city); the user can retype or delete them afterwards
    let seeded=false; try{ seeded=localStorage.getItem('krator.settSeeded')==='1'; }catch(e){}
    if(!seeded){ for(let i=0;i<40 && regions.size===0;i++) await new Promise(r=>setTimeout(r,250));
      if(regions.size && settlements.size===0) importCityRegions(); }
  })();

