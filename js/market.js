// Marché flea live — données tarkov.dev (API GraphQL communautaire)
// © 2026 coyotte-hue — module accueil NORVINSK.INTEL
(function () {
  var API = 'https://api.tarkov.dev/graphql';
  var grid = document.getElementById('marketGrid');
  var statusEl = document.getElementById('marketStatus');
  var searchEl = document.getElementById('marketSearch');
  var refreshBtn = document.getElementById('marketRefresh');
  var modeBtns = Array.prototype.slice.call(document.querySelectorAll('.market-modes .fbtn'));
  var quickBtns = Array.prototype.slice.call(document.querySelectorAll('.market-quick button'));
  if (!grid) return;

  var TOP_NAMES = [
    'Graphics card',
    'LEDX Skin Transilluminator',
    'Physical bitcoin',
    'Military circuit board',
    'Tetriz portable game',
    'Intelligence folder',
    'VPX Flash Storage Module',
    'Gas analyzer',
    'Roler Submariner gold wrist watch',
    'GP coin',
    'Military COFDM Wireless Signal Transmitter',
    'Moonshine'
  ];

  // Prix indicatifs si l'API est injoignable (ordre de grandeur, pas du live)
  var FALLBACK = [
    { name: 'Graphics card', shortName: 'GPU', avg24hPrice: 875000, lastLowPrice: 849000, w: 2, h: 1, trend: 2.4, trader: 'Mechanic', traderPrice: 231500, icon: './assets/icons/technical.webp' },
    { name: 'Physical bitcoin', shortName: 'Bitcoin', avg24hPrice: 812000, lastLowPrice: 799000, w: 1, h: 1, trend: -1.2, trader: 'Mechanic', traderPrice: 168000, icon: './assets/icons/financial.webp' },
    { name: 'LEDX Skin Transilluminator', shortName: 'LEDX', avg24hPrice: 128000, lastLowPrice: 119000, w: 1, h: 1, trend: 3.1, trader: 'Therapist', traderPrice: 31200, icon: './assets/icons/medical.webp' },
    { name: 'Intelligence folder', shortName: 'Intel', avg24hPrice: 245000, lastLowPrice: 238000, w: 1, h: 1, trend: 0.8, trader: 'Therapist', traderPrice: 41800, icon: './assets/icons/project.webp' },
    { name: 'Military circuit board', shortName: 'Circuits', avg24hPrice: 78000, lastLowPrice: 74000, w: 1, h: 1, trend: -2.5, trader: 'Mechanic', traderPrice: 18900, icon: './assets/icons/technical.webp' },
    { name: 'Tetriz portable game', shortName: 'Tetriz', avg24hPrice: 46500, lastLowPrice: 44000, w: 1, h: 1, trend: 5.6, trader: 'Mechanic', traderPrice: 9800, icon: './assets/icons/test.webp' },
    { name: 'Gas analyzer', shortName: 'Analyseur', avg24hPrice: 34500, lastLowPrice: 32000, w: 2, h: 1, trend: -0.6, trader: 'Therapist', traderPrice: 12400, icon: './assets/icons/technical.webp' },
    { name: 'Roler Submariner gold wrist watch', shortName: 'Roler', avg24hPrice: 38500, lastLowPrice: 36000, w: 1, h: 1, trend: 1.1, trader: 'Therapist', traderPrice: 19800, icon: './assets/icons/financial.webp' },
    { name: 'GP coin', shortName: 'GP', avg24hPrice: 28700, lastLowPrice: 27500, w: 1, h: 1, trend: 0.3, trader: 'Therapist', traderPrice: 14200, icon: './assets/icons/financial.webp' },
    { name: 'VPX Flash Storage Module', shortName: 'VPX', avg24hPrice: 62000, lastLowPrice: 59000, w: 1, h: 1, trend: -3.2, trader: 'Mechanic', traderPrice: 15600, icon: './assets/icons/technical.webp' },
    { name: 'Military COFDM Wireless Signal Transmitter', shortName: 'COFDM', avg24hPrice: 54000, lastLowPrice: 51000, w: 2, h: 1, trend: 1.8, trader: 'Mechanic', traderPrice: 17800, icon: './assets/icons/technical.webp' },
    { name: 'Moonshine', shortName: 'Moonshine', avg24hPrice: 198000, lastLowPrice: 192000, w: 2, h: 2, trend: -0.9, trader: 'Jaeger', traderPrice: 8900, icon: './assets/icons/user.webp' }
  ];

  // Vraies images objets hébergées localement (wiki Tarkov, © Battlestate Games) — secours hors-ligne
  var MARKET_IMGS = {
    'Graphics card': './assets/market/gpu.png',
    'LEDX Skin Transilluminator': './assets/market/ledx.png',
    'Physical bitcoin': './assets/market/bitcoin.png',
    'Military circuit board': './assets/market/circuit.png',
    'Tetriz portable game': './assets/market/tetriz.png',
    'Intelligence folder': './assets/market/intel.png',
    'VPX Flash Storage Module': './assets/market/vpx.png',
    'Gas analyzer': './assets/market/gas.png',
    'Roler Submariner gold wrist watch': './assets/market/roler.png',
    'GP coin': './assets/market/gpcoin.png',
    'Military COFDM Wireless Signal Transmitter': './assets/market/cofdm.png',
    'Moonshine': './assets/market/moonshine.png'
  };

  var state = { mode: 'pvp', q: '', offline: false };
  var fmtN = new Intl.NumberFormat('fr-FR');
  function fmt(n) { return (n == null || n === 0) ? '—' : fmtN.format(n) + ' ₽'; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  function setStatus(t) { if (statusEl) statusEl.textContent = t; }

  function skeletons(n) {
    var h = '';
    for (var i = 0; i < (n || 8); i++) h += '<tr class="m-skel-row"><td colspan="5"><div class="m-skel-bar"></div></td></tr>';
    grid.innerHTML = h;
  }

  function bestTrader(item) {
    if (item.trader) return { name: item.trader, price: item.traderPrice };
    var list = item.sellFor || [];
    var best = null;
    list.forEach(function (s) {
      var v = s && s.vendor ? s.vendor.name : '';
      if (!v || /flea/i.test(v)) return;
      if (!best || (s.priceRUB || 0) > (best.priceRUB || 0)) best = s;
    });
    if (!best) return null;
    return { name: best.vendor.name, price: best.priceRUB };
  }

  function fleaPrice(item) {
    return item.avg24hPrice || item.lastLowPrice || item.basePrice || 0;
  }

  function initials(item) {
    var s = String(item.shortName || item.name || '?').trim();
    var p = s.split(/\s+/);
    var a = p[0].charAt(0) || '?';
    var b = p[1] ? p[1].charAt(0) : (p[0].charAt(1) || '');
    return esc((a + b).toUpperCase());
  }

  function rowHTML(item, offline) {
    var price = offline ? item.avg24hPrice : fleaPrice(item);
    var w = item.width || item.w || 1, h = item.height || item.h || 1;
    var tr = bestTrader(item);
    var link = item.link || item.wikiLink || ('https://tarkov.dev/item/' + (item.id || ''));
    var img = item.iconLink || item.gridImageLink || item.image512pxLink || MARKET_IMGS[item.name] || '';
    var thumb = '<span class="m-mono">' + initials(item) + '</span>';
    if (img) thumb += '<img src="' + esc(img) + '" alt="" loading="lazy" onload="this.classList.add(\'ld\')" onerror="this.remove()">';
    var sub = (item.shortName ? esc(item.shortName) + ' · ' : '') + w + '×' + h + (offline ? '<span class="m-off">INDICATIF</span>' : '');
    var profit = '—', pcls = '';
    if (price && tr && tr.price) {
      var p = Math.round(price * 0.95 - tr.price);
      pcls = p >= 0 ? 'mt-profit-pos' : 'mt-profit-neg';
      profit = (p >= 0 ? '+' : '') + fmtN.format(p) + ' ₽';
    }
    return '<tr>' +
      '<td><div class="mt-item"><div class="mt-thumb">' + thumb + '</div>' +
      '<div><div class="mt-name"><a href="' + esc(link) + '" target="_blank" rel="noopener">' + esc(item.name) + '</a></div>' +
      '<div class="mt-sub">' + sub + '</div></div></div></td>' +
      '<td class="mt-num"><div class="mt-big">' + (tr ? fmtN.format(tr.price || 0) + ' ₽' : '—') + '</div><div class="mt-trader">' + (tr ? esc(tr.name) : '') + '</div></td>' +
      '<td class="mt-num"><div class="mt-big">' + fmt(price) + '</div><div class="mt-small">bas ' + fmt(item.lastLowPrice) + '</div></td>' +
      '<td class="mt-num"><span class="' + pcls + '" title="Flea −5% de frais − prix marchand">' + profit + '</span></td>' +
      '</tr>';
  }

  function render(list, offline) {
    if (!list || !list.length) {
      grid.innerHTML = '<tr><td colspan="5"><div class="m-empty">Aucun résultat — essayez « GPU », « LEDX », « bitcoin », « Tetriz ».</div></td></tr>';
      return;
    }
    grid.innerHTML = list.map(function (it) { return rowHTML(it, offline); }).join('');
  }

  function cacheKey() { return 'norvinsk_market_' + state.mode + '_top_v1'; }

  function readCache() {
    try {
      var raw = localStorage.getItem(cacheKey());
      if (!raw) return null;
      var o = JSON.parse(raw);
      if (!o || !o.ts || !o.data) return null;
      if (Date.now() - o.ts > 10 * 60 * 1000) return null;
      return o;
    } catch (e) { return null; }
  }
  function writeCache(data) {
    try { localStorage.setItem(cacheKey(), JSON.stringify({ ts: Date.now(), data: data })); } catch (e) {}
  }

  function tdQuery(query, variables) {
    return fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: query, variables: variables || {} })
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (j) {
      if (j.errors && j.errors.length) throw new Error(j.errors[0].message || 'API error');
      return j.data;
    });
  }

  var FIELDS = 'id name shortName avg24hPrice lastLowPrice basePrice width height iconLink gridImageLink link wikiLink changeLast48hPercent updated sellFor { priceRUB vendor { name } }';

  function fetchTop(mode) {
    var q1 = 'query Top($names: [String!], $mode: GameMode) { items(names: $names, gameMode: $mode) { ' + FIELDS + ' } }';
    return tdQuery(q1, { names: TOP_NAMES, mode: mode }).then(function (d) { return d.items; })
      .catch(function () {
        var q2 = 'query Top2($names: [String!]) { items(names: $names) { ' + FIELDS + ' } }';
        return tdQuery(q2, { names: TOP_NAMES }).then(function (d) { return d.items; });
      });
  }

  function fetchSearch(name, mode) {
    var q1 = 'query S($name: String!, $mode: GameMode) { itemsByName(name: $name, gameMode: $mode) { ' + FIELDS + ' } }';
    return tdQuery(q1, { name: name, mode: mode }).then(function (d) { return d.itemsByName || d.items || []; })
      .catch(function () {
        var q2 = 'query S2($name: String!) { itemsByName(name: $name) { ' + FIELDS + ' } }';
        return tdQuery(q2, { name: name }).then(function (d) { return d.itemsByName || d.items || []; });
      });
  }

  function sortFlea(list) {
    return (list || []).filter(function (x) { return x && (x.avg24hPrice || x.lastLowPrice); })
      .sort(function (a, b) { return (b.avg24hPrice || b.lastLowPrice || 0) - (a.avg24hPrice || a.lastLowPrice || 0); });
  }

  function loadTop() {
    skeletons(8);
    setStatus('Chargement des prix ' + state.mode.toUpperCase() + ' via tarkov.dev…');
    var cached = readCache();
    if (cached) {
      state.offline = false;
      render(sortFlea(cached.data).slice(0, 8), false);
      setStatus('Top 8 · cache ' + state.mode.toUpperCase() + ' (' + ago(cached.ts) + ') · source tarkov.dev');
    }
    fetchTop(state.mode).then(function (items) {
      items = sortFlea(items);
      if (!items.length) throw new Error('empty');
      writeCache(items);
      if (!state.q) {
        state.offline = false;
        render(items.slice(0, 8), false);
        setStatus('Top 8 · live ' + state.mode.toUpperCase() + ' · MAJ à l\'instant · source tarkov.dev');
      }
    }).catch(function () {
      if (!state.q && !cached) {
        state.offline = true;
        render(FALLBACK, true);
        setStatus('tarkov.dev injoignable — prix indicatifs hors-ligne · réessayez avec ↻');
      } else if (!state.q && cached) {
        setStatus('Live indisponible — affichage du cache · source tarkov.dev');
      }
    });
  }

  function ago(ts) {
    var m = Math.max(0, Math.round((Date.now() - ts) / 60000));
    if (m < 1) return 'à l\'instant';
    if (m === 1) return 'il y a 1 min';
    return 'il y a ' + m + ' min';
  }

  var deb = null;
  function onSearch() {
    var q = (searchEl.value || '').trim();
    state.q = q;
    if (deb) clearTimeout(deb);
    if (q.length < 2) { loadTop(); return; }
    skeletons(4);
    setStatus('Recherche « ' + q + ' » sur tarkov.dev…');
    deb = setTimeout(function () {
      fetchSearch(q, state.mode).then(function (items) {
        items = sortFlea(items).slice(0, 12);
        state.offline = false;
        render(items, false);
        setStatus(items.length + ' résultat(s) pour « ' + q + ' » · ' + state.mode.toUpperCase() + ' · source tarkov.dev');
      }).catch(function () {
        var f = FALLBACK.filter(function (x) { return (x.name + ' ' + x.shortName).toLowerCase().indexOf(q.toLowerCase()) !== -1; });
        if (f.length) {
          state.offline = true;
          render(f, true);
          setStatus('Recherche live indisponible — résultat indicatif hors-ligne');
        } else {
          grid.innerHTML = '<tr><td colspan="5"><div class="m-empty">tarkov.dev injoignable pour « ' + esc(q) + ' ». <a href="https://tarkov.dev/?search=' + encodeURIComponent(q) + '" target="_blank" rel="noopener" style="color:var(--amber)">Voir sur tarkov.dev →</a></div></td></tr>';
          setStatus('Erreur réseau — voir tarkov.dev directement');
        }
      });
    }, 350);
  }

  modeBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      modeBtns.forEach(function (x) { x.classList.remove('on'); });
      b.classList.add('on');
      state.mode = b.getAttribute('data-mode') || 'pvp';
      state.q = '';
      if (searchEl) searchEl.value = '';
      loadTop();
    });
  });

  quickBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      var q = b.getAttribute('data-q') || b.textContent;
      if (searchEl) { searchEl.value = q; searchEl.focus(); }
      onSearch();
      document.getElementById('marche').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  if (searchEl) searchEl.addEventListener('input', onSearch);
  if (refreshBtn) refreshBtn.addEventListener('click', function () {
    try { localStorage.removeItem(cacheKey()); } catch (e) {}
    state.q = '';
    if (searchEl) searchEl.value = '';
    loadTop();
  });

  loadTop();
})();
