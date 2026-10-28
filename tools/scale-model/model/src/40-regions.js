  // ---- regions ----
  const PAL=['#c9803c','#d9c14a','#5da05c','#3f8fb5','#8a6fc9','#c95a6a','#c9b08a','#6fb5a8','#e0e0e0','#7c8a5e'];
  let hoveredRegion=null;
  function inPoly(P,x,y){let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;}
  let regions=new Map(), sel=null, drawing=false, draft=[], cursorPt=null, editVerts=false, db=null, dbWritable=true;
  let measuring=false, meas=[], measCursor=null;
  const $=id=>document.getElementById(id);
  const list=$('regions'), edit=$('edit'), eName=$('eName'), eNotes=$('eNotes'), eArea=$('eArea'), eSw=$('eSw'), eVerts=$('eVerts'), dbStatus=$('dbStatus');
  PAL.forEach(c=>{const b=document.createElement('button'); b.style.background=c; b.title=c; b.setAttribute('aria-label','colour '+c); b.onclick=()=>{ if(!sel) return; sel.color=c; commitSel(); }; eSw.appendChild(b);});

