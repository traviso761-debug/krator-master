// ---------- Chernobyl: smaller things ----------
//   1986       the 1986 button reloads the page as Pripyat was on the morning of 26 April (#year=1986; main.js's
//              configure takes the forest out of the town and puts its people and traffic back, and unit 4 stands
//              whole); Today goes back
//   channels   the plant's inlet and outlet channels (C.details.channels: their mapped names) stand some 8 m over the
//              river, as the cooling pond does; the engine draws water at the river's level, under their ground, so
//              each gets its own surface here, at the ground inside it plus `over`
//   catfish    the giant catfish of the plant's inlet channel (C.details.catfish: where, how many), a couple of
//              metres long, turning slowly under the surface where the visitors feed them from the bridge
//   Kopachi    the village buried in 1986 to keep its dust down (C.details.kopachi): its houses are grassed mounds,
//              each with its yellow trefoil sign; the kindergarten, of brick, was left standing (it is mapped)
// Nothing here is in the layout fingerprint.
export function details(api){
  const {THREE,C,P,groundH,inWater,scene,animHooks}=api;const K=C.details||{};
  const year=/(^|[#&])year=1986/.test(location.hash);
  const hash=(a,b)=>{const s=Math.sin(a*12.9898+b*78.233)*43758.5453;return s-Math.floor(s);};
  const tag=o=>{o.traverse(q=>{q.userData.noFingerprint=true;});return o;};
  // ---- the year ----
  api.onUI&&api.onUI(({ui,mkBtn})=>{const b=mkBtn(year?'Today':'1986',ui,()=>{const h=location.hash.replace(/(^#?|&)year=1986/,'').replace(/^#&/,'#');
      location.hash=year?h:(h&&h!=='#'?h+'&':'#')+'year=1986';location.reload();});
    b.title=year?'Back to the Zone today':'Pripyat on the morning of 26 April 1986: its people, its traffic, no forest in its streets';});
  // ---- the channels' water ----
  const CH=K.channels,CF=K.catfish;let chanY=null;
  if(CH&&api.OSM){const mat=new THREE.MeshLambertMaterial({color:C.lakeColour||C.waterColour||0x3a5a62,transparent:true,opacity:0.72,side:THREE.DoubleSide,depthWrite:false});
    for(const w of api.OSM.water||[]){if(!(CH.names||[]).includes(w.n))continue;const o=w.o,ring=[];for(let i=0;i<o.length;i+=2)ring.push(new THREE.Vector2(o[i]/10,o[i+1]/10));
      let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const p of ring){x0=Math.min(x0,p.x);x1=Math.max(x1,p.x);z0=Math.min(z0,p.y);z1=Math.max(z1,p.y);}
      const hs=[];for(let x=x0;x<x1;x+=8)for(let z=z0;z<z1;z+=8)if(inPolyXZ(ring,x,z))hs.push(groundH(x,z));hs.sort((a,b)=>a-b);if(!hs.length)continue;
      const y=hs[Math.floor(hs.length*0.9)]+(CH.over==null?0.4:CH.over);
      const m=new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(ring)).rotateX(Math.PI/2),mat);m.position.y=y;m.renderOrder=2;tag(m);scene.add(m);
      if(CF&&inPolyXZ(ring,...P(CF.at)))chanY=y;}}
  function inPolyXZ(ring,x,z){let c=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a.y>z)!==(b.y>z)&&x<(b.x-a.x)*(z-a.y)/(b.y-a.y)+a.x)c=!c;}return c;}
  // ---- the catfish ----
  if(CF&&!year){const [ax,az]=P(CF.at),fish=[],m=new THREE.MeshLambertMaterial({color:0x4a4a3e}),belly=new THREE.MeshLambertMaterial({color:0x8a8670});
    let wy=null;
    wy=chanY!=null?chanY:api.ctx.waterLevel||0.05;
    for(let i=0,tries=0;i<(CF.n||7)&&tries<400;tries++){const x=ax+(hash(tries,1)-0.5)*(CF.r||120)*2,z=az+(hash(tries,2)-0.5)*(CF.r||120)*2;if(chanY==null&&!inWater(x,z))continue;
      const g=new THREE.Group(),L=1.6+hash(i,3)*1.0;
      const body=new THREE.Mesh(new THREE.SphereGeometry(0.5,12,8).scale(0.55,0.4,L),m);body.position.z=0;g.add(body);
      const b2=new THREE.Mesh(new THREE.SphereGeometry(0.48,10,6).scale(0.5,0.25,L*0.9),belly);b2.position.y=-0.08;g.add(b2);
      const tail=new THREE.Mesh(new THREE.BoxGeometry(0.04,0.35,0.5),m);tail.position.z=-L*0.55;g.add(tail);
      for(const s of [-1,1]){const w=new THREE.Mesh(new THREE.CylinderGeometry(0.01,0.012,0.6,4),m);w.rotation.set(Math.PI/2.4,0,s*0.6);w.position.set(s*0.18,0,L*0.5);g.add(w);}
      tag(g);scene.add(g);fish.push({g,x,z,r:4+hash(i,4)*8,ph:hash(i,5)*6.28,sp:0.05+hash(i,6)*0.06,tail});i++;}
    animHooks.push(now=>{const t=now/1000;for(const f of fish){const a=f.ph+t*f.sp;f.g.position.set(f.x+Math.cos(a)*f.r,(wy==null?0:wy)-0.35-0.15*Math.sin(t*0.3+f.ph),f.z+Math.sin(a)*f.r);
      f.g.rotation.y=-a;f.tail.rotation.y=Math.sin(t*2.5+f.ph)*0.4;}});
    api.ctx.details=Object.assign(api.ctx.details||{},{catfish:fish.length});}
  // ---- Kopachi ----
  const KO=K.kopachi;
  if(KO&&!year){const [kx,kz]=P(KO.at),R=KO.r||420,grass=new THREE.MeshLambertMaterial({color:0x6a7a3a}),post=new THREE.MeshLambertMaterial({color:0x5a5a52});
    const signTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.fillStyle='#e8c820';g.beginPath();g.moveTo(32,4);g.lineTo(62,58);g.lineTo(2,58);g.closePath();g.fill();
      g.strokeStyle='#1a1a1a';g.lineWidth=3;g.stroke();g.fillStyle='#1a1a1a';g.beginPath();g.arc(32,40,4,0,7);g.fill();
      for(let k=0;k<3;k++){const a=-Math.PI/2+k*Math.PI*2/3;g.beginPath();g.moveTo(32,40);g.arc(32,40,14,a-0.5,a+0.5);g.closePath();g.fill();}return new THREE.CanvasTexture(c);})();
    const sign=new THREE.MeshBasicMaterial({map:signTex,transparent:true,side:THREE.DoubleSide});
    // the houses stood along the village's streets: a mound each side of them, every 30 m or so
    const spots=[];for(const r of api.ROADS||[]){const p=r.pts;if(!p||!p.some(([x,z])=>Math.hypot(x-kx,z-kz)<R+200))continue;for(let i=1;i<p.length;i++){const [ax,az]=p[i-1],[bx,bz]=p[i],l=Math.hypot(bx-ax,bz-az);
      for(let s=10;s<l;s+=30)for(const side of [-1,1]){const u=s/l,x=ax+(bx-ax)*u+(-(bz-az)/l)*side*16,z=az+(bz-az)*u+((bx-ax)/l)*side*16;
        if(Math.hypot(x-kx,z-kz)<R&&!inWater(x,z)&&!(api.buildingsAt&&api.buildingsAt(x,z,8).length)&&spots.every(([qx,qz])=>Math.hypot(qx-x,qz-z)>18))spots.push([x,z,Math.atan2(bx-ax,bz-az)]);}}}
    const g=new THREE.Group(),mound=new THREE.SphereGeometry(1,14,6,0,Math.PI*2,0,Math.PI/2);
    for(const [x,z,hd] of spots.slice(0,KO.max||60)){const h=groundH(x,z),mm=new THREE.Mesh(mound,grass);mm.scale.set(5+hash(x,z)*2,2.8+hash(z,x)*1.4,6.5+hash(x,1)*2);mm.position.set(x,h-0.3,z);mm.rotation.y=hd;g.add(mm);
      const p=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,1.6,5),post);const sx=x+Math.sin(hd)*7.5,sz=z+Math.cos(hd)*7.5;p.position.set(sx,groundH(sx,sz)+0.8,sz);g.add(p);
      const s=new THREE.Mesh(new THREE.PlaneGeometry(0.6,0.6),sign);s.position.set(sx,groundH(sx,sz)+1.7,sz);s.rotation.y=hd;g.add(s);}
    tag(g);scene.add(g);api.ctx.details=Object.assign(api.ctx.details||{},{kopachiMounds:Math.min(spots.length,KO.max||60)});}
}
