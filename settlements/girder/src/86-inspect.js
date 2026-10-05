/* ============================== 27. DEV INSPECTOR ==============================
   Toggle on, hover anything: the tooltip names the most specific thing known
   about what is under the cursor. Read-only. Sources, most specific first:
     1. mesh.userData.inspectFn(instanceId) / inspectLabel  (creatures, people, foliage)
     2. SITES — every REGISTER()ed volume; the SMALLEST one containing the hit wins,
        and the platform + level it belongs to are appended
     3. the material family of the kit / merged mesh that was hit               */
var INSPECT_FAM = { plank:'Decking', timber:'Timber frame', wall:'Wall', thatch:'Thatch roof', shingle:'Shingle roof',
  rope:'Rope', cloth:'Cloth', rock:'Rock', web:'Spider web', leafy:'Undergrowth', bark0:'Ironbark', bark1:'Ghostwood',
  bark2:'Prism gum', bark3:'Gate baobab', glowmat:'Lantern', rust:'Ancient steel', concrete:'Ancient concrete',
  hidep:'Drying rawhide', pelt:'Big-cat pelt', banner:'Clan banner', tapestry:'Claw tapestry', blanket:'Saddle blanket', flag:'Prayer flag',
  awning:'Awning', plaque:'Stall plaque', post:'Lamp post', totem:'Carved post', trim:'Lacquer and gilt frieze', inlay:'Bone inlay', lantern:'Paper lantern' };
var inspectOn = false, inspectTip = document.getElementById('inspectTip'), inspectLast = 0;
function inspectSite(p){
  var best=null, bv=1e18, lvl=null, lv=1e18;
  for(var i=0;i<SITES.length;i++){
    var S=SITES[i]; if(p.y < S.y-0.3 || p.y > S.y+S.h+0.3) continue;
    var ok;
    if(S.seg){ ok = segDist(p.x,p.z,S.seg[0],S.seg[1],S.seg[2],S.seg[3]) < S.seg[4]*0.5+1.2; }
    else if(S.hx) ok = Math.abs(p.x-S.x) <= S.hx && Math.abs(p.z-S.z) <= S.hz;
    else if(S.ring) ok = Math.hypot(p.x-S.x,p.z-S.z) <= S.r && Math.hypot(p.x-S.x,p.z-S.z) >= S.ring;
    else ok = Math.hypot(p.x-S.x,p.z-S.z) <= S.r;
    if(!ok) continue;
    var vol = (S.hx ? S.hx*S.hz*1.27 : S.ring ? (S.r*S.r-S.ring*S.ring) : S.r*S.r)*S.h;
    if(S.lvl!=null || S.label==='Deck'){ if(vol<lv){ lv=vol; lvl=S; } }
    if(vol < bv){ bv=vol; best=S; }
  }
  return { best:best, lvl:lvl };
}
function inspectDescribe(hit){
  var o=hit.object, ud=o.userData||{}, own=null;
  if(ud.inspectFn){ try{ own = ud.inspectFn(hit.instanceId); }catch(e){} }
  if(!own && ud.inspectLabel) own = ud.inspectLabel;
  var st = inspectSite(hit.point), lines=[];
  if(own) lines.push('<b>'+own+'</b>');
  if(st.best){ var S=st.best; if(!own || (S.kind!=='tree' && S!==st.lvl)) lines.push((own?'':'<b>')+(S.label && S.label!==S.name ? S.name+' — '+S.label : S.name)+(own?'':'</b>')); }
  if(st.lvl && st.lvl!==st.best) lines.push(st.lvl.name+' — '+st.lvl.label);
  if(!lines.length || (!own && !st.best)) lines.push('<b>'+(INSPECT_FAM[ud.fam]||ud.fam||'Object')+'</b>');
  else if(ud.fam && !own) lines.push('<span style="opacity:.6">'+(INSPECT_FAM[ud.fam]||ud.fam)+'</span>');
  lines.push('<span style="opacity:.6">'+hit.point.x.toFixed(1)+', '+hit.point.z.toFixed(1)+'  y '+hit.point.y.toFixed(1)+'</span>');
  return lines.join('<br>');
}
document.getElementById('inspectToggle').onclick = function(){
  inspectOn = !inspectOn; this.textContent = 'Inspector: '+(inspectOn?'On':'Off'); this.classList.toggle('on',inspectOn);
  if(!inspectOn) inspectTip.style.display='none';
};
camEl.addEventListener('pointermove', function(e){
  if(!inspectOn || Object.keys(ptrs).length) return;
  var now = performance.now(); if(now - inspectLast < 70) return; inspectLast = now;
  var hit = pickWorld(e);
  if(!hit){ inspectTip.style.display='none'; return; }
  inspectTip.innerHTML = inspectDescribe(hit); inspectTip.style.whiteSpace='normal';
  inspectTip.style.display='block';
  inspectTip.style.left = Math.min(innerWidth-260, e.clientX+16)+'px'; inspectTip.style.top = Math.min(innerHeight-90, e.clientY+14)+'px';
});
window._inspect = { sites:SITES.length, at:function(x,y,z){ var s=inspectSite({x:x,y:y,z:z}); return [s.best&&s.best.name+'|'+s.best.label, s.lvl&&s.lvl.name+'|'+s.lvl.label]; },
  px:function(cx,cy){ var h=pickWorld({clientX:cx,clientY:cy}); return h ? inspectDescribe(h).replace(/<[^>]+>/g,' | ') : null; } };
