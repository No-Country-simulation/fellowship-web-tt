export type LoginState =
  | { status: "idle" }
  | { status: "error"; message: string };

export const initialLoginState: LoginState = { status: "idle" };
