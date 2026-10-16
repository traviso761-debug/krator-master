// ================================================================= EREWHON — dev tools: the Paths overlay, the hour of day, the city budgets
BUDGET.showcase={tris:ER.BUDGET,calls:1800};
BUDGET.cls.city=ER.BUDGET;for(const k in TSTAT.by){BUDGET.type[k.split('/')[0]]='city';}
const PATHS={on:false,tex:null};
window._masks=()=>({mask:KMASK.hash(mv),klass:KMASK.hash(kv),ops:KMASK.ops(mv).length+KMASK.ops(kv).length});   // core/mask: the proof two loads painted the same
function pathsTexture(){if(PATHS.tex)return PATHS.tex;const c=document.createElement('canvas');c.width=c.height=CS;const g=c.getContext('2d');
 const COL={0:'#26221e',1:'#c8a860',2:'#2e7a3a',3:'#e8e0d0',4:'#c8c0b0',5:'#f0d8a0',6:'#a89878',7:'#6a6a3a',8:'#1a3a3a',9:'#a08868',10:'#4a2a2a',11:'#3a3430',12:'#6a5a2a',13:'#2a8a8a'};
 const img=g.createImageData(CS,CS);const d=img.data;for(let i=0;i<CS*CS;i++){const k=kData[i*4];const col=COL[k]||'#000';d[i*4]=parseInt(col.slice(1,3),16);d[i*4+1]=parseInt(col.slice(3,5),16);d[i*4+2]=parseInt(col.slice(5,7),16);d[i*4+3]=255;}
 g.putImageData(img,0,0);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;PATHS.tex=t;return t;}
uiButton('Paths',false,()=>{PATHS.on=!PATHS.on;groundM.material.map=PATHS.on?pathsTexture():window._terrainTex;groundM.material.needsUpdate=true;return PATHS.on;});
uiButton('Forest',true,()=>{const v=!BIO.baked[0].visible;for(const m of BIO.baked)m.visible=v;return v;});
{const wrap=document.createElement('span');wrap.style.cssText='display:inline-flex;align-items:center;gap:4px;margin-left:6px;font:12px system-ui;color:#ffe2b0';
 const lab=document.createElement('span');lab.textContent='hour '+ERSKY.hour.toFixed(1);const sl=document.createElement('input');sl.type='range';sl.min=0;sl.max=24;sl.step=.1;sl.value=ERSKY.hour;sl.style.width='120px';
 sl.oninput=()=>{ERSKY.hour=parseFloat(sl.value);lab.textContent='hour '+ERSKY.hour.toFixed(1);};wrap.appendChild(lab);wrap.appendChild(sl);ui.appendChild(wrap);}
window._api.city={ER,DIST,GATES,roads:()=>ROADS.length,plan:()=>PLAN.length,chunks:()=>CHUNK_GROUPS.map(c=>({key:c.key,n:c.n})),setHour:h=>{ERSKY.hour=h;},biome:()=>window._biome};
// the Doors overlay (Travis): an arrow out of every door, the way it faces — for judging orientation from overhead
const DOORV={on:false,mesh:null};
function doorsMesh(){if(DOORV.mesh)return DOORV.mesh;const pos=[];for(const D of window.DOORS){const sx=Math.sin(D.ry),cz=Math.cos(D.ry);const y=(D.y||terrainH(D.x,D.z))+1.2;const ax=D.x+sx*5,az=D.z+cz*5;
  pos.push(D.x,y,D.z,ax,y,az);for(const s of[-1,1]){pos.push(ax,y,az,ax-sx*1.6+s*cz*1.2,y,az-cz*1.6-s*sx*1.2);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));const m=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0xff30d0,depthTest:false,fog:false}));m.renderOrder=9;m.userData.probeSkip=true;m.visible=false;scene.add(m);DOORV.mesh=m;return m;}
uiButton('Doors',false,()=>{DOORV.on=!DOORV.on;doorsMesh().visible=DOORV.on;return DOORV.on;});
