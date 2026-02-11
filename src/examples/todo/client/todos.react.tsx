import React from "@rbxts/react";
import { createClient } from "../../../index";
import { invalidateRPCQuery, useRPCEvent, useRPCMutation, useRPCQuery } from "../../../react";
import { appRouter } from "../shared/router";
import { trpc } from "../shared/trpc";

const client = createClient({
	t: trpc,
	router: appRouter,
});

export function TodoWidget() {
	const [nextTodo, setNextTodo] = React.useState("Apple");
	const todosQuery = useRPCQuery(client.todos.getAll, undefined);
	const addTodo = useRPCMutation(client.todos.add, {
		onSuccess: () => {
			invalidateRPCQuery(client.todos.getAll.__path, undefined);
			todosQuery.refetch();
		},
	});

	useRPCEvent(client.todos.changed, () => {
		todosQuery.refetch();
	});

	return (
		<frame key="TodoWidget" Size={new UDim2(0, 300, 0, 220)} BackgroundColor3={Color3.fromRGB(36, 36, 44)}>
			<uipadding PaddingTop={new UDim(0, 12)} PaddingLeft={new UDim(0, 12)} PaddingRight={new UDim(0, 12)} />
			<textlabel
				key="Title"
				BackgroundTransparency={1}
				Text="Todos"
				TextSize={24}
				Font={Enum.Font.GothamBold}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				Size={new UDim2(1, 0, 0, 32)}
			/>
			<textlabel
				key="Items"
				BackgroundTransparency={1}
				Text={todosQuery.isLoading ? "Loading..." : (todosQuery.data ?? []).join(", ")}
				TextWrapped={true}
				TextXAlignment={Enum.TextXAlignment.Left}
				TextYAlignment={Enum.TextYAlignment.Top}
				TextSize={16}
				Font={Enum.Font.Gotham}
				TextColor3={Color3.fromRGB(220, 220, 220)}
				Position={new UDim2(0, 0, 0, 36)}
				Size={new UDim2(1, 0, 0, 110)}
			/>
			<textbutton
				key="AddButton"
				Text={addTodo.isPending ? "Adding..." : "Add Todo"}
				TextSize={16}
				Font={Enum.Font.GothamMedium}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundColor3={Color3.fromRGB(61, 133, 198)}
				Position={new UDim2(0, 0, 0, 156)}
				Size={new UDim2(0, 130, 0, 36)}
				Event={{
					MouseButton1Click: () => {
						addTodo.mutate(nextTodo);
						setNextTodo(nextTodo === "Apple" ? "Orange" : "Apple");
					},
				}}
			/>
		</frame>
	);
}
