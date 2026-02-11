import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export const gitConfig = {
	user: process.env.NEXT_PUBLIC_GITHUB_OWNER ?? "",
	repo: process.env.NEXT_PUBLIC_GITHUB_REPO ?? "",
	branch: process.env.NEXT_PUBLIC_GITHUB_BRANCH ?? "main",
};

export const hasGitConfig = gitConfig.user.length > 0 && gitConfig.repo.length > 0;

export function baseOptions(): BaseLayoutProps {
	return {
		nav: {
			title: "rbxts-trpc",
		},
		...(hasGitConfig ? { githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}` } : {}),
	};
}
