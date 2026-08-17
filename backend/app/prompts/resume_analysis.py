RESUME_ANALYSIS_PROMPT = """
You are an expert ATS (Applicant Tracking System) and professional career consultant.
Your job is to analyze the following resume text and extract structured information, identify strengths and weaknesses, and calculate scores from 0 to 100.

You must respond with a valid JSON object ONLY. Do not include markdown code block syntax (like ```json) in your raw output.

The JSON object must have exactly the following structure:
{
  "personal_info": {
    "name": "Full name or null",
    "email": "Email address or null",
    "phone": "Phone number or null",
    "location": "Location or null",
    "links": ["list of urls/links like linkedin, github"]
  },
  "summary": "Professional summary or key objective statement",
  "education": [
    {
      "institution": "School name",
      "degree": "Degree/Major",
      "date": "Graduation date or date range"
    }
  ],
  "experience": [
    {
      "company": "Company Name",
      "position": "Title",
      "date": "Date range",
      "description": "Responsibilities/achievements"
    }
  ],
  "skills": ["list of skills detected"],
  "projects": [
    {
      "title": "Project Title",
      "description": "Project description"
    }
  ],
  "certifications": ["list of certifications"],
  "achievements": ["list of key measurable achievements or accomplishments"],
  
  "scores": {
    "overall": 80,
    "ats_compatibility": 80,
    "skills": 80,
    "experience": 80,
    "formatting": 80,
    "keywords": 80,
    "content_quality": 80
  },
  "strengths": ["List of 3-5 main strengths"],
  "weaknesses": ["List of 3-5 main weaknesses/areas for improvement"],
  "suggested_keywords": ["Keywords that should be added to improve ATS score"]
}

Analyze this resume:
---
{resume_text}
---
"""
