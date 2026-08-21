/**
 * Structured content for the BluePlush master agreement rendered at `/legal`.
 *
 * The document is modelled as data rather than JSX so that clause edits stay
 * mechanical and the page component can remain a thin, generic renderer.
 */

/** A single renderable unit within a section introduction or a clause. */
export type LegalBlock =
  | { kind: "text"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "table"; headers: string[]; rows: string[][] }
  | { kind: "diagram"; content: string; caption?: string }
  | { kind: "terms"; tone: "approved" | "prohibited"; intro: string; items: string[] }
  | { kind: "signature"; party: string; fields: { label: string; value?: string }[] };

/** A numbered provision within a section, optionally with a short heading. */
export interface LegalClause {
  number?: string;
  heading?: string;
  blocks: LegalBlock[];
}

/** A top-level division of the document; also a table-of-contents entry. */
export interface LegalSection {
  id: string;
  label?: string;
  title: string;
  intro?: LegalBlock[];
  clauses?: LegalClause[];
}

/** Cover-sheet details shown above the document body. */
export const DOCUMENT = {
  title: "Master Plush Services, Emotional Infrastructure, and Yarn Sovereignty Agreement",
  entity: "BluePlush Enterprises, Inc. — A Delaware Corporation With Vibes",
  meta: [
    { label: "Document reference", value: "BP-LEGAL-0001-v14.3-FINAL-FINAL-v2-USE-THIS-ONE" },
    { label: "Classification", value: "Confidential / Internal / Please Do Not Screenshot" },
    { label: "Effective date", value: "The moment you stop reading and start shipping" }
  ]
};

/**
 * The full document body, in reading order. Section `id` values double as
 * in-page anchor targets for the table of contents.
 */
export const SECTIONS: LegalSection[] = [
  {
    id: "preamble",
    title: "Preamble",
    intro: [
      {
        kind: "text",
        text: 'THIS MASTER PLUSH SERVICES, EMOTIONAL INFRASTRUCTURE, AND YARN SOVEREIGNTY AGREEMENT (this "Agreement," the "Doc," or, internally, "the thing Brayden made us sign") is entered into as of the Effective Date by and between BluePlush Enterprises, Inc., a Delaware corporation with a principal place of business in a converted mayonnaise factory in Dogpatch and a secondary place of business in the Notes app of its founder ("BluePlush," "Company," "we," "us," or "the movement"), and the undersigned counterparty ("Counterparty," "you," "Partner," or, aspirationally, "Fellow Traveler").'
      },
      {
        kind: "text",
        text: 'WHEREAS the global plush sector has been structurally under-innovated since approximately 1998, a period Company\'s leadership refers to internally as "The Long Sleep";'
      },
      {
        kind: "text",
        text: "WHEREAS the incumbents in said sector have demonstrated a persistent and, frankly, arrogant unwillingness to iterate, ship, or hold a single offsite in Sedona;"
      },
      {
        kind: "text",
        text: "WHEREAS Company has identified a total addressable market consisting of every human being who has ever experienced an emotion, a figure independently modeled at not less than four trillion dollars ($4,000,000,000,000) by a twenty-two-year-old analyst who dropped out of a good school and is, by all accounts, cracked;"
      },
      {
        kind: "text",
        text: 'WHEREAS Company does not consider itself a "toy company," a "stuffed animal company," or a "novelty gifting concern," and reserves the right to correct anyone who says otherwise, including at weddings;'
      },
      {
        kind: "text",
        text: 'WHEREAS Company instead considers itself a builder of emotional infrastructure for the post-attention economy, a phrase which appears in this Agreement eleven (11) times and which no party is permitted to describe as "a bit much";'
      },
      {
        kind: "text",
        text: "WHEREAS the parties wish to memorialize their alignment, their velocity, and their shared refusal to accept a six-week discovery phase;"
      },
      {
        kind: "text",
        text: "NOW, THEREFORE, in consideration of the mutual promises set forth herein, the parties agree as follows, and honestly, let's go."
      }
    ]
  },
  {
    id: "article-i",
    label: "Article I",
    title: "Definitions",
    intro: [
      {
        kind: "text",
        text: "For purposes of this Agreement, the following capitalized terms shall have the meanings set forth below. Terms not defined herein shall have the meaning ascribed to them by whoever is talking loudest in the meeting."
      }
    ],
    clauses: [
      {
        number: "1.1",
        blocks: [
          {
            kind: "text",
            text: '"Plush" means any soft-good article capable of inducing, sustaining, or meaningfully deepening an emotional attachment in a human being. The term expressly excludes: pillows (commodity), throw blankets (undifferentiated), and beanbag chairs (a failed category we do not discuss).'
          }
        ]
      },
      {
        number: "1.2",
        blocks: [
          {
            kind: "text",
            text: '"Emotional Infrastructure" means the full stack of physical, sentimental, and logistical systems by which affection is manufactured, distributed, and retained at scale. Counterparty acknowledges that this is a real thing and shall not raise an eyebrow when it is said aloud.'
          }
        ]
      },
      {
        number: "1.3",
        blocks: [
          {
            kind: "text",
            text: '"The Flywheel" means the following closed loop, which Company considers self-evidently correct: Hug → Attachment → Retention → Lifetime Value → Hug. Counterparty agrees that this is, in fact, the deck.'
          }
        ]
      },
      {
        number: "1.4",
        blocks: [
          {
            kind: "text",
            text: '"The Yarn" means all fibrous input materials, together with the means of their production, the relationships governing their supply, and the spiritual claim Company asserts over same. Company Owns The Yarn. This is not negotiable and has been litigated internally at length.'
          }
        ]
      },
      {
        number: "1.5",
        blocks: [
          {
            kind: "text",
            text: '"Founder Mode" means an operating posture in which the founder may enter any workstream, at any altitude, at any hour, and re-scope it. Founder Mode is not a bug. Founder Mode is the product.'
          }
        ]
      },
      {
        number: "1.6",
        blocks: [
          {
            kind: "text",
            text: '"Velocity" means the rate at which things are shipped, measured in things per week, without adjustment for whether the things were good.'
          }
        ]
      },
      {
        number: "1.7",
        blocks: [
          {
            kind: "text",
            text: '"High-Agency" means the quality of solving a problem without first asking whether you were supposed to. Counterparty represents and warrants that it is High-Agency. Counterparty may be asked to demonstrate this.'
          }
        ]
      },
      {
        number: "1.8",
        blocks: [
          {
            kind: "text",
            text: '"Low-Ego" means the quality of accepting a total strategic reversal on a Friday afternoon without visible facial reaction.'
          }
        ]
      },
      {
        number: "1.9",
        blocks: [
          {
            kind: "text",
            text: '"The Plunge" means the founder\'s cold immersion vessel, maintained at thirty-nine degrees Fahrenheit (39°F), which is hereby designated a satellite office, a decision-making forum, and, per Article XI, a venue for binding dispute resolution.'
          }
        ]
      },
      {
        number: "1.10",
        blocks: [
          {
            kind: "text",
            text: '"So Back" means the state of being, once again, back. Determination of whether the Company is So Back rests solely with the founder and may change intra-day.'
          }
        ]
      },
      {
        number: "1.11",
        blocks: [{ kind: "text", text: '"A Values Mismatch" means a disagreement.' }]
      },
      {
        number: "1.12",
        blocks: [
          {
            kind: "text",
            text: '"Directionally Correct" means incorrect, but in a way that we\'re going to go with for now.'
          }
        ]
      },
      {
        number: "1.13",
        blocks: [
          {
            kind: "text",
            text: '"Let\'s Take That Offline" means the conversation is over and will not resume in any medium.'
          }
        ]
      },
      {
        number: "1.14",
        blocks: [
          {
            kind: "text",
            text: '"Blue Ocean" means a market with no customers in it yet, which Company has elected to interpret optimistically.'
          }
        ]
      },
      {
        number: "1.15",
        blocks: [
          {
            kind: "text",
            text: '"Deliverable" means a thing you said you\'d do, plus one additional thing added during the standup.'
          }
        ]
      },
      {
        number: "1.16",
        blocks: [
          {
            kind: "text",
            text: '"Business Day" means any day. All days are business days. Company does not recognize the weekend as a legal or metaphysical construct, though it does recognize Sunday as a good day for deep work.'
          }
        ]
      },
      {
        number: "1.17",
        blocks: [
          {
            kind: "text",
            text: '"Reasonable" shall be construed in accordance with the founder\'s understanding of the word, which differs materially from the dictionary\'s.'
          }
        ]
      },
      {
        number: "1.18",
        blocks: [{ kind: "text", text: '"The Bottleneck" means whoever is currently being discussed.' }]
      }
    ]
  },
  {
    id: "article-ii",
    label: "Article II",
    title: "Scope of Engagement",
    clauses: [
      {
        number: "2.1",
        heading: "General Scope",
        blocks: [
          {
            kind: "text",
            text: "Counterparty shall provide such goods, services, thought partnership, energy, and general forward-lean as Company may require from time to time, up to and including on holidays that Counterparty personally observes."
          }
        ]
      },
      {
        number: "2.2",
        heading: "Scope Fluidity",
        blocks: [
          {
            kind: "text",
            text: "The parties acknowledge that scope, as traditionally understood, is a legacy concept inherited from the consulting era and is not well suited to a company operating at Company's clock speed. Accordingly, the scope of this engagement shall be understood as directionally fixed and operationally liquid."
          }
        ]
      },
      {
        number: "2.3",
        heading: "Scope Creep",
        blocks: [
          {
            kind: "text",
            text: 'The term "scope creep" is deprecated. The approved term is "emergent surface area," and it is a sign of health.'
          }
        ]
      },
      {
        number: "2.4",
        heading: "The Ask",
        blocks: [
          {
            kind: "text",
            text: "Company shall communicate requirements through Sales, who will communicate them through a Notion page, which will be deleted, and then re-communicated verbally in a hallway. The hallway communication shall control."
          }
        ]
      },
      {
        number: "2.5",
        heading: "Priority Framework",
        blocks: [
          { kind: "text", text: "All work items shall be assigned a priority level from the following schedule:" },
          {
            kind: "table",
            headers: ["Level", "Label", "Meaning"],
            rows: [
              ["P0", "Drop everything", "Due yesterday"],
              ["P1", "Critical path", "Due yesterday"],
              ["P2", "High priority", "Due yesterday"],
              ["P3", "Important", "Due yesterday"],
              ["P4", "Backlog", "Due yesterday, but nobody has said so yet"]
            ]
          },
          {
            kind: "text",
            text: 'Counterparty acknowledges that this schedule is fully consistent and shall not describe it as "just one priority with five names."'
          }
        ]
      }
    ]
  },
  {
    id: "article-iii",
    label: "Article III",
    title: "Deliverables and Sprint Cadence",
    clauses: [
      {
        number: "3.1",
        heading: "Sprint Length",
        blocks: [
          {
            kind: "text",
            text: "Sprints shall be one (1) day in length. A one-week sprint is a vacation. A two-week sprint is a retirement."
          }
        ]
      },
      {
        number: "3.2",
        heading: "Standup",
        blocks: [
          {
            kind: "text",
            text: 'Daily standup shall occur at 5:45 a.m. Pacific and shall not exceed ninety (90) minutes. Standup is called "standup" because sitting is a posture of surrender.'
          }
        ]
      },
      {
        number: "3.3",
        heading: "Shipping Requirement",
        blocks: [
          {
            kind: "text",
            text: 'Counterparty shall ship daily. For the avoidance of doubt, "shipping" includes: shipping a feature, shipping a fix, shipping a doc, shipping a tweet, or shipping a well-received message in the general channel. It does not include planning to ship.'
          }
        ]
      },
      {
        number: "3.4",
        heading: "Definition of Done",
        blocks: [
          {
            kind: "text",
            text: "A Deliverable shall be deemed complete when the founder has seen it and has not immediately reopened it. This state may persist for as little as four (4) minutes and is not warranted to persist longer."
          }
        ]
      },
      {
        number: "3.5",
        heading: "Discovery Phase",
        blocks: [
          {
            kind: "text",
            text: "There is no discovery phase. Requests for a discovery phase shall be treated under Article XII as a potential Values Mismatch. Counterparty may, however, conduct discovery informally, at night, on its own time, and present the findings as though they had always been obvious."
          }
        ]
      },
      {
        number: "3.6",
        heading: "Documentation",
        blocks: [
          {
            kind: "text",
            text: "Documentation shall be maintained comprehensively and shall be considered a P4 (see Section 2.5)."
          }
        ]
      }
    ]
  },
  {
    id: "article-iv",
    label: "Article IV",
    title: "Yarn Sovereignty",
    clauses: [
      {
        number: "4.1",
        heading: "Ownership of the Yarn",
        blocks: [
          {
            kind: "text",
            text: 'Company owns the Yarn. Company shall continue to own the Yarn. Any suggestion that Company should not own the Yarn — including from supply chain consultants, board members, or Counterparty\'s own operations team — shall be met with the following response, which is hereby incorporated by reference: "Respectfully, Apple owns the silicon."'
          }
        ]
      },
      {
        number: "4.2",
        heading: "Vertical Integration",
        blocks: [
          { kind: "text", text: "Company is full-stack, from fiber to feeling. This includes:" },
          {
            kind: "list",
            items: [
              "(a) the growing, shearing, or synthesis of raw fiber;",
              "(b) the spinning of said fiber into Yarn;",
              "(c) the conversion of Yarn into Plush;",
              "(d) the imbuing of Plush with sentimental valence;",
              "(e) the delivery of Plush into the arms of a human being; and",
              "(f) the emotional aftermath, in perpetuity."
            ]
          }
        ]
      },
      {
        number: "4.3",
        heading: "No Outsourcing of Feeling",
        blocks: [
          {
            kind: "text",
            text: "Counterparty shall not subcontract step 4.2(f) to any third party. Feeling is core. Feeling is not a vendor relationship."
          }
        ]
      },
      {
        number: "4.4",
        heading: "Yarn Confidentiality",
        blocks: [
          {
            kind: "text",
            text: "The identity, location, and disposition of Company's Yarn sources constitute the crown jewels of the enterprise and shall be treated with the sensitivity ordinarily afforded to trade secrets, nuclear material, and the founder's Whoop score."
          }
        ]
      }
    ]
  },
  {
    id: "article-v",
    label: "Article V",
    title: "Intellectual Property",
    clauses: [
      {
        number: "5.1",
        heading: "Assignment",
        blocks: [
          {
            kind: "text",
            text: "Counterparty hereby irrevocably assigns to Company all right, title, and interest in and to any and all inventions, designs, patterns, stitch geometries, facial expressions, names, backstories, lore, character arcs, taglines, and emotional frameworks conceived during the term of this Agreement."
          }
        ]
      },
      {
        number: "5.2",
        heading: "Extended Assignment",
        blocks: [
          {
            kind: "text",
            text: "The foregoing assignment shall extend to any such work product conceived by Counterparty:"
          },
          {
            kind: "list",
            items: [
              "(a) during the term;",
              "(b) within ninety (90) days after the term;",
              "(c) in the shower;",
              "(d) in a dream, provided the dream is recalled with sufficient specificity to be reduced to practice; and",
              '(e) at a competitor, if the idea "feels like ours."'
            ]
          }
        ]
      },
      {
        number: "5.3",
        heading: "Lore",
        blocks: [
          {
            kind: "text",
            text: "All character lore is Company property. Counterparty shall not develop unauthorized backstories for any Plush, including sad ones, and particularly not sad ones, which the Brand team has flagged as an area of exposure."
          }
        ]
      },
      {
        number: "5.4",
        heading: "Moral Rights",
        blocks: [
          {
            kind: "text",
            text: "To the extent permitted by applicable law, Counterparty waives all moral rights in the work product. To the extent not permitted by applicable law, Counterparty agrees to feel fine about it anyway."
          }
        ]
      }
    ]
  },
  {
    id: "article-vi",
    label: "Article VI",
    title: "Confidentiality",
    clauses: [
      {
        number: "6.1",
        heading: "Confidential Information",
        blocks: [
          {
            kind: "text",
            text: '"Confidential Information" means all information disclosed by Company, whether or not marked confidential, whether or not actually secret, and whether or not already publicly known, including but not limited to: the roadmap, the deck, the flywheel, the TAM figure, the Yarn, the founder\'s current thesis, the founder\'s previous thesis, and the reasons for the change between them.'
          }
        ]
      },
      {
        number: "6.2",
        heading: "Standard of Care",
        blocks: [
          {
            kind: "text",
            text: "Counterparty shall protect Confidential Information with a degree of care not less than that which it applies to its own most sensitive information, and in no event less than that which the founder applies to the temperature of the Plunge."
          }
        ]
      },
      {
        number: "6.3",
        heading: "Permitted Disclosures",
        blocks: [
          { kind: "text", text: "Counterparty may disclose Confidential Information only:" },
          {
            kind: "list",
            items: [
              "(a) as required by a court of competent jurisdiction; or",
              "(b) on a podcast, if the podcast is a good one and Comms has pre-briefed."
            ]
          }
        ]
      },
      {
        number: "6.4",
        heading: "Screenshots",
        blocks: [{ kind: "text", text: "Counterparty shall not screenshot. This provision survives everything." }]
      }
    ]
  },
  {
    id: "article-vii",
    label: "Article VII",
    title: "Representations and Warranties",
    clauses: [
      {
        number: "7.1",
        heading: "Mutual Representations",
        blocks: [
          {
            kind: "text",
            text: "Each party represents and warrants that it has full power and authority to enter into this Agreement and that it is, at minimum, locked in."
          }
        ]
      },
      {
        number: "7.2",
        heading: "Counterparty Representations",
        blocks: [
          { kind: "text", text: "Counterparty further represents and warrants that:" },
          {
            kind: "list",
            items: [
              "(a) it is High-Agency;",
              "(b) it is Low-Ego;",
              "(c) it operates at Velocity;",
              "(d) it does its best work under conditions that a neutral observer might characterize as adverse;",
              "(e) it has read the deck;",
              "(f) it believes in the mission, not merely the equity;",
              '(g) it will not say "that\'s not my job," in those words or in any functionally equivalent formulation, including sighing; and',
              "(h) it has never worked at a company that had a Chief of Staff to the Chief of Staff."
            ]
          }
        ]
      },
      {
        number: "7.3",
        heading: "Emotional Efficacy Warranty",
        blocks: [
          {
            kind: "text",
            text: "Company warrants that each unit of Plush shall be capable of inducing an emotional response in a reasonable person, provided such person is capable of emotional response. Company disclaims all liability for Plush distributed to persons who are, in the Company's sole judgment, emotionally unavailable."
          }
        ]
      },
      {
        number: "7.4",
        heading: "Disclaimer",
        blocks: [
          {
            kind: "text",
            text: 'EXCEPT AS EXPRESSLY SET FORTH HEREIN, ALL PLUSH IS PROVIDED "AS IS," "AS FELT," AND "AS HUGGED." COMPANY DISCLAIMS ALL IMPLIED WARRANTIES INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR EMOTIONAL PURPOSE, AND NON-INFRINGEMENT OF PRIOR ATTACHMENTS.'
          }
        ]
      },
      {
        number: "7.5",
        heading: "Prior Attachment Disclosure",
        blocks: [
          {
            kind: "text",
            text: "Counterparty shall disclose in writing any pre-existing emotional attachment to a competitor's plush product. Failure to disclose shall constitute a material breach and, more importantly, a betrayal."
          }
        ]
      }
    ]
  },
  {
    id: "article-viii",
    label: "Article VIII",
    title: "Limitation of Liability",
    clauses: [
      {
        number: "8.1",
        heading: "Cap",
        blocks: [
          {
            kind: "text",
            text: "IN NO EVENT SHALL COMPANY'S AGGREGATE LIABILITY UNDER THIS AGREEMENT EXCEED THE GREATER OF (A) ONE HUNDRED DOLLARS ($100), OR (B) ONE (1) UNIT OF PLUSH, SELECTED BY COMPANY, FROM THE CLEARANCE ASSORTMENT."
          }
        ]
      },
      {
        number: "8.2",
        heading: "Exclusion of Consequential Damages",
        blocks: [
          {
            kind: "text",
            text: "NEITHER PARTY SHALL BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, PUNITIVE, OR CONSEQUENTIAL DAMAGES, INCLUDING BUT NOT LIMITED TO: LOST PROFITS, LOST DATA, LOST SLEEP, LOST WEEKENDS, LOST FRIENDSHIPS, OR THE SLOW DAWNING REALIZATION THAT THE FLYWHEEL IS JUST A CIRCLE WITH WORDS ON IT."
          }
        ]
      },
      {
        number: "8.3",
        heading: "Emotional Damages",
        blocks: [
          {
            kind: "text",
            text: 'Company shall not be liable for any emotional harm arising from over-attachment to Plush, under-attachment to Plush, the discontinuation of a Plush line, the retirement of a beloved character, or the "Q3 SKU rationalization event," which remains the subject of ongoing internal review and about which no further comment will be made.'
          }
        ]
      }
    ]
  },
  {
    id: "article-ix",
    label: "Article IX",
    title: "Force Majeure",
    clauses: [
      {
        number: "9.1",
        heading: "Excused Performance",
        blocks: [
          {
            kind: "text",
            text: "Neither party shall be liable for any failure or delay in performance resulting from causes beyond its reasonable control, including:"
          },
          {
            kind: "list",
            items: [
              "(a) acts of God, war, terrorism, pandemic, fire, flood, or embargo;",
              "(b) labor disputes, including in the Yarn supply chain;",
              "(c) a funding round;",
              "(d) a down round;",
              "(e) the founder going on a silent retreat;",
              "(f) the founder returning from a silent retreat with a new thesis;",
              "(g) Mercury being in retrograde, provided such retrograde is confirmed by two (2) independent sources, one of which may be the Head of Brand;",
              "(h) a full company pivot announced by voice memo;",
              "(i) an all-hands that runs long;",
              "(j) the Plunge chiller failing, which shall be treated as a Sev-1 incident with full on-call escalation; and",
              "(k) vibes being off, generally."
            ]
          }
        ]
      },
      {
        number: "9.2",
        heading: "Notice",
        blocks: [
          {
            kind: "text",
            text: "The party invoking force majeure shall provide notice within a reasonable period, or shall simply post about it, which the parties agree constitutes constructive notice."
          }
        ]
      }
    ]
  },
  {
    id: "article-x",
    label: "Article X",
    title: "Term and Termination",
    clauses: [
      {
        number: "10.1",
        heading: "Term",
        blocks: [
          {
            kind: "text",
            text: "This Agreement shall commence on the Effective Date and continue in perpetuity, or until the vibes shift, whichever occurs first."
          }
        ]
      },
      {
        number: "10.2",
        heading: "Termination for Convenience",
        blocks: [
          {
            kind: "text",
            text: "Company may terminate this Agreement at any time, for any reason or no reason, effective immediately, by any of the following methods:"
          },
          {
            kind: "list",
            items: [
              "(a) written notice;",
              "(b) verbal notice;",
              "(c) removal from the relevant Slack channels; or",
              "(d) conspicuous non-invitation to the offsite."
            ]
          }
        ]
      },
      {
        number: "10.3",
        heading: "Termination by Counterparty",
        blocks: [
          {
            kind: "text",
            text: "Counterparty may terminate this Agreement upon one hundred eighty (180) days' written notice, during which period Counterparty shall remain fully engaged, maintain Velocity, document everything, train its replacement, and continue to appear genuinely excited about the mission."
          }
        ]
      },
      {
        number: "10.4",
        heading: "Day One vs. Day Ninety",
        blocks: [
          {
            kind: "text",
            text: "The parties affirm their shared preference for discovering a Values Mismatch on day one rather than day ninety. Notwithstanding the foregoing, the parties acknowledge that in practice such mismatches are almost always discovered on approximately day eighty-seven."
          }
        ]
      },
      {
        number: "10.5",
        heading: "Survival",
        blocks: [
          {
            kind: "text",
            text: "Articles IV (Yarn Sovereignty), V (Intellectual Property), VI (Confidentiality), VIII (Limitation of Liability), XI (Dispute Resolution), and the general feeling that you could have handled that better shall survive termination."
          }
        ]
      }
    ]
  },
  {
    id: "article-xi",
    label: "Article XI",
    title: "Dispute Resolution",
    clauses: [
      {
        number: "11.1",
        heading: "Good Faith Negotiation",
        blocks: [
          {
            kind: "text",
            text: "The parties shall first attempt to resolve any dispute through good faith discussion, conducted on a walk. The walk shall be at a brisk pace. Neither party may bring a laptop."
          }
        ]
      },
      {
        number: "11.2",
        heading: "Escalation",
        blocks: [{ kind: "text", text: "If the walk fails, the dispute shall be escalated to a second, longer walk." }]
      },
      {
        number: "11.3",
        heading: "Binding Plunge Arbitration",
        blocks: [
          {
            kind: "text",
            text: "If the second walk fails, the dispute shall be submitted to binding arbitration conducted in the Plunge (39°F), pursuant to the following procedure:"
          },
          {
            kind: "list",
            items: [
              "(a) both parties shall enter the water simultaneously;",
              "(b) each party shall present its position;",
              "(c) the party who exits the water first shall be deemed to have conceded;",
              "(d) if both parties exit simultaneously, the founder shall decide;",
              "(e) if the founder is a party to the dispute, the founder shall nonetheless decide."
            ]
          }
        ]
      },
      {
        number: "11.4",
        heading: "Waiver of Jury Trial",
        blocks: [
          {
            kind: "text",
            text: "Each party knowingly and voluntarily waives any right to trial by jury, on the grounds that a jury of twelve people deliberating for days is fundamentally incompatible with Company's operating cadence."
          }
        ]
      },
      {
        number: "11.5",
        heading: "Class Action Waiver",
        blocks: [
          {
            kind: "text",
            text: "Disputes shall be brought individually. Collective action is, in the Company's view, the opposite of high agency."
          }
        ]
      }
    ]
  },
  {
    id: "article-xii",
    label: "Article XII",
    title: "Values Alignment",
    clauses: [
      {
        number: "12.1",
        heading: "Cultural Compliance",
        blocks: [
          {
            kind: "text",
            text: "Counterparty shall maintain continuous alignment with Company's stated values, which are:"
          },
          {
            kind: "list",
            items: [
              "(a) Own the Yarn.",
              "(b) Ship or Sit Down.",
              "(c) The Hug Is the Product.",
              "(d) Feelings at Scale.",
              "(e) Cold Water, Warm People.",
              "(f) We Are So Back."
            ]
          }
        ]
      },
      {
        number: "12.2",
        heading: "Values Audit",
        blocks: [
          {
            kind: "text",
            text: "Company may conduct a values audit at any time, without notice, by asking Counterparty a casual-sounding question in a hallway."
          }
        ]
      },
      {
        number: "12.3",
        heading: "Remediation",
        blocks: [
          {
            kind: "text",
            text: 'A determination of Values Mismatch shall be communicated with radical candor, warmth, and immediacy, and shall be accompanied by the phrase "and that\'s okay," which does not soften the determination and should not be read as doing so.'
          }
        ]
      },
      {
        number: "12.4",
        heading: "The Bottleneck Doctrine",
        blocks: [
          {
            kind: "text",
            text: "No party shall be the Bottleneck. In the event that a party is identified as the Bottleneck, that party shall immediately get out of the way, a phrase which shall be construed broadly."
          }
        ]
      }
    ]
  },
  {
    id: "article-xiii",
    label: "Article XIII",
    title: "Miscellaneous",
    clauses: [
      {
        number: "13.1",
        heading: "Governing Law",
        blocks: [
          {
            kind: "text",
            text: "This Agreement shall be governed by the laws of the State of Delaware, except with respect to matters of tone, taste, and vibe, which shall be governed by the laws of Northern California and the personal aesthetic of the founder."
          }
        ]
      },
      {
        number: "13.2",
        heading: "Entire Agreement",
        blocks: [
          {
            kind: "text",
            text: "This Agreement constitutes the entire agreement between the parties and supersedes all prior agreements, understandings, decks, memos, voice notes, whiteboard photographs, and things said at 1:00 a.m. that felt extremely true at the time."
          }
        ]
      },
      {
        number: "13.3",
        heading: "Amendment",
        blocks: [
          {
            kind: "text",
            text: "This Agreement may be amended only in writing signed by both parties, or unilaterally by the founder, in Founder Mode, which the parties agree is a form of writing."
          }
        ]
      },
      {
        number: "13.4",
        heading: "Severability",
        blocks: [
          {
            kind: "text",
            text: "If any provision of this Agreement is held unenforceable, that provision shall be severed and the remainder shall continue in full force. The severed provision shall be quietly re-added in the next version."
          }
        ]
      },
      {
        number: "13.5",
        heading: "Assignment",
        blocks: [
          {
            kind: "text",
            text: "Counterparty may not assign this Agreement. Company may assign this Agreement to anyone, including an entity that does not yet exist but which is described in a slide."
          }
        ]
      },
      {
        number: "13.6",
        heading: "Notices",
        blocks: [
          {
            kind: "text",
            text: "All notices shall be delivered by Slack DM. Notices delivered by email shall be deemed received forty-five (45) days after transmission, if at all. Notices delivered by certified mail shall be deemed a hostile act."
          }
        ]
      },
      {
        number: "13.7",
        heading: "Response Time",
        blocks: [
          { kind: "text", text: "Counterparty shall respond to communications within the following windows:" },
          {
            kind: "table",
            headers: ["Channel", "Response SLA"],
            rows: [
              ["Slack DM", "4 minutes"],
              ["Slack channel mention", "11 minutes"],
              ["Text message", "90 seconds"],
              ["Email", "Not applicable; nobody reads it"],
              ["A message sent from the Plunge", "Immediately, and with enthusiasm"]
            ]
          }
        ]
      },
      {
        number: "13.8",
        heading: "Counterparts",
        blocks: [
          {
            kind: "text",
            text: "This Agreement may be executed in counterparts, each of which shall be deemed an original, and all of which together shall constitute one instrument. A screenshot of a signature shall not be valid, per Section 6.4, which the parties acknowledge creates a circularity that Legal has been asked to look at and will look at eventually."
          }
        ]
      },
      {
        number: "13.9",
        heading: "Headings",
        blocks: [
          {
            kind: "text",
            text: "Headings are for convenience only and do not affect interpretation, except where they are extremely good, in which case they may be excerpted for marketing purposes."
          }
        ]
      },
      {
        number: "13.10",
        heading: "No Waiver",
        blocks: [
          {
            kind: "text",
            text: "Failure to enforce any provision shall not constitute a waiver, and shall in fact be brought up later, at a delicate moment."
          }
        ]
      },
      {
        number: "13.11",
        heading: "Interpretation",
        blocks: [
          {
            kind: "text",
            text: "Ambiguities shall not be construed against the drafting party. Ambiguities shall be construed in favor of whichever reading results in more shipping."
          }
        ]
      }
    ]
  },
  {
    id: "exhibit-a",
    label: "Exhibit A",
    title: "Approved Vocabulary",
    intro: [
      {
        kind: "terms",
        tone: "approved",
        intro: "The following terms are approved for use in all internal and external communications:",
        items: [
          "flywheel",
          "full-stack",
          "vertically integrated",
          "category creation",
          "blue ocean",
          "AI-native",
          "founder mode",
          "high agency",
          "low ego",
          "so back",
          "locked in",
          "shipping",
          "velocity",
          "emotional infrastructure",
          "the hug economy",
          "directionally correct",
          "thesis-driven",
          "LFG"
        ]
      },
      {
        kind: "terms",
        tone: "prohibited",
        intro: "The following terms are prohibited and their use shall constitute a reportable culture incident:",
        items: [
          "toy",
          "stuffed animal",
          "novelty",
          "knickknack",
          '"cute" (as a primary descriptor)',
          '"have we validated this?"',
          '"who is the customer?"',
          '"what\'s the margin?"',
          '"roadmap" (when used to ask for one)',
          "work-life balance",
          "headcount plan",
          '"that\'s a Q3 thing"',
          "sustainable pace"
        ]
      }
    ]
  },
  {
    id: "exhibit-b",
    label: "Exhibit B",
    title: "Schedule of Emotional SLAs",
    intro: [
      {
        kind: "text",
        text: "Company commits to the following service levels with respect to emotional delivery:"
      },
      {
        kind: "table",
        headers: ["Metric", "Target", "Measurement"],
        rows: [
          ["Time to First Hug", "< 8 seconds from unboxing", "Self-reported"],
          ["Attachment Formation Rate", "≥ 94%", "Vibes-based"],
          ["Sentiment Retention (D30)", "≥ 81%", "Directionally correct"],
          ["Separation Anxiety Incidents", "Non-zero (this is good)", "Celebrated in all-hands"],
          ["Named-by-Owner Rate", "≥ 70% within 48 hours", "North star metric"],
          ["Churn (Emotional)", "Not tracked; too painful", "N/A"]
        ]
      },
      {
        kind: "text",
        text: "Counterparty acknowledges that none of the above metrics are instrumented, and that this is a Q4 initiative, and has been a Q4 initiative for three consecutive years."
      }
    ]
  },
  {
    id: "exhibit-c",
    label: "Exhibit C",
    title: "The Flywheel",
    intro: [
      {
        kind: "diagram",
        content: [
          "              ┌──────────┐",
          "        ┌────▶│   HUG    │─────┐",
          "        │     └──────────┘     ▼",
          "   ┌─────────┐          ┌────────────┐",
          "   │   LTV   │          │ ATTACHMENT │",
          "   └─────────┘          └────────────┘",
          "        ▲                      │",
          "        │     ┌──────────┐     │",
          "        └─────│RETENTION │◀────┘",
          "              └──────────┘"
        ].join("\n"),
        caption: "That's it. That's the deck."
      }
    ]
  },
  {
    id: "signature",
    title: "Signature Page",
    intro: [
      {
        kind: "text",
        text: "IN WITNESS WHEREOF, the parties have executed this Agreement as of the Effective Date, in a spirit of mutual alignment, radical candor, and extremely high velocity."
      },
      {
        kind: "signature",
        party: "BluePlush Enterprises, Inc.",
        fields: [
          { label: "By", value: "______________________________" },
          { label: "Name", value: "(signed from the Plunge; signature slightly blurred, deemed valid)" },
          { label: "Title", value: "Founder & Chief Feelings Officer" },
          { label: "Date", value: "5:17 a.m." }
        ]
      },
      {
        kind: "signature",
        party: "Counterparty",
        fields: [{ label: "By" }, { label: "Name" }, { label: "Title" }, { label: "Date" }]
      },
      { kind: "text", text: "Vibe Check (initial here): ________" }
    ]
  }
];

/** Closing notice. Rendered prominently — it is the only operative statement here. */
export const DISCLAIMER =
  "This document is a work of satire. It is not a contract, it does not create a contract, it should not be used as a contract, and no provision herein has any legal effect whatsoever. Any resemblance to actual agreements you have signed is a matter between you and your own decisions.";
