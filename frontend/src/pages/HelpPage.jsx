import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const SECTIONS = [
  {
    emoji: '🚀',
    title: 'Getting Started',
    items: [
      {
        q: 'How do I add a child?',
        a: 'After logging in, tap "Add Child" on the home screen. Enter your child\'s name, age, and interests, and pick a colour theme. You can add up to 3 children and switch between them at any time from the child selection screen.',
      },
      {
        q: 'What are AI credits?',
        a: 'Credits are used each time Glumbi calls AI to generate content — a story, a quiz, flashcards, and so on. You get a monthly allowance that resets automatically on the 1st of every month. The credit bar on the home screen shows your current balance at a glance. Tap the ⓘ next to the bar to see exactly how many credits each feature uses.',
      },
      {
        q: 'What happens when I run out of credits?',
        a: 'AI-powered generation is paused until your credits reset next month. Your child can still read and replay all saved stories, browse their Journal, view the Timeline, replay past quizzes, and listen to already-generated audio — nothing is locked away.',
      },
      {
        q: 'Can I change my child\'s details or theme?',
        a: 'Yes — tap your child\'s avatar on the home screen to open the "Hand to child" panel, then tap ✏️ Edit. You can update the name, birth year, avatar, colour theme, and which features are enabled at any time.',
      },
      {
        q: 'Can I enable or disable specific features for my child?',
        a: 'Yes — when editing a child\'s profile, scroll to the Features section. Toggle any feature on or off. Disabled features are hidden from that child\'s screen entirely.',
      },
    ],
  },
  {
    emoji: '📖',
    title: 'Stories',
    items: [
      {
        q: 'How do I generate a story?',
        a: 'Open Stories and type a few keywords in the "Story Magic" box — for example "dragon, brave girl, magic forest" — then tap Generate Story. Glumbi creates a personalised story in seconds, tailored to your child\'s age and interests.',
      },
      {
        q: 'How does listening work?',
        a: 'Tap the 🔊 Listen button on any story. A picker lets you choose the language and voice. If you haven\'t added a custom voice, you can pick an English accent and voice gender. Your choices are remembered so you don\'t need to pick again next time.',
      },
      {
        q: 'Can I use my own voice to narrate stories?',
        a: 'Yes! Go to My Account → Story Voices and record a 1–3 minute clip directly in the browser, or upload an audio file. Give it a name (e.g. "Mum", "Dad", "Grandpa") and save it. Once saved, select it in the 🔊 Listen picker and stories are read aloud in that person\'s voice. You can add up to 5 voices per family.',
      },
      {
        q: 'Can I listen in other languages?',
        a: 'Yes! The language picker supports English, Spanish, French, Italian, Chinese, Japanese, Korean, Tamil, Hindi, Malayalam, Telugu, and Kannada. The story is translated and narrated in the chosen language on the fly.',
      },
      {
        q: 'Can I save favourite stories?',
        a: 'Tap the ☆ star on any story card or inside the story reader to mark it as a favourite. Use the Favourites filter on the story list to find them quickly.',
      },
    ],
  },
  {
    emoji: '🎯',
    title: 'Activities',
    items: [
      {
        q: 'Where do activities come from?',
        a: 'Activities are generated from a story. Open any saved story and switch to the Activities tab — Glumbi suggests age-appropriate things to do based on the story\'s theme and your child\'s interests.',
      },
      {
        q: 'How do I mark an activity as done?',
        a: 'Tap the activity card and hit "Mark Complete". You can also give it a star rating. Completed activities appear in the Timeline.',
      },
    ],
  },
  {
    emoji: '🔭',
    title: 'Curiosity',
    items: [
      {
        q: 'What is the Curiosity section?',
        a: 'Glumbi generates a wonder question tailored to your child — things like "Why is the sky blue?" or "How do birds know where to fly in winter?" — to spark curiosity and start conversations. Each question comes with a child-friendly AI explanation.',
      },
      {
        q: 'Can I generate more questions?',
        a: 'Yes, tap "New Question" to get a fresh one. All past questions and their explanations are saved so your child can revisit them any time.',
      },
    ],
  },
  {
    emoji: '📚',
    title: 'Read & Quiz',
    items: [
      {
        q: 'How does Read & Quiz work?',
        a: 'Enter a topic and Glumbi writes a short, age-appropriate passage and a comprehension quiz. Your child reads the passage, answers the questions, and sees their score straight away. All past quizzes are saved in the Quiz History tab.',
      },
      {
        q: 'Are scores tracked over time?',
        a: 'Yes — the Quiz History tab shows every past quiz with score, date, and topic, so you can see your child\'s comprehension progress at a glance.',
      },
    ],
  },
  {
    emoji: '✏️',
    title: 'Learn to Write',
    items: [
      {
        q: 'What scripts can my child practise?',
        a: 'English, Tamil, and Hindi. Switch between them using the tabs at the top. English has Vowels, Consonants, and full Alphabet modes. Tamil covers vowels (uyir), consonants (mey), and compound letters (uyirmei). Hindi covers vowels (swar) and consonants (vyanjan).',
      },
      {
        q: 'How does AI feedback work?',
        a: 'Your child draws a letter or word on the canvas and taps Submit. Glumbi\'s AI reviews the drawing and gives warm, encouraging feedback. Effort is always rewarded — any visible attempt counts as a success, so children are never made to feel bad about neatness.',
      },
      {
        q: 'Is practice saved?',
        a: 'Yes — every completed attempt is logged in the Timeline so you can see which letters and words your child has been practising.',
      },
    ],
  },
  {
    emoji: '✍️',
    title: 'My Writing',
    items: [
      {
        q: 'What is My Writing for?',
        a: 'A space for your child to write their own stories, poems, or anything creative. When they\'re ready, tap "Get Feedback" and Glumbi\'s writing coach gives kind, age-appropriate suggestions to help them grow as a writer.',
      },
      {
        q: 'Are writing pieces saved?',
        a: 'Yes — all pieces are saved automatically and can be viewed, continued, or deleted from the writing history.',
      },
    ],
  },
  {
    emoji: '🧠',
    title: 'Memory Play',
    items: [
      {
        q: 'What is Memory Play?',
        a: 'Memory Play is a learning game section with three modes: Flashcards, Memory Match, and Word of the Day. Each mode is designed to build vocabulary and memory skills through play.',
      },
      {
        q: 'How do Flashcards work?',
        a: 'Enter a topic — like "Animals" or "Space" — and Glumbi generates a set of question-and-answer flashcards. Tap a card to flip it and reveal the answer. Work through the deck at your own pace.',
      },
      {
        q: 'How does Memory Match work?',
        a: 'Choose a theme and difficulty level, then Glumbi generates a grid of face-down cards. Flip two at a time to find matching pairs — emoji on one card, word on the other. The game tracks your moves and celebrates when you match them all. You can tap the expand icon to play in fullscreen for a more immersive experience.',
      },
      {
        q: 'What is the Word of the Day?',
        a: 'Each day Glumbi picks a new word suited to your child\'s age and interests, with a simple definition and an example sentence. It\'s a gentle daily habit to grow vocabulary one word at a time.',
      },
      {
        q: 'Do Memory Play games use credits?',
        a: 'Generating a new flashcard set or a new Memory Match game uses credits. Replaying a saved game or viewing the Word of the Day is free.',
      },
    ],
  },
  {
    emoji: '🎨',
    title: 'Draw',
    items: [
      {
        q: 'What can my child draw?',
        a: 'Anything they like — the canvas is a free-draw space with colour and brush options. Tools include pencil, paint bucket fill, and eraser in multiple sizes.',
      },
      {
        q: 'What does "Bring to Life" do?',
        a: 'After drawing, tap "Bring to Life" and Glumbi\'s AI identifies what was drawn and plays a matching animation on top — a bee will fly around, a flower will wiggle, a rocket will launch. Each object gets its own animation based on what it is.',
      },
      {
        q: 'Are drawings saved?',
        a: 'Yes — all drawings are saved in the Draw history so your child can look back at their artwork.',
      },
    ],
  },
  {
    emoji: '🎬',
    title: 'Flipbook Studio',
    items: [
      {
        q: 'What is Flipbook Studio?',
        a: 'Flipbook Studio lets kids create frame-by-frame animations — just like a real paper flipbook. Draw on each frame, press play, and watch your pictures come alive as a smooth animation.',
      },
      {
        q: 'How many frames can my child add?',
        a: 'Up to 24 frames per flipbook. Use the + button to add a new blank frame, or the copy button to duplicate the current frame and make small changes — a great technique for smooth animation.',
      },
      {
        q: 'What is the eye icon (👁️) in the toolbar?',
        a: 'That\'s the onion skin toggle. When turned on, you can faintly see the previous frame behind your current one — this helps your child draw objects in slightly different positions to create smooth movement.',
      },
      {
        q: 'Can my child download their animation?',
        a: 'Yes! Tap "Save My Movie!" and the animation downloads as a video file (.webm) that can be played on any device.',
      },
      {
        q: 'Can frames be reordered?',
        a: 'Yes — drag and drop any frame thumbnail to move it to a different position. On touch devices, press and slide the frame to drag it.',
      },
    ],
  },
  {
    emoji: '📓',
    title: 'Journal',
    items: [
      {
        q: 'What is the Journal?',
        a: 'A private space for your child to write down thoughts, feelings, or anything they want to remember. Journal entries are never sent to any AI — they stay completely private and are never used for any analysis.',
      },
      {
        q: 'Can parents read the Journal?',
        a: 'The Journal is designed as your child\'s private space. It is not shared with parents through the app — entries are only visible when using the same logged-in session.',
      },
    ],
  },
  {
    emoji: '🗓️',
    title: 'Timeline',
    items: [
      {
        q: 'What shows up in the Timeline?',
        a: 'Everything your child completes — activities, quizzes, writing pieces, curiosity questions, Learn to Write practice, and Memory Play games — appears here in chronological order so you can see their full learning journey at a glance.',
      },
      {
        q: 'Can I filter the Timeline?',
        a: 'Yes — use the date range and category filters at the top to focus on a specific type of activity or time period.',
      },
    ],
  },
  {
    emoji: '🔔',
    title: 'Notifications',
    items: [
      {
        q: 'What are the weekly notifications?',
        a: 'Every week Glumbi\'s AI reviews each child\'s activity and sends personalised updates to the parent: a Progress Report, Milestones reached, Story Recommendations, Learning Insights, and a summary of writing practice. These arrive as in-app notifications.',
      },
      {
        q: 'Where do I see notifications?',
        a: 'Tap the 🔔 bell icon in the header. A red badge shows how many unread notifications you have. Tap any notification to read the full detail.',
      },
    ],
  },
  {
    emoji: '🔐',
    title: 'Parental Lock',
    items: [
      {
        q: 'What is the Parental Lock?',
        a: 'Parental Lock lets you set a 4-digit PIN on a child\'s profile before handing the device over. Once locked, the child can only use that child\'s Glumbi features — they cannot go back to the child list, switch profiles, or access any parent settings. Your PIN is saved securely on our servers so it works across all your devices.',
      },
      {
        q: 'How do I set a lock?',
        a: 'First, set a 4-digit PIN on your child\'s profile — tap ✏️ Edit on the child list and fill in the Lock PIN field. Once set, tap the child\'s avatar to open the "Hand to child" panel, toggle AI on or off, choose a session time limit, set extensions, enter your PIN to confirm, and tap "Lock & hand to [name]" — the app enters locked mode immediately.',
      },
      {
        q: 'What happens when the time limit runs out?',
        a: 'A friendly screen tells the child their time is up. If you allowed extensions, they can request a little more time — otherwise the session ends and your PIN is required to continue. All content is saved automatically, nothing is lost.',
      },
      {
        q: 'How do I unlock the app?',
        a: 'Tap the 🔒 lock icon visible in the top corner of the child\'s screen at any time. Enter your 4-digit PIN and the app returns to the child list.',
      },
      {
        q: 'What if I forget my PIN?',
        a: 'Your PIN is saved on your account so it works on any device. If you\'ve forgotten it, go to ✏️ Edit on the child\'s profile and set a new PIN — it will replace the old one immediately. If the app is currently locked, you\'ll need to remember your PIN to unlock it first.',
      },
      {
        q: 'Can the child extend time on their own?',
        a: 'Yes — up to the number of extensions you set when locking. Once those are used, the session ends and your PIN is required. This gives children a little grace while keeping parents in control.',
      },
      {
        q: 'What if my child clears browser data?',
        a: 'Clearing browser data removes the login session entirely, so the app will ask for your email and password — which your child should not know. For complete protection we recommend pairing Glumbi\'s lock with your device\'s built-in parental controls: Screen Time on iPhone/iPad, Google Family Link on Android, or a managed browser profile on shared devices. Glumbi\'s lock is a convenience layer, not a replacement for device-level controls.',
      },
    ],
  },
  {
    emoji: '🔒',
    title: 'Safety & Privacy',
    items: [
      {
        q: 'Is the content safe for kids?',
        a: 'Yes. Every piece of AI-generated content passes a Safety Guard check before it is shown to your child. Anything flagged as inappropriate is discarded automatically.',
      },
      {
        q: 'Is my child\'s data private?',
        a: 'Journal entries are never sent to any AI. All other content is processed by Glumbi AI to generate responses but is not used for model training. Custom voice recordings are processed by a third-party voice synthesis service and stored securely — they are never shared or used for any other purpose. See our Privacy Policy for full details.',
      },
      {
        q: 'Can I delete my account and all data?',
        a: 'Yes — go to My Account → Account Settings → Delete Account. This permanently removes your account, all child profiles, all generated content, and all voice recordings. This action cannot be undone.',
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
    <div style={{ background: 'white', minHeight: '100vh', overflow: 'hidden', fontFamily: 'Nunito, sans-serif' }}>
      <div style={{ maxWidth: 520, margin: '24px auto', padding: '0 16px', boxSizing: 'border-box' }}>

        {/* Hero banner */}
        <div style={{
          background: 'linear-gradient(135deg,#f7971e,#ffd200)',
          borderRadius: 20, padding: '24px 24px 20px',
          marginBottom: 20, color: 'white', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -16, right: -10, fontSize: 90, opacity: 0.1, lineHeight: 1 }}>🌟</div>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🌟</div>
          <div style={{ fontWeight: 900, fontSize: 20, marginBottom: 4 }}>Help & FAQs</div>
          <div style={{ fontSize: 12, opacity: 0.85 }}>Everything you need to know about Glumbi</div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 24 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: '#ccc' }}>🔍</span>
          <input
            placeholder="Search questions…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '11px 16px 11px 40px', borderRadius: 50, border: '1.5px solid #eee', fontSize: 14, fontFamily: 'Nunito, sans-serif', outline: 'none', boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor = 'var(--primary)'}
            onBlur={e => e.target.style.borderColor = '#eee'}
          />
        </div>

        {/* Sections */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🤔</div>
            <div style={{ fontWeight: 700 }}>No results for "{search}"</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>Try different keywords or browse all sections below.</div>
            <button onClick={() => setSearch('')} style={{ marginTop: 16, background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 50, padding: '8px 20px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>
              Clear search
            </button>
          </div>
        ) : (
          filtered.map(s => <Section key={s.title} section={s} />)
        )}

        {/* Still need help */}
        <div style={{ background: 'var(--primary-lt)', borderRadius: 16, padding: 24, textAlign: 'center', marginTop: 8, marginBottom: 40 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>💬</div>
          <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--primary)', marginBottom: 6 }}>Still need help?</div>
          <div style={{ fontSize: 13, color: '#777', marginBottom: 14 }}>
            We're happy to help with anything not covered here.
          </div>
          <button onClick={() => navigate('/contact')}
            style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 50, padding: '10px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>
            Contact Us
          </button>
        </div>

      </div>
    </div>
  )
}
