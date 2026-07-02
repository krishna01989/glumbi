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
    feature: 'journal',
    element: '#tour-journal-tab',
    popover: {
      title: '📝 Journal',
      description: 'Record milestones, moods, and precious moments. Build a memory book as your child grows.',
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
    feature: 'timeline',
    element: '#tour-timeline-tab',
    popover: {
      title: '🗓️ Timeline',
      description: 'See everything in one place — stories, journal entries, activities, and curiosity moments, grouped by month.',
      side: 'right',
    },
  },
]

function featureCostSummary(featureConfig) {
  if (!featureConfig || featureConfig.length === 0)
    return 'Different features use different amounts — a curiosity question costs 1 credit, a story costs 2, a read &amp; quiz session costs 3.'
  const LABELS = {
    'story': 'Story', 'activity': 'Activity', 'curiosity': 'Curiosity',
    'read-quiz': 'Read &amp; Quiz', 'writing-coach': 'Writing Coach',
    'translation': 'Translation', 'draw': 'Drawing',
    'learn-validate': 'Letter Check', 'learn-word': 'Learn Word',
  }
  return featureConfig
    .filter(fc => LABELS[fc.featureName])
    .sort((a, b) => b.creditCost - a.creditCost)
    .map(fc => `<strong>${LABELS[fc.featureName]}</strong>: ${fc.creditCost} cr`)
    .join(' · ')
}

function desktopQuotaStep(limit, featureConfig) {
  return {
    element: '#tour-quota',
    popover: {
      title: '🤖 Monthly AI Credits',
      description: `You get <strong>${limit} AI credits every month</strong>. ${featureCostSummary(featureConfig)} The bar turns yellow near the limit and red when credits run out. Resets on the 1st.`,
      side: 'right', align: 'end',
    },
  }
}

const DESKTOP_UTILITY_STEPS = [
  {
    element: '#tour-help-btn',
    popover: {
      title: '💡 Help',
      description: 'New to Glumbi or stuck on something? Tap Help to open the full guide — covers every feature with answers to common questions.',
      side: 'right', align: 'start',
    },
  },
  {
    element: '#tour-theme-btn',
    popover: {
      title: '🎨 Change Theme',
      description: 'Click the palette icon to change the app\'s look. Pick from 20 themes — Superheroes, Festivals, Nature, and more!',
      side: 'bottom', align: 'end',
    },
  },
  {
    element: '#tour-offline-toggle',
    popover: {
      title: '✈️ Practice Mode',
      description: 'Toggle between <strong>🤖 AI On</strong> and <strong>✈️ Practice</strong> mode. In practice mode, all AI features are paused — kids can still draw, write, and browse freely without using any AI credits. Listening to stories and words always works regardless. Great for credit-free practice sessions!',
      side: 'bottom', align: 'end',
    },
  },
  {
    element: '#tour-notifications',
    popover: {
      title: '🔔 Notifications',
      description: 'Get weekly insights about your child\'s progress — milestones reached, story recommendations, and learning highlights.',
      side: 'bottom', align: 'end',
    },
  },
  {
    element: '#tour-profile',
    popover: {
      title: '👤 My Account',
      description: 'View your account details, change your password, or delete your account.',
      side: 'bottom', align: 'end',
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
      description: 'Tap the menu to access all features — Stories, Activities, Learn to Write, Curiosity, Draw, Journal, Read & Quiz, My Writing, and Timeline.',
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
    element: '#tour-mobile-notifications',
    popover: {
      title: '🔔 Notifications',
      description: 'Get weekly insights about your child\'s progress — milestones reached, story recommendations, and learning highlights.',
      side: 'bottom', align: 'end',
    },
  },
  {
    element: '#tour-mobile-offline',
    popover: {
      title: '✈️ Practice Mode',
      description: 'Toggle between <strong>🤖 AI On</strong> and <strong>✈️ Practice</strong> mode. In practice mode all AI features pause — kids can still draw, write, and browse freely without spending credits. Listening always works. Tap again to turn AI back on.',
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

function mobileQuotaStep(limit, featureConfig) {
  return {
    // quota bar is inside the mobile menu — show as a floating step instead
    popover: {
      title: '🤖 Monthly AI Credits',
      description: `You get <strong>${limit} AI credits every month</strong>. ${featureCostSummary(featureConfig)} Open the ☰ menu at any time to check your usage. Resets on the 1st.`,
      side: 'over', align: 'center',
    },
  }
}

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
// featureConfig: [{ featureName, creditCost }] — live feature costs from backend
export function startTour(enabledFeatures, quota, featureConfig = []) {
  function present(el) { return !!document.querySelector(el) }
  const creditLimit = quota?.limit ?? 100

  if (isMobileView()) {
    const steps = [
      {
        popover: {
          title: '👋 Welcome to Glumbi!',
          description: 'Let\'s take a quick tour so you know where everything is. It only takes a minute!',
          side: 'over', align: 'center',
        },
      },
      ...MOBILE_STEPS.filter(s => !s.element || present(s.element)),
      mobileQuotaStep(creditLimit, featureConfig),
      {
        element: '#tour-mobile-help',
        popover: {
          title: '💡 Help',
          description: 'New to Glumbi or need a hand? Tap Help to open the full guide — covers every feature with answers to common questions.',
          side: 'top', align: 'center',
        },
      },
      {
        popover: {
          title: '🌟 You\'re all set!',
          description: 'Tap ☰ to pick a feature and start the magic. Try generating your first story!',
          side: 'over', align: 'center',
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
      desktopQuotaStep(creditLimit, featureConfig),
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
