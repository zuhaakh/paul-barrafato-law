const header = document.querySelector(".site-header");
const nav = document.querySelector(".site-nav");
const navToggle = document.querySelector(".nav-toggle");
const form = document.querySelector("#contact-form");
const formNote = document.querySelector("#form-note");
const canvas = document.querySelector("#hero-canvas");
const canvasContext = canvas.getContext("2d");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const practiceTrack = document.querySelector(".practice-grid");
const practicePrevious = document.querySelector("[data-practice-prev]");
const practiceNext = document.querySelector("[data-practice-next]");
const backToTop = document.querySelector(".site-footer a[href='#top']");
let particles = [];
let animationFrame;
const revealSelectors = [
  ".intro .section-kicker",
  ".intro h2",
  ".intro p",
  ".section-heading",
  ".practice-card",
  ".approach-copy > *",
  ".steps li",
  ".team .section-heading",
  ".group-label",
  ".person-card",
  ".quote-band blockquote",
  ".quote-band p",
  ".location-copy > *",
  ".map-card",
  ".office-details > div",
  ".contact-copy > *",
  ".contact-form label",
  ".contact-form .button"
];

function updateHeader() {
  header.classList.toggle("scrolled", window.scrollY > 18);
}

navToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  header.classList.toggle("menu-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
});

nav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    nav.classList.remove("open");
    header.classList.remove("menu-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  }
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  form.reset();
  formNote.textContent = "Thank you. The office will review your inquiry and follow up.";
});

backToTop.addEventListener("click", (event) => {
  event.preventDefault();
  window.scrollTo({
    top: 0,
    behavior: reducedMotion.matches ? "auto" : "smooth"
  });
});

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  const width = canvas.offsetWidth;
  const height = canvas.offsetHeight;

  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvasContext.setTransform(ratio, 0, 0, ratio, 0, 0);

  const particleCount = Math.max(34, Math.floor(width / 28));
  particles = Array.from({ length: particleCount }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.32,
    vy: (Math.random() - 0.5) * 0.32,
    size: Math.random() * 1.8 + 0.7
  }));
}

function drawParticles() {
  const width = canvas.offsetWidth;
  const height = canvas.offsetHeight;

  canvasContext.clearRect(0, 0, width, height);

  particles.forEach((particle, index) => {
    if (!reducedMotion.matches) {
      particle.x += particle.vx;
      particle.y += particle.vy;
    }

    if (particle.x < 0 || particle.x > width) {
      particle.vx *= -1;
    }

    if (particle.y < 0 || particle.y > height) {
      particle.vy *= -1;
    }

    canvasContext.beginPath();
    canvasContext.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    canvasContext.fillStyle = "rgba(245, 217, 139, 0.72)";
    canvasContext.fill();

    for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex += 1) {
      const nextParticle = particles[nextIndex];
      const distance = Math.hypot(particle.x - nextParticle.x, particle.y - nextParticle.y);

      if (distance < 135) {
        canvasContext.beginPath();
        canvasContext.moveTo(particle.x, particle.y);
        canvasContext.lineTo(nextParticle.x, nextParticle.y);
        canvasContext.strokeStyle = `rgba(215, 173, 87, ${0.16 - distance / 1000})`;
        canvasContext.lineWidth = 1;
        canvasContext.stroke();
      }
    }
  });

  animationFrame = requestAnimationFrame(drawParticles);
}

function startCanvas() {
  cancelAnimationFrame(animationFrame);
  resizeCanvas();
  drawParticles();
}

function setupScrollReveal() {
  const revealItems = document.querySelectorAll(revealSelectors.join(", "));

  revealItems.forEach((item, index) => {
    item.classList.add("reveal");
    item.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 90}ms`);
  });

  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("revealed"));
    return;
  }

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.16,
    rootMargin: "0px 0px -8% 0px"
  });

  revealItems.forEach((item) => revealObserver.observe(item));
}

function scrollPracticeCards(direction) {
  const card = practiceTrack.querySelector(".practice-card");
  const cardGap = 22;
  const distance = card ? card.offsetWidth + cardGap : practiceTrack.offsetWidth * 0.8;

  practiceTrack.scrollBy({
    left: direction * distance,
    behavior: "smooth"
  });
}

function setupPracticeCarousel() {
  if (!practiceTrack) {
    return;
  }

  if (practicePrevious && practiceNext) {
    practicePrevious.addEventListener("click", () => scrollPracticeCards(-1));
    practiceNext.addEventListener("click", () => scrollPracticeCards(1));
  }

  let isDragging = false;
  let startX = 0;
  let startScrollLeft = 0;

  practiceTrack.addEventListener("pointerdown", (event) => {
    isDragging = true;
    startX = event.clientX;
    startScrollLeft = practiceTrack.scrollLeft;
    practiceTrack.setPointerCapture(event.pointerId);
  });

  practiceTrack.addEventListener("pointermove", (event) => {
    if (!isDragging) {
      return;
    }

    practiceTrack.scrollLeft = startScrollLeft - (event.clientX - startX);
  });

  practiceTrack.addEventListener("pointerup", () => {
    isDragging = false;
  });

  practiceTrack.addEventListener("pointercancel", () => {
    isDragging = false;
  });
}

window.addEventListener("scroll", updateHeader, { passive: true });
window.addEventListener("resize", startCanvas);
updateHeader();
startCanvas();
setupScrollReveal();
setupPracticeCarousel();
