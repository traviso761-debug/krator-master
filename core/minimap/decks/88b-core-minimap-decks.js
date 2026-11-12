// ================================================================= CORE — minimap decks: storeys, above/below marks, the line map  [G data]
// core/minimap/decks/88b-core-minimap-decks.js (core/host/UNDERGROUND.md; kits/tungang/PLAN.md section 6.3, view 4). OPT-IN BY FILE:
// a subfolder, so the builds that read core/minimap/ whole do not take it; a build lists it after 88 and 88a (core/host/host.py
// UNDERGROUND). It adds to every plan KMAP.create makes; a plan that never calls these draws and exports exactly as before.
//
// A top-down map lies underground: storeys stack. So:
//   M.walkBands(W, colourOf(y, floor))   every KWALK floor as fromWalk draws it, each record keeping its height (r.h): the records the
//                                        band reads (records with no height, the ground's plan, are never dimmed)
//   M.band(y0, y1 | null, {dim: .28, marks: true})   the current band: records whose height is in [y0, y1] drawn bright and on top,
//                                        the rest dimmed toward the background; with marks, every NAMED record outside the band gets
//                                        an arrow at its middle, up for above, down for below (World of Warcraft's minimap arrows)
//   M.mark(x, z, dy, {name, col})        a mark by hand (a lift, a stair head): up when dy > 0, down when dy < 0
//   M.bandOf(r) -> 'in' | 'above' | 'below' | null    how a record stands to the band (null: it has no height or there is no band)
//   M.schematic(nodes, edges, o) -> L    the line map, Tube style: nodes {id, name, kind: 'station' | 'loj' | 'junction' | 'lift' |
//                                        'gap', x (along the line: chainage, any unit), depth (down the page: metres under the
//                                        datum), col}; edges {a, b, state: 'solid' | 'gap' (a dashed walk), time (minutes, written on
//                                        a gap), line (a name), col}. o {title, w: 320, h: 160, pad: 18, lines: {name: '#hex'}}.
//                                        L.layout() -> {nodes: [{id, px, py}], edges}; L.paint(g, w?, h?) draws it on a 2D-context-like g;
//                                        L.at(px, py) the node nearest a point on it; L.export(). Throws on an edge to a missing node
//   M.export()                           as before, plus {bands: {band, dim}, heights: [r.h per record, null where none], marks,
//                                        schematic: L.export() or null}
(function(root){
  'use strict';
  var KM=root.KMAP;if(!KM||!KM.create)throw new Error('88b-core-minimap-decks: load core/minimap/88-core-minimap.js first');
  var create=KM.create;
  function hexRgb(c){if(typeof c!=='string')return null;var m=/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(c);if(!m)return null;var h=m[1];
    if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];}
  function mix(a,b,t){var A=hexRgb(a),B=hexRgb(b)||[16,20,24];if(!A)return a;
    var c=[0,1,2].map(function(i){return Math.round(A[i]*t+B[i]*(1-t));});return '#'+c.map(function(v){return ('0'+v.toString(16)).slice(-2);}).join('');}
  function schematic(nodes,edges,o){o=o||{};var byId={},W=o.w==null?320:o.w,Hh=o.h==null?160:o.h,pad=o.pad==null?18:o.pad,lines=o.lines||{};
    nodes.forEach(function(n){if(!n.id)throw new Error('KMAP.schematic: a node needs an id');if(byId[n.id])throw new Error('KMAP.schematic: duplicate node '+n.id);byId[n.id]=n;});
    edges.forEach(function(e){if(!byId[e.a]||!byId[e.b])throw new Error('KMAP.schematic: edge '+e.a+'-'+e.b+' names a missing node');
      if(e.state&&e.state!=='solid'&&e.state!=='gap')throw new Error('KMAP.schematic: edge state is solid or gap, not '+e.state);});
    function layout(w,h){w=w==null?W:w;h=h==null?Hh:h;var xs=nodes.map(function(n,i){return n.x==null?i:n.x;}),ds=nodes.map(function(n){return n.depth==null?0:n.depth;});
      var x0=Math.min.apply(null,xs),x1=Math.max.apply(null,xs),d0=Math.min.apply(null,ds),d1=Math.max.apply(null,ds);if(x1===x0)x1=x0+1;if(d1===d0)d1=d0+1;
      var top=pad+(o.title?12:0),P={};nodes.forEach(function(n,i){P[n.id]={id:n.id,px:pad+(xs[i]-x0)/(x1-x0)*(w-2*pad),py:top+(ds[i]-d0)/(d1-d0)*(h-top-pad)};});
      return {nodes:nodes.map(function(n){return P[n.id];}),edges:edges.map(function(e){return {a:P[e.a],b:P[e.b],e:e};}),byId:P};}
    function paint(g,w,h){w=w==null?W:w;h=h==null?Hh:h;var L=layout(w,h);g.fillStyle=o.bg||'#14110e';g.fillRect(0,0,w,h);
      if(o.title){g.font='10px Helvetica,Arial,sans-serif';g.fillStyle='#d8c89a';g.fillText(o.title,pad,12);}
      L.edges.forEach(function(E){var e=E.e,col=e.col||lines[e.line]||'#4fb06a';g.strokeStyle=col;g.lineWidth=e.state==='gap'?2:4;g.lineCap='round';
        if(g.setLineDash)g.setLineDash(e.state==='gap'?[4,4]:[]);g.beginPath();g.moveTo(E.a.px,E.a.py);g.lineTo(E.b.px,E.b.py);g.stroke();
        if(e.state==='gap'&&e.time!=null){g.font='9px Helvetica,Arial,sans-serif';g.fillStyle='#e8dcc0';g.fillText(e.time+' min walk',(E.a.px+E.b.px)/2-18,(E.a.py+E.b.py)/2-5);}});
      if(g.setLineDash)g.setLineDash([]);
      nodes.forEach(function(n){var p=L.byId[n.id],k=n.kind||'station',col=n.col||'#f2ead6';g.fillStyle=col;g.strokeStyle='#14110e';g.lineWidth=1.5;g.beginPath();
        if(k==='loj'){g.rect(p.px-5,p.py-5,10,10);}
        else if(k==='lift'){g.moveTo(p.px,p.py-6);g.lineTo(p.px+6,p.py);g.lineTo(p.px,p.py+6);g.lineTo(p.px-6,p.py);g.closePath();}
        else if(k==='junction'){g.arc(p.px,p.py,3,0,Math.PI*2);}
        else if(k==='gap'){g.arc(p.px,p.py,4,0,Math.PI*2);g.fillStyle='#14110e';}
        else g.arc(p.px,p.py,5,0,Math.PI*2);
        g.fill();g.stroke();if(k==='gap'){g.strokeStyle=col;g.stroke();}
        if(n.name){g.font='9px Helvetica,Arial,sans-serif';g.fillStyle='#e8e0cc';var tw=g.measureText?g.measureText(n.name).width:n.name.length*4.5;
          g.fillText(n.name,p.px+7+tw>w-2?p.px-7-tw:p.px+7,p.py+(k==='junction'?-4:12));}});
      return L;}
    function at(px,py,w,h){var L=layout(w,h),best=null,bd=1e9;L.nodes.forEach(function(p){var d=Math.hypot(p.px-px,p.py-py);if(d<bd){bd=d;best=byId[p.id];}});return bd<14?best:null;}
    function exp(){return {nodes:nodes.map(function(n){return {id:n.id,name:n.name||'',kind:n.kind||'station',x:n.x==null?null:n.x,depth:n.depth==null?0:n.depth,col:n.col||null};}),
      edges:edges.map(function(e){return {a:e.a,b:e.b,state:e.state||'solid',time:e.time==null?null:e.time,line:e.line||'',col:e.col||null};}),
      title:o.title||'',lines:Object.assign({},lines)};}
    return {layout:layout,paint:paint,at:at,export:exp,nodes:nodes,edges:edges};}
  KM.schematic=schematic;
  KM.create=function(op){var M=create(op);var bg=(op&&op.bg)||'#101418';
    var band=null,dim=.28,marksOn=true,hand=[],brev=0,sch=null;
    var rev0=M.rev,paint0=M.paint,export0=M.export;
    /* 88's fromWalk reads rect and strip floors; a carved room (KCAVERN) is a poly floor, drawn here as its box */
    M.walkBands=function(W,colourOf){var n0=M.records.length;
      W.floors.forEach(function(fl){var y,r,o2;
        if(fl.kind==='rect')y=fl.y;else if(fl.kind==='strip')y=(fl.a[2]+fl.b[2])/2;else if(fl.pts&&fl.pts.length){y=0;fl.pts.forEach(function(p){y+=p[2]==null?0:p[2];});y/=fl.pts.length;}else return;
        o2={y:y,col:colourOf?colourOf(y,fl):'',tag:fl.tag,name:fl.name};
        if(fl.kind==='rect')r=M.rect(fl.rect[0],fl.rect[1],fl.rect[2],fl.rect[3],o2);
        else if(fl.kind==='strip')r=M.strip([fl.a[0],fl.a[1]],[fl.b[0],fl.b[1]],fl.w,o2);
        else{var x0=1e30,x1=-1e30,z0=1e30,z1=-1e30;fl.pts.forEach(function(p){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1]);});r=M.rect(x0,x1,z0,z1,o2);}
        r.h=y;});
      brev++;return M.records.length-n0;};
    M.bandOf=function(r){if(!band||r.h==null)return null;return r.h<band[0]?'below':r.h>band[1]?'above':'in';};
    M.band=function(y0,y1,o){o=o||{};if(y0==null){if(band){band=null;brev++;}return null;}
      var b=[Math.min(y0,y1),Math.max(y0,y1)];if(!band||b[0]!==band[0]||b[1]!==band[1]||(o.dim!=null&&o.dim!==dim)||(o.marks!=null&&o.marks!==marksOn)){band=b;brev++;}
      if(o.dim!=null)dim=o.dim;if(o.marks!=null)marksOn=!!o.marks;return band;};
    M.mark=function(x,z,dy,o){o=o||{};var m={x:x,z:z,dy:dy,name:o.name||'',col:o.col||''};hand.push(m);brev++;return m;};
    M.schematic=function(nodes,edges,o){sch=schematic(nodes,edges,o);brev++;return sch;};
    M.rev=function(){return rev0()+brev*1000003;};
    function arrow(g,px,py,up,col){g.fillStyle=col||(up?'#9fd3ff':'#e0a070');g.strokeStyle='rgba(0,0,0,.7)';g.lineWidth=1;g.beginPath();
      if(up){g.moveTo(px,py-5);g.lineTo(px+4,py+3);g.lineTo(px-4,py+3);}else{g.moveTo(px,py+5);g.lineTo(px+4,py-3);g.lineTo(px-4,py-3);}g.closePath();g.fill();g.stroke();}
    function centre(r){if(r.kind==='rect')return [(r.rect[0]+r.rect[1])/2,(r.rect[2]+r.rect[3])/2];if(r.kind==='strip')return [(r.a[0]+r.b[0])/2,(r.a[1]+r.b[1])/2];return [r.x,r.z];}
    M.paint=function(g,reliefImage){if(!band){paint0(g,reliefImage);}
      else{var ex=export0().records,cols={},keep=[];M.records.forEach(function(r){keep.push([r,r.col,r.y]);});
        var bySeq=M.records.slice().sort(function(p,q){return p.y-q.y||p.seq-q.seq;});bySeq.forEach(function(r,i){cols[r.seq]=ex[i].col;});
        M.records.forEach(function(r){var s=M.bandOf(r);if(s==='in')r.y=r.y+1e6;else if(s){r.col=mix(cols[r.seq],bg,dim);}});
        try{paint0(g,reliefImage);}finally{keep.forEach(function(k){k[0].col=k[1];k[0].y=k[2];});}
        if(marksOn)M.records.forEach(function(r){var s=M.bandOf(r);if(!s||s==='in'||!r.name||r.kind==='label')return;var c=centre(r),p=M.toPx(c[0],c[1]);arrow(g,p[0],p[1],s==='above');});}
      hand.forEach(function(m){var p=M.toPx(m.x,m.z);arrow(g,p[0],p[1],m.dy>0,m.col);});};
    M.export=function(){var e=export0();var ord=M.records.slice().sort(function(p,q){return p.y-q.y||p.seq-q.seq;});
      e.heights=ord.map(function(r){return r.kind==='label'||r.h==null?null:r.h;});
      e.bands={band:band?band.slice():null,dim:dim,marks:marksOn};e.marks=hand.map(function(m){return {x:m.x,z:m.z,dy:m.dy,name:m.name,col:m.col||null};});
      e.schematic=sch?sch.export():null;return e;};
    M.schematicOf=function(){return sch;};
    return M;};
})(typeof window!=='undefined'?window:globalThis);
