# @repo/utils

Shared utility functions for the school ecosystem.

## Installation

This is an internal workspace package. Import from your app:

```typescript
import { slugify, formatCurrency, isEmail } from '@repo/utils';
```

## Utilities

### String

- `slugify(text)` - Convert to URL-friendly slug
- `truncate(text, length)` - Truncate with ellipsis
- `capitalize(text)` - Capitalize words
- `capitalizeFirst(text)` - Capitalize first letter only
- `randomString(length)` - Generate random string
- `getInitials(name)` - Extract initials

### Date

- `formatDate(date, format)` - Format date in Indonesian
- `formatTime(date)` - Format time (HH:mm)
- `formatDateTime(date)` - Format date and time
- `timeAgo(date)` - Relative time (e.g., "1 jam yang lalu")
- `isToday(date)` - Check if date is today
- `getAcademicYear(date)` - Get academic year (July-June)

### Number

- `formatCurrency(amount)` - Format as Rupiah
- `formatPercentage(value)` - Format as percentage
- `formatNumber(num)` - Format with thousand separators
- `clamp(value, min, max)` - Clamp between min and max
- `roundTo(num, decimals)` - Round to decimal places
- `randomInt(min, max)` - Generate random integer

### Array

- `unique(array)` - Remove duplicates
- `groupBy(array, key)` - Group by key
- `chunk(array, size)` - Split into chunks
- `shuffle(array)` - Shuffle randomly
- `randomItem(array)` - Get random item
- `sortBy(array, key, order)` - Sort by key

### Object

- `pick(obj, keys)` - Pick specific keys
- `omit(obj, keys)` - Omit specific keys
- `deepMerge(target, source)` - Deep merge objects
- `isObject(value)` - Check if plain object
- `deepClone(obj)` - Deep clone object

### Validation

- `isEmail(email)` - Validate email
- `isPhone(phone)` - Validate Indonesian phone
- `isURL(url)` - Validate URL
- `isNIK(nik)` - Validate NIK (16 digits)
- `isNISN(nisn)` - Validate NISN (10 digits)
- `isEmpty(str)` - Check empty string
- `isStrongPassword(password)` - Validate password strength

## Examples

```typescript
import {
  formatCurrency,
  slugify,
  isEmail,
  formatDate,
  unique,
} from '@repo/utils';

// Currency
formatCurrency(1000000); // "Rp 1.000.000"

// String
slugify('Hello World!'); // "hello-world"

// Validation
isEmail('test@example.com'); // true

// Date
formatDate(new Date(), 'dd MMM yyyy'); // "19 Des 2024"

// Array
unique([1, 2, 2, 3]); // [1, 2, 3]
```

## Development

```bash
# Type check
pnpm type-check

# Lint
pnpm lint
```

## License

Private - Internal use only
