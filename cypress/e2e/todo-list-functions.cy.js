describe('On the todo list page', function () {
    let userId;
    const baseAPIURL = Cypress.config('baseAPIURL');
    context('Authenticated user', function () {
        this.beforeEach(function () {
            cy.intercept('POST', '/api/auth/login').as('loginUser');
            cy.session('loginSession', () => {
                cy.visit('/login');
                cy.login('LinhAuto@gmail.com', 'Alo123');
                cy.wait('@loginUser').then((res) => {
                    expect(res.response.body.user.username).to.eq('LinhAuto');
                    userId = res.response.body.user.id;
                    Cypress.env('userId', userId);
                    sessionStorage.setItem('userId', userId);
                });
            });

            cy.then(() => {
                userId = Cypress.env('userId') || sessionStorage.getItem('userId');
                expect(userId).to.exist;
            });

        });
        context('Adding todo list', function () {
            let todoIds = [];
            beforeEach(() => {
                cy.intercept('POST', `/api/todos/create/user/${userId}`).as('createTodo');
                cy.visit('/todo');
            });
            it('should create a new todo list', function () {
                cy.xpath("//button[contains(text(), 'Add Todo')]").should('be.enabled').click();
                cy.addTodoList('Test Title', 'Test Description');
                const currentDate = new Date();
                const formattedDate = currentDate.toLocaleString('en-US',
                    { year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }
                ).replace(' at', '');
                cy.wait('@createTodo', this.timeout[1000]).then((inter) => {
                    //Store the created todo id
                    const todoId = inter.response.body.todoId;
                    todoIds.push(todoId);
                    cy.log('Stored todoIds:', todoIds);
                });
                getTodosObjectsSize().then((size) => {
                    getNewestTodoList(size).within(() => {
                        cy.get('h3').should('have.text', 'Test Title');
                        cy.xpath(".//p[1][contains(text(), 'Description')]").should('have.text', 'Description: Test Description');
                        cy.xpath(".//p[2]").invoke('text').should((createdText) => {
                            expect(createdText.trim()).to.include(formattedDate.substring(0, formattedDate.length - 3));
                        });
                    });
                });
            });
            it('should create a new todo list without a description', function () {
                cy.xpath("//button[contains(text(), 'Add Todo')]").should('be.enabled').click();
                cy.addTodoList('Test Title', '');
                const currentDate = new Date();
                const formattedDate = currentDate.toLocaleString('en-US',
                    { year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }
                ).replace(' at', '');
                cy.wait('@createTodo', this.timeout[1000]).then((inter) => {
                    //Store the created todo id
                    const todoId = inter.response.body.todoId;
                    todoIds.push(todoId);
                    cy.log('Stored todoIds:', todoIds);
                });
                getTodosObjectsSize().then((size) => {
                    getNewestTodoList(size).within(() => {
                        cy.get('h3').should('have.text', 'Test Title');
                        cy.xpath(".//p[1]")
                            .should('exist')
                            .and('contain.text', 'Description:');
                        cy.xpath(".//p[2]").invoke('text').should((createdText) => {
                            expect(createdText.trim()).to.include(formattedDate.substring(0, formattedDate.length - 3));
                        });
                    });
                });
            });
            it('should not allow adding without a title', () => {
                cy.xpath("//button[contains(text(), 'Add Todo')]").should('be.enabled').click();
                cy.get('#new-title').should('have.attr', 'required');
            });
            after(() => {
                todoIds.forEach((todoId) => {
                    cy.deleteTodoList(todoId);
                })
            })
        });
        context('Editing todo list', function () {
            let editTodoId;
            this.beforeEach(() => {
                cy.getAllLocalStorage().then((storage) => {
                    const token = storage[window.location.origin]?.token;
                    cy.fixture('add-todo-body').then((body) => {
                        cy.request({
                            method: 'POST',
                            url: `${baseAPIURL}/todos/create/user/${userId}`,
                            headers: {
                                'Authorization': `${token}`
                            },
                            body: body
                        }).then((res) => {
                            expect(res.status).to.eq(200);
                            editTodoId = res.body.todoId;
                        })
                    })
                })
            })
            it('should edit user as expected', () => {
                const title = 'Edited Title';
                const description = 'Edited Description';
                cy.intercept('PUT', `/api/todos/update/${editTodoId}`).as('editTodo');
                cy.visit('/todo');
                getTodosObjectsSize().then((size) => {
                    getNewestTodoList(size).within(() => {
                        cy.xpath(".//button[contains(text(), 'Edit')]").should('be.enabled').click();
                        cy.xpath("//div[@class= 'ReactModal__Content ReactModal__Content--after-open']").within(() => {
                            cy.editTodoList(title, description);
                        });
                        cy.wait('@editTodo').then((inter) => {
                            expect(inter.response.body.id).to.eq(editTodoId);
                        });
                    });
                });
                getTodosObjectsSize().then((size) => {
                    getNewestTodoList(size).within(() => {
                        cy.get('h3').should('have.text', title);
                        cy.xpath(".//p[1]").should('have.text', `Description: ${description}`);
                    });
                });
            });
            it('should allow updating todo list with empty description', () => {
                const title = 'Edited Title';
                const description = '';
                cy.intercept('PUT', `/api/todos/update/${editTodoId}`).as('editTodo');
                cy.visit('/todo');
                getTodosObjectsSize().then((size) => {
                    getNewestTodoList(size).within(() => {
                        cy.xpath(".//button[contains(text(), 'Edit')]").should('be.enabled').click();
                        cy.xpath("//div[@class= 'ReactModal__Content ReactModal__Content--after-open']").within(() => {
                            cy.editTodoList(title, description);
                        });
                        cy.wait('@editTodo').then((inter) => {
                            expect(inter.response.body.id).to.eq(editTodoId);
                        });
                    });
                });
                getTodosObjectsSize().then((size) => {
                    getNewestTodoList(size).within(() => {
                        cy.get('h3').should('have.text', title);
                        cy.xpath(".//p[1]").should(($el) => {
                            const text = $el.text().replace(/\u00A0/g, ' ').trim();
                            expect(text).to.eq('Description:');
                        });
                    });
                });
            });
            it('should not allow updating without a title', () => {
                cy.visit('/todo');
                getTodosObjectsSize().then((size) => {
                    getNewestTodoList(size).within(() => {
                        cy.xpath(".//button[contains(text(), 'Edit')]").should('be.enabled').click();
                        cy.xpath("//div[@class= 'ReactModal__Content ReactModal__Content--after-open']").within(() => {
                            cy.get('#update-title').should('have.attr', 'required');
                            cy.get("button[type='button']").click();
                        });

                    });
                });
            });
            this.afterEach(() => {
                if (editTodoId) {
                    cy.deleteTodoList(editTodoId);
                }
            })
        });
        context('Deleting todo list', function () {
            let deleteTodoId;
            this.beforeEach(() => {
                cy.getAllLocalStorage().then((storage) => {
                    const token = storage[window.location.origin]?.token;
                    cy.fixture('add-todo-body').then((body) => {
                        cy.request({
                            method: 'POST',
                            url: `${baseAPIURL}/todos/create/user/${userId}`,
                            headers: {
                                'Authorization': `${token}`
                            },
                            body: body
                        }).then((res) => {
                            expect(res.status).to.eq(200);
                            deleteTodoId = res.body.todoId;
                        })
                    })
                })
            });
            it('should delete user as expected', () => {
                cy.intercept('DELETE', `/api/todos/delete/${deleteTodoId}`).as('deleteTodo');
                cy.intercept('GET', `/api/todos/getTodos/${userId}`).as('getTodos');
                cy.visit('/todo');
                let currentSize;
                getTodosObjectsSize().then((size) => {
                    currentSize = size;
                    getNewestTodoList(size).within(() => {
                        cy.xpath(".//button[contains(text(), 'Delete')]").should('be.enabled').click();
                    });
                });
                cy.wait('@deleteTodo').then((inter) => {
                    expect(inter.response.statusCode).to.eq(200);
                });
                cy.wait('@getTodos', { timeout: 1000 }).then((inter) => {
                    expect(inter.response.statusCode).to.eq(200);
                });
                getTodosObjectsSize().then((size) => {
                    expect(size).to.eq(currentSize - 1);
                });
            })
        });
    });
});

function getNewestTodoList(size) {
    return cy.xpath(`//div[contains(@style, 'padding: 20px')]/div/ul/li[${size}]`);
}

function getTodosObjectsSize() {
    return getTodoListObjects().its('length');
}

function getTodoListObjects() {
    return cy.xpath("//div[contains(@style, 'padding: 20px')]/div/ul/li");
}
