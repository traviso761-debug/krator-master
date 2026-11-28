// prefix: ds
// ================================================================= DASRI YEMENI ORNAMENT: juss bands, qamariya fanlights, mashrabiya, shurfat & domes ([draw])
// Signature Yemeni motifs for Jabal urban architecture and restrained limewash variants for Dasri villages:
//   dsJussBand / dsJussRing   3D white gypsum (qadad/stucco) chevron, diamond, and dentil relief friezes
//   dsVertBand                vertical gypsum diamond/pilaster divider strips framing facade bays
//   dsQamariyaWin             arched stained-glass qamariya fanlight over wood-shuttered casement window
//   dsVilWin                  restrained village window with timber shutters and whitewash lintel eyebrow
//   dsMashrabiya              corbelled carved-cedar latticework cooling box / oriel
//   dsParapet                 pierced brick+gypsum parapet with horned shurfat pinnacles (urban) or mudbrick+lime coping (village)
//   dsMafraj                  rooftop belvedere reception pavilion with triple qamariya ribbon windows & majlis furnishings
//   dsDome                    whitewashed qadad hammam/tower dome (with optional stained-glass oculi) or mudbrick oasis dome

function dsJussFace(len,y,zf,yaw,o){
 o=o||{};
 if(len<.3)return;
 const h=o.h==null?.34:o.h,kind=o.kind||'chevron',d=.036,cW=P('qadad'),cS=P('stucco');
 W(0,0,0,yaw,()=>{
  svNoWalk(()=>{
   /* Backing stucco band + crisp top & bottom projecting string-courses */
   box('stucco',0,y,zf+.014,len,h,.024,cS);
   box('qadad',0,y,zf+d/2,len,.055,d,cW);
   box('qadad',0,y+h-.055,zf+d/2,len,.055,d,cW);
   const innerH=h-.12,yc=y+.06+innerH/2;
   if(kind==='chevron'){
    const pitch=.34,n=Math.max(2,Math.floor((len-.12)/pitch)),span=n*pitch,xStart=-span/2;
    for(let i=0;i<n;i++){
     const xa=xStart+i*pitch,xm=xa+pitch/2,xb=xa+pitch;
     beam('qadad',[xa,y+.065,zf+d],[xm,y+h-.065,zf+d],.036,cW,false,0,.042);
     beam('qadad',[xm,y+h-.065,zf+d],[xb,y+.065,zf+d],.036,cW,false,0,.042);
    }
   }else if(kind==='diamond'){
    const pitch=.42,n=Math.max(2,Math.floor((len-.16)/pitch)),span=n*pitch,xStart=-span/2;
    for(let i=0;i<n;i++){
     const xm=xStart+(i+.5)*pitch,rx=pitch*.44,ry=innerH*.48;
     beam('qadad',[xm-rx,yc,zf+d],[xm,yc+ry,zf+d],.032,cW,false,0,.038);
     beam('qadad',[xm,yc+ry,zf+d],[xm+rx,yc,zf+d],.032,cW,false,0,.038);
     beam('qadad',[xm+rx,yc,zf+d],[xm,yc-ry,zf+d],.032,cW,false,0,.038);
     beam('qadad',[xm,yc-ry,zf+d],[xm-rx,yc,zf+d],.032,cW,false,0,.038);
     box('qadad',xm,yc-.035,zf+d,.07,.07,.038,cW);
    }
   }else{
    /* Dentil / sawtooth brick-and-gypsum course */
    const pitch=.24,n=Math.max(3,Math.floor((len-.1)/pitch)),span=n*pitch,xStart=-span/2;
    for(let i=0;i<n;i++)box('qadad',xStart+(i+.5)*pitch,y+.07,zf+d,.11,innerH-.02,.038,cW);
   }
  });
 });
 if(CURREC&&CURREC.ds)CURREC.ds.jussBands++;
}

/* dsJussRing(x0, z0, x1, z1, y, o): wraps a crisp white juss relief frieze around all exposed faces of [x0..x1, z0..z1] */
function dsJussRing(x0,z0,x1,z1,y,o){
 o=o||{};
 const w=x1-x0,d=z1-z0,cx=(x0+x1)/2,cz=(z0+z1)/2,skip=o.skip||'';
 if(skip.indexOf('s')<0)W(cx,0,z1,0,()=>dsJussFace(w+.04,y,0,0,o));
 if(skip.indexOf('e')<0)W(x1,0,cz,PI/2,()=>dsJussFace(d+.04,y,0,0,o));
 if(skip.indexOf('w')<0)W(x0,0,cz,-PI/2,()=>dsJussFace(d+.04,y,0,0,o));
 if(!o.cliffRear&&skip.indexOf('n')<0)W(cx,0,z0,PI,()=>dsJussFace(w+.04,y,0,0,o));
}

/* dsVertBand(x, y0, y1, zf, yaw, o): vertical gypsum relief pilaster strip framing window bays (Sana'a & Dar al-Hajar) */
function dsVertBand(x,y0,y1,zf,yaw,o){
 o=o||{};
 const h=y1-y0,w=o.w==null?.24:o.w,cW=P('qadad');
 if(h<.4)return;
 W(x,0,zf,yaw,()=>{
  svNoWalk(()=>{
   box('stucco',0,y0,.012,w,h,.02,P('stucco'));
   for(const s of [-1,1])box('qadad',s*(w/2-.022),y0,.024,.044,h,.028,cW);
   const n=Math.max(2,Math.floor((h-.2)/.38)),step=(h-.16)/n;
   for(let i=0;i<n;i++){
    const yc=y0+.08+(i+.5)*step;
    beam('qadad',[-w*.34,yc,.03],[0,yc+step*.42,.03],.028,cW,false,0,.03);
    beam('qadad',[0,yc+step*.42,.03],[w*.34,yc,.03],.028,cW,false,0,.03);
    beam('qadad',[w*.34,yc,.03],[0,yc-step*.42,.03],.028,cW,false,0,.03);
    beam('qadad',[0,yc-step*.42,.03],[-w*.34,yc,.03],.028,cW,false,0,.03);
   }
  });
 });
}

/* dsQamariyaWin(x, y, zf, yaw, w, h, o): Yemeni window — shuttered lower wood casement + semicircular stained-glass qamariya arch */
function dsQamariyaWin(x,y,zf,yaw,w,h,o){
 o=o||{};
 const cW=P('qadad'),cWood=P('cedar'),cShut=P('shutter');
 const solid=o.solid!==false,archR=w*.52,archY=h+.1;
 const gHex=o.glassHex==null?DS_GLASS_HEX[Math.abs(Math.round(x*11+y*5+zf*3))%DS_GLASS_HEX.length]:o.glassHex;
 W(x,y,zf,yaw,()=>{
  /* Lower rectangular casement glass (lit or clear, never a black void!) */
  svPane(0,.06,-.02,0,w-.12,h-.1,{kind:o.lit?'lit':'clear',solid,depth:.07});
  svNoWalk(()=>{
   /* Stone sill + white gypsum surround around casement */
   box('ashlar',0,-.04,.045,w+.24,.08,.12,P('ashlar'));
   for(const s of [-1,1])box('qadad',s*(w/2+.055),.02,.022,.11,archY,.036,cW);
   box('qadad',0,h-.02,.026,w+.22,.09,.042,cW);
   /* Carved cedar casement frame, central mullion & open shutters */
   for(const s of [-1,1])box('cedar',s*(w/2-.035),.04,.018,.075,h-.04,.065,cWood);
   box('cedar',0,.04,.018,.055,h-.04,.06,cWood);
   box('cedar',0,h-.03,.022,w+.06,.065,.065,cWood);
   box('cedar',0,h*.52,.018,w-.06,.048,.06,cWood);
   if(o.shutters!==false){
    const sw=Math.min(.28,w*.34);
    for(const s of [-1,1])box('cedar',s*(w/2+sw/2+.08),.06,.042,sw,h-.12,.034,cShut);
   }
   /* Semicircular qamariya stained-glass fanlight lunette */
   const pts=[];
   for(let i=0;i<=10;i++){const a=PI*i/10;pts.push([-Math.cos(a)*(archR-.04),archY+Math.sin(a)*(archR-.04),-.015]);}
   svPanePoly(pts,{kind:'stained',color:gHex,solid,depth:.06});
   /* Crisp white gypsum hood-arch & radial/petalled tracery over the stained glass */
   const nSeg=10;
   for(let i=0;i<nSeg;i++){
    const a0=PI*i/nSeg,a1=PI*(i+1)/nSeg,am=(a0+a1)/2;
    beam('qadad',[Math.cos(a0)*(archR+.05),archY+Math.sin(a0)*(archR+.05),.034],
                 [Math.cos(a1)*(archR+.05),archY+Math.sin(a1)*(archR+.05),.034],.095,cW,false,0,.052);
    beam('qadad',[Math.cos(a0)*(archR*.52),archY+Math.sin(a0)*(archR*.52),.014],
                 [Math.cos(a1)*(archR*.52),archY+Math.sin(a1)*(archR*.52),.014],.03,cW,false,0,.025);
    if(i%2===0){
     beam('qadad',[0,archY+.04,.014],[Math.cos(am)*(archR-.04),archY+Math.sin(am)*(archR-.04),.014],.026,cW,false,0,.024);
    }
   }
   /* Apex finial drop-tear in white juss (classic Sana'a arch crest!) */
   cone('qadad',0,archY+archR+.08,.034,.065,.16,cW,6);
   /* Optional tiny flanking gypsum lancet slits (Dar al-Hajar motif) */
   if(o.flank){
    for(const s of [-1,1]){
     const fx=s*(w/2+.26);
     svPane(fx,archY-.02,-.015,0,.14,.34,{kind:'stained',color:DS_GLASS_HEX[(gHex+1)%DS_GLASS_HEX.length],solid,depth:.05});
     box('qadad',fx,archY-.05,.02,.24,.05,.032,cW);
     box('qadad',fx,archY+.31,.02,.24,.06,.032,cW);
     for(const js of [-1,1])box('qadad',fx+js*.09,archY-.02,.02,.04,.34,.032,cW);
    }
   }
  });
  windowAt(0,0,0,0,w,archY+archR,y);
 });
 if(CURREC&&CURREC.ds)CURREC.ds.qamariya++;
}

/* dsVilWin(x, y, zf, yaw, w, h, o): restrained Dasri village window — timber frame + simple whitewash lintel eyebrow */
function dsVilWin(x,y,zf,yaw,w,h,o){
 o=o||{};
 w=w==null?.58:w;h=h==null?.72:h;
 const solid=o.solid!==false;
 W(x,y,zf,yaw,()=>{
  svPane(0,.05,-.02,0,w-.1,h-.1,{kind:o.lit?'lit':'smoked',solid,depth:.06});
  svNoWalk(()=>{
   box('timber',0,-.03,.03,w+.16,.06,.1,P('timber'));
   box('timber',0,h-.03,.03,w+.22,.07,.1,P('timber'));
   for(const s of [-1,1])box('cedar',s*(w/2-.03),.03,0,.05,h-.06,.05,P('cedar'));
   box('cedar',0,.03,0,.038,h-.06,.04,P('cedar'));
   /* Simple whitewashed limewash eyebrow band above lintel (no stained-glass qamariya!) */
   box('qadad',0,h+.04,.018,w+.28,.085,.026,P('qadadWarm'));
   for(const s of [-1,1])box('qadad',s*(w/2+.1),.2,.015,.065,h-.14,.02,P('qadadWarm'));
  });
  windowAt(0,0,0,0,w,h,y);
 });
}

/* dsMashrabiya(x, y, zf, yaw, w, h, o): projecting carved-cedar latticework cooling box / shurbah on timber corbels */
function dsMashrabiya(x,y,zf,yaw,w,h,o){
 o=o||{};
 w=w==null?1.25:w;h=h==null?1.55:h;
 const dp=o.depth==null?.42:o.depth,cWood=P('cedar'),cTim=P('timber');
 W(x,y,zf,yaw,()=>{
  /* Back glass pane so interior light glows gently through the lattice at night */
  svPane(0,.08,-.01,0,w-.18,h-.2,{kind:'lit',solid:o.solid!==false,depth:.06});
  svNoWalk(()=>{
   /* Carved timber corbel brackets */
   for(const s of [-1,1]){
    const bx=s*(w*.36);
    beam('cedar',[bx,-.28,.02],[bx,.04,dp-.04],.075,cWood,false,0,.1);
    box('cedar',bx,-.04,dp/2,.08,.09,dp,cWood);
   }
   /* Floor & ceiling frames of the projecting box */
   box('cedar',0,0,dp/2,w,.08,dp,cWood);
   box('cedar',0,h-.08,dp/2,w+.08,.09,dp+.06,cWood);
   /* Sloped whitewashed qadad weather hood above the mashrabiya */
   prism('qadad',[[-w/2-.08,0],[w/2+.08,0],[w/2+.04,dp+.08],[-w/2-.04,dp+.08]],h+.01,h+.16,P('qadad'));
   /* Corner posts + latticework grille bars on front and both sides */
   for(const sx of [-1,1])for(const sz of [.04,dp-.04])box('cedar',sx*(w/2-.035),.08,sz,.07,h-.16,.07,cWood);
   const nV=Math.max(4,Math.round(w/.14));
   for(let i=1;i<nV;i++){
    const lx=-w/2+i*w/nV;
    box('timber',lx,.08,dp-.025,.024,h-.16,.024,cTim);
   }
   const nH=Math.max(4,Math.round(h/.18));
   for(let j=1;j<nH;j++){
    const ly=.08+j*(h-.16)/nH;
    box('timber',0,ly,dp-.025,w-.06,.024,.026,cTim);
    for(const sx of [-1,1])box('timber',sx*(w/2-.025),ly,dp/2,.026,.024,dp-.06,cTim);
   }
   /* Small projecting water-jar cooling box (shurbah) at the centre sill */
   box('cedar',0,.12,dp+.09,.36,.42,.18,cWood);
   cyl('banco',0,.16,dp+.09,.1,.28,P('bancoL'),8,.06);
  });
  windowAt(0,0,dp,0,w,h,y);
 });
 if(CURREC&&CURREC.ds)CURREC.ds.mashrabiya++;
}

/* dsHornPinnacle(x, y, z, yaw, s, col): Yemeni stepped triangular/horned shurfat corner pinnacle (the Dasri horn sign!) */
function dsHornPinnacle(x,y,z,yaw,s,col){
 s=s==null?1:s;col=col==null?P('qadad'):col;
 W(x,y,z,yaw,()=>{
  svNoWalk(()=>{
   box('qadad',0,0,0,.38*s,.18*s,.38*s,col);
   box('qadad',0,.18*s,0,.28*s,.2*s,.28*s,col);
   /* Twin curved/canting horn tips crowning the pinnacle */
   for(const sg of [-1,1]){
    beam('qadad',[sg*.06*s,.34*s,0],[sg*.16*s,.62*s,0],.07*s,col,false,0,.09*s);
   }
   cone('qadad',0,.36*s,0,.07*s,.24*s,col,6);
  });
 });
 if(CURREC&&CURREC.ds)CURREC.ds.horns++;
}

/* dsParapet(x0, z0, x1, z1, y, o): rooftop parapet — urban pierced screen + juss crown + horn shurfat, or village banco + lime rim */
function dsParapet(x0,z0,x1,z1,y,o){
 o=o||{};
 const vil=o.style==='village',h=o.h==null?(vil?.64:.94):o.h,t=o.t==null?.26:o.t,skip=o.skip||'';
 const cW=P('qadad'),mk=vil?'banco':(o.shibam?'qadad':'brick'),col=P(vil?'banco':(o.shibam?'qadad':'brick'));
 const seg=(k,ax,az,bx,bz,flushRear)=>{
  if(skip.indexOf(k)>=0)return;
  const L=Math.hypot(bx-ax,bz-az);if(L<.25)return;
  const yaw=Math.atan2(az-bz,bx-ax);
  W((ax+bx)/2,0,(az+bz)/2,yaw,()=>{
   if(vil){
    /* Solid mudbrick parapet (walkable edge blocker) + thin whitewash coping + optional triangular merlons */
    box('banco',0,y,0,L,h-.07,t,col);
    svNoWalk(()=>{
     box('qadad',0,y+h-.07,0,L+(flushRear?0:.04),.07,t+(flushRear?0:.04),P('qadadWarm'));
     if(o.crenel){
      const mp=.58,nm=Math.max(2,Math.floor((L-.3)/mp));
      for(let i=0;i<nm;i++){
       const mx=-L/2+.2+(i+.5)*(L-.4)/nm;
       prism('banco',[[mx-.18,-t/2],[mx+.18,-t/2],[mx+.18,t/2],[mx-.18,t/2]],y+h,y+h+.12,col);
       cone('qadad',mx,y+h+.12,0,.16,.2,P('qadadWarm'),4);
      }
     }
    });
   }else{
    /* Urban Jabal parapet: lower solid kerb, pierced arched/lattice middle band (when o.screen !== false), white juss top frieze */
    const solidH=o.screen===false||flushRear?h-.14:.42;
    box(mk,0,y,0,L,solidH,t,col);
    svNoWalk(()=>{
     if(o.screen!==false&&!flushRear&&L>1.4){
      const pitch=.68,np=Math.max(2,Math.floor((L-.3)/pitch)),step=(L-.2)/np;
      for(let i=0;i<=np;i++){
       const px=-L/2+.1+i*step;
       box(mk,px,y+solidH,0,.14,h-.14-solidH,t,col);
       if(i<np){
        const pm=px+step/2;
        box('qadad',pm,y+h-.24,0,step-.12,.1,t+.02,cW);
        beam('qadad',[px+.06,y+solidH+.04,0],[pm,y+h-.24,0],.035,cW,false,0,t*.6);
        beam('qadad',[pm,y+h-.24,0],[px+step-.06,y+solidH+.04,0],.035,cW,false,0,t*.6);
       }
      }
     }
     box('qadad',0,y+h-.14,0,L+(flushRear?0:.05),.14,t+(flushRear?0:.05),cW);
     if(!flushRear)dsJussFace(L-.08,y+h-.32,t/2,0,{h:.22,kind:'chevron'});
    });
   }
  });
 };
 const e=t/2;
 seg('s',x0,z1-e,x1,z1-e,false);
 seg('e',x1-e,z1,x1-e,z0,false);
 if(!(o.cliffRear&&o.skipRearParapet))seg('n',x1,z0+e,x0,z0+e,!!o.cliffRear);
 seg('w',x0+e,z0,x0+e,z1,false);

 /* Corner shurfat horn pinnacles (urban full horns; village small whitewashed corner nibs) */
 const corners=[
  [x0+e,z1-e,0,false],[x1-e,z1-e,PI/2,false],
  [x1-e,z0+e,PI,!!o.cliffRear],[x0+e,z0+e,-PI/2,!!o.cliffRear]
 ];
 for(const [cx,cz,cyaw,isRear] of corners){
  if(isRear&&o.cliffRear)continue;
  if(vil){
   svNoWalk(()=>cone('qadad',cx,y+h,cz,.14,.28,P('qadadWarm'),4));
   if(CURREC&&CURREC.ds)CURREC.ds.horns++;
  }else{
   dsHornPinnacle(cx,y+h,cz,cyaw,o.hornScale==null?1:o.hornScale,cW);
  }
 }
 /* Intermediate shurfat pinnacles on wide urban fronts */
 if(!vil&&(x1-x0)>=8.2&&skip.indexOf('s')<0){
  const nMid=Math.floor((x1-x0)/4.4);
  for(let i=1;i<=nMid;i++){
   const mx=x0+i*(x1-x0)/(nMid+1);
   dsHornPinnacle(mx,y+h,z1-e,0,.78,cW);
  }
 }
}

/* dsMafraj(x0, z0, x1, z1, y0, o): top-floor Yemeni mafraj belvedere overlooking a roof terrace, furnished with majlis seating */
function dsMafraj(x0,z0,x1,z1,y0,o){
 o=o||{};
 const w=x1-x0,d=z1-z0,cx=(x0+x1)/2,cz=(z0+z1)/2,h=o.h==null?3.55:o.h,t=.38;
 const mk=o.shibam?'qadad':'brick',hollow=o.hollow!==false;
 if(hollow){
  const dw=1.05,dh=2.05;
  dsRing(x0,z0,x1,z1,y0,h,{
   t,mk,cliffRear:!!o.cliffRear,
   holes:{
    s:[{at:w/2,w:dw,y:0,h:dh},{at:w*.2,w:.82,y:.65,h:1.15},{at:w*.8,w:.82,y:.65,h:1.15}],
    e:[{at:d*.5,w:Math.min(1.4,d*.42),y:.65,h:1.2}],
    w:[{at:d*.5,w:Math.min(1.4,d*.42),y:.65,h:1.2}],
    n:o.cliffRear?[]:[{at:w*.3,w:.82,y:.65,h:1.15},{at:w*.7,w:.82,y:.65,h:1.15}]
   }
  });
  box('floor',cx,y0+.01,cz,w-2*t,.06,d-2*t,P('floor'));
  /* Operable terrace door into the mafraj + flanking stained-glass qamariya windows */
  W(cx,y0,z1,0,()=>{
   svLeaf(0,.06,-t/2,0,dw-.06,dh-.06,{mk:'cedar',col:P('cedar'),style:'glazed',name:'mafraj terrace door'});
   door(0,0,0,0,dw,dh);
   /* Semicircular qamariya arch above the mafraj terrace door */
   svNoWalk(()=>{
    const pts=[];for(let i=0;i<=8;i++){const a=PI*i/8;pts.push([-Math.cos(a)*.52,dh+.08+Math.sin(a)*.52,-.04]);}
    svPanePoly(pts,{kind:'stained',color:0xd88c24,solid:false});
    for(let i=0;i<8;i++){
     const a0=PI*i/8,a1=PI*(i+1)/8;
     beam('qadad',[Math.cos(a0)*.58,dh+.08+Math.sin(a0)*.58,.03],[Math.cos(a1)*.58,dh+.08+Math.sin(a1)*.58,.03],.08,P('qadad'),false,0,.04);
    }
   });
  });
  for(const sx of [-1,1]){
   dsQamariyaWin(cx+sx*(w*.3),y0+.65,z1,0,.82,1.15,{solid:false,shutters:false,lit:true});
  }
  dsQamariyaWin(x1,y0+.65,cz,PI/2,Math.min(1.4,d*.42),1.2,{solid:false,shutters:false,lit:true});
  dsQamariyaWin(x0,y0+.65,cz,-PI/2,Math.min(1.4,d*.42),1.2,{solid:false,shutters:false,lit:true});
  if(!o.cliffRear){
   for(const sx of [-1,1])dsQamariyaWin(cx+sx*(w*.2),y0+.65,z0,PI,.82,1.15,{solid:false,shutters:true,lit:true});
  }
  /* Furnish the mafraj with Dasri/Eastern-Nomad majlis carpet, cushions, coffee set & hookah */
  W(cx,y0+.07,cz,0,()=>{
   FURNISH('nomad_kilim',0,0,-.2,0,{setting:'indoor'});
   if(w>=4.6)FURNISH('nomad_majlis_mattress',0,0,-d/2+t+.55,0,{setting:'indoor'});
   FURNISH('nomad_tray_table',0,0,-.15,0,{setting:'indoor'});
   FURNISH('nomad_coffee_set',0,svfH('nomad_tray_table',0,.35),-.15,0,{setting:'indoor'});
   if(w>=5.2)FURNISH('nomad_hookah_grand',w/2-t-.55,0,-.2,-PI/2,{setting:'indoor'});
   haloAt(0,2.2,0,0xffbe68,false);
  });
 }else{
  dsSolidTier(x0,z0,x1,z1,y0,h,{mk,cliffRear:!!o.cliffRear,quoins:!o.shibam});
  const nb=Math.max(2,Math.min(4,Math.floor((w-.8)/1.45)));
  for(let i=0;i<nb;i++){
   const wx=x0+(i+.5)*w/nb;
   dsQamariyaWin(wx,y0+.72,z1,0,.92,1.22,{solid:true,lit:true,shutters:false});
   if(!o.cliffRear)dsQamariyaWin(wx,y0+.72,z0,PI,.86,1.15,{solid:true,lit:true,shutters:false});
  }
  dsQamariyaWin(x1,y0+.72,cz,PI/2,1.05,1.22,{solid:true,lit:true,shutters:false});
  dsQamariyaWin(x0,y0+.72,cz,-PI/2,1.05,1.22,{solid:true,lit:true,shutters:false});
 }
 dsJussRing(x0,z0,x1,z1,y0+h-.38,{h:.34,kind:'diamond',cliffRear:!!o.cliffRear});
 const topY=dsRoof(x0,z0,x1,z1,y0+h,{style:'urban',walk:false});
 dsParapet(x0,z0,x1,z1,topY,{style:'urban',h:.76,shibam:!!o.shibam,cliffRear:!!o.cliffRear,hornScale:.92});
 return topY+.76;
}

/* dsDome(x, y, z, r, h, o): whitewashed qadad dome (urban hammam / call tower) or warm mudbrick dome (oasis qasr) */
function dsDome(x,y,z,r,h,o){
 o=o||{};
 const vil=o.style==='village',mk=vil?'banco':'qadad',col=o.col==null?P(vil?'bancoL':'qadad'):o.col;
 svNoWalk(()=>{
  /* Drum base */
  const dh=o.drumH==null?.38:o.drumH;
  if(dh>0){
   cyl(mk,x,y,z,r*1.03,dh,col,20);
   if(!vil)cyl('stucco',x,y+dh-.1,z,r*1.055,.1,P('stucco'),20);
  }
  const y0=y+dh;
  const prof=[];
  const ns=8;
  for(let i=0;i<=ns;i++){
   const f=i/ns,ang=f*PI/2;
   /* Pointed Yemeni ogival profile */
   const rad=i===ns?.04:Math.max(.04,r*(Math.cos(ang)*.92+(1-f)*.08));
   const yy=y0+h*Math.sin(ang);
   prof.push([rad,yy]);
  }
  lathe(mk,x,z,prof,20,col);
  /* Stained-glass bathhouse star-oculi (Sana'a hammam domes!) or mudbrick peg-ribs (oasis qasr!) */
  if(o.oculi&&!vil){
   for(let k=0;k<6;k++){
    const a=k*TAU/6,ox=x+Math.cos(a)*r*.62,oz=z+Math.sin(a)*r*.62,oy=y0+h*.62;
    cyl('qadad',ox,oy,oz,.16,.12,P('qadad'),8);
    cyl(svGlass('stained',{color:DS_GLASS_HEX[k%DS_GLASS_HEX.length]}),ox,oy+.12,oz,.11,.04,0xffffff,8);
   }
  }
  if(vil&&o.pegs!==false){
   for(let k=0;k<8;k++){
    const a=k*TAU/8,px=x+Math.cos(a)*r*.78,pz=z+Math.sin(a)*r*.78,py=y0+h*.42;
    pole('timber',[px,py,pz],[x+Math.cos(a)*(r*.98),py+.08,z+Math.sin(a)*(r*.98)],.032,P('timber'),5);
   }
  }
  /* Brass horn-finial (the Dasri sign!) on urban domes, mudbrick finial cone on village domes */
  const fy=y0+h;
  if(vil){
   cone('qadad',x,fy-.02,z,.12,.28,P('qadadWarm'),8);
  }else{
   pole('bronze',[x,fy-.04,z],[x,fy+.42,z],.028,P('bronze'),6);
   sph('bronze',x,fy+.18,z,.075,P('bronze'),1,8);
   for(const s of [-1,1])beam('bronze',[x,fy+.34,z],[x+s*.15,fy+.52,z],.024,P('bronze'),true,6);
  }
 });
 if(CURREC&&CURREC.ds)CURREC.ds.domes++;
}
