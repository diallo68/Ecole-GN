CREATE TABLE paiements (
    id               bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    echeance_id      bigint NOT NULL REFERENCES echeances(id) ON DELETE RESTRICT,
    montant          numeric(10,2) NOT NULL CHECK (montant > 0),
    -- 'mobile_money' est autorisé en base dès maintenant pour éviter une
    -- migration de contrainte en Phase 4 ; l'API ne l'expose pas encore
    -- (cf. docs/openapi.yaml, PaiementEcriture).
    mode             varchar(20) NOT NULL
                        CHECK (mode IN ('especes','cheque','mobile_money')),
    reference_recu   varchar(50) NOT NULL UNIQUE,
    encaisse_par     bigint NOT NULL REFERENCES utilisateurs(id) ON DELETE RESTRICT,
    date_paiement    date NOT NULL DEFAULT current_date,
    pdf_recu_url     text,
    created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_paiements_echeance ON paiements(echeance_id);
