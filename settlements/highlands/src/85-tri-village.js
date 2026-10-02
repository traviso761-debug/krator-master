// ================================================================= HIGHLANDS / TRIBAL — halls, sacred sites, farms, crafts
// The communal buildings of the Painted Men: the village longhouse (after the Skarðavik sketch: a great arched
// roof on crossing ribs, flared horn-wings, a broad stair to a raised door, a cupola), the warrior's hall in its
// palisade, the shaman's house under a painted cone, the stone circle; and the farms and the scrap smithy that
// feed and arm them. Raw logs, bamboo, thatch and turf, fire only (no electric light). Seeds 23200–23499.

// ---------------------------------------------------------------- the arched vault (longhouse roofs)
// A shell roof over a hall whose long axis is local x: s (-1..1) runs along the ridge, t (-1..1) across it.
// Its cross-section is a tall arch that flattens toward the eaves and then curls up (F); the eaves run out
// further than the ridge (Cx) and lift at the corners into horns (Hc); B raises the front eave over a centred
// entrance into a tall arched brow. V = {x0,z0,X,Cx,Z,yE,A,F,Hc,B,Bs, mat, c (rib colour), trans:[s…], diag:[c…],
// legs, nu, nv}. Returns {P(s,t), y(x,z)} for fitting walls, lenses and posts under it.
function hnTRVault(G,V){
 const Y=(s,t)=>V.yE+V.A*Math.pow(Math.max(0,1-t*t),1.3)+V.F*Math.pow(Math.max(0,(Math.abs(t)-.8)/.2),2)
  +V.Hc*Math.pow(Math.max(0,(Math.abs(s)-.72)/.28),2)*(.35+.65*t*t)+(V.B||0)*Math.exp(-Math.pow(s/(V.Bs||.3),2))*Math.pow(Math.max(0,t),1.5);
 const P=(s,t)=>[V.x0+s*(V.X+V.Cx*t*t),Y(s,t),V.z0+t*V.Z];
 const N=(s,t)=>{const e=.01;const a=P(s+e,t),b=P(s-e,t),c=P(s,t+e),d=P(s,t-e);const ds=[a[0]-b[0],a[1]-b[1],a[2]-b[2]],dt=[c[0]-d[0],c[1]-d[1],c[2]-d[2]];return hNorm(hCross(dt,ds));};
 const yAt=(x,z)=>{const t=clamp((z-V.z0)/V.Z,-1,1);return Y((x-V.x0)/(V.X+V.Cx*t*t),t);};
 const m=mesh(gridSurface((u,v)=>P(u*2-1,v*2-1),V.nu||48,V.nv||32,{uS:(2*V.X+V.Cx)/2,vS:V.Z*1.5}),V.mat,G);
 const c=V.c||hC(vPick(HPAL.tar));const off=(s,t,k)=>{const p=P(s,t),n=N(s,t);return[p[0]+n[0]*k,p[1]+n[1]*k,p[2]+n[2]*k];};
 const chain=(fn,n,w,k,cc)=>{let a=fn(0);for(let i=1;i<=n;i++){const b=fn(i/n);beam('vWood',a,b,w,w,cc||c);a=b;}};
 // eave and end fascias give the shell its thickness
 for(const t of[-1,1])chain(q=>off(q*2-1,t,-.1),24,.34,0);for(const s of[-1,1])chain(q=>off(s,q*2-1,-.1),16,.34,0);
 // transverse ribs over the shell, running on down to the ground as curved legs on carved stone feet
 for(const s of V.trans||[]){chain(q=>off(s,q*2-1,.28),18,.42,0);
  if(V.legs)for(const t of[-1,1]){const E=off(s,t,.28);const F=[E[0],.9,V.z0+t*(V.Z+2.3)],C=[E[0],E[1]*.55+.4,V.z0+t*(V.Z+2.2)];
   chain(q=>[(1-q)*(1-q)*E[0]+2*(1-q)*q*C[0]+q*q*F[0],(1-q)*(1-q)*E[1]+2*(1-q)*q*C[1]+q*q*F[1],(1-q)*(1-q)*E[2]+2*(1-q)*q*C[2]+q*q*F[2]],7,.42,0);
   vB('hRubB',F[0],0,F[2],1.1,1,1.1,0,hC(vPick(HPAL.rubble)));hnForm('hFormV',F[0],.08,F[2]+t*.55,t>0?0:Math.PI,.55,.84);}}
 // diagonal ribs crossing between them (the lattice of the sketch)
 for(const c0 of V.diag||[])for(const d of[-1,1])chain(q=>{const t=q*2-1;return off(c0+d*.42*t,t,.24);},18,.3,0);
 return{P,y:yAt,mesh:m};}
function hnTRRoofMat(item,c){const m=(item==='thatch'?MAT.thatch:item==='wood'?MAT.wood:MAT.shingle).clone();m.color=c;return m;}

// ---------------------------------------------------------------- HALLS
// Village longhouse — the branch showpiece. A log hall of two storeys on a fieldstone platform under a great
// arched shingle vault; transverse ribs run down to carved feet, diagonal ribs cross over the shell, the front
// eave lifts into an arched brow over the entrance, a broad stair climbs to it between braziers and winged
// totems; the gable ends are painted crest-lenses; a lantern cupola with green banners crowns the ridge; two
// lower wing-halls under their own flared vaults sweep out at the ends.
function buildHlTriLonghouse(G,o){reseed(23201+(o.v|0));const P=3.2,Xw=12,Zw=8.5,Z=12,run=16*.32;
 const tar=hC(vPick(HPAL.tar)).multiplyScalar(1.35),rib=hC(vPick(HPAL.redwood)).multiplyScalar(1.1),roofC=hC(0xa06a44),blk=hC(HPAL.black),ash=hC(vPick(HPAL.rubble));
 vnReg('Village longhouse',0,1,20,24);
 hnSocle(0,0,0,2*(Xw+3.6),P,2*Z,0,ash,hC(vPick(HPAL.ashlar)));
 const V=hnTRVault(G,{x0:0,z0:0,X:14,Cx:4,Z,yE:P+2.9,A:11.5,F:1.4,Hc:3,B:4.5,Bs:.28,mat:hnTRRoofMat('shingle',roofC),c:rib,
  trans:[-1,-.66,-.36,.36,.66,1],diag:[-.52,.52],legs:true,nu:64,nv:40});
 // the hall: log walls up to the vault's springing line, a frieze under it
 let wt=99;for(let x=-Xw;x<=Xw;x+=1)wt=Math.min(wt,V.y(x,Zw+.2),V.y(x,-Zw-.2));wt-=.15;
 hnLogBox(0,P,0,2*Xw,wt-P,2*Zw,0,tar);
 for(const s of[-1,1])hnFrieze(0,wt-.55,s*(Zw+.06),s>0?0:Math.PI,2*Xw,.5);
 for(const s of[-1,1])for(const u of[-10,-6.5,6.5,10,-3,3]){const f=u*u<10;const zz=s*Zw;if(s>0&&f)continue;
  vnWin(u,P+1.2,zz,s>0?0:Math.PI,1,1.5,'shut','hPaint',hC(HPAL.red));vnWin(u,P+4.6,zz,s>0?0:Math.PI,.9,1.2,'open','hPaint',blk);}
 for(const u of[-8.25,8.25,-4.75,4.75])hnForm('hFormA',u,P+2.95,Zw+.02,0,2.4,1.2);
 // painted lenses: the front brow over the door and both gable ends
 const lw=7.5;let lt=0;for(let x=-lw;x<=lw;x+=.5)lt=Math.max(lt,V.y(x,Zw+.3)-wt);
 hnTRGrid(G,(u,v)=>{const x=(u*2-1)*lw;const top=Math.max(wt+.02,V.y(x,Zw+.3)-.12);const y=lerp(wt-.05,top,v);return[x,y,Zw+.1,u,(y-wt+.05)/lt];},30,8,MAT.trFront);
 for(const s of[-1,1]){let gt=0;for(let z=-Zw;z<=Zw;z+=.5)gt=Math.max(gt,V.y(s*Xw,z)-wt);
  hnTRGrid(G,(u,v)=>{const z=(u*2-1)*Zw;const top=Math.max(wt+.02,V.y(s*Xw,z)-.12);const y=lerp(wt-.05,top,v);return[s*(Xw+.1),y,z*-s,u,(y-wt+.05)/gt];},30,8,MAT.formA);
  vnDoor(s*Xw,P,0,s*Math.PI/2,1.6,2.6,'hPaint',blk,tar,false);hnForm('hFormA',s*(Xw+.02),P+3,0,s*Math.PI/2,5,2.5);}
 // the entrance: great doors between tall totem posts, a crest lintel
 vB('vDarkB',0,P,Zw+.02,3.2,4.4,.1,0);for(const s of[-1,1])kput('vWood',[s*1.95,P+2.2,Zw+.7],qEuler(0,s*.5,0),[1.5,4.3,.14],tar);
 for(const s of[-1,1]){hnTotemPole(s*2.3,P,Zw+.35,.36,5.2,0,true);hnForm('hFormV',s*3.2,P+.1,Zw+.02,0,.8,4.4);}
 hnForm('hFormA',0,P+4.6,Zw+.04,0,4.6,2.1);
 // the gallery under the eaves: totem posts carrying the shell, a carved rail along the platform edge
 const gz=Z-1.3;for(const s of[-1,1])for(let x=-14;x<=14.01;x+=4){if(s>0&&Math.abs(x)<4.5)continue;const h=V.y(x,s*gz)-P-.1;hnTotemPost(x,P,s*gz,.3,h,s>0?0:Math.PI,Math.abs(x)%8<1);}
 for(const s of[-1,1]){const zr=s*(Z-.35);const segs=s>0?[[-15.4,-4.3],[4.3,15.4]]:[[-15.4,15.4]];for(const [a,b] of segs)hnDeckRail([a,P+.05,zr],[b,P+.05,zr],P+.05,tar,1);}
 for(const s of[-1,1])hnDeckRail([s*15.4,P+.05,-Z+.4],[s*15.4,P+.05,Z-.4],P+.05,tar,1);
 // the broad stair: solid stone steps, parapets ending in carved newels, braziers, winged totems
 for(let k=0;k<16;k++)vB('vStone',0,0,Z+run-(k+.5)*.32,8,P*(k+1)/16,.34,0,hC(vPick(HPAL.ashlar)));
 for(const s of[-1,1]){hnMember('hRubB',[s*4.3,P+.5,Z],[s*4.3,.5,Z+run],1.1,.6,[1,0,0],ash);vB('hRubB',s*4.3,0,Z+run/2,.6,.4,run,0,ash);
  hnTotemPost(s*4.3,.05,Z+run+.25,.3,2.6,0,true);hnTRBrazier(s*5.6,0,Z+run+.8,1.1);hnTRBrazier(s*4.9,P,Z-.8,.9);
  hnTotem(s*8.6,0,Z+run+1.4,.45,9,0,{wings:2.4,painted:true});for(const t of[-1,1])hnTRBrazier(s*14.8,P,t*(Z-1),.8);}
 // the cupola: a log drum with windows, a gallery, a shingle helm, the thunderbird, green banners
 const yc=V.y(0,0);kput('hOctL',[0,yc-1.2,0],null,[2.6,3.4,2.6],tar);for(let k=0;k<8;k++){const a=k/8*TAU;vnWin(Math.sin(a)*2.42,yc+.5,Math.cos(a)*2.42,a,.7,1.1,'open','hPaint',blk);}
 vPst('hTRDisc',0,yc+2.2,0,3.4,.22,rib);for(let k=0;k<20;k++){const a=k/20*TAU;vPst('vPost',Math.sin(a)*3.25,yc+2.4,Math.cos(a)*3.25,.05,.9,tar);}
 for(let k=0;k<20;k++){const a=k/20*TAU,b=(k+1)/20*TAU;beam('vWood',[Math.sin(a)*3.25,yc+3.3,Math.cos(a)*3.25],[Math.sin(b)*3.25,yc+3.3,Math.cos(b)*3.25],.09,.09,tar);}
 kput('hOctW',[0,yc+2.4,0],null,[2,1.5,2],rib);kput('hBulbSh',[0,yc+3.8,0],null,[2.3,2.5,2.3],roofC.clone().multiplyScalar(.85));
 vPst('vPost',0,yc+5.9,0,.08,1.6,tar);kput('hPaintBall',[0,yc+7.5,0],null,[.3,.36,.3],blk);for(const s of[-1,1])kput('hWing',[s*.9,yc+7.6,0],qEuler(0,0,s*-.15),[s*1.8,.9,1],null);
 kput('vConeI',[0,yc+7.5,.3],vQ(0,Math.PI/2,0),[.09,.4,.09],hC(HPAL.red));
 for(let k=0;k<4;k++){const a=k/4*TAU+Math.PI/4;kput('vCloth',[Math.sin(a)*3.45,yc+.8,Math.cos(a)*3.45],qEuler(0,a,0),[1,2.8,1],hC(0x4a7a3a));}
 // the wing-halls
 for(const s of[-1,1]){const x0=s*22.5;vB('hRubB',x0,0,0,12,.5,10,0,ash);
  const W2=hnTRVault(G,{x0,z0:0,X:6.5,Cx:2.5,Z:6.5,yE:3,A:5.4,F:.8,Hc:2.2,mat:hnTRRoofMat('shingle',roofC.clone().multiplyScalar(.92)),c:rib,trans:[-1,0,1],diag:[],legs:true,nu:36,nv:24});
  let w2=99;for(let x=-5.5;x<=5.5;x+=1)w2=Math.min(w2,W2.y(x0+x,4.7),W2.y(x0+x,-4.7));w2-=.12;
  hnLogBox(x0,.5,0,11,w2-.5,9,0,tar);hnFrieze(x0,w2-.5,4.56,0,11,.45);
  vnDoor(x0,.5,4.5,0,1.2,2.2,'hPaint',blk,tar,false);for(const u of[-3.5,3.5])vnWin(x0+u,1.5,4.5,0,.9,1.1,'shut','hPaint',hC(HPAL.red));
  let gt=0;for(let z=-4.5;z<=4.5;z+=.5)gt=Math.max(gt,W2.y(x0+s*5.5,z)-w2);
  hnTRGrid(G,(u,v)=>{const z=(u*2-1)*4.5;const top=Math.max(w2+.02,W2.y(x0+s*5.5,z)-.1);const y=lerp(w2-.05,top,v);return[x0+s*5.6,y,z*-s,u,(y-w2+.05)/gt];},20,6,MAT.formA);
  hnForm('hFormW',x0+s*5.58,1.1,0,s*Math.PI/2,5,2.5);hnTRBrazier(x0,0,7.2,.8);}
 vnFolk(0,Z+run+4,4,4);hnTRFolk(-9,P,Z-2.5,2,1.5);hnTRFolk(9,P,Z-2.5,2,1.5);}

// Warrior's hall — a long log hall inside a palisade: turf gable with thunderbirds and trophy horns, both
// gable-ends painted, a cross-gabled porch on totem posts, round shields racked along the front, war totems at
// the gate and the corners, a sanded sparring ring with spear racks, a trophy pole.
function buildHlTriWarriorHall(G,o){reseed(23211+(o.v|0));const W=24,D=10,F=.5,H=3.4,hz=-9,PW=36,PD=34;
 const tar=hC(vPick(HPAL.tar)).multiplyScalar(1.25),aged=hC(vPick(HPAL.aged)),turf=hC(vPick(HPAL.turf)),blk=hC(HPAL.black),red=hC(HPAL.red);
 vnReg("Warrior's hall",0,hz,13,F+H+8);vnReg("Warrior's hall — yard",0,5,12,3);
 vnPalisade(0,0,0,PW,PD,0,3.6,7);
 for(const s of[-1,1]){vPst('vPostB',s*3.6,0,PD/2,.3,4.6,tar);hnTotem(s*5,0,PD/2+.8,.42,8.5,0,{wings:2.2,painted:true});}
 kput('hLogX',[0,4.4,PD/2],null,[8,.24,.24],tar);hnTRHorns(0,4.75,PD/2+.2,0,1.3);for(const s of[-1,1])hnTRHorns(s*1.8,4.6,PD/2+.2,0,.7);
 // the hall
 vB('hRubB',0,0,hz,W+.4,F,D+.4,0,hC(vPick(HPAL.rubble)));hnLogBox(0,F,hz,W,H,D,0,tar);
 const pitch=1.25,rise=pitch*D/2;hnGable(0,F+H,hz,W,D,pitch,0,'hGableTurf',turf,.8,'hGableLog',tar);hnBarge(0,F+H,hz,W,D,rise,0,.8,blk,'bird');
 for(const s of[-1,1]){hnTRPent(G,s*(W/2+.06),F,hz,s*Math.PI/2,D,H,rise-.05,MAT.trFront);hnTRHorns(s*(W/2+.5),F+H+rise-1.2,hz,s*Math.PI/2,1.4);
  vnDoor(s*(W/2+.1),F,hz+2.6,s*Math.PI/2,.9,1.9,'hPaint',blk,tar,false);}
 for(const u of[-6,6]){vB('vWood',u,F+H+rise-.3,hz,1.4,.8,1.4,0,aged);vnGableRoof(u,F+H+rise+.5,hz,1.8,1.8,.5,0,'vWood',aged,.1);}   // smoke louvres
 const fz=hz+D/2;
 for(const u of[-9.5,-5.2,5.2,9.5])hnForm('hFormA',u,F+2.1,fz+.02,0,2.6,1.3);
 // shields racked along the front, spears leaning
 for(const s of[-1,1]){hlRngSkip(7);FURNISH('hl_tri_shield_rail',s*6.1,F,fz+.34,0,{v:1});FURNISH('hl_tri_shield_rail',s*10.7,F,fz+.34,0,{v:0});}   // 5 + 3 shields, 1.15 m apart
 for(let k=0;k<6;k++){const x=rr(-11,11);if(Math.abs(x)<3)continue;kput('vPost',[x,0,fz+.55],qEuler(-.2,0,rr(-.1,.1)),[.03,2.8,.03],aged);}
 // the porch: a cross gable on four painted totem posts, horns on its gable
 for(const sx of[-1,1])for(const z of[fz+.4,fz+3.4])hnTotemPost(sx*1.9,F,z,.22,2.9,0,true);
 vB('vWood',0,F-.18,fz+1.9,4.4,.18,3.6,0,aged);vnStairs(0,0,fz+4.1,0,2.4,F,2,'vWood',aged);
 hnGable(0,F+3,fz+1.9,4.4,4.6,1.2,Math.PI/2,'hGableTurf',turf,.4,'hGablePaint',red);hnForm('hFormT',0,F+3.2,fz+4.13,0,2.8,1.4);hnTRHorns(0,F+3+2.9,fz+4.3,0,1);
 vnDoor(0,F,fz+.02,0,1.5,2.3,'hPaint',blk,tar,false);hnForm('hFormA',0,F+2.5,fz+.04,0,2.4,.8);
 // war totems at the hall corners
 for(const s of[-1,1])hnTotem(s*(W/2+1.6),0,fz+1.4,.34,6.5,0,{wings:1.6});
 // the sparring ring, weapon racks, trophy pole, braziers
 const rz=6.5,R=5.4;vPst('hTRDisc',0,-.02,rz,R,.06,hC(0xc8b088));
 for(let k=0;k<24;k++){const a=k/24*TAU,b=(k+1)/24*TAU;vPst('vPostB',Math.sin(a)*R,0,rz+Math.cos(a)*R,.12,.75,aged);beam('hBambooC',[Math.sin(a)*R,.68,rz+Math.cos(a)*R],[Math.sin(b)*R,.68,rz+Math.cos(b)*R],.05,.05,hC(0xa89070));}
 vnFolk(0,rz,2,1.2);vnFolk(0,rz+6.5,4,5);
 for(const s of[-1,1])hnFurn('hl_tri_spear_rack',s*9.5,0,rz,s*Math.PI/2,{},0,.11);   // the spears lean toward the ring
 FURNISH('hl_tri_trophy_pole',-13,0,9,0);
 for(const s of[-1,1]){hnTRBrazier(s*3.4,0,fz+4.6,.9);hnTRBrazier(s*4,0,PD/2-2,.9);}
 hnWoodpile(PW/2-1.5,0,-8,Math.PI/2,6,1.6);hnFirepit(12,0,6,.7);}

// Shaman's house — an octagonal log house under a tall painted cone with a smoke hole and poles through it;
// spirit masks on every face; a ring of spirit poles with masks, horns and ribbons; herbs drying on a rack;
// a fire with a tripod pot at the door.
function buildHlTriShaman(G,o){reseed(23221+(o.v|0));const R=4.2,S=.45,H=2.5,ap=R*Math.cos(Math.PI/8);
 const tar=hC(vPick(HPAL.tar)).multiplyScalar(1.3),aged=hC(vPick(HPAL.aged)),blk=hC(HPAL.black);
 vnReg("Shaman's house",0,0,6,12.6);
 kput('hOctS',[0,0,0],null,[R+.35,S,R+.35],hC(vPick(HPAL.rubble)));kput('hOctL',[0,S,0],null,[R,H,R],tar);
 kput('hTRConeP',[0,S+H-.15,0],null,[R+1.35,8.6,R+1.35],null);                                            // the painted cone
 const top=S+H-.15+8.6;for(let k=0;k<6;k++){const a=k/6*TAU+.3;beam('vWood',[Math.sin(a)*.12,top-1.5,Math.cos(a)*.12],[Math.sin(a)*.75,top+1.4,Math.cos(a)*.75],.1,.1,aged);}
 for(let k=0;k<3;k++){const a=k/3*TAU;vPst('vPost',Math.sin(a)*.3,top-.2,Math.cos(a)*.3,.03,.55,aged);}kput('vConeT',[0,top+.3,0],null,[.75,.55,.75],hC(vPick(VPAL.thatch)));
 kput('hTRBandCyl',[0,S+H-.55,0],qEuler(0,Math.PI/8,0),[ap+.02,.4,ap+.02],null);
 for(let k=1;k<8;k++){const a=k/8*TAU;hnForm('hFormV',Math.sin(a)*(ap+.02),S+.35,Math.cos(a)*(ap+.02),a,.62,1.9);}
 vnDoor(0,S,ap+.02,0,1,1.9,'hPaint',blk,hC(0x6a4a30),false);hnForm('hFormA',0,S+2,ap+.06,0,1.8,.5);hnTRHorns(0,S+2.55,ap+.12,0,.55);
 for(const s of[-1,1])hnTotemPole(s*1.05,0,ap+.6,.15,2.7,0,true);
 vB('vStone',0,0,ap+.9,1.6,S,1,0,hC(vPick(HPAL.rubble)));
 // spirit poles round the house
 for(let k=0;k<9;k++){const a=(k+.5)/9*TAU*(10/11)+TAU/22+Math.PI*.09;const x=Math.sin(a)*8.2,z=Math.cos(a)*8.2;if(z>6)continue;hlRngSkip(2);   // its height and its ribbon drew 2 numbers
  hnFurn('hl_tri_totem',x,0,z,a,{v:3},0,.07);}
 // herbs drying, the fire and pot, cairns
 hlRngSkip(9);FURNISH('hl_tri_herb_rack',-6,0,4.5,0);
 for(let k=0;k<5;k++){const a=-.9+k*.45;vPst('vRope',Math.sin(a)*(R+.9),S+H-.4,Math.cos(a)*(R+.9),.01,.3,hC(0x9a8a6a));kput('vLeaf',[Math.sin(a)*(R+.9),S+H-.6,Math.cos(a)*(R+.9)],null,[.1,.26,.1],hC(vPick([0x6a7a3a,0x8a7a44])));}
 hlRngSkip(9);FURNISH('hl_tri_firepit',2.2,0,ap+3.2,0,{v:2});   // with the tripod and the pot
 for(const [x,z] of[[6.5,5],[-7,-3],[4,-7]])for(let k=0;k<4;k++)kput('vRock',[x+rr(-.3,.3),.2+k*.25,z+rr(-.3,.3)],qEuler(rng(),rng(),0),[.35-k*.06,.2,.3-k*.05],hC(vPick(HPAL.rubble)));
 vnFolk(0,ap+4.5,2,1.5);}

// ---------------------------------------------------------------- SACRED
// Stone circle — a ring of standing stones, several carved with crest faces, round a table altar and a
// firepit; a gap at the front flanked by two painted winged totems and an avenue of low stones leading in.
function buildHlTriStoneCircle(G,o){reseed(23231+(o.v|0));const R=9;
 vnReg('Stone circle',0,0,R+1.5,6.5);
 vPst('hTRDisc',0,-.03,0,R+1.6,.06,hC(0x8a7a5c));
 let k=0;for(let a=.62;a<TAU-.6;a+=(TAU-1.24)/12){const x=Math.sin(a)*R,z=Math.cos(a)*R;hnMenhir(x,0,z,a+Math.PI,rr(2.5,3.7),hC(vPick(HPAL.rubble)).multiplyScalar(rr(.75,1)),k%3===1);k++;}
 for(const s of[-1,1]){hnTotem(s*4.6,0,R*.9,.36,6.4,0,{wings:1.9,painted:true});for(let j=0;j<3;j++)hnMenhir(s*2.4,0,R+2+j*2,s*Math.PI/2,rr(1,1.4),null,false);}
 hlRngSkip(3);FURNISH('hl_tri_stone_altar',0,0,-1,0);   // the table altar, its crest board, horns and gourds
 hnFirepit(0,0,2.4,.8);hnTRBrazier(-2.8,0,-3,.8);hnTRBrazier(2.8,0,-3,.8);vnFolk(0,4.5,3,3);}

// ---------------------------------------------------------------- FARMS AND CRAFTS
// Farmhouse — a log dwelling with a painted front and a thatch gable, a bamboo byre under a lean-to at its side
// with a cow and goats in it, a fenced kitchen plot, hay, a woodpile.
function buildHlTriFarmhouse(G,o){reseed(23241+(o.v|0));const W=8,D=6,F=.4,H=2.5;
 const log=hC(vPick(HPAL.aged)),th=hC(vPick(VPAL.thatch)),bam=hC(vPick(HPAL.bamboo)),blk=hC(HPAL.black);
 vnReg('Farmhouse (tribal)',-1,0,6,F+H+5);vnReg('Farmhouse — byre',W/2+2.3,0,3,3);
 vB('hRubB',0,0,0,W+.3,F,D+.3,0,hC(vPick(HPAL.rubble)));hnLogBox(0,F,0,W,H,D,0,log);
 hnGable(0,F+H,0,W,D,1.15,0,'vGableT',th,.8,'hGableBM',bam);hnBarge(0,F+H,0,W,D,1.15*D/2,0,.8,blk,'bird');
 hnForm('hFormW',-1.2,F+.3,D/2+.06,0,4.4,2);vnDoor(2.2,F,D/2+.02,0,.95,1.85,'vWood',log,hC(0x5a4a3a),false);
 vnWin(-W/2,F+1,0,-Math.PI/2,.6,.6,'shut','vWood',log);vB('vStone',2.2,0,D/2+.5,1.4,.2,.8,0,hC(vPick(HPAL.rubble)));
 hnTotem(3.6,0,D/2+1.2,.26,4.4,0,{wings:1.1,painted:true});
 // the byre: bamboo frame, mat walls at the back and end, a thatch lean-to, a rail at the front
 const bx=W/2+2.3,BW=4.4;for(const s of[-1,1])for(const z of[-D/2+.2,D/2-.2])vPst('hBamboo',bx+s*(BW/2-.1),0,z,.09,s>0?2:2.6,bam);
 vB('hBMatB',bx,0,-D/2+.15,BW,1.9,.08,0,bam);vB('hBMatB',bx+BW/2-.1,0,0,.08,1.9,D-.4,0,bam);
 vnShedRoof(bx,1.95,0,D-.2,BW+.2,.55,Math.PI/2,'vThatchB',th,.35,.2);
 hnBambooRail([bx-BW/2+.2,0,D/2-.2],[bx+BW/2-.2,0,D/2-.2],bam,1.1);
 hnTRBeast(bx-.4,0,-.6,Math.PI/2,'cow');hnTRBeast(bx+.8,0,1.6,-.3,'goat');hnTRBeast(bx+1.2,0,-1.9,2.6,'goat');
 FURNISH('hl_tri_haycock',bx+1.2,0,.4,0,{v:0});
 // kitchen plot, woodpile, rack, fire
 const gx=-W/2-3.6;vnFence(gx,0,0,5,6,0,bam,1.2,1);for(let r=0;r<5;r++)for(let k=0;k<6;k++)vBall('vLeaf',gx-1.6+r*.8,.12,-2+k*.8,rr(.18,.26),hC(vPick([0x4f7a34,0x5f8a3a,0x3f6a2a])),.16);
 hnWoodpile(-1,0,-D/2-.8,0,5,1.3);hnDryingRack(1.5,0,D/2+3.4,0,3);hnFirepit(-2.4,0,D/2+2.6,.5);vnFolk(0,D/2+3,2,1.5);}

// Farm — three dry-stone terraces (about 35 x 25 m) stepping up the hillside: greens in rows at the foot,
// tall grain in the middle, fresh-turned ridges with squash above; a painted scarecrow totem with its arms
// spread, a field shelter, bamboo fencing, steps between the terraces.
function buildHlTriFarm(G,o){reseed(23251+(o.v|0));const FW=34,TD=7.8;
 const bam=hC(vPick(HPAL.bamboo)),rub=hC(vPick(HPAL.rubble)),soil=hC(0x9a8a70),th=hC(vPick(VPAL.thatch));
 vnReg('Terraced farm',0,0,18,3);
 for(let t=0;t<3;t++){const y=t*.9,zc=TD-t*TD;const top=y+(t?0:.08);
  vB('vClayB',0,0,zc,FW,top,TD,0,soil);
  if(t)vB('hRubB',0,0,zc+TD/2-.2,FW+.3,top+.25,.5,0,rub);                                     // the retaining wall
  const rows=Math.floor((TD-1.2)/.9);
  for(let r=0;r<rows;r++){const z=zc-TD/2+.9+r*.9;
   if(t===0){for(let x=-FW/2+1.6;x<FW/2-1;x+=1.5)vB('hTRLeafB',x,top,z,1.2,rr(.22,.4),.42,0,hC(vPick([0x4f7a34,0x5f8a3a,0x6a9a44])));}
   else if(t===1){for(let x=-FW/2+1.5;x<FW/2-1;x+=.95)vB('hTRLeafB',x,top,z,.78,rr(1.1,1.8),.3,rr(-.12,.12),hC(vPick([0x9a9a44,0xa8a04a,0x8a8a3a,0xb8a850])));}
   else{vB('vClayB',0,top,z,FW-2,.22,.45,0,soil.clone().multiplyScalar(.85));if(r%2===0)for(let k=0;k<6;k++)vBall('vGourd',rr(-FW/2+2,FW/2-2),top+.3,z,.2,hC(vPick([0xd08a2a,0xc07a24,0x9a8a3a])),.17);}}}
 // steps between terraces at the west end, the scarecrow, the shelter
 for(let t=1;t<3;t++)for(let k=0;k<3;k++)vB('vStone',-FW/2+.9,0,TD-t*TD+TD/2+.35-k*.3,1.2,t*.9-(2-k)*.3,.34,0,rub);
 hlRngSkip(1);FURNISH('hl_tri_scarecrow',3,.9,0,0);   // the painted scarecrow totem
 hlRngSkip(12);FURNISH('hl_tri_field_shelter',FW/2-2.5,1.8,-TD,0);   // the field shelter with its sacks
 for(const [a,b] of[[[-FW/2-.3,0,TD*1.5+.3],[FW/2+.3,0,TD*1.5+.3]],[[FW/2+.3,0,TD*1.5+.3],[FW/2+.3,0,TD/2-.1]],[[-FW/2-.3,0,TD*1.5+.3],[-FW/2-.3,0,TD/2-.1]]])hnBambooRail(a,b,bam,1.1);
 vnFolk(-5,TD,2,3);hnTRFolk(8,.9,0,1,1.5);}

// Animal pen — woven-mat wattle panels between posts, a gate, a thatched shelter along the back, a hollow-log
// trough, hay, goats, pigs and a shaggy cow; trophy horns on the gate post.
function buildHlTriPen(G,o){reseed(23261+(o.v|0));const PW=14,PD=10;
 const log=hC(vPick(HPAL.aged)),bam=hC(vPick(HPAL.bamboo)),th=hC(vPick(VPAL.thatch));
 vnReg('Animal pen (tribal)',0,0,8.5,3.2);
 const segs=[[[-PW/2,-PD/2],[PW/2,-PD/2]],[[PW/2,-PD/2],[PW/2,PD/2]],[[-PW/2,PD/2],[-PW/2,-PD/2]],[[-PW/2,PD/2],[-1.2,PD/2]],[[1.2,PD/2],[PW/2,PD/2]]];
 for(const [a,b] of segs){const L=Math.hypot(b[0]-a[0],b[1]-a[1]);const n=Math.max(1,Math.round(L/1.6));const yaw=Math.atan2(b[0]-a[0],b[1]-a[1]);
  for(let i=0;i<=n;i++){const t=i/n;vPst('vPost',lerp(a[0],b[0],t),0,lerp(a[1],b[1],t),.07,1.45,log);}
  for(let i=0;i<n;i++){const t=(i+.5)/n;kput('hBMatB',[lerp(a[0],b[0],t),.62,lerp(a[1],b[1],t)],qEuler(0,yaw+Math.PI/2,0),[L/n-.12,1.05,.07],bam);}}
 kput('vWood',[1.9,.7,PD/2+.9],qEuler(0,-1.1,0),[2.2,1.1,.06],log);                                        // the gate leaf, swung open
 hnTotemPost(-1.4,0,PD/2,.14,2.2,0,true);hnTRHorns(-1.4,2.3,PD/2+.15,0,.6);vPst('vPost',1.3,0,PD/2,.1,1.7,log);
 // shelter along the back
 for(const x of[-PW/2+.3,-2.3,2.3,PW/2-.3])vPst('hBamboo',x,0,-PD/2+3.2,.1,1.9,bam);
 vnShedRoof(0,1.9,-PD/2+1.6,PW-.2,3.4,.7,0,'vThatchB',th,.35,.2);
 FURNISH('hl_tri_haycock',-4,0,-PD/2+1.5,0,{v:1});
 FURNISH('hl_tri_log_trough',2,0,1.2,0);
 hnTRBeast(-3,0,1,.6,'cow');hnTRBeast(3,0,-1.4,2.2,'goat');hnTRBeast(4.2,0,2.4,-.8,'goat');hnTRBeast(-1,0,-2.6,1.4,'goat');
 hnTRBeast(0,0,3,3,'pig');hnTRBeast(5.2,0,-3,1,'pig');vnFolk(3,PD/2+2,1,1);}

// Granary — a round bamboo-mat bin on stilts, each stilt capped by a wide rat-guard disc, lashed with hoops,
// a painted band, a steep thatch cone with a carved bird; a notched ladder to the hatch; a threshing floor.
function buildHlTriGranary(G,o){reseed(23271+(o.v|0));const R=2.1,FL=1.9,H=2.4;
 const log=hC(vPick(HPAL.aged)),bam=hC(vPick(HPAL.bamboo)),th=hC(vPick(VPAL.thatch));
 vnReg('Granary (tribal)',0,0,3.2,FL+H+4.6);
 for(let k=0;k<6;k++){const a=k/6*TAU;const x=Math.sin(a)*1.5,z=Math.cos(a)*1.5;vB('vStone',x,0,z,.5,.2,.5,0,hC(vPick(HPAL.rubble)));vPst('vPostB',x,.2,z,.14,FL-.45,log);
  vPst('hTRDisc',x,FL-.75,z,.58,.06,hC(0xb8a888));}
 for(const x of[-1,1])kput('hLogX',[x*.8,FL-.2,0],qEuler(0,Math.PI/2,0),[3.8,.15,.15],log);
 vPst('hTRDisc',0,FL-.06,0,R+.3,.22,log);kput('hTRMatCyl',[0,FL+.16,0],null,[R,H,R],bam);
 kput('hTRBandCyl',[0,FL+1.2,0],null,[R+.06,.5,R+.06],null);
 for(const yy of[FL+.4,FL+2.2])kput('vHoop',[0,yy,0],qEuler(Math.PI/2,0,0),[R+.08,R+.08,1.4],bam);
 vnThatchCone(0,FL+.16+H,0,R+.35,3.9,th);vPst('vPost',0,FL+H+3.6,0,.06,.8,log);kput('hPaintBall',[0,FL+H+4.45,0],null,[.15,.18,.15],hC(HPAL.black));
 for(const s of[-1,1])kput('hWing',[s*.45,FL+H+4.5,0],qEuler(0,0,s*-.2),[s*.9,.45,1],null);
 vB('vWood',0,FL+.9,R+.02,.8,.9,.08,0,log);                                                              // hatch
 vnLadder(0,0,R+1,0,FL+1,log);
 vPst('hTRDisc',4.2,-.02,1.5,2.2,.06,hC(0xb89a70));hnSacks(4,0,.6,4);kput('vPost',[5,.5,2.6],qEuler(0,0,.8),[.05,1.6,.05],log);
 FURNISH('hl_tri_grain_mortar',-3.2,0,2.05,0);vnFolk(3,4,1,1);}

// Scrap smithy — a crude open forge under a thatch shelter patched with salvaged sheet: a fieldstone hearth
// with a bed of embers under a hood of rusted plate and a salvage-pipe flue, bamboo piston bellows, an anvil of
// scrap iron on a stump, a quench trough, a pile of salvaged sheet, pipe and plate.
function buildHlTriSmithy(G,o){reseed(23281+(o.v|0));const W=7,D=5.4,PH=2.6;
 const log=hC(vPick(HPAL.aged)),bam=hC(vPick(HPAL.bamboo)),th=hC(vPick(VPAL.thatch)),rub=hC(vPick(HPAL.rubble));
 vnReg('Scrap smithy (tribal)',0,0,5.5,PH+3.4);
 for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPostB',sx*W/2,0,sz*D/2,.16,PH,log);
 for(const sz of[-1,1])kput('hLogX',[0,PH,sz*D/2],null,[W+.6,.16,.16],log);
 hnGable(0,PH+.05,0,W,D,1.05,0,'vGableT',th,.6,null);
 kput('vSheet',[-1.6,PH+1.5,1.4],vQ(0,-Math.atan(1.05),0),[2.4,1.8,1],null);kput('vPlate',[1.8,PH+.9,-2.2],vQ(Math.PI,-Math.atan(1.05),0),[1.6,1.2,1],null);   // salvage patches
 vB('hBMatB',0,0,-D/2,W,2.2,.08,0,bam);
 // the forge (hearth, embers, hood of rusted plate, piston bellows), the anvil and the quench tub are furniture from the
 // catalog (the embers drew 18 numbers); the salvage-pipe flue on up through the thatch is the shelter's own
 hlRngSkip(18);hnFurn('hl_tri_forge',-1.2,0,-1.6,0,{v:0},.505,0);vPst('vPipeR',-1.2,3.2,-1.8,.2,2,null);
 FURNISH('hl_tri_scrap_anvil',.6,0,.6,0,{v:0});FURNISH('hl_tri_quench_tub',-2.2,0,.6,0,{v:0});
 // tools leaning on the back wall, the scrap pile
 for(let k=0;k<4;k++)kput('vPost',[1.6+k*.18,.5,-2.5],qEuler(.1,0,0),[.025,1.1,.025],hC(0x3a3430));
 hlRngSkip(95);FURNISH('hl_rep_scrap_heap',W/2+2,0,.5,0,{v:0});   // (the drawn pile drew 95 numbers)
 hnTotemPole(-W/2-.6,0,D/2+.4,.16,2.8,0,true);hnWoodpile(-W/2-1,0,-.6,Math.PI/2,3,1.1);vnFolk(0,2,1,.6);vnFolk(2,D/2+1.5,1,1);}

HL.def({key:'hl_tri_longhouse',name:'Village longhouse',branch:'tribal',family:'Halls',tags:{type:['civic'],wealth:'civic',lit:false,landmark:true},w:66,d:40,h:26,build:buildHlTriLonghouse});
HL.def({key:'hl_tri_warrior_hall',name:"Warrior's hall",branch:'tribal',family:'Halls',tags:{type:['military'],wealth:'civic',lit:false},w:40,d:38,h:13,build:buildHlTriWarriorHall});
HL.def({key:'hl_tri_shaman',name:"Shaman's house",branch:'tribal',family:'Halls',tags:{type:['religious'],wealth:'middle',lit:false},w:20,d:20,h:13,build:buildHlTriShaman});
HL.def({key:'hl_tri_stone_circle',name:'Stone circle',branch:'tribal',family:'Sacred',tags:{type:['religious'],wealth:'civic',lit:false},w:24,d:30,h:7,build:buildHlTriStoneCircle});
HL.def({key:'hl_tri_farmhouse',name:'Tribal farmhouse',branch:'tribal',family:'Farms and crafts',tags:{type:['farm','single-family dwelling'],wealth:'poor',lit:false},w:24,d:16,h:9,build:buildHlTriFarmhouse});
HL.def({key:'hl_tri_farm',name:'Terraced farm',branch:'tribal',family:'Farms and crafts',tags:{type:['farm'],wealth:'poor',lit:false},w:36,d:26,h:5,build:buildHlTriFarm});
HL.def({key:'hl_tri_pen',name:'Animal pen',branch:'tribal',family:'Farms and crafts',tags:{type:['farm'],wealth:'poor',lit:false},w:16,d:14,h:4,build:buildHlTriPen});
HL.def({key:'hl_tri_granary',name:'Stilted granary',branch:'tribal',family:'Farms and crafts',tags:{type:['farm'],wealth:'poor',lit:false},w:12,d:10,h:9,build:buildHlTriGranary});
HL.def({key:'hl_tri_smithy',name:'Scrap smithy',branch:'tribal',family:'Farms and crafts',tags:{type:['industry'],wealth:'poor',lit:false},w:16,d:10,h:7,build:buildHlTriSmithy});
// the cliff settlement (built in 84-tri-dwell.js) is defined last so its row closes the branch
HL.def({key:'hl_tri_cliff_village',name:'Cliff settlement',branch:'tribal',family:'Cliff settlement',cls:'building',tags:{type:['multi-family dwelling'],wealth:'poor',lit:false,landmark:true},w:88,d:30,h:48,build:buildHlTriCliffVillage});
