import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';
import { testData } from '../test-data';

export class InsuranceFormPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Form navigation locators
  get progressBar(): Locator {
    return this.page.locator('[data-testid="progress-bar"]');
  }

  get nextButton(): Locator {
    return this.page.locator('[data-testid="next-button"]');
  }

  get prevButton(): Locator {
    return this.page.locator('[data-testid="prev-button"]');
  }

  get submitButton(): Locator {
    return this.page.locator('[data-testid="submit-button"]');
  }

  // Step 1: Basic Information locators
  get fullNameInput(): Locator {
    return this.page.locator('[data-testid="fullName"]');
  }

  get emailInput(): Locator {
    return this.page.locator('[data-testid="email"]');
  }

  get phoneInput(): Locator {
    return this.page.locator('[data-testid="phone"]');
  }

  get identificationTypeSelect(): Locator {
    return this.page.locator('[data-testid="identificationType"]');
  }

  get identificationNumberInput(): Locator {
    return this.page.locator('[data-testid="identificationNumber"]');
  }

  get birthDateInput(): Locator {
    return this.page.locator('[data-testid="birthDate"]');
  }

  get genderSelect(): Locator {
    return this.page.locator('[data-testid="gender"]');
  }

  get maritalStatusSelect(): Locator {
    return this.page.locator('[data-testid="maritalStatus"]');
  }

  get occupationInput(): Locator {
    return this.page.locator('[data-testid="occupation"]');
  }

  get addressInput(): Locator {
    return this.page.locator('[data-testid="address"]');
  }

  get cityInput(): Locator {
    return this.page.locator('[data-testid="city"]');
  }

  get departmentSelect(): Locator {
    return this.page.locator('[data-testid="department"]');
  }

  // Step 2: Insurance Selection locators
  get autoInsuranceCheckbox(): Locator {
    return this.page.locator('[data-testid="insurance-auto"]');
  }

  get healthInsuranceCheckbox(): Locator {
    return this.page.locator('[data-testid="insurance-salud"]');
  }

  get lifeInsuranceCheckbox(): Locator {
    return this.page.locator('[data-testid="insurance-vida"]');
  }

  get homeInsuranceCheckbox(): Locator {
    return this.page.locator('[data-testid="insurance-hogar"]');
  }

  // Step 3: Conditional Fields - Auto Insurance
  get vehicleBrandInput(): Locator {
    return this.page.locator('[data-testid="vehicleBrand"]');
  }

  get vehicleModelInput(): Locator {
    return this.page.locator('[data-testid="vehicleModel"]');
  }

  get vehicleYearInput(): Locator {
    return this.page.locator('[data-testid="vehicleYear"]');
  }

  get vehiclePlateInput(): Locator {
    return this.page.locator('[data-testid="vehiclePlate"]');
  }

  get vehicleCylindersInput(): Locator {
    return this.page.locator('[data-testid="vehicleCylinders"]');
  }

  get vehicleValueInput(): Locator {
    return this.page.locator('[data-testid="vehicleValue"]');
  }

  // Step 3: Conditional Fields - Health Insurance
  get preexistingConditionsNo(): Locator {
    return this.page.locator('[data-testid="preexistingConditions-no"]');
  }

  get preexistingConditionsYes(): Locator {
    return this.page.locator('[data-testid="preexistingConditions-yes"]');
  }

  get medicationsInput(): Locator {
    return this.page.locator('[data-testid="medications"]');
  }

  get familyHistoryInput(): Locator {
    return this.page.locator('[data-testid="familyHistory"]');
  }

  get lifestyleSelect(): Locator {
    return this.page.locator('[data-testid="lifestyle"]');
  }

  // Step 3: Conditional Fields - Life Insurance
  get beneficiaryNameInput(): Locator {
    return this.page.locator('[data-testid="beneficiaryName"]');
  }

  get beneficiaryRelationshipInput(): Locator {
    return this.page.locator('[data-testid="beneficiaryRelationship"]');
  }

  get beneficiaryPhoneInput(): Locator {
    return this.page.locator('[data-testid="beneficiaryPhone"]');
  }

  get coverageAmountInput(): Locator {
    return this.page.locator('[data-testid="coverageAmount"]');
  }

  // Step 4: Declaration and Documents
  get termsCheckbox(): Locator {
    return this.page.locator('[data-testid="terms-checkbox"]');
  }

  get privacyCheckbox(): Locator {
    return this.page.locator('[data-testid="privacy-checkbox"]');
  }

  get fileUploadInput(): Locator {
    return this.page.locator('[data-testid="file-upload-input"]');
  }

  get fileUploadDropzone(): Locator {
    return this.page.locator('[data-testid="file-upload-dropzone"]');
  }

  get uploadedFilesList(): Locator {
    return this.page.locator('[data-testid="uploaded-files-list"]');
  }

  // Step 5: Summary
  get summarySection(): Locator {
    return this.page.locator('[data-testid="summary-section"]');
  }

  get editButton(): Locator {
    return this.page.locator('[data-testid="edit-button"]');
  }

  // Success page
  get successMessage(): Locator {
    return this.page.locator('[data-testid="success-message"]');
  }

  get applicationNumberDisplay(): Locator {
    return this.page.locator('[data-testid="application-number"]');
  }

  // Methods for navigating the form
  async navigateToInsuranceForm(): Promise<void> {
    await this.navigateTo('/emision');
    await this.acceptCookies();
  }

  async fillStep1BasicInfo(data = testData.insuranceApplication.basicInfo): Promise<void> {
    await this.fullNameInput.fill(data.fullName);
    await this.emailInput.fill(data.email);
    await this.phoneInput.fill(data.phone);
    await this.identificationTypeSelect.selectOption(data.identificationType);
    await this.identificationNumberInput.fill(data.identificationNumber);
    await this.birthDateInput.fill(data.birthDate);
    await this.genderSelect.selectOption(data.gender);
    await this.maritalStatusSelect.selectOption(data.maritalStatus);
    await this.occupationInput.fill(data.occupation);
    await this.addressInput.fill(data.address);
    await this.cityInput.fill(data.city);
    await this.departmentSelect.selectOption(data.department);
  }

  async proceedToStep2(): Promise<void> {
    await this.nextButton.click();
    await this.waitForPageLoad();
    await this.expectStepToBeActive(2);
  }

  async selectInsuranceTypes(types: string[]): Promise<void> {
    for (const type of types) {
      switch (type) {
        case 'auto':
          await this.autoInsuranceCheckbox.check();
          break;
        case 'salud':
          await this.healthInsuranceCheckbox.check();
          break;
        case 'vida':
          await this.lifeInsuranceCheckbox.check();
          break;
        case 'hogar':
          await this.homeInsuranceCheckbox.check();
          break;
      }
    }
  }

  async proceedToStep3(): Promise<void> {
    await this.nextButton.click();
    await this.waitForPageLoad();
    await this.expectStepToBeActive(3);
  }

  async fillAutoInsuranceDetails(data = testData.insuranceApplication.autoInsurance): Promise<void> {
    await this.vehicleBrandInput.fill(data.vehicleBrand);
    await this.vehicleModelInput.fill(data.vehicleModel);
    await this.vehicleYearInput.fill(data.vehicleYear);
    await this.vehiclePlateInput.fill(data.vehiclePlate);
    await this.vehicleCylindersInput.fill(data.vehicleCylinders);
    await this.vehicleValueInput.fill(data.vehicleValue);
  }

  async fillHealthInsuranceDetails(data = testData.insuranceApplication.healthInsurance): Promise<void> {
    if (data.hasPreexistingConditions) {
      await this.preexistingConditionsYes.check();
      await this.medicationsInput.fill(data.medications);
      await this.familyHistoryInput.fill(data.familyHistory);
    } else {
      await this.preexistingConditionsNo.check();
    }
    await this.lifestyleSelect.selectOption(data.lifestyle);
  }

  async fillLifeInsuranceDetails(data = testData.insuranceApplication.lifeInsurance): Promise<void> {
    await this.beneficiaryNameInput.fill(data.beneficiaryName);
    await this.beneficiaryRelationshipInput.fill(data.beneficiaryRelationship);
    await this.beneficiaryPhoneInput.fill(data.beneficiaryPhone);
    await this.coverageAmountInput.fill(data.coverageAmount);
  }

  async proceedToStep4(): Promise<void> {
    await this.nextButton.click();
    await this.waitForPageLoad();
    await this.expectStepToBeActive(4);
  }

  async acceptTermsAndPrivacy(): Promise<void> {
    await this.termsCheckbox.check();
    await this.privacyCheckbox.check();
  }

  async uploadDocuments(filePaths: string[]): Promise<void> {
    for (const filePath of filePaths) {
      await this.fileUploadInput.setInputFiles(filePath);
      await this.page.waitForTimeout(1000); // Wait for upload to process
    }
  }

  async proceedToStep5(): Promise<void> {
    await this.nextButton.click();
    await this.waitForPageLoad();
    await this.expectStepToBeActive(5);
  }

  async reviewAndSubmit(): Promise<void> {
    await this.expectElementToBeVisible('[data-testid="summary-section"]');
    await this.submitButton.click();
    await this.waitForPageLoad();
  }

  async expectSuccessfulSubmission(): Promise<void> {
    await expect(this.successMessage).toBeVisible();
    await expect(this.applicationNumberDisplay).toBeVisible();
  }

  // Validation helpers
  async expectStepToBeActive(stepNumber: number): Promise<void> {
    await expect(this.page.locator(`[data-testid="step-${stepNumber}"]`)).toHaveClass(/active/);
  }

  async expectValidationError(fieldName: string): Promise<void> {
    await expect(this.page.locator(`[data-testid="${fieldName}-error"]`)).toBeVisible();
  }

  async expectNoValidationErrors(): Promise<void> {
    const errorElements = this.page.locator('[data-testid$="-error"]');
    await expect(errorElements).toHaveCount(0);
  }

  // Navigation helpers
  async goBackToStep(stepNumber: number): Promise<void> {
    while (true) {
      const currentStep = await this.getCurrentStep();
      if (currentStep <= stepNumber) break;
      await this.prevButton.click();
      await this.waitForPageLoad();
    }
  }

  async getCurrentStep(): Promise<number> {
    const activeStep = await this.page.locator('[data-testid^="step-"].active').getAttribute('data-testid');
    return parseInt(activeStep?.replace('step-', '') || '1');
  }

  // Form persistence helpers
  async refreshPageAndVerifyData(): Promise<void> {
    await this.page.reload();
    await this.waitForPageLoad();
    // Verify that form data persists after refresh
    await expect(this.fullNameInput).not.toHaveValue('');
  }

  // Helper method to complete form up to step 4
  async completeFormToStep4(): Promise<void> {
    await this.fillStep1BasicInfo();
    await this.proceedToStep2();
    await this.selectInsuranceTypes(['auto']);
    await this.proceedToStep3();
    await this.fillAutoInsuranceDetails();
    await this.proceedToStep4();
    await this.acceptTermsAndPrivacy();
  }

  // Complete form flow
  async completeFullApplication(insuranceTypes: string[] = ['auto']): Promise<void> {
    await this.navigateToInsuranceForm();
    
    // Step 1: Basic Information
    await this.fillStep1BasicInfo();
    await this.proceedToStep2();
    
    // Step 2: Insurance Selection
    await this.selectInsuranceTypes(insuranceTypes);
    await this.proceedToStep3();
    
    // Step 3: Conditional Fields
    if (insuranceTypes.includes('auto')) {
      await this.fillAutoInsuranceDetails();
    }
    if (insuranceTypes.includes('salud')) {
      await this.fillHealthInsuranceDetails();
    }
    if (insuranceTypes.includes('vida')) {
      await this.fillLifeInsuranceDetails();
    }
    await this.proceedToStep4();
    
    // Step 4: Declaration and Documents
    await this.acceptTermsAndPrivacy();
    await this.proceedToStep5();
    
    // Step 5: Review and Submit
    await this.reviewAndSubmit();
    await this.expectSuccessfulSubmission();
  }
}