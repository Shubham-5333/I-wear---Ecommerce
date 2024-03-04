const categorydb = require('../model/categorySchema');
const productdb = require('../model/productSchema');

exports.addingCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const trimmed = name.toLowerCase().trim()
        console.log(trimmed);
        const existingCategory = await categorydb.findOne({ name: trimmed });

        if (existingCategory) {
            req.session.errMessage =  "field already exists" 
            console.log('Category already exists:', existingCategory);
            return res.status(400).redirect('/admin/addCategory');
        }
        
        const newCategory = await categorydb.create({ name: trimmed });
        console.log('New category added:', newCategory);
        res.redirect('/admin/getAllCategory');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await categorydb.find();
        console.log(categories);
        res.render('CategoryMangement', { categories: categories });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
}

exports.editCategory = async (req, res) => {
    try {
        const catId = req.params.id
        console.log(catId);
        const diaplayingId = await categorydb.findById(catId);
        console.log(diaplayingId);
        res.render('editCategory', { diaplayingId,errMEssage:req.session.errMessage },(error,html)=>{
            if(error){
                res.status(500).send({ error: "error in server" })
            }
            delete  req.session.errMEssage;
            res.send(html)
        })
    } catch (error) {
        res.status(500).send({ error: "error in server" })
    }
}
exports.postEditCategory = async (req, res) => {
    try {
        const catId = req.params.id;
        let name = req.body.name.toLowerCase().trim(); 

        const existingCategory = await categorydb.findOne({ name: name, _id: { $ne: catId } });

        if (existingCategory) {
            req.session.errMessage =  "field already exists" 
            return res.status(400).redirect(`/admin/editCategory/${catId}`);    
        }

        const oldCategory = await categorydb.findOneAndUpdate(
            {_id:catId},
            { $set: { name: name } },
        );
        console.log("old",oldCategory);

        const updatedProduct =  await productdb.updateMany(
            {Pcategory:oldCategory.name},
            {$set:{Pcategory:name}}
        )
            console.log("uppp",updatedProduct);
        res.redirect('/admin/getAllCategory');
    } catch (error) {
        res.status(500).send({ error: "Error in server" });
    }
}


exports.unlistCategory = async (req, res) => {
    try {
        let userId = req.params.id;
        let user = await categorydb.findOneAndUpdate({ _id: userId }, { $set: { action: true } })
        console.log(user);
        res.redirect('/admin/getAllCategory')
    } catch (error) {
        res.status(500).send({ message: error })
    }
}

exports.listCategory = async (req, res) => {
    try {
        let userId = req.params.id;
        let user = await categorydb.findOneAndUpdate({ _id: userId }, { $set: { action: false } })
        console.log(user);
        res.redirect('/admin/getAllCategory')
    } catch (error) {
        res.status(500).send({ message: error })
    }
}