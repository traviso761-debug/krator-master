// ================================================================= HOST — the north wall's flora: the forest, the wild red stalk, the terraces' walls
// GSTEP.PASSES (src/51; 70 runs them after the ground's pass), in the build's own order:
//   forest  THE SOUTHERN HIGHLANDS' SPIRAL SPECIES, read in place (PLAN.md section 3: "its forest, with the mirror-handed tree at the shighlands'
//           rate"): biomes/shighlands' builders through BIO.kin (core/biome 32), each tree its own kit's make and grow (its hand by
//           SHIGH.MIRROR_EVERY). On a lattice whose every cell is KRAND.hash(world, i, j, salt), its tree's numbers a reseed of the same
//           hash. A row's acceptance is this page's forest and spring fields; NO TREE ON A FACE (the no-trees-on-cliffs rule: the face field,
//           the slope and the rock field at the foot), none in the water (the streams' line, core/space), on a terrace or the path; kept clear
//           of each other (core/space). Near the LOD spine a hero, past it the source's far form. Each tree a core/tags record (BIO.record);
//           the probe's volumes are three group records (each tree is too small for the probe's samples: its record is data)
//   stalks  the wild red stalk along the streams and the springs' seeps (the spring field over .7: ~15 m of the water), and farmed in rows on the
//           upper three rows of the two blocks nearest Guli Blaca and the springs (GSTEP.stalks on the spring field)
//   walls   the terraces' dry-stone walls: stones along each row's down-slope edge (the kit's stone item), ~1.4 m apart
const WALL_FLORA={trees:[]};
GSTEP.PASSES.push({name:'forest',fn(R,q,box){if(new URLSearchParams(location.search).get('kin')==='0'||!BIO.kin)return{trees:0};
 const W=0x5A11,S=KSPACE.create({cell:40}),HERO=170,LT=600,F=FIELD,rows=[
  {ref:'shigh.coilbark',key:'coilbark',name:'Coilbark (read in place: biomes/shighlands)',cell:40,acc:(f,w)=>f*.32},
  {ref:'shigh.trumpet',key:'trumpet',name:'Spiral trumpet (read in place: biomes/shighlands)',cell:50,acc:(f,w)=>f*.16},
  {ref:'shigh.frill',key:'frill',name:'Spiral frill tree (read in place: biomes/shighlands)',cell:50,acc:(f,w)=>f*.14},
  {ref:'shigh.volute',key:'volute',name:'Volute tree (read in place: biomes/shighlands)',cell:80,acc:(f,w)=>f*.2},
  {ref:'shigh.crozier',key:'crozier',name:'Crozier tree fern by the water (read in place: biomes/shighlands)',cell:20,acc:(f,w)=>smooth(.35,.8,w)*.5},
  {ref:'shigh.screwpine',key:'screwpine',name:'Screw palm by the water (read in place: biomes/shighlands)',cell:22,acc:(f,w)=>smooth(.4,.85,w)*.35*(1-f*.5)}];
 const out={trees:0,heroes:0,fars:0,missing:[]},reg0=BIO.host.register;BIO.host.register=()=>{};   /* each tree's record is core/tags' (BIO.record), not a probe volume */
 const ok=(x,z,r)=>{if(x<box[0]+6||x>box[2]-6||z<box[1]+6||z>box[3]-6||BIO.mask(x,z)<=0)return false;
  for(const p of [[0,0],[r,0],[-r,0],[0,r],[0,-r]]){const X=x+p[0],Z=z+p[1];if(F.face(X,Z)>.12||slopeAt(X,Z)>.5||F.rock(X,Z)>.35)return false;}
  const n=streamNear(x,z);if(n&&n.d<n.hw+r+1.5)return false;if(F.terrace(x,z)>.1||F.path(x,z)>.25)return false;
  return!S.some(x,z,r+10,o=>Math.hypot(x-o.x,z-o.z)<r+o.r)&&BIO.clearOf(x,z,r);};
 try{rows.forEach((row,ri)=>{const K=BIO.kin(row.ref,{key:'wall-'+row.key,name:row.name,tags:{godstep:'wall',borrowed:true}});if(!K){out.missing.push(row.ref);return;}
  const c=row.cell,salt=0x7e10+ri;let n=0;
  for(let j=Math.floor(box[1]/c);j<Math.ceil(box[3]/c);j++)for(let i=Math.floor(box[0]/c);i<Math.ceil(box[2]/c);i++){
   const h=KRAND.hash(W,i,j,salt),u=k=>KRAND.unit(KRAND.hash(h,k,0,salt)),x=(i+u(1))*c,z=(j+u(2))*c;
   if(!(x>box[0]&&x<box[2]&&z>box[1]&&z<box[3]))continue;
   if(!(u(3)<row.acc(F.forest(x,z),F.spring(x,z))*q))continue;
   BIO.fn.reseed(h);const T=K.make(x,terrainH(x,z),z),r=Math.max(1.5,(T.rb==null?.5:T.rb)*2+.8);if(!ok(x,z,r))continue;
   const near=BIO.lodD(x,z)<HERO;BIO.owner=[x,z];
   if(near){BIO.range=LT;BIO.minRange=0;K.grow(T,2);BIO.range=1e9;BIO.minRange=LT;K.grow(Object.assign({},T),0);out.heroes++;}
   else{BIO.range=1e9;BIO.minRange=0;K.grow(T,0);out.fars++;}
   BIO.owner=null;BIO.range=null;BIO.minRange=0;
   S.insert({x,z,r},x,z,r);WALL_FLORA.trees.push({x,z,y0:T.y0,H:T.H,r,key:row.key,hand:T.hand});
   BIO.record({name:K.name+(T.hand<0?' (mirror-handed)':''),key:row.key,kind:'tree',x,z,y:T.y0,r:T.crownR==null?3:T.crownR,h:T.H,tags:{hand:T.hand}});n++;}
  out[row.key]=n;out.trees+=n;});}
 finally{BIO.host.register=reg0;}
 if(!out.missing.length)delete out.missing;out.mirrored=WALL_FLORA.trees.filter(t=>t.hand<0).length;return out;}});
GSTEP.PASSES.push({name:'wall',fn(R,q,box){const out=GSTEP.stalks({box,q,wet:(x,z)=>{const n=streamNear(x,z);return n&&n.d<n.hw+1.5?0:FIELD.spring(x,z);},min:.7,cell:4,h:[3.2,5.8],
  rows:{a:Math.atan2(ALONG[1],ALONG[0]),sp:1.7,at:(x,z)=>{if(FIELD.terrace(x,z)<=.5)return false;const r=TERRACES.row(x,z);return!!r&&(r.R.b===1||r.R.b===2)&&r.R.r<3;}}});
 /* the terraces' walls: a stone every ~1.1 m along each row's down-slope edge, a little back from it */
 let walls=0;const K=KRAND,P=GSTEP.PAL;
 TERRACES.rows.forEach((Rw,ri)=>{const L=Math.abs(Rw.a1-Rw.a0),n=Math.floor(L/1.4);for(let k=0;k<=n;k++){const h=K.hash(WORLD,ri,k,0x3A11),u=m=>K.unit(K.hash(h,m));
  const a=Math.min(Rw.a0,Rw.a1)+k*1.4+(u(1)-.5)*.3,p=xzDA(Rw.d1-.7+(u(2)-.5)*.4,a),x=p[0],z=p[1];if(BIO.mask(x,z)<=0)continue;
  const n2=streamNear(x,z);if(n2&&n2.d<n2.hw+1.5)continue;
  const s=.35+.3*u(3);BIO.range=500;BIO.put('stone',[x,terrainH(x,z)+s*.25,z],BIO.fn.qEuler((u(4)-.5)*.3,u(5)*TAU,(u(6)-.5)*.3),[s*1.3,s*.8,s],P.basalt[Math.floor(u(7)*P.basalt.length)%P.basalt.length]);walls++;}});
 BIO.range=null;return{stalks:out.stalks,walls};}});
