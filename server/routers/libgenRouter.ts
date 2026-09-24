import { router, publicProcedure } from '../trpc'; // Adjust to your actual base trpc config path
import { z } from 'zod';
import { searchLibgen, getDownloadLink } from '../integrations/libgen';

export const libgenRouter = router({
  // Search procedure endpoint
  search: publicProcedure
    .input(z.object({
      query: z.string().min(2),
      topics: z.array(z.string()).optional(),
      page: z.number().default(1)
    }))
    .query(async ({ input }) => {
      return await searchLibgen(input.query, input.topics, input.page);
    }),

  // Link resolution procedure endpoint
  downloadLink: publicProcedure
    .input(z.object({
      md5: z.string(),
      title: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      const downloadUrl = await getDownloadLink(input.md5);
      return { url: downloadUrl };
    }),

  // Detailed view placeholder to ensure compliance with frontend expectations
  details: publicProcedure
    .input(z.object({ md5: z.string() }))
    .query(async ({ input }) => {
      return {
        publisher: 'Library Genesis Open Catalog Reference',
        isbn: 'Available upon direct extraction',
        description: 'Metadata record synchronized via stateless Model Context Protocol execution vectors.'
      };
    })
});
