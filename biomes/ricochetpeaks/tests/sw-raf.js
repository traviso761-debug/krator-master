// Manual-step requestAnimationFrame helper for software WebGL (SwiftShader) verification in verify.py.
// Runs Frame 0 synchronously inside KHOST.take to set window._ready, then holds subsequent frames until
// window._texPending === 0 and verify.py calls window.__drawNow(), preventing continuous background
// 1280x800 software rasterization from starving image decode and window.onload.
(function(){
 if(window.__origRAF)return;
 var orig=window.__origRAF=window.requestAnimationFrame.bind(window);
 window.__frameFn=null;
 window.requestAnimationFrame=function(cb){window.__frameFn=cb;return 1;};
 window.__drawNow=function(){
  return new Promise(function(res){
   orig(function(t){
    if(window.__frameFn)window.__frameFn(t);
    orig(function(){res();});
   });
  });
 };
})();
