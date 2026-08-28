import { runMedicalExtractionAcceptanceTests } from "./ocrVerificationTest.js";

const results = runMedicalExtractionAcceptanceTests();
console.log("=== OCR & MEDICAL EXTRACTION ACCEPTANCE TEST RESULTS ===");
console.log(JSON.stringify(results, null, 2));

const allPassed = results.every(r => r.passed);
console.log(`\nOVERALL TEST SUITE STATUS: ${allPassed ? "ALL TESTS PASSED (100%)" : "FAILED"}`);
