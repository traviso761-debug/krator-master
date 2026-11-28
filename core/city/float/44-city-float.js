// ================================================================= CORE — floating pontoon & bascule gangway kinematics  [G data]
// Opt-in subfolder extension (`core/city/float/44-city-float.js`, zero reach on existing builds; portable to Godot 4.7.2).
// Keeps lot records in stable ward-local coordinates while computing world deck elevation `y(t)`, draft clearance above
// basin bed, paktong guide-pile collar margin, and hinged bascule gangway pitch angles across any tidal / surge state.
(function(root){
  'use strict';
  var K=(typeof KCITY!=='undefined')?KCITY:(root.KCITY=root.KCITY||{});
  if(K.floatPose)return;

  function d(v,x){return v==null?x:v;}

  K.floatPose=function(ward,lagoonY,opts){
    opts=opts||{};
    var fb=d(ward.freeboardM,2.2);
    var draft=d(ward.draftM,3.2);
    var bedY=d(ward.bedY,d(opts.bedY,-12.0));
    var pileTopY=d(ward.pileTopY,d(opts.pileTopY,26.0));
    var keelY=lagoonY-draft;
    var deckY=lagoonY+fb;
    var clearance=keelY-bedY;
    var grounded=clearance<=0;
    if(grounded){
      keelY=bedY;
      deckY=bedY+draft+fb;
      clearance=0;
    }
    var collarMargin=pileTopY-(deckY+0.2);
    return {
      id:ward.id,
      x:ward.x,
      z:ward.z,
      deckY:+deckY.toFixed(4),
      keelY:+keelY.toFixed(4),
      lagoonY:+lagoonY.toFixed(4),
      draftClearanceM:+clearance.toFixed(4),
      collarTopMarginM:+collarMargin.toFixed(4),
      grounded:grounded,
      collarSafe:collarMargin>=1.5
    };
  };

  K.basculePose=function(link,yA,yB){
    var span=Math.max(1.0,d(link.spanM,Math.hypot(d(link.x1,0)-d(link.x0,0),d(link.z1,0)-d(link.z0,0))));
    var dy=yB-yA;
    var ratio=Math.max(-0.98,Math.min(0.98,dy/span));
    var pitchRad=Math.asin(ratio);
    var pitchDeg=pitchRad*180/Math.PI;
    var maxDeg=d(link.maxPitchDeg,12.0);
    return {
      id:link.id,
      spanM:+span.toFixed(3),
      dyM:+dy.toFixed(4),
      pitchRad:+pitchRad.toFixed(5),
      pitchDeg:+pitchDeg.toFixed(3),
      midY:+((yA+yB)*0.5).toFixed(4),
      gangwayPitchOk:Math.abs(pitchDeg)<=maxDeg+1e-6
    };
  };

  K.auditFloatFleet=function(wards,links,lagoonY,fixedYMap,opts){
    var poses={},groundedCount=0,collarBad=0,minClear=Infinity,minMargin=Infinity;
    for(var i=0;i<wards.length;i++){
      var P=K.floatPose(wards[i],lagoonY,opts);
      poses[wards[i].id]=P;
      if(P.grounded)groundedCount++;
      if(!P.collarSafe)collarBad++;
      if(P.draftClearanceM<minClear)minClear=P.draftClearanceM;
      if(P.collarTopMarginM<minMargin)minMargin=P.collarTopMarginM;
    }
    var badPitch=0,maxAbsPitch=0,basc=[];
    for(var j=0;j<links.length;j++){
      var L=links[j];
      var y0=poses[L.from]?poses[L.from].deckY:(fixedYMap&&fixedYMap[L.from]!=null?fixedYMap[L.from]:lagoonY+2.2);
      var y1=poses[L.to]?poses[L.to].deckY:(fixedYMap&&fixedYMap[L.to]!=null?fixedYMap[L.to]:lagoonY+2.2);
      var B=K.basculePose(L,y0,y1);
      basc.push(B);
      var ap=Math.abs(B.pitchDeg);
      if(ap>maxAbsPitch)maxAbsPitch=ap;
      if(!B.gangwayPitchOk)badPitch++;
    }
    return {
      ok:groundedCount===0&&collarBad===0&&badPitch===0&&wards.length>0,
      wards:wards.length,
      groundedCount:groundedCount,
      collarBad:collarBad,
      badPitch:badPitch,
      minDraftClearanceM:+minClear.toFixed(3),
      minCollarMarginM:+minMargin.toFixed(3),
      maxAbsPitchDeg:+maxAbsPitch.toFixed(3),
      poses:poses,
      bascules:basc
    };
  };
})(typeof window!=='undefined'?window:globalThis);
