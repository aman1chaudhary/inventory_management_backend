import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import cookieParser from 'cookie-parser';
import bcrypt from 'bcrypt';
const PORT = 9002
const app = express()
app.use(express.json())
app.use(cookieParser());
app.use(express.urlencoded())
app.use(cors())

mongoose.connect("mongodb+srv://chaudhary:chaudhary@cluster0.czobwvg.mongodb.net/test", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, () => {
    console.log("DB connected")
})

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
})

const inventorySchema = new mongoose.Schema({
    name: String,
    category: String,
    brand_name: String,
    availability_zone: String,
    model_number: String,
    description: String,
    image: String
})

const User = mongoose.model('User', userSchema);
const Inventory = mongoose.model('Inventory', inventorySchema);

//Routes
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    User.findOne({ email: email }, (err, user) => {
        if (user) {
            const isPasswordMatch = bcrypt.compareSync(password, user.password);
            if (isPasswordMatch) {
                res.cookie('user', user, { maxAge: 86400000 }); // set cookie for 24 hours
                res.send({ message: 'Login Successfull', user: user });
            } else {
                res.send({ message: "Password didn't match" });
            }
        } else {
            res.send({ message: 'User not registered' });
        }
    });
});

app.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    User.findOne({ email: email }, (err, user) => {
        if (user) {
            res.send({ message: 'User already registered' });
        } else {
            const hashedPassword = bcrypt.hashSync(password, 10);
            const user = new User({
                name,
                email,
                password: hashedPassword,
            });
            user.save((err) => {
                if (err) {
                    res.send(err);
                } else {
                    res.cookie('user', user, { maxAge: 86400000 }); // set cookie for 24 hours
                    res.send({ message: 'Successfully Registered, Please login now.' });
                }
            });
        }
    });
});

app.post('/add-inventory', (req, res) => {
    const { name, category, brand_name, availability_zone, model_number, description, image } = req.body;
    const inventory = new Inventory({
        name,
        category,
        brand_name,
        availability_zone,
        model_number,
        description,
        image
    });
    inventory.save((err) => {
        if (err) {
            res.send(err);
        } else {
            res.send({ message: 'Inventory added successfully' });
        }
    });
});

app.get('/inventory', (req, res) => {
    Inventory.find({}, (err, inventory) => {
        if (err) {
            res.send(err);
        } else {
            res.send(inventory);
        }
    });
});


app.listen(PORT, () => {
    console.log(`BE started at port ${PORT}`)
})
