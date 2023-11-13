const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

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

    const usersCollection = client
      .db("GlowLoungeBeautyStore")
      .collection("users");

    const cartCollection = client
      .db("GlowLoungeBeautyStore")
      .collection("cart");

    app.get("/brands", async (req, res) => {
      const brands = await brandCollection.find().toArray();
      res.send(brands);
    });

    app.get("/products", async (req, res) => {
      const products = await productsCollection.find().toArray();
      res.send(products);
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

    app.get("/product/:productId", async (req, res) => {
      const productId = req.params.productId;
      const query = { _id: new ObjectId(productId) };
      const product = await productsCollection.findOne(query);
      res.send(product);
    });

    app.get("/users", async (req, res) => {
      const users = await usersCollection.find().toArray();
      res.send(users);
    });

    app.get("/cart", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/brands", async (req, res) => {
      const newBrand = req.body;
      const result = await brandCollection.insertOne(newBrand);
      res.send(result);
    });

    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      const brand = await brandCollection.findOne({
        _id: new ObjectId(newProduct.brandId),
      });

      newProduct.brandName = brand.name;

      const result = await productsCollection.insertOne(newProduct);
      res.send(result);
    });

    app.post("/user", async (req, res) => {
      const newUser = req.body;
      const user = await usersCollection.insertOne(newUser);
      res.send(user);
    });

    app.post("/cart", async (req, res) => {
      const cartItem = req.body;
      const result = await cartCollection.insertOne(cartItem);
      res.send(result);
    });

    app.put("/product/:productId", async (req, res) => {
      const productId = req.params.productId;
      const updatedProduct = req.body;

      const brand = await brandCollection.findOne({
        _id: new ObjectId(updatedProduct.brandId),
      });

      if (brand) {
        updatedProduct.brandName = brand.name;

        const result = await productsCollection.updateOne(
          { _id: new ObjectId(productId) },
          { $set: updatedProduct }
        );
        res.send(result);
      }
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
