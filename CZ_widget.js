(function () {
  'use strict';
  // CZ_PRUZNE_SKLO_PL_BASE_V25_2026_06_28 — polská logika 1:1, česká lokalizace, GLS 185 Kč, size-limit + buttons fix

  // Ochrana proti dvojímu načtení / konfliktu s jiným widgetem (stejná DOM id #sg-root).
  // Bez toho dvě instance na jedné stránce rozbijí kliknutí (duplicitní id → mrtvé tlačítko).
  if (window.__mkWidgetActive || document.getElementById('sg-root')) return;
  window.__mkWidgetActive = true;

  const WORKER_URL = 'https://bot-cz.metsukisutemi.workers.dev';
  const SG_AVATAR = 'https://static.tildacdn.com/stor3530-6335-4030-b366-363966383437/5efb2fc2ea144f1ae0d2f12885474f78.jpg';

  function getUTM() {
    return {
      source:   new URLSearchParams(location.search).get('utm_source')   || sessionStorage.getItem('mk_utm_source')   || '',
      medium:   new URLSearchParams(location.search).get('utm_medium')   || sessionStorage.getItem('mk_utm_medium')   || '',
      campaign: new URLSearchParams(location.search).get('utm_campaign') || sessionStorage.getItem('mk_utm_campaign') || '',
    };
  }
  ['source','medium','campaign'].forEach(k => {
    const v = new URLSearchParams(location.search).get('utm_'+k);
    if (v) sessionStorage.setItem('mk_utm_'+k, v);
  });

  function genSID() {
    return '№ ' + String(Math.floor(100000 + Math.random() * 900000));
  }

  // CZK částky: 1194.80 -> "1194,80"
  function m(v){
    const raw=String(v==null?'':v).replace(/\s+/g,'').replace(',', '.');
    const n=Number(raw);
    if(!Number.isFinite(n))return String(v==null?'':v);
    return Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ',');
  }
  function moneyNumber(v){
    const n=Number(String(v==null?'':v).replace(/\s+/g,'').replace(',', '.'));
    return Number.isFinite(n)?Math.round(n):0;
  }

  const MIN_SIDE_CM = 30;
  const MAX_SHORT_SIDE_CM = 160;
  const MAX_LONG_SIDE_CM = 2000;
  const SIZE_BUTTONS = ['80×60 cm','90×60 cm','100×80 cm','120×80 cm','120×100 cm','140×80 cm','160×90 cm','Mám více rozměrů','Nevím přesně'];

  function dimLimitReason(w,h,isCircle){
    w=Number(w||0); h=Number(h||w||0);
    if(!w||!h)return '';
    if(w<MIN_SIDE_CM||h<MIN_SIDE_CM)return 'minimální rozměr je 30×30 cm';
    if(isCircle){
      if(w>MAX_SHORT_SIDE_CM)return 'u kruhu je maximální průměr 160 cm';
      return '';
    }
    const shorter=Math.min(w,h), longer=Math.max(w,h);
    if(shorter>MAX_SHORT_SIDE_CM)return 'kratší strana může mít maximálně 160 cm';
    if(longer>MAX_LONG_SIDE_CM)return 'delší strana může mít maximálně 2000 cm';
    return '';
  }

  function invalidSizeMessage(w,h,isCircle){
    const label=isCircle?('Ø'+w+' cm kulatý rozměr'):(w+'×'+h+' cm rozměr');
    const reason=dimLimitReason(w,h,isCircle)||'překračuje povolený limit';
    return 'Tento rozměr bohužel neumíme vyrobit.\n\n'+label+': '+reason+'.\n\nU kruhu a čtverce je maximum 160 cm. U obdélníku je kratší strana max. 160 cm a delší strana max. 2000 cm.\n\nProsím zadejte jiný rozměr v cm.';
  }

  function findInvalidSizeInText(text){
    const s=String(text||'');
    for(const mm of s.matchAll(/(?:kruh|průměr|prumer|[⌀Øø])\s*[⌀Øø]?\s*(\d{2,4})\s*cm?/gi)){
      const d=parseInt(mm[1],10);
      if(dimLimitReason(d,d,true))return {w:d,h:d,isCircle:true};
    }
    for(const mm of s.matchAll(/(?:^|[^\d.,])(\d{2,4})\s*[xX×х\/]\s*(\d{2,4})(?:\s*cm)?(?![\d.,])/gi)){
      const w=parseInt(mm[1],10), h=parseInt(mm[2],10);
      if(dimLimitReason(w,h,false))return {w,h,isCircle:false};
    }
    return null;
  }

  const CSS = `
    #sg-root{position:fixed;bottom:24px;right:24px;z-index:2147483647;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;}
    #sg-btn{width:58px;height:58px;border-radius:50%;background:#1c3d2e;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,.22);transition:transform .2s,box-shadow .2s;position:relative;}
    #sg-btn:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.28);}
    #sg-btn{animation:sg-chat-btn-pulse 1.9s ease-out infinite;}
    #sg-btn:hover{animation-play-state:paused;}
    @keyframes sg-chat-btn-pulse{0%{box-shadow:0 4px 16px rgba(0,0,0,.22),0 0 0 0 rgba(28,61,46,.45);}70%{box-shadow:0 4px 16px rgba(0,0,0,.22),0 0 0 13px rgba(28,61,46,0);}100%{box-shadow:0 4px 16px rgba(0,0,0,.22),0 0 0 0 rgba(28,61,46,0);}}
    #sg-btn svg{width:26px;height:26px;stroke:#fff;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;}
    #sg-badge{position:absolute;top:-2px;right:-2px;width:18px;height:18px;border-radius:50%;background:#e53e3e;border:2px solid #fff;display:none;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;}
    #sg-tooltip{position:absolute;bottom:68px;right:0;background:#1c3d2e;color:#fff;font-size:13px;padding:10px 14px;border-radius:12px 12px 0 12px;white-space:nowrap;box-shadow:0 4px 16px rgba(0,0,0,.2);display:none;cursor:pointer;line-height:1.4;}
    #sg-tooltip:after{content:'';position:absolute;bottom:-6px;right:16px;border:6px solid transparent;border-top-color:#1c3d2e;border-bottom:none;}
    #sg-box{position:absolute;bottom:70px;right:0;width:340px;background:#fff;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,.15);display:flex;flex-direction:column;overflow:hidden;max-height:calc(100vh - 120px);transition:opacity .2s,transform .2s;transform-origin:bottom right;}
    #sg-box.hidden{opacity:0;transform:scale(.95) translateY(8px);pointer-events:none;}
    #sg-hd{background:#1c3d2e;padding:14px 16px;display:flex;align-items:center;gap:10px;flex-shrink:0;}
    .sg-hav{width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:#fff;flex-shrink:0;}
    .sg-photo{background:#f4e6d6 url("${SG_AVATAR}") center/cover no-repeat!important;color:transparent;font-size:0;box-shadow:0 0 0 2px rgba(255,255,255,.14);}
    .sg-htxt{flex:1;min-width:0;}
    .sg-hname{color:#fff;font-size:14px;font-weight:600;}
    .sg-hname::after{content:'24/7';display:inline-block;margin-left:7px;padding:2px 6px;border-radius:999px;background:rgba(104,211,145,.18);color:#b7f5c8;font-size:10px;font-weight:800;vertical-align:middle;letter-spacing:.2px;}
    .sg-hsub{color:rgba(255,255,255,.6);font-size:11px;margin-top:2px;display:flex;align-items:center;gap:5px;}
    .sg-online{width:6px;height:6px;background:#68d391;border-radius:50%;animation:sg-pulse 2s infinite;}
    @keyframes sg-pulse{0%,100%{opacity:1}50%{opacity:.4}}
    #sg-x{background:none;border:none;cursor:pointer;color:rgba(255,255,255,.5);font-size:18px;line-height:1;padding:2px 4px;transition:color .15s;flex-shrink:0;}
    #sg-x:hover{color:#fff;}
    #sg-sid{text-align:center;font-size:10px;color:#b8b0a4;padding:3px 0;background:#f7f6f3;font-family:monospace;flex-shrink:0;}
    #sg-trust{display:flex;justify-content:center;gap:0;background:#eef3ee;flex-shrink:0;border-bottom:1px solid #dde8dd;}
    .sg-ti{flex:1;text-align:center;font-size:10px;font-weight:600;color:#2c5840;padding:5px 2px;letter-spacing:.1px;}
    #sg-log{flex:1;overflow-y:auto;padding:14px 12px;display:flex;flex-direction:column;gap:10px;background:#f7f6f3;min-height:220px;max-height:300px;}
    #sg-log::-webkit-scrollbar{width:3px;}
    #sg-log::-webkit-scrollbar-thumb{background:#d0c8bc;border-radius:2px;}
    .sg-row{display:flex;align-items:flex-end;gap:7px;}
    .sg-row.u{flex-direction:row-reverse;}
    .sg-ava{width:26px;height:26px;border-radius:50%;background:#1c3d2e;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;}
    .sg-photo-sm{background:#f4e6d6 url("${SG_AVATAR}") center/cover no-repeat!important;color:transparent;font-size:0;}
    .sg-bubble{max-width:78%;padding:9px 13px;font-size:14px;line-height:1.55;word-break:break-word;white-space:pre-wrap;border-radius:14px;}
    .sg-row.b .sg-bubble{background:#fff;color:#1a1a1a;border-bottom-left-radius:3px;box-shadow:0 1px 3px rgba(0,0,0,.08);}
    .sg-row.u .sg-bubble{background:#1c3d2e;color:#fff;border-bottom-right-radius:3px;}
    .sg-typing .sg-bubble{padding:11px 14px;}
    .sg-dots span{display:inline-block;width:6px;height:6px;background:#b0a898;border-radius:50%;margin:0 2px;animation:sg-b 1.2s infinite;}
    .sg-dots span:nth-child(2){animation-delay:.2s}.sg-dots span:nth-child(3){animation-delay:.4s}
    @keyframes sg-b{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}
    .sg-ts{text-align:center;font-size:11px;color:#b8b0a4;margin:2px 0;}
    #sg-qr{padding:6px 10px 4px;display:flex;flex-wrap:wrap;gap:6px;background:#f7f6f3;flex-shrink:0;min-height:0;}
    .sg-qbtn{background:#fff;border:1.5px solid #1c3d2e;color:#1c3d2e;border-radius:20px;padding:6px 13px;font-size:13px;cursor:pointer;transition:all .15s;font-family:inherit;line-height:1.3;}
    .sg-qbtn:hover{background:#1c3d2e;color:#fff;}
    .sg-pay-wrap{display:flex;justify-content:center;padding:8px 0;}
    .sg-pay-card{margin:10px 12px;padding:13px 12px 14px;border-radius:16px;background:#ffffff;border:1px solid #dfe7df;box-shadow:0 4px 14px rgba(28,61,46,.10);box-sizing:border-box;}
    .sg-pay-title{font-size:13px;color:#374151;line-height:1.45;margin-bottom:10px;text-align:center;}
    .sg-pay-btn{display:flex;align-items:center;justify-content:center;flex-direction:column;gap:3px;background:#1c3d2e;color:#fff;text-decoration:none;padding:15px 16px;border-radius:16px;font-size:14px;font-weight:800;letter-spacing:0;box-shadow:0 7px 18px rgba(28,61,46,.22);transition:transform .15s,box-shadow .15s,filter .15s;width:100%;min-height:58px;box-sizing:border-box;border:none;}
    .sg-pay-btn:hover{transform:translateY(-1px);box-shadow:0 8px 18px rgba(28,61,46,.24);filter:brightness(1.03);}
    .sg-pay-btn .sg-pay-main{font-size:16px;font-weight:900;color:#fff;line-height:1.2;}
    .sg-pay-btn .sg-pay-amount{font-size:20px;font-weight:900;color:#fff;line-height:1.25;white-space:nowrap;}
    .sg-pay-note{font-size:11px;color:#6b7280;text-align:center;margin-top:7px;line-height:1.35;}
    .sg-pay-switch{font-size:12px;color:#6b7280;text-align:center;cursor:pointer;margin-top:10px;text-decoration:underline;text-underline-offset:3px;}
    .sg-pay-loading{margin:8px 12px;padding:14px 14px;border-radius:14px;background:#f7f7f5;border:1px solid #ece7de;}
    .sg-pay-loading-top{font-size:13px;color:#374151;line-height:1.45;margin-bottom:10px;text-align:center;}
    .sg-pay-loading-btn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;max-width:100%;margin:0 auto;background:#1c3d2e;color:#fff;border-radius:12px;padding:12px 14px;border:none;opacity:.92;box-sizing:border-box;}
    .sg-pay-loading-spinner{width:16px;height:16px;border-radius:50%;border:2px solid rgba(255,255,255,.28);border-top-color:#ffffff;animation:sg-spin .8s linear infinite;}
    @keyframes sg-spin{to{transform:rotate(360deg);}}
    .sg-cod-box{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:10px 14px;font-size:13px;color:#15803d;text-align:center;margin:4px 12px;}
    #sg-ft{display:flex;gap:8px;padding:10px 12px;border-top:1px solid #ede8e0;background:#fff;flex-shrink:0;align-items:flex-end;}
    #sg-ta{flex:1;border:1.5px solid #ddd7ce;border-radius:10px;padding:9px 12px;font-size:14px;line-height:1.4;resize:none;outline:none;max-height:80px;font-family:inherit;color:#1a1a1a;background:#faf8f5;transition:border-color .15s;}
    #sg-ta:focus{border-color:#1c3d2e;background:#fff;}
    #sg-ta::placeholder{color:#b8b0a4;}
    #sg-go{width:38px;height:38px;border-radius:10px;background:#1c3d2e;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .15s;padding:0;align-self:flex-end;}
    #sg-go:hover{background:#142d21;}
    #sg-go:disabled{background:#c5bdb4;cursor:not-allowed;}
    #sg-go svg{width:17px;height:17px;stroke:#fff;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}
    #sg-pw{text-align:center;font-size:10px;color:#c5bdb4;padding:5px;background:#fff;flex-shrink:0;border-top:1px solid #f0ebe2;}
    @media(max-width:400px){#sg-root{bottom:16px;right:16px;}#sg-box{width:calc(100vw - 32px);right:0;}}
  `;

  const SID = genSID();
  let open=false, busy=false, started=false;
  let hist=[];
  let ses={
    name:null,phone:null,email:null,contact:null,circleSize:null,
    thickness:null,
    price:null,product:null,address:null,
    paymentMethod:null,total:null,delivery:null,stripeUrl:null,
    leadFired:false,
    phoneRequest:false,
    paymentLinkSent:false,
    hasSummary:false,orderConfirmed:false,deliveryDataRequested:false,paymentStep:false,
    pendingAddressParts:[],
    sessionSavedOnce:false,
    _saveTimer:null,
    _warmLeadSent:false,
  };

  function build(){
    const s=document.createElement('style');s.textContent=CSS;document.head.appendChild(s);
    const r=document.createElement('div');r.id='sg-root';
    r.innerHTML=`
      <div id="sg-box" class="hidden">
        <div id="sg-hd">
          <div class="sg-hav sg-photo" aria-hidden="true"></div>
          <div class="sg-htxt">
            <div class="sg-hname">Klára — online poradkyně</div>
            <div class="sg-hsub"><span class="sg-online"></span>dostupná 24/7 · sklomekke.cz</div>
          </div>
          <button id="sg-x">✕</button>
        </div>
        <div id="sg-sid">ID chatu: ${SID}</div>
        <div id="sg-trust">
          <span class="sg-ti">✓ Chat 24/7</span>
          <span class="sg-ti">✓ Okamžitá cena</span>
          <span class="sg-ti">✓ Bezpečná platba</span>
        </div>
        <div id="sg-log" role="log" aria-live="polite"></div>
        <div id="sg-qr"></div>
        <div id="sg-ft">
          <textarea id="sg-ta" rows="1" placeholder="Napište zprávu…"></textarea>
          <button id="sg-go">
            <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
        <div id="sg-pw">chat 24/7 · sklomekke.cz</div>
      </div>
      <div id="sg-tooltip">Klára je online 24/7 — spočítám cenu za 30 s. 👋</div>
      <button id="sg-btn">
        <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span id="sg-badge"></span>
      </button>
    `;
    document.body.appendChild(r);
  }

  const el=id=>document.getElementById(id);
  function scroll(){const l=el('sg-log');l.scrollTop=l.scrollHeight;}
  function addTime(){
    const d=new Date(),t=document.createElement('div');
    t.className='sg-ts';
    t.textContent=d.getHours().toString().padStart(2,'0')+':'+d.getMinutes().toString().padStart(2,'0');
    el('sg-log').appendChild(t);
  }
  function addBot(text){
    el('sg-log').querySelector('.sg-typing')?.remove();
    const row=document.createElement('div');row.className='sg-row b';
    row.innerHTML=`<div class="sg-ava sg-photo-sm"></div><div class="sg-bubble">${text.replace(/\n/g,'<br>')}</div>`;
    el('sg-log').appendChild(row);scroll();
  }
  function addUser(text){
    const row=document.createElement('div');row.className='sg-row u';
    row.innerHTML=`<div class="sg-bubble">${text.replace(/[<>&]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]))}</div>`;
    el('sg-log').appendChild(row);clearQR();scroll();
  }
  function showTyping(){
    const row=document.createElement('div');row.className='sg-row b sg-typing';
    row.innerHTML=`<div class="sg-ava sg-photo-sm"></div><div class="sg-bubble"><span class="sg-dots"><span></span><span></span><span></span></span></div>`;
    el('sg-log').appendChild(row);scroll();
  }
  function lock(v){el('sg-ta').disabled=v;el('sg-go').disabled=v;}

  function insertDeliveryTemplate(){
    const ta=el('sg-ta');
    ta.value=`Jméno a příjmení:
Telefon:
E-mail:
Ulice a číslo domu:
PSČ:
Město:`;
    ta.focus();
    ta.style.height='auto';
    ta.style.height=Math.min(ta.scrollHeight,80)+'px';
  }

  function setQR(buttons){
    const qr=el('sg-qr');qr.innerHTML='';
    buttons.forEach(label=>{
      const btn=document.createElement('button');
      btn.className='sg-qbtn';btn.textContent=label;
      btn.onclick=()=>{
        if(label.includes('Vložit šablonu')){insertDeliveryTemplate();return;}
        send(label);
      };
      qr.appendChild(btn);
    });
  }
  function clearQR(){el('sg-qr').innerHTML='';}
  function hasFullDeliveryData(){return Boolean((ses.phone||ses.contact)&&ses.email&&ses.address);}

  function detectQR(botText){
    if(ses.paymentLinkSent)return;
    const raw=String(botText||'');
    const t=raw.toLowerCase();

    const asksDelivery=/zkopírujte a doplňte|jméno a příjmení:|telefon:|e-mail:|ulice a číslo domu|psč:|město:|údaje pro doručení/i.test(raw);
    if(asksDelivery){
      ses.deliveryDataRequested=true;ses.orderConfirmed=true;
      setQR(['📋 Vložit šablonu údajů','Mám otázku před údaji','Změnit / přidat rozměr','Dotaz k dopravě']);
      return;
    }

    const isSummary=/souhrn objednávky|potvrzujete objednávku/i.test(raw)&&/spolu|cena skla|doprava gls/i.test(raw);
    if(isSummary&&!ses.deliveryDataRequested){
      ses.hasSummary=true;
      setQR(['Ano, potvrzuji','Přidat další rozměr','Změnit rozměr','Dotaz k dopravě']);
      return;
    }

    const asksPayment=/jak chcete zaplatit|způsob platby|online kartou|dobírku/i.test(raw)&&ses.deliveryDataRequested&&hasFullDeliveryData();
    if(asksPayment){
      ses.paymentStep=true;
      setQR(['💳 Platba kartou online','🚚 Dobírka','Které vybrat?']);
      return;
    }

    // 4) Tloušťka — před intenzitou, protože odpověď o kuchyni obsahuje slovo "kuchyň".
    if(/kterou tloušťku|tloušťku si vyberete|1,5mm.*2mm|2mm.*1,5mm/i.test(raw)&&!ses.price){
      setQR(['1,5mm — levnější','2mm — pevnější','Doporučte mi variantu','Ukázat rozdíl','Výprodej -50%']);
      return;
    }

    // 5) Rozměry — populární rozměry + více rozměrů.
    if(/zadejte rozměry v cm|rozměry v cm|rozměr v cm|např\. 120×80/i.test(raw)&&!ses.price){
      setQR(SIZE_BUTTONS);
      return;
    }

    // 6) Typ povrchu — úvodní otázka.
    if(/jaký povrch|povrch má váš stůl|matné dřevo|sklo\/lak/i.test(t)){
      setQR(['Matné dřevo','Sklo / lak / lesk','Laminát','Nevím / poradit','Mám otázku']);

    // 7) Intenzita / použití.
    }else if(/kuchyň|denní používání|pracovna|obývák|intenziv/i.test(t)&&!ses.price){
      setQR(['Kuchyň / denní používání','Jídelna / děti','Obývák / méně často','Psací stůl','Terasa / zahrada','Nevím']);

    // 8) Výprodejová varianta.
    }else if(/výprodej|výprodeji|polovina ceny|poloviční cen|-50%/i.test(t)){
      setQR(['Ano, výprodej -50%','Ne, standardní','Ukázat standardní cenu']);

    // 9) Nestandardní tvary.
    }else if(/fotku nebo nákres|fotografie nebo nákres|nestandardní tvar|zaoblené rohy|ovál/i.test(t)){
      setQR(['Pošlu na e-mail','Chci kontakt operátora','Mám jednoduchý obdélník']);

    // 10) Čtverec / kruh / jiný tvar.
    }else if(/kulatý|čtvercový|kruh|čtverec/i.test(t)){
      setQR(['Kulatý stůl','Čtvercový stůl','Nevím','Jiný tvar']);

    // 11) Další stoly.
    }else if(/další stoly|více stolů|ještě jiné|to je vše/i.test(t)){
      setQR(['Ano, mám více','Ne, to je vše','Mám více rozměrů']);

    // 12) Obecné dotazy / FAQ.
    }else if(/otázku|pomoci|poradit|s čím mohu/i.test(t)&&!ses.hasSummary){
      setQR(['Spočítat cenu','Rozdíl 1,5mm / 2mm','Posouvá se?','Doprava a čas','Vrácení / reklamace','Čištění']);
    }
  }

  function clearPaymentUi(){
    el('sg-log').querySelectorAll('#sg-pay-state, .sg-pay-loading, .sg-pay-ready').forEach(n=>n.remove());
  }

  function showPaymentLoading(total){
    clearQR();clearPaymentUi();
    const sidEl=el('sg-sid');
    if(sidEl)sidEl.textContent='Číslo objednávky: '+SID;
    const w=document.createElement('div');
    w.id='sg-pay-state';w.className='sg-pay-loading';
    w.innerHTML=
      '<div class="sg-pay-loading-top">Připravuji bezpečný platební odkaz. Obvykle to trvá pár sekund.</div>'+
      '<div class="sg-pay-loading-btn">'+
        '<span class="sg-pay-loading-spinner"></span>'+
        '<span class="sg-pay-amount">Generuji odkaz '+m(total)+' Kč</span>'+
      '</div>'+
      '<div class="sg-pay-note">Po vytvoření se zobrazí tlačítko pro platbu kartou.</div>';
    el('sg-log').appendChild(w);scroll();
  }

  function showPayBtn(url,total){
    clearQR();clearPaymentUi();
    const sidEl=el('sg-sid');
    if(sidEl)sidEl.textContent='Číslo objednávky: '+SID;
    const w=document.createElement('div');
    w.id='sg-pay-state';w.className='sg-pay-ready';
    w.className='sg-pay-ready sg-pay-card';
    w.innerHTML=
      '<div class="sg-pay-title">Objednávka <strong>'+SID+'</strong> bude zpracována po zaplacení.</div>'+
      '<a href="'+url+'" target="_blank" rel="noopener" class="sg-pay-btn" aria-label="Zaplatit kartou">'+
        '<span class="sg-pay-main">Zaplatit kartou</span>'+
        '<span class="sg-pay-amount">'+m(total)+' Kč</span>'+
      '</a>'+
      '<div class="sg-pay-note">Bezpečná platba přes Stripe. Karta, Google Pay nebo Apple Pay.</div>'+
      '<div class="sg-pay-switch" onclick="window.__mkChangeToCOD&&window.__mkChangeToCOD('+moneyNumber(total)+')">'+
        'Změnit na dobírku'+
      '</div>';
    el('sg-log').appendChild(w);scroll();

    window.__mkChangeToCOD=function(t){
      ses.paymentMethod='cod';
      clearPaymentUi();clearQR();
      showCOD(t);
      fireUpdate('payment_changed_to_cod',{payment_method:'cod',total:t});
      savePostPaymentUpdate('payment_changed_to_cod_button');
    };
  }

  function showCOD(total){
    clearQR();
    const sidEl=el('sg-sid');
    if(sidEl)sidEl.textContent='Číslo objednávky: '+SID;
    const d=document.createElement('div');d.className='sg-cod-box';
    d.innerHTML='✅ Objednávka přijata!<br>Číslo objednávky: <strong>'+SID+'</strong><br>Platba na dobírku: <strong>'+m(total)+' Kč</strong><br>Brzy se vám ozveme.';
    el('sg-log').appendChild(d);scroll();
  }

  async function openChat(){
    open=true;el('sg-box').classList.remove('hidden');
    el('sg-badge').style.display='none';el('sg-tooltip').style.display='none';
    if(!started){
      started=true;showTyping();
      await new Promise(r=>setTimeout(r,600));
      el('sg-log').querySelector('.sg-typing')?.remove();
      const firstMsg='Dobrý den! 👋 Jsem Klára, poradkyně Pružného skla 24/7.\n\nZa méně než minutu spočítám cenu pružného skla na váš stůl — i večer a o víkendu.\n\nJaký povrch má váš stůl?';
      addBot(firstMsg);
      hist.push({role:'assistant',content:firstMsg});
      addTime();
      setQR(['Matné dřevo','Sklo / lak / lesk','Laminát','Nevím / poradit','Mám otázku']);
    }
    el('sg-ta').focus();
  }

  function closeChat(){
    sessionStorage.setItem('mk_auto_block','1');
    open=false;el('sg-box').classList.add('hidden');
    if(!hasContactData()&&hist.length>1){
      saveSessionNow('close_no_contact');
    }
  }

  // ── Data extraction ──────────────────────────────────────────────────────
  // CZ telefon: +420 / 00420 / 0 — české telefonní číslo
  function getPhone(t){
    const raw=String(t||'');
    const m=raw.match(/(?:\+420[\s-]?|00420[\s-]?|0)?[1-9]\d{2}[\s-]?\d{3}[\s-]?\d{3}/);
    if(!m)return null;
    const clean=m[0].replace(/[^\d]/g,'');
    if(clean.length<9||clean.length>12)return null;
    return m[0].replace(/[\s-]/g,'');
  }
  function getEmail(t){const m=t.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);return m?m[0]:null;}

  const NOT_NAMES=new Set(['chci','chtěl','chtela','mám','mam','ano','ne','online','dobírka','dobirka','objednávka','objednavka','objednat','dotaz','otázka','otazka','kontakt','telefon','kolik','cena','stůl','stul','obdélník','obdelnik','čtverec','ctverec','kruh','rozměr','rozmer','tloušťka','tloustka','produkt','doprava','platba','adresa']);
  const ADDR_EXCLUDE=/^(?:❓\s*)?Mám otázku$|^Mám otázku před údaji$|^Matné dřevo$|^Sklo\s*\/\s*lak\s*\/\s*lesk$|^Laminát$|^Nevím\s*\/\s*poradit$|^Kuchyň\s*\/\s*denní používání$|^Jídelna\s*\/\s*děti$|^Obývák\s*\/\s*méně často$|^Psací stůl$|^Terasa\s*\/\s*zahrada$|^Nevím$|^1,5mm\s*—\s*levnější$|^2mm\s*—\s*pevnější$|^Doporučte mi variantu$|^Ukázat rozdíl$|^Výprodej -50%$|^Ano,\s*výprodej -50%$|^Ne,\s*standardní$|^Ukázat standardní cenu$|^Kulatý stůl$|^Čtvercový stůl$|^Jiný tvar$|^Ano,\s*potvrzuji$|^Ano,\s*mám více$|^Ne,\s*to je vše$|^Přidat další rozměr$|^Změnit rozměr$|^Změnit\s*\/\s*přidat rozměr$|^Mám více rozměrů$|^Nevím přesně$|^(?:💳\s*)?Platba kartou online$|^(?:🚚\s*)?Dobírka$|^Které vybrat\?$|^Dotaz k dopravě$|^\d{2,4}[×x]\d{2,4}\s*cm$|^📋\s*Vložit šablonu údajů$/i;
  function normalizeAddressPart(t){
    return String(t||'')
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,'')
      .replace(/(?:\+420[\s-]?|00420[\s-]?|0)?[1-9]\d{2}[\s-]?\d{3}[\s-]?\d{3}/g,'')
      .replace(/^[,;\s]+|[,;\s]+$/g,'')
      .replace(/\s+/g,' ')
      .trim();
  }

  function looksLikeAddressPart(t){
    const v=String(t||'').trim();
    if(!v||ADDR_EXCLUDE.test(v))return false;
    if(getEmail(v)&&normalizeAddressPart(v).length<3)return false;
    if(/^[+\d\s-]{7,}$/.test(v))return false;
    if(/\d{2,3}\s*[xX×]\s*\d{2,3}/.test(v))return false;
    return /\b\d{4}\b|\b(ulice|ul\.|nám\.|náměstí|namesti|třída|tř\.|trida|nábřeží|nabrezi|náves|naves)\b/i.test(v)||/\d/.test(v);
  }

  function rememberAddressPart(t){
    const part=normalizeAddressPart(t);
    if(!part||part.length<3||ADDR_EXCLUDE.test(part))return;
    if(!looksLikeAddressPart(part))return;
    if(!ses.pendingAddressParts.includes(part))ses.pendingAddressParts.push(part);
    ses.address=ses.pendingAddressParts.join(', ');
  }

  function cleanAddressTail(value){
    return String(value||'')
      .replace(/\bBrzy\s+se\s+vám\s+ozveme[\s\S]*$/i,'')
      .replace(/\bOdkaz\s+na\s+platbu[\s\S]*$/i,'')
      .replace(/\bPlatební\s+odkaz[\s\S]*$/i,'')
      .replace(/[;,\s]+$/g,'')
      .trim();
  }

  function getAddressFromBot(t){
    const m=String(t||'').match(/Adresa:\s*([\s\S]*?)(?:\n\s*(?:Brzy|Odkaz na platbu|Platební odkaz)|\n\s*\n|$)/i);
    if(!m)return null;
    const addr=cleanAddressTail(m[1]).split('\n').map(x=>x.trim()).filter(Boolean).join(', ').replace(/^[,;\s]+|[,;\s]+$/g,'').trim();
    return addr||null;
  }

  function getNameFromAddressValue(addr){
    const raw=String(addr||'').trim();
    if(!raw)return null;
    let first=raw.split(',')[0]||'';
    first=first
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,' ')
      .replace(/(?:tel\.?|telefon|phone)\s*[:.]?/ig,' ')
      .replace(/(?:\+420[\s-]?|00420[\s-]?|0)?[1-9]\d{2}[\s-]?\d{3}[\s-]?\d{3}/g,' ')
      .replace(/\b(ulice|ul\.|nám\.|náměstí|namesti|třída|tř\.|trida|nábřeží|nabrezi|náves|naves)\b[\s\S]*$/i,' ')
      .replace(/\d{4}[\s\S]*$/,' ')
      .replace(/[^A-Za-zÁČĎÉĚÍŇÓŘŠŤÚŮÝŽáčďéěíňóřšťúůýž .'-]/g,' ')
      .replace(/\s+/g,' ')
      .trim();
    const words=first.split(/\s+/).filter(Boolean).slice(0,3);
    if(words.length<2)return null;
    if(words.some(w=>w.length<2||NOT_NAMES.has(w.toLowerCase())||/mm|cm|Kč/i.test(w)))return null;
    const name=words.join(' ');
    return isBadName(name)?null:name;
  }

  function getNameFromBotAddress(t){return getNameFromAddressValue(getAddressFromBot(t));}

  function cleanMoney(v){return String(v||'').replace(/\s+/g,'').replace(',','.');}

  function getMoneyValuesFromLine(line){
    return [...String(line||'').matchAll(/([\d\s]+(?:[,.]\d+)?)\s*(?:Kč|HUF|huf)/gi)]
      .map(m=>parseFloat(cleanMoney(m[1])))
      .filter(n=>Number.isFinite(n));
  }

  function isProductLine(line){
    const l=String(line||'').trim();
    if(!/^[-—•▪■]/.test(l))return false;
    if(/doprava|spolu|cena skla|dodání|dodani|adresa|link|platba/i.test(l))return false;
    return /\d{2,4}\s*[xX×х]\s*\d{2,4}|kruh|obdélník|čtverec|průměr|prumer|cm|mm|lesklé|rýhované|výprodej/i.test(l)&&/Kč|huf/i.test(l);
  }

  function getProductLines(t){
    return String(t||'').split('\n').map(l=>l.trim()).filter(isProductLine);
  }

  function sumProductLines(t){
    const lines=getProductLines(t);
    let sum=0;
    for(const line of lines){
      const vals=getMoneyValuesFromLine(line);
      if(vals.length)sum+=vals[vals.length-1];
    }
    return sum>0?String(Math.round(sum*100)/100).replace('.00',''):null;
  }

  function getPrice(t){
    let m=String(t||'').match(/Cena\s+skla[:\s]+([\d\s]+(?:[,.]\d+)?)\s*(?:Kč|huf)/i);
    if(m)return cleanMoney(m[1]);
    m=String(t||'').match(/Cena\s+zboží[:\s]+([\d\s]+(?:[,.]\d+)?)\s*(?:Kč|huf)/i);
    if(m)return cleanMoney(m[1]);
    const summed=sumProductLines(t);
    if(summed)return summed;
    return null;
  }

  function getTotal(t){
    const m=String(t||'').match(/Spolu[:\s]+([\d\s]+(?:[,.]\d+)?)\s*(?:Kč|HUF|huf)?/i);
    return m?cleanMoney(m[1]):null;
  }

  function getDelivery(t){
    const s=String(t||'');
    if(/GLS\s+doprava[:\s]+(?:zdarma|gratis|0)|Doprava[:\s]+(?:zdarma|gratis)/i.test(s))return 'gratis';
    const m=s.match(/GLS\s+doprava[:\s]+([\d\s]+(?:[,.]\d+)?)\s*(?:Kč|HUF|huf)/i)||s.match(/Doprava[:\s]+([\d\s]+(?:[,.]\d+)?)\s*(?:Kč|HUF|huf)/i);
    return m?cleanMoney(m[1]):null;
  }

  function getProduct(t){
    const productLines=getProductLines(t);
    return productLines.length?productLines.map(l=>l.replace(/^[-—•▪■]\s*/,'').trim()).join(' | '):null;
  }

  // ── Rozpoznání tloušťky z konverzace ────────────────────────────
  // Rozpoznání tloušťky z konverzace.
  function detectThickness(text){
    const s=String(text||'').toLowerCase();
    const rýhované=/rýhované|ryhovane/.test(s);
    const výprodej=/výprodej|vyprodej/.test(s);
    if(výprodej)return 'výprodej 1,5mm';
    if(/2\s*mm|2mm|2\.0\s*mm|pevnější|pevnejsi|silnější|silnejsi|tlustší|tlustsi/.test(s))return rýhované?'rýhované 2mm':'lesklé 2mm';
    if(/1[\s.,]*5\s*mm|1\.5mm|1,5mm|levnější|levnejsi|tenčí|tenci|tenká|tenka/.test(s))return rýhované?'rýhované 1,5mm':'lesklé 1,5mm';
    if(rýhované)return 'rýhované 1,5mm';
    return null;
  }
  function captureThickness(text){
    const t=detectThickness(text);
    if(t)ses.thickness=t;
  }

  // ── Záložní údaje o produktu z konverzace ─────
  function getDimsFallback(){
    const userText=hist.filter(m=>m.role==='user').map(m=>m.content).join('\n');
    const found=[];
    const pushDim=(w,h)=>{
      w=parseInt(w,10);h=parseInt(h,10);
      if(dimLimitReason(w,h,false))return;
      found.push(w+'×'+h+' cm');
    };
    // 1) s "cm": 120×80 cm, 81x40 cm
    for(const mm of userText.matchAll(/(\d{2,4})\s*[xX×х\/]\s*(\d{2,4})\s*cm/gi))pushDim(mm[1],mm[2]);
    // 2) bez "cm": 120x80, 120 × 80, 120/80, 120 na 80
    for(const mm of userText.matchAll(/(?:^|[^\d.,])(\d{2,4})\s*(?:[xX×х\/]|na)\s*(\d{2,4})(?![\d.,])/gi))pushDim(mm[1],mm[2]);
    // Kruhové rozměry: kruh ⌀90, průměr 90 cm
    const circles=[...userText.matchAll(/(?:kruh|průměr|prumer|[⌀Øø])\s*[⌀Øø]?\s*(\d{2,4})\s*cm?/gi)]
      .map(mm=>parseInt(mm[1],10))
      .filter(d=>!dimLimitReason(d,d,true))
      .map(d=>'kruh ⌀'+d+' cm');
    let all=[...new Set([...found,...circles])];
    if(ses.circleSize){
      const d=parseInt(ses.circleSize,10);
      if(!dimLimitReason(d,d,true)){
        const idx=all.indexOf(d+'×'+d+' cm');
        if(idx>=0)all[idx]='kruh ⌀'+d+' cm';
        all=[...new Set(all)];
      }
    }
    if(!all.length)return null;
    const th=ses.thickness?(', '+ses.thickness):'';
    return all.map(dim=>{
      if(dim.indexOf('kruh')===0||dim.indexOf('⌀')>=0){
        const d=(dim.match(/(\d{2,4})/)||[])[1]||'';
        return 'Kruh ⌀ '+d+' cm'+th;
      }
      return 'Obdélník '+dim+th;
    }).join(' | ');
  }

  const BAD_NAME_RE=/\b(zajímá|zajima|hledám|hledam|telefon|telefonicky|zpětné volání|zpetne volani|stůl|stul|obdélník|obdelnik|čtverec|ctverec|kruh|kuchyně|kuchyne|kolik|cena|platba|doprava|adresa|rozměr|rozmer|tloušťka|tloustka|produkt)\b/i;

  function titleCaseName(name){
    return String(name||'').split(/\s+/).filter(Boolean).map(w=>w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join(' ');
  }

  function cleanFinalName(name){
    const n=String(name||'').trim().replace(/\s+/g,' ');
    if(!n||isBadName(n))return'';
    return titleCaseName(n);
  }

  function wantsPhoneContact(text){
    return/(telefonicky|po\s+telefonu|zavolejte\s+mi|ať\s+mi\s+zavoláte|at\s+mi\s+zavolate|zavolat\s+mi|zpětné\s+volání|zpetne\s+volani|chci\s+(?:aby\s+)?(?:mi\s+)?zavol|telefonický\s+kontakt|telefonicky\s+kontakt|kontaktujte\s+mě\s+telefonicky)/i.test(String(text||''));
  }

  function isBadName(n){
    const v=String(n||'').trim().toLowerCase();
    if(!v)return true;
    if(BAD_NAME_RE.test(v))return true;
    if(/[,@0-9]/.test(v))return true;
    const parts=v.split(/\s+/).filter(Boolean);
    if(parts.length<2||parts.length>3)return true;
    if(parts.some(p=>NOT_NAMES.has(p)||p.length<2||/mm|cm|Kč|huf/i.test(p)))return true;
    if(!/^[A-Za-zÁČĎÉĚÍŇÓŘŠŤÚŮÝŽáčďéěíňóřšťúůýž .'-]+$/i.test(v))return true;
    return false;
  }

  function cleanNameCandidate(t){
    let v=String(t||'')
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,' ')
      .replace(/(?:tel\.?|telefon|phone)\s*[:.]?/ig,' ')
      .replace(/(?:\+420[\s-]?|00420[\s-]?|0)?[1-9]\d{2}[\s-]?\d{3}[\s-]?\d{3}/g,' ')
      .replace(/\b(ulice|ul\.|nám\.|náměstí|namesti|třída|tř\.|trida|nábřeží|nabrezi|náves|naves)\b[\s\S]*$/i,' ')
      .replace(/\d{4}[\s\S]*$/,' ')
      .split(',')[0]
      .replace(/^[,;:\s]+|[,;:\s]+$/g,'')
      .replace(/\s+/g,' ')
      .trim();
    return v;
  }

  function getName(t){
    const raw=String(t||'').trim();
    if(!raw||ADDR_EXCLUDE.test(raw))return null;
    const lastBot=hist.filter(m=>m.role==='assistant').slice(-1)[0]?.content||'';
    const botAskedShipping=/jméno|jmeno|příjmení|prijmeni|telefon|e-mail|email|údaje pro doručení|udaje pro doruceni|ulice|číslo domu|cislo domu|psč|psc|město|mesto/i.test(lastBot);
    const hasContactOrAddress=!!(getPhone(raw)||getEmail(raw)||/\d{4}|\b(ulice|ul\.|nám\.|náměstí|namesti|třída|tř\.|trida|nábřeží|nabrezi|náves|naves)\b/i.test(raw));
    if(!botAskedShipping&&!hasContactOrAddress&&!/(?:jméno|jmeno|jmenuji se|jmenuju se|jsem)[:\s]/i.test(raw))return null;
    let explicit=raw.match(/(?:jméno|jmeno|jmenuji se|jmenuju se|jsem)\s*:?\s*([A-Za-zÁČĎÉĚÍŇÓŘŠŤÚŮÝŽáčďéěíňóřšťúůýž .'-]+(?:\s+[A-Za-zÁČĎÉĚÍŇÓŘŠŤÚŮÝŽáčďéěíňóřšťúůýž .'-]+)?)/i);
    let candidate=explicit?explicit[1]:cleanNameCandidate(raw);
    const words=candidate.replace(/[^A-Za-zÁČĎÉĚÍŇÓŘŠŤÚŮÝŽáčďéěíňóřšťúůýž .'-]/g,' ').split(/\s+/).map(w=>w.trim()).filter(Boolean).slice(0,3);
    if(words.length<2)return null;
    if(words.some(w=>w.length<2||NOT_NAMES.has(w.toLowerCase())||/mm|cm|Kč/i.test(w)))return null;
    const name=words.join(' ');
    return isBadName(name)?null:name;
  }

  function getAddress(t){
    const raw=String(t||'').trim();
    if(!raw||ADDR_EXCLUDE.test(raw))return null;
    const withoutContact=normalizeAddressPart(raw);
    if(/\d{4}/.test(raw)){rememberAddressPart(withoutContact||raw);return ses.address||withoutContact||raw;}
    if(/\b(ulice|ul\.|nám\.|náměstí|namesti|třída|tř\.|trida|nábřeží|nabrezi|náves|naves)\b/i.test(raw)){rememberAddressPart(withoutContact||raw);return ses.address||withoutContact||raw;}
    const lastBot=hist.filter(m=>m.role==='assistant').slice(-1)[0]?.content||'';
    const botAskedAddress=/adresa|ulice|číslo domu|cislo domu|město|mesto|psč|psc|údaje pro doručení|udaje pro doruceni/i.test(lastBot);
    if(botAskedAddress&&looksLikeAddressPart(raw)){rememberAddressPart(withoutContact||raw);return ses.address||withoutContact||raw;}
    const hasContact=getEmail(raw)||getPhone(raw);
    if(hasContact&&withoutContact&&withoutContact.length>3&&!ADDR_EXCLUDE.test(withoutContact)){rememberAddressPart(withoutContact);return ses.address||withoutContact;}
    return null;
  }

  function buildSummary(){return hist.filter(m=>m.role==='user').slice(-4).map(m=>m.content.slice(0,80)).join(' | ');}
  function buildFullChat(){return hist.map(m=>(m.role==='user'?'👤 ':'🤖 ')+m.content).join('\n---\n');}

  function formatProductForTG(){
    const src=ses.product||getDimsFallback();
    if(!src)return'upřesňuje se';
    const lines=src.split('|').map(p=>p.trim()).filter(Boolean);
    return lines.map(p=>{
      const isCircle=p.includes('kruh')||p.includes('⌀');
      const icon=isCircle?'⭕':'▪️';
      const hasQty=/×\d+|x\d+|\d+\s*db/.test(p);
      return icon+' '+p+(hasQty?'':' (×1)');
    }).join('\n');
  }

  function buildLeadData(extra={}){
    const utm=getUTM();
    const pNum=parseFloat(ses.price)||0;
    // FIX: dopravu vždy počítáme z hodnoty skla, ne z textu bota.
    // Zdarma pouze od hodnoty skla 3000 Kč, jinak 185 Kč.
    let delivery;
    let total;
    if(pNum>0){
      delivery=pNum>=3000?'gratis':'185';
      total=String(Math.round(delivery==='gratis'?pNum:pNum+185));
    }else{
      delivery=ses.delivery||'185';
      total=ses.total||'';
    }
    if(delivery)ses.delivery=delivery;
    if(total)ses.total=String(total);
    const derivedName=(!ses.name||isBadName(ses.name))?getNameFromAddressValue(ses.address):null;
    if(derivedName)ses.name=derivedName;
    if(ses.name&&isBadName(ses.name))ses.name='';
    const finalName=cleanFinalName(ses.name);
    return{
      session_id:SID,
      request_type:ses.phoneRequest?'phone_request':'',
      name:finalName,
      phone:ses.phone||'',
      email:ses.email||'',
      contact:ses.contact||'',
      product:ses.product||getDimsFallback()||(ses.phoneRequest?'Žádost o telefonický kontakt':''),
      product_formatted:ses.phoneRequest&&!ses.product?'📞 Žádost o telefonický kontakt':formatProductForTG(),
      price:ses.price||'',
      delivery,
      total:ses.total||'',
      address:ses.address||'',
      payment_method:ses.paymentMethod||'',
      stripe_url:ses.stripeUrl||'',
      summary:buildSummary(),
      full_chat:buildFullChat(),
      utm_source:utm.source,
      utm_medium:utm.medium,
      utm_campaign:utm.campaign,
      messages:hist,
      ...extra,
    };
  }

  async function fireLead(extra={}){
    if(ses.leadFired)return;
    if(!ses.phone&&!ses.email&&!ses.contact)return;
    try{
      const payload=buildLeadData(extra);
      const res=await fetch(WORKER_URL+'/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      let data={};
      try{data=await res.json();}catch(_){}
      if(res.ok&&data.ok!==false){ses.leadFired=true;}
      else{console.error('[MK] Lead failed:',data.error||res.status);}
    }catch(e){console.error('[MK] Lead error:',e);}
  }

  async function fireUpdate(changeType,extra={}){
    try{
      await fetch(WORKER_URL+'/update',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...buildLeadData(),...extra,change_type:changeType})});
    }catch(e){console.error('[MK] Update error:',e);}
  }

  function hasContactData(){return!!(ses.phone||ses.email||ses.contact);}

  function clearSessionTimer(){if(ses._saveTimer){clearTimeout(ses._saveTimer);ses._saveTimer=null;}}

  async function saveSessionNow(reason='session'){
    if(!hist.length)return;
    try{
      await fetch(WORKER_URL+'/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(buildLeadData({save_reason:reason,sheet_action:'upsert_by_session_id',session_saved_before:ses.sessionSavedOnce?'yes':'no'}))});
      ses.sessionSavedOnce=true;
    }catch(e){console.error('[MK] Session save error:',e);}
  }

  function scheduleSessionSave(reason='idle_no_contact'){
    clearSessionTimer();
    if(hasContactData())return;
    ses._saveTimer=setTimeout(()=>{if(!hasContactData())saveSessionNow(reason);},60000);
  }

  function savePostPaymentUpdate(reason='post_payment_update'){
    if(!ses.paymentLinkSent)return;
    saveSessionNow(reason);
  }

  // ── Warm lead: je e-mail a cena, ale objednávka není uzavřena ────────────────
  async function scheduleWarmLead(){
    if(ses._warmLeadSent)return;
    if(!ses.email&&!ses.contact)return;
    if(!ses.price)return;
    if(ses.paymentLinkSent)return;
    ses._warmLeadSent=true;
    try{
      await fetch(WORKER_URL+'/warm-lead',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(buildLeadData({warm_captured_at:Date.now()})),
      });
    }catch(e){console.error('[MK] Warm lead error:',e);}
  }

  async function sendLeadWithStripe(stripeUrl){
    ses.stripeUrl=stripeUrl;
    if(ses.leadFired){
      await fetch(WORKER_URL+'/session',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(buildLeadData({save_reason:'stripe_url_update',stripe_url:stripeUrl,payment_method:'stripe',sheet_action:'upsert_by_session_id'})),
      });
    } else {
      await fireLead();
    }
  }

  async function generateStripe(){
    try{
      const lastBot=hist.filter(m=>m.role==='assistant').slice(-1)[0]?.content||'';
      const pNum=parseFloat(ses.price)||0;
      const parsedTotal=getTotal(lastBot);
      // FIX: deterministická doprava a celková částka — nespoléháme na text bota.
      // Zdarma pouze od hodnoty skla 3000 Kč, jinak se do částky Stripe přidá 185 Kč.
      const deliveryVal=pNum>0?(pNum>=3000?'gratis':'185'):(ses.delivery||'185');
      ses.delivery=deliveryVal;
      const finalTotal=pNum>0
        ? String(Math.round(deliveryVal==='gratis'?pNum:pNum+185))
        : (ses.total||parsedTotal||'');
      ses.total=String(finalTotal);
      const paymentPayload=buildLeadData({product:ses.product||getDimsFallback()||'Pružné sklo',product_formatted:formatProductForTG(),total:finalTotal,payment_method:'stripe',contact:ses.email||ses.phone||ses.contact||''});
      showPaymentLoading(finalTotal);
      const res=await fetch(WORKER_URL+'/payment',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(paymentPayload)});
      const d=await res.json();
      if(d.ok&&d.url){
        ses.stripeUrl=d.url;
        ses.stripeSessionId=d.session_id||'';
        const shownTotal=(d.amount!=null?d.amount:finalTotal);
        showPayBtn(d.url,shownTotal);
        await sendLeadWithStripe(d.url);
      }else{
        clearPaymentUi();
        console.error('[MK] Stripe:',d.error);
        addBot('Nastal problém s online platbou. Napište nám na sklomekke@gmail.com a pomůžeme vám.');
      }
    }catch(e){clearPaymentUi();console.error('[MK] Stripe error:',e);}
  }

  async function send(quickText){
    const ta=el('sg-ta');
    const text=(quickText||ta.value).trim();
    if(!text||busy)return;
    if(!quickText){ta.value='';ta.style.height='auto';}
    busy=true;lock(true);
    clearSessionTimer();
    addUser(text);showTyping();

    const invalidDirectSize=findInvalidSizeInText(text);
    if(invalidDirectSize){
      el('sg-log').querySelector('.sg-typing')?.remove();
      const msg=invalidSizeMessage(invalidDirectSize.w,invalidDirectSize.h,invalidDirectSize.isCircle);
      hist.push({role:'user',content:text});
      hist.push({role:'assistant',content:msg});
      addBot(msg);addTime();setQR(SIZE_BUTTONS);
      busy=false;lock(false);el('sg-ta').focus();return;
    }

    if(wantsPhoneContact(text))ses.phoneRequest=true;
    if(/dobírka|dobirka|převzetí|prevzeti|kurýr|kuryr|hotově|hotove|na dobírku/i.test(text))ses.paymentMethod='cod';
    if(/online|kartou|kartu|platba kartou|stripe/i.test(text))ses.paymentMethod='stripe';

    if(/ano.*kruh|kruh.*ano|kulatý|kulaty|kruhový|kruhovy/i.test(text)||text==='Kulatý stůl'){
      const allText=hist.map(m=>m.content).join(' ');
      const sameDims=[...allText.matchAll(/(\d{2,3})\s*[xX×]\s*(\d{2,3})\s*cm/g)].filter(m=>m[1]===m[2]);
      if(sameDims.length>0){
        const d=parseInt(sameDims[sameDims.length-1][1],10);
        const circleReason=dimLimitReason(d,d,true);
        if(circleReason){
          el('sg-log').querySelector('.sg-typing')?.remove();
          const msg=invalidSizeMessage(d,d,true);
          hist.push({role:'user',content:text});
          hist.push({role:'assistant',content:msg});
          addBot(msg);addTime();setQR(SIZE_BUTTONS);
          busy=false;lock(false);el('sg-ta').focus();return;
        }
        ses.circleSize=String(d);
        if(ses.product)ses.product=ses.product.replace(new RegExp(d+'[×x]'+d+'\\s*cm'),'kruh ⌀'+d+' cm');
        else ses.product='kruh ⌀'+d+' cm';
      }
    }

    if(ses.paymentLinkSent&&ses.paymentMethod!=='cod'&&/dobírka|dobirka|převzetí|prevzeti|cod|změnit platbu|zmenit platbu|změna platby|zmena platby|na dobírku/i.test(text)){
      ses.paymentMethod='cod';
      const pNum=parseFloat(ses.price)||0;
      const deliveryVal=pNum>0?(pNum>=3000?'gratis':'185'):(ses.delivery||'185');
      const total=pNum>0?String(Math.round(deliveryVal==='gratis'?pNum:pNum+185)):(ses.total||'');
      ses.delivery=deliveryVal;ses.total=String(total);
      showCOD(total);
      if(ses.leadFired){await fireUpdate('payment_changed_to_cod',{payment_method:'cod',total});}
      else{await fireLead();}
      savePostPaymentUpdate('payment_changed_to_cod');
      busy=false;lock(false);el('sg-ta').focus();return;
    }

    const phone=getPhone(text),email=getEmail(text),name=getName(text),addr=getAddress(text);
    captureThickness(text);
    if(phone&&!ses.phone)ses.phone=phone;
    if(email&&!ses.email)ses.email=email;
    if(name&&(!ses.name||isBadName(ses.name)))ses.name=name;
    if(addr)ses.address=addr;
    if((phone||email)&&!ses.contact)ses.contact=phone||email;

    hist.push({role:'user',content:text});

    if(ses.phoneRequest&&(ses.phone||ses.contact)&&!ses.leadFired){
      if(!ses.product)ses.product='Žádost o telefonický kontakt';
      await fireLead({status:'phone_request',request_type:'phone_request'});
    }

    if(!hasContactData()){scheduleSessionSave('idle_no_contact_after_user');}
    else if(ses.paymentLinkSent){savePostPaymentUpdate('post_payment_user_message');}

    try{
      const res=await fetch(WORKER_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:hist})});
      const data=await res.json();
      const reply=data.content?.[0]?.text||'Omlouvám se, zkuste to prosím znovu.';
      hist.push({role:'assistant',content:reply});

      const invalidReplySize=findInvalidSizeInText(reply);
      if(invalidReplySize){
        const fixedMsg=invalidSizeMessage(invalidReplySize.w,invalidReplySize.h,invalidReplySize.isCircle);
        hist[hist.length-1]={role:'assistant',content:fixedMsg};
        el('sg-log').querySelector('.sg-typing')?.remove();
        addBot(fixedMsg);addTime();setQR(SIZE_BUTTONS);
        if(!hasContactData())scheduleSessionSave('idle_invalid_size');
        busy=false;lock(false);el('sg-ta').focus();return;
      }

      const price=getPrice(reply),totalParsed=getTotal(reply),deliveryParsed=getDelivery(reply),product=getProduct(reply),addrBot=getAddressFromBot(reply),nameAddr=getNameFromBotAddress(reply);
      captureThickness(reply);
      if(price)ses.price=price;
      if(totalParsed)ses.total=totalParsed;
      if(deliveryParsed)ses.delivery=deliveryParsed;
      if(product)ses.product=product;
      if(addrBot)ses.address=addrBot;
      if(nameAddr&&(!ses.name||isBadName(ses.name)))ses.name=nameAddr;
      if(/telefonický kontakt|telefonicky kontakt|zavoláme|zavolame|zpětné volání|zpetne volani|telefonní číslo|telefonni cislo/i.test(reply))ses.phoneRequest=true;
      if(/dobírka|dobirka|převzetí|prevzeti|kurýr|kuryr|na dobírku/i.test(reply))ses.paymentMethod='cod';
      if(/odkaz na platbu|platební odkaz|online|kartou|karta/i.test(reply)&&ses.paymentMethod!=='cod')ses.paymentMethod='stripe';

      addBot(reply);addTime();detectQR(reply);

      if(ses.email&&ses.price&&!ses.paymentLinkSent&&!ses._warmLeadSent){
        scheduleWarmLead();
      }

      if(!hasContactData()){scheduleSessionSave('idle_no_contact_after_bot');}
      else if(ses.paymentLinkSent){savePostPaymentUpdate('post_payment_bot_reply');}

      const isConfirm=/Přijala jsem objednávku|Odkaz na platbu|Platební odkaz|Spolu[:\s]/i.test(reply);
      if(isConfirm&&hasFullDeliveryData()&&!ses.paymentLinkSent){
        ses.paymentLinkSent=true;
        if(ses.paymentMethod==='cod'){
          const pNum=parseFloat(ses.price)||0;
          const deliveryVal=pNum>0?(pNum>=3000?'gratis':'185'):(ses.delivery||'185');
          const total=pNum>0?String(Math.round(deliveryVal==='gratis'?pNum:pNum+185)):(ses.total||'');
          ses.delivery=deliveryVal;ses.total=String(total);
          showCOD(total);
          fireLead();
        }else{
          generateStripe();
        }
      }
    }catch(e){
      el('sg-log').querySelector('.sg-typing')?.remove();
      addBot('Krátký výpadek spojení. Pošlete prosím zprávu ještě jednou.');
      if(!hasContactData())scheduleSessionSave('idle_error_no_contact');
      else if(ses.paymentLinkSent)savePostPaymentUpdate('post_payment_error');
    }finally{
      busy=false;lock(false);el('sg-ta').focus();
    }
  }

  function autoOpen(){
    if(sessionStorage.getItem('mk_auto_done')||sessionStorage.getItem('mk_auto_block'))return;

    // Náhledová bublina po 8 sekundách
    setTimeout(()=>{
      if(!open&&!sessionStorage.getItem('mk_auto_block')){
        const t=el('sg-tooltip');
        if(t)t.style.display='block';
      }
    },8000);

    // Automatické otevření po 50 sekundách
    setTimeout(()=>{
      if(!open&&!sessionStorage.getItem('mk_auto_block')){
        sessionStorage.setItem('mk_auto_done','1');
        openChat();
      }
    },50000);
  }

  function init(){
    build();
    el('sg-btn').addEventListener('click',()=>{sessionStorage.setItem('mk_auto_block','1');open?closeChat():openChat();});
    el('sg-x').addEventListener('click',closeChat);
    el('sg-go').addEventListener('click',()=>send());
    el('sg-tooltip').addEventListener('click',()=>{sessionStorage.setItem('mk_auto_block','1');openChat();});
    el('sg-ta').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}});
    el('sg-ta').addEventListener('input',function(){this.style.height='auto';this.style.height=Math.min(this.scrollHeight,80)+'px';});
    autoOpen();
  }

  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
