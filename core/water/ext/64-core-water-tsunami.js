// ================================================================= CORE — tsunami wave-train & coastal run-up solver  [G data]
// Opt-in subfolder extension (core/water/ext/64-core-water-tsunami.js, zero reach on existing builds).
// Models two coastal tsunami regimes:
//   - 'seamount': volcanic/caldera-collapse or megathrust tsunami preceded by a seismic/eruption tremor phase;
//   - 'ghost': orphan teletsunami arriving without local ground shaking, betrayed only by rapid ocean drawdown.
// Supports both deterministic static phase presets ('calm', 'tremor', 'drawdown', 'bore', 'runup', 'backwash', 'seiche')
// for inspection / verification and continuous time progression ('live') from trigger(tNow) or periodic repeat.
// Pure [G data]: no THREE, no DOM, no randomness, deterministic functions of (x, z, t).
(function(root){
  'use strict';
  var W=(typeof WATER!=='undefined')?WATER:(root.WATER=root.WATER||{});
  if(root.WATER!==W)root.WATER=W;
  if(W.tsunami)return;
  if(!W.surfaces)W.surfaces=[];

  var VALID_REGIMES=['seamount','ghost'];
  var VALID_MODES=['calm','tremor','drawdown','bore','runup','backwash','seiche','live'];
  var TIMING_KEYS=['tremor','drawdown','bore','hold','backwash','seiche'];

  function d(v,x){return v==null?x:v;}
  function clamp(v,a,b){return v<a?a:v>b?b:v;}
  function sm(a,b,x){if(b<=a)return x<a?0:1;var t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);}
  function fmod(x,p){var u=x-p*Math.floor(x/p);if(u>=p)u-=p;return u;}
  function fin(v,what){if(typeof v!=='number'||!isFinite(v))throw new Error('WATER.tsunami: '+what+' must be a finite number');return v;}
  function pos(v,what){fin(v,what);if(!(v>0))throw new Error('WATER.tsunami: '+what+' must be > 0');return v;}

  W.tsunami=function(spec){
    spec=spec||{};
    var key=String(d(spec.key,'tsunami'));
    if(!key)throw new Error('WATER.tsunami: key must be a non-empty string');
    var name=String(d(spec.name,'Tsunami wave-train'));
    var regime=d(spec.regime,'seamount');
    if(VALID_REGIMES.indexOf(regime)<0)throw new Error('WATER.tsunami: regime must be "seamount" or "ghost"');

    var g=pos(d(spec.g,7.36),'g');

    var rawDir=spec.dir==null?[1,0]:spec.dir;
    if(!Array.isArray(rawDir)||rawDir.length!==2)throw new Error('WATER.tsunami: dir must be [dx, dz]');
    var dx=fin(rawDir[0],'dir[0]'),dz=fin(rawDir[1],'dir[1]');
    var dirLen=Math.hypot(dx,dz);
    if(!(dirLen>1e-9))throw new Error('WATER.tsunami: dir [dx, dz] cannot be zero');
    var ux=dx/dirLen,uz=dz/dirLen;

    var rawOrig=spec.shoreOrigin==null?[0,0]:spec.shoreOrigin;
    if(!Array.isArray(rawOrig)||rawOrig.length!==2)throw new Error('WATER.tsunami: shoreOrigin must be [x0, z0]');
    var x0=fin(rawOrig[0],'shoreOrigin[0]'),z0=fin(rawOrig[1],'shoreOrigin[1]');

    var seaLevelSpec=d(spec.seaLevel,0);
    if(typeof seaLevelSpec!=='function')fin(seaLevelSpec,'seaLevel');

    var shelfDepth=pos(d(spec.shelfDepth,40),'shelfDepth');
    var offshoreSlope=pos(d(spec.offshoreSlope,0.03),'offshoreSlope');
    var inlandSlope=pos(d(spec.inlandSlope,0.035),'inlandSlope');
    var bedFn=spec.bed==null?null:spec.bed;
    if(bedFn!=null&&typeof bedFn!=='function')throw new Error('WATER.tsunami: bed must be a function (x, z) -> y');

    var shelterFn=spec.shelterFn==null?null:spec.shelterFn;
    if(shelterFn!=null&&typeof shelterFn!=='function')throw new Error('WATER.tsunami: shelterFn must be a function (x, z) -> 0..1');

    var rawBounds=spec.bounds==null?[-2600,-2600,2600,2600]:spec.bounds;
    if(!Array.isArray(rawBounds)||rawBounds.length!==4)throw new Error('WATER.tsunami: bounds must be [x0, z0, x1, z1]');
    var bounds=[fin(rawBounds[0],'bounds[0]'),fin(rawBounds[1],'bounds[1]'),fin(rawBounds[2],'bounds[2]'),fin(rawBounds[3],'bounds[3]')];
    if(!(bounds[2]>bounds[0]&&bounds[3]>bounds[1]))throw new Error('WATER.tsunami: bounds require x1 > x0 and z1 > z0');

    var startS=fin(d(spec.startS,-650),'startS');
    if(!(startS<0))throw new Error('WATER.tsunami: startS must be < 0 (offshore)');
    var inlandReachM=pos(d(spec.inlandReachM,950),'inlandReachM');
    var frontWidthM=pos(d(spec.frontWidthM,28),'frontWidthM');
    var drawdownM=pos(d(spec.drawdownM,7.0),'drawdownM');
    var boreHeightM=pos(d(spec.boreHeightM,14.0),'boreHeightM');
    var runupMaxM=pos(d(spec.runupMaxM,28.0),'runupMaxM');
    var defaultSpeed=Math.sqrt(g*Math.max(4,boreHeightM*1.4));
    var boreSpeed=pos(d(spec.boreSpeed,defaultSpeed),'boreSpeed');

    var period=spec.period==null?null:pos(spec.period,'period');

    var rawTm=spec.timings||{};
    if(typeof rawTm!=='object'||Array.isArray(rawTm))throw new Error('WATER.tsunami: timings must be an object');
    for(var tk in rawTm)if(TIMING_KEYS.indexOf(tk)<0)throw new Error('WATER.tsunami: unknown timing key '+tk);
    var timings={
      tremor:regime==='ghost'?0:fin(d(rawTm.tremor,12),'timings.tremor'),
      drawdown:fin(d(rawTm.drawdown,26),'timings.drawdown'),
      bore:fin(d(rawTm.bore,38),'timings.bore'),
      hold:fin(d(rawTm.hold,14),'timings.hold'),
      backwash:fin(d(rawTm.backwash,42),'timings.backwash'),
      seiche:fin(d(rawTm.seiche,24),'timings.seiche')
    };
    if(regime==='ghost'&&rawTm.tremor!=null){
      var gt=fin(rawTm.tremor,'timings.tremor');
      if(gt<0)throw new Error('WATER.tsunami: timings.tremor must be >= 0');
      timings.tremor=0;
    }
    for(var ti=0;ti<TIMING_KEYS.length;ti++){
      var nm=TIMING_KEYS[ti];
      if(!(timings[nm]>=0))throw new Error('WATER.tsunami: timings.'+nm+' must be >= 0');
    }

    var curMode=d(spec.mode,'calm');
    if(VALID_MODES.indexOf(curMode)<0)throw new Error('WATER.tsunami: invalid mode "'+curMode+'"');

    var seed=(spec.seed==null?0x5453554e:fin(spec.seed,'seed'))>>>0;
    var t0=spec.t0!=null?fin(spec.t0,'t0'):((curMode==='live'||period!=null)?0:null);

    var t1=timings.tremor;
    var t2=t1+timings.drawdown;
    var t3=t2+timings.bore;
    var t4=t3+timings.hold;
    var t5=t4+timings.backwash;
    var t6=t5+timings.seiche;
    var pBorePreset=clamp((-startS+0.6*frontWidthM)/(inlandReachM-startS),0.1,0.9);

    function seaBaseAt(tVal){
      if(typeof seaLevelSpec==='function')return fin(+seaLevelSpec(tVal),'seaLevel(t)');
      return seaLevelSpec;
    }

    function project(x,z){
      var px=fin(+x,'x'),pz=fin(+z,'z');
      var rx=px-x0,rz=pz-z0;
      return {s:rx*ux+rz*uz,q:-rx*uz+rz*ux};
    }

    function bedAt(x,z){
      if(bedFn)return fin(+bedFn(x,z),'bed(x, z)');
      var s=(x-x0)*ux+(z-z0)*uz;
      return s<0?Math.max(-shelfDepth,s*offshoreSlope):s*inlandSlope;
    }

    function shelterAt(x,z){
      if(!shelterFn)return 1;
      return clamp(fin(+shelterFn(x,z),'shelterFn(x, z)'),0,1);
    }

    function contains(x,z){
      return x>=bounds[0]&&z>=bounds[1]&&x<=bounds[2]&&z<=bounds[3];
    }

    function stateAt(t){
      var tVal=t==null?0:fin(+t,'t');
      var seaBaseY=seaBaseAt(tVal);
      var phase='calm',p=0,elapsed=0;

      if(curMode!=='live'){
        if(curMode==='calm'){phase='calm';p=0;elapsed=0;}
        else if(curMode==='tremor'){phase='tremor';p=0.5;elapsed=0.5*timings.tremor;}
        else if(curMode==='drawdown'){phase='drawdown';p=0.85;elapsed=t1+0.85*timings.drawdown;}
        else if(curMode==='bore'){phase='bore';p=pBorePreset;elapsed=t2+pBorePreset*timings.bore;}
        else if(curMode==='runup'){phase='runup';p=0.5;elapsed=t3+0.5*timings.hold;}
        else if(curMode==='backwash'){phase='backwash';p=0.45;elapsed=t4+0.45*timings.backwash;}
        else if(curMode==='seiche'){phase='seiche';p=0.18;elapsed=t5+0.18*timings.seiche;}
      }else if(t0!=null||period!=null){
        var orig=t0==null?0:t0;
        var rawEl=tVal-orig;
        elapsed=period!=null?fmod(rawEl,period):rawEl;
        if(elapsed<0||elapsed>=t6||t6<=0){
          phase='calm';p=0;
        }else if(timings.tremor>0&&elapsed<t1){
          phase='tremor';p=elapsed/timings.tremor;
        }else if(timings.drawdown>0&&elapsed<t2){
          phase='drawdown';p=(elapsed-t1)/timings.drawdown;
        }else if(timings.bore>0&&elapsed<t3){
          phase='bore';p=(elapsed-t2)/timings.bore;
        }else if(timings.hold>0&&elapsed<t4){
          phase='runup';p=(elapsed-t3)/timings.hold;
        }else if(timings.backwash>0&&elapsed<t5){
          phase='backwash';p=(elapsed-t4)/timings.backwash;
        }else if(timings.seiche>0&&elapsed<t6){
          phase='seiche';p=(elapsed-t5)/timings.seiche;
        }
      }

      p=clamp(p,0,1);
      var tremorAmp=(regime==='seamount'&&phase==='tremor')?(0.25+0.75*Math.sin(Math.PI*p)):0;
      var seaOffsetM=0,boreS=startS,curBoreH=0,runupEnvY=seaBaseY;

      if(phase==='tremor'){
        seaOffsetM=0;
        boreS=startS;
        curBoreH=0;
        runupEnvY=seaBaseY;
      }else if(phase==='drawdown'){
        seaOffsetM=-drawdownM*sm(0,0.85,p);
        boreS=startS;
        curBoreH=0;
        runupEnvY=seaBaseY+seaOffsetM;
      }else if(phase==='bore'){
        seaOffsetM=-drawdownM*(1-p)+0.35*boreHeightM*sm(0.25,1,p);
        boreS=startS+(inlandReachM-startS)*p;
        curBoreH=boreHeightM*(1-0.25*sm(0.75,1,p));
        runupEnvY=seaBaseY+boreHeightM+(runupMaxM-boreHeightM)*sm(0,inlandReachM,Math.max(0,boreS));
      }else if(phase==='runup'){
        seaOffsetM=0.35*boreHeightM*(1-0.35*p);
        boreS=inlandReachM;
        curBoreH=0.25*boreHeightM*(1-sm(0,1,p));
        runupEnvY=seaBaseY+runupMaxM*(1-0.12*sm(0.65,1,p));
      }else if(phase==='backwash'){
        seaOffsetM=0.2275*boreHeightM*(1-sm(0,0.45,p))-0.15*drawdownM*sm(0.25,0.75,p)*(1-sm(0.75,1,p));
        boreS=inlandReachM*(1-sm(0,1,p));
        curBoreH=0;
        runupEnvY=seaBaseY+runupMaxM*0.88*(1-sm(0.35,0.98,p));
      }else if(phase==='seiche'){
        var sDecay=Math.exp(-3.2*p)*(1-sm(0.85,1,p));
        seaOffsetM=0.18*boreHeightM*sDecay*Math.sin(3*Math.PI*p);
        boreS=0;
        curBoreH=0;
        runupEnvY=seaBaseY+Math.max(0,seaOffsetM);
      }

      var seaY=seaBaseY+seaOffsetM;
      var warn=phase==='tremor'||phase==='drawdown'||phase==='bore';
      var active=phase!=='calm';

      return {
        mode:curMode,
        phase:phase,
        elapsed:elapsed,
        phaseProgress:p,
        seaBaseY:seaBaseY,
        seaOffsetM:seaOffsetM,
        seaY:seaY,
        boreS:boreS,
        boreHeightM:curBoreH,
        runupEnvelopeY:runupEnvY,
        tremorAmp:tremorAmp,
        warn:warn,
        active:active
      };
    }

    function sample(x,z,t){
      var px=fin(+x,'x'),pz=fin(+z,'z');
      var st=stateAt(t);
      var phase=st.phase,p=st.phaseProgress,seaBaseY=st.seaBaseY;
      var rx=px-x0,rz=pz-z0;
      var s=rx*ux+rz*uz;
      var q=-rx*uz+rz*ux;
      var groundY=bedAt(px,pz);
      var shelter=shelterAt(px,pz);
      var trimY=seaBaseY+runupMaxM*shelter;
      var safeRefuge=groundY>=trimY;

      var level=seaBaseY,depth=0,wet=false,vAlong=0,vCross=0,boreFront=0,foam=0;

      if(phase==='calm'||phase==='tremor'){
        level=seaBaseY;
        var dCalm=level-groundY;
        wet=!safeRefuge&&dCalm>0;
        depth=wet?dCalm:0;
        vAlong=(phase==='tremor'&&wet)?(0.18*st.tremorAmp*shelter):0;
        foam=(phase==='tremor'&&wet)?clamp(0.08*st.tremorAmp*shelter,0,1):0;
      }else if(phase==='drawdown'){
        var ddK=sm(0,0.85,p);
        level=seaBaseY-drawdownM*shelter*ddK;
        var dDraw=level-groundY;
        wet=!safeRefuge&&dDraw>0;
        depth=wet?dDraw:0;
        var drawVelK=0.45+0.55*sm(0,0.5,p)*(1-0.3*sm(0.85,1,p));
        var shoalK=clamp(1.15-0.35*clamp(depth/25,0,1),0.5,1.15);
        vAlong=wet?(-Math.sqrt(g*drawdownM)*0.65*shelter*drawVelK*shoalK):0;
        foam=wet?clamp(0.18*ddK*sm(4,0.2,depth),0,1):0;
      }else if(phase==='bore'){
        var bS=st.boreS;
        var troughY=seaBaseY-drawdownM*shelter*(1-p);
        if(s>bS){
          level=troughY;
          var dAhead=level-groundY;
          wet=!safeRefuge&&s<=inlandReachM&&dAhead>0;
          depth=wet?dAhead:0;
          vAlong=wet?(-Math.sqrt(g*drawdownM)*0.45*shelter*(1-p)):0;
          foam=wet?clamp(0.15*sm(3,0.2,depth),0,1):0;
        }else{
          var distBehind=bS-s;
          var frontRise=0.25+0.75*sm(0,frontWidthM*0.55,distBehind);
          var frontShape=1-sm(frontWidthM*0.35,frontWidthM*1.6,distBehind);
          var rawBoreFront=frontShape*shelter;
          if(s<=0){
            var crestY=seaBaseY+boreHeightM*shelter*(0.82+0.18*frontShape);
            var surfOff=Math.min(troughY+(crestY-troughY)*frontRise,trimY);
            var dOff=surfOff-groundY;
            wet=!safeRefuge&&dOff>0;
            depth=wet?dOff:0;
            level=wet?surfOff:Math.max(groundY,troughY);
          }else{
            var inlandFrac=clamp(s/inlandReachM,0,1);
            var elevFrac=shelter>1e-6?clamp((groundY-seaBaseY)/(runupMaxM*shelter),0,1):1;
            var climbFrac=Math.max(sm(0,0.75,inlandFrac),elevFrac);
            var baseCrest=Math.min(boreHeightM,runupMaxM);
            var surgeAbove=(baseCrest+(runupMaxM-baseCrest)*climbFrac)*shelter;
            var reachK=s<=inlandReachM?(1-sm(0.88,1,inlandFrac)):0;
            var maxD=Math.max(0,trimY-groundY)*reachK*frontRise;
            var envD=Math.max(0,(seaBaseY+surgeAbove)-groundY)*reachK*frontRise;
            var dIn=Math.min(maxD,envD);
            wet=!safeRefuge&&s<inlandReachM&&dIn>0;
            depth=wet?dIn:0;
            level=wet?(groundY+depth):Math.max(groundY,seaBaseY);
          }
          boreFront=wet?rawBoreFront:0;
          var inlandDecay=s>0?(1-0.45*clamp(s/inlandReachM,0,1)):1;
          var frontBoost=0.65+0.35*frontShape;
          var depthScale=clamp(sm(0,0.35,depth),0.25,1);
          vAlong=wet?(boreSpeed*shelter*frontBoost*inlandDecay*depthScale):0;
          foam=wet?clamp(0.25+0.75*boreFront+0.35*sm(2.5,0.15,depth),0,1):0;
        }
      }else if(phase==='runup'){
        var holdEnvK=1-0.12*sm(0.65,1,p);
        var surfRun=seaBaseY;
        if(s>=0){
          var inFracR=clamp(s/inlandReachM,0,1);
          var reachCut=s<=inlandReachM?(1-sm(0.92,1,inFracR)):0;
          surfRun=seaBaseY+runupMaxM*shelter*(1-0.35*inFracR)*holdEnvK*reachCut;
        }else{
          var qArg=(s-0.45*startS)/120;
          var secCrest=0.28*boreHeightM*shelter*Math.exp(-(qArg*qArg));
          var offY=seaBaseY+st.seaOffsetM*shelter+secCrest;
          var pileY=seaBaseY+runupMaxM*shelter*holdEnvK;
          surfRun=offY+(pileY-offY)*sm(startS*0.45,0,s);
        }
        surfRun=Math.min(surfRun,trimY);
        var dRun=surfRun-groundY;
        wet=!safeRefuge&&s<=inlandReachM&&dRun>0;
        depth=wet?dRun:0;
        level=wet?surfRun:Math.max(groundY,seaBaseY);
        vAlong=wet?(boreSpeed*0.28*shelter*(1-1.15*p)):0;
        vCross=wet?(boreSpeed*0.08*shelter*Math.sin(q*0.025+p*3)):0;
        foam=wet?clamp(0.32*(1-0.3*p)+0.4*sm(2,0.1,depth),0,1):0;
      }else if(phase==='backwash'){
        var retreatAbove=runupMaxM*shelter*(1-sm(0.35,0.98,p));
        var drainTail=1-sm(0.82,1,p);
        if(s>=0){
          var inFracB=clamp(s/inlandReachM,0,1);
          var sheetTop=seaBaseY+retreatAbove*(1-0.25*inFracB);
          var wedgeD=(s<=inlandReachM&&!safeRefuge)?Math.max(0,sheetTop-groundY):0;
          var remElev=shelter>1e-6?clamp(wedgeD/(runupMaxM*shelter),0,1):0;
          var sheetD=(0.45+3.85*Math.pow(remElev,0.75))*shelter*drainTail;
          var earlyD=Math.min(wedgeD,4.5*shelter+0.35*wedgeD);
          var lateD=Math.min(wedgeD,sheetD);
          var dBack=earlyD+(lateD-earlyD)*sm(0,0.25,p);
          wet=!safeRefuge&&s<=inlandReachM&&dBack>0;
          depth=wet?dBack:0;
          level=wet?(groundY+depth):Math.max(groundY,seaBaseY);
        }else{
          var shoreSheetY=seaBaseY+Math.min(retreatAbove,4.3*shelter*drainTail);
          var offBackY=seaBaseY+st.seaOffsetM*shelter;
          var surfBack=Math.min(offBackY+(shoreSheetY-offBackY)*sm(-180,0,s),trimY);
          var dBackOff=surfBack-groundY;
          wet=!safeRefuge&&dBackOff>0;
          depth=wet?dBackOff:0;
          level=wet?surfBack:Math.max(groundY,offBackY);
        }
        var vBack=boreSpeed*0.78*shelter*(0.35+0.65*Math.sin(Math.PI*clamp(p,0.08,0.92)));
        vAlong=wet?-vBack:0;
        foam=wet?clamp(0.45*Math.sin(Math.PI*clamp(p,0.05,0.95))+0.25*sm(2.5,0.2,depth),0,1):0;
      }else if(phase==='seiche'){
        var decay=Math.exp(-3.2*p)*(1-sm(0.85,1,p));
        var seicheOff=0.18*boreHeightM*shelter*decay*Math.sin(3*Math.PI*p);
        var surfSeiche=Math.min(seaBaseY+seicheOff,trimY);
        var dSeiche=surfSeiche-groundY;
        wet=!safeRefuge&&s<=inlandReachM&&dSeiche>0;
        depth=wet?dSeiche:0;
        level=surfSeiche;
        vAlong=wet?(boreSpeed*0.22*shelter*decay*Math.cos(3*Math.PI*p)):0;
        foam=wet?clamp(0.22*decay*sm(2.5,0.1,depth),0,1):0;
      }

      var vx=vAlong*ux-vCross*uz;
      var vz=vAlong*uz+vCross*ux;
      var speed=Math.hypot(vx,vz);
      var momentumFlux=wet?(depth*speed*speed):0;
      var exposedShelf=(groundY<seaBaseY)&&!wet;

      return {
        phase:phase,
        s:s,
        q:q,
        groundY:groundY,
        level:level,
        depth:depth,
        wet:wet,
        vx:vx,
        vz:vz,
        speed:speed,
        momentumFlux:momentumFlux,
        boreFront:boreFront,
        foam:foam,
        exposedShelf:exposedShelf,
        safeRefuge:safeRefuge
      };
    }

    var TS={
      kind:'tsunami',
      key:key,
      name:name,
      regime:regime,
      g:g,
      dir:[ux,uz],
      shoreOrigin:[x0,z0],
      bounds:bounds.slice(),
      startS:startS,
      inlandReachM:inlandReachM,
      frontWidthM:frontWidthM,
      drawdownM:drawdownM,
      boreHeightM:boreHeightM,
      runupMaxM:runupMaxM,
      trimlineM:runupMaxM,
      boreSpeed:boreSpeed,
      period:period,
      timings:{
        tremor:timings.tremor,
        drawdown:timings.drawdown,
        bore:timings.bore,
        hold:timings.hold,
        backwash:timings.backwash,
        seiche:timings.seiche
      },
      seed:seed,
      setMode:function(m){
        if(VALID_MODES.indexOf(m)<0)throw new Error('WATER.tsunami.setMode: invalid mode "'+m+'"');
        curMode=m;
        if(m==='live'&&t0==null)t0=0;
        return stateAt(t0==null?0:t0);
      },
      getMode:function(){return curMode;},
      trigger:function(tNow){
        var tn=tNow==null?0:fin(+tNow,'tNow');
        t0=tn;
        curMode='live';
        return stateAt(tn);
      },
      project:project,
      bedAt:bedAt,
      shelterAt:shelterAt,
      contains:contains,
      stateAt:stateAt,
      levelAt:function(t){
        var st=stateAt(t);
        return st.phase==='calm'?-1e9:st.runupEnvelopeY;
      },
      sample:sample,
      heightAt:function(x,z,t){
        var sp=sample(x,z,t);
        return sp.wet?sp.level:null;
      },
      flowAt:function(x,z,t){
        var sp=sample(x,z,t);
        return sp.wet?[sp.vx,sp.vz,sp.speed,0]:[0,0,0,0];
      },
      hazardFn:function(){
        return function(x,z,t){
          var st=stateAt(t);
          var sp=sample(x,z,t);
          return {
            phase:sp.phase,
            s:sp.s,
            q:sp.q,
            groundY:sp.groundY,
            level:sp.level,
            depth:sp.depth,
            wet:sp.wet,
            vx:sp.vx,
            vz:sp.vz,
            speed:sp.speed,
            momentumFlux:sp.momentumFlux,
            boreFront:sp.boreFront,
            foam:sp.foam,
            exposedShelf:sp.exposedShelf,
            safeRefuge:sp.safeRefuge,
            seaBaseY:st.seaBaseY,
            seaY:st.seaY,
            boreS:st.boreS,
            trimlineM:runupMaxM,
            tremorAmp:st.tremorAmp,
            warn:st.warn,
            active:st.active
          };
        };
      },
      hazardRecord:function(opts){
        opts=opts||{};
        var cx=(bounds[0]+bounds[2])*0.5,cz=(bounds[1]+bounds[3])*0.5;
        var at=opts.at?[fin(+opts.at[0],'at[0]'),fin(+opts.at[1],'at[1]'),fin(+opts.at[2],'at[2]')]:[cx,0,cz];
        var hSpan=d(opts.h,runupMaxM+drawdownM+24);
        var areaSpec=opts.area!=null?opts.area:{w:bounds[2]-bounds[0],d:bounds[3]-bounds[1],h:hSpan};
        var zoneOpts={
          key:d(opts.key,key),
          trimlineM:d(opts.trimlineM,runupMaxM),
          fullDepth:d(opts.fullDepth,1.4),
          fluxLethal:d(opts.fluxLethal,18.0),
          h:hSpan,
          y0:d(opts.y0,-drawdownM-12),
          y1:d(opts.y1,hSpan)
        };
        if(opts.kind!=null)zoneOpts.kind=opts.kind;
        if(opts.danger!=null)zoneOpts.danger=opts.danger;
        if(opts.dose!=null)zoneOpts.dose=opts.dose;
        if(opts.falloff!=null)zoneOpts.falloff=opts.falloff;
        var haz=null;
        if(root.KHAZ&&root.KHAZ.TSUNAMI&&typeof root.KHAZ.TSUNAMI.zone==='function'){
          haz=root.KHAZ.TSUNAMI.zone(areaSpec,zoneOpts);
        }else{
          var sh=Array.isArray(areaSpec)?{type:'poly',pts:areaSpec,h:hSpan,y0:zoneOpts.y0,y1:zoneOpts.y1,edge:2}:
            (typeof areaSpec==='number'?{type:'cyl',r:areaSpec,h:hSpan,y0:zoneOpts.y0,y1:zoneOpts.y1}:
            {type:'box',w:areaSpec.w,d:areaSpec.d,h:d(areaSpec.h,hSpan),y0:zoneOpts.y0,y1:zoneOpts.y1});
          haz={
            kind:d(opts.kind,'drown'),
            effect:'drown',
            danger:d(opts.danger,0.95),
            dose:d(opts.dose,0.85),
            falloff:d(opts.falloff,'none'),
            stateFn:'KHAZ.tsunami',
            tsunami:{
              key:zoneOpts.key,
              trimlineM:zoneOpts.trimlineM,
              fullDepth:zoneOpts.fullDepth,
              fluxLethal:zoneOpts.fluxLethal
            },
            shape:sh,
            move:{speed:0.35,slip:0.45},
            nav:{travel:3,enter:8,avoid:false},
            tell:{colour:'#1b7ea8',fx:'foam',sound:'roar',sign:'tsunami run-up trimline, salt-bleached wrack and refuge stairs'},
            seed:key
          };
        }
        return {
          id:opts.id!=null?String(opts.id):('tsunami:'+key),
          at:at,
          ry:0,
          tags:{hazard:haz}
        };
      }
    };

    TS.id=W.surfaces.length;
    W.surfaces.push(TS);
    return TS;
  };

  function tsunamis(){
    return W.surfaces.filter(function(S){return S&&S.kind==='tsunami';});
  }

  var at0=W.at;
  W.at=function(x,z,t){
    var b=at0?at0(x,z,t):null;
    var list=tsunamis();
    if(!list.length)return b;
    var best=b,hb=b&&typeof b.heightAt==='function'?b.heightAt(x,z,t):null;
    for(var i=0;i<list.length;i++){
      var S=list[i];
      if(t==null&&S.getMode()==='live')continue;
      var st=S.stateAt(t);
      if(st.phase==='calm')continue;
      if(!S.contains(x,z))continue;
      var h=S.heightAt(x,z,t);
      if(h!=null&&(hb==null||h>=hb)){best=S;hb=h;}
    }
    return best;
  };

  var h0=W.heightAt;
  W.heightAt=function(x,z,t){
    var h=h0?h0(x,z,t):null;
    var list=tsunamis();
    if(!list.length)return h;
    for(var i=0;i<list.length;i++){
      var S=list[i];
      if(t==null&&S.getMode()==='live')continue;
      var st=S.stateAt(t);
      if(st.phase==='calm')continue;
      if(!S.contains(x,z))continue;
      var v=S.heightAt(x,z,t);
      if(v!=null&&(h==null||v>h))h=v;
    }
    return h;
  };

  var ex0=W.export;
  if(ex0){
    W.export=function(){
      var X=ex0();
      if(X&&Array.isArray(X.surfaces)){
        X.surfaces.forEach(function(o,i){
          var S=W.surfaces[i];
          if(S&&S.kind==='tsunami'){
            Object.assign(o,{
              key:S.key,
              regime:S.regime,
              g:S.g,
              dir:S.dir.slice(),
              shoreOrigin:S.shoreOrigin.slice(),
              bounds:S.bounds.slice(),
              startS:S.startS,
              inlandReachM:S.inlandReachM,
              frontWidthM:S.frontWidthM,
              drawdownM:S.drawdownM,
              boreHeightM:S.boreHeightM,
              runupMaxM:S.runupMaxM,
              trimlineM:S.trimlineM,
              boreSpeed:S.boreSpeed,
              period:S.period,
              timings:Object.assign({},S.timings),
              mode:S.getMode(),
              seed:S.seed,
              law:'KHAZ.tsunami: seamount/ghost wave-train (core/water/ext/64-core-water-tsunami.js; twin KratorTsunami)'
            });
          }
        });
      }
      return X;
    };
  }

  if(W.fields){
    var fields0=W.fields;
    W.fields=function(o){
      o=o||{};
      var base=o.surfaces||W.surfaces;
      var filtered=base.filter(function(S){return S&&S.kind!=='tsunami';});
      return fields0(Object.assign({},o,{surfaces:filtered}));
    };
  }

  if(W.audit){
    var audit0=W.audit;
    W.audit=function(o){
      o=o||{};
      var orig=W.surfaces;
      W.surfaces=orig.filter(function(S){return S&&S.kind!=='tsunami';});
      try{
        var runSurf=o.surfaces?o.surfaces.filter(function(S){return S&&S.kind!=='tsunami';}):W.surfaces;
        return audit0(Object.assign({},o,{surfaces:runSurf}));
      }finally{
        W.surfaces=orig;
      }
    };
  }
})(typeof globalThis!=='undefined'?globalThis:this);
