import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { query } from '../db/pool.js';
import { asyncHandler, badRequest } from '../lib/errors.js';
import * as v from '../lib/validate.js';
import { generateLandingSection, isAiConfigured } from '../services/openai.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();

/** The sections that make up the landing page — image + ~400 AI-written words each. */
export const SECTION_PLAN = [
  {
    slug: 'start-here',
    heading: 'Start a business from the very first step',
    angle: 'What Kno U Kno is: a guided path from the basics all the way to the finish.',
    image: '/img/section-start.svg',
    alt: 'A founder writing the first plan for a new business',
  },
  {
    slug: 'law',
    heading: 'Law first, so the business is real',
    angle: 'Entity type, registration, licences, permits, tax IDs, insurance, contracts.',
    image: '/img/section-law.svg',
    alt: 'Business formation paperwork on a desk',
  },
  {
    slug: 'location',
    heading: 'The best place to put a business',
    angle: 'Market and site selection, zoning, lease terms, rent against revenue, online or physical.',
    image: '/img/section-location.svg',
    alt: 'A storefront on a busy street',
  },
  {
    slug: 'hiring',
    heading: 'What type of person to hire',
    angle: 'First roles, the kind of person behind the role, pay, onboarding, training.',
    image: '/img/section-hiring.svg',
    alt: 'A small team working together',
  },
  {
    slug: 'people',
    heading: 'The people who come to your business',
    angle: 'The customer, their problem, how they find you, what brings them back.',
    image: '/img/section-people.svg',
    alt: 'Customers being served at a counter',
  },
  {
    slug: 'the-answer-is-yours',
    heading: 'The question is ours. The answer is yours.',
    angle: 'The AI asks the same business question a different way each time; the founder answers, and every answer is stored so it can be graded, ranked, printed, and used later.',
    image: '/img/section-answers.svg',
    alt: 'Handwritten answers in a workbook',
  },
];

router.get(
  '/landing',
  asyncHandler(async (_req, res) => {
    const stored = await query('SELECT * FROM landing_sections ORDER BY position ASC');
    const bySlug = new Map(stored.map((s) => [s.slug, s]));

    const sections = SECTION_PLAN.map((plan, i) => {
      const row = bySlug.get(plan.slug);
      return {
        slug: plan.slug,
        heading: row?.heading || plan.heading,
        body: row?.body || null,
        imageUrl: row?.image_url || plan.image,
        imageAlt: row?.image_alt || plan.alt,
        wordCount: row?.word_count || 0,
        position: row?.position ?? i,
      };
    });

    res.json({ sections });
  }),
);

/** Admin regenerates the ~400-word copy for one section or all of them. */
router.post(
  '/landing/generate',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    if (!isAiConfigured()) {
      throw badRequest('Set a real OPENAI_API_KEY before generating landing copy.');
    }

    const slug = v.str(req.body.slug, 'Slug', { max: 80, required: false });
    const plans = slug ? SECTION_PLAN.filter((p) => p.slug === slug) : SECTION_PLAN;
    const written = [];

    for (const [index, plan] of plans.entries()) {
      const generated = await generateLandingSection(plan);
      await query(
        `INSERT INTO landing_sections (id, slug, heading, body, image_url, image_alt, word_count, position)
         VALUES (:id, :slug, :heading, :body, :image, :alt, :wordCount, :position)
         ON DUPLICATE KEY UPDATE heading = VALUES(heading), body = VALUES(body),
           image_url = VALUES(image_url), image_alt = VALUES(image_alt),
           word_count = VALUES(word_count), position = VALUES(position)`,
        {
          id: uuid(),
          slug: plan.slug,
          heading: generated.heading,
          body: generated.body,
          image: plan.image,
          alt: plan.alt,
          wordCount: v.countWords(generated.body),
          position: SECTION_PLAN.findIndex((p) => p.slug === plan.slug) || index,
        },
      );
      written.push({ slug: plan.slug, wordCount: v.countWords(generated.body) });
    }

    res.json({ ok: true, sections: written });
  }),
);

export default router;
