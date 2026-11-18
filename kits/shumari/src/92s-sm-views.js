// ================================================================= SHUMARI SHEET VIEWS (Phase SM2)
// Framed directly from placed REG coordinates; zero apostrophes or colons in view names (tools/check_views.py).
(function smConfigureViews(){
 const by=(key,v)=>REG.find(r=>r.key===key&&(v==null||r.v===v));
 const qSpiral=by('sm_regiment_qubba',0);
 const qCarved=by('sm_regiment_qubba',1);
 const doriyan=by('sm_doriyan_stele',0);
 const sPishtaq=by('sm_sample_pishtaq',0);
 const sHearth=by('sm_sample_hearth_bay',0);

 const midZ=ROWS.length?(ROWS[0].z+ROWS[ROWS.length-1].z)*.5:-16;
 VIEWS['Overview']=[-34,26,28,0,6.5,midZ];
 VIEWS['Opening']=[18,12,24,-2,7.2,ROWS.length?ROWS[0].z:-8];

 if(qSpiral){
  VIEWS['Spiral qubba and pishtaq']=[
   qSpiral.x+8.6,6.4,qSpiral.z+22.5,
   qSpiral.x,8.2,qSpiral.z-.6
  ];
  VIEWS['Inside the regiment qubba']=[
   qSpiral.x,2.65,qSpiral.z+2.35,
   qSpiral.x,4.35,qSpiral.z-2.85
  ];
  VIEWS['Gorge street under the qubba']=[
   qSpiral.x-6.8,2.15,qSpiral.z+16.8,
   qSpiral.x+.5,7.8,qSpiral.z+.4
  ];
 }
 if(qCarved){
  VIEWS['Carved qubba dome']=[
   qCarved.x+5.8,7.6,qCarved.z+21.5,
   qCarved.x,9.6,qCarved.z-.8
  ];
 }
 if(qSpiral&&doriyan){
  VIEWS['Domes of the Subaru-su']=[
   doriyan.x+16.5,14.5,doriyan.z+22.0,
   (qSpiral.x+doriyan.x)*.5,9.5,qSpiral.z-1.0
  ];
 }
 if(doriyan){
  VIEWS['Doriyan mirror canopy']=[
   doriyan.x+7.8,5.6,doriyan.z+17.2,
   doriyan.x,6.8,doriyan.z-.5
  ];
 }
 if(sPishtaq&&sHearth){
  const mx=(sPishtaq.x+sHearth.x)*.5,mz=(sPishtaq.z+sHearth.z)*.5;
  VIEWS['Toolkit samples']=[
   mx+4.0,6.2,mz+19.5,
   mx,4.2,mz-.5
  ];
 }
})();
