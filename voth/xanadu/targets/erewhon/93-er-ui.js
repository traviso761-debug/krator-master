// ================================================================= EREWHON — dev tools: the Paths overlay, the hour of day, the city budgets
BUDGET.showcase={tris:ER.BUDGET,calls:1800};
BUDGET.cls.city=ER.BUDGET;for(const k in TSTAT.by){BUDGET.type[k.split('/')[0]]='city';}
const PATHS={on:false,tex:null};
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
