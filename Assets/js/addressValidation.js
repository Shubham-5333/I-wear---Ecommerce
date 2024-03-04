
function validateForm() {
    const name = document.getElementById('name').value.trim();
    const address = document.getElementById('address').value.trim();
    const street = document.getElementById('street').value.trim();
    const city = document.getElementById('city').value.trim();
    const state = document.getElementById('state').value.trim();
    const zip = document.getElementById('zip').value.trim();
    
    const nameError = document.getElementById('nameError');
    const addressError = document.getElementById('addressError');
    const streetError = document.getElementById('streetError');
    const cityError = document.getElementById('cityError');
    const stateError = document.getElementById('stateError');
    const zipError = document.getElementById('zipError');
    
    if (!name) {
        nameError.innerHTML = "Name is required";
        return false;
    } else {
        nameError.innerHTML = "";
    }
    
    if (!address) {
        addressError.innerHTML = "Address is required";
        return false;
    } else {
        addressError.innerHTML = "";
    }
    
    if (!street) {
        streetError.innerHTML = "Street is required";
        return false;
    } else {
        streetError.innerHTML = "";
    }
    
    if (!city) {
        cityError.innerHTML = "City is required";
        return false;
    } else {
        cityError.innerHTML = "";
    }
    
    if (!state) {
        stateError.innerHTML = "State is required";
        return false;
    } else {
        stateError.innerHTML = "";
    }
    
    if (!zip) {
        zipError.innerHTML = "PIN Code is required";
        return false;
    } else {
        zipError.innerHTML = "";
    }
    
    return true;
}
