    
function OtpSubmit(){
    const otpInput = document.getElementById('EnterOtp').value
    const otpErr = document.getElementById('otpErr')

    const otpErrMessage = []

    if(otpInput.trim()===""){
        console.log("hi");
        otpErrMessage.push("this field is required")
    }
    console.log(otpErrMessage);
    otpErr.innerHTML = otpErrMessage.join(',');
}