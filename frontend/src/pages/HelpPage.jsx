import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const SECTIONS = [
  {
    emoji: '🚀',
    title: 'Getting Started',
    items: [
      {
        q: 'How do I add a child?',
        a: 'After logging in, tap "Add Child" on the dashboard. Enter your child\'s name, age, and interests. You can add up to 3 children and switch between them at any time from the top of the sidebar.',
      },
      {
        q: 'What are credits?',
        a: 'Credits are used each time Glumbi calls an AI to generate content. You get a monthly allowance that resets automatically on the 1st of every month. The credit bar in the menu shows your balance at any time.',
      },
      {
        q: 'How many credits does each feature use?',
        a: 'Lighter features like answering a curiosity question or checking a letter cost just 1 credit. Richer features like generating a full story or a read & quiz session cost a few more. Simple things like drawing, journaling, and browsing saved content are always free — they never use credits.',
      },
      {
        q: 'What happens when I run out of credits?',
        a: 'AI features are paused until your credits reset next month. Your child can still read saved stories, browse their Journal, view the Timeline, and listen to already-generated audio.',
      },
      {
        q: 'Can I change my child\'s theme or details?',
        a: 'Yes — click the edit icon next to your child\'s name in the sidebar, or go to the child list page. You can change the name, age, interests, and colour theme at any time.',
      },
    ],
  },
  {
    emoji: '📖',
    title: 'Stories',
    items: [
      {
        q: 'How do I generate a story?',
        a: 'Go to Stories and type a few keywords in the "Story Magic" box — like "dragon, brave girl, magic forest" — then tap Generate Story. Glumbi creates a personalised story in seconds.',
      },
      {
        q: 'How does listening work?',
        a: 'Tap the 🔊 Listen button on any story. A picker appears where you can choose the language, English accent (US, India, British, Australian), and voice gender (♀ / ♂). Your choices are saved so you don\'t need to pick again next time.',
      },
      {
        q: 'Can I listen in other languages?',
        a: 'Yes! The language picker supports English, Spanish, French, Italian, Chinese, Japanese, Korean, Tamil, Hindi, Malayalam, Telugu, and Kannada. The story is translated on the fly and narrated in that language.',
      },
      {
        q: 'Can I save favourite stories?',
        a: 'Tap the ☆ star icon on any story card or inside the story reader to favourite it. You can filter for favourites from the story list.',
      },
    ],
  },
  {
    emoji: '🎯',
    title: 'Activities',
    items: [
      {
        q: 'Where do activities come from?',
        a: 'Activities are generated from a story — open a story first, then go to the Activities tab. Glumbi suggests age-appropriate things to do based on the story\'s theme.',
      },
      {
        q: 'How do I mark an activity as done?',
        a: 'Tap the activity card and hit "Mark Complete". You can also give it a star rating. Completed activities show up in the Timeline.',
      },
    ],
  },
  {
    emoji: '🔭',
    title: 'Curiosity',
    items: [
      {
        q: 'What is the Curiosity section?',
        a: 'Glumbi generates a "wonder question" — something like "Why is the sky blue?" or "How do birds know where to fly in winter?" — to spark your child\'s curiosity and start conversations.',
      },
      {
        q: 'Can I generate more than one question?',
        a: 'Yes, tap "Ask Another" to get a fresh question. Each question and its AI-generated explanation is saved so your child can revisit them.',
      },
    ],
  },
  {
    emoji: '📚',
    title: 'Read & Quiz',
    items: [
      {
        q: 'How does Read & Quiz work?',
        a: 'Enter a topic and Glumbi writes a short passage and a comprehension quiz. Your child reads the passage, answers the questions, and sees their score immediately. All past quizzes are saved.',
      },
      {
        q: 'Are scores tracked over time?',
        a: 'Yes — the Quiz History tab shows all past quizzes with scores and dates so you can see progress over time.',
      },
    ],
  },
  {
    emoji: '✏️',
    title: 'Learn to Write',
    items: [
      {
        q: 'What can my child learn to write?',
        a: 'Letters and words in English, Tamil, and Hindi. Switch between scripts using the tabs at the top. English has Vowels, Consonants, and Print modes. Tamil has vowels (uyir), consonants (mey), and compound letters (uyirmei).',
      },
      {
        q: 'How does AI validation work?',
        a: 'Your child draws on the canvas and taps Submit. Glumbi\'s AI looks at the drawing and gives warm, encouraging feedback. Any visible pen strokes count as a correct attempt — effort is always rewarded, never penalised for neatness.',
      },
      {
        q: 'Does practice show in the Timeline?',
        a: 'Yes — every completed letter or word attempt is saved to the Timeline so you can see what your child has been practising.',
      },
    ],
  },
  {
    emoji: '✍️',
    title: 'My Writing',
    items: [
      {
        q: 'What is My Writing for?',
        a: 'Your child can write their own story or creative piece here. When they\'re done, tap "Get Feedback" and Glumbi\'s writing coach gives kind, age-appropriate suggestions to help them improve.',
      },
      {
        q: 'Are writing pieces saved?',
        a: 'Yes, all pieces are saved and can be viewed, edited, or deleted from the writing history.',
      },
    ],
  },
  {
    emoji: '🎨',
    title: 'Draw',
    items: [
      {
        q: 'What can my child draw?',
        a: 'Anything! The canvas is a free-draw space. When they\'re done, tap Identify and Glumbi will describe what it sees and say something encouraging about the drawing.',
      },
    ],
  },
  {
    emoji: '📓',
    title: 'Journal',
    items: [
      {
        q: 'What is the Journal?',
        a: 'A private space for your child to write down thoughts, feelings, or anything they want to remember. Journal entries are never sent to AI — they stay completely private.',
      },
    ],
  },
  {
    emoji: '🗓️',
    title: 'Timeline',
    items: [
      {
        q: 'What shows up in the Timeline?',
        a: 'Everything your child completes — activities, quizzes, writing pieces, curiosity questions, and Learn to Write practice — appears here in order, so you can see their learning journey at a glance.',
      },
      {
        q: 'Can I filter the Timeline?',
        a: 'Yes, use the date range and category filters at the top to focus on a particular type of activity or time period.',
      },
    ],
  },
  {
    emoji: '🔔',
    title: 'Notifications',
    items: [
      {
        q: 'What are the weekly notifications?',
        a: 'Every week Glumbi\'s AI agents review each child\'s activity and send personalised notifications to the parent: a Progress Report, Milestones reached, Story Recommendations, Learning Insights, and a summary of letters and words practised in Learn to Write.',
      },
      {
        q: 'Where do I see notifications?',
        a: 'Tap the 🔔 bell icon in the top navigation bar. A red badge shows how many unread notifications you have.',
      },
    ],
  },
  {
    emoji: '🔒',
    title: 'Safety & Privacy',
    items: [
      {
        q: 'Is the content safe for kids?',
        a: 'Yes. Every piece of AI-generated content passes a Safety Guard check before it is shown. Anything flagged as inappropriate is discarded and not shown to your child.',
      },
      {
        q: 'Is my child\'s data private?',
        a: 'Journal entries are never sent to any AI. All other content is processed by Anthropic\'s Claude AI to generate responses but is not used for training. See our Privacy Policy for full details.',
      },
      {
        q: 'Can I delete my account and data?',
        a: 'Yes — go to Profile → Account Settings → Delete Account. This permanently removes your account, all child profiles, and all associated content.',
      },
    ],
  },
]

function Section({ section }) {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: 24 }}>{section.emoji}</span>
        <h2 style={{ fontSize: 15, color: 'var(--text)', margin: 0, fontWeight: 700 }}>{section.title}</h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {section.items.map((item, i) => {
          const open = openIndex === i
          return (
            <div key={i}
              style={{ border: '1.5px solid', borderColor: open ? 'var(--primary)' : '#f0f0f0', borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.2s' }}>
              <button
                onClick={() => setOpenIndex(open ? null : i)}
                style={{
                  width: '100%', textAlign: 'left', padding: '14px 18px',
                  background: open ? 'var(--primary-lt)' : 'white',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
                  fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 14, color: open ? 'var(--primary)' : 'var(--text)',
                  transition: 'background 0.2s',
                }}>
                <span>{item.q}</span>
                <span style={{ fontSize: 18, color: open ? 'var(--primary)' : '#ccc', flexShrink: 0 }}>{open ? '−' : '+'}</span>
              </button>
              {open && (
                <div style={{ padding: '0 18px 16px', fontSize: 14, lineHeight: 1.7, color: '#555', fontFamily: 'Nunito, sans-serif', background: 'white' }}>
                  {item.a}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function HelpPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? SECTIONS.map(s => ({
        ...s,
        items: s.items.filter(item =>
          item.q.toLowerCase().includes(search.toLowerCase()) ||
          item.a.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter(s => s.items.length > 0)
    : SECTIONS

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 20px 48px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 52, marginBottom: 10 }}>🌟</div>
        <h1 style={{ fontSize: 24, color: 'var(--primary)', marginBottom: 8, fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}>Glumbi Help</h1>
        <p style={{ color: 'var(--muted)', fontSize: 15, fontFamily: 'Nunito, sans-serif' }}>
          Everything you need to know about using Glumbi with your child.
        </p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 32 }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: '#ccc' }}>🔍</span>
        <input
          placeholder="Search questions…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '12px 16px 12px 40px', borderRadius: 50, border: '1.5px solid #eee', fontSize: 14, fontFamily: 'Nunito, sans-serif', outline: 'none', boxSizing: 'border-box' }}
          onFocus={e => e.target.style.borderColor = 'var(--primary)'}
          onBlur={e => e.target.style.borderColor = '#eee'}
        />
      </div>

      {/* Sections */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🤔</div>
          <div style={{ fontWeight: 700, fontFamily: 'Nunito, sans-serif' }}>No results for "{search}"</div>
          <div style={{ fontSize: 13, marginTop: 6 }}>Try different keywords or browse all sections below.</div>
          <button onClick={() => setSearch('')} style={{ marginTop: 16, background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 50, padding: '8px 20px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>
            Clear search
          </button>
        </div>
      ) : (
        filtered.map(s => <Section key={s.title} section={s} />)
      )}

      {/* Still need help */}
      <div style={{ background: 'var(--primary-lt)', borderRadius: 16, padding: 24, textAlign: 'center', marginTop: 16 }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>💬</div>
        <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--primary)', fontFamily: 'Nunito, sans-serif', marginBottom: 6 }}>Still need help?</div>
        <div style={{ fontSize: 13, color: '#777', fontFamily: 'Nunito, sans-serif', marginBottom: 14 }}>
          We're happy to help with anything not covered here.
        </div>
        <button onClick={() => navigate('/contact')}
          style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 50, padding: '10px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>
          Contact Us
        </button>
      </div>
    </div>
  )
}
