// ================================================================= HOST — the isle's layout: the geysers' cones, the drowned trees, the camp, the canoes
// What the springs and the natives have made of the crown, as RECORDS first (README.md: a world rule lives in data, the
// drawing is only its picture), then drawn:
//   CONES     the Great Geyser's cone of geyserite on its mound, the Fountain's sinter lip round its pool
//   SNAGS     the drowned trees at the basin's edge: the sinter spread into the forest and killed it, and the trunks
//             stand bleached, white to the height the silica climbed ("bobby socks", as in Yellowstone)
//   CAMP      the resin-tappers' camp on the warm ground (culture: the Throne's natives): lean-tos, a hearth, a rack of
//             resin cakes drying, pots; the spice trees round it tapped (ISLE.tap, after the kit has grown them: 88)
//   CANOES    their outrigger dugouts drawn up at the landing on the west beach
// Runs before 88 builds the kit: the camp, the cones and the snags are obstacles it plants round.
const ISLE={geysers:GEYSERS.map(G=>({key:G.key,name:G.name,x:G.x,z:G.z,period:G.period,dur:G.dur,H:G.H})),springs:POOLS.map(P=>({key:P.key,name:P.name,x:P.x,z:P.z,r:P.r,temp:P.temp})),
 camp:{x:CAMP.x,z:CAMP.z,name:CAMP.name,culture:CAMP.culture,owner:CAMP.owner,shelters:[],hearth:null,racks:[],pots:0},canoes:[],snags:[],tapped:[],paths:[]};
(function(){const R=BIO.fn.reseed;R(8601);
 const C=h=>new THREE.Color(h),rr2=BIO.fn.rr,ri2=BIO.fn.ri,pk=BIO.fn.pick,rg=BIO.fn.rng,Y=(x,z)=>terrainH(x,z),qE=(a,b,c)=>BIO.fn.qEuler(a,b,c);
 // ---- the host's own items and buckets (the default kit's registry; the bake draws every kit's)
 const lib=n=>(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('throne',n):null;
 const tex=n=>{const L=lib(n);return L?KMAT.textures(L,{aniso:4}).map:null;};
 BIO.bucket('sinter',BIO.barkMat(tex('ground.sinter')),{label:'Geyserite (the cones and lips)',uvScale:[2,2]});
 BIO.bucket('snag',BIO.barkMat(tex('bark.mangrove')),{label:'Drowned trees (bleached)',uvScale:[1.6,2]});
 BIO.bucket('pole',BIO.barkMat(tex('bark.palm')),{label:'Poles and hulls',uvScale:[1,1.4]});
 BIO.def('thatch',new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),BIO.solidMat(tex('roof.thatch')||tex('ground.litter')),{label:'Thatch (frond mats)'});
 BIO.def('hearthstone',new THREE.IcosahedronGeometry(1,0),BIO.solidMat(tex('stone.pumice')),{label:'Hearth stones'});
 BIO.def('ash',new THREE.CircleGeometry(1,14).rotateX(-Math.PI/2),BIO.solidMat(null),{label:'Hearth ash'});
 BIO.def('pot',new THREE.LatheGeometry([[.001,0],[.45,.05],[.62,.35],[.55,.7],[.32,.86],[.3,1]].map(p=>new THREE.Vector2(p[0],p[1])),9),BIO.solidMat(null),{label:'Resin pots (gourds)'});
 BIO.def('cake',new THREE.IcosahedronGeometry(1,0),BIO.solidMat(null),{label:'Resin cakes'});
 BIO.def('hollow',new THREE.CircleGeometry(1,12).rotateX(-Math.PI/2),BIO.solidMat(null),{label:'A canoe\'s hollow'});
 BIO.def('vent',new THREE.CircleGeometry(1,10).rotateX(-Math.PI/2),BIO.solidMat(null),{label:'A geyser\'s vent'});

 // ---- CONES: the Great Geyser's: a squat cone of geyserite, beaded and lumpy, streaked with orange where the water runs
 // off it; a dark vent in its top. The Fountain's: a low lip round its pool
 {const G=GEYSERS[0],y=Y(G.x,G.z),P=[],n=7;
  for(let i=0;i<=n;i++){const t=i/n;P.push({x:G.x,y:y-.6+(G.ch+.6)*t,z:G.z,r:G.cone*mix(1.35,.45,Math.pow(t,.8)),col:C(0xd8d2c4).lerp(C(0xc07a3a),smooth(.2,.6,t)*.35*(i%2))});}
  BIO.tube('sinter',P,C(0xd8d2c4),{seg:22,cap:true,rfn:(i,a)=>1+.12*Math.sin(a*5+i*1.7)+.08*Math.sin(a*11+i)});
  BIO.put('vent',[G.x,y+G.ch+.08,G.z],null,G.cone*.32,C(0x2a2622));OBSTACLES.push({x:G.x,z:G.z,r:G.mound*.8});}
 {const G=GEYSERS[1],P=POOLS.find(p=>p.geyser===G.key),i=POOLS.indexOf(P),lv=POOLL[i];
  for(let k=0;k<26;k++){const a=k/26*TAU,r=P.r*rr2(1.02,1.12),x=P.x+Math.cos(a)*r,z=P.z+Math.sin(a)*r,s=rr2(.35,.6);
   BIO.tube('sinter',[{x,y:Math.min(Y(x,z),lv)-.2,z,r:s},{x,y:lv+.18,z,r:s*.7}],C(0xd0cabc),{seg:6,cap:true});}
  BIO.put('vent',[P.x,lv-1.2,P.z],null,P.r*.28,C(0x0a2a4a));   // its throat, dark under the water
  OBSTACLES.push({x:G.x,z:G.z,r:G.mound*.9});}
 POOLS.forEach(P=>OBSTACLES.push({x:P.x,z:P.z,r:P.r*1.25}));OBSTACLES.push({x:MUD.x,z:MUD.z,r:MUD.r*1.1});

 // ---- SNAGS: round the basin's rim where the sinter meets the forest, a ragged band; bleached trunks, a few limbs left,
 // white to a metre or so where the silica climbed them
 for(let k=0,tries=0;k<34&&tries<900;tries++){const a=rr2(0,TAU),e=rr2(.9,1.12),au=Math.cos(a)*BASIN.ra*e,bv=Math.sin(a)*BASIN.rb*e,p=bxz(au,bv),x=p[0],z=p[1];
  if(OBSTACLES.some(o=>Math.hypot(o.x-x,o.z-z)<o.r+4)||PATHGRID.at(x,z)<3)continue;
  const y=Y(x,z),H=rr2(6,17),r0=rr2(.25,.55),la=rr2(0,TAU),lean=rr2(0,.08),sock=rr2(.8,1.6),grey=C(pk([0x8a8478,0x7a746a,0x948e82])),white=C(0xe8e4d8);
  const P=[];for(let i=0;i<=6;i++){const t=i/6,h=H*t;P.push({x:x+Math.cos(la)*lean*h,y:y-.4+h,z:z+Math.sin(la)*lean*h,r:mix(r0,r0*.35,t),col:h<sock?white:grey});}
  P[1].col=white;BIO.tube('snag',P,grey,{seg:8,cap:true});
  for(let j=0,m=ri2(0,3);j<m;j++){const q=P[ri2(3,5)],b=rr2(0,TAU),L=rr2(1.2,3.5);BIO.tube('snag',[{x:q.x,y:q.y,z:q.z,r:q.r*.45,col:grey},{x:q.x+Math.cos(b)*L,y:q.y+rr2(.3,1.4),z:q.z+Math.sin(b)*L,r:.04,col:grey}],grey,{seg:4});}
  ISLE.snags.push({x,z,H});OBSTACLES.push({x,z,r:2});k++;}
 REGISTER({name:'The drowned trees (killed where the sinter spread)',x:BASIN.x,z:BASIN.z,y:basinFloor(BASIN.x,BASIN.z)-4,r:BASIN.ra*1.15,h:30,snags:true});

 // ---- CAMP: three lean-tos round a hearth, their open sides to it; a rack of resin cakes; pots
 {const cx=CAMP.x,cz=CAMP.z,pole=C(0x7a6248),thatch=C(0x8a7a4a);
  // the hearth: a ring of stones, ash
  const hy=Y(cx,cz);BIO.put('ash',[cx,hy+.02,cz],null,[1.1,1,1.1],C(0x5a5650));for(let k=0;k<11;k++){const a=k/11*TAU,s=rr2(.18,.28);BIO.put('hearthstone',[cx+Math.cos(a)*1.15,hy+s*.4,cz+Math.sin(a)*1.15],qE(rr2(-.5,.5),rr2(0,TAU),rr2(-.5,.5)),[s*1.2,s*.8,s],C(0x6a6460));}
  ISLE.camp.hearth={x:cx,z:cz};
  for(let k=0;k<3;k++){const a=k/3*TAU+rr2(-.2,.2)+.4,d=rr2(6,8),x=cx+Math.cos(a)*d,z=cz+Math.sin(a)*d,face=a+Math.PI,W=rr2(3.2,4.2),D=rr2(2.4,3),Hh=rr2(1.9,2.3),y=Y(x,z);
   // a ridge pole on two forked posts, the roof sloping from it down to the ground at the back
   const fx=Math.cos(face),fz=Math.sin(face),sx=-fz,sz=fx,front=[x+fx*D*.5,z+fz*D*.5],back=[x-fx*D*.5,z-fz*D*.5];
   for(const s of [-1,1]){const px=front[0]+sx*W*.5*s,pz=front[1]+sz*W*.5*s;BIO.tube('pole',[{x:px,y:Y(px,pz)-.3,z:pz,r:.06,col:pole},{x:px,y:y+Hh,z:pz,r:.05,col:pole}],pole,{seg:5,cap:true});}
   BIO.tube('pole',[{x:front[0]-sx*W*.55,y:y+Hh,z:front[1]-sz*W*.55,r:.05,col:pole},{x:front[0]+sx*W*.55,y:y+Hh,z:front[1]+sz*W*.55,r:.05,col:pole}],pole,{seg:5,cap:true});
   const slope=Math.atan2(Hh,D),len=Math.hypot(Hh,D);
   BIO.put('thatch',[x,y+Hh*.5,z],qE(-slope,-face+Math.PI/2,0),[W*1.1,1,len*1.08],thatch);
   BIO.put('thatch',[x-fx*.1,y+.05,z-fz*.1],qE(0,-face+Math.PI/2,0),[W*.8,1,D*.7],C(0x6a5a3a));   // a sleeping mat
   ISLE.camp.shelters.push({x,z,face,W,D,kind:'lean-to'});OBSTACLES.push({x,z,r:W*.7});}
  // the rack: two posts and a bar, resin cakes hung on it to cure (the spice's red)
  {const a=rr2(0,TAU),x=cx+Math.cos(a)*4.4,z=cz+Math.sin(a)*4.4,y=Y(x,z),b=a+Math.PI/2,ex=Math.cos(b)*1.4,ez=Math.sin(b)*1.4;
   for(const s of [-1,1])BIO.tube('pole',[{x:x+ex*s,y:y-.2,z:z+ez*s,r:.05,col:pole},{x:x+ex*s,y:y+1.6,z:z+ez*s,r:.045,col:pole}],pole,{seg:5,cap:true});
   BIO.tube('pole',[{x:x-ex*1.1,y:y+1.55,z:z-ez*1.1,r:.035,col:pole},{x:x+ex*1.1,y:y+1.55,z:z+ez*1.1,r:.035,col:pole}],pole,{seg:4,cap:true});
   for(let k=0;k<9;k++){const t=(k+.5)/9*2-1,s=rr2(.07,.11);BIO.put('cake',[x+ex*t,y+1.42-rr2(0,.08),z+ez*t],qE(rr2(0,3),rr2(0,3),0),[s,s*1.3,s],C(pk([0x8a1a12,0x9a2418,0x6e140e])));}
   ISLE.camp.racks.push({x,z,cakes:9});OBSTACLES.push({x,z,r:2});}
  // pots: gourds of collected resin by the hearth
  for(let k=0;k<7;k++){const a=rr2(0,TAU),d=rr2(1.9,3.2),x=cx+Math.cos(a)*d,z=cz+Math.sin(a)*d,s=rr2(.22,.38);BIO.put('pot',[x,Y(x,z),z],qE(0,rr2(0,TAU),0),s,C(pk([0x9a7a3a,0x8a6a30,0xa8884a])));ISLE.camp.pots++;}
  OBSTACLES.push({x:cx,z:cz,r:CAMP.r*.8});
  REGISTER({name:CAMP.name+' (the Throne\'s natives)',x:cx,z:cz,y:hy-2,r:CAMP.r,h:8,camp:true,culture:CAMP.culture});}

 // ---- CANOES: outrigger dugouts drawn up on the sand at the landing, bows up the beach
 {const up=Math.atan2(DOME.cz-LANDING.z,DOME.cx-LANDING.x),hull=C(0x5a3e28),pole=C(0x7a6248);
  for(let k=0;k<3;k++){const off=(k-1)*3.2,sx=-Math.sin(up),sz=Math.cos(up),bx=LANDING.x+sx*off+Math.cos(up)*rr2(8,14),bz=LANDING.z+sz*off+Math.sin(up)*rr2(8,14),L=rr2(6,8.5),a=up+rr2(-.15,.15),dx=Math.cos(a),dz=Math.sin(a);
   const P=[];for(let i=0;i<=6;i++){const t=i/6-.5,x=bx+dx*L*t,z=bz+dz*L*t;P.push({x,y:Y(x,z)+.32+.25*Math.pow(Math.abs(t)*2,3),z,r:.36*Math.pow(Math.cos(t*Math.PI*.95),.6)+.03,col:hull});}
   BIO.tube('pole',P,hull,{seg:8,cap:true,rfn:(i,an)=>Math.sin(an)>.2?.8:1});
   BIO.put('hollow',[bx,P[3].y+.34,bz],qE(0,-a,0),[L*.4,1,.24],C(0x2a1e14));
   // the outrigger: a float on two booms, to the seaward side
   const fx=bx+sx*2.1,fz=bz+sz*2.1,F=[];for(let i=0;i<=4;i++){const t=i/4-.5,x=fx+dx*L*.6*t,z=fz+dz*L*.6*t;F.push({x,y:Y(x,z)+.12,z,r:.11*Math.cos(t*2.8)+.02,col:hull});}
   BIO.tube('pole',F,hull,{seg:6,cap:true});
   for(const t of [-.18,.18]){const x0=bx+dx*L*t,z0=bz+dz*L*t;BIO.tube('pole',[{x:x0,y:P[3].y+.38,z:z0,r:.04,col:pole},{x:x0+sx*2.1,y:Y(x0+sx*2.1,z0+sz*2.1)+.25,z:z0+sz*2.1,r:.035,col:pole}],pole,{seg:4,cap:true});}
   ISLE.canoes.push({x:bx,z:bz,a,L,kind:'outrigger dugout',owner:CAMP.owner,culture:CAMP.culture});OBSTACLES.push({x:bx,z:bz,r:L*.55});}
  REGISTER({name:LANDING.name,x:LANDING.x,z:LANDING.z,y:SEA-2,r:30,h:12,landing:true,culture:CAMP.culture});}
 ISLE.paths=TRAILS.map((T,i)=>({id:'path_'+i,kind:T.kind,owner:T.owner,name:T.name,width:T.width,n:T.pts.length,start:T.pts[0],end:T.pts[T.pts.length-1]}));
 _mark('layout');
})();
// ---- TAPPING (after the kit has grown its trees, 88): the wild spice trees nearest the camp, each with a cut in its bark
// facing the camp, the red resin run down from it into a gourd tied under it (the record: which tree, where)
ISLE.tap=function(){const C=h=>new THREE.Color(h),rr2=BIO.fn.rr;BIO.fn.reseed(8602);const sp=THRONE.SPECIES.indexOf(THRONE.byKey.spice);
 const near=THRONE.TREES.filter(T=>T.sp===sp&&T.lv===2&&Math.hypot(T.x-CAMP.x,T.z-CAMP.z)<160).sort((a,b)=>Math.hypot(a.x-CAMP.x,a.z-CAMP.z)-Math.hypot(b.x-CAMP.x,b.z-CAMP.z)).slice(0,10);
 for(const T of near){const a=Math.atan2(CAMP.z-T.z,CAMP.x-T.x)+rr2(-.5,.5),r=T.rb*1.05,h=rr2(.9,1.3),x=T.x+Math.cos(a)*r,z=T.z+Math.sin(a)*r,y=T.y0+h;
  // the cut (a dark V of the bared wood), the run of resin, the gourd
  BIO.tube('pole',[{x,y:y+.18,z,r:.035,col:C(0x3a1a10)},{x:x+Math.cos(a)*.01,y:y-.02,z:z+Math.sin(a)*.01,r:.03,col:C(0x8a1a12)},{x:x+Math.cos(a)*.03,y:y-.35,z:z+Math.sin(a)*.03,r:.018,col:C(0x9a2418)}],C(0x8a1a12),{seg:4,cap:true});
  BIO.put('pot',[x+Math.cos(a)*.14,y-.62,z+Math.sin(a)*.14],BIO.fn.qEuler(0,rr2(0,TAU),0),.16,C(0x9a7a3a));
  ISLE.tapped.push({x:T.x,z:T.z,cut:[x,y,z],culture:CAMP.culture,by:CAMP.name});}
 return ISLE.tapped.length;};
