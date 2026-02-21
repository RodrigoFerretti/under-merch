function crc16Ccitt(str: string): string {
	let crc = 0xffff;
	for (let i = 0; i < str.length; i++) {
		crc ^= str.charCodeAt(i) << 8;
		for (let j = 0; j < 8; j++) {
			if (crc & 0x8000) {
				crc = (crc << 1) ^ 0x1021;
			} else {
				crc = crc << 1;
			}
			crc &= 0xffff;
		}
	}
	return crc.toString(16).toUpperCase().padStart(4, "0");
}

function pixTlv(id: string, value: string): string {
	return id + value.length.toString().padStart(2, "0") + value;
}

function generatePixPayload(amount: number): string {
	const pixKey = PropertiesService.getScriptProperties().getProperty("PIX_KEY");
	if (!pixKey) {
		throw new Error(
			'Propriedade "PIX_KEY" não configurada. Vá em Configurações do projeto → Propriedades do script.',
		);
	}

	const merchantName = (
		PropertiesService.getScriptProperties().getProperty("PIX_MERCHANT_NAME") || "UnderMerch"
	).substring(0, 25);
	const merchantCity = (
		PropertiesService.getScriptProperties().getProperty("PIX_MERCHANT_CITY") || "SAO PAULO"
	).substring(0, 15);

	const merchantAcctInfo =
		pixTlv("00", "br.gov.bcb.pix") + pixTlv("01", pixKey);

	let payload = "";
	payload += pixTlv("00", "01");
	payload += pixTlv("26", merchantAcctInfo);
	payload += pixTlv("52", "0000");
	payload += pixTlv("53", "986");
	payload += pixTlv("54", amount.toFixed(2));
	payload += pixTlv("58", "BR");
	payload += pixTlv("59", merchantName);
	payload += pixTlv("60", merchantCity);
	payload += pixTlv("62", pixTlv("05", "***"));

	payload += "6304";
	payload += crc16Ccitt(payload);

	return payload;
}
