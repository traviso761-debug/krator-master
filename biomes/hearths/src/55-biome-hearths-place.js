// ================================================================= HEARTHS — a field's layout on the heat (biomes/hearths/PLAN.md sections 6, 7, 11)
// HEARTH.layout(o): one hearth field round its vents on the host's ground, placed by the ground's temperature (KTHERM.fieldAt on o.therm, a bake), never
// by a noise: the EMBER MAT on 60-95 degC (the fumaroles' aprons), HEARTH TREES on 25-60 (spaced by the heat: the warmer, the closer), COAL MOSS between
// them on 20-40, STOKERS at the disc's edge on 10-25 (their runners laid toward the warmer ground), TALLOW BEADS on some stalks, and the DEAD STALKS in rings
// outside where the heat was (o.deadRings: [r0, r1] metres from o.at; the Cold Hearths' snapped and fallen, the rim's standing). Every cell is seeded from
// KRAND.cell(seed, ix, iz), every tree's parts from KRAND.hash(seed, the tree's index, salt): nothing from how many draws came before.
//   o: {therm (a KTHERM bake), at [x, z] (the field's centre), R (its reach, m), dress ('cold' | 'rim'), seed, toward ({az, alt}: the sun's mean bearing:
//       the stalks bow to it), ground (x, z) -> y, mask (x, z) -> 0..1 (the host's), deadRings, q (the host's quality)}
//   -> {trees: [{x, z, y, H, r, heat}], counts}; each tree, stalk and mat is a core/tags record (BIO.register) before it is drawn
// [G data]: records and BIO.put only.
HEARTH.layout=function(o){const {TAU,clamp,smooth,mix,qEuler}=BIO.fn,D=HEARTH.DRESS[o.dress||'cold'],seed=o.seed==null?7110:o.seed,q=o.q==null?1:o.q;
 const F=o.therm,heat=(x,z)=>KTHERM.fieldAt(F,x,z),G=o.ground||BIO.terrainH,mask=o.mask||(()=>1),at=o.at,R=o.R;
 const U=(i,salt)=>KRAND.unit(KRAND.hash(seed,i,salt)),T3=BIO.host.THREE,C=h=>new T3.Color(h);
 const out={trees:[],counts:{hearth:0,fans:0,ember:0,coal:0,stoker:0,tallow:0,dead:0}};
 const cells=(cell,salt,fn)=>{const N=Math.ceil(R*2/cell);for(let iz=0;iz<N;iz++)for(let ix=0;ix<N;ix++){const s=KRAND.stream(KRAND.cell(seed+salt,ix,iz));
  const x=at[0]-R+(ix+s.next())*cell,z=at[1]-R+(iz+s.next())*cell;if(Math.hypot(x-at[0],z-at[1])>R||mask(x,z)<=0)continue;fn(x,z,heat(x,z),s);}};
 const BLACK=C(0x1a1a1c),SILVER=C(D.spindle),FOOT=C(0x2a2624),STALK=C(0x3a3634),PALE=C(0xd8d4cc),WAX=C(0xf0e8d4);
 // the ember mat: the hottest ground a hearth cannot stand
 cells(2.2,1,(x,z,t,s)=>{if(t<60||t>95||s.next()>.7*q)return;const r=s.range(.5,1.4);BIO.put('hember',[x,G(x,z)+.02,z],qEuler(0,s.range(0,TAU),0),[r,.12,r],BLACK.clone().lerp(C(0x3a2a20),s.next()*.4));out.counts.ember++;});
 // the hearth trees: on 25-60 degC, each cell's chance and spacing by the heat (a 2-3 m foot draws 10-30 m2 of warm ground: section 3)
 const TREES=[];
 cells(4.5,2,(x,z,t,s)=>{if(t<25||t>60)return;const k=smooth(25,45,t);if(s.next()>(.35+.5*k)*q)return;
  if(TREES.some(T=>Math.hypot(T.x-x,T.z-z)<mix(4.2,2.6,k)))return;TREES.push({x,z,heat:t,u:s.next()});});
 TREES.forEach((T,i)=>{const y=G(T.x,T.z),H=mix(D.stalk[0],D.stalk[1],U(i,1))*mix(.75,1.1,smooth(25,55,T.heat)),fr=mix(.45,.8,U(i,2))*(o.dress==='rim'?1.6:1);   /* the foot: a limpet a metre or so across on the Cold Hearths (section 3: 1-3 m, the rim's the larger) */
  BIO.register({name:'A hearth tree',key:'hearth',kit:'hearths',x:T.x,z:T.z,y:y,r:fr+.5,h:H+1.5,tags:{heat:T.heat}});
  BIO.put('hfoot',[T.x,y-.08,T.z],qEuler(0,U(i,3)*TAU,0),[fr,fr*1.5,fr],FOOT.clone().lerp(C(0x4a4038),.4));
  /* the stalk bows to the sun's mean bearing (39-core-lean.js), each its own share of the bow (a hash, not a draw) */
  const lq=BIO.leanQ?BIO.leanQ(.12+.14*U(i,4),{toward:o.toward||{az:0,alt:40},u:U(i,5)}):[0,0,0,1],Q=new T3.Quaternion(lq[0],lq[1],lq[2],lq[3]);
  BIO.put('hstalk',[T.x,y,T.z],Q,[1.1,H,1.1],STALK);
  const tip=new T3.Vector3(0,H,0).applyQuaternion(Q);const tx=T.x+tip.x,ty=y+tip.y,tz=T.z+tip.z;
  const n=Math.round(mix(D.fans[0],D.fans[1],U(i,6))),L=mix(D.fanL[0],D.fanL[1],U(i,7))*mix(.8,1.15,smooth(25,55,T.heat));
  for(let f=0;f<n;f++){const a=f/n*TAU+U(i,10+f)*.3,tier=f%2?.08:0;
   BIO.put('hfan',[tx,ty-tier,tz],qEuler(0,-a,0),[L,L,L*mix(.8,1.1,U(i,40+f))],SILVER.clone().lerp(C(0x9cb0a0),D.green*U(i,70+f)));out.counts.fans++;}
  if(U(i,8)<.35){const m=1+Math.floor(U(i,9)*4);for(let b=0;b<m;b++){const v=mix(.3,.85,U(i,90+b)),p=new T3.Vector3(0,H*v,0).applyQuaternion(Q),a=U(i,95+b)*TAU,r=.06+.04*U(i,99+b);
   BIO.put('htallow',[T.x+p.x+Math.cos(a)*.1,y+p.y,T.z+p.z+Math.sin(a)*.1],null,[r,r*1.2,r],WAX);out.counts.tallow++;}}
  out.trees.push({x:T.x,z:T.z,y,H,r:fr,heat:T.heat});out.counts.hearth++;});
 // the coal moss: the warm floor between the stalks
 cells(1.8,3,(x,z,t,s)=>{if(t<20||t>40||s.next()>.55*q)return;if(TREES.some(T=>Math.hypot(T.x-x,T.z-z)<1.6))return;const r=s.range(.35,.9);
  BIO.put('hcoal',[x,G(x,z)+.01,z],qEuler(0,s.range(0,TAU),0),[r,.1,r],C(0x23211f).lerp(C(0x34302a),s.next()));out.counts.coal++;});
 // the stokers: runners at the disc's edge, laid toward the warmer ground (the gradient of the heat), a line of small fins along each
 cells(3.5,4,(x,z,t,s)=>{if(t<10||t>25||s.next()>.4*q)return;const gx=heat(x+2,z)-heat(x-2,z),gz=heat(x,z+2)-heat(x,z-2),a=Math.atan2(gz,gx),Ln=s.range(.8,2.2),y=G(x,z);
  BIO.put('hstoker',[x,y+.03,z],new T3.Quaternion().setFromEuler(new T3.Euler(0,-a,-Math.PI/2,'YXZ')),[1,Ln,1],C(0x2c2a28));
  for(let k=1;k<4;k++)BIO.put('hfin',[x+Math.cos(a)*Ln*k/4,y+.06,z+Math.sin(a)*Ln*k/4],qEuler(0,-a+Math.PI/2,0),[1,1,1],BLACK);out.counts.stoker++;});
 // the dead stalks: rings of them outside, where the heat was. The Cold Hearths' are snapped and fallen (lying in the ring's direction, roughly); the rim's stand
 if(o.deadRings){const r0=o.deadRings[0],r1=o.deadRings[1],N=Math.round((r1*r1-r0*r0)*.0035*q);
  for(let i=0;i<N;i++){const a=U(i,200)*TAU,ring=Math.floor(U(i,201)*3),r=mix(r0,r1,(ring+U(i,202))/3),x=at[0]+Math.cos(a)*r,z=at[1]+Math.sin(a)*r;if(mask(x,z)<=0)continue;
   const y=G(x,z),H=mix(D.stalk[0],D.stalk[1],U(i,203))*1.1,fallen=D.dead==='fallen'||U(i,204)<.3;
   const Qd=fallen?new T3.Quaternion().setFromEuler(new T3.Euler(0,-(a+Math.PI/2+(U(i,205)-.5)*1.2),-Math.PI/2+.04,'YXZ')):new T3.Quaternion().setFromEuler(new T3.Euler((U(i,206)-.5)*.2,0,(U(i,207)-.5)*.2));
   BIO.put('hdead',[x,y+(fallen?.08:-.1),z],Qd,[1.05,fallen?H*mix(.4,.9,U(i,208)):H*mix(.5,1,U(i,208)),1.05],PALE.clone().lerp(C(0xb8b0a4),U(i,209)*.5));
   BIO.register({name:'A dead stalk (fallen)',key:'stalkdead',kit:'hearths',x,z,y:y-.3,r:fallen?H*.5:.4,h:fallen?.6:H});out.counts.dead++;}}
 return out;};
HEARTH.place=HEARTH.layout;
