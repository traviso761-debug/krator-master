// ================================================================= HOST — the hanging-garden arcade (a test structure)
// A ruined two-storey sandstone arcade on the Zion canyon's floor, south of the river, so the kit's dressing pass
// (EBADLANDS.dress, 65-dress) has what a hanging garden needs: a terrace slab cantilevered out over the arcade (its
// soffit drips: the seep line), a pergola of open beams on the upper storey (edges for the grape to drape), and a
// stepped seep wall behind (ledges every metre and a half). Built here in plain three.js and handed over as merged
// geometries; the kit samples their faces itself. Host-only: no plant is placed in this file. It stands in for any
// world's building: a culture's kit would hand over its own shells the same way.
const ARCADE={x:-250,dz:52,len:26,dep:9,h1:6.5,h2:5};
function buildArcade(){
 const A=ARCADE,X=A.x,Z=zR(X)+A.dz,ry=Math.atan2(zR(X+1)-zR(X-1),2);   // the arcade runs along the river
 const cx=Math.cos(ry),sz=Math.sin(ry),W=(u,v)=>[X+u*cx-v*sz,Z+u*sz+v*cx];  // local (u along, v across: +v away from the river)
 let y0=1e9;for(let u=-A.len/2-4;u<=A.len/2+4;u+=2)for(let v=-A.dep/2-4;v<=A.dep/2+6;v+=2){const p=W(u,v);y0=Math.min(y0,terrainH(p[0],p[1]));}
 const stone=[],beams=[];
 // a box in local coordinates (centre u,v; base y; sizes along u, up, along v; a tilt about the run for the ruin)
 const box=(list,u,v,y,lu,h,lv,tilt)=>{const g=new THREE.BoxGeometry(lu,h,lv);if(tilt)g.rotateZ(tilt);g.translate(0,h/2,0);g.rotateY(-ry);const p=W(u,v);g.translate(p[0],y,p[1]);list.push(g);};
 const NB=6,bay=A.len/NB,yF=y0+A.h1,yT=yF+A.h2;
 // the ground storey: two rows of piers, a lintel course over each row, the floor slab of the storey above
 for(let i=0;i<=NB;i++){const u=-A.len/2+i*bay;for(const v of [-A.dep/2,A.dep/2])box(stone,u,v,y0-2,1.3,A.h1+2,1.3);}
 for(const v of [-A.dep/2,A.dep/2])box(stone,0,v,yF-1.1,A.len+1.3,1.1,1.5);
 box(stone,0,-1.2,yF,A.len+1.3,.7,A.dep+3.6);                          // the terrace: 2.4 m cantilevered out toward the river
 box(stone,0,-A.dep/2-2.35,yF+.7,A.len+1.3,.9,.4);                      // its parapet lip (a ledge to drip off)
 // the upper storey: the back row of piers stands, the front row is broken; the pergola beams over half its length
 for(let i=0;i<=NB;i++){const u=-A.len/2+i*bay;box(stone,u,A.dep/2,yF+.7,1.1,A.h2,1.1);if(i%2===0||i===NB)box(stone,u,-A.dep/2+.4,yF+.7,1.1,A.h2*(i%4?.45:1),1.1);}
 box(stone,0,A.dep/2,yT+.6,A.len+1.1,.8,1.2);
 for(let i=0;i<=NB*2;i++){const u=-A.len/2+i*bay/2;if(u>A.len*.15)continue;box(beams,u,0,yT+.4,.35,.35,A.dep+1.5,(i%5===3)?.12:0);}   // cross beams
 for(const v of [-A.dep/2+.4,0])box(beams,-A.len*.18,v,yT+.75,A.len*.66,.3,.3);                                                             // runners
 // the seep wall behind: four courses stepping back 0.6 m each, a ledge at every course (the hanging garden's face)
 for(let k=0;k<4;k++)box(stone,0,A.dep/2+3+k*.6,y0-1.5,A.len+8,1.5+(k+1)*1.6+1.5,1.2);
 // fallen blocks and a toppled pier
 for(let i=0;i<9;i++){const u=rr(-A.len/2-4,A.len/2+4),v=rr(-A.dep/2-6,-A.dep/2-1.5),p=W(u,v);box(stone,u,v,terrainH(p[0],p[1])-.4,rr(.8,1.8),rr(.6,1.2),rr(.8,1.6),rr(-.3,.3));}
 box(stone,A.len/2+3,-A.dep/2-4,y0+.2,1.3,1.3,5.5,.08);
 // merge per material: a pale cross-bedded sandstone and a dark weathered timber, world-space uv
 const TEXS=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,b=.94+.08*Math.sin(y*.21+fbm(x/40,y/40,7.1,2)*6),v=(176+(fbm(x/16,y/16,3.1,3)-.5)*56+(fbm(x/3,y/3,9,1)-.5)*20)*b;d[i]=v;d[i+1]=v*.86;d[i+2]=v*.72;d[i+3]=255;}g.putImageData(id,0,0);});
 const TEXB=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=110+(fbm(x/30,y/3,4.4,3)-.5)*70;d[i]=v*.8;d[i+1]=v*.7;d[i+2]=v*.58;d[i+3]=255;}g.putImageData(id,0,0);});
 const merge=(list,mat,label)=>{const pos=[],nor=[],uv=[];
  list.forEach(g=>{const ng=g.toNonIndexed(),p=ng.attributes.position.array,n=ng.attributes.normal.array;
   for(let i=0;i<p.length;i+=3){pos.push(p[i],p[i+1],p[i+2]);nor.push(n[i],n[i+1],n[i+2]);const ax=Math.abs(n[i]),ay=Math.abs(n[i+1]);
    uv.push(ay>.7?p[i]/3:(ax>.7?p[i+2]/3:p[i]/3),ay>.7?p[i+2]/3:p[i+1]/3);}});
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  const m=new THREE.Mesh(geo,mat);m.userData.inspectLabel=label;m.userData.host=true;scene.add(m);return geo;};
 const gS=merge(stone,new THREE.MeshLambertMaterial({map:TEXS,color:0xd8c0a8}),'The hanging-garden arcade (test structure): sandstone');
 const gB=merge(beams,new THREE.MeshLambertMaterial({map:TEXB,color:0x8a7460}),'The hanging-garden arcade: pergola timbers');
 const c=W(0,1.5);ARCADE.cx=c[0];ARCADE.cz=c[1];ARCADE.y0=y0;ARCADE.top=yT+1.2;ARCADE.ry=ry;ARCADE.W=W;
 OBSTACLES.push({x:c[0],z:c[1],r:A.len/2+6,y0:y0-5,y1:yT+12});
 REGISTER({name:'The hanging-garden arcade (test structure, ruined)',x:c[0],z:c[1],y:y0-2,r:A.len/2+5,h:yT-y0+4});
 return [gS,gB];}
