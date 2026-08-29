-- Incohérence trouvée en câblant le module Présences : la colonne
-- s'appelait saisi_par (masculin) alors que « présence » est féminin,
-- comme notes.saisie_par (déjà correct). Migration séparée plutôt que
-- correction rétroactive de 016_presences.sql, déjà appliquée en
-- production potentielle.
ALTER TABLE presences RENAME COLUMN saisi_par TO saisie_par;
