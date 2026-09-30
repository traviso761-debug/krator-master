// ---------------------------------------------------------------- ring sea parts (shared by several vessels)
// foam: a pale ribbon round the waterline, so a hull reads as sitting IN the sea, not on it
rsDefMat('foam',new THREE.MeshBasicMaterial({color:0xe8f4f4,transparent:true,opacity:.42,depthWrite:false,side:DS}));
function rsFoam(B,H,w){w=w||.7;const kB=clamp(H.B/4,.25,1);const pts=[];for(let i=0;i<=60;i++){const u=i/60;const hw=H.halfAt(u,0);if(hw<=0)continue;pts.push([u,hw]);}
 if(pts.length<2)return;const hF0=u=>clamp((0-H.yk(u))/(H.ys(u)-H.yk(u)),0,1);
 for(const s of[-1,1]){const g=rsGrid((a,v)=>{const k=Math.min(pts.length-1,Math.round(a*(pts.length-1)));const u=pts[k][0],hw=pts[k][1];return[H.xAt(u,hF0(u)),.03,H.z0+s*(hw+v*w*(.4+.6*Math.sin(Math.PI*a)))];},pts.length-1,1);rsPut(B,'foam',g);}
 const pF=H.pt(1,0,hF0(1)),pA=H.pt(0,0,hF0(0));
 // a bow wave and a little wake
 for(const s of[-1,1]){const g=rsGrid((a,v)=>[pF[0]-a*H.L*.3,.035,H.z0+s*(a*H.B*.5+v*(.3+a*1.1)*kB)],10,1);rsPut(B,'foam',g);}}
// a barrel vault (the Atlantis deckhouse, the turtle's inner roof): x0..x1, springing at y0, half-width hw, rise
function rsVault(B,mk,x0,x1,y0,hw,rise,col,nu,nv,tile){const g=rsGrid((u,v)=>{const a=v*Math.PI;return[lerp(x0,x1,u),y0+Math.sin(a)*rise,Math.cos(a)*hw];},nu||12,nv||12,(u,v,p)=>[p[0]/(tile||3),v*Math.PI*(hw+rise)/2/(tile||3)]);
 return rsPut(B,mk,g,null,null,null,col);}
// a cabin: four walls, windows as dark insets, a roof by kind ('flat','gable','vault','hip'); returns roof top y
function rsCabin(B,o){const x=o.x,y=o.y,z=o.z||0,w=o.w,d=o.d,h=o.h,wc=o.wall||0x8a6a48,mk=o.mk||'wood';
 rsBox(B,mk,[w,h,d],[x,y+h/2,z],null,wc,2);
 if(o.win){const n=o.win,ww=Math.min(.7,w/n*.45);for(let i=0;i<n;i++){const xx=x-w/2+(i+.5)*w/n;for(const s of[-1,1])rsBox(B,'paint',[ww,h*.38,.06],[xx,y+h*.58,z+s*(d/2+.02)],null,o.winCol||0x1a1410);}}
 const rc=o.roofCol||0x6a4a30,rk=o.roofMk||'wood',ov=o.over==null?.35:o.over,rh=o.rh||h*.45;
 if(o.roof==='gable'){for(const s of[-1,1]){const L=Math.hypot(d/2+ov,rh);rsBox(B,rk,[w+ov*2,.12,L],[x,y+h+rh/2,z+s*(d/4+ov/2)],[s*Math.atan2(rh,d/2+ov),0,0],rc,2);}return y+h+rh;}
 if(o.roof==='vault'){rsVault(B,rk,x-w/2-ov,x+w/2+ov,y+h,d/2+ov,rh,rc);return y+h+rh;}
 if(o.roof==='hip'){rsRoof(B,rk,w+ov*2,d+ov*2,rh,[x,y+h,z],null,rc,o.flare||.12,.2);return y+h+rh;}
 rsBox(B,rk,[w+ov*2,.14,d+ov*2],[x,y+h+.07,z],null,rc,2);return y+h+.14;}
// a waterline ram: n blades stacked (the Atlantis triple ram), pointing +x from the stem at xS
function rsRam(B,xS,y,len,n,col,mk){for(let i=0;i<n;i++){const yy=y+(i-(n-1)/2)*.42;const g=new THREE.ConeGeometry(.34,len,4,1);g.rotateZ(-Math.PI/2);g.scale(1,.9,.55);
 rsPut(B,mk||'metal',rsUV(g,1),[xS+len/2,yy,0],null,null,col);}
 rsBox(B,mk||'metal',[1.2,n*.42+.3,.9],[xS+.3,y,0],null,col,1);}
// a dragon's head (the Yuni dragon boat, the Iron Republic turtle): at p, facing +x, scale k
function rsDragonHead(B,p,k,col,horn,jawOpen){const P=(x,y,z)=>[p[0]+x*k,p[1]+y*k,p[2]+z*k];
 rsSphere(B,'paint',.55,P(0,0,0),[1.25*k,.95*k,.85*k],col,12,10);
 const sn=new THREE.CylinderGeometry(.3,.45,1.3,10,1);sn.rotateZ(-Math.PI/2);rsPut(B,'paint',sn,P(.95,.05,0),null,[k,k*.85,k],col);
 const jw=new THREE.CylinderGeometry(.18,.34,1.1,8,1);jw.rotateZ(-Math.PI/2);rsPut(B,'paint',jw,P(.85,-.42-(jawOpen||.15),0),[0,0,-(jawOpen||.15)],[k,k*.6,k],col);
 for(const s of[-1,1]){rsSphere(B,'metal',.13,P(.35,.28,s*.36),[k,k,k],0xf0c040,8,6);
  rsCone(B,'paint',.1,.9,P(-.35,.62,s*.25),[s*.35,0,.9],horn||0xe8d8a0,6);
  rsCone(B,'paint',.06,.5,P(1.45,-.1,s*.18),[0,0,-1.7],0xf4f0e0,5);
  for(let i=0;i<4;i++)rsCone(B,'paint',.08,.55,P(-.6-i*.28,.35-i*.05,s*.3),[s*.5,0,1.2+i*.15],horn||0xe8d8a0,5);}
 rsCone(B,'paint',.05,.4,P(1.5,-.35,0),[0,0,-1.7],0xf4f0e0,5);}
// a curled scroll (the Voth stern post, the Dalab prow): a tapering tube spiralling inward in the
// xy plane from p; dir +1 curls forward (+x), -1 aft; R the first radius, turns in revolutions
function rsScroll(B,p,R,turns,r0,col,dir,mk,z){const pts=[];const n=Math.max(12,turns*24|0);for(let i=0;i<=n;i++){const t=i/n,a=t*turns*TAU,rad=R*(1-.72*t);
 pts.push([p[0]+dir*(R-rad*Math.cos(a)),p[1]+rad*Math.sin(a),z||0]);}
 return rsTube(B,mk||'paint',pts,t=>r0*(1-.7*t),col,n*3,8);}
