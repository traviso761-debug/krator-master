// ================================================================= THE CUT — the cutters' camp (props for Dilihan's kit to take over)
// [draw] Dilihan's bamboo cutters keep camps in the hyperbamboo's shade by the lakes (PLAN.md section 6). The owner,
// 2026-10-26: props only, tagged so a future Dilihan kit (an Iziz vassal kit, settlements/iziz/VASSAL-KITS.md) can take
// them over. Every prop is an item whose core/tags set says so, and the camp a registered volume with the same tags:
//   culture 'iziz', style 'dilihan', role 'placeholder', job 'carpentry', variant (culm stack, drying rack, lean-to, hearth)
// CUT.planCamp({x, z, ground, toBowl}) -> the camp's record (its props, each {item, m, col}); CUT.drawCamp(rec).
(function(){const T3=BIO.host.THREE,TAU=Math.PI*2;
 const U=(a,b,salt)=>KRAND.unit(KRAND.hash(CUT.SEED,a|0,b|0,salt|0,91));
 const mix=(a,b,t)=>a+(b-a)*t;
 const TAG=v=>({culture:'iziz',style:'dilihan',role:'placeholder',job:'carpentry',variant:v,setting:'outdoor'});
 CUT.CAMP_TAGS=TAG('camp');
 const G=CUT.G;
 const thatch=BIO.canvasTex(128,128,(g,w,h)=>{g.fillStyle='#8a8060';g.fillRect(0,0,w,h);for(let i=0;i<220;i++){const x=(i*37)%w,y=(i*61)%h;g.strokeStyle=i%3?'rgba(60,50,30,.35)':'rgba(220,210,170,.3)';g.beginPath();g.moveTo(x,y);g.lineTo(x+((i*7)%9)-4,y+18);g.stroke();}});
 const MAT={pole:CUT.MAT.culm,thatch:new T3.MeshLambertMaterial({color:0xffffff,map:thatch,side:T3.DoubleSide}),stone:BIO.solidMat(null,0xffffff),ash:new T3.MeshLambertMaterial({color:0x3a3632})};
 Object.assign(CUT.MAT,{campThatch:MAT.thatch});
 const disc=()=>{const g=new T3.CircleGeometry(.5,14);g.rotateX(-Math.PI/2);return g;};
 BIO.def('campStack',G.culm(2,8,null,null,true),MAT.pole,{label:'A stack of cut culms (the cutters\' camp)',cls:'prop',kind:'culm stack',tags:TAG('culm stack')});
 BIO.def('campRack',G.culm(3,6,null,null,true),MAT.pole,{label:'A drying rack of bamboo (the cutters\' camp)',cls:'prop',kind:'drying rack',tags:TAG('drying rack')});
 BIO.def('campFrame',G.culm(3,6,null,null,true),MAT.pole,{label:'A lean-to\'s frame (the cutters\' camp)',cls:'prop',kind:'lean-to',tags:TAG('lean-to')});
 BIO.def('campThatch',new T3.BoxGeometry(1,1,1).translate(0,.5,0),MAT.thatch,{label:'A lean-to\'s reed thatch (the cutters\' camp)',cls:'prop',kind:'lean-to',tags:TAG('lean-to')});
 BIO.def('campStone',BIO.geo.lobe(),MAT.stone,{label:'A hearth\'s ring of stones (the cutters\' camp)',cls:'prop',kind:'hearth',tags:TAG('hearth')});
 BIO.def('campAsh',disc(),MAT.ash,{label:'A hearth\'s ashes (the cutters\' camp)',cls:'prop',kind:'hearth',tags:TAG('hearth')});
 // a pole from a to b (radius r) as a 3x3 + position for CUT.putM: the culm's y axis along b - a
 const pole=(a,b,r)=>{const d=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],L=Math.hypot(...d),y=d.map(v=>v/L),ref=Math.abs(y[1])>.9?[1,0,0]:[0,1,0];
  let x=[ref[1]*y[2]-ref[2]*y[1],ref[2]*y[0]-ref[0]*y[2],ref[0]*y[1]-ref[1]*y[0]];const xl=Math.hypot(...x);x=x.map(v=>v/xl);const z=[x[1]*y[2]-x[2]*y[1],x[2]*y[0]-x[0]*y[2],x[0]*y[1]-x[1]*y[0]];
  return[x[0]*r*2,x[1]*r*2,x[2]*r*2,0,y[0]*L,y[1]*L,y[2]*L,0,z[0]*r*2,z[1]*r*2,z[2]*r*2,0,a[0],a[1],a[2],1];};
 CUT.planCamp=function(o){const P=[],x0=o.x,z0=o.z,yaw=o.yaw==null?0:o.yaw,ca=Math.cos(yaw),sa=Math.sin(yaw);
  const at=(u,v)=>{const x=x0+u*ca-v*sa,z=z0+u*sa+v*ca;return[x,o.ground(x,z),z];};
  const C=c=>new T3.Color(c);
  // the hearth: a ring of stones round the ashes
  {const c=at(0,0);P.push({item:'campAsh',m:[1.6,0,0,0,0,1,0,0,0,0,1.6,0,c[0],c[1]+.03,c[2],1],col:C(0x4a4440)});
   for(let i=0;i<9;i++){const a=i/9*TAU,p=at(Math.cos(a)*1.05,Math.sin(a)*1.05),s=mix(.22,.34,U(i,1,1));P.push({item:'campStone',m:[s,0,0,0,0,s*.7,0,0,0,0,s,0,p[0],p[1]-.05,p[2],1],col:C(0x8a8478)});}}
  // two stacks of cut culms, 8 m lengths of the grove's culms laid side by side and crossed in tiers
  for(const [u,v,rot] of [[6,-4,0],[7,4,Math.PI/2]]){for(let t=0;t<3;t++)for(let k=0;k<6-t;k++){const off=(k-(5-t)/2)*.9,r=.42,h=r+t*.78;
    const dir=rot+(t%2?.02:-.02),a=at(u+Math.cos(dir+Math.PI/2)*off-Math.cos(dir)*4,v+Math.sin(dir+Math.PI/2)*off-Math.sin(dir)*4),b=at(u+Math.cos(dir+Math.PI/2)*off+Math.cos(dir)*4,v+Math.sin(dir+Math.PI/2)*off+Math.sin(dir)*4);
    a[1]+=h;b[1]=a[1];P.push({item:'campStack',m:pole(a,b,r),col:C(U(k,t,3)<.5?0x9a9a72:0xa6a27a)});}}
  // a drying rack: two A-frames and a ridge pole, split culm hung over it
  {const ends=[at(-7,-3),at(-7,3)];for(const e of ends){P.push({item:'campRack',m:pole([e[0]-1.4*ca,e[1],e[2]-1.4*sa],[e[0],e[1]+3,e[2]],.08),col:C(0x8a8a66)});P.push({item:'campRack',m:pole([e[0]+1.4*ca,e[1],e[2]+1.4*sa],[e[0],e[1]+3,e[2]],.08),col:C(0x8a8a66)});}
   P.push({item:'campRack',m:pole([ends[0][0],ends[0][1]+2.9,ends[0][2]],[ends[1][0],ends[1][1]+2.9,ends[1][2]],.07),col:C(0x948f6a)});
   for(let i=0;i<7;i++){const t=(i+.5)/7,p=[mix(ends[0][0],ends[1][0],t),mix(ends[0][1],ends[1][1],t)+2.9,mix(ends[0][2],ends[1][2],t)];
    P.push({item:'campRack',m:pole([p[0]-1.1*ca,p[1]-1.6,p[2]-1.1*sa],[p[0],p[1],p[2]],.05),col:C(0xb4ac82)});P.push({item:'campRack',m:pole([p[0]+1.1*ca,p[1]-1.6,p[2]+1.1*sa],[p[0],p[1],p[2]],.05),col:C(0xb4ac82)});}}
  // the lean-to: four posts, two rafters, a reed-thatch roof sloping to the back
  {const c=at(-1,-8),w=6,d=4,posts=[[-w/2,0,3],[w/2,0,3],[-w/2,d,1.6],[w/2,d,1.6]].map(q=>{const p=at(-1+q[0],-8+q[1]);return[p,q[2]];});
   posts.forEach(q=>P.push({item:'campFrame',m:pole(q[0],[q[0][0],q[0][1]+q[1],q[0][2]],.09),col:C(0x8a8a66)}));
   for(const i of [0,1])P.push({item:'campFrame',m:pole([posts[i][0][0],posts[i][0][1]+posts[i][1],posts[i][0][2]],[posts[i+2][0][0],posts[i+2][0][1]+posts[i+2][1],posts[i+2][0][2]],.08),col:C(0x8a8a66)});
   const top=c[1]+3.1,slope=Math.atan2(1.5,d),len=Math.hypot(d,1.5)+.6,W2=w+.8,mid=at(-1,-8+d/2),cs=Math.cos(slope),sn=Math.sin(slope);
   /* the roof slab: across the camp's u (x), its thickness along the roof's normal, its length down the slope to the back */
   P.push({item:'campThatch',m:[ca*W2,0,sa*W2,0, -sa*sn*.18,cs*.18,ca*sn*.18,0, -sa*cs*len,-sn*len,ca*cs*len,0, mid[0],top-.85,mid[2],1],col:C(0xa09870)});}
  return{name:'The cutters\' camp (props: Dilihan\'s kit will take it over)',x:x0,z:z0,y:o.ground(x0,z0),r:16,h:8,props:P};};
 CUT.drawCamp=function(rec){if(!rec)return 0;BIO.owner=[rec.x,rec.z];BIO.range=1500;BIO.minRange=0;
  if(typeof REGISTER==='function')REGISTER({name:rec.name,cls:'prop',kind:'camp',x:rec.x,z:rec.z,y:rec.y,r:rec.r,h:rec.h,tags:CUT.CAMP_TAGS});
  for(const p of rec.props)CUT.putM(p.item,p.m,p.col);BIO.owner=null;BIO.range=null;return rec.props.length;};
})();
