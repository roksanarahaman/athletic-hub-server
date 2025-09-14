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



        const eventsCollection = client.db('eventDB').collection('events');
        const bookedCollection = client.db('eventDB').collection('booking');

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

        //booked events api

        app.get('/booking', async (req, res) => {
            try {
                const email = req.query.email;
                const query = email ? { user_email: email } : {};
                const bookings = await bookedCollection.find(query).toArray();
                res.send(bookings);
            } catch (error) {
                res.status(500).send({ error: "Failed to fetch bookings" });
            }
        });

        app.post('/booking', async (req, res) => {
            const bookedEvents = req.body;
            console.log(bookedEvents);

            const result = await bookedCollection.insertOne(bookedEvents);
            res.send(result);
        });

        app.delete('/booking/:id', async (req, res) => {
            try {
                const id = req.params.id;

                // Try both
                const result = await bookedCollection.deleteOne({
                    $or: [
                        { _id: id }, // string id
                        { _id: ObjectId.isValid(id) ? new ObjectId(id) : null } // ObjectId
                    ]
                });

                if (result.deletedCount === 1) {
                    res.send({ success: true, message: "Booking cancelled successfully" });
                } else {
                    res.status(404).send({ success: false, message: "Booking not found" });
                }
            } catch (error) {
                console.error("Delete error:", error);
                res.status(500).send({ error: "Failed to delete booking" });
            }
        });


        // manage events api
        app.get('/events', async (req, res) => {
            try {
                const email = req.query.email;
                const query = email ? { creatorEmail: email } : {};
                const events = await eventsCollection.find(query).toArray();
                res.send(events);
            } catch (error) {
                res.status(500).send({ error: "Failed to fetch events" });
            }
        });


        app.delete('/events/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
                const result = await eventsCollection.deleteOne(query);

                if (result.deletedCount === 1) {
                    res.send({ success: true, message: "Event deleted successfully" });
                } else {
                    res.status(404).send({ success: false, message: "Event not found" });
                }
            } catch (error) {
                res.status(500).send({ error: "Failed to delete event" });
            }
        });


        app.put('/events/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const updatedEvent = req.body;
                const filter = { _id: new ObjectId(id) };
                const updateDoc = {
                    $set: {
                        eventName: updatedEvent.eventName,
                        eventType: updatedEvent.eventType,
                        eventDate: updatedEvent.eventDate,
                        description: updatedEvent.description,
                        creatorEmail: updatedEvent.creatorEmail,
                        creatorName: updatedEvent.creatorName,
                        picture: updatedEvent.picture,
                    },
                };

                const result = await eventsCollection.updateOne(filter, updateDoc);
                res.send(result);
            } catch (error) {
                res.status(500).send({ error: "Failed to update event" });
            }
        });









        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
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