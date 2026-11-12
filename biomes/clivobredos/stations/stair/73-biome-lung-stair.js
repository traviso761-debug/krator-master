// ================================================================= CLIFF LUNGS — the Stair's own: a Talovolci lung-stair and a husk bridge (PLAN.md sections 10, 11 item 3)
// THE LUNG-STAIR (bređoladra): a ladder of red-fibre rope and timber lashed to a live lung's ribs, two rails along the lung's back and a rung every
// 45 cm, with a rest at every tenth ring where the sphincter joint makes a shelf. A placement record (LUNG.STAIR) and a prop; never on a mirror lung
// (the Talovolci will not climb one). THE HUSK BRIDGE: a dead lung's length fallen across a ravine, its rings pale and banded, the dry road.
(function(){const T3=BIO.host.THREE,{TAU,clamp}=BIO.fn;
BIO.kit('lung');
const box=(w,h,d)=>{const g=new T3.BoxGeometry(w,h,d);const n=g.attributes.position.count;g.setAttribute('color',new T3.BufferAttribute(new Float32Array(n*3).fill(1),3));return g;};
const wood=new T3.MeshLambertMaterial({vertexColors:true});
BIO.def('lrung',box(1,1,1),wood,{label:'A lung-stair (bređoladra): timber rungs lashed with lung-skin rope (Scinropos)',cap:20000,capWhy:'a rung every 45 cm of a kilometre of stair'});
BIO.def('lrail',box(1,1,1),wood,{label:'A lung-stair\'s rail of red-fibre rope'});
BIO.def('lrest',box(1,1,1),wood,{label:'A stair\'s rest on a sphincter shelf (every tenth ring): water at every rest'});
BIO.kitEnd(LUNG);
LUNG.buildStair=function(L,o){const ground=o.ground,normal=o.normal,y0=o.y0==null?1500:o.y0,y1=o.y1==null?2700:o.y1,k0=BIO.kitName;BIO.kit('lung');BIO.cur='lung/stair';
 /* the lung: live, not the mirror, with the most of its length in the band the camera stands in, nearest the map's middle */
 const score=l=>l.pts.filter(p=>p[1]>y0&&p[1]<y1).length-Math.abs(l.pts[0][0])/200;
 const cands=L.lungs.filter(l=>l.live&&!l.mirror&&!l.young).sort((a,b)=>score(b)-score(a)||(a.id<b.id?-1:1)),l=cands[0];
 const out={lung:null,rungs:0,rests:0,bridge:null};if(!l){BIO.kit(k0||'');return out;}
 const C=c=>new T3.Color(c[0],c[1],c[2]),RED=C([.5,.16,.1]),TIMB=C([.42,.32,.22]);
 const v=new T3.Vector3(),q=new T3.Quaternion(),m=new T3.Matrix4(),vx=new T3.Vector3(),vy=new T3.Vector3(),vz=new T3.Vector3();
 for(let i=0;i+1<l.pts.length;i++){const a=l.pts[i+1],b=l.pts[i];if(a[1]<y0||b[1]>y1)continue;   /* foot to tip: pts run tip first */
  const d=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],len=Math.hypot(...d),n=normal((a[0]+b[0])/2,(a[2]+b[2])/2);
  vy.set(d[0],d[1],d[2]).normalize();vz.set(n[0],n[1],n[2]).addScaledVector(vy,-vy.dot(vz)).normalize();vx.crossVectors(vy,vz);m.makeBasis(vx,vy,vz);q.setFromRotationMatrix(m);
  const lift=l.r*1.04+.12,steps=Math.floor(len/.45);BIO.owner=[a[0],a[2]];
  for(const sd of[-1,1]){const o2=vx.clone().multiplyScalar(sd*.32).addScaledVector(vz,lift);BIO.range=900;BIO.put('lrail',[a[0]+o2.x+d[0]/2,a[1]+o2.y+d[1]/2,a[2]+o2.z+d[2]/2],q.clone(),[.06,len,.06],RED);}
  if(o.walk)o.walk.strip({a:[a[0]+vz.x*lift,a[2]+vz.z*lift,a[1]+vz.y*lift],b:[b[0]+vz.x*lift,b[2]+vz.z*lift,b[1]+vz.y*lift],w:.7,name:'the lung-stair on '+l.id,tag:'lung-stair'});
  for(let s=0;s<steps;s++){const t=s/steps,p=[a[0]+d[0]*t+vz.x*lift,a[1]+d[1]*t+vz.y*lift,a[2]+d[2]*t+vz.z*lift];BIO.range=350;BIO.put('lrung',p,q.clone(),[.72,.05,.07],TIMB);out.rungs++;}}
 /* the rests: at every tenth ring's joint in the band */
 l.rings.forEach((R,i)=>{if(!i||i%10||R.a[1]<y0||R.a[1]>y1)return;const n=normal(R.a[0],R.a[2]),p=[R.a[0]+n[0]*(R.r+.5),R.a[1]+n[1]*(R.r+.5),R.a[2]+n[2]*(R.r+.5)];
  BIO.owner=[p[0],p[2]];BIO.range=1200;BIO.put('lrest',p,null,[2.2,.18,1.6],TIMB);out.rests++;});
 out.lung=l.id;LUNG.STAIR={lung:l.id,band:[y0,y1],rungs:out.rungs,rests:out.rests};
 BIO.record({name:'The lung-stair (bređoladra) on '+l.id+': a champion\'s portion to whoever climbs it fastest at the summer feast',kind:'stair',lung:l.id,x:l.pts[0][0],z:l.pts[0][2],y:y0,r:l.r+2,h:y1-y0});
 /* THE HUSK BRIDGE: across the ravine nearest the stair's middle, at the camera's band */
 const mid=l.pts.find(p=>p[1]<(y0+y1)/2)||l.pts[0],R=o.scarp.ravines.filter(V=>Math.abs(V.x-mid[0])>40).sort((a,b)=>Math.abs(a.x-mid[0])-Math.abs(b.x-mid[0]))[0];
 if(R){const along=(o.zAt?o.zAt:0),tx=-R.nz,tz=R.nx;let best=null;
  for(let s=200;s<o.scarp.run;s+=20){const cx=R.x+R.nx*s,cz=R.z+R.nz*s,h=ground(cx,cz);if(h<(y0+y1)/2){best=[cx,cz];break;}}
  if(best){const w=R.w*.95,A=[best[0]-tx*w,0,best[1]-tz*w],B=[best[0]+tx*w,0,best[1]+tz*w];A[1]=ground(A[0],A[2]);B[1]=ground(B[0],B[2]);const y=Math.max(A[1],B[1])+2.2;A[1]=y;B[1]=y;
   const r=4,segs=Math.max(2,Math.round(2*w/10)),band=LUNG.bandAt(LUNG.atmAt(y)).col.map(c=>c+(.86-c)*.68);
   for(let k=0;k<segs;k++){const t0=k/segs,t1=(k+1)/segs,a=[A[0]+(B[0]-A[0])*t0,y,A[2]+(B[2]-A[2])*t0],len=2*w/segs;
    vy.set(B[0]-A[0],0,B[2]-A[2]).normalize();vz.set(0,1,0);vx.crossVectors(vy,vz);m.makeBasis(vx,vy,vz);q.setFromRotationMatrix(m);BIO.owner=[a[0],a[2]];BIO.range=3000;
    BIO.put('lhusk',a,q.clone(),[r,len,r],C(band));BIO.range=500;BIO.put('lhuskbore',a,q.clone(),[r,len,r],C([.42,.38,.32]));}
   out.bridge={a:A,b:B,r};LUNG.BRIDGE=out.bridge;
   REGISTER({name:'The husk bridge (huscos): a dead lung fallen across the ravine, the dry road',key:'husk',x:best[0],z:best[1],y:y-r-2,r:w+r,h:2*r+4});}}
 BIO.owner=null;BIO.cur=null;BIO.kit(k0||'');return out;};
})();
