module.exports = {

    'PORT' : 7778,

    'DB_HOST'     : 'localhost',
    'DB_NAME'     : 'proofTokenSale',
    'DB_PORT'     : '27017',
    'DB_USERNAME' : '',
    'DB_PASSWORD' : '',


    'BASE_DEVELOPMENT_URL'  : 'http://localhost:7778/api',
    'BASE_DESIGN_URL'       : 'http://52.187.124.61:7777',

    'algorithm' : 'HS256',
    'expiresIn' : '2h',

    //JWT Configuration
    'JWT_SECRET'     : 'XaA6JrXR1G0',
    'JWT_ALGORITHEM' : 'HS256',
    'TOKEN_EXPIRY'   : '2h',
    
    //JWT Static token
    STATIC_TOKEN     : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OWQ2MDlmYzk3OTRmYWFkOTM4NzNlZTkiLCJuYW1lIjoic21hcnRzYWdhciIsImVtYWlsIjoic21hCsgHt7d4g9jnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTUwNzYyNjQzNiwiZXhwIjoxNTA3NjMzNjM2fQ.JixyC9JdfRev8qvyqlHIaC6FfxqX-ZDtNCprJDocZwI',

    //Pagination
    SORT_BY          : 'CreatedAt',
    SORT_ORDER       : 'desc',
    PAGE_NUMBER      : 1,
    RECORDS_PER_PAGE : 10
};