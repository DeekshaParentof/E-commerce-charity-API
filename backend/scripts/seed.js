// Seeds a super admin plus demo category, charity and products.
// Safe to re-run: existing records (matched by email / title / name) are reused.
// Usage: npm run seed
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("../models/userSchema");
const Category = require("../models/categorySchema");
const Charity = require("../models/charitySchema");
const Product = require("../models/productSchema");

const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@charityshop.org";
const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Admin@123";

// Demo photos live in frontend/public/demo (see CREDITS.md there), so by default
// they're served by the frontend itself. Set DEMO_IMAGE_BASE_URL to host them elsewhere.
const imageBase = (process.env.DEMO_IMAGE_BASE_URL || "/demo").replace(/\/$/, "");
const image = (file) => `${imageBase}/${file}.jpg`;

const categories = [
    { title: "Handicrafts", image: image("category-handicrafts") },
    { title: "Books", image: image("category-books") },
    { title: "Home Decor", image: image("category-home-decor") },
];

// `formerly` lists old demo titles so re-running the seed updates them in place.
const products = [
    { title: "Handwoven Basket", image: "handwoven-basket", category: "Handicrafts", price: 499, discount: 10, short_description: "Colorful weave", long_description: "Handwoven grass baskets made by village artisans." },
    { title: "Clay Diya Set", image: "clay-diya-set", category: "Home Decor", price: 249, discount: 0, short_description: "Set of 6 diyas", long_description: "Handmade clay lamps for festivals and every day." },
    { title: "Story Book Bundle", image: "story-book-bundle", category: "Books", price: 799, discount: 15, short_description: "Set of 5 books", long_description: "Pre-loved classic stories donated by readers." },
    { title: "Block Print Cushion", image: "block-print-cushion", category: "Home Decor", price: 399, discount: 5, short_description: "Cotton cover", long_description: "Hand block-printed cushion cover, 16x16 inches." },
    { title: "Upcycled Pen Stand", formerly: ["Bamboo Pen Stand"], image: "upcycled-pen-stand", category: "Handicrafts", price: 199, discount: 0, short_description: "Tin can holder", long_description: "Pen holders upcycled from tin cans, handmade." },
    { title: "Recycled Notebook", image: "recycled-notebook", category: "Books", price: 149, discount: 0, short_description: "Recycled paper", long_description: "A5 notebook made from 100% recycled paper." },
];

// Creates the record, or (if it exists) refreshes only the `refresh` fields
// so stock, prices and status changed since seeding are left alone.
async function upsert(Model, filter, doc, refresh = {}) {
    const existing = await Model.findOne(filter);
    if (!existing) return Model.create(doc);
    if (Object.keys(refresh).length) {
        existing.set(refresh);
        await existing.save();
    }
    return existing;
}

async function seed() {
    if (!process.env.MONGO_URL) throw new Error("MONGO_URL is not set");
    await mongoose.connect(process.env.MONGO_URL);

    const admin = await upsert(User, { email: adminEmail }, {
        name: "Super Admin",
        email: adminEmail,
        mobile: "9000000000",
        password: await bcrypt.hash(adminPassword, 10),
        role: "super_admin",
    });

    const categoryDocs = {};
    for (const c of categories) {
        categoryDocs[c.title] = await upsert(Category, { title: c.title }, { ...c, user_id: admin._id }, { image: c.image });
    }

    const now = new Date();
    const inSixMonths = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
    const charity = await upsert(Charity, { name: "EducateEveryChild" }, {
        name: "EducateEveryChild",
        description: "Funding school supplies for children in rural communities.",
        banner: image("charity-banner"),
        user_id: admin._id,
        charity_email: "contact@educateeverychild.org",
        start_date: now.toISOString().split(".")[0] + "Z",
        end_date: inSixMonths.toISOString().split(".")[0] + "Z",
        status: "live",
    }, { banner: image("charity-banner") });

    for (const p of products) {
        const display = {
            title: p.title,
            short_description: p.short_description,
            long_description: p.long_description,
            image: image(p.image),
        };
        await upsert(Product, { title: { $in: [p.title, ...(p.formerly || [])] } }, {
            ...display,
            price: p.price,
            discount: p.discount,
            quantity: 30,
            status: "active",
            user_id: admin._id,
            charity_id: charity._id,
            category_id: categoryDocs[p.category]._id,
        }, display);
    }

    console.log("Seed complete");
    console.log(`  Super admin: ${adminEmail}`);
    console.log(`  Categories:  ${categories.length}, Products: ${products.length}, Charity: ${charity.name}`);
}

seed()
    .catch((err) => {
        console.error("Seed failed:", err.message);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
