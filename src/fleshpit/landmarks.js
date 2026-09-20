// ---------- the park's own landmarks ----------
// Almost everything on the surface is a mapped building and the engine draws it. This is the one thing that is
// not a building: the lip of the orifice itself, which is a hole, and a hole cannot be clicked on. The model
// puts the guard rail, the interpretive signs and the survey marks round the lip, which gives the card
// something to hang on and gives the rim the only thing anyone photographed it with.
//
// Fan work: Mystery Flesh Pit National Park is Trevor Roberts's project. The geometry here is this project's own.
export function landmarks(api){
  const {THREE,box,group,gh,animHooks,nightF,hour}=api;
  return {
    orifice(L,x,z){
      const R=L.rim||266,parts=[],g0=gh(x,z+R+20);
      const rail=new THREE.MeshLambertMaterial({color:0xb9b2a2}),sign=new THREE.MeshLambertMaterial({color:0x6a5c44});
      const lamp=new THREE.MeshBasicMaterial({color:0xffd9a0});
      // the rail: posts and two runs of pipe the whole way round the lip
      for(let k=0;k<96;k++){
        const a=k/96*Math.PI*2,px=x+Math.cos(a)*R,pz=z+Math.sin(a)*R,gy=gh(px,pz);
        parts.push(box(px,gy,pz,0.5,1.25,0.5,rail));
        if(k%2===0){const s=box(px,gy+1.15,pz,0.35,0.16,R*2*Math.PI/96*1.1,rail);s.rotation.y=-a;parts.push(s);}
      }
      // the interpretive signs at the three overlooks, and the lamps over them
      for(const a of [0.35,2.5,4.4]){
        const px=x+Math.cos(a)*(R+9),pz=z+Math.sin(a)*(R+9),gy=gh(px,pz);
        const panel=box(px,gy+1.1,pz,2.6,1.5,0.18,sign);panel.rotation.set(-0.5,-a,0);parts.push(panel);
        parts.push(box(px,gy,pz,0.3,1.1,0.3,rail));
        const lp=box(px,gy+3.4,pz,0.5,0.4,0.5,lamp);parts.push(lp,box(px,gy,pz,0.24,3.4,0.24,rail));
      }
      const g=group(L,parts);
      animHooks.push(()=>{const n=nightF(hour());lamp.color.setRGB(n,n*0.85,n*0.62);});
      return g;},
  };
}
