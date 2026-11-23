// prefix: sl
// ================================================================= ARCHITECTURAL & TENSILE-SILK TOOLKIT (SL1 + SL2 + SL3 + SL4)
// Every structural element strictly separates compression (cream dolomite, red porphyry, vermilion/ebony-lacquered cedar masts)
// from tension (spider-silk velaria, hyperbolic-paraboloid saddles, shamiyana awnings, vertical evaporative wind-veils, and
// 18-22 m dyed canal bolts). Adjacent masonry, timber and silk surfaces are stepped by >= 1.5 cm so zero coplanar faces overlap.

function slTarget(x,y,z,name){
 if(PLACE_DRY||!CURREC)return;
 const p=new THREE.Vector3(x,y,z).applyMatrix4(CM);
 (CURREC.targets||(CURREC.targets=[])).push({x:p.x,y:p.y,z:p.z,name:name||'floor'});
}

function slFurnList(list){
 for(const e of list)FURNISH(e[0],e[1],e[2],e[3],e[4]==null?0:e[4],e[5]);
}

/* Stepped cream-dolomite stylobate with red-porphyry dado course, paved deck at height h, and entrance stone flight on +z. */
const SL_WKM=new THREE.Matrix4(),SL_WKS=new THREE.Matrix4();
function slWallBlock(lx,ly,lz,w,h,d){
 if(PLACE_DRY||typeof WKOFF!=='undefined'&&WKOFF||typeof KWALK==='undefined'||typeof KWALKBOX==='undefined'||!CURREC||CURREC.cls!=='building'||h<.72)return;
 SL_WKS.makeScale(w,h,d).setPosition(lx,ly+h/2,lz);
 SL_WKM.copy(CM).multiply(SL_WKS);
 KWALKBOX.add(KWALK,SL_WKM.elements,{tag:'wall:'+CURKEY});
}
function slPlinth(w,d,h,o){
 o=o||{};
 const h1=Math.min(.22,h*.42),h2=Math.max(.08,h-h1-.08),h3=h-h1-h2;
 svNoWalk(()=>{
  box('dolomite',0,0,0,w+.36,h1,d+.36,P('dolomiteD'));
  box('porphyry',0,h1,0,w+.16,h2,d+.16,P('porphyry'));
  box(o.topMk||'paving',0,h1+h2,0,w,h3,d,P(o.topCol||'paving'));
 });
 wkPad(0,0,w,d,h);
 if(o.steps!==false){
  const sw=o.stepW==null?2.4:o.stepW,sx=o.stepX==null?0:o.stepX,run=o.stepRun==null?Math.max(.85,h*1.9):o.stepRun;
  const zFoot=d/2+.18+run,zTop=d/2+.18;
  const ns=Math.max(2,Math.ceil(h/SL.RISER));
  svNoWalk(()=>{
   for(let i=0;i<ns;i++){
    const f0=i/ns,f1=(i+1)/ns,za=lerp(zFoot,zTop,f0),zb=lerp(zFoot,zTop,f1),yh=h*(i+1)/ns,yl=h*i/ns;
    box('dolomite',sx,yl,(za+zb)/2,sw,yh-yl,Math.abs(za-zb),P('dolomite'));
   }
   for(const s of [-1,1]){
    box('porphyry',sx+s*(sw/2+.11),0,(zFoot+zTop)/2,.18,h+.14,run+.08,P('porphyry'));
   }
  });
  svStripWalk([sx,0,zFoot],[sx,h,zTop-.24],sw);
 }
 return h;
}

/* Straight wall from (x0,z0) to (x1,z1) with dolomite socle and plaster/cedar upper body, cut cleanly around openings. */
function slWall(x0,z0,x1,z1,y0,h,o){
 o=o||{};
 const t=o.t==null?SL.WALL:o.t,soc=o.socle==null?SL.SOCLE:o.socle,mk=o.mk||'plaster',col=o.col==null?P(mk):o.col;
 const L=Math.hypot(x1-x0,z1-z0);if(L<.06)return;
 const yaw=Math.atan2(z0-z1,x1-x0);
 const holes=(o.holes||[]).map(q=>({a:q.at-q.w/2,b:q.at+q.w/2,y0:y0+(q.y==null?0:q.y),y1:y0+(q.y==null?0:q.y)+q.h}));
 W((x0+x1)/2,0,(z0+z1)/2,yaw,()=>{
  const X=s=>s-L/2;
  const run=(a,b,ya,yb)=>{
   if(b-a<.015||yb-ya<.015)return;
   svNoWalk(()=>{
    const sh=Math.min(yb,y0+soc);
    if(soc>0&&sh>ya)box('dolomite',X((a+b)/2),ya,0,b-a,sh-ya,t+.03,P('dolomite'));
    const ba=Math.max(ya,y0+soc);
    if(yb>ba)box(mk,X((a+b)/2),ba,0,b-a,yb-ba,t,col);
   });
   slWallBlock(X((a+b)/2),ya,0,b-a,yb-ya,t);
  };
  const xs=[...new Set([0,L].concat(...holes.map(q=>[q.a,q.b])).filter(v=>v>=0&&v<=L))].sort((p,q)=>p-q);
  for(let i=1;i<xs.length;i++){
   const a=xs[i-1],b=xs[i],m=(a+b)/2;
   const open=holes.filter(q=>q.a<m&&q.b>m).map(q=>[q.y0,q.y1]).sort((p,q)=>p[0]-q[0]);
   let yy=y0;
   for(const r of open){if(r[0]>yy)run(a,b,yy,r[0]);yy=Math.max(yy,r[1]);}
   run(a,b,yy,y0+h);
  }
 });
}

/* Rectangular room walls on (x0..x1, z0..z1) with distinct corner posts so adjacent walls NEVER overlap at corners! */
function slWallRing(x0,z0,x1,z1,y0,h,o){
 o=o||{};
 const t=o.t==null?SL.WALL:o.t,pw=t+.05,hp=pw/2+.005,H=o.holes||{},skip=o.skip||'';
 const postMk=o.postMk||'lacquer',postCol=o.postCol==null?P(postMk):o.postCol;
 for(const cx of [x0,x1])for(const cz of [z0,z1]){
  svNoWalk(()=>{
   box('dolomite',cx,y0,cz,pw+.03,Math.min(.44,h*.2),pw+.03,P('dolomiteD'));
   box(postMk,cx,y0+Math.min(.44,h*.2),cz,pw,h-Math.min(.44,h*.2),pw,postCol);
  });
  slWallBlock(cx,y0,cz,pw,h,pw);
 }
 const shift=(arr,off)=>(arr||[]).map(q=>Object.assign({},q,{at:q.at-off}));
 if(skip.indexOf('s')<0)slWall(x0+hp,z1,x1-hp,z1,y0,h,Object.assign({},o,{holes:shift(H.s,hp)}));
 if(skip.indexOf('n')<0)slWall(x1-hp,z0,x0+hp,z0,y0,h,Object.assign({},o,{holes:shift(H.n,hp)}));
 if(skip.indexOf('e')<0)slWall(x1,z1-hp,x1,z0+hp,y0,h,Object.assign({},o,{holes:shift(H.e,hp)}));
 if(skip.indexOf('w')<0)slWall(x0,z0+hp,x0,z1-hp,y0,h,Object.assign({},o,{holes:shift(H.w,hp)}));
 /* Carved cornice beam capping the ring cleanly above y0+h */
 svNoWalk(()=>{
  const cw=x1-x0+pw+.08,cd=z1-z0+pw+.08;
  box('cedar',(x0+x1)/2,y0+h,z0,cw,.12,.16,P('cedar'));
  box('cedar',(x0+x1)/2,y0+h,z1,cw,.12,.16,P('cedar'));
  for(const sx of [x0,x1])box('cedar',sx,y0+h+.12,(z0+z1)/2,.16,.1,cd,P('cedarD'));
 });
}

/* Post-and-lintel doorway with red-porphyry or lacquered-cedar trim, operable leaf (core/door), and door() record. */
function slDoor(x,y,z,yaw,w,h,o){
 o=o||{};
 const t=o.t==null?SL.WALL:o.t,jMk=o.frameMk||'porphyry',jCol=P(jMk==='lacquer'?'lacquer':'porphyry');
 W(x,y,z,yaw,()=>{
  svNoWalk(()=>{
   for(const s of [-1,1])box(jMk,s*(w/2+.055),0,0,.1,h,.12+t,jCol);
   box(jMk,0,h,0,w+.34,.16,t+.16,jCol);
   box('bronze',0,h+.16,0,w+.24,.04,t+.12,P('bronze'));
  });
  if(o.open!==true){
   svLeaf(0,.02,0,0,w-.04,h-.04,{
    mk:o.leafMk||'lacquer',col:o.leafCol==null?P(o.leafMk==='cedar'?'cedar':'lacquer'):o.leafCol,
    style:o.style||'panel',hwCol:0xb88e42,locked:!!o.locked,ajar:o.ajar==null?0:o.ajar,name:o.name||null
   });
  }
  door(0,0,t/2,0,w,h);
 });
}

/* Glazed lattice window in a wall opening: cedar frame + core/door real glass pane (svPane). */
function slWindow(x,y,z,yaw,w,h,o){
 o=o||{};
 const t=o.t==null?SL.WALL:o.t;
 W(x,y,z,yaw,()=>{
  svNoWalk(()=>{
   box('dolomite',0,-.05,0,w+.16,.05,t+.1,P('dolomite'));
   box('lacquer',0,h,0,w+.18,.07,t+.08,P('lacquer'));
   for(const s of [-1,1])box('cedar',s*(w/2-.025),0,0,.05,h,.08,P('cedarD'));
  });
  svPane(0,0,0,0,w-.1,h,{kind:o.kind||'lit',t:.025});
 });
}

/* Low hipped celadon or terracotta roof with uptilted cedar eaves and ridge bronze finials (non-overlapping). */
function slHipRoof(cx,y0,cz,w,d,rise,o){
 o=o||{};
 const mk=o.mk||'celadon',col=o.col==null?P(mk):o.col,over=o.over==null?.55:o.over;
 const W0=w+over*2,D0=d+over*2,hw=W0/2,hd=D0/2,alongX=W0>=D0,ridge=Math.max(.2,Math.abs(W0-D0)*.46);
 W(cx,y0,cz,0,()=>{
  svNoWalk(()=>{
   box('cedar',0,0,0,W0-.08,.1,D0-.08,P('cedarD'));
   const yB=.1,yT=.1+rise;
   const A=[-hw,yB,-hd],B=[hw,yB,-hd],C=[hw,yB,hd],D=[-hw,yB,hd];
   const P0=alongX?[-ridge,yT,0]:[0,yT,-ridge],Q0=alongX?[ridge,yT,0]:[0,yT,ridge];
   if(alongX){
    poly(mk,[D,C,Q0,P0],col);poly(mk,[B,A,P0,Q0],col);
    poly(mk,[A,D,P0],col);poly(mk,[C,B,Q0],col);
   }else{
    poly(mk,[A,D,Q0,P0],col);poly(mk,[C,B,P0,Q0],col);
    poly(mk,[D,C,Q0],col);poly(mk,[B,A,P0],col);
   }
   if(alongX)beam('bronze',[-ridge-.08,yT+.04,0],[ridge+.08,yT+.04,0],.07,P('bronze'),false);
   else beam('bronze',[0,yT+.04,-ridge-.08],[0,yT+.04,ridge+.08],.07,P('bronze'),false);
   for(const p of [P0,Q0])cone('gold',p[0],yT+.08,p[2],.09,.24,P('gold'),8);
   if(o.lanterns){
    for(const sx of [-hw+.18,hw-.18])for(const sz of [-hd+.18,hd-.18]){
     slCocoonLantern(sx,yB-.02,sz,.48,false);
    }
   }
  });
 });
 return y0+.1+rise+.32;
}

/* SL1: Ria post-and-lintel stone colonnade from (x0,z0) to (x1,z1), base at y0, total entablature top y0 + h. */
function slColonnade(x0,z0,x1,z1,y0,h,o){
 o=o||{};
 const L=Math.hypot(x1-x0,z1-z0),n=o.n==null?Math.max(2,Math.round(L/SL.BAY)+1):o.n;
 const r=o.r==null?.21:o.r,entH=.38,colH=h-entH,yaw=Math.atan2(z0-z1,x1-x0);
 const altPorphyry=o.porphyry!==false;
 W((x0+x1)/2,y0,(z0+z1)/2,yaw,()=>{
  for(let i=0;i<n;i++){
   const f=n===1?.5:i/(n-1),xx=(f-.5)*L;
   const sMk=altPorphyry&&i%2===1?'porphyry':'dolomite';
   svNoWalk(()=>{
    box('dolomite',xx,0,0,r*2.5,.14,r*2.5,P('dolomiteD'));
    cyl('porphyry',xx,.14,0,r*1.16,.08,P('porphyry'),12);
   });
   cyl(sMk,xx,.22,0,r,colH-.44,P(sMk),14,r*.86,true);
   svNoWalk(()=>{
    cyl('bronze',xx,colH-.22,0,r*.94,.05,P('bronze'),12);
    cyl('dolomite',xx,colH-.17,0,r*.92,.09,P('dolomite'),12,r*1.22);
    box('dolomite',xx,colH-.08,0,r*2.55,.08,r*2.55,P('dolomite'));
   });
  }
  svNoWalk(()=>{
   box('dolomite',0,colH,0,L+r*2.6,.2,r*2.2,P('dolomite'));
   box('porphyry',0,colH+.2,0,L+r*2.72,.08,r*2.36,P('porphyry'));
   box('dolomite',0,colH+.28,0,L+r*2.9,.1,r*2.6,P('dolomite'));
  });
 });
}

/* SL1: Tall notched cream-dolomite Mast-Obelisk with bronze pulley sheave, golden dragline-silk cable & nephrite counterweight! */
function slMastObelisk(x,y,z,h,yaw,o){
 o=o||{};
 const w0=o.w==null?.68:o.w;
 W(x,y,z,yaw||0,()=>{
  const shH=h-1.15;
  svNoWalk(()=>{
   box('porphyry',0,0,0,w0*1.32,.26,w0*1.32,P('porphyry'));
   box('dolomite',0,.26,0,w0*1.14,.34,w0*1.14,P('dolomiteD'));
   /* Stepped tapering obelisk shaft in 3 clean ashlar tiers with carved Hum relief band */
   box('dolomite',0,.6,0,w0,shH*.42,w0,P('dolomite'));
   box('carve',0,.6+shH*.42,0,w0*.92,.28,w0*.92,P('carve'));
   box('dolomite',0,.88+shH*.42,0,w0*.84,shH*.58-.28,w0*.84,P('dolomite'));
  });
  slWallBlock(0,0,0,w0,Math.max(.8,.6+shH),w0);
  svNoWalk(()=>{
   const yTop=.6+shH;
   /* Notched masthead fork + bronze pulley sheave */
   for(const sx of [-w0*.28,w0*.28])box('dolomite',sx,yTop,0,w0*.2,0.38,w0*.64,P('dolomite'));
   cyl('bronze',0,yTop+.18,0,.18,.09,P('bronze'),12,undefined);
   cone('gold',0,yTop+.38,0,w0*.26,.22,P('gold'),8);
   /* Suspended nephrite-jade & bronze counterweight bobbin on golden dragline cable */
   const bz=w0*.56,yBob=Math.max(1.3,yTop*.48);
   pole('rope',[0,yTop+.22,bz],[0,yBob+.38,bz],.014,P('silkGold'),6);
   cyl('bronze',0,yBob+.32,bz,.13,.06,P('bronze'),10);
   cyl('jade',0,yBob+.06,bz,.15,.26,P('jade'),12);
   cyl('bronze',0,yBob,bz,.12,.06,P('bronze'),10);
  });
 });
 return y+h-.4;
}

/* SL1: Pleated catenary spider-silk velarium sun-sail over [x0..x1, z0..z1] at mast ring height yTop.
   CLOTHW is strictly [0,0,0] at all four pinned corners so the sail NEVER detaches from its bronze rigging rings! */
function slVelarium(x0,z0,x1,z1,yTop,sag,col,o){
 o=o||{};
 const cx=(x0+x1)/2,cz=(z0+z1)/2,w=x1-x0,d=z1-z0,hw=w/2,hd=d/2;
 const pleats=o.pleats==null?Math.max(3,Math.round(w/2.2)):o.pleats;
 const amp=o.amp==null?.24:o.amp,mk=o.mk||'velarium';
 W(cx,0,cz,0,()=>{
  svNoWalk(()=>{
   for(const sx of [-hw,hw])for(const sz of [-hd,hd]){
    ring('bronze',sx,yTop,sz,.08,.02,P('bronze'),0,0,0,10);
   }
   /* Perimeter dragline-silk edge cables */
   sagRope('rope',[-hw,yTop,-hd],[hw,yTop,-hd],sag*.32,.014,P('silkGold'),8);
   sagRope('rope',[-hw,yTop,hd],[hw,yTop,hd],sag*.32,.014,P('silkGold'),8);
   sagRope('rope',[-hw,yTop,-hd],[-hw,yTop,hd],sag*.32,.014,P('silkGold'),8);
   sagRope('rope',[hw,yTop,-hd],[hw,yTop,hd],sag*.32,.014,P('silkGold'),8);
   withCloth((lp,out)=>{
    const u=clamp((lp.x+hw)/Math.max(.1,w),0,1),v=clamp((lp.z+hd)/Math.max(.1,d),0,1);
    const pw=slSilkMath.cornerPin(u,v)*amp;
    out.set(pw*.18,pw,pw*.22);
   },()=>{
    psurf(mk,(u,v)=>{
     const x=(u-.5)*w,z=(v-.5)*d;
     const cat=4*u*(1-u)*0.55+4*v*(1-v)*0.45;
     const pleat=0.045*Math.sin(u*pleats*TAU)*Math.sin(PI*v);
     return [x,yTop-sag*cat+pleat,z];
    },Math.max(12,pleats*4),12,col,{up:true,colf:o.stripe?(u,v)=>{
     const b=Math.floor(u*pleats)%2===0;
     return b?WHITE:o.stripe;
    }:null});
   });
  });
 });
}

/* SL2: Raked vermilion-and-ebony lacquered cedar King-Mast & stone/bronze perimeter mooring bollard. */
function slKingMast(foot,tip,r){
 svNoWalk(()=>{
  box('dolomite',foot[0],foot[1],foot[2],r*3.2,.24,r*3.2,P('dolomiteD'));
  cyl('bronze',foot[0],foot[1]+.24,foot[2],r*1.35,.12,P('bronze'),10);
 });
 const a=[foot[0],foot[1]+.32,foot[2]];
 beam('lacquer',a,tip,r,P('lacquer'),true,12,r*.68);
 svNoWalk(()=>{
  for(const f of [.28,.56,.82]){
   const px=lerp(a[0],tip[0],f),py=lerp(a[1],tip[1],f),pz=lerp(a[2],tip[2],f);
   sph('ebony',px,py,pz,r*(1.12-.25*f),P('ebony'),.45,10);
  }
  sph('bronze',tip[0],tip[1]+.06,tip[2],r*.95,P('bronze'),.8,10);
  cone('gold',tip[0],tip[1]+.14,tip[2],r*.72,.34,P('gold'),8);
 });
}

function slBollard(x,y,z){
 svNoWalk(()=>{
  box('dolomite',x,y,z,.52,.22,.52,P('dolomiteD'));
  cyl('porphyry',x,y+.22,z,.18,.38,P('porphyry'),10);
  cyl('bronze',x,y+.6,z,.21,.08,P('bronze'),10);
 });
}

/* SL2: Anticlastic Hyperbolic-Paraboloid ("Lotus-Saddle") amber-waxed heavy spider-silk roof.
   High peaks at (-rx,-rz) and (+rx,+rz) carried by raked vermilion cedar King-Masts; low valleys at (-rx,+rz) and (+rx,-rz)
   guyed to perimeter bronze/porphyry bollards by golden dragline cables, plus floating crimson crown-cap! */
function slHyparCanopy(cx,cz,rx,rz,yFoot,yLow,yHigh,col,o){
 o=o||{};
 const amp=o.amp==null?.26:o.amp,sag=o.sag==null?.18:o.sag,bollardY=o.bollardY==null?0:o.bollardY;
 W(cx,0,cz,0,()=>{
  /* Two raked King-Masts leaning outward to the high peaks (-rx, yHigh, -rz) and (+rx, yHigh, +rz) */
  const mIn=.72,mr=o.mastR==null?.16:o.mastR;
  slKingMast([-rx*mIn,yFoot,-rz*mIn],[-rx,yHigh,-rz],mr);
  slKingMast([rx*mIn,yFoot,rz*mIn],[rx,yHigh,rz],mr);
  /* Two perimeter mooring bollards outside the low valleys (-rx, +rz) and (+rx, -rz) */
  const bx=rx*1.16,bz=rz*1.16;
  slBollard(-bx,bollardY,bz);
  slBollard(bx,bollardY,-bz);
  svNoWalk(()=>{
   /* Golden dragline guy-cables from low saddle tips down to bollards, and ridge/edge tension cables */
   pole('rope',[-rx,yLow,rz],[-bx,bollardY+.64,bz],.016,P('silkGold'),6);
   pole('rope',[rx,yLow,-rz],[bx,bollardY+.64,-bz],.016,P('silkGold'),6);
   sagRope('rope',[-rx,yHigh,-rz],[-rx,yLow,rz],.14,.014,P('silkGold'),10);
   sagRope('rope',[rx,yHigh,rz],[rx,yLow,-rz],.14,.014,P('silkGold'),10);
   sagRope('rope',[-rx,yHigh,-rz],[rx,yLow,-rz],.14,.014,P('silkGold'),10);
   sagRope('rope',[-rx,yLow,rz],[rx,yHigh,rz],.14,.014,P('silkGold'),10);
   /* Main anticlastic hyperbolic-paraboloid silk broadcloth: strictly [0,0,0] at all 4 mast/guy corners! */
   withCloth((lp,out)=>{
    const u=clamp((lp.x+rx)/(2*rx),0,1),v=clamp((lp.z+rz)/(2*rz),0,1);
    const pw=slSilkMath.cornerPin(u,v)*amp;
    out.set(pw*.16,pw,pw*.16);
   },()=>{
    psurf('silk',(u,v)=>{
     const x=(2*u-1)*rx,z=(2*v-1)*rz;
     return [x,slSilkMath.hyparY(u,v,yLow,yHigh,sag),z];
    },16,16,col==null?P('silkAmber'):col,{up:true});
   });
   /* Floating crimson crown-cap suspended 0.36 m cleanly above the saddle center (zero overlap!) */
   if(o.crown!==false){
    const crx=rx*.36,crz=rz*.36,cy0=0.5*(yHigh+yLow)+.38;
    sagRope('rope',[-rx,yHigh,-rz],[-crx,cy0,-crz],.03,.01,P('silkGold'),4);
    sagRope('rope',[rx,yHigh,rz],[crx,cy0,crz],.03,.01,P('silkGold'),4);
    sagRope('rope',[-rx,yLow,rz],[-crx,cy0,crz],.03,.01,P('silkGold'),4);
    sagRope('rope',[rx,yLow,-rz],[crx,cy0,-crz],.03,.01,P('silkGold'),4);
    withCloth((lp,out)=>{
     const u=clamp((lp.x+crx)/(2*crx),0,1),v=clamp((lp.z+crz)/(2*crz),0,1);
     const pw=slSilkMath.cornerPin(u,v)*(amp*.65);
     out.set(pw*.15,pw,pw*.15);
    },()=>{
     psurf('velarium',(u,v)=>[
      (2*u-1)*crx,
      cy0+.28*Math.sin(PI*u)*Math.sin(PI*v),
      (2*v-1)*crz
     ],8,8,P('silkCrimson'),{up:true});
    });
   }
  });
 });
}

/* SL3: Open-rafter cedar Hum Spider-Loft Wind-Scoop Tower with acoustic louver slats & colonial spider orb-webs in rafters! */
function slSpiderLoft(cx,yBase,cz,w,d,h,o){
 o=o||{};
 const hw=w/2-.12,hd=d/2-.12,postH=h-.52;
 W(cx,yBase,cz,0,()=>{
  svNoWalk(()=>{
   /* Curb sill */
   for(const sz of [-hd,hd])box('cedar',0,0,sz,w-.1,.14,.14,P('cedarD'));
   for(const sx of [-hw,hw])box('cedar',sx,.14,0,.14,.1,d-.1,P('cedarD'));
   /* 4 corner vermilion-lacquered cedar wind-scoop posts */
   for(const sx of [-hw,hw])for(const sz of [-hd,hd]){
    box('lacquer',sx,.24,sz,.13,postH,.13,P('lacquer'));
   }
   /* Open acoustic cedar louver slats along front/back wind-scoop mouths */
   const nl=Math.max(2,Math.floor((postH-.3)/.28));
   for(let i=0;i<nl;i++){
    const ly=.42+i*.26;
    for(const sz of [-hd,hd])box('cedar',0,ly,sz+(sz>0?.02:-.02),w-.46,.04,.12,P('cedar'),0,sz>0?.32:-.32,0);
   }
   /* Upper rafter grid & delicate colonial spider silk orb-web sheets pinned [0,0,0] on all 4 rafter edges! */
   const yR=.24+postH;
   for(let i=-1;i<=1;i++)beam('cedar',[-hw,yR-.08,i*hd*.55],[hw,yR-.08,i*hd*.55],.07,P('cedar'),false);
   for(const sz of [-hd*.45,hd*.45]){
    withCloth((lp,out)=>{
     const u=clamp((lp.x+hw*.85)/(1.7*hw),0,1),v=clamp((yR-.08-lp.y)/Math.max(.2,postH*.55),0,1);
     const pw=Math.sin(PI*u)*Math.sin(PI*v)*.08;
     out.set(0,0,pw);
    },()=>{
     psurf('veil',(u,v)=>[
      (u-.5)*1.7*hw,
      yR-.1-v*postH*.52,
      sz+.03*Math.sin(PI*u)*Math.sin(PI*v)
     ],6,5,P('silkIvory'),{flip:true});
    });
   }
  });
  slHipRoof(0,.24+postH,0,w,d,.56,{mk:o.roofMk||'celadon',over:.38});
 });
 return yBase+h+.38;
}

/* SL3: Tensioned indigo-and-gold Shamiyana canopy awning on slender lacquered poles. */
function slShamiyana(x0,z0,x1,z1,yFoot,yEave,yPeak,col,o){
 o=o||{};
 const cx=(x0+x1)/2,cz=(z0+z1)/2,w=x1-x0,d=z1-z0,hw=w/2,hd=d/2;
 W(cx,0,cz,0,()=>{
  for(const sx of [-hw+.08,hw-.08])for(const sz of [-hd+.08,hd-.08]){
   if(o.skipBackPoles&&sz<0)continue;
   cyl('dolomite',sx,yFoot,sz,.13,.14,P('dolomiteD'),8);
   cyl('lacquer',sx,yFoot+.14,sz,.055,yEave-yFoot-.14,P('lacquer'),8);
   sph('bronze',sx,yEave+.03,sz,.065,P('bronze'),.8,8);
  }
  svNoWalk(()=>{
   withCloth((lp,out)=>{
    const u=clamp((lp.x+hw)/Math.max(.1,w),0,1),v=clamp((lp.z+hd)/Math.max(.1,d),0,1);
    const pw=slSilkMath.cornerPin(u,v)*.2;
    out.set(pw*.15,pw,pw*.18);
   },()=>{
    psurf('shamiyana',(u,v)=>{
     const x=(u-.5)*w,z=(v-.5)*d;
     const arch=(yPeak-yEave)*Math.sin(PI*u)*Math.sin(PI*v);
     return [x,yEave+arch,z];
    },10,10,col==null?P('silkIndigo'):col,{up:true});
   });
   /* Gold-trimmed hanging valance along front +z edge, pinned [0,0,0] at y = yEave */
   const vDrop=.32;
   withCloth((lp,out)=>{
    const v=clamp((yEave-lp.y)/vDrop,0,1),pw=slSilkMath.hangPin(v)*.1;
    out.set(0,0,pw);
   },()=>{
    psurf('silk',(u,v)=>[
     (u-.5)*(w-.12),
     yEave-v*vDrop-.02*Math.abs(Math.sin(u*PI*6))*v,
     hd+.015
    ],14,3,P('silkSaffron'),{flip:true});
   });
  });
 });
}

/* SL3: Evaporative vertical overlapping silk wind-veils dipping into a carved dolomite perimeter water-trough! */
function slWindVeils(x0,z0,x1,z1,yFloor,yTop,o){
 o=o||{};
 const L=Math.hypot(x1-x0,z1-z0);if(L<.6)return;
 const yaw=Math.atan2(z0-z1,x1-x0),nPanels=Math.max(2,Math.round(L/.85));
 W((x0+x1)/2,yFloor,(z0+x1*0+z1)/2,yaw,()=>{
  svNoWalk(()=>{
   /* Carved dolomite water-trough along the base (non-overlapping walls + water surface) */
   const tw=.42;
   box('dolomite',0,0,0,L,.06,tw,P('dolomiteD'));
   for(const sz of [-tw/2+.04,tw/2-.04])box('dolomite',0,.06,sz,L,.2,.08,P('dolomite'));
   for(const sx of [-L/2+.04,L/2-.04])box('dolomite',sx,.06,0,.08,.2,tw-.16,P('dolomite'));
   box('water',0,.06,0,L-.16,.15,tw-.16,P('water'));
   /* Top bronze curtain rail */
   const hBar=yTop-yFloor;
   pole('bronze',[-L/2,hBar,0],[L/2,hBar,0],.022,P('bronze'),8);
   const yHem=.18,drop=hBar-yHem,pw0=(L-.12)/nPanels;
   for(let i=0;i<nPanels;i++){
    const cx=-L/2+.06+(i+.5)*pw0,zOff=(i%2===0?-.035:.035);
    const vCol=i%3===0?P('silkIvory'):i%3===1?P('silkCeladon'):P('silkTurquoise');
    withCloth((lp,out)=>{
     const v=clamp((hBar-lp.y)/Math.max(.2,drop),0,1),pw=slSilkMath.hangPin(v)*.22;
     out.set(pw*.2,0,pw);
    },()=>{
     psurf('veil',(u,v)=>[
      cx+(u-.5)*(pw0*1.08),
      hBar-v*drop,
      zOff+.015*Math.sin(PI*u)*v
     ],4,8,vCol,{flip:true});
    });
   }
  });
 });
}

/* SL4: Glowing oiled-silk cocoon lantern suspended from (x, yTop, z), lighting canals and colonnades at --night. */
function slCocoonLantern(x,yTop,z,drop,big){
 drop=drop==null?.55:drop;
 const r=big?.19:.13,lh=big?.44:.32,yc=yTop-drop;
 svNoWalk(()=>{
  pole('rope',[x,yTop,z],[x,yc+lh*.5,z],.008,P('silkGold'),5);
  cyl('bronze',x,yc+lh*.46,z,r*.52,.04,P('bronze'),8);
  ellip('cocoon',x,yc,z,r,lh*.5,r,P('cocoonLit'),0,10);
  sph('glow',x,yc,z,r*.58,0xffcf70,1.2,8);
  cyl('bronze',x,yc-lh*.52,z,r*.44,.04,P('bronze'),8);
  pole('silk',[x,yc-lh*.52,z],[x,yc-lh*.85,z],.016,P('silkCrimson'),5);
 });
 haloAt(x,yc,z,0xffc868,!!big);
}

/* SL4: Cedar pergola parasol over [x0..x1, z0..z1] with bamboo/silk sun-strips and cocoon lanterns. */
function slPergola(x0,z0,x1,z1,y0,h,o){
 o=o||{};
 const cx=(x0+x1)/2,cz=(z0+z1)/2,w=x1-x0,d=z1-z0,hw=w/2-.15,hd=d/2-.15;
 W(cx,y0,cz,0,()=>{
  for(const sx of [-hw,hw])for(const sz of [-hd,hd]){
   box('dolomite',sx,0,sz,.24,.18,.24,P('dolomiteD'));
   box('cedar',sx,.18,sz,.15,h-.18,.15,P('cedar'));
  }
  svNoWalk(()=>{
   for(const sz of [-hd,hd])box('lacquer',0,h,sz,w+.24,.12,.14,P('lacquer'));
   const nr=Math.max(4,Math.round(w/.75));
   for(let i=0;i<=nr;i++){
    const xx=lerp(-w/2,w/2,i/nr);
    box('cedar',xx,h+.12,0,.07,.08,d+.32,P('cedarD'));
   }
   /* Woven silk shade strips draped over the rafters */
   const ns=Math.max(2,Math.round(d/1.6));
   for(let j=0;j<ns;j++){
    const zz=lerp(-hd*.78,hd*.78,ns===1?.5:j/(ns-1)),sc=j%2===0?P('silkSaffron'):P('silkIvory');
    withCloth((lp,out)=>{
     const u=clamp((lp.x+hw)/(2*hw),0,1),pw=slSilkMath.spanPin(u)*.14;
     out.set(0,pw,pw*.3);
    },()=>{
     psurf('silk',(u,v)=>[
      (u-.5)*2*hw,
      h+.21-.09*Math.sin(PI*u),
      zz+(v-.5)*.68
     ],12,3,sc,{up:true});
    });
   }
   if(o.lanterns!==false){
    slCocoonLantern(-hw+.2,h,hd,.48,false);
    slCocoonLantern(hw-.2,h,hd,.48,false);
   }
  });
 });
}

/* SL4: 15-22 m catenary/hanging dyed spider-silk streamer draped between drying-tower crossbars a and b!
   Strictly [0,0,0] pin-weights at both crossbar ends u=0 and u=1 so the bolt never detaches under gusts. */
function slSilkBolt(a,b,width,sag,col){
 const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],span=Math.hypot(dx,dz);
 if(span<.2)return;
 const yaw=Math.atan2(-dz,dx);
 W(a[0],0,a[2],yaw,()=>{
  svNoWalk(()=>{
   pole('cedar',[0,a[1],-width*.58],[0,a[1],width*.58],.035,P('cedarD'),6);
   pole('cedar',[span,b[1],-width*.58],[span,b[1],width*.58],.035,P('cedarD'),6);
   withCloth((lp,out)=>{
    const u=clamp(lp.x/span,0,1),pw=slSilkMath.spanPin(u)*.42;
    out.set(pw*.12,pw*.35,pw);
   },()=>{
    psurf('streamer',(u,v)=>{
     const x=u*span,yBase=lerp(a[1],b[1],u)-sag*4*u*(1-u);
     const ripple=.035*Math.sin(v*PI*3)*Math.sin(PI*u);
     return [x,yBase+ripple,(v-.5)*width];
    },22,5,col,{up:true});
   });
  });
 });
}
