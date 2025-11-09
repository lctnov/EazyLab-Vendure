export function generateCode(index: number = 1) {
	const now = new Date();
	const yy = now.getFullYear().toString().slice(-2);
	const mm = String(now.getMonth() + 1).padStart(2, '0');
	const dd = String(now.getDate()).padStart(2, '0');
	const seq = String(index).padStart(4, '0');
	return `${yy}${mm}${dd}-${seq}`;
}
