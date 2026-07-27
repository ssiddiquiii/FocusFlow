import fs from 'fs';

const seedPath = './src/db/seedData.json';
const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

// Filter out React, Backend, and Network courses
const jsCourseId = 'PLu71SKxNbfoBuX3f4EOACle2y-tRC5Q37';
const gitCourseId = 'git-github-masterclass-q8EevlEpQ2A';

const filteredCourses = [
  // 1. Chai aur JavaScript
  seed.courses.find(c => c.id === jsCourseId),

  // 2. Git & GitHub Complete Masterclass
  {
    "id": gitCourseId,
    "title": "Complete Git and GitHub Course in Hindi",
    "description": "Complete hands-on Git and GitHub masterclass by Chai aur Code. Learn version control, commits, branches, GitHub remotes, pull requests, merge conflicts, and open-source collaboration from scratch.",
    "thumbnailUrl": "https://i.ytimg.com/vi/q8EevlEpQ2A/hqdefault.jpg",
    "channelName": "Chai aur Code",
    "type": "youtube",
    "udemyUrl": ""
  }
];

// Filter lessons: keep all JS lessons + add Git virtual chapter lessons
const jsLessons = seed.lessons.filter(l => l.courseId === jsCourseId);

const gitChapters = [
  {
    "id": "git_ch_1",
    "courseId": gitCourseId,
    "index": 1,
    "title": "Ch 1: Introduction to Version Control Systems & Git",
    "description": "Understanding what Version Control System (VCS) is, why developers need Git, local vs centralized vs distributed VCS.",
    "duration": "12:30",
    "videoId": "q8EevlEpQ2A",
    "type": "youtube",
    "thumbnailUrl": "https://i.ytimg.com/vi/q8EevlEpQ2A/hqdefault.jpg",
    "startTimestamp": 0
  },
  {
    "id": "git_ch_2",
    "courseId": gitCourseId,
    "index": 2,
    "title": "Ch 2: Installing Git & Global Configurations (`git config`)",
    "description": "Installing Git on Windows/Mac/Linux, setting up global user.name, user.email, default branch name, and editor configurations.",
    "duration": "15:45",
    "videoId": "q8EevlEpQ2A",
    "type": "youtube",
    "thumbnailUrl": "https://i.ytimg.com/vi/q8EevlEpQ2A/hqdefault.jpg",
    "startTimestamp": 750
  },
  {
    "id": "git_ch_3",
    "courseId": gitCourseId,
    "index": 3,
    "title": "Ch 3: Working Directory, Staging Area & Commits (`git init`, `git add`)",
    "description": "Deep dive into 3 states of Git: Working Directory, Staging Area (Index), and Local Repository. Using git status and git add.",
    "duration": "25:10",
    "videoId": "q8EevlEpQ2A",
    "type": "youtube",
    "thumbnailUrl": "https://i.ytimg.com/vi/q8EevlEpQ2A/hqdefault.jpg",
    "startTimestamp": 1695
  },
  {
    "id": "git_ch_4",
    "courseId": gitCourseId,
    "index": 4,
    "title": "Ch 4: Making Commits & Viewing History (`git commit`, `git log`)",
    "description": "Writing clear commit messages, viewing commit history logs, git diff inspection, and restoring modified files.",
    "duration": "28:40",
    "videoId": "q8EevlEpQ2A",
    "type": "youtube",
    "thumbnailUrl": "https://i.ytimg.com/vi/q8EevlEpQ2A/hqdefault.jpg",
    "startTimestamp": 3205
  },
  {
    "id": "git_ch_5",
    "courseId": gitCourseId,
    "index": 5,
    "title": "Ch 5: Git Branching & Merging (`git branch`, `git checkout`, `git merge`)",
    "description": "Creating feature branches, switching branches with checkout/switch, fast-forward merges, and branch deletion.",
    "duration": "35:15",
    "videoId": "q8EevlEpQ2A",
    "type": "youtube",
    "thumbnailUrl": "https://i.ytimg.com/vi/q8EevlEpQ2A/hqdefault.jpg",
    "startTimestamp": 4925
  },
  {
    "id": "git_ch_6",
    "courseId": gitCourseId,
    "index": 6,
    "title": "Ch 6: Connecting to GitHub & Remote Operations (`git remote`, `git push`, `git pull`)",
    "description": "Setting up GitHub SSH/HTTPS keys, adding remote origin, pushing branches, and pulling updates from GitHub.",
    "duration": "30:00",
    "videoId": "q8EevlEpQ2A",
    "type": "youtube",
    "thumbnailUrl": "https://i.ytimg.com/vi/q8EevlEpQ2A/hqdefault.jpg",
    "startTimestamp": 7040
  },
  {
    "id": "git_ch_7",
    "courseId": gitCourseId,
    "index": 7,
    "title": "Ch 7: Pull Requests, Code Reviews & Open Source Contributions",
    "description": "Forking repositories, creating feature branches, submitting Pull Requests (PRs), code reviews, and open-source etiquette.",
    "duration": "24:30",
    "videoId": "q8EevlEpQ2A",
    "type": "youtube",
    "thumbnailUrl": "https://i.ytimg.com/vi/q8EevlEpQ2A/hqdefault.jpg",
    "startTimestamp": 8840
  },
  {
    "id": "git_ch_8",
    "courseId": gitCourseId,
    "index": 8,
    "title": "Ch 8: Resolving Merge Conflicts & Advanced Rebase vs Merge",
    "description": "Understanding why merge conflicts occur, step-by-step conflict resolution in VS Code, git rebase mechanics, and best practices.",
    "duration": "26:50",
    "videoId": "q8EevlEpQ2A",
    "type": "youtube",
    "thumbnailUrl": "https://i.ytimg.com/vi/q8EevlEpQ2A/hqdefault.jpg",
    "startTimestamp": 10310
  }
];

const newSeed = {
  courses: filteredCourses,
  lessons: [...jsLessons, ...gitChapters]
};

fs.writeFileSync(seedPath, JSON.stringify(newSeed, null, 2));
console.log('Successfully updated seedData.json with JS + Git masterclass and removed React, Backend & Network catalogs!');
