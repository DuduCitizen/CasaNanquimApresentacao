document.addEventListener('DOMContentLoaded', () => {
  const y = document.getElementById('currentYear');
  if (y) y.textContent = new Date().getFullYear();
});

document.getElementById('currentYear').textContent = new Date().getFullYear();

function esconderTransicao() {
  const t = document.getElementById('pageTransition');
  if (!t || t.style.display === 'none') return;
  t.classList.add('hide');
  setTimeout(() => { t.style.display = 'none'; }, 950);
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(esconderTransicao, 1200);
});
setTimeout(esconderTransicao, 3000);

window.addEventListener('scroll', () => {
  document.querySelector('.navbar').classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); } });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => revealObs.observe(el));

(function() {
  var v = document.getElementById('heroVideo');
  if (!v) return;
  if (v.readyState >= 3) {
    v.classList.add('loaded');
  } else {
    v.addEventListener('canplay', function() { v.classList.add('loaded'); }, { once: true });
    setTimeout(function() { v.classList.add('loaded'); }, 3000);
  }
})();

(function() {
  const FOTOS = [
    { src: 'img/1.jpeg',  alt: 'Tatuagem 1' },
    { src: 'img/2.jpeg',  alt: 'Tatuagem 2' },
    { src: 'img/3.jpeg',  alt: 'Tatuagem 3' },
    { src: 'img/4.jpeg',  alt: 'Tatuagem 4' },
    { src: 'img/5.jpeg',  alt: 'Tatuagem 5' },
    { src: 'img/6.jpeg',  alt: 'Tatuagem 6' },
    { src: 'img/7.jpeg',  alt: 'Tatuagem 7' },
    { src: 'img/8.jpeg',  alt: 'Tatuagem 8' },
  ];

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const fotos = shuffle(FOTOS);
  const grid  = document.getElementById('galleryGrid');
  fotos.forEach((foto, i) => {
    const div = document.createElement('div');
    div.className    = 'gallery-item';
    div.dataset.index = i;
    div.innerHTML =
      '<img src="' + foto.src + '" alt="' + foto.alt + '" loading="' + (i === 0 ? 'eager' : 'lazy') + '">' +
      '<div class="gallery-overlay"><i class="fas fa-expand" aria-hidden="true"></i></div>';
    grid.appendChild(div);
  });

  const lb      = document.getElementById('lightbox');
  const lbImg   = document.getElementById('lbImg');
  const lbClose = document.getElementById('lbClose');
  const lbPrev  = document.getElementById('lbPrev');
  const lbNext  = document.getElementById('lbNext');
  let current   = 0;

  function open(i) {
    current = i;
    lbImg.src = fotos[i].src;
    lbImg.alt = fotos[i].alt;
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    lb.classList.remove('active');
    document.body.style.overflow = '';
  }
  function prev() { open((current - 1 + fotos.length) % fotos.length); }
  function next() { open((current + 1) % fotos.length); }

  grid.addEventListener('click', e => {
    const item = e.target.closest('.gallery-item');
    if (item) open(parseInt(item.dataset.index));
  });

  lbClose.addEventListener('click', close);
  lbPrev.addEventListener('click', prev);
  lbNext.addEventListener('click', next);
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('active')) return;
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'Escape')     close();
  });
})();

const menuToggle = document.getElementById('menuToggle');
const navLinks   = document.getElementById('navLinks');

/* ─────────────────────────────────────────────────────────────
   CORREÇÃO DE STACKING CONTEXT
   O #navLinks vive dentro da <nav class="navbar"> no HTML.
   A navbar cria seu próprio stacking context (position:fixed +
   z-index), então nenhum z-index do nav-links consegue superar
   a navbar — causando a sobreposição da logo.

   Solução: no mobile movemos o #navLinks para ser filho direto
   do <body>, saindo do stacking context da navbar. No desktop
   ele volta ao .nav-container para manter o layout original.
───────────────────────────────────────────────────────────── */
(function() {
  const navContainer = document.querySelector('.nav-container');
  if (!navLinks || !navContainer) return;

  function ajustarMenuDOM() {
    if (window.innerWidth <= 768) {
      // Mobile: move para body → z-index passa a ser global
      if (navLinks.parentElement !== document.body) {
        document.body.appendChild(navLinks);
      }
    } else {
      // Desktop: volta para dentro do nav-container
      if (navLinks.parentElement !== navContainer) {
        window.fecharMenu && window.fecharMenu();
        navContainer.appendChild(navLinks);
      }
    }
  }

  // Executa antes do primeiro paint
  ajustarMenuDOM();
  window.addEventListener('resize', ajustarMenuDOM);
})();

/* ─────────────────────────────────────────────────────────────
   SCROLL LOCK — overflow hidden em html + body
   Chrome Android trata isso corretamente sem deslocar
   elementos position:fixed nem recalcular a viewport.
───────────────────────────────────────────────────────────── */
function lockBodyScroll() {
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow            = 'hidden';
}

function unlockBodyScroll() {
  document.documentElement.style.overflow = '';
  document.body.style.overflow            = '';
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const icon = menuToggle.querySelector('i');
    if (navLinks.classList.contains('active')) {
      icon.classList.replace('fa-bars', 'fa-times');
      lockBodyScroll();
    } else {
      icon.classList.replace('fa-times', 'fa-bars');
      unlockBodyScroll();
    }
  });
}

window.fecharMenu = function() {
  if (navLinks && menuToggle) {
    navLinks.classList.remove('active');
    const icon = menuToggle.querySelector('i');
    if (icon) {
      icon.classList.remove('fa-times');
      icon.classList.add('fa-bars');
    }
    unlockBodyScroll();
  }
};

document.addEventListener('click', (event) => {
  if (navLinks && menuToggle &&
      !navLinks.contains(event.target) &&
      !menuToggle.contains(event.target)) {
    if (navLinks.classList.contains('active')) window.fecharMenu();
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 768 && navLinks && navLinks.classList.contains('active')) {
    window.fecharMenu();
  }
});
