import fs from 'fs';

const path = './src/data/jsTopicPractice.json';
const topics = JSON.parse(fs.readFileSync(path, 'utf8'));

// Check if Git categories already present
const gitExisting = topics.some(t => t.id.startsWith('cat-git'));

if (!gitExisting) {
  const gitCategories = [
    {
      "id": "cat-git-1-intro",
      "topic": "Git Ch 1: Intro to VCS & Git Architecture",
      "icon": "🐙",
      "description": "Understanding Version Control Systems, distributed architecture, and Git vs GitHub.",
      "questions": [
        {
          "id": "git_q1_1",
          "title": "Centralized (CVCS) vs Distributed (DVCS)",
          "difficulty": "easy",
          "question": "What is the key structural difference between SVN (Centralized) and Git (Distributed)?",
          "solution": "In Centralized VCS (SVN), developers only have a working copy and rely on a central server for history. In Distributed VCS (Git), every developer has a full local clone of the entire repository and history.",
          "link": "https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control"
        },
        {
          "id": "git_q2_2",
          "title": "Why Git is Lightning Fast",
          "difficulty": "medium",
          "question": "Why are operations like `git log`, `git diff`, and `git commit` so fast in Git compared to legacy tools?",
          "solution": "Nearly all Git operations are local! Git doesn't make network requests to inspect commit history or diffs because the entire DAG history is stored locally in `.git` directory.",
          "link": "https://git-scm.com/doc"
        },
        {
          "id": "git_q3_3",
          "title": "Git vs GitHub Distinction",
          "difficulty": "easy",
          "question": "Explain the difference between Git and GitHub to a non-technical manager.",
          "solution": "Git is the local command-line tool that tracks code changes. GitHub is a cloud-hosted web platform that stores Git repositories online for team collaboration and code reviews.",
          "link": "https://docs.github.com/en/get-started/onboarding/getting-started-with-github"
        },
        {
          "id": "git_q4_4",
          "title": "Git Object Storage Mechanism",
          "difficulty": "hard",
          "question": "What are the 3 main types of internal Git objects stored inside `.git/objects`?",
          "solution": "1. **Blobs:** Stores raw file content.\n2. **Trees:** Stores directory structures and filenames pointing to Blobs/Trees.\n3. **Commits:** Stores Tree pointer, author, timestamp, parent commit hash, and message.",
          "link": "https://git-scm.com/book/en/v2/Git-Internals-Git-Objects"
        },
        {
          "id": "git_q5_5",
          "title": "SHA-1 Hash Integrity Guarantee",
          "difficulty": "medium",
          "question": "How does Git ensure code history cannot be secretly tampered with?",
          "solution": "Git uses SHA-1 / SHA-256 cryptographic hashing to generate 40-character checksums based on exact file contents and parent commit hashes. Altering even 1 byte changes the hash instantly.",
          "link": "https://git-scm.com/book/en/v2/Git-Internals-Git-Objects"
        }
      ]
    },
    {
      "id": "cat-git-2-config",
      "topic": "Git Ch 2: Installation & Global Config (`git config`)",
      "icon": "⚙️",
      "description": "Setting up git config global user.name, user.email, defaultBranch, and aliases.",
      "questions": [
        {
          "id": "git_q6_1",
          "title": "Global User Config Setup",
          "difficulty": "easy",
          "question": "Write the 2 terminal commands to configure your global Git username and email.",
          "solution": "```bash\ngit config --global user.name \"Sameed Siddiqui\"\ngit config --global user.email \"sameed@example.com\"\n```",
          "link": "https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup"
        },
        {
          "id": "git_q7_2",
          "title": "3 Configuration Levels in Git",
          "difficulty": "medium",
          "question": "Order the 3 Git config levels (`--system`, `--global`, `--local`) by precedence (which overrides which)?",
          "solution": "1. `--local` (stored in `.git/config` — HIGHEST precedence, overrides global)\n2. `--global` (stored in `~/.gitconfig` — user level)\n3. `--system` (stored in `/etc/gitconfig` — system-wide, LOWEST precedence)",
          "link": "https://git-scm.com/docs/git-config"
        },
        {
          "id": "git_q8_3",
          "title": "Set Default Branch Name to `main`",
          "difficulty": "easy",
          "question": "Write the command to make new `git init` repositories default to `main` instead of `master`.",
          "solution": "```bash\ngit config --global init.defaultBranch main\n```",
          "link": "https://git-scm.com/docs/git-config"
        },
        {
          "id": "git_q9_4",
          "title": "Create Custom Git Alias",
          "difficulty": "medium",
          "question": "Write a command to create a custom alias `git st` for `git status`.",
          "solution": "```bash\ngit config --global alias.st status\n```",
          "link": "https://git-scm.com/book/en/v2/Git-Basics-Git-Aliases"
        },
        {
          "id": "git_q10_5",
          "title": "Line Ending Normalization (`autocrlf`)",
          "difficulty": "hard",
          "question": "Why is `core.autocrlf` important when collaborating across Windows (CRLF) and Mac/Linux (LF)?",
          "solution": "Windows uses `\\r\\n` while Unix uses `\\n`. `core.autocrlf true` (on Windows) converts CRLF to LF on commit and converts back to CRLF on checkout, preventing phantom diffs on every line.",
          "link": "https://git-scm.com/book/en/v2/Customizing-Git-Git-Configuration"
        }
      ]
    },
    {
      "id": "cat-git-3-staging",
      "topic": "Git Ch 3: Working Directory, Staging Area & `git add`",
      "icon": "📦",
      "description": "Understanding Git 3 trees architecture, `.gitignore` rules, and staging files.",
      "questions": [
        {
          "id": "git_q11_1",
          "title": "The 3 States of Git",
          "difficulty": "easy",
          "question": "Name the 3 states that files reside in within a Git repository.",
          "solution": "1. **Modified (Working Directory):** File changed on disk but not staged.\n2. **Staged (Index / Staging Area):** Marked in current form to go into next commit.\n3. **Committed (Repository):** Safely stored in local Git database.",
          "link": "https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F"
        },
        {
          "id": "git_q12_2",
          "title": "Unstage a Staged File (`git restore`)",
          "difficulty": "easy",
          "question": "Write the command to remove `app.js` from the Staging Area back to Working Directory without losing edits.",
          "solution": "```bash\ngit restore --staged app.js\n# Or legacy: git reset HEAD app.js\n```",
          "link": "https://git-scm.com/docs/git-restore"
        },
        {
          "id": "git_q13_3",
          "title": ".gitignore Pattern Rules",
          "difficulty": "medium",
          "question": "How do you ignore `node_modules/` folder and all `.env` files except `.env.example` in `.gitignore`?",
          "solution": "```text\nnode_modules/\n.env*\n!.env.example\n```",
          "link": "https://git-scm.com/docs/gitignore"
        },
        {
          "id": "git_q14_4",
          "title": "Ignore Already Tracked Files Trap",
          "difficulty": "hard",
          "question": "If file `.env` was already committed before adding to `.gitignore`, why does Git still track it? How do you fix it?",
          "solution": "`.gitignore` only ignores UNTRACKED files. If already committed, remove it from index first: `git rm --cached .env`, then commit.",
          "link": "https://git-scm.com/docs/git-rm"
        },
        {
          "id": "git_q15_5",
          "title": "Partial Staging (`git add -p`)",
          "difficulty": "hard",
          "question": "How do you stage ONLY specific chunks/hunks of a file instead of the entire file?",
          "solution": "Use interactive patch mode: `git add -p filename.js`. Git prompts you to stage or skip each individual diff hunk.",
          "link": "https://git-scm.com/docs/git-add"
        }
      ]
    },
    {
      "id": "cat-git-4-commits",
      "topic": "Git Ch 4: Commits, Diffs & History (`git commit`, `git log`)",
      "icon": "📝",
      "description": "Writing clean commits, git log formatting, git diff, and amending commits.",
      "questions": [
        {
          "id": "git_q16_1",
          "title": "Amend Last Commit Message",
          "difficulty": "easy",
          "question": "Write the command to fix a typo in your last commit message without creating a new commit.",
          "solution": "```bash\ngit commit --amend -m \"fixed correct commit message\"\n```",
          "link": "https://git-scm.com/book/en/v2/Git-Basics-Undoing-Things"
        },
        {
          "id": "git_q17_2",
          "title": "Git Diff Working vs Staged",
          "difficulty": "easy",
          "question": "What is the difference between `git diff` and `git diff --staged`?",
          "solution": "`git diff`: Shows changes in Working Directory vs Staging Area.\n`git diff --staged`: Shows changes in Staging Area vs Last Commit (HEAD).",
          "link": "https://git-scm.com/docs/git-diff"
        },
        {
          "id": "git_q18_3",
          "title": "Compact One-Line Git Log",
          "difficulty": "medium",
          "question": "Write a command to view clean, 1-line commit graph history.",
          "solution": "```bash\ngit log --oneline --graph --decorate\n```",
          "link": "https://git-scm.com/book/en/v2/Git-Basics-Viewing-the-Commit-History"
        },
        {
          "id": "git_q19_4",
          "title": "Undo Last Commit Keeping Changes Staged",
          "difficulty": "hard",
          "question": "What does `git reset --soft HEAD~1` do vs `git reset --hard HEAD~1`?",
          "solution": "`--soft HEAD~1`: Undoes last commit, keeping all changed files in Staging Area.\n`--hard HEAD~1`: PERMANENTLY DESTROYS last commit and all uncommitted working directory changes!",
          "link": "https://git-scm.com/book/en/v2/Git-Tools-Reset-Demystified"
        },
        {
          "id": "git_q20_5",
          "title": "Git Checkout Commit Detached HEAD",
          "difficulty": "hard",
          "question": "What happens when you run `git checkout <commit-hash>`? What is Detached HEAD state?",
          "solution": "Detached HEAD means HEAD points directly to a specific commit hash rather than a named branch. Any new commits made in this state are orphan and will be lost unless saved to a new branch.",
          "link": "https://git-scm.com/docs/git-checkout"
        }
      ]
    },
    {
      "id": "cat-git-5-branching",
      "topic": "Git Ch 5: Branching & Merging (`git branch`, `git merge`)",
      "icon": "🌿",
      "description": "Creating branches, fast-forward vs 3-way merge, switching branches, and branch cleanup.",
      "questions": [
        {
          "id": "git_q21_1",
          "title": "Create & Switch Branch 1-Liner",
          "difficulty": "easy",
          "question": "Write the modern 1-liner to create and switch to a new branch named `feature/auth`.",
          "solution": "```bash\ngit switch -c feature/auth\n# Or legacy: git checkout -b feature/auth\n```",
          "link": "https://git-scm.com/docs/git-switch"
        },
        {
          "id": "git_q22_2",
          "title": "Fast-Forward Merge vs 3-Way Merge",
          "difficulty": "medium",
          "question": "When does Git perform a Fast-Forward merge instead of creating a Merge Commit?",
          "solution": "Fast-Forward occurs when the target branch has no new commits since feature branch was created. Git simply moves target branch pointer forward. If target branch has new commits, Git creates a 3-Way Merge Commit.",
          "link": "https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging"
        },
        {
          "id": "git_q23_3",
          "title": "Delete Merged & Unmerged Branches",
          "difficulty": "easy",
          "question": "What is the difference between `git branch -d feature` and `git branch -D feature`?",
          "solution": "`git branch -d`: Safely deletes branch ONLY if fully merged into upstream.\n`git branch -D`: Force deletes branch even if it contains unmerged commits.",
          "link": "https://git-scm.com/docs/git-branch"
        },
        {
          "id": "git_q24_4",
          "title": "Force Create Merge Commit (`--no-ff`)",
          "difficulty": "medium",
          "question": "Why do production teams use `git merge --no-ff feature` even when fast-forward is possible?",
          "solution": "`--no-ff` forces Git to create a dedicated merge commit, preserving explicit historical record that a feature branch existed and was integrated.",
          "link": "https://git-scm.com/docs/git-merge"
        },
        {
          "id": "git_q25_5",
          "title": "Git Stash Temporarily Saving Uncommitted Work",
          "difficulty": "hard",
          "question": "You are mid-feature when a hotfix arrives. How do you save uncommitted work to switch branches without committing incomplete code?",
          "solution": "1. `git stash` (saves uncommitted changes to stash stack)\n2. `git switch hotfix` (fix bug)\n3. `git switch feature` \n4. `git stash pop` (restores stashed changes)",
          "link": "https://git-scm.com/book/en/v2/Git-Tools-Stashing-and-Cleaning"
        }
      ]
    },
    {
      "id": "cat-git-6-remotes",
      "topic": "Git Ch 6: GitHub Remotes (`git remote`, `git push`, `git pull`)",
      "icon": "☁️",
      "description": "Connecting local repo to GitHub, tracking branches, push, fetch vs pull.",
      "questions": [
        {
          "id": "git_q26_1",
          "title": "Add Remote Origin URL",
          "difficulty": "easy",
          "question": "Write command to add remote GitHub repository URL to your local repo as `origin`.",
          "solution": "```bash\ngit remote add origin https://github.com/user/repo.git\n```",
          "link": "https://docs.github.com/en/get-started/getting-started-with-git/managing-remote-repositories"
        },
        {
          "id": "git_q27_2",
          "title": "Push & Set Upstream (`-u` / `--set-upstream`)",
          "difficulty": "easy",
          "question": "Why run `git push -u origin main` on first push instead of just `git push`?",
          "solution": "`-u` sets upstream tracking link between local `main` and `origin/main`. Future pushes and pulls can simply run `git push` or `git pull` without specifying remote and branch.",
          "link": "https://git-scm.com/docs/git-push"
        },
        {
          "id": "git_q28_3",
          "title": "Git Fetch vs Git Pull Difference",
          "difficulty": "medium",
          "question": "Explain: `git pull = git fetch + ???`",
          "solution": "`git pull` is shorthand for `git fetch` (download remote commits to `origin/main`) PLUS `git merge` (merge `origin/main` into local `main`).",
          "link": "https://git-scm.com/docs/git-pull"
        },
        {
          "id": "git_q29_4",
          "title": "Force Push Safeguard (`--force-with-lease`)",
          "difficulty": "hard",
          "question": "Why is `git push --force-with-lease` safer than `git push --force` (`-f`)?",
          "solution": "`--force` overwrites remote branch blindly, destroying teammate commits. `--force-with-lease` checks if remote branch has new teammate commits first; if so, it refuses to overwrite.",
          "link": "https://git-scm.com/docs/git-push#Documentation/git-push.txt---force-with-lease"
        },
        {
          "id": "git_q30_5",
          "title": "Git Clone vs Git Init",
          "difficulty": "easy",
          "question": "When do you use `git init` vs `git clone`?",
          "solution": "`git init`: Initializes a brand new empty Git repository in a local folder.\n`git clone`: Copies an existing remote GitHub repository and its full commit history to local machine.",
          "link": "https://git-scm.com/docs/git-clone"
        }
      ]
    },
    {
      "id": "cat-git-7-prs-open-source",
      "topic": "Git Ch 7: Pull Requests & Open Source Collaboration",
      "icon": "🤝",
      "description": "Forking, feature branches, submitting Pull Requests (PRs), and code review workflows.",
      "questions": [
        {
          "id": "git_q31_1",
          "title": "Forking Workflow in Open Source",
          "difficulty": "easy",
          "question": "Why do open-source projects require contributors to Fork the repository first?",
          "solution": "Contributors do not have write access to the original project. Forking creates a personal copy under contributor's GitHub account where they can push feature branches and open Pull Requests.",
          "link": "https://docs.github.com/en/get-started/quickstart/fork-a-repo"
        },
        {
          "id": "git_q32_2",
          "title": "Syncing Fork with Upstream Original",
          "difficulty": "medium",
          "question": "Write commands to configure original repository as `upstream` and pull latest changes into your fork.",
          "solution": "```bash\ngit remote add upstream https://github.com/original-author/repo.git\ngit fetch upstream\ngit merge upstream/main\n```",
          "link": "https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/syncing-a-fork"
        },
        {
          "id": "git_q33_3",
          "title": "Draft Pull Request Purpose",
          "difficulty": "easy",
          "question": "What is a Draft Pull Request on GitHub?",
          "solution": "A Draft PR indicates work-in-progress. It allows discussion and CI testing while preventing maintainers from accidentally merging it before completion.",
          "link": "https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests#draft-pull-requests"
        },
        {
          "id": "git_q34_4",
          "title": "Squash and Merge Workflow",
          "difficulty": "hard",
          "question": "What happens when maintainers choose 'Squash and Merge' on a Pull Request with 15 commits?",
          "solution": "All 15 intermediate feature commits are squashed into a single clean commit on the target `main` branch, keeping `main` history concise and readable.",
          "link": "https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/about-merge-methods-on-github"
        },
        {
          "id": "git_q35_5",
          "title": "Closing Issues via Commit Messages",
          "difficulty": "medium",
          "question": "Write a commit message that automatically closes GitHub Issue #42 when merged into default branch.",
          "solution": "`git commit -m \"fix: resolve user login validation error (Closes #42)\"` (Keywords: `Closes #42`, `Fixes #42`, `Resolves #42`).",
          "link": "https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue"
        }
      ]
    },
    {
      "id": "cat-git-8-conflicts-rebase",
      "topic": "Git Ch 8: Merge Conflicts & Rebase vs Merge",
      "icon": "⚔️",
      "description": "Conflict markers, VS Code resolution, git rebase vs merge, cherry-pick.",
      "questions": [
        {
          "id": "git_q36_1",
          "title": "Git Conflict Markers Breakdown",
          "difficulty": "easy",
          "question": "Explain the 3 markers Git inserts into a file during a merge conflict:\n`<<<<<<< HEAD`, `=======`, `>>>>>>> feature`.",
          "solution": "`<<<<<<< HEAD`: Starts current branch changes.\n`=======`: Divider between conflicting changes.\n`>>>>>>> feature`: End of incoming branch changes.",
          "link": "https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging#_basic_merge_conflicts"
        },
        {
          "id": "git_q37_2",
          "title": "Steps to Resolve a Merge Conflict",
          "difficulty": "medium",
          "question": "List the 4 exact terminal steps to finish resolving a merge conflict.",
          "solution": "1. Edit conflict markers in file.\n2. `git add resolved-file.js`\n3. `git commit -m \"resolved merge conflict\"` \n(Or `git merge --continue`)",
          "link": "https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging"
        },
        {
          "id": "git_q38_3",
          "title": "Git Rebase vs Git Merge Tradeoff",
          "difficulty": "hard",
          "question": "Compare `git rebase main` vs `git merge main`. What is the Golden Rule of Rebasing?",
          "solution": "Merge preserves exact historical timeline with a 3-way merge commit.\nRebase rewrites commit history onto new base for a linear history.\n**Golden Rule:** NEVER rebase public shared branches! Rebase rewrites hashes, breaking collaborators' repos.",
          "link": "https://git-scm.com/book/en/v2/Git-Branching-Rebasing"
        },
        {
          "id": "git_q39_4",
          "title": "Git Cherry-Pick Specific Commit",
          "difficulty": "medium",
          "question": "How do you apply a single bugfix commit `a1b2c3d` from `feature` branch directly into `main` without merging entire branch?",
          "solution": "Switch to `main` branch, then run: `git cherry-pick a1b2c3d`.",
          "link": "https://git-scm.com/docs/git-cherry-pick"
        },
        {
          "id": "git_q40_5",
          "title": "Git Reflog Emergency Recovery",
          "difficulty": "hard",
          "question": "You accidentally ran `git reset --hard HEAD~5` and destroyed 5 commits. How do you recover them using `git reflog`?",
          "solution": "1. Run `git reflog` (displays history of ALL HEAD movements including deleted commits).\n2. Locate commit hash before reset (e.g. `HEAD@{1}` or `c4d5e6f`).\n3. Run `git reset --hard c4d5e6f` to restore repo instantly!",
          "link": "https://git-scm.com/docs/git-reflog"
        }
      ]
    }
  ];

  topics.push(...gitCategories);
  fs.writeFileSync(path, JSON.stringify(topics, null, 2));
  console.log('Successfully appended 40 Git & GitHub practice questions across 8 categories!');
} else {
  console.log('Git categories already present in jsTopicPractice.json.');
}
