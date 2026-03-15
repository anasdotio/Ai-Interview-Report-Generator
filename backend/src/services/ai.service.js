const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");
const { resumeText } = require("./temp");
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

/**
 * @description This function generates an interview report based on the candidate's resume, self-description, and job description. The report includes technical questions, behavioral questions, skills gaps, preparation plan, overall feedback, and a score.
 * @param {Object} params - The parameters for generating the interview report.
 * @param {string} params.resume - The candidate's resume text.
 */
const interviewReportSchema = z.object({
  matchScore: z
    .number()
    .describe(
      "The match score between candidate and job description, number between 1 and 100",
    ),
  technicalQuestion: z
    .array(
      z.object({
        question: z
          .string()
          .describe("The technical question can be asked during the interview"),
        intention: z
          .string()
          .describe(
            "The intention of interviewer behind asking this technical question",
          ),
        answer: z
          .string()
          .describe(
            "How to answer this question, what points to cover,what approach to take etc.",
          ),
      }),
    )
    .describe(
      "Technical questions that can be asked in interview along with intention and answer",
    ),
  behavioralQuestion: z
    .array(
      z.object({
        question: z
          .string()
          .describe(
            "The behavioral question can be asked during the interview",
          ),
        intention: z
          .string()
          .describe(
            "The intention of interviewer behind asking this behavioral question",
          ),
        answer: z
          .string()
          .describe(
            "How to answer this question, what points to cover, what approach to take etc.",
          ),
      }),
    )
    .describe(
      "Behavioral questions that can be asked during the interview along with their intention",
    ),

  skillGaps: z
    .array(
      z.object({
        skill: z.string().describe("The skill that candidate is lacking"),
        severity: z
          .enum(["low", "medium", "high"])
          .describe("The severity of this skill gap"),
      }),
    )
    .describe(
      "List of skill gaps that candidate's profile along with their severity",
    ),

  preparationPlan: z
    .array(
      z.object({
        day: z
          .number()
          .describe("The day number of preparation plan, staring from 1"),
        focus: z
          .string()
          .describe(
            "The main focus of this day of preparation plan, e.g. data structure algorithms",
          ),
        tasks: z
          .array(z.string())
          .describe(
            "The list of tasks to be done on this day to follow the preparation",
          ),
      }),
    )
    .describe(
      "A day-wise preparation plan for the candidate to follow in order to  prepare for the interview",
    ),
  title: z.string().describe("A title summarizing the interview report"),
});

/**
 * @description This function generates an interview report based on the candidate's resume, self-description, and job description. The report includes technical questions, behavioral questions, skills gaps, preparation plan, overall feedback, and a score.
 * @param {Object} params - The parameters for generating the interview report.
 * @param {string} params.resume - The candidate's resume text.
 * @param {string} params.selfDescription - The candidate's self-description.
 */
async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const prompt = `
Generate an interview report.

Return ONLY valid JSON matching this structure:

{
  "title": string,
  "matchScore": number,
  "technicalQuestions": [
    {
      "question": string,
      "intention": string,
      "answer": string
    }
  ],
  "behavioralQuestions": [
    {
      "question": string,
      "intention": string,
      "answer": string
    }
  ],
  "skillGaps": [
    {
      "skill": string,
      "severity": "low" | "medium" | "high"
    }
  ],
  "preparationPlan": [
    {
      "day": number,
      "focus": string,
      "tasks": string[]
    }
  ]
}

Do not return anything outside JSON.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      response_mine_type: "application/json",
      response_schema: zodToJsonSchema(interviewReportSchema),
    },
  });

  let report = response.text;

  // remove ```json and ```
  report = report
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(report);
}

module.exports = generateInterviewReport;
