// components/data/lpnRoadmap.ts

export type RoadmapBlock = {
  id: string;
  month: string;
  label: string;
  focus: string;
  tasks: string[];
};

export const LPN_ROADMAP: RoadmapBlock[] = [
  {
    id: "m1w1",
    month: "Month 1",
    label: "Week 1 – Fundamentals Reset",
    focus: "Rebuild your base so everything else feels lighter.",
    tasks: [
      "Review Maslow, ABCs, nursing process (ADPIE) and safety priorities.",
      "Delegation: what RN/LPN/UAP can and cannot do (make a quick chart).",
      "Vital signs: normal ranges + when to call the provider.",
      "Do 10–20 fundamentals NCLEX-style questions with rationales 3–4 days this week.",
    ],
  },
  {
    id: "m1w2",
    month: "Month 1",
    label: "Week 2 – Med-Surg Foundations",
    focus: "Get comfortable with common adult conditions.",
    tasks: [
      "Heart failure: patho, key assessment findings, priority interventions.",
      "Pneumonia: assessment, oxygenation basics, positioning, O2 safety.",
      "Diabetes: hypoglycemia vs hyperglycemia – signs, treatment, teaching.",
      "Do 15–25 Med-Surg questions 3–4 days this week and study every rationale.",
    ],
  },
  {
    id: "m1w3",
    month: "Month 1",
    label: "Week 3 – Fluids, Electrolytes & Labs",
    focus: "Stabilize the lab & fluid knowledge that drives a ton of questions.",
    tasks: [
      "Electrolytes: K⁺, Na⁺, Ca²⁺ – normal ranges and what high/low looks like.",
      "Review BUN, creatinine, Hgb/Hct, WBCs and what to report.",
      "Practice 10–15 questions focused on lab interpretation and fluid balance.",
      "Create one cheat sheet page for labs/electrolytes you can glance at daily.",
    ],
  },
  {
    id: "m1w4",
    month: "Month 1",
    label: "Week 4 – Pharm Basics",
    focus: "Hit the med classes that show up everywhere.",
    tasks: [
      "Insulins: onset, peak, duration (rapid, short, intermediate, long).",
      "Cardiac meds: beta-blockers, ACE inhibitors, diuretics – big side effects.",
      "Antibiotics: key teaching points (finish course, watch for allergies, etc.).",
      "15–25 pharm practice questions a few days this week with rationales.",
    ],
  },
  {
    id: "m2w1",
    month: "Month 2",
    label: "Week 5 – Med-Surg Systems (Cardiac/Resp)",
    focus: "Deepen cardiac and respiratory since they’re high-yield.",
    tasks: [
      "Review CHF, MI, angina – differences, labs, and priority actions.",
      "Respiratory: COPD, asthma, pneumonia, PE – what’s an emergency vs expected.",
      "Practice EKG basics (esp. for potassium imbalances) if it’s tested in your LPN exam.",
      "Do 20–30 questions this week just on cardiac/resp conditions.",
    ],
  },
  {
    id: "m2w2",
    month: "Month 2",
    label: "Week 6 – Med-Surg Systems (Renal/Neuro/GI)",
    focus: "Cover remaining big systems without trying to memorize everything.",
    tasks: [
      "Renal: AKI vs CKD basics, dialysis red flags (access care, hypotension).",
      "Neuro: stroke (FAST), increased ICP signs, seizure precautions.",
      "GI: ulcers vs GERD vs pancreatitis big cues.",
      "15–25 questions this week focused on these body systems.",
    ],
  },
  {
    id: "m2w3",
    month: "Month 2",
    label: "Week 7 – OB / Maternal",
    focus: "Hit high-yield OB that shows constantly.",
    tasks: [
      "Stages of labor, what happens in each, and when to go to the hospital.",
      "Fetal heart rate patterns: early vs late vs variable decels and interventions.",
      "Postpartum assessment (BUBBLE-HE) and PPH emergency actions.",
      "Do 15–20 OB/maternal questions this week and focus on rationales.",
    ],
  },
  {
    id: "m2w4",
    month: "Month 2",
    label: "Week 8 – Pediatrics",
    focus: "Review growth, development and common peds conditions.",
    tasks: [
      "Developmental milestones by age groups (infant, toddler, preschool, school-age, adolescent).",
      "Dehydration signs and basics of peds fluid calculations (at least conceptually).",
      "Common peds resp illnesses: bronchiolitis, croup, asthma priorities.",
      "15–20 peds questions this week with rationales.",
    ],
  },
  {
    id: "m3w1",
    month: "Month 3",
    label: "Week 9 – Psych & Therapeutic Communication",
    focus: "Lock in communication and safety, which help across all subjects.",
    tasks: [
      "Therapeutic communication: what to say vs what NOT to say (practice phrases).",
      "Levels of anxiety & appropriate interventions.",
      "Suicide precautions and safety priorities.",
      "15–20 psych/therapeutic communication questions with rationales.",
    ],
  },
  {
    id: "m3w2",
    month: "Month 3",
    label: "Week 10 – Skills, Labs & Sterile Technique",
    focus: "Tie back to the OR/Trauma tech skills you already know.",
    tasks: [
      "Sterile technique: what breaks sterility and what to do next.",
      "IV complications: infiltration vs phlebitis vs extravasation basics.",
      "Revisit core labs and link them to your Med-Surg conditions.",
      "10–20 questions focused on procedures/skills and lab-based decisions.",
    ],
  },
  {
    id: "m3w3",
    month: "Month 3",
    label: "Week 11 – NCLEX/LPN Strategy & Mixed Practice",
    focus: "Shift from pure content into “how to think on the exam.”",
    tasks: [
      "Review priority frameworks: ABCs, safety, least restrictive, stable vs unstable.",
      "Practice eliminating 2 obviously wrong answers before choosing.",
      "Do one mixed 50-question block this week and deeply review every rationale.",
      "Write down patterns in what you miss (content vs strategy).",
    ],
  },
  {
    id: "m3w4",
    month: "Month 3",
    label: "Week 12 – Final Review & Confidence Week",
    focus: "Lighten the load, review weak spots, protect your mind.",
    tasks: [
      "Pick your 2–3 weakest areas and do short focused review.",
      "Do 1–2 shorter mixed question sets (25–40 each) and review rationales.",
      "Skim your notes/cheat sheets instead of cramming.",
      "Prioritize sleep, water, and gentle movement before exam day.",
    ],
  },
];