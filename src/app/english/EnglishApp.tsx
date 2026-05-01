'use client'

import { useEffect, useMemo, useState, type CSSProperties } from 'react'

type GameTab = 'quests' | 'speaking' | 'writing' | 'review'
type EnglishPageMode = 'home' | GameTab
type SkillLaneId = 'vocabulary' | 'grammar' | 'reading' | 'conversation'

type SkillLane = {
  id: SkillLaneId
  title: string
  tag: string
  description: string
  color: string
}

type Quest = {
  id: string
  lane: SkillLaneId
  label: string
  title: string
  subtitle: string
  difficulty: string
  minutes: number
  xp: number
  prompt: string
  context: string
  options: string[]
  answer: string
  explanation: string
  coachNote: string
  transferTip: string
  speakingPrompt: string
  writingPrompt: string
}

type QuestProgress = {
  selectedAnswer: string | null
  attempts: number
  correctAttempts: number
  completed: boolean
  completedAt: string | null
  lastAnsweredAt: string | null
}

type EnglishProfile = {
  xp: number
  streak: number
  lastPlayedDay: string | null
  dailyFocusDay: string | null
  writingLoggedDay: string | null
  speakingLoggedDay: string | null
  activeQuestId: string
  questProgress: Record<string, QuestProgress>
  completedQuestIds: string[]
  attempts: number
  correct: number
  focusMinutes: number
  writingDraft: string
  speakingDraft: string
}

const STORAGE_KEY = 'english-quest-campus-v1'
const LEVEL_SIZE = 180

const TRAINING_LINKS: Array<{
  id: GameTab
  label: string
  href: string
  description: string
}> = [
  {
    id: 'quests',
    label: 'Quest map',
    href: '/e/quests',
    description: 'Focused multiple-choice quests with instant feedback and transfer prompts.',
  },
  {
    id: 'speaking',
    label: 'Speaking lab',
    href: '/e/speaking',
    description: 'One prompt, useful repair phrases, and a quick reflection loop.',
  },
  {
    id: 'writing',
    label: 'Writing forge',
    href: '/e/writing',
    description: 'Short writing reps with simple checks for clarity and structure.',
  },
  {
    id: 'review',
    label: 'Review room',
    href: '/e/review',
    description: 'Progress, mastery by skill lane, and replay links for weak nodes.',
  },
]

const SKILL_LANES: SkillLane[] = [
  {
    id: 'vocabulary',
    title: 'Vocabulary',
    tag: 'VOC',
    description: 'Train high-utility words through context, not flashcard boredom.',
    color: '#12bfae',
  },
  {
    id: 'grammar',
    title: 'Grammar',
    tag: 'GRM',
    description: 'Fix patterns that actually unlock clearer speaking and writing.',
    color: '#f59e0b',
  },
  {
    id: 'reading',
    title: 'Reading',
    tag: 'RDG',
    description: 'Practice inference, purpose, and IELTS-style careful scanning.',
    color: '#3b82f6',
  },
  {
    id: 'conversation',
    title: 'Conversation',
    tag: 'DLG',
    description: 'Build natural replies, repair phrases, and speaking confidence.',
    color: '#ec4899',
  },
]

const QUESTS: Quest[] = [
  {
    id: 'resilient-context',
    lane: 'vocabulary',
    label: 'Quest 01',
    title: 'Context Clue Sprint',
    subtitle: 'Read one sentence, steal the meaning, use it immediately.',
    difficulty: 'Warm-up',
    minutes: 4,
    xp: 65,
    prompt: 'In the sentence, what does "resilient" most nearly mean?',
    context:
      'After failing two mock interviews, Mina stayed resilient: she reviewed the feedback, practiced again, and performed much better the next week.',
    options: ['quick to recover', 'easy to confuse', 'angry without reason', 'too expensive'],
    answer: 'quick to recover',
    explanation:
      'Resilient describes someone or something that recovers after difficulty. Mina improves after setbacks instead of giving up.',
    coachNote: 'Say your own sentence aloud: "I stayed resilient when..." This turns passive vocab into usable language.',
    transferTip: 'Useful for IELTS Speaking Part 2 stories about challenges, study, sport, work, or personal growth.',
    speakingPrompt: 'Describe a time when you had to stay resilient after something went wrong.',
    writingPrompt: 'Write two sentences explaining why resilience is useful for students preparing for exams.',
  },
  {
    id: 'past-perfect-forge',
    lane: 'grammar',
    label: 'Quest 02',
    title: 'Past Perfect Forge',
    subtitle: 'Make time order obvious so your stories stop sounding flat.',
    difficulty: 'Core',
    minutes: 5,
    xp: 70,
    prompt: 'Choose the best sentence.',
    context:
      'You want to explain that the train left first, and you arrived at the station after that.',
    options: [
      'When I arrived at the station, the train had already left.',
      'When I had arrived at the station, the train already leaves.',
      'When I arrive at the station, the train had already left.',
      'When I arrived at the station, the train has already left.',
    ],
    answer: 'When I arrived at the station, the train had already left.',
    explanation:
      'Use past perfect for the earlier past action: the train had already left before you arrived.',
    coachNote: 'Formula: later past action + earlier past action with "had + past participle".',
    transferTip: 'This pattern makes IELTS Speaking stories much clearer when you explain background events.',
    speakingPrompt: 'Tell a 30-second story using "had already" at least once.',
    writingPrompt: 'Write a short story opening that uses past perfect to explain what happened before the main event.',
  },
  {
    id: 'study-pod-reading',
    lane: 'reading',
    label: 'Quest 03',
    title: 'Reading Radar',
    subtitle: 'Find the writer purpose instead of hunting random keywords.',
    difficulty: 'IELTS',
    minutes: 7,
    xp: 85,
    prompt: 'What is the main point of the passage?',
    context:
      'Some universities rent quiet study pods to students. A pilot found that students did not study much longer, but they completed more tasks and felt less tired. Researchers warned that pods were not useful for every activity; they worked best for short, focused tasks.',
    options: [
      'Study pods help most when they match a specific task.',
      'Students should always study alone.',
      'Universities should replace libraries with pods.',
      'Longer study time is the only sign of success.',
    ],
    answer: 'Study pods help most when they match a specific task.',
    explanation:
      'The passage balances benefits with limits, then concludes that the tool works when matched to the task.',
    coachNote: 'Before choosing, ask: "What does every paragraph point toward?" That is usually the main idea.',
    transferTip: 'Use this strategy for IELTS Reading questions asking purpose, main idea, or writer attitude.',
    speakingPrompt: 'Describe your best study environment and explain which tasks it helps you finish.',
    writingPrompt: 'Write a short opinion paragraph: Are focused study spaces more useful than long study hours?',
  },
  {
    id: 'natural-reply-arena',
    lane: 'conversation',
    label: 'Quest 04',
    title: 'Natural Reply Arena',
    subtitle: 'Pick the reply a real person would actually say.',
    difficulty: 'Social',
    minutes: 4,
    xp: 60,
    prompt: 'Your friend says: "I am nervous about giving my presentation tomorrow." What is the best reply?',
    context:
      'Choose a reply that sounds supportive, natural, and specific enough to keep the conversation moving.',
    options: [
      'That makes sense. Want to practice the opening once together?',
      'You should not be nervous because presentations are easy.',
      'I do not know. Anyway, I am hungry.',
      'Your presentation tomorrow nervous is very understandable for me.',
    ],
    answer: 'That makes sense. Want to practice the opening once together?',
    explanation:
      'This reply validates the feeling and offers a concrete next step. It sounds natural and useful.',
    coachNote: 'Good conversation often has two moves: acknowledge the feeling, then offer a bridge forward.',
    transferTip: 'Great for real chats, interviews, speaking tests, and support messages.',
    speakingPrompt: 'Practice responding to a friend who is worried, tired, or disappointed.',
    writingPrompt: 'Write three supportive replies you could send to a friend before an important event.',
  },
  {
    id: 'thesis-lock',
    lane: 'grammar',
    label: 'Quest 05',
    title: 'Thesis Lock',
    subtitle: 'Turn a vague IELTS opinion into a clear, balanced stance.',
    difficulty: 'Writing',
    minutes: 8,
    xp: 90,
    prompt: 'Which thesis is strongest for an IELTS Task 2 essay?',
    context:
      'Question: Some people think schools should focus more on practical life skills than academic subjects. To what extent do you agree?',
    options: [
      'I partly agree because practical skills are important, but academic subjects still build deeper thinking.',
      'This essay will discuss practical skills and academic subjects.',
      'I agree and disagree and there are many reasons in society today.',
      'Practical skills are good for students in many ways, I think.',
    ],
    answer:
      'I partly agree because practical skills are important, but academic subjects still build deeper thinking.',
    explanation:
      'The best thesis gives a clear position, a contrast, and the reason for the balance. The others are too vague.',
    coachNote: 'A strong thesis should answer the question before the body paragraphs begin.',
    transferTip: 'Use this structure for agree/disagree questions where a balanced answer is more realistic.',
    speakingPrompt: 'Explain whether schools should teach more life skills. Give one example.',
    writingPrompt:
      'Write a 90-word introduction for this topic with background sentence, clear thesis, and essay direction.',
  },
  {
    id: 'repair-phrase-kit',
    lane: 'conversation',
    label: 'Quest 06',
    title: 'Repair Phrase Kit',
    subtitle: 'Learn the tiny phrases that save you when speaking gets messy.',
    difficulty: 'Fluency',
    minutes: 5,
    xp: 75,
    prompt: 'Which phrase is best when you need a moment to think during speaking?',
    context:
      'You are answering a question, but you need two seconds to organize your idea without going silent.',
    options: [
      'Let me put that another way.',
      'I cannot speak English.',
      'Please wait one hundred minutes.',
      'This question is very question.',
    ],
    answer: 'Let me put that another way.',
    explanation:
      'This phrase buys time naturally and signals that you are clarifying your answer, not giving up.',
    coachNote: 'Other useful repair phrases: "What I mean is...", "The main point is...", "For example...".',
    transferTip: 'Repair phrases are small, but they can make IELTS Speaking sound calmer and more fluent.',
    speakingPrompt: 'Answer a question for 45 seconds and use one repair phrase when you hesitate.',
    writingPrompt: 'Write five repair phrases and one situation where each phrase would help.',
  },
  {
    id: 'subtle-meaning-shift',
    lane: 'vocabulary',
    label: 'Quest 07',
    title: 'Subtle Meaning Shift',
    subtitle: 'Catch the quiet difference between similar academic words.',
    difficulty: 'Vocab',
    minutes: 5,
    xp: 70,
    prompt: 'In the sentence, what does "subtle" most nearly mean?',
    context:
      'The speaker did not openly criticize the plan, but her subtle hesitation made the team realize she had doubts.',
    options: ['not easy to notice', 'extremely loud', 'legally required', 'quickly repaired'],
    answer: 'not easy to notice',
    explanation:
      'Subtle means not obvious or easy to notice. Her hesitation was small, but it still communicated doubt.',
    coachNote: 'Pair it with nouns like subtle difference, subtle change, subtle signal, or subtle improvement.',
    transferTip: 'Useful for IELTS descriptions where you need precise language instead of simple words like small.',
    speakingPrompt: 'Describe a subtle change you noticed in a person, place, or routine.',
    writingPrompt: 'Write three sentences using subtle, obvious, and dramatic to compare different kinds of change.',
  },
  {
    id: 'repair-cafe-inference',
    lane: 'reading',
    label: 'Quest 08',
    title: 'Inference Scanner',
    subtitle: 'Read what the writer implies without inventing extra facts.',
    difficulty: 'IELTS',
    minutes: 7,
    xp: 85,
    prompt: 'What can be inferred from the passage?',
    context:
      'A town opened a repair cafe where volunteers helped residents fix household items. Not every repair was cheaper than buying a replacement, but many residents said they felt more confident and less wasteful afterwards.',
    options: [
      'The cafe changed attitudes, not only costs.',
      'The cafe repaired every item successfully.',
      'Residents stopped buying new products completely.',
      'Volunteers were paid more than technicians.',
    ],
    answer: 'The cafe changed attitudes, not only costs.',
    explanation:
      'The passage says cost was not always the main benefit. Confidence and reduced wastefulness show a change in attitude.',
    coachNote: 'Inference answers should be supported by the text, but not copied word-for-word from it.',
    transferTip: 'This is a core IELTS Reading skill for questions that ask what is suggested or implied.',
    speakingPrompt: 'Talk about one habit people could change to waste less.',
    writingPrompt: 'Write a short paragraph about whether repair culture should be taught in schools.',
  },
  {
    id: 'relative-clause-lift',
    lane: 'grammar',
    label: 'Quest 09',
    title: 'Relative Clause Lift',
    subtitle: 'Combine ideas so your English sounds smoother and less robotic.',
    difficulty: 'Grammar',
    minutes: 6,
    xp: 75,
    prompt: 'Which sentence combines the ideas most naturally?',
    context:
      'Idea A: The student won the prize. Idea B: The student designed a low-cost water filter.',
    options: [
      'The student who designed a low-cost water filter won the prize.',
      'The student won the prize who designed a low-cost water filter.',
      'The student designed a low-cost water filter which won the prize student.',
      'The student, because designed water filter, won prize.',
    ],
    answer: 'The student who designed a low-cost water filter won the prize.',
    explanation:
      'Use who to add information about a person. The clause sits right after the noun it describes: the student.',
    coachNote: 'Relative clauses help you add detail without creating many short, choppy sentences.',
    transferTip: 'Great for IELTS Writing Task 1 descriptions and Task 2 examples.',
    speakingPrompt: 'Describe a person who helped you learn something important.',
    writingPrompt: 'Write four sentences using who, which, where, and that.',
  },
  {
    id: 'clarifying-question',
    lane: 'conversation',
    label: 'Quest 10',
    title: 'Clarifying Question',
    subtitle: 'Keep a conversation alive when the meaning is not clear yet.',
    difficulty: 'Social',
    minutes: 4,
    xp: 65,
    prompt: 'Your classmate says: "The assignment is flexible." What is the best clarification?',
    context:
      'You want to understand whether flexible means the topic, deadline, format, or length can change.',
    options: [
      'Do you mean the deadline is flexible, or the format?',
      'That word is impossible and I disagree.',
      'I am flexible assignment too.',
      'Please never use that sentence again.',
    ],
    answer: 'Do you mean the deadline is flexible, or the format?',
    explanation:
      'The best reply asks a specific question and gives possible meanings, which makes the conversation easier.',
    coachNote: 'Clarifying questions are confidence tools. They show attention, not weakness.',
    transferTip: 'Useful in real classes, work chats, interviews, and speaking tests when a question is broad.',
    speakingPrompt: 'Practice asking three clarification questions about a school or work task.',
    writingPrompt: 'Write a short dialogue where one person politely clarifies unclear instructions.',
  },
  {
    id: 'collocation-control',
    lane: 'vocabulary',
    label: 'Quest 11',
    title: 'Collocation Control',
    subtitle: 'Choose the verb that naturally travels with the noun.',
    difficulty: 'Vocab',
    minutes: 5,
    xp: 70,
    prompt: 'Which phrase is the most natural English collocation?',
    context:
      'You want to say someone decided after thinking carefully.',
    options: ['make a decision', 'do a decision', 'take a decision homework', 'build a decision loudly'],
    answer: 'make a decision',
    explanation:
      'In everyday English, people usually say make a decision. Collocations make your output sound more natural.',
    coachNote: 'Do not learn only single words. Learn useful word partnerships: make progress, take notes, reach a goal.',
    transferTip: 'Collocations improve IELTS lexical resource because they sound natural and precise.',
    speakingPrompt: 'Use make progress, take notes, and reach a goal in a short answer about studying.',
    writingPrompt: 'Write five study-related collocations and one example sentence for each.',
  },
  {
    id: 'remote-work-purpose',
    lane: 'reading',
    label: 'Quest 12',
    title: 'Purpose Finder',
    subtitle: 'Spot why a writer includes a detail, not just what the detail says.',
    difficulty: 'IELTS',
    minutes: 7,
    xp: 85,
    prompt: 'Why does the writer mention commuting time?',
    context:
      'A report on remote work found that employees saved an average of forty minutes per day by avoiding the commute. The writer then argued that this time saving mattered only when workers used it for rest, family, or focused work instead of simply extending their working hours.',
    options: [
      'To show that saved time needs to be used wisely.',
      'To prove all offices should close forever.',
      'To argue that commuting is always relaxing.',
      'To explain how trains are scheduled.',
    ],
    answer: 'To show that saved time needs to be used wisely.',
    explanation:
      'The detail supports the wider point: time saved from commuting is valuable only if it improves life or focus.',
    coachNote: 'Purpose questions often ask why a detail appears. Link the detail to the paragraph argument.',
    transferTip: 'This helps with IELTS questions about examples, evidence, and writer intention.',
    speakingPrompt: 'Explain whether remote study or office study helps you focus more.',
    writingPrompt: 'Write a balanced paragraph about one advantage and one risk of remote work.',
  },
  {
    id: 'conditional-rescue',
    lane: 'grammar',
    label: 'Quest 13',
    title: 'Conditional Rescue',
    subtitle: 'Use if-sentences to talk about possible future results.',
    difficulty: 'Grammar',
    minutes: 6,
    xp: 75,
    prompt: 'Choose the best first conditional sentence.',
    context:
      'You want to say that a person will improve if they practice every day.',
    options: [
      'If she practices every day, she will improve.',
      'If she will practice every day, she improves.',
      'If she practiced every day, she will improved.',
      'If practice every day, she improving.',
    ],
    answer: 'If she practices every day, she will improve.',
    explanation:
      'First conditional uses if + present simple, then will + base verb for a realistic future result.',
    coachNote: 'This pattern is useful because it sounds clear and practical: If I do X, Y will happen.',
    transferTip: 'Great for IELTS answers about education, health, technology, and government policy.',
    speakingPrompt: 'Make three if-sentences about improving English this month.',
    writingPrompt: 'Write a short advice paragraph using at least two first conditional sentences.',
  },
  {
    id: 'polite-disagreement',
    lane: 'conversation',
    label: 'Quest 14',
    title: 'Polite Disagreement',
    subtitle: 'Disagree without sounding sharp or shutting the door.',
    difficulty: 'Social',
    minutes: 5,
    xp: 70,
    prompt: 'Which reply disagrees most politely?',
    context:
      'Someone says: "Online classes are always better than face-to-face classes." You partly disagree.',
    options: [
      'I see your point, but I think face-to-face classes can be better for discussion.',
      'No, that is wrong and you do not understand school.',
      'Online classes always better because yes.',
      'I disagree everything forever.',
    ],
    answer: 'I see your point, but I think face-to-face classes can be better for discussion.',
    explanation:
      'The best answer acknowledges the other view first, then gives a clear but respectful contrast.',
    coachNote: 'Polite disagreement often uses a soft opener: I see your point, but... or I partly agree, however...',
    transferTip: 'This is useful for IELTS Speaking Part 3 and real discussions where tone matters.',
    speakingPrompt: 'Practice politely disagreeing with three broad opinions about school or technology.',
    writingPrompt: 'Write four polite disagreement phrases and one example sentence for each.',
  },
  {
    id: 'hedging-power',
    lane: 'vocabulary',
    label: 'Quest 15',
    title: 'Hedging Power',
    subtitle: 'Sound thoughtful by avoiding claims that are too absolute.',
    difficulty: 'Academic',
    minutes: 6,
    xp: 80,
    prompt: 'Which sentence uses academic hedging best?',
    context:
      'You want to make a careful claim about social media and attention.',
    options: [
      'Social media may reduce attention for some students when it interrupts focused study.',
      'Social media destroys every brain in every situation.',
      'Social media good attention always.',
      'No student can ever study if a phone exists.',
    ],
    answer: 'Social media may reduce attention for some students when it interrupts focused study.',
    explanation:
      'Words like may and some make the claim more careful, realistic, and academic.',
    coachNote: 'Hedging is not weakness. It is precision. Try may, can, often, tends to, and in some cases.',
    transferTip: 'Hedging helps IELTS Writing Task 2 sound balanced and mature.',
    speakingPrompt: 'Explain a technology opinion using may, can, and in some cases.',
    writingPrompt: 'Rewrite three extreme opinions so they sound more balanced and academic.',
  },
  {
    id: 'museum-detail-role',
    lane: 'reading',
    label: 'Quest 16',
    title: 'Detail Role Radar',
    subtitle: 'Figure out what a sentence is doing inside the paragraph.',
    difficulty: 'IELTS',
    minutes: 7,
    xp: 85,
    prompt: 'What role does the accessibility detail play?',
    context:
      'A museum shortened long wall labels and added QR codes for visitors who wanted deeper information. However, staff kept a clear basic caption beside each artwork because some visitors could not or did not want to use phones.',
    options: [
      'It shows why a balanced design is needed.',
      'It proves QR codes should be banned.',
      'It says phones make art less valuable.',
      'It describes ticket prices.',
    ],
    answer: 'It shows why a balanced design is needed.',
    explanation:
      'The accessibility detail explains why QR codes alone are not enough. The solution needs both wall text and optional deeper layers.',
    coachNote: 'When a passage says however, the next detail often limits or balances the previous point.',
    transferTip: 'This skill helps with IELTS questions about paragraph function and writer attitude.',
    speakingPrompt: 'Describe a public place that should be designed for different kinds of visitors.',
    writingPrompt: 'Write a paragraph about why digital tools should not completely replace physical information.',
  },
  {
    id: 'article-precision',
    lane: 'grammar',
    label: 'Quest 17',
    title: 'Article Precision',
    subtitle: 'Use a, an, and the to make nouns feel controlled.',
    difficulty: 'Grammar',
    minutes: 5,
    xp: 70,
    prompt: 'Choose the most natural sentence.',
    context:
      'You are introducing one new idea: a useful app. Then you refer to that same app again.',
    options: [
      'I found a useful app yesterday. The app helps me review vocabulary.',
      'I found the useful app yesterday. A app helps me review vocabulary.',
      'I found useful app yesterday. App helps me review vocabulary.',
      'I found an useful app yesterday. A app helps me review vocabulary.',
    ],
    answer: 'I found a useful app yesterday. The app helps me review vocabulary.',
    explanation:
      'Use a when introducing one new countable noun. Use the when referring to the same thing again.',
    coachNote: 'A useful app is correct because useful starts with a consonant sound: yoo.',
    transferTip: 'Articles affect clarity in IELTS Writing, especially when introducing examples.',
    speakingPrompt: 'Talk about a tool you use. Introduce it with a, then refer to it with the.',
    writingPrompt: 'Write five sentence pairs where you introduce a noun and then refer to it again.',
  },
  {
    id: 'follow-up-engine',
    lane: 'conversation',
    label: 'Quest 18',
    title: 'Follow-up Engine',
    subtitle: 'Ask the next question that makes someone want to continue.',
    difficulty: 'Fluency',
    minutes: 4,
    xp: 65,
    prompt: 'Your friend says: "I started learning guitar last month." What is the best follow-up?',
    context:
      'Choose a natural reply that invites more detail and shows real interest.',
    options: [
      'What made you choose guitar?',
      'Guitar is an object.',
      'I started last month learning guitar friend.',
      'Please stop talking about music.',
    ],
    answer: 'What made you choose guitar?',
    explanation:
      'This follow-up is open, specific, and easy to answer. It helps the conversation continue naturally.',
    coachNote: 'Good follow-ups often start with what, how, or why, and connect to something the person just said.',
    transferTip: 'Follow-up questions help both casual conversation and IELTS Speaking Part 1 sound more interactive.',
    speakingPrompt: 'Ask five follow-up questions about hobbies, food, study, travel, and work.',
    writingPrompt: 'Write a short conversation where each person asks one natural follow-up question.',
  },
]

const FAQ_ITEMS = [
  {
    question: 'Is this still useful for IELTS?',
    answer:
      'Yes. The app trains IELTS-friendly skills, but keeps each loop small enough to repeat daily: reading purpose, thesis clarity, natural speaking, grammar, and vocabulary in context.',
  },
  {
    question: 'Why make English practice feel like a game?',
    answer:
      'Because consistency beats heroic one-day study. XP, quests, streaks, and visible progress make it easier to return tomorrow.',
  },
  {
    question: 'Does progress save?',
    answer:
      'Progress, drafts, streaks, completed quests, XP, and accuracy are saved locally in your browser.',
  },
  {
    question: 'What should I do each day?',
    answer:
      'Clear one quest, speak the prompt aloud, and write a short response. That is a compact loop with reading, output, feedback, and review.',
  },
]

const DEFAULT_PROFILE: EnglishProfile = {
  xp: 0,
  streak: 0,
  lastPlayedDay: null,
  dailyFocusDay: null,
  writingLoggedDay: null,
  speakingLoggedDay: null,
  activeQuestId: QUESTS[0].id,
  questProgress: {},
  completedQuestIds: [],
  attempts: 0,
  correct: 0,
  focusMinutes: 0,
  writingDraft: '',
  speakingDraft: '',
}

function dayKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function yesterdayKey() {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  return dayKey(date)
}

function countWords(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function stableIndex(seed: string, modulo: number) {
  if (modulo <= 0) {
    return 0
  }

  let hash = 0
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 9973
  }
  return hash % modulo
}

function orderedQuestOptions(quest: Quest) {
  const distractors = quest.options.filter((option) => option !== quest.answer)

  if (quest.options.length < 2 || distractors.length === quest.options.length) {
    return quest.options
  }

  const offset = stableIndex(quest.id, distractors.length)
  const rotatedDistractors = [...distractors.slice(offset), ...distractors.slice(0, offset)]
  const answerIndex = stableIndex(`${quest.id}-answer`, rotatedDistractors.length) + 1

  return [
    ...rotatedDistractors.slice(0, answerIndex),
    quest.answer,
    ...rotatedDistractors.slice(answerIndex),
  ]
}

function blankQuestProgress(): QuestProgress {
  return {
    selectedAnswer: null,
    attempts: 0,
    correctAttempts: 0,
    completed: false,
    completedAt: null,
    lastAnsweredAt: null,
  }
}

function questExists(id: string) {
  return QUESTS.some((quest) => quest.id === id)
}

function normalizeQuestProgress(
  savedProgress: Partial<Record<string, Partial<QuestProgress>>> | undefined,
  completedQuestIds: string[],
) {
  return QUESTS.reduce<Record<string, QuestProgress>>((progress, quest) => {
    const saved = savedProgress?.[quest.id]
    const completed = Boolean(saved?.completed || completedQuestIds.includes(quest.id))
    const selectedAnswer = typeof saved?.selectedAnswer === 'string' ? saved.selectedAnswer : null

    progress[quest.id] = {
      ...blankQuestProgress(),
      selectedAnswer,
      attempts: typeof saved?.attempts === 'number' ? saved.attempts : 0,
      correctAttempts: typeof saved?.correctAttempts === 'number' ? saved.correctAttempts : 0,
      completed,
      completedAt: typeof saved?.completedAt === 'string' ? saved.completedAt : null,
      lastAnsweredAt: typeof saved?.lastAnsweredAt === 'string' ? saved.lastAnsweredAt : null,
    }

    return progress
  }, {})
}

function safeProfile(value: unknown): EnglishProfile {
  if (!value || typeof value !== 'object') {
    return DEFAULT_PROFILE
  }

  const saved = value as Partial<EnglishProfile>
  const savedCompletedQuestIds = Array.isArray(saved.completedQuestIds)
    ? saved.completedQuestIds.filter((id) => typeof id === 'string' && questExists(id))
    : []
  const progressCompletedQuestIds = Object.entries(saved.questProgress ?? {})
    .filter(([, progress]) => progress?.completed)
    .map(([id]) => id)
    .filter(questExists)
  const completedQuestIds = Array.from(new Set([...savedCompletedQuestIds, ...progressCompletedQuestIds]))
  const savedActiveQuestId = typeof saved.activeQuestId === 'string' && questExists(saved.activeQuestId)
    ? saved.activeQuestId
    : null

  return {
    ...DEFAULT_PROFILE,
    ...saved,
    activeQuestId: savedActiveQuestId ?? completedQuestIds[0] ?? DEFAULT_PROFILE.activeQuestId,
    questProgress: normalizeQuestProgress(saved.questProgress, completedQuestIds),
    completedQuestIds,
    xp: typeof saved.xp === 'number' ? saved.xp : DEFAULT_PROFILE.xp,
    streak: typeof saved.streak === 'number' ? saved.streak : DEFAULT_PROFILE.streak,
    attempts: typeof saved.attempts === 'number' ? saved.attempts : DEFAULT_PROFILE.attempts,
    correct: typeof saved.correct === 'number' ? saved.correct : DEFAULT_PROFILE.correct,
    focusMinutes: typeof saved.focusMinutes === 'number' ? saved.focusMinutes : DEFAULT_PROFILE.focusMinutes,
  }
}

function markStudyDay(profile: EnglishProfile) {
  const today = dayKey()

  if (profile.lastPlayedDay === today) {
    return { streak: profile.streak, lastPlayedDay: today }
  }

  return {
    streak: profile.lastPlayedDay === yesterdayKey() ? profile.streak + 1 : 1,
    lastPlayedDay: today,
  }
}

function laneFor(id: SkillLaneId) {
  return SKILL_LANES.find((lane) => lane.id === id) ?? SKILL_LANES[0]
}

function speakText(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return
  }

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  utterance.rate = 0.92
  utterance.pitch = 1
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)
}

export default function EnglishApp({ page = 'home' }: { page?: EnglishPageMode }) {
  const [profile, setProfile] = useState<EnglishProfile>(DEFAULT_PROFILE)
  const [hydrated, setHydrated] = useState(false)
  const [selectedQuestId, setSelectedQuestId] = useState(QUESTS[0].id)

  const activeTab: GameTab = page === 'home' ? 'quests' : page
  const isHome = page === 'home'

  const activeQuest = useMemo(
    () => QUESTS.find((quest) => quest.id === selectedQuestId) ?? QUESTS[0],
    [selectedQuestId],
  )
  const activeOptions = useMemo(() => orderedQuestOptions(activeQuest), [activeQuest])

  const activeLane = laneFor(activeQuest.lane)
  const completedCount = profile.completedQuestIds.length
  const accuracy = profile.attempts > 0 ? Math.round((profile.correct / profile.attempts) * 100) : 0
  const level = Math.floor(profile.xp / LEVEL_SIZE) + 1
  const levelBase = (level - 1) * LEVEL_SIZE
  const levelProgress = clampPercent(((profile.xp - levelBase) / LEVEL_SIZE) * 100)
  const today = dayKey()
  const activeProgress = profile.questProgress[activeQuest.id] ?? blankQuestProgress()
  const selectedAnswer = activeProgress.selectedAnswer
  const alreadyCompleted = activeProgress.completed || profile.completedQuestIds.includes(activeQuest.id)
  const answeredCorrectly = selectedAnswer === activeQuest.answer
  const writingWords = countWords(profile.writingDraft)
  const speakingWords = countWords(profile.speakingDraft)

  const laneMastery = useMemo(() => {
    return SKILL_LANES.map((lane) => {
      const laneQuests = QUESTS.filter((quest) => quest.lane === lane.id)
      const cleared = laneQuests.filter((quest) => profile.completedQuestIds.includes(quest.id)).length
      return {
        ...lane,
        cleared,
        total: laneQuests.length,
        percent: laneQuests.length ? clampPercent((cleared / laneQuests.length) * 100) : 0,
      }
    })
  }, [profile.completedQuestIds])

  const nextQuest = useMemo(() => {
    return QUESTS.find((quest) => !profile.completedQuestIds.includes(quest.id)) ?? QUESTS[0]
  }, [profile.completedQuestIds])
  const nextQuestCta = completedCount >= QUESTS.length ? 'Replay first quest' : 'Next open quest'

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      const queryQuestId = new URLSearchParams(window.location.search).get('quest')
      if (saved) {
        const normalizedProfile = safeProfile(JSON.parse(saved))
        setProfile(normalizedProfile)
        setSelectedQuestId(queryQuestId && questExists(queryQuestId) ? queryQuestId : normalizedProfile.activeQuestId)
      } else if (queryQuestId && questExists(queryQuestId)) {
        setSelectedQuestId(queryQuestId)
      }
    } catch {
      setProfile(DEFAULT_PROFILE)
    } finally {
      setHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!hydrated) {
      return
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  }, [hydrated, profile])

  useEffect(() => {
    if (!hydrated) {
      return
    }

    setProfile((current) => current.activeQuestId === selectedQuestId
      ? current
      : { ...current, activeQuestId: selectedQuestId })
  }, [hydrated, selectedQuestId])

  function updateDraft(field: 'writingDraft' | 'speakingDraft', value: string) {
    setProfile((current) => ({ ...current, [field]: value }))
  }

  function selectQuest(id: string) {
    setSelectedQuestId(id)
    setProfile((current) => ({ ...current, activeQuestId: id }))
  }

  function chooseAnswer(option: string) {
    setProfile((current) => {
      const currentProgress = current.questProgress[activeQuest.id] ?? blankQuestProgress()

      return {
        ...current,
        activeQuestId: activeQuest.id,
        questProgress: {
          ...current.questProgress,
          [activeQuest.id]: {
            ...currentProgress,
            selectedAnswer: option,
            lastAnsweredAt: new Date().toISOString(),
          },
        },
      }
    })
  }

  function claimDailyFocus() {
    setProfile((current) => {
      const studyDay = markStudyDay(current)
      const alreadyClaimed = current.dailyFocusDay === today
      return {
        ...current,
        ...studyDay,
        dailyFocusDay: today,
        xp: current.xp + (alreadyClaimed ? 5 : 35),
        focusMinutes: current.focusMinutes + (alreadyClaimed ? 2 : 10),
      }
    })
  }

  function completeQuest() {
    if (!selectedAnswer) {
      return
    }

    setProfile((current) => {
      const currentProgress = current.questProgress[activeQuest.id] ?? blankQuestProgress()
      const hasCompleted = currentProgress.completed || current.completedQuestIds.includes(activeQuest.id)
      const studyDay = markStudyDay(current)
      const completedAt = new Date().toISOString()
      const xpGain = hasCompleted ? (answeredCorrectly ? 12 : 5) : activeQuest.xp + (answeredCorrectly ? 20 : 8)

      return {
        ...current,
        ...studyDay,
        activeQuestId: activeQuest.id,
        xp: current.xp + xpGain,
        attempts: current.attempts + 1,
        correct: current.correct + (answeredCorrectly ? 1 : 0),
        focusMinutes: current.focusMinutes + activeQuest.minutes,
        questProgress: {
          ...current.questProgress,
          [activeQuest.id]: {
            ...currentProgress,
            selectedAnswer,
            attempts: currentProgress.attempts + 1,
            correctAttempts: currentProgress.correctAttempts + (answeredCorrectly ? 1 : 0),
            completed: true,
            completedAt: currentProgress.completedAt ?? completedAt,
            lastAnsweredAt: completedAt,
          },
        },
        completedQuestIds: hasCompleted
          ? current.completedQuestIds
          : [...current.completedQuestIds, activeQuest.id],
      }
    })
  }

  function logWritingRep() {
    setProfile((current) => {
      const studyDay = markStudyDay(current)
      const enoughWords = countWords(current.writingDraft) >= 60
      const alreadyLogged = current.writingLoggedDay === today
      return {
        ...current,
        ...studyDay,
        writingLoggedDay: today,
        xp: current.xp + (enoughWords ? (alreadyLogged ? 10 : 45) : 8),
        focusMinutes: current.focusMinutes + (enoughWords ? 8 : 2),
      }
    })
  }

  function logSpeakingRep() {
    setProfile((current) => {
      const studyDay = markStudyDay(current)
      const enoughReflection = countWords(current.speakingDraft) >= 25
      const alreadyLogged = current.speakingLoggedDay === today
      return {
        ...current,
        ...studyDay,
        speakingLoggedDay: today,
        xp: current.xp + (enoughReflection ? (alreadyLogged ? 10 : 40) : 8),
        focusMinutes: current.focusMinutes + (enoughReflection ? 6 : 2),
      }
    })
  }

  function questHref(id: string) {
    return `/e/quests?quest=${encodeURIComponent(id)}`
  }

  function jumpToQuest(id: string) {
    selectQuest(id)
    if (page !== 'quests') {
      window.location.href = questHref(id)
    }
  }

  return (
    <main className="english-campus">
      <section className={`hero-shell ${isHome ? '' : 'is-compact'}`}>
        <nav className="top-nav" aria-label="English app navigation">
          <a className="brand-mark" href="/e">
            <span className="brand-icon">EQ</span>
            <span>
              <strong>English Quest</strong>
              <small>Daily learning campus</small>
            </span>
          </a>

          <div className="nav-links">
            <a className={isHome ? 'is-active' : ''} href="/e">Overview</a>
            {TRAINING_LINKS.map((link) => (
              <a className={activeTab === link.id && !isHome ? 'is-active' : ''} href={link.href} key={link.id}>
                {link.label.replace(' map', '').replace(' lab', '').replace(' forge', '').replace(' room', '')}
              </a>
            ))}
          </div>

        </nav>

        {isHome && (
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">English learning, but it finally has a game loop.</p>
            <h1>Level up English with quests that make you speak, think, and return tomorrow.</h1>
            <p className="hero-text">
              A compact gamified studio for IELTS-friendly practice: context vocabulary, grammar repair,
              reading radar, natural replies, writing reps, speaking prompts, XP, streaks, and review.
            </p>

            <div className="hero-actions">
              <a className="primary-action" href={questHref(nextQuest.id)}>
                Start training
              </a>
              <button className="secondary-action" type="button" onClick={claimDailyFocus}>
                {profile.dailyFocusDay === today ? 'Claim bonus focus' : 'Claim daily focus'}
              </button>
            </div>

            <div className="hero-stats" aria-label="Learning progress">
              <ProgressPill label="Level" value={`${level}`} />
              <ProgressPill label="XP" value={`${profile.xp}`} />
              <ProgressPill label="Streak" value={`${profile.streak} day${profile.streak === 1 ? '' : 's'}`} />
            </div>
          </div>

          <div className="dashboard-preview" aria-label="English Quest dashboard preview">
            <div className="browser-bar">
              <span />
              <span />
              <span />
              <p>english.quest/dashboard</p>
            </div>
            <div className="preview-inner">
              <div className="preview-main-card">
                <div>
                  <p className="preview-kicker">Today route</p>
                  <h2>{nextQuest.title}</h2>
                  <span>{nextQuest.subtitle}</span>
                </div>
                <button type="button" onClick={() => jumpToQuest(nextQuest.id)}>
                  Play
                </button>
              </div>

              <div className="preview-grid">
                {laneMastery.map((lane) => (
                  <div className="mini-lane" key={lane.id} style={{ '--lane-color': lane.color } as CSSProperties}>
                    <span>{lane.tag}</span>
                    <strong>{lane.percent}%</strong>
                    <p>{lane.title}</p>
                  </div>
                ))}
              </div>

              <div className="preview-terminal">
                <span>Coach feed</span>
                <p>Clear one quest, say the transfer prompt aloud, then write 60 words. Small reps, real compounding.</p>
              </div>
            </div>
            <div className="float-card float-card-a">
              <strong>{accuracy}%</strong>
              <span>accuracy</span>
            </div>
            <div className="float-card float-card-b">
              <strong>{completedCount}/{QUESTS.length}</strong>
              <span>quests cleared</span>
            </div>
          </div>
        </div>
        )}
      </section>

      {isHome && (
      <>
      <section className="feature-section" id="features">
        <div className="section-heading">
          <p className="eyebrow">Designed like a learning product, not a worksheet.</p>
          <h2>Useful practice loops wrapped in a playful command center.</h2>
        </div>

        <div className="feature-grid">
          {SKILL_LANES.map((lane) => (
            <article className="feature-card" key={lane.id} style={{ '--lane-color': lane.color } as CSSProperties}>
              <span>{lane.tag}</span>
              <h3>{lane.title}</h3>
              <p>{lane.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="route-section" id="pages">
        <div className="section-heading">
          <p className="eyebrow">Split into focused pages</p>
          <h2>Pick one room and keep your brain on one job.</h2>
        </div>

        <div className="route-grid">
          {TRAINING_LINKS.map((link, index) => (
            <a className="route-card" href={link.href} key={link.id}>
              <span>0{index + 1}</span>
              <h3>{link.label}</h3>
              <p>{link.description}</p>
            </a>
          ))}
        </div>
      </section>
      </>
      )}

      {!isHome && (
      <section className="trainer-shell" id="trainer">
        <aside className="player-panel">
          <div className="player-card">
            <p className="eyebrow">Player profile</p>
            <div className="level-row">
              <div>
                <span>Level</span>
                <strong>{level}</strong>
              </div>
              <p>{profile.xp - levelBase}/{LEVEL_SIZE} XP</p>
            </div>
            <div className="meter" aria-label="Level progress">
              <span style={{ width: `${levelProgress}%` }} />
            </div>
            <div className="stat-grid">
              <StatCard label="Streak" value={`${profile.streak}d`} />
              <StatCard label="Accuracy" value={`${accuracy}%`} />
              <StatCard label="Minutes" value={`${profile.focusMinutes}`} />
              <StatCard label="Cleared" value={`${completedCount}/${QUESTS.length}`} />
            </div>
          </div>

          <div className="tab-card">
            <p className="panel-title">Training deck</p>
            {TRAINING_LINKS.map((link) => (
              <a
                className={activeTab === link.id ? 'is-active' : ''}
                href={link.href}
                key={link.id}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="mission-card">
            <p className="panel-title">Daily missions</p>
            <MissionRow
              title="Focus check-in"
              value={profile.dailyFocusDay === today ? 1 : 0}
              total={1}
              reward="+35 XP"
              onClick={claimDailyFocus}
            />
            <MissionRow title="Clear quest nodes" value={Math.min(completedCount, 3)} total={3} reward="+flow" />
            <MissionRow title="Keep accuracy high" value={accuracy >= 80 && profile.attempts >= 4 ? 1 : 0} total={1} reward="80%+" />
          </div>
        </aside>

        <section className="workspace-panel">
          {activeTab === 'quests' && (
            <div className="quest-layout">
              <div className="quest-map">
                <PanelHeading
                  title="Quest map"
                  note="Pick a node, answer, read feedback, then transfer it into speaking or writing."
                />
                <div className="quest-list">
                  {QUESTS.map((quest) => {
                    const lane = laneFor(quest.lane)
                    const isActive = quest.id === activeQuest.id
                    const questProgress = profile.questProgress[quest.id]
                    const isDone = Boolean(questProgress?.completed || profile.completedQuestIds.includes(quest.id))
                    const hasSavedAnswer = Boolean(questProgress?.selectedAnswer)

                    return (
                      <button
                        className={`quest-node ${isActive ? 'is-active' : ''} ${isDone ? 'is-done' : ''}`}
                        key={quest.id}
                        style={{ '--lane-color': lane.color } as CSSProperties}
                        type="button"
                        onClick={() => selectQuest(quest.id)}
                      >
                        <span>{quest.label}</span>
                        <strong>{quest.title}</strong>
                        <small>
                          {quest.minutes} min - {quest.xp} XP - {lane.title}
                          {isDone ? ' - cleared' : hasSavedAnswer ? ' - answer saved' : ''}
                        </small>
                      </button>
                    )
                  })}
                </div>
              </div>

              <article className="challenge-card" style={{ '--lane-color': activeLane.color } as CSSProperties}>
                <div className="challenge-head">
                  <div>
                    <p className="eyebrow">{activeQuest.label} - {activeLane.title}</p>
                    <h2>{activeQuest.title}</h2>
                    <p>{activeQuest.subtitle}</p>
                  </div>
                  <div className="challenge-actions">
                    <span>{activeQuest.difficulty}</span>
                    <a className="quest-next-link" href={questHref(nextQuest.id)}>
                      {nextQuestCta}
                      <strong>{nextQuest.label}</strong>
                    </a>
                  </div>
                </div>

                <div className="context-box">
                  <span>Context</span>
                  <p>{activeQuest.context}</p>
                </div>

                <div className="question-block">
                  <h3>{activeQuest.prompt}</h3>
                  <div className="option-grid">
                    {activeOptions.map((option) => {
                      const isSelected = selectedAnswer === option
                      const showCorrect = selectedAnswer && option === activeQuest.answer
                      const showWrong = selectedAnswer === option && option !== activeQuest.answer

                      return (
                        <button
                          className={`answer-option ${isSelected ? 'is-selected' : ''} ${showCorrect ? 'is-correct' : ''} ${showWrong ? 'is-wrong' : ''}`}
                          key={option}
                          type="button"
                          onClick={() => chooseAnswer(option)}
                        >
                          {option}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {selectedAnswer && (
                  <div className={`feedback-box ${answeredCorrectly ? 'is-correct' : 'is-wrong'}`}>
                    <strong>{answeredCorrectly ? 'Correct. Nice read.' : 'Not quite yet.'}</strong>
                    <p>{activeQuest.explanation}</p>
                    <span>{activeQuest.coachNote}</span>
                  </div>
                )}

                <div className="quest-actions">
                  <button className="primary-action compact" type="button" disabled={!selectedAnswer} onClick={completeQuest}>
                    {alreadyCompleted ? 'Log replay' : 'Complete quest'}
                  </button>
                  <button className="secondary-action compact" type="button" onClick={() => speakText(activeQuest.speakingPrompt)}>
                    Hear transfer prompt
                  </button>
                </div>

                <div className="transfer-card">
                  <span>Transfer mission</span>
                  <p>{activeQuest.transferTip}</p>
                </div>
              </article>
            </div>
          )}

          {activeTab === 'speaking' && (
            <div className="lab-grid">
              <article className="lab-card">
                <PanelHeading
                  title="Speaking lab"
                  note="Use the current quest as a speaking seed. Speak first, then write a tiny reflection."
                />
                <div className="prompt-card">
                  <span>Active prompt</span>
                  <h2>{activeQuest.speakingPrompt}</h2>
                  <button className="secondary-action compact" type="button" onClick={() => speakText(activeQuest.speakingPrompt)}>
                    Play prompt
                  </button>
                </div>

                <div className="phrase-bank">
                  {['Let me put that another way.', 'The main reason is...', 'For example...', 'What I mean is...'].map((phrase) => (
                    <button key={phrase} type="button" onClick={() => updateDraft('speakingDraft', `${profile.speakingDraft}${profile.speakingDraft ? '\n' : ''}${phrase}`)}>
                      {phrase}
                    </button>
                  ))}
                </div>

                <textarea
                  aria-label="Speaking reflection"
                  placeholder="After speaking aloud, write quick notes: What felt easy? Where did you pause? Which phrase helped?"
                  value={profile.speakingDraft}
                  onChange={(event) => updateDraft('speakingDraft', event.target.value)}
                />

                <div className="lab-footer">
                  <span>{speakingWords} reflection words</span>
                  <button className="primary-action compact" type="button" onClick={logSpeakingRep}>
                    Log speaking rep
                  </button>
                </div>
              </article>

              <aside className="coach-card">
                <p className="eyebrow">Speaking combo</p>
                <h3>30 seconds is enough if it has structure.</h3>
                <ol>
                  <li>Answer directly in the first sentence.</li>
                  <li>Add one reason with "because".</li>
                  <li>Give one example from your life.</li>
                  <li>Use a repair phrase if your brain stalls.</li>
                </ol>
              </aside>
            </div>
          )}

          {activeTab === 'writing' && (
            <div className="lab-grid">
              <article className="lab-card">
                <PanelHeading
                  title="Writing forge"
                  note="Short writing reps build clarity faster than staring at a blank full essay."
                />
                <div className="prompt-card">
                  <span>Current writing mission</span>
                  <h2>{activeQuest.writingPrompt}</h2>
                </div>

                <textarea
                  aria-label="Writing draft"
                  placeholder="Write 60-120 words. Aim for a clear opinion, one reason, and one example."
                  value={profile.writingDraft}
                  onChange={(event) => updateDraft('writingDraft', event.target.value)}
                />

                <div className="checklist-grid">
                  <ChecklistItem label="60+ words" done={writingWords >= 60} />
                  <ChecklistItem label="Uses because" done={/\bbecause\b/i.test(profile.writingDraft)} />
                  <ChecklistItem label="Has contrast" done={/\bhowever\b|\balthough\b|\bbut\b/i.test(profile.writingDraft)} />
                  <ChecklistItem label="Has example" done={/\bfor example\b|\bfor instance\b/i.test(profile.writingDraft)} />
                </div>

                <div className="lab-footer">
                  <span>{writingWords} words</span>
                  <button className="primary-action compact" type="button" onClick={logWritingRep}>
                    Log writing rep
                  </button>
                </div>
              </article>

              <aside className="coach-card">
                <p className="eyebrow">Writing combo</p>
                <h3>A strong paragraph is a tiny machine.</h3>
                <ol>
                  <li>Topic sentence: answer the question.</li>
                  <li>Reason: explain why it is true.</li>
                  <li>Example: make it concrete.</li>
                  <li>Link: connect back to the main idea.</li>
                </ol>
              </aside>
            </div>
          )}

          {activeTab === 'review' && (
            <div className="review-panel">
              <PanelHeading
                title="Review room"
                note="This is your local progress log. Replay weak nodes and keep the streak alive."
              />

              <div className="review-grid">
                {laneMastery.map((lane) => (
                  <article className="mastery-card" key={lane.id} style={{ '--lane-color': lane.color } as CSSProperties}>
                    <span>{lane.tag}</span>
                    <h3>{lane.title}</h3>
                    <p>{lane.cleared}/{lane.total} cleared</p>
                    <div className="meter small">
                      <span style={{ width: `${lane.percent}%` }} />
                    </div>
                  </article>
                ))}
              </div>

              <div className="history-list">
                {QUESTS.map((quest) => {
                  const questProgress = profile.questProgress[quest.id]
                  const done = Boolean(questProgress?.completed || profile.completedQuestIds.includes(quest.id))
                  const answered = Boolean(questProgress?.selectedAnswer)
                  const attemptLabel = questProgress?.attempts
                    ? `${questProgress.attempts} attempt${questProgress.attempts === 1 ? '' : 's'} - `
                    : ''
                  return (
                    <button className={done ? 'history-item is-done' : 'history-item'} key={quest.id} type="button" onClick={() => jumpToQuest(quest.id)}>
                      <span>{done ? 'Cleared' : answered ? 'Saved' : 'Open'}</span>
                      <strong>{quest.title}</strong>
                      <small>{attemptLabel}{quest.transferTip}</small>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </section>
      </section>
      )}

      {isHome && (
      <section className="faq-section" id="faq">
        <div className="section-heading">
          <p className="eyebrow">FAQ</p>
          <h2>Built for repeatable practice.</h2>
        </div>

        <div className="faq-grid">
          {FAQ_ITEMS.map((item) => (
            <article className="faq-card" key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>

        <div className="bottom-cta">
          <p className="eyebrow">Ready when you are.</p>
          <h2>Clear one tiny quest today. Let tomorrow-you inherit momentum.</h2>
          <a className="primary-action" href={questHref(nextQuest.id)}>
            Open the trainer
          </a>
        </div>
      </section>
      )}

      <style jsx>{`
        .english-campus {
          --ink: #0e1726;
          --muted: #64748b;
          --panel: rgba(255, 255, 255, 0.84);
          --panel-strong: #ffffff;
          --line: rgba(15, 23, 42, 0.12);
          --blue: #2563eb;
          --cyan: #12bfae;
          --gold: #f59e0b;
          --rose: #ec4899;
          --shadow: 0 24px 70px rgba(15, 23, 42, 0.14);
          min-height: 100vh;
          overflow: hidden;
          color: var(--ink);
          background:
            radial-gradient(circle at 14% 8%, rgba(18, 191, 174, 0.18), transparent 27rem),
            radial-gradient(circle at 86% 12%, rgba(245, 158, 11, 0.2), transparent 25rem),
            linear-gradient(180deg, #f8fcff 0%, #eef7ff 46%, #f8fbff 100%);
          font-family: "Plus Jakarta Sans", "Noto Sans JP", "Segoe UI", sans-serif;
        }

        .hero-shell,
        .feature-section,
        .route-section,
        .trainer-shell,
        .faq-section {
          width: min(1180px, calc(100% - 32px));
          margin: 0 auto;
        }

        .hero-shell {
          position: relative;
          padding: 24px 0 76px;
        }

        .hero-shell.is-compact {
          padding-bottom: 18px;
        }

        .hero-shell::before {
          position: absolute;
          inset: 92px -120px auto auto;
          width: 420px;
          height: 420px;
          content: "";
          border-radius: 999px;
          background: conic-gradient(from 160deg, rgba(37, 99, 235, 0.2), rgba(18, 191, 174, 0.34), rgba(245, 158, 11, 0.22), rgba(37, 99, 235, 0.2));
          filter: blur(18px);
          opacity: 0.7;
          animation: drift 12s ease-in-out infinite alternate;
        }

        .top-nav {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 14px;
          border: 1px solid rgba(255, 255, 255, 0.72);
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.72);
          box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08);
          backdrop-filter: blur(22px);
        }

        .brand-mark {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          color: inherit;
          text-decoration: none;
        }

        .brand-icon {
          display: grid;
          width: 46px;
          height: 46px;
          place-items: center;
          border-radius: 16px;
          color: #ffffff;
          font-weight: 900;
          letter-spacing: -0.08em;
          background: linear-gradient(135deg, #0f172a, #2563eb 54%, #12bfae);
          box-shadow: 0 12px 28px rgba(37, 99, 235, 0.3);
        }

        .brand-mark strong,
        .brand-mark small {
          display: block;
        }

        .brand-mark strong {
          font-size: 0.98rem;
          letter-spacing: -0.02em;
        }

        .brand-mark small {
          color: var(--muted);
          font-size: 0.76rem;
          font-weight: 700;
        }

        .nav-links {
          display: flex;
          gap: 6px;
          padding: 6px;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.05);
        }

        .nav-links a {
          border: 0;
          color: #334155;
          font: inherit;
          font-size: 0.86rem;
          font-weight: 800;
          text-decoration: none;
        }

        .nav-links a {
          padding: 10px 14px;
          border-radius: 999px;
        }

        .nav-links a:hover,
        .nav-links a.is-active {
          color: var(--ink);
          background: #ffffff;
        }

        .hero-grid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(360px, 0.88fr);
          gap: 48px;
          align-items: center;
          padding-top: 74px;
        }

        .hero-copy h1 {
          max-width: 740px;
          margin: 12px 0 20px;
          font-size: clamp(3rem, 8vw, 6.4rem);
          line-height: 0.93;
          letter-spacing: -0.075em;
        }

        .hero-text {
          max-width: 650px;
          color: #42526a;
          font-size: clamp(1rem, 1.6vw, 1.2rem);
          line-height: 1.85;
        }

        .eyebrow {
          color: #0f766e;
          font-size: 0.76rem;
          font-weight: 950;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }

        .hero-actions,
        .quest-actions,
        .lab-footer {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
        }

        .hero-actions {
          margin-top: 28px;
        }

        .primary-action,
        .secondary-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          padding: 0 20px;
          border: 0;
          border-radius: 999px;
          cursor: pointer;
          font: inherit;
          font-size: 0.9rem;
          font-weight: 950;
          text-decoration: none;
          transition: transform 160ms ease, box-shadow 160ms ease, opacity 160ms ease;
        }

        .primary-action {
          color: #ffffff;
          background: linear-gradient(135deg, #0f172a, #2563eb);
          box-shadow: 0 18px 36px rgba(37, 99, 235, 0.32);
        }

        .secondary-action {
          color: #0f172a;
          background: #ffffff;
          box-shadow: inset 0 0 0 1px var(--line), 0 14px 32px rgba(15, 23, 42, 0.08);
        }

        .primary-action:hover,
        .secondary-action:hover {
          transform: translateY(-2px);
        }

        .primary-action:disabled {
          cursor: not-allowed;
          opacity: 0.45;
          transform: none;
        }

        .compact {
          min-height: 42px;
          padding: 0 16px;
          font-size: 0.82rem;
        }

        .hero-stats {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 28px;
        }

        .progress-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.72);
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.07);
        }

        .progress-pill span {
          color: var(--muted);
          font-size: 0.76rem;
          font-weight: 850;
        }

        .progress-pill strong {
          font-size: 0.92rem;
        }

        .dashboard-preview {
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.24);
          border-radius: 34px;
          background: linear-gradient(145deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.94));
          box-shadow: 0 38px 90px rgba(15, 23, 42, 0.34);
          transform: rotate(1.5deg);
        }

        .browser-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 16px 18px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .browser-bar span {
          width: 11px;
          height: 11px;
          border-radius: 999px;
          background: #fb7185;
        }

        .browser-bar span:nth-child(2) {
          background: #fbbf24;
        }

        .browser-bar span:nth-child(3) {
          background: #34d399;
        }

        .browser-bar p {
          margin-left: auto;
          color: rgba(226, 232, 240, 0.62);
          font-size: 0.78rem;
          font-weight: 800;
        }

        .preview-inner {
          display: grid;
          gap: 16px;
          padding: 22px;
        }

        .preview-main-card,
        .preview-terminal,
        .mini-lane,
        .float-card {
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(16px);
        }

        .preview-main-card {
          display: flex;
          gap: 18px;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          border-radius: 24px;
        }

        .preview-kicker,
        .preview-main-card span,
        .preview-terminal span,
        .preview-terminal p,
        .mini-lane p,
        .float-card span {
          color: rgba(226, 232, 240, 0.72);
        }

        .preview-kicker,
        .preview-terminal span {
          font-size: 0.72rem;
          font-weight: 950;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .preview-main-card h2 {
          margin: 4px 0;
          color: #ffffff;
          font-size: 1.5rem;
          letter-spacing: -0.04em;
        }

        .preview-main-card button {
          width: 62px;
          height: 62px;
          border: 0;
          border-radius: 22px;
          color: #0f172a;
          cursor: pointer;
          font-weight: 950;
          background: #7dd3fc;
        }

        .preview-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }

        .mini-lane {
          padding: 14px;
          border-radius: 18px;
          box-shadow: inset 0 3px 0 var(--lane-color);
        }

        .mini-lane span {
          color: var(--lane-color);
          font-size: 0.68rem;
          font-weight: 950;
        }

        .mini-lane strong {
          display: block;
          margin: 10px 0 2px;
          color: #ffffff;
          font-size: 1.3rem;
        }

        .mini-lane p {
          font-size: 0.72rem;
          font-weight: 800;
        }

        .preview-terminal {
          padding: 18px;
          border-radius: 22px;
          font-family: "SFMono-Regular", Consolas, monospace;
        }

        .preview-terminal p {
          margin-top: 8px;
          line-height: 1.7;
        }

        .float-card {
          position: absolute;
          display: grid;
          min-width: 120px;
          gap: 2px;
          padding: 14px 16px;
          border-radius: 20px;
          color: #ffffff;
          box-shadow: 0 22px 54px rgba(15, 23, 42, 0.24);
        }

        .float-card strong {
          font-size: 1.35rem;
          letter-spacing: -0.04em;
        }

        .float-card-a {
          right: -26px;
          top: 28%;
          transform: rotate(6deg);
        }

        .float-card-b {
          left: -24px;
          bottom: 12%;
          transform: rotate(-5deg);
        }

        .feature-section,
        .route-section,
        .faq-section {
          padding: 74px 0;
        }

        .section-heading {
          display: grid;
          gap: 10px;
          max-width: 720px;
          margin-bottom: 28px;
        }

        .section-heading h2,
        .bottom-cta h2 {
          font-size: clamp(2rem, 4vw, 3.6rem);
          line-height: 1;
          letter-spacing: -0.06em;
        }

        .feature-grid,
        .route-grid,
        .faq-grid,
        .review-grid,
        .stat-grid {
          display: grid;
          gap: 16px;
        }

        .feature-grid {
          grid-template-columns: repeat(4, 1fr);
        }

        .route-grid {
          grid-template-columns: repeat(4, 1fr);
        }

        .feature-card,
        .route-card,
        .player-card,
        .tab-card,
        .mission-card,
        .workspace-panel,
        .lab-card,
        .coach-card,
        .faq-card,
        .bottom-cta,
        .mastery-card {
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 28px;
          background: var(--panel);
          box-shadow: var(--shadow);
          backdrop-filter: blur(24px);
        }

        .feature-card {
          min-height: 220px;
          padding: 24px;
          box-shadow: 0 18px 46px rgba(15, 23, 42, 0.09);
        }

        .route-card {
          display: grid;
          min-height: 230px;
          align-content: space-between;
          gap: 18px;
          padding: 24px;
          color: inherit;
          text-decoration: none;
          box-shadow: 0 18px 46px rgba(15, 23, 42, 0.09);
          transition: transform 160ms ease, box-shadow 160ms ease;
        }

        .route-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 26px 60px rgba(15, 23, 42, 0.14);
        }

        .route-card span {
          color: #2563eb;
          font-size: 0.82rem;
          font-weight: 950;
          letter-spacing: 0.12em;
        }

        .route-card h3 {
          font-size: 1.5rem;
          letter-spacing: -0.05em;
        }

        .route-card p {
          color: var(--muted);
          line-height: 1.7;
        }

        .feature-card span {
          display: inline-flex;
          padding: 7px 10px;
          border-radius: 999px;
          color: #ffffff;
          font-size: 0.72rem;
          font-weight: 950;
          background: var(--lane-color);
        }

        .feature-card h3 {
          margin: 26px 0 10px;
          font-size: 1.35rem;
          letter-spacing: -0.04em;
        }

        .feature-card p,
        .faq-card p,
        .coach-card li,
        .history-item small {
          color: var(--muted);
          line-height: 1.75;
        }

        .trainer-shell {
          display: grid;
          grid-template-columns: 320px minmax(0, 1fr);
          gap: 18px;
          align-items: start;
          padding: 18px;
          border: 1px solid rgba(255, 255, 255, 0.82);
          border-radius: 38px;
          background: rgba(255, 255, 255, 0.52);
          box-shadow: 0 30px 80px rgba(15, 23, 42, 0.13);
          backdrop-filter: blur(24px);
        }

        .player-panel {
          display: grid;
          gap: 14px;
          position: sticky;
          top: 18px;
        }

        .player-card,
        .tab-card,
        .mission-card {
          padding: 20px;
        }

        .level-row {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 12px;
          margin-top: 14px;
        }

        .level-row span,
        .level-row p,
        .stat-card span,
        .mission-row span,
        .challenge-head p,
        .context-box span,
        .transfer-card span,
        .prompt-card span,
        .lab-footer span {
          color: var(--muted);
          font-size: 0.8rem;
          font-weight: 800;
        }

        .level-row strong {
          display: block;
          font-size: 3.2rem;
          line-height: 0.9;
          letter-spacing: -0.08em;
        }

        .meter {
          height: 12px;
          margin-top: 16px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.08);
        }

        .meter span {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #12bfae, #2563eb);
        }

        .meter.small {
          height: 9px;
          margin-top: 12px;
        }

        .stat-grid {
          grid-template-columns: repeat(2, 1fr);
          margin-top: 16px;
        }

        .stat-card {
          padding: 13px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 18px;
          background: #ffffff;
        }

        .stat-card strong {
          display: block;
          margin-top: 4px;
          font-size: 1.25rem;
          letter-spacing: -0.04em;
        }

        .panel-title {
          margin-bottom: 12px;
          color: #0f172a;
          font-size: 0.86rem;
          font-weight: 950;
        }

        .tab-card {
          display: grid;
          gap: 8px;
        }

        .tab-card a,
        .mission-row,
        .quest-node,
        .history-item {
          width: 100%;
          border: 1px solid rgba(15, 23, 42, 0.08);
          color: inherit;
          cursor: pointer;
          font: inherit;
          text-align: left;
          background: #ffffff;
        }

        .tab-card a {
          padding: 12px 14px;
          border-radius: 16px;
          font-size: 0.86rem;
          font-weight: 900;
          text-decoration: none;
        }

        .tab-card a.is-active {
          color: #ffffff;
          border-color: transparent;
          background: #0f172a;
        }

        .mission-card {
          display: grid;
          gap: 10px;
        }

        .mission-row {
          display: grid;
          gap: 8px;
          padding: 13px;
          border-radius: 18px;
        }

        .mission-row strong {
          font-size: 0.9rem;
        }

        .mission-row span {
          display: flex;
          justify-content: space-between;
        }

        .workspace-panel {
          min-height: 760px;
          padding: 18px;
          background: rgba(255, 255, 255, 0.78);
        }

        .quest-layout {
          display: grid;
          grid-template-columns: minmax(240px, 0.82fr) minmax(0, 1.18fr);
          gap: 18px;
        }

        .quest-map,
        .review-panel {
          display: grid;
          align-content: start;
          gap: 16px;
        }

        .panel-heading h2 {
          margin-bottom: 6px;
          font-size: clamp(1.6rem, 3vw, 2.3rem);
          letter-spacing: -0.06em;
        }

        .panel-heading p {
          color: var(--muted);
          line-height: 1.65;
        }

        .quest-list,
        .history-list {
          display: grid;
          gap: 10px;
        }

        .quest-node {
          display: grid;
          gap: 5px;
          padding: 15px;
          border-radius: 20px;
          box-shadow: inset 4px 0 0 var(--lane-color);
        }

        .quest-node:hover,
        .quest-node.is-active {
          border-color: color-mix(in srgb, var(--lane-color) 48%, transparent);
          transform: translateY(-1px);
        }

        .quest-node.is-active {
          background: linear-gradient(135deg, #ffffff, color-mix(in srgb, var(--lane-color) 12%, #ffffff));
        }

        .quest-node.is-done span::after {
          content: " cleared";
          color: #059669;
        }

        .quest-node span,
        .history-item span,
        .mastery-card span {
          color: var(--lane-color);
          font-size: 0.72rem;
          font-weight: 950;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .quest-node strong,
        .history-item strong {
          font-size: 0.98rem;
          letter-spacing: -0.03em;
        }

        .quest-node small {
          color: var(--muted);
          font-size: 0.76rem;
          font-weight: 800;
        }

        .challenge-card {
          display: grid;
          gap: 18px;
          padding: 24px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 30px;
          background:
            radial-gradient(circle at top right, color-mix(in srgb, var(--lane-color) 22%, transparent), transparent 18rem),
            #ffffff;
          box-shadow: 0 20px 54px rgba(15, 23, 42, 0.11);
        }

        .challenge-head {
          display: flex;
          gap: 18px;
          align-items: start;
          justify-content: space-between;
        }

        .challenge-head h2 {
          margin: 6px 0 8px;
          font-size: clamp(2rem, 4vw, 3.3rem);
          line-height: 0.98;
          letter-spacing: -0.07em;
        }

        .challenge-actions {
          display: grid;
          flex: 0 0 auto;
          gap: 10px;
          justify-items: end;
        }

        .challenge-actions > span {
          width: fit-content;
          flex: 0 0 auto;
          padding: 8px 12px;
          border-radius: 999px;
          color: #0f172a;
          font-size: 0.78rem;
          font-weight: 950;
          background: color-mix(in srgb, var(--lane-color) 18%, #ffffff);
        }

        .quest-next-link {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          width: fit-content;
          padding: 10px 12px 10px 16px;
          border-radius: 999px;
          color: #ffffff;
          font-size: 0.82rem;
          font-weight: 950;
          text-decoration: none;
          background: linear-gradient(135deg, #0f172a, color-mix(in srgb, var(--lane-color) 72%, #2563eb));
          box-shadow: 0 16px 34px color-mix(in srgb, var(--lane-color) 24%, transparent);
          transition: transform 160ms ease, box-shadow 160ms ease;
        }

        .quest-next-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 42px color-mix(in srgb, var(--lane-color) 32%, transparent);
        }

        .quest-next-link strong {
          padding: 5px 8px;
          border-radius: 999px;
          color: #0f172a;
          background: rgba(255, 255, 255, 0.86);
        }

        .context-box,
        .transfer-card,
        .prompt-card,
        .feedback-box {
          padding: 18px;
          border-radius: 22px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: rgba(248, 250, 252, 0.9);
        }

        .context-box p,
        .transfer-card p,
        .prompt-card h2 {
          margin-top: 8px;
          line-height: 1.75;
        }

        .question-block h3 {
          margin-bottom: 12px;
          font-size: 1.12rem;
        }

        .option-grid {
          display: grid;
          gap: 10px;
        }

        .answer-option {
          width: 100%;
          padding: 15px 16px;
          border: 1px solid rgba(15, 23, 42, 0.1);
          border-radius: 18px;
          color: #0f172a;
          cursor: pointer;
          font: inherit;
          font-weight: 850;
          text-align: left;
          background: #ffffff;
        }

        .answer-option:hover,
        .answer-option.is-selected {
          border-color: var(--lane-color);
          box-shadow: 0 14px 30px color-mix(in srgb, var(--lane-color) 18%, transparent);
        }

        .answer-option.is-correct {
          border-color: #10b981;
          background: #ecfdf5;
        }

        .answer-option.is-wrong {
          border-color: #fb7185;
          background: #fff1f2;
        }

        .feedback-box {
          display: grid;
          gap: 6px;
        }

        .feedback-box.is-correct {
          border-color: rgba(16, 185, 129, 0.34);
          background: #ecfdf5;
        }

        .feedback-box.is-wrong {
          border-color: rgba(251, 113, 133, 0.36);
          background: #fff1f2;
        }

        .feedback-box p {
          line-height: 1.65;
        }

        .feedback-box span {
          color: var(--muted);
          font-size: 0.9rem;
          line-height: 1.65;
        }

        .lab-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 280px;
          gap: 18px;
        }

        .lab-card,
        .coach-card {
          padding: 24px;
        }

        .lab-card {
          display: grid;
          gap: 18px;
          background: #ffffff;
        }

        .prompt-card h2 {
          font-size: clamp(1.5rem, 3vw, 2.4rem);
          line-height: 1.08;
          letter-spacing: -0.055em;
        }

        .phrase-bank {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .phrase-bank button {
          padding: 10px 12px;
          border: 1px solid rgba(15, 23, 42, 0.1);
          border-radius: 999px;
          color: #0f172a;
          cursor: pointer;
          font: inherit;
          font-size: 0.82rem;
          font-weight: 850;
          background: #ffffff;
        }

        textarea {
          width: 100%;
          min-height: 250px;
          resize: vertical;
          padding: 18px;
          border: 1px solid rgba(15, 23, 42, 0.12);
          border-radius: 22px;
          color: #0f172a;
          font: inherit;
          line-height: 1.7;
          outline: none;
          background: #f8fafc;
        }

        textarea:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
        }

        .checklist-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }

        .checklist-item {
          padding: 12px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 16px;
          color: var(--muted);
          font-size: 0.82rem;
          font-weight: 900;
          background: #ffffff;
        }

        .checklist-item.is-done {
          color: #065f46;
          background: #ecfdf5;
        }

        .coach-card {
          background: linear-gradient(160deg, #0f172a, #1e293b);
          color: #ffffff;
        }

        .coach-card .eyebrow {
          color: #7dd3fc;
        }

        .coach-card h3 {
          margin: 10px 0 18px;
          font-size: 1.55rem;
          line-height: 1.1;
          letter-spacing: -0.04em;
        }

        .coach-card ol {
          display: grid;
          gap: 12px;
          padding-left: 20px;
        }

        .coach-card li {
          color: rgba(226, 232, 240, 0.78);
        }

        .review-grid {
          grid-template-columns: repeat(4, 1fr);
        }

        .mastery-card {
          padding: 18px;
          box-shadow: 0 14px 34px rgba(15, 23, 42, 0.08);
        }

        .mastery-card h3 {
          margin: 10px 0 4px;
        }

        .mastery-card p {
          color: var(--muted);
          font-size: 0.85rem;
          font-weight: 800;
        }

        .history-list {
          margin-top: 6px;
        }

        .history-item {
          display: grid;
          gap: 6px;
          padding: 16px;
          border-radius: 20px;
        }

        .history-item.is-done {
          border-color: rgba(16, 185, 129, 0.25);
          background: #f0fdf4;
        }

        .faq-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .faq-card {
          padding: 24px;
          box-shadow: 0 16px 42px rgba(15, 23, 42, 0.08);
        }

        .faq-card h3 {
          margin-bottom: 10px;
          font-size: 1.2rem;
        }

        .bottom-cta {
          display: grid;
          justify-items: center;
          gap: 18px;
          margin-top: 18px;
          padding: 42px 24px;
          text-align: center;
          background:
            radial-gradient(circle at 15% 20%, rgba(18, 191, 174, 0.28), transparent 18rem),
            radial-gradient(circle at 88% 12%, rgba(245, 158, 11, 0.24), transparent 17rem),
            #ffffff;
        }

        @keyframes drift {
          from {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          to {
            transform: translate3d(-36px, 28px, 0) rotate(14deg);
          }
        }

        @media (max-width: 980px) {
          .nav-links {
            display: none;
          }

          .hero-grid,
          .trainer-shell,
          .quest-layout,
          .lab-grid {
            grid-template-columns: 1fr;
          }

          .dashboard-preview {
            transform: none;
          }

          .player-panel {
            position: static;
          }

          .workspace-panel {
            min-height: auto;
          }

          .feature-grid,
          .route-grid,
          .review-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .english-campus {
            background: linear-gradient(180deg, #f8fcff 0%, #eef7ff 100%);
          }

          .hero-shell,
          .feature-section,
          .route-section,
          .trainer-shell,
          .faq-section {
            width: min(100% - 20px, 1180px);
          }

          .top-nav {
            align-items: stretch;
            border-radius: 22px;
          }

          .hero-grid {
            gap: 30px;
            padding-top: 44px;
          }

          .hero-copy h1 {
            font-size: clamp(2.7rem, 17vw, 4.3rem);
          }

          .preview-grid,
          .feature-grid,
          .route-grid,
          .faq-grid,
          .review-grid,
          .checklist-grid,
          .stat-grid {
            grid-template-columns: 1fr;
          }

          .float-card {
            display: none;
          }

          .trainer-shell {
            padding: 10px;
            border-radius: 28px;
          }

          .workspace-panel,
          .challenge-card,
          .lab-card,
          .coach-card {
            padding: 16px;
            border-radius: 24px;
          }

          .challenge-head {
            display: grid;
          }
        }
      `}</style>
    </main>
  )
}

function ProgressPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="progress-pill">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function PanelHeading({ title, note }: { title: string; note: string }) {
  return (
    <div className="panel-heading">
      <h2>{title}</h2>
      <p>{note}</p>
    </div>
  )
}

function MissionRow({
  title,
  value,
  total,
  reward,
  onClick,
}: {
  title: string
  value: number
  total: number
  reward: string
  onClick?: () => void
}) {
  const percent = clampPercent((value / total) * 100)
  const content = (
    <>
      <strong>{title}</strong>
      <span>
        <small>{value}/{total}</small>
        <small>{reward}</small>
      </span>
      <div className="meter small">
        <span style={{ width: `${percent}%` }} />
      </div>
    </>
  )

  if (onClick) {
    return (
      <button className="mission-row" type="button" onClick={onClick}>
        {content}
      </button>
    )
  }

  return <div className="mission-row">{content}</div>
}

function ChecklistItem({ label, done }: { label: string; done: boolean }) {
  return <div className={`checklist-item ${done ? 'is-done' : ''}`}>{done ? 'Done: ' : 'Todo: '}{label}</div>
}
