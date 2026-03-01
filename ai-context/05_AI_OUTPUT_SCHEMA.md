# AI Response Format

You must respond ONLY in JSON.

Schema:

{
  "summary": string,
  "rootCause": string,
  "actionSteps": string[],
  "severity": "low" | "medium" | "high",
  "focusArea": "fitness" | "skill" | "client" | "deepWork" | "revenue"
}

Rules:
- Max 3 actionSteps
- Each action step must be specific
- No vague advice
- No motivational quotes