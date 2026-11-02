  // ---- labels: straight at the centre, or along the spine of a long, thin region ----
  const labelCache=new Map();
  function spineOf(pts){
    const n=pts.length; if(n<3) return null;
    let mx=0,my=0; pts.forEach(p=>{mx+=p[0];my+=p[1];}); mx/=n; my/=n;
    let sxx=0,syy=0,sxy=0; pts.forEach(p=>{const dx=p[0]-mx,dy=p[1]-my; sxx+=dx*dx; syy+=dy*dy; sxy+=dx*dy;});
    const a=0.5*Math.atan2(2*sxy,sxx-syy), ux=Math.cos(a), uy=Math.sin(a), vx=-uy, vy=ux;
    let t0=Infinity,t1=-Infinity,s0=Infinity,s1=-Infinity;
    pts.forEach(p=>{const dx=p[0]-mx,dy=p[1]-my,t=dx*ux+dy*uy,s=dx*vx+dy*vy; t0=Math.min(t0,t); t1=Math.max(t1,t); s0=Math.min(s0,s); s1=Math.max(s1,s);});
    const L=t1-t0, Wd=s1-s0;
    // the inside of the polygon along each cross-section: a run of samples down its length
    const K=28, mids=[], widths=[]; let prev=null;
    for(let k=0;k<=K;k++){
      const t=t0+L*(0.06+0.88*k/K), cx=mx+ux*t, cy=my+uy*t, hits=[];
      for(let i=0;i<n;i++){ const p=pts[i], q=pts[(i+1)%n];
        const pdx=p[0]-cx, pdy=p[1]-cy, qdx=q[0]-cx, qdy=q[1]-cy;
        const pt=pdx*ux+pdy*uy, qt=qdx*ux+qdy*uy; if((pt>0)===(qt>0)) continue;
        const f=pt/(pt-qt); hits.push((pdx+(qdx-pdx)*f)*vx+(pdy+(qdy-pdy)*f)*vy); }
      hits.sort((x,y)=>x-y); let best=null;
      for(let i=0;i+1<hits.length;i+=2){ const m=(hits[i]+hits[i+1])/2, w=hits[i+1]-hits[i];
        const score=prev===null?w:w-Math.abs(m-prev)*1.5; if(!best||score>best.score) best={m,w,score}; }
      if(!best) continue; prev=best.m; mids.push([cx+vx*best.m,cy+vy*best.m]); widths.push(best.w);
    }
    if(mids.length<6) return null;
    for(let pass=0;pass<4;pass++) for(let i=1;i<mids.length-1;i++) mids[i]=[(mids[i-1][0]+2*mids[i][0]+mids[i+1][0])/4,(mids[i-1][1]+2*mids[i][1]+mids[i+1][1])/4];
    const ws=widths.slice().sort((x,y)=>x-y), w=ws[ws.length>>1];
    let len=0; for(let i=1;i<mids.length;i++) len+=Math.hypot(mids[i][0]-mids[i-1][0],mids[i][1]-mids[i-1][1]);
    return {mids,width:w,len,elong:L/Math.max(Wd,1)};
  }
  function labelFor(r){
    const key=r.points.length+':'+r.points.map(p=>p[0]+','+p[1]).join(';');
    const c=labelCache.get(r.id); if(c&&c.key===key) return c;
    const sp=spineOf(r.points);
    const curved=!!sp && sp.elong>2.3 && sp.len>70;
    const out={key,curved,sp,c:centroid(r.points)}; labelCache.set(r.id,out); return out;
  }
  const LABEL_FONT={political:'600 {s}px "IBM Plex Sans", system-ui, sans-serif',geographic:'italic 500 {s}px "Fraunces", Georgia, serif',biome:'italic 500 {s}px "IBM Plex Sans", system-ui, sans-serif'};
  function drawLabel(r){
    const lab=labelFor(r), kind=kindOf(r), text=kind==='political'?r.name.toUpperCase():r.name;
    og.textBaseline='middle'; og.lineJoin='round';
    const ink=(ch,x,y)=>{ og.lineWidth=4; og.strokeStyle='rgba(0,0,0,.75)'; og.strokeText(ch,x,y); og.fillStyle='#fff'; og.fillText(ch,x,y); };
    if(!lab.curved){ og.font=LABEL_FONT[kind].replace('{s}',15); og.textAlign='center'; ink(text,lab.c[0],lab.c[1]); return; }
    let pts=lab.sp.mids; if(pts[pts.length-1][0]<pts[0][0]) pts=pts.slice().reverse();   // read left to right
    const fs=Math.max(12,Math.min(22,lab.sp.width*0.5)); og.font=LABEL_FONT[kind].replace('{s}',fs.toFixed(1)); og.textAlign='center';
    const chars=[...text], cw=chars.map(ch=>og.measureText(ch).width), tw=cw.reduce((a,b)=>a+b,0);
    const sp=chars.length>1?Math.max(0,Math.min(fs*0.9,(lab.sp.len*0.72-tw)/(chars.length-1))):0;
    const total=tw+sp*(chars.length-1); if(total>lab.sp.len*1.05){ og.font=LABEL_FONT[kind].replace('{s}',15); ink(text,lab.c[0],lab.c[1]); return; }
    const cum=[0]; for(let i=1;i<pts.length;i++) cum.push(cum[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));
    const at=d=>{ d=Math.max(0,Math.min(cum[cum.length-1],d)); let i=1; while(i<cum.length-1&&cum[i]<d) i++;
      const f=(d-cum[i-1])/Math.max(1e-6,cum[i]-cum[i-1]); return [pts[i-1][0]+(pts[i][0]-pts[i-1][0])*f, pts[i-1][1]+(pts[i][1]-pts[i-1][1])*f]; };
    let d=(cum[cum.length-1]-total)/2; const place=[];
    chars.forEach((ch,i)=>{ const mid=d+cw[i]/2, p=at(mid), a=at(mid-fs*0.7), b=at(mid+fs*0.7);
      place.push([ch,p,Math.atan2(b[1]-a[1],b[0]-a[0])]); d+=cw[i]+sp; });
    // too sharp a bend between neighbouring letters garbles them: set the name straight instead,
    // tilted along the region from end to end
    let kink=0; for(let i=1;i<place.length;i++){ let da=Math.abs(place[i][2]-place[i-1][2]); if(da>Math.PI) da=2*Math.PI-da; kink=Math.max(kink,da); }
    if(kink>0.45){
      const A=pts[0], B=pts[pts.length-1], m=at(cum[cum.length-1]/2); let ang=Math.atan2(B[1]-A[1],B[0]-A[0]);
      if(ang>Math.PI/2) ang-=Math.PI; if(ang<-Math.PI/2) ang+=Math.PI;
      og.font=LABEL_FONT[kind].replace('{s}',15); og.save(); og.translate(m[0],m[1]); og.rotate(ang); ink(text,0,0); og.restore(); return;
    }
    place.forEach(([ch,p,ang])=>{ og.save(); og.translate(p[0],p[1]); og.rotate(ang); ink(ch,0,0); og.restore(); });
  }

