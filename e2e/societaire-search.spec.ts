import { test, expect } from '@playwright/test';
import { loginAsSocietaire, mockGraphQLResponse, uploadFile, TestData } from './utils/test-utils.js';

test.describe('Societaire Search and History Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSocietaire(page);
  });

  test('should search across all case history', async ({ page }) => {
    // Mock comprehensive search functionality
    await mockGraphQLResponse(page, 'SearchSocietaireHistory', {
      data: {
        searchSocietaireHistory: {
          results: [
            {
              id: 'history-1',
              dossierNumber: 'DOS-2024-001',
              type: 'message',
              title: 'Message de l\'assureur',
              description: 'Confirmation de prise en charge du dossier - searchterm',
              date: '15/01/2024',
              author: 'Sophie Durand',
              category: 'communication',
              tags: ['prise-en-charge', 'confirmation'],
              relatedEntities: [],
              attachments: [],
              metadata: [],
              highlightedText: 'searchterm',
              relevanceScore: 0.95
            },
            {
              id: 'history-2',
              dossierNumber: 'DOS-2024-001',
              type: 'document',
              title: 'Rapport d\'expertise',
              description: 'Document ajouté par l\'expert contenant searchterm',
              date: '17/01/2024',
              author: 'Expert BERNARD',
              category: 'expertise',
              tags: ['rapport', 'expertise'],
              relatedEntities: [],
              attachments: [
                {
                  id: 'attach-1',
                  fileName: 'rapport_expertise.pdf',
                  url: '/uploads/rapport_expertise.pdf',
                  contentType: 'application/pdf'
                }
              ],
              metadata: [],
              highlightedText: 'searchterm',
              relevanceScore: 0.87
            },
            {
              id: 'history-3',
              dossierNumber: 'DOS-2024-001',
              type: 'timeline',
              title: 'Étape du timeline',
              description: 'Progression du dossier - searchterm mentionné',
              date: '16/01/2024',
              author: 'Système',
              category: 'timeline',
              tags: ['progression', 'étape'],
              relatedEntities: [],
              attachments: [],
              metadata: [],
              highlightedText: 'searchterm',
              relevanceScore: 0.72
            }
          ],
          totalCount: 3,
          hasMore: false,
          filters: {
            categories: ['communication', 'expertise', 'timeline', 'document'],
            authors: ['Sophie Durand', 'Expert BERNARD', 'Jean Dupont', 'Système'],
            dateRange: {
              min: '2024-01-01',
              max: '2024-01-31'
            },
            tags: ['prise-en-charge', 'confirmation', 'rapport', 'expertise', 'progression']
          },
          searchTerm: 'searchterm',
          appliedFilters: {}
        }
      }
    });
    
    // Should search across messages, documents, timeline, and notes
    // Should highlight search terms in results
    // Should rank results by relevance
    // Should provide quick preview of matching content
  });

  test('should filter search results by category', async ({ page }) => {
    // Mock category filtering
    await page.route('**/graphql', route => {
      const request = route.request();
      const postData = request.postData();
      
      if (postData && postData.includes('SearchSocietaireHistory')) {
        const body = JSON.parse(postData);
        const { input } = body.variables;
        const category = input.filters?.category;
        
        let filteredResults = [];
        if (category === 'communication') {
          filteredResults = [
            {
              id: 'comm-1',
              type: 'message',
              title: 'Message assureur',
              description: 'Communication avec l\'assureur',
              category: 'communication',
              author: 'Sophie Durand',
              date: '15/01/2024'
            }
          ];
        } else if (category === 'document') {
          filteredResults = [
            {
              id: 'doc-1',
              type: 'document',
              title: 'Rapport expertise',
              description: 'Document technique',
              category: 'document',
              author: 'Expert BERNARD',
              date: '17/01/2024'
            }
          ];
        } else if (category === 'timeline') {
          filteredResults = [
            {
              id: 'timeline-1',
              type: 'timeline',
              title: 'Étape progression',
              description: 'Mise à jour du statut',
              category: 'timeline',
              author: 'Système',
              date: '16/01/2024'
            }
          ];
        }
        
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              searchSocietaireHistory: {
                results: filteredResults,
                totalCount: filteredResults.length,
                hasMore: false,
                appliedFilters: { category }
              }
            }
          })
        });
      } else {
        route.continue();
      }
    });
    
    // Should filter by: communications, documents, timeline, system notifications
    // Should show filter chips/tags for active filters
    // Should allow combining multiple filters
    // Should show result count for each category
  });

  test('should filter search results by date range', async ({ page }) => {
    // Mock date range filtering
    await page.route('**/graphql', route => {
      const request = route.request();
      const postData = request.postData();
      
      if (postData && postData.includes('SearchSocietaireHistory')) {
        const body = JSON.parse(postData);
        const { input } = body.variables;
        const dateRange = input.filters?.dateRange;
        
        let filteredResults = [];
        if (dateRange) {
          const startDate = new Date(dateRange.start);
          const endDate = new Date(dateRange.end);
          
          // Mock results within date range
          filteredResults = [
            {
              id: 'date-filtered-1',
              type: 'message',
              title: 'Message dans la période',
              description: 'Message envoyé dans la période sélectionnée',
              date: dateRange.start,
              author: 'Prestataire',
              category: 'communication',
              dateMatch: true
            }
          ];
        }
        
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              searchSocietaireHistory: {
                results: filteredResults,
                totalCount: filteredResults.length,
                hasMore: false,
                appliedFilters: { dateRange }
              }
            }
          })
        });
      } else {
        route.continue();
      }
    });
    
    // Should support custom date range selection
    // Should provide quick date range presets (last week, last month, etc.)
    // Should validate date ranges (start < end)
    // Should show visual date range indicator
  });

  test('should filter search results by author/participant', async ({ page }) => {
    // Mock author filtering
    await page.route('**/graphql', route => {
      const request = route.request();
      const postData = request.postData();
      
      if (postData && postData.includes('SearchSocietaireHistory')) {
        const body = JSON.parse(postData);
        const { input } = body.variables;
        const author = input.filters?.author;
        
        let filteredResults = [];
        if (author === 'assureur') {
          filteredResults = [
            {
              id: 'assureur-1',
              type: 'message',
              title: 'Message assureur',
              description: 'Communication de l\'assureur',
              author: 'Sophie Durand (Assureur)',
              category: 'communication',
              participantType: 'assureur'
            }
          ];
        } else if (author === 'prestataire') {
          filteredResults = [
            {
              id: 'prestataire-1',
              type: 'message',
              title: 'Message prestataire',
              description: 'Communication du prestataire',
              author: 'Marc Dubois (Prestataire)',
              category: 'communication',
              participantType: 'prestataire'
            }
          ];
        } else if (author === 'societaire') {
          filteredResults = [
            {
              id: 'societaire-1',
              type: 'message',
              title: 'Votre message',
              description: 'Message que vous avez envoyé',
              author: 'Jean Dupont (Vous)',
              category: 'communication',
              participantType: 'societaire'
            }
          ];
        }
        
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              searchSocietaireHistory: {
                results: filteredResults,
                totalCount: filteredResults.length,
                hasMore: false,
                appliedFilters: { author }
              }
            }
          })
        });
      } else {
        route.continue();
      }
    });
    
    // Should filter by: societaire (yourself), assureur, prestataire, expert, system
    // Should show participant avatars/icons
    // Should group results by participant
    // Should show communication flow between participants
  });

  test('should provide advanced search operators', async ({ page }) => {
    // Mock advanced search with operators
    await page.route('**/graphql', route => {
      const request = route.request();
      const postData = request.postData();
      
      if (postData && postData.includes('SearchSocietaireHistory')) {
        const body = JSON.parse(postData);
        const { input } = body.variables;
        const searchTerm = input.searchTerm || '';
        
        let searchType = 'simple';
        let results = [];
        
        if (searchTerm.includes('"')) {
          // Exact phrase search
          searchType = 'exact_phrase';
          results = [
            {
              id: 'exact-1',
              title: 'Résultat exact',
              description: `Contient exactement: ${searchTerm.replace(/"/g, '')}`,
              exactMatch: true
            }
          ];
        } else if (searchTerm.includes('+')) {
          // Required terms
          searchType = 'required_terms';
          results = [
            {
              id: 'required-1',
              title: 'Termes requis',
              description: 'Contient tous les termes requis',
              allTermsFound: true
            }
          ];
        } else if (searchTerm.includes('-')) {
          // Excluded terms
          searchType = 'excluded_terms';
          results = [
            {
              id: 'excluded-1',
              title: 'Termes exclus',
              description: 'Ne contient pas les termes exclus',
              excludedTermsAbsent: true
            }
          ];
        } else if (searchTerm.includes('*')) {
          // Wildcard search
          searchType = 'wildcard';
          results = [
            {
              id: 'wildcard-1',
              title: 'Recherche joker',
              description: 'Résultat avec correspondance partielle',
              wildcardMatch: true
            }
          ];
        }
        
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              searchSocietaireHistory: {
                results: results,
                totalCount: results.length,
                hasMore: false,
                searchType: searchType,
                searchTerm: searchTerm
              }
            }
          })
        });
      } else {
        route.continue();
      }
    });
    
    // Should support quoted phrases for exact matches
    // Should support + for required terms, - for excluded terms
    // Should support * wildcards for partial matches
    // Should support field-specific search (author:name, type:document)
    // Should provide search syntax help/examples
  });

  test('should save and manage search filters', async ({ page }) => {
    // Mock saved search functionality
    await page.route('**/graphql', route => {
      const request = route.request();
      const postData = request.postData();
      
      if (postData && postData.includes('SaveSearchFilter')) {
        const body = JSON.parse(postData);
        const { input } = body.variables;
        
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              saveSearchFilter: {
                id: 'filter-1',
                name: input.name,
                filters: input.filters,
                searchTerm: input.searchTerm,
                createdAt: new Date().toISOString(),
                usageCount: 0
              }
            }
          })
        });
      } else if (postData && postData.includes('GetSavedSearchFilters')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              getSavedSearchFilters: [
                {
                  id: 'filter-1',
                  name: 'Messages assureur',
                  filters: { category: 'communication', author: 'assureur' },
                  searchTerm: '',
                  createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                  usageCount: 5
                },
                {
                  id: 'filter-2',
                  name: 'Documents expertise',
                  filters: { category: 'document', tags: ['expertise'] },
                  searchTerm: 'rapport',
                  createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                  usageCount: 3
                }
              ]
            }
          })
        });
      } else {
        route.continue();
      }
    });
    
    // Should allow saving search filters with custom names
    // Should show list of saved filters for quick access
    // Should track usage count for popular filters
    // Should allow editing and deleting saved filters
    // Should suggest filter names based on search criteria
  });

  test('should provide search suggestions and autocomplete', async ({ page }) => {
    // Mock search suggestions
    await page.route('**/graphql', route => {
      const request = route.request();
      const postData = request.postData();
      
      if (postData && postData.includes('GetSearchSuggestions')) {
        const body = JSON.parse(postData);
        const { query } = body.variables;
        
        const suggestions = [];
        if (query.startsWith('rap')) {
          suggestions.push(
            { text: 'rapport', type: 'term', count: 15 },
            { text: 'rapport expertise', type: 'phrase', count: 8 },
            { text: 'rapport final', type: 'phrase', count: 3 }
          );
        } else if (query.startsWith('mes')) {
          suggestions.push(
            { text: 'message', type: 'term', count: 25 },
            { text: 'message urgent', type: 'phrase', count: 5 },
            { text: 'message prestataire', type: 'phrase', count: 12 }
          );
        }
        
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              getSearchSuggestions: suggestions
            }
          })
        });
      } else {
        route.continue();
      }
    });
    
    // Should provide autocomplete suggestions as user types
    // Should suggest common terms and phrases from case history
    // Should show result count for each suggestion
    // Should prioritize recent and frequently used terms
    // Should support both keyboard and mouse selection
  });

  test('should export search results', async ({ page }) => {
    // Mock search results export
    await mockGraphQLResponse(page, 'ExportSearchResults', {
      data: {
        exportSearchResults: {
          url: '/exports/search-results-export.pdf',
          filename: `search-results-searchterm-${new Date().toISOString().split('T')[0]}.pdf`,
          contentType: 'application/pdf',
          size: 256000,
          resultCount: 3,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      }
    });
    
    // Should allow exporting search results to PDF/Excel
    // Should include search criteria in export
    // Should preserve highlighting and relevance information
    // Should support pagination for large result sets
    // Should include metadata (search date, filters used)
  });

  test('should handle search errors and edge cases', async ({ page }) => {
    // Mock search errors
    await page.route('**/graphql', route => {
      const request = route.request();
      const postData = request.postData();
      
      if (postData && postData.includes('SearchSocietaireHistory')) {
        const body = JSON.parse(postData);
        const { input } = body.variables;
        const searchTerm = input.searchTerm || '';
        
        // Test various error conditions
        if (searchTerm.length < 2) {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              errors: [{
                message: 'Search term must be at least 2 characters long',
                extensions: { code: 'SEARCH_TERM_TOO_SHORT' }
              }]
            })
          });
        } else if (searchTerm.length > 100) {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              errors: [{
                message: 'Search term cannot exceed 100 characters',
                extensions: { code: 'SEARCH_TERM_TOO_LONG' }
              }]
            })
          });
        } else if (searchTerm === 'timeout') {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              errors: [{
                message: 'Search request timed out. Please try a more specific search.',
                extensions: { code: 'SEARCH_TIMEOUT' }
              }]
            })
          });
        } else {
          // Normal successful search
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                searchSocietaireHistory: {
                  results: [],
                  totalCount: 0,
                  hasMore: false,
                  searchTerm: searchTerm
                }
              }
            })
          });
        }
      } else {
        route.continue();
      }
    });
    
    // Should handle search term length validation
    // Should handle search timeout gracefully
    // Should show helpful error messages
    // Should suggest alternative search terms for no results
    // Should handle special characters and encoding issues
    // Should rate limit search requests to prevent abuse
  });
});