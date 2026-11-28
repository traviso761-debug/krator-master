// prefix: tk
// ================================================================= TIMPAR-KURAN ARCHITECTURAL TOOLKIT (PLAN.md §3)
// Synthesizes Jomon/Ainu mountain-forest roots with Pacific-Northwest / Tlingit monumental red-cypress carpentry:
//   - Semi-sunken Jomon timber-crib & megabreccia pit-bases, stepped Ainu bark/reed cise thatch, cord-marked kaen-doki
//     flame-ware smoke-hole crowns, cobble irori hearths, rat-baffled pu stilt caches, shaved-willow inau & nusa skull-fences.
//   - Post-and-beam split red-cypress Tlingit plank walls, megabreccia cobble-weighted plank roofs, stepped interior daak
//     clan platforms, heavy log-crib chasi-noow palisades, salvaged Kanopi arcology canopy-ribs, wide-eyed wooden beast
//     war-visors, and captured closed-eyed Eternian bronze/stone war-loot heads (reading kits/eternian/src/42-et-head.js).
// Every top-level name starts with `tk`, non-walkable trim is wrapped in svNoWalk(), and every relief layer steps by >= 1.5 cm.

const TK_WKM=new THREE.Matrix4(),TK_WKS=new THREE.Matrix4(),TK_SV=new THREE.Vector3();

function tkTarget(x,y,z,name){
 if(PLACE_DRY||!CURREC)return;
 const p=new THREE.Vector3(x,y,z).applyMatrix4(CM);
 (CURREC.targets||(CURREC.targets=[])).push({x:p.x,y:p.y,z:p.z,name:name||'floor'});
}

function tkFurnList(list){
 for(const e of list)FURNISH(e[0],e[1],e[2]+.006,e[3],e[4]==null?0:e[4],e[5]);
}

function tkSeedAt(x,y,z,salt){
 TK_SV.set(x,y,z).applyMatrix4(CM);
 return KRAND.hash(0x7c11^(salt|0),Math.round(TK_SV.x*20),Math.round(TK_SV.y*20),Math.round(TK_SV.z*20));
}

function tkCrestOf(seedOrKey){
 if(typeof seedOrKey==='string'&&TK_CRESTS[seedOrKey])return TK_CRESTS[seedOrKey];
 const idx=((seedOrKey>>>0)%TK_CREST_KEYS.length+TK_CREST_KEYS.length)%TK_CREST_KEYS.length;
 return TK_CRESTS[TK_CREST_KEYS[idx]];
}

/* Emits raw {pos, uv} triangle list from 42-et-head.js with flat normals and full 3-axis rotation (rx=PI inverts loot heads!). */
function tkEmitGeo(mk,G,x,y,z,s,ry,col,rx,rz){
 const n=G.pos.length/3,nor=new Array(G.pos.length),idx=new Array(n);
 for(let i=0;i<n;i+=3){
  const a=i*3,ax=G.pos[a],ay=G.pos[a+1],az=G.pos[a+2];
  const ux=G.pos[a+3]-ax,uy=G.pos[a+4]-ay,uz=G.pos[a+5]-az,vx=G.pos[a+6]-ax,vy=G.pos[a+7]-ay,vz=G.pos[a+8]-az;
  let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;
  const l=Math.hypot(nx,ny,nz)==0?1:Math.hypot(nx,ny,nz);nx/=l;ny/=l;nz/=l;
  for(let k=0;k<3;k++){nor[a+k*3]=nx;nor[a+k*3+1]=ny;nor[a+k*3+2]=nz;idx[i+k]=i+k;}
 }
 const S=typeof s==='number'?[s,s,s]:s,m=TF(x,y,z,ry||0,rx||0,rz||0);
 m.scale(new THREE.Vector3(S[0],S[1],S[2]));
 emit(mk,mkGeo(G.pos.slice(),nor,G.uv.slice(),idx),m,col);
}

/* Stepped megabreccia & split-cypress plinth with walkable entrance steps on +z (or custom yaw/offset). */
function tkPlinth(w,d,h,o){
 o=o||{};
 const h1=Math.min(.22,h*.48),h2=Math.max(.08,h-h1-.08),h3=h-h1-h2;
 const baseMk=o.baseMk||'megabreccia',midMk=o.midMk||'cobble',topMk=o.topMk||'cedar';
 svNoWalk(()=>{
  box(baseMk,0,0,0,w+.44,h1,d+.44,hc(SVPAL[baseMk][0]));
  box(midMk,0,h1,0,w+.2,h2,d+.2,hc(SVPAL[midMk][0]));
  box(topMk,0,h1+h2,0,w,h3,d,hc(SVPAL[topMk][0]));
 });
 wkPad(0,0,w,d,h);
 if(o.steps!==false&&h>.08){
  const sw=o.stepW==null?2.2:o.stepW,sx=o.stepX==null?0:o.stepX,run=o.stepRun==null?Math.max(.76,h*1.9):o.stepRun;
  const zFoot=d/2+.22+run,zTop=d/2+.22,ns=Math.max(2,Math.ceil(h/TK.RISER));
  svNoWalk(()=>{
   for(let i=0;i<ns;i++){
    const za=lerp(zFoot,zTop,i/ns),zb=lerp(zFoot,zTop,(i+1)/ns),yl=h*i/ns,yh=h*(i+1)/ns;
    box('cypress',sx,yl,(za+zb)/2,sw,yh-yl,Math.abs(za-zb),hc(SVPAL.cypressD[0]));
   }
   for(const s of [-1,1])box('megabreccia',sx+s*(sw/2+.12),0,(zFoot+zTop)/2,.18,h+.12,run+.08,hc(SVPAL.megabreccia[1]));
  });
  svStripWalk([sx,0,zFoot],[sx,h,zTop-.26],sw);
 }
 return h;
}

/* Semi-sunken Jomon pit-house base: battered turf & megabreccia earth-kerb embankment (rising to rimH = 0.84 m) enclosing
   a sunken packed-earth & cedar-crib floor at yFloor = 0.12 m, with walkable exterior & interior stone/log steps through +z gap! */
function tkPitBase(w,d,o){
 o=o||{};
 const yFloor=o.yFloor==null?.12:o.yFloor,rimH=o.rimH==null?.84:o.rimH,kerbT=o.kerbT==null?.86:o.kerbT;
 const doorW=o.doorW==null?1.45:o.doorW,inW=w-2*kerbT,inD=d-2*kerbT;
 svNoWalk(()=>{
  /* Sunken floor slab */
  box('earth',0,0,0,w+.3,.06,d+.3,hc(SVPAL.earth[0]));
  box('cedar',0,.06,0,inW+.16,yFloor-.06,inD+.16,hc(SVPAL.cedarD[0]));
  /* Four megabreccia & mossy-turf kerb walls, leaving doorway gap on +z */
  box('megabreccia',0,.06,-d/2+kerbT/2,w,rimH-.06,kerbT,hc(SVPAL.megabreccia[0]));
  box('turf',0,rimH,-d/2+kerbT/2,w-.16,.12,kerbT-.14,hc(SVPAL.turf[0]));
  for(const sx of [-1,1]){
   box('megabreccia',sx*(w/2-kerbT/2),.06,0,kerbT,rimH-.06,d-2*kerbT-.04,hc(SVPAL.megabreccia[1]));
   box('turf',sx*(w/2-kerbT/2),rimH,0,kerbT-.14,.12,d-2*kerbT-.16,hc(SVPAL.turf[1]));
   const segW=(w-doorW)/2-.04,cx=sx*(doorW/2+segW/2+.02);
   box('megabreccia',cx,.06,d/2-kerbT/2,segW,rimH-.06,kerbT,hc(SVPAL.megabreccia[0]));
   box('turf',cx,rimH,d/2-kerbT/2,segW-.12,.12,kerbT-.14,hc(SVPAL.turf[0]));
  }
  /* Interior split-cypress retaining crib liner inside pit */
  box('tarwood',0,yFloor,-inD/2+.08,inW-.08,rimH-yFloor-.08,.12,hc(SVPAL.tarwood[0]));
  for(const sx of [-1,1])box('tarwood',sx*(inW/2-.08),yFloor,0,.12,rimH-yFloor-.08,inD-.28,hc(SVPAL.tarwood[0]));
  /* Threshold stone sill at y = 0.36 m with steps up from outside (+z) and down into pit (-z) */
  box('cobble',0,0,d/2-kerbT/2,doorW-.04,.36,kerbT+.24,hc(SVPAL.cobble[0]));
  box('cypress',0,0,d/2+.36,doorW,.18,.38,hc(SVPAL.cypressD[0]));
  box('cypress',0,yFloor,d/2-kerbT-.24,doorW-.08,(.36-yFloor)*.55,.36,hc(SVPAL.cypress[0]));
 });
 /* Walk walls along the 4 embankment sides (leaving the +z doorway clear) + walkable floor & threshold strips */
 const wt=.36;
 box('tarwood',0,yFloor,-d/2+kerbT/2,w-.2,.82,wt,hc(SVPAL.tarwood[0]));
 for(const sx of [-1,1]){
  box('tarwood',sx*(w/2-kerbT/2),yFloor,0,wt,.82,d-2*kerbT-.2,hc(SVPAL.tarwood[0]));
  const segW=(w-doorW)/2-.12,cx=sx*(doorW/2+segW/2+.06);
  box('tarwood',cx,yFloor,d/2-kerbT/2,segW,.82,wt,hc(SVPAL.tarwood[0]));
 }
 wkPad(0,0,inW,inD,yFloor);
 wkPad(0,d/2-kerbT/2,doorW,.9,.36);
 svStripWalk([0,0,d/2+.65],[0,.36,d/2-.08],doorW-.1);
 svStripWalk([0,.36,d/2-kerbT+.08],[0,yFloor,d/2-kerbT-.55],doorW-.1);
 return {yFloor,rimH,inW,inD,doorZ:d/2-kerbT/2,doorY:.36};
}

/* Sculptural cord-marked Jomon kaen-doki flame-ware ceramic smoke-hole crown + optional live smoke plume. */
function tkKaenCrown(x,y,z,r,h,flames,o){
 o=o||{};
 const nf=flames==null?4:flames,cMain=hc(SVPAL.kaen[0]),cSoot=hc(SVPAL.kaenSoot[0]);
 svNoWalk(()=>{
  const r0=tkRigMath.kaenCrownR(r,0),rMid=tkRigMath.kaenCrownR(r,.45),rTop=tkRigMath.kaenCrownR(r,1);
  cyl('kaen',x,y,z,r0,h*.48,cSoot,12,rMid);
  cyl('kaen',x,y+h*.48,z,rMid,h*.42,cMain,12,rTop);
  ring('kaen',x,y+h*.9,z,rTop*.96,r*.14,cMain,0,0,0,14);
  for(let i=0;i<nf;i++){
   const a=i*TAU/nf+(o.rot||0),px=x+Math.cos(a)*rTop*.92,pz=z+Math.sin(a)*rTop*.92;
   W(px,y+h*.88,pz,-a,()=>{
    box('kaen',0,0,0,r*.24,h*.44,r*.34,cMain);
    ring('kaen',0,h*.36,0,r*.18,r*.065,cSoot,PI/2,PI/2,0,10);
   });
  }
 });
 if(o.smoke!==false)smokeAt(x,y+h*1.18,z,{r:r*.75,kind:'fire'});
}

/* Shaved pale-willow inau spirit-wand cluster (stems + wind-rigged SV_CLOTH 'inau' curl cones). */
function tkInauCluster(x,y,z,yaw,h,n){
 const cnt=n==null?3:n;
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   for(let i=0;i<cnt;i++){
    const ox=(i-(cnt-1)/2)*.14,lean=(i-(cnt-1)/2)*.07,wh=h*(1-.06*Math.abs(i-(cnt-1)/2));
    WX(ox,0,0,0,0,-lean,()=>{
     cyl('cypress',0,0,0,.018,wh,hc(SVPAL.cypressPale[0]),6);
     withCloth((p,out)=>{
      const wgt=tkRigMath.inauPin(clamp((wh*.92-p.y)/(wh*.45),0,1));
      out.set(wgt*.07,0,wgt*.09);
     },()=>{
      cone('inau',0,wh*.56,0,.075,wh*.26,hc(SVPAL.inau[0]),8);
      cone('inau',0,wh*.74,0,.06,wh*.22,hc(SVPAL.inau[1]),8);
     });
    });
   }
  });
 });
}

/* Curved or straight Ainu nusa sacred skull-and-inau fence (shaved-willow curls + weathered bear & eagle skulls). */
function tkNusaFence(x,y,z,yaw,len,posts,o){
 o=o||{};
 const np=Math.max(3,posts||5),h=o.h==null?2.05:o.h,curve=o.curve==null?.35:o.curve;
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   const pts=[];
   for(let i=0;i<np;i++){
    const u=i/(np-1)-.5,px=u*len,pz=-Math.cos(u*PI)*curve;
    pts.push([px,pz]);
    cyl('silverwood',px,0,pz,.075,h,hc(SVPAL.silverwood[0]),8);
    tkInauCluster(px,h*.42,pz+.09,0,h*.52,2);
    /* Alternate bear & storm-eagle skulls crowning the nusa posts */
    if(i%2===0){
     box('bone',px,h,pz+.02,.24,.17,.3,hc(SVPAL.bone[0]));
     box('bone',px,h+.01,pz+.2,.14,.09,.12,hc(SVPAL.bone[1]));
    }else{
     box('bone',px,h,pz+.02,.18,.15,.22,hc(SVPAL.bone[1]));
     cone('antler',px,h+.03,pz+.18,.055,.14,hc(SVPAL.antler[0]),6);
    }
   }
   for(let i=0;i<pts.length-1;i++){
    beam('cedar',[pts[i][0],h*.58,pts[i][1]],[pts[i+1][0],h*.58,pts[i+1][1]],.065,hc(SVPAL.cedarD[0]));
    beam('cedar',[pts[i][0],h*.84,pts[i][1]],[pts[i+1][0],h*.84,pts[i+1][1]],.065,hc(SVPAL.cedarD[0]));
   }
  });
 });
}

/* Fierce OPEN-EYED Tlingit carved wooden beast war-visor / crest mask (records onto CURREC.visors for trophyContrastAudit!). */
function tkWarVisor(x,y,z,yaw,s,o){
 o=o||{};
 const cr=tkCrestOf(o.crest||tkSeedAt(x,y,z,31));
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   /* Carved red-cypress mask shell */
   box('cypress',0,-s*.46,0,s*.94,s*.92,s*.24,hc(SVPAL.cypress[0]));
   /* Primary black brow & jaw stepped +1.8 cm */
   box('formBlack',0,s*.16,s*.138,s*.86,s*.26,.02,hc(cr.primary));
   box('formBlack',0,-s*.32,s*.138,s*.76,s*.2,.02,hc(cr.primary));
   /* Secondary red snout / bared nostrils stepped +3.6 cm */
   box('formRed',0,-s*.08,s*.158,s*.62,s*.22,.018,hc(cr.secondary));
   /* Bared bone teeth row */
   for(let i=-2;i<=2;i++)box('bone',i*s*.11,-s*.24,s*.158,s*.07,s*.08,.018,hc(SVPAL.bone[0]));
   /* Wide-open glaring sclera + gleaming copper iris/pupil stepped +5.4 cm & +7.2 cm */
   for(const sx of [-1,1]){
    box('formTeal',sx*s*.24,s*.16,s*.158,s*.28,s*.16,.018,hc(cr.tertiary));
    box('inau',sx*s*.24,s*.16,s*.176,s*.18,s*.105,.016,hc(SVPAL.formWhite[0]));
    box('copper',sx*s*.24,s*.16,s*.194,s*.085,s*.085,.016,hc(cr.eye));
    /* Crest ears / horns */
    box('formBlack',sx*s*.34,s*.46,0,s*.18,s*.2,s*.16,hc(cr.primary));
   }
  });
  if(CURREC&&!PLACE_DRY)(CURREC.visors=CURREC.visors||[]).push({kind:'tk-visor',crest:cr.key,eyes:'open'});
 });
}

/* Captured CLOSED-EYED Eternian bronze/stone/terracotta ancestor trophy head (from 42-et-head.js), mounted INVERTED or
   slashed with red-ochre / verdigris war-paint (NEVER a reverent Eternian door-mask! Records onto CURREC.trophies). */
function tkLootHead(x,y,z,yaw,h,o){
 o=o||{};
 const mat=o.mk||'bronze',inv=o.inverted!==false,wp=o.warPaint!==false;
 const col=hc(SVPAL[mat]&&SVPAL[mat][0]||SVPAL.bronze[0]);
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   /* Cedar trophy pike or cross-batten */
   if(o.pike!==false)cyl('tarwood',0,-h*.55,-.06,.042,h*1.45,hc(SVPAL.tarwood[0]),7);
   const p=etHeadParams(o.seed==null?tkSeedAt(0,0,0,43):o.seed,{eyes:'closed',headdress:o.headdress||'step',neck:false});
   const G=etHeadGeo(p);
   if(inv){
    tkEmitGeo(mat,G,0,h*.95,.08,[h*.88,h,h*.82],0,col,0,PI);
   }else{
    tkEmitGeo(mat,G,0,0,.08,[h*.88,h,h*.82],0,col,0,0);
   }
   /* Diagonal cinnabar-red & celadonite-teal war-paint defacement bars stepped clear in front of brow/cheeks */
   if(wp){
    box('formRed',0,h*.48,h*.44,h*.62,h*.07,.022,hc(SVPAL.formRed[0]),0,0,.38);
    box('formTeal',0,h*.36,h*.464,h*.52,h*.055,.02,hc(SVPAL.formTeal[0]),0,0,-.34);
   }
  });
  if(CURREC&&!PLACE_DRY){
   (CURREC.trophies=CURREC.trophies||[]).push({kind:'eternian-loot',metal:mat,eyes:'closed',inverted:inv,warPainted:wp});
  }
 });
}

/* Heavy adzed red-cypress doorway with operable KDOOR cedar plank leaf & flanking shaved-willow inau wands. */
function tkDoor(x,y,z,yaw,w,h,o){
 o=o||{};
 const t=o.t==null?TK.WALL:o.t;
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   for(const s of [-1,1]){
    box('cypress',s*(w/2+.11),0,0,.2,h+.04,t+.1,hc(SVPAL.cypressD[0]));
   }
   box('cypress',0,h+.04,0,w+.56,.26,t+.16,hc(SVPAL.cypress[0]));
   if(o.visor){
    tkWarVisor(0,h+.68,t/2+.06,0,.44,{crest:o.crest});
   }
   if(o.inau!==false){
    for(const s of [-1,1])tkInauCluster(s*(w/2+.28),0,t/2+.14,0,1.25,2);
   }
  });
  if(o.open!==true){
   svLeaf(0,.02,0,0,w-.05,h-.04,{
    mk:o.leafMk||'cypress',
    col:o.leafCol==null?hc(SVPAL.cypress[1]):o.leafCol,
    style:o.style||'plank',
    pivot:!!o.pivot,
    hwCol:0xb8683c,locked:!!o.locked,ajar:o.ajar==null?0:o.ajar,name:o.name||null
   });
  }
  door(0,0,t/2,0,w,h);
 });
}

/* Oiled gutskin / horn smoke-pane window or sacred east-facing Ainu rorun-puyar spirit-window hung with inau wands. */
function tkWindow(x,y,z,yaw,w,h,o){
 o=o||{};
 const t=o.t==null?TK.WALL:o.t;
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   box('cypress',0,-.08,0,w+.24,.08,t+.1,hc(SVPAL.cypressD[0]));
   for(const s of [-1,1])box('cypress',s*(w/2+.06),0,0,.1,h,t+.08,hc(SVPAL.cypressD[0]));
   box('cypress',0,h,0,w+.28,.12,t+.12,hc(SVPAL.cypress[0]));
   if(o.spirit){
    tkInauCluster(-w*.28,.04,t/2+.1,0,.62,2);
    tkInauCluster(w*.28,.04,t/2+.1,0,.62,2);
   }
  });
  svPane(0,0,0,0,w-.04,h-.02,{kind:o.lit?'lit':'frosted',solid:!!o.solid,t:.03});
  windowAt(0,0,t/2,0,w,h,y);
 });
}

/* Split red-cypress or bark-clad wall segment from (x0,z0) to (x1,z1) with non-overlapping hole cutouts [{at, y, w, h}]. */
function tkPlankWall(x0,z0,x1,z1,y0,h,o){
 o=o||{};
 const dx=x1-x0,dz=z1-z0,L=Math.hypot(dx,dz);
 if(L<.05||h<.05)return;
 const yaw=Math.atan2(dx,dz),t=o.t==null?TK.WALL:o.t,mk=o.mk||'cypress',col=hc(SVPAL[mk]&&SVPAL[mk][0]||SVPAL.cypress[0]);
 const socH=o.socle==null?.34:o.socle,socMk=o.socleMk||'megabreccia';
 const holes=(o.holes||[]).slice().sort((a,b)=>a.at-b.at);
 W(x0,y0,z0,yaw,()=>{
  /* Group overlapping horizontal spans into columns (just as etWall does) so zero boxes ever overlap */
  const cols=[];
  for(const q of holes){
   const a=Math.max(0,q.at-q.w/2),b=Math.min(L,q.at+q.w/2);
   if(b-a<.02)continue;
   const prev=cols[cols.length-1];
   if(prev&&a<prev.b-.01){prev.b=Math.max(prev.b,b);prev.q.push(q);}
   else cols.push({a,b,q:[q]});
  }
  const seg=(sa,sb,ya,yb)=>{
   if(sb-sa<.02||yb-ya<.02)return;
   const len=sb-sa,mz=(sa+sb)/2;
   if(socH>0&&ya<socH){
    const sh=Math.min(yb,socH)-ya;
    box(socMk,0,ya,mz,t+.06,sh,len,hc(SVPAL[socMk][0]));
    if(yb>socH)box(mk,0,socH,mz,t,yb-socH,len,col);
   }else{
    box(mk,0,ya,mz,t,yb-ya,len,col);
   }
  };
  let cur=0;
  for(const c of cols){
   seg(cur,c.a,0,h);
   const st=c.q.slice().sort((p,r)=>(p.y||0)-(r.y||0));
   let yy=0;
   for(const q of st){
    const qa=Math.max(c.a,q.at-q.w/2),qb=Math.min(c.b,q.at+q.w/2),qy=q.y||0,qTop=Math.min(h,qy+q.h);
    seg(c.a,c.b,yy,qy);
    if(qa>c.a+.02)seg(c.a,qa,qy,qTop);
    if(qb<c.b-.02)seg(qb,c.b,qy,qTop);
    yy=qTop;
   }
   seg(c.a,c.b,yy,h);
   cur=c.b;
  }
  seg(cur,L,0,h);
 });
}

/* Four-wall Tlingit post-and-beam split-cypress house box (w x d from y0 up h) with heavy fluted corner & mid posts.
   o.holes = {s:[...], n:[...], e:[...], w:[...]} measured along each wall from its low coordinate (0..w or 0..d). */
function tkPlankBox(w,d,y0,h,o){
 o=o||{};
 const t=o.t==null?TK.WALL:o.t,pr=o.postR==null?TK.POST_R:o.postR,H=o.holes||{};
 const mapSpan=(arr,span)=>(arr||[]).map(q=>({at:q.at==null?span/2+q.x:q.at,y:q.y||0,w:q.w,h:q.h}));
 /* Front (+z) and back (-z) walls run along x; east (+x) and west (-x) run inset by t */
 tkPlankWall(-w/2,d/2-t/2,w/2,d/2-t/2,y0,h,Object.assign({},o,{holes:mapSpan(H.s,w)}));
 tkPlankWall(-w/2,-d/2+t/2,w/2,-d/2+t/2,y0,h,Object.assign({},o,{holes:mapSpan(H.n,w)}));
 tkPlankWall(w/2-t/2,-d/2+t,w/2-t/2,d/2-t,y0,h,Object.assign({},o,{holes:mapSpan(H.e,d-2*t)}));
 tkPlankWall(-w/2+t/2,-d/2+t,-w/2+t/2,d/2-t,y0,h,Object.assign({},o,{holes:mapSpan(H.w,d-2*t)}));
 /* Fluted adzed red-cypress corner posts & longitudinal taas wall-plates */
 svNoWalk(()=>{
  for(const sx of [-1,1])for(const sz of [-1,1]){
   cyl('totem',sx*(w/2-.04),y0,sz*(d/2-.04),pr,h+.08,hc(SVPAL.totem[0]),12);
  }
  if(w>13){
   for(const sx of [-w*.22,w*.22])for(const sz of [-1,1]){
    if(!(sz>0&&Math.abs(sx)<2.2))cyl('totem',sx,y0,sz*(d/2-.02),pr*.82,h+.06,hc(SVPAL.totem[1]),10);
   }
  }
 });
}

/* Low-pitched (18-24 deg) Tlingit split-cedar plank gable roof weighted with megabreccia cobble poles, optional sliding
   ganook smoke-hole shutter, and sculptural kaen-doki terracotta finials. */
function tkPlankRoof(w,d,yEaves,rise,o){
 o=o||{};
 const ovX=o.ovX==null?.68:o.ovX,ovZ=o.ovZ==null?.76:o.ovZ,rw=w+2*ovX,rd=d+2*ovZ,th=.14;
 const mk=o.mk||'shingle',col=hc(SVPAL[mk]&&SVPAL[mk][0]||SVPAL.shingle[0]);
 svNoWalk(()=>{
  /* Gable-end horizontal plank infill inset 8 cm inside walls & 8 cm below roof underside so zero coplanar faces meet */
  if(o.gables!==false){
   const gw=w-.28,gh=rise-.1,ns=Math.max(3,Math.round(gh/.34));
   for(const sz of [-1,1]){
    const gz=sz*(d/2-.18);
    for(let i=0;i<ns;i++){
     const yA=yEaves+i*(gh/ns),span=gw*(1-(i+.75)/ns);
     if(span>.35)box('cedar',0,yA,gz,span,gh/ns-.01,.16,hc(SVPAL.cedar[0]));
    }
   }
  }
  /* Twin taas ridge purlins & eave beams */
  for(const sx of [-w*.24,w*.24])box('cypress',sx,yEaves+rise*.44,0,.24,.26,rd+.18,hc(SVPAL.cypressD[0]));
  box('cypress',0,yEaves+rise-.22,0,.28,.26,rd+.28,hc(SVPAL.cypress[0]));
  /* Left (-x) and right (+x) pitched split-plank roof planes */
  plane4(mk,[-rw/2,yEaves,-rd/2],[0,yEaves+rise,-rd/2],[-rw/2,yEaves,rd/2],th,col);
  plane4(mk,[0,yEaves+rise,-rd/2],[rw/2,yEaves,-rd/2],[0,yEaves+rise,rd/2],th,col);
  /* Ridge cap beam */
  box('bark',0,yEaves+rise+.08,0,.44,.12,rd+.08,hc(SVPAL.bark[0]));
  /* Gale-weighting hold-down poles & megabreccia river cobbles along slopes */
  if(o.cobbles!==false){
   for(const sx of [-1,1]){
    for(const f of [.36,.72]){
     const px=sx*(rw/2)*f,py=tkRigMath.plankSlopeY(rw,yEaves,rise,px)+.11;
     box('silverwood',px,py,0,.11,.1,rd-.24,hc(SVPAL.silverwood[0]));
     const nc=Math.max(3,Math.floor(rd/2.2));
     for(let i=0;i<nc;i++){
      const pz=-rd/2+.9+i*((rd-1.8)/Math.max(1,nc-1));
      ellip('cobble',px,py+.13,pz,.18,.11,.15,hc(SVPAL.cobble[i%2]),0,8);
     }
    }
   }
  }
  /* Sliding Tlingit ganook smoke-hole hood at centre + kaen-doki flame-ware ridge finials */
  if(o.smokeShutter!==false){
   const sy=yEaves+rise+.2;
   box('cypress',0,sy,0,1.65,.28,1.75,hc(SVPAL.cypressD[0]));
   plane4('cypress',[-.92,sy+.28,-.92],[.92,sy+.48,-.92],[-.92,sy+.28,.92],.07,hc(SVPAL.cypress[0]));
   smokeAt(0,sy+.62,0,{r:.34,kind:'fire'});
  }
  if(o.kaenFinials!==false){
   for(const sz of [-1,1]){
    tkKaenCrown(0,yEaves+rise+.2,sz*(rd/2-.55),.28,.54,4,{smoke:false});
   }
  }
 });
}

/* Stepped horizontal-course Ainu cise reed/bark roof with triangular smoke-vent gables & central kaen-doki crown. */
function tkCiseRoof(w,d,yEaves,rise,o){
 o=o||{};
 const courses=o.courses==null?6:o.courses,ov=.55,rw=w+2*ov,rd=d+2*ov;
 const mk=o.mk||'reed';
 svNoWalk(()=>{
  for(let i=0;i<courses;i++){
   const f0=i/courses,f1=(i+1)/courses;
   const cw=lerp(rw,rw*.24,f0),cd=lerp(rd,rd*.42,f0),ch=(rise/courses)+.03;
   const cy=yEaves+f0*rise;
   box(i===0?'bark':mk,0,cy,0,cw,ch,cd,hc(SVPAL[i===0?'bark':mk][i%2]));
  }
  /* Crossed ridge poles (kera-kangi) & central Jomon kaen-doki smoke-hole collar */
  box('silverwood',0,yEaves+rise+.03,0,.38,.16,rd*.46+.5,hc(SVPAL.silverwood[0]));
  tkKaenCrown(0,yEaves+rise+.19,0,o.crownR==null?.34:o.crownR,o.crownH==null?.64:o.crownH,4,{smoke:o.smoke!==false});
 });
}

/* Central cobble-and-cypress sunken-kerb irori fire-pit with glowing embers & haloAt night light. */
function tkIroriPit(x,y,z,w,d,o){
 o=o||{};
 svNoWalk(()=>{
  box('cobble',x,y+.006,z,w,.14,d,hc(SVPAL.cobble[0]));
  box('earth',x,y+.146,z,w-.34,.04,d-.34,hc(SVPAL.earth[1]));
  box('glow',x,y+.186,z,w*.48,.045,d*.48,0xff6e22);
  for(const a of [-.35,.42])box('tarwood',x,y+.232,z,w*.42,.08,.11,hc(SVPAL.tarwood[0]),a);
 });
 haloAt(x,y+.45,z,0xff8234,true);
}

/* Stepped interior Tlingit daak clan sleeping/seating platforms around a central hearth pit, leaving front (+z) entrance clear
   and connecting every tier with walkable svStair steps so KWALK.reach reaches 100% of upper daak berths! */
function tkDaakTiers(inW,inD,y0,tiers,o){
 o=o||{};
 const n=Math.max(1,tiers||1),stepH=o.stepH==null?.36:o.stepH,benchD=o.benchD==null?1.85:o.benchD;
 const ys=tkRigMath.daakTierHeights(y0,n,stepH);
 for(let k=1;k<=n;k++){
  const yLo=ys[k-1],yHi=ys[k],inset=(k-1)*.95,curW=inW-2*inset,curD=inD-2*inset,bd=Math.max(1.05,benchD-(k-1)*.55);
  /* Back (-z) bench & left/right (-x/+x) side benches */
  box('cedar',0,yLo,-inD/2+inset+bd/2,curW,stepH,bd,hc(SVPAL.cedar[0]));
  const sideLen=curD-bd-.9;
  if(sideLen>1.0){
   for(const sx of [-1,1]){
    box('cedar',sx*(inW/2-inset-bd/2),yLo,bd/2-.45,bd,stepH,sideLen,hc(SVPAL.cedar[1]));
   }
  }
  /* Walkable steps climbing onto the back daak tier */
  svStair(0,-inD/2+inset+bd+.58,yLo,yHi,PI,{w:1.35,run:.56,mk:'cypress',col:hc(SVPAL.cypress[0])});
 }
 return ys;
}

/* Elevated Ainu pu clan granary stilts with wide disc rat-baffles (nezumi-gaeshi) + walkable notched stair to deck! */
function tkPuStilts(w,d,y0,stiltH,o){
 o=o||{};
 const pr=o.postR==null?.18:o.postR,rrad=tkRigMath.ratGuardRadius(pr),nx=w>5.5?3:2;
 svNoWalk(()=>{
  for(let ix=0;ix<nx;ix++){
   const px=nx===2?(ix===0?-w*.38:w*.38):(ix-1)*w*.38;
   for(const sz of [-1,1]){
    const pz=sz*d*.36;
    box('megabreccia',px,y0,pz,pr*2.8,.18,pr*2.8,hc(SVPAL.megabreccia[0]));
    cyl('cypress',px,y0+.18,pz,pr,stiltH-.42,hc(SVPAL.cypress[0]),10);
    /* Wide overhanging cedar disc rat-baffle (nezumi-gaeshi) */
    cyl('totem',px,y0+stiltH-.24,pz,rrad,.09,hc(SVPAL.totem[0]),14);
    cyl('cypress',px,y0+stiltH-.15,pz,pr*1.15,.15,hc(SVPAL.cypressD[0]),10);
   }
  }
 });
 /* Elevated walkable deck slab at y0 + stiltH + walkable access stair on +z */
 const deckY=y0+stiltH+.16;
 box('cedar',0,y0+stiltH,0,w+.3,.16,d+.7,hc(SVPAL.cedar[0]));
 const stRun=Math.max(1.35,stiltH*1.12);
 svStair(o.stairX==null?0:o.stairX,d/2+.35+stRun,y0,deckY,PI,{w:1.05,run:stRun,mk:'cypress',col:hc(SVPAL.cypress[0]),rail:'both'});
 return deckY;
}

/* Salvaged curved titanium-ceramic Ancient Kanopi arcology canopy rib arch (kanopiAlloy + recessed conduit groove). */
function tkKanopiRib(x,y,z,yaw,span,rise,o){
 o=o||{};
 const segs=o.segs==null?12:o.segs,rw=o.w==null?.42:o.w;
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   for(const sx of [-1,1]){
    box('megabreccia',sx*span/2,0,0,.95,.46,.95,hc(SVPAL.megabreccia[0]));
   }
   let prev=null;
   for(let i=0;i<=segs;i++){
    const u=i/segs,ang=PI*(1-u),px=Math.cos(ang)*(span/2),py=.42+Math.sin(ang)*rise;
    const cur=[px,py,0];
    if(prev){
     beam('kanopiAlloy',prev,cur,rw,hc(SVPAL.kanopiAlloy[0]),false,8,rw*1.25);
     const mid=[(prev[0]+cur[0])/2,(prev[1]+cur[1])/2+.02,(rw*1.25)/2+.022];
     box('verdigris',mid[0],mid[1]-.04,mid[2],.14,.08,.024,hc(SVPAL.verdigris[0]));
    }
    prev=cur;
   }
  });
 });
}

/* Double-notched red-cypress chasi-noow log-crib palisade wall segment (with optional interior fighting catwalk). */
function tkLogCribWall(x0,z0,x1,z1,y0,h,o){
 o=o||{};
 const dx=x1-x0,dz=z1-z0,L=Math.hypot(dx,dz);
 if(L<.2)return;
 const yaw=Math.atan2(dx,dz),t=o.t==null?.52:o.t,courses=Math.max(4,Math.round(h/.32));
 W(x0,y0,z0,yaw,()=>{
  svNoWalk(()=>{
   box('megabreccia',0,0,L/2,t+.24,.44,L+.16,hc(SVPAL.megabreccia[0]));
   const ch=(h-.44)/courses;
   for(let i=0;i<courses;i++){
    box(i%2===0?'cypress':'cedar',0,.44+i*ch,L/2,t-(i%2)*.03,ch-.008,L+.24,hc(SVPAL[i%2===0?'cypress':'cedar'][0]));
   }
   /* Castellated log-breastwork merlons along top */
   if(o.merlons!==false){
    const nm=Math.max(2,Math.floor(L/1.5));
    for(let i=0;i<nm;i++){
     const mz=(i+.5)*(L/nm);
     box('cypress',0,h,mz,t+.06,.48,(L/nm)*.56,hc(SVPAL.cypressD[0]));
    }
   }
  });
  /* Solid walk-blocker along palisade core */
  box('tarwood',0,0,L/2,.32,Math.min(2.2,h),L-.1,hc(SVPAL.tarwood[0]));
 });
}

/* Wind-rigged Chilkat crest blanket or elm-bark attus hanging pinned along cedar crossbar at top (exact 0 pin drift!). */
function tkWindBanner(x,y,z,yaw,w,h,o){
 o=o||{};
 const mk=o.mk||'chilkat',col=hc(o.col||SVPAL[mk][0]),nx=8,ny=10;
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   for(const sx of [-1,1])cyl('cypress',sx*(w/2+.08),0,0,.055,h+.32,hc(SVPAL.cypressD[0]),8);
   box('cypress',0,h+.24,0,w+.32,.09,.1,hc(SVPAL.cypress[0]));
   const pos=[],nor=[],uv=[],idx=[];
   for(let j=0;j<=ny;j++){
    const v=j/ny,py=h+.24-v*h;
    for(let i=0;i<=nx;i++){
     const u=i/nx,px=(u-.5)*w;
     pos.push(px,py,.065);nor.push(0,0,1);uv.push(u*w,v*h);
    }
   }
   for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){
    const a=j*(nx+1)+i,b=a+1,c=a+nx+1,d=c+1;
    idx.push(a,c,b,b,c,d);
   }
   withCloth((p,out)=>{
    const v=clamp((h+.24-p.y)/Math.max(.2,h),0,1),wgt=tkRigMath.hangPin(v);
    out.set(wgt*.12,0,wgt*.22);
   },()=>emit(mk,mkGeo(pos,nor,uv,idx),null,col));
  });
 });
}

/* Wind-rigged smoked-salmon, hide or inau-curl span line pinned at both ends u=0 and u=1 (exact 0 pin drift!). */
function tkDryingLine(x0,z0,x1,z1,y,o){
 o=o||{};
 const dx=x1-x0,dz=z1-z0,L=Math.hypot(dx,dz);
 if(L<.3)return;
 const yaw=Math.atan2(dx,dz),mk=o.mk||'hide',sag=o.sag==null?.24:o.sag,segs=12;
 W(x0,y,z0,yaw,()=>{
  svNoWalk(()=>{
   const pos=[],nor=[],uv=[],idx=[],bandH=.28;
   for(let i=0;i<=segs;i++){
    const u=i/segs,pz=u*L,py=-Math.sin(PI*u)*sag;
    pos.push(0,py,pz,0,py-bandH*(0.4+0.6*Math.sin(PI*u)),pz);
    nor.push(1,0,0,1,0,0);
    uv.push(u*L,0,u*L,bandH);
   }
   for(let i=0;i<segs;i++){
    const a=i*2,b=a+1,c=a+2,d=a+3;
    idx.push(a,b,c,c,b,d);
   }
   withCloth((p,out)=>{
    const u=clamp(p.z/L,0,1),wgt=tkRigMath.spanPin(u);
    out.set(wgt*.18,wgt*.04,0);
   },()=>emit(mk,mkGeo(pos,nor,uv,idx),null,hc(o.col||SVPAL.salmon[0])));
  });
 });
}
