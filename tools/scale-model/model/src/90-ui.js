  // ---- UI ----
  const vexEl=document.getElementById('vex'); vexEl.addEventListener('input',()=>{vex=+vexEl.value; applyVex();});
  const bTex=document.getElementById('bTex'), bZone=document.getElementById('bZone'), bRain=document.getElementById('bRain'), rainLegend=document.getElementById('rainLegend'), bClim=document.getElementById('bClim'), climLegend=document.getElementById('climLegend'), bSat=document.getElementById('bSat'), bWater=document.getElementById('bWater'), bTop=document.getElementById('bTop');
  const bWind=document.getElementById('bWind'), windLegend=document.getElementById('windLegend'), rWind=document.getElementById('rWind');
  const bTemp=document.getElementById('bTemp'), tempLegend=document.getElementById('tempLegend'), tempMode=document.getElementById('tempMode');
  function setMap(t){ mat.map=t; mat.needsUpdate=true; bTex.setAttribute('aria-pressed',t===tex); bZone.setAttribute('aria-pressed',t===ztex); bRain.setAttribute('aria-pressed',t===rtex); rainLegend.hidden=t!==rtex; bClim.setAttribute('aria-pressed',t===ctex); climLegend.hidden=t!==ctex; bTemp.setAttribute('aria-pressed',t===ttex); tempLegend.hidden=t!==ttex; bWind.setAttribute('aria-pressed',t===wdtex); windLegend.hidden=t!==wdtex; bSat.setAttribute('aria-pressed',t===stex); wmat.opacity=t===stex?0.22:0.6; }
  bTemp.onclick=()=>setMap(mat.map===ttex?tex:ttex);
  bWind.onclick=()=>setMap(mat.map===wdtex?tex:wdtex);
  tempMode.onchange=()=>{ buildTemp(tempMode.value); if(mat.map!==ttex) setMap(ttex); };
  bSat.onclick=()=>setMap(mat.map===stex?tex:stex);
  bClim.onclick=()=>setMap(mat.map===ctex?tex:ctex);
  const climList=document.getElementById('climList'); DATA.climate.present.filter(p=>p.pct>=0.3).forEach(p=>{ const li=document.createElement('li'); li.innerHTML=`<i style="background:${p.color}"></i><b>${p.code}</b><span title="${p.name}">${p.pct.toFixed(0)}% ${p.name}</span>`; climList.appendChild(li); });
  bTex.onclick=()=>setMap(tex); bZone.onclick=()=>setMap(ztex); bRain.onclick=()=>setMap(mat.map===rtex?tex:rtex);
  bWater.onclick=()=>{const on=bWater.getAttribute('aria-pressed')!=='true'; bWater.setAttribute('aria-pressed',on); waterMesh.visible=on;};
  bTop.onclick=()=>{topdown=!topdown; bTop.setAttribute('aria-pressed',topdown); updateCam();};
  const panel=document.getElementById('panel'), tog=document.getElementById('toggle');
  tog.onclick=()=>{const c=panel.classList.toggle('collapsed'); tog.setAttribute('aria-expanded',!c);};

  setMap(stex);
  function resize(){const w=stage.clientWidth,h=stage.clientHeight; renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();}
  addEventListener('resize',resize); resize(); updateCam();
  let last=performance.now();
  renderer.setAnimationLoop(now=>{ const dt=Math.min(0.05,(now-last)/1000); last=now; stepSmoke(dt); stepKeys(dt); vents.forEach((v,i)=>{v.glow.intensity=(2.2+0.6*Math.sin(now*0.004+i)+0.3*Math.sin(now*0.013+i))*v.scale*v.lit;}); renderer.render(scene,camera); });
})();
