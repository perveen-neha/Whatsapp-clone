import express from 'express';
import mongoose from 'mongoose';
import Messages from './dbMessages.js';
import Pusher from 'pusher';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 9000;


 const pusher = new Pusher({
    appId: "1529736",
    key: "4c3f669145c64efb2553",
    secret: "a37c81900d1ef6270aef",
    cluster: "ap2",
    useTLS: true
  });
  

app.use(express.json());

app.use(cors())

const connection_url =  'mongodb+srv://neha:123@cluster0.hcssw3l.mongodb.net/whatsappdb?retryWrites=true&w=majority'
mongoose.set('strictQuery', true);
mongoose.connect(connection_url, {
    useNewUrlParser: true,
    useUnifiedTopology:true
}
)

const DB = mongoose.connection
DB.once("open", ()=> {
    console.log('db connected');
    const msgCollection = DB.collection('messagecontents');
    const changeStream = msgCollection.watch();
    changeStream.on("change", (change) => {
        console.log(change);

        if(change.operationType === 'insert'){
            const messageDetails = change.fullDocument;
            pusher.trigger('messages','inserted',{
                name:messageDetails.name,
                message: messageDetails.message,
                time:messageDetails.timeStamp,
                recieved:messageDetails.recieved
            })
        }
        else{
            console.log('pusher error');
        }
    })
})

app.get("/" , (req,res) => res.status(200).send("hello world"));

app.get('/messages/sync',(req,res) => {
    Messages.find((err,data) => {
        if(err){
            res.status(500).send(err)
        }
        else res.status(200).send(data)
    })
})

app.post('/messages/new', (req,res)=>{
    const dbMessage = req.body

    Messages.create(dbMessage,(err,data) => {
        if(err)
            res.status(500).send(err)
        else
            res.status(201).send(data)
    })
})

app.listen(port, ()=>console.log(`Listening on localhost : ${port}`));