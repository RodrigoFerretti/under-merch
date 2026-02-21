function getVendas(): GoogleAppsScript.Content.TextOutput {
	const sheet = getSheet("Vendas");
	const data = sheet.getDataRange().getValues();
	const headers = data[0];

	const vendas = data.slice(1).map((row) => {
		const venda: Record<string, unknown> = {};
		for (let i = 0; i < headers.length; i++) {
			venda[headers[i]] = row[i];
		}
		return venda;
	});

	return createJsonResponse({ vendas });
}

function registrarVenda(
	payload: Record<string, unknown>,
	usuarioEmail: string,
): GoogleAppsScript.Content.TextOutput {
	const produtoId = String(payload.produtoId);
	const quantidade = Number(payload.quantidade);
	const metodoPagamento = String(payload.metodoPagamento);

	if (!produtoId || !quantidade || quantidade <= 0) {
		return createJsonResponse({ error: "Dados da venda inválidos." }, 400);
	}

	const produtosSheet = getSheet("Produtos");
	const produtosData = produtosSheet.getDataRange().getValues();

	let produtoRow = -1;
	let precoUnitario = 0;
	let estoqueAtual = 0;

	for (let i = 1; i < produtosData.length; i++) {
		if (produtosData[i][0] === produtoId) {
			produtoRow = i + 1;
			precoUnitario = Number(produtosData[i][3]);
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

	const total = precoUnitario * quantidade;
	const id = generateId();
	const timestamp = now();

	// 1. Registrar venda
	const vendasSheet = getSheet("Vendas");
	vendasSheet.appendRow([
		id,
		produtoId,
		quantidade,
		precoUnitario,
		total,
		metodoPagamento,
		usuarioEmail,
		timestamp,
	]);

	// 2. Decrementar estoque
	produtosSheet.getRange(produtoRow, 5).setValue(estoqueAtual - quantidade);
	produtosSheet.getRange(produtoRow, 9).setValue(timestamp);

	// 3. Registrar movimentação
	const movSheet = getSheet("Movimentacoes");
	movSheet.appendRow([
		generateId(),
		produtoId,
		"saida",
		quantidade,
		"venda",
		usuarioEmail,
		timestamp,
	]);

	return createJsonResponse({ id, total });
}
