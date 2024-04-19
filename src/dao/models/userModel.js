import mongoose from "mongoose";

const userCollection = "users";

const userSchema = mongoose.Schema({
    first_name: {
        type: String,
        minLength: 3,
        require: true
    },
    last_name: {
        type: String,
        minLength: 3,
        require: true
    },
    email: {
        type: String,
        minLength: 5,
        require: true,
        unique: true
    },
    age: {
        type: Number,
        min: 1,
        require: true
    },
    password: {
        type: String,
        minLength: 5,
        require: true
    }
});

const userModel = mongoose.model(userCollection, userSchema);

export default userModel;