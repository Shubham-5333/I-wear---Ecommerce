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

    let isValid = true; // Assume form is valid initially

    if (!name) {
        nameError.innerHTML = "Name is required";
        isValid = false; // Set isValid to false if name is empty
    } else {
        nameError.innerHTML = "";
    }
    
    if (!address) {
        addressError.innerHTML = "Address is required";
        isValid = false; // Set isValid to false if address is empty
    } else {
        addressError.innerHTML = "";
    }
    
    if (!street) {
        streetError.innerHTML = "Street is required";
        isValid = false; // Set isValid to false if street is empty
    } else {
        streetError.innerHTML = "";
    }
    
    if (!city) {
        cityError.innerHTML = "City is required";
        isValid = false; // Set isValid to false if city is empty
    } else {
        cityError.innerHTML = "";
    }
    
    if (!state) {
        stateError.innerHTML = "State is required";
        isValid = false; // Set isValid to false if state is empty
    } else {
        stateError.innerHTML = "";
    }
    
    if (!zip) {
        zipError.innerHTML = "PIN Code is required";
        isValid = false; // Set isValid to false if zip is empty
    } else {
        zipError.innerHTML = "";
    }
    
    return isValid; // Return isValid which indicates if the form is valid or not
}
