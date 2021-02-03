// Dependencies
const express = require('express');
const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const morgan = require('morgan');

// Validation
const {validate, productValidationRules, editProductRules} = require('./validation');

// Product Model
const Product = require('./product');

// Instantiate express app
const app = express();


// Middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({extended:true}));
app.use(express.json());


// helper method
const _throw = err =>{
    throw err;
}

/*
    Endpoints:
        - GET /
        - POST /
        - PUT /:id
        - DELETE /:id    
*/

// GET /
// Return all products
app.get('/', async (req, res, next) => {
    try {
        const products = await Product.find({})
        res.json({products});
    } catch (err) {
        err instanceof mongoose.Error ? next(err) : _throw(err)
    }
});

// POST /
// Create Product
app.post('/', productValidationRules(), validate, async (req, res, next) => {
    try {
        const product = new Product({...req.body});
        const savedProduct = await product.save();
        res.status(201).json({
            msg: '1 Product created :)',
            product: savedProduct
        });
    } catch (err) {
        err instanceof mongoose.Error ? next(err) : _throw(err);
    }

});

// PUT /:id
// Update product
app.put('/:id', editProductRules(), validate, async (req, res, next) => {
    try {
        const prodId = req.params.id;
        if(!ObjectId.isValid(prodId)){
            const error = new mongoose.Error(`No product found!`);
            error.statusCode = 404;
            throw error;
        }

        const product = await Product.findById(prodId);
        if(!product){
            const error = new mongoose.Error('No product found!');
            error.statusCode = 404;
            throw error;
        }

        product.name = req.body.name || product.name;
        product.price= req.body.price || product.price;
        product.description = req.body.description || product.description;

        const savedProduct = await product.save();

        res.status(201).json({
            msg: `Product updated :)`,
            product: savedProduct
        });

    } catch (err) {
        err instanceof mongoose.Error ? next(err) : _throw(err);
    }

});

// DELETE /:id
// Delete One
app.delete('/:id', async (req, res, next) => {
    const prodId = req.params.id;
    try{
        if(! ObjectId.isValid(prodId)){
            const error = new mongoose.Error('No product found!');
            error.statusCode = 404;
            throw error;
        }
        const product = await Product.findById(prodId);
        if(!product){
            const error = new mongoose.Error('No product found!');
            error.statusCode = 404;
            throw error;
        }
        const deletedProduct = await product.deleteOne();
        res.json({
            msg: `Product deleted`,
            product: deletedProduct
        });
    }
    catch(err){
        err instanceof mongoose.Error ? next(err) : _throw(err);
    }
});

// 404
app.use((req, res, next)=>{
    error = new Error(`The URL you requested: ${req.url} is NOT found on Server!`);
    error.statusCode = 404;
    throw error; 
});

// General Error Handling middleware
app.use((error, req, res, next)=>{
    const message = error.message;
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
        error: message
    });
});


const PORT = 5000;
const dbConfig = {
    name: 'mongoose-crud',
    uri: `mongodb://localhost:27017/mongoose-crud`,
    options:{
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
};


(async ()=>{
    try{
        await mongoose.connect(dbConfig.uri, dbConfig.options);
        console.log('Connected to DB ... ');
        app.listen(PORT, ()=>{
            console.log(`Server is running on PORT: ${PORT} ...`);
        });
    }catch(err){
        console.log(err.message);
        process.exit(1);
    }
})()