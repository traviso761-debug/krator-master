// core/terrain/node-png.js: a PNG reader for the node tests (no npm). 8-bit, non-interlaced, colour types 0 (grey),
// 2 (RGB), 4 (grey+alpha) and 6 (RGBA): what tools/scale-model/extract_region.py writes through PIL. Returns
// {width, height, channels, data (Uint8Array, row-major, `channels` bytes a pixel)}.
'use strict';
const zlib=require('zlib');
function readPNG(buf){
 if(buf.readUInt32BE(0)!==0x89504e47)throw new Error('not a PNG');
 let p=8,w=0,h=0,depth=0,ctype=0,ilace=0;const idat=[];
 while(p<buf.length){const n=buf.readUInt32BE(p),type=buf.toString('latin1',p+4,p+8),d=buf.subarray(p+8,p+8+n);p+=12+n;
  if(type==='IHDR'){w=d.readUInt32BE(0);h=d.readUInt32BE(4);depth=d[8];ctype=d[9];ilace=d[12];}
  else if(type==='IDAT')idat.push(d);else if(type==='IEND')break;}
 if(depth!==8||ilace!==0)throw new Error('node-png: only 8-bit non-interlaced PNGs ('+depth+' bits, interlace '+ilace+')');
 const ch={0:1,2:3,4:2,6:4}[ctype];if(!ch)throw new Error('node-png: colour type '+ctype+' (palette) is not read');
 const raw=zlib.inflateSync(Buffer.concat(idat)),stride=w*ch,out=new Uint8Array(w*h*ch);
 let prev=new Uint8Array(stride),cur=new Uint8Array(stride),q=0;
 for(let y=0;y<h;y++){const f=raw[q++];
  for(let i=0;i<stride;i++){const a=i>=ch?cur[i-ch]:0,b=prev[i],c=i>=ch?prev[i-ch]:0,x=raw[q+i];let v;
   if(f===0)v=x;else if(f===1)v=x+a;else if(f===2)v=x+b;else if(f===3)v=x+((a+b)>>1);
   else{const pp=a+b-c,pa=Math.abs(pp-a),pb=Math.abs(pp-b),pc=Math.abs(pp-c);v=x+(pa<=pb&&pa<=pc?a:pb<=pc?b:c);}
   cur[i]=v&255;}
  q+=stride;out.set(cur,y*stride);const t=prev;prev=cur;cur=t;}
 return {width:w,height:h,channels:ch,data:out};}
// the rasters of a region folder (extract_region.py's output) as WORLD.init / KLAND.create take them: the 16-bit
// heights decoded with the region's lo..hi, the flags from the blue channel, the 8-bit maps as they are
function readRegion(dir){const fs=require('fs'),path=require('path');
 const meta=JSON.parse(fs.readFileSync(path.join(dir,'region.json'),'utf8')),lo=meta.heights.lo,hi=meta.heights.hi;
 const png=k=>readPNG(fs.readFileSync(path.join(dir,k+'.png')));
 const e=png('elev'),w=png('wlev'),nh=e.width*e.height,R={elev:new Float32Array(nh),wlev:new Float32Array(nh),whas:new Uint8Array(nh),wflag:new Uint8Array(nh)};
 const px=(im,i)=>im.data[i*im.channels],v16=(im,i)=>lo+((im.data[i*im.channels]<<8)|im.data[i*im.channels+1])/65535*(hi-lo);
 for(let i=0;i<nh;i++){R.elev[i]=v16(e,i);R.wflag[i]=e.data[i*e.channels+2]>127?1:0;R.whas[i]=w.data[i*w.channels+2]>127?1:0;R.wlev[i]=R.whas[i]?v16(w,i):lo;}
 for(const k of ['clim','rain','temp','biome','mask']){const im=png(k),n=im.width*im.height,a=new Uint8Array(n);for(let i=0;i<n;i++)a[i]=px(im,i);R[k]=a;}
 const d16=k=>{const im=png(k),a=new Float32Array(nh);for(let i=0;i<nh;i++)a[i]=v16(im,i);return a;};
 R.scarpL=d16('scarpl');R.scarpU=d16('scarpu');const sw=png('scarpw');R.scarpW=new Float32Array(nh);for(let i=0;i<nh;i++)R.scarpW[i]=px(sw,i);
 return {meta,R};}
module.exports={readPNG,readRegion};
