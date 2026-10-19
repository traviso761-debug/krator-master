// ================================================================= CORE — walk records from drawn boxes
// For kits that build their houses straight from boxes and declare no floors or stairs (the Scyvoi engine: Islanders,
// Lizardmen). Each upright box the builder draws is read as what it is to a walker, so the registry holds what was drawn:
//   a flat box (<= 0.7 m thick, at least 0.25 m across and 0.2 m2)  -> a level floor at its top: a deck, a slab, a stair TREAD
//   a tall box (>= 0.7 m, not a floor)                              -> a block: a wall segment, a post, a column (a panel of salvage
//                                                                      0.04 m thick counts if it is 0.4 m long; a 0.1 m jamb or rail post is trim)
// so a flight of treads is a flight (each tread 0.2 m over the last, inside floorBelow's step), a door is a gap between
// wall boxes, and nothing is declared twice. A tilted box (a roof panel, a rafter) is neither. Plain maths, no THREE:
//   KWALKBOX.add(W, e, o)   W a KWALK registry; e the box's 16 column-major world matrix elements, the unit cube [-.5,.5]^3
//                           scaled and placed (a THREE.Matrix4's .elements); o: { tag }  -> 'floor' | 'block' | null
//   KWALKBOX.ladder(W, foot, top, o)   a climb the boxes cannot show: foot [x,z], top [x,z,y]; o: { footY, w .55, tag }. A shallow
//                           one is a strip, a steep one a stack of rung floors 0.45 m apart (the host's walker climbs by stepping)
// Tuning in KWALKBOX.T (metres). A rotated wall is cut into blocks along its length, so a doorway between two turned
// wall boxes keeps its width.
(function(root){
  'use strict';
  var T={flatMax:.7,minAcross:.25,minArea:.2,blockMin:.7,thinMin:.1,panelLong:.4,panelMin:.04,upright:.94,cut:.3,maxCuts:240,ladderSlope:3.5,rung:.45};
  function add(W,e,o){
    o=o||{};var ax=[e[0],e[1],e[2]],ay=[e[4],e[5],e[6]],az=[e[8],e[9],e[10]],c=[e[12],e[13],e[14]];
    var sx=Math.hypot(ax[0],ax[1],ax[2]),sy=Math.hypot(ay[0],ay[1],ay[2]),sz=Math.hypot(az[0],az[1],az[2]);
    if(sx<1e-6||sy<1e-6||sz<1e-6)return null;
    if(Math.abs(ay[1])/sy<T.upright)return null;                                    /* tilted: a roof, not a floor or a wall */
    var dy=Math.abs(ay[1]),bot=c[1]-dy/2,top=c[1]+dy/2,tag=o.tag||'';
    /* the footprint corners, in the plan */
    var hx=[ax[0]/2,ax[2]/2],hz=[az[0]/2,az[2]/2];
    var P=[[c[0]-hx[0]-hz[0],c[2]-hx[1]-hz[1]],[c[0]+hx[0]-hz[0],c[2]+hx[1]-hz[1]],[c[0]+hx[0]+hz[0],c[2]+hx[1]+hz[1]],[c[0]-hx[0]+hz[0],c[2]-hx[1]+hz[1]]];
    var lx=Math.hypot(ax[0],ax[2]),lz=Math.hypot(az[0],az[2]);                       /* plan lengths along the box's two axes */
    var thin=Math.min(lx,lz);
    if(dy<=T.flatMax&&thin>=T.minAcross&&lx*lz>=T.minArea){
      W.poly({pts:P.map(function(p){return [p[0],p[1],top];}),name:'box',tag:tag});return 'floor';}
    if(dy>=T.blockMin&&(thin>=T.thinMin||(Math.max(lx,lz)>=T.panelLong&&thin>=T.panelMin))){
      var minx=Math.min(P[0][0],P[1][0],P[2][0],P[3][0]),maxx=Math.max(P[0][0],P[1][0],P[2][0],P[3][0]),minz=Math.min(P[0][1],P[1][1],P[2][1],P[3][1]),maxz=Math.max(P[0][1],P[1][1],P[2][1],P[3][1]);
      var turned=Math.abs(ax[0]*ax[2])+Math.abs(az[0]*az[2])>1e-3*(lx*lx+lz*lz);
      if(!turned){W.block([minx,maxx,minz,maxz,bot,top],tag);return 'block';}
      /* turned: blocks along the long side, each as thick as the short side (at least the cut) */
      var long=lx>=lz,L=long?lx:lz,t=Math.max(thin,T.cut),u=long?[ax[0]/lx,ax[2]/lx]:[az[0]/lz,az[2]/lz],n=Math.min(T.maxCuts,Math.max(1,Math.ceil(L/T.cut))),h=t/2;
      for(var i=0;i<n;i++){var s=(i+.5)/n-.5,x=c[0]+u[0]*L*s,z=c[2]+u[1]*L*s;W.block([x-h,x+h,z-h,z+h,bot,top],tag);}
      return 'block';
    }
    return null;
  }
  /* a climb: foot [x,z] (at o.footY, the ground there), top [x,z,y]. A shallow one (a stair-like ladder, rise/run <= 3.5) is a strip. A steep one
     cannot be a strip (the walker steps up 0.7 m a frame), so it is a stack of rung floors 0.45 m apart on the climb line: walking
     into the foot climbs it a rung a frame, and the top rung meets the floor above. */
  function ladder(W,foot,top,o){
    o=o||{};var w=o.w||.55,fy=o.footY==null?0:o.footY,tag=o.tag||'ladder',dx=top[0]-foot[0],dz=top[1]-foot[1],run=Math.hypot(dx,dz),rise=top[2]-fy;
    if(rise<=0)return null;
    var ux0=run>1e-6?dx/run:0,uz0=run>1e-6?dz/run:1,tpx=-uz0,tpz=ux0;
    /* the landing: the climber steps off the top onto whatever floor is beyond, so the top is a floor 0.35 m either side of the top rung (a ladder
       ends at the edge of a deck and the deck's edge is not always exactly there) */
    W.poly({pts:[[top[0]-ux0*.35-tpx*w/2,top[1]-uz0*.35-tpz*w/2,top[2]],[top[0]+ux0*.35-tpx*w/2,top[1]+uz0*.35-tpz*w/2,top[2]],[top[0]+ux0*.35+tpx*w/2,top[1]+uz0*.35+tpz*w/2,top[2]],[top[0]-ux0*.35+tpx*w/2,top[1]-uz0*.35+tpz*w/2,top[2]]],name:'landing',tag:tag});
    if(run>1e-6&&rise/run<=T.ladderSlope)return W.strip({a:[foot[0],foot[1],fy],b:[top[0],top[1],top[2]],w:w,name:'ladder',tag:tag});
    var ux=run>1e-6?dx/run:0,uz=run>1e-6?dz/run:1,px=-uz,pz=ux,n=Math.max(2,Math.ceil(rise/T.rung));
    for(var i=1;i<=n;i++){var u=i/n,cx=foot[0]+dx*u,cz=foot[1]+dz*u,y=fy+rise*u,
        /* each rung reaches on from its place to the landing, so a walker walking up the line stays on rungs however fast he goes */
        a0=-.3,a1=Math.hypot(top[0]-cx,top[1]-cz)+.35;
      W.poly({pts:[[cx+ux*a0-px*w/2,cz+uz*a0-pz*w/2,y],[cx+ux*a1-px*w/2,cz+uz*a1-pz*w/2,y],[cx+ux*a1+px*w/2,cz+uz*a1+pz*w/2,y],[cx+ux*a0+px*w/2,cz+uz*a0+pz*w/2,y]],name:'rung',tag:tag});}
    return n;}
  var api={add:add,ladder:ladder,T:T};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.KWALKBOX=api;
})(typeof window!=='undefined'?window:globalThis);
