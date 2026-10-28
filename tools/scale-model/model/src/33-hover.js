  // ---- hover readout ----
  const ray=new THREE.Raycaster(), ndc=new THREE.Vector2();
  const rElev=document.getElementById('rElev'), rZone=document.getElementById('rZone'), rAir=document.getElementById('rAir'), rRain=document.getElementById('rRain'), rClim=document.getElementById('rClim'), rTemp=document.getElementById('rTemp');
  function castAt(e,objs){
    const r=el.getBoundingClientRect(); ndc.x=((e.clientX-r.left)/r.width)*2-1; ndc.y=-((e.clientY-r.top)/r.height)*2+1;
    ray.setFromCamera(ndc,camera); return ray.intersectObjects(objs)[0];
  }
  function pickMap(e){ const hit=castAt(e,[mesh]); if(!hit) return null; return [Math.round((hit.point.x+Wkm/2)/Wkm*(OW-1)), Math.round((hit.point.z+Hkm/2)/Hkm*(OH-1))]; }
  function pickHandle(e){ const r=el.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;let best=null,bd=16;camera.updateMatrixWorld();
    handles.children.forEach(m=>{ const v=m.position.clone().project(camera); if(v.z>1) return; const d=Math.hypot((v.x*.5+.5)*r.width-mx,(-v.y*.5+.5)*r.height-my); if(d<bd){bd=d;best=m;} });
    return best; }
  // the designated rivers (DATA.rivers, 4.21): the nearest course within 3 map px (6 km) of the pointer
  const rRiver=document.getElementById('rRiver'), RIVG=new Map();
  (DATA.rivers||[]).forEach((r,k)=>r.px.forEach((p,n)=>{const key=Math.floor(p[0]/8)+','+Math.floor(p[1]/8);let a=RIVG.get(key);if(!a)RIVG.set(key,a=[]);a.push(k,n);}));
  function riverAt(x,y){ let best=null,bd=9;
    for(let gx=Math.floor(x/8)-1;gx<=Math.floor(x/8)+1;gx++)for(let gy=Math.floor(y/8)-1;gy<=Math.floor(y/8)+1;gy++){const a=RIVG.get(gx+','+gy);if(!a)continue;
      for(let i=0;i<a.length;i+=2){const r=DATA.rivers[a[i]],p=r.px[a[i+1]],d=(p[0]-x)*(p[0]-x)+(p[1]-y)*(p[1]-y);if(d<bd){bd=d;best=[r,a[i+1]];}}}
    if(!best) return '—'; const [r,n]=best, q=r.q_m3s?r.q_m3s[Math.min(n,r.q_m3s.length-1)]:null;
    return r.name+' · '+(r.kind==='wadi'?'dry valley, '+Math.round(r.catchment_km2/100)*100+' km²':(q<10?q.toFixed(1):Math.round(q))+' m³/s · ~'+Math.round(r.width_m)+' m wide'); }
  function hover(e){
    const hit=castAt(e,[mesh]); if(!hit) return;
    const u=(hit.point.x+Wkm/2)/Wkm, v=(hit.point.z+Hkm/2)/Hkm;
    const px=Math.min(VW-1,Math.max(0,Math.round(u*(VW-1)))), py=Math.min(VH-1,Math.max(0,Math.round(v*(VH-1))));
    const m=elev[py*VW+px];
    const zx=Math.round(u*(zImg.width-1)), zy=Math.round(v*(zImg.height-1)); const z=zone[zy*zImg.width+zx];
    rElev.textContent=(m>=0?'+':'')+(m/1000).toFixed(2)+' km';
    rZone.textContent=ZONES[z]||'—';
    // pressure: lowland datum 1.6 atm, moist scale height ~ 8.6 km at 0.75 g -> use 8.0 km
    const p=1.6*Math.exp(-m/8000);
    const po2=p*0.28;
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
  }

