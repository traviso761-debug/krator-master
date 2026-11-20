// ---------- Galaxy class: red alert on the hull ----------
// Fan work. Star Trek belongs to Paramount.
//
// events.js turns the windows red and pulses them with four lamps on the saucer, and lcars.js the interface. This
// puts it on the rest of the ship. The window rings dim (a ship at red alert is not lit for show: the decks go to
// battle lighting), and red lamps along the hull strobe in a chase: round the saucer's rim from the bow both ways at
// once, aft along the engineering hull's flanks, and down the nacelles' backs, so from any side the alert reads as
// a wave running aft. The lamps are two sets of points (one riding the saucer, which can leave, one the stardrive),
// so the eighty of them are two draws, and nothing at all when there is no alert.
import {SAUCER} from './dims.js';
import {rho,saucerTop,saucerBot,NACY,NACZ,nacHalf,engSurf} from './hull.js';

export function redhull(W){
  const {THREE,G,SAU,animHooks}=W;
  const sets=[];
  const set=par=>{const S={par,pos:[],ph:[]};sets.push(S);return S;};
  const sau=set(SAU),eng=set(G);
  const lamp=(S,x,y,z,ph)=>{S.pos.push(x,y,z);S.ph.push(ph);};
  // round the saucer's rim, just above and below its edge, from the bow aft both ways
  for(let i=0;i<=12;i++)for(const sd of (i===0||i===12?[1]:[1,-1])){
    const an=i/12*Math.PI*sd,r=rho(an)*0.985,x=r*Math.cos(an),z=r*Math.sin(an);
    lamp(sau,x,saucerTop(x,z)+0.7,z,i/12*0.55);if(i%2===0)lamp(sau,x,saucerBot(x,z)-0.7,z,i/12*0.55);}
  // a ring part way in across the top of the dish, so a view from above sees it too
  for(let i=0;i<10;i++){const a=i/10*Math.PI*2,x=SAUCER.a*0.55*Math.cos(a),z=SAUCER.b*0.55*Math.sin(a);lamp(sau,x,saucerTop(x,z)+0.8,z,Math.abs(a>Math.PI?2*Math.PI-a:a)/Math.PI*0.5);}
  // the engineering hull's flanks, at its widest, forward to aft
  {const p={x:0,y:0,z:0};for(let i=1;i<8;i++){const u=i/8;for(const v of [0.02,0.48]){engSurf(u,v,p);lamp(eng,p.x,p.y,p.z+Math.sign(p.z)*1.2,0.45+u*0.4);}}}
  // the nacelles' backs, nose to tail
  for(const sd of [1,-1])for(let i=0;i<6;i++){const d=40+i*36,hh=nacHalf(d)[1];lamp(eng,192-d,NACY+hh+1.4,sd*NACZ,0.5+i*0.09);}
  for(const S of sets){
    const n=S.ph.length,g=new THREE.BufferGeometry();S.col=new Float32Array(n*3);
    g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(S.pos),3));g.setAttribute('color',new THREE.BufferAttribute(S.col,3));
    S.pts=new THREE.Points(g,new THREE.PointsMaterial({map:W.glowTex,size:72,sizeAttenuation:true,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));
    S.pts.visible=false;S.pts.frustumCulled=false;S.pts.userData.noWire=true;S.pts.raycast=()=>{};S.par.add(S.pts);}

  let on=false,t0=0;const mats=W.hullMats;
  animHooks.push(now=>{
    const red=!!(W.redAlert&&W.redAlert());
    if(red!==on){on=red;t0=now;for(const S of sets)S.pts.visible=on;}
    if(!on)return;
    // the window rings: events.js has set them red and pulsing; take them down to battle lighting
    for(const m of mats)m.emissiveIntensity*=0.42;
    // the chase: a wave aft every 1.4 s, each lamp lit for a fifth of it, a dim ember between
    const u=((now-t0)/1400)%1;
    for(const S of sets){const c=S.col;
      for(let i=0;i<S.ph.length;i++){let d=u-S.ph[i];d-=Math.floor(d);const k=0.1+0.9*(d<0.2?Math.pow(1-d/0.2,1.5):0);
        c[i*3]=k;c[i*3+1]=0.16*k;c[i*3+2]=0.08*k;}
      S.pts.geometry.attributes.color.needsUpdate=true;}
  });
  return {count:sets.reduce((a,S)=>a+S.ph.length,0)};
}
