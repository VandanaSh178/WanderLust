const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

// ======================
// DATABASE CONNECTION
// ======================
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => console.log("connected to DB"))
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
// SHOW ROUTE
// ======================
app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ExpressError("Invalid Listing ID", 400);
    }

    const listing = await Listing.findById(id);

    if (!listing) {
      throw new ExpressError("Listing not found", 404);
    }

    res.render("listings/show.ejs", { listing });
  })
);

// ======================
// CREATE ROUTE
// ======================
app.post(
  "/listings",
  wrapAsync(async (req, res) => {
    if (!req.body.listing) {
      throw new ExpressError("Invalid Listing Data", 400);
    }
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
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
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ExpressError("Invalid Listing ID", 400);
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      id,
      req.body.listing,
      { new: true }
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

// ======================
// 404 HANDLER
// ======================
app.use((req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});


// ======================
// ERROR HANDLER
// ======================
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  res.status(statusCode).render("error", { err });
});


// ======================
// SERVER
// ======================
app.listen(8080, () => {
  console.log("server is listening on port 8080");
});
