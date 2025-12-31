# 🏡 Wanderlust – Airbnb Clone

Wanderlust is a full-stack Airbnb-style web application built using **Node.js, Express, MongoDB, and EJS**.  
This project is inspired by the **Apna College Web Development Tutorial** and focuses on building strong backend fundamentals with real-world features.

---

## 🚀 Features

### 🏘️ Listings
- Create, view, edit, and delete property listings
- Each listing includes:
  - Title
  - Description
  - Price
  - Location & Country
  - Image URL (default image supported)

### ⭐ Reviews
- Add reviews to listings
- Rating system (1–5)
- Comment support
- Delete reviews
- Reviews are linked to listings using MongoDB relationships

### 🔐 Validations & Error Handling
- Server-side validation using Joi
- Custom error handling middleware
- Confirmation prompt before deletion
- Graceful handling of invalid routes

### 🎨 UI
- Responsive design with Bootstrap
- EJS templating
- Clean and simple card-based layout

---

## 🛠️ Tech Stack

**Frontend**
- EJS
- Bootstrap 5
- HTML5
- CSS3

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose

**Utilities**
- Method-Override
- Joi
- Express Error Middleware

---

## 📁 Project Structure
Wanderlust/
│
├── models/
│ ├── listing.js
│ └── review.js
│
├── routes/
│ ├── listings.js
│ └── reviews.js
│
├── views/
│ ├── layouts/
│ │ └── boilerplate.ejs
│ ├── listings/
│ │ ├── index.ejs
│ │ ├── show.ejs
│ │ ├── new.ejs
│ │ └── edit.ejs
│
├── public/
│ ├── css/
│ └── js/
│
├── utils/
│ ├── ExpressError.js
│ └── wrapAsync.js
│
├── app.js
├── package.json
└── README.md
