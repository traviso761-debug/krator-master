// ---------- the landmark kit: a model is parts pooled by material, built in its own frame, placed and turned as one ----
// Shared by the pages that model their own great buildings (Rome first, then Tokyo). Each page passes its own colours
// (landkit(api, {name: 0xrrggbb})) on top of the stones here; everything else - Model(), the detail that shows only near,
// columns, statues, domes, lanterns, arched panels, ellipses of bays, the fit of a bridge to its river - is the same.
import {mkRng} from './rng.js';

export function landkit(api,extraCOL={}){
  const {THREE,animHooks,group,gh,mergeParts,roofAt,riverCrossing,nightF,hour}=api;
  const V3=THREE.Vector3;
  // ---- the materials: Rome's stones ----
  const COL={travertine:0xdccfb2,travertineDark:0xbcae92,marble:0xefe9dd,brick:0xae6a45,brickDark:0x8e5134,lead:0x7d8683,tile:0xb8663e,
    dark:0x2a231e,granite:0x8e8984,graniteRed:0xa68276,stucco:0xd8a465,stuccoPale:0xe6cfa6,stuccoRose:0xd99a7c,earth:0x6e5a46,wood:0x8a6a4a,
    water:0x5fb4c0,bronze:0x5f7a62,peperino:0x9a958a,
    canvas:0xefeadf,canvasGreen:0x3c6a4a,pRed:0xc4302a,pGreen:0x4f8a36,pOrange:0xe58a26,pYellow:0xe8cf3a,pViolet:0x7a3a8a,crate:0x9a7a52,iron:0x2a2a2c,steelPale:0xa9adb0,cutFloor:0xa49e92,asphalt:0x3e3f43,earthTop:0x6f7a4c};
  Object.assign(COL,extraCOL);
  const MATS={};
  // fountain water: a deep teal over pale stone, its surface rippling - the normal tipped by a few travelling waves
  // of the world position, so the sun glints and moves on it (no texture, and the merged models carry no UVs)
  function waterMat(){const m=new THREE.MeshPhongMaterial({color:0x1d5c68,specular:0xcfe4ee,shininess:140,transparent:true,opacity:0.93}),U={value:0};
    m.onBeforeCompile=sh=>{sh.uniforms.uT=U;
      sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWp;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvWp=(modelMatrix*vec4(transformed,1.0)).xyz;');
      sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWp;uniform float uT;')
        .replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\n{vec2 p=vWp.xz;float a=sin(p.x*1.3+uT*1.7)+sin(p.y*1.9-uT*1.3)+0.6*sin((p.x+p.y)*3.1+uT*2.9),b=cos(p.y*1.5+uT*1.5)+cos(p.x*2.1-uT*1.1)+0.6*cos((p.x-p.y)*2.7-uT*2.3);normal=normalize(normal+vec3(a,0.0,b)*0.22);}');};
    animHooks.push(now=>{U.value=now/1000;});return m;}
  const mat=k=>MATS[k]||(MATS[k]=k==='gold'?new THREE.MeshPhongMaterial({color:0xcaa13c,specular:0xfff0b0,shininess:70})
    :k==='bronzeDark'?new THREE.MeshPhongMaterial({color:0x4a3c2a,specular:0x8a7a5a,shininess:30})
    :k==='water'?waterMat()
    :k==='frieze'?new THREE.MeshLambertMaterial({map:friezeTex()})
    :new THREE.MeshLambertMaterial({color:COL[k]}));
  // the Pantheon's inscription, cut in the frieze: M·AGRIPPA·L·F·COS·TERTIVM·FECIT
  let _frieze=null;function friezeTex(){if(_frieze)return _frieze;const c=document.createElement('canvas');c.width=1024;c.height=64;const g=c.getContext('2d');
    g.fillStyle='#e0d6c4';g.fillRect(0,0,1024,64);g.fillStyle='#3a3026';g.font='bold 40px Georgia,serif';g.textAlign='center';g.textBaseline='middle';
    g.fillText('M·AGRIPPA·L·F·COS·TERTIVM·FECIT',512,34);_frieze=new THREE.CanvasTexture(c);return _frieze;}
  // the bearing a front looks toward (degrees, 0 north, 90 east) as a rotation of a model built facing +z
  const turn=deg=>{const b=deg*Math.PI/180;return Math.atan2(Math.sin(b),-Math.cos(b));};

  // ---- the kit: a model is parts pooled by material, built in its own frame, placed and turned as one ----
  // Parts made inside a column, a statue, a lantern or a dome's ribs are detail: pooled apart (D), merged into their
  // own meshes, casting no shadow, and shown only near enough to see them (see the hook after the kit).
  function Model(){const B={},D={},geoCache={};let det=0;
    const put=(k,g,x=0,y=0,z=0,ry=0,rx=0,rz=0,s)=>{const m=new THREE.Mesh(g);m.position.set(x,y,z);m.rotation.set(rx,ry,rz,'YXZ');if(s)m.scale.set(s[0],s[1],s[2]);const P=det>0?D:B;(P[k]||(P[k]=[])).push(m);return m;};
    const detail=fn=>(...a)=>{det++;try{return fn(...a);}finally{det--;}};
    const cached=(key,make)=>geoCache[key]||(geoCache[key]=make());
    const M={B,put,cached,
      box(k,x,y,z,w,h,d,ry=0){return put(k,cached('b'+w+','+h+','+d,()=>new THREE.BoxGeometry(w,h,d).translate(0,h/2,0)),x,y,z,ry);},
      cyl(k,x,y,z,r0,r1,h,seg=14,ry=0){return put(k,cached('c'+r0+','+r1+','+h+','+seg,()=>new THREE.CylinderGeometry(r1,r0,h,seg).translate(0,h/2,0)),x,y,z,ry);},
      // a column: base, a shaft with a little taper, and its order's capital; H overall, r the shaft radius at the foot
      column:null,_column(k,x,y,z,H,r,order='tuscan',capK){capK=capK||k;const ch=order==='corinthian'?r*1.5:order==='ionic'?r*0.85:r*0.75,bh=r*0.55;
        M.cyl(capK,x,y,z,r*1.32,r*1.18,bh*0.5,14);M.cyl(capK,x,y+bh*0.5,z,r*1.12,r*1.02,bh*0.5,14);
        M.cyl(k,x,y+bh,z,r,r*0.86,H-bh-ch,14);
        if(order==='corinthian'){M.cyl(capK,x,y+H-ch,z,r*0.88,r*1.28,ch*0.78,14);M.box(capK,x,y+H-ch*0.22,z,r*2.7,ch*0.22,r*2.7);}
        else if(order==='ionic'){M.box(capK,x,y+H-ch,z,r*2.0,ch*0.55,r*1.9);for(const s of [-1,1])put(capK,cached('vol'+r,()=>new THREE.CylinderGeometry(r*0.42,r*0.42,r*1.9,10).rotateX(Math.PI/2)),x+s*r*1.05,y+H-ch*0.55,z);M.box(capK,x,y+H-ch*0.32,z,r*2.4,ch*0.32,r*2.4);}
        else{M.cyl(capK,x,y+H-ch,z,r*0.88,r*1.18,ch*0.55,14);M.box(capK,x,y+H-ch*0.45,z,r*2.5,ch*0.45,r*2.5);}},
      // a statue on its plinth: a draped figure, enough to read against the sky
      // a statue on its plinth: a draped figure - the robe falling to the feet, a torso and shoulders, a head, one arm
      // down and the other raised or across the chest (which, by where it stands, so a row of them is not one figure)
      statue:null,_statue(k,x,y,z,h,ry=0){const v=((Math.abs(x*7.3+z*3.1+y*1.7))%1),c=Math.cos(ry),sn=Math.sin(ry),at=(dx,dz)=>[x+dx*c+dz*sn,z-dx*sn+dz*c];
        M.box(k,x,y,z,h*0.34,h*0.12,h*0.34,ry);
        M.cyl(k,x,y+h*0.12,z,h*0.16,h*0.12,h*0.38,8,ry);                                  // the robe
        M.cyl(k,x,y+h*0.5,z,h*0.12,h*0.14,h*0.24,8,ry);                                   // the torso
        put(k,cached('shoulders',()=>new THREE.BoxGeometry(1,1,1)),x,y+h*0.73,z,ry,0,0,[h*0.34,h*0.07,h*0.17]);
        put(k,cached('head',()=>new THREE.SphereGeometry(1,8,6)),x,y+h*0.83,z,ry,0,0,[h*0.075,h*0.09,h*0.075]);
        const arm=cached('arm',()=>new THREE.BoxGeometry(1,1,1).translate(0,-0.5,0));
        {const [ax,az]=at(-h*0.17,0);put(k,arm,ax,y+h*0.74,az,ry,0,-0.12,[h*0.07,h*0.32,h*0.07]);}          // down at the side
        {const [ax,az]=at(h*0.17,0);if(v<0.5)put(k,arm,ax,y+h*0.74,az,ry,0,v<0.25?2.6:2.2,[h*0.07,h*0.34,h*0.07]);  // raised
          else put(k,arm,ax,y+h*0.74,az,ry,-0.9,0.6,[h*0.07,h*0.3,h*0.07]);}                                         // across the chest
        {const [ax,az]=at(0,h*0.07);put(k,cached('fold',()=>new THREE.BoxGeometry(1,1,1)),ax,y+h*0.4,az,ry,0,0.5,[h*0.05,h*0.36,h*0.05]);}},  // a fold of the robe
      // a river god, reclining (Bernini's, the Tiber and the Nile of the Campidoglio): the hips on the rock, one leg
      // out and one knee up, the torso leaning back on an elbow, the other arm raised; s about the length in metres/2.4
      recliner:null,_recliner(k,x,y,z,ry,s){const c=Math.cos(ry),sn=Math.sin(ry),P=(dx,dy,dz,g,rz,sc,rx=0)=>put(k,g,x+dx*c+dz*sn,y+dy,z-dx*sn+dz*c,ry,rx,rz,sc),bx=cached('rb',()=>new THREE.BoxGeometry(1,1,1)),sp=cached('head',()=>new THREE.SphereGeometry(1,8,6));
        P(0.25*s,0.2*s,0,bx,0,[1.0*s,0.36*s,0.5*s]);                     // hips and the thigh
        P(1.15*s,0.14*s,0.12*s,bx,-0.08,[0.95*s,0.24*s,0.24*s]);         // the leg out
        P(0.55*s,0.5*s,-0.17*s,bx,0.75,[0.7*s,0.24*s,0.26*s]);           // the knee up
        P(0.86*s,0.3*s,-0.17*s,bx,-0.5,[0.6*s,0.22*s,0.22*s]);           // and its shin
        P(-0.32*s,0.55*s,0,bx,-0.75,[0.42*s,0.85*s,0.5*s]);   // the torso leaning back
        P(-0.62*s,0.98*s,0,sp,0,[0.17*s,0.2*s,0.17*s]);                  // the head
        P(-0.66*s,0.84*s,0,sp,0,[0.14*s,0.16*s,0.16*s]);                 // the beard
        P(-0.62*s,0.3*s,0.27*s,bx,0.2,[0.16*s,0.55*s,0.16*s]);           // the elbow down
        P(-0.25*s,1.15*s,-0.25*s,bx,-0.5,[0.15*s,0.7*s,0.15*s]);         // the arm raised
        P(0.4*s,0.42*s,0.05*s,bx,0.1,[0.9*s,0.06*s,0.58*s]);},           // drapery over the lap
      // a horse, rearing or plunging out of the water: a barrel, a neck and head, the forelegs up
      horse:null,_horse(k,x,y,z,ry,s){const c=Math.cos(ry),sn=Math.sin(ry),P=(dx,dy,dz,g,rz,sc)=>put(k,g,x+dx*c+dz*sn,y+dy,z-dx*sn+dz*c,ry,0,rz,sc),bx=cached('rb',()=>new THREE.BoxGeometry(1,1,1)),sp=cached('head',()=>new THREE.SphereGeometry(1,8,6));
        P(0,0.9*s,0,sp,0.45,[1.0*s,0.5*s,0.45*s]);                        // the barrel, rising to the front
        P(0.75*s,1.55*s,0,bx,0.9,[0.75*s,0.3*s,0.28*s]);                  // the neck
        P(1.05*s,1.95*s,0,bx,-0.4,[0.55*s,0.22*s,0.22*s]);                // the head
        P(1.0*s,2.1*s,0,bx,0,[0.12*s,0.3*s,0.32*s]);                      // the mane
        for(const d of [-1,1]){P(0.7*s,1.0*s,d*0.18*s,bx,-1.1+d*0.25,[0.62*s,0.12*s,0.12*s]);}   // the forelegs, pawing the air
        P(-0.85*s,0.55*s,0,bx,-0.6,[0.7*s,0.16*s,0.3*s]);},               // the tail and haunch going down into the water
      // an obelisk: a tapering square shaft and its pyramidion, on a pedestal
      obelisk(k,x,y,z,H,w,pedH,pedK){pedK=pedK||'travertine';if(pedH){M.box(pedK,x,y,z,w*2.4,pedH*0.25,w*2.4);M.box(pedK,x,y+pedH*0.25,z,w*1.8,pedH*0.6,w*1.8);M.box(pedK,x,y+pedH*0.85,z,w*2.1,pedH*0.15,w*2.1);y+=pedH;}
        put(k,cached('ob'+H+','+w,()=>new THREE.CylinderGeometry(w*0.5*0.66*Math.SQRT2,w*0.5*Math.SQRT2,H*0.9,4).rotateY(Math.PI/4).translate(0,H*0.45,0)),x,y,z);
        put(k,cached('pyr'+H+','+w,()=>new THREE.ConeGeometry(w*0.5*0.66*Math.SQRT2,H*0.1,4).rotateY(Math.PI/4).translate(0,H*0.95,0)),x,y,z);
        M.cyl('bronzeDark',x,y+H,z,0.15,0.15,H*0.06,6);M.box('bronzeDark',x,y+H+H*0.04,z,H*0.035,0.15,0.15);},
      // a pediment: a low triangle of depth d, w wide and h high, its base at y
      pediment(k,x,y,z,w,h,d,ry=0){return put(k,cached('pd'+w+','+h+','+d,()=>{const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(0,h);s.lineTo(-w/2,0);return new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:false}).translate(0,0,-d/2);}),x,y,z,ry);},
      // a dome: a hemisphere scaled up to the profile, ribs over it, on a drum; returns the top
      dome(k,x,y,z,r,hs,o={}){put(k,cached('dm'+r+','+hs,()=>new THREE.SphereGeometry(r,32,14,0,Math.PI*2,0,Math.PI/2).scale(1,hs,1)),x,y,z);
        if(o.ribs){det++;const n=o.ribs;for(let i=0;i<n;i++){const a=i/n*Math.PI*2;put(o.ribK||'travertine',cached('rib'+r+','+hs,()=>{const pts=[];for(let j=0;j<=12;j++){const t=j/12*Math.PI/2;pts.push(new V3(Math.cos(t)*r*1.012,Math.sin(t)*r*hs*1.012,0));}
          return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),12,r*0.022,4,false);}),x,y,z,a);}det--;}
        return y+r*hs;},
      // a lantern: a little round temple with its cap, ball and cross
      lantern:null,_lantern(k,x,y,z,r,h,o={}){M.cyl(k,x,y,z,r,r,h*0.55,12);for(let i=0;i<8;i++){const a=i/8*Math.PI*2;M.box(k,x+Math.cos(a)*r*1.05,y,z+Math.sin(a)*r*1.05,r*0.28,h*0.55,r*0.28,-a);}
        for(let i=0;i<8;i++){const a=(i+0.5)/8*Math.PI*2;M.box('dark',x+Math.cos(a)*r*0.99,y+h*0.12,z+Math.sin(a)*r*0.99,r*0.45,h*0.32,r*0.06,-a+Math.PI/2);}
        M.cyl(k,x,y+h*0.55,z,r*1.1,r*1.1,h*0.06,12);put(o.capK||'lead',cached('lc'+r+','+h,()=>new THREE.ConeGeometry(r*1.05,h*0.3,12).translate(0,h*0.15,0)),x,y+h*0.61,z);
        put('gold',cached('ball',()=>new THREE.SphereGeometry(1,10,8)),x,y+h*0.95,z,0,0,0,[r*0.3,r*0.3,r*0.3]);M.box('gold',x,y+h*0.98,z,r*0.08,h*0.28,r*0.08);M.box('gold',x,y+h*1.14,z,r*0.42,r*0.08,r*0.08);return y+h*1.26;},
      finish(L,x,y,z,ry,extra){const parts=[],dparts=[];for(const k in B)parts.push(mergeParts(B[k],mat(k)));for(const k in D)dparts.push(mergeParts(D[k],mat(k)));
        {const d=api.ctx.details=api.ctx.details||{};let t=0;for(const p of parts)t+=p.geometry.attributes.position.count/3;d.landmarkTris=(d.landmarkTris||0)+Math.round(t);(d.landmarkBy=d.landmarkBy||{})[L.model]=((d.landmarkBy[L.model])||0)+Math.round(t);}if(extra)parts.push(...extra);const g=group(L,[...parts,...dparts]);g.position.set(x,y,z);g.rotation.y=ry;g.updateMatrixWorld(true);
        // how far the model reaches from its origin, for when to show its detail
        let r=0;for(const p of parts){p.geometry.computeBoundingSphere();const b=p.geometry.boundingSphere;r=Math.max(r,b.center.length()+b.radius);}
        for(const p of dparts)p.castShadow=false;if(dparts.length)DETAIL.push({g,meshes:dparts,r,far:L.detailFar||(260+r*2.2)});
        {const dd=api.ctx.details;dd.detailTris=(dd.detailTris||0)+Math.round(dparts.reduce((a,p)=>a+p.geometry.attributes.position.count/3,0));}
        return g;}};
    M.column=detail(M._column);M.statue=detail(M._statue);M.recliner=detail(M._recliner);M.horse=detail(M._horse);M.lantern=detail(M._lantern);
    return M;}

  const DETAIL=[];{let last=-1e9;const cam=api.camera,c=new V3();
    animHooks.push(now=>{if(now-last<250)return;last=now;for(const e of DETAIL){c.setFromMatrixPosition(e.g.matrixWorld);const v=cam.position.distanceTo(c)-e.r<e.far;if(e.meshes[0].visible!==v)for(const m of e.meshes)m.visible=v;}});}
  // where a named bridge crosses the water: only its own mapped bridge ways, the direction fitted to all their wet
  // points (the engine's riverCrossing takes the first wet segment of any road the name starts, which on a bridge
  // with a short side way can turn the arches across the river)
  function crossing(name,x,z){const rs=(api.ROADS||[]).filter(r=>r.name===name&&(r.bridge||r.deck>0));const wet=[];let w=8,y=0;
    for(const r of rs){w=Math.max(w,r.w);y=Math.max(y,r.deck||0);for(let i=0;i+1<r.pts.length;i++){const [ax,az]=r.pts[i],[bx,bz]=r.pts[i+1],L2=Math.hypot(bx-ax,bz-az);for(let u=0;u<=L2;u+=3){const px=ax+(bx-ax)*u/L2,pz=az+(bz-az)*u/L2;if(api.inWater(px,pz))wet.push([px,pz]);}}}
    if(wet.length<3)return riverCrossing(name,x,z);
    const cx=wet.reduce((s,p)=>s+p[0],0)/wet.length,cz=wet.reduce((s,p)=>s+p[1],0)/wet.length;let sxx=0,szz=0,sxz=0;for(const [px,pz] of wet){sxx+=(px-cx)**2;szz+=(pz-cz)**2;sxz+=(px-cx)*(pz-cz);}
    const a=0.5*Math.atan2(2*sxz,sxx-szz),ux=Math.cos(a),uz=Math.sin(a);let half=0;for(const [px,pz] of wet)half=Math.max(half,Math.abs((px-cx)*ux+(pz-cz)*uz));
    return {x:cx,z:cz,ux,uz,half,w:Math.min(w,30),y:y||14};}
  // an arched wall panel, w wide and h high, depth d, its arch wo wide springing at sh; faces +z, centred on x
  const archPanels={};
  function archPanel(w,h,d,wo,sh,yb=0.02){const key=[w,h,d,wo,sh].map(v=>v.toFixed(2)).join(',');if(archPanels[key])return archPanels[key];
    const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h);s.lineTo(-w/2,h);s.lineTo(-w/2,0);
    const p=new THREE.Path();p.moveTo(-wo/2,yb);p.lineTo(wo/2,yb);p.lineTo(wo/2,sh);p.absarc(0,sh,wo/2,0,Math.PI,false);p.lineTo(-wo/2,yb);s.holes.push(p);
    return archPanels[key]=new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:false,curveSegments:8}).translate(0,0,-d/2);}

  // points round an ellipse at equal arc lengths: [point, outward normal, tangent]
  function ellipseBays(a,b,n){const S=2400,pts=[],cum=[0];for(let i=0;i<=S;i++){const t=i/S*Math.PI*2;pts.push([a*Math.cos(t),b*Math.sin(t)]);if(i)cum.push(cum[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));}
    const L=cum[S],at=s=>{let i=0;while(i<S&&cum[i+1]<s)i++;const f=(s-cum[i])/(cum[i+1]-cum[i]||1);return [pts[i][0]+(pts[i+1][0]-pts[i][0])*f,pts[i][1]+(pts[i+1][1]-pts[i][1])*f];};
    const out=[];for(let k=0;k<n;k++){const p0=at(k/n*L),p1=at((k+1)/n*L),pm=at((k+0.5)/n*L),tx=p1[0]-p0[0],tz=p1[1]-p0[1],tl=Math.hypot(tx,tz);
      let nx=tz/tl,nz=-tx/tl;if(nx*pm[0]/(a*a)+nz*pm[1]/(b*b)<0){nx=-nx;nz=-nz;}out.push({p0,p1,pm,n:[nx,nz],w:tl,ry:Math.atan2(nx,nz)});}return out;}

  return {Model,mat,turn,COL,archPanel,ellipseBays,crossing,DETAIL};
}
