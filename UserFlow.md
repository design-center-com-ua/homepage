# User Flow - Design Center Website Reconstruction

This document outlines the user flow, page structure, and interactive states of the recreated Design Center website, built using HTML, Tailwind CSS (Modern Dark/Zinc aesthetic), and TypeScript.

---

## 1. Site Map & Navigation Hierarchy

```mermaid
graph TD
    Home[Main Page: Home / Головна]
    Products[Services & Works / Наші роботи]
    About[About Us / Про нас]
    ContactModal[Contact Form Modal / Напишіть нам]

    Home -->|Click Nav: Products| Products
    Home -->|Click Nav: About Us| About
    Home -->|Click "Всі роботи"| Products
    Home -->|Click "Зв'язатись з нами"| ContactModal

    Products -->|Click Nav: Home| Home
    Products -->|Click Nav: About Us| About
    Products -->|Click Call to Action| ContactModal

    About -->|Click Nav: Home| Home
    About -->|Click Nav: Products| Products
    About -->|Click Phone / Call| ContactModal
```

---

## 2. Core User Flows

### Flow A: Service Discovery & Portfolio Review
1. **Entry**: User lands on the **Home** page.
2. **Hero Slide Show**: User views the initial high-quality imagery of signs, facades, printing, and metal structures.
3. **Services Overview**: User scrolls down to the grid of core categories (Вивіски, Фасади, Металоконструкції, Поліграфія). Hovering reveals micro-animations and descriptions.
4. **Recent Works Gallery**: User interacts with a visual masonry gallery displaying recent work items. Hovering displays the item title and tag.
5. **Deeper Dive**: User clicks "Всі роботи" (All Works) or the "Products" navigation link.
6. **Detailed Services Page**: User reviews subcategories (e.g., entrance groups, welding, POS printing, furniture) and details.
7. **Action**: User clicks the "Написати нам" (Write to Us) or phone call button.

### Flow B: About the Company & Credentials
1. **Entry**: User clicks "About Us" in the header menu or footer.
2. **Who We Are**: User reads about the 20+ years of history, experience, and the Lutsk location.
3. **Experience Countup**: Scroll-triggered counting animation for "20 років досвіду" (20 years of experience).
4. **Team/Founders Section**: User reviews founders/key team cards. Hovering reveals additional details or roles.
5. **Call to Action**: User clicks the quick-call phone number to request a quote.

### Flow C: Client Inquiry / Contact Submission
1. **Trigger**: User clicks "Зв'язатись з нами", "Написати нам", or "Написати нам" button in the footer/side menu.
2. **Interaction**: A smooth modal slides/fades into view with a backdrop blur.
3. **Form Entry**:
   - User inputs Name (required)
   - User inputs Email (required)
   - User inputs Subject (required)
   - User inputs Message (optional)
4. **Validation**: TypeScript client-side validator validates fields. Helpful error/success states animate.
5. **Submission**: User submits the form. A success banner animates, and the modal auto-closes after 2 seconds.

---

## 3. Interactive States & Micro-animations

- **Navbar**: Sticky header changes opacity/size on scroll.
- **Side Panel Menu**: For mobile/responsive layout, a slide-out hamburger menu with smooth transitions.
- **Service Cards**: Hovering zooms in target background images and transitions text overlays with lime green (#b6ce01) borders.
- **Masonry Gallery**: Image scaling/reveal animations when loaded and hovered.
- **Testimonial Slider**: Auto-rotating carousel with drag/swipe support and fade transitions.
- **Modal View**: Scale-up and backdrop blur entrance animations.
