# Smart Campus Placement Support System — Backend

Django REST Framework backend for the Smart Campus Placement Support System.

## Setup

```bash
cd backend

# 1. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # on Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment variables
cp .env.example .env
# then edit .env and add your SECRET_KEY, GEMINI_API_KEY / OPENAI_API_KEY, etc.

# 4. Run migrations
python manage.py makemigrations
python manage.py migrate

# 5. Create a superuser (for /admin/ access)
python manage.py createsuperuser

# 6. Run the dev server
python manage.py runserver
```

Backend runs at `http://localhost:8000/`. Admin panel at `http://localhost:8000/admin/`.

## Connecting the React frontend

1. Install axios in your React app: `npm install axios`
2. Create an API client, e.g. `src/api/axios.js`:

```js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token"); // or in-memory/context, not localStorage in production
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

3. Example login call:
```js
const res = await api.post("auth/login/", { email, password });
localStorage.setItem("access_token", res.data.access);
localStorage.setItem("refresh_token", res.data.refresh);
```

## App-by-app endpoint map

| App | Base URL | Purpose |
|---|---|---|
| users | `/api/auth/` | register, login, logout, JWT refresh, password reset |
| students | `/api/students/` | profile, academic records, skills, projects, certifications, achievements |
| companies | `/api/companies/` | company CRUD, eligibility criteria, placement drives |
| jobs | `/api/jobs/` | job search/filter, save/unsave, apply |
| applications | `/api/applications/` | apply, track status, officer status updates |
| recommendations | `/api/recommendations/` | ML-based job recommendations (scikit-learn TF-IDF) |
| preparation | `/api/preparation/` | Interview Preparation dashboard, topics, progress, mock interviews |
| resume | `/api/resume/` | Resume Builder, AI summary enhancement, PDF export, ATS Checker |
| chatbot | `/api/chatbot/` | AI Helpdesk floating widget, admin knowledge base |
| notifications | `/api/notifications/` | notification bell/list, unread count |
| analytics | `/api/analytics/` | Placement Analytics dashboard, student readiness score |

## Notes

- Switch `DB_ENGINE` in `.env` to MySQL for production (see `.env.example`).
- Set `AI_PROVIDER=gemini` or `AI_PROVIDER=openai` in `.env` depending on which key you have.
- `resume` and `chatbot` apps each call the configured AI provider — see `ai_service.py` in each.
- CORS is already configured for `localhost:3000` and `localhost:5173` (CRA / Vite) — update `CORS_ALLOWED_ORIGINS` in `.env` for your deployed frontend URL.
