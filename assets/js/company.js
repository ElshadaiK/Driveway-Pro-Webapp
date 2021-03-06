document.addEventListener("DOMContentLoaded", function () {
    /*==================================================================
    [ DB ]*/

    companyDB().then(function (result) {
        DB = result
        // if (DB) migrateData()
    })

    /*==================================================================
    [ Validate ]*/
    let loggingIn = true;
    let signingUp = true;


    validate_form.addEventListener('submit', function (e) {
        e.preventDefault();

        let check = true;
        for (var i = 0; i < input.length; i++) {
            if (validate(input[i]) == false) {
                showValidate(input[i]);
                check = false;
            }
        }
        // If a company is logging in
        if (loggingIn && check) {

            let data = {
                email: email_input.value,
                password: password_input.value
            }
            spinner.style.display = 'block'

            return loginCompany(data)

        }

        // If a company is signing up
        else if (signingUp && check) {
            let encrypted = CryptoJS.AES.encrypt(password_input.value, "Secret").toString();
            let data = {
                charge: charge_input.value,
                slots: slots_input.value,
                active_slots: slots_input.value,
                email: email_input.value,
                password: encrypted,
                name: name_input.value,
                opens_at: "8AM",
                closes_at: "8PM",
                latitude: latitudeInput.value,
                longitude: longtiudeInput.value,
            }
            return signupCompany(data)
        }
        else {
            console.log("Edit your input")

        }
        return check;
    });


    let name = document.querySelector('.name');
    let charge = document.querySelector('.charge');
    let location = document.querySelector('.location');
    let slots = document.querySelector('.slots-per-floor');
    let forgot = document.querySelector('.password');
    let getBackLI = document.querySelector('.get-back');
    let getBackSU = document.querySelector('.get-back-sign-up');
    let password = document.querySelector('.password-box');
    let forgotPassword = document.querySelector('.forgot-password');
    let loginButton = document.querySelector('.login100-form-btn');
    let signup = document.querySelector('.sign-up');

    forgot.addEventListener('click', function () {
        hider(name, charge, location, slots, password, forgotPassword, getBackSU, signup)
        shower(getBackLI)
        loginButton.textContent = ("Verify");
        loggingIn = false;
        signingUp = false;
    });

    signup.addEventListener('click', function () {
        hider(forgotPassword, signup)
        shower(name, charge, location, slots, getBackSU)
        navigator.geolocation.getCurrentPosition(function (position) {
            latitudeInput.value = position.coords.latitude;
            longtiudeInput.value = position.coords.longitude;
        });
        loginButton.textContent = ("Signup");
        loggingIn = false;
        signingUp = true;
        clearForm(...input)
    });

    getBackLI.addEventListener('click', function () {
        hider(name, charge, location, slots, getBackLI)
        shower(password, forgotPassword, signup)
        loginButton.textContent = ("Login");
        loggingIn = true;
        signingUp = false;
        clearForm(...input)
    });

    getBackSU.addEventListener('click', function () {
        hider(name, charge, location, slots, getBackSU)
        shower(password, forgotPassword, signup)
        loginButton.textContent = ("Login");
        loggingIn = true;
        signingUp = false;
        clearForm(...input)
    })
});


// DB operations

async function addNewCompany(data) {

    // Insert the object into the database 
    let transaction = DB.transaction(['companies'], 'readwrite');
    let objectStore = transaction.objectStore('companies');

    let res = CompanyModel(data.name, data.email, data.password, data.opens_at,
        data.closes_at,
        data.charge,
        data.slots,
        data.longitude,
        data.latitude
    )
    return new Promise(function (resolve, reject) {
        let request = objectStore.add(res);
        request.onsuccess = function () {
            clearForm(...input)
            resolve(request.result);
        }
        transaction.oncomplete = () => {
            console.log('New company added');
            // take company to the company landing page
            let companyToJson = addCompanyToJSON(res)
            companyToJson.then(loggedIn(res))
        }
        transaction.onerror = () => { console.log('There was an error, try again!'); }
    });



}
async function addCompanyToJSON(data) {
    console.log("adding company to JSON")
    return new Promise(function (resolve, reject) {
        function checker() {
            let xhr = new XMLHttpRequest();
            xhr.open('GET', './assets/js/jsonData/company.json', true);
            xhr.onload = function (e) {
                if (this.status == 200) {
                    const companies = JSON.parse(this.responseText);
                    companies.forEach(company => {
                        if (company.email == data.email) {
                            console.log("file found")
                            let toBeAdded = company
                            alert("Company already created globally")
                            return false
                        }
                    })
                }
            }
            xhr.send();
            return true
        }

        // result = checker()
        // if (result) {
        //     console.log("File not found so we're creating one....")

        //     // var textFile = null;
        //     // function makeTextFile(text) {
        //     //     var data = new Blob([text], { type: 'text/plain' });

        //     //     // If we are replacing a previously generated file we need to
        //     //     // manually revoke the object URL to avoid memory leaks.
        //     //     if (textFile !== null) {
        //     //         window.URL.revokeObjectURL(textFile);
        //     //     }

        //     //     textFile = window.URL.createObjectURL(data);

        //     //     resolve(textFile);
        //     // }
        //     // makeTextFile("Hey")
        // }
    })
}
async function lookupCompanyInDB(data) {
    console.log("looking for the company in the DB")
    let email_id = data.email;
    let objectStore = DB.transaction('companies').objectStore('companies');
    return new Promise(function (resolve, reject) {
        let request = objectStore.get(email_id);
        request.onsuccess = function () {
            resolve(request.result);
        }
    });
}
async function lookupCompanyInJSON(data) {
    console.log("looking for the company in the JSON")
    return new Promise(function (resolve, reject) {
        resolve(readJSON(data))
    });

}


async function loginCompany(data) {
    let myPromiseDB = lookupCompanyInDB(data)
    try {
        myPromiseDB.then(function (result) {
            console.log("Finished looking up in the db")
            if (result) {
                let password = (CryptoJS.AES.decrypt(result.password, "Secret")).toString(CryptoJS.enc.Utf8);
                if (match(data.password, password)) {
                    // login company
                    console.log("Login")
                    loggedIn(result)
                }
                else {
                    // invalid login
                    invalidLogin()
                }
            }
            else {
                // Not in the DB
                console.log("Company not found in the db")
                throw "err"
            }
        }).catch(err => {
            lookupCompanyInJSON(data)
        });
    }
    catch (err) {
        console.log(`Caught by try/catch ${error}`);
    }

}
async function signupCompany(data) {
    await addNewCompany(data)
}

function loggedIn(res) {
    spinner.style.display = 'none'
    localStorage.setItem('company', JSON.stringify(res.email));
    relocation("company_page")
}
function readJSON(data) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', './assets/js/jsonData/company.json', true);
    xhr.onload = function (e) {
        if (this.status == 200) {
            const companies = JSON.parse(this.responseText);
            companies.forEach(company => {
                if (company.email == data.email) {
                    console.log("file found")
                    let toBeAdded = company
                    if (match(toBeAdded.password, data.password)) {
                        toBeAdded.password = CryptoJS.AES.encrypt(password_input.value, "Secret").toString();
                        addNewCompany(toBeAdded)
                    }
                    else {
                        invalidLogin()
                    }
                }
            })
        }
    }
    xhr.send();
}
function migrateData() {
    readAllJSON()
}
async function addCompanies(data) {

    // Insert the object into the database 
    let transaction = DB.transaction(['companies'], 'readwrite');
    let objectStore = transaction.objectStore('companies');

    let res = CompanyModel(data.name, data.email, data.password, data.opens_at,
        data.closes_at,
        data.charge,
        data.slots,
        data.longitude,
        data.latitude
    )
    return new Promise(function (resolve, reject) {
        let request = objectStore.add(res);
        request.onsuccess = function () {
            clearForm(...input)
            resolve(request.result);
        }
        transaction.oncomplete = () => {
            console.log('New company added');
        }
        transaction.onerror = () => { console.log('There was an error, try again!'); }
    });



}
function readAllJSON(data) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', './assets/js/jsonData/company.json', true);
    xhr.onload = function (e) {
        if (this.status == 200) {
            const companies = JSON.parse(this.responseText);
            companies.forEach(company => {
                let toBeAdded = company
                toBeAdded.password = CryptoJS.AES.encrypt(password_input.value, "Secret").toString();
                addCompanies(toBeAdded)

            })
        }
    }
    xhr.send();
} 