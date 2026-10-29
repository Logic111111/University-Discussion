import { FormEvent, useState } from 'react';
import { MailCheck } from 'lucide-react';
import { Profile } from '../../types';
import { ProfileInput } from '../../campus';
import { Modal } from '../ui';
import { DEPARTMENTS } from './IdeaFormModal';

export function SignInModal({ open, onClose, onSignIn }: {
  open: boolean;
  onClose: () => void;
  /** Resolves to an error message, or null when the link was sent. */
  onSignIn: (email: string) => Promise<string | null>;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Sign in to Campus">
      <SignInForm key={String(open)} onClose={onClose} onSignIn={onSignIn} />
    </Modal>
  );
}

function SignInForm({ onClose, onSignIn }: { onClose: () => void; onSignIn: (email: string) => Promise<string | null> }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setState('sending');
    const err = await onSignIn(email.trim());
    setError(err);
    setState(err ? 'idle' : 'sent');
  };

  if (state === 'sent') {
    return (
      <div className="space-y-4 p-5">
        <div className="flex gap-3">
          <MailCheck className="mt-0.5 h-6 w-6 shrink-0 text-ok" aria-hidden />
          <div>
            <p className="font-serif text-[18px]">Check your inbox</p>
            <p className="mt-1 text-[15px] text-ink-2">
              We sent a sign-in link to <strong className="font-semibold text-ink">{email}</strong>. Open it in this browser; the link works once.
            </p>
          </div>
        </div>
        <div className="flex justify-end">
          <button className="btn btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 p-5">
      <div>
        <label className="field-label" htmlFor="signin-email">University email</label>
        <input
          id="signin-email"
          type="email"
          required
          autoFocus
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@university.edu"
          className="field"
        />
        <p className="mt-2 text-[14px] text-ink-3">
          We email you a one-time sign-in link, so there is no password. Your posts show your verified email domain, such as umich.edu, never the full address.
        </p>
      </div>
      {error && <p role="alert" className="rounded-[3px] bg-danger-wash px-3 py-2 text-[14.5px] text-danger">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={state === 'sending'}>
          {state === 'sending' ? 'Sending...' : 'Email me a sign-in link'}
        </button>
      </div>
    </form>
  );
}

export function ProfileModal({ open, onClose, profile, email, error, onSave }: {
  open: boolean;
  onClose: () => void;
  profile: Profile | null | undefined;
  email: string;
  error: string | null;
  onSave: (input: ProfileInput) => Promise<boolean>;
}) {
  return (
    <Modal open={open} onClose={onClose} title={profile ? 'Edit profile' : 'Finish your profile'}>
      <ProfileForm key={`${open}-${profile?.id ?? ''}`} profile={profile} email={email} error={error} onSave={onSave} onClose={onClose} />
    </Modal>
  );
}

function ProfileForm({ profile, email, error, onSave, onClose }: {
  profile: Profile | null | undefined;
  email: string;
  error: string | null;
  onSave: (input: ProfileInput) => Promise<boolean>;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ name: profile?.name ?? '', university: profile?.university ?? '', department: profile?.department ?? '' });
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const domain = email.split('@')[1] ?? '';

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const ok = await onSave({ name: form.name.trim(), university: form.university.trim(), department: form.department.trim() });
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <form onSubmit={submit} className="space-y-4 p-5">
      {!profile && (
        <p className="text-[15px] text-ink-2">
          This is shown on every idea and comment you post, together with your verified email domain{domain && <> (<strong className="font-semibold text-ink">{domain}</strong>)</>}.
        </p>
      )}
      <div>
        <label className="field-label" htmlFor="profile-name">Full name</label>
        <input id="profile-name" required autoFocus maxLength={80} autoComplete="name" value={form.name} onChange={set('name')} className="field" />
      </div>
      <div>
        <label className="field-label" htmlFor="profile-university">University</label>
        <input id="profile-university" required maxLength={120} autoComplete="organization" value={form.university} onChange={set('university')} className="field" placeholder="University of Michigan" />
      </div>
      <div>
        <label className="field-label" htmlFor="profile-department">Department or lab (optional)</label>
        <input id="profile-department" list="profile-departments" maxLength={120} value={form.department} onChange={set('department')} className="field" />
        <datalist id="profile-departments">
          {DEPARTMENTS.map((d) => <option key={d} value={d} />)}
        </datalist>
      </div>
      {error && <p role="alert" className="rounded-[3px] bg-danger-wash px-3 py-2 text-[14.5px] text-danger">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" className="btn btn-outline" onClick={onClose}>{profile ? 'Cancel' : 'Later'}</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save profile'}</button>
      </div>
    </form>
  );
}
