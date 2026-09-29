// ================================================================= ROKETSTAD — dev tools: the Paths overlay, the hour of day, the town's budgets
BUDGET.showcase={tris:32000000,calls:1200};   // round 9: the capital, twice the town; LOD (93b) keeps what is DRAWN far below this
BUDGET.cls.city=20000000;for(const k in TSTAT.by){BUDGET.type[k.split('/')[0]]='city';}
const PATHS={on:false,tex:null};
function pathsTexture(){if(PATHS.tex)return PATHS.tex;const c=document.createElement('canvas');c.width=c.height=CS;const g=c.getContext('2d');
 const COL={0:'#26221e',1:'#c8a860',2:'#2e7a3a',3:'#e8e0d0',4:'#c8c0b0',5:'#b8a890',6:'#a89878',7:'#6a6a3a',8:'#1a3a3a',9:'#a08868',10:'#4a2a2a',11:'#3a3430',12:'#6a5a2a',13:'#6a6e74',14:'#50303a'};
 const img=g.createImageData(CS,CS);const d=img.data;const rgb={};for(const k in COL){const s=COL[k];rgb[k]=[parseInt(s.slice(1,3),16),parseInt(s.slice(3,5),16),parseInt(s.slice(5,7),16)];}
 for(let i=0;i<CS*CS;i++){const q=rgb[kData[i*4]]||[0,0,0];d[i*4]=q[0];d[i*4+1]=q[1];d[i*4+2]=q[2];d[i*4+3]=255;}
 g.putImageData(img,0,0);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;PATHS.tex=t;return t;}
uiButton('Paths',false,()=>{PATHS.on=!PATHS.on;groundM.material.map=PATHS.on?pathsTexture():window._terrainTex;groundM.material.needsUpdate=true;return PATHS.on;});
uiButton('Forest',true,()=>{if(!BIO.baked||!BIO.baked.length)return false;const v=!BIO.baked[0].visible;for(const m of BIO.baked)m.visible=v;return v;});
{const wrap=document.createElement('span');wrap.style.cssText='display:inline-flex;align-items:center;gap:4px;margin-left:6px;font:12px system-ui;color:#ffe2b0';
 const lab=document.createElement('span');lab.textContent='hour '+CITYSKY.hour.toFixed(1);const sl=document.createElement('input');sl.type='range';sl.min=0;sl.max=24;sl.step=.1;sl.value=CITYSKY.hour;sl.style.width='120px';
 sl.oninput=()=>{CITYSKY.hour=parseFloat(sl.value);lab.textContent='hour '+CITYSKY.hour.toFixed(1);};wrap.appendChild(lab);wrap.appendChild(sl);ui.appendChild(wrap);}
window._api.town={RK,occ:()=>OCC.list.length,roads:()=>ROADS.length,setHour:h=>{CITYSKY.hour=h;},vern:()=>window._vern,port:()=>window._port,farms:()=>window._farms,biome:()=>window._biome,
 stats:()=>({plots:window._plots,frontage:window._frontage,infill:window._infill,suburbs:window._suburbs,streets:window._streets,unserved:window._unserved,wall:window._wallPieces,buildMs:window._buildMs,worldMs:window._worldMs})};
