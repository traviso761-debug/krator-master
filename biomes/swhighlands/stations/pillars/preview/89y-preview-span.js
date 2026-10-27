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
