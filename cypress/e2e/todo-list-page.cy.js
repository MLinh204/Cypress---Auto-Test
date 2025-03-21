describe('On the todo list Page', function () {
    context('Authenticated user', function () {
        let userId;
        this.beforeEach(function () {
            cy.intercept('POST', '/api/auth/login').as('loginUser');
            cy.session('loginSession', () => {
                cy.visit('/login');
                cy.login('LinhAuto@gmail.com', 'Alo123');
                cy.wait('@loginUser').then((res) => {
                    expect(res.response.body.user.username).to.eq('LinhAuto');
                    Cypress.env('userId', res.response.body.user.id);
                    sessionStorage.setItem('userId', res.response.body.user.id);
                });
            });
            cy.then(() => {
                userId = Cypress.env('userId') || sessionStorage.getItem('userId');
                expect(userId).to.exist; 
            });
        });
        context('No todo list objects', function () {
            beforeEach(() => {
                expect(userId).to.exist;
                cy.intercept('GET', `/api/todos/getTodos/${userId}`, { body: [] }).as('getTodos');
                cy.visit('/todo');
                cy.wait('@getTodos').then((todos) => {
                    expect(todos.response.body).to.have.length(0);
                })
            });
            it('should display a message saying there are no tasks', function () {
                checkCommonElementOfTodoListPage();
                cy.xpath("//div[contains(@style, 'padding: 20px')]/div/ul/li").should('not.exist');
            });
        });
        context('With todo list objects', function () {
            beforeEach(() => {
                expect(userId).to.exist;
                cy.fixture('get-todos-body.json').then((todosBody) => {
                    cy.intercept('GET', `api/todos/getTodos/${userId}`, { body: todosBody }).as('getTodos');
                });
                cy.visit('/todo');
                cy.wait('@getTodos').then((todos) => {
                    expect(todos.response.body).to.have.length.greaterThan(0);
                });
            });
            it('should display the list of tasks', function () {
                checkCommonElementOfTodoListPage();
                cy.xpath("//div[contains(@style, 'padding: 20px')]/div/ul/li")
                    .should('have.length', 5);
            });
            it('check elements of a todo list object', function () {
                getTodoListObjects().each(($todo) => {
                    checkElementsOfATodoListObject($todo);
                })
            })
        });

    });
});

function checkCommonElementOfTodoListPage() {
    cy.get('h2').should('have.text', 'Todo Lists');
    cy.xpath("//div[contains(@style, 'padding: 20px')]/div/button").should('exist')
        .and('have.text', 'Add Todo');
    cy.xpath("//nav").should('exist');
}
function checkElementsOfATodoListObject($todo) {
    cy.wrap($todo).find('h3').should('be.visible');
    cy.wrap($todo).xpath(".//p/strong[contains(text(), 'Description')]").should('be.visible');
    cy.wrap($todo).xpath(".//p/strong[contains(text(), 'Created')]").should('be.visible');
    checkButton();
}
function getTodoListObjectByIndex(index) {
    return cy.xpath(`//div[contains(@style, 'padding: 20px')]/div/ul/li[${index}]`);
}
function getTodoListObjects() {
    return cy.xpath("//div[contains(@style, 'padding: 20px')]/div/ul/li");
}
function getButtonByIndex(liIndex, buttonIndex) {
    return cy.wrap(getTodoListObjectByIndex(liIndex)).find(`button:nth-child(${buttonIndex})`);
}
function getTodosObjectsSize() {
    return getTodoListObjects().its('length');
}
function checkButton() {
    const buttons = ['View Tasks', 'Delete', 'Edit'];
    for (let i = 1; i <= getTodosObjectsSize(); i++) {
        for (let j = 1; j <= 3; j++) {
            getButtonByIndex(i, j).should('have.text', buttons[j - 1]);
            getButtonByIndex(i, j).should('be.visible');
        }
    }
}