// ================================================================= DALAB CITY — dev tools: the Paths overlay, the budgets, window._api.city
BUDGET.showcase={tris:16000000,calls:900};
BUDGET.cls.city=20000000;for(const k in TSTAT.by){BUDGET.type[k.split('/')[0]]='city';}
const PATHS={on:false,tex:null};
function pathsTexture(){if(PATHS.tex)return PATHS.tex;const c=document.createElement('canvas');c.width=c.height=CS;const g=c.getContext('2d');
 const COL={0:'#26221e',1:'#c8a860',2:'#2e7a3a',3:'#e8e0d0',4:'#c8c0b0',5:'#b8a890',6:'#d8b880',7:'#6a6a3a',8:'#1a3a3a',9:'#a08868',10:'#4a2a2a',11:'#3a3430',12:'#6a5a2a',13:'#3a6a2a'};
 const img=g.createImageData(CS,CS);const d=img.data;
 for(let i=0;i<CS*CS;i++){const k=kData[i*4];const col=COL[k]||'#000';const r=parseInt(col.slice(1,3),16),gg=parseInt(col.slice(3,5),16),b=parseInt(col.slice(5,7),16);d[i*4]=r;d[i*4+1]=gg;d[i*4+2]=b;d[i*4+3]=255;}
 g.putImageData(img,0,0);
 if(window.DOORS){g.fillStyle='#ff4040';for(const D of window.DOORS){g.fillRect(px(D.x)-1.5,px(D.z)-1.5,3,3);}}
 const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;PATHS.tex=t;return t;}
uiButton('Paths',false,()=>{PATHS.on=!PATHS.on;groundM.material.map=PATHS.on?pathsTexture():window._terrainTex;groundM.material.needsUpdate=true;return PATHS.on;});
uiButton('Trees',true,()=>{const v=!(BIO.baked[0]&&BIO.baked[0].visible);for(const m of BIO.baked)m.visible=v;return v;});
window._api.city={CITY,settlements:()=>SETTLE.map(S=>({key:S.key,name:S.name,x:Math.round(S.x),z:Math.round(S.z),houses:S.houses})),roads:()=>ROADS.length,components:()=>window._roadComponents,
 audit:()=>window._audit,placed:()=>{const by={};for(const p of PLACED)by[p.key]=(by[p.key]||0)+1;return by;},fields:()=>FIELDS.length,biome:()=>window._biome,life:()=>window._life,ms:()=>window._cityMs};
