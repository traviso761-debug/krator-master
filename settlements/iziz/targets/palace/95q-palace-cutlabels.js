// ================================================================= 95q. THE PALACE CITADEL: ROOM NAMES IN THE CUTAWAY
// [web] When a building is cut (X, ] [: the core/host cutaway on the units 95p makes), the cut storey's rooms are named on
// the view: a label at each room's middle a little over its floor, the larger rooms first where two would overlap on the
// screen, the rest hidden until the view opens them out. An overlay that takes no clicks, laid out each frame from
// FRAME_HOOKS; closing the cut, or another storey, clears it. The labels toggle with N (and the button by the cut's bar);
// the hover tip names a room too (its core/tags record, 95p).
const IZPALCUT=(function(){
 const site=IZPAL_SITE;if(!site.L||typeof FRAME_HOOKS==='undefined')return null;
 const FR=site.FR,box=document.createElement('div');box.id='izpal-rooms';
 box.style.cssText='position:fixed;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:12;overflow:hidden';document.body.appendChild(box);
 let key=null,labs=[],on=true;const v=new THREE.Vector3();
 function build(unit,storey){box.textContent='';labs=[];const B=site.L.buildings.find(b=>b.id===unit.id),St=B&&B.storeys[storey];if(!St)return;
  St.spaces.forEach(s=>{if(s.gone||s.void||!s.rect||s.kind==='corridor')return;const q=s.rect,p=FR.P((q.u0+q.u1)/2,(q.v0+q.v1)/2);
   const el=document.createElement('div');el.textContent=s.name;
   el.style.cssText='position:absolute;left:0;top:0;white-space:nowrap;font:11px/1.3 system-ui,sans-serif;color:#ffe2b0;background:rgba(20,12,6,.74);'+
    'border:1px solid rgba(216,170,90,.45);padding:1px 6px;border-radius:3px;display:none';
   box.appendChild(el);labs.push({el,x:p[0],y:FR.Y(St.y)+1.1,z:p[1],area:s.area||0,w:0,h:0});});
  labs.sort((a,b)=>b.area-a.area);}
 function frame(){const C=typeof KHOST!=='undefined'&&KHOST.cut,k=on&&C&&C.on&&C.unit?C.unit.id+':'+C.storey:null;
  if(k!==key){key=k;if(k)build(C.unit,C.storey);else{box.textContent='';labs=[];}}
  if(!labs.length)return;const W=innerWidth,H=innerHeight,placed=[];
  for(const L of labs){v.set(L.x,L.y,L.z).project(camera);
   if(v.z>1||v.z<-1||Math.abs(v.x)>1.02||Math.abs(v.y)>1.02){L.el.style.display='none';continue;}
   if(!L.w){L.el.style.display='block';L.w=L.el.offsetWidth;L.h=L.el.offsetHeight;}
   const sx=(v.x+1)/2*W-L.w/2,sy=(1-v.y)/2*H-L.h/2,r=[sx-2,sx+L.w+2,sy-1,sy+L.h+1];
   if(placed.some(o=>o[0]<r[1]&&o[1]>r[0]&&o[2]<r[3]&&o[3]>r[2])){L.el.style.display='none';continue;}
   placed.push(r);L.el.style.display='block';L.el.style.transform='translate('+sx.toFixed(1)+'px,'+sy.toFixed(1)+'px)';}}
 FRAME_HOOKS.push(frame);
 addEventListener('keydown',e=>{if((e.key==='n'||e.key==='N')&&!e.ctrlKey&&!e.metaKey&&!/INPUT|TEXTAREA|SELECT/.test((e.target&&e.target.tagName)||''))on=!on;});
 // the toggle beside the cut's bar
 {const bar=document.getElementById('khost-cutbar');if(bar){const b=document.createElement('button');b.textContent='room names (N)';b.onclick=()=>{on=!on;};bar.appendChild(b);}}
 return{frame,toggle:()=>{on=!on;return on;},get on(){return on;},get shown(){return labs.filter(L=>L.el.style.display==='block').length;}};})();
