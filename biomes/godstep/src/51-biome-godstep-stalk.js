// ================================================================= GODSTEP — the red guyed stalk (Redostalcos) and the station passes' registry
// PLAN.md section 3: tall thin stems held against the wind by GUY-ROOTS, red cup-crowns; the Talovolci farm them for red fibre on the
// rille floors under the springs (station 2), and they grow wild along the north wall's streams (station 5). On 5.1 only the springs and
// the north wall make the ground wet enough, so a stalk is placed only where the host's `wet` field (a spring's or a stream's: WATER.fieldAt
// through the station's fields) is high. One geometry, vertex-shaded (BIO.fung's parts merged: the stalk, three guy-roots, a crown of
// cups and two smaller cups up the stem), 1 tall at the unit: BIO.put scales it. Drawn by geometry, not the library's card.guyedstalk
// (a card would read flat at the close views the rille's fields are seen from; the card is the far LOD's, owed).
// GSTEP.PASSES: a station's own passes (its leaf fragments push {name, fn(R, q, box) -> counts}); GSTEP.build runs them after the ground's
// (70-biome-godstep.js), so a station adds its flora without touching station 1's passes.
GSTEP.PASSES=[];
GSTEP.PAL.stalk=[0x8a1f1a,0x9c2a1c,0x7a1a18,0xa8341f];
(function(){const T3=BIO.host.THREE,S=0x6057;if(!BIO.fung)return;
 /* merge unit parts (each placed by a matrix) into one geometry, keeping BIO.fung's vertex shade as the colour attribute */
 const merge=parts=>{const pos=[],nor=[],uv=[],col=[];
  for(const [g,m] of parts){const n=g.index?g.toNonIndexed():g;n.applyMatrix4(m);const P=n.attributes.position.array,N=n.attributes.normal.array,U=n.attributes.uv?n.attributes.uv.array:null,C=n.attributes.color?n.attributes.color.array:null;
   for(let i=0;i<P.length/3;i++){pos.push(P[i*3],P[i*3+1],P[i*3+2]);nor.push(N[i*3],N[i*3+1],N[i*3+2]);uv.push(U?U[i*2]:0,U?U[i*2+1]:0);col.push(C?C[i*3]:1,C?C[i*3+1]:1,C?C[i*3+2]:1);}}
  return BIO.geo._make(pos,nor,uv,col);};
 const M4=()=>new T3.Matrix4(),Q=(x,y,z)=>new T3.Quaternion().setFromEuler(new T3.Euler(x,y,z)),V=(x,y,z)=>new T3.Vector3(x,y,z);
 const stalk=()=>{const parts=[];
  /* the stem: 1 tall, a slight bow */
  parts.push([BIO.fung.stalk({r0:.016,r1:.009,bend:.03,seg:6,rings:5}),M4()]);
  /* three guy-roots: from a third of the way up, down and out to the ground at ~.22 of the height (the stalk's guys) */
  for(let k=0;k<3;k++){const a=k/3*Math.PI*2+.3,L=.42,tilt=Math.atan2(.22,.33);
   const m=M4().compose(V(Math.cos(a)*.22,0,Math.sin(a)*.22),Q(0,-a,0).multiply(Q(0,0,tilt)),V(1,L,1));parts.push([BIO.fung.stalk({r0:.008,r1:.005,seg:4,rings:2}),m]);}
  /* the crown: a red cup at the tip (a funnel, rim up), two smaller ones up the stem */
  [[1,.075,0],[.82,.05,2.1],[.66,.04,4.2]].forEach(([y,r,a],i)=>{const g=BIO.fung.cap({form:'funnel',h:.5,seg:10,rings:2,wav:5,wavA:.08,under:'none',seed:S+70+i});
   parts.push([g,M4().compose(V(Math.cos(a)*.03*i,y,Math.sin(a)*.03*i),Q(0,a,0),V(r,r,r))]);});
  return merge(parts);};
 const mat=BIO.solidMat(null);mat.vertexColors=true;mat.userData.gstep='stalk';GSTEP.MAT.stalk=mat;
 BIO.def('redstalk',stalk(),mat,{label:'Red guyed stalk (Redostalcos): tall thin stems held by guy-roots, red cup-crowns; the Talovolci\'s red fibre',cls:'flora',kind:'crop'});
})();
GSTEP.SPECIES.push({key:'redstalk',name:'Red guyed stalk (Redostalcos)',where:'the rille floors under the springs (farmed), the north wall\'s streams (wild): only where a spring\'s or a stream\'s water keeps the ground wet'});
// GSTEP.stalks(o): the stalks over a box, a station's pass calls it. o: {box, q, wet (x, z) -> 0..1 (the spring's or stream's wet field), min (.55: no
//   stalk where wet is under it), rows ({a: angle, sp: 1.6 m, at (x, z) -> bool}: a farmed field's rows; null: wild clumps), h ([3.5, 6] m), cell (2.2 m)}
//   -> {stalks}. Every draw is KRAND.hash(world, cell i, cell j, salt): a tile made alone gets the stalks a whole field gets there
GSTEP.stalks=function(o){const K=KRAND,F=BIO.host.fields,H=BIO.host.terrainH,{mix,qEuler,TAU}=BIO.fn,W=BIO.host.seed>>>0,q=o.q==null?1:o.q,box=o.box,c=o.cell==null?2.2:o.cell,min=o.min==null?.55:o.min,hh=o.h==null?[3.5,6]:o.h;
 const u=(h,k)=>K.unit(K.hash(h,k)),P=GSTEP.PAL.stalk;let n=0;
 for(let j=Math.floor(box[1]/c);j<Math.ceil(box[3]/c);j++)for(let i=Math.floor(box[0]/c);i<Math.ceil(box[2]/c);i++){const h=K.hash(W,i,j,0x57A1);
  let x=i*c+c*u(h,1),z=j*c+c*u(h,2);
  if(o.rows&&o.rows.at(x,z)){/* a field: on its rows, the row's line snapped across */const ca=Math.cos(o.rows.a),sa=Math.sin(o.rows.a),v=-x*sa+z*ca,sp=o.rows.sp==null?1.6:o.rows.sp,dv=Math.round(v/sp)*sp-v;x+=-sa*dv;z+=ca*dv;}
  else if(o.rows&&o.rows.only)continue;
  if(x<box[0]+2||x>box[2]-2||z<box[1]+2||z>box[3]-2||BIO.mask(x,z)<=0)continue;
  const w=o.wet(x,z);if(w<min||(F.face&&F.face(x,z)>.3)||F.slope(x,z)>.45)continue;
  if(u(h,3)>(o.rows&&o.rows.at(x,z)?.9:.35*(w-min)/(1-min))*q)continue;
  const s=mix(hh[0],hh[1],u(h,4))*mix(.75,1,(w-min)/(1-min));BIO.range=s>5?900:600;
  BIO.put('redstalk',[x,H(x,z)-.05,z],qEuler((u(h,5)-.5)*.06,u(h,6)*TAU,(u(h,7)-.5)*.06),[s,s,s],P[Math.floor(u(h,8)*P.length)%P.length]);n++;}
 BIO.range=null;return{stalks:n};};
