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
  document.getElementById('bSettCopy').onclick=()=>copyJSONWithFallback(JSON.stringify([...settlements.values()].sort((a,b)=>a.name.localeCompare(b.name)),null,1), 'settlements.json', m=>{ settStatus.textContent=m; }, settlements.size+' settlements');
  bSett.onclick=()=>{ settGroup.visible=!settGroup.visible; settLabelGroup.visible=settGroup.visible; bSett.setAttribute('aria-pressed',settGroup.visible);
    settPanel.hidden=!settGroup.visible; };
  bSettAdd.onclick=()=>{ placing=!placing; bSettAdd.setAttribute('aria-pressed',placing);
    bSettAdd.textContent=placing?'Click the map…':'Add settlement';
    if(placing && !settGroup.visible) bSett.onclick(); };
  try{
    if(localStorage.getItem('krator.canvas50')!=='1'){
      localStorage.removeItem('krator.settlements');
      localStorage.setItem('krator.canvas50','1');
    }
    const raw=localStorage.getItem('krator.settlements');
    if(raw) JSON.parse(raw).forEach(s=>settlements.set(s.id,s));
  }catch(e){}
  if(settlements.size===0){
    const defSetts = [{"id": "sc3u7qalqi", "name": "Agropolis", "type": "ruin", "px": 717, "py": 917, "notes": "", "createdAt": "2026-09-24T08:29:42.074Z"}, {"id": "sjau3958qz", "name": "Almua", "type": "city", "px": 718, "py": 883, "notes": "", "createdAt": "2026-10-02T03:03:33.405Z"}, {"id": "skz25tuq0w", "name": "Arcbeam", "type": "arcology", "px": 1016, "py": 1058, "notes": "", "createdAt": "2026-09-24T07:08:13.644Z"}, {"id": "sn6y4sx8tr", "name": "Ardent", "type": "city", "px": 851, "py": 572, "notes": "", "createdAt": "2026-09-24T08:40:01.386Z"}, {"id": "s7g2cj1u2b", "name": "Babel", "type": "ruined arcology", "px": 456, "py": 908, "notes": "", "createdAt": "2026-09-24T08:11:52.016Z"}, {"id": "sjqk469u0k", "name": "Bastion", "type": "outpost", "px": 536, "py": 627, "notes": "", "createdAt": "2026-10-20T05:19:11.356Z"}, {"id": "s4t3y092qc", "name": "Bipo", "type": "village", "px": 1000, "py": 816, "notes": "", "createdAt": "2026-10-24T01:21:21.120Z"}, {"id": "s4tcb5iuwc", "name": "Blade", "type": "ruined arcology", "px": 451, "py": 1022, "notes": "", "createdAt": "2026-09-24T06:35:43.644Z"}, {"id": "srg92iy8js", "name": "Boatmurder", "type": "outpost", "px": 766, "py": 404, "notes": "", "createdAt": "2026-10-15T11:37:47.206Z"}, {"id": "svfznb8426", "name": "Carcosa", "type": "ruin", "px": 395, "py": 812, "notes": "", "createdAt": "2026-09-24T08:34:34.209Z"}, {"id": "sgjwyb4xj5", "name": "Cascade", "type": "arcology", "px": 568, "py": 841, "notes": "", "createdAt": "2026-09-24T08:18:21.409Z"}, {"id": "s4fnuph33n", "name": "Chimes", "type": "ruined arcology", "px": 468, "py": 1392, "notes": "", "createdAt": "2026-09-24T07:19:11.992Z"}, {"id": "sdgzodxb0k", "name": "Corpus", "type": "ruin", "px": 520, "py": 693, "notes": "", "createdAt": "2026-09-24T09:06:43.149Z"}, {"id": "soksvzt1h9", "name": "Coyote Canyon", "type": "village", "px": 1265, "py": 500, "notes": "", "createdAt": "2026-10-27T00:31:54.621Z"}, {"id": "sd1o6zmnnn", "name": "Crescent", "type": "ruined arcology", "px": 994, "py": 694, "notes": "", "createdAt": "2026-10-24T01:15:34.232Z"}, {"id": "s5lwt460n0", "name": "Cthonos", "type": "ruined arcology", "px": 526, "py": 1503, "notes": "", "createdAt": "2026-09-24T07:48:46.424Z"}, {"id": "slonhq0jgv", "name": "Cube", "type": "ruined arcology", "px": 720, "py": 1567, "notes": "", "createdAt": "2026-09-24T07:21:37.390Z"}, {"id": "seed05", "name": "Dalab", "type": "city", "px": 464, "py": 1112, "notes": "", "createdAt": "2026-09-24T00:00:00.000Z"}, {"id": "semn6wzmqx", "name": "Daranch", "type": "village", "px": 527, "py": 1149, "notes": "", "createdAt": "2026-09-24T19:09:48.611Z"}, {"id": "sx1xr1r6pd", "name": "Dhelv", "type": "cavern", "px": 840, "py": 776, "notes": "", "createdAt": "2026-10-18T02:20:07.788Z"}, {"id": "solqo7hz7s", "name": "Dilihan", "type": "city", "px": 744, "py": 663, "notes": "", "createdAt": "2026-09-24T07:01:13.588Z"}, {"id": "sbxpx1u95q", "name": "Dorado", "type": "ruin", "px": 483, "py": 964, "notes": "", "createdAt": "2026-09-24T08:12:21.102Z"}, {"id": "sirb5um6cr", "name": "Drum", "type": "arcology", "px": 673, "py": 932, "notes": "", "createdAt": "2026-09-24T06:35:43.553Z"}, {"id": "s57bkv9741", "name": "Erehwon", "type": "city", "px": 805, "py": 1516, "notes": "Pearl of Xanadu, 20,000 on its mountain lake (LORE.md 6.13; settlements/xanadu, target erewhon). Moved 2026-11-11 with edit 5.1-512, which remade its lake as an Atitlan-like caldera (121 x 66 km at -520 m, three volcanoes set back from the south shore, four islands; the Pleasure Dome of the Bay on its own small isle, landforms.json). The old pin 800,1503 is under the new lake. 805,1516 is a south-shore bench (-497 m): the town climbs to -415 m, a 90 m grey cliff to the palace plateau at -305 m, the mountainside behind, between the west and middle volcanoes 14 and 20 px back.", "createdAt": "2026-09-28T02:12:45.696Z"}, {"id": "sakq13nyhr", "name": "Farport", "type": "city", "px": 294, "py": 588, "notes": "", "createdAt": "2026-09-24T08:21:26.761Z"}, {"id": "su9oc1m9io", "name": "Flooded Tower", "type": "ruined arcology", "px": 1028, "py": 840, "notes": "", "createdAt": "2026-10-24T01:34:35.390Z"}, {"id": "sx0yra3bdm", "name": "Footfall", "type": "ruin", "px": 560, "py": 767, "notes": "", "createdAt": "2026-09-24T08:15:05.677Z"}, {"id": "s226vxz5x8", "name": "Fort Ebon", "type": "ruin", "px": 695, "py": 782, "notes": "", "createdAt": "2026-10-26T20:42:58.184Z"}, {"id": "sj2usd3tg4", "name": "Fort Kalor", "type": "ruin", "px": 863, "py": 693, "notes": "", "createdAt": "2026-10-24T01:41:35.928Z"}, {"id": "s1kaqxmg10", "name": "Fort Kreia", "type": "ruin", "px": 1049, "py": 736, "notes": "", "createdAt": "2026-10-24T01:09:24.562Z"}, {"id": "s5c6ysqazg", "name": "Fort Ordo", "type": "ruin", "px": 1060, "py": 831, "notes": "", "createdAt": "2026-10-24T01:10:40.273Z"}, {"id": "se4hiep1n7", "name": "Fort Vaklu", "type": "outpost", "px": 984, "py": 912, "notes": "", "createdAt": "2026-09-24T08:57:53.602Z"}, {"id": "sp58alfxmc", "name": "Fridon", "type": "city", "px": 1027, "py": 931, "notes": "", "createdAt": "2026-10-02T03:03:33.761Z"}, {"id": "swbjnpbdar", "name": "Fulcrum", "type": "arcology", "px": 409, "py": 621, "notes": "", "createdAt": "2026-10-20T05:14:38.242Z"}, {"id": "s2iq6zqe2x", "name": "Furrow", "type": "outpost", "px": 1276, "py": 639, "notes": "", "createdAt": "2026-09-24T07:57:31.199Z"}, {"id": "sze26pgivd", "name": "Gila", "type": "village", "px": 653, "py": 1485, "notes": "", "createdAt": "2026-09-24T07:32:48.269Z"}, {"id": "seed07", "name": "Girder", "type": "village", "px": 1039, "py": 869, "notes": "", "createdAt": "2026-09-24T00:00:00.000Z"}, {"id": "skamx0ylbr", "name": "Glaive", "type": "village", "px": 599, "py": 734, "notes": "", "createdAt": "2026-09-24T08:19:15.186Z"}, {"id": "sf6a9gdawx", "name": "Henge", "type": "ruined arcology", "px": 457, "py": 735, "notes": "", "createdAt": "2026-09-24T08:32:34.664Z"}, {"id": "spmfhg8a3e", "name": "Hexahedron", "type": "arcology", "px": 827, "py": 668, "notes": "", "createdAt": "2026-09-24T06:35:43.414Z"}, {"id": "sm3ft5vrof", "name": "Hook", "type": "city", "px": 809, "py": 923, "notes": "moved to the 1:1 shoreline 2026-10-19 (was py 596: 592 m up, 6.7 km inland of the shore the open world's rule gives)", "createdAt": "2026-10-02T03:03:32.910Z"}, {"id": "sodpa02bfv", "name": "Hub 01", "type": "ruined arcology", "px": 1344, "py": 1409, "notes": "", "createdAt": "2026-09-24T07:14:18.212Z"}, {"id": "sxxrgmrk8c", "name": "Iziz", "type": "city", "px": 963, "py": 985, "notes": "", "createdAt": "2026-10-02T03:03:32.953Z"}, {"id": "st5e01l76v", "name": "Jimjam", "type": "city", "px": 746, "py": 550, "notes": "", "createdAt": "2026-10-15T11:20:38.418Z"}, {"id": "sq9t00vg7w", "name": "Kautoa", "type": "city", "px": 964, "py": 725, "notes": "", "createdAt": "2026-10-15T02:53:17.028Z"}, {"id": "sigv04s59y", "name": "Kierson", "type": "village", "px": 884, "py": 737, "notes": "", "createdAt": "2026-09-24T08:07:45.307Z"}, {"id": "spnqhezhiw", "name": "Komodo", "type": "village", "px": 865, "py": 1617, "notes": "", "createdAt": "2026-09-24T07:29:33.755Z"}, {"id": "sxyznayzgc", "name": "Ledge", "type": "arcology", "px": 437, "py": 1330, "notes": "Moved 2026-10-23 with scale model 4.22 from 160,1007 (a water cell of the old 4.21 lake) to the north cliff over the great lake (1,638 m, ~1,340 m over the water at 298 m), where Dalab's road comes down; the arcology runs down the cliff to the shore (biomes/riftrim/PLAN.md section 12).", "createdAt": "2026-09-24T07:18:10.163Z"}, {"id": "sevq8lqqjy", "name": "Leng", "type": "ruined arcology", "px": 490, "py": 554, "notes": "", "createdAt": "2026-09-24T08:37:21.763Z"}, {"id": "s8fkrfok8y", "name": "Lipp", "type": "village", "px": 691, "py": 619, "notes": "", "createdAt": "2026-09-24T08:45:06.204Z"}, {"id": "sx4srhrf5g", "name": "Locus", "type": "village", "px": 1267, "py": 1043, "notes": "", "createdAt": "2026-09-24T07:03:02.057Z"}, {"id": "spbzmhdqqd", "name": "Loj Twenny", "type": "cavern", "px": 457, "py": 1269, "notes": "", "createdAt": "2026-10-24T01:52:26.344Z"}, {"id": "sq80bzd7ep", "name": "Longsong", "type": "village", "px": 1226, "py": 1626, "notes": "", "createdAt": "2026-09-24T06:35:43.735Z"}, {"id": "s1ugpi6uas", "name": "Lux", "type": "city", "px": 495, "py": 645, "notes": "", "createdAt": "2026-09-24T08:31:13.437Z"}, {"id": "slw9dufqfs", "name": "Mantis", "type": "village", "px": 1113, "py": 1164, "notes": "An oasis town on the Bowl's salt lake (moved 2026-10-23: from 831,816, under the 4.21 lake, to the heart of the wettest pocket on its south-west shore: Am, ~1,550 mm, -976 m, 2 km from the water; the pocket is ~330 km2 of monsoon forest and savanna in the hot desert). An Iziz holding: grew under Yuni's influence, later taken over by Izani merchant houses. Named after the Bowl mantis, a large predator of the region. See biomes/sedesert/PLAN-BOWL.md.", "createdAt": "2026-09-24T07:11:20.037Z"}, {"id": "skukf2qmmq", "name": "Mav's Refuge", "type": "city", "px": 1024, "py": 807, "notes": "", "createdAt": "2026-10-02T03:03:33.612Z"}, {"id": "spwjwosq9c", "name": "Mirabilis", "type": "village", "px": 350, "py": 726, "notes": "", "createdAt": "2026-10-20T05:17:23.920Z"}, {"id": "s4xb8r0vmy", "name": "Mungo", "type": "village", "px": 1321, "py": 825, "notes": "", "createdAt": "2026-09-24T07:53:25.110Z"}, {"id": "s3i61t95z5", "name": "Nazar", "type": "ruin", "px": 582, "py": 1079, "notes": "", "createdAt": "2026-09-24T08:09:56.040Z"}, {"id": "si1wh7atlt", "name": "Necropolis", "type": "ruin", "px": 406, "py": 944, "notes": "", "createdAt": "2026-09-24T08:14:05.155Z"}, {"id": "s6roqnupzz", "name": "Nereus", "type": "village", "px": 762, "py": 805, "notes": "", "createdAt": "2026-09-30T06:30:50.862Z"}, {"id": "s8mjs5h5cx", "name": "Noa's Regret", "type": "ruined arcology", "px": 896, "py": 866, "notes": "", "createdAt": "2026-09-24T07:06:00.632Z"}, {"id": "ssk1wsnjjd", "name": "Nulab", "type": "city", "px": 443, "py": 1359, "notes": "", "createdAt": "2026-10-24T01:50:09.425Z"}, {"id": "s2199308wr", "name": "Nusidi", "type": "ruin", "px": 996, "py": 870, "notes": "", "createdAt": "2026-09-24T08:10:16.710Z"}, {"id": "staiytii0y", "name": "Pinnacle Rock", "type": "city", "px": 1007, "py": 686, "notes": "Beast Rider roost town on a red sandstone mesa (settlements/pinnacle-rock/PLAN.md). Moved 2026-10-18 from px 737,354 (approximate) to the knoll that clears the forest: 500-600 m over the jungle floor, the K'etsaal Baatar 11 km off. Moved 2026-11-10 (the owner: 'a spot not too far that's got a bit more forest') from 1027,681, which map 5.1 left in the NE rim's savanna, 41 km west to the savage hyperjungle's north-east edge: a knoll 110 m over its 14 km round (209 m prominence), -1,287 m, Aw, 1,490 mm, 77% of the ground within 9 km jungle; the Tsékooh Baatar 17 km off (openworld/PLAN-SITES.md, openworld/pinnacle).", "createdAt": "2026-09-24T08:06:51.663Z"}, {"id": "ssdy2b2rxc", "name": "Pluton", "type": "ruined arcology", "px": 743, "py": 1328, "notes": "", "createdAt": "2026-09-24T09:47:31.438Z"}, {"id": "s0w2mwd7xq", "name": "Pontus", "type": "village", "px": 702, "py": 839, "notes": "", "createdAt": "2026-09-30T06:28:53.671Z"}, {"id": "skwl1d2hdu", "name": "Port  Tobin", "type": "village", "px": 932, "py": 973, "notes": "", "createdAt": "2026-09-24T08:02:12.676Z"}, {"id": "ski7uk8fjc", "name": "Port Goto", "type": "village", "px": 918, "py": 698, "notes": "", "createdAt": "2026-10-24T01:17:32.519Z"}, {"id": "szn5aae96p", "name": "Port Visas", "type": "village", "px": 800, "py": 712, "notes": "", "createdAt": "2026-10-24T01:37:45.334Z"}, {"id": "sxoqgjn7y0", "name": "Pylon", "type": "arcology", "px": 869, "py": 1002, "notes": "", "createdAt": "2026-09-24T08:58:29.006Z"}, {"id": "skm4jjo2vl", "name": "Qiblai", "type": "city", "px": 922, "py": 1595, "notes": "Holy city of the Decree, ~12,000, under a council of abbots (kits/qiblai/PLAN.md; LORE.md 6.13). Moved 2026-11-11 (the owner: by a river, near plentiful resources) from 963,1566, 65 km from any river and without salt, 101 km to the cataracts of Nahr ash-Shalalat (~1,100 m3/s, the region's biggest river): flat ground for the 1.6 km mandala (37 m relief), rock salt, potash, rare earths, saltpeter, copper and oil within 30 km, farmland 40% (openworld/PLAN-SITES.md).", "createdAt": "2026-09-24T07:35:46.046Z"}, {"id": "sndrdffkyg", "name": "Reed", "type": "village", "px": 1277, "py": 676, "notes": "", "createdAt": "2026-09-24T07:52:18.533Z"}, {"id": "s28hf1s9ab", "name": "Roketstad", "type": "city", "px": 609, "py": 684, "notes": "", "createdAt": "2026-09-24T07:42:09.473Z"}, {"id": "slrodrkrls", "name": "Sauropolis", "type": "city", "px": 765, "py": 1596, "notes": "", "createdAt": "2026-09-24T07:28:07.129Z"}, {"id": "seu6y74bg8", "name": "Serai", "type": "village", "px": 826, "py": 478, "notes": "", "createdAt": "2026-10-15T11:21:11.327Z"}, {"id": "slfozs6c7z", "name": "Shade", "type": "outpost", "px": 1229, "py": 885, "notes": "", "createdAt": "2026-09-24T07:55:03.078Z"}, {"id": "sw96wqyc7j", "name": "Shelf", "type": "arcology", "px": 461, "py": 1161, "notes": "", "createdAt": "2026-10-24T01:50:44.976Z"}, {"id": "s8kenhm9vi", "name": "Shell", "type": "arcology", "px": 902, "py": 659, "notes": "", "createdAt": "2026-10-24T01:29:05.754Z"}, {"id": "sshimrest01", "name": "Shim", "type": "city", "px": 654, "py": 1118, "notes": "restored 2026-10-18 at the seed14 position; the old Chichani capital on a lake of the Shim river (settlements/shim/PLAN.md)", "createdAt": "2026-10-18T02:10:00.000Z"}, {"id": "sxzzkiwjs1", "name": "Sleeping City", "type": "ruin", "px": 1044, "py": 776, "notes": "", "createdAt": "2026-10-24T01:34:01.584Z"}, {"id": "seed01", "name": "Span", "type": "ruined arcology", "px": 554, "py": 1010, "notes": "", "createdAt": "2026-09-24T00:00:00.000Z"}, {"id": "sbdor4sbi1", "name": "Spirladunon", "type": "city", "px": 800, "py": 1017, "notes": "The Talovolci's ceremonial settlement (the Cloud Giants). Moved 2026-10-23 from 608,798 (dry steppe in godstep valley, ~80 mm) into the cloud forest of the southern highlands: ~1.5 km, ~4,000 mm, Af, mean +18 C. LORE.md 6.21.", "createdAt": "2026-10-02T03:03:33.814Z"}, {"id": "s2o8f4p123", "name": "Stair", "type": "ruined arcology", "px": 1106, "py": 1442, "notes": "The Hill arcology (kits/ancients/targets/hill), on the east flank of the springs' hollow through the Catch's interior hills, at the biggest of its five oases. A glorified campground of a couple of hundred people (merchants, caravans, arcology divers); the Ancients' tunnel from here is sealed halfway (biomes/catch/PLAN.md). Moved 2026-10-23 from 827,1113.", "createdAt": "2026-09-24T06:35:43.702Z"}, {"id": "sfgtxw10kr", "name": "Strongbow", "type": "arcology", "px": 1026, "py": 1594, "notes": "", "createdAt": "2026-09-24T07:16:16.398Z"}, {"id": "sxan7r1sln", "name": "Strongwall", "type": "outpost", "px": 914, "py": 1634, "notes": "", "createdAt": "2026-09-24T07:30:51.335Z"}, {"id": "so73a6ml2o", "name": "Stump", "type": "ruined arcology", "px": 1044, "py": 952, "notes": "", "createdAt": "2026-10-24T01:43:25.165Z"}, {"id": "sor1zqih8x", "name": "Talia", "type": "city", "px": 1073, "py": 939, "notes": "", "createdAt": "2026-09-24T08:54:30.089Z"}, {"id": "smqy5z5eek", "name": "Tallhouse", "type": "outpost", "px": 683, "py": 1184, "notes": "", "createdAt": "2026-09-24T08:09:37.426Z"}, {"id": "sghb3jlsk5", "name": "Talon", "type": "village", "px": 1026, "py": 760, "notes": "", "createdAt": "2026-10-24T01:26:06.332Z"}, {"id": "s7u81vhk60", "name": "Temora", "type": "village", "px": 762, "py": 883, "notes": "", "createdAt": "2026-09-24T06:58:10.771Z"}, {"id": "sbrpoyrmbq", "name": "Tethis", "type": "arcology", "px": 733, "py": 775, "notes": "", "createdAt": "2026-09-30T06:23:19.800Z"}, {"id": "sthegate", "name": "The Gate", "type": "outpost", "px": 1438, "py": 326, "notes": "The one way into the Outlands: the Outland Gate's Narrows (1,423 m, 1.34 atm), held by the Tierhounds' long wall from wall foot to wall foot (1431,326 to 1446,326) and their toll fort and water gate on the river, with the trickster's shrine; the god's road (Sleeping City to Trickster's House) runs through it. Moved from the old 7.7 km pass (1408,414), which keeps a cairn and a shrine. biomes/outlandgate/PLAN.md section 5, biomes/outlands/PLAN.md; the owner, 2026-10-26 and 2026-11-09.", "createdAt": "2026-10-26T14:00:00.000Z"}, {"id": "sa8xk6pimb", "name": "The Tubes", "type": "cavern", "px": 608, "py": 1547, "notes": "", "createdAt": "2026-09-24T07:47:24.837Z"}, {"id": "s4zvgepuru", "name": "Theodiga", "type": "arcology", "px": 908, "py": 1535, "notes": "", "createdAt": "2026-09-24T07:15:32.194Z"}, {"id": "sd3ye9k8eu", "name": "Tilted Tower", "type": "ruined arcology", "px": 614, "py": 490, "notes": "", "createdAt": "2026-10-24T02:07:24.713Z"}, {"id": "sy42jwlyk4", "name": "Torus", "type": "arcology", "px": 774, "py": 1007, "notes": "", "createdAt": "2026-09-24T06:35:43.420Z"}, {"id": "strickstershouse", "name": "Trickster's House", "type": "ruined arcology", "px": 1512, "py": 660, "notes": "Arcoindian II (kits/ancients/targets/arcoindian2), ruined, built into the west wall of the N Outlands' main basin over the 2,132 m lake. The Coyote Men shun it as cursed: they say the trickster lives there, and the god's road ends here. biomes/outlands/PLAN.md, SURVEY.md; the owner, 2026-10-26.", "createdAt": "2026-10-26T12:00:00.000Z"}, {"id": "smc9wif24a", "name": "Trigon", "type": "arcology", "px": 722, "py": 740, "notes": "", "createdAt": "2026-09-30T06:30:11.944Z"}, {"id": "szv27b2reu", "name": "Tuatara", "type": "village", "px": 818, "py": 1554, "notes": "", "createdAt": "2026-09-24T07:37:47.486Z"}, {"id": "soctr12hfz", "name": "Tzunfort", "type": "outpost", "px": 670, "py": 886, "notes": "", "createdAt": "2026-10-26T20:43:45.928Z"}, {"id": "sg3doyt783", "name": "Valapo", "type": "village", "px": 942, "py": 782, "notes": "", "createdAt": "2026-10-15T02:54:46.834Z"}, {"id": "s10ioj4r5u", "name": "Veil", "type": "outpost", "px": 448, "py": 838, "notes": "", "createdAt": "2026-09-24T08:34:11.747Z"}, {"id": "sfw06d268c", "name": "Veladiga", "type": "ruined arcology", "px": 685, "py": 479, "notes": "", "createdAt": "2026-10-21T07:05:08.107Z"}, {"id": "sduqx62i09", "name": "Verge", "type": "city", "px": 1263, "py": 946, "notes": "", "createdAt": "2026-10-02T03:03:31.918Z"}, {"id": "s3n66733vo", "name": "Voth", "type": "city", "px": 742, "py": 1018, "notes": "", "createdAt": "2026-10-18T02:17:28.917Z"}, {"id": "syz1ps04fa", "name": "Wildcat", "type": "village", "px": 427, "py": 1453, "notes": "", "createdAt": "2026-10-24T01:44:53.731Z"}, {"id": "sjgv4qfmg4", "name": "Wing", "type": "ruined arcology", "px": 699, "py": 1042, "notes": "", "createdAt": "2026-09-24T06:49:16.343Z"}, {"id": "svd298453u", "name": "Yith", "type": "village", "px": 346, "py": 418, "notes": "", "createdAt": "2026-09-24T08:36:12.297Z"}, {"id": "siauw28o8v", "name": "Ys", "type": "city", "px": 789, "py": 738, "notes": "", "createdAt": "2026-09-30T06:22:57.639Z"}, {"id": "ss0il0ejb7", "name": "Yuni", "type": "city", "px": 1263, "py": 1089, "notes": "", "createdAt": "2026-09-24T07:02:44.541Z"}, {"id": "s5x27pj6hn", "name": "Zey'danin", "type": "city", "px": 795, "py": 860, "notes": "Gateway to the Throne, a layered city (Zeijani, Western Islander, Izani, Hykkousoi, Voth since ~30 years ago): settlements/zeydanin/PLAN.md. Typed city 2026-10-18 (was village).", "createdAt": "2026-09-30T06:31:20.101Z"}, {"id": "sostrukhyuni01", "name": "Ostrukh-on-Water", "type": "village", "px": 1516, "py": 1471, "notes": "Yuni agricultural outpost on fresh Lake Ostrukh: terrace farming, qanats, and staging for Siphon Pit expeditions.", "createdAt": "2026-10-28T12:55:00.000Z"}, {"id": "sloomspindle01", "name": "Spindle Fan", "type": "village", "px": 1561, "py": 1140, "notes": "Yuni farming and spring outpost on the Weavers' Cradle piedmont fan: terraced crops supporting expeditions into the Loom-Chasms.", "createdAt": "2026-10-28T12:55:00.000Z"}, {"id": "stallwalls01", "name": "Tallwalls", "type": "city", "px": 650, "py": 1268, "notes": "The greatest haven and fortress of the Free Giants (the Vrivolci, LORE.md 6.17, 6.21) and a sanctuary for escaped slaves of every people fleeing the Vothic Kingdom and the Realm of Dalab. Built of cyclopean columnar basalt and tier-cedar murus gallicus on the middle flood-basalt lava terrace of Greenstep (+1,980 m, Cfa/Cfb) above the confluence of the Clodosriba lava-tube rilles. Called Talodunon in their borrowed Talovolci Gaulish and Da-Talwal in Vrivolci creole. biomes/greenstep/PLAN.md.", "createdAt": "2026-11-06T20:00:00.000Z"}, {"id": "szjsurpu01", "name": "Šurpu-Dhelv", "type": "cavern", "px": 806, "py": 818, "notes": "Zeijani cave and tuff village on the WNW flank of the Throne: fairy-chimney tuff spires and 4-level underground galleries above a braided lava tube, with covert scout tunnels toward the Zey'danin frontier (kits/zeijani/README.md, biomes/throne/NOTES.md).", "createdAt": "2026-10-31T19:30:00.000Z"}, {"id": "szjqarnu02", "name": "Qarnu-Tūbu", "type": "cavern", "px": 834, "py": 882, "notes": "Zeijani cave and tuff village on the SSW savanna-tuff shoulder of the Throne: Moray-style terraced collapse skylights and a stepwell cistern in an ancient pahoehoe master tube, trading with the surface Ash Nomads (kits/zeijani/README.md, biomes/throne/NOTES.md).", "createdAt": "2026-10-31T19:30:00.000Z"}, {"id": "szjnuru03", "name": "Nūru-Šaplu", "type": "cavern", "px": 876, "py": 802, "notes": "Zeijani cave village on the ENE plume-edge shoulder of the Throne: carved into a drained parasitic magma chamber with Raufarholshellir oxidised red and purple basalt walls; center of alecap brewing and fungal alchemy (kits/zeijani/README.md, biomes/throne/NOTES.md).", "createdAt": "2026-10-31T19:30:00.000Z"}];
    defSetts.forEach(s=>settlements.set(s.id,s));
  }
  // 5.0: settlements added by a model version reach browsers that already hold a saved list, once each
  const SETT_ADDED={
    '5.0':[{"id": "sostrukhyuni01", "name": "Ostrukh-on-Water", "type": "village", "px": 1516, "py": 1471, "notes": "Yuni agricultural outpost on fresh Lake Ostrukh: terrace farming, qanats, and staging for Siphon Pit expeditions.", "createdAt": "2026-10-28T12:55:00.000Z"}, {"id": "sloomspindle01", "name": "Spindle Fan", "type": "village", "px": 1561, "py": 1140, "notes": "Yuni farming and spring outpost on the Weavers' Cradle piedmont fan: terraced crops supporting expeditions into the Loom-Chasms.", "createdAt": "2026-10-28T12:55:00.000Z"}, {"id": "stallwalls01", "name": "Tallwalls", "type": "city", "px": 650, "py": 1268, "notes": "The greatest haven and fortress of the Free Giants (the Vrivolci, LORE.md 6.17, 6.21) and a sanctuary for escaped slaves of every people fleeing the Vothic Kingdom and the Realm of Dalab. Built of cyclopean columnar basalt and tier-cedar murus gallicus on the middle flood-basalt lava terrace of Greenstep (+1,980 m, Cfa/Cfb) above the confluence of the Clodosriba lava-tube rilles. Called Talodunon in their borrowed Talovolci Gaulish and Da-Talwal in Vrivolci creole. biomes/greenstep/PLAN.md.", "createdAt": "2026-11-06T20:00:00.000Z"}]
  };
  Object.keys(SETT_ADDED).forEach(v=>{
    let done=false; try{ done=localStorage.getItem('krator.settAdded.'+v)==='1'; }catch(e){}
    if(done) return;
    SETT_ADDED[v].forEach(s=>{ if(!settlements.has(s.id)){ settlements.set(s.id,s); if(db&&dbWritable) settSave(s); } });
    try{ localStorage.setItem('krator.settAdded.'+v,'1'); }catch(e){}
    settLocalSave();
  });
  // 5.1 edit 1: settlements a model edit moved reach browsers that already hold a saved list, once each (the shared
  // store's copy, when there is one, arrives after this and wins)
  const SETT_MOVED={
    '5.1e1':[{"id": "sthegate", "name": "The Gate", "type": "outpost", "px": 1438, "py": 326, "notes": "The one way into the Outlands: the Outland Gate's Narrows (1,423 m, 1.34 atm), held by the Tierhounds' long wall from wall foot to wall foot (1431,326 to 1446,326) and their toll fort and water gate on the river, with the trickster's shrine; the god's road (Sleeping City to Trickster's House) runs through it. Moved from the old 7.7 km pass (1408,414), which keeps a cairn and a shrine. biomes/outlandgate/PLAN.md section 5, biomes/outlands/PLAN.md; the owner, 2026-10-26 and 2026-11-09.", "createdAt": "2026-10-26T14:00:00.000Z"}],
    '5.1e2':[{"id": "staiytii0y", "name": "Pinnacle Rock", "type": "city", "px": 1007, "py": 686, "notes": "Beast Rider roost town on a red sandstone mesa (settlements/pinnacle-rock/PLAN.md). Moved 2026-10-18 from px 737,354 (approximate) to the knoll that clears the forest: 500-600 m over the jungle floor, the K'etsaal Baatar 11 km off. Moved 2026-11-10 (the owner: 'a spot not too far that's got a bit more forest') from 1027,681, which map 5.1 left in the NE rim's savanna, 41 km west to the savage hyperjungle's north-east edge: a knoll 110 m over its 14 km round (209 m prominence), -1,287 m, Aw, 1,490 mm, 77% of the ground within 9 km jungle; the Tsékooh Baatar 17 km off (openworld/PLAN-SITES.md, openworld/pinnacle).", "createdAt": "2026-09-24T08:06:51.663Z"}],
    '5.1e3':[{"id": "skm4jjo2vl", "name": "Qiblai", "type": "city", "px": 922, "py": 1595, "notes": "Holy city of the Decree, ~12,000, under a council of abbots (kits/qiblai/PLAN.md; LORE.md 6.13). Moved 2026-11-11 (the owner: by a river, near plentiful resources) from 963,1566, 65 km from any river and without salt, 101 km to the cataracts of Nahr ash-Shalalat (~1,100 m3/s, the region's biggest river): flat ground for the 1.6 km mandala (37 m relief), rock salt, potash, rare earths, saltpeter, copper and oil within 30 km, farmland 40% (openworld/PLAN-SITES.md).", "createdAt": "2026-09-24T07:35:46.046Z"}],
    '5.1e4':[{"id": "s57bkv9741", "name": "Erehwon", "type": "city", "px": 805, "py": 1516, "notes": "Pearl of Xanadu, 20,000 on its mountain lake (LORE.md 6.13; settlements/xanadu, target erewhon). Moved 2026-11-11 with edit 5.1-512, which remade its lake as an Atitlan-like caldera (121 x 66 km at -520 m, three volcanoes set back from the south shore, four islands; the Pleasure Dome of the Bay on its own small isle, landforms.json). The old pin 800,1503 is under the new lake. 805,1516 is a south-shore bench (-497 m): the town climbs to -415 m, a 90 m grey cliff to the palace plateau at -305 m, the mountainside behind, between the west and middle volcanoes 14 and 20 px back.", "createdAt": "2026-09-28T02:12:45.696Z"}]
  };
  Object.keys(SETT_MOVED).forEach(v=>{
    let done=false; try{ done=localStorage.getItem('krator.settMoved.'+v)==='1'; }catch(e){}
    if(done) return;
    SETT_MOVED[v].forEach(s=>{ if(settlements.has(s.id)) settlements.set(s.id,s); });
    try{ localStorage.setItem('krator.settMoved.'+v,'1'); }catch(e){}
    settLocalSave();
  });
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

