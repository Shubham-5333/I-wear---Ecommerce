function AddProductSubmit() {
    const Pname = document.getElementById('productName').value;
    const Pprice = document.getElementById('productPrice').value;
    const Punit = document.getElementById('productUnits').value;
    const Pimage = document.getElementById('productImage').value;

    const allDetailErr = document.getElementById('allDetails');

    const AllDetailErr = [];

    if (Pname.trim() === "") {
        AllDetailErr.push("Product Name is required");
    }
    if (Pprice.trim() === "") {
        AllDetailErr.push("Price is required");
    }
    if (Punit.trim() === "") {
        AllDetailErr.push("Units is required");
    }
    if (Pimage.trim() === "") {
        AllDetailErr.push("Product Image is required");
    }

    allDetailErr.innerHTML = AllDetailErr.join(', ');

    return AllDetailErr.length === 0;
}