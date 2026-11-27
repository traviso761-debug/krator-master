// ================================================================= PENNANTS: each dress's emblem as a canvas map ([web])
// The culture symbols are core/sockets/38-symbols.js (SYMBOLS, read in place: the same drawings the culture packs fly and the
// catalog's tapestries carry). Each dress that flies a pennant (TN_EMBLEMS, 26k-kit.js) gets its field, a hoist band in its
// second ink and the symbol in its ink on the MAT key 'emb_<dress>' (a plain material until here: no library set). Godot: an
// ImageTexture painted the same way, or a baked sheet (PORT.md).
for(const k of TN_EMBLEMS){const D=TN_DRESS[k],m=MAT['emb_'+k];if(!D||!m||!D.emblem||typeof SYMBOLS==='undefined'||!SYMBOLS[D.emblem])continue;
 const cv=document.createElement('canvas');cv.width=256;cv.height=160;const g=cv.getContext('2d');
 g.fillStyle=D.field;g.fillRect(0,0,256,160);g.fillStyle=D.ink2||D.ink;g.fillRect(0,0,22,160);g.fillRect(22,0,234,7);g.fillRect(22,153,234,7);
 SYMBOLS[D.emblem](g,98,80,50,D.ink,D.ink2||D.ink);
 const t=new THREE.CanvasTexture(cv);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;
 m.map=t;m.color.set(0xffffff);m.needsUpdate=true;m.userData.emblem=D.emblem;}
