// ================================================================= HIGHLANDS / TRIBAL — dwellings and the cliff settlement
// The Painted Men and the other raider tribes of the north-east high country. Raw logs, bamboo and thatch; everything that
// can carry paint carries it — whole house-fronts in formline on white, totems at every door, thunderbirds on
// the gables. No electric light (fire only). Every tribal dwelling can be built on the ground (stilts) or HUNG ON
// A CLIFF: pass o.cliff = true and the house stands on cantilever beams and raking struts driven back into a rock
// face behind it (-z), its floor at the placement y; o.gap = the distance from the back wall to the rock (default
// 1.2). Seeds 23000–23199 (this file), 23200–23499 (85-tri-village.js).

// ---------------------------------------------------------------- package kit (prefix hTR / hnTR)
// Painted maps, drawn with the formline primitives of 70-hl-tex.js (ovoids, U-forms, split-Us, trigons, swooping
// primary lines). Naturalistic ANIMALS and plain formline only — no human faces anywhere in the branch.
// Colour-carrying: never tint them strongly.
// a formline salmon, drawn in canvas units: head at (hx,hy), body sweeping to the tail at (tx,ty), s = scale
function hTRSalmon(g,hx,hy,tx,ty,s,body,accent){const mx=(hx+tx)/2,my=(hy+ty)/2;const nx=-(ty-hy),ny=tx-hx;const L=Math.hypot(nx,ny)||1;const ox=nx/L*s*.32,oy=ny/L*s*.32;
 g.beginPath();g.moveTo(hx,hy);g.quadraticCurveTo(mx+ox*2.2,my+oy*2.2,tx,ty);g.quadraticCurveTo(mx-ox*.6,my-oy*.6,hx,hy);g.fillStyle=body;g.fill();
 g.lineWidth=s*.05;g.strokeStyle=HFORM.black;g.stroke();
 g.beginPath();g.moveTo(hx+(tx-hx)*.22,hy+(ty-hy)*.22);g.quadraticCurveTo(mx+ox*1.1,my+oy*1.1,hx+(tx-hx)*.86,hy+(ty-hy)*.86);g.lineWidth=s*.05;g.strokeStyle=accent;g.stroke();   // lateral line
 hlOvoid(g,hx+(tx-hx)*.12+ox*.5,hy+(ty-hy)*.12+oy*.5,s*.26,s*.2,HFORM.black,HFORM.white,s*.035);hlOvoid(g,hx+(tx-hx)*.12+ox*.5,hy+(ty-hy)*.12+oy*.5+s*.02,s*.11,s*.09,null,HFORM.black);  // eye
 hlUForm(g,mx+ox*1.9,my+oy*1.9,s*.16,s*.16,accent,s*.045);hlUForm(g,mx+ox*.4,my+oy*.4,s*.12,s*.12,HFORM.black,s*.035);                      // fins
 for(const k of[-1,1]){g.beginPath();g.moveTo(tx,ty);g.lineTo(tx+(tx-hx)*.12+ox*k*.9,ty+(ty-hy)*.12+oy*k*.9);g.lineWidth=s*.09;g.strokeStyle=HFORM.black;g.lineCap='round';g.stroke();g.lineCap='butt';}}
// TR_FRONT: a whole house-front (2:1) on white — the THUNDERBIRD with wings spread across the front, feathers
// stepping out along each wing, a head in profile with a hooked beak on the axis, a fan tail over the door
TEX.trFront=canvasTex(512,256,(g,w,h)=>{g.fillStyle=HFORM.white;g.fillRect(0,0,w,h);
 hlMirror(g,w,h,w/2,g=>{
  hlSwoop(g,[[w*.44,h*.36],[w*.3,h*.12],[w*.12,h*.06],[w*.02,h*.2]],HFORM.black,h*.07);                              // leading edge of the wing
  for(let k=0;k<7;k++)hlUForm(g,w*(.05+k*.052),h*(.38-k*.012),w*.046,h*.34,k%2?HFORM.red:HFORM.black,w*.012);        // flight feathers
  hlOvoid(g,w*.33,h*.3,w*.1,h*.16,HFORM.black,HFORM.teal,w*.012);hlOvoid(g,w*.33,h*.31,w*.05,h*.08,null,HFORM.black);   // wing joint
  hlUForm(g,w*.42,h*.84,w*.05,h*.16,HFORM.black,w*.014);hlTrigon(g,w*.38,h*.9,w*.03,HFORM.red);                        // talons
  hlTrigon(g,w*.1,h*.8,w*.05,HFORM.teal);hlSplitU(g,w*.22,h*.78,w*.07,h*.14,HFORM.red,w*.016);});
 hlOvoid(g,w/2,h*.6,w*.13,h*.5,HFORM.black,HFORM.red,w*.014);hlOvoid(g,w/2,h*.6,w*.07,h*.24,HFORM.black,HFORM.white,w*.01);   // body
 hlSplitU(g,w/2,h*.62,w*.04,h*.1,HFORM.black,w*.01);
 for(let k=-2;k<=2;k++)hlUForm(g,w/2+k*w*.028,h*.92,w*.024,h*.12,k%2?HFORM.red:HFORM.black,w*.008);                     // fan tail
 hlOvoid(g,w/2,h*.2,w*.11,h*.26,HFORM.black,HFORM.white,w*.013);hlOvoid(g,w*.505,h*.17,w*.04,h*.08,HFORM.black,HFORM.teal,w*.006);   // head + eye
 hlOvoid(g,w*.505,h*.175,w*.018,h*.035,null,HFORM.black);
 g.beginPath();g.moveTo(w*.545,h*.12);g.quadraticCurveTo(w*.63,h*.12,w*.615,h*.3);g.quadraticCurveTo(w*.6,h*.24,w*.545,h*.25);g.closePath();g.fillStyle=HFORM.black;g.fill();   // hooked beak
 g.beginPath();g.moveTo(w*.55,h*.19);g.quadraticCurveTo(w*.59,h*.19,w*.598,h*.24);g.lineWidth=w*.005;g.strokeStyle=HFORM.red;g.stroke();
 for(const s of[-1,1])hlUForm(g,w/2+s*w*.03,h*.05,w*.03,h*.07,HFORM.red,w*.008);                                       // crest feathers
 g.fillStyle=HFORM.black;g.fillRect(0,h*.965,w,h*.035);});
// TR_FRONT_K: a pair of leaping SALMON on bare cedar, heads meeting under the apex — 1:1, for gable-ends
TEX.trFrontK=canvasTex(256,256,(g,w,h)=>{hlCedar(g,w,h,HFORM.cedar,true);
 hlMirror(g,w,h,w/2,g=>{hTRSalmon(g,w*.44,h*.3,w*.12,h*.88,w*.5,HFORM.red,HFORM.teal);hlTrigon(g,w*.06,h*.2,w*.08,HFORM.teal);hlUForm(g,w*.36,h*.9,w*.1,h*.08,HFORM.black,w*.02);});
 hlOvoid(g,w/2,h*.14,w*.14,h*.1,HFORM.black,HFORM.teal,w*.02);
 g.fillStyle=HFORM.black;g.fillRect(0,h*.95,w,h*.05);});
// TR_SHIELD: a round war shield — black rim, red ring, a coiled salmon in plain formline; the field takes the tint
TEX.trShield=canvasTex(128,128,(g,w,h)=>{g.fillStyle=HFORM.white;g.fillRect(0,0,w,h);
 g.beginPath();g.arc(w/2,h/2,w*.47,0,TAU);g.lineWidth=w*.07;g.strokeStyle=HFORM.black;g.stroke();
 g.beginPath();g.arc(w/2,h/2,w*.38,0,TAU);g.lineWidth=w*.03;g.strokeStyle=HFORM.red;g.stroke();
 hTRSalmon(g,w*.66,h*.28,w*.3,h*.74,w*.62,HFORM.black,HFORM.red);hlTrigon(g,w*.3,h*.26,w*.12,HFORM.teal);});
// TR_CONE: painted bands for a conical roof (u round the cone, v up) — a red band of U-forms, a cedar band of
// salmon swimming round, a black band of teal trigons, black toward the smoke hole
TEX.trCone=canvasTex(256,256,(g,w,h)=>{g.fillStyle=HFORM.black;g.fillRect(0,0,w,h);
 g.fillStyle=HFORM.red;g.fillRect(0,h*.78,w,h*.22);for(let k=0;k<4;k++)hlUForm(g,w*(k+.5)/4,h*.87,w*.16,h*.12,HFORM.white,w*.03);
 g.fillStyle=HFORM.cedar;g.fillRect(0,h*.5,w,h*.26);for(let k=0;k<2;k++)hTRSalmon(g,w*(k*.5+.42),h*.6,w*(k*.5+.06),h*.66,w*.36,HFORM.black,HFORM.red);
 for(let k=0;k<6;k++)hlTrigon(g,w*(k+.2)/6,h*.38,w*.08,HFORM.teal);
 g.fillStyle=HFORM.white;g.fillRect(0,h*.47,w,h*.02);g.fillRect(0,h*.76,w,h*.015);});
MAT.trFront=hStd({map:TEX.trFront,roughness:.8});MAT.trFrontK=hStd({map:TEX.trFrontK,roughness:.8});
MAT.trShield=hStd({map:TEX.trShield,roughness:.75});
MAT.trCone=hStd({map:TEX.trCone,roughness:.85});MAT.trIron=hStd({color:0x3a3430,roughness:.6,metalness:.5});
// geometry: a woven-mat cylinder (u scaled by 2π so the instanced world-UV hook tiles it per metre of
// circumference), a painted band cylinder, a painted cone with a smoke hole, a disc, a bowl
function hTRCylGeo(seg,rTop,open,uK){const g=new THREE.CylinderGeometry(rTop,1,1,seg,1,open).translate(0,.5,0);const uv=g.attributes.uv;
 for(let i=0;i<uv.count;i++)uv.setX(i,uv.getX(i)*uK);return g;}
kdef('hTRMatCyl',hTRCylGeo(14,1,true,TAU),MAT.bmat);kdef('hTRBandCyl',hTRCylGeo(14,1,true,TAU),MAT.formF);
kdef('hTRConeP',hTRCylGeo(10,.06,true,3),MAT.trCone);kdef('hTRDisc',new THREE.CylinderGeometry(1,1,1,14).translate(0,.5,0),MAT.woodV);
kdef('hTRShield',new THREE.CircleGeometry(1,16),MAT.trShield);
kdef('hTRBowl',new THREE.SphereGeometry(1,12,5,0,TAU,Math.PI/2,Math.PI/2),MAT.trIron);kdef('hTRFlame',VCONE,MAT.ember);
kdef('hTRVoid',VBALL,MAT.void);kdef('hTRLeafB',VBOX,MAT.moss);

// ---------------------------------------------------------------- package helpers
// A plain mesh from fn(u,v) -> [x,y,z,U,V] (own UVs — for painted lenses and gables mapped to their bounding box)
function hnTRGrid(G,fn,nu,nv,mat){const pos=[],uv=[],idx=[];for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){const p=fn(i/nu,j/nv);pos.push(p[0],p[1],p[2]);uv.push(p[3],p[4]);}
 for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=j*(nu+1)+i,b=a+1,c=a+nu+1,d=c+1;idx.push(a,c,b,b,c,d);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 geo.setIndex(idx);geo.computeVertexNormals();return mesh(geo,mat,G);}
// A painted gable-end front: the pentagon of a wall W x H plus its gable (rise), in one painting, standing on
// (x,y,z) facing ry. The whole house-front of the tribes.
function hnTRPent(G,x,y,z,ry,W,H,rise,mat){const P=[[-W/2,0],[W/2,0],[W/2,H],[0,H+rise],[-W/2,H]];const pos=[],uv=[];
 for(const [u,yy] of P){const p=loc(x,z,u,0,ry);pos.push(p[0],y+yy,p[1]);uv.push(u/W+.5,yy/(H+rise));}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 geo.setIndex([0,1,2,0,2,4,4,2,3]);geo.computeVertexNormals();return mesh(geo,mat||MAT.trFront,G);}
// Braziers, trophy horns, hanging gourds and fire cages are FURNITURE, placed from the catalog (FURNISH, 89y); the helpers
// keep their arguments, pick the nearer catalog size, and burn the numbers the drawing drew (hlRngSkip, 73).
// Iron brazier on a tripod with a fire in the bowl (s = scale, ~1 m tall bowl rim at s=1)
function hnTRBrazier(x,y,z,s){hlRngSkip(9);return FURNISH('hl_tri_brazier',x,y,z,0,{v:(s||1)>=1?1:0});}
// Trophy horns: a pair of curved horns on a painted boss block, on a gable apex or a gate post; ry = the way they face,
// (x,y,z) the root of the horns
function hnTRHorns(x,y,z,ry,s){const v=(s||1)>=1?1:0;return FURNISH('hl_tri_trophy_horns',x,y-.25*(v?1.3:.7),z,ry,{v});}
// A few people standing at height y (on a deck, platform or terrace) — vnFolk always stands them on y=0
function hnTRFolk(x,y,z,n,spread){for(let i=0;i<n;i++){const px=x+rr(-spread,spread),pz=z+rr(-spread,spread);kput('figB',[px,y,pz],qEuler(0,rng()*TAU,0),1,hC(vPick([0xe8d9b8,0xc9442a,0x2f8f8a,0xe0a030,0x3b4a8a,0x8a6a3a])));kput('figH',[px,y,pz],null,1,hC(0xc9a17e));}}
// Hanging things along eaves and walkways: a gourd, or a lantern cage (a bamboo cage with a fire-pot, not electric)
// (x,y,z) the point it hangs from
function hnTRGourd(x,y,z,c){if(!c)rng();return FURNISH('hl_tri_gourd',x,y-.7,z,0);}
function hnTRCage(x,y,z){rng();return FURNISH('hl_tri_fire_cage',x,y-.8,z,0);}
// The great plank-house's entrance pole is not furniture: its lowest figure's mouth is the door. Drawn (the totem the
// tribes' hnTotem drew before it placed catalog poles): carved column, beak, thunderbird crossarm.
function hnTREntrancePole(x,y,z,r,h,ry,wings,wingAt){kput('hTotem',[x,y,z],qEuler(0,ry+Math.PI,0),[r,h,r],null);
 const f=loc(x,z,0,r*.9,ry);kput('vConeI',[f[0],y+h*.86,f[1]],vQ(ry,Math.PI/2,0),[r*.34,r*1.3,r*.34],hC(HPAL.black));
 const wy=y+h*wingAt;for(const s of[-1,1]){const p=loc(x,z,s*(r+wings*.5),r*.2,ry);kput('hWing',[p[0],wy,p[1]],vQ(ry,0,s*-.12),[s*wings,wings*.5,1],null);}}
// A box-built beast for pens and byres: 'cow' (shaggy highland), 'goat', 'pig'
function hnTRBeast(x,y,z,ry,kind,c){const K={cow:[1.7,.8,.62,.72],goat:[.9,.42,.32,.5],pig:[1.05,.5,.46,.28]}[kind]||[1,.5,.4,.5];const [L,Hb,Wb,Lg]=K;
 c=c||hC(kind==='cow'?vPick([0x8a4a2a,0x6a3a22,0xa0602e]):kind==='goat'?vPick([0xd8d0c0,0x6a5a4a,0xe8e0d0]):vPick([0xc89a8a,0x5a4a44]));
 const P=(u,yy,v)=>{const p=loc(x,z,v,u,ry);return[p[0],y+yy,p[1]];};const q=qEuler(0,ry,0);
 kput('vWood',P(0,Lg+Hb/2,0),q,[Wb,Hb,L],c);                                                         // body (along the beast's +z)
 for(const a of[-1,1])for(const b of[-1,1])kput('vWood',P(a*L*.36,Lg/2,b*Wb*.32),q,[.1,Lg,.1],c.clone().multiplyScalar(.8));
 const hy=Lg+Hb*(kind==='pig'?.45:.9),hz=L/2+.12;kput('vWood',P(hz,hy,0),q.clone().multiply(qEuler(kind==='pig'?0:.5,0,0)),[Wb*.7,Hb*.55,Hb*.8],c);
 if(kind!=='pig')for(const s of[-1,1]){const h=P(hz-.05,hy+Hb*.3,s*Wb*.3);beam('hPaint',h,[h[0]+s*Math.cos(ry)*.25*(kind==='cow'?1.6:.6),h[1]+.18,h[2]-s*Math.sin(ry)*.25*(kind==='cow'?1.6:.6)],.05,.05,hC(0xd8ccb0));}
 kput('vWood',P(-L/2-.05,Lg+Hb*.7,0),q.clone().multiply(qEuler(-.6,0,0)),[.06,.06,.3],c);}

// ---------------------------------------------------------------- the base: stilts, or the cliff cantilever
// Under a floor of W x D at height FL (the floor's front edge may run on to `front` for a deck or veranda).
// Cliff: log joists from the deck edge back INTO the rock (gap + 1.4 m past the back wall), raking struts from
// the front edge down and back into the rock, a cross log at the front, rubble packing where the joists bite.
function hnTriBase(W,D,FL,c,cliff,o,front){front=front===undefined?D/2:front;
 if(!cliff){vnStilts(0,0,0,W-.6,D-.6,FL,0,c);return;}
 const gap=(o&&o.gap!==undefined)?o.gap:1.2,back=-D/2-gap;const n=Math.max(2,Math.round(W/2.4)+1);
 for(let i=0;i<n;i++){const x=-W/2+.35+(W-.7)*i/(n-1);
  kput('hLogX',[x,-.34,(front+back-1.4)/2],qEuler(0,Math.PI/2,0),[front-back+1.4,.17,.17],c);
  const sh=(front-back)*1.05;beam('vWood',[x,-.45,front-.35],[x,-.45-sh,back-.4],.17,.17,c);
  if(i%2===0)beam('vWood',[x,-.45-sh*.5,(front+back)/2-.2],[x,-.5,back-.2],.12,.12,c);}
 kput('hLogX',[0,-.6,front-.35],null,[W+.3,.18,.18],c);kput('hLogX',[0,-.45-(front-back)*.5,(front+back)/2],null,[W-.4,.14,.14],c);
 for(let i=0;i<3;i++)kput('vRock',[rr(-W/2,W/2),-.3,back-.1],qEuler(rng(),rng(),0),[rr(.4,.8),.35,.5],hC(vPick(HPAL.rubble)));}
// the dwellings' footprints, for anyone hanging them on a cliff (back wall at -D/2, deck front at `front`,
// height of the roof tip): the settlement builder spaces houses and walkways with these
const HN_TR_FOOT={hl_tri_small_a:{W:6,D:5,front:4.1,H:6.4},hl_tri_small_b:{W:6.4,D:6.4,front:4.8,H:8.2},hl_tri_small_c:{W:6,D:5.6,front:4.6,H:6.6},
 hl_tri_large_a:{W:13,D:11,front:8,H:13},hl_tri_large_b:{W:18,D:6.5,front:5.6,H:7.4}};

// ---------------------------------------------------------------- SMALL
// A — painted hut: a board-and-bamboo hut on stilts, its whole front painted in formline on white, a thatch gable
// with a thunderbird on the apex, a winged totem by the ladder.
function buildHlTriSmallA(G,o){reseed(23001+(o.v|0));const W=6,D=5,FL=o.cliff?0:1.6,H=2.4,Y=FL;
 const log=hC(vPick(HPAL.aged)),th=hC(vPick(VPAL.thatch)),bam=hC(vPick(HPAL.bamboo));
 vnReg('Painted hut (small)',0,0,5,FL+H+3.6);
 hnTriBase(W,D,FL,log,o.cliff,o,D/2+1.6);
 vB('vWood',0,Y-.2,0,W,.2,D,0,log);hnBambooBox(0,Y,0,W,H,D,0,bam);
 hnForm('hFormW',0,Y+.1,D/2+.04,0,W-.4,H-.2);                                            // the painted house-front
 vnDoor(0,Y,D/2+.08,0,.9,1.8,'vWood',bam,hC(0x5a4a3a),false);
 hnGable(0,Y+H,0,W,D,1.2,0,'vGableT',th,.9,'hGableBM',bam);hnBarge(0,Y+H,0,W,D,1.2*D/2,0,.9,hC(HPAL.black),'bird');
 vB('vWood',0,Y-.2,D/2+.8,2.4,.18,1.6,0,log);
 if(!o.cliff){vnLadder(1,0,D/2+1.8,0,FL+.3,log);hnTotem(-1.8,0,D/2+1.4,.3,5.2,0,{wings:1.4});}
 else{hnTotem(-W/2-.3,Y,D/2-.2,.24,3.4,0,{});hnBambooRail([-1.2,Y,D/2+1.55],[1.2,Y,D/2+1.55],bam,1);}
 for(let k=0;k<3;k++)hnTRGourd(-W/2+1+k*1.2,Y+H-.1,D/2+.7);
 if(!o.cliff){hnFirepit(2.4,0,D/2+3,.6);vnFolk(0,D/2+4,2,1.5);}}

// B — round bamboo hut: a drum of woven mat between bamboo culms on low stilts, a painted band round it at eye
// height, a steep thatch cone with a carved bird on the peak; a little deck and steps.
function buildHlTriSmallB(G,o){reseed(23011+(o.v|0));const R=2.7,FL=o.cliff?0:.9,H=2.3,Y=FL;
 const bam=hC(vPick(HPAL.bamboo)),th=hC(vPick(VPAL.thatch)),log=hC(vPick(HPAL.aged));
 vnReg('Round bamboo hut (small)',0,0,4.2,Y+H+5.6);
 hnTriBase(2*R+.6,2*R+.6,FL,log,o.cliff,o,R+1.9);
 vPst('hTRDisc',0,Y-.22,0,R+.35,.22,log);
 kput('hTRMatCyl',[0,Y,0],null,[R,H,R],bam);
 const n=16;for(let k=0;k<n;k++){const a=k/n*TAU+.1;vPst('hBamboo',Math.sin(a)*(R+.05),Y,Math.cos(a)*(R+.05),.07,H-.05,bam);}
 kput('hTRBandCyl',[0,Y+1.25,0],null,[R+.1,.55,R+.1],null);
 for(const yy of[Y+.12,Y+H-.1])kput('vHoop',[0,yy,0],qEuler(Math.PI/2,0,0),[R+.12,R+.12,1.4],bam);
 vnDoor(0,Y,R+.12,0,.9,1.8,'vWood',bam,hC(0x5a4a3a),false);
 vnThatchCone(0,Y+H,0,R+.35,4.6,th);
 vPst('vPost',0,Y+H+4.2,0,.07,1.1,log);kput('hPaintBall',[0,Y+H+5.3,0],null,[.18,.22,.18],hC(HPAL.black));   // the peak: a carved bird
 for(const s of[-1,1])kput('hWing',[s*.55,Y+H+5.35,0],qEuler(0,0,s*-.2),[s*1.1,.55,1],null);
 kput('vConeI',[0,Y+H+5.3,.2],vQ(0,Math.PI/2,0),[.06,.28,.06],hC(HPAL.red));
 vB('vWood',0,Y-.2,R+.9,2.2,.18,1.8,0,log);                                                          // deck
 hnForm('hFormV',-1.25,Y+.2,R-.25,.35,.55,1.5);hnForm('hFormV',1.25,Y+.2,R-.25,-.35,.55,1.5);      // painted boards beside the door
 if(!o.cliff){vnStairs(0,0,R+2.3,0,1.1,FL,3,'vWood',log);hnTotemPole(-1.6,0,R+1.6,.16,2.8,0,true);hnDryingRack(R+1.8,0,0,Math.PI/2,2.4);vnFolk(1.5,R+3.5,1,1);}
 else{hnBambooRail([-1.1,Y,R+1.75],[1.1,Y,R+1.75],bam,1);hnTotemPole(-1.3,Y,R+1.5,.14,2.4,0,true);}
 for(let k=0;k<4;k++){const a=(k+.5)/4*Math.PI-Math.PI/2+Math.PI*.1;hnTRGourd(Math.sin(a)*(R+.25),Y+H+.05,Math.cos(a)*(R+.25));}}

// C — painted earth-lodge: a low log hut on a fieldstone footing, gable to the front and the whole gable-end
// painted in formline on cedar (a pair of leaping salmon); a steep turf roof with crossed horns and trophy horns.
function buildHlTriSmallC(G,o){reseed(23021+(o.v|0));const W=5.6,D=5.2,H=2.15,F=o.cliff?.2:.35,Y=o.cliff?0:0;
 const log=hC(vPick(HPAL.tar)).multiplyScalar(rr(1.1,1.4)),turf=hC(vPick(HPAL.turf));
 vnReg('Painted earth-lodge (small)',0,0,4.6,F+H+4.2);
 if(o.cliff){hnTriBase(W,D,0,log,true,o,D/2+1.8);vB('vWood',0,-.2,.9,W+.3,.2,D+1.8,0,log);}
 else vB('hRubB',0,0,0,W+.3,F,D+.3,0,hC(vPick(HPAL.rubble)));
 hnLogBox(0,Y+F,0,W,H,D,0,log,.3);
 const pitch=1.35,rise=pitch*W/2;hnGable(0,Y+F+H,0,D,W,pitch,Math.PI/2,'hGableTurf',turf,.55,'hGableLog',log);
 hnBarge(0,Y+F+H,0,D,W,rise,Math.PI/2,.55,hC(0x3a2a20),'horns');
 hnTRPent(G,0,Y+F,D/2+.06,0,W-.1,H,rise-.1,MAT.trFrontK);                                      // the painted gable-end
 hnTRHorns(0,Y+F+H+rise+.2,D/2+.7,0,.8);
 vnDoor(0,Y+F,D/2+.1,0,.9,1.75,'vWood',log,hC(0x3a2a20),false);
 for(const s of[-1,1])vnWin(s*W/2,Y+F+.9,0,s*Math.PI/2,.5,.5,'open','vWood',log);
 vPst('vPost',1.2,Y+F+H+rise*.3,-.8,.12,rise*.7+.6,hC(0x5a4a3a));                                    // smoke hole chimney-post
 if(!o.cliff){vB('vStone',0,0,D/2+.6,1.6,.2,1,0,hC(vPick(HPAL.rubble)));hnWoodpile(-W/2-.7,0,-.4,Math.PI/2,3,1.2);hnTotemPole(W/2+.6,0,D/2+.5,.17,2.6,0,true);
  hnDryingRack(W/2+2,0,-1,Math.PI/2,2.2);hnFirepit(-1.8,0,D/2+2.6,.5);vnFolk(1,D/2+3.2,1,1);}
 else{hnBambooRail([-W/2,0,D/2+1.72],[W/2,0,D/2+1.72],null,1);hnTotemPole(W/2-.3,0,D/2+1.2,.15,2.4,0,true);hnTRCage(-W/2+.6,Y+F+H,D/2+.8);}}

// ---------------------------------------------------------------- LARGE
// A — great plank-house (after the NW-coast house): a wide, low-pitched plank gable with the gable end to the
// front, the ENTIRE front painted in formline on white, and a tall entrance pole before it whose base is the
// door (an oval opening through the lowest figure). Corner posts, a plank deck across the front.
function buildHlTriLargeA(G,o){reseed(23031+(o.v|0));const W=13,D=11,H=3.4,F=o.cliff?0:.55,Y=F;
 const tar=hC(vPick(HPAL.tar)).multiplyScalar(rr(1.2,1.5)),aged=hC(vPick(HPAL.aged)),bam=hC(vPick(HPAL.bamboo));
 vnReg('Great plank-house (large)',0,0,8.5,Y+H+10);
 if(o.cliff)hnTriBase(W,D,0,aged,true,o,D/2+2.6);
 else vB('hRubB',0,0,0,W+.4,F,D+.4,0,hC(vPick(HPAL.rubble)));
 vB('vWood',0,Y,0,W,H,D,0,tar);                                                               // plank walls
 for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPostB',sx*(W/2+.05),Y,sz*(D/2+.05),.26,H+.3,aged);
 for(const sx of[-1,1])kput('hLogX',[sx*(W/2+.15),Y+H+.1,0],qEuler(0,Math.PI/2,0),[D+1.6,.24,.24],aged);   // eave plates
 const pitch=.44,rise=pitch*W/2;hnGable(0,Y+H,0,D,W,pitch,Math.PI/2,'vWood',aged.clone().multiplyScalar(.9),.8,'vGableW',tar);
 kput('hLogX',[0,Y+H+rise+.25,0],qEuler(0,Math.PI/2,0),[D+2,.28,.28],aged);                             // ridge log
 vB('vWood',0,Y+H+rise+.3,-1,2.2,.6,2.4,0,aged);vnGableRoof(0,Y+H+rise+.9,-1,2.6,2.8,.6,0,'vWood',aged,.15);   // smoke-hole louvre
 hnTRPent(G,0,Y,D/2+.07,0,W,H,rise,MAT.trFront);                                                          // the painted front
 for(const s of[-1,1]){hnMember('hPaint',[s*W/2,Y+H,D/2+.12],[0,Y+H+rise,D/2+.12],.26,.08,[0,0,1],hC(HPAL.black));}
 // the entrance pole: its lowest figure's mouth is the door
 const pz=D/2+.62;hnTREntrancePole(0,Y,pz,.62,o.cliff?8:11.5,0,2.6,.84);kput('hTRVoid',[0,Y+.95,pz+.42],null,[.46,.95,.3]);
 vB('vDarkB',0,Y,D/2+.02,1.1,1.9,.1,0);
 // deck across the front, carved corner posts, steps
 vB('vWood',0,Y-.2,D/2+1.35,W+.6,.2,2.7,0,aged);for(const s of[-1,1])hnTotemPole(s*(W/2-.1),Y,D/2+2.4,.2,2.6,0,s>0);   // carved posts at the deck corners
 hnFrieze(0,Y-.4,D/2+2.72,0,W+.6,.35);
 for(const s of[-1,1]){vnWin(s*W/2,Y+1.2,-1.5,s*Math.PI/2,.8,.7,'open','vWood',aged);vnWin(s*W/2,Y+1.2,2.5,s*Math.PI/2,.8,.7,'open','vWood',aged);
  hnForm('hFormV',s*(W/2+.04),Y+.2,D/2-.8,s*Math.PI/2,.8,2.8);}
 for(let k=0;k<5;k++)hnTRGourd(-W/2+1.2+k*1.3,Y+H-.1,D/2+1);
 if(!o.cliff){vnStairs(-3.6,0,D/2+3.2,0,2.4,F,2,'vWood',aged);vnStairs(3.6,0,D/2+3.2,0,2.4,F,2,'vWood',aged);
  hnDryingRack(W/2+2,0,0,Math.PI/2,5);hnDryingRack(-W/2-2,0,1,Math.PI/2,4);hnWoodpile(-W/2-1,0,-3.4,Math.PI/2,3,1.4);
  hnFirepit(4.5,0,D/2+6,.7);hnTotem(-5.5,0,D/2+4.5,.3,5,0,{painted:true,wings:1.3});vnFolk(0,D/2+6,3,2.5);}
 else{hnBambooRail([-W/2-.3,0,D/2+2.62],[-1,0,D/2+2.62],bam,1);hnBambooRail([1,0,D/2+2.62],[W/2+.3,0,D/2+2.62],bam,1);}}

// B — long-dwelling on stilts: a bamboo house for several families under one long, steep thatch gable, a
// veranda the whole length of the front under a lean-to, three doors between painted panels, ladders up from
// the ground, racks of drying fish and herbs, firewood stacked between the stilts.
function buildHlTriLargeB(G,o){reseed(23041+(o.v|0));const W=18,D=6.5,FL=o.cliff?0:2.4,H=2.8,Y=FL,V=2.4;
 const bam=hC(vPick(HPAL.bamboo)),th=hC(vPick(VPAL.thatch)),log=hC(vPick(HPAL.aged)),blk=hC(HPAL.black);
 vnReg('Long-dwelling (large)',0,.8,10,Y+H+5);
 if(o.cliff)hnTriBase(W,D,0,log,true,o,D/2+V);
 else{vnStilts(0,0,0,W-.6,D-.6,FL,0,log);vnStilts(0,0,D/2+V/2,W-.6,V-.5,FL,0,log);}
 vB('vWood',0,Y-.2,.0,W+.2,.2,D,0,log);vB('vWood',0,Y-.2,D/2+V/2,W+.2,.2,V,0,log);
 hnBambooBox(0,Y,0,W,H,D,0,bam);
 for(const u of[-6,0,6]){vnDoor(u,Y,D/2+.08,0,.9,1.9,'vWood',bam,hC(0x5a4a3a),false);}
 for(const u of[-3,3,-8.2,8.2])hnForm('hFormW',u,Y+.35,D/2+.05,0,u*u>40?1.3:3.8,1.9);
 const pitch=1.15,rise=pitch*D/2;hnGable(0,Y+H,0,W,D,pitch,0,'vGableT',th,.7,'hGableBM',bam);hnBarge(0,Y+H,0,W,D,rise,0,.7,blk,'bird');
 // veranda lean-to on bamboo posts, front edge at 2.2 m
 for(let k=0;k<=6;k++){const x=-W/2+.2+(W-.4)*k/6;vPst('hBamboo',x,Y,D/2+V-.15,.09,2.3,bam);}
 kput('hLogX',[0,Y+2.25,D/2+V-.15],null,[W+.2,.1,.1],bam);vnShedRoof(0,Y+2.3,D/2+V/2-.1,W,V+.3,.5,0,'vThatchB',th,.4,.22);
 const gaps=o.cliff?[[-1.2,1.2]]:[[-6.8,-5.2],[5.2,6.8]];let x0=-W/2;for(const [a,b] of gaps){hnBambooRail([x0,Y,D/2+V-.15],[a,Y,D/2+V-.15],bam,.95);x0=b;}hnBambooRail([x0,Y,D/2+V-.15],[W/2,Y,D/2+V-.15],bam,.95);
 for(const u of[-8,-3.5,2.5,7.5]){const a=[u-.9,Y+2.05,D/2+.9],b=[u+.9,Y+2.05,D/2+.9];beam('hBambooC',a,b,.05,.05,bam);   // drying poles under the lean-to
  for(let k=0;k<4;k++)kput('vLeaf',[u-.7+k*.47,Y+1.8,D/2+.9],null,[.1,.28,.08],hC(vPick([0x8a7a44,0x6a7a3a,0xa08850])));}
 for(let k=0;k<6;k++)hnTRGourd(-W/2+1.5+k*3,Y+2.2,D/2+V-.05);
 if(!o.cliff){vnLadder(-6,0,D/2+V+.55,0,FL+.3,log);vnLadder(6,0,D/2+V+.55,0,FL+.3,log);
  hnWoodpile(-3,0,-.5,0,6,1.3);hnDryingRack(0,0,D/2+V+3,0,6);hnDryingRack(W/2+2.2,0,-.5,Math.PI/2,4);
  hnTotem(0,0,D/2+V+1.4,.28,5.6,0,{wings:1.5,painted:true});hnFirepit(-4,0,D/2+V+4,.6);vnFolk(3,D/2+V+4,3,3);}}

// ---------------------------------------------------------------- the CLIFF SETTLEMENT (showcase + reusable)
// A rock face (the showcase draws its own; in a settlement the rock is the terrain) with dwellings hung on it at
// irregular heights, some pairs sharing a platform, joined by walkways that run along each tier and zig-zag
// flights of stairs between tiers; ladders, a cliff-hung shrine, a warrior lookout on the top ledge, gourds and
// fire-cages hanging along the walks.
// The rock: z of the face at (x,y) — the face leans back with height and bulges. Returns zf(x,y).
function hnTRRock(G,x0,x1,y0,y1,zc,seed,lean){const W=x1-x0,H=y1-y0;
 const zf=(x,y)=>{const u=(x-x0)/W,v=(y-y0)/H;return zc+(1-v)*lean+(fbm(u*3+seed,v*2.2,seed*.3,4)-.5)*3.2+(fbm(u*11,v*8,seed,2)-.5)*1.2;};
 const geo=gridSurface((u,v)=>{const X=x0+u*W,Y=y0+v*H;return[X,Y,zf(X,Y)];},Math.round(W/1.5),Math.round(H/1.5),{uS:W/8,vS:H/8});
 const m=mesh(geo,MAT.rock,G);m.material=MAT.rock.clone();m.material.color=hC(0x8a8680);
 // the rock's top: a ledge running back, and the scree at the foot
 const top=gridSurface((u,v)=>{const X=x0+u*W;return[X,y1+(fbm(u*6,v,seed,2)-.5)*1.2,zf(X,y1)-v*14];},Math.round(W/3),4,{uS:W/8,vS:2});
 const t=mesh(top,MAT.rock,G);t.material=m.material;
 for(let k=0;k<Math.round(W/3);k++){const x=rr(x0+2,x1-2);kput('vRock',[x,0,zf(x,0)+rr(.4,1.8)],qEuler(rng(),rng(),0),[rr(.6,1.8),rr(.4,1),rr(.6,1.4)],hC(vPick(HPAL.rubble)));}
 return zf;}
// A walkway along points [x,y,z] (deck level) against the rock zf: plank deck (steps where it climbs), bamboo
// rail on the open (+z) side, joists and raking struts from the outer edge back into the rock. `skip(p)` says
// whether a strut foot would land inside a house (then it is left out).
function hnTRWalk(pts,w,zf,c,skip){for(let i=0;i+1<pts.length;i++){const a=pts[i],b=pts[i+1];const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2];const L=Math.hypot(dx,dz);const yaw=Math.atan2(dx,dz);
  if(L<.05)continue;
  if(Math.abs(dy)<.25)beam('vWood',[a[0],a[1]-.08,a[2]],[b[0],b[1]-.08,b[2]],w,.14,c);
  else{const n=Math.max(2,Math.round(Math.abs(dy)/.2));for(let k=0;k<n;k++){const t=(k+.5)/n;kput('vWood',[lerp(a[0],b[0],t),lerp(a[1],b[1],t)-.05,lerp(a[2],b[2],t)],qEuler(0,yaw,0),[w,.07,L/n+.05],c);}
   for(const s of[-1,1]){const o=[Math.cos(yaw)*w/2*s,0,-Math.sin(yaw)*w/2*s];beam('vWood',hAdd([a[0],a[1]-.2,a[2]],o),hAdd([b[0],b[1]-.2,b[2]],o),.07,.22,c);}}
  hnBambooRail([a[0],a[1],a[2]+w/2-.05],[b[0],b[1],b[2]+w/2-.05],null,1.05);
  const ns=Math.max(1,Math.round(L/2.6));for(let k=(i===0?0:1);k<=ns;k++){const t=k/ns;const p=[lerp(a[0],b[0],t),lerp(a[1],b[1],t)-.16,lerp(a[2],b[2],t)];
   const edge=[p[0],p[1],p[2]+w/2-.1];const fy=p[1]-2.8;const foot=[p[0],fy,zf(p[0],fy)-.35];
   if(fy>-.5&&!(skip&&skip(foot))&&!(skip&&skip([p[0],p[1]-1.4,(p[2]+foot[2])/2])))beam('vWood',edge,foot,.12,.12,c);
   beam('vWood',[p[0],p[1]-.08,p[2]+w/2-.1],[p[0],p[1]-.08,zf(p[0],p[1])-.4],.1,.1,c);}}}
function buildHlTriCliffVillage(G,o){reseed(23101+(o.v|0));const X0=-40,X1=40,TOP=42,ZC=-9;
 vnReg('Cliff settlement (tribal)',0,-2,40,TOP+6);
 const zf=hnTRRock(G,X0-4,X1+4,-1,TOP,ZC,3.7,4.5);
 // the houses: [key, x, floor y] — staggered like brickwork so no house hangs over another's roof; the pair
 // (6, 7) shares one platform
 const H=[['hl_tri_small_a',-34,5],['hl_tri_large_b',-12,4],['hl_tri_small_b',7,6],['hl_tri_large_a',28,4],
  ['hl_tri_small_c',-24,15],['hl_tri_small_a',-1,15],['hl_tri_small_a',5.5,15],['hl_tri_small_b',22,16],
  ['hl_tri_large_a',-14,25],['hl_tri_small_a',14,27],['hl_tri_small_c',30,26],['hl_tri_small_b',-33,31]];
 const houses=[];const gapR=.9;
 for(const [key,x,y] of H){const F=HN_TR_FOOT[key];let zr=-99;for(let xx=x-F.W/2;xx<=x+F.W/2+.01;xx+=F.W/4)for(const yy of[y-5,y-2.5,y,y+3,y+F.H*.8])zr=Math.max(zr,zf(xx,yy));
  houses.push({key,x,y,W:F.W,D:F.D,H:F.H,zb:zr+gapR,zc:zr+gapR+F.D/2,zfr:zr+gapR+F.D/2+F.front});}
 const p1=houses[5],p2=houses[6];const pz=Math.max(p1.zc,p2.zc);for(const h of[p1,p2]){h.zc=pz;h.zb=pz-h.D/2;h.zfr=pz+HN_TR_FOOT[h.key].front;}
 houses.forEach((h,i)=>hnSub(h.key,h.x,h.y,h.zc,0,{cliff:true,gap:Math.max(.4,h.zb-zf(h.x,h.y-1))+.2,v:i}));
 const c=hC(vPick(HPAL.aged));
 vB('vWood',(p1.x+p2.x)/2,p1.y-.2,pz+1.2,1.4,.2,4.4,0,c);                                          // the shared platform
 const inHouse=(p)=>houses.some(h=>Math.abs(p[0]-h.x)<h.W/2+.2&&p[1]>h.y-4.5&&p[1]<h.y+h.H&&p[2]>h.zb-1.8&&p[2]<h.zfr+.2);
 // a walk z at (x,y): clear of the rock, and in front of any house (deck, or the struts under it) at that height
 const WW=1.5;const walkZ=(x,y)=>{let z=Math.max(zf(x,y),zf(x,y+1.4),zf(x,y-1))+WW/2+.25;
  for(const h of houses)if(Math.abs(x-h.x)<h.W/2+WW&&y>h.y-6.5&&y<h.y+h.H)z=Math.max(z,h.zfr+WW/2-.15);return z;};
 // route: control points [x, y, dz] (dz pushes a switchback's second flight out past the first); climbing
 // segments are laid out with at least 1.25 m of run per metre of rise
 const route=(ctl)=>{const P=[];for(let i=0;i+1<ctl.length;i++){const [x0,y0,d0]=ctl[i],[x1,y1,d1]=ctl[i+1];const n=Math.max(1,Math.ceil(Math.abs(x1-x0)/2.6));
   for(let k=0;k<(i+2===ctl.length?n+1:n);k++){const t=k/n;const x=lerp(x0,x1,t),y=lerp(y0,y1,t);P.push([x,y,walkZ(x,y)+lerp(d0||0,d1||0,t)]);}}
  for(let i=0;i+1<P.length;i++)if(Math.abs(P[i+1][1]-P[i][1])>.25){const z=Math.max(P[i][2],P[i+1][2]);P[i][2]=P[i+1][2]=z;}
  hnTRWalk(P,WW,zf,c,inHouse);WALKS.push(P.filter((q,i)=>i+1<P.length&&Math.abs(P[i+1][1]-q[1])<.25));return P;};const WALKS=[];
 const L=(h,dx,dz)=>[h.x+(dx||0),h.y,dz||0];const O=WW+.1;
 const [A1,A2,A3,A4,B1,B2a,B2b,B3,C1,C2,C3,D1]=houses;
 // tier A, up from the valley floor and along
 route([[-44,0],[-37.5,5],L(A1,0),L(A1,3.5),[-24,4],L(A2,-9.5),L(A2,9.5),[0,4],[3,6],L(A3,0),L(A3,4),[15,4],L(A4,-7),L(A4,-2)]);
 // A -> B: long flights across the face, alternating direction (the zig-zag), switchbacks where the gap is tight
 route([L(A2,-10),[-33.5,14],[-32,15],L(B1,0)]);
 route([L(A3,-4),[-7,14],[-5.5,15],L(B2a,0),L(B2b,0),L(B2b,3.4)]);
 route([L(A4,-7),[13,10.5],[13,10.5,O],[19,15.5,O],[20.5,16,O],L(B3,0,O)]);
 // B -> C
 route([L(B2b,3.6),[16,20.5],[16,20.5,O],[9.5,26,O],[10.5,27,O],L(C2,0,O),L(C2,3.6),[23,27],[26,26],L(C3,0)]);
 route([L(B1,3.5),[-13,21],[-6.5,25],L(C1,4)]);
 // C -> the top: the high hut, the shrine, the lookout
 route([L(C1,-6.5),[-28,31],L(D1,0)]);
 const SH=[-3,35],LK=[22,36.5];
 route([L(C2,-3.6),[3.5,32.5],[.5,35],[SH[0]+1.6,SH[1]]]);
 route([L(C3,-3.5),[20,31],[20,31,O],[26,36.5,O],[LK[0]+3.2,LK[1],O]]);
 // ladders: from the valley floor up to the first walk
 vnLadder(-2,0,walkZ(-2,4)+1.4,0,4.3,c);vnLadder(16,0,walkZ(16,4)+1.3,0,4.3,c);
 // the cliff-hung shrine: a painted spirit house on a bracketed platform, masks and a thunderbird crest
 {const [x,y]=SH;const z=Math.max(zf(x,y),zf(x,y+3),zf(x-2,y),zf(x+2,y))+2.2;const blk=hC(HPAL.black);
  kput('hLogX',[x,y-.3,z-1],qEuler(0,Math.PI/2,0),[5,.2,.2],c);for(const s of[-1,1])beam('vWood',[x+s*1.4,y-.4,z+1.4],[x+s*1.4,y-4,zf(x,y-4)-.3],.15,.15,c);
  hlRngSkip(5);FURNISH('hl_tri_spirit_house',x,y-.2,z-.15,0);}   // the shrine on its deck (it drew 5 numbers): furniture from the catalog
 // the warrior lookout on the top ledge: a palisaded platform, a war totem, a horned shelter, a brazier
 {const [x,y]=LK;const z=Math.max(zf(x,y),zf(x-3,y),zf(x+3,y),zf(x,y+2))+2.8;
  for(const s of[-1,1])beam('vWood',[x+s*2.4,y-.4,z+2.2],[x+s*2.4,y-5,zf(x,y-5)-.3],.18,.18,c);
  kput('hLogX',[x,y-.35,z-1],qEuler(0,Math.PI/2,0),[7,.22,.22],c);vB('vWood',x,y-.2,z,6,.2,5,0,c);
  for(let k=0;k<=14;k++){const u=-3+6*k/14;if(u>1.6)continue;vPst('vPostB',x+u,y-.2,z+2.5,.13,1.5+rr(-.1,.2),c);}
  for(let k=0;k<=8;k++)vPst('vPostB',x-3,y-.2,z-2.5+5*k/8,.13,1.4,c);
  hnTotem(x+1.8,y,z-1.2,.28,6.5,0,{wings:1.8,painted:true});
  for(const s of[-1,1])for(const t of[-1,1])vPst('vPost',x-.8+s*1.3,y,z-.6+t*1.1,.08,2.4,c);vnGableRoof(x-.8,y+2.4,z-.6,3,2.6,1.4,0,'vGableT',hC(vPick(VPAL.thatch)),.3);
  hnTRHorns(x-.8,y+3.9,z+.8,0,.9);hnTRBrazier(x-2.2,y,z+1.6,.8);}
 // shrubs and grass tufts on the ledges of the rock
 for(let k=0;k<45;k++){const x=rr(X0,X1),y=rr(1,TOP-1);if(inHouse([x,y,zf(x,y)+1]))continue;const z=Math.min(zf(x-.6,y),zf(x+.6,y),zf(x,y-.4),zf(x,y+.4));kput('vLeaf',[x,y,z],qEuler(0,rng()*3,0),[rr(.5,1.1),rr(.4,.7),rr(.3,.5)],hC(vPick([0x4a6a34,0x5a7a3a,0x6a7a44,0x7a7a4a])));}
 // people on the walks
 for(const P of WALKS)for(let k=0;k<2;k++){const p=P[(rng()*P.length)|0];kput('figB',[p[0]+rr(-.4,.4),p[1],p[2]+rr(-.3,.3)],qEuler(0,rng()*TAU,0),1,hC(vPick([0xe8d9b8,0xc9442a,0x2f8f8a,0xe0a030,0x8a6a3a])));kput('figH',[p[0],p[1],p[2]],null,1,hC(0xc9a17e));}
 // gourds and fire-cages along the walks, folk at the foot
 for(let k=0;k<houses.length;k++){const h=houses[k];for(const s of[-1,1])(k%2?hnTRGourd:hnTRCage)(h.x+s*(h.W/2+.4),h.y+2.4,h.zfr+.5);}
 for(let k=0;k<7;k++)vnFolk(rr(-30,30),ZC+14+rr(0,5),1,1);}

HL.def({key:'hl_tri_small_a',name:'Painted hut',branch:'tribal',family:'Dwellings',tags:{type:['single-family dwelling'],wealth:'poor',lit:false},w:9,d:10,h:8,build:buildHlTriSmallA});
HL.def({key:'hl_tri_small_b',name:'Round bamboo hut',branch:'tribal',family:'Dwellings',tags:{type:['single-family dwelling'],wealth:'poor',lit:false},w:9,d:11,h:9,build:buildHlTriSmallB});
HL.def({key:'hl_tri_small_c',name:'Painted earth-lodge',branch:'tribal',family:'Dwellings',tags:{type:['single-family dwelling'],wealth:'poor',lit:false},w:11,d:11,h:7,build:buildHlTriSmallC});
HL.def({key:'hl_tri_large_a',name:'Great plank-house',branch:'tribal',family:'Dwellings',tags:{type:['multi-family dwelling'],wealth:'middle',lit:false},w:18,d:20,h:15,build:buildHlTriLargeA});
HL.def({key:'hl_tri_large_b',name:'Long-dwelling on stilts',branch:'tribal',family:'Dwellings',tags:{type:['multi-family dwelling'],wealth:'middle',lit:false},w:23,d:17,h:9,build:buildHlTriLargeB});
