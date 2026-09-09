import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';

// Used until the AI copy has been generated into landing_sections.
const FALLBACK = {
  'start-here':
    'Kno U Kno shows you how to start a business from the basics all the way to the finish. You do not get a template and you do not get somebody else’s plan. You get the questions, in the order a real business needs them answered, and you write the answers yourself.\n\nThe path is always the same: law first, because until the paperwork is right there is no business to run. Then location, because where you sit decides who walks in. Then hiring, because the first people you bring in set the standard for everyone after them. Then the people who come to you, because a business that nobody visits is a hobby with overheads.\n\nEvery answer you write is stored. You can come back to it, grade it, rank it, print it, and use it when the bank, the landlord, or the licensing office asks you a hard question.',
  law:
    'Law comes first. Before a sign goes up or a single customer walks in, the business has to exist on paper. That means choosing the entity, registering the name, getting the tax ID, and finding out which licences and permits your trade and your city actually require.\n\nThe questions in this stage push you to name the specifics: which entity and why, who signs, what insurance the lease will demand, and what happens to the business if you step away for a month.\n\nYou answer in your own words. The example shows you the shape of a strong answer without ever answering for you.',
  location:
    'Location decides who finds you. That might be a corner unit with foot traffic, a low-rent unit that people drive to on purpose, or no unit at all because your customers are online.\n\nThese questions make you defend the choice: what the rent is against the revenue you expect, what the zoning allows, how long the lease locks you in, and what your second choice is if the first falls through.',
  hiring:
    'Hiring is not a headcount, it is a type of person. The first hire sets the standard for everyone who comes after them, so these questions ask what the role has to cover, what kind of person covers it well, what you can pay, and how you will know within thirty days whether it worked.\n\nYou will also work through contractors against employees, the training you owe a new person, and the part of the job you are not willing to hand over yet.',
  people:
    'The people who come to your business are the whole point. These questions ask who they are, what problem brings them to you, how they find you the first time, and what makes them come back a second time.\n\nBy the time you finish this stage you should be able to describe your customer to a stranger in one sentence and explain exactly what you sell them.',
  'the-answer-is-yours':
    'The question is ours. The answer is yours. The AI writes each question around the business you named, and it asks the same underlying question a different way each time so you keep thinking instead of repeating yourself.\n\nEvery answer goes into the database under your business title. From there you can grade each answer A to F, rank them so the strongest sits at number one, work out your average, and print or save the whole set.\n\nThat is the finish: not a certificate, but a written, graded, ranked plan in your own words that you can hand to a bank, a partner, or your first employee.',
};

const FALLBACK_IMAGES = {
  'start-here': '/img/section-start.svg',
  law: '/img/section-law.svg',
  location: '/img/section-location.svg',
  hiring: '/img/section-hiring.svg',
  people: '/img/section-people.svg',
  'the-answer-is-yours': '/img/section-answers.svg',
};

const HEADINGS = {
  'start-here': 'Start a business from the very first step',
  law: 'Law first, so the business is real',
  location: 'The best place to put a business',
  hiring: 'What type of person to hire',
  people: 'The people who come to your business',
  'the-answer-is-yours': 'The question is ours. The answer is yours.',
};

const EYEBROWS = {
  'start-here': 'Know you know',
  law: 'Stage one',
  location: 'Stage two',
  hiring: 'Stage three',
  people: 'Stage four',
  'the-answer-is-yours': 'How it works',
};

export default function Home() {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    api
      .get('/content/landing', { auth: false })
      .then((data) => setSections(data.sections || []))
      .catch(() => setSections([]));
  }, []);

  const list = (sections.length ? sections : Object.keys(FALLBACK).map((slug) => ({ slug }))).map(
    (s) => ({
      slug: s.slug,
      heading: s.heading || HEADINGS[s.slug] || s.slug,
      body: s.body || FALLBACK[s.slug] || '',
      imageUrl: s.imageUrl || FALLBACK_IMAGES[s.slug],
      imageAlt: s.imageAlt || s.heading || s.slug,
    }),
  );

  return (
    <>
      <section className="kk-hero">
        <div className="container">
          <span className="kk-section__eyebrow text-white">knoukno.co</span>
          <h1 className="fw-bolder">
            Kno U <span className="text-gold">Kno</span>
            <br />
            Know you know.
          </h1>
          <div className="kk-hero__rule" />
          <p className="lead mb-4">
            We show you how to start a business — from the basics all the way to the finish. Law,
            location, hiring, and the people who come to your business. We ask the questions. You
            write the answers, and we keep every one of them.
          </p>
          <div className="d-flex flex-wrap gap-3">
            <Link className="btn btn-gold btn-lg px-4" to="/register">
              Start free — 5 questions
            </Link>
            <Link className="btn btn-outline-light btn-lg px-4" to="/price">
              See the price
            </Link>
          </div>
        </div>
      </section>

      {list.map((section, index) => (
        <section
          key={section.slug}
          id={section.slug}
          className={`kk-section ${index % 2 === 1 ? 'kk-section--alt' : ''}`}
        >
          <div className="container">
            <div
              className={`row align-items-center g-5 ${index % 2 === 1 ? 'flex-lg-row-reverse' : ''}`}
            >
              <div className="col-lg-6">
                <span className="kk-section__eyebrow">{EYEBROWS[section.slug] || 'Kno U Kno'}</span>
                <h2 className="kk-section__title">{section.heading}</h2>
                <div className="kk-section__body">
                  {section.body.split(/\n{2,}/).map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </div>

              <div className="col-lg-6">
                <figure className="kk-section__figure mb-0">
                  <img
                    className="kk-section__img"
                    src={section.imageUrl}
                    alt={section.imageAlt}
                    loading="eager"
                    decoding="async"
                    width="1200"
                    height="760"
                  />
                </figure>
              </div>
            </div>
          </div>
        </section>
      ))}

      <section className="kk-section kk-section--dark text-center">
        <div className="container">
          <span className="kk-section__eyebrow">Everyone has to register</span>
          <h2 className="kk-section__title">Name your business and answer the first question</h2>
          <p className="mx-auto mb-4" style={{ maxWidth: '46rem' }}>
            Register, write your business title, and the first five questions are written for you
            free for three days. No card until you decide to keep going.
          </p>
          <div className="d-flex justify-content-center flex-wrap gap-3">
            <Link className="btn btn-gold btn-lg px-4" to="/register">
              Register free
            </Link>
            <Link className="btn btn-outline-light btn-lg px-4" to="/price">
              Buy Now
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
