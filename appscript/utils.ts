function getSpreadsheetId(): string {
	const id = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
	if (!id) {
		throw new Error(
			'Propriedade "SPREADSHEET_ID" não configurada. Vá em Configurações do projeto → Propriedades do script.',
		);
	}

	return id;
}

function getSheet(name: string): GoogleAppsScript.Spreadsheet.Sheet {
	const ss = SpreadsheetApp.openById(getSpreadsheetId());

	const sheet = ss.getSheetByName(name);
	if (!sheet) {
		throw new Error(`Aba "${name}" não encontrada na planilha.`);
	}

	return sheet;
}

function generateId(): string {
	return Utilities.getUuid();
}

function now(): string {
	return new Date().toISOString();
}

function createJsonResponse(data: unknown, statusCode = 200): GoogleAppsScript.Content.TextOutput {
	const body = JSON.stringify({
		statusCode,
		...(typeof data === "object" && data !== null ? data : { data }),
	});

	return ContentService.createTextOutput(body).setMimeType(ContentService.MimeType.JSON);
}

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}
