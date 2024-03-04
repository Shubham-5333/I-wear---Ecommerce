function RegisterSubmit() {
    const RegName = document.getElementById('Name').value;
    const RegEmail = document.getElementById('RegisterEmail').value;
    const RegPassword = document.getElementById('RegisterPassword').value;
    const RegisterNameErr = document.getElementById('usernameErr');
    const RegisterEmailErr = document.getElementById('RegEmailErr');
    const RegisterPasswordErr = document.getElementById('RegPasswordErr');

    const usernameErrMessage = [];
    const EmailErrMessage = [];
    const PasswordErrMessage = [];

    // Check for empty name
    if (RegName.trim() === "") {
        usernameErrMessage.push("This field is required");
    }
    RegisterNameErr.innerHTML = usernameErrMessage.join(',');

    // Check for empty email
    if (RegEmail.trim() === "") {
        EmailErrMessage.push("This field is required");
    } else if (!/@gmail\.com$/.test(RegEmail)) {
        EmailErrMessage.push("Email must end with '@gmail.com'");
    }
    RegisterEmailErr.innerHTML = EmailErrMessage.join(',');

    // Check for empty password
    if (RegPassword.trim() === "") {
        PasswordErrMessage.push("This field is required");
    } else {
        // Strong password validation without special characters
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

        if (!strongPasswordRegex.test(RegPassword)) {
            PasswordErrMessage.push("Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, and one number.");
        }
    }

    RegisterPasswordErr.innerHTML = PasswordErrMessage.join(',');

    // Check if all validations pass and submit the form
    if (usernameErrMessage.length === 0 && EmailErrMessage.length === 0 && PasswordErrMessage.length === 0) {
        form.submit();
    }
}
