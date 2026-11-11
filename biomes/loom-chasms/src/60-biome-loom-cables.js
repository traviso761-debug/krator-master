// ================================================================= THE LOOM-CHASMS — the builders: a cable record drawn, a curtain drawn
// A builder draws a record; it does not decide where (the working rules). The host's station finds the anchors (rays at the drawn walls), makes the
// records and registers them in core/tags, then calls these. A record:
//   cable    {id, a:[x,y,z], b:[x,y,z] (the anchors, on the drawn rock), stage 'grown' | 'shoot', seed, r (radius, m), slack (a share of the chord),
//            na:[x,y,z], nb (the walls' normals at the anchors: the tubers sit into them)}
//   curtain  {id, p:[x,y,z] (its top, on the drawn wall), n:[nx,ny,nz] (the wall's normal), h (m), w (m), seed}
// The shapes come from KSPAN (core/biome 45: a grown cable a catenary, a shoot arching up); every draw from a stream seeded by the record's own seed.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,qEuler}=BIO.fn;
const T3=BIO.host.THREE,PAL=LOOM.PAL,SP=LOOM.SPAN,{bright,vary}=BIO.col;
const tone=(set,k)=>bright(vary(pick(set),.02,.06,.06),k==null?1:k);
const UP=new T3.Vector3(0,1,0),_v=new T3.Vector3(),_q=new T3.Quaternion();
/* one segment from p to q, radius r: the unit cylinder (+y) turned onto q - p and stretched to its length (a hair over, so the joints close) */
function seg(item,p,q,r,col){_v.set(q[0]-p[0],q[1]-p[1],q[2]-p[2]);const L=_v.length();if(!(L>1e-4))return;_v.multiplyScalar(1/L);
 _q.setFromUnitVectors(UP,_v);BIO.put(item,[p[0],p[1],p[2]],_q.clone(),[r*2,L+r*.6,r*2],col);}
/* a tuber at an anchor: a squat lobe pressed into the wall along its normal, its root mat spreading over the rock */
function tuber(p,n,R,col){const q=new T3.Quaternion().setFromUnitVectors(UP,new T3.Vector3(n[0],n[1],n[2]).normalize());
 BIO.put('tuber',[p[0]-n[0]*R*.35,p[1]-n[1]*R*.35,p[2]-n[2]*R*.35],q,[R*1.3,R*.9,R*1.1],col);}
// THE CABLE: its span (KSPAN), its segments, its anchors' tubers, and on a grown cable its beard; -> {S, n (segments), beards, tension: N at the anchors}
LOOM.drawCable=function(rec){reseed(rec.seed>>>0);const grown=rec.stage!=='shoot',r=rec.r==null?(grown?rr(SP.grownR[0],SP.grownR[1]):rr(SP.shootR[0],SP.shootR[1])):rec.r;
 const sl=rec.slack==null?(grown?rr(SP.grownSlack[0],SP.grownSlack[1]):rr(SP.shootSlack[0],SP.shootSlack[1])):rec.slack;
 const S=KSPAN.solve(rec.a,rec.b,{slack:sl,up:!grown}),n=Math.max(8,Math.ceil(S.length/9)),P=KSPAN.points(S,n),col=tone(grown?PAL.cable:PAL.shoot);
 for(let i=0;i<n;i++)seg(grown?'cable':'shoot',P[i],P[i+1],r,col);
 const tc=tone(PAL.tuber),R=grown?mix(1.1,2.4,(r-SP.grownR[0])/(SP.grownR[1]-SP.grownR[0])):.6;
 if(rec.na)tuber(rec.a,rec.na,R,tc);if(rec.nb)tuber(rec.b,rec.nb,R,tc);
 let beards=0,bladders=0;
 if(grown){let t=rr(.04,.1);while(t<.96){const p=KSPAN.at(S,t),h=rr(1.2,4.5);BIO.put('beard',[p[0],p[1]-r*.6,p[2]],qEuler(0,rr(0,TAU),0),[h*rr(.35,.6),h,1],tone(PAL.beard));beards++;
   t+=rr(SP.beardEvery[0],SP.beardEvery[1])/S.length;}}
 else{let t=rr(.08,.2);while(t<.92){const p=KSPAN.at(S,t),b=rr(.35,.8);BIO.put('bladder',[p[0],p[1]+b*.85,p[2]],null,[b,b*1.15,b],tone(PAL.bladder));bladders++;
   t+=rr(SP.bladderEvery[0],SP.bladderEvery[1])/S.length;}}
 const w=Math.PI*r*r*SP.density*7.4;   /* N/m: the cable's weight in Krator's gravity (7.4 m/s2, the repo's constant); a shoot's is near 0 net */
 return{S,n,beards,bladders,r,tension:grown?KSPAN.tension(S,w):null};};
// THE CURTAIN: a sheet hung from its top on the wall, facing out along the wall's normal, a few sheets side by side
LOOM.drawCurtain=function(rec){reseed(rec.seed>>>0);const n=rec.n,yaw=Math.atan2(n[0],n[2]),k=ri(1,3);
 for(let i=0;i<k;i++){const off=(i-(k-1)/2)*rec.w*.7,tx=Math.cos(yaw),tz=-Math.sin(yaw),h=rec.h*rr(.7,1.2);
  BIO.put('curtain',[rec.p[0]+tx*off+n[0]*.12,rec.p[1]-rr(0,.4),rec.p[2]+tz*off+n[2]*.12],qEuler(rr(-.05,.05),yaw,rr(-.04,.04)),[rec.w*rr(.8,1.2),h,1],0xffffff);}
 return k;};
LOOM.canopyH=function(){return 0;};
})();
BIO.kitEnd(LOOM);   // its exports run in its registry; the default kit is current again
