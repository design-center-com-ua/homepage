# API & Data Schema - Design Center Website Reconstruction

This document defines the structured data formats used client-side for portfolio rendering, customer testimonials, and contact form submissions.

---

## 1. Contact Form Inquiry Schema

This schema validates the data entered by the user in the contact form before submission.

### Data Interface (TypeScript)
```typescript
interface ContactInquiry {
  name: string;      // Required, length 2-100 characters
  email: string;     // Required, must match valid email regex pattern
  subject: string;   // Required, length 3-200 characters
  message?: string;  // Optional, max length 2000 characters
}
```

### Validation Rules
- **name**: `trim().length >= 2`
- **email**: `/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)`
- **subject**: `trim().length >= 3`
- **message**: `length <= 2000`

---

## 2. Portfolio Item Data Schema

Used to dynamically render the gallery list and filter by categories.

### Data Interface (TypeScript)
```typescript
interface PortfolioItem {
  id: string;
  title: string;
  category: 'branding' | 'facades' | 'signage' | 'metal' | 'printing' | 'interior' | 'welding';
  categoryLabel: string; // User-friendly Ukrainian label (e.g. "Поліграфія")
  imageUrl: string;
  projectUrl?: string; // Deep link to project details if applicable
  description?: string;
}
```

### Static Data Structure
The portfolio item list will be hardcoded in TypeScript as:
```typescript
const PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: "1",
    title: "Business Cards",
    category: "branding",
    categoryLabel: "Брендування / Поліграфія",
    imageUrl: "/assets/images/portfolio/h5-portfolio-img-1.jpg"
  },
  {
    id: "2",
    title: "Cool Joe branding",
    category: "branding",
    categoryLabel: "Брендування / Поліграфія",
    imageUrl: "/assets/images/portfolio/h5-portfolio-img-2.jpg"
  },
  {
    id: "3",
    title: "Branding Done Right",
    category: "branding",
    categoryLabel: "Брендування",
    imageUrl: "/assets/images/portfolio/h5-portfolio-img-3.jpg"
  },
  {
    id: "4",
    title: "Geometric graphics",
    category: "branding",
    categoryLabel: "Брендування",
    imageUrl: "/assets/images/portfolio/h5-portfolio-img-4.jpg"
  }
];
```

---

## 3. Testimonial Data Schema

Used to populate the customer testimonials slider.

### Data Interface (TypeScript)
```typescript
interface Testimonial {
  id: string;
  text: string;          // Customer quote in Ukrainian
  author: string;        // Name of the customer / company
  avatarUrl?: string;    // Optional thumbnail image
}
```

### Static Data Structure
```typescript
const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    text: "Замовляли вивіску для магазину — все виконано якісно та швидко! Дуже задоволені результатом, дякуємо Дизайн Центру!",
    author: "Modul+"
  },
  {
    id: "2",
    text: "Потрібна була вхідна група для офісу, і Дизайн Центр зробей все ідеально. Дуже професійний підхід до клієнта!",
    author: "Mafia Clubs"
  },
  {
    id: "3",
    text: "Замовили рекламну конструкцію — отримали відмінний сервіс та чудовий результат. Рекомендуємо всім!",
    author: "Довженко"
  },
  {
    id: "4",
    text: "Поліграфія вищого рівня! Швидко, якісно і за розумні гроші. Дуже вдячна за роботу!",
    author: "Назва Компанії"
  },
  {
    id: "5",
    text: "Робили монтаж вивіски для нашого кафе — все було зроблено на відмінно! Дуже приємні люди й професіонали своєї справи.",
    author: "Сoffe Caffee"
  },
  {
    id: "6",
    text: "Замовляли виготовлення металоконструкцій, і результат перевершив наші очікування. Надійно, якісно, вчасно!",
    author: "Metal Board"
  },
  {
    id: "7",
    text: "Вивіска для салону вийшла просто ідеальною! Якість матеріалів та виконання на висоті. Рекомендуємо!",
    author: "Перукарня"
  },
  {
    id: "8",
    text: "Співпрацювали з компанією вже не раз — кожного разу все на високому рівні. Дякуємо за поліграфію і конструкції!",
    author: "Металобааз"
  }
];
```
