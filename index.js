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
    const usersCollection = client.db("BDwatch").collection("users");

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

    // Manage all products
  app.get("/manageProducts", async (req, res) => {
    const result = await watchProduct.find({}).toArray();
    res.send(result);
  });

    // delete Product

    app.delete("/deleteProduct/:id", async (req, res) => {
      const result = await watchProduct.deleteOne({
        _id: ObjectId(req.params.id),
      });
      res.send(result);
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

// Add users
app.post('/users', async (req, res) => {
  const user = req.body;
  const result = await usersCollection.insertOne(user);
  console.log(result);
  res.json(result);
});

// Add users from google 
app.put('/users', async (req, res) => {
  const user = req.body;
  const filter = { email: user.email };
  const options = { upsert: true };
  const updateDoc = { $set: user };
  const result = await usersCollection.updateOne(filter, updateDoc, options);
  res.json(result);
});



// Make Admin

app.put('/users/admin', async (req,res) => {
  const user = req.body;
  const filter = {email: user.email};
  const updateDoc = {$set : {role : 'admin'}}
  const result = await usersCollection.updateOne(filter, updateDoc);
  res.json(result);
});





  app.get('/users/:email', async (req, res) => {
    const email = req.params.email;
    const query = { email: email };
    const user = await usersCollection.findOne(query);
    let isAdmin = false;
    if (user?.role === 'admin') {
        isAdmin = true;
    }
    res.json({ admin: isAdmin });
})


});
app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`);
  });