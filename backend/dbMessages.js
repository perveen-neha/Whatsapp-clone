import mongoose from 'mongoose'

const whatsappSchema = mongoose.Schema({
    name:String,
    message:{
        type:String,
        required:true
    },
    timeStamp:String,
    recieved:Boolean
})

export default mongoose.model("messagecontents",whatsappSchema)