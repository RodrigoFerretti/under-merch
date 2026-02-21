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
			case "getProducts":
				checkPermission(user.role, "getProducts");
				return getProducts();

			case "getSkus":
				checkPermission(user.role, "getProducts");
				return getSkus();

			case "createSku":
				checkPermission(user.role, "createProduct");
				return createSku(payload);

			case "updateSku":
				checkPermission(user.role, "updateProduct");
				return updateSku(payload);

			case "deleteSku":
				checkPermission(user.role, "deleteProduct");
				return deleteSku(payload.id);

			case "getSales":
				checkPermission(user.role, "getSales");
				return getSales();

			case "getMovements":
				checkPermission(user.role, "getMovements");
				return getMovements();

			case "getUsers":
				checkPermission(user.role, "manageUsers");
				return getUsers();

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
				return registerSale(payload, user.email);

			case "stockIn":
				checkPermission(user.role, "stockIn");
				return registerStockIn(payload, user.email);

			case "stockOut":
				checkPermission(user.role, "stockOut");
				return registerStockOut(payload, user.email);

			case "addUser":
				checkPermission(user.role, "manageUsers");
				return addUser(payload);

			case "removeUser":
				checkPermission(user.role, "manageUsers");
				return removeUser(payload.email);

			default:
				return createJsonResponse({ error: `Ação desconhecida: ${action}` }, 400);
		}
	} catch (err) {
		const message = err instanceof Error ? err.message : "Erro desconhecido.";
		return createJsonResponse({ error: message }, 500);
	}
}
