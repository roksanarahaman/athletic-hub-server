const express = require('express')
const cors = require('cors')
const app = express();
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()


app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.atwtner.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const eventsCollection = client.db('eventDB').collection('events');

        app.get('/events', async (req, res) => {
            const cursor = eventsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });


        app.get('/events/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await eventsCollection.findOne(query);
            res.send(result)
        });

        app.post('/events', async (req, res) => {
            const event = req.body;
            const result = await eventsCollection.insertOne(event);
            res.send(result);

        })








        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Athletic Hub')
})


app.listen(port, () => {
    console.log(`AthleticHub server is running on port ${port}`)
})