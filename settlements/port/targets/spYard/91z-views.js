// Views for the spYard dev target: per decay an overview of the three
// platforms off the pier head, then close views of the joins and corners.
const VIEWS={};
(()=>{const D=PORT.DECK,R=PORT_LAYOUT.runs||[];if(!R.length){VIEWS.Empty=[0,300,600,0,0,0];return;}
 VIEWS.Overview=portCam(0,0,470,.2,.45,1300);
 for(const r of R){const nm=portDName(r.d),A=r.A,B=r.B,cx=A.gx+55,cz=A.gz+80;
  VIEWS[nm]=portCam(cx,D,cz,.55,.42,330);
  VIEWS[nm+' from the sea']=portCam(cx,D,cz,-.35,.2,300);
  VIEWS[nm+' pier join']=portCam(A.gx-44,D,A.gz-3,-1.15,.2,72);
  VIEWS[nm+' warehouse']=portCam(A.gx-34,D+4,A.gz+40,-.75,.55,95);
  VIEWS[nm+' top']=[cx,560,cz+1,cx,0,cz];
  VIEWS[nm+' SE corner of B']=portCam(B.gx+55,D,B.gz+110,.75,.25,110);
  VIEWS[nm+' A-B-C seam']=portCam(A.gx+55,D,A.gz+110,-.4,.5,120);
  VIEWS[nm+' eye level']=[A.gx-10,D+1.7,A.gz+32,A.gx+30,D+3,A.gz+45];
  VIEWS[nm+' night']=portCam(cx,D,cz,.4,.3,300,1);}})();
