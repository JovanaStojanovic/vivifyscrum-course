import {loginPage} from './../page_objects/loginPage';
import {createOrganization} from './../page_objects/createOrganization';
const faker = require('faker');

describe('create organization tests', ()=> {
    beforeEach('log into the app', () => {
        
        cy.visit("/login");
        loginPage.login("jovanatest@mailinator.com", "kisobran.22");
        

        cy.intercept(
            "POST",
            "https://cypress-api.vivifyscrum-stage.com/api/v2/organizations",
            ()=>{}
        ).as("createOrganization");
    });
    
    let randomOrganizationTitle=faker.name.title();
    

    it("user able to see create organization option, next button disabled when title empty",()=>{
        cy.url().should('contain', '/my-organizations');
        createOrganization.pageTitle.should('have.text', 'My Organizations');
        createOrganization.addOrganizationButton.click();
        createOrganization.dialogTitle.should('have.text', ' New Organization');
        createOrganization.getButton('Next').should('be.disabled');
    });

    it("create organization without logo", ()=>{
        createOrganization.createOrganizationNoLogo(randomOrganizationTitle);
        cy.wait('@createOrganization').then((interception)=> {
            expect(interception.response.statusCode).eq(200);
        })
        createOrganization.organizationList.should('have.text', randomOrganizationTitle.charAt(0) + " " + randomOrganizationTitle + " ");
        cy.url().should('contain','/boards');
    });

    it("create organization with invalid .eps format", ()=>{
        createOrganization.createOrganizationWithLogo(randomOrganizationTitle, cy.readFile("cypress/fixtures/Sunflowers.eps"));
        cy.wait('@createOrganization').then((interception)=> {
            expect(interception.response.statusCode).eq(422);
        })
        cy.url().should('contain', '/my-organizations');
        createOrganization.errorMessage.should('have.text', "The file must be a file of type: png, jpg, gif, jpeg.");
    });

    it("create organization with valid .jpg format", ()=>{
        createOrganization.createOrganizationWithLogo(randomOrganizationTitle, cy.readFile("cypress/fixtures/Sunflowers.jpg"));
        cy.wait('@createOrganization').then((interception)=> {
            expect(interception.response.statusCode).eq(200);
        })
        createOrganization.organizationList.should('have.text', randomOrganizationTitle.charAt(0) + " " + randomOrganizationTitle + " ");
        cy.url().should('contain','/boards');
        createOrganization.boardsTitle.should('have.text', 'Add new Board');
    });

   
});