// ================================================================= SHUMARI SHEET VIEWS (Phases SM2-SM4)
// Framed directly from placed REG coordinates; zero apostrophes or colons in view names (tools/check_views.py).
(function smConfigureViews(){
 const by=(key,v)=>REG.find(r=>r.key===key&&(v==null||r.v===v));
 const street=by('sm_gorge_street',0);
 const qSpiral=by('sm_regiment_qubba',0);
 const qCarved=by('sm_regiment_qubba',1);
 const hallBlades=by('sm_hall_of_blades',0);
 const sabil=by('sm_sabil_shrine',0);
 const doriyan=by('sm_doriyan_stele',0);
 const bayt=by('sm_captain_bayt',0);
 const diwan=by('sm_diwan_hall',0);
 const chancery=by('sm_kattu_chancery',0);
 const payaru=by('sm_payaru_tower',0);
 const keep=by('sm_citadel_keep',0);
 const still=by('sm_spirits_still',0);
 const jetty=by('sm_lake_jetty',0);
 const sPishtaq=by('sm_sample_pishtaq',0);
 const sHearth=by('sm_sample_hearth_bay',0);

 const midZ=ROWS.length?(ROWS[0].z+ROWS[ROWS.length-1].z)*.5:-120;
 VIEWS['Overview']=[-135,96,ROWS.length?ROWS[0].z+98:48,0,6,midZ];
 VIEWS['Opening']=[26,15,ROWS.length?ROWS[0].z+36:26,-4,8.5,ROWS.length?ROWS[0].z:-12];

 if(street){
  VIEWS['Gorge street under the qubba']=[
   street.x+.6,3.25,street.z+16.8,
   street.x-.4,7.6,street.z-6.5
  ];
 }else if(qSpiral){
  VIEWS['Gorge street under the qubba']=[
   qSpiral.x-6.8,2.15,qSpiral.z+16.8,
   qSpiral.x+.5,7.8,qSpiral.z+.4
  ];
 }

 if(hallBlades&&qSpiral){
  const cx=(qSpiral.x+hallBlades.x+(sabil?sabil.x:hallBlades.x))/3;
  VIEWS['Domes of the Subaru-su']=[
   hallBlades.x+24.0,19.5,hallBlades.z+34.0,
   cx,10.2,hallBlades.z-4.0
  ];
 }else if(qSpiral&&doriyan){
  VIEWS['Domes of the Subaru-su']=[
   doriyan.x+16.5,14.5,doriyan.z+22.0,
   (qSpiral.x+doriyan.x)*.5,9.5,qSpiral.z-1.0
  ];
 }

 if(qSpiral){
  VIEWS['Spiral qubba and pishtaq']=[
   qSpiral.x+8.6,6.4,qSpiral.z+22.5,
   qSpiral.x,8.2,qSpiral.z-.6
  ];
  VIEWS['Inside the regiment qubba']=[
   qSpiral.x,2.65,qSpiral.z+2.35,
   qSpiral.x,4.35,qSpiral.z-2.85
  ];
 }
 if(qCarved){
  VIEWS['Carved qubba dome']=[
   qCarved.x+5.8,7.6,qCarved.z+21.5,
   qCarved.x,9.6,qCarved.z-.8
  ];
 }
 if(doriyan){
  VIEWS['Doriyan mirror canopy']=[
   doriyan.x+7.8,5.6,doriyan.z+17.2,
   doriyan.x,6.8,doriyan.z-.5
  ];
 }
 if(bayt){
  VIEWS['Sword captain bayt compound']=[
   bayt.x+12.0,11.5,bayt.z+25.0,
   bayt.x,6.2,bayt.z-1.0
  ];
 }
 if(diwan&&chancery){
  VIEWS['Diwan hall and kattu chancery']=[
   chancery.x+10.5,8.5,chancery.z+24.5,
   (diwan.x+chancery.x)*.5,6.4,chancery.z-.8
  ];
 }
 if(payaru&&keep){
  VIEWS['Citadel and Payaru minaret']=[
   payaru.x+11.5,11.0,payaru.z+26.5,
   (keep.x+payaru.x)*.5,9.8,payaru.z-.5
  ];
 }
 if(still&&jetty){
  VIEWS['Copper stills and lake jetty']=[
   still.x+12.5,6.8,still.z+17.5,
   (still.x+jetty.x)*.5+1.2,2.8,still.z-.6
  ];
 }
 if(ROWS.length){
  const last=ROWS[ROWS.length-1];
  VIEWS['Shumar highland flora']=[
   -24.0,9.5,last.z-last.d*.5+6.0,
   4.0,5.2,last.z-last.d*.5-22.0
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
