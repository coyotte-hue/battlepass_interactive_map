// © 2026 coyotte-hue — Page d'accueil originale NORVINSK.INTEL. Tous droits réservés. Reproduction interdite sans autorisation.
(function(){
  var $ = function(s,c){ return (c||document).querySelector(s); };
  var $$ = function(s,c){ return Array.prototype.slice.call((c||document).querySelectorAll(s)); };

  // progress + toTop
  var prog = $('#progress'), toTop = $('#toTop');
  function onScroll(){
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var p = max > 0 ? (h.scrollTop / max) * 100 : 0;
    if(prog) prog.style.width = p + '%';
    if(toTop) toTop.classList.toggle('show', h.scrollTop > 700);
    // active nav
    var ids = ['jeu','cartes','documents','actus','saison','guide','marchands','astuces'];
    var cur = null;
    ids.forEach(function(id){
      var el = document.getElementById(id);
      if(el && el.getBoundingClientRect().top < 140) cur = id;
    });
    $$('.navlinks a').forEach(function(a){
      var href = a.getAttribute('href') || '';
      a.classList.toggle('active', cur && href === '#' + cur);
    });
  }
  document.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
  if(toTop) toTop.addEventListener('click', function(){ window.scrollTo({top:0, behavior:'smooth'}); });

  // burger / drawer
  var burger = $('#burger'), drawer = $('#drawer');
  if(burger && drawer){
    burger.addEventListener('click', function(){
      var open = drawer.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    $$('a', drawer).forEach(function(a){
      a.addEventListener('click', function(){
        drawer.classList.remove('open'); burger.classList.remove('open');
      });
    });
  }

  // reveal on scroll
  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, {threshold:.08}) : null;
  $$('.reveal').forEach(function(el){ if(io) io.observe(el); else el.classList.add('visible'); });

  // maps filter + search
  var fbtns = $$('.fbtn'), cards = $$('.map-card'), empty = $('#mapsEmpty'), search = $('#mapSearch');
  var activeF = 'all';
  function applyFilter(){
    var q = (search && search.value ? search.value.toLowerCase().trim() : '');
    var shown = 0;
    cards.forEach(function(c){
      var tags = (c.getAttribute('data-tags') || '').toLowerCase();
      var name = (c.getAttribute('data-name') || '').toLowerCase();
      var okF = (activeF === 'all') || tags.indexOf(activeF) !== -1;
      var okQ = !q || name.indexOf(q) !== -1 || tags.indexOf(q) !== -1;
      var show = okF && okQ;
      c.style.display = show ? '' : 'none';
      if(show) shown++;
    });
    if(empty) empty.style.display = shown === 0 ? 'block' : 'none';
    var count = $('#mapsCount');
    if(count) count.textContent = shown + ' / ' + cards.length + ' cartes';
  }
  fbtns.forEach(function(b){
    b.addEventListener('click', function(){
      fbtns.forEach(function(x){ x.classList.remove('on'); });
      b.classList.add('on');
      activeF = b.getAttribute('data-filter') || 'all';
      applyFilter();
    });
  });
  if(search) search.addEventListener('input', applyFilter);
  applyFilter();

  // saison tabs
  var tabs = $$('.tab'), mods = $('#modsList');
  function setTab(mode){
    tabs.forEach(function(t){ t.classList.toggle('on', t.getAttribute('data-tab') === mode); });
    if(!mods) return;
    var rows = $$('.mod, .grp', mods);
    rows.forEach(function(r){
      if(mode === 'all'){ r.style.display = ''; return; }
      var isPos = r.classList.contains('pos');
      var isNeg = r.classList.contains('neg');
      if(mode === 'pos') r.style.display = isPos ? '' : 'none';
      if(mode === 'neg') r.style.display = isNeg ? '' : 'none';
    });
  }
  tabs.forEach(function(t){ t.addEventListener('click', function(){ setTab(t.getAttribute('data-tab')); }); });

  // hero parallax (subtle, desktop only)
  var hero = $('.hero'), bg = $('.hero-bg');
  if(hero && bg && window.matchMedia('(min-width:1000px)').matches){
    hero.addEventListener('mousemove', function(e){
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - .5;
      var y = (e.clientY - r.top) / r.height - .5;
      bg.style.transform = 'scale(1.04) translate(' + (x*10) + 'px,' + (y*8) + 'px)';
    });
    hero.addEventListener('mouseleave', function(){ bg.style.transform = ''; });
  }

  // quiz extraction
  var quizData = [
    {extract:'Trailer Park', map:'Customs'},
    {extract:'Crossroads', map:'Customs'},
    {extract:'Old Gas Station', map:'Customs'},
    {extract:'Outskirts', map:'Woods'},
    {extract:'RUAF Roadblock', map:'Woods'},
    {extract:'Scav House', map:'Woods'},
    {extract:'Gate 3', map:'Factory'},
    {extract:'Cellars', map:'Factory'},
    {extract:'Tunnel', map:'Shoreline'},
    {extract:'Railway', map:'Interchange'},
    {extract:'Power Station', map:'Interchange'},
    {extract:'Armored Train', map:'Lighthouse'},
    {extract:'Southern Road', map:'Lighthouse'},
    {extract:'Cliff Descent', map:'Reserve'},
    {extract:'Primorsky Ave', map:'Streets of Tarkov'},
    {extract:'Collapsed Crane', map:'Ground Zero'},
    {extract:'Lab Parking', map:'The Lab'},
    {extract:'Icebreaker Stern', map:'Icebreaker'}
  ];
  var allMaps = ['Customs','Woods','Factory','Shoreline','Interchange','Reserve','Lighthouse','Streets of Tarkov','Ground Zero','The Lab','Icebreaker','Labyrinth'];
  var pool = [], score = 0, total = 0, locked = false, best = 0;
  try{ best = parseInt(localStorage.getItem('norvinsk_quiz_best') || '0', 10) || 0; }catch(e){}
  var nameEl = $('#quizName'), optEl = $('#quizOpts'), feedEl = $('#quizFeed'),
      nextBtn = $('#quizNext'), sEl = $('#quizScore'), tEl = $('#quizTotal'),
      barEl = $('#quizBar'), bestEl = $('#quizBest');
  if(bestEl) bestEl.textContent = best;
  function shuffle(a){ return a.slice().sort(function(){ return Math.random() - .5; }); }
  function refill(){ pool = shuffle(quizData); }
  function nextQ(){
    if(!nameEl || !optEl) return;
    locked = false;
    if(nextBtn) nextBtn.style.display = 'none';
    if(feedEl) feedEl.textContent = '';
    if(pool.length === 0) refill();
    var q = pool.pop();
    nameEl.textContent = q.extract;
    var distract = shuffle(allMaps.filter(function(m){ return m !== q.map; })).slice(0,3);
    var opts = shuffle([q.map].concat(distract));
    optEl.innerHTML = '';
    opts.forEach(function(o){
      var b = document.createElement('button');
      b.className = 'q-opt'; b.type = 'button'; b.textContent = o;
      b.addEventListener('click', function(){ answer(b, o, q.map); });
      optEl.appendChild(b);
    });
  }
  function answer(btn, chosen, correct){
    if(locked) return; locked = true; total++;
    if(tEl) tEl.textContent = total;
    var btns = $$('.q-opt', optEl);
    btns.forEach(function(x){
      x.disabled = true;
      if(x.textContent === correct) x.classList.add('ok');
    });
    if(chosen === correct){
      score++; if(sEl) sEl.textContent = score;
      if(feedEl) feedEl.textContent = 'Correct — bon PMC.';
    } else {
      btn.classList.add('ko');
      if(feedEl) feedEl.textContent = 'Raté — c’était ' + correct + '.';
    }
    if(barEl && quizData.length) barEl.style.width = Math.min(100, Math.round((total % 12) / 12 * 100)) + '%';
    if(total % 12 === 0 && total > 0){
      if(score > best){
        best = score;
        try{ localStorage.setItem('norvinsk_quiz_best', String(best)); }catch(e){}
        if(bestEl) bestEl.textContent = best;
      }
    }
    if(nextBtn) nextBtn.style.display = 'inline-block';
  }
  if(nextBtn) nextBtn.addEventListener('click', nextQ);
  nextQ();

  // year
  var y = $('#year'); if(y) y.textContent = new Date().getFullYear();
})();
