import type { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/error.js';
import { listResources } from '../services/resource.service.js';

const querySchema = z.object({
  category: z.string().optional(),
  country: z.string().optional(),
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const filters = querySchema.parse(req.query);
  const resources = await listResources(filters);
  res.json({ success: true, data: resources });
});
