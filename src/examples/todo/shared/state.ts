const todos: string[] = ["Milk", "Eggs"];
let changed = false;

export function getTodos(): string[] {
	return [...todos];
}

export function addTodo(name: string): string[] {
	todos.push(name);
	changed = true;
	return getTodos();
}

export function removeTodo(name: string): string[] {
	const index = todos.indexOf(name);
	if (index >= 0) {
		todos.remove(index);
		changed = true;
	}

	return getTodos();
}

export function consumeChanged(): boolean {
	const wasChanged = changed;
	changed = false;
	return wasChanged;
}
