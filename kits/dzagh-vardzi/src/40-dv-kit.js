// prefix: dv
// ================================================================= DZAGH-VARDZI ARCHITECTURAL TOOLKIT (DV2 + DV4)
// Apricot-rose volcanic tuff & dark charcoal basalt horizontal ablaq walls, zero-podium battered gorge root-skirts,
// sawn emerald-green nephrite cross-medallions, golden-skarn arched tympanums, Dagestani walkable slate roof-plazas,
// Caucasian mashikul machicolation boxes, and aerial gorge ropeway pulley-rigs.
// Every helper maintains >= 5 mm structural separation between distinct materials and verified outward winding.
const DV_WALL_T=.36,DV_FLOOR_T=.14;
const DV_SHELL_PROBES=[];
function dvShellReset(){DV_SHELL_PROBES.length=0;}
function dvAuditShell(kind,lx,ly,lz,fn){
 const snap={};for(const k in GTARGET)snap[k]=GTARGET[k].i.length;
 const wc=new THREE.Vector3(lx,ly,lz).applyMatrix4(CM);
 fn();
 if(GTARGET!==GB)return;
 let outN=0,inN=0,auxN=0;
 for(const mk in GTARGET){
  const b=GTARGET[mk],s0=snap[mk]||0,I=b.i,P0=b.p;
  for(let t=s0;t<I.length;t+=3){
   const a=I[t]*3,c=I[t+1]*3,d=I[t+2]*3;
   const e1x=P0[c]-P0[a],e1y=P0[c+1]-P0[a+1],e1z=P0[c+2]-P0[a+2];
   const e2x=P0[d]-P0[a],e2y=P0[d+1]-P0[a+1],e2z=P0[d+2]-P0[a+2];
   let nx=e1y*e2z-e1z*e2y,ny=e1z*e2x-e1x*e2z,nz=e1x*e2y-e1y*e2x;
   const L=Math.hypot(nx,ny,nz);if(L<2e-4)continue;
   nx/=L;ny/=L;nz/=L;
   const tx=(P0[a]+P0[c]+P0[d])/3,ty=(P0[a+1]+P0[c+1]+P0[d+1])/3,tz=(P0[a+2]+P0[c+2]+P0[d+2])/3;
   const rx=tx-wc.x,rz=tz-wc.z,rh=Math.hypot(rx,rz)||1e-6,rdot=(nx*rx+nz*rz)/rh;
   if(kind==='skirt'||kind==='tower'||kind==='hood'||kind==='basket'){
    if(Math.abs(ny)>.92)continue;
    if(rdot>.15)outN++;else if(rdot<-.15)inN++;
   }else if(kind==='gable'){
    if(ny>.25)outN++;else if(ny<-.25)auxN++;
   }else if(kind==='gumbat'){
    if(mk==='skarn'){if(ny<-.3)auxN++;else if(ny>.3)inN++;}
    else{if(ny>.08&&rdot>.05)outN++;else if(ny<-.1||rdot<-.15)inN++;}
   }else if(kind==='flume'){
    if(mk==='flumeWater'){if(ny>.5)auxN++;}
    else if(mk==='planks'||mk==='floor'){if(ny>.2)outN++;else if(ny<-.2)auxN+=1000;}
   }
  }
 }
 let ok=false;
 if(kind==='skirt'||kind==='tower'||kind==='hood'||kind==='basket')ok=outN>=8&&inN===0;
 else if(kind==='gable')ok=outN>=4&&auxN>=4;
 else if(kind==='gumbat')ok=outN>=48&&auxN>=48&&inN===0;
 else if(kind==='flume')ok=outN>=4&&Math.floor(auxN/1000)>=4&&(auxN%1000)>=2;
 DV_SHELL_PROBES.push({kind,x:wc.x,y:wc.y,z:wc.z,ok,outN,inN,auxN});
}

function dvFace(x,z,tx,tz){return Math.atan2((tx==null?0:tx)-x,(tz==null?0:tz)-z);}
function dvNoCut(fn){const keep=CUTC;CUTC=[keep[0],keep[1],keep[2],0];try{fn();}finally{CUTC=keep;}}

/* subterranean below-grade geometry (y < 0): plunges cleanly into steep 0-30 deg gorge slopes & chasm walls with zero boxy
   podiums, while pausing SB and KWALKBOX so above-ground footprint height checks measure y >= 0 structure */
function dvBelowGrade(fn){const keepSB=SB;SB=null;try{dvNoCut(()=>svNoWalk(fn));}finally{SB=keepSB;}}

/* ---------------------------------------------------------------- 0. Closed Flat-Normal 4-Sided Battered Frustum (`dvFrustum4`)
   Builds 4 sloped side quads (+ optional top/bottom caps) with explicit outward normals verified against the frustum axis,
   making inverted/back-face-culled frustum walls mathematically impossible. */
function dvFrustum4(mk,cx,cz,w0,d0,w1,d1,y0,y1,col,o){
 o=o||{};const hw0=w0/2,hd0=d0/2,hw1=w1/2,hd1=d1/2,ym=(y0+y1)/2;
 const bot=[[-hw0,-hd0],[hw0,-hd0],[hw0,hd0],[-hw0,hd0]];
 const top=[[-hw1,-hd1],[hw1,-hd1],[hw1,hd1],[-hw1,hd1]];
 const pos=[],nor=[],idx=[];
 for(let f=0;f<4;f++){
  const g=(f+1)%4;
  const p0=[cx+bot[f][0],y0,cz+bot[f][1]],p1=[cx+bot[g][0],y0,cz+bot[g][1]];
  const p2=[cx+top[g][0],y1,cz+top[g][1]],p3=[cx+top[f][0],y1,cz+top[f][1]];
  const e1=[p1[0]-p0[0],p1[1]-p0[1],p1[2]-p0[2]],e2=[p3[0]-p0[0],p3[1]-p0[1],p3[2]-p0[2]];
  let nx=e1[1]*e2[2]-e1[2]*e2[1],ny=e1[2]*e2[0]-e1[0]*e2[2],nz=e1[0]*e2[1]-e1[1]*e2[0];
  const L=Math.hypot(nx,ny,nz)||1;nx/=L;ny/=L;nz/=L;
  const mx=(p0[0]+p1[0]+p2[0]+p3[0])*.25-cx,mz=(p0[2]+p1[2]+p2[2]+p3[2])*.25-cz;
  if(nx*mx+nz*mz<0){nx=-nx;ny=-ny;nz=-nz;}
  const s=pos.length/3;
  pos.push(...p0,...p1,...p2,...p3);
  for(let k=0;k<4;k++)nor.push(nx,ny,nz);
  idx.push(s,s+1,s+2,s,s+2,s+3);
 }
 if(o.caps){
  const st=pos.length/3;
  for(let k=0;k<4;k++){pos.push(cx+top[k][0],y1,cz+top[k][1]);nor.push(0,1,0);}
  idx.push(st,st+2,st+1,st,st+3,st+2);
  const sb=pos.length/3;
  for(let k=0;k<4;k++){pos.push(cx+bot[k][0],y0,cz+bot[k][1]);nor.push(0,-1,0);}
  idx.push(sb,sb+1,sb+2,sb,sb+2,sb+3);
 }
 const draw=()=>emit(mk,fixWind(mkGeo(pos,nor,null,idx)),null,col);
 if(o.kind)dvAuditShell(o.kind,cx,ym,cz,draw);else draw();
}

/* ---------------------------------------------------------------- 1. Zero-Podium Battered Gorge Root-Skirt
   Open-bottomed 4-sided battered frustum extending 4.8-7.0 m below y = 0 (no flat podium terrace!). */
function dvRootSkirt(cx,cz,w,d,depth,o){
 o=o||{};const dep=depth==null?5.4:depth,bat=o.batter==null?.16:o.batter;
 const mk=o.mk||'colBasalt',col=o.col==null?P(mk==='cobble'?'cobble':'colBasalt'):o.col;
 dvBelowGrade(()=>{
  dvFrustum4(mk,cx,cz,w+dep*bat*2,d+dep*bat*2,w-.01,d-.01,-dep,-.006,col,{caps:false,kind:'skirt'});
 });
 /* neat chamfered basalt base collar (proud of wall by 45 mm, hollow frame so interior floors never touch it) */
 const ph=o.plinthH==null?.34:o.plinthH;
 if(ph>.04&&o.plinth!==false){
  const pw=.055,pmk=o.plinthMk||'basalt',pcol=P('basalt');
  dvNoCut(()=>svNoWalk(()=>{
   box(pmk,cx,.004,cz+d/2+pw/2+.006,w+pw*2,ph,pw,pcol);
   box(pmk,cx,.004,cz-d/2-pw/2-.006,w+pw*2,ph,pw,pcol);
   box(pmk,cx+w/2+pw/2+.006,.004,cz,pw,ph,d-.02,pcol);
   box(pmk,cx-w/2-pw/2-.006,.004,cz,pw,ph,d-.02,pcol);
  }));
 }
}

/* ---------------------------------------------------------------- 2. Walkable Floor Slabs & Rock-Cut Exterior Steps */
function dvFloorRect(cx,cz,w,d,y,mk,col,o){
 o=o||{};const th=o.th==null?DV_FLOOR_T:o.th;
 const pts=[[cx-w/2,cz-d/2],[cx+w/2,cz-d/2],[cx+w/2,cz+d/2],[cx-w/2,cz+d/2]];
 svNoWalk(()=>box(mk||'floor',cx,y-th,cz,w,th,d,col==null?P('floor'):col));
 if(o.walk!==false)svFloor(pts,y);
 return pts;
}

function dvExtStair(x,z,y0,y1,yaw,w,run){
 if(y1-y0<.08)return;
 dvNoCut(()=>svStair(x,z,y0,y1,yaw,{style:'solid',w:w==null?1.18:w,mk:'flagstone',col:P('flagstone'),run:run==null?Math.max(.85,(y1-y0)*1.35):run}));
}

/* ---------------------------------------------------------------- 3. Sawn Emerald-Green Nephrite Cross-Medallion & Skarn Tympanum (DV2)
   Placed on outer wall face (x, y, z) with outward yaw; stepped strictly +6..+75 mm proud of wall so zero coplanar faces. */
function dvJadeCross(x,y,z,yaw,s,o){
 o=o||{};const sc=s==null?1:s,sk=P('skarn'),jd=P('jadeBright'),bz=P('gold');
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   box('skarn',0,-0.46*sc,.017,.58*sc,.92*sc,.022,sk);
   box('jade',0,-.42*sc,.043,.12*sc,.84*sc,.022,jd);
   box('jade',-.188*sc,-.32*sc,.043,.24*sc,.11*sc,.022,jd);
   box('jade',.188*sc,-.32*sc,.043,.24*sc,.11*sc,.022,jd);
   for(const sx of [-.332,.332])box('jade',sx*sc,-.32*sc,.043,.038*sc,.17*sc,.022,jd);
   box('jade',0,.024*sc,.043,.17*sc,.038*sc,.022,jd);
   box('jade',0,-.864*sc,.043,.19*sc,.042*sc,.022,jd);
   sph('gold',0,-.32*sc,.065,.046*sc,bz,1,8);
  });
 });
}

function dvArchBand(mk,rx0,ry0,rx1,ry1,z0,z1,segs,col){
 const n=segs==null?12:segs,pos=[],nor=[],idx=[];
 const pt=(rx,ry,i,z)=>{const a=PI*(1-i/n);return [Math.cos(a)*rx,Math.sin(a)*ry+.008,z];};
 for(const [zz,nz] of [[z1,1],[z0,-1]]){
  for(let i=0;i<n;i++){
   const p0=pt(rx0,ry0,i,zz),p1=pt(rx0,ry0,i+1,zz),p2=pt(rx1,ry1,i+1,zz),p3=pt(rx1,ry1,i,zz);
   const s=pos.length/3;pos.push(...p0,...p1,...p2,...p3);
   for(let k=0;k<4;k++)nor.push(0,0,nz);
   if(nz>0)idx.push(s,s+1,s+2,s,s+2,s+3);else idx.push(s,s+2,s+1,s,s+3,s+2);
  }
 }
 for(const [rx,ry,sg] of [[rx1,ry1,1],[rx0,ry0,-1]]){
  for(let i=0;i<n;i++){
   const aMid=PI*(1-(i+.5)/n),nx=Math.cos(aMid)*sg,ny=Math.sin(aMid)*sg,L=Math.hypot(nx,ny)||1;
   const b0=pt(rx,ry,i,z0),b1=pt(rx,ry,i+1,z0),f1=pt(rx,ry,i+1,z1),f0=pt(rx,ry,i,z1);
   const s=pos.length/3;pos.push(...b0,...b1,...f1,...f0);
   for(let k=0;k<4;k++)nor.push(nx/L,ny/L,0);
   idx.push(s,s+1,s+2,s,s+2,s+3);
  }
 }
 for(const ii of [0,n]){
  const q0=pt(rx0,ry0,ii,z0),q1=pt(rx1,ry1,ii,z0),q2=pt(rx1,ry1,ii,z1),q3=pt(rx0,ry0,ii,z1);
  const s=pos.length/3;pos.push(...q0,...q1,...q2,...q3);
  for(let k=0;k<4;k++)nor.push(0,-1,0);
  idx.push(s,s+1,s+2,s,s+2,s+3);
 }
 emit(mk,fixWind(mkGeo(pos,nor,null,idx)),null,col);
}

function dvSkarnArch(x,yTop,z,yaw,wOpen,o){
 o=o||{};const w=wOpen==null?1.1:wOpen,archH=o.h==null?Math.min(.52,w*.38):o.h;
 const sk=P('skarn'),tf=P('tuffCrimson'),jd=P('jadeBright');
 W(x,yTop,z,yaw||0,()=>{
  svNoWalk(()=>{
   dvArchBand('skarn',w*.04,archH*.08,w*.5,archH,.005,.026,10,sk);
   dvArchBand('tuffPolished',w*.525,(archH+.04)*1.01,w*.605,(archH+.04)*1.16,.005,.052,12,tf);
   box('jade',0,archH*1.08+.03,.076,.11,.13,.022,jd);
  });
 });
}

/* ---------------------------------------------------------------- 4. Polychrome Horizontal Ablaq Wall Panel & Box (DV2) */
const DV_WKM=new THREE.Matrix4(),DV_WKS=new THREE.Matrix4();
function dvWallBlock(lx,ly,lz,w,h,d){
 if(PLACE_DRY||typeof WKOFF!=='undefined'&&WKOFF||typeof KWALK==='undefined'||typeof KWALKBOX==='undefined'||!CURREC||CURREC.cls!=='building'||h<.72)return;
 DV_WKS.makeScale(w,h,d).setPosition(lx,ly+h/2,lz);
 DV_WKM.copy(CM).multiply(DV_WKS);
 KWALKBOX.add(KWALK,DV_WKM.elements,{tag:'wall:'+CURKEY});
}
function dvAblaqSlice(x0,x1,y0,y1,wt,tuffCol,basCol,courseH){
 const w=x1-x0,h=y1-y0;if(w<.02||h<.02)return;
 const ch=courseH==null?.54:courseH,n=Math.max(1,Math.round(h/ch)),dy=h/n,xm=(x0+x1)/2;
 svNoWalk(()=>{
  for(let i=0;i<n;i++){
   const ya=y0+dy*i+.002,yb=y0+dy*(i+1)-.002;
   if(yb-ya<.012)continue;
   const isBas=(i%3===1);
   box(isBas?'basalt':'tuff',xm,ya,0,w,yb-ya,wt,isBas?basCol:tuffCol);
  }
 });
 dvWallBlock(xm,y0,0,w,h,wt);
}

function dvWallPanel(cx,y0,cz,yaw,len,h,wt,opens,o){
 o=o||{};const th=wt==null?DV_WALL_T:wt,tuffCol=o.tuffCol==null?P('tuff'):o.tuffCol,basCol=o.basCol==null?P('basalt'):o.basCol;
 const ch=o.courseH==null?.54:o.courseH,leafCol=o.leafCol==null?P('cypress'):o.leafCol;
 const list=(opens||[]).map(q=>{
  const qw=q.w==null?.96:q.w,qx=q.x==null?0:q.x;
  return Object.assign({},q,{x0:Math.max(-len/2+.12,qx-qw/2),x1:Math.min(len/2-.12,qx+qw/2)});
 }).filter(q=>q.x1-q.x0>.12).sort((a,b)=>a.x0-b.x0);

 W(cx,0,cz,yaw||0,()=>{
  let cur=-len/2;
  const yBot=y0+.005,yTop=y0+h-.005;
  for(const q of list){
   if(q.x0>cur+.015)dvAblaqSlice(cur,q.x0,yBot,yTop,th,tuffCol,basCol,ch);
   const sy=q.door?(q.y==null?0:q.y):(q.y==null?.92:q.y);
   const qh=Math.min(h-sy-.22,q.h==null?(q.door?2.12:1.14):q.h);
   if(sy>.025)dvAblaqSlice(q.x0,q.x1,yBot,y0+sy-.003,th,tuffCol,basCol,ch);
   if(sy+qh<h-.025)dvAblaqSlice(q.x0,q.x1,y0+sy+qh+.003,yTop,th,tuffCol,basCol,ch);
   cur=Math.max(cur,q.x1);

   const qm=(q.x0+q.x1)/2,qw=q.x1-q.x0;
   if(q.arch!==false&&y0+sy+qh+.42<y0+h){
    dvSkarnArch(qm,y0+sy+qh,th/2,0,qw,{h:Math.min(.44,h-(sy+qh)-.08)});
   }
   if(!q.door&&sy>.12){
    svNoWalk(()=>box('skarn',qm,y0+sy-.065,th/2+.028,qw+.14,.058,.048,P('skarn')));
   }
   if(q.door){
    door(qm,y0+sy,th/2,0,qw,qh);
    if(!q.open&&q.leaf!==false){
     svLeaf(qm,y0+sy+.006,0,0,qw*.92,qh-.036,{mk:o.leafMk||'cypress',col:leafCol,t:.055,style:'plank',hwCol:0xb88a44,name:q.name||'door'});
    }
   }else{
    windowAt(qm,y0+sy,th/2,0,qw,qh,sy);
    if(q.pane!==false){
     svPane(qm,y0+sy+.01,0,0,qw*.9,qh-.02,{kind:q.pane||'lit',t:.025});
    }
   }
  }
  if(len/2>cur+.015)dvAblaqSlice(cur,len/2,yBot,yTop,th,tuffCol,basCol,ch);
 });
}

function dvAblaqBox(cx,cz,w,d,y0,h,o){
 o=o||{};const wt=o.wt==null?DV_WALL_T:o.wt,tuffCol=o.tuffCol==null?P('tuff'):o.tuffCol,basCol=o.basCol==null?P('basalt'):o.basCol;
 const sideLen=Math.max(.3,d-wt*2-.012),panelOpt={tuffCol,basCol,courseH:o.courseH,leafCol:o.leafCol};
 dvWallPanel(cx,y0,cz+d/2-wt/2,0,w,h,wt,o.front||[],panelOpt);
 dvWallPanel(cx,y0,cz-d/2+wt/2,PI,w,h,wt,o.back||[],panelOpt);
 dvWallPanel(cx+w/2-wt/2,y0,cz,PI/2,sideLen,h,wt,o.right||[],panelOpt);
 dvWallPanel(cx-w/2+wt/2,y0,cz,-PI/2,sideLen,h,wt,o.left||[],panelOpt);

 if(o.frieze!==false&&h>=2.4){
  const fy=y0+h-.23,fh=.17,fw=.028,fmk=o.friezeMk||'carve',fcol=P('carve');
  svNoWalk(()=>{
   box(fmk,cx,fy,cz+d/2+fw/2+.006,w+fw*2,fh,fw,fcol);
   box(fmk,cx,fy,cz-d/2-fw/2-.006,w+fw*2,fh,fw,fcol);
   box(fmk,cx+w/2+fw/2+.006,fy,cz,fw,fh,d-.012,fcol);
   box(fmk,cx-w/2-fw/2-.006,fy,cz,fw,fh,d-.012,fcol);
  });
 }
}

/* ---------------------------------------------------------------- 5. Dagestani Walkable Slate & Cypress Roof-Plaza Terrace (DV4) */
function dvRoofTerrace(cx,cz,w,d,y,o){
 o=o||{};const th=.13,slCol=P('slate'),cyCol=P('cypress'),bsCol=P('basalt');
 dvFloorRect(cx,cz,w,d,y,'slate',slCol,{th,walk:o.walk!==false});
 if(o.walk!==false&&y>1.5&&o.noLadder!==true){
  const fy=o.footY==null?.22:o.footY,lx=Math.max(.5,w/2-.95),lz=Math.max(.5,d/2-.95);
  wkLadder(cx-lx,fy,cz+lz,cx-lx,y,cz+lz);
  wkLadder(cx+lx,fy,cz+lz,cx+lx,y,cz+lz);
  wkLadder(cx,fy,cz+Math.max(.35,d/2-.62),cx,y,cz+Math.max(.35,d/2-.62));
 }
 const nBeams=Math.max(3,Math.round(w/1.2));
 svNoWalk(()=>{
  for(let i=0;i<nBeams;i++){
   const bx=cx+lerp(-w/2+.42,w/2-.42,i/(nBeams-1));
   if(!o.openFront)box('cypress',bx,y-th-.092,cz+d/2+.1,.11,.085,.18,cyCol);
   if(!o.openBack)box('cypress',bx,y-th-.092,cz-d/2-.1,.11,.085,.18,cyCol);
  }
 });
 if(o.parapet===false)return;
 const rh=o.railH==null?.82:o.railH;
 dvNoCut(()=>svNoWalk(()=>{
  for(const sx of [-1,1])for(const sz of [-1,1]){
   box('basalt',cx+sx*(w/2-.12),y+.005,cz+sz*(d/2-.12),.22,rh+.06,.22,bsCol);
  }
  const railBar=(x0,z0,x1,z1)=>{
   const L=Math.hypot(x1-x0,z1-z0);if(L<.45)return;
   beam('cypress',[x0,y+rh,z0],[x1,y+rh,z1],.065,cyCol);
   beam('cypress',[x0,y+rh*.48,z0],[x1,y+rh*.48,z1],.048,cyCol);
   const np=Math.max(1,Math.floor(L/1.35));
   for(let k=1;k<=np;k++){
    const u=k/(np+1);
    box('cypress',lerp(x0,x1,u),y+.006,lerp(z0,z1,u),.06,rh-.04,.06,cyCol);
   }
  };
  if(!o.openFront){
   if(o.gapFront!=null){
    const gx=cx+o.gapFront,gw=(o.gapW==null?1.35:o.gapW)/2;
    railBar(cx-w/2+.26,cz+d/2-.12,gx-gw,cz+d/2-.12);
    railBar(gx+gw,cz+d/2-.12,cx+w/2-.26,cz+d/2-.12);
   }else railBar(cx-w/2+.26,cz+d/2-.12,cx+w/2-.26,cz+d/2-.12);
  }
  if(!o.openBack)railBar(cx-w/2+.26,cz-d/2+.12,cx+w/2-.26,cz-d/2+.12);
  if(!o.openRight)railBar(cx+w/2-.12,cz-d/2+.26,cx+w/2-.12,cz+d/2-.26);
  if(!o.openLeft)railBar(cx-w/2+.12,cz-d/2+.26,cx-w/2+.12,cz+d/2-.26);
 }));
}

/* ---------------------------------------------------------------- 6. Caucasian Mashikul Box & Aerial Gorge Ropeway Pulley-Rig (DV4) */
function dvMashikul(x,y,z,yaw,w){
 const mw=w==null?.92:w,tf=P('tuff'),bs=P('basalt');
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   for(const sx of [-mw*.36,0,mw*.36]){
    box('basalt',sx,-.34,.15,.12,.16,.28,bs);
    box('basalt',sx,-.175,.22,.13,.16,.42,bs);
   }
   box('tuff',0,0,.38,mw,.78,.28,tf);
   box('basalt',0,.786,.39,mw+.06,.08,.32,bs);
  });
 });
}

function dvPulleyRig(x,y,z,yaw,reach,drop,o){
 o=o||{};const rch=reach==null?1.45:reach,dr=drop==null?2.4:drop;
 const cy=P('cypress'),bz=P('bronze'),rp=P('rope'),pk=P('planks'),ir=P('iron');
 dvNoCut(()=>W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   box('cypress',0,0,rch/2+.02,.15,.15,rch,cy);
   beam('cypress',[0,-.72,.08],[0,-.02,rch*.68],.1,cy);
   cyl('bronze',0,-.1,rch-.14,.14,.07,bz,10);
   cyl('rope',0,-.1-dr,rch-.14,.02,dr,rp,6);
   /* upright positive-height wicker frustum basket (rBot = 0.24 -> rTop = 0.38, det > 0!) */
   const by=-.1-dr-.52,bz0=rch-.14;
   dvAuditShell('basket',0,by+.26,bz0,()=>cyl('planks',0,by,bz0,.24,.52,pk,10,.38));
   ring('iron',0,by+.47,bz0,.39,.026,ir,0,0,0,12);
   box('cypress',0,by-.065,bz0,.52,.055,.52,cy);
  });
  if(o.cableTo){
   sagRope('rope',[0,.08,rch-.08],o.cableTo,.22,.024,rp,7);
  }
 }));
}
