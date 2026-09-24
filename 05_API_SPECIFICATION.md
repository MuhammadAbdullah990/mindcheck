# MindCheck — API Specification

---

## Base URL
```
Development:  http://localhost:3001/api
Production:   https://mindcheck-api.onrender.com/api
```

## Authentication
- Most endpoints work **without authentication** (anonymous mode)
- Protected endpoints require `Authorization: Bearer <JWT_TOKEN>`
- Anonymous users identified by `X-Anon-Token: <UUID>` header

---

## Endpoints

### 🔓 Auth Routes — `/api/auth`

#### POST `/api/auth/register`
Create a new user account (optional — for progress tracking).
```json
// Request
{
  "email": "user@example.com",
  "password": "securePassword123",
  "displayName": "Abdullah"    // optional
}

// Response 201
{
  "success": true,
  "data": {
    "user": { "id": "clx...", "email": "user@example.com", "displayName": "Abdullah" },
    "token": "eyJhbG..."
  }
}
```

#### POST `/api/auth/login`
```json
// Request
{ "email": "user@example.com", "password": "securePassword123" }

// Response 200
{
  "success": true,
  "data": {
    "user": { "id": "clx...", "email": "user@example.com", "displayName": "Abdullah" },
    "token": "eyJhbG..."
  }
}
```

#### GET `/api/auth/me` 🔒
Get current user profile. Requires auth token.
```json
// Response 200
{
  "success": true,
  "data": { "id": "clx...", "email": "user@example.com", "displayName": "Abdullah" }
}
```

---

### 📋 Assessment Routes — `/api/assessments`

#### GET `/api/assessments`
List all available screening tools.
```json
// Response 200
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "slug": "phq9",
      "name": "PHQ-9",
      "fullName": "Patient Health Questionnaire-9",
      "description": "A widely-used screening tool for depression...",
      "estimatedTime": 3,
      "totalItems": 9,
      "subscales": []
    },
    // ... gad7, pss10, dass21
  ]
}
```

#### GET `/api/assessments/:slug`
Get full detail for one assessment (including questions).
```json
// Response 200
{
  "success": true,
  "data": {
    "id": "clx...",
    "slug": "phq9",
    "name": "PHQ-9",
    "fullName": "Patient Health Questionnaire-9",
    "instructions": "Over the last 2 weeks...",
    "timeframe": "last 2 weeks",
    "estimatedTime": 3,
    "totalItems": 9,
    "maxScore": 27,
    "questions": [
      {
        "number": 1,
        "text": "Little interest or pleasure in doing things",
        "isCritical": false,
        "subscale": null
      },
      // ... all questions
      {
        "number": 9,
        "text": "Thoughts that you would be better off dead, or of hurting yourself in some way",
        "isCritical": true,
        "subscale": null
      }
    ],
    "responseOptions": [
      { "value": 0, "label": "Not at all" },
      { "value": 1, "label": "Several days" },
      { "value": 2, "label": "More than half the days" },
      { "value": 3, "label": "Nearly every day" }
    ]
  }
}
```

---

### 🧪 Session Routes — `/api/sessions`

#### POST `/api/sessions`
Start a new screening session.
```json
// Request
{
  "assessmentSlug": "phq9",
  "anonToken": "550e8400-e29b-41d4-a716-446655440000"  // if anonymous
}
// Headers (if logged in): Authorization: Bearer <token>

// Response 201
{
  "success": true,
  "data": {
    "sessionId": "clx...",
    "assessmentSlug": "phq9",
    "status": "IN_PROGRESS",
    "startedAt": "2026-09-23T10:00:00Z"
  }
}
```

#### POST `/api/sessions/:sessionId/responses`
Submit answer(s) for the session. Supports single or batch submission.
```json
// Request — single answer
{
  "questionNum": 1,
  "answerValue": 2,
  "answerLabel": "More than half the days"
}

// Request — batch (submit all at once)
{
  "responses": [
    { "questionNum": 1, "answerValue": 2, "answerLabel": "More than half the days" },
    { "questionNum": 2, "answerValue": 1, "answerLabel": "Several days" },
    // ...
  ]
}

// Response 200
{
  "success": true,
  "data": {
    "saved": 9,
    "criticalAlert": false  // true if a critical item was flagged
  }
}
```

#### POST `/api/sessions/:sessionId/complete`
Mark session as complete, trigger scoring.
```json
// Response 200
{
  "success": true,
  "data": {
    "resultId": "clx...",
    "totalScore": 14,
    "maxPossible": 27,
    "severityLevel": "moderate",
    "severityColor": "orange",
    "criticalFlag": false,
    "subscaleScores": null,   // null for single-scale tests
    "interpretation": "Your score suggests moderate depression symptoms...",
    "recommendations": [
      "Consider speaking with a mental health professional",
      "Self-help resources can be a helpful first step"
    ],
    "resources": [
      { "title": "Finding a Therapist", "url": "...", "type": "WEBSITE" },
      // ...
    ]
  }
}
```

---

### 📊 Results Routes — `/api/results`

#### GET `/api/results/:resultId`
Get detailed result for a specific session.
```json
// Response 200
{
  "success": true,
  "data": {
    "id": "clx...",
    "assessment": { "name": "PHQ-9", "slug": "phq9" },
    "totalScore": 14,
    "maxPossible": 27,
    "percentage": 51.9,
    "severityLevel": "moderate",
    "severityColor": "orange",
    "criticalFlag": false,
    "flaggedItems": [],
    "subscaleScores": null,
    "completedAt": "2026-09-23T10:05:00Z",
    "interpretation": {
      "summary": "Your responses suggest moderate symptoms of depression.",
      "detail": "A score of 14 on the PHQ-9 falls in the moderate range (10-14)...",
      "disclaimer": "This screening is not a diagnosis. Only a qualified healthcare provider can diagnose depression."
    },
    "recommendations": [
      {
        "priority": 1,
        "text": "Consider scheduling an appointment with a mental health professional",
        "type": "action"
      },
      {
        "priority": 2,
        "text": "Practice regular self-care: sleep, exercise, social connection",
        "type": "self-help"
      }
    ]
  }
}
```

#### GET `/api/results/history` 🔒
Get past results for the logged-in user (progress tracking).
```json
// Query params: ?assessment=phq9&limit=10

// Response 200
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "assessment": "PHQ-9",
      "totalScore": 14,
      "severityLevel": "moderate",
      "completedAt": "2026-09-23T10:05:00Z"
    },
    {
      "id": "clx...",
      "assessment": "PHQ-9",
      "totalScore": 8,
      "severityLevel": "mild",
      "completedAt": "2026-09-09T14:20:00Z"
    }
  ]
}
```

---

### 📚 Resources Routes — `/api/resources`

#### GET `/api/resources`
Get curated resources filtered by category and severity.
```json
// Query params: ?category=depression&severity=moderate&country=global

// Response 200
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "title": "988 Suicide & Crisis Lifeline",
      "description": "Free, confidential 24/7 crisis support",
      "phone": "988",
      "type": "HOTLINE",
      "category": "crisis",
      "country": "US"
    },
    // ...
  ]
}
```

---

## Error Response Format
All errors follow consistent structure:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": [
      { "field": "email", "message": "Email is required" }
    ]
  }
}
```

## Rate Limiting
| Route | Limit |
|-------|-------|
| `/api/auth/register` | 5 requests / 15 min |
| `/api/auth/login` | 10 requests / 15 min |
| `/api/sessions` | 20 requests / hour |
| All other routes | 100 requests / 15 min |
