import {loginPage} from './../page_objects/loginPage';
const faker = require('faker');

describe('login tests', ()=> {
    let userData = {
        randomEmail:faker.internet.email(),
        randomPassword:faker.internet.password()
    }
    let correctEmail = "jovanatest@mailinator.com";
    let correctPassword= "kisobran.22";
    let emailNoSign = "jovanatestmailinator.com";
    let emailNoDot = "jovanatest@mailinatorcom";
    let emailSpace = "jovana test@mailinator.com";
    let email2Sign= "jovana@test@mailinator.com";

    beforeEach('visit login page', ()=>{
        cy.visit("/login");
        loginPage.getInputField('email').should('be.visible');
        loginPage.title.should('have.text', 'Log in with your existing account');
        
        cy.intercept(
            "POST",
            "https://cypress-api.vivifyscrum-stage.com/api/v2/login",
            ()=>{}
        ).as("loginUser");
    });

    it("just click login button, all fields empty", ()=>{
        loginPage.loginButton.click();
        cy.url().should('contains', '/login');
        loginPage.errorMessage.eq(0).should('be.visible').and('have.text', 'The email field must be a valid email');
        loginPage.errorMessage.eq(1).should('be.visible').and('have.text', 'The password field is required');
    });

    it("login with correct email, no password", ()=>{
        loginPage.loginNoPassword(correctEmail);
        cy.url().should('contains', '/login');
        loginPage.errorMessage.should('be.visible').and('have.text', 'The password field is required');
    });

    it("login with email without @, correct password", ()=>{
        loginPage.login(emailNoSign, correctPassword);
        cy.url().should('contains', '/login');
        loginPage.errorCredentialsMessage.should('be.visible').and('have.text', 'Oops! Your email/password combination is incorrect');
    });

    it("login with email with 2 @, correct password", ()=>{
        loginPage.login(email2Sign, correctPassword);
        cy.url().should('contains', '/login');
        loginPage.errorCredentialsMessage.should('be.visible').and('have.text', 'Oops! Your email/password combination is incorrect');
    });

    it("login with email no dot, correct password", ()=>{
        loginPage.login(emailNoDot, correctPassword);
        cy.url().should('contains', '/login');
        loginPage.errorCredentialsMessage.should('be.visible').and('have.text', 'Oops! Your email/password combination is incorrect');
    });

    it("login with email with space, correct password", ()=>{
        loginPage.login(emailSpace, correctPassword);
        cy.url().should('contains', '/login');
        loginPage.errorCredentialsMessage.should('be.visible').and('have.text', 'Oops! Your email/password combination is incorrect');
    });

    it("login with correct email, but wrong password", ()=>{
        loginPage.login(correctEmail, userData.randomPassword);
        cy.wait('@loginUser').then((interception)=> {
            expect(interception.response.statusCode).eq(401);
        })
        cy.url().should('contains', '/login');
        loginPage.errorCredentialsMessage.should('be.visible').and('have.text', 'Oops! Your email/password combination is incorrect');
    });

    it("login with not registered email", ()=>{
        loginPage.login(userData.randomEmail, userData.randomPassword);
        cy.wait('@loginUser').then((interception)=> {
            expect(interception.response.statusCode).eq(401);
        })
        cy.url().should('contains', '/login');
        loginPage.errorCredentialsMessage.should('be.visible').and('have.text', 'Oops! Your email/password combination is incorrect');
    });

    it("login with correct credentials", ()=>{
        loginPage.login(correctEmail, correctPassword);
        cy.wait('@loginUser').then((interception)=> {
            expect(interception.response.statusCode).eq(200);
        })
        cy.url().should('contain', '/my-organizations');
    });

   
});