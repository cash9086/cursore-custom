/* =========================================================================
   cape-cursore.js — il cursore che morfa in punto, con magnetismo
   -------------------------------------------------------------------------
   Estratto dal footer della Home il 2026-09-19: da solo pesava tredicimila
   caratteri su un campo che ne ammette cinquantamila, quasi tutti per le due
   liste di coordinate della forma.

   COME SI INCLUDE
   ---------------
   Nel footer, DOPO il <div id="capecur"> e il suo <style>, che restano in
   pagina: questo file li cerca e non li crea.

     <script defer src="https://cdn.jsdelivr.net/gh/cash9086/cursore-custom@SHA/cape-cursore.js"></script>

   `defer` va bene: il contenitore e' gia' nel documento quando parte, e cosi'
   non ruba tempo al montaggio della pagina.

   CHE COSA LEGGE, DA FUORI
   ------------------------
     #capecur                  il proprio contenitore, con svg/anello/etichetta
     window.inkSection         la mappa dell'inchiostro, per sapere se il
                               puntatore e' sopra una zona gia' dipinta
     [data-cursor]             l'etichetta da mostrare su un elemento
     [data-cursor-fondo]       chiaro/scuro forzato a mano
     .cursor-view              le immagini che si prendono la scritta VIEW:
                               li' il cursore non prende nessuno stato, resta
                               il logo. Il selettore sta in VIEW_SEL, qui
                               sotto.

   CHE COSA SCRIVE, FUORI
   ----------------------
     #capecur.su-punto         acceso mentre il puntatore e' su un pulsante o
                               un link. La regola che riempie l'anello sta nel
                               <style> in pagina, con tutte le altre di
                               #capecur.
   ========================================================================= */
(function(){
  if(!matchMedia('(min-width:992px) and (hover:hover)').matches) return;

  var WAVE=[[879,229],[839,232],[800,235],[763,240],[728,246],[694,253],[653,263],[624,272],[583,286],[544,301],[507,319],[473,336],[449,351],[414,374],[381,399],[351,425],[325,453],[301,481],[281,511],[263,542],[248,578],[237,613],[230,658],[235,686],[241,688],[248,688],[260,688],[277,688],[300,689],[327,689],[361,689],[399,689],[444,689],[494,689],[550,689],[612,689],[680,689],[755,689],[805,689],[843,689],[881,689],[919,689],[957,689],[995,689],[1033,689],[1071,689],[1109,689],[1147,689],[1185,689],[1223,689],[1261,689],[1299,689],[1325,679],[1326,654],[1327,583],[1325,533],[1319,523],[1279,523],[1250,545],[1220,567],[1188,584],[1151,600],[1114,612],[1080,620],[1045,627],[1007,632],[965,635],[927,636],[890,635],[845,631],[814,627],[780,621],[741,611],[704,599],[669,584],[635,565],[605,542],[580,514],[564,480],[563,444],[576,409],[597,383],[627,358],[664,337],[700,321],[737,308],[773,299],[809,292],[846,287],[881,283],[919,282],[958,283],[998,285],[1037,290],[1068,284],[1066,243],[1029,235],[989,231],[951,229],[915,228]];
  var CIRC=[[778,264],[790,265],[802,266],[814,268],[826,270],[838,274],[849,278],[860,283],[871,288],[882,295],[892,301],[901,309],[911,317],[919,325],[927,335],[935,344],[941,354],[948,365],[953,376],[958,387],[962,398],[966,410],[968,422],[970,434],[971,446],[972,458],[971,470],[970,482],[968,494],[966,506],[962,518],[958,529],[953,540],[948,551],[941,562],[935,572],[927,581],[919,591],[911,599],[901,607],[892,615],[882,621],[871,628],[860,633],[849,638],[838,642],[826,646],[814,648],[802,650],[790,651],[778,652],[766,651],[754,650],[742,648],[730,646],[718,642],[707,638],[696,633],[685,628],[674,621],[664,615],[655,607],[645,599],[637,591],[629,581],[621,572],[615,562],[608,551],[603,540],[598,529],[594,518],[590,506],[588,494],[586,482],[585,470],[584,458],[585,446],[586,434],[588,422],[590,410],[594,398],[598,387],[603,376],[608,365],[615,354],[621,344],[629,335],[637,325],[645,317],[655,309],[664,301],[674,295],[685,288],[696,283],[707,278],[718,274],[730,270],[742,268],[754,266],[766,265]];

  var SIZE      = 30;
  var RING_IMG  = 92;
  var RING_DOT  = 7;                  /* sopra un pulsante: un punto, non un anello */
  var TILT      = 16;
  var TRAIL     = 0.20;
  var MAGNET    = 0.30;
  var MORPH     = 0.16;
  var LABEL_DEF = 'View';
  var MAG_SEL   = 'a,button,.w-button,.button,[data-magnetic]';
  var NO_MAG    = '.no-magnetic,[data-no-magnetic]';
  var VIEW_SEL  = '.cursor-view';
  /* Cose che non sono pulsanti ma il punto lo vogliono lo stesso. Il
     binario dello scroll a destra e' un div: non cadeva in nessuna rete e
     sopra di lui restava il logo. La sua zona sensibile riceve il
     puntatore solo quando gli sei vicino, quindi nominarlo basta e non
     serve nemmeno misurarlo — la scatola di .cape-rail e' 0x0, e la
     prova di visibilita' la scarterebbe. */
  var PUNTO_SEL = '.cape-rail';

  var d = document,
      cc    = d.getElementById('capecur'),
      svg   = cc.querySelector('svg'),
      path  = cc.querySelector('path'),
      ring  = cc.querySelector('.cc-ring'),
      label = cc.querySelector('.cc-label');

  svg.style.width = SIZE + 'px';
  d.documentElement.classList.add('capecur-on');

  function poly(t){
    var s = 'M', w, c, i;
    for(i = 0; i < WAVE.length; i++){
      w = WAVE[i]; c = CIRC[i];
      s += (i ? ' L' : '') + (w[0] + (c[0] - w[0]) * t).toFixed(1) + ',' + (w[1] + (c[1] - w[1]) * t).toFixed(1);
    }
    return s + 'Z';
  }
  function cl(v){ return v < 0 ? 0 : (v > 1 ? 1 : v); }

  path.setAttribute('d', poly(0));

  var tx = innerWidth / 2, ty = innerHeight / 2, cx = tx, cy = ty, pcx = cx;
  var rot = 0, scl = 1, tscl = 1, h = 0, th = 0, rmax = RING_DOT;
  var shown = false, media = false, punto = false, lastH = -1;

  var magEl = null, magRect = null, magTimer = null;

  function dropMagnet(){
    if(!magEl) return;
    var el = magEl;
    magEl = null; magRect = null;
    el.style.transform = '';
    clearTimeout(magTimer);
    magTimer = setTimeout(function(){ el.style.transition = ''; }, 320);
  }

  function takeMagnet(el){
    if(el === magEl) return;
    dropMagnet();
    if(!el) return;
    magEl = el;
    magRect = el.getBoundingClientRect();
    clearTimeout(magTimer);
    el.style.transition = 'transform .3s cubic-bezier(.2,.8,.2,1)';
  }

  addEventListener('mousemove', function(e){
    tx = e.clientX; ty = e.clientY;
    if(!shown){ shown = true; cc.style.opacity = 1; }
    if(magEl && magRect){
      magEl.style.transform = 'translate(' + ((e.clientX - magRect.left - magRect.width / 2) * MAGNET) + 'px,'
                                           + ((e.clientY - magRect.top - magRect.height / 2) * MAGNET) + 'px)';
    }
    sveglia();
  }, { passive:true });

  addEventListener('mousedown', function(){ tscl = .82; sveglia(); }, { passive:true });
  addEventListener('mouseup',   function(){ tscl = 1;   sveglia(); }, { passive:true });

  addEventListener('mouseover', function(e){
    var t = e.target;
    if(!t || !t.closest) return;

    valuta(t);

    if(MAGNET > 0){
      var mg = t.closest(MAG_SEL);
      if(mg && mg.closest(NO_MAG)) mg = null;
      takeMagnet(mg);
    }
    sveglia();
  }, { passive:true });

  addEventListener('mouseout', function(e){
    if(magEl && !magEl.contains(e.relatedTarget)) dropMagnet();
  }, { passive:true });

  addEventListener('scroll', function(){ if(magEl) magRect = magEl.getBoundingClientRect(); }, { passive:true });

  var girando = false;

  function raf(){
    cx += (tx - cx) * TRAIL;
    cy += (ty - cy) * TRAIL;
    h  += (th - h)  * MORPH;
    scl += (tscl - scl) * 0.2;

    var vx = cx - pcx; pcx = cx;
    var tr = Math.max(-TILT, Math.min(TILT, vx * 1.1));
    rot += (tr - rot) * 0.15;
    rot *= (1 - cl(h));

    var still = Math.abs(tx - cx) < 0.05 && Math.abs(ty - cy) < 0.05
             && Math.abs(th - h) < 0.0005 && Math.abs(tscl - scl) < 0.0005
             && Math.abs(rot) < 0.01;
    if(still){ girando = false; return; }

    requestAnimationFrame(raf);

    cc.style.transform = 'translate(' + cx + 'px,' + cy + 'px) scale(' + scl + ')';

    var shape = cl(h / 0.55);
    if(Math.abs(shape - lastH) > 0.002){ path.setAttribute('d', poly(shape)); lastH = shape; }

    var cross = cl((h - 0.45) / 0.15);
    svg.style.opacity   = 1 - cross;
    svg.style.transform = 'translate(-50%,-50%) rotate(' + rot + 'deg)';

    var ex = cl((h - 0.55) / 0.45), rs = 14 + (rmax - 14) * ex;
    ring.style.width   = rs + 'px';
    ring.style.height  = rs + 'px';
    ring.style.opacity = cross;

    label.style.opacity = media ? cl((h - 0.7) / 0.3) : 0;
  }

  function sveglia(){
    if(girando) return;
    girando = true;
    requestAnimationFrame(raf);
  }

  /* ====================================================================
     Che cosa c'e' davvero sotto il puntatore
     --------------------------------------------------------------------
     Tre domande, una per problema:
       - l'elemento sotto il mouse si vede, o e' li' ma ancora invisibile?
       - l'inchiostro ci e' gia' passato sopra?
       - il fondo e' chiaro o scuro?
     ==================================================================== */

  var SOGLIA     = 0.179;   /* sopra: fondo chiaro. E' il punto in cui #fff e
                               #141416 danno lo stesso contrasto (WCAG).      */
  var INK_SCURO  = true;    /* l'inchiostro porta il nero: dove e' passato il
                               cursore va bianco. Mettilo a false se un giorno
                               la transizione portera' una sezione chiara.    */
  var OPACO_MIN  = 0.06;    /* sotto questa opacita' un elemento non conta    */

  var suScuro = false, inCoda = false, tFondo = null;

  /* ——— l'elemento e' davvero visibile? ————————————————————————————
     L'header ha il logo in pagina da subito, ma trasparente finche' non si
     forma. Per il browser resta un <a> a tutti gli effetti, quindi il
     cursore ci si trasformava in anello sopra il nulla. Qui si guarda cio'
     che si vede: misura non nulla, niente visibility:hidden, e l'opacita'
     moltiplicata lungo tutta la catena dei genitori — perche' a spegnere
     il logo e' quasi sempre il contenitore, non il logo. */
  function visibile(el){
    if(!el || !el.getBoundingClientRect) return false;
    var r = el.getBoundingClientRect();
    if(r.width < 1 || r.height < 1) return false;
    var n = el, op = 1, st, o;
    while(n && n.nodeType === 1){
      st = getComputedStyle(n);
      if(st.visibility === 'hidden' || st.display === 'none') return false;
      o = parseFloat(st.opacity);
      if(!isNaN(o)) op *= o;
      if(op < OPACO_MIN) return false;
      n = n.parentElement;
    }
    return true;
  }

  /* ——— l'inchiostro ————————————————————————————————————————————————
     La sezione ink-bleed non si puo' interrogare col DOM: il canvas e'
     pointer-events:none e quello che si vede attraverso e' una fusione fra
     due sezioni, non un elemento. Ma il modulo espone la sua mappa di
     arrivo: arrivalAt(u,v) dice a che punto della corsa l'inchiostro
     raggiunge quel punto dello schermo. Confrontata con il progresso
     attuale diventa la domanda giusta: qui e' gia' inchiostro, si' o no?
     Torna null quando la mappa non e' ancora cotta o il puntatore e'
     altrove: in quel caso decide il DOM, come sempre. */
  function inkSotto(x, y){
    var s = window.inkSection;
    if(!s || !s.ready || !s.element || !s.element.isConnected) return null;
    var r = s.element.getBoundingClientRect();
    if(r.width < 1 || r.height < 1) return null;
    if(x < r.left || x > r.right || y < r.top || y > r.bottom) return null;
    var a = s.arrivalAt((x - r.left) / r.width, (y - r.top) / r.height);
    if(a === null || a === undefined) return null;
    return a <= s.progress;
  }

  /* Mentre l'inchiostro sta attraversando lo schermo, sotto di lui ci sono
     due sezioni sovrapposte e il mouse riceve gli eventi di quella che non
     stai guardando: e' per questo che compariva "VIEW" su una pagina dove
     non c'era ancora niente da vedere. Per tutta la traversata il cursore
     non prende stati da nessuno: resta il logo. A corsa finita (progresso
     1) la sezione sotto e' scoperta per davvero e torna tutto normale. */
  function inkInCorso(x, y){
    var s = window.inkSection;
    if(!s || !s.ready) return false;
    if(s.progress <= 0.001 || s.progress >= 0.999) return false;
    return inkSotto(x, y) !== null;
  }

  /* ——— lo stato del cursore ————————————————————————————————————————
     Un posto solo che decide: lo chiama il mouseover quando cambi elemento
     e lo richiama il giro qui sotto quando cambia la pagina sotto un mouse
     fermo. */
  function valuta(t){
    if(!t || !t.closest) t = d.elementFromPoint(tx, ty);
    var m = null, it = null, bin = null;
    /* Sopra un'immagine che si prende la scritta VIEW il cursore non prende
       nessuno stato: resta il logo e la lascia parlare da sola. Due cose che
       si trasformano nello stesso momento, a un palmo l'una dall'altra, sono
       una in piu'. */
    if(t && t.closest && !inkInCorso(tx, ty) && !t.closest(VIEW_SEL)){
      m  = t.closest('[data-cursor]');
      it = t.closest('a,button,[role=button],.w-button,.button');
      bin = t.closest(PUNTO_SEL);
      if(m  && !visibile(m))  m  = null;
      if(it && !visibile(it)) it = null;
    }
    /* Su un pulsante il cursore si chiude in un punto: l'anello da 46px e'
       una cornice intorno a un francobollo, e sopra le parole sottolineate
       della Home lo era in modo imbarazzante. */
    var p = !m && (!!it || !!bin);

    if(m){
      media = true; th = 1; rmax = RING_IMG;
      label.textContent = m.getAttribute('data-cursor') || LABEL_DEF;
    } else if(it || bin){
      media = false; th = 1; rmax = RING_DOT;
    } else {
      media = false; th = 0;
    }

    /* la classe la scrive solo quando cambia: non e' roba da fotogramma */
    if(p !== punto){ punto = p; cc.classList.toggle('su-punto', p); }
  }

  /* ——— il colore ————————————————————————————————————————————————— */
  function canale(v){ v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
  function luminanza(r, g, b){ return 0.2126 * canale(r) + 0.7152 * canale(g) + 0.0722 * canale(b); }

  /* Si scende nella pila sotto al puntatore e si prende il primo elemento
     con un fondo davvero opaco. Foto e video non hanno un colore da
     leggere: contano come scuri. Per ribaltare a mano una sezione o
     un'immagine, dalle in Webflow l'attributo data-cursor-fondo con valore
     scuro oppure chiaro. */
  function fondoSotto(x, y){
    if(!d.elementsFromPoint) return 1;
    var pila = d.elementsFromPoint(x, y), i, el, st, m, a, f;
    for(i = 0; i < pila.length; i++){
      el = pila[i];
      f = el.getAttribute && el.getAttribute('data-cursor-fondo');
      if(f === 'scuro')  return 0;
      if(f === 'chiaro') return 1;
      st = getComputedStyle(el);
      if(el.tagName === 'VIDEO' || (st.backgroundImage && st.backgroundImage !== 'none')) return 0;
      m = st.backgroundColor.match(/[\d.]+/g);
      if(!m) continue;
      a = m.length > 3 ? parseFloat(m[3]) : 1;
      if(a >= 0.5) return luminanza(+m[0], +m[1], +m[2]);
    }
    return 1;                        /* niente di opaco sotto: la pagina e' bianca */
  }

  function fondoScuro(x, y){
    var i = inkSotto(x, y);
    if(i === true) return INK_SCURO; /* qui comanda l'inchiostro, non il DOM */
    return fondoSotto(x, y) <= SOGLIA;
  }

  /* ——— il giro ————————————————————————————————————————————————————
     Una volta per fotogramma al massimo. Serve anche a mouse fermo: sotto
     scorrono le sezioni, l'inchiostro avanza, il logo dell'header si forma.
     Il colpo in coda a 650ms copre la transizione di .55s con cui le slide
     passano al nero dopo che lo scroll si e' gia' fermato. */
  function rileggi(){
    if(inCoda) return;
    inCoda = true;
    requestAnimationFrame(function(){
      inCoda = false;

      var primaTh = th, primaMedia = media;
      valuta(null);
      if(th !== primaTh || media !== primaMedia) sveglia();

      var scuro = fondoScuro(tx, ty);
      if(scuro === suScuro) return;
      suScuro = scuro;
      cc.classList.toggle('su-scuro', scuro);
    });
  }

  addEventListener('mousemove', rileggi, { passive:true });
  addEventListener('scroll', function(){
    rileggi();
    clearTimeout(tFondo);
    tFondo = setTimeout(rileggi, 650);
  }, { passive:true });

  window.capePatti && capePatti.dichiara('cursore', {
    scrivo: [['su-punto', '#capecur', 'il puntatore e\' su un pulsante: l\'anello si chiude in un punto pieno']],
    leggo: [['window.inkSection', '', 'la mappa dell\'inchiostro: dice se il puntatore e\' su una zona gia\' dipinta'],
            ['data-cursor', '[data-cursor]', 'l\'etichetta da mostrare dentro l\'anello'],
            ['data-cursor-fondo', '[data-cursor-fondo]', 'chiaro/scuro forzato a mano invece della misura del colore'],
            ['.cursor-view', VIEW_SEL, 'le immagini con la scritta VIEW: li\' il cursore resta il logo']]
  });

  rileggi();

  sveglia();
})();
