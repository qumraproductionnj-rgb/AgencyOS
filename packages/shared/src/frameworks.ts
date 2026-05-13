// framework.model — Content Frameworks Library
// 40+ frameworks for content structure, copywriting, video, design, and sales

export type ContentFormat =
  | 'VIDEO_LONG'
  | 'REEL'
  | 'STORY'
  | 'STATIC_DESIGN'
  | 'CAROUSEL'
  | 'GIF'
  | 'PODCAST'
  | 'BLOG_POST'
  | 'EMAIL'
  | 'LANDING_PAGE'
  | 'AD_COPY'
  | 'PRESENTATION'
export type ContentObjective =
  | 'awareness'
  | 'consideration'
  | 'conversion'
  | 'education'
  | 'entertainment'
  | 'inspiration'
  | 'trust_building'
  | 'engagement'

export interface FrameworkField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'number'
  placeholder?: string
  options?: string[]
  required?: boolean
}

export interface Framework {
  id: string
  key: string
  nameAr: string
  nameEn: string
  descriptionAr: string
  descriptionEn: string
  icon: string
  category: 'copywriting' | 'video' | 'design' | 'sales' | 'storytelling' | 'educational'
  bestFor: ContentFormat[]
  objectives: ContentObjective[]
  fields: FrameworkField[]
  promptTemplate: string
  sortOrder: number
}

export const FRAMEWORKS: Framework[] = [
  // ── COPYWRITING ──────────────────────────────────────
  {
    id: 'fw-aida',
    key: 'aida',
    nameAr: 'AIDA',
    nameEn: 'AIDA',
    descriptionAr:
      'إطار كلاسيكي للتسويق: جذب الانتباه → إثارة الاهتمام → خلق الرغبة → تحفيز الإجراء',
    descriptionEn: 'Classic marketing framework: Attention → Interest → Desire → Action',
    icon: '🎯',
    category: 'copywriting',
    bestFor: ['AD_COPY', 'CAROUSEL', 'STATIC_DESIGN', 'EMAIL'],
    objectives: ['conversion', 'awareness'],
    fields: [
      {
        key: 'attention',
        label: 'Attention (Attention)',
        type: 'textarea',
        placeholder: 'How will you grab attention?',
        required: true,
      },
      {
        key: 'interest',
        label: 'Interest (Interest)',
        type: 'textarea',
        placeholder: 'How will you build interest?',
        required: true,
      },
      {
        key: 'desire',
        label: 'Desire (Desire)',
        type: 'textarea',
        placeholder: 'How will you create desire?',
        required: true,
      },
      {
        key: 'action',
        label: 'Action (Action)',
        type: 'textarea',
        placeholder: 'What action do you want?',
        required: true,
      },
    ],
    promptTemplate:
      'Structure content using AIDA framework:\n\nAttention: {attention}\nInterest: {interest}\nDesire: {desire}\nAction: {action}\n\nWrite compelling content following this structure.',
    sortOrder: 1,
  },
  {
    id: 'fw-pas',
    key: 'pas',
    nameAr: 'مشكلة-إثارة-حل',
    nameEn: 'Problem-Agitate-Solution',
    descriptionAr: 'حدد المشكلة، ضخّمها، ثم قدم الحل',
    descriptionEn: 'Identify the problem, agitate it, then present the solution',
    icon: '💡',
    category: 'copywriting',
    bestFor: ['AD_COPY', 'CAROUSEL', 'BLOG_POST', 'EMAIL'],
    objectives: ['conversion', 'trust_building'],
    fields: [
      {
        key: 'problem',
        label: 'Problem (Problem)',
        type: 'textarea',
        placeholder: 'What problem does the audience face?',
        required: true,
      },
      {
        key: 'agitate',
        label: 'Agitate (Agitate)',
        type: 'textarea',
        placeholder: 'Why does this problem hurt?',
        required: true,
      },
      {
        key: 'solution',
        label: 'Solution (Solution)',
        type: 'textarea',
        placeholder: 'How do you solve it?',
        required: true,
      },
    ],
    promptTemplate:
      'Structure content using Problem-Agitate-Solution:\n\nProblem: {problem}\nAgitate: {agitate}\nSolution: {solution}',
    sortOrder: 2,
  },
  {
    id: 'fw-hook-story-offer',
    key: 'hook_story_offer',
    nameAr: 'خطاف-قصة-عرض',
    nameEn: 'Hook-Story-Offer',
    descriptionAr: 'ابدأ بخطاف قوي، اروِ قصة ذات صلة، قدّم عرضك',
    descriptionEn: 'Start with a strong hook, tell a relevant story, present your offer',
    icon: '🪝',
    category: 'copywriting',
    bestFor: ['REEL', 'VIDEO_LONG', 'STORY', 'AD_COPY'],
    objectives: ['awareness', 'conversion', 'entertainment'],
    fields: [
      {
        key: 'hook',
        label: 'Hook (Hook)',
        type: 'textarea',
        placeholder: 'What stops the scroll?',
        required: true,
      },
      {
        key: 'story',
        label: 'Story (Story)',
        type: 'textarea',
        placeholder: 'What story builds connection?',
        required: true,
      },
      {
        key: 'offer',
        label: 'Offer (Offer)',
        type: 'textarea',
        placeholder: 'What are you offering?',
        required: true,
      },
    ],
    promptTemplate:
      'Structure content using Hook-Story-Offer:\n\nHook: {hook}\nStory: {story}\nOffer: {offer}',
    sortOrder: 3,
  },
  {
    id: 'fw-bab',
    key: 'before_after_bridge',
    nameAr: 'قبل-بعد-جسر',
    nameEn: 'Before-After-Bridge',
    descriptionAr: 'أظهر الوضع الحالي، صوّر الوضع المثالي، اشرح كيف تصل إليه',
    descriptionEn: 'Show the current state, paint the ideal state, explain the bridge',
    icon: '🌉',
    category: 'copywriting',
    bestFor: ['AD_COPY', 'CAROUSEL', 'STATIC_DESIGN', 'EMAIL'],
    objectives: ['conversion', 'inspiration'],
    fields: [
      {
        key: 'before',
        label: 'Before (Before)',
        type: 'textarea',
        placeholder: 'Current pain point?',
        required: true,
      },
      {
        key: 'after',
        label: 'After (After)',
        type: 'textarea',
        placeholder: 'Ideal transformation?',
        required: true,
      },
      {
        key: 'bridge',
        label: 'Bridge (Bridge)',
        type: 'textarea',
        placeholder: 'How do you bridge the gap?',
        required: true,
      },
    ],
    promptTemplate:
      'Structure content using Before-After-Bridge:\n\nBefore: {before}\nAfter: {after}\nBridge: {bridge}',
    sortOrder: 4,
  },
  {
    id: 'fw-fab',
    key: 'features_advantages_benefits',
    nameAr: 'ميزات-فوائد-منافع',
    nameEn: 'Features-Advantages-Benefits (FAB)',
    descriptionAr: 'اذكر الميزات، اشرح المزايا، ثم ركز على المنافع للعميل',
    descriptionEn: 'List features, explain advantages, then focus on customer benefits',
    icon: '📊',
    category: 'copywriting',
    bestFor: ['AD_COPY', 'STATIC_DESIGN', 'CAROUSEL', 'EMAIL'],
    objectives: ['conversion', 'education'],
    fields: [
      {
        key: 'features',
        label: 'Features (Features)',
        type: 'textarea',
        placeholder: 'What are the features?',
        required: true,
      },
      {
        key: 'advantages',
        label: 'Advantages (Advantages)',
        type: 'textarea',
        placeholder: 'Why do these features matter?',
        required: true,
      },
      {
        key: 'benefits',
        label: 'Benefits (Benefits)',
        type: 'textarea',
        placeholder: 'How does the customer benefit?',
        required: true,
      },
    ],
    promptTemplate:
      'Structure content using Features-Advantages-Benefits:\n\nFeatures: {features}\nAdvantages: {advantages}\nBenefits: {benefits}',
    sortOrder: 5,
  },
  {
    id: 'fw-4ps',
    key: 'four_ps',
    nameAr: '4Ps (المنتج-السعر-المكان-الترويج)',
    nameEn: '4Ps (Product-Price-Place-Promotion)',
    descriptionAr: 'إطار تسويقي متكامل: المنتج، السعر، المكان، الترويج',
    descriptionEn: 'Complete marketing mix: Product, Price, Place, Promotion',
    icon: '🏪',
    category: 'copywriting',
    bestFor: ['AD_COPY', 'PRESENTATION', 'CAROUSEL'],
    objectives: ['conversion', 'education'],
    fields: [
      {
        key: 'product',
        label: 'Product (Product)',
        type: 'textarea',
        placeholder: 'What are you selling?',
        required: true,
      },
      {
        key: 'price',
        label: 'Price (Price)',
        type: 'textarea',
        placeholder: 'Pricing strategy?',
        required: true,
      },
      {
        key: 'place',
        label: 'Place (Place)',
        type: 'textarea',
        placeholder: 'Where is it available?',
        required: true,
      },
      {
        key: 'promotion',
        label: 'Promotion (Promotion)',
        type: 'textarea',
        placeholder: 'How will you promote it?',
        required: true,
      },
    ],
    promptTemplate:
      'Structure content using 4Ps Marketing Mix:\n\nProduct: {product}\nPrice: {price}\nPlace: {place}\nPromotion: {promotion}',
    sortOrder: 6,
  },

  // ── STORYTELLING ─────────────────────────────────────
  {
    id: 'fw-heros-journey',
    key: 'heros_journey',
    nameAr: 'رحلة البطل',
    nameEn: "Hero's Journey",
    descriptionAr: 'النموذج القصصي الكلاسيكي: البطل يُدعى للمغامرة، يواجه التحديات، ويعود متحولاً',
    descriptionEn:
      'Classic narrative arc: hero called to adventure, faces challenges, returns transformed',
    icon: '⚔️',
    category: 'storytelling',
    bestFor: ['VIDEO_LONG', 'REEL', 'BLOG_POST', 'PRESENTATION'],
    objectives: ['entertainment', 'inspiration', 'trust_building'],
    fields: [
      {
        key: 'hero',
        label: 'Hero (Hero)',
        type: 'text',
        placeholder: 'Who is the protagonist?',
        required: true,
      },
      {
        key: 'call',
        label: 'Call to Adventure (Call to Adventure)',
        type: 'textarea',
        placeholder: 'What sparks the journey?',
        required: true,
      },
      {
        key: 'challenge',
        label: 'Challenge (Challenge)',
        type: 'textarea',
        placeholder: 'What obstacle must be overcome?',
        required: true,
      },
      {
        key: 'transformation',
        label: 'Transformation (Transformation)',
        type: 'textarea',
        placeholder: 'How does the hero change?',
        required: true,
      },
    ],
    promptTemplate:
      "Structure content using the Hero's Journey:\n\nHero: {hero}\nCall to Adventure: {call}\nChallenge: {challenge}\nTransformation: {transformation}",
    sortOrder: 10,
  },
  {
    id: 'fw-three-act',
    key: 'three_act',
    nameAr: 'البنية الثلاثية (تمهيد-صراع-حل)',
    nameEn: 'Three-Act Structure (Setup-Conflict-Resolution)',
    descriptionAr: 'البنية القصصية الكلاسيكية المكونة من ثلاثة فصول',
    descriptionEn: 'Classic three-part narrative structure',
    icon: '🎭',
    category: 'storytelling',
    bestFor: ['VIDEO_LONG', 'REEL', 'STORY', 'BLOG_POST'],
    objectives: ['entertainment', 'education', 'inspiration'],
    fields: [
      {
        key: 'setup',
        label: 'Act 1: Setup (Act 1: Setup)',
        type: 'textarea',
        placeholder: 'Establish characters and setting',
        required: true,
      },
      {
        key: 'conflict',
        label: 'Act 2: Conflict (Act 2: Conflict)',
        type: 'textarea',
        placeholder: 'Rising tension and obstacles',
        required: true,
      },
      {
        key: 'resolution',
        label: 'Act 3: Resolution (Act 3: Resolution)',
        type: 'textarea',
        placeholder: 'Climax and resolution',
        required: true,
      },
    ],
    promptTemplate:
      'Structure content using Three-Act Structure:\n\nSetup: {setup}\nConflict: {conflict}\nResolution: {resolution}',
    sortOrder: 11,
  },
  {
    id: 'fw-storytelling',
    key: 'storytelling',
    nameAr: 'السرد القصصي',
    nameEn: 'Storytelling Framework',
    descriptionAr: 'سرد قصصي مقنع: شخصية، سياق، صراع، حل، عبرة',
    descriptionEn: 'Compelling narrative: character, context, conflict, resolution, lesson',
    icon: '📖',
    category: 'storytelling',
    bestFor: ['VIDEO_LONG', 'REEL', 'BLOG_POST', 'STORY'],
    objectives: ['entertainment', 'trust_building', 'inspiration'],
    fields: [
      {
        key: 'character',
        label: 'Character (Character)',
        type: 'text',
        placeholder: 'Who is in the story?',
        required: true,
      },
      {
        key: 'context',
        label: 'Context (Context)',
        type: 'textarea',
        placeholder: 'Where and when?',
        required: true,
      },
      {
        key: 'conflict',
        label: 'Conflict (Conflict)',
        type: 'textarea',
        placeholder: 'What is the problem?',
        required: true,
      },
      {
        key: 'resolution',
        label: 'Resolution (Resolution)',
        type: 'textarea',
        placeholder: 'How is it resolved?',
        required: true,
      },
      {
        key: 'lesson',
        label: 'Lesson (Lesson)',
        type: 'textarea',
        placeholder: 'What is the takeaway?',
        required: true,
      },
    ],
    promptTemplate:
      'Structure content using Storytelling Framework:\n\nCharacter: {character}\nContext: {context}\nConflict: {conflict}\nResolution: {resolution}\nLesson: {lesson}',
    sortOrder: 12,
  },

  // ── VIDEO ────────────────────────────────────────────
  {
    id: 'fw-hook-hold-payoff',
    key: 'hook_hold_payoff',
    nameAr: 'خطاف-إمساك-دفعة',
    nameEn: 'Hook-Hold-Payoff',
    descriptionAr: 'مثالي للفيديو القصير: خطاف 0-3ث، إمساك 3-20ث، دفعة 20-30ث',
    descriptionEn: 'Ideal for short video: Hook 0-3s, Hold 3-20s, Payoff 20-30s',
    icon: '🎬',
    category: 'video',
    bestFor: ['REEL', 'STORY', 'VIDEO_LONG'],
    objectives: ['entertainment', 'engagement', 'awareness'],
    fields: [
      {
        key: 'hook',
        label: 'Hook 0-3s (Hook)',
        type: 'textarea',
        placeholder: 'What grabs attention instantly?',
        required: true,
      },
      {
        key: 'hold',
        label: 'Hold 3-20s (Hold)',
        type: 'textarea',
        placeholder: 'What keeps them watching?',
        required: true,
      },
      {
        key: 'payoff',
        label: 'Payoff 20-30s (Payoff)',
        type: 'textarea',
        placeholder: 'What delivers the value/reward?',
        required: true,
      },
    ],
    promptTemplate:
      'Structure video content using Hook-Hold-Payoff:\n\nHook (0-3s): {hook}\nHold (3-20s): {hold}\nPayoff (20-30s): {payoff}',
    sortOrder: 20,
  },
  {
    id: 'fw-educational',
    key: 'educational',
    nameAr: 'تعليمي (خطاف-معلومة-تطبيق-خلاصة)',
    nameEn: 'Educational (Hook-Teach-Apply-Summary)',
    descriptionAr: 'هيكل تعليمي: ابدأ بخطاف، قدّم المعلومة، طبّقها، لخّص',
    descriptionEn: 'Educational structure: Hook, Teach, Apply, Summarize',
    icon: '📚',
    category: 'video',
    bestFor: ['VIDEO_LONG', 'REEL', 'BLOG_POST', 'PRESENTATION'],
    objectives: ['education', 'trust_building'],
    fields: [
      {
        key: 'hook',
        label: 'Hook (Hook)',
        type: 'textarea',
        placeholder: 'Why should they learn this?',
        required: true,
      },
      {
        key: 'teach',
        label: 'Teach (Teach)',
        type: 'textarea',
        placeholder: 'The core information',
        required: true,
      },
      {
        key: 'apply',
        label: 'Apply (Apply)',
        type: 'textarea',
        placeholder: 'Real-world application',
        required: true,
      },
      {
        key: 'summary',
        label: 'Summary (Summary)',
        type: 'textarea',
        placeholder: 'Key takeaway',
        required: true,
      },
    ],
    promptTemplate:
      'Structure educational content:\n\nHook: {hook}\nTeach: {teach}\nApply: {apply}\nSummary: {summary}',
    sortOrder: 21,
  },
  {
    id: 'fw-tutorial',
    key: 'tutorial',
    nameAr: 'دليل تعليمي (مقدمة-خطوات-خاتمة)',
    nameEn: 'Tutorial (Intro-Steps-Outro)',
    descriptionAr: 'هيكل تعليمي خطوة بخطوة مع مقدمة وخاتمة',
    descriptionEn: 'Step-by-step instructional structure with intro and outro',
    icon: '🔧',
    category: 'video',
    bestFor: ['VIDEO_LONG', 'REEL', 'BLOG_POST'],
    objectives: ['education', 'engagement'],
    fields: [
      {
        key: 'intro',
        label: 'Introduction (Introduction)',
        type: 'textarea',
        placeholder: 'What will you teach?',
        required: true,
      },
      {
        key: 'steps',
        label: 'Steps (Steps)',
        type: 'textarea',
        placeholder: 'Step-by-step instructions',
        required: true,
      },
      {
        key: 'outro',
        label: 'Conclusion (Conclusion)',
        type: 'textarea',
        placeholder: 'Recap and next steps',
        required: true,
      },
    ],
    promptTemplate:
      'Structure tutorial content:\n\nIntroduction: {intro}\nSteps: {steps}\nConclusion: {outro}',
    sortOrder: 22,
  },
  {
    id: 'fw-comparison',
    key: 'comparison',
    nameAr: 'مقارنة (قبل-بعد/بديل-أفضل)',
    nameEn: 'Comparison (Before-After / Alternative-Superior)',
    descriptionAr: 'قارن بين خيارين لإظهار التفوق',
    descriptionEn: 'Compare two options to show superiority',
    icon: '⚖️',
    category: 'video',
    bestFor: ['REEL', 'STORY', 'CAROUSEL', 'AD_COPY'],
    objectives: ['conversion', 'education'],
    fields: [
      {
        key: 'option_a',
        label: 'Option A (Option A)',
        type: 'textarea',
        placeholder: 'The old/competitor way',
        required: true,
      },
      {
        key: 'option_b',
        label: 'Option B (Option B)',
        type: 'textarea',
        placeholder: 'The better way',
        required: true,
      },
      {
        key: 'verdict',
        label: 'Verdict (Verdict)',
        type: 'textarea',
        placeholder: 'Why B wins',
        required: true,
      },
    ],
    promptTemplate:
      'Structure comparison content:\n\nOption A (old/competitor): {option_a}\nOption B (better): {option_b}\nVerdict: {verdict}',
    sortOrder: 23,
  },
  {
    id: 'fw-behind-scenes',
    key: 'behind_scenes',
    nameAr: 'خلف الكواليس',
    nameEn: 'Behind the Scenes',
    descriptionAr: 'محتوى حقيقي يظهر العمل والجهد وراء المنتج',
    descriptionEn: 'Authentic content showing the work behind the product',
    icon: '🎪',
    category: 'video',
    bestFor: ['REEL', 'STORY', 'VIDEO_LONG'],
    objectives: ['trust_building', 'entertainment', 'engagement'],
    fields: [
      {
        key: 'context',
        label: 'Context (Context)',
        type: 'textarea',
        placeholder: 'What project are we working on?',
        required: true,
      },
      {
        key: 'process',
        label: 'Process (Process)',
        type: 'textarea',
        placeholder: 'Show the work in progress',
        required: true,
      },
      {
        key: 'result',
        label: 'Result (Result)',
        type: 'textarea',
        placeholder: 'What was achieved?',
        required: true,
      },
      {
        key: 'reflection',
        label: 'Reflection (Reflection)',
        type: 'textarea',
        placeholder: 'What did we learn?',
        required: false,
      },
    ],
    promptTemplate:
      'Structure behind-the-scenes content:\n\nContext: {context}\nProcess: {process}\nResult: {result}\nReflection: {reflection}',
    sortOrder: 24,
  },

  // ── SALES ────────────────────────────────────────────
  {
    id: 'fw-consultative',
    key: 'consultative_selling',
    nameAr: 'البيع الاستشاري',
    nameEn: 'Consultative Selling',
    descriptionAr: 'اسأل، شخّص، قدّم حلًا مخصصًا',
    descriptionEn: 'Ask questions, diagnose, present tailored solution',
    icon: '💼',
    category: 'sales',
    bestFor: ['AD_COPY', 'EMAIL', 'PRESENTATION', 'LANDING_PAGE'],
    objectives: ['conversion', 'trust_building'],
    fields: [
      {
        key: 'discover',
        label: 'Discover (Discover)',
        type: 'textarea',
        placeholder: 'Questions to understand their needs',
        required: true,
      },
      {
        key: 'diagnose',
        label: 'Diagnose (Diagnose)',
        type: 'textarea',
        placeholder: 'What is the real problem?',
        required: true,
      },
      {
        key: 'solution',
        label: 'Solution (Solution)',
        type: 'textarea',
        placeholder: 'Your tailored offer',
        required: true,
      },
    ],
    promptTemplate:
      'Structure sales content using Consultative Selling:\n\nDiscovery: {discover}\nDiagnosis: {diagnose}\nSolution: {solution}',
    sortOrder: 30,
  },
  {
    id: 'fw-challenge',
    key: 'challenge_selling',
    nameAr: 'البيع بالتحدي',
    nameEn: 'Challenge Selling',
    descriptionAr: 'تحدّى الافتراضات الحالية للعميل، قدّم رؤية جديدة، ثم حلك',
    descriptionEn: 'Challenge customer assumptions, present new insight, then your solution',
    icon: '🔥',
    category: 'sales',
    bestFor: ['AD_COPY', 'PRESENTATION', 'BLOG_POST'],
    objectives: ['conversion', 'awareness'],
    fields: [
      {
        key: 'challenge',
        label: 'Challenge (Challenge)',
        type: 'textarea',
        placeholder: 'What assumption to challenge?',
        required: true,
      },
      {
        key: 'insight',
        label: 'New Insight (New Insight)',
        type: 'textarea',
        placeholder: 'What new perspective?',
        required: true,
      },
      {
        key: 'solution',
        label: 'Solution (Solution)',
        type: 'textarea',
        placeholder: 'Your approach',
        required: true,
      },
    ],
    promptTemplate:
      'Structure sales content using Challenge Selling:\n\nChallenge assumption: {challenge}\nNew insight: {insight}\nOur solution: {solution}',
    sortOrder: 31,
  },
  {
    id: 'fw-social-proof',
    key: 'social_proof',
    nameAr: 'الدليل الاجتماعي',
    nameEn: 'Social Proof Framework',
    descriptionAr: 'استخدم الشهادات، الإحصائيات، دراسات الحالة لبناء الثقة',
    descriptionEn: 'Use testimonials, stats, case studies to build trust',
    icon: '⭐',
    category: 'sales',
    bestFor: ['AD_COPY', 'CAROUSEL', 'LANDING_PAGE', 'STATIC_DESIGN'],
    objectives: ['conversion', 'trust_building'],
    fields: [
      {
        key: 'testimonial',
        label: 'Testimonial (Testimonial)',
        type: 'textarea',
        placeholder: 'Powerful customer quote',
        required: true,
      },
      {
        key: 'statistics',
        label: 'Statistics (Statistics)',
        type: 'textarea',
        placeholder: 'Numbers that prove value',
        required: true,
      },
      {
        key: 'case_study',
        label: 'Case Study (Case Study)',
        type: 'textarea',
        placeholder: 'Brief success story',
        required: false,
      },
      {
        key: 'cta',
        label: 'CTA (CTA)',
        type: 'textarea',
        placeholder: 'What should they do now?',
        required: true,
      },
    ],
    promptTemplate:
      'Structure content using Social Proof:\n\nTestimonial: {testimonial}\nStatistics: {statistics}\nCase Study: {case_study}\nCTA: {cta}',
    sortOrder: 32,
  },

  // ── DESIGN ───────────────────────────────────────────
  {
    id: 'fw-visual-hierarchy',
    key: 'visual_hierarchy',
    nameAr: 'التسلسل البصري',
    nameEn: 'Visual Hierarchy',
    descriptionAr: 'نظّم العناصر البصرية حسب الأهمية: العنوان الرئيسي، الفرعي، الصورة، الدعوة',
    descriptionEn: 'Organize visual elements by importance: headline, sub, image, CTA',
    icon: '📐',
    category: 'design',
    bestFor: ['STATIC_DESIGN', 'CAROUSEL', 'LANDING_PAGE'],
    objectives: ['awareness', 'conversion', 'engagement'],
    fields: [
      {
        key: 'headline',
        label: 'Primary Headline (Primary Headline)',
        type: 'text',
        placeholder: 'The main message',
        required: true,
      },
      {
        key: 'subheadline',
        label: 'Secondary Text (Secondary Text)',
        type: 'textarea',
        placeholder: 'Supporting message',
        required: false,
      },
      {
        key: 'visual_focus',
        label: 'Visual Focus (Visual Focus)',
        type: 'textarea',
        placeholder: 'What draws the eye first?',
        required: true,
      },
      {
        key: 'cta',
        label: 'CTA Placement (CTA Placement)',
        type: 'text',
        placeholder: 'Where does the CTA go?',
        required: true,
      },
    ],
    promptTemplate:
      'Structure design using Visual Hierarchy:\n\nHeadline: {headline}\nSubheadline: {subheadline}\nVisual focus: {visual_focus}\nCTA: {cta}',
    sortOrder: 40,
  },
  {
    id: 'fw-z-pattern',
    key: 'z_pattern',
    nameAr: 'النمط Z',
    nameEn: 'Z-Pattern Layout',
    descriptionAr: 'تصميم يوجّه العين في مسار Z: أعلى يسار → أعلى يمين → أسفل يسار → أسفل يمين',
    descriptionEn:
      'Design guiding the eye in Z-path: top-left → top-right → bottom-left → bottom-right',
    icon: '🔀',
    category: 'design',
    bestFor: ['STATIC_DESIGN', 'CAROUSEL', 'LANDING_PAGE'],
    objectives: ['awareness', 'conversion'],
    fields: [
      {
        key: 'top_left',
        label: 'Top Left (Top Left)',
        type: 'text',
        placeholder: 'Primary element (logo/headline)',
        required: true,
      },
      {
        key: 'top_right',
        label: 'Top Right (Top Right)',
        type: 'text',
        placeholder: 'Secondary element',
        required: true,
      },
      {
        key: 'bottom_left',
        label: 'Bottom Left (Bottom Left)',
        type: 'textarea',
        placeholder: 'Supporting element',
        required: true,
      },
      {
        key: 'bottom_right',
        label: 'Bottom Right CTA (Bottom Right CTA)',
        type: 'text',
        placeholder: 'Call to action',
        required: true,
      },
    ],
    promptTemplate:
      'Structure design using Z-Pattern:\n\nTop left: {top_left}\nTop right: {top_right}\nBottom left: {bottom_left}\nBottom right CTA: {bottom_right}',
    sortOrder: 41,
  },
  {
    id: 'fw-f-pattern',
    key: 'f_pattern',
    nameAr: 'النمط F',
    nameEn: 'F-Pattern Layout',
    descriptionAr:
      'تصميم يتبع نمط القراءة الطبيعي: أفقياً عبر الأعلى، ثم أفقياً في المنتصف، ثم عمودياً',
    descriptionEn:
      'Design following natural reading pattern: horizontal top, horizontal mid, vertical scan',
    icon: '📄',
    category: 'design',
    bestFor: ['STATIC_DESIGN', 'BLOG_POST', 'LANDING_PAGE'],
    objectives: ['education', 'engagement'],
    fields: [
      {
        key: 'top_band',
        label: 'Top Horizontal Band (Top Horizontal Band)',
        type: 'textarea',
        placeholder: 'Headline + key visual',
        required: true,
      },
      {
        key: 'mid_band',
        label: 'Middle Horizontal Band (Middle Horizontal Band)',
        type: 'textarea',
        placeholder: 'Secondary content',
        required: true,
      },
      {
        key: 'vertical_scan',
        label: 'Vertical Scan Area (Vertical Scan Area)',
        type: 'textarea',
        placeholder: 'Bulleted/list content',
        required: true,
      },
    ],
    promptTemplate:
      'Structure design using F-Pattern:\n\nTop band: {top_band}\nMiddle band: {mid_band}\nVertical scan: {vertical_scan}',
    sortOrder: 42,
  },
  {
    id: 'fw-minimalist',
    key: 'minimalist',
    nameAr: 'بساطة (أقل هو أكثر)',
    nameEn: 'Minimalist (Less is More)',
    descriptionAr: 'تصميم نظيف مع مساحة بيضاء واسعة، تركيز على عنصر واحد رئيسي',
    descriptionEn: 'Clean design with ample white space, focus on one primary element',
    icon: '◻️',
    category: 'design',
    bestFor: ['STATIC_DESIGN', 'CAROUSEL', 'LANDING_PAGE'],
    objectives: ['awareness', 'conversion', 'trust_building'],
    fields: [
      {
        key: 'primary_element',
        label: 'Primary Element (Primary Element)',
        type: 'text',
        placeholder: 'The one thing to focus on',
        required: true,
      },
      {
        key: 'supporting',
        label: 'Supporting Text (Supporting Text)',
        type: 'textarea',
        placeholder: 'Minimal supporting copy',
        required: false,
      },
      {
        key: 'cta',
        label: 'CTA (CTA)',
        type: 'text',
        placeholder: 'Single clear action',
        required: true,
      },
    ],
    promptTemplate:
      'Structure design using Minimalist approach:\n\nPrimary element: {primary_element}\nSupporting text: {supporting}\nCTA: {cta}',
    sortOrder: 43,
  },
  {
    id: 'fw-story-brand',
    key: 'story_brand',
    nameAr: 'العلامة القصصية (Donald Miller)',
    nameEn: 'StoryBrand (Donald Miller)',
    descriptionAr: 'العميل هو البطل، علامتك هي المرشد الذي يساعده',
    descriptionEn: 'Customer is the hero, your brand is the guide that helps them',
    icon: '🏆',
    category: 'copywriting',
    bestFor: ['AD_COPY', 'LANDING_PAGE', 'PRESENTATION', 'EMAIL'],
    objectives: ['conversion', 'trust_building'],
    fields: [
      {
        key: 'hero',
        label: 'Hero (Customer) (Hero)',
        type: 'text',
        placeholder: 'Who is the customer?',
        required: true,
      },
      {
        key: 'problem',
        label: 'Problem (Problem)',
        type: 'textarea',
        placeholder: 'What is their problem?',
        required: true,
      },
      {
        key: 'guide',
        label: 'Guide (Your Brand) (Guide)',
        type: 'text',
        placeholder: 'How is your brand the guide?',
        required: true,
      },
      {
        key: 'plan',
        label: 'Plan (Plan)',
        type: 'textarea',
        placeholder: 'What is the plan to help them?',
        required: true,
      },
      {
        key: 'success',
        label: 'Success (Success)',
        type: 'textarea',
        placeholder: 'What does success look like?',
        required: true,
      },
    ],
    promptTemplate:
      'Structure content using StoryBrand framework:\n\nCustomer (hero): {hero}\nProblem: {problem}\nBrand (guide): {guide}\nPlan: {plan}\nSuccess: {success}',
    sortOrder: 7,
  },

  // ── EDUCATIONAL ──────────────────────────────────────
  {
    id: 'fw-listicle',
    key: 'listicle',
    nameAr: 'قائمة (Listicle)',
    nameEn: 'Listicle',
    descriptionAr: 'محتوى قائم على القوائم: رقم + عنوان + شرح لكل عنصر',
    descriptionEn: 'List-based content: number + title + explanation for each item',
    icon: '📋',
    category: 'educational',
    bestFor: ['BLOG_POST', 'CAROUSEL', 'REEL'],
    objectives: ['education', 'engagement', 'entertainment'],
    fields: [
      {
        key: 'hook',
        label: 'Hook / Intro (Hook)',
        type: 'textarea',
        placeholder: 'Why should they read the list?',
        required: true,
      },
      {
        key: 'items',
        label: 'List Items (List Items)',
        type: 'textarea',
        placeholder: 'List items with brief explanation each',
        required: true,
      },
      {
        key: 'outro',
        label: 'Outro / CTA (Outro)',
        type: 'textarea',
        placeholder: 'Summary and call to action',
        required: true,
      },
    ],
    promptTemplate:
      'Structure content as a listicle:\n\nHook: {hook}\nList items: {items}\nOutro: {outro}',
    sortOrder: 50,
  },
  {
    id: 'fw-how-to',
    key: 'how_to',
    nameAr: 'كيفية (دليل خطوة بخطوة)',
    nameEn: 'How-To (Step-by-Step Guide)',
    descriptionAr: 'دليل عملي يشرح كيفية إنجاز مهمة محددة خطوة بخطوة',
    descriptionEn: 'Practical guide explaining how to accomplish a specific task step by step',
    icon: '📝',
    category: 'educational',
    bestFor: ['BLOG_POST', 'VIDEO_LONG', 'REEL', 'CAROUSEL'],
    objectives: ['education', 'trust_building'],
    fields: [
      {
        key: 'goal',
        label: 'Goal (Goal)',
        type: 'text',
        placeholder: 'What will the reader achieve?',
        required: true,
      },
      {
        key: 'prerequisites',
        label: 'Prerequisites (Prerequisites)',
        type: 'textarea',
        placeholder: 'What is needed before starting?',
        required: false,
      },
      {
        key: 'steps',
        label: 'Steps (Steps)',
        type: 'textarea',
        placeholder: 'Step-by-step instructions',
        required: true,
      },
      {
        key: 'result',
        label: 'Expected Result (Expected Result)',
        type: 'textarea',
        placeholder: 'What success looks like',
        required: true,
      },
    ],
    promptTemplate:
      'Structure how-to content:\n\nGoal: {goal}\nPrerequisites: {prerequisites}\nSteps: {steps}\nExpected result: {result}',
    sortOrder: 51,
  },
  {
    id: 'fw-myth-vs-fact',
    key: 'myth_vs_fact',
    nameAr: 'خرافة vs حقيقة',
    nameEn: 'Myth vs Fact',
    descriptionAr: 'دحض المفاهيم الخاطئة من خلال تقديم الحقائق',
    descriptionEn: 'Debunk misconceptions by presenting facts',
    icon: '❓',
    category: 'educational',
    bestFor: ['CAROUSEL', 'REEL', 'BLOG_POST', 'STORY'],
    objectives: ['education', 'engagement', 'trust_building'],
    fields: [
      {
        key: 'myth',
        label: 'The Myth (The Myth)',
        type: 'textarea',
        placeholder: 'What do people believe?',
        required: true,
      },
      {
        key: 'fact',
        label: 'The Fact (The Fact)',
        type: 'textarea',
        placeholder: 'What is the truth?',
        required: true,
      },
      {
        key: 'explanation',
        label: 'Explanation (Explanation)',
        type: 'textarea',
        placeholder: 'Why is it a myth?',
        required: true,
      },
    ],
    promptTemplate:
      'Structure myth vs fact content:\n\nMyth: {myth}\nFact: {fact}\nExplanation: {explanation}',
    sortOrder: 52,
  },
  {
    id: 'fw-q-and-a',
    key: 'q_and_a',
    nameAr: 'سؤال وجواب',
    nameEn: 'Q&A',
    descriptionAr: 'أجب على الأسئلة الشائعة بطريقة منظمة ومفيدة',
    descriptionEn: 'Answer frequently asked questions in an organized, helpful way',
    icon: '❔',
    category: 'educational',
    bestFor: ['BLOG_POST', 'CAROUSEL', 'VIDEO_LONG'],
    objectives: ['education', 'trust_building', 'engagement'],
    fields: [
      {
        key: 'context',
        label: 'Context (Context)',
        type: 'textarea',
        placeholder: 'What topic are we addressing?',
        required: true,
      },
      {
        key: 'questions',
        label: 'Questions & Answers (Questions & Answers)',
        type: 'textarea',
        placeholder: 'Q&A pairs',
        required: true,
      },
      {
        key: 'cta',
        label: 'Next Steps (Next Steps)',
        type: 'textarea',
        placeholder: 'What to do if they have more questions',
        required: false,
      },
    ],
    promptTemplate:
      'Structure Q&A content:\n\nContext: {context}\nQuestions & Answers: {questions}\nNext steps: {cta}',
    sortOrder: 53,
  },
  {
    id: 'fw-tips-and-tricks',
    key: 'tips_and_tricks',
    nameAr: 'نصائح وحيل',
    nameEn: 'Tips & Tricks',
    descriptionAr: 'مجموعة من النصائح السريعة والقابلة للتطبيق',
    descriptionEn: 'Collection of quick, actionable tips',
    icon: '💡',
    category: 'educational',
    bestFor: ['REEL', 'CAROUSEL', 'STORY', 'BLOG_POST'],
    objectives: ['education', 'entertainment', 'engagement'],
    fields: [
      {
        key: 'intro',
        label: 'Introduction (Introduction)',
        type: 'textarea',
        placeholder: 'What area do the tips cover?',
        required: true,
      },
      {
        key: 'tips',
        label: 'Tips (Tips)',
        type: 'textarea',
        placeholder: 'Actionable tips with brief explanation',
        required: true,
      },
      {
        key: 'cta',
        label: 'CTA (CTA)',
        type: 'textarea',
        placeholder: 'What to do next',
        required: true,
      },
    ],
    promptTemplate:
      'Structure tips & tricks content:\n\nIntroduction: {intro}\nTips: {tips}\nCTA: {cta}',
    sortOrder: 54,
  },
  {
    id: 'fw-case-study',
    key: 'case_study',
    nameAr: 'دراسة حالة',
    nameEn: 'Case Study',
    descriptionAr: 'اعرض مشكلة عميل حقيقية وحلك لها والنتائج',
    descriptionEn: 'Showcase a real client problem, your solution, and results',
    icon: '📊',
    category: 'educational',
    bestFor: ['BLOG_POST', 'PRESENTATION', 'CAROUSEL'],
    objectives: ['trust_building', 'conversion', 'education'],
    fields: [
      {
        key: 'client',
        label: 'Client Background (Client Background)',
        type: 'textarea',
        placeholder: 'Who is the client?',
        required: true,
      },
      {
        key: 'challenge',
        label: 'Challenge (Challenge)',
        type: 'textarea',
        placeholder: 'What was the problem?',
        required: true,
      },
      {
        key: 'solution',
        label: 'Our Solution (Our Solution)',
        type: 'textarea',
        placeholder: 'How did we solve it?',
        required: true,
      },
      {
        key: 'results',
        label: 'Results (Results)',
        type: 'textarea',
        placeholder: 'Quantifiable outcomes',
        required: true,
      },
    ],
    promptTemplate:
      'Structure case study content:\n\nClient: {client}\nChallenge: {challenge}\nSolution: {solution}\nResults: {results}',
    sortOrder: 55,
  },

  // ── ADVANCED COPYWRITING ─────────────────────────────
  {
    id: 'fw-aaa',
    key: 'aaa',
    nameAr: 'AAA (Awareness-Acceptance-Action)',
    nameEn: 'AAA (Awareness-Acceptance-Action)',
    descriptionAr: 'وعي بمشكلة → قبول بالحاجة إلى حل → اتخاذ إجراء',
    descriptionEn: 'Awareness of problem → Acceptance of solution need → Action',
    icon: '🔄',
    category: 'copywriting',
    bestFor: ['AD_COPY', 'EMAIL', 'CAROUSEL'],
    objectives: ['conversion', 'awareness'],
    fields: [
      {
        key: 'awareness',
        label: 'Awareness (Awareness)',
        type: 'textarea',
        placeholder: 'Make them aware of the problem',
        required: true,
      },
      {
        key: 'acceptance',
        label: 'Acceptance (Acceptance)',
        type: 'textarea',
        placeholder: 'Help them accept the solution',
        required: true,
      },
      {
        key: 'action',
        label: 'Action (Action)',
        type: 'textarea',
        placeholder: 'Clear next step',
        required: true,
      },
    ],
    promptTemplate:
      'Structure content using AAA:\n\nAwareness: {awareness}\nAcceptance: {acceptance}\nAction: {action}',
    sortOrder: 8,
  },
  {
    id: 'fw-fear-urgency',
    key: 'fear_urgency',
    nameAr: 'خوف-إلحاح',
    nameEn: 'Fear + Urgency',
    descriptionAr: 'استخدم الخوف من تفويت الفرصة (FOMO) والإلحاح لتحفيز الإجراء',
    descriptionEn: 'Use fear of missing out and urgency to drive action',
    icon: '⏰',
    category: 'copywriting',
    bestFor: ['AD_COPY', 'EMAIL', 'CAROUSEL'],
    objectives: ['conversion'],
    fields: [
      {
        key: 'risk',
        label: 'Risk of Inaction (Risk)',
        type: 'textarea',
        placeholder: 'What do they lose by waiting?',
        required: true,
      },
      {
        key: 'urgency',
        label: 'Urgency Trigger (Urgency)',
        type: 'textarea',
        placeholder: 'Why must they act now?',
        required: true,
      },
      {
        key: 'solution',
        label: 'Solution (Solution)',
        type: 'textarea',
        placeholder: 'What solves their fear?',
        required: true,
      },
    ],
    promptTemplate:
      'Structure content using Fear + Urgency:\n\nRisk of inaction: {risk}\nUrgency: {urgency}\nSolution: {solution}',
    sortOrder: 9,
  },
]
