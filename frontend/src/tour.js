import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

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

// enabledFeatures: string[] of feature keys (e.g. ["stories","draw"]) or null = show all
export function startTour(enabledFeatures) {
  const navSteps = NAV_STEPS
    .filter(s => {
      if (enabledFeatures && !enabledFeatures.includes(s.feature)) return false
      return !!document.querySelector(s.element)
    })
    .map(({ element, popover }) => ({ element, popover }))

  const d = driver({
    animate: true,
    showProgress: true,
    showButtons: ['next', 'previous', 'close'],
    nextBtnText: 'Next →',
    prevBtnText: '← Back',
    doneBtnText: '🎉 Let\'s go!',
    progressText: '{{current}} of {{total}}',
    popoverClass: 'tt-tour',
    steps: [
      {
        popover: {
          title: '👋 Welcome to Glumbi!',
          description: 'Let\'s take a quick tour so you know where everything is. It only takes a minute!',
          side: 'over', align: 'center',
        },
      },
      ...navSteps,
      {
        element: '#tour-quota',
        popover: {
          title: '🤖 Monthly AI Calls',
          description: 'Every AI action — generating a story, answering a curiosity question, validating a letter drawing, identifying a word, drawing feedback, Read & Quiz, My Writing — uses 1 call. You get 200 per month, shared across all features. The bar turns yellow when you\'re near the limit and red when it\'s full. Resets on the 1st.',
          side: 'right', align: 'end',
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
      {
        popover: {
          title: '🌟 You\'re all set!',
          description: 'Start by generating your first story. Type something like "dragon, brave girl, magic forest" and watch the magic happen!',
          side: 'over', align: 'center',
        },
      },
    ],
  })

  d.drive()
}
