// ================================================================= HOST — the cloud forest's layout: the cairns
// What the natives have made of the flank, as RECORDS first (README.md: a world rule lives in data, the drawing is only its
// picture), then drawn:
//   CAIRNS   stones stacked beside the trail every ~150 m, so it can be found in the cloud; at the saddle a great cairn with
//            a carved post and offerings of resin (culture: the Throne's natives)
// Runs before 88 builds the kit: each cairn is an obstacle it plants round.
const CLOUD={cairns:[],paths:TRAILS.map((T,i)=>({id:'path_'+i,kind:T.kind,owner:T.owner,name:T.name,width:T.width,n:T.pts.length,start:T.pts[0],end:T.pts[T.pts.length-1]}))};
(function(){const R=BIO.fn.reseed;R(8601);
 const C=h=>new THREE.Color(h),rr2=BIO.fn.rr,ri2=BIO.fn.ri,pk=BIO.fn.pick,Y=(x,z)=>terrainH(x,z),qE=(a,b,c)=>BIO.fn.qEuler(a,b,c);
 const lib=n=>(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('throne',n):null;
 const tex=n=>{const L=lib(n);return L?KMAT.textures(L,{aniso:4}).map:null;};
 BIO.def('cairnstone',new THREE.IcosahedronGeometry(1,0),BIO.solidMat(tex('stone.pumice')),{label:'Cairn stones'});
 BIO.def('offering',new THREE.IcosahedronGeometry(1,0),BIO.solidMat(null),{label:'Offerings (resin cakes)'});
 BIO.bucket('post',BIO.barkMat(tex('bark.elfin')),{label:'A carved post',uvScale:[1,1.4]});
 const stone=(x,y,z,s)=>BIO.put('cairnstone',[x,y,z],qE(rr2(-.4,.4),rr2(0,TAU),rr2(-.4,.4)),[s*1.2,s*.7,s],C(pk([0x6a6660,0x5e5a54,0x76706a])).lerp(C(0x5a7a32),rr2(.1,.35)));
 // a trail cairn: a little stack; the great cairn: a mound of stones in rings, each ring smaller, a cone 2-3 m high
 const cairn=(x,z,big)=>{const y=Y(x,z);let h=y-.1;
  if(!big){for(let k=0,n=ri2(4,7);k<n;k++){const s=.55*(1-k/n*.6)*rr2(.85,1.15);stone(x,h+s*.45,z,s);h+=s*.75;}return h;}
  for(let L=0;L<6;L++){const R=1.9*(1-L/6),n=Math.max(1,Math.round(TAU*R/.75)),s=.5*(1-L*.08);for(let k=0;k<n;k++){const a=k/n*TAU+L*.4+rr2(-.1,.1);stone(x+Math.cos(a)*R,h+s*.4,z+Math.sin(a)*R,s*rr2(.85,1.15));}if(R<.4)stone(x,h+s*.4,z,s);h+=s*.62;}
  return h;};
 // along the trail, every ~150 m, a pace or two off it
 TRAILS.forEach(T=>{let acc=0;const P=T.pts;
  for(let i=1;i<P.length;i++){acc+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);if(acc<150)continue;acc=0;
   const a=Math.atan2(P[i][1]-P[i-1][1],P[i][0]-P[i-1][0])+Math.PI/2*(rng()<.5?1:-1),x=P[i][0]+Math.cos(a)*rr2(1.8,2.6),z=P[i][1]+Math.sin(a)*rr2(1.8,2.6);
   if(waterH(x,z)>-1e8)continue;cairn(x,z,false);CLOUD.cairns.push({x,z,kind:'trail cairn',culture:'throne-natives',trail:0});OBSTACLES.push({x,z,r:1.5});
   REGISTER({name:'A trail cairn (the natives\')',x,z,y:Y(x,z)-1,r:1.8,h:4,cairn:true,culture:'throne-natives'});}});
 // the saddle's great cairn: a carved post in it, resin cakes laid on its stones
 {const S=RIDGE.saddle,P=TRAILS[0].pts;let best=P[0],bd=1e9;for(const p of P){const d=Math.hypot(p[0]-S.x,p[1]-RIDGE.zc(S.x));if(d<bd){bd=d;best=p;}}
  const x=best[0]+2.6,z=best[1]-1.6,top=cairn(x,z,true),y=Y(x,z),pc=C(0x5a4e3e);
  BIO.tube('post',[{x,y:y-.5,z,r:.16,col:pc},{x,y:top+1.4,z,r:.13,col:pc},{x,y:top+1.7,z,r:.02,col:pc}],pc,{seg:6,cap:true,rfn:(i,a)=>1+.15*Math.sin(a*4+i*2)});
  for(let k=0;k<6;k++){const a=rr2(0,TAU),d=rr2(.9,1.5),s=rr2(.07,.11);BIO.put('offering',[x+Math.cos(a)*d,y+rr2(.3,1.1),z+Math.sin(a)*d],qE(rr2(0,3),rr2(0,3),0),[s,s*1.3,s],C(pk([0x8a1a12,0x9a2418])));}
  CLOUD.cairns.push({x,z,kind:'saddle cairn',culture:'throne-natives',trail:0,offerings:6,post:true});OBSTACLES.push({x,z,r:3});
  REGISTER({name:'The saddle\'s great cairn (a carved post, offerings of resin)',x,z,y:y-1,r:3,h:top-y+3,cairn:true,culture:'throne-natives'});}
 _mark('layout');
})();
