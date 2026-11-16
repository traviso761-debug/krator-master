// ================================================================= GODSTEP — station 3's ground classes, the Talovolci's field walls and their pass
// PLAN.md sections 4 and 7.3: the pit's red oxidised scoria, the spring's moss lawn (the nemetos), the Talovolci's worked plots in the older crater,
// the vent's warm bare ground (dark, steaming: no snow, nothing of the cold country's), the stream. The host's painter reads them through
// GSTEP.groundAt (its fields: STN.fields). The FIELD WALLS: dry-stone walls round the plots (refs/06, Corvo), one item a short run of wall, laid
// along each plot's edges from the station's own polygons (GSTEP.FARM_EDGES, the host's; a shared edge drawn once), every draw KRAND.hash of the
// edge's own key. Data and BIO.put only, but for the wall's geometry.
Object.assign(GSTEP.GROUND,{
 scoria:{col:0x6e3022,k:.8,name:'Red oxidised scoria (the vent\'s old cinder on the lip)'},
 lawn:{col:0x4e7a2c,k:.85,name:'The spring\'s moss lawn (the nemetos)'},
 farm:{col:0x4a3a2a,k:.7,name:'A Talovolci plot (worked soil, its stones to the walls)'},
 warm:{col:0x1c1816,k:.8,name:'The vent\'s warm ground (bare, dark, steaming: the hearth trees\')'},
 stream:{col:0x2a2a22,k:.6,name:'The spring\'s stream bed'},
 lake:{col:0x3a3c38,k:.6,name:'The older crater\'s lake shore'}});
GSTEP.CLASSES.push('scoria','lawn','farm','warm','stream','lake');
GSTEP.PAL.wall=[0x3e3a38,0x48423e,0x524a44,0x3a3634];
(function(){const T3=BIO.host.THREE,K=KRAND,S=0x6057;
 /* a run of dry-stone wall: 1 long (x), ~1 high, ~.55 thick at the foot, its stones as a lumpy box tapering up (the vertices pushed by a hash) */
 const wall=(()=>{const g=new T3.BoxGeometry(1,1,.55,4,2,1),p=g.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),h=K.hash(S,Math.round(x*100)+500,Math.round(y*100)+500,Math.round(z*100)+0x3A11);
   p.setXYZ(i,x,y+.5+(K.unit(h)-.5)*.12,z*(1-.35*(y+.5))+(K.unit(K.hash(h,1))-.5)*.06);}
  g.computeVertexNormals();return g;})();
 BIO.def('fieldwall',wall,GSTEP.MAT.rock,{label:'A Talovolci field wall (dry stone, round a plot in the older crater)',cls:'feature',kind:'structure'});})();
GSTEP.SPECIES.push({key:'fieldwall',name:'Field walls',where:'round the Talovolci\'s plots in the older crater (station 3)'});
GSTEP.PASSES.push({name:'walls',fn(R,q,box){const K=KRAND,H=BIO.host.terrainH,{mix,qEuler}=BIO.fn,W=BIO.host.seed>>>0,P=GSTEP.PAL.wall,E=GSTEP.FARM_EDGES||[];let n=0;
 for(const e of E){const L=Math.hypot(e.b[0]-e.a[0],e.b[1]-e.a[1]),m=Math.max(1,Math.round(L/3.2)),yaw=-Math.atan2(e.b[1]-e.a[1],e.b[0]-e.a[0]);
  for(let k=0;k<m;k++){const t=(k+.5)/m,x=e.a[0]+(e.b[0]-e.a[0])*t,z=e.a[1]+(e.b[1]-e.a[1])*t,h=K.hash(W,e.key,k,0x3A12),u=c=>K.unit(K.hash(h,c));
   if(x<box[0]+3||x>box[2]-3||z<box[1]+3||z>box[3]-3||BIO.mask(x,z)<=0)continue;
   if(e.gate&&Math.abs(t-.5)<.6/m)continue;   /* a gate in each plot's first edge */
   const s=L/m*1.04,hh=mix(.85,1.25,u(1));BIO.range=600;
   BIO.put('fieldwall',[x,H(x,z)-.12,z],qEuler(0,yaw+(u(2)-.5)*.06,0),[s,hh,mix(.9,1.15,u(3))],P[Math.floor(u(4)*P.length)%P.length]);n++;}}
 BIO.range=null;return{walls:n};}});
