const express = require('express');
const mongoose = require('mongoose');

const dbname = 'recap-mongoose-crud';
const dbConfig = {
    uri: `mongodb://localhost:27017/${dbname}`,
    options:{
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
};

const Product = require('./models/product');


const app = express();

app.use(express.urlencoded({extended:true}));
app.use(express.json());


(async ()=>{
    try{
        await mongoose.connect(dbConfig.uri, dbConfig.options);
        console.log('Connected to DB ... ');
        app.listen(3000, ()=>{
            console.log('Server is running ...');
        });
    }catch(err){
        console.log(err.message);
        process.exit(1);
    }
})()