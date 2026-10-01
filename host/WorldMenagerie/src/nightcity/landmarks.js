// Night City's landmark: the corporate ziggurat, a truncated mountain of terraces with a temple on the
// plateau. Nowhere else on the site has one, so it travels with this page rather than with the shared engine;
// src/nightcity/main.js hands it to build() as ctx.models.

// Each of these is handed (L,x,z) exactly as one of the engine's own models is: L is the landmark's entry in the
// city file, x and z are where it stands. Everything they draw with comes out of the engine's api.
export function landmarks(api){
  const {THREE,animHooks,scene,nightF,hour,box,group,gh,mergeParts}=api;
  return {
  ziggurat(L,x,z){
    // The corporate pyramid. A truncated mountain of terraces, every face channelled top to bottom with
    // ribs so the slope reads at ten kilometres, the only windows a knocked-out row in each recess, and a
    // temple on the plateau where the man who owns it lives. Built in its own frame and merged: the ribs
    // alone come to a couple of thousand boxes and none of them needs to be its own draw.
    const H=L.height||700,g0=gh(x,z),base=L.base||620,T=L.tiers||26,A=L.turn||0.3,D=0.86;
    const shell=new THREE.MeshPhongMaterial({color:0x33353b,specular:0x1a1d22,shininess:6,flatShading:true});
    const dark=new THREE.MeshPhongMaterial({color:0x22242a,specular:0x101216,shininess:5,flatShading:true});
    const winM=new THREE.MeshBasicMaterial({color:0xffc169,transparent:true,opacity:0.8});
    const hull=[],rib=[],lit=[],hh=H/T;
    const wAt=t=>base*(1-0.80*Math.pow(t,1.06));        // truncated: the top is still a fifth of the foot
    const RIBS=Math.max(10,Math.round(base/34));        // channels per face, the same count all the way up
    for(let k=0;k<T;k++){
      const t=k/T,w=wAt(t),wn=wAt((k+1)/T),y=H*t;
      // the mass of the tier, then the lip that overhangs it and throws the terrace into shadow
      hull.push(box(0,y,0,w*0.985,hh,w*D*0.985,k%2?shell:dark));
      hull.push(box(0,y+hh-2.6,0,w*1.02,2.6,w*D*1.02,dark));
      // the channels: a rib to every bay, on all four faces, set proud of the tier below it
      for(let f=0;f<4;f++){
        const along=f%2?w:w*D,across=f%2?w*D:w,sd=f<2?1:-1;
        const step=along/RIBS;
        for(let i=0;i<RIBS;i++){
          const u=-along/2+step*(i+0.5),rw=step*0.46;
          const rx=f%2?u:sd*across/2,rz=f%2?sd*across/2:u;
          const r=f%2?box(rx,y,rz,rw,hh,10,shell):box(rx,y,rz,10,hh,rw,shell);
          rib.push(r);}
        // The lit band behind them runs the whole face in one piece; the ribs standing proud of it are what
        // chop it into bays, so it reads as a wall of windows from ten kilometres and as separate rooms from
        // the street, at the cost of one box a face instead of one a window.
        if(k<T-1){const ly=y+hh*0.26,lw=along*0.97,o=sd*(across/2+1.8);
          lit.push(f%2?box(0,ly,o,lw,hh*0.46,1.2,winM):box(o,ly,0,1.2,hh*0.46,lw,winM));}}
      // at the outer corners of every third terrace, the floods that wash the face above
      if(k%3===1)for(let c=0;c<4;c++){const cx=(c<2?1:-1)*w*0.47,cz=(c%2?1:-1)*w*D*0.47;
        lit.push(box(cx,y+hh-4,cz,3,2.4,3,winM));}
      if(wn<=0)break;}
    const parts=[];
    for(const [set,mat] of [[hull.filter(m=>m.material===shell),shell],[hull.filter(m=>m.material===dark),dark],
                            [rib,shell],[lit,winM]]){
      if(!set.length)continue;const m=mergeParts(set,mat);m.position.set(x,g0,z);m.rotation.y=A;parts.push(m);}
    // ---- the plateau ----
    const wT=wAt(1),cap=[];
    cap.push(box(0,H,0,wT,4,wT*D,dark));
    // the temple: a stepped house set back on the deck, with its clerestory lit all night
    const tw=wT*0.5;
    cap.push(box(0,H+4,0,tw,H*0.05,tw*D,shell),box(0,H+4+H*0.05,0,tw*0.7,H*0.035,tw*D*0.7,dark));
    for(const m of cap){m.position.x+=0;}
    const capMesh=mergeParts(cap.filter(m=>m.material===dark),dark),capMesh2=mergeParts(cap.filter(m=>m.material===shell),shell);
    for(const m of [capMesh,capMesh2]){m.position.set(x,g0,z);m.rotation.y=A;parts.push(m);}
    const cler=box(x,g0+H+4+H*0.049,z,tw*1.01,H*0.008,tw*D*1.01,winM);cler.rotation.y=A;parts.push(cler);
    // ---- the landing decks, cantilevered off the slope where the spinners come in ----
    const decks=[];
    for(let d=0;d<6;d++){
      const t=0.34+d*0.11,w=wAt(t),a=A+(d%2?0:Math.PI)+(d<3?0.18:-0.18);
      const dx=x+Math.cos(a)*w*0.52,dz=z+Math.sin(a)*w*0.52,dy=g0+H*t+hh*0.6;
      const pad=box(dx,dy,dz,wT*0.34,2.2,wT*0.24,dark);pad.rotation.y=-a;parts.push(pad);
      for(let e=0;e<4;e++){const ea=-a+e/4*Math.PI*2;
        decks.push(box(dx+Math.cos(ea)*wT*0.15,dy+2.2,dz+Math.sin(ea)*wT*0.11,1.6,1.6,1.6,winM));}}
    if(decks.length)parts.push(mergeParts(decks,winM));
    // ---- masts and the beacons that keep the traffic off it ----
    for(const sd of [-1,1])parts.push(box(x+sd*tw*0.34,g0+H+4+H*0.085,z,4,H*0.07,4,dark));
    const g=group(L,parts);
    const beacons=[];
    for(let k=0;k<6;k++){const a=A+k/6*Math.PI*2+0.4,rr=k<2?tw*0.36:wT*0.5;
      const b=new THREE.Mesh(new THREE.SphereGeometry(3.4,8,6),new THREE.MeshBasicMaterial({color:0xff3020}));
      b.position.set(x+Math.cos(a)*rr,g0+H+(k<2?4+H*0.16:8),z+Math.sin(a)*rr);scene.add(b);beacons.push(b);}
    animHooks.push(now=>{const n=nightF(hour());winM.opacity=0.25+0.72*n;
      for(let i=0;i<beacons.length;i++)beacons[i].visible=((now+i*300)%2400)<1200;});
    return g;},
  };
}
