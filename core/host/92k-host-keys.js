// ================================================================= CORE HOST — the one key map: the standard controls, their names and keys
// [web] core/host/92k-host-keys.js (TODO.md, "Viewers": one walk mode and one set of controls in every viewer; MODULARITY-PLAN.md,
// "With step 2"). Opt-in for now (host.py KEYS; it joins host.SHELL at the next all-builds rebuild): a build that takes it names
// its controls by id and gets the same button, the same words and the same key as every other page.
//
//   KHOST.KEYMAP                 [{id, key, label, name, what, owner}] in the help card's order: the camera's keys (90), the
//                                standard controls a build hands in (night, cut-away, door, interiors, shadows, labels), and the
//                                host modules' own (inspect 93, marks 94, polygon tool 94, stocks 93, minimap 97, editor 98,
//                                cut-away 99). `key` is the event key (lower case), `label` how it is written ('X', '[ ]')
//   KHOST.std(id, on, more)      -> {button: 'Night (N)', title, on, id: 'khost-std-<id>', std: id}: a control for o.controls
//   KHOST.standard(o)            -> o: o.std = {id: fn | {on, state?, title?}} becomes the standard buttons (in KEYMAP order,
//                                before o.controls) and keys (a build's own o.keys win); state() paints the button 'on'.
//                                A standard id the build does not hand in has no button. Call it on the take's options:
//                                KHOST.take(KHOST.standard({..., std: {night: () => nightSet(!NIGHT.on)}}))
//   ? (or the Keys button)       the card: every key this page answers, the camera's and the modules' first, then the build's
//                                standard controls, then the build's own keys (o.keyNames {key: words} names them)
//   L                            the polygon tool (94-host-polytool.js) when the page has it: Polygon, Path, then Inspect
// The host modules' buttons are renamed to the standard words on the first frame (the cut-away's 'cutaway (X)' reads
// 'Cut-away (X)'), so every page shows the same names whichever module drew the button.
//
// The one walk mode (the camera's F, 90-host-camera.js, with o.walk a KWALK), made the same on every page that takes this file:
//   - the walker moves in steps no longer than its radius (a sprint at 0.1 s a frame is 3 m: it went through a 0.2 m wall)
//   window._walk                 {on, toggle(on), setPose(x,z,yaw) -> pose, pose() -> {x,y,z,feet,yaw,support}, blocked(x,z,feet)}:
//                                tools/harness.py's scripted walk (`harness.py walk <page> --route KeyW:20f --start auto`) and
//                                its auto start read it; a page that sets its own (Girder, Verge) keeps it
//   KHOST.keysCheck()            {std, clashes, words}: the standard buttons' words as the key map has them, and a build key that
//                                takes a standard key for something else (tools/harness.py's `one-key-map` assert)
//   KHOST.walkCheck()            {walk, floors, blocks, floor, block}: the walker set on a raised KWALK floor stands on it, and
//                                walked 4 s at a wall from 3 m off it stops at it (tools/harness.py's `walk` assert); the camera
//                                is put back as it was
(function(root){
'use strict';
const K=root.KHOST=root.KHOST||{},doc=root.document;
// ---------------------------------------------------------------- the key map (core/host/README.md, "The keys")
const M=[
 // the camera (90-host-camera.js): always there
 {id:'move',label:'W A S D',name:'Move',what:'fly (walking: walk); Shift faster, Ctrl or Alt slower',owner:'camera'},
 {id:'updown',label:'Q / E',name:'Down / up',what:'fly down and up (Space up too); E is the door in reach where the page has doors',owner:'camera'},
 {id:'walk',key:'f',label:'F',name:'Walk',what:'first person: the feet on the ground and on the core/walk floors, steps and stairs; walls and blocks stop you (from the pin when there is one)',owner:'camera'},
 {id:'pin',key:'g',label:'G',name:'Fly to the pin',what:'double-click the ground to drop a pin; Esc lifts it',owner:'camera'},
 {id:'mouse',label:'mouse',name:'Look',what:'drag to orbit (walking: look), right-drag to pan, wheel to zoom (walking: speed), click to inspect',owner:'camera'},
 // the standard controls a build hands in (KHOST.standard)
 {id:'cutaway',key:'x',label:'X',name:'Cut-away',what:'open the buildings: the one nearest the view storey by storey where the page has interiors ([ ] the storey), else the near half of every building that has one',owner:'build'},
 {id:'storey',key:'[',label:'[ ]',name:'Storey',what:'the cut-away a storey down or up (PageDown / PageUp, Shift + wheel)',owner:'cutaway'},
 {id:'interiors',key:'u',label:'U',name:'Interiors',what:'plan and furnish every building that has an interior set (kits/interiors); the page reloads with ?interiors=1',owner:'build'},
 {id:'door',key:'e',label:'E',name:'Door',what:'open or shut the door in reach',owner:'build'},
 {id:'night',key:'n',label:'N',name:'Night',what:'night: lamps, fires and windows lit',owner:'build'},
 {id:'shadows',label:'',name:'Shadows',what:'the sun\'s shadows on and off',owner:'build'},
 {id:'labels',label:'',name:'Labels',what:'the names over the buildings',owner:'build'},
 // the host modules' own (each answers its key itself when it is on the page)
 {id:'inspect',key:'i',label:'I',name:'Inspect',what:'the hover tip; a click names what is under the pointer',owner:'module'},
 {id:'polygon',key:'l',label:'L',name:'Polygon tool',what:'lay out a polygon, then a path, then back to inspect (the tools in the inspector panel)',owner:'module'},
 {id:'marks',key:'p',label:'P',name:'Marks',what:'areas, lines and points, named and measured',owner:'module'},
 {id:'minimap',key:'m',label:'M',name:'Minimap',what:'the map of the records',owner:'module'},
 {id:'stocks',key:'o',label:'O',name:'Stocks',what:'what the settlement holds',owner:'module'},
 {id:'editor',key:'b',label:'B',name:'Editor',what:'place, move, turn, remove (Delete, Ctrl+Z)',owner:'module'},
 {id:'keys',key:'?',label:'?',name:'Keys',what:'this card',owner:'host'}];
K.KEYMAP=M;
const BY={};M.forEach(r=>{BY[r.id]=r;});
const words=r=>r.name+(r.label&&r.label!=='mouse'?' ('+r.label+')':'');
K.std=function(id,on,more){const r=BY[id];if(!r)throw new Error('KHOST.std: no standard control '+id);
 return Object.assign({button:words(r),title:r.what,on:on,id:'khost-std-'+id,std:id},more||{});};
K.standard=function(o){const S=o.std||{},ctl=[],keys=Object.assign({},o.keys||{});o._ownKeys=Object.assign({},o.keys||{});
 M.forEach(r=>{const s=S[r.id];if(s==null||r.owner!=='build')return;const fn=typeof s==='function'?s:s.on;
  const c=K.std(r.id,()=>fn(),{state:s.state,title:s.title||r.what});ctl.push(c);
  if(r.key&&!(o.keys&&o.keys[r.key]))keys[r.key]=()=>fn();});
 o.controls=ctl.concat(o.controls||[]);o.keys=keys;K._std=ctl;return o;};
// ---------------------------------------------------------------- the card, the polygon tool's key, the modules' buttons renamed
K.onTake(function keysTake(H){
 const o=H.o,ui=K.ui;
 const card=doc.createElement('div');card.id='khost-keys';card.className='khost-chrome';
 card.style.cssText='position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:30;display:none;max-width:min(560px,92vw);max-height:80vh;overflow:auto;padding:10px 14px;background:rgba(16,14,18,.94);border:1px solid rgba(216,200,154,.5);border-radius:4px;font:12px/1.45 system-ui,sans-serif;color:#f0e6cc';
 doc.body.appendChild(card);
 const has=r=>r.owner==='camera'||r.owner==='host'||(r.owner==='build'&&(K._std||[]).some(c=>c.std===r.id))||
  (r.id==='inspect'&&!!K.hover)||(r.id==='polygon'&&!!root.POLYTOOL)||(r.id==='marks'&&!!K.marks)||(r.id==='minimap'&&!!(K.minimap||doc.getElementById('khost-minimap')))||
  (r.id==='stocks'&&!!K.stocks)||(r.id==='editor'&&!!K.edit)||((r.id==='cutaway'||r.id==='storey')&&!!(K.cut&&K.cut.to));
 const esc=t=>String(t).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'})[c]);
 function fill(){const rows=M.filter(has).map(r=>'<tr><td style="padding:1px 10px 1px 0;color:#e0c98a;white-space:nowrap"><b>'+esc(r.label||'button')+'</b></td><td><b>'+esc(r.name)+'</b> · '+esc(r.what)+'</td></tr>');
  const std=new Set(M.map(r=>r.key).filter(Boolean)),own=Object.keys(o.keys||{}).filter(k=>!std.has(k)),KN=o.keyNames||{};
  const mine=own.map(k=>'<tr><td style="padding:1px 10px 1px 0;color:#e0c98a"><b>'+esc(k.toUpperCase())+'</b></td><td>'+esc(KN[k]||'this page\'s own')+'</td></tr>');
  card.innerHTML='<div style="display:flex;justify-content:space-between;gap:12px"><b style="color:#e0c98a;letter-spacing:.06em;text-transform:uppercase">Keys</b><span style="opacity:.6">? or Esc closes</span></div>'+
   '<table style="border-collapse:collapse;margin-top:6px">'+rows.join('')+(mine.length?'<tr><td colspan="2" style="padding-top:6px;color:#e0c98a">this page</td></tr>'+mine.join(''):'')+'</table>';}
 K.keysCard=function(on){if(on==null)on=card.style.display==='none';if(on)fill();card.style.display=on?'block':'none';if(kb)kb.classList.toggle('on',on);return on;};
 /* the Keys button sits in the bar before #ui, not in it: tools/harness.py's smoke clicks every '#ui button' as a view */
 let kb=null;const bar=doc.getElementById('bar');if(bar){kb=doc.createElement('button');kb.textContent=words(BY.keys);kb.title=BY.keys.what;kb.id='khost-keys-btn';kb.onclick=()=>K.keysCard();bar.insertBefore(kb,ui&&ui.parentNode===bar?ui:null);}
 const typing=e=>{const t=e.target;return t&&(/INPUT|TEXTAREA|SELECT/.test(t.tagName)||t.isContentEditable);};
 /* the polygon tool cycles Polygon, Path, Inspect by its own buttons (#tools, 94-host-polytool.js) */
 function polyKey(){const T=doc.getElementById('tools');if(!T)return false;const B=[].slice.call(T.querySelectorAll('button')),by=t=>B.find(b=>b.textContent===t);
  const on=B.find(b=>b.classList.contains('on')),order=['Polygon','Path','Inspect'],cur=on?order.indexOf(on.textContent):-1,next=by(order[(cur+1)%order.length]);if(next)next.click();return true;}
 root.addEventListener('keydown',e=>{if(typing(e)||e.ctrlKey||e.metaKey||e.altKey)return;const k=e.key;
  if(k==='?'&&!(o.keys&&o.keys['?'])){K.keysCard();e.preventDefault();}
  else if(k==='Escape'&&card.style.display!=='none')K.keysCard(false);
  else if((k==='l'||k==='L')&&!(o.keys&&o.keys.l)&&polyKey())e.preventDefault();});
 /* the modules' buttons in the standard words, and the build's standard buttons painted from their state(), each frame */
 const RENAME={'khost-cut-btn':words(BY.cutaway)};let renamed=false;
 if(K.on)K.on(function keysPaint(){if(!renamed){for(const id in RENAME){const b=doc.getElementById(id);if(b){b.textContent=RENAME[id];b.title=BY.cutaway.what;}}renamed=true;}
  (K._std||[]).forEach(c=>{if(c.el&&c.state)c.el.classList.toggle('on',!!c.state());});},'after');
 /* the check: every standard button in the key map's words; a build's own key on a standard key's letter is a clash */
 K.keysCheck=function(){const out={std:[],clashes:[],words:[]},S=o.std||{};
  (K._std||[]).forEach(c=>{const r=BY[c.std],t=c.el?c.el.textContent:c.button;out.std.push(c.std);if(t!==words(r))out.words.push(c.std+': "'+t+'", not "'+words(r)+'"');});
  const mine=o._ownKeys||(K._std?{}:o.keys||{});for(const k in mine){const r=M.find(q=>q.key===k);if(r&&!(r.owner==='build'&&S[r.id]!=null))out.clashes.push(k.toUpperCase()+' is '+r.name+' on every page; this page: '+((o.keyNames||{})[k]||'its own'));}
  return out;};
});
// ---------------------------------------------------------------- the one walk mode: sub-steps, window._walk, the walker's check
K.onTake(function walkTake(H){
 const C=K.cam,o=H.o,ctl=C.ctl,W=o.walk||null,WK=Object.assign({step:.7,drop:1.4,r:.35,h:1.7},o.walker||{});
 const gh=typeof o.ground==='function'?o.ground:(o.ground&&o.ground.h?(x,z)=>o.ground.h(x,z):()=>0);
 /* walking, a frame's move in steps no longer than the walker's radius, each stood (pushed out of the blocks) before the next */
 const move0=C.move;
 C.move=function(dt){if(!ctl.walk||!W)return move0(dt);
  const x0=ctl.target.x,z0=ctl.target.z;move0(dt);const dx=ctl.target.x-x0,dz=ctl.target.z-z0,d=Math.hypot(dx,dz);
  const n=Math.min(40,Math.ceil(d/Math.max(.1,WK.r*.9)));if(n<=1)return;
  ctl.target.x=x0;ctl.target.z=z0;for(let i=1;i<=n;i++){ctl.target.x+=dx/n;ctl.target.z+=dz/n;C.stand();}};
 const pose=()=>{const A=C.walkAt||[ctl.target.x,ctl.target.z,ctl.target.y-ctl.eye],g=gh(A[0],A[1]);
  return {x:ctl.target.x,y:ctl.target.y,z:ctl.target.z,feet:A[2],yaw:ctl.theta,support:Math.abs(A[2]-g)<.05?'ground':'floor'};};
 if(!root._walk)root._walk={get on(){return !!ctl.walk;},
  toggle(on){C.walk(on==null?!ctl.walk:!!on,true);return !!ctl.walk;},
  setPose(x,z,yaw){if(!ctl.walk)C.walk(true,true);const g=gh(x,z);C.walkAt=[x,z,g];ctl.target.set(x,g+ctl.eye,z);if(yaw!=null)ctl.theta=yaw;C.stand();return pose();},
  pose,
  blocked(x,z,feet){return !!(W&&W.blocked(x,feet==null?gh(x,z):feet,z,WK.r,WK.h));}};
 /* the check (tools/harness.py `walk`): stand on a raised floor; walk at a wall and be stopped by it */
 K.walkCheck=function(){
  if(!W)return {walk:false};
  const E={floors:W.floors||[],blocks:W.blocks||[]},out={walk:true,floors:(E.floors||[]).length,blocks:(E.blocks||[]).length,floor:null,block:null};
  const save={walk:ctl.walk,t:ctl.target.clone(),theta:ctl.theta,phi:ctl.phi,radius:ctl.radius,at:C.walkAt,keys:Object.assign({},C.keys)};
  for(const k in C.keys)C.keys[k]=false;
  try{
   ctl.walk=true;
   /* a floor: the first registered one, in order, a body's width across, 0.3 m or more over the ground, clear for a walker */
   for(const f of E.floors||[]){let x,z,y;
    if(f.rect){x=(f.rect[0]+f.rect[1])/2;z=(f.rect[2]+f.rect[3])/2;y=f.y;if(f.rect[1]-f.rect[0]<.8||f.rect[3]-f.rect[2]<.8)continue;}
    else if(f.pts&&f.pts.length>=3&&f.pts.every(p=>Math.abs(p[2]-f.pts[0][2])<1e-3)){x=0;z=0;for(const p of f.pts){x+=p[0];z+=p[1];}x/=f.pts.length;z/=f.pts.length;y=f.pts[0][2];
     let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const p of f.pts){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1]);}if(x1-x0<.8||z1-z0<.8)continue;}
    else continue;
    if(y-gh(x,z)<.3||W.blocked(x,y,z,WK.r,WK.h))continue;const top=W.floorsAt(x,z).find(q=>q[0]<=y+.01);if(!top||Math.abs(top[0]-y)>.01)continue;
    C.walkAt=[x,z,y];ctl.target.set(x,y+ctl.eye,z);C.stand();const ft=C.walkAt[2];
    out.floor={at:[+x.toFixed(2),+y.toFixed(2),+z.toFixed(2)],feet:+ft.toFixed(2),ground:+gh(x,z).toFixed(2),ok:Math.abs(ft-y)<.05};break;}
   /* a wall: a block 1.5 m or more tall standing on what a walker stands on beside it; the walker 3 m off its middle, facing it */
   for(const b of E.blocks||[]){if(b.off)continue;const B=b.box;const x0=B[0],x1=B[1],z0=B[2],z1=B[3],y0=B[4],y1=B[5];
    const cx=(x0+x1)/2,cz=(z0+z1)/2,sides=[[x0-3,cz,1,0],[x1+3,cz,-1,0],[cx,z0-3,0,1],[cx,z1+3,0,-1]];let done=false;
    for(const s of sides){const sx=s[0],sz=s[1],st=C.standY(sx,sz,y0+.5);if(y1-st<1.5||st<y0-.5||W.blocked(sx,st,sz,WK.r,WK.h))continue;
     /* nothing else in the way, and the ground level to the wall: the walk is a test of this wall only */
     let clear=true;for(let t=.5;t<3-WK.r-.05;t+=.25){const px=sx+s[2]*t,pz=sz+s[3]*t,py=C.standY(px,pz,st+WK.step);if(Math.abs(py-st)>.3||W.blocked(px,py,pz,WK.r,WK.h)){clear=false;break;}}
     if(!clear)continue;
     C.walkAt=[sx,sz,st];ctl.target.set(sx,st+ctl.eye,sz);ctl.theta=Math.atan2(-s[2],-s[3]);C.stand();
     C.keys.w=true;for(let i=0;i<40;i++){C.move(.1);C.stand();}C.keys.w=false;
     const ex=ctl.target.x,ez=ctl.target.z,along=(ex-sx)*s[2]+(ez-sz)*s[3],face=s[2]?(s[2]>0?x0:x1):(s[3]>0?z0:z1),gap=s[2]?Math.abs(face-ex):Math.abs(face-ez);
     out.block={box:B.map(v=>+v.toFixed(2)),from:[+sx.toFixed(2),+sz.toFixed(2)],end:[+ex.toFixed(2),+ez.toFixed(2)],moved:+along.toFixed(2),gap:+gap.toFixed(2),
      ok:along>1&&along<3.2&&!W.blocked(ex,C.walkAt[2],ez,WK.r,WK.h)&&gap<WK.r+.6};done=true;break;}
    if(done)break;}
  }finally{ctl.walk=save.walk;ctl.target.copy(save.t);ctl.theta=save.theta;ctl.phi=save.phi;ctl.radius=save.radius;C.walkAt=save.at;for(const k in C.keys)C.keys[k]=false;Object.assign(C.keys,save.keys);}
  return out;};
});
})(typeof window!=='undefined'?window:globalThis);
