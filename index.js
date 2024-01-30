// const express = require('express');
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const User = require('./models/User');

// const cors = require('cors');

// const jwt = require('jsonwebtoken');
// dotenv.config();
// try {
//     await mongoose.connect(process.env.MONGO_URL);
//     console.log('Connected to MongoDB');
// } catch (err) {
//     console.error('Error connecting to MongoDB:', err);
// }

// const jwtSecret = process.env.JWT_SECRET;

// const app = express();
// app.use(express.json());
// app.use(cors({
//     credentials: true,
//     origin: process.env.CLIENT_URL,
// }));
// app.get('/test', (req,res) => {
//     res.json('test ok');
// });



// app.post('/register', async (req,res) => {
//     console.log(req.body);
//     const {username,password} = req.body;
//     try {
//         const createdUser = await User.create({username,password});
//         jwt.sign({userId:createdUser._id},jwtSecret, {}, (err,token) => {
//             if (err) throw err;
//             res.cookie('token', token).status(201).json('ok');
//         });
//     } catch(err) {
//         if (err) throw err;
//         res.status(500).json('error')
//     }
    
    
// });

// // app.post('/register', async (req, res) => {
// //     const { username, password } = req.body;
// //     try {
// //         const CreatedUser = await User.create({ username, password });
// //         jwt.sign({ userId: CreatedUser._id }, jwtSecret, {}, (err, token) => {
// //             if (err) {
// //                 console.error('Error creating JWT token:', err);
// //                 return res.status(500).json({ error: 'Internal Server Error' });
// //             }
// //             res.cookie('token', token).status(201).json('ok');
// //         });
// //     } catch (err) {
// //         console.error('Error creating user:', err);
// //         res.status(500).json({ error: 'Internal Server Error' });
// //     }
// // });


// app.listen(4000);




const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
//const ws = require('ws');
const cors = require('cors');

const jwt = require('jsonwebtoken');

async function startServer() {
    dotenv.config();

    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }

    const jwtSecret = process.env.JWT_SECRET;
    const bcryptSalt = bcrypt.genSaltSync(10);

    const app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use(cors({
        credentials: true,
        origin: process.env.CLIENT_URL,
    }));
//     expressWs(app);

// app.ws('/', (ws, req) => {
//     console.log('WebSocket connection established');
//     // Handle WebSocket logic here
// });
    app.get('/test', (req, res) => {
        res.json('test ok');
    });

    app.get('/profile', (req,res) => {
        const token = req.cookies?.token;
        if (token) {
            jwt.verify(token, jwtSecret, {}, (err, userData) => {
                if (err) throw err;
                res.json(userData);
            });
        } else {
            res.status(401).json('no token');
        }
        
    });

    app.post('/login', async (req,res) => {
        const {username,password} = req.body;
        const foundUser = await User.findOne({username});
        if (foundUser) {
            const passOk = bcrypt.compareSync(password, foundUser.password);
            if (passOk) {
                jwt.sign({userId: foundUser._id,username}, jwtSecret, {}, (err, token) => {
                    res.cookie('token', token, {sameSite:'none', secure:true}).json({
                        id: foundUser._id,
                    });
                });
            }
        }
    });

    app.post('/register', async (req, res) => {
        console.log(req.body);
        const { username, password } = req.body;
        try {
            const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
            const createdUser = await User.create({ 
                username:username, 
                password: hashedPassword,
            });
            jwt.sign({ userId: createdUser._id,username}, jwtSecret, {}, (err, token) => {
                if (err) throw err;
                res.cookie('token', token, {sameSite:'none', secure:true}).status(201).json({
                    id: createdUser._id, 
                });
            });
        } catch (err) {
            console.error(err);
            res.status(500).json('error');
        }
    });

    app.listen(4000);

//     const wss = new ws.WebSocketServer(app.listen(4000));
//     wss.on('connection', (connection) => {
//         console.log("connected");
//    });
   

}

startServer();
