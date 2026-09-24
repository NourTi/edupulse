import axios from 'axios';

const LIBGEN_MCP_URL = 'https://jmrp.io';

export interface LibgenSearchResult {
  totalFiles: number;
  hasMore: boolean;
  results: Array<{
    md5: string;
    title: string;
    author: string;
    year: string;
    publisher: string;
    language: string;
    extension: string;
    size: string;
    topic: string;
    coverUrl?: string;
  }>;
}

/**
 * Executes a federated search across the LibGen catalog via MCP
 */
export async function searchLibgen(query: string, topics: string[] = ['nonfiction', 'fiction'], page = 1): Promise<LibgenSearchResult> {
  try {
    const response = await axios.post(LIBGEN_MCP_URL, {
      method: 'tools/call',
      params: {
        name: 'search',
        arguments: {
          query,
          topics,
          page,
          results_per_page: 25
        }
      }
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    // Parse the structured tool result from the MCP stream
    const toolResult = response.data?.result?.content?.find((c: any) => c.type === 'text');
    if (!toolResult) {
      return { totalFiles: 0, hasMore: false, results: [] };
    }

    // Process out the raw data block
    const data = JSON.parse(toolResult.text || '{}');
    return {
      totalFiles: data.total_files || 0,
      hasMore: data.has_more || false,
      results: (data.files || []).map((f: any) => ({
        md5: f.md5,
        title: f.title,
        author: f.author,
        year: f.year,
        publisher: f.publisher,
        language: f.language,
        extension: f.extension,
        size: f.size,
        topic: f.topic
      }))
    };
  } catch (error: any) {
    console.error('[LibGen MCP Search Error]:', error.message);
    throw new Error('Failed to fetch data from LibGen MCP catalog.');
  }
}

/**
 * Resolves a verified, direct browser download link for a given file MD5
 */
export async function getDownloadLink(md5: string): Promise<string> {
  try {
    const response = await axios.post(LIBGEN_MCP_URL, {
      method: 'tools/call',
      params: {
        name: 'download',
        arguments: {
          md5,
          resolve_only: true // Forces the remote server to output a link instead of saving to disk
        }
      }
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    const toolResult = response.data?.result?.content?.find((c: any) => c.type === 'text');
    const parsed = JSON.parse(toolResult?.text || '{}');
    
    if (parsed.resource_link) {
      return parsed.resource_link;
    }
    
    throw new Error('No downloadable mirror link returned.');
  } catch (error: any) {
    console.error('[LibGen MCP Download Error]:', error.message);
    throw new Error('Failed to resolve direct download link.');
  }
}
