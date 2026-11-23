/* prefix: sm */
// ================================================================= MAMLUK HIGHLAND DOMES & ZONES OF TRANSITION
// Pointed high-shouldered Cairene stone domes in 3D spiral-gadrooned (hand = +1 or mirror -1) and carved star-relief modes,
// stepped Turkish-triangle muqarnas shoulders, 1-over-2 qamariyya bullseye roundels, 12-light clerestory drums, and bronze jamurs.

/* Tiered cast-bronze Mamluk jamur finial (three graduated spheres on a slender mast; culture-neutral) */
function smJamur(x,y,z,h){
 const total=h==null?1.6:h;
 W(x,y,z,0,()=>{
  svNoWalk(()=>{
   cyl('travertine',0,-.06,0,.32,.14,P('travertine'),16,.20,false);
   cyl('bronzeCast',0,.08,0,.22,.16,P('bronze'),14,.10,false);
   pole('bronze',[0,.20,0],[0,total,0],.030,P('bronze'),10);
   const radii=[.16,.125,.09];
   const heights=[.34,.60,.82];
   for(let i=0;i<3;i++){
    const sy=total*heights[i],sr=radii[i]*(total/1.6);
    ring('gold',0,sy-sr*.85,0,sr*.58,.018,P('gold'),0,0,0,14);
    sph('bronze',0,sy,0,sr,P('bronze'),.92,14);
    ring('gold',0,sy+sr*.85,0,sr*.52,.016,P('gold'),0,0,0,14);
   }
   cone('gold',0,total*.90,0,.045*(total/1.6),total*.14,P('gold'),10);
  });
 });
}

/* Bullseye qamariyya roundel window (carved stone oculus frame + stained amber glass disc) */
function smQamariyya(x,y,z,r,ry,solid){
 W(x,y,z,ry==null?0:ry,()=>{
  svNoWalk(()=>{
   ring('travertine',0,0,.03,r,.055,P('travertine'),0,PI*.5,0,18);
   ring('basalt',0,0,.045,r*.74,.032,P('basalt'),0,PI*.5,0,16);
   const gk=svGlass('stained',{color:0xd89b3c});
   WX(0,0,.01,0,PI*.5,0,()=>{
    cyl(gk,0,0,0,r*.72,.025,0xffffff,16,null,false);
   });
   if(solid){
    WX(0,0,-.04,0,PI*.5,0,()=>{
     cyl('room',0,0,0,r*.74,.02,0xffffff,14,null,false);
    });
    if(!PLACE_DRY)SV_OPEN.cards++;
   }
  });
 });
}

/* High-shouldered pointed Mamluk stone dome (style: 'spiral' | 'carved', hand: +1 | -1) */
function smDome(x,y0,z,D,o){
 const opt=o||{};
 const style=opt.style==='carved'?'carved':'spiral';
 const hand=opt.hand==null?1:(opt.hand<0?-1:1);
 const H=opt.h==null?D*.82:opt.h;
 const collarH=Math.min(.48,D*.068);
 const shellH=H-collarH;
 const hollow=opt.hollow==null?true:!!opt.hollow;
 const wallT=Math.min(.34,D*.045);

 W(x,y0,z,0,()=>{
  svNoWalk(()=>{
   /* Base stone cornice & wrapped epigraphic frieze collar (refs/01, refs/02) */
   const R=D*.5;
   const fMk=opt.friezeMk||'frieze_kattu';
   cyl('chiselled',0,0,0,R+.14,.12,P('travShade'),32,R+.18,false);
   cyl(fMk,0,.12,0,R+.04,Math.max(.20,collarH-.20),0xffffff,32,R+.03,true);
   cyl('chiselled',0,collarH-.08,0,R+.10,.10,P('travertine'),32,R+.05,false);

   /* Hollow inward-facing stone soffit inset cleanly inside outer pointed shell so it never clips near apex */
   if(hollow){
    const profIn=[];
    const nIn=16;
    const inH=shellH*.82;
    for(let j=0;j<=nIn;j++){
     const v=j/nIn;
     const rOut=smDomeRadius(v*.82,D);
     const rIn=j===nIn?0:Math.max(.02,rOut-wallT-.16);
     profIn.push([rIn,collarH+v*inH]);
    }
    lathe('travertine',0,0,profIn,28,P('travShade'),{inward:true});
    /* Interior bronze & gold apex rosette boss tucked cleanly inside inner vault soffit */
    const apexY=collarH+inH-.08;
    cyl('bronzeCast',0,apexY,0,.20,.06,P('bronze'),16,null,false);
    ring('gold',0,apexY,0,.16,.02,P('gold'),0,0,0,16);
   }

   const capFrac=SM_SM6?.965:.90;
   if(style==='spiral'){
    /* 3D convex torsion gadroon dome (refs/02): bold convex spiral ribs + deep shadowed valleys */
    const ribs=opt.ribs==null?22:opt.ribs;
    const turns=opt.turns==null?.45:opt.turns;
    const nu=ribs*4,nv=28;
    const ampBase=SM_SM6?Math.min(.26,D*.034):Math.min(.14,D*.018);
    const cCrest=hc(SVPAL.domeStone[2]),cValley=hc(SM_SM6?0x938672:SVPAL.domeShade[1]);
    psurf('travertine',(u,v)=>{
     const vCl=(SM_SM6?.988:.982)*v;
     const r0=smDomeRadius(vCl,D);
     const taper=Math.sin(PI*Math.pow(vCl,.70));
     const phase=(u+hand*turns*vCl)*ribs*PI;
     const flute=SM_SM6?Math.pow(Math.abs(Math.sin(phase)),.74):Math.abs(Math.sin(phase));
     const r=Math.max(.10,r0+ampBase*taper*(flute*1.22-.30));
     const ang=u*TAU;
     return [Math.cos(ang)*r,collarH+vCl*shellH,Math.sin(ang)*r];
    },nu,nv,0xffffff,{
     flip:true,
     colf:(u,v)=>{
      const phase=(u+hand*turns*v)*ribs*PI;
      const raw=Math.abs(Math.sin(phase));
      const flute=SM_SM6?Math.pow(raw,.78):raw;
      const f=SM_SM6?(.60+.42*flute):(.76+.24*flute);
      return new THREE.Color(
       lerp(cValley.r,cCrest.r,flute)*f/.92,
       lerp(cValley.g,cCrest.g,flute)*f/.92,
       lerp(cValley.b,cCrest.b,flute)*f/.92
      );
     }
    });
    /* Raised carved stone rib spines along each spiral crest running right up to the necking ring */
    for(let k=0;k<ribs;k++){
     const u0=(k+.5)/ribs;
     tube('chiselled',t=>{
      const v=.01+(capFrac-.015)*t;
      const r0=smDomeRadius(v,D);
      const taper=Math.sin(PI*Math.pow(v,.70));
      const r=r0+ampBase*taper*.96*(1-.22*t*t);
      const ang=(u0+hand*turns*v)*TAU;
      return [Math.cos(ang)*r,collarH+v*shellH,Math.sin(ang)*r];
     },t=>{
      const s=Math.sin(PI*Math.pow(.02+.94*t,.68));
      const w=Math.max(.016,ampBase*.48*s);
      return [w,w*.88];
     },18,5,P('ashlar'));
    }
   }else{
    /* Pointed Mamluk carved geometric star-and-arabesque relief dome (refs/01, refs/03) */
    const profOut=[];
    const nOut=24;
    for(let j=0;j<=nOut;j++){
     const v=j/nOut;
     profOut.push([j===nOut?0:smDomeRadius(v,D),collarH+v*shellH]);
    }
    lathe('domeCarved',0,0,profOut,36,P('domeStone'));
    /* Interlaced geometric relief straps forming Mamluk lozenge-and-star lattice up to the necking collar */
    const nStraps=SM_SM6?18:16;
    for(let k=0;k<nStraps;k++)for(const dir of [-1,1]){
     const u0=k/nStraps;
     tube('chiselled',t=>{
      const v=.015+(capFrac-.02)*t;
      const r=smDomeRadius(v,D)+(SM_SM6?.034:.022)*(1-.55*t);
      const ang=(u0+dir*.26*v)*TAU;
      return [Math.cos(ang)*r,collarH+v*shellH,Math.sin(ang)*r];
     },t=>{
      const sc=.52+.48*(1-t);
      const rw=SM_SM6?.042:.034;
      return [rw*sc,rw*.78*sc];
     },16,4,P('ashlar'));
    }
    if(SM_SM6){
     /* Horizontal carved interlace rings & two tiers of Mamluk star-boss medallions (refs/01, refs/03) */
     for(const vR of [.20,.48,.74]){
      ring('chiselled',0,collarH+vR*shellH,0,smDomeRadius(vR,D)+.018,.024,P('travShade'),0,0,0,28);
     }
    }
    const nBoss=SM_SM6?12:8;
    for(let k=0;k<nBoss;k++){
     const ang=k/nBoss*TAU+PI/nBoss;
     const vM=.34;
     const rM=smDomeRadius(vM,D)+.034;
     W(Math.cos(ang)*rM,collarH+vM*shellH,Math.sin(ang)*rM,PI*.5-ang,()=>{
      ring('chiselled',0,0,0,.28,.030,P('ashlar'),0,PI*.5,0,12);
      sph('travertine',0,0,.02,.105,P('travertine'),.55,8);
     });
     if(SM_SM6&&k%2===0){
      const vU=.62,rU=smDomeRadius(vU,D)+.028;
      W(Math.cos(ang)*rU,collarH+vU*shellH,Math.sin(ang)*rU,PI*.5-ang,()=>{
       ring('chiselled',0,0,0,.19,.024,P('ashlar'),0,PI*.5,0,10);
       sph('travertine',0,0,.015,.075,P('travertine'),.55,8);
      });
     }
    }
   }

   /* Compact profiled stone necking collar right below the cast-bronze 3-sphere jamur finial (refs/01..03) */
   const capBaseY=collarH+capFrac*shellH;
   const capBaseR=Math.max(.24,smDomeRadius(capFrac,D)+.04);
   if(SM_SM6){
    ring('chiselled',0,capBaseY,0,capBaseR+.02,.034,P('travShade'),0,0,0,20);
   }
   cyl('travertine',0,capBaseY,0,capBaseR,H-capBaseY+.04,P('domeStone'),24,.18,false);
  });
  smJamur(0,H+.02,0,Math.max(1.25,D*.22));
 });

 const rec={
  key:CURKEY||'free',
  v:CURREC?CURREC.v:0,
  style,
  hand:style==='spiral'?hand:0,
  span:D,
  h:H
 };
 if(!PLACE_DRY){
  SM_DOMES.push(rec);
  if(CURREC&&CURREC.domes)CURREC.domes.push(rec);
 }
 return rec;
}

/* Mamluk zone of transition: square-to-octagon Turkish-triangle shoulders + 1-over-2 qamariyya + shurafat belt + 12-light drum */
function smDrum(x,y0,z,span,o){
 const opt=o||{};
 const hollow=opt.hollow==null?true:!!opt.hollow;
 const domeD=opt.domeD==null?span*.82:opt.domeD;
 const transH=opt.transH==null?Math.max(1.85,span*.22):opt.transH;
 const clerH=opt.clerH==null?Math.max(1.45,span*.17):opt.clerH;
 const hs=span*.5;
 const octR=domeD*.5+.26;

 W(x,y0,z,0,()=>{
  const wallT=.38;
  const rIn=Math.max(1.2,domeD*.5-wallT);
  /* Base square-to-octagon curb apron sealing roof deck cutouts cleanly around the hollow drum throat */
  const throat=rIn*.70;
  svWell('chiselled',0,.01,0,span+.12,.16,span+.12,P('travShade'),{x0:-throat,x1:throat,z0:-throat,z1:throat},{walk:false});

  svNoWalk(()=>{
   /* Zone 1: Octagonal core masonry + chamfered corner 4-tier stepped prismatic muqarnas ("Turkish triangles", refs/01..02) */
   for(let k=0;k<8;k++){
    const a=k*PI*.25;
    const faceW=2*octR*Math.tan(PI/8)+.08;
    const inW=2*rIn*Math.tan(PI/8)+.08;
    W(0,0,0,a,()=>{
     const nC=5,ch=transH/nC;
     for(let c=0;c<nC;c++){
      const m=smAblaqCourse(c+1);
      if(k%2===0){
       if(c===0||c===nC-1){
        box(m.mk,0,c*ch,octR-.18,faceW,ch,.36,m.col);
       }else{
        for(const sx of [-1,1]){
         box(m.mk,sx*(faceW*.38),c*ch,octR-.18,faceW*.24,ch,.36,m.col);
        }
       }
      }else{
       box(m.mk,0,c*ch,octR-.18,faceW,ch,.36,m.col);
      }
     }
     if(hollow){
      if(k%2!==0){
       box('travertine',0,0,rIn+.10,inW,transH,.20,P('travShade'));
      }else{
       box('travertine',0,0,rIn+.10,inW,.36,.20,P('travShade'));
       box('travertine',0,transH-.38,rIn+.10,inW,.38,.20,P('travShade'));
       for(const sx of [-1,1]){
        box('travertine',sx*(inW*.38),.36,rIn+.10,inW*.24,transH-.74,.20,P('travShade'));
       }
      }
     }
    });
   }

   /* Four corner stepped prismatic Turkish-triangle shoulders (guaranteed outward normals on all 4 corners) */
   const nTier=4,th=(transH-.16)/nTier;
   for(const sx of [-1,1])for(const sz of [-1,1]){
    const cYaw=Math.atan2(sx,sz);
    for(let t=0;t<nTier;t++){
     const frac=1-t/nTier;
     const reach=lerp(octR*.72,hs-.14,frac);
     const bw=lerp(.68,Math.max(.85,(hs-octR*.62)*1.35),frac);
     const mk=t%2===0?'basalt':'travertine';
     const col=t%2===0?P('basalt'):P('travertine');
     /* Corner stepped block + diagonal prismatic facet */
     box(mk,sx*(reach-bw*.30),.16+t*th,sz*(reach-bw*.30),bw*.62,th,bw*.62,col);
     W(sx*lerp(octR*.68,reach*.82,.55),.16+t*th,sz*lerp(octR*.68,reach*.82,.55),cYaw,()=>{
      box(t%2===0?'travertine':'basalt',0,0,0,bw*.72,th*.94,bw*.48,t%2===0?P('travertine'):P('basaltDark'));
      if(t<nTier-1){
       for(const side of [-1,1]){
        box('chiselled',side*bw*.26,th*.15,bw*.16,bw*.28,th*.78,bw*.28,P('travShade'));
       }
      }
     });
    }
   }

   /* Axial faces (0, PI/2, PI, 3*PI/2): triplet lancet lights below 1-over-2 qamariyya bullseye pyramid (refs/01, refs/02) */
   for(let dIdx=0;dIdx<4;dIdx++){
    W(0,0,0,dIdx*PI*.5,()=>{
     const fz=octR-.02;
     const lanY=.36,lanH=Math.max(.56,transH*.42);
     for(let j=-1;j<=1;j++){
      const lx=j*.56;
      const hJ=j===0?lanH+.10:lanH-.04;
      box('travertine',lx,lanY-.05,fz-.12,.44,.08,.28,P('travShade'));
      box('jali',lx,lanY+.03,fz-.04,.34,hJ,.025,P('travertine'));
      svPane(lx,lanY+.03,fz-.12,0,.32,hJ,{kind:'lit',solid:!hollow});
      if(j<1)box('basalt',lx+.28,lanY,fz-.14,.18,lanH+.14,.28,P('basalt'));
     }
     /* 1-over-2 qamariyya bullseye roundels */
     const qBase=lanY+lanH+.28;
     const qr=Math.min(.22,transH*.105);
     smQamariyya(-.28,qBase,fz,qr,0,!hollow);
     smQamariyya(.28,qBase,fz,qr,0,!hollow);
     smQamariyya(0,Math.min(transH-.26,qBase+qr*1.85),fz,qr*.95,0,!hollow);
    });
   }

   /* Octagonal cornice & stepped shurafat merlon belt separating transition shoulder from drum clerestory */
   for(let k=0;k<8;k++){
    const a=k*PI*.25;
    const faceW=2*(octR+.10)*Math.tan(PI/8)+.08;
    W(0,transH,0,a,()=>{
     box('chiselled',0,0,octR-.04,faceW,.18,.34,P('travertine'));
     const nm=Math.max(2,Math.round(faceW/.74));
     for(let m=0;m<nm;m++){
      const mx=-faceW*.5+(m+.5)*(faceW/nm);
      smShurafatMerlon(mx,.18,octR+.04,0,.74);
     }
    });
   }

   /* Zone 2: Fenestrated 12-window circular/polygonal Mamluk drum clerestory */
   const drumY=transH+.20;
   const drumR=domeD*.5;
   const nWin=opt.windows==null?12:opt.windows;
   const segArc=TAU/nWin;
   const pierW=drumR*segArc*.44;
   const winW=drumR*segArc*.52;
   const winH=Math.max(.68,clerH-.54);

   /* Sill & head rings of the drum (hollow ring sectors so interior remains open up into the dome!) */
   for(let i=0;i<nWin;i++){
    const a=i*segArc;
    W(0,drumY,0,a,()=>{
     const rz=drumR-.16;
     const chord=2*drumR*Math.sin(segArc*.5)+.06;
     box('basalt',0,0,rz,chord,.26,.34,P('basalt'));
     /* Ablaq pier between clerestory lights */
     const pX=chord*.5-pierW*.5;
     for(let c=0;c<4;c++){
      const m=smAblaqCourse(c);
      box(m.mk,pX,.26+c*((clerH-.52)/4),rz,pierW,(clerH-.52)/4,.34,m.col);
     }
     /* Clerestory window frame, jali lattice, and warm stained/lit pane */
     box('travertine',0,.24,rz,.06,winH,.36,P('travertine'));
     box('jali',0,.26,rz+.12,winW,.92*winH,.025,P('travertine'));
     svPane(0,.26,rz+.02,0,winW-.04,winH-.04,{kind:'lit',solid:!hollow});
     /* Pointed ablaq lintel band above clerestory light */
     box('ironstone',0,clerH-.28,rz,chord,.14,.36,P('ironstone'));
     box('travertine',0,clerH-.14,rz,chord+.06,.14,.38,P('travertine'));
    });
   }
  });
 });
 return {topY:y0+transH+.20+clerH,domeD};
}
