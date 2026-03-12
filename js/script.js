document.documentElement.dataset.theme = 'dark';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const body = document.body;
const loader = document.querySelector('.site-loader');
const nav = document.querySelector('.site-nav');
const navLinks = document.querySelectorAll('.site-nav__link');
const cursor = document.querySelector('.custom-cursor');
const cursorRing = document.querySelector('.custom-cursor-ring');

const finishPageLoad = () => {
  body.classList.add('is-loaded');

  if (!prefersReducedMotion && loader) {
    window.setTimeout(() => {
      loader.classList.add('is-hidden');
    }, 220);
  } else if (loader) {
    loader.classList.add('is-hidden');
  }
};

if (document.readyState === 'complete') {
  finishPageLoad();
} else {
  window.addEventListener('load', finishPageLoad, { once: true });
}

const updateNavState = () => {
  if (!nav) {
    return;
  }

  nav.classList.toggle('is-scrolled', window.scrollY > 18);
};

updateNavState();
window.addEventListener('scroll', updateNavState, { passive: true });

const sections = document.querySelectorAll('section[id]');
const sectionLinkMap = new Map();

navLinks.forEach((link) => {
  const href = link.getAttribute('href');
  if (!href || !href.startsWith('#')) {
    return;
  }

  sectionLinkMap.set(href.slice(1), link);
});

const setActiveLink = (id) => {
  navLinks.forEach((link) => link.classList.remove('is-active'));

  if (!id) {
    return;
  }

  const activeLink = sectionLinkMap.get(id);
  if (activeLink) {
    activeLink.classList.add('is-active');
  }
};

if (sections.length > 0 && sectionLinkMap.size > 0) {
  const initialHash = window.location.hash ? window.location.hash.slice(1) : sections[0].id;
  setActiveLink(initialHash);

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (visibleEntries.length > 0) {
        setActiveLink(visibleEntries[0].target.id);
      }
    },
    {
      threshold: [0.2, 0.35, 0.5],
      rootMargin: '-18% 0px -48% 0px'
    }
  );

  sections.forEach((section) => {
    sectionObserver.observe(section);
  });

  window.addEventListener('hashchange', () => {
    setActiveLink(window.location.hash.slice(1) || sections[0].id);
  });
}

if (!prefersReducedMotion && cursor && cursorRing && window.innerWidth >= 768) {
  const interactiveTargets = document.querySelectorAll('a, button, [role="button"]');
  let cursorX = window.innerWidth / 2;
  let cursorY = window.innerHeight / 2;
  let dotX = cursorX;
  let dotY = cursorY;
  let ringX = cursorX;
  let ringY = cursorY;

  const renderCursor = () => {
    dotX += (cursorX - dotX) * 0.14;
    dotY += (cursorY - dotY) * 0.14;
    ringX += (cursorX - ringX) * 0.1;
    ringY += (cursorY - ringY) * 0.1;
    const ringScale = cursorRing.classList.contains('is-hovering') ? 1.35 : 1;

    cursor.style.transform = `translate3d(${dotX - 3.4}px, ${dotY - 3.4}px, 0)`;
    cursorRing.style.transform = `translate3d(${ringX - 19.2}px, ${ringY - 19.2}px, 0) scale(${ringScale})`;

    window.requestAnimationFrame(renderCursor);
  };

  document.addEventListener('pointermove', (event) => {
    cursorX = event.clientX;
    cursorY = event.clientY;
    cursor.classList.add('is-active');
    cursorRing.classList.add('is-active');
  });

  document.addEventListener('pointerleave', () => {
    cursor.classList.remove('is-active');
    cursorRing.classList.remove('is-active');
  });

  interactiveTargets.forEach((target) => {
    target.addEventListener('pointerenter', () => {
      cursorRing.classList.add('is-hovering');
    });

    target.addEventListener('pointerleave', () => {
      cursorRing.classList.remove('is-hovering');
    });
  });

  window.requestAnimationFrame(renderCursor);
}

const magneticButtons = document.querySelectorAll('.js-magnetic');

if (!prefersReducedMotion) {
  magneticButtons.forEach((button) => {
    button.addEventListener('pointermove', (event) => {
      const rect = button.getBoundingClientRect();
      const offsetX = event.clientX - rect.left - rect.width / 2;
      const offsetY = event.clientY - rect.top - rect.height / 2;
      const moveX = offsetX * 0.18;
      const moveY = offsetY * 0.22;

      button.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    });

    button.addEventListener('pointerleave', () => {
      button.style.transform = 'translate3d(0, 0, 0)';
    });
  });
}

const projectCards = document.querySelectorAll('.js-project-card');

if (!prefersReducedMotion) {
  projectCards.forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateY = (x / rect.width - 0.5) * 10;
      const rotateX = (0.5 - y / rect.height) * 8;

      card.style.setProperty('--spotlight-x', `${(x / rect.width) * 100}%`);
      card.style.setProperty('--spotlight-y', `${(y / rect.height) * 100}%`);
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(0, -6px, 0)`;
    });

    card.addEventListener('pointerleave', () => {
      card.style.transform = 'rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)';
      card.style.setProperty('--spotlight-x', '50%');
      card.style.setProperty('--spotlight-y', '50%');
    });
  });
}

const revealElements = document.querySelectorAll('.reveal');
const typewriteTargets = document.querySelectorAll('.js-typewrite');

const typewriteElement = (element, speed = 20) => {
  const fullText = element.dataset.fullText ?? element.textContent.trim().replace(/\s+/g, ' ');
  element.dataset.fullText = fullText;
  element.textContent = '';
  element.classList.remove('is-typed');
  element.classList.add('is-typing');

  return new Promise((resolve) => {
    let index = 0;

    const tick = () => {
      index += 1;
      element.textContent = fullText.slice(0, index);

      if (index < fullText.length) {
        window.setTimeout(tick, speed);
        return;
      }

      element.classList.remove('is-typing');
      element.classList.add('is-typed');
      resolve();
    };

    tick();
  });
};

if (!prefersReducedMotion) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: '0px 0px -10% 0px'
    }
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });

  if (typewriteTargets.length > 0) {
    let hasTypedAbout = false;
    const aboutSection = document.querySelector('#about');
    const typeObserver = new IntersectionObserver(
      async (entries) => {
        const shouldStart = entries.some((entry) => entry.isIntersecting);

        if (!shouldStart || hasTypedAbout) {
          return;
        }

        hasTypedAbout = true;
        typeObserver.disconnect();

        for (const [index, element] of typewriteTargets.entries()) {
          await typewriteElement(element, index === 0 ? 16 : 14);
          await new Promise((resolve) => window.setTimeout(resolve, 260));
        }
      },
      {
        threshold: 0.35,
        rootMargin: '0px 0px -12% 0px'
      }
    );

    if (aboutSection) {
      typeObserver.observe(aboutSection);
    }
  }
} else {
  revealElements.forEach((element) => {
    element.classList.add('is-visible');
  });

  typewriteTargets.forEach((element) => {
    const fullText = element.textContent.trim().replace(/\s+/g, ' ');
    element.textContent = fullText;
    element.classList.remove('is-typing');
    element.classList.add('is-typed');
  });
}
