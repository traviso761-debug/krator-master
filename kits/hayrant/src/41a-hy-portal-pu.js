// prefix: hy
// ================================================================= KANOPI FORMLINE FRIEZES, OVOID PORTALS, GALE-COBBLE ROOFS & PU CACHES (PLAN.md §3 & §4)
//   hyFormlineFrieze(x, y, z, w, h, yaw, o)       Censorate-compliant sleeping-eye formline gable/architrave boards
//   hyFormlineTympanum(x, y, z, w, rise, yaw, o)  Sleeping-eye triangular gable & yaodong arch tympanums
//   hyOvoidPortal(x, y, z, w, h, yaw, o)          Highland ovoid ancestor-collar doorway crowned by a closed-eye Eternian head
//   hyGaleCobbleRoof(x, y, z, w, d, rise, yaw, o) Adzed fur-larch plank roof weighted with strapped katabatic gale-cobbles
//   hyPuCache(x, y, z, w, d, yaw, o)              Elevated fur-larch pu store-box on basalt posts w/ megabreccia marmot baffles

/* Censorate-compliant sleeping-eye formline frieze board in Cyber-Hayrant PCB-trace lacquer, birch-tarred fur-larch, cave-madder red & celadon/nephrite. */
function hyFormlineFrieze(x,y,z,w,h,yaw,o){
 o=o||{};
 const backMk=o.cyberMk||(Math.round(Math.abs(x*7+z*13))%2===0?'cyberForm':'cyberFormC');
 const backCol=hyTotemMatCol(backMk),tertMk=o.tertiary||'celadon';
 const cutW=o.cutW==null?0:o.cutW,cutH=o.cutH==null?0:o.cutH;
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   if(cutW<=0){
    box(backMk,0,0,.012,w,h,.024,backCol);
   }else{
    const topH=h-cutH;
    if(topH>.08)box(backMk,0,cutH,.012,w,topH,.024,backCol);
    const sideW=(w-cutW)/2;
    if(sideW>.08&&cutH>.04){
     for(const sx of [-1,1])box(backMk,sx*(cutW/2+sideW/2),0,.012,sideW,cutH-.004,.024,backCol);
    }
   }
   const zF=.024,brd=Math.min(.09,h*.14);
   hyFormLayerBox('tarwood',0,h-brd,zF,1,w,brd,P('tarwood'));
   for(const sx of [-1,1]){
    hyFormLayerBox('tarwood',sx*(w/2-brd/2),brd+.006,zF,1,brd,h-2*brd-.012,P('tarwood'));
   }
   if(cutW<=0){
    hyFormLayerBox('tarwood',0,0,zF,1,w-2*brd-.012,brd,P('tarwood'));
   }else{
    const segW=(w-cutW)/2-brd-.012;
    if(segW>.10){
     for(const sx of [-1,1])hyFormLayerBox('tarwood',sx*(cutW/2+segW/2+.006),0,zF,1,segW,brd,P('tarwood'));
    }
   }
   const bandY0=Math.max(cutH+.04,brd+.05),bandH=h-brd-bandY0-.05;
   if(bandH>.20){
    const ovW=Math.min(w*.24,1.15),ovH=Math.min(bandH*.82,.62);
    if(w>=1.6){
     const ox=Math.min(w*.22,ovW*.74+.14);
     for(const sx of [-1,1]){
      hySleepingOvoid(sx*ox,bandY0+(bandH-ovH)*.5,zF,ovW,ovH,{tertiary:tertMk,slitMk:'bronze'});
     }
     const midGap=2*ox-ovW-.06;
     if(midGap>.10){
      hyFormLayerBox('kaen',0,bandY0+bandH*.26,zF,2,midGap,bandH*.48,P('plaid'));
      hyFormLayerBox('nephrite',0,bandY0+bandH*.38,zF,3,midGap*.54,bandH*.24,P('nephrite'));
     }
     const outIn=ox+ovW/2+.08,outLim=w/2-brd-.06,uW=outLim-outIn;
     if(uW>.26){
      for(const sx of [-1,1]){
       hyUFormRelief(sx*(outIn+uW/2),bandY0+bandH*.14,zF,uW,bandH*.72,sx<0?'left':'right',1,'tarwood',P('tarwood'),tertMk);
      }
     }
    }else{
     hySleepingOvoid(0,bandY0+(bandH-ovH)*.5,zF,Math.min(w*.66,.88),ovH,{tertiary:tertMk});
    }
   }
  });
 });
}

/* Censorate-compliant sleeping-eye triangular gable tympanum or stepped yaodong arch tympanum. */
function hyFormlineTympanum(x,y,z,w,rise,yaw,o){
 o=o||{};
 const backMk=o.backMk||'loess',tertMk=o.tertiary||'nephrite';
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   if(o.arch){
    box('cyberFormB',0,0,.012,w*.92,rise*.48,.024,hyTotemMatCol('cyberFormB'));
    box('cyberFormC',0,rise*.48+.004,.012,w*.66,rise*.32,.024,hyTotemMatCol('cyberFormC'));
    box('totemWood',0,rise*.80+.008,.014,w*.38,rise*.16,.028,P('totemWood'));
   }else{
    WX(0,0,0,0,PI/2,0,()=>{
     prism(backMk,[[-w/2,0],[0,-rise],[w/2,0]],0,.024,P(backMk));
    });
    const ang=Math.atan2(rise,w*.5),rafterL=Math.hypot(w*.5,rise);
    for(const sx of [-1,1]){
     W(sx*w*.25,rise*.5,.036,0,()=>{
      WX(0,0,0,0,0,-sx*ang,()=>box('tarwood',0,-.032,0,rafterL*.94,.064,.018,P('tarwood')));
     });
    }
   }
   const zF=.024;
   const ovW=Math.min(w*.34,1.35),ovH=Math.min(rise*.50,.56);
   if(ovW>.24&&ovH>.18){
    hySleepingOvoid(0,rise*.09,zF,ovW,ovH,{tertiary:tertMk,slitMk:'bronze'});
    const fw=Math.min(w*.17,.82),fx=ovW/2+fw/2+.08;
    if(fx+fw/2<w*.34&&rise*.34>.16){
     for(const sx of [-1,1]){
      hyUFormRelief(sx*fx,rise*.06,zF,fw,rise*.32,sx<0?'left':'right',1,'tarwood',P('tarwood'),tertMk);
     }
    }
   }
  });
 });
}

/* Highland Ovoid Ancestor-Collar Portal (cousin of Timpar-Kuran oval totem-mouth doorway):
   carved adzed totemWood & emerald-nephrite ovoid collar surround flanked by carved cheek piers and crowned by a closed-eye Eternian head/mask. */
function hyOvoidPortal(x,y,z,w,h,yaw,o){
 o=o||{};
 const t=o.t==null?HY.WALL:o.t,surroundOnly=!!o.surroundOnly;
 const zFront=surroundOnly?.04:t/2+.04;
 const headMk=o.headMk||'bronze';
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   const pierW=.24,pierX=w/2+pierW*.5+.04;
   for(const sx of [-1,1]){
    box('ashlar',sx*pierX,0,zFront-.02,pierW+.06,.32,.22,P('ashlar'));
    box('totemWood',sx*pierX,.32,zFront-.02,pierW,h-.20,.18,P('totemWood'));
    hySleepingOvoid(sx*pierX,h*.36,zFront+.07,pierW*.86,.46,{tertiary:'nephrite',slitMk:'bronze'});
   }
   /* Carved adzed totemWood & nephrite brow lintel bridging the cheek piers */
   box('totemWood',0,h+.12,zFront-.01,w+pierW*2+.16,.28,.22,P('totemWood'));
   box('nephrite',0,h+.40,zFront+.01,w+pierW*1.6,.12,.24,P('nephrite'));
   /* Segmented ovoid lip-collar around the doorway (even & odd segments alternate z by 2.2 cm so adjacent angled blocks NEVER z-fight!) */
   const rx=w*.54,ry=h*.46,yMid=h*.50;
   for(let i=0;i<10;i++){
    const a=PI*.08+(i+.5)*(PI*.84/10);
    const ox=Math.cos(a)*rx,oy=yMid+Math.sin(a)*ry;
    const isJade=i%2===0;
    const zSeg=zFront+(isJade?.095:.118);
    box(isJade?'nephrite':'kaen',ox,oy-.08,zSeg,.20,.15,.034,isJade?P('nephrite'):P('plaid'),0,0,a-PI/2);
   }
   /* Serene closed-eye Eternian ancestor head or mask crowning the ovoid brow */
   if(o.fullHead){
    hyAncestorHead(0,h+.52,zFront+.08,0,o.headSize==null?.58:o.headSize,{mk:headMk,plinth:.10});
   }else{
    hyDoorMask(0,h+.74,zFront+.08,0,o.maskSize==null?.46:o.maskSize,headMk);
   }
  });
  if(!surroundOnly){
   if(o.open!==true){
    svLeaf(0,.02,0,0,w-.04,h-.04,{
     mk:o.leafMk||'larch',col:o.leafCol==null?P('larch'):o.leafCol,
     style:o.style||'plank',hwCol:0xa87e42,locked:!!o.locked,name:o.name||null
    });
   }
   door(0,0,t/2,0,w,h);
  }
 });
}

/* Adzed fur-larch plank gable roof weighted with purlin poles & strapped megabreccia/basalt katabatic gale-cobbles. */
function hyGaleCobbleRoof(x,y,z,w,d,rise,yaw,o){
 o=o||{};
 const overX=o.over==null?.26:o.over,overZ=o.overZ==null?.26:o.overZ;
 const roofMk=o.mk||'larch',gableMk=o.gableMk||'loess';
 const hw=w*.5+overX,lenZ=d+2*overZ,ang=Math.atan2(rise,hw);
 const slopeSpan=Math.hypot(hw,rise)-.08;
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   if(o.posts){
    const py0=o.postY0==null?0:o.postY0,ph=y-py0;
    if(ph>.15){
     const zs=d>1.8?[-d*.42,d*.42]:[d*.38];
     for(const sx of [-w*.44,w*.44])for(const sz of zs){
      cyl('basalt',sx,-ph,sz,.14,.14,P('basaltD'),8);
      cyl('larch',sx,-ph+.14,sz,.085,ph-.14,P('larch'),8);
     }
     box('tarwood',0,-.10,0,w,.10,d*.92,P('tarwood'));
    }
   }
   /* Recessed gable-end infills at +/-z so slopes overhang cleanly without touching */
   if(o.gableFill){
    const gw=Math.max(.4,w-.16),gr=Math.max(.2,rise-.08);
    for(const sz of [-d*.5+.10,d*.5-.10]){
     WX(0,0,sz,0,PI/2,0,()=>{
      prism(gableMk,[[-gw/2,0],[0,-gr],[gw/2,0]],-.08,.08,P(gableMk));
     });
    }
   }
   /* Left & right adzed plank slopes (stopped 4 cm short of x=0 so they never intersect at the ridge!) */
   for(const sx of [-1,1]){
    const mx=sx*(hw*.5+.03),my=rise*.5-.02;
    W(mx,my,0,0,()=>{
     WX(0,0,0,0,0,-sx*ang,()=>{
      box(roofMk,0,0,0,slopeSpan,.085,lenZ,P(roofMk));
      /* Longitudinal tarwood wind-purlins sitting proud on the slope */
      for(const pf of [-.24,.22]){
       box('tarwood',pf*slopeSpan,.088,0,.075,.068,lenZ+.06,P('tarwood'));
       /* Strapped megabreccia & basalt katabatic gale-cobbles along each purlin */
       const nCob=Math.max(2,Math.round(lenZ/1.15));
       for(let ci=0;ci<nCob;ci++){
        const cz=-lenZ*.40+(nCob===1?0:ci/(nCob-1))*lenZ*.80;
        const cMk=(ci+(sx>0?1:0))%2===0?'megabreccia':'basalt';
        cyl(cMk,pf*slopeSpan,.158,cz,.145,.105,P(cMk),7,.115);
        box('rope',pf*slopeSpan,.265,cz,.16,.018,.045,P('rope'));
       }
      }
     });
    });
   }
   /* Heavy tarwood ridge-tree beam & bronze end-caps */
   box('tarwood',0,rise+.04,0,.18,.12,lenZ+.12,P('tarwood'));
   for(const sz of [-lenZ*.5-.06,lenZ*.5+.06]){
    box('bronze',0,rise+.05,sz,.20,.14,.04,P('bronze'));
   }
  });
 });
 return y+rise+.22;
}

/* Elevated adzed fur-larch store-box (pu) on 4 tapered basalt posts with circular megabreccia stone-mushroom marmot baffles. */
function hyPuCache(x,y,z,w,d,yaw,o){
 o=o||{};
 const legH=o.legH==null?1.26:o.legH,rPost=o.rPost==null?.15:o.rPost;
 const rBaf=hyRigMath.puBaffleRadius(rPost);
 const boxH=o.boxH==null?1.42:o.boxH,rise=o.rise==null?.78:o.rise;
 const bw=Math.max(1.4,w-.36),bd=Math.max(1.4,d-.44);
 const px=Math.max(.36,bw*.35),pz=Math.max(.36,bd*.34);
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   /* 4 tapered basalt posts crowned with wide flat circular megabreccia nezumi-gaeshi marmot-baffle discs */
   for(const sx of [-1,1])for(const sz of [-1,1]){
    const cx=sx*px,cz=sz*pz;
    cyl('basalt',cx,0,cz,rPost*1.42,.11,P('basaltD'),8);
    cyl('basalt',cx,.11,cz,rPost,legH-.22,P('basalt'),10,rPost*.76);
    cyl('megabreccia',cx,legH-.11,cz,rBaf,.11,P('megabreccia'),14);
   }
   /* Tarwood sill-bearers & overhanging fur-larch plank floor deck */
   for(const sx of [-px,px])box('tarwood',sx,legH,0,.15,.11,bd+.12,P('tarwood'));
   const yDeck=legH+.11;
   box('larch',0,yDeck,.05,bw+.08,.08,bd+.22,P('larch'));

   /* Adzed fur-larch store-box walls with disjoint tarwood corner posts */
   const yBox=yDeck+.08,cp=.12;
   for(const sx of [-1,1])for(const sz of [-1,1]){
    box('tarwood',sx*(bw/2-cp/2),yBox,sz*(bd/2-cp/2),cp,boxH,cp,P('tarwood'));
   }
   for(const sz of [-bd/2+cp/2,bd/2-cp/2]){
    box('larch',0,yBox,sz,bw-2*cp-.012,boxH,.09,P('larch'));
   }
   for(const sx of [-bw/2+cp/2,bw/2-cp/2]){
    box('larch',sx,yBox,0,.09,boxH,bd-2*cp-.012,P('larchD'));
   }
   /* Raised plank hatch & closed-eye door mask on +z front */
   const zFront=bd/2+.01,hatchW=Math.min(.78,bw*.44),hatchH=Math.min(.92,boxH*.64);
   box('tarwood',0,yBox+.10,zFront+.014,hatchW+.12,hatchH+.10,.022,P('tarwood'));
   box('planks',0,yBox+.14,zFront+.034,hatchW,hatchH,.018,P('planks'));
   box('bronze',hatchW*.34,yBox+.14+hatchH*.5,zFront+.052,.07,.10,.018,P('bronze'));
   hyDoorMask(0,yBox+boxH-.22,zFront+.02,0,.28,o.maskMk||'lead');

   /* Sleeping-eye formline gable tympanum, gale-cobbled roof, inau wands & notched larch step-log */
   WX(0,yBox+boxH,-bd/2+.05,0,PI/2,0,()=>prism('larch',[[-bw/2+.04,0],[0,-rise+.06],[bw/2-.04,0]],-.04,.04,P('larch')));
   hyFormlineTympanum(0,yBox+boxH+.005,bd/2+.015,bw-.08,rise-.06,0,{backMk:'larch',tertiary:'nephrite'});
   hyGaleCobbleRoof(0,yBox+boxH,0,bw+.16,bd+.20,rise,0,{mk:'bark',gableFill:false,over:.22,overZ:.26});
   hyInauCluster(-bw*.42,yBox+boxH-.20,bd/2+.08,0,{scale:.56});
   /* Notched fur-larch step-log stopping 14 cm short of sill lip so marmots cannot climb across */
   const zFoot=d*.47,zTop=bd*.5+.26,yTop=legH-.02;
   beam('larch',[0,.04,zFoot],[0,yTop,zTop],.15,P('larchD'),false,6);
   for(let ni=1;ni<=4;ni++){
    const f=ni/5;
    box('tarwood',0,lerp(.04,yTop,f)+.06,lerp(zFoot,zTop,f),.24,.04,.09,P('tarwood'));
   }
  });
  if(o.wallBlock!==false)hyWallBlock(0,0,0,bw+.12,legH+boxH,bd+.12);
 });
 return y+legH+.19+boxH+rise+.22;
}
