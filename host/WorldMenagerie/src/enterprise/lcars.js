// ---------- Galaxy class: the interface, dressed as a starship's ----------
// Fan work. The look of the ship's displays in the series (flat bands of colour on black, rounded ends, panels framed
// by an "elbow" of colour down the left and along the top, condensed capitals in black on the bands), done here in
// this page's own CSS with its own palette. Nothing is taken from the series but the idea; no font is fetched (the
// condensed faces a machine is likely to have, then its own sans).
//
// Everything is scoped under html.lcars, which outranks the page's and the modules' own rules without !important. Only enterprise.html loads it: Voyager, Deep Space Nine and Babylon 5 share the
// page shell and keep their own look. Under red alert the palette goes to reds (html.lcars.alert; ship.js sets it).
const CSS=`
html.lcars{--a:#ff9c3a;--b:#ffbf87;--c:#c89bd8;--d:#9a8cf0;--e:#8fb4ff;--f:#e7a36a;--on:#ffd27a;--ink:#000;--txt:#f4dcc0;--dim:#b49a86;
  --lf:"Antonio","Oswald","Roboto Condensed","Ubuntu Condensed","Liberation Sans Narrow","Arial Narrow","DejaVu Sans Condensed","Helvetica Neue",Helvetica,Arial,sans-serif}
html.lcars.alert{--a:#ff5a46;--b:#ff9a80;--c:#d8606a;--d:#b8404a;--e:#ff7a6a;--f:#e8705a;--on:#ffd0c0}
html.lcars body{background:#000;font-family:var(--lf);font-stretch:condensed}
/* ---- the title and the hint ---- */
html.lcars #title{font:600 24px/1 var(--lf);letter-spacing:.18em;color:var(--a);text-shadow:none;display:flex;align-items:center;gap:10px}
html.lcars #title::before{content:"";width:64px;height:24px;background:var(--a);border-radius:12px 0 0 12px}
html.lcars #title::after{content:"";width:22px;height:24px;background:var(--c);border-radius:0 12px 12px 0}
html.lcars #seedtag{color:var(--b)}
html.lcars #hint{color:var(--b);font:12px/1.45 var(--lf);letter-spacing:.04em;text-transform:uppercase;text-shadow:none;opacity:.85}
/* ---- the bar along the bottom: a band of blocks between two rounded ends ---- */
html.lcars #ui{gap:4px;padding:8px 10px;align-items:stretch}
html.lcars #ui::before,html.lcars #ui::after{content:"";width:44px;min-height:38px;background:var(--a);pointer-events:none}
html.lcars #ui::before{border-radius:19px 0 0 19px}html.lcars #ui::after{border-radius:0 19px 19px 0;background:var(--c)}
html.lcars #ui button{display:flex;align-items:flex-end;justify-content:flex-end;min-height:38px;min-width:84px;box-sizing:border-box;padding:4px 10px 5px;
  background:var(--b);color:var(--ink);border:0;border-radius:0;font:600 15px/1 var(--lf);letter-spacing:.06em;text-transform:uppercase;transition:filter .12s}
html.lcars #ui button:nth-of-type(5n+2){background:var(--c)}html.lcars #ui button:nth-of-type(5n+3){background:var(--e)}
html.lcars #ui button:nth-of-type(5n+4){background:var(--f)}html.lcars #ui button:nth-of-type(5n){background:var(--d)}
html.lcars #ui button:hover{filter:brightness(1.18)}
html.lcars #ui button:active,html.lcars #ui button[aria-pressed="true"],html.lcars #ui button[aria-expanded="true"]{background:var(--on);color:var(--ink);box-shadow:inset 0 -4px 0 rgba(0,0,0,.35)}
html.lcars #ui button:focus-visible,html.lcars .lc-btn:focus-visible{outline:2px solid #fff;outline-offset:2px}
/* ---- panels: an elbow of colour down the left and along the top, its inside corner rounded ---- */
html.lcars #views,html.lcars #display,html.lcars #pitpanel,html.lcars #menagerie,html.lcars #navpanel,html.lcars #cartopanel,html.lcars .entside,html.lcars #card,html.lcars #ent-help{
  --k:var(--a);background:rgba(0,0,0,.94);color:var(--txt);font-family:var(--lf);border:0;border-left:20px solid var(--k);border-top:10px solid var(--k);
  border-radius:30px 0 0 0;padding:12px 12px 12px 14px;box-shadow:none}
html.lcars #views::before,html.lcars #display::before,html.lcars #pitpanel::before,html.lcars #menagerie::before,html.lcars #navpanel::before,html.lcars #cartopanel::before,
html.lcars .entside::before,html.lcars #card::before,html.lcars #ent-help::before{content:"";position:absolute;left:0;top:0;width:16px;height:16px;pointer-events:none;
  background:radial-gradient(circle at 100% 100%,transparent 15.5px,var(--k) 16px)}
html.lcars #views{--k:var(--c)}html.lcars #display{--k:var(--d)}html.lcars #navpanel{--k:var(--e)}html.lcars #card{--k:var(--e)}html.lcars #ent-help{--k:var(--c)}
html.lcars #ent-orders{--k:var(--f)}html.lcars #ent-comms{--k:var(--c)}html.lcars #ent-sensors{--k:var(--e)}
/* headings: right-aligned capitals in the frame's colour */
html.lcars #views .sub,html.lcars #pitpanel .sub,html.lcars #menagerie .sub,html.lcars #display .lbl,html.lcars .entside .hd b,html.lcars #cartopanel .bar b,html.lcars #ent-help b{
  font:600 14px/1.2 var(--lf);letter-spacing:.16em;text-transform:uppercase;color:var(--k)}
html.lcars #views .sub,html.lcars #pitpanel .sub,html.lcars #menagerie .sub{grid-column:1/-1;text-align:right}
html.lcars .entside .hd b{text-align:right}
/* buttons in panels: pills, black on colour, the label low and to the right */
html.lcars #views button,html.lcars #display button,html.lcars #pitpanel button,html.lcars #navpanel button,html.lcars #cartopanel button,html.lcars .entside button,html.lcars #card button,html.lcars #timebar button,html.lcars #showui{
  background:var(--b);color:var(--ink);border:0;border-radius:15px;padding:6px 14px 5px;font:600 14px/1.1 var(--lf);letter-spacing:.05em;text-transform:uppercase;text-align:right;cursor:pointer;transition:filter .12s}
html.lcars #pitpanel button:nth-of-type(3n+1),html.lcars .entside .card:nth-child(3n+2) button{background:var(--f)}
html.lcars #pitpanel button:nth-of-type(3n+2),html.lcars .entside .card:nth-child(3n) button{background:var(--c)}
html.lcars #views button:hover,html.lcars #display button:hover,html.lcars #pitpanel button:hover,html.lcars #navpanel button:hover,html.lcars #cartopanel button:hover,html.lcars .entside button:hover,html.lcars #card button:hover,html.lcars #timebar button:hover{filter:brightness(1.18)}
html.lcars #views button[aria-current="true"],html.lcars #display button[aria-pressed="true"],html.lcars #pitpanel button[aria-pressed="true"],html.lcars #pitpanel button[aria-current="true"],
html.lcars #cartopanel button[aria-pressed="true"],html.lcars #cartopanel button[aria-selected="true"],html.lcars .entside button[aria-pressed="true"],html.lcars #navpanel button[aria-pressed="true"]{background:var(--on);box-shadow:inset 0 -3px 0 rgba(0,0,0,.35)}
html.lcars .entside .hd button{background:var(--k);border-radius:0 15px 15px 0;min-width:64px}
/* the readouts and cards inside */
html.lcars .entside .card,html.lcars #cartopanel .info{background:rgba(255,255,255,.03);border-left:8px solid var(--k);border-radius:8px 0 0 8px}
html.lcars .entside .card.foe{border-left-color:#ff5a46}html.lcars .entside .card.ok{border-left-color:var(--e)}
html.lcars .entside .card b,html.lcars #cartopanel .info b,html.lcars #card h2{color:var(--on);font-family:var(--lf);letter-spacing:.08em;text-transform:uppercase}
html.lcars .entside .row{border-bottom:1px dotted rgba(200,155,216,.35)}html.lcars .entside .row span:first-child{color:var(--c);opacity:1;text-transform:uppercase;letter-spacing:.06em}
html.lcars .entside small,html.lcars #cartopanel .hint,html.lcars #display .note{color:var(--dim)}
html.lcars .entside .log em{color:var(--a)}html.lcars .entside li.now{color:var(--on)}
html.lcars .entside .meter{background:#221a14;height:6px;border-radius:3px;overflow:hidden}
html.lcars #cartopanel canvas{border:0;border-radius:0 0 0 14px;background:#02050c}
html.lcars #cartopanel .list button{text-align:left;border-radius:4px 15px 15px 4px}
html.lcars #card p,html.lcars #card .sub{color:var(--txt);font-family:var(--lf)}
/* the readout at the top right, and the toasts */
html.lcars #timebar,html.lcars #hud{background:#000;color:var(--b);font:14px/1.3 var(--lf);letter-spacing:.04em;text-transform:uppercase;border:0;border-left:16px solid var(--c);border-right:16px solid var(--a);border-radius:12px;padding:5px 10px}
html.lcars #ent-toast{background:rgba(0,0,0,.92);border-left:18px solid var(--a);border-radius:16px 0 0 16px;color:var(--txt);font:14px/1.4 var(--lf)}
html.lcars #ent-toast b{color:var(--a);font-family:var(--lf);letter-spacing:.16em}
html.lcars #ent-help{font:13px/1.55 var(--lf);color:var(--txt)}
html.lcars #showui{border-radius:15px}
html.lcars #ent-marks .mk{font-family:var(--lf);font-size:12px;letter-spacing:.05em;text-transform:uppercase}
/* the readout's font and colour are set inline by the shared page, so they take !important here */
html.lcars #timebar{font:14px/1.3 var(--lf)!important;color:var(--b)!important}
html.lcars #attribution{bottom:auto;top:40px;right:12px;background:none;color:var(--dim);font:11px var(--lf);letter-spacing:.03em}
html.lcars #attribution a{color:var(--c)}
/* the touch helm */
html.lcars #ent-pad button{background:var(--b);color:var(--ink);border:0;border-radius:12px;font:600 18px var(--lf)}
html.lcars #ent-pad button:nth-child(odd){background:var(--c)}html.lcars #ent-pad button:active{background:var(--on)}
html.lcars #views,html.lcars #display,html.lcars #pitpanel,html.lcars #navpanel,html.lcars #cartopanel,html.lcars .entside{scrollbar-color:var(--k) #000;scrollbar-width:thin}
/* the loading screen */
html.lcars #loading{background:#000;color:var(--a);font-family:var(--lf);letter-spacing:.24em;text-transform:uppercase}
html.lcars #loading::before{content:"";width:min(420px,70vw);height:14px;background:linear-gradient(90deg,var(--a) 0 46%,#000 46% 47%,var(--c) 47% 70%,#000 70% 71%,var(--e) 71%);border-radius:7px}
html.lcars #loading .load-line{color:var(--b);text-transform:none;letter-spacing:.03em}
@media (max-width:600px){html.lcars #ui::before,html.lcars #ui::after{display:none}html.lcars #ui button{min-width:0}
  html.lcars #title{font-size:16px;letter-spacing:.12em}html.lcars #title::before{width:26px;height:16px}html.lcars #title::after{display:none}
  html.lcars #attribution{top:42px;right:14px;left:14px;text-align:left}}`;

export function lcars(){
  document.documentElement.classList.add('lcars');
  const st=document.createElement('style');st.id='lcars-css';st.textContent=CSS;
  document.head.appendChild(st);
}
