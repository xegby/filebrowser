// Local extension types for modules to avoid touching core typings.
// Keep module-specific user fields here.

export type IUserExtras = {
  readmePreview?: boolean;
};

export type IUserExtended = IUser & IUserExtras;

