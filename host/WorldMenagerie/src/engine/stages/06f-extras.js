// ---------- extras: the stages a page brings with it ----------
// Everything up to here is shared by every city on the site. What belongs to one city only is not in this folder:
// Night City's neon, Mordor's forges and hosts, City 17's occupation and Mega-City One's blast shields live with
// their own pages and arrive as ctx.extras, so no other city downloads the code or runs it. Each entry is
// {name, fn}; fn is handed API - the same innards a stage here has in scope - and runs inside section(), so a
// page's extra failing takes down the extra and not the city. An extra that wants a control of its own asks for
// it with API.onUI, because the panels do not exist until the next stage.
if(ctx.extras&&ctx.extras.length)for(const ex of ctx.extras)section(ex.name||'extra',()=>ex.fn(API));
