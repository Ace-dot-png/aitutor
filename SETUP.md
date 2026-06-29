# aiTutor — Setup Instructions

Follow these steps in order. Do not skip any.

## Part 1 — Install the tools you need

1. Go to nodejs.org and download Node.js version 18 or higher. Install it.
2. Go to git-scm.com and download Git. Install it.
3. Restart your computer after installing both.

## Part 2 — Set up the project

4. Unzip the aitutor-handover.zip folder onto your desktop.
5. Open the unzipped folder.
6. Hold Shift and right-click inside the folder. Click "Open PowerShell window here" or "Open Terminal here".
7. Type this and press Enter: npm install
8. Wait for it to finish. This may take a few minutes.

## Part 3 — Put it on GitHub

9. Go to github.com and create a free account if you don't have one.
10. Click the + button top right and click "New repository".
11. Name it: aitutor
12. Leave everything else as default. Click "Create repository".
13. GitHub will show you a page with setup commands. Copy the URL of your new repository. It will look like: https://github.com/yourusername/aitutor.git
14. Back in your terminal, type these one at a time and press Enter after each:

```
git init
git add .
git commit -m "initial commit"
git branch -M master
git remote add origin https://github.com/yourusername/aitutor.git
git push -u origin master
```

Replace the URL above with your actual GitHub repository URL from step 13.

## Part 4 — Deploy to Vercel

15. Go to vercel.com and create a free account.
16. Click "Add New Project".
17. Click "Import Git Repository" and connect your GitHub account.
18. Select the aitutor repository.
19. Before clicking Deploy, click "Environment Variables".
20. Open the .env.local file from the project folder in Notepad.
21. Add every line from that file as an environment variable in Vercel. Each line is: NAME=VALUE. The name goes in the left box, the value goes in the right box.
22. Click Deploy.
23. Wait for it to finish. You will get a live URL.
24. Copy that live URL.
25. Go back to Vercel → Settings → Environment Variables.
26. Find NEXTAUTH_URL and update its value to your live URL. Example: https://aitutor-abc123.vercel.app
27. Click Save.
28. Go to Deployments tab and click Redeploy once.

## Part 5 — Seed the database

29. Back in your terminal in the project folder, type this and press Enter:
```
npx prisma migrate deploy
```
30. Then type this and press Enter:
```
npx ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts
```

## Done

Your aiTutor is now live. Share the Vercel URL with anyone who needs access.

To make changes in future: edit files in the project folder, then run:
```
git add .
git commit -m "describe your change"
git push
```
Vercel will redeploy automatically.
