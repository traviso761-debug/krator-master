// ================================================================= HOST — the Terraces: the fields and the orchards gone to thicket
// [draw] PLAN.md section 12, 2b: "the crop rows and orchards gone to thicket". The fields are the plan's records (41d: STAGE.plan.fields, each a
// parcel along the contour with its crop from kits/crops, AV.farmCrops: what the south-west lowlands' zones grow rain-fed, with a card). Each is
// drawn on core/biome as a kit of its own ('farmcrops'), its plants the crops kit's cards from its pack (station.json "packs": crops), one plant a
// cell of the card's 3 x 3 sheet (BIO.geo.cells: never the whole sheet on a quad), and made feral by the valley's wrap (46, AV.feralKit): the
// orchards' trees grown about their feet by the feral field, the crops' clumps grown about their own (o.floor). Gone wild: the rows broken, the
// gaps let in, the plants of a field's middle larger than at its hedge, suckers between the orchard's rows. Every field is registered before its
// plants are put. Built before the shared bake (88), which bakes it with the lowland kits' forest; the taint's tint reaches it there.
//   AV_THICKET: {ok, fields, plants, trees, grown, crops (names), sample ([x, z] of every fortieth plant, for the checks)}
const AV_THICKET=(function(){const out={ok:false,fields:0,plants:0,trees:0,grown:0,crops:[],sample:[]};const P=STAGE.plan,L=STAGE.crops||[];if(!P||!P.fields.length||!L.length)return out;
 const lib=f=>(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('crops',f):null;
 /* the crops kit's cards are pale (each to be tinted to its plant): the tint is the material's own colour (the first GPU run, 2026-11-10, drew the
    orchards' crowns white on instance colour alone), the instance colour a variation round it */
 /* core's foliage material (BIO.leafMat: Lambert, the two faces' light mixed, the wind, the fade): a Standard card went cream from under the canopy
    and black on its other face (its 4% specular at grazing, its normal flipped: the second GPU run, 2026-11-10; 30-core-foliage.js's own lesson) */
 /* the card loads UNFLIPPED (flipY false: row 0 of the sheet at v 0), the library's convention that BIO.geo.cells, the clump and the stand below
    all draw in, as BIO.libSwap loads its cards; with three's default flip every crop and orchard crown stood upside down and its cells were cut
    from the mirrored rows of the sheet (the owner, 2026-11-10: "cotton is upside down", "these plants seem weirdly cut-out") */
 const cardMat=(f,tint)=>{const Pk=lib(f),T=Pk?KMAT.textures(Pk,{aniso:4,flipY:false}):{};const m=BIO.leafMat(T.map||null,'thk.'+f,{alphaTest:.45});m.color.setRGB(tint[0],tint[1],tint[2]).convertSRGBToLinear();m.name='thicket.'+f;return m;};
 /* a plant standing on its foot: three vertical quads crossed at 60 degrees, 1 m wide and tall, the image's top (v 0, the library's convention) up */
 const stand=(function(){const pos=[],nor=[],uv=[];for(let k=0;k<3;k++){const a=k*Math.PI/3,c=Math.cos(a),s=Math.sin(a),n=[-s,0,c];const Q=[[-.5,0,1],[.5,0,1],[.5,1,0],[-.5,1,0]].map(q=>[c*q[0],q[1],s*q[0],q[0]+.5,q[2]]);
   [0,1,2,0,2,3].forEach(i=>{pos.push(Q[i][0],Q[i][1],Q[i][2]);nor.push(n[0],n[1],n[2]);uv.push(Q[i][3],Q[i][4]);});}return BIO.geo._make(pos,nor,uv);})();
 const prev=BIO.kit('farmcrops'),api={SPECIES:[],TREES:[]};
 /* the items: a crop's card as two sets of three cells (its rows show six of its nine plants), an orchard's crown as the clump's tripod in three cells,
    one trunk for every orchard tree */
 /* each plant cut by its own box on the sheet (41e, AV.CARD_RECTS: the crops kit's sheets are nine plants on a rough grid, and the even thirds
    sliced a straight edge through the leaves that reach past them: the owner, 2026-11-10, "the herbs still have a straight boundary") */
 const RX=f=>AV.CARD_RECTS&&AV.CARD_RECTS[f]||undefined;
 const hue=id=>KRAND.unit(KRAND.hash(STAGE.seed,id.length,id.charCodeAt(0),id.charCodeAt(id.length-1)));
 const items={};L.forEach((c,ci)=>{const h=hue(c.id),m=cardMat(c.fam,c.form==='tree'?[.56+.1*h,.70-.05*h,.34]:[.64+.12*h,.74-.06*h,.38]);   /* the cards are pale beige: these tints over them read as olive and leaf green (darker, the thicket read black from the air) */   /* sRGB: a first cut set these as linear and the crowns read cream (2026-11-10) */if(c.form==='tree'){const n='thk.crown.'+c.id;BIO.def(n,BIO.geo.cells(BIO.geo.clump(),{n:3,pick:[0,4,8],rects:RX(c.fam)}),m,{cls:'flora',kind:'tree',label:c.name+' (an orchard gone wild)',tags:{origin:'farm',crop:c.id}});items[c.id]=[n];api.SPECIES.push({key:c.id,name:c.name});}
  else{const a='thk.'+c.id+'.a',b='thk.'+c.id+'.b';BIO.def(a,BIO.geo.cells(stand.clone(),{n:3,pick:[0,4,8],scale:1,rects:RX(c.fam)}),m,{cls:'flora',kind:'plant',label:c.name+' (a field gone wild)',tags:{origin:'farm',crop:c.id}});
   /* each its own copy: BIO.geo.cells rewrites a non-indexed geometry's uv in place, and one shared stand, cut again for every crop, smeared its
      cells across the sheet (the fields drew as solid quads: the third GPU run, 2026-11-10) */
   BIO.def(b,BIO.geo.cells(stand.clone(),{n:3,pick:[2,6,7],scale:1,rects:RX(c.fam)}),m,{cls:'flora',kind:'plant',label:c.name+' (a field gone wild)',tags:{origin:'farm',crop:c.id}});items[c.id]=[a,b];}});
 /* the trunks are merged triangles (a bucket), not instances: the feral wrap grows a tree whose span holds triangles and keeps one of cards alone at
    its size (46: a cane palm's trunk is drawn apart from its fronds), so a trunk here lets the wrap grow the whole orchard tree (the first GPU run,
    2026-11-10: 24,877 orchard trees, none grown) */
 BIO.bucket('thk.bark',(m=>{m.name='thicket.bark';return m;})(BIO.barkMat(null,0xffffff)),{label:'an orchard tree\'s trunk'});
 const trunk=(x,y,z,h,r0,r1,col)=>{const n=5;for(let i=0;i<n;i++){const t0=i/n*TAU,t1=(i+1)/n*TAU,P=(t,r,yy)=>[x+Math.cos(t)*r,yy,z+Math.sin(t)*r],a=P(t0,r0,y),b=P(t1,r0,y),c=P(t1,r1,y+h),d=P(t0,r1,y+h);
   const ux=b[0]-a[0],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2],nx=-uz*vy,nz=ux*vy,out=nx*(Math.cos((t0+t1)/2))+nz*(Math.sin((t0+t1)/2));   /* (b-a) x (c-a), its horizontal part, against the outward */
   if(out>=0)BIO.quad('thk.bark',a,b,c,d,col);else BIO.quad('thk.bark',a,d,c,b,col);}};
 const byId={};L.forEach(c=>byId[c.id]=c);
 /* the fields, registered first; their trees as the wrap's records (one per tree, keyed by its foot) */
 P.fields.forEach(F=>{const c=byId[F.crop];if(!c)return;const ca=Math.cos(F.yaw),sa=Math.sin(F.yaw);REGISTER({name:(F.orchard?'An orchard of ':'A field of ')+c.name+', gone to thicket',kind:'field',x:F.x,z:F.z,y:F.y,r:Math.hypot(F.w,F.d)/2,h:F.orchard?9:3,tags:{kind:'field',crop:c.id,orchard:!!F.orchard}});out.fields++;
  if(!F.orchard)return;const u=k=>KRAND.unit(KRAND.hash(F.seed,k,0,0));
  /* the orchard's trees on an 11 m grid, one in seven gone, a sucker between the rows one place in four */
  for(let i=-3;i<=3;i++)for(let j=-2;j<=2;j++)for(let s=0;s<2;s++){const k=(i+4)*20+(j+3)*2+s;if(s?u(k)>.25:u(k)<.14)continue;const lu=(i+(s?.5:0))*11+(u(k+300)-.5)*3,lv=(j+(s?.5:0))*11+(u(k+600)-.5)*3;if(Math.abs(lu)>F.w/2-3||Math.abs(lv)>F.d/2-3)continue;
   const x=F.x+lu*ca-lv*sa,z=F.z+lu*sa+lv*ca;api.TREES.push({x,z,sp:api.SPECIES.findIndex(S=>S.key===c.id),seed:KRAND.hash(F.seed,k,7,0),H:(s?3.5:6)+3*u(k+900),sucker:!!s,crop:c.id});}});
 /* the trees: a trunk, three crowns of the clump about its top; BIO.owner names the tree (the wrap and the LOD read it) */
 /* nothing grows in a road: a field's checks sample its corners and edges, and a road can still cross its middle (the pods' view stood in an orchard
   on its own road, 2026-11-10); a tree within 4 m of a road's carriageway, a crop clump within 2.5, is not put */
 api.buildTrees=function(){BIO.range=1300;BIO.minRange=0;BIO.chunk=400;for(const T of api.TREES){if(P.roadD(T.x,T.z)<4){out.offRoad=(out.offRoad|0)+1;continue;}const y=terrainH(T.x,T.z),u=k=>KRAND.unit(KRAND.hash(T.seed,k,0,0)),th=T.H*.4,cr=items[T.crop][0],tint=.8+.2*u(1),C=new THREE.Color(tint,tint*(.95+.1*u(3)),tint*.95);
   BIO.owner=[T.x,T.z];const k0=.8+u(2)*.3;trunk(T.x,y-.2,T.z,th+.8,.2*k0,.11*k0,0x6e5a46);
   /* the crown: a clump at the top and four round it, each about the tree's height across (a cell's sprig is sparse: smaller, the crown read as a bare pole) */
   for(let k=0;k<5;k++){const a=u(10+k)*TAU,r=k?T.H*.26:0,cs=T.H*(k?.8:1.0);BIO.put(cr,[T.x+Math.cos(a)*r,y+th+T.H*(k?.2:.38),T.z+Math.sin(a)*r],BIO.fn.qEuler(0,u(20+k)*TAU,0),cs,C);}out.trees++;}
  BIO.owner=null;BIO.range=null;BIO.chunk=null;};
 /* the crops: rows along the contour every 4.5 m, a clump every 4 m along them; gone wild, the rows broken by a noise, the gaps let in, the clumps of
    a field's middle up to twice the size of its edge's */
 api.buildFloor=function(){BIO.range=650;BIO.minRange=0;BIO.chunk=300;BIO.owner=null;P.fields.forEach(F=>{if(F.orchard)return;const c=byId[F.crop];if(!c)return;const ca=Math.cos(F.yaw),sa=Math.sin(F.yaw),u=k=>KRAND.unit(KRAND.hash(F.seed,k,1,0)),its=items[c.id],base=[1,1,1];
   const nr=Math.floor(F.d/4.5),np=Math.floor(F.w/4);for(let r=0;r<nr;r++)for(let q=0;q<np;q++){const k=r*np+q,lu=-F.w/2+2+q*4+(u(k)-.5)*1.6,lv=-F.d/2+2.2+r*4.5+(u(k+5000)-.5)*1.2,x=F.x+lu*ca-lv*sa,z=F.z+lu*sa+lv*ca;
    const wild=KRAND.fbm(x*.03+F.seed%97,z*.03,0,2,F.seed|0);if(u(k+10000)>.35+.55*wild)continue;if(P.roadD(x,z)<2.5){out.offRoad=(out.offRoad|0)+1;continue;}
    const edge=Math.min(F.w/2-Math.abs(lu),F.d/2-Math.abs(lv)),sz=(1.1+1.2*u(k+15000))*(.7+.6*smooth(0,14,edge)),t=.8+.2*u(k+20000);
    BIO.put(its[u(k+25000)<.5?0:1],[x,terrainH(x,z)-.05,z],BIO.fn.qEuler(0,u(k+30000)*TAU,0),[sz,sz*(.9+.4*u(k+35000)),sz],new THREE.Color(base[0]*t,base[1]*t,base[2]*t));out.plants++;if(!(out.plants%40))out.sample.push([x,z]);}});
  BIO.range=null;BIO.chunk=null;};
 /* the feral wrap (46): the orchards' trees grown about their feet, capped at 14 m; the crops grown about their own (floor) */
 const g0=AV.FERAL.grown;AV.feralKit(api,{ground:terrainH,feral:AVQ_ON('feral')?(x,z)=>STAGE.F.feral(x,z):()=>0,capH:14,floor:true,seed:STAGE.seed+59});
 try{api.buildTrees();api.buildFloor();}catch(e){reportErr('thicket: '+(e.stack||e));}
 /* THE PODS' TOPS (the owner, 2026-11-10: "the growing pods themselves ought to be completely overgrown on top"). A pod's top is drawn three ways
    as the eye moves (70: a hero inside 600 m, but only the nearest 64; a box shell; an impostor), and in a honeycomb most pods within 600 m are
    shells, so cards set on the hero's surface by rays floated over the shells (the owner's view, 2026-11-10: "still some floating flora"), and on a
    gutted dome the rays fell through the ribs to the beds inside. So the cover is the station's own and the same at every tier: A MAT of vines over
    the dome, its facets the dome's own (the kit's rows, 54f: nine rows of a hexagon from the plinth's top to the lantern, 46f's numbers), lifted
    0.35 m off the glass, in quads the broadleaf card is laid on (alpha-tested: the vines' gaps), one quad in seven left open, and cut where the
    ruin tore the dome (MP.ruin, MP.tearAtXZ: a crown's top gone, a broken pod a ring, a stump nothing); merged, the pods of a 600 m cell in one
    mesh, a structure the cards stand on. THE CLUMPS on the mat: broadleaf and fern, one to a quad (two on the low rows), each foot on the mat. Every
    quad and foot is kept for the check (70t, FCHK.podTops: each foot within 0.5 m of its pod's mat). One volume a pod, registered first */
 out.podTops=[];out.podClumps=0;out.podQuads=0;
 try{const pm=[cardMat('card_broadleaf',[.80,.86,.74]),cardMat('card_fern_green',[.82,.88,.74])];
  BIO.def('pt.broadleaf',BIO.geo.clump(),pm[0],{cls:'flora',kind:'plant',label:'Broadleaf over a growing pod',tags:{origin:'podtop'}});
  BIO.def('pt.fern',BIO.geo.clump(),pm[1],{cls:'flora',kind:'plant',label:'Fern over a growing pod',tags:{origin:'podtop'}});
  const FP=MP.FAMILY.pod,FD=MP.FARM_DESIGN.pod,R0=FD.dome.r,HD=FD.dome.h,PH=FD.plinth,LR=FD.lantern,NR=9,LIFT=.35,SEG=5;
  /* the dome's rows as 54f draws them: [r, y] from the plinth's top to the lantern's ring */
  const ROWS=[];for(let i=0;i<=NR;i++){const r=R0*Math.cos(i/NR*Math.PI/2),y=PH+HD*Math.sin(i/NR*Math.PI/2);if(r<LR){ROWS.push([LR,PH+HD*Math.sqrt(Math.max(0,1-(LR/R0)*(LR/R0)))]);break;}ROWS.push([r,y]);}
  /* a point of the faceted dome: row band b at t (0..1 up the band), side k at s (0..1 along it), lifted off the glass */
  const at=(b,t,k,s)=>{const r=ROWS[b][0]+(ROWS[b+1][0]-ROWS[b][0])*t,y=ROWS[b][1]+(ROWS[b+1][1]-ROWS[b][1])*t,a0=k*Math.PI/3,a1=(k+1)*Math.PI/3,x=Math.cos(a0)*r+(Math.cos(a1)-Math.cos(a0))*r*s,z=Math.sin(a0)*r+(Math.sin(a1)-Math.sin(a0))*r*s,h=Math.hypot(x,z)||1,q=(h+LIFT)/h;return[x*q,y+LIFT*.6,z*q];};
  const matMap=(()=>{const Pk=lib('card_broadleaf');return Pk?KMAT.textures(Pk,{aniso:4,flipY:false}).map:null;})();
  const mmat=new THREE.MeshLambertMaterial({map:matMap||null,color:new THREE.Color(.78,.86,.70).convertSRGBToLinear(),alphaTest:matMap?.45:0,side:THREE.DoubleSide});mmat.name='podtop.mat';
  const CELLS=new Map(),V=new THREE.Vector3();
  BIO.range=900;BIO.minRange=0;BIO.chunk=200;BIO.owner=null;
  /* the tear cuts the dome of a crown, a broken pod, a stump and a skeleton (a gutted pod keeps its whole frame: only the glass went, the first cut of
     this mat stopped at the tear's height there and left the frames bare); a ruin's heaps (MP.heaps: KRUBBLE records, the surface their mesh is
     drawn from, KRUBBLE.at) take clumps on a 3 m grid where they rise over the plinth */
  const TORN={crown:1,broken:1,stump:1,skeleton:1};
  P.towers.forEach((t,ti)=>{if(t.family!=='pod'||t.state==='fallen')return;let RU=null;if(TORN[t.state]){try{RU=MP.ruin(FP,t.state);}catch(e){return;}}
   const Qt=avQuat(t),W=p=>{V.set(p[0],p[1],p[2]).applyQuaternion(Qt);return[t.x+V.x,t.y+V.y,t.z+V.z];},quads=[],feet=[];
   const keep=p=>!RU||p[1]<MP.tearAtXZ(FP,RU,p[0],p[2])-.4;
   for(let b=0;b+1<ROWS.length;b++)for(let k=0;k<6;k++)for(let g=0;g<SEG;g++){const h=KRAND.hash(STAGE.seed+73,ti,b*6+k,g),u=n=>KRAND.unit(KRAND.hash(h,n,0,0));if(u(1)<.14)continue;
    const L=[at(b,0,k,g/SEG),at(b,0,k,(g+1)/SEG),at(b,1,k,(g+1)/SEG),at(b,1,k,g/SEG)];if(!L.every(keep))continue;quads.push(L.map(W));
    const nc=b<3?2:1;for(let c=0;c<nc;c++)feet.push(at(b,.15+.7*u(2+c),k,(g+.15+.7*u(4+c))/SEG));}
   const HP=RU&&MP.heaps?MP.heaps(FP,t.state):[],heapFeet=[];
   if(HP.length)for(let j=-12;j<=12;j++)for(let i=-12;i<=12;i++){const h=KRAND.hash(STAGE.seed+77,ti,i+20,j+20),u=n=>KRAND.unit(KRAND.hash(h,n,0,0)),lx=(i+((j&1)?.5:0))*3+(u(1)-.5)*1.2,lz=j*3*.866+(u(2)-.5)*1.2;
    const y=KRUBBLE.at(HP,lx,lz);if(!(y>PH+.3))continue;heapFeet.push([lx,y-.15,lz]);}
   if(!quads.length&&!heapFeet.length){out.podTops.push({t,feet:[],quads:[],heap:[]});return;}
   REGISTER({name:'A growing pod overgrown on top',kind:'podtop',x:t.x,z:t.z,y:t.y+(quads.length?PH-1:0),r:R0+6,h:HD+6,tags:{kind:'podtop',family:'pod',state:t.state,quads:quads.length}});
   const ck=Math.floor(t.x/600)+','+Math.floor(t.z/600);let C=CELLS.get(ck);if(!C)CELLS.set(ck,C=[]);quads.forEach(q=>C.push(q));out.podQuads+=quads.length;
   const fw=feet.concat(heapFeet).map(W);fw.forEach((w,i)=>{const h=KRAND.hash(STAGE.seed+75,ti,i,0),u=n=>KRAND.unit(KRAND.hash(h,n,0,0)),sz=1.7+1.6*u(3),c=.82+.18*u(4);
    BIO.put(u(5)<.7?'pt.broadleaf':'pt.fern',w,BIO.fn.qEuler(0,u(6)*TAU,0),[sz,sz*(.75+.45*u(7)),sz],new THREE.Color(c,c*(.96+.08*u(8)),c*.94));out.podClumps++;});
   out.podTops.push({t,feet:fw.slice(0,feet.length),quads,heap:heapFeet});});
  BIO.range=null;BIO.chunk=null;
  /* the mats, a mesh a 600 m cell: two triangles a quad, the card across it (v 0 at the top: the library's unflipped convention) */
  CELLS.forEach((Q,ck)=>{const pos=[],uv=[],U=[[0,1],[1,1],[1,0],[0,0]];Q.forEach(q=>{[0,1,2,0,2,3].forEach(i=>{pos.push(q[i][0],q[i][1],q[i][2]);uv.push(U[i][0],U[i][1]);});});
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();g.computeBoundingSphere();
   const m=new THREE.Mesh(g,mmat);m.name='podtop.mat.'+ck;m.userData.host=true;m.userData.inspectLabel='vines over a growing pod';scene.add(m);});
 }catch(e){reportErr('pod tops: '+(e.stack||e));}
 window.AV_POD_TOPS=out.podTops;
 /* THE STREETS GRASSED OVER (the owner, 2026-11-10: the transit kit's streets "integrated in an overgrown and ruined way"): the roads are the
    transit kit's (46z STAGE.transit, drawn by 74); the weeds come up through them where the asphalt cracked, along a ridged noise's lines (the
    cracks), the kerb's joint and the carriageway's middle seam, thicker where the feral field is; a bush on the pavement here and there. Each
    stands on the road's own surface (Rd.levelAt), one record a road registered first; a weed every fortieth is kept for the check */
 out.weeds=0;out.roadBush=0;out.weedSample=[];
 try{const TR=STAGE.transit;if(TR&&TR.net){const wm=[cardMat('card_ichu',[.86,.88,.74]),cardMat('card_fern_green',[.80,.86,.72])];
  BIO.def('rw.grass.a',stand.clone(),wm[0],{cls:'flora',kind:'plant',label:'Grass through the cracked asphalt',tags:{origin:'street'}});
  BIO.def('rw.fern',BIO.geo.clump(),wm[1],{cls:'flora',kind:'plant',label:'A fern in the kerb\'s joint',tags:{origin:'street'}});
  BIO.range=700;BIO.minRange=0;BIO.chunk=300;BIO.owner=null;
  TR.net.roads.forEach((Rd,ri)=>{const Pt=Rd.path,L=Pt.L||Rd.L,w=Rd.width/2,pv=Rd.pavement==null?0:Rd.pavement,a=Pt.at(0),b=Pt.at(L);
   REGISTER({name:'Weeds through the street '+TR.defs[ri].id,kind:'weeds',x:(a.x+b.x)/2,z:(a.z+b.z)/2,y:Math.min(a.yG,b.yG)-3,r:Math.hypot(b.x-a.x,b.z-a.z)/2+w+pv+4,h:Math.abs(b.yG-a.yG)+8,tags:{kind:'weeds',road:TR.defs[ri].id}});
   for(let sA=1;sA<L-1;sA+=1.8)for(let off=-(w+pv)+.4;off<=w+pv-.4;off+=1.3){const h=KRAND.hash(STAGE.seed+79,ri,Math.round(sA*10),Math.round(off*10)),u=k=>KRAND.unit(KRAND.hash(h,k,0,0));
    const q=Pt.lateral(sA,off),x=q[0]+(u(1)-.5)*1.1,z=q[1]+(u(2)-.5)*1.1,fe=STAGE.F.feral(x,z),cr=1-Math.abs(2*KRAND.fbm(x*.09+3.1,z*.09-1.7,0,3,STAGE.seed+81)-1),ao=Math.abs(off);
    const pave=ao>w+.25,seam=Math.abs(ao-w)<.7||ao<.5,keep=cr>.84?.85:seam?.45:pave?.22:.04;if(u(3)>keep*(.55+.6*fe))continue;
    const y=Rd.levelAt(x,z);if(!isFinite(y))continue;
    if(pave&&u(4)<.12){const sz=1.2+1.4*u(5);BIO.put('rw.fern',[x,y-.05,z],BIO.fn.qEuler(0,u(6)*TAU,0),[sz,sz*(.8+.4*u(7)),sz],new THREE.Color(.85,.9,.82));out.roadBush++;}
    else{const sz=.55+.75*u(5)*(.6+.6*cr),c=.8+.2*u(8);BIO.put('rw.grass.a',[x,y-.03,z],BIO.fn.qEuler(0,u(6)*TAU,0),[sz,sz*(.8+.5*u(7)),sz],new THREE.Color(c,c,c*.92));}
    out.weeds++;if(!(out.weeds%40))out.weedSample.push([x,y,z,ri]);}});
  BIO.range=null;BIO.chunk=null;}}catch(e){reportErr('street weeds: '+(e.stack||e));}
 BIO.kitEnd(api);BIO.kit(prev||'');out.unmapped=Object.values(BIO.kits.farmcrops?BIO.kits.farmcrops.defs:{}).filter(d=>d.mat&&d.mat.isMaterial&&/thicket\.card/.test(d.mat.name||'')&&!d.mat.map).map(d=>d.mat.name);
 /* every card quad inside one plant's box of its sheet (a third each way, or its plant's box, 41e, at most 0.6): a quad wider shows several plants */
 out.cellBad=[];{const D=BIO.kits.farmcrops?BIO.kits.farmcrops.defs:{};for(const n in D){if(!/^thk\.(?!trunk)/.test(n))continue;const U=D[n].geo.attributes.uv.array;for(let q=0;q*12<U.length;q++){let u0=9,u1=-9,v0=9,v1=-9;for(let v=0;v<6;v++){const u=U[q*12+v*2],w=U[q*12+v*2+1];u0=Math.min(u0,u);u1=Math.max(u1,u);v0=Math.min(v0,w);v1=Math.max(v1,w);}if(u1-u0>.6||v1-v0>.6){out.cellBad.push(n);break;}}}}
 out.grown=AV.FERAL.grown-g0;out.crops=L.map(c=>c.name);out.ok=out.plants>0;_mark('thicket');return out;})();
