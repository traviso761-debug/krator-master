// Draws Izani text on a Canvas2D context: carved, painted, sprayed (graffiti, with drips) or plain ink.
import {layout,PICS} from './glyphs.js';
import {mkRng} from '../core/rng.js';
export   function draw(ctx,text,cx,cy,size,o){o=o||{};const L=o.pic?{segs:PICS[o.pic].map(q=>[q[0]+0.8,q[1],q[2]+0.8,q[3]]),width:1.6}:layout(text);let sz=size;if(o.maxW)sz=Math.min(sz,o.maxW/L.width);
    const x0=cx-L.width*sz/2,y0=cy-sz*0.5,lw=Math.max(1,sz*(o.weight||0.09)),R=o.jitter?mkRng(o.seed||7):null;
    const path=(dx,dy)=>{ctx.beginPath();for(const q of L.segs){const j=()=>R?(R()-0.5)*sz*o.jitter:0;ctx.moveTo(x0+q[0]*sz+dx+j(),y0+q[1]*sz+dy+j());ctx.lineTo(x0+q[2]*sz+dx+j(),y0+q[3]*sz+dy+j());}ctx.stroke();};
    ctx.save();ctx.lineCap='square';ctx.lineJoin='miter';
    if(o.style==='carve'){ctx.lineWidth=lw;ctx.strokeStyle='rgba(255,236,200,0.5)';path(lw*0.5,lw*0.5);ctx.strokeStyle=o.color||'rgba(34,24,14,0.96)';path(0,0);}
    else if(o.style==='paint'){ctx.lineWidth=lw*1.9;ctx.strokeStyle='rgba(22,14,8,0.85)';path(0,0);ctx.lineWidth=lw;ctx.strokeStyle=o.color||'#f0dcaa';path(0,0);}
    else if(o.style==='spray'){ctx.lineWidth=lw*1.15;ctx.strokeStyle=o.color||'#e0a030';ctx.shadowColor=o.color||'#e0a030';ctx.shadowBlur=lw*1.4;ctx.globalAlpha=0.55;path(0,0);ctx.globalAlpha=1;ctx.shadowBlur=0;ctx.lineWidth=lw;path(0,0);
      const D=mkRng((o.seed||7)+11);ctx.lineWidth=Math.max(1,lw*0.35);for(const q of L.segs){if(D()>0.3)continue;const bx=x0+(q[1]>q[3]?q[0]:q[2])*sz,by=y0+Math.max(q[1],q[3])*sz;ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx,by+lw*(1.5+D()*4));ctx.stroke();}}   // drips
    else{ctx.lineWidth=lw;ctx.strokeStyle=o.color||'#222';path(0,0);}
    ctx.restore();return L.width*sz;}
