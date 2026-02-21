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
	const productId = String(payload.productId);
	const quantity = Number(payload.quantity);
	const reason = escapeHtml(String(payload.reason || "restock"));

	if (!productId || !quantity || quantity <= 0) {
		return createJsonResponse({ error: "Dados inválidos." }, 400);
	}

	const productsSheet = getSheet("Products");
	const productsData = productsSheet.getDataRange().getValues();

	let productRow = -1;
	let currentStock = 0;

	for (let i = 1; i < productsData.length; i++) {
		if (productsData[i][0] === productId) {
			productRow = i + 1;
			currentStock = Number(productsData[i][4]);
			break;
		}
	}

	if (productRow === -1) {
		return createJsonResponse({ error: "Produto não encontrado." }, 404);
	}

	const timestamp = now();

	// Increment stock
	productsSheet.getRange(productRow, 5).setValue(currentStock + quantity);
	productsSheet.getRange(productRow, 9).setValue(timestamp);

	// Register movement
	const movementsSheet = getSheet("Movements");
	movementsSheet.appendRow([
		generateId(),
		productId,
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
	const productId = String(payload.productId);
	const quantity = Number(payload.quantity);
	const reason = escapeHtml(String(payload.reason || "adjustment"));

	if (!productId || !quantity || quantity <= 0) {
		return createJsonResponse({ error: "Dados inválidos." }, 400);
	}

	const productsSheet = getSheet("Products");
	const productsData = productsSheet.getDataRange().getValues();

	let productRow = -1;
	let currentStock = 0;

	for (let i = 1; i < productsData.length; i++) {
		if (productsData[i][0] === productId) {
			productRow = i + 1;
			currentStock = Number(productsData[i][4]);
			break;
		}
	}

	if (productRow === -1) {
		return createJsonResponse({ error: "Produto não encontrado." }, 404);
	}

	if (currentStock < quantity) {
		return createJsonResponse(
			{ error: `Estoque insuficiente. Disponível: ${currentStock}` },
			400,
		);
	}

	const timestamp = now();

	// Decrement stock
	productsSheet.getRange(productRow, 5).setValue(currentStock - quantity);
	productsSheet.getRange(productRow, 9).setValue(timestamp);

	// Register movement
	const movementsSheet = getSheet("Movements");
	movementsSheet.appendRow([
		generateId(),
		productId,
		"out",
		quantity,
		reason,
		userEmail,
		timestamp,
	]);

	return createJsonResponse({ success: true });
}
