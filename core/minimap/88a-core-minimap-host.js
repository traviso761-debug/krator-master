// ================================================================= CORE — minimap host: the browser panel for KMAP
// [web]: everything of the minimap that needs a browser (the panel, its canvases, the M key, hover and click).
// The plan itself, its records, relief and export are core/minimap/88-core-minimap.js ([G data]), which this
// fragment wraps. It moves into core/host/ when Phase 1 of GODOT-PLAN.md builds that; until then a build that
// takes the minimap takes both files (Voth's build.py reads every digit-prefixed file in core/minimap/).
//
//   KMAP.mount(M, {parent, title, viewer:()=>viewer, onPick:(x,z,rec)=>{}, onToggle(on), hz:4})
//        returns {el, open(on), toggle(), isOpen(), redraw()}; M is the key that toggles it, except while typing.
//   Every KMAP.create(...) result also gets M.mount(op), the same call, so a build's code is unchanged.
(function(root){
  'use strict';
  if(!root.KMAP)throw new Error('88a-core-minimap-host: load core/minimap/88-core-minimap.js first');
  function mount(M,op){
    op=op||{};if(typeof document==='undefined')throw new Error('KMAP.mount needs a browser');
    var size=M.size,base=null,baseRev=-1;
    var hz=op.hz||4,panel=document.createElement('div'),title=document.createElement('div'),cv=document.createElement('canvas');
    panel.className='kmap';panel.style.cssText='position:fixed;left:10px;bottom:10px;z-index:11;display:none;flex-direction:column;gap:4px;'+
      'background:rgba(10,10,12,.88);border:1px solid rgba(216,200,154,.45);padding:6px;font:11px Helvetica,Arial,sans-serif;color:#e6e2d8;border-radius:3px';
    title.textContent=op.title||'Map';title.style.cssText='letter-spacing:.12em;text-transform:uppercase;font-size:10px;color:#d8c89a';
    cv.width=size;cv.height=size;cv.style.cssText='display:block;cursor:crosshair;width:'+size+'px;height:'+size+'px';
    panel.appendChild(title);panel.appendChild(cv);(op.parent||document.body).appendChild(panel);
    var g=cv.getContext('2d'),hoverTxt='',timer=null;
    function paintBase(){
      base=document.createElement('canvas');base.width=base.height=size;
      var bg=base.getContext('2d'),img=M.reliefPixels(bg),tmp=null;
      if(img){tmp=document.createElement('canvas');tmp.width=img.width;tmp.height=img.height;tmp.getContext('2d').putImageData(img,0,0);}
      M.paint(bg,tmp);baseRev=M.rev();
    }
    function draw(){if(!base||baseRev!==M.rev())paintBase();
      g.drawImage(base,0,0);M.overlay(g,op.viewer?op.viewer():null,hoverTxt);}
    function at(e){var r=cv.getBoundingClientRect();return M.toWorld((e.clientX-r.left)*size/r.width,(e.clientY-r.top)*size/r.height);}
    cv.addEventListener('mousemove',function(e){var w2=at(e),r=M.pick(w2[0],w2[1]);hoverTxt=r?(r.name||r.tag):'';draw();});
    cv.addEventListener('mouseleave',function(){hoverTxt='';draw();});
    cv.addEventListener('click',function(e){var w2=at(e);if(op.onPick)op.onPick(w2[0],w2[1],M.pick(w2[0],w2[1]));draw();});
    function isOpen(){return panel.style.display!=='none';}
    function open(on){panel.style.display=on?'flex':'none';if(timer){clearInterval(timer);timer=null;}
      if(on){draw();timer=setInterval(draw,1000/hz);}if(op.onToggle)op.onToggle(on);}
    function typing(t){if(!t)return false;var n=t.tagName;return t.isContentEditable||n==='TEXTAREA'||n==='SELECT'||
      (n==='INPUT'&&!/^(range|checkbox|radio|button|submit)$/i.test(t.type||''));}
    addEventListener('keydown',function(e){if(e.ctrlKey||e.metaKey||e.altKey||typing(e.target))return;
      if(e.key==='m'||e.key==='M')open(!isOpen());});
    return {el:panel,open:open,toggle:function(){open(!isOpen());},isOpen:isOpen,redraw:draw};
  }
  var create=root.KMAP.create;
  root.KMAP.create=function(o){var M=create(o);M.mount=function(op){return mount(M,op);};return M;};
  root.KMAP.mount=mount;
})(typeof window!=='undefined'?window:globalThis);
