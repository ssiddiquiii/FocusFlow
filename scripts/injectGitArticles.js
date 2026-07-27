import fs from 'fs';

const mapPath = './src/data/jsPracticeMap.json';
const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

const gitArticles = {
  "git_ch_1": {
    "conceptLabel": "Git Ch 1: Intro to VCS & Git Architecture",
    "summaryArticle": {
      "overview": "Git is a Distributed Version Control System (DVCS) designed to track file changes across developers. Unlike Centralized VCS (SVN) which relies on a single central server, Git gives every collaborator a full local copy of the complete commit history.",
      "codeExample": "# Check Git version installed on system\ngit --version\n\n# Initialize a new Git repository locally\ngit init",
      "gotchas": "Git is NOT GitHub! Git is the local CLI tool that records changes. GitHub is the cloud platform hosting Git repositories."
    },
    "readingMaterials": [
      {
        "title": "Chai aur Code: Chai aur Git Official Docs",
        "url": "https://docs.chaicode.com/youtube/chai-aur-git/introduction/",
        "platform": "Chai aur Code Docs",
        "estMinutes": "5 min read"
      },
      {
        "title": "Git SCM Book: Getting Started with Version Control",
        "url": "https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control",
        "platform": "Git Official Docs",
        "estMinutes": "8 min read"
      }
    ]
  },
  "git_ch_2": {
    "conceptLabel": "Git Ch 2: Installing Git & Global Config (`git config`)",
    "summaryArticle": {
      "overview": "Before making your first commit, Git requires identifying author name and email. Config settings exist at 3 levels: System, Global (user level), and Local (repository level). Local configs override Global configs.",
      "codeExample": "# Configure global author identity\ngit config --global user.name \"Your Name\"\ngit config --global user.email \"you@example.com\"\n\n# Set default branch name to main\ngit config --global init.defaultBranch main\n\n# View active configuration settings\ngit config --list",
      "gotchas": "Always configure `core.autocrlf` if team members use different Operating Systems (Windows vs Mac/Linux) to avoid phantom line ending diffs."
    },
    "readingMaterials": [
      {
        "title": "Chai aur Code: Git Terminology & Configuration",
        "url": "https://docs.chaicode.com/youtube/chai-aur-git/terminology/",
        "platform": "Chai aur Code Docs",
        "estMinutes": "6 min read"
      },
      {
        "title": "Git SCM: First-Time Git Setup Guide",
        "url": "https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup",
        "platform": "Git Official Docs",
        "estMinutes": "7 min read"
      }
    ]
  },
  "git_ch_3": {
    "conceptLabel": "Git Ch 3: Working Directory, Staging Area & `git add`",
    "summaryArticle": {
      "overview": "Git manages files across 3 main areas: Working Directory (edited files), Staging Area / Index (prepared files for next commit), and Local Repository (permanent commit history). `.gitignore` prevents secret keys or `node_modules` from being tracked.",
      "codeExample": "# Check status of modified and untracked files\ngit status\n\n# Add specific file to Staging Area\ngit add app.js\n\n# Add all modified files to Staging Area\ngit add .\n\n# Unstage a staged file without discarding edits\ngit restore --staged app.js",
      "gotchas": "`.gitignore` ONLY ignores untracked files. If a file was already committed, you must run `git rm --cached <file>` before `.gitignore` takes effect."
    },
    "readingMaterials": [
      {
        "title": "Chai aur Code: Behind the Scenes in Git Architecture",
        "url": "https://docs.chaicode.com/youtube/chai-aur-git/behind-the-scenes/",
        "platform": "Chai aur Code Docs",
        "estMinutes": "10 min read"
      },
      {
        "title": "Atlassian Git: Git Add & Staging Area Deep Dive",
        "url": "https://www.atlassian.com/git/tutorials/saving-changes",
        "platform": "Atlassian Git Guide",
        "estMinutes": "8 min read"
      }
    ]
  },
  "git_ch_4": {
    "conceptLabel": "Git Ch 4: Commits, Diffs & History (`git commit`, `git log`)",
    "summaryArticle": {
      "overview": "A commit represents a snapshot of your staged files at a specific moment in time. Every commit receives a unique 40-character SHA-1 checksum hash pointing to author details, parent commit, and tree object.",
      "codeExample": "# Create a commit with a descriptive message\ngit commit -m \"feat: implement user authentication modal\"\n\n# Amend the last commit message without creating a new commit\ngit commit --amend -m \"feat: correct auth modal typo\"\n\n# View formatted single-line commit history graph\ngit log --oneline --graph --decorate",
      "gotchas": "`git reset --hard HEAD~1` permanently deletes uncommitted working directory changes. Use `--soft` to keep changes staged safely!"
    },
    "readingMaterials": [
      {
        "title": "Chai aur Code: Managing Git History & Commits",
        "url": "https://docs.chaicode.com/youtube/chai-aur-git/managing-history/",
        "platform": "Chai aur Code Docs",
        "estMinutes": "9 min read"
      },
      {
        "title": "Git SCM: Viewing Commit History & Diffs",
        "url": "https://git-scm.com/book/en/v2/Git-Basics-Viewing-the-Commit-History",
        "platform": "Git Official Docs",
        "estMinutes": "7 min read"
      }
    ]
  },
  "git_ch_5": {
    "conceptLabel": "Git Ch 5: Git Branching & Merging (`git branch`, `git merge`)",
    "summaryArticle": {
      "overview": "Branches in Git are lightweight moveable pointers to commits. Branching allows developers to work on isolated features without breaking the main codebase. Merging combines changes back into target branch.",
      "codeExample": "# Create and switch to new branch in 1 line\ngit switch -c feature/payment-gateway\n\n# Switch back to main branch\ngit switch main\n\n# Merge feature branch into main\ngit merge feature/payment-gateway\n\n# Safely delete merged branch\ngit branch -d feature/payment-gateway",
      "gotchas": "Always switch to target branch (e.g. `main`) BEFORE running `git merge feature-branch`!"
    },
    "readingMaterials": [
      {
        "title": "Chai aur Code: Branches & Merging in Git",
        "url": "https://docs.chaicode.com/youtube/chai-aur-git/branches/",
        "platform": "Chai aur Code Docs",
        "estMinutes": "8 min read"
      },
      {
        "title": "Git SCM: Basic Branching & Merging Guide",
        "url": "https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging",
        "platform": "Git Official Docs",
        "estMinutes": "10 min read"
      }
    ]
  },
  "git_ch_6": {
    "conceptLabel": "Git Ch 6: Connecting to GitHub Remotes (`git remote`, `git push`)",
    "summaryArticle": {
      "overview": "A Remote is a shared version of your Git repository hosted on GitHub or cloud servers. `git push` uploads local commits to GitHub, while `git pull` fetches and merges remote updates.",
      "codeExample": "# Add remote repository origin URL\ngit remote add origin https://github.com/user/my-repo.git\n\n# Push and set default upstream tracking branch\ngit push -u origin main\n\n# Download remote updates and merge\ngit pull origin main",
      "gotchas": "`git pull` = `git fetch` + `git merge`. To inspect remote commits before merging, use `git fetch origin` first!"
    },
    "readingMaterials": [
      {
        "title": "Chai aur Code: Collaborate with GitHub & Remotes",
        "url": "https://docs.chaicode.com/youtube/chai-aur-git/github/",
        "platform": "Chai aur Code Docs",
        "estMinutes": "9 min read"
      },
      {
        "title": "GitHub Docs: Managing Remote Repositories",
        "url": "https://docs.github.com/en/get-started/getting-started-with-git/managing-remote-repositories",
        "platform": "GitHub Official Docs",
        "estMinutes": "6 min read"
      }
    ]
  },
  "git_ch_7": {
    "conceptLabel": "Git Ch 7: Pull Requests, Code Reviews & Open Source",
    "summaryArticle": {
      "overview": "In open-source software, contributors Fork a repository to create a personal remote copy, make feature commits on a topic branch, and submit a Pull Request (PR) for maintainer review and approval.",
      "codeExample": "# Add upstream original repo to sync fork\ngit remote add upstream https://github.com/original-author/repo.git\n\n# Fetch latest upstream commits\ngit fetch upstream\n\n# Merge upstream main into local main\ngit merge upstream/main",
      "gotchas": "Always create topic branches for Pull Requests (e.g. `fix/issue-42`) instead of pushing directly from your fork's `main` branch."
    },
    "readingMaterials": [
      {
        "title": "Chai aur Code: Open Source & Pull Requests",
        "url": "https://docs.chaicode.com/youtube/chai-aur-git/github/",
        "platform": "Chai aur Code Docs",
        "estMinutes": "10 min read"
      },
      {
        "title": "GitHub Docs: Creating & Managing Pull Requests",
        "url": "https://docs.github.com/en/pull-requests/collaborating-with-pull-requests",
        "platform": "GitHub Official Docs",
        "estMinutes": "8 min read"
      }
    ]
  },
  "git_ch_8": {
    "conceptLabel": "Git Ch 8: Resolving Merge Conflicts & Rebase vs Merge",
    "summaryArticle": {
      "overview": "Merge conflicts happen when Git cannot automatically reconcile edits on the exact same lines of code. Rebase rewrites commit history onto a new base commit for a linear project timeline.",
      "codeExample": "# Rebase current feature branch onto main\ngit rebase main\n\n# If conflict occurs during rebase:\n# 1. Edit files to resolve conflict markers\n# 2. Stage resolved file\ngit add app.js\n# 3. Continue rebase process\ngit rebase --continue",
      "gotchas": "GOLDEN RULE OF REBASING: Never rebase public shared branches that other collaborators are actively working on!"
    },
    "readingMaterials": [
      {
        "title": "Chai aur Code: Diff, Stash & Advanced Git Tools",
        "url": "https://docs.chaicode.com/youtube/chai-aur-git/diff-stash-tags/",
        "platform": "Chai aur Code Docs",
        "estMinutes": "10 min read"
      },
      {
        "title": "Git SCM: Rebasing & Resolving Merge Conflicts",
        "url": "https://git-scm.com/book/en/v2/Git-Branching-Rebasing",
        "platform": "Git Official Docs",
        "estMinutes": "12 min read"
      }
    ]
  }
};

Object.assign(map, gitArticles);
fs.writeFileSync(mapPath, JSON.stringify(map, null, 2));
console.log('Successfully injected Hitesh Chai aur Git reading materials into jsPracticeMap.json!');
