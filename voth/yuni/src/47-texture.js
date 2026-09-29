/* ============================== 11. TEXTURES ==============================
   Procedural, seamless-tiling canvases. GRAYSCALE is the rule (the vertex /
   instance colour does the tinting) — the one exception is bark2, the Prism
   gum, whose rainbow streaks are the whole point of the species.
   Fills FAMMAT[fam].tex. Runs before anything is emitted.                  */
reseed(470001);

function texCanvas(S){ var c=document.createElement('canvas'); c.width=c.height=S; return c; }
function texFinish(c, aniso){
  var t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = FAST ? 1 : (aniso||8);
  t.encoding = THREE.sRGBEncoding; return t;
}
/* tileable value noise on a canvas-sized torus */
function texNoise(S, cells, sd){
  var g=[]; for(var i=0;i<cells*cells;i++) g.push(h2(i*7+sd, i*13+sd*3));
  return function(x,y){
    var fx=x/S*cells, fy=y/S*cells, i=Math.floor(fx), j=Math.floor(fy), u=fx-i, v=fy-j;
    u=u*u*(3-2*u); v=v*v*(3-2*v);
    function G(a,b){ return g[((b%cells+cells)%cells)*cells + ((a%cells+cells)%cells)]; }
    return G(i,j)*(1-u)*(1-v)+G(i+1,j)*u*(1-v)+G(i,j+1)*(1-u)*v+G(i+1,j+1)*u*v;
  };
}
function texFill(S, fn){
  var c=texCanvas(S), g=c.getContext('2d'), im=g.createImageData(S,S), d=im.data;
  for(var y=0;y<S;y++) for(var x=0;x<S;x++){
    var v=fn(x,y), o=(y*S+x)*4;
    if(typeof v==='number'){ v=clamp(v,0,1)*255; d[o]=d[o+1]=d[o+2]=v; d[o+3]=255; }
    else { d[o]=clamp(v[0],0,1)*255; d[o+1]=clamp(v[1],0,1)*255; d[o+2]=clamp(v[2],0,1)*255; d[o+3]=v.length>3?clamp(v[3],0,1)*255:255; }
  }
  g.putImageData(im,0,0); return c;
}

(function(){
  var S=256;
  /* planks: boards running along v, with gaps, grain and the odd knot */
  (function(){
    var n1=texNoise(S,32,11), n2=texNoise(S,6,12), boards=6, bw=S/boards;
    var off=[]; for(var i=0;i<boards;i++) off.push(h2(i,77));
    FAMMAT.plank.tex = texFinish(texFill(S,function(x,y){
      var b=Math.floor(x/bw), lx=(x%bw)/bw, edge=Math.min(lx,1-lx);
      var grain = 0.5+0.5*Math.sin(x*TAU/S*40 + n1(x, y*0.25)*9);
      var butt = ((y + off[b]*S) % (S/2)) < 2 ? 0.55 : 1;
      return (0.78 + 0.16*off[b] + 0.10*(grain-0.5) + 0.10*(n2(x,y)-0.5)) * (edge<0.035?0.45:1) * butt;
    }));
  })();
  /* timber: heavy adzed beam, grain along v */
  (function(){
    var n1=texNoise(S,48,21), n2=texNoise(S,5,22);
    FAMMAT.timber.tex = texFinish(texFill(S,function(x,y){
      var g = 0.5+0.5*Math.sin(x*TAU/S*22 + n1(x,y*0.18)*7);
      return 0.74 + 0.20*(g-0.5) + 0.18*(n2(x,y)-0.5);
    }));
  })();
  /* thatch: layered courses of reed ends */
  (function(){
    var n=texNoise(S,64,41), n2=texNoise(S,4,42), rows=8, rh=S/rows;
    FAMMAT.thatch.tex = texFinish(texFill(S,function(x,y){
      var ly=(y%rh)/rh, strand = n(x*1.0, y*0.12);
      return 0.60 + 0.30*ly + 0.22*(strand-0.5) + 0.12*(n2(x,y)-0.5) - (ly<0.08?0.25:0);
    }));
  })();
  /* cloth: a plain weave with a border-ish band */
  (function(){ var n=texNoise(S,16,61);
    FAMMAT.cloth.tex = texFinish(texFill(S,function(x,y){ return 0.80 + 0.08*Math.sin(x*TAU/S*64)*Math.sin(y*TAU/S*64) + 0.12*(n(x,y)-0.5) - ((y%64)<6?0.22:0); })); })();
  /* rock */
  (function(){ var a=texNoise(S,6,71), b=texNoise(S,24,72), c=texNoise(S,64,73);
    FAMMAT.rock.tex = texFinish(texFill(S,function(x,y){ var v=0.55*a(x,y)+0.3*b(x,y)+0.15*c(x,y); return 0.45+0.6*v - (Math.abs(b(x,y)-0.5)<0.025?0.25:0); })); })();
  /* rust: plated weathering steel — seams, rivet rows, streaks running down */
  (function(){ var a=texNoise(S,6,131), b=texNoise(S,28,132), c=texNoise(S,90,133);
    FAMMAT.rust.tex = texFinish(texFill(S,function(x,y){
      var seam = (x%128 < 3 || y%128 < 3) ? 0.55 : 1, rivet = ((x%128>8 && x%128<14 && y%16<5) || (y%128>8 && y%128<14 && x%16<5)) ? 1.18 : 1;
      var streak = 0.5+0.5*b(x, y*0.12);
      return (0.58 + 0.30*(a(x,y)-0.5) + 0.26*(streak-0.5) + 0.22*(c(x,y)-0.5)) * seam * rivet; })); })();
  /* concrete: board-marked, stained, cracked */
  (function(){ var a=texNoise(S,5,141), b=texNoise(S,36,142), c=texNoise(S,100,143);
    FAMMAT.concrete.tex = texFinish(texFill(S,function(x,y){
      var board = (y%32 < 2) ? 0.80 : 1, crack = Math.abs(b(x,y)-0.5) < 0.012 ? 0.6 : 1;
      return (0.70 + 0.26*(a(x,y)-0.5) + 0.12*(c(x,y)-0.5) - 0.10*smooth(0.55,0.9,b(x*0.3,y))) * board * crack; })); })();
  /* leafy: mottled foliage mass for understorey blobs and crops */
  (function(){ var a=texNoise(S,12,81), b=texNoise(S,40,82);
    FAMMAT.leafy.tex = texFinish(texFill(S,function(x,y){ return 0.52 + 0.45*a(x,y)*b(x,y) + 0.25*(b(x,y)-0.5); })); })();
  /* adobe: hand-smoothed mud plaster, palm-swipe arcs, straw flecks, hairline cracks */
  (function(){ var a=texNoise(S,5,201), b=texNoise(S,22,202), c=texNoise(S,96,203);
    FAMMAT.adobe.tex = texFinish(texFill(S,function(x,y){
      var swipe = 0.5+0.5*Math.sin((y + 22*Math.sin(x*TAU/S*2))*TAU/S*7 + b(x,y)*3);
      var crack = Math.abs(b(x,y)-0.5) < 0.010 ? 0.72 : 1, fleck = c(x,y) > 0.86 ? 1.10 : 1;
      return (0.78 + 0.16*(a(x,y)-0.5) + 0.07*(swipe-0.5) + 0.10*(c(x,y)-0.5)) * crack * fleck; })); })();
  /* plaster: lime wash, brushy, faint water marks low on the wall */
  (function(){ var a=texNoise(S,4,211), b=texNoise(S,40,212);
    FAMMAT.plaster.tex = texFinish(texFill(S,function(x,y){
      return 0.90 + 0.10*(a(x,y)-0.5) + 0.06*(b(x*0.3,y)-0.5) - 0.06*smooth(0.62,0.95,a(x+90,y)); })); })();
  /* relief: moulded low-relief bands — interlace knots and spirals between plain courses */
  (function(){ var a=texNoise(S,6,221);
    FAMMAT.relief.tex = texFinish(texFill(S,function(x,y){
      var cx=(x%64)-32, cy=(y%64)-32, r=Math.hypot(cx,cy), an=Math.atan2(cy,cx);
      var row=Math.floor(y/64)%2, v;
      if(row===0){ var sp=Math.sin(r*0.55 - an*1.0); v = r<28 ? 0.80+0.20*sp : 0.74; }
      else { var k=Math.max(Math.abs(cx),Math.abs(cy)), d2=Math.abs(cx)+Math.abs(cy); v = (k<26 && (Math.abs(d2-26)<4 || Math.abs(k-14)<3)) ? 1.0 : 0.76; }
      if(y%64<3) v=0.62;
      return v*(0.94+0.12*(a(x,y)-0.5)); })); })();
  /* mosaic: trencadis — irregular broken-tile cells with dark grout, tone per shard */
  (function(){ var cells=14, pts=[];
    for(var j=0;j<cells;j++) for(var i=0;i<cells;i++) pts.push([(i+h2(i*3+1,j*5+2))/cells*S, (j+h2(i*7+3,j*11+4))/cells*S, h2(i*13+5,j*17+6)]);
    FAMMAT.mosaic.tex = texFinish(texFill(S,function(x,y){
      var ci=Math.floor(x/S*cells), cj=Math.floor(y/S*cells), d1=1e9, d2=1e9, tone=0;
      for(var dj=-1;dj<=1;dj++) for(var di=-1;di<=1;di++){
        var ii=((ci+di)%cells+cells)%cells, jj=((cj+dj)%cells+cells)%cells, P=pts[jj*cells+ii];
        var px=P[0]+(ci+di-ii)/cells*S, py=P[1]+(cj+dj-jj)/cells*S, d=Math.hypot(x-px,y-py);
        if(d<d1){ d2=d1; d1=d; tone=P[2]; } else if(d<d2) d2=d; }
      return (d2-d1 < 1.6) ? 0.36 : 0.70 + 0.36*tone; })); })();
  /* paintbw: bands of chevrons, diamonds, nets and triangles in black / white / earth red (COLOUR texture) */
  (function(){ var n=texNoise(S,48,231);
    var K=[0.10,0.09,0.08], W=[0.95,0.93,0.86], R=[0.62,0.20,0.13], O=[0.78,0.56,0.32];
    FAMMAT.paintbw.tex = texFinish(texFill(S,function(x,y){
      var band=Math.floor(y/32)%8, ly=(y%32)/32, u=(x%32)/32, c;
      if(y%32<2) c=K;
      else if(band===0||band===4){ var z=Math.abs(((u*2+ly)%1)-0.5)*2; c = (Math.floor((u*2+ (ly<0.5?ly:1-ly))*2)%2) ? K : W; }
      else if(band===1){ var d=Math.abs(u-0.5)+Math.abs(ly-0.5); c = d<0.22?R : d<0.40?W : K; }
      else if(band===2||band===6){ c = (Math.abs(((u+ly)%0.25)-0.125)<0.03 || Math.abs((((u-ly)%0.25)+0.25)%0.25-0.125)<0.03) ? K : W; }
      else if(band===3){ c = (ly < Math.abs(u-0.5)*2) ? R : O; }
      else if(band===5){ c = (ly > 1-Math.abs(u-0.5)*2) ? K : W; }
      else { var d3=Math.abs(u-0.5)+Math.abs(ly-0.5); c = (Math.floor(d3*8)%2) ? K : O; }
      var w=0.92+0.16*(n(x,y)-0.5); return [c[0]*w,c[1]*w,c[2]*w]; })); })();
  /* paintcol: Hausa zanko-style polychrome relief — interlaced knots, rosettes and spirals on a ground (COLOUR) */
  (function(){ var n=texNoise(S,40,241);
    var G=[0.93,0.80,0.36], B=[0.16,0.45,0.72], R=[0.72,0.20,0.16], E=[0.14,0.48,0.30], W=[0.96,0.94,0.88], T=[0.10,0.62,0.66];
    FAMMAT.paintcol.tex = texFinish(texFill(S,function(x,y){
      var cx=(x%64)-32, cy=(y%64)-32, r=Math.hypot(cx,cy), an=Math.atan2(cy,cx), id=(Math.floor(x/64)+2*Math.floor(y/64))%4, c=G;
      if(x%64<3||y%64<3) c=E;
      else if(id===0){ var pet=Math.cos(an*4)*10+16; c = r<5?R : r<pet?B : r<pet+3?W : G; }
      else if(id===1){ var k=Math.max(Math.abs(cx),Math.abs(cy)), d=Math.abs(cx)+Math.abs(cy); c = Math.abs(d-24)<3?R : Math.abs(k-16)<3?T : (k<8?E:G); }
      else if(id===2){ var sp=Math.sin(r*0.6-an); c = r<26 ? (sp>0.3?B : sp<-0.5?R : W) : G; }
      else { c = (Math.abs(Math.abs(cx)-14)<3 || Math.abs(Math.abs(cy)-14)<3) ? E : (r<7?R:G); }
      var w=0.92+0.16*(n(x,y)-0.5); return [c[0]*w,c[1]*w,c[2]*w]; })); })();
  /* metal: Ancient white panels 2 x 1 m: recessed seams, corner fasteners, brushed grain, slow tarnish */
  (function(){ var a=texNoise(S,5,251), b=texNoise(S,80,252);
    FAMMAT.metal.tex = texFinish(texFill(S,function(x,y){
      var fx=x%128, fy=y%128, sd=Math.min(fx,127-fx,fy,127-fy), tone=h2(Math.floor(x/128)+3, Math.floor(y/128)+9);
      var v = 0.88 + 0.06*(tone-0.5) + 0.10*(a(x,y)-0.5) + 0.04*(b(x,y*0.2)-0.5);
      if(sd<2) v-=0.26; else if(sd<4) v+=0.04;
      if(Math.hypot(Math.min(fx,127-fx)-9, Math.min(fy,127-fy)-9) < 2.4) v-=0.14;
      return v - 0.10*smooth(0.6,0.9,a(x+50,y+20)); })); })();
  /* glass: faint mullion grid, sky-sheen gradient per pane */
  (function(){ var a=texNoise(S,6,261);
    FAMMAT.glass.tex = texFinish(texFill(S,function(x,y){ var fx=x%64, fy=y%128;
      return (fx<3||fy<3) ? 0.35 : 0.72 + 0.22*(1-fy/128) + 0.10*(a(x,y)-0.5); })); })();
  /* column: the butte. Vertical polygonal columns: dark joints, per-column tone, horizontal cross-fractures, lichen */
  (function(){ var B=512, a=texNoise(B,6,271), b=texNoise(B,64,272), c=texNoise(B,18,273);
    var cols=9, cw=B/cols;
    FAMMAT.column.tex = texFinish(texFill(B,function(x,y){
      var xx = x + 5*Math.sin(y*TAU/B*2) , ci=Math.floor(xx/cw), lx=((xx%cw)+cw)%cw/cw, edge=Math.min(lx,1-lx);
      var tone=h2(((ci%cols)+cols)%cols, 5), fr = ((y + tone*400)%(90+tone*70)) < 2.5 ? 0.70 : 1;
      var round = 0.80 + 0.20*Math.sin(lx*Math.PI);
      return (0.66 + 0.20*(tone-0.5) + 0.16*(a(x,y)-0.5) + 0.10*(b(x,y)-0.5)) * round * (edge<0.04?0.55:1) * fr + 0.06*smooth(0.6,0.8,c(x,y)); }));
  })();
  /* tile: overlapping terracotta pan tiles */
  (function(){ var n=texNoise(S,32,281), rows=8, rh=S/rows, sw=S/8;
    FAMMAT.tile.tex = texFinish(texFill(S,function(x,y){
      var r=Math.floor(y/rh), lx=(x%sw)/sw, ly=(y%rh)/rh, tone=h2(Math.floor(x/sw)%8, r+40);
      return (0.62 + 0.24*tone + 0.22*Math.sin(lx*Math.PI) + 0.10*(n(x,y)-0.5)) * (ly<0.10?0.55:1); })); })();
  /* bark */
  (function(){ var n1=texNoise(S,48,291), n2=texNoise(S,6,292);
    FAMMAT.bark.tex = texFinish(texFill(S,function(x,y){ var g=0.5+0.5*Math.sin(x*TAU/S*14 + n1(x,y*0.2)*6);
      return 0.66 + 0.30*(g-0.5) + 0.2*(n2(x,y)-0.5); })); })();
})();
