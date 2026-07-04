git init
git remote add origin https://github.com/Autonomous-Drone-Target-Tracking-System/AgriVaani
git branch -m main

git add .gitignore .env.example package.json docker-compose.yml
git commit -m "chore: initial project scaffolding"

git add db/
git commit -m "feat: database schema and migrations"

git add apps/recommendation-service/
git commit -m "feat: recommendation service with AI integration"

git add firmware/
git commit -m "feat: arduino sensor node firmware"

git add apps/orchestration-api/
git commit -m "feat: orchestration api and alert engine"

git add apps/officer-dashboard/
git commit -m "feat: next.js officer dashboard ui"

git add scripts/ docs/
git commit -m "feat: demo scripts, synthetic data generators, and documentation"

git add .
git commit -m "chore: project finalize and cleanup"
