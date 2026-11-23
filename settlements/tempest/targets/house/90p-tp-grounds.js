// ================================================================= THE HOUSE OF THE TEMPEST — the grounds and the crest (step 4)
// TP_GROUNDS (src/80w) drawn round the House: a def, xa_tempest_grounds, placed with the House (its frame: the plan's, at the pad)
// whose pieces each stand on the DRAWN ground (terrainH at its world point, so a piece off the pad follows the crest): the
// remounts' paddock walls (dry stone, its gate toward the House), the byres' and hay barns' open sheds, the hay ricks, the great
// tank, the threshing floors, the hives, the caravan halt's shed, the range's butts, the drill court's pells, the riders'
// targets on the Maydan's track. The fields, the tracks and the middens are the near ground's colour (90q reads TP_GROUNDS).
// [web]: three.js through the kit's helpers (vB, vPst, vnShedRoof, xnWall).
const TP_GPLACED=[];
function tpGroundsBuild(G,o){reseed(32711);const C=xfCols('march'),P=TP_PLAN,nm='The House of the Tempest — the crest';
 /* the drawn ground under a plan point, in the def's frame (placed at the pad) */
 const gy=(lx,lz)=>{const w=TPS.toPage(lx,lz);return terrainH(w[0],w[1])-TPS.pad;};
 /* a registry entry at the piece's own ground (vnReg records the def's, the pad: a piece off the pad would hang over or under it) */
 const reg=(name,x,z,r,h,part,y0,y1)=>{vnReg(name,x,z,r,(y1==null?0:y1-y0)+h,{part});REG[REG.length-1].y=TPS.pad+y0;};
 const seat=(p,lx,lz,y)=>{const w=TPS.toPage(lx,lz);TP_GPLACED.push({id:p.id,kind:p.kind,x:w[0],z:w[1],y:y+TPS.pad,ground:terrainH(w[0],w[1])});};
 const hay=xC(0xc4ad72),earth=xC(0x8a6e4e),straw=xC(0xd8c890),water=xC(0x3a5560);
 for(const p of TP_GROUNDS.pieces){
  if(p.kind==='walls'){const b=p.box,h=p.h,t=.7,step=10,mid=(b[1]+b[3])/2;   /* the four sides in 10 m runs, each on its ground; a 10 m gate in the east side */
   const run=(x0,z0,x1,z1)=>{const L=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.ceil(L/step));for(let i=0;i<n;i++){const u0=i/n,u1=(i+1)/n,x=x0+(x1-x0)*(u0+u1)/2,z=z0+(z1-z0)*(u0+u1)/2,y=gy(x,z),along=Math.abs(x1-x0)>Math.abs(z1-z0);
     vB('xRubB',x,y-.3,z,along?L/n+.05:t,h+.3,along?t:L/n+.05,0,C.rubble);}};
   run(b[0],b[1],b[2],b[1]);run(b[0],b[3],b[2],b[3]);run(b[0],b[1],b[0],b[3]);run(b[2],b[1],b[2],mid-5);run(b[2],mid+5,b[2],b[3]);
   {const ys=[[b[0],b[1]],[b[2],b[1]],[b[2],b[3]],[b[0],b[3]],[b[2],mid],[(b[0]+b[2])/2,b[1]],[(b[0]+b[2])/2,b[3]],[b[0],mid]].map(q=>gy(q[0],q[1]));
    reg(nm+' — the remounts\' paddock',(b[0]+b[2])/2,(b[1]+b[3])/2,Math.hypot(b[2]-b[0],b[3]-b[1])/2+1,h,'wall',Math.min(...ys)-.3,Math.max(...ys));}
   seat(p,b[2],mid,gy(b[2],mid));continue;}
  const x=p.at[0],z=p.at[1],y=gy(x,z);seat(p,x,z,y);
  if(p.kind==='shed'){const alongZ=p.d>p.w,L=alongZ?p.d:p.w,D=alongZ?p.w:p.d,ry=alongZ?Math.PI/2:0,Q=(u,v)=>loc(x,z,u,v,ry);   /* the fort's open shed (xfSmall's stables): a back wall, posts in front, a lean-to roof */
   const bq=Q(0,-(D/2-.4));vB('xRubB',bq[0],y,bq[1],alongZ?.8:L,p.h,alongZ?L:.8,0,C.rubble);
   for(let i=0;i<=Math.round(L/3.5);i++){const q=Q(-L/2+.3+(L-.6)*i/Math.round(L/3.5),D/2-.3);vPst('vPost',q[0],y,q[1],.12,p.h-.4,C.tim);}
   vnShedRoof(x,y+p.h-.4,z,alongZ?D:L,alongZ?L:D,.8,alongZ?-Math.PI/2:Math.PI,'xTilesB',C.tile,.4);
   reg(nm+' — '+p.id.replace(/\./g,' '),x,z,L/2,p.h+1,'shed',y);}
  else if(p.kind==='rick'){for(let k=0;k<3;k++){const s=1-k*.3;vB('xRubB',x,y+k*p.h/3,z,p.r*2*s,p.h/3,p.r*2*s,k*.4,hay);}reg(nm+' — a hay rick',x,z,p.r,p.h,'rick',y);}
  else if(p.kind==='tank'){const w=p.w,d=p.d,rim=.8;for(const e of[[0,d/2,w,rim],[0,-d/2,w,rim],[w/2,0,rim,d],[-w/2,0,rim,d]])vB('vStone',x+e[0],y-.2,z+e[1],e[2],1.1,e[3],0,C.stone);
   vB('vDarkB',x,y+.15,z,w-rim,.05,d-rim,0,water);reg(nm+' — the great tank',x,z,Math.max(w,d)/2,1.4,'tank',y-.2);}
  else if(p.kind==='floor'){vB('vStone',x,y-.25,z,p.r*2,.32,p.r*2,0,C.stone);reg(nm+' — a threshing floor',x,z,p.r,.4,'floor',y-.25);}
  else if(p.kind==='hive'){vB('vWood',x,y,z,.5,.2,.5,0,C.tim);vB('xRubB',x,y+.2,z,.46,.55,.46,0,straw);}
  else if(p.kind==='butt'){vB('xEarthB',x,y,z,1.2,1.7,2.2,0,earth);vB('vWood',x+.62,y+.5,z,.06,1.0,1.0,0,straw);}   /* faced toward the range's shooting end (+z in the plan's frame is the front) */
  else if(p.kind==='pell'){vPst('vPost',x,y,z,.14,1.8,C.tim);}
  else if(p.kind==='target'){vPst('vPost',x,y,z,.08,1.9,C.tim);vB('vWood',x,y+1.9,z,.7,.7,.06,0,straw);}}
 /* the small pieces as one registry entry each group (hives, butts, pells, targets) */
 for(const[k,label]of[['hive','the hives'],['butt','the range\'s butts'],['pell','the drill court\'s pells'],['target','the riders\' targets']]){const ps=TP_GROUNDS.pieces.filter(p=>p.kind===k);if(!ps.length)continue;
  const xs=ps.map(p=>p.at[0]),zs=ps.map(p=>p.at[1]),cx=(Math.min(...xs)+Math.max(...xs))/2,cz=(Math.min(...zs)+Math.max(...zs))/2;
  const ys=ps.map(p=>gy(p.at[0],p.at[1]));reg(nm+' — '+label,cx,cz,Math.max(Math.max(...xs)-Math.min(...xs),Math.max(...zs)-Math.min(...zs))/2+1,2,k,Math.min(...ys),Math.max(...ys));}}
XA.def({key:'xa_tempest_grounds',name:'The House of the Tempest (the crest\'s grounds)',family:'Forts',tags:XTAG_FORT(['agriculture']),w:1000,d:800,h:6,fw:1000,fd:800,nv:1,build:tpGroundsBuild});
