const fs = require('fs');
const path = require('path');

// Create placeholder image URLs (using picsum.photos for high-quality placeholders)
const placeholderImages = {
  'hero-lashes.jpg': 'https://picsum.photos/1920/1080?random=1',
  'classic-lashes.jpg': 'https://picsum.photos/600/800?random=2',
  'classic-lashes-2.jpg': 'https://picsum.photos/600/800?random=3',
  'classic-lashes-3.jpg': 'https://picsum.photos/600/800?random=4',
  'hybrid-lashes.jpg': 'https://picsum.photos/600/800?random=5',
  'hybrid-lashes-2.jpg': 'https://picsum.photos/600/800?random=6',
  'hybrid-lashes-3.jpg': 'https://picsum.photos/600/800?random=7',
  'mega-volume.jpg': 'https://picsum.photos/600/800?random=8',
  'mega-volume-2.jpg': 'https://picsum.photos/600/800?random=9',
  'mega-volume-3.jpg': 'https://picsum.photos/600/800?random=10',
  'about-hero.jpg': 'https://picsum.photos/800/600?random=11',
  'premium-materials.jpg': 'https://picsum.photos/400/300?random=12',
  'expert-technicians.jpg': 'https://picsum.photos/400/300?random=13',
  'personalized-service.jpg': 'https://picsum.photos/400/300?random=14',
  'testimonial-1.jpg': 'https://picsum.photos/150/150?random=15',
  'testimonial-2.jpg': 'https://picsum.photos/150/150?random=16',
  'testimonial-3.jpg': 'https://picsum.photos/150/150?random=17',
  'testimonial-4.jpg': 'https://picsum.photos/150/150?random=18',
};

// Create a simple HTML file that shows all placeholder images
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RENFAYE LASHES - Placeholder Images</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .image-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
        .image-item { text-align: center; }
        .image-item img { max-width: 100%; height: auto; border-radius: 8px; }
        .image-item p { margin-top: 8px; font-size: 14px; color: #666; }
    </style>
</head>
<body>
    <h1>RENFAYE LASHES - Placeholder Images</h1>
    <p>These are placeholder images for development. Replace with actual product photos.</p>
    <div class="image-grid">
        ${Object.entries(placeholderImages).map(([filename, url]) => `
            <div class="image-item">
                <img src="${url}" alt="${filename}" />
                <p>${filename}</p>
            </div>
        `).join('')}
    </div>
</body>
</html>
`;

// Write the HTML file
fs.writeFileSync(path.join(__dirname, 'public', 'placeholder-images.html'), htmlContent);

console.log('Placeholder images reference created at public/placeholder-images.html');
console.log('Note: The actual images are served from picsum.photos and will load when the website runs.');
console.log('For production, replace these with actual product photos.');
