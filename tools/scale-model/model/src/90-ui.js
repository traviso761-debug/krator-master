  // ---- UI ----
  const vexEl=document.getElementById('vex'); vexEl.addEventListener('input',()=>{vex=+vexEl.value; applyVex();});
  const bTex=document.getElementById('bTex'), bZone=document.getElementById('bZone'), bRain=document.getElementById('bRain'), rainLegend=document.getElementById('rainLegend'), bClim=document.getElementById('bClim'), climLegend=document.getElementById('climLegend'), bSat=document.getElementById('bSat'), bWater=document.getElementById('bWater'), bTop=document.getElementById('bTop');
  const bWind=document.getElementById('bWind'), windLegend=document.getElementById('windLegend'), rWind=document.getElementById('rWind');
  const bTemp=document.getElementById('bTemp'), tempLegend=document.getElementById('tempLegend'), tempMode=document.getElementById('tempMode');
  const keyDrawer=document.getElementById('climateKeyDrawer'), bKeyClose=document.getElementById('bKeyClose');
  function setKeyExpanded(open){
    if(!keyDrawer) return;
    keyDrawer.classList.toggle('key-collapsed', !open);
    if(bKeyClose){
      bKeyClose.textContent=open?'Collapse Key':'Expand Key';
      bKeyClose.setAttribute('aria-expanded', open);
    }
  }
  function updateDrawerVis(t){
    const hasModeLegend=(t===rtex||t===ctex||t===ttex||t===wdtex||t===ztex);
    if(hasModeLegend) setKeyExpanded(true);
  }
  if(bKeyClose) bKeyClose.onclick=()=>{
    const isCollapsed=keyDrawer.classList.contains('key-collapsed');
    setKeyExpanded(isCollapsed);
  };
  function setMap(t){ mat.map=t; mat.needsUpdate=true; bTex.setAttribute('aria-pressed',t===tex); bZone.setAttribute('aria-pressed',t===ztex); bRain.setAttribute('aria-pressed',t===rtex); rainLegend.hidden=t!==rtex; bClim.setAttribute('aria-pressed',t===ctex); climLegend.hidden=t!==ctex; bTemp.setAttribute('aria-pressed',t===ttex); tempLegend.hidden=t!==ttex; bWind.setAttribute('aria-pressed',t===wdtex); windLegend.hidden=t!==wdtex; bSat.setAttribute('aria-pressed',t===stex); wmat.opacity=t===stex?0.22:0.6; updateDrawerVis(t); }
  bTemp.onclick=()=>setMap(mat.map===ttex?tex:ttex);
  bWind.onclick=()=>setMap(mat.map===wdtex?tex:wdtex);
  tempMode.onchange=()=>{ buildTemp(tempMode.value); if(mat.map!==ttex) setMap(ttex); };
  bSat.onclick=()=>setMap(mat.map===stex?tex:stex);
  bClim.onclick=()=>setMap(mat.map===ctex?tex:ctex);
  const bClimToggle=document.getElementById('bClimToggle');
  if(bClimToggle){
    let climExpanded=true;
    bClimToggle.onclick=()=>{
      climExpanded=!climExpanded;
      const cList=document.getElementById('climList');
      if(cList) cList.style.display=climExpanded?'':'none';
      bClimToggle.textContent=climExpanded?'Collapse Key':'Expand Key';
      bClimToggle.setAttribute('aria-expanded',climExpanded);
    };
  }
  const climList=document.getElementById('climList'); DATA.climate.present.filter(p=>p.pct>=0.3).forEach(p=>{ const li=document.createElement('li'); li.innerHTML=`<i style="background:${p.color}"></i><b>${p.code}</b><span title="${p.name}">${p.pct.toFixed(0)}% ${p.name}</span>`; climList.appendChild(li); });
  bTex.onclick=()=>setMap(tex); bZone.onclick=()=>setMap(ztex); bRain.onclick=()=>setMap(mat.map===rtex?tex:rtex);
  bWater.onclick=()=>{const on=bWater.getAttribute('aria-pressed')!=='true'; bWater.setAttribute('aria-pressed',on); waterMesh.visible=on;};
  bTop.onclick=()=>{topdown=!topdown; bTop.setAttribute('aria-pressed',topdown); updateCam();};
  const panel=document.getElementById('panel'), tog=document.getElementById('toggle');
  tog.onclick=()=>{const c=panel.classList.toggle('collapsed-sidebar'); tog.setAttribute('aria-expanded',!c); tog.textContent=c?'Show':'Hide';};

  // Copy coordinates button
  const btnCopyCoords=document.getElementById('btnCopyCoords');
  if(btnCopyCoords){
    btnCopyCoords.onclick=()=>{
      const txt=document.getElementById('rCoord')?.textContent||'';
      if(navigator.clipboard) navigator.clipboard.writeText(txt).catch(()=>{});
      btnCopyCoords.textContent='Copied!';
      setTimeout(()=>{btnCopyCoords.textContent='Copy';},1000);
    };
  }

  // Focus & Zoom camera onto selected region
  const bFocusRegion=document.getElementById('bFocusRegion');
  if(bFocusRegion){
    bFocusRegion.onclick=()=>{
      if(!sel||!sel.points||!sel.points.length) return;
      const c=centroid(sel.points);
      const wp=mapToWorld(c);
      target.set(wp.x, 0, wp.z);
      dist=Math.max(350, Math.min(1800, Math.sqrt(polyAreaKm2(sel.points))*2.2));
      updateCam();
    };
  }

  // Unified tabs: switch between Regions (Pol/Geo/Bio) and Settlements (Sett)
  const regSec=document.getElementById('regSec'), bSettTab=document.getElementById('bSettTab'), settPills=document.getElementById('settPills'), rSearch=document.getElementById('rSearch');
  let activeSettType='all';
  function applySearchAndFilters(){
    const q=(rSearch?.value||'').trim().toLowerCase();
    // Filter regions list
    document.querySelectorAll('#regions li').forEach(li=>{
      const nm=(li.querySelector('.nm')?.textContent||'').toLowerCase();
      li.style.display=(!q||nm.includes(q))?'':'none';
    });
    // Filter settlements list
    document.querySelectorAll('#settList li').forEach(li=>{
      const nm=(li.querySelector('.snm')?.value||'').toLowerCase();
      const ty=(li.querySelector('.sty')?.value||'').toLowerCase();
      const matchQ=!q||nm.includes(q)||ty.includes(q);
      const matchT=activeSettType==='all'||ty===activeSettType;
      li.style.display=(matchQ&&matchT)?'':'none';
    });
    const badge=document.getElementById('settCountBadge');
    if(badge) badge.textContent=settlements.size;
  }
  if(rSearch) rSearch.addEventListener('input', applySearchAndFilters);
  if(settPills){
    settPills.querySelectorAll('.pill-btn').forEach(btn=>{
      btn.onclick=()=>{
        settPills.querySelectorAll('.pill-btn').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        activeSettType=btn.dataset.type||'all';
        applySearchAndFilters();
      };
    });
  }
  function showSettTab(on){
    if(regSec) regSec.hidden=on;
    if(settPanel) settPanel.hidden=!on;
    if(settPills) settPills.hidden=!on;
    if(bSettTab) bSettTab.setAttribute('aria-selected', on);
    if(on){
      document.querySelectorAll('#rTabs button').forEach(b=>b.setAttribute('aria-selected', false));
      if(bSett.getAttribute('aria-pressed')!=='true') bSett.click();
    }
    applySearchAndFilters();
  }
  if(bSettTab){
    bSettTab.onclick=()=>showSettTab(true);
  }
  const origRenderTabs=renderTabs;
  document.getElementById('rTabs').addEventListener('click', ()=>{
    if(regSec && regSec.hidden) showSettTab(false);
    setTimeout(applySearchAndFilters, 0);
  });
  bSett.addEventListener('click', ()=>{
    const on=bSett.getAttribute('aria-pressed')==='true';
    showSettTab(on);
  });

  setMap(stex);
  function updateReadoutUV(u,v){
    const px=Math.min(VW-1,Math.max(0,Math.round(u*(VW-1)))), py=Math.min(VH-1,Math.max(0,Math.round(v*(VH-1))));
    const m=elev[py*VW+px];
    const zx=Math.round(u*(zImg.width-1)), zy=Math.round(v*(zImg.height-1)); const z=zone[zy*zImg.width+zx];
    rElev.textContent=(m>=0?'+':'')+(m/1000).toFixed(2)+' km';
    rZone.textContent=ZONES[z]||'—';
    const p=1.6*Math.exp(-m/8000), po2=p*0.28;
    rAir.textContent=p.toFixed(2)+' atm · O₂ '+po2.toFixed(2)+(p<0.45?' · thin':po2>0.5?' · abyss cough':p>1.3?' · dense':'');
    const rx=Math.round(u*(pImg.width-1)), ry=Math.round(v*(pImg.height-1)); const mmv=rain[ry*pImg.width+rx]/255*4000;
    rRain.textContent=m>9000?'— (airless)':Math.round(mmv/10)*10+' mm/yr'+(mmv<250?' · arid':mmv<600?' · dry':mmv>1800?' · wet':'');
    const cx2=Math.round(u*(cImg.width-1)), cy2=Math.round(v*(cImg.height-1)); const cc=CL[clim[cy2*cImg.width+cx2]];
    rClim.textContent=cc?cc.code+' · '+cc.name:'—';
    const ti=cy2*TWd+cx2; const f=(a)=>(a>=0?'+':'')+a+'°';
    rTemp.textContent=m>9000?'— (airless)':`${f(TM[ti])} mean · ${f(TW[ti])}/${f(TC[ti])} months · ${f(TH[ti])}/${f(TL[ti])} extremes`;
    const wx=Math.min(WDW-1,Math.round(u*(WDW-1))), wy=Math.min(WDH-1,Math.round(v*(WDH-1))); const wi=wy*WDW+wx;
    const wq=WPOW[wi], wv=WVEL[wi];
    const wclass = wq<200?'poor':wq<400?'fair':wq<700?'good':wq<1200?'excellent':'outstanding';
    rWind.textContent = WDEAD[wi] ? '— (airless)' : wv.toFixed(1)+' m/s · '+Math.round(wq/10)*10+' W/m² · '+wclass;
    rRiver.textContent=riverAt(u*(OW-1),v*(OH-1));
    const rCoord=document.getElementById('rCoord');
    if(rCoord){
      const cx=Math.round(u*(OW-1)), cy=Math.round(v*(OH-1));
      rCoord.textContent=cx+','+cy+' px · '+(cx*PXKM)+' km, '+(cy*PXKM)+' km';
    }
  }
  updateReadoutUV(0.5,0.5);
  function resize(){const w=stage.clientWidth||window.innerWidth||1200,h=stage.clientHeight||window.innerHeight||800; renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();}
  addEventListener('resize',resize); resize(); updateCam();
  let last=performance.now();
  renderer.setAnimationLoop(now=>{ const dt=Math.min(0.05,(now-last)/1000); last=now; stepSmoke(dt); stepKeys(dt); vents.forEach((v,i)=>{v.glow.intensity=(2.2+0.6*Math.sin(now*0.004+i)+0.3*Math.sin(now*0.013+i))*v.scale*v.lit;}); renderer.render(scene,camera); });
})();
