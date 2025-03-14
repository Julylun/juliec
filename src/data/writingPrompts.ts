import { WritingTopic } from '../types/topics';

interface WritingPrompt {
  content: string;
}

interface Correction {
  start: number;  // Vị trí bắt đầu trong text
  end: number;    // Vị trí kết thúc trong text
  original: string;
  suggestion: string;
  explanation: string;
  type: 'grammar' | 'vocabulary' | 'style' | 'structure'; // Loại lỗi để hiển thị màu khác nhau
}

interface WritingFeedback {
  score: number;
  generalFeedback: string;  // Nhận xét chung bằng tiếng Việt
  strengthPoints: string[]; // Các điểm mạnh bằng tiếng Việt
  improvementPoints: string[]; // Các điểm cần cải thiện bằng tiếng Việt
  corrections: Correction[];
}

export const getPromptGeneratorByTopic = (topic: WritingTopic, englishStandard: string) => {
  const basePrompt = `
You are a professional ${englishStandard.toUpperCase()} writing examiner. Generate a writing task that follows the exact format of ${englishStandard.toUpperCase()} writing tests.
The task should be suitable for ${topic.difficulty} level students.

IMPORTANT: 
- Generate a complete writing prompt in English, similar to real ${englishStandard.toUpperCase()} tests
- Create detailed and complex scenarios that require longer responses
- Include specific requirements and evaluation criteria
- Keep the format clean and professional
- Use only basic characters (avoid bullets, asterisks, or any special formatting)
- Use simple line breaks (\\n) and dashes (-) for lists
- Response must be a valid JSON object with a single "content" field containing the entire prompt
- Do not include any text outside the JSON object

{
  "content": "<complete writing prompt with directions and requirements>"
}`;

  switch (topic.id) {
    case 'business-email':
      return basePrompt + `
Example format:
{
  "content": "Directions: Read the company announcement and the employee email. Then, write a response to the employee. In your response, you should:\\n\\n- Answer all of the employee's questions\\n- Provide any relevant information requested\\n- Write at least 300 words\\n\\nCompany Announcement:\\n\\nSubject: Launch of the Sustainable Commuting Initiative\\nDate: October 26, 2024\\n\\nDear Employees,\\n\\nAs part of our ongoing commitment to environmental responsibility, we are excited to announce the launch of our new Sustainable Commuting Initiative, effective November 15, 2024. This initiative aims to reduce our company's carbon footprint and promote employee well-being by encouraging eco-friendly commuting options.\\n\\nThe program includes the following key components:\\n\\n- Subsidized Public Transportation: We will offer a 50% subsidy on monthly public transportation passes (bus, train, subway) for all employees.\\n\\n- Cycling Incentive: Employees who regularly cycle to work (at least three times per week) will receive a monthly stipend of $50 to cover bike maintenance and related expenses. Secure bike storage facilities and shower facilities will be available on-site.\\n\\n- Carpooling Program: We will facilitate a carpooling platform to connect employees who live near each other and are interested in sharing rides. Designated preferential parking spots will be provided for carpool participants.\\n\\n- Electric Vehicle (EV) Charging Stations: We are installing six EV charging stations in the employee parking lot, available on a first-come, first-served basis at a subsidized rate.\\n\\nTo participate in any of these programs, employees must register online through the company intranet by November 8, 2024. Detailed guidelines and registration forms are available on the intranet under the Sustainable Commuting Initiative section.\\n\\nWe believe that this initiative will not only benefit the environment but also improve employee morale and create a more sustainable workplace. We encourage all employees to participate and help us make a positive impact.\\n\\nSincerely,\\nThe Sustainability Committee\\n\\nEmployee Email:\\n\\nSubject: Questions about the Sustainable Commuting Initiative\\nFrom: Sarah Chen\\nTo: Sustainability Committee\\nDate: October 28, 2024\\n\\nDear Sustainability Committee,\\n\\nI am writing to express my interest in the Sustainable Commuting Initiative. I am particularly interested in the cycling incentive, as I live relatively close to the office and enjoy cycling. However, I have a few questions before I can commit to the program.\\n\\nFirst, can you clarify what constitutes regularly cycle to work? Does it mean cycling every workday, or are there exceptions for occasional inclement weather or other unforeseen circumstances? Also, what kind of documentation is required to prove that I cycle to work three times a week? Will a simple log suffice, or do I need some other form of verification?\\n\\nSecond, I am curious about the electric vehicle (EV) charging stations. Are there any plans to increase the number of charging stations in the future, given the growing popularity of EVs? Also, what is the subsidized rate for using the charging stations? Is it a flat fee or based on the amount of electricity consumed?\\n\\nFinally, I am slightly concerned about the location of the bike storage facilities. Are they located in a secure area to prevent theft or damage to bicycles? Are there security cameras installed in the area?\\n\\nThank you for your time and consideration. I look forward to hearing from you soon.\\n\\nSincerely,\\nSarah Chen\\n\\nDirections: You are a member of the Sustainability Committee. Write an email response to Sarah Chen, answering her questions and providing any additional relevant information. Remember to address all her concerns clearly and professionally."
}`;

    case 'report-writing':
      return basePrompt + `
Example format:
{
  "content": "The graphs below show detailed data about global renewable energy adoption and investment trends across different sectors from 2010 to 2023, with projections until 2030.\\n\\nGraph 1: Renewable Energy Market Share by Sector\\nPercentage of total energy consumption:\\n\\nIndustrial Sector:\\n- 2010: 12%\\n- 2015: 18%\\n- 2020: 27%\\n- 2023: 35%\\n- 2030 (projected): 55%\\n\\nCommercial Sector:\\n- 2010: 8%\\n- 2015: 15%\\n- 2020: 25%\\n- 2023: 38%\\n- 2030 (projected): 60%\\n\\nResidential Sector:\\n- 2010: 5%\\n- 2015: 10%\\n- 2020: 20%\\n- 2023: 30%\\n- 2030 (projected): 45%\\n\\nGraph 2: Global Investment in Renewable Technologies\\nAnnual investment in billions of USD:\\n\\nSolar Energy:\\n- 2010: 50\\n- 2015: 120\\n- 2020: 180\\n- 2023: 250\\n- 2030 (projected): 400\\n\\nWind Power:\\n- 2010: 40\\n- 2015: 100\\n- 2020: 150\\n- 2023: 220\\n- 2030 (projected): 350\\n\\nHydroelectric:\\n- 2010: 30\\n- 2015: 60\\n- 2020: 85\\n- 2023: 100\\n- 2030 (projected): 150\\n\\nGraph 3: Environmental Impact\\nAnnual reduction in carbon emissions (million metric tons):\\n\\n- 2010: 100\\n- 2015: 250\\n- 2020: 500\\n- 2023: 750\\n- 2030 (projected): 1500\\n\\nWrite a detailed analytical report that:\\n\\n1. Analyzes the trends in renewable energy adoption across different sectors\\n2. Examines the relationship between investment patterns and market share growth\\n3. Evaluates the environmental impact of increased renewable energy adoption\\n4. Discusses the implications of the projected trends for 2030\\n5. Considers potential challenges and opportunities in achieving the projected goals\\n\\nYour report should:\\n- Include a clear introduction and conclusion\\n- Use appropriate language for describing trends and making comparisons\\n- Support your analysis with specific data from the graphs\\n- Consider both positive and negative aspects of the trends\\n- Suggest potential reasons for the observed patterns\\n\\nWrite 350-400 words."
}`;

    case 'memo-writing':
      return basePrompt + `
Example format:
{
  "content": "As a senior manager in the Human Resources department, write a detailed memo to all employees about the upcoming changes to the company's flexible working policy.\\n\\nThe memo should address:\\n\\n- New hybrid work schedule (3 days in office, 2 days remote)\\n- Core office hours (10 AM - 3 PM)\\n- Meeting protocols for hybrid teams\\n- Equipment and technology support for remote work\\n- Performance evaluation adjustments\\n\\nInclude specific guidelines, implementation timeline, and contact information for questions.\\n\\nWrite 250-300 words."
}`;

    case 'proposal-writing':
      return basePrompt + `
Example format:
{
  "content": "As the Marketing Director, write a detailed proposal for launching a new customer loyalty program.\\n\\nYour proposal should include:\\n\\n- Analysis of current customer retention rates\\n- Detailed features of the proposed loyalty program\\n- Implementation costs and timeline\\n- Projected benefits and ROI\\n- Risk assessment and mitigation strategies\\n\\nSupport your proposal with specific data and market research.\\n\\nWrite 350-400 words."
}`;

    case 'letter-writing':
      return basePrompt + `
Example format:
{
  "content": "You recently stayed at the Grand Plaza Hotel for a week-long business conference. While the location and conference facilities were excellent, there were several significant issues with your room and the service provided.\\n\\nWrite a letter to the hotel manager. In your letter:\\n\\n- Provide specific details about your stay (dates, room number, etc.)\\n- Describe at least THREE problems you experienced\\n- Explain how these issues affected your stay\\n- Request specific compensation or resolution\\n\\nWrite 250-300 words."
}`;

    default:
      return basePrompt + `
Example format:
{
  "content": "<complete writing prompt with clear instructions and requirements>"
}`;
  }
};

export const getEvaluationPromptByTopic = (topic: WritingTopic, essay: string, englishStandard: string) => {
  const basePrompt = `
You are a professional ${englishStandard.toUpperCase()} writing examiner. Evaluate the following ${topic.title.toLowerCase()} based on ${englishStandard.toUpperCase()} standards.

Writing Topic: ${topic.title}
Difficulty Level: ${topic.difficulty}

The essay to evaluate:
"""
${essay}
"""

IMPORTANT EVALUATION CRITERIA:
1. Topic Relevance (30% of total score)
   - Check if the essay directly addresses the given prompt
   - Verify if all required points in the prompt are covered
   - Assess if the content stays focused on the topic
   - Deduct points heavily for off-topic content

2. Language Use (25% of total score)
   - Grammar accuracy
   - Vocabulary appropriateness
   - Sentence structure variety
   - Professional terminology relevant to the topic

3. Organization (25% of total score)
   - Clear structure (introduction, body, conclusion)
   - Logical flow of ideas
   - Proper paragraphing
   - Coherence and cohesion

4. Task Achievement (20% of total score)
   - Meeting the word count requirement
   - Following the format requirements
   - Addressing all parts of the prompt
   - Providing relevant examples/support

SCORING GUIDELINES:
- 90-100: Exceptional (Perfectly addresses the topic, minimal errors)
- 80-89: Very Good (Strong topic relevance, few minor errors)
- 70-79: Good (Generally relevant, some noticeable errors)
- 60-69: Fair (Partially relevant, frequent errors)
- Below 60: Poor (Off-topic or major issues)

IMPORTANT: If the essay is completely off-topic or does not address the prompt requirements, the maximum score should be 50.

IMPORTANT INSTRUCTIONS FOR RESPONSE FORMAT:
1. Response must be a valid JSON object
2. Use ONLY double quotes (") for strings, never single quotes
3. Escape all special characters in strings properly:
   - Use \\" for quotes inside strings
   - Use \\n for newlines
   - Use \\t for tabs
4. Keep all feedback text in Vietnamese, using basic ASCII characters only
5. For text positions, count characters from 0, including spaces and line breaks
6. For corrections, only include actual errors (grammar, vocabulary, style, structure)
7. Keep all text content simple and avoid special characters

Response must follow this exact format:
{
  "score": <number between 0-100>,
  "generalFeedback": "<overall assessment in Vietnamese>",
  "strengthPoints": [
    "<strength point in Vietnamese>",
    "<strength point in Vietnamese>",
    "<strength point in Vietnamese>"
  ],
  "improvementPoints": [
    "<improvement point in Vietnamese>",
    "<improvement point in Vietnamese>",
    "<improvement point in Vietnamese>"
  ],
  "corrections": [
    {
      "start": <number>,
      "end": <number>,
      "original": "<text from essay>",
      "suggestion": "<corrected text>",
      "explanation": "<explanation in Vietnamese>",
      "type": "<one of: grammar, vocabulary, style, structure>"
    }
  ]
}

IMPORTANT RULES:
1. ALL strings must use double quotes and be properly escaped
2. NO special characters or formatting in text
3. NO line breaks within strings (use \\n if needed)
4. Keep Vietnamese text simple and avoid diacritical marks if possible
5. Maximum 5 items in strengthPoints and improvementPoints
6. Maximum 10 corrections
7. Ensure all JSON syntax is valid`;

  switch (topic.id) {
    case 'business-email':
      return basePrompt + `

Additional evaluation points:
- Email format and structure
- Professional tone and courtesy
- Clear and concise message
- Appropriate business vocabulary
- Response relevance to the email scenario`;

    case 'report-writing':
      return basePrompt + `

Additional evaluation points:
- Data interpretation accuracy
- Analysis depth and clarity
- Professional report structure
- Use of data to support points
- Logical conclusions from data`;

    case 'memo-writing':
      return basePrompt + `

Additional evaluation points:
- Memo format compliance
- Information clarity
- Action items specificity
- Timeline and deadlines
- Internal communication style`;

    case 'proposal-writing':
      return basePrompt + `

Additional evaluation points:
- Problem-solution clarity
- Cost-benefit analysis
- Implementation feasibility
- Risk assessment
- Persuasive argumentation`;

    case 'letter-writing':
      return basePrompt + `

Additional evaluation points:
- Letter format compliance
- Tone appropriateness
- Purpose clarity
- Issue description
- Resolution request clarity`;

    default:
      return basePrompt + `

Additional evaluation points:
- Content relevance
- Argument strength
- Supporting evidence
- Conclusion effectiveness
- Overall coherence`;
  }
};

export type { WritingPrompt, WritingFeedback, Correction };