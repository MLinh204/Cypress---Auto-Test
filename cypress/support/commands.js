// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('register', (email, password, username) =>{
    cy.get('#email').type(email);
    cy.get('#password').type(password);
    cy.get('#username').type(username);
    cy.get("button[type='submit']").click();
})
Cypress.Commands.add('login', (email, password) =>{
    cy.get('#email').type(email);
    cy.get('#password').type(password);
    cy.get("button[type='submit']").click();
})
Cypress.Commands.add('addTodoList', (title, description) => {
    if (title.length > 0) {
        cy.get('#new-title').type(title);
    } else {
        cy.get('#new-title').clear(); 
    }
    if (description.length > 0) {
        cy.get('#new-description').type(description);
    } else {
        cy.get('#new-description').clear(); 
    }
    cy.get("button[type='submit']").click();
});

Cypress.Commands.add('editTodoList', (title, description) => {
    if (title.length > 0) {
        cy.xpath(".//input[@id='update-title']").clear().type(title);
    } else {
        cy.xpath(".//input[@id='update-title']").clear(); 
    }
    if (description.length > 0) {
        cy.get('#update-description').clear().type(description);
    } else {
        cy.get('#update-description').clear(); 
    }
    cy.get("button[type='submit']").click();
});
Cypress.Commands.add('loginAPI', function(){
    const baseURL = Cypress.config('baseAPIURL');
    return cy.fixture('valid-login-body').then((body) => {
        return cy.request({
            method: 'POST',
            url: `${baseURL}/auth/login`,
            body: body
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('token');
            cy.setCookie('token', response.body.token);
            Cypress.env('authToken', response.body.token);
            Cypress.env('userId', response.body.user.id);
            return cy.wrap(response.body.token);
        });
    });
})
Cypress.Commands.add('deleteUser', (userId) => {
    const baseAPIURL = Cypress.config('baseAPIURL');

    if (!Cypress.env('authToken')) {
        cy.log(Cypress.env('authToken'));
        return cy.loginAPI().then(() => {  
            const token = Cypress.env('authToken');
            return sendDeleteRequest(baseAPIURL, userId, token);
        });
    } else {
        const token = Cypress.env('authToken');
        return sendDeleteRequest(baseAPIURL, userId, token);
    }
});

Cypress.Commands.add('deleteTodoList', (index) => {
    const baseAPIURL = Cypress.config('baseAPIURL');
    cy.getAllLocalStorage().then((storage)=>{
        const token = storage[window.location.origin]?.token;
        cy.request({
            url: `${baseAPIURL}/todos/delete/${index}`,
            method: 'DELETE',
            headers: {
                'Authorization': `${token}`
            }
        })
    })
});

Cypress.Commands.add('randomEmail', () =>{
    const email = `test${Math.floor(Math.random()*100000)}@example.com`;
    return cy.wrap(email);
})


function sendDeleteRequest(baseAPIURL, userId, token) {
    return cy.request({
        url: `${baseAPIURL}/users/deleteUser/${userId}`,
        method: 'DELETE',
        headers: {
            'Authorization': `${token}`  
        }
    }).then((response) => {
        expect(response.status).to.eq(200);
    });
}


