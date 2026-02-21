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

// Injected from GitHub secrets at deploy time.
const PIX_KEY_DEFAULT = "%%PIX_KEY%%";
const PIX_MERCHANT_NAME_DEFAULT = "%%PIX_MERCHANT_NAME%%";
const PIX_MERCHANT_CITY_DEFAULT = "%%PIX_MERCHANT_CITY%%";

function getPixSecret(key: string, buildDefault: string): string {
	const prop = PropertiesService.getScriptProperties().getProperty(key);
	if (prop) return prop;
	if (buildDefault && !buildDefault.startsWith("%%")) return buildDefault;
	throw new Error(
		`${key} não configurada. Adicione como GitHub secret ou em Propriedades do script.`,
	);
}

function generatePixPayload(amount: number): string {
	const pixKey = getPixSecret("PIX_KEY", PIX_KEY_DEFAULT);
	const merchantName = getPixSecret("PIX_MERCHANT_NAME", PIX_MERCHANT_NAME_DEFAULT).substring(0, 25);
	const merchantCity = getPixSecret("PIX_MERCHANT_CITY", PIX_MERCHANT_CITY_DEFAULT).substring(0, 15);

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
