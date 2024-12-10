import http from 'k6/http';
import { sleep, check } from 'k6';

// Test configuration
export const options = {
  stages: [
    { duration: '1s', target: 100 }, // Ramp up to 20 users
    { duration: '10s', target: 100 },  // Stay at 20 users for 1 minute
    { duration: '1s', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% of requests should fail
  },
};

const BASE_URL = 'https://kiplxlahalqyahstmmjg.supabase.co'; // Replace with your Supabase URL
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpcGx4bGFoYWxxeWFoc3RtbWpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkzOTExNTEsImV4cCI6MjA0NDk2NzE1MX0.pgTmWgtFGiB3zpx-pFDEgytawrGi85lFiz1tGpgDckk'; // Replace with your Supabase anon key
const STORAGE_URL = `${BASE_URL}/storage/v1/object/public/challenge-uploads`; // Replace with your Supabase storage URL

// Helper to generate random post IDs (adjust range based on your data)
function getRandomPostId() {
    const numbers = [22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 64, 66, 67, 72, 73, 75, 78, 79, 81, 83, 87, 88, 89, 90, 91, 92, 93];
    return numbers[Math.floor(Math.random() * numbers.length)];
}

export default function () {
  const headers = {
    'apikey': ANON_KEY,
    'Content-Type': 'application/json',
  };

  // Test main posts fetch
  const postsResponse = http.get(`${BASE_URL}/rest/v1/post?select=id,user_id,created_at,featured,body,media_id,challenge_id,media(file_path),likes(count),challenges:challenge_id(title)&order=created_at.desc&limit=10`, {
    headers: headers,
  });

  check(postsResponse, {
    'posts fetch status is 200': (r) => r.status === 200,
    'posts response has data': (r) => r.json().length > 0,
  });

  // Test fetching images from storage for posts with media
  const posts = postsResponse.json();

const mediaRequests = posts
.filter(post => post.media && post.media.file_path)
.map(post => {
  const isVideo = post.media.file_path.toLowerCase().endsWith('.mp4');
  return {
    method: 'GET',
    url: isVideo 
      ? `${BASE_URL}/storage/v1/render/video/public/challenge-uploads/${post.media.file_path}?width=100&height=100&quality=20` 
      : `${BASE_URL}/storage/v1/render/image/public/challenge-uploads/${post.media.file_path}?width=100&height=100&quality=20`,
      metadata: { isVideo, filePath: post.media.file_path }
    };
  }
);



  if (mediaRequests.length > 0) {
    const imageResponses = http.batch(mediaRequests);
    const postsWithMedia = posts.filter(post => post.media && post.media.file_path);
    
    imageResponses.forEach((response, index) => {
      check(response, {
        'transformed image fetch status is 200': (r) => r.status === 200,
        'transformed image content type is valid': (r) => 
          r.headers['Content-Type'] && 
          r.headers['Content-Type'].startsWith('image/'),
      });
      console.log(`Transformed image URL: ${postsWithMedia[index].media.file_path}`);
    });
  }

  // Test comment counts fetch
  const postIds = Array.from({length: 20}, () => getRandomPostId());
  const commentCountsResponse = http.post(
    `${BASE_URL}/rest/v1/rpc/get_comment_counts`,
    JSON.stringify({ post_ids: postIds }),
    { headers: headers }
  );

  check(commentCountsResponse, {
    'comment counts status is 200': (r) => r.status === 200,
  });

  // Test likes fetch for multiple random posts
  const likesResponse = http.get(
    `${BASE_URL}/rest/v1/likes?select=user_id&post_id=in.(${postIds.join(',')})`,
    { headers: headers }
  );

  check(likesResponse, {
    'likes fetch status is 200': (r) => r.status === 200,
  });

  sleep(1);
} 