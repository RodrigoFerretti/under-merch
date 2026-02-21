function doGet(e: GoogleAppsScript.Events.DoGet): GoogleAppsScript.Content.TextOutput {
	try {
		const action = e.parameter.action;
		const idToken = e.parameter.idToken;

		if (!idToken) {
			return createJsonResponse({ error: "Token não fornecido." }, 401);
		}

		const user = authenticate(idToken);

		switch (action) {
			case "getProducts":
				checkPermission(user.role, "getProducts");
				return getProducts();

			case "getVendas":
				checkPermission(user.role, "getVendas");
				return getVendas();

			case "getMovimentacoes":
				checkPermission(user.role, "getMovimentacoes");
				return getMovimentacoes();

			case "getUsuarios":
				checkPermission(user.role, "manageUsers");
				return getUsuarios();

			default:
				return createJsonResponse({ error: `Ação desconhecida: ${action}` }, 400);
		}
	} catch (err) {
		const message = err instanceof Error ? err.message : "Erro desconhecido.";
		return createJsonResponse({ error: message }, 500);
	}
}

function doPost(e: GoogleAppsScript.Events.DoPost): GoogleAppsScript.Content.TextOutput {
	try {
		const payload = JSON.parse(e.postData.contents);
		const { action, idToken } = payload;

		if (action === "login") {
			if (!idToken) {
				return createJsonResponse({ error: "Token não fornecido." }, 401);
			}
			const user = authenticate(idToken);
			return createJsonResponse(user);
		}

		if (!idToken) {
			return createJsonResponse({ error: "Token não fornecido." }, 401);
		}

		const user = authenticate(idToken);

		switch (action) {
			case "createProduct":
				checkPermission(user.role, "createProduct");
				return createProduct(payload);

			case "updateProduct":
				checkPermission(user.role, "updateProduct");
				return updateProduct(payload);

			case "deleteProduct":
				checkPermission(user.role, "deleteProduct");
				return deleteProduct(payload.id);

			case "registerSale":
				checkPermission(user.role, "registerSale");
				return registrarVenda(payload, user.email);

			case "stockIn":
				checkPermission(user.role, "stockIn");
				return registrarEntrada(payload, user.email);

			case "stockOut":
				checkPermission(user.role, "stockOut");
				return registrarSaida(payload, user.email);

			case "addUsuario":
				checkPermission(user.role, "manageUsers");
				return addUsuario(payload);

			case "removeUsuario":
				checkPermission(user.role, "manageUsers");
				return removeUsuario(payload.email);

			default:
				return createJsonResponse({ error: `Ação desconhecida: ${action}` }, 400);
		}
	} catch (err) {
		const message = err instanceof Error ? err.message : "Erro desconhecido.";
		return createJsonResponse({ error: message }, 500);
	}
}
