import { DocumentSection, Citation } from "@/lib/types";

export interface DocumentChunk {
  id: string;
  sectionTitle: string;
  content: string;
  tokens: string[];
  charOffset: number;
}

const LEGAL_STOP_WORDS = new Set([
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for",
  "not", "on", "with", "he", "as", "you", "do", "at", "this", "but", "his", "by",
  "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all",
  "would", "there", "their", "what", "so", "up", "out", "if", "about", "who", "get",
  "which", "go", "me", "when", "make", "can", "like", "time", "no", "just", "him",
  "know", "take", "people", "into", "year", "your", "good", "some", "could", "them",
  "see", "other", "than", "then", "now", "look", "only", "come", "its", "over",
  "think", "also", "back", "after", "use", "two", "how", "our", "work", "first",
  "well", "way", "even", "new", "want", "because", "any", "these", "give", "day",
  "most", "us"
]);

export function tokenizeText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s\$\€\₹\%]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !LEGAL_STOP_WORDS.has(token));
}

export function chunkDocument(
  text: string,
  sections: DocumentSection[],
  chunkSize: number = 800,
  overlap: number = 150
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  let chunkIdx = 1;

  if (sections && sections.length > 0) {
    for (const sec of sections) {
      const content = sec.content.trim();
      if (!content) continue;

      if (content.length <= chunkSize + overlap) {
        chunks.push({
          id: `chunk-${chunkIdx++}`,
          sectionTitle: sec.heading,
          content,
          tokens: tokenizeText(`${sec.heading} ${content}`),
          charOffset: 0,
        });
      } else {
        // Split section content into overlapping windows
        let start = 0;
        while (start < content.length) {
          const end = Math.min(start + chunkSize, content.length);
          const chunkText = content.slice(start, end).trim();
          if (chunkText.length > 30) {
            chunks.push({
              id: `chunk-${chunkIdx++}`,
              sectionTitle: sec.heading,
              content: chunkText,
              tokens: tokenizeText(`${sec.heading} ${chunkText}`),
              charOffset: start,
            });
          }
          if (end >= content.length) break;
          start += chunkSize - overlap;
        }
      }
    }
  } else {
    // Fallback: sliding window over full text
    let start = 0;
    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      const chunkText = text.slice(start, end).trim();
      if (chunkText.length > 30) {
        chunks.push({
          id: `chunk-${chunkIdx++}`,
          sectionTitle: `Document Segment ${chunkIdx}`,
          content: chunkText,
          tokens: tokenizeText(chunkText),
          charOffset: start,
        });
      }
      if (end >= text.length) break;
      start += chunkSize - overlap;
    }
  }

  return chunks;
}

export interface RetrievalResult {
  chunk: DocumentChunk;
  score: number;
}

export function searchDocumentChunks(
  query: string,
  chunks: DocumentChunk[],
  topK: number = 4
): RetrievalResult[] {
  const queryTokens = tokenizeText(query);
  if (queryTokens.length === 0 || chunks.length === 0) {
    return [];
  }

  // Calculate Document Frequencies (DF) for IDF calculation
  const docFreq: Record<string, number> = {};
  for (const chunk of chunks) {
    const seen = new Set(chunk.tokens);
    seen.forEach((t) => {
      docFreq[t] = (docFreq[t] || 0) + 1;
    });
  }

  const numChunks = chunks.length;

  // Score each chunk
  const scoredChunks: RetrievalResult[] = chunks.map((chunk) => {
    let score = 0;
    const termCounts: Record<string, number> = {};
    for (const t of chunk.tokens) {
      termCounts[t] = (termCounts[t] || 0) + 1;
    }

    for (const qToken of queryTokens) {
      const qStem = qToken.length >= 4 ? qToken.slice(0, 5) : qToken;
      let matchedCount = termCounts[qToken] || 0;

      if (!matchedCount && qStem.length >= 4) {
        for (const [term, count] of Object.entries(termCounts)) {
          if (term.startsWith(qStem) || (term.length >= 4 && qToken.startsWith(term.slice(0, 4)))) {
            matchedCount += count * 0.8;
          }
        }
      }

      if (matchedCount > 0) {
        // TF-IDF with length normalization
        const tf = matchedCount / chunk.tokens.length;
        const df = docFreq[qToken] || 1;
        const idf = Math.log((numChunks + 1) / df) + 1;
        score += tf * idf;
      }

      // Boost if term appears in section title
      if (chunk.sectionTitle.toLowerCase().includes(qStem)) {
        score += 0.8;
      }
    }

    return { chunk, score };
  });

  return scoredChunks
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

export function buildCitationsFromResults(results: RetrievalResult[]): Citation[] {
  return results.map((res) => {
    const snippet = res.chunk.content.slice(0, 240).replace(/\n/g, " ").trim();
    return {
      sectionTitle: res.chunk.sectionTitle,
      excerpt: snippet.length >= 240 ? `${snippet}...` : snippet,
      pageOrSection: res.chunk.sectionTitle,
      relevanceExplanation: `Grounding match from ${res.chunk.sectionTitle}`,
    };
  });
}
