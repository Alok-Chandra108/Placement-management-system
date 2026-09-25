import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '5s', target: 50 },  // Ramp up to 50 concurrent users
    { duration: '20s', target: 50 }, // Hold at 50 users for 20 seconds
    { duration: '5s', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should complete within 2 seconds
  },
};

export default function () {
  const url = 'http://13.201.132.122/api/v1/health';
  
  const params = {
    headers: {
      'Origin': 'http://13.201.132.122'
    },
  };

  // Hit the deep health check endpoint which queries the database
  const res = http.get(url, params);
  
  // We expect 200 OK
  check(res, {
    'is status 200': (r) => r.status === 200,
  });
  
  // Wait 1 second before this virtual user attacks again
  sleep(1);
}
