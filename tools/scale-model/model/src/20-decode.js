const ZONES = ['basin','highland','outer rim','arctic','lake / sea','salt basin'];
const ZCOL = [[199,214,76],[63,125,66],[236,236,236],[185,191,196],[79,127,184],[122,74,36]];
const PXKM = 2, VW = DATA.w, VH = DATA.hh;

function loadImg(src){return new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=src;});}
function pixels(img){const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const g=c.getContext('2d');g.drawImage(img,0,0);return g.getImageData(0,0,img.width,img.height).data;}

(async function start(){
  const [hImg,zImg,wImg,pImg,cImg,tmImg,thImg,tlImg,twImg,tcImg] = await Promise.all([loadImg('data:image/png;base64,'+DATA.h), loadImg('data:image/png;base64,'+DATA.z), loadImg('data:image/png;base64,'+DATA.wl), loadImg('data:image/png;base64,'+DATA.p), loadImg('data:image/png;base64,'+DATA.c), loadImg('data:image/png;base64,'+DATA.tm), loadImg('data:image/png;base64,'+DATA.th), loadImg('data:image/png;base64,'+DATA.tl), loadImg('data:image/png;base64,'+DATA.tw), loadImg('data:image/png;base64,'+DATA.tc)]);
  const pp = pixels(pImg); const rain = new Uint8Array(pImg.width*pImg.height); for(let i=0;i<rain.length;i++) rain[i]=pp[i*4];
  const hp = pixels(hImg), zp = pixels(zImg);
  const elev = new Float32Array(VW*VH), water = new Uint8Array(VW*VH);
  for(let i=0;i<VW*VH;i++){ const q=(hp[i*4]<<8)|hp[i*4+1]; elev[i]=DATA.lo+q/65535*(DATA.hi-DATA.lo); water[i]=hp[i*4+2]>127?1:0; }
  const wp = pixels(wImg); const wlev = new Float32Array(VW*VH); const whas = new Uint8Array(VW*VH);
  for(let i=0;i<VW*VH;i++){ whas[i]=wp[i*4+2]>127?1:0; const q=(wp[i*4]<<8)|wp[i*4+1]; wlev[i]=whas[i]?DATA.lo+q/65535*(DATA.hi-DATA.lo):0; }
  const cp = pixels(cImg); const clim = new Uint8Array(cImg.width*cImg.height); for(let i=0;i<clim.length;i++) clim[i]=cp[i*4];
  const CL = DATA.climate.classes;
  const t8=img=>{const px=pixels(img); const a=new Int16Array(img.width*img.height); for(let i=0;i<a.length;i++) a[i]=px[i*4]-90; return a;};
  const TM=t8(tmImg), TH=t8(thImg), TL=t8(tlImg), TW=t8(twImg), TC=t8(tcImg), TWd=tmImg.width;
  const zone = new Uint8Array(zImg.width*zImg.height);
  for(let i=0;i<zone.length;i++) zone[i]=zp[i*4];

