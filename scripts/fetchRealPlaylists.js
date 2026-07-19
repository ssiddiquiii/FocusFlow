import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to parse ISO 8601 duration
function parseISODuration(durationISO) {
  const match = durationISO.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';
  
  const hours = parseInt(match[1] || 0, 10);
  const minutes = parseInt(match[2] || 0, 10);
  const seconds = parseInt(match[3] || 0, 10);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Read API Key from .env
function getApiKey() {
  const envPath = path.resolve(__dirname, '../.env');
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env file not found.');
    process.exit(1);
  }
  
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const match = envContent.match(/YOUTUBE_API_KEY\s*=\s*(.*)/);
  if (!match || !match[1]) {
    console.error('Error: YOUTUBE_API_KEY not found in .env.');
    process.exit(1);
  }
  return match[1].trim();
}

const PLAYLISTS = [
  { id: 'PLu71SKxNbfoBuX3f4EOACle2y-tRC5Q37', type: 'youtube', title: 'Chai aur JavaScript' },
  { id: 'PLu71SKxNbfoDqgPchmvIsL4hTnJIrtige', type: 'youtube', title: 'Chai aur React' },
  { id: 'PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW', type: 'youtube', title: 'Chai aur Backend' }
];

async function fetchPlaylists() {
  const apiKey = getApiKey();
  const courses = [];
  const lessons = [];

  for (const pl of PLAYLISTS) {
    console.log(`Fetching playlist: ${pl.title}...`);
    try {
      // 1. Fetch Playlist Info
      const playlistUrl = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${pl.id}&key=${apiKey}`;
      const playlistRes = await fetch(playlistUrl);
      if (!playlistRes.ok) {
        throw new Error(`Failed to fetch playlist info for ${pl.title}`);
      }
      const playlistData = await playlistRes.json();
      const snippet = playlistData.items[0].snippet;

      courses.push({
        id: pl.id,
        title: pl.title,
        description: snippet.description || `Complete series on ${pl.title}.`,
        thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || '',
        channelName: snippet.channelTitle || 'Chai aur Code',
        type: 'youtube',
        udemyUrl: ''
      });

      // 2. Fetch Playlist Items (Pagination)
      let nextPageToken = '';
      let hasNextPage = true;
      let index = 1;
      let courseLessons = [];

      while (hasNextPage) {
        const itemsUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${pl.id}&key=${apiKey}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
        const itemsRes = await fetch(itemsUrl);
        if (!itemsRes.ok) {
          throw new Error('Failed to fetch playlist items.');
        }
        const itemsData = await itemsRes.json();
        
        if (itemsData.items) {
          itemsData.items.forEach(item => {
            courseLessons.push({
              id: item.contentDetails.videoId,
              courseId: pl.id,
              title: item.snippet.title,
              description: item.snippet.description || '',
              thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || '',
              duration: '0:00', // Fill later
              index: index++,
              type: 'youtube'
            });
          });
        }
        
        nextPageToken = itemsData.nextPageToken;
        hasNextPage = !!nextPageToken;
      }

      // 3. Batch fetch video durations
      const videoIds = courseLessons.map(l => l.id);
      const durationMap = {};

      for (let i = 0; i < videoIds.length; i += 50) {
        const batchIds = videoIds.slice(i, i + 50).join(',');
        const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${batchIds}&key=${apiKey}`;
        const videosRes = await fetch(videosUrl);
        if (videosRes.ok) {
          const videosData = await videosRes.json();
          if (videosData.items) {
            videosData.items.forEach(v => {
              durationMap[v.id] = parseISODuration(v.contentDetails.duration);
            });
          }
        }
      }

      // Map durations
      courseLessons = courseLessons.map(l => ({
        ...l,
        duration: durationMap[l.id] || '0:00'
      }));

      lessons.push(...courseLessons);
      console.log(`Successfully fetched ${courseLessons.length} lessons for ${pl.title}.`);
    } catch (err) {
      console.error(`Error fetching ${pl.title}:`, err.message);
    }
  }

  // Add the manual Udemy course metadata
  const udemyCourseId = 'udemy-agentic-ai';
  courses.push({
    id: udemyCourseId,
    title: 'Agentic AI Cohort',
    description: 'Hitesh Choudhary\'s cohort course on Agentic AI, LangChain, crewAI, and building custom LLM agents. (Track progress manually).',
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
  const outputPath = path.resolve(__dirname, '../src/db/seedData.json');
  fs.writeFileSync(outputPath, JSON.stringify(seedData, null, 2));
  console.log(`Real seed data successfully written to ${outputPath}`);
}

fetchPlaylists();
