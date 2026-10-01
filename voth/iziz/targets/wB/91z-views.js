const SITEV=(key,dist,h,ty,dx)=>{const S=SITES.find(s=>s.key===key);return[S.x+(dx||0),h,S.z+dist,S.x,ty,S.z];};
const EYE=(key,dist,dx)=>{const S=SITES.find(s=>s.key===key);return[S.x+(dx||0),1.7,S.z+dist,S.x,3,S.z];};
const VIEWS={'Overview':[0,120,ROWZ[ROWDEF.length-1]+160,0,10,ROWZ[Math.floor(ROWDEF.length/2)]]};
SITES.forEach(S=>{const D=VERN.defs[S.key];VIEWS[D.name]=SITEV(S.key,D.d*1.6+20,D.h*1.2+10,D.h*.35);VIEWS[D.name+' — eye level']=EYE(S.key,D.d*.9+12,D.w*.3);});
// ported compounds: inside the court and at the gate, at eye height
{const E=SITES.find(s=>s.key==='port_voth_embassy'),C=SITES.find(s=>s.key==='port_order_chapterhouse');
 if(E){VIEWS['Voth Embassy — court']=[E.x+2,1.7,E.z+12,E.x-6,6,E.z-8];VIEWS['Voth Embassy — gate']=[E.x,1.7,E.z+26,E.x,5,E.z+12];}
 if(C){VIEWS['Order Chapterhouse — court']=[C.x,1.7,C.z+12.5,C.x,6,C.z-6];VIEWS['Order Chapterhouse — gate']=[C.x,1.7,C.z+19,C.x,5,C.z+8];}}
