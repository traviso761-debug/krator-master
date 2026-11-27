// ================================================================= HOST — the sky's per-frame update on the host's view (after KHOST.take)
if(typeof SKY!=='undefined'&&SKY&&SKY.view)KHOST.on(SKY.view,'view');
