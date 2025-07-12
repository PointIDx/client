import { test, expect } from '@playwright/test';
import { loginAsSocietaire, mockGraphQLResponse, uploadFile, TestData } from './utils/test-utils.js';

test.describe('Societaire Profile Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSocietaire(page);
  });

  test('should display current profile information', async ({ page }) => {
    // Mock profile data
    await mockGraphQLResponse(page, 'GetSocietaireProfile', {
      data: {
        getSocietaireProfile: {
          id: 'societaire-1',
          email: 'jean.dupont@email.com',
          dossierNumber: 'DOS-2024-001',
          personalInfo: {
            firstName: 'Jean',
            lastName: 'Dupont',
            dateOfBirth: '1985-03-15',
            address: {
              street: '123 Rue de la République',
              city: 'Paris',
              postalCode: '75011',
              country: 'France'
            },
            phone: '06 12 34 56 78',
            emergencyContact: {
              name: 'Marie Dupont',
              phone: '06 98 76 54 32',
              relationship: 'Épouse'
            }
          },
          preferences: {
            language: 'fr',
            timezone: 'Europe/Paris',
            notificationSettings: {
              email: true,
              sms: false,
              push: true,
              categories: ['timeline_update', 'message', 'document']
            },
            communicationPreferences: {
              preferredMethod: 'email',
              availableHours: '09:00-18:00'
            }
          },
          policyInfo: {
            policyNumber: 'POL-2023-789',
            coverageType: 'Habitation',
            startDate: '2023-01-01',
            endDate: '2024-01-01',
            deductible: 150,
            coverageLimit: 100000
          },
          accountStatus: 'active',
          lastLoginDate: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: new Date().toISOString()
        }
      }
    });
    
    // This would be implemented in a profile management page
    // Should display all personal information in an organized layout
    // Should show policy information and account status
  });

  test('should update personal information', async ({ page }) => {
    // Mock profile update
    await page.route('**/graphql', route => {
      const request = route.request();
      const postData = request.postData();
      
      if (postData && postData.includes('UpdateSocietaireProfile')) {
        const body = JSON.parse(postData);
        const { input } = body.variables;
        
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              updateSocietaireProfile: {
                id: 'societaire-1',
                email: input.email || 'jean.dupont@email.com',
                dossierNumber: 'DOS-2024-001',
                personalInfo: {
                  firstName: input.personalInfo?.firstName || 'Jean',
                  lastName: input.personalInfo?.lastName || 'Dupont',
                  dateOfBirth: input.personalInfo?.dateOfBirth || '1985-03-15',
                  address: {
                    street: input.personalInfo?.address?.street || '123 Rue de la République',
                    city: input.personalInfo?.address?.city || 'Paris',
                    postalCode: input.personalInfo?.address?.postalCode || '75011',
                    country: input.personalInfo?.address?.country || 'France'
                  },
                  phone: input.personalInfo?.phone || '06 12 34 56 78',
                  emergencyContact: {
                    name: input.personalInfo?.emergencyContact?.name || 'Marie Dupont',
                    phone: input.personalInfo?.emergencyContact?.phone || '06 98 76 54 32',
                    relationship: input.personalInfo?.emergencyContact?.relationship || 'Épouse'
                  }
                },
                preferences: input.preferences || {
                  language: 'fr',
                  timezone: 'Europe/Paris',
                  notificationSettings: {
                    email: true,
                    sms: false,
                    push: true,
                    categories: ['timeline_update', 'message', 'document']
                  },
                  communicationPreferences: {
                    preferredMethod: 'email',
                    availableHours: '09:00-18:00'
                  }
                },
                accountStatus: 'active',
                updatedAt: new Date().toISOString()
              }
            }
          })
        });
      } else {
        route.continue();
      }
    });
    
    // Should allow updating contact information
    // Should allow updating address information
    // Should allow updating emergency contact
    // Should validate all fields before saving
  });

  test('should update notification preferences', async ({ page }) => {
    // Mock notification preferences update
    await page.route('**/graphql', route => {
      const request = route.request();
      const postData = request.postData();
      
      if (postData && postData.includes('UpdateSocietaireProfile')) {
        const body = JSON.parse(postData);
        const { input } = body.variables;
        
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              updateSocietaireProfile: {
                id: 'societaire-1',
                preferences: {
                  language: input.preferences?.language || 'fr',
                  timezone: input.preferences?.timezone || 'Europe/Paris',
                  notificationSettings: {
                    email: input.preferences?.notificationSettings?.email ?? true,
                    sms: input.preferences?.notificationSettings?.sms ?? false,
                    push: input.preferences?.notificationSettings?.push ?? true,
                    categories: input.preferences?.notificationSettings?.categories || ['timeline_update', 'message', 'document']
                  },
                  communicationPreferences: {
                    preferredMethod: input.preferences?.communicationPreferences?.preferredMethod || 'email',
                    availableHours: input.preferences?.communicationPreferences?.availableHours || '09:00-18:00'
                  }
                },
                updatedAt: new Date().toISOString()
              }
            }
          })
        });
      } else {
        route.continue();
      }
    });
    
    // Should allow enabling/disabling email notifications
    // Should allow enabling/disabling SMS notifications
    // Should allow enabling/disabling push notifications
    // Should allow selecting notification categories
    // Should allow setting preferred communication method
    // Should allow setting available hours for contact
  });

  test('should validate profile information', async ({ page }) => {
    // Mock validation errors
    await page.route('**/graphql', route => {
      const request = route.request();
      const postData = request.postData();
      
      if (postData && postData.includes('UpdateSocietaireProfile')) {
        const body = JSON.parse(postData);
        const { input } = body.variables;
        
        // Validate email format
        if (input.email && !input.email.includes('@')) {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              errors: [{
                message: 'Invalid email format',
                extensions: { code: 'VALIDATION_ERROR', field: 'email' }
              }]
            })
          });
          return;
        }
        
        // Validate phone format
        if (input.personalInfo?.phone && input.personalInfo.phone.length < 10) {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              errors: [{
                message: 'Phone number must be at least 10 digits',
                extensions: { code: 'VALIDATION_ERROR', field: 'phone' }
              }]
            })
          });
          return;
        }
        
        // Validate postal code format for France
        if (input.personalInfo?.address?.postalCode && 
            input.personalInfo.address.country === 'France' &&
            !/^\d{5}$/.test(input.personalInfo.address.postalCode)) {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              errors: [{
                message: 'Invalid French postal code format (5 digits required)',
                extensions: { code: 'VALIDATION_ERROR', field: 'postalCode' }
              }]
            })
          });
          return;
        }
        
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              updateSocietaireProfile: {
                id: 'societaire-1',
                email: input.email || 'jean.dupont@email.com',
                personalInfo: input.personalInfo,
                updatedAt: new Date().toISOString()
              }
            }
          })
        });
      } else {
        route.continue();
      }
    });
    
    // Should validate email addresses
    // Should validate phone numbers
    // Should validate postal codes by country
    // Should show field-specific error messages
    // Should prevent saving invalid data
  });

  test('should display policy information', async ({ page }) => {
    // Mock policy information
    await page.route('**/graphql', route => {
      const request = route.request();
      const postData = request.postData();
      
      if (postData && postData.includes('GetSocietaireProfile')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              getSocietaireProfile: {
                id: 'societaire-1',
                policyInfo: {
                  policyNumber: 'POL-2023-789',
                  coverageType: 'Habitation',
                  startDate: '2023-01-01',
                  endDate: '2024-12-31',
                  deductible: 150,
                  coverageLimit: 100000,
                  premiumAmount: 450,
                  paymentFrequency: 'annual',
                  renewalDate: '2024-12-31',
                  isActive: true,
                  coveredRisks: ['Incendie', 'Dégât des eaux', 'Vol', 'Bris de glace'],
                  exclusions: ['Catastrophes naturelles', 'Actes de guerre']
                },
                accountStatus: 'active'
              }
            }
          })
        });
      } else {
        route.continue();
      }
    });
    
    // Should display policy number and type
    // Should show coverage details and limits
    // Should display premium information
    // Should show covered risks and exclusions
    // Should indicate policy status (active, expired, suspended)
    // Should show renewal date and payment information
  });

  test('should manage communication preferences', async ({ page }) => {
    // Mock communication preferences update
    await page.route('**/graphql', route => {
      const request = route.request();
      const postData = request.postData();
      
      if (postData && postData.includes('UpdateSocietaireProfile')) {
        const body = JSON.parse(postData);
        const { input } = body.variables;
        
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              updateSocietaireProfile: {
                id: 'societaire-1',
                preferences: {
                  communicationPreferences: {
                    preferredMethod: input.preferences?.communicationPreferences?.preferredMethod || 'email',
                    availableHours: input.preferences?.communicationPreferences?.availableHours || '09:00-18:00',
                    preferredLanguage: input.preferences?.communicationPreferences?.preferredLanguage || 'fr',
                    allowMarketing: input.preferences?.communicationPreferences?.allowMarketing ?? false,
                    allowSurveys: input.preferences?.communicationPreferences?.allowSurveys ?? true,
                    contactMethods: input.preferences?.communicationPreferences?.contactMethods || ['email', 'phone']
                  }
                },
                updatedAt: new Date().toISOString()
              }
            }
          })
        });
      } else {
        route.continue();
      }
    });
    
    // Should allow setting preferred communication method (email, phone, SMS)
    // Should allow setting available hours for contact
    // Should allow opting in/out of marketing communications
    // Should allow opting in/out of surveys and feedback requests
    // Should allow selecting multiple contact methods
    // Should respect communication preferences in all interactions
  });

  test('should handle account security settings', async ({ page }) => {
    // Mock security settings
    await page.route('**/graphql', route => {
      const request = route.request();
      const postData = request.postData();
      
      if (postData && postData.includes('GetSecuritySettings')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              getSecuritySettings: {
                twoFactorEnabled: false,
                lastPasswordChange: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
                loginHistory: [
                  {
                    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
                    ipAddress: '192.168.1.100',
                    location: 'Paris, France',
                    device: 'Chrome on Windows',
                    success: true
                  },
                  {
                    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    ipAddress: '10.0.0.50',
                    location: 'Lyon, France',
                    device: 'Safari on iPhone',
                    success: true
                  }
                ],
                securityAlerts: [
                  {
                    id: 'alert-1',
                    type: 'password_age',
                    message: 'Your password is 90 days old. Consider updating it.',
                    severity: 'low',
                    createdAt: new Date().toISOString()
                  }
                ]
              }
            }
          })
        });
      } else if (postData && postData.includes('EnableTwoFactor')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              enableTwoFactor: {
                qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
                backupCodes: ['12345678', '87654321', '11111111', '22222222'],
                enabled: true
              }
            }
          })
        });
      } else {
        route.continue();
      }
    });
    
    // Should show two-factor authentication settings
    // Should display login history with device and location info
    // Should show security alerts and recommendations
    // Should allow enabling/disabling 2FA
    // Should provide backup codes for 2FA
    // Should show last password change date
  });

  test('should export personal data', async ({ page }) => {
    // Mock personal data export
    await mockGraphQLResponse(page, 'ExportPersonalData', {
      data: {
        exportPersonalData: {
          url: '/exports/personal-data-societaire-1.json',
          filename: 'personal-data-export.json',
          contentType: 'application/json',
          size: 51200,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          includes: [
            'profile_information',
            'case_history',
            'communications',
            'preferences',
            'login_history'
          ]
        }
      }
    });
    
    // Should allow exporting all personal data (GDPR compliance)
    // Should include profile info, case history, communications
    // Should export in machine-readable format (JSON)
    // Should provide download link with expiration
    // Should log the export request for audit purposes
  });

  test('should handle account deletion request', async ({ page }) => {
    // Mock account deletion process
    await page.route('**/graphql', route => {
      const request = route.request();
      const postData = request.postData();
      
      if (postData && postData.includes('RequestAccountDeletion')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              requestAccountDeletion: {
                requestId: 'deletion-request-1',
                scheduledDeletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                gracePeriodEnds: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                canCancel: true,
                dataRetentionInfo: {
                  policyRequiredRetention: '7 years',
                  personalDataDeletion: '30 days',
                  anonymizedDataRetention: 'indefinite'
                }
              }
            }
          })
        });
      } else if (postData && postData.includes('CancelAccountDeletion')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              cancelAccountDeletion: {
                cancelled: true,
                accountStatus: 'active'
              }
            }
          })
        });
      } else {
        route.continue();
      }
    });
    
    // Should allow requesting account deletion
    // Should explain data retention policies
    // Should provide grace period for cancellation
    // Should require confirmation before processing
    // Should handle legal retention requirements
    // Should allow cancelling deletion request within grace period
  });

  test('should handle profile update errors', async ({ page }) => {
    // Mock server error during profile update
    await page.route('**/graphql', route => {
      const request = route.request();
      const postData = request.postData();
      
      if (postData && postData.includes('UpdateSocietaireProfile')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            errors: [{
              message: 'Server error while updating profile',
              extensions: { code: 'INTERNAL_ERROR' }
            }]
          })
        });
      } else {
        route.continue();
      }
    });
    
    // Should handle server errors gracefully
    // Should preserve user input during error states
    // Should show clear error messages
    // Should provide retry mechanism
    // Should not lose unsaved changes
  });
});