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
      description: 'Features are grouped on the left — <strong>Stories</strong>, <strong>Play</strong>, <strong>Curiosity</strong>, <strong>Create</strong>, and a <strong>Parent Corner</strong>. Click any group to expand it and jump straight in.',
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
      title: '🔀 Switch Child & Parent Tools',
      description: 'Click <strong>Switch child</strong> to go back and manage AI / Practice mode, notifications, monthly AI credit balance, and Help — all on the child selection page.',
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
      description: 'Tap the menu to access all features — Stories, Activities, Learn to Write, Curiosity, Draw, Read & Quiz, My Writing, Memory Play, Journal, and Timeline.',
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
  {
    element: '#tour-mobile-switch',
    popover: {
      title: '🔀 Switch Child',
      description: 'Managing stories for multiple children? Tap here to switch to a different child\'s profile.',
      side: 'top', align: 'center',
    },
  },
]


// ── Shared launcher ────────────────────────────────────────────────────────────

function isMobileView() {
  // Match the CSS breakpoint used by .mobile-header / .app-header
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
export function startTour(enabledFeatures, quota, featureConfig = []) { // featureConfig kept for backwards compat
  function present(el) { return !!document.querySelector(el) }

  if (isMobileView()) {
    const openMenu  = () => window.dispatchEvent(new CustomEvent('glumbi:mobile-menu', { detail: true }))
    const closeMenu = () => window.dispatchEvent(new CustomEvent('glumbi:mobile-menu', { detail: false }))

    // Elements in the mobile header (always visible — menu must be closed)
    const HEADER_IDS = ['#tour-mobile-theme']
    // Elements inside the hamburger menu (menu must be open)
    const MENU_IDS   = ['#tour-mobile-switch']

    const headerSteps = MOBILE_STEPS
      .filter(s => HEADER_IDS.includes(s.element) && present(s.element))
      .map(s => ({ ...s, onHighlightStarted: closeMenu }))

    const menuSteps = MOBILE_STEPS
      .filter(s => MENU_IDS.includes(s.element) && present(s.element))
      .map((s, i) => ({ ...s, onHighlightStarted: i === 0 ? openMenu : undefined }))

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
      ...menuSteps.map((s, i) => s.element === '#tour-mobile-switch' ? {
        ...s,
        popover: {
          ...s.popover,
          title: '🔀 Switch Child & Parent Tools',
          description: 'Tap here to switch to a different child. You can also head back to the child selection page to manage <strong>🤖 AI / Practice mode</strong>, <strong>🔔 Notifications</strong>, <strong>AI credit balance</strong>, and <strong>💡 Help</strong>.',
        },
      } : s),
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
