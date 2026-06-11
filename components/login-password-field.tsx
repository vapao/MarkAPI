"use client";

type LoginPasswordFieldProps = {
  label: string;
};

export function LoginPasswordField({ label }: LoginPasswordFieldProps) {
  return (
    <label>
      <span>{label}</span>
      <input
        autoComplete="current-password"
        autoFocus
        name="password"
        onKeyDown={(event) => {
          if (event.key !== "Enter") {
            return;
          }

          event.preventDefault();
          event.currentTarget.form!.requestSubmit();
        }}
        required
        type="password"
      />
    </label>
  );
}
