  function areaKm2(pts){ let a=0; for(let i=0;i<pts.length;i++){const p=pts[i],q=pts[(i+1)%pts.length]; a+=p[0]*q[1]-q[0]*p[1];} return Math.abs(a)/2*PXKM*PXKM; }
  function centroid(pts){ let x=0,y=0; pts.forEach(p=>{x+=p[0];y+=p[1];}); return [x/pts.length,y/pts.length]; }
  function fmtArea(a){ return a>=1e6?(a/1e6).toFixed(2)+' M km²':Math.round(a).toLocaleString()+' km²'; }
  function hexA(c,a){ const n=parseInt(c.slice(1),16); return `rgba(${n>>16},${(n>>8)&255},${n&255},${a})`; }

  function paintOverlay(){
    og.clearRect(0,0,OW,OH);
    og.lineJoin='round';
    // biomes underneath, then geography, then politics on top; the selected region always shows
    const order={biome:0,geographic:1,political:2};
    const shown=[...regions.values()].filter(r=>r.points.length>=2&&(layerOn[kindOf(r)]||(sel&&sel.id===r.id))).sort((a,b)=>order[kindOf(a)]-order[kindOf(b)]);
    for(const r of shown){
      const kind=kindOf(r), isSel=sel&&sel.id===r.id, isHov=hoveredRegion&&hoveredRegion.id===r.id;
      og.beginPath(); r.points.forEach((p,i)=>i?og.lineTo(p[0],p[1]):og.moveTo(p[0],p[1])); og.closePath();
      og.fillStyle=hexA(r.color,isSel?0.45:isHov?0.38:kind==='political'?0.28:0.18); og.fill();
      og.setLineDash(kind==='geographic'?[10,6]:kind==='biome'?[2,6]:[]);
      og.lineWidth=isSel?4.5:isHov?4.0:kind==='biome'?3:2.5;
      og.strokeStyle=isHov?'#ffffff':r.color;
      og.stroke(); og.setLineDash([]);
    }
    // ---- Toggleable Rivers & River Names ----
    if(layerOn.rivers && DATA.rivers){
      // Pass 1: draw river and wadi courses
      DATA.rivers.forEach(r=>{
        if(!r.px||r.px.length<2) return;
        const isRiver=r.kind==='river', q=r.q_mouth_m3s||0;
        og.beginPath();
        r.px.forEach((p,i)=>i?og.lineTo(p[0],p[1]):og.moveTo(p[0],p[1]));
        og.lineCap='round'; og.lineJoin='round';
        if(isRiver){
          og.strokeStyle=q>=100?'rgba(56,189,248,0.88)':q>=30?'rgba(96,165,250,0.8)':'rgba(147,197,253,0.7)';
          og.lineWidth=Math.max(1.2, Math.min(4.5, q>=1000?4.2:q>=100?2.8:q>=25?1.9:1.2));
        } else {
          og.strokeStyle='rgba(217,162,85,0.55)';
          og.lineWidth=1.0;
        }
        og.stroke();
      });
      // Pass 2: draw river names sorted by discharge with bounding-box collision avoidance
      const placedBoxes=[];
      const sortedRivs=[...DATA.rivers].filter(r=>r.name&&r.px&&r.px.length>=3).sort((a,b)=>(b.q_mouth_m3s||0)-(a.q_mouth_m3s||0));
      for(const r of sortedRivs){
        const isRiver=r.kind==='river', q=r.q_mouth_m3s||0;
        const idx=Math.floor(r.px.length*0.45);
        const p1=r.px[idx], p2=r.px[Math.min(r.px.length-1,idx+2)];
        const hw=r.name.length*3.6+8, hh=9;
        const bx0=p1[0]-hw, bx1=p1[0]+hw, by0=p1[1]-hh, by1=p1[1]+hh;
        let collides=false;
        for(let k=0;k<placedBoxes.length;k++){
          const b=placedBoxes[k];
          if(bx0<b[1]&&bx1>b[0]&&by0<b[3]&&by1>b[2]){ collides=true; break; }
        }
        if(collides) continue;
        placedBoxes.push([bx0,bx1,by0,by1]);
        const dx=p2[0]-p1[0], dy=p2[1]-p1[1];
        let ang=Math.atan2(dy,dx);
        if(ang>Math.PI/2) ang-=Math.PI;
        if(ang<-Math.PI/2) ang+=Math.PI;
        og.save();
        og.translate(p1[0],p1[1]);
        og.rotate(ang);
        og.font=isRiver?(q>=100?'italic 600 12px "Fraunces",Georgia,serif':'italic 600 10.5px "Fraunces",Georgia,serif'):'italic 500 9.5px "IBM Plex Sans",sans-serif';
        og.textAlign='center'; og.textBaseline='bottom';
        og.lineWidth=3.0; og.strokeStyle='rgba(13,18,16,0.92)';
        og.strokeText(r.name, 0, -2);
        og.fillStyle=isRiver?'#e0f2fe':'#fde68a';
        og.fillText(r.name, 0, -2);
        og.restore();
      }
    }
    for(const r of shown) drawLabel(r);
    if(drawing && draft.length){
      og.beginPath(); draft.forEach((p,i)=>i?og.lineTo(p[0],p[1]):og.moveTo(p[0],p[1])); if(cursorPt) og.lineTo(cursorPt[0],cursorPt[1]);
      og.lineWidth=2.5; og.strokeStyle='#ffffff'; og.setLineDash([6,4]); og.stroke(); og.setLineDash([]);
      if(draft.length>2){ og.closePath(); og.fillStyle='rgba(255,255,255,.18)'; og.fill(); }
      draft.forEach(p=>{ og.beginPath(); og.arc(p[0],p[1],4,0,Math.PI*2); og.fillStyle='#fff'; og.fill(); });
    }
    paintMeasure();
    otex.needsUpdate=true;
  }
  function mapToWorld(p){ const x=p[0]/(OW-1)*Wkm-Wkm/2, z=p[1]/(OH-1)*Hkm-Hkm/2;
    const px=Math.min(VW-1,Math.max(0,Math.round(p[0]/(OW-1)*(VW-1)))), py=Math.min(VH-1,Math.max(0,Math.round(p[1]/(OH-1)*(VH-1))));
    return new THREE.Vector3(x, elev[py*VW+px]/1000*vex, z); }
  const hGeo=new THREE.SphereGeometry(1,10,8);
  function placeHandles(){
    while(handles.children.length) handles.remove(handles.children[0]);
    if(!(editVerts && sel)) return;
    const s=Math.max(5,dist*0.012);
    sel.points.forEach((p,i)=>{ const m=new THREE.Mesh(hGeo,new THREE.MeshBasicMaterial({color:0xffffff})); m.position.copy(mapToWorld(p)); m.scale.setScalar(s); m.userData.i=i; handles.add(m); });
  }
  function renderList(){
    list.innerHTML='';
    renderTabs();
    [...regions.values()].filter(r=>kindOf(r)===tab).sort((a,b)=>a.name.localeCompare(b.name)).forEach(r=>{
      const li=document.createElement('li'); li.setAttribute('aria-selected',sel&&sel.id===r.id);
      li.innerHTML=`<i style="background:${r.color}"></i><span class="nm"></span><span class="ar">${fmtArea(areaKm2(r.points))}</span>`;
      li.querySelector('.nm').textContent=r.name; li.onclick=()=>select(r.id); list.appendChild(li);
    });
  }
  function select(id){
    sel=id?regions.get(id):null; editVerts=false; eVerts.setAttribute('aria-pressed',false);
    edit.hidden=!sel;
    if(sel){ const k=kindOf(sel); if(tab!==k){ tab=k; layersSave(); } if(!layerOn[k]) setLayer(k,true); }
    syncKind();
    if(sel){ eName.value=sel.name; eNotes.value=sel.notes||''; eArea.textContent=fmtArea(areaKm2(sel.points))+' · '+sel.points.length+' points'; [...eSw.children].forEach(b=>b.setAttribute('aria-pressed',b.title===sel.color)); }
    renderList(); paintOverlay(); placeHandles();
  }
  let saveT=null;
  function commitSel(){ if(!sel) return; syncKind(); renderList(); paintOverlay(); eArea.textContent=fmtArea(areaKm2(sel.points))+' · '+sel.points.length+' points'; [...eSw.children].forEach(b=>b.setAttribute('aria-pressed',b.title===sel.color)); clearTimeout(saveT); saveT=setTimeout(()=>save(sel),400); }
  eName.addEventListener('input',()=>{ if(sel){ sel.name=eName.value; commitSel(); } });
  eNotes.addEventListener('input',()=>{ if(sel){ sel.notes=eNotes.value; commitSel(); } });
  eVerts.onclick=()=>{ editVerts=!editVerts; eVerts.setAttribute('aria-pressed',editVerts); placeHandles(); };
  $('eDel').onclick=async()=>{ if(!sel) return; const r=sel; regions.delete(r.id); select(null); localSave(); if(db&&dbWritable){ try{ await db.collection('regions').doc(r.id).delete(); }catch(e){ setStatus('delete failed: '+(e.code||e)); } } };

