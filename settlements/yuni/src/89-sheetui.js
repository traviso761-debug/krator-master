/* ============================== 31. SHEET UI ==============================
   The inspection sheet's own controls: a family button jumps to that family's first asset; a dropdown
   and Prev / Next step through every asset (three-quarter view from the front); name labels float over
   whatever is near the camera.                                                                       */
var sheetFocus = null;
(function(){
  if(!SHEET) return;
  var host=document.createElement('div'); host.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:5;overflow:hidden'; document.body.appendChild(host);
  var labs=SHEET_ITEMS.map(function(it){ var d=document.createElement('div'); d.textContent=it.name;
    d.style.cssText='position:absolute;transform:translate(-50%,-100%);padding:2px 6px;border-radius:3px;background:rgba(16,14,18,.78);border:1px solid rgba(216,200,154,.45);color:#f0e6cc;font:10.5px/1.3 ui-monospace,Menlo,monospace;white-space:nowrap';
    host.appendChild(d); return d; });
  var v=new THREE.Vector3(), cur=0;
  TICKS.push(function(){ for(var i=0;i<SHEET_ITEMS.length;i++){ var it=SHEET_ITEMS[i], el=labs[i]; v.set(it.x, it.h+2.5, it.z);
      var dist=v.distanceTo(camera.position), lim=Math.max(120, 3.2*Math.max(it.w,it.d,it.h)); v.project(camera);
      if(v.z>1 || v.z<-1 || dist>lim || Math.abs(v.x)>1.05 || Math.abs(v.y)>1.05){ el.style.display='none'; continue; }
      el.style.display='block'; el.style.left=((v.x*0.5+0.5)*innerWidth)+'px'; el.style.top=((-v.y*0.5+0.5)*innerHeight)+'px'; el.style.opacity = (i===cur) ? 1 : 0.6; } });
  var vh=document.getElementById('views');
  var sel=document.createElement('select'); sel.style.cssText='width:100%;box-sizing:border-box;margin:4px 0;background:rgba(22,20,26,.85);color:#e8e2d6;border:1px solid rgba(216,200,154,.32);border-radius:3px;font:11px/1.4 inherit;padding:4px';
  SHEET_ROWS.forEach(function(r){ var og=document.createElement('optgroup'); og.label=r.name; r.items.forEach(function(it){ var o=document.createElement('option'); o.value=SHEET_ITEMS.indexOf(it); o.textContent=it.name; og.appendChild(o); }); sel.appendChild(og); });
  function focus(i, side){ cur=((i%SHEET_ITEMS.length)+SHEET_ITEMS.length)%SHEET_ITEMS.length; var it=SHEET_ITEMS[cur], R=Math.max(it.w, it.d*0.9, it.h*1.25), s=side||0;
    sel.value=cur; sheetFocus=it;
    if(s===2) setView(it.x+0.01, it.h+R*1.5, it.z-R*0.25, it.x, 0, it.z);                                     /* plan */
    else if(s===1) setView(it.x+R*1.05, it.h*0.55+R*0.30, it.z+R*0.95, it.x, it.h*0.40, it.z);                 /* from behind */
    else setView(it.x-R*0.75, it.h*0.45+R*0.32, it.z-it.d/2-R*1.05, it.x, it.h*0.42, it.z); }                  /* front three-quarter (fronts face north) */
  sel.onchange=function(){ focus(parseInt(sel.value,10)); };
  function btn(name, fn, wide){ var b=document.createElement('button'); b.textContent=name; b.onclick=fn; if(wide) b.style.width='100%'; return b; }
  SHEET_ROWS.forEach(function(r){ var fn=function(){ focus(SHEET_ITEMS.indexOf(r.items[0])); }; VIEWS.push([r.name,fn]); vh.appendChild(btn(r.name+' ('+r.items.length+')', fn)); });
  vh.appendChild(sel);
  vh.appendChild(btn('◀ Prev', function(){ focus(cur-1); })); vh.appendChild(btn('Next ▶', function(){ focus(cur+1); }));
  vh.appendChild(btn('Front', function(){ focus(cur,0); })); vh.appendChild(btn('Back', function(){ focus(cur,1); })); vh.appendChild(btn('Plan', function(){ focus(cur,2); }));
  var whole=function(){ setView(0, 1300, -CITY_EXT-900, 0, 0, -CITY_EXT*0.35); }; VIEWS.push(['Whole sheet',whole]); vh.appendChild(btn('Whole sheet', whole));
  addEventListener('keydown', function(e){ if(e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return; if(e.key==='ArrowRight'||e.key==='n') focus(cur+1); if(e.key==='ArrowLeft'||e.key==='p') focus(cur-1); });
  document.getElementById('hint').innerHTML += '<br><b>Left / Right arrows</b> step through the assets. Inspector on = hover for name + key. The blue tab on a footprint marks its FRONT (street side).';
  window._sheetui = { focus:focus, n:SHEET_ITEMS.length };
  setTimeout(function(){ focus(0); }, 0);
})();
