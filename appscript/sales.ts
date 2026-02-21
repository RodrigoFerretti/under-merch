function getSales(): GoogleAppsScript.Content.TextOutput {
	const sheet = getSheet("Sales");
	const data = sheet.getDataRange().getValues();
	const headers = data[0];

	const sales = data.slice(1).map((row) => {
		const sale: Record<string, unknown> = {};
		for (let i = 0; i < headers.length; i++) {
			sale[headers[i]] = row[i];
		}
		return sale;
	});

	return createJsonResponse({ sales });
}

function registerSale(
	payload: Record<string, unknown>,
	userEmail: string,
): GoogleAppsScript.Content.TextOutput {
	const productId = String(payload.productId);
	const skuId = String(payload.skuId);
	const quantity = Number(payload.quantity);
	const paymentMethod = String(payload.paymentMethod);

	if (!productId || !skuId || !quantity || quantity <= 0) {
		return createJsonResponse({ error: "Dados da venda inválidos." }, 400);
	}

	// Look up product price
	const productsSheet = getSheet("Products");
	const productsData = productsSheet.getDataRange().getValues();

	let unitPrice = 0;
	let productFound = false;

	for (let i = 1; i < productsData.length; i++) {
		if (productsData[i][0] === productId) {
			unitPrice = Number(productsData[i][3]);
			productFound = true;
			break;
		}
	}

	if (!productFound) {
		return createJsonResponse({ error: "Produto não encontrado." }, 404);
	}

	// Look up SKU for stock
	const skusSheet = getSheet("SKUs");
	const skusData = skusSheet.getDataRange().getValues();

	let skuRow = -1;
	let currentStock = 0;

	for (let i = 1; i < skusData.length; i++) {
		if (skusData[i][0] === skuId) {
			if (skusData[i][1] !== productId) {
				return createJsonResponse({ error: "SKU não pertence ao produto informado." }, 400);
			}
			skuRow = i + 1;
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

	const total = unitPrice * quantity;
	const id = generateId("v", "Sales");
	const timestamp = now();

	// 1. Register sale
	const salesSheet = getSheet("Sales");
	salesSheet.appendRow([
		id,
		productId,
		skuId,
		quantity,
		unitPrice,
		total,
		paymentMethod,
		userEmail,
		timestamp,
	]);

	// 2. Decrement stock on SKU
	skusSheet.getRange(skuRow, 5).setValue(currentStock - quantity);

	// 3. Register movement
	const movementsSheet = getSheet("Movements");
	movementsSheet.appendRow([
		generateId("m", "Movements"),
		productId,
		skuId,
		"out",
		quantity,
		"sale",
		userEmail,
		timestamp,
	]);

	if (paymentMethod === "PIX") {
		const pixPayload = generatePixPayload(total);
		return createJsonResponse({ id, total, pixPayload });
	}

	return createJsonResponse({ id, total });
}
