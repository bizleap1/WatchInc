const https = require('https');
const fs = require('fs');
const path = require('path');

const imagesToDownload = [
  {
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85',
    dest: 'public/images/hero/model-editorial-vogue.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1000&q=85',
    dest: 'public/images/hero/model-watch-editorial.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=85',
    dest: 'public/images/hero/model-aesthetic-chic.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1000&q=85',
    dest: 'public/images/hero/model-dramatic-portrait.jpg'
  }
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: status ${res.statusCode}`));
      }
      const fileStream = fs.createWriteStream(dest);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve(dest);
      });
      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

async function run() {
  for (const item of imagesToDownload) {
    try {
      console.log(`Downloading ${item.url}...`);
      await downloadFile(item.url, item.dest);
      console.log(`✓ Saved to ${item.dest}`);
    } catch (err) {
      console.error(`Failed ${item.dest}:`, err.message);
    }
  }
  console.log('All downloads completed!');
}

run();
