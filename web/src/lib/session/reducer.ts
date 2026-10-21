export type SessionState = {
  started: boolean;
};

export const initialSession: SessionState = { started: false };

export type SessionAction = { type: "start" } | { type: "reset" };

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case "start":
      return { started: true };
    case "reset":
      return initialSession;
  }
}
