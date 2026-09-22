// =========================================================
// TRANSMIDIESEL — Interacciones
// =========================================================

// ---- Navbar scroll transform ----
const navHeader = document.getElementById('navHeader');
window.addEventListener('scroll', () => {
  navHeader.classList.toggle('scrolled', window.scrollY > 40);
}, {passive:true});

// ---- Cursor glow (desktop only) ----
const glow = document.getElementById('cursorGlow');
if (window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
  window.addEventListener('mousemove', e=>{
    glow.style.left = e.clientX+'px';
    glow.style.top = e.clientY+'px';
    glow.classList.add('active');
  });
  document.addEventListener('mouseleave', ()=>glow.classList.remove('active'));
}

// ---- Scroll reveal (bidireccional: aparece al bajar, se oculta al subir) ----
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries)=>{
  entries.forEach(en=>{
    en.target.classList.toggle('visible', en.isIntersecting);
  });
}, {threshold:0.15, rootMargin:'0px 0px -6% 0px'});
revealEls.forEach(el=>io.observe(el));

// ---- Magnetic buttons ----
document.querySelectorAll('.magnetic').forEach(btn=>{
  btn.addEventListener('mousemove', e=>{
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width/2;
    const y = e.clientY - r.top - r.height/2;
    btn.style.transform = `translate(${x*0.18}px, ${y*0.28}px)`;
  });
  btn.addEventListener('mouseleave', ()=>{ btn.style.transform=''; });
});

// ---- Mobile burger (simple toggle of links) ----
const burger = document.getElementById('burgerBtn');
const links = document.querySelector('nav.links');
burger.addEventListener('click', ()=>{
  const isOpen = links.style.display === 'flex';
  links.style.cssText = isOpen ? '' : 'display:flex;flex-direction:column;position:fixed;top:74px;right:20px;left:20px;background:rgba(26,26,26,0.96);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:14px;gap:4px;';
});

// ---- WhatsApp module ----
const waFab = document.getElementById('waFab');
const waPanel = document.getElementById('waPanel');
waFab.addEventListener('click', ()=> waPanel.classList.toggle('open'));

// ---- Carrusel de sectores (solo existe en quienes-somos.html) ----
const sectorCarousel = document.getElementById('sectorCarousel');
if (sectorCarousel) {
  const slides = sectorCarousel.querySelectorAll('.sector-slide');
  const dots = sectorCarousel.querySelectorAll('.sector-dot');
  const nameEl = document.getElementById('sectorName');
  let current = 0;

  function showSector(index){
    slides.forEach((s, i) => s.classList.toggle('active', i === index));
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
    if (nameEl && slides[index]) nameEl.textContent = slides[index].dataset.sector;
  }

  setInterval(() => {
    current = (current + 1) % slides.length;
    showSector(current);
  }, 4500);
}
// ---- Contador animado de indicadores (bidireccional: se reinicia al salir, se anima al volver a entrar) ----
const counters = document.querySelectorAll('.count');

if (counters.length) {
  const runningAnims = new WeakMap();

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10);
    if (isNaN(target)) return;

    // Si ya hay una animación corriendo sobre este elemento, la cancelamos primero
    const prevId = runningAnims.get(el);
    if (prevId) cancelAnimationFrame(prevId);

    const duration = 1600;          // duración total en ms
    const startTime = performance.now();

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easing suave (easeOutCubic)
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(eased * target);
      el.textContent = value.toLocaleString('es-CO');

      if (progress < 1) {
        const id = requestAnimationFrame(step);
        runningAnims.set(el, id);
      } else {
        el.textContent = target.toLocaleString('es-CO');
        runningAnims.delete(el);
      }
    };

    const id = requestAnimationFrame(step);
    runningAnims.set(el, id);
  };

  const resetCounter = (el) => {
    const id = runningAnims.get(el);
    if (id) cancelAnimationFrame(id);
    runningAnims.delete(el);
    el.textContent = '0';
  };

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
      } else {
        resetCounter(entry.target);
      }
    });
  }, { threshold: 0.4 });

  counters.forEach(c => counterObserver.observe(c));
}
// ---- Pop-up escalonado para marcas y certificaciones (bidireccional) ----
const revealPops = document.querySelectorAll('.reveal-pop');
if (revealPops.length) {
  const popObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      entry.target.classList.toggle('visible', entry.isIntersecting);
    });
  }, { threshold: 0.15, rootMargin:'0px 0px -6% 0px' });

  revealPops.forEach(el => popObserver.observe(el));
}

// ---- Hero: video de fondo + texto controlados por scroll ----
(function(){
  const heroScroll = document.getElementById('inicio');
  const heroVideo   = document.getElementById('heroVideo');
  const scrollHint  = document.getElementById('heroScrollHint');
  const stages      = document.querySelectorAll('.hero-stage');
  if (!heroScroll || !heroVideo) return;

  let duration = 0;
  let ticking  = false;

  const onMeta = () => { duration = heroVideo.duration || 0; };
  heroVideo.addEventListener('loadedmetadata', onMeta);
  if (heroVideo.readyState >= 1) onMeta();
  heroVideo.pause(); // el video nunca se reproduce solo: se "escrubea" con el scroll

  function update(){
    ticking = false;

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const start = heroScroll.offsetTop;
    const total = heroScroll.offsetHeight - window.innerHeight; // recorrido real del sticky
    if (total <= 0) return;

    let progress = (scrollTop - start) / total;
    progress = Math.min(Math.max(progress, 0), 1);

    // Escrubea el video de forma continua y suave según el progreso
    if (duration) {
      const targetTime = progress * duration;
      if (Math.abs(heroVideo.currentTime - targetTime) > 0.01) {
        try { heroVideo.currentTime = targetTime; } catch(e){}
      }
    }

    // Cada bloque de texto aparece/desaparece de forma continua en su propia ventana de progreso
    stages.forEach(el => {
      const stage = parseInt(el.dataset.stage, 10) || 1;
      const windowStart = (stage - 1) * 0.14;
      const windowLen   = 0.26;
      let t = (progress - windowStart) / windowLen;
      t = Math.min(Math.max(t, 0), 1);
      el.style.opacity = t;
      el.style.transform = `translateY(${(1 - t) * 26}px)`;
    });

    // La pista de "desplázate para explorar" se desvanece apenas empiezas a bajar
    if (scrollHint) scrollHint.style.opacity = Math.max(1 - progress * 6, 0);
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }, {passive:true});

  window.addEventListener('load', update);
  window.addEventListener('resize', update);
  update();
})();