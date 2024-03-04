const productdb = require('../model/productSchema')
const sharp = require('sharp')
const categorydb = require('../model/categorySchema')
const path = require('path')
const  fs = require('fs');




exports.postAddProduct = async (req,res)=>{
    try {
        let file = req.files
        // const images = file.map((values)=>`/images/${values.filename}`)
        console.log(req.files);
        // for(let i=0; i < req.files ;i++){
        //     arrImages[i] = req.files[i].filename;
        // }
        for(let fil of file){
            const inputImagePath = path.join(__dirname,'../../Assets',`images/${fil.filename}`); 
            const outputImagePath = path.join(__dirname,'../../Assets',`images/resizedImg${fil.filename}`);

            await sharp(inputImagePath)
            .resize(1000,900,{
                fit:'fill',
                position:"centre",
            })
            .toFile(outputImagePath)
        }
        const uploadImg = file.map((value)=>{
            return `/images/resizedImg${value.filename}`
        });

        let products = new productdb ({
            images: uploadImg,
            Pname:req.body.Pname,
            Pcategory:req.body.Pcategory,
            price:req.body.price,
            units:req.body.units,
            description:req.body.Pdescription
        })

        const productData = await products.save();
        console.log(productData);
        res.redirect('/admin/productManagement')
        
        // res.render('addProductPage',{data: productData})
    } catch (error) {
        console.log(error);
        res.status(500).redirect('/err500');
    }
}




// exports.getAllProducts = async (req, res) => {
//     try {
//         const product = await productdb.find();
        
//         console.log('klll',product);
//         res.render('ProductManagement', { product: product});
//     } catch (error) {
//         console.error(error);
//         res.status(500).send({ error: 'Internal Server Error' });
//     }
// }

// exports.editProduct = async (req, res) => {
//     try {
//         const ProId = req.params.id; // Use req.params.id, not req.params._id
//         console.log(ProId);
//         const displayingProId = await productdb.findById(ProId);
//         console.log(displayingProId);
//         res.render('editProductPage', { displayingProId });
//     } catch (error) {
//         res.status(500).send({ error: "error in server" });
//     } 
// };


// exports.postEditProduct = async (req, res) => {
//     try {
//         const ProId = req.params.id
//         const Pname = req.body.Pname;
//         console.log(ProId);
//         const diaplayingProId = await productdb.findByIdAndUpdate(
//             ProId,
//             { $set: { name: Pname } },
//             { new: true }
//         );  
//         console.log(diaplayingProId);
//         res.redirect('/admin/getAllProduct')
//     } catch (error) {
//         res.status(500).send({ error: "error in server" })
//     }
// }

exports.updateProduct = async (req, res) => {
    try {
        let file = req.files
        
        for(let fil of file){
            const inputImagePath = path.join(__dirname,'../../Assets',`images/${fil.filename}`); 
            const outputImagePath = path.join(__dirname,'../../Assets',`images/resizedImg${fil.filename}`);

            await sharp(inputImagePath)
            .resize(1000,900,{
                fit:'fill',
                position:"centre",
            })
            .toFile(outputImagePath)
        }
        const uploadImg = file.map((value)=>{
            return `/images/resizedImg${value.filename}`
        });
        const updatedProduct = await productdb.findOneAndUpdate(
            { _id: req.query.id },
            {
                $set: {
                    Pname: req.body.Pname,
                    Pcategory: req.body.Pcategory,
                    Pcategory:req.body.Pcategory,
                    price: req.body.price,
                    units: req.body.units,
                    Pdescription:req.body.Pdescription,
                   
                },
                 $push: { images: { $each: uploadImg } }
            },
        );
        if(uploadImg){
            updatedProduct.images.push(uploadImg)
        }
        // images:uploadImg 
        // console.log(updatedProduct);
        res.redirect('/admin/productManagement');
    } catch (error) {
        console.error(error);
        res.status(500).redirect('/err500');
    }
};



exports.unlistProduct = async (req, res) => {
    try {
        let PId = req.params.id;
        let prod = await productdb.findOneAndUpdate({ _id: PId }, { $set: { action: true } },{new:true})
        console.log(prod);
        res.redirect('/admin/productManagement')
    } catch (error) {
        console.log(error);
        res.status(500).redirect('/err500');
    }
}

exports.listProduct = async (req, res) => {
    try {
        let ProId = req.params.id;
        let product = await productdb.findOneAndUpdate({ _id: ProId }, { $set: { action: false } },{new:true})
        console.log(product);
        res.redirect('/admin/productManagement')
    } catch (error) {
        res.status(500).redirect('/err500');
    }
}

// exports.findCategory =  async(req,res)=>{
//     console.log("fgfgf");
//     try {
//         const finddb = await categorydb.find({,action:false})
//         console.log(finddb);
//         res.send(finddb)
//     } catch (error) {
        
//     }
// }


exports.deleteImage =async(req,res)=>{
    const { productId, imageIndex } = req.params;

    try {
      // Fetch the product by ID
      const product = await productdb.findById(productId);
  
      // Ensure the product and image index are valid
      if (!product || imageIndex < 0 || imageIndex >= product.images.length) {
        return res.status(404).json({ error: 'Invalid product or image index' });
      }

    //   const imagePath = product.images[imageIndex];

  
      // Remove the image at the specified index
      product.images.splice(imageIndex, 1);
  
      // Save the updated product
      await product.save();

    // const deltedfromFolder = fs.unlinkSync(imagePath);
    // console.log("lkjlklj",deltedfromFolder);
  
      res.status(200).json({ success: true, message: 'Image deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).redirect('/err500');
    }
}