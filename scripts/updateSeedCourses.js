import fs from 'fs';

const seedPath = './src/db/seedData.json';
const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

const jsCourseId = 'PLu71SKxNbfoBuX3f4EOACle2y-tRC5Q37';
const gitCourseId = 'git-github-masterclass-q8EevlEpQ2A';

const filteredCourses = [
  // 1. Chai aur JavaScript
  seed.courses.find(c => c.id === jsCourseId),

  // 2. Git & GitHub Complete Masterclass (Single Long Video)
  {
    "id": gitCourseId,
    "title": "Complete Git and GitHub Course in Hindi",
    "description": "Complete hands-on Git and GitHub 3-hour masterclass by Chai aur Code. Learn version control, commits, branches, GitHub remotes, pull requests, merge conflicts, and open-source collaboration from scratch.",
    "thumbnailUrl": "https://i.ytimg.com/vi/q8EevlEpQ2A/hqdefault.jpg",
    "channelName": "Chai aur Code",
    "type": "youtube",
    "udemyUrl": ""
  }
];

// Keep all 51 JS lessons + 1 single Git Masterclass lesson
const jsLessons = seed.lessons.filter(l => l.courseId === jsCourseId);

const gitSingleLesson = {
  "id": "q8EevlEpQ2A",
  "courseId": gitCourseId,
  "index": 1,
  "title": "Complete git and Github course in Hindi",
  "description": "Full 3-hour masterclass covering Git installation, staging area, commits, branching, merging, GitHub remote repositories, Pull Requests, and resolving merge conflicts.",
  "duration": "03:12:45",
  "videoId": "q8EevlEpQ2A",
  "type": "youtube",
  "thumbnailUrl": "https://i.ytimg.com/vi/q8EevlEpQ2A/hqdefault.jpg",
  "chapters": [
    { "title": "Ch 1: Introduction to VCS & Git Architecture", "timestamp": 0, "formattedTime": "00:00" },
    { "title": "Ch 2: Installing Git & Global Configurations (`git config`)", "timestamp": 750, "formattedTime": "12:30" },
    { "title": "Ch 3: Working Directory, Staging Area & `git add`", "timestamp": 1695, "formattedTime": "28:15" },
    { "title": "Ch 4: Commits, Diffs & History (`git commit`, `git log`)", "timestamp": 3205, "formattedTime": "53:25" },
    { "title": "Ch 5: Git Branching & Merging (`git branch`, `git merge`)", "timestamp": 4925, "formattedTime": "01:22:05" },
    { "title": "Ch 6: Connecting to GitHub & Remotes (`git remote`, `git push`)", "timestamp": 7040, "formattedTime": "01:57:20" },
    { "title": "Ch 7: Pull Requests, Code Reviews & Open Source", "timestamp": 8840, "formattedTime": "02:27:20" },
    { "title": "Ch 8: Resolving Merge Conflicts & Rebase vs Merge", "timestamp": 10310, "formattedTime": "02:51:50" }
  ]
};

const newSeed = {
  courses: filteredCourses,
  lessons: [...jsLessons, gitSingleLesson]
};

fs.writeFileSync(seedPath, JSON.stringify(newSeed, null, 2));
console.log('Successfully updated seedData.json with 1 single Git masterclass video and chapters array!');
