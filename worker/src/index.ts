import { FactCheckStatus, FactCheckVerdict, FactCheckResult, Source } from '../../wxt/components/ResultsPanel/ResultsPanel';

export interface Env {
	BRAVE_API_KEY?: string;
}

interface BraveResultItem {
	title: string;
	url: string;
	description: string;
}

interface BraveSearchResponse {
	web?: {
		results?: BraveResultItem[];
	}
}

const CORS_HEADERS = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type, Authorization",
}

function filterText(text: string): string {
	return text
		.replace(/<[^>]*>/g, '')
		.replace(/&#x27;/g, "'")
		.replace(/&quot;/g, '"')
		.replace(/&amp;/g, '&')
		.trim();
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// Handle CORS preflight requests
		if (request.method === "OPTIONS") {
			return new Response(null, {
				status: 204,
				headers: CORS_HEADERS,
			});
		}

		// Only allow POST requests to /api/check
		const url = new URL(request.url);
		if (request.method !== "POST" || url.pathname !== "/api/check") {
			return new Response(JSON.stringify({ error: "Method or route not allowed" }), {
				status: 405,
				headers: {
					"Content-Type": "application/json",
					...CORS_HEADERS,
				},
			});
		}

		try {
			// Parse payload from extension
			const body = await request.json() as { text: string };
			const claim = body?.text;

			if (!claim) {
				return new Response(JSON.stringify({ error: "Missing 'text' in request body" }), {
					status: 400,
					headers: {
						"Content-Type": "application/json",
						...CORS_HEADERS,
					},
				});
			}

			// Search the claim using Brave Search API
			const braveSearchUrl = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(claim)}&count=5`;

			const braveResponse = await fetch(braveSearchUrl, {
				headers: {
					"Accept": "application/json",
					"Accept-Encoding": "gzip",
					"X-Subscription-Token": env.BRAVE_API_KEY || "",
				},
			});

			if (!braveResponse.ok) {
				throw new Error(`Brave Search API error: ${braveResponse.statusText}`);
			}

			const braveData: BraveSearchResponse = await braveResponse.json();

			const mappedSources: Source[] = (braveData.web?.results || []).map(result => ({
				title: filterText(result.title),
				url: result.url,
				description: filterText(result.description),
			}));

			const factCheckResult: FactCheckResult = {
				status: FactCheckStatus.Success,
				verdict: FactCheckVerdict.Misleading,
				score: 100,
				explanation: `Retrieved ${braveData.web?.results?.length || 0} sources from Brave Search.`,
				sources: mappedSources,
			}

			return new Response(JSON.stringify(factCheckResult), {
				status: 200,
				headers: {
					"Content-Type": "application/json",
					...CORS_HEADERS,
				},
			});
		} catch (error: any) {
			return new Response(JSON.stringify({ error: error.message || "Internal server error" }), {
				status: 500,
				headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
			});
		}
	}
}