// ================================================================= YS CITY — dev tools: the hour of day and the city budgets
// (the inspector, polygon tool, walk mode, labels and compass are the standard pack in src/92-camera.js)
BUDGET.showcase={tris:12000000,calls:220};
{const wrap=document.createElement('span');wrap.style.cssText='display:inline-flex;align-items:center;gap:4px;margin-left:6px;font:12px system-ui;color:#d8f4f0';
 const lab=document.createElement('span');lab.textContent='hour '+YSCLOCK.hour.toFixed(1);const sl=document.createElement('input');sl.type='range';sl.min=0;sl.max=24;sl.step=.1;sl.value=YSCLOCK.hour;sl.style.width='120px';
 sl.oninput=()=>{setHour(parseFloat(sl.value));lab.textContent='hour '+YSCLOCK.hour.toFixed(1);};wrap.appendChild(lab);wrap.appendChild(sl);ui.appendChild(wrap);
 FRAME_HOOKS.push(()=>{if(Math.abs(parseFloat(sl.value)-YSCLOCK.hour)>.05){sl.value=YSCLOCK.hour;lab.textContent='hour '+YSCLOCK.hour.toFixed(1);}});}
window._api.city={CITY,layout:()=>PORT_LAYOUT.items.length,shoreDist:(x,z)=>ysShoreDist(x,z),hour:()=>YSCLOCK.hour};
