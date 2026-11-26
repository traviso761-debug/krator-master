// ================================================================= CORE — fire (the burn mosaic and the live fire)  [G data]
// Lifted from biomes/crater-drylands' fire history (52-biome-craterdry-fire.js, CRATERDRY.FIRE; hyperjungle PLAN-LANDS.md
// section 11, H3) so every savannah can have a burn mosaic: a fire-spread model run over the map for a few decades of
// fires, oldest first. The arithmetic of the spread is the kit's, operation for operation: given the same ground, the
// same burnability and the same fires, KFIRE.history gives the kit's grids bit for bit (core/biome/test-fire.js proves
// it against the kit's function, loaded in place). Only the inputs are the host's: no BIO, no THREE, no DOM.
//
// One fire is a shortest-time spread (Dijkstra on a grid, 8 neighbours) from its ignition point. A step's speed is the
// cell's BURNABILITY (the host's: none on bare rock or water, little on sand or by a seep, patchy inside every fire so it
// leaves unburnt islands) times its FUEL (no fire on ground burnt less than a year ago, the load building over six
// years) times the WIND (a fire runs downwind ~100x faster than into it) times the SLOPE (fire runs uphill). It takes the
// cells it reaches first until it has its share of the map. Each fire is stopped by the fresh burns before it, so the
// burns tile the land in patches of different ages.
//
//   KFIRE.history(o)   o: {height(x,z), burn(x,z) (0..1; the host's burnability, read once per cell inside the disc),
//                      R (2600), cell (20), seed (520031), wind:[dx,dz] (blowing toward), fires:[{ago, x, z, frac, veer}]
//                      (the host's recent ones), old (8: how many older fires KFIRE lights, 7..45 years ago, from
//                      KRAND.hash(seed, k, try, salt), never from a draw order), warp ('krand' default | null | fn(x,z)->[wx,wz]:
//                      the lookup's edge warp)}
//     -> {R, cs, N, x0, z0, last, id, front, base, H, fires, inside, wind, ageAt(x,z), fireAt(x,z)->{age, fire},
//         frontAt(x,z) (when the NEWEST fire reached a point: 0 at ignition .. 1 at its last cell, -1 outside), shares()}
//   KFIRE.run(hist, o) a LIVE fire lit now at (o.x, o.z) through the history's fuel: {ok, arrive (s), order, at(x,z),
//                      range(t0,t1), state(x,z,t) 'unburnt'|'burning'|'smouldering'|'burnt'} (o: wind, maxT 1800 s, maxCells)
//   KFIRE.current, KFIRE.ageAt / fireAt / frontAt(x,z)   the newest history's lookups (NEVER / -1 before there is one)
//   KFIRE.fuelK(a), KFIRE.stages(a) {char, bloom, regrow, mature}, KFIRE.NEVER (60), FIRE_SEC, FLAME_H
//   KFIRE.burnK(rock, flow, wet, water, patch)   crater-drylands' burnability from its fields (a host may use its own)
//   KFIRE.patch(seed)  (x,z)->0.5..1.4: the unburnt islands' patchiness on KRAND.fbm (portable; the kit's is BIO's fbm)
//   KFIRE.burnFromFields(field, depth, patch)   a burn(x,z) from a host's field(name,x,z) and depth(x,z) (BIO.field, BIO.depth)
//
// Godot: core/biome/kfire.gd, tested on golden-fire.json (kfire_test.gd; godot/tools/sync_core.py vendors them).
(function(root){
  'use strict';
  var TAU=Math.PI*2,NEVER=60,WK=.84;   // WK, the wind's weight: downwind (1+WK)^2 = 3.4x, upwind (1-WK)^2 = 0.03x
  var D8=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
  function clamp(v,a,b){return v<a?a:v>b?b:v;}
  function lerp(a,b,t){return a+(b-a)*t;}
  function smooth(a,b,x){var t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);}
  // the fuel a cell carries `a` years after it last burned: none for the first year, full by six, a little more as the
  // scrub grows old and dead wood piles up
  function fuelK(a){return smooth(1.1,6,a)*(1+.15*smooth(10,25,a));}
  // a small binary heap of cell indices keyed by time (lazy deletion: a stale entry is skipped when popped). Its keys are
  // float32, as the kit's are: the twin stores them the same way
  function Heap(cap){var K=new Float32Array(cap),V=new Int32Array(cap),n=0;
    return{size:function(){return n;},
      push:function(k,v){var i=n++;while(i>0){var p=(i-1)>>1;if(K[p]<=k)break;K[i]=K[p];V[i]=V[p];i=p;}K[i]=k;V[i]=v;},
      pop:function(o){o.k=K[0];o.v=V[0];var k=K[--n],v=V[n],i=0;for(;;){var c=2*i+1;if(c>=n)break;if(c+1<n&&K[c+1]<K[c])c++;if(K[c]>=k)break;K[i]=K[c];V[i]=V[c];i=c;}K[i]=k;V[i]=v;return o;},
      clear:function(){n=0;}};}
  function unitDir(w,d){var x=w?w[0]:d[0],z=w?w[1]:d[1],l=Math.hypot(x,z)||1;return[x/l,z/l];}
  // a step's speed into cell n from cell k (the kit's expression, in its order)
  function speed(fuel,H,n,k,d,cs,w){var L=cs*(d[0]&&d[1]?1.4142:1),dx=d[0]*cs/L,dz=d[1]*cs/L;
    return fuel*Math.pow(1+WK*(dx*w[0]+dz*w[1]),2)*Math.exp(clamp((H[n]-H[k])/L*3,-1,1.2));}

  function burnK(rock,flow,wet,water,patch){return water||rock>.8?0:Math.pow(1-rock,2)*(1-.72*flow)*(1-.7*smooth(.35,.8,wet))*patch;}
  function patch(seed){seed=seed==null?521:seed;return function(x,z){return .5+.9*smooth(.28,.72,root.KRAND.fbm(x*.0042+7,z*.0042-3,0,2,seed));};}
  function burnFromFields(field,depth,pf){return function(x,z){
    return burnK(field('rock',x,z),field('flow',x,z),field('wet',x,z),depth(x,z)>-.2,pf?pf(x,z):1);};}

  function history(o){o=o||{};var R=o.R==null?2600:o.R,cs=o.cell==null?20:o.cell,N=Math.ceil(2*R/cs)+1,x0=-R,z0=-R,NN=N*N;
    var seed=o.seed==null?520031:o.seed,height=o.height||function(){return 0;},burn=o.burn||function(){return 1;};
    var H=new Float32Array(NN),base=new Float32Array(NN),last=new Float32Array(NN).fill(NEVER),id=new Int16Array(NN).fill(-1),front=new Float32Array(NN).fill(-1);
    var inside=0,i,j,k;
    for(j=0;j<N;j++)for(i=0;i<N;i++){k=j*N+i;var x=x0+i*cs,z=z0+j*cs;H[k]=height(x,z);
      if(Math.hypot(x,z)>R*1.02)continue;inside++;base[k]=burn(x,z);}
    var W0=unitDir(o.wind,[-.56,-.83]);
    // the fires: the host's recent ones, then older ones lit by hash on ground that will burn; oldest first
    var fires=(o.fires||[]).map(function(f){return Object.assign({veer:0},f);});
    var nOld=o.old==null?8:o.old,U=function(a,b,c){return root.KRAND.unit(root.KRAND.hash(seed,a,b,c));};
    for(k=0;k<nOld;k++){var fx=0,fz=0;for(var t=0;t<30;t++){var a=TAU*U(k,t,1),dd=R*.88*Math.sqrt(U(k,t,2));fx=Math.cos(a)*dd;fz=Math.sin(a)*dd;
        var ii=Math.round((fx-x0)/cs),jj=Math.round((fz-z0)/cs);if(base[jj*N+ii]>.45)break;}
      fires.push({ago:lerp(7,45,nOld>1?k/(nOld-1):0)*(.88+.24*U(k,-1,3)),x:fx,z:fz,frac:.05+.06*U(k,-1,4),veer:-.35+.7*U(k,-1,5)});}
    fires.sort(function(a,b){return b.ago-a.ago;});
    var T=new Float32Array(NN),heap=Heap(NN*8),tmp={k:0,v:0};
    fires.forEach(function(f,fi){
      // the ignition: the nearest cell that will burn, spiralling out from the asked point
      var ci=Math.round((f.x-x0)/cs),cj=Math.round((f.z-z0)/cs),found=-1,r,di,dj;
      for(r=0;r<40&&found<0;r++)for(dj=-r;dj<=r&&found<0;dj++)for(di=-r;di<=r;di++){if(Math.max(Math.abs(di),Math.abs(dj))!==r)continue;
        var i2=ci+di,j2=cj+dj;if(i2<0||j2<0||i2>=N||j2>=N)continue;var k2=j2*N+i2;if(base[k2]*fuelK(last[k2]-f.ago)>.25){found=k2;break;}}
      f.cells=0;if(found<0){f.failed=true;return;}
      var ca=Math.cos(f.veer),sa=Math.sin(f.veer),w=[W0[0]*ca-W0[1]*sa,W0[0]*sa+W0[1]*ca];
      var target=Math.max(20,Math.round(f.frac*inside)),newest=fi===fires.length-1,order=[];
      T.fill(Infinity);heap.clear();T[found]=0;heap.push(0,found);
      while(heap.size()&&f.cells<target){heap.pop(tmp);var kk=tmp.v,tt=tmp.k;if(tt>T[kk])continue;
        if(id[kk]===fi)continue;id[kk]=fi;last[kk]=f.ago;f.cells++;if(newest)order.push(kk);
        var ci2=kk%N,cj2=(kk-ci2)/N;
        for(var q=0;q<8;q++){var d=D8[q],ni=ci2+d[0],nj=cj2+d[1];if(ni<0||nj<0||ni>=N||nj>=N)continue;var n=nj*N+ni;if(id[n]===fi)continue;
          var s=speed(base[n]*fuelK(last[n]-f.ago),H,n,kk,d,cs,w);
          if(s<.02)continue;var tn=tt+cs*(d[0]&&d[1]?1.4142:1)/s;if(tn<T[n]){T[n]=tn;heap.push(tn,n);}}}
      if(newest)order.forEach(function(c,rk){front[c]=rk/Math.max(1,order.length-1);});
      f.ix=found%N;f.iz=(found-f.ix)/N;f.x=x0+f.ix*cs;f.z=z0+f.iz*cs;});
    // a nearest-cell lookup with the cell's edge warped by noise, so a burn's edge is sharp but not a staircase
    var warp=o.warp===undefined?'krand':o.warp;
    if(warp==='krand')warp=root.KRAND?function(x,z){return[x+cs*1.1*(root.KRAND.fbm(x*.021+3,z*.021,0,2,seed^532)-.5),z+cs*1.1*(root.KRAND.fbm(x*.021,z*.021-5,0,2,seed^533)-.5)];}:null;
    var cellOf=function(x,z){var p=warp?warp(x,z):[x,z];
      var ci=clamp(Math.round((p[0]-x0)/cs),0,N-1),cj=clamp(Math.round((p[1]-z0)/cs),0,N-1);return cj*N+ci;};
    var out={R:R,cs:cs,N:N,x0:x0,z0:z0,last:last,id:id,front:front,base:base,fires:fires,inside:inside,H:H,wind:W0,cellOf:cellOf,
      ageAt:function(x,z){return last[cellOf(x,z)];},
      fireAt:function(x,z){var c=cellOf(x,z);return{age:last[c],fire:id[c]};},
      frontAt:function(x,z){return front[cellOf(x,z)];},
      // the share of the map in each stage of the mosaic (a probe's check that every stage is present)
      shares:function(){var S={char:0,bloom:0,regrow:0,mature:0,never:0},n=0;for(var c=0;c<NN;c++){if(base[c]<=0&&last[c]>=NEVER)continue;n++;var a=last[c];
        if(a<.6)S.char++;else if(a<2.5)S.bloom++;else if(a<7)S.regrow++;else if(a<NEVER)S.mature++;else S.never++;}
        for(var s in S)S[s]=+(S[s]/Math.max(1,n)).toFixed(3);return S;}};
    KFIRE.current=out;return out;}

  // A LIVE FIRE: one fire lit NOW at (x,z), spreading by the same rule through the fuel the history left. FIRE_SEC turns the
  // model's units into seconds (a 20 m step downwind in old scrub is ~6 units: ~2 m/s downwind, a crawl into the wind).
  // A fire lit where nothing will burn does not take: {ok:false}.
  function run(HI,o){o=o||{};var N=HI.N,cs=HI.cs,x0=HI.x0,z0=HI.z0,NN=N*N,H=HI.H,base=HI.base,last=HI.last;
    var w=unitDir(o.wind||HI.wind,HI.wind),maxT=(o.maxT==null?1800:o.maxT)/KFIRE.FIRE_SEC,maxCells=o.maxCells==null?Math.round(NN*.15):o.maxCells;
    var fuel=function(c){return base[c]*fuelK(last[c]);};
    var ci=Math.round((o.x-x0)/cs),cj=Math.round((o.z-z0)/cs),found=-1,r,di,dj;
    for(r=0;r<3&&found<0;r++)for(dj=-r;dj<=r&&found<0;dj++)for(di=-r;di<=r;di++){if(Math.max(Math.abs(di),Math.abs(dj))!==r)continue;
      var i=ci+di,j=cj+dj;if(i<0||j<0||i>=N||j>=N)continue;var k=j*N+i;if(fuel(k)>.2){found=k;break;}}
    if(found<0)return{ok:false,why:'nothing here will burn (rock, sand, water or a fresh burn)',N:N,cs:cs,x0:x0,z0:z0,arrive:null,order:[],wind:w};
    var T=new Float32Array(NN).fill(Infinity),done=new Uint8Array(NN),order=[],heap=Heap(NN*8),tmp={k:0,v:0};
    T[found]=0;heap.push(0,found);
    while(heap.size()&&order.length<maxCells){heap.pop(tmp);var kk=tmp.v,t=tmp.k;if(t>T[kk]||done[kk])continue;if(t>maxT)break;done[kk]=1;order.push(kk);
      var ci2=kk%N,cj2=(kk-ci2)/N;
      for(var q=0;q<8;q++){var d=D8[q],ni=ci2+d[0],nj=cj2+d[1];if(ni<0||nj<0||ni>=N||nj>=N)continue;var n=nj*N+ni;if(done[n])continue;
        var sp=speed(fuel(n),H,n,kk,d,cs,w);
        if(sp<.02)continue;var tn=t+cs*(d[0]&&d[1]?1.4142:1)/sp;if(tn<T[n]){T[n]=tn;heap.push(tn,n);}}}
    var arrive=new Float32Array(NN).fill(Infinity);for(var m=0;m<order.length;m++)arrive[order[m]]=T[order[m]]*KFIRE.FIRE_SEC;
    var fi=found%N,fj=(found-fi)/N,near=function(x,z){return clamp(Math.round((z-z0)/cs),0,N-1)*N+clamp(Math.round((x-x0)/cs),0,N-1);};
    return{ok:true,N:N,cs:cs,x0:x0,z0:z0,H:H,arrive:arrive,order:order,wind:w,x:x0+fi*cs,z:z0+fj*cs,
      // the arrival time at a point (nearest cell), and the index range of `order` that caught in [t0, t1)
      at:function(x,z){return arrive[near(x,z)];},
      range:function(t0,t1){var lo=function(t){var a=0,b=order.length;while(a<b){var mm=(a+b)>>1;if(arrive[order[mm]]<t)a=mm+1;else b=mm;}return a;};return[lo(t0),lo(t1)];},
      // the state of the ground at a point at time t: what a game needs from it (a hazard, a way through)
      state:function(x,z,t){var A=arrive[near(x,z)];return !(A<Infinity)||t<A?'unburnt':t<A+30?'burning':t<A+400?'smouldering':'burnt';}};}

  // the stages of the mosaic as weights 0..1 from the age (they overlap a little at their edges)
  function stages(a){return{char:smooth(.75,.4,a),bloom:smooth(.3,.6,a)*smooth(2.9,2.0,a),regrow:smooth(2.0,3.0,a)*smooth(8,6,a),mature:smooth(6,8.5,a)};}
  var KFIRE=root.KFIRE={version:1,NEVER:NEVER,FIRE_SEC:1.6,FLAME_H:12,WK:WK,current:null,
    fuelK:fuelK,stages:stages,burnK:burnK,patch:patch,burnFromFields:burnFromFields,history:history,run:run,
    ageAt:function(x,z){return KFIRE.current?KFIRE.current.ageAt(x,z):NEVER;},
    fireAt:function(x,z){return KFIRE.current?KFIRE.current.fireAt(x,z):{age:NEVER,fire:-1};},
    frontAt:function(x,z){return KFIRE.current?KFIRE.current.frontAt(x,z):-1;}};
  if(root.BIO)root.BIO.fire=KFIRE;
})(typeof window!=='undefined'?window:globalThis);
