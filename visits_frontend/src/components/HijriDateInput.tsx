import { Input } from './ui/input';

interface HijriDateInputProps {
    value: string; // Hijri date in YYYY-MM-DD format
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    min?: string;
    max?: string;
    required?: boolean;
}

/**
 * Simple Hijri date input component
 * Accepts and returns dates in Hijri format (YYYY-MM-DD)
 * Uses a text input with pattern validation
 */
export function HijriDateInput({
    value,
    onChange,
    placeholder = 'YYYY-MM-DD',
    className,
    min,
    max,
    required
}: HijriDateInputProps) {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    return (
        <Input
            type="text"
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            className={className}
            pattern="\d{4}-\d{2}-\d{2}"
            title="Hijri date in format YYYY-MM-DD (e.g., 1446-08-15)"
            required={required}
        />
    );
}
