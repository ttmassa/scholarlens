import { FactCheckStatus, FactCheckVerdict, FactCheckResult } from '../../wxt/components/ResultsPanel/ResultsPanel';

export interface Env {
	AI_API_KEY?: string;
}

const CORS_HEADERS = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type, Authorization",
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

			const factCheckResult: FactCheckResult = {
				status: FactCheckStatus.Success,
				verdict: FactCheckVerdict.Misleading,
				score: 100,
				explanation: "The claim is misleading because it lacks context and omits critical information that changes its meaning.",
				sources: [
					"https://en.wikipedia.org/wiki/Main_Page",
					"https://www.nature.com"
				]
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