function getProducts(): GoogleAppsScript.Content.TextOutput {
	const sheet = getSheet("Products");
	const data = sheet.getDataRange().getValues();
	const headers = data[0];

	const products = data.slice(1).map((row) => {
		const product: Record<string, unknown> = {};
		for (let i = 0; i < headers.length; i++) {
			product[headers[i]] = row[i];
		}
		return product;
	});

	return createJsonResponse({ products });
}

function createProduct(payload: Record<string, unknown>): GoogleAppsScript.Content.TextOutput {
	const sheet = getSheet("Products");
	const id = generateId();
	const timestamp = now();

	sheet.appendRow([
		id,
		escapeHtml(String(payload.name || "")),
		escapeHtml(String(payload.description || "")),
		Number(payload.price) || 0,
		Number(payload.stock) || 0,
		String(payload.imageId || ""),
		true,
		timestamp,
		timestamp,
	]);

	return createJsonResponse({ id });
}

function updateProduct(payload: Record<string, unknown>): GoogleAppsScript.Content.TextOutput {
	const sheet = getSheet("Products");
	const data = sheet.getDataRange().getValues();

	for (let i = 1; i < data.length; i++) {
		if (data[i][0] === payload.id) {
			const row = i + 1;
			if (payload.name !== undefined)
				sheet.getRange(row, 2).setValue(escapeHtml(String(payload.name)));
			if (payload.description !== undefined)
				sheet.getRange(row, 3).setValue(escapeHtml(String(payload.description)));
			if (payload.price !== undefined) sheet.getRange(row, 4).setValue(Number(payload.price));
			if (payload.stock !== undefined) sheet.getRange(row, 5).setValue(Number(payload.stock));
			if (payload.imageId !== undefined)
				sheet.getRange(row, 6).setValue(String(payload.imageId));
			if (payload.active !== undefined)
				sheet.getRange(row, 7).setValue(Boolean(payload.active));
			sheet.getRange(row, 9).setValue(now());

			return createJsonResponse({ success: true });
		}
	}

	return createJsonResponse({ error: "Produto não encontrado." }, 404);
}

function deleteProduct(id: string): GoogleAppsScript.Content.TextOutput {
	const sheet = getSheet("Products");
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
