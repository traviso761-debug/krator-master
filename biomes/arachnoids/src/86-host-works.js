// ================================================================= HOST — Hum gorge-warden site reserves & optional ?works=0 outdoor furniture ([draw])
// Registers site:hum-webgate & station reserves in KTAGS (held clear of buildings), plus lightweight ?works=0 Hum braided-silk
// suspension anchor capstans, saltpeter scraping troughs, notched basalt wind-flutes, and placer riffle-boxes (class: 'furniture', 100% textured).
const WORKS=(function(){
 const Q=new URLSearchParams(location.search),on=Q.get('works')!=='0';
 const group=new THREE.Group();
 group.name='arachnoids-works';
 group.userData.host=true;
 scene.add(group);
 const items=[];

 if(SITE.reserves&&typeof KTAGS!=='undefined'&&KTAGS.page){
  for(let i=0;i<SITE.reserves.length;i++){
   const R=SITE.reserves[i],ry=DRAWN_H(R.x,R.z);
   KTAGS.page.add({
    id:R.id,name:R.name,class:'landmark',at:[R.x,ry,R.z],r:R.fullReserveR==null?R.r:R.fullReserveR,h:18,
    tags:{biome:'arachnoids',culture:R.culture,elevASL:+(SITE.elevM+(ry-SITE.bedY)).toFixed(1)}
   });
  }
 }
 if(!HAZARDS.length&&typeof KHAZ!=='undefined'&&typeof KTAGS!=='undefined'&&KTAGS.page){
  const addHz=(id,name,x,z,r,h,haz)=>{
   const y=DRAWN_H(x,z);
   const rec={id:id,name:name,class:'feature',at:[x,y,z],r:r,h:h,tags:{biome:'arachnoids',hazard:KHAZ.make(haz)}};
   KTAGS.page.add(rec);
   HAZARDS.push(rec);
  };
  if(SKEY==='nexus'){
   addHz('arachnoids:webtrap','Tsek-Ma High-Tensile Bridge-Web Perimeter Snare',0,-2,46,52,{kind:'grab',effect:'hold',danger:0.55,dose:0.25,falloff:'smooth'});
   addHz('arachnoids:slotflood','Ham-Tsek 1295 m3/s Basalt Shut-In Whitewater Surge',0,0,28,14,{kind:'drown',effect:'drown',danger:0.80,dose:0.40,falloff:'linear'});
  }else if(SKEY==='fumarole'){
   addHz('arachnoids:fumarole','Ring-Fault +68 C Sulfur-Steam Scalding Fumaroles',-18,48,65,16,{kind:'heat',effect:'burn',danger:0.75,dose:0.35,falloff:'smooth'});
   addHz('arachnoids:slotflood','Ham-Tsek 995 m3/s Cauldron Trough Torrent',0,-116,24,12,{kind:'drown',effect:'drown',danger:0.70,dose:0.35,falloff:'linear'});
  }else if(SKEY==='ledges'){
   addHz('arachnoids:updraftdrop','Unguarded 970 m Colonnade Ledge Updraft Drop',0,95,85,180,{kind:'fall',effect:null,danger:0.85,dose:0.50,falloff:'linear'});
  }else{
   addHz('arachnoids:updraftdrop','2000 m High Frost-Rim Chasm Lip Cross-Gale',0,132,95,220,{kind:'fall',effect:null,danger:0.90,dose:0.55,falloff:'linear'});
  }
 }

 const addPart=(geo,mat,x,y,z,rx,ry,rz,label)=>{
  const m=new THREE.Mesh(geo,mat);
  m.position.set(x,y,z);
  m.rotation.set(rx,ry,rz);
  m.castShadow=true;m.receiveShadow=true;
  m.userData.host=true;m.userData.inspectLabel=label;
  group.add(m);
  items.push(m);
  return m;
 };

 if(on){
  if(SKEY==='nexus'){
   // Hum braided-silk suspension capstans, notched basalt wind-flutes & saltpeter scraping trough at site:hum-webgate (-95, 60)
   const R0=SITE.reserves[0],bx=R0.x,bz=R0.z,by=DRAWN_H(bx,bz);
   [[-4.5,-2.5],[4.5,-2.5]].forEach((off,i)=>{
    const cx=bx+off[0],cz=bz+off[1],cy=DRAWN_H(cx,cz);
    addPart(new THREE.CylinderGeometry(0.68,0.82,0.65,6),ARACHNOIDS.M.rockBasalt,cx,cy+0.25,cz,0,i*0.5,0,'Hum Basalt Hawser-Pier Plinth');
    addPart(new THREE.CylinderGeometry(0.32,0.32,1.15,10),ARACHNOIDS.M['wood.plank'],cx,cy+0.95,cz,0,0,0,'Hum Toll-Bridge Silk Capstan Drum');
    addPart(new THREE.TorusGeometry(0.38,0.09,8,14),ARACHNOIDS.M.silkCollar,cx,cy+0.95,cz,Math.PI*0.5,0,0,'Braided Tsek-Ma Chasm-Silk Hawser Coil');
    if(typeof KTAGS!=='undefined'&&KTAGS.page){
     KTAGS.page.add({id:'arachnoids:hum-capstan-'+i,name:'Hum Chasm-Silk Capstan',class:'furniture',at:[cx,cy,cz],r:1.1,h:1.8,tags:{culture:'hum',placement:'outdoor',type:'capstan'}});
    }
   });
   // Carved basalt Aeolian wind-flute warning of shut-in gales + wooden saltpeter scraping trough
   const fx=bx+1.5,fz=bz-6.2,fy=DRAWN_H(fx,fz);
   addPart(new THREE.CylinderGeometry(0.22,0.32,2.15,6),ARACHNOIDS.M.rockBasalt,fx,fy+0.98,fz,0,0.3,0,'Notched Basalt Gorge-Gale Wind-Flute');
   addPart(new THREE.BoxGeometry(2.1,0.42,0.75),ARACHNOIDS.M['wood.plank'],bx-1.8,by+0.22,bz+3.8,0,0.4,0,'Hum Overhang Saltpeter Scraping Trough');
   if(typeof KTAGS!=='undefined'&&KTAGS.page){
    KTAGS.page.add({id:'arachnoids:hum-windflute',name:'Notched Basalt Gorge Wind-Flute',class:'furniture',at:[fx,fy,fz],r:0.8,h:2.2,tags:{culture:'hum',placement:'outdoor',type:'marker'}});
   }
   REGISTER({tagId:'arachnoids:hum-webgate-pier',name:'Hum Gorge-Warden Silk Toll-Pier & Wind-Flute Post',x:bx,z:bz,y:by-3,r:24,h:14,tags:{culture:'hum'}});
  }else if(SKEY==='fumarole'){
   // Hum cassiterite & gold placer wooden riffle-boxes + woven bamboo sulfur-condenser hood at (112, -36)
   const R0=SITE.reserves[0],bx=R0.x,bz=R0.z,by=DRAWN_H(bx,bz);
   for(let i=0;i<2;i++){
    const rx=bx-3.2+i*6.4,rz=bz-1.8*i,ry=DRAWN_H(rx,rz);
    addPart(new THREE.BoxGeometry(2.8,0.36,0.82),ARACHNOIDS.M['wood.plank'],rx,ry+0.34,rz,0,0.25,0.12,'Hum Cassiterite & Gold Placer Riffle-Sluice');
    addPart(new THREE.CylinderGeometry(0.10,0.12,0.75,6),ARACHNOIDS.M['wood.plank'],rx-1.1,ry+0.18,rz,0,0,0,'Placer Sluice Trestle Leg');
    if(typeof KTAGS!=='undefined'&&KTAGS.page){
     KTAGS.page.add({id:'arachnoids:hum-riffle-'+i,name:'Hum Placer Washing Riffle-Box',class:'furniture',at:[rx,ry,rz],r:1.6,h:0.9,tags:{culture:'hum',placement:'outdoor',type:'workstation'}});
    }
   }
   const sx=74,sz=36,sy=DRAWN_H(sx,sz);
   addPart(new THREE.ConeGeometry(0.85,1.25,8,1,false),ARACHNOIDS.M['bark.bamboo'],sx,sy+0.58,sz,0,0,0,'Woven Bamboo Fumarole Sulfur-Condenser Basket');
   REGISTER({tagId:'arachnoids:hum-placer-bar',name:'Hum Cassiterite & Gold Placer Riffle-Bar',x:bx,z:bz,y:by-3,r:22,h:12,tags:{culture:'hum'}});
  }else if(SKEY==='ledges'){
   // Hum colonnade cliff-stair landing cairn & silk safety-line bollard at (-78, 18)
   const R0=SITE.reserves[0],bx=R0.x,bz=R0.z,by=DRAWN_H(bx,bz);
   addPart(new THREE.CylinderGeometry(0.55,0.72,1.45,6),ARACHNOIDS.M.rockBasalt,bx,by+0.65,bz,0,0.2,0,'Hum Colonnade Cliff-Stair Belay Bollard');
   addPart(new THREE.TorusGeometry(0.62,0.08,8,14),ARACHNOIDS.M.silkCollar,bx,by+1.12,bz,Math.PI*0.5,0,0,'Braided Chasm-Silk Climbing Line');
   if(typeof KTAGS!=='undefined'&&KTAGS.page){
    KTAGS.page.add({id:'arachnoids:hum-belay-post',name:'Hum Colonnade Belay Bollard',class:'furniture',at:[bx,by,bz],r:1.0,h:1.6,tags:{culture:'hum',placement:'outdoor',type:'marker'}});
   }
   REGISTER({tagId:'arachnoids:hum-ledge-landing',name:'Hum Colonnade Cliff-Stair Belay Landing',x:bx,z:bz,y:by-3,r:20,h:12,tags:{culture:'hum'}});
  }else{
   // Station 4 (frostrim): Hum high-rim granite/vitrophyre portage cairns & wind-sheltered root-wood brazier ring at (-42, -36)
   const R0=SITE.reserves[0],bx=R0.x,bz=R0.z,by=DRAWN_H(bx,bz);
   [[-3.0,0],[3.2,1.5]].forEach((off,i)=>{
    const cx=bx+off[0],cz=bz+off[1],cy=DRAWN_H(cx,cz);
    addPart(new THREE.CylinderGeometry(0.48,0.76,1.55,7),ARACHNOIDS.M.rockGranite,cx,cy+0.68,cz,0,i*0.7,0,'Hum High-Rim Portage Cairn');
    addPart(new THREE.BoxGeometry(0.42,0.52,0.18),ARACHNOIDS.M.rockVitrophyre,cx,cy+1.58,cz,0,0.4*i,0,'Polished Obsidian-Vitrophyre Gale-Marker');
    if(typeof KTAGS!=='undefined'&&KTAGS.page){
     KTAGS.page.add({id:'arachnoids:hum-frost-cairn-'+i,name:'Hum High-Rim Obsidian Cairn',class:'furniture',at:[cx,cy,cz],r:1.0,h:2.0,tags:{culture:'hum',placement:'outdoor',type:'marker'}});
    }
   });
   REGISTER({tagId:'arachnoids:hum-frostrim-portage',name:'Hum High-Rim Cairn & Portage Shelter',x:bx,z:bz,y:by-3,r:20,h:12,tags:{culture:'hum'}});
  }
 }
 return{group:group,items:items};
})();
