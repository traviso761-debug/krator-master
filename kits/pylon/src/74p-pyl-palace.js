// ================================================================= 74p. PYLON: the governor's palace (PLAN.md section 6)
// The Izani governor's palace, massed on the owner's govpalace picture and laid out on its blueprint (kits/pylon/palace:
// BLUEPRINT.md, floors/*.png; the programme is settlements/iziz/VASSAL-KITS.md section 3), built in Pylon's style: an
// Ancient podium for a terrace, a hall block of white render over concrete with two storeys of tombstone arcades,
// a great drum and hex-lattice dome over the audience hall with the signal lantern on top, seven round pavilions, the
// outside stair on the chancery flank, saffron buttress legs, a nested tombstone portal on the axis. Lit (civic).
//
// The blueprint's frame: u along the axis from the forecourt gate (u = -36) to the rear wall (u = 38), v across, v > 0
// on the left walking in. The building's local frame: +z is the front (the gate), so x = -v and z = 1 - u (the
// grounds' centre on the plot's centre). Every position below is written in (u, v) and passed through PYP.
// Heights: the terrace 1.2 m, the ground storey 5.5 m (to 6.7), the upper 4.5 m (to 11.2); the drum to 17, the dome
// to 24, the lantern to 27. Interiors (the blueprint's rooms) come with the kit's interior set (PLAN.md P6).
// Seeds 9271-9279.
const PYP=(u,v)=>[-v,1-u];
// a round pavilion of radius R at blueprint (u, v): a render drum of n storeys with a stadium-window arcade on each,
// an orange cornice ring, and a cap: 'lattice' (a small hex-lattice dome), 'cone' (a truncated cone with an orange
// skylight ring), 'dome' (a shallow render dome) or 'vent' (the kitchen's dome with a vent stack)
function pypPavilion(G,u,v,R,storeys,cap,lit,wh,or,sf){const [x,z]=PYP(u,v),T=1.2,SH=[5.5,4.5],Htop=T+SH.slice(0,storeys).reduce((a,b)=>a+b,0);
 kput('pyCyl',[x,T,z],null,[R,Htop-T,R],wh);kput('pyRing',[x,Htop,z],qEuler(Math.PI/2,0,0),[R+.05,R+.05,R*.4],or);
 let y=T;for(let s=0;s<storeys;s++){const n=Math.max(6,Math.round(TAU*R/3.2));for(let k=0;k<n;k++){const a=(k+.5)/n*TAU,p=[x+Math.sin(a)*R,z+Math.cos(a)*R];
   pynFrame('stadium',p[0],y+.8,p[1],a,1.1,SH[s]-1.8,{rim:.14,c:or,fill:lit&&s?'L':'G',out:.05});}
  y+=SH[s];if(s<storeys-1)kput('pyRing',[x,y,z],qEuler(Math.PI/2,0,0),[R+.04,R+.04,R*.18],wh);}
 if(cap==='lattice')acLatticeDome(G,x,Htop,z,R*.92,PYA.white);
 else if(cap==='cone'){mesh(lathe({rFn:yy=>R*(1-.55*yy/(R*.7)),H:R*.7,nu:36,nv:3}),tsand(PYA.white),G,x,Htop,z);kput('pyRing',[x,Htop+R*.7,z],qEuler(Math.PI/2,0,0),[R*.45,R*.45,R*.2],or);pynPane('pyDiscG',[x,Htop+R*.7-.05,z],qEuler(Math.PI/2,0,0),[R*.42,R*.42,.1],'pyDiscD');}
 else{kput('vDomeP',[x,Htop,z],null,[R*.96,R*.55,R*.96],wh);if(cap==='vent'){vPst('vPostS',x,Htop+R*.5,z,.5,1.6,wh);kput('pyRing',[x,Htop+R*.5+1.6,z],qEuler(Math.PI/2,0,0),[.55,.55,.3],or);}}
 return Htop;}

// the hall block's interior from the interior set's plan (kits/interiors/sets/pylon.js, pyl_governor_palace: the blueprint's
// rooms, cells [id, level, kind, name, u0, u1, v0, v1], the upper storey's open wells, the doors [level, u, v, w, a, b]):
// 0.2 m partitions on every line a room's edge runs along (the block's own walls excepted), open where a door stands on them
// (a lintel over it); the upper floor over the block less the wells and the private stair's square; the doors through the
// block's walls (the loggia's back, the outside stair's landing: a leaf); the private stair, a spiral round a newel in its
// 3 m square. Draws from no stream (fixed picks).
function pypInterior(X,wh,cr){const P=PYP,T=X.T,R1=X.R1,R2=X.R2,LV=[[T,R1-T],[R1,R2-R1]],ext=(ax,c)=>ax==='u'?(c===-4||c===24):Math.abs(c)===18;
 const pc=vC(0xece6da),fl=vC(PYPAL.stoneGrey[0]);
 for(let L=0;L<2;L++){const [y,h]=LV[L],lines={};
  const add=(ax,c,a,b)=>{if(ext(ax,c))return;const k=ax+':'+c.toFixed(2);(lines[k]=lines[k]||{ax,c,iv:[]}).iv.push([Math.min(a,b),Math.max(a,b)]);};
  const rects=X.cells.filter(c=>c[1]===L).map(c=>[c[4],c[5],c[6],c[7]]).concat(L?X.voids:[]);
  for(const [u0,u1,v0,v1] of rects){add('u',u0,v0,v1);add('u',u1,v0,v1);add('v',v0,u0,u1);add('v',v1,u0,u1);}
  for(const k of Object.keys(lines).sort()){const Ln=lines[k],iv=Ln.iv.sort((p,q)=>p[0]-q[0]),runs=[];
   for(const r of iv){const t=runs[runs.length-1];if(t&&r[0]<=t[1]+.01)t[1]=Math.max(t[1],r[1]);else runs.push(r.slice());}
   const gaps=X.doors.filter(d=>d[0]===L&&(Ln.ax==='u'?Math.abs(d[1]-Ln.c)<.01:Math.abs(d[2]-Ln.c)<.01)).map(d=>{const m=Ln.ax==='u'?d[2]:d[1];return[m-d[3]/2,m+d[3]/2,d[3]>=1.6?3.4:2.4];});
   const seg=(a,b,y0,hh)=>{if(b-a<.02||hh<.02)return;const m=(a+b)/2;if(Ln.ax==='u'){const [x,z]=P(Ln.c,m);vB('vPlaster',x,y0,z,b-a,hh,.2,0,pc);}else{const [x,z]=P(m,Ln.c);vB('vPlaster',x,y0,z,.2,hh,b-a,0,pc);}};
   for(const [a0,b0] of runs){let a=a0;for(const g of gaps.filter(g=>g[1]>a0&&g[0]<b0).sort((p,q)=>p[0]-q[0])){seg(a,g[0],y,h);seg(Math.max(a,g[0]),Math.min(b0,g[1]),y+g[2],h-g[2]);a=Math.max(a,g[1]);}seg(a,b0,y,h);}}}
 // the upper floor: the block inside its walls, less the wells and the stair's square (x = -v, z = 1 - u)
 const R=(u0,u1,v0,v1)=>[[-v1,1-u1],[-v0,1-u1],[-v0,1-u0],[-v1,1-u0]];
 vnRectFill(R(-3.6,23.6,-17.6,17.6),X.voids.concat([X.stair]).map(r=>R(r[0],r[1],r[2],r[3])),(a,b,e,f)=>vB('vStone',(a+b)/2,R1-.3,(e+f)/2,b-a,.3,f-e,0,fl));
 // the doors through the bodies' walls: the loggia's back (both storeys), the outside stair's landing (a leaf, at the stair's head)
 for(const d of X.doors){if(d[5]==='loggia'||d[5]==='gallery'){const [x,z]=P(-4,d[2]);vnHole(x,LV[d[0]][0],z,Math.PI,d[3],d[0]?2.6:3.4,true);}
  else if(d[5]==='street'){const [x,z]=P(d[1],d[2]);vnOpening(x,LV[d[0]][0],z,d[2]<0?Math.PI/2:-Math.PI/2,d[3],2.4,'door',vC(PYPAL.walnut[0]));}}
 // the private stair: a spiral of 28 treads round a newel, twelve to the turn, from the ground storey's floor to the upper's
 {const [u0,u1,v0,v1]=X.stair,[x,z]=P((u0+u1)/2,(v0+v1)/2),n=28,rise=(R1-T)/n;vPst('vPostS',x,T,z,.14,R1-T+1,pc);
  for(let i=0;i<n;i++){const a=i*TAU/12,p=loc(x,z,0,.78,a);vB('vPlaster',p[0],T+(i+1)*rise-.1,p[1],.5,.1,1.3,a,pc);}}}

function buildPylGovernorPalace(G,o){reseed(9271+(o.v|0));const T=1.2,G1=5.5,U1=4.5,R1=T+G1,R2=R1+U1;
 const wh=vC(vPick(PYPAL.white)),cr=vC(vPick(PYPAL.cream)),or=vC(vPick(PYPAL.orange)),sf=vC(PYA.saffron),conc=vC(vPick(PYPAL.formwork)),gun=vC(vPick(PYPAL.gunmetal)),anc=vC(PYA.white);
 const P=PYP,box=(item,u0,u1,v0,v1,y,h,c)=>{const [x,z]=P((u0+u1)/2,(v0+v1)/2);vB(item,x,y,z,Math.abs(v1-v0),h,Math.abs(u1-u0),0,c);};
 vnReg('Governor\'s palace — the hall block',0,P(8,0)[1],17,R2+1,{role:'governor'});
 vnReg('Governor\'s palace — the great dome and the signal lantern',0,P(10,0)[1],7.5,27);
 vnReg('Governor\'s palace — forecourt',0,P(-24,0)[1],14,3,{type:['civic']});
 // ---- the grounds: the forecourt wall with its gate on the street, the side and rear walls, the cart gate
 for(const s of[-1,1]){box('pyConc',-36.4,-35.6,s*5.5,s*30,0,3,conc);box('vPlaster',-36.5,-35.5,s*5.5,s*30,3,.15,or);
  box('pyConc',-36,38,s*29.6,s*30.4,0,3,conc);const [gx,gz]=P(-36,s*5.5);vB('pyConc',gx,0,gz,1.4,4.6,1.4,0,conc);vB('vPlaster',gx,4.6,gz,1.7,.3,1.7,0,or);
  const b=P(-33,s*8);vnBannerPole(b[0],0,b[1],0,7,or);}
 box('pyConc',37.6,38.4,-30,-20.5,0,3,conc);box('pyConc',37.6,38.4,-13.5,30,0,3,conc);
 for(const s of[-1,1]){const l=P(-22,s*7);vnLampPost(l[0],0,l[1],3.4);}
 pynHexPave(0,0,P(-24,0)[1],14,22,0,vC(vPick(PYPAL.stoneGrey)));
 // ---- the podium: Ancient white panel, its front recessed between the large pavilions, pocked; the front flight
 box('vPanelB',-8.5,34.6,-25.6,25.6,0,T,anc);for(const s of[-1,1])box('vPanelB',-14.3,-8.5,s*11.7,s*25.6,0,T,anc);
 for(let k=0;k<26;k++){const v=rr(-25,25),u=Math.abs(v)>12?-14.35:-8.55,[x,z]=P(u,v);kput('pyDiscM',[x,rr(.2,1),z+.02],null,[rr(.05,.12),rr(.05,.12),.04],null);}
 {const [x,z]=P(-10.3,0);vnStairs(x,0,z,0,11,T,6,'vPanelB',anc);}
 // ---- the hall block: two storeys behind the front arcade, the light courts cut as voids in the roof
 // With the interiors (the kit's interior set, kits/interiors/sets/pylon.js: the blueprint's rooms) the block and the loggia
 // behind the screen are hollow bodies, and the rooms' partitions, the upper floor and the private stair are drawn from the
 // item's plan (pypInterior); without, the solid block as before.
 const ix=VERN.cur&&VERN.cur.hollow&&VERN.cur.ixItem&&VERN.cur.ixItem.plan?VERN.cur.ixItem.plan:null;
 if(ix){const [bx,bz]=P(10,0),[lx,lz]=P(-6.45,0);vnBody('vPlaster',bx,T,bz,36,G1+U1,28,0,wh,{t:.4,floor:'vStone',floorC:vC(PYPAL.stoneGrey[0])});
  vnBody('vPlaster',lx,T,lz,23.4,G1+U1,4.9,0,wh,{t:.6,floor:'vStone',floorC:vC(PYPAL.stoneGrey[0])});}
 else box('vPlaster',-4,24,-18,18,T,G1+U1,wh);
 box('vPlaster',-4.5,24.5,-18.5,18.5,R2,.35,or);box('vPlaster',-4,24,-18,18,R2+.35,.6,wh);
 // the front arcade: a rendered screen at u -8.5 across v -11.7..11.7, two storeys of tombstone bays on a 4 m bay,
 // orange reveals over the deep gallery's shade; the middle bay of the ground storey is the nested portal
 if(!ix)box('vPlaster',-8.9,-8.3,-11.7,11.7,T,G1+U1,wh);box('vPlaster',-8.3,-4,-11.7,11.7,R1-.3,.3,cr);
 if(ix){box('vPlaster',-8.1,-4.5,-11.7,11.7,R2,.35,wh);pypInterior(ix,wh,cr);}
 const NB=6,BW=23.4/NB;for(let s=0;s<2;s++)for(let k=0;k<NB;k++){const v=-11.7+(k+.5)*BW,[x,z]=P(-8.9,v),y=s?R1+.3:T;
  if(s===0&&(k===2||k===3))continue;pynFrame('tomb',x,y,z,0,BW-1.1,(s?U1:G1)-1.1,{rim:.18,c:or,fill:s?'G':'L',out:.05});}
 {const [x,z]=P(-8.9,0);pynDoorway('tomb',x,T,z,0,3.2,G1-.9,{rim:.24,n:3,cs:[wh,or],out:.06});vnLamp(x-2.6,4.6,z+.02,0);vnLamp(x+2.6,4.6,z+.02,0);}
 box('vPlaster',-9.1,-8.1,-12,12,R2,.35,or);
 // saffron buttress legs at the block's four corners
 for(const [u,v,du,dv] of[[-8.6,11.7,-1,1],[-8.6,-11.7,-1,-1],[24,18,1,1],[24,-18,1,-1]]){const [x,z]=P(u,v),dx=-dv,dz=-du;
  vBq('vPlaster',x+dx*1.1,3.4,z+dz*1.1,1,7.2,1.6,vQ(Math.atan2(dx,dz),-.18,0),sf);}
 // ---- the great dome over the audience hall: a drum ringed with amber lancets, the hex-lattice dome, a saffron ring
 {const [x,z]=P(10,0);kput('pyCyl',[x,R2,z],null,[7.3,5.8,7.3],wh);kput('pyRing',[x,R2+5.8,z],qEuler(Math.PI/2,0,0),[7.45,7.45,2.6],or);
  for(let k=0;k<16;k++){const a=(k+.5)/16*TAU;pynPane('vWinLit',[x+Math.sin(a)*7.32,R2+2.9,z+Math.cos(a)*7.32],vQ(a,0,0),[.7,3.6,.1]);}
  acLatticeDome(G,x,R2+5.8,z,7.2,PYA.white);kput('pyRing',[x,R2+5.8+5.6,z],qEuler(Math.PI/2,0,0),[2.2,2.2,1.4],sf);
  // the signal lantern: a small drum on the crown, glazed and lit, the heliograph's mirror on its roof
  kput('pyCyl',[x,R2+12.2,z],null,[1.5,2.4,1.5],wh);for(let k=0;k<6;k++){const a=k/6*TAU;pynPane('vWinLit',[x+Math.sin(a)*1.52,R2+13.4,z+Math.cos(a)*1.52],vQ(a,0,0),[.8,1.4,.08]);}
  kput('vDomeP',[x,R2+14.6,z],null,[1.6,.8,1.6],or);vBq('vIron',x,R2+15.8,z,.9,.06,.9,vQ(.6,.5,0),gun);vPst('vPipe',x,R2+15.2,z,.05,.7,gun);}
 // the light courts either side of the drum: a lit glazed lantern over each well through the roof (its room card inside)
 for(const s of[-1,1]){const [x,z]=P(5.5,s*9.5);pynPane('vWinLit',[x,R2+.36+.31,z],null,[5,.62,5]);}
 // ---- the seven pavilions (blueprint: large front corners, medium rear corners, small flanks, the round kitchen)
 for(const s of[-1,1]){pypPavilion(G,-8,s*18,6.3,2,'lattice',true,wh,or,sf);pypPavilion(G,24,s*18,5,2,'cone',true,wh,or,sf);}
 pypPavilion(G,8,-22,3.6,2,'dome',true,wh,or,sf);                          // the guard pavilion; the commander above
 pypPavilion(G,8,22,3.6,1,'lattice',true,wh,or,sf);                        // the household shrine, one tall room
 pypPavilion(G,31,-6,3.6,1,'vent',false,cr,or,sf);                         // the round kitchen
 // ---- the outside stair on the chancery flank: a white flight with a saffron stringer wall up to the gallery
 {const [x0,z0]=P(1.35,-28),[x1]=P(1.35,-19.5),zc=z0,run=x0-x1;vnStairs((x0+x1)/2,0,zc,Math.PI/2,2.4,R1,22,'vPlaster',wh);
  const ang=Math.atan2(R1,run);vBq('vPlaster',(x0+x1)/2,R1/2+.5,zc-1.35,Math.hypot(run,R1)+.4,1,.25,vQ(0,0,-ang),sf);
  vB('vPlaster',x1-.75,0,zc,1.5,R1,2.6,0,wh);vB('vPlaster',x1-.75,R1,zc,1.7,.25,2.8,0,or);}
 // ---- the service court, the garden behind the residence
 for(let k=0;k<3;k++){const [x,z]=P(33+k*1.4,-24);vnCrate(x,0,z,.8,.2,vC(vPick(VPAL.woodMid)));}
 {const [x,z]=P(34,-17);vnBarrel(x,0,z,.35,.9,null);const [gx,gz]=P(34,15);vnPlanter(gx,0,gz,3,1,Math.PI/2,cr);const [hx,hz]=P(32,22);vnPlanter(hx,0,hz,3,1,Math.PI/2,cr);}}

VERN.def({key:'pyl_governor_palace',name:'Governor\'s palace',family:'civic',
 tags:Object.assign({},PY_TAG_CIV,{role:'governor'}),w:62,d:76,h:28,build:buildPylGovernorPalace});
