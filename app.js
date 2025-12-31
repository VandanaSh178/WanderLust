const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");
const Review = require("./models/review.js");

// ======================
// DATABASE CONNECTION
// ======================
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

// ======================
// APP CONFIG
// ======================
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ======================
// VALIDATION MIDDLEWARE
// ======================
const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body.listing);

  if (error) {
    const errMsg = error.details.map(el => el.message).join(", ");
    throw new ExpressError(errMsg, 400);
  }
  next();
};

// ======================
// ROOT ROUTE
// ======================
app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

// ======================
// INDEX ROUTE
// ======================
app.get(
  "/listings",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  })
);

// ======================
// NEW ROUTE
// ======================
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

// ======================
// CREATE ROUTE
// ======================
app.post(
  "/listings",
  validateListing,
  wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
  })
);

// ======================
// SHOW ROUTE
// ======================
app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ExpressError("Invalid Listing ID", 400);
    }

    const listing = await Listing.findById(id).populate("reviews");
    if (!listing) {
      throw new ExpressError("Listing not found", 404);
    }

    res.render("listings/show.ejs", { listing });
  })
);

// ======================
// EDIT ROUTE
// ======================
app.get(
  "/listings/:id/edit",
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ExpressError("Invalid Listing ID", 400);
    }

    const listing = await Listing.findById(id);
    if (!listing) {
      throw new ExpressError("Listing not found", 404);
    }

    res.render("listings/edit.ejs", { listing });
  })
);

// ======================
// UPDATE ROUTE
// ======================
app.put(
  "/listings/:id",
  validateListing,
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ExpressError("Invalid Listing ID", 400);
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      id,
      req.body.listing,
      { new: true, runValidators: true }
    );

    if (!updatedListing) {
      throw new ExpressError("Listing not found", 404);
    }

    res.redirect(`/listings/${id}`);
  })
);

// ======================
// DELETE ROUTE
// ======================
app.delete(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ExpressError("Invalid Listing ID", 400);
    }

    const deletedListing = await Listing.findByIdAndDelete(id);
    if (!deletedListing) {
      throw new ExpressError("Listing not found", 404);
    }

    res.redirect("/listings");
  })
);

// REVIEW ROUTES WOULD GO HERE
app.post(
  "/listings/:id/reviews",
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    // ✅ ObjectId validation
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ExpressError("Invalid Listing ID", 400);
    }

    // ✅ Find listing
    const listing = await Listing.findById(id);
    if (!listing) {
      throw new ExpressError("Listing not found", 404);
    }

    // ✅ Create & save review
    const newReview = new Review(req.body.review);
    await newReview.save();

    // ✅ Push review _id (best practice)
    listing.reviews.push(newReview._id);
    await listing.save();

    res.redirect(`/listings/${id}`);
  })
);

// DELETE REVIEWS
app.delete(
  "/listings/:id/reviews/:reviewId",
  wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    // 1️⃣ Remove review reference from listing
    await Listing.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId },
    });

    // 2️⃣ Delete review document
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
  })
);

// ======================
// 404 HANDLER (NODE 22 SAFE)
// ======================
app.use((req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

// ======================
// ERROR HANDLER
// ======================
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong";
  res.status(statusCode).render("error.ejs", { err });
});

// ======================
// SERVER
// ======================
app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});
