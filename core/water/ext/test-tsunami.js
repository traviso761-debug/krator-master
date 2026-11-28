// node core/water/ext/test-tsunami.js [--golden]
// Tests core/water/ext/64-core-water-tsunami.js ([G data]) and 64b-core-water-tsunami-draw.js ([draw]) on tools/ktest.js.
// With --golden, writes core/water/ext/golden-tsunami.json for Godot 4.7.2 parity verification (ktsunami_test.gd).
'use strict';
require('../../shader/06-core-khook.js');
require('../../shader/06b-core-kcolor.js');
const fs=require('fs'),path=require('path');
const T=require('../../../tools/ktest.js')(__filename);
const ROOT=path.join(__dirname,'..','..','..');
const rd=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const near=(a,b,e)=>Math.abs(a-b)<(e==null?1e-9:e);

global.window=global;
eval([
  'core/rand/08-core-rand.js',
  'core/atmos/89-atmos-0-core.js',
  'core/atmos/89-atmos-0p-presets.js',
  'core/atmos/89-atmos-a-waves.js',
  'core/water/20-core-water.js',
  'core/water/21-core-water-shore.js',
  'core/water/22-core-water-flow.js',
  'core/water/50-core-water-draw.js',
  'core/water/51-core-water-kinds.js'
].map(rd).join('\n')+';global.ATMOS=ATMOS;global.WATER=WATER;');
const A=global.ATMOS,W=global.WATER;

/* ---- 1. Loading 64 & 64b moves nothing on an existing scene ---- */
const RIV=W.flow({name:'Coastal creek',pts:[[0,0,8],[120,0,3],[220,20,1]],width:5,speed:1.2});
const POOL=W.still({name:'Cliff pool',level:34,bounds:[80,40,95,55]});
const SEA=W.open({name:'Arch Sound',level:0,swell:[],field:0,bounds:[-900,-400,0,400]});
const probePts=[[-300,0],[50,0],[88,48],[160,10],[900,900]];
const expBefore=JSON.stringify(W.export());
const qBefore=probePts.map(p=>[W.at(p[0],p[1]),W.heightAt(p[0],p[1],4)]);

eval([
  'core/water/ext/64-core-water-tsunami.js',
  'core/water/ext/64b-core-water-tsunami-draw.js'
].map(rd).join('\n'));

T.ok('loading 64 and 64b moves zero exports or queries of existing surfaces',
  JSON.stringify(W.export())===expBefore&&
  probePts.every((p,i)=>W.at(p[0],p[1])===qBefore[i][0]&&W.at(p[0],p[1],4)===qBefore[i][0]&&W.heightAt(p[0],p[1],4)===qBefore[i][1]));

{
  const fn0=W.tsunami,dr0=W.drawTsunami;
  eval(rd('core/water/ext/64-core-water-tsunami.js'));
  eval(rd('core/water/ext/64b-core-water-tsunami-draw.js'));
  T.ok('loading 64 and 64b twice is an idempotent no-op',W.tsunami===fn0&&W.drawTsunami===dr0);
}

/* ---- 2. Validation & paired negatives ---- */
T.neg('zero dir vector [0, 0] is rejected',
  dir=>!!W.tsunami({key:'v-dir',dir}),[0,0],[0.8,-0.6]);
T.neg('unknown regime is rejected',
  regime=>!!W.tsunami({key:'v-reg',regime}),'meteor','ghost');
T.neg('unknown mode is rejected',
  mode=>{const s=W.tsunami({key:'v-mode',mode});s.setMode('calm');return !!s;},'cataclysm','bore');
T.neg('non-positive drawdownM is rejected',
  drawdownM=>!!W.tsunami({key:'v-dd',drawdownM}),0,6.5);
T.neg('non-positive boreHeightM is rejected',
  boreHeightM=>!!W.tsunami({key:'v-bh',boreHeightM}),-3,12);
T.neg('non-positive runupMaxM is rejected',
  runupMaxM=>!!W.tsunami({key:'v-ru',runupMaxM}),0,25);
T.neg('non-negative startS is rejected (bore starts offshore s < 0)',
  startS=>!!W.tsunami({key:'v-ss',startS}),0,-500);
T.neg('negative timing duration is rejected',
  drawdown=>!!W.tsunami({key:'v-tm',timings:{drawdown}}),-5,20);

/* ---- 3. Seamount tsunami physics, projection & calm non-interference ---- */
const TS=W.tsunami({
  key:'arch-seamount',
  name:'Caldera Seamount Tsunami',
  regime:'seamount',
  dir:[3,4],
  shoreOrigin:[20,-10],
  drawdownM:7.0,
  boreHeightM:14.0,
  runupMaxM:28.0,
  startS:-650,
  inlandReachM:950,
  frontWidthM:28
});

T.ok('dir is normalized to unit [0.6, 0.8] and trimlineM equals runupMaxM',
  TS.kind==='tsunami'&&near(TS.dir[0],0.6)&&near(TS.dir[1],0.8)&&TS.trimlineM===28.0&&near(TS.boreSpeed,Math.sqrt(7.36*19.6)));

{
  const pShore=TS.project(20,-10);
  const pIn=TS.project(20+60, -10+80);
  const pOff=TS.project(20-120,-10-160);
  const pCross=TS.project(20-80,-10+60);
  T.ok('project(x, z) computes exact signed inland s and cross-shore q',
    near(pShore.s,0)&&near(pShore.q,0)&&
    near(pIn.s,100)&&near(pIn.q,0)&&
    near(pOff.s,-200)&&near(pOff.q,0)&&
    near(pCross.s,0)&&near(pCross.q,100));
}

T.ok('in calm mode WATER.at and WATER.heightAt return base surfaces unchanged',
  TS.stateAt(15).phase==='calm'&&
  TS.stateAt(15).active===false&&
  probePts.every((p,i)=>W.at(p[0],p[1],15)===qBefore[i][0]&&W.heightAt(p[0],p[1],15)===qBefore[i][1]));

/* ---- 4. Seamount vs Ghost regime lead phase ---- */
const GHOST=W.tsunami({
  key:'arch-ghost',
  name:'Orphan Ghost Tsunami',
  regime:'ghost',
  dir:[1,0],
  shoreOrigin:[0,0],
  drawdownM:8.0,
  boreHeightM:15.0,
  runupMaxM:30.0
});

TS.setMode('tremor');
T.ok('seamount regime has tremor lead > 0 s and tremorAmp > 0 while seaOffsetM === 0',
  TS.timings.tremor===12&&TS.stateAt(0).phase==='tremor'&&TS.stateAt(0).tremorAmp>0.9&&TS.stateAt(0).seaOffsetM===0&&TS.stateAt(0).warn===true);

GHOST.trigger(100);
T.ok('ghost regime has timings.tremor === 0, tremorAmp === 0, and enters drawdown immediately on trigger',
  GHOST.timings.tremor===0&&GHOST.stateAt(100.5).phase==='drawdown'&&GHOST.stateAt(100.5).tremorAmp===0);
GHOST.setMode('calm');

/* ---- 5. Static presets across all phases ---- */
const ptAt=(s,q)=>[TS.shoreOrigin[0]+s*TS.dir[0]-q*TS.dir[1],TS.shoreOrigin[1]+s*TS.dir[1]+q*TS.dir[0]];

/* Drawdown */
TS.setMode('drawdown');
{
  const st=TS.stateAt(999);
  const shoal=TS.sample(...ptAt(-120,0),999);
  const deep=TS.sample(...ptAt(-500,0),999);
  const alongV=deep.vx*TS.dir[0]+deep.vz*TS.dir[1];
  T.ok('drawdown drops sea by -7 m, exposes nearshore shoal (-3.6 m groundY), and withdraws seaward (v < 0)',
    st.phase==='drawdown'&&near(st.seaOffsetM,-7.0)&&
    near(shoal.groundY,-3.6)&&shoal.wet===false&&shoal.exposedShelf===true&&
    deep.wet===true&&deep.exposedShelf===false&&alongV<-1.5);
}

/* Bore */
TS.setMode('bore');
{
  const st=TS.stateAt(42);
  const atWall=TS.sample(...ptAt(0,0),42);
  const ahead=TS.sample(...ptAt(120,0),42);
  const behind=TS.sample(...ptAt(-180,0),42);
  const wallInlandV=atWall.vx*TS.dir[0]+atWall.vz*TS.dir[1];
  T.ok('bore preset positions breaking wall across shoreline with high boreFront, inland velocity & momentumFlux while ahead stays dry',
    st.phase==='bore'&&st.boreS>0&&st.boreS<TS.frontWidthM&&
    atWall.wet===true&&atWall.boreFront>0.5&&atWall.level>11&&wallInlandV>6&&atWall.momentumFlux>400&&
    ahead.wet===false&&behind.wet===true&&behind.boreFront===0);
  const xyShore=ptAt(5,0);
  T.ok('when bore is active WATER.at and WATER.heightAt answer the tsunami surface over inundated shore',
    W.at(xyShore[0],xyShore[1],42)===TS&&near(W.heightAt(xyShore[0],xyShore[1],42),TS.heightAt(xyShore[0],xyShore[1],42)));
}

/* Run-Up */
TS.setMode('runup');
{
  const lowTown=TS.sample(...ptAt(200,0),0);
  const highRefuge=TS.sample(...ptAt(840,0),0);
  T.ok('runup inundates coastal slope below trimline and leaves high refuge (groundY >= 28 m) dry with safeRefuge === true',
    lowTown.phase==='runup'&&lowTown.wet===true&&lowTown.safeRefuge===false&&lowTown.level>20&&
    highRefuge.groundY>=28&&highRefuge.safeRefuge===true&&highRefuge.wet===false&&highRefuge.depth===0&&
    TS.heightAt(...ptAt(840,0),0)===null);
}

/* Backwash */
TS.setMode('backwash');
{
  const slopeLow=TS.sample(...ptAt(80,0),0);
  const slopeMid=TS.sample(...ptAt(300,0),0);
  const vSeaward=slopeMid.vx*TS.dir[0]+slopeMid.vz*TS.dir[1];
  const fl=TS.flowAt(...ptAt(300,0),0);
  T.ok('backwash reverses velocity seaward (-dir) in a 0.4..4.5 m scouring sheet with high momentumFlux',
    slopeLow.phase==='backwash'&&slopeLow.wet===true&&slopeLow.depth>=0.4&&slopeLow.depth<=4.5&&
    slopeMid.wet===true&&slopeMid.depth>=0.4&&slopeMid.depth<=4.5&&
    vSeaward<-6&&slopeMid.momentumFlux>80&&near(fl[2],slopeMid.speed));
}

/* Seiche */
TS.setMode('seiche');
{
  const st=TS.stateAt(0);
  T.ok('seiche preset produces damped coastal oscillation within +-0.18 * boreHeightM',
    st.phase==='seiche'&&st.seaOffsetM>0.4&&Math.abs(st.seaOffsetM)<=0.18*14.0);
}

/* ---- 6. Live progression, macrotidal seaLevel(t), shelterFn & hazardRecord ---- */
{
  TS.trigger(50);
  const phases=[55,70,95,130,155,190,220].map(t=>TS.stateAt(t).phase);
  T.ok('live mode advances tremor -> drawdown -> bore -> runup -> backwash -> seiche -> calm from trigger(50)',
    phases.join(',')==='tremor,drawdown,bore,runup,backwash,seiche,calm',phases.join(','));
}

{
  const COVE=W.tsunami({
    key:'cove-sheltered',
    regime:'ghost',
    seaLevel:t=>3.5*Math.sin(t*0.01),
    shelterFn:(x,z)=>(z>100?0.35:1.0),
    period:200,
    mode:'runup'
  });
  const exposed=COVE.sample(150,0,80);
  const sheltered=COVE.sample(150,200,80);
  const seaNow=3.5*Math.sin(0.8);
  T.ok('callable seaLevel(t) shifts base datum and shelterFn attenuates local run-up & safeRefuge threshold',
    near(COVE.stateAt(80).seaBaseY,seaNow)&&
    exposed.level>sheltered.level+8&&
    COVE.sample(380,200,80).safeRefuge===true&&COVE.sample(380,0,80).safeRefuge===false);
  COVE.setMode('live');
  T.ok('periodic tsunami wraps cleanly across period = 200 s',
    near(COVE.stateAt(25).seaOffsetM,COVE.stateAt(225).seaOffsetM)&&COVE.stateAt(225).phase===COVE.stateAt(25).phase);
  COVE.setMode('calm');
}

TS.setMode('calm');
{
  const hRec=TS.hazardRecord({id:'haz:arch'});
  const X=W.export();
  const tsExp=X.surfaces[TS.id];
  T.ok('TS.hazardRecord and WATER.export serialize plain JSON-safe tsunami data',
    hRec.id==='haz:arch'&&hRec.tags.hazard.stateFn==='KHAZ.tsunami'&&hRec.tags.hazard.tsunami.trimlineM===28&&
    tsExp.kind==='tsunami'&&tsExp.key==='arch-seamount'&&tsExp.regime==='seamount'&&
    JSON.stringify(JSON.parse(JSON.stringify(tsExp)))===JSON.stringify(tsExp));
}

/* ---- 7. 64b Three.js stub: drawTsunami & mountTsunamiUI ---- */
{
  class StubAttr{constructor(a,n){this.array=Float32Array.from(a);this.itemSize=n;this.needsUpdate=false;}}
  class StubGeo{
    constructor(){this.attributes={};this.index=null;}
    setAttribute(k,v){this.attributes[k]=v;}
    setIndex(i){this.index=Array.from(i);}
    computeBoundingSphere(){this.boundingSphere={radius:100};}
    computeVertexNormals(){}
    dispose(){this.disposed=true;}
  }
  class StubMat{constructor(o){Object.assign(this,{userData:{}},o||{});}dispose(){this.disposed=true;}}
  class StubObj{
    constructor(g,m){
      this.geometry=g||null;this.material=m||null;this.userData={};this.children=[];
      this.visible=true;this.renderOrder=0;this.name='';
      this.position={x:0,y:0,z:0,set(x,y,z){this.x=x;this.y=y;this.z=z;}};
      this.scale={x:1,y:1,z:1,set(x,y,z){this.x=x;this.y=y;this.z=z;}};
    }
    add(c){this.children.push(c);}
    remove(c){const i=this.children.indexOf(c);if(i>=0)this.children.splice(i,1);}
    updateMatrixWorld(){this.matrixUpdated=(this.matrixUpdated||0)+1;}
  }
  const T3={
    BufferGeometry:StubGeo,
    Float32BufferAttribute:StubAttr,
    MeshStandardMaterial:StubMat,
    MeshBasicMaterial:StubMat,
    Mesh:StubObj,
    Group:StubObj,
    DoubleSide:2
  };
  const scene=new StubObj();
  const seaMesh=new StubObj(new StubGeo(),new StubMat({uniforms:{wtrLevel:{value:1.5}}}));
  seaMesh.position.y=1.5;

  TS.setMode('calm');
  const D=W.drawTsunami(TS,{THREE:T3,scene,seaMesh,baseSeaY:1.5,cell:80,boreStep:80,mistCount:8,maxQSpan:800});
  const tagged=[D.surgeMesh,D.boreMesh,D.mistGroup,...D.mistGroup.children].every(o=>
    o.userData.host===true&&o.userData.probeSkip===true&&o.userData.lodSkip===true&&
    typeof o.userData.inspectLabel==='string'&&typeof o.raycast==='function');

  T.ok('drawTsunami tags all meshes (host, probeSkip, lodSkip, inspectLabel) and keeps zero visual side-effects in calm mode',
    tagged&&scene.children.length===3&&
    D.surgeMesh.visible===false&&D.boreMesh.visible===false&&D.mistGroup.visible===false&&
    seaMesh.position.y===1.5&&seaMesh.material.uniforms.wtrLevel.value===1.5);

  TS.setMode('drawdown');
  D.update(0);
  T.ok('drawdown lowers seaMesh.position.y and wtrLevel uniform and shows seamount caldera mist without boreMesh',
    near(seaMesh.position.y,-7.0)&&near(seaMesh.material.uniforms.wtrLevel.value,-7.0)&&
    D.boreMesh.visible===false&&D.surgeMesh.visible===true&&D.mistGroup.visible===true);

  const DGhost=W.drawTsunami(GHOST,{THREE:T3,scene,cell:120,boreStep:120,mistCount:6,maxQSpan:600});
  GHOST.setMode('drawdown');
  DGhost.update(0);
  T.ok('ghost tsunami keeps offshore caldera mist hidden during silent drawdown',
    DGhost.mistGroup.visible===false&&DGhost.boreMesh.visible===false);

  TS.setMode('bore');
  D.update(10);
  let maxBoreY=-1e9;
  const bp=D.boreMesh.geometry.attributes.position.array;
  for(let i=1;i<bp.length;i+=3)if(bp[i]>maxBoreY)maxBoreY=bp[i];
  T.ok('bore mode shows 3D curling boreMesh towering above +12 m alongside surgeMesh and spray mist',
    D.boreMesh.visible===true&&D.surgeMesh.visible===true&&D.mistGroup.visible===true&&maxBoreY>12);

  let ticks=[];
  const ui=W.mountTsunamiUI(TS,D,{
    dom:false,
    raf:false,
    search:'?tsunami=runup',
    now:()=>25,
    tick:fn=>ticks.push(fn)
  });
  let foldedCount=0,wetCount=0;
  const sp=D.surgeMesh.geometry.attributes.position.array;
  for(let i=0;i<sp.length/3;i++){
    const vx=sp[i*3],vy=sp[i*3+1],vz=sp[i*3+2],gy=TS.bedAt(vx,vz);
    if(gy>=TS.trimlineM){if(near(vy,gy-1.5,1e-4))foldedCount++;}
    else if(vy>gy+0.05)wetCount++;
  }
  T.ok('mountTsunamiUI reads ?tsunami=runup, wires _tsunami API & tick hook, and folds dry refuge vertices 1.5 m under groundY',
    TS.getMode()==='runup'&&global._tsunami===ui&&ticks.length===1&&foldedCount>0&&wetCount>0);

  ui.setMode('calm');
  T.ok('switching UI back to calm hides all tsunami meshes and restores seaMesh.position.y to baseSeaY',
    D.surgeMesh.visible===false&&D.boreMesh.visible===false&&D.mistGroup.visible===false&&seaMesh.position.y===1.5);
  GHOST.setMode('calm');
}

/* ---- Optional --golden generator for Godot 4.7.2 ktsunami_test.gd ---- */
if(process.argv.includes('--golden')){
  const r6=v=>typeof v==='number'?+v.toFixed(8):v;
  const cleanObj=o=>{
    const out={};
    for(const k of Object.keys(o))out[k]=r6(o[k]);
    return out;
  };
  const modes=['calm','tremor','drawdown','bore','runup','backwash','seiche'];
  const sampleGrid=[
    [-550,0],[-240,-60],[-80,40],[0,0],[15,-30],[65,25],
    [180,-50],[380,80],[620,0],[860,40],[1020,0]
  ];

  const seaSpec={
    key:'gold-seamount',
    name:'Golden Seamount',
    regime:'seamount',
    g:7.36,
    dir:[0.8,-0.6],
    shoreOrigin:[40,-25],
    shelfDepth:42,
    offshoreSlope:0.032,
    inlandSlope:0.036,
    bounds:[-2400,-2400,2400,2400],
    startS:-640,
    inlandReachM:920,
    frontWidthM:30,
    drawdownM:7.2,
    boreHeightM:14.5,
    runupMaxM:29.0,
    timings:{tremor:12,drawdown:26,bore:38,hold:14,backwash:42,seiche:24},
    seed:0x5453554e
  };
  const gSea=W.tsunami(seaSpec);
  const seaPresets={};
  for(const m of modes){
    gSea.setMode(m);
    const pts=sampleGrid.map(([ds,dq])=>{
      const x=seaSpec.shoreOrigin[0]+ds*0.8-dq*(-0.6);
      const z=seaSpec.shoreOrigin[1]+ds*(-0.6)+dq*0.8;
      return {x:r6(x),z:r6(z),sample:cleanObj(gSea.sample(x,z,12.5)),height:r6(gSea.heightAt(x,z,12.5))};
    });
    seaPresets[m]={state:cleanObj(gSea.stateAt(12.5)),points:pts};
  }
  gSea.trigger(20);
  const seaLiveTimes=[15,20,25,38,54,72,88,101,118,136,158,172,185];
  const seaLive=seaLiveTimes.map(t=>{
    const x=seaSpec.shoreOrigin[0]+90*0.8;
    const z=seaSpec.shoreOrigin[1]+90*(-0.6);
    const xo=seaSpec.shoreOrigin[0]-150*0.8;
    const zo=seaSpec.shoreOrigin[1]-150*(-0.6);
    return {
      t,
      state:cleanObj(gSea.stateAt(t)),
      inland:cleanObj(gSea.sample(x,z,t)),
      offshore:cleanObj(gSea.sample(xo,zo,t))
    };
  });

  const ghostSpec={
    key:'gold-ghost',
    name:'Golden Ghost',
    regime:'ghost',
    g:7.36,
    dir:[0,1],
    shoreOrigin:[-15,30],
    shelfDepth:38,
    offshoreSlope:0.028,
    inlandSlope:0.034,
    bounds:[-2000,-2000,2000,2000],
    startS:-600,
    inlandReachM:880,
    frontWidthM:26,
    drawdownM:8.4,
    boreHeightM:13.2,
    runupMaxM:26.0,
    period:240,
    timings:{drawdown:24,bore:36,hold:12,backwash:40,seiche:22},
    seed:0x47485354
  };
  const gGhost=W.tsunami(ghostSpec);
  const ghostPresets={};
  for(const m of modes){
    gGhost.setMode(m);
    const pts=sampleGrid.map(([ds,dq])=>{
      const x=ghostSpec.shoreOrigin[0]-dq;
      const z=ghostSpec.shoreOrigin[1]+ds;
      return {x:r6(x),z:r6(z),sample:cleanObj(gGhost.sample(x,z,7)),height:r6(gGhost.heightAt(x,z,7))};
    });
    ghostPresets[m]={state:cleanObj(gGhost.stateAt(7)),points:pts};
  }
  gGhost.trigger(0);
  const ghostLive=[0,10,22,36,52,66,85,115,132,140,250,276].map(t=>({
    t,
    state:cleanObj(gGhost.stateAt(t)),
    shore:cleanObj(gGhost.sample(-15,35,t)),
    shoal:cleanObj(gGhost.sample(-15,-140,t))
  }));

  /* Variant with callable seaLevel(t), custom bed(x, z), and shelterFn(x, z) */
  const coveFnSpec={
    key:'gold-cove-fn',
    regime:'seamount',
    g:7.36,
    dir:[1,0],
    shoreOrigin:[0,0],
    startS:-500,
    inlandReachM:800,
    frontWidthM:25,
    drawdownM:6.0,
    boreHeightM:12.0,
    runupMaxM:24.0
  };
  const gCove=W.tsunami(Object.assign({},coveFnSpec,{
    seaLevel:t=>2.5*Math.sin(t*0.02)+0.4,
    bed:(x,z)=>(x<0?Math.max(-35,x*0.04):x*0.045+1.5*Math.sin(z*0.01)),
    shelterFn:(x,z)=>Math.max(0.25,Math.min(1,1-0.55*Math.abs(z)/600))
  }));
  gCove.trigger(10);
  const coveSamples=[];
  for(const t of [15,30,55,78,92,115,148]){
    for(const [x,z] of [[-120,0],[10,0],[120,300],[260,-400],[580,100]]){
      coveSamples.push({t,x,z,state:cleanObj(gCove.stateAt(t)),sample:cleanObj(gCove.sample(x,z,t))});
    }
  }

  const outPath=path.join(__dirname,'golden-tsunami.json');
  fs.writeFileSync(outPath,JSON.stringify({
    format:'krator-tsunami-golden',
    version:1,
    seamount:{spec:seaSpec,presets:seaPresets,liveTriggerT:20,live:seaLive},
    ghost:{spec:ghostSpec,presets:ghostPresets,liveTriggerT:0,live:ghostLive},
    coveCallable:{spec:coveFnSpec,triggerT:10,samples:coveSamples}
  },null,2)+'\n','utf8');
  console.log('wrote '+outPath);
}

T.done();
