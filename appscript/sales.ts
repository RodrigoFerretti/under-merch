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
	const quantity = Number(payload.quantity);
	const paymentMethod = String(payload.paymentMethod);

	if (!productId || !quantity || quantity <= 0) {
		return createJsonResponse({ error: "Dados da venda inválidos." }, 400);
	}

	const productsSheet = getSheet("Products");
	const productsData = productsSheet.getDataRange().getValues();

	let productRow = -1;
	let unitPrice = 0;
	let currentStock = 0;

	for (let i = 1; i < productsData.length; i++) {
		if (productsData[i][0] === productId) {
			productRow = i + 1;
			unitPrice = Number(productsData[i][3]);
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

	const total = unitPrice * quantity;
	const id = generateId();
	const timestamp = now();

	// 1. Register sale
	const salesSheet = getSheet("Sales");
	salesSheet.appendRow([
		id,
		productId,
		quantity,
		unitPrice,
		total,
		paymentMethod,
		userEmail,
		timestamp,
	]);

	// 2. Decrement stock
	productsSheet.getRange(productRow, 5).setValue(currentStock - quantity);
	productsSheet.getRange(productRow, 9).setValue(timestamp);

	// 3. Register movement
	const movementsSheet = getSheet("Movements");
	movementsSheet.appendRow([
		generateId(),
		productId,
		"out",
		quantity,
		"sale",
		userEmail,
		timestamp,
	]);

	return createJsonResponse({ id, total });
}
