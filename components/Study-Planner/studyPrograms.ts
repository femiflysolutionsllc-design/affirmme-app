// components/Study-Planner/studyPrograms.ts

export type ProgramId =
  | "jr_high"
  | "high_school"
  | "college"
  | "lpn"
  | "rn"
  | "bsn";

export type ProgramType = "nursing" | "school";

export type Program = {
  id: ProgramId;
  label: string;
  description?: string;
  type: ProgramType;
  subjects: string[]; // must match SubjectKey in StudyPlanner.tsx
};

export const PROGRAMS: Program[] = [
  {
    id: "jr_high",
    label: "Jr. High",
    type: "school",
    subjects: [
      "jr_math",
      "jr_english",
      "jr_science",
      "jr_social",
      "custom1",
      "custom2"
    ],
  },
  {
    id: "high_school",
    label: "High School",
    type: "school",
    subjects: [
      "hs_algebra",
      "hs_geometry",      // NEW
      "hs_english",
      "hs_biology",
      "hs_chemistry",     // NEW
      "hs_history",
      "custom1",
      "custom2"
    ],
  },
  {
    id: "college",
    label: "College / Prereqs",
    type: "school",
    subjects: [
      "college_anat",
      "college_micro",
      "college_stats",
      "college_comp",
      "college_chem",     // NEW
      "college_patho",    // NEW
      "custom1",
      "custom2",
      "custom3"
    ],
  },
  {
    id: "lpn",
    label: "LPN",
    type: "nursing",
    description: "12-week LPN roadmap with NCLEX-PN style practice.",
    subjects: [
      "fundamentals",
      "medsurg",
      "pharm",
      "peds",
      "ob",
      "psych",
      "skills",
      "nclex",
    ],
  },
  {
    id: "rn",
    label: "RN",
    type: "nursing",
    description: "RN-level roadmap using the same layout as LPN.",
    subjects: [
      "fundamentals",
      "medsurg",
      "pharm",
      "peds",
      "ob",
      "psych",
      "skills",
      "nclex",
    ],
  },
  {
    id: "bsn",
    label: "BSN",
    type: "nursing",
    description: "BSN planner for advanced courses + NCLEX-RN.",
    subjects: [
      "fundamentals",
      "medsurg",
      "pharm",
      "peds",
      "ob",
      "psych",
      "skills",
      "nclex",
    ],
  },
];