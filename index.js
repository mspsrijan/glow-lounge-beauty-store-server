const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@glowloungebeautystore.3a1gf4x.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const brandCollection = client
      .db("GlowLoungeBeautyStore")
      .collection("brands");

    const brandBannersCollection = client
      .db("GlowLoungeBeautyStore")
      .collection("brandBanners");

    const productsCollection = client
      .db("GlowLoungeBeautyStore")
      .collection("products");

    app.get("/brands", async (req, res) => {
      const brands = await brandCollection.find().toArray();
      res.send(brands);
    });

    app.get("/brand/:brandId/products", async (req, res) => {
      const brandId = req.params.brandId;
      const products = await productsCollection.find({ brandId }).toArray();
      res.send(products);
    });

    app.get("/brand/:brandId/banners", async (req, res) => {
      const brandId = req.params.brandId;
      const brandBanners = await brandBannersCollection
        .find({ brandId })
        .toArray();
      res.send(brandBanners);
    });

    app.post("/brands", async (req, res) => {
      const newBrand = req.body;
      const result = await brandCollection.insertOne(newBrand);
      res.send(result);
    });

    app.post("/brand/:brandId/products", async (req, res) => {
      const brandId = req.params.brandId;
      const newProduct = req.body;
      const result = await productsCollection.insertOne(newProduct);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    //await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Glow Launge Beauty Store Server");
});

app.listen(port);
