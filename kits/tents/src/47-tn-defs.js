// prefix: tn
// ================================================================= THE DEFS: one defBuilding per form and size (core/engine)
// 25 defs, 'tn-<form>-<size>' (33-tn-table.js TN_KEYS), each a culture-neutral record: the dress, the role and the trade are
// PLACEMENT options, so one record serves every people and every use:
//   place(key, x, z, ry, {dress, role, trade, wear?, world, cell, index, tags: tnTags(role, trade, dress, form), y?, v?})
// dress a TN_DRESS key or a culture key (41-tn-dress.js; an unknown one falls back to 'generic'); role and trade as core/camp
// deals them (TN_ROLES, TN_TRADES; default the form's natural role, TN_ROLE_OF); world, cell and index seed the colours, the
// wear and the patches (core/rand), so a tent looks the same wherever it is pitched. A host passes tags so the core/tags record
// carries the dress's culture and the role's types (place() registers it before the builder runs).
const TN_ROLE_OF={ridge:'sleeping',bell:'family',yurt:'family',cone:'family',black:'family',marquee:'council',wedge:'guard',fly:'stable',awning:'trade',roundend:'mess',wagon:'supply',screen:'latrine'};
function tnRoleOf(form,size){return form==='marquee'&&size==='l'?'chief':TN_ROLE_OF[form];}
/* the triangle budget by form (the heaviest dress, measured on the sheet, with a margin) */
const TN_BUDGET={ridge:60000,bell:70000,yurt:90000,cone:70000,black:60000,marquee:80000,wedge:25000,fly:30000,awning:30000,roundend:80000,wagon:40000,screen:15000};
function tnPitch(key,o){const S=tnSpec(key),F=TN_FORMS[S.form],role=o.role||tnRoleOf(S.form,S.size),trade=o.trade||null;
 const C=tnBegin(o,S.form);
 try{const out=TN_BUILD[S.form](S);
  const ng=tnGear(role,trade,out.zf);
  if(S.form==='wedge'){const k=tnGearKey(['{c}_sleeping_mat','ashnomad_sleeping_mat','{c}_bedding_stack','nomad_bedding_stack','scyvoi_bedding_stack']);
   if(k)for(const s of [-1,1])FURNISH(k,s*S.W*.24,0,-.15,0,{setting:'indoor'});}
  const ix=F.nest?null:tnInterior(key,role,trade,C.dress);
  if(CURREC)CURREC.tent={key,form:S.form,size:S.size,role,trade,dress:C.dress.key,fallback:C.dress.fallback||null,wear:C.wear,patches:C.patches,tears:C.tears,
   door:out.door,zf:out.zf,gear:ng,interior:ix?ix.pieces:0};
 }finally{tnEnd();}}
TN_KEYS.forEach((key,i)=>{const p=tnParse(key),F=TN_FORMS[p.form],dm=tnDims(key),role=tnRoleOf(p.form,p.size);
 const spec={key,name:F.name+', '+TN_SIZE_NAMES[p.size],seed:7101+i*7,cls:F.cls||'building',kind:'tent',
  tags:Object.assign(tnTags(role,null,TN_DRESS.generic,p.form),{culture:'generic'}),w:+dm.w.toFixed(2),d:+dm.d.toFixed(2),h:+dm.h.toFixed(2),
  budget:TN_BUDGET[p.form],cut:!F.cls&&p.form!=='screen',frag:'kits/tents',
  note:F.name+' ('+TN_SIZE_NAMES[p.size]+'): culture-neutral; the dress, the role and the trade are placement options'+(F.nest?'; no interior: '+F.nest:''),
  build(o){tnPitch(key,o||{});}};
 defBuilding(spec);});
