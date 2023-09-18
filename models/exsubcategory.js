const mongoose = require('mongoose');

const exsubcategorySchema = mongoose.Schema({
    categoryId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "category"
    },
    subcategoryId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "subcategory"
    },
    exsubcategory : {
        type : String,
        required : true
    }
})

const exsubcategory = mongoose.model('exsubcategory',exsubcategorySchema);
module.exports = exsubcategory;