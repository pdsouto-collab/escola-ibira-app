git add .
git commit -m "feat(students): update CSV import parser to match Google Forms layout"
git push origin develop
git checkout homolog
git merge develop -m "Merge develop into homolog"
git push origin homolog
git checkout main
git merge homolog -m "Merge homolog into main"
git push origin main
git checkout develop
