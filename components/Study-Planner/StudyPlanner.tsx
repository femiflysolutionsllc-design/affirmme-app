"use client";

import React, { useMemo, useState } from "react";
import { usePersistentState } from "../hooks/usePersistentState";

// ROADMAP + OTHER PANELS
import LpnRoadmap from "./LpnRoadmap";
import RnRoadmap from "./RnRoadmap";
import BsnRoadmap from "./BsnRoadmap";
import TodayFocus from "./TodayFocus";
import StudyTimer from "./StudyTimer";
import WeeklyChecklist from "./WeeklyChecklist";
import MonthlyReview from "./MonthlyReview";
import ProStudyBoost from "./ProStudyBoost";

// PROGRAM DEFINITIONS
import { PROGRAMS, ProgramId } from "./studyPrograms";

// ---------------- TYPES --------------------

type PlannerTab = "roadmap" | "focus" | "review";

type StudyGoal =
  | "unset"
  | "ongoing"
  | "subject_support"
  | "exam_prep"
  | "returning"
  | "certification";

// Nursing-only subjects (for NCLEX + nursing roadmap)
type NursingSubjectKey =
  | "fundamentals"
  | "medsurg"
  | "pharm"
  | "peds"
  | "ob"
  | "psych"
  | "skills"
  | "nclex";

// All subjects, including school tracks + custom
type SubjectKey =
  | NursingSubjectKey
  | "jr_math"
  | "jr_english"
  | "jr_science"
  | "jr_social"
  | "hs_algebra"
  | "hs_geometry"
  | "hs_english"
  | "hs_biology"
  | "hs_chemistry"
  | "hs_history"
  | "college_anat"
  | "college_micro"
  | "college_stats"
  | "college_comp"
  | "college_chem"
  | "college_patho"
  | "custom1"
  | "custom2"
  | "custom3";

  type StudyAction =
  | "explain"
  | "summary"
  | "study_guide"
  | "flashcards"
  | "quiz";

const STUDY_TOOL_OPTIONS: {
  id: StudyAction;
  label: string;
}[] = [
  { id: "explain", label: "Explain Simply" },
  { id: "summary", label: "Quick Summary" },
  { id: "study_guide", label: "Study Guide" },
  { id: "flashcards", label: "Flashcards" },
  { id: "quiz", label: "Practice Quiz" },
];

type CheatSheet = {
  title: string;
  summary: string;
  bullets: string[];
};

type SubjectProgress = {
  completedTopics: string[];
  notes: string;
};

type TutorHistoryItem = { timestamp: string; question: string; answer: string };

type TestQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  selectedIndex?: number | null;
};

type Flashcard = {
  front: string;
  back: string;
};

function parseFlashcards(text: string): Flashcard[] {
  return Array.from(
    text.matchAll(
      /\[FLASHCARD\]\s*Front:\s*([\s\S]*?)\s*Back:\s*([\s\S]*?)\s*\[\/FLASHCARD\]/gi
    )
  )
    .map((match) => ({
      front: match[1].trim(),
      back: match[2].trim(),
    }))
    .filter((card) => card.front && card.back);
}

function parseTutorQuiz(text: string): TestQuestion[] {
  const questionBlocks = Array.from(
    text.matchAll(/\[QUESTION\]([\s\S]*?)\[\/QUESTION\]/gi)
  );

  const parsedQuestions: TestQuestion[] = [];

  questionBlocks.forEach((match) => {
    const block = match[1];

    const question =
      block.match(/^Question:\s*(.+)$/im)?.[1]?.trim() || "";

    const options = ["A", "B", "C", "D"].map(
      (letter) =>
        block
          .match(new RegExp(`^${letter}:\\s*(.+)$`, "im"))?.[1]
          ?.trim() || ""
    );

    const answerLetter =
      block.match(/^Answer:\s*([A-D])/im)?.[1]?.toUpperCase() || "";

    const correctIndex = ["A", "B", "C", "D"].indexOf(answerLetter);

    const explanation =
      block.match(/^Explanation:\s*(.+)$/im)?.[1]?.trim() ||
      "Review the correct answer and try again.";

    if (
      question &&
      options.every(Boolean) &&
      correctIndex >= 0
    ) {
      parsedQuestions.push({
        question,
        options,
        correctIndex,
        explanation,
        selectedIndex: null,
      });
    }
  });

  return parsedQuestions;
}

function FlashcardDeck({ cards }: { cards: Flashcard[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (cards.length === 0) return null;

  const safeIndex = Math.min(currentIndex, cards.length - 1);
  const currentCard = cards[safeIndex];

  function showCard(index: number) {
    const nextIndex = (index + cards.length) % cards.length;
    setCurrentIndex(nextIndex);
    setFlipped(false);
  }

  function shuffleCard() {
    if (cards.length < 2) {
      setFlipped(false);
      return;
    }

    const randomIndex = Math.floor(Math.random() * (cards.length - 1));
    const nextIndex =
      randomIndex >= safeIndex ? randomIndex + 1 : randomIndex;

    setCurrentIndex(nextIndex);
    setFlipped(false);
  }

  function TutorQuizDeck({ questions }: { questions: TestQuestion[] }) {
    const [quizQuestions, setQuizQuestions] =
      useState<TestQuestion[]>(questions);
    const [currentIndex, setCurrentIndex] = useState(0);
  
    const currentQuestion = quizQuestions[currentIndex];
    const answered = currentQuestion.selectedIndex != null;
  
    function selectAnswer(optionIndex: number) {
      if (answered) return;
  
      setQuizQuestions((current) =>
        current.map((question, index) =>
          index === currentIndex
            ? { ...question, selectedIndex: optionIndex }
            : question
        )
      );
    }
  
    const correctCount = quizQuestions.filter(
      (question) =>
        question.selectedIndex != null &&
        question.selectedIndex === question.correctIndex
    ).length;
  
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-emerald-300">
            Question {currentIndex + 1} of {quizQuestions.length}
          </span>
  
          <span className="text-slate-400">
            Score: {correctCount}/{quizQuestions.length}
          </span>
        </div>
  
        <div className="rounded-2xl border border-purple-400 bg-purple-500/10 p-4">
          <p className="text-sm font-semibold text-white">
            {currentQuestion.question}
          </p>
  
          <div className="mt-4 space-y-2">
            {currentQuestion.options.map((option, optionIndex) => {
              const selected =
                currentQuestion.selectedIndex === optionIndex;
              const correct =
                currentQuestion.correctIndex === optionIndex;
  
              let colors =
                "border-slate-700 bg-slate-900 text-slate-100";
  
              if (answered && correct) {
                colors =
                  "border-emerald-400 bg-emerald-500/20 text-emerald-100";
              } else if (answered && selected && !correct) {
                colors =
                  "border-rose-400 bg-rose-500/20 text-rose-100";
              }
  
              return (
                <button
                  key={optionIndex}
                  type="button"
                  onClick={() => selectAnswer(optionIndex)}
                  className={`w-full rounded-xl border px-3 py-2 text-left text-[11px] font-semibold transition ${colors}`}
                >
                  {String.fromCharCode(65 + optionIndex)}. {option}
                </button>
              );
            })}
          </div>
  
          {answered && (
            <p className="mt-4 rounded-xl bg-slate-950/80 p-3 text-[11px] text-slate-200">
              {currentQuestion.explanation}
            </p>
          )}
        </div>
  
        <div className="flex justify-between gap-2">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((current) => current - 1)}
            className="rounded-full border border-slate-700 px-4 py-2 text-[11px] font-semibold text-slate-200 disabled:opacity-40"
          >
            ← Previous
          </button>
  
          <button
            type="button"
            disabled={currentIndex === quizQuestions.length - 1}
            onClick={() => setCurrentIndex((current) => current + 1)}
            className="rounded-full border border-emerald-400 bg-emerald-500/15 px-4 py-2 text-[11px] font-semibold text-emerald-200 disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-semibold text-emerald-300">
          Card {safeIndex + 1} of {cards.length}
        </span>

        <span className="text-slate-400">
          {flipped ? "Answer side" : "Question side"}
        </span>
      </div>

      <button
        type="button"
        onClick={() => setFlipped((current) => !current)}
        className={`flex min-h-64 w-full flex-col items-center justify-center rounded-2xl border-2 p-6 text-center shadow-lg transition ${
          flipped
            ? "border-emerald-300 bg-gradient-to-br from-emerald-500/30 to-teal-500/20"
            : "border-yellow-300 bg-gradient-to-br from-pink-500/40 to-purple-500/40"
        }`}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">
          {flipped ? "Answer" : "Question"}
        </p>

        <p className="mt-4 text-base font-semibold leading-relaxed text-white">
          {flipped ? currentCard.back : currentCard.front}
        </p>

        <p className="mt-6 text-[11px] font-semibold text-yellow-200">
          Tap card to flip
        </p>
      </button>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <button
          type="button"
          onClick={() => showCard(safeIndex - 1)}
          className="rounded-full border border-purple-400 bg-slate-900 px-3 py-2 text-[11px] font-semibold text-slate-100"
        >
          ← Previous
        </button>

        <button
          type="button"
          onClick={() => showCard(safeIndex + 1)}
          className="rounded-full border border-purple-400 bg-slate-900 px-3 py-2 text-[11px] font-semibold text-slate-100"
        >
          Next →
        </button>

        <button
          type="button"
          onClick={shuffleCard}
          className="rounded-full border border-emerald-400 bg-emerald-500/15 px-3 py-2 text-[11px] font-semibold text-emerald-200"
        >
          🔀 Shuffle
        </button>

        <button
          type="button"
          onClick={() => {
            setCurrentIndex(0);
            setFlipped(false);
          }}
          className="rounded-full border border-slate-600 bg-slate-900 px-3 py-2 text-[11px] font-semibold text-slate-300"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

function ZaryxQuizDeck({ questions }: { questions: TestQuestion[] }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const question = questions[currentIndex];
  const selectedIndex = answers[currentIndex];
  const answered = selectedIndex !== undefined;

  const score = questions.reduce(
    (total, item, index) =>
      answers[index] === item.correctIndex ? total + 1 : total,
    0
  );

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-[11px]">
        <span className="font-semibold text-emerald-300">
          Question {currentIndex + 1} of {questions.length}
        </span>
        <span className="text-slate-400">
          Score: {score}/{questions.length}
        </span>
      </div>

      <div className="rounded-2xl border border-purple-400 bg-purple-500/10 p-4">
        <p className="text-sm font-semibold text-white">
          {question.question}
        </p>

        <div className="mt-4 space-y-2">
          {question.options.map((option, optionIndex) => {
            const correct = question.correctIndex === optionIndex;
            const selected = selectedIndex === optionIndex;

            let colors =
              "border-slate-700 bg-slate-900 text-slate-100";

            if (answered && correct) {
              colors =
                "border-emerald-400 bg-emerald-500/20 text-emerald-100";
            } else if (answered && selected) {
              colors =
                "border-rose-400 bg-rose-500/20 text-rose-100";
            }

            return (
              <button
                key={optionIndex}
                type="button"
                disabled={answered}
                onClick={() =>
                  setAnswers((current) => ({
                    ...current,
                    [currentIndex]: optionIndex,
                  }))
                }
                className={`w-full rounded-xl border px-3 py-2 text-left text-[11px] font-semibold ${colors}`}
              >
                {String.fromCharCode(65 + optionIndex)}. {option}
              </button>
            );
          })}
        </div>

        {answered && (
          <p className="mt-4 rounded-xl bg-slate-950/80 p-3 text-[11px] text-slate-200">
            {question.explanation}
          </p>
        )}
      </div>

      <div className="flex justify-between gap-2">
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((current) => current - 1)}
          className="rounded-full border border-slate-700 px-4 py-2 text-[11px] disabled:opacity-40"
        >
          ← Previous
        </button>

        <button
          type="button"
          disabled={currentIndex === questions.length - 1}
          onClick={() => setCurrentIndex((current) => current + 1)}
          className="rounded-full border border-emerald-400 px-4 py-2 text-[11px] text-emerald-200 disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

const STUDY_GOALS: {
  id: Exclude<StudyGoal, "unset">;
  title: string;
  description: string;
}[] = [
  {
    id: "ongoing",
    title: "Keep Up With Classes",
    description: "Build an ongoing weekly routine around current classes.",
  },
  {
    id: "subject_support",
    title: "Improve a Subject",
    description: "Give extra attention to one difficult subject or skill.",
  },
  {
    id: "exam_prep",
    title: "Prepare for an Exam",
    description: "Create a plan around an exam type and test date.",
  },
  {
    id: "returning",
    title: "Return to School",
    description: "Refresh important material before beginning school again.",
  },
  {
    id: "certification",
    title: "Complete a Certification",
    description: "Build a focused plan for a license or certification.",
  },
];

// --------------- LABELS --------------------

const SUBJECT_LABELS: Record<SubjectKey, string> = {
  fundamentals: "Fundamentals",
  medsurg: "Med-Surg",
  pharm: "Pharmacology",
  peds: "Pediatrics",
  ob: "OB / Maternal",
  psych: "Psych",
  skills: "Skills & Labs",
  nclex: "NCLEX Strategy",

  jr_math: "Jr. High · Math",
  jr_english: "Jr. High · English",
  jr_science: "Jr. High · Science",
  jr_social: "Jr. High · Social Studies",

  hs_algebra: "HS · Algebra",
  hs_geometry: "HS · Geometry",
  hs_english: "HS · English",
  hs_biology: "HS · Biology",
  hs_chemistry: "HS · Chemistry",
  hs_history: "HS · History",

  college_anat: "College · A&P",
  college_micro: "College · Microbiology",
  college_stats: "College · Statistics",
  college_comp: "College · Comp / Writing",
  college_chem: "College · Chemistry",
  college_patho: "College · Pathophysiology",

  custom1: "Custom Subject 1",
  custom2: "Custom Subject 2",
  custom3: "Custom Subject 3",
};

// 👉 Nursing-only prompts (NCLEX generation)
const SUBJECT_PROMPTS: Record<NursingSubjectKey, string> = {
  fundamentals:
    "LPN-level fundamentals: Maslow, ADPIE, delegation, vital signs, safety, infection control.",
  medsurg:
    "LPN-level adult med-surg: heart failure, COPD, pneumonia, diabetes, post-op complications, fluid balance.",
  pharm:
    "LPN-level pharmacology: insulins, cardiac meds, anticoagulants, antibiotics, high-risk meds.",
  peds:
    "LPN-level pediatrics: milestones, dehydration, respiratory illnesses, pediatric vital signs and safety.",
  ob:
    "LPN-level OB/maternal: labor, fetal heart monitoring, postpartum assessment, preeclampsia, PPH.",
  psych:
    "LPN-level mental health: therapeutic communication, anxiety levels, suicide precautions, hallucinations and safety.",
  skills:
    "LPN-level skills & labs: sterile technique, IV complications, wound care, safety precautions, basic lab interpretation.",
  nclex:
    "NCLEX-PN style mixed questions covering fundamentals, med-surg, pharm, OB, peds, psych, and skills.",
};

// --------------- EXAMPLE FOCUS BLOCKS --------------------

const EXAMPLE_BLOCKS: Record<SubjectKey, string[]> = {
  fundamentals: [
    "Maslow’s hierarchy & priority questions",
    "ADPIE (nursing process) – know what step each action is",
    "Vital signs norms & when to call the provider",
    "Delegation – what UAP / LPN / RN can and cannot do",
  ],
  medsurg: [
    "Heart failure vs COPD vs pneumonia priority findings",
    "Diabetes – hypo vs hyperglycemia signs and treatment",
    "Pain assessment & when pain is an emergency vs expected",
    "Post-op complications: bleeding, infection, PE, DVT",
  ],
  pharm: [
    "Insulins – onset, peak, duration (rapid, short, intermediate, long)",
    "Cardiac meds: beta-blockers, ACE inhibitors, diuretics – safety checks",
    "Antibiotics – allergies, culture before antibiotics, finish the course",
    "High-risk meds: anticoagulants, opioids, electrolytes (K⁺, Mg²⁺)",
  ],
  peds: [
    "Developmental milestones by age group",
    "Dehydration signs & oral vs IV rehydration",
    "Common resp illnesses: bronchiolitis, croup, asthma priorities",
    "Peds VS ranges and when they’re red flags",
  ],
  ob: [
    "Stages of labor & when to come to the hospital",
    "Fetal heart rate patterns – early vs late vs variable decels",
    "Postpartum assessment (BUBBLE-HE) & PPH emergencies",
    "Magnesium sulfate, preeclampsia, seizure precautions",
  ],
  psych: [
    "Therapeutic vs non-therapeutic communication phrases",
    "Levels of anxiety & matching interventions",
    "Suicide precautions & safety contracts",
    "Priority with hallucinations / delusions / mania",
  ],
  skills: [
    "Sterile technique – what breaks sterility & what to do next",
    "IV complications: infiltration vs phlebitis vs extravasation",
    "Wound care basics & drainage types",
    "Safety skills: restraints, fall precautions, seizure precautions",
  ],
  nclex: [
    "Priority frameworks: ABCs, safety, least restrictive, stable vs unstable",
    "How to eliminate 2 wrong answers first",
    "Re-word the question in your own words before answering",
    "Look for what the nurse does FIRST vs what is also correct",
  ],

  jr_math: [
    "Fractions, decimals, and percentages – convert between them",
    "Ratios and proportions – set up equal fractions and solve",
    "Basic equations with one variable (solve for x)",
    "Word problems: highlight key numbers and the question",
  ],
  jr_english: [
    "Identify subject + predicate in simple sentences",
    "Practice parts of speech (noun, verb, adjective, adverb)",
    "Read one short passage and find the main idea",
    "Write one paragraph: topic sentence, 2–3 details, closing sentence",
  ],
  jr_science: [
    "States of matter (solid, liquid, gas) + examples",
    "Physical vs chemical changes – same substance or new one?",
    "Label parts of a simple cell (plant vs animal)",
    "Learn one mini-topic: force & motion, energy, or ecosystems",
  ],
  jr_social: [
    "Review geography: continents, oceans, and your current region",
    "Timeline practice: put 3–5 events in order",
    "Summarize one historical event in 3–4 sentences",
    "Branches of government and what each does",
  ],

  hs_algebra: [
    "Solve 5 linear equations (one variable, maybe with fractions)",
    "Graph y = mx + b and identify slope + y-intercept",
    "Practice solving systems (substitution or elimination)",
    "Quadratic basics: identify a, b, c and if the parabola opens up/down",
  ],
  hs_geometry: [
    "Types of angles (acute, right, obtuse) and triangle angle sum = 180°",
    "Special right triangles (30-60-90, 45-45-90) side ratios",
    "Perimeter and area problems for polygons/circles",
    "Coordinate geometry: slope, distance, midpoint between two points",
  ],
  hs_english: [
    "Read one page and annotate: main idea + unknown words",
    "Practice thesis statements for argumentative essays",
    "Review MLA / APA basics for citations",
    "Edit one paragraph for grammar and clarity",
  ],
  hs_biology: [
    "Cell structure: nucleus, mitochondria, membrane – main functions",
    "Photosynthesis vs cellular respiration – inputs/outputs",
    "Basic genetics: Punnett square with dominant/recessive traits",
    "Pick one body system and list 3–4 key organs + functions",
  ],
  hs_chemistry: [
    "Common element symbols and charges for basic ions",
    "Balance 3–5 simple chemical equations",
    "Identify reactants vs products and reaction types",
    "Periodic table trends: groups, periods, metals vs nonmetals",
  ],
  hs_history: [
    "Create a mini timeline for the current unit (5 events)",
    "Compare two key people/events in a T-chart",
    "Practice cause vs effect for one major event",
    "Define 5 key vocab terms and use each in a sentence",
  ],

  college_anat: [
    "Review one body system: major organs + main functions",
    "Learn 5–10 new anatomy terms with flashcards/diagrams",
    "Practice directional terms (proximal, distal, anterior, posterior)",
    "Sketch a quick diagram and label main structures",
  ],
  college_micro: [
    "Differentiate bacteria vs viruses vs fungi in a table",
    "Review one major pathogen and the disease it causes",
    "Types of immunity: innate vs adaptive, active vs passive",
    "Match lab tests (Gram stain, culture) with what they show",
  ],
  college_stats: [
    "Review mean, median, mode, range, standard deviation",
    "Interpret one simple graph or table",
    "Identify independent vs dependent variables in a scenario",
    "Practice a few probability or normal distribution problems",
  ],
  college_comp: [
    "Outline a paragraph: topic sentence + 3 supporting points",
    "Revise a paragraph focusing only on clarity and flow",
    "Check grammar: subject-verb agreement and commas",
    "Write a short intro and conclusion for a paper topic",
  ],
  college_chem: [
    "Review atomic structure: protons, neutrons, electrons, isotopes",
    "Do moles ↔ grams conversions using molar mass",
    "Balance a few reactions and find a limiting reactant",
    "Review acid–base basics and the pH scale",
  ],
  college_patho: [
    "Pick one body system and list 3 common diseases + key patho",
    "Map risk factors → pathophysiology → main signs/symptoms",
    "Connect lab abnormalities with organ dysfunction",
    "Explain one disease in simple language like to a patient",
  ],

  custom1: [
    "List 3–4 topics you need to review for this class",
    "Do one short review block (re-read notes or watch a video)",
    "Work 3–5 practice problems or examples",
    "Write a 1–2 sentence summary of what you learned",
  ],
  custom2: [
    "Pick one weak concept/chapter and focus only on that",
    "Create a mini cheat sheet: key formulas or terms",
    "Do a few practice questions and mark misses",
    "Note patterns in mistakes to ask for help later",
  ],
  custom3: [
    "Review the objectives or syllabus for this class",
    "Make flashcards for key definitions or formulas",
    "Test yourself without notes, then check what you missed",
    "Update your cheat sheet based on what you got wrong",
  ],
};

// --------------- CHEAT SHEETS --------------------

const CHEAT_SHEETS: Record<SubjectKey, CheatSheet> = {
  // nursing
  fundamentals: {
    title: "Fundamentals – Core Priority Frameworks",
    summary:
      "Use Maslow, ADPIE, vital signs, and safe delegation to decide who you see first and what you do next.",
    bullets: [
      "Maslow: physiologic needs first (airway, breathing, circulation, oxygen, nutrition, elimination, temp).",
      "ADPIE: assess first, then diagnose, plan, implement, evaluate – don’t jump to interventions.",
      "Do not delegate assessment, teaching, or evaluation. UAP = stable ADLs; LPN = stable pts and reinforce teaching; RN = unstable and new admissions.",
    ],
  },
  medsurg: {
    title: "Med-Surg – High-Yield Adult Conditions",
    summary:
      "Know what findings are expected vs emergencies and which actions protect life first.",
    bullets: [
      "Heart failure: weight gain, crackles, edema, orthopnea. Emergency: pink frothy sputum, severe SOB.",
      "Resp: watch work of breathing, mental status, and O₂ sat; high O₂ in COPD only if ordered.",
      "Diabetes: cold/clammy = hypoglycemia (give sugar); hot/dry = hyperglycemia. Check glucose before insulin.",
    ],
  },
  pharm: {
    title: "Pharmacology – Must-Know Safety Pieces",
    summary:
      "Know what the drug should do, what labs to watch, and when to stop/call the provider.",
    bullets: [
      "Insulins: match onset with meals; check glucose before giving.",
      "Beta-blockers/CCBs can drop HR/BP – hold for low HR or soft BP and call provider.",
      "Anticoagulants: monitor bleeding signs; check INR (warfarin) and aPTT (heparin).",
    ],
  },
  peds: {
    title: "Pediatrics – Growth, Vitals, and Hydration",
    summary:
      "Kids compensate for a long time, then crash. Behavior + breathing + hydration tell you a lot.",
    bullets: [
      "Watch for regression or loss of milestones.",
      "Dehydration: no tears, dry mucosa, sunken fontanel, ↓ wet diapers.",
      "Resp distress: nasal flaring, retractions, grunting, tripod position = emergency.",
    ],
  },
  ob: {
    title: "OB / Maternal – Labor, Fetal Heart, Postpartum",
    summary:
      "Safety for mom and baby comes from reading the strip and watching bleeding/BP.",
    bullets: [
      "Late decels = uteroplacental insufficiency – reposition, O₂, stop oxytocin, increase fluids, call provider.",
      "PPH: heavy bleeding, boggy uterus, tachycardia, falling BP – massage fundus, call provider.",
      "Preeclampsia: headache, vision changes, epigastric pain, high BP, proteinuria; seizure precautions + mag sulfate.",
    ],
  },
  psych: {
    title: "Psych – Therapeutic Communication & Safety",
    summary:
      "Often the safest answer is what you say, not what you do physically.",
    bullets: [
      "Use open-ended, non-judgmental phrases; avoid “why” questions and false reassurance.",
      "Suicide risk: ask directly about plan, means, intent; never leave high-risk clients alone.",
      "Hallucinations: acknowledge feelings without agreeing; gently reorient and redirect.",
    ],
  },
  skills: {
    title: "Skills & Labs – Sterility and Bedside Safety",
    summary:
      "Small steps (hand hygiene, sterile technique, checking labs) prevent big complications.",
    bullets: [
      "Anything below the waist, turned away from, or wet on a sterile field is contaminated.",
      "Stop an IV infusion if infiltration, extravasation, or phlebitis is suspected before calling.",
      "Trends in labs are key – compare to baseline and watch up/down patterns.",
    ],
  },
  nclex: {
    title: "NCLEX Strategy – How to Think on the Exam",
    summary:
      "You’re choosing the safest, most directly helpful action, not just recalling facts.",
    bullets: [
      "Use ABCs, safety, least restrictive, most stable first, and Maslow together.",
      "If two answers are similar, both are usually wrong; pick the one that actually helps the patient.",
      "Re-word the stem: “What is the nurse really being asked to do?” then answer that.",
    ],
  },

  // --- Jr High ---
  jr_math: {
    title: "Jr. High Math – Fractions, Ratios, and Equations",
    summary:
      "Mastering fractions, ratios, and simple equations makes all later math easier.",
    bullets: [
      "Convert between fractions, decimals, and percentages.",
      "Set up proportions as equal fractions and cross-multiply.",
      "Undo operations to solve one-step equations.",
    ],
  },
  jr_english: {
    title: "Jr. High English – Sentences and Reading Skills",
    summary:
      "Strong reading and writing come from clear sentence structure and main ideas.",
    bullets: [
      "Every sentence needs a subject + predicate.",
      "Main idea = what the text is mostly about; details support it.",
      "Paragraphs: topic sentence → details → closing sentence.",
    ],
  },
  jr_science: {
    title: "Jr. High Science – Matter, Cells, and Basic Forces",
    summary:
      "Focus on vocab and recognizing examples in real life.",
    bullets: [
      "Know properties of solids, liquids, gases.",
      "Physical vs chemical change: new substance or not?",
      "Basic cell parts and their functions.",
    ],
  },
  jr_social: {
    title: "Jr. High Social Studies – Timelines & Civics",
    summary:
      "Understand when events happened and how government is structured.",
    bullets: [
      "Use timelines to keep events in order.",
      "Identify causes and effects of major events.",
      "Know the three branches of government and their roles.",
    ],
  },

  // --- High School ---
  hs_algebra: {
    title: "High School Algebra – Lines and Equations",
    summary:
      "Algebra is about writing/solving equations and understanding graphs.",
    bullets: [
      "Slope-intercept form: y = mx + b (m = slope, b = intercept).",
      "Solve linear equations by isolating x.",
      "Check your solution by plugging it back in.",
    ],
  },
  hs_geometry: {
    title: "High School Geometry – Shapes, Angles, and Proofs",
    summary:
      "Geometry studies relationships between shapes and angles.",
    bullets: [
      "Triangle angles sum to 180°; special right triangles have fixed ratios.",
      "Parallel lines create equal corresponding and alternate interior angles.",
      "Mark given equal angles/segments on diagrams to help with proofs.",
    ],
  },
  hs_english: {
    title: "High School English – Reading and Essay Basics",
    summary:
      "Good essays have a clear thesis and evidence from the text.",
    bullets: [
      "Thesis = main claim; each paragraph should support it.",
      "Explain why each quote matters; don’t just drop it in.",
      "Plan with a quick outline before writing.",
    ],
  },
  hs_biology: {
    title: "High School Biology – Cells, Genetics, Systems",
    summary:
      "Link structures to functions and understand how systems work together.",
    bullets: [
      "Nucleus = control center; mitochondria = energy; membrane = gatekeeper.",
      "Punnett squares show probability of traits, not guarantees.",
      "Body systems support each other (resp + cardio, etc.).",
    ],
  },
  hs_chemistry: {
    title: "High School Chemistry – Atoms, Reactions, and the Table",
    summary:
      "Understand atoms, bonding, and the periodic table so equations make sense.",
    bullets: [
      "Atomic number = protons; mass ≈ protons + neutrons.",
      "Groups share properties (noble gases, halogens, alkali metals).",
      "Balance equations with coefficients only, not subscripts.",
    ],
  },
  hs_history: {
    title: "High School History – Cause, Effect, and Themes",
    summary:
      "History is patterns of causes and effects over time.",
    bullets: [
      "For each event: causes → event → short- and long-term effects.",
      "Compare two eras/people by similarities and differences.",
      "Use timelines and maps together for when + where.",
    ],
  },

  // --- College / prereqs ---
  college_anat: {
    title: "College A&P – Systems and Terminology",
    summary:
      "You’re learning a new language of the body; repetition + diagrams are key.",
    bullets: [
      "Group info by system instead of random facts.",
      "Directional terms describe precise locations.",
      "Practice labeling blank diagrams from memory.",
    ],
  },
  college_micro: {
    title: "College Microbiology – Bugs, Immunity, and Labs",
    summary:
      "Compare microbes, immune responses, and lab tests.",
    bullets: [
      "Tables: bacteria vs viruses vs fungi vs parasites.",
      "Link pathogens to diseases and transmission routes.",
      "Match lab tests to what they reveal.",
    ],
  },
  college_stats: {
    title: "College Statistics – Data and Interpretation",
    summary:
      "Focus on what numbers mean, not just formulas.",
    bullets: [
      "Choose mean vs median depending on outliers.",
      "Read graph titles, axes, and units carefully.",
      "Remember correlation ≠ causation.",
    ],
  },
  college_comp: {
    title: "College Composition – Clear Academic Writing",
    summary:
      "Good papers are organized, supported, and easy to follow.",
    bullets: [
      "Each paragraph = one main idea tied to your thesis.",
      "Use transitions (however, therefore, in addition).",
      "Revise at least once just for clarity.",
    ],
  },
  college_chem: {
    title: "College Chemistry – Moles, Reactions, and Solutions",
    summary:
      "Moles and stoichiometry are the backbone of gen chem.",
    bullets: [
      "1 mol = 6.02×10²³ particles; use molar mass for g ↔ mol.",
      "Use mole ratios from balanced equations for stoichiometry.",
      "Remember M₁V₁ = M₂V₂ for simple dilutions.",
    ],
  },
  college_patho: {
    title: "College Pathophysiology – From Cause to Complication",
    summary:
      "Patho connects risk factors, organ changes, and what you see at the bedside.",
    bullets: [
      "Track: etiology → pathophysiology → manifestations.",
      "Link labs/imaging to underlying organ damage.",
      "Flow charts help: risk factors → damage → symptoms → complications.",
    ],
  },

  // --- Custom subjects ---
  custom1: {
    title: "Custom Subject 1 – Your Personal Study Space",
    summary:
      "Use this for any extra class (ex: Geometry, Spanish, or an elective).",
    bullets: [
      "Write key formulas, rules, or definitions.",
      "Add 2–3 common mistakes and how to avoid them.",
      "Update after quizzes/tests when you see patterns.",
    ],
  },
  custom2: {
    title: "Custom Subject 2 – Extra Class or Elective",
    summary:
      "Another flexible slot for any course you want.",
    bullets: [
      "List the most important vocabulary/terms.",
      "Add a quick summary of each unit/chapter.",
      "Track big project/exam dates here.",
    ],
  },
  custom3: {
    title: "Custom Subject 3 – Open Study Slot",
    summary:
      "Use this for tutoring, test prep, or a future class.",
    bullets: [
      "What do I need to remember? What do I keep forgetting?",
      "Create a tiny checklist for how to study this subject.",
      "Note links, page numbers, or resources that help.",
    ],
  },
};


// --------------- VOICE READER --------------------

function speakCheatSheet(sheet: CheatSheet) {
  if (typeof window === "undefined") return;
  const synth = window.speechSynthesis;
  if (!synth) {
    alert("Voice playback is not supported on this device or browser.");
    return;
  }

  synth.cancel();

  const text = `${sheet.title}. ${sheet.summary}. ${sheet.bullets.join(". ")}`;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.95;
  utterance.pitch = 1.0;

  synth.speak(utterance);
}

// --------------- MAIN COMPONENT --------------------

export default function StudyPlanner() {
  // Program selection
  const [activeProgram, setActiveProgram] = usePersistentState<ProgramId | "unset">(
    "planner_program_v1",
    "unset"
  );

  const [activeTab, setActiveTab] = usePersistentState<PlannerTab>("planner_tab", "roadmap");

  const [studyGoal, setStudyGoal] =
  usePersistentState<StudyGoal>(
    "planner_study_goal_v1",
    "unset"
  );

  const [selectedSubject, setSelectedSubject] = usePersistentState<SubjectKey>(
    "planner_subject",
    "fundamentals"
  );

  const [readingSubject, setReadingSubject] = useState<SubjectKey | null>(null);

  // Subject progress per subject
  const [subjectProgress, setSubjectProgress] = usePersistentState<Record<SubjectKey, SubjectProgress>>(
    "subject_progress_v2",
    {} as any
  );

  // User-editable labels
  const [subjectLabels, setSubjectLabels] = usePersistentState<Record<SubjectKey, string>>(
    "subject_labels_v1",
    SUBJECT_LABELS
  );

  // Subject helper text per subject
  const [helperNotes, setHelperNotes] = usePersistentState<Record<SubjectKey, string>>(
    "subject_helper_v1",
    {} as any
  );
  const [helperListening, setHelperListening] = useState(false);

  // Attachments per subject (front-end only)
  const [helperAttachments, setHelperAttachments] = useState<Record<SubjectKey, string | null>>(
    {} as any
  );

  // NCLEX practice state
  const [questions, setQuestions] = useState<string[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionsError, setQuestionsError] = useState<string | null>(null);

  // Tutor state
  const [tutorLoading, setTutorLoading] = useState(false);
  const [tutorError, setTutorError] = useState<string | null>(null);
  const [tutorResponse, setTutorResponse] = useState<string>("");

  const [studyAction, setStudyAction] =
  useState<StudyAction>("explain");

const [quizCount, setQuizCount] =
  useState<5 | 10 | 20>(5);

  // Tutor history per subject
  const [tutorHistory, setTutorHistory] = usePersistentState<Record<SubjectKey, TutorHistoryItem[]>>(
    "subject_tutor_history_v1",
    {} as any
  );

  // Test mode state
  const [testQuestions, setTestQuestions] = useState<TestQuestion[]>([]);
  const [loadingTest, setLoadingTest] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [showTestMode, setShowTestMode] = useState(false);

  // ----- Derived: program + subjects -----
  const programInfo =
    PROGRAMS.find((p) => p.id === activeProgram) ?? PROGRAMS.find((p) => p.id === "lpn")!;
  const isNursingProgram = programInfo.type === "nursing";

  const programSubjects = (programInfo.subjects as SubjectKey[]) || [];
  const availableSubjects: SubjectKey[] = programSubjects.length
    ? programSubjects
    : (Object.keys(SUBJECT_LABELS) as SubjectKey[]);

  const currentSubject: SubjectKey = availableSubjects.includes(selectedSubject)
    ? selectedSubject
    : availableSubjects[0];

  const currentProgress: SubjectProgress =
    subjectProgress[currentSubject] || { completedTopics: [], notes: "" };

  const helperText: string = helperNotes[currentSubject] ?? "";

  // Coach note
  const coachNoteForThisWeek =
    "Your brain sounds tired. Before worrying about content, protect one basic thing tonight: sleep, water, or a quiet 20-minute reset. Re-score after your next few study blocks and see how your percentage changes.";

  // Smart suggestion (fewest completed topics)
  const suggestedSubject: SubjectKey | null = useMemo(() => {
    if (!programSubjects.length) return null;
    if (programSubjects.length === 1) return null;

    let best: SubjectKey | null = null;
    let bestCount = Infinity;

    programSubjects.forEach((subject) => {
      const progress = subjectProgress[subject] || { completedTopics: [], notes: "" };
      const count = progress.completedTopics.length;

      if (subject !== currentSubject && count < bestCount) {
        best = subject;
        bestCount = count;
      }
    });

    return best;
  }, [programSubjects, subjectProgress, currentSubject]);

  const parsedFlashcards = useMemo(
    () => parseFlashcards(tutorResponse),
    [tutorResponse]
  );

  const parsedTutorQuiz = useMemo(
    () => parseTutorQuiz(tutorResponse),
    [tutorResponse]
  );

  // Tutor prompt preview
  const aiTutorPrompt = `You are my personal tutor helping me with ${
    subjectLabels[currentSubject] ?? SUBJECT_LABELS[currentSubject]
  } at the ${programInfo.label} level.

Here is what I am struggling with:
"${
    helperText?.trim() ||
    "I haven’t written anything specific yet. Please review the most important concepts I should focus on and give me a simple explanation."
  }"

Please explain step-by-step in simple language, then:
1) Give a short summary
2) Give 2–3 practice questions
3) Provide answers + brief rationales.`;

  // --------- helper functions ----------

  function toggleTopic(subject: SubjectKey, topic: string) {
    setSubjectProgress((prev) => {
      const current = prev[subject] || { completedTopics: [], notes: "" };
      const exists = current.completedTopics.includes(topic);
      const updated = exists
        ? current.completedTopics.filter((t) => t !== topic)
        : [...current.completedTopics, topic];

      return { ...prev, [subject]: { ...current, completedTopics: updated } };
    });
  }

  function updateNotes(subject: SubjectKey, value: string) {
    setSubjectProgress((prev) => {
      const current = prev[subject] || { completedTopics: [], notes: "" };
      return { ...prev, [subject]: { ...current, notes: value } };
    });
  }

  function updateHelperText(value: string) {
    setHelperNotes((prev) => ({ ...prev, [currentSubject]: value }));
  }

  function handleHelperVoiceInput() {
    if (typeof window === "undefined") return;

    const anyWindow = window as any;
    const SpeechRecognitionClass = anyWindow.SpeechRecognition || anyWindow.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      alert("Voice input is not supported on this device or browser.");
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setHelperListening(true);
    recognition.onend = () => setHelperListening(false);
    recognition.onerror = () => setHelperListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript as string;
      setHelperNotes((prev) => {
        const existing = prev[currentSubject] ?? "";
        const spaced =
          existing.length === 0
            ? transcript
            : existing.trimEnd() + (existing.endsWith(".") ? " " : ". ") + transcript;

        return { ...prev, [currentSubject]: spaced };
      });
    };

    recognition.start();
  }

  function handleReadCheatSheet(subject: SubjectKey) {
    const sheet = CHEAT_SHEETS[subject];
    if (!sheet) return;
    setReadingSubject(subject);
    speakCheatSheet(sheet);
    setTimeout(() => setReadingSubject(null), 4000);
  }

  function handleRenameSubject() {
    const currentLabel = subjectLabels[currentSubject] ?? "";
    const newLabel = window.prompt(
      "New name for this subject (example: Geometry, Chemistry, Spanish):",
      currentLabel
    );
    if (!newLabel) return;

    setSubjectLabels((prev) => ({ ...prev, [currentSubject]: newLabel.trim() }));
  }

  function handleHelperImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setHelperAttachments((prev) => ({ ...prev, [currentSubject]: file.name }));
  }

  // --------- AI Tutor + Test + PDF ----------

  async function handleAskTutor() {
    if (!helperText?.trim() && !CHEAT_SHEETS[currentSubject]) {
      alert("Write at least one sentence about what you’re stuck on first.");
      return;
    }

    try {
      setTutorLoading(true);
      setTutorError(null);

      const res = await fetch("/api/subject-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectKey: currentSubject,
          subjectLabel: subjectLabels[currentSubject] ?? SUBJECT_LABELS[currentSubject],
          levelLabel: programInfo.label,
          helperText,
          action: studyAction,
sourceText: helperText,
quizCount,
          cheatSheet: CHEAT_SHEETS[currentSubject],
          history:
            tutorHistory[currentSubject]?.slice(-5).map((item) => ({
              question: item.question,
              answer: item.answer,
            })) ?? [],
        }),
      });

      const rawResponse = await res.text();

      if (!rawResponse.trim()) {
        throw new Error(
          `The study server returned an empty response. Status: ${res.status}`
        );
      }
      
      let data: any;
      
      try {
        data = JSON.parse(rawResponse);
      } catch {
        throw new Error(
          `The study server returned unreadable information: ${rawResponse.slice(
            0,
            200
          )}`
        );
      }
      
      if (!res.ok) {
        throw new Error(
          data?.error || `Study service error ${res.status}`
        );
      }
      
      const answer =
        typeof data?.answer === "string"
          ? data.answer.trim()
          : "";
      
      if (!answer) {
        throw new Error(
          `Tutor returned no answer. Response: ${rawResponse.slice(
            0,
            300
          )}`
        );
      }

      setTutorResponse(answer);

      const timestamp = new Date().toISOString();
      setTutorHistory((prev) => {
        const existing = prev[currentSubject] ?? [];
        const updated = [
          ...existing,
          { timestamp, question: helperText?.trim() || "[General help request]", answer },
        ].slice(-20);

        return { ...prev, [currentSubject]: updated };
      });
    } catch (err) {
      console.error(err);
      setTutorError(
        err instanceof Error
          ? err.message
          : "Something went wrong asking the tutor. Try again."
      );
    } finally {
      setTutorLoading(false);
    }
  }

  async function handleGenerateTest() {
    try {
      setLoadingTest(true);
      setTestError(null);
      setShowTestMode(true);

      const res = await fetch("/api/subject-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectKey: currentSubject,
          subjectLabel: subjectLabels[currentSubject] ?? SUBJECT_LABELS[currentSubject],
          levelLabel: programInfo.label,
          helperText,
          cheatSheet: CHEAT_SHEETS[currentSubject],
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const list = (data.questions ?? []) as TestQuestion[];
      setTestQuestions(list.map((q) => ({ ...q, selectedIndex: null })));
    } catch (err) {
      console.error(err);
      setTestError("Couldn't generate quiz questions. Try again later.");
    } finally {
      setLoadingTest(false);
    }
  }

  function handleSelectTestOption(qIndex: number, optionIndex: number) {
    setTestQuestions((prev) =>
      prev.map((q, idx) => (idx === qIndex ? { ...q, selectedIndex: optionIndex } : q))
    );
  }

  async function handleDownloadPdf() {
    alert("PDF export is disabled for now. We’ll re-enable it later.");
  }

  // -------- NCLEX questions (nursing only) --------

  async function handleGenerateQuestions() {
    if (!isNursingProgram) return;
    const nursingSubject = currentSubject as NursingSubjectKey;

    try {
      setLoadingQuestions(true);
      setQuestionsError(null);
      setQuestions([]);

      const res = await fetch("/api/nclex-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: nursingSubject,
          subjectLabel: subjectLabels[nursingSubject] ?? SUBJECT_LABELS[nursingSubject],
          subjectPrompt: SUBJECT_PROMPTS[nursingSubject],
          count: 50,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const list: string[] = Array.isArray(data.questions) ? data.questions : [];

      setQuestions(list.length ? list : ["The API returned no questions. Try again in a bit."]);
    } catch (err) {
      console.error(err);
      setQuestionsError(
        "Couldn't load practice questions. You can still use your cheat sheets and notes while this is fixed."
      );
    } finally {
      setLoadingQuestions(false);
    }
  }

  // -------- Onboarding screen --------
  if (activeProgram === "unset") {
    return (
      <section className="space-y-4 text-slate-100">
        <div className="rounded-2xl border border-emerald-500/40 bg-slate-950/95 p-6">
          <h2 className="text-xl font-semibold text-emerald-300">What are you studying right now?</h2>
          <p className="mt-1 text-xs text-slate-400">
  Choose your current learning stage or program. Next, you’ll choose
  your subjects, study goal, and whether you want an ongoing or
  time-based plan.
</p>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {PROGRAMS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActiveProgram(p.id)}
                className="rounded-2xl border border-slate-700 bg-slate-900/80 p-3 text-left text-xs transition hover:border-emerald-400 hover:bg-slate-900"
              >
                <p className="font-semibold text-slate-100">{p.label}</p>
                <p className="mt-1 text-[11px] text-slate-400">{p.description}</p>
              </button>
            ))}
          </div>

          <p className="mt-4 text-[11px] text-slate-500">
  Tip: choosing a nursing program does not automatically place you
  into NCLEX preparation. You’ll choose your specific study goal next.
</p> 
        </div>
      </section>
    );
  }

  // -------------------- Main planner --------------------

  return (
    <section className="space-y-4 text-slate-100">
      {/* Header */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-emerald-300">Study Planner</h2>
          <p className="text-xs text-slate-400">
          Your personal subjects, focus blocks, guided plans, and reflections in one place.
          </p>

          <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
            <span className="rounded-full bg-slate-900/80 px-3 py-1 text-slate-200">
              Current level:{" "}
              <span className="font-semibold text-emerald-300">{programInfo.label}</span>
            </span>

            <div className="flex flex-wrap gap-1">
              {PROGRAMS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setActiveProgram(p.id);
                    const first = (p.subjects?.[0] || "fundamentals") as SubjectKey;
                    setSelectedSubject(first);
                    setReadingSubject(null);
                    setQuestions([]);
                    setQuestionsError(null);
                    setTutorResponse("");
                    setTutorError(null);
                  }}
                  className={
                    "rounded-full border px-2 py-1 " +
                    (p.id === programInfo.id
                      ? "border-emerald-400 bg-emerald-500/15 text-emerald-200"
                      : "border-slate-700 bg-slate-900/80 text-slate-300 hover:border-slate-500")
                  }
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
<div className="flex gap-2 rounded-full bg-slate-900/80 p-1 text-xs">
  {[
    { id: "roadmap", label: "My Plan" },
    { id: "focus", label: "Let’s Study" },
    { id: "review", label: "Monthly Review" },
  ].map((tab) => (
    <button
      key={tab.id}
      type="button"
      onClick={() =>
        setActiveTab(tab.id as PlannerTab)
      }
      className={
        "flex-1 rounded-full px-3 py-1.5 font-medium transition " +
        (activeTab === tab.id
          ? "bg-emerald-500 text-slate-950"
          : "text-slate-300 hover:bg-slate-800")
      }
    >
      {tab.label}
    </button>
  ))}
</div>

{/* MY PLAN TAB */}
{activeTab === "roadmap" && (
  <div className="space-y-4">
    <section className="rounded-2xl border border-slate-800 bg-slate-950/90 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-emerald-300">
            What are you working toward?
          </h3>

          <p className="mt-1 text-[11px] text-slate-400">
            Your learning level tells AffirmMe what you study.
            Your goal determines what kind of plan Zaryx
            should build.
          </p>
        </div>

        {studyGoal !== "unset" && (
          <button
            type="button"
            onClick={() => setStudyGoal("unset")}
            className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] text-slate-300 hover:border-emerald-400"
          >
            Change goal
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {STUDY_GOALS.map((goal) => {
          const selected = studyGoal === goal.id;

          return (
            <button
              key={goal.id}
              type="button"
              onClick={() => setStudyGoal(goal.id)}
              className={`rounded-xl border p-3 text-left transition ${
                selected
                  ? "border-emerald-400 bg-emerald-500/15"
                  : "border-slate-700 bg-slate-900/70 hover:border-emerald-500/70"
              }`}
            >
              <p
                className={`text-sm font-semibold ${
                  selected
                    ? "text-emerald-300"
                    : "text-slate-100"
                }`}
              >
                {goal.title}
              </p>

              <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                {goal.description}
              </p>
            </button>
          );
        })}
      </div>
    </section>

    {studyGoal === "unset" ? (
      <section className="rounded-2xl border border-purple-500/40 bg-slate-950/90 p-4 text-xs">
        <p className="font-semibold text-purple-300">
          Choose a study goal to continue
        </p>

        <p className="mt-1 text-[11px] text-slate-400">
          Your existing roadmap and saved progress have not
          been deleted.
        </p>
      </section>
    ) : studyGoal === "ongoing" ||
      studyGoal === "subject_support" ? (
      <section className="rounded-2xl border border-emerald-500/40 bg-slate-950/90 p-4 text-xs">
        <p className="font-semibold text-emerald-300">
          Your flexible study plan is ready
        </p>

        <p className="mt-1 text-[11px] text-slate-400">
          This plan continues week by week without forcing an
          ending date. Use your selected subjects and focus
          blocks to guide each session.
        </p>

        <button
          type="button"
          onClick={() => setActiveTab("focus")}
          className="mt-3 rounded-full border border-emerald-400 bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
        >
          Go to Today&apos;s Focus →
        </button>
      </section>
    ) : (
      <section className="rounded-2xl border border-purple-500/40 bg-slate-950/90 p-4 text-xs">
        <p className="font-semibold text-purple-300">
          Guided plan selected
        </p>

        <p className="mt-1 text-[11px] text-slate-400">
          Next, you’ll choose the specific exam or purpose,
          target date, and preferred plan length. Your existing
          12-week nursing roadmaps remain safely stored.
        </p>
      </section>
    )}
  </div>
)}

{/* FOCUS TAB */}
{activeTab === "focus" && (
  <div className="space-y-4">
    {/* Coach note */}
    <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-[11px] text-emerald-100">
      <p className="font-semibold text-emerald-200">
        Zaryx Coach Note
      </p>

      <p className="mt-1 text-[11px] text-emerald-100/90">
        {coachNoteForThisWeek}
      </p>
    </div>

    {/* Smart suggestion */}
    {suggestedSubject && (
      <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-[11px] text-emerald-100">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
          Zaryx Smart Suggestion
        </p>

        <p className="mt-1 text-[11px] text-slate-200">
          This subject has fewer completed study steps and may
          be a helpful next focus.
        </p>

        <button
          type="button"
          onClick={() => {
            setSelectedSubject(suggestedSubject);
            setReadingSubject(null);
          }}
          className="study-smart-suggestion-button mt-3 inline-flex min-h-10 items-center justify-center rounded-full border border-emerald-400 bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400"
        >
          Focus on{" "}
          {subjectLabels[suggestedSubject] ??
            SUBJECT_LABELS[suggestedSubject]}{" "}
          →
        </button>

        <p className="mt-2 text-[10px] text-emerald-200/80">
          Based on which subjects currently have fewer
          completed study steps.
        </p>
      </div>
    )}

          {/* TodayFocus */}
          <TodayFocus
            levelLabel={programInfo.label}
            subjectLabel={subjectLabels[currentSubject] ?? SUBJECT_LABELS[currentSubject]}
            isNursingProgram={isNursingProgram}
          />

          {/* Subject helper with cheat sheets */}
          <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-xs">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-emerald-300">
                  What should I study inside each subject?
                </h3>
                <p className="text-[11px] text-slate-400">
                  Tap a subject to see ideas for a 20–30 minute focused block. Then check off what
                  you’ve covered and capture important notes.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRenameSubject}
                className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-[10px] text-slate-300 hover:border-emerald-400 hover:text-emerald-200"
              >
                Rename subject
              </button>
            </div>

            {/* Subject chips */}
            <div className="flex flex-wrap gap-2">
              {availableSubjects.map((subject) => (
                <button
                  key={subject}
                  type="button"
                  onClick={() => {
                    setSelectedSubject(subject);
                    setReadingSubject(null);
                    setTutorResponse("");
                    setTutorError(null);
                  }}
                  className={
                    "rounded-full border px-3 py-1 text-[11px] transition " +
                    (currentSubject === subject
                      ? "border-emerald-400 bg-emerald-500/15 text-emerald-200"
                      : "border-slate-700 bg-slate-900/80 text-slate-200 hover:border-slate-500")
                  }
                >
                  {subjectLabels[subject] ?? SUBJECT_LABELS[subject]}
                </button>
              ))}
            </div>

            {/* Example focused blocks + checklist */}
            <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-950/90 p-3">
              <p className="text-[11px] font-semibold text-emerald-200">
                {subjectLabels[currentSubject] ?? SUBJECT_LABELS[currentSubject]} – example focused
                blocks
              </p>
              <div className="space-y-1">
                {EXAMPLE_BLOCKS[currentSubject].map((item, idx) => {
                  const checked = currentProgress.completedTopics.includes(item);
                  return (
                    <label key={idx} className="flex items-start gap-2 text-[11px] text-slate-200">
                      <input
                        type="checkbox"
                        className="mt-0.5 h-3 w-3 rounded border-slate-600 bg-slate-900"
                        checked={checked}
                        onChange={() => toggleTopic(currentSubject, item)}
                      />
                      <span className={checked ? "line-through text-slate-500" : ""}>{item}</span>
                    </label>
                  );
                })}
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Use this checklist to track what you’ve touched this week.
              </p>
            </div>

            {/* Cheat sheet + voice */}
            <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-950/95 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold text-emerald-200">
                  Quick cheat sheet: {CHEAT_SHEETS[currentSubject].title}
                </p>
                <button
                  type="button"
                  onClick={() => handleReadCheatSheet(currentSubject)}
                  className={
                    "rounded-full border px-3 py-1 text-[11px] " +
                    (readingSubject === currentSubject
                      ? "border-emerald-400 bg-emerald-500/15 text-emerald-200"
                      : "border-slate-700 bg-slate-900/80 text-slate-200 hover:border-slate-500")
                  }
                >
                  {readingSubject === currentSubject ? "🔊 Reading…" : "🔊 Read this to me"}
                </button>
              </div>

              <p className="text-[11px] text-slate-300">{CHEAT_SHEETS[currentSubject].summary}</p>
              <ul className="mt-1 list-disc space-y-1 pl-4 text-[11px] text-slate-200">
                {CHEAT_SHEETS[currentSubject].bullets.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Notes per subject */}
            <div className="space-y-1 rounded-lg border border-slate-800 bg-slate-950/95 p-3">
              <p className="text-[11px] font-semibold text-emerald-200">
                Important notes for {subjectLabels[currentSubject] ?? SUBJECT_LABELS[currentSubject]}
              </p>
              <textarea
                className="h-24 w-full resize-none rounded-md border border-slate-700 bg-slate-900/80 p-2 text-[11px] text-slate-100"
                placeholder="Key patterns you keep missing, mnemonics, or anything future-you needs."
                value={currentProgress.notes}
                onChange={(e) => updateNotes(currentSubject, e.target.value)}
              />
              <p className="text-[10px] text-slate-500">Saved per subject.</p>
            </div>
          </section>

          {/* NCLEX questions */}
          {isNursingProgram && (
            <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/80 p-4 text-xs">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-emerald-300">
                    NCLEX-style practice for this subject
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Generates up to 50 LPN-level NCLEX questions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateQuestions}
                  disabled={loadingQuestions}
                  className={
                    "rounded-md px-3 py-1.5 text-[11px] font-semibold transition " +
                    (loadingQuestions
                      ? "bg-slate-700 text-slate-300 cursor-wait"
                      : "bg-emerald-500 text-slate-950 hover:bg-emerald-400")
                  }
                >
                  {loadingQuestions ? "Generating…" : "Generate 50 questions"}
                </button>
              </div>

              {questionsError && <p className="text-[11px] text-rose-300">{questionsError}</p>}

              {!loadingQuestions && !questionsError && questions.length === 0 && (
                <p className="text-[11px] text-slate-500">
                  Tap “Generate 50 questions” to create a practice set.
                </p>
              )}

              {questions.length > 0 && (
                <div className="max-h-72 space-y-2 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950/95 p-3 pr-2">
                  {questions.map((q, idx) => (
                    <p key={idx} className="whitespace-pre-wrap text-[11px] text-slate-100">
                      {q}
                    </p>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Subject Helper */}
          <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/90 p-4 text-xs">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-emerald-300">
                  Subject Helper · {subjectLabels[currentSubject] ?? SUBJECT_LABELS[currentSubject]}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Brain-dump what you&apos;re stuck on (saved per subject).
                </p>
              </div>
              <button
                type="button"
                onClick={handleHelperVoiceInput}
                className={
                  "rounded-full border px-3 py-1 text-[11px] " +
                  (helperListening
                    ? "border-emerald-400 bg-emerald-500/15 text-emerald-200"
                    : "border-slate-700 bg-slate-900/80 text-slate-200 hover:border-slate-500")
                }
              >
                {helperListening ? "🎙️ Listening…" : "🎙️ Voice note"}
              </button>
            </div>

            <textarea
              className="mt-1 h-28 w-full resize-none rounded-md border border-slate-700 bg-slate-900/80 p-2 text-[11px] text-slate-100"
              placeholder="Example: 'I don’t understand sodium vs potassium labs…'"
              value={helperText}
              onChange={(e) => updateHelperText(e.target.value)}
            />

            {/* Attach picture */}
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px]">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 hover:border-emerald-400">
                <span className="text-slate-200">📷 Attach picture</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleHelperImageChange} />
              </label>

              {helperAttachments[currentSubject] && (
                <span className="text-slate-400">
                  Attached:{" "}
                  <span className="font-semibold text-emerald-200">
                    {helperAttachments[currentSubject]}
                  </span>
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[10px] text-slate-500">
                Auto-saved for{" "}
                <span className="font-semibold text-emerald-200">
                  {subjectLabels[currentSubject] ?? SUBJECT_LABELS[currentSubject]}
                </span>
                .
              </p>
              <button
                type="button"
                onClick={() => updateHelperText("")}
                className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-[10px] text-slate-300 hover:border-rose-400 hover:text-rose-200"
              >
                Clear text
              </button>
            </div>
          </section>

          {/* AI Tutor */}
          <section className="space-y-3 rounded-xl border border-emerald-500/40 bg-slate-950/90 p-4 text-xs">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-emerald-300">
                  Zaryx Study Tools · {subjectLabels[currentSubject] ?? SUBJECT_LABELS[currentSubject]}
                </h3>
                <p className="text-[11px] text-slate-400">
  Add notes or material in Subject Helper, then choose what
  you want Zaryx to create.
</p>
              </div>

              <div className="flex flex-col items-end gap-1">
                <button
                  type="button"
                  onClick={handleAskTutor}
                  disabled={tutorLoading}
                  className={
                    "rounded-full px-3 py-1 text-[11px] font-semibold transition " +
                    (tutorLoading
                      ? "bg-slate-700 text-slate-300 cursor-wait"
                      : "bg-emerald-500 text-slate-950 hover:bg-emerald-400")
                  }
                >
                  {tutorLoading ? "Zaryx is creating…" : "Create Study Material"}
                </button>

                <button
  type="button"
  disabled
  onClick={() => alert("PDF export disabled for now.")}
  className="rounded-full border border-slate-700 bg-slate-900/50 px-3 py-1 text-[10px] text-slate-400 cursor-not-allowed"
>
  Download study sheet (PDF) (coming soon)
</button>
              </div>
            </div>

          {/* Zaryx study tools */}
<div className="mt-3 space-y-3 rounded-xl border border-slate-800 bg-slate-950/80 p-3">
  <p className="text-[11px] font-semibold text-emerald-300">
    What should Zaryx create?
  </p>

  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
    {STUDY_TOOL_OPTIONS.map((tool) => (
      <button
        key={tool.id}
        type="button"
        onClick={() => setStudyAction(tool.id)}
        className={`rounded-full border px-3 py-2 text-[11px] font-semibold transition ${
          studyAction === tool.id
            ? "border-emerald-400 bg-emerald-500 text-slate-950"
            : "border-slate-700 bg-slate-900 text-slate-200 hover:border-emerald-400"
        }`}
      >
        {tool.label}
      </button>
    ))}
  </div>

  {studyAction === "quiz" && (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        Number of questions
      </p>

      <div className="flex gap-2">
        {([5, 10, 20] as const).map((count) => (
          <button
            key={count}
            type="button"
            onClick={() => setQuizCount(count)}
            className={`rounded-full border px-4 py-2 text-[11px] font-semibold ${
              quizCount === count
                ? "border-purple-400 bg-purple-500/30 text-purple-100"
                : "border-slate-700 bg-slate-900 text-slate-300"
            }`}
          >
            {count} questions
          </button>
        ))}
      </div>
    </div>
  )}

  <p className="text-[10px] text-slate-500">
    Zaryx will use the selected subject, your saved notes, and
    any material entered above.
  </p>
</div>

            {tutorError && <p className="text-[11px] text-rose-300">{tutorError}</p>}

            {tutorResponse && (
  <div className="space-y-3 rounded-lg border border-emerald-500/30 bg-slate-950/95 p-3">
    <p className="text-[11px] font-semibold text-emerald-200">
      {parsedTutorQuiz.length > 0
        ? "Your Zaryx practice quiz"
        : parsedFlashcards.length > 0
        ? "Your Zaryx flashcards"
        : "Latest tutor answer"}
    </p>

    {parsedTutorQuiz.length > 0 ? (
      <ZaryxQuizDeck
        key={tutorResponse}
        questions={parsedTutorQuiz}
      />
    ) : parsedFlashcards.length > 0 ? (
      <FlashcardDeck cards={parsedFlashcards} />
    ) : (
      <p className="whitespace-pre-wrap text-[11px] text-slate-100">
        {tutorResponse}
      </p>
    )}
  </div>
)}
            {/* History */}
            {tutorHistory[currentSubject]?.length ? (
              <div className="space-y-1 rounded-lg border border-slate-800 bg-slate-950/95 p-3 max-h-44 overflow-y-auto">
                <p className="text-[11px] font-semibold text-emerald-200">
                  Recent tutor history for this subject
                </p>
                {tutorHistory[currentSubject]
                  .slice()
                  .reverse()
                  .map((item, idx) => (
                    <div
                      key={idx}
                      className="border-t border-slate-800 pt-1 first:border-t-0 first:pt-0"
                    >
                      <p className="text-[10px] text-slate-500">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                      <p className="mt-0.5 text-[11px] font-medium text-slate-200">
                        Q: {item.question}
                      </p>
                      <p className="mt-0.5 whitespace-pre-wrap text-[11px] text-slate-300">
                        A: {item.answer}
                      </p>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-[10px] text-slate-500">
                No tutor history yet for this subject.
              </p>
            )}

            {/* Test Mode */}
            <div className="mt-2 flex items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold text-emerald-300">Test Mode</p>
                <p className="text-[10px] text-slate-400">
                  Generate quick multiple-choice questions for this subject.
                </p>
              </div>
              <button
                type="button"
                onClick={handleGenerateTest}
                disabled={loadingTest}
                className={
                  "rounded-full px-3 py-1 text-[11px] font-semibold transition " +
                  (loadingTest
                    ? "bg-slate-700 text-slate-300 cursor-wait"
                    : "bg-emerald-500 text-slate-950 hover:bg-emerald-400")
                }
              >
                {loadingTest ? "Building quiz…" : "Start / refresh quiz"}
              </button>
            </div>

            {testError && <p className="text-[11px] text-rose-300">{testError}</p>}

            {showTestMode && testQuestions.length > 0 && (
              <div className="mt-2 space-y-2 rounded-lg border border-slate-800 bg-slate-950/95 p-3 max-h-72 overflow-y-auto">
                {testQuestions.map((q, qIndex) => (
                  <div
                    key={qIndex}
                    className="rounded-md border border-slate-800 bg-slate-950/90 p-2"
                  >
                    <p className="text-[11px] font-semibold text-slate-100">
                      Q{qIndex + 1}. {q.question}
                    </p>

                    <div className="mt-1 space-y-1">
                      {q.options.map((opt, optIndex) => {
                        const isSelected = q.selectedIndex === optIndex;
                        const isCorrect = q.correctIndex === optIndex;
                        const showResult = q.selectedIndex != null;

                        let classes =
                          "w-full rounded-md border px-2 py-1 text-left text-[11px] transition ";
                        if (!showResult) {
                          classes +=
                            "border-slate-700 bg-slate-900/80 text-slate-200 hover:border-emerald-400";
                        } else if (isCorrect) {
                          classes +=
                            "border-emerald-400 bg-emerald-500/15 text-emerald-200";
                        } else if (isSelected && !isCorrect) {
                          classes += "border-rose-400 bg-rose-500/10 text-rose-200";
                        } else {
                          classes += "border-slate-700 bg-slate-900/80 text-slate-300";
                        }

                        return (
                          <button
                            key={optIndex}
                            type="button"
                            onClick={() => !showResult && handleSelectTestOption(qIndex, optIndex)}
                            className={classes}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {q.selectedIndex != null && (
                      <p className="mt-1 text-[10px] text-slate-300">{q.explanation}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <StudyTimer />
          <WeeklyChecklist />
          <ProStudyBoost />
        </div>
      )}

      {/* REVIEW TAB */}
      {activeTab === "review" && (
        <div className="space-y-4">
          <MonthlyReview />
        </div>
      )}
    </section>
  );
}