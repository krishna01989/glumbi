/**
 * Single source of truth for feature metadata.
 *
 * Keys are the backend feature config names (used in FeatureConfig, FeatureConfigSeeder,
 * UserController credit breakdown, and the ℹ️ credit popup).
 *
 * `analyticsKey` is the feature name used in ChildActivityEvent (analytics tracking) —
 * it differs from the config key for some features. Used only by ChildInsightsPage.
 *
 * Admin-only fields (desc, maxTokens, suggestedCost) live in AdminPage.jsx FEATURE_META
 * and are intentionally not duplicated here.
 */
const FEATURE_META = {
  'story':               { label: 'Stories',          emoji: '📖', analyticsKey: 'stories'     },
  'activity':            { label: 'Activities',       emoji: '🎮', analyticsKey: 'activities'  },
  'curiosity':           { label: 'Curiosity',        emoji: '🔍', analyticsKey: 'curiosity'   },
  'read-quiz':           { label: 'Read & Quiz',      emoji: '📚', analyticsKey: 'readquiz'    },
  'writing-coach':       { label: 'My Writing',       emoji: '✍️', analyticsKey: 'mywriting'   },
  'translation':         { label: 'Translation',      emoji: '🌍', analyticsKey: 'translation' },
  'draw':                { label: 'Draw',             emoji: '🎨', analyticsKey: 'draw'        },
  'draw-guide':          { label: 'Drawing Guide',    emoji: '🖌️', analyticsKey: 'draw'        },
  'draw-animate':        { label: 'Bring to Life',    emoji: '🎬', analyticsKey: 'draw'        },
  'flipbook':            { label: 'Flipbook Studio',  emoji: '🖼️', analyticsKey: 'flipbook'    },
  'learn-validate':      { label: 'Learn to Write',   emoji: '✏️', analyticsKey: 'learn'       },
  'learn-word':          { label: 'Learn a Word',     emoji: '🔤', analyticsKey: 'learn'       },
  'story-listen':        { label: 'Story Listening',  emoji: '🎧', analyticsKey: 'stories'     },
  'story-runner':        { label: 'Story Chase',      emoji: '🎮', analyticsKey: 'stories'     },
  'memory':              { label: 'Memory Play',      emoji: '🧠', analyticsKey: null           },
  'memory-flashcards':   { label: 'Flashcards',       emoji: '🧠', analyticsKey: 'flashcards'  },
  'word-of-day':         { label: 'Word of Day',      emoji: '💡', analyticsKey: 'wordofday'   },
  'memory-match':        { label: 'Memory Match',     emoji: '🃏', analyticsKey: 'memorymatch' },
  'journal-ai':          { label: 'AI Journal',       emoji: '📔', analyticsKey: 'journal'     },
  'maze':                { label: 'Maze',             emoji: '🌀', analyticsKey: 'maze'        },
  'riddle':              { label: 'Riddles',          emoji: '❓', analyticsKey: 'riddle'      },
  'torch-hunt':          { label: 'Torch Hunt',       emoji: '🔦', analyticsKey: 'torch-hunt'  },
}

export default FEATURE_META

/**
 * Lookup by analytics key (as stored in ChildActivityEvent.feature).
 * Returns the first matching config-key entry, or a fallback.
 */
const _byAnalytics = {}
for (const [key, val] of Object.entries(FEATURE_META)) {
  if (val.analyticsKey && !_byAnalytics[val.analyticsKey]) {
    _byAnalytics[val.analyticsKey] = { ...val, configKey: key }
  }
}
export function featureByAnalyticsKey(analyticsKey) {
  return _byAnalytics[analyticsKey] || { label: analyticsKey, emoji: '🎮', configKey: analyticsKey }
}
