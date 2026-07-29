import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

function isMobileView() {
  return window.innerWidth < 768
}

function present(sel) {
  return !!document.querySelector(sel)
}

function makeDriver(steps) {
  return driver({
    animate: true,
    showProgress: true,
    showButtons: ['next', 'previous', 'close'],
    nextBtnText: 'Next →',
    prevBtnText: '← Back',
    doneBtnText: '🎉 Let\'s go!',
    progressText: '{{current}} of {{total}}',
    popoverClass: 'tt-tour',
    steps,
  })
}

// ── Desktop tour ───────────────────────────────────────────────────────────────

const DESKTOP_STEPS = [
  {
    popover: {
      title: '👋 Welcome to Glumbi!',
      description: 'Your child\'s learning world is ready. Let\'s take a quick look around — it only takes a minute!',
      side: 'over', align: 'center',
    },
  },
  {
    element: '#tour-hub-header',
    popover: {
      title: '🌌 Your child\'s themed world',
      description: 'The hub is styled to match your child\'s chosen theme — background, particles, colours, and more change with every theme.',
      side: 'bottom', align: 'center',
    },
  },
  {
    element: '#tour-hub-swiper',
    popover: {
      title: '🪐 Four learning zones',
      description: '<strong>Swipe left or right</strong> to browse the four zones — <strong>Story World</strong>, <strong>Curiosity Corner</strong>, <strong>Play Zone</strong>, and <strong>Art Studio</strong>. Tap a zone card to enter it and see the features inside as orbiting planets.',
      side: 'top', align: 'center',
    },
  },
  {
    element: '#tour-hub-wotd',
    popover: {
      title: '🧠 Word of the Day',
      description: 'A new word appears here every day. Tap it to explore the full entry, or jump straight to Flashcards or Memory Match.',
      side: 'bottom', align: 'center',
    },
  },
  {
    element: '#tour-theme-btn',
    popover: {
      title: '🎨 Change the theme',
      description: 'Tap the palette to pick from 49 themes — Superheroes, Festivals, Nature, Seasons, and more. The whole hub transforms instantly.',
      side: 'bottom', align: 'end',
    },
  },
  {
    element: '#tour-child-name',
    popover: {
      title: '🔒 Parental controls',
      description: 'Click the child avatar to lock the session with a PIN, set a screen-time limit, or switch back to the parent view.',
      side: 'bottom', align: 'start',
    },
  },
  {
    popover: {
      title: '🌟 You\'re all set!',
      description: 'Ask your child to pick a zone and explore. Every feature is designed to be fun and age-appropriate.',
      side: 'over', align: 'center',
    },
  },
]

// ── Mobile tour ────────────────────────────────────────────────────────────────

const MOBILE_STEPS = [
  {
    popover: {
      title: '👋 Welcome to Glumbi!',
      description: 'Your child\'s learning world is ready. Here\'s a quick look at how the hub works.',
      side: 'over', align: 'center',
    },
  },
  {
    element: '#tour-hub-header',
    popover: {
      title: '🌌 Your child\'s themed world',
      description: 'The hub matches your child\'s chosen theme — background, particles, and colours all change with it.',
      side: 'bottom', align: 'center',
    },
  },
  {
    element: '#tour-hub-swiper',
    popover: {
      title: '🪐 Swipe to explore zones',
      description: '<strong>Swipe left or right</strong> to browse the four learning zones. Tap a zone card to enter it and see the features inside as orbiting planets. Tap a planet to jump straight in.',
      side: 'top', align: 'center',
    },
  },
  {
    element: '#tour-hub-wotd',
    popover: {
      title: '🧠 Word of the Day',
      description: 'A new word appears here every day — tap it to explore, or jump to Flashcards or Match.',
      side: 'bottom', align: 'center',
    },
  },
  {
    element: '#tour-mobile-theme',
    popover: {
      title: '🎨 Change the theme',
      description: 'Tap the palette to pick from 49 themes. The whole hub transforms instantly.',
      side: 'bottom', align: 'end',
    },
  },
  {
    element: '#tour-mobile-tour',
    popover: {
      title: '❓ This button',
      description: 'Tap here any time to replay this tour. Tap your child\'s avatar (with 🔒) to set a PIN, screen-time limit, or return to the parent view.',
      side: 'bottom', align: 'end',
    },
  },
  {
    popover: {
      title: '🌟 All set!',
      description: 'Let your child swipe through the zones and explore. Have fun!',
      side: 'over', align: 'center',
    },
  },
]

// ── Launcher ──────────────────────────────────────────────────────────────────

export function startTour(enabledFeatures, quota, featureConfig = []) {
  if (isMobileView()) {
    const steps = MOBILE_STEPS.filter(s => !s.element || present(s.element))
    makeDriver(steps).drive()
  } else {
    const steps = DESKTOP_STEPS.filter(s => !s.element || present(s.element))
    makeDriver(steps).drive()
  }
}
