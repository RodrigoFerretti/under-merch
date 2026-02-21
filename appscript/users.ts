function getUsers(): GoogleAppsScript.Content.TextOutput {
	const sheet = getSheet("Users");
	const data = sheet.getDataRange().getValues();

	const users = data.slice(1).map((row) => ({
		email: row[0],
		role: row[1],
		createdAt: row[2],
		lastAccess: row[3] || "",
	}));

	return createJsonResponse({ users });
}

function addUser(payload: Record<string, unknown>): GoogleAppsScript.Content.TextOutput {
	const email = String(payload.email || "")
		.trim()
		.toLowerCase();
	const role = String(payload.role || "")
		.trim()
		.toLowerCase();

	if (!email || !role) {
		return createJsonResponse({ error: "E-mail e role são obrigatórios." }, 400);
	}

	const validRoles = ["admin", "vendas", "estoque"];
	if (!validRoles.includes(role)) {
		return createJsonResponse({ error: `Role inválida. Use: ${validRoles.join(", ")}` }, 400);
	}

	const sheet = getSheet("Users");
	const data = sheet.getDataRange().getValues();

	for (let i = 1; i < data.length; i++) {
		if (data[i][0] === email) {
			return createJsonResponse({ error: "Usuário já existe." }, 400);
		}
	}

	sheet.appendRow([email, role, now(), ""]);

	return createJsonResponse({ success: true });
}

function removeUser(email: string): GoogleAppsScript.Content.TextOutput {
	const targetEmail = String(email || "")
		.trim()
		.toLowerCase();

	if (!targetEmail) {
		return createJsonResponse({ error: "E-mail é obrigatório." }, 400);
	}

	const sheet = getSheet("Users");
	const data = sheet.getDataRange().getValues();

	for (let i = 1; i < data.length; i++) {
		if (data[i][0] === targetEmail) {
			sheet.deleteRow(i + 1);
			return createJsonResponse({ success: true });
		}
	}

	return createJsonResponse({ error: "Usuário não encontrado." }, 404);
}
