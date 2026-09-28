// Presets, DERIVED. 89z-rows.js loads before 90-scene.js and this file after it,
// so both builders have run and left their dimensions in BL_SITE. BLDEF is the
// fallback only if a builder threw.
//
// The camera is 50 degrees vertical, so a frame is 0.933 x the sight line tall:
// the whole ~850 m group needs ~1 000 m of stand-off, more with the curls.
const BLDEF={x:0,z:0,d:0,PY:24,YC0:118,YC1:125,RO:108,THF:Math.PI/2,THP:-Math.PI/2,RS:262,RP1F:296,PTY:60,PTR:172,
 blades:[{k:'north-east',phi:-1.1,top:750,face300:[80,300,-150],tip:[150,740,-300]},
         {k:'east',phi:0,top:600,face300:[170,300,0],tip:[300,600,0]},
         {k:'south-east',phi:.94,top:440,face300:[110,220,140],tip:[200,440,250]},
         {k:'south-west',phi:2.23,top:520,face300:[-110,260,140],tip:[-200,520,250]},
         {k:'west',phi:3.07,top:670,face300:[-170,300,10],tip:[-300,670,20]},
         {k:'north-west',phi:4.16,top:850,face300:[-90,300,-150],tip:[-160,850,-300]}],
 fall:[{k:'north-west',dir:1,a:[-180,0,-300],b:[-420,0,-700]},{k:'south-west',dir:-1,a:[-80,24,110],b:[80,24,-100]}]};
const BLA=Object.assign({},BLDEF,{x:-2400},BL_SITE[0]||{});
const BLB=Object.assign({},BLDEF,{x:2400},BL_SITE[1]||{});
const BLW=(S,x,y,z)=>[S.x+x,y,S.z+z];
const BLP=(S,k)=>S.blades.find(b=>b.k===k)||S.blades[0];
// a point on a radial axis th, rho out, at height y
const BLR=(S,th,rho,y)=>BLW(S,Math.cos(th)*rho,y,Math.sin(th)*rho);
// THE HERO: from the south-south-west, where the sun is, 1 500 m off and 330 m
// up: the whole flame, the tall north-west blade curling away at the back, and
// through the south entrance the canopy's lintel and the plaza under it.
const BLHERO=S=>BLW(S,-640,330,1380).concat(BLW(S,10,390,0));
const VIEWS={
 'The Blades':               BLHERO(BLA),
 // THE SILHOUETTE: low and far, from the south-south-east, 2 600 m off, the six
 // blades against the sky as one figure.
 'The silhouette':           BLW(BLA,1350,70,2250).concat(BLW(BLA,0,400,0)),
 // INSIDE THE PLAZA, LOOKING UP: standing south of the pool, looking up and
 // north through the oculus between the blades to the tallest curling away.
 'Up between the blades':    BLW(BLA,-18,BLA.PY+1.7,72).concat(BLW(BLA,-30,720,-170)),
 // THE STAIR AND THE PORTAL, at a person's height at the foot of the flight:
 // 120 steps narrowing to the slot between the two tallest blades, the lintel.
 'The stair and the portal': (function(S){const a=BLR(S,S.THP,34,S.PY+1.7),t=BLR(S,S.THP,200,S.PTY+26);
                               a[0]+=7;return a.concat(t);})(BLA),
 // THE SOUTH STAIR from the avenue: the widest gap, the canopy lintel across it
 // 118 m up, the plaza and the portal stair beyond.
 'The south stair':          (function(S){return BLR(S,S.THF,S.RS+190,1.8).concat(BLR(S,S.THF,S.RS-120,70));})(BLA),
 // A CONCAVE FACE, close: the north-east blade's inner face from inside the
 // ring, galleries every six storeys, fins, the window wall between.
 'A concave face':           (function(S){const f=BLP(S,'north-east').face300;
                               return BLW(S,f[0]*.05-70,f[1]-30,f[2]*.05+80).concat(BLW(S,f[0],f[1],f[2]));})(BLA),
 // THE CROWNS: high off the south-west, level with the curls.
 'The crowns':               (function(S){const T=['north-west','west','north-east'].map(k=>BLP(S,k).tip);
                               const cy=(T[0][1]+T[1][1]+T[2][1])/3,cx=(T[0][0]+T[1][0]+T[2][0])/3,cz=(T[0][2]+T[1][2]+T[2][2])/3;
                               return BLW(S,-560,cy+70,460).concat(BLW(S,cx,cy-40,cz));})(BLA),
 // FROM ABOVE: nearly a plan — the ring, the gaps, the canopy and oculus.
 'From above':               BLW(BLA,0,1900,260).concat(BLW(BLA,0,0,0)),
 // NIGHT: the hero after dark.
 'Night':                    BLHERO(BLA).concat([1]),
 // THE PLAZA AT NIGHT: under the canopy, the lit ring beams, the stair lit up
 // to the portal.
 'The plaza at night':       BLW(BLA,50,BLA.PY+30,120).concat(BLR(BLA,BLA.THP,190,70),[1]),
 'Ruined':                   BLHERO(BLB),
 // THE FALLEN BLADE: the north-west blade's upper 490 m lying on the plain in
 // three pieces, the stump behind.
 'The fallen blade':         (function(S){const f=S.fall.find(q=>q.dir>0)||S.fall[0];
                               const mx=(f.a[0]+f.b[0])/2,mz=(f.a[2]+f.b[2])/2,dx=f.b[0]-f.a[0],dz=f.b[2]-f.a[2],L=Math.hypot(dx,dz);
                               return BLW(S,mx-dz/L*620+dx/L*120,260,mz+dx/L*620+dz/L*120).concat(BLW(S,mx-dx/L*60,80,mz-dz/L*60));})(BLB),
 // THE BLADE ACROSS THE PLAZA: from 260 m up inside the ring, looking down on
 // the south-west blade lying where it came through the canopy.
 'Across the plaza':         (function(S){const f=S.fall.find(q=>q.dir<0)||S.fall[0];
                               return BLW(S,40,260,120).concat(BLW(S,(f.a[0]+f.b[0])/2,S.PY+16,(f.a[2]+f.b[2])/2));})(BLB),
 // THE CHOKED PLAZA from a person standing on a rubble heap in its south-east
 // quarter: the fallen blade, the talus, the canopy's slabs, the dead walls.
 'The choked plaza':         BLW(BLB,70,BLB.PY+9,105).concat(BLW(BLB,-80,62,-60)),
 // THE BROKEN CROWNS: high off the south-east, the stumps and the lost curls.
 'The broken crowns':        BLW(BLB,640,900,700).concat(BLW(BLB,-20,520,-40)),
 // THE RUIN FROM ABOVE.
 'The ruin from above':      BLW(BLB,0,2000,300).concat(BLW(BLB,-80,0,-120)),
};
