// UR2PhD participants at USM, shown on /ur2phd.
//
// Source: "Summer 2026 UR2PhD.xlsx" (first and last name only, no roles or
// teams). Kept sorted by last name. Add a new `cohorts` entry for each term.

export interface Ur2phdStudent {
  first: string;
  last: string;
}

export interface Ur2phdCohort {
  term: string;
  students: Ur2phdStudent[];
}

export const cohorts: Ur2phdCohort[] = [
  {
    term: 'Summer 2026',
    students: [
      { first: 'Malik Hassan', last: 'Ahmad' },
      { first: 'Abdullah', last: 'Ahmed' },
      { first: 'Ammar', last: 'Ahmed' },
      { first: 'Hammad', last: 'Ahmed' },
      { first: 'Suramya', last: 'Angdembay' },
      { first: 'Dikshant', last: 'Aryal' },
      { first: 'Samir', last: 'Bhattarai' },
      { first: 'Bishesta', last: 'Bohara' },
      { first: 'Sujjal', last: 'Chapagain' },
      { first: 'Hossam (Hosameldin)', last: 'Darwish' },
      { first: 'Rashika', last: 'Karmacharya' },
      { first: 'Manish', last: 'Katel' },
      { first: 'Barsat', last: 'Khadka' },
      { first: 'Viktoriia', last: 'Lavrentiv' },
      { first: 'Nhoojah', last: 'Maharjan' },
      { first: 'Munteeq', last: 'Manzoor' },
      { first: 'Aayush', last: 'Marasini' },
      { first: 'Kavya', last: 'Pokharel' },
      { first: 'Atabay', last: 'Rajabli' },
      { first: 'Meerab', last: 'Rashid' },
      { first: 'Muhammad', last: 'Sabih Ul Hussnain' },
      { first: 'Sakshyam', last: 'Sigdel' },
      { first: 'Abdelrahman', last: 'Teima' },
    ],
  },
];
