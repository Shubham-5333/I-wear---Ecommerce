function ResetSubmit() {
    const reset = document.getElementById('resetPassword').value;
    const confirm = document.getElementById('ConfirmPassword').value;
    const resErr = document.getElementById('resetPasswordErr');
    const conErr = document.getElementById('ConfirmPasswordErr');

    const resErrMess = [];
    const conErrMess = [];

    // Strong password validation without special characters
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

    // Check for empty reset password
    if (reset.trim() === "") {
        resErrMess.push("This field is required");
    } else if (!strongPasswordRegex.test(reset)) {
        resErrMess.push("Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, and one number.");
    }
    resErr.innerHTML = resErrMess.join(',');

    // Check for empty confirm password
    if (confirm.trim() === "") {
        conErrMess.push("This field is required");
    } else if (!strongPasswordRegex.test(confirm)) {
        conErrMess.push("Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, and one number.");
    }
    conErr.innerHTML = conErrMess.join(',');

    // Check if all validations pass and submit the form
    if (resErrMess.length === 0 && conErrMess.length === 0) {
        form.submit();
    }
}
