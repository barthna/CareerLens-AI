import json
import httpx
import logging
import re
from typing import Dict, Any, Optional
from app.core.config import settings
from app.prompts.resume_analysis import RESUME_ANALYSIS_PROMPT
from app.prompts.job_matching import JOB_MATCHING_PROMPT
from app.prompts.resume_improvement import RESUME_IMPROVEMENT_PROMPT
from app.prompts.interview_simulator import (
    INTERVIEW_QUESTION_PROMPT,
    INTERVIEW_FEEDBACK_PROMPT,
    INTERVIEW_SCORECARD_PROMPT
)


logger = logging.getLogger("uvicorn.error")

class AIService:
    @staticmethod
    async def _call_gemini(prompt: str) -> str:
        """Call Gemini API directly via HTTP post to avoid heavy SDK dependencies."""
        if not settings.AI_API_KEY:
            raise ValueError("AI_API_KEY is not configured")
        
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.AI_MODEL}:generateContent?key={settings.AI_API_KEY}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }],
            "generationConfig": {
                "responseMimeType": "application/json"
            }
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, headers=headers, json=payload, timeout=30.0)
                if response.status_code != 200:
                    logger.error(f"Gemini API returned status {response.status_code}: {response.text}")
                    raise Exception(f"Gemini API error: {response.text}")
                
                res_data = response.json()
                text_content = res_data["candidates"][0]["content"]["parts"][0]["text"]
                return text_content
            except Exception as e:
                logger.error(f"Failed to communicate with Gemini API: {str(e)}")
                raise e

    @classmethod
    async def analyze_resume(cls, resume_text: str) -> Dict[str, Any]:
        """Analyzes resume text using Gemini, falls back to a mock analysis if no key is provided."""
        prompt = RESUME_ANALYSIS_PROMPT.replace("{resume_text}", resume_text)
        
        if not settings.AI_API_KEY:
            logger.warning("AI_API_KEY not found. Using realistic mock resume analysis.")
            return cls._get_mock_resume_analysis(resume_text)
            
        try:
            raw_response = await cls._call_gemini(prompt)
            # Remove possible markdown wrapper
            clean_json = cls._clean_json_response(raw_response)
            return json.loads(clean_json)
        except Exception as e:
            logger.error(f"Error during AI resume analysis: {str(e)}. Falling back to mock data.")
            return cls._get_mock_resume_analysis(resume_text)

    @classmethod
    async def calculate_job_match(cls, resume_text: str, job_description: str) -> Dict[str, Any]:
        """Compares resume text to job description and generates match stats."""
        prompt = JOB_MATCHING_PROMPT.replace("{resume_text}", resume_text).replace("{job_description}", job_description)
        
        if not settings.AI_API_KEY:
            logger.warning("AI_API_KEY not found. Using realistic mock job matching.")
            return cls._get_mock_job_match(resume_text, job_description)
            
        try:
            raw_response = await cls._call_gemini(prompt)
            clean_json = cls._clean_json_response(raw_response)
            return json.loads(clean_json)
        except Exception as e:
            logger.error(f"Error during AI job matching: {str(e)}. Falling back to mock data.")
            return cls._get_mock_job_match(resume_text, job_description)

    @classmethod
    async def generate_resume_improvements(cls, resume_text: str) -> Dict[str, Any]:
        """Generates section-by-section rewrite suggestions for the resume."""
        prompt = RESUME_IMPROVEMENT_PROMPT.replace("{resume_text}", resume_text)
        
        if not settings.AI_API_KEY:
            logger.warning("AI_API_KEY not found. Using realistic mock improvements.")
            return cls._get_mock_improvements(resume_text)
            
        try:
            raw_response = await cls._call_gemini(prompt)
            clean_json = cls._clean_json_response(raw_response)
            return json.loads(clean_json)
        except Exception as e:
            logger.error(f"Error during AI resume improvements: {str(e)}. Falling back to mock data.")
            return cls._get_mock_improvements(resume_text)

    @staticmethod
    def _clean_json_response(text: str) -> str:
        """Cleans possible markdown wrap code block (```json ... ```)."""
        text = text.strip()
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        return text.strip()

    @staticmethod
    def _get_mock_resume_analysis(text: str) -> Dict[str, Any]:
        """Generates mock data by parsing user's resume text via simple rules/regex."""
        # Simple extraction heuristics
        name = "Alex Mercer"
        email = "alex.mercer@example.com"
        phone = "+1 (555) 019-2834"
        location = "San Francisco, CA"
        
        email_match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", text)
        if email_match:
            email = email_match.group(0)
            
        phone_match = re.search(r"\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}", text)
        if phone_match:
            phone = phone_match.group(0)

        # Look for skills in text
        all_known_skills = ["React", "TypeScript", "JavaScript", "Python", "FastAPI", "SQL", "PostgreSQL", 
                            "Docker", "AWS", "Git", "Node.js", "Java", "Kubernetes", "Redis", "HTML", "CSS"]
        found_skills = []
        for s in all_known_skills:
            if re.search(r"\b" + re.escape(s) + r"\b", text, re.IGNORECASE):
                found_skills.append(s)
        
        if not found_skills:
            found_skills = ["React", "TypeScript", "Node.js", "PostgreSQL", "Git"]

        return {
            "personal_info": {
                "name": name,
                "email": email,
                "phone": phone,
                "location": location,
                "links": ["https://linkedin.com/in/alexmercer", "https://github.com/alexmercer"]
            },
            "summary": "Experienced Full Stack Developer with over 4 years of hands-on experience designing, building, and deploying robust web applications. Skilled in modern frontend frameworks and scalable backend APIs.",
            "education": [
                {
                    "institution": "State University of Computer Sciences",
                    "degree": "B.S. in Computer Science",
                    "date": "2018 - 2022"
                }
            ],
            "experience": [
                {
                    "company": "TechCorp Solutions",
                    "position": "Software Engineer",
                    "date": "2022 - Present",
                    "description": "Collaborated with cross-functional teams to build React & Node.js features. Designed REST APIs reducing latencies by 20%. Integrated Postgres database schemas."
                }
            ],
            "skills": found_skills,
            "projects": [
                {
                    "title": "E-Commerce Microservices",
                    "description": "Developed backend APIs using FastAPI and Docker to handle high transaction volumes."
                }
            ],
            "certifications": ["AWS Certified Cloud Practitioner"],
            "achievements": ["Successfully migrated monolithic user service into highly performant serverless modules"],
            "scores": {
                "overall": 85,
                "ats_compatibility": 88,
                "skills": 84,
                "experience": 82,
                "formatting": 90,
                "keywords": 81,
                "content_quality": 86
            },
            "strengths": [
                "Strong foundational frontend knowledge with modern frameworks (React/TypeScript)",
                "Excellent database structures and clean API design methodologies",
                "Demonstrated professional growth and cloud certification credentials"
            ],
            "weaknesses": [
                "Experience descriptions could feature more quantified business metrics",
                "Summary statement is somewhat generic and lacks clear niche focus",
                "Could benefit from displaying CI/CD pipeline automation skills explicitly"
            ],
            "suggested_keywords": ["CI/CD", "AWS ECS", "Tailwind CSS", "Redis", "Unit Testing", "Kubernetes"]
        }

    @staticmethod
    def _get_mock_job_match(resume: str, job_desc: str) -> Dict[str, Any]:
        """Generates mock job comparison analysis."""
        # Check matching skills
        all_skills = ["React", "TypeScript", "Python", "FastAPI", "SQL", "PostgreSQL", "Docker", "AWS", "Kubernetes", "Redis"]
        matched = []
        missing = []
        
        for skill in all_skills:
            in_resume = re.search(r"\b" + re.escape(skill) + r"\b", resume, re.IGNORECASE)
            in_job = re.search(r"\b" + re.escape(skill) + r"\b", job_desc, re.IGNORECASE)
            
            if in_job:
                if in_resume:
                    matched.append(skill)
                else:
                    missing.append(skill)

        if not matched:
            matched = ["React", "TypeScript", "SQL"]
        if not missing:
            missing = ["Docker", "AWS", "Redis"]

        missing_skills_struct = []
        for m in missing:
            importance = "High" if m in ["Docker", "AWS", "FastAPI"] else "Medium"
            missing_skills_struct.append({
                "name": m,
                "importance": importance,
                "why_it_matters": f"Frequently cited in the job requirements as necessary for maintaining containerized systems and cloud-based services.",
                "suggested_learning_path": [
                    f"Review the official documentation of {m}",
                    f"Build a simple demo project integrating {m} with your existing stack",
                    f"Deploy the container or service to production environment"
                ]
            })

        return {
            "scores": {
                "overall": 78,
                "skills": 82,
                "experience": 75,
                "education": 90,
                "keywords": 70,
                "responsibilities": 80
            },
            "matched_skills": matched,
            "missing_skills": missing_skills_struct,
            "recommendations": {
                "why_good_match": "The candidate has demonstrated hands-on engineering experience in matching technologies and has a formal Computer Science background matching the qualifications.",
                "what_may_hurt": "Missing specific knowledge in system architecture and specialized cloud deployment services (AWS/Docker/Kubernetes).",
                "what_to_improve": "Highlight any containerization experience in project listings and emphasize API latency optimizations.",
                "recommended_resume_changes": [
                    "Under TechCorp Solutions, specify how Docker was utilized to streamline developer setups.",
                    "Include any AWS deployments or serverless functions in your cloud architecture highlights."
                ],
                "interview_prep_topics": [
                    {
                        "topic": "System Design",
                        "sample_question": "How would you design a scalable notification service that handles millions of requests?",
                        "how_to_answer": "Reference your REST API optimization at TechCorp and explain horizontal scaling, queuing (e.g. RabbitMQ/Redis), and caching."
                    },
                    {
                        "topic": "Docker Containers",
                        "sample_question": "What is the difference between an image and a container?",
                        "how_to_answer": "State that an image is a read-only blueprint, and a container is a live running instance of that blueprint."
                    }
                ]
            }
        }

    @staticmethod
    def _get_mock_improvements(resume: str) -> Dict[str, Any]:
        """Generates mock section rewrite suggestions."""
        return {
            "improvements": [
                {
                    "section": "Professional Summary",
                    "current": "Experienced Full Stack Developer with over 4 years of hands-on experience designing, building, and deploying robust web applications.",
                    "suggestion": "Performance-driven Full Stack Engineer with 4+ years of experience engineering high-scale web apps, optimizing database queries to cut load times by 25%, and spearheading responsive UI developments.",
                    "why": "The suggestion is more action-oriented and highlights measurable achievements instead of passive descriptions."
                },
                {
                    "section": "Experience Description",
                    "current": "Collaborated with cross-functional teams to build React & Node.js features. Designed REST APIs.",
                    "suggestion": "Spearheaded design and delivery of 12+ customer-facing React components while refactoring Node.js backend endpoints, reducing API response latency by 20%.",
                    "why": "Adding specific metrics and using strong verbs like 'Spearheaded' and 'Refactoring' conveys ownership and impact."
                }
            ]
        }

    @classmethod
    async def generate_interview_question(cls, resume_text: str, job_description: str, focus: str, chat_history: str) -> str:
        """Generates the next customized interview question."""
        prompt = INTERVIEW_QUESTION_PROMPT.format(
            resume_text=resume_text,
            job_description=job_description,
            focus=focus,
            chat_history=chat_history or "No history yet. Start the interview."
        )
        
        if not settings.AI_API_KEY:
            logger.warning("AI_API_KEY not found. Using mock interview questions.")
            return cls._get_mock_interview_question(chat_history)
            
        try:
            # We don't request JSON for this endpoint since it's just raw question text.
            # But the _call_gemini method in settings uses responseMimeType="application/json".
            # Oh wait, let's verify if _call_gemini always requires responseMimeType="application/json"!
            # In ai_service.py: settings.AI_MODEL, responseMimeType is indeed hardcoded.
            # Wait, if responseMimeType is application/json, Gemini expects to return JSON, which we can parse or extract.
            # Let's write a generic question-call or wrap the question prompt in a JSON wrapper.
            # That's much safer! Let's check _call_gemini:
            # line 27: "responseMimeType": "application/json"
            # Since Gemini is configured to output JSON, we should instruct it to return JSON containing the question!
            # Let's adjust prompt or handle it by requesting JSON. Let's look at how the question prompt is written.
            # Let's ask Gemini to return: {"question": "..."}
            pass
        except Exception:
            pass

        # To avoid issues with raw string generation when Gemini is forced to return JSON,
        # we will request a JSON object: {"question": "..."} and parse it. Let's implement that!
        json_prompt = prompt + "\nRespond with a valid JSON object ONLY containing a single key 'question' with the string value of the question."
        try:
            raw_response = await cls._call_gemini(json_prompt)
            clean_json = cls._clean_json_response(raw_response)
            data = json.loads(clean_json)
            return data.get("question", "Could you describe your technical background and some projects you've worked on?")
        except Exception as e:
            logger.error(f"Error generating interview question: {str(e)}. Falling back to mock question.")
            return cls._get_mock_interview_question(chat_history)

    @classmethod
    async def evaluate_interview_response(cls, resume_text: str, job_description: str, question: str, response: str) -> Dict[str, Any]:
        """Evaluates a candidate's interview response with scores and constructive feedback."""
        prompt = INTERVIEW_FEEDBACK_PROMPT.format(
            resume_text=resume_text,
            job_description=job_description,
            question=question,
            response=response
        )
        
        if not settings.AI_API_KEY:
            logger.warning("AI_API_KEY not found. Using mock evaluation.")
            return cls._get_mock_interview_evaluation(question, response)
            
        try:
            raw_response = await cls._call_gemini(prompt)
            clean_json = cls._clean_json_response(raw_response)
            return json.loads(clean_json)
        except Exception as e:
            logger.error(f"Error evaluating interview response: {str(e)}. Falling back to mock.")
            return cls._get_mock_interview_evaluation(question, response)

    @classmethod
    async def generate_interview_scorecard(cls, transcript: str) -> Dict[str, Any]:
        """Generates the overall performance scorecard at the end of the interview."""
        prompt = INTERVIEW_SCORECARD_PROMPT.format(transcript=transcript)
        
        if not settings.AI_API_KEY:
            logger.warning("AI_API_KEY not found. Using mock scorecard.")
            return cls._get_mock_interview_scorecard()
            
        try:
            raw_response = await cls._call_gemini(prompt)
            clean_json = cls._clean_json_response(raw_response)
            return json.loads(clean_json)
        except Exception as e:
            logger.error(f"Error generating interview scorecard: {str(e)}. Falling back to mock.")
            return cls._get_mock_interview_scorecard()

    @staticmethod
    def _get_mock_interview_question(chat_history: str) -> str:
        # Count Q&A pairs in history to decide which question to ask next
        # Let's count occurrences of "Question:" or just length of history
        q_count = chat_history.count("Question:")
        questions = [
            "To start off, could you walk me through your background and explain why you're interested in this role?",
            "I see you have React and TypeScript experience. Can you describe a challenging frontend component you built and how you optimized its rendering performance?",
            "In your experience, how do you handle security and authentication when designing REST APIs with frameworks like FastAPI?",
            "Can you tell me about a time you worked with a cross-functional team and how you resolved a technical disagreement?",
            "Great. Finally, how do you approach database performance tuning and caching for heavy read applications?",
            "That's all the questions I have. Thank you!"
        ]
        if q_count < len(questions):
            return questions[q_count]
        return "That's all the questions I have. Thank you!"

    @staticmethod
    def _get_mock_interview_evaluation(question: str, response: str) -> Dict[str, Any]:
        word_count = len(response.split())
        score = 60 if word_count < 10 else (75 if word_count < 25 else 88)
        
        strengths = ["Structured explanation of the concept."]
        improvements = []
        if word_count < 15:
            improvements.append("Response is too brief. Try to explain with a specific example from your past work using the STAR method (Situation, Task, Action, Result).")
        else:
            improvements.append("Could include more concrete metrics or outcomes of your optimization.")
            strengths.append("Demonstrated direct familiarity with the requested technical stack.")

        return {
            "score": score,
            "strengths": strengths,
            "improvements": improvements,
            "alternative_response": f"An excellent answer would be: 'In my previous project, when faced with this issue, I first profiled the performance using Chrome DevTools, identified the bottleneck in redundant re-renders, and optimized it by memoizing the component context, resulting in a 30% speedup.'"
        }

    @staticmethod
    def _get_mock_interview_scorecard() -> Dict[str, Any]:
        return {
            "overall_score": 84,
            "technical_score": 86,
            "communication_score": 82,
            "performance_summary": "Excellent performance! You answered the questions clearly, structuring your thoughts well. You showed solid familiarity with React and API design, though systems scaling could benefit from more detailed explanation.",
            "key_strengths": [
                "Strong coding foundations and understanding of modern framework architectures",
                "Clear, structured communication pattern"
            ],
            "key_weaknesses": [
                "Could dive deeper into system-level bottlenecks like database connection pool limits or docker containers",
                "Some responses could be more quantitative"
            ]
        }

