// ================================================================= HOST — build (Mantis's pocket)
// The town's edge first (45's TOWNREC: massing only, the town proper is a settlement's work): the outlying houses in mud brick,
// some whitewashed, flat roofs behind parapets; a merchant house's tower with its wind-catcher (Izani); a domed shrine (Yuni's
// look); the gardens' mud walls with a gate each. One vertex-coloured mesh. Each is a registered record and an obstacle, so the
// kit keeps its trees and plants off them. Then the kit (its passes the pocket's: 57, 67), then the gardens' own trees (date palms
// in rows, the fig gardens' figs, the kitchen gardens' beds), then one bake.
window._biome=null;
const TOWN_MESH=(function(){const pos=[],nor=[],col=[],c=new THREE.Color();
 const quad=(a,b,cc,d,n,hex)=>{c.set(hex).convertSRGBToLinear();for(const p of [a,b,cc,a,cc,d]){pos.push(p[0],p[1],p[2]);nor.push(n[0],n[1],n[2]);col.push(c.r,c.g,c.b);}};
 // a box turned by rot about y: [x,z] centre, half sizes, y0..y1, the sides' and the top's colours
 function box(x,z,hw,hd,y0,y1,rot,side,top){const cs=Math.cos(rot),sn=Math.sin(rot),P=(u,v,y)=>[x+u*cs-v*sn,y,z+u*sn+v*cs],N=(u,v)=>[u*cs-v*sn,0,u*sn+v*cs];
  const a=P(-hw,-hd,y0),b=P(hw,-hd,y0),cc=P(hw,hd,y0),d=P(-hw,hd,y0),A=P(-hw,-hd,y1),B=P(hw,-hd,y1),Cc=P(hw,hd,y1),D=P(-hw,hd,y1);
  quad(a,b,B,A,N(0,-1),side);quad(b,cc,Cc,B,N(1,0),side);quad(cc,d,D,Cc,N(0,1),side);quad(d,a,A,D,N(-1,0),side);quad(A,B,Cc,D,[0,1,0],top);}
 function dome(x,y,z,r,hex){const n=10,m=5;c.set(hex).convertSRGBToLinear();for(let i=0;i<n;i++)for(let j=0;j<m;j++){const a0=i/n*TAU,a1=(i+1)/n*TAU,e0=j/m*Math.PI/2,e1=(j+1)/m*Math.PI/2;
  const p=(a,e)=>[x+Math.cos(a)*Math.cos(e)*r,y+Math.sin(e)*r,z+Math.sin(a)*Math.cos(e)*r],nn=(a,e)=>[Math.cos(a)*Math.cos(e),Math.sin(e),Math.sin(a)*Math.cos(e)];
  for(const [a,e] of [[a0,e0],[a1,e1],[a1,e0],[a0,e0],[a0,e1],[a1,e1]]){const q=p(a,e),w=nn(a,e);pos.push(q[0],q[1],q[2]);nor.push(w[0],w[1],w[2]);col.push(c.r,c.g,c.b);}}}
 const gmin=(x,z,r)=>Math.min(terrainH(x-r,z-r),terrainH(x+r,z-r),terrainH(x+r,z+r),terrainH(x-r,z+r),terrainH(x,z));
 const R=KRAND,h=(i,k)=>R.unit(R.hash(1811,i,k));
 for(const H of TOWNREC.houses){const y0=gmin(H.x,H.z,Math.max(H.w,H.d)*.55)-.4,y1=y0+.4+H.h,white=h(H.i,0)<.55,wall=white?0xe6dccb:0xb89470,roof=white?0xd8cdb8:0xa88464;
  box(H.x,H.z,H.w/2,H.d/2,y0,y1,H.rot,wall,roof);box(H.x,H.z,H.w/2,H.d/2,y1,y1+.7,H.rot,wall,wall);box(H.x,H.z,H.w/2-.35,H.d/2-.35,y1,y1+.72,H.rot,roof,roof);   /* the parapet round a sunk roof */
  if(H.kind==='tower'){box(H.x,H.z,2.6,2.6,y1+.7,y1+9,H.rot,0xe8e0d0,0xe8e0d0);box(H.x,H.z,1.6,2.8,y1+9,y1+10.4,H.rot,0xd0c4ac,0xd0c4ac);}   /* the wind-catcher */
  if(H.kind==='shrine')dome(H.x,y1+.7,H.z,Math.min(H.w,H.d)*.42,0xf0ece2);
  OBSTACLES.push({x:H.x,z:H.z,r:Math.max(H.w,H.d)*.75});REGISTER({name:H.name,x:H.x,z:H.z,y:y0,r:Math.max(H.w,H.d)*.72,h:H.h+(H.kind==='tower'?11:2),house:true});}
 for(const G of TOWNREC.gardens){const cs=Math.cos(G.rot),sn=Math.sin(G.rot),P=(u,v)=>[G.x+u*cs-v*sn,G.z+u*sn+v*cs];
  const sides=[[-G.w/2,-G.d/2,G.w/2,-G.d/2],[G.w/2,-G.d/2,G.w/2,G.d/2],[G.w/2,G.d/2,-G.w/2,G.d/2],[-G.w/2,G.d/2,-G.w/2,-G.d/2]],gate=Math.floor(h(G.i,1)*4);
  sides.forEach((s,k)=>{const L=Math.hypot(s[2]-s[0],s[3]-s[1]),n=Math.ceil(L/6);for(let i=0;i<n;i++){const t0=i/n,t1=(i+1)/n;if(k===gate&&Math.abs((t0+t1)/2-.5)<.07)continue;
   const u=s[0]+(s[2]-s[0])*(t0+t1)/2,v=s[1]+(s[3]-s[1])*(t0+t1)/2,p=P(u,v),y0=gmin(p[0],p[1],L/n*.5)-.3;
   box(p[0],p[1],(k%2?.3:L/n/2+.15),(k%2?L/n/2+.15:.3),y0,y0+1.9,G.rot,0xb08c68,0xa8845e);}});
  OBSTACLES.push({x:G.x,z:G.z,r:Math.max(G.w,G.d)*.62});REGISTER({name:G.name,x:G.x,z:G.z,y:terrainH(G.x,G.z)-2,r:Math.hypot(G.w,G.d)*.5,h:G.kind==='dates'?24:G.kind==='figs'?22:6,garden:G.kind});}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
 const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true}));m.userData.host=true;m.userData.inspectLabel=TOWN.name;
 /* the probe counts a merged mesh by its points: one a house (a metre up) and one a garden wall */
 m.userData.probePoints=TOWNREC.houses.map(H=>[H.x,terrainH(H.x,H.z)+1,H.z]).concat(TOWNREC.gardens.map(G=>[G.x+Math.cos(G.rot)*G.w/2,terrainH(G.x,G.z)+.5,G.z+Math.sin(G.rot)*G.w/2])).flat();scene.add(m);return m;})();
(function(){
 const t0=performance.now();
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 const fauna=(kind,x,z)=>kind!=='deer'&&FIELD.lake(x,z)<.1&&FIELD.garden(x,z)<.5;
 try{window._biome=SEDESERT.build({R:TERR.R-150,quality:q,fauna});}catch(e){reportErr('biome: '+e.stack);}
 _mark('biome');
 // the gardens' own trees and beds, on the kit's stream (reseeded per garden by its index, so one garden is the same alone)
 try{const SP=SEDESERT.SPECIES,palm=SP.indexOf(SEDESERT.byKey.palm),fig=SP.indexOf(SEDESERT.byKey.figv),pom=SP.indexOf(SEDESERT.byKey.pom),LOD=BIO.LOD(),st={palms:0,figs:0,beds:0};
  BIO.cur='desert/trees';
  for(const G of TOWNREC.gardens){BIO.fn.reseed(88000+G.i);const cs=Math.cos(G.rot),sn=Math.sin(G.rot),P=(u,v)=>[G.x+u*cs-v*sn,G.z+u*sn+v*cs];
   const lvAt=(x,z)=>{const d=BIO.lodD(x,z);return d<LOD.hero?2:d<LOD.mid?1:0;};
   if(G.kind==='dates'){for(let u=-G.w/2+5;u<=G.w/2-5;u+=8)for(let v=-G.d/2+5;v<=G.d/2-5;v+=8){const p=P(u+BIO.fn.rr(-.6,.6),v+BIO.fn.rr(-.6,.6)),T=SEDESERT.make(palm,p[0],terrainH(p[0],p[1]),p[1]);
     {const A=SEDESERT.ABYSSAL.palm;T.H*=A.H;T.rb*=A.rb;T.crownR*=A.crownR;}const lv=lvAt(p[0],p[1]);if(SEDESERT.grow(T,lv)){st.palms++;if(lv===2)REGISTER({name:'Date palm (a walled grove)',key:'palm',x:T.x,z:T.z,y:T.y0,r:T.crownR,h:T.H+1});}}}
   else if(G.kind==='figs'){for(let k=0,n=Math.max(2,Math.round(G.w*G.d/2600));k<n;k++){const p=P(BIO.fn.rr(-.3,.3)*G.w,BIO.fn.rr(-.3,.3)*G.d),T=SEDESERT.make(k%3===2?pom:fig,p[0],terrainH(p[0],p[1]),p[1]);
     if(T.sp===fig){T.H*=.6;T.rb*=.55;T.crownR*=.55;}const lv=lvAt(p[0],p[1]);if(SEDESERT.grow(T,lv))st.figs++;}}
   else{for(let v=-G.d/2+3;v<=G.d/2-3;v+=2.4)for(let u=-G.w/2+3;u<=G.w/2-3;u+=1.6){if(lvAt(G.x,G.z)<2)break;const p=P(u,v),y=terrainH(p[0],p[1]),melon=Math.floor((v+G.d)/7)%2;
     SEDESERT.bed(p[0],y,p[1],melon);st.beds++;}}}
  BIO.cur=null;window._gardens=st;}catch(e){reportErr('gardens: '+e.stack);}
 const b=BIO.bake();
 window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:'Mantis\'s green pocket: the Socotran monsoon forest on the Bowl\'s south-west shore (the eastern desert, station 2b)',x:0,z:0,y:LAKE.level-8,r:TERR.R,h:400});
 _mark('bake');
})();
