// prefix: yt
// ================================================================= THE FOREST-STEPPE HOUSE: yt_balagan (PLAN.md sections 1 and 6)
// Below the pycrete line the Khaayken build their permanent houses of larch, stone and sod (biomes/nwouterwall/PLAN.md
// section 5). The balagan of the Sakha is the model: walls of larch logs set leaning inward on a sunk floor, daubed outside
// with earth and dung, a low roof of larch under sod; a cold porch at the door (the cold trap again, above ground); a clay
// fireplace stove (the chuval) whose chimney runs a quarter taller for the thin air; sleeping benches round the walls;
// window panes of lake ice in winter, sewn gut the rest of the year, on the north wall (the sun's side at 40 degrees south).
/* a four-cornered face, a (u0 v0), b (u1 v0), c (u0 v1), d (u1 v1), its face turned toward n; gap {u0, u1, v0}: a
   doorway cut from the bottom edge, u0 to u1 across and up to v0 */
function ytQuad(mk,a,b,c,d,col,n,gap){
 const sub=(p,q)=>[p[0]-q[0],p[1]-q[1],p[2]-q[2]],e1=sub(b,a),e2=sub(c,a),cr=[e1[1]*e2[2]-e1[2]*e2[1],e1[2]*e2[0]-e1[0]*e2[2],e1[0]*e2[1]-e1[1]*e2[0]];
 const flip=cr[0]*n[0]+cr[1]*n[1]+cr[2]*n[2]<0,L=(p,q,t)=>[p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t,p[2]+(q[2]-p[2])*t];
 const sheet=(u0,u1,v0,v1)=>psurf(mk,(u,v)=>{const uu=u0+(u1-u0)*u,vv=v0+(v1-v0)*v;return L(L(a,b,uu),L(c,d,uu),vv);},Math.max(1,Math.round((u1-u0)*4)),2,col,{flip});
 if(!gap){sheet(0,1,0,1);return;}
 sheet(0,gap.u0,0,1);sheet(gap.u1,1,0,1);sheet(gap.u0,gap.u1,gap.v0,1);}
const YT_BAL=(()=>{const S=YT_S,hx=2.9*S,hz=2.4*S,bat=.55,H=2.1*S,wt=.32,yFl=-.35,door={w:1.0*S,h:1.75*S},porch={w:1.7*S,d:1.5*S,h:1.95*S};
 return {S,hx,hz,bat,H,wt,yFl,door,porch,w:2*(hx+wt+1.4),d:2*(hz+wt+1.4)+porch.d,h:H*1.55+1.2,cz:-porch.d/2};})();
function ytBalaganHoles(){const B=YT_BAL,x=B.hx,z=B.hz;return [{poly:[[-x,B.cz-z],[x,B.cz-z],[x,B.cz+z],[-x,B.cz+z]]}];}
function ytBalagan(season){const B=YT_BAL,S=B.S,hx=B.hx,hz=B.hz,tx=hx-B.bat,tz=hz-B.bat,H=B.H,wt=B.wt,yFl=B.yFl;
 CURREC.season=season;CURREC.layers=[{k:'larch',m:.2},{k:'earth',m:.3}].concat(season==='winter'?[{k:'snow',m:.4,where:'base'}]:[]);
 CURREC.frost={ok:true,none:true};
 CURREC.heat={stove:{kind:'chuval',note:'a clay fireplace stove; its mass is the clay and the chimney'},lamps:1,fuel:['larch','dung'],crownVent:.3,inlet:'the cold porch',heated:season!=='summer'};
 W(0,0,B.cz,0,()=>{
  /* the walls: four battered faces, larch inside, earth daub outside, a cap over the logs' tops; the door in the south */
  const C=(x,y,z)=>[x,y,z],dg={u0:.5-B.door.w/2/(2*hx),u1:.5+B.door.w/2/(2*hx),v0:B.door.h/H};
  const sides=[[[-hx,0,-hz],[hx,0,-hz],[-tx,H,-tz],[tx,H,-tz],[0,0,1],null],[[hx,0,hz],[-hx,0,hz],[tx,H,tz],[-tx,H,tz],[0,0,-1],'s'],
   [[hx,0,-hz],[hx,0,hz],[tx,H,-tz],[tx,H,tz],[-1,0,0],null],[[-hx,0,hz],[-hx,0,-hz],[-tx,H,tz],[-tx,H,-tz],[1,0,0],null]];
  for(const [a,b,c,d,n,door] of sides){const g=door?{u0:1-dg.u1,u1:1-dg.u0,v0:dg.v0}:null,o=[-n[0]*wt,0,-n[2]*wt];
   ytQuad('larch',a,b,c,d,P('larch'),n,g);
   const oa=a.map((v,i)=>v+o[i]),ob=b.map((v,i)=>v+o[i]),oc=c.map((v,i)=>v+o[i]),od=d.map((v,i)=>v+o[i]);
   ytQuad('earth',oa,ob,oc,od,P('earth'),[-n[0],.3,-n[2]],g);
   ytQuad('larch',c,d,oc,od,P('larch'),[0,1,0]);}
  /* the door's jambs and lintel close the wall's thickness */
  const zf=hz-(B.door.h/H)*B.bat*.5;
  for(const s of [-1,1])box('larch',s*(B.door.w/2+.06),0,zf+wt/2,.12,B.door.h,wt+.25,P('larch'));box('larch',0,B.door.h-.05,zf+wt/2,B.door.w+.3,.18,wt+.3,P('larch'));
  /* the sunk floor: its larch-boarded pit wall (to a kerb at the ground), its earth floor, two steps down at the door */
  for(const [x,z,w,d] of [[0,-hz,2*hx+.2,.2],[0,hz,2*hx+.2,.2],[-hx,0,.2,2*hz],[hx,0,.2,2*hz]])box('larch',x,yFl,z,w,-yFl+YT_KERB,d,P('larchOld'));
  box('earth',0,yFl-.1,0,2*hx,.1,2*hz,P('earth'));
  box('larch',0,yFl,hz-.55,B.door.w,.18,.4,P('larch'));box('larch',0,yFl,hz-.25,B.door.w,-yFl*.6,.3,P('larch'));
  /* the ceiling of larch poles and the low hipped roof of sod over it */
  const rx=tx+wt,rz=tz+wt,rh=.55,rl=Math.max(.3,rx-rz);
  ytQuad('larch',[-tx,H,-tz],[tx,H,-tz],[-tx,H,tz],[tx,H,tz],P('larch'),[0,-1,0]);
  ytQuad('turf',[-rx,H,rz],[rx,H,rz],[-rl,H+rh,0],[rl,H+rh,0],P('turf'),[0,1,1]);ytQuad('turf',[rx,H,-rz],[-rx,H,-rz],[rl,H+rh,0],[-rl,H+rh,0],P('turf'),[0,1,-1]);
  /* the hip ends are triangles (a quad closing to a point has no normal at its apex) */
  poly('turf',[[rx,H,rz],[rx,H,-rz],[rl,H+rh,0]],P('turf'));poly('turf',[[-rx,H,-rz],[-rx,H,rz],[-rl,H+rh,0]],P('turf'));
  /* the cold porch: a larch lean-to over the door, its own door to the south */
  const p=B.porch,pz0=hz+wt-.1,pz1=pz0+p.d;
  for(const s of [-1,1])box('larch',s*(p.w/2-.05),0,(pz0+pz1)/2,.1,p.h,p.d,P('larch'));
  ytQuad('larch',[p.w/2,0,pz1],[-p.w/2,0,pz1],[p.w/2,p.h-.25,pz1],[-p.w/2,p.h-.25,pz1],P('larch'),[0,0,1],{u0:.5-B.door.w/2/p.w,u1:.5+B.door.w/2/p.w,v0:B.door.h/(p.h-.25)});
  ytQuad('turf',[-p.w/2-.15,p.h-.3,pz1+.2],[p.w/2+.15,p.h-.3,pz1+.2],[-p.w/2-.15,p.h+.1,pz0],[p.w/2+.15,p.h+.1,pz0],P('turf'),[0,1,1]);
  box('flag',0,-.04,(pz0+pz1)/2,p.w-.2,.06,p.d,P('flag'));
  door(0,0,pz1,0,B.door.w);
  /* the windows on the north wall: a pane of ice in winter, sewn gut the rest of the year, in a larch frame */
  const pane=season==='winter'?'ice':'gut';
  for(const x of [-1.3,1.3]){const y=1.15*S,zz=-(hz-(y/H)*B.bat)-wt/2;box(pane,x,y,zz,.55,.42,wt+.04,P('ice'));
   for(const [dx,dy,w,h] of [[0,.24,.7,.07],[0,-.24,.7,.07],[.31,0,.07,.5],[-.31,0,.07,.5]])box('larch',x+dx,y+dy-h/2,zz,w,h,wt+.08,P('larch'));}
  /* the chuval in the front-left corner: a clay firebox, its chimney through the roof a quarter taller than at sea level */
  const cx=-hx+.75,cz=hz-.95;box('earth',cx,yFl,cz,1.0,1.15,.85,jc(0xb8a890,.04));box('glow',cx+.51,yFl+.3,cz,.02,.28,.4,P('flame'));haloAt(cx+.8,yFl+.6,cz,0xff8a30,true);
  const top=(H+rh)*1.25+.3;cyl('earth',cx,yFl+1.15,cz,.34,top-yFl-1.15,jc(0xb8a890,.04),10,.2);smokeAt(cx,top+.1,cz,{r:.15,kind:'chimney'});
  /* the sleeping benches round the walls, robed; a lamp */
  for(const [x,z,w,d] of [[0,-hz+.55,2*hx-.4,.9],[hx-.55,-.3,.9,2*hz-1.6],[-hx+.55,-.6,.9,2*hz-2.6]]){box('larch',x,yFl,z,w,.45,d,P('larch'));box('caribou',x,yFl+.45,z,w-.1,.05,d-.1,P('ice'));}
  ytLamp(.6,yFl+.5,-hz+.55,0);
  wkPad(0,0,2*hx-.4,2*hz-.4,yFl);
  /* the walls to a walker (the quads say nothing to core/walk): blocks along each, the doorway left open */
  const dW=B.door.w/2;ytWalkBlock(-hx-wt,hx+wt,-hz-wt,-hz,yFl,H);ytWalkBlock(-hx-wt,-hx,-hz,hz+wt,yFl,H);ytWalkBlock(hx,hx+wt,-hz,hz+wt,yFl,H);
  ytWalkBlock(-hx-wt,-dW,hz,hz+wt,yFl,H);ytWalkBlock(dW,hx+wt,hz,hz+wt,yFl,H);
  ytWalkTarget('room',0,yFl,0);ytWalkTarget('outside',0,0,hz+wt+B.porch.d+1.2);
  /* the season's coat: drift snow banked on the walls in winter */
  if(season==='winter')for(const [a,b,n] of [[[-hx-wt,0,-hz-wt],[hx+wt,0,-hz-wt],[0,0,-1]],[[hx+wt,0,-hz-wt],[hx+wt,0,hz+wt],[1,0,0]],[[-hx-wt,0,hz+wt],[-hx-wt,0,-hz-wt],[-1,0,0]]]){
   const o=[n[0]*1.2,0,n[2]*1.2],up=[-n[0]*.38,1.0,-n[2]*.38];ytQuad('snow',a.map((v,i)=>v+o[i]),b.map((v,i)=>v+o[i]),a.map((v,i)=>v+up[i]),b.map((v,i)=>v+up[i]),P('snow'),[n[0],1,n[2]]);}
  FURNISH('generic_chest',hx-.6,yFl+.5,-hz+.6,-PI/2);FURNISH('generic_stew_pot',cx+.9,yFl,cz-.2,PI/2);FURNISH('generic_floor_basket',1.0,yFl,1.0,0);FURNISH('generic_fuel',cx+.2,yFl,cz-.9,0);FURNISH('generic_tea_set',-.4,yFl+.5,-hz+.55,0);});}
defBuilding({key:'yt_balagan',name:'Larch-and-sod house (the forest-steppe balagan)',seed:9141,w:YT_BAL.w,d:YT_BAL.d,h:YT_BAL.h,cut:true,budget:60000,
 tags:{types:['dwelling-single'],wealth:'poor',style:'poor',role:'dwelling'},
 note:'below the pycrete line: battered larch walls daubed with earth, a low sod roof, a cold porch, a clay fireplace stove, benches round the walls, ice or gut windows to the north',
 holes:o=>ytBalaganHoles(),
 build(o){ytBalagan(YT_SEASONS[(o.v|0)%3]);}});
