const express = require('express')
const bodyParser = require("body-parser")
const cors = require('cors')
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qvvgh.mongodb.net/${process.env.DB_SERVER}?retryWrites=true&w=majority`;

const port = 5000
const app = express()

app.use(bodyParser.json())
app.use(cors())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const productCollection = client.db("emaJohnServer").collection("product");
    const ordersCollection = client.db("emaJohnStore").collection("orders");
    //post
    app.post("/addProduct", (req, res) =>{
        const products = req.body;
        productCollection.insertOne(products)
        .then(result => {
            res.send(result.insertedCount)
        })
    })
    //read
    app.get('/products', (req, res) => {
        productCollection.find({})
        .toArray((err, document) => {
            res.send(document)
        })
    })
    //read by key one product
    app.get('/product/:key', (req, res) => {
        productCollection.find({key: req.params.key})
            .toArray((err, document) => {
                res.send(document)
            })
    })

    //post one or more by key
    app.post('/productsByKeys', (req, res) => {
        const productKeys = req.body;
        console.log(productKeys)
        productCollection.find({key: {$in: productKeys}})
        .toArray((err, document) =>{
            res.send(document)
        })
    })

    //shipment data
    app.post('/addOrder', (req, res) => {
        const order = req.body;
        ordersCollection.insertOne(order)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })
});

app.listen(process.env.PORT || port)