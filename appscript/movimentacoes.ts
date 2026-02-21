function getMovimentacoes(): GoogleAppsScript.Content.TextOutput {
	const sheet = getSheet("Movimentacoes");
	const data = sheet.getDataRange().getValues();
	const headers = data[0];

	const movimentacoes = data.slice(1).map((row) => {
		const mov: Record<string, unknown> = {};
		for (let i = 0; i < headers.length; i++) {
			mov[headers[i]] = row[i];
		}
		return mov;
	});

	return createJsonResponse({ movimentacoes });
}

function registrarEntrada(
	payload: Record<string, unknown>,
	usuarioEmail: string,
): GoogleAppsScript.Content.TextOutput {
	const produtoId = String(payload.produtoId);
	const quantidade = Number(payload.quantidade);
	const motivo = escapeHtml(String(payload.motivo || "reposicao"));

	if (!produtoId || !quantidade || quantidade <= 0) {
		return createJsonResponse({ error: "Dados inválidos." }, 400);
	}

	const produtosSheet = getSheet("Produtos");
	const produtosData = produtosSheet.getDataRange().getValues();

	let produtoRow = -1;
	let estoqueAtual = 0;

	for (let i = 1; i < produtosData.length; i++) {
		if (produtosData[i][0] === produtoId) {
			produtoRow = i + 1;
			estoqueAtual = Number(produtosData[i][4]);
			break;
		}
	}

	if (produtoRow === -1) {
		return createJsonResponse({ error: "Produto não encontrado." }, 404);
	}

	const timestamp = now();

	// Incrementar estoque
	produtosSheet.getRange(produtoRow, 5).setValue(estoqueAtual + quantidade);
	produtosSheet.getRange(produtoRow, 9).setValue(timestamp);

	// Registrar movimentação
	const movSheet = getSheet("Movimentacoes");
	movSheet.appendRow([
		generateId(),
		produtoId,
		"entrada",
		quantidade,
		motivo,
		usuarioEmail,
		timestamp,
	]);

	return createJsonResponse({ success: true });
}

function registrarSaida(
	payload: Record<string, unknown>,
	usuarioEmail: string,
): GoogleAppsScript.Content.TextOutput {
	const produtoId = String(payload.produtoId);
	const quantidade = Number(payload.quantidade);
	const motivo = escapeHtml(String(payload.motivo || "ajuste"));

	if (!produtoId || !quantidade || quantidade <= 0) {
		return createJsonResponse({ error: "Dados inválidos." }, 400);
	}

	const produtosSheet = getSheet("Produtos");
	const produtosData = produtosSheet.getDataRange().getValues();

	let produtoRow = -1;
	let estoqueAtual = 0;

	for (let i = 1; i < produtosData.length; i++) {
		if (produtosData[i][0] === produtoId) {
			produtoRow = i + 1;
			estoqueAtual = Number(produtosData[i][4]);
			break;
		}
	}

	if (produtoRow === -1) {
		return createJsonResponse({ error: "Produto não encontrado." }, 404);
	}

	if (estoqueAtual < quantidade) {
		return createJsonResponse(
			{ error: `Estoque insuficiente. Disponível: ${estoqueAtual}` },
			400,
		);
	}

	const timestamp = now();

	// Decrementar estoque
	produtosSheet.getRange(produtoRow, 5).setValue(estoqueAtual - quantidade);
	produtosSheet.getRange(produtoRow, 9).setValue(timestamp);

	// Registrar movimentação
	const movSheet = getSheet("Movimentacoes");
	movSheet.appendRow([
		generateId(),
		produtoId,
		"saida",
		quantidade,
		motivo,
		usuarioEmail,
		timestamp,
	]);

	return createJsonResponse({ success: true });
}
