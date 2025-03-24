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
const dayjs = require('dayjs');

Cypress.Commands.add('register', (email, password, username) => {
    cy.get('#email').type(email);
    cy.get('#password').type(password);
    cy.get('#username').type(username);
    cy.get("button[type='submit']").click();
})
Cypress.Commands.add('login', (email, password) => {
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
Cypress.Commands.add('loginAPI', function () {
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
    cy.getAllLocalStorage().then((storage) => {
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
Cypress.Commands.add('getUserById', (token, userId) => {
    const baseAPIURL = Cypress.config('baseAPIURL');
    return cy.request({
        url: `${baseAPIURL}/users/getUser/${userId}`,
        method: 'GET',
        headers: {
            'Authorization': `${token}`
        }
    }).then((response) => {
        expect(response.status).to.eq(200);
        return cy.wrap(response.body);
    });
});

Cypress.Commands.add('updateUserById', (token, userId, formData) => {
    const baseAPIURL = Cypress.config('baseAPIURL');

    return cy.window().then(win => {
        return new Cypress.Promise((resolve, reject) => {
            const xhr = new win.XMLHttpRequest();
            xhr.open('PUT', `${baseAPIURL}/users/updateUser/${userId}`);
            xhr.setRequestHeader('Authorization', token);

            xhr.onload = function () {
                if (xhr.status === 200) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response);
                    } catch (e) {
                        reject(new Error(`Failed to parse response: ${xhr.responseText}`));
                    }
                } else {
                    reject(new Error(`Request failed with status ${xhr.status}: ${xhr.responseText}`));
                }
            };

            xhr.onerror = function () {
                reject(new Error('Network error occurred'));
            };

            // This should properly send the FormData with the file
            xhr.send(formData);
        });
    });
});

Cypress.Commands.add('randomEmail', () => {
    const email = `test${Math.floor(Math.random() * 100000)}@example.com`;
    return cy.wrap(email);
})

Cypress.Commands.add('loginAdminApp', () => {
    cy.visit('https://admin.qa.dmh.veritone.com/#/login');
    cy.get('#username').type('nnguyen6+admin@veritone.com');
    cy.get('#password').type('admin@1234');
    cy.get('#siteName').type('commerce');
    cy.xpath("//button[@type='submit']").click();
});
Cypress.Commands.add('createDownload', () => {
    cy.xpath("//a[@href='#/report/create']").click();
    cy.xpath("//div[contains(text(), 'Asset and Collection Shares by Creation Date')]").click();
    cy.xpath("//ul[@role='listbox']//li[5]").click();
    const date = dayjs().subtract(5, 'day').format('YYYY-MM-DD');

    cy.xpath("//input[@name='startDate']").type(date);
    cy.xpath("//button[@type='submit']").click();
})

Cypress.Commands.add('editFile', (fileName, editedValue) => {
    return cy.task('editFile', { fileName, editedValue })
        .then(() => {
            cy.log(`File edited successfully: ${fileName}`);
        });
});
Cypress.Commands.add('addFile', (folderToAddDir, fileName, content = '') => {
    const filePath = `${folderToAddDir}/${fileName}`;
    return cy.task('addFile', { filePath, content })
        .then(() => {
            cy.log(`File created successfully: ${filePath}`);
        });
});
Cypress.Commands.add('deleteFile', (fileDir) => {
    return cy.task('deleteFile', { fileDir })
        .then(() => {
            cy.log(`File deleted successfully: ${fileDir}`);
        });
});
Cypress.Commands.add('moveFile', (currentDir, destinationDir) => {
    return cy.task('moveFile', { currentDir, destinationDir })
        .then(() => {
            cy.log(`File moved successfully from ${currentDir} to ${destinationDir}`);
        });
});
Cypress.Commands.add('deleteAllFiles', (dir) => {
    return cy.task('deleteAllFiles', { dir })
       .then(() => {
            cy.log(`All files in ${dir} deleted successfully`);
        });
});


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


