// ================================================================= CORE HOST — the minimap: a plan drawn from the records
// [web] core/host/97-host-minimap.js (ROADMAP.md section 10: "97 minimap (moved from core/minimap/88a)"). The plan and its
// panel are core/minimap's (KMAP, 88-core-minimap.js [G data]; KMAP.mount, 88a-core-minimap-host.js [web]): this is the
// host's taker, which fills a plan from what a build registered and mounts it on the M key. The panel itself stays in
// core/minimap/88a for now, because Voth's build reads every file in core/minimap/ and Voth is the Voth branch's; it moves
// here when Voth switches to core/host (core/host/README.md, "Voth onto core/host").
//
//   o.minimap = true | {frame: [x0, x1, z0, z1], size, relief: {cell, water}, palette, draw(M)}
//     from the records (KTAGS.page, or o.records()): buildings and landmarks as turned boxes, infrastructure and
//     features as boxes or discs, flora as small discs (not furniture: too small to read); the ground as relief; then the
//     build's own draw(M). A click on the plan flies the camera there.
//   KHOST.minimap: the plan (KMAP) and its panel
(function(root){
'use strict';
const K=root.KHOST=root.KHOST||{};
K.onTake(function minimapTake(H){
 const o=H.o,MO=o.minimap;if(!MO)return;
 if(!root.KMAP||!root.KMAP.mount){K.err('core/host 97-host-minimap: load core/minimap/88-core-minimap.js and 88a-core-minimap-host.js');return;}
 const opt=MO===true?{}:MO,C=K.cam;
 const recs=(K.records?K.records():[]).filter(r=>r['class']!=='furniture'&&r['class']!=='part'&&r['class']!=='fixture');
 let f=opt.frame;
 if(!f){let x0=Infinity,x1=-Infinity,z0=Infinity,z1=-Infinity;recs.forEach(r=>{const e=r.size?Math.hypot(r.size[0],r.size[1])/2:(r.r||1);x0=Math.min(x0,r.at[0]-e);x1=Math.max(x1,r.at[0]+e);z0=Math.min(z0,r.at[2]-e);z1=Math.max(z1,r.at[2]+e);});
  if(!isFinite(x0)){x0=-500;x1=500;z0=-500;z1=500;}const m=Math.max(40,(x1-x0)*.06);f=[x0-m,x1+m,z0-m,z1+m];}
 const PAL=Object.assign({building:'#c9a46a',landmark:'#e0c070',infrastructure:'#9a8a72',feature:'#6a8a9a',flora:'#4f7a3e',prop:'#a08a6a',life:'#e06050'},opt.palette||{});
 const M=K.minimap=root.KMAP.create({frame:f,size:opt.size||280,bg:'#101418',palette:PAL});
 const g=o.ground,gh=typeof g==='function'?g:(g&&g.h?(x,z)=>g.h(x,z):null);
 if(gh&&opt.relief!==false)M.relief(gh,Object.assign({cell:Math.max(4,(f[1]-f[0])/140)},opt.relief||{}));
 const order={flora:1,feature:2,infrastructure:3,prop:3,building:4,landmark:5,life:6};
 recs.slice().sort((a,b)=>(order[a['class']]||0)-(order[b['class']]||0)).forEach(r=>{const c=r['class'],o2={tag:c,name:r.name||r.kind||r.key||r.id,y:order[c]||0};
  if(c==='flora'){M.disc(r.at[0],r.at[2],Math.max(1.5,Math.min(r.r||(r.size?r.size[0]/2:2),18)),o2);return;}
  if(r.size)M.obb(r.at[0],r.at[2],r.size[0]/2,r.size[1]/2,r.ry||0,o2);else M.disc(r.at[0],r.at[2],r.r||2,o2);});
 if(opt.draw)try{opt.draw(M);}catch(e){K.err('minimap draw: '+((e&&e.stack)||e));}
 const panel=root.KMAP.mount(M,{title:opt.title||o.title||'Map',viewer:()=>{const p=H.camera.position,t=C.ctl.target,dx=t.x-p.x,dz=t.z-p.z,l=Math.hypot(dx,dz)||1;return{x:p.x,z:p.z,dir:[dx/l,dz/l]};},
  onPick:(x,z)=>{if(C.ctl.walk)C.walk(false,true);C.ctl.target.set(x,(gh?gh(x,z):C.ctl.target.y)+2,z);C.ctl.radius=Math.min(C.ctl.radius,400);}});
 if(panel&&panel.el)panel.el.classList.add('khost-chrome');
 K.minimapPanel=panel;
});
})(typeof window!=='undefined'?window:globalThis);
