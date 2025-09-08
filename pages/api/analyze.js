import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { analyzeBase64Image } from '../../lib/geminiClient';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    multiples: false,
    maxFileSize: 10 * 1024 * 1024, // 10MB limit
  });

  return new Promise((resolve) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        const status = err.message && err.message.includes('maxFileSize') ? 413 : 400;
        res.status(status).json({ error: err.message || 'Invalid form data' });
        return resolve();
      }

      const file = files.file;
      const filePath = Array.isArray(file) ? file[0]?.filepath : file?.filepath;
      const mimetype = Array.isArray(file) ? file[0]?.mimetype : file?.mimetype;

      if (!filePath) {
        res.status(400).json({ error: 'No file provided' });
        return resolve();
      }

      try {
        const buffer = fs.readFileSync(filePath);
        const base64 = buffer.toString('base64');
        const analysis = await analyzeBase64Image(base64, mimetype || 'image/jpeg');
        res.status(200).json(analysis);
      } catch (e) {
        const message = e?.message || 'Failed to analyze image';
        res.status(500).json({ error: message });
      } finally {
        try { fs.unlinkSync(filePath); } catch {}
        resolve();
      }
    });
  });
}


