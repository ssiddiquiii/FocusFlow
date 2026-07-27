import fs from 'fs';

const mapPath = './src/data/jsPracticeMap.json';
const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

if (map['git_ch_1']) {
  map['q8EevlEpQ2A'] = {
    "conceptLabel": "Complete Git & GitHub Masterclass Guide",
    "summaryArticle": {
      "overview": "Complete hands-on 3-hour Git and GitHub masterclass guide by Hitesh Choudhary (Chai aur Code). Learn Version Control Systems, Git architecture, working directory, staging area, commits, branching, merging, remotes, pull requests, and resolving merge conflicts.",
      "codeExample": "# Initialize repository\ngit init\n\n# Configure identity\ngit config --global user.name \"Your Name\"\ngit config --global user.email \"you@example.com\"\n\n# Stage & Commit\ngit add .\ngit commit -m \"feat: initial commit\"\n\n# Branch & Remote\ngit switch -c feature/login\ngit remote add origin https://github.com/user/repo.git\ngit push -u origin main",
      "gotchas": "Git tracks changes locally. GitHub is the remote cloud server. Never rebase public shared branches that collaborators are actively working on!"
    },
    "readingMaterials": [
      {
        "title": "Chai aur Code: Official Chai aur Git Docs",
        "url": "https://docs.chaicode.com/youtube/chai-aur-git/welcome/",
        "platform": "Chai aur Code Docs",
        "estMinutes": "15 min read"
      },
      {
        "title": "Git SCM: Official Git Documentation & Pro Book",
        "url": "https://git-scm.com/doc",
        "platform": "Git Official Docs",
        "estMinutes": "20 min read"
      }
    ]
  };

  fs.writeFileSync(mapPath, JSON.stringify(map, null, 2));
  console.log('Successfully mapped q8EevlEpQ2A in jsPracticeMap.json!');
}
