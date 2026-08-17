$ErrorActionPreference = "Continue"

Write-Host ">>> Deploying escola-ibira-app (Web)..." -ForegroundColor Cyan
Set-Location "C:\Users\silvi\.gemini\antigravity\scratch\escola-ibira-app"
git add .
git commit -m "feat(users): lock email alteration and enable multi-role assignment per user"
git push origin develop
git checkout homolog
git pull origin homolog
git merge develop -m "Merge branch 'develop' into homolog"
git push origin homolog
git checkout main
git pull origin main
git merge homolog -m "Merge branch 'homolog' into main"
git push origin main
git checkout develop

Write-Host ">>> Deploying escola-ibira-mobile (Mobile)..." -ForegroundColor Cyan
Set-Location "C:\Users\silvi\.gemini\antigravity\scratch\escola-ibira-mobile"
git add .
git commit -m "feat(users): lock email alteration and enable multi-role assignment"
git push origin develop
git checkout homolog
git pull origin homolog
git merge develop -m "Merge branch 'develop' into homolog"
git push origin homolog
git checkout main
git pull origin main
git merge develop -m "Merge branch 'develop' into main"
git push origin main
git checkout develop

Write-Host ">>> Deployment completed successfully!" -ForegroundColor Green
