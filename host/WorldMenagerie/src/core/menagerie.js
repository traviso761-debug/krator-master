// ---------- the way out of a scene, and the way into the others ----------
// Every page on this site is a room with no doors: you arrive at a city and the only way to another one is the
// address bar. This adds the two things that fixes - a Home button, and a panel listing everything the server
// is serving - and it adds them to any page that calls it, whichever engine that page runs on.
//
// The list is the server's, from /scenes.json, which server.py builds out of site.toml. That means it is right
// by construction: a scene turned off in the config is gone from the menu without anything here changing. It
// also means there is nothing to show when the page has been opened straight off the disk, or when whatever is
// serving it does not know about scenes - in which case this quietly does nothing at all, because a menu that
// cannot take you anywhere is worse than no menu.
const PANEL_ID='menagerie';

// The pages that run on an engine already load css/iziz.css and have a button bar to put this in. The ones
// that do not - the prose pages, and Voth, which is a world of its own with its own stylesheet - pass
// standalone:true, and get a bar and just enough style to make these two things look deliberate.
const STYLE=`#menagerie-bar{position:fixed;right:12px;top:12px;z-index:40;display:flex;gap:6px}
#menagerie-bar button{background:rgba(18,14,58,.82);color:#e8c98a;border:1px solid #c99a55;padding:7px 11px;
  font:13px Georgia,serif;letter-spacing:.04em;border-radius:2px;cursor:pointer}
#menagerie-bar button:hover{background:#c99a55;color:#1a1040}
#menagerie.standalone{position:fixed;right:12px;top:52px;z-index:40;width:min(460px,calc(100% - 24px));
  max-height:calc(100% - 80px);overflow:auto;display:none;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));
  gap:5px;padding:8px;background:rgba(13,11,46,.96);border:1px solid #c99a55}
#menagerie.standalone.open{display:grid}
#menagerie.standalone .sub{grid-column:1/-1;font:12px Georgia,serif;letter-spacing:.12em;text-transform:uppercase;
  color:#b89a70;margin:6px 0 0}
#menagerie.standalone a{display:block;text-decoration:none;background:rgba(18,14,58,.78);color:#e8c98a;
  border:1px solid #6a5a8a;padding:8px 10px;font:14px Georgia,serif;border-radius:2px}
#menagerie.standalone a:hover{border-color:#c99a55}
#menagerie.standalone a[aria-current="true"]{background:#c99a55;color:#1a1040}`;

export async function installMenagerie(opts){
  const o=opts||{};
  let ui=o.ui||document.getElementById('ui');
  if(!ui&&!o.standalone)return null;
  if(o.standalone&&!document.getElementById('menagerie-style')){
    const st=document.createElement('style');st.id='menagerie-style';st.textContent=STYLE;document.head.appendChild(st);
  }
  if(!ui){const bar=document.createElement('div');bar.id='menagerie-bar';document.body.appendChild(bar);ui=bar;}
  let data=null;
  try{
    const r=await fetch(o.url||'/scenes.json',{cache:'no-store'});
    if(r.ok)data=await r.json();
  }catch(e){/* opened from a file, or served by something simpler: no menu, no complaint */}
  const scenes=(data&&Array.isArray(data.scenes)?data.scenes:[]).filter(s=>s&&s.path);
  if(scenes.length<2)return null;

  const here=location.pathname.replace(/\/+$/,'')||'/';
  const mk=o.mkBtn||((label,parent,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=fn;parent.appendChild(b);return b;});

  // the panel: the same furniture as the viewpoints list, so it needs no styling of its own
  let panel=document.getElementById(PANEL_ID);
  if(!panel){
    panel=document.createElement('div');panel.id=PANEL_ID;
    if(o.standalone)panel.className='standalone';
    panel.setAttribute('role','dialog');panel.setAttribute('aria-label','The menagerie');
    document.body.appendChild(panel);
  }
  const group=(name,list)=>{
    if(!list.length)return;
    const h=document.createElement('div');h.className='sub';h.textContent=name;panel.appendChild(h);
    for(const s of list){
      const a=document.createElement('a');a.href=s.path;a.textContent=s.title||s.path;
      if(s.blurb)a.title=s.blurb;
      if(s.path===here||here.startsWith(s.path+'.'))a.setAttribute('aria-current','true');
      panel.appendChild(a);
    }
  };
  group('Scenes',scenes.filter(s=>(s.kind||'scene')!=='text'));
  group('Reading',scenes.filter(s=>(s.kind||'scene')==='text'));

  const btn=mk(o.label||'Menagerie',ui,()=>{
    const open=!panel.classList.contains('open');
    panel.classList.toggle('open',open);
    btn.setAttribute('aria-expanded',String(open));
    // the viewpoints panel and this one are the same size and place: never both at once
    for(const id of ['views','display'])
      {const p=document.getElementById(id);if(p&&open)p.classList.remove('open');}
  });
  btn.setAttribute('aria-expanded','false');
  btn.title='Every other place on this server';

  const home=mk(o.homeLabel||'Home',ui,()=>{location.href=o.home||'/';});
  home.title='Back to the front page';
  addEventListener('keydown',e=>{
    if(e.key==='Escape'&&panel.classList.contains('open')){panel.classList.remove('open');btn.setAttribute('aria-expanded','false');}
  });
  return {panel,btn,home,scenes};
}
