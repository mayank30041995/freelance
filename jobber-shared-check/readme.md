GitHub Packages page

Open your GitHub profile and go to Packages:

GitHub Packages

You'll find:

@mayank30041995/jobber-shared
└── 0.0.6
From your terminal

To check the latest version anytime:

npm view @mayank30041995/jobber-shared version

Because your .npmrc is already configured, you don't need:

--registry=https://npm.pkg.github.com/

To install it in another project:

npm install @mayank30041995/jobber-shared

To install a specific version:

npm install @mayank30041995/jobber-shared@0.0.6
Your normal workflow

Next time you release:

Change code
↓
package.json: 0.0.5 → 0.0.6
↓
git push origin main
↓
GitHub Actions
↓
Published automatically

Then in your other Jobber projects:

npm install @mayank30041995/jobber-shared@0.0.6

Important: keep this in the consuming project's .npmrc:

@mayank30041995:registry=https://npm.pkg.github.com/
//npm.pkg.github.com/:\_authToken=YOUR_TOKEN

That way private/scoped packages come from GitHub Packages, while normal packages such as mongoose, express, and @elastic/elasticsearch continue coming from npmjs.org.

onfirm the package details

Run:

npm view @mayank30041995/jobber-shared versions --registry=https://npm.pkg.github.com/

npm view @mayank30041995/jobber-shared@0.0.6 --registry=https://npm.pkg.github.com/

You should see the package metadata.

You can also test installing it:

npm install @mayank30041995/jobber-shared@0.0.6 --registry=https://npm.pkg.github.com/

npm pack .\build

npm run build
