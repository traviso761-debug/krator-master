const SITEV=(key,dist,h,ty,dx)=>{const S=SITES.find(s=>s.key===key);return[S.x+(dx||0),h,S.z+dist,S.x,ty,S.z];};
const EYE=(key,dist,dx)=>{const S=SITES.find(s=>s.key===key);return[S.x+(dx||0),1.7,S.z+dist,S.x,3,S.z];};
const VIEWS={'Overview':[0,120,ROWZ[ROWDEF.length-1]+160,0,10,ROWZ[Math.floor(ROWDEF.length/2)]]};
SITES.forEach(S=>{const D=VERN.defs[S.key];VIEWS[D.name]=SITEV(S.key,D.d*1.6+20,D.h*1.2+10,D.h*.35);VIEWS[D.name+' — eye level']=EYE(S.key,D.d*.9+12,D.w*.3);});
// closer work views for the guild set
VIEWS["Farmers' Guild — gate"]=EYE('vern_farmers_guild',17,3);
VIEWS["Beast Hunters' Guild — porch"]=(()=>{const S=SITES.find(s=>s.key==='vern_beast_hunters_guild');return[S.x-2,1.7,S.z+11,S.x-4.5,5,S.z];})();
VIEWS["Caravanserai — court"]=(()=>{const S=SITES.find(s=>s.key==='vern_caravanserai');return[S.x-7,1.7,S.z-8,S.x+2,3,S.z+8];})();
VIEWS["Forgemaster's Hall — inside"]=(()=>{const S=SITES.find(s=>s.key==='vern_forgemasters_hall');return[S.x+3,1.7,S.z+13,S.x,4.5,S.z-3];})();
VIEWS["Forgemaster's Hall — quarter"]=(()=>{const S=SITES.find(s=>s.key==='vern_forgemasters_hall');return[S.x+30,9,S.z+32,S.x,5,S.z];})();
