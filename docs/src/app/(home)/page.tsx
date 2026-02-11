import Link from "next/link";

export default function HomePage() {
	return (
		<div className="flex flex-1 items-center justify-center px-6">
			<div className="mx-auto max-w-3xl text-center">
				<p className="text-sm uppercase tracking-[0.2em] text-fd-muted-foreground">Roblox TypeScript</p>
				<h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">rbxts-trpc Documentation</h1>
				<p className="mt-5 text-lg text-fd-muted-foreground">
					Type-safe procedures and events for Roblox games, powered by a shared router contract.
				</p>
				<div className="mt-8 flex items-center justify-center gap-3">
					<Link
						href="/docs"
						className="rounded-lg bg-fd-primary px-4 py-2 text-fd-primary-foreground transition-opacity hover:opacity-90"
					>
						Read the docs
					</Link>
					<Link
						href="/docs/guides/create-your-first-router"
						className="rounded-lg border border-fd-border px-4 py-2 text-fd-foreground transition-colors hover:bg-fd-accent"
					>
						Start guide
					</Link>
				</div>
			</div>
		</div>
	);
}
