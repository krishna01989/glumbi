import { useState, useRef, useEffect } from 'react'
import { learnApi } from '../../api/client'
import QuotaBanner from '../../components/QuotaBanner'
import ThemeLoader from '../../components/ThemeLoader'
import { useOffline } from '../../contexts/OfflineContext'
import { useTracker } from '../../contexts/ActivityTrackerContext'
import useFeatureDuration from '../../hooks/useFeatureDuration'
import FeatureBanner from '../../components/FeatureBanner'

// ── Tamil data ─────────────────────────────────────────────────────────────────

const TAMIL_VOWELS = [
  { char: 'அ', roman: 'a'  }, { char: 'ஆ', roman: 'aa' }, { char: 'இ', roman: 'i'  },
  { char: 'ஈ', roman: 'ii' }, { char: 'உ', roman: 'u'  }, { char: 'ஊ', roman: 'uu' },
  { char: 'எ', roman: 'e'  }, { char: 'ஏ', roman: 'ee' }, { char: 'ஐ', roman: 'ai' },
  { char: 'ஒ', roman: 'o'  }, { char: 'ஓ', roman: 'oo' }, { char: 'ஔ', roman: 'au' },
]

const TAMIL_CONSONANTS = [
  { char: 'க', roman: 'ka'  }, { char: 'ங', roman: 'nga' }, { char: 'ச', roman: 'sa'  },
  { char: 'ஞ', roman: 'nya' }, { char: 'ட', roman: 'ta'  }, { char: 'ண', roman: 'ṇa' },
  { char: 'த', roman: 'tha' }, { char: 'ந', roman: 'na'  }, { char: 'ப', roman: 'pa'  },
  { char: 'ம', roman: 'ma'  }, { char: 'ய', roman: 'ya'  }, { char: 'ர', roman: 'ra'  },
  { char: 'ல', roman: 'la'  }, { char: 'வ', roman: 'va'  }, { char: 'ழ', roman: 'zha' },
  { char: 'ள', roman: 'ḷa' }, { char: 'ற', roman: 'ṟa' }, { char: 'ன', roman: 'na'  },
]

// Vowel signs that combine with consonants to form compound chars
const VOWEL_SIGNS = ['', 'ா', 'ி', 'ீ', 'ு', 'ூ', 'ெ', 'ே', 'ை', 'ொ', 'ோ', 'ௌ']

// Build the 18×12 compound (உயிர்மெய்) table dynamically
const COMPOUND_TABLE = TAMIL_CONSONANTS.map(con => ({
  consonant: con,
  compounds: TAMIL_VOWELS.map((v, vi) => ({
    char:  con.char + VOWEL_SIGNS[vi],
    roman: con.roman.replace(/a$/, '') + v.roman,
  })),
}))

const AYTHAM = { char: 'ஃ', roman: 'aḵ' }

// ── Hindi data ─────────────────────────────────────────────────────────────────

const HINDI_VOWELS = [
  { char: 'अ', roman: 'a'  }, { char: 'आ', roman: 'aa' }, { char: 'इ', roman: 'i'  },
  { char: 'ई', roman: 'ii' }, { char: 'उ', roman: 'u'  }, { char: 'ऊ', roman: 'uu' },
  { char: 'ए', roman: 'e'  }, { char: 'ऐ', roman: 'ai' }, { char: 'ओ', roman: 'o'  },
  { char: 'औ', roman: 'au' }, { char: 'अं', roman: 'an' }, { char: 'अः', roman: 'ah' },
]

const HINDI_CONSONANTS = [
  { char: 'क', roman: 'ka'  }, { char: 'ख', roman: 'kha' }, { char: 'ग', roman: 'ga'  }, { char: 'घ', roman: 'gha' },
  { char: 'च', roman: 'cha' }, { char: 'छ', roman: 'chha'}, { char: 'ज', roman: 'ja'  }, { char: 'झ', roman: 'jha' },
  { char: 'ट', roman: 'ta'  }, { char: 'ठ', roman: 'tha' }, { char: 'ड', roman: 'da'  }, { char: 'ढ', roman: 'dha' },
  { char: 'त', roman: 'ta'  }, { char: 'थ', roman: 'tha' }, { char: 'द', roman: 'da'  }, { char: 'ध', roman: 'dha' },
  { char: 'न', roman: 'na'  }, { char: 'प', roman: 'pa'  }, { char: 'फ', roman: 'pha' }, { char: 'ब', roman: 'ba'  },
  { char: 'भ', roman: 'bha' }, { char: 'म', roman: 'ma'  }, { char: 'य', roman: 'ya'  }, { char: 'र', roman: 'ra'  },
  { char: 'ल', roman: 'la'  }, { char: 'व', roman: 'va'  }, { char: 'श', roman: 'sha' }, { char: 'ष', roman: 'sha' },
  { char: 'स', roman: 'sa'  }, { char: 'ह', roman: 'ha'  },
]

const HINDI_NUMBERS = ['१','२','३','४','५','६','७','८','९','१०'].map(c => ({ char: c }))

// Matra signs corresponding to each vowel ('' = inherent 'a', no matra needed)
const HINDI_MATRAS = ['', 'ा', 'ि', 'ी', 'ु', 'ू', 'े', 'ै', 'ो', 'ौ', 'ं', 'ः']

// Build 30×12 compound (barakhadi) table
const HINDI_COMPOUND_TABLE = HINDI_CONSONANTS.map(con => ({
  consonant: con,
  compounds: HINDI_VOWELS.map((v, vi) => ({
    char:  con.char + HINDI_MATRAS[vi],
    roman: con.roman.replace(/a$/, '') + v.roman,
  })),
}))

// ── English data ───────────────────────────────────────────────────────────────

const ENG_VOWELS        = 'AEIOU'.split('').map(c => ({ char: c }))
const ENG_CONSONANTS    = 'BCDFGHJKLMNPQRSTVWXYZ'.split('').map(c => ({ char: c }))
const ENG_VOWELS_LOWER  = 'aeiou'.split('').map(c => ({ char: c }))
const ENG_CONS_LOWER    = 'bcdfghjklmnpqrstvwxyz'.split('').map(c => ({ char: c }))
const ENG_NUMBERS       = ['1','2','3','4','5','6','7','8','9','10'].map(c => ({ char: c }))

// ── Stroke order data ─────────────────────────────────────────────────────────
// STROKE_POSITIONS: per-character stroke starting points as [xFrac, yFrac]
// fractions of the detected pixel bounding box (0=left/top, 1=right/bottom)
const STROKE_POSITIONS = {
  // ── English uppercase ──
  // Badges placed ALONG the stroke path so shared start-corners never overlap
  'A':[[.28,.55],[.72,.55],[.22,.55]],   // left-leg mid, right-leg mid, crossbar
  'B':[[.22,.25],[.60,.28],[.60,.68]],   // upper stem, upper bump mid, lower bump mid
  'C':[[.72,.15]],
  'D':[[.22,.25],[.62,.42]],             // upper stem, bump mid
  'E':[[.22,.35],[.50,.06],[.50,.52],[.50,.92]], // stem mid, top bar, mid bar, bottom bar
  'F':[[.22,.35],[.50,.06],[.50,.50]],   // stem mid, top bar, mid bar
  'G':[[.72,.15],[.60,.52]],
  'H':[[.22,.30],[.78,.30],[.50,.52]],
  'I':[[.50,.50]],
  'J':[[.62,.35],[.40,.85]],
  'K':[[.22,.35],[.70,.18],[.68,.68]],
  'L':[[.22,.35],[.58,.92]],
  'M':[[.15,.40],[.38,.42],[.62,.42],[.85,.40]],
  'N':[[.22,.35],[.50,.50],[.78,.35]],
  'O':[[.55,.06]],
  'P':[[.22,.35],[.60,.28]],
  'Q':[[.55,.06],[.68,.72]],
  'R':[[.22,.35],[.60,.28],[.68,.68]],
  'S':[[.70,.18],[.35,.80]],
  'T':[[.38,.06],[.50,.45]],             // top bar left-half, stem mid
  'U':[[.22,.42],[.50,.92],[.78,.42]],
  'V':[[.28,.42],[.72,.42]],
  'W':[[.15,.42],[.35,.80],[.50,.50],[.68,.80],[.85,.42]],
  'X':[[.25,.30],[.75,.30]],
  'Y':[[.25,.30],[.75,.30],[.50,.62]],
  'Z':[[.42,.06],[.75,.06],[.28,.92]],   // top bar mid, top bar end, bottom bar mid
  // ── English lowercase ──
  'a':[[.68,.35],[.75,.60]],             // circle mid, downstroke mid
  'b':[[.22,.30],[.60,.60]],             // stem mid, bump mid
  'c':[[.72,.30]],
  'd':[[.65,.35],[.78,.30]],             // circle mid, stem mid
  'e':[[.38,.52],[.65,.28]],
  'f':[[.58,.20],[.38,.52]],             // hook mid, crossbar
  'g':[[.65,.30],[.75,.72]],
  'h':[[.22,.30],[.65,.55],[.78,.42]],
  'i':[[.50,.52],[.50,.18]],             // body mid, dot
  'j':[[.55,.52],[.55,.18]],
  'k':[[.22,.30],[.70,.28],[.65,.62]],
  'l':[[.50,.40]],
  'm':[[.25,.52],[.50,.42],[.78,.52]],
  'n':[[.22,.52],[.65,.42]],
  'o':[[.55,.30]],
  'p':[[.22,.52],[.22,.75],[.60,.55]],   // upper stem, lower stem, bump
  'q':[[.62,.35],[.78,.52],[.78,.75]],
  'r':[[.22,.52],[.55,.42]],
  's':[[.65,.32],[.38,.72]],
  't':[[.50,.35],[.32,.50]],             // stem mid, crossbar
  'u':[[.25,.50],[.50,.68],[.75,.50]],
  'v':[[.28,.45],[.72,.45]],
  'w':[[.15,.45],[.35,.72],[.50,.52],[.68,.72],[.85,.45]],
  'x':[[.28,.38],[.72,.38]],
  'y':[[.28,.40],[.72,.40],[.50,.72]],
  'z':[[.38,.35],[.72,.35],[.28,.72]],
  // ── English numbers ──
  '1':[[.50,.05]],
  '2':[[.68,.08],[.20,.90]],
  '3':[[.65,.08],[.65,.54]],
  '4':[[.72,.05],[.72,.46],[.18,.48]],
  '5':[[.78,.05],[.22,.06],[.22,.55]],
  '6':[[.65,.08],[.50,.62]],
  '7':[[.18,.05],[.78,.05]],
  '8':[[.50,.05],[.50,.52]],
  '9':[[.50,.05],[.65,.60]],
  // ── Tamil vowels (உயிர்) ──
  'அ':[[.55,.12],[.62,.72]],
  'ஆ':[[.45,.12],[.52,.68],[.88,.15]],
  'இ':[[.40,.08],[.58,.70]],
  'ஈ':[[.35,.08],[.50,.58],[.72,.80]],
  'உ':[[.32,.18],[.65,.68]],
  'ஊ':[[.28,.14],[.55,.62],[.74,.80]],
  'எ':[[.68,.12]],
  'ஏ':[[.62,.10],[.88,.46]],
  'ஐ':[[.55,.08],[.35,.54],[.72,.78]],
  'ஒ':[[.62,.08],[.88,.44]],
  'ஓ':[[.55,.08],[.88,.38],[.88,.62]],
  'ஔ':[[.50,.08],[.88,.34],[.88,.58],[.65,.84]],
  // ── Tamil consonants (மெய்) ──
  'க':[[.62,.12],[.40,.55]],
  'ங':[[.55,.10],[.42,.70]],
  'ச':[[.70,.20],[.44,.70],[.72,.82]],
  'ஞ':[[.55,.08],[.72,.60]],
  'ட':[[.55,.12],[.62,.44],[.18,.54]],
  'ண':[[.58,.08],[.40,.70]],
  'த':[[.58,.10],[.18,.52]],
  'ந':[[.54,.08],[.40,.68]],
  'ப':[[.15,.14],[.42,.14],[.85,.14],[.42,.74]],
  'ம':[[.58,.12],[.28,.76]],
  'ய':[[.54,.08],[.62,.64]],
  'ர':[[.38,.22],[.55,.76]],
  'ல':[[.58,.10],[.35,.70]],
  'வ':[[.62,.18],[.54,.70]],
  'ழ':[[.55,.10],[.40,.70]],
  'ள':[[.58,.08],[.38,.70]],
  'ற':[[.55,.10],[.40,.64]],
  'ன':[[.55,.12]],
  'ஃ':[[.25,.46],[.50,.46],[.75,.46]],
  // ── Hindi vowels (स्वर) ──
  'अ':[[.22,.08],[.55,.08],[.50,.62]],
  'आ':[[.18,.08],[.50,.08],[.45,.62],[.82,.08]],
  'इ':[[.35,.08],[.65,.08],[.50,.70]],
  'ई':[[.28,.08],[.55,.08],[.50,.68],[.80,.08]],
  'उ':[[.42,.08],[.42,.62]],
  'ऊ':[[.38,.08],[.38,.58],[.62,.78]],
  'ए':[[.22,.08],[.78,.08],[.50,.55],[.22,.90]],
  'ऐ':[[.18,.08],[.50,.08],[.78,.08],[.50,.55],[.22,.90]],
  'ओ':[[.22,.08],[.78,.08],[.50,.55],[.22,.90],[.65,.72]],
  'औ':[[.18,.08],[.50,.08],[.78,.08],[.50,.55],[.22,.90],[.65,.72]],
  'अं':[[.22,.08],[.55,.08],[.50,.62],[.62,.12]],
  'अः':[[.22,.08],[.55,.08],[.50,.62],[.80,.28],[.80,.55]],
  // ── Hindi consonants (व्यंजन) ──
  'क':[[.28,.08],[.28,.55],[.15,.82]],
  'ख':[[.42,.08],[.42,.52],[.65,.08]],
  'ग':[[.62,.12],[.28,.55]],
  'घ':[[.55,.10],[.28,.50],[.65,.08]],
  'च':[[.60,.16],[.28,.55],[.65,.08]],
  'छ':[[.55,.12],[.65,.32],[.28,.58]],
  'ज':[[.72,.08],[.45,.40],[.28,.60],[.65,.08]],
  'झ':[[.65,.08],[.40,.35],[.65,.58]],
  'ट':[[.55,.15],[.28,.55],[.65,.08]],
  'ठ':[[.55,.12],[.65,.35],[.65,.08]],
  'ड':[[.55,.15],[.28,.55],[.65,.08]],
  'ढ':[[.55,.12],[.65,.35],[.65,.08]],
  'त':[[.55,.10],[.35,.45],[.65,.08]],
  'थ':[[.55,.08],[.38,.45],[.65,.65],[.65,.08]],
  'द':[[.72,.08],[.40,.40],[.40,.70]],
  'ध':[[.65,.08],[.35,.38],[.65,.55],[.35,.70]],
  'न':[[.28,.08],[.28,.55],[.65,.08],[.65,.55]],
  'प':[[.28,.08],[.28,.55],[.60,.35],[.65,.08]],
  'फ':[[.28,.08],[.28,.55],[.60,.35],[.85,.35],[.65,.08]],
  'ब':[[.28,.08],[.28,.55],[.55,.35],[.65,.08]],
  'भ':[[.28,.08],[.28,.52],[.55,.35],[.28,.72],[.65,.08]],
  'म':[[.28,.08],[.28,.55],[.55,.35],[.28,.72],[.55,.72],[.65,.08]],
  'य':[[.40,.12],[.28,.55],[.65,.08]],
  'र':[[.22,.08],[.65,.08]],
  'ल':[[.28,.08],[.28,.55],[.50,.70],[.65,.08]],
  'व':[[.38,.12],[.28,.55],[.65,.08]],
  'श':[[.55,.18],[.28,.55],[.65,.08]],
  'ष':[[.38,.12],[.28,.55],[.65,.08]],
  'स':[[.72,.08],[.42,.40],[.55,.62],[.65,.08]],
  'ह':[[.72,.08],[.42,.40],[.28,.55],[.28,.78],[.65,.08]],
}

// STROKE_ENDS: stroke end points [xFrac, yFrac] — shown as red stop dots
// Same index order as STROKE_POSITIONS. Characters without an entry use direction-offset estimate.
const STROKE_ENDS = {
  // ── English uppercase ──
  'A':[[.50,.96],[.50,.96],[.78,.54]],
  'B':[[.22,.92],[.22,.50],[.22,.92]],
  'C':[[.72,.85]],
  'D':[[.22,.92],[.22,.92]],
  'E':[[.22,.92],[.82,.06],[.75,.52],[.82,.92]],
  'F':[[.22,.92],[.82,.06],[.75,.50]],
  'G':[[.72,.85],[.52,.52]],
  'H':[[.22,.92],[.78,.92],[.78,.52]],
  'I':[[.50,.92]],
  'J':[[.38,.88],[.38,.88]],
  'K':[[.22,.92],[.82,.06],[.82,.92]],
  'L':[[.22,.92],[.82,.92]],
  'M':[[.15,.92],[.50,.60],[.50,.60],[.85,.92]],
  'N':[[.22,.92],[.78,.92],[.78,.06]],
  'O':[[.55,.06]],
  'P':[[.22,.92],[.22,.50]],
  'Q':[[.55,.06],[.82,.92]],
  'R':[[.22,.92],[.22,.50],[.82,.92]],
  'S':[[.35,.40],[.65,.80]],
  'T':[[.82,.06],[.50,.92]],
  'U':[[.50,.92],[.50,.92],[.78,.92]],
  'V':[[.50,.92],[.50,.92]],
  'W':[[.32,.92],[.50,.50],[.68,.92],[.85,.06],[.85,.06]],
  'X':[[.75,.92],[.25,.92]],
  'Y':[[.50,.52],[.50,.52],[.50,.92]],
  'Z':[[.82,.06],[.18,.92],[.82,.92]],
  // ── English lowercase ──
  'a':[[.68,.08],[.70,.92]],
  'b':[[.22,.92],[.22,.92]],
  'c':[[.72,.80]],
  'd':[[.62,.08],[.75,.92]],
  'e':[[.72,.52],[.22,.62]],
  'f':[[.55,.35],[.65,.52]],
  'g':[[.65,.08],[.75,.92]],
  'h':[[.22,.92],[.22,.92],[.78,.92]],
  'i':[[.50,.80],[.50,.18]],
  'j':[[.38,.88],[.55,.18]],
  'k':[[.22,.92],[.82,.45],[.82,.92]],
  'l':[[.50,.92]],
  'm':[[.25,.92],[.50,.92],[.78,.92]],
  'n':[[.22,.92],[.78,.92]],
  'o':[[.55,.30]],
  'p':[[.22,.92],[.22,.92],[.22,.92]],
  'q':[[.62,.08],[.78,.92],[.78,.92]],
  'r':[[.22,.92],[.62,.50]],
  's':[[.35,.50],[.65,.80]],
  't':[[.50,.88],[.65,.50]],
  'u':[[.50,.88],[.50,.88],[.78,.92]],
  'v':[[.50,.88],[.50,.88]],
  'w':[[.32,.88],[.50,.55],[.68,.88],[.85,.50],[.85,.50]],
  'x':[[.72,.88],[.28,.88]],
  'y':[[.50,.60],[.50,.60],[.50,.96]],
  'z':[[.72,.35],[.28,.72],[.72,.72]],
  // ── English numbers ──
  '1':[[.50,.92]],
  '2':[[.55,.38],[.80,.90]],
  '3':[[.35,.50],[.35,.90]],
  '4':[[.18,.48],[.72,.90],[.80,.48]],
  '5':[[.22,.06],[.22,.55],[.65,.82]],
  '6':[[.35,.15],[.50,.90]],
  '7':[[.82,.05],[.40,.90]],
  '8':[[.50,.52],[.50,.06]],
  '9':[[.50,.05],[.40,.92]],
}

// Approximate end offset by direction when STROKE_ENDS not defined
const DIR_END_OFFSET = {
  '↓':[0,.35],'↑':[0,-.35],'→':[.35,0],'←':[-.35,0],
  '↘':[.28,.28],'↙':[-.28,.28],'↗':[.28,-.28],'↖':[-.28,-.28],
  '↺':[-.08,.22],'↻':[.08,.22],'↩':[.22,.08],'↪':[-.22,.08],'•':[0,0],
}

// STROKE_HINTS: direction arrows for each stroke (same order as STROKE_POSITIONS)
const STROKE_HINTS = {
  // ── English uppercase ──
  'A':['↘','↙','→'], 'B':['↓','↩','↩'], 'C':['↺'], 'D':['↓','↩'],
  'E':['↓','→','→','→'], 'F':['↓','→','→'], 'G':['↺','→'], 'H':['↓','↓','→'],
  'I':['↓'], 'J':['↓','↩'], 'K':['↓','↗','↘'], 'L':['↓','→'],
  'M':['↓','↘','↗','↓'], 'N':['↓','↘','↑'], 'O':['↺'], 'P':['↓','↩'],
  'Q':['↺','↘'], 'R':['↓','↩','↘'], 'S':['↩','↪'], 'T':['→','↓'],
  'U':['↓','↩','↑'], 'V':['↘','↗'], 'W':['↘','↗','↘','↗'], 'X':['↘','↙'],
  'Y':['↘','↙','↓'], 'Z':['→','↘','→'],
  // ── English lowercase ──
  'a':['↺','↓'], 'b':['↓','↩'], 'c':['↺'], 'd':['↺','↓'], 'e':['→','↺'],
  'f':['↩','→'], 'g':['↺','↓'], 'h':['↓','↩','→'], 'i':['↓','•'], 'j':['↓','•'],
  'k':['↓','↗','↘'], 'l':['↓'], 'm':['↓','↩','↩'], 'n':['↓','↩'], 'o':['↺'],
  'p':['↓','↩'], 'q':['↺','↓'], 'r':['↓','↩'], 's':['↩','↪'], 't':['↓','→'],
  'u':['↓','↩','↑'], 'v':['↘','↗'], 'w':['↘','↗','↘','↗'], 'x':['↘','↙'],
  'y':['↘','↙↓'], 'z':['→','↘','→'],
  // ── English numbers ──
  '1':['↓'], '2':['↩','↘','→'], '3':['↩','↩'], '4':['↘','↓','→'],
  '5':['←','↓','↩'], '6':['↙','↺'], '7':['→','↘'], '8':['↻','↺'],
  '9':['↺','↓'], '10':['↓','↺'],
  // ── Tamil vowels (உயிர்) ──
  'அ':['↙','↺'], 'ஆ':['↙','↺','→'], 'இ':['↓','↩'],
  'ஈ':['↓','↩','↩'], 'உ':['↙','↩'], 'ஊ':['↙','↩','↩'],
  'எ':['↺'], 'ஏ':['↺','→'], 'ஐ':['↺','↩','↩'],
  'ஒ':['↺','→'], 'ஓ':['↺','→','→'], 'ஔ':['↺','→','↓'],
  // ── Tamil consonants (மெய்) ──
  'க':['↺','→'], 'ங':['↺','↓'], 'ச':['↩','↓','↩'],
  'ஞ':['↺','↻'], 'ட':['↻','•','→'], 'ண':['↺','↓'],
  'த':['↺','→'], 'ந':['↺','↓'], 'ப':['→','↓','←','↩'],
  'ம':['↺','↙'], 'ய':['↺','↺'], 'ர':['↙','↩'],
  'ல':['↺','↓'], 'வ':['↩','↩'], 'ழ':['↺','↓'],
  'ள':['↺','↓'], 'ற':['↻','↓'], 'ன':['↺'],
  'ஃ':['•','•','•'],
  // ── Hindi vowels (स्वर) ──
  'अ':['→','↙','↓'], 'आ':['→','↙','↓','↓'], 'इ':['↓','→','↓'],
  'ई':['↓','→','↓','→'], 'उ':['↓','↩'], 'ऊ':['↓','↩','↩'],
  'ए':['→','↙','↓','→'], 'ऐ':['→','→','↙','↓','→'], 'ओ':['→','↙','↓','↩'],
  'औ':['→','↙','↓','↩','↩'], 'अं':['→','↙','↓','•'], 'अः':['→','↙','↓','•','•'],
  // ── Hindi consonants (व्यंजन) ──
  'क':['↙','↓','→'], 'ख':['↓','→','↓','→'], 'ग':['↩','→'], 'घ':['↩','↓','→'],
  'च':['↩','↓','→'], 'छ':['↩','↩','→'], 'ज':['→','↙','↓','→'], 'झ':['→','↙','↗','→'],
  'ट':['↻','↓','→'], 'ठ':['↻','↗','→'], 'ड':['↻','↓','→'], 'ढ':['↻','↗','→'],
  'त':['→','↙','→'], 'थ':['→','↙','↗','→'], 'द':['→','↙','↓'], 'ध':['→','↙','↗','↓','→'],
  'न':['↓','→','↓','→'], 'प':['↓','↩','→'], 'फ':['↓','↩','→','→'], 'ब':['↓','↩','→'],
  'भ':['↓','↩','↓','→'], 'म':['↓','↩','↓','→'], 'य':['↙','↓','→'], 'र':['→','↘'],
  'ल':['↓','↩','→'], 'व':['↙','↓','→'], 'श':['↩','↓','→'], 'ष':['↙','↓','→'],
  'स':['→','↙','↩','→'], 'ह':['→','↙','↓','→'],
}

// ── English per-stroke SVG paths (normalized 0-100 coordinate space) ──────────
// Each character maps to an array of path strings, one per stroke.
// Scale to pixel space using: px = x0 + (n/100)*lw, py = y0 + (n/100)*lh
const ENG_STROKE_PATHS = {
  // Uppercase
  'A':['M50,2 L12,96','M50,2 L88,96','M18,55 L82,55'],
  'B':['M22,4 L22,92','M22,4 Q78,4 78,26 Q78,48 22,48','M22,48 Q82,48 82,70 Q82,92 22,92'],
  'C':['M82,18 Q82,4 52,4 Q15,4 15,50 Q15,96 52,96 Q82,96 82,80'],
  'D':['M22,4 L22,92','M22,4 Q88,4 88,50 Q88,96 22,96'],
  'E':['M22,4 L22,92','M22,4 L82,4','M22,50 L70,50','M22,92 L82,92'],
  'F':['M22,4 L22,92','M22,4 L82,4','M22,50 L70,50'],
  'G':['M82,18 Q82,4 50,4 Q14,4 14,50 Q14,96 50,96 Q82,96 82,80','M82,55 L55,55'],
  'H':['M22,4 L22,92','M78,4 L78,92','M22,50 L78,50'],
  'I':['M50,4 L50,92'],
  'J':['M62,4 L62,72','M62,72 Q62,95 40,95 Q18,95 18,78'],
  'K':['M22,4 L22,92','M78,8 L22,50','M22,50 L78,92'],
  'L':['M22,4 L22,92','M22,92 L82,92'],
  'M':['M12,4 L12,92','M12,4 L50,55','M88,4 L50,55','M88,4 L88,92'],
  'N':['M15,4 L15,92','M15,4 L85,92','M85,4 L85,92'],
  'O':['M50,4 Q88,4 88,50 Q88,96 50,96 Q12,96 12,50 Q12,4 50,4'],
  'P':['M22,4 L22,92','M22,4 Q78,4 78,26 Q78,48 22,48'],
  'Q':['M50,4 Q88,4 88,50 Q88,96 50,96 Q12,96 12,50 Q12,4 50,4','M58,68 L82,92'],
  'R':['M22,4 L22,92','M22,4 Q78,4 78,26 Q78,48 22,48','M45,48 L82,92'],
  'S':['M78,16 Q78,4 52,4 Q22,4 22,28 Q22,50 50,50','M50,50 Q78,50 78,72 Q78,96 45,96 Q18,96 18,84'],
  'T':['M10,4 L90,4','M50,4 L50,92'],
  'U':['M22,4 L22,70','M22,70 Q22,94 50,94 Q78,94 78,70','M78,70 L78,4'],
  'V':['M15,4 L50,92','M85,4 L50,92'],
  'W':['M10,4 L30,92','M30,92 L50,45','M50,45 L70,92','M70,92 L90,4'],
  'X':['M12,4 L88,92','M88,4 L12,92'],
  'Y':['M12,4 L50,52','M88,4 L50,52','M50,52 L50,92'],
  'Z':['M12,4 L88,4','M88,4 L12,92','M12,92 L88,92'],
  // Lowercase
  'a':['M68,32 Q68,8 48,8 Q22,8 22,38 Q22,65 48,65 Q68,65 68,38','M68,8 L68,90'],
  'b':['M22,4 L22,92','M22,55 Q22,32 45,32 Q72,32 72,60 Q72,88 45,88 Q22,88 22,70'],
  'c':['M75,20 Q75,6 52,6 Q22,6 22,48 Q22,88 52,88 Q75,88 75,78'],
  'd':['M72,32 Q72,10 50,10 Q25,10 25,38 Q25,65 50,65 Q72,65 72,38','M72,10 L72,90'],
  'e':['M22,45 L72,45','M72,45 Q72,15 48,15 Q18,15 18,48 Q18,80 48,88 Q68,92 75,80'],
  'f':['M65,10 Q65,4 52,4 Q30,4 30,22 L30,90','M12,40 L62,40'],
  'g':['M70,32 Q70,10 48,10 Q22,10 22,36 Q22,62 48,62 Q70,62 70,38','M70,10 L70,72 Q70,95 45,95 Q22,95 22,80'],
  'h':['M22,4 L22,90','M22,48 Q22,30 42,30 Q65,30 65,48 L65,90'],
  'i':['M50,30 L50,90','M50,10 L50,18'],
  'j':['M55,30 L55,72 Q55,94 38,94 Q20,94 20,80','M55,10 L55,18'],
  'k':['M22,4 L22,90','M72,28 L22,55','M42,60 L75,90'],
  'l':['M48,4 L48,90'],
  'm':['M15,32 L15,90','M15,32 Q15,15 33,15 Q52,15 52,32 L52,90','M52,32 Q52,15 68,15 Q85,15 85,32 L85,90'],
  'n':['M20,32 L20,90','M20,32 Q20,15 42,15 Q65,15 65,32 L65,90'],
  'o':['M50,8 Q80,8 80,50 Q80,90 50,90 Q18,90 18,50 Q18,8 50,8'],
  'p':['M20,32 L20,96','M20,32 Q20,10 45,10 Q72,10 72,38 Q72,65 45,65 Q20,65 20,50'],
  'q':['M72,35 Q72,10 48,10 Q22,10 22,38 Q22,65 48,65 Q72,65 72,40','M72,10 L72,96'],
  'r':['M20,32 L20,90','M20,38 Q22,18 40,18 Q58,18 62,30'],
  's':['M72,22 Q72,8 50,8 Q22,8 22,32 Q22,50 50,50','M50,50 Q78,50 78,72 Q78,90 50,90 Q25,90 22,78'],
  't':['M50,8 L50,88 Q50,95 62,95','M18,40 L72,40'],
  'u':['M20,30 L20,68','M20,68 Q20,90 50,90 Q80,90 80,68','M80,68 L80,30'],
  'v':['M15,30 L50,90','M85,30 L50,90'],
  'w':['M8,30 L28,90','M28,90 L50,50','M50,50 L72,90','M72,90 L92,30'],
  'x':['M15,30 L85,90','M85,30 L15,90'],
  'y':['M15,30 L50,62','M85,30 L50,62 Q42,75 30,96'],
  'z':['M12,30 L82,30','M82,30 L18,90','M18,90 L82,90'],
  // Numbers
  '1':['M38,15 Q44,8 50,6 L50,92'],
  '2':['M22,22 Q22,5 50,5 Q78,5 78,28 Q78,46 22,72','M22,72 L80,72'],
  '3':['M18,14 Q18,4 50,4 Q80,4 80,28 Q80,50 50,50','M50,50 Q80,50 80,74 Q80,96 50,96 Q18,96 18,86'],
  '4':['M68,4 L20,60','M68,4 L68,92','M10,60 L82,60'],
  '5':['M78,5 L18,5','M18,5 L18,52','M18,52 Q18,95 52,95 Q88,95 88,70 Q88,52 52,52'],
  '6':['M75,5 Q42,5 22,42','M22,58 Q22,96 52,96 Q82,96 82,68 Q82,42 52,42 Q22,42 22,60'],
  '7':['M12,5 L88,5','M88,5 L35,92'],
  '8':['M50,50 Q82,50 82,28 Q82,4 50,4 Q18,4 18,28 Q18,50 50,50','M50,50 Q82,50 82,74 Q82,96 50,96 Q18,96 18,74 Q18,50 50,50'],
  '9':['M50,6 Q80,6 80,32 Q80,58 50,58 Q20,58 20,32 Q20,6 50,6','M80,32 L80,94'],
}

// Scale a path from 0-100 normalized space to actual pixel coordinates
function scalePath(pathStr, x0, y0, lw, lh) {
  return pathStr.replace(/(-?\d+\.?\d*),(-?\d+\.?\d*)/g, (_, px, py) =>
    `${(x0 + parseFloat(px) / 100 * lw).toFixed(1)},${(y0 + parseFloat(py) / 100 * lh).toFixed(1)}`
  )
}

// Extract start [x,y] and end [x,y] from a scaled path string
function pathEndpoints(pathStr) {
  const pairs = [...pathStr.matchAll(/(-?\d+\.?\d*),(-?\d+\.?\d*)/g)]
  const s = pairs[0], e = pairs[pairs.length - 1]
  return {
    sx: parseFloat(s[1]), sy: parseFloat(s[2]),
    ex: parseFloat(e[1]), ey: parseFloat(e[2]),
  }
}

// ── Canvas component ───────────────────────────────────────────────────────────

function DrawCanvas({ onSubmit, onPractice, loading, disabled = false, height = 260, fullWidth = false, traceChar = null, traceFontFamily = 'Nunito, sans-serif' }) {
  const canvasRef = useRef(null)
  const drawing   = useRef(false)

  // Clear canvas whenever the letter changes
  useEffect(() => {
    const c = canvasRef.current
    if (c) c.getContext('2d').clearRect(0, 0, c.width, c.height)
  }, [traceChar])

  // Attach touch listeners as non-passive so preventDefault() works on mobile
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const onTouchStart = e => start(e)
    const onTouchMove  = e => move(e)
    canvas.addEventListener('touchstart', onTouchStart, { passive: false })
    canvas.addEventListener('touchmove',  onTouchMove,  { passive: false })
    return () => {
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove',  onTouchMove)
    }
  })

  // Internal canvas resolution — large so AI gets a crisp image
  const canvasW = fullWidth ? 800 : 300
  const canvasH = fullWidth ? 600 : height

  function getPos(e, canvas) {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const src = e.touches ? e.touches[0] : e
    return { x: (src.clientX - rect.left) * scaleX, y: (src.clientY - rect.top) * scaleY }
  }

  function start(e) {
    e.preventDefault()
    drawing.current = true
    const ctx = canvasRef.current.getContext('2d')
    const pos = getPos(e, canvasRef.current)
    ctx.beginPath(); ctx.moveTo(pos.x, pos.y)
  }
  function move(e) {
    e.preventDefault()
    if (!drawing.current) return
    const ctx = canvasRef.current.getContext('2d')
    const pos = getPos(e, canvasRef.current)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = fullWidth ? 10 : 6   // thicker strokes on large canvas
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    ctx.stroke()
  }
  function stop() { drawing.current = false }

  function clear() {
    const c = canvasRef.current
    c.getContext('2d').clearRect(0, 0, c.width, c.height)
  }

  function getImageData() {
    const c = canvasRef.current
    const ctx = c.getContext('2d')
    const pixels = ctx.getImageData(0, 0, c.width, c.height).data
    let minX = c.width, minY = c.height, maxX = 0, maxY = 0
    for (let y = 0; y < c.height; y++) {
      for (let x = 0; x < c.width; x++) {
        const alpha = pixels[(y * c.width + x) * 4 + 3]
        if (alpha > 20) {
          if (x < minX) minX = x; if (x > maxX) maxX = x
          if (y < minY) minY = y; if (y > maxY) maxY = y
        }
      }
    }
    if (maxX > minX && maxY > minY) {
      const pad = 24
      const x = Math.max(0, minX - pad), y = Math.max(0, minY - pad)
      const w = Math.min(c.width, maxX + pad) - x
      const h = Math.min(c.height, maxY + pad) - y
      const crop = document.createElement('canvas')
      crop.width = w; crop.height = h
      const cCtx = crop.getContext('2d')
      cCtx.fillStyle = '#ffffff'
      cCtx.fillRect(0, 0, w, h)
      cCtx.drawImage(c, x, y, w, h, 0, 0, w, h)
      return crop.toDataURL('image/png').split(',')[1]
    }
    return c.toDataURL('image/png').split(',')[1]
  }

  function submit() { onSubmit(getImageData()) }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: fullWidth ? '100%' : 'auto' }}>
      <div style={{ position: 'relative', width: fullWidth ? '100%' : canvasW, background: '#ffffff', borderRadius: 16 }}>
        {/* Tracing guide: thick outline + dotted inner line */}
        {traceChar && (
          <svg
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}
            viewBox={`0 0 ${canvasW} ${canvasH}`}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Layer 1: faint silhouette — low opacity so it guides without overpowering */}
            <text x={canvasW/2} y={canvasH/2} textAnchor="middle" dominantBaseline="middle"
              fontFamily={traceFontFamily} fontSize={fullWidth ? 320 : 160}
              fill="rgba(255,107,107,0.07)"
              stroke="rgba(255,107,107,0.07)"
              strokeWidth={fullWidth ? 14 : 8}
              strokeLinejoin="round" strokeLinecap="round">
              {traceChar}
            </text>
            {/* Layer 2: dotted tracing line — the actual path to follow */}
            <text x={canvasW/2} y={canvasH/2} textAnchor="middle" dominantBaseline="middle"
              fontFamily={traceFontFamily} fontSize={fullWidth ? 320 : 160}
              fill="none"
              stroke="rgba(255,107,107,0.70)"
              strokeWidth={fullWidth ? 2.5 : 1.8}
              strokeDasharray={fullWidth ? '14 10' : '8 6'}
              strokeLinecap="round">
              {traceChar}
            </text>
          </svg>
        )}
        <canvas ref={canvasRef} width={canvasW} height={canvasH}
          style={{ border: '2.5px solid var(--primary)', borderRadius: 16, background: 'transparent', touchAction: 'none', cursor: 'crosshair', width: fullWidth ? '100%' : canvasW, height: fullWidth ? 'auto' : canvasH, display: 'block', position: 'relative', zIndex: 2 }}
          onMouseDown={start} onMouseMove={move} onMouseUp={stop} onMouseLeave={stop}
          onTouchEnd={stop} />
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={clear} style={btn('#f5f5f5','#555')}>🗑️ Clear</button>
        {onPractice && (
          <button onClick={() => onPractice(getImageData())} disabled={loading}
            style={btn('var(--primary-lt)','var(--primary)')}>
            ✏️ Practice
          </button>
        )}
        <button onClick={submit} disabled={loading || disabled}
          style={btn(disabled ? '#e0e0e0' : 'linear-gradient(135deg,var(--primary),var(--accent))', disabled ? '#aaa' : 'white')}>
          {loading ? <><span className="spinner" style={{ width:14,height:14,borderWidth:2 }}/>&nbsp;Checking…</> : '✨ Check with AI'}
        </button>
      </div>
    </div>
  )
}

function btn(bg, color) {
  return { padding:'9px 20px', borderRadius:50, border:'none', background:bg, color, fontWeight:800, fontSize:14, cursor:'pointer', fontFamily:'Nunito,sans-serif', display:'flex', alignItems:'center', gap:6 }
}

// ── Shared letter grid ─────────────────────────────────────────────────────────

function LetterGrid({ letters, selected, onSelect, script, pulli, engFontFamily }) {
  const isScript = script === 'tamil' || script === 'hindi'
  const fontFamily = script === 'tamil' ? '"Noto Sans Tamil",serif'
                   : script === 'hindi' ? '"Noto Sans Devanagari",serif'
                   : (engFontFamily || 'Nunito,sans-serif')
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
      {letters.map(item => (
        <button key={item.char} onClick={() => onSelect(item)}
          style={{
            width: isScript ? 60 : 52, height: isScript ? 60 : 52,
            borderRadius:12, border:'none', cursor:'pointer',
            fontFamily,
            fontSize: 22, fontWeight: isScript ? 400 : 700,
            background: (selected?.char === item.char || (pulli && selected?.char === item.char + pulli)) ? 'var(--primary)' : 'var(--primary-lt)',
            color: (selected?.char === item.char || (pulli && selected?.char === item.char + pulli)) ? 'white' : 'var(--primary)',
            boxShadow: (selected?.char === item.char || (pulli && selected?.char === item.char + pulli)) ? '0 4px 14px rgba(0,0,0,0.15)' : '0 2px 6px rgba(0,0,0,0.06)',
            transition:'all 0.15s',
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:1,
          }}>
          <span>{pulli ? item.char + pulli : item.char}</span>
          {item.roman && <span style={{ fontSize:8, fontFamily:'Nunito,sans-serif', fontWeight:700, opacity:0.75 }}>{pulli ? item.roman.replace(/a$/, '') : item.roman}</span>}
        </button>
      ))}
    </div>
  )
}

// ── Compound table ─────────────────────────────────────────────────────────────

function CompoundTable({ selected, onSelect, isMobile }) {
  const cellH = isMobile ? 38 : 52
  const fs = isMobile ? 13 : 17
  const hfs = isMobile ? 12 : 16
  const colW = isMobile ? 34 : undefined
  return (
    <div style={{ overflowX:'auto' }}>
      <table style={{ borderCollapse:'collapse', fontFamily:'"Noto Sans Tamil",serif', ...(isMobile ? { minWidth: 13 * 34 } : { width:'100%', tableLayout:'fixed' }) }}>
        <thead>
          <tr>
            <th style={th()}></th>
            {TAMIL_VOWELS.map(v => (
              <th key={v.char} style={{ ...th(), color:'var(--primary)', fontSize:hfs }}>{v.char}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {COMPOUND_TABLE.map(row => (
            <tr key={row.consonant.char}>
              <td style={{ ...th(), color:'var(--primary)', fontSize:hfs }}>{row.consonant.char + '்'}</td>
              {row.compounds.map(cell => (
                <td key={cell.char} style={{ padding:0 }}>
                  <button onClick={() => onSelect(cell)}
                    style={{
                      width:'100%', height:cellH, border:'none', borderRadius:8, cursor:'pointer',
                      fontFamily:'"Noto Sans Tamil",serif', fontSize:fs, fontWeight:400,
                      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:1,
                      background: selected?.char === cell.char ? 'var(--primary)' : 'transparent',
                      color: selected?.char === cell.char ? 'white' : '#444',
                      transition:'all 0.12s',
                    }}>
                    <span>{cell.char}</span>
                    {!isMobile && <span style={{ fontSize:7, fontFamily:'Nunito,sans-serif', fontWeight:700, opacity:0.7, lineHeight:1 }}>{cell.roman}</span>}
                  </button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function th() { return { padding:'4px 6px', textAlign:'center', fontSize:14, fontWeight:400, color:'#aaa' } }

// ── Hindi barakhadi table ──────────────────────────────────────────────────────

function HindiCompoundTable({ selected, onSelect, isMobile }) {
  const cellH = isMobile ? 38 : 52
  const fs = isMobile ? 13 : 17
  const hfs = isMobile ? 12 : 16
  return (
    <div style={{ overflowX:'auto' }}>
      <table style={{ borderCollapse:'collapse', fontFamily:'"Noto Sans Devanagari",serif', ...(isMobile ? { minWidth: 13 * 34 } : { width:'100%', tableLayout:'fixed' }) }}>
        <thead>
          <tr>
            <th style={th()}></th>
            {HINDI_VOWELS.map(v => (
              <th key={v.char} style={{ ...th(), color:'var(--primary)', fontSize:hfs }}>{v.char}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {HINDI_COMPOUND_TABLE.map(row => (
            <tr key={row.consonant.char}>
              <td style={{ ...th(), color:'var(--primary)', fontSize:hfs }}>{row.consonant.char + '्'}</td>
              {row.compounds.map(cell => (
                <td key={cell.char} style={{ padding:0 }}>
                  <button onClick={() => onSelect(cell)}
                    style={{
                      width:'100%', height:cellH, border:'none', borderRadius:8, cursor:'pointer',
                      fontFamily:'"Noto Sans Devanagari",serif', fontSize:fs, fontWeight:400,
                      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:1,
                      background: selected?.char === cell.char ? 'var(--primary)' : 'transparent',
                      color: selected?.char === cell.char ? 'white' : '#444',
                      transition:'all 0.12s',
                    }}>
                    <span>{cell.char}</span>
                    {!isMobile && <span style={{ fontSize:7, fontFamily:'Nunito,sans-serif', fontWeight:700, opacity:0.7, lineHeight:1 }}>{cell.roman}</span>}
                  </button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Letter practice panel ──────────────────────────────────────────────────────

const PRACTICE_MSGS = [
  { emoji:'⭐', msg:"Great practice! Keep going — repetition builds memory!" },
  { emoji:'💪', msg:"Nice effort! Draw it a few more times to make it stick." },
  { emoji:'🖊️', msg:"Good job! Try to match the traced letter as closely as you can." },
  { emoji:'🌟', msg:"You're practicing so well! Every stroke counts." },
  { emoji:'🎯', msg:"Awesome! Try it one more time without looking at the trace." },
]

function LetterPanel({ selected, script, child, onPlay, quota, engFontFamily }) {
  const { track } = useTracker()
  const offline = useOffline()
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [viewport, setViewport] = useState({ vw: window.innerWidth, vh: window.innerHeight })
  const fsRef = useRef(null)

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  useEffect(() => {
    const update = () => setViewport({ vw: window.innerWidth, vh: window.innerHeight })
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', () => setTimeout(update, 100))
    return () => { window.removeEventListener('resize', update); window.removeEventListener('orientationchange', update) }
  }, [])

  function toggleFullscreen() {
    if (!document.fullscreenElement) fsRef.current?.requestFullscreen()
    else document.exitFullscreen()
  }

  useEffect(() => { setFeedback(null) }, [selected])

  function handlePractice() {
    const msg = PRACTICE_MSGS[Math.floor(Math.random() * PRACTICE_MSGS.length)]
    setFeedback({ type: 'practice', emoji: msg.emoji, text: msg.msg })
    track('learn', 'practice', { metadata: { script, letter: selected?.char } })
  }

  async function handleAiCheck(imageData) {
    setLoading(true); setFeedback(null)
    track('learn', 'trace', { metadata: { script } })
    try {
      const age = child?.birthYear ? new Date().getFullYear() - child.birthYear : 5
      const result = await learnApi.validate(imageData, selected.char, script, child?.name || 'you', age, child?.id)
      track('learn', 'ai_validate', { metadata: { script, letter: selected?.char, correct: result.correct } })
      setFeedback({ type: 'ai', correct: result.correct, text: result.feedback, emoji: result.correct ? '🎉' : '💪' })
      window.__glumbiRefreshQuota?.()
    } catch { setFeedback({ type: 'ai', correct: true, text: 'Great effort! Keep practising! 🌟', emoji: '🌟' }) }
    finally { setLoading(false) }
  }

  if (!selected) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 20px', color:'#ccc', textAlign:'center' }}>
      <div style={{ fontSize:48, marginBottom:10 }}>👆</div>
      <div style={{ fontSize:14, fontWeight:700 }}>Tap a letter to start!</div>
    </div>
  )

  const letterFont = script==='tamil' ? '"Noto Sans Tamil",serif' : script==='hindi' ? '"Noto Sans Devanagari",serif' : (engFontFamily || 'Nunito, sans-serif')
  const isLandscape = isFullscreen && viewport.vw > viewport.vh

  const fsContainerStyle = isFullscreen ? {
    background: '#fff9f0',
    display: 'flex',
    flexDirection: 'column',
    height: '100dvh', width: '100dvw',
    overflowY: 'auto', overflowX: 'hidden',
    boxSizing: 'border-box',
  } : { display:'flex', flexDirection:'column', alignItems:'center', gap:14, position:'relative' }

  const fsToggleBtn = (
    <button onClick={toggleFullscreen}
      title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen practice'}
      style={{ width:32, height:32, minWidth:32, borderRadius:8, border:'1.5px solid var(--primary-lt)', background:'var(--primary-lt)', color:'var(--primary)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', padding:0, flexShrink:0, transition:'all 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.background='var(--primary)'; e.currentTarget.style.color='white' }}
      onMouseLeave={e => { e.currentTarget.style.background='var(--primary-lt)'; e.currentTarget.style.color='var(--primary)' }}>
      {isFullscreen ? (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2v4H2M10 2v4h4M6 14v-4H2M10 14v-4h4"/>
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4"/>
        </svg>
      )}
    </button>
  )

  return (
    <div ref={fsRef} style={fsContainerStyle}>

      {/* TOP BAR — in-flow row, always visible, reserves space so content starts below */}
      {isFullscreen ? (
        <div style={{ display:'flex', justifyContent:'flex-end', alignItems:'center', padding:'8px 12px', flexShrink:0, width:'100%', boxSizing:'border-box' }}>
          {fsToggleBtn}
        </div>
      ) : (
        <div style={{ position:'absolute', top:12, right:12, zIndex:10 }}>{fsToggleBtn}</div>
      )}

      {/* CONTENT AREA — scrollable, centered */}
      <div style={isFullscreen ? {
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: isLandscape ? 'row' : 'column',
        alignItems: isLandscape ? 'flex-start' : 'center',
        justifyContent: 'center',
        gap: isLandscape ? 24 : 16,
        padding: isLandscape ? '8px 20px 16px' : '8px 16px 16px',
        boxSizing: 'border-box',
        width: '100%',
      } : { display:'contents' }}>

      {/* Letter side */}
      <div style={{ textAlign:'center', flexShrink: 0, width: isLandscape ? 160 : undefined }}>
        <div style={{ fontSize: isLandscape ? 72 : isFullscreen ? 100 : 80, fontFamily: letterFont, fontWeight: (script==='tamil'||script==='hindi') ? 400 : 700, color:'var(--primary)', lineHeight:1.2, paddingTop: isFullscreen ? 0 : 8, textShadow:'0 4px 16px rgba(0,0,0,0.1)' }}>
          {selected.char}
        </div>
        {selected.roman && !isLandscape && <div style={{ fontSize:13, color:'#aaa', fontWeight:700, marginTop:4 }}>
          pronounced: <span style={{ color:'var(--primary)' }}>{selected.roman}</span>
        </div>}
        {selected.roman && isLandscape && <div style={{ fontSize:11, color:'#aaa', fontWeight:700, marginTop:2 }}>
          {selected.roman}
        </div>}
        <button onClick={onPlay} style={{ marginTop:8, background:'var(--primary-lt)', border:'none', borderRadius:50, padding:'6px 14px', fontSize:12, fontWeight:700, color:'var(--primary)', cursor:'pointer' }}>
          🔊 Hear it
        </button>
      </div>

      {/* Canvas + feedback side */}
      {/* In fullscreen, constrain canvas width so it fits the viewport height — canvas is 4:3 (800×600) */}
      {(() => {
        const { vw, vh } = viewport
        const topBarH = 48  // height of the top bar we just added
        const canvasMaxW = isFullscreen
          ? isLandscape
            ? Math.min(vw - 220, Math.floor((vh - topBarH - 80) * (800 / 600)))
            : Math.min(vw - 32,  Math.floor((vh - topBarH - 120) * (800 / 600)))
          : undefined
        return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap: isLandscape ? 8 : 14, flex: isFullscreen ? 1 : undefined, width: isFullscreen ? undefined : '100%', maxWidth: isFullscreen ? canvasMaxW : undefined, alignSelf: 'flex-start', overflow:'visible' }}>
        <DrawCanvas
          onSubmit={handleAiCheck}
          onPractice={handlePractice}
          loading={loading}
          disabled={quota?.used >= quota?.limit || offline}
          fullWidth
          traceChar={selected.char}
          traceFontFamily={letterFont}
        />

        {/* Practice vs AI hint */}
        {!feedback && !loading && (
          <div style={{ fontSize:11, color:'#bbb', textAlign:'center', maxWidth:320, lineHeight:1.6 }}>
            <strong style={{ color:'var(--primary)' }}>✏️ Practice</strong> is free — get a quick encouragement.{!isLandscape && <><br/></>}
            {' '}<strong style={{ color:'var(--primary)' }}>✨ Check with AI</strong> uses a credit for detailed feedback.
          </div>
        )}

        {offline && <div style={{ textAlign:'center', fontSize:13, fontWeight:700, color:'#aaa' }}>✈️ Practice mode — AI check is off</div>}
        {loading && <ThemeLoader theme={child?.theme} />}
        {!loading && feedback && (
          <div style={{ maxWidth:320, padding:'12px 16px', borderRadius:14, textAlign:'center', width:'100%', boxSizing:'border-box',
            background: feedback.type === 'practice' ? '#f0f7ff' : feedback.correct ? '#f0fff4' : '#fff8f0',
            border: `1.5px solid ${feedback.type === 'practice' ? '#90caf9' : feedback.correct ? '#6bcb77' : '#ffc0a0'}`,
            fontSize:14, lineHeight:1.6, fontWeight:600,
            color: feedback.type === 'practice' ? '#1565c0' : feedback.correct ? '#1e6b3c' : '#c05a00' }}>
            <div style={{ fontSize:26, marginBottom:6 }}>{feedback.emoji}</div>
            {feedback.text}
            {feedback.type === 'practice' && (
              <div style={{ fontSize:11, color:'#90caf9', marginTop:6, fontWeight:600 }}>
                Free practice • Use <strong>Check with AI</strong> for real feedback
              </div>
            )}
          </div>
        )}
      </div>
        )
      })()}

      </div>{/* end content area */}
    </div>
  )
}

// ── Word mode ──────────────────────────────────────────────────────────────────

const ALL_TRANS_LANGS = [
  { key:'english', label:'English', flag:'🇬🇧', tts:'english' },
  { key:'tamil',   label:'Tamil',   flag:'🌺',  tts:'tamil'   },
  { key:'hindi',   label:'हिंदी',  flag:'🇮🇳', tts:'hindi'   },
  { key:'french',  label:'French',  flag:'🇫🇷', tts:'english' },
]

const WORD_POOL = {
  tamil: [
    'வீடு','பூ','நாய்','மரம்','பால்','கண்','கை','அம்மா','அப்பா','பறவை',
    'மீன்','நிலா','நீர்','காடு','பழம்','பயிர்','கோழி','யானை','புலி','மான்',
    'வானம்','மேகம்','மழை','நதி','மலை','கல்','நெல்','வாழை','மாமரம்','ஆறு',
  ],
  english: [
    'cat','dog','home','tree','sun','book','fish','bird','moon','star',
    'rain','lake','frog','duck','rose','leaf','boat','kite','bell','gate',
    'lamp','sand','rock','wave','nest','seed','road','hand','foot','drum',
  ],
  hindi: [
    'घर','फूल','कुत्ता','पेड़','दूध','आंख','हाथ','माँ','पापा','पक्षी',
    'मछली','चाँद','पानी','जंगल','फल','मुर्गी','हाथी','बाघ','हिरण','आकाश',
    'बादल','बारिश','नदी','पहाड़','पत्थर','केला','आम','सूरज','तारा','नाव',
  ],
}

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }
const BANK_SIZE = 10

function WordMode({ script, child, quota }) {
  const { track } = useTracker()
  const offline = useOffline()
  const [targetWord,    setTargetWord]    = useState('')
  const [customWord,    setCustomWord]    = useState('')
  const [step,          setStep]          = useState('pick')   // 'pick' | 'draw'
  const [loading,       setLoading]       = useState(false)
  const [result,        setResult]        = useState(null)
  const [extraLang,     setExtraLang]     = useState(null)
  const [visibleWords,  setVisibleWords]  = useState(() => shuffle(WORD_POOL[script]).slice(0, BANK_SIZE))
  const audioRef = useRef(null)

  // Reset when script changes
  useEffect(() => {
    setTargetWord(''); setCustomWord(''); setStep('pick'); setResult(null); setExtraLang(null)
    setVisibleWords(shuffle(WORD_POOL[script]).slice(0, BANK_SIZE))
  }, [script])

  function refreshWords() { setVisibleWords(shuffle(WORD_POOL[script]).slice(0, BANK_SIZE)) }

  const childAge  = child?.birthYear ? new Date().getFullYear() - child.birthYear : 5
  const childName = child?.name || 'you'

  // Cross-language: always show English as the primary translation for Tamil/Hindi, Tamil for English
  const crossKey   = script === 'english' ? 'tamil'   : 'english'
  const crossLabel = script === 'english' ? '🌺 In Tamil' : '🇬🇧 In English'
  const crossFont  = script === 'english' ? '"Noto Sans Tamil",serif' : 'Nunito,sans-serif'
  const crossTts   = script === 'english' ? 'tamil'   : 'english'
  const srcTts     = script === 'hindi'   ? 'hindi'   : script === 'tamil' ? 'tamil' : 'english'

  function play(text, tts) {
    const url = learnApi.audioUrl(text, tts)
    if (audioRef.current) { audioRef.current.src = url; audioRef.current.play().catch(()=>{}) }
  }

  function pickWord(w) { setTargetWord(w); setCustomWord(''); setStep('draw'); setResult(null) }
  function useCustomWord() {
    const w = customWord.trim()
    if (!w) return
    setTargetWord(w); setStep('draw'); setResult(null)
  }

  async function handleSubmit(imageData) {
    setLoading(true); setResult(null); setExtraLang(null)
    track('learn', 'trace', { metadata: { script } })
    try {
      const data = await learnApi.identifyWord(imageData, script, childName, childAge, child?.id, targetWord)
      track('learn', 'ai_word', { metadata: { script, word: targetWord, correct: data.correct } })
      setResult(data)
      window.__glumbiRefreshQuota?.()
      if (data.correct && data.translations?.[crossKey]) play(data.translations[crossKey], crossTts)
    } catch {
      setResult({ correct:false, couldRead:false, feedback:"Couldn't read that — try writing a bit bigger! 😊", emoji:'✍️' })
    } finally { setLoading(false) }
  }

  const wordFont = script === 'tamil' ? '"Noto Sans Tamil",serif'
                 : script === 'hindi' ? '"Noto Sans Devanagari",serif'
                 : 'Nunito, sans-serif'

  /* ── Step 1: Pick a word ─────────────────────────────────── */
  if (step === 'pick') return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <audio ref={audioRef} />
      <div style={{ background:'var(--primary-lt)', borderRadius:16, padding:'18px 20px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
          <p style={{ margin:0, fontSize:15, fontWeight:800, color:'var(--primary)' }}>
            { script === 'tamil' ? '🌺 Pick a Tamil word to write:'
            : script === 'hindi' ? '🇮🇳 Pick a Hindi word to write:'
            : '✏️ Pick an English word to write:' }
          </p>
          <button onClick={refreshWords} title="New words"
            style={{ background:'white', border:'none', borderRadius:50, padding:'6px 12px', fontSize:16, cursor:'pointer', boxShadow:'0 2px 6px rgba(0,0,0,0.08)', lineHeight:1 }}>
            🔀
          </button>
        </div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:16 }}>
          {visibleWords.map(w => (
            <button key={w} onClick={() => pickWord(w)}
              style={{ padding:'8px 18px', borderRadius:50, border:'none', fontFamily: wordFont, fontSize: script==='tamil'?18:15, fontWeight:700, background:'white', color:'var(--primary)', cursor:'pointer', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' }}>
              {w}
            </button>
          ))}
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <input value={customWord} onChange={e => setCustomWord(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && useCustomWord()}
            placeholder={script==='tamil' ? 'Or type your own Tamil word…' : script==='hindi' ? 'Or type your own Hindi word…' : 'Or type your own word…'}
            style={{ flex:1, padding:'10px 14px', borderRadius:50, border:'1.5px solid var(--primary-lt)', fontSize:14, fontFamily:'Nunito,sans-serif', outline:'none' }} />
          <button onClick={useCustomWord} disabled={!customWord.trim()}
            style={{ padding:'10px 20px', borderRadius:50, border:'none', background:'var(--primary)', color:'white', fontWeight:800, fontSize:14, cursor: customWord.trim()?'pointer':'not-allowed', opacity: customWord.trim()?1:0.5 }}>
            Go →
          </button>
        </div>
      </div>
    </div>
  )

  /* ── Step 2: Draw the word ──────────────────────────────── */
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <audio ref={audioRef} />

      {/* Target word display */}
      <div style={{ background:'var(--primary-lt)', borderRadius:16, padding:'14px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <div style={{ fontSize:11, fontWeight:800, color:'var(--primary)', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Write this word:</div>
          <div style={{ fontFamily: wordFont, fontSize: script==='tamil'?40:34, fontWeight:700, color:'var(--primary)', lineHeight:1.2 }}>{targetWord}</div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:6, alignItems:'flex-end' }}>
          <button onClick={() => play(targetWord, srcTts)}
            style={{ background:'white', border:'none', borderRadius:50, padding:'7px 14px', fontSize:12, fontWeight:700, color:'var(--primary)', cursor:'pointer' }}>
            🔊 Hear it
          </button>
          <button onClick={() => { setStep('pick'); setResult(null) }}
            style={{ background:'none', border:'none', fontSize:12, fontWeight:700, color:'#aaa', cursor:'pointer' }}>
            ← Pick different word
          </button>
        </div>
      </div>

      {/* Canvas */}
      <DrawCanvas onSubmit={handleSubmit} loading={loading} disabled={quota?.used >= quota?.limit || offline} fullWidth />
      {offline && <div style={{ textAlign:'center', fontSize:13, fontWeight:700, color:'#aaa', marginTop:4 }}>✈️ Practice mode — AI check is off</div>}

      {/* Loading / Result side */}
      {loading ? (
        <div><ThemeLoader theme={child?.theme} /></div>
      ) : result ? (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {/* Correct/incorrect feedback banner */}
          <div style={{ padding:'14px 18px', borderRadius:14, textAlign:'center', background: result.correct ? '#f0fff4' : '#fff8f0', border:`1.5px solid ${result.correct ? '#6bcb77' : '#ffc0a0'}` }}>
            <div style={{ fontSize:28, marginBottom:6 }}>{result.correct ? '🎉' : '💪'}</div>
            <div style={{ fontSize:14, fontWeight:700, color: result.correct ? '#1e6b3c' : '#c05a00', lineHeight:1.6 }}>{result.feedback}</div>
          </div>

          {result.correct ? <>

            {/* Source word + emoji */}
            <div style={{ display:'flex', alignItems:'center', gap:16, background:'var(--primary-lt)', borderRadius:16, padding:'14px 18px' }}>
              <span style={{ fontSize:52 }}>{result.emoji}</span>
              <div>
                <div style={{ fontFamily: script==='tamil' ? '"Noto Sans Tamil",serif' : 'Nunito, sans-serif', fontSize:30, color:'var(--primary)', lineHeight:1.2 }}>
                  {result.word}
                </div>
                <button onClick={() => play(result.word, srcTts)}
                  style={{ marginTop:6, background:'none', border:'none', fontSize:11, fontWeight:700, color:'#ccc', cursor:'pointer', padding:0 }}>
                  🔊 Hear in {script === 'tamil' ? 'Tamil' : script === 'hindi' ? 'Hindi' : 'English'}
                </button>
              </div>
            </div>

            {/* Meaning */}
            <div style={{ background:'#f0fff4', borderRadius:14, padding:'12px 16px', border:'1.5px solid #c3f0ca' }}>
              <div style={{ fontSize:11, fontWeight:800, color:'#6bcb77', textTransform:'uppercase', letterSpacing:1, marginBottom:5 }}>What it means</div>
              <div style={{ fontSize:14, color:'#2d2d2d', lineHeight:1.7 }}>{result.meaning}</div>
            </div>

            {/* PRIMARY: cross-language translation — always shown */}
            {result.translations?.[crossKey] && (
              <div style={{ background:'var(--primary-lt)', borderRadius:14, padding:'14px 18px', border:'1.5px solid var(--primary-lt)' }}>
                <div style={{ fontSize:11, fontWeight:800, color:'var(--primary)', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>{crossLabel}</div>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <span style={{ fontFamily:crossFont, fontSize:26, color:'var(--primary)', fontWeight:700 }}>
                    {result.translations[crossKey]}
                  </span>
                  <button onClick={() => play(result.translations[crossKey], crossTts)}
                    style={{ background:'linear-gradient(135deg,var(--primary),var(--accent))', border:'none', borderRadius:50, padding:'8px 16px', fontSize:13, fontWeight:800, color:'white', cursor:'pointer' }}>
                    🔊 Hear it
                  </button>
                </div>
              </div>
            )}

            {/* Fun fact */}
            {result.funFact && (
              <div style={{ background:'#fffbf0', borderRadius:14, padding:'12px 16px', border:'1.5px solid #ffe9a0' }}>
                <div style={{ fontSize:11, fontWeight:800, color:'#f0a000', textTransform:'uppercase', letterSpacing:1, marginBottom:5 }}>✨ Fun fact</div>
                <div style={{ fontSize:14, color:'#2d2d2d', lineHeight:1.7 }}>{result.funFact}</div>
              </div>
            )}

            {/* Extra translations — all languages except source */}
            {(() => {
              const extraLangs = ALL_TRANS_LANGS.filter(l => l.key !== script)
              return (
                <div>
                  <div style={{ fontSize:11, fontWeight:800, color:'#bbb', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>Also in</div>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:10 }}>
                    {extraLangs.map(l => (
                      <button key={l.key} onClick={() => setExtraLang(extraLang === l.key ? null : l.key)}
                        style={{ padding:'6px 14px', borderRadius:50, border:'none', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'Nunito,sans-serif', background: extraLang===l.key ? '#f0f0f0' : '#f8f8f8', color: extraLang===l.key ? '#333' : '#aaa', boxShadow: extraLang===l.key ? '0 2px 8px rgba(0,0,0,0.1)' : 'none' }}>
                        {l.flag} {l.label}
                      </button>
                    ))}
                  </div>
                  {extraLang && result.translations?.[extraLang] && (() => {
                    const l = ALL_TRANS_LANGS.find(x => x.key === extraLang)
                    const isScriptLang = extraLang === 'tamil' || extraLang === 'hindi'
                    return (
                      <div style={{ display:'flex', alignItems:'center', gap:12, background:'#f5f5f5', borderRadius:12, padding:'12px 16px' }}>
                        <span style={{ fontFamily: isScriptLang ? '"Noto Sans Tamil","Noto Sans Devanagari",serif' : 'inherit', fontSize:22, color:'#555', fontWeight:700 }}>
                          {result.translations[extraLang]}
                        </span>
                        <button onClick={() => play(result.translations[extraLang], l.tts)}
                          style={{ background:'none', border:'none', fontSize:12, fontWeight:700, color:'#888', cursor:'pointer', padding:0 }}>
                          🔊
                        </button>
                      </div>
                    )
                  })()}
                </div>
              )
            })()}

          </> : null}
          {/* Try again button */}
          <button onClick={() => setResult(null)}
            style={{ alignSelf:'center', padding:'10px 24px', borderRadius:50, border:'none', background:'var(--primary)', color:'white', fontWeight:800, fontSize:14, cursor:'pointer' }}>
            ✍️ Try again
          </button>
        </div>
      ) : null}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

const TAMIL_CATS = [
  { key:'vowels',     label:'உயிர் (12)',       letters: TAMIL_VOWELS },
  { key:'consonants', label:'மெய் (18)',        letters: TAMIL_CONSONANTS },
  { key:'compound',   label:'உயிர்மெய் (216)', letters: null },
  { key:'aytham',     label:'ஆய்தம்',          letters: [AYTHAM] },
]

const HINDI_CATS = [
  { key:'vowels',     label:'स्वर (12)',       letters: HINDI_VOWELS },
  { key:'consonants', label:'व्यंजन (30)',     letters: HINDI_CONSONANTS },
  { key:'barakhadi',  label:'बारहखड़ी (360)', letters: null },
  { key:'numbers',    label:'संख्या',          letters: HINDI_NUMBERS },
]

// ENG_CATS is generated dynamically based on engStyle in the component

export default function LearnPage({ child, quota }) {
  const { track } = useTracker()
  useFeatureDuration('learn', track)
  const [script,    setScript]    = useState('tamil')
  const [mode,      setMode]      = useState('letters')   // 'letters' | 'words'
  const [catKey,    setCatKey]    = useState('vowels')
  const [selected,  setSelected]  = useState(null)
  const [engCase,   setEngCase]   = useState('upper')   // 'upper' | 'lower'
  const [engFont,   setEngFont]   = useState('print')   // 'print' | 'cursive'
  const audioRef = useRef(null)

  // Load Dancing Script when cursive is selected
  useEffect(() => {
    if (engFont === 'cursive' && !document.getElementById('dancing-script-font')) {
      const link = document.createElement('link')
      link.id   = 'dancing-script-font'
      link.rel  = 'stylesheet'
      link.href = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap'
      document.head.appendChild(link)
    }
  }, [engFont])

  const isTamil  = script === 'tamil'
  const isHindi  = script === 'hindi'
  const isEng    = script === 'english'

  const isLower = engCase === 'lower'
  const ENG_CATS = [
    { key:'vowels',     label:'Vowels',     letters: isLower ? ENG_VOWELS_LOWER : ENG_VOWELS },
    { key:'consonants', label:'Consonants', letters: isLower ? ENG_CONS_LOWER   : ENG_CONSONANTS },
    { key:'numbers',    label:'Numbers',    letters: ENG_NUMBERS },
  ]

  const cats = isTamil ? TAMIL_CATS : isHindi ? HINDI_CATS : ENG_CATS
  const cat  = cats.find(c => c.key === catKey) || cats[0]

  const engFontFamily = engFont === 'cursive' ? '"Dancing Script", cursive' : 'Nunito, sans-serif'

  useEffect(() => {
    setSelected(null)
    setCatKey(cats[0].key)
  }, [script])

  useEffect(() => { setSelected(null) }, [engCase, engFont])

  useEffect(() => { setSelected(null) }, [catKey])

  function selectLetter(item) {
    const pulliMark = cat.key === 'consonants' ? (isTamil ? '்' : isHindi ? '्' : '') : ''
    const displayItem = pulliMark
      ? { ...item, char: item.char + pulliMark, roman: item.roman ? item.roman.replace(/a$/, '') : item.roman }
      : item
    setSelected(displayItem)
    const tts = isTamil ? 'tamil' : isHindi ? 'hindi' : 'english'
    const url = learnApi.audioUrl(displayItem.char, tts)
    if (audioRef.current) { audioRef.current.src = url; audioRef.current.load(); audioRef.current.play().catch(()=>{}) }
  }

  function replayAudio() {
    if (!selected) return
    const tts = isTamil ? 'tamil' : isHindi ? 'hindi' : 'english'
    const url = learnApi.audioUrl(selected.char, tts)
    if (audioRef.current) { audioRef.current.src = url; audioRef.current.load(); audioRef.current.play().catch(()=>{}) }
  }

  return (
    <div style={{ fontFamily:'Nunito,sans-serif' }}>
      <FeatureBanner feature="learn" child={child} isMobile={window.innerWidth < 1024} />
      <audio ref={audioRef} />
      <div style={{ marginTop: 6 }}>
      <QuotaBanner quota={quota} />

      {/* Script + mode bar */}
      <div style={{ display:'flex', gap:8, marginBottom: isEng ? 10 : 18, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ display:'flex', gap:6 }}>
          {[{k:'tamil',label:'🌺 Tamil'},{k:'hindi',label:'🇮🇳 Hindi'},{k:'english',label:'🔤 English'}].map(s => (
            <button key={s.k} onClick={() => { setScript(s.k); setMode('letters') }}
              style={{ padding:'7px 16px', borderRadius:50, border:'none', fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'Nunito,sans-serif', background: script===s.k ? 'var(--primary)' : '#f5f5f5', color: script===s.k ? 'white' : '#777' }}>
              {s.label}
            </button>
          ))}
        </div>

        <button onClick={() => setMode(mode==='words' ? 'letters' : 'words')}
          style={{ padding:'7px 16px', borderRadius:50, fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'Nunito,sans-serif', border:`1.5px solid ${mode==='words' ? 'var(--primary)' : '#ddd'}`, background: mode==='words' ? 'var(--primary-lt)' : 'white', color: mode==='words' ? 'var(--primary)' : '#999' }}>
          ✍️ Write a word
        </button>
      </div>

      {/* English style toggles */}
      {isEng && mode === 'letters' && (
        <div style={{ display:'flex', gap:12, marginBottom:18, flexWrap:'wrap', alignItems:'center' }}>
          {/* Font style */}
          <div style={{ display:'flex', gap:6 }}>
            {[{k:'print',label:'✏️ Print'},{k:'cursive',label:'𝒜 Cursive'}].map(s => (
              <button key={s.k} onClick={() => setEngFont(s.k)}
                style={{ padding:'6px 14px', borderRadius:50, fontSize:12, fontWeight:800, cursor:'pointer', fontFamily:'Nunito,sans-serif',
                  border: engFont===s.k ? 'none' : '1.5px solid #eee',
                  background: engFont===s.k ? 'var(--primary)' : '#f8f8f8',
                  color: engFont===s.k ? 'white' : '#888' }}>
                {s.label}
              </button>
            ))}
          </div>
          <div style={{ width:1, height:22, background:'#e0e0e0' }} />
          {/* Case */}
          <div style={{ display:'flex', gap:6 }}>
            {[{k:'upper',label:'ABC Upper'},{k:'lower',label:'abc Lower'}].map(s => (
              <button key={s.k} onClick={() => setEngCase(s.k)}
                style={{ padding:'6px 14px', borderRadius:50, fontSize:12, fontWeight:800, cursor:'pointer', fontFamily:'Nunito,sans-serif',
                  border: engCase===s.k ? 'none' : '1.5px solid #eee',
                  background: engCase===s.k ? 'var(--primary)' : '#f8f8f8',
                  color: engCase===s.k ? 'white' : '#888' }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === 'words' ? (
        <WordMode script={script} child={child} quota={quota} />
      ) : (
        <>
          {/* Category tabs */}
          <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
            {cats.map(c => (
              <button key={c.key} onClick={() => setCatKey(c.key)}
                style={{ padding:'7px 14px', borderRadius:50, fontSize:13, fontWeight:700, fontFamily:'Nunito,sans-serif', border: catKey===c.key ? 'none' : '1.5px solid #eee', background: catKey===c.key ? 'var(--primary-lt)' : 'white', color: catKey===c.key ? 'var(--primary)' : '#888', cursor:'pointer' }}>
                {c.label}
              </button>
            ))}
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
            {/* Letter grid / compound table */}
            <div>
              {cat.key === 'compound' ? (
                <CompoundTable selected={selected} onSelect={selectLetter} isMobile={window.innerWidth < 768} />
              ) : cat.key === 'barakhadi' ? (
                <HindiCompoundTable selected={selected} onSelect={selectLetter} isMobile={window.innerWidth < 768} />
              ) : (
                <LetterGrid letters={cat.letters} selected={selected} onSelect={selectLetter} script={script}
                  pulli={cat.key === 'consonants' ? (script === 'tamil' ? '்' : script === 'hindi' ? '्' : null) : null}
                  engFontFamily={isEng ? engFontFamily : null} />
              )}
            </div>

            {/* Practice panel */}
            <div>
              <LetterPanel selected={selected} script={script} child={child} onPlay={replayAudio} quota={quota}
                engFontFamily={isEng ? engFontFamily : null} />
            </div>
          </div>
        </>
      )}
      </div>
    </div>
  )
}
