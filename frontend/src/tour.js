import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

// ── Desktop tour ───────────────────────────────────────────────────────────────

const DESKTOP_STEPS = [
  {
    popover: {
      title: '👋 Welcome to Glumbi!',
      description: 'Let\'s take a quick tour so you know where everything is. It only takes a minute!',
      side: 'over', align: 'center',
    },
  },
  {
    element: '#tour-stories-tab',
    popover: {
      title: '📖 Everything\'s in the sidebar',
      description: 'Features are grouped on the left — <strong>Stories</strong>, <strong>Play</strong>, <strong>Curiosity</strong>, and <strong>Create</strong>. Click any group to expand it and jump straight in.',
      side: 'right',
    },
  },
  {
    element: '#tour-theme-btn',
    popover: {
      title: '🎨 Change Theme',
      description: 'Click the palette to change the app\'s look. Pick from 20+ themes — Superheroes, Festivals, Nature, and more!',
      side: 'bottom', align: 'end',
    },
  },
  {
    element: '#tour-child-name',
    popover: {
      title: '👧 Child Info',
      description: 'Shows the active child\'s name, age, and daily streak. Use the sidebar to switch features, or click the 🔒 icon to hand the device to a parent.',
      side: 'bottom', align: 'start',
    },
  },
  {
    popover: {
      title: '🌟 You\'re all set!',
      description: 'Start by generating your first story. Type something like "dragon, brave girl, magic forest" and watch the magic happen!',
      side: 'over', align: 'center',
    },
  },
]

// ── Mobile tour ────────────────────────────────────────────────────────────────

const MOBILE_STEPS = [
  {
    element: '#tour-mobile-menu',
    popover: {
      title: '☰ All Your Features',
      description: 'Tap the menu to access all features — Stories, Activities, Learn to Write, Curiosity, Draw, Read & Quiz, My Writing, Memory Play, and Journal.',
      side: 'bottom', align: 'end',
    },
  },
  {
    element: '#tour-mobile-theme',
    popover: {
      title: '🎨 Change Theme',
      description: 'Tap the palette to change the app\'s look. Pick from 20 themes — Superheroes, Festivals, Nature, and more!',
      side: 'bottom', align: 'end',
    },
  },
]


// ── Shared launcher ────────────────────────────────────────────────────────────

function isMobileView() {
  return window.innerWidth < 768
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

// enabledFeatures: string[] of feature keys or null = show all
// quota: { used, limit } — the user's actual quota object
export function startTour(enabledFeatures, quota, featureConfig = []) {
  function present(el) { return !!document.querySelector(el) }

  if (isMobileView()) {
    const openMenu  = () => window.dispatchEvent(new CustomEvent('glumbi:mobile-menu', { detail: true }))
    const closeMenu = () => window.dispatchEvent(new CustomEvent('glumbi:mobile-menu', { detail: false }))

    const HEADER_IDS = ['#tour-mobile-theme']

    const headerSteps = MOBILE_STEPS
      .filter(s => HEADER_IDS.includes(s.element) && present(s.element))
      .map(s => ({ ...s, onHighlightStarted: closeMenu }))

    const steps = [
      {
        popover: {
          title: '👋 Welcome to Glumbi!',
          description: 'Let\'s take a quick tour so you know where everything is. It only takes a minute!',
          side: 'over', align: 'center',
        },
      },
      {
        element: '#tour-mobile-menu',
        popover: {
          title: '☰ Menu & AI Credits',
          description: 'Tap to access all features — Stories, Activities, Learn to Write, Curiosity, Draw, and more. The menu also shows your <strong>monthly AI credit balance</strong> so you always know how many you have left.',
          side: 'bottom', align: 'end',
        },
        onHighlightStarted: closeMenu,
      },
      ...headerSteps,
      {
        popover: {
          title: '🌟 You\'re all set!',
          description: 'Tap ☰ to pick a feature and start the magic. Try generating your first story!',
          side: 'over', align: 'center',
          onPopoverRender: closeMenu,
        },
      },
    ]
    makeDriver(steps).drive()
  } else {
    const steps = DESKTOP_STEPS.filter(s => !s.element || present(s.element))
    makeDriver(steps).drive()
  }
}
