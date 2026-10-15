/* ============================== 27. INSPECTOR WORDS (core/host's inspector) ==============================
   The inspector is core/host's (93-host-inspect.js: I for the hover tip, a click for the card); this fragment gives it
   the page's words (as Girder's 86-inspect.js). Sources, most specific first:
     1. mesh.userData.inspectFn(instanceId) / inspectLabel  (creatures, people, foliage)
     2. SITES, every REGISTER()ed volume, each also a core/tags record (45-kit.js): the SMALLEST one holding the hit
        wins (its rings, boxes and spans are SITES' own shapes), worded from its record (KTAGS.label); a catalog piece's
        record when it is smaller still (core/host picks it)
     3. the material family of the kit / merged mesh that was hit                                                  */
var INSPECT_FAM = { adobe:'Mud plaster (banco)', plaster:'Lime wash', mosaic:'Trencadis mosaic', paintbw:'Painted wall (black/white/red)', paintcol:'Painted relief (polychrome)',
  relief:'Low-relief plaster', metal:'Ancient white metal', rust:'Ancient steel (rusted)', concrete:'Ancient concrete', glass:'Ancient blue glass', rock:'Rock', column:'Columnar rock',
  timber:'Timber', plank:'Planking', thatch:'Thatch', tile:'Terracotta tile', cloth:'Cloth', leafy:'Foliage', bark:'Tree trunk', dark:'Opening', glowmat:'Light' };
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
function inspectDescribe(hit, rec){
  var o=hit.object, ud=o.userData||{}, own=null;
  if(ud.inspectFn){ try{ own = ud.inspectFn(hit.instanceId); }catch(e){} }
  if(!own && ud.inspectLabel) own = ud.inspectLabel;
  var st = inspectSite(hit.point), lines=[], T=KTAGS.page, srec=st.best&&st.best.rid&&T?T.get(st.best.rid):null;
  /* a catalog piece (or anything registered) smaller than the site: core/host found it; it is the most specific thing */
  var piece = rec && rec['class']!=='building' && rec['class']!=='infrastructure' && (!srec || rec.id!==srec.id) && (!st.best || st.best.kind==='tree' || rec['class']==='furniture') ? rec : null;
  if(own) lines.push(own);
  if(piece) lines.push(KTAGS.label(piece));
  if(st.best){ var S=st.best; if(!own || (S.kind!=='tree' && S!==st.lvl)) lines.push(srec && !piece ? KTAGS.label(srec) : (S.label && S.label!==S.name ? S.name+' — '+S.label : S.name)); }
  if(st.lvl && st.lvl!==st.best) lines.push(st.lvl.name+' — '+st.lvl.label);
  if(!lines.length) lines.push(INSPECT_FAM[ud.fam]||ud.fam||'Object');
  else if(ud.fam && !own && !piece) lines.push(INSPECT_FAM[ud.fam]||ud.fam);
  lines.push(hit.point.x.toFixed(1)+', '+hit.point.z.toFixed(1)+'  y '+hit.point.y.toFixed(1));
  return lines.join('\n');
}
window._inspect = { sites:SITES.length, at:function(x,y,z){ var s=inspectSite({x:x,y:y,z:z}); return [s.best&&s.best.name+'|'+s.best.label, s.lvl&&s.lvl.name+'|'+s.lvl.label]; },
  px:function(cx,cy){ var h=pickWorld({clientX:cx,clientY:cy}); return h ? inspectDescribe(h, window.KHOST&&KHOST.recordAt?KHOST.recordAt(h.point.x,h.point.y,h.point.z):null).replace(/\n/g,' | ') : null; } };
