// These must be set before any module is required
process.env.NODE_ENV      = 'test'
process.env.DATABASE_PATH = ':memory:'
process.env.JWT_SECRET    = 'nutridesk_test_jwt_secret_do_not_use_in_production'
process.env.REGISTRO_CODIGO = 'TEST123'
