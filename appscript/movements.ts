function getMovements(): GoogleAppsScript.Content.TextOutput {
	const sheet = getSheet("Movements");
	const data = sheet.getDataRange().getValues();
	const headers = data[0];

	const movements = data.slice(1).map((row) => {
		const mov: Record<string, unknown> = {};
		for (let i = 0; i < headers.length; i++) {
			mov[headers[i]] = row[i];
		}
		return mov;
	});

	return createJsonResponse({ movements });
}

function registerStockIn(
	payload: Record<string, unknown>,
	userEmail: string,
): GoogleAppsScript.Content.TextOutput {
	const skuId = String(payload.skuId);
	const quantity = Number(payload.quantity);
	const reason = escapeHtml(String(payload.reason || "restock"));

	if (!skuId || !quantity || quantity <= 0) {
		return createJsonResponse({ error: "Dados inválidos." }, 400);
	}

	const skusSheet = getSheet("SKUs");
	const skusData = skusSheet.getDataRange().getValues();

	let skuRow = -1;
	let productId = "";
	let currentStock = 0;

	for (let i = 1; i < skusData.length; i++) {
		if (skusData[i][0] === skuId) {
			skuRow = i + 1;
			productId = String(skusData[i][1]);
			currentStock = Number(skusData[i][4]);
			break;
		}
	}

	if (skuRow === -1) {
		return createJsonResponse({ error: "SKU não encontrado." }, 404);
	}

	const timestamp = now();

	// Increment stock on SKU
	skusSheet.getRange(skuRow, 5).setValue(currentStock + quantity);

	// Register movement
	const movementsSheet = getSheet("Movements");
	movementsSheet.appendRow([
		generateId("m", "Movements"),
		productId,
		skuId,
		"in",
		quantity,
		reason,
		userEmail,
		timestamp,
	]);

	return createJsonResponse({ success: true });
}

function registerStockOut(
	payload: Record<string, unknown>,
	userEmail: string,
): GoogleAppsScript.Content.TextOutput {
	const skuId = String(payload.skuId);
	const quantity = Number(payload.quantity);
	const reason = escapeHtml(String(payload.reason || "adjustment"));

	if (!skuId || !quantity || quantity <= 0) {
		return createJsonResponse({ error: "Dados inválidos." }, 400);
	}

	const skusSheet = getSheet("SKUs");
	const skusData = skusSheet.getDataRange().getValues();

	let skuRow = -1;
	let productId = "";
	let currentStock = 0;

	for (let i = 1; i < skusData.length; i++) {
		if (skusData[i][0] === skuId) {
			skuRow = i + 1;
			productId = String(skusData[i][1]);
			currentStock = Number(skusData[i][4]);
			break;
		}
	}

	if (skuRow === -1) {
		return createJsonResponse({ error: "SKU não encontrado." }, 404);
	}

	if (currentStock < quantity) {
		return createJsonResponse(
			{ error: `Estoque insuficiente. Disponível: ${currentStock}` },
			400,
		);
	}

	const timestamp = now();

	// Decrement stock on SKU
	skusSheet.getRange(skuRow, 5).setValue(currentStock - quantity);

	// Register movement
	const movementsSheet = getSheet("Movements");
	movementsSheet.appendRow([
		generateId("m", "Movements"),
		productId,
		skuId,
		"out",
		quantity,
		reason,
		userEmail,
		timestamp,
	]);

	return createJsonResponse({ success: true });
}
