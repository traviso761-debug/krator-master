/* ==== 12b. TEXTURES ==== */
await stage('textures');   /* the loading screen (src/core/diag.js) gets a frame to say so */
reseed(470001);

var TEXSZ = FAST ? 128 : 256;

function texCanvas(fn, sz){
  sz = sz || TEXSZ;
  var c = document.createElement('canvas'); c.width = c.height = sz;
  var g = c.getContext('2d');
  g.fillStyle = '#ffffff'; g.fillRect(0,0,sz,sz);
  fn(g, sz);
  var t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  t.encoding = THREE.sRGBEncoding;
  return t;
}

/* grain: fine per-pixel noise laid over whatever is already drawn */
function grain(g, S, amt, cell){
  cell = cell || 2;
  for(var y=0; y<S; y+=cell) for(var x=0; x<S; x+=cell){
    var v = 1 - amt*rnd();
    g.fillStyle = 'rgba(0,0,0,' + (1-v).toFixed(3) + ')';
    g.fillRect(x,y,cell,cell);
  }
}
function lineH(g,y,S,a,w){ g.strokeStyle='rgba(0,0,0,'+a+')'; g.lineWidth=w||1;
  g.beginPath(); g.moveTo(0,y+0.5); g.lineTo(S,y+0.5); g.stroke(); }

function periodicLattice(L){
  var t = [];
  for(var i=0;i<L;i++){ var row=[]; for(var j=0;j<L;j++) row.push(rnd()); t.push(row); }
  return t;
}
function noiseP(x, y, L, table){
  var i=Math.floor(x), j=Math.floor(y), fx=x-i, fy=y-j;
  var ii=((i%L)+L)%L, jj=((j%L)+L)%L, ii1=(ii+1)%L, jj1=(jj+1)%L;
  var u=fx*fx*(3-2*fx), v=fy*fy*(3-2*fy);
  var a=table[ii][jj], b=table[ii1][jj], c=table[ii][jj1], d=table[ii1][jj1];
  return a*(1-u)*(1-v) + b*u*(1-v) + c*(1-u)*v + d*u*v;
}
var TEX_STONE = texCanvas(function(g,S){
  var rows = 8, h = S/rows, cols = 6, w = S/cols;
  grain(g,S,0.08,2);

  var NL = [4, 9, 19, 41];
  var NW = [0.5, 0.25, 0.125, 0.0625];
  var NT = NL.map(function(L){ return periodicLattice(L); });
  function stoneNoise(x, y){
    var n = 0;
    for(var k=0;k<NL.length;k++) n += NW[k]*noiseP(x*NL[k]/S, y*NL[k]/S, NL[k], NT[k]);
    return n/0.9375; // ~0..1, matches fbm()'s own normalisation
  }

  var cell = 3;
  for(var y=0;y<S;y+=cell) for(var x=0;x<S;x+=cell){
    var n = stoneNoise(x,y);
    g.fillStyle = 'rgba(0,0,0,' + (0.03 + 0.17*n).toFixed(3) + ')';
    g.fillRect(x,y,cell,cell);
  }

  for(var r=0;r<rows;r++){
    var y = r*h, off = (r%2) ? w*0.5 : 0;
    for(var c=0;c<cols;c++){
      var x = (c*w + off) % S;

      var bn = stoneNoise(x+w*0.5, y+h*0.5);
      g.fillStyle = 'rgba(0,0,0,' + (0.015 + 0.03*bn + 0.02*rnd()).toFixed(3) + ')';
      g.fillRect(x+1, y+1, w-2, h-2);
      /* crisp mortar joint */
      g.fillStyle = 'rgba(0,0,0,0.20)';
      g.fillRect(x, y, 1.1, h);
      if(x+w > S){ g.fillRect(x-S, y, 1.1, h); }

      g.fillStyle = 'rgba(0,0,0,0.07)';
      g.fillRect(x+1.6, y, 0.8, h);
    }
    lineH(g, y, S, 0.22, 1.1);
  }
}, Math.round(TEXSZ*1.5));

var TEX_PLASTER = texCanvas(function(g,S){
  /* coarse hand-applied render, rougher grain than stone's fine dressing */
  grain(g,S,0.16,3);

  for(var i=0;i<32;i++){
    var x=rnd()*S, y=rnd()*S, r=rr(S*0.04,S*0.17);
    var a=0.05+0.10*rnd();
    var gr=g.createRadialGradient(x,y,0,x,y,r);
    gr.addColorStop(0,'rgba(0,0,0,'+a.toFixed(3)+')');
    gr.addColorStop(0.65,'rgba(0,0,0,'+(a*0.4).toFixed(3)+')');
    gr.addColorStop(1,'rgba(0,0,0,0)');
    g.fillStyle=gr; g.beginPath(); g.arc(x,y,r,0,6.284); g.fill();
  }

  var bRows = 5, bh = S/bRows;
  for(var br=0; br<bRows; br++){
    var by = br*bh + rr(-bh*0.18, bh*0.18);
    if(chance(0.7)){
      g.strokeStyle = 'rgba(0,0,0,' + (0.05+0.04*rnd()).toFixed(3) + ')';
      g.lineWidth = 1;
      var segs = ri(2,4);
      for(var s=0; s<segs; s++){
        var sx = rr(0,S), slen = rr(S*0.10,S*0.28);
        g.beginPath(); g.moveTo(sx,by); g.lineTo(Math.min(S,sx+slen), by+rr(-2,2)); g.stroke();
      }
    }
    if(chance(0.5)){
      var vx = rnd()*S;
      g.strokeStyle = 'rgba(0,0,0,0.05)'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(vx,by); g.lineTo(vx, by+bh*rr(0.35,0.9)); g.stroke();
    }
  }

  var patches = ri(3,5);
  for(var p=0; p<patches; p++){
    var pw = rr(S*0.08,S*0.20), ph = rr(S*0.06,S*0.15);
    var px = rr(0,S-pw), py = rr(0,S-ph);
    g.fillStyle = 'rgba(0,0,0,' + (0.03+0.05*rnd()).toFixed(3) + ')';
    g.fillRect(px,py,pw,ph);
    g.strokeStyle = 'rgba(0,0,0,0.09)'; g.lineWidth = 1;
    g.strokeRect(px+0.5,py+0.5,pw-1,ph-1);
  }

  /* hairline cracks: more numerous and jagged than a fine render's */
  g.strokeStyle = 'rgba(0,0,0,0.14)'; g.lineWidth = 1;
  for(var k=0; k<6; k++){
    var cx=rnd()*S, cy=rnd()*S; g.beginPath(); g.moveTo(cx,cy);
    var steps = ri(4,7);
    for(var j=0;j<steps;j++){ cx+=rr(-S*0.10,S*0.10); cy+=rr(-S*0.02,S*0.12); g.lineTo(cx,cy); }
    g.stroke();
  }
});

var TEX_ROOF = texCanvas(function(g,S){
  var rows = 8, h = S/rows, cols = 6, w = S/cols;
  grain(g,S,0.10,2);
  for(var r=0;r<rows;r++){
    var y=r*h, off=(r%2)? w*0.5 : 0;
    for(var c=-1;c<=cols;c++){
      var x=c*w+off;

      var base = 0.09 + 0.05*rnd();
      var gr = g.createLinearGradient(x,0,x+w,0);
      gr.addColorStop(0.00, 'rgba(0,0,0,'+(base+0.13).toFixed(3)+')');
      gr.addColorStop(0.50, 'rgba(0,0,0,'+(base*0.25).toFixed(3)+')');
      gr.addColorStop(1.00, 'rgba(0,0,0,'+(base+0.13).toFixed(3)+')');
      g.fillStyle = gr;
      g.fillRect(x, y+1, w, h-1.5);
    }
    /* the shadow line under each overlapping course */
    g.fillStyle='rgba(0,0,0,0.26)'; g.fillRect(0, y, S, 1.5);
  }
});

/* --- wood: sawn planks, ends staggered --- */
var TEX_WOOD = texCanvas(function(g,S){
  var n = 6, w = S/n;
  grain(g,S,0.09,2);
  for(var i=0;i<n;i++){
    var x=i*w;
    g.fillStyle='rgba(0,0,0,'+(0.05*rnd()).toFixed(3)+')';
    g.fillRect(x, 0, w, S);
    g.fillStyle='rgba(0,0,0,0.22)'; g.fillRect(x, 0, 1.2, S);
    /* grain lines along the plank */
    g.strokeStyle='rgba(0,0,0,0.07)'; g.lineWidth=1;
    for(var k=0;k<4;k++){
      var gx=x+rr(2,w-2); g.beginPath(); g.moveTo(gx,0);
      for(var y=0;y<S;y+=S/4) g.lineTo(gx+rr(-1.2,1.2), y);
      g.stroke();
    }
  }
});

/* --- dome: smooth, faint concentric banding --- */
var TEX_DOME = texCanvas(function(g,S){
  grain(g,S,0.06,2);
  for(var y=0;y<S;y+=S/10) lineH(g,y,S,0.05,1);
});

/* --- bark: vertical fissures --- */
var TEX_TRUNK = texCanvas(function(g,S){
  grain(g,S,0.18,2);
  g.strokeStyle='rgba(0,0,0,0.20)';
  for(var i=0;i<14;i++){
    var x=rnd()*S; g.lineWidth=rr(0.8,2.4); g.beginPath(); g.moveTo(x,0);
    for(var y=0;y<=S;y+=S/6) g.lineTo(x+rr(-2.5,2.5), y);
    g.stroke();
  }
});

/* --- leaf: clumped canopy noise --- */
var TEX_LEAF = texCanvas(function(g,S){
  grain(g,S,0.20,2);
  for(var i=0;i<60;i++){
    var x=rnd()*S, y=rnd()*S, r=rr(S*0.02,S*0.07);
    g.fillStyle='rgba(0,0,0,'+(0.10*rnd()).toFixed(3)+')';
    g.beginPath(); g.arc(x,y,r,0,6.284); g.fill();
  }
});

/* --- fungus: soft blotches, no hard edges --- */
var TEX_FUNGUS = texCanvas(function(g,S){
  grain(g,S,0.08,2);
  for(var i=0;i<22;i++){
    var x=rnd()*S, y=rnd()*S, r=rr(S*0.06,S*0.22);
    var gr=g.createRadialGradient(x,y,0,x,y,r);
    gr.addColorStop(0,'rgba(0,0,0,'+(0.09*rnd()).toFixed(3)+')');
    gr.addColorStop(1,'rgba(0,0,0,0)');
    g.fillStyle=gr; g.beginPath(); g.arc(x,y,r,0,6.284); g.fill();
  }
});

/* --- metal: brushed, with a little pitting --- */
var TEX_METAL = texCanvas(function(g,S){
  grain(g,S,0.05,1);
  g.strokeStyle='rgba(0,0,0,0.06)'; g.lineWidth=1;
  for(var y=0;y<S;y+=2){ g.beginPath(); g.moveTo(0,y+0.5); g.lineTo(S,y+0.5); g.stroke(); }
  for(var i=0;i<40;i++){
    g.fillStyle='rgba(0,0,0,'+(0.10*rnd()).toFixed(3)+')';
    g.fillRect(rnd()*S, rnd()*S, rr(1,3), rr(1,3));
  }
});

FAMMAT.stone.tex   = TEX_STONE;
FAMMAT.plaster.tex = TEX_PLASTER;
FAMMAT.roof.tex    = TEX_ROOF;
FAMMAT.wood.tex    = TEX_WOOD;
FAMMAT.dome.tex    = TEX_DOME;
FAMMAT.trunk.tex   = TEX_TRUNK;
FAMMAT.leaf.tex    = TEX_LEAF;
FAMMAT.fungus.tex  = TEX_FUNGUS;
FAMMAT.metal.tex   = TEX_METAL;

window._tex = { size:TEXSZ, families:Object.keys(FAMMAT).filter(function(k){ return !!FAMMAT[k].tex; }).length };
