// ================================================================= QIBLAI — the Decree's script on the buildings
// The Xanadui syllabary is holy writing (PLAN.md section 2a: a misspelled syllable is a false note in the Song). The chart's own
// scribe (XNDS, src/89q0x-qb-xanadui.js, lifted from lore/tongues-of-krator.html at every build) gives each syllable as SVG
// markup; this draws that markup onto canvases with Path2D, stroke by stroke (the chart's broad nib: each stroke ten times,
// offset), so the city carries the real script: the Song round the prayer wheels' drums, its first line along the
// grammarians' college, the city's name over the gates and the Decree's over the Hall. The texts are romanized by the chart's
// own sound changes ("From English": d -> retroflex d, k before u -> q, h -> x, final -n -> a nasal vowel, s+consonant ->
// sa-, final -r lost; its names Xanadu, Qubla, Alph, the Pleasure Dome): proposed, for the owner to correct. [web]: canvas.
const QSCRIPT={
 // "In Xanadu did Kubla Khan / A stately pleasure-dome decree: / Where Alph, the sacred river, ran"
 song:'Ĩ Xānaḍu ḍiḍ Qublā Xān, a saṭeṭlī peleśā-ḍhom ḍikrī. We Ālph, da sekriḍ riwa, rã.',
 gate:'Qiblai.',   // the city (Kubla's), over its gates
 hall:'Ḍikrī.',    // the Decree, over the Hall where the Prismarchy sits
};
// the tokens of a text, each as {vb:[minx,miny,w,h], ops:[[kind,attrs]]}, words as arrays (unknown letters are dropped)
function qnScriptToks(text){const out=[];
 for(const wd of XNDS.parse(text)){const w=[];
  for(const t of wd){if(t.u)continue;const svg=t.p==='wheel'?XNDS.WHEEL(1):t.p==='bar'?XNDS.BAR(1):XNDS.aks(t.c,t.v,t.n,1);
   const vb=/viewBox="([^"]+)"/.exec(svg)[1].trim().split(/\s+/).map(Number),ops=[],re=/<(path|circle)\s([^>]*?)\/>/g;let m;
   while((m=re.exec(svg))){const a={};m[2].replace(/([\w-]+)="([^"]*)"/g,(_,k,v)=>{a[k]=v;return '';});ops.push([m[1],a]);}
   w.push({vb,ops});}
  if(w.length)out.push(w);}
 return out;}
// an SVG transform list (translate, scale), applied in order as canvas calls compose it
function qnScriptTf(g,tf){const re=/(translate|scale)\(([^)]*)\)/g;let m;
 while((m=re.exec(tf||''))){const n=m[2].trim().split(/[\s,]+/).map(Number);if(m[1]==='translate')g.translate(n[0],n.length>1?n[1]:0);else g.scale(n[0],n.length>1?n[1]:n[0]);}}
// a line of script with its top-left at (x,y) px, k px per chart unit (a syllable is 72 x 96 units); col {ink, mk, wheel};
// g null measures only. Returns the width in px.
function qnScriptLine(g,text,x,y,k,col){let cx=x;const gap=18*k;
 for(const wd of qnScriptToks(text)){for(const T of wd){
   if(g){g.save();g.translate(cx-T.vb[0]*k,y-T.vb[1]*k);g.scale(k,k);g.lineCap='round';g.lineJoin='round';
    for(const [kind,a] of T.ops){g.save();qnScriptTf(g,a.transform);const cls=a.class||'ink';
     if(kind==='path'){g.lineWidth=cls==='wh'?2.2:2;g.strokeStyle=cls==='mk'?col.mk:cls==='wh'?col.wheel:col.ink;g.stroke(new Path2D(a.d));}
     else{g.beginPath();g.arc(+a.cx,+a.cy,+a.r,0,TAU);if(cls==='dotf'){g.fillStyle=col.ink;g.fill();}else{g.lineWidth=2.2;g.strokeStyle=col.wheel;g.stroke();}}
     g.restore();}
    g.restore();}
   cx+=T.vb[2]*k;}
  cx+=gap;}
 return cx-gap-x;}
// a text repeated along a row from x0 to the canvas's width, with a wheel's gap between the repeats
function qnScriptRow(g,w,text,x0,y,k,col){let x=x0;while(x<w)x+=qnScriptLine(g,text,x,y,k,col)+40*k;}
const QSCRIPT_ROW=122;   // a row's height in chart units: the 96-unit cell and one stacked letter below it

// ---------------------------------------------------------------- the textures
// the college's band: the Song's first line in dark ink on a limed ground, read left to right (8:1, tiled in segments)
TEX.qSongBand=canvasTex(2048,256,(g,w,h)=>{g.fillStyle='#ece2c8';g.fillRect(0,0,w,h);g.fillStyle='#6a2a22';g.fillRect(0,0,w,10);g.fillRect(0,h-10,w,10);
 qnScriptRow(g,w,QSCRIPT.song,24,h*.12,h*.78/QSCRIPT_ROW,{ink:'#22140f',mk:'#8a2420',wheel:'#a87828'});});
// a prayer wheel's drum: six rows of the Song in dark ink on gilt copper, a gold rule between the rows and a gold band at
// top and foot; the drum's u runs round it, so the Song circles the wheel and every turn sings it
TEX.qSongDrum=canvasTex(2048,1024,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#c49050');gr.addColorStop(.5,'#a8703c');gr.addColorStop(1,'#c49050');
 g.fillStyle=gr;g.fillRect(0,0,w,h);const B=44,N=6,rh=(h-2*B)/N;g.fillStyle='#e0b850';g.fillRect(0,0,w,B);g.fillRect(0,h-B,w,B);
 for(let r=1;r<N;r++)g.fillRect(0,B+r*rh-3,w,6);
 for(let r=0;r<N;r++)qnScriptRow(g,w,QSCRIPT.song,24+r*97,B+r*rh+rh*.1,rh*.8/QSCRIPT_ROW,{ink:'#2e140c',mk:'#5a1410',wheel:'#f4d070'});});
// a plaque: a text in gold on maroon (the gates, the Hall), centred, in a gold rule
const qnPlaqueTex=text=>canvasTex(1024,256,(g,w,h)=>{g.fillStyle='#5a1c1c';g.fillRect(0,0,w,h);g.strokeStyle='#d8a838';g.lineWidth=10;g.strokeRect(10,10,w-20,h-20);
 const k=h*.66/QSCRIPT_ROW,tw=qnScriptLine(null,text,0,0,k,null),c={ink:'#f0c858',mk:'#f8dc80',wheel:'#f0c858'};qnScriptLine(g,text,(w-tw)/2,h*.14,k,c);});
TEX.qPlaqueGate=qnPlaqueTex(QSCRIPT.gate);TEX.qPlaqueHall=qnPlaqueTex(QSCRIPT.hall);
MAT.qSongBand=new THREE.MeshStandardMaterial({map:TEX.qSongBand,color:0xffffff,roughness:.85,metalness:0,side:DS});
MAT.qSongDrum=new THREE.MeshStandardMaterial({map:TEX.qSongDrum,color:0xffffff,roughness:.42,metalness:.5,side:DS});
MAT.qPlaqueGate=new THREE.MeshStandardMaterial({map:TEX.qPlaqueGate,color:0xffffff,roughness:.5,metalness:.25,side:DS});
MAT.qPlaqueHall=new THREE.MeshStandardMaterial({map:TEX.qPlaqueHall,color:0xffffff,roughness:.5,metalness:.25,side:DS});
kdef('qSongBand',VPLANE,MAT.qSongBand);kdef('qSongDrum',XDRUM,MAT.qSongDrum);kdef('qPlaqueGate',VPLANE,MAT.qPlaqueGate);kdef('qPlaqueHall',VPLANE,MAT.qPlaqueHall);
// the Song's band along a face: segments at the texture's 8:1, so the script keeps its shape whatever the run; (x,z) on the face,
// ry outward, w the run, h the band's height
function qnSongBand(x,y,z,ry,w,h){const sw=h*8,n=Math.max(1,Math.round(w/sw)),s=w/n;
 for(let i=0;i<n;i++){const p=loc(x,z,-w/2+s*(i+.5),.05,ry);kput('qSongBand',[p[0],y,p[1]],qEuler(0,ry,0),[s,h,1],null);}}
