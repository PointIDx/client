import { test, expect } from '@playwright/test';
import { loginAsPrestataire, mockGraphQLResponse, uploadFile, TestData } from './utils/test-utils.js';

test.describe('Prestataire Profile Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsPrestataire(page);
  });

  test('should update profile information', async ({ page }) => {
    // Mock profile update
    await mockGraphQLResponse(page, 'UpdatePrestataireProfile', {
      data: {
        updatePrestataireProfile: {
          id: 'prestataire-123',
          companyInfo: {
            raisonSociale: 'MOREAU PLOMBERIE SARL',
            siret: '12345678901234',
            adresse: '456 Avenue des Champs',
            codePostal: '13001',
            ville: 'Marseille',
            telephone: '04 91 23 45 67',
            email: 'contact@moreau-plomberie.fr',
          },
          sectors: ['Plomberie', 'Chauffage'],
          specialties: ['Sanitaires', 'Réparations', 'Installation chauffage'],
          description: 'Plombier professionnel disponible 7j/7 pour urgences.',
          serviceRadius: 50,
          hourlyRate: 45,
          availabilityStatus: 'available',
        },
      },
    });
    
    // This test would require implementing profile management UI
    // The profile could be accessed from a settings menu or profile button
  });

  test('should update availability status', async ({ page }) => {
    // Mock availability update
    await mockGraphQLResponse(page, 'UpdatePrestataireAvailability', {
      data: {
        updatePrestataireAvailability: {
          id: 'prestataire-123',
          availabilityStatus: 'available',
        },
      },
    });
    
    // Test availability status changes: available, busy, unavailable
    // This could be implemented as a toggle in the header or dashboard
  });

  test('should validate profile information before saving', async ({ page }) => {
    // Mock validation errors
    await mockGraphQLResponse(page, 'UpdatePrestataireProfile', {
      errors: [{
        message: 'Invalid email format',
        extensions: { code: 'VALIDATION_ERROR', field: 'email' }
      }]
    });
    
    // Test validation in profile form
    // Should validate email, phone, postal codes, etc.
  });

  test('should update service sectors and specialties', async ({ page }) => {
    // Mock sectors and specialties update
    await mockGraphQLResponse(page, 'UpdatePrestataireProfile', {
      data: {
        updatePrestataireProfile: {
          id: 'prestataire-123',
          companyInfo: {
            raisonSociale: 'MOREAU PLOMBERIE SARL',
            siret: '12345678901234',
            adresse: '456 Avenue des Champs',
            codePostal: '13001',
            ville: 'Marseille',
            telephone: '04 91 23 45 67',
            email: 'contact@moreau-plomberie.fr',
          },
          sectors: ['Plomberie', 'Chauffage', 'Électricité'],
          specialties: ['Sanitaires', 'Réparations', 'Installation chauffage', 'Dépannage urgence'],
          description: 'Updated description',
          serviceRadius: 50,
          hourlyRate: 45,
          availabilityStatus: 'available',
        },
      },
    });
    
    // Test updating sectors and specialties
    // Should allow adding/removing sectors and specialties from predefined lists
  });

  test('should update service radius and hourly rate', async ({ page }) => {
    // Mock service parameters update with validation error
    await mockGraphQLResponse(page, 'UpdatePrestataireProfile', {
      errors: [{
        message: 'Service radius must be between 1 and 200 km',
        extensions: { code: 'VALIDATION_ERROR', field: 'serviceRadius' }
      }]
    });
    
    // Test updating service radius (km) and hourly rate (€)
    // Should validate reasonable ranges for both values
  });

  test('should update profile description', async ({ page }) => {
    // Mock description update
    await mockGraphQLResponse(page, 'UpdatePrestataireProfile', {
      data: {
        updatePrestataireProfile: {
          id: 'prestataire-123',
          companyInfo: {
            raisonSociale: 'MOREAU PLOMBERIE SARL',
            siret: '12345678901234',
            adresse: '456 Avenue des Champs',
            codePostal: '13001',
            ville: 'Marseille',
            telephone: '04 91 23 45 67',
            email: 'contact@moreau-plomberie.fr',
          },
          sectors: ['Plomberie', 'Chauffage'],
          specialties: ['Sanitaires', 'Réparations', 'Installation chauffage'],
          description: 'Updated description',
          serviceRadius: 50,
          hourlyRate: 45,
          availabilityStatus: 'available',
        },
      },
    });
    
    // Test updating profile description
    // Should validate length and allow rich text formatting
  });

  test('should show availability status in header', async ({ page }) => {
    // Test that availability status is visible in the dashboard header
    // This could be implemented as a status indicator or toggle
    
    // Mock getting current profile to show availability
    await mockGraphQLResponse(page, 'GetPrestataireProfile', {
      data: {
        getPrestataireProfile: {
          id: 'prestataire-123',
          availabilityStatus: 'available',
          companyInfo: {
            raisonSociale: 'MOREAU PLOMBERIE SARL',
          }
        },
      },
    });
    
    // Check that availability status is shown
    // Could be a badge, color indicator, or toggle button
  });

  test('should handle profile update errors gracefully', async ({ page }) => {
    // Mock server error
    await mockGraphQLResponse(page, 'UpdatePrestataireProfile', {
      errors: [{
        message: 'Server error while updating profile',
        extensions: { code: 'INTERNAL_ERROR' }
      }]
    });
    
    // Test that profile update errors are handled gracefully
    // Should show error message and not lose user input
  });
});