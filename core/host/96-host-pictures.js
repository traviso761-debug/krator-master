// ================================================================= CORE HOST — the picture menu: what can be placed, as pictures
// [web] core/host/96-host-pictures.js (ROADMAP.md section 10: "96 picture menu and sheet"). Ported from Voth's city plan
// (settlements/voth/targets/voth-city/58-vc-tools.js 209-264: the grid, the filter, thumbnails drawn off screen two a frame),
// generalised: the build hands the list and how to build one item; the host owns the panel and the pictures.
//
//   o.palette = {items: [{key, name, family, cls?, tags?, variants?}], build(key, variant) -> Object3D}
//   KHOST.pictures.open(family?, cls?) / close() / toggle(); cls: 'flora', 'life' or 'other' (98's plant, fauna and place)
//   .pick = fn(item) (98 edit sets it); .families
//   A picture is drawn once, off screen (a 128-pixel target, its own lights, the camera fitted to the item's bounding
//   sphere), only while the menu is open, two a frame, and kept. The sheet (?pictures=sheet) shows every picture at once.
(function(root){
'use strict';
const K=root.KHOST=root.KHOST||{},doc=root.document;
K.onTake(function picturesTake(H){
 const o=H.o,PAL=o.palette;if(!PAL||!PAL.items||!PAL.items.length)return;
 const THREE=o.THREE||root.THREE,R=H.renderer,SZ=128;
 const PI=K.pictures={items:PAL.items,done:Object.create(null),queue:[],open:null,pick:null,filter:'',family:''};
 PI.families=[...new Set(PAL.items.map(i=>i.family||'other'))].sort();
 // ---------------------------------------------------------------- the panel
 const P=K.panel('pics','Pictures',null,'left:auto;right:14px;top:60px;width:min(460px,calc(100vw - 28px));max-height:70vh;overflow:auto;display:none');
 const bar=doc.createElement('div');bar.className='row';P.appendChild(bar);
 const find=doc.createElement('input');find.placeholder='find';find.style.cssText='width:140px';bar.appendChild(find);
 const fam=doc.createElement('select');bar.appendChild(fam);['','…'].slice(0,1).concat(PI.families).forEach(f=>{const op=doc.createElement('option');op.value=f;op.textContent=f||'every family';fam.appendChild(op);});
 const grid=doc.createElement('div');grid.id='khost-pics-grid';grid.style.cssText='display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:6px;margin-top:6px';P.appendChild(grid);
 const esc=t=>String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;');
 const clsOf=i=>i.cls==='flora'||i.cls==='life'?i.cls:'other';   // the editor's modes: plant (flora), fauna (life), place (the rest)
 function shown(){const f=PI.filter.toLowerCase();return PAL.items.filter(i=>(!PI.cls||clsOf(i)===PI.cls)&&(!PI.family||(i.family||'other')===PI.family)&&(!f||(i.name+' '+i.key+' '+(i.family||'')).toLowerCase().indexOf(f)>=0));}
 function paint(){const S=shown();
  grid.innerHTML=S.map(i=>'<div class="khost-pic" data-k="'+esc(i.key)+'" title="'+esc(i.key)+'" style="cursor:pointer;border:1px solid rgba(216,200,154,.25);border-radius:3px;padding:3px;background:rgba(10,10,12,.5)'+(PI.sel===i.key?';border-color:#9fe8ff':'')+'">'+
   (PI.done[i.key]?'<img src="'+PI.done[i.key]+'" style="width:100%;display:block">':'<div class="ph" style="width:100%;aspect-ratio:1;background:#2a2c30"></div>')+
   '<div style="font-size:10px;line-height:1.2;margin-top:2px">'+esc(i.name)+'</div><div class="k" style="font-size:9px">'+esc(i.family||'')+'</div></div>').join('');
  PI.queue=S.filter(i=>!PI.done[i.key]).map(i=>i.key);
  [].forEach.call(grid.querySelectorAll('.khost-pic'),d=>{d.onclick=()=>{const it=PAL.items.find(i=>i.key===d.dataset.k);PI.sel=it.key;paint();if(PI.pick)PI.pick(it);};});}
 find.oninput=()=>{PI.filter=find.value;paint();};fam.onchange=()=>{PI.family=fam.value;paint();};
 PI.open=function(family,cls){if(family!=null){PI.family=family;fam.value=family;}PI.cls=cls||null;P.style.display='block';paint();};
 PI.close=function(){P.style.display='none';};
 PI.isOpen=()=>P.style.display!=='none';
 PI.toggle=()=>PI.isOpen()?PI.close():PI.open();
 // ---------------------------------------------------------------- the pictures, off screen
 let RT=null,sc=null,cam=null,cv=null,px=null;
 function setup(){RT=new THREE.WebGLRenderTarget(SZ,SZ);sc=new THREE.Scene();sc.background=new THREE.Color(0x9fb0bc);
  sc.add(new THREE.HemisphereLight(0xf2eee4,0x5a5248,.95));const d=new THREE.DirectionalLight(0xffffff,.8);d.position.set(3,5,4);sc.add(d);
  cam=new THREE.PerspectiveCamera(30,1,.05,500);cv=doc.createElement('canvas');cv.width=cv.height=SZ;px=new Uint8Array(SZ*SZ*4);}
 function draw(key){const it=PAL.items.find(i=>i.key===key);if(!it)return;let g;
  try{g=PAL.build(key,0);}catch(e){PI.done[key]='data:,';K.err('picture '+key+': '+((e&&e.stack)||e));return;}
  if(!g){PI.done[key]='data:,';return;}
  if(!RT)setup();sc.add(g);const b=new THREE.Box3().setFromObject(g),s=b.getBoundingSphere(new THREE.Sphere());const r=Math.max(.2,s.radius),dd=r/Math.sin(15*Math.PI/180)*1.05;
  cam.position.set(s.center.x+Math.sin(.75)*Math.cos(.42)*dd,s.center.y+Math.sin(.42)*dd,s.center.z+Math.cos(.75)*Math.cos(.42)*dd);cam.near=dd/50;cam.far=dd*4;cam.updateProjectionMatrix();cam.lookAt(s.center);
  const prev=R.getRenderTarget(),sh=R.shadowMap.enabled,ac=R.autoClear;R.shadowMap.enabled=false;R.autoClear=true;R.setRenderTarget(RT);R.render(sc,cam);R.readRenderTargetPixels(RT,0,0,SZ,SZ,px);R.setRenderTarget(prev);R.shadowMap.enabled=sh;R.autoClear=ac;
  sc.remove(g);g.traverse(q=>{if(q.geometry)q.geometry.dispose();});
  const c=cv.getContext('2d'),img=c.createImageData(SZ,SZ);
  for(let y=0;y<SZ;y++)for(let x=0;x<SZ;x++){const i=((SZ-1-y)*SZ+x)*4,j=(y*SZ+x)*4;for(let k=0;k<3;k++)img.data[j+k]=Math.round(255*Math.pow(px[i+k]/255,1/2.2));img.data[j+3]=255;}   // flip, and linear to sRGB
  c.putImageData(img,0,0);PI.done[key]=cv.toDataURL('image/jpeg',.82);
  const el=grid.querySelector('.khost-pic[data-k="'+key.replace(/"/g,'\\"')+'"] .ph');if(el){const im=doc.createElement('img');im.src=PI.done[key];im.style.cssText='width:100%;display:block';el.replaceWith(im);}}
 K.on(function picturesDraw(){if(!PI.isOpen()||!PI.queue.length)return;for(let n=0;n<2&&PI.queue.length;n++)draw(PI.queue.shift());},'after');
 if(/[?&#]pictures=sheet/.test(location.search+location.hash))PI.open();
});
})(typeof window!=='undefined'?window:globalThis);
