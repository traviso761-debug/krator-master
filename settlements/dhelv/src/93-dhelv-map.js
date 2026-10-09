// ================================================================= DHELV: THE MINIMAP. The layout (41-dhelv-layout.js) drawn small in a corner: the
// hall's square, the wells, every way coloured by kind, the sites' footprints; the ways within 6 m of the camera's height bright,
// the rest faded (the levels: the braid crosses under the ledge's tunnels); the camera (its view as a cone) and the marker.
// It shows the city or the outpost, whichever the camera is in; a click on it brings the orbit there (on the floor below the
// nearest way's height). M hides it.
const DHMAP={on:true,W:260,H:230,mode:null,base:{},t:0,extra:[],
 views:{city:{x0:-720,x1:780,z0:-470,z1:680},outpost:{x0:-1010,x1:-560,z0:-230,z1:230}},
 COL:{tube:'#8a6a48',braid:'#7a4c96',ramp:'#3f9f98',stair:'#d4aa5a',ledge:'#c24a3a',square:'#b8ab90',street:'#9e8a70',door:'#ffffff',secret:'#4a8fd0'}};
DHMAP.cv=document.createElement('canvas');DHMAP.cv.width=DHMAP.W;DHMAP.cv.height=DHMAP.H;
Object.assign(DHMAP.cv.style,{position:'fixed',right:'10px',bottom:'64px',zIndex:6,border:'1px solid #9a5a36',borderRadius:'4px',background:'rgba(20,14,10,.82)',cursor:'crosshair'});
document.body.appendChild(DHMAP.cv);
/* a view's frame: metres to the canvas, keeping the aspect (north up: z grows down the canvas, as z runs south) */
function dhMapFrame(v){const W=DHMAP.W,H=DHMAP.H,s=Math.min((W-12)/(v.x1-v.x0),(H-22)/(v.z1-v.z0)),ox=(W-(v.x1-v.x0)*s)/2,oz=16+(H-16-(v.z1-v.z0)*s)/2;
 return {s,X:x=>ox+(x-v.x0)*s,Z:z=>oz+(z-v.z0)*s,x:px=>v.x0+(px-ox)/s,z:pz=>v.z0+(pz-oz)/s};}
/* the still layer of a view, at a camera height (redrawn when the camera moves 3 m in height or changes view) */
function dhMapBase(mode,cy){const key=mode+':'+Math.round(cy/3),B=DHMAP.base;if(B.key===key)return B.cv;
 const v=DHMAP.views[mode],F=dhMapFrame(v),cv=B.cv||document.createElement('canvas');cv.width=DHMAP.W;cv.height=DHMAP.H;const g=cv.getContext('2d');g.clearRect(0,0,cv.width,cv.height);
 const H=DH.HALL;g.fillStyle='rgba(200,180,140,.25)';g.strokeStyle='#8a7a5a';g.beginPath();g.ellipse(F.X(H.c[0]),F.Z(H.c[1]),H.rx*F.s,H.rz*F.s,0,0,TAU);g.fill();g.stroke();
 g.fillStyle='rgba(255,240,190,.45)';g.beginPath();g.arc(F.X(H.c[0]),F.Z(H.c[1]),H.pool*F.s,0,TAU);g.fill();
 for(const P of DH.PITS){g.fillStyle='rgba(150,190,110,.3)';g.strokeStyle='#6a8a4a';g.beginPath();g.arc(F.X(P.c[0]),F.Z(P.c[1]),P.r*F.s,0,TAU);g.fill();g.stroke();}
 /* the plateau's edge (its wall), and on the outpost's view the apron */
 g.strokeStyle='#a08a62';g.lineWidth=2;g.beginPath();DH.PLAT.poly.forEach((q,i)=>{if(i)g.lineTo(F.X(q[0]),F.Z(q[1]));else g.moveTo(F.X(q[0]),F.Z(q[1]));});g.closePath();g.stroke();g.lineWidth=1;
 const K=DH.APRON;if(mode==='outpost'){g.fillStyle='rgba(120,140,80,.25)';g.beginPath();g.ellipse(F.X(K.c[0]),F.Z(K.c[1]),K.r*F.s,K.r/1.3*F.s,0,0,TAU);g.fill();}
 for(const s of DH.SITES){const Fo=DH.FOOT[s.key];if(!Fo)continue;if(Fo[2]==='round'){g.fillStyle='rgba(120,170,80,.6)';g.beginPath();g.arc(F.X(s.x),F.Z(s.z),Fo[0]/2*F.s,0,TAU);g.fill();continue;}const [w,d,o]=Fo,za=o==='front'?-d:-d/2,zb=o==='front'?.5:d/2,c=Math.cos(s.ry),sn=Math.sin(s.ry);
  g.fillStyle='rgba(214,194,90,.55)';g.beginPath();[[-w/2,za],[w/2,za],[w/2,zb],[-w/2,zb]].forEach(([lx,lz],i)=>{const x=F.X(s.x+lx*c+lz*sn),z=F.Z(s.z-lx*sn+lz*c);if(i)g.lineTo(x,z);else g.moveTo(x,z);});g.fill();}
 /* the ways: those within 6 m of the camera's height bright and thick, the rest faded */
 for(const pass of [0,1])for(const e of DH.EDGES){const a=DH.byId[e.a],b=DH.byId[e.b],near=Math.min(Math.abs(a.y-cy),Math.abs(b.y-cy))<6;if((pass===1)!==near)continue;
  g.strokeStyle=DHMAP.COL[e.kind]||'#fff';g.globalAlpha=near?1:.3;g.lineWidth=near?2.4:1.2;g.setLineDash(e.zone==='secret'?[2,3]:e.zone==='outer'?[5,3]:[]);
  g.beginPath();g.moveTo(F.X(a.x),F.Z(a.z));g.lineTo(F.X(b.x),F.Z(b.z));g.stroke();}
 g.globalAlpha=1;g.setLineDash([]);g.fillStyle='#f0dcc4';g.font='11px system-ui';g.fillText(mode==='city'?'Dhelv: the city':'the outpost',6,12);
 B.key=key;B.cv=cv;return cv;}
function dhMapDraw(){if(!DHMAP.on)return;const p=camera.position,mode=p.x<DH.PLAT.cliffX+30?'outpost':'city',v=DHMAP.views[mode],F=dhMapFrame(v),g=DHMAP.cv.getContext('2d');DHMAP.mode=mode;
 g.clearRect(0,0,DHMAP.W,DHMAP.H);g.drawImage(dhMapBase(mode,p.y),0,0);
 for(const f of DHMAP.extra)f(g,F,p,mode);   /* others' layers (95: the walkers as dots) */
 const d=new THREE.Vector3();camera.getWorldDirection(d);const a=Math.atan2(d.z,d.x),cx=F.X(p.x),cz=F.Z(p.z);
 g.fillStyle='rgba(255,255,255,.25)';g.beginPath();g.moveTo(cx,cz);g.arc(cx,cz,26,a-.45,a+.45);g.closePath();g.fill();
 g.fillStyle='#ffe060';g.beginPath();g.arc(cx,cz,3.5,0,TAU);g.fill();
 if(MARK.at){g.fillStyle='#ff4060';g.beginPath();g.arc(F.X(MARK.at.x),F.Z(MARK.at.z),3.5,0,TAU);g.fill();}
 g.fillStyle='#c8b8a0';g.font='10px ui-monospace,monospace';g.fillText('y '+p.y.toFixed(0)+(WALK.on?'  walking':''),DHMAP.W-74,12);}
FRAME_HOOKS.push(()=>{const t=performance.now();if(t-DHMAP.t>100){DHMAP.t=t;dhMapDraw();}});
/* a click on the map: the orbit goes there, at the height of the nearest way (or the ground) */
DHMAP.cv.addEventListener('click',e=>{const r=DHMAP.cv.getBoundingClientRect(),F=dhMapFrame(DHMAP.views[DHMAP.mode||'city']),x=F.x(e.clientX-r.left),z=F.z(e.clientY-r.top);
 let best=null,bd=40;for(const n of DH.NODES){const dd=Math.hypot(n.x-x,n.z-z);if(dd<bd){bd=dd;best=n;}}
 const y=best?best.y:terrainH(x,z);if(WALK.on)toggleWalk();ctl.target.set(x,y+1.5,z);ctl.radius=Math.min(ctl.radius,60);DH_STREAM.tick=0;});
addEventListener('keydown',e=>{if(e.target.tagName==='TEXTAREA'||e.target.tagName==='SELECT')return;if(e.key.toLowerCase()==='m'){DHMAP.on=!DHMAP.on;DHMAP.cv.style.display=DHMAP.on?'block':'none';}});
