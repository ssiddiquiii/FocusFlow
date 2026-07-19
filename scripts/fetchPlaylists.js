import ytpl from '@distube/ytpl';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PLAYLISTS = [
  { id: 'PLu71SKxNbfoBuX3f4EOACle2y-tRC5Q37', type: 'youtube', customTitle: 'Chai aur JavaScript' },
  { id: 'PLu71SKxNbfoDqgPchmvIsL4hTnJIrtige', type: 'youtube', customTitle: 'Chai aur React' },
  { id: 'PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW', type: 'youtube', customTitle: 'Chai aur Backend' }
];

async function fetchAllPlaylists() {
  const courses = [];
  const lessons = [];

  for (const pl of PLAYLISTS) {
    console.log(`Fetching playlist: ${pl.customTitle} (${pl.id})...`);
    try {
      const playlist = await ytpl(pl.id, { limit: Infinity });
      
      courses.push({
        id: pl.id,
        title: pl.customTitle,
        description: playlist.description || `Complete series on ${pl.customTitle}.`,
        thumbnailUrl: playlist.bestThumbnail?.url || playlist.items[0]?.bestThumbnail?.url || '',
        channelName: playlist.author?.name || 'Chai aur Code',
        type: 'youtube',
        udemyUrl: ''
      });

      playlist.items.forEach((item, index) => {
        lessons.push({
          id: item.id,
          courseId: pl.id,
          title: item.title,
          description: `Lesson ${index + 1} of ${pl.customTitle}.`,
          thumbnailUrl: item.bestThumbnail?.url || '',
          duration: item.duration || '0:00',
          index: index + 1,
          type: 'youtube'
        });
      });
      console.log(`Successfully fetched ${playlist.items.length} lessons.`);
    } catch (error) {
      console.error(`Failed to fetch playlist ${pl.id}:`, error.message);
    }
  }

  // Add the manual Udemy course metadata
  const udemyCourseId = 'udemy-agentic-ai';
  courses.push({
    id: udemyCourseId,
    title: 'Agentic AI Cohort',
    description: 'Hitesh Choudhary\'s cohort course on Agentic AI, LangChain, crewAI, and building custom LLM agents.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400',
    channelName: 'Hitesh Choudhary',
    type: 'udemy',
    udemyUrl: 'https://www.udemy.com/course/agentic-ai-hitesh-choudhary/'
  });

  const udemyLectures = [
    'Introduction to Agentic AI and LLM Architectures',
    'Understanding LLM Reasonings: ReAct, Chain of Thought, and Planning',
    'Building Your First Custom AI Agent from Scratch in Python',
    'Deep Dive into LangChain, AutoGen, and crewAI Frameworks',
    'Advanced Agent Evaluation, Testing, and Production Deployment'
  ];

  udemyLectures.forEach((title, index) => {
    lessons.push({
      id: `${udemyCourseId}-lesson-${index + 1}`,
      courseId: udemyCourseId,
      title: title,
      description: `Manual lecture ${index + 1} of the Agentic AI Cohort. Track your progress manually.`,
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400',
      duration: '45:00',
      index: index + 1,
      type: 'udemy'
    });
  });

  const seedData = { courses, lessons };

  const dbDir = path.resolve(__dirname, '../src/db');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const outputPath = path.join(dbDir, 'seedData.json');
  fs.writeFileSync(outputPath, JSON.stringify(seedData, null, 2));
  console.log(`Seed data successfully written to ${outputPath}`);
}

fetchAllPlaylists();
