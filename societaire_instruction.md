societaire instruction
the login is done using the societaire login (SocietaireLogin.vue)
please create a login function for this that take an email and a dossier number inside /mutation.

create a societaire store inside /stores and add the login function that actually call graphql.

then add a handler for this same function for msw insde mocks/handlers, for the data please analayse societaire dashboard to create a data that match the dummy data.

please create interfaces under /interfaces if needed so that the values of this can be reused accross the app.

values inside societaires dashboard should come from the societaire store and interfaces please remove all the demmy data.

please also create store function to send an file and a comment

write playwright tests for all the process 