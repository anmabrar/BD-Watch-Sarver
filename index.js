const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const { config } = require("dotenv");
const { ChangeStream } = require("mongodb")

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

//middleware

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bselz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


app.get("/", (req, res) => {
  res.send("Hello Watch World!");
});

client.connect((err) =>{

    const watchProduct = client.db("BDwatch").collection("Product");
    const purchaseProduct = client.db("BDwatch").collection("purchase");
    const myReview = client.db("BDwatch").collection("review");

    // add Product

    app.post("/addProduct", async (req, res) => {
    const result = await watchProduct.insertOne(req.body);
    res.send(result);
  });

  // get all products
  app.get("/allProduct", async (req, res) => {
    const result = await watchProduct.find({}).toArray();
    res.send(result);
  });

   // get single product
   app.get("/purchaseProduct/:id", async (req, res) => {
    const result = await watchProduct
      .find({ _id: ObjectId(req.params.id) })
      .toArray();
    res.send(result[0]);
  });

  // confirm order
  app.post("/confirmOrder", async (req, res) => {
    const result = await purchaseProduct.insertOne(req.body);
    res.send(result);
  });

   // my confirmOrder

   app.get("/myOrders/:email", async (req, res) => {
    const result = await purchaseProduct
      .find({ email: req.params.email })
      .toArray();
      res.send(result);
  });

  // delete order

  app.delete("/deleteOrder/:id", async (req, res) => {
    const result = await purchaseProduct.deleteOne({
      _id: ObjectId(req.params.id),
    });
    res.send(result);
  });

    // all order
    app.get("/manageOrders", async (req, res) => {
      const result = await purchaseProduct.find({}).toArray();
      res.send(result);
    });
  
    // update statuses
  
    app.put("/updateStatus/:id", (req, res) => {
      const id = req.params.id;
      const updatedStatus = req.body.status;
      const filter = { _id: ObjectId(id) };
      console.log(updatedStatus);
      purchaseProduct
        .updateOne(filter, {
          $set: { status: updatedStatus },
        })
        .then((result) => {
          res.send(result);
        });
    });

     // add Review

     app.post("/addReview", async (req, res) => {
      const result = await myReview.insertOne(req.body);
      res.send(result);
    });

     // get all reviews
  app.get("/reviews", async (req, res) => {
    const result = await myReview.find({}).toArray();
    res.send(result);
  });
  


});
app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`);
  });