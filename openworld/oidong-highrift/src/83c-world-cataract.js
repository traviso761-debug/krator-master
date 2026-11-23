// ================================================================= THE OIDONG VALLEY AND THE HIGH RIFT — the Great Cataract
// [draw] Splits Rifar al-Jadwal at the Oidong terminal escarpment (src/48-world-site.js OHR_CUT.cat) into its upper valley
// reach, the 1,166 m arcing cataract curtain and plunge disc (WATER.fall / WATER.drawFall), the 232 m cauldron pool at its
// foot (WATER.still / WATER.drawStill), and the lower gorge reach running west into Xanadu. Runs right after 83-world-water.js,
// before 83w-world-seas.js adds open and shore surfaces.
LATE.push(()=>{if(typeof OHR_CUT==='undefined'||typeof RIVERS==='undefined'||typeof WATER==='undefined')return;
 const ct=OHR_CUT.cat();if(!ct||!RIVERS.list)return;
 const idx=RIVERS.list.findIndex(e=>e.R&&e.R.pts&&e.R.pts.some(p=>p[0]>-615000&&p[0]<-609000&&p[1]>-75000&&p[1]<-70000));
 if(idx<0)return;
 const ent=RIVERS.list[idx],R=ent.R,pts=R.pts,w=R.width*.85;
 const lx=ct.lip[0],lz=ct.lip[1],ly=ct.lip[2],cx=ct.caul[0],cz=ct.caul[1],cy=ct.caul[2],dx=ct.dir[0],dz=ct.dir[1];
 const upPts=[];let lipI=-1;
 for(let i=0;i<pts.length;i++){const p=pts[i];
  if(p[0]>lx+20&&lipI<0){upPts.push([p[0],p[1],p[2]]);}
  else if(lipI<0){lipI=i;}}
 if(upPts.length<2)return;
 const prevUp=upPts[upPts.length-1],lipY=Math.min(prevUp[2],ly);
 if(Math.hypot(prevUp[0]-lx,prevUp[1]-lz)>6)upPts.push([lx,lz,lipY]);
 else{prevUp[0]=lx;prevUp[1]=lz;prevUp[2]=lipY;}
 const loPts=[[cx,cz,cy]];let curY=cy;
 for(let i=Math.max(0,lipI);i<pts.length;i++){const p=pts[i],along=(p[0]-cx)*dx+(p[1]-cz)*dz;
  if(along<38&&Math.hypot(p[0]-cx,p[1]-cz)<180&&p[0]>-610400)continue;
  if(p[0]>-610120)continue;
  curY=Math.min(curY,Math.min(p[2],WORLD.H(p[0],p[1])+3.46));
  loPts.push([p[0],p[1],curY]);}
 // Remove the unsplit ribbon that stretched across the 1.17 km cliff face
 if(ent.D&&ent.D.mesh){HOST.scene.remove(ent.D.mesh);if(ent.D.mesh.geometry)ent.D.mesh.geometry.dispose();}
 const si=WATER.surfaces.indexOf(ent.F);if(si>=0)WATER.surfaces.splice(si,1);
 const di=(WATER.drawn||[]).indexOf(ent.D);if(di>=0)WATER.drawn.splice(di,1);
 RIVERS.list.splice(idx,1);
 WATER.surfaces.forEach((s,k)=>{s.id=k;});
 const flowOpt={shallow:0x6d9c92,deep:0x1d3c48,roughness:.14,metalness:.08,envMapIntensity:.45,step:20,across:6,margin:6,origin:true,renderOrder:2};
 const speedOf=P=>P.map((p,i)=>{const q=P[Math.min(i+1,P.length-1)],L=Math.hypot(q[0]-p[0],q[1]-p[1]);return Math.min(4.2,1+40*Math.max(0,(p[2]-q[2])/(L>1e-3?L:1)));});
 const Fup=WATER.flow({name:R.name+' (upper)',pts:upPts,width:w,speed:speedOf(upPts)});
 const Dup=WATER.drawFlow(Fup,flowOpt);Dup.mesh.userData.inspectLabel=R.name;
 const hw=w*.5,lip=[[lx+dz*hw,lz-dx*hw,lipY],[lx-dz*hw,lz+dx*hw,lipY]],drop=Math.max(20,lipY-cy);
 const Sfall=WATER.fall({name:'Great Cataract of Oidong',lip,dir:[dx,dz],drop,foot:[cx,cz,cy],fit:true,plunge:[cx,cy,cz],spread:26});
 Sfall.look={colour:'#b8d4d6'};
 const Dfall=WATER.drawFall(Sfall,{color:0xb8d4d6,opacity:.94,rows:96,cols:12,margin:6,edge:5,lipK:.88,footK:.78,plungeR:210,plungeY:cy+.08,spray:false,renderOrder:3});
 Sfall.curtainOpt.lipK=.88;Sfall.curtainOpt.footK=.78;Sfall.curtainOpt.plungeR=210;
 const poly=[];for(let k=0;k<24;k++){const a=k*Math.PI*2/24;poly.push([+(cx+Math.cos(a)*232).toFixed(2),+(cz+Math.sin(a)*224).toFixed(2)]);}
 const Spool=WATER.still({name:'Oidong Cataract Cauldron',level:cy,poly});
 Spool.look={colour:'#1d4248'};
 WATER.drawStill(Spool,{color:0x1d4248,roughness:.08,metalness:.12,envMapIntensity:.45,opacity:.94,renderOrder:2});
 RIVERS.list.push({R:{name:Fup.name,pts:upPts,width:R.width},F:Fup,D:Dup,falls:[Sfall]});
 if(loPts.length>=2){
  const Flo=WATER.flow({name:R.name+' (canyon)',pts:loPts,width:w,speed:speedOf(loPts)});
  const Dlo=WATER.drawFlow(Flo,flowOpt);Dlo.mesh.userData.inspectLabel=R.name;
  RIVERS.list.push({R:{name:Flo.name,pts:loPts,width:R.width},F:Flo,D:Dlo,falls:[]});}
 window.OHR_CATARACT={fall:Sfall,pool:Spool,upper:Fup,drop,lip:[lx,lipY,lz],cauldron:[cx,cy,cz],drawn:Dfall};
});
