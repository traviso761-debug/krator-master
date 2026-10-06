// ================================================================= CORE — simulation 4: navigation layers (the NAV contract)
// PLAN.md 4.3: NAV = {nodes:[{id,x,y,z,tag}], edges:[{id,a,b,kind,len,w}]}, the Mav / Locus / GAME_EXPORT contract, one
// per LAYER ('pedestrian' 'road' 'water' 'climb' 'animal' 'air' 'interior'). A graph layer is searched here (A* on a
// binary heap, a cost and a speed factor per edge kind, `w` per edge so a caravan keeps to roads wide enough for it).
// A GRID layer (a host's own water or cross-country grid) registers a route function instead and answers the same call.
//
//   SIM.nav.layer(name, {nodes, edges, cost?:{kind:k}, speed?:{kind:k}})       a graph layer
//   SIM.nav.layer(name, {route:(ax,az,bx,bz,opt)=>{pts:[[x,y,z]...]}|null})      a grid (host) layer
//   SIM.nav.nearest(layer, x, z, {minW}) -> node index (graph layers)
//   SIM.nav.route(layer, from:{x,z,y?,node?}, to:{x,z,y?,node?}, {minW}) -> {pts, cum, len} or null (SIM.routeFail)
//   The path between two NODES is cached (node pair + width), so a thousand people commuting cost a few hundred searches.
(function(root){
  'use strict';
  var SIM = root.SIM;
  var NAVS = {}, CELL = 24;
  function Heap(){ this.k=[]; this.f=[]; }
  Heap.prototype.push=function(k,f){ var K=this.k,F=this.f,i=K.length; K.push(k); F.push(f); while(i>0){ var p=(i-1)>>1; if(F[p]<=F[i]) break; var t=K[p];K[p]=K[i];K[i]=t; t=F[p];F[p]=F[i];F[i]=t; i=p; } };
  Heap.prototype.pop=function(){ var K=this.k,F=this.f,top=K[0],lk=K.pop(),lf=F.pop(); if(K.length){ K[0]=lk; F[0]=lf; var i=0,n=K.length;
    for(;;){ var l=2*i+1,r=l+1,m=i; if(l<n&&F[l]<F[m]) m=l; if(r<n&&F[r]<F[m]) m=r; if(m===i) break; var t=K[m];K[m]=K[i];K[i]=t; t=F[m];F[m]=F[i];F[i]=t; i=m; } } return top; };
  function graphLayer(name, o){
    var N=o.nodes, E=o.edges, n=N.length, adjStart=new Int32Array(n+1), deg=new Int32Array(n);
    var idx={}; N.forEach(function(nd,i){ idx[nd.id]=i; });
    E.forEach(function(e){ deg[idx[e.a]]++; deg[idx[e.b]]++; });
    for(var i=0;i<n;i++) adjStart[i+1]=adjStart[i]+deg[i];
    var adjTo=new Int32Array(adjStart[n]), adjE=new Int32Array(adjStart[n]), fill=new Int32Array(n);
    E.forEach(function(e,ei){ var a=idx[e.a], b=idx[e.b]; adjTo[adjStart[a]+fill[a]]=b; adjE[adjStart[a]+fill[a]++]=ei; adjTo[adjStart[b]+fill[b]]=a; adjE[adjStart[b]+fill[b]++]=ei; });
    var hash={}; N.forEach(function(nd,i){ var k=Math.floor(nd.x/CELL)+','+Math.floor(nd.z/CELL); (hash[k]||(hash[k]=[])).push(i); });
    var L={ name:name, kind:'graph', nodes:N, edges:E, idx:idx, adjStart:adjStart, adjTo:adjTo, adjE:adjE, hash:hash, cost:o.cost||{}, speed:o.speed||{}, cache:{}, searches:0, hits:0 };
    /* the widest edge at each node: a wheeled mover may only start or stop where it fits */
    L.nodeW = new Float32Array(n); E.forEach(function(e){ var w=e.w==null?99:e.w; [idx[e.a],idx[e.b]].forEach(function(j){ if(w>L.nodeW[j]) L.nodeW[j]=w; }); });
    return L;
  }
  SIM.nav = {
    layers: NAVS,
    layer: function(name, o){ NAVS[name] = o.route ? { name:name, kind:'grid', route:o.route, nearest:o.nearest||null, searches:0 } : graphLayer(name, o); return NAVS[name]; },
    nearest: function(layer, x, z, opt){
      var L=NAVS[layer]; if(!L || L.kind!=='graph') return -1; var minW=(opt&&opt.minW)||0, best=-1, bd=1e18;
      /* rings of hash cells outward; once something is found, a ring further out cannot hold anything nearer
         than r*CELL, so stop when the best is inside that */
      var ci=Math.floor(x/CELL), cj=Math.floor(z/CELL);
      for(var r=0;r<14;r++){
        for(var i=ci-r;i<=ci+r;i++) for(var j=cj-r;j<=cj+r;j++){ if(r && i>ci-r && i<ci+r && j>cj-r && j<cj+r) continue; var cell=L.hash[i+','+j]; if(!cell) continue;
          for(var q=0;q<cell.length;q++){ var k=cell[q], nd=L.nodes[k]; if(L.nodeW[k] < minW) continue; var d=(nd.x-x)*(nd.x-x)+(nd.z-z)*(nd.z-z); if(d<bd){ bd=d; best=k; } } }
        if(best>=0 && Math.sqrt(bd) <= r*CELL) break; }
      if(best<0){ for(var m=0;m<L.nodes.length;m++){ if(L.nodeW[m] < minW) continue; var nd2=L.nodes[m], d2=(nd2.x-x)*(nd2.x-x)+(nd2.z-z)*(nd2.z-z); if(d2<bd){ bd=d2; best=m; } } }
      return best;
    },
    /* the node path between two node indices, cached */
    path: function(layer, s, t, minW){
      var L=NAVS[layer], key=s+'|'+t+'|'+(minW||0); if(L.cache[key]){ L.hits++; return L.cache[key]; }
      L.searches++;
      var N=L.nodes, n=N.length, g=new Float64Array(n).fill(Infinity), from=new Int32Array(n).fill(-1), closed=new Uint8Array(n), h=new Heap();
      var T=N[t]; g[s]=0; h.push(s, Math.hypot(N[s].x-T.x, N[s].z-T.z)); var found=false;
      while(h.k.length){ var c=h.pop(); if(closed[c]) continue; closed[c]=1; if(c===t){ found=true; break; }
        for(var q=L.adjStart[c]; q<L.adjStart[c+1]; q++){ var o=L.adjTo[q], e=L.edges[L.adjE[q]]; if(closed[o]) continue;
          if(minW && e.w!=null && e.w < minW) continue;
          var len=e.len!=null?e.len:Math.hypot(N[o].x-N[c].x,N[o].z-N[c].z), cst=g[c]+len*(L.cost[e.kind]||1)*(e.cost||1);
          if(cst<g[o]){ g[o]=cst; from[o]=c; h.push(o, cst+Math.hypot(N[o].x-T.x, N[o].z-T.z)); } } }
      var out = null;
      if(found){ out=[]; for(var k=t;k>=0;k=from[k]){ out.push(k); if(k===s) break; } out.reverse(); }
      L.cache[key] = out; return out;
    },
    route: function(layer, from, to, opt){
      var L=NAVS[layer]; opt=opt||{};
      if(!L){ SIM.routeFail.push({ layer:layer, why:'no layer' }); return null; }
      var pts;
      if(L.kind==='grid'){ L.searches++; var r=L.route(from.x, from.z, to.x, to.z, opt); if(!r){ SIM.routeFail.push({ layer:layer, from:[from.x|0,from.z|0], to:[to.x|0,to.z|0] }); return null; } pts=r.pts; }
      else {
        var s = from.node!=null ? L.idx[from.node] : SIM.nav.nearest(layer, from.x, from.z, opt), t = to.node!=null ? L.idx[to.node] : SIM.nav.nearest(layer, to.x, to.z, opt);
        if(s==null || t==null || s<0 || t<0){ SIM.routeFail.push({ layer:layer, why:'no node', from:[from.x|0,from.z|0], to:[to.x|0,to.z|0] }); return null; }
        var p = SIM.nav.path(layer, s, t, opt.minW);
        if(!p){ SIM.routeFail.push({ layer:layer, why:'no path', from:[from.x|0,from.z|0], to:[to.x|0,to.z|0] }); return null; }
        pts = [[from.x, from.y==null?L.nodes[s].y:from.y, from.z]];
        for(var i=0;i<p.length;i++){ var nd=L.nodes[p[i]]; pts.push([nd.x, nd.y, nd.z]); }
        pts.push([to.x, to.y==null?L.nodes[t].y:to.y, to.z]);
      }
      /* drop repeated points, measure */
      var clean=[pts[0]]; for(var j=1;j<pts.length;j++){ var a=clean[clean.length-1], b=pts[j]; if(Math.hypot(b[0]-a[0],b[2]-a[2]) > 0.05) clean.push(b); }
      if(clean.length===1) clean.push(clean[0].slice());
      var cum=[0]; for(var m=1;m<clean.length;m++) cum.push(cum[m-1]+Math.hypot(clean[m][0]-clean[m-1][0], clean[m][2]-clean[m-1][2]));
      return { pts:clean, cum:cum, len:cum[cum.length-1], layer:layer };
    },
    stats: function(){ var o={}; for(var k in NAVS){ var L=NAVS[k]; o[k]={ kind:L.kind, nodes:L.nodes?L.nodes.length:0, edges:L.edges?L.edges.length:0, searches:L.searches, cacheHits:L.hits||0 }; } return o; }
  };
})(typeof window!=='undefined'?window:globalThis);
