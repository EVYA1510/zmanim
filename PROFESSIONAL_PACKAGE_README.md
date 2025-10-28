# 🕐 Zmanim Calculator - Professional Package

## 📋 Package Overview

This is a complete, production-ready package for calculating Jewish prayer times (Zmanim) based on astronomical calculations. The package includes all necessary functions, documentation, and examples for immediate use in any JavaScript/TypeScript project.

## 📦 Package Contents

| File                           | Description             | Purpose                                                |
| ------------------------------ | ----------------------- | ------------------------------------------------------ |
| `zmanimCalculator.js`          | **Core Library**        | Main calculation engine with all prayer time functions |
| `ZMANIM_CALCULATIONS_GUIDE.md` | Technical Documentation | Detailed mathematical formulas and algorithms          |
| `CURSOR_USAGE_INSTRUCTIONS.md` | Implementation Guide    | Step-by-step usage instructions with code examples     |
| `package-example.json`         | Package Configuration   | Ready-to-use package.json template                     |
| `test-zmanim.js`               | Test Suite              | Comprehensive test file with examples                  |
| `README_FOR_CURSOR.md`         | Quick Start Guide       | Fast setup instructions                                |

## 🚀 Quick Start

### 1. Installation

```bash
npm install @hebcal/core
```

### 2. Basic Usage

```javascript
import { calculateZmanimExample } from "./zmanimCalculator.js";

const result = calculateZmanimExample(31.7683, -35.2137, "2024-01-15");
console.log("Sunrise:", result.formatted.zricha);
console.log("Sunset:", result.formatted.shkiya);
```

### 3. Test the Package

```bash
node test-zmanim.js
```

## 🎯 Key Features

- ✅ **Astronomical Accuracy**: Based on precise solar calculations
- ✅ **Global Support**: Works for any location worldwide
- ✅ **Multiple Time Zones**: Automatic timezone handling
- ✅ **Hebrew/English Labels**: Bilingual support included
- ✅ **Shabbat Times**: Automatic Shabbat calculation
- ✅ **Production Ready**: Tested and documented

## 📚 Documentation Structure

1. **zmanimCalculator.js** - The main library file
2. **ZMANIM_CALCULATIONS_GUIDE.md** - Technical documentation
3. **CURSOR_USAGE_INSTRUCTIONS.md** - Implementation guide
4. **test-zmanim.js** - Test examples
5. **README_FOR_CURSOR.md** - Quick reference

## 🔧 Technical Specifications

- **Language**: JavaScript ES6+ (ES Modules)
- **Dependencies**: @hebcal/core (Hebrew calendar)
- **Browser Support**: Modern browsers with ES6 support
- **Node.js**: Version 14.0.0+
- **Framework Agnostic**: Works with React, Vue, Angular, etc.

## 📱 Supported Prayer Times

### Morning Times

- Dawn (90 min before sunrise)
- Dawn (72 min before sunrise)
- Tallit & Tefillin time
- Sunrise
- Latest Shema (GRA/MGA)
- Latest Tefillah (GRA/MGA)

### Day Times

- Solar Noon (Midday)
- Mincha Gedola
- Mincha Ketana
- Sunset

### Evening Times

- Nightfall
- Midnight

### Shabbat Times

- Candle Lighting (22/30/40 min before sunset)
- Havdalah

## 🌍 Location Support

The package automatically handles:

- **Israel**: Automatic DST calculation
- **Global**: Any latitude/longitude coordinates
- **Time Zones**: Automatic timezone detection
- **DST**: Daylight saving time adjustments

## 📖 Usage Examples

### React Component

```jsx
import React, { useState, useEffect } from "react";
import { calculateZmanimExample } from "./zmanimCalculator.js";

function ZmanimDisplay({ lat, lng, date }) {
  const [zmanim, setZmanim] = useState(null);

  useEffect(() => {
    const result = calculateZmanimExample(lat, lng, date);
    setZmanim(result);
  }, [lat, lng, date]);

  return zmanim ? (
    <div>
      <h3>Prayer Times</h3>
      <p>Sunrise: {zmanim.formatted.zricha}</p>
      <p>Sunset: {zmanim.formatted.shkiya}</p>
    </div>
  ) : (
    <div>Loading...</div>
  );
}
```

### API Route (Next.js)

```javascript
import {
  calculateZmanInputs,
  getLocalOffsetHours,
} from "./zmanimCalculator.js";

export default function handler(req, res) {
  const { latitude, longitude, date } = req.body;

  const day = new Date(date + "T00:00:00.000Z");
  const shift = getLocalOffsetHours(day, "Asia/Jerusalem");
  const zmanim = calculateZmanInputs(day, shift, latitude, longitude);

  res.json(zmanim);
}
```

## 🧪 Testing

Run the comprehensive test suite:

```bash
node test-zmanim.js
```

This will test:

- Basic prayer time calculations
- Shabbat time calculations
- Different locations (Jerusalem, New York)
- Hebrew date conversion
- Label system
- Error handling

## 📋 Requirements

- Node.js 14.0.0 or higher
- Modern browser with ES6 support
- @hebcal/core package

## 🔒 License

This package is based on the original Zmanim Web project and is provided for educational and development purposes.

## 📞 Support

For technical questions or issues:

1. Check the test file for examples
2. Review the documentation files
3. Verify your coordinates and date format
4. Ensure proper timezone handling

---

**Ready for Production Use** ✅
**Fully Documented** ✅
**Tested and Verified** ✅
