


assureur signup or login => searchPrestataires(graphql) get triggered and return the `{
  "data": {
    "searchPrestataires": [
      {
        "id": "072fbf63-3eb4-4111-b4a3-b1a7ba090df8",
        "companyName": "PRINCE ONDONDA",
        "contactPerson": "Sophie152 Dupont152",
        "email": "prestataire-assign-1752818282152-609@test.com",
        "phone": "0678081789",
        "address": {
          "street": "APPARTEMENT RDC 03, 50 AVENUE DE SAVIGNY",
          "city": "AULNAY-SOUS-BOIS",
          "postalCode": "93600",
          "country": "France",
          "__typename": "Address"
        },
        "specialties": [
          "Plomberie",
          "Chauffage"
        ],
        "rating": null,
        "distance": null,
        "availabilityStatus": "Available",
        "__typename": "PrestataireSearchResult"
      },`

a set of prestataires, in the UI, its displayed as card.
the assureur can see the prestataire fiche with (Voir fiche button)
assureur can also contact a prestataire with the contacter button.
and add a mission for a prestataire with the button "Mission" on the prestataire card.


Voir fiche button open a dialog and display all the prestataire informations.

Contacter button open a dialog where the assureur can send un message


Mission button open a dialog where the assureur can crate a mission for the said prestataire.


If assureur sent a contacter message, prestataire should be able to see it in the Nouvelle demande tab of the prestataire dashboard.

If assureur added a mission to a prestataire, he should be able to see it in missions en cours tab of the prestataire dashboard.

if assureur added a mission to a prestataire, he should be able to see all his mission added to a prestataire in the Mes missions tabs of the assureur dashboard.