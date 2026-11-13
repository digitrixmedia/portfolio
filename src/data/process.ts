import { ProcessStep } from '../types/portfolio';

export const PROCESS_STEPS: ProcessStep[] = [
  {
    number: '01',
    title: 'Discover',
    description: 'Understanding the brand, audience, and objectives.',
    details: [
      'Deep dive into market positioning, competitor blind spots, and brand heritage.',
      'Clarifying target audience psychographics, emotional triggers, and distribution channels.',
      'Establishing creative benchmarks, project milestones, and measurable success KPIs.'
    ]
  },
  {
    number: '02',
    title: 'Concept',
    description: 'Developing creative ideas and visual directions.',
    details: [
      'Synthesizing strategic insights into bold thematic narratives and art directions.',
      'Building expressive moodboards, motion treatments, and typographic explorations.',
      'Reviewing and aligning on the hero creative hypothesis before execution.'
    ]
  },
  {
    number: '03',
    title: 'Create',
    description: 'Producing designs, videos, websites, and campaigns.',
    details: [
      'High-fidelity production across cinematography, motion graphics, and UI design.',
      'Iterative refinement loops with tight attention to rhythm, color grading, and typography.',
      'Sound design integration, responsive interface build, and asset variations.'
    ]
  },
  {
    number: '04',
    title: 'Deliver',
    description: 'Refining, optimizing, and delivering the final work.',
    details: [
      'Rigorous quality control, compression tuning, and cross-platform stress tests.',
      'Packaging clean master files, guidelines, and turnkey social distribution formats.',
      'Post-launch performance review, feedback loop analysis, and creative scaling.'
    ]
  }
];
