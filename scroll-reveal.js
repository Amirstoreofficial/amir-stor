/* Independent scroll reveal controller.
   Kept separate from app.js so unrelated catalog errors cannot disable animations. */
(() => {
  'use strict';
  const selectors = [
    '.hero-copy .eyebrow',
    '.hero-copy h1',
    '.hero-copy > p',
    '.hero-copy .hero-actions',
    '.hero-copy .hero-points',
    '.trust-strip > div',
    '.experience-heading > *',
    '.experience-grid article',
    '.section-head .eyebrow',
    '.section-head h2',
    '.section-head > p',
    '.category-card',
    '.product-card:not(.product-empty-slot)',
    '.about > div > *',
    '.contact > div > *'
  ];

  // If the browser cannot animate safely, leave all content visible.
  if (!('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const observed = new WeakSet();
  let observer;
  try {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        } else {
          entry.target.classList.remove('is-visible');
        }
      });
    }, {
      threshold: 0.01,
      rootMargin: '0px 0px -6% 0px'
    });

    // Enable hiding only after the observer has been created successfully.
    document.documentElement.classList.add('reveal-enabled');

    function prepare(root) {
      if (!root || root.nodeType !== 1 && root !== document) return;
      const found = new Set();
      selectors.forEach((selector) => {
        if (root.nodeType === 1 && root.matches(selector)) found.add(root);
        root.querySelectorAll(selector).forEach((element) => found.add(element));
      });

      found.forEach((element) => {
        if (observed.has(element)) return;
        observed.add(element);
        const related = [...element.parentElement.children].filter((sibling) =>
          selectors.some((selector) => sibling.matches(selector))
        );
        const position = Math.max(0, related.indexOf(element));
        element.style.setProperty('--reveal-delay', Math.min(position, 5) * 100 + 'ms');
        element.classList.add('scroll-reveal');
        observer.observe(element);
      });
    }

    prepare(document);
    const mutations = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (node.nodeType === 1) prepare(node);
        });
      });
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    // Re-evaluate after fonts/images/layout settle so initial viewport elements
    // are not left hidden if their positions changed during page loading.
    window.addEventListener('load', () => {
      document.querySelectorAll('.scroll-reveal').forEach((element) => {
        observer.unobserve(element);
        observer.observe(element);
      });
    }, { once: true });
  } catch (error) {
    // Fail open: never leave page content invisible if initialization fails.
    document.documentElement.classList.remove('reveal-enabled');
    document.querySelectorAll('.scroll-reveal').forEach((element) => {
      element.classList.remove('scroll-reveal', 'is-visible');
      element.style.removeProperty('--reveal-delay');
    });
  }
})();
