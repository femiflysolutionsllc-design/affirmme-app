// components/data/lpnTopics.ts

export type StudyBlock = {
  id: string;
  week: number;
  area: string;
  focus: string;
};

// Simple ARRAY of topics (not nested, no categories)
export const lpnTopics: StudyBlock[] = [
  {
    id: "w1-fundamentals",
    week: 1,
    area: "Fundamentals & Safety",
    focus: "Vital signs, infection control, standard precautions, handoff",
  },
  {
    id: "w2-fluid-electrolytes",
    week: 2,
    area: "Fluids & Electrolytes",
    focus: "Na/K/Mg/Ca values, dehydration vs overload, IV fluids",
  },
  {
    id: "w3-cardio-respiratory",
    week: 3,
    area: "Cardiac & Respiratory",
    focus: "Heart failure, MI, COPD, asthma, oxygen therapy, EKG basics",
  },
  {
    id: "w4-neuro",
    week: 4,
    area: "Neuro",
    focus: "Stroke, seizures, ICP, neuro assessment",
  },
  {
    id: "w5-endo-renal",
    week: 5,
    area: "Endocrine & Renal",
    focus: "Diabetes, DKA/HHS, thyroid, AKI/CKD",
  },
  {
    id: "w6-gi",
    week: 6,
    area: "GI",
    focus: "Pancreatitis, liver failure, GI bleed, NG tubes",
  },
  {
    id: "w7-obs-peds",
    week: 7,
    area: "OB & Peds",
    focus: "Labor stages, postpartum, PPH, common peds emergencies",
  },
  {
    id: "w8-review",
    week: 8,
    area: "Comprehensive Review",
    focus: "High-yield review and practice questions",
  },
];