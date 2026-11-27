// ================================================================= CORE — tsunami wave-train 3D draw & UI companion  [draw]
// Browser / Three.js companion to core/water/ext/64-core-water-tsunami.js (WATER.drawTsunami, WATER.mountTsunamiUI).
// Draws four coordinated elements with zero extra texture files and zero custom shader samplers (pure vertex-colored
// MeshStandardMaterial & MeshBasicMaterial so linked sampler count stays minimal):
//   1. Drawdown on seaMesh (seaMesh.position.y = st.seaY and wtrLevel uniform when active; restored to baseSeaY in 'calm');
//   2. 3D curling breaking bore wall (boreMesh) along s = st.boreS during 'bore';
//   3. Terrain-conforming overland run-up & backwash sheet (surgeMesh) folding 1.5 m under groundY where dry;
//   4. Rising surf spray & seamount caldera base-surge mist curtain (mistGroup).
(function(root){
  'use strict';
  var W=(typeof WATER!=='undefined')?WATER:(root.WATER=root.WATER||{});
  if(root.WATER!==W)root.WATER=W;
  if(!W.tsunami)throw new Error('64b-core-water-tsunami-draw: load core/water/ext/64-core-water-tsunami.js first');
  if(W.drawTsunami)return;

  function d(v,x){return v==null?x:v;}
  function clamp(v,a,b){return v<a?a:v>b?b:v;}
  function lerp(a,b,t){return a+(b-a)*t;}
  function noop(){}

  function getAtmos(){
    try{return typeof ATMOS!=='undefined'?ATMOS:null;}catch(e){return null;}
  }

  /* Pure integer hash (zero Math.random, zero Math.sin hash) -> [0, 1) */
  function hash01(seed,idx,salt){
    var h=((seed>>>0)^Math.imul((idx+1)>>>0,0x9e3779b1)^Math.imul((salt+1)>>>0,0x85ebca6b))>>>0;
    h=Math.imul(h^(h>>>16),0x7feb352d)>>>0;
    h=Math.imul(h^(h>>>15),0x846ca68b)>>>0;
    h=(h^(h>>>16))>>>0;
    return h/4294967296;
  }

  function tagHostObj(obj,label){
    if(!obj)return obj;
    obj.userData=obj.userData||{};
    obj.userData.host=true;
    obj.userData.probeSkip=true;
    obj.userData.lodSkip=true;
    obj.userData.inspectLabel=label;
    obj.raycast=noop;
    return obj;
  }

  function worldXZ(TS,s,q){
    var o=TS.shoreOrigin,u=TS.dir;
    return [o[0]+s*u[0]-q*u[1],o[1]+s*u[1]+q*u[0]];
  }

  function qBoundsOf(TS,opts){
    if(opts.qMin!=null&&opts.qMax!=null)return [opts.qMin,opts.qMax];
    if(opts.width!=null){var hw=opts.width*0.5;return [-hw,hw];}
    var B=TS.bounds;
    var corners=[
      TS.project(B[0],B[1]).q,
      TS.project(B[2],B[1]).q,
      TS.project(B[2],B[3]).q,
      TS.project(B[0],B[3]).q
    ];
    var q0=Math.min(corners[0],corners[1],corners[2],corners[3]);
    var q1=Math.max(corners[0],corners[1],corners[2],corners[3]);
    var spanLimit=d(opts.maxQSpan,2600);
    if(q1-q0>spanLimit){
      var mid=(q0+q1)*0.5;
      q0=mid-spanLimit*0.5;
      q1=mid+spanLimit*0.5;
    }
    return [q0,q1];
  }

  /* 9-row curling breaking bore cross-section: [dsFactorOfFrontWidth, heightFraction, foamBase] */
  var CURL_PROFILE=[
    [-1.35,0.34,0.04],
    [-0.85,0.66,0.10],
    [-0.42,0.90,0.26],
    [-0.12,1.00,0.72],
    [ 0.10,0.96,0.94],
    [ 0.22,0.78,1.00],
    [ 0.14,0.50,0.18],
    [ 0.08,0.22,0.76],
    [ 0.26,0.00,0.88]
  ];

  function buildPuffGeometry(T){
    var segs=10;
    var pos=[0,0.35,0];
    var col=[0.36,0.41,0.43];
    var nrm=[0,1,0];
    var idx=[];
    var r1=0.55,r2=1.0;
    var i;
    for(i=0;i<segs;i++){
      var a1=(i/segs)*Math.PI*2;
      pos.push(Math.cos(a1)*r1,0.18,Math.sin(a1)*r1);
      col.push(0.30,0.36,0.39);
      nrm.push(Math.cos(a1)*0.4,0.9,Math.sin(a1)*0.4);
    }
    for(i=0;i<segs;i++){
      var a2=(i/segs)*Math.PI*2;
      pos.push(Math.cos(a2)*r2,-0.12,Math.sin(a2)*r2);
      col.push(0.21,0.28,0.31);
      nrm.push(Math.cos(a2)*0.7,0.7,Math.sin(a2)*0.7);
    }
    for(i=0;i<segs;i++){
      var ni=(i+1)%segs;
      idx.push(0,1+i,1+ni);
      var innerA=1+i,innerB=1+ni;
      var outerA=1+segs+i,outerB=1+segs+ni;
      idx.push(innerA,outerA,innerB,innerB,outerA,outerB);
    }
    var g=new T.BufferGeometry();
    g.setAttribute('position',new T.Float32BufferAttribute(pos,3));
    g.setAttribute('color',new T.Float32BufferAttribute(col,3));
    g.setAttribute('normal',new T.Float32BufferAttribute(nrm,3));
    g.setIndex(idx);
    if(g.computeBoundingSphere)g.computeBoundingSphere();
    return g;
  }

  W.drawTsunami=function(TS,opts){
    opts=opts||{};
    if(!TS||TS.kind!=='tsunami')throw new Error('WATER.drawTsunami: expected a WATER.tsunami instance');
    var A=getAtmos();
    var T=opts.THREE||(typeof THREE!=='undefined'?THREE:(A&&A.T));
    if(!T)throw new Error('WATER.drawTsunami: pass opts.THREE or load THREE');
    var scene=opts.scene||(A&&A.h&&A.h.scene)||null;

    /* Collect seaMesh / seaMeshes and record resting baseSeaY + base wtrLevel */
    var rawSea=[];
    if(opts.seaMesh)rawSea.push(opts.seaMesh);
    if(Array.isArray(opts.seaMeshes)){
      for(var si=0;si<opts.seaMeshes.length;si++)if(opts.seaMeshes[si])rawSea.push(opts.seaMeshes[si]);
    }
    var seaRecords=rawSea.map(function(m){
      var yRest=opts.baseSeaY!=null?opts.baseSeaY:(m.position&&m.position.y!=null?m.position.y:0);
      var uLvl=(m.material&&m.material.uniforms&&m.material.uniforms.wtrLevel)?m.material.uniforms.wtrLevel:null;
      var uRest=uLvl!=null?uLvl.value:yRest;
      return {mesh:m,baseY:yRest,uLvl:uLvl,baseU:uRest};
    });
    var baseSeaY=seaRecords.length?seaRecords[0].baseY:(opts.baseSeaY!=null?opts.baseSeaY:TS.stateAt(0).seaBaseY);

    var qLim=qBoundsOf(TS,opts);
    var qMin=qLim[0],qMax=qLim[1];
    var sMin=d(opts.sMin,Math.max(TS.startS,-420));
    var sMax=d(opts.sMax,TS.inlandReachM);
    var cell=Math.max(2,d(opts.cell,18));
    var sinkDepth=d(opts.sink,1.5);

    /* ---- 1. Terrain-conforming overland run-up & backwash sheet (surgeMesh) ---- */
    var maxRows=d(opts.maxRows,110),maxCols=d(opts.maxCols,140);
    var nS=clamp(Math.ceil((sMax-sMin)/cell),4,maxRows);
    var nQ=clamp(Math.ceil((qMax-qMin)/cell),4,maxCols);
    var surgeVerts=(nS+1)*(nQ+1);
    var surgePos=new Float32Array(surgeVerts*3);
    var surgeCol=new Float32Array(surgeVerts*3);
    var surgeNrm=new Float32Array(surgeVerts*3);
    var surgeX=new Float32Array(surgeVerts);
    var surgeZ=new Float32Array(surgeVerts);
    var surgeGround=new Float32Array(surgeVerts);
    var surgeIdx=[];

    var vi=0,ri,ci;
    for(ri=0;ri<=nS;ri++){
      var sv=sMin+(sMax-sMin)*(ri/nS);
      for(ci=0;ci<=nQ;ci++){
        var qv=qMin+(qMax-qMin)*(ci/nQ);
        var xz=worldXZ(TS,sv,qv);
        var gy=TS.bedAt(xz[0],xz[1]);
        surgeX[vi]=xz[0];
        surgeZ[vi]=xz[1];
        surgeGround[vi]=gy;
        surgePos[vi*3]=xz[0];
        surgePos[vi*3+1]=gy-sinkDepth;
        surgePos[vi*3+2]=xz[1];
        surgeCol[vi*3]=0.08;
        surgeCol[vi*3+1]=0.42;
        surgeCol[vi*3+2]=0.52;
        surgeNrm[vi*3]=0;
        surgeNrm[vi*3+1]=1;
        surgeNrm[vi*3+2]=0;
        vi++;
      }
    }
    for(ri=0;ri<nS;ri++){
      for(ci=0;ci<nQ;ci++){
        var a=ri*(nQ+1)+ci,b=a+1,c=a+nQ+1,dd=c+1;
        surgeIdx.push(a,c,b,b,c,dd);
      }
    }

    var surgeGeo=new T.BufferGeometry();
    var surgePosAttr=new T.Float32BufferAttribute(surgePos,3);
    var surgeColAttr=new T.Float32BufferAttribute(surgeCol,3);
    surgeGeo.setAttribute('position',surgePosAttr);
    surgeGeo.setAttribute('color',surgeColAttr);
    surgeGeo.setAttribute('normal',new T.Float32BufferAttribute(surgeNrm,3));
    surgeGeo.setIndex(surgeIdx);
    surgeGeo.frustumCulled=false;
    if(surgeGeo.computeBoundingSphere)surgeGeo.computeBoundingSphere();

    var surgeMat=new T.MeshStandardMaterial({
      vertexColors:true,
      roughness:d(opts.roughness,0.16),
      metalness:d(opts.metalness,0.06),
      envMapIntensity:0.45,
      transparent:true,
      opacity:d(opts.opacity,0.86),
      depthWrite:true,
      polygonOffset:true,
      polygonOffsetFactor:-1,
      polygonOffsetUnits:-2
    });
    if(T.DoubleSide!=null)surgeMat.side=T.DoubleSide;
    var surgeMesh=new T.Mesh(surgeGeo,surgeMat);
    surgeMesh.name='water:tsunami-surge:'+TS.key;
    surgeMesh.frustumCulled=false;
    surgeMesh.visible=false;
    surgeMesh.renderOrder=d(opts.renderOrder,2);
    tagHostObj(surgeMesh,TS.name+' (overland surge)');

    /* ---- 2. 3D Curling Breaking Bore Wall (boreMesh) ---- */
    var boreStep=Math.max(4,d(opts.boreStep,20));
    var boreCols=clamp(Math.ceil((qMax-qMin)/boreStep),8,150);
    var pRows=CURL_PROFILE.length;
    var boreVerts=pRows*(boreCols+1);
    var borePos=new Float32Array(boreVerts*3);
    var boreCol=new Float32Array(boreVerts*3);
    var boreNrm=new Float32Array(boreVerts*3);
    var boreIdx=[];
    for(ri=0;ri<pRows;ri++){
      for(ci=0;ci<=boreCols;ci++){
        var bk=ri*(boreCols+1)+ci;
        var bqv=qMin+(qMax-qMin)*(ci/boreCols);
        var bxz=worldXZ(TS,TS.startS,bqv);
        borePos[bk*3]=bxz[0];
        borePos[bk*3+1]=-sinkDepth;
        borePos[bk*3+2]=bxz[1];
        boreCol[bk*3]=0.04;
        boreCol[bk*3+1]=0.18;
        boreCol[bk*3+2]=0.22;
        boreNrm[bk*3]=0;
        boreNrm[bk*3+1]=1;
        boreNrm[bk*3+2]=0;
      }
    }
    for(ri=0;ri<pRows-1;ri++){
      for(ci=0;ci<boreCols;ci++){
        var ba=ri*(boreCols+1)+ci,bb=ba+1,bc=ba+boreCols+1,bd=bc+1;
        boreIdx.push(ba,bc,bb,bb,bc,bd);
      }
    }

    var boreGeo=new T.BufferGeometry();
    var borePosAttr=new T.Float32BufferAttribute(borePos,3);
    var boreColAttr=new T.Float32BufferAttribute(boreCol,3);
    boreGeo.setAttribute('position',borePosAttr);
    boreGeo.setAttribute('color',boreColAttr);
    boreGeo.setAttribute('normal',new T.Float32BufferAttribute(boreNrm,3));
    boreGeo.setIndex(boreIdx);
    if(boreGeo.computeBoundingSphere)boreGeo.computeBoundingSphere();

    var boreMat=new T.MeshStandardMaterial({
      vertexColors:true,
      roughness:0.20,
      metalness:0.05,
      envMapIntensity:0.48,
      transparent:true,
      opacity:0.95,
      depthWrite:true
    });
    if(T.DoubleSide!=null)boreMat.side=T.DoubleSide;
    var boreMesh=new T.Mesh(boreGeo,boreMat);
    boreMesh.name='water:tsunami-bore:'+TS.key;
    boreMesh.frustumCulled=false;
    boreMesh.visible=false;
    boreMesh.renderOrder=d(opts.renderOrder,2)+1;
    tagHostObj(boreMesh,TS.name+' (breaking bore wall)');

    /* ---- 3. Rising Surf / Seamount Base-Surge Spray Mist Curtain (mistGroup) ---- */
    var mistGroup=T.Group?new T.Group():new T.Mesh(new T.BufferGeometry(),boreMat);
    mistGroup.name='water:tsunami-mist:'+TS.key;
    mistGroup.visible=false;
    tagHostObj(mistGroup,TS.name+' (surf spray mist)');

    var mistCount=Math.max(4,Math.round(d(opts.mistCount,24)));
    var puffGeo=buildPuffGeometry(T);
    var puffMat=T.MeshBasicMaterial?new T.MeshBasicMaterial({
      vertexColors:true,
      transparent:true,
      opacity:0.16,
      depthWrite:false
    }):new T.MeshStandardMaterial({
      vertexColors:true,
      roughness:0.95,
      metalness:0,
      transparent:true,
      opacity:0.16,
      depthWrite:false
    });
    if(T.DoubleSide!=null)puffMat.side=T.DoubleSide;

    var puffs=[];
    for(var mi=0;mi<mistCount;mi++){
      var pm=new T.Mesh(puffGeo,puffMat);
      pm.name='water:tsunami-puff:'+mi;
      pm.frustumCulled=false;
      pm.renderOrder=d(opts.renderOrder,2)+2;
      tagHostObj(pm,TS.name+' (spray mist)');
      if(mistGroup.add)mistGroup.add(pm);
      puffs.push({
        mesh:pm,
        uQ:hash01(TS.seed,mi,1),
        uLag:hash01(TS.seed,mi,2),
        uLift:hash01(TS.seed,mi,3),
        uScale:0.7+0.75*hash01(TS.seed,mi,4)
      });
    }

    if(A&&Array.isArray(A.hooks)&&typeof A.hook==='function'){
      A.hook(function(){
        var E=A.skyEnv,tx=E&&E.target&&E.target.texture;
        if(tx&&surgeMat.envMap!==tx){surgeMat.envMap=tx;surgeMat.needsUpdate=true;}
        if(tx&&boreMat.envMap!==tx){boreMat.envMap=tx;boreMat.needsUpdate=true;}
      });
    }

    if(scene&&scene.add){
      scene.add(surgeMesh);
      scene.add(boreMesh);
      scene.add(mistGroup);
    }

    function applySeaY(yVal,isCalm){
      for(var k=0;k<seaRecords.length;k++){
        var sr=seaRecords[k],m=sr.mesh;
        var targetY=isCalm?sr.baseY:yVal;
        if(m.position)m.position.y=targetY;
        if(sr.uLvl)sr.uLvl.value=isCalm?sr.baseU:yVal;
        if(typeof m.updateMatrixWorld==='function')m.updateMatrixWorld(true);
      }
    }

    function update(t){
      var tVal=d(t,0);
      var st=TS.stateAt(tVal);
      var phase=st.phase;

      if(phase==='calm'){
        surgeMesh.visible=false;
        boreMesh.visible=false;
        mistGroup.visible=false;
        applySeaY(baseSeaY,true);
        return st;
      }

      /* Active tsunami phase: update seaMesh drawdown / stand */
      applySeaY(st.seaY,false);

      /* Update surgeMesh across coastal / overland run-up grid (linear RGB colors!) */
      var showSurge=phase==='drawdown'||phase==='bore'||phase==='runup'||phase==='backwash'||phase==='seiche';
      surgeMesh.visible=showSurge;
      if(showSurge){
        var pArr=surgePosAttr.array,cArr=surgeColAttr.array;
        var isSeamount=TS.regime==='seamount';
        for(var idx=0;idx<surgeVerts;idx++){
          var x=surgeX[idx],z=surgeZ[idx],gy=surgeGround[idx];
          var sp=TS.sample(x,z,tVal);
          var o3=idx*3;
          if(sp.wet){
            pArr[o3+1]=Math.max(sp.level,gy+0.06);
            var dpK=clamp(sp.depth/8,0,1);
            var baseR=lerp(0.052,0.006,dpK);
            var baseG=lerp(0.235,0.062,dpK);
            var baseB=lerp(0.230,0.110,dpK);
            if(isSeamount&&(phase==='bore'||phase==='runup'||phase==='backwash')){
              var ashBand=0.5+0.5*Math.sin(sp.q*0.045+sp.s*0.024);
              var ashK=0.28*ashBand*(1-dpK*0.45);
              baseR=lerp(baseR,0.076,ashK);
              baseG=lerp(baseG,0.068,ashK);
              baseB=lerp(baseB,0.052,ashK);
            }
            var lace=0.5+0.5*Math.sin(sp.q*0.085+sp.s*0.11)*Math.cos(sp.q*0.037-sp.s*0.075);
            var edgeSwash=clamp(1-sp.depth/1.15,0,1)*(0.35+0.65*lace);
            var rawFoam=Math.max(sp.foam*(0.24+0.52*lace)*(phase==='runup'?0.42:0.78),sp.boreFront*0.82,edgeSwash*0.65);
            var foamMix=clamp(rawFoam,0,0.88);
            cArr[o3]=lerp(baseR,0.38,foamMix);
            cArr[o3+1]=lerp(baseG,0.43,foamMix);
            cArr[o3+2]=lerp(baseB,0.45,foamMix);
          }else{
            pArr[o3+1]=gy-sinkDepth;
            cArr[o3]=0.01;
            cArr[o3+1]=0.08;
            cArr[o3+2]=0.12;
          }
        }
        surgePosAttr.needsUpdate=true;
        surgeColAttr.needsUpdate=true;
        if(typeof surgeGeo.computeVertexNormals==='function')surgeGeo.computeVertexNormals();
      }

      /* Update 3D curling breaking bore wall during 'bore' (linear RGB + shadowed hollow barrel throat) */
      var showBore=phase==='bore'&&st.boreHeightM>0.05;
      boreMesh.visible=showBore;
      if(showBore){
        var bp=borePosAttr.array,bc=boreColAttr.array;
        var fw=TS.frontWidthM;
        var seamountAsh=TS.regime==='seamount';
        for(var jc=0;jc<=boreCols;jc++){
          var qCol=qMin+(qMax-qMin)*(jc/boreCols);
          var frontXZ=worldXZ(TS,st.boreS,qCol);
          var shLocal=TS.shelterAt(frontXZ[0],frontXZ[1]);
          var gFront=TS.bedAt(frontXZ[0],frontXZ[1]);
          var trimH=Math.max(1e-6,TS.runupMaxM*Math.max(0.05,shLocal));
          var slopeAtten=clamp(1-Math.max(0,gFront-st.seaBaseY)/trimH,0,1);
          var wallH=st.boreHeightM*shLocal*slopeAtten;
          var troughFoot=Math.max(gFront,st.seaBaseY-TS.drawdownM*shLocal*(1-st.phaseProgress));
          var chop=0.06*wallH*Math.sin(qCol*0.07+tVal*2.6);

          for(var ir=0;ir<pRows;ir++){
            var prof=CURL_PROFILE[ir];
            var sRow=st.boreS+prof[0]*fw;
            var rxz=worldXZ(TS,sRow,qCol);
            var gRow=TS.bedAt(rxz[0],rxz[1]);
            var bi=(ir*(boreCols+1)+jc)*3;
            bp[bi]=rxz[0];
            bp[bi+2]=rxz[1];
            if(wallH<=0.15||sRow>TS.inlandReachM){
              bp[bi+1]=gRow-sinkDepth;
            }else{
              var footY=Math.max(gRow,troughFoot);
              var jag=(ir>=3&&ir<=5)?chop:0;
              bp[bi+1]=footY+wallH*prof[1]+jag;
            }
            var fm=prof[2]*(0.82+0.18*Math.sin(qCol*0.11+ir*1.7));
            var wr=lerp(0.008,0.42,fm);
            var wg=lerp(0.072,0.46,fm);
            var wb=lerp(0.125,0.48,fm);
            if(ir===6){
              wr*=0.58;wg*=0.64;wb*=0.70;
            }
            if(seamountAsh&&(ir===5||ir===7)){
              var streak=0.5+0.5*Math.sin(qCol*0.055+ir*1.3);
              wr=lerp(wr,0.074,0.34*streak);
              wg=lerp(wg,0.066,0.34*streak);
              wb=lerp(wb,0.052,0.34*streak);
            }
            bc[bi]=wr;
            bc[bi+1]=wg;
            bc[bi+2]=wb;
          }
        }
        borePosAttr.needsUpdate=true;
        boreColAttr.needsUpdate=true;
        if(typeof boreGeo.computeVertexNormals==='function')boreGeo.computeVertexNormals();
      }

      /* Update rising surf / seamount caldera base-surge mist curtain (never over inland runup cameras!) */
      var calderaPulse=TS.regime==='seamount'&&(phase==='tremor'||phase==='drawdown');
      var boreSpray=phase==='bore';
      mistGroup.visible=calderaPulse||boreSpray;
      if(mistGroup.visible){
        for(var pi=0;pi<puffs.length;pi++){
          var pf=puffs[pi],pmesh=pf.mesh;
          var pq=lerp(qMin,qMax,pf.uQ);
          var cyc=(tVal*0.28+pf.uLift)%1;
          if(cyc<0)cyc+=1;
          var ps,py,pRad,pTall;
          if(calderaPulse){
            ps=TS.startS*(0.88+0.24*pf.uLag);
            var cxz=worldXZ(TS,ps,pq);
            py=st.seaY+4+22*cyc*(phase==='tremor'?Math.max(0.35,st.tremorAmp):0.85);
            pRad=(18+22*pf.uScale)*(0.6+0.6*cyc);
            pTall=8+16*cyc;
            if(pmesh.position&&pmesh.position.set)pmesh.position.set(cxz[0],py,cxz[1]);
            else if(pmesh.position){pmesh.position.x=cxz[0];pmesh.position.y=py;pmesh.position.z=cxz[1];}
            if(pmesh.scale&&pmesh.scale.set)pmesh.scale.set(pRad,pTall,pRad);
            pmesh.visible=true;
          }else{
            var anchorS=st.boreS-4-22*pf.uLag;
            var sxz=worldXZ(TS,anchorS,pq);
            var shM=TS.shelterAt(sxz[0],sxz[1]);
            var gyM=TS.bedAt(sxz[0],sxz[1]);
            if(shM<=0.08||gyM>=st.seaBaseY+TS.runupMaxM*shM){
              pmesh.visible=false;
            }else{
              pmesh.visible=true;
              var hRef=st.boreHeightM*shM;
              py=Math.max(gyM,st.seaY)+hRef*(0.65+0.45*cyc);
              pRad=(9+11*pf.uScale)*(0.7+0.45*cyc)*shM;
              pTall=Math.max(2.2,hRef*(0.30+0.35*cyc));
              if(pmesh.position&&pmesh.position.set)pmesh.position.set(sxz[0],py,sxz[1]);
              else if(pmesh.position){pmesh.position.x=sxz[0];pmesh.position.y=py;pmesh.position.z=sxz[1];}
              if(pmesh.scale&&pmesh.scale.set)pmesh.scale.set(pRad,pTall,pRad);
            }
          }
        }
      }

      return st;
    }

    /* Run once on init so calm state or initial preset is immediately synchronized */
    update(d(opts.t,0));

    var handle={
      S:TS,
      TS:TS,
      mesh:surgeMesh,
      surgeMesh:surgeMesh,
      boreMesh:boreMesh,
      mistGroup:mistGroup,
      seaRecords:seaRecords,
      baseSeaY:baseSeaY,
      update:update,
      dispose:function(){
        if(scene&&scene.remove){
          scene.remove(surgeMesh);
          scene.remove(boreMesh);
          scene.remove(mistGroup);
        }
        if(surgeGeo.dispose)surgeGeo.dispose();
        if(boreGeo.dispose)boreGeo.dispose();
        if(puffGeo.dispose)puffGeo.dispose();
        if(surgeMat.dispose)surgeMat.dispose();
        if(boreMat.dispose)boreMat.dispose();
        if(puffMat.dispose)puffMat.dispose();
      }
    };
    (W.drawn||(W.drawn=[])).push(handle);
    return handle;
  };

  W.mountTsunamiUI=function(TS,drawHandle,opts){
    opts=opts||{};
    var A=getAtmos();
    var rafStart=Date.now();

    function nowSeconds(){
      if(typeof opts.now==='function')return +opts.now();
      if(A&&A.clock&&typeof A.clock.t==='number')return A.clock.t;
      if(A&&A.U&&A.U.waveTime&&typeof A.U.waveTime.value==='number')return A.U.waveTime.value;
      if(typeof performance!=='undefined'&&typeof performance.now==='function')return performance.now()*0.001;
      return (Date.now()-rafStart)*0.001;
    }

    var badgeEl=null;
    var btnMap={};

    function syncBadge(st){
      if(!badgeEl||!st)return;
      var ph=st.phase.toUpperCase();
      var metric='';
      if(st.phase==='calm'){
        metric='sea '+(st.seaY>=0?'+':'')+st.seaY.toFixed(1)+' m';
      }else if(st.phase==='drawdown'||st.phase==='tremor'){
        metric='offset '+(st.seaOffsetM>=0?'+':'')+st.seaOffsetM.toFixed(1)+' m';
      }else{
        metric='surge +'+Math.max(0,st.runupEnvelopeY-st.seaBaseY).toFixed(1)+' m';
      }
      badgeEl.textContent=ph+' \u00b7 '+metric+' \u00b7 trim '+TS.trimlineM.toFixed(0)+' m';
      var activeKey=TS.getMode();
      for(var bk in btnMap){
        var b=btnMap[bk];
        var isOn=bk===activeKey;
        b.style.background=isOn?'rgba(38,148,176,0.55)':'rgba(255,255,255,0.07)';
        b.style.borderColor=isOn?'rgba(120,230,250,0.75)':'rgba(180,225,235,0.2)';
      }
    }

    function setMode(m){
      var tNow=nowSeconds();
      TS.setMode(m);
      var st=drawHandle?drawHandle.update(tNow):TS.stateAt(tNow);
      syncBadge(st);
      return st;
    }

    function trigger(tArg){
      var tNow=tArg==null?nowSeconds():+tArg;
      TS.trigger(tNow);
      var st=drawHandle?drawHandle.update(tNow):TS.stateAt(tNow);
      syncBadge(st);
      return st;
    }

    /* Read URL ?tsunami=... query parameter on init if present */
    try{
      var loc=root.location||(typeof location!=='undefined'?location:null);
      var qStr=opts.search!=null?opts.search:(loc&&loc.search?loc.search:'');
      if(qStr&&typeof URLSearchParams!=='undefined'){
        var qp=new URLSearchParams(qStr).get('tsunami');
        if(qp){
          var cleanQ=qp.trim().toLowerCase();
          if(cleanQ==='live')trigger(nowSeconds());
          else if(['calm','tremor','drawdown','bore','runup','backwash','seiche'].indexOf(cleanQ)>=0)setMode(cleanQ);
        }
      }
    }catch(e){}

    var pill=null;
    if(typeof document!=='undefined'&&document.body&&opts.dom!==false){
      pill=document.createElement('div');
      pill.setAttribute('data-krator-tsunami-ui',TS.key);
      pill.style.cssText='position:fixed;bottom:14px;left:50%;transform:translateX(-50%);z-index:30;display:flex;align-items:center;gap:6px;padding:6px 11px;border-radius:999px;background:rgba(8,16,22,0.82);border:1px solid rgba(110,195,215,0.28);backdrop-filter:blur(8px);color:#e4f4f8;font:11.5px/1.2 system-ui,-apple-system,sans-serif;box-shadow:0 4px 18px rgba(0,0,0,0.38);user-select:none;';

      var buttons=[
        ['calm','Calm'],
        ['drawdown','Drawdown'],
        ['bore','Bore Wall'],
        ['runup','Peak Run-Up'],
        ['backwash','Backwash'],
        ['live','Trigger Wave']
      ];

      for(var i=0;i<buttons.length;i++){
        (function(modeKey,label){
          var btn=document.createElement('button');
          btn.type='button';
          btn.textContent=label;
          btn.style.cssText='cursor:pointer;padding:4px 9px;border-radius:999px;border:1px solid rgba(180,225,235,0.2);background:rgba(255,255,255,0.07);color:#eaf7fa;font:600 11px/1.1 system-ui,-apple-system,sans-serif;transition:background 0.15s;';
          btn.addEventListener('click',function(){
            if(modeKey==='live')trigger(nowSeconds());
            else setMode(modeKey);
          });
          btnMap[modeKey]=btn;
          pill.appendChild(btn);
        })(buttons[i][0],buttons[i][1]);
      }

      badgeEl=document.createElement('span');
      badgeEl.style.cssText='margin-left:4px;padding:3px 8px;border-radius:999px;background:rgba(0,0,0,0.32);color:#9ee3f0;font:600 11px/1.1 ui-monospace,SFMono-Regular,Consolas,monospace;white-space:nowrap;';
      pill.appendChild(badgeEl);
      document.body.appendChild(pill);
    }

    var lastMode=TS.getMode();
    function onFrame(tArg){
      var tNow=tArg==null?nowSeconds():+tArg;
      var cur=TS.getMode();
      if(cur!=='calm'||lastMode!=='calm'){
        var st=drawHandle?drawHandle.update(tNow):TS.stateAt(tNow);
        syncBadge(st);
      }
      lastMode=cur;
    }

    /* Initial sync */
    syncBadge(drawHandle?drawHandle.update(nowSeconds()):TS.stateAt(nowSeconds()));

    if(typeof opts.tick==='function'){
      opts.tick(onFrame);
    }else if(A&&Array.isArray(A.hooks)&&typeof A.hook==='function'){
      A.hook(function(t){onFrame(t);});
    }else if(typeof requestAnimationFrame==='function'&&opts.raf!==false){
      var alive=true;
      (function stepRaf(){
        if(!alive)return;
        onFrame(nowSeconds());
        requestAnimationFrame(stepRaf);
      })();
      pill&&(pill._stopTsunamiRaf=function(){alive=false;});
    }

    var api={
      TS:TS,
      draw:drawHandle,
      pill:pill,
      setMode:setMode,
      trigger:trigger,
      stateAt:function(t){return TS.stateAt(t==null?nowSeconds():t);},
      sample:function(x,z,t){return TS.sample(x,z,t==null?nowSeconds():t);}
    };
    root._tsunami=api;
    return api;
  };
})(typeof globalThis!=='undefined'?globalThis:this);
