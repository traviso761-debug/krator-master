// ================================================================= HOST — a Fellgang village: its culture row for core/hamlet and its stand-in buildings (PLAN.md section 6,
// "Two more Fellgang villages", chosen by the owner 2026-11-11). Shared by the Fowlers' station (stations/fowlers) and the Ice-cutters' (stations/icecut, which
// names this file in its station.json "core").
// THE ROW (core/hamlet 20's shape, KHAMLET.village(spec) takes a row as well as a name): the Fellgangs build in drystone under turf, low and long, the
// meeting hall the village's one large room (their lapsed union's form: PLAN.md section 6); a village's works by its focus. core/hamlet has no fowling or
// ice-cutting focus: the Fowlers take the `ranch` slot (their works the rope house, the egg store and the pens) and the Ice-cutters the `quarry` slot (the
// ice houses and the sledge shed), each named in its own records. No building kit has the Fellgangs yet: every key's box is this row's (FELLGANG.BOX), and
// FELLGANG.draw makes the stand-ins (walls, a gabled turf roof, a door; a barrow for an ice house) as three merged meshes. Host-only: three.js.
const FELLGANG=(function(){
 const BOX={
  'fg-hut':{w:6,d:5,h:4.2,form:'house',what:'a one-room drystone hut under turf'},
  'fg-house':{w:9,d:6,h:4.8,form:'house',what:'a two-hearth house'},
  'fg-longhouse':{w:15,d:6.5,h:5.2,form:'house',what:'a longhouse (byre at the low end)'},
  'fg-headhouse':{w:13,d:8,h:5.8,form:'house',what:'the steward\'s house'},
  'fg-meethall':{w:18,d:10,h:7,form:'house',what:'the meeting hall (the one large room: the meeting, the votes)'},
  'fg-cairnhall':{w:7,d:7,h:6,form:'round',what:'the cairn house (the dead\'s names, the old rules said aloud)'},
  'fg-store':{w:8,d:6,h:4.5,form:'house',what:'the store'},
  'fg-smokehouse':{w:6,d:5,h:4.5,form:'house',what:'the smokehouse'},
  'fg-barn':{w:12,d:7,h:5.5,form:'house',what:'the barn'},
  'fg-ropehouse':{w:20,d:5,h:4,form:'shed',what:'a rope walk and rope house (each family\'s ropes kept and spliced here)'},
  'fg-eggstore':{w:6,d:6,h:4.5,form:'round',what:'an egg and honey store (cool, round, stone)'},
  'fg-pens':{w:14,d:12,h:1.4,form:'pen',what:'drystone pens'},
  'fg-icehouse':{w:12,d:9,h:4.5,form:'barrow',what:'an ice house: a barrow of turf over a stone vault, the blocks packed in sawdust and snow'},
  'fg-sledgeshed':{w:16,d:7,h:4.2,form:'shed',what:'the sledge shed'}};
 const ROW={kit:'fellgang',household:5,workShare:.5,slopeMax:.22,religious:'fg-cairnhall',civic:'fg-meethall',general:'fg-store',food:'fg-smokehouse',warehouse:'fg-barn',
  services:{religious:1,civic:2,general:1,food:2,warehouse:2},
  houses:{poor:[['fg-hut',1,3],['fg-house',2,2]],middling:[['fg-longhouse',3,2],['fg-house',2,1]],head:[['fg-headhouse',1,1]],middlingShare:.3},
  works:{ranch:[{key:'fg-ropehouse',jobs:8,share:.55},{key:'fg-eggstore',jobs:5,share:.3},{key:'fg-pens',jobs:3,share:.15}],
   quarry:[{key:'fg-icehouse',jobs:8,share:.75},{key:'fg-sledgeshed',jobs:6,share:.25}]},
  focusJobs:{ranch:48,quarry:48},reach:{ranch:260,quarry:260},pending:{}};
 const dims=k=>BOX[k]?{w:BOX[k].w,d:BOX[k].d,h:BOX[k].h}:null;
 /* the merged stand-ins: three arrays of triangles (stone, roof, dark: doors and openings), vertex colours, normals computed */
 function draw(V,o){const T=THREE,G=o.ground,seed=o.seed==null?7400:o.seed,U=(i,s)=>KRAND.unit(KRAND.hash(seed,i,s));
  const B={stone:{p:[],c:[]},roof:{p:[],c:[]},dark:{p:[],c:[]}},tc=new T.Color();
  const tri=(b,a,b2,c,col)=>{b.p.push(a[0],a[1],a[2],b2[0],b2[1],b2[2],c[0],c[1],c[2]);for(let k=0;k<3;k++)b.c.push(col.r,col.g,col.b);};
  const quad=(b,a,b2,c,d,col)=>{tri(b,a,b2,c,col);tri(b,a,c,d,col);};
  const P=(x,y,z,R)=>{const c=Math.cos(R.ry),s=Math.sin(R.ry);return[R.x+x*c+z*s,R.y+y,R.z-x*s+z*c];};
  function box(b,R,x0,x1,y0,y1,z0,z1,col){const p=(x,y,z)=>P(x,y,z,R),A=[p(x0,y0,z0),p(x1,y0,z0),p(x1,y0,z1),p(x0,y0,z1),p(x0,y1,z0),p(x1,y1,z0),p(x1,y1,z1),p(x0,y1,z1)];
   quad(b,A[3],A[2],A[6],A[7],col);quad(b,A[1],A[0],A[4],A[5],col);quad(b,A[2],A[1],A[5],A[6],col);quad(b,A[0],A[3],A[7],A[4],col);quad(b,A[7],A[6],A[5],A[4],col);}
  function house(R,s,i){const hw=s.w/2,hd=s.d/2,wh=s.h*.55,ov=.35,c1=tc.setHSL(.08+.03*U(i,1),.08+.06*U(i,2),.34+.12*U(i,3)).clone(),
    roof=new T.Color().setHSL(.15+.08*U(i,4),.28,.2+.06*U(i,5)),y0=R.lo;
   box(B.stone,R,-hw,hw,y0,wh,-hd,hd,c1);
   const p=(x,y,z)=>P(x,y,z,R),rid=s.h;   /* the gable roof along x: two slopes and the two gable ends in stone */
   quad(B.roof,p(-hw-ov,wh-.1,hd+ov),p(hw+ov,wh-.1,hd+ov),p(hw+ov,rid,0),p(-hw-ov,rid,0),roof);quad(B.roof,p(hw+ov,wh-.1,-hd-ov),p(-hw-ov,wh-.1,-hd-ov),p(-hw-ov,rid,0),p(hw+ov,rid,0),roof);
   tri(B.stone,p(hw,wh,hd),p(hw,wh,-hd),p(hw,rid-.2,0),c1);tri(B.stone,p(-hw,wh,-hd),p(-hw,wh,hd),p(-hw,rid-.2,0),c1);
   box(B.dark,R,-.55,.55,0,Math.min(1.9,wh-.2),hd,hd+.06,new T.Color(0x1c1814));   /* the door, facing the lane (+z: hamlet's records face their lane) */
   if(s.w>7)box(B.stone,R,hw*.55,hw*.55+.9,rid-.8,rid+.9,-.45,.45,c1);}   /* the chimney */
  function round(R,s,i){const r=s.w/2,wh=s.h*.55,n=14,c1=tc.setHSL(.08,.1,.36+.1*U(i,3)).clone(),roof=new T.Color().setHSL(.12,.25,.22);
   for(let k=0;k<n;k++){const a0=k/n*Math.PI*2,a1=(k+1)/n*Math.PI*2,q=(a,y,rr)=>P(Math.cos(a)*rr,y,Math.sin(a)*rr,R);
    quad(B.stone,q(a0,R.lo,r),q(a1,R.lo,r),q(a1,wh,r),q(a0,wh,r),c1);tri(B.roof,q(a0,wh-.1,r+.3),q(a1,wh-.1,r+.3),P(0,s.h,0,R),roof);}
   box(B.dark,R,-.5,.5,0,1.7,r-.1,r+.05,new T.Color(0x1c1814));}
  function shed(R,s,i){const hw=s.w/2,hd=s.d/2,c1=tc.setHSL(.07,.08,.33+.1*U(i,3)).clone(),roof=new T.Color().setHSL(.08,.12,.24);
   box(B.stone,R,-hw,hw,R.lo,s.h*.6,-hd,-hd+.7,c1);box(B.stone,R,-hw,-hw+.7,R.lo,s.h*.6,-hd,hd,c1);box(B.stone,R,hw-.7,hw,R.lo,s.h*.6,-hd,hd,c1);   /* open to the lane */
   for(let k=0;k<=4;k++){const x=-hw+k*s.w/4;box(B.dark,R,x-.12,x+.12,0,s.h*.6,hd-.25,hd,new T.Color(0x3a2e24));}
   const p=(x,y,z)=>P(x,y,z,R);quad(B.roof,p(-hw-.3,s.h*.6,hd+.4),p(hw+.3,s.h*.6,hd+.4),p(hw+.3,s.h,-hd-.3),p(-hw-.3,s.h,-hd-.3),roof);}
  function pen(R,s,i){const hw=s.w/2,hd=s.d/2,c1=tc.setHSL(.08,.08,.38+.08*U(i,3)).clone(),t=.6;
   box(B.stone,R,-hw,hw,R.lo,s.h,-hd,-hd+t,c1);box(B.stone,R,-hw,-hw+t,R.lo,s.h,-hd,hd,c1);box(B.stone,R,hw-t,hw,R.lo,s.h,-hd,hd,c1);
   box(B.stone,R,-hw,-1.2,R.lo,s.h,hd-t,hd,c1);box(B.stone,R,1.2,hw,R.lo,s.h,hd-t,hd,c1);}   /* the gate's gap on the lane side */
  function barrow(R,s,i){const rw=s.w/2,rd=s.d/2,n=12,m=5,turf=new T.Color().setHSL(.2+.04*U(i,4),.22,.24+.05*U(i,5)),c1=tc.setHSL(.08,.08,.4).clone();
   const q=(a,v)=>{const e=Math.sin(v*Math.PI/2);return P(Math.cos(a)*rw*Math.cos(v*Math.PI/2),-.5+s.h*e,Math.sin(a)*rd*Math.cos(v*Math.PI/2),R);};
   for(let k=0;k<n;k++)for(let j=0;j<m;j++){const a0=k/n*Math.PI*2,a1=(k+1)/n*Math.PI*2,v0=j/m,v1=(j+1)/m;quad(B.roof,q(a0,v0),q(a1,v0),q(a1,v1),q(a0,v1),turf);}
   box(B.stone,R,-1.2,1.2,-.5,2.4,rd-.4,rd+.6,c1);box(B.dark,R,-.6,.6,0,1.8,rd+.6,rd+.66,new T.Color(0x14181c));}   /* the stone door frame on the lane side */
  V.records.forEach((r,i)=>{const s=BOX[r.key]||{w:r.w,d:r.d,h:r.h,form:'house'},c=Math.cos(r.ry),sn=Math.sin(r.ry),Y=[];
   for(const a of [-1,1])for(const b of [-1,1]){const lx=a*s.w/2,lz=b*s.d/2;Y.push(G(r.x+lx*c+lz*sn,r.z-lx*sn+lz*c));}Y.push(G(r.x,r.z));
   const top=Math.max(...Y),R={x:r.x,z:r.z,ry:r.ry,y:top,lo:Math.min(...Y)-top-.5};   /* the floor at the footprint's highest corner, the walls down to its lowest */
   const f=s.form;if(f==='round')round(R,s,i);else if(f==='shed')shed(R,s,i);else if(f==='pen')pen(R,s,i);else if(f==='barrow')barrow(R,s,i);else house(R,s,i);});
  const pp=[];V.records.forEach(r=>pp.push(r.x,G(r.x,r.z)+1,r.z));   /* the probe's points: one a building (a merged mesh counts by its box centre otherwise: core/host 95) */
  const out=[];for(const k in B){const b=B[k];if(!b.p.length)continue;const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(b.p,3));
   g.setAttribute('color',new T.Float32BufferAttribute(b.c,3));g.computeVertexNormals();const m=new T.MeshStandardMaterial({vertexColors:true,roughness:k==='roof'?1:.95,metalness:0,side:T.DoubleSide});
   const mesh=new T.Mesh(g,m);mesh.name='fellgang:'+k;mesh.userData.host=true;mesh.userData.inspectLabel=o.label||'A Fellgang village';if(k==='stone')mesh.userData.probePoints=pp;o.scene.add(mesh);out.push(mesh);}
  return out;}
 /* the village's lanes as a worn track on the ground (a ribbon a few cm over it) */
 function lanes(V,o){const T=THREE,G=o.ground,p=[],c=[],col=new T.Color(0x6a5a46);
  V.lanes.forEach(L=>{const a=L.pts[0],b=L.pts[1],len=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(2,Math.ceil(len/4)),ux=(b[0]-a[0])/len,uz=(b[1]-a[1])/len,hw=L.w*.45;
   for(let k=0;k<n;k++){const t0=k/n*len,t1=(k+1)/n*len,P0=[a[0]+ux*t0,a[1]+uz*t0],P1=[a[0]+ux*t1,a[1]+uz*t1],q=(Q,s)=>[Q[0]-uz*hw*s,G(Q[0]-uz*hw*s,Q[1]+ux*hw*s)+.06,Q[1]+ux*hw*s];
    const A=q(P0,-1),Bq=q(P0,1),C=q(P1,1),Dq=q(P1,-1);p.push(...A,...Bq,...C,...A,...C,...Dq);for(let j=0;j<6;j++)c.push(col.r,col.g,col.b);}});
  if(!p.length)return null;const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('color',new T.Float32BufferAttribute(c,3));g.computeVertexNormals();
  const m=new T.MeshStandardMaterial({vertexColors:true,roughness:1,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});const mesh=new T.Mesh(g,m);mesh.name='fellgang:lanes';mesh.userData.host=true;mesh.userData.probeSkip=true;
  mesh.userData.inspectLabel='The village\'s lanes';o.scene.add(mesh);return mesh;}
 /* every record a core/tags volume before it is drawn (the inspector names it; core/tags keeps it) */
 function register(V,o){V.records.forEach(r=>{const s=BOX[r.key]||{what:r.key};REGISTER({name:(o.prefix||'')+s.what+' ('+r.key+')',x:r.x,z:r.z,y:o.ground(r.x,r.z)-1,r:Math.max(r.w,r.d)*.6,h:r.h+1.5,key:r.key,village:V.id});});}
 return{BOX,ROW,dims,draw,lanes,register};})();
