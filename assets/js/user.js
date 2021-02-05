const BACKEND_LOGIN = "https://parking-spot-finder-api.herokuapp.com/auth/login"
const BACKEND_SIGNUP = "https://parking-spot-finder-api.herokuapp.com/auth/signup"
function makeRequest (method, url, data) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open(method, url);
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xhr.onload = function () {
        if (this.status >= 200 && this.status < 300) {
          resolve(xhr.response);
        } else {
          reject({
            status: this.status,
            statusText: xhr.statusText
          });
        }
      };
      xhr.onerror = function () {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      };
      if(method=="POST" && data){
          xhr.send(data);
      }else{
          xhr.send();
      }
    });
  }
$(document).ready(function(){
    
    /*==================================================================
    [ Validate ]*/
    let input = $('.validate-input .input100');
    let loggingIn = true;
    let signingUp = true;

    $('.validate-form').on('submit',function(e){
        e.preventDefault();
        
        let check = true;
        if(loggingIn){
            for(var i=0; i<input.length; i++) {
                if(validate(input[i]) == false){
                    showValidate(input[i]);
                    check=false;
                }
            }
            let data = {
                email: ($("#email")).val(),
                password: ($("#password")).val()
            }
        
        $.post(BACKEND_LOGIN, data, function(data, status){
            let results=JSON.stringify(data);
            let res = JSON.parse(results)
            console.log(res)
        })

        }
        else if(signingUp){
            let data = {
                email: ($("#email")).val(),
                password: ($("#password")).val(),
                name: ($("#name")).val(),
                phone_no: ($("#phone_number")).val(),
                plate_number: ($("#plate_number")).val()
            }
            $.post(BACKEND_SIGNUP, data, function(data, status){
                let results=JSON.stringify(data);
                let res = JSON.parse(results)
                console.log(res)
            })
        }
        else{
            if(validate(input[0]) == false){
                showValidate(input[0]);
                check=false;
            }
        }
        return check;
    });


    $('.validate-form .input100').each(function(){
        $(this).focus(function(){
           hideValidate(this);
        });
    });

    function validate (input) {
        if($(input).attr('type') == 'email' || $(input).attr('name') == 'email') {
            if($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
                return false;
            }
        }
        else {
            if($(input).val().trim() == ''){
                return false;
            }
        }
    }

    function showValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).addClass('alert-validate');
    }

    function hideValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).removeClass('alert-validate');
    };
    let name = $('.name');
    let phone_number = $('.phone_number');
    let plate_number = $('.plate_number');
    let forgot = $('.password');
    let getBackLI = $('.get-back');
    let getBackSU = $('.get-back-sign-up');
    let password = $('.password-box');
    let forgotPassword = $('.forgot-password');
    let loginButton = $('.login100-form-btn')
    let signup = $('.sign-up')
    $(forgot).click(function(){
        $(name).hide()
        $(phone_number).hide()
        $(plate_number).hide()
        loggingIn = false;
        signingUp = false;
        $(password).hide();
        $(forgotPassword).hide();
        $(getBackSU).hide()
        $(signup).hide()
        $(getBackLI).css({"display": "block"});
        $(loginButton).text("Verify");
    });
    $(signup).click(function(){
        loggingIn = false;
        signingUp = true;
        $(name).show()
        $(phone_number).show()
        $(plate_number).show()
        $(forgotPassword).hide();
        $(signup).hide()
        $(getBackSU).css({"display": "block"});
        $(loginButton).text("Signup");
    })
    $(getBackLI).click(function(){
        loggingIn = true;
        signingUp = false;
        $(name).hide()
        $(phone_number).hide()
        $(plate_number).hide()
        $(password).show();
        $(forgotPassword).show();
        $(getBackLI).hide();
        $(signup).show()
        $(loginButton).text("Login");
    })
    $(getBackSU).click(function(){
        loggingIn = true;
        signingUp = false;
        $(name).hide()
        $(phone_number).hide()
        $(plate_number).hide()
        $(password).show();
        $(forgotPassword).show();
        $(signup).show()
        $(getBackSU).hide();
        $(loginButton).text("Login");
    })
});
function clearForm(element){
    element.val = ""
}