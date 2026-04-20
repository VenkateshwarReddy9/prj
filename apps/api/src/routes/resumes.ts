import { type Router, Router as ExpressRouter } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.js';
import { prisma } from '../config/prisma.js';
import { supabase, STORAGE_BUCKETS } from '../config/supabase.js';
import { resumeParseQueue } from '../queues/index.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../lib/errors.js';
import { logger } from '../lib/logger.js';

const router: Router = ExpressRouter();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new ValidationError('Only PDF files are accepted'));
    }
  },
});

router.post('/resumes/upload', authenticate, upload.single('resume'), async (req, res) => {
  if (!req.file) {
    throw new ValidationError('No file uploaded');
  }

  const { originalname, buffer, mimetype } = req.file;
  const storageKey = `${req.userId}/${Date.now()}-${originalname}`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS.RESUMES)
    .upload(storageKey, buffer, { contentType: mimetype, upsert: false });

  if (error) {
    logger.error({ error }, 'Supabase storage upload failed');
    throw new Error('Failed to upload resume. Please try again.');
  }

  const resume = await prisma.resume.create({
    data: {
      userId: req.userId,
      filename: originalname,
      storageKey,
    },
  });

  // Queue async parsing
  await resumeParseQueue.add('parse-resume', {
    resumeId: resume.id,
    userId: req.userId,
    storageKey,
    targetRole: req.user.targetRole ?? undefined,
  });

  res.status(201).json({ data: resume });
});

router.get('/resumes', authenticate, async (req, res) => {
  const resumes = await prisma.resume.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      filename: true,
      atsScore: true,
      isActive: true,
      optimized: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  res.json({ data: resumes });
});

router.get('/resumes/:id', authenticate, async (req, res) => {
  const resume = await prisma.resume.findUnique({ where: { id: req.params['id'] } });
  if (!resume) throw new NotFoundError('Resume');
  if (resume.userId !== req.userId) throw new ForbiddenError();
  res.json({ data: resume });
});

router.patch('/resumes/:id/activate', authenticate, async (req, res) => {
  const resume = await prisma.resume.findUnique({ where: { id: req.params['id'] } });
  if (!resume) throw new NotFoundError('Resume');
  if (resume.userId !== req.userId) throw new ForbiddenError();

  // Deactivate all others, activate this one
  await prisma.$transaction([
    prisma.resume.updateMany({
      where: { userId: req.userId },
      data: { isActive: false },
    }),
    prisma.resume.update({
      where: { id: req.params['id'] },
      data: { isActive: true },
    }),
  ]);

  res.json({ data: { activated: true } });
});

router.delete('/resumes/:id', authenticate, async (req, res) => {
  const resume = await prisma.resume.findUnique({ where: { id: req.params['id'] } });
  if (!resume) throw new NotFoundError('Resume');
  if (resume.userId !== req.userId) throw new ForbiddenError();

  await supabase.storage.from(STORAGE_BUCKETS.RESUMES).remove([resume.storageKey]);
  await prisma.resume.delete({ where: { id: req.params['id'] } });

  res.json({ data: { deleted: true } });
});

export { router as resumesRouter };
