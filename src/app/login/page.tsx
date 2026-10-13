"use client";

import { useActionState } from "react";
import { login, type FormState } from "../actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState<FormState, FormData>(login, {});

  return (
    <section className="narrow login">
      <h1>Log in</h1>
      <p className="muted">Only the library owner can add or edit books.</p>
      <form action={action} className="book-form">
        <label className="field span-2">
          <span>Password</span>
          <input name="password" type="password" required autoFocus autoComplete="current-password" />
        </label>
        {state.error && (
          <p className="form-error span-2" role="alert">
            {state.error}
          </p>
        )}
        <div className="form-actions span-2">
          <button type="submit" className="button primary" disabled={pending}>
            {pending ? "Checking…" : "Log in"}
          </button>
        </div>
      </form>
    </section>
  );
}
