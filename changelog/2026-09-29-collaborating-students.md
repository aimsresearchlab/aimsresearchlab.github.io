# Collaborating students section and larger alumni photos

Asked for by the lab director.

- New people category, `collaborator`: undergraduates who work with the lab
  but whose primary advisor is another professor. They get their own section,
  "Collaborating Students from Other Labs", after the undergraduates on
  `/people` (and "Collaborating Students" on the homepage roster and the
  deck), so no one reads them as this lab's students. The section is hidden
  while it has no members.
- Alumni photos on `/people` went from 56px to 96px squares (still under the
  192px source, so nothing is stretched).

Still to do:

- Move each undergraduate whose primary advisor is in another lab to
  `category: 'collaborator'` in `src/data/people.ts`.
