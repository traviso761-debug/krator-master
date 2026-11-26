// ================================================================= HOST — the galvanic chimneys (the owner's name, 2026-11-17; "Chimney" for short): relict black smokers (station 2, the Deep; PLAN.md section 4, item 1 and section 12)
// The chimneys that stood on the vent field while it lay under the sea: sulfide spires (pyrite, chalcopyrite, sphalerite, anhydrite) 3-12 m tall, their
// flanges and their orifices, now dead and standing in the air on the Deep's rim and in its shallows, rusted where the air has had them, black where a face
// has broken, a brassy chalcopyrite lining at the mouth. Mineral, not life: drawn here as the site's records (GALV_SITES.deep.smokers), each REGISTERED
// before it is drawn and seated on the lowest ground of its foot (its rotated extent: a leaning spire's foot is a tilted disc). The battery's life crowds
// their feet (60: o.spires). One merged mesh, vertex colours, no emissive. A site without `smokers` draws none (CHIMNEYS null).
const CHIMNEYS=SITE.smokers?(function(){const W=4405,u=(i,k)=>KRAND.unit(KRAND.hash(W,i,k,0x5c));
 const out=[],pos=[],col=[],idx=[],C=new THREE.Color(),K=h=>new THREE.Color(h),SUL=K(0x26211d),RUST=K(0x7a3a1c),OCH=K(0xa8622a),BRASS=K(0x8e7a3c),ANH=K(0xc9c0ae);
 SITE.smokers.forEach((c,i)=>{const x=c[0],z=c[1],h=c[2],r=c[3],lean=.1*u(i,1),la=u(i,2)*TAU,tx=Math.sin(lean)*Math.cos(la),tz=Math.sin(lean)*Math.sin(la);
  // the foot: the lowest ground under the foot's disc (r x 1.25, rotated by the lean), sunk 0.3 m, so no edge of it hangs in the air
  let lo=terrainH(x,z);for(let k=0;k<12;k++){const a=k/12*TAU;for(const f of [.6,1.25]){lo=Math.min(lo,terrainH(x+Math.cos(a)*r*f,z+Math.sin(a)*r*f)-Math.abs(Math.cos(a-la))*r*f*Math.sin(lean));}}
  const y0=lo-.3,rec={i,x,z,y0,h,r,lean,la,name:'A galvanic chimney ('+h.toFixed(1)+' m, a relict black smoker: pyrite, chalcopyrite and sphalerite under a rust skin; dead since the sea fell)'};
  REGISTER({name:rec.name,kind:'chimney',x,z,y:y0,r:r*1.6+h*Math.sin(lean),h:h+1,tags:{geology:{minerals:['pyrite','chalcopyrite','sphalerite','anhydrite'],relict:true,from:'the vent field under the sea'},
   hazard:{kind:'fall',danger:.15}}});
  OBSTACLES.push({x,z,r:r*1.3});out.push(rec);
  // the spire: rings up its height, the radius tapering to ~40% with two or three flanges (the ledges a chimney grows as its fluid ponds), an
  // irregular section, an open mouth with a brass lining going down into it
  const NS=10,NR=Math.max(8,Math.round(h*2)),fl=[.25+.2*u(i,3),.5+.2*u(i,4),u(i,5)<.5?.8:-1],b=pos.length/3;
  for(let j=0;j<=NR+2;j++){const top=j>NR,t=top?1:j/NR,yy=(j===NR+2?h-.45:h*t);
   let rr=r*(1-.6*Math.pow(t,.8))*(1+.12*Math.sin(t*17+i));for(const f of fl)if(f>0)rr*=1+.55*Math.max(0,1-Math.abs(t-f)*h/.35);
   if(j===NR+1)rr*=.62;if(j===NR+2)rr*=.5;
   for(let k=0;k<NS;k++){const a=k/NS*TAU,w=1+.18*Math.sin(a*3+i*1.7)+.1*Math.sin(a*5+t*9),px=Math.cos(a)*rr*w,pz=Math.sin(a)*rr*w;
    pos.push(x+px+tx*yy,y0+yy,z+pz+tz*yy);
    const rust=smooth(.05,.6,t)*(.55+.45*Math.sin(a*2+i+t*7)),brk=Math.sin(a*4+t*13+i*2.3)>.82?1:0;
    C.copy(SUL).lerp(RUST,rust*(1-brk)).lerp(OCH,Math.max(0,Math.sin(a*6+t*21+i))*.35*t*(1-brk));
    if(t<.12)C.lerp(ANH,.25*(1-t/.12)*(.5+.5*Math.sin(a*5+i)));if(j>NR)C.copy(j===NR+2?SUL:BRASS);
    C.convertSRGBToLinear();col.push(C.r,C.g,C.b);}}   /* the palette is sRGB hex; vertex colours are linear */
  for(let j=0;j<NR+2;j++)for(let k=0;k<NS;k++){const a=b+j*NS+k,b2=b+j*NS+(k+1)%NS,c2=a+NS,d=b2+NS;idx.push(a,c2,b2,b2,c2,d);}});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
 g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.86,metalness:.05}));m.name='galvanic chimneys';
 m.userData.host=true;m.userData.inspectLabel='A galvanic chimney (a relict black smoker)';m.castShadow=m.receiveShadow=true;scene.add(m);
 out.mesh=m;out.tris=idx.length/3;return out;})():null;
window._chimneys=CHIMNEYS?{n:CHIMNEYS.length,tris:CHIMNEYS.tris}:null;
