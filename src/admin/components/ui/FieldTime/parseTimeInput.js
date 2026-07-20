/**
 * Parse HH:MM time input.
 *
 * Supported examples:
 * - 01:30 → 1h 30m
 * - 2:45 → 2h 45m
 * - 5:4 → 5h 40m (single minute digit = tens)
 */
export const parseTimeInput = (value) => {
	const trimmed = value.trim();

	if (!trimmed) {
		return { valid: false };
	}

	const match = trimmed.match(/^(\d{1,2}):(\d{1,2})$/);

	if (!match) {
		return { valid: false };
	}

	const hours = parseInt(match[1], 10);
	const minuteDigits = match[2];
	const minutes = minuteDigits.length === 1
		? parseInt(minuteDigits, 10) * 10
		: parseInt(minuteDigits, 10);

	if (Number.isNaN(hours) || Number.isNaN(minutes) || hours < 0 || minutes < 0 || minutes >= 60) {
		return { valid: false };
	}

	return { valid: true, hours, minutes };
};
