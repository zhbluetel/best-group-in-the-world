/**
 * Structured content for the Product Information page.
 *
 * Modelled as data rather than JSX so that copy edits stay mechanical and the
 * page component can remain a thin renderer.
 */

/** A highlighted quality the range is built to. */
export interface ProductHighlight {
  title: string;
  body: string;
}

/** A single line of the printed specification list. */
export interface ProductSpec {
  term: string;
  detail: string;
}

/** Introductory copy for the "why ours" half of the page. */
export const WHY = {
  eyebrow: "Why ours",
  title: "Not just another shelf of soft toys",
  intro:
    "Every character is sculpted, sampled and re-sampled until it feels right in the arms rather than just good in photographs. Here is what we fuss over, on all of them."
};

/** The qualities every character in the range shares. */
export const HIGHLIGHTS: ProductHighlight[] = [
  {
    title: "Impossibly soft, shaped to be hugged",
    body: "The short-pile plush is the kind you keep stroking without noticing you are doing it. Every character is weighted low and wide, so it settles into an elbow or a chest instead of toppling out of it."
  },
  {
    title: "Finished by hand",
    body: "Faces are embroidered rather than printed, noses stitched in a deeper thread, and Gordo’s little blue canvas flag is sewn into one paw. Those details are the difference between a shape and a character."
  },
  {
    title: "Made to be loved hard",
    body: "Seams at the arms, legs and ears are reinforced, because those are the places a well-loved plushie gives out first. The plush is surface-washable, so an incident with a yoghurt is not the end of the friendship."
  },
  {
    title: "Small, numbered first runs",
    body: "Each first batch is a few hundred, every one numbered on the tag tucked under an arm. We would rather make a small run properly than a big one in a hurry."
  }
];

/** Introductory copy for the specification half of the page. */
export const DETAILS = {
  eyebrow: "The details",
  title: "Made properly",
  body: [
    "Nothing here is decided by what is cheapest. We picked the plush for how it feels after a hundred washes, the filling for how it holds a hug, and Gordo’s flag because it is the bit that made the first one ours.",
    "Join the waitlist and you will hear from us the moment the first run is signed off, including anything that changes between now and then."
  ]
};

/** The specification card, using Gordo as the reference character. */
export const SPEC_CARD = {
  title: "Gordo, on paper",
  intro: "He sets the standard the rest of the range is built to. Sizes and trims vary by character.",
  footnote: "Final specifications confirmed when the first run is signed off.",
  specs: [
    { term: "Height", detail: "approx. 28 cm / 11 in, sitting" },
    { term: "Fabric", detail: "super-soft short-pile plush" },
    { term: "Filling", detail: "recycled PET fibre" },
    { term: "Flag", detail: "screen-printed cotton canvas (Gordo)" },
    { term: "Care", detail: "surface wash, air dry" },
    { term: "Safety", detail: "designed to EN 71 / ASTM toy-safety requirements" },
    { term: "Age", detail: "3+" }
  ] as ProductSpec[]
};
