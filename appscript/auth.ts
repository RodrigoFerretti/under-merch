const PERMISSIONS: Record<string, string[]> = {
	getProducts: ["admin", "vendas", "estoque"],
	createProduct: ["admin"],
	updateProduct: ["admin"],
	deleteProduct: ["admin"],
	registerSale: ["admin", "vendas"],
	stockIn: ["admin", "estoque"],
	stockOut: ["admin", "estoque"],
	getVendas: ["admin", "vendas"],
	getMovimentacoes: ["admin", "estoque"],
	manageUsers: ["admin"],
};

interface TokenInfo {
	email: string;
	email_verified: string;
	error_description?: string;
}

interface UserInfo {
	email: string;
	role: string;
}

function verifyGoogleToken(idToken: string): string {
	const response = UrlFetchApp.fetch(
		`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`,
		{ muteHttpExceptions: true },
	);

	const data = JSON.parse(response.getContentText()) as TokenInfo;

	if (data.error_description) {
		throw new Error(`Token inválido: ${data.error_description}`);
	}

	if (data.email_verified !== "true") {
		throw new Error("E-mail não verificado.");
	}

	return data.email;
}

function checkAuth(email: string): UserInfo {
	const sheet = getSheet("Usuarios");
	const data = sheet.getDataRange().getValues();

	for (let i = 1; i < data.length; i++) {
		if (data[i][0] === email) {
			return { email: data[i][0], role: data[i][1] };
		}
	}

	throw new Error("Usuário não autorizado.");
}

function checkPermission(role: string, action: string): void {
	const allowed = PERMISSIONS[action];

	if (!allowed) {
		throw new Error(`Ação desconhecida: ${action}`);
	}

	if (!allowed.includes(role)) {
		throw new Error(`Sem permissão para: ${action}`);
	}
}

function authenticate(idToken: string): UserInfo {
	const email = verifyGoogleToken(idToken);
	return checkAuth(email);
}
