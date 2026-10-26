// prefix: yt
// ================================================================= THE LAND, THE STOCK (PLAN.md sections 5 and 6, Y4)
//   yt_ice_quarry     a stretch of the frozen lake (or an aufeis sheet) being cut: saw lines, a cut-out pit of open water,
//                     blocks stacked for the sledges, the saw and the sledge
//   yt_pycrete_works  the yard where pycrete is cast: larch sawdust bins, a moss-drying yard for moss pycrete, block moulds
//                     of larch, the slurry trough, the freezing yard of finished blocks (PLAN.md section 10, the fibre)
//   yt_muskox_byre    a half-buried stone byre vaulted like a tunnel: stalls, the dung pile (fuel), the hay of plumegrass
//   yt_caribou_corral a larch-fenced ring with serge to tie to, a lichen manger, a snow-melt trough
defBuilding({key:'yt_ice_quarry',name:'Ice quarry (on the frozen lake)',seed:9701,w:15,d:11,h:2.4,budget:50000,
 tags:{types:['industry'],wealth:'poor',style:'common',role:'quarry',job:'quarrying'},
 note:'lake ice cut in blocks: saw lines across the sheet, a cut-out pit of dark water, blocks stacked for the sledges, the long saw and a sledge',
 build(o){CURREC.season='winter';CURREC.layers=[];CURREC.heat={stove:null,heated:false,crownVent:0,open:true};
  box('ice',0,0,0,14,.06,10,P('ice'));
  for(let i=0;i<5;i++)box('plain',-5.5+i*.82,.061,-1.0,.03,.002,5.6,jc(0x8aa0b0,.02));for(let j=0;j<7;j++)box('plain',-3.9,.061,-3.6+j*.82,3.6,.002,.03,jc(0x8aa0b0,.02));
  box('plain',2.6,.03,-1.5,2.5,.04,1.7,jc(0x1e2a34,.02));box('pycrete',2.6,-.4,-2.4,2.5,.45,.06,P('ice'));
  ytIceBlocks(-1.2,.06,2.6,0,5,3,'ice');ytIceBlocks(3.8,.06,2.8,0,4,2,'ice');
  W(5.4,.06,-2.5,.3,()=>{box('larch',0,.12,0,1.0,.06,2.4,P('larch'));for(const s of [-1,1])box('larch',s*.42,0,0,.08,.12,2.6,P('larchOld'));ytIceBlocks(0,.18,0,PI/2,2,1,'ice');});
  W(1.0,.06,-3.4,.2,()=>{box('plain',0,.02,0,2.2,.01,.12,jc(YT_IRON,.03));for(const s of [-1,1])pole('larch',[s*1.1,.02,0],[s*1.1,.6,0],.025,P('larch'));});
  door(0,0,5,0,4);}});
defBuilding({key:'yt_pycrete_works',name:'Pycrete works',seed:9703,w:16,d:12,h:3.2,budget:70000,
 tags:{types:['industry'],wealth:'middle',style:'common',role:'pycrete works',job:'masonry'},
 note:'where pycrete is cast: larch sawdust bins under a turf roof, a moss-drying yard for moss pycrete where timber is short, larch block moulds, the slurry trough, the freezing yard of finished blocks',
 build(o){CURREC.season='winter';CURREC.layers=[];CURREC.heat={stove:null,heated:false,crownVent:0,open:true};
  W(-4.8,0,-3.6,0,()=>{for(const x of [-2.2,-.75,.75,2.2]){pole('larch',[x,0,-1.2],[x,2.4,-1.2],.07,P('larch'));pole('larch',[x,0,1.2],[x,2.0,1.2],.07,P('larch'));}
   ytQuad('turf',[-2.5,2.0,1.5],[2.5,2.0,1.5],[-2.5,2.6,-1.5],[2.5,2.6,-1.5],P('turf'),[0,1,.4]);
   for(const x of [-1.5,0,1.5]){box('larch',x,0,-.2,1.3,.8,1.6,P('larchOld'));box('plain',x,.8,-.2,1.2,.25,1.5,jc(0xc8a878,.06));}});
  W(-4.8,0,2.6,0,()=>{for(let i=0;i<3;i++)ytRack(0,0,-1.2+i*1.2,0,3.2,1.4,'root');box('plain',0,.02,1.8,3.0,.06,1.0,jc(0x6a7a4a,.08));});
  W(1.4,0,-3.4,0,()=>{box('larch',0,0,0,3.4,.5,.9,P('larchOld'));box('pycrete',0,.42,0,3.2,.06,.75,P('ice'));
   for(let i=0;i<4;i++)W(-1.5+i*1.0,0,1.6,0,()=>{for(const s of [-1,1])box('larch',s*.45,0,0,.08,.45,.5,P('larch'));for(const s of [-1,1])box('larch',0,0,s*.25,.98,.45,.06,P('larch'));box('pycrete',0,.04,0,.82,.38,.42,P('ice'));});});
  ytIceBlocks(4.6,0,1.0,0,4,3,'pycrete');ytIceBlocks(4.6,0,3.4,0,4,2,'course');ytIceBlocks(1.4,0,3.2,0,3,2,'pycrete');
  FURNISH('generic_sack',-1.4,0,0,0);FURNISH('generic_barrel',.2,0,-1.6,0);door(0,0,6,0,4);}});
/* the byre: a slab trench and a stone vault over it (the tunnel's section, grown), turfed; stalls along one wall */
/* an end wall closing a vault (outer section hw, hv springing at ys, from the floor yF), centred on z, thickness t: dry
   slab in level courses, each course as wide as the section at its height; door {w, h} leaves a gap in the courses below
   its head and a lintel over it */
function ytEndWall(hw,hv,ys,yF,z,t,door){const c=.24;
 for(let y=yF;y<ys+hv-.02;y+=c){const ym=Math.min(y+c,ys+hv),yc=(y+ym)/2,f=yc<=ys?0:(yc-ys)/hv,w=f>=1?0:2*hw*Math.sqrt(1-f*f);if(w<.15)continue;
  if(door&&y<yF+door.h){const s=(w-door.w)/2;if(s>.05)for(const sg of [-1,1])box('slab',sg*(door.w/2+s/2),y,z,s,ym-y,t,P('slab'));}
  else box('slab',0,y,z,w,ym-y,t,P('slab'));}
 if(door)box('slab',0,yF+door.h-.02,z+.02,door.w+.6,.26,t+.06,P('slab'));}
defBuilding({key:'yt_muskox_byre',name:'Musk-ox byre',seed:9705,w:9,d:15,h:3.6,cut:true,budget:90000,
 tags:{types:['farm'],wealth:'middle',style:'common',role:'byre',job:'herding'},
 note:'a half-buried stone byre vaulted like a tunnel: the musk oxen in stalls, their body heat its only fire; the dung pile (the winter\'s fuel), plumegrass hay; the qiviut combed out in spring',
 holes:o=>[{run:[0,-6,0,6,2.0]},{run:[0,6,0,8.95,.8]}],
 build(o){const season=YT_SEASONS[(o.v|0)%3];CURREC.season=season;CURREC.layers=[{k:'stone',m:.45},{k:'moss',m:.2},{k:'turf',m:.2}];
  CURREC.heat={stove:null,heated:false,crownVent:.3,inlet:'the doors',stock:'body heat'};
  const hw=1.85,hv=1.3,ys=.6,yF=-1.0,t=.45,L=12;
  W(0,0,-6,0,()=>{box('earth',0,yF-.1,L/2,hw*2,.1,L,P('earth'));for(const s of [-1,1])box('slab',s*(hw+t/2),yF,L/2,t,ys-yF,L,P('slab'));
   ytVault('slab',hw,hv,ys,0,L,P('slab'),{inward:true});ytVault('slab',hw+t,hv+t,ys,0,L,P('slab'));
   const c=season==='winter'?'snow':'turf';ytVault(c,hw+t+.3,hv+t+.3,ys,.05,L-.05,P(c));
   ytEndWall(hw+t+.3,hv+t+.3,ys,yF,-.15,.3,null);ytEndWall(hw+t+.3,hv+t+.3,ys,yF,L+.15,.3,{w:1.4,h:1.9});
   for(let i=0;i<5;i++){const z=1.4+i*2.0;box('larch',-.2,yF,z,.1,1.1,1.8,P('larchOld'));box('larch',-hw+.3,yF,z+.9,.12,.9,.12,P('larch'));}
   box('plain',-hw+.9,yF,L-1.3,1.4,.7,1.2,jc(0x4a3a28,.06));box('plain',hw-.6,yF,2.0,.9,.9,3,jc(0xb8a46a,.06));
   for(let i=0;i<4;i++)ellip('plain',hw-.6,yF+1.6,1.5+i*2.6,.1,.1,.1,jc(0x3a3632,.02),0,6);
   FURNISH('generic_barrel',hw-.5,yF,L-1.0,0);FURNISH('generic_sack',hw-.5,yF,5.0,0);FURNISH('generic_fuel',-hw+.9,yF,L-2.6,0);FURNISH('generic_dairy',hw-.5,yF,6.4,0);
   /* the ramp down to the door: packed earth between low slab walls, walked as a strip */
   psurf('earth',(u,v)=>[(u-.5)*1.6,yF+(-yF)*v+.005,L+3.1*v],2,4,P('earth'),{up:true});ytWalkStrip(0,L,yF,0,L+2.95,0,1.4);
   /* the ramp's side walls: dry slab from the ramp's floor up to the ground's kerb */
   for(const s of [-1,1])psurf('slab',(u,v)=>{const yb=yF*(1-v);return [s*.8,yb+(.05-yb)*u,L+2.95*v];},1,4,P('slab'),{flip:s>0});
   ytWalkTarget('stalls',0,yF,L/2);ytWalkTarget('outside',0,0,L+3.6);
   door(0,yF,L,0,1.2);});}});
defBuilding({key:'yt_caribou_corral',name:'Caribou corral',seed:9707,w:14,d:14,h:3.4,budget:40000,
 tags:{types:['farm'],wealth:'middle',style:'common',role:'corral',job:'herding'},
 note:'the riding caribou\'s ring: a larch fence, serge to tie to at the gate, a manger of caribou moss (lichen), a snow-melt trough',
 build(o){CURREC.season='winter';CURREC.layers=[];CURREC.heat={stove:null,heated:false,crownVent:0,open:true};
  const R=6.2,n=22,pts=[];for(let i=0;i<=n;i++){const a=PI/2+.28+(TAU-.56)*i/n;pts.push([Math.cos(a)*R,Math.sin(a)*R]);}ytFence(pts,1.4);
  ytSerge(-1.6,R+.4,2.7);ytSerge(1.6,R+.4,2.7);
  W(-2.5,0,-2.5,.5,()=>{box('larch',0,0,0,2.4,.6,.9,P('larchOld'));box('plain',0,.6,0,2.2,.3,.75,jc(0xb8b8a0,.06));});
  W(2.6,0,-2.0,-.4,()=>{box('larch',0,0,0,2.0,.45,.6,P('larchOld'));box('ice',0,.4,0,1.85,.04,.45,P('ice'));});
  door(0,0,R,0,2.6);}});
