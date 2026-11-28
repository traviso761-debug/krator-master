// ================================================================= HOST — giant cathedral-mound termites on the Aw upland savanna
// Placed on SW Bay's upland Aw parasol savanna (`SWBAY.zones(x,z).sav > .58`, well clear of the river channel, karst
// springs, hyperjungle/rainforest, and tower). Each fluted red-laterite cathedral spire (3.5-8.8 m tall, KSTACKS.mounds)
// pushes into OBSTACLES before SWBAY.build so trees and the grazer herd route round it, then SWBAY.buildTermites (76)
// inoculates its basal skirt and vents with `mound-cap` & `hive-comb` fungal crops, animates cat-sized workers & wolf-sized
// soldiers, and registers KHAZ predator/acid hazards. ?termites=0 turns the pass off.
window.SWBAY_MOUNDS={list:[],mesh:null,stats:null};
function placeTermiteMounds(){
 const Q=new URLSearchParams(location.search);
 if(Q.get('termites')==='0'||typeof KSTACKS==='undefined'||typeof SWBAY==='undefined')return [];
 const R=TERR.R-160,cx=CENTER[0],cz=CENTER[1];
 const slopeAt=(x,z)=>Math.hypot(terrainH(x+2,z)-terrainH(x-2,z),terrainH(x,z+2)-terrainH(x,z-2))/4;
 const clearObs=(x,z,pad)=>!OBSTACLES.some(o=>Math.hypot(x-o.x,z-o.z)<(o.r||0)+pad);
 const list=KSTACKS.mounds({
  id:'swbay.mound',world:0x57ba7,cell:105,p:.34,H:[3.5,8.8],gap:9,
  x0:cx-R,z0:cz-R,x1:cx+R,z1:cz+R,
  ground:terrainH,soil:[.64,.36,.24],
  accept:(x,z,r)=>{
   if(Math.hypot(x-cx,z-cz)>R)return false;
   const Z=SWBAY.zones(x,z);
   if(Z.sav<.58||Z.wet>.46||Z.h<95||riverD(x,z)<65)return false;
   if(slopeAt(x,z)>.28||!clearObs(x,z,r+8))return false;
   return true;
  }
 });
 const cells=new Map(),CELL=600,c=new THREE.Color();
 list.forEach(M=>{
  const key=Math.floor(M.x/CELL)+','+Math.floor(M.z/CELL);
  let B=cells.get(key);if(!B){B={pos:[],col:[],uv:[],idx:[],pts:[]};cells.set(key,B);}
  const m=KSTACKS.mesh(M,{step:1.4}),n0=B.pos.length/3,cl=M.clay||[.64,.36,.24];
  c.setRGB(cl[0],cl[1],cl[2]).convertSRGBToLinear();
  for(let v=0;v<m.part.length;v++){
   const px=m.pos[3*v],py=m.pos[3*v+1],pz=m.pos[3*v+2];
   B.pos.push(px,py,pz);
   B.uv.push((px-M.x)*.35,(py-M.y0)*.35);
   // Fluted chimney shade: darker damp red clay at the skirt & in flue flutes, sun-baked ochre on ribs
   const hFrac=Math.max(0,Math.min(1,(py-M.y0)/Math.max(1,M.top-M.y0)));
   const k=(.50+.50*m.occ[v])*(.86+.22*hFrac);
   B.col.push(c.r*k,c.g*k,c.b*k);
  }
  for(let i=0;i<m.idx.length;i++)B.idx.push(n0+m.idx[i]);
  B.pts.push(M.x,(M.y0+M.top)*.5,M.z);
  OBSTACLES.push({x:M.x,z:M.z,r:M.R+1.5,y0:M.y0-1,y1:M.top});
 });
 if(cells.size){
  const det=typeof hostGroundLib==='function'?hostGroundLib('groundDetail',null):null;
  const mat=new THREE.MeshLambertMaterial({vertexColors:true,map:det||null});
  mat.customProgramCacheKey=()=>'swbay-termite-mounds';
  cells.forEach(B=>{
   if(!B.idx.length)return;
   const g=new THREE.BufferGeometry();
   g.setAttribute('position',new THREE.Float32BufferAttribute(B.pos,3));
   g.setAttribute('color',new THREE.Float32BufferAttribute(B.col,3));
   g.setAttribute('uv',new THREE.Float32BufferAttribute(B.uv,2));
   g.setIndex(B.idx);
   g.computeVertexNormals();
   g.computeBoundingSphere();
   const me=new THREE.Mesh(g,mat);
   me.userData.host=true;
   me.userData.rock=true;
   me.userData.inspectLabel='Giant termite earthen cathedral mound (fluted red clay)';
   me.userData.probePoints=B.pts;
   scene.add(me);
   if(!window.SWBAY_MOUNDS.mesh)window.SWBAY_MOUNDS.mesh=me;
  });
 }
 window.SWBAY_MOUNDS.list=list;
 return list;
}
function populateTermiteMounds(){
 const L=window.SWBAY_MOUNDS&&window.SWBAY_MOUNDS.list;
 if(!L||!L.length||!SWBAY.buildTermites)return null;
 BIO.cur='bay/termites';
 const st=SWBAY.buildTermites(L,{biome:'swbay',world:0x57ba7,ground:terrainH,register:REGISTER,maxActive:18});
 BIO.cur=null;
 window.SWBAY_MOUNDS.stats=st;
 return st;
}
