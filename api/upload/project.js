const jwt = require('jsonwebtoken');

// Auth middleware helper
const authenticate = (req) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    throw new Error('No token provided');
  }
  return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this-in-production');
};

module.exports = async (req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Authenticate
    authenticate(req);
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Support both multipart/form-data and JSON with base64
    const contentType = req.headers['content-type'] || '';

    if (contentType.includes('application/json')) {
      // JSON request with base64 data URL
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { imageData, filename } = body;

      if (!imageData || !imageData.startsWith('data:image/')) {
        return res.status(400).json({ message: 'Invalid image data' });
      }

      // Extract mimetype and base64 data
      const matches = imageData.match(/^data:image\/([^;]+);base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({ message: 'Invalid base64 image format' });
      }

      const mimetype = `image/${matches[1]}`;
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');

      // Validate file size (5MB limit)
      if (buffer.length > 5 * 1024 * 1024) {
        return res.status(400).json({ message: 'File size exceeds 5MB limit' });
      }

      res.json({
        message: 'Image uploaded successfully',
        path: imageData, // Return the data URL as-is
        filename: filename || `project-${Date.now()}.${matches[1]}`
      });

    } else if (contentType.includes('multipart/form-data')) {
      // Multipart form data - parse manually
      const chunks = [];
      let boundary = '';

      // Get boundary from Content-Type header
      const boundaryMatch = contentType.match(/boundary=(.+)$/);
      if (!boundaryMatch) {
        return res.status(400).json({ message: 'No boundary found in Content-Type' });
      }
      boundary = '--' + boundaryMatch[1].trim();

      // Collect request data
      req.on('data', chunk => chunks.push(chunk));

      await new Promise((resolve, reject) => {
        req.on('end', () => {
          try {
            const buffer = Buffer.concat(chunks);
            const parts = buffer.toString('binary').split(boundary);

            for (const part of parts) {
              if (part.includes('Content-Disposition: form-data') && part.includes('name="image"')) {
                const filenameMatch = part.match(/filename="([^"]+)"/);
                const contentTypeMatch = part.match(/Content-Type: ([^\r\n]+)/);

                if (filenameMatch) {
                  const fileStart = part.indexOf('\r\n\r\n') + 4;
                  const fileEnd = part.lastIndexOf('\r\n');
                  const fileBuffer = Buffer.from(part.slice(fileStart, fileEnd), 'binary');

                  // Validate file size (5MB limit)
                  if (fileBuffer.length > 5 * 1024 * 1024) {
                    return reject(new Error('File size exceeds 5MB limit'));
                  }

                  const mimetype = contentTypeMatch ? contentTypeMatch[1].trim() : 'application/octet-stream';
                  if (!mimetype.startsWith('image/')) {
                    return reject(new Error('Only image files are allowed'));
                  }

                  // Convert to base64 data URL
                  const base64Data = fileBuffer.toString('base64');
                  const dataURL = `data:${mimetype};base64,${base64Data}`;

                  res.json({
                    message: 'Image uploaded successfully',
                    path: dataURL,
                    filename: filenameMatch[1]
                  });

                  return resolve();
                }
              }
            }

            reject(new Error('No image file found in request'));
          } catch (error) {
            reject(error);
          }
        });

        req.on('error', reject);
      });

    } else {
      return res.status(400).json({ message: 'Unsupported Content-Type' });
    }

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
