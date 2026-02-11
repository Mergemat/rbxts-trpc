import { Client as RemoClient, Server as RemoServer, namespace, remote } from "@rbxts/remo";
import type { AnyNode, Router, RouterShape } from "../core/types";

function isRouterNode<TContext>(node: AnyNode<TContext>): node is Router<TContext, RouterShape<TContext>> {
	return node._def.kind === "router";
}

export function joinPath(parent: string | undefined, key: string): string {
	return parent ? `${parent}.${key}` : key;
}

export function buildRemoSchema<TContext>(router: Router<TContext, RouterShape<TContext>>) {
	const buildShape = (shape: RouterShape<TContext>): unknown => {
		const result = {} as Record<string, unknown>;

		for (const [key, node] of pairs(shape)) {
			if (isRouterNode(node)) {
				result[key] = namespace(buildShape(node._def.shape) as never);
				continue;
			}

			if (node._def.kind === "procedure") {
				result[key] = remote<RemoServer, [input: unknown]>().returns<unknown>();
				continue;
			}

			if (node._def.direction === "server") {
				result[key] = remote<RemoServer, [input: unknown]>();
			} else {
				result[key] = remote<RemoClient, [input: unknown]>();
			}
		}

		return result;
	};

	return buildShape(router._def.shape);
}
