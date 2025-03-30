describe('Test edit user', function () {
  let token;
  let userId;
  let userBeforeEdit = { id: 1, email: "", username: "", password: "", profile_picture: "" };

  before(function () {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.reload();
    cy.loginAPI().then((authToken) => {
      token = authToken;
      cy.log(token);
      userId = Cypress.env('userId');
      cy.log('UserId: ' + userId);
    })
  })

  it.only('should edit user successfully', function () {
    cy.getUserById(token, 5).then((res) => {
      userBeforeEdit = { ...userBeforeEdit, ...res };
      cy.log(JSON.stringify(userBeforeEdit));
      cy.fixture('veritone-icon.jpg').then((fileContent) => {
        cy.randomEmail().then((email) => {
          cy.window().then(async win => {
            const response_1 = await new Cypress.Promise((resolve, reject) => {
              const formData = new win.FormData();

              const byteCharacters = atob(fileContent.toString().split(',')[1] || fileContent);
              const byteArrays = [];

              for (let i = 0; i < byteCharacters.length; i++) {
                byteArrays.push(byteCharacters.charCodeAt(i));
              }

              const byteArray = new Uint8Array(byteArrays);
              const blob = new win.Blob([byteArray], { type: 'image/jpeg' });

              formData.append('id', userBeforeEdit.id);
              formData.append('email', email);
              formData.append('username', 'Edited Username 1');
              formData.append('password', userBeforeEdit.password);
              formData.append('profilePicture', blob, 'veritone-icon.jpg');

              const xhr = new win.XMLHttpRequest();
              xhr.open('PUT', `${Cypress.config('baseAPIURL')}/users/updateUser/${userBeforeEdit.id}`);
              xhr.setRequestHeader('Authorization', token);

              xhr.onload = function () {
                if (xhr.status === 200) {
                  try {
                    const response = JSON.parse(xhr.responseText);
                    resolve(response);
                  } catch (e) {
                    reject(`Failed to parse response: ${xhr.responseText}`);
                  }
                } else {
                  reject(`Request failed with status ${xhr.status}: ${xhr.responseText}`);
                }
              };

              xhr.onerror = function () {
                reject('Network error occurred');
              };

              xhr.send(formData);
            });
            expect(response_1).to.have.property('id', userBeforeEdit.id);
            expect(response_1).to.have.property('email', email);
            expect(response_1).to.have.property('username', 'Edited Username 1');
            expect(response_1).to.have.property('profile_picture');
            return response_1;
          });
        });
      });
    });
  });

  after(function () {
    // Restore user to original state
    cy.window().then(win => {
      return new Cypress.Promise((resolve, reject) => {
        const formData = new win.FormData();

        formData.append('id', userBeforeEdit.id);
        formData.append('email', userBeforeEdit.email);
        formData.append('username', userBeforeEdit.username);
        formData.append('password', userBeforeEdit.password);

        const xhr = new win.XMLHttpRequest();
        xhr.open('PUT', `${Cypress.config('baseAPIURL')}/users/updateUser/${userBeforeEdit.id}`);
        xhr.setRequestHeader('Authorization', token);

        xhr.onload = function () {
          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (e) {
              reject(`Failed to parse response: ${xhr.responseText}`);
            }
          } else {
            reject(`Request failed with status ${xhr.status}: ${xhr.responseText}`);
          }
        };

        xhr.onerror = function () {
          reject('Network error occurred');
        };

        xhr.send(formData);
      }).then(response => {
        cy.log('User restored to original state');
        expect(response).to.have.property('id', userBeforeEdit.id);
        expect(response).to.have.property('email', userBeforeEdit.email);
        expect(response).to.have.property('username', userBeforeEdit.username);
      });
    });
  });
})