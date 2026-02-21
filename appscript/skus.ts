function getSkus(): GoogleAppsScript.Content.TextOutput {
	const sheet = getSheet("SKUs");
	const data = sheet.getDataRange().getValues();
	const headers = data[0];

	const skus = data.slice(1).map((row) => {
		const sku: Record<string, unknown> = {};
		for (let i = 0; i < headers.length; i++) {
			sku[headers[i]] = row[i];
		}
		return sku;
	});

	return createJsonResponse({ skus });
}

function createSku(payload: Record<string, unknown>): GoogleAppsScript.Content.TextOutput {
	const productId = String(payload.productId || "");
	if (!productId) {
		return createJsonResponse({ error: "productId é obrigatório." }, 400);
	}

	const sheet = getSheet("SKUs");
	const id = generateId("s", "SKUs");

	sheet.appendRow([
		id,
		productId,
		escapeHtml(String(payload.attribute || "")),
		escapeHtml(String(payload.value || "")),
		Number(payload.stock) || 0,
	]);

	return createJsonResponse({ id });
}

function updateSku(payload: Record<string, unknown>): GoogleAppsScript.Content.TextOutput {
	const sheet = getSheet("SKUs");
	const data = sheet.getDataRange().getValues();

	for (let i = 1; i < data.length; i++) {
		if (data[i][0] === payload.id) {
			const row = i + 1;
			if (payload.value !== undefined)
				sheet.getRange(row, 4).setValue(escapeHtml(String(payload.value)));
			if (payload.stock !== undefined) sheet.getRange(row, 5).setValue(Number(payload.stock));

			return createJsonResponse({ success: true });
		}
	}

	return createJsonResponse({ error: "SKU não encontrado." }, 404);
}

function deleteSku(id: string): GoogleAppsScript.Content.TextOutput {
	const sheet = getSheet("SKUs");
	const data = sheet.getDataRange().getValues();

	for (let i = 1; i < data.length; i++) {
		if (data[i][0] === id) {
			sheet.deleteRow(i + 1);
			return createJsonResponse({ success: true });
		}
	}

	return createJsonResponse({ error: "SKU não encontrado." }, 404);
}
