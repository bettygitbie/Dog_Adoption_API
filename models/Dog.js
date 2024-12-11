const mongoose = require('mongoose')

const dogSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    isAdopted: {
        type: Boolean,
        default: false,
    },
})

dogSchema.methods.adopt = function (){
    if(this.isAdopted){
        throw new Error("Dog is already adopted!")
    }
    this.isAdopted = true;
}

const Dog = mongoose.model('Dog',dogSchema)

module.exports = Dog