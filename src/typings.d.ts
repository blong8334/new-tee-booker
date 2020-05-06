declare module '*.json' {
  const x: any;
  export = x;
}

export type tParams = { Cookie: string[]; viewState: string };
export type tGenericObject = { [key: string]: any };