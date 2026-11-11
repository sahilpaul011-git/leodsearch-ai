// Search client — currently returns realistic mock data with a simulated
// network delay, so the UI can be built and tested before the Java backend
// exists. Every function here has the exact shape the real backend will
// return, so swapping the mock body for a real `fetch()` call later won't
// require touching any page component.
//
// Real wiring happens in a later stage, once:
//   1. The Java backend is deployed somewhere reachable (e.g. Render), and
//   2. VITE_API_BASE_URL is set to that backend's URL.
// Until then, no fabricated result is presented as if it came from a real
// search or a real AI model — the UI clearly marks this as mock/demo data.

const MOCK_DELAY_MS = 700

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function runWebSearch(query) {
  await delay(MOCK_DELAY_MS)
  return {
    query,
    isMock: true,
    results: [
      {
        title: `Understanding "${query}" — an overview`,
        url: 'https://example.com/overview',
        source: 'example.com',
        snippet:
          'This is placeholder result text. Once the Tavily Search API is connected on the backend, real web results with titles, links and snippets will appear here.',
      },
      {
        title: `${query}: a deeper explanation`,
        url: 'https://example.org/deep-dive',
        source: 'example.org',
        snippet:
          'Another placeholder snippet. Real results will be fetched live and will never be invented once the backend is wired up.',
      },
      {
        title: `Latest developments related to ${query}`,
        url: 'https://example.net/latest',
        source: 'example.net',
        snippet:
          'Placeholder text representing a third search result, including source attribution.',
      },
    ],
  }
}

export async function runKnowledgeSearch(query) {
  await delay(MOCK_DELAY_MS)
  return {
    query,
    isMock: true,
    aiAnswer: {
      summary: `This is a placeholder AI-generated explanation of "${query}". Once the Gemini API is connected on the backend, a real, grounded explanation will appear here, clearly separated from retrieved web information.`,
      keyPoints: [
        'Key point one will summarize the core idea.',
        'Key point two will add supporting context.',
        'Key point three will note any open questions or nuance.',
      ],
    },
    supportingSources: [
      { title: 'Example Source A', url: 'https://example.com/source-a' },
      { title: 'Example Source B', url: 'https://example.org/source-b' },
    ],
  }
}
