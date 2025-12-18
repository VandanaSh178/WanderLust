const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate=require("ejs-mate");

// ======================
// DATABASE CONNECTION
// ======================
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

// ======================
// APP CONFIG
// ======================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

// ======================
// ROOT ROUTE
// ======================
app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

// ======================
// INDEX ROUTE
// ======================
app.get("/listings", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
});

// ======================
// NEW ROUTE
// ======================
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

// ======================
// SHOW ROUTE
// ======================
app.get("/listings/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid Listing ID");
  }

  const listing = await Listing.findById(id);

  if (!listing) {
    return res.status(404).send("Listing not found");
  }

  res.render("listings/show.ejs", { listing });
});

// ======================
// CREATE ROUTE
// ======================
app.post("/listings", async (req, res) => {
  try {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error creating listing");
  }
});

// ======================
// EDIT ROUTE
// ======================
app.get("/listings/:id/edit", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid Listing ID");
  }

  const listing = await Listing.findById(id);

  if (!listing) {
    return res.status(404).send("Listing not found");
  }

  res.render("listings/edit.ejs", { listing });
});

// ======================
// UPDATE ROUTE
// ======================
app.put("/listings/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid Listing ID");
  }

  const updatedListing = await Listing.findByIdAndUpdate(
    id,
    { ...req.body.listing },
    { new: true }
  );

  if (!updatedListing) {
    return res.status(404).send("Listing not found");
  }

  res.redirect(`/listings/${id}`);
});

// ======================
// DELETE ROUTE
// ======================
app.delete("/listings/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid Listing ID");
  }

  const deletedListing = await Listing.findByIdAndDelete(id);

  if (!deletedListing) {
    return res.status(404).send("Listing not found");
  }

  res.redirect("/listings");
});

// ======================
// SERVER
// ======================
app.listen(8080, () => {
  console.log("server is listening to port 8080");
});
