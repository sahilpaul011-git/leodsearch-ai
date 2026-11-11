// Search client. If VITE_API_BASE_URL is set (the Java backend has been
// deployed, e.g. to Render), real requests go to it: real Tavily web
// results and a real Gemini-written explanation. If it's not set, this
// falls back to clearly-labeled mock data so the UI stays usable and
// demonstrable before a backend exists -- it never pretends a mock result
// is real.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const MOCK_DELAY_MS = 700

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function postJson(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  let payload
  try {
    payload = await response.json()
  } catch {
    throw new Error('The server returned an unexpected response.')
  }

  if (!response.ok) {
    throw new Error(payload?.message || `Request failed (${response.status}).`)
  }
  return payload
}

export async function runWebSearch(query) {
  if (API_BASE_URL) {
    const data = await postJson('/api/search/web', { query })
    return { query: data.query, isMock: false, results: data.results }
  }

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
          'This is placeholder result text. Once the backend is deployed and VITE_API_BASE_URL is set, real web results with titles, links and snippets will appear here.',
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
  if (API_BASE_URL) {
    const data = await postJson('/api/search/knowledge', { query })
    return {
      query: data.query,
      isMock: false,
      aiAnswer: data.aiAnswer,
      supportingSources: data.supportingSources,
    }
  }

  await delay(MOCK_DELAY_MS)
  return {
    query,
    isMock: true,
    aiAnswer: {
      summary: `This is a placeholder AI-generated explanation of "${query}". Once the backend is deployed and VITE_API_BASE_URL is set, a real, grounded explanation will appear here, clearly separated from retrieved web information.`,
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
