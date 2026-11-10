/* ============================== KIT SHEET: LABELS AND CONTROLS ==============================
   The sheet's own controls, as Yuni's 89-sheetui.js: a button per family row jumps to its first piece; a select and
   Prev / Next step through every piece (front three-quarter, from behind, plan); a name label floats over each piece near
   the camera (DOM labels over the canvas, ticked each frame by TICKS). Every view is handed to core/host as a preset
   (YS_VIEWS: the host's view select and the probe's views) in 98-ys-take.js.                                         */
var YS_VIEWS = {};
var ysFocusAt = function(it, s){ var R = Math.max(it.w, it.d*0.9, it.h*1.25);
  if(s === 2) return [it.x+0.01, it.h+R*1.5, it.z-R*0.25, it.x, 0, it.z];                                   /* plan */
  if(s === 1) return [it.x+R*1.05, it.h*0.55+R*0.30, it.z+R*0.95, it.x, it.h*0.40, it.z];                   /* from behind */
  return [it.x-R*0.75, it.h*0.45+R*0.32, it.z-it.d/2-R*1.05, it.x, it.h*0.42, it.z]; };                    /* front three-quarter (fronts face north) */
var ysSheet = (function(){
  var host = document.createElement('div'); host.className = 'khost-chrome';
  host.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:5;overflow:hidden'; document.body.appendChild(host);
  var labs = SHEET_ITEMS.map(function(it){ var d = document.createElement('div'); d.textContent = it.name;
    d.style.cssText = 'position:absolute;transform:translate(-50%,-100%);padding:2px 6px;border-radius:3px;background:rgba(16,14,18,.78);border:1px solid rgba(216,200,154,.45);color:#f0e6cc;font:10.5px/1.3 ui-monospace,Menlo,monospace;white-space:nowrap;display:none';
    host.appendChild(d); return d; });
  var v = new THREE.Vector3(), cur = 0;
  TICKS.push(function(){ for(var i=0;i<SHEET_ITEMS.length;i++){ var it = SHEET_ITEMS[i], el = labs[i]; v.set(it.x, it.h+2.5, it.z);
      var dist = v.distanceTo(camera.position), lim = Math.max(60, 3.2*Math.max(it.w, it.d, it.h)); v.project(camera);
      if(v.z > 1 || v.z < -1 || dist > lim || Math.abs(v.x) > 1.05 || Math.abs(v.y) > 1.05){ el.style.display = 'none'; continue; }
      el.style.display = 'block'; el.style.left = ((v.x*0.5+0.5)*innerWidth)+'px'; el.style.top = ((-v.y*0.5+0.5)*innerHeight)+'px'; el.style.opacity = (i === cur) ? 1 : 0.6; } });
  var E = YS_EXT, cx = (E.x0+E.x1)/2, cz = (E.z0+E.z1)/2, span = Math.max(E.x1-E.x0, E.z1-E.z0);
  YS_VIEWS['Whole sheet'] = [cx-span*0.05, span*0.62, E.z0-span*0.45, cx, 0, cz];
  SHEET_ROWS.forEach(function(r){ var it = r.items[0], D = Math.max(30, r.z1-r.z0);   /* the row's west end, from the north-west */
    YS_VIEWS[r.name] = [it.x-it.w/2-10, 24+D*0.35, r.z0-30-D*0.55, it.x+70, 0, (r.z0+r.z1)/2]; });
  SHEET_ITEMS.forEach(function(it){ var nm = it.name; if(YS_VIEWS[nm]) nm += ' ('+it.key+')'; YS_VIEWS[nm] = ysFocusAt(it, 0); });
  var vh = document.getElementById('views');
  var sel = document.createElement('select'); sel.style.cssText = 'width:100%;box-sizing:border-box;margin:4px 0;background:rgba(22,20,26,.85);color:#e8e2d6;border:1px solid rgba(216,200,154,.32);border-radius:3px;font:11px/1.4 inherit;padding:4px';
  SHEET_ROWS.forEach(function(r){ var og = document.createElement('optgroup'); og.label = r.name; r.items.forEach(function(it){ var o = document.createElement('option'); o.value = SHEET_ITEMS.indexOf(it); o.textContent = it.name; og.appendChild(o); }); sel.appendChild(og); });
  function focus(i, side){ if(!SHEET_ITEMS.length) return; cur = ((i%SHEET_ITEMS.length)+SHEET_ITEMS.length)%SHEET_ITEMS.length; sel.value = cur;
    setView.apply(null, ysFocusAt(SHEET_ITEMS[cur], side||0)); }
  sel.onchange = function(){ focus(parseInt(sel.value, 10)); };
  function btn(name, fn){ var b = document.createElement('button'); b.textContent = name; b.onclick = fn; return b; }
  SHEET_ROWS.forEach(function(r){ vh.appendChild(btn(r.name+' ('+r.items.length+')', function(){ focus(SHEET_ITEMS.indexOf(r.items[0])); })); });
  vh.appendChild(sel);
  vh.appendChild(btn('◀ Prev', function(){ focus(cur-1); })); vh.appendChild(btn('Next ▶', function(){ focus(cur+1); }));
  vh.appendChild(btn('Front', function(){ focus(cur, 0); })); vh.appendChild(btn('Back', function(){ focus(cur, 1); })); vh.appendChild(btn('Plan', function(){ focus(cur, 2); }));
  addEventListener('keydown', function(e){ if(e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return; if(e.key === 'ArrowRight' || e.key === 'n') focus(cur+1); if(e.key === 'ArrowLeft') focus(cur-1); });
  return { focus:focus, n:SHEET_ITEMS.length };
})();
