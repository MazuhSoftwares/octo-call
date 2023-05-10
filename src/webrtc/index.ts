export interface User extends UniqueEntity {
  displayName: string;
  email: string;
}

interface UniqueEntity {
  uid: string;
}
