-- Role: backend
-- DROP ROLE IF EXISTS backend;

CREATE ROLE backend WITH
  LOGIN
  SUPERUSER
  INHERIT
  CREATEDB
  NOCREATEROLE
  NOREPLICATION
  ENCRYPTED PASSWORD 'SCRAM-SHA-256$4096:oHY8cncZNKmolJd2Ur0oQQ==$y7CnTj9mz+XzfLlP8kap3yK/ib0ZYiZVSc1oIepXgnc=:VSQYr45N/Ig3xxjiOoy0n6Mj11BEYNXsPDWa4zA2Bd0=';

COMMENT ON ROLE backend IS 'Usuario para acesso ao DB do backend do Projeto App Mutantes';

-- Database: backend_app

-- DROP DATABASE IF EXISTS backend_app;

CREATE DATABASE backend_app
    WITH
    OWNER = backend
    ENCODING = 'UTF8'
    LC_COLLATE = 'pt_BR.UTF-8'
    LC_CTYPE = 'pt_BR.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

COMMENT ON DATABASE backend_app
    IS 'DB para o backend do Projeto App Mutantes';

GRANT TEMPORARY, CONNECT ON DATABASE backend_app TO PUBLIC;

GRANT ALL ON DATABASE backend_app TO backend;
