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

const image = (seed) => `https://picsum.photos/seed/${seed}/600/450`;

const categories = [
    { title: "Handicrafts", image: image("handicrafts") },
    { title: "Books", image: image("books") },
    { title: "Home Decor", image: image("homedecor") },
];

const products = [
    { title: "Handwoven Basket", category: "Handicrafts", price: 499, discount: 10, short_description: "Natural jute", long_description: "Handwoven by artisans from local villages." },
    { title: "Clay Diya Set", category: "Home Decor", price: 249, discount: 0, short_description: "Set of 6 diyas", long_description: "Hand-painted clay lamps for every occasion." },
    { title: "Story Book Bundle", category: "Books", price: 799, discount: 15, short_description: "5 kids books", long_description: "Illustrated stories donated by local writers." },
    { title: "Block Print Cushion", category: "Home Decor", price: 399, discount: 5, short_description: "Cotton cover", long_description: "Hand block-printed cushion cover, 16x16 inches." },
    { title: "Bamboo Pen Stand", category: "Handicrafts", price: 199, discount: 0, short_description: "Eco pen stand", long_description: "Sustainable bamboo desk organiser, handmade." },
    { title: "Recycled Notebook", category: "Books", price: 149, discount: 0, short_description: "Recycled paper", long_description: "A5 notebook made from 100% recycled paper." },
];

async function upsert(Model, filter, doc) {
    const existing = await Model.findOne(filter);
    if (existing) return existing;
    return Model.create(doc);
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
        categoryDocs[c.title] = await upsert(Category, { title: c.title }, { ...c, user_id: admin._id });
    }

    const now = new Date();
    const inSixMonths = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
    const charity = await upsert(Charity, { name: "EducateEveryChild" }, {
        name: "EducateEveryChild",
        description: "Funding school supplies for children in rural communities.",
        banner: image("charity"),
        user_id: admin._id,
        charity_email: "contact@educateeverychild.org",
        start_date: now.toISOString().split(".")[0] + "Z",
        end_date: inSixMonths.toISOString().split(".")[0] + "Z",
        status: "live",
    });

    for (const p of products) {
        await upsert(Product, { title: p.title }, {
            title: p.title,
            short_description: p.short_description,
            long_description: p.long_description,
            price: p.price,
            discount: p.discount,
            quantity: 30,
            status: "active",
            image: image(p.title.replace(/\s+/g, "-").toLowerCase()),
            user_id: admin._id,
            charity_id: charity._id,
            category_id: categoryDocs[p.category]._id,
        });
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
