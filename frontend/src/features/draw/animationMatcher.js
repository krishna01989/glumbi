import { ANIMATION_LIBRARY } from './animationLibrary.js';

// ─── Safety: hard-block tag sets ─────────────────────────────────────────────
export const HARD_BLOCK_TAGS = new Set([
  // ── Violence & gore ──────────────────────────────────────────────────────────
  'murder','kill','killing','kills','killed','gore','blood','bloody','guts','decapitate',
  'decapitation','torture','torturing','mutilate','mutilation','dismember','behead',
  'stab','stabbing','strangle','strangling','choke','choking','beat','beating','assault',
  'assaulting','bruise','wound','injury','injure','harm-person','hurt-person','attack-person',
  'violence','violent','massacre','slaughter','carnage','atrocity','brutal','brutality',
  // ── Self-harm & suicide ──────────────────────────────────────────────────────
  'suicide','suicidal','self-harm','selfharm','self-injury','self-inflicted',
  'cutting','cut-self','cutting-self','cutting-wrists','razor-blade','razor-cutting',
  'hanging','hung','noose','rope-around-neck','hang-self','hanging-person',
  'overdose','overdosing','pill-overdose','take-pills','swallow-pills','too-many-pills',
  'end-life','end-it-all','kill-self','kill-myself','die-by-suicide','self-destruct',
  'wrist-cut','jump-off','jump-from','fall-to-death',
  // ── Sexual content ───────────────────────────────────────────────────────────
  'sex','sexual','nude','naked','nudity','genitals','genitalia','pornography','porn',
  'explicit','adult-content','inappropriate-touch','grooming','molest','molestation',
  'rape','sexual-assault','abuse','sexual-abuse','child-sexualization','inappropriate',
  'undress','undressed','erotic','lewd',
  // ── Drugs & alcohol ──────────────────────────────────────────────────────────
  'drugs','drug-use','cocaine','heroin','marijuana','meth','methamphetamine','crystal-meth',
  'alcohol','drunk','drinking-alcohol','getting-high','high','weed','cannabis','pills',
  'pill-bottle','overdosing','intoxicated','intoxication','hallucinating','hallucination',
  'snorting','injecting-drugs','needle-drugs','acid','lsd','ecstasy','opioid','fentanyl',
  'crack','smoking-drugs','bong','syringe-drugs','substance-abuse',
  // ── Hate symbols & discrimination ────────────────────────────────────────────
  'swastika','hate','nazi','nazism','kkk','white-supremacy','white-supremacist',
  'racial-slur','slur','discrimination','bigotry','antisemitism','antisemitic',
  'hate-symbol','hate-crime','extremism','extremist','supremacist',
  // ── Weapons in violent context ───────────────────────────────────────────────
  'shooting-person','shoot-person','shot-person','stabbing','knife-attack','gun-attack',
  'bomb-explode','explosion-harm','terrorist','terrorism','mass-shooting','school-shooting',
  'shooting-crowd','sniper','killing-spree','attack-people','weapon-attack',
  // ── Child endangerment & exploitation ────────────────────────────────────────
  'stranger-danger','child-abuse','child-trafficking','trafficking','exploitation',
  'kidnapping','kidnap','abduction','abduct','lure-child','predator',
  // ── Dangerous activities ─────────────────────────────────────────────────────
  'fire-breathing','playing-with-fire','electrical-hazard','chemical-danger',
  'toxic-substance','poison-drink','poison-food','poisoning','acid-attack',
  'suffocation','suffocate','drowning-person','burning-person',
]);

// ─── Silent redirect: map risky objects to safe animation alternatives ────────
export const REDIRECT_RULES = [
  { matchTags: ['knife','chop','slice','cut','blade'], redirectId: 'chef-cooking' },
  { matchTags: ['gun','pistol','rifle','shoot','firearm','weapon'], redirectId: 'water-gun-splash' },
  { matchTags: ['bow','arrow'], redirectId: 'bow-archery' },
  { matchTags: ['needle','injection','syringe'], redirectId: 'science-experiment' },
  { matchTags: ['cigarette','smoke','smoking'], redirectId: 'cloud-puff' },
  { matchTags: ['beer','wine','whiskey','liquor','booze'], redirectId: 'smoothie-blend' },
  { matchTags: ['explosion','explode','bomb','detonate'], redirectId: 'volcano-science' },
  { matchTags: ['fire','flame','burning'], redirectId: 'campfire-roast' },
  { matchTags: ['fight','punch','hit-person','slap'], redirectId: 'boxing-match' },
  { matchTags: ['blood','gore','wound'], redirectId: 'ketchup-splat' },
];

// Build a lookup map for the library
const libraryById = new Map(ANIMATION_LIBRARY.map(a => [a.id, a]));

/**
 * Checks object label / tags for safety.
 * Returns { safe: true } or { safe: false, hardBlock: true, reason }
 * or { safe: false, redirect: 'animation-id', reason }
 */
export function safetyCheck(detectedLabel = '', detectedTags = []) {
  const allTerms = [
    ...detectedTags,
    ...detectedLabel.toLowerCase().split(/\s+/),
  ].map(t => t.toLowerCase().replace(/[^a-z0-9-]/g, ''));

  // Hard block
  for (const term of allTerms) {
    if (HARD_BLOCK_TAGS.has(term)) {
      return {
        safe: false,
        hardBlock: true,
        reason: 'This type of drawing cannot be animated.',
      };
    }
  }

  // Redirect
  for (const rule of REDIRECT_RULES) {
    if (rule.matchTags.some(rt => allTerms.includes(rt))) {
      const target = libraryById.get(rule.redirectId);
      if (target) {
        return { safe: false, redirect: rule.redirectId, reason: 'redirected' };
      }
    }
  }

  return { safe: true };
}

/**
 * Scores a single animation entry against the detected objects array.
 * detectedObjects: [{ label: string, tags: string[], confidence: number }]
 * Returns numeric score (higher = better match).
 */
function scoreAnimation(entry, detectedObjects) {
  let bestScore = 0;

  for (const obj of detectedObjects) {
    const objTags = new Set([
      ...(obj.tags || []).map(t => t.toLowerCase()),
      ...(obj.label || '').toLowerCase().split(/\s+/),
    ]);
    // Floor at 0.5 so rough kids' drawings (low confidence) still produce usable scores
    const confidenceWeight = Math.max(0.5, obj.confidence ?? 1.0);

    let score = 0;

    // Exact tag overlap
    for (const tag of entry.tags) {
      if (objTags.has(tag.toLowerCase())) {
        score += 10;
      }
    }

    // Scene match bonus
    if (obj.scene && entry.scene === obj.scene) {
      score += 5;
    }

    // Partial substring match (lower weight)
    for (const tag of entry.tags) {
      for (const objTag of objTags) {
        if (objTag.includes(tag) || tag.includes(objTag)) {
          score += 2;
        }
      }
    }

    bestScore = Math.max(bestScore, score * confidenceWeight);
  }

  return bestScore;
}

/**
 * Finds the best matching animations for a set of detected objects.
 * @param {Array} detectedObjects - [{label, tags, confidence, boundingBox}]
 * @param {number} age - child age for ageVariant selection
 * @param {number} topN - max results to return
 * @returns {Array} sorted animation entries with .score and .ageVariant populated
 */
export function findBestAnimations(detectedObjects, age = 6, topN = 3) {
  if (!detectedObjects?.length) return [];

  const scored = ANIMATION_LIBRARY
    .map(entry => ({
      ...entry,
      score: scoreAnimation(entry, detectedObjects),
    }))
    .filter(e => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);

  const variant = age <= 4 ? 'young' : age <= 7 ? 'mid' : 'older';

  return scored.map(e => ({
    ...e,
    ageVariant: e.ageVariants?.[variant] ?? e.ageVariants?.mid ?? e.ageVariants?.young,
  }));
}

/**
 * Main entry point: given Claude Vision output, returns animation config or block/redirect.
 * @param {Array} detectedObjects
 * @param {number} age
 * @returns {{ blocked: boolean, redirected: boolean, animation?: object, message?: string }}
 */
export function resolveAnimation(detectedObjects, age = 6) {
  if (!detectedObjects?.length) {
    return { blocked: true, message: "I couldn't see anything to animate. Try drawing something!" };
  }

  // Check the primary detected object
  const primary = detectedObjects[0];
  const check = safetyCheck(primary.label, primary.tags ?? []);

  if (check.hardBlock) {
    return {
      blocked: true,
      message: "Let's draw something else — animals, food, space, sports, or nature are all great ideas! 🌟",
    };
  }

  if (check.redirect) {
    const target = libraryById.get(check.redirect);
    if (target) {
      const variant = age <= 4 ? 'young' : age <= 7 ? 'mid' : 'older';
      return {
        redirected: true,
        animation: {
          ...target,
          ageVariant: target.ageVariants?.[variant] ?? target.ageVariants?.mid,
        },
      };
    }
  }

  const [best] = findBestAnimations(detectedObjects, age, 1);
  if (!best || best.score === 0) {
    // Fallback to a generic happy animation
    const fallback = ANIMATION_LIBRARY.find(e => e.id === 'rainbow-unicorn') ?? ANIMATION_LIBRARY[0];
    const variant = age <= 4 ? 'young' : age <= 7 ? 'mid' : 'older';
    return {
      animation: {
        ...fallback,
        ageVariant: fallback.ageVariants?.[variant] ?? fallback.ageVariants?.mid,
      },
    };
  }

  return { animation: best };
}
