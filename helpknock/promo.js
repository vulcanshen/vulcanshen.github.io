// HelpKnock promo pages: sections below the fold rise into place the first time they come on
// screen. With Reduce Motion on, the stylesheet keeps them still.
(() => {
  const rise = new IntersectionObserver(entries => entries.forEach(({ target, isIntersecting }) => {
    if (isIntersecting) { target.classList.add("in"); rise.unobserve(target); }
  }), { threshold: 0.08 });
  document.querySelectorAll("main section > .wrap").forEach(el => {
    if (el.getBoundingClientRect().top > innerHeight) { el.classList.add("reveal"); rise.observe(el); }
  });
})();
