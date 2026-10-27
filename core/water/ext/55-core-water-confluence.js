// ================================================================= WATER - ext: confluences (one water where a tributary meets its river)
// [G data]: no THREE, no DOM. Adds to WATER (20-core-water.js, 21-core-water-shore.js (W.edt), 22-core-water-flow.js; load after them).
// Optional, in the SUBFOLDER core/water/ext/ (a build opts in by path). 55b-core-water-confluence-draw.js draws it.
//
// Two ribbons meeting (WATER.drawFlow) leave a sharp land corner at each side of the mouth, a foam and shallow line across it (each strip's
// foam is by its own bank distance) and two ripple patterns that shear past each other (each advected along its own current). A
// confluence is one surface over the junction instead: a grid of vertices over a disc round the mouth, each carrying what a ribbon's
// vertex carries (its level, the current, the line's slope, the distance to the bank), so it is drawn with the ribbons' own ripple and
// foam (wtrFlowN, wtrFlowFoam) and matches them where it fades into them; the ribbons fade out inside it (55b patches their materials).
//   - THE SHORE IS THE GROUND'S, ROUNDED: the water is the vertices flooded from the channels where the ground lies under the blended level
//     AND inside the flows' channels joined by a smooth union (`round` m: the corners between them filleted, so a level that stands over
//     a low valley floor stays in its channels); the bank distance is the exact distance to that shore (W.edt). Where the ground rises
//     the corners are its own contours, elsewhere the union's fillets: never the strips' square corners.
//   - ONE CURRENT: each flow's current weighted by how far a point is from its channel, then blurred over the water (`blur` m), so the
//     tributary's current turns into the river's and the ripples it carries flow into one another (the flow map of Valve's technique,
//     baked per vertex, as the ribbons carry theirs).
//   - NO LINE ACROSS THE MOUTH: the foam is by the distance to the real shore (none where the two waters meet), plus a little where the
//     currents meet at an angle (`meet`).
//   - SEAMLESS AT ITS RIM: over the outer `feather` m every value runs to what the nearest ribbon has there (its own level, current,
//     slope and bank), and the drawing's alpha with it, while the ribbons fade in: the two cross-fade on the same numbers.
//
//   WATER.confluence({name, flows, at [x, z], r, feather, cell, ground, reach, blur, sharp, meet, margin, round}) -> C (a group in WATER.groups)
//        flows   the WATER.flow records that meet (any number, two or more); at: the mouth (the tributary's end); r (m, the disc's radius:
//        1.25 x the widest flow's width), feather (m, .4 r); cell (m, 1); ground (x, z) -> y (the page's terrain, required); reach (m; each flow's half
//        width / 2): how far past its channel a flow's current still counts; blur (m, 4); sharp (6): how sharply the rim keeps to the nearest
//        ribbon; meet (.12): the foam where the currents meet (the drawing's share); margin (m): the ribbons' (PRESETS.flow.margin);
//        round (m; half the narrowest flow's width): the fillet where the channels join
//   C.at(x, z) -> {y, vx, vz, slope, bank, fade, meet} interpolated as the mesh's triangles interpolate (twin of the drawing's varyings)
//   C.fadeAt(x, z) the disc's weight (1 inside, 0 past its rim; the ribbons take 1 - it); C.heightAt, C.flowAt, C.contains (WATER.groups)
//   C.mesh() -> {pos, flow, slope, bank, fade, meet, idx, count}; C.export() the grid as plain data
(function(){const W=WATER,cl=(x,a,b)=>x<a?a:x>b?b:x,ss=(a,b,x)=>{const t=cl((x-a)/(b-a),0,1);return t*t*(3-2*t);},mix=(a,b,t)=>a+(b-a)*t;
 // one flow's numbers at (x, z), as its ribbon has them: the level, the current, the slope, the bank distance (half width - distance)
 const along=(S,x,z)=>{const q=S.nearest(x,z),a=q.a,b=q.b,u=q.u,v=a.v+(b.v-a.v)*u;
  const hw=(a.w+(b.w-a.w)*u)/2;return{y:a.y+(b.y-a.y)*u,vx:q.ex/q.L*v,vz:q.ez/q.L*v,slope:a.slope,bank:hw-q.d,hw};};
 // a masked blur (separable box passes; the dry vertices neither give nor take), in place
 const blurM=(A,wet,n,rad,passes)=>{if(rad<1)return;const T=new Float64Array(A.length),Wt=new Float64Array(A.length);
  for(let p=0;p<passes;p++){
   for(let j=0;j<n;j++)for(let i=0;i<n;i++){let s=0,c=0;for(let k=-rad;k<=rad;k++){const q=i+k;if(q<0||q>=n)continue;const id=j*n+q;if(wet[id]){s+=A[id];c++;}}T[j*n+i]=c?s/c:A[j*n+i];Wt[j*n+i]=c;}
   for(let j=0;j<n;j++)for(let i=0;i<n;i++){const id=j*n+i;if(!wet[id])continue;let s=0,c=0;for(let k=-rad;k<=rad;k++){const q=j+k;if(q<0||q>=n)continue;const iq=q*n+i;if(Wt[iq]>0){s+=T[iq];c++;}}if(c)A[id]=s/c;}}};
 W.confluence=o=>{const F=o.flows;if(!F||F.length<2)throw new Error('WATER.confluence: two flows or more');if(typeof o.ground!=='function')throw new Error('WATER.confluence: ground (x, z) -> y');
  const smax=(a,b,k)=>{const h=Math.max(k-Math.abs(a-b),0)/k;return Math.max(a,b)+h*h*k*.25;};
  const wmax=Math.max(...F.map(S=>Math.max(...S.pts.map(p=>p.w)))),r=o.r==null?1.25*wmax:o.r,fe=o.feather==null?.4*r:o.feather,cell=o.cell==null?1:o.cell,
   reach=o.reach==null?null:o.reach,blur=o.blur==null?4:o.blur,sharp=o.sharp==null?6:o.sharp,meetK=o.meet==null?.12:o.meet,mg=o.margin==null?W.PRESETS.flow.margin:o.margin,rnd=o.round==null?Math.min(...F.map(S=>Math.min(...S.pts.map(p=>p.w))))/2:o.round,
   at=[o.at[0],o.at[1]],n=Math.ceil(2*r/cell)+1,x0=at[0]-(n-1)*cell/2,z0=at[1]-(n-1)*cell/2,N=n*n;
  const C={kind:'confluence',name:o.name||'confluence',flows:F,mouth:at,r,feather:fe,cell,n,x0,z0,reach,blur,sharp,meet:meetK,margin:mg,round:rnd};
  C.fadeAt=(x,z)=>1-ss(r-fe,r,Math.hypot(x-at[0],z-at[1]));
  const Y=new Float64Array(N),VX=new Float64Array(N),VZ=new Float64Array(N),SL=new Float64Array(N),BK=new Float64Array(N),FD=new Float64Array(N),ME=new Float64Array(N),
   oY=new Float64Array(N),oVX=new Float64Array(N),oVZ=new Float64Array(N),oSL=new Float64Array(N),oBK=new Float64Array(N),G=new Float64Array(N),U=new Float64Array(N),seed=new Uint8Array(N);
  for(let j=0;j<n;j++)for(let i=0;i<n;i++){const x=x0+i*cell,z=z0+j*cell,id=j*n+i,L=F.map(S=>along(S,x,z));
   // the blend's weights: 1 in a channel, falling off past its bank over `reach` m; the rim's: the same, sharpened (the nearest ribbon's own)
   const w=L.map((q,k)=>Math.exp(-Math.pow(Math.max(0,-q.bank)/(reach==null?.5*q.hw:reach),2))+1e-12),ws=w.map(v=>Math.pow(v,sharp)+1e-300),sw=w.reduce((a,b)=>a+b,0),sws=ws.reduce((a,b)=>a+b,0);
   let y=0,vx=0,vz=0,sl=0,oy=0,ovx=0,ovz=0,osl=0,obk=-1e9;
   L.forEach((q,k)=>{const a=w[k]/sw,b=ws[k]/sws;y+=a*q.y;vx+=a*q.vx;vz+=a*q.vz;sl+=a*q.slope;oy+=b*q.y;ovx+=b*q.vx;ovz+=b*q.vz;osl+=b*q.slope;if(q.bank>obk)obk=q.bank;});
   // the currents' meeting: how much the flows disagree where more than one has weight (0 in one channel, up to 1 where two cross head on)
   let mt=0;for(let a=0;a<L.length;a++)for(let b=a+1;b<L.length;b++){const va=Math.hypot(L[a].vx,L[a].vz)||1,vb=Math.hypot(L[b].vx,L[b].vz)||1,c=(L[a].vx*L[b].vx+L[a].vz*L[b].vz)/(va*vb);
    mt=Math.max(mt,4*(w[a]/sw)*(w[b]/sw)*(1-c)/2);}
   Y[id]=y;VX[id]=vx;VZ[id]=vz;SL[id]=sl;ME[id]=mt;oY[id]=oy;oVX[id]=ovx;oVZ[id]=ovz;oSL[id]=osl;oBK[id]=obk;G[id]=o.ground(x,z);FD[id]=C.fadeAt(x,z);
   // the channels' smooth union: the flows' bank distances joined with a fillet of `round` m
   let un=L[0].bank;for(let k=1;k<L.length;k++)un=smax(un,L[k].bank,rnd);U[id]=un;
   seed[id]=L.some(q=>q.bank>0)&&G[id]<y?1:0;}
  // the water: flooded from the channels over every vertex whose ground is under the blended level (a hollow cut off from them stays dry)
  const wet=new Uint8Array(N),st=[];for(let id=0;id<N;id++)if(seed[id]){wet[id]=1;st.push(id);}
  while(st.length){const id=st.pop(),i=id%n,j=(id-i)/n;for(const[di,dj]of[[1,0],[-1,0],[0,1],[0,-1]]){const a=i+di,b=j+dj;if(a<0||b<0||a>=n||b>=n)continue;const q=b*n+a;if(!wet[q]&&G[q]<Y[q]&&U[q]>0){wet[q]=1;st.push(q);}}}
  // the bank distance: the exact distance (m) to the shore (half a cell past the last wet vertex), + in the water, - on the land
  const dry=new Uint8Array(N);for(let id=0;id<N;id++)dry[id]=wet[id]?0:1;const toDry=W.edt(dry,n,n),toWet=W.edt(wet,n,n);
  for(let id=0;id<N;id++)BK[id]=wet[id]?(Math.sqrt(toDry[id])-.5)*cell:-(Math.sqrt(toWet[id])-.5)*cell;
  // one current, one level, one slope over the water: blurred (twice: a tent the width of 2 blur)
  const rad=Math.round(blur/cell);for(const A of[VX,VZ,SL,Y,ME])blurM(A,wet,n,rad,2);
  // the rim: every value runs to the nearest ribbon's own over the feather
  for(let id=0;id<N;id++){const f=FD[id];Y[id]=mix(oY[id],Y[id],f);VX[id]=mix(oVX[id],VX[id],f);VZ[id]=mix(oVZ[id],VZ[id],f);SL[id]=mix(oSL[id],SL[id],f);BK[id]=mix(oBK[id],BK[id],f);ME[id]*=f;}
  C.y=Y;C.vx=VX;C.vz=VZ;C.slope=SL;C.bank=BK;C.fade=FD;C.meetV=ME;C.wet=wet;C.groundV=G;C.union=U;
  // values at (x, z) as the mesh's triangles interpolate them: quad (i, j) split (i, j)-(i, j+1)-(i+1, j) and (i+1, j)-(i, j+1)-(i+1, j+1)
  const tri=(A,x,z)=>{const fx=cl((x-x0)/cell,0,n-1-1e-9),fz=cl((z-z0)/cell,0,n-1-1e-9),i=Math.floor(fx),j=Math.floor(fz),u=fx-i,v=fz-j,a=A[j*n+i],b=A[(j+1)*n+i],c=A[j*n+i+1],d=A[(j+1)*n+i+1];
   return u+v<=1?a+(c-a)*u+(b-a)*v:d+(b-d)*(1-u)+(c-d)*(1-v);};
  C.at=(x,z)=>({y:tri(Y,x,z),vx:tri(VX,x,z),vz:tri(VZ,x,z),slope:tri(SL,x,z),bank:tri(BK,x,z),fade:tri(FD,x,z),meet:tri(ME,x,z)});
  C.contains=(x,z)=>Math.hypot(x-at[0],z-at[1])<r&&tri(BK,x,z)>0;
  C.heightAt=(x,z)=>C.contains(x,z)?tri(Y,x,z):null;
  C.flowAt=(x,z)=>{const q=C.at(x,z);return[q.vx,q.vz,Math.hypot(q.vx,q.vz),q.slope];};
  C.mesh=()=>{const pos=[],flow=[],slope=[],bank=[],fade=[],meet=[],idx=[];
   for(let j=0;j<n;j++)for(let i=0;i<n;i++){const id=j*n+i;pos.push(x0+i*cell,Y[id],z0+j*cell);flow.push(VX[id],VZ[id]);slope.push(SL[id]);bank.push(BK[id]);fade.push(FD[id]);meet.push(ME[id]);}
   // only the quads with some water and some weight (the land and the disc's corners draw nothing); wound to face up
   for(let j=0;j+1<n;j++)for(let i=0;i+1<n;i++){const a=j*n+i,b=a+n,c=a+1,d=b+1;if(Math.max(BK[a],BK[b],BK[c],BK[d])<-mg||Math.max(FD[a],FD[b],FD[c],FD[d])<=0)continue;idx.push(a,b,c,c,b,d);}
   return{pos,flow,slope,bank,fade,meet,idx,count:N};};
  const rd=A=>Array.from(A,v=>Math.round(v*1e4)/1e4);
  C.export=()=>({kind:'confluence',name:C.name,flows:F.map(S=>S.id),at,r,feather:fe,cell,n,x0,z0,reach,blur,sharp,meet:meetK,margin:mg,
   y:rd(Y),vx:rd(VX),vz:rd(VZ),slope:rd(SL),bank:rd(BK),fade:rd(FD),meetV:rd(ME)});
  W.groups.push(C);return C;};
})();
