// ================================================================= PREVIEW — a frozen copy of Span's watch post on the site (station 4)
// Only in the preview build (build.py --station pillars --preview span -> dist/swhighlands-pillars-span.html): SPAN_FROZEN is a
// static snapshot of what Span's page drew round its watch pillar (the post, the watch stair, the cliff stair; freeze_span.py
// from a committed Span page), each colour group's triangles in the snapshot's frame (x along the pillar's first side, z across,
// y up from its top). It is placed on this station's watch pillar from the station's own site record (SWHI_PILLARS_SITE.watch:
// its top and its first side's angle), drawn in plain colours, and touches nothing else: no flora, no check, no record of the
// station's changes with it. It shows how Span sits on the site; Span's own placement on the site is Span's work.
const SPAN_PREVIEW=(function(){const S=SWHI_PILLARS_SITE&&SWHI_PILLARS_SITE.watch,F=typeof SPAN_FROZEN!=='undefined'?SPAN_FROZEN:null;if(!S||!F)return null;
 const b64=(s,T)=>{const bin=atob(s),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return new T(u.buffer);};
 const ca=Math.cos(S.ry),sa=Math.sin(S.ry),grp=new THREE.Group();grp.name='Span (frozen preview)';let tris=0;
 F.groups.forEach(g=>{const P=b64(g.pos,Int16Array),N=b64(g.nor,Int8Array),n=g.n,pos=new Float32Array(n*3),nor=new Float32Array(n*3);
  for(let i=0;i<n;i++){const a=P[3*i]/10,y=P[3*i+1]/10,c=P[3*i+2]/10,na=N[3*i]/127,ny=N[3*i+1]/127,nc=N[3*i+2]/127;
   pos[3*i]=S.x+a*ca-c*sa;pos[3*i+1]=S.top+y;pos[3*i+2]=S.z+a*sa+c*ca;nor[3*i]=na*ca-nc*sa;nor[3*i+1]=ny;nor[3*i+2]=na*sa+nc*ca;}
  const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(pos,3));G.setAttribute('normal',new THREE.BufferAttribute(nor,3));
  const m=new THREE.Mesh(G,new THREE.MeshLambertMaterial({color:new THREE.Color(g.color[0],g.color[1],g.color[2]),side:THREE.DoubleSide}));
  m.userData.probeSkip=true;m.userData.inspectLabel='Span, frozen ('+F.rev+', '+F.frozen+'): '+g.labels.join(', ');grp.add(m);tris+=n/3;});
 scene.add(grp);
 const V={};const a=-2.1,d=110;V.cam=[S.x+Math.cos(a)*d,S.top+40,S.z+Math.sin(a)*d];
 return{group:grp,tris,rev:F.rev,view:V.cam.concat([S.x,S.top+4,S.z])};})();
// SPAN'S MASSING (SPAN_MASSING: its layout's parts frozen as records, freeze_span.py --massing): each part a plain volume, a box
// (u0, u1, v0, v1) or a drum (u, v, r), placed through Span's own frame onto this site (M, n, t as Span read them from the record),
// its base at its y under the table's top here (Span's y is from the rim; this station's canyon is carved the same way), h tall.
// Grey the Ancients' ruin, red Dalab's, sand the rest; ruined and toppled parts darker. Massing only: no detail, no checks
const SPAN_MASS=(function(){const D=typeof SPAN_MASSING!=='undefined'?SPAN_MASSING:null;if(!D||!D.site)return null;const Fm=D.site,M=Fm.M,n=Fm.n,t=Fm.t,u0=Fm.u0;
 const W=(u,v)=>[M[0]+(u-u0)*n[0]+v*t[0],M[1]+(u-u0)*n[1]+v*t[1]],grp=new THREE.Group();grp.name='Span massing (frozen preview)';
 const mats={};const mat=(by,state)=>{const k=by+'|'+state;if(mats[k])return mats[k];let c=by==='dalab'?0xb04a3a:by==='ancient'?0xb8b4aa:0xc8b48a;
  const C=new THREE.Color(c);if(/ruin|topple|fallen/.test(state||''))C.multiplyScalar(.7);return mats[k]=new THREE.MeshLambertMaterial({color:C});};
 const rot=Math.atan2(n[0],n[1]);let count=0,centre=null;
 for(const p of D.parts){const S=p.shape;if(!S)continue;let geo,cu,cv;
  if(S[0]==='box'){const lu=Math.max(1,S[2]-S[1]),lv=Math.max(1,S[4]-S[3]);geo=new THREE.BoxGeometry(lv,Math.max(1,p.h),lu);cu=(S[1]+S[2])/2;cv=(S[3]+S[4])/2;}
  else if(S[0]==='circ'){geo=new THREE.CylinderGeometry(S[3],S[3],Math.max(1,p.h),24);cu=S[1];cv=S[2];}else continue;
  const c=W(cu,cv),base=tableTop(c[0],c[1])+(p.y||0),m=new THREE.Mesh(geo,mat(p.by,p.state));
  m.position.set(c[0],base+Math.max(1,p.h)/2,c[1]);m.rotation.y=rot;m.userData.probeSkip=true;m.userData.inspectLabel='Span massing ('+D.rev+'): '+p.name+' ['+p.kind+']';grp.add(m);count++;
  if(p.kind==='cross')centre=[c[0],base,c[1]];}
 scene.add(grp);const cc=centre||W(-520,0).concat([0]);const cx=centre?centre[0]:cc[0],cz=centre?centre[2]:cc[1];
 return{group:grp,count,view:[cx+380,tableTop(cx,cz)+260,cz+380,cx,tableTop(cx,cz)-80,cz]};})();
