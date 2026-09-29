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
  /* wall: woven split-cane panel over a frame */
  (function(){
    var n=texNoise(S,8,31), w=16;
    FAMMAT.wall.tex = texFinish(texFill(S,function(x,y){
      var cx=Math.floor(x/w), cy=Math.floor(y/w), over=((cx+cy)%2)===0;
      var lx=(x%w)/w, ly=(y%w)/w, t = over ? Math.sin(lx*Math.PI) : Math.sin(ly*Math.PI);
      var frame = (x%(S/2) < 5 || y%(S/2) < 5) ? 0.55 : 1;
      return (0.62 + 0.30*t + 0.12*(n(x,y)-0.5)) * frame;
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
  /* shingle: staggered wooden shakes */
  (function(){
    var n=texNoise(S,32,51), rows=8, rh=S/rows, sw=S/8;
    FAMMAT.shingle.tex = texFinish(texFill(S,function(x,y){
      var r=Math.floor(y/rh), xx=x + (r%2)*sw*0.5, c=Math.floor(xx/sw), lx=(xx%sw)/sw, ly=(y%rh)/rh;
      var tone = h2(c%8, r);
      return (0.62 + 0.26*tone + 0.14*(n(x,y)-0.5) + 0.10*ly) * ((lx<0.05||ly<0.07)?0.5:1);
    }));
  })();
  /* rope: a diagonal twist */
  FAMMAT.rope.tex = texFinish(texFill(64,function(x,y){ return 0.70 + 0.28*Math.sin((x+y)*TAU/16); }), 2);
  /* cloth: a plain weave with a border-ish band */
  (function(){ var n=texNoise(S,16,61);
    FAMMAT.cloth.tex = texFinish(texFill(S,function(x,y){ return 0.80 + 0.08*Math.sin(x*TAU/S*64)*Math.sin(y*TAU/S*64) + 0.12*(n(x,y)-0.5) - ((y%64)<6?0.22:0); })); })();
  /* rock */
  (function(){ var a=texNoise(S,6,71), b=texNoise(S,24,72), c=texNoise(S,64,73);
    FAMMAT.rock.tex = texFinish(texFill(S,function(x,y){ var v=0.55*a(x,y)+0.3*b(x,y)+0.15*c(x,y); return 0.45+0.6*v - (Math.abs(b(x,y)-0.5)<0.025?0.25:0); })); })();
  /* leafy: mottled foliage mass for understorey blobs and crops */
  (function(){ var a=texNoise(S,12,81), b=texNoise(S,40,82);
    FAMMAT.leafy.tex = texFinish(texFill(S,function(x,y){ return 0.52 + 0.45*a(x,y)*b(x,y) + 0.25*(b(x,y)-0.5); })); })();
  /* web: radial-ish strands with holes, alpha-tested */
  (function(){
    var c=texCanvas(S), g=c.getContext('2d'); g.clearRect(0,0,S,S);
    g.strokeStyle='rgba(255,255,255,0.95)'; g.lineWidth=1.6;
    for(var k=0;k<4;k++){ var cx=(k%2)*S/2+S/4, cy=Math.floor(k/2)*S/2+S/4;
      for(var s=0;s<11;s++){ var a=s/11*TAU; g.beginPath(); g.moveTo(cx,cy); g.lineTo(cx+Math.cos(a)*S, cy+Math.sin(a)*S); g.stroke(); }
      for(var r=8;r<S*0.8;r+=9+r*0.06){ g.beginPath(); for(var s2=0;s2<=11;s2++){ var a2=s2/11*TAU, rr2=r*(1+0.06*Math.sin(s2*3.1+r)); var px=cx+Math.cos(a2)*rr2, py=cy+Math.sin(a2)*rr2; if(s2===0) g.moveTo(px,py); else g.lineTo(px,py);} g.stroke(); } }
    g.fillStyle='rgba(255,255,255,0.20)'; g.fillRect(0,0,S,S);
    var t=texFinish(c); FAMMAT.web.tex=t;
  })();

  /* ---- barks (512 for the big trunks). v runs up the trunk. ---- */
  var B=512;
  /* 0 Ironbark: deep braided furrows between broad fibrous ridges */
  (function(){ var n1=texNoise(B,64,91), n2=texNoise(B,8,92), n3=texNoise(B,16,93), n4=texNoise(B,4,94);
    FAMMAT.bark0.tex = texFinish(texFill(B,function(x,y){
      var w = x + 44*n3(x*0.5, y*0.10) + 18*n4(x, y*0.5);
      var f = Math.abs(Math.sin(w*TAU/B*3 + 2.2*n2(x,y*0.25)));
      var f2 = Math.abs(Math.sin((x + 12*n3(x, y*0.2))*TAU/B*13));
      var fine = n1(x, y*0.08), crack = n1(x*0.25, y) > 0.80 ? 0.10 : 0;
      return 0.16 + 0.60*Math.pow(f,0.55) + 0.14*Math.pow(f2,0.8)*f + 0.20*(fine-0.5) + 0.14*(n2(x,y)-0.5) - crack;
    }));
  })();
  /* 1 Ghostwood: chalk-white, grey peel patches, long horizontal lenticels and big dark eye-scars */
  (function(){ var n1=texNoise(B,6,101), n2=texNoise(B,96,102), n3=texNoise(B,14,103);
    var c=texFill(B,function(x,y){ var peel=smooth(0.62,0.72,n1(x,y*0.6)); return 0.93 - 0.17*peel + 0.08*(n3(x,y*0.5)-0.5) + 0.06*(n2(x,y)-0.5); });
    var g=c.getContext('2d');
    for(var i=0;i<120;i++){ var x=h2(i,5)*B, y=h2(i,9)*B, big=h2(i,3)<0.25, w=big?(40+h2(i,13)*70):(6+h2(i,13)*30), hh=big?(3+h2(i,17)*4):(1+h2(i,17)*2.4);
      g.fillStyle='rgba(40,36,30,'+(0.40+0.5*h2(i,21)).toFixed(2)+')';
      for(var wx=-1;wx<=1;wx++){ g.beginPath(); g.ellipse(x+wx*B,y,w,hh,0,0,TAU); g.fill(); } }
    for(var j=0;j<11;j++){ var x2=h2(j,31)*B, y2=h2(j,37)*B, r=(j<4?30:12)+h2(j,41)*22;
      for(var wx2=-1;wx2<=1;wx2++) for(var wy=-1;wy<=1;wy++){ var X=x2+wx2*B, Y=y2+wy*B;
        g.fillStyle='rgba(30,26,22,0.88)';
        g.beginPath(); g.moveTo(X-r,Y); g.quadraticCurveTo(X,Y-r*0.95,X+r,Y); g.quadraticCurveTo(X,Y+r*0.40,X-r,Y); g.fill();
        g.strokeStyle='rgba(60,54,46,0.55)'; g.lineWidth=2.5;
        g.beginPath(); g.moveTo(X-r*1.5,Y+r*0.25); g.quadraticCurveTo(X,Y-r*1.5,X+r*1.5,Y+r*0.25); g.stroke(); } }
    FAMMAT.bark1.tex = texFinish(c);
  })();
  /* 2 Prism gum: long vertical peels in the palette's rainbow — COLOUR texture */
  (function(){ var n1=texNoise(B,10,111), n2=texNoise(B,48,112), n3=texNoise(B,5,113);
    var cols = PAL.bark[2].map(function(h){ var c=new THREE.Color(h); return [c.r,c.g,c.b]; });
    FAMMAT.bark2.tex = texFinish(texFill(B,function(x,y){
      var w = x + 60*n1(x*0.6, y*0.10) + 16*n2(x,y*0.2);
      var band = (w/B*6) % cols.length; if(band<0) band+=cols.length;
      var i=Math.floor(band), f=band-i, a=cols[i], b=cols[(i+1)%cols.length];
      f = smooth(0.30,0.70,f);
      var l = 0.86 + 0.22*(n3(x,y)-0.5) + 0.12*(n2(x,y*0.3)-0.5);
      return [mix(a[0],b[0],f)*l, mix(a[1],b[1],f)*l, mix(a[2],b[2],f)*l];
    }));
    FAMMAT.bark2.colour = true;
  })();
  /* 3 Baobab: smooth, swollen, shallow wrinkles and a pitted skin */
  (function(){ var n1=texNoise(B,7,121), n2=texNoise(B,40,122), n3=texNoise(B,120,123);
    FAMMAT.bark3.tex = texFinish(texFill(B,function(x,y){
      var wr = Math.abs(Math.sin((y + 30*n1(x,y))*TAU/B*7));
      return 0.62 + 0.26*(n1(x,y)-0.5) + 0.20*Math.pow(wr,2.5) + 0.10*Math.sin((x+50*n1(x*0.5,y*0.3))*TAU/B*4) + 0.10*(n2(x,y)-0.5) - (n3(x,y)>0.82?0.16:0);
    }));
  })();
})();
