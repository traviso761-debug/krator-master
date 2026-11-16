/* ================================================================= THEODIGA TODAY: the arcology's inhabited levels, as storeys of rooms
   [G data] T-arc-1 (BLUEPRINT.md; the owner, 2026-11-16: "bring in theodiga arcology interiors"): every unit the sheets give a
   program (TH_ARC_PROGRAM, src/43-th-arc-program.js, GENERATED from theodiga_blueprint.py) becomes storeys of rooms through
   kits/ancients-interiors' floor plates (AI.barPlate, AI.hallPlate), in the dam group's frame:
     the Dome's rooms on the deck (420 m, one storey), the crest's blocks (400-418 m, four storeys), the gallery's segments inside
     the dam along its arc (382-400 m, four), the six standing fin heads (370-410 m, eleven).
   A unit whose program is one room (a shrine, a hall, a kitchen, a library, a workshop, a stair hall) is one hall a storey; one
   of many rooms (cells, lodgings, dormitories, studies, stores) is a bar: a corridor down its long axis, rooms either side, a
   stair core across one end. A unit with no program (a cistern, the empty block, the Long Gallery's passage) is one room left
   unfurnished.
   TH_ARC.buildings(AI) -> [{id, name, storeys, floors, inside}]   the Ancients kit's plan shape (AI.KIT[type].buildings)
   TH_ARC.entry(AI)     -> the AI.KIT entry for the dam (culture xanadu: the clergy furnish it as Xanadu does)
   TH_ARC.levels()      -> the distinct storey heights, low to high (the cut-away's storeys; a view opens one by index)
   TH_ARC.PROG          the sheets' programs onto kits/interiors' (IX.PROGRAMS) */
var TH_ARC=(function(){
 const PROG={cells:'cell',dormitory:'dormitory',lodging:'bedroom',chamber:'bedroom',guest_bed:'bedroom',guest_hall:'hall',office:'study',
  infirmary:'dormitory',store:'store',school:'study',lecture:'hall',reading_room:'library',scriptorium:'study',assembly:'hall',workshop:'workshop',
  servants_hall:'hall',chapel:'shrine',wardrobe:'store',kitchen:'kitchen',bakehouse:'kitchen',rising_main:'workshop',larder:'store',treasury:'store',
  archive:'library',archive_stacks:'library',gatehouse_deep:'antechamber',guard:'dormitory',entrance:'antechamber',music:'hall',sanctum:'shrine',
  wheel_house:'shrine',altar:'shrine',ancestors_hall:'shrine',damsel_shrine:'shrine',offering_hall:'hall',lamp_hall:'shrine',stair:'antechamber',
  empty:null,cistern:null,passage:null,void:null};
 const HALL={hall:1,shrine:1,kitchen:1,library:1,workshop:1,antechamber:1};
 const zc=x=>-140*(1-Math.pow(x/320,2));
 const prog=u=>PROG[u.kind]===undefined?'store':PROG[u.kind];
 const rnd=v=>Math.round(v*1000)/1000;
 /* a unit's outline (x, z), counter-clockwise from above */
 const outline=u=>{if(u.shape==='circle'){const o=[];for(let i=0;i<24;i++){const a=-i/24*2*Math.PI;o.push([u.cx+u.r*Math.cos(a),u.cz+u.r*Math.sin(a)]);}return o;}
  if(u.shape==='arc'){const n=Math.max(4,Math.ceil(Math.abs(u.x1-u.x0)/8)),a=[],b=[];for(let i=0;i<=n;i++){const x=u.x0+(u.x1-u.x0)*i/n;a.push([x,zc(x)+u.za]);b.push([x,zc(x)+u.zb]);}
   return a.concat(b.reverse());}
  return [[u.x0,u.z0],[u.x1,u.z0],[u.x1,u.z1],[u.x0,u.z1]];};
 /* one storey of a unit: a hall, or a bar along its long axis (a box's longer side, an arc's run) */
 function storey(AI,u,i){const y=rnd(u.y0+i*u.h),h=rnd(u.h),id=u.id+'.s'+i,p=prog(u);
  if(!p||HALL[p]||u.shape==='circle'){const st=AI.hallPlate({id,level:i,y,h,poly:outline(u),kind:p||'corridor',doorEdge:0,doorW:2,furnish:!!p});
   if(!p)st.rooms.forEach(R=>{R.furnish=false;R.empty=true;});return st;}
  let path,len,depth;
  /* an arc's band is cut in z (the dam's faces are z offsets of its line), but a bar is cut across its path: so the bar's
     depth is the band's at the steepest of the arc it crosses (cos of that slope), and its run is trimmed at each end by
     how far its corners swing out there (half the depth times the sine of the slope), so every room stays in the band */
  if(u.shape==='arc'){const zm=(u.za+u.zb)/2,sl=x=>Math.atan(Math.abs(2*140*x/(320*320))),th=Math.max(sl(u.x0),sl(u.x1));
   depth=(u.zb-u.za)*Math.cos(th)-.4;const t0=depth/2*Math.sin(sl(u.x0))+.2,t1=depth/2*Math.sin(sl(u.x1))+.2,a=u.x0+t0,b=u.x1-t1;
   path=t=>{const x=a+(b-a)*t;return [x,zc(x)+zm];};}
  else{const w=u.x1-u.x0,d=u.z1-u.z0;
   if(d>=w){path=t=>[(u.x0+u.x1)/2,u.z0+d*t];depth=w;}else{path=t=>[u.x0+w*t,(u.z0+u.z1)/2];depth=d;}}
  const roomW=p==='cell'?3.4:p==='bedroom'?4.2:p==='dormitory'?7:5;
  return AI.barPlate({id,level:i,y,h,path,depth,side:depth>=9?'both':'left',cw:2,roomW,kinds:()=>p,ends:['core',null],door:1});}
 function buildings(AI){const out=[];
  for(const u of TH_ARC_PROGRAM){const storeys=[];for(let i=0;i<u.n;i++)storeys.push(storey(AI,u,i));
   const O=outline(u),xs=O.map(q=>q[0]),zs=O.map(q=>q[1]),bx=[Math.min(...xs),Math.max(...xs),Math.min(...zs),Math.max(...zs)];
   out.push({id:u.id,name:u.name,area:u.area,kind:u.kind,storeys,floors:true,hollow:null,
    /* 5 cm of slack: the plates round their corners to the millimetre, so a corner on the outline lands a hair outside it */
    inside:(x,z,y)=>x>=bx[0]-.05&&x<=bx[1]+.05&&z>=bx[2]-.05&&z<=bx[3]+.05&&y>=u.y0-.5&&y<=u.y0+u.n*u.h+.5});}
  return out;}
 function entry(AI){return {name:'Theodiga, the inhabited levels',frag:'43-th-arc.js',culture:'xanadu',wealth:.6,
  types:['religious','dwelling-multi','civic'],furnish:true,buildings:()=>buildings(AI)};}
 function levels(){const ys=new Set();for(const u of TH_ARC_PROGRAM)for(let i=0;i<u.n;i++)ys.add(rnd(u.y0+i*u.h));return [...ys].sort((a,b)=>a-b);}
 return {buildings,entry,levels,PROG,HALL,outline};
})();
