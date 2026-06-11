const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const analyzeContract = async (contractText) => {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 1500,
    messages: [
      {
        role: 'user',
        content: `You are a legal risk analyst specializing in freelance contracts.
Analyze the following contract and identify risky clauses.

For each risk found, return a JSON array with this exact structure:
[
  {
    "clause_type": "Exclusivity" | "IP Ownership" | "Payment Risk" | "Termination" | "Liability" | "Non-Compete",
    "risk_level": "high" | "medium" | "low",
    "clause_quote": "exact quote from contract (max 100 words)",
    "explanation": "plain English explanation of why this is risky for the freelancer"
  }
]

Return ONLY the JSON array, no other text, no markdown, no backticks.

CONTRACT TEXT:
${contractText.substring(0, 4000)}`
      }
    ]
  });

  const raw = completion.choices[0].message.content;

  try {
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    throw new Error('Failed to parse AI response');
  }
};

const calculateRiskScore = (results) => {
  if (!results.length) return 0;
  const weights = { high: 100, medium: 60, low: 20 };
  const total = results.reduce((sum, r) => sum + (weights[r.risk_level] || 0), 0);
  return Math.min(100, Math.round(total / results.length));
};

module.exports = { analyzeContract, calculateRiskScore };