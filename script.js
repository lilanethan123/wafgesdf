const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

const applyReveal = (element, delay = 0) => {
  if (!element) {
    return;
  }
  element.style.setProperty("--reveal-delay", `${delay}ms`);
  element.classList.add("reveal");
  revealObserver.observe(element);
};

const applyRevealSequence = (elements, startDelay = 0, step = 90) => {
  elements.forEach((el, index) => {
    applyReveal(el, startDelay + index * step);
  });
};

const revealHero = () => {
  const hero = document.querySelector(".hero");
  if (!hero) return;

  const eyebrow = hero.querySelector(".hero-content .eyebrow");
  const title = hero.querySelector(".hero-content h1");
  const lead = hero.querySelector(".hero-content .lead");
  const tags = hero.querySelector(".hero-tags");
  const cards = Array.from(hero.querySelectorAll(".hero-cards article"));
  const visual = hero.querySelector(".hero-visual");

  applyRevealSequence([eyebrow, title, lead], 0, 120);
  applyReveal(tags, 360);
  applyRevealSequence(cards, 420, 80);
  applyReveal(visual, 280);
};

const revealSections = () => {
  document.querySelectorAll("[data-reveal-section]").forEach((section) => {
    const head = section.querySelector(".section-head");
    if (head) {
      const headParts = Array.from(head.children);
      applyRevealSequence(headParts, 0, 120);
    }

    const splitItems = section.querySelectorAll(".split > *");
    applyRevealSequence(Array.from(splitItems), 200, 120);

    const cards = section.querySelectorAll(".card-grid > *");
    applyRevealSequence(Array.from(cards), 220, 90);

    const timelineItems = section.querySelectorAll(".timeline > .time-item");
    applyRevealSequence(Array.from(timelineItems), 220, 110);

    const singles = section.querySelectorAll(
      ".importance, .sources, .graphic-card, .photo-card, .load-sentinel"
    );
    applyRevealSequence(Array.from(singles), 220, 120);
  });
};

revealHero();
revealSections();

const motionAllowed = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (motionAllowed) {
  const tiltTargets = document.querySelectorAll(
    ".card, .panel, .quote, .hero-cards article, .time-item, .sources, .graphic-card, .photo-card"
  );

  tiltTargets.forEach((el) => {
    el.addEventListener("pointermove", (event) => {
      const rect = el.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      const tiltX = (y * -8).toFixed(2);
      const tiltY = (x * 8).toFixed(2);
      el.style.setProperty("--tilt-x", `${tiltX}deg`);
      el.style.setProperty("--tilt-y", `${tiltY}deg`);
    });

    el.addEventListener("pointerleave", () => {
      el.style.setProperty("--tilt-x", "0deg");
      el.style.setProperty("--tilt-y", "0deg");
    });
  });

  const heroVisual = document.querySelector(".hero-visual");
  if (heroVisual) {
    let raf = null;
    let targetX = 0;
    let targetY = 0;

    const updateParallax = () => {
      heroVisual.style.setProperty("--parallax-x", `${targetX}px`);
      heroVisual.style.setProperty("--parallax-y", `${targetY}px`);
      raf = null;
    };

    window.addEventListener("pointermove", (event) => {
      const x = (event.clientX / window.innerWidth) - 0.5;
      const y = (event.clientY / window.innerHeight) - 0.5;
      targetX = (x * 18).toFixed(2);
      targetY = (y * 14).toFixed(2);
      if (!raf) {
        raf = window.requestAnimationFrame(updateParallax);
      }
    });
  }
}

const deepDiveGrid = document.querySelector("[data-deep-dive]");
const loadSentinel = document.querySelector("[data-load-sentinel]");

const deepDiveItems = [
  {
    tag: "Valve Experiments",
    title: "Finger Commissurotomy",
    body:
      "In 1925, Henry Souttar relieved mitral stenosis using a finger inserted into the heart, a rare but pivotal step.",
    detail: "A single bold operation with no repeat for decades.",
  },
  {
    tag: "Anesthesia",
    title: "Safer Baselines",
    body:
      "Improved anesthesia control reduced shock and allowed longer, more precise procedures.",
    detail: "Better control widened the surgical window.",
  },
  {
    tag: "Sterile Technique",
    title: "Infection Control",
    body:
      "Antiseptic and sterile practices lowered infection risk, making cardiac work less fatal.",
    detail: "Clean fields changed outcomes dramatically.",
  },
  {
    tag: "Diagnostics",
    title: "Limited Imaging",
    body:
      "Surgeons relied heavily on clinical judgment with limited diagnostic tools.",
    detail: "Palpation and observation carried the day.",
  },
  {
    tag: "Mortality",
    title: "High Risk Reality",
    body:
      "Even with advances, mortality stayed high and many surgeons avoided cardiac operations.",
    detail: "Outcomes remained uncertain and dangerous.",
  },
  {
    tag: "Legacy",
    title: "Foundation Era",
    body:
      "These steps prepared the medical world for open-heart surgery after 1940.",
    detail: "A groundwork that later innovators could build on.",
  },
];

let nextIndex = 0;
const batchSize = 2;
let loadObserver = null;

const createDeepDiveCard = (item) => {
  const card = document.createElement("article");
  card.className = "card refined";
  if (item.detail) {
    card.setAttribute("data-detail", item.detail);
  }

  const tag = document.createElement("p");
  tag.className = "card-tag";
  tag.textContent = item.tag;

  const title = document.createElement("h3");
  title.textContent = item.title;

  const body = document.createElement("p");
  body.textContent = item.body;

  card.append(tag, title, body);
  return card;
};

const loadMore = () => {
  if (!deepDiveGrid || !loadSentinel) {
    return;
  }

  const batch = deepDiveItems.slice(nextIndex, nextIndex + batchSize);
  if (!batch.length) {
    loadSentinel.textContent = "End of archive. Scroll up to revisit.";
    loadSentinel.classList.add("complete");
    if (loadObserver) {
      loadObserver.unobserve(loadSentinel);
    }
    return;
  }

  batch.forEach((item) => {
    const card = createDeepDiveCard(item);
    deepDiveGrid.appendChild(card);
    applyReveal(card, 120);
  });

  nextIndex += batchSize;
};

if (deepDiveGrid && loadSentinel && deepDiveItems.length) {
  loadObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadMore();
        }
      });
    },
    { rootMargin: "200px 0px" }
  );

  loadObserver.observe(loadSentinel);
}

const timeline = document.querySelector(".timeline");
const timeItems = document.querySelectorAll(".time-item");
const backToTop = document.querySelector(".back-to-top");
const timelineSection = document.querySelector("#timeline");
const compare = document.querySelector("[data-compare]");
const compareHandle = document.querySelector(".compare-handle");
const eraLinks = document.querySelectorAll("[data-era-link]");
const eraSections = document.querySelectorAll("[data-era]");
const audioChip = document.querySelector(".audio-chip");
const modal = document.querySelector(".modal");
const modalTitle = document.querySelector("#modal-title");
const modalList = document.querySelector(".modal-list");
const modalCloseTargets = document.querySelectorAll("[data-modal-close]");
const sourceCards = document.querySelectorAll(".source-card");

const updateTimelineProgress = () => {
  if (!timeline) return;
  const rect = timeline.getBoundingClientRect();
  const viewport = window.innerHeight || 1;
  const progress = (viewport * 0.7 - rect.top) / rect.height;
  const clamped = Math.max(0, Math.min(1, progress));
  timeline.style.setProperty("--timeline-progress", `${clamped * 100}%`);
};

const timelineObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("active", entry.isIntersecting);
    });
  },
  { threshold: 0.6 }
);

timeItems.forEach((item) => timelineObserver.observe(item));

if (motionAllowed) {
  const orbs = document.querySelectorAll(".orb");

  const updateScrollEffects = (scrollY = window.scrollY) => {

    if (orbs.length) {
      const factors = [-0.06, -0.1, -0.04];
      orbs.forEach((orb, index) => {
        const shift = scrollY * (factors[index] || -0.05);
        orb.style.setProperty("--orb-y", `${shift}px`);
        orb.style.setProperty("--orb-x", `${Math.sin(scrollY / 600) * 8}px`);
      });
    }

    const heroVisual = document.querySelector(".hero-visual");
    if (heroVisual) {
      const rect = heroVisual.getBoundingClientRect();
      const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
      heroVisual.style.setProperty("--scroll-parallax-y", `${-offset * 18}px`);
      heroVisual.style.setProperty("--scroll-parallax-x", `${-offset * 6}px`);
    }

    updateTimelineProgress();

    if (backToTop && timelineSection) {
      const rect = timelineSection.getBoundingClientRect();
      backToTop.classList.toggle("visible", rect.bottom < window.innerHeight * 0.2);
    }
  };

  let raf = null;
  let currentScrollY = window.scrollY;
  let targetScrollY = currentScrollY;

  const animateScroll = () => {
    currentScrollY += (targetScrollY - currentScrollY) * 0.12;
    updateScrollEffects(currentScrollY);
    if (Math.abs(targetScrollY - currentScrollY) > 0.5) {
      raf = window.requestAnimationFrame(animateScroll);
    } else {
      currentScrollY = targetScrollY;
      updateScrollEffects(currentScrollY);
      raf = null;
    }
  };

  const onScroll = () => {
    targetScrollY = window.scrollY;
    if (!raf) {
      raf = window.requestAnimationFrame(animateScroll);
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  updateScrollEffects(currentScrollY);
} else {
  updateTimelineProgress();
  window.addEventListener("scroll", updateTimelineProgress, { passive: true });
  window.addEventListener("resize", updateTimelineProgress);
}

if (compare && compareHandle) {
  const updateCompare = () => {
    compare.style.setProperty("--split", `${compareHandle.value}%`);
  };
  compareHandle.addEventListener("input", updateCompare);
  updateCompare();
}

const setActiveEra = (id) => {
  eraLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
  });
};

if (eraSections.length) {
  const eraObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveEra(entry.target.id);
        }
      });
    },
    { threshold: 0.5 }
  );
  eraSections.forEach((section) => eraObserver.observe(section));
}

const openModal = (card) => {
  if (!modal || !modalTitle || !modalList) return;
  const title = card.getAttribute("data-source-title") || "Primary Source";
  const items = (card.getAttribute("data-takeaways") || "").split("|").filter(Boolean);
  modalTitle.textContent = title;
  modalList.innerHTML = "";
  items.forEach((text) => {
    const li = document.createElement("li");
    li.textContent = text.trim();
    modalList.appendChild(li);
  });
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
};

const closeModal = () => {
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
};

sourceCards.forEach((card) => {
  card.setAttribute("tabindex", "0");
  card.addEventListener("click", () => openModal(card));
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      openModal(card);
    }
  });
});

modalCloseTargets.forEach((el) => {
  el.addEventListener("click", closeModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
  }
});

if (audioChip) {
  let audioContext = null;
  let oscillator = null;
  let gainNode = null;
  let lfo = null;
  let lfoGain = null;

  const startAudio = async () => {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    oscillator = audioContext.createOscillator();
    gainNode = audioContext.createGain();
    lfo = audioContext.createOscillator();
    lfoGain = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = 110;
    gainNode.gain.value = 0.0;

    lfo.type = "sine";
    lfo.frequency.value = 0.18;
    lfoGain.gain.value = 0.02;

    lfo.connect(lfoGain);
    lfoGain.connect(gainNode.gain);
    oscillator.connect(gainNode).connect(audioContext.destination);

    oscillator.start();
    lfo.start();

    gainNode.gain.linearRampToValueAtTime(0.05, audioContext.currentTime + 0.6);
  };

  const stopAudio = () => {
    if (!audioContext) return;
    gainNode.gain.linearRampToValueAtTime(0.0, audioContext.currentTime + 0.4);
    setTimeout(() => {
      oscillator.stop();
      lfo.stop();
      audioContext.close();
      audioContext = null;
      oscillator = null;
      gainNode = null;
      lfo = null;
      lfoGain = null;
    }, 500);
  };

  audioChip.addEventListener("click", async () => {
    const isOn = audioChip.getAttribute("aria-pressed") === "true";
    if (isOn) {
      audioChip.setAttribute("aria-pressed", "false");
      audioChip.textContent = "Ambient: Off";
      stopAudio();
    } else {
      audioChip.setAttribute("aria-pressed", "true");
      audioChip.textContent = "Ambient: On";
      await startAudio();
    }
  });
}
