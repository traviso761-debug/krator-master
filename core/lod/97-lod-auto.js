// ================================================================= LOD: take over the finished scene (core/lod)
// Sorts after every build's scene, camera and frame loop, and before 99-tail. It reads the build's `scene`, `camera`
// and `renderer` (every Krator build names them so) and the build's options from window.LOD_OPTIONS, if it set any.
// A build that calls LOD.init itself (LOD.root already made) is left alone; so is one that sets LOD_OPTIONS=false.
(function(){
 if(typeof LOD==='undefined'||LOD.root)return;
 const opt=(typeof window.LOD_OPTIONS==='undefined')?{}:window.LOD_OPTIONS;if(opt===false)return;
 try{LOD.init(Object.assign({THREE,scene,camera,renderer},opt));window._lod=LOD.apply();}
 catch(e){const m='LOD: '+(e&&e.stack||e);if(typeof reportErr==='function')reportErr(m);else if(typeof ERR==='function')ERR(m);else console.error(m);}
})();
