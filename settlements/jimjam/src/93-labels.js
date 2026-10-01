// ---------------------------------------------------------------- floating building labels (standard new-world package)
// One label per registered volume (REG), drawn once into a texture atlas and rendered as ONE mesh of camera-facing
// quads: a thousand labels cost one draw call. Labels keep a constant size on screen (150 px; landmarks 260 px)
// and fade out past 300 m, landmarks never. Toggled with the Labels button (they live in the LABELS group).
// A world that already made LABELS (the city) gets the atlas added to it; one that did not gets the group made here.
const LABEL_ATLAS={W:4096,H:4096,cw:409,ch:48};
function labelsBuild(){
 if(!LABELS){LABELS=new THREE.Group();LABELS.visible=false;LABELS.userData.probeSkip=true;scene.add(LABELS);}
 const cols=Math.floor(LABEL_ATLAS.W/LABEL_ATLAS.cw),rows=Math.floor(LABEL_ATLAS.H/LABEL_ATLAS.ch),max=cols*rows;   // whole cells: 4096/409 is not an integer, and a fractional column count misaddressed every label past the first row
 // which volumes get a label: buildings, farms and furniture; not repeated wall segments (a name seen 8+ times)
 const count={};for(const r of REG)count[r.name]=(count[r.name]||0)+1;
 let list=REG.filter(r=>r.name&&count[r.name]<8&&(!r.cls||r.cls==='building'||r.cls==='farm'||r.cls==='furniture')&&!(r.tags&&r.tags.part==='wall'));
 const isBig=r=>!!(r.tags&&(r.tags.role||r.tags.landmark));
 list.sort((a,b)=>(isBig(b)-isBig(a))||(b.r-a.r));if(list.length>max)list=list.slice(0,max);
 const cv=document.createElement('canvas');cv.width=LABEL_ATLAS.W;cv.height=LABEL_ATLAS.H;const g=cv.getContext('2d');g.clearRect(0,0,cv.width,cv.height);
 const pos=[],apos=[],uv=[],cell=[],big=[],idx=[];
 list.forEach((r,i)=>{const cx=(i%cols)*LABEL_ATLAS.cw,cy=Math.floor(i/cols)*LABEL_ATLAS.ch;const B=isBig(r);
  g.fillStyle=B?'rgba(20,12,6,.72)':'rgba(0,0,0,.55)';g.fillRect(cx+1,cy+1,LABEL_ATLAS.cw-2,LABEL_ATLAS.ch-2);
  g.font=(B?'bold 34px':'bold 28px')+' system-ui,sans-serif';g.fillStyle=B?'#ffe2b0':'#f4e8d4';g.textAlign='center';g.textBaseline='middle';
  let t=r.name;while(g.measureText(t).width>LABEL_ATLAS.cw-10&&t.length>4)t=t.slice(0,-2);if(t!==r.name)t=t.slice(0,-1)+'…';g.fillText(t,cx+LABEL_ATLAS.cw/2,cy+LABEL_ATLAS.ch/2+1);
  const y=(r.y||0)+r.h+3,b=i*4;
  for(const c of[[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]]){pos.push(c[0],c[1],0);apos.push(r.x,y,r.z);uv.push((cx+(c[0]+.5)*LABEL_ATLAS.cw)/LABEL_ATLAS.W,1-(cy+(0.5-c[1])*LABEL_ATLAS.ch)/LABEL_ATLAS.H);cell.push(0,0);big.push(B?1:0);}
  idx.push(b,b+1,b+2,b,b+2,b+3);});
 if(!list.length)return null;
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('aPos',new THREE.Float32BufferAttribute(apos,3));
 geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setAttribute('aBig',new THREE.Float32BufferAttribute(big,1));geo.setIndex(idx);
 // the uv above already addresses the cell, so the shader only flips nothing: cell offsets are baked in
 const tex=new THREE.CanvasTexture(cv);tex.minFilter=THREE.LinearFilter;tex.generateMipmaps=false;
 const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,fog:false,
  uniforms:{map:{value:tex},uPxToWorld:{value:1}},
  vertexShader:`attribute vec3 aPos;attribute float aBig;uniform float uPxToWorld;varying vec2 vUv;varying float vA;
   void main(){vec4 mv=modelViewMatrix*vec4(aPos,1.0);float dist=-mv.z;float w=aBig>0.5?240.0:170.0;float k=dist*uPxToWorld;
    mv.xy+=position.xy*vec2(w*k,w*k*48.0/409.0);vA=aBig>0.5?1.0:(1.0-smoothstep(320.0,560.0,dist));vUv=uv;gl_Position=projectionMatrix*mv;}`,
  fragmentShader:`uniform sampler2D map;varying vec2 vUv;varying float vA;void main(){vec4 c=texture2D(map,vUv);c.a*=vA;if(c.a<0.02)discard;gl_FragColor=c;}`});
 const m=new THREE.Mesh(geo,mat);m.frustumCulled=false;m.userData.probeSkip=true;m.name='labels';m.renderOrder=10;LABELS.add(m);
 FRAME_HOOKS.push(()=>{mat.uniforms.uPxToWorld.value=2*Math.tan(camera.fov*Math.PI/360)/innerHeight;});
 window._labels=list.length;return m;}
labelsBuild();
