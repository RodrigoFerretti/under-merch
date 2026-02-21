function getProducts(): GoogleAppsScript.Content.TextOutput {
	const sheet = getSheet("Produtos");
	const data = sheet.getDataRange().getValues();
	const headers = data[0];

	const produtos = data.slice(1).map((row) => {
		const produto: Record<string, unknown> = {};
		for (let i = 0; i < headers.length; i++) {
			produto[headers[i]] = row[i];
		}
		return produto;
	});

	return createJsonResponse({ produtos });
}

function createProduct(payload: Record<string, unknown>): GoogleAppsScript.Content.TextOutput {
	const sheet = getSheet("Produtos");
	const id = generateId();
	const timestamp = now();

	sheet.appendRow([
		id,
		escapeHtml(String(payload.nome || "")),
		escapeHtml(String(payload.descricao || "")),
		Number(payload.preco) || 0,
		Number(payload.estoque) || 0,
		String(payload.imagemId || ""),
		true,
		timestamp,
		timestamp,
	]);

	return createJsonResponse({ id });
}

function updateProduct(payload: Record<string, unknown>): GoogleAppsScript.Content.TextOutput {
	const sheet = getSheet("Produtos");
	const data = sheet.getDataRange().getValues();

	for (let i = 1; i < data.length; i++) {
		if (data[i][0] === payload.id) {
			const row = i + 1;
			if (payload.nome !== undefined)
				sheet.getRange(row, 2).setValue(escapeHtml(String(payload.nome)));
			if (payload.descricao !== undefined)
				sheet.getRange(row, 3).setValue(escapeHtml(String(payload.descricao)));
			if (payload.preco !== undefined) sheet.getRange(row, 4).setValue(Number(payload.preco));
			if (payload.estoque !== undefined)
				sheet.getRange(row, 5).setValue(Number(payload.estoque));
			if (payload.imagemId !== undefined)
				sheet.getRange(row, 6).setValue(String(payload.imagemId));
			if (payload.ativo !== undefined)
				sheet.getRange(row, 7).setValue(Boolean(payload.ativo));
			sheet.getRange(row, 9).setValue(now());

			return createJsonResponse({ success: true });
		}
	}

	return createJsonResponse({ error: "Produto não encontrado." }, 404);
}

function deleteProduct(id: string): GoogleAppsScript.Content.TextOutput {
	const sheet = getSheet("Produtos");
	const data = sheet.getDataRange().getValues();

	for (let i = 1; i < data.length; i++) {
		if (data[i][0] === id) {
			const row = i + 1;
			sheet.getRange(row, 7).setValue(false);
			sheet.getRange(row, 9).setValue(now());
			return createJsonResponse({ success: true });
		}
	}

	return createJsonResponse({ error: "Produto não encontrado." }, 404);
}
