// ---------- crags: the rock showing through the turf where the ground is steep ----------
// The Castle Rock's cliffs, the Salisbury Crags and the scarps of Arthur's Seat and Calton Hill are basalt and
// dolerite, black-brown with lichen, standing out of the grass in ledges and blocks. The ground is smooth wherever
// the elevation is, so this sets an outcrop - a squat, faceted block, half buried, turned and tilted - on every
// grid point steeper than C.crags.slope, more of them the steeper it is, within C.crags.zones ([lat, lon, radius]).
export function crags(api){
  const {THREE,C,scene,groundH}=api;const K=C.crags;if(!K)return;
  const SL=K.slope||0.7,STEP=K.step||7;let seed=31;const R=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  const geo=new THREE.DodecahedronGeometry(1,0),list=[];
  for(const [la,lo,rad] of K.zones||[]){const [cx,cz]=api.P([la,lo]);
    for(let x=cx-rad;x<=cx+rad;x+=STEP)for(let z=cz-rad;z<=cz+rad;z+=STEP){if((x-cx)**2+(z-cz)**2>rad*rad)continue;
      const jx=x+(R()-0.5)*STEP,jz=z+(R()-0.5)*STEP,h=groundH(jx,jz),gx=(groundH(jx+2,jz)-groundH(jx-2,jz))/4,gz=(groundH(jx,jz+2)-groundH(jx,jz-2))/4,s=Math.hypot(gx,gz);
      if(s<SL)continue;const n=Math.min(3,Math.floor((s-SL)*3)+1);
      for(let k=0;k<n;k++){const ox=(R()-0.5)*STEP,oz=(R()-0.5)*STEP,y=groundH(jx+ox,jz+oz),sz=2+R()*3.5*Math.min(2,s);
        list.push([jx+ox,y-sz*0.35,jz+oz,sz*(0.8+R()*0.6),sz*(0.5+R()*0.5),sz*(0.8+R()*0.6),R()*6.28,(R()-0.5)*0.5,Math.atan2(gz,gx)]);}}}
  const im=new THREE.InstancedMesh(geo,new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true}),Math.max(1,list.length)),o=new THREE.Object3D(),col=new THREE.Color();
  const TONES=(K.colours||['#3e3a36','#4a4540','#34302c','#56504a','#4a4e40']).map(c=>new THREE.Color(c));
  list.forEach(([x,y,z,sx,sy,sz,ry,tilt],i)=>{o.position.set(x,y,z);o.rotation.set(tilt,ry,tilt*0.6);o.scale.set(sx,sy,sz);o.updateMatrix();im.setMatrixAt(i,o.matrix);im.setColorAt(i,TONES[i%TONES.length]);});
  im.castShadow=im.receiveShadow=true;scene.add(im);
  api.ctx.details=Object.assign(api.ctx.details||{},{crags:list.length});
}
