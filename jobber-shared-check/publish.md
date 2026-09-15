1. Go to jobber-shared
   cd E:\jobberapp\9-jobber-shared
2. Check what changed
   git status

Review the changes:

git diff 3. Build the package

Always build before publishing:

npm run build

If the build fails, do not publish.

4. Check the current version
   npm pkg get version

For example:

"0.0.11" 5. Increase the version

For normal backward-compatible changes, use patch:

npm version patch --no-git-tag-version

Example:

0.0.11 → 0.0.12

For a new feature:

npm version minor --no-git-tag-version

Example:

0.0.11 → 0.1.0

For breaking changes:

npm version major --no-git-tag-version

Example:

0.0.11 → 1.0.0
Important

Don't use:

npm version patch

if you don't want npm creating a Git commit/tag automatically.

We're using:

npm version patch --no-git-tag-version

so you control the Git commit yourself.

6. Build again after the version change
   npm run build

This is important because your published package contains the build directory.

7. Check the package contents

Before publishing:

npm pack --dry-run

Make sure build is included.

8. Commit the changes
   git add .
   git commit -m "fix: update shared package"

Use a more specific message when possible, e.g.:

git commit -m "fix: update Elasticsearch logger" 9. Push to GitHub

Check your branch:

git branch --show-current

If it says main:

git push origin main

If it says something else:

git push origin <your-branch> 10. Publish to GitHub Packages

Make sure you're logged into GitHub Packages, then:

npm publish

Because your package.json already has:

"publishConfig": {
"registry": "https://npm.pkg.github.com"
}

npm will publish to GitHub Packages.

11. Update the notification service

After publishing 0.0.12, for example:

cd E:\jobberapp\server\2-notification-service

Then:

npm install @mayank30041995/jobber-shared@0.0.12

Verify:

npm list @mayank30041995/jobber-shared

You should see:

@mayank30041995/jobber-shared@0.0.12

Then:

npm run build

and:

npm run dev
Your normal workflow

After you've done this once, your everyday process is simply:

cd E:\jobberapp\9-jobber-shared

git status
npm run build
npm version patch --no-git-tag-version
npm run build
npm pack --dry-run
git add .
git commit -m "fix: your change"
git push origin main
npm publish

Then update the service:

cd E:\jobberapp\server\2-notification-service

npm install @mayank30041995/jobber-shared@NEW_VERSION
npm run build
npm run dev
One rule to remember

Every published npm package version must be unique.
