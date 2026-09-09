// app/components/data/studyPrograms.ts

export type ProgramId =
  | "jr_high"
  | "high_school"
  | "college"
  | "lpn"
  | "rn"
  | "bsn";

export type ProgramInfo = {
  id: ProgramId;
  label: string;
  shortLabel?: string;
  description: string;
};

export const PROGRAMS: ProgramInfo[] = [
  {
    id: "jr_high",
    label: "Junior High",
    shortLabel: "Jr High",
    description: "Foundations for middle school success.",
  },
  {
    id: "high_school",
    label: "High School",
    shortLabel: "HS",
    description: "Prep for graduation, exams, and next steps.",
  },
  {
    id: "college",
    label: "College / Pre-Nursing",
    shortLabel: "College",
    description: "Core science and study skills for college.",
  },
  {
    id: "lpn",
    label: "LPN",
    description: "12-week LPN roadmap and focused practice.",
  },
  {
    id: "rn",
    label: "RN",
    description: "RN-level content with stronger pathophys & pharm.",
  },
  {
    id: "bsn",
    label: "BSN",
    description: "Advanced nursing, leadership and research.",
  },
];

export type ProgramSubject = {
  id: string;
  label: string;
  description: string;
  suggestions: string[];
};

export type ProgramSubjectsMap = Record<ProgramId, ProgramSubject[]>;

// 👉 You can tweak / expand these suggestions any time
export const PROGRAM_SUBJECTS: ProgramSubjectsMap = {
  jr_high: [
    {
      id: "jr_math",
      label: "Math",
      description: "Fractions, decimals, basic algebra, word problems.",
      suggestions: [
        "Review notes on one topic (fractions, decimals, etc.)",
        "Do 10–15 practice problems from homework or workbook",
        "Correct missed questions and write why you missed them",
      ],
    },
    {
      id: "jr_science",
      label: "Science",
      description: "Basic biology, earth science, experiments.",
      suggestions: [
        "Summarize one section of the chapter in 3–5 bullet points",
        "Draw a quick diagram (e.g., water cycle, cell parts)",
        "Quiz yourself with 5 ‘why/how’ questions",
      ],
    },
    {
      id: "jr_english",
      label: "English / Reading",
      description: "Reading, writing, grammar practice.",
      suggestions: [
        "Read 2–3 pages and write a 3-sentence summary",
        "Highlight new vocabulary and make flashcards",
        "Edit one paragraph for spelling/punctuation",
      ],
    },
    {
      id: "jr_history",
      label: "History",
      description: "Timelines, key events, and causes/effects.",
      suggestions: [
        "Create a mini-timeline for today’s topic",
        "Write one paragraph: ‘Why did this event happen?’",
        "Make 3 Q&As to quiz yourself later",
      ],
    },
    {
      id: "jr_skills",
      label: "Study Skills",
      description: "Organization and habits.",
      suggestions: [
        "Clean/organize your backpack or binder",
        "Plan tomorrow’s homework in 3 bullets",
        "Set one small goal for the week",
      ],
    },
  ],

  high_school: [
    {
      id: "hs_math",
      label: "Algebra / Geometry",
      description: "Equations, functions, shapes, proofs.",
      suggestions: [
        "Review class notes and underline key formulas",
        "Do 10 mixed practice problems",
        "Write a formula sheet on one topic (e.g., linear equations)",
      ],
    },
    {
      id: "hs_science",
      label: "Biology / Chemistry",
      description: "Cells, genetics, reactions, lab skills.",
      suggestions: [
        "Summarize one concept in your own words",
        "Create 5 flashcards (terms + definitions)",
        "Redo 5 missed quiz questions",
      ],
    },
    {
      id: "hs_english",
      label: "English / Literature",
      description: "Essays, novels, analysis.",
      suggestions: [
        "Annotate one page of a text (theme, tone, symbols)",
        "Draft or revise one essay paragraph",
        "Make a character or theme mind-map",
      ],
    },
    {
      id: "hs_history",
      label: "History / Social Studies",
      description: "Key events, civics, critical thinking.",
      suggestions: [
        "Make a cause → effect chart for one event",
        "Write 3 exam-style questions and answer them",
        "Review maps, dates, and vocab together",
      ],
    },
    {
      id: "hs_testprep",
      label: "Test Prep",
      description: "SAT/ACT/end-of-course style questions.",
      suggestions: [
        "Do 5–10 mixed test questions",
        "Review explanations for any misses",
        "Note patterns of mistakes to fix next time",
      ],
    },
  ],

  college: [
    {
      id: "col_a_and_p",
      label: "Anatomy & Physiology",
      description: "Body systems, structures, and functions.",
      suggestions: [
        "Pick 1 system and outline major organs + functions",
        "Draw a simple diagram (e.g., nephron, heart flow)",
        "Do 10 practice questions on that system",
      ],
    },
    {
      id: "col_micro",
      label: "Microbiology",
      description: "Bugs, immunity, lab principles.",
      suggestions: [
        "Summarize one pathogen (spread, symptoms, treatment)",
        "Make flashcards for key terms (e.g., endotoxin, virulence)",
        "Practice 5 questions from your test bank",
      ],
    },
    {
      id: "col_patho",
      label: "Pathophysiology",
      description: "Disease processes and mechanisms.",
      suggestions: [
        "Choose 1 disease and list cause → patho → signs/symptoms",
        "Make a simple ‘normal vs. abnormal’ comparison table",
        "Practice 5 scenario questions",
      ],
    },
    {
      id: "col_study",
      label: "Study Skills & Planning",
      description: "Time blocking and review cycles.",
      suggestions: [
        "Plan 3 focused blocks for the next 2 days",
        "Update your exam calendar and major due dates",
        "Review last exam and note 3 patterns to improve",
      ],
    },
  ],

  lpn: [
    {
      id: "lpn_fund",
      label: "Fundamentals & Safety",
      description: "Vital signs, infection control, basic skills.",
      suggestions: [
        "Write normal ranges for vitals + when to report",
        "Review standard precautions + isolation types",
        "Do 10 safety-focused NCLEX-style questions",
      ],
    },
    {
      id: "lpn_medsurg",
      label: "Med-Surg Foundations",
      description: "Common adult conditions and nursing care.",
      suggestions: [
        "Pick 1 disorder and map patho → assessment → interventions",
        "Review priority labs and what they mean",
        "Practice 10 NCLEX-style questions on that topic",
      ],
    },
    {
      id: "lpn_pharm",
      label: "Pharmacology Basics",
      description: "High-yield drug classes and safety.",
      suggestions: [
        "Choose 1 drug class and list: action, key side effects, teaching",
        "Make flashcards for high-alert meds",
        "Practice dosage calcs or med-safety questions",
      ],
    },
    {
      id: "lpn_maternal",
      label: "OB / Maternal",
      description: "Pregnancy, labor, and postpartum basics.",
      suggestions: [
        "Review stages of labor in your own words",
        "List priority assessments for postpartum patients",
        "Do 5–10 maternity NCLEX questions",
      ],
    },
    {
      id: "lpn_peds",
      label: "Pediatrics",
      description: "Growth, milestones, common pediatric conditions.",
      suggestions: [
        "Review age-specific vital signs and milestones",
        "Pick one pediatric disease and outline care",
        "Do 5–10 peds NCLEX questions",
      ],
    },
    {
      id: "lpn_psych",
      label: "Psych / Mental Health",
      description: "Therapeutic communication and safety.",
      suggestions: [
        "Write 5 therapeutic vs non-therapeutic responses",
        "Review suicide/self-harm priority assessments",
        "Do 5–10 psych NCLEX questions",
      ],
    },
    {
      id: "lpn_skills",
      label: "Skills & Labs",
      description: "Hands-on skills, documentation, simulations.",
      suggestions: [
        "Practice charting 1 mini patient scenario",
        "Review 3 core skills step-by-step",
        "Watch or review 1 skills video and take notes",
      ],
    },
    {
      id: "lpn_nclex",
      label: "NCLEX Strategy",
      description: "Test strategy and mindset.",
      suggestions: [
        "Do one 10-question timed mini-quiz",
        "Review rationales for every question (right and wrong)",
        "Note which topics you need to circle back to",
      ],
    },
  ],

  rn: [
    {
      id: "rn_crit_care",
      label: "Adult / Med-Surg & Critical Care",
      description: "Complex adult conditions and prioritization.",
      suggestions: [
        "Pick 1 system (cardiac, respiratory, neuro) and map priorities",
        "Review ABG or hemodynamic basics",
        "Practice 10 higher-level priority questions",
      ],
    },
    {
      id: "rn_patho",
      label: "Advanced Pathophysiology",
      description: "Deeper mechanism-based understanding.",
      suggestions: [
        "Choose one condition and detail cell/tissue-level changes",
        "Compare 2 similar diseases (e.g., UC vs Crohn’s)",
        "Do 5–10 patho application questions",
      ],
    },
    {
      id: "rn_pharm",
      label: "RN Pharmacology",
      description: "Critical meds, titration, and monitoring.",
      suggestions: [
        "Make a table: drug class → key side effects → labs to watch",
        "Review high-alert meds and safety checks",
        "Do 10 pharm NCLEX-RN questions",
      ],
    },
    {
      id: "rn_lead",
      label: "Leadership & Delegation",
      description: "Scope of practice, delegation, and leadership.",
      suggestions: [
        "Review who you can delegate which tasks to (RN/LPN/UAP)",
        "Practice 5 delegation/assignment questions",
        "Summarize 3 leadership styles in your words",
      ],
    },
  ],

  bsn: [
    {
      id: "bsn_comm",
      label: "Community & Public Health",
      description: "Populations, prevention, and outreach.",
      suggestions: [
        "Outline primary/secondary/tertiary prevention examples",
        "Review 1 community health scenario and priorities",
        "Do 5–10 community NCLEX questions",
      ],
    },
    {
      id: "bsn_research",
      label: "Research & Evidence-Based Practice",
      description: "Understanding studies and applying evidence.",
      suggestions: [
        "Summarize one article in 5 bullets",
        "Identify the PICOT question behind a study",
        "List how findings would change nursing care",
      ],
    },
    {
      id: "bsn_lead",
      label: "Leadership & Management",
      description: "Systems, teams, and quality improvement.",
      suggestions: [
        "Review conflict resolution steps",
        "Outline one QI project idea for a unit",
        "Practice 5 leadership/management questions",
      ],
    },
    {
      id: "bsn_advanced",
      label: "Advanced Med-Surg / Specialty",
      description: "Higher acuity concepts and integration.",
      suggestions: [
        "Choose one specialty topic and make a care map",
        "Review complex labs and monitoring (e.g., sepsis bundle)",
        "Do 10 mixed NCLEX-RN style questions",
      ],
    },
  ],
};