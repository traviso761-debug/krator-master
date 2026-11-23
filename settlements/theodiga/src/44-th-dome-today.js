/* ================================================================= THEODIGA TODAY: the Dome as the faith keeps it (records; draws nothing)
   [G data] T-dome-1 (BLUEPRINT.md sheet T1; the owner, 2026-11-16: "do all remaining steps of build"). Two things the faithful
   made of the ruined Dome on the Water, in the dam group's frame:
     THE PILGRIMS' STAIRS  the pilgrims come up from the middle kora (the crest's promenade, 400 m, between its lake-side A
                           blocks and its face-side B blocks) to the deck (420 m) by two stairs, east and west, rising under the
                           deck's downstream chord into the sheets' stair heads (TH_ARC_PROGRAM th.arc.dome.8 and .9). Each is
                           a well cut through the deck, a shaft of the faith's ashlar under it standing in the promenade on the
                           A blocks' side (the kora keeps 6 m past it), and five flights of 4 m in two lanes, switching back at
                           landings at the shaft's ends; its door on the kora at its outer end. The clergy's own stair rises
                           inside the Priests' House (crest block -1A) and is that building's interior (T-arc-1).
     THE RE-GLAZED FRAME   every empty pane of the frame glazed again with salvaged glass, a pane's tint drawn from KRAND by its
                           cell (the ribs and the band lines between them are the frame, now bronze gone to verdigris): blue,
                           sea-green, amber, clear, green, Ancient blue-white, a little rose. The Tear stays open: the Fall is
                           doctrine. The Hall of the Song (the old fluted dome under it) likewise.
   TH_DOME_TODAY.stairs(o)  -> [{id, name, side, well:{x0,x1,z0,z1}, y0, y1, flights:[{a:[x,y,z], b, w, lane}], landings, door}]
     o.zc(x) the dam's arc (the crest's upstream face line); o.H the crest (400); o.deckY (420)
   TH_DOME_TODAY.cells(wells, o) -> the deck's grid cells a well cuts ({i0, i1, j0, j1} in the deck's nu x nv grid round its
     centre o.cx, o.cz to radius o.R), every cell of the block, so what is left round the well is one shape
   TH_DOME_TODAY.pane(seed, i, j) -> the palette index of the pane in cell (i, j); TH_DOME_TODAY.PALETTE */
var TH_DOME_TODAY=(function(){
 const PALETTE=[0x9fc4d8,0x8fd0c8,0xd8b878,0xdde6ea,0xa3c79a,0xb8c8e8,0xd8a8a0];
 const WEIGHT=[.26,.18,.14,.18,.12,.08,.04];
 function pane(seed,i,j){const u=KRAND.unit(KRAND.hash(seed,i,j));let a=0;for(let k=0;k<WEIGHT.length;k++){a+=WEIGHT[k];if(u<a)return k;}return 0;}
 /* the crest's blocks as buildDam draws them (77-dam.js): at x = 22k, A lake side z(x)-6 .. z(x)+22 and 15 wide, B face side
    z(x)+39 .. z(x)+61 and 18 wide */
 const blocks=zc=>{const A=[],B=[];for(let k=-13;k<=13;k++){const x=k*22,z=zc(x);A.push({x0:x-7.5,x1:x+7.5,z0:z-6,z1:z+22});B.push({x0:x-9,x1:x+9,z0:z+39,z1:z+61});}return {A,B};};
 const over=(a,b)=>a.x0<b.x1&&a.x1>b.x0;
 function stairs(o){const zc=o.zc,H=o.H==null?400:o.H,Y=o.deckY==null?420:o.deckY,BL=blocks(zc),out=[];
  const N=5,rise=(Y-H)/N,run=8,end=2,wall=.35;
  for(const s of [1,-1]){const x0=s>0?52:-64,x1=s>0?64:-52,span={x0,x1};
   /* the shaft keeps 0.5 m off the A blocks it stands against, and leaves the kora 6 m to the B blocks */
   const zA=Math.max(...BL.A.filter(b=>over(b,span)).map(b=>b.z1))+.5,zB=Math.min(...BL.B.filter(b=>over(b,span)).map(b=>b.z0));
   const z0=zA,z1=Math.min(-103,zB-6),mid=(z0+z1)/2,lw=(z1-z0)/2-wall,lane=k=>k%2===0?(mid+z1)/2-wall/2:(z0+mid)/2+wall/2;
   const outer=s>0?x1-end:x0+end,inner=s>0?x0+end:x1-end;
   const flights=[],landings=[];
   for(let k=0;k<N;k++){const ya=H+k*rise,yb=ya+rise,from=k%2===0?outer:inner,to=k%2===0?inner:outer,z=lane(k);
    flights.push({a:[from,ya,z],b:[to,yb,z],w:lw,lane:k%2===0?'kora':'lake',steps:Math.round(rise/.25)});
    /* the landing at the flight's top end, across both lanes */
    const lx0=Math.abs(to-(x0+end))<1e-6?x0:x1-end;
    landings.push({x0:lx0,x1:lx0+end,z0:z0+wall,z1:z1-wall,y:yb});}
   out.push({id:'th.dome.stair.'+(s>0?'east':'west'),name:'the Pilgrims\' Stair, '+(s>0?'east':'west'),side:s,well:{x0,x1,z0,z1},y0:H,y1:Y,
    flights,landings,wall,door:{x0:s>0?outer-1.6:outer-1.4,x1:s>0?outer+1.4:outer+1.6,z:z1,h:3.6},kora:zB-z1});}
  return out;}
 /* the deck's cells a well cuts: sample each cell (its corners and inside) and take the block of every cell any sample of which
    falls in the well */
 function cells(wells,o){const nu=o.nu,nv=o.nv,R=o.R,T=2*Math.PI,res=[];
  for(const W of wells){let i0=1e9,i1=-1e9,j0=1e9,j1=-1e9;
   for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){let hit=false;
    for(let a=0;a<=6&&!hit;a++)for(let b=0;b<=6&&!hit;b++){const t=(i+a/6)/nu*T,r=(j+b/6)/nv*R,x=o.cx+r*Math.cos(t),z=o.cz+r*Math.sin(t);
     if(x>=W.x0-.01&&x<=W.x1+.01&&z>=W.z0-.01&&z<=W.z1+.01)hit=true;}
    if(hit){i0=Math.min(i0,i);i1=Math.max(i1,i);j0=Math.min(j0,j);j1=Math.max(j1,j);}}
   if(i1>=i0)res.push({i0,i1,j0,j1,well:W});}
  return res;}
 return {stairs,cells,pane,PALETTE,blocks};
})();
