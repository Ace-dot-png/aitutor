export const analysisPrompt = (
  transcript: string,
  grade: string,
  subject: string,
  topic: string
) => `
You are an educational analytics engine. Analyse the tutoring session transcript
below and return a JSON object ONLY. No preamble, no markdown, no explanation.
Raw JSON only.

Session context:
Grade: ${grade}
Subject: ${subject}
Topic: ${topic}

Transcript:
${transcript}

Return this exact structure:
{
  "sentimentLabel": "positive" | "neutral" | "struggling" | "disengaged",
  "sentimentScore": <integer 0-100, 100 = most positive>,
  "knowledgeGainScore": <integer 0-100, based on quality of learner responses
                         and demonstrated understanding>,
  "painPoints": [<max 3 specific concept strings the learner struggled with>],
  "breakthroughMoments": [<max 3 concepts clearly grasped, empty array if none>],
  "teacherNote": "<1-2 sentence professional summary for teacher, naming
                  specific concepts and recommending follow-up action>",
  "parentNote": "<1-2 sentence plain-language summary for parent,
                 no jargon, warm but honest>"
}

Scoring:
knowledgeGainScore 0-30:  little to no understanding shown
knowledgeGainScore 31-60: partial understanding, needs reinforcement
knowledgeGainScore 61-80: solid grasp with some gaps
knowledgeGainScore 81-100: strong understanding demonstrated

sentimentLabel:
positive:    engaged, asking good questions, persisting through difficulty
neutral:     present but passive, minimal engagement
struggling:  frustrated, repeating errors, signs of anxiety
disengaged:  short responses, off-topic, not engaging with material
`;