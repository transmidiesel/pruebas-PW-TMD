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

// ---- Scroll reveal ----
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries)=>{
  entries.forEach(en=>{
    if(en.isIntersecting){
      en.target.classList.add('visible');
      io.unobserve(en.target);
    }
  });
}, {threshold:0.15});
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