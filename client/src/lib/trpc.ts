
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../../server/routers";
import { httpBatchLink } from '@trpc/client';

export const trpc = createTRPCReact<AppRouter>({
	links: [
		httpBatchLink({
			url: "/api/trpc",
			headers: () => {
				const token = localStorage.getItem("genius_token");
				return token ? { Authorization: `Bearer ${token}` } : {};
			},
		}),
	],
});
