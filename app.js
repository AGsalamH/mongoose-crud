const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');

const {validate, productValidationRules} = require('./validation');

const dbname = 'recap-mongoose-crud';
const dbConfig = {
    uri: `mongodb://localhost:27017/${dbname}`,
    options:{
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
};

// Product Model
const Product = require('./product');

const app = express();
app.use(morgan('dev'));
app.use(express.urlencoded({extended:true}));
app.use(express.json());

// GET All
app.get('/', async (req, res, next) => {
    try {
        const products = await Product.find({})
        res.status(200).json({
            products: products
        });
    } catch (err) {
        next(err);
    }
});

// Add one
app.post('/', productValidationRules(), validate, async (req, res, next) => {
    try {
        const product = new Product({...req.body});
        await product.save();
        res.status(201).json({
            msg: '1 Product added successfully.'
        });
    } catch (err) {
        next(err);
    }

});

// Edit one
app.put('/:id', productValidationRules(), validate, async (req, res, next) => {
    try {
        const prodId = req.params.id;
        // this way
        // await Product.updateOne({_id: prodId}, {$set: {
        //     name: req.body.name,
        //     price: req.body.price,
        //     description: req.body.description,
        // }});
        // or this way
        const product = await Product.findById(prodId);
        if(!product){
            const error = new Error('No product matches this ID');
            error.statusCode = 404;
            return next(error);
        }
        product.name = req.body.name;
        product.price= req.body.price;
        product.description= req.body.description;
        await product.save();

        res.status(201).json({
            msg: `Product ${product._id} Updated successfully.`
        });
    } catch (err) {
        next(err);
    }

});

// Delete One
app.delete('/:id', async (req, res, next) => {
    const prodId = req.params.id;
    try{
        const deleteCursor = await Product.deleteOne({_id: prodId});
        res.status(202).json({
            msg: `Deleted Count ${deleteCursor.deletedCount}`
        });
    }
    catch(err){
        next(err);
    }
});


// Error Handling
app.use((error, req, res, next)=>{
    const message = error.message;
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
        error: message
    });
});


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