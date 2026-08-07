const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function test() {
  const req = {
    "boy_birth_details": {
      "name": "Boy",
      "date": "1995-01-01",
      "time": "12:00:00",
      "place": "Delhi",
      "latitude": 28.6139,
      "longitude": 77.209,
      "timezone": 5.5
    },
    "girl_birth_details": {
      "name": "Girl",
      "date": "1997-05-15",
      "time": "14:30:00",
      "place": "Mumbai",
      "latitude": 19.076,
      "longitude": 72.8777,
      "timezone": 5.5
    }
  };
  const res = await fetch('https://jagannatha-hora-359167915530.europe-west1.run.app/marriage-match', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req)
  });
  const data = await res.json();
  console.log(JSON.stringify(data.north_indian.eight_koota_porutham, null, 2));
}

test();
