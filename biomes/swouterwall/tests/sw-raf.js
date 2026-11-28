// Software-GL (SwiftShader) init hook loaded via verify_page(init=...) only when !harness.is_gpu().
// 1. Sets window.__KRATOR_SW = true (skips 4x software MSAA and second-pass planar mirror under SwiftShader).
// 2. Paces requestAnimationFrame with setTimeout during page load so Image.onload and window.onload complete
//    in ~1-2 s instead of starving behind back-to-back software frames; verify.py then freezes RAF via __stopSwRAF().
(function(){
  window.__KRATOR_SW = true;
  var _r = window.requestAnimationFrame.bind(window);
  window.__origRAF = _r;
  window.__swStopped = false;
  window.__swTimer = 0;
  window.__frameFn = null;
  window.__drawNow = function(){
    return new Promise(function(res){
      _r(function(t){
        if (window.__frameFn) window.__frameFn(t);
        _r(function(){ res(); });
      });
    });
  };
  window.__stopSwRAF = function(){
    window.__swStopped = true;
    if (window.__swTimer) {
      clearTimeout(window.__swTimer);
      window.__swTimer = 0;
    }
  };
  window.requestAnimationFrame = function(cb){
    window.__frameFn = cb;
    if (window.__swStopped) return 0;
    window.__swTimer = setTimeout(function(){
      window.__swTimer = 0;
      if (!window.__swStopped) _r(cb);
    }, 4000);
    return window.__swTimer;
  };
})();
