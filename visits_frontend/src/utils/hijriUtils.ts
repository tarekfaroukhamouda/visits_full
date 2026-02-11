/**
 * Utility functions for Hijri date conversions using Intl.DateTimeFormat.
 */

export const GREGORIAN_CALENDAR = 'gregory';
export const HIJRI_CALENDAR = 'islamic-umalqura';

/**
 * Converts a Gregorian date to a Hijri date object.
 */
export function toHijri(date: Date) {
    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
    });
    const parts = formatter.formatToParts(date);
    const find = (type: string) => parts.find(p => p.type === type)?.value;
    return {
        year: parseInt(find('year') || '0'),
        month: parseInt(find('month') || '0'),
        day: parseInt(find('day') || '0'),
    };
}

/**
 * Formats a date to Hijri string (YYYY-MM-DD).
 */
export function formatHijri(date: Date): string {
    const h = toHijri(date);
    return `${h.year}-${h.month.toString().padStart(2, '0')}-${h.day.toString().padStart(2, '0')}`;
}

/**
 * Gets the Hijri month name.
 */
export function getHijriMonthName(month: number, locale: 'ar' | 'en' = 'ar'): string {
    const monthsAr = [
        'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الآخرة',
        'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
    ];
    const monthsEn = [
        'Muharram', 'Safar', "Rabi' al-awwal", "Rabi' al-thani", 'Jumada al-ula', 'Jumada al-akhira',
        'Rajab', "Sha'ban", 'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
    ];
    return locale === 'ar' ? monthsAr[month - 1] : monthsEn[month - 1];
}

/**
 * Approximates getting Gregorian date from Hijri (since Intl doesn't do it directly well).
 * We'll use a brute force approach or simple offset if needed, but for now we mainly display.
 * For actual selection, we'll need to map days correctly.
 */
export function fromHijri(year: number, month: number, day: number): Date {
    try {
        // Validate inputs
        if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) {
            return new Date(); // Return today as fallback
        }
        
        // Start with an approximate Gregorian date
        let date = new Date((year - 579) * 0.97 + 622, 0, 1);
        // Refine
        let h = toHijri(date);
        let diff = (year * 354 + month * 29 + day) - (h.year * 354 + h.month * 29 + h.day);
        date.setDate(date.getDate() + diff);

        // Further refine with safety limit
        for (let i = 0; i < 3; i++) { // Reduced iterations for safety
            h = toHijri(date);
            if (h.year === year && h.month === month && h.day === day) break;
            let hDays = h.year * 354.367 + (h.month - 1) * 29.5 + h.day;
            let targetDays = year * 354.367 + (month - 1) * 29.5 + day;
            const adjustment = Math.round(targetDays - hDays);
            if (Math.abs(adjustment) < 1) break; // Stop if adjustment is minimal
            date.setDate(date.getDate() + adjustment);
        }
        return date;
    } catch (e) {
        console.error('Error in fromHijri:', e);
        return new Date(); // Return today as fallback
    }
}

/**
 * Gets number of days in a Hijri month.
 * Hijri months are either 29 or 30 days.
 */
export function getDaysInHijriMonth(year: number, month: number): number {
    try {
        // Validate inputs
        if (month < 1 || month > 12) return 29;
        if (year < 1) return 29;
        
        const date = fromHijri(year, month, 29);
        date.setDate(date.getDate() + 1);
        const h = toHijri(date);
        if (h.month !== month) return 29;

        date.setDate(date.getDate() + 1);
        const h2 = toHijri(date);
        if (h2.month !== month) return 30;

        return 30; // Safety
    } catch (e) {
        // Default to 29 if calculation fails
        return 29;
    }
}

/**
 * Parses a Hijri date string in various formats (YYYY-MM-DD, DD-MM-YYYY, etc.)
 */
export function parseHijriDate(dateStr: string) {
    if (!dateStr) return null;
    const parts = dateStr.split(/[-/.]/);
    if (parts.length < 3) return null;

    const nums = parts.map(Number);
    if (nums.some(isNaN)) return null;

    let y, m, d;
    if (parts[0].length === 4) {
        // YYYY-MM-DD
        [y, m, d] = nums;
    } else if (parts[2].length === 4) {
        // DD-MM-YYYY
        [d, m, y] = nums;
    } else {
        // Guess based on magnitude
        const yearIndex = nums.findIndex(n => n > 1000);
        if (yearIndex === 0) [y, m, d] = nums;
        else if (yearIndex === 2) [d, m, y] = nums;
        else return null;
    }
    return { y, m, d };
}

/**
 * Gets the Hijri day name
 */
export function getHijriDayName(dayIndex: number, locale: 'ar' | 'en' = 'ar'): string {
    const daysAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const daysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return locale === 'ar' ? daysAr[dayIndex] : daysEn[dayIndex];
}

/**
 * Formats a Hijri date to a localized string
 */
export function formatHijriDate(date: Date, locale: 'ar' | 'en' = 'ar', format: 'short' | 'long' = 'short'): string {
    const h = toHijri(date);
    const monthName = getHijriMonthName(h.month, locale);
    
    if (locale === 'ar') {
        return format === 'short' 
            ? `${h.day}/${h.month}/${h.year}`
            : `${h.day} ${monthName} ${h.year} هـ`;
    } else {
        return format === 'short'
            ? `${h.day}/${h.month}/${h.year}`
            : `${monthName} ${h.day}, ${h.year} AH`;
    }
}

/**
 * Gets all days in a Hijri month
 */
export function getDaysInHijriMonthArray(year: number, month: number): number[] {
    const days: number[] = [];
    const firstDay = fromHijri(year, month, 1);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = getDaysInHijriMonth(year, month);
    
    // Add empty slots for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(0);
    }
    
    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
        days.push(day);
    }
    
    return days;
}

/**
 * Compares two Hijri dates (YYYY-MM-DD format)
 */
export function compareHijriDates(date1: string, date2: string): number {
    const d1 = new Date(convertGregorianToIslamic(date1));
    const d2 = new Date(convertGregorianToIslamic(date2));
    return d1.getTime() - d2.getTime();
}

/**
 * Convert Gregorian string to Islamic calendar (used for data storage compatibility)
 */
export function convertGregorianToIslamic(gregorianDateStr: string): string {
    const date = new Date(gregorianDateStr);
    return formatHijri(date);
}

/**
 * Check if two Hijri dates are the same day
 */
export function isSameHijriDay(date1: Date, date2: Date): boolean {
    const h1 = toHijri(date1);
    const h2 = toHijri(date2);
    return h1.year === h2.year && h1.month === h2.month && h1.day === h2.day;
}
