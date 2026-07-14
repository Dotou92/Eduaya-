-- ============================================================
-- MIGRATION : séparation Apprenant / Enseignant
-- À exécuter dans Supabase → SQL Editor (une seule fois)
-- ============================================================

-- 1) Colonne role sur profils --------------------------------------------
alter table profils
  add column if not exists role text check (role in ('learner', 'teacher'));

-- 2) Backfill des comptes existants (pour ne casser personne) -----------
-- Toute personne ayant déjà créé une classe devient enseignant.
update profils
set role = 'teacher'
where role is null
  and email in (select distinct enseignant_email from classes_enseignant);

-- Tous les autres comptes existants deviennent apprenants par défaut
-- (comportement historique de la plateforme avant cette migration).
update profils
set role = 'learner'
where role is null;

-- À partir de maintenant, seuls les NOUVEAUX comptes (role encore NULL)
-- verront l'écran de choix de rôle obligatoire.

-- 3) Row Level Security : classes_enseignant -----------------------------
alter table classes_enseignant enable row level security;

drop policy if exists "classes_select_all" on classes_enseignant;
create policy "classes_select_all"
  on classes_enseignant for select
  using (true);
  -- Lecture ouverte : nécessaire pour qu'un apprenant puisse vérifier
  -- un code de classe avant de le rejoindre.

drop policy if exists "classes_insert_teacher" on classes_enseignant;
create policy "classes_insert_teacher"
  on classes_enseignant for insert
  with check (
    enseignant_email = auth.jwt() ->> 'email'
    and exists (
      select 1 from profils
      where profils.email = auth.jwt() ->> 'email'
        and profils.role = 'teacher'
    )
  );

drop policy if exists "classes_update_owner" on classes_enseignant;
create policy "classes_update_owner"
  on classes_enseignant for update
  using (enseignant_email = auth.jwt() ->> 'email')
  with check (enseignant_email = auth.jwt() ->> 'email');

drop policy if exists "classes_delete_owner" on classes_enseignant;
create policy "classes_delete_owner"
  on classes_enseignant for delete
  using (enseignant_email = auth.jwt() ->> 'email');

-- 4) Row Level Security : eleves_classe -----------------------------------
alter table eleves_classe enable row level security;

drop policy if exists "eleves_classe_select" on eleves_classe;
create policy "eleves_classe_select"
  on eleves_classe for select
  using (
    eleve_email = auth.jwt() ->> 'email'
    or exists (
      select 1 from classes_enseignant
      where classes_enseignant.code = eleves_classe.code_classe
        and classes_enseignant.enseignant_email = auth.jwt() ->> 'email'
    )
  );

drop policy if exists "eleves_classe_insert_learner" on eleves_classe;
create policy "eleves_classe_insert_learner"
  on eleves_classe for insert
  with check (
    eleve_email = auth.jwt() ->> 'email'
    and exists (
      select 1 from profils
      where profils.email = auth.jwt() ->> 'email'
        and profils.role = 'learner'
    )
  );

-- Remarque : aucune policy update/delete pour eleves_classe volontairement
-- (l'app ne modifie/supprime jamais ces lignes aujourd'hui). Ajoute-en une
-- plus tard si tu ajoutes une fonctionnalité "quitter une classe".

-- ============================================================
-- FIN DE LA MIGRATION
-- ============================================================
-- ⚠️ À FAIRE APRÈS EXÉCUTION :
-- 1. Teste immédiatement dans l'app : un compte enseignant existant doit
--    encore pouvoir créer/modifier/supprimer SES classes, et un compte
--    apprenant existant doit encore pouvoir rejoindre une classe avec un code.
-- 2. Si RLS était DÉJÀ activée sur ces deux tables avec d'autres policies,
--    passe d'abord en revue les policies existantes (Database → Policies)
--    avant d'exécuter ce script, pour éviter les doublons ou conflits.
