// ================================================================= CORE — live two-basin tidal surface updater  [web]
// Browser companion to core/water/ext/63-core-water-tide.js. Updates registered outer-sound and inner-lagoon water
// meshes and wtrLevel shader uniforms when the world clock advances or _api.setTideState(mode) switches presets.
(function(root){
  'use strict';
  var W=(typeof WATER!=='undefined')?WATER:(root.WATER=root.WATER||{});
  if(root.WATER!==W)root.WATER=W;
  if(W.bindTideMeshes)return;

  W.bindTideMeshes=function(tideCtrl,groups){
    groups=groups||{};
    var outerList=groups.outer||[];
    var lagoonList=groups.lagoon||[];

    function applyList(list,y){
      for(var i=0;i<list.length;i++){
        var m=list[i];
        if(!m)continue;
        var baseOff=(m.userData&&m.userData.tideOffsetY!=null)?m.userData.tideOffsetY:0;
        m.position.y=y+baseOff;
        m.updateMatrixWorld(true);
        var mat=m.material;
        if(mat&&mat.uniforms&&mat.uniforms.wtrLevel){
          mat.uniforms.wtrLevel.value=y+baseOff;
        }
      }
    }

    return {
      update:function(t){
        var S=tideCtrl.sample(t);
        applyList(outerList,S.outerY);
        applyList(lagoonList,S.lagoonY);
        return S;
      }
    };
  };
})(typeof window!=='undefined'?window:globalThis);
