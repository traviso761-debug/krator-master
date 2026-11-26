// ================================================================= HIGHLANDS — registry + structural helpers (prefix hn)
// The Highlands kit reuses the Iziz Vernacular registry (VERN, 69c) so that one placer (VERN.place), one inspector
// and one set of building blocks (vB vPst vnWin vnDoor vnGableRoof …) serve both kits. HL.def adds the kit's own
// fields: BRANCH (republican | rustic | tribal) and FAMILY (the showcase row it belongs to).
//
// Local frame as in the vernacular set: origin at the plot centre on the ground, +z is the FRONT (the door side),
// y up, metres; a builder never touches world coordinates.
const HL={branches:{republican:'Republican',rustic:'Rustic',tribal:'Tribal'},
 def(D){if(!HL.branches[D.branch])throw new Error('HL.def '+D.key+': branch must be republican|rustic|tribal');
  D.tags=Object.assign({culture:'highland-'+D.branch,kit:'highlands'},D.tags||{});D.family=D.family||'misc';return VERN.def(D);},
 keys(branch){return VERN.order.filter(k=>VERN.defs[k].branch===branch);},
 // families in definition order for one branch: [{family, keys:[…]}]
 families(branch){const out=[],idx={};for(const k of HL.keys(branch)){const f=VERN.defs[k].family;if(idx[f]===undefined){idx[f]=out.length;out.push({family:f,keys:[]});}out[idx[f]].keys.push(k);}return out;},
};
// Place a whole sub-building (another def) inside the builder that is running — a compound, a cliff village, a
// farm with its farmhouse. (lx,ly,lz,lry) are in the CURRENT builder's local frame. The child is placed in world
// space through VERN.place with the parent's transform composed by hand, then the parent's state is restored.
function hnSub(key,lx,ly,lz,lry,o){const P=VERN.cur;const s=P.o.scale||1;const p=loc(P.x,P.z,lx*s,lz*s,P.ry);
 const saveK=KXF,saveO=KOFF.slice();KXF=null;
 const G=VERN.place(P.G.parent||scene,key,p[0],p[1],P.ry+(lry||0),Object.assign({},o||{},{y:(P.o.y||0)+ly*s,scale:s*((o&&o.scale)||1)}));
 KXF=saveK;KOFF=saveO;VERN.cur=P;return G;}

// ---------------------------------------------------------------- vectors in the local frame
// rotate a local direction by yaw ry (the same convention as loc())
const hRot=(ry,v)=>[v[0]*Math.cos(ry)+v[2]*Math.sin(ry),v[1],-v[0]*Math.sin(ry)+v[2]*Math.cos(ry)];
const hAdd=(a,b,k)=>[a[0]+b[0]*(k===undefined?1:k),a[1]+b[1]*(k===undefined?1:k),a[2]+b[2]*(k===undefined?1:k)];
const hNorm=v=>{const L=Math.hypot(v[0],v[1],v[2])||1;return[v[0]/L,v[1]/L,v[2]/L];};
const hCross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
// An item placed with a full basis: its local x along X, its local z (a plane's face) toward Z. Z is
// re-orthogonalised against X. Use for braces that must lie flat on a wall, bargeboards along a rake, struts.
function hnOri(item,P,X,Z,s,c){const x=hNorm(X);let y=hNorm(hCross(Z,x));const z=hCross(x,y);
 const m=new THREE.Matrix4().makeBasis(new THREE.Vector3(...x),new THREE.Vector3(...y),new THREE.Vector3(...z));
 kput(item,P,new THREE.Quaternion().setFromRotationMatrix(m),s,c||null);}
// a member from a to b (local points), section w x t, lying flat against a surface whose normal is N
function hnMember(item,a,b,w,t,N,c){const X=[b[0]-a[0],b[1]-a[1],b[2]-a[2]];const L=Math.hypot(...X);hnOri(item,[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],X,N,[L,w,t],c);}
// local point on a face: (x,z,ry) is the face frame (ry = outward direction), u along the face, y up, o out
const hnOn=(x,y,z,ry,u,o)=>{const p=loc(x,z,u,o||0,ry);return[p[0],y,p[1]];};

// ---------------------------------------------------------------- walls
// Log walls (izba / Norse): a box of round-log courses and, at each corner, the crossed log ends of the saddle
// notch sticking out `ext` metres, alternating direction course by course.
function hnLogBox(x,y,z,w,h,d,ry,c,ext){ext=ext===undefined?.32:ext;vB('hLogB',x,y,z,w,h,d,ry,c);if(!ext)return;
 const LH=1/3,n=Math.floor(h/LH);const ce=c?c.clone().multiplyScalar(1.08):null;
 for(let k=0;k<n;k++){const yy=y+(k+.5)*LH;const alongX=k%2===0;
  for(const sx of[-1,1])for(const sz of[-1,1]){
   if(alongX){const p=loc(x,z,sx*(w/2+ext/2-.02),sz*(d/2-.12),ry);kput('hLogEnd',[p[0],yy,p[1]],qEuler(0,ry,0),[ext+.2,.16,.16],ce);}
   else{const p=loc(x,z,sx*(w/2-.12),sz*(d/2+ext/2-.02),ry);kput('hLogEnd',[p[0],yy,p[1]],qEuler(0,ry+Math.PI/2,0),[ext+.2,.16,.16],ce);}}}}
// Fieldstone socle with a dressed cap (the Peles base, the chalet ground storey, the Norse hall platform).
function hnSocle(x,y,z,w,h,d,ry,c,capC){vB('hRubB',x,y,z,w,h,d,ry,c||hC(vPick(HPAL.rubble)));vB('vStone',x,y+h-.12,z,w+.16,.16,d+.16,ry,capC||hC(vPick(HPAL.ashlar)));}
// Rendered masonry block with ashlar quoins at the four corners (cream stucco, limestone corners).
function hnStucco(x,y,z,w,h,d,ry,c,qC){vB('vPlaster',x,y,z,w,h,d,ry,c||hC(vPick(HPAL.stucco)));if(qC===false)return;const qc=qC||hC(vPick(HPAL.ashlar));
 const n=Math.floor(h/.6);for(let k=0;k<n;k++){const big=k%2===0;for(const sx of[-1,1])for(const sz of[-1,1]){
  const p=loc(x,z,sx*(w/2-(big?.28:.2)+.03),sz*(d/2+.03),ry);vB('vStone',p[0],y+k*.6,p[1],big?.62:.46,.56,.08,ry,qc);
  const q=loc(x,z,sx*(w/2+.03),sz*(d/2-(big?.2:.28)+.03),ry);vB('vStone',q[0],y+k*.6,q[1],.08,.56,big?.46:.62,ry,qc);}}}
// Half-timbering (Fachwerk) on ONE face: (x,z,ry) the face centre and outward direction, w the face width, h the
// storey. Posts every ~1.1 m, sill + head beams, windows in the bays listed in `wins` (bay indices; -1 = auto: every
// other bay). kind: window kind for vnWin ('lit' | 'glass' | 'shut' | 'open').
//
// Round 2 (Travis: "more elaborate", after Alemannic/Franconian and Tudor references): every building picks a STYLE
// once (VERN.cur.fach), and each bay draws a pattern from that style's pool, mirrored about the face centre:
//   alemannic  — the "Mann" (K-braces off both posts), curved crosses, lozenges; curved Feuerböcke and gilded
//                rosettes in the window aprons; red or brown timber on white (the Black Forest / Hessian house)
//   franconian — ogee (curved) St Andrew's crosses, stars (lozenge + cross), lozenges, crosses in every apron
//   tudor      — black timber on white: close studding, herringbone chevrons, quatrefoil rings and star panels
//   saxon      — the plain round-1 pattern (alternating straight braces), for the modest houses
const HFACH={alemannic:['mann','curvedX','raute','mann'],franconian:['curvedX','star','raute','X'],tudor:['close','herring','star','quatre'],saxon:['K','K','X']};
function hlFachStyle(){const c=VERN.cur;if(!c)return 'saxon';if(!c.fach){const b=c.D.branch,w=c.D.tags.wealth;
  c.fach=vPick(b==='rustic'?['alemannic','alemannic','saxon']:w==='poor'?['saxon','alemannic']:['alemannic','franconian','tudor','franconian','alemannic','tudor']);}return c.fach;}
kdef('hDisc',new THREE.CylinderGeometry(1,1,1,16),MAT.paint);kdef('hDiscG',new THREE.CylinderGeometry(1,1,1,16),MAT.gold);   // centred discs: rosettes, bosses
function hnFachFace(x,y,z,ry,w,h,c,wins,kind,winC){const st=hlFachStyle();if(st==='tudor')c=hC(vPick([0x2a221e,0x322822,0x3a2a22]));else c=c||hC(vPick(HPAL.redwood));
 const nb=Math.max(2,Math.round(w/1.15)),bw=w/nb,T=.07,N=hRot(ry,[0,0,1]),pool=HFACH[st];
 const isWin=i=>wins===-1?(i%2===1&&i<nb-1):(wins||[]).indexOf(i)>=0;
 const P=(u,yy)=>hnOn(x,yy,z,ry,u,T/2);const M=(a,b,wd)=>hnMember('vWood',P(a[0],a[1]),P(b[0],b[1]),wd||.13,T,N,c);
 const C=(a,b,k,wd,n)=>{n=n||4;let pv=a;for(let i=1;i<=n;i++){const t=i/n;const q=[(1-t)*(1-t)*a[0]+2*(1-t)*t*k[0]+t*t*b[0],(1-t)*(1-t)*a[1]+2*(1-t)*t*k[1]+t*t*b[1]];M(pv,q,wd);pv=q;}};
 const rosette=(u,yy,r)=>{const p=hnOn(x,yy,z,ry,u,T+.02);kput('hDiscG',p,qEuler(0,ry,0).multiply(qEuler(Math.PI/2,0,0)),[r,.04,r],hC(HPAL.gold[0]));
  const q=hnOn(x,yy,z,ry,u,T+.05);kput('hDisc',q,qEuler(0,ry,0).multiply(qEuler(Math.PI/2,0,0)),[r*.45,.03,r*.45],hC(HPAL.red));};
 // a pattern inside the rectangle u0..u1 x ya..yb
 const pat=(p,u0,u1,ya,yb,mir)=>{const um=(u0+u1)/2,ym=(ya+yb)/2,W=u1-u0,H=yb-ya;
  if(p==='X'){M([u0,ya],[u1,yb]);M([u1,ya],[u0,yb]);}
  else if(p==='K'){if(mir){M([u0,ya+.1],[u1,ym]);M([u0,ym],[u1,yb-.1]);}else{M([u1,ya+.1],[u0,ym]);M([u1,ym],[u0,yb-.1]);}M([u0,ym],[u1,ym],.12);}
  else if(p==='mann'){const cu=mir?u1:u0,ou=mir?u0:u1;M([ou,ya+.1],[cu,ym+H*.12]);M([cu,ym-H*.05],[ou,yb-.1]);C([ou,ya+.1],[um,yb-.1],[ou,ym],.1,4);M([u0,ya+H*.3],[u1,ya+H*.3],.1);}
  else if(p==='curvedX'){C([u0,ya],[u1,yb],[u0+W*.2,ya+H*.75],.14,5);C([u1,ya],[u0,yb],[u1-W*.2,ya+H*.75],.14,5);}
  else if(p==='raute'){const iu=W*.12,iy=H*.1;M([um,ya+iy],[u1-iu,ym]);M([u1-iu,ym],[um,yb-iy]);M([um,yb-iy],[u0+iu,ym]);M([u0+iu,ym],[um,ya+iy]);M([u0,ym],[u1,ym],.1);}
  else if(p==='star'){pat('raute',u0,u1,ya,yb);M([u0,ya],[u1,yb],.1);M([u1,ya],[u0,yb],.1);}
  else if(p==='close'){M([u0,ym],[u1,ym],.12);const n=Math.max(2,Math.round(W/.36));for(let k=1;k<n;k++){const u=u0+W*k/n;M([u,ya],[u,yb],.1);}}
  else if(p==='herring'){const n=Math.max(2,Math.round(H/.55));for(let k=0;k<n;k++){const y0=ya+H*k/n+.08,y1=y0+H/n*.8;M([u0,y0],[um,y1],.1);M([um,y1],[u1,y0],.1);}}
  else if(p==='quatre'){const r=Math.min(W,H)*.36;let pv=null;for(let k=0;k<=8;k++){const a=k/8*TAU,rr2=r*(1-.22*Math.abs(Math.cos(2*a)));const q=[um+Math.cos(a)*rr2,ym+Math.sin(a)*rr2];if(pv)M(pv,q,.09);pv=q;}
   M([u0,ya],[um-r*.6,ym-r*.6],.1);M([u1,ya],[um+r*.6,ym-r*.6],.1);M([u0,yb],[um-r*.6,ym+r*.6],.1);M([u1,yb],[um+r*.6,ym+r*.6],.1);rosette(um,ym,r*.35);}};
 const apron=(u0,u1,ya,yb)=>{const um=(u0+u1)/2,H=yb-ya;
  if(st==='alemannic'){C([u0,ya],[um,yb],[u0,yb],.1,4);C([u1,ya],[um,yb],[u1,yb],.1,4);rosette(um,ya+H*.4,Math.min(.18,H*.25));}
  else if(st==='franconian'){pat('X',u0,u1,ya,yb);}
  else if(st==='tudor'){pat(rng()<.5?'quatre':'star',u0,u1,ya,yb);}
  else{M([u0,ya+.05],[um,yb],.1);M([u1,ya+.05],[um,yb],.1);}};
 M([-w/2,y+.1],[w/2,y+.1],.22);M([-w/2,y+h-.1],[w/2,y+h-.1],.2);                                       // sill, head
 for(let i=0;i<=nb;i++){const u=-w/2+i*bw;M([u,y],[u,y+h],.18);}                                             // posts
 for(let i=0;i<nb;i++){const u0=-w/2+i*bw,u1=u0+bw,um=(u0+u1)/2;const k=Math.min(i,nb-1-i),mir=i>=nb/2;
  if(isWin(i)){const wy=y+h*.36,wh=h*.42;M([u0,wy-.08],[u1,wy-.08],.14);M([u0,wy+wh+.1],[u1,wy+wh+.1],.14);
   const wp=loc(x,z,um,0,ry);vnWin(wp[0],wy,wp[1],ry,bw*.62,wh,kind||'glass','vWood',winC||c,false);
   apron(u0,u1,y+.2,wy-.14);if(st==='tudor'||st==='franconian')pat('X',u0,u1,wy+wh+.16,y+h-.18);}                // lintel panel over the window
  else pat(pool[k%pool.length],u0,u1,y+.2,y+h-.2,mir);}
 if(st!=='saxon')for(let i=0;i<=nb;i+=2){rosette(-w/2+i*bw,y+.1,.1);}}                                        // gilded bosses along the carved sill
// All four faces of a half-timbered storey on a plaster box. Front and back get windows every other bay.
function hnFachBox(x,y,z,w,h,d,ry,wallC,beamC,kind){const st=hlFachStyle();vB('vPlaster',x,y,z,w,h,d,ry,st==='tudor'?hC(0xf2eee4):(wallC||hC(vPick(HPAL.stucco))));beamC=beamC||hC(vPick(HPAL.redwood));
 for(const s of[1,-1]){const p=loc(x,z,0,s*d/2,ry);hnFachFace(p[0],y,p[1],ry+(s>0?0:Math.PI),w,h,beamC,-1,kind);}
 for(const s of[1,-1]){const p=loc(x,z,s*w/2,0,ry);hnFachFace(p[0],y,p[1],ry+s*Math.PI/2,d,h,beamC,d>5?-1:[],kind);}}
// A jettied upper storey: the floor above oversails the one below on carved joist ends.
function hnJetty(x,y,z,w,d,ry,c,out){out=out||.45;
 for(const sx of[-1,1])for(const sz of[-1,1]){const p=loc(x,z,sx*(w/2-.1),sz*(d/2+out*.4),ry);kput('hArmW',[p[0],y-.55,p[1]],qEuler(0,ry+(sz>0?0:Math.PI),0).multiply(qEuler(0,Math.PI/2,0)),[.22,.7,out+.25],c);}   // carved corner consoles (Knaggen)
 const n=Math.round(w/.6);for(let i=0;i<=n;i++){for(const s of[-1,1]){const p=loc(x,z,-w/2+w*i/n,s*(d/2+out/2-.1),ry);
 vB('vWood',p[0],y-.26,p[1],.16,.24,out+.2,ry,c);}}
 vB('vWood',x,y-.06,z,w+.1,.12,d+2*out,ry,c);}

// ---------------------------------------------------------------- roofs
// Steep gable in any of the kit's slab items (ridge along local x). A thin wrapper so every branch pitches alike:
// `pitch` is rise/half-depth (1.2 ≈ 50°, the Norse/Russian norm; 0.55 the Alpine chalet).
function hnGable(x,y,z,w,d,pitch,ry,slabItem,slabC,over,endItem,endC){const rise=pitch*d/2;vnGableRoof(x,y,z,w,d,rise,ry,slabItem,slabC,over,endItem,endC);return y+rise;}
// Tented roof (shatior) on an octagonal or square plan: 8-sided cone, optional lucarne band.
function hnTent(x,y,z,r,h,item,c){kput(item||'hTentSc',[x,y-.05,z],null,[r,h,r],c||null);return y+h;}
// Onion dome on a drum: drum (octagonal), a little neck, the onion, a gold ball and cross-less finial spike.
// kind: 'G' gold | 'Sc' scale (tinted) | 'Sh' aspen shingle
function hnOnion(x,y,z,r,kind,c,drumH,drumItem,drumC){let yy=y;if(drumH){kput(drumItem||'hOctP',[x,yy,z],null,[r*.8,drumH,r*.8],drumC||null);
  for(let k=0;k<8;k++){const a=k/8*TAU+Math.PI/8;vnWin(x+Math.sin(a)*r*.8,yy+drumH*.3,z+Math.cos(a)*r*.8,a,r*.22,drumH*.42,'open','hPaint',hC(HPAL.white));}
  vB('hPaint',x,yy+drumH,z,r*1.72,.16,r*1.72,0,hC(HPAL.white));yy+=drumH+.16;}
 kput('hOnion'+(kind||'G'),[x,yy,z],null,[r,r*2.1,r],c||null);yy+=r*2.1;
 vPst('vIron',x,yy-.05,z,.04,r*.9,hC(0x2e2a26));vBall('hGold',x,yy+r*.15,z,r*.12,hC(HPAL.gold[0]));return yy+r*.9;}
// Keel-arch gable (kokoshnik) stood on a wall top, facing +z of (ry): a keel-shaped board with a darker recess.
function hnKokoshnik(x,y,z,ry,w,h,item,c,recess){kput(item||'hKeelSc',[x,y,z],qEuler(0,ry,0),[w,h,.3],c||null);
 if(recess!==false){const p=loc(x,z,0,.16,ry);kput('hKeelP',[p[0],y+h*.06,p[1]],qEuler(0,ry,0),[w*.72,h*.72,.06],hC(HPAL.white));
  const q=loc(x,z,0,.2,ry);kput('hKeelDark',[q[0],y+h*.12,q[1]],qEuler(0,ry,0),[w*.36,h*.46,.04]);}}
// Bochka ("barrel") roof: the keel profile run along local x (ridge along x, like hnGable) — the Russian civic
// roof, often over a porch. w = ridge length, d = span, h = rise.
function hnBochka(x,y,z,w,d,h,ry,item,c){kput(item||'hKeelSc',[x,y-.1,z],qEuler(0,ry+Math.PI/2,0),[d,h,w],c||null);return y+h;}
// Pagoda tier: a hip roof whose eaves flare — the lower slab of a low wide hip plus upturned corner horns.
function hnTier(x,y,z,w,d,rise,ry,item,c,over,hornC){over=over===undefined?1.4:over;vnHipRoof(item||'hHipSc',x,y,z,w,d,rise,ry,c,over);
 for(const sx of[-1,1])for(const sz of[-1,1]){const p=loc(x,z,sx*(w/2+over-.2),sz*(d/2+over-.2),ry);
  kput('hArm',[p[0],y-.25,p[1]],qEuler(0,ry+Math.atan2(sx,sz)+Math.PI/2,0),[.9,.6,.3],hornC||hC(HPAL.red));}}
