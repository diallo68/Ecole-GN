-- Journal d'envoi. Scopé par utilisateur, pas par établissement (un
-- parent peut recevoir des notifications de plusieurs écoles).
CREATE TABLE notifications (
    id                 bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    utilisateur_id     bigint REFERENCES utilisateurs(id) ON DELETE CASCADE,
    canal              varchar(10) NOT NULL CHECK (canal IN ('push','sms')),
    type               varchar(20) NOT NULL CHECK (type IN ('absence','annonce','paiement')),
    contenu            text NOT NULL,
    statut_envoi       varchar(20) NOT NULL DEFAULT 'en_attente'
                          CHECK (statut_envoi IN ('envoye','echoue','en_attente')),
    type_objet         varchar(30),
    reference_objet    bigint,
    envoye_le          timestamptz,
    created_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_utilisateur ON notifications(utilisateur_id);
