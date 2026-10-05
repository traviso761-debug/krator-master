// ================================================================= BIOME CORE — export host: the browser download
// [web]: the one part of the export that needs a browser (a Blob, a link, a click). The data side is
// core/biome/42-core-export.js ([G data]), which this fragment wraps. No build calls BIO.download today; it is
// here for a console or a probe. It moves into core/host/ when Phase 1 of GODOT-PLAN.md builds that; until then a
// kit takes both files (list 43-core-export-host.js after 42-core-export.js in CORE_BIOME).
//
//   BIO.download(name, opt)   -> saves BIO.export(opt) as <name>.biome.json; returns the export's stats
//   BIO.texPNG(texture)       -> {png: data URL, size: [w, h]} or null: the export's image encoder. A canvas encodes
//                                as it is; a DataTexture of 8-bit RGBA (the leaf atlases) goes through a canvas, rows
//                                as stored; an <img> or ImageBitmap is drawn first. Anything else returns null.
(function(){
'use strict';
if(typeof BIO==='undefined'||!BIO.export)throw new Error('43-core-export-host: load core/biome/42-core-export.js first');
BIO.texPNG=function(t){const im=t&&t.image;if(!im)return null;
 if(im.toDataURL)return{png:im.toDataURL('image/png'),size:[im.width,im.height]};
 const cv=document.createElement('canvas'),w=im.width,h=im.height;if(!w||!h)return null;cv.width=w;cv.height=h;const cx=cv.getContext('2d');
 if(im.data&&im.data.length===w*h*4&&(im.data instanceof Uint8Array||im.data instanceof Uint8ClampedArray))
  cx.putImageData(new ImageData(new Uint8ClampedArray(im.data.buffer,im.data.byteOffset,im.data.length),w,h),0,0);
 else if((typeof HTMLImageElement!=='undefined'&&im instanceof HTMLImageElement)||(typeof ImageBitmap!=='undefined'&&im instanceof ImageBitmap))cx.drawImage(im,0,0);
 else return null;
 return{png:cv.toDataURL('image/png'),size:[w,h]};};
BIO.download=function(name,opt){const o=BIO.export(opt),blob=new Blob([JSON.stringify(o)],{type:'application/json'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=(name||'biome')+'.biome.json';document.body.appendChild(a);a.click();
 setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1000);return o.stats;};
})();
