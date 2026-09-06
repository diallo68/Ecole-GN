CREATE TABLE echeances (
    id                    bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    frais_scolarite_id    bigint NOT NULL REFERENCES frais_scolarite(id) ON DELETE CASCADE,
    eleve_id              bigint NOT NULL REFERENCES eleves(id) ON DELETE CASCADE,
    libelle               varchar(50) NOT NULL,
    montant_du            numeric(10,2) NOT NULL CHECK (montant_du >= 0),
    date_echeance         date NOT NULL,
    statut                varchar(20) NOT NULL DEFAULT 'impaye'
                            CHECK (statut IN ('paye','partiel','impaye')),
    created_at            timestamptz NOT NULL DEFAULT now(),
    updated_at            timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_echeances_eleve ON echeances(eleve_id);
