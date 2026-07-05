import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

// ── Desktop tour ───────────────────────────────────────────────────────────────

const NAV_STEPS = [
  {
    feature: 'stories',
    element: '#tour-stories-tab',
    popover: {
      title: '📖 Stories',
      description: 'Generate personalized bedtime stories for your child. Just type a few keywords and AI does the magic!',
      side: 'right',
    },
  },
  {
    feature: 'activities',
    element: '#tour-activities-tab',
    popover: {
      title: '🎮 Activities',
      description: 'Get age-appropriate activity ideas based on the time of day and weather. Rate them to get better suggestions next time.',
      side: 'right',
    },
  },
  {
    feature: 'learn',
    element: '#tour-learn-tab',
    popover: {
      title: '✏️ Learn to Write',
      description: 'Practice writing English and Tamil letters, numbers, and words! Tap a letter to hear it, draw it on the canvas, and get instant AI feedback. Write full words and discover their meaning and translation.',
      side: 'right',
    },
  },
  {
    feature: 'curiosity',
    element: '#tour-curiosity-tab',
    popover: {
      title: '🔍 Curiosity Corner',
      description: 'When your child asks "why?" — type their question here. Get fun facts, analogies, and a mini quiz with a sticker reward!',
      side: 'right',
    },
  },
  {
    feature: 'draw',
    element: '#tour-draw-tab',
    popover: {
      title: '🎨 Draw',
      description: 'A free-hand drawing canvas! Draw anything, then hit "What did I draw?" and AI will guess with a fun, encouraging response.',
      side: 'right',
    },
  },
  {
    feature: 'readquiz',
    element: '#tour-readquiz-tab',
    popover: {
      title: '📚 Read & Quiz',
      description: 'Read an AI-generated story then answer 3 comprehension questions to earn a score. Great for building reading skills!',
      side: 'right',
    },
  },
  {
    feature: 'mywriting',
    element: '#tour-writing-tab',
    popover: {
      title: '✍️ My Writing',
      description: 'Your child writes their own story and gets warm, encouraging feedback from an AI writing coach.',
      side: 'right',
    },
  },
  {
    feature: 'memory',
    element: '#tour-memory-tab',
    popover: {
      title: '🧠 Memory Play',
      description: 'Flashcards, Word of the Day, and Memory Match games — all powered by AI to make learning stick!',
      side: 'right',
    },
  },
  {
    feature: 'journal',
    element: '#tour-journal-tab',
    popover: {
      title: '📝 Journal',
      description: 'A parent diary for your child\'s learning journey. Log moods, milestones, and memories — or let AI write a heartfelt entry from today\'s activities.',
      side: 'right',
    },
  },
  {
    feature: 'timeline',
    element: '#tour-timeline-tab',
    popover: {
      title: '🗓️ Timeline',
      description: 'See everything in one place — stories, journal entries, activities, and curiosity moments, grouped by month.',
      side: 'right',
    },
  },
]



const DESKTOP_UTILITY_STEPS = [
  {
    element: '#tour-theme-btn',
    popover: {
      title: '🎨 Change Theme',
      description: 'Click the palette icon to change the app\'s look. Pick from 20 themes — Superheroes, Festivals, Nature, and more!',
      side: 'bottom', align: 'end',
    },
  },
  {
    popover: {
      title: '🏠 Child Selection Page',
      description: 'Head back to the child selection page to find: <strong>🤖 AI / Practice mode</strong> per child, <strong>🔔 Notifications</strong>, <strong>monthly AI credit balance</strong>, and the <strong>💡 Help</strong> guide — all in one place.',
      side: 'over', align: 'center',
    },
  },
  {
    element: '#tour-child-name',
    popover: {
      title: '🔀 Switch Child',
      description: 'Managing stories for multiple children? Hit Switch to change who you\'re viewing.',
      side: 'bottom', align: 'end',
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
    const navSteps = NAV_STEPS
      .filter(s => {
        if (enabledFeatures && !enabledFeatures.includes(s.feature)) return false
        return present(s.element)
      })
      .map(({ element, popover }) => ({ element, popover }))

    const utilitySteps = [
      ...DESKTOP_UTILITY_STEPS.filter(s => present(s.element)),
    ]

    const steps = [
      {
        popover: {
          title: '👋 Welcome to Glumbi!',
          description: 'Let\'s take a quick tour so you know where everything is. It only takes a minute!',
          side: 'over', align: 'center',
        },
      },
      ...navSteps,
      ...utilitySteps,
      {
        popover: {
          title: '🌟 You\'re all set!',
          description: 'Start by generating your first story. Type something like "dragon, brave girl, magic forest" and watch the magic happen!',
          side: 'over', align: 'center',
        },
      },
    ]
    makeDriver(steps).drive()
  }
}
