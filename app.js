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


// helper methods
const _throw = err =>{
    throw err;
}

const throwProductNotFound = () =>{
    const error = new mongoose.Error('Product Not Found!');
    error.statusCode = 404;
    throw error;
}

/*
    Endpoints:
        - GET /products
        - POST /products
        - PUT /products/:id
        - DELETE /products/:id    
*/

// GET /products
// Return all products
app.get('/products', async (req, res, next) => {
    try {
        const products = await Product.find({})
        res.json({products});
    } catch (err) {
        err instanceof mongoose.Error ? next(err) : _throw(err)
    }
});

// GET /products/:id
// Return single product
app.get('/products/:id', async (req, res, next)=>{
    try {
        const id = req.params.id;
        if(! ObjectId.isValid(id)){
            return throwProductNotFound();
        }
        const product = await Product.findById(id);
        if(!product){
            return throwProductNotFound();
        }
        res.json({product});

    } catch (err) {
        err instanceof mongoose.Error ? next(err) : _throw(err)
    }
});

// POST /products
// Create Product
app.post('/products', productValidationRules(), validate, async (req, res, next) => {
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

// PUT /products/:id
// Update product
app.put('/products/:id', editProductRules(), validate, async (req, res, next) => {
    try {
        const prodId = req.params.id;
        if(!ObjectId.isValid(prodId)){
            return throwProductNotFound();
        }

        const product = await Product.findById(prodId);
        if(!product){
            return throwProductNotFound();
        }

        product.name = req.body.name || product.name;
        product.price= req.body.price || product.price;
        product.description = req.body.description || product.description;

        const savedProduct = await product.save();

        res.json({
            msg: `Product updated :)`,
            product: savedProduct
        });

    } catch (err) {
        err instanceof mongoose.Error ? next(err) : _throw(err);
    }

});

// DELETE /products/:id
// Delete One
app.delete('/products/:id', async (req, res, next) => {
    const prodId = req.params.id;
    try{
        if(! ObjectId.isValid(prodId)){
            return throwProductNotFound();
        }
        const product = await Product.findById(prodId);
        if(!product){
            return throwProductNotFound();
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
