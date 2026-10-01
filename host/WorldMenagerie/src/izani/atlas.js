// One canvas atlas holds every inscription and sign in the city; each gets its own region and a THREE.CanvasTexture.
import {G,letters,layout} from './glyphs.js';
import {draw} from './draw.js';
import {mkRng} from '../core/rng.js';
const THREE=window.THREE;
export function createIzani({report}){
  const AW=2048,AH=2048,acv=document.createElement('canvas');acv.width=AW;acv.height=AH;const ag=acv.getContext('2d');let px=4,py=4,rowH=0;const REG={};let T=null;
  function region(key,spec){if(REG[key])return REG[key];const h=spec.px||80,w=Math.min(AW-8,Math.round(h*spec.aspect));
    if(px+w+4>AW){px=4;py+=rowH+8;rowH=0;}if(py+h>AH)report('izani atlas',new Error('the text atlas is full at '+key));const x=px,y=py;px+=w+8;rowH=Math.max(rowH,h);
    ag.save();ag.beginPath();ag.rect(x,y,w,h);ag.clip();
    if(spec.style==='paint'){ag.fillStyle=spec.bg||'#6b4a2e';ag.fillRect(x,y,w,h);const R=mkRng(key.length*17+3);ag.strokeStyle='rgba(0,0,0,0.16)';ag.lineWidth=1;
      for(let k=0;k<8;k++){const yy=y+R()*h;ag.beginPath();ag.moveTo(x,yy);ag.lineTo(x+w,yy+(R()-0.5)*4);ag.stroke();}
      ag.strokeStyle='rgba(20,12,6,0.8)';ag.lineWidth=Math.max(2,h*0.06);ag.strokeRect(x+h*0.05,y+h*0.05,w-h*0.1,h-h*0.1);}
    const lines=spec.lines,lh=h/lines.length;
    lines.forEach((t,i)=>draw(ag,t,x+w/2,y+lh*(i+0.5),lh*(i===0?(spec.pic?0.8:0.66):0.5),{style:spec.style==='graffiti'?'spray':spec.style,pic:spec.pic,color:spec.color,maxW:w*0.84,jitter:spec.style==='graffiti'?0.04:0,seed:key.length*3+(key.charCodeAt(2)||1),weight:spec.style==='graffiti'?0.13:0.09}));
    ag.restore();if(T)T.needsUpdate=true;
    return REG[key]={r:[x/AW,1-(y+h)/AH,(x+w)/AW,1-y/AH],spec,box:[x,y,w,h]};}
  const texture=()=>{if(!T){T=new THREE.CanvasTexture(acv);T.anisotropy=4;}return T;};
  function thumb(key,hPx){const R2=REG[key];if(!R2)return '';const [x,y,w,h]=R2.box,H2=hPx||44,W2=Math.round(H2*w/h),c=document.createElement('canvas');c.width=W2;c.height=H2;const g=c.getContext('2d');
    if(R2.spec.style!=='paint'){g.fillStyle=R2.spec.style==='graffiti'?'#b9a98a':'#d8ccb0';g.fillRect(0,0,W2,H2);}g.drawImage(acv,x,y,w,h,0,0,W2,H2);try{return c.toDataURL();}catch(e){return '';}}
  return {G,letters,layout,draw,region,texture,thumb,REG};}
