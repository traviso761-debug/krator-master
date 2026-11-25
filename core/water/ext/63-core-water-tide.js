// ================================================================= CORE — two-basin tidal weir & turbine head solver  [G data]
// Opt-in subfolder extension (`core/water/ext/63-core-water-tide.js`, zero reach on existing builds).
// Models a coastal or estuarine harbour divided by a tidal weir / sea-ring (`settlements/floating-city`, Suudme-Kuluuna,
// tidal mill-ponds) into an outer macrotidal basin `outer` and a regulated inner lagoon `lagoon` connected through
// reversible submarine turbine penstocks and sector locks.
// Pure [G data]: no THREE, no DOM, deterministic functions of world time `t` (seconds) or explicit preset mode.
(function(root){
  'use strict';
  var W=(typeof WATER!=='undefined')?WATER:(root.WATER=root.WATER||{});
  if(root.WATER!==W)root.WATER=W;
  if(W.tideBasins)return;

  function d(v,x){return v==null?x:v;}
  function clamp(v,a,b){return v<a?a:v>b?b:v;}

  var PRESETS={
    ebb:   {outerY:-5.2,outerVy:-0.00018,lagoonY:-1.8,lagoonVy:-0.00008,drawdown:false,surge:false,gatesShut:false,mode:'ebb'},
    slack: {outerY:-0.5,outerVy:0.00028, lagoonY:-0.7,lagoonVy:0.00010, drawdown:false,surge:false,gatesShut:false,mode:'slack'},
    flood: {outerY:5.6, outerVy:0.00014, lagoonY:2.2, lagoonVy:0.00007, drawdown:false,surge:false,gatesShut:false,mode:'flood'},
    surge: {outerY:8.2, outerVy:0.01200, lagoonY:4.4, lagoonVy:0.00180, drawdown:false,surge:true, gatesShut:true, mode:'surge'},
    drawdown:{outerY:-7.4,outerVy:-0.0065,lagoonY:-1.9,lagoonVy:-0.0002,drawdown:true, surge:false,gatesShut:true, mode:'drawdown'}
  };

  W.tideBasins=function(spec){
    spec=spec||{};
    var period=d(spec.period,86400);
    var ampOuter=d(spec.ampOuter,5.4);
    var riverSetup=d(spec.riverSetup,0.2);
    var lagoonMin=d(spec.lagoonMin,-1.8);
    var lagoonMax=d(spec.lagoonMax,2.2);
    var riverBoostHead=d(spec.riverBoostHead,1.85);
    var activeUnits=d(spec.activeUnits,8);
    var mwPerMetre=d(spec.mwPerMetre,5.6);
    var curMode=spec.mode||null;

    function sampleAt(t,overrideMode){
      var m=overrideMode===undefined?curMode:overrideMode;
      var oY,oVy,lY,lVy,draw=false,srg=false,shut=false;
      if(m&&PRESETS[m]){
        var P=PRESETS[m];
        oY=P.outerY;oVy=P.outerVy;lY=P.lagoonY;lVy=P.lagoonVy;
        draw=P.drawdown;srg=P.surge;shut=P.gatesShut;
      }else{
        var w=2*Math.PI/period,ph=w*d(t,0);
        var s=Math.sin(ph),c=Math.cos(ph);
        // 91-day Kauntu spring-neap beat (mild modulation around spring design)
        var beat=0.88+0.12*Math.cos(2*Math.PI*d(t,0)/(91*86400));
        oY=ampOuter*beat*s+riverSetup;
        oVy=ampOuter*beat*w*c;
        var lMid=0.5*(lagoonMin+lagoonMax),lHalf=0.5*(lagoonMax-lagoonMin);
        var phLag=ph-0.52;
        lY=clamp(lMid+lHalf*Math.sin(phLag),lagoonMin,lagoonMax);
        lVy=lHalf*w*Math.cos(phLag);
      }
      var rawDiff=oY-lY; // positive = flood inward, negative = ebb outward
      var netHead=Math.max(Math.abs(rawDiff),riverBoostHead);
      var dir=Math.abs(rawDiff)<0.35?0:(rawDiff>0?1:-1);
      var sluiceV=shut?0:(Math.abs(rawDiff)<0.95&&Math.abs(oY)<1.2?0.18*dir:clamp(rawDiff*0.86,-5.4,5.4));
      var lockOpen=!shut&&Math.abs(rawDiff)<=2.0;
      var mw=clamp(activeUnits*0.72*mwPerMetre*(netHead/5.6),18.4,42.0);
      return {
        mode:m||'clock',
        outerY:oY,outerVy:oVy,
        lagoonY:lY,lagoonVy:lVy,
        rawDiffM:rawDiff,
        headM:netHead,
        flowDir:dir,
        sluiceVelMs:sluiceV,
        lockOpen:lockOpen,
        gatesShut:shut,
        drawdown:draw,
        surge:srg,
        turbineMW:+mw.toFixed(2)
      };
    }

    return {
      setMode:function(m){curMode=m||null;return sampleAt(0);},
      getMode:function(){return curMode;},
      sample:sampleAt,
      tideY:function(basin,t){var S=sampleAt(t);return basin==='lagoon'?S.lagoonY:S.outerY;},
      tideHazardFn:function(basin){
        return function(t){
          var S=sampleAt(t);
          if(basin==='lagoon')return {y:S.lagoonY,vy:S.lagoonVy,vRace:S.sluiceVelMs*0.35,drawdown:false};
          return {y:S.outerY,vy:S.outerVy,vRace:S.sluiceVelMs,drawdown:S.drawdown};
        };
      },
      headM:function(t){return sampleAt(t).headM;},
      sluiceVelMs:function(t){return sampleAt(t).sluiceVelMs;},
      turbineMW:function(t){return sampleAt(t).turbineMW;}
    };
  };
})(typeof window!=='undefined'?window:globalThis);
