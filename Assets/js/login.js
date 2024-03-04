console.log('hiiiiii');


    function loginSubmit() {
        const email = document.getElementById('email').value;
        const passwrd = document.getElementById('password').value;
        console.log(email);
        console.log(passwrd);
        const emailErr = document.getElementById('emailErr')
        const passwordErr = document.getElementById('passwordErr')
    
        let EmailErrMessage =[]
        let PasswordErrMessage = []
        if(email.trim()===""){
            console.log("hi");
            EmailErrMessage.push("this field is required")
        }
        console.log(EmailErrMessage);
        emailErr.innerHTML = EmailErrMessage.join(',');
        if(passwrd.trim()===""){
            console.log("hi");
            PasswordErrMessage.push("this field is required")
        }
        console.log(PasswordErrMessage);
        passwordErr.innerHTML = PasswordErrMessage.join(',');

        if(EmailErrMessage.length===0 && PasswordErrMessage.length===0){
            form.submit()
        }
    // })
    }



// btn.addEventListener('click',(event)=>{
//     event.preventDefault();
  
    
    // const emailErr = document.getElementById('emailErr')
    // const passwordErr = document.getElementById('passwordErr')

    // let EmailErrMessage =[]
    // let PasswordErrMessage = []
    // if(email.trim()===""){
    //     console.log("hi");
    //     EmailErrMessage.push("this field is required")
    // }
    // console.log(EmailErrMessage);
    // emailErr.innerHTML = EmailErrMessage.join(',');
// })


